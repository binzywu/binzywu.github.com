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
 const context={console,setInterval:()=>1,clearInterval:()=>{},document:{getElementById:el,querySelector:()=>el('tabs'),querySelectorAll:s=>s==='[data-question]'?forms:s==='.done'?badges:[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{_hash:'',get hash(){return this._hash},set hash(v){this._hash=v&&!v.startsWith('#')?'#'+v:v}},window:{listeners:{},addEventListener(t,f){this.listeners[t]=f},confirm:()=>false}};
 vm.createContext(context);vm.runInContext(code,context);
 return{context,el,storage,run:s=>vm.runInContext(s,context),setForms:x=>forms=x,setBadges:x=>badges=x};
}
const h=harness(),{el,run}=h;
function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`)}
assert.deepEqual(units.map(u=>u.id),['1','2','3','4','5','6']);assert.deepEqual(units.map(u=>u.sections.length),[7,7,7,7,7,7]);
assert.equal(lessons.length,42);assert.equal(lessons.flatMap(l=>l.questions).length,84);assert.equal(new Set(lessons.map(l=>l.id)).size,42);
for(const u of units){
 const own=lessons.filter(l=>l.unit===u.id);assert.deepEqual(own.map(l=>l.id),u.lessonIds);
 assert.deepEqual(own.flatMap(l=>l.sections),u.sections);
 run(`current=${lessons.indexOf(own[0])};renderLesson()`);assert.equal(el('unit-select').value,u.id);
 for(const l of lessons)assert.equal(el('lesson-list').innerHTML.includes(`href="#${l.id}"`),l.unit===u.id);
 assert.ok(el('unit-summary').innerHTML.includes('Authentic source'));assert.equal(run(`unitCounts(units.find(u=>u.id==='${u.id}')).total`),own.length*2);
}
assert.equal((el('course-map').innerHTML.match(/<article/g)||[]).length,6);
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
assert.equal(JSON.parse(h.storage.get('ap-french-practice-v1'))['fr-1-1-0'],true);assert.equal(h.storage.has('larson-single-variable-6e-practice-v1'),false);
near(run('numericValue("1/4")'),.25);near(run('numericValue("−2.493")'),-2.493);for(const bad of ['1/0','Infinity','NaN','2+3','<script>','1e999'])assert.equal(run(`numericValue(${JSON.stringify(bad)})`),null);
run('current=0;renderLesson()');el('reveal-step').onclick();assert.ok(el('step-status').textContent.startsWith('2 of '));el('reveal-all').onclick();assert.equal(el('reveal-step').disabled,true);el('restart-example').onclick();assert.ok(el('step-status').textContent.startsWith('1 of '));
run("solved={'fr-1-1-0':true,'fr-1-1-1':true,'fr-1-2-0':true};current=0;renderNav()");assert.ok(el('lesson-list').innerHTML.includes('aria-label="Lesson completed">✓ Completed</span>'));assert.ok(el('lesson-list').innerHTML.includes('aria-label="1 of 2 checks solved">1/2</span>'));
run('current=20;renderNav();current=0;renderNav()');assert.ok(el('lesson-list').innerHTML.includes('✓ Completed'));
const badge={dataset:{lesson:'fr-1-2'},attributes:{},setAttribute(k,v){this.attributes[k]=v}};h.setBadges([badge]);run("solved['fr-1-2-1']=true;progress()");assert.equal(badge.textContent,'✓ Completed');assert.equal(badge.attributes['data-complete'],'true');h.setBadges([]);
h.context.location.hash='#fr-1-1';run("showView('plan');navigate(0)");assert.equal(el('panel-learn').hidden,false);assert.equal(el('panel-plan').hidden,true);
el('unit-select').listeners.change({target:{value:'5'}});assert.equal(h.context.location.hash,'#'+units[4].lessonIds[0]);h.context.window.listeners.hashchange();assert.equal(el('unit-select').value,'5');
const format='ap-french-progress';run("solved={'fr-1-1-0':true}");
const backup=JSON.stringify({format,version:1,solved:{'fr-1-1-0':false,'fr-1-2-1':true,'unrecognized-0':true}}),merged=run(`mergeProgressBackup(${JSON.stringify(backup)})`);assert.equal(merged.count,1);assert.equal(merged.skipped,1);assert.equal(run("solved['fr-1-1-0']"),true);
const exported=run('JSON.stringify(progressBackup())');assert.equal(JSON.parse(exported).format,format);assert.equal(JSON.parse(exported).version,1);assert.ok(!exported.includes('response'));
for(const bad of ['{','null','[]','{}',JSON.stringify({format:'beyond-bc-progress',version:1,solved:{'fr-1-3-0':true}}),JSON.stringify({format:'larson-single-variable-6e-progress',version:1,solved:{'fr-1-3-0':true}}),JSON.stringify({format,version:2,solved:{}}),JSON.stringify({format,version:1,solved:{'fr-1-3-0':true,'fr-1-4-0':'yes'}}),' '.repeat(1048577)]){
 assert.throws(()=>run(`mergeProgressBackup(${JSON.stringify(bad)})`));assert.equal(run("solved['fr-1-3-0']"),undefined);assert.equal(run("solved['fr-1-1-0']"),true);
}
h.context.localStorage.setItem=()=>{throw Error('unavailable')};assert.equal(run(`mergeProgressBackup(${JSON.stringify(exported)})`).saved,false);
const reload=harness({'ap-french-practice-v1':JSON.stringify({'fr-1-1-0':true,'fr-1-1-1':true}),'larson-single-variable-6e-practice-v1':JSON.stringify({'fr-1-2-0':true})});reload.run('current=0;renderNav()');assert.ok(reload.el('lesson-list').innerHTML.includes('✓ Completed'));assert.equal(reload.run("solved['fr-1-2-0']"),undefined);
const blocked=harness();blocked.context.localStorage.setItem=()=>{throw Error('blocked')};assert.equal(blocked.run('persist()'),false);blocked.run('renderLesson()');
assert.equal(frqs.length,6);assert.equal((el('frq-list').innerHTML.match(/<textarea/g)||[]).length,6);for(const f of frqs){assert.equal(f.prompts.length,4);assert.equal(f.criteria.length,4);assert.ok(f.context.length>0)}
console.log('PASS: all 42 lessons, 84 quiz submissions, six unit maps and production drills, completion badges, navigation, isolated saved progress and backup validation.');

for(const l of lessons){assert.ok(l.passage.length>150);assert.equal(l.vocab.length,4);for(const q of l.questions)assert.equal(q.explain,q.options[q.answer]);}
assert.equal(lessons.filter(l=>l.kind==='listening').length,6);assert.equal(lessons.flatMap(l=>l.vocab).length,168);
assert.equal(run('remainingSeconds(10000,9001)'),1);assert.equal(run('remainingSeconds(10000,12000)'),0);
el('timer-mode').value='40';el('timer-mode').onchange();assert.equal(run('timerRemaining'),40);el('timer-start').onclick();assert.ok(run('timerDeadline')>0);el('timer-pause').onclick();assert.equal(run('timerDeadline'),null);run('timerDeadline=Date.now()-1000;tickTimer()');assert.equal(el('timer-output').textContent,'0:00');assert.ok(el('timer-status').textContent.includes('finished'));el('timer-reset').onclick();assert.equal(el('timer-output').textContent,'0:40');
assert.equal(run('speakFrench("bonjour")'),false);assert.ok(el('speech-status').textContent.includes('No French'));
let spoken,cancelled=0;h.context.window.SpeechSynthesisUtterance=function(text){this.text=text};h.context.window.speechSynthesis={getVoices:()=>[{name:'English',lang:'en-US'},{name:'Français',lang:'fr-FR',localService:true}],cancel(){cancelled++},speak(u){spoken=u}};
run('refreshVoices()');el('speech-rate').value='0.9';assert.equal(run('speakFrench("Bonjour à tous")'),true);assert.equal(spoken.lang,'fr-FR');assert.equal(spoken.rate,.9);assert.equal(spoken.text,'Bonjour à tous');spoken.onend();assert.ok(el('speech-status').textContent.includes('finished'));spoken.onerror();assert.ok(el('speech-status').textContent.includes('could not'));el('stop-speech').onclick();assert.ok(cancelled>=2);
for(const u of units){el('vocab-unit').value=u.id;el('vocab-unit').onchange();assert.equal(run('vocabulary().length'),28);assert.equal(el('vocab-back').hidden,true);el('vocab-reveal').onclick();assert.equal(el('vocab-back').hidden,false);el('vocab-prev').onclick();assert.ok(el('vocab-count').textContent.includes('Card 28'));el('vocab-next').onclick();assert.ok(el('vocab-count').textContent.includes('Card 1'));}
assert.ok(!/drawOsmosis|biological idea|__LAB/.test(page));
const ids=[...page.matchAll(/id="([^"$<>]+)"/g)].map(m=>m[1]).filter(id=>!id.includes('\\')&&!id.includes('{'));
// Only literal HTML outside scripts must have unique IDs; generated lesson markup reuses stable IDs on replacement.
const literal=page.replace(/<script[\s\S]*?<\/script>/g,'');const staticIds=[...literal.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(staticIds).size,staticIds.length);
console.log('PASS: listening fallback and French speech, 168 vocabulary cards, timer lifecycle, original passages, static HTML IDs and script syntax. No visual browser QA.');
