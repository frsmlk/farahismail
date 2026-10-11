'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type Point = { x: number; y: number };
const columns = 24, rows = 18, cell = 28;
const accent = '#571531', raspberry = '#c43132', mustard = '#efe4aa', paper = '#f7f5ef';

export default function PlayPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<{nickname: string; score: number}[]>([]);
  const [nickname, setNickname] = useState('');
  const [runId, setRunId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scoreMessage, setScoreMessage] = useState('');
  const refreshScores = async () => {
    try { const response = await fetch('/play/scores', {cache:'no-store'}); if (!response.ok) throw new Error(); const data = await response.json(); setHighScores(data.scores); } catch { setScoreMessage('High scores are unavailable. Please try again later.'); }
  };
  const submitScore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving || submitted) return; setSaving(true); setScoreMessage('');
    try { const response = await fetch('/play/scores', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname,score,runId})}); const data = await response.json(); if (!response.ok) throw new Error(data.error); setSubmitted(true); setScoreMessage('Your score is on the board.'); localStorage.setItem('book-index-snake-nickname',nickname.trim()); await refreshScores(); } catch (error) { setScoreMessage(error instanceof Error ? error.message : 'Please try again.'); } finally { setSaving(false); }
  };
  const [status, setStatus] = useState('Ready');
  const control = useRef<(action: string) => void>(() => {});

  useEffect(() => {
    const surface = canvas.current;
    const ctx = surface?.getContext('2d');
    if (!surface || !ctx) return;
    void refreshScores();
    try { setNickname(localStorage.getItem('book-index-snake-nickname') || ''); } catch {}
    let snake: Point[] = [];
    let direction = { x: 1, y: 0 }, next = direction;
    let food = { x: 17, y: 5 }, points = 0;
    let running = false, over = false, turned = false;
    let touch: Point | null = null;
    const stripeTile = document.createElement('canvas');
    stripeTile.width = 28; stripeTile.height = 14;
    const stripeContext = stripeTile.getContext('2d');
    if (!stripeContext) return;
    stripeContext.fillStyle = raspberry;
    stripeContext.fillRect(0, 0, 28, 14);
    stripeContext.fillStyle = paper;
    stripeContext.fillRect(0, 4, 28, 3);
    stripeContext.fillRect(0, 11, 28, 3);
    const snakePattern = ctx.createPattern(stripeTile, 'repeat');
    const draw = () => {
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, columns * cell, rows * cell);
      ctx.fillStyle = snakePattern || raspberry;
      snake.forEach(p => ctx.fillRect(p.x * cell, p.y * cell, cell, cell));
      ctx.fillStyle = mustard;
      ctx.beginPath(); ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, 12, 0, Math.PI * 2); ctx.fill();
    };
    const reset = () => {
      snake = [{x:13,y:5},{x:12,y:5},{x:11,y:5},{x:10,y:5},{x:9,y:5},{x:8,y:5},{x:8,y:6},{x:8,y:7},{x:8,y:8},{x:7,y:8},{x:6,y:8},{x:5,y:8}];
      direction = {x:1,y:0}; next = direction; food = {x:17,y:5}; points = 0;
      over = false; running = false; turned = false; setRunId(crypto.randomUUID()); setSubmitted(false); setScoreMessage(''); setScore(0); setStatus('Ready'); draw();
    };
    const change = (x: number, y: number) => {
      if (over || turned || (x === -direction.x && y === -direction.y)) return;
      next = { x, y }; turned = true; running = true; setStatus('Playing');
    };
    const toggle = () => {
      if (over) { reset(); running = true; setStatus('Playing'); }
      else { running = !running; setStatus(running ? 'Playing' : 'Paused'); }
    };
    const directions: Record<string, Point> = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
    control.current = action => {
      if (directions[action]) { const d = directions[action]; change(d.x, d.y); }
      else if (action === 'restart') reset();
      else toggle();
    };
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|BUTTON)$/.test(e.target.tagName))) return;
      const directions: Record<string, Point> = { ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0} };
      if (directions[e.key]) { e.preventDefault(); const d = directions[e.key]; change(d.x,d.y); }
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
    };
    const startTouch = (e: TouchEvent) => { touch = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}; };
    const moveTouch = (e: TouchEvent) => {
      if (over || window.matchMedia('(max-width:600px)').matches) return;
      e.preventDefault(); if (!touch) return;
      const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
      if (Math.max(Math.abs(dx),Math.abs(dy)) < 12) return;
      if (Math.abs(dx)>Math.abs(dy)) change(Math.sign(dx),0); else change(0,Math.sign(dy));
      touch = null;
    };
    const visibility = () => { if (document.hidden && running) {running=false;setStatus('Paused');} };
    reset();
    const timer = window.setInterval(() => {
      if (!running || over) return;
      direction=next; turned=false;
      const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
      const eats=head.x===food.x && head.y===food.y;
      const body=eats?snake:snake.slice(0,-1);
      if (head.x<0 || head.x>=columns || head.y<0 || head.y>=rows || body.some(p=>p.x===head.x&&p.y===head.y)) {
        running=false;over=true;setStatus('Game over');return;
      }
      snake.unshift(head);
      if (!eats) snake.pop();
      else {
        points++;setScore(points);
        const free: Point[]=[];
        for(let y=0;y<rows;y++) for(let x=0;x<columns;x++) if(!snake.some(p=>p.x===x&&p.y===y)) free.push({x,y});
        if(!free.length){running=false;over=true;setStatus('You win');draw();return;}
        food=free[Math.floor(Math.random()*free.length)];
      }
      draw();
    },150);
    window.addEventListener('keydown',key);
    document.addEventListener('visibilitychange',visibility);
    surface.addEventListener('touchstart',startTouch,{passive:true});
    surface.addEventListener('touchmove',moveTouch,{passive:false});
    return () => {clearInterval(timer);window.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);surface.removeEventListener('touchstart',startTouch);surface.removeEventListener('touchmove',moveTouch);};
  }, []);

  return <div className={`playSite ${(status === 'Game over' || status === 'You win') ? 'playFinished' : ''}`}>

    <div className="worldPlayHome"><Link href="/" aria-label="Home"><svg className="homeCursorIcon" aria-hidden="true" width="29" height="29" viewBox="0 0 32 32"><path d="M2 2 L2 20 L7 15 L11 23 L15 21 L11 13 L19 13 Z" transform="translate(16 16) rotate(-45) translate(-10 -12)" fill="#571531" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" /></svg></Link></div>
    <h1 className="playTitle">Play</h1>
    <p className="playInstructions"><span className="desktopInstructions">Arrow keys or swipe to move</span><span className="phoneInstructions">Tap the arrows to move</span></p>
    <div className="playLayout"><div className="playGame"><main>
      <div className="playTop"><span className="playScore" aria-label={`Score ${score}`}>{String(score).padStart(2,'0')}</span></div>
      <canvas ref={canvas} width={columns*cell} height={rows*cell} tabIndex={0} aria-label="Snake game. Use arrow keys or swipe. Avoid the edges and your own tail." />
      <footer><span role="status" aria-live="polite">{status === 'Ready' ? '' : status}</span><div><button onClick={()=>control.current('restart')}>Restart</button><button onClick={()=>control.current('toggle')}>{status === 'Playing' ? 'Pause' : status === 'Game over' || status === 'You win' ? 'Play again' : status === 'Paused' ? 'Resume' : 'Start'}</button></div></footer>
    </main>
      <div className="playPad" role="group" aria-label="Direction controls">
        {(['up','left','right','down'] as const).map(direction => <button key={direction} className={`pad-${direction}`} aria-label={`Move ${direction}`} onPointerDown={()=>control.current(direction)} onClick={e=>{if(e.detail===0) control.current(direction);}}>{({up:'↑',left:'←',right:'→',down:'↓'})[direction]}</button>)}
        <span className="pad-center" aria-hidden="true" />
      </div>
    </div>
    <aside className="playHighScores" aria-label="High scores">
      <h2>High Scores</h2>
      {highScores.length ? <ol>{highScores.map((value,index)=><li key={index}><span className="scoreNickname">{index+1}. {value.nickname}</span><span>{String(value.score).padStart(2,'0')}</span></li>)}</ol> : <p>Be the first to set a high score.</p>}
      {(status === 'Game over' || status === 'You win') && score > 0 && !submitted && <form className="scoreForm" onSubmit={submitScore}>
        <label htmlFor="scoreNickname">Add your score</label>
        <input id="scoreNickname" value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={24} required placeholder="Your nickname" autoComplete="nickname" disabled={saving} />
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Submit score'}</button>
      </form>}
      <p role="status">{scoreMessage}</p>
    </aside></div>
    <style>{`
html,body {background:#efe4aa;}
.worldPlayHome{padding:10px 5vw;font:18.24px/1.15 Helvetica,"Helvetica Neue",Arial,sans-serif;font-weight:400;}
.worldPlayHome a{font-weight:400;}

      .playSite { min-height:100dvh; background:${accent}; color:${paper}; font-family:Helvetica,'Helvetica Neue',Arial,sans-serif; font-weight:700; }
      .playSite * { box-sizing:border-box; font-family:inherit; font-weight:700; }
      .playSite header { display:flex; justify-content:space-between; gap:16px; padding:28px 5vw; font-size:16px; }
      .playSite a { color:inherit; text-decoration:none; }
      .playLayout {display:flex;align-items:flex-end;gap:5vw;padding:30px 5vw 40px;}
      .playHighScores {flex:1;max-width:320px;padding-bottom:24px;min-width:180px;}
      .playHighScores h2 {color:${accent};font-size:28px;line-height:1;margin:0 0 12px;}
      .playHighScores p {font-size:14px;line-height:1.2;margin:0 0 24px;}
      .playHighScores ol {list-style:none;margin:0;padding:0;}
      .playHighScores li {display:flex;justify-content:space-between;font-size:28px;line-height:1.1;margin:16px 0;}
      .scoreNickname {overflow-wrap:anywhere;font-size:20px;min-width:0;} .playHighScores li {gap:16px;}
      .scoreForm {display:grid;gap:12px;margin-top:24px;font-size:16px;}
      .scoreForm input {min-width:0;width:100%;background:${paper};color:${accent};border:0;padding:12px;font:inherit;}
      .scoreForm button {text-align:left;} .scoreForm button:disabled {opacity:.6;}
      .playHighScores input:focus-visible,.playHighScores button:focus-visible {outline:2px solid ${paper};outline-offset:4px;}
      .playGame {width:min(720px,65vw);flex-shrink:0;}
      .playSite main { width:100%; margin:0; padding:24px; background:${paper}; color:${accent}; }
      .playTop { display:flex; justify-content:space-between; align-items:end; margin-bottom:8px; }
      .playTitle,.playScore { font-size:64px; letter-spacing:-.05em; margin:0; line-height:1; color:${accent}; }
      .playInstructions { font-size:14px; line-height:1.15; margin:0 0 25px; }
      .playSite canvas { width:100%; height:auto; display:block; touch-action:none; }
      .playSite footer { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:24px; font-size:14px; }
      .playSite footer div { display:flex; gap:24px; }
      .playSite button { font:inherit; border:0; background:none; color:inherit; cursor:pointer; padding:8px 0; }
      .playSite button:focus-visible,.playSite a:focus-visible,.playSite canvas:focus-visible { outline:2px solid ${accent};outline-offset:4px; }
      .playFinished canvas {touch-action:pan-y;}
      .playPad,.phoneInstructions { display:none; }
      @media(max-width:1000px) {.playLayout {flex-direction:column;align-items:stretch;} .playGame {width:100%;max-width:720px;} .playHighScores {max-width:720px;padding-top:24px;}}
      @media(max-width:600px) { .playSite header {padding:24px;font-size:12px;} .playLayout {padding-top:45px;} .playTitle,.playScore {font-size:54px;}
        .desktopInstructions {display:none;} .phoneInstructions {display:inline;}
        .playSite canvas {touch-action:pan-y;}
        .playPad { display:grid; grid-template-columns:repeat(3,52px); grid-template-rows:repeat(3,52px); justify-content:center; margin:18px auto 0; touch-action:pan-y; user-select:none; }
        .playPad button {background:${paper};color:${accent};padding:0;font-size:28px;line-height:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
        .playPad button:active {background:#e3ded4;}
        .pad-up {grid-area:1/2;border-radius:8px 8px 0 0;}.pad-left {grid-area:2/1;border-radius:8px 0 0 8px;}.pad-right {grid-area:2/3;border-radius:0 8px 8px 0;}.pad-down {grid-area:3/2;border-radius:0 0 8px 8px;}.pad-center {grid-area:2/2;background:${paper};}
      }
    
.bcHero h1,.worldAbout h1,.previewPage h1,.playTitle {font-family:Helvetica,"Helvetica Neue",Arial,sans-serif!important;font-size:clamp(55.44px,10.56vw,126.72px)!important;font-weight:700!important;line-height:.85!important;letter-spacing:-.05em!important;transform:none!important;}
.worldBookHome,.worldPlayHome,.worldPageHome {position:absolute!important;top:10px!important;left:5vw!important;z-index:10;padding:0!important;margin:0!important;font:400 18.24px/1.15 Helvetica,"Helvetica Neue",Arial,sans-serif!important;text-decoration:none!important;}
.worldPlayHome a {font:inherit!important;text-decoration:none!important;}
.worldAbout,.playSite,#maps,.bcSite {position:relative;}
.worldPageHome {color:inherit;}
.playSite {padding-top:41px;}

.playTitle {font-weight:400!important;}
.playScore {color:#efe4aa;}
.playSite {background:#efe4aa;color:${accent};padding:clamp(28px,4.6vw,88px);padding-top:clamp(40px,5.32vw,100.8px);}
.playTitle {margin:0 0 20px;}
.playLayout {padding:0 0 40px;}
.playTop {justify-content:flex-end;}
.playInstructions,.playInstructions span {font:400 28.8px/1.15 Helvetica,"Helvetica Neue",Arial,sans-serif;letter-spacing:0;}
.playInstructions {margin:0 0 40px;}
@media(max-width:600px){.playSite {padding-top:4.8vh;}.playTitle {margin-bottom:20px;}.playLayout {padding-top:0;}}
`}</style>
  </div>;
}
