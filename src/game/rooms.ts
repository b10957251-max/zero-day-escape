export type Spot={id:string;name:string;x:number;kind:string;text:string;needs?:string;gives?:string;required?:boolean;category?:string};
export const rooms:{name:string;color:number;spots:Spot[]}[]=[
{name:'廢棄辦公室',color:0x433a32,spots:[
{id:'board',name:'密碼白板',x:180,kind:'board',text:'字母索引從 A=0 開始。密文減去金鑰，負數要加回 26。第一字母：F−K → V。'},
{id:'paper',name:'碎紙籃',x:350,kind:'box',text:'拼起碎紙後看見「KEY」。你拾起抽屜鑰匙。',gives:'drawerKey'},
{id:'drawer',name:'上鎖抽屜',x:540,kind:'desk',needs:'drawerKey',text:'金鑰必須重複到與密文等長：KEYKE。紙背提醒：每個字母分別計算。'},
{id:'memo',name:'員工便條',x:730,kind:'screen',text:'值班紀錄：機台更換過電池。這張便條沒有解密資訊。'}]},
{name:'資料伺服器室',color:0x123b4a,spots:[
{id:'rack',name:'機櫃標籤',x:140,kind:'rack',text:'原始識別碼與雜湊值不同。先算完整多項式，最後才取餘數。'},
{id:'badge',name:'維護工具箱',x:330,kind:'box',text:'取得維護卡，可讀取備援終端。',gives:'serviceCard'},
{id:'backup',name:'備援終端',x:590,kind:'screen',needs:'serviceCard',text:'測試資料：H(14)=16、H(27)=52。它們都與目標不符；仍需比對其他候選。'},
{id:'archive',name:'舊版資料架',x:810,kind:'rack',text:'已過期紀錄：線性函數 H(x)=7x+3。標示「舊版停用」，不可套用本關。'}]},
{name:'地下研究室',color:0x30334d,spots:[
{id:'notes',name:'研究筆記',x:130,kind:'desk',text:'不要直接輸入 23 的 27 次方：27=16+8+2+1，可拆成四個模次方。'},
{id:'fuse',name:'器材櫃',x:380,kind:'box',text:'找到一枚可用保險絲。',gives:'labFuse'},
{id:'power',name:'實驗電源',x:620,kind:'power',needs:'labFuse',text:'裝入保險絲，實驗儀器恢復供電。',gives:'labPower'},
{id:'scope',name:'模次方儀器',x:850,kind:'screen',needs:'labPower',text:'23² mod 55=34；23⁴ mod 55=1。繼續求 8、16 次方，再組合 27 次方。'}]},
{name:'緊急供電區',color:0x45351e,spots:[
{id:'manual',name:'安全操作牌',x:180,kind:'board',text:'有效不代表最小！Nonce 必須從 0 開始依序檢查。'},
{id:'lever',name:'主電源拉桿',x:420,kind:'power',text:'主電源已接通，測試裝置現在可操作。',gives:'gridPower'},
{id:'tester',name:'Nonce 測試裝置',x:710,kind:'screen',needs:'gridPower',text:'啟動自我檢查：n=0 時 H=9，n=1 時 H=26，皆不合格。下一個由你計算。'},
{id:'log',name:'巡檢箱',x:900,kind:'box',text:'巡檢備註：結果必須嚴格小於 4，等於 4 也不接受。'}]},
{name:'中央控制核心',color:0x143b37,spots:[
{id:'alpha',name:'字母授權台',x:140,kind:'board',text:'最終金庫改用 A=1 至 Z=26。VAULT 有五個字母，別沿用第一關的零起算。',gives:'alphaSeal'},
{id:'sum',name:'識別整合台',x:380,kind:'screen',text:'第二組將第二關識別碼與第三關明文相加，再 mod 100。',gives:'sumSeal'},
{id:'nonce',name:'區塊授權台',x:640,kind:'power',text:'第三組為 11×Nonce+5，再 mod 100。先乘再加。',gives:'nonceSeal'},
{id:'combine',name:'三因子校準台',x:870,kind:'desk',needs:'allSeals',text:'三個授權台均已校準。每組補成兩位後串接，不能把三組直接相加。',gives:'coreReady'}]}
];

// Three or four discovery tasks unlock the method; decoys never count.
const required=[['board','paper','drawer'],['rack','badge','backup'],['notes','fuse','power','scope'],['manual','lever','tester'],['alpha','sum','nonce','combine']];
const formulas=[
 '解密規則：A=0 至 Z=25；P=(C−K) mod 26，金鑰 KEY 重複為 KEYKE。',
 '現行函數：H(x)=(7x²+11x+5) mod 101。先平方、乘法、加總，最後取餘數。',
 '私鑰解密：M=Cᵈ mod n。反覆平方可避免計算巨大次方。',
 '測試函數：H(n)=(17n+9) mod 41；從 n=0 開始，找第一個 H(n)<4 的值。',
 '第一組使用 A=1；第二組為識別碼加 RSA 明文；第三組為 11×Nonce+5，各 mod 100。'
];
for(const [i,r] of rooms.entries()){
 for(const s of r.spots){s.required=required[i].includes(s.id);s.category=s.required?'線索':'紀錄'}
 r.spots[0].text+=' '+formulas[i];
 const decoys=[
 ['空置物櫃','rack','只有灰塵與一張褪色標籤，沒有可用線索。','空值'],
 ['封存資料箱','box','舊版密碼 000000。封條註記：測試環境停用，非本區通行碼。','紀錄'],
 ['休息桌','desk','咖啡早已冷掉。便條寫著：「下班記得關燈。」','紀錄'],
 ['損壞工作站','screen','硬碟已移除，沒有留下資料。','空值'],
 ['維修儲物箱','box','箱子是空的，只有缺角的泡棉。','空值'],
 ['過期公告','board','上個月的消防演練公告，與目前任務無關。','紀錄']
 ];
 decoys.forEach(([name,kind,text,category],j)=>r.spots.push({id:'decoy'+j,name,kind,text,category,x:0}));
}
export const collected=(room:number,seen:string[])=>rooms[room].spots.filter(s=>s.required&&seen.includes(`${room}:${s.id}`)).length;
export const needed=(room:number)=>rooms[room].spots.filter(s=>s.required).length;
export const ready=(room:number,seen:string[])=>collected(room,seen)===needed(room);
export const questions=[
 '密文：FESVX。請還原五個英文字母。金鑰與編碼規則藏在本區。',
 '目標雜湊：72；候選識別碼：14、27、39、52、68。找出相符的原始識別碼。',
 '密文 C=23；n=55、e=3、d=27。請還原明文整數。',
 '難度條件 H(n)<4。輸入最小非負整數 Nonce。現行測試函數藏在設備紀錄中。',
 '依前四關授權線索，產生六位數金庫通行碼。組合規則藏在授權台中。'
];
