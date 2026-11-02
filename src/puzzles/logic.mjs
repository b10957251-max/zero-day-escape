// Pure, independently testable puzzle logic. Educational toy cryptography only.
export const vigDecrypt=(cipher,key)=>[...cipher].map((c,i)=>String.fromCharCode(65+((c.charCodeAt(0)-65)-(key.charCodeAt(i%key.length)-65)+26)%26)).join('');
export const hash=x=>(7*x*x+11*x+5)%101;
export const hashCandidates=[14,27,39,52,68];
export const hashTarget=hash(39);
export const modPow=(b,e,m)=>{let r=1;for(let i=0;i<e;i++)r=r*b%m;return r};
export const rsaN=55,rsaE=3,rsaD=27,rsaCipher=modPow(12,rsaE,rsaN);
export const pow=n=>(17*n+9)%41;
export const powTarget=4;
export const nonce=Array.from({length:41},(_,i)=>i).find(i=>pow(i)<powTarget);
export const plain=vigDecrypt('FESVX','KEY');
export const rsaPlain=modPow(rsaCipher,rsaD,rsaN);
export const clues=[plain,39,rsaPlain,nonce];
export const lettersSum=word=>[...word].reduce((a,c)=>a+c.charCodeAt(0)-64,0);
export const two=n=>String(n).padStart(2,'0');
export const finalParts=[lettersSum(plain)%100,(39+rsaPlain)%100,(11*nonce+5)%100];
export const finalCode=finalParts.map(two).join('');
export const answers=[plain,'39',String(rsaPlain),String(nonce),finalCode];
export function verifyPuzzle(i,answer){return (i===0?answer.trim().toUpperCase():answer.trim())===answers[i]}
export function assertIntegrity(){if(plain!=='VAULT'||hashCandidates.filter(x=>hash(x)===hashTarget).join()!=='39'||rsaPlain!==12||rsaCipher!==23||nonce!==2||finalCode!=='765127'||Array.from({length:nonce},(_,i)=>i).some(i=>pow(i)<powTarget))throw Error('題目完整性驗證失敗')}
assertIntegrity();
