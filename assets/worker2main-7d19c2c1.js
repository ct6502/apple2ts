(function(){"use strict";var Wt={},Ze={};Ze.byteLength=qi,Ze.toByteArray=Xi,Ze.fromByteArray=Zi;for(var ht=[],nt=[],Ki=typeof Uint8Array<"u"?Uint8Array:Array,br="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",oe=0,Yi=br.length;oe<Yi;++oe)ht[oe]=br[oe],nt[br.charCodeAt(oe)]=oe;nt["-".charCodeAt(0)]=62,nt["_".charCodeAt(0)]=63;function Qn(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=t.indexOf("=");n===-1&&(n=e);var s=n===e?0:4-n%4;return[n,s]}function qi(t){var e=Qn(t),n=e[0],s=e[1];return(n+s)*3/4-s}function xi(t,e,n){return(e+n)*3/4-n}function Xi(t){var e,n=Qn(t),s=n[0],a=n[1],g=new Ki(xi(t,s,a)),I=0,u=a>0?s-4:s,C;for(C=0;C<u;C+=4)e=nt[t.charCodeAt(C)]<<18|nt[t.charCodeAt(C+1)]<<12|nt[t.charCodeAt(C+2)]<<6|nt[t.charCodeAt(C+3)],g[I++]=e>>16&255,g[I++]=e>>8&255,g[I++]=e&255;return a===2&&(e=nt[t.charCodeAt(C)]<<2|nt[t.charCodeAt(C+1)]>>4,g[I++]=e&255),a===1&&(e=nt[t.charCodeAt(C)]<<10|nt[t.charCodeAt(C+1)]<<4|nt[t.charCodeAt(C+2)]>>2,g[I++]=e>>8&255,g[I++]=e&255),g}function Wi(t){return ht[t>>18&63]+ht[t>>12&63]+ht[t>>6&63]+ht[t&63]}function Gi(t,e,n){for(var s,a=[],g=e;g<n;g+=3)s=(t[g]<<16&16711680)+(t[g+1]<<8&65280)+(t[g+2]&255),a.push(Wi(s));return a.join("")}function Zi(t){for(var e,n=t.length,s=n%3,a=[],g=16383,I=0,u=n-s;I<u;I+=g)a.push(Gi(t,I,I+g>u?u:I+g));return s===1?(e=t[n-1],a.push(ht[e>>2]+ht[e<<4&63]+"==")):s===2&&(e=(t[n-2]<<8)+t[n-1],a.push(ht[e>>10]+ht[e>>4&63]+ht[e<<2&63]+"=")),a.join("")}var Mr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */Mr.read=function(t,e,n,s,a){var g,I,u=a*8-s-1,C=(1<<u)-1,T=C>>1,F=-7,V=n?a-1:0,at=n?-1:1,et=t[e+V];for(V+=at,g=et&(1<<-F)-1,et>>=-F,F+=u;F>0;g=g*256+t[e+V],V+=at,F-=8);for(I=g&(1<<-F)-1,g>>=-F,F+=s;F>0;I=I*256+t[e+V],V+=at,F-=8);if(g===0)g=1-T;else{if(g===C)return I?NaN:(et?-1:1)*(1/0);I=I+Math.pow(2,s),g=g-T}return(et?-1:1)*I*Math.pow(2,g-s)},Mr.write=function(t,e,n,s,a,g){var I,u,C,T=g*8-a-1,F=(1<<T)-1,V=F>>1,at=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,et=s?0:g-1,Xe=s?1:-1,We=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,I=F):(I=Math.floor(Math.log(e)/Math.LN2),e*(C=Math.pow(2,-I))<1&&(I--,C*=2),I+V>=1?e+=at/C:e+=at*Math.pow(2,1-V),e*C>=2&&(I++,C/=2),I+V>=F?(u=0,I=F):I+V>=1?(u=(e*C-1)*Math.pow(2,a),I=I+V):(u=e*Math.pow(2,V-1)*Math.pow(2,a),I=0));a>=8;t[n+et]=u&255,et+=Xe,u/=256,a-=8);for(I=I<<a|u,T+=a;T>0;t[n+et]=I&255,et+=Xe,I/=256,T-=8);t[n+et-Xe]|=We*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=Ze,n=Mr,s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=bA,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=g(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function g(){try{const i=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(i,r),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function I(i){if(i>a)throw new RangeError('The value "'+i+'" is invalid for option "size"');const r=new Uint8Array(i);return Object.setPrototypeOf(r,u.prototype),r}function u(i,r,o){if(typeof i=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return V(i)}return C(i,r,o)}u.poolSize=8192;function C(i,r,o){if(typeof i=="string")return at(i,r);if(ArrayBuffer.isView(i))return Xe(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(Ct(i,ArrayBuffer)||i&&Ct(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Ct(i,SharedArrayBuffer)||i&&Ct(i.buffer,SharedArrayBuffer)))return We(i,r,o);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const c=i.valueOf&&i.valueOf();if(c!=null&&c!==i)return u.from(c,r,o);const h=LA(i);if(h)return h;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,r,o){return C(i,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function T(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function F(i,r,o){return T(i),i<=0?I(i):r!==void 0?typeof o=="string"?I(i).fill(r,o):I(i).fill(r):I(i)}u.alloc=function(i,r,o){return F(i,r,o)};function V(i){return T(i),I(i<0?0:bn(i)|0)}u.allocUnsafe=function(i){return V(i)},u.allocUnsafeSlow=function(i){return V(i)};function at(i,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=Ri(i,r)|0;let c=I(o);const h=c.write(i,r);return h!==o&&(c=c.slice(0,h)),c}function et(i){const r=i.length<0?0:bn(i.length)|0,o=I(r);for(let c=0;c<r;c+=1)o[c]=i[c]&255;return o}function Xe(i){if(Ct(i,Uint8Array)){const r=new Uint8Array(i);return We(r.buffer,r.byteOffset,r.byteLength)}return et(i)}function We(i,r,o){if(r<0||i.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let c;return r===void 0&&o===void 0?c=new Uint8Array(i):o===void 0?c=new Uint8Array(i,r):c=new Uint8Array(i,r,o),Object.setPrototypeOf(c,u.prototype),c}function LA(i){if(u.isBuffer(i)){const r=bn(i.length)|0,o=I(r);return o.length===0||i.copy(o,0,0,r),o}if(i.length!==void 0)return typeof i.length!="number"||Un(i.length)?I(0):et(i);if(i.type==="Buffer"&&Array.isArray(i.data))return et(i.data)}function bn(i){if(i>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return i|0}function bA(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(Ct(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),Ct(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let c=r.length,h=o.length;for(let p=0,S=Math.min(c,h);p<S;++p)if(r[p]!==o[p]){c=r[p],h=o[p];break}return c<h?-1:h<c?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let c;if(o===void 0)for(o=0,c=0;c<r.length;++c)o+=r[c].length;const h=u.allocUnsafe(o);let p=0;for(c=0;c<r.length;++c){let S=r[c];if(Ct(S,Uint8Array))p+S.length>h.length?(u.isBuffer(S)||(S=u.from(S)),S.copy(h,p)):Uint8Array.prototype.set.call(h,S,p);else if(u.isBuffer(S))S.copy(h,p);else throw new TypeError('"list" argument must be an Array of Buffers');p+=S.length}return h};function Ri(i,r){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||Ct(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const o=i.length,c=arguments.length>2&&arguments[2]===!0;if(!c&&o===0)return 0;let h=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Fn(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return Oi(i).length;default:if(h)return c?-1:Fn(i).length;r=(""+r).toLowerCase(),h=!0}}u.byteLength=Ri;function MA(i,r,o){let c=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(i||(i="utf8");;)switch(i){case"hex":return XA(this,r,o);case"utf8":case"utf-8":return Pi(this,r,o);case"ascii":return qA(this,r,o);case"latin1":case"binary":return xA(this,r,o);case"base64":return KA(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return WA(this,r,o);default:if(c)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),c=!0}}u.prototype._isBuffer=!0;function ne(i,r,o){const c=i[r];i[r]=i[o],i[o]=c}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)ne(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)ne(this,o,o+3),ne(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)ne(this,o,o+7),ne(this,o+1,o+6),ne(this,o+2,o+5),ne(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?Pi(this,0,r):MA.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=t.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(r,o,c,h,p){if(Ct(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),c===void 0&&(c=r?r.length:0),h===void 0&&(h=0),p===void 0&&(p=this.length),o<0||c>r.length||h<0||p>this.length)throw new RangeError("out of range index");if(h>=p&&o>=c)return 0;if(h>=p)return-1;if(o>=c)return 1;if(o>>>=0,c>>>=0,h>>>=0,p>>>=0,this===r)return 0;let S=p-h,R=c-o;const X=Math.min(S,R),Y=this.slice(h,p),W=r.slice(o,c);for(let N=0;N<X;++N)if(Y[N]!==W[N]){S=Y[N],R=W[N];break}return S<R?-1:R<S?1:0};function yi(i,r,o,c,h){if(i.length===0)return-1;if(typeof o=="string"?(c=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Un(o)&&(o=h?0:i.length-1),o<0&&(o=i.length+o),o>=i.length){if(h)return-1;o=i.length-1}else if(o<0)if(h)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,c)),u.isBuffer(r))return r.length===0?-1:Ti(i,r,o,c,h);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?h?Uint8Array.prototype.indexOf.call(i,r,o):Uint8Array.prototype.lastIndexOf.call(i,r,o):Ti(i,[r],o,c,h);throw new TypeError("val must be string, number or Buffer")}function Ti(i,r,o,c,h){let p=1,S=i.length,R=r.length;if(c!==void 0&&(c=String(c).toLowerCase(),c==="ucs2"||c==="ucs-2"||c==="utf16le"||c==="utf-16le")){if(i.length<2||r.length<2)return-1;p=2,S/=2,R/=2,o/=2}function X(W,N){return p===1?W[N]:W.readUInt16BE(N*p)}let Y;if(h){let W=-1;for(Y=o;Y<S;Y++)if(X(i,Y)===X(r,W===-1?0:Y-W)){if(W===-1&&(W=Y),Y-W+1===R)return W*p}else W!==-1&&(Y-=Y-W),W=-1}else for(o+R>S&&(o=S-R),Y=o;Y>=0;Y--){let W=!0;for(let N=0;N<R;N++)if(X(i,Y+N)!==X(r,N)){W=!1;break}if(W)return Y}return-1}u.prototype.includes=function(r,o,c){return this.indexOf(r,o,c)!==-1},u.prototype.indexOf=function(r,o,c){return yi(this,r,o,c,!0)},u.prototype.lastIndexOf=function(r,o,c){return yi(this,r,o,c,!1)};function FA(i,r,o,c){o=Number(o)||0;const h=i.length-o;c?(c=Number(c),c>h&&(c=h)):c=h;const p=r.length;c>p/2&&(c=p/2);let S;for(S=0;S<c;++S){const R=parseInt(r.substr(S*2,2),16);if(Un(R))return S;i[o+S]=R}return S}function UA(i,r,o,c){return Lr(Fn(r,i.length-o),i,o,c)}function QA(i,r,o,c){return Lr(_A(r),i,o,c)}function NA(i,r,o,c){return Lr(Oi(r),i,o,c)}function OA(i,r,o,c){return Lr(VA(r,i.length-o),i,o,c)}u.prototype.write=function(r,o,c,h){if(o===void 0)h="utf8",c=this.length,o=0;else if(c===void 0&&typeof o=="string")h=o,c=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(c)?(c=c>>>0,h===void 0&&(h="utf8")):(h=c,c=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const p=this.length-o;if((c===void 0||c>p)&&(c=p),r.length>0&&(c<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");h||(h="utf8");let S=!1;for(;;)switch(h){case"hex":return FA(this,r,o,c);case"utf8":case"utf-8":return UA(this,r,o,c);case"ascii":case"latin1":case"binary":return QA(this,r,o,c);case"base64":return NA(this,r,o,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return OA(this,r,o,c);default:if(S)throw new TypeError("Unknown encoding: "+h);h=(""+h).toLowerCase(),S=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function KA(i,r,o){return r===0&&o===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(r,o))}function Pi(i,r,o){o=Math.min(i.length,o);const c=[];let h=r;for(;h<o;){const p=i[h];let S=null,R=p>239?4:p>223?3:p>191?2:1;if(h+R<=o){let X,Y,W,N;switch(R){case 1:p<128&&(S=p);break;case 2:X=i[h+1],(X&192)===128&&(N=(p&31)<<6|X&63,N>127&&(S=N));break;case 3:X=i[h+1],Y=i[h+2],(X&192)===128&&(Y&192)===128&&(N=(p&15)<<12|(X&63)<<6|Y&63,N>2047&&(N<55296||N>57343)&&(S=N));break;case 4:X=i[h+1],Y=i[h+2],W=i[h+3],(X&192)===128&&(Y&192)===128&&(W&192)===128&&(N=(p&15)<<18|(X&63)<<12|(Y&63)<<6|W&63,N>65535&&N<1114112&&(S=N))}}S===null?(S=65533,R=1):S>65535&&(S-=65536,c.push(S>>>10&1023|55296),S=56320|S&1023),c.push(S),h+=R}return YA(c)}const di=4096;function YA(i){const r=i.length;if(r<=di)return String.fromCharCode.apply(String,i);let o="",c=0;for(;c<r;)o+=String.fromCharCode.apply(String,i.slice(c,c+=di));return o}function qA(i,r,o){let c="";o=Math.min(i.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(i[h]&127);return c}function xA(i,r,o){let c="";o=Math.min(i.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(i[h]);return c}function XA(i,r,o){const c=i.length;(!r||r<0)&&(r=0),(!o||o<0||o>c)&&(o=c);let h="";for(let p=r;p<o;++p)h+=jA[i[p]];return h}function WA(i,r,o){const c=i.slice(r,o);let h="";for(let p=0;p<c.length-1;p+=2)h+=String.fromCharCode(c[p]+c[p+1]*256);return h}u.prototype.slice=function(r,o){const c=this.length;r=~~r,o=o===void 0?c:~~o,r<0?(r+=c,r<0&&(r=0)):r>c&&(r=c),o<0?(o+=c,o<0&&(o=0)):o>c&&(o=c),o<r&&(o=r);const h=this.subarray(r,o);return Object.setPrototypeOf(h,u.prototype),h};function $(i,r,o){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||$(r,o,this.length);let h=this[r],p=1,S=0;for(;++S<o&&(p*=256);)h+=this[r+S]*p;return h},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||$(r,o,this.length);let h=this[r+--o],p=1;for(;o>0&&(p*=256);)h+=this[r+--o]*p;return h},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||$(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||$(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||$(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||$(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||$(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=Xt(function(r){r=r>>>0,De(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&Ge(r,this.length-8);const h=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,p=this[++r]+this[++r]*2**8+this[++r]*2**16+c*2**24;return BigInt(h)+(BigInt(p)<<BigInt(32))}),u.prototype.readBigUInt64BE=Xt(function(r){r=r>>>0,De(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&Ge(r,this.length-8);const h=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],p=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c;return(BigInt(h)<<BigInt(32))+BigInt(p)}),u.prototype.readIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||$(r,o,this.length);let h=this[r],p=1,S=0;for(;++S<o&&(p*=256);)h+=this[r+S]*p;return p*=128,h>=p&&(h-=Math.pow(2,8*o)),h},u.prototype.readIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||$(r,o,this.length);let h=o,p=1,S=this[r+--h];for(;h>0&&(p*=256);)S+=this[r+--h]*p;return p*=128,S>=p&&(S-=Math.pow(2,8*o)),S},u.prototype.readInt8=function(r,o){return r=r>>>0,o||$(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||$(r,2,this.length);const c=this[r]|this[r+1]<<8;return c&32768?c|4294901760:c},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||$(r,2,this.length);const c=this[r+1]|this[r]<<8;return c&32768?c|4294901760:c},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||$(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||$(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=Xt(function(r){r=r>>>0,De(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&Ge(r,this.length-8);const h=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(c<<24);return(BigInt(h)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=Xt(function(r){r=r>>>0,De(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&Ge(r,this.length-8);const h=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(h)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||$(r,4,this.length),n.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||$(r,4,this.length),n.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||$(r,8,this.length),n.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||$(r,8,this.length),n.read(this,r,!1,52,8)};function rt(i,r,o,c,h,p){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>h||r<p)throw new RangeError('"value" argument is out of bounds');if(o+c>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const R=Math.pow(2,8*c)-1;rt(this,r,o,c,R,0)}let p=1,S=0;for(this[o]=r&255;++S<c&&(p*=256);)this[o+S]=r/p&255;return o+c},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const R=Math.pow(2,8*c)-1;rt(this,r,o,c,R,0)}let p=c-1,S=1;for(this[o+p]=r&255;--p>=0&&(S*=256);)this[o+p]=r/S&255;return o+c},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function Li(i,r,o,c,h){Ni(r,c,h,i,o,7);let p=Number(r&BigInt(4294967295));i[o++]=p,p=p>>8,i[o++]=p,p=p>>8,i[o++]=p,p=p>>8,i[o++]=p;let S=Number(r>>BigInt(32)&BigInt(4294967295));return i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,o}function bi(i,r,o,c,h){Ni(r,c,h,i,o,7);let p=Number(r&BigInt(4294967295));i[o+7]=p,p=p>>8,i[o+6]=p,p=p>>8,i[o+5]=p,p=p>>8,i[o+4]=p;let S=Number(r>>BigInt(32)&BigInt(4294967295));return i[o+3]=S,S=S>>8,i[o+2]=S,S=S>>8,i[o+1]=S,S=S>>8,i[o]=S,o+8}u.prototype.writeBigUInt64LE=Xt(function(r,o=0){return Li(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Xt(function(r,o=0){return bi(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const X=Math.pow(2,8*c-1);rt(this,r,o,c,X-1,-X)}let p=0,S=1,R=0;for(this[o]=r&255;++p<c&&(S*=256);)r<0&&R===0&&this[o+p-1]!==0&&(R=1),this[o+p]=(r/S>>0)-R&255;return o+c},u.prototype.writeIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const X=Math.pow(2,8*c-1);rt(this,r,o,c,X-1,-X)}let p=c-1,S=1,R=0;for(this[o+p]=r&255;--p>=0&&(S*=256);)r<0&&R===0&&this[o+p+1]!==0&&(R=1),this[o+p]=(r/S>>0)-R&255;return o+c},u.prototype.writeInt8=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||rt(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=Xt(function(r,o=0){return Li(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Xt(function(r,o=0){return bi(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Mi(i,r,o,c,h,p){if(o+c>i.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function Fi(i,r,o,c,h){return r=+r,o=o>>>0,h||Mi(i,r,o,4),n.write(i,r,o,c,23,4),o+4}u.prototype.writeFloatLE=function(r,o,c){return Fi(this,r,o,!0,c)},u.prototype.writeFloatBE=function(r,o,c){return Fi(this,r,o,!1,c)};function Ui(i,r,o,c,h){return r=+r,o=o>>>0,h||Mi(i,r,o,8),n.write(i,r,o,c,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,c){return Ui(this,r,o,!0,c)},u.prototype.writeDoubleBE=function(r,o,c){return Ui(this,r,o,!1,c)},u.prototype.copy=function(r,o,c,h){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(c||(c=0),!h&&h!==0&&(h=this.length),o>=r.length&&(o=r.length),o||(o=0),h>0&&h<c&&(h=c),h===c||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(c<0||c>=this.length)throw new RangeError("Index out of range");if(h<0)throw new RangeError("sourceEnd out of bounds");h>this.length&&(h=this.length),r.length-o<h-c&&(h=r.length-o+c);const p=h-c;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,c,h):Uint8Array.prototype.set.call(r,this.subarray(c,h),o),p},u.prototype.fill=function(r,o,c,h){if(typeof r=="string"){if(typeof o=="string"?(h=o,o=0,c=this.length):typeof c=="string"&&(h=c,c=this.length),h!==void 0&&typeof h!="string")throw new TypeError("encoding must be a string");if(typeof h=="string"&&!u.isEncoding(h))throw new TypeError("Unknown encoding: "+h);if(r.length===1){const S=r.charCodeAt(0);(h==="utf8"&&S<128||h==="latin1")&&(r=S)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<c)throw new RangeError("Out of range index");if(c<=o)return this;o=o>>>0,c=c===void 0?this.length:c>>>0,r||(r=0);let p;if(typeof r=="number")for(p=o;p<c;++p)this[p]=r;else{const S=u.isBuffer(r)?r:u.from(r,h),R=S.length;if(R===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(p=0;p<c-o;++p)this[p+o]=S[p%R]}return this};const me={};function Mn(i,r,o){me[i]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(h){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:h,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}Mn("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Mn("ERR_INVALID_ARG_TYPE",function(i,r){return`The "${i}" argument must be of type number. Received type ${typeof r}`},TypeError),Mn("ERR_OUT_OF_RANGE",function(i,r,o){let c=`The value of "${i}" is out of range.`,h=o;return Number.isInteger(o)&&Math.abs(o)>2**32?h=Qi(String(o)):typeof o=="bigint"&&(h=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(h=Qi(h)),h+="n"),c+=` It must be ${r}. Received ${h}`,c},RangeError);function Qi(i){let r="",o=i.length;const c=i[0]==="-"?1:0;for(;o>=c+4;o-=3)r=`_${i.slice(o-3,o)}${r}`;return`${i.slice(0,o)}${r}`}function GA(i,r,o){De(r,"offset"),(i[r]===void 0||i[r+o]===void 0)&&Ge(r,i.length-(o+1))}function Ni(i,r,o,c,h,p){if(i>o||i<r){const S=typeof r=="bigint"?"n":"";let R;throw p>3?r===0||r===BigInt(0)?R=`>= 0${S} and < 2${S} ** ${(p+1)*8}${S}`:R=`>= -(2${S} ** ${(p+1)*8-1}${S}) and < 2 ** ${(p+1)*8-1}${S}`:R=`>= ${r}${S} and <= ${o}${S}`,new me.ERR_OUT_OF_RANGE("value",R,i)}GA(c,h,p)}function De(i,r){if(typeof i!="number")throw new me.ERR_INVALID_ARG_TYPE(r,"number",i)}function Ge(i,r,o){throw Math.floor(i)!==i?(De(i,o),new me.ERR_OUT_OF_RANGE(o||"offset","an integer",i)):r<0?new me.ERR_BUFFER_OUT_OF_BOUNDS:new me.ERR_OUT_OF_RANGE(o||"offset",`>= ${o?1:0} and <= ${r}`,i)}const ZA=/[^+/0-9A-Za-z-_]/g;function JA(i){if(i=i.split("=")[0],i=i.trim().replace(ZA,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function Fn(i,r){r=r||1/0;let o;const c=i.length;let h=null;const p=[];for(let S=0;S<c;++S){if(o=i.charCodeAt(S),o>55295&&o<57344){if(!h){if(o>56319){(r-=3)>-1&&p.push(239,191,189);continue}else if(S+1===c){(r-=3)>-1&&p.push(239,191,189);continue}h=o;continue}if(o<56320){(r-=3)>-1&&p.push(239,191,189),h=o;continue}o=(h-55296<<10|o-56320)+65536}else h&&(r-=3)>-1&&p.push(239,191,189);if(h=null,o<128){if((r-=1)<0)break;p.push(o)}else if(o<2048){if((r-=2)<0)break;p.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;p.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;p.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return p}function _A(i){const r=[];for(let o=0;o<i.length;++o)r.push(i.charCodeAt(o)&255);return r}function VA(i,r){let o,c,h;const p=[];for(let S=0;S<i.length&&!((r-=2)<0);++S)o=i.charCodeAt(S),c=o>>8,h=o%256,p.push(h),p.push(c);return p}function Oi(i){return e.toByteArray(JA(i))}function Lr(i,r,o,c){let h;for(h=0;h<c&&!(h+o>=r.length||h>=i.length);++h)r[h+o]=i[h];return h}function Ct(i,r){return i instanceof r||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===r.name}function Un(i){return i!==i}const jA=function(){const i="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const c=o*16;for(let h=0;h<16;++h)r[c+h]=i[o]+i[h]}return r}();function Xt(i){return typeof BigInt>"u"?HA:i}function HA(){throw new Error("BigInt not supported")}})(Wt);var U=(t=>(t[t.IDLE=0]="IDLE",t[t.NEED_BOOT=1]="NEED_BOOT",t[t.NEED_RESET=2]="NEED_RESET",t[t.RUNNING=3]="RUNNING",t[t.PAUSED=4]="PAUSED",t))(U||{}),ct=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t))(ct||{}),G=(t=>(t[t.STATE=0]="STATE",t[t.DEBUG=1]="DEBUG",t[t.DISASSEMBLE_ADDR=2]="DISASSEMBLE_ADDR",t[t.BREAKPOINT=3]="BREAKPOINT",t[t.STEP_INTO=4]="STEP_INTO",t[t.STEP_OVER=5]="STEP_OVER",t[t.STEP_OUT=6]="STEP_OUT",t[t.SPEED=7]="SPEED",t[t.TIME_TRAVEL=8]="TIME_TRAVEL",t[t.RESTORE_STATE=9]="RESTORE_STATE",t[t.KEYPRESS=10]="KEYPRESS",t[t.MOUSEEVENT=11]="MOUSEEVENT",t[t.PASTE_TEXT=12]="PASTE_TEXT",t[t.APPLE_PRESS=13]="APPLE_PRESS",t[t.APPLE_RELEASE=14]="APPLE_RELEASE",t[t.GET_SAVE_STATE=15]="GET_SAVE_STATE",t[t.DRIVE_PROPS=16]="DRIVE_PROPS",t[t.GAMEPAD=17]="GAMEPAD",t[t.SET_BINARY_BLOCK=18]="SET_BINARY_BLOCK",t[t.COMM_DATA=19]="COMM_DATA",t))(G||{}),Gt=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Gt||{}),l=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(l||{});const Fr=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",Ji=(t,e)=>e*256+t,M=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),_i=t=>{let e="",n="";switch(t){case 1:e="#";break;case 3:case 6:n=",X";break;case 4:case 7:n=",Y";break;case 10:e="(",n=")";break;case 8:e="(",n=",X)";break;case 9:e="(",n="),Y";break}return[e,n]},Vi=(t,e,n,s)=>{let a=`${M(s,4)}`;if(t){const g=_i(t.mode);let I=g[0];const u=g[1];if(t.PC>=2&&(I=`   ${t.name}   ${I}$`),Fr(t.name)){const C=s+2+(e>127?e-256:e);a+=`${I}${M(C,4)}${u}`}else switch(t.PC){case 1:a+=`   ${t.name}`;break;case 2:a+=`${I}${M(e)}${u}`;break;case 3:a+=`${I}${M(Ji(e,n),4)}${u}`;break}}else a+="         ???";return a},we=t=>t.split("").map(e=>e.charCodeAt(0)),ji=t=>[t&255,t>>>8&255],Nn=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],On=(t,e)=>{const n=t.lastIndexOf(".")+1;return t.substring(0,n)+e},Ur=new Uint32Array(256).fill(0),Hi=()=>{let t;for(let e=0;e<256;e++){t=e;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;Ur[e]=t}},$i=(t,e=0)=>{Ur[255]===0&&Hi();let n=-1;for(let s=e;s<t.length;s++)n=n>>>8^Ur[(n^t[s])&255];return(n^-1)>>>0};let ut;const Zt=Math.trunc(.0028*1020484);let Qr=Zt/2,Nr=Zt/2,Or=Zt/2,Kr=Zt/2,Kn=0,Yn=!1,qn=!1,Yr=!1,qr=!1,Je=!1,xn=!1,Xn=!1;const xr=()=>{Yr=!0},Wn=()=>{qr=!0},zi=()=>{Je=!0},_e=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*Zt/2),Gn=t=>{Qr=_e(t)},Zn=t=>{Nr=_e(t)},Jn=t=>{Or=_e(t)},_n=t=>{Kr=_e(t)},Xr=()=>{xn=Yn||Yr,Xn=qn||qr,B.PB0.isSet=xn,B.PB1.isSet=Xn||Je,B.PB2.isSet=Je},Vn=(t,e)=>{e?Yn=t:qn=t,Xr()},vi=t=>{J(49252,128),J(49253,128),J(49254,128),J(49255,128),Kn=t},jn=t=>{const e=t-Kn;J(49252,e<Qr?128:0),J(49253,e<Nr?128:0),J(49254,e<Or?128:0),J(49255,e<Kr?128:0)};let Jt,Wr,Hn=!1;const t1=t=>{ut=t,Hn=!ut.length||!ut[0].buttons.length,Jt=I1(),Wr=Jt.gamepad?Jt.gamepad:h1},$n=t=>t>-.01&&t<.01,e1=t=>{let e=t[0],n=t[1];$n(e)&&(e=0),$n(n)&&(n=0);const s=Math.sqrt(e*e+n*n),a=.95*(s===0?1:Math.max(Math.abs(e),Math.abs(n))/s);return e=Math.min(Math.max(-a,e),a),n=Math.min(Math.max(-a,n),a),e=Math.trunc(Zt*(e+a)/(2*a)),n=Math.trunc(Zt*(n+a)/(2*a)),[e,n]},zn=t=>{const e=Jt.joystick?Jt.joystick(ut[t].axes,Hn):ut[t].axes,n=e1(e);t===0?(Qr=n[0],Nr=n[1],Yr=!1,qr=!1):(Or=n[0],Kr=n[1],Je=!1);let s=!1;ut[t].buttons.forEach((a,g)=>{a&&(Wr(g,ut.length>1,t===1),s=!0)}),s||Wr(-1,ut.length>1,t===1),Jt.rumble&&Jt.rumble(),Xr()},r1=()=>{ut&&ut.length>0&&(zn(0),ut.length>1&&zn(1))},n1=t=>{switch(t){case 0:b("JL");break;case 1:b("G",200);break;case 2:x("M"),b("O");break;case 3:b("L");break;case 4:b("F");break;case 5:x("P"),b("T");break;case 6:break;case 7:break;case 8:b("Z");break;case 9:{const e=go();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:break;case 11:break;case 12:b("L");break;case 13:b("M");break;case 14:b("A");break;case 15:b("D");break;case-1:return}};let _t=0,Vt=0,jt=!1;const Ve=.5,o1={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-Ve?(Vt=0,_t===0||_t>2?(_t=0,x("A")):_t===1&&jt?b("W"):_t===2&&jt&&b("R"),_t++,jt=!1,t):t[0]>Ve?(_t=0,Vt===0||Vt>2?(Vt=0,x("D")):Vt===1&&jt?b("W"):Vt===2&&jt&&b("R"),Vt++,jt=!1,t):t[1]<-Ve?(b("C"),t):t[1]>Ve?(b("S"),t):(jt=!0,t),gamepad:n1,rumble:null,setup:null,helptext:`AZTEC
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
`},i1={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let Gr=14,Zr=14;const s1={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=E(182);Gr<40&&t<Gr&&Ln({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Gr=t,t=E(183),Zr<40&&t<Zr&&Ln({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Zr=t},setup:null,helptext:`KARATEKA
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
`},A1=t=>{switch(t){case 0:b("A");break;case 1:b("C",50);break;case 2:b("O");break;case 3:b("T");break;case 4:b("\x1B");break;case 5:b("\r");break;case 6:break;case 7:break;case 8:x("N"),b("'");break;case 9:x("Y"),b("1");break;case 10:break;case 11:break;case 12:break;case 13:b(" ");break;case 14:break;case 15:b("	");break;case-1:return}},Rt=.5,a1={address:768,data:[141,74,3,132],keymap:{},gamepad:A1,joystick:(t,e)=>{if(e)return t;const n=t[0]<-Rt?"\b":t[0]>Rt?"":"",s=t[1]<-Rt?"\v":t[1]>Rt?`
`:"";let a=n+s;return a||(a=t[2]<-Rt?"L\b":t[2]>Rt?"L":"",a||(a=t[3]<-Rt?"L\v":t[3]>Rt?`L
`:"")),a&&b(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
_______________________________________________
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
ESC  exit conversation`},vn=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,c1=t=>{switch(t){case 1:k(109,255);break;case 12:x("A");break;case 13:x("Z");break;case 14:x("\b");break;case 15:x("");break}},je=.75,u1=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{k(25025,173),k(25036,64)},helptext:vn},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-je?"\b":t[0]>je?"":t[1]<-je?"A":t[1]>je?"Z":"";return e&&x(e),t},gamepad:c1,rumble:null,setup:null,helptext:vn}],l1={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},f1={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:xr();break;case 1:Wn();break;case 2:b(" ");break;case 3:b("U");break;case 4:b("\r");break;case 5:b("T");break;case 9:{const e=go();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:xr();break}},rumble:()=>{E(49178)<128&&E(49181)<128&&Ln({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{k(5128,0),k(5130,4);let t=5210;k(t,234),k(t+1,234),k(t+2,234),t=5224,k(t,234),k(t+1,234),k(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},ke=new Array,Ht=t=>{Array.isArray(t)?ke.push(...t):ke.push(t)};Ht(o1),Ht(i1),Ht(s1),Ht(a1),Ht(u1),Ht(l1),Ht(f1);const h1=(t,e,n)=>{if(n)switch(t){case 0:zi();break;case 1:break;case 12:_n(-1);break;case 13:_n(1);break;case 14:Jn(-1);break;case 15:Jn(1);break}else switch(t){case 0:xr();break;case 1:e||Wn();break;case 12:Zn(-1);break;case 13:Zn(1);break;case 14:Gn(-1);break;case 15:Gn(1);break}},g1={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},to=t=>{for(const e of ke)if(zr(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},I1=()=>{for(const t of ke)if(zr(t.address,t.data))return t;return g1},eo=(t=!1)=>{for(const e of ke)if(zr(e.address,e.data)){wi(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&wi(" ")},p1=t=>{J(49152,t|128,32)};let $t="",ro=1e9;const S1=()=>{const t=performance.now();if($t!==""&&(Vr(49152)<128||t-ro>1500)){ro=t;const e=$t.charCodeAt(0);p1(e),$t=$t.slice(1),$t.length===0&&Si()}};let no="";const x=t=>{t===no&&$t.length>0||(no=t,$t+=t)};let oo=0;const b=(t,e=300)=>{const n=performance.now();n-oo<e||(oo=n,x(t))},E1=t=>{t.length===1&&(t=to(t)),x(t)},B1=t=>{t.length===1&&(t=to(t)),x(t)},He=[],w=(t,e,n=!1,s=null)=>{const a={offAddr:t,onAddr:t+1,isSetAddr:e,writeOnly:n,isSet:!1,setFunc:s};return t>=49152&&(He[t-49152]=a,He[t+1-49152]=a),e>=49152&&(He[e-49152]=a),a},ie=()=>Math.floor(256*Math.random()),C1=t=>{t&=11,B.READBSR2.isSet=t===0,B.WRITEBSR2.isSet=t===1,B.OFFBSR2.isSet=t===2,B.RDWRBSR2.isSet=t===3,B.READBSR1.isSet=t===8,B.WRITEBSR1.isSet=t===9,B.OFFBSR1.isSet=t===10,B.RDWRBSR1.isSet=t===11,B.BSRBANK2.isSet=t<=3,B.BSRREADRAM.isSet=[0,3,8,11].includes(t)},B={STORE80:w(49152,49176,!0),RAMRD:w(49154,49171,!0),RAMWRT:w(49156,49172,!0),INTCXROM:w(49158,49173,!0),INTC8ROM:w(0,0),ALTZP:w(49160,49174,!0),SLOTC3ROM:w(49162,49175,!0),COLUMN80:w(49164,49183,!0),ALTCHARSET:w(49166,49182,!0),KBRDSTROBE:w(0,49168,!1,()=>{const t=Vr(49152)&127;J(49152,t,32)}),BSRBANK2:w(0,49169),BSRREADRAM:w(0,49170),CASSOUT:w(49184,0),SPEAKER:w(49200,0,!1,(t,e)=>{J(49200,ie()),RA(e)}),GCSTROBE:w(49216,0),EMUBYTE:w(0,49231,!1,()=>{J(49231,205)}),TEXT:w(49232,49178),MIXED:w(49234,49179),PAGE2:w(49236,49180),HIRES:w(49238,49181),AN0:w(49240,0),AN1:w(49242,0),AN2:w(49244,0),AN3:w(49246,0),CASSIN1:w(0,49248,!1,()=>{J(49248,ie())}),PB0:w(0,49249),PB1:w(0,49250),PB2:w(0,49251),JOYSTICK12:w(49252,0,!1,(t,e)=>{jn(e)}),JOYSTICK34:w(49254,0,!1,(t,e)=>{jn(e)}),CASSIN2:w(0,49256,!1,()=>{J(49256,ie())}),FASTCHIP_LOCK:w(49258,0),FASTCHIP_ENABLE:w(49259,0),FASTCHIP_SPEED:w(49261,0),JOYSTICKRESET:w(49264,0,!1,(t,e)=>{vi(e),J(49264,ie())}),BANKSEL:w(49267,0),LASER128EX:w(49268,0),READBSR2:w(49280,0),WRITEBSR2:w(49281,0),OFFBSR2:w(49282,0),RDWRBSR2:w(49283,0),READBSR1:w(49288,0),WRITEBSR1:w(49289,0),OFFBSR1:w(49290,0),RDWRBSR1:w(49291,0)};B.TEXT.isSet=!0;const m1=[49152,49153,49165,49167,49200,49236,49237,49183],io=(t,e,n)=>{if(t>1048575&&!m1.includes(t)){const a=Vr(t)>128?1:0;console.log(`${n} $${M(A.PC)}: $${M(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){t-=t&4,C1(t);return}if(t===49152&&!e){S1();return}const s=He[t-49152];if(!s){console.error("Unknown softswitch "+M(t)),J(t,ie());return}if(s.setFunc){s.setFunc(t,n);return}t===s.offAddr||t===s.onAddr?((!s.writeOnly||e)&&(s.isSet=t===s.onAddr),s.isSetAddr&&J(s.isSetAddr,s.isSet?141:13),t>=49184&&J(t,ie())):t===s.isSetAddr&&J(t,s.isSet?141:13)},D1=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,O=new Uint8Array(163584).fill(0),j=new Array(257).fill(0),ot=new Array(257).fill(0),Re=512,so=576,Ao=583,se=256,ye=256*Re,$e=256*so,w1=256*Ao,ao=256*se;let zt=0;const k1=()=>{const t=B.RAMRD.isSet?se:0,e=B.RAMWRT.isSet?se:0,n=B.PAGE2.isSet?se:0,s=B.STORE80.isSet?n:t,a=B.STORE80.isSet?n:e,g=B.STORE80.isSet&&B.HIRES.isSet?n:t,I=B.STORE80.isSet&&B.HIRES.isSet?n:e;for(let u=2;u<256;u++)j[u]=u+t,ot[u]=u+e;for(let u=4;u<=7;u++)j[u]=u+s,ot[u]=u+a;for(let u=32;u<=63;u++)j[u]=u+g,ot[u]=u+I},R1=()=>{const t=B.ALTZP.isSet?se:0;if(j[0]=t,j[1]=1+t,ot[0]=t,ot[1]=1+t,B.BSRREADRAM.isSet){for(let e=208;e<=255;e++)j[e]=e+t;if(!B.BSRBANK2.isSet)for(let e=208;e<=223;e++)j[e]=e-16+t}else for(let e=208;e<=255;e++)j[e]=Re+e-192},y1=()=>{const t=B.ALTZP.isSet?se:0,e=B.WRITEBSR1.isSet||B.WRITEBSR2.isSet||B.RDWRBSR1.isSet||B.RDWRBSR2.isSet;for(let n=192;n<=255;n++)ot[n]=-1;if(e){for(let n=208;n<=255;n++)ot[n]=n+t;if(!B.BSRBANK2.isSet)for(let n=208;n<=223;n++)ot[n]=n-16+t}},co=t=>B.INTCXROM.isSet?!1:t!==3?!0:B.SLOTC3ROM.isSet,T1=()=>!(B.INTCXROM.isSet||B.INTC8ROM.isSet||zt<=0),Jr=t=>{if(t<8){if(B.INTCXROM.isSet)return;t===3&&!B.SLOTC3ROM.isSet&&(B.INTC8ROM.isSet||(B.INTC8ROM.isSet=!0,zt=-1,vt())),zt===0&&(zt=t,vt())}else B.INTC8ROM.isSet=!1,zt=0,vt()},P1=()=>{j[192]=Re-192;for(let t=1;t<=7;t++){const e=192+t;j[e]=t+(co(t)?so-1:Re)}if(T1()){const t=Ao+8*(zt-1);for(let e=0;e<=7;e++){const n=200+e;j[n]=t+e}}else for(let t=200;t<=207;t++)j[t]=Re+t-192},vt=()=>{k1(),R1(),y1(),P1();for(let t=0;t<256;t++)j[t]=256*j[t],ot[t]=256*ot[t]},uo=new Map,lo=new Array(8),ze=(t,e=-1)=>{const n=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Jr(n),!co(n)))return;const s=lo[n];if(s!==void 0){const a=s(t,e);if(a>=0){const g=t>=49408?$e-256:ye;O[t-49152+g]=a}}},ve=(t,e)=>{lo[t]=e},Ae=(t,e,n=0,s=()=>{})=>{if(O.set(e.slice(0,256),$e+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,g=w1+(t-1)*2048;O.set(e.slice(256,a),g)}n&&uo.set(n,s)},d1=()=>{O.fill(255,0,131071);const t=D1.replace(/\n/g,""),e=new Uint8Array(Wt.Buffer.from(t,"base64"));O.set(e,ye),zt=0,vt()},L1=t=>t===49177?Tr?13:141:(t>=49296?ze(t):io(t,!1,A.cycleCount),t>=49232&&vt(),O[ye+t-49152]),Q=(t,e)=>{const n=$e+(t-1)*256+(e&255);return O[n]},P=(t,e,n)=>{if(n>=0){const s=$e+(t-1)*256+(e&255);O[s]=n&255}},E=t=>{const e=t>>>8;if(e===192)return L1(t);e>=193&&e<=199?ze(t):t===53247&&Jr(255);const n=j[e];return O[n+(t&255)]},_r=t=>{const e=t>>>8,n=j[e];return O[n+(t&255)]},b1=(t,e)=>{t>=49296?ze(t,e):io(t,!0,A.cycleCount),(t<=49167||t>=49232)&&vt()},k=(t,e)=>{const n=t>>>8;if(n===192)b1(t,e);else{n>=193&&n<=199?ze(t,e):t===53247&&Jr(255);const s=ot[n];if(s<0)return;O[s+(t&255)]=e}},Vr=t=>O[ye+t-49152],J=(t,e,n=1)=>{const s=ye+t-49152;O.fill(e,s,s+n)},fo=1024,ho=2048,jr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Hr=(t=!1)=>{let e=0,n=24,s=!1;if(t){if(B.TEXT.isSet||B.HIRES.isSet)return new Uint8Array;n=B.MIXED.isSet?20:24,s=B.COLUMN80.isSet&&!B.AN3.isSet}else{if(!B.TEXT.isSet&&!B.MIXED.isSet)return new Uint8Array;!B.TEXT.isSet&&B.MIXED.isSet&&(e=20),s=B.COLUMN80.isSet}if(s){const a=B.PAGE2.isSet&&!B.STORE80.isSet?ho:fo,g=new Uint8Array(80*(n-e)).fill(160);for(let I=e;I<n;I++){const u=80*(I-e);for(let C=0;C<40;C++)g[u+2*C+1]=O[a+jr[I]+C],g[u+2*C]=O[ao+a+jr[I]+C]}return g}else{const a=B.PAGE2.isSet?ho:fo,g=new Uint8Array(40*(n-e));for(let I=e;I<n;I++){const u=40*(I-e),C=a+jr[I];g.set(O.slice(C,C+40),u)}return g}},go=()=>Wt.Buffer.from(Hr().map(t=>t&=127)).toString(),M1=()=>{if(B.TEXT.isSet||!B.HIRES.isSet)return new Uint8Array;const t=B.COLUMN80.isSet&&!B.AN3.isSet,e=B.MIXED.isSet?160:192;if(t){const n=B.PAGE2.isSet&&!B.STORE80.isSet?16384:8192,s=new Uint8Array(80*e);for(let a=0;a<e;a++){const g=n+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);for(let I=0;I<40;I++)s[a*80+2*I+1]=O[g+I],s[a*80+2*I]=O[ao+g+I]}return s}else{const n=B.PAGE2.isSet?16384:8192,s=new Uint8Array(40*e);for(let a=0;a<e;a++){const g=n+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);s.set(O.slice(g,g+40),a*40)}return s}},F1=t=>{const e=j[t>>>8];return O.slice(e,e+512)},$r=(t,e)=>{const n=ot[t>>>8]+(t&255);O.set(e,n),eo()},zr=(t,e)=>{for(let n=0;n<e.length;n++)if(E(t+n)!==e[n])return!1;return!0},U1=()=>{const t=[""],e=j[0],n=O.slice(e,e+256);t[0]="     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F";for(let s=0;s<16;s++){let a=M(16*s)+":";for(let g=0;g<16;g++)a+=" "+M(n[s*16+g]);t[s+1]=a}return t.join(`
`)},A={cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1},Io=t=>{A.XReg=t},po=t=>{A.YReg=t},tr=t=>{A.cycleCount=t},Q1=t=>{So(),Object.assign(A,t)},So=()=>{A.Accum=0,A.XReg=0,A.YReg=0,A.PStatus=36,A.StackPtr=255,gt(E(65533)*256+E(65532)),A.flagIRQ=0,A.flagNMI=!1},Eo=t=>{gt((A.PC+t+65536)%65536)},gt=t=>{A.PC=t},Bo=t=>{A.PStatus=t|48},N1=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),Co=()=>`A=${M(A.Accum)} X=${M(A.XReg)} Y=${M(A.YReg)} P=${M(A.PStatus)} ${N1(A.PStatus)} S=${M(A.StackPtr)}`,O1=()=>`PC= ${M(A.PC)}  ${Co()}`,Te=new Array(256).fill(""),mt=(t,e)=>{Te[A.StackPtr]=t,k(256+A.StackPtr,e),A.StackPtr=(A.StackPtr+255)%256},Dt=()=>{A.StackPtr=(A.StackPtr+1)%256;const t=E(256+A.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},it=()=>(A.PStatus&1)!==0,d=(t=!0)=>A.PStatus=t?A.PStatus|1:A.PStatus&254,mo=()=>(A.PStatus&2)!==0,Do=(t=!0)=>A.PStatus=t?A.PStatus|2:A.PStatus&253,K1=()=>(A.PStatus&4)!==0,vr=(t=!0)=>A.PStatus=t?A.PStatus|4:A.PStatus&251,wo=()=>(A.PStatus&8)!==0,_=()=>wo()?1:0,tn=(t=!0)=>A.PStatus=t?A.PStatus|8:A.PStatus&247,en=(t=!0)=>A.PStatus=t?A.PStatus|16:A.PStatus&239,ko=()=>(A.PStatus&64)!==0,Pe=(t=!0)=>A.PStatus=t?A.PStatus|64:A.PStatus&191,Ro=()=>(A.PStatus&128)!==0,yo=(t=!0)=>A.PStatus=t?A.PStatus|128:A.PStatus&127,D=t=>{Do(t===0),yo(t>=128)},wt=(t,e)=>{if(t){const n=A.PC;return Eo(e>127?e-256:e),3+q(n,A.PC)}return 2},y=(t,e)=>(t+e+256)%256,m=(t,e)=>e*256+t,L=(t,e,n)=>(e*256+t+n+65536)%65536,q=(t,e)=>t>>8!==e>>8?1:0,yt=new Array(256),f=(t,e,n,s,a)=>{console.assert(!yt[n],"Duplicate instruction: "+t+" mode="+e),yt[n]={name:t,pcode:n,mode:e,PC:s,execute:a}},Tt=(t,e,n)=>{const s=E(t),a=E((t+1)%256),g=L(s,a,A.YReg);e(g);let I=5+q(g,m(s,a));return n&&(I+=_()),I},Pt=(t,e,n)=>{const s=E(t),a=E((t+1)%256),g=m(s,a);e(g);let I=5;return n&&(I+=_()),I},To=t=>{let e=(A.Accum&15)+(t&15)+(it()?1:0);e>=10&&(e+=6);let n=(A.Accum&240)+(t&240)+e;const s=A.Accum<=127&&t<=127,a=A.Accum>=128&&t>=128;Pe((n&255)>=128?s:a),d(n>=160),it()&&(n+=96),A.Accum=n&255,D(A.Accum)},er=t=>{let e=A.Accum+t+(it()?1:0);d(e>=256),e=e%256;const n=A.Accum<=127&&t<=127,s=A.Accum>=128&&t>=128;Pe(e>=128?n:s),A.Accum=e,D(A.Accum)},dt=t=>{wo()?To(E(t)):er(E(t))};f("ADC",l.IMM,105,2,t=>(_()?To(t):er(t),2+_())),f("ADC",l.ZP_REL,101,2,t=>(dt(t),3+_())),f("ADC",l.ZP_X,117,2,t=>(dt(y(t,A.XReg)),4+_())),f("ADC",l.ABS,109,3,(t,e)=>(dt(m(t,e)),4+_())),f("ADC",l.ABS_X,125,3,(t,e)=>{const n=L(t,e,A.XReg);return dt(n),4+_()+q(n,m(t,e))}),f("ADC",l.ABS_Y,121,3,(t,e)=>{const n=L(t,e,A.YReg);return dt(n),4+_()+q(n,m(t,e))}),f("ADC",l.IND_X,97,2,t=>{const e=y(t,A.XReg);return dt(m(E(e),E(e+1))),6+_()}),f("ADC",l.IND_Y,113,2,t=>Tt(t,dt,!0)),f("ADC",l.IND,114,2,t=>Pt(t,dt,!0));const Lt=t=>{A.Accum&=E(t),D(A.Accum)};f("AND",l.IMM,41,2,t=>(A.Accum&=t,D(A.Accum),2)),f("AND",l.ZP_REL,37,2,t=>(Lt(t),3)),f("AND",l.ZP_X,53,2,t=>(Lt(y(t,A.XReg)),4)),f("AND",l.ABS,45,3,(t,e)=>(Lt(m(t,e)),4)),f("AND",l.ABS_X,61,3,(t,e)=>{const n=L(t,e,A.XReg);return Lt(n),4+q(n,m(t,e))}),f("AND",l.ABS_Y,57,3,(t,e)=>{const n=L(t,e,A.YReg);return Lt(n),4+q(n,m(t,e))}),f("AND",l.IND_X,33,2,t=>{const e=y(t,A.XReg);return Lt(m(E(e),E(e+1))),6}),f("AND",l.IND_Y,49,2,t=>Tt(t,Lt,!1)),f("AND",l.IND,50,2,t=>Pt(t,Lt,!1));const rr=t=>{let e=E(t);E(t),d((e&128)===128),e=(e<<1)%256,k(t,e),D(e)};f("ASL",l.IMPLIED,10,1,()=>(d((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256,D(A.Accum),2)),f("ASL",l.ZP_REL,6,2,t=>(rr(t),5)),f("ASL",l.ZP_X,22,2,t=>(rr(y(t,A.XReg)),6)),f("ASL",l.ABS,14,3,(t,e)=>(rr(m(t,e)),6)),f("ASL",l.ABS_X,30,3,(t,e)=>{const n=L(t,e,A.XReg);return rr(n),6+q(n,m(t,e))}),f("BCC",l.ZP_REL,144,2,t=>wt(!it(),t)),f("BCS",l.ZP_REL,176,2,t=>wt(it(),t)),f("BEQ",l.ZP_REL,240,2,t=>wt(mo(),t)),f("BMI",l.ZP_REL,48,2,t=>wt(Ro(),t)),f("BNE",l.ZP_REL,208,2,t=>wt(!mo(),t)),f("BPL",l.ZP_REL,16,2,t=>wt(!Ro(),t)),f("BVC",l.ZP_REL,80,2,t=>wt(!ko(),t)),f("BVS",l.ZP_REL,112,2,t=>wt(ko(),t)),f("BRA",l.ZP_REL,128,2,t=>wt(!0,t));const de=t=>{Do((A.Accum&t)===0),yo((t&128)!==0),Pe((t&64)!==0)};f("BIT",l.ZP_REL,36,2,t=>(de(E(t)),3)),f("BIT",l.ABS,44,3,(t,e)=>(de(E(m(t,e))),4)),f("BIT",l.IMM,137,2,t=>(de(t),2)),f("BIT",l.ZP_X,52,2,t=>(de(E(y(t,A.XReg))),4)),f("BIT",l.ABS_X,60,3,(t,e)=>{const n=L(t,e,A.XReg);return de(E(n)),4+q(n,m(t,e))});const rn=(t,e,n=0)=>{const s=(A.PC+n)%65536,a=E(e),g=E(e+1);mt(`${t} $`+M(g)+M(a),Math.trunc(s/256)),mt(t,s%256),mt("P",A.PStatus),tn(!1),vr();const I=L(a,g,t==="BRK"?-1:0);gt(I)},Po=()=>(en(),rn("BRK",65534,2),7);f("BRK",l.IMPLIED,0,1,Po);const Y1=()=>K1()?0:(en(!1),rn("IRQ",65534),7),q1=()=>(rn("NMI",65530),7);f("CLC",l.IMPLIED,24,1,()=>(d(!1),2)),f("CLD",l.IMPLIED,216,1,()=>(tn(!1),2)),f("CLI",l.IMPLIED,88,1,()=>(vr(!1),2)),f("CLV",l.IMPLIED,184,1,()=>(Pe(!1),2));const te=t=>{const e=E(t);d(A.Accum>=e),D((A.Accum-e+256)%256)},x1=t=>{const e=E(t);d(A.Accum>=e),D((A.Accum-e+256)%256)};f("CMP",l.IMM,201,2,t=>(d(A.Accum>=t),D((A.Accum-t+256)%256),2)),f("CMP",l.ZP_REL,197,2,t=>(te(t),3)),f("CMP",l.ZP_X,213,2,t=>(te(y(t,A.XReg)),4)),f("CMP",l.ABS,205,3,(t,e)=>(te(m(t,e)),4)),f("CMP",l.ABS_X,221,3,(t,e)=>{const n=L(t,e,A.XReg);return x1(n),4+q(n,m(t,e))}),f("CMP",l.ABS_Y,217,3,(t,e)=>{const n=L(t,e,A.YReg);return te(n),4+q(n,m(t,e))}),f("CMP",l.IND_X,193,2,t=>{const e=y(t,A.XReg);return te(m(E(e),E(e+1))),6}),f("CMP",l.IND_Y,209,2,t=>Tt(t,te,!1)),f("CMP",l.IND,210,2,t=>Pt(t,te,!1));const Lo=t=>{const e=E(t);d(A.XReg>=e),D((A.XReg-e+256)%256)};f("CPX",l.IMM,224,2,t=>(d(A.XReg>=t),D((A.XReg-t+256)%256),2)),f("CPX",l.ZP_REL,228,2,t=>(Lo(t),3)),f("CPX",l.ABS,236,3,(t,e)=>(Lo(m(t,e)),4));const bo=t=>{const e=E(t);d(A.YReg>=e),D((A.YReg-e+256)%256)};f("CPY",l.IMM,192,2,t=>(d(A.YReg>=t),D((A.YReg-t+256)%256),2)),f("CPY",l.ZP_REL,196,2,t=>(bo(t),3)),f("CPY",l.ABS,204,3,(t,e)=>(bo(m(t,e)),4));const nr=t=>{const e=y(E(t),-1);k(t,e),D(e)};f("DEC",l.IMPLIED,58,1,()=>(A.Accum=y(A.Accum,-1),D(A.Accum),2)),f("DEC",l.ZP_REL,198,2,t=>(nr(t),5)),f("DEC",l.ZP_X,214,2,t=>(nr(y(t,A.XReg)),6)),f("DEC",l.ABS,206,3,(t,e)=>(nr(m(t,e)),6)),f("DEC",l.ABS_X,222,3,(t,e)=>{const n=L(t,e,A.XReg);return E(n),nr(n),7}),f("DEX",l.IMPLIED,202,1,()=>(A.XReg=y(A.XReg,-1),D(A.XReg),2)),f("DEY",l.IMPLIED,136,1,()=>(A.YReg=y(A.YReg,-1),D(A.YReg),2));const bt=t=>{A.Accum^=E(t),D(A.Accum)};f("EOR",l.IMM,73,2,t=>(A.Accum^=t,D(A.Accum),2)),f("EOR",l.ZP_REL,69,2,t=>(bt(t),3)),f("EOR",l.ZP_X,85,2,t=>(bt(y(t,A.XReg)),4)),f("EOR",l.ABS,77,3,(t,e)=>(bt(m(t,e)),4)),f("EOR",l.ABS_X,93,3,(t,e)=>{const n=L(t,e,A.XReg);return bt(n),4+q(n,m(t,e))}),f("EOR",l.ABS_Y,89,3,(t,e)=>{const n=L(t,e,A.YReg);return bt(n),4+q(n,m(t,e))}),f("EOR",l.IND_X,65,2,t=>{const e=y(t,A.XReg);return bt(m(E(e),E(e+1))),6}),f("EOR",l.IND_Y,81,2,t=>Tt(t,bt,!1)),f("EOR",l.IND,82,2,t=>Pt(t,bt,!1));const or=t=>{const e=y(E(t),1);k(t,e),D(e)};f("INC",l.IMPLIED,26,1,()=>(A.Accum=y(A.Accum,1),D(A.Accum),2)),f("INC",l.ZP_REL,230,2,t=>(or(t),5)),f("INC",l.ZP_X,246,2,t=>(or(y(t,A.XReg)),6)),f("INC",l.ABS,238,3,(t,e)=>(or(m(t,e)),6)),f("INC",l.ABS_X,254,3,(t,e)=>{const n=L(t,e,A.XReg);return E(n),or(n),7}),f("INX",l.IMPLIED,232,1,()=>(A.XReg=y(A.XReg,1),D(A.XReg),2)),f("INY",l.IMPLIED,200,1,()=>(A.YReg=y(A.YReg,1),D(A.YReg),2)),f("JMP",l.ABS,76,3,(t,e)=>(gt(L(t,e,-3)),3)),f("JMP",l.IND,108,3,(t,e)=>{const n=m(t,e);return t=E(n),e=E((n+1)%65536),gt(L(t,e,-3)),6}),f("JMP",l.IND_X,124,3,(t,e)=>{const n=L(t,e,A.XReg);return t=E(n),e=E((n+1)%65536),gt(L(t,e,-3)),6}),f("JSR",l.ABS,32,3,(t,e)=>{const n=(A.PC+2)%65536;return mt("JSR $"+M(e)+M(t),Math.trunc(n/256)),mt("JSR",n%256),gt(L(t,e,-3)),6});const Mt=t=>{A.Accum=E(t),D(A.Accum)};f("LDA",l.IMM,169,2,t=>(A.Accum=t,D(A.Accum),2)),f("LDA",l.ZP_REL,165,2,t=>(Mt(t),3)),f("LDA",l.ZP_X,181,2,t=>(Mt(y(t,A.XReg)),4)),f("LDA",l.ABS,173,3,(t,e)=>(Mt(m(t,e)),4)),f("LDA",l.ABS_X,189,3,(t,e)=>{const n=L(t,e,A.XReg);return Mt(n),4+q(n,m(t,e))}),f("LDA",l.ABS_Y,185,3,(t,e)=>{const n=L(t,e,A.YReg);return Mt(n),4+q(n,m(t,e))}),f("LDA",l.IND_X,161,2,t=>{const e=y(t,A.XReg);return Mt(m(E(e),E((e+1)%256))),6}),f("LDA",l.IND_Y,177,2,t=>Tt(t,Mt,!1)),f("LDA",l.IND,178,2,t=>Pt(t,Mt,!1));const ir=t=>{A.XReg=E(t),D(A.XReg)};f("LDX",l.IMM,162,2,t=>(A.XReg=t,D(A.XReg),2)),f("LDX",l.ZP_REL,166,2,t=>(ir(t),3)),f("LDX",l.ZP_Y,182,2,t=>(ir(y(t,A.YReg)),4)),f("LDX",l.ABS,174,3,(t,e)=>(ir(m(t,e)),4)),f("LDX",l.ABS_Y,190,3,(t,e)=>{const n=L(t,e,A.YReg);return ir(n),4+q(n,m(t,e))});const sr=t=>{A.YReg=E(t),D(A.YReg)};f("LDY",l.IMM,160,2,t=>(A.YReg=t,D(A.YReg),2)),f("LDY",l.ZP_REL,164,2,t=>(sr(t),3)),f("LDY",l.ZP_X,180,2,t=>(sr(y(t,A.XReg)),4)),f("LDY",l.ABS,172,3,(t,e)=>(sr(m(t,e)),4)),f("LDY",l.ABS_X,188,3,(t,e)=>{const n=L(t,e,A.XReg);return sr(n),4+q(n,m(t,e))});const Ar=t=>{let e=E(t);E(t),d((e&1)===1),e>>=1,k(t,e),D(e)};f("LSR",l.IMPLIED,74,1,()=>(d((A.Accum&1)===1),A.Accum>>=1,D(A.Accum),2)),f("LSR",l.ZP_REL,70,2,t=>(Ar(t),5)),f("LSR",l.ZP_X,86,2,t=>(Ar(y(t,A.XReg)),6)),f("LSR",l.ABS,78,3,(t,e)=>(Ar(m(t,e)),6)),f("LSR",l.ABS_X,94,3,(t,e)=>{const n=L(t,e,A.XReg);return Ar(n),6+q(n,m(t,e))}),f("NOP",l.IMPLIED,234,1,()=>2);const Ft=t=>{A.Accum|=E(t),D(A.Accum)};f("ORA",l.IMM,9,2,t=>(A.Accum|=t,D(A.Accum),2)),f("ORA",l.ZP_REL,5,2,t=>(Ft(t),3)),f("ORA",l.ZP_X,21,2,t=>(Ft(y(t,A.XReg)),4)),f("ORA",l.ABS,13,3,(t,e)=>(Ft(m(t,e)),4)),f("ORA",l.ABS_X,29,3,(t,e)=>{const n=L(t,e,A.XReg);return Ft(n),4+q(n,m(t,e))}),f("ORA",l.ABS_Y,25,3,(t,e)=>{const n=L(t,e,A.YReg);return Ft(n),4+q(n,m(t,e))}),f("ORA",l.IND_X,1,2,t=>{const e=y(t,A.XReg);return Ft(m(E(e),E(e+1))),6}),f("ORA",l.IND_Y,17,2,t=>Tt(t,Ft,!1)),f("ORA",l.IND,18,2,t=>Pt(t,Ft,!1)),f("PHA",l.IMPLIED,72,1,()=>(mt("PHA",A.Accum),3)),f("PHP",l.IMPLIED,8,1,()=>(mt("PHP",A.PStatus|16),3)),f("PHX",l.IMPLIED,218,1,()=>(mt("PHX",A.XReg),3)),f("PHY",l.IMPLIED,90,1,()=>(mt("PHY",A.YReg),3)),f("PLA",l.IMPLIED,104,1,()=>(A.Accum=Dt(),D(A.Accum),4)),f("PLP",l.IMPLIED,40,1,()=>(Bo(Dt()),4)),f("PLX",l.IMPLIED,250,1,()=>(A.XReg=Dt(),D(A.XReg),4)),f("PLY",l.IMPLIED,122,1,()=>(A.YReg=Dt(),D(A.YReg),4));const ar=t=>{let e=E(t);E(t);const n=it()?1:0;d((e&128)===128),e=(e<<1)%256|n,k(t,e),D(e)};f("ROL",l.IMPLIED,42,1,()=>{const t=it()?1:0;return d((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256|t,D(A.Accum),2}),f("ROL",l.ZP_REL,38,2,t=>(ar(t),5)),f("ROL",l.ZP_X,54,2,t=>(ar(y(t,A.XReg)),6)),f("ROL",l.ABS,46,3,(t,e)=>(ar(m(t,e)),6)),f("ROL",l.ABS_X,62,3,(t,e)=>{const n=L(t,e,A.XReg);return ar(n),6+q(n,m(t,e))});const cr=t=>{let e=E(t);E(t);const n=it()?128:0;d((e&1)===1),e=e>>1|n,k(t,e),D(e)};f("ROR",l.IMPLIED,106,1,()=>{const t=it()?128:0;return d((A.Accum&1)===1),A.Accum=A.Accum>>1|t,D(A.Accum),2}),f("ROR",l.ZP_REL,102,2,t=>(cr(t),5)),f("ROR",l.ZP_X,118,2,t=>(cr(y(t,A.XReg)),6)),f("ROR",l.ABS,110,3,(t,e)=>(cr(m(t,e)),6)),f("ROR",l.ABS_X,126,3,(t,e)=>{const n=L(t,e,A.XReg);return cr(n),6+q(n,m(t,e))}),f("RTI",l.IMPLIED,64,1,()=>(Bo(Dt()),en(!1),gt(m(Dt(),Dt())-1),6)),f("RTS",l.IMPLIED,96,1,()=>(gt(m(Dt(),Dt())),6));const Mo=t=>{const e=255-t;let n=A.Accum+e+(it()?1:0);const s=n>=256,a=A.Accum<=127&&e<=127,g=A.Accum>=128&&e>=128;Pe(n%256>=128?a:g);const I=(A.Accum&15)-(t&15)+(it()?0:-1);n=A.Accum-t+(it()?0:-1),n<0&&(n-=96),I<0&&(n-=6),A.Accum=n&255,D(A.Accum),d(s)},Ut=t=>{_()?Mo(E(t)):er(255-E(t))};f("SBC",l.IMM,233,2,t=>(_()?Mo(t):er(255-t),2+_())),f("SBC",l.ZP_REL,229,2,t=>(Ut(t),3+_())),f("SBC",l.ZP_X,245,2,t=>(Ut(y(t,A.XReg)),4+_())),f("SBC",l.ABS,237,3,(t,e)=>(Ut(m(t,e)),4+_())),f("SBC",l.ABS_X,253,3,(t,e)=>{const n=L(t,e,A.XReg);return Ut(n),4+_()+q(n,m(t,e))}),f("SBC",l.ABS_Y,249,3,(t,e)=>{const n=L(t,e,A.YReg);return Ut(n),4+_()+q(n,m(t,e))}),f("SBC",l.IND_X,225,2,t=>{const e=y(t,A.XReg);return Ut(m(E(e),E(e+1))),6+_()}),f("SBC",l.IND_Y,241,2,t=>Tt(t,Ut,!0)),f("SBC",l.IND,242,2,t=>Pt(t,Ut,!0)),f("SEC",l.IMPLIED,56,1,()=>(d(),2)),f("SED",l.IMPLIED,248,1,()=>(tn(),2)),f("SEI",l.IMPLIED,120,1,()=>(vr(),2)),f("STA",l.ZP_REL,133,2,t=>(k(t,A.Accum),3)),f("STA",l.ZP_X,149,2,t=>(k(y(t,A.XReg),A.Accum),4)),f("STA",l.ABS,141,3,(t,e)=>(k(m(t,e),A.Accum),4)),f("STA",l.ABS_X,157,3,(t,e)=>{const n=L(t,e,A.XReg);return E(n),k(n,A.Accum),5}),f("STA",l.ABS_Y,153,3,(t,e)=>(k(L(t,e,A.YReg),A.Accum),5)),f("STA",l.IND_X,129,2,t=>{const e=y(t,A.XReg);return k(m(E(e),E(e+1)),A.Accum),6});const Fo=t=>{k(t,A.Accum)};f("STA",l.IND_Y,145,2,t=>(Tt(t,Fo,!1),6)),f("STA",l.IND,146,2,t=>Pt(t,Fo,!1)),f("STX",l.ZP_REL,134,2,t=>(k(t,A.XReg),3)),f("STX",l.ZP_Y,150,2,t=>(k(y(t,A.YReg),A.XReg),4)),f("STX",l.ABS,142,3,(t,e)=>(k(m(t,e),A.XReg),4)),f("STY",l.ZP_REL,132,2,t=>(k(t,A.YReg),3)),f("STY",l.ZP_X,148,2,t=>(k(y(t,A.XReg),A.YReg),4)),f("STY",l.ABS,140,3,(t,e)=>(k(m(t,e),A.YReg),4)),f("STZ",l.ZP_REL,100,2,t=>(k(t,0),3)),f("STZ",l.ZP_X,116,2,t=>(k(y(t,A.XReg),0),4)),f("STZ",l.ABS,156,3,(t,e)=>(k(m(t,e),0),4)),f("STZ",l.ABS_X,158,3,(t,e)=>{const n=L(t,e,A.XReg);return E(n),k(n,0),5}),f("TAX",l.IMPLIED,170,1,()=>(A.XReg=A.Accum,D(A.XReg),2)),f("TAY",l.IMPLIED,168,1,()=>(A.YReg=A.Accum,D(A.YReg),2)),f("TSX",l.IMPLIED,186,1,()=>(A.XReg=A.StackPtr,D(A.XReg),2)),f("TXA",l.IMPLIED,138,1,()=>(A.Accum=A.XReg,D(A.Accum),2)),f("TXS",l.IMPLIED,154,1,()=>(A.StackPtr=A.XReg,2)),f("TYA",l.IMPLIED,152,1,()=>(A.Accum=A.YReg,D(A.Accum),2));const X1=[2,34,66,98,130,194,226],st="???";X1.forEach(t=>{f(st,l.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)f(st,l.IMPLIED,3+16*t,1,()=>1),f(st,l.IMPLIED,7+16*t,1,()=>1),f(st,l.IMPLIED,11+16*t,1,()=>1),f(st,l.IMPLIED,15+16*t,1,()=>1);f(st,l.IMPLIED,68,2,()=>3),f(st,l.IMPLIED,84,2,()=>4),f(st,l.IMPLIED,212,2,()=>4),f(st,l.IMPLIED,244,2,()=>4),f(st,l.IMPLIED,92,3,()=>8),f(st,l.IMPLIED,220,3,()=>4),f(st,l.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)yt[t]||f("BRK",l.IMPLIED,t,1,Po);const z=(t,e,n)=>{const s=e&7,a=e>>>3;return t[a]|=n>>>s,s&&(t[a+1]|=n<<8-s),e+8},ur=(t,e,n)=>(e=z(t,e,n>>>1|170),e=z(t,e,n|170),e),nn=(t,e)=>(e=z(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const W1=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),s=[0,2,1,3];for(let g=0;g<84;g++)n[g]=s[t[g]&3]|s[t[g+86]&3]<<2|s[t[g+172]&3]<<4;n[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,n[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let g=0;g<256;g++)n[86+g]=t[g]>>>2;n[342]=n[341];let a=342;for(;a>1;)a--,n[a]^=n[a-1];for(let g=0;g<343;g++)n[g]=e[n[g]];return n};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const G1=(t,e,n)=>{let s=0;const a=new Uint8Array(6646).fill(0);for(let g=0;g<16;g++)s=nn(a,s);for(let g=0;g<16;g++){s=z(a,s,213),s=z(a,s,170),s=z(a,s,150),s=ur(a,s,254),s=ur(a,s,e),s=ur(a,s,g),s=ur(a,s,254^e^g),s=z(a,s,222),s=z(a,s,170),s=z(a,s,235);for(let C=0;C<7;C++)s=nn(a,s);s=z(a,s,213),s=z(a,s,170),s=z(a,s,173);const I=g===15?15:g*(n?8:7)%15,u=W1(t.slice(I*256,I*256+256));for(let C=0;C<u.length;C++)s=z(a,s,u[C]);s=z(a,s,222),s=z(a,s,170),s=z(a,s,235);for(let C=0;C<16;C++)s=nn(a,s)}return a},Z1=(t,e)=>{if(t.length!==35*16*256)return new Uint8Array;const n=new Uint8Array(512*3+512*35*13).fill(0);n.set(we(`WOZ2ÿ
\r
`),0),n.set(we("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(we("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(we("TMAP"),80),n[84]=160,n.fill(255,88,88+160);let s=0;for(let a=0;a<35;a++)s=88+(a<<2),a>0&&(n[s-1]=a),n[s]=n[s+1]=a;n.set(we("TRKS"),248),n.set(Nn(1280+35*13*512),252);for(let a=0;a<35;a++){s=256+(a<<3),n.set(ji(3+a*13),s),n[s+2]=13,n.set(Nn(50304),s+4);const g=t.slice(a*16*256,(a+1)*16*256),I=G1(g,a,e);s=512*(3+13*a),n.set(I,s)}return n},J1=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,C)=>u!==e[C])===void 0))return!1;t.isWriteProtected=e[22]===1;const a=e.slice(8,12),g=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,I=$i(e,12);if(g!==0&&g!==I)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const C=e[88+u*2];if(C<255){const T=256+8*C,F=e.slice(T,T+8);t.trackStart[u]=512*(F[0]+(F[1]<<8)),t.trackNbits[u]=F[4]+(F[5]<<8)+(F[6]<<16)+F[7]*2**24}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},_1=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,g)=>a!==e[g])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const g=e[88+a*2];if(g<255){t.trackStart[a]=256+g*6656;const I=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=I[2]+(I[3]<<8)}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},V1=t=>{const e=t.toLowerCase(),n=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return n||s},j1=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),a=Z1(e,s);return a.length===0?new Uint8Array:(t.filename=On(t.filename,"woz"),t.diskHasChanges=!0,a)},Uo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),H1=(t,e)=>{const n=Uo(e.slice(24,28)),s=Uo(e.slice(28,32));let a="";for(let g=0;g<4;g++)a+=String.fromCharCode(e[g]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=On(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(n,n+s))},Qo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},$1=(t,e)=>{t.diskHasChanges=!1;const n=t.filename.toLowerCase();if(Qo(n)){if(t.hardDrive=!0,t.status="",n.endsWith(".hdv")||n.endsWith(".po"))return e;if(n.endsWith(".2mg"))return H1(t,e)}return V1(t.filename)&&(e=j1(t,e)),J1(t,e)||_1(t,e)?e:(n!==""&&console.error("Unknown disk format."),new Uint8Array)},z1=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let ae=0;const v={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},No=t=>{v.MOTOR_RUNNING=!1,qo(t),t.halftrack=68,t.prevHalfTrack=68},v1=(t=!1)=>{if(t){const e=Ir();e.motorRunning&&xo(e)}else Ce(Gt.MOTOR_OFF)},Oo=(t,e)=>{t.trackStart[t.halftrack]>0&&(t.prevHalfTrack=t.halftrack),t.halftrack+=e,t.halftrack<0||t.halftrack>68?(Ce(Gt.TRACK_END),t.halftrack=t.halftrack<0?0:t.halftrack>68?68:t.halftrack):Ce(Gt.TRACK_SEEK),t.status=` Track ${t.halftrack/2}`,At(),t.trackStart[t.halftrack]>0&&t.prevHalfTrack!==t.halftrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack])),t.trackLocation>3&&(t.trackLocation-=4))},Ko=[128,64,32,16,8,4,2,1],ts=[127,191,223,239,247,251,253,254],on=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let n;if(t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[s],g=t.trackLocation&7;n=(a&Ko[g])>>7-g}else n=1;return t.trackLocation++,n};let tt=0;const es=(t,e)=>{if(e.length===0)return 0;let n=0;if(tt===0){for(;on(t,e)===0;);tt=64;for(let s=5;s>=0;s--)tt|=on(t,e)<<s}else{const s=on(t,e);tt=tt<<1|s}return n=tt,tt>127&&(tt=0),n};let lr=0;const sn=(t,e,n)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[s];const g=t.trackLocation&7;n?a|=Ko[g]:a&=ts[g],e[s]=a}t.trackLocation++},Yo=(t,e,n)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&tt>0){if(n>=16)for(let s=7;s>=0;s--)sn(t,e,tt&2**s?1:0);n>=36&&sn(t,e,0),n>=40&&sn(t,e,0),An.push(n>=40?2:n>=36?1:tt),t.diskHasChanges=!0,tt=0}},qo=t=>{ae=0,v.MOTOR_RUNNING||(t.motorRunning=!1),At(),Ce(Gt.MOTOR_OFF)},xo=t=>{ae&&(clearTimeout(ae),ae=0),t.motorRunning=!0,At(),Ce(Gt.MOTOR_ON)},rs=t=>{ae===0&&(ae=setTimeout(()=>qo(t),1e3))};let An=[];const fr=t=>{An.length>0&&t.halftrack===2*0&&(An=[])},hr=[0,0,0,0],ns=(t,e)=>{if(t>=49408)return-1;let n=Ir();const s=ps();if(n.hardDrive)return 0;let a=0;const g=A.cycleCount-lr;switch(t=t&15,t){case v.DATA_LATCH_OFF:v.DATA_LATCH=!1,n.motorRunning&&!n.writeMode&&(a=es(n,s));break;case v.MOTOR_ON:v.MOTOR_RUNNING=!0,xo(n),fr(n);break;case v.MOTOR_OFF:v.MOTOR_RUNNING=!1,rs(n),fr(n);break;case v.DRIVE1:case v.DRIVE2:{const I=t===v.DRIVE1?1:2,u=Ir();Is(I),n=Ir(),n!==u&&u.motorRunning&&(u.motorRunning=!1,n.motorRunning=!0,At());break}case v.WRITE_OFF:n.motorRunning&&n.writeMode&&(Yo(n,s,g),lr=A.cycleCount),n.writeMode=!1,v.DATA_LATCH&&(a=n.isWriteProtected?255:0),fr(n);break;case v.WRITE_ON:n.writeMode=!0,lr=A.cycleCount,e>=0&&(tt=e);break;case v.DATA_LATCH_ON:v.DATA_LATCH=!0,n.motorRunning&&(n.writeMode&&(Yo(n,s,g),lr=A.cycleCount),e>=0&&(tt=e));break;default:{if(t<0||t>7)break;hr[Math.floor(t/2)]=t%2;const I=hr[(n.currentPhase+1)%4],u=hr[(n.currentPhase+3)%4];hr[n.currentPhase]||(n.motorRunning&&I?(Oo(n,1),n.currentPhase=(n.currentPhase+1)%4):n.motorRunning&&u&&(Oo(n,-1),n.currentPhase=(n.currentPhase+3)%4)),fr(n);break}}return a},os=()=>{Ae(6,Uint8Array.from(z1)),ve(6,ns)},Xo=t=>{let e=l.IMPLIED,n=-1;return t.length>0&&(t.startsWith("#")?(e=l.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=l.IND_Y:t.endsWith(",X)")?e=l.IND_X:e=l.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?l.ABS_X:l.ZP_X:t.endsWith(",Y")?e=t.length>5?l.ABS_Y:l.ZP_Y:e=t.length>3?l.ABS:l.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),n=parseInt(t)),[e,n]};let ce={};const is=t=>{const e=t.split(/([+-])/);return{label:e[0]?e[0]:"",operation:e[1]?e[1]:"",value:e[2]?parseInt(e[2].replace("#","").replace("$","0x")):0}},ss=(t,e,n,s)=>{let a=l.IMPLIED,g=-1;if(n.match(/^[#]?[$0-9()]+/))return Xo(n);const I=is(n);if(I.label){const u=I.label.startsWith("#");if(u&&(I.label=I.label.substring(1)),I.label in ce)g=ce[I.label];else if(s===2)throw new Error("Missing label: "+I.label);if(I.operation&&I.value){switch(I.operation){case"+":g+=I.value;break;case"-":g-=I.value;break;default:throw new Error("Unknown operation in operand: "+n)}g=(g%65536+65536)%65536}Fr(e)?(a=l.ZP_REL,g=g-t+254,g>255&&(g-=256)):u?a=l.IMM:a=g>=0&&g<=255?l.ZP_REL:l.ABS}return[a,g]},As=(t,e)=>{t=t.replace(/\s+/g," ");const n=t.split(" ");return{label:n[0]?n[0]:e,instr:n[1]?n[1]:"",operand:n[2]?n[2]:""}},as=(t,e)=>{if(t.label in ce)throw new Error("Redefined label: "+t.label);if(t.instr==="EQU"){const[n,s]=Xo(t.operand);if(n!==l.ABS&&n!==l.ZP_REL)throw new Error("Illegal EQU value: "+t.operand);ce[t.label]=s}else ce[t.label]=e},cs=(t,e)=>{const n=[],s=yt[t];return n.push(t),e>=0&&(n.push(e%256),s.PC===3&&n.push(Math.trunc(e/256))),n},Wo=(t,e,n)=>{let s=t;const a=[];let g="";return e.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;(I+"                   ").slice(0,30)+M(s,4)+"";const u=As(I,g);if(g="",!u.instr){g=u.label;return}if(u.instr==="ORG"||(n===1&&u.label&&as(u,s),u.instr==="EQU"))return;const[C,T]=ss(s,u.instr,u.operand,n);if(n===2&&Fr(u.instr)&&(T<0||T>255))throw new Error(`Branch instruction out of range: ${I} value: ${T} pass: ${n}`);const F=yt.findIndex(at=>at&&at.name===u.instr&&at.mode===C);if(F<0)throw new Error(`Unknown instruction: ${u.instr} mode=${C} pass=${n}`);const V=cs(F,T);s+=yt[F].PC,a.push(...V)}),a},an=(t,e)=>{ce={};try{return Wo(t,e,1),Wo(t,e,2)}catch(n){return console.error(n),[]}};let ue=0;const gr=192,us=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${M(gr)}   ; jump address
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
`,ls=`
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
`,fs=()=>{const t=new Uint8Array(256).fill(0),e=an(0,us.split(`
`));t.set(e,0);const n=an(0,ls.split(`
`));return t.set(n,gr),t[254]=23,t[255]=gr,t};let Le=new Uint8Array;const Go=(t=!0)=>{Le.length===0&&(Le=fs()),Le[1]=t?32:0;const n=49152+gr+7*256;Ae(7,Le,n,gs),Ae(7,Le,n+3,hs)},hs=()=>{const t=Zo();if(!t.hardDrive)return;const e=Jo(),n=256+A.StackPtr,s=E(n+1)+256*E(n+2),a=E(s+1),g=E(s+2)+256*E(s+3),I=E(g+1),u=E(g+2)+256*E(g+3);switch(a){case 0:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),d();return}const C=E(g+4);switch(C){case 0:I===0?(k(u,1),d(!1)):(console.error(`SmartPort status for unitNumber ${I} not implemented`),d());break;default:console.error(`SmartPort statusCode ${C} not implemented`),d();break}return}case 1:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),d();return}const T=512*(E(g+4)+256*E(g+5)+65536*E(g+6)),F=e.slice(T,T+512);$r(u,F);break}case 2:default:console.error(`SmartPort command ${a} not implemented`),d();return}d(!1),t.motorRunning=!0,ue||(ue=setTimeout(()=>{ue=0,t&&(t.motorRunning=!1),At()},500)),At()},gs=()=>{const t=Zo();if(!t.hardDrive)return;const e=Jo(),n=E(70)+256*E(71),s=512*n,a=E(68)+256*E(69),g=e.length;switch(t.status=` ${M(n,4)} ${M(a,4)}`,E(66)){case 0:{if(t.filename.length===0||g===0){Io(0),po(0),d();return}const I=g/512;Io(I&255),po(I>>>8);break}case 1:{if(s+512>g){d();return}const I=e.slice(s,s+512);$r(a,I);break}case 2:{if(s+512>g){d();return}const I=F1(a);e.set(I,s),t.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),d();return;default:console.error("unknown hard drive command"),d();return}d(!1),t.motorRunning=!0,ue||(ue=setTimeout(()=>{ue=0,t&&(t.motorRunning=!1),At()},500)),At()},be=t=>({hardDrive:t===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:t>0?Array(80):Array(),trackNbits:t>0?Array(80):Array(),trackLocation:0}),K=[be(0),be(1),be(2)],Qt=[new Uint8Array,new Uint8Array,new Uint8Array];let Me=1;const Is=t=>{Me=t},Ir=()=>K[Me],ps=()=>Qt[Me],Zo=()=>K[0],Jo=()=>Qt[0],At=()=>{for(let t=0;t<K.length;t++){const e={hardDrive:K[t].hardDrive,drive:t,filename:K[t].filename,status:K[t].status,motorRunning:K[t].motorRunning,diskHasChanges:K[t].diskHasChanges,diskData:K[t].diskHasChanges?Qt[t]:new Uint8Array};yA(e)}},Ss=t=>{const e=["","",""];for(let n=t?0:1;n<3;n++)e[n]=Wt.Buffer.from(Qt[n]).toString("base64");return{currentDrive:Me,driveState:K,driveData:e}},Es=t=>{Ce(Gt.MOTOR_OFF),Me=t.currentDrive;for(let e=0;e<3;e++)K[e]=be(e),Qt[e]=new Uint8Array;for(let e=0;e<t.driveState.length;e++)K[e]=t.driveState[e],t.driveData[e]!==""&&(Qt[e]=new Uint8Array(Wt.Buffer.from(t.driveData[e],"base64")));K[0].hardDrive&&Go(K[0].filename!==""),At()},Bs=()=>{No(K[1]),No(K[2]),At()},Cs=(t=!1)=>{v1(t),At()},ms=t=>{let e=t.drive;t.filename!==""&&(Qo(t.filename)?(e=0,K[0].hardDrive=!0):e===0&&(e=1)),K[e]=be(e),K[e].filename=t.filename,K[e].motorRunning=t.motorRunning,Qt[e]=$1(K[e],t.diskData),Qt[e].length===0&&(K[e].filename=""),K[e].hardDrive&&Go(K[e].filename!==""),At()},_o=`
         ORG   $300
FREQ     EQU   $350
PLSWIDTH EQU   $352

         LDA   #$FF
         STA   FREQ
         LDA   #$80
         STA   PLSWIDTH
PLAY     LDA   $C030
         LDY   PLSWIDTH
PULSE    DEY
         BNE   PULSE
         LDA   $C030
         LDX   FREQ
COUNTDN  DEX
         BNE   COUNTDN
         JSR   READKB
         JMP   PLAY

INCR     INC   FREQ
         RTS

DECR     DEC   FREQ
         RTS

PULSEINC DEC   PLSWIDTH
         INC   FREQ
         RTS

PULSEDEC INC   PLSWIDTH
         DEC   FREQ
         RTS

READKB   LDA   $C000
         STA   $C010   
         CMP   #$88
         BEQ   INCR
         CMP   #$95
         BEQ   DECR
         CMP   #$C1
         BEQ   PULSEINC
         CMP   #$DA
         BEQ   PULSEDEC
         RTS
`;let cn=1e4;const pr=new Array(1e3);let Fe=0,Vo=-1,un=!1;const ln=(t=!0)=>{cn=t?0:1e3},Ds=(t=!0)=>{un=t},ws=t=>{Vo=t},ks=()=>{pr.slice(Fe).forEach(t=>console.log(t)),pr.slice(0,Fe).forEach(t=>console.log(t))},fn=(t=0,e=!0)=>{e?A.flagIRQ|=1<<t:A.flagIRQ&=~(1<<t),A.flagIRQ&=255},Rs=(t=!0)=>{A.flagNMI=t===!0},ys=()=>{A.flagIRQ=0,A.flagNMI=!1},hn=[],jo=[],Ts=(t,e)=>{hn.push(t),jo.push(e)},Ps=()=>{for(let t=0;t<hn.length;t++)hn[t](jo[t])},gn=(t=!1)=>{let e=0;const n=A.PC,s=E(A.PC),a=E(A.PC+1),g=E(A.PC+2),I=yt[s];if(n===Vo&&!t)return Et(U.PAUSED),-1;const u=uo.get(n);if(u&&!B.INTCXROM.isSet&&u(),e=I.execute(a,g),cn<1e3&&(n<64680||n>64691)&&n<65351){cn++,n===1048575&&ks();const C=Vi(I,a,g,n)+"            ",T=`${A.cycleCount}  ${C.slice(0,22)}  ${Co()}`;pr[Fe]=T,Fe=(Fe+1)%pr.length,console.log(T)}return Eo(I.PC),tr(A.cycleCount+e),Ps(),A.flagNMI&&(A.flagNMI=!1,e=q1(),tr(A.cycleCount+e)),A.flagIRQ&&(e=Y1(),tr(A.cycleCount+e)),un&&I.pcode===96?(un=!1,Et(U.PAUSED),-1):e},In=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let pn=1,Sn=0,En=0;const ds=(t=!0,e=1)=>{if(!t)return;pn=e;const n=new Uint8Array(In.length+256);n.set(In.slice(1792,2048)),n.set(In,256),Ae(pn,n),ve(pn,Ms)};let Sr=new Uint8Array(0),Er=-1;const Ls=t=>{const e=new Uint8Array(Sr.length+t.length);e.set(t),e.set(Sr,t.length),Sr=e,Er+=t.length},bs=t=>{const e=new Uint8Array(1).fill(t);dA(e)},Ms=(t,e=-1)=>{if(t>=49408)return-1;const n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(e>=0)bs(e);else return Er>=0?Sr[Er--]:0;break;case n.STATUS:if(e>=0)console.log("SSC RESET"),Sn=2,En=0;else{let s=16;return s|=Er>=0?8:0,s}break;case n.COMMAND:if(e>=0){console.log("SSC COMMAND: 0x"+e.toString(16)),Sn=e;break}else return Sn;case n.CONTROL:if(e>=0){console.log("SSC CONTROL: 0x"+e.toString(16)),En=e;break}else return En;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},Ue=(t,e)=>String(t).padStart(e,"0"),Fs=(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})(),Us=(t=!0,e=2)=>{if(!t)return;const s=49152+8+e*256;Ae(e,Fs,s,Qs)},Qs=()=>{const t=new Date,e=Ue(t.getMonth()+1,2)+","+Ue(t.getDay(),2)+","+Ue(t.getDate(),2)+","+Ue(t.getHours(),2)+","+Ue(t.getMinutes(),2);for(let n=0;n<e.length;n++)k(512+n,e.charCodeAt(n)|128)},Ns=new Uint8Array([96,96,96,0,0,56,0,24,0,0,0,1,32,29,29,29,29,0,40,54,182,198,170,146,206,213,35,0,33,162,3,56,96,24,96,158,184,4,24,96,201,16,176,9,153,133,192,185,133,192,157,56,7,96,164,6,169,96,133,6,32,6,0,132,6,186,189,0,1,170,10,10,10,10,168,169,4,153,134,192,185,132,192,41,14,56,240,221,29,184,6,157,184,6,24,96,189,184,3,153,128,192,189,56,4,153,130,192,189,184,4,153,129,192,189,56,5,153,131,192,96,185,128,192,157,184,3,185,130,192,157,56,4,185,129,192,157,184,4,185,131,192,157,56,5,96,41,1,157,184,5,218,218,162,192,169,159,72,128,192,250,169,6,29,184,5,153,134,192,96,218,169,175,72,128,176,169,8,153,134,192,96,169,1,153,134,192,185,132,192,41,241,157,184,6,24,128,179,169,2,153,134,192,24,128,171,169,5,153,134,192,24,96,169,0,153,134,192,185,133,192,157,56,7,128,212,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214]),Ho=()=>{lt=0,ft=0,le=0,fe=0,Br=1023,Cr=1023,wr(0),H=0,Ot=0,he=0,Qe=0,Ne=0,It=0,pt=0,ge=0};let lt=0,ft=0,le=0,fe=0,Br=1023,Cr=1023,Nt=0,H=0,Ot=0,he=0,Qe=0,Ne=0,It=0,pt=0,ge=0,$o=0,Kt=5;const Os=0,mr=54,Dr=55,Ks=56,Ys=57,qs=(t=!0,e=5)=>{if(!t)return;Kt=e;const n=49152+Kt*256;Ae(Kt,Ns,n+Os,Ws),ve(Kt,Js),Ho()},wr=t=>{Nt=t,ki(!t)},xs=()=>{if(Nt&1){let t=!1;Nt&8&&(ge|=8,t=!0),Nt&Ot&4&&(ge|=4,t=!0),Nt&Ot&2&&(ge|=2,t=!0),t&&fn(Kt,!0)}},Xs=t=>{if(Nt&1)if(t.buttons>=0){switch(t.buttons){case 0:H&=-129;break;case 16:H|=128;break;case 1:H&=-17;break;case 17:H|=16;break}Ot|=H&128?4:0}else t.x>=0&&t.x<=1&&(lt=Math.round((Br-le)*t.x+le),Ot|=2),t.y>=0&&t.y<=1&&(ft=Math.round((Cr-fe)*t.y+fe),Ot|=2)};let Oe=0,Bn="",zo=0,vo=0;const Ws=()=>{const t=192+Kt;E(Dr)===t&&E(mr)===0?Zs():E(Ys)===t&&E(Ks)===0&&Gs()},Gs=()=>{if(Oe===0){const t=192+Kt;zo=E(Dr),vo=E(mr),k(Dr,t),k(mr,1);const e=(H&128)!==(he&128);let n=0;H&128?n=e?2:1:n=e?3:4,E(49152)&128&&(n=-n),he=H,Bn=lt.toString()+","+ft.toString()+","+n.toString()}Oe>=Bn.length?(A.Accum=141,Oe=0,k(Dr,zo),k(mr,vo)):(A.Accum=Bn.charCodeAt(Oe)|128,Oe++)},Zs=()=>{switch(A.Accum){case 128:console.log("mouse off"),wr(0);break;case 129:console.log("mouse on"),wr(1);break}},Js=(t,e)=>{if(t>=49408)return-1;const n=e<0,s={LOWX:0,HIGHX:1,LOWY:2,HIGHY:3,STATUS:4,MODE:5,COMMAND:6},a={INIT:0,READ:1,CLEAR:2,GETCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(n===!1)It=It&65280|e,console.log("lowx",It);else return lt&255;break;case s.HIGHX:if(n===!1)It=e<<8|It&255,console.log("highx",It);else return lt>>8&255;break;case s.LOWY:if(n===!1)pt=pt&65280|e,console.log("lowy",pt);else return ft&255;break;case s.HIGHY:if(n===!1)pt=e<<8|pt&255,console.log("highy",pt);else return ft>>8&255;break;case s.STATUS:return H;case s.MODE:if(n===!1)wr(e),console.log("Mouse mode: 0x",Nt.toString(16));else return Nt;break;case s.COMMAND:if(n===!1)switch($o=e,e){case a.INIT:console.log("cmd.init"),lt=0,ft=0,Qe=0,Ne=0,le=0,fe=0,Br=1023,Cr=1023,H=0,Ot=0;break;case a.READ:Ot=0,H&=-112,H|=he>>1&64,H|=he>>4&1,he=H,(Qe!==lt||Ne!==ft)&&(H|=32),Qe=lt,Ne=ft;break;case a.CLEAR:console.log("cmd.clear"),lt=0,ft=0,Qe=0,Ne=0;break;case a.SERVE:H&=-15,H|=ge,ge=0,fn(Kt,!1);break;case a.HOME:console.log("cmd.home"),lt=le,ft=fe;break;case a.CLAMPX:console.log("cmd.clampx"),le=It,Br=pt;break;case a.CLAMPY:console.log("cmd.clampy"),fe=It,Cr=pt;break;case a.GETCLAMP:console.log("cmd.getclamp");break;case a.POS:console.log("cmd.pos"),lt=It,ft=pt;break}else return $o;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},ti=(t=!0,e=4)=>{t&&(ve(e,aA),Ts(nA,e))},Cn=[0,128],mn=[1,129],_s=[2,130],Vs=[3,131],Ie=[4,132],pe=[5,133],kr=[6,134],Dn=[7,135],Ke=[8,136],Ye=[9,137],js=[10,138],wn=[11,139],Hs=[12,140],ee=[13,141],qe=[14,142],ei=[16,145],ri=[17,145],St=[18,146],kn=[32,160],kt=64,Yt=32,ni=(t=4)=>{for(let e=0;e<=255;e++)P(t,e,0);for(let e=0;e<=1;e++)Rn(t,e)},$s=(t,e)=>(Q(t,qe[e])&kt)!==0,zs=(t,e)=>(Q(t,St[e])&kt)!==0,oi=(t,e)=>(Q(t,wn[e])&kt)!==0,vs=(t,e,n)=>{let s=Q(t,Ie[e])-n;if(P(t,Ie[e],s),s<0){s=s%256+256,P(t,Ie[e],s);let a=Q(t,pe[e]);if(a--,P(t,pe[e],a),a<0&&(a+=256,P(t,pe[e],a),$s(t,e)&&(!zs(t,e)||oi(t,e)))){const g=Q(t,St[e]);P(t,St[e],g|kt);const I=Q(t,ee[e]);if(P(t,ee[e],I|kt),qt(t,e,-1),oi(t,e)){const u=Q(t,Dn[e]),C=Q(t,kr[e]);P(t,Ie[e],C),P(t,pe[e],u)}}}},tA=(t,e)=>(Q(t,qe[e])&Yt)!==0,eA=(t,e)=>(Q(t,St[e])&Yt)!==0,rA=(t,e,n)=>{if(Q(t,wn[e])&Yt)return;let s=Q(t,Ke[e])-n;if(P(t,Ke[e],s),s<0){s=s%256+256,P(t,Ke[e],s);let a=Q(t,Ye[e]);if(a--,P(t,Ye[e],a),a<0&&(a+=256,P(t,Ye[e],a),tA(t,e)&&!eA(t,e))){const g=Q(t,St[e]);P(t,St[e],g|Yt);const I=Q(t,ee[e]);P(t,ee[e],I|Yt),qt(t,e,-1)}}},ii=new Array(8).fill(0),nA=t=>{const e=A.cycleCount-ii[t];for(let n=0;n<=1;n++)vs(t,n,e),rA(t,n,e);ii[t]=A.cycleCount},oA=(t,e)=>{const n=[];for(let s=0;s<=15;s++)n[s]=Q(t,kn[e]+s);return n},iA=(t,e)=>t.length===e.length&&t.every((n,s)=>n===e[s]),Se={slot:-1,chip:-1,params:[-1]};let Rn=(t,e)=>{const n=oA(t,e);t===Se.slot&&e===Se.chip&&iA(n,Se.params)||(Se.slot=t,Se.chip=e,Se.params=n,PA({slot:t,chip:e,params:n}))};const sA=(t,e)=>{switch(Q(t,Cn[e])&7){case 0:for(let s=0;s<=15;s++)P(t,kn[e]+s,0);Rn(t,e);break;case 7:P(t,ri[e],Q(t,mn[e]));break;case 6:{const s=Q(t,ri[e]),a=Q(t,mn[e]);s>=0&&s<=15&&(P(t,kn[e]+s,a),Rn(t,e));break}}},qt=(t,e,n)=>{let s=Q(t,ee[e]);switch(n>=0&&(s&=127-(n&127),P(t,ee[e],s)),e){case 0:fn(t,s!==0);break;case 1:Rs(s!==0);break}},AA=(t,e,n)=>{let s=Q(t,qe[e]);n>=0&&(n=n&255,n&128?s|=n:s&=255-n),s|=128,P(t,qe[e],s)},aA=(t,e=-1)=>{if(t<49408)return-1;const n=(t&3840)>>8,s=t&255,a=s&128?1:0;switch(s){case Cn[a]:e>=0&&(P(n,Cn[a],e),sA(n,a));break;case mn[a]:case _s[a]:case Vs[a]:case js[a]:case wn[a]:case Hs[a]:P(n,s,e);break;case Ie[a]:e>=0&&P(n,kr[a],e),qt(n,a,kt);break;case pe[a]:if(e>=0){P(n,Dn[a],e),P(n,Ie[a],Q(n,kr[a])),P(n,pe[a],e);const g=Q(n,St[a]);P(n,St[a],g&~kt),qt(n,a,kt)}break;case kr[a]:e>=0&&(P(n,s,e),qt(n,a,kt));break;case Dn[a]:e>=0&&P(n,s,e);break;case Ke[a]:e>=0&&P(n,ei[a],e),qt(n,a,Yt);break;case Ye[a]:if(e>=0){P(n,Ye[a],e),P(n,Ke[a],Q(n,ei[a]));const g=Q(n,St[a]);P(n,St[a],g&~Yt),qt(n,a,Yt)}break;case ee[a]:e>=0&&qt(n,a,e);break;case qe[a]:AA(n,a,e);break}return-1},cA=65536,uA=t=>{if(t===-1)return"";const e=new Date;t===-2&&(t=0);let n="";for(let a=0;a<cA;a++){const g=_r(t),I=yt[g];I||console.log("oh oh");const u=I.PC>=2?M(_r(t+1)):"  ",C=I.PC===3?M(_r(t+2)):"  ";let T="";switch(I.mode){case l.IMPLIED:break;case l.IMM:T=`#$${u}`;break;case l.ZP_REL:T=`$${u}`;break;case l.ZP_X:T=`$${u},X`;break;case l.ZP_Y:T=`$${u},Y`;break;case l.ABS:T=`$${C}${u}`;break;case l.ABS_X:T=`$${C}${u},X`;break;case l.ABS_Y:T=`$${C}${u},Y`;break;case l.IND_X:T=`($${C.trim()}${u},X)`;break;case l.IND_Y:T=`($${u}),Y`;break;case l.IND:T=`($${C.trim()}${u})`;break}if(n+=`${a} ${M(t,4)}: ${M(g)} ${u} ${C}  ${I.name} ${T}
`,t+=I.PC,t>65535)break}return console.log(` time = ${new Date().getMilliseconds()-e.getMilliseconds()}`),n};let si=0,Rr=0,Ai=!0,yr=0,ai=!1,ci=-1,ui=16.6881,li=0,Z=U.IDLE,Ee=0,yn=!1,xt=0,re=0;const xe=60,Be=Array(xe);let Tr=!1;const lA=()=>{Tr=!0,xs()},fA=()=>{Tr=!1},hA=()=>{const t=JSON.parse(JSON.stringify(A)),e={};for(const s in B)e[s]=B[s].isSet;const n=Wt.Buffer.from(O);return{s6502:t,softSwitches:e,memory:n.toString("base64")}},gA=t=>{const e=JSON.parse(JSON.stringify(t.s6502));Q1(e);const n=t.softSwitches;for(const s in n){const a=s;try{B[a].isSet=n[s]}catch{}}O.set(Wt.Buffer.from(t.memory,"base64")),vt(),eo(!0)},Tn=(t=!1)=>({emulator:null,state6502:hA(),driveState:Ss(t)}),Pn=t=>{dn(),gA(t.state6502),Es(t.driveState),dr()};let fi=!1;const hi=()=>{fi||(fi=!0,ds(),Us(),qs(!0,2),ti(!0,4),ti(!0,5),os())},IA=()=>{Bs(),Xr(),Ho(),ni(4),ni(5)},Pr=()=>{if(tr(0),d1(),hi(),_o.length>0){const t=an(768,_o.split(`
`));O.set(t,768)}dn()},dn=()=>{ys();for(const t in B){const e=t;B[e].isSet=!1}B.TEXT.isSet=!0,E(49282),So(),IA()},pA=t=>{Ai=t,ui=Ai?16.6881:0,Ci()},SA=t=>{ai=t},gi=t=>{ci=t},Ii=()=>{const t=(re+xe-1)%xe;return t===xt||!Be[t]?-1:t},pi=()=>{if(re===xt)return-1;const t=(re+1)%xe;return Be[t]?t:-1},EA=()=>{const t=Ii();t<0||(Et(U.PAUSED),setTimeout(()=>{re===xt&&(Be[xt]=Tn()),re=t,Pn(Be[t])},50))},BA=()=>{const t=pi();t<0||(Et(U.PAUSED),setTimeout(()=>{re=t,Pn(Be[t])},50))},Si=()=>{yn=!0},Ei=()=>{ln(),Z===U.IDLE&&(Pr(),Z=U.PAUSED),gn(!0),Z=U.PAUSED,dr()},CA=()=>{ln(),Z===U.IDLE&&(Pr(),Z=U.PAUSED),E(A.PC)===32?(gn(!0),Bi()):Ei()},Bi=()=>{ln(),Z===U.IDLE&&(Pr(),Z=U.PAUSED),Ds(),Et(U.RUNNING)},Ci=()=>{Ee=0,Rr=performance.now(),si=Rr},Et=t=>{hi(),Z=t,(Z===U.PAUSED||Z===U.RUNNING)&&(gi(Z===U.RUNNING?-1:-2),Cs(Z===U.RUNNING)),dr(),Ci(),yr===0&&(yr=1,Si(),Di())},mA=(t,e,n)=>{const s=()=>{$r(t,e),n&&gt(t)};Z===U.IDLE?(Et(U.NEED_BOOT),setTimeout(()=>{Et(U.NEED_RESET),setTimeout(()=>{s()},200)},200)):s()},DA=()=>{const t=O.slice(256,512),e=new Array;for(let n=255;n>A.StackPtr;n--){let s="$"+M(t[n]),a=Te[n];Te[n].length>3&&n-1>A.StackPtr&&(Te[n-1]==="JSR"||Te[n-1]==="BRK"?(n--,s+=M(t[n])):a=""),s=(s+"   ").substring(0,6),e.push(M(256+n,4)+": "+s+a)}return e},wA=()=>{if(!ai)return"";const t=[O1()];t.push(U1());const e=DA();for(let n=0;n<Math.min(20,e.length);n++)t.push(e[n]);return t.join(`
`)},dr=()=>{const t={state:Z,speed:yr,altChar:B.ALTCHARSET.isSet,noDelayMode:!B.COLUMN80.isSet&&!B.AN3.isSet,textPage:Hr(),lores:Hr(!0),hires:M1(),debugDump:wA(),disassembly:uA(ci),button0:B.PB0.isSet,button1:B.PB1.isSet,canGoBackward:Ii()>=0,canGoForward:pi()>=0};kA(t)},mi=()=>{const t=performance.now();if(li=t-Rr,li<ui||(Rr=t,Z===U.IDLE||Z===U.PAUSED))return;Z===U.NEED_BOOT?(Pr(),Et(U.RUNNING)):Z===U.NEED_RESET&&(dn(),Et(U.RUNNING));let e=0;for(;;){const n=gn();if(n<0)break;if(e+=n,e>=12480&&Tr===!1&&lA(),e>=17030){fA();break}}Ee++,yr=Math.round(Ee*1703/(performance.now()-si))/100,Ee%2&&(r1(),dr()),yn&&(yn=!1,Be[xt]=Tn(),xt=(xt+1)%xe,re=xt)},Di=()=>{mi();const t=Ee+1;for(;Z===U.RUNNING&&Ee!==t;)mi();setTimeout(Di,Z===U.RUNNING?0:20)},Bt=(t,e)=>{self.postMessage({msg:t,payload:e})},kA=t=>{Bt(ct.MACHINE_STATE,t)},RA=t=>{Bt(ct.CLICK,t)},yA=t=>{Bt(ct.DRIVE_PROPS,t)},Ce=t=>{Bt(ct.DRIVE_SOUND,t)},TA=t=>{Bt(ct.SAVE_STATE,t)},Ln=t=>{Bt(ct.RUMBLE,t)},wi=t=>{Bt(ct.HELP_TEXT,t)},ki=t=>{Bt(ct.SHOW_MOUSE,t)},PA=t=>{Bt(ct.MBOARD_SOUND,t)},dA=t=>{Bt(ct.COMM_DATA,t)};self.onmessage=t=>{switch(t.data.msg){case G.STATE:Et(t.data.payload);break;case G.DEBUG:SA(t.data.payload);break;case G.DISASSEMBLE_ADDR:gi(t.data.payload);break;case G.BREAKPOINT:ws(t.data.payload);break;case G.STEP_INTO:Ei();break;case G.STEP_OVER:CA();break;case G.STEP_OUT:Bi();break;case G.SPEED:pA(t.data.payload);break;case G.TIME_TRAVEL:t.data.payload==="FORWARD"?BA():EA();break;case G.RESTORE_STATE:Pn(t.data.payload);break;case G.KEYPRESS:E1(t.data.payload);break;case G.MOUSEEVENT:Xs(t.data.payload);break;case G.PASTE_TEXT:B1(t.data.payload);break;case G.APPLE_PRESS:Vn(!0,t.data.payload);break;case G.APPLE_RELEASE:Vn(!1,t.data.payload);break;case G.GET_SAVE_STATE:TA(Tn(!0));break;case G.DRIVE_PROPS:{const e=t.data.payload;ms(e);break}case G.GAMEPAD:t1(t.data.payload);break;case G.SET_BINARY_BLOCK:{const e=t.data.payload;mA(e.address,e.data,e.run);break}case G.COMM_DATA:Ls(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${t.data.msg}`);break}}})();
