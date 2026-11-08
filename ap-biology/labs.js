function waterState(inside,outside,pressure=0,T=298){const R=.0831,soluteInside=-inside*R*T,soluteOutside=-outside*R*T;const psiInside=soluteInside+pressure,psiOutside=soluteOutside,difference=psiOutside-psiInside;return{soluteInside,soluteOutside,psiInside,psiOutside,difference,direction:Math.abs(difference)<1e-9?'balanced':difference>0?'inward':'outward'}}
function enzymeRate(S,Km,alpha=1,Vmax=100){return Vmax*S/(alpha*Km+S)}
function crossGenotypes(first,second){const counts={AA:0,Aa:0,aa:0};for(const a of first)for(const b of second){const key=a===b?a+b:'Aa';counts[key]+=.25}return counts}
function selectionState(p,wAA,wAa,waa){const q=1-p,before=[p*p,2*p*q,q*q],weighted=before.map((f,i)=>f*[wAA,wAa,waa][i]),mean=weighted.reduce((a,b)=>a+b,0);if(mean<=0)throw Error('Mean contribution must be positive.');const after=weighted.map(x=>x/mean),nextP=after[0]+after[1]/2;return{before,after,mean,nextP}}
function populationState(r,K,t,N0=20){const exponential=N0*Math.exp(r*t),logistic=K/(1+(K/N0-1)*Math.exp(-r*t)),rate=r*logistic*(1-logistic/K);return{exponential,logistic,rate}}
function chiSquare(observed,expected){if(observed.length!==expected.length||!expected.length||expected.some(x=>x<=0))throw Error('Expected counts must be positive and match observations.');return observed.reduce((sum,x,i)=>sum+(x-expected[i])**2/expected[i],0)}
function groupedBars(id,labels,series){
 const svg=$(id),W=900,H=310,L=65,R=20,T=35,B=50,values=series.flatMap(s=>s.values),max=Math.max(1,...values)*1.12,space=(W-L-R)/labels.length,band=space*.65/series.length,Y=v=>H-B-v/max*(H-T-B);let s='';
 for(let i=0;i<=4;i++){const v=max*i/4,y=Y(v);s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#dce8df"/><text x="${L-8}" y="${y+4}" text-anchor="end">${escape(fmt(v))}</text>`}
 labels.forEach((label,i)=>{const start=L+i*space+space*.175;series.forEach((a,j)=>{const value=a.values[i],x=start+j*band,y=Y(value);s+=`<rect x="${x}" y="${y}" width="${band*.88}" height="${H-B-y}" rx="3" fill="${a.color}"/><text x="${x+band*.44}" y="${y-6}" text-anchor="middle">${escape(fmt(value))}</text>`});s+=`<text x="${L+(i+.5)*space}" y="${H-18}" text-anchor="middle">${escape(label)}</text>`});svg.innerHTML=s;
}
function drawOsmosis(){
 const a=Number($('osm-in').value),b=Number($('osm-out').value),p=Number($('osm-pressure').value),d=waterState(a,b,p);for(const [id,v]of [['osm-in',a],['osm-out',b],['osm-pressure',p]])$(id+'-value').value=fmt(v);
 const arrow=d.direction==='balanced'?'⇄':d.direction==='inward'?'←':'→';
 $('osmosis-chart').innerHTML=`<rect x="25" y="35" width="230" height="165" rx="18" fill="#e1f2e9" stroke="#17654e"/><rect x="345" y="35" width="230" height="165" rx="18" fill="#fff4df" stroke="#a25710"/><text x="140" y="76" text-anchor="middle">Inside cell</text><text x="460" y="76" text-anchor="middle">Outside</text><text x="140" y="116" text-anchor="middle">Ψ = ${fmt(d.psiInside)} bar</text><text x="460" y="116" text-anchor="middle">Ψ = ${fmt(d.psiOutside)} bar</text><text x="300" y="131" text-anchor="middle" style="font-size:40px;fill:#17654e">${arrow}</text><text x="140" y="160" text-anchor="middle">${fmt(a)} M; pressure ${fmt(p)} bar</text><text x="460" y="160" text-anchor="middle">${fmt(b)} M; pressure 0 bar</text><text x="300" y="225" text-anchor="middle">Net water tendency: ${d.direction==='balanced'?'no initial net movement':d.direction}</text>`;
 $('osmosis-result').innerHTML=`<strong>Ψinside = ${fmt(d.soluteInside)} + ${fmt(p)} = ${fmt(d.psiInside)} bar; Ψoutside = ${fmt(d.psiOutside)} bar.</strong><br>${d.direction==='balanced'?'Equal potentials give no initial net water movement, while molecules still move in both directions.':`Initial net movement is ${d.direction}, from higher toward lower water potential.`} Solute concentrations and pressure are held as chosen; this is not a volume-change simulation.`;
}
function drawEnzyme(){
 const S=Number($('enzyme-s').value),Km=Number($('enzyme-km').value),alpha=Number($('enzyme-alpha').value);for(const [id,v]of [['enzyme-s',S],['enzyme-km',Km],['enzyme-alpha',alpha]])$(id+'-value').value=fmt(v);
 const curve=a=>Array.from({length:201},(_,i)=>[i/10,enzymeRate(i/10,Km,a)]);
 plot('enzyme-chart',[{data:curve(alpha),color:'#17654e'},{data:curve(1),color:'#b85d13',dash:true},{data:[[0,100],[20,100]],color:'#758079',dash:true}],{xmin:0,xmax:20,marker:S,xlabel:'substrate concentration',ylabel:'initial rate'});
 $('enzyme-result').innerHTML=`<strong>Selected rate: ${fmt(enzymeRate(S,Km,alpha))}; no-inhibitor rate: ${fmt(enzymeRate(S,Km,1))}.</strong><br>Both model curves approach Vmax=100 at very high substrate. Changing α alters the substrate level needed for a given rate; it does not change Vmax in this competitive-inhibition model.`;
}
function drawPunnett(){
 const a=$('parent-one').value,b=$('parent-two').value,d=crossGenotypes(a,b);
 $('punnett-grid').innerHTML=`<table><caption>Gamete combinations for ${escape(a)} × ${escape(b)}</caption><thead><tr><th scope="col">First / second</th>${[...b].map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${[...a].map(x=>`<tr><th scope="row">${escape(x)}</th>${[...b].map(y=>`<td>${x===y?escape(x+y):'Aa'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('punnett-result').innerHTML=`<strong>AA: ${fmt(d.AA*100)}% · Aa: ${fmt(d.Aa*100)}% · aa: ${fmt(d.aa*100)}%.</strong><br>Under complete dominance: dominant phenotype ${fmt((d.AA+d.Aa)*100)}%, recessive phenotype ${fmt(d.aa*100)}%. Each grid position has probability 1/4, including repeated gamete labels.`;
}
function drawAlleles(){
 const p=Number($('allele-p').value),values=['fitness-aa-upper','fitness-het','fitness-aa-lower'].map(id=>Number($(id).value)),d=selectionState(p,...values);$('allele-p-value').value=fmt(p);['fitness-aa-upper','fitness-het','fitness-aa-lower'].forEach((id,i)=>$(id+'-value').value=fmt(values[i]));
 groupedBars('allele-chart',['AA','Aa','aa'],[{values:d.before,color:'#17654e'},{values:d.after,color:'#b85d13'}]);
 $('allele-result').innerHTML=`<strong>p before = ${fmt(p)}; p among survivors = ${fmt(d.nextP)}.</strong><br>Mean relative contribution = ${fmt(d.mean)}. Equal contributions leave p unchanged in this deterministic model. Survivor genotype proportions are normalized after selection; the chart does not assume they remain Hardy–Weinberg proportions.`;
}
function drawPopulation(){
 const r=Number($('pop-r').value),K=Number($('pop-k').value),t=Number($('pop-time').value);for(const [id,v]of [['pop-r',r],['pop-k',K],['pop-time',t]])$(id+'-value').value=fmt(v);
 const points=Array.from({length:151},(_,i)=>i/5),d=populationState(r,K,t);
 plot('population-chart',[{data:points.map(t=>[t,populationState(r,K,t).logistic]),color:'#17654e'},{data:points.map(t=>[t,populationState(r,K,t).exponential]),color:'#b85d13',dash:true},{data:[[0,K],[30,K]],color:'#758079',dash:true}],{xmin:0,xmax:30,marker:t,xlabel:'time',ylabel:'population N'});
 $('population-result').innerHTML=`<strong>At t=${fmt(t)}: logistic N=${fmt(d.logistic)}; exponential N=${fmt(d.exponential)}.</strong><br>Instantaneous logistic growth rate = ${fmt(d.rate)} individuals per time unit. Model populations can be fractional expected values; actual individuals are counted in whole numbers.`;
}
function drawChi(){
 const observedA=Number($('chi-observed').value),p=Number($('chi-prob').value),observed=[observedA,100-observedA],expected=[100*p,100*(1-p)],statistic=chiSquare(observed,expected),reject=statistic>3.841;$('chi-observed-value').value=observedA;
 groupedBars('chi-chart',['A','B'],[{values:observed,color:'#17654e'},{values:expected,color:'#b85d13'}]);
 $('chi-result').innerHTML=`<strong>χ² = ${fmt(statistic)}; df=1; critical value≈3.841 at α=0.05.</strong><br>${reject?'Reject':'Fail to reject'} the fixed-probability null model using the stated threshold. ${reject?'This indicates a discrepancy under the assumptions, not a unique biological cause.':'This does not prove the null model or show that the observed counts must match exactly.'} Independent observations and adequate expected counts are required.`;
}
for(const [ids,fn]of [[['osm-in','osm-out','osm-pressure'],drawOsmosis],[['enzyme-s','enzyme-km','enzyme-alpha'],drawEnzyme],[['parent-one','parent-two'],drawPunnett],[['allele-p','fitness-aa-upper','fitness-het','fitness-aa-lower'],drawAlleles],[['pop-r','pop-k','pop-time'],drawPopulation],[['chi-prob','chi-observed'],drawChi]])for(const id of ids)$(id).addEventListener('input',fn);
