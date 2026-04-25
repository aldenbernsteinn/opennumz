import{_ as e,l as s,I as o,d as i}from"./BE1gd82i.js";import{p as g}from"./Bcw4EO7-.js";var d={parse:e(async r=>{const a=await g("info",r);s.debug(a)},"parse")},p={version:"11.14.0"},v=e(()=>p.version,"getVersion"),m={getVersion:v},c=e((r,a,n)=>{s.debug(`rendering info diagram
`+r);const t=o(a);i(t,100,400,!0),t.append("g").append("text").attr("x",100).attr("y",40).attr("class","version").attr("font-size",32).style("text-anchor","middle").text(`v${n}`)},"draw"),l={draw:c},_={parser:d,db:m,renderer:l};export{_ as diagram};
//# sourceMappingURL=B9a6psgQ.js.map
