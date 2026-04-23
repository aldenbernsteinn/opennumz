"""Git read-only endpoints for the Changes / ATP-STATE feature.

Proxies git commands to the terminal server to provide:
  - has-git check
  - git status
  - git diff
  - git log
"""

import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from open_webui.utils.auth import get_verified_user
from open_webui.utils.access_control import has_connection_access
from open_webui.utils.tools import execute_tool_server, get_terminal_servers
from open_webui.models.groups import Groups

log = logging.getLogger(__name__)

router = APIRouter()


def _resolve_terminal_connection(request: Request, server_id: str, user):
    """Resolve terminal server connection and check access."""
    connections = request.app.state.config.TERMINAL_SERVER_CONNECTIONS or []
    connection = next((c for c in connections if c.get('id') == server_id), None)
    if connection is None:
        return None, 'Terminal server not found'

    user_group_ids = {group.id for group in Groups.get_groups_by_member_id(user.id)}
    if not has_connection_access(user, connection, user_group_ids):
        return None, 'Access denied'

    return connection, None


async def _run_command_on_terminal(
    request: Request,
    connection: dict,
    server_id: str,
    command: str,
    cwd: str | None = None,
) -> dict:
    """Execute a command on the terminal server via its run_command tool."""
    # Get cached terminal server specs to use execute_tool_server
    terminal_servers = await get_terminal_servers(request)
    server_data = next((s for s in terminal_servers if s.get('id') == server_id), None)
    if server_data is None:
        return {'error': 'Terminal server spec not found'}

    # Build auth headers
    auth_type = connection.get('auth_type', 'bearer')
    headers = {'Content-Type': 'application/json'}
    cookies = {}

    if auth_type == 'bearer':
        headers['Authorization'] = f'Bearer {connection.get("key", "")}'

    params = {'command': command}
    if cwd:
        params['cwd'] = cwd

    try:
        result, _ = await execute_tool_server(
            url=server_data['url'],
            headers=headers,
            cookies=cookies,
            name='run_command',
            params=params,
            server_data=server_data,
        )
        if isinstance(result, dict):
            return result
        return {'output': str(result)}
    except Exception as e:
        log.exception('Changes router: terminal command error: %s', e)
        return {'error': str(e)}


@router.get('/{server_id}/has-git')
async def has_git(
    server_id: str,
    request: Request,
    cwd: str = '.',
    user=Depends(get_verified_user),
):
    """Check if the project directory has a .git repo."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    result = await _run_command_on_terminal(
        request, connection, server_id,
        'test -d .git && echo yes || echo no', cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = (result.get('output') or result.get('stdout') or '').strip()
    return {'has_git': output == 'yes'}


@router.get('/{server_id}/status')
async def git_status(
    server_id: str,
    request: Request,
    cwd: str = '.',
    user=Depends(get_verified_user),
):
    """Get git status (modified, staged, untracked files)."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    result = await _run_command_on_terminal(
        request, connection, server_id,
        'git status --porcelain 2>/dev/null || echo __NO_GIT__', cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = (result.get('output') or result.get('stdout') or '').strip()
    if output == '__NO_GIT__':
        return {'has_git': False, 'modified': [], 'staged': [], 'untracked': []}

    modified = []
    staged = []
    untracked = []

    for line in output.split('\n'):
        if not line or len(line) < 3:
            continue
        x, y = line[0], line[1]
        filepath = line[3:].strip()

        if x == '?' and y == '?':
            untracked.append(filepath)
        elif x in ('M', 'A', 'D', 'R', 'C'):
            staged.append(filepath)
        if y in ('M', 'D'):
            modified.append(filepath)

    return {'has_git': True, 'modified': modified, 'staged': staged, 'untracked': untracked}


@router.get('/{server_id}/diff')
async def git_diff(
    server_id: str,
    request: Request,
    cwd: str = '.',
    path: str = '',
    staged: bool = False,
    user=Depends(get_verified_user),
):
    """Get git diff for a file or the whole working tree."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    cmd = 'git diff'
    if staged:
        cmd += ' --cached'
    if path:
        cmd += f' -- {path}'

    result = await _run_command_on_terminal(
        request, connection, server_id, cmd, cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or ''
    return {'diff': output}


@router.get('/{server_id}/log')
async def git_log(
    server_id: str,
    request: Request,
    cwd: str = '.',
    count: int = 30,
    user=Depends(get_verified_user),
):
    """Get recent git log."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    count = min(count, 100)
    result = await _run_command_on_terminal(
        request, connection, server_id,
        f'git log --oneline -n {count} 2>/dev/null || echo __NO_GIT__',
        cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = (result.get('output') or result.get('stdout') or '').strip()
    if output == '__NO_GIT__':
        return {'has_git': False, 'commits': []}

    commits = []
    for line in output.split('\n'):
        if not line:
            continue
        parts = line.split(' ', 1)
        commits.append({
            'hash': parts[0],
            'message': parts[1] if len(parts) > 1 else '',
        })

    return {'has_git': True, 'commits': commits}


@router.get('/{server_id}/current-branch')
async def current_branch(
    server_id: str,
    request: Request,
    cwd: str = '.',
    user=Depends(get_verified_user),
):
    """Get the current branch name."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    result = await _run_command_on_terminal(
        request, connection, server_id,
        'git branch --show-current 2>/dev/null || echo __NO_GIT__',
        cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = (result.get('output') or result.get('stdout') or '').strip()
    if output == '__NO_GIT__':
        return {'branch': ''}
    return {'branch': output}


@router.get('/{server_id}/branches')
async def list_branches(
    server_id: str,
    request: Request,
    cwd: str = '.',
    user=Depends(get_verified_user),
):
    """List local and remote branches sorted by most recent commit."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    result = await _run_command_on_terminal(
        request, connection, server_id,
        "git branch -a --sort=-committerdate --format='%(refname:short)\t%(upstream:short)\t%(HEAD)\t%(committerdate:relative)' 2>/dev/null || echo __NO_GIT__",
        cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = (result.get('output') or result.get('stdout') or '').strip()
    if output == '__NO_GIT__':
        return {'branches': []}

    branches = []
    for line in output.split('\n'):
        if not line:
            continue
        parts = line.split('\t')
        name = parts[0].strip() if len(parts) > 0 else ''
        upstream = parts[1].strip() if len(parts) > 1 else ''
        is_current = parts[2].strip() == '*' if len(parts) > 2 else False
        date = parts[3].strip() if len(parts) > 3 else ''
        if not name:
            continue
        is_remote = name.startswith('origin/')
        branches.append({
            'name': name,
            'upstream': upstream,
            'current': is_current,
            'date': date,
            'remote': is_remote,
        })

    return {'branches': branches}


@router.post('/{server_id}/checkout')
async def checkout_branch(
    server_id: str,
    request: Request,
    body: dict,
    user=Depends(get_verified_user),
):
    """Switch to a branch or create a new one."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    branch = body.get('branch', '')
    create = body.get('create', False)
    cwd = body.get('cwd', '.')

    if not branch:
        return JSONResponse({'error': 'No branch specified'}, status_code=400)

    if create:
        cmd = f'git checkout -b {branch}'
    else:
        cmd = f'git checkout {branch}'

    result = await _run_command_on_terminal(
        request, connection, server_id, cmd, cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or result.get('stderr') or ''
    return {'ok': True, 'output': output.strip()}


@router.post('/{server_id}/commit')
async def commit_changes(
    server_id: str,
    request: Request,
    body: dict,
    user=Depends(get_verified_user),
):
    """Stage all changes and commit with a message."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    message = body.get('message', '').replace("'", "'\\''")  # escape single quotes
    cwd = body.get('cwd', '.')

    if not message:
        return JSONResponse({'error': 'No commit message'}, status_code=400)

    cmd = f"git add -A && git commit -m '{message}'"

    result = await _run_command_on_terminal(
        request, connection, server_id, cmd, cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or ''
    return {'ok': True, 'output': output.strip()}


@router.post('/{server_id}/push')
async def push_changes(
    server_id: str,
    request: Request,
    body: dict = {},
    user=Depends(get_verified_user),
):
    """Push to remote."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    cwd = body.get('cwd', '.')
    # Try regular push first; if no upstream, set it
    cmd = "git push 2>&1 || git push -u origin $(git branch --show-current) 2>&1"

    result = await _run_command_on_terminal(
        request, connection, server_id, cmd, cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or ''
    return {'ok': True, 'output': output.strip()}


@router.post('/{server_id}/pull')
async def pull_changes(
    server_id: str,
    request: Request,
    body: dict = {},
    user=Depends(get_verified_user),
):
    """Pull from remote."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    cwd = body.get('cwd', '.')

    result = await _run_command_on_terminal(
        request, connection, server_id, 'git pull 2>&1', cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or ''
    return {'ok': True, 'output': output.strip()}


@router.get('/{server_id}/gitignore')
async def get_gitignore(
    server_id: str,
    request: Request,
    cwd: str = '.',
    user=Depends(get_verified_user),
):
    """Read .gitignore content."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    result = await _run_command_on_terminal(
        request, connection, server_id,
        'cat .gitignore 2>/dev/null || echo ""',
        cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    output = result.get('output') or result.get('stdout') or ''
    return {'content': output}


@router.post('/{server_id}/gitignore')
async def save_gitignore(
    server_id: str,
    request: Request,
    body: dict,
    user=Depends(get_verified_user),
):
    """Write .gitignore content."""
    connection, err = _resolve_terminal_connection(request, server_id, user)
    if err:
        return JSONResponse({'error': err}, status_code=404 if 'not found' in err else 403)

    content = body.get('content', '')
    cwd = body.get('cwd', '.')

    # Use heredoc to write content safely
    escaped = content.replace('\\', '\\\\').replace("'", "'\\''")
    cmd = f"printf '%s\\n' '{escaped}' > .gitignore"

    result = await _run_command_on_terminal(
        request, connection, server_id, cmd, cwd=cwd or None,
    )
    if 'error' in result:
        return JSONResponse(result, status_code=502)

    return {'ok': True}
