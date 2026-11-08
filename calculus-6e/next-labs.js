function curveState(kind,t){
 if(kind==='parabola')return{x:t,y:t*t,dx:1,dy:2*t};
 if(kind==='circle')return{x:2*Math.cos(t),y:2*Math.sin(t),dx:-2*Math.sin(t),dy:2*Math.cos(t)};
 const r=1+Math.cos(t),dr=-Math.sin(t);
 return{x:r*Math.cos(t),y:r*Math.sin(t),dx:dr*Math.cos(t)-r*Math.sin(t),dy:dr*Math.sin(t)+r*Math.cos(t)};
}
function geometryPlot(id,{range,paths=[],arrows=[],points=[]}){
 const el=$(id),W=el.viewBox.baseVal.width,H=el.viewBox.baseVal.height,pad=45,scale=Math.min((W-2*pad)/(2*range),(H-2*pad)/(2*range));
 const X=x=>W/2+x*scale,Y=y=>H/2-y*scale;
 let s=`<defs><marker id="${id}-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#2458c6"/></marker><marker id="${id}-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#b85d13"/></marker></defs>`;
 const bound=Math.ceil(range)-1;
 for(let k=-bound;k<=bound;k++){
  s+=`<line x1="${X(-range)}" x2="${X(range)}" y1="${Y(k)}" y2="${Y(k)}" stroke="#e2e7ef"/><line x1="${X(k)}" x2="${X(k)}" y1="${Y(-range)}" y2="${Y(range)}" stroke="#e2e7ef"/>`;
  if(k!==0)s+=`<text x="${X(k)}" y="${Y(0)+17}" text-anchor="middle">${k}</text><text x="${X(0)-9}" y="${Y(k)+4}" text-anchor="end">${k}</text>`;
 }
 s+=`<line x1="${X(-range)}" x2="${X(range)}" y1="${Y(0)}" y2="${Y(0)}" stroke="#8e9bb0"/><line x1="${X(0)}" x2="${X(0)}" y1="${Y(-range)}" y2="${Y(range)}" stroke="#8e9bb0"/><text x="${X(range)+12}" y="${Y(0)+4}">x</text><text x="${X(0)+10}" y="${Y(range)-8}">y</text>`;
 for(const p of paths){const d=p.data.map((v,i)=>(i?'L':'M')+X(v[0]).toFixed(2)+','+Y(v[1]).toFixed(2)).join(' ');s+=`<path d="${d}" fill="none" stroke="${p.color||'#2458c6'}" stroke-width="${p.width||2}" ${p.dash?'stroke-dasharray="5 5"':''}/>`}
 for(const a of arrows)s+=`<line x1="${X(a.from[0])}" y1="${Y(a.from[1])}" x2="${X(a.to[0])}" y2="${Y(a.to[1])}" stroke="${a.color==='blue'?'#2458c6':'#b85d13'}" stroke-width="3" marker-end="url(#${id}-${a.color})"/>`;
 for(const p of points)s+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="#087566" stroke="white" stroke-width="1.5"/>`;
 el.innerHTML=s;
}
function drawCurve(){
 const kind=$('curve-kind').value,t=Number($('curve-t').value),extent=kind==='parabola'?2:Math.PI,d=curveState(kind,t),speed=Math.hypot(d.dx,d.dy),zero=speed<1e-10;
 $('curve-t-value').value=fmt(t);
 const data=Array.from({length:241},(_,i)=>{const q=curveState(kind,-extent+2*extent*i/240);return[q.x,q.y]});
 const arrows=zero?[]:[{from:[d.x,d.y],to:[d.x+d.dx/speed,d.y+d.dy/speed],color:'orange'}];
 geometryPlot('curve-chart',{range:5.5,paths:[{data}],arrows,points:[[d.x,d.y]]});
 const slope=zero?'inconclusive: both coordinate rates vanish':Math.abs(d.dx)<1e-10?'vertical tangent (dx/dt = 0)':fmt(d.dy/d.dx);
 $('curve-result').innerHTML=`<strong>Position: (${fmt(d.x)}, ${fmt(d.y)}). Velocity: ⟨${fmt(d.dx)}, ${fmt(d.dy)}⟩.</strong><br>Speed = ${fmt(speed)}. Tangent slope: ${slope}.${kind==='cardioid'?'<br>Here r = 1 + cos t. At t = ±π the cardioid has a cusp; the velocity is zero and the basic slope formula needs further analysis.':''}`;
}
function updateCurveChoice(){const extent=$('curve-kind').value==='parabola'?2:Math.PI;$('curve-t').min=String(-extent);$('curve-t').max=String(extent);$('curve-t').value='0';drawCurve()}
for(const id of ['curve-t'])$(id).addEventListener('input',drawCurve);$('curve-kind').addEventListener('change',updateCurveChoice);
