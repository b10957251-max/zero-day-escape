import { finalCode, hashTarget, rsaCipher, rsaN, rsaE, rsaD, powTarget, clues } from './logic.mjs';
export type Puzzle={title:string;scene:string;story:string;formula:string;instructions:string;hint:string;placeholder:string};
export const puzzles:Puzzle[]=[
 {title:'維吉尼亞密碼',scene:'密文分析室',story:'備援終端機留下多字母替換密文，破解後才能取得第一道門的權限。',formula:'密文：FESVX　｜　金鑰：KEY（重複為 KEYKE）',instructions:'A=0 至 Z=25；逐字解密 Pᵢ=(Cᵢ−Kᵢ) mod 26。輸入五個英文字母。',hint:'第一個字母：F=5，K=10，(5−10) mod 26=21，得到 V。',placeholder:'輸入五個英文字母'},
 {title:'雜湊驗證',scene:'雜湊驗證室',story:'比對候選識別碼，找出與伺服器雜湊值相同的輸入。',formula:`H(x)=(7x²+11x+5) mod 101\n目標雜湊：${hashTarget}\n候選：14、27、39、52、68`,instructions:'逐一計算候選值的雜湊，輸入唯一符合的原始數字。',hint:'先算平方項，再加上 11x+5，最後除以 101 取餘數。',placeholder:'輸入識別碼'},
 {title:'RSA 私鑰解密',scene:'RSA 加密機房',story:'安全模組只接受使用私鑰還原的明文。',formula:`n=${rsaN}　e=${rsaE}　d=${rsaD}\n密文 C=${rsaCipher}`,instructions:'計算 M=Cᵈ mod n，輸入明文整數。',hint:'使用反覆平方：27=16+8+2+1，分別求餘數後相乘再取 mod 55。',placeholder:'輸入明文整數'},
 {title:'PoW 工作量證明',scene:'區塊鏈節點室',story:'找到第一個滿足難度條件的 Nonce，讓節點接受區塊。',formula:`H(n)=(17n+9) mod 41\n難度：H(n)<${powTarget}`,instructions:'從 n=0 開始逐一嘗試，輸入最小非負整數 Nonce。',hint:'從 0 開始，逐次把 17n+9 除以 41 取餘數；第一次小於 4 就停止。',placeholder:'輸入最小 Nonce'},
 {title:'最終安全金庫',scene:'核心金庫',story:'整合四組授權線索，解除零日危機的最後封鎖。',formula:`四組線索：${clues.join(' / ')}\n① 英文字母 A=1 至 Z=26 的序號總和 mod 100\n② (第二關識別碼 + RSA 明文) mod 100\n③ (11 × PoW Nonce + 5) mod 100`,instructions:'三組結果各補足兩位數，依 ①②③ 順序串接成六位數通行碼。',hint:'三組各自計算，不是全部相加。注意第一組 A=1 而非 A=0。',placeholder:'輸入六位數通行碼'}
];
export { verifyPuzzle, answers, clues, finalCode } from './logic.mjs';
