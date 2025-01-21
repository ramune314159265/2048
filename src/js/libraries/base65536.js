/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/base65536@4.0.3/src/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const t={},o={};["㐀䳿一黿ꄀꏿꔀꗿ𐘀𐛿𒀀𒋿𓀀𓏿𔐀𔗿𖠀𖧿𠀀𨗿","ᔀᗿ"].forEach(((r,n)=>{const e=16-8*n;t[e]={};let c=0;r.match(/../gu).forEach((r=>{const[n,f]=[...r].map((t=>t.codePointAt(0)));for(let r=n;r<=f;r++){const n=String.fromCodePoint(r),f=16===e?c%256*256+(c>>8):c;t[e][f]=n,o[n]=[e,f],c++}}))}));const r=o=>{const r=o.length;let n="",e=0,c=0;for(let f=0;f<r;f++){const r=o[f];for(let o=7;o>=0;o--){e=(e<<1)+(r>>o&1),c++,16===c&&(n+=t[c][e],e=0,c=0)}}return 0!==c&&(n+=t[c][e]),n},n=t=>{const r=t.length,n=new Uint8Array(Math.floor(16*r/8));let e=0,c=0,f=0,a=!1;for(const r of t){if(a)throw new Error("Secondary character found before end of input");if(!(r in o))throw new Error(`Unrecognised Base65536 character: ${r}`);const[t,l]=o[r];for(let o=t-1;o>=0;o--){c=(c<<1)+(l>>o&1),f++,8===f&&(n[e]=c,e++,c=0,f=0)}16!==t&&(a=!0)}return new Uint8Array(n.buffer,0,e)};export { n as decode, r as encode };
export default null;
//# sourceMappingURL=/sm/5c2d9b921a64855b4e0ad6a825682ba71b34513f312f63e24d211a88b762e021.map
