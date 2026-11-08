'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const meta=JSON.parse(fs.readFileSync(path.join(__dirname,'course.json'),'utf8'));
const page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const data=id=>JSON.parse(page.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`))[1]);
const lessons=data('lesson-data'),units=data('unit-data'),frqs=data('frq-data');
const fullCode=page.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(fullCode);
const code=fullCode.slice(0,fullCode.indexOf('const initial=lessons.findIndex'));
function harness(saved={}){
 const elements=new Map(),storage=new Map(Object.entries(saved));let forms=[],badges=[];
 function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,style:{},dataset:{},attributes:{},listeners:{},viewBox:{baseVal:{width:900,height:310}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attributes[k]=v},scrollIntoView(){},focus(){}});return elements.get(id)}
 el('lesson-data').textContent=JSON.stringify(lessons);el('unit-data').textContent=JSON.stringify(units);el('frq-data').textContent=JSON.stringify(frqs);
 const source=fs.readFileSync(path.join(__dirname,'labs.html'),'utf8');
 for(const m of source.matchAll(/<input id="([^"]+)"[^>]*value="([^"]+)"/g))el(m[1]).value=m[2];
 const context={console,document:{getElementById:el,querySelector:()=>el('tabs'),querySelectorAll:s=>s==='[data-question]'?forms:s==='.done'?badges:[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{_hash:'',get hash(){return this._hash},set hash(v){this._hash=v&&!v.startsWith('#')?'#'+v:v}},window:{listeners:{},addEventListener(t,f){this.listeners[t]=f},confirm:()=>false}};
 vm.createContext(context);vm.runInContext(code,context);
 return{context,el,storage,run:s=>vm.runInContext(s,context),setForms:x=>forms=x,setBadges:x=>badges=x};
}
const h=harness(),{el,run}=h;
function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`)}
assert.deepEqual(units.map(u=>u.id),Array.from({length:meta.units},(_,i)=>String(i+1)));
assert.equal(lessons.length,meta.lessons);assert.equal(lessons.flatMap(l=>l.questions).length,meta.lessons*2);assert.equal(new Set(lessons.map(l=>l.id)).size,meta.lessons);
for(const u of units){
 const own=lessons.filter(l=>l.unit===u.id);assert.deepEqual(own.map(l=>l.id),u.lessonIds);
 assert.deepEqual([...new Set(own.flatMap(l=>l.sections))].sort((a,b)=>Number(a.split(".")[1])-Number(b.split(".")[1])),u.sections);
 run(`current=${lessons.indexOf(own[0])};renderLesson()`);assert.equal(el('unit-select').value,u.id);
 for(const l of lessons)assert.equal(el('lesson-list').innerHTML.includes(`href="#${l.id}"`),l.unit===u.id);
 assert.ok(el('unit-summary').innerHTML.includes('<svg'));assert.equal(run(`unitCounts(units.find(u=>u.id==='${u.id}')).total`),own.length*2);
}
assert.equal((el('course-map').innerHTML.match(/<article/g)||[]).length,meta.units);
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
assert.equal(JSON.parse(h.storage.get('ap-macroeconomics-practice-v1'))['macro-1-1-0'],true);assert.equal(h.storage.has('larson-single-variable-6e-practice-v1'),false);
near(run('numericValue("1/4")'),.25);near(run('numericValue("−2.493")'),-2.493);for(const bad of ['1/0','Infinity','NaN','2+3','<script>','1e999'])assert.equal(run(`numericValue(${JSON.stringify(bad)})`),null);
run('current=0;renderLesson()');el('reveal-step').onclick();assert.ok(el('step-status').textContent.startsWith('2 of '));el('reveal-all').onclick();assert.equal(el('reveal-step').disabled,true);el('restart-example').onclick();assert.ok(el('step-status').textContent.startsWith('1 of '));
run("solved={'macro-1-1-0':true,'macro-1-1-1':true,'macro-1-2-0':true};current=0;renderNav()");assert.ok(el('lesson-list').innerHTML.includes('aria-label="Lesson completed">✓ Completed</span>'));assert.ok(el('lesson-list').innerHTML.includes('aria-label="1 of 2 checks solved">1/2</span>'));
run('current=20;renderNav();current=0;renderNav()');assert.ok(el('lesson-list').innerHTML.includes('✓ Completed'));
const badge={dataset:{lesson:'macro-1-2'},attributes:{},setAttribute(k,v){this.attributes[k]=v}};h.setBadges([badge]);run("solved['macro-1-2-1']=true;progress()");assert.equal(badge.textContent,'✓ Completed');assert.equal(badge.attributes['data-complete'],'true');h.setBadges([]);
h.context.location.hash='#macro-1-1';run("showView('plan');navigate(0)");assert.equal(el('panel-learn').hidden,false);assert.equal(el('panel-plan').hidden,true);
el('unit-select').listeners.change({target:{value:'5'}});assert.equal(h.context.location.hash,'#'+units[4].lessonIds[0]);h.context.window.listeners.hashchange();assert.equal(el('unit-select').value,'5');
const format='ap-macroeconomics-progress';run("solved={'macro-1-1-0':true}");
const backup=JSON.stringify({format,version:1,solved:{'macro-1-1-0':false,'macro-1-2-1':true,'unrecognized-0':true}}),merged=run(`mergeProgressBackup(${JSON.stringify(backup)})`);assert.equal(merged.count,1);assert.equal(merged.skipped,1);assert.equal(run("solved['macro-1-1-0']"),true);
const exported=run('JSON.stringify(progressBackup())');assert.equal(JSON.parse(exported).format,format);assert.equal(JSON.parse(exported).version,1);assert.ok(!exported.includes('response'));
for(const bad of ['{','null','[]','{}',JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'macro-1-3-0':true}}),JSON.stringify({format:'larson-single-variable-6e-progress',version:1,solved:{'macro-1-3-0':true}}),JSON.stringify({format,version:2,solved:{}}),JSON.stringify({format,version:1,solved:{'macro-1-3-0':true,'macro-1-4-0':'yes'}}),' '.repeat(1048577)]){
 assert.throws(()=>run(`mergeProgressBackup(${JSON.stringify(bad)})`));assert.equal(run("solved['macro-1-3-0']"),undefined);assert.equal(run("solved['macro-1-1-0']"),true);
}
h.context.localStorage.setItem=()=>{throw Error('unavailable')};assert.equal(run(`mergeProgressBackup(${JSON.stringify(exported)})`).saved,false);
const reload=harness({'ap-macroeconomics-practice-v1':JSON.stringify({'macro-1-1-0':true,'macro-1-1-1':true}),'larson-single-variable-6e-practice-v1':JSON.stringify({'macro-1-2-0':true})});reload.run('current=0;renderNav()');assert.ok(reload.el('lesson-list').innerHTML.includes('✓ Completed'));assert.equal(reload.run("solved['macro-1-2-0']"),undefined);
const blocked=harness();blocked.context.localStorage.setItem=()=>{throw Error('blocked')};assert.equal(blocked.run('persist()'),false);blocked.run('renderLesson()');
assert.equal(frqs.length,meta.units);assert.equal((el('frq-list').innerHTML.match(/<textarea/g)||[]).length,meta.units);for(const f of frqs){assert.equal(f.prompts.length,4);assert.equal(f.criteria.length,4);assert.ok(f.context.length>0)}
console.log(`PASS: ${meta.lessons} lessons, ${meta.lessons*2} quiz submissions, ${meta.units} unit maps and drills, completion badges, navigation and isolated backups.`);

const topicCounts=meta.short==='micro'?[6,9,7,5,4,5]:meta.short==='macro'?[6,7,9,7,7,6]:[11,7,9,9,17,13,8,15,10];
for(const [i,u]of units.entries())assert.deepEqual(u.sections,Array.from({length:topicCounts[i]},(_,j)=>`${i+1}.${j+1}`));
for(const l of lessons){assert.ok(l.idea.length>200,l.id);assert.equal(l.questions[0].options.length,4);assert.ok(l.questions[0].options.includes(l.questions[0].explain));}
const expected={
 micro:[24,20/5,18/6,24/6,(90-10)/2,12/4,.5*6*10,120-45,(40+60)/10,500-350-100,(9-11)*20,(12-12)*30,(80-20)/2,18-11,4+4,(9-6)*50,8*4,80-65,4*18,84-60,18+7,9+6,11-4,120/600*100],
 macro:[18/6,24/8,90-70,20+(100-20)/2,400+80+120+50-70,10/(240+10)*100,(210-200)/200*100,(960-1000)/1000*100,1/(1-.8),(1000-950)/1000*100,800-740,200/5,8-3,1/.25,5-3,6-2,7-4,7-3,450-390,1800/150,140-175,50*1.2,5-2,75-95],
 apes:[90/30,70-45,2400-1500,20000*.1*.1,20/80*100,18+4-3,55-30,(39-15)/4,100/500*100,40+10-25-5,900/3000*100,(22-7)/10,20/2,100-45-35,600/3,180-240,2000+300-450,720/900*100,(100-25)/100*100,60000/300,2*3,.4*500,5*100*.2,(800-600)/800*100,(80-8)/80*100,120/40,150*(1-.8),10**(10/10),3*2000,4/.5,(250-50)/250*100,8/4,(200-40)/200*100,16.5-15,8.3-8,(150-200)/200*100]
}[meta.short];
assert.equal(expected.length,lessons.length);for(const [i,n]of expected.entries())near(lessons[i].questions[1].answer,n,1e-8);
const labs=fs.readFileSync(path.join(__dirname,'labs.html'),'utf8');let renders=0;
const modelIds=[...labs.matchAll(/<section class="lab" id="([^"]+)"/g)].map(m=>m[1]);assert.equal(modelIds.length,3);
for(const id of modelIds){
 const section=labs.split(`id="${id}"`)[1].split('</section>')[0];
 const inputs=[...section.matchAll(/<input id="([^"]+)"[^>]*min="([^"]+)" max="([^"]+)"[^>]*value="([^"]+)"/g)];assert.equal(inputs.length,2);
 for(const a of [Number(inputs[0][2]),Number(inputs[0][4]),Number(inputs[0][3])])for(const b of [Number(inputs[1][2]),Number(inputs[1][4]),Number(inputs[1][3])]){
  el(inputs[0][1]).value=String(a);el(inputs[1][1]).value=String(b);run(`draw_${id}()`);const svg=el(id+'-chart').innerHTML;
  assert.ok(svg.includes('<path'));assert.ok(!/NaN|Infinity|undefined/.test(svg),id);assert.ok(el(id+'-result').textContent.length>20);renders++;
 }
}
if(meta.short==='micro'){
 near(run('model_market(0,0).q'),40);near(run('model_market(20,0).q'),30);near(run('model_market(20,0).revenue'),600);near(run('model_market(20,0).dwl'),100);
 near(run('model_market(20,0).pb-model_market(20,0).ps'),20);
 near(run('model_firm(12,40).q'),10);near(run('model_firm(12,80).q'),10);near(run('model_firm(0,40).profit'),-40);near(run('model_firm(12,40).profit'),10);
 near(run('model_external(10,10).marketQ'),run('model_external(10,10).socialQ'));assert.ok(run('model_external(20,0).marketQ')>run('model_external(20,0).socialQ'));
}else if(meta.short==='macro'){
 near(run('model_adas(0,0).y'),100);assert.ok(run('model_adas(10,0).p')>run('model_adas(0,0).p'));assert.ok(run('model_adas(0,10).y')<100);assert.ok(run('model_adas(0,10).p')>run('model_adas(0,0).p'));
 near(run('model_multiplier(.75,20).total'),80);near(run('model_multiplier(0,20).total'),20);assert.ok(run('model_multiplier(.75,20).series[0].data.at(-1)[1]')<80);
 near(run('model_forex(0,50).e'),1.2);near(run('model_forex(0,50).foreignCost'),60);assert.ok(run('model_forex(.2,50).e')>1.2);
}else{
 near(run('model_energy(10000,10).secondary'),100);near(run('model_growth(200,0).n'),20);assert.ok(run('model_growth(200,25).n')<200);assert.ok(run('model_growth(200,25).exponential')>200);
 near(run('model_runoff(20,50).volume'),110);near(run('model_runoff(0,50).volume'),0);assert.ok(run('model_runoff(20,100).volume')>run('model_runoff(20,0).volume'));
}
run("showView('labs')");assert.equal(el('panel-labs').hidden,false);
console.log(`PASS: all numeric quiz answers independently checked, topic-reference completeness, model invariants and ${renders} chart renders. No visual browser QA.`);

assert.throws(()=>run('parseProgressBackup('+JSON.stringify(JSON.stringify({format:'ap-french-progress',version:1,solved:{}}))+')'));
