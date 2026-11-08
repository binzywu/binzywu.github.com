// Backups contain completion flags only, never free-text answers or identities.
function progressBackup(){
 const valid=new Set(lessons.flatMap(l=>l.questions.map((q,i)=>l.id+'-'+i)));
 return {format:'ap-microeconomics-progress',version:1,exportedAt:new Date().toISOString(),solved:Object.fromEntries(Object.entries(solved).filter(([key,value])=>valid.has(key)&&value===true))};
}
function parseProgressBackup(raw){
 if(typeof raw!=='string'||raw.length>1048576)throw Error('Choose a progress JSON file smaller than 1 MB.');
 let data;try{data=JSON.parse(raw)}catch{throw Error('This file is not valid JSON. Your current progress was not changed.')}
 if(!data||data.format!=='ap-microeconomics-progress'||data.version!==1||!data.solved||typeof data.solved!=='object'||Array.isArray(data.solved))throw Error('This is not a supported AP Microeconomics progress backup.');
 const valid=new Set(lessons.flatMap(l=>l.questions.map((q,i)=>l.id+'-'+i))),flags={};let skipped=0;
 for(const [key,value]of Object.entries(data.solved)){
  if(typeof value!=='boolean')throw Error('The backup contains an invalid completion flag. Nothing was imported.');
  if(!valid.has(key)){skipped++;continue}
  if(value===true)flags[key]=true;
 }
 return{flags,skipped};
}
function mergeProgressBackup(raw){
 const result=parseProgressBackup(raw); // Validate the whole file before mutation.
 for(const key of Object.keys(result.flags))solved[key]=true;
 const saved=persist();progress();
 return{count:Object.keys(result.flags).length,skipped:result.skipped,saved};
}
$('export-progress').onclick=()=>{
 const content=JSON.stringify(progressBackup(),null,2),url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='ap-microeconomics-progress-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('backup-status').textContent='Backup download requested. Keep the JSON file to restore progress after a move or on another device.';
};
$('import-progress').onclick=()=>$('progress-file').click();
$('progress-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>1048576)throw Error('Choose a progress JSON file smaller than 1 MB.');
  const result=mergeProgressBackup(await file.text());
  $('backup-status').textContent=`Merged ${result.count} completed checks from the backup.${result.skipped?' Ignored '+result.skipped+' checks not in this tutorial.':''}${result.saved?' Saved in this browser.':' Browser storage is unavailable; export again before closing.'}`;
  renderLesson();
 }catch(error){$('backup-status').textContent=error.message||'Import failed. Your existing progress was preserved.'}
 finally{e.target.value=''}
});
