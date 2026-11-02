import Phaser from 'phaser';
export type WorldHandle={destroy:()=>void;setRoom:(n:number)=>void;setLocked:(v:boolean)=>void;left:(v:boolean)=>void;right:(v:boolean)=>void};
export function createWorld(container:HTMLElement,onInteract:()=>void,onNear:(near:boolean)=>void):WorldHandle{
 let room=0,locked=true,holdLeft=false,holdRight=false;
 class Lab extends Phaser.Scene{
  player!:Phaser.GameObjects.Container; label!:Phaser.GameObjects.Text; prompt!:Phaser.GameObjects.Text; bg!:Phaser.GameObjects.Graphics;
  keys!:Record<string,Phaser.Input.Keyboard.Key>; near=false;
  constructor(){super('lab')}
  create(){
   this.bg=this.add.graphics();this.drawRoom();
   this.player=this.add.container(90,382);
   const body=this.add.graphics();body.fillStyle(0x48e0d8);body.fillRoundedRect(-15,-28,30,38,5);body.fillStyle(0x173c55);body.fillRect(-10,-16,20,17);body.fillStyle(0xe5ac89);body.fillRoundedRect(-10,-51,20,22,4);body.fillStyle(0x182b41);body.fillRect(-12,-54,24,8);body.fillStyle(0x203f57);body.fillRect(-12,10,10,25);body.fillRect(3,10,10,25);body.fillStyle(0xe5ac89);body.fillRect(-21,-24,6,24);body.fillRect(15,-24,6,24);this.player.add(body);
   this.label=this.add.text(24,20,'', {fontFamily:'system-ui',fontSize:'20px',fontStyle:'bold',color:'#b6fbf4'}).setDepth(4);
   this.prompt=this.add.text(700,112,'E / 互動',{fontFamily:'system-ui',fontSize:'19px',fontStyle:'bold',color:'#f7d38d'}).setDepth(4);
   const keyboard=this.input.keyboard!;this.keys=keyboard.addKeys('LEFT,RIGHT,A,D,E') as Record<string,Phaser.Input.Keyboard.Key>;
   keyboard.on('keydown-E',()=>{if(!locked&&this.near)onInteract()});
  }
  drawRoom(){const g=this.bg;g.clear();const colors=[0x102c40,0x192944,0x103a43,0x2a2844,0x293441];g.fillGradientStyle(colors[room],0x07121f,colors[room],0x07121f);g.fillRect(0,0,960,540);
   for(let x=0;x<960;x+=120){g.fillStyle(0x31516b,.5);g.fillRect(x,60,4,365);g.fillStyle(0x11283c);g.fillRect(x+12,92,96,210);g.lineStyle(2,0x2a5870);g.strokeRect(x+12,92,96,210)}
   for(let x=42;x<590;x+=160){g.fillStyle(0x091b2c);g.fillRoundedRect(x,170,105,245,4);for(let y=188;y<395;y+=30){g.fillStyle(0x20415b);g.fillRect(x+10,y,85,20);g.fillStyle(y%3?0x48d9bd:0xf4bd6d);g.fillCircle(x+20,y+10,3)}}
   g.fillStyle(0x182b3b);g.fillRect(0,425,960,115);g.fillStyle(0x6697a8);g.fillRect(0,422,960,4);for(let x=0;x<960;x+=70){g.fillStyle(0x2a3b4d);g.fillRect(x,450,3,90)}
   g.fillStyle(0x19394e);g.fillRoundedRect(655,194,136,222,6);g.fillStyle(0x041926);g.fillRoundedRect(666,204,114,98,4);g.fillStyle(0x1f8393);g.fillRect(675,212,96,82);g.fillStyle(0x53f3e7);g.fillRect(693,231,59,5);g.fillRect(693,246,44,5);g.fillRect(693,261,69,5);g.fillStyle(0x82e5e8);g.fillRect(710,314,26,4);
   g.fillStyle(0x070f1b);g.fillRoundedRect(838,145,111,278,5);g.fillStyle(0x2e4d64);g.fillRoundedRect(849,155,90,265,3);g.fillStyle(0x102637);g.fillRect(860,166,68,243);g.fillStyle(0xba5266);g.fillRect(861,189,66,8);g.fillRect(861,386,66,8);
   for(let x=100;x<960;x+=240){g.fillStyle(0x6eeaf0,.5);g.fillRoundedRect(x,38,110,8,4)}
  }
  update(_t:number,delta:number){if(locked)return;const movingLeft=holdLeft||this.keys?.LEFT?.isDown||this.keys?.A?.isDown;const movingRight=holdRight||this.keys?.RIGHT?.isDown||this.keys?.D?.isDown;const dir=Number(movingRight)-Number(movingLeft);this.player.x=Phaser.Math.Clamp(this.player.x+dir*260*Math.min(delta,50)/1000,25,813);this.near=Math.abs(this.player.x-718)<115;this.prompt.setVisible(this.near);onNear(this.near);}
 }
 const config:Phaser.Types.Core.GameConfig={type:Phaser.AUTO,width:960,height:540,parent:container,backgroundColor:'#07111e',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{pixelArt:true,antialias:false},scene:Lab};
 const game=new Phaser.Game(config);
 const setRoom=(n:number)=>{room=Math.min(n,4);const scene=game.scene.getScene('lab') as Lab;if(scene?.bg){scene.drawRoom();scene.player.x=90;scene.label.setText(`B2 / ${['密文分析室','雜湊驗證室','RSA 加密機房','區塊鏈節點室','核心金庫'][room]}`)}};
 const setLocked=(v:boolean)=>{locked=v};
 game.events.once(Phaser.Core.Events.READY,()=>setRoom(room));
 return {destroy:()=>game.destroy(true),setRoom,setLocked,left:v=>{holdLeft=v},right:v=>{holdRight=v}};
}
