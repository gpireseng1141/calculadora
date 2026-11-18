const expressionEl=document.querySelector("#expression");
const resultEl=document.querySelector("#result");
const statusEl=document.querySelector("#status");
const historyEl=document.querySelector("#history");
let current="0",previous=null,operator=null,replaceCurrent=false,justCalculated=false;
const history=[];
const format=value=>Number.isFinite(value)?new Intl.NumberFormat("pt-BR",{maximumFractionDigits:10}).format(value):"Erro";
const numericValue=()=>Number(current);
function render(){resultEl.textContent=current==="Erro"?"Erro":format(numericValue());}
function enterDigit(digit){
 if(current==="Erro"||replaceCurrent||justCalculated){current=digit;replaceCurrent=false;justCalculated=false;expressionEl.textContent="";}
 else current=current==="0"?digit:current+digit;
 statusEl.textContent="Digitando...";render();
}
function decimal(){
 if(current==="Erro"||replaceCurrent||justCalculated){current="0.";replaceCurrent=false;justCalculated=false;expressionEl.textContent="";}
 else if(!current.includes("."))current+=".";
 render();
}
function chooseOperator(next){
 if(current==="Erro")return;
 if(operator!==null&&!replaceCurrent)calculate();
 previous=numericValue();operator=next;replaceCurrent=true;justCalculated=false;
 expressionEl.textContent=format(previous)+" "+operator;statusEl.textContent="Escolha o próximo número";
}
function addHistory(expression,value){
 history.unshift({expression,value});if(history.length>6)history.pop();
 historyEl.replaceChildren();
 history.forEach(item=>{
  const row=document.createElement("button");row.type="button";row.className="history-item";
  const exp=document.createElement("span");exp.className="history-expression";exp.textContent=item.expression;
  const val=document.createElement("span");val.className="history-result";val.textContent=item.value;
  row.append(exp,val);row.addEventListener("click",()=>{current=String(Number(item.value.replaceAll(".","").replace(",",".")));previous=null;operator=null;replaceCurrent=false;justCalculated=true;expressionEl.textContent=item.expression+" =";statusEl.textContent="Resultado recuperado";render();});
  historyEl.append(row);
 });
}
function calculate(){
 if(operator===null||previous===null||current==="Erro")return;
 const a=previous,b=numericValue();let answer;
 switch(operator){case "+":answer=a+b;break;case "−":answer=a-b;break;case "×":answer=a*b;break;case "÷":answer=b===0?NaN:a/b;break;}
 const exp=format(a)+" "+operator+" "+format(b);
 current=Number.isFinite(answer)?String(Number(answer.toPrecision(12))):"Erro";
 expressionEl.textContent=exp+" =";previous=null;operator=null;replaceCurrent=true;justCalculated=true;
 statusEl.textContent=Number.isFinite(answer)?"Resultado":"Não é possível dividir por zero";
 if(Number.isFinite(answer))addHistory(exp,format(answer));render();
}
function clearAll(){current="0";previous=null;operator=null;replaceCurrent=false;justCalculated=false;expressionEl.textContent="";statusEl.textContent="Pronto para calcular";render();}
function applyAction(action){
 if(action==="clear"){clearAll();return;}
 if(action==="equals"){calculate();return;}
 if(current==="Erro")return;
 const value=numericValue();
 if(action==="sign")current=String(-value);
 if(action==="percent")current=String(value/100);
 if(action==="sqrt"){if(value<0){current="Erro";statusEl.textContent="Raiz de número negativo não é real";}else current=String(Math.sqrt(value));}
 if(action==="square")current=String(value*value);
 if(action==="backspace"){if(!replaceCurrent&&!justCalculated)current=current.length>1?current.slice(0,-1):"0";else current="0";}
 if(["sign","percent","sqrt","square"].includes(action)){replaceCurrent=false;justCalculated=false;}
 render();
}
document.querySelector("#keys").addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button)return;
 if(button.dataset.number!==undefined)enterDigit(button.dataset.number);
 else if(button.dataset.operator)chooseOperator(button.dataset.operator);
 else if(button.dataset.action)applyAction(button.dataset.action);
});
document.querySelector(".extra-actions").addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button)return;
 if(button.id==="copy"){navigator.clipboard?.writeText(resultEl.textContent).then(()=>statusEl.textContent="Resultado copiado!").catch(()=>statusEl.textContent="Não foi possível copiar");}
 else if(button.dataset.action)applyAction(button.dataset.action);
});
document.querySelector("#clear-history").addEventListener("click",()=>{history.length=0;historyEl.innerHTML='<p class="empty-history">Seus cálculos recentes aparecerão aqui.</p>';});
document.addEventListener("keydown",event=>{
 if(event.ctrlKey||event.metaKey||event.altKey)return;
 if(/^[0-9]$/.test(event.key)){event.preventDefault();enterDigit(event.key);}
 else if(event.key==="."||event.key===","){event.preventDefault();decimal();}
 else if(["+","-","*","/"].includes(event.key)){event.preventDefault();chooseOperator(({ "+":"+","-":"−","*":"×","/":"÷"})[event.key]);}
 else if(event.key==="Enter"||event.key==="="){event.preventDefault();calculate();}
 else if(event.key==="Escape"||event.key==="Delete"){event.preventDefault();clearAll();}
 else if(event.key==="%"){event.preventDefault();applyAction("percent");}
 else if(event.key==="Backspace"){event.preventDefault();applyAction("backspace");}
});
render();