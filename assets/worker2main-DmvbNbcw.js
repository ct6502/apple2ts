var Z1=Object.defineProperty;var _1=(ft,Dt,at)=>Dt in ft?Z1(ft,Dt,{enumerable:!0,configurable:!0,writable:!0,value:at}):ft[Dt]=at;var d=(ft,Dt,at)=>_1(ft,typeof Dt!="symbol"?Dt+"":Dt,at);(function(){"use strict";var ft={},Dt={};Dt.byteLength=WA,Dt.toByteArray=GA,Dt.fromByteArray=JA;for(var at=[],mt=[],OA=typeof Uint8Array<"u"?Uint8Array:Array,Bn="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Fe=0,xA=Bn.length;Fe<xA;++Fe)at[Fe]=Bn[Fe],mt[Bn.charCodeAt(Fe)]=Fe;mt[45]=62,mt[95]=63;function ws(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");r===-1&&(r=e);var o=r===e?0:4-r%4;return[r,o]}function WA(t){var e=ws(t),r=e[0],o=e[1];return(r+o)*3/4-o}function XA(t,e,r){return(e+r)*3/4-r}function GA(t){var e,r=ws(t),o=r[0],a=r[1],h=new OA(XA(t,o,a)),p=0,u=a>0?o-4:o,D;for(D=0;D<u;D+=4)e=mt[t.charCodeAt(D)]<<18|mt[t.charCodeAt(D+1)]<<12|mt[t.charCodeAt(D+2)]<<6|mt[t.charCodeAt(D+3)],h[p++]=e>>16&255,h[p++]=e>>8&255,h[p++]=e&255;return a===2&&(e=mt[t.charCodeAt(D)]<<2|mt[t.charCodeAt(D+1)]>>4,h[p++]=e&255),a===1&&(e=mt[t.charCodeAt(D)]<<10|mt[t.charCodeAt(D+1)]<<4|mt[t.charCodeAt(D+2)]>>2,h[p++]=e>>8&255,h[p++]=e&255),h}function ZA(t){return at[t>>18&63]+at[t>>12&63]+at[t>>6&63]+at[t&63]}function _A(t,e,r){for(var o,a=[],h=e;h<r;h+=3)o=(t[h]<<16&16711680)+(t[h+1]<<8&65280)+(t[h+2]&255),a.push(ZA(o));return a.join("")}function JA(t){for(var e,r=t.length,o=r%3,a=[],h=16383,p=0,u=r-o;p<u;p+=h)a.push(_A(t,p,p+h>u?u:p+h));return o===1?(e=t[r-1],a.push(at[e>>2]+at[e<<4&63]+"==")):o===2&&(e=(t[r-2]<<8)+t[r-1],a.push(at[e>>10]+at[e>>4&63]+at[e<<2&63]+"=")),a.join("")}var Dn={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */Dn.read=function(t,e,r,o,a){var h,p,u=a*8-o-1,D=(1<<u)-1,V=D>>1,R=-7,et=r?a-1:0,W=r?-1:1,z=t[e+et];for(et+=W,h=z&(1<<-R)-1,z>>=-R,R+=u;R>0;h=h*256+t[e+et],et+=W,R-=8);for(p=h&(1<<-R)-1,h>>=-R,R+=o;R>0;p=p*256+t[e+et],et+=W,R-=8);if(h===0)h=1-V;else{if(h===D)return p?NaN:(z?-1:1)*(1/0);p=p+Math.pow(2,o),h=h-V}return(z?-1:1)*p*Math.pow(2,h-o)},Dn.write=function(t,e,r,o,a,h){var p,u,D,V=h*8-a-1,R=(1<<V)-1,et=R>>1,W=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,z=o?0:h-1,Br=o?1:-1,Dr=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=R):(p=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-p))<1&&(p--,D*=2),p+et>=1?e+=W/D:e+=W*Math.pow(2,1-et),e*D>=2&&(p++,D/=2),p+et>=R?(u=0,p=R):p+et>=1?(u=(e*D-1)*Math.pow(2,a),p=p+et):(u=e*Math.pow(2,et-1)*Math.pow(2,a),p=0));a>=8;t[r+z]=u&255,z+=Br,u/=256,a-=8);for(p=p<<a|u,V+=a;V>0;t[r+z]=p&255,z+=Br,p/=256,V-=8);t[r+z-Br]|=Dr*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=Dt,r=Dn,o=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=d1,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const i=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(i,n),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(i){if(i>a)throw new RangeError('The value "'+i+'" is invalid for option "size"');const n=new Uint8Array(i);return Object.setPrototypeOf(n,u.prototype),n}function u(i,n,s){if(typeof i=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return et(i)}return D(i,n,s)}u.poolSize=8192;function D(i,n,s){if(typeof i=="string")return W(i,n);if(ArrayBuffer.isView(i))return Br(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(Ot(i,ArrayBuffer)||i&&Ot(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Ot(i,SharedArrayBuffer)||i&&Ot(i.buffer,SharedArrayBuffer)))return Dr(i,n,s);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=i.valueOf&&i.valueOf();if(l!=null&&l!==i)return u.from(l,n,s);const g=w1(i);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),n,s);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,n,s){return D(i,n,s)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function V(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function R(i,n,s){return V(i),i<=0?p(i):n!==void 0?typeof s=="string"?p(i).fill(n,s):p(i).fill(n):p(i)}u.alloc=function(i,n,s){return R(i,n,s)};function et(i){return V(i),p(i<0?0:Bs(i)|0)}u.allocUnsafe=function(i){return et(i)},u.allocUnsafeSlow=function(i){return et(i)};function W(i,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const s=RA(i,n)|0;let l=p(s);const g=l.write(i,n);return g!==s&&(l=l.slice(0,g)),l}function z(i){const n=i.length<0?0:Bs(i.length)|0,s=p(n);for(let l=0;l<n;l+=1)s[l]=i[l]&255;return s}function Br(i){if(Ot(i,Uint8Array)){const n=new Uint8Array(i);return Dr(n.buffer,n.byteOffset,n.byteLength)}return z(i)}function Dr(i,n,s){if(n<0||i.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<n+(s||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&s===void 0?l=new Uint8Array(i):s===void 0?l=new Uint8Array(i,n):l=new Uint8Array(i,n,s),Object.setPrototypeOf(l,u.prototype),l}function w1(i){if(u.isBuffer(i)){const n=Bs(i.length)|0,s=p(n);return s.length===0||i.copy(s,0,0,n),s}if(i.length!==void 0)return typeof i.length!="number"||ks(i.length)?p(0):z(i);if(i.type==="Buffer"&&Array.isArray(i.data))return z(i.data)}function Bs(i){if(i>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return i|0}function d1(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,s){if(Ot(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),Ot(s,Uint8Array)&&(s=u.from(s,s.offset,s.byteLength)),!u.isBuffer(n)||!u.isBuffer(s))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===s)return 0;let l=n.length,g=s.length;for(let S=0,C=Math.min(l,g);S<C;++S)if(n[S]!==s[S]){l=n[S],g=s[S];break}return l<g?-1:g<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,s){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(s===void 0)for(s=0,l=0;l<n.length;++l)s+=n[l].length;const g=u.allocUnsafe(s);let S=0;for(l=0;l<n.length;++l){let C=n[l];if(Ot(C,Uint8Array))S+C.length>g.length?(u.isBuffer(C)||(C=u.from(C)),C.copy(g,S)):Uint8Array.prototype.set.call(g,C,S);else if(u.isBuffer(C))C.copy(g,S);else throw new TypeError('"list" argument must be an Array of Buffers');S+=C.length}return g};function RA(i,n){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||Ot(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const s=i.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&s===0)return 0;let g=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return s;case"utf8":case"utf-8":return ms(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return s*2;case"hex":return s>>>1;case"base64":return YA(i).length;default:if(g)return l?-1:ms(i).length;n=(""+n).toLowerCase(),g=!0}}u.byteLength=RA;function T1(i,n,s){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((s===void 0||s>this.length)&&(s=this.length),s<=0)||(s>>>=0,n>>>=0,s<=n))return"";for(i||(i="utf8");;)switch(i){case"hex":return K1(this,n,s);case"utf8":case"utf-8":return MA(this,n,s);case"ascii":return F1(this,n,s);case"latin1":case"binary":return U1(this,n,s);case"base64":return Q1(this,n,s);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return q1(this,n,s);default:if(l)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function be(i,n,s){const l=i[n];i[n]=i[s],i[s]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let s=0;s<n;s+=2)be(this,s,s+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let s=0;s<n;s+=4)be(this,s,s+3),be(this,s+1,s+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let s=0;s<n;s+=8)be(this,s,s+7),be(this,s+1,s+6),be(this,s+2,s+5),be(this,s+3,s+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?MA(this,0,n):T1.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const s=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,s).replace(/(.{2})/g,"$1 ").trim(),this.length>s&&(n+=" ... "),"<Buffer "+n+">"},o&&(u.prototype[o]=u.prototype.inspect),u.prototype.compare=function(n,s,l,g,S){if(Ot(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(s===void 0&&(s=0),l===void 0&&(l=n?n.length:0),g===void 0&&(g=0),S===void 0&&(S=this.length),s<0||l>n.length||g<0||S>this.length)throw new RangeError("out of range index");if(g>=S&&s>=l)return 0;if(g>=S)return-1;if(s>=l)return 1;if(s>>>=0,l>>>=0,g>>>=0,S>>>=0,this===n)return 0;let C=S-g,P=l-s;const j=Math.min(C,P),Z=this.slice(g,S),H=n.slice(s,l);for(let X=0;X<j;++X)if(Z[X]!==H[X]){C=Z[X],P=H[X];break}return C<P?-1:P<C?1:0};function yA(i,n,s,l,g){if(i.length===0)return-1;if(typeof s=="string"?(l=s,s=0):s>2147483647?s=2147483647:s<-2147483648&&(s=-2147483648),s=+s,ks(s)&&(s=g?0:i.length-1),s<0&&(s=i.length+s),s>=i.length){if(g)return-1;s=i.length-1}else if(s<0)if(g)s=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:PA(i,n,s,l,g);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(i,n,s):Uint8Array.prototype.lastIndexOf.call(i,n,s):PA(i,[n],s,l,g);throw new TypeError("val must be string, number or Buffer")}function PA(i,n,s,l,g){let S=1,C=i.length,P=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(i.length<2||n.length<2)return-1;S=2,C/=2,P/=2,s/=2}function j(H,X){return S===1?H[X]:H.readUInt16BE(X*S)}let Z;if(g){let H=-1;for(Z=s;Z<C;Z++)if(j(i,Z)===j(n,H===-1?0:Z-H)){if(H===-1&&(H=Z),Z-H+1===P)return H*S}else H!==-1&&(Z-=Z-H),H=-1}else for(s+P>C&&(s=C-P),Z=s;Z>=0;Z--){let H=!0;for(let X=0;X<P;X++)if(j(i,Z+X)!==j(n,X)){H=!1;break}if(H)return Z}return-1}u.prototype.includes=function(n,s,l){return this.indexOf(n,s,l)!==-1},u.prototype.indexOf=function(n,s,l){return yA(this,n,s,l,!0)},u.prototype.lastIndexOf=function(n,s,l){return yA(this,n,s,l,!1)};function R1(i,n,s,l){s=Number(s)||0;const g=i.length-s;l?(l=Number(l),l>g&&(l=g)):l=g;const S=n.length;l>S/2&&(l=S/2);let C;for(C=0;C<l;++C){const P=parseInt(n.substr(C*2,2),16);if(ks(P))return C;i[s+C]=P}return C}function y1(i,n,s,l){return En(ms(n,i.length-s),i,s,l)}function P1(i,n,s,l){return En(x1(n),i,s,l)}function M1(i,n,s,l){return En(YA(n),i,s,l)}function L1(i,n,s,l){return En(W1(n,i.length-s),i,s,l)}u.prototype.write=function(n,s,l,g){if(s===void 0)g="utf8",l=this.length,s=0;else if(l===void 0&&typeof s=="string")g=s,l=this.length,s=0;else if(isFinite(s))s=s>>>0,isFinite(l)?(l=l>>>0,g===void 0&&(g="utf8")):(g=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const S=this.length-s;if((l===void 0||l>S)&&(l=S),n.length>0&&(l<0||s<0)||s>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let C=!1;for(;;)switch(g){case"hex":return R1(this,n,s,l);case"utf8":case"utf-8":return y1(this,n,s,l);case"ascii":case"latin1":case"binary":return P1(this,n,s,l);case"base64":return M1(this,n,s,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return L1(this,n,s,l);default:if(C)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),C=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Q1(i,n,s){return n===0&&s===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(n,s))}function MA(i,n,s){s=Math.min(i.length,s);const l=[];let g=n;for(;g<s;){const S=i[g];let C=null,P=S>239?4:S>223?3:S>191?2:1;if(g+P<=s){let j,Z,H,X;switch(P){case 1:S<128&&(C=S);break;case 2:j=i[g+1],(j&192)===128&&(X=(S&31)<<6|j&63,X>127&&(C=X));break;case 3:j=i[g+1],Z=i[g+2],(j&192)===128&&(Z&192)===128&&(X=(S&15)<<12|(j&63)<<6|Z&63,X>2047&&(X<55296||X>57343)&&(C=X));break;case 4:j=i[g+1],Z=i[g+2],H=i[g+3],(j&192)===128&&(Z&192)===128&&(H&192)===128&&(X=(S&15)<<18|(j&63)<<12|(Z&63)<<6|H&63,X>65535&&X<1114112&&(C=X))}}C===null?(C=65533,P=1):C>65535&&(C-=65536,l.push(C>>>10&1023|55296),C=56320|C&1023),l.push(C),g+=P}return b1(l)}const LA=4096;function b1(i){const n=i.length;if(n<=LA)return String.fromCharCode.apply(String,i);let s="",l=0;for(;l<n;)s+=String.fromCharCode.apply(String,i.slice(l,l+=LA));return s}function F1(i,n,s){let l="";s=Math.min(i.length,s);for(let g=n;g<s;++g)l+=String.fromCharCode(i[g]&127);return l}function U1(i,n,s){let l="";s=Math.min(i.length,s);for(let g=n;g<s;++g)l+=String.fromCharCode(i[g]);return l}function K1(i,n,s){const l=i.length;(!n||n<0)&&(n=0),(!s||s<0||s>l)&&(s=l);let g="";for(let S=n;S<s;++S)g+=X1[i[S]];return g}function q1(i,n,s){const l=i.slice(n,s);let g="";for(let S=0;S<l.length-1;S+=2)g+=String.fromCharCode(l[S]+l[S+1]*256);return g}u.prototype.slice=function(n,s){const l=this.length;n=~~n,s=s===void 0?l:~~s,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),s<0?(s+=l,s<0&&(s=0)):s>l&&(s=l),s<n&&(s=n);const g=this.subarray(n,s);return Object.setPrototypeOf(g,u.prototype),g};function At(i,n,s){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+n>s)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||At(n,s,this.length);let g=this[n],S=1,C=0;for(;++C<s&&(S*=256);)g+=this[n+C]*S;return g},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||At(n,s,this.length);let g=this[n+--s],S=1;for(;s>0&&(S*=256);)g+=this[n+--s]*S;return g},u.prototype.readUint8=u.prototype.readUInt8=function(n,s){return n=n>>>0,s||At(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,s){return n=n>>>0,s||At(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,s){return n=n>>>0,s||At(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,s){return n=n>>>0,s||At(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,s){return n=n>>>0,s||At(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const g=s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,S=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(g)+(BigInt(S)<<BigInt(32))}),u.prototype.readBigUInt64BE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const g=s*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],S=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(g)<<BigInt(32))+BigInt(S)}),u.prototype.readIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||At(n,s,this.length);let g=this[n],S=1,C=0;for(;++C<s&&(S*=256);)g+=this[n+C]*S;return S*=128,g>=S&&(g-=Math.pow(2,8*s)),g},u.prototype.readIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||At(n,s,this.length);let g=s,S=1,C=this[n+--g];for(;g>0&&(S*=256);)C+=this[n+--g]*S;return S*=128,C>=S&&(C-=Math.pow(2,8*s)),C},u.prototype.readInt8=function(n,s){return n=n>>>0,s||At(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,s){n=n>>>0,s||At(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,s){n=n>>>0,s||At(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,s){return n=n>>>0,s||At(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,s){return n=n>>>0,s||At(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const g=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(g)<<BigInt(32))+BigInt(s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const g=(s<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(g)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,s){return n=n>>>0,s||At(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,s){return n=n>>>0,s||At(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,s){return n=n>>>0,s||At(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,s){return n=n>>>0,s||At(n,8,this.length),r.read(this,n,!1,52,8)};function gt(i,n,s,l,g,S){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>g||n<S)throw new RangeError('"value" argument is out of bounds');if(s+l>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,s,l,g){if(n=+n,s=s>>>0,l=l>>>0,!g){const P=Math.pow(2,8*l)-1;gt(this,n,s,l,P,0)}let S=1,C=0;for(this[s]=n&255;++C<l&&(S*=256);)this[s+C]=n/S&255;return s+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,s,l,g){if(n=+n,s=s>>>0,l=l>>>0,!g){const P=Math.pow(2,8*l)-1;gt(this,n,s,l,P,0)}let S=l-1,C=1;for(this[s+S]=n&255;--S>=0&&(C*=256);)this[s+S]=n/C&255;return s+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,1,255,0),this[s]=n&255,s+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,2,65535,0),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,2,65535,0),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,4,4294967295,0),this[s+3]=n>>>24,this[s+2]=n>>>16,this[s+1]=n>>>8,this[s]=n&255,s+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,4,4294967295,0),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4};function QA(i,n,s,l,g){NA(n,l,g,i,s,7);let S=Number(n&BigInt(4294967295));i[s++]=S,S=S>>8,i[s++]=S,S=S>>8,i[s++]=S,S=S>>8,i[s++]=S;let C=Number(n>>BigInt(32)&BigInt(4294967295));return i[s++]=C,C=C>>8,i[s++]=C,C=C>>8,i[s++]=C,C=C>>8,i[s++]=C,s}function bA(i,n,s,l,g){NA(n,l,g,i,s,7);let S=Number(n&BigInt(4294967295));i[s+7]=S,S=S>>8,i[s+6]=S,S=S>>8,i[s+5]=S,S=S>>8,i[s+4]=S;let C=Number(n>>BigInt(32)&BigInt(4294967295));return i[s+3]=C,C=C>>8,i[s+2]=C,C=C>>8,i[s+1]=C,C=C>>8,i[s]=C,s+8}u.prototype.writeBigUInt64LE=pe(function(n,s=0){return QA(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=pe(function(n,s=0){return bA(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,s,l,g){if(n=+n,s=s>>>0,!g){const j=Math.pow(2,8*l-1);gt(this,n,s,l,j-1,-j)}let S=0,C=1,P=0;for(this[s]=n&255;++S<l&&(C*=256);)n<0&&P===0&&this[s+S-1]!==0&&(P=1),this[s+S]=(n/C>>0)-P&255;return s+l},u.prototype.writeIntBE=function(n,s,l,g){if(n=+n,s=s>>>0,!g){const j=Math.pow(2,8*l-1);gt(this,n,s,l,j-1,-j)}let S=l-1,C=1,P=0;for(this[s+S]=n&255;--S>=0&&(C*=256);)n<0&&P===0&&this[s+S+1]!==0&&(P=1),this[s+S]=(n/C>>0)-P&255;return s+l},u.prototype.writeInt8=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,1,127,-128),n<0&&(n=255+n+1),this[s]=n&255,s+1},u.prototype.writeInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,2,32767,-32768),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,2,32767,-32768),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,4,2147483647,-2147483648),this[s]=n&255,this[s+1]=n>>>8,this[s+2]=n>>>16,this[s+3]=n>>>24,s+4},u.prototype.writeInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||gt(this,n,s,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4},u.prototype.writeBigInt64LE=pe(function(n,s=0){return QA(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=pe(function(n,s=0){return bA(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function FA(i,n,s,l,g,S){if(s+l>i.length)throw new RangeError("Index out of range");if(s<0)throw new RangeError("Index out of range")}function UA(i,n,s,l,g){return n=+n,s=s>>>0,g||FA(i,n,s,4),r.write(i,n,s,l,23,4),s+4}u.prototype.writeFloatLE=function(n,s,l){return UA(this,n,s,!0,l)},u.prototype.writeFloatBE=function(n,s,l){return UA(this,n,s,!1,l)};function KA(i,n,s,l,g){return n=+n,s=s>>>0,g||FA(i,n,s,8),r.write(i,n,s,l,52,8),s+8}u.prototype.writeDoubleLE=function(n,s,l){return KA(this,n,s,!0,l)},u.prototype.writeDoubleBE=function(n,s,l){return KA(this,n,s,!1,l)},u.prototype.copy=function(n,s,l,g){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!g&&g!==0&&(g=this.length),s>=n.length&&(s=n.length),s||(s=0),g>0&&g<l&&(g=l),g===l||n.length===0||this.length===0)return 0;if(s<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),n.length-s<g-l&&(g=n.length-s+l);const S=g-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(s,l,g):Uint8Array.prototype.set.call(n,this.subarray(l,g),s),S},u.prototype.fill=function(n,s,l,g){if(typeof n=="string"){if(typeof s=="string"?(g=s,s=0,l=this.length):typeof l=="string"&&(g=l,l=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!u.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(n.length===1){const C=n.charCodeAt(0);(g==="utf8"&&C<128||g==="latin1")&&(n=C)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(s<0||this.length<s||this.length<l)throw new RangeError("Out of range index");if(l<=s)return this;s=s>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let S;if(typeof n=="number")for(S=s;S<l;++S)this[S]=n;else{const C=u.isBuffer(n)?n:u.from(n,g),P=C.length;if(P===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(S=0;S<l-s;++S)this[S+s]=C[S%P]}return this};const je={};function Ds(i,n,s){je[i]=class extends s{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}Ds("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Ds("ERR_INVALID_ARG_TYPE",function(i,n){return`The "${i}" argument must be of type number. Received type ${typeof n}`},TypeError),Ds("ERR_OUT_OF_RANGE",function(i,n,s){let l=`The value of "${i}" is out of range.`,g=s;return Number.isInteger(s)&&Math.abs(s)>2**32?g=qA(String(s)):typeof s=="bigint"&&(g=String(s),(s>BigInt(2)**BigInt(32)||s<-(BigInt(2)**BigInt(32)))&&(g=qA(g)),g+="n"),l+=` It must be ${n}. Received ${g}`,l},RangeError);function qA(i){let n="",s=i.length;const l=i[0]==="-"?1:0;for(;s>=l+4;s-=3)n=`_${i.slice(s-3,s)}${n}`;return`${i.slice(0,s)}${n}`}function N1(i,n,s){He(n,"offset"),(i[n]===void 0||i[n+s]===void 0)&&mr(n,i.length-(s+1))}function NA(i,n,s,l,g,S){if(i>s||i<n){const C=typeof n=="bigint"?"n":"";let P;throw n===0||n===BigInt(0)?P=`>= 0${C} and < 2${C} ** ${(S+1)*8}${C}`:P=`>= -(2${C} ** ${(S+1)*8-1}${C}) and < 2 ** ${(S+1)*8-1}${C}`,new je.ERR_OUT_OF_RANGE("value",P,i)}N1(l,g,S)}function He(i,n){if(typeof i!="number")throw new je.ERR_INVALID_ARG_TYPE(n,"number",i)}function mr(i,n,s){throw Math.floor(i)!==i?(He(i,s),new je.ERR_OUT_OF_RANGE("offset","an integer",i)):n<0?new je.ERR_BUFFER_OUT_OF_BOUNDS:new je.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,i)}const Y1=/[^+/0-9A-Za-z-_]/g;function O1(i){if(i=i.split("=")[0],i=i.trim().replace(Y1,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function ms(i,n){n=n||1/0;let s;const l=i.length;let g=null;const S=[];for(let C=0;C<l;++C){if(s=i.charCodeAt(C),s>55295&&s<57344){if(!g){if(s>56319){(n-=3)>-1&&S.push(239,191,189);continue}else if(C+1===l){(n-=3)>-1&&S.push(239,191,189);continue}g=s;continue}if(s<56320){(n-=3)>-1&&S.push(239,191,189),g=s;continue}s=(g-55296<<10|s-56320)+65536}else g&&(n-=3)>-1&&S.push(239,191,189);if(g=null,s<128){if((n-=1)<0)break;S.push(s)}else if(s<2048){if((n-=2)<0)break;S.push(s>>6|192,s&63|128)}else if(s<65536){if((n-=3)<0)break;S.push(s>>12|224,s>>6&63|128,s&63|128)}else if(s<1114112){if((n-=4)<0)break;S.push(s>>18|240,s>>12&63|128,s>>6&63|128,s&63|128)}else throw new Error("Invalid code point")}return S}function x1(i){const n=[];for(let s=0;s<i.length;++s)n.push(i.charCodeAt(s)&255);return n}function W1(i,n){let s,l,g;const S=[];for(let C=0;C<i.length&&!((n-=2)<0);++C)s=i.charCodeAt(C),l=s>>8,g=s%256,S.push(g),S.push(l);return S}function YA(i){return e.toByteArray(O1(i))}function En(i,n,s,l){let g;for(g=0;g<l&&!(g+s>=n.length||g>=i.length);++g)n[g+s]=i[g];return g}function Ot(i,n){return i instanceof n||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===n.name}function ks(i){return i!==i}const X1=function(){const i="0123456789abcdef",n=new Array(256);for(let s=0;s<16;++s){const l=s*16;for(let g=0;g<16;++g)n[l+g]=i[s]+i[g]}return n}();function pe(i){return typeof BigInt>"u"?G1:i}function G1(){throw new Error("BigInt not supported")}})(ft);const VA=!1,jA=30,ve=256,Ue=383,ze=256*ve,vt=256*Ue;var F=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(F||{}),ut=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t))(ut||{}),U=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.MOUSEEVENT=15]="MOUSEEVENT",t[t.PASTE_TEXT=16]="PASTE_TEXT",t[t.APPLE_PRESS=17]="APPLE_PRESS",t[t.APPLE_RELEASE=18]="APPLE_RELEASE",t[t.GET_SAVE_STATE=19]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=20]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=21]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=22]="DRIVE_NEW_DATA",t[t.GAMEPAD=23]="GAMEPAD",t[t.SET_BINARY_BLOCK=24]="SET_BINARY_BLOCK",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RAMWORKS=28]="RAMWORKS",t[t.MACHINE_NAME=29]="MACHINE_NAME",t[t.SOFTSWITCHES=30]="SOFTSWITCHES",t))(U||{}),ds=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t))(ds||{}),Se=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Se||{}),A=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(A||{});const HA=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),mn=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",_=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),$e=t=>t.split("").map(e=>e.charCodeAt(0)),vA=t=>[t&255,t>>>8&255],Ts=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Rs=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},kn=new Uint32Array(256).fill(0),zA=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;kn[e]=t}},$A=(t,e=0)=>{kn[255]===0&&zA();let r=-1;for(let o=e;o<t.length;o++)r=r>>>8^kn[(r^t[o])&255];return(r^-1)>>>0},ti=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7);let Rt;const Ce=Math.trunc(.0028*1020484);let wn=Ce/2,dn=Ce/2,kr=Ce/2,wr=Ce/2,ys=0,Ps=!1,Ms=!1,Tn=!1,Rn=!1,dr=!1,Ls=!1,Qs=!1;const yn=()=>{Tn=!0},bs=()=>{Rn=!0},ei=()=>{dr=!0},Tr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*Ce/2),Fs=t=>{wn=Tr(t)},Us=t=>{dn=Tr(t)},Ks=t=>{kr=Tr(t)},qs=t=>{wr=Tr(t)},Pn=()=>{Ls=Ps||Tn,Qs=Ms||Rn,E.PB0.isSet=Ls,E.PB1.isSet=Qs||dr,E.PB2.isSet=dr},Ns=(t,e)=>{e?Ps=t:Ms=t,Pn()},ri=t=>{v(49252,128),v(49253,128),v(49254,128),v(49255,128),ys=t},Rr=t=>{const e=t-ys;v(49252,e<wn?128:0),v(49253,e<dn?128:0),v(49254,e<kr?128:0),v(49255,e<wr?128:0)};let Ee,Mn,Ys=!1;const ni=t=>{Rt=t,Ys=!Rt.length||!Rt[0].buttons.length,Ee=wi(),Mn=Ee.gamepad?Ee.gamepad:mi},Os=t=>t>-.01&&t<.01,xs=(t,e)=>{Os(t)&&(t=0),Os(e)&&(e=0);const r=Math.sqrt(t*t+e*e),o=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-o,t),o),e=Math.min(Math.max(-o,e),o),t=Math.trunc(Ce*(t+o)/(2*o)),e=Math.trunc(Ce*(e+o)/(2*o)),[t,e]},si=t=>{const[e,r]=xs(t[0],t[1]),o=t.length>=6?t[5]:t[3],[a,h]=t.length>=4?xs(t[2],o):[0,0];return[e,r,a,h]},Ws=t=>{const e=Ee.joystick?Ee.joystick(Rt[t].axes,Ys):Rt[t].axes,r=si(e);t===0?(wn=r[0],dn=r[1],Tn=!1,Rn=!1,kr=r[2],wr=r[3]):(kr=r[0],wr=r[1],dr=!1);let o=!1;Rt[t].buttons.forEach((a,h)=>{a&&(Mn(h,Rt.length>1,t===1),o=!0)}),o||Mn(-1,Rt.length>1,t===1),Ee.rumble&&Ee.rumble(),Pn()},oi=()=>{Rt&&Rt.length>0&&(Ws(0),Rt.length>1&&Ws(1))},Ai=t=>{switch(t){case 0:K("JL");break;case 1:K("G",200);break;case 2:Y("M"),K("O");break;case 3:K("L");break;case 4:K("F");break;case 5:Y("P"),K("T");break;case 6:break;case 7:break;case 8:K("Z");break;case 9:{const e=go();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:break;case 11:break;case 12:K("L");break;case 13:K("M");break;case 14:K("A");break;case 15:K("D");break;case-1:return}};let Be=0,De=0,me=!1;const yr=.5,ii={address:7587,data:[173,0,192],keymap:{},joystick:t=>t[0]<-yr?(De=0,Be===0||Be>2?(Be=0,Y("A")):Be===1&&me?K("W"):Be===2&&me&&K("R"),Be++,me=!1,t):t[0]>yr?(Be=0,De===0||De>2?(De=0,Y("D")):De===1&&me?K("W"):De===2&&me&&K("R"),De++,me=!1,t):t[1]<-yr?(K("C"),t):t[1]>yr?(K("S"),t):(me=!0,t),gamepad:Ai,rumble:null,setup:null,helptext:`AZTEC
Paul Stephenson, Datamost 1982

W: walk
R: run
J (A button): jump
S (Thumb down): stop
C (Thumb up): climb
A (Thumb left): turn left
D (Thumb right): turn right
G (B button): crawl (G to move)
P (RB button): place and light explosive
T (RB button): take item
O (X button): opens box or dig in trash
L (Y button): look in box
Z: inventory

F (LB button): goes to fight mode:
   S (Thumb down): spin around
   A (Dpad left): move one to left
   D (Dpad right): move one to right
   L: lunge with machete
   M (Dpad down): strike down with machete
   G (B button): draw gun
   L (A button): shoot gun

Thumbwheel
              Climb
  Walk/run left   Walk/run right
            Stop/spin

D-pad
        Lunge/shoot
  Move left    Move right
        Strike down

A:  jump/lunge/shoot
B:  crawl/switch to gun
X:  open box/dig in trash
Y:  look in box
RB: place explosive (crawling) or take item (box/trash)
LB: fight mode
Select: inventory
Start:  start the game
`},ai={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:Y(" ");break;case 12:Y("A");break;case 13:Y("Z");break;case 14:Y("\b");break;case 15:Y("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},ci={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
Silas Warner, Muse Software, 1982

KEYBOARD
W ↑    up
X ↓    down
A ←    left
D →    right
S      stop

P or Return   pick up gas can
M or Space    drop gas can

JOYSTICK
Button 0: drop gas can
Button 1: pick up gas can
`},li={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Es("APPLE2EU",!1)},helptext:`Injured Engine
(c) 1984 Imagic, Inc.
Concept: Dave Johnson
Program: Tom McWilliams
Graphics: Karen Elliott
Tech Support: Dave Boisvert

Keyboard Controls:
T         Select, look at text
I         Inspect part(s)
R         Repair/replace part(s)
P         Price list
E, <ESC>  Main screen
A, S      Scroll text back
Z, X      Scroll text forward
Y         Yes
N         No
O         Open throttle
C         Close throttle`};let Ln=14,Qn=14;const ui={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=B(182,!1);Ln<40&&t<Ln&&Cn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Ln=t,t=B(183,!1),Qn<40&&t<Qn&&Cn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Qn=t},setup:null,helptext:`KARATEKA
Jordan Mechner, Brøderbund 1984
Press K for Keyboard control
Press J for Joystick control

KEYBOARD
Fighting stance:
Q A Z     punch high, middle, low
W S X     kick high, middle, low
M . →     advance
N , ←     retreat
Space     stand up

Standing up:
B         bow
M . →     run forward
N , ←     stop
Space     fighting stance

JOYSTICK
Push the joystick up to stand up, and release it to get into a fighting stance.

Fighting stance:
Button 1: punch
Button 0: kick
Move the joystick up and down to control the height of your punches  and kicks. Move it right to advance and left to retreat.

To run forward, start from a standing position. Then move the joystick to the upper right. Press button 1 to bow.
`},hi=t=>{switch(t){case 0:K("A");break;case 1:K("C",50);break;case 2:K("O");break;case 3:K("T");break;case 4:K("\x1B");break;case 5:K("\r");break;case 6:break;case 7:break;case 8:Y("N"),K("'");break;case 9:Y("Y"),K("1");break;case 10:break;case 11:break;case 12:break;case 13:K(" ");break;case 14:break;case 15:K("	");break;case-1:return}},zt=.5,Ii={address:768,data:[141,74,3,132],keymap:{},gamepad:hi,joystick:(t,e)=>{if(e)return t;const r=t[0]<-zt?"\b":t[0]>zt?"":"",o=t[1]<-zt?"\v":t[1]>zt?`
`:"";let a=r+o;return a||(a=t[2]<-zt?"L\b":t[2]>zt?"L":"",a||(a=t[3]<-zt?"L\v":t[3]>zt?`L
`:"")),a&&K(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
6502 Workshop, 2021
_____________________________________________
Arrows (Left thumb)  movement
A (A button)         attack
C (B button)         cast spell
O (X button)         open or operate object
T (Y button)         talk
L (Right thumb)      look
SPACE (Dpad down)    pass turn
RETURN (RB button)   ready item
TAB  (Dpad right)    inventory
ESC  (LB button)     flee from battle

_____ ADVENTURING _____
B  board transport or mount
D  dig (ruins only)
G  get current location
H  hide and camp
I  ignite torch
J  jump with your horse
N  new character order
Q  quick save game
S  search
W  wait for a number of hours
X  exit transport or mount
Y  yell, go fast on horse/mount
/  quest log
V  volume/sound toggle
=  toggle character icon

_____ COMBAT _____
F  fire cannon (ships only)
SHIFT+8   toggle combat math
+/−  fast/slow scroll speed
8    pause text scroll

_____ INVENTORY & SHOPPING _____
TAB     switch to next menu (or press 1-7)
ARROWS  scroll through items or pages
SPACE   next character
RETURN  ready/unready item
I/U/D   Info/Use/Discard item
B/S  switch to buy/sell (shop)
RETURN buy or sell item (shop)
ESC    exit inventory/shop

_____ NPC DIALOG _____
Keywords NAME, JOB, JOIN
TAB  toggle voice mode
ESC  exit conversation`},gi={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
Electronic Arts, Eric Hammond, 1983

To Leave Demo: Press the joystick button or the space bar.

To Choose Game Options:
1. Move the joystick up and down (or press SPACE) to move the highlight from option group to option group; press RETURN to enter the highlighted group.

2. Move the joystick right and left (or press SPACE) to move from option to option within a group after that group has been entered; press RETURN to select the highlighted option.

To Return to the Options Screen: Press CtrlR. (This command should also be used to recover if the program ever begins to behave erratically.)

T       Time Out
Ctrl+S  Turn Sound On/Off
!       Turn Slow Motion On/Off
ESC     Pause game; pressing ESC repeatedly single steps the action, any key restarts.

PLAYING DEFENSE FROM THE KEYBOARD
A     Move Up
Z     Move Down
←     Move Left
→     Move Right
SPACE Go For the Steal or the Block
Other keys (except T or ESC): Stop Moving

To change these, select CHANGE KEYBOARD and enter new choices.

Note: When defense is played from the keyboard, play will freeze after every turnover (whether caused by a score, a steal or a defensive rebound). To resume play after the offensive and defensive players have traded joystick and keyboard, press any key.
`},fi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
Jordan Mechner, Brøderbund 1989

Running, jumping, climbing:
Run: move joystick in desired direction, release to stop
Take careful steps: hold button while moving the joystick
Jump/climb up: move joystick up
Jump forward: move joystick up diagonally
Running jump: run, then move joystick up diagonally
Hang from ledge: hold button, to drop release button, to pull up onto ledge, move joystick up
Climb down: step to edge, turn around, move joystick down
If you fall within reach of a ledge, grab onto it by pressing a button
Duck: move joystick down, release to stand up
Pick up object: stand in front of object, press button

Fighting:
Release joystick, you will automatically draw your sword
Strike: press button
Advance/retreat: move joystick
Block a strike: move joystick up as opponent strikes
Stop fighting: move joystick down, press button to draw sword again

ESC: Freeze frame, single frame advance
Ctrl+J: joystick control
Ctrl+K: keyboard control
Ctrl+R: ends game
Ctrl+A: restart level
Ctrl+S: sound on/off
Ctrl+N: music on/off
Ctrl+G: save game
Ctrl+L: load game (during title screen)
Ctrl+X: flip vertical joystick axis
Ctrl+Y: flip horizontal joystick axis
Space:  see remaining time

KEYBOARD
Movement:
U I O
J K L
Button: Option/Alt key
`},pi={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&Cn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{m(3178,99)},helptext:`Robotron: 2084
(c) 1982 Williams Electronics, Inc.
(c) 1983 Atari, Inc.
Written by Steve Hays

This "Robotron4Joy" patch by Nick Westgate

Press <Space> to start game
1) One joystick
2) Gamepad with two joysticks

ESC       Pause (Space to resume)
Ctrl+Q    Quit current game
Ctrl+R+## Jump to level ##
Ctrl+S    Turn Sound On/Off`},Xs=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,Si=t=>{switch(t){case 1:m(109,255);break;case 12:Y("A");break;case 13:Y("Z");break;case 14:Y("\b");break;case 15:Y("");break}},Pr=.75,Ci=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{m(25025,173),m(25036,64)},helptext:Xs},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Pr?"\b":t[0]>Pr?"":t[1]<-Pr?"A":t[1]>Pr?"Z":"";return e&&Y(e),t},gamepad:Si,rumble:null,setup:null,helptext:Xs}],Ei={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{dA(1)},helptext:`Ultima V: Warriors of Destiny
by Lord British
(c) 1987 Origin Systems
_____________________________________________
Arrows    movement
A         attack
B         board transport or mount
C         cast spell
E         enter towne, castle, or structure
F         fire cannon
G         get gold, food, or items
H         hole up and camp
I         ignite torch
J         jimmy a lock
K         climb up or down
L         look
M         mix reagents
N         new character order
O         open door or chest
P         push object
Q         quit and save game
R         ready equipment
S         search
T         talk
U         use item
V         view area
X         exit transport or mount
Y         yell, go fast on ship
Z         display stats/attributes
1-6       set active character
0         clear active character
SPACE     pass turn
ESC       abort command, exit combat
Ctrl+S    toggle sound
Ctrl+T    toggle speed
Ctrl+V    set music volume 0-9
---
For MIDI Support:
1) Launch a WebMIDI supported player (such as https://signal.vercel.app/) in a separate tab, and leave it running.  Make sure its WebMIDI support is enabled.
2) In U5, Go to Activate Music -> Change Music Configuration, add Passport to slot 2, and hit enter. 
3) In the Midi Information screen, select Channel 1 (default), 16 voices, and then enter the numbers 1-15 for "Midi Number" in each song (where Ultima Theme is '1' and Rule Britannia is '15'). Then hit enter on each song to test.

`},Bi={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
Andrew Greenberg and Robert Woodhead
Sir-Tech Software, 1981

____ Adventuring ____
W  forward
A  left
D  right
K  kick through a door
S  update status area
C  camp
T  combat message delay time (ms)
Q  quick plotting - see the LOMILWA spell
I  inspect for dead bodies

____ Combat ____
F  fight (# for group)
P  parry
S  cast spell
U  use an item
R  run!
D  dispell undead
`},Di={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:yn();break;case 1:bs();break;case 2:K(" ");break;case 3:K("U");break;case 4:K("\r");break;case 5:K("T");break;case 9:{const e=go();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:yn();break}},rumble:()=>{B(49178,!1)<128&&B(49181,!1)<128&&Cn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{m(5128,0),m(5130,4);let t=5210;m(t,234),m(t+1,234),m(t+2,234),t=5224,m(t,234),m(t+1,234),m(t+2,234)},helptext:`Castle Wolfenstein
Silas Warner, Muse Software 1981

KEYBOARD:
QWE
ASD    Movement (S = Stop)
ZXC

IOP
KL;    Aim gun (L = Fire)
,./

Space: Search guards, unlock doors & chests
T:  Throw grenade
U:  Use contents of chest
Return:  Inventory

JOYSTICK:
Joystick:  Move or aim
Left button (0):  Aim
Right button (1): Shoot
X button:  Search/unlock
Y button:  Use chest contents
RB button: Throw grenade
LB button: Inventory`},tr=new Array,pt=t=>{Array.isArray(t)?tr.push(...t):tr.push(t)};pt(ii),pt(ai),pt(ci),pt(li),pt(ui),pt(Ii),pt(gi),pt(fi),pt(pi),pt(Ci),pt(Ei),pt(Bi),pt(Di);const mi=(t,e,r)=>{if(r)switch(t){case 0:ei();break;case 1:break;case 12:qs(-1);break;case 13:qs(1);break;case 14:Ks(-1);break;case 15:Ks(1);break}else switch(t){case 0:yn();break;case 1:e||bs();break;case 12:Us(-1);break;case 13:Us(1);break;case 14:Fs(-1);break;case 15:Fs(1);break}},ki={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},Gs=t=>{for(const e of tr)if(Vn(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},wi=()=>{for(const t of tr)if(Vn(t.address,t.data))return t;return ki},bn=(t=!1)=>{for(const e of tr)if(Vn(e.address,e.data)){wA(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(wA(" "),dA(0))},di=t=>{v(49152,t|128,32)},Ti=()=>{const t=de(49152)&127;v(49152,t,32)};let ke="",Zs=1e9;const Ri=()=>{const t=performance.now();if(ke!==""&&(de(49152)<128||t-Zs>1900)){Zs=t;const e=ke.charCodeAt(0);di(e),ke=ke.slice(1),ke.length===0&&pA(!0)}};let _s="";const Y=t=>{t===_s&&ke.length>0||(_s=t,ke+=t)};let Js=0;const K=(t,e=300)=>{const r=performance.now();r-Js<e||(Js=r,Y(t))},yi=t=>{t.length===1&&(t=Gs(t)),Y(t)},Pi=t=>{t.length===1&&(t=Gs(t)),Y(t)},Ke=[],T=(t,e,r,o=!1,a=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:o,isSet:!1,setFunc:a};return t>=49152&&(Ke[t-49152]=h),e>=49152&&(Ke[e-49152]=h),r>=49152&&(Ke[r-49152]=h),h},qe=()=>Math.floor(256*Math.random()),Mi=(t,e)=>{t&=11,e?E.BSR_PREWRITE.isSet=!1:t&1?E.BSR_PREWRITE.isSet?E.BSR_WRITE.isSet=!0:E.BSR_PREWRITE.isSet=!0:(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=!1),E.BSRBANK2.isSet=t<=3,E.BSRREADRAM.isSet=[0,3,8,11].includes(t)},E={STORE80:T(49152,49153,49176,!0),RAMRD:T(49154,49155,49171,!0),RAMWRT:T(49156,49157,49172,!0),INTCXROM:T(49158,49159,49173,!0),INTC8ROM:T(49194,0,0),ALTZP:T(49160,49161,49174,!0),SLOTC3ROM:T(49162,49163,49175,!0),COLUMN80:T(49164,49165,49183,!0),ALTCHARSET:T(49166,49167,49182,!0),KBRDSTROBE:T(49168,0,0,!1),BSRBANK2:T(0,0,49169),BSRREADRAM:T(0,0,49170),VBL:T(0,0,49177),CASSOUT:T(49184,0,0),SPEAKER:T(49200,0,0,!1,(t,e)=>{v(49200,qe()),C1(e)}),GCSTROBE:T(49216,0,0),EMUBYTE:T(0,0,49231,!1,()=>{v(49231,205)}),TEXT:T(49232,49233,49178),MIXED:T(49234,49235,49179),PAGE2:T(49236,49237,49180),HIRES:T(49238,49239,49181),AN0:T(49240,49241,0),AN1:T(49242,49243,0),AN2:T(49244,49245,0),AN3:T(49246,49247,0),CASSIN1:T(0,0,49248,!1,()=>{v(49248,qe())}),PB0:T(0,0,49249),PB1:T(0,0,49250),PB2:T(0,0,49251),JOYSTICK0:T(0,0,49252,!1,(t,e)=>{Rr(e)}),JOYSTICK1:T(0,0,49253,!1,(t,e)=>{Rr(e)}),JOYSTICK2:T(0,0,49254,!1,(t,e)=>{Rr(e)}),JOYSTICK3:T(0,0,49255,!1,(t,e)=>{Rr(e)}),CASSIN2:T(0,0,49256,!1,()=>{v(49256,qe())}),FASTCHIP_LOCK:T(49258,0,0),FASTCHIP_ENABLE:T(49259,0,0),FASTCHIP_SPEED:T(49261,0,0),JOYSTICKRESET:T(0,0,49264,!1,(t,e)=>{ri(e),v(49264,qe())}),BANKSEL:T(49267,0,0),LASER128EX:T(49268,0,0),BSR_PREWRITE:T(49280,0,0),BSR_WRITE:T(49288,0,0)};E.TEXT.isSet=!0;const Li=[49152,49153,49165,49167,49200,49236,49237,49183],Vs=(t,e,r)=>{if(t>1048575&&!Li.includes(t)){const a=de(t)>128?1:0;console.log(`${r} $${_(c.PC)}: $${_(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){Mi(t&-5,e);return}const o=Ke[t-49152];if(!o){console.error("Unknown softswitch "+_(t)),v(t,qe());return}if(t<=49167?e||Ri():(t===49168||t<=49183&&e)&&Ti(),o.setFunc){o.setFunc(t,r);return}if(t===o.offAddr||t===o.onAddr){if((!o.writeOnly||e)&&(Qt[o.offAddr-49152]!==void 0?Qt[o.offAddr-49152]=t===o.onAddr:o.isSet=t===o.onAddr),o.isSetAddr){const a=de(o.isSetAddr);v(o.isSetAddr,o.isSet?a|128:a&127)}t>=49184&&v(t,qe())}else if(t===o.isSetAddr){const a=de(t);v(t,o.isSet?a|128:a&127)}},Qi=()=>{for(const t in E){const e=t;Qt[E[e].offAddr-49152]!==void 0?Qt[E[e].offAddr-49152]=!1:E[e].isSet=!1}Qt[E.TEXT.offAddr-49152]!==void 0?Qt[E.TEXT.offAddr-49152]=!0:E.TEXT.isSet=!0},Qt=[],bi=t=>{const e=Ke[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+_(t));return}Qt[e.offAddr-49152]===void 0&&(Qt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},Fi=()=>{Qt.forEach((t,e)=>{t!==void 0&&(Ke[e].isSet=t)}),Qt.length=0},Ui=`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
cM5oYLEoLB/AEBmNAcCEKphFIGqwBK1VwMiYSqixKCxUwKQqLB7AEAbJILACCUBg
SCn/MBat+wRqaEiQDiwewBAJSUAsrM7wAklALB/AEB2NAcBIhCqYRSBKsAStVcDI
mEqoaJEorVTApCpoYJEoaGBImEisewUgRM6NewYpgEmrTM3OSJhIrHsFrXsGIHDO
aKhoYCBxzan/hTKt+wQpBPACRjKteweFKK37B4UprfsFhSVgLBLAED2pBs2z+/A2
ogMsEcAwAqILjbP7LIDArbP7yQbwAegsgcAsgcCgAKn4hTeENrE2kTbI0PnmN9D1
vYDAvYDAYAAAAOmBStAUpD+mPtABiMqKGOU6hT4QAciY5TvQQKQvuT0AkTqIEPgg
SPkgGvwgGvxM4/ylPSCO+Kq9APrFQtATvcD5xUPQDKVEpC7AnfCzxS7wysY90Nzm
RMY18NakNJiqTNL8IMf/rQACyaDwEsmN0AFgIKf/yZPQ5Yrw4iB4/qkDhT0gE/8K
6b7JwpDRCgqiBAomQiZDyhD4xj3w9BDkogUgyMSlRAoKBTXJILAGpjXwAgmAhUSE
NLkAAsm78ATJjdC0TGvP32/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvd092zybvJy8nbyf/JO8mrZVfKF8qXyyvIX87vz
nvNh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD58jYr9gS43rn1NqV2KTWadaf20jW
kOsj7K/rCgDe4hLUzd//4o3uru9B6Qnv6u/x7zrwnvBk59bmxeMH5+XmRuZa5obm
keZ5wOd5qed7gel7aOp9lu5QVN9GTt9/z+5/l95kZN9FTsRGT9JORVjUREFUwUlO
UFXUREXMREnNUkVBxEfSVEVY1FBSo0lOo0NBTMxQTE/USExJzlZMSc5IR1KySEfS
SENPTE9SvUhQTE/URFJB11hEUkHXSFRBwkhPTcVST1S9U0NBTEW9U0hMT0HEVFJB
Q8VOT1RSQUPFTk9STUHMSU5WRVJTxUZMQVPIQ09MT1K9UE/QVlRBwkhJTUVNukxP
TUVNuk9ORVLSUkVTVU3FUkVDQUzMU1RPUsVTUEVFRL1MRdRHT1TPUlXOScZSRVNU
T1LFpkdPU1XCUkVUVVLOUkXNU1RP0E/OV0FJ1ExPQcRTQVbFREXGUE9LxVBSSU7U
Q09O1ExJU9RDTEVB0kdF1E5F11RBQqhUz0bOU1BDqFRIRc5B1E5P1FNURdCrraqv
3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFU0NSTqhQRMxQT9NTUdJSTsRMT8dFWNBD
T9NTSc5UQc5BVM5QRUXLTEXOU1RSpFZBzEFTw0NIUqRMRUZUpFJJR0hUpE1JRKQA
TkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVRIT1VUIEdPU1XCT1VUIE9G
IERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYn
RCBTVEFURU1FTtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZ
IFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTVFJJTkcgVE9PIExPTsdG
T1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/O
IEVSUk9SBwAgSU4gAA1CUkVBSwcAuujo6Oi9AQHJgdAhpYbQCr0CAYWFvQMBhYbd
AwHQB6WF3QIB8AeKGGkSqtDYYCDj04VthG44pZblm4VeqKWX5Zyq6JjwI6WWOOVe
hZawA8aXOKWU5V6FlLAIxpWQBLGWkZSI0PmxlpGUxpfGlcrQ8mAKaTawNYVeuuRe
kC5gxHCQKNAExW+QIkiiCZhItZPKEPoghOSi92iVnegw+mioaMRwkAbQBcVvsAFg
ok0k2BADTOnyIPvaIFrbvWDSSCBc2+hoEPUgg9apUKDTIDrbpHbI8AMgGe0g+9qi
3SAu1Ya4hLlG2CCxAKrw7KL/hnaQBiBZ1UwF2KavhmmmsIZqIAzaIFnVhA8gGtaQ
RKABsZuFX6VphV6lnIVhpZuI8ZsYZWmFaYVgpWpp/4Vq5ZyqOKWb5WmosAPoxmEY
ZV6QA8ZfGLFekWDI0PnmX+ZhytDyrQAC8Dilc6R0hW+EcKVphZZlD4WUpGqEl5AB
yISVIJPTpVCkUY3+AYz/AaVtpG6FaYRqpA+5+wGIkZvQ+CBl1qVnpGiFXoRfGKAB
sV7QC6Vpha+laoWwTDzUoATIsV7Q+8iYZV6qoACRXqVfaQDIkV6GXoVfkNKigIYz
IGr94O+QAqLvqQCdAAKK8Au9/wEpf53/AcrQ9akAov+gAWAgDP0pf2CmuMqgBIQT
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
5opMi/4g+OaKTJX+IPjm4DCwE4bwqSwgwN4g+ObgMLAFhiyGLWBMmeEg7PHk8LAI
pfCFLIUthvCpxSDA3iD45uAwsOJgIOzxiqTwwCiw10wA+CAJ8oqkLMAosMqk8EwZ
+CAJ8oqowCiwvKXwTCj4IPjmikxk+CD45sqKyRiwp0xb+yD45opJ/6rohvFgOJAY
ZvJgqf/QAqk/ogCFMobzYKl/okDQ9SBn3SBS56VQxW2lUeVusANMENSlUIVzhW+l
UYV0hXBgIGfdIFLnpVDFc6VR5XSw4KVQxWmlUeVqkNalUIVppVGFakxs1qmrIMDe
pbiF9KW5hfU4ZtildYX2pXaF9yCm2UyY2YbepviG36V1hdqldoXbpXmF3KV6hd2l
9IW4pfWFuaX2hXWl94V2ILcAID7ZTNLXpdqFdaXbhXal3IW4pd2FuabfmkzS10zJ
3rD7pq+GaaawhmogDNogGtalm4VgpZyFYaksIMDeIAza5lDQAuZRIBrWpZvFYKWc
5WGwAWCgALGbkWDmm9AC5pzmYNAC5mGlacWbpWrlnLDmpmGkYNAByoiGaoRpTPLU
rVbArVPATED7rVTATDn7INn3oAOxm6qIsZvpAbAByoVQhlEgzf4gd/dMzf4g2fcg
/f6gArGbxVDIsZvlUbADTBDUIHf3TP3+LFXALFLAqUDQCKkgLFTALFPAheatV8Ct
UMCpAIUcpeaFG6AAhBqlHJEaIH70yND25hulGykf0O5gheKG4IThSCnAhSZKSgUm
hSZohScKCgomJwomJwpmJqUnKR8F5oUnisAA8AWgI2kEyOkHsPuE5aq9ufSFMJhK
peSFHLAoYCAR9KUcUSYlMFEmkSZgECOlMEqwBUnAhTBgiBACoCepwIUwhOWlHArJ
wBAGpRxJf4UcYKUwCkmAMN2pgcjAKJDgoACw3Bil0SkE8CWpfyUwMSbQGebqqX8l
MBARGKXRKQTwDrEmRRwlMNAC5upRJpEmpdFl0ykDyQJqsJIwMBilJyy59dAiBiaw
GizN9PAFaR84sBJpI0ilJmmwsAJp8IUmaLACaR9mJmn8hSdgGKUnaQQsufXQ8wYm
kBhp4BgsCPXwEqUmaVBJ8PACSfCFJqXmkAJp4GYmkNFIqQCF4IXhheJoSDjl4EiK
5eGF07AKaEn/aQFIqQDl04XRhdVohdCF1GiF4IbhmBjl4pAESf9p/oXShOJm0zjl
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
g39dzLX8Fxf1A/sDYvr6ww==`,Ki=`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
IFTLIGPOxiowCywawDDvpSrJFLDpjQ3AaI17BWiN+wVMUcsIeKAAhCuMAcAsVMCx
KCxVwCCjzixUwLEoIKPOwCiQ7CCRzixVwCCRzixUwChgoBSpoCQyMAIpf5EoyMAo
0PlgSJhKqGiRKOYrpCtgjXsFhSSNewQsH8AQHakAhSSNewSlITjtewXJCLAMhSSp
KDjlJIUkjXsErXsFYEiYSKx7BSABz0mALADPIAbPaKhoYEgkMjACSYAsAM8gBs9o
YLggBs9ghB9IrR/AEDKlH0qocBYIeK1VwJADrVTAsSiorVTAKGiYSFAkaEgIeEit
VcCQA61UwGiRKK1UwChwDqQfcAZosShIUARoSJEoaKQfYEiYSKx7BSABz417BimA
SatMbs9ImEisewWtewYsAM8gBs9oqGhgSAh4rRHASK4SwK2BwK2BwKAAqfiFN6U2
SKkAhTaxNpE2yND55jfQ9WiFNqnDhTdoEA+KEAatgMBMxc+tgcBMxc+KEAatiMBM
xc+ticAoaGCt+wQpAdADIJvNqf+FMq37BCkE8AJGMq17B4UorfsHhSlgKEJMfJvp
/wGJ4OzM0tjpIyLmAAAAAG/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvd092zybvJy8nbyf/JO8mrZVfKF8qXyyvIX87vz
nvNh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD58jYr9gS43rn1NqV2KTWadaf20jW
kOsj7K/rCgDe4hLUzd//4o3uru9B6Qnv6u/x7zrwnvBk59bmxeMH5+XmRuZa5obm
keZ5wOd5qed7gel7aOp9lu5QVN9GTt9/z+5/l95kZN9FTsRGT9JORVjUREFUwUlO
UFXUREXMREnNUkVBxEfSVEVY1FBSo0lOo0NBTMxQTE/USExJzlZMSc5IR1KySEfS
SENPTE9SvUhQTE/URFJB11hEUkHXSFRBwkhPTcVST1S9U0NBTEW9U0hMT0HEVFJB
Q8VOT1RSQUPFTk9STUHMSU5WRVJTxUZMQVPIQ09MT1K9UE/QVlRBwkhJTUVNukxP
TUVNuk9ORVLSUkVTVU3FUkVDQUzMU1RPUsVTUEVFRL1MRdRHT1TPUlXOScZSRVNU
T1LFpkdPU1XCUkVUVVLOUkXNU1RP0E/OV0FJ1ExPQcRTQVbFREXGUE9LxVBSSU7U
Q09O1ExJU9RDTEVB0kdF1E5F11RBQqhUz0bOU1BDqFRIRc5B1E5P1FNURdCrraqv
3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFU0NSTqhQRMxQT9NTUdJSTsRMT8dFWNBD
T9NTSc5UQc5BVM5QRUXLTEXOU1RSpFZBzEFTw0NIUqRMRUZUpFJJR0hUpE1JRKQA
TkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVRIT1VUIEdPU1XCT1VUIE9G
IERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYn
RCBTVEFURU1FTtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZ
IFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTVFJJTkcgVE9PIExPTsdG
T1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/O
IEVSUk9SBwAgSU4gAA1CUkVBSwcAuujo6Oi9AQHJgdAhpYbQCr0CAYWFvQMBhYbd
AwHQB6WF3QIB8AeKGGkSqtDYYCDj04VthG44pZblm4VeqKWX5Zyq6JjwI6WWOOVe
hZawA8aXOKWU5V6FlLAIxpWQBLGWkZSI0PmxlpGUxpfGlcrQ8mAKaTawNYVeuuRe
kC5gxHCQKNAExW+QIkiiCZhItZPKEPoghOSi92iVnegw+mioaMRwkAbQBcVvsAFg
ok0k2BADTOnyIPvaIFrbvWDSSCBc2+hoEPUgg9apUKDTIDrbpHbI8AMgGe0g+9qi
3SAu1Ya4hLlG2CCxAKrw7KL/hnaQBiBZ1UwF2KavhmmmsIZqIAzaIFnVhA8gGtaQ
RKABsZuFX6VphV6lnIVhpZuI8ZsYZWmFaYVgpWpp/4Vq5ZyqOKWb5WmosAPoxmEY
ZV6QA8ZfGLFekWDI0PnmX+ZhytDyrQAC8Dilc6R0hW+EcKVphZZlD4WUpGqEl5AB
yISVIJPTpVCkUY3+AYz/AaVtpG6FaYRqpA+5+wGIkZvQ+CBl1qVnpGiFXoRfGKAB
sV7QC6Vpha+laoWwTDzUoATIsV7Q+8iYZV6qoACRXqVfaQDIkV6GXoVfkNKigIYz
IGr94O+QAqLvqQCdAAKK8Au9/wEpf53/AcrQ9akAov+gAWAgDP0pf2CmuMqgBIQT
JNYQCGhoIGXWTNLX6L0AAiQTcATJIPD0hQ7JIvB0cE3JP9AEqbrQRckwkATJPJA9
hK2p0IWdqc+FnqAAhA+IhrjKyNAC5p7ovQACySDw+DjxnfDuyYDQQQUPycXQDb0B
AslO8DTJT/AwqcWkrejImfsBufsB8Dk46TrwBMlJ0AKFEzjpeNCGhQ69AALw38UO
8NvImfsB6NDwprjmD7GdyNAC5p4KkPaxndCdvQACELuZ/QHGuan/hbhgpWemaKAB
hZuGnLGb8B/IyKVR0ZuQGPADiNAJpVCI0ZuQDPAKiLGbqoixm7DXGGDQ/akAhdao
kWfIkWelZ2kChWmFr6VoaQCFaoWwIJfWqQDQKqVzpHSFb4RwpWmkaoVrhGyFbYRu
IEnYolWGUmioaKL4mkiYSKkAhXqFFGAYpWdp/4W4pWhp/4W5YJAK8AjJyfAEySzQ
5SAM2iAa1iC3APAQycnwBMks0IQgsQAgDNrQymhopVAFUdAGqf+FUIVRoAGxm/BE
IFjYIPvayLGbqsixm8VR0ATkUPACsC2EhSAk7akgpIUpfyBc26UkySGQByD72qkF
hSTIsZvQHaixm6rIsZuGm4Wc0LapDSBc20zS18jQAuaesZ1gEMw46X+qhIWg0ISd
oM+EnqD/yvAHICzXEPsw9qkgIFzbICzXMAUgXNvQ9iBc26kg0JipgIUUIEbaIGXT
0AWKaQ+qmmhoqQkg1tMgo9kYmGW4SKW5aQBIpXZIpXVIqcEgwN4gat0gZ92logl/
JZ6FnqmvoNeFXoRfTCDeqROg6SD56iC3AMnH0AYgsQAgZ90ggusgFd6lhkilhUip
gUi6hvggWNiluKS5pnbo8ASFeYR6oACxuNBXoAKxuBjwNMixuIV1yLG4hXaYZbiF
uJAC5rkk8hAUpnbo8A+pIyBc26Z1pXYgJO0gV9sgsQAgKNhM0tfwYvAt6YCQEclA
sBQKqLkB0Ei5ANBITLEATEbayTrwv0zJ3jilZ+kBpGiwAYiFfYR+YK0AwMmD8AFg
IFPVov8k2BADTOnyyQOwARjQPKW4pLmmdujwDIV5hHqldaR2hXeEeGhoqV2g05AD
TDHUTDzU0Bei0qR60ANMEtSleYW4hLmld6R4hXWEdmA4pa/lZ4VQpbDlaIVRIPDY
IM3+IAHZTM3+IPDYIP3+GKVnZVCFaaVoZVGFaqVShdYgAdkg/f4k1hADTGXWTPLU
qVCgAIU8hD2pUoU+hD+E1mClZ6RohTyEPaVppGqFPoQ/YAjGdijQA0xl1iBs1kw1
2akDINbTpblIpbhIpXZIpXVIqbBIILcAID7ZTNLXIAzaIKbZpXbFUbALmDhluKa5
kAfosASlZ6ZoIB7WkB6lm+kBhbilnOkAhblg0P2p/4WFIGXTmsmw8AuiFiyiWkwS
1EzJ3mhowELwO4V1aIV2aIW4aIW5IKPZmBhluIW4kALmuWCiOiyiAIYNoACEDqUO
pg2FDYYOsbjw6MUO8OTIySLQ8/DpaGhoYCB73SC3AMmr8AWpxCDA3qWd0AUgptnw
tyC3ALADTD7ZTCjYIPjmSMmw8ATJq9CJxqHQBGhMKtggsQAgDNrJLPDuaGCiAIZQ
hlGw9+kvhQ2lUYVeyRmw1KVQCiZeCiZeZVCFUKVeZVGFUQZQJlGlUGUNhVCQAuZR
ILEATBLaIOPfhYWEhqnQIMDepRJIpRFIIHvdaCogbd3QGGgQEiBy6yAM4aAApaCR
hciloZGFYEwn62igArGgxXCQF9AHiLGgxW+QDqShxGqQCNANpaDFabAHpaCkoUy3
2qAAsaAg1eOljKSNhauErCDU5amdoACFjISNIDXmoACxjJGFyLGMkYXIsYyRhWAg
PdsgtwDwJPApycDwOcnDGPA0ySwY8BzJO/BEIHvdJBEw3SA07SDn40zP2qkNIFzb
Sf9gpSTJGJAFIPva0CFpECnwhSSQGQgg9ebJKfADTMneKJAHyorlJJAFqujK0AYg
sQBM19ogV9vQ8iDn4yAA5qqgAOjK8LuxXiBc28jJDdDzIADbTETbqSAsqT8JgMmg
kAIF8yDt/Sl/SKXxIKj8aGClFfASMASg/9AEpXukfIV1hHZMyd5oJNgQBaL+TOny
qe+g3CA626V5pHqFuIS5YCAG46IBoAKpAI0BAqlAIOvbYMki0A4ggd6pOyDA3iA9
20zH2yBa2yAG46ksjf8BICzVrQACyQPQEExj2CBa20ws1aZ9pH6pmCypAIUVhn+E
gCDj34WFhIaluKS5hYeEiKZ/pICGuIS5ILcA0B4kFVAOIAz9KX+NAAKi/6AB0Agw
fyBa2yDc24a4hLkgsQAkERAxJBVQCeiGuKkAhQ3wDIUNySLwB6k6hQ2pLBiFDqW4
pLlpAJAByCDt4yA95yB72kxy3EitAALwMGggSuylEiBj2iC3APAHySzwA0xx26W4
pLmFf4SApYekiIW4hLkgtwDwMyC+3kzx26UV0MxMhtsgo9nIqtASoirIsbjwX8ix
uIV7yLG4yIV8sbiqIJjZ4IPQ3Uwr3KV/pICmFRADTFPYoACxf/AHqd+g3Ew622A/
RVhUUkEgSUdOT1JFRA0AP1JFRU5URVINANAEoADwAyDj34WFhIYgZdPwBKIA8Gma
6Ojo6Iro6Ojo6OiGYKABIPnqur0JAYWipYWkhiC+5yAn66ABILTrujj9CQHwF70P
AYV1vRABhXa9EgGFuL0RAYW5TNLXimkRqpogtwDJLNDxILEAIP/cIHvdGCQ4JBEw
A7ADYLD9oqNMEtSmuNACxrnGuKIAJEiKSKkBINbTIGDeqQCFiSC3ADjpz5AXyQOw
E8kBKkkBRYnFiZBhhYkgsQBMmN2midAssHtpB5B3ZRHQA0yX5Wn/hV4KZV6oaNmy
0LBnIGrdSCD93WikhxAXqvBW0F9GEYoqprjQAsa5xrigG4WJ0NfZstCwSJDZubTQ
SLmz0EggEN6liUyG3UzJ3qWivrLQqGiFXuZeaIVfmEggcuuloUiloEiln0ilnkil
nUhsXgCg/2jwI8lk8AMgat2Eh2hKhRZohaVohaZohadohahohalohapFooWrpZ1g
qQCFESCxALADTErsIH3gsGTJLvD0ycnwVcnI8OfJItAPpbikuWkAkAHIIOfjTD3n
ycbQEKAY0DilndADoAEsoABMAePJwtADTFTjydKQA0wM3yC73iB73akpLKkoLKks
oADRuNADTLEAohBMEtSgFWhoTNfdIOPfhaCEoaYR8AWiAIasYKYSEA2gALGgqsix
oKiKTPLiTPnqILEAIOzxiqTwIHH4qCAB40y43snX8OkKSKogsQDgz5AgILveIHvd
IL7eIGzdaKqloUiloEiKSCD45mioikhMP98gst5oqLncz4WRud3PhZIgkABMat2l
pQWd0AulpfAEpZ3QA6AALKABTAHjIG3dsBOlqgl/JaaFpqmloAAgsuuqTLDfqQCF
EcaJIADmhZ2GnoSfpaikqSAE5oaohKmqOOWd8AipAZAEpp2p/4WioP/oyMrQB6ai
MA8YkAyxqNGe8O+i/7ACogHoiiolFvACqQFMk+sg++YgHvtMAeMgvt6qIOjfILcA
0PRgogAgtwCGEIWBILcAIH3gsANMyd6iAIYRhhJMB+BMKPFMPNQAILEAkAUgfeCQ
C6ogsQCQ+yB94LD2ySTQBqn/hRHQEMkl0BOlFDDGqYCFEgWBhYGKCYCqILEAhoI4
BRTpKNADTB7hJBQwAnD3qQCFFKVppmqgAIachZvkbNAExWvwIqWB0ZvQCKWCyNGb
8GyIGKWbaQeQ4ejQ3MlBkAXpWzjppWBoSMnX0A+6vQIByd7QB6maoOBgAACla6Rs
hZuEnKVtpG6FloSXGGkHkAHIhZSElSCT06WUpJXIhWuEbKAApYGRm8ilgpGbqQDI
kZvIkZvIkZvIkZvIkZulmxhpAqSckAHIhYOEhGClDwppBWWbpJyQAciFlISVYJCA
AAAgsQAgZ92lojANpZ3JkJAJqf6g4CCy69B+TPLrpRTQR6UQBRJIpRFIoACYSKWC
SKWBSCAC4WiFgWiFgmiour0CAUi9AQFIpaCdAgGloZ0BAcggtwDJLPDShA8guN5o
hRFohRIpf4UQpmulbIabhZzFbtAE5G3wP6AAsZvIxYHQBqWC0ZvwFsixmxhlm6rI
sZtlnJDXomssojVMEtSieKUQ0PelFPACOGAg7eClD6AE0ZvQ4UxL4qUU8AWiKkwS
1CDt4CDj06kAqIWuogWlgZGbEAHKyKWCkZsQAsrKhq2lD8jIyJGbogupACQQUAho
GGkBqmhpAMiRm8iKkZsgreKGrYWupF7GD9DcZZWwXYWVqIpllJADyPBSIOPThW2E
bqkA5q6krfAFiJGU0PvGlcau0PXmlTilbeWboAKRm6VuyOWckZulENBiyLGbhQ+p
AIWtha7IaKqFoGiFodGbkA7QBsiK0ZuQB0yW4UwQ1MilrgWtGPAKIK3iimWgqpik
XmWhhq3GD9DKha6iBaWBEAHKpYIQAsrKhmSpACC24opllIWDmGWVhYSopYNghF6x
m4VkiLGbhWWpEIWZogCgAIoKqpgqqLCkBq0mrpALGIplZKqYZWWosJPGmdDjYKUR
8AMgAOYghOQ4pW/lbailcOVuogCGEYWehJ+ikEyb66QkqQA48OymdujQoaKVLKLg
TBLUIEHjIAbjILveqYCFFCDj3yBq3SC43qnQIMDeSKWESKWDSKW5SKW4SCCV2Uyv
46nCIMDeCYCFFCDq34WKhItMat0gQeOli0ilikggst4gat1ohYpohYugArGKhYOq
yLGK8JmFhMixg0iIEPqkhCAr66W5SKW4SLGKhbjIsYqFuaWESKWDSCBn3WiFimiF
iyC3APADTMneaIW4aIW5oABokYpoyJGKaMiRimjIkYpoyJGKYCBq3aAAIDbtaGip
/6AA8BKmoKShhoyEjSBS5IaehJ+FnWCiIoYNhg6Fq4SshZ6En6D/yLGr8AzFDfAE
xQ7Q88ki8AEYhJ2YZauFraaskAHohq6lrPAEyQLQC5gg1eOmq6SsIOLlplLgXtAF
or9MEtSlnZUApZ6VAaWflQKgAIaghKGIhBGGU+jo6IZSYEYTSEn/OGVvpHCwAYjE
bpAR0ATFbZALhW+EcIVxhHKqaGCiTaUTMLgghOSpgIUTaNDQpnOldIZvhXCgAISL
pW2mboWbhpypVaIAhV6GX8VS8AUgI+Xw96kHhY+laaZqhV6GX+Rs0ATFa/AFIBnl
8POFlIaVqQOFj6WUppXkbtAHxW3QA0xi5YVehl+gALFeqsixXgjIsV5llIWUyLFe
ZZWFlSgQ04ow0MixXqAACmkFZV6FXpAC5l+mX+SV0ATFlPC6ICPl8POxXjA1yLFe
EDDIsV7wK8ixXqrIsV7FcJAG0B7kb7AaxZyQFtAE5JuQEIabhZylXqZfhYqGi6WP
hZGljxhlXoVekALmX6ZfoABgpovw96WRKQRKqIWRsYplm4WWpZxpAIWXpW+mcIWU
hpUgmtOkkcillJGKquaVpZXIkYpMiOSloUiloEggYN4gbN1ohatohaygALGrGHGg
kAWisEwS1CDV4yDU5aWMpI0gBOYg5uWlq6SsIATmICrkTJXdoACxq0jIsauqyLGr
qGiGXoRfqPAKSIixXpFxmND4aBhlcYVxkALmcmAgbN2loKShhV6EXyA15gigALFe
SMixXqrIsV6oaCjQE8Rw0A/kb9ALSBhlb4VvkALmcGiGXoRfYMRU0AzFU9AIhVLp
A4VToABgIPvmikipASDd42igAJGeaGhMKuQguebRjJiQBLGMqphIikgg3eOljKSN
IATmaKhoGGVehV6QAuZfmCDm5Uwq5CC55hjxjEn/TGDmqf+FoSC3AMkp8AYgvt4g
+OYguebKikgYogDxjLC4Sf/FoZCzpaGwryC43mioaIWRaGhoqmiFjGiFjaWRSJhI
oACK8B1gINzmTAHjIP3logCGEahgINzm8AigALFeqEwB40yZ4SCxACBn3SAI4aag
0PCmoUy3ACDc5tADTE7oprikuYathK6mXoa4GGVehWCmX4a5kAHohmGgALFgSKkA
kWAgtwAgSuxooACRYKatpK6GuIS5YCBn3SBS5yC+3kz45qWdyZGwmiDy66WgpKGE
UIVRYKVQSKVRSCBS56AAsVCoaIVRaIVQTAHjIEbniqAAkVBgIEbnhoWiACC3APAD
IEznhoagALFQRYYlhfD4YKlkoO5Mvucg4+mlokn/haJFqoWrpZ1Mwecg8OiQPCDj
6dADTFPrpqyGkqKlpaWo8M445Z3wJJAShJ2kqoSiSf9pAKAAhJKindAEoACErMn5
MMeopaxWASAH6SSrEFegneCl8AKgpThJ/2WShay5BAD1BIWhuQMA9QOFoLkCAPUC
hZ+5AQD1AYWesAMgnuigAJgYpp7QSqafhp6moIafpqGGoKashqGErGkIySDQ5KkA
hZ2FomBlkoWspaFlqYWhpaBlqIWgpZ9lp4WfpZ5lpoWeTI3oaQEGrCahJqAmnyae
EPI45Z2wx0n/aQGFnZAO5p3wQmaeZp9moGahZqxgpaJJ/4WipZ5J/4WepZ9J/4Wf
paBJ/4WgpaFJ/4WhpaxJ/4Ws5qzQDuah0ArmoNAG5p/QAuaeYKJFTBLUomG0BISs
tAOUBLQClAO0AZQCpKSUAWkIMOjw5ukIqKWssBQWAZAC9gF2AXYBdgJ2A3YEasjQ
7BhggQAAAAADf15Wy3mAE5sLZIB2OJMWgjiqOyCANQTzNIE1BPM0gIAAAACAMXIX
+CCC6/ACEANMmeGlnel/SKmAhZ2pLaDpIL7nqTKg6SBm6qkToOkgp+epGKDpIFzv
qTeg6SC+52gg1eypPKDpIOPp0ANM4ukgDuqpAIVihWOFZIVlpawgsOmloSCw6aWg
ILDppZ8gsOmlniC16Uzm6tADTNroSgmAqJAZGKVlZamFZaVkZaiFZKVjZaeFY6Vi
ZaaFYmZiZmNmZGZlZqyYStDWYIVehF+gBLFehamIsV6FqIixXoWniLFehapFooWr
paoJgIWmiLFehaWlnWClpfAfGGWdkAQwHRgsEBRpgIWd0ANMUuilq4WiYKWiSf8w
BWhoTE7oTNXoIGPrqvAQGGkCsPKiAIarIM7n5p3w52CEIAAAACBj66lQoOqiAIar
IPnqTGnqIOPp8HYgcuupADjlnYWdIA7q5p3wuqL8qQGkpsSe0BCkp8Sf0AqkqMSg
0ASkqcShCCqQCeiVZfAyEDSpASiwDgapJqgmpyamsOYwzhDiqKWp5aGFqaWo5aCF
qKWn5Z+Fp6Wm5Z6FpphMpuqpQNDOCgoKCgoKhawoTObqooVMEtSlYoWepWOFn6Vk
haClZYWhTC7ohV6EX6AEsV6FoYixXoWgiLFehZ+IsV6FogmAhZ6IsV6FnYSsYKKY
LKKToADwBKaFpIYgcuuGXoRfoASloZFeiKWgkV6IpZ+RXoilogl/JZ6RXoilnZFe
hKxgpaqFoqIFtaSVnMrQ+YasYCBy66IGtZyVpMrQ+YasYKWd8PsGrJD3IMbo0PJM
j+ilnfAJpaIqqf+wAqkBYCCC64WeqQCFn6KIpZ5J/yqpAIWhhaCGnYWshaJMKehG
omCFYIRhoACxYMiq8MSxYEWiMMLkndAhsWAJgMWe0BnIsWDFn9ASyLFgxaDQC8ip
f8WssWDlofAopaKQAkn/TIjrpZ3wSjjpoCSiEAmqqf+FpCCk6Iqincn5EAYg8OiE
pGCopaIpgEaeBZ6FniAH6YSkYKWdyaCwICDy64SspaKEokmAKqmghZ2loYUNTCno
hZ6Fn4WghaGoYKAAogqUmcoQ+5APyS3QBIaj8ATJK9AFILEAkFvJLvAuyUXQMCCx
AJAXycnwDskt8ArJyPAIySvwBNAHZpwgsQCQXCScEA6pADjlmkyg7GabJJtQw6Wa
OOWZhZrwEhAJIFXq5prQ+fAHIDnqxprQ+aWjMAFgTNDuSCSbEALmmSA56mg46TAg
1exMYexIIGPraCCT66WqRaKFq6adTMHnpZrJCpAJqWQknDARTNXoCgoYZZoKGKAA
cbg46TCFmkyH7Js+vB/9nm5rJ/2ebmsoAKlYoNMgMe2ldqZ1hZ6Gn6KQOCCg6yA0
7Uw626ABqS2IJKIQBMiZ/wCFooStyKkwpp3QA0xX7qkA4IDwArAJqRSg7SB/6an3
hZmpD6DtILLr8B4QEqkKoO0gsuvwAhAOIDnqxpnQ7iBV6uaZ0NwgoOcg8uuiAaWZ
GGkKMAnJC7AGaf+qqQI46QKFmoaZivACEBOkrakuyJn/AIrwBqkwyJn/AIStoACi
gKWhGHls7oWhpaB5a+6FoKWfeWruhZ+lnnlp7oWe6LAEEN4wAjDaipAESf9pCmkv
yMjIyISDpK3Iqil/mf8AxpnQBqkuyJn/AIStpIOKSf8pgKrAJNCqpK25/wCIyTDw
+Mku8AHIqSummvAuEAipADjlmqqpLZkBAalFmQABiqIvOOjpCrD7aTqZAwGKmQIB
qQCZBAHwCJn/AKkAmQABqQCgAWCAAAAAAPoKHwAAmJaA//C9wAABhqD//9jwAAAD
6P///5wAAAAK/////yBj66lkoO4g+erwcKWl0ANMUOiiiqAAICvrpaoQDyAj7KmK
oAAgsuvQA5ikDSBV65hIIEHpqYqgACB/6SAJ72hKkAqlnfAGpaJJ/4WiYIE4qjsp
B3E0WD5WdBZ+sxt3L+7jhXodhBwqfGNZWAp+df3nxoAxchgQgQAAAACp26DuIH/p
paxpUJADIHrrhZIgZuulncmIkAMgK+ogI+ylDRhpgfDzOOkBSKIFtaW0nZWdlKXK
EPWlkoWsIKrnINDuqeCg7iBy76kAhatoIBDqYIWthK4gIeupkyB/6SB276mToABM
f+mFrYSuIB7rsa2Fo6StyJjQAuauha2kriB/6aWtpK4YaQWQAciFrYSuIL7nqZig
AMaj0ORgmDVEemgosUYgguuqMBipyaAAIPnqivDnqaag7yB/6amqoO8gvuemoaWe
haGGnqkAhaKlnYWsqYCFnSAu6KLJoABMK+upZqDwIL7nIGPrqWug8KaqIF7qIGPr
ICPsqQCFqyCq56lwoPAgp+elokgQDSCg56WiMAmlFkn/hRYg0O6pcKDwIL7naBAD
INDuqXWg8Exc7yAh66kAhRYg8e+iiqAAIOfvqZOgACD56qkAhaKlFiBi8KmKoABM
ZupITCPwgUkP2qKDSQ/aon8AAAAABYTmGi0bhigH+/iHmWiJAYcjNd/hhqVd5yiD
SQ/aoqbTwcjUyNXEzsqlokgQAyDQ7qWdSMmBkAepE6DpIGbqqc6g8CBc72jJgZAH
qWag8CCn52gQA0zQ7mALdrODvdN5HvSm9XuD/LAQfAwfZ8p83lPLwX0UZHBMfbfq
UXp9YzCIfn6SRJk6fkzMkcd/qqqqE4EAAAAA5rjQAua5rWDqyTqwCskg8O846TA4
6dBggE/HUlii/4Z2ovuaqSig8YUBhAKFBIQFIHPyqUyFAIUDhZCFCqmZoOGFC4QM
ohy9CvGVsIbxytD2hvKKhaSFVEipA4WPIPvaqQGN/QGN/AGiVYZSqQCgCIVQhFGg
AOZRsVBJ/5FQ0VDQCEn/kVDRUPDspFClUSnwhHOFdIRvhXCiAKAIhmeEaKAAhNaY
kWfmZ9AC5milZ6RoIOPTIEvWqTqg24UEhAWpPKDUhQGEAmwBACBn3SBS52xQACD4
5opMi/4g+OaKTJX+IPjm4DCwE4bwqSwgwN4g+ObgMLAFhiyGLWBMmeEg7PHk8LAI
pfCFLIUthvCpxSDA3iD45uAwsOJgIOzxiqTwwCiw10wA+CAJ8oqkLMAosMqk8EwZ
+CAJ8oqowCiwvKXwTCj4IPjmikxk+CD45sqKyRiwp0xb+yD45opJ/6rohvFgOJAY
ZvJgqf/QAqk/ogCFMobzYKl/okDQ9SBn3SBS56VQxW2lUeVusANMENSlUIVzhW+l
UYV0hXBgIGfdIFLnpVDFc6VR5XSw4KVQxWmlUeVqkNalUIVppVGFakxs1qmrIMDe
pbiF9KW5hfU4ZtildYX2pXaF9yCm2UyY2YbepviG36V1hdqldoXbpXmF3KV6hd2l
9IW4pfWFuaX2hXWl94V2ILcAID7ZTNLXpdqFdaXbhXal3IW4pd2FuabfmkzS10zJ
3rD7pq+GaaawhmogDNogGtalm4VgpZyFYaksIMDeIAza5lDQAuZRIBrWpZvFYKWc
5WGwAWCgALGbkWDmm9AC5pzmYNAC5mGlacWbpWrlnLDmpmGkYNAByoiGaoRpTPLU
rVbArVPATED7rVTATDn7INn3oAOxm6qIsZvpAbAByoVQhlEgzf4gvPdMzf4g2fcg
/f6gArGbxVDIsZvlUbADTBDUILz3TP3+LFXALFLAqUDQCKkgLFTALFPAheatV8Ct
UMCpAIUcpeaFG6AAhBqlHJEaIH70yND25hulGykf0O5gheKG4IThSCnAhSZKSgUm
hSZohScKCgomJwomJwpmJqUnKR8F5oUnisAA8AWgI2kEyOkHsPuE5aq9ufSFMJhK
peSFHLAoYCAR9KUcUSYlMFEmkSZgECOlMEqwBUnAhTBgiBACoCepwIUwhOWlHArJ
wBAGpRxJf4UcYKUwCkmAMN2pgcjAKJDgoACw3Bil0SkE8CWpfyUwMSbQGebqqX8l
MBARGKXRKQTwDrEmRRwlMNAC5upRJpEmpdFl0ykDyQJqsJIwMBilJyy59dAiBiaw
GizN9PAFaR84sBJpI0ilJmmwsAJp8IUmaLACaR9mJmn8hSdgGKUnaQQsufXQ8wYm
kBhp4BgsCPXwEqUmaVBJ8PACSfCFJqXmkAJp4GYmkNFIqQCF4IXhheJoSDjl4EiK
5eGF07AKaEn/aQFIqQDl04XRhdVohdCF1GiF4IbhmBjl4pAESf9p/oXShOJm0zjl
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
g39dzLX8Fxf1A/sDYvpA+g==`,js=new Array(256),Fn={},f=(t,e,r,o)=>{console.assert(!js[r],"Duplicate instruction: "+t+" mode="+e),js[r]={name:t,mode:e,bytes:o},Fn[t]||(Fn[t]=[]),Fn[t][e]=r};f("ADC",A.IMM,105,2),f("ADC",A.ZP_REL,101,2),f("ADC",A.ZP_X,117,2),f("ADC",A.ABS,109,3),f("ADC",A.ABS_X,125,3),f("ADC",A.ABS_Y,121,3),f("ADC",A.IND_X,97,2),f("ADC",A.IND_Y,113,2),f("ADC",A.IND,114,2),f("AND",A.IMM,41,2),f("AND",A.ZP_REL,37,2),f("AND",A.ZP_X,53,2),f("AND",A.ABS,45,3),f("AND",A.ABS_X,61,3),f("AND",A.ABS_Y,57,3),f("AND",A.IND_X,33,2),f("AND",A.IND_Y,49,2),f("AND",A.IND,50,2),f("ASL",A.IMPLIED,10,1),f("ASL",A.ZP_REL,6,2),f("ASL",A.ZP_X,22,2),f("ASL",A.ABS,14,3),f("ASL",A.ABS_X,30,3),f("BCC",A.ZP_REL,144,2),f("BCS",A.ZP_REL,176,2),f("BEQ",A.ZP_REL,240,2),f("BIT",A.ZP_REL,36,2),f("BIT",A.ABS,44,3),f("BIT",A.IMM,137,2),f("BIT",A.ZP_X,52,2),f("BIT",A.ABS_X,60,3),f("BMI",A.ZP_REL,48,2),f("BNE",A.ZP_REL,208,2),f("BPL",A.ZP_REL,16,2),f("BVC",A.ZP_REL,80,2),f("BVS",A.ZP_REL,112,2),f("BRA",A.ZP_REL,128,2),f("BRK",A.IMPLIED,0,1),f("CLC",A.IMPLIED,24,1),f("CLD",A.IMPLIED,216,1),f("CLI",A.IMPLIED,88,1),f("CLV",A.IMPLIED,184,1),f("CMP",A.IMM,201,2),f("CMP",A.ZP_REL,197,2),f("CMP",A.ZP_X,213,2),f("CMP",A.ABS,205,3),f("CMP",A.ABS_X,221,3),f("CMP",A.ABS_Y,217,3),f("CMP",A.IND_X,193,2),f("CMP",A.IND_Y,209,2),f("CMP",A.IND,210,2),f("CPX",A.IMM,224,2),f("CPX",A.ZP_REL,228,2),f("CPX",A.ABS,236,3),f("CPY",A.IMM,192,2),f("CPY",A.ZP_REL,196,2),f("CPY",A.ABS,204,3),f("DEC",A.IMPLIED,58,1),f("DEC",A.ZP_REL,198,2),f("DEC",A.ZP_X,214,2),f("DEC",A.ABS,206,3),f("DEC",A.ABS_X,222,3),f("DEX",A.IMPLIED,202,1),f("DEY",A.IMPLIED,136,1),f("EOR",A.IMM,73,2),f("EOR",A.ZP_REL,69,2),f("EOR",A.ZP_X,85,2),f("EOR",A.ABS,77,3),f("EOR",A.ABS_X,93,3),f("EOR",A.ABS_Y,89,3),f("EOR",A.IND_X,65,2),f("EOR",A.IND_Y,81,2),f("EOR",A.IND,82,2),f("INC",A.IMPLIED,26,1),f("INC",A.ZP_REL,230,2),f("INC",A.ZP_X,246,2),f("INC",A.ABS,238,3),f("INC",A.ABS_X,254,3),f("INX",A.IMPLIED,232,1),f("INY",A.IMPLIED,200,1),f("JMP",A.ABS,76,3),f("JMP",A.IND,108,3),f("JMP",A.IND_X,124,3),f("JSR",A.ABS,32,3),f("LDA",A.IMM,169,2),f("LDA",A.ZP_REL,165,2),f("LDA",A.ZP_X,181,2),f("LDA",A.ABS,173,3),f("LDA",A.ABS_X,189,3),f("LDA",A.ABS_Y,185,3),f("LDA",A.IND_X,161,2),f("LDA",A.IND_Y,177,2),f("LDA",A.IND,178,2),f("LDX",A.IMM,162,2),f("LDX",A.ZP_REL,166,2),f("LDX",A.ZP_Y,182,2),f("LDX",A.ABS,174,3),f("LDX",A.ABS_Y,190,3),f("LDY",A.IMM,160,2),f("LDY",A.ZP_REL,164,2),f("LDY",A.ZP_X,180,2),f("LDY",A.ABS,172,3),f("LDY",A.ABS_X,188,3),f("LSR",A.IMPLIED,74,1),f("LSR",A.ZP_REL,70,2),f("LSR",A.ZP_X,86,2),f("LSR",A.ABS,78,3),f("LSR",A.ABS_X,94,3),f("NOP",A.IMPLIED,234,1),f("ORA",A.IMM,9,2),f("ORA",A.ZP_REL,5,2),f("ORA",A.ZP_X,21,2),f("ORA",A.ABS,13,3),f("ORA",A.ABS_X,29,3),f("ORA",A.ABS_Y,25,3),f("ORA",A.IND_X,1,2),f("ORA",A.IND_Y,17,2),f("ORA",A.IND,18,2),f("PHA",A.IMPLIED,72,1),f("PHP",A.IMPLIED,8,1),f("PHX",A.IMPLIED,218,1),f("PHY",A.IMPLIED,90,1),f("PLA",A.IMPLIED,104,1),f("PLP",A.IMPLIED,40,1),f("PLX",A.IMPLIED,250,1),f("PLY",A.IMPLIED,122,1),f("ROL",A.IMPLIED,42,1),f("ROL",A.ZP_REL,38,2),f("ROL",A.ZP_X,54,2),f("ROL",A.ABS,46,3),f("ROL",A.ABS_X,62,3),f("ROR",A.IMPLIED,106,1),f("ROR",A.ZP_REL,102,2),f("ROR",A.ZP_X,118,2),f("ROR",A.ABS,110,3),f("ROR",A.ABS_X,126,3),f("RTI",A.IMPLIED,64,1),f("RTS",A.IMPLIED,96,1),f("SBC",A.IMM,233,2),f("SBC",A.ZP_REL,229,2),f("SBC",A.ZP_X,245,2),f("SBC",A.ABS,237,3),f("SBC",A.ABS_X,253,3),f("SBC",A.ABS_Y,249,3),f("SBC",A.IND_X,225,2),f("SBC",A.IND_Y,241,2),f("SBC",A.IND,242,2),f("SEC",A.IMPLIED,56,1),f("SED",A.IMPLIED,248,1),f("SEI",A.IMPLIED,120,1),f("STA",A.ZP_REL,133,2),f("STA",A.ZP_X,149,2),f("STA",A.ABS,141,3),f("STA",A.ABS_X,157,3),f("STA",A.ABS_Y,153,3),f("STA",A.IND_X,129,2),f("STA",A.IND_Y,145,2),f("STA",A.IND,146,2),f("STX",A.ZP_REL,134,2),f("STX",A.ZP_Y,150,2),f("STX",A.ABS,142,3),f("STY",A.ZP_REL,132,2),f("STY",A.ZP_X,148,2),f("STY",A.ABS,140,3),f("STZ",A.ZP_REL,100,2),f("STZ",A.ZP_X,116,2),f("STZ",A.ABS,156,3),f("STZ",A.ABS_X,158,3),f("TAX",A.IMPLIED,170,1),f("TAY",A.IMPLIED,168,1),f("TSX",A.IMPLIED,186,1),f("TXA",A.IMPLIED,138,1),f("TXS",A.IMPLIED,154,1),f("TYA",A.IMPLIED,152,1),f("TRB",A.ZP_REL,20,2),f("TRB",A.ABS,28,3),f("TSB",A.ZP_REL,4,2),f("TSB",A.ABS,12,3);const qi=65536,Hs=65792,vs=66048;class Ni{constructor(){d(this,"address");d(this,"watchpoint");d(this,"instruction");d(this,"disabled");d(this,"hidden");d(this,"once");d(this,"memget");d(this,"memset");d(this,"expression1");d(this,"expression2");d(this,"expressionOperator");d(this,"hexvalue");d(this,"hitcount");d(this,"nhits");d(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class zs extends Map{set(e,r){const o=[...this.entries()];o.push([e,r]),o.sort((a,h)=>a[0]-h[0]),super.clear();for(const[a,h]of o)super.set(a,h);return this}}let Un=!1,Kn=!1,ct=new zs;const Mr=()=>{Un=!0},Yi=()=>{new zs(ct).forEach((o,a)=>{o.once&&ct.delete(a)});const e=la();if(e<0||ct.get(e))return;const r=new Ni;r.address=e,r.once=!0,r.hidden=!0,ct.set(e,r)},Oi=t=>{ct=t},$s=(t,e)=>{const r=wt[t];return!(e<r.min||e>r.max||!r.enabled(e))},to=(t,e,r)=>{const o=ct.get(t);return!o||!o.watchpoint||o.disabled||o.hexvalue>=0&&o.hexvalue!==e||o.memoryBank&&!$s(o.memoryBank,t)?!1:r?o.memset:o.memget},er=(t=0,e=!0)=>{e?c.flagIRQ|=1<<t:c.flagIRQ&=~(1<<t),c.flagIRQ&=255},xi=(t=!0)=>{c.flagNMI=t===!0},Wi=()=>{c.flagIRQ=0,c.flagNMI=!1},qn=[],eo=[],ro=(t,e)=>{qn.push(t),eo.push(e)},Xi=()=>{for(let t=0;t<qn.length;t++)qn[t](eo[t])},no=t=>{let e=0;switch(t.register){case"$":e=Ye(t.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},Gi=t=>{const e=no(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:no(t.expression2)},so=()=>{Kn=!0},Zi=(t=-1,e=-1)=>{if(Kn)return Kn=!1,!0;if(ct.size===0||Un)return!1;const r=ct.get(c.PC)||ct.get(-1)||ct.get(t|qi)||t>=0&&ct.get(Hs)||t>=0&&ct.get(vs);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===Hs){if(G[t].name!=="???")return!1}else if(r.address===vs){if(G[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!Gi(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!$s(r.memoryBank,c.PC)?!1:(r.once&&ct.delete(c.PC),!0)},Nn=()=>{let t=0;const e=c.PC,r=B(c.PC,!1),o=G[r],a=o.bytes>1?B(c.PC+1,!1):-1,h=o.bytes>2?B(c.PC+2,!1):0;if(Zi(r,(h<<8)+a))return Lt(F.PAUSED),-1;Un=!1;const p=lo.get(e);if(p&&!E.INTCXROM.isSet&&p(),t=o.execute(a,h),So(o.bytes),Fr(c.cycleCount+t),Xi(),c.flagNMI&&(c.flagNMI=!1,t=Ia(),Fr(c.cycleCount+t)),c.flagIRQ){const u=ha();u>0&&(Fr(c.cycleCount+u),t=u)}return t},_i=[197,58,163,92,197,58,163,92],Ji=1,oo=4;class Vi{constructor(){d(this,"bits",[]);d(this,"pattern",new Array(64));d(this,"patternIdx",0);d(this,"reset",()=>{this.patternIdx=0});d(this,"checkPattern",e=>{const o=_i[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===o});d(this,"calcBits",()=>{const e=W=>{this.bits.push(W&8?1:0),this.bits.push(W&4?1:0),this.bits.push(W&2?1:0),this.bits.push(W&1?1:0)},r=W=>{e(Math.floor(W/10)),e(Math.floor(W%10))},o=new Date,a=o.getFullYear()%100,h=o.getDate(),p=o.getDay()+1,u=o.getMonth()+1,D=o.getHours(),V=o.getMinutes(),R=o.getSeconds(),et=o.getMilliseconds()/10;this.bits=[],r(a),r(u),r(h),r(p),r(D),r(V),r(R),r(et)});d(this,"access",e=>{e&oo?this.reset():this.checkPattern(e&Ji)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});d(this,"read",e=>{let r=-1;return this.bits.length>0?e&oo&&(r=this.bits.pop()):this.access(e),r})}}const ji=new Vi,Ao=320,io=327,Lr=256*Ao,Hi=256*io;let bt=0;const Yn=vt;let y=new Uint8Array(Yn+(bt+1)*65536).fill(0);const On=()=>de(49194),Qr=t=>{v(49194,t)},we=()=>de(49267),xn=t=>{v(49267,t)},st=new Array(257).fill(0),kt=new Array(257).fill(0),ao=t=>{let e="";switch(t){case"APPLE2EU":e=Ki;break;case"APPLE2EE":e=Ui;break}const r=e.replace(/\n/g,""),o=new Uint8Array(ft.Buffer.from(r,"base64"));y.set(o,ze)},Wn=t=>{t=Math.max(64,Math.min(8192,t));const e=bt;if(bt=Math.floor(t/64)-1,bt===e)return;we()>bt&&(xn(0),$t());const r=Yn+(bt+1)*65536;if(bt<e)y=y.slice(0,r);else{const o=y;y=new Uint8Array(r).fill(255),y.set(o)}},vi=()=>{const t=E.RAMRD.isSet?Ue+we()*256:0,e=E.RAMWRT.isSet?Ue+we()*256:0,r=E.PAGE2.isSet?Ue+we()*256:0,o=E.STORE80.isSet?r:t,a=E.STORE80.isSet?r:e,h=E.STORE80.isSet&&E.HIRES.isSet?r:t,p=E.STORE80.isSet&&E.HIRES.isSet?r:e;for(let u=2;u<256;u++)st[u]=u+t,kt[u]=u+e;for(let u=4;u<=7;u++)st[u]=u+o,kt[u]=u+a;for(let u=32;u<=63;u++)st[u]=u+h,kt[u]=u+p},zi=()=>{const t=E.ALTZP.isSet?Ue+we()*256:0;if(st[0]=t,st[1]=1+t,kt[0]=t,kt[1]=1+t,E.BSRREADRAM.isSet){for(let e=208;e<=255;e++)st[e]=e+t;if(!E.BSRBANK2.isSet)for(let e=208;e<=223;e++)st[e]=e-16+t}else for(let e=208;e<=255;e++)st[e]=ve+e-192},$i=()=>{const t=E.ALTZP.isSet?Ue+we()*256:0,e=E.BSR_WRITE.isSet;for(let r=192;r<=255;r++)kt[r]=-1;if(e){for(let r=208;r<=255;r++)kt[r]=r+t;if(!E.BSRBANK2.isSet)for(let r=208;r<=223;r++)kt[r]=r-16+t}},co=t=>E.INTCXROM.isSet?!1:t!==3?!0:E.SLOTC3ROM.isSet,ta=()=>!!(E.INTCXROM.isSet||E.INTC8ROM.isSet),Xn=t=>{if(t<=7){if(E.INTCXROM.isSet)return;t===3&&!E.SLOTC3ROM.isSet&&(E.INTC8ROM.isSet||(E.INTC8ROM.isSet=!0,Qr(255),$t())),On()===0&&(Qr(t),$t())}else E.INTC8ROM.isSet=!1,Qr(0),$t()},ea=()=>{st[192]=ve-192;for(let t=1;t<=7;t++){const e=192+t;st[e]=t+(co(t)?Ao-1:ve)}if(ta())for(let t=200;t<=207;t++)st[t]=ve+t-192;else{const t=io+8*(On()-1);for(let e=0;e<=7;e++){const r=200+e;st[r]=t+e}}},$t=()=>{vi(),zi(),$i(),ea();for(let t=0;t<256;t++)st[t]=256*st[t],kt[t]=256*kt[t]},lo=new Map,uo=new Array(8),br=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Xn(r),!co(r)))return;const o=uo[r];if(o!==void 0){const a=o(t,e);if(a>=0){const h=t>=49408?Lr-256:ze;y[t-49152+h]=a}}},rr=(t,e)=>{uo[t]=e},Ne=(t,e,r=0,o=()=>{})=>{if(y.set(e.slice(0,256),Lr+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,h=Hi+(t-1)*2048;y.set(e.slice(256,a),h)}r&&lo.set(r,o)},ra=()=>{y.fill(255,0,65536),y.fill(255,Yn),Qr(0),xn(0),$t()},na=t=>(t>=49296?br(t):Vs(t,!1,c.cycleCount),t>=49232&&$t(),y[ze+t-49152]),O=(t,e)=>{const r=Lr+(t-1)*256+(e&255);return y[r]},Q=(t,e,r)=>{if(r>=0){const o=Lr+(t-1)*256+(e&255);y[o]=r&255}},B=(t,e=!0)=>{let r=0;const o=t>>>8;if(o===192)r=na(t);else if(r=-1,o>=193&&o<=199?(o==195&&!E.SLOTC3ROM.isSet&&(r=ji.read(t)),br(t)):t===53247&&Xn(255),r<0){const a=st[o];r=y[a+(t&255)]}return e&&to(t,r,!1)&&so(),r},Ye=t=>{const e=t>>>8,r=st[e];return y[r+(t&255)]},sa=(t,e)=>{if(t===49265||t===49267){if(e>bt)return;xn(e)}else t>=49296?br(t,e):Vs(t,!0,c.cycleCount);(t<=49167||t>=49232)&&$t()},m=(t,e)=>{const r=t>>>8;if(r===192)sa(t,e);else{r>=193&&r<=199?br(t,e):t===53247&&Xn(255);const o=kt[r];if(o<0)return;y[o+(t&255)]=e}to(t,e,!0)&&so()},de=t=>y[ze+t-49152],v=(t,e,r=1)=>{const o=ze+t-49152;y.fill(e,o,o+r)},ho=1024,Io=2048,Gn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Zn=(t=!1)=>{let e=0,r=24,o=!1;if(t){if(E.TEXT.isSet||E.HIRES.isSet)return new Uint8Array;r=E.MIXED.isSet?20:24,o=E.COLUMN80.isSet&&!E.AN3.isSet}else{if(!E.TEXT.isSet&&!E.MIXED.isSet)return new Uint8Array;!E.TEXT.isSet&&E.MIXED.isSet&&(e=20),o=E.COLUMN80.isSet}if(o){const a=E.PAGE2.isSet&&!E.STORE80.isSet?Io:ho,h=new Uint8Array(80*(r-e)).fill(160);for(let p=e;p<r;p++){const u=80*(p-e);for(let D=0;D<40;D++)h[u+2*D+1]=y[a+Gn[p]+D],h[u+2*D]=y[vt+a+Gn[p]+D]}return h}else{const a=E.PAGE2.isSet?Io:ho,h=new Uint8Array(40*(r-e));for(let p=e;p<r;p++){const u=40*(p-e),D=a+Gn[p];h.set(y.slice(D,D+40),u)}return h}},go=()=>ft.Buffer.from(Zn().map(t=>t&=127)).toString(),oa=()=>{if(E.TEXT.isSet||!E.HIRES.isSet)return new Uint8Array;const t=E.COLUMN80.isSet&&!E.AN3.isSet,e=E.MIXED.isSet?160:192;if(t){const r=E.PAGE2.isSet&&!E.STORE80.isSet?16384:8192,o=new Uint8Array(80*e);for(let a=0;a<e;a++){const h=ti(r,a);for(let p=0;p<40;p++)o[a*80+2*p+1]=y[h+p],o[a*80+2*p]=y[vt+h+p]}return o}else{const r=E.PAGE2.isSet?16384:8192,o=new Uint8Array(40*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);o.set(y.slice(h,h+40),a*40)}return o}},_n=t=>{const e=st[t>>>8];return y.slice(e,e+512)},Jn=(t,e)=>{const r=kt[t>>>8]+(t&255);y.set(e,r)},Vn=(t,e)=>{for(let r=0;r<e.length;r++)if(B(t+r,!1)!==e[r])return!1;return!0},Aa=()=>y.slice(0,vt+65536),wt={};wt[""]={name:"Any",min:0,max:65535,enabled:()=>!0},wt.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?!E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?!E.RAMRD.isSet:!E.ALTZP.isSet},wt.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?E.RAMRD.isSet:E.ALTZP.isSet},wt.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535,enabled:()=>!E.BSRREADRAM.isSet},wt["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet},wt["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet},wt["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet},wt["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet},wt["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet||!E.SLOTC3ROM.isSet:t>=51200?E.INTCXROM.isSet||E.INTC8ROM.isSet:E.INTCXROM.isSet},wt["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet?!1:E.SLOTC3ROM.isSet:t>=51200?!E.INTCXROM.isSet&&!E.INTC8ROM.isSet:!E.INTCXROM.isSet},Object.values(wt).map(t=>t.name);const c=HA(),nr=t=>{c.Accum=t},sr=t=>{c.XReg=t},or=t=>{c.YReg=t},Fr=t=>{c.cycleCount=t},fo=t=>{po(),Object.assign(c,t)},po=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,Ft(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},So=t=>{Ft((c.PC+t+65536)%65536)},Ft=t=>{c.PC=t},Co=t=>{c.PStatus=t|48},Ut=new Array(256).fill(""),ia=()=>Ut.slice(0,256),aa=t=>{Ut.splice(0,t.length,...t)},ca=()=>{const t=_n(256).slice(0,256),e=new Array;for(let r=255;r>c.StackPtr;r--){let o="$"+_(t[r]),a=Ut[r];Ut[r].length>3&&r-1>c.StackPtr&&(Ut[r-1]==="JSR"||Ut[r-1]==="BRK"||Ut[r-1]==="IRQ"?(r--,o+=_(t[r])):a=""),o=(o+"   ").substring(0,6),e.push(_(256+r,4)+": "+o+a)}return e.join(`
`)},la=()=>{const t=_n(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const r=t[e];if(Ut[e].startsWith("JSR")&&e-1>c.StackPtr&&Ut[e-1]==="JSR"){const o=t[e-1]+1;return(r<<8)+o}}return-1},xt=(t,e)=>{Ut[c.StackPtr]=t,m(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},Wt=()=>{c.StackPtr=(c.StackPtr+1)%256;const t=B(256+c.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},dt=()=>(c.PStatus&1)!==0,L=(t=!0)=>c.PStatus=t?c.PStatus|1:c.PStatus&254,Eo=()=>(c.PStatus&2)!==0,Ar=(t=!0)=>c.PStatus=t?c.PStatus|2:c.PStatus&253,ua=()=>(c.PStatus&4)!==0,jn=(t=!0)=>c.PStatus=t?c.PStatus|4:c.PStatus&251,Bo=()=>(c.PStatus&8)!==0,rt=()=>Bo()?1:0,Hn=(t=!0)=>c.PStatus=t?c.PStatus|8:c.PStatus&247,vn=(t=!0)=>c.PStatus=t?c.PStatus|16:c.PStatus&239,Do=()=>(c.PStatus&64)!==0,ir=(t=!0)=>c.PStatus=t?c.PStatus|64:c.PStatus&191,mo=()=>(c.PStatus&128)!==0,ko=(t=!0)=>c.PStatus=t?c.PStatus|128:c.PStatus&127,w=t=>{Ar(t===0),ko(t>=128)},Xt=(t,e)=>{if(t){const r=c.PC;return So(e>127?e-256:e),3+J(r,c.PC)}return 2},M=(t,e)=>(t+e+256)%256,k=(t,e)=>e*256+t,b=(t,e,r)=>(e*256+t+r+65536)%65536,J=(t,e)=>t>>8!==e>>8?1:0,G=new Array(256),I=(t,e,r,o,a,h=!1)=>{console.assert(!G[r],"Duplicate instruction: "+t+" mode="+e),G[r]={name:t,pcode:r,mode:e,bytes:o,execute:a,is6502:!h}},x=!0,te=(t,e,r)=>{const o=B(t),a=B((t+1)%256),h=b(o,a,c.YReg);e(h);let p=5+J(h,k(o,a));return r&&(p+=rt()),p},ee=(t,e,r)=>{const o=B(t),a=B((t+1)%256),h=k(o,a);e(h);let p=5;return r&&(p+=rt()),p},wo=t=>{let e=(c.Accum&15)+(t&15)+(dt()?1:0);e>=10&&(e+=6);let r=(c.Accum&240)+(t&240)+e;const o=c.Accum<=127&&t<=127,a=c.Accum>=128&&t>=128;ir((r&255)>=128?o:a),L(r>=160),dt()&&(r+=96),c.Accum=r&255,w(c.Accum)},Ur=t=>{let e=c.Accum+t+(dt()?1:0);L(e>=256),e=e%256;const r=c.Accum<=127&&t<=127,o=c.Accum>=128&&t>=128;ir(e>=128?r:o),c.Accum=e,w(c.Accum)},re=t=>{Bo()?wo(B(t)):Ur(B(t))};I("ADC",A.IMM,105,2,t=>(rt()?wo(t):Ur(t),2+rt())),I("ADC",A.ZP_REL,101,2,t=>(re(t),3+rt())),I("ADC",A.ZP_X,117,2,t=>(re(M(t,c.XReg)),4+rt())),I("ADC",A.ABS,109,3,(t,e)=>(re(k(t,e)),4+rt())),I("ADC",A.ABS_X,125,3,(t,e)=>{const r=b(t,e,c.XReg);return re(r),4+rt()+J(r,k(t,e))}),I("ADC",A.ABS_Y,121,3,(t,e)=>{const r=b(t,e,c.YReg);return re(r),4+rt()+J(r,k(t,e))}),I("ADC",A.IND_X,97,2,t=>{const e=M(t,c.XReg);return re(k(B(e),B(e+1))),6+rt()}),I("ADC",A.IND_Y,113,2,t=>te(t,re,!0)),I("ADC",A.IND,114,2,t=>ee(t,re,!0),x);const ne=t=>{c.Accum&=B(t),w(c.Accum)};I("AND",A.IMM,41,2,t=>(c.Accum&=t,w(c.Accum),2)),I("AND",A.ZP_REL,37,2,t=>(ne(t),3)),I("AND",A.ZP_X,53,2,t=>(ne(M(t,c.XReg)),4)),I("AND",A.ABS,45,3,(t,e)=>(ne(k(t,e)),4)),I("AND",A.ABS_X,61,3,(t,e)=>{const r=b(t,e,c.XReg);return ne(r),4+J(r,k(t,e))}),I("AND",A.ABS_Y,57,3,(t,e)=>{const r=b(t,e,c.YReg);return ne(r),4+J(r,k(t,e))}),I("AND",A.IND_X,33,2,t=>{const e=M(t,c.XReg);return ne(k(B(e),B(e+1))),6}),I("AND",A.IND_Y,49,2,t=>te(t,ne,!1)),I("AND",A.IND,50,2,t=>ee(t,ne,!1),x);const Kr=t=>{let e=B(t);B(t),L((e&128)===128),e=(e<<1)%256,m(t,e),w(e)};I("ASL",A.IMPLIED,10,1,()=>(L((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,w(c.Accum),2)),I("ASL",A.ZP_REL,6,2,t=>(Kr(t),5)),I("ASL",A.ZP_X,22,2,t=>(Kr(M(t,c.XReg)),6)),I("ASL",A.ABS,14,3,(t,e)=>(Kr(k(t,e)),6)),I("ASL",A.ABS_X,30,3,(t,e)=>{const r=b(t,e,c.XReg);return Kr(r),6+J(r,k(t,e))}),I("BCC",A.ZP_REL,144,2,t=>Xt(!dt(),t)),I("BCS",A.ZP_REL,176,2,t=>Xt(dt(),t)),I("BEQ",A.ZP_REL,240,2,t=>Xt(Eo(),t)),I("BMI",A.ZP_REL,48,2,t=>Xt(mo(),t)),I("BNE",A.ZP_REL,208,2,t=>Xt(!Eo(),t)),I("BPL",A.ZP_REL,16,2,t=>Xt(!mo(),t)),I("BVC",A.ZP_REL,80,2,t=>Xt(!Do(),t)),I("BVS",A.ZP_REL,112,2,t=>Xt(Do(),t)),I("BRA",A.ZP_REL,128,2,t=>Xt(!0,t),x);const qr=t=>{Ar((c.Accum&t)===0),ko((t&128)!==0),ir((t&64)!==0)};I("BIT",A.ZP_REL,36,2,t=>(qr(B(t)),3)),I("BIT",A.ABS,44,3,(t,e)=>(qr(B(k(t,e))),4)),I("BIT",A.IMM,137,2,t=>(Ar((c.Accum&t)===0),2),x),I("BIT",A.ZP_X,52,2,t=>(qr(B(M(t,c.XReg))),4),x),I("BIT",A.ABS_X,60,3,(t,e)=>{const r=b(t,e,c.XReg);return qr(B(r)),4+J(r,k(t,e))},x);const zn=(t,e,r=0)=>{const o=(c.PC+r)%65536,a=B(e),h=B(e+1);xt(`${t} $`+_(h)+_(a),Math.trunc(o/256)),xt(t,o%256),xt("P",c.PStatus),Hn(!1),jn();const p=b(a,h,t==="BRK"?-1:0);Ft(p)},To=()=>(vn(),zn("BRK",65534,2),7);I("BRK",A.IMPLIED,0,1,To);const ha=()=>ua()?0:(vn(!1),zn("IRQ",65534),7),Ia=()=>(zn("NMI",65530),7);I("CLC",A.IMPLIED,24,1,()=>(L(!1),2)),I("CLD",A.IMPLIED,216,1,()=>(Hn(!1),2)),I("CLI",A.IMPLIED,88,1,()=>(jn(!1),2)),I("CLV",A.IMPLIED,184,1,()=>(ir(!1),2));const Te=t=>{const e=B(t);L(c.Accum>=e),w((c.Accum-e+256)%256)},ga=t=>{const e=B(t);L(c.Accum>=e),w((c.Accum-e+256)%256)};I("CMP",A.IMM,201,2,t=>(L(c.Accum>=t),w((c.Accum-t+256)%256),2)),I("CMP",A.ZP_REL,197,2,t=>(Te(t),3)),I("CMP",A.ZP_X,213,2,t=>(Te(M(t,c.XReg)),4)),I("CMP",A.ABS,205,3,(t,e)=>(Te(k(t,e)),4)),I("CMP",A.ABS_X,221,3,(t,e)=>{const r=b(t,e,c.XReg);return ga(r),4+J(r,k(t,e))}),I("CMP",A.ABS_Y,217,3,(t,e)=>{const r=b(t,e,c.YReg);return Te(r),4+J(r,k(t,e))}),I("CMP",A.IND_X,193,2,t=>{const e=M(t,c.XReg);return Te(k(B(e),B(e+1))),6}),I("CMP",A.IND_Y,209,2,t=>te(t,Te,!1)),I("CMP",A.IND,210,2,t=>ee(t,Te,!1),x);const Ro=t=>{const e=B(t);L(c.XReg>=e),w((c.XReg-e+256)%256)};I("CPX",A.IMM,224,2,t=>(L(c.XReg>=t),w((c.XReg-t+256)%256),2)),I("CPX",A.ZP_REL,228,2,t=>(Ro(t),3)),I("CPX",A.ABS,236,3,(t,e)=>(Ro(k(t,e)),4));const yo=t=>{const e=B(t);L(c.YReg>=e),w((c.YReg-e+256)%256)};I("CPY",A.IMM,192,2,t=>(L(c.YReg>=t),w((c.YReg-t+256)%256),2)),I("CPY",A.ZP_REL,196,2,t=>(yo(t),3)),I("CPY",A.ABS,204,3,(t,e)=>(yo(k(t,e)),4));const Nr=t=>{const e=M(B(t),-1);m(t,e),w(e)};I("DEC",A.IMPLIED,58,1,()=>(c.Accum=M(c.Accum,-1),w(c.Accum),2),x),I("DEC",A.ZP_REL,198,2,t=>(Nr(t),5)),I("DEC",A.ZP_X,214,2,t=>(Nr(M(t,c.XReg)),6)),I("DEC",A.ABS,206,3,(t,e)=>(Nr(k(t,e)),6)),I("DEC",A.ABS_X,222,3,(t,e)=>{const r=b(t,e,c.XReg);return B(r),Nr(r),7}),I("DEX",A.IMPLIED,202,1,()=>(c.XReg=M(c.XReg,-1),w(c.XReg),2)),I("DEY",A.IMPLIED,136,1,()=>(c.YReg=M(c.YReg,-1),w(c.YReg),2));const se=t=>{c.Accum^=B(t),w(c.Accum)};I("EOR",A.IMM,73,2,t=>(c.Accum^=t,w(c.Accum),2)),I("EOR",A.ZP_REL,69,2,t=>(se(t),3)),I("EOR",A.ZP_X,85,2,t=>(se(M(t,c.XReg)),4)),I("EOR",A.ABS,77,3,(t,e)=>(se(k(t,e)),4)),I("EOR",A.ABS_X,93,3,(t,e)=>{const r=b(t,e,c.XReg);return se(r),4+J(r,k(t,e))}),I("EOR",A.ABS_Y,89,3,(t,e)=>{const r=b(t,e,c.YReg);return se(r),4+J(r,k(t,e))}),I("EOR",A.IND_X,65,2,t=>{const e=M(t,c.XReg);return se(k(B(e),B(e+1))),6}),I("EOR",A.IND_Y,81,2,t=>te(t,se,!1)),I("EOR",A.IND,82,2,t=>ee(t,se,!1),x);const Yr=t=>{const e=M(B(t),1);m(t,e),w(e)};I("INC",A.IMPLIED,26,1,()=>(c.Accum=M(c.Accum,1),w(c.Accum),2),x),I("INC",A.ZP_REL,230,2,t=>(Yr(t),5)),I("INC",A.ZP_X,246,2,t=>(Yr(M(t,c.XReg)),6)),I("INC",A.ABS,238,3,(t,e)=>(Yr(k(t,e)),6)),I("INC",A.ABS_X,254,3,(t,e)=>{const r=b(t,e,c.XReg);return B(r),Yr(r),7}),I("INX",A.IMPLIED,232,1,()=>(c.XReg=M(c.XReg,1),w(c.XReg),2)),I("INY",A.IMPLIED,200,1,()=>(c.YReg=M(c.YReg,1),w(c.YReg),2)),I("JMP",A.ABS,76,3,(t,e)=>(Ft(b(t,e,-3)),3)),I("JMP",A.IND,108,3,(t,e)=>{const r=k(t,e);return t=B(r),e=B((r+1)%65536),Ft(b(t,e,-3)),6}),I("JMP",A.IND_X,124,3,(t,e)=>{const r=b(t,e,c.XReg);return t=B(r),e=B((r+1)%65536),Ft(b(t,e,-3)),6},x),I("JSR",A.ABS,32,3,(t,e)=>{const r=(c.PC+2)%65536;return xt("JSR $"+_(e)+_(t),Math.trunc(r/256)),xt("JSR",r%256),Ft(b(t,e,-3)),6});const oe=t=>{c.Accum=B(t),w(c.Accum)};I("LDA",A.IMM,169,2,t=>(c.Accum=t,w(c.Accum),2)),I("LDA",A.ZP_REL,165,2,t=>(oe(t),3)),I("LDA",A.ZP_X,181,2,t=>(oe(M(t,c.XReg)),4)),I("LDA",A.ABS,173,3,(t,e)=>(oe(k(t,e)),4)),I("LDA",A.ABS_X,189,3,(t,e)=>{const r=b(t,e,c.XReg);return oe(r),4+J(r,k(t,e))}),I("LDA",A.ABS_Y,185,3,(t,e)=>{const r=b(t,e,c.YReg);return oe(r),4+J(r,k(t,e))}),I("LDA",A.IND_X,161,2,t=>{const e=M(t,c.XReg);return oe(k(B(e),B((e+1)%256))),6}),I("LDA",A.IND_Y,177,2,t=>te(t,oe,!1)),I("LDA",A.IND,178,2,t=>ee(t,oe,!1),x);const Or=t=>{c.XReg=B(t),w(c.XReg)};I("LDX",A.IMM,162,2,t=>(c.XReg=t,w(c.XReg),2)),I("LDX",A.ZP_REL,166,2,t=>(Or(t),3)),I("LDX",A.ZP_Y,182,2,t=>(Or(M(t,c.YReg)),4)),I("LDX",A.ABS,174,3,(t,e)=>(Or(k(t,e)),4)),I("LDX",A.ABS_Y,190,3,(t,e)=>{const r=b(t,e,c.YReg);return Or(r),4+J(r,k(t,e))});const xr=t=>{c.YReg=B(t),w(c.YReg)};I("LDY",A.IMM,160,2,t=>(c.YReg=t,w(c.YReg),2)),I("LDY",A.ZP_REL,164,2,t=>(xr(t),3)),I("LDY",A.ZP_X,180,2,t=>(xr(M(t,c.XReg)),4)),I("LDY",A.ABS,172,3,(t,e)=>(xr(k(t,e)),4)),I("LDY",A.ABS_X,188,3,(t,e)=>{const r=b(t,e,c.XReg);return xr(r),4+J(r,k(t,e))});const Wr=t=>{let e=B(t);B(t),L((e&1)===1),e>>=1,m(t,e),w(e)};I("LSR",A.IMPLIED,74,1,()=>(L((c.Accum&1)===1),c.Accum>>=1,w(c.Accum),2)),I("LSR",A.ZP_REL,70,2,t=>(Wr(t),5)),I("LSR",A.ZP_X,86,2,t=>(Wr(M(t,c.XReg)),6)),I("LSR",A.ABS,78,3,(t,e)=>(Wr(k(t,e)),6)),I("LSR",A.ABS_X,94,3,(t,e)=>{const r=b(t,e,c.XReg);return Wr(r),6+J(r,k(t,e))}),I("NOP",A.IMPLIED,234,1,()=>2);const Ae=t=>{c.Accum|=B(t),w(c.Accum)};I("ORA",A.IMM,9,2,t=>(c.Accum|=t,w(c.Accum),2)),I("ORA",A.ZP_REL,5,2,t=>(Ae(t),3)),I("ORA",A.ZP_X,21,2,t=>(Ae(M(t,c.XReg)),4)),I("ORA",A.ABS,13,3,(t,e)=>(Ae(k(t,e)),4)),I("ORA",A.ABS_X,29,3,(t,e)=>{const r=b(t,e,c.XReg);return Ae(r),4+J(r,k(t,e))}),I("ORA",A.ABS_Y,25,3,(t,e)=>{const r=b(t,e,c.YReg);return Ae(r),4+J(r,k(t,e))}),I("ORA",A.IND_X,1,2,t=>{const e=M(t,c.XReg);return Ae(k(B(e),B(e+1))),6}),I("ORA",A.IND_Y,17,2,t=>te(t,Ae,!1)),I("ORA",A.IND,18,2,t=>ee(t,Ae,!1),x),I("PHA",A.IMPLIED,72,1,()=>(xt("PHA",c.Accum),3)),I("PHP",A.IMPLIED,8,1,()=>(xt("PHP",c.PStatus|16),3)),I("PHX",A.IMPLIED,218,1,()=>(xt("PHX",c.XReg),3),x),I("PHY",A.IMPLIED,90,1,()=>(xt("PHY",c.YReg),3),x),I("PLA",A.IMPLIED,104,1,()=>(c.Accum=Wt(),w(c.Accum),4)),I("PLP",A.IMPLIED,40,1,()=>(Co(Wt()),4)),I("PLX",A.IMPLIED,250,1,()=>(c.XReg=Wt(),w(c.XReg),4),x),I("PLY",A.IMPLIED,122,1,()=>(c.YReg=Wt(),w(c.YReg),4),x);const Xr=t=>{let e=B(t);B(t);const r=dt()?1:0;L((e&128)===128),e=(e<<1)%256|r,m(t,e),w(e)};I("ROL",A.IMPLIED,42,1,()=>{const t=dt()?1:0;return L((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|t,w(c.Accum),2}),I("ROL",A.ZP_REL,38,2,t=>(Xr(t),5)),I("ROL",A.ZP_X,54,2,t=>(Xr(M(t,c.XReg)),6)),I("ROL",A.ABS,46,3,(t,e)=>(Xr(k(t,e)),6)),I("ROL",A.ABS_X,62,3,(t,e)=>{const r=b(t,e,c.XReg);return Xr(r),6+J(r,k(t,e))});const Gr=t=>{let e=B(t);B(t);const r=dt()?128:0;L((e&1)===1),e=e>>1|r,m(t,e),w(e)};I("ROR",A.IMPLIED,106,1,()=>{const t=dt()?128:0;return L((c.Accum&1)===1),c.Accum=c.Accum>>1|t,w(c.Accum),2}),I("ROR",A.ZP_REL,102,2,t=>(Gr(t),5)),I("ROR",A.ZP_X,118,2,t=>(Gr(M(t,c.XReg)),6)),I("ROR",A.ABS,110,3,(t,e)=>(Gr(k(t,e)),6)),I("ROR",A.ABS_X,126,3,(t,e)=>{const r=b(t,e,c.XReg);return Gr(r),6+J(r,k(t,e))}),I("RTI",A.IMPLIED,64,1,()=>(Co(Wt()),vn(!1),Ft(k(Wt(),Wt())-1),6)),I("RTS",A.IMPLIED,96,1,()=>(Ft(k(Wt(),Wt())),6));const Po=t=>{const e=255-t;let r=c.Accum+e+(dt()?1:0);const o=r>=256,a=c.Accum<=127&&e<=127,h=c.Accum>=128&&e>=128;ir(r%256>=128?a:h);const p=(c.Accum&15)-(t&15)+(dt()?0:-1);r=c.Accum-t+(dt()?0:-1),r<0&&(r-=96),p<0&&(r-=6),c.Accum=r&255,w(c.Accum),L(o)},ie=t=>{rt()?Po(B(t)):Ur(255-B(t))};I("SBC",A.IMM,233,2,t=>(rt()?Po(t):Ur(255-t),2+rt())),I("SBC",A.ZP_REL,229,2,t=>(ie(t),3+rt())),I("SBC",A.ZP_X,245,2,t=>(ie(M(t,c.XReg)),4+rt())),I("SBC",A.ABS,237,3,(t,e)=>(ie(k(t,e)),4+rt())),I("SBC",A.ABS_X,253,3,(t,e)=>{const r=b(t,e,c.XReg);return ie(r),4+rt()+J(r,k(t,e))}),I("SBC",A.ABS_Y,249,3,(t,e)=>{const r=b(t,e,c.YReg);return ie(r),4+rt()+J(r,k(t,e))}),I("SBC",A.IND_X,225,2,t=>{const e=M(t,c.XReg);return ie(k(B(e),B(e+1))),6+rt()}),I("SBC",A.IND_Y,241,2,t=>te(t,ie,!0)),I("SBC",A.IND,242,2,t=>ee(t,ie,!0),x),I("SEC",A.IMPLIED,56,1,()=>(L(),2)),I("SED",A.IMPLIED,248,1,()=>(Hn(),2)),I("SEI",A.IMPLIED,120,1,()=>(jn(),2)),I("STA",A.ZP_REL,133,2,t=>(m(t,c.Accum),3)),I("STA",A.ZP_X,149,2,t=>(m(M(t,c.XReg),c.Accum),4)),I("STA",A.ABS,141,3,(t,e)=>(m(k(t,e),c.Accum),4)),I("STA",A.ABS_X,157,3,(t,e)=>{const r=b(t,e,c.XReg);return B(r),m(r,c.Accum),5}),I("STA",A.ABS_Y,153,3,(t,e)=>(m(b(t,e,c.YReg),c.Accum),5)),I("STA",A.IND_X,129,2,t=>{const e=M(t,c.XReg);return m(k(B(e),B(e+1)),c.Accum),6});const Mo=t=>{m(t,c.Accum)};I("STA",A.IND_Y,145,2,t=>(te(t,Mo,!1),6)),I("STA",A.IND,146,2,t=>ee(t,Mo,!1),x),I("STX",A.ZP_REL,134,2,t=>(m(t,c.XReg),3)),I("STX",A.ZP_Y,150,2,t=>(m(M(t,c.YReg),c.XReg),4)),I("STX",A.ABS,142,3,(t,e)=>(m(k(t,e),c.XReg),4)),I("STY",A.ZP_REL,132,2,t=>(m(t,c.YReg),3)),I("STY",A.ZP_X,148,2,t=>(m(M(t,c.XReg),c.YReg),4)),I("STY",A.ABS,140,3,(t,e)=>(m(k(t,e),c.YReg),4)),I("STZ",A.ZP_REL,100,2,t=>(m(t,0),3),x),I("STZ",A.ZP_X,116,2,t=>(m(M(t,c.XReg),0),4),x),I("STZ",A.ABS,156,3,(t,e)=>(m(k(t,e),0),4),x),I("STZ",A.ABS_X,158,3,(t,e)=>{const r=b(t,e,c.XReg);return B(r),m(r,0),5},x),I("TAX",A.IMPLIED,170,1,()=>(c.XReg=c.Accum,w(c.XReg),2)),I("TAY",A.IMPLIED,168,1,()=>(c.YReg=c.Accum,w(c.YReg),2)),I("TSX",A.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,w(c.XReg),2)),I("TXA",A.IMPLIED,138,1,()=>(c.Accum=c.XReg,w(c.Accum),2)),I("TXS",A.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),I("TYA",A.IMPLIED,152,1,()=>(c.Accum=c.YReg,w(c.Accum),2));const Lo=t=>{const e=B(t);Ar((c.Accum&e)===0),m(t,e&~c.Accum)};I("TRB",A.ZP_REL,20,2,t=>(Lo(t),5),x),I("TRB",A.ABS,28,3,(t,e)=>(Lo(k(t,e)),6),x);const Qo=t=>{const e=B(t);Ar((c.Accum&e)===0),m(t,e|c.Accum)};I("TSB",A.ZP_REL,4,2,t=>(Qo(t),5),x),I("TSB",A.ABS,12,3,(t,e)=>(Qo(k(t,e)),6),x);const fa=[2,34,66,98,130,194,226],Tt="???";fa.forEach(t=>{I(Tt,A.IMPLIED,t,2,()=>2),G[t].is6502=!1});for(let t=0;t<=15;t++)I(Tt,A.IMPLIED,3+16*t,1,()=>1),G[3+16*t].is6502=!1,I(Tt,A.IMPLIED,7+16*t,1,()=>1),G[7+16*t].is6502=!1,I(Tt,A.IMPLIED,11+16*t,1,()=>1),G[11+16*t].is6502=!1,I(Tt,A.IMPLIED,15+16*t,1,()=>1),G[15+16*t].is6502=!1;I(Tt,A.IMPLIED,68,2,()=>3),G[68].is6502=!1,I(Tt,A.IMPLIED,84,2,()=>4),G[84].is6502=!1,I(Tt,A.IMPLIED,212,2,()=>4),G[212].is6502=!1,I(Tt,A.IMPLIED,244,2,()=>4),G[244].is6502=!1,I(Tt,A.IMPLIED,92,3,()=>8),G[92].is6502=!1,I(Tt,A.IMPLIED,220,3,()=>4),G[220].is6502=!1,I(Tt,A.IMPLIED,252,3,()=>4),G[252].is6502=!1;for(let t=0;t<256;t++)G[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",A.IMPLIED,t,1,To));const it=(t,e,r)=>{const o=e&7,a=e>>>3;return t[a]|=r>>>o,o&&(t[a+1]|=r<<8-o),e+8},Zr=(t,e,r)=>(e=it(t,e,r>>>1|170),e=it(t,e,r|170),e),$n=(t,e)=>(e=it(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const pa=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),o=[0,2,1,3];for(let h=0;h<84;h++)r[h]=o[t[h]&3]|o[t[h+86]&3]<<2|o[t[h+172]&3]<<4;r[84]=o[t[84]&3]<<0|o[t[170]&3]<<2,r[85]=o[t[85]&3]<<0|o[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Sa=(t,e,r)=>{let o=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)o=$n(a,o);for(let h=0;h<16;h++){o=it(a,o,213),o=it(a,o,170),o=it(a,o,150),o=Zr(a,o,254),o=Zr(a,o,e),o=Zr(a,o,h),o=Zr(a,o,254^e^h),o=it(a,o,222),o=it(a,o,170),o=it(a,o,235);for(let D=0;D<7;D++)o=$n(a,o);o=it(a,o,213),o=it(a,o,170),o=it(a,o,173);const p=h===15?15:h*(r?8:7)%15,u=pa(t.slice(p*256,p*256+256));for(let D=0;D<u.length;D++)o=it(a,o,u[D]);o=it(a,o,222),o=it(a,o,170),o=it(a,o,235);for(let D=0;D<16;D++)o=$n(a,o)}return a},Ca=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const o=new Uint8Array(1536+r*13*512).fill(0);o.set($e(`WOZ2ÿ
\r
`),0),o.set($e("INFO"),12),o[16]=60,o[20]=2,o[21]=1,o[22]=0,o[23]=0,o[24]=1,o.fill(32,25,57),o.set($e("Apple2TS (CT6502)"),25),o[57]=1,o[58]=0,o[59]=32,o[60]=0,o[62]=0,o[64]=13,o.set($e("TMAP"),80),o[84]=160,o.fill(255,88,248);let a=0;for(let h=0;h<r;h++)a=88+(h<<2),h>0&&(o[a-1]=h),o[a]=o[a+1]=h;o.set($e("TRKS"),248),o.set(Ts(1280+r*13*512),252);for(let h=0;h<r;h++){a=256+(h<<3),o.set(vA(3+h*13),a),o[a+2]=13,o.set(Ts(50304),a+4);const p=t.slice(h*16*256,(h+1)*16*256),u=Sa(p,h,e);a=1536+h*13*512,o.set(u,a)}return o},Ea=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,D)=>u!==e[D])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,p=$A(e,12);if(h!==0&&h!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const D=e[88+u*2];if(D<255){const V=256+8*D,R=e.slice(V,V+8);t.trackStart[u]=512*((R[1]<<8)+R[0]),t.trackNbits[u]=R[4]+(R[5]<<8)+(R[6]<<16)+R[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},Ba=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const h=e[88+a*2];if(h<255){t.trackStart[a]=256+h*6656;const p=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=p[2]+(p[3]<<8),t.maxHalftrack=a}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},Da=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),o=e.endsWith(".po");return r||o},ma=(t,e)=>{const o=t.filename.toLowerCase().endsWith(".po"),a=Ca(e,o);return a.length===0?new Uint8Array:(t.filename=Rs(t.filename,"woz"),t.diskHasChanges=!0,a)},bo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),ka=(t,e)=>{const r=bo(e.slice(24,28)),o=bo(e.slice(28,32));let a="";for(let h=0;h<4;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Rs(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(r,r+o))},Fo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},wa=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(Fo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return ka(t,e)}return Da(t.filename)&&(e=ma(t,e)),Ea(t,e)||Ba(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},da=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Oe=0,$=0,lt=0,_r=!1,ts=!1;const Uo=t=>{_r=!1,Wo(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},Ta=(t=!1)=>{if(t){const e=vr();e.motorRunning&&Xo(e)}else Ve(Se.MOTOR_OFF)},Ko=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(Ve(Se.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):Ve(Se.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,St(),lt+=r,t.trackLocation+=Math.floor(lt/4),lt=lt%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let qo=0;const Ra=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],No=()=>(qo++,Ra[qo&31]);let Jr=0;const ya=t=>(Jr<<=1,Jr|=t,Jr&=15,Jr===0?No():t),Yo=[128,64,32,16,8,4,2,1],Pa=[127,191,223,239,247,251,253,254],Vr=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[o],h=t.trackLocation&7;r=(a&Yo[h])>>7-h,r=ya(r)}else r=No();return t.trackLocation++,r},Ma=()=>Math.floor(256*Math.random()),Oo=(t,e,r)=>{if(e.length===0)return Ma();let o=0;if(t.isSynchronized){for(lt+=r;lt>=4;){const a=Vr(t,e);if(($>0||a)&&($=$<<1|a),lt-=4,$&128&&lt<=6)break}lt<0&&(lt=0),$&=255}else if($===0){for(;Vr(t,e)===0;);$=64;for(let a=5;a>=0;a--)$|=Vr(t,e)<<a}else{const a=Vr(t,e);$=$<<1|a}return o=$,$>127&&($=0),o};let Gt=0;const es=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[o];const h=t.trackLocation&7;r?a|=Yo[h]:a&=Pa[h],e[o]=a}t.trackLocation++},xo=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&$>0){if(r>=16)for(let o=7;o>=0;o--)es(t,e,$&2**o?1:0);r>=36&&es(t,e,0),r>=40&&es(t,e,0),rs.push(r>=40?2:r>=36?1:$),t.diskHasChanges=!0,$=0}},Wo=t=>{Oe=0,_r||(t.motorRunning=!1),St(),Ve(Se.MOTOR_OFF)},Xo=t=>{Oe?(clearTimeout(Oe),Oe=0):lt=0,t.motorRunning=!0,St(),Ve(Se.MOTOR_ON)},La=t=>{Oe===0&&(Oe=setTimeout(()=>Wo(t),1e3))};let rs=[];const jr=t=>{rs.length>0&&t.halftrack===2*0&&(rs=[])},Hr=[0,0,0,0],Qa=(t,e)=>{if(t>=49408)return-1;let r=vr();const o=Ua();if(r.hardDrive)return 0;let a=0;const h=c.cycleCount-Gt;switch(t=t&15,t){case 9:_r=!0,Xo(r),jr(r);break;case 8:r.motorRunning&&!r.writeMode&&(a=Oo(r,o,h),Gt=c.cycleCount),_r=!1,La(r),jr(r);break;case 10:case 11:{const p=t===10?2:3,u=vr();Fa(p),r=vr(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,St());break}case 12:ts=!1,r.motorRunning&&!r.writeMode&&(a=Oo(r,o,h),Gt=c.cycleCount);break;case 13:ts=!0,r.motorRunning&&(r.writeMode?(xo(r,o,h),Gt=c.cycleCount):($=0,lt+=h,r.trackLocation+=Math.floor(lt/4),lt=lt%4,Gt=c.cycleCount),e>=0&&($=e));break;case 14:r.motorRunning&&r.writeMode&&(xo(r,o,h),Gt=c.cycleCount),r.writeMode=!1,ts&&(a=r.isWriteProtected?255:0),jr(r);break;case 15:r.writeMode=!0,Gt=c.cycleCount,e>=0&&($=e);break;default:{if(t<0||t>7)break;Hr[Math.floor(t/2)]=t%2;const p=Hr[(r.currentPhase+1)%4],u=Hr[(r.currentPhase+3)%4];Hr[r.currentPhase]||(r.motorRunning&&p?(Ko(r,1,h),r.currentPhase=(r.currentPhase+1)%4,Gt=c.cycleCount):r.motorRunning&&u&&(Ko(r,-1,h),r.currentPhase=(r.currentPhase+3)%4,Gt=c.cycleCount)),jr(r);break}}return a},ba=()=>{Ne(6,Uint8Array.from(da)),rr(6,Qa)},Zt=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0}),Go=()=>{q[0]=Zt(0,1,!0),q[1]=Zt(1,2,!0),q[2]=Zt(2,1,!1),q[3]=Zt(3,2,!1);for(let t=0;t<q.length;t++)_t[t]=new Uint8Array},q=[],_t=[];Go();let Re=2;const Fa=t=>{Re=t},vr=()=>q[Re],Ua=()=>_t[Re],ns=t=>q[t==2?1:0],zr=t=>_t[t==2?1:0],St=()=>{for(let t=0;t<q.length;t++){const e={index:t,hardDrive:q[t].hardDrive,drive:q[t].drive,filename:q[t].filename,status:q[t].status,motorRunning:q[t].motorRunning,diskHasChanges:q[t].diskHasChanges,isWriteProtected:q[t].isWriteProtected,diskData:q[t].diskHasChanges?_t[t]:new Uint8Array};E1(e)}},Ka=t=>{const e=["","",""];for(let o=0;o<q.length;o++)(t||_t[o].length<32e6)&&(e[o]=ft.Buffer.from(_t[o]).toString("base64"));const r={currentDrive:Re,driveState:[Zt(0,1,!0),Zt(1,2,!0),Zt(2,1,!1),Zt(3,2,!1)],driveData:e};for(let o=0;o<q.length;o++)r.driveState[o]={...q[o]};return r},qa=t=>{Ve(Se.MOTOR_OFF),Re=t.currentDrive,t.driveState.length===3&&Re>0&&Re++,Go();let e=0;for(let r=0;r<t.driveState.length;r++)q[e]={...t.driveState[r]},t.driveData[r]!==""&&(_t[e]=new Uint8Array(ft.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;St()},Na=()=>{Uo(q[1]),Uo(q[2]),St()},Zo=(t=!1)=>{Ta(t),St()},Ya=t=>{let e=t.index,r=t.drive,o=t.hardDrive;t.filename!==""&&(Fo(t.filename)?(o=!0,e=t.drive<=1?0:1,r=e+1):(o=!1,e=t.drive<=1?2:3,r=e-1)),q[e]=Zt(e,r,o),q[e].filename=t.filename,q[e].motorRunning=t.motorRunning,_t[e]=wa(q[e],t.diskData),_t[e].length===0&&(q[e].filename=""),St()},Oa=t=>{const e=t.index;q[e].filename=t.filename,q[e].motorRunning=t.motorRunning,q[e].isWriteProtected=t.isWriteProtected,St()};let $r=!1;const _o=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Jo=t=>{let e=A.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=A.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=A.IND_Y:t.endsWith(",X)")?e=A.IND_X:e=A.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?A.ABS_X:A.ZP_X:t.endsWith(",Y")?e=t.length>5?A.ABS_Y:A.ZP_Y:e=t.length>3?A.ABS:A.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const o=_o(t);if(o.operation&&o.value){switch(o.operation){case"+":r+=o.value;break;case"-":r-=o.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let ye={};const Vo=(t,e,r,o)=>{let a=A.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(ye).forEach(([u,D])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+_(D))}),Jo(r);const p=_o(r);if(p.label){const u=p.label.startsWith("<"),D=p.label.startsWith(">"),V=p.label.startsWith("#")||D||u;if(V&&(p.label=p.label.substring(1)),p.label in ye?(h=ye[p.label],D?h=h>>8&255:u&&(h=h&255)):o===2&&console.error("Missing label: "+p.label),p.operation&&p.value){switch(p.operation){case"+":h+=p.value;break;case"-":h-=p.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}mn(e)?(a=A.ZP_REL,h=h-t+254,h>255&&(h-=256)):V?a=A.IMM:(a=h>=0&&h<=255?A.ZP_REL:A.ABS,a=p.idx==="X"?a===A.ABS?A.ABS_X:A.ZP_X:a,a=p.idx==="Y"?a===A.ABS?A.ABS_Y:A.ZP_Y:a)}return[a,h]},xa=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Wa=(t,e)=>{if(t.label in ye&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,o]=Vo(e,t.instr,t.operand,2);r!==A.ABS&&r!==A.ZP_REL&&console.error("Illegal EQU value: "+t.operand),ye[t.label]=o}else ye[t.label]=e},Xa=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,o=0;r.startsWith('"')&&r.endsWith('"')?o=128:r.startsWith("'")&&r.endsWith("'")?o=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let a=0;a<r.length;a++)e.push(r.charCodeAt(a)|o);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(a=>{const h=parseInt(a,16);isNaN(h)&&console.error(`Invalid HEX value: ${a} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},Ga=(t,e)=>{const r=[],o=G[t];return r.push(t),e>=0&&(r.push(e%256),o.bytes===3&&r.push(Math.trunc(e/256))),r};let ss=0;const jo=(t,e)=>{let r=ss;const o=[];let a="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let p=(h+"                   ").slice(0,30)+_(r,4)+"- ";const u=xa(h,a);if(a="",!u.instr){a=u.label;return}if(u.instr==="ORG"){if(e===1){const[W,z]=Jo(u.operand);W===A.ABS&&(ss=z,r=z)}$r&&e===2&&console.log(p);return}if(e===1&&u.label&&Wa(u,r),u.instr==="EQU")return;let D=[],V,R;if(["ASC","DA","HEX"].includes(u.instr))D=Xa(u),r+=D.length;else if([V,R]=Vo(r,u.instr,u.operand,e),e===2&&isNaN(R)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")D.push(R&255),r++;else if(u.instr==="DW")D.push(R&255),D.push(R>>8&255),r+=2;else if(u.instr==="DS")for(let W=0;W<R;W++)D.push(0),r++;else{e===2&&mn(u.instr)&&(R<0||R>255)&&console.error(`Branch instruction out of range: ${h} value: ${R} pass: ${e}`);const W=G.findIndex(z=>z&&z.name===u.instr&&z.mode===V);W<0&&console.error(`Unknown instruction: "${h}" mode=${V} pass=${e}`),D=Ga(W,R),r+=G[W].bytes}$r&&e===2&&(D.forEach(W=>{p+=` ${_(W)}`}),console.log(p)),o.push(...D)}),$r&&e===2){let h="";o.forEach(p=>{h+=` ${_(p)}`}),console.log(h)}return o},tn=(t,e,r=!1)=>{ye={},$r=r;try{return ss=t,jo(e,1),jo(e,2)}catch(o){return console.error(o),[]}},Ho=`
        ORG   $300
        LDX   #$60
        CMP   $C089,X  ; turn on the motor
        LDA   $C08E,X  ; enable read
READ1   LDA   $C08C,X  ; read a byte
        BPL   READ1     ; wait for the byte to be ready (high bit set)
        CMP   #$D5
        BNE   READ1
READ2   LDA   $C08C,X  ; read a byte
        BPL   READ2     ; wait for the byte to be ready (high bit set)
READ3   LDA   $C08C,X  ; read a byte
        BPL   READ3     ; wait for the byte to be ready (high bit set)
        CMP   $C088,X  ; turn off the motor        
        RTS
`,Ct={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},ar={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Pe={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Za{constructor(e){d(this,"_control");d(this,"_status");d(this,"_command");d(this,"_lastRead");d(this,"_lastConfig");d(this,"_receiveBuffer");d(this,"_extFuncs");this._extFuncs=e,this._control=ar.HW_RESET,this._command=Pe.HW_RESET,this._status=Ct.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=Ct.OVRN;this._status|=Ct.RX_FULL,this._control&Pe.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&Pe.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Ct.PE|Ct.FE|Ct.OVRN),this._receiveBuffer.length?(this._status|=Ct.RX_FULL,this._control&Pe.RX_INT_DIS||this.irq(!0)):this._status&=~Ct.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&Ct.IRQ&&this.irq(!1),this._status&=~Ct.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=Ct.IRQ:this._status&=~Ct.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&ar.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ar.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ar.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Pe.PARITY_EN)switch(this._command&Pe.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=ar.HW_RESET,this._command=Pe.HW_RESET,this._status=Ct.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const os=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let en=1,Et;const _a=t=>{er(en,t)},Ja=t=>{console.log("ConfigChange: ",t)},Va=t=>{Et&&Et.buffer(t)},ja=()=>{Et&&Et.reset()},Ha=(t=!0,e=1)=>{if(!t)return;en=e;const r={sendData:D1,interrupt:_a,configChange:Ja};Et=new Za(r);const o=new Uint8Array(os.length+256);o.set(os.slice(1792,2048)),o.set(os,256),Ne(en,o),rr(en,va)},va=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Et.data=e;else return Et.data;break;case r.STATUS:if(e>=0)Et.status=e;else return Et.status;break;case r.COMMAND:if(e>=0)Et.command=e;else return Et.command;break;case r.CONTROL:if(e>=0)Et.control=e;else return Et.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},cr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const za=()=>{const t=new Date,e=cr(t.getMonth()+1,2)+","+cr(t.getDay(),2)+","+cr(t.getDate(),2)+","+cr(t.getHours(),2)+","+cr(t.getMinutes(),2);for(let r=0;r<e.length;r++)m(512+r,e.charCodeAt(r)|128)},$a=`
Cx00	php	        ; BASIC entry (handled in JS)  This will only work for mouse
Cx01	sei         ; Clock bytes required as above.
Cx02	plp
Cx03	rts
Cx04	db $00      ; $58 = Clock, disabled because it breaks A2osX https://github.com/ct6502/apple2ts/issues/67
Cx05	db $38      ; Pascal ID Byte
Cx06	db $70      ; Clock
Cx07	db $18      ; Pascal ID Byte
Cx08	rts         ; Clock Read Method - handled by JS
Cx09	db $00
Cx0a	db $00
Cx0b	db $01      ; Pascal Generic Signature  / Clock Write (method & value ignored)
Cx0c	db $20      ; $2x = Pascal XY Pointing Device, ID=x0 apple mouse
Cx0d	rts         ; init pascal (for clock need an RTS here)  could move methods to offset 60
Cx0e	db <PASCAL  ; read
Cx0f	db <PASCAL  ; write
Cx10	db <PASCAL  ; status
Cx11	db $00      ; Pascal optional routines follow

Cx12    db <SETMOUSE
Cx13    db <SERVEMOUSE
Cx14    db <READMOUSE
Cx15    db <CLEARMOUSE
Cx16    db <POSMOUSE
Cx17    db <CLAMPMOUSE
Cx18    db <HOMEMOUSE
Cx19    db <INITMOUSE
Cx1a    db <GETCLAMP
Cx1b    db <UNDOCUMENTED      ; applemouse has methods here
Cx1c    db <TIMEDATA
Cx1d    db <UNDOCUMENTED      ; not sure if some will call them 
Cx1e    db <UNDOCUMENTED
Cx1f    db <UNDOCUMENTED

;
; All methods (except SERVEMOUSE) entered with X = Cn, Y = n0
;
; $0478 + slot        Low byte of absolute X position
; $04F8 + slot        Low byte of absolute Y position
; $0578 + slot        High byte of absolute X position
; $05F8 + slot        High byte of absolute Y position
; $0678 + slot        Reserved and used by the firmware
; $06F8 + slot        Reserved and used by the firmware
; $0778 + slot        Button 0/1 interrupt status byte
; $07F8 + slot        Mode byte
; 
; The interrupt status byte is defined as follows:
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Previously, button 1 was up (0) or down (1)
;     | | | | | | +-----  Movement interrupt
;     | | | | | +-------  Button 0/1 interrupt
;     | | | | +---------  VBL interrupt
;     | | | +-----------  Currently, button 1 is up (0) or down (1)
;     | | +-------------  X/Y moved since last READMOUSE
;     | +---------------  Previously, button 0 was up (0) or down (1)
;     +-----------------  Currently, button 0 is up (0) or down (1)
; 
; (Button 1 is not physically present on the mouse, and is probably only
; supported for an ADB mouse on the IIgs.)
; 
; 
; The mode byte is defined as follows.
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Mouse off (0) or on (1)
;     | | | | | | +-----  Interrupt if mouse is moved
;     | | | | | +-------  Interrupt if button is pressed
;     | | | | +---------  Interrupt on VBL
;     | | | +-----------  Reserved
;     | | +-------------  Reserved
;     | +---------------  Reserved
;     +-----------------  Reserved
; 

SLOWX   EQU $0478-$c0 ; + Cs        Low byte of absolute X position
SLOWY   EQU $04F8-$c0 ; + Cs        Low byte of absolute Y position
SHIGHX  EQU $0578-$c0 ; + Cs        High byte of absolute X position
SHIGHY  EQU $05F8-$c0 ; + Cs        High byte of absolute Y position
STEMPA  EQU $0678-$c0 ; + Cs        Reserved and used by the firmware
STEMPB  EQU $06F8-$c0 ; + Cs        Reserved and used by the firmware
SBUTTON EQU $0778-$c0 ; + Cs        Button 0/1 interrupt status byte
SMODE   EQU $07F8-$c0 ; + Cs        Mode byte

LOWX   EQU $c081 ; + s0        Low byte of absolute X position
HIGHX  EQU $c082 ; + s0        High byte of absolute X position
LOWY   EQU $c083 ; + s0        Low byte of absolute Y position
HIGHY  EQU $c084 ; + s0        High byte of absolute Y position
BUTTON EQU $c085 ; + s0        Button 0/1 interrupt status byte
MODE   EQU $c086 ; + s0        Mode byte
CLAMP  EQU $c087 ; + s0        clamp value

CMD    EQU $c08a ; + slot        Command reg
INIT   EQU $0    ;               initialize
READ   EQU $1    ;               read mouse and update regs, clear ints
CLEAR  EQU $2    ;               clear mouse and update regs, clear ints
GCLAMP EQU $3    ;               get mouse clamping
SERVE  EQU $4    ;               check/serve mouse int
HOME   EQU $5    ;               set to clamping window upper left
CLAMPX EQU $6    ;               clamp x values to x -> y
CLAMPY EQU $7    ;               clamp y values to x -> y
POS    EQU $8    ;               set positions
UNDOC  EQU $9    ;               calling an undocumented entry

PASCAL
    ldx #$03        ; return error for pascal

UNDOCUMENTED
    sec
    rts
                    ; Technote #2
TIMEDATA            ; A bit 0: 1 - 50hz, 0 = 60hz VBL
    clc
    rts
                    ; Technote #7
                    ; Return 8 clamping bytes one at a time to $578
GETCLAMP
    lda $478        ; index byte, starting at $4E according to technote
    sta CLAMP,y     ; indicates which byte in the order we want
    lda #GCLAMP
    sta CMD,y
    lda CLAMP,y
    sta $578
    clc             ; In this order: minXH, minYH, minXL, minYL
    rts             ;                maxXH, maxYH, maxXL, maxYL

SETMOUSE 
    cmp #$10
    bcs return      ; invalid
    sta MODE,y      ; set mode
    lda MODE,y      ; reread to ensure valid
    sta SMODE,x
return 
    rts

SERVEMOUSE 
    ldy $06
    lda #$60
    sta $06
    jsr $0006       ; start by finding our slot - not entered with X,Y set
    sty $06
    tsx
    lda $100,x
    tax             ; X = Cs
    asl
    asl
    asl
    asl
    tay             ; Y = s0

    lda #SERVE
    sta CMD,y

    lda BUTTON,y 
    and #$0e
    sec
    beq return      ; exit without changing anything

    ora SBUTTON,x
    sta SBUTTON,x
    clc             ; claim it
    rts

copyin 
    lda SLOWX,x
    sta LOWX,y
    lda SLOWY,x
    sta LOWY,y
    lda SHIGHX,x
    sta HIGHX,y
    lda SHIGHY,x
    sta HIGHY,y
    rts

copyout 
    lda LOWX,y
    sta SLOWX,x
    lda LOWY,y
    sta SLOWY,x
    lda HIGHX,y
    sta SHIGHX,x
    lda HIGHY,y
    sta SHIGHY,x
    rts

CLAMPMOUSE 
    and #$1
    sta STEMPA,x
    phx
    phx
    ldx #$c0      ; note load from screen hole 0, not slot

    lda <cmcont-1
    pha
    bra copyin

cmcont 
    plx
    lda #CLAMPX  ; a = 1 for Y
    ora STEMPA,x
    sta CMD,y
    rts

POSMOUSE 
    phx
    lda <pmcont-1
    pha
    bra copyin

pmcont 
    lda #POS
    sta CMD,y
    rts

READMOUSE 
    lda #READ
    sta CMD,y

    lda BUTTON,y
    and #$F1        ; mask off interrupts
    sta SBUTTON,x
    clc
    bra copyout

CLEARMOUSE 
    lda #CLEAR
    sta CMD,y
    clc
    bra copyout

HOMEMOUSE 
    lda #HOME
    sta CMD,y
    clc
    rts

INITMOUSE 
    lda #INIT
    sta CMD,y

    lda MODE,y
    sta SMODE,x
    bra READMOUSE

    ; should leave about 13 bytes
`,vo=()=>{yt=0,Pt=0,Jt=0,Vt=0,Me=1023,Le=1023,on(0),ot=0,ce=0,xe=0,lr=0,ur=0,ht=0,Kt=0,We=0,rn=0};let yt=0,Pt=0,Jt=0,Vt=0,Me=1023,Le=1023,rn=0,ae=0,ot=0,ce=0,xe=0,lr=0,ur=0,ht=0,Kt=0,We=0,zo=0,qt=5;const nn=54,sn=55,tc=56,ec=57,$o=()=>{const t=new Uint8Array(256).fill(0),e=tn(0,$a.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},rc=(t=!0,e=5)=>{if(!t)return;qt=e;const r=49152+qt*256,o=49152+qt*256+8;Ne(qt,$o(),r,oc),Ne(qt,$o(),o,za),rr(qt,ac),vo()},on=t=>{ae=t,TA(!t)},nc=()=>{if(ae&1){let t=!1;ae&8&&(We|=8,t=!0),ae&ce&4&&(We|=4,t=!0),ae&ce&2&&(We|=2,t=!0),t&&er(qt,!0)}},sc=t=>{if(ae&1)if(t.buttons>=0){switch(t.buttons){case 0:ot&=-129;break;case 16:ot|=128;break;case 1:ot&=-17;break;case 17:ot|=16;break}ce|=ot&128?4:0}else t.x>=0&&t.x<=1&&(yt=Math.round((Me-Jt)*t.x+Jt),ce|=2),t.y>=0&&t.y<=1&&(Pt=Math.round((Le-Vt)*t.y+Vt),ce|=2)};let hr=0,As="",tA=0,eA=0;const oc=()=>{const t=192+qt;B(sn)===t&&B(nn)===0?ic():B(ec)===t&&B(tc)===0&&Ac()},Ac=()=>{if(hr===0){const t=192+qt;tA=B(sn),eA=B(nn),m(sn,t),m(nn,3);const e=(ot&128)!==(xe&128);let r=0;ot&128?r=e?2:1:r=e?3:4,B(49152)&128&&(r=-r),xe=ot,As=yt.toString()+","+Pt.toString()+","+r.toString()}hr>=As.length?(c.Accum=141,hr=0,m(sn,tA),m(nn,eA)):(c.Accum=As.charCodeAt(hr)|128,hr++)},ic=()=>{switch(c.Accum){case 128:console.log("mouse off"),on(0);break;case 129:console.log("mouse on"),on(1);break}},ac=(t,e)=>{if(t>=49408)return-1;const r=e<0,o={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case o.LOWX:if(r===!1)ht=ht&65280|e,ht&=65535;else return yt&255;break;case o.HIGHX:if(r===!1)ht=e<<8|ht&255,ht&=65535;else return yt>>8&255;break;case o.LOWY:if(r===!1)Kt=Kt&65280|e,Kt&=65535;else return Pt&255;break;case o.HIGHY:if(r===!1)Kt=e<<8|Kt&255,Kt&=65535;else return Pt>>8&255;break;case o.STATUS:return ot;case o.MODE:if(r===!1)on(e),console.log("Mouse mode: 0x",ae.toString(16));else return ae;break;case o.CLAMP:if(r===!1)rn=78-e;else switch(rn){case 0:return Jt>>8&255;case 1:return Vt>>8&255;case 2:return Jt&255;case 3:return Vt&255;case 4:return Me>>8&255;case 5:return Le>>8&255;case 6:return Me&255;case 7:return Le&255;default:return console.log("AppleMouse: invalid clamp index: "+rn),0}break;case o.CLOCK:case o.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case o.COMMAND:if(r===!1)switch(zo=e,e){case a.INIT:console.log("cmd.init"),yt=0,Pt=0,lr=0,ur=0,Jt=0,Vt=0,Me=1023,Le=1023,ot=0,ce=0;break;case a.READ:ce=0,ot&=-112,ot|=xe>>1&64,ot|=xe>>4&1,xe=ot,(lr!==yt||ur!==Pt)&&(ot|=32),lr=yt,ur=Pt;break;case a.CLEAR:console.log("cmd.clear"),yt=0,Pt=0,lr=0,ur=0;break;case a.SERVE:ot&=-15,ot|=We,We=0,er(qt,!1);break;case a.HOME:console.log("cmd.home"),yt=Jt,Pt=Vt;break;case a.CLAMPX:console.log("cmd.clampx"),Jt=ht>32767?ht-65536:ht,Me=Kt,console.log(Jt+" -> "+Me);break;case a.CLAMPY:console.log("cmd.clampy"),Vt=ht>32767?ht-65536:ht,Le=Kt,console.log(Vt+" -> "+Le);break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:console.log("cmd.pos"),yt=ht,Pt=Kt;break}else return zo;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},Mt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},jt={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class cc{constructor(e){d(this,"_control");d(this,"_status");d(this,"_lastRead");d(this,"_receiveBuffer");d(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=Mt.OVRN;this._status|=Mt.RX_FULL,this._control&jt.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(jt.TX_INT_ENABLE|jt.NRTS))===jt.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Mt.FE|Mt.OVRN|Mt.PE),this._receiveBuffer.length?(this._status|=Mt.RX_FULL,this._control&jt.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~Mt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(jt.COUNTER_DIV1|jt.COUNTER_DIV2))===(jt.COUNTER_DIV1|jt.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Mt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Mt.IRQ:this._status&=~Mt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Mt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const Nt={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},is={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class as{constructor(){d(this,"_latch");d(this,"_count");d(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&Nt.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Nt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class lc{constructor(e){d(this,"_timer");d(this,"_status");d(this,"_statusRead");d(this,"_msb");d(this,"_lsb");d(this,"_div8");d(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new as,new as,new as],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Nt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const o=this._timer[0].control&Nt.SPECIAL,a=this._msb*256+r;this._timer[e].latch=a,o&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const o=this._timer[0].control&Nt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=o&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),o>>8&255}update(e){const r=this._timer[0].control&Nt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let o=!1;for(let a=0;a<3;a++){let h=e;if(a==2&&this._timer[2].control&Nt.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),o=this._timer[a].decrement(h),o){const p=this._timer[a].control;switch(p&Nt.IRQ_ENABLE&&this.irq(a,!0),p&Nt.COUNTER_MODE){case 0:case 16:this._timer[a].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Nt.SPECIAL}irq(e,r){const o=1<<e|is.ANY_IRQ;r?this._status|=o:this._status&=~o,this._status?(this._status|=is.ANY_IRQ,this._interrupt(!0)):(this._status&=~is.ANY_IRQ,this._interrupt(!1))}}let An=2,nt,le,cs=0;const uc=t=>{if(cs){const e=c.cycleCount-cs;nt.update(e)}cs=c.cycleCount},rA=t=>{er(An,t)},hc=t=>{le&&le.buffer(t)},Ic=(t=!0,e=2)=>{if(!t)return;An=e,nt=new lc(rA);const r={sendData:m1,interrupt:rA};le=new cc(r),rr(An,fc),ro(uc,An)},gc=()=>{nt&&(nt.reset(),le.reset())},fc=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let o=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?le.data=e:o=le.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?le.control=e:o=le.status;break;case r.TCONTROL1:e>=0?nt.timerControl(0,e):o=0;break;case r.TCONTROL2:e>=0?nt.timerControl(1,e):o=nt.status();break;case r.T1MSB:e>=0?nt.timerMSBw(0,e):o=nt.timerMSBr(0);break;case r.T1LSB:e>=0?nt.timerLSBw(0,e):o=nt.timerLSBr(0);break;case r.T2MSB:e>=0?nt.timerMSBw(1,e):o=nt.timerMSBr(1);break;case r.T2LSB:e>=0?nt.timerLSBw(1,e):o=nt.timerLSBr(1);break;case r.T3MSB:e>=0?nt.timerMSBw(2,e):o=nt.timerMSBr(2);break;case r.T3LSB:e>=0?nt.timerLSBw(2,e):o=nt.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return o},pc=(t=!0,e=4)=>{t&&(rr(e,bc),ro(yc,e))},ls=[0,128],us=[1,129],Sc=[2,130],Cc=[3,131],Xe=[4,132],Ge=[5,133],an=[6,134],hs=[7,135],Ir=[8,136],gr=[9,137],Ec=[10,138],Is=[11,139],Bc=[12,140],Qe=[13,141],fr=[14,142],nA=[16,145],sA=[17,145],Yt=[18,146],gs=[32,160],Ht=64,ue=32,Dc=(t=4)=>{for(let e=0;e<=255;e++)Q(t,e,0);for(let e=0;e<=1;e++)fs(t,e)},mc=(t,e)=>(O(t,fr[e])&Ht)!==0,kc=(t,e)=>(O(t,Yt[e])&Ht)!==0,oA=(t,e)=>(O(t,Is[e])&Ht)!==0,wc=(t,e,r)=>{let o=O(t,Xe[e])-r;if(Q(t,Xe[e],o),o<0){o=o%256+256,Q(t,Xe[e],o);let a=O(t,Ge[e]);if(a--,Q(t,Ge[e],a),a<0&&(a+=256,Q(t,Ge[e],a),mc(t,e)&&(!kc(t,e)||oA(t,e)))){const h=O(t,Yt[e]);Q(t,Yt[e],h|Ht);const p=O(t,Qe[e]);if(Q(t,Qe[e],p|Ht),he(t,e,-1),oA(t,e)){const u=O(t,hs[e]),D=O(t,an[e]);Q(t,Xe[e],D),Q(t,Ge[e],u)}}}},dc=(t,e)=>(O(t,fr[e])&ue)!==0,Tc=(t,e)=>(O(t,Yt[e])&ue)!==0,Rc=(t,e,r)=>{if(O(t,Is[e])&ue)return;let o=O(t,Ir[e])-r;if(Q(t,Ir[e],o),o<0){o=o%256+256,Q(t,Ir[e],o);let a=O(t,gr[e]);if(a--,Q(t,gr[e],a),a<0&&(a+=256,Q(t,gr[e],a),dc(t,e)&&!Tc(t,e))){const h=O(t,Yt[e]);Q(t,Yt[e],h|ue);const p=O(t,Qe[e]);Q(t,Qe[e],p|ue),he(t,e,-1)}}},AA=new Array(8).fill(0),yc=t=>{const e=c.cycleCount-AA[t];for(let r=0;r<=1;r++)wc(t,r,e),Rc(t,r,e);AA[t]=c.cycleCount},Pc=(t,e)=>{const r=[];for(let o=0;o<=15;o++)r[o]=O(t,gs[e]+o);return r},Mc=(t,e)=>t.length===e.length&&t.every((r,o)=>r===e[o]),Ze={slot:-1,chip:-1,params:[-1]};let fs=(t,e)=>{const r=Pc(t,e);t===Ze.slot&&e===Ze.chip&&Mc(r,Ze.params)||(Ze.slot=t,Ze.chip=e,Ze.params=r,B1({slot:t,chip:e,params:r}))};const Lc=(t,e)=>{switch(O(t,ls[e])&7){case 0:for(let o=0;o<=15;o++)Q(t,gs[e]+o,0);fs(t,e);break;case 7:Q(t,sA[e],O(t,us[e]));break;case 6:{const o=O(t,sA[e]),a=O(t,us[e]);o>=0&&o<=15&&(Q(t,gs[e]+o,a),fs(t,e));break}}},he=(t,e,r)=>{let o=O(t,Qe[e]);switch(r>=0&&(o&=127-(r&127),Q(t,Qe[e],o)),e){case 0:er(t,o!==0);break;case 1:xi(o!==0);break}},Qc=(t,e,r)=>{let o=O(t,fr[e]);r>=0&&(r=r&255,r&128?o|=r:o&=255-r),o|=128,Q(t,fr[e],o)},bc=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,o=t&255,a=o&128?1:0;switch(o){case ls[a]:e>=0&&(Q(r,ls[a],e),Lc(r,a));break;case us[a]:case Sc[a]:case Cc[a]:case Ec[a]:case Is[a]:case Bc[a]:Q(r,o,e);break;case Xe[a]:e>=0&&Q(r,an[a],e),he(r,a,Ht);break;case Ge[a]:if(e>=0){Q(r,hs[a],e),Q(r,Xe[a],O(r,an[a])),Q(r,Ge[a],e);const h=O(r,Yt[a]);Q(r,Yt[a],h&~Ht),he(r,a,Ht)}break;case an[a]:e>=0&&(Q(r,o,e),he(r,a,Ht));break;case hs[a]:e>=0&&Q(r,o,e);break;case Ir[a]:e>=0&&Q(r,nA[a],e),he(r,a,ue);break;case gr[a]:if(e>=0){Q(r,gr[a],e),Q(r,Ir[a],O(r,nA[a]));const h=O(r,Yt[a]);Q(r,Yt[a],h&~ue),he(r,a,ue)}break;case Qe[a]:e>=0&&he(r,a,e);break;case fr[a]:Qc(r,a,e);break}return-1},cn=40,Fc=(t,e)=>t+2+(e>127?e-256:e),Uc=(t,e,r,o)=>{let a="",h=`${_(e.pcode)}`,p="",u="";switch(e.bytes){case 1:h+="      ";break;case 2:p=_(r),h+=` ${p}   `;break;case 3:p=_(r),u=_(o),h+=` ${p} ${u}`;break}const D=mn(e.name)?_(Fc(t,r),4):p;switch(e.mode){case A.IMPLIED:break;case A.IMM:a=` #$${p}`;break;case A.ZP_REL:a=` $${D}`;break;case A.ZP_X:a=` $${p},X`;break;case A.ZP_Y:a=` $${p},Y`;break;case A.ABS:a=` $${u}${p}`;break;case A.ABS_X:a=` $${u}${p},X`;break;case A.ABS_Y:a=` $${u}${p},Y`;break;case A.IND_X:a=` ($${u.trim()}${p},X)`;break;case A.IND_Y:a=` ($${p}),Y`;break;case A.IND:a=` ($${u.trim()}${p})`;break}return`${_(t,4)}: ${h}  ${e.name}${a}`},Kc=t=>{let e=t;e>65535-cn&&(e=65535-cn);let r="";for(let o=0;o<cn;o++){if(e>65535){r+=`
`;continue}const a=Ye(e),h=G[a],p=Ye(e+1),u=Ye(e+2);r+=Uc(e,h,p,u)+`
`,e+=h.bytes}return r},qc=(t,e)=>{if(e<t||t<0)return!1;let r=t;for(let o=0;o<cn;o++){if(r===e)return!0;const a=Ye(r);if(r+=G[a].bytes,r>65535)break}return!1},Nc=t=>{const e=Ye(t);return G[e].name};let _e=0;const ln=192,Yc=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${_(ln)}   ; jump address
         STA   $07FE
         LDA   #$60    ; Fake RTS to determine our slot
         STA   $07FF
         JSR   $07FF
         TSX
         LDA   $100,X  ; High byte of slot adddress
         STA   $07FF   ; Store this for the high byte of our JMP command
         ASL           ; Shift $Cs up to $s0 (e.g. $C7 -> $70)
         ASL           ; We need this for the ProDOS unit number (below).
         ASL           ; Format = bits DSSS0000
         ASL           ; D = drive number (0), SSS = slot number (1-7)
         STA   $43     ; Store ProDOS unit number here
         LDA   #$08    ; Store block (512 bytes) at address $0800
         STA   $45     ; Address high byte
         LDA   #$00
         STA   $44     ; Address low byte
         STA   $46     ; Block 0 low byte
         STA   $47     ; Block 0 high byte
         JSR   $07FD   ; Read the block (will JMP to our driver and trigger it)
         BCS   ERROR
         LDA   #$0A    ; Store block (512 bytes) at address $0A00
         STA   $45     ; Address high byte
         LDA   #$01
         STA   $46     ; Block 1 low byte
         JSR   $07FD   ; Read
         BCS   ERROR
         LDA   $0801   ; Should be nonzero
         BEQ   ERROR
         LDA   #$01    ; Should always be 1
         CMP   $0800
         BNE   ERROR
         LDX   $43     ; ProDOS block 0 code wants ProDOS unit number in X
         JMP   $801    ; Continue reading the disk
ERROR    JMP   $E000   ; Out to BASIC on error
`,Oc=`
         NOP           ; Hard drive driver address
         BRA   DONE
         TSX           ; SmartPort driver address
         INX
         INC   $100,X
         INC   $100,X
         INC   $100,X
DONE     BCS   ERR
         LDA   #$00
         RTS
ERR      LDA   #$27
         RTS
`,xc=()=>{const t=new Uint8Array(256).fill(0),e=tn(0,Yc.split(`
`));t.set(e,0);const r=tn(0,Oc.split(`
`));return t.set(r,ln),t[254]=23,t[255]=ln,t};let pr=new Uint8Array;const ps=(t=!0)=>{pr.length===0&&(pr=xc()),pr[1]=t?32:0;const r=49152+ln+7*256;Ne(7,pr,r,_c),Ne(7,pr,r+3,Zc)},Wc=(t,e)=>{if(t===0)m(e,2);else if(t<=2){m(e,240);const a=zr(t).length/512;m(e+1,a&255),m(e+2,a>>>8),m(e+3,0),sr(4),or(0)}else nr(40),sr(0),or(0),L()},Xc=(t,e)=>{const a=zr(t).length/512,h=a>1600?2:1,p=h==2?32:64;m(e,240),m(e+1,a&255),m(e+2,a>>>8),m(e+3,0);const u="Apple2TS SP";m(e+4,u.length);let D=0;for(;D<u.length;D++)m(e+5+D,u.charCodeAt(D));for(;D<16;D++)m(e+5+D,u.charCodeAt(8));m(e+21,h),m(e+22,p),m(e+23,1),m(e+24,0),sr(25),or(0)},Gc=(t,e,r)=>{if(B(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),nr(4),L();return}const o=B(t+4);switch(o){case 0:Wc(e,r);break;case 1:case 2:nr(33),L();break;case 3:case 4:Xc(e,r);break;default:console.error(`SmartPort statusCode ${o} not implemented`);break}},Zc=()=>{nr(0),L(!1);const t=256+c.StackPtr,e=B(t+1)+256*B(t+2),r=B(e+1),o=B(e+2)+256*B(e+3),a=B(o+1),h=B(o+2)+256*B(o+3);switch(r){case 0:{Gc(o,a,h);return}case 1:{if(B(o)!==3){console.error(`Incorrect SmartPort parameter count at address ${o}`),L();return}const D=512*(B(o+4)+256*B(o+5)+65536*B(o+6)),R=zr(a).slice(D,D+512);Jn(h,R);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),L();return}const p=ns(a);p.motorRunning=!0,_e||(_e=setTimeout(()=>{_e=0,p&&(p.motorRunning=!1),St()},500)),St()},_c=()=>{nr(0),L(!1);const t=B(66),e=Math.max(Math.min(B(67)>>6,2),0),r=ns(e);if(!r.hardDrive)return;const o=zr(e),a=B(70)+256*B(71),h=512*a,p=B(68)+256*B(69),u=o.length;switch(r.status=` ${_(a,4)}`,t){case 0:{if(r.filename.length===0||u===0){sr(0),or(0),L();return}const D=u/512;sr(D&255),or(D>>>8);break}case 1:{if(h+512>u){L();return}const D=o.slice(h,h+512);Jn(p,D);break}case 2:{if(h+512>u){L();return}if(r.isWriteProtected){L();return}const D=_n(p);o.set(D,h),r.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),L();return;default:console.error("unknown hard drive command"),L();return}L(!1),r.motorRunning=!0,_e||(_e=setTimeout(()=>{_e=0,r&&(r.motorRunning=!1),St()},500)),St()};let iA=0,un=0,Sr=0,hn=0,Cr=VA,Ie=-1,aA=16.6881,Ss=17030,cA=0,tt=F.IDLE,ge="APPLE2EE",Je=0,In=!1,It=0;const N=[];let Er=0;const Jc=()=>{E.VBL.isSet=!0,nc()},Vc=()=>{E.VBL.isSet=!1},lA=()=>{const t={};for(const e in E)t[e]=E[e].isSet;return t},jc=()=>{const t=JSON.parse(JSON.stringify(c));let e=vt;for(let o=vt;o<y.length;o++)y[o]!==255&&(o+=255-o%256,e=o+1);const r=ft.Buffer.from(y.slice(0,e));return{s6502:t,extraRamSize:64*(bt+1),machineName:ge,softSwitches:lA(),memory:r.toString("base64")}},Hc=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));fo(r);const o=t.softSwitches;for(const h in o){const p=h;try{E[p].isSet=o[h]}catch{}}"WRITEBSR1"in o&&(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=o.WRITEBSR1||o.WRITEBSR2||o.RDWRBSR1||o.RDWRBSR2);const a=new Uint8Array(ft.Buffer.from(t.memory,"base64"));if(e<1){y.set(a.slice(0,65536)),y.set(a.slice(131072,163584),65536),y.set(a.slice(65536,131072),vt);const h=(a.length-163584)/1024;h>0&&(Wn(h+64),y.set(a.slice(163584),vt+65536))}else Wn(t.extraRamSize),y.set(a);ge=t.machineName||"APPLE2EE",Es(ge,!1),$t(),bn(!0)},vc=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!1,colorMode:0,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:F.IDLE,breakpoints:ct,stackDump:ia()}),Cs=t=>({emulator:vc(),state6502:jc(),driveState:Ka(t),thumbnail:"",snapshots:null}),zc=()=>{const t=Cs(!0);return t.snapshots=N,t},$c=t=>{t.PC!==c.PC&&(Ie=t.PC),fo(t),fe()},gn=(t,e=!1)=>{var o,a;pn();const r=(o=t.emulator)!=null&&o.version?t.emulator.version:.9;Hc(t.state6502,r),(a=t.emulator)!=null&&a.stackDump&&aa(t.emulator.stackDump),qa(t.driveState),Ie=c.PC,e&&(N.length=0,It=0),t.snapshots&&(N.length=0,N.push(...t.snapshots),It=N.length),fe()};let uA=!1;const hA=()=>{uA||(uA=!0,Ha(),Ic(!0,2),pc(!0,4),rc(!0,5),ba(),ps())},t1=()=>{Na(),Pn(),vo(),gc(),ja(),Dc(4)},fn=()=>{if(Fr(0),ra(),ao(ge),hA(),Ho.length>0){const e=tn(768,Ho.split(`
`));y.set(e,768)}pn(),bn(!0),ns(1).filename===""&&(ps(!1),setTimeout(()=>{ps()},200))},pn=()=>{Wi(),Qi(),B(49282),po(),t1()},e1=t=>{Sr=t,aA=[16.6881,16.6881,1][Sr],Ss=[17030,17030*4,17030*4][Sr],EA()},r1=t=>{Cr=t,fe()},n1=(t,e)=>{y[t]=e,Cr&&fe()},s1=t=>{Ie=t,fe(),t===F.PAUSED&&(Ie=c.PC)},Es=(t,e=!0)=>{ge!==t&&(ge=t,ao(ge),e&&pn())},IA=()=>{const t=It-1;return t<0||!N[t]?-1:t},gA=()=>{const t=It+1;return t>=N.length||!N[t]?-1:t},fA=()=>{N.length===jA&&N.shift(),N.push(Cs(!1)),It=N.length,k1(N[N.length-1].state6502.s6502.PC)},o1=()=>{let t=IA();t<0||(Lt(F.PAUSED),setTimeout(()=>{It===N.length&&(fA(),t=Math.max(It-2,0)),It=t,gn(N[It])},50))},A1=()=>{const t=gA();t<0||(Lt(F.PAUSED),setTimeout(()=>{It=t,gn(N[t])},50))},i1=t=>{t<0||t>=N.length||(Lt(F.PAUSED),setTimeout(()=>{It=t,gn(N[t])},50))},a1=()=>{const t=[];for(let e=0;e<N.length;e++)t[e]={s6502:N[e].state6502.s6502,thumbnail:N[e].thumbnail};return t},c1=t=>{N.length>0&&(N[N.length-1].thumbnail=t)};let Sn=null;const pA=(t=!1)=>{Sn&&clearTimeout(Sn),t?Sn=setTimeout(()=>{In=!0,Sn=null},100):In=!0},SA=()=>{Mr(),tt===F.IDLE&&(fn(),tt=F.PAUSED),Nn(),Lt(F.PAUSED)},l1=()=>{Mr(),tt===F.IDLE&&(fn(),tt=F.PAUSED),B(c.PC,!1)===32?(Nn(),CA()):SA()},CA=()=>{Mr(),tt===F.IDLE&&(fn(),tt=F.PAUSED),Yi(),Lt(F.RUNNING)},EA=()=>{Je=0,un=performance.now(),iA=un},Lt=t=>{if(hA(),tt=t,tt===F.PAUSED)Er&&(clearInterval(Er),Er=0),Zo(),qc(Ie,c.PC)||(Ie=c.PC);else if(tt===F.RUNNING){for(Zo(!0),Mr();N.length>0&&It<N.length-1;)N.pop();It=N.length,Er||(Er=setInterval(bn,1e3))}fe(),EA(),hn===0&&(hn=1,mA())},BA=t=>{tt===F.IDLE?(Lt(F.NEED_BOOT),setTimeout(()=>{Lt(F.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},u1=(t,e,r)=>{BA(()=>{Jn(t,e),r&&Ft(t)})},h1=t=>{BA(()=>{Pi(t)})},I1=()=>Cr&&tt===F.PAUSED?Aa():new Uint8Array,g1=()=>tt===F.RUNNING?"":Kc(Ie>=0?Ie:c.PC),f1=()=>Cr&&tt!==F.IDLE?ca():"",fe=()=>{const t={addressGetTable:st,altChar:E.ALTCHARSET.isSet,arrowKeysAsJoystick:!1,breakpoints:ct,button0:E.PB0.isSet,button1:E.PB1.isSet,canGoBackward:IA()>=0,canGoForward:gA()>=0,capsLock:!0,c800Slot:On(),colorMode:ds.COLOR,cout:B(57)<<8|B(56),cpuSpeed:hn,darkMode:!1,disassembly:g1(),extraRamSize:64*(bt+1),helpText:"",hires:oa(),iTempState:It,isDebugging:Cr,lores:Zn(!0),machineName:ge,memoryDump:I1(),nextInstruction:Nc(c.PC),noDelayMode:!E.COLUMN80.isSet&&!E.AN3.isSet,ramWorksBank:we(),runMode:tt,s6502:c,softSwitches:lA(),speedMode:Sr,stackString:f1(),textPage:Zn(),timeTravelThumbnails:a1(),useOpenAppleKey:!1};S1(t)},p1=t=>{if(t)for(let e=0;e<t.length;e++)bi(t[e]);else Fi();fe()},DA=()=>{const t=performance.now();if(cA=t-un,cA<aA||(un=t,tt===F.IDLE||tt===F.PAUSED))return;tt===F.NEED_BOOT?(fn(),Lt(F.RUNNING)):tt===F.NEED_RESET&&(pn(),Lt(F.RUNNING));let e=0;for(;;){const o=Nn();if(o<0)break;if(e+=o,e%17030>=12480&&(E.VBL.isSet||Jc()),e>=Ss){Vc();break}}Je++;const r=Je*Ss/(performance.now()-iA);hn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,Je%2&&(oi(),fe()),In&&(In=!1,fA())},mA=()=>{DA();const t=Je+[1,5,10][Sr];for(;tt===F.RUNNING&&Je!==t;)DA();setTimeout(mA,tt===F.RUNNING?0:20)},Bt=(t,e)=>{self.postMessage({msg:t,payload:e})},S1=t=>{Bt(ut.MACHINE_STATE,t)},C1=t=>{Bt(ut.CLICK,t)},E1=t=>{Bt(ut.DRIVE_PROPS,t)},Ve=t=>{Bt(ut.DRIVE_SOUND,t)},kA=t=>{Bt(ut.SAVE_STATE,t)},Cn=t=>{Bt(ut.RUMBLE,t)},wA=t=>{Bt(ut.HELP_TEXT,t)},dA=t=>{Bt(ut.ENHANCED_MIDI,t)},TA=t=>{Bt(ut.SHOW_MOUSE,t)},B1=t=>{Bt(ut.MBOARD_SOUND,t)},D1=t=>{Bt(ut.COMM_DATA,t)},m1=t=>{Bt(ut.MIDI_DATA,t)},k1=t=>{Bt(ut.REQUEST_THUMBNAIL,t)};typeof self<"u"&&(self.onmessage=t=>{if("msg"in t.data)switch(t.data.msg){case U.RUN_MODE:Lt(t.data.payload);break;case U.STATE6502:$c(t.data.payload);break;case U.DEBUG:r1(t.data.payload);break;case U.DISASSEMBLE_ADDR:s1(t.data.payload);break;case U.BREAKPOINTS:Oi(t.data.payload);break;case U.STEP_INTO:SA();break;case U.STEP_OVER:l1();break;case U.STEP_OUT:CA();break;case U.SPEED:e1(t.data.payload);break;case U.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?A1():o1();break;case U.TIME_TRAVEL_INDEX:i1(t.data.payload);break;case U.TIME_TRAVEL_SNAPSHOT:pA();break;case U.THUMBNAIL_IMAGE:c1(t.data.payload);break;case U.RESTORE_STATE:gn(t.data.payload,!0);break;case U.KEYPRESS:yi(t.data.payload);break;case U.MOUSEEVENT:sc(t.data.payload);break;case U.PASTE_TEXT:h1(t.data.payload);break;case U.APPLE_PRESS:Ns(!0,t.data.payload);break;case U.APPLE_RELEASE:Ns(!1,t.data.payload);break;case U.GET_SAVE_STATE:kA(Cs(!0));break;case U.GET_SAVE_STATE_SNAPSHOTS:kA(zc());break;case U.DRIVE_PROPS:{const e=t.data.payload;Oa(e);break}case U.DRIVE_NEW_DATA:{const e=t.data.payload;Ya(e);break}case U.GAMEPAD:ni(t.data.payload);break;case U.SET_BINARY_BLOCK:{const e=t.data.payload;u1(e.address,e.data,e.run);break}case U.SET_MEMORY:{const e=t.data.payload;n1(e.address,e.value);break}case U.COMM_DATA:Va(t.data.payload);break;case U.MIDI_DATA:hc(t.data.payload);break;case U.RAMWORKS:Wn(t.data.payload);break;case U.MACHINE_NAME:Es(t.data.payload);break;case U.SOFTSWITCHES:p1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
