'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const data=id=>JSON.parse(page.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`))[1]);
const lessons=data('lesson-data'),units=data('unit-data');
const fullCode=page.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(fullCode);
const code=fullCode.slice(0,fullCode.indexOf('const initial=lessons.findIndex'));
function harness(saved={}){
 const elements=new Map(),storage=new Map(Object.entries(saved));let forms=[];
 function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,style:{},dataset:{},attributes:{},listeners:{},viewBox:{baseVal:{width:900,height:310}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attributes[k]=v},scrollIntoView(){},focus(){}});return elements.get(id)}
 el('lesson-data').textContent=JSON.stringify(lessons);el('unit-data').textContent=JSON.stringify(units);
 const defaults={'model-data':'linear','model-family':'linear','tangent-function':'square','tangent-a':'1','secant-h':'.5','integral-function':'square','integral-rule':'left','integral-n':'8','series-type':'geometric',terms:'30',ratio:'.5','power-p':'2','taylor-function':'exp',degree:'3','eval-x':'.5','curve-kind':'parabola','curve-t':'0'};
 for(const [id,v]of Object.entries(defaults))el(id).value=v;
 const context={console,document:{getElementById:el,querySelector:()=>el('tabs'),querySelectorAll:s=>s==='[data-question]'?forms:[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{_hash:'',get hash(){return this._hash},set hash(v){this._hash=v&&!v.startsWith('#')?'#'+v:v}},window:{listeners:{},addEventListener(t,f){this.listeners[t]=f},confirm:()=>false}};
 vm.createContext(context);vm.runInContext(code,context);
 return{context,el,storage,run:s=>vm.runInContext(s,context),setForms:x=>forms=x};
}
const h=harness(),{el,run}=h;
function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`)}
assert.deepEqual(units.map(u=>u.id),['P','1','2','3','4','5','6','7','8','9']);
assert.equal(lessons.length,73);assert.equal(lessons.flatMap(l=>l.questions).length,146);assert.equal(units.flatMap(u=>u.sections).length,72);
assert.equal(new Set(lessons.map(l=>l.id)).size,73);
const lesson=id=>lessons.find(l=>l.id===id);
for(const [id,sec]of Object.entries({'business-economics':'3.10','numerical-integration':'4.6','growth-decay':'5.6','separable-logistic':'5.7','inverse-trig-derivatives':'5.8','hyperbolic':'5.10','washers':'6.2','lhopital':'7.7','sequences':'8.1','polar-conics':'9.6'}))assert.ok(lesson(id).sections.includes(sec),id);
assert.equal(lessons.some(l=>['euler','linear-ode'].includes(l.id)),false);
for(const u of units){
 const own=lessons.filter(l=>l.unit===u.id);
 assert.deepEqual(own.map(l=>l.id),u.lessonIds);
 assert.deepEqual([...new Set(own.flatMap(l=>l.sections))].sort(),[...u.sections].sort());
 run(`current=${lessons.indexOf(own[0])};renderLesson()`);assert.equal(el('unit-select').value,u.id);
 for(const l of lessons)assert.equal(el('lesson-list').innerHTML.includes(`href="#${l.id}"`),l.unit===u.id);
 assert.equal(run(`unitCounts(units.find(u=>u.id===${JSON.stringify(u.id)})).total`),own.length*2);
}
assert.equal((el('course-map').innerHTML.match(/<article/g)||[]).length,10);
for(let i=0;i<lessons.length;i++){
 const l=lessons[i];
 for(const key of ['goal','idea','formula','trap','challenge','solution'])assert.ok(l[key]?.length>0,l.id+' '+key);
 assert.ok(l.steps.length>=4,l.id);assert.equal(l.questions.length,2);
 run(`current=${i};renderLesson()`);assert.ok(el('lesson').innerHTML.includes(l.title));
 assert.equal((el('lesson').innerHTML.match(/data-question=/g)||[]).length,2);
 if(l.lab)assert.ok(page.includes(`id="${l.lab}"`),l.id+' missing lab');
 // Exercise each submit handler with the authored answer, then an incorrect retry.
 const forms=l.questions.map((q,j)=>({dataset:{question:String(j)},listeners:{},elements:{answer:{value:String(q.answer)}},picked:{value:String(q.answer)},querySelector(){return this.picked},addEventListener(t,f){this.listeners[t]=f}}));
 h.setForms(forms);run(`current=${i};renderLesson()`);
 for(const [j,q]of l.questions.entries()){
  assert.ok(q.hint&&q.explain);
  if(q.options)assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);else assert.ok(Number.isFinite(q.answer));
  forms[j].listeners.submit({preventDefault(){}});assert.equal(run(`solved[${JSON.stringify(l.id+'-'+j)}]`),true);
  assert.ok(el('feedback-'+j).textContent.startsWith('Correct.'));
  if(q.options)forms[j].picked.value=String((q.answer+1)%q.options.length);else forms[j].elements.answer.value=String(q.answer+10);
  forms[j].listeners.submit({preventDefault(){}});assert.ok(el('feedback-'+j).textContent.startsWith('Not quite.'));assert.equal(run(`solved[${JSON.stringify(l.id+'-'+j)}]`),true);
 }
 h.setForms([]);
}
assert.equal(JSON.parse(h.storage.get('larson-single-variable-6e-practice-v1'))['business-economics-0'],true);
near(run('numericValue("5/2")'),2.5);near(run('numericValue("−1/4")'),-.25);
for(const bad of ['1/0','Infinity','NaN','2+3','1/2/3','<script>','1e999'])assert.equal(run(`numericValue(${JSON.stringify(bad)})`),null);
run('current=0;renderLesson()');assert.ok(el('example-steps').innerHTML.includes('hidden'));el('reveal-step').onclick();assert.ok(el('step-status').textContent.startsWith('2 of '));el('reveal-all').onclick();assert.equal(el('reveal-step').disabled,true);el('restart-example').onclick();assert.ok(el('step-status').textContent.startsWith('1 of '));
run("solved={'sequences-0':true,'sequences-1':true,'partial-sums-0':true};current=lessons.findIndex(l=>l.id==='sequences');renderNav()");
assert.ok(el('lesson-list').innerHTML.includes('aria-label="Lesson completed">✓ Completed</span>'));assert.ok(el('lesson-list').innerHTML.includes('aria-label="1 of 2 checks solved">1/2</span>'));
run("current=0;renderNav();current=lessons.findIndex(l=>l.id==='sequences');renderNav()");assert.ok(el('lesson-list').innerHTML.includes('✓ Completed'));
// A same-hash map selection must leave the course map and return to the lesson.
h.context.location.hash='#sequences';run("showView('plan');navigate(lessons.findIndex(l=>l.id==='sequences'))");assert.equal(el('panel-learn').hidden,false);assert.equal(el('panel-plan').hidden,true);
el('unit-select').listeners.change({target:{value:'5'}});assert.equal(h.context.location.hash,'#'+units[5].lessonIds[0]);
h.context.window.listeners.hashchange();assert.equal(el('unit-select').value,'5');
const format='larson-single-variable-6e-progress';
run("solved={'sequences-0':true}");
const backup=JSON.stringify({format,version:1,solved:{'sequences-0':false,'partial-sums-1':true,'unrecognized-0':true}});
const merged=run(`mergeProgressBackup(${JSON.stringify(backup)})`);assert.equal(merged.count,1);assert.equal(merged.skipped,1);assert.equal(run("solved['sequences-0']"),true);
const exported=run('JSON.stringify(progressBackup())');assert.equal(JSON.parse(exported).format,format);
for(const bad of ['{','null','[]','{}',JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'power-0':true}}),JSON.stringify({format:'larson-single-variable-9e-progress',version:1,solved:{'power-0':true}}),JSON.stringify({format,version:2,solved:{}}),JSON.stringify({format,version:1,solved:{'power-0':true,'taylor-0':'yes'}}),' '.repeat(1048577)]){
 assert.throws(()=>run(`mergeProgressBackup(${JSON.stringify(bad)})`));assert.equal(run("solved['power-0']"),undefined);assert.equal(run("solved['sequences-0']"),true);
}
h.context.localStorage.setItem=()=>{throw Error('unavailable')};assert.equal(run(`mergeProgressBackup(${JSON.stringify(exported)})`).saved,false);
const reload=harness({'larson-single-variable-6e-practice-v1':JSON.stringify({'sequences-0':true,'sequences-1':true}),'beyond-bc-practice-v1':JSON.stringify({'fit-linear-0':true})});
reload.run("current=lessons.findIndex(l=>l.id==='sequences');renderNav()");assert.ok(reload.el('lesson-list').innerHTML.includes('✓ Completed'));assert.equal(reload.run("solved['fit-linear-0']"),undefined);
const blocked=harness();blocked.context.localStorage.setItem=()=>{throw Error('blocked')};assert.equal(blocked.run('persist()'),false);blocked.run('renderLesson()');
console.log('PASS: 10 units, 72 section mappings, 73 lessons, all 146 quiz submissions, reveal controls, completion badges, chapter navigation, separate saved progress, and transactional backup checks.');
// Numerical checks for fitting models, marginal analysis, derivatives and integral rules.
const points=[[0,1],[1,2],[2,5]];const fit=run(`fitModel(${JSON.stringify(points)},'linear')`);near(fit.coefficients[0],2/3);near(fit.coefficients[1],2);near(fit.sse,2/3);near(fit.residuals.reduce((s,p)=>s+p[1],0),0);
const quadratic=run("fitModel([[0,2],[1,5],[2,12]],'quadratic')");[2,1,2].forEach((x,i)=>near(quadratic.coefficients[i],x));near(quadratic.predict(3),23);
const seasonal=Array.from({length:12},(_,x)=>[x,14+4*Math.cos(2*Math.PI*(x-3)/12)]);const periodic=run(`fitModel(${JSON.stringify(seasonal)},'periodic')`);near(periodic.sse,0);near(periodic.predict(3),18);near(periodic.predict(9),10);
assert.equal(run("fitModel([[1,2],[1,3]],'linear')"),null);
near(lesson('fit-linear').questions[0].answer,(5-1)/(2-0));near(lesson('fit-quadratic').questions[0].answer,(5-2*2+1)/2);near(lesson('fit-periodic').questions[0].answer,(20-8)/2);
const profit=q=>q*(60-q)-(100+10*q),optimum=lesson('business-economics').questions[0].answer;near(profit(optimum),525);for(let q=0;q<=60;q++)assert.ok(profit(q)<=profit(optimum));
let plots=0;
for(const dataset of ['linear','quadratic','periodic'])for(const family of ['linear','quadratic','periodic']){el('model-data').value=dataset;el('model-family').value=family;run('drawModels()');for(const id of ['model-chart','residual-chart']){assert.ok(el(id).innerHTML.includes('<path'));assert.ok(!/NaN|Infinity/.test(el(id).innerHTML));plots++}}
for(const kind of ['square','sin','exp'])for(const a of [-2,0,2])for(const step of [.02,.5,1]){
 const d=run(`tangentState('${kind}',${a},${step})`),expected=kind==='square'?2*a:kind==='sin'?Math.cos(a):Math.exp(a);near(d.derivative,expected);
 const fine=run(`tangentState('${kind}',${a},0.000001)`);near(fine.secant,expected,5e-6);
 el('tangent-function').value=kind;el('tangent-a').value=String(a);el('secant-h').value=String(step);run('drawTangent()');assert.ok(!/NaN|Infinity/.test(el('tangent-chart').innerHTML));plots++;
}
for(const kind of ['square','sin','exp'])for(const rule of ['left','right','midpoint','trapezoid','simpson'])for(const n of [2,8,40]){
 el('integral-function').value=kind;el('integral-rule').value=rule;el('integral-n').value=String(n);run('drawAccumulation()');assert.ok(!/NaN|Infinity/.test(el('accumulation-chart').innerHTML));plots++;
 const value=run(`integralEstimate('${kind}','${rule}',${n})`);assert.ok(Number.isFinite(value));if(kind==='square'&&rule==='simpson')near(value,8/3);
}
near(run("integralEstimate('square','left',2)"),1);near(run("integralEstimate('square','right',2)"),5);near(run("integralEstimate('square','midpoint',2)"),2.5);near(run("integralEstimate('square','trapezoid',2)"),3);
assert.throws(()=>run("integralEstimate('square','simpson',3)"));
for(const kind of ['square','sin','exp'])near(run(`integralEstimate('${kind}','simpson',100)`),run(`integralProblem('${kind}').exact`),2e-8);
let bounds=0;
for(const kind of ['exp','sin','cos'])for(let n=0;n<=12;n++)for(let k=-60;k<=60;k++){
 const x=k/20,approx=run(`taylor('${kind}',${n},${x})`),exact=Math[kind](x),M=kind==='exp'?Math.exp(Math.max(0,x)):1,bound=M*Math.abs(x)**(n+1)/run(`factorial(${n+1})`);assert.ok(Math.abs(exact-approx)<=bound+1e-10);bounds++;
}
for(const type of ['geometric','harmonic','alternating','p'])for(const n of [2,30,200])for(const r of [-1.1,-1,-.5,0,.5,1,1.1]){el('series-type').value=type;el('terms').value=String(n);el('ratio').value=String(r);run('drawSeries()');for(const id of ['terms-chart','sums-chart']){assert.ok(!/NaN|Infinity/.test(el(id).innerHTML));plots++}}
for(const kind of ['exp','sin','cos'])for(const n of [0,1,3,12]){el('taylor-function').value=kind;el('degree').value=String(n);run('drawTaylor()');assert.ok(!/NaN|Infinity/.test(el('taylor-chart').innerHTML));plots++}
for(const kind of ['parabola','circle','cardioid'])for(const t of [-Math.PI,-1,0,1,Math.PI]){
 const d=run(`curveState('${kind}',${t})`),e=1e-5,before=run(`curveState('${kind}',${t-e})`),after=run(`curveState('${kind}',${t+e})`);near(d.dx,(after.x-before.x)/(2*e),1e-8);near(d.dy,(after.y-before.y)/(2*e),1e-8);
 el('curve-kind').value=kind;el('curve-t').value=String(t);run('drawCurve()');assert.ok(!/NaN|Infinity/.test(el('curve-chart').innerHTML));plots++;
}
run("showView('labs')");assert.equal(el('panel-labs').hidden,false);
console.log(`PASS: regression fits, residuals, profit optimization, tangent limits, numerical integration rules, ${bounds} Taylor error bounds, and ${plots} SVG lab renders.`);
