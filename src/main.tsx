import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {WorldHandle} from './game/scene';
import {puzzles,verifyPuzzle,clues,finalCode} from './puzzles/data';
import './style.css';
type Save={level:number;hints:number;used:number[];wrong:number;seconds:number;started:boolean;finished:boolean};
const KEY='zero-day-react-phaser-v1';
const fresh=():Save=>({level:0,hints:3,used:[],wrong:0,seconds:0,started:false,finished:false});
function load():Save{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&Number.isInteger(v.level)&&v.level>=0&&v.level<=5&&Number.isInteger(v.hints)&&v.hints>=0&&v.hints<=3&&Array.isArray(v.used))return {...fresh(),...v}}catch{}return fresh()}
function App(){
 const [save,setSave]=useState<Save>(load),[modal,setModal]=useState<'intro'|'puzzle'|'passed'|'victory'|'none'>('intro');
 const [answer,setAnswer]=useState(''),[feedback,setFeedback]=useState(''),[near,setNear]=useState(false),[hintShown,setHintShown]=useState(false);
 const mount=useRef<HTMLDivElement>(null),world=useRef<WorldHandle|null>(null),current=useRef(save),modalRef=useRef(modal);
 current.current=save;modalRef.current=modal;
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch{}},[save]);
 useEffect(()=>{if(!mount.current)return;let active=true;let handle:WorldHandle|null=null;
 import('./game/scene').then(m=>{if(!active||!mount.current)return;handle=m.createWorld(mount.current,()=>{if(current.current.level<5){setAnswer('');setFeedback('');setHintShown(false);setModal('puzzle')}},v=>setNear(v));world.current=handle;handle.setRoom(current.current.level);handle.setLocked(modalRef.current!=='none')});
 return()=>{active=false;handle?.destroy();world.current=null};},[]);
 useEffect(()=>{world.current?.setRoom(save.level)},[save.level]);
 useEffect(()=>{world.current?.setLocked(modal!=='none')},[modal]);
 useEffect(()=>{if(modal!=='none'||!save.started||save.finished)return;const timer=window.setInterval(()=>setSave(s=>({...s,seconds:s.seconds+1})),1000);return()=>clearInterval(timer)},[modal,save.started,save.finished]);
 useEffect(()=>{if(save.finished||save.level===5)setModal('victory')},[]);
 const format=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 const reset=()=>{setSave({...fresh(),started:true});setAnswer('');setFeedback('');setHintShown(false);setModal('none');world.current?.setRoom(0)};
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!answer.trim())return;
 if(!verifyPuzzle(save.level,answer)){setSave(s=>({...s,wrong:s.wrong+1}));setFeedback('驗證失敗，請依照公式重新計算。答錯不扣提示。');return}
 const next=save.level+1;setSave(s=>({...s,level:next,finished:next===5}));setFeedback('');setAnswer('');setModal(next===5?'victory':'passed')};
 const useHint=()=>{if(save.hints===0||save.used.includes(save.level))return;setSave(s=>({...s,hints:s.hints-1,used:[...s.used,s.level]}));setHintShown(true)};
 const touch=(dir:'left'|'right',down:boolean)=>world.current?.[dir](down);
 return <div className="shell">
  <header><div><div className="eyebrow">CYBER ESCAPE LAB // PROJECT ZERO DAY</div><h1>零日危機 <span>2D 探索冒險</span></h1><p className="muted">探索地下研究中心，破解五道資安驗證，解除 AI 封鎖。</p></div><button className="outline" onClick={()=>{if(window.confirm('確定要清除所有進度並重新開始？'))reset()}}>↻ 重新開始</button></header>
  <div className="hud"><div>進度 <b>{save.level} / 5</b></div><div>提示 <b>{save.hints} / 3</b></div><div>答錯 <b>{save.wrong}</b></div><div>時間 <b>{format(save.seconds)}</b></div><div>區域 <b>{puzzles[Math.min(save.level,4)].scene}</b></div></div>
  <div className="game"><div ref={mount} className="phaser"/><div className="screen-corner">B2 / RESTRICTED AREA</div>
  {modal!=='none'&&<div className="veil"><div className="panel" role="dialog" aria-modal="true">
   {modal==='intro'&&<><div className="eyebrow">MISSION BRIEFING</div><h2>⚠️ 研究中心遭到入侵</h2><p>你是最後一名留在地下研究中心的資安工程師。沿著走廊移動，靠近發光的終端機，完成五道密碼學挑戰。</p><ul><li>鍵盤 ← → 或 A / D 移動，E 互動</li><li>手機可使用下方方向與互動按鈕</li><li>3 次免費提示，答錯不限次數</li><li>進度保存在目前瀏覽器</li></ul><div className="actions"><button className="primary" onClick={()=>{setSave(s=>({...s,started:true}));setModal('none')}}>{save.started?'▶ 繼續冒險':'▶ 開始冒險'}</button><button className="outline" onClick={reset}>清除進度重玩</button></div></>}
   {modal==='puzzle'&&<><div className="eyebrow">SECURITY TERMINAL {String(save.level+1).padStart(2,'0')} / 05</div><h2>{puzzles[save.level].title}</h2><p>{puzzles[save.level].story}</p><div className="formula">{puzzles[save.level].formula}</div><p>{puzzles[save.level].instructions}</p><form onSubmit={submit} className="answer"><input autoFocus autoComplete="off" spellCheck={false} placeholder={puzzles[save.level].placeholder} value={answer} onChange={e=>setAnswer(e.target.value)} aria-label="解題答案"/><button className="primary" type="submit">驗證 →</button></form>{feedback&&<div className="error" role="alert">{feedback}</div>}{hintShown&&<div className="hint">💡 {puzzles[save.level].hint}</div>}<div className="actions"><button className="outline" disabled={save.hints===0||save.used.includes(save.level)} onClick={useHint}>💡 使用提示（剩 {save.hints} 次）</button><button className="outline" onClick={()=>setModal('none')}>返回探索</button></div></>}
   {modal==='passed'&&<><div className="eyebrow">ACCESS GRANTED</div><h2>✓ 第 {save.level} 關通過</h2><p>授權線索已取得：<strong className="gold">{clues[save.level-1]}</strong></p><p>下一區域的安全門已解鎖。</p><button className="primary" onClick={()=>setModal('none')}>前往下一個房間 →</button></>}
   {modal==='victory'&&<><div className="eyebrow">MISSION COMPLETE</div><h2>🏆 成功逃脫零日危機！</h2><p>五道安全驗證全部完成，研究中心的封鎖已解除。</p><div className="stats"><div><small>完成關卡</small><b>5 / 5</b></div><div><small>通關時間</small><b>{format(save.seconds)}</b></div><div><small>答錯次數</small><b>{save.wrong}</b></div><div><small>剩餘提示</small><b>{save.hints} / 3</b></div></div><div className="formula">四組線索：{clues.join(' / ')}{'\n'}最終通行碼：{finalCode}</div><button className="primary" onClick={reset}>↻ 再挑戰一次（完整重置）</button></>}
  </div></div>}
  </div>
  <div className="controls"><div className="pad"><button onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);touch('left',true)}} onPointerUp={()=>touch('left',false)} onPointerCancel={()=>touch('left',false)} onLostPointerCapture={()=>touch('left',false)} aria-label="向左移動">◀</button><button onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);touch('right',true)}} onPointerUp={()=>touch('right',false)} onPointerCancel={()=>touch('right',false)} onLostPointerCapture={()=>touch('right',false)} aria-label="向右移動">▶</button><button className="primary" onClick={()=>{if(modal==='none'&&near&&save.level<5){setAnswer('');setFeedback('');setHintShown(false);setModal('puzzle')}}}>互動 E</button></div><div className="muted small">電腦：← → / A D 移動，E 互動。手機：按住方向鍵移動，靠近終端機按「互動」。</div></div>
  <footer>教育用簡化密碼學模型 · 每位玩家的進度儲存在自己的瀏覽器 · 無需登入</footer>
 </div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
