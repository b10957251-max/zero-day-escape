import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {WorldHandle} from './game/scene';
import {rooms} from './game/rooms';
import {puzzles,verifyPuzzle,clues} from './puzzles/data';
import './style.css';
type Save={level:number;solved:boolean;started:boolean;finished:boolean;wrong:number;seconds:number;seen:string[];items:string[];notes:{key:string;title:string;text:string}[]};
const KEY='zero-day-exploration-v2';
const fresh=():Save=>({level:0,solved:false,started:false,finished:false,wrong:0,seconds:0,seen:[],items:[],notes:[]});
function load():Save{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Number.isInteger(s.level)&&s.level>=0&&s.level<5&&Array.isArray(s.seen)&&Array.isArray(s.items)&&Array.isArray(s.notes))return {...fresh(),...s}}catch{}return fresh()}
function App(){
 const [save,setSave]=useState(load),[modal,setModal]=useState('lobby'),[answer,setAnswer]=useState(''),[message,setMessage]=useState(''),[title,setTitle]=useState(''),[near,setNear]=useState('');
 const mount=useRef<HTMLDivElement>(null),world=useRef<WorldHandle|null>(null),current=useRef(save),view=useRef(modal),returnView=useRef('none');current.current=save;view.current=modal;
 const interact=useRef<(id:string)=>void>(()=>{});
 const has=(s:Save,item:string)=>item==='allSeals'?['alphaSeal','sumSeal','nonceSeal'].every(i=>s.items.includes(i)):s.items.includes(item);
 const show=(name:string,text:string)=>{setTitle(name);setMessage(text);setModal('object')};
 interact.current=id=>{const s=current.current;if(view.current!=='none')return;
 if(id==='exit'){if(!s.solved){show('安全門','門禁封鎖中，請先完成本區密碼驗證。');return}if(s.level===4){setSave({...s,finished:true});setModal('victory')}else{setSave({...s,level:s.level+1,solved:false});setNear('')}return}
 if(id==='terminal'){if(s.solved){show('驗證完成','安全門已解鎖，請走到右側出口並互動。');return}if(s.level===4&&!s.items.includes('coreReady')){show('核心尚未校準','請先探索三座授權台，再操作三因子校準台。');return}setAnswer('');setMessage('');setModal('puzzle');return}
 const spot=rooms[s.level].spots.find(x=>x.id===id);if(!spot)return;
 if(spot.needs&&!has(s,spot.needs)){show(spot.name,'裝置尚未就緒或物件仍上鎖。請探索其他物件，尋找道具或電源。');return}
 const key=`${s.level}:${id}`;show(spot.name,spot.text);setSave({...s,seen:s.seen.includes(key)?s.seen:[...s.seen,key],items:spot.gives&&!s.items.includes(spot.gives)?[...s.items,spot.gives]:s.items,notes:s.notes.some(n=>n.key===key)?s.notes:[...s.notes,{key,title:`${rooms[s.level].name}・${spot.name}`,text:spot.text}]});};
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch{}},[save]);
 useEffect(()=>{let live=true,h:WorldHandle|null=null;import('./game/scene').then(m=>{if(!live||!mount.current)return;h=m.createWorld(mount.current,id=>interact.current(id),setNear);world.current=h;h.setRoom(current.current.level);h.setProgress(current.current.solved,current.current.seen.filter(k=>k.startsWith(current.current.level+':')).map(k=>k.split(':')[1]));h.setLocked(view.current!=='none')});return()=>{live=false;h?.destroy();world.current=null}},[]);
 useEffect(()=>{world.current?.setRoom(save.level)},[save.level]);
 useEffect(()=>{world.current?.setProgress(save.solved,save.seen.filter(k=>k.startsWith(save.level+':')).map(k=>k.split(':')[1]))},[save.level,save.solved,save.seen]);
 useEffect(()=>{world.current?.setLocked(modal!=='none')},[modal]);
 useEffect(()=>{if(modal==='lobby'||save.finished||!save.started)return;const t=setInterval(()=>setSave(s=>({...s,seconds:s.seconds+1})),1000);return()=>clearInterval(t)},[modal,save.finished,save.started]);
 const reset=()=>{setSave(fresh());setAnswer('');setMessage('');setNear('');setModal('lobby');world.current?.setRoom(0)};
 const lobby=()=>setModal('lobby');
 const notes=()=>{returnView.current=modal;setModal('notes')};
 const time=`${String(Math.floor(save.seconds/60)).padStart(2,'0')}:${String(save.seconds%60).padStart(2,'0')}`;
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!answer.trim())return;if(!verifyPuzzle(save.level,answer)){setSave(s=>({...s,wrong:s.wrong+1}));setMessage('驗證失敗。可返回房間探索提示，再重新計算。');return}setSave(s=>({...s,solved:true}));show('安全門已解鎖',`驗證成功！${save.level<4?'取得線索：'+clues[save.level]+'。':''}請操控人物走到右側出口，互動後離開。`)};
 return <div className="shell"><header><div><div className="eyebrow">CYBER ESCAPE LAB // EXPLORATION EDITION</div><h1>零日危機 <span>探索與解密</span></h1><p className="muted">五個獨立區域・地圖隱藏提示・自由探索</p></div><div className="actions"><button onClick={lobby}>⌂ 返回大廳</button><button onClick={()=>{if(confirm('清除所有關卡、道具與筆記並返回大廳？'))reset()}}>↻ 重新開始</button></div></header>
 <div className="hud"><div>已破解 <b>{save.finished?5:save.level+(save.solved?1:0)} / 5</b></div><div>筆記 <b>{save.notes.length} / 20</b></div><div>時間 <b>{time}</b></div><div>區域 <b>{rooms[save.level].name}</b></div><div>出口 <b>{save.solved?'已解鎖':'封鎖'}</b></div><button onClick={notes}>線索筆記</button></div>
 <div className="game"><div ref={mount} className="phaser"/>{modal!=='none'&&<div className="veil"><div className="panel" role="dialog" aria-modal="true" aria-label="遊戲視窗">
 {modal==='lobby'&&<><div className="eyebrow">MISSION LOBBY</div><h2>地下研究中心</h2><p>探索五個不同區域的文件、抽屜、儀器與電源裝置。提示藏在房間中，發現後收入筆記，不限次數查看。</p><ul><li>← → / A D 移動，靠近物件按 E 互動。</li><li>手機按住方向鍵，再按「互動」。</li><li>破解後，親自走到安全門互動才能換關。</li><li>返回大廳保留進度；重新開始清除進度並回到這裡。</li></ul><p>目前：{save.finished?'已通關':rooms[save.level].name}</p>{!save.finished?<button className="primary" onClick={()=>{setSave(s=>({...s,started:true}));setModal('none')}}>{save.started?'繼續探索':'開始任務'}</button>:<button onClick={()=>setModal('victory')}>查看通關紀錄</button>}</>}
 {modal==='puzzle'&&<><h2>{puzzles[save.level].title}</h2><p>{puzzles[save.level].story}</p><div className="formula">{puzzles[save.level].formula}</div><p>{puzzles[save.level].instructions}</p><form className="answer" onSubmit={submit}><input autoFocus value={answer} onChange={e=>setAnswer(e.target.value)} placeholder={puzzles[save.level].placeholder} aria-label="解題答案"/><button className="primary">驗證</button></form>{message&&<div className="error" role="alert">{message}</div>}<div className="actions"><button onClick={notes}>查看線索筆記</button><button onClick={()=>setModal('none')}>返回探索</button></div></>}
 {modal==='object'&&<><div className="eyebrow">FIELD DISCOVERY</div><h2>{title}</h2><div className="formula">{message}</div><button className="primary" onClick={()=>setModal('none')}>返回探索</button></>}
 {modal==='notes'&&<><h2>線索筆記</h2>{save.notes.length===0&&<p>尚未收集線索，試著探索房間中的物件。</p>}{save.notes.map(n=><div className="formula" key={n.key}><strong>{n.title}</strong><p>{n.text}</p></div>)}<button onClick={()=>setModal(returnView.current)}>關閉筆記</button></>}
 {modal==='victory'&&<><h2>成功逃脫零日危機！</h2><p>你已親自通過最後一道安全門。</p><div className="formula">時間：{time}　答錯：{save.wrong} 次{'\n'}探索筆記：{save.notes.length} / 20</div><div className="actions"><button onClick={lobby}>返回大廳</button><button className="primary" onClick={reset}>再挑戰一次（重置並回大廳）</button></div></>}
 </div></div>}</div><div className="controls"><div className="pad">{(['left','right'] as const).map((d,i)=><button key={d} disabled={modal!=='none'} aria-label={i?'向右移動':'向左移動'} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);world.current?.[d](true)}} onPointerUp={()=>world.current?.[d](false)} onPointerCancel={()=>world.current?.[d](false)} onLostPointerCapture={()=>world.current?.[d](false)}>{i?'▶':'◀'}</button>)}<button className="primary" disabled={modal!=='none'||!near} onClick={()=>world.current?.interact()}>互動 E</button></div><p className="muted small">{modal!=='none'?'探索暫停':near?'附近：'+near:'靠近房間物件，探索隱藏線索。'}</p></div><footer>教育用簡化密碼學模型 · 進度儲存在目前瀏覽器</footer></div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
