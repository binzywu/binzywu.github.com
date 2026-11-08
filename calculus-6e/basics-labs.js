// Small, pure calculation helpers are also exercised by validate.cjs.
function modelBasis(kind,x){return kind==='linear'?[1,x]:kind==='quadratic'?[1,x,x*x]:[1,Math.cos(2*Math.PI*x/12),Math.sin(2*Math.PI*x/12)]}
function solveSystem(matrix,rhs){
 const n=rhs.length,a=matrix.map((row,i)=>[...row,rhs[i]]);
 for(let j=0;j<n;j++){
  let p=j;for(let i=j+1;i<n;i++)if(Math.abs(a[i][j])>Math.abs(a[p][j]))p=i;
  if(Math.abs(a[p][j])<1e-12)return null;
  [a[j],a[p]]=[a[p],a[j]];const pivot=a[j][j];for(let k=j;k<=n;k++)a[j][k]/=pivot;
  for(let i=0;i<n;i++)if(i!==j){const f=a[i][j];for(let k=j;k<=n;k++)a[i][k]-=f*a[j][k]}
 }
 return a.map(row=>row[n]);
}
function fitModel(points,kind){
 const n=modelBasis(kind,0).length,A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);
 for(const [x,y]of points){const v=modelBasis(kind,x);for(let j=0;j<n;j++){b[j]+=v[j]*y;for(let k=0;k<n;k++)A[j][k]+=v[j]*v[k]}}
 const coefficients=solveSystem(A,b);if(!coefficients)return null;
 const predict=x=>modelBasis(kind,x).reduce((sum,v,i)=>sum+v*coefficients[i],0);
 const residuals=points.map(([x,y])=>[x,y-predict(x)]),sse=residuals.reduce((sum,p)=>sum+p[1]*p[1],0);
 return{coefficients,predict,residuals,sse};
}
function modelData(kind){const noise=[0,.25,-.2,.1,-.1,.3,-.15,0,.2,-.3,.1,-.1];return noise.map((e,x)=>[x,(kind==='linear'?1+2*x:kind==='quadratic'?2+.3*x*x:14+4*Math.cos(2*Math.PI*(x-3)/12))+e])}
function drawModels(){
 const points=modelData($('model-data').value),kind=$('model-family').value,fit=fitModel(points,kind);
 if(!fit){$('model-result').textContent='These data do not uniquely determine this fit.';return}
 const curve=Array.from({length:221},(_,i)=>{const x=11*i/220;return[x,fit.predict(x)]});
 plot('model-chart',[{data:points,color:'#087566'},{data:curve,color:'#2458c6'}],{xmin:0,xmax:11,xlabel:'input x',ylabel:'observed / predicted',points:true});
 plot('residual-chart',[{data:fit.residuals,color:'#b85d13'}],{xmin:0,xmax:11,xlabel:'input x',ylabel:'residual',points:true});
 $('model-result').innerHTML=`<strong>Coefficients: ${fit.coefficients.map((v,i)=>`c${i} = ${fmt(v)}`).join(' · ')}.</strong><br>Sum of squared residuals: ${fmt(fit.sse)}. The periodic fit assumes a period of 12; this lab does not estimate the period.<br>A visible curve in the residuals suggests a missing pattern. Compare plausible models and new observations before extrapolating.`;
}
function tangentState(kind,a,h){const f=kind==='square'?x=>x*x:kind==='sin'?Math.sin:Math.exp,df=kind==='square'?x=>2*x:kind==='sin'?Math.cos:Math.exp;return{f,y:f(a),derivative:df(a),secant:(f(a+h)-f(a))/h}}
function drawTangent(){
 const kind=$('tangent-function').value,a=Number($('tangent-a').value),h=Number($('secant-h').value),d=tangentState(kind,a,h);
 $('tangent-a-value').value=fmt(a);$('secant-h-value').value=fmt(h);
 plot('tangent-chart',[{data:samples(d.f),color:'#2458c6'},{data:samples(x=>d.y+d.derivative*(x-a)),color:'#b85d13',dash:true},{data:samples(x=>d.y+d.secant*(x-a)),color:'#087566'}],{xmin:-3,xmax:3,marker:a,ylabel:'function / line value'});
 $('tangent-result').innerHTML=`<strong>Secant slope: ${fmt(d.secant)} · derivative at a: ${fmt(d.derivative)}.</strong><br>Slope difference: ${fmt(Math.abs(d.secant-d.derivative))}. The secant joins inputs ${fmt(a)} and ${fmt(a+h)}; the tangent uses the limiting rate at ${fmt(a)}.`;
}
function integralProblem(kind){return kind==='square'?{f:x=>x*x,a:0,b:2,exact:8/3}:kind==='sin'?{f:Math.sin,a:0,b:Math.PI,exact:2}:{f:Math.exp,a:0,b:1,exact:Math.E-1}}
function integralEstimate(kind,rule,n){
 if(!Number.isInteger(n)||n<=0||(rule==='simpson'&&n%2))throw Error('Use a positive subdivision count; Simpson requires an even count.');
 const {f,a,b}=integralProblem(kind),h=(b-a)/n;let sum=0;
 if(rule==='left'||rule==='right'||rule==='midpoint'){
  const shift=rule==='left'?0:rule==='right'?1:.5;for(let i=0;i<n;i++)sum+=f(a+(i+shift)*h);return h*sum;
 }
 if(rule==='trapezoid'){sum=(f(a)+f(b))/2;for(let i=1;i<n;i++)sum+=f(a+i*h);return h*sum}
 if(rule!=='simpson')throw Error('Unknown numerical integration rule.');
 sum=f(a)+f(b);for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(a+i*h);return h*sum/3;
}
function accumulationPieces(kind,rule,n){
 const {f,a,b}=integralProblem(kind),h=(b-a)/n,paths=[];
 if(rule==='simpson'){
  for(let i=0;i<n;i+=2){const x=a+i*h,y0=f(x),y1=f(x+h),y2=f(x+2*h),data=[];
   for(let k=0;k<=24;k++){const u=2*k/24;data.push([x+u*h,y0*(u-1)*(u-2)/2-y1*u*(u-2)+y2*u*(u-1)/2])}
   paths.push({data,color:'#b85d13',dash:true});
  }
 }else for(let i=0;i<n;i++){
  const x=a+i*h,x2=x+h,rect=['left','right','midpoint'].includes(rule),height=f(rule==='left'?x:rule==='right'?x2:x+h/2);
  paths.push({data:rect?[[x,0],[x,height],[x2,height],[x2,0]]:[[x,0],[x,f(x)],[x2,f(x2)],[x2,0]],color:'#b85d13',dash:true});
 }
 return paths;
}
function drawAccumulation(){
 const kind=$('integral-function').value,rule=$('integral-rule').value,n=Number($('integral-n').value),p=integralProblem(kind),estimate=integralEstimate(kind,rule,n);
 $('integral-n-value').value=n;
 const data=Array.from({length:241},(_,i)=>{const x=p.a+(p.b-p.a)*i/240;return[x,p.f(x)]});
 plot('accumulation-chart',[...accumulationPieces(kind,rule,n),{data,color:'#2458c6'}],{xmin:p.a,xmax:p.b,ylabel:'height'});
 $('accumulation-result').innerHTML=`<strong>Approximation: ${fmt(estimate)} · exact integral: ${fmt(p.exact)}.</strong><br>Actual absolute error: ${fmt(Math.abs(estimate-p.exact))}. This comparison uses known exact values; it is not a general error certificate for unknown integrals. ${rule==='simpson'?'Simpson’s rule is exact for polynomials of degree at most three, apart from numerical roundoff.':''}`;
}
for(const id of ['model-data','model-family'])$(id).addEventListener('change',drawModels);
for(const id of ['tangent-function','tangent-a','secant-h'])$(id).addEventListener('input',drawTangent);
for(const id of ['integral-function','integral-rule','integral-n'])$(id).addEventListener('input',drawAccumulation);
