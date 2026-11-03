import Phaser from 'phaser';
import {rooms} from './rooms';
import {WIDTH,HEIGHT,walls,blocked,placements,start,terminal,exit} from './layout';
export type Direction='left'|'right'|'up'|'down';
export type WorldHandle={destroy:()=>void;setRoom:(n:number)=>void;setLocked:(v:boolean)=>void;setProgress:(v:boolean,s:string[])=>void;setProfile:(gender:string,seed:number)=>void;playEscape:(done:()=>void)=>void;resetEscape:()=>void;interact:()=>void;left:(v:boolean)=>void;right:(v:boolean)=>void;up:(v:boolean)=>void;down:(v:boolean)=>void};
export function createWorld(container:HTMLElement,onInteract:(id:string)=>void,onNear:(name:string)=>void):WorldHandle{
 let room=0,locked=true,solved=false,seed=1,gender='male',seen:string[]=[],active:Lab|undefined;
 // A non-interactive HUD overlay: only required objectives, decoder and exit appear.
 const mapCanvas=document.createElement('canvas');
 mapCanvas.width=320;mapCanvas.height=230;
 mapCanvas.setAttribute('aria-label','小地圖：僅顯示玩家、破譯機台及安全門');
 mapCanvas.style.cssText='position:absolute;top:8px;right:8px;width:min(82px,18vw);height:auto;z-index:15;pointer-events:none;border-radius:7px;box-shadow:0 3px 10px #0007;';
 const priorPosition=container.style.position;
 if(getComputedStyle(container).position==='static')container.style.position='relative';
 container.appendChild(mapCanvas);
 const ctx=mapCanvas.getContext('2d');
 let lastMapPaint=0;
 const paintMap=()=>{
  if(!ctx||!active)return;
  const w=mapCanvas.width,h=mapCanvas.height,pad=12,top=33,sx=(w-2*pad)/WIDTH,sy=(h-top-pad)/HEIGHT;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(6,19,30,.93)';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#b9e8e3';ctx.font='bold 19px system-ui';ctx.fillText('MAP '+String(room+1).padStart(2,'0')+'/05',pad,24);
  ctx.fillStyle='#122e3b';ctx.fillRect(pad,top,w-pad*2,h-top-pad);
  ctx.strokeStyle='#527581';ctx.lineWidth=2;ctx.strokeRect(pad,top,w-pad*2,h-top-pad);
  ctx.fillStyle='#55717e';for(const wall of walls(room))ctx.fillRect(pad+wall.x*sx,top+wall.y*sy,Math.max(2,wall.w*sx),Math.max(2,wall.h*sy));
  const marker=(x:number,y:number,color:string,r:number)=>{ctx.beginPath();ctx.arc(pad+x*sx,top+y*sy,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#06131d';ctx.lineWidth=2;ctx.stroke()};
  for(const point of active.points){
   if(point.kind==='terminal')marker(point.x,point.y,'#59c8ff',7);
   else if(point.kind==='door')marker(point.x,point.y,solved?'#67e8a3':'#ffb66e',8);
  }
  marker(active.player.x,active.player.y,'#ffffff',8);
  // Compact minimap: no legend; white=player, blue=terminal, orange/green=door.
 };

 const held={left:false,right:false,up:false,down:false};
 const interact=()=>{if(!locked&&active?.target)onInteract(active.target)};
 class Lab extends Phaser.Scene{
 bg!:Phaser.GameObjects.Graphics;player!:Phaser.GameObjects.Container;avatar!:Phaser.GameObjects.Graphics;prompt!:Phaser.GameObjects.Text;keys!:Record<string,Phaser.Input.Keyboard.Key>;target='';escapeToken=0;escapeObjects:Phaser.GameObjects.GameObject[]=[];labels:Phaser.GameObjects.Text[]=[];points:{id:string;name:string;x:number;y:number;kind:string}[]=[];
 constructor(){super('lab')}
 create(){active=this;this.bg=this.add.graphics();this.player=this.add.container(start.x,start.y).setDepth(10);this.avatar=this.add.graphics();this.player.add(this.avatar);this.prompt=this.add.text(0,0,'',{fontFamily:'system-ui',fontSize:'17px',color:'#faf2da',backgroundColor:'#09131eea',padding:{x:15,y:10}}).setOrigin(.5,1).setDepth(20);this.keys=this.input.keyboard!.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,E') as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard!.on('keydown-E',interact);this.input.keyboard!.enabled=!locked;this.cameras.main.setBounds(0,0,WIDTH,HEIGHT);this.cameras.main.startFollow(this.player,true,.12,.12);this.scale.on('resize',()=>this.resize());this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{if(locked)return;const w=this.cameras.main.getWorldPoint(pointer.x,pointer.y);const point=this.points.find(p=>Math.hypot(p.x-w.x,p.y-w.y)<65);if(point&&Math.hypot(point.x-this.player.x,point.y-this.player.y)<155){this.target=point.id;onNear(point.name);onInteract(point.id)}});this.resize();this.drawRoom();this.drawPlayer();paintMap();}
 resize(){this.cameras.main.setZoom(this.scale.width<700?1.05:1.15)}
 drawPlayer(){const g=this.avatar;g.clear();g.fillStyle(0x000000,.3);g.fillEllipse(2,18,48,22);g.fillStyle(0x152538);g.fillRoundedRect(-17,2,13,28,4);g.fillRoundedRect(5,2,13,28,4);g.fillStyle(gender==='female'?0xb1c5d8:0x7aa9a9);g.fillRoundedRect(-24,-33,48,44,10);g.fillStyle(0x233b50);g.fillRoundedRect(-16,-25,32,23,4);g.fillStyle(0xeac3a1);g.fillRoundedRect(-16,-62,32,32,9);g.fillStyle(0x292334);if(gender==='female'){g.fillRoundedRect(-21,-68,42,18,8);g.fillRoundedRect(-23,-58,10,39,5);g.fillRoundedRect(14,-58,10,39,5)}else g.fillRoundedRect(-18,-66,36,12,5);g.fillStyle(0x243743);g.fillRect(-13,-50,26,7);g.fillStyle(0xeac3a1);g.fillRoundedRect(-30,-25,9,29,4);g.fillRoundedRect(22,-25,9,29,4);g.fillStyle(0xf6c978);g.fillCircle(15,-18,3)}
 drawRoom(){const g=this.bg,r=rooms[room];this.labels.forEach(l=>l.destroy());this.labels=[];g.clear();const floor=[0x293238,0x172e3c,0x292d40,0x35322c,0x1d3536][room];g.fillStyle(floor);g.fillRect(0,0,WIDTH,HEIGHT);
 // Inlaid tiles, service channels, illuminated wall caps and area rugs.
 for(let y=0;y<HEIGHT;y+=80)for(let x=0;x<WIDTH;x+=80){g.fillStyle((x+y)%160===0?0xffffff:0x000000,.025);g.fillRect(x+2,y+2,76,76);g.lineStyle(1,0x0a1420,.3);g.strokeRect(x,y,80,80)}
 g.fillStyle(0x0d1720);g.fillRect(0,0,WIDTH,70);g.fillRect(0,0,65,HEIGHT);g.fillRect(WIDTH-65,0,65,HEIGHT);g.fillRect(0,HEIGHT-65,WIDTH,65);
 for(let x=120;x<WIDTH-100;x+=220){g.fillStyle(0xc1e5dc,.08);g.fillEllipse(x,100,220,120);g.fillStyle(0xa4d3d0);g.fillRoundedRect(x,34,95,6,3)}
 // Built-in room architecture, floor markings and peripheral furnishings.
 for(let y=160;y<HEIGHT-100;y+=260){g.fillStyle(0x566873,.3);g.fillRoundedRect(75,y,48,110,6);g.fillStyle(0x101e28);for(let j=0;j<6;j++)g.fillRect(83,y+12+j*14,31,5);g.fillStyle(0x9dbaae,.15);g.fillEllipse(120,y+55,90,160)}
 for(let x=200;x<WIDTH-200;x+=350){g.fillStyle(0x45565e,.35);g.fillRect(x,HEIGHT-140,145,22);g.fillStyle(0x0c1d28);g.fillRect(x+8,HEIGHT-137,130,5)}
 g.lineStyle(4,room===3?0x907a4a:0x4c6264,.2);g.strokeRoundedRect(980,140,440,420,25);
 for(let i=0;i<3;i++){g.fillStyle(0x95a9a1,.1);g.fillTriangle(1180,630+i*90,1220,630+i*90,1200,610+i*90)}
 // Each zone has its own recognizable architectural silhouette and floor features.
 const deco=(x:number,y:number,w:number,h:number,c:number)=>{g.fillStyle(c,.30);g.fillRoundedRect(x,y,w,h,12);g.lineStyle(3,c,.55);g.strokeRoundedRect(x,y,w,h,12)};
 if(room===0){ // archive: cubicles, scattered paperwork and corridor arrows
  for(let x=180;x<2100;x+=360)for(let y=210;y<1550;y+=430){deco(x,y,160,100,0x8d765d);g.fillStyle(0xd3c9a3,.55);g.fillRect(x+20,y+18,48,34);g.fillRect(x+82,y+38,38,25)}
  for(let y=250;y<1600;y+=260){g.fillStyle(0xe2b46d,.3);g.fillTriangle(1150,y,1178,y+15,1150,y+30)}
 }else if(room===1){ // server racks with blue data-flow strips
  for(let x=350;x<2200;x+=330)for(let y=220;y<1650;y+=240){deco(x+15,y,70,115,0x2d8ba4);for(let j=0;j<5;j++){g.fillStyle(j%2?0x7ee4dc:0x315e8e,.7);g.fillRect(x+27,y+12+j*19,45,5)}}
  for(let y=180;y<1650;y+=340){g.lineStyle(5,0x34d4e5,.25);g.lineBetween(90,y,2310,y)}
 }else if(room===2){ // concentric research reactor rings
  for(let rad=140;rad<=500;rad+=110){g.lineStyle(14,rad%2?0xb49dff:0x6f74c6,.24);g.strokeCircle(1040,880,rad)}
  g.fillStyle(0x6c5b9e,.5);g.fillCircle(1040,880,110);g.fillStyle(0x1c1d39);g.fillCircle(1040,880,75);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillStyle(0xaba6ff,.55);g.fillCircle(1040+155*Math.cos(a),880+155*Math.sin(a),7)}
 }else if(room===3){ // industrial grid with warning stripes and power nodes
  for(let x=240;x<2200;x+=520)for(let y=230;y<1700;y+=450){deco(x,y,175,175,0xc7a046);g.fillStyle(0xf8b84d,.5);g.fillTriangle(x+88,y+25,x+38,y+130,x+135,y+130)}
  for(let y=350;y<1700;y+=440){g.fillStyle(0xffc25e,.26);for(let x=100;x<2300;x+=90)g.fillRect(x,y,45,13)}
 }else{ // security vault: hexagonal seals and concentric guarded platforms
  for(let i=0;i<4;i++){g.lineStyle(10,0xe0bc71,.12+i*.03);g.strokeCircle(1190,870,210+i*145)}
  for(let x=230;x<2200;x+=360)for(let y=200;y<1600;y+=360){g.lineStyle(4,0xe4c27b,.22);g.strokeCircle(x,y,48);g.fillStyle(0xe4c27b,.22);g.fillCircle(x,y,12)}
  deco(1940,110,350,240,0xb6a16d);
 }
 for(const wall of walls(room)){g.fillStyle(0x000000,.3);g.fillRect(wall.x+14,wall.y+18,wall.w,wall.h);g.fillStyle(0x0d1a26);g.fillRect(wall.x,wall.y,wall.w,wall.h);g.fillStyle(0x52616b);g.fillRect(wall.x,wall.y,wall.w,8);g.fillStyle(0x779094,.3);g.fillRect(wall.x,wall.y+8,5,wall.h-8)}
 const zones=['ARCHIVE / 01','DATA / 02','RESEARCH / 03','POWER / 04','CORE / 05'];this.labels.push(this.add.text(100,100,zones[room],{fontFamily:'monospace',fontSize:'38px',color:'#8ba3a0'}).setAlpha(.45));
 const p=placements(seed,room,r.spots.length);this.points=r.spots.map((s,i)=>({...s,...p[i]}));this.points.push({id:'terminal',name:'破譯終端',...terminal,kind:'terminal'},{id:'exit',name:solved?'逃生通道・已解鎖':'安全門・封鎖',...exit,kind:'door'});
 for(const s of this.points){const x=s.x,y=s.y;g.fillStyle(0x000000,.25);g.fillEllipse(x+8,y+25,105,38);
 if(s.kind==='door'){g.fillStyle(0x131e28);g.fillRoundedRect(x-68,y-78,136,146,10);g.fillStyle(0x75858c);g.fillRect(x-57,y-69,114,126);g.fillStyle(0x2f4655);const gap=solved?33:1;g.fillRect(x-51,y-62,50-gap,112);g.fillRect(x+gap,y-62,50-gap,112);g.fillStyle(solved?0xb8d7c2:0xb59a76);g.fillRect(x-30,y-76,60,5);g.fillStyle(0x090f16);g.fillRect(x-35,y+62,70,9)}
 else if(s.kind==='screen'||s.kind==='terminal'){g.fillStyle(0x455864);g.fillRoundedRect(x-47,y-38,94,80,9);g.fillStyle(0x76858b);g.fillRect(x-43,y+20,86,14);g.fillStyle(0x0b202d);g.fillRoundedRect(x-37,y-31,74,45,4);g.fillStyle(0x79bdc5,.65);for(let i=0;i<4;i++)g.fillRect(x-27,y-22+i*8,36+(i%2)*14,3);g.fillStyle(0x263c47);for(let i=0;i<7;i++)g.fillRect(x-30+i*9,y+24,5,3)}
 else if(s.kind==='board'){g.fillStyle(0x8e8c78);g.fillRoundedRect(x-50,y-32,100,67,4);g.fillStyle(0xd7d5ba);g.fillRect(x-45,y-28,90,55);g.fillStyle(0x73868a);for(let i=0;i<4;i++)g.fillRect(x-32,y-18+i*10,55-i*6,3);g.fillStyle(0xab6b59);g.fillCircle(x+31,y-17,4)}
 else if(s.kind==='desk'){g.fillStyle(0x443b35);g.fillRoundedRect(x-60,y-35,120,80,8);g.fillStyle(0x8b7860);g.fillRoundedRect(x-60,y-42,120,65,7);g.fillStyle(0xd8cfb4);g.fillRect(x-35,y-30,33,39);g.fillStyle(0x637a80);g.fillRect(x+10,y-28,30,22);g.fillStyle(0xd1b08b);g.fillCircle(x+39,y+6,7)}
 else if(s.kind==='rack'){g.fillStyle(0x384552);g.fillRoundedRect(x-39,y-58,78,112,6);for(let i=0;i<5;i++){g.fillStyle(0x172735);g.fillRect(x-31,y-49+i*20,62,16);g.fillStyle(0x729c9d);g.fillCircle(x-20,y-41+i*20,2);g.fillStyle(0x455b67);g.fillRect(x-9,y-45+i*20,31,3)}}
 else if(s.kind==='power'){g.fillStyle(0x56646a);g.fillRoundedRect(x-38,y-48,76,97,7);g.fillStyle(0x283842);g.fillRect(x-28,y-37,56,58);g.fillStyle(0xccae68);g.fillTriangle(x+2,y-29,x-14,y+1,x+14,y-5);g.fillStyle(0x12222c);g.fillRect(x-20,y+29,40,7)}
 else{g.fillStyle(0x726450);g.fillRoundedRect(x-38,y-26,76,59,6);g.fillStyle(0x9d8e71);g.fillRect(x-40,y-32,80,18);g.fillStyle(0x424341);g.fillRect(x-9,y-5,18,8);g.fillStyle(0xc2b698);g.fillRect(x-24,y-25,29,6)}
 if(seen.includes(s.id)){this.labels.push(this.add.text(x+30,y+43,'✓',{fontSize:'18px',color:'#b9c5bf'}))}
 }
 paintMap();
 }
 resetEscape(){
  this.escapeToken++;
  this.time.removeAllEvents();
  this.tweens.killAll();
  for(const obj of this.escapeObjects)obj.destroy();
  this.escapeObjects=[];
  this.cameras.main.resetFX();
  this.cameras.main.setZoom(this.scale.width<700?1.05:1.15);
  this.cameras.main.startFollow(this.player,true,.12,.12);
  this.prompt.setVisible(false);
  this.target='';
 }
 playEscape(done:()=>void){
  this.resetEscape();
  const token=this.escapeToken;
  this.target='';this.prompt.setVisible(false);
  this.cameras.main.stopFollow();this.cameras.main.pan(exit.x,exit.y,1250,'Sine.easeInOut');
  this.cameras.main.zoomTo(1.48,1350);
  const gate=this.add.graphics().setDepth(40);const glow=this.add.graphics().setDepth(39);
  const status=this.add.text(exit.x,exit.y-195,'ACCESS GRANTED  //  EXIT UNLOCKED',{fontFamily:'monospace',fontSize:'26px',color:'#a9ffe3',backgroundColor:'#061720dd',padding:{x:18,y:10}}).setOrigin(.5).setDepth(45);
  this.escapeObjects.push(gate,glow,status);
  const state={opening:0};
  const paint=()=>{gate.clear();glow.clear();glow.fillStyle(0x83fff1,.20+state.opening*.50);glow.fillRect(exit.x-75,exit.y-95,150,210);
   gate.fillStyle(0x091b2b);gate.fillRoundedRect(exit.x-120,exit.y-130,240,260,14);
   gate.fillStyle(0xd8fff1,state.opening*.9);gate.fillRect(exit.x-95,exit.y-104,190,216);
   gate.fillStyle(0x6a8793);gate.fillRoundedRect(exit.x-105-state.opening*105,exit.y-108,102,216,7);
   gate.fillRoundedRect(exit.x+3+state.opening*105,exit.y-108,102,216,7);
   gate.lineStyle(5,0x9bead1);gate.strokeRoundedRect(exit.x-120,exit.y-130,240,260,14);
  };paint();
  this.cameras.main.shake(350,.004);
  this.time.delayedCall(1200,()=>{if(token!==this.escapeToken)return;status.setText('VAULT PRESSURE RELEASED  //  OPENING');this.cameras.main.shake(900,.007);
   this.tweens.add({targets:state,opening:1,duration:3000,ease:'Sine.easeInOut',onUpdate:paint,onComplete:()=>{if(token!==this.escapeToken)return;
    status.setText('ESCAPE ROUTE CLEAR  //  RUN!');this.tweens.add({targets:this.player,x:exit.x,y:exit.y,duration:1900,ease:'Sine.easeInOut',onComplete:()=>{if(token!==this.escapeToken)return;
     this.cameras.main.flash(950,224,255,246);this.time.delayedCall(1050,()=>{if(token===this.escapeToken)done()});
    }});
   }});
  });
 }
 update(_t:number,delta:number){if(locked){this.target='';this.prompt.setVisible(false);return}const k=this.keys;let dx=Number(held.right||k.RIGHT.isDown||k.D.isDown)-Number(held.left||k.LEFT.isDown||k.A.isDown),dy=Number(held.down||k.DOWN.isDown||k.S.isDown)-Number(held.up||k.UP.isDown||k.W.isDown);const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const step=330*Math.min(delta,45)/1000;const x=this.player.x,y=this.player.y;if(!blocked(x+dx*step,y,room))this.player.x+=dx*step;if(!blocked(this.player.x,y+dy*step,room))this.player.y+=dy*step;
 this.avatar.y=(dx||dy)?Math.sin(_t/95)*2:0;const p=this.points.reduce((a,b)=>Phaser.Math.Distance.Between(a.x,a.y,this.player.x,this.player.y)<Phaser.Math.Distance.Between(b.x,b.y,this.player.x,this.player.y)?a:b);this.target=Math.hypot(p.x-this.player.x,p.y-this.player.y)<155?p.id:'';onNear(this.target?p.name:'');this.prompt.setVisible(!!this.target).setPosition(p.x,p.y-87).setText(p.name+'  ·  E 互動');if(_t-lastMapPaint>100){lastMapPaint=_t;paintMap()}}
 }
 const game=new Phaser.Game({type:Phaser.AUTO,parent:container,width:container.clientWidth||1200,height:container.clientHeight||700,scale:{mode:Phaser.Scale.RESIZE},backgroundColor:'#0c1821',fps:{forceSetTimeOut:true,target:60},scene:Lab});
 const resize=new ResizeObserver(()=>game.scale.resize(container.clientWidth,container.clientHeight));resize.observe(container);
 return {destroy:()=>{resize.disconnect();active=undefined;game.destroy(true);mapCanvas.remove();container.style.position=priorPosition},setRoom:n=>{room=Math.min(n,4);if(active){active.resetEscape();active.player.setPosition(start.x,start.y);active.drawRoom()}},setLocked:v=>{locked=v;for(const d of Object.keys(held) as Direction[])held[d]=false;if(active?.input.keyboard){active.input.keyboard.resetKeys();active.input.keyboard.enabled=!v}},setProgress:(v,s)=>{solved=v;seen=s;active?.drawRoom()},setProfile:(v,n)=>{gender=v;seed=n;active?.drawPlayer();active?.drawRoom()},playEscape:done=>{active?.playEscape(done)},resetEscape:()=>{active?.resetEscape()},interact,left:v=>{held.left=v},right:v=>{held.right=v},up:v=>{held.up=v},down:v=>{held.down=v}};
}
