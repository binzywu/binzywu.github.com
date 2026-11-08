'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const data=id=>JSON.parse(page.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`))[1]);
const lessons=data('lesson-data'),units=data('unit-data'),frqs=data('frq-data');
const fullCode=page.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(fullCode);
const code=fullCode.slice(0,fullCode.indexOf('const initial=lessons.findIndex'));
function harness(saved={}){
 const elements=new Map(),storage=new Map(Object.entries(saved));let forms=[],badges=[];
 function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,style:{},dataset:{},attributes:{},listeners:{},viewBox:{baseVal:{width:900,height:310}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attributes[k]=v},scrollIntoView(){},focus(){}});return elements.get(id)}
 el('lesson-data').textContent=JSON.stringify(lessons);el('unit-data').textContent=JSON.stringify(units);el('frq-data').textContent=JSON.stringify(frqs);
 const defaults={'osm-in':'.3','osm-out':'.1','osm-pressure':'0','enzyme-s':'5','enzyme-km':'4','enzyme-alpha':'1','parent-one':'Aa','parent-two':'Aa','allele-p':'.6','fitness-aa-upper':'1','fitness-het':'1','fitness-aa-lower':'1','pop-r':'.15','pop-k':'200','pop-time':'10','chi-prob':'.5','chi-observed':'50'};
 for(const [id,v]of Object.entries(defaults))el(id).value=v;
 const context={console,document:{getElementById:el,querySelector:()=>el('tabs'),querySelectorAll:s=>s==='[data-question]'?forms:s==='.done'?badges:[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{_hash:'',get hash(){return this._hash},set hash(v){this._hash=v&&!v.startsWith('#')?'#'+v:v}},window:{listeners:{},addEventListener(t,f){this.listeners[t]=f},confirm:()=>false}};
 vm.createContext(context);vm.runInContext(code,context);
 return{context,el,storage,run:s=>vm.runInContext(s,context),setForms:x=>forms=x,setBadges:x=>badges=x};
}
const h=harness(),{el,run}=h;
function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`)}
assert.deepEqual(units.map(u=>u.id),['1','2','3','4','5','6','7','8']);assert.deepEqual(units.map(u=>u.sections.length),[7,10,5,6,5,8,12,7]);
assert.equal(lessons.length,60);assert.equal(lessons.flatMap(l=>l.questions).length,120);assert.equal(new Set(lessons.map(l=>l.id)).size,60);
for(const u of units){
 const own=lessons.filter(l=>l.unit===u.id);assert.deepEqual(own.map(l=>l.id),u.lessonIds);
 assert.deepEqual(own.flatMap(l=>l.sections),u.sections);
 run(`current=${lessons.indexOf(own[0])};renderLesson()`);assert.equal(el('unit-select').value,u.id);
 for(const l of lessons)assert.equal(el('lesson-list').innerHTML.includes(`href="#${l.id}"`),l.unit===u.id);
 assert.ok(el('unit-summary').innerHTML.includes('<svg'));assert.equal(run(`unitCounts(units.find(u=>u.id==='${u.id}')).total`),own.length*2);
}
assert.equal((el('course-map').innerHTML.match(/<article/g)||[]).length,8);
for(let i=0;i<lessons.length;i++){
 const l=lessons[i];for(const key of ['goal','idea','formula','trap','challenge','solution','skill'])assert.ok(l[key]?.length>0,l.id+' '+key);
 assert.ok(l.steps.length>=4,l.id);assert.equal(l.questions.length,2);
 run(`current=${i};renderLesson()`);assert.ok(el('lesson').innerHTML.includes(l.title));assert.equal((el('lesson').innerHTML.match(/data-question=/g)||[]).length,2);
 if(l.lab)assert.ok(page.includes(`id="${l.lab}"`),l.id+' missing lab');
 const forms=l.questions.map((q,j)=>({dataset:{question:String(j)},listeners:{},elements:{answer:{value:String(q.answer)}},picked:{value:String(q.answer)},querySelector(){return this.picked},addEventListener(t,f){this.listeners[t]=f}}));h.setForms(forms);run(`current=${i};renderLesson()`);
 for(const [j,q]of l.questions.entries()){
  assert.ok(q.hint&&q.explain);if(q.options)assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);else assert.ok(Number.isFinite(q.answer));
  forms[j].listeners.submit({preventDefault(){}});assert.equal(run(`solved[${JSON.stringify(l.id+'-'+j)}]`),true);assert.ok(el('feedback-'+j).textContent.startsWith('Correct.'));
  if(q.options)forms[j].picked.value=String((q.answer+1)%q.options.length);else forms[j].elements.answer.value=String(q.answer+10);
  forms[j].listeners.submit({preventDefault(){}});assert.ok(el('feedback-'+j).textContent.startsWith('Not quite.'));assert.equal(run(`solved[${JSON.stringify(l.id+'-'+j)}]`),true);
 }
 h.setForms([]);
}
assert.equal(JSON.parse(h.storage.get('ap-biology-practice-v1'))['bio-1-1-0'],true);assert.equal(h.storage.has('larson-single-variable-6e-practice-v1'),false);
near(run('numericValue("1/4")'),.25);near(run('numericValue("−2.493")'),-2.493);for(const bad of ['1/0','Infinity','NaN','2+3','<script>','1e999'])assert.equal(run(`numericValue(${JSON.stringify(bad)})`),null);
run('current=0;renderLesson()');el('reveal-step').onclick();assert.ok(el('step-status').textContent.startsWith('2 of '));el('reveal-all').onclick();assert.equal(el('reveal-step').disabled,true);el('restart-example').onclick();assert.ok(el('step-status').textContent.startsWith('1 of '));
run("solved={'bio-1-1-0':true,'bio-1-1-1':true,'bio-1-2-0':true};current=0;renderNav()");assert.ok(el('lesson-list').innerHTML.includes('aria-label="Lesson completed">✓ Completed</span>'));assert.ok(el('lesson-list').innerHTML.includes('aria-label="1 of 2 checks solved">1/2</span>'));
run('current=20;renderNav();current=0;renderNav()');assert.ok(el('lesson-list').innerHTML.includes('✓ Completed'));
const badge={dataset:{lesson:'bio-1-2'},attributes:{},setAttribute(k,v){this.attributes[k]=v}};h.setBadges([badge]);run("solved['bio-1-2-1']=true;progress()");assert.equal(badge.textContent,'✓ Completed');assert.equal(badge.attributes['data-complete'],'true');h.setBadges([]);
h.context.location.hash='#bio-1-1';run("showView('plan');navigate(0)");assert.equal(el('panel-learn').hidden,false);assert.equal(el('panel-plan').hidden,true);
el('unit-select').listeners.change({target:{value:'5'}});assert.equal(h.context.location.hash,'#'+units[4].lessonIds[0]);h.context.window.listeners.hashchange();assert.equal(el('unit-select').value,'5');
const format='ap-biology-progress';run("solved={'bio-1-1-0':true}");
const backup=JSON.stringify({format,version:1,solved:{'bio-1-1-0':false,'bio-1-2-1':true,'unrecognized-0':true}}),merged=run(`mergeProgressBackup(${JSON.stringify(backup)})`);assert.equal(merged.count,1);assert.equal(merged.skipped,1);assert.equal(run("solved['bio-1-1-0']"),true);
const exported=run('JSON.stringify(progressBackup())');assert.equal(JSON.parse(exported).format,format);assert.equal(JSON.parse(exported).version,1);assert.ok(!exported.includes('response'));
for(const bad of ['{','null','[]','{}',JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'bio-1-3-0':true}}),JSON.stringify({format:'larson-single-variable-6e-progress',version:1,solved:{'bio-1-3-0':true}}),JSON.stringify({format,version:2,solved:{}}),JSON.stringify({format,version:1,solved:{'bio-1-3-0':true,'bio-1-4-0':'yes'}}),' '.repeat(1048577)]){
 assert.throws(()=>run(`mergeProgressBackup(${JSON.stringify(bad)})`));assert.equal(run("solved['bio-1-3-0']"),undefined);assert.equal(run("solved['bio-1-1-0']"),true);
}
h.context.localStorage.setItem=()=>{throw Error('unavailable')};assert.equal(run(`mergeProgressBackup(${JSON.stringify(exported)})`).saved,false);
const reload=harness({'ap-biology-practice-v1':JSON.stringify({'bio-1-1-0':true,'bio-1-1-1':true}),'larson-single-variable-6e-practice-v1':JSON.stringify({'bio-1-2-0':true})});reload.run('current=0;renderNav()');assert.ok(reload.el('lesson-list').innerHTML.includes('✓ Completed'));assert.equal(reload.run("solved['bio-1-2-0']"),undefined);
const blocked=harness();blocked.context.localStorage.setItem=()=>{throw Error('blocked')};assert.equal(blocked.run('persist()'),false);blocked.run('renderLesson()');
assert.equal(frqs.length,8);assert.equal((el('frq-list').innerHTML.match(/<textarea/g)||[]).length,8);for(const f of frqs){assert.equal(f.prompts.length,4);assert.equal(f.criteria.length,4);assert.ok(f.context.length>0)}
console.log('PASS: all 60 lessons, 120 quiz submissions, eight unit diagrams and written drills, completion badges, navigation, isolated saved progress and backup validation.');
// Independent numerical answers and biological model invariants.
const numeric={ 'bio-1-3':6-1,'bio-2-2':6/3,'bio-2-7':-.1*.0831*300,'bio-3-3':10-24,'bio-4-5':40/200*100,'bio-5-1':10/2,'bio-5-2':2**4,'bio-5-3':.5*.5,'bio-5-4':2/4,'bio-6-2':2**2,'bio-6-4':12,'bio-6-8':2**4,'bio-7-4':(2*40+40)/200,'bio-7-5':2*.7*.3,'bio-8-2':1000-400,'bio-8-3':.2*100*(1-100/500),'bio-8-6':5};
for(const [id,value]of Object.entries(numeric)){const q=lessons.find(l=>l.id===id).questions.find(q=>!q.options);near(q.answer,value)}
assert.equal(lessons.flatMap(l=>l.questions).filter(q=>!q.options).length,Object.keys(numeric).length);
near(run('waterState(.3,.1,0).soluteInside'),-.3*.0831*298);assert.equal(run('waterState(.3,.1,0).direction'),'inward');assert.equal(run('waterState(.1,.3,0).direction'),'outward');assert.equal(run('waterState(.3,.3,0).direction'),'balanced');assert.equal(run('waterState(.3,.1,8).direction'),'outward');
near(run('enzymeRate(4,4,1)'),50);near(run('enzymeRate(0,4,2)'),0);for(const S of [0,1,5,20])assert.ok(run(`enzymeRate(${S},4,3)` )<=run(`enzymeRate(${S},4,1)`)+1e-12);
for(const a of ['AA','Aa','aa'])for(const b of ['AA','Aa','aa']){const c=run(`crossGenotypes('${a}','${b}')`);near(c.AA+c.Aa+c.aa,1)}near(run("crossGenotypes('Aa','Aa').aa"),.25);near(run("crossGenotypes('AA','aa').Aa"),1);
for(const p of [0,.1,.5,.9,1]){const d=run(`selectionState(${p},1,1,1)`);near(d.before.reduce((a,b)=>a+b,0),1);near(d.after.reduce((a,b)=>a+b,0),1);near(d.nextP,p)}
assert.ok(run('selectionState(.5,1,.8,.2).nextP')>.5);assert.throws(()=>run('selectionState(.5,0,0,0)'));
near(run('populationState(.2,200,0).logistic'),20);near(run('populationState(0,200,10).logistic'),20);near(run('populationState(0,200,10).exponential'),20);assert.ok(run('populationState(.2,200,20).logistic')<200);
near(run('chiSquare([50,50],[50,50])'),0);near(run('chiSquare([60,40],[50,50])'),4);near(run('chiSquare([62,18],[60,20])'),4/60+4/20);assert.throws(()=>run('chiSquare([1],[0])'));
let plots=0;
function checkSVG(id){assert.ok(el(id).innerHTML.length>0,id);assert.ok(!/NaN|Infinity/.test(el(id).innerHTML),id);plots++}
for(const a of [0,.3,.8])for(const b of [0,.1,.8])for(const p of [0,4,8]){el('osm-in').value=String(a);el('osm-out').value=String(b);el('osm-pressure').value=String(p);run('drawOsmosis()');checkSVG('osmosis-chart')}
for(const S of [0,5,20])for(const Km of [1,4,10])for(const alpha of [1,3,5]){el('enzyme-s').value=String(S);el('enzyme-km').value=String(Km);el('enzyme-alpha').value=String(alpha);run('drawEnzyme()');checkSVG('enzyme-chart')}
for(const a of ['AA','Aa','aa'])for(const b of ['AA','Aa','aa']){el('parent-one').value=a;el('parent-two').value=b;run('drawPunnett()');assert.equal((el('punnett-grid').innerHTML.match(/<td>/g)||[]).length,4)}
for(const p of [0,.2,.5,.8,1])for(const w of [.1,.5,1]){el('allele-p').value=String(p);el('fitness-aa-upper').value=String(w);run('drawAlleles()');checkSVG('allele-chart')}
for(const r of [0,.1,.3])for(const K of [40,200,500])for(const t of [0,10,30]){el('pop-r').value=String(r);el('pop-k').value=String(K);el('pop-time').value=String(t);run('drawPopulation()');checkSVG('population-chart')}
for(const p of [.25,.5,.75])for(const observed of [0,25,50,75,100]){el('chi-prob').value=String(p);el('chi-observed').value=String(observed);run('drawChi()');checkSVG('chi-chart')}
el('chi-prob').value='.5';el('chi-observed').value='60';run('drawChi()');assert.ok(el('chi-result').innerHTML.includes('Reject the fixed-probability'));el('chi-observed').value='50';run('drawChi()');assert.ok(el('chi-result').innerHTML.includes('Fail to reject'));
run("showView('labs')");assert.equal(el('panel-labs').hidden,false);
console.log(`PASS: all ${Object.keys(numeric).length} numerical quiz answers independently checked, model invariants, nine crosses, and ${plots} SVG lab renders.`);
