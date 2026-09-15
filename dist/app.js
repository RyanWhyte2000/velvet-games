const symbols = ['♛','◆','7','✦','BAR','♠'];
const payouts = {'♛':8,'◆':6,'7':12,'✦':5,'BAR':10,'♠':4};
let balance = Number(localStorage.getItem('vr-balance')) || 10000;
let bet = 100;
let spinning = false;
let soundOn = true;
const $ = id => document.getElementById(id);

function render(){ $('balance').textContent=balance.toLocaleString(); $('bet').textContent=bet.toLocaleString(); localStorage.setItem('vr-balance',balance); }
function tone(freq,duration=.08){ if(!soundOn)return; const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(),g=a.createGain(); o.frequency.value=freq;o.type='sine';g.gain.value=.045;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.stop(a.currentTime+duration); }
function addHistory(result,win){ const h=$('history'); if(h.querySelector('.empty'))h.innerHTML=''; const item=document.createElement('div');item.className='history-item'+(win?' win':'');item.innerHTML=`<div class="combo">${result.join(' ')}</div><div><strong>${win?'+'+win.toLocaleString():'−'+bet.toLocaleString()} VC</strong><small>${win?'WIN':'NO WIN'}</small></div>`;h.prepend(item); while(h.children.length>6)h.lastChild.remove(); }
async function spin(){
  if(spinning)return;
  if(balance<bet){$('message').textContent='Not enough credits — reset your balance';return;}
  spinning=true; balance-=bet; render(); $('spinBtn').disabled=true; $('message').className='message'; $('message').textContent='Spinning…';
  document.querySelectorAll('.reel').forEach(x=>x.classList.add('spinning')); tone(220,.18);
  const result=[];
  for(let i=0;i<3;i++){ await new Promise(r=>setTimeout(r,330)); result[i]=symbols[Math.floor(Math.random()*symbols.length)]; $('r'+i).textContent=result[i]; document.querySelectorAll('.reel')[i].classList.remove('spinning'); tone(320+i*90); }
  let win=0;
  if(result.every(x=>x===result[0])) win=bet*payouts[result[0]];
  else if(new Set(result).size===2) win=Math.floor(bet*1.5);
  if(win){balance+=win;$('message').textContent=`You won ${win.toLocaleString()} virtual credits!`;$('message').className='message win';tone(660,.3);} else {$('message').textContent='Try again — fortune favors the bold';}
  $('lastWin').textContent=win.toLocaleString();addHistory(result,win);render();spinning=false;$('spinBtn').disabled=false;
}
$('betDown').onclick=()=>{if(!spinning){bet=Math.max(50,bet-50);render();}};
$('betUp').onclick=()=>{if(!spinning){bet=Math.min(1000,bet+50);render();}};
$('spinBtn').onclick=spin;
$('resetBtn').onclick=()=>{if(!spinning){balance=10000;$('lastWin').textContent='0';$('message').textContent='Balance reset — good luck!';render();}};
$('soundBtn').onclick=()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'♪':'×';};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();spin();}});
render();
