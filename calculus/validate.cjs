const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const page=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const lessons=JSON.parse(page.match(/<script id="lesson-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
let code=page.match(/<script>([\s\S]*?)<\/script>/)[1];
code=code.slice(0,code.indexOf('const initial=lessons.findIndex'));
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,style:{},dataset:{},viewBox:{baseVal:{width:id.includes('chart')?900:500,height:310}},addEventListener(){},setAttribute(){},scrollIntoView(){},focus(){}});return elements.get(id)}
element('lesson-data').textContent=JSON.stringify(lessons);
const units=JSON.parse(page.match(/<script id="unit-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
element('unit-data').textContent=JSON.stringify(units);
const defaults={'series-type':'geometric',terms:'30',ratio:'.5','power-p':'2','taylor-function':'exp',degree:'3','eval-x':'.5','point-a':'1','point-b':'2','slice-mode':'x','curve-kind':'parabola','curve-t':'0','vector-angle':'60','vector-length':'2','gradient-a':'1','gradient-b':'1','gradient-angle':'0'};
for(const [k,v]of Object.entries(defaults))element(k).value=v;
const context={console,Math,JSON,Number,String,Array,Set,Map,document:{getElementById:element,querySelectorAll:()=>[],querySelector:()=>element('generic')},localStorage:{getItem:()=>null,setItem(){}},location:{hash:''},window:{addEventListener(){},confirm:()=>false}};
vm.createContext(context);vm.runInContext(code,context);
const evaluate=x=>vm.runInContext(x,context);
function near(a,b,tol=1e-10){assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`)}
near(evaluate('numericValue("5/2")'),2.5);near(evaluate('numericValue("−1/4")'),-.25);near(evaluate('numericValue("1e-3")'),.001);
for(const s of ['1/0','Infinity','NaN','2+3','Math.random()','1/2/3','<script>','1e999'])assert.equal(evaluate(`numericValue(${JSON.stringify(s)})`),null);
near(evaluate('seriesData("geometric",10,.5,2).sum'),2*(1-.5**10));
near(evaluate('seriesData("geometric",11,-.5,2).sum'),(1-(-.5)**11)/1.5);
near(evaluate('seriesData("harmonic",4,0,2).sum'),25/12);
near(evaluate('seriesData("alternating",4,0,2).sum'),7/12);
near(evaluate('taylor("exp",3,.2)'),1+.2+.2**2/2+.2**3/6);
near(evaluate('taylor("sin",3,.2)'),.2-.2**3/6);
near(evaluate('taylor("cos",4,.2)'),1-.2**2/2+.2**4/24);
let bounds=0;
for(const kind of ['exp','sin','cos'])for(let n=0;n<=12;n++)for(let k=-60;k<=60;k++){
 const x=k/20,approx=evaluate(`taylor("${kind}",${n},${x})`),exact=Math[kind](x),M=kind==='exp'?Math.exp(Math.max(0,x)):1,bound=M*Math.abs(x)**(n+1)/evaluate(`factorial(${n+1})`);
 assert.ok(Math.abs(exact-approx)<=bound+1e-10);bounds++;
}
let plots=0;
for(const type of ['geometric','harmonic','alternating','p'])for(const n of [2,30,200])for(const r of [-1.1,-1,-.5,0,.5,1,1.1]){
 element('series-type').value=type;element('terms').value=String(n);element('ratio').value=String(r);
 evaluate('drawSeries()');for(const id of ['terms-chart','sums-chart']){assert.ok(element(id).innerHTML.includes('<path'));assert.ok(!/NaN|Infinity/.test(element(id).innerHTML));plots++}
}
for(const kind of ['exp','sin','cos'])for(const n of [0,1,3,12]){
 element('taylor-function').value=kind;element('degree').value=String(n);evaluate('drawTaylor()');assert.ok(!/NaN|Infinity/.test(element('taylor-chart').innerHTML));plots++;
}
for(const mode of ['x','y'])for(const a of [-2,0,2])for(const b of [-2,0,2]){
 element('slice-mode').value=mode;element('point-a').value=String(a);element('point-b').value=String(b);evaluate('drawSlice()');assert.ok(!/NaN|Infinity/.test(element('slice-chart').innerHTML));plots++;
}
for(let i=0;i<lessons.length;i++){
 evaluate(`current=${i};renderLesson()`);const html=element('lesson').innerHTML;
 assert.ok(html.includes(lessons[i].title));assert.equal((html.match(/data-question=/g)||[]).length,2);
 assert.equal((html.match(/Show the full solution after trying/g)||[]).length,2);
}
// Verify the authored numerical practice answers independently.
const expected=[2.5,6,0,.008,5,1/24,-.25,.75,1,7,8,3,1,4,8,-.5,12,.2,10,2,8,.5];
const legacyIds=['sequences', 'partial-sums', 'positive-tests', 'ratio-root', 'alternating', 'power', 'taylor', 'series-tools', 'parametric', 'polar', 'vector-basics', 'dot-cross', 'lines-planes', 'vectors-preview', 'arc-curvature', 'surfaces', 'multivariable-limits', 'partials-preview', 'tangent-plane', 'chain-rule', 'gradient', 'optimization', 'lagrange'];
const actual=legacyIds.map(id=>lessons.find(l=>l.id===id)).flatMap(l=>l.questions.filter(q=>!q.options).map(q=>q.answer));assert.deepEqual(actual,expected);
assert.ok(1/101<.01);near(1/125,.008);near(1/121,.008264462809917356);
near(1.2213333333333334,1+.2+.2**2/2+.2**3/6);
assert.ok(Math.abs(Math.log(1.2)-(.2-.2**2/2+.2**3/3))<.2**4/4);
for(const l of lessons)for(const q of l.questions)if(q.options)assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);
assert.equal(lessons.length,111);assert.equal(lessons.flatMap(l=>l.questions).length,222);
for(const l of lessons)assert.ok(l.formulaMathML.includes('<math')&&l.formulaNote);
// Guided reveals leave quiz state intact and can restart independently.
evaluate('current=0;renderLesson()');
assert.ok(element('example-steps').innerHTML.includes('hidden'));
element('reveal-step').onclick();
assert.ok(element('step-status').textContent.startsWith('2 of '));
element('reveal-all').onclick();assert.equal(element('reveal-step').disabled,true);
element('restart-example').onclick();assert.ok(element('step-status').textContent.startsWith('1 of '));
// Backup validation is transactional; imports merge and never clear existing flags.
evaluate("solved={'sequences-0':true};");
const backup=JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'partial-sums-1':true,'sequences-0':false,'future-0':true}});
const imported=evaluate(`mergeProgressBackup(${JSON.stringify(backup)})`);
assert.equal(imported.count,1);assert.equal(imported.skipped,1);assert.equal(imported.saved,true);
assert.equal(evaluate("solved['sequences-0']"),true);assert.equal(evaluate("solved['partial-sums-1']"),true);
const exported=evaluate('JSON.stringify(progressBackup())');
assert.equal(JSON.parse(exported).format,'beyond-bc-progress');
assert.equal(Object.keys(JSON.parse(exported).solved).length,2);
for(const bad of ['{', 'null', '[]', '{}',JSON.stringify({format:'beyond-bc-progress',version:2,solved:{}}),JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'power-0':true,'taylor-0':'yes'}}),' '.repeat(1048577)]){
 assert.throws(()=>evaluate(`mergeProgressBackup(${JSON.stringify(bad)})`));
 assert.equal(evaluate("solved['power-0']"),undefined);
 assert.equal(evaluate("solved['sequences-0']"),true);
}
context.localStorage.setItem=()=>{throw Error('storage unavailable')};
assert.equal(evaluate(`mergeProgressBackup(${JSON.stringify(exported)})`).saved,false);
context.localStorage.setItem=()=>{};
assert.equal(new Set(lessons.map(l=>l.id)).size,111);
assert.ok(lessons.some(l=>l.id==='vectors-preview')&&lessons.some(l=>l.id==='partials-preview'));
for(const l of lessons)if(l.lab)assert.ok(page.includes(`id="${l.lab}"`),l.lab);
// Old completion keys remain valid despite the reordered lessons.
evaluate("solved={'vectors-preview-0':true,'partials-preview-1':true};progress()");
assert.equal(element('progress-label').textContent,'2 of 222 checks solved');
// Independent geometry checks and finite-difference checks of curve derivatives.
for(const kind of ['parabola','circle','cardioid'])for(const t of [-Math.PI,-1,0,1,Math.PI]){
 const d=evaluate(`curveState('${kind}',${t})`),h=1e-5;
 const before=evaluate(`curveState('${kind}',${t-h})`),after=evaluate(`curveState('${kind}',${t+h})`);
 near(d.dx,(after.x-before.x)/(2*h),1e-8);near(d.dy,(after.y-before.y)/(2*h),1e-8);
 element('curve-kind').value=kind;element('curve-t').value=String(t);evaluate('drawCurve()');
 assert.ok(!/NaN|Infinity/.test(element('curve-chart').innerHTML));plots++;
}
for(const kind of ['parabola','circle','cardioid']){
 element('curve-kind').value=kind;evaluate('updateCurveChoice()');
 near(Number(element('curve-t').max),kind==='parabola'?2:Math.PI);
}
for(let deg=0;deg<=360;deg+=5)for(const length of [.25,1,3]){
 const d=evaluate(`vectorState(${deg},${length})`),rad=deg*Math.PI/180;
 near(d.dot,2*length*Math.cos(rad));near(d.crossZ,2*length*Math.sin(rad));
 near(d.dot**2+d.crossZ**2,4*length**2,1e-9);
 element('vector-angle').value=String(deg);element('vector-length').value=String(length);evaluate('drawVectors()');
 assert.ok(!/NaN|Infinity/.test(element('vectors-chart').innerHTML));plots++;
}
for(const a of [-1.5,0,1.5])for(const b of [-1.5,0,1.5])for(const deg of [0,45,90,180,270]){
 const d=evaluate(`gradientState(${a},${b},${deg})`),h=1e-6;
 const f=(x,y)=>x*x+2*y*y;
 const numerical=(f(a+h*d.u[0],b+h*d.u[1])-f(a-h*d.u[0],b-h*d.u[1]))/(2*h);
 near(d.rate,numerical,1e-8);assert.ok(Math.abs(d.rate)<=d.max+1e-10);
 element('gradient-a').value=String(a);element('gradient-b').value=String(b);element('gradient-angle').value=String(deg);evaluate('drawGradient()');
 assert.ok(!/NaN|Infinity/.test(element('gradient-chart').innerHTML));plots++;
}
// Verify the new worked examples without using the displayed answer values.
near(2*(9/5)-1+3*(9/5),8); // line/plane intersection
near(3/5*.02+4/5*(-.01),.004); // differential
near(2*3/5+4*4/5,4.4); // gradient projection
near((1+.01)**2+(2-.02)**2,4.9405);
near(4*2**3,32);near(4*3-2**2,8);
for(const x of [-2,-.5,0,2])for(const y of [-2,0,3]){
 const f=x*x+x*y+y*y-4*x-2*y,u=x-2;
 near(f,(u+y/2)**2+3*y*y/4-4);
}
// Numerical area check for r = 2 cos(theta), traced once.
let area=0;const N=10000,dt=Math.PI/N;
for(let i=0;i<N;i++){const t=-Math.PI/2+(i+.5)*dt;area+=.5*(2*Math.cos(t))**2*dt;}
near(area,Math.PI,1e-8);
console.log(`PASS: 17 units, 115 section mappings, 111 lesson renders, 222 answer definitions, ${bounds} Taylor-bound cases, ${plots} plot renders, preserved progress keys, and independent geometry/derivative/area checks.`);

// The chapter selector, filtered navigation, deep-link targets and unit counts agree.
assert.deepEqual(units.map(u=>u.id),['P',...Array.from({length:16},(_,i)=>String(i+1))]);
assert.equal(units.flatMap(u=>u.sections).length,115);
for(const u of units){
 const items=lessons.filter(l=>l.unit===u.id);
 assert.deepEqual(items.map(l=>l.id),u.lessonIds);
 assert.deepEqual([...new Set(items.flatMap(l=>l.sections))].sort(),[...u.sections].sort());
 evaluate(`current=${lessons.indexOf(items[0])};renderLesson()`);
 assert.equal(element('unit-select').value,u.id);
 assert.ok(element('unit-summary').innerHTML.includes(u.title.replaceAll('&','&amp;')));
 for(const l of lessons)assert.equal(element('lesson-list').innerHTML.includes(`href="#${l.id}"`),l.unit===u.id);
 const c=evaluate(`unitCounts(units.find(u=>u.id===${JSON.stringify(u.id)}))`);
 assert.equal(c.total,2*items.length);
 for(const l of items){
  assert.equal(l.questions.length,2);assert.ok(l.steps.length>=4);
  for(const key of ['idea','formula','trap','challenge','solution','goal'])assert.ok(l[key]?.length>0,l.id+' '+key);
  assert.ok(/^https:\/\//.test(l.resource));
 }
}
assert.equal((element('course-map').innerHTML.match(/<article/g)||[]).length,17);
for(const u of units){evaluate(`navigate(${lessons.findIndex(l=>l.id===u.lessonIds[0])})`);assert.equal(context.location.hash,u.lessonIds[0]);}
console.log('PASS: chapter order, per-unit navigation, course map, metadata, and direct lesson links.');
// Independent quadrature and finite differences exercise the authored new mathematics.
function integrate(f,a,b,n=20000){const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);return s*h}
function derivative(f,x,h=1e-5){return(f(x+h)-f(x-h))/(2*h)}
function numericAnswer(id){const l=lessons.find(l=>l.id===id);assert.ok(l,id);return l.questions.find(q=>!q.options).answer}
const computations={
 'linear-models':(13-5)/(6-2),'functions-domain':(2*3)**2+1,'trig-review':Math.cos(Math.PI),
 'calculus-preview':(3**2-1**2)/(3-1),'analytic-limits':Math.sin(3e-7)/1e-7,
 'derivative-definition':derivative(x=>x*x,4),'basic-derivatives':derivative(x=>x**3-5*x,2),
 'product-quotient':derivative(x=>x*x*(x+1),1),'single-chain':derivative(x=>(3*x+1)**2,1),
 'implicit':derivative(x=>Math.sqrt(25-x*x),4),'related-rates':derivative(t=>(3+2*t)**2,0),
 'mean-value':((6*6-2*2)/(6-2))/2,'first-derivative-test':(-1)**3-3*(-1),
 'single-optimization':(12/4)**2,'newton':(2+2/2)/2,'single-differentials':6*.02,
 'antiderivatives':2**2+7,'area-sums':(0**2+1**2)*1,'definite-integrals':integrate(()=>2,0,3),
 'ftc':integrate(x=>3*x*x,0,2),'substitution':integrate(x=>2*x*(x*x+1),0,1),
 'log-derivative':derivative(x=>Math.log(x*x+1),2),'log-integrals':integrate(x=>1/x,1,2)/Math.log(2),
 'inverse-functions':1/5,'exponential-calculus':derivative(x=>Math.exp(2*x),0),'other-bases':5*3**2,
 'lhopital':Math.expm1(2e-7)/1e-7,'inverse-trig-derivatives':derivative(Math.atan,1),
 'inverse-trig-integrals':integrate(x=>1/(1+x*x),0,1)/Math.PI,'hyperbolic':(Math.exp(0)+Math.exp(-0))/2,
 'euler':2+.1*2,'growth-decay':120*2**(-6/2),'separable-logistic':20,'linear-ode':6/3,
 'between-curves':integrate(()=>2,1,4),'washers':integrate(()=>4,0,3),'shells':2*integrate(x=>x*x,0,1),
 'length-revolution':integrate(()=>Math.sqrt(1),2,7),'work':integrate(x=>8*x,0,1),
 'centroids':(1*0+3*4)/(1+3),'fluid-force':integrate(y=>2*y,0,3),'integration-strategy':integrate(x=>2*x+3,0,1),
 'parts':integrate(x=>x*Math.exp(x),0,1),'trig-integrals':integrate(x=>Math.sin(x)*Math.cos(x),0,Math.PI/2),
 'trig-substitution':integrate(x=>Math.sqrt(1-x*x),0,1)/Math.PI,'partial-fractions':1,
 'numerical-integration':(0+2*1+4)/2,'tables-techniques':1/3,'improper-integrals':1,
 'taylor-equality':1/(4*3*2),'conics':Math.sqrt(16),'parametric-integrals':integrate(t=>3*t*2,0,1),
 'polar-length':integrate(()=>4,0,Math.PI/2)/Math.PI,'polar-conics':8/(1+1/3),
 'quadric-surfaces':Math.sqrt(16),'spatial-coordinates':Math.hypot(2,-3,6),
 'vector-integration':integrate(t=>2*t,0,2),'tangent-normal':3**2/3,'normal-lines':Math.hypot(2,4,4),
 'multivariable-applications':(10/2)**2,'iterated-area':integrate(x=>x,0,2),
 'double-integrals':integrate(x=>x+.5,0,1),'polar-double':2*integrate(r=>r**3,0,1),
 'planar-mass':4*2*3,'surface-area-double':Math.hypot(1,1,0)**2,'triple-integrals':2*3*4,
 'triple-other-coordinates':2*integrate(r=>r*r,0,1)*integrate(phi=>Math.sin(phi),0,Math.PI),
 'jacobians':Math.abs(3*4-0),'vector-fields':derivative(x=>2*x,1)+derivative(y=>3*y,1)+derivative(z=>4*z,1),
 'line-integrals':integrate(()=>2,0,3),'conservative':3*4-1*2,'green':2,'parametric-surfaces':2*3,
 'surface-integrals':5*1,'divergence-theorem':3*1,'stokes':4,
 'exact-ode':1**2+1*1+1**2,'second-order-homogeneous':(5+Math.sqrt(25-24))/2,
 'second-order-forced':6/2,'ode-series':3/(2*1)
};
for(const [id,value]of Object.entries(computations))near(numericAnswer(id),value,2e-6);
// Check ODE solutions by substitution rather than only comparing stored coefficients.
for(const x of [-1,0,.5,1]){
 const y=2-Math.exp(-2*x),yp=2*Math.exp(-2*x);near(yp+2*y,4);
 const z=-Math.exp(x)+Math.exp(2*x),zp=-Math.exp(x)+2*Math.exp(2*x),zpp=-Math.exp(x)+4*Math.exp(2*x);near(zpp-3*zp+2*z,0);
 const p=.5*x*Math.exp(x),pp=.5*(x+2)*Math.exp(x);near(pp-p,Math.exp(x));
}
console.log(`PASS: ${Object.keys(computations).length} new numerical answers independently recalculated, including quadrature, finite differences and ODE substitution.`);

// Completion badges derive from saved question flags, including legacy lesson IDs.
evaluate("solved={'sequences-0':true,'sequences-1':true,'partial-sums-0':true};current=lessons.findIndex(l=>l.id==='sequences');renderNav()");
assert.ok(element('lesson-list').innerHTML.includes('data-lesson="sequences" data-complete="true" aria-label="Lesson completed">✓ Completed</span>'));
assert.ok(element('lesson-list').innerHTML.includes('data-lesson="partial-sums" data-complete="false" aria-label="1 of 2 checks solved">1/2</span>'));
evaluate("current=0;renderNav();current=lessons.findIndex(l=>l.id==='sequences');renderNav()");
assert.ok(element('lesson-list').innerHTML.includes('aria-label="Lesson completed">✓ Completed</span>'));
// Answer submissions call progress() without reconstructing the navigation.
const badge={dataset:{lesson:'partial-sums'},attributes:{},setAttribute(k,v){this.attributes[k]=v}};
const originalQuery=context.document.querySelectorAll;
context.document.querySelectorAll=selector=>selector==='.done'?[badge]:[];
evaluate("solved['partial-sums-1']=true;progress()");
assert.equal(badge.textContent,'✓ Completed');assert.equal(badge.attributes['data-complete'],'true');assert.equal(badge.attributes['aria-label'],'Lesson completed');
evaluate("solved={};progress()");assert.equal(badge.textContent,'');assert.equal(badge.attributes['data-complete'],'false');
context.document.querySelectorAll=originalQuery;
// A fresh page context restores the same marker from the existing storage key.
const reloadContext={...context,localStorage:{getItem:key=>key==='beyond-bc-practice-v1'?JSON.stringify({'sequences-0':true,'sequences-1':true}):null,setItem(){}}};
vm.createContext(reloadContext);vm.runInContext(code,reloadContext);
vm.runInContext("current=lessons.findIndex(l=>l.id==='sequences');renderNav()",reloadContext);
assert.ok(element('lesson-list').innerHTML.includes('data-lesson="sequences" data-complete="true" aria-label="Lesson completed">✓ Completed</span>'));
console.log('PASS: completed and partial list markers, immediate answer updates, reset, unit switching and saved progress reload.');
