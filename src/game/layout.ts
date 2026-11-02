export const WIDTH=2400,HEIGHT=1800;
export type Rect={x:number;y:number;w:number;h:number};
export type Position={x:number;y:number};
export function walls(room:number):Rect[]{
 const a=[650,800,700,550,900][room],b=[900,1000,1050,750,1150][room],c=[1500,1600,1500,1700,1550][room];
 return [{x:a,y:180,w:30,h:420},{x:a,y:850,w:30,h:620},{x:c,y:250,w:30,h:400},{x:c,y:950,w:30,h:550},{x:950,y:b,w:300,h:28},{x:1800,y:1150,w:300,h:28}];
}
export function blocked(x:number,y:number,room:number,pad=30){return x<65||y<65||x>WIDTH-65||y>HEIGHT-65||walls(room).some(r=>x>r.x-pad&&x<r.x+r.w+pad&&y>r.y-pad&&y<r.y+r.h+pad)}
export function placements(seed:number,room:number,count:number):Position[]{
 let n=(seed+room*7919)>>>0;const rand=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296};
 const pool:Position[]=[];for(let y=250;y<1600;y+=270)for(let x=250;x<2250;x+=270)if(!blocked(x,y,room,115)&&Math.hypot(x-1200,y-350)>150&&Math.hypot(x-2220,y-220)>150&&Math.hypot(x-1200,y-1550)>150)pool.push({x,y});
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}const chosen:Position[]=[];
 for(const [qx,qy] of [[0,0],[1,0],[0,1],[1,1]]){const i=pool.findIndex(p=>Number(p.x>=WIDTH/2)===qx&&Number(p.y>=HEIGHT/2)===qy);if(i>=0)chosen.push(...pool.splice(i,1));}
 const result=[...chosen,...pool].slice(0,count);for(let i=result.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result;
}
export const start={x:1200,y:1550},terminal={x:1200,y:350},exit={x:2220,y:220};
