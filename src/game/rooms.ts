export type Spot={id:string;name:string;x:number;kind:string;text:string;needs?:string;gives?:string};
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
