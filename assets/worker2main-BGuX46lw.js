var j1=Object.defineProperty;var H1=(Jt,dt,Ee)=>dt in Jt?j1(Jt,dt,{enumerable:!0,configurable:!0,writable:!0,value:Ee}):Jt[dt]=Ee;var T=(Jt,dt,Ee)=>H1(Jt,typeof dt!="symbol"?dt+"":dt,Ee);(function(){"use strict";var Jt={},dt={},Ee;function HA(){if(Ee)return dt;Ee=1,dt.byteLength=u,dt.toByteArray=j,dt.fromByteArray=W;for(var t=[],e=[],r=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,h=s.length;a<h;++a)t[a]=s[a],e[s.charCodeAt(a)]=a;e[45]=62,e[95]=63;function p(k){var b=k.length;if(b%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var Z=k.indexOf("=");Z===-1&&(Z=b);var It=Z===b?0:4-Z%4;return[Z,It]}function u(k){var b=p(k),Z=b[0],It=b[1];return(Z+It)*3/4-It}function m(k,b,Z){return(b+Z)*3/4-Z}function j(k){var b,Z=p(k),It=Z[0],pt=Z[1],at=new r(m(k,It,pt)),Bt=0,be=pt>0?It-4:It,ot;for(ot=0;ot<be;ot+=4)b=e[k.charCodeAt(ot)]<<18|e[k.charCodeAt(ot+1)]<<12|e[k.charCodeAt(ot+2)]<<6|e[k.charCodeAt(ot+3)],at[Bt++]=b>>16&255,at[Bt++]=b>>8&255,at[Bt++]=b&255;return pt===2&&(b=e[k.charCodeAt(ot)]<<2|e[k.charCodeAt(ot+1)]>>4,at[Bt++]=b&255),pt===1&&(b=e[k.charCodeAt(ot)]<<10|e[k.charCodeAt(ot+1)]<<4|e[k.charCodeAt(ot+2)]>>2,at[Bt++]=b>>8&255,at[Bt++]=b&255),at}function P(k){return t[k>>18&63]+t[k>>12&63]+t[k>>6&63]+t[k&63]}function z(k,b,Z){for(var It,pt=[],at=b;at<Z;at+=3)It=(k[at]<<16&16711680)+(k[at+1]<<8&65280)+(k[at+2]&255),pt.push(P(It));return pt.join("")}function W(k){for(var b,Z=k.length,It=Z%3,pt=[],at=16383,Bt=0,be=Z-It;Bt<be;Bt+=at)pt.push(z(k,Bt,Bt+at>be?be:Bt+at));return It===1?(b=k[Z-1],pt.push(t[b>>2]+t[b<<4&63]+"==")):It===2&&(b=(k[Z-2]<<8)+k[Z-1],pt.push(t[b>>10]+t[b>>4&63]+t[b<<2&63]+"=")),pt.join("")}return dt}var wr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */var Lo;function vA(){return Lo||(Lo=1,wr.read=function(t,e,r,s,a){var h,p,u=a*8-s-1,m=(1<<u)-1,j=m>>1,P=-7,z=r?a-1:0,W=r?-1:1,k=t[e+z];for(z+=W,h=k&(1<<-P)-1,k>>=-P,P+=u;P>0;h=h*256+t[e+z],z+=W,P-=8);for(p=h&(1<<-P)-1,h>>=-P,P+=s;P>0;p=p*256+t[e+z],z+=W,P-=8);if(h===0)h=1-j;else{if(h===m)return p?NaN:(k?-1:1)*(1/0);p=p+Math.pow(2,s),h=h-j}return(k?-1:1)*p*Math.pow(2,h-s)},wr.write=function(t,e,r,s,a,h){var p,u,m,j=h*8-a-1,P=(1<<j)-1,z=P>>1,W=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,k=s?0:h-1,b=s?1:-1,Z=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=P):(p=Math.floor(Math.log(e)/Math.LN2),e*(m=Math.pow(2,-p))<1&&(p--,m*=2),p+z>=1?e+=W/m:e+=W*Math.pow(2,1-z),e*m>=2&&(p++,m/=2),p+z>=P?(u=0,p=P):p+z>=1?(u=(e*m-1)*Math.pow(2,a),p=p+z):(u=e*Math.pow(2,z-1)*Math.pow(2,a),p=0));a>=8;t[r+k]=u&255,k+=b,u/=256,a-=8);for(p=p<<a|u,j+=a;j>0;t[r+k]=p&255,k+=b,p/=256,j-=8);t[r+k-b]|=Z*128}),wr}/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var Mo;function zA(){return Mo||(Mo=1,function(t){const e=HA(),r=vA(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=at,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const i=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(i,n),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(i){if(i>a)throw new RangeError('The value "'+i+'" is invalid for option "size"');const n=new Uint8Array(i);return Object.setPrototypeOf(n,u.prototype),n}function u(i,n,o){if(typeof i=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return z(i)}return m(i,n,o)}u.poolSize=8192;function m(i,n,o){if(typeof i=="string")return W(i,n);if(ArrayBuffer.isView(i))return b(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(_t(i,ArrayBuffer)||i&&_t(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(_t(i,SharedArrayBuffer)||i&&_t(i.buffer,SharedArrayBuffer)))return Z(i,n,o);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=i.valueOf&&i.valueOf();if(l!=null&&l!==i)return u.from(l,n,o);const f=It(i);if(f)return f;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),n,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,n,o){return m(i,n,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function j(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function P(i,n,o){return j(i),i<=0?p(i):n!==void 0?typeof o=="string"?p(i).fill(n,o):p(i).fill(n):p(i)}u.alloc=function(i,n,o){return P(i,n,o)};function z(i){return j(i),p(i<0?0:pt(i)|0)}u.allocUnsafe=function(i){return z(i)},u.allocUnsafeSlow=function(i){return z(i)};function W(i,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const o=Bt(i,n)|0;let l=p(o);const f=l.write(i,n);return f!==o&&(l=l.slice(0,f)),l}function k(i){const n=i.length<0?0:pt(i.length)|0,o=p(n);for(let l=0;l<n;l+=1)o[l]=i[l]&255;return o}function b(i){if(_t(i,Uint8Array)){const n=new Uint8Array(i);return Z(n.buffer,n.byteOffset,n.byteLength)}return k(i)}function Z(i,n,o){if(n<0||i.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<n+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&o===void 0?l=new Uint8Array(i):o===void 0?l=new Uint8Array(i,n):l=new Uint8Array(i,n,o),Object.setPrototypeOf(l,u.prototype),l}function It(i){if(u.isBuffer(i)){const n=pt(i.length)|0,o=p(n);return o.length===0||i.copy(o,0,0,n),o}if(i.length!==void 0)return typeof i.length!="number"||Po(i.length)?p(0):k(i);if(i.type==="Buffer"&&Array.isArray(i.data))return k(i.data)}function pt(i){if(i>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return i|0}function at(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,o){if(_t(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),_t(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(n)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===o)return 0;let l=n.length,f=o.length;for(let C=0,S=Math.min(l,f);C<S;++C)if(n[C]!==o[C]){l=n[C],f=o[C];break}return l<f?-1:f<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,o){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<n.length;++l)o+=n[l].length;const f=u.allocUnsafe(o);let C=0;for(l=0;l<n.length;++l){let S=n[l];if(_t(S,Uint8Array))C+S.length>f.length?(u.isBuffer(S)||(S=u.from(S)),S.copy(f,C)):Uint8Array.prototype.set.call(f,S,C);else if(u.isBuffer(S))S.copy(f,C);else throw new TypeError('"list" argument must be an Array of Buffers');C+=S.length}return f};function Bt(i,n){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||_t(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const o=i.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let f=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return yo(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return jA(i).length;default:if(f)return l?-1:yo(i).length;n=(""+n).toLowerCase(),f=!0}}u.byteLength=Bt;function be(i,n,o){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,n>>>=0,o<=n))return"";for(i||(i="utf8");;)switch(i){case"hex":return Y1(this,n,o);case"utf8":case"utf-8":return YA(this,n,o);case"ascii":return N1(this,n,o);case"latin1":case"binary":return O1(this,n,o);case"base64":return K1(this,n,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return W1(this,n,o);default:if(l)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function ot(i,n,o){const l=i[n];i[n]=i[o],i[o]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<n;o+=2)ot(this,o,o+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<n;o+=4)ot(this,o,o+3),ot(this,o+1,o+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<n;o+=8)ot(this,o,o+7),ot(this,o+1,o+6),ot(this,o+2,o+5),ot(this,o+3,o+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?YA(this,0,n):be.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const o=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(n+=" ... "),"<Buffer "+n+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(n,o,l,f,C){if(_t(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(o===void 0&&(o=0),l===void 0&&(l=n?n.length:0),f===void 0&&(f=0),C===void 0&&(C=this.length),o<0||l>n.length||f<0||C>this.length)throw new RangeError("out of range index");if(f>=C&&o>=l)return 0;if(f>=C)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,f>>>=0,C>>>=0,this===n)return 0;let S=C-f,M=l-o;const $=Math.min(S,M),H=this.slice(f,C),tt=n.slice(o,l);for(let _=0;_<$;++_)if(H[_]!==tt[_]){S=H[_],M=tt[_];break}return S<M?-1:M<S?1:0};function NA(i,n,o,l,f){if(i.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Po(o)&&(o=f?0:i.length-1),o<0&&(o=i.length+o),o>=i.length){if(f)return-1;o=i.length-1}else if(o<0)if(f)o=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:OA(i,n,o,l,f);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?f?Uint8Array.prototype.indexOf.call(i,n,o):Uint8Array.prototype.lastIndexOf.call(i,n,o):OA(i,[n],o,l,f);throw new TypeError("val must be string, number or Buffer")}function OA(i,n,o,l,f){let C=1,S=i.length,M=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(i.length<2||n.length<2)return-1;C=2,S/=2,M/=2,o/=2}function $(tt,_){return C===1?tt[_]:tt.readUInt16BE(_*C)}let H;if(f){let tt=-1;for(H=o;H<S;H++)if($(i,H)===$(n,tt===-1?0:H-tt)){if(tt===-1&&(tt=H),H-tt+1===M)return tt*C}else tt!==-1&&(H-=H-tt),tt=-1}else for(o+M>S&&(o=S-M),H=o;H>=0;H--){let tt=!0;for(let _=0;_<M;_++)if($(i,H+_)!==$(n,_)){tt=!1;break}if(tt)return H}return-1}u.prototype.includes=function(n,o,l){return this.indexOf(n,o,l)!==-1},u.prototype.indexOf=function(n,o,l){return NA(this,n,o,l,!0)},u.prototype.lastIndexOf=function(n,o,l){return NA(this,n,o,l,!1)};function M1(i,n,o,l){o=Number(o)||0;const f=i.length-o;l?(l=Number(l),l>f&&(l=f)):l=f;const C=n.length;l>C/2&&(l=C/2);let S;for(S=0;S<l;++S){const M=parseInt(n.substr(S*2,2),16);if(Po(M))return S;i[o+S]=M}return S}function Q1(i,n,o,l){return Rn(yo(n,i.length-o),i,o,l)}function F1(i,n,o,l){return Rn(Z1(n),i,o,l)}function b1(i,n,o,l){return Rn(jA(n),i,o,l)}function U1(i,n,o,l){return Rn(_1(n,i.length-o),i,o,l)}u.prototype.write=function(n,o,l,f){if(o===void 0)f="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")f=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,f===void 0&&(f="utf8")):(f=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const C=this.length-o;if((l===void 0||l>C)&&(l=C),n.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");f||(f="utf8");let S=!1;for(;;)switch(f){case"hex":return M1(this,n,o,l);case"utf8":case"utf-8":return Q1(this,n,o,l);case"ascii":case"latin1":case"binary":return F1(this,n,o,l);case"base64":return b1(this,n,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return U1(this,n,o,l);default:if(S)throw new TypeError("Unknown encoding: "+f);f=(""+f).toLowerCase(),S=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function K1(i,n,o){return n===0&&o===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(n,o))}function YA(i,n,o){o=Math.min(i.length,o);const l=[];let f=n;for(;f<o;){const C=i[f];let S=null,M=C>239?4:C>223?3:C>191?2:1;if(f+M<=o){let $,H,tt,_;switch(M){case 1:C<128&&(S=C);break;case 2:$=i[f+1],($&192)===128&&(_=(C&31)<<6|$&63,_>127&&(S=_));break;case 3:$=i[f+1],H=i[f+2],($&192)===128&&(H&192)===128&&(_=(C&15)<<12|($&63)<<6|H&63,_>2047&&(_<55296||_>57343)&&(S=_));break;case 4:$=i[f+1],H=i[f+2],tt=i[f+3],($&192)===128&&(H&192)===128&&(tt&192)===128&&(_=(C&15)<<18|($&63)<<12|(H&63)<<6|tt&63,_>65535&&_<1114112&&(S=_))}}S===null?(S=65533,M=1):S>65535&&(S-=65536,l.push(S>>>10&1023|55296),S=56320|S&1023),l.push(S),f+=M}return q1(l)}const WA=4096;function q1(i){const n=i.length;if(n<=WA)return String.fromCharCode.apply(String,i);let o="",l=0;for(;l<n;)o+=String.fromCharCode.apply(String,i.slice(l,l+=WA));return o}function N1(i,n,o){let l="";o=Math.min(i.length,o);for(let f=n;f<o;++f)l+=String.fromCharCode(i[f]&127);return l}function O1(i,n,o){let l="";o=Math.min(i.length,o);for(let f=n;f<o;++f)l+=String.fromCharCode(i[f]);return l}function Y1(i,n,o){const l=i.length;(!n||n<0)&&(n=0),(!o||o<0||o>l)&&(o=l);let f="";for(let C=n;C<o;++C)f+=J1[i[C]];return f}function W1(i,n,o){const l=i.slice(n,o);let f="";for(let C=0;C<l.length-1;C+=2)f+=String.fromCharCode(l[C]+l[C+1]*256);return f}u.prototype.slice=function(n,o){const l=this.length;n=~~n,o=o===void 0?l:~~o,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<n&&(o=n);const f=this.subarray(n,o);return Object.setPrototypeOf(f,u.prototype),f};function ut(i,n,o){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+n>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||ut(n,o,this.length);let f=this[n],C=1,S=0;for(;++S<o&&(C*=256);)f+=this[n+S]*C;return f},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||ut(n,o,this.length);let f=this[n+--o],C=1;for(;o>0&&(C*=256);)f+=this[n+--o]*C;return f},u.prototype.readUint8=u.prototype.readUInt8=function(n,o){return n=n>>>0,o||ut(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,o){return n=n>>>0,o||ut(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,o){return n=n>>>0,o||ut(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=Se(function(n){n=n>>>0,ve(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Dr(n,this.length-8);const f=o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,C=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(f)+(BigInt(C)<<BigInt(32))}),u.prototype.readBigUInt64BE=Se(function(n){n=n>>>0,ve(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Dr(n,this.length-8);const f=o*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],C=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(f)<<BigInt(32))+BigInt(C)}),u.prototype.readIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||ut(n,o,this.length);let f=this[n],C=1,S=0;for(;++S<o&&(C*=256);)f+=this[n+S]*C;return C*=128,f>=C&&(f-=Math.pow(2,8*o)),f},u.prototype.readIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||ut(n,o,this.length);let f=o,C=1,S=this[n+--f];for(;f>0&&(C*=256);)S+=this[n+--f]*C;return C*=128,S>=C&&(S-=Math.pow(2,8*o)),S},u.prototype.readInt8=function(n,o){return n=n>>>0,o||ut(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,o){n=n>>>0,o||ut(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,o){n=n>>>0,o||ut(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=Se(function(n){n=n>>>0,ve(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Dr(n,this.length-8);const f=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(f)<<BigInt(32))+BigInt(o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=Se(function(n){n=n>>>0,ve(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Dr(n,this.length-8);const f=(o<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(f)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,o){return n=n>>>0,o||ut(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,o){return n=n>>>0,o||ut(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,o){return n=n>>>0,o||ut(n,8,this.length),r.read(this,n,!1,52,8)};function kt(i,n,o,l,f,C){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>f||n<C)throw new RangeError('"value" argument is out of bounds');if(o+l>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,o,l,f){if(n=+n,o=o>>>0,l=l>>>0,!f){const M=Math.pow(2,8*l)-1;kt(this,n,o,l,M,0)}let C=1,S=0;for(this[o]=n&255;++S<l&&(C*=256);)this[o+S]=n/C&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,o,l,f){if(n=+n,o=o>>>0,l=l>>>0,!f){const M=Math.pow(2,8*l)-1;kt(this,n,o,l,M,0)}let C=l-1,S=1;for(this[o+C]=n&255;--C>=0&&(S*=256);)this[o+C]=n/S&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,1,255,0),this[o]=n&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,2,65535,0),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,2,65535,0),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,4,4294967295,0),this[o+3]=n>>>24,this[o+2]=n>>>16,this[o+1]=n>>>8,this[o]=n&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,4,4294967295,0),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4};function xA(i,n,o,l,f){VA(n,l,f,i,o,7);let C=Number(n&BigInt(4294967295));i[o++]=C,C=C>>8,i[o++]=C,C=C>>8,i[o++]=C,C=C>>8,i[o++]=C;let S=Number(n>>BigInt(32)&BigInt(4294967295));return i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,o}function XA(i,n,o,l,f){VA(n,l,f,i,o,7);let C=Number(n&BigInt(4294967295));i[o+7]=C,C=C>>8,i[o+6]=C,C=C>>8,i[o+5]=C,C=C>>8,i[o+4]=C;let S=Number(n>>BigInt(32)&BigInt(4294967295));return i[o+3]=S,S=S>>8,i[o+2]=S,S=S>>8,i[o+1]=S,S=S>>8,i[o]=S,o+8}u.prototype.writeBigUInt64LE=Se(function(n,o=0){return xA(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Se(function(n,o=0){return XA(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,o,l,f){if(n=+n,o=o>>>0,!f){const $=Math.pow(2,8*l-1);kt(this,n,o,l,$-1,-$)}let C=0,S=1,M=0;for(this[o]=n&255;++C<l&&(S*=256);)n<0&&M===0&&this[o+C-1]!==0&&(M=1),this[o+C]=(n/S>>0)-M&255;return o+l},u.prototype.writeIntBE=function(n,o,l,f){if(n=+n,o=o>>>0,!f){const $=Math.pow(2,8*l-1);kt(this,n,o,l,$-1,-$)}let C=l-1,S=1,M=0;for(this[o+C]=n&255;--C>=0&&(S*=256);)n<0&&M===0&&this[o+C+1]!==0&&(M=1),this[o+C]=(n/S>>0)-M&255;return o+l},u.prototype.writeInt8=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,1,127,-128),n<0&&(n=255+n+1),this[o]=n&255,o+1},u.prototype.writeInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,2,32767,-32768),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,2,32767,-32768),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,4,2147483647,-2147483648),this[o]=n&255,this[o+1]=n>>>8,this[o+2]=n>>>16,this[o+3]=n>>>24,o+4},u.prototype.writeInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||kt(this,n,o,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4},u.prototype.writeBigInt64LE=Se(function(n,o=0){return xA(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Se(function(n,o=0){return XA(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function GA(i,n,o,l,f,C){if(o+l>i.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function ZA(i,n,o,l,f){return n=+n,o=o>>>0,f||GA(i,n,o,4),r.write(i,n,o,l,23,4),o+4}u.prototype.writeFloatLE=function(n,o,l){return ZA(this,n,o,!0,l)},u.prototype.writeFloatBE=function(n,o,l){return ZA(this,n,o,!1,l)};function _A(i,n,o,l,f){return n=+n,o=o>>>0,f||GA(i,n,o,8),r.write(i,n,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(n,o,l){return _A(this,n,o,!0,l)},u.prototype.writeDoubleBE=function(n,o,l){return _A(this,n,o,!1,l)},u.prototype.copy=function(n,o,l,f){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!f&&f!==0&&(f=this.length),o>=n.length&&(o=n.length),o||(o=0),f>0&&f<l&&(f=l),f===l||n.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(f<0)throw new RangeError("sourceEnd out of bounds");f>this.length&&(f=this.length),n.length-o<f-l&&(f=n.length-o+l);const C=f-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,f):Uint8Array.prototype.set.call(n,this.subarray(l,f),o),C},u.prototype.fill=function(n,o,l,f){if(typeof n=="string"){if(typeof o=="string"?(f=o,o=0,l=this.length):typeof l=="string"&&(f=l,l=this.length),f!==void 0&&typeof f!="string")throw new TypeError("encoding must be a string");if(typeof f=="string"&&!u.isEncoding(f))throw new TypeError("Unknown encoding: "+f);if(n.length===1){const S=n.charCodeAt(0);(f==="utf8"&&S<128||f==="latin1")&&(n=S)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let C;if(typeof n=="number")for(C=o;C<l;++C)this[C]=n;else{const S=u.isBuffer(n)?n:u.from(n,f),M=S.length;if(M===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(C=0;C<l-o;++C)this[C+o]=S[C%M]}return this};const He={};function Ro(i,n,o){He[i]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(f){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:f,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}Ro("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Ro("ERR_INVALID_ARG_TYPE",function(i,n){return`The "${i}" argument must be of type number. Received type ${typeof n}`},TypeError),Ro("ERR_OUT_OF_RANGE",function(i,n,o){let l=`The value of "${i}" is out of range.`,f=o;return Number.isInteger(o)&&Math.abs(o)>2**32?f=JA(String(o)):typeof o=="bigint"&&(f=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(f=JA(f)),f+="n"),l+=` It must be ${n}. Received ${f}`,l},RangeError);function JA(i){let n="",o=i.length;const l=i[0]==="-"?1:0;for(;o>=l+4;o-=3)n=`_${i.slice(o-3,o)}${n}`;return`${i.slice(0,o)}${n}`}function x1(i,n,o){ve(n,"offset"),(i[n]===void 0||i[n+o]===void 0)&&Dr(n,i.length-(o+1))}function VA(i,n,o,l,f,C){if(i>o||i<n){const S=typeof n=="bigint"?"n":"";let M;throw n===0||n===BigInt(0)?M=`>= 0${S} and < 2${S} ** ${(C+1)*8}${S}`:M=`>= -(2${S} ** ${(C+1)*8-1}${S}) and < 2 ** ${(C+1)*8-1}${S}`,new He.ERR_OUT_OF_RANGE("value",M,i)}x1(l,f,C)}function ve(i,n){if(typeof i!="number")throw new He.ERR_INVALID_ARG_TYPE(n,"number",i)}function Dr(i,n,o){throw Math.floor(i)!==i?(ve(i,o),new He.ERR_OUT_OF_RANGE("offset","an integer",i)):n<0?new He.ERR_BUFFER_OUT_OF_BOUNDS:new He.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,i)}const X1=/[^+/0-9A-Za-z-_]/g;function G1(i){if(i=i.split("=")[0],i=i.trim().replace(X1,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function yo(i,n){n=n||1/0;let o;const l=i.length;let f=null;const C=[];for(let S=0;S<l;++S){if(o=i.charCodeAt(S),o>55295&&o<57344){if(!f){if(o>56319){(n-=3)>-1&&C.push(239,191,189);continue}else if(S+1===l){(n-=3)>-1&&C.push(239,191,189);continue}f=o;continue}if(o<56320){(n-=3)>-1&&C.push(239,191,189),f=o;continue}o=(f-55296<<10|o-56320)+65536}else f&&(n-=3)>-1&&C.push(239,191,189);if(f=null,o<128){if((n-=1)<0)break;C.push(o)}else if(o<2048){if((n-=2)<0)break;C.push(o>>6|192,o&63|128)}else if(o<65536){if((n-=3)<0)break;C.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((n-=4)<0)break;C.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return C}function Z1(i){const n=[];for(let o=0;o<i.length;++o)n.push(i.charCodeAt(o)&255);return n}function _1(i,n){let o,l,f;const C=[];for(let S=0;S<i.length&&!((n-=2)<0);++S)o=i.charCodeAt(S),l=o>>8,f=o%256,C.push(f),C.push(l);return C}function jA(i){return e.toByteArray(G1(i))}function Rn(i,n,o,l){let f;for(f=0;f<l&&!(f+o>=n.length||f>=i.length);++f)n[f+o]=i[f];return f}function _t(i,n){return i instanceof n||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===n.name}function Po(i){return i!==i}const J1=function(){const i="0123456789abcdef",n=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let f=0;f<16;++f)n[l+f]=i[o]+i[f]}return n}();function Se(i){return typeof BigInt>"u"?V1:i}function V1(){throw new Error("BigInt not supported")}}(Jt)),Jt}var Ue=zA();const $A=!1,ti=30,ei=4,ze=256,Ke=383,$e=256*ze,ne=256*Ke;var O=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(O||{}),ft=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t[t.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",t[t.INSTRUCTIONS=14]="INSTRUCTIONS",t))(ft||{}),q=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.BREAKPOINTS=3]="BREAKPOINTS",t[t.STEP_INTO=4]="STEP_INTO",t[t.STEP_OVER=5]="STEP_OVER",t[t.STEP_OUT=6]="STEP_OUT",t[t.SPEED=7]="SPEED",t[t.TIME_TRAVEL_STEP=8]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=9]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=10]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=11]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=12]="RESTORE_STATE",t[t.KEYPRESS=13]="KEYPRESS",t[t.MOUSEEVENT=14]="MOUSEEVENT",t[t.PASTE_TEXT=15]="PASTE_TEXT",t[t.APPLE_PRESS=16]="APPLE_PRESS",t[t.APPLE_RELEASE=17]="APPLE_RELEASE",t[t.GET_SAVE_STATE=18]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=19]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=20]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=21]="DRIVE_NEW_DATA",t[t.GAMEPAD=22]="GAMEPAD",t[t.SET_BINARY_BLOCK=23]="SET_BINARY_BLOCK",t[t.SET_CYCLECOUNT=24]="SET_CYCLECOUNT",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RAMWORKS=28]="RAMWORKS",t[t.MACHINE_NAME=29]="MACHINE_NAME",t[t.SOFTSWITCHES=30]="SOFTSWITCHES",t))(q||{}),Qo=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t[t.INVERSEBLACKANDWHITE=5]="INVERSEBLACKANDWHITE",t))(Qo||{}),Fo=(t=>(t[t.CLASSIC=0]="CLASSIC",t[t.DARK=1]="DARK",t[t.MINIMAL=2]="MINIMAL",t))(Fo||{}),Be=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Be||{}),A=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(A||{});const ri=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),bo=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",rt=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const tr=t=>t.split("").map(e=>e.charCodeAt(0)),ni=t=>[t&255,t>>>8&255],Uo=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Ko=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},yn=new Uint32Array(256).fill(0),oi=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;yn[e]=t}},si=(t,e=0)=>{yn[255]===0&&oi();let r=-1;for(let s=e;s<t.length;s++)r=r>>>8^yn[(r^t[s])&255];return(r^-1)>>>0},Ai=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),qo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")};let Ft;const me=Math.trunc(.0028*1020484);let Pn=me/2,Ln=me/2,kr=me/2,dr=me/2,No=0,Oo=!1,Yo=!1,Mn=!1,Qn=!1,Tr=!1,Wo=!1,xo=!1;const Fn=()=>{Mn=!0},Xo=()=>{Qn=!0},ii=()=>{Tr=!0},Rr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*me/2),Go=t=>{Pn=Rr(t)},Zo=t=>{Ln=Rr(t)},_o=t=>{kr=Rr(t)},Jo=t=>{dr=Rr(t)},bn=()=>{Wo=Oo||Mn,xo=Yo||Qn,E.PB0.isSet=Wo,E.PB1.isSet=xo||Tr,E.PB2.isSet=Tr},Vo=(t,e)=>{e?Oo=t:Yo=t,bn()},ai=t=>{V(49252,128),V(49253,128),V(49254,128),V(49255,128),No=t},yr=t=>{const e=t-No;V(49252,e<Pn?128:0),V(49253,e<Ln?128:0),V(49254,e<kr?128:0),V(49255,e<dr?128:0)};let De,Un,jo=!1;const ci=t=>{Ft=t,jo=!Ft.length||!Ft[0].buttons.length,De=Li(),Un=De.gamepad?De.gamepad:yi},Ho=t=>t>-.01&&t<.01,vo=(t,e)=>{Ho(t)&&(t=0),Ho(e)&&(e=0);const r=Math.sqrt(t*t+e*e),s=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-s,t),s),e=Math.min(Math.max(-s,e),s),t=Math.trunc(me*(t+s)/(2*s)),e=Math.trunc(me*(e+s)/(2*s)),[t,e]},li=t=>{const[e,r]=vo(t[0],t[1]),s=t.length>=6?t[5]:t[3],[a,h]=t.length>=4?vo(t[2],s):[0,0];return[e,r,a,h]},zo=t=>{const e=De.joystick?De.joystick(Ft[t].axes,jo):Ft[t].axes,r=li(e);t===0?(Pn=r[0],Ln=r[1],Mn=!1,Qn=!1,kr=r[2],dr=r[3]):(kr=r[0],dr=r[1],Tr=!1);let s=!1;Ft[t].buttons.forEach((a,h)=>{a&&(Un(h,Ft.length>1,t===1),s=!0)}),s||Un(-1,Ft.length>1,t===1),De.rumble&&De.rumble(),bn()},ui=()=>{Ft&&Ft.length>0&&(zo(0),Ft.length>1&&zo(1))},hi=t=>{switch(t){case 0:N("JL");break;case 1:N("G",200);break;case 2:x("M"),N("O");break;case 3:N("L");break;case 4:N("F");break;case 5:x("P"),N("T");break;case 6:break;case 7:break;case 8:N("Z");break;case 9:{const e=Ts();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:break;case 11:break;case 12:N("L");break;case 13:N("M");break;case 14:N("A");break;case 15:N("D");break;case-1:return}};let we=0,ke=0,de=!1;const Pr=.5,Ii={address:49803,data:[173,0,192],keymap:{},joystick:t=>t[0]<-Pr?(ke=0,we===0||we>2?(we=0,x("A")):we===1&&de?N("W"):we===2&&de&&N("R"),we++,de=!1,t):t[0]>Pr?(we=0,ke===0||ke>2?(ke=0,x("D")):ke===1&&de?N("W"):ke===2&&de&&N("R"),ke++,de=!1,t):t[1]<-Pr?(N("C"),t):t[1]>Pr?(N("S"),t):(de=!0,t),gamepad:hi,rumble:null,setup:null,helptext:`AZTEC
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
`},fi={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:x(" ");break;case 12:x("A");break;case 13:x("Z");break;case 14:x("\b");break;case 15:x("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},gi={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},pi={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{To("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let Kn=14,qn=14;const Ci={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=B(182,!1);Kn<40&&t<Kn&&Tn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Kn=t,t=B(183,!1),qn<40&&t<qn&&Tn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),qn=t},setup:null,helptext:`KARATEKA
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
`},Si=t=>{switch(t){case 0:N("A");break;case 1:N("C",50);break;case 2:N("O");break;case 3:N("T");break;case 4:N("\x1B");break;case 5:N("\r");break;case 6:break;case 7:break;case 8:x("N"),N("'");break;case 9:x("Y"),N("1");break;case 10:break;case 11:break;case 12:break;case 13:N(" ");break;case 14:break;case 15:N("	");break;case-1:return}},oe=.5,Ei={address:768,data:[141,74,3,132],keymap:{},gamepad:Si,joystick:(t,e)=>{if(e)return t;const r=t[0]<-oe?"\b":t[0]>oe?"":"",s=t[1]<-oe?"\v":t[1]>oe?`
`:"";let a=r+s;return a||(a=t[2]<-oe?"L\b":t[2]>oe?"L":"",a||(a=t[3]<-oe?"L\v":t[3]>oe?`L
`:"")),a&&N(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},Bi={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},mi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},Di={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&Tn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},$o=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,wi=t=>{switch(t){case 1:D(109,255);break;case 12:x("A");break;case 13:x("Z");break;case 14:x("\b");break;case 15:x("");break}},Lr=.75,ki=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{D(25025,173),D(25036,64)},helptext:$o},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Lr?"\b":t[0]>Lr?"":t[1]<-Lr?"A":t[1]>Lr?"Z":"";return e&&x(e),t},gamepad:wi,rumble:null,setup:null,helptext:$o}],di={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{KA(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Ti={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Ri={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Fn();break;case 1:Xo();break;case 2:N(" ");break;case 3:N("U");break;case 4:N("\r");break;case 5:N("T");break;case 9:{const e=Ts();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:Fn();break}},rumble:()=>{B(49178,!1)<128&&B(49181,!1)<128&&Tn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(5128,0),D(5130,4);let t=5210;D(t,234),D(t+1,234),D(t+2,234),t=5224,D(t,234),D(t+1,234),D(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},er=new Array,Tt=t=>{Array.isArray(t)?er.push(...t):er.push(t)};Tt(Ii),Tt(fi),Tt(gi),Tt(pi),Tt(Ci),Tt(Ei),Tt(Bi),Tt(mi),Tt(Di),Tt(ki),Tt(di),Tt(Ti),Tt(Ri);const yi=(t,e,r)=>{if(r)switch(t){case 0:ii();break;case 1:break;case 12:Jo(-1);break;case 13:Jo(1);break;case 14:_o(-1);break;case 15:_o(1);break}else switch(t){case 0:Fn();break;case 1:e||Xo();break;case 12:Zo(-1);break;case 13:Zo(1);break;case 14:Go(-1);break;case 15:Go(1);break}},Pi={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},ts=t=>{for(const e of er)if($n(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},Li=()=>{for(const t of er)if($n(t.address,t.data))return t;return Pi},Nn=(t=!1)=>{for(const e of er)if($n(e.address,e.data)){UA(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(UA(" "),KA(0))},Mi=t=>{V(49152,t|128,32)},Qi=()=>{const t=mt(49152)&127;V(49152,t,32)};let Te="",es=1e9;const Fi=()=>{const t=performance.now();if(Te!==""&&(mt(49152)<128||t-es>3800)){es=t;const e=Te.charCodeAt(0);Mi(e),Te=Te.slice(1),Te.length===0&&RA(!0)}};let rs="";const x=t=>{t===rs&&Te.length>0||(rs=t,Te+=t)};let ns=0;const N=(t,e=300)=>{const r=performance.now();r-ns<e||(ns=r,x(t))},bi=t=>{t.length===1&&(t=ts(t)),x(t)},Ui=t=>{t.length===1&&(t=ts(t)),x(t)},qe=[],R=(t,e,r,s=!1,a=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:s,isSet:!1,setFunc:a};return t>=49152&&(qe[t-49152]=h),e>=49152&&(qe[e-49152]=h),r>=49152&&(qe[r-49152]=h),h},Ne=()=>Math.floor(180*Math.random()),os=(t,e)=>{t&=11,e?E.BSR_PREWRITE.isSet=!1:t&1?E.BSR_PREWRITE.isSet?E.BSR_WRITE.isSet=!0:E.BSR_PREWRITE.isSet=!0:(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=!1),E.BSRBANK2.isSet=t<=3,E.BSRREADRAM.isSet=[0,3,8,11].includes(t)},E={STORE80:R(49152,49153,49176,!0),RAMRD:R(49154,49155,49171,!0),RAMWRT:R(49156,49157,49172,!0),INTCXROM:R(49158,49159,49173,!0),INTC8ROM:R(49194,0,0),ALTZP:R(49160,49161,49174,!0),SLOTC3ROM:R(49162,49163,49175,!0),COLUMN80:R(49164,49165,49183,!0),ALTCHARSET:R(49166,49167,49182,!0),KBRDSTROBE:R(49168,0,0,!1),BSRBANK2:R(0,0,49169),BSRREADRAM:R(0,0,49170),VBL:R(0,0,49177),CASSOUT:R(49184,0,0),SPEAKER:R(49200,0,0,!1,(t,e)=>{V(49200,Ne()),w1(e)}),GCSTROBE:R(49216,0,0),EMUBYTE:R(0,0,49231,!1,()=>{V(49231,205)}),TEXT:R(49232,49233,49178),MIXED:R(49234,49235,49179),PAGE2:R(49236,49237,49180),HIRES:R(49238,49239,49181),AN0:R(49240,49241,0),AN1:R(49242,49243,0),AN2:R(49244,49245,0),AN3:R(49246,49247,0),CASSIN1:R(0,0,49248,!1,()=>{V(49248,Ne())}),PB0:R(0,0,49249),PB1:R(0,0,49250),PB2:R(0,0,49251),JOYSTICK0:R(0,0,49252,!1,(t,e)=>{yr(e)}),JOYSTICK1:R(0,0,49253,!1,(t,e)=>{yr(e)}),JOYSTICK2:R(0,0,49254,!1,(t,e)=>{yr(e)}),JOYSTICK3:R(0,0,49255,!1,(t,e)=>{yr(e)}),CASSIN2:R(0,0,49256,!1,()=>{V(49256,Ne())}),FASTCHIP_LOCK:R(49258,0,0),FASTCHIP_ENABLE:R(49259,0,0),FASTCHIP_SPEED:R(49261,0,0),JOYSTICKRESET:R(0,0,49264,!1,(t,e)=>{ai(e),V(49264,Ne())}),BANKSEL:R(49267,0,0),LASER128EX:R(49268,0,0),BSR_PREWRITE:R(49280,0,0),BSR_WRITE:R(49288,0,0)};E.TEXT.isSet=!0;const Ki=[49152,49153,49165,49167,49200,49236,49237,49183],ss=(t,e,r)=>{if(t>1048575&&!Ki.includes(t)){const a=mt(t)>128?1:0;console.log(`${r} $${rt(c.PC)}: $${rt(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){os(t&-5,e);return}const s=qe[t-49152];if(!s){console.error("Unknown softswitch "+rt(t)),V(t,Ne());return}if(t<=49167?e||Fi():(t===49168||t<=49183&&e)&&Qi(),s.setFunc){s.setFunc(t,r);return}if(t===s.offAddr||t===s.onAddr){if((!s.writeOnly||e)&&(Nt[s.offAddr-49152]!==void 0?Nt[s.offAddr-49152]=t===s.onAddr:s.isSet=t===s.onAddr),s.isSetAddr){const a=mt(s.isSetAddr);V(s.isSetAddr,s.isSet?a|128:a&127)}t>=49184&&V(t,Ne())}else if(t===s.isSetAddr){const a=mt(t);V(t,s.isSet?a|128:a&127)}},qi=()=>{for(const t in E){const e=t;Nt[E[e].offAddr-49152]!==void 0?Nt[E[e].offAddr-49152]=!1:E[e].isSet=!1}Nt[E.TEXT.offAddr-49152]!==void 0?Nt[E.TEXT.offAddr-49152]=!0:E.TEXT.isSet=!0},Nt=[],Ni=t=>{if(t>=49280&&t<=49295){os(t&-5,!1);return}const e=qe[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+rt(t));return}Nt[e.offAddr-49152]===void 0&&(Nt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},Oi=()=>{Nt.forEach((t,e)=>{t!==void 0&&(qe[e].isSet=t)}),Nt.length=0},Oe=[],Yi=()=>{if(Oe.length===0)for(const t in E){const e=E[t],r=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const a=rt(e.offAddr)+" "+t;Oe[e.offAddr]=a+(r?"-OFF":"")+s}if(e.onAddr>0){const a=rt(e.onAddr)+" "+t;Oe[e.onAddr]=a+"-ON"+s}if(e.isSetAddr>0){const a=rt(e.isSetAddr)+" "+t;Oe[e.isSetAddr]=a+"-STATUS"+s}}return Oe[49152]="C000 KBRD/STORE80-OFF",Oe},Wi=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAEwTwqQkpSVIIAPOIPTBoABoaQDFI5DwsDSlIoUloACE
JPDkpSJIIAPOpSiFKqUphSukIYhoaQHFI7ANSCADzrEokSqIEPkw4aAAIPTBpSVM
A86pKIUhqRiFI6kXhSXQ76QqTPTBTOvLTJrMpCpMncxMdMxMoMJMsMJM8sIgkMyt
ewWFJI17BEz+zbQA8A/AG/AOIIDNtADwBKn9lQG1AWClN8nD0PNMMsikJLEoSCk/
CUCRKGhgqKUoILrKkEwgFM6gA9nuwtADuaTJiBD1MDogcMhMCsKKKQOFL6UqKY9M
ccog8PyKhTRgrHsFIETOCYBgpCSpoCwewBAGJDIwAqkgTKjMqKUoIAPOKDADTMX+
TMj+iDC6iDCliDCaiDA9iDDiqcJIqQlIrfsEKdbQDZgYaQxIIFDIIP7NaKipwUi5
RMJIYBgi8V91AqhR4ZTo1XtkZ2p1b3hy4Yno1SwfwBAGIHTITArCqIpImEhIaMn/
8ASp/9ACaEhIpCSRKOZO0AqlT+ZPRU8pQNDirQDAEO1oaKQkkShoqq0AwI0QwDDE
IFLBLB/AEAIGIaUljfsFYKn/jfsErV3ArV/ArWLAEANMAMatYcAQGqCwqQCFPKm/
OIU9SKmgkTyIkTxo6QHJAdDvjQvAIInK0AONCsBgiJWKi6QksSgsH8Aw8kwmzgAA
LEPOcBI4kBi4UAwBiEpQVlxMdsNMw8ONewaYSIpICK37BCz4BzAFCQiN+wQgbcMo
cBWQEKoQDSBbzWiqaKitewZsOABMfMhMA8ggbcNMtMkgbcNM1skgbcNM8Mmq8AjK
0AcsAMAQBDhgogMYYKLDjvgHrv/PYEiYSK0TwEitFMBIkAiNAsCNBcCwBo0EwI0D
wKAAsTyRQuZC0ALmQ6U8xT6lPeU/5jzQAuY9kOaNBMBoEAONBcCNAsBoEAONA8Bo
qGhgSK3tA0it7gNIkAiNA8CNBcCwBo0CwI0EwGiN7gNoje0DaHAFjQjAUAONCcBs
7QMAAI2BwEx6/CwVwI0HwNg4MAEYSEhIirro6OjoSJhIvQABKRCorRjALRzAKYDw
BakgjVTAKiwTwBAFjQLACSAsFMAQBY0EwAkQLBLAEAwJDCwRwBACSQaNgcAsFsAQ
DbqOAQGuAAGajQjACYCIMAyFRGioaKpoaGhMR/pIrfgHSKnDSKn0SAhMdPytgcBo
EAeNCcCuAQGaoAYQBr7BxP4AwIgwAwrQ8goKaKi6qUBIqcBIqQZpAEipjUiaimkD
qjjpB50AAeipAZ0AAWiqaGCDi4sFA1UAIBP/hDTdtPnQEyAT/926+fANvbr58AfJ
pPADpDQYiCZE4APQDSCn/6U/8AHohjWiA4iGPcoQyWCQSKkAhT2FP6BQhDzIhD4g
0cUYpXOqyoY+5VBIpXSo6NABiIQ/5VHFbpAC0AI4YIV0hXCFPYXpaIXohXOFb4U8
IJjFqQMg1sUYYKWbZVCFPqWcZVGFP6AEsZsg7+CllIU8pZWFPRhgoEsgecXQ+Wn+
sPWgISB5xcjIiND9kAWgMojQ/awgwKAsymCiCEggmMVoKqA6ytD1YCCbxYitYMBF
LxD4RS+FL8CAYCBnxaAnogBBPEihPCDIxSC6/KAdaJDuoCIgyMXwCKIQCiB0xdD6
YCCYxakWIGfFhS4gmMWgJCCbxbD5IJvFoDsgisWBPEUuhS4guvygNZDwIIrFxS5g
jVDAoASiABh5tMeVAOjQ9xh5tMfVANAQ6ND1aiwZwBACSaWIEOEwBlUAGEzNxoYB
hgKGA6IEhgTmAaiNg8CNg8ClASnwycDQDK2LwK2LwKUBaQ/QAqUBhQOYoAAYfbTH
kQLKEAKiBMjQ8uYB0MzmAaitg8Ctg8ClASnwycDQCa2LwKUBaQ/QAqUBhQOYoAAY
fbTHUQLQNbECyhACogTI0O7mAdDLaiwZwBACSaXGBBCHqiCNydAHDgAMCs0ADNB2
zQAI8HGKjQnATAPGOKqtE8C4EAMstMepoKAGmf6/mQbAiIjQ9o1RwI1UwJkABJkA
BZkABpkAB8jQ8YrwJ6ADsAKgBamqUAONsAW56seZsQWIEPegEIpKqqlYKpm2BYiI
0PPw/qACufDHkAO588eZuAWIEPIw/qABqX9qvrnH8A+QA77Jx53/v8jQ764wwCqI
vtnH8BMw9CqQBx4AwJAXsO4eAMCwEJDnKsg46QGwy4jQC6AJ0MKiAMAKTNfGRoDQ
tamgoACZAASZAAWZAAaZAAfI0PGtYcAtYsAK5v+l/5ADTADGrVHAoAi59seZuAWI
EPcw4FNDKykHAIkxAwUJCwEAg1FTVVcPDQCBMQQGCgwCAIRSVFZYEA4AEf8TFBYX
GAASGhscHR4fANLBzaDa0M3N1cnP1dP58/Tl7aDPywBMsMkg9M4gKsggLs2pAY37
BCCQytAIBiGNAcCNDcCND8AgkMysewVMfsipB4U2qcOFN6kFhTipw4U5YOZO0ALm
T60AwBD1jRDAYAAAAExQw6UljfsFpCTMewTwA4x7BaUhGO17BbAFoACMewWsewVg
pDUYsDiNewaYSIpIsF4gUMitewbJjdAYrgDAEBPgk9APLBDArgDAEPvgg/ADLBDA
KX/JILAGINLKTL3IrXsGIDjOyIx7BcQhkAMgUcut+wQp9437BK17BSwfwBACqQCF
JI17BGiqaKitewZgpCStewaRKCBQyCAmziA7yI17BiAmzqit+wQpCPDLwI3QCK37
BCn3jfsEwJvwEcCV0LesewUgRM4JgI17BtCqILHOIDvIIMTOIBTOKX+gENl8yfAF
iBD4MA+5a8kpfyDWyrlryTDZEKKorfsEwBHQCyBNzamYjXsGTMXIwAXQCCnfjfsE
TObIwATQ+Qkg0PIMHAgKHx0Ln4icihESiIqfnEBBQkNERUZJSktNNDgICgsVLBPA
MBGp7o0FwI0DwI0ADI0ACM0ADGDKy83JAACtewZMVsOpg9ACqYFIIJDK8ARooglg
aI37BI0BwI0NwI0PwCDUziCQzEwfyiDUziA7yCl/jXsGogCt+wQpAvACosOtewZg
KX+qINTOqQgs+wTQMoosLsrwUKx7BSQyEAIJgCBwzsiMewXEIZAIqQCNewUg2Mul
KI17B6UpjfsHIB/OogBgIB/OijjpICz7BjAwjfsFhSUgusqt+waNewWp9y37BI37
BNDMIB/Oiske8AYg1spMH8qpCA37BI37BKn/jfsGTCnKqqUqoAPgivALSpAISkoJ
IIjQ+siI0PJgILf40ALIYK0cwAqpiCwYwI0BwAiNVcCsAASNAAStAASMAAQosAON
VMAwA40AwMmIYEhKKQMJBIUpaCkYkAJpf4UoCgoFKIUoYCwGy1C4jXsHSJhIrHsH
wAWQE7m0y/AOUBIwEI17B637BCko8AM4sAmtewcJgCAHyxhoqGhgSLmZy0hgrfsE
EAUp7437BGCt+wQQ+gkQ0POpQCA0y6DAqQwgNMutMMCI0PVgOEjpAdD8aOkB0PZg
znsFEAulIY17Bc57BSB5y2CpAI17Ba37BDADINjLYKUihSWpAI17BUz+ze57Ba17
BcUhkAMgUctgpSLFJbAexiVM/s2t+wQQAin7oP/QCa37BBACCQSgf437BIQyYAwX
ID8A13OPUIOOAOn7AABM0+o8XpVDapkAeEtLy8sAy0xMy0tLAExMAABNS0tNS0xN
S0wAS6AA8BXmJaUljfsFxSOwA0wDzs77BcYloAGKSIx7B6UhSCwfwBAcjQHASqql
IEq4kAMsBssqRSFKcAOwAcqGIa0fwAimIpjQA6YjyoogA86lKIUqpSmFK617B/Ay
6OQjsDKKIAPOpCEoCBAerVXAmPAHsSiRKojQ+XAEsSiRKq1UwKQhsASxKJEqiBD5
MMHK5CIQzihohSEglswg/s1oqmAgmsylJUgQBiADziCWzOYlpSXFI5DyaIUlTP7N
IF/LTHTMoADwA6x7BaUyKYAJICwfwDAVkSjIxCGQ+WCGKqLYoBSlMimgTNXMhipI
mEg45SGqmEqoaEUgarADEAHIaLALLFXAkSgsVMDo8AaRKMjo0O+mKjhgrfsEME0g
Mc0sH8AQEiCRzZANIJDK0DssH8AwAyDEza17BRhlICwfwDAGySiQAqknjXsFhSSl
JSC6yiwfwBAFIHHN8AMgbc2pACwawDACqRSFImCt+wQJAdAFrfsEKf6N+wRgrfsE
MBogLs0ggM0gZM2p/YU5qRuFOGCp/YU3qfCFNmCpKNACqVCFIakYhSOpAIUihSBg
LB/AEAMg78yNDsCp/437BGCKSKIXjQHAiiC6yqAnhCqYSrADLFXAqLEoLFTApCqR
KIgQ6sowBOQisN2NAMCNDMBM+M2KSKIXiiC6yqAAjQHAsSiEKkiYSrADjVXAqGiR
KI1UwKQqyMAokOYgsMzKMATkIrDTjQ3AIP7NaKpgpSWN+wUgusqlICwfwBABShhl
KIUoYMnhkAbJ+7ACKd9grfsEKRDQEUiYSKx7BSBEzkmAIHDOaKhoYEgkMjACKX8g
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
g39dzLX8Fxf1A/sDYvr6ww==`,xi=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,As=new Array(256),On={},g=(t,e,r,s)=>{console.assert(!As[r],"Duplicate instruction: "+t+" mode="+e),As[r]={name:t,mode:e,bytes:s},On[t]||(On[t]=[]),On[t][e]=r};g("ADC",A.IMM,105,2),g("ADC",A.ZP_REL,101,2),g("ADC",A.ZP_X,117,2),g("ADC",A.ABS,109,3),g("ADC",A.ABS_X,125,3),g("ADC",A.ABS_Y,121,3),g("ADC",A.IND_X,97,2),g("ADC",A.IND_Y,113,2),g("ADC",A.IND,114,2),g("AND",A.IMM,41,2),g("AND",A.ZP_REL,37,2),g("AND",A.ZP_X,53,2),g("AND",A.ABS,45,3),g("AND",A.ABS_X,61,3),g("AND",A.ABS_Y,57,3),g("AND",A.IND_X,33,2),g("AND",A.IND_Y,49,2),g("AND",A.IND,50,2),g("ASL",A.IMPLIED,10,1),g("ASL",A.ZP_REL,6,2),g("ASL",A.ZP_X,22,2),g("ASL",A.ABS,14,3),g("ASL",A.ABS_X,30,3),g("BCC",A.ZP_REL,144,2),g("BCS",A.ZP_REL,176,2),g("BEQ",A.ZP_REL,240,2),g("BIT",A.ZP_REL,36,2),g("BIT",A.ABS,44,3),g("BIT",A.IMM,137,2),g("BIT",A.ZP_X,52,2),g("BIT",A.ABS_X,60,3),g("BMI",A.ZP_REL,48,2),g("BNE",A.ZP_REL,208,2),g("BPL",A.ZP_REL,16,2),g("BVC",A.ZP_REL,80,2),g("BVS",A.ZP_REL,112,2),g("BRA",A.ZP_REL,128,2),g("BRK",A.IMPLIED,0,1),g("CLC",A.IMPLIED,24,1),g("CLD",A.IMPLIED,216,1),g("CLI",A.IMPLIED,88,1),g("CLV",A.IMPLIED,184,1),g("CMP",A.IMM,201,2),g("CMP",A.ZP_REL,197,2),g("CMP",A.ZP_X,213,2),g("CMP",A.ABS,205,3),g("CMP",A.ABS_X,221,3),g("CMP",A.ABS_Y,217,3),g("CMP",A.IND_X,193,2),g("CMP",A.IND_Y,209,2),g("CMP",A.IND,210,2),g("CPX",A.IMM,224,2),g("CPX",A.ZP_REL,228,2),g("CPX",A.ABS,236,3),g("CPY",A.IMM,192,2),g("CPY",A.ZP_REL,196,2),g("CPY",A.ABS,204,3),g("DEC",A.IMPLIED,58,1),g("DEC",A.ZP_REL,198,2),g("DEC",A.ZP_X,214,2),g("DEC",A.ABS,206,3),g("DEC",A.ABS_X,222,3),g("DEX",A.IMPLIED,202,1),g("DEY",A.IMPLIED,136,1),g("EOR",A.IMM,73,2),g("EOR",A.ZP_REL,69,2),g("EOR",A.ZP_X,85,2),g("EOR",A.ABS,77,3),g("EOR",A.ABS_X,93,3),g("EOR",A.ABS_Y,89,3),g("EOR",A.IND_X,65,2),g("EOR",A.IND_Y,81,2),g("EOR",A.IND,82,2),g("INC",A.IMPLIED,26,1),g("INC",A.ZP_REL,230,2),g("INC",A.ZP_X,246,2),g("INC",A.ABS,238,3),g("INC",A.ABS_X,254,3),g("INX",A.IMPLIED,232,1),g("INY",A.IMPLIED,200,1),g("JMP",A.ABS,76,3),g("JMP",A.IND,108,3),g("JMP",A.IND_X,124,3),g("JSR",A.ABS,32,3),g("LDA",A.IMM,169,2),g("LDA",A.ZP_REL,165,2),g("LDA",A.ZP_X,181,2),g("LDA",A.ABS,173,3),g("LDA",A.ABS_X,189,3),g("LDA",A.ABS_Y,185,3),g("LDA",A.IND_X,161,2),g("LDA",A.IND_Y,177,2),g("LDA",A.IND,178,2),g("LDX",A.IMM,162,2),g("LDX",A.ZP_REL,166,2),g("LDX",A.ZP_Y,182,2),g("LDX",A.ABS,174,3),g("LDX",A.ABS_Y,190,3),g("LDY",A.IMM,160,2),g("LDY",A.ZP_REL,164,2),g("LDY",A.ZP_X,180,2),g("LDY",A.ABS,172,3),g("LDY",A.ABS_X,188,3),g("LSR",A.IMPLIED,74,1),g("LSR",A.ZP_REL,70,2),g("LSR",A.ZP_X,86,2),g("LSR",A.ABS,78,3),g("LSR",A.ABS_X,94,3),g("NOP",A.IMPLIED,234,1),g("ORA",A.IMM,9,2),g("ORA",A.ZP_REL,5,2),g("ORA",A.ZP_X,21,2),g("ORA",A.ABS,13,3),g("ORA",A.ABS_X,29,3),g("ORA",A.ABS_Y,25,3),g("ORA",A.IND_X,1,2),g("ORA",A.IND_Y,17,2),g("ORA",A.IND,18,2),g("PHA",A.IMPLIED,72,1),g("PHP",A.IMPLIED,8,1),g("PHX",A.IMPLIED,218,1),g("PHY",A.IMPLIED,90,1),g("PLA",A.IMPLIED,104,1),g("PLP",A.IMPLIED,40,1),g("PLX",A.IMPLIED,250,1),g("PLY",A.IMPLIED,122,1),g("ROL",A.IMPLIED,42,1),g("ROL",A.ZP_REL,38,2),g("ROL",A.ZP_X,54,2),g("ROL",A.ABS,46,3),g("ROL",A.ABS_X,62,3),g("ROR",A.IMPLIED,106,1),g("ROR",A.ZP_REL,102,2),g("ROR",A.ZP_X,118,2),g("ROR",A.ABS,110,3),g("ROR",A.ABS_X,126,3),g("RTI",A.IMPLIED,64,1),g("RTS",A.IMPLIED,96,1),g("SBC",A.IMM,233,2),g("SBC",A.ZP_REL,229,2),g("SBC",A.ZP_X,245,2),g("SBC",A.ABS,237,3),g("SBC",A.ABS_X,253,3),g("SBC",A.ABS_Y,249,3),g("SBC",A.IND_X,225,2),g("SBC",A.IND_Y,241,2),g("SBC",A.IND,242,2),g("SEC",A.IMPLIED,56,1),g("SED",A.IMPLIED,248,1),g("SEI",A.IMPLIED,120,1),g("STA",A.ZP_REL,133,2),g("STA",A.ZP_X,149,2),g("STA",A.ABS,141,3),g("STA",A.ABS_X,157,3),g("STA",A.ABS_Y,153,3),g("STA",A.IND_X,129,2),g("STA",A.IND_Y,145,2),g("STA",A.IND,146,2),g("STX",A.ZP_REL,134,2),g("STX",A.ZP_Y,150,2),g("STX",A.ABS,142,3),g("STY",A.ZP_REL,132,2),g("STY",A.ZP_X,148,2),g("STY",A.ABS,140,3),g("STZ",A.ZP_REL,100,2),g("STZ",A.ZP_X,116,2),g("STZ",A.ABS,156,3),g("STZ",A.ABS_X,158,3),g("TAX",A.IMPLIED,170,1),g("TAY",A.IMPLIED,168,1),g("TSX",A.IMPLIED,186,1),g("TXA",A.IMPLIED,138,1),g("TXS",A.IMPLIED,154,1),g("TYA",A.IMPLIED,152,1),g("TRB",A.ZP_REL,20,2),g("TRB",A.ABS,28,3),g("TSB",A.ZP_REL,4,2),g("TSB",A.ABS,12,3);const Xi=65536,is=65792,as=66048;class Gi{constructor(){T(this,"address");T(this,"watchpoint");T(this,"instruction");T(this,"disabled");T(this,"hidden");T(this,"once");T(this,"memget");T(this,"memset");T(this,"expression1");T(this,"expression2");T(this,"expressionOperator");T(this,"hexvalue");T(this,"hitcount");T(this,"nhits");T(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class cs extends Map{set(e,r){const s=[...this.entries()];s.push([e,r]),s.sort((a,h)=>a[0]-h[0]),super.clear();for(const[a,h]of s)super.set(a,h);return this}}const et={};et[""]={name:"Any",min:0,max:65535},et.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},et.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},et.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},et["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},et["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},et["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},et["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},et["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},et["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(et).map(t=>t.name);let Yn=!1,Wn=!1,Ct=new cs;const Mr=()=>{Yn=!0},Zi=()=>{new cs(Ct).forEach((s,a)=>{s.once&&Ct.delete(a)});const e=Sa();if(e<0||Ct.get(e))return;const r=new Gi;r.address=e,r.once=!0,r.hidden=!0,Ct.set(e,r)},_i=t=>{Ct=t};let ls=!1;const Ji=()=>{ls=!0,et.MAIN.enabled=(t=0)=>t>=53248?!E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?!E.RAMRD.isSet:!E.ALTZP.isSet,et.AUX.enabled=(t=0)=>t>=53248?E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?E.RAMRD.isSet:E.ALTZP.isSet,et.ROM.enabled=()=>!E.BSRREADRAM.isSet,et["MAIN-DXXX-1"].enabled=()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet,et["MAIN-DXXX-2"].enabled=()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet,et["AUX-DXXX-1"].enabled=()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet,et["AUX-DXXX-2"].enabled=()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet,et["CXXX-ROM"].enabled=(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet||!E.SLOTC3ROM.isSet:t>=51200?E.INTCXROM.isSet||E.INTC8ROM.isSet:E.INTCXROM.isSet,et["CXXX-CARD"].enabled=(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet?!1:E.SLOTC3ROM.isSet:t>=51200?!E.INTCXROM.isSet&&!E.INTC8ROM.isSet:!E.INTCXROM.isSet},us=(t,e)=>{ls||Ji();const r=et[t];return!(e<r.min||e>r.max||r.enabled&&!(r!=null&&r.enabled(e)))},hs=(t,e,r)=>{const s=Ct.get(t);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!us(s.memoryBank,t)?!1:r?s.memset:s.memget},rr=(t=0,e=!0)=>{e?c.flagIRQ|=1<<t:c.flagIRQ&=~(1<<t),c.flagIRQ&=255},Vi=(t=!0)=>{c.flagNMI=t===!0},ji=()=>{c.flagIRQ=0,c.flagNMI=!1},xn=[],Is=[],fs=(t,e)=>{xn.push(t),Is.push(e)},Hi=()=>{for(let t=0;t<xn.length;t++)xn[t](Is[t])},gs=t=>{let e=0;switch(t.register){case"$":e=ua(t.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},vi=t=>{const e=gs(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:gs(t.expression2)},ps=()=>{Wn=!0},zi=(t=-1,e=-1)=>{if(Wn)return Wn=!1,!0;if(Ct.size===0||Yn)return!1;const r=Ct.get(c.PC)||Ct.get(-1)||Ct.get(t|Xi)||t>=0&&Ct.get(is)||t>=0&&Ct.get(as);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===is){if(J[t].name!=="???")return!1}else if(r.address===as){if(J[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!vi(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!us(r.memoryBank,c.PC)?!1:(r.once&&Ct.delete(c.PC),!0)},Xn=()=>{let t=0;const e=c.PC,r=B(c.PC,!1),s=J[r],a=s.bytes>1?B(c.PC+1,!1):-1,h=s.bytes>2?B(c.PC+2,!1):0;if(zi(r,(h<<8)+a))return qt(O.PAUSED),-1;Yn=!1;const p=Ds.get(e);if(p&&!E.INTCXROM.isSet&&p(),t=s.execute(a,h),Ps(s.bytes),ir(c.cycleCount+t),Hi(),c.flagNMI&&(c.flagNMI=!1,t=ma(),ir(c.cycleCount+t)),c.flagIRQ){const u=Ba();u>0&&(ir(c.cycleCount+u),t=u)}return t},$i=[197,58,163,92,197,58,163,92],ta=1,Cs=4;class ea{constructor(){T(this,"bits",[]);T(this,"pattern",new Array(64));T(this,"patternIdx",0);T(this,"reset",()=>{this.patternIdx=0});T(this,"checkPattern",e=>{const s=$i[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s});T(this,"calcBits",()=>{const e=W=>{this.bits.push(W&8?1:0),this.bits.push(W&4?1:0),this.bits.push(W&2?1:0),this.bits.push(W&1?1:0)},r=W=>{e(Math.floor(W/10)),e(Math.floor(W%10))},s=new Date,a=s.getFullYear()%100,h=s.getDate(),p=s.getDay()+1,u=s.getMonth()+1,m=s.getHours(),j=s.getMinutes(),P=s.getSeconds(),z=s.getMilliseconds()/10;this.bits=[],r(a),r(u),r(h),r(p),r(m),r(j),r(P),r(z)});T(this,"access",e=>{e&Cs?this.reset():this.checkPattern(e&ta)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});T(this,"read",e=>{let r=-1;return this.bits.length>0?e&Cs&&(r=this.bits.pop()):this.access(e),r})}}const ra=new ea,Ss=320,Es=327,Qr=256*Ss,na=256*Es;let Ot=0;const Gn=ne;let L=new Uint8Array(Gn+(Ot+1)*65536).fill(0);const Zn=()=>mt(49194),Fr=t=>{V(49194,t)},Re=()=>mt(49267),_n=t=>{V(49267,t)},ct=new Array(257).fill(0),Lt=new Array(257).fill(0),Bs=t=>{let e="";switch(t){case"APPLE2EU":e=xi;break;case"APPLE2EE":e=Wi;break}const r=e.replace(/\n/g,""),s=new Uint8Array(Ue.Buffer.from(r,"base64"));t==="APPLE2EU"&&(s[15035]=5),L.set(s,$e)},Jn=t=>{t=Math.max(64,Math.min(8192,t));const e=Ot;if(Ot=Math.floor(t/64)-1,Ot===e)return;Re()>Ot&&(_n(0),Vt());const r=Gn+(Ot+1)*65536;if(Ot<e)L=L.slice(0,r);else{const s=L;L=new Uint8Array(r).fill(255),L.set(s)}},oa=()=>{const t=E.RAMRD.isSet?Ke+Re()*256:0,e=E.RAMWRT.isSet?Ke+Re()*256:0,r=E.PAGE2.isSet?Ke+Re()*256:0,s=E.STORE80.isSet?r:t,a=E.STORE80.isSet?r:e,h=E.STORE80.isSet&&E.HIRES.isSet?r:t,p=E.STORE80.isSet&&E.HIRES.isSet?r:e;for(let u=2;u<256;u++)ct[u]=u+t,Lt[u]=u+e;for(let u=4;u<=7;u++)ct[u]=u+s,Lt[u]=u+a;for(let u=32;u<=63;u++)ct[u]=u+h,Lt[u]=u+p},sa=()=>{const t=E.ALTZP.isSet?Ke+Re()*256:0;if(ct[0]=t,ct[1]=1+t,Lt[0]=t,Lt[1]=1+t,E.BSRREADRAM.isSet){for(let e=208;e<=255;e++)ct[e]=e+t;if(!E.BSRBANK2.isSet)for(let e=208;e<=223;e++)ct[e]=e-16+t}else for(let e=208;e<=255;e++)ct[e]=ze+e-192},Aa=()=>{const t=E.ALTZP.isSet?Ke+Re()*256:0,e=E.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Lt[r]=-1;if(e){for(let r=208;r<=255;r++)Lt[r]=r+t;if(!E.BSRBANK2.isSet)for(let r=208;r<=223;r++)Lt[r]=r-16+t}},ms=t=>E.INTCXROM.isSet?!1:t!==3?!0:E.SLOTC3ROM.isSet,ia=()=>!!(E.INTCXROM.isSet||E.INTC8ROM.isSet),Vn=t=>{if(t<=7){if(E.INTCXROM.isSet)return;t===3&&!E.SLOTC3ROM.isSet&&(E.INTC8ROM.isSet||(E.INTC8ROM.isSet=!0,Fr(255),Vt())),Zn()===0&&(Fr(t),Vt())}else E.INTC8ROM.isSet=!1,Fr(0),Vt()},aa=()=>{ct[192]=ze-192;for(let t=1;t<=7;t++){const e=192+t;ct[e]=t+(ms(t)?Ss-1:ze)}if(ia())for(let t=200;t<=207;t++)ct[t]=ze+t-192;else{const t=Es+8*(Zn()-1);for(let e=0;e<=7;e++){const r=200+e;ct[r]=t+e}}},Vt=()=>{oa(),sa(),Aa(),aa();for(let t=0;t<256;t++)ct[t]=256*ct[t],Lt[t]=256*Lt[t]},Ds=new Map,ws=new Array(8),br=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Vn(r),!ms(r)))return;const s=ws[r];if(s!==void 0){const a=s(t,e);if(a>=0){const h=t>=49408?Qr-256:$e;L[t-49152+h]=a}}},nr=(t,e)=>{ws[t]=e},Ye=(t,e,r=0,s=()=>{})=>{if(L.set(e.slice(0,256),Qr+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,h=na+(t-1)*2048;L.set(e.slice(256,a),h)}r&&Ds.set(r,s)},ca=()=>{L.fill(255,0,65536),L.fill(255,Gn),Fr(0),_n(0),Vt()},la=t=>(t>=49296?br(t):ss(t,!1,c.cycleCount),t>=49232&&Vt(),L[$e+t-49152]),X=(t,e)=>{const r=Qr+(t-1)*256+(e&255);return L[r]},U=(t,e,r)=>{if(r>=0){const s=Qr+(t-1)*256+(e&255);L[s]=r&255}},B=(t,e=!0)=>{let r=0;const s=t>>>8;if(s===192)r=la(t);else if(r=-1,s>=193&&s<=199?(s==195&&!E.SLOTC3ROM.isSet&&(r=ra.read(t)),br(t)):t===53247&&Vn(255),r<0){const a=ct[s];r=L[a+(t&255)]}return e&&hs(t,r,!1)&&ps(),r},ua=t=>{const e=t>>>8,r=ct[e];return L[r+(t&255)]},ha=(t,e)=>{if(t===49265||t===49267){if(e>Ot)return;_n(e)}else t>=49296?br(t,e):ss(t,!0,c.cycleCount);(t<=49167||t>=49232)&&Vt()},D=(t,e)=>{const r=t>>>8;if(r===192)ha(t,e);else{r>=193&&r<=199?br(t,e):t===53247&&Vn(255);const s=Lt[r];if(s<0)return;L[s+(t&255)]=e}hs(t,e,!0)&&ps()},mt=t=>L[$e+t-49152],V=(t,e,r=1)=>{const s=$e+t-49152;L.fill(e,s,s+r)},ks=1024,ds=2048,jn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Hn=(t=!1)=>{let e=0,r=24,s=!1;if(t){if(E.TEXT.isSet||E.HIRES.isSet)return new Uint8Array;r=E.MIXED.isSet?20:24,s=E.COLUMN80.isSet&&!E.AN3.isSet}else{if(!E.TEXT.isSet&&!E.MIXED.isSet)return new Uint8Array;!E.TEXT.isSet&&E.MIXED.isSet&&(e=20),s=E.COLUMN80.isSet}if(s){const a=E.PAGE2.isSet&&!E.STORE80.isSet?ds:ks,h=new Uint8Array(80*(r-e)).fill(160);for(let p=e;p<r;p++){const u=80*(p-e);for(let m=0;m<40;m++)h[u+2*m+1]=L[a+jn[p]+m],h[u+2*m]=L[ne+a+jn[p]+m]}return h}else{const a=E.PAGE2.isSet?ds:ks,h=new Uint8Array(40*(r-e));for(let p=e;p<r;p++){const u=40*(p-e),m=a+jn[p];h.set(L.slice(m,m+40),u)}return h}},Ts=()=>Ue.Buffer.from(Hn().map(t=>t&=127)).toString(),Ia=()=>{if(E.TEXT.isSet||!E.HIRES.isSet)return new Uint8Array;const t=E.COLUMN80.isSet&&!E.AN3.isSet,e=E.MIXED.isSet?160:192;if(t){const r=E.PAGE2.isSet&&!E.STORE80.isSet?16384:8192,s=new Uint8Array(80*e);for(let a=0;a<e;a++){const h=Ai(r,a);for(let p=0;p<40;p++)s[a*80+2*p+1]=L[h+p],s[a*80+2*p]=L[ne+h+p]}return s}else{const r=E.PAGE2.isSet?16384:8192,s=new Uint8Array(40*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);s.set(L.slice(h,h+40),a*40)}return s}},vn=t=>{const e=ct[t>>>8];return L.slice(e,e+512)},zn=(t,e)=>{const r=Lt[t>>>8]+(t&255);L.set(e,r)},$n=(t,e)=>{for(let r=0;r<e.length;r++)if(B(t+r,!1)!==e[r])return!1;return!0},fa=()=>L.slice(0,ne+65536),c=ri(),or=t=>{c.Accum=t},sr=t=>{c.XReg=t},Ar=t=>{c.YReg=t},ir=t=>{c.cycleCount=t},Rs=t=>{ys(),Object.assign(c,t)},ys=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,Yt(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},Ps=t=>{Yt((c.PC+t+65536)%65536)},Yt=t=>{c.PC=t},Ls=t=>{c.PStatus=t|48},Wt=new Array(256).fill(""),ga=()=>Wt.slice(0,256),pa=t=>{Wt.splice(0,t.length,...t)},Ca=()=>{const t=vn(256).slice(0,256),e=new Array;for(let r=255;r>c.StackPtr;r--){let s="$"+rt(t[r]),a=Wt[r];Wt[r].length>3&&r-1>c.StackPtr&&(Wt[r-1]==="JSR"||Wt[r-1]==="BRK"||Wt[r-1]==="IRQ"?(r--,s+=rt(t[r])):a=""),s=(s+"   ").substring(0,6),e.push(rt(256+r,4)+": "+s+a)}return e.join(`
`)},Sa=()=>{const t=vn(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const r=t[e];if(Wt[e].startsWith("JSR")&&e-1>c.StackPtr&&Wt[e-1]==="JSR"){const s=t[e-1]+1;return(r<<8)+s}}return-1},jt=(t,e)=>{Wt[c.StackPtr]=t,D(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},Ht=()=>{c.StackPtr=(c.StackPtr+1)%256;const t=B(256+c.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},Mt=()=>(c.PStatus&1)!==0,F=(t=!0)=>c.PStatus=t?c.PStatus|1:c.PStatus&254,Ms=()=>(c.PStatus&2)!==0,ar=(t=!0)=>c.PStatus=t?c.PStatus|2:c.PStatus&253,Ea=()=>(c.PStatus&4)!==0,to=(t=!0)=>c.PStatus=t?c.PStatus|4:c.PStatus&251,Qs=()=>(c.PStatus&8)!==0,st=()=>Qs()?1:0,eo=(t=!0)=>c.PStatus=t?c.PStatus|8:c.PStatus&247,ro=(t=!0)=>c.PStatus=t?c.PStatus|16:c.PStatus&239,Fs=()=>(c.PStatus&64)!==0,cr=(t=!0)=>c.PStatus=t?c.PStatus|64:c.PStatus&191,bs=()=>(c.PStatus&128)!==0,Us=(t=!0)=>c.PStatus=t?c.PStatus|128:c.PStatus&127,d=t=>{ar(t===0),Us(t>=128)},Q=(t,e)=>(t+e+256)%256,w=(t,e)=>e*256+t,K=(t,e,r)=>(e*256+t+r+65536)%65536,v=(t,e)=>t>>8!==e>>8?1:0,vt=(t,e)=>{if(t){const r=c.PC;return Ps(e>127?e-256:e),3+v(r+2,c.PC+2)}return 2},J=new Array(256),I=(t,e,r,s,a,h=!1)=>{console.assert(!J[r],"Duplicate instruction: "+t+" mode="+e),J[r]={name:t,pcode:r,mode:e,bytes:s,execute:a,is6502:!h}},G=!0,se=(t,e,r)=>{const s=B(t),a=B((t+1)%256),h=K(s,a,c.YReg);e(h);let p=5+v(h,w(s,a));return r&&(p+=st()),p},Ae=(t,e,r)=>{const s=B(t),a=B((t+1)%256),h=w(s,a);e(h);let p=5;return r&&(p+=st()),p},Ks=t=>{let e=(c.Accum&15)+(t&15)+(Mt()?1:0);e>=10&&(e+=6);let r=(c.Accum&240)+(t&240)+e;const s=c.Accum<=127&&t<=127,a=c.Accum>=128&&t>=128;cr((r&255)>=128?s:a),F(r>=160),Mt()&&(r+=96),c.Accum=r&255,d(c.Accum)},Ur=t=>{let e=c.Accum+t+(Mt()?1:0);F(e>=256),e=e%256;const r=c.Accum<=127&&t<=127,s=c.Accum>=128&&t>=128;cr(e>=128?r:s),c.Accum=e,d(c.Accum)},ie=t=>{Qs()?Ks(B(t)):Ur(B(t))};I("ADC",A.IMM,105,2,t=>(st()?Ks(t):Ur(t),2+st())),I("ADC",A.ZP_REL,101,2,t=>(ie(t),3+st())),I("ADC",A.ZP_X,117,2,t=>(ie(Q(t,c.XReg)),4+st())),I("ADC",A.ABS,109,3,(t,e)=>(ie(w(t,e)),4+st())),I("ADC",A.ABS_X,125,3,(t,e)=>{const r=K(t,e,c.XReg);return ie(r),4+st()+v(r,w(t,e))}),I("ADC",A.ABS_Y,121,3,(t,e)=>{const r=K(t,e,c.YReg);return ie(r),4+st()+v(r,w(t,e))}),I("ADC",A.IND_X,97,2,t=>{const e=Q(t,c.XReg);return ie(w(B(e),B(e+1))),6+st()}),I("ADC",A.IND_Y,113,2,t=>se(t,ie,!0)),I("ADC",A.IND,114,2,t=>Ae(t,ie,!0),G);const ae=t=>{c.Accum&=B(t),d(c.Accum)};I("AND",A.IMM,41,2,t=>(c.Accum&=t,d(c.Accum),2)),I("AND",A.ZP_REL,37,2,t=>(ae(t),3)),I("AND",A.ZP_X,53,2,t=>(ae(Q(t,c.XReg)),4)),I("AND",A.ABS,45,3,(t,e)=>(ae(w(t,e)),4)),I("AND",A.ABS_X,61,3,(t,e)=>{const r=K(t,e,c.XReg);return ae(r),4+v(r,w(t,e))}),I("AND",A.ABS_Y,57,3,(t,e)=>{const r=K(t,e,c.YReg);return ae(r),4+v(r,w(t,e))}),I("AND",A.IND_X,33,2,t=>{const e=Q(t,c.XReg);return ae(w(B(e),B(e+1))),6}),I("AND",A.IND_Y,49,2,t=>se(t,ae,!1)),I("AND",A.IND,50,2,t=>Ae(t,ae,!1),G);const Kr=t=>{let e=B(t);B(t),F((e&128)===128),e=(e<<1)%256,D(t,e),d(e)};I("ASL",A.IMPLIED,10,1,()=>(F((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,d(c.Accum),2)),I("ASL",A.ZP_REL,6,2,t=>(Kr(t),5)),I("ASL",A.ZP_X,22,2,t=>(Kr(Q(t,c.XReg)),6)),I("ASL",A.ABS,14,3,(t,e)=>(Kr(w(t,e)),6)),I("ASL",A.ABS_X,30,3,(t,e)=>{const r=K(t,e,c.XReg);return Kr(r),6+v(r,w(t,e))}),I("BCC",A.ZP_REL,144,2,t=>vt(!Mt(),t)),I("BCS",A.ZP_REL,176,2,t=>vt(Mt(),t)),I("BEQ",A.ZP_REL,240,2,t=>vt(Ms(),t)),I("BMI",A.ZP_REL,48,2,t=>vt(bs(),t)),I("BNE",A.ZP_REL,208,2,t=>vt(!Ms(),t)),I("BPL",A.ZP_REL,16,2,t=>vt(!bs(),t)),I("BVC",A.ZP_REL,80,2,t=>vt(!Fs(),t)),I("BVS",A.ZP_REL,112,2,t=>vt(Fs(),t)),I("BRA",A.ZP_REL,128,2,t=>vt(!0,t),G);const qr=t=>{ar((c.Accum&t)===0),Us((t&128)!==0),cr((t&64)!==0)};I("BIT",A.ZP_REL,36,2,t=>(qr(B(t)),3)),I("BIT",A.ABS,44,3,(t,e)=>(qr(B(w(t,e))),4)),I("BIT",A.IMM,137,2,t=>(ar((c.Accum&t)===0),2),G),I("BIT",A.ZP_X,52,2,t=>(qr(B(Q(t,c.XReg))),4),G),I("BIT",A.ABS_X,60,3,(t,e)=>{const r=K(t,e,c.XReg);return qr(B(r)),4+v(r,w(t,e))},G);const no=(t,e,r=0)=>{const s=(c.PC+r)%65536,a=B(e),h=B(e+1);jt(`${t} $`+rt(h)+rt(a),Math.trunc(s/256)),jt(t,s%256),jt("P",c.PStatus),eo(!1),to();const p=K(a,h,t==="BRK"?-1:0);Yt(p)},qs=()=>(ro(),no("BRK",65534,2),7);I("BRK",A.IMPLIED,0,1,qs);const Ba=()=>Ea()?0:(ro(!1),no("IRQ",65534),7),ma=()=>(no("NMI",65530),7);I("CLC",A.IMPLIED,24,1,()=>(F(!1),2)),I("CLD",A.IMPLIED,216,1,()=>(eo(!1),2)),I("CLI",A.IMPLIED,88,1,()=>(to(!1),2)),I("CLV",A.IMPLIED,184,1,()=>(cr(!1),2));const ye=t=>{const e=B(t);F(c.Accum>=e),d((c.Accum-e+256)%256)},Da=t=>{const e=B(t);F(c.Accum>=e),d((c.Accum-e+256)%256)};I("CMP",A.IMM,201,2,t=>(F(c.Accum>=t),d((c.Accum-t+256)%256),2)),I("CMP",A.ZP_REL,197,2,t=>(ye(t),3)),I("CMP",A.ZP_X,213,2,t=>(ye(Q(t,c.XReg)),4)),I("CMP",A.ABS,205,3,(t,e)=>(ye(w(t,e)),4)),I("CMP",A.ABS_X,221,3,(t,e)=>{const r=K(t,e,c.XReg);return Da(r),4+v(r,w(t,e))}),I("CMP",A.ABS_Y,217,3,(t,e)=>{const r=K(t,e,c.YReg);return ye(r),4+v(r,w(t,e))}),I("CMP",A.IND_X,193,2,t=>{const e=Q(t,c.XReg);return ye(w(B(e),B(e+1))),6}),I("CMP",A.IND_Y,209,2,t=>se(t,ye,!1)),I("CMP",A.IND,210,2,t=>Ae(t,ye,!1),G);const Ns=t=>{const e=B(t);F(c.XReg>=e),d((c.XReg-e+256)%256)};I("CPX",A.IMM,224,2,t=>(F(c.XReg>=t),d((c.XReg-t+256)%256),2)),I("CPX",A.ZP_REL,228,2,t=>(Ns(t),3)),I("CPX",A.ABS,236,3,(t,e)=>(Ns(w(t,e)),4));const Os=t=>{const e=B(t);F(c.YReg>=e),d((c.YReg-e+256)%256)};I("CPY",A.IMM,192,2,t=>(F(c.YReg>=t),d((c.YReg-t+256)%256),2)),I("CPY",A.ZP_REL,196,2,t=>(Os(t),3)),I("CPY",A.ABS,204,3,(t,e)=>(Os(w(t,e)),4));const Nr=t=>{const e=Q(B(t),-1);D(t,e),d(e)};I("DEC",A.IMPLIED,58,1,()=>(c.Accum=Q(c.Accum,-1),d(c.Accum),2),G),I("DEC",A.ZP_REL,198,2,t=>(Nr(t),5)),I("DEC",A.ZP_X,214,2,t=>(Nr(Q(t,c.XReg)),6)),I("DEC",A.ABS,206,3,(t,e)=>(Nr(w(t,e)),6)),I("DEC",A.ABS_X,222,3,(t,e)=>{const r=K(t,e,c.XReg);return B(r),Nr(r),7}),I("DEX",A.IMPLIED,202,1,()=>(c.XReg=Q(c.XReg,-1),d(c.XReg),2)),I("DEY",A.IMPLIED,136,1,()=>(c.YReg=Q(c.YReg,-1),d(c.YReg),2));const ce=t=>{c.Accum^=B(t),d(c.Accum)};I("EOR",A.IMM,73,2,t=>(c.Accum^=t,d(c.Accum),2)),I("EOR",A.ZP_REL,69,2,t=>(ce(t),3)),I("EOR",A.ZP_X,85,2,t=>(ce(Q(t,c.XReg)),4)),I("EOR",A.ABS,77,3,(t,e)=>(ce(w(t,e)),4)),I("EOR",A.ABS_X,93,3,(t,e)=>{const r=K(t,e,c.XReg);return ce(r),4+v(r,w(t,e))}),I("EOR",A.ABS_Y,89,3,(t,e)=>{const r=K(t,e,c.YReg);return ce(r),4+v(r,w(t,e))}),I("EOR",A.IND_X,65,2,t=>{const e=Q(t,c.XReg);return ce(w(B(e),B(e+1))),6}),I("EOR",A.IND_Y,81,2,t=>se(t,ce,!1)),I("EOR",A.IND,82,2,t=>Ae(t,ce,!1),G);const Or=t=>{const e=Q(B(t),1);D(t,e),d(e)};I("INC",A.IMPLIED,26,1,()=>(c.Accum=Q(c.Accum,1),d(c.Accum),2),G),I("INC",A.ZP_REL,230,2,t=>(Or(t),5)),I("INC",A.ZP_X,246,2,t=>(Or(Q(t,c.XReg)),6)),I("INC",A.ABS,238,3,(t,e)=>(Or(w(t,e)),6)),I("INC",A.ABS_X,254,3,(t,e)=>{const r=K(t,e,c.XReg);return B(r),Or(r),7}),I("INX",A.IMPLIED,232,1,()=>(c.XReg=Q(c.XReg,1),d(c.XReg),2)),I("INY",A.IMPLIED,200,1,()=>(c.YReg=Q(c.YReg,1),d(c.YReg),2)),I("JMP",A.ABS,76,3,(t,e)=>(Yt(K(t,e,-3)),3)),I("JMP",A.IND,108,3,(t,e)=>{const r=w(t,e);return t=B(r),e=B((r+1)%65536),Yt(K(t,e,-3)),6}),I("JMP",A.IND_X,124,3,(t,e)=>{const r=K(t,e,c.XReg);return t=B(r),e=B((r+1)%65536),Yt(K(t,e,-3)),6},G),I("JSR",A.ABS,32,3,(t,e)=>{const r=(c.PC+2)%65536;return jt("JSR $"+rt(e)+rt(t),Math.trunc(r/256)),jt("JSR",r%256),Yt(K(t,e,-3)),6});const le=t=>{c.Accum=B(t),d(c.Accum)};I("LDA",A.IMM,169,2,t=>(c.Accum=t,d(c.Accum),2)),I("LDA",A.ZP_REL,165,2,t=>(le(t),3)),I("LDA",A.ZP_X,181,2,t=>(le(Q(t,c.XReg)),4)),I("LDA",A.ABS,173,3,(t,e)=>(le(w(t,e)),4)),I("LDA",A.ABS_X,189,3,(t,e)=>{const r=K(t,e,c.XReg);return le(r),4+v(r,w(t,e))}),I("LDA",A.ABS_Y,185,3,(t,e)=>{const r=K(t,e,c.YReg);return le(r),4+v(r,w(t,e))}),I("LDA",A.IND_X,161,2,t=>{const e=Q(t,c.XReg);return le(w(B(e),B((e+1)%256))),6}),I("LDA",A.IND_Y,177,2,t=>se(t,le,!1)),I("LDA",A.IND,178,2,t=>Ae(t,le,!1),G);const Yr=t=>{c.XReg=B(t),d(c.XReg)};I("LDX",A.IMM,162,2,t=>(c.XReg=t,d(c.XReg),2)),I("LDX",A.ZP_REL,166,2,t=>(Yr(t),3)),I("LDX",A.ZP_Y,182,2,t=>(Yr(Q(t,c.YReg)),4)),I("LDX",A.ABS,174,3,(t,e)=>(Yr(w(t,e)),4)),I("LDX",A.ABS_Y,190,3,(t,e)=>{const r=K(t,e,c.YReg);return Yr(r),4+v(r,w(t,e))});const Wr=t=>{c.YReg=B(t),d(c.YReg)};I("LDY",A.IMM,160,2,t=>(c.YReg=t,d(c.YReg),2)),I("LDY",A.ZP_REL,164,2,t=>(Wr(t),3)),I("LDY",A.ZP_X,180,2,t=>(Wr(Q(t,c.XReg)),4)),I("LDY",A.ABS,172,3,(t,e)=>(Wr(w(t,e)),4)),I("LDY",A.ABS_X,188,3,(t,e)=>{const r=K(t,e,c.XReg);return Wr(r),4+v(r,w(t,e))});const xr=t=>{let e=B(t);B(t),F((e&1)===1),e>>=1,D(t,e),d(e)};I("LSR",A.IMPLIED,74,1,()=>(F((c.Accum&1)===1),c.Accum>>=1,d(c.Accum),2)),I("LSR",A.ZP_REL,70,2,t=>(xr(t),5)),I("LSR",A.ZP_X,86,2,t=>(xr(Q(t,c.XReg)),6)),I("LSR",A.ABS,78,3,(t,e)=>(xr(w(t,e)),6)),I("LSR",A.ABS_X,94,3,(t,e)=>{const r=K(t,e,c.XReg);return xr(r),6+v(r,w(t,e))}),I("NOP",A.IMPLIED,234,1,()=>2);const ue=t=>{c.Accum|=B(t),d(c.Accum)};I("ORA",A.IMM,9,2,t=>(c.Accum|=t,d(c.Accum),2)),I("ORA",A.ZP_REL,5,2,t=>(ue(t),3)),I("ORA",A.ZP_X,21,2,t=>(ue(Q(t,c.XReg)),4)),I("ORA",A.ABS,13,3,(t,e)=>(ue(w(t,e)),4)),I("ORA",A.ABS_X,29,3,(t,e)=>{const r=K(t,e,c.XReg);return ue(r),4+v(r,w(t,e))}),I("ORA",A.ABS_Y,25,3,(t,e)=>{const r=K(t,e,c.YReg);return ue(r),4+v(r,w(t,e))}),I("ORA",A.IND_X,1,2,t=>{const e=Q(t,c.XReg);return ue(w(B(e),B(e+1))),6}),I("ORA",A.IND_Y,17,2,t=>se(t,ue,!1)),I("ORA",A.IND,18,2,t=>Ae(t,ue,!1),G),I("PHA",A.IMPLIED,72,1,()=>(jt("PHA",c.Accum),3)),I("PHP",A.IMPLIED,8,1,()=>(jt("PHP",c.PStatus|16),3)),I("PHX",A.IMPLIED,218,1,()=>(jt("PHX",c.XReg),3),G),I("PHY",A.IMPLIED,90,1,()=>(jt("PHY",c.YReg),3),G),I("PLA",A.IMPLIED,104,1,()=>(c.Accum=Ht(),d(c.Accum),4)),I("PLP",A.IMPLIED,40,1,()=>(Ls(Ht()),4)),I("PLX",A.IMPLIED,250,1,()=>(c.XReg=Ht(),d(c.XReg),4),G),I("PLY",A.IMPLIED,122,1,()=>(c.YReg=Ht(),d(c.YReg),4),G);const Xr=t=>{let e=B(t);B(t);const r=Mt()?1:0;F((e&128)===128),e=(e<<1)%256|r,D(t,e),d(e)};I("ROL",A.IMPLIED,42,1,()=>{const t=Mt()?1:0;return F((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|t,d(c.Accum),2}),I("ROL",A.ZP_REL,38,2,t=>(Xr(t),5)),I("ROL",A.ZP_X,54,2,t=>(Xr(Q(t,c.XReg)),6)),I("ROL",A.ABS,46,3,(t,e)=>(Xr(w(t,e)),6)),I("ROL",A.ABS_X,62,3,(t,e)=>{const r=K(t,e,c.XReg);return Xr(r),6+v(r,w(t,e))});const Gr=t=>{let e=B(t);B(t);const r=Mt()?128:0;F((e&1)===1),e=e>>1|r,D(t,e),d(e)};I("ROR",A.IMPLIED,106,1,()=>{const t=Mt()?128:0;return F((c.Accum&1)===1),c.Accum=c.Accum>>1|t,d(c.Accum),2}),I("ROR",A.ZP_REL,102,2,t=>(Gr(t),5)),I("ROR",A.ZP_X,118,2,t=>(Gr(Q(t,c.XReg)),6)),I("ROR",A.ABS,110,3,(t,e)=>(Gr(w(t,e)),6)),I("ROR",A.ABS_X,126,3,(t,e)=>{const r=K(t,e,c.XReg);return Gr(r),6+v(r,w(t,e))}),I("RTI",A.IMPLIED,64,1,()=>(Ls(Ht()),ro(!1),Yt(w(Ht(),Ht())-1),6)),I("RTS",A.IMPLIED,96,1,()=>(Yt(w(Ht(),Ht())),6));const Ys=t=>{const e=255-t;let r=c.Accum+e+(Mt()?1:0);const s=r>=256,a=c.Accum<=127&&e<=127,h=c.Accum>=128&&e>=128;cr(r%256>=128?a:h);const p=(c.Accum&15)-(t&15)+(Mt()?0:-1);r=c.Accum-t+(Mt()?0:-1),r<0&&(r-=96),p<0&&(r-=6),c.Accum=r&255,d(c.Accum),F(s)},he=t=>{st()?Ys(B(t)):Ur(255-B(t))};I("SBC",A.IMM,233,2,t=>(st()?Ys(t):Ur(255-t),2+st())),I("SBC",A.ZP_REL,229,2,t=>(he(t),3+st())),I("SBC",A.ZP_X,245,2,t=>(he(Q(t,c.XReg)),4+st())),I("SBC",A.ABS,237,3,(t,e)=>(he(w(t,e)),4+st())),I("SBC",A.ABS_X,253,3,(t,e)=>{const r=K(t,e,c.XReg);return he(r),4+st()+v(r,w(t,e))}),I("SBC",A.ABS_Y,249,3,(t,e)=>{const r=K(t,e,c.YReg);return he(r),4+st()+v(r,w(t,e))}),I("SBC",A.IND_X,225,2,t=>{const e=Q(t,c.XReg);return he(w(B(e),B(e+1))),6+st()}),I("SBC",A.IND_Y,241,2,t=>se(t,he,!0)),I("SBC",A.IND,242,2,t=>Ae(t,he,!0),G),I("SEC",A.IMPLIED,56,1,()=>(F(),2)),I("SED",A.IMPLIED,248,1,()=>(eo(),2)),I("SEI",A.IMPLIED,120,1,()=>(to(),2)),I("STA",A.ZP_REL,133,2,t=>(D(t,c.Accum),3)),I("STA",A.ZP_X,149,2,t=>(D(Q(t,c.XReg),c.Accum),4)),I("STA",A.ABS,141,3,(t,e)=>(D(w(t,e),c.Accum),4)),I("STA",A.ABS_X,157,3,(t,e)=>{const r=K(t,e,c.XReg);return B(r),D(r,c.Accum),5}),I("STA",A.ABS_Y,153,3,(t,e)=>(D(K(t,e,c.YReg),c.Accum),5)),I("STA",A.IND_X,129,2,t=>{const e=Q(t,c.XReg);return D(w(B(e),B(e+1)),c.Accum),6});const Ws=t=>{D(t,c.Accum)};I("STA",A.IND_Y,145,2,t=>(se(t,Ws,!1),6)),I("STA",A.IND,146,2,t=>Ae(t,Ws,!1),G),I("STX",A.ZP_REL,134,2,t=>(D(t,c.XReg),3)),I("STX",A.ZP_Y,150,2,t=>(D(Q(t,c.YReg),c.XReg),4)),I("STX",A.ABS,142,3,(t,e)=>(D(w(t,e),c.XReg),4)),I("STY",A.ZP_REL,132,2,t=>(D(t,c.YReg),3)),I("STY",A.ZP_X,148,2,t=>(D(Q(t,c.XReg),c.YReg),4)),I("STY",A.ABS,140,3,(t,e)=>(D(w(t,e),c.YReg),4)),I("STZ",A.ZP_REL,100,2,t=>(D(t,0),3),G),I("STZ",A.ZP_X,116,2,t=>(D(Q(t,c.XReg),0),4),G),I("STZ",A.ABS,156,3,(t,e)=>(D(w(t,e),0),4),G),I("STZ",A.ABS_X,158,3,(t,e)=>{const r=K(t,e,c.XReg);return B(r),D(r,0),5},G),I("TAX",A.IMPLIED,170,1,()=>(c.XReg=c.Accum,d(c.XReg),2)),I("TAY",A.IMPLIED,168,1,()=>(c.YReg=c.Accum,d(c.YReg),2)),I("TSX",A.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,d(c.XReg),2)),I("TXA",A.IMPLIED,138,1,()=>(c.Accum=c.XReg,d(c.Accum),2)),I("TXS",A.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),I("TYA",A.IMPLIED,152,1,()=>(c.Accum=c.YReg,d(c.Accum),2));const xs=t=>{const e=B(t);ar((c.Accum&e)===0),D(t,e&~c.Accum)};I("TRB",A.ZP_REL,20,2,t=>(xs(t),5),G),I("TRB",A.ABS,28,3,(t,e)=>(xs(w(t,e)),6),G);const Xs=t=>{const e=B(t);ar((c.Accum&e)===0),D(t,e|c.Accum)};I("TSB",A.ZP_REL,4,2,t=>(Xs(t),5),G),I("TSB",A.ABS,12,3,(t,e)=>(Xs(w(t,e)),6),G);const wa=[2,34,66,98,130,194,226],Qt="???";wa.forEach(t=>{I(Qt,A.IMPLIED,t,2,()=>2),J[t].is6502=!1});for(let t=0;t<=15;t++)I(Qt,A.IMPLIED,3+16*t,1,()=>1),J[3+16*t].is6502=!1,I(Qt,A.IMPLIED,7+16*t,1,()=>1),J[7+16*t].is6502=!1,I(Qt,A.IMPLIED,11+16*t,1,()=>1),J[11+16*t].is6502=!1,I(Qt,A.IMPLIED,15+16*t,1,()=>1),J[15+16*t].is6502=!1;I(Qt,A.IMPLIED,68,2,()=>3),J[68].is6502=!1,I(Qt,A.IMPLIED,84,2,()=>4),J[84].is6502=!1,I(Qt,A.IMPLIED,212,2,()=>4),J[212].is6502=!1,I(Qt,A.IMPLIED,244,2,()=>4),J[244].is6502=!1,I(Qt,A.IMPLIED,92,3,()=>8),J[92].is6502=!1,I(Qt,A.IMPLIED,220,3,()=>4),J[220].is6502=!1,I(Qt,A.IMPLIED,252,3,()=>4),J[252].is6502=!1;for(let t=0;t<256;t++)J[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",A.IMPLIED,t,1,qs));const ka=()=>{const t=new Array(256);for(let e=0;e<256;e++)t[e]={name:J[e].name,mode:J[e].mode,pcode:J[e].pcode,bytes:J[e].bytes,is6502:J[e].is6502};L1(t)},gt=(t,e,r)=>{const s=e&7,a=e>>>3;return t[a]|=r>>>s,s&&(t[a+1]|=r<<8-s),e+8},Zr=(t,e,r)=>(e=gt(t,e,r>>>1|170),e=gt(t,e,r|170),e),oo=(t,e)=>(e=gt(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const da=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),s=[0,2,1,3];for(let h=0;h<84;h++)r[h]=s[t[h]&3]|s[t[h+86]&3]<<2|s[t[h+172]&3]<<4;r[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,r[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Ta=(t,e,r)=>{let s=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)s=oo(a,s);for(let h=0;h<16;h++){s=gt(a,s,213),s=gt(a,s,170),s=gt(a,s,150),s=Zr(a,s,254),s=Zr(a,s,e),s=Zr(a,s,h),s=Zr(a,s,254^e^h),s=gt(a,s,222),s=gt(a,s,170),s=gt(a,s,235);for(let m=0;m<7;m++)s=oo(a,s);s=gt(a,s,213),s=gt(a,s,170),s=gt(a,s,173);const p=h===15?15:h*(r?8:7)%15,u=da(t.slice(p*256,p*256+256));for(let m=0;m<u.length;m++)s=gt(a,s,u[m]);s=gt(a,s,222),s=gt(a,s,170),s=gt(a,s,235);for(let m=0;m<16;m++)s=oo(a,s)}return a},Ra=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const s=new Uint8Array(1536+r*13*512).fill(0);s.set(tr(`WOZ2ÿ
\r
`),0),s.set(tr("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(tr("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(tr("TMAP"),80),s[84]=160,s.fill(255,88,248);let a=0;for(let h=0;h<r;h++)a=88+(h<<2),h>0&&(s[a-1]=h),s[a]=s[a+1]=h;s.set(tr("TRKS"),248),s.set(Uo(1280+r*13*512),252);for(let h=0;h<r;h++){a=256+(h<<3),s.set(ni(3+h*13),a),s[a+2]=13,s.set(Uo(50304),a+4);const p=t.slice(h*16*256,(h+1)*16*256),u=Ta(p,h,e);a=1536+h*13*512,s.set(u,a)}return s},ya=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,m)=>u!==e[m])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,p=si(e,12);if(h!==0&&h!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const m=e[88+u*2];if(m<255){const j=256+8*m,P=e.slice(j,j+8);t.trackStart[u]=512*((P[1]<<8)+P[0]),t.trackNbits[u]=P[4]+(P[5]<<8)+(P[6]<<16)+P[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},Pa=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const h=e[88+a*2];if(h<255){t.trackStart[a]=256+h*6656;const p=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=p[2]+(p[3]<<8),t.maxHalftrack=a}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},La=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return r||s},Ma=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),a=Ra(e,s);return a.length===0?new Uint8Array:(t.filename=Ko(t.filename,"woz"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),a)},Gs=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Qa=(t,e)=>{const r=Gs(e.slice(24,28)),s=Gs(e.slice(28,32));let a="";for(let h=0;h<ei;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Ko(t.filename,"hdv"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),e.slice(r,r+s))},Fa=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(qo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return Qa(t,e)}return La(t.filename)&&(e=Ma(t,e)),ya(t,e)||Pa(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},ba=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let We=0,nt=0,St=0,_r=!1,so=!1;const Zs=t=>{_r=!1,zs(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},Ua=(t=!1)=>{if(t){const e=vr();e.motorRunning&&$s(e)}else je(Be.MOTOR_OFF)},_s=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(je(Be.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):je(Be.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,Rt(),St+=r,t.trackLocation+=Math.floor(St/4),St=St%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let Js=0;const Ka=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],Vs=()=>(Js++,Ka[Js&31]);let Jr=0;const qa=t=>(Jr<<=1,Jr|=t,Jr&=15,Jr===0?Vs():t),js=[128,64,32,16,8,4,2,1],Na=[127,191,223,239,247,251,253,254],Vr=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[s],h=t.trackLocation&7;r=(a&js[h])>>7-h,r=qa(r)}else r=Vs();return t.trackLocation++,r},Oa=()=>Math.floor(256*Math.random()),Hs=(t,e,r)=>{if(e.length===0)return Oa();let s=0;if(t.isSynchronized){for(St+=r;St>=4;){const a=Vr(t,e);if((nt>0||a)&&(nt=nt<<1|a),St-=4,nt&128&&St<=6)break}St<0&&(St=0),nt&=255}else if(nt===0){for(;Vr(t,e)===0;);nt=64;for(let a=5;a>=0;a--)nt|=Vr(t,e)<<a}else{const a=Vr(t,e);nt=nt<<1|a}return s=nt,nt>127&&(nt=0),s};let zt=0;const Ao=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[s];const h=t.trackLocation&7;r?a|=js[h]:a&=Na[h],e[s]=a}t.trackLocation++},vs=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&nt>0){if(r>=16)for(let s=7;s>=0;s--)Ao(t,e,nt&2**s?1:0);r>=36&&Ao(t,e,0),r>=40&&Ao(t,e,0),io.push(r>=40?2:r>=36?1:nt),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),nt=0}},zs=t=>{We=0,_r||(t.motorRunning=!1),Rt(),je(Be.MOTOR_OFF)},$s=t=>{We?(clearTimeout(We),We=0):St=0,t.motorRunning=!0,Rt(),je(Be.MOTOR_ON)},Ya=t=>{We===0&&(We=setTimeout(()=>zs(t),1e3))};let io=[];const jr=t=>{io.length>0&&t.halftrack===2*0&&(io=[])},Hr=[0,0,0,0],Wa=(t,e)=>{if(t>=49408)return-1;let r=vr();const s=Ga();if(r.hardDrive)return 0;let a=0;const h=c.cycleCount-zt;switch(t=t&15,t){case 9:_r=!0,$s(r),jr(r);break;case 8:r.motorRunning&&!r.writeMode&&(a=Hs(r,s,h),zt=c.cycleCount),_r=!1,Ya(r),jr(r);break;case 10:case 11:{const p=t===10?2:3,u=vr();Xa(p),r=vr(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,Rt());break}case 12:so=!1,r.motorRunning&&!r.writeMode&&(a=Hs(r,s,h),zt=c.cycleCount);break;case 13:so=!0,r.motorRunning&&(r.writeMode?(vs(r,s,h),zt=c.cycleCount):(nt=0,St+=h,r.trackLocation+=Math.floor(St/4),St=St%4,zt=c.cycleCount),e>=0&&(nt=e));break;case 14:r.motorRunning&&r.writeMode&&(vs(r,s,h),r.lastWriteTime=Date.now(),zt=c.cycleCount),r.writeMode=!1,so&&(a=r.isWriteProtected?255:0),jr(r);break;case 15:r.writeMode=!0,zt=c.cycleCount,e>=0&&(nt=e);break;default:{if(t<0||t>7)break;Hr[Math.floor(t/2)]=t%2;const p=Hr[(r.currentPhase+1)%4],u=Hr[(r.currentPhase+3)%4];Hr[r.currentPhase]||(r.motorRunning&&p?(_s(r,1,h),r.currentPhase=(r.currentPhase+1)%4,zt=c.cycleCount):r.motorRunning&&u&&(_s(r,-1,h),r.currentPhase=(r.currentPhase+3)%4,zt=c.cycleCount)),jr(r);break}}return a},xa=()=>{Ye(6,Uint8Array.from(ba)),nr(6,Wa)},$t=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0,lastLocalWriteTime:-1,cloudData:null,writableFileHandle:null,lastWriteTime:-1}),tA=()=>{y[0]=$t(0,1,!0),y[1]=$t(1,2,!0),y[2]=$t(2,1,!1),y[3]=$t(3,2,!1);for(let t=0;t<y.length;t++)te[t]=new Uint8Array},y=[],te=[];tA();let Pe=2;const Xa=t=>{Pe=t},vr=()=>y[Pe],Ga=()=>te[Pe],ao=t=>y[t==2?1:0],zr=t=>te[t==2?1:0],Rt=()=>{for(let t=0;t<y.length;t++){const e={index:t,hardDrive:y[t].hardDrive,drive:y[t].drive,filename:y[t].filename,status:y[t].status,motorRunning:y[t].motorRunning,diskHasChanges:y[t].diskHasChanges,isWriteProtected:y[t].isWriteProtected,diskData:y[t].diskHasChanges?te[t]:new Uint8Array,lastWriteTime:y[t].lastWriteTime,lastLocalWriteTime:y[t].lastLocalWriteTime,cloudData:y[t].cloudData,writableFileHandle:y[t].writableFileHandle};k1(e)}},Za=t=>{const e=["","",""];for(let s=0;s<y.length;s++)(t||te[s].length<32e6)&&(e[s]=Ue.Buffer.from(te[s]).toString("base64"));const r={currentDrive:Pe,driveState:[$t(0,1,!0),$t(1,2,!0),$t(2,1,!1),$t(3,2,!1)],driveData:e};for(let s=0;s<y.length;s++)r.driveState[s]={...y[s]};return r},_a=t=>{je(Be.MOTOR_OFF),Pe=t.currentDrive,t.driveState.length===3&&Pe>0&&Pe++,tA();let e=0;for(let r=0;r<t.driveState.length;r++)y[e]={...t.driveState[r]},t.driveData[r]!==""&&(te[e]=new Uint8Array(Ue.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;Rt()},Ja=()=>{Zs(y[1]),Zs(y[2]),Rt()},eA=(t=!1)=>{Ua(t),Rt()},Va=(t,e=!1)=>{let r=t.index,s=t.drive,a=t.hardDrive;e||t.filename!==""&&(qo(t.filename)?(a=!0,r=t.drive<=1?0:1,s=r+1):(a=!1,r=t.drive<=1?2:3,s=r-1)),y[r]=$t(r,s,a),y[r].filename=t.filename,y[r].motorRunning=t.motorRunning,te[r]=Fa(y[r],t.diskData),te[r].length===0&&(y[r].filename=""),y[r].cloudData=t.cloudData,y[r].writableFileHandle=t.writableFileHandle,y[r].lastLocalWriteTime=t.lastLocalWriteTime,Rt()},ja=t=>{const e=t.index;y[e].filename=t.filename,y[e].motorRunning=t.motorRunning,y[e].isWriteProtected=t.isWriteProtected,y[e].diskHasChanges=t.diskHasChanges,y[e].lastWriteTime=t.lastWriteTime,y[e].lastLocalWriteTime=t.lastLocalWriteTime,y[e].cloudData=t.cloudData,y[e].writableFileHandle=t.writableFileHandle,Rt()},yt={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},lr={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Le={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Ha{constructor(e){T(this,"_control");T(this,"_status");T(this,"_command");T(this,"_lastRead");T(this,"_lastConfig");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._control=lr.HW_RESET,this._command=Le.HW_RESET,this._status=yt.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=yt.OVRN;this._status|=yt.RX_FULL,this._control&Le.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&Le.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(yt.PE|yt.FE|yt.OVRN),this._receiveBuffer.length?(this._status|=yt.RX_FULL,this._control&Le.RX_INT_DIS||this.irq(!0)):this._status&=~yt.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&yt.IRQ&&this.irq(!1),this._status&=~yt.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=yt.IRQ:this._status&=~yt.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&lr.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&lr.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&lr.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Le.PARITY_EN)switch(this._command&Le.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=lr.HW_RESET,this._command=Le.HW_RESET,this._status=yt.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const co=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let $r=1,Pt;const va=t=>{rr($r,t)},za=t=>{console.log("ConfigChange: ",t)},$a=t=>{Pt&&Pt.buffer(t)},tc=()=>{Pt&&Pt.reset()},ec=(t=!0,e=1)=>{if(!t)return;$r=e;const r={sendData:T1,interrupt:va,configChange:za};Pt=new Ha(r);const s=new Uint8Array(co.length+256);s.set(co.slice(1792,2048)),s.set(co,256),Ye($r,s),nr($r,rc)},rc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Pt.data=e;else return Pt.data;break;case r.STATUS:if(e>=0)Pt.status=e;else return Pt.status;break;case r.COMMAND:if(e>=0)Pt.command=e;else return Pt.command;break;case r.CONTROL:if(e>=0)Pt.control=e;else return Pt.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},ur=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const nc=()=>{const t=new Date,e=ur(t.getMonth()+1,2)+","+ur(t.getDay(),2)+","+ur(t.getDate(),2)+","+ur(t.getHours(),2)+","+ur(t.getMinutes(),2);for(let r=0;r<e.length;r++)D(512+r,e.charCodeAt(r)|128)};let tn=!1;const rA=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},nA=t=>{let e=A.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=A.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=A.IND_Y:t.endsWith(",X)")?e=A.IND_X:e=A.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?A.ABS_X:A.ZP_X:t.endsWith(",Y")?e=t.length>5?A.ABS_Y:A.ZP_Y:e=t.length>3?A.ABS:A.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const s=rA(t);if(s.operation&&s.value){switch(s.operation){case"+":r+=s.value;break;case"-":r-=s.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let Me={};const oA=(t,e,r,s)=>{let a=A.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(Me).forEach(([u,m])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+rt(m))}),nA(r);const p=rA(r);if(p.label){const u=p.label.startsWith("<"),m=p.label.startsWith(">"),j=p.label.startsWith("#")||m||u;if(j&&(p.label=p.label.substring(1)),p.label in Me?(h=Me[p.label],m?h=h>>8&255:u&&(h=h&255)):s===2&&console.error("Missing label: "+p.label),p.operation&&p.value){switch(p.operation){case"+":h+=p.value;break;case"-":h-=p.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}bo(e)?(a=A.ZP_REL,h=h-t+254,h>255&&(h-=256)):j?a=A.IMM:(a=h>=0&&h<=255?A.ZP_REL:A.ABS,a=p.idx==="X"?a===A.ABS?A.ABS_X:A.ZP_X:a,a=p.idx==="Y"?a===A.ABS?A.ABS_Y:A.ZP_Y:a)}return[a,h]},oc=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},sc=(t,e)=>{if(t.label in Me&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,s]=oA(e,t.instr,t.operand,2);r!==A.ABS&&r!==A.ZP_REL&&console.error("Illegal EQU value: "+t.operand),Me[t.label]=s}else Me[t.label]=e},Ac=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,s=0;r.startsWith('"')&&r.endsWith('"')?s=128:r.startsWith("'")&&r.endsWith("'")?s=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let a=0;a<r.length;a++)e.push(r.charCodeAt(a)|s);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(a=>{const h=parseInt(a,16);isNaN(h)&&console.error(`Invalid HEX value: ${a} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},ic=(t,e)=>{const r=[],s=J[t];return r.push(t),e>=0&&(r.push(e%256),s.bytes===3&&r.push(Math.trunc(e/256))),r};let lo=0;const sA=(t,e)=>{let r=lo;const s=[];let a="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let p=(h+"                   ").slice(0,30)+rt(r,4)+"- ";const u=oc(h,a);if(a="",!u.instr){a=u.label;return}if(u.instr==="ORG"){if(e===1){const[W,k]=nA(u.operand);W===A.ABS&&(lo=k,r=k)}tn&&e===2&&console.log(p);return}if(e===1&&u.label&&sc(u,r),u.instr==="EQU")return;let m=[],j,P;if(["ASC","DA","HEX"].includes(u.instr))m=Ac(u),r+=m.length;else if([j,P]=oA(r,u.instr,u.operand,e),e===2&&isNaN(P)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")m.push(P&255),r++;else if(u.instr==="DW")m.push(P&255),m.push(P>>8&255),r+=2;else if(u.instr==="DS")for(let W=0;W<P;W++)m.push(0),r++;else{e===2&&bo(u.instr)&&(P<0||P>255)&&console.error(`Branch instruction out of range: ${h} value: ${P} pass: ${e}`);const W=J.findIndex(k=>k&&k.name===u.instr&&k.mode===j);W<0&&console.error(`Unknown instruction: "${h}" mode=${j} pass=${e}`),m=ic(W,P),r+=J[W].bytes}tn&&e===2&&(m.forEach(W=>{p+=` ${rt(W)}`}),console.log(p)),s.push(...m)}),tn&&e===2){let h="";s.forEach(p=>{h+=` ${rt(p)}`}),console.log(h)}return s},en=(t,e,r=!1)=>{Me={},tn=r;try{return lo=t,sA(e,1),sA(e,2)}catch(s){return console.error(s),[]}},ac=`
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
;
Cx12    db <SETMOUSE          ; $39
Cx13    db <SERVEMOUSE        ; $47
Cx14    db <READMOUSE         ; $C7
Cx15    db <CLEARMOUSE        ; $D7
Cx16    db <POSMOUSE          ; $BB
Cx17    db <CLAMPMOUSE        ; $A3
Cx18    db <HOMEMOUSE         ; $DF
Cx19    db <INITMOUSE         ; $E6
Cx1a    db <GETCLAMP          ; $26
Cx1b    db <UNDOCUMENTED      ; $22 applemouse has methods here
Cx1c    db <TIMEDATA          ; $24
Cx1d    db <UNDOCUMENTED      ; $22 not sure if some will call them 
Cx1e    db <UNDOCUMENTED      ; $22
Cx1f    db <UNDOCUMENTED      ; $22
;
; All methods (except SERVEMOUSE) entered with X = Cn, Y = n0
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

LOWX   EQU $C081 ; + $s0        Low byte of absolute X position
HIGHX  EQU $C082 ; + $s0        High byte of absolute X position
LOWY   EQU $C083 ; + $s0        Low byte of absolute Y position
HIGHY  EQU $C084 ; + $s0        High byte of absolute Y position
BUTTON EQU $C085 ; + $s0        Button 0/1 interrupt status byte
MODE   EQU $C086 ; + $s0        Mode byte
CLAMP  EQU $C087 ; + $s0        Clamp value

CMD    EQU $C08A ; + $s0         Command reg
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

UNDOCUMENTED        ; $Cn22
    sec
    rts
                    ; Technote #2
TIMEDATA            ; $Cn24, A bit 0: 1 - 50hz, 0 = 60hz VBL
    clc
    rts
                    ; Technote #7
                    ; Return 8 clamping bytes one at a time to $578
GETCLAMP            ; $Cn26
    lda $478        ; index byte, starting at $4E according to technote
    sta CLAMP,y     ; indicates which byte in the order we want
    lda #GCLAMP
    sta CMD,y
    lda CLAMP,y
    sta $578
    clc             ; In this order: minXH, minYH, minXL, minYL
    rts             ;                maxXH, maxYH, maxXL, maxYL

SETMOUSE            ; $C039
    cmp #$10
    bcs return      ; invalid
    sta MODE,y      ; set mode
    lda MODE,y      ; reread to ensure valid
    sta SMODE,x
return 
    rts

SERVEMOUSE          ; $Cn47
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

CLAMPMOUSE          ; $CnA3
    and #$1
    sta STEMPA,x
    phx
    phx
    ldx #$c0        ; note load from screen hole 0, not slot

    lda <cmcont-1
    pha
    bra copyin

cmcont 
    plx
    lda #CLAMPX     ; A = 1 for Y
    ora STEMPA,x
    sta CMD,y
    rts

POSMOUSE            ; $CnBB
    phx
    lda <pmcont-1
    pha
    bra copyin

pmcont 
    lda #POS
    sta CMD,y
    rts

READMOUSE           ; $CnC7
    lda #READ
    sta CMD,y

    lda BUTTON,y
    and #$F1        ; mask off interrupts
    sta SBUTTON,x
    clc
    bra copyout

CLEARMOUSE          ; $CnD7
    lda #CLEAR
    sta CMD,y
    clc
    bra copyout

HOMEMOUSE           ; $CnDF
    lda #HOME
    sta CMD,y
    clc
    rts

INITMOUSE           ; $CnE6
    lda #INIT
    sta CMD,y
    lda MODE,y
    sta SMODE,x
    bra READMOUSE   ; Ends at $CnF2

    ; should leave about 13 bytes
`;let Qe=49286,rn=49289,nn=49291,on=49292,sn=49293,An=49294,an=49295;const AA=(t,e,r,s,a)=>{const h=t&255,p=t>>8&3,u=e&255,m=e>>8&3;V(r,h),V(s,p<<4|m),V(a,u)},iA=(t,e,r)=>{const s=mt(t),a=mt(e),h=mt(r),p=a>>4&3,u=a&3;return[s|p<<8,h|u<<8]},cn=()=>iA(rn,nn,on),uo=()=>iA(sn,An,an),ln=(t,e)=>{AA(t,e,rn,nn,on)},un=(t,e)=>{AA(t,e,sn,An,an)},hn=t=>{V(Qe,t),qA(!t)},cc=()=>{bt=0,Ut=0,ln(0,1023),un(0,1023),hn(0),lt=0,Ie=0,xe=0,hr=0,Ir=0,Dt=0,xt=0,Xe=0,In=0};let bt=0,Ut=0,In=0,lt=0,Ie=0,xe=0,hr=0,Ir=0,Dt=0,xt=0,Xe=0,aA=0,ht=5;const fn=54,gn=55,lc=56,uc=57,cA=()=>{const t=new Uint8Array(256).fill(0),e=en(0,ac.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},hc=(t=!0,e=5)=>{if(!t)return;ht=e;const r=49152+ht*256,s=49152+ht*256+8;Ye(ht,cA(),r,gc),Ye(ht,cA(),s,nc),nr(ht,Sc),Qe=49280+(Qe&15)+ht*16,rn=49280+(rn&15)+ht*16,nn=49280+(nn&15)+ht*16,on=49280+(on&15)+ht*16,sn=49280+(sn&15)+ht*16,An=49280+(An&15)+ht*16,an=49280+(an&15)+ht*16;const[a,h]=cn();a===0&&h===0&&(ln(0,1023),un(0,1023)),mt(Qe)!==0&&qA(!1)},Ic=()=>{const t=mt(Qe);if(t&1){let e=!1;t&8&&(Xe|=8,e=!0),t&Ie&4&&(Xe|=4,e=!0),t&Ie&2&&(Xe|=2,e=!0),e&&rr(ht,!0)}},fc=t=>{if(mt(Qe)&1)if(t.buttons>=0){switch(t.buttons){case 0:lt&=-129;break;case 16:lt|=128;break;case 1:lt&=-17;break;case 17:lt|=16;break}Ie|=lt&128?4:0}else{if(t.x>=0&&t.x<=1){const[r,s]=cn();bt=Math.round((s-r)*t.x+r),Ie|=2}if(t.y>=0&&t.y<=1){const[r,s]=uo();Ut=Math.round((s-r)*t.y+r),Ie|=2}}};let fr=0,ho="",lA=0,uA=0;const gc=()=>{const t=192+ht;B(gn)===t&&B(fn)===0?Cc():B(uc)===t&&B(lc)===0&&pc()},pc=()=>{if(fr===0){const t=192+ht;lA=B(gn),uA=B(fn),D(gn,t),D(fn,3);const e=(lt&128)!==(xe&128);let r=0;lt&128?r=e?2:1:r=e?3:4,B(49152)&128&&(r=-r),xe=lt,ho=bt.toString()+","+Ut.toString()+","+r.toString()}fr>=ho.length?(c.Accum=141,fr=0,D(gn,lA),D(fn,uA)):(c.Accum=ho.charCodeAt(fr)|128,fr++)},Cc=()=>{switch(c.Accum){case 128:console.log("mouse off"),hn(0);break;case 129:console.log("mouse on"),hn(1);break}},Sc=(t,e)=>{if(t>=49408)return-1;const r=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(r)return bt&255;Dt=Dt&65280|e,Dt&=65535;break;case s.HIGHX:if(r)return bt>>8&255;Dt=e<<8|Dt&255,Dt&=65535;break;case s.LOWY:if(r)return Ut&255;xt=xt&65280|e,xt&=65535;break;case s.HIGHY:if(r)return Ut>>8&255;xt=e<<8|xt&255,xt&=65535;break;case s.STATUS:return lt;case s.MODE:if(r)return mt(Qe);hn(e);break;case s.CLAMP:if(r){const[h,p]=cn(),[u,m]=uo();switch(In){case 0:return h>>8&255;case 1:return u>>8&255;case 2:return h&255;case 3:return u&255;case 4:return p>>8&255;case 5:return m>>8&255;case 6:return p&255;case 7:return m&255;default:return console.log("AppleMouse: invalid clamp index: "+In),0}}In=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(r)return aA;switch(aA=e,e){case a.INIT:console.log("cmd.init"),bt=0,Ut=0,hr=0,Ir=0,ln(0,1023),un(0,1023),lt=0,Ie=0;break;case a.READ:Ie=0,lt&=-112,lt|=xe>>1&64,lt|=xe>>4&1,xe=lt,(hr!==bt||Ir!==Ut)&&(lt|=32,hr=bt,Ir=Ut);break;case a.CLEAR:console.log("cmd.clear"),bt=0,Ut=0,hr=0,Ir=0;break;case a.SERVE:lt&=-15,lt|=Xe,Xe=0,rr(ht,!1);break;case a.HOME:{const[h]=cn(),[p]=uo();bt=h,Ut=p}break;case a.CLAMPX:{const h=Dt>32767?Dt-65536:Dt,p=xt;ln(h,p),console.log(h+" -> "+p)}break;case a.CLAMPY:{const h=Dt>32767?Dt-65536:Dt,p=xt;un(h,p),console.log(h+" -> "+p)}break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:bt=Dt,Ut=xt;break}break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return e},Kt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},ee={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class Ec{constructor(e){T(this,"_control");T(this,"_status");T(this,"_lastRead");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=Kt.OVRN;this._status|=Kt.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(ee.TX_INT_ENABLE|ee.NRTS))===ee.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Kt.FE|Kt.OVRN|Kt.PE),this._receiveBuffer.length?(this._status|=Kt.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~Kt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(ee.COUNTER_DIV1|ee.COUNTER_DIV2))===(ee.COUNTER_DIV1|ee.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Kt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Kt.IRQ:this._status&=~Kt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Kt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const Xt={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Io={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class fo{constructor(){T(this,"_latch");T(this,"_count");T(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&Xt.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Xt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class Bc{constructor(e){T(this,"_timer");T(this,"_status");T(this,"_statusRead");T(this,"_msb");T(this,"_lsb");T(this,"_div8");T(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new fo,new fo,new fo],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Xt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const s=this._timer[0].control&Xt.SPECIAL,a=this._msb*256+r;this._timer[e].latch=a,s&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const s=this._timer[0].control&Xt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),s>>8&255}update(e){const r=this._timer[0].control&Xt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let s=!1;for(let a=0;a<3;a++){let h=e;if(a==2&&this._timer[2].control&Xt.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),s=this._timer[a].decrement(h),s){const p=this._timer[a].control;switch(p&Xt.IRQ_ENABLE&&this.irq(a,!0),p&Xt.COUNTER_MODE){case 0:case 16:this._timer[a].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Xt.SPECIAL}irq(e,r){const s=1<<e|Io.ANY_IRQ;r?this._status|=s:this._status&=~s,this._status?(this._status|=Io.ANY_IRQ,this._interrupt(!0)):(this._status&=~Io.ANY_IRQ,this._interrupt(!1))}}let pn=2,At,fe,go=0;const mc=t=>{if(go){const e=c.cycleCount-go;At.update(e)}go=c.cycleCount},hA=t=>{rr(pn,t)},Dc=t=>{fe&&fe.buffer(t)},wc=(t=!0,e=2)=>{if(!t)return;pn=e,At=new Bc(hA);const r={sendData:R1,interrupt:hA};fe=new Ec(r),nr(pn,dc),fs(mc,pn)},kc=()=>{At&&(At.reset(),fe.reset())},dc=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?fe.data=e:s=fe.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?fe.control=e:s=fe.status;break;case r.TCONTROL1:e>=0?At.timerControl(0,e):s=0;break;case r.TCONTROL2:e>=0?At.timerControl(1,e):s=At.status();break;case r.T1MSB:e>=0?At.timerMSBw(0,e):s=At.timerMSBr(0);break;case r.T1LSB:e>=0?At.timerLSBw(0,e):s=At.timerLSBr(0);break;case r.T2MSB:e>=0?At.timerMSBw(1,e):s=At.timerMSBr(1);break;case r.T2LSB:e>=0?At.timerLSBw(1,e):s=At.timerLSBr(1);break;case r.T3MSB:e>=0?At.timerMSBw(2,e):s=At.timerMSBr(2);break;case r.T3LSB:e>=0?At.timerLSBw(2,e):s=At.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return s},Tc=(t=!0,e=4)=>{t&&(nr(e,Xc),fs(Nc,e))},po=[0,128],Co=[1,129],Rc=[2,130],yc=[3,131],Ge=[4,132],Ze=[5,133],Cn=[6,134],So=[7,135],gr=[8,136],pr=[9,137],Pc=[10,138],Eo=[11,139],Lc=[12,140],Fe=[13,141],Cr=[14,142],IA=[16,145],fA=[17,145],Gt=[18,146],Bo=[32,160],re=64,ge=32,Mc=(t=4)=>{for(let e=0;e<=255;e++)U(t,e,0);for(let e=0;e<=1;e++)mo(t,e)},Qc=(t,e)=>(X(t,Cr[e])&re)!==0,Fc=(t,e)=>(X(t,Gt[e])&re)!==0,gA=(t,e)=>(X(t,Eo[e])&re)!==0,bc=(t,e,r)=>{let s=X(t,Ge[e])-r;if(U(t,Ge[e],s),s<0){s=s%256+256,U(t,Ge[e],s);let a=X(t,Ze[e]);if(a--,U(t,Ze[e],a),a<0&&(a+=256,U(t,Ze[e],a),Qc(t,e)&&(!Fc(t,e)||gA(t,e)))){const h=X(t,Gt[e]);U(t,Gt[e],h|re);const p=X(t,Fe[e]);if(U(t,Fe[e],p|re),pe(t,e,-1),gA(t,e)){const u=X(t,So[e]),m=X(t,Cn[e]);U(t,Ge[e],m),U(t,Ze[e],u)}}}},Uc=(t,e)=>(X(t,Cr[e])&ge)!==0,Kc=(t,e)=>(X(t,Gt[e])&ge)!==0,qc=(t,e,r)=>{if(X(t,Eo[e])&ge)return;let s=X(t,gr[e])-r;if(U(t,gr[e],s),s<0){s=s%256+256,U(t,gr[e],s);let a=X(t,pr[e]);if(a--,U(t,pr[e],a),a<0&&(a+=256,U(t,pr[e],a),Uc(t,e)&&!Kc(t,e))){const h=X(t,Gt[e]);U(t,Gt[e],h|ge);const p=X(t,Fe[e]);U(t,Fe[e],p|ge),pe(t,e,-1)}}},pA=new Array(8).fill(0),Nc=t=>{const e=c.cycleCount-pA[t];for(let r=0;r<=1;r++)bc(t,r,e),qc(t,r,e);pA[t]=c.cycleCount},Oc=(t,e)=>{const r=[];for(let s=0;s<=15;s++)r[s]=X(t,Bo[e]+s);return r},Yc=(t,e)=>t.length===e.length&&t.every((r,s)=>r===e[s]),_e={slot:-1,chip:-1,params:[-1]};let mo=(t,e)=>{const r=Oc(t,e);t===_e.slot&&e===_e.chip&&Yc(r,_e.params)||(_e.slot=t,_e.chip=e,_e.params=r,d1({slot:t,chip:e,params:r}))};const Wc=(t,e)=>{switch(X(t,po[e])&7){case 0:for(let s=0;s<=15;s++)U(t,Bo[e]+s,0);mo(t,e);break;case 7:U(t,fA[e],X(t,Co[e]));break;case 6:{const s=X(t,fA[e]),a=X(t,Co[e]);s>=0&&s<=15&&(U(t,Bo[e]+s,a),mo(t,e));break}}},pe=(t,e,r)=>{let s=X(t,Fe[e]);switch(r>=0&&(s&=127-(r&127),U(t,Fe[e],s)),e){case 0:rr(t,s!==0);break;case 1:Vi(s!==0);break}},xc=(t,e,r)=>{let s=X(t,Cr[e]);r>=0&&(r=r&255,r&128?s|=r:s&=255-r),s|=128,U(t,Cr[e],s)},Xc=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,s=t&255,a=s&128?1:0;switch(s){case po[a]:e>=0&&(U(r,po[a],e),Wc(r,a));break;case Co[a]:case Rc[a]:case yc[a]:case Pc[a]:case Eo[a]:case Lc[a]:U(r,s,e);break;case Ge[a]:e>=0&&U(r,Cn[a],e),pe(r,a,re);break;case Ze[a]:if(e>=0){U(r,So[a],e),U(r,Ge[a],X(r,Cn[a])),U(r,Ze[a],e);const h=X(r,Gt[a]);U(r,Gt[a],h&~re),pe(r,a,re)}break;case Cn[a]:e>=0&&(U(r,s,e),pe(r,a,re));break;case So[a]:e>=0&&U(r,s,e);break;case gr[a]:e>=0&&U(r,IA[a],e),pe(r,a,ge);break;case pr[a]:if(e>=0){U(r,pr[a],e),U(r,gr[a],X(r,IA[a]));const h=X(r,Gt[a]);U(r,Gt[a],h&~ge),pe(r,a,ge)}break;case Fe[a]:e>=0&&pe(r,a,e);break;case Cr[a]:xc(r,a,e);break}return-1};let Je=0;const Sn=192,Gc=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${rt(Sn)}   ; jump address
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
`,Zc=`
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
`,_c=()=>{const t=new Uint8Array(256).fill(0),e=en(0,Gc.split(`
`));t.set(e,0);const r=en(0,Zc.split(`
`));return t.set(r,Sn),t[254]=23,t[255]=Sn,t};let Sr=new Uint8Array;const Do=(t=!0)=>{Sr.length===0&&(Sr=_c()),Sr[1]=t?32:0;const r=49152+Sn+7*256;Ye(7,Sr,r,vc),Ye(7,Sr,r+3,Hc)},Jc=(t,e)=>{if(t===0)D(e,2);else if(t<=2){D(e,240);const a=zr(t).length/512;D(e+1,a&255),D(e+2,a>>>8),D(e+3,0),sr(4),Ar(0)}else or(40),sr(0),Ar(0),F()},Vc=(t,e)=>{const a=zr(t).length/512,h=a>1600?2:1,p=h==2?32:64;D(e,240),D(e+1,a&255),D(e+2,a>>>8),D(e+3,0);const u="Apple2TS SP";D(e+4,u.length);let m=0;for(;m<u.length;m++)D(e+5+m,u.charCodeAt(m));for(;m<16;m++)D(e+5+m,u.charCodeAt(8));D(e+21,h),D(e+22,p),D(e+23,1),D(e+24,0),sr(25),Ar(0)},jc=(t,e,r)=>{if(B(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),or(4),F();return}const s=B(t+4);switch(s){case 0:Jc(e,r);break;case 1:case 2:or(33),F();break;case 3:case 4:Vc(e,r);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},Hc=()=>{or(0),F(!1);const t=256+c.StackPtr,e=B(t+1)+256*B(t+2),r=B(e+1),s=B(e+2)+256*B(e+3),a=B(s+1),h=B(s+2)+256*B(s+3);switch(r){case 0:{jc(s,a,h);return}case 1:{if(B(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),F();return}const m=512*(B(s+4)+256*B(s+5)+65536*B(s+6)),P=zr(a).slice(m,m+512);zn(h,P);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),F();return}const p=ao(a);p.motorRunning=!0,Je||(Je=setTimeout(()=>{Je=0,p&&(p.motorRunning=!1),Rt()},500)),Rt()},vc=()=>{or(0),F(!1);const t=B(66),e=Math.max(Math.min(B(67)>>6,2),0),r=ao(e);if(!r.hardDrive)return;const s=zr(e),a=B(70)+256*B(71),h=512*a,p=B(68)+256*B(69),u=s.length;switch(r.status=` ${rt(a,4)}`,t){case 0:{if(r.filename.length===0||u===0){sr(0),Ar(0),F();return}const m=u/512;sr(m&255),Ar(m>>>8);break}case 1:{if(h+512>u){F();return}const m=s.slice(h,h+512);zn(p,m);break}case 2:{if(h+512>u){F();return}if(r.isWriteProtected){F();return}const m=vn(p);s.set(m,h),r.diskHasChanges=!0,r.lastWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),F();return;default:console.error("unknown hard drive command"),F();return}F(!1),r.motorRunning=!0,Je||(Je=setTimeout(()=>{Je=0,r&&(r.motorRunning=!1),Rt()},500)),Rt()},CA=`
        ORG   $300
        LDX   #$03
        JMP   ($0300,X)
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
`;let SA=0,En=0,Er=0,Bn=0,Br=$A,EA=16.6881,wo=17030,BA=0,it=O.IDLE,Ce="APPLE2EE",Ve=0,mn=!1,wt=0;const Y=[];let mr=0;const zc=()=>{E.VBL.isSet=!0,Ic()},$c=()=>{E.VBL.isSet=!1},mA=()=>{const t={};for(const e in E)t[e]=E[e].isSet;return t},t1=()=>{const t=JSON.parse(JSON.stringify(c));let e=ne;for(let s=ne;s<L.length;s++)L[s]!==255&&(s+=255-s%256,e=s+1);const r=Ue.Buffer.from(L.slice(0,e));return{s6502:t,extraRamSize:64*(Ot+1),machineName:Ce,softSwitches:mA(),memory:r.toString("base64")}},e1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));Rs(r);const s=t.softSwitches;for(const h in s){const p=h;try{E[p].isSet=s[h]}catch{}}"WRITEBSR1"in s&&(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=s.WRITEBSR1||s.WRITEBSR2||s.RDWRBSR1||s.RDWRBSR2);const a=new Uint8Array(Ue.Buffer.from(t.memory,"base64"));if(e<1){L.set(a.slice(0,65536)),L.set(a.slice(131072,163584),65536),L.set(a.slice(65536,131072),ne);const h=(a.length-163584)/1024;h>0&&(Jn(h+64),L.set(a.slice(163584),ne+65536))}else Jn(t.extraRamSize),L.set(a);Ce=t.machineName||"APPLE2EE",To(Ce,!1),Vt(),Nn(!0)},r1=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!0,colorMode:0,showScanlines:!1,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:O.IDLE,breakpoints:Ct,stackDump:ga()}),ko=t=>({emulator:r1(),state6502:t1(),driveState:Za(t),thumbnail:"",snapshots:null}),n1=()=>{const t=ko(!0);return t.snapshots=Y,t},o1=t=>{Rs(t),Zt()},s1=t=>{ir(t),Zt()},Dn=(t,e=!1)=>{var s,a;kn();const r=(s=t.emulator)!=null&&s.version?t.emulator.version:.9;e1(t.state6502,r),(a=t.emulator)!=null&&a.stackDump&&pa(t.emulator.stackDump),_a(t.driveState),e&&(Y.length=0,wt=0),t.snapshots&&(Y.length=0,Y.push(...t.snapshots),wt=Y.length),Zt()};let DA=!1;const wA=()=>{DA||(DA=!0,ec(),wc(!0,2),Tc(!0,4),hc(!0,5),xa(),Do(),ka())},A1=()=>{Ja(),bn(),cc(),kc(),tc(),Mc(4)},wn=()=>{if(ir(0),ca(),Bs(Ce),wA(),CA.length>0){const e=en(768,CA.split(`
`));L.set(e,768)}kn(),Nn(!0),ao(1).filename===""&&(Do(!1),setTimeout(()=>{Do()},200))},kn=()=>{ji(),qi(),B(49282),ys(),A1()},i1=t=>{Er=t,EA=Er===4?1:16.6881,wo=17030*[.1,.5,1,2,3,4,4][Er+2],LA()},a1=t=>{Br=t,Zt(),P1(Yi())},c1=(t,e)=>{L[t]=e,Br&&Zt()},To=(t,e=!0)=>{Ce!==t&&(Ce=t,Bs(Ce),e&&kn(),Zt())},l1=t=>{Jn(t),Zt()},kA=()=>{const t=wt-1;return t<0||!Y[t]?-1:t},dA=()=>{const t=wt+1;return t>=Y.length||!Y[t]?-1:t},TA=()=>{Y.length===ti&&Y.shift(),Y.push(ko(!1)),wt=Y.length,y1(Y[Y.length-1].state6502.s6502.PC)},u1=()=>{let t=kA();t<0||(qt(O.PAUSED),setTimeout(()=>{wt===Y.length&&(TA(),t=Math.max(wt-2,0)),wt=t,Dn(Y[wt])},50))},h1=()=>{const t=dA();t<0||(qt(O.PAUSED),setTimeout(()=>{wt=t,Dn(Y[t])},50))},I1=t=>{t<0||t>=Y.length||(qt(O.PAUSED),setTimeout(()=>{wt=t,Dn(Y[t])},50))},f1=()=>{const t=[];for(let e=0;e<Y.length;e++)t[e]={s6502:Y[e].state6502.s6502,thumbnail:Y[e].thumbnail};return t},g1=t=>{Y.length>0&&(Y[Y.length-1].thumbnail=t)};let dn=null;const RA=(t=!1)=>{dn&&clearTimeout(dn),t?dn=setTimeout(()=>{mn=!0,dn=null},100):mn=!0},yA=()=>{Mr(),it===O.IDLE&&(wn(),it=O.PAUSED),Xn(),qt(O.PAUSED)},p1=()=>{Mr(),it===O.IDLE&&(wn(),it=O.PAUSED),B(c.PC,!1)===32?(Xn(),PA()):yA()},PA=()=>{Mr(),it===O.IDLE&&(wn(),it=O.PAUSED),Zi(),qt(O.RUNNING)},LA=()=>{Ve=0,En=performance.now(),SA=En},qt=t=>{if(wA(),it=t,it===O.PAUSED)mr&&(clearInterval(mr),mr=0),eA();else if(it===O.RUNNING){for(eA(!0),Mr();Y.length>0&&wt<Y.length-1;)Y.pop();wt=Y.length,mr||(mr=setInterval(Nn,1e3))}Zt(),LA(),Bn===0&&(Bn=1,FA())},MA=t=>{it===O.IDLE?(qt(O.NEED_BOOT),setTimeout(()=>{qt(O.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},C1=(t,e,r)=>{MA(()=>{zn(t,e),r&&Yt(t)})},S1=t=>{MA(()=>{Ui(t)})},E1=()=>Br&&it===O.PAUSED?fa():new Uint8Array,B1=()=>Br&&it!==O.IDLE?Ca():"",Zt=()=>{const t={addressGetTable:ct,altChar:E.ALTCHARSET.isSet,arrowKeysAsJoystick:!0,breakpoints:Ct,button0:E.PB0.isSet,button1:E.PB1.isSet,canGoBackward:kA()>=0,canGoForward:dA()>=0,capsLock:!0,c800Slot:Zn(),colorMode:Qo.COLOR,showScanlines:!1,cout:B(57)<<8|B(56),cpuSpeed:Bn,theme:Fo.CLASSIC,extraRamSize:64*(Ot+1),helpText:"",hires:Ia(),iTempState:wt,isDebugging:Br,lores:Hn(!0),machineName:Ce,memoryDump:E1(),noDelayMode:!E.COLUMN80.isSet&&!E.AN3.isSet,ramWorksBank:Re(),runMode:it,s6502:c,softSwitches:mA(),speedMode:Er,stackString:B1(),textPage:Hn(),timeTravelThumbnails:f1(),useOpenAppleKey:!1,hotReload:!1};D1(t)},m1=t=>{if(t)for(let e=0;e<t.length;e++)Ni(t[e]);else Oi();t&&(t[0]<=49167||t[0]>=49232)&&Vt(),Zt()},QA=()=>{const t=performance.now();if(BA=t-En,BA<EA||(En=t,it===O.IDLE||it===O.PAUSED))return;it===O.NEED_BOOT?(wn(),qt(O.RUNNING)):it===O.NEED_RESET&&(kn(),qt(O.RUNNING));let e=0;for(;;){const s=Xn();if(s<0)break;if(e+=s,e%17030>=12480&&(E.VBL.isSet||zc()),e>=wo){$c();break}}Ve++;const r=Ve*wo/(performance.now()-SA);Bn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,Ve%2&&(ui(),Zt()),mn&&(mn=!1,TA())},FA=()=>{QA();const t=Ve+[1,1,1,5,5,5,10][Er+2];for(;it===O.RUNNING&&Ve!==t;)QA();setTimeout(FA,it===O.RUNNING?0:20)},Et=(t,e)=>{self.postMessage({msg:t,payload:e})},D1=t=>{Et(ft.MACHINE_STATE,t)},w1=t=>{Et(ft.CLICK,t)},k1=t=>{Et(ft.DRIVE_PROPS,t)},je=t=>{Et(ft.DRIVE_SOUND,t)},bA=t=>{Et(ft.SAVE_STATE,t)},Tn=t=>{Et(ft.RUMBLE,t)},UA=t=>{Et(ft.HELP_TEXT,t)},KA=t=>{Et(ft.ENHANCED_MIDI,t)},qA=t=>{Et(ft.SHOW_MOUSE,t)},d1=t=>{Et(ft.MBOARD_SOUND,t)},T1=t=>{Et(ft.COMM_DATA,t)},R1=t=>{Et(ft.MIDI_DATA,t)},y1=t=>{Et(ft.REQUEST_THUMBNAIL,t)},P1=t=>{Et(ft.SOFTSWITCH_DESCRIPTIONS,t)},L1=t=>{Et(ft.INSTRUCTIONS,t)};typeof self<"u"&&(self.onmessage=t=>{if(!(!t.data||typeof t.data!="object")&&"msg"in t.data)switch(t.data.msg){case q.RUN_MODE:qt(t.data.payload);break;case q.STATE6502:o1(t.data.payload);break;case q.DEBUG:a1(t.data.payload);break;case q.BREAKPOINTS:_i(t.data.payload);break;case q.STEP_INTO:yA();break;case q.STEP_OVER:p1();break;case q.STEP_OUT:PA();break;case q.SPEED:i1(t.data.payload);break;case q.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?h1():u1();break;case q.TIME_TRAVEL_INDEX:I1(t.data.payload);break;case q.TIME_TRAVEL_SNAPSHOT:RA();break;case q.THUMBNAIL_IMAGE:g1(t.data.payload);break;case q.RESTORE_STATE:Dn(t.data.payload,!0);break;case q.KEYPRESS:bi(t.data.payload);break;case q.MOUSEEVENT:fc(t.data.payload);break;case q.PASTE_TEXT:S1(t.data.payload);break;case q.APPLE_PRESS:Vo(!0,t.data.payload);break;case q.APPLE_RELEASE:Vo(!1,t.data.payload);break;case q.GET_SAVE_STATE:bA(ko(!0));break;case q.GET_SAVE_STATE_SNAPSHOTS:bA(n1());break;case q.DRIVE_PROPS:{const e=t.data.payload;ja(e);break}case q.DRIVE_NEW_DATA:{const e=t.data.payload;Va(e);break}case q.GAMEPAD:ci(t.data.payload);break;case q.SET_BINARY_BLOCK:{const e=t.data.payload;C1(e.address,e.data,e.run);break}case q.SET_CYCLECOUNT:s1(t.data.payload);break;case q.SET_MEMORY:{const e=t.data.payload;c1(e.address,e.value);break}case q.COMM_DATA:$a(t.data.payload);break;case q.MIDI_DATA:Dc(t.data.payload);break;case q.RAMWORKS:l1(t.data.payload);break;case q.MACHINE_NAME:To(t.data.payload);break;case q.SOFTSWITCHES:m1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
