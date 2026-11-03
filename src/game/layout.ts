export const WIDTH=2400,HEIGHT=1800;
export type Rect={x:number;y:number;w:number;h:number};
export type Position={x:number;y:number};
// Each room uses a separate traversable floor plan; gaps are wide enough for the player.
export function walls(room:number):Rect[]{
 switch(room){
 case 0: // archive: zigzag office partitions
  return [{x:430,y:120,w:32,h:850},{x:850,y:750,w:32,h:850},{x:1320,y:120,w:32,h:850},{x:1790,y:750,w:32,h:850},{x:350,y:1190,w:260,h:28}];
 case 1: // data center: parallel server aisles and cross lanes
  return [350,680,1010,1340,1670,2000].flatMap((x,i)=>[{x,y:i%2?280:520,w:110,h:520},{x,y:i%2?1130:1320,w:110,h:250}]);
 case 2: // RSA core: concentric, broken-square containment rings
  return [{x:530,y:360,w:850,h:36},{x:530,y:360,w:36,h:440},{x:530,y:1050,w:36,h:350},{x:530,y:1364,w:850,h:36},{x:1344,y:360,w:36,h:380},{x:1344,y:990,w:36,h:410},{x:1700,y:400,w:36,h:440},{x:1700,y:1150,w:36,h:350}];
 case 3: // power grid: isolated-looking islands with broad connecting passages
  return [{x:520,y:250,w:36,h:520},{x:520,y:1120,w:36,h:460},{x:900,y:450,w:460,h:36},{x:900,y:1220,w:460,h:36},{x:1600,y:180,w:36,h:500},{x:1600,y:1000,w:36,h:520},{x:1930,y:690,w:300,h:36}];
 default: // vault: staggered security baffles
  return [{x:430,y:280,w:480,h:40},{x:430,y:280,w:40,h:480},{x:800,y:630,w:480,h:40},{x:1250,y:280,w:40,h:550},{x:520,y:1120,w:500,h:40},{x:1160,y:1350,w:550,h:40},{x:1780,y:540,w:40,h:650},{x:2020,y:1150,w:240,h:40}];
 }
}
export function blocked(x:number,y:number,room:number,pad=30){return x<65||y<65||x>WIDTH-65||y>HEIGHT-65||walls(room).some(r=>x>r.x-pad&&x<r.x+r.w+pad&&y>r.y-pad&&y<r.y+r.h+pad)}
export function placements(seed:number,room:number,count:number):Position[]{
 let n=(seed+room*7919)>>>0;const rand=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296};
 const pool:Position[]=[];for(let y=170;y<1650;y+=135)for(let x=170;x<2260;x+=135)if(!blocked(x,y,room,75)&&Math.hypot(x-1200,y-350)>150&&Math.hypot(x-2220,y-220)>150&&Math.hypot(x-1200,y-1550)>150)pool.push({x,y});
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}const chosen:Position[]=[];
 for(const [qx,qy] of [[0,0],[1,0],[0,1],[1,1]]){const i=pool.findIndex(p=>Number(p.x>=WIDTH/2)===qx&&Number(p.y>=HEIGHT/2)===qy);if(i>=0)chosen.push(...pool.splice(i,1));}
 const result=[...chosen,...pool].slice(0,count);for(let i=result.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result;
}
export const start={x:1200,y:1550},terminal={x:1200,y:350},exit={x:2220,y:220};
