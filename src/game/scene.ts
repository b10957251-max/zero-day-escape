import Phaser from 'phaser';
import {rooms} from './rooms';
import {WIDTH,HEIGHT,walls,blocked,placements,start,terminal,exit} from './layout';
export type Direction='left'|'right'|'up'|'down';
export type WorldHandle={destroy:()=>void;setRoom:(n:number)=>void;setLocked:(v:boolean)=>void;setProgress:(v:boolean,s:string[])=>void;setProfile:(gender:string,seed:number)=>void;interact:()=>void;left:(v:boolean)=>void;right:(v:boolean)=>void;up:(v:boolean)=>void;down:(v:boolean)=>void};
export function createWorld(container:HTMLElement,onInteract:(id:string)=>void,onNear:(name:string)=>void):WorldHandle{
 let room=0,locked=true,solved=false,seed=1,gender='male',seen:string[]=[],active:Lab|undefined;
 const held={left:false,right:false,up:false,down:false};
 const interact=()=>{if(!locked&&active?.target)onInteract(active.target)};
 class Lab extends Phaser.Scene{
 bg!:Phaser.GameObjects.Graphics;player!:Phaser.GameObjects.Container;avatar!:Phaser.GameObjects.Graphics;prompt!:Phaser.GameObjects.Text;keys!:Record<string,Phaser.Input.Keyboard.Key>;target='';labels:Phaser.GameObjects.Text[]=[];points:{id:string;name:string;x:number;y:number;kind:string}[]=[];
 constructor(){super('lab')}
 create(){active=this;this.bg=this.add.graphics();this.player=this.add.container(start.x,start.y).setDepth(10);this.avatar=this.add.graphics();this.player.add(this.avatar);this.prompt=this.add.text(0,0,'',{fontFamily:'system-ui',fontSize:'17px',color:'#faf2da',backgroundColor:'#09131eea',padding:{x:15,y:10}}).setOrigin(.5,1).setDepth(20);this.keys=this.input.keyboard!.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,E') as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard!.on('keydown-E',interact);this.input.keyboard!.enabled=!locked;this.cameras.main.setBounds(0,0,WIDTH,HEIGHT);this.cameras.main.startFollow(this.player,true,.12,.12);this.scale.on('resize',()=>this.resize());this.resize();this.drawRoom();this.drawPlayer();}
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
 }
 update(_t:number,delta:number){if(locked){this.target='';this.prompt.setVisible(false);return}const k=this.keys;let dx=Number(held.right||k.RIGHT.isDown||k.D.isDown)-Number(held.left||k.LEFT.isDown||k.A.isDown),dy=Number(held.down||k.DOWN.isDown||k.S.isDown)-Number(held.up||k.UP.isDown||k.W.isDown);const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const step=330*Math.min(delta,45)/1000;const x=this.player.x,y=this.player.y;if(!blocked(x+dx*step,y,room))this.player.x+=dx*step;if(!blocked(this.player.x,y+dy*step,room))this.player.y+=dy*step;
 this.avatar.y=(dx||dy)?Math.sin(_t/95)*2:0;const p=this.points.reduce((a,b)=>Phaser.Math.Distance.Between(a.x,a.y,this.player.x,this.player.y)<Phaser.Math.Distance.Between(b.x,b.y,this.player.x,this.player.y)?a:b);this.target=Math.hypot(p.x-this.player.x,p.y-this.player.y)<115?p.id:'';onNear(this.target?p.name:'');this.prompt.setVisible(!!this.target).setPosition(p.x,p.y-87).setText(p.name+'  ·  E 互動');}
 }
 const game=new Phaser.Game({type:Phaser.AUTO,parent:container,width:container.clientWidth||1200,height:container.clientHeight||700,scale:{mode:Phaser.Scale.RESIZE},backgroundColor:'#0c1821',fps:{forceSetTimeOut:true,target:60},scene:Lab});
 const resize=new ResizeObserver(()=>game.scale.resize(container.clientWidth,container.clientHeight));resize.observe(container);
 return {destroy:()=>{resize.disconnect();active=undefined;game.destroy(true)},setRoom:n=>{room=Math.min(n,4);if(active){active.player.setPosition(start.x,start.y);active.drawRoom()}},setLocked:v=>{locked=v;for(const d of Object.keys(held) as Direction[])held[d]=false;if(active?.input.keyboard){active.input.keyboard.resetKeys();active.input.keyboard.enabled=!v}},setProgress:(v,s)=>{solved=v;seen=s;active?.drawRoom()},setProfile:(v,n)=>{gender=v;seed=n;active?.drawPlayer();active?.drawRoom()},interact,left:v=>{held.left=v},right:v=>{held.right=v},up:v=>{held.up=v},down:v=>{held.down=v}};
}
