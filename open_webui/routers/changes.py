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
