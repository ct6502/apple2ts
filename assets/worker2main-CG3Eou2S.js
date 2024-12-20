var O1=Object.defineProperty;var x1=(_t,Dt,me)=>Dt in _t?O1(_t,Dt,{enumerable:!0,configurable:!0,writable:!0,value:me}):_t[Dt]=me;var T=(_t,Dt,me)=>x1(_t,typeof Dt!="symbol"?Dt+"":Dt,me);(function(){"use strict";var _t={},Dt={},me;function WA(){if(me)return Dt;me=1,Dt.byteLength=u,Dt.toByteArray=J,Dt.fromByteArray=x;for(var t=[],e=[],r=typeof Uint8Array<"u"?Uint8Array:Array,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,h=o.length;a<h;++a)t[a]=o[a],e[o.charCodeAt(a)]=a;e[45]=62,e[95]=63;function p(w){var b=w.length;if(b%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var Z=w.indexOf("=");Z===-1&&(Z=b);var ut=Z===b?0:4-Z%4;return[Z,ut]}function u(w){var b=p(w),Z=b[0],ut=b[1];return(Z+ut)*3/4-ut}function D(w,b,Z){return(b+Z)*3/4-Z}function J(w){var b,Z=p(w),ut=Z[0],It=Z[1],it=new r(D(w,ut,It)),pt=0,Ye=It>0?ut-4:ut,st;for(st=0;st<Ye;st+=4)b=e[w.charCodeAt(st)]<<18|e[w.charCodeAt(st+1)]<<12|e[w.charCodeAt(st+2)]<<6|e[w.charCodeAt(st+3)],it[pt++]=b>>16&255,it[pt++]=b>>8&255,it[pt++]=b&255;return It===2&&(b=e[w.charCodeAt(st)]<<2|e[w.charCodeAt(st+1)]>>4,it[pt++]=b&255),It===1&&(b=e[w.charCodeAt(st)]<<10|e[w.charCodeAt(st+1)]<<4|e[w.charCodeAt(st+2)]>>2,it[pt++]=b>>8&255,it[pt++]=b&255),it}function y(w){return t[w>>18&63]+t[w>>12&63]+t[w>>6&63]+t[w&63]}function z(w,b,Z){for(var ut,It=[],it=b;it<Z;it+=3)ut=(w[it]<<16&16711680)+(w[it+1]<<8&65280)+(w[it+2]&255),It.push(y(ut));return It.join("")}function x(w){for(var b,Z=w.length,ut=Z%3,It=[],it=16383,pt=0,Ye=Z-ut;pt<Ye;pt+=it)It.push(z(w,pt,pt+it>Ye?Ye:pt+it));return ut===1?(b=w[Z-1],It.push(t[b>>2]+t[b<<4&63]+"==")):ut===2&&(b=(w[Z-2]<<8)+w[Z-1],It.push(t[b>>10]+t[b>>4&63]+t[b<<2&63]+"=")),It.join("")}return Dt}var Rr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */var Ts;function XA(){return Ts||(Ts=1,Rr.read=function(t,e,r,o,a){var h,p,u=a*8-o-1,D=(1<<u)-1,J=D>>1,y=-7,z=r?a-1:0,x=r?-1:1,w=t[e+z];for(z+=x,h=w&(1<<-y)-1,w>>=-y,y+=u;y>0;h=h*256+t[e+z],z+=x,y-=8);for(p=h&(1<<-y)-1,h>>=-y,y+=o;y>0;p=p*256+t[e+z],z+=x,y-=8);if(h===0)h=1-J;else{if(h===D)return p?NaN:(w?-1:1)*(1/0);p=p+Math.pow(2,o),h=h-J}return(w?-1:1)*p*Math.pow(2,h-o)},Rr.write=function(t,e,r,o,a,h){var p,u,D,J=h*8-a-1,y=(1<<J)-1,z=y>>1,x=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=o?0:h-1,b=o?1:-1,Z=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=y):(p=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-p))<1&&(p--,D*=2),p+z>=1?e+=x/D:e+=x*Math.pow(2,1-z),e*D>=2&&(p++,D/=2),p+z>=y?(u=0,p=y):p+z>=1?(u=(e*D-1)*Math.pow(2,a),p=p+z):(u=e*Math.pow(2,z-1)*Math.pow(2,a),p=0));a>=8;t[r+w]=u&255,w+=b,u/=256,a-=8);for(p=p<<a|u,J+=a;J>0;t[r+w]=p&255,w+=b,p/=256,J-=8);t[r+w-b]|=Z*128}),Rr}/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var Rs;function GA(){return Rs||(Rs=1,function(t){const e=WA(),r=XA(),o=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=it,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const i=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(i,n),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(i){if(i>a)throw new RangeError('The value "'+i+'" is invalid for option "size"');const n=new Uint8Array(i);return Object.setPrototypeOf(n,u.prototype),n}function u(i,n,s){if(typeof i=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return z(i)}return D(i,n,s)}u.poolSize=8192;function D(i,n,s){if(typeof i=="string")return x(i,n);if(ArrayBuffer.isView(i))return b(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(Zt(i,ArrayBuffer)||i&&Zt(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Zt(i,SharedArrayBuffer)||i&&Zt(i.buffer,SharedArrayBuffer)))return Z(i,n,s);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=i.valueOf&&i.valueOf();if(l!=null&&l!==i)return u.from(l,n,s);const f=ut(i);if(f)return f;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),n,s);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,n,s){return D(i,n,s)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function J(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function y(i,n,s){return J(i),i<=0?p(i):n!==void 0?typeof s=="string"?p(i).fill(n,s):p(i).fill(n):p(i)}u.alloc=function(i,n,s){return y(i,n,s)};function z(i){return J(i),p(i<0?0:It(i)|0)}u.allocUnsafe=function(i){return z(i)},u.allocUnsafeSlow=function(i){return z(i)};function x(i,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const s=pt(i,n)|0;let l=p(s);const f=l.write(i,n);return f!==s&&(l=l.slice(0,f)),l}function w(i){const n=i.length<0?0:It(i.length)|0,s=p(n);for(let l=0;l<n;l+=1)s[l]=i[l]&255;return s}function b(i){if(Zt(i,Uint8Array)){const n=new Uint8Array(i);return Z(n.buffer,n.byteOffset,n.byteLength)}return w(i)}function Z(i,n,s){if(n<0||i.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<n+(s||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&s===void 0?l=new Uint8Array(i):s===void 0?l=new Uint8Array(i,n):l=new Uint8Array(i,n,s),Object.setPrototypeOf(l,u.prototype),l}function ut(i){if(u.isBuffer(i)){const n=It(i.length)|0,s=p(n);return s.length===0||i.copy(s,0,0,n),s}if(i.length!==void 0)return typeof i.length!="number"||ds(i.length)?p(0):w(i);if(i.type==="Buffer"&&Array.isArray(i.data))return w(i.data)}function It(i){if(i>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return i|0}function it(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,s){if(Zt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),Zt(s,Uint8Array)&&(s=u.from(s,s.offset,s.byteLength)),!u.isBuffer(n)||!u.isBuffer(s))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===s)return 0;let l=n.length,f=s.length;for(let S=0,C=Math.min(l,f);S<C;++S)if(n[S]!==s[S]){l=n[S],f=s[S];break}return l<f?-1:f<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,s){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(s===void 0)for(s=0,l=0;l<n.length;++l)s+=n[l].length;const f=u.allocUnsafe(s);let S=0;for(l=0;l<n.length;++l){let C=n[l];if(Zt(C,Uint8Array))S+C.length>f.length?(u.isBuffer(C)||(C=u.from(C)),C.copy(f,S)):Uint8Array.prototype.set.call(f,C,S);else if(u.isBuffer(C))C.copy(f,S);else throw new TypeError('"list" argument must be an Array of Buffers');S+=C.length}return f};function pt(i,n){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||Zt(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const s=i.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&s===0)return 0;let f=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return s;case"utf8":case"utf-8":return ws(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return s*2;case"hex":return s>>>1;case"base64":return xA(i).length;default:if(f)return l?-1:ws(i).length;n=(""+n).toLowerCase(),f=!0}}u.byteLength=pt;function Ye(i,n,s){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((s===void 0||s>this.length)&&(s=this.length),s<=0)||(s>>>=0,n>>>=0,s<=n))return"";for(i||(i="utf8");;)switch(i){case"hex":return L1(this,n,s);case"utf8":case"utf-8":return QA(this,n,s);case"ascii":return P1(this,n,s);case"latin1":case"binary":return M1(this,n,s);case"base64":return R1(this,n,s);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Q1(this,n,s);default:if(l)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function st(i,n,s){const l=i[n];i[n]=i[s],i[s]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let s=0;s<n;s+=2)st(this,s,s+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let s=0;s<n;s+=4)st(this,s,s+3),st(this,s+1,s+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let s=0;s<n;s+=8)st(this,s,s+7),st(this,s+1,s+6),st(this,s+2,s+5),st(this,s+3,s+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?QA(this,0,n):Ye.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const s=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,s).replace(/(.{2})/g,"$1 ").trim(),this.length>s&&(n+=" ... "),"<Buffer "+n+">"},o&&(u.prototype[o]=u.prototype.inspect),u.prototype.compare=function(n,s,l,f,S){if(Zt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(s===void 0&&(s=0),l===void 0&&(l=n?n.length:0),f===void 0&&(f=0),S===void 0&&(S=this.length),s<0||l>n.length||f<0||S>this.length)throw new RangeError("out of range index");if(f>=S&&s>=l)return 0;if(f>=S)return-1;if(s>=l)return 1;if(s>>>=0,l>>>=0,f>>>=0,S>>>=0,this===n)return 0;let C=S-f,M=l-s;const $=Math.min(C,M),j=this.slice(f,S),tt=n.slice(s,l);for(let _=0;_<$;++_)if(j[_]!==tt[_]){C=j[_],M=tt[_];break}return C<M?-1:M<C?1:0};function MA(i,n,s,l,f){if(i.length===0)return-1;if(typeof s=="string"?(l=s,s=0):s>2147483647?s=2147483647:s<-2147483648&&(s=-2147483648),s=+s,ds(s)&&(s=f?0:i.length-1),s<0&&(s=i.length+s),s>=i.length){if(f)return-1;s=i.length-1}else if(s<0)if(f)s=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:LA(i,n,s,l,f);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?f?Uint8Array.prototype.indexOf.call(i,n,s):Uint8Array.prototype.lastIndexOf.call(i,n,s):LA(i,[n],s,l,f);throw new TypeError("val must be string, number or Buffer")}function LA(i,n,s,l,f){let S=1,C=i.length,M=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(i.length<2||n.length<2)return-1;S=2,C/=2,M/=2,s/=2}function $(tt,_){return S===1?tt[_]:tt.readUInt16BE(_*S)}let j;if(f){let tt=-1;for(j=s;j<C;j++)if($(i,j)===$(n,tt===-1?0:j-tt)){if(tt===-1&&(tt=j),j-tt+1===M)return tt*S}else tt!==-1&&(j-=j-tt),tt=-1}else for(s+M>C&&(s=C-M),j=s;j>=0;j--){let tt=!0;for(let _=0;_<M;_++)if($(i,j+_)!==$(n,_)){tt=!1;break}if(tt)return j}return-1}u.prototype.includes=function(n,s,l){return this.indexOf(n,s,l)!==-1},u.prototype.indexOf=function(n,s,l){return MA(this,n,s,l,!0)},u.prototype.lastIndexOf=function(n,s,l){return MA(this,n,s,l,!1)};function m1(i,n,s,l){s=Number(s)||0;const f=i.length-s;l?(l=Number(l),l>f&&(l=f)):l=f;const S=n.length;l>S/2&&(l=S/2);let C;for(C=0;C<l;++C){const M=parseInt(n.substr(C*2,2),16);if(ds(M))return C;i[s+C]=M}return C}function k1(i,n,s,l){return wn(ws(n,i.length-s),i,s,l)}function w1(i,n,s,l){return wn(K1(n),i,s,l)}function d1(i,n,s,l){return wn(xA(n),i,s,l)}function T1(i,n,s,l){return wn(q1(n,i.length-s),i,s,l)}u.prototype.write=function(n,s,l,f){if(s===void 0)f="utf8",l=this.length,s=0;else if(l===void 0&&typeof s=="string")f=s,l=this.length,s=0;else if(isFinite(s))s=s>>>0,isFinite(l)?(l=l>>>0,f===void 0&&(f="utf8")):(f=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const S=this.length-s;if((l===void 0||l>S)&&(l=S),n.length>0&&(l<0||s<0)||s>this.length)throw new RangeError("Attempt to write outside buffer bounds");f||(f="utf8");let C=!1;for(;;)switch(f){case"hex":return m1(this,n,s,l);case"utf8":case"utf-8":return k1(this,n,s,l);case"ascii":case"latin1":case"binary":return w1(this,n,s,l);case"base64":return d1(this,n,s,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return T1(this,n,s,l);default:if(C)throw new TypeError("Unknown encoding: "+f);f=(""+f).toLowerCase(),C=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function R1(i,n,s){return n===0&&s===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(n,s))}function QA(i,n,s){s=Math.min(i.length,s);const l=[];let f=n;for(;f<s;){const S=i[f];let C=null,M=S>239?4:S>223?3:S>191?2:1;if(f+M<=s){let $,j,tt,_;switch(M){case 1:S<128&&(C=S);break;case 2:$=i[f+1],($&192)===128&&(_=(S&31)<<6|$&63,_>127&&(C=_));break;case 3:$=i[f+1],j=i[f+2],($&192)===128&&(j&192)===128&&(_=(S&15)<<12|($&63)<<6|j&63,_>2047&&(_<55296||_>57343)&&(C=_));break;case 4:$=i[f+1],j=i[f+2],tt=i[f+3],($&192)===128&&(j&192)===128&&(tt&192)===128&&(_=(S&15)<<18|($&63)<<12|(j&63)<<6|tt&63,_>65535&&_<1114112&&(C=_))}}C===null?(C=65533,M=1):C>65535&&(C-=65536,l.push(C>>>10&1023|55296),C=56320|C&1023),l.push(C),f+=M}return y1(l)}const bA=4096;function y1(i){const n=i.length;if(n<=bA)return String.fromCharCode.apply(String,i);let s="",l=0;for(;l<n;)s+=String.fromCharCode.apply(String,i.slice(l,l+=bA));return s}function P1(i,n,s){let l="";s=Math.min(i.length,s);for(let f=n;f<s;++f)l+=String.fromCharCode(i[f]&127);return l}function M1(i,n,s){let l="";s=Math.min(i.length,s);for(let f=n;f<s;++f)l+=String.fromCharCode(i[f]);return l}function L1(i,n,s){const l=i.length;(!n||n<0)&&(n=0),(!s||s<0||s>l)&&(s=l);let f="";for(let S=n;S<s;++S)f+=N1[i[S]];return f}function Q1(i,n,s){const l=i.slice(n,s);let f="";for(let S=0;S<l.length-1;S+=2)f+=String.fromCharCode(l[S]+l[S+1]*256);return f}u.prototype.slice=function(n,s){const l=this.length;n=~~n,s=s===void 0?l:~~s,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),s<0?(s+=l,s<0&&(s=0)):s>l&&(s=l),s<n&&(s=n);const f=this.subarray(n,s);return Object.setPrototypeOf(f,u.prototype),f};function lt(i,n,s){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+n>s)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||lt(n,s,this.length);let f=this[n],S=1,C=0;for(;++C<s&&(S*=256);)f+=this[n+C]*S;return f},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||lt(n,s,this.length);let f=this[n+--s],S=1;for(;s>0&&(S*=256);)f+=this[n+--s]*S;return f},u.prototype.readUint8=u.prototype.readUInt8=function(n,s){return n=n>>>0,s||lt(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,s){return n=n>>>0,s||lt(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,s){return n=n>>>0,s||lt(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=De(function(n){n=n>>>0,rr(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Tr(n,this.length-8);const f=s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,S=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(f)+(BigInt(S)<<BigInt(32))}),u.prototype.readBigUInt64BE=De(function(n){n=n>>>0,rr(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Tr(n,this.length-8);const f=s*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],S=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(f)<<BigInt(32))+BigInt(S)}),u.prototype.readIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||lt(n,s,this.length);let f=this[n],S=1,C=0;for(;++C<s&&(S*=256);)f+=this[n+C]*S;return S*=128,f>=S&&(f-=Math.pow(2,8*s)),f},u.prototype.readIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||lt(n,s,this.length);let f=s,S=1,C=this[n+--f];for(;f>0&&(S*=256);)C+=this[n+--f]*S;return S*=128,C>=S&&(C-=Math.pow(2,8*s)),C},u.prototype.readInt8=function(n,s){return n=n>>>0,s||lt(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,s){n=n>>>0,s||lt(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,s){n=n>>>0,s||lt(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=De(function(n){n=n>>>0,rr(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Tr(n,this.length-8);const f=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(f)<<BigInt(32))+BigInt(s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=De(function(n){n=n>>>0,rr(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Tr(n,this.length-8);const f=(s<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(f)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,s){return n=n>>>0,s||lt(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,s){return n=n>>>0,s||lt(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,s){return n=n>>>0,s||lt(n,8,this.length),r.read(this,n,!1,52,8)};function Bt(i,n,s,l,f,S){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>f||n<S)throw new RangeError('"value" argument is out of bounds');if(s+l>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,s,l,f){if(n=+n,s=s>>>0,l=l>>>0,!f){const M=Math.pow(2,8*l)-1;Bt(this,n,s,l,M,0)}let S=1,C=0;for(this[s]=n&255;++C<l&&(S*=256);)this[s+C]=n/S&255;return s+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,s,l,f){if(n=+n,s=s>>>0,l=l>>>0,!f){const M=Math.pow(2,8*l)-1;Bt(this,n,s,l,M,0)}let S=l-1,C=1;for(this[s+S]=n&255;--S>=0&&(C*=256);)this[s+S]=n/C&255;return s+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,1,255,0),this[s]=n&255,s+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,2,65535,0),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,2,65535,0),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,4,4294967295,0),this[s+3]=n>>>24,this[s+2]=n>>>16,this[s+1]=n>>>8,this[s]=n&255,s+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,4,4294967295,0),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4};function FA(i,n,s,l,f){OA(n,l,f,i,s,7);let S=Number(n&BigInt(4294967295));i[s++]=S,S=S>>8,i[s++]=S,S=S>>8,i[s++]=S,S=S>>8,i[s++]=S;let C=Number(n>>BigInt(32)&BigInt(4294967295));return i[s++]=C,C=C>>8,i[s++]=C,C=C>>8,i[s++]=C,C=C>>8,i[s++]=C,s}function UA(i,n,s,l,f){OA(n,l,f,i,s,7);let S=Number(n&BigInt(4294967295));i[s+7]=S,S=S>>8,i[s+6]=S,S=S>>8,i[s+5]=S,S=S>>8,i[s+4]=S;let C=Number(n>>BigInt(32)&BigInt(4294967295));return i[s+3]=C,C=C>>8,i[s+2]=C,C=C>>8,i[s+1]=C,C=C>>8,i[s]=C,s+8}u.prototype.writeBigUInt64LE=De(function(n,s=0){return FA(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=De(function(n,s=0){return UA(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,s,l,f){if(n=+n,s=s>>>0,!f){const $=Math.pow(2,8*l-1);Bt(this,n,s,l,$-1,-$)}let S=0,C=1,M=0;for(this[s]=n&255;++S<l&&(C*=256);)n<0&&M===0&&this[s+S-1]!==0&&(M=1),this[s+S]=(n/C>>0)-M&255;return s+l},u.prototype.writeIntBE=function(n,s,l,f){if(n=+n,s=s>>>0,!f){const $=Math.pow(2,8*l-1);Bt(this,n,s,l,$-1,-$)}let S=l-1,C=1,M=0;for(this[s+S]=n&255;--S>=0&&(C*=256);)n<0&&M===0&&this[s+S+1]!==0&&(M=1),this[s+S]=(n/C>>0)-M&255;return s+l},u.prototype.writeInt8=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,1,127,-128),n<0&&(n=255+n+1),this[s]=n&255,s+1},u.prototype.writeInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,2,32767,-32768),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,2,32767,-32768),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,4,2147483647,-2147483648),this[s]=n&255,this[s+1]=n>>>8,this[s+2]=n>>>16,this[s+3]=n>>>24,s+4},u.prototype.writeInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||Bt(this,n,s,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4},u.prototype.writeBigInt64LE=De(function(n,s=0){return FA(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=De(function(n,s=0){return UA(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function KA(i,n,s,l,f,S){if(s+l>i.length)throw new RangeError("Index out of range");if(s<0)throw new RangeError("Index out of range")}function qA(i,n,s,l,f){return n=+n,s=s>>>0,f||KA(i,n,s,4),r.write(i,n,s,l,23,4),s+4}u.prototype.writeFloatLE=function(n,s,l){return qA(this,n,s,!0,l)},u.prototype.writeFloatBE=function(n,s,l){return qA(this,n,s,!1,l)};function NA(i,n,s,l,f){return n=+n,s=s>>>0,f||KA(i,n,s,8),r.write(i,n,s,l,52,8),s+8}u.prototype.writeDoubleLE=function(n,s,l){return NA(this,n,s,!0,l)},u.prototype.writeDoubleBE=function(n,s,l){return NA(this,n,s,!1,l)},u.prototype.copy=function(n,s,l,f){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!f&&f!==0&&(f=this.length),s>=n.length&&(s=n.length),s||(s=0),f>0&&f<l&&(f=l),f===l||n.length===0||this.length===0)return 0;if(s<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(f<0)throw new RangeError("sourceEnd out of bounds");f>this.length&&(f=this.length),n.length-s<f-l&&(f=n.length-s+l);const S=f-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(s,l,f):Uint8Array.prototype.set.call(n,this.subarray(l,f),s),S},u.prototype.fill=function(n,s,l,f){if(typeof n=="string"){if(typeof s=="string"?(f=s,s=0,l=this.length):typeof l=="string"&&(f=l,l=this.length),f!==void 0&&typeof f!="string")throw new TypeError("encoding must be a string");if(typeof f=="string"&&!u.isEncoding(f))throw new TypeError("Unknown encoding: "+f);if(n.length===1){const C=n.charCodeAt(0);(f==="utf8"&&C<128||f==="latin1")&&(n=C)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(s<0||this.length<s||this.length<l)throw new RangeError("Out of range index");if(l<=s)return this;s=s>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let S;if(typeof n=="number")for(S=s;S<l;++S)this[S]=n;else{const C=u.isBuffer(n)?n:u.from(n,f),M=C.length;if(M===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(S=0;S<l-s;++S)this[S+s]=C[S%M]}return this};const er={};function ks(i,n,s){er[i]=class extends s{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(f){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:f,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}ks("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),ks("ERR_INVALID_ARG_TYPE",function(i,n){return`The "${i}" argument must be of type number. Received type ${typeof n}`},TypeError),ks("ERR_OUT_OF_RANGE",function(i,n,s){let l=`The value of "${i}" is out of range.`,f=s;return Number.isInteger(s)&&Math.abs(s)>2**32?f=YA(String(s)):typeof s=="bigint"&&(f=String(s),(s>BigInt(2)**BigInt(32)||s<-(BigInt(2)**BigInt(32)))&&(f=YA(f)),f+="n"),l+=` It must be ${n}. Received ${f}`,l},RangeError);function YA(i){let n="",s=i.length;const l=i[0]==="-"?1:0;for(;s>=l+4;s-=3)n=`_${i.slice(s-3,s)}${n}`;return`${i.slice(0,s)}${n}`}function b1(i,n,s){rr(n,"offset"),(i[n]===void 0||i[n+s]===void 0)&&Tr(n,i.length-(s+1))}function OA(i,n,s,l,f,S){if(i>s||i<n){const C=typeof n=="bigint"?"n":"";let M;throw n===0||n===BigInt(0)?M=`>= 0${C} and < 2${C} ** ${(S+1)*8}${C}`:M=`>= -(2${C} ** ${(S+1)*8-1}${C}) and < 2 ** ${(S+1)*8-1}${C}`,new er.ERR_OUT_OF_RANGE("value",M,i)}b1(l,f,S)}function rr(i,n){if(typeof i!="number")throw new er.ERR_INVALID_ARG_TYPE(n,"number",i)}function Tr(i,n,s){throw Math.floor(i)!==i?(rr(i,s),new er.ERR_OUT_OF_RANGE("offset","an integer",i)):n<0?new er.ERR_BUFFER_OUT_OF_BOUNDS:new er.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,i)}const F1=/[^+/0-9A-Za-z-_]/g;function U1(i){if(i=i.split("=")[0],i=i.trim().replace(F1,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function ws(i,n){n=n||1/0;let s;const l=i.length;let f=null;const S=[];for(let C=0;C<l;++C){if(s=i.charCodeAt(C),s>55295&&s<57344){if(!f){if(s>56319){(n-=3)>-1&&S.push(239,191,189);continue}else if(C+1===l){(n-=3)>-1&&S.push(239,191,189);continue}f=s;continue}if(s<56320){(n-=3)>-1&&S.push(239,191,189),f=s;continue}s=(f-55296<<10|s-56320)+65536}else f&&(n-=3)>-1&&S.push(239,191,189);if(f=null,s<128){if((n-=1)<0)break;S.push(s)}else if(s<2048){if((n-=2)<0)break;S.push(s>>6|192,s&63|128)}else if(s<65536){if((n-=3)<0)break;S.push(s>>12|224,s>>6&63|128,s&63|128)}else if(s<1114112){if((n-=4)<0)break;S.push(s>>18|240,s>>12&63|128,s>>6&63|128,s&63|128)}else throw new Error("Invalid code point")}return S}function K1(i){const n=[];for(let s=0;s<i.length;++s)n.push(i.charCodeAt(s)&255);return n}function q1(i,n){let s,l,f;const S=[];for(let C=0;C<i.length&&!((n-=2)<0);++C)s=i.charCodeAt(C),l=s>>8,f=s%256,S.push(f),S.push(l);return S}function xA(i){return e.toByteArray(U1(i))}function wn(i,n,s,l){let f;for(f=0;f<l&&!(f+s>=n.length||f>=i.length);++f)n[f+s]=i[f];return f}function Zt(i,n){return i instanceof n||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===n.name}function ds(i){return i!==i}const N1=function(){const i="0123456789abcdef",n=new Array(256);for(let s=0;s<16;++s){const l=s*16;for(let f=0;f<16;++f)n[l+f]=i[s]+i[f]}return n}();function De(i){return typeof BigInt>"u"?Y1:i}function Y1(){throw new Error("BigInt not supported")}}(_t)),_t}var Oe=GA();const ZA=!1,_A=30,nr=256,xe=383,sr=256*nr,ne=256*xe;var K=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(K||{}),St=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t))(St||{}),q=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.MOUSEEVENT=15]="MOUSEEVENT",t[t.PASTE_TEXT=16]="PASTE_TEXT",t[t.APPLE_PRESS=17]="APPLE_PRESS",t[t.APPLE_RELEASE=18]="APPLE_RELEASE",t[t.GET_SAVE_STATE=19]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=20]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=21]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=22]="DRIVE_NEW_DATA",t[t.GAMEPAD=23]="GAMEPAD",t[t.SET_BINARY_BLOCK=24]="SET_BINARY_BLOCK",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RAMWORKS=28]="RAMWORKS",t[t.MACHINE_NAME=29]="MACHINE_NAME",t[t.SOFTSWITCHES=30]="SOFTSWITCHES",t))(q||{}),ys=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t))(ys||{}),ke=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(ke||{}),A=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(A||{});const JA=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),dn=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",H=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const or=t=>t.split("").map(e=>e.charCodeAt(0)),VA=t=>[t&255,t>>>8&255],Ps=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Ms=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},Tn=new Uint32Array(256).fill(0),jA=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;Tn[e]=t}},HA=(t,e=0)=>{Tn[255]===0&&jA();let r=-1;for(let o=e;o<t.length;o++)r=r>>>8^Tn[(r^t[o])&255];return(r^-1)>>>0},vA=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7);let Lt;const we=Math.trunc(.0028*1020484);let Rn=we/2,yn=we/2,yr=we/2,Pr=we/2,Ls=0,Qs=!1,bs=!1,Pn=!1,Mn=!1,Mr=!1,Fs=!1,Us=!1;const Ln=()=>{Pn=!0},Ks=()=>{Mn=!0},zA=()=>{Mr=!0},Lr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*we/2),qs=t=>{Rn=Lr(t)},Ns=t=>{yn=Lr(t)},Ys=t=>{yr=Lr(t)},Os=t=>{Pr=Lr(t)},Qn=()=>{Fs=Qs||Pn,Us=bs||Mn,E.PB0.isSet=Fs,E.PB1.isSet=Us||Mr,E.PB2.isSet=Mr},xs=(t,e)=>{e?Qs=t:bs=t,Qn()},$A=t=>{et(49252,128),et(49253,128),et(49254,128),et(49255,128),Ls=t},Qr=t=>{const e=t-Ls;et(49252,e<Rn?128:0),et(49253,e<yn?128:0),et(49254,e<yr?128:0),et(49255,e<Pr?128:0)};let de,bn,Ws=!1;const ti=t=>{Lt=t,Ws=!Lt.length||!Lt[0].buttons.length,de=Di(),bn=de.gamepad?de.gamepad:Ei},Xs=t=>t>-.01&&t<.01,Gs=(t,e)=>{Xs(t)&&(t=0),Xs(e)&&(e=0);const r=Math.sqrt(t*t+e*e),o=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-o,t),o),e=Math.min(Math.max(-o,e),o),t=Math.trunc(we*(t+o)/(2*o)),e=Math.trunc(we*(e+o)/(2*o)),[t,e]},ei=t=>{const[e,r]=Gs(t[0],t[1]),o=t.length>=6?t[5]:t[3],[a,h]=t.length>=4?Gs(t[2],o):[0,0];return[e,r,a,h]},Zs=t=>{const e=de.joystick?de.joystick(Lt[t].axes,Ws):Lt[t].axes,r=ei(e);t===0?(Rn=r[0],yn=r[1],Pn=!1,Mn=!1,yr=r[2],Pr=r[3]):(yr=r[0],Pr=r[1],Mr=!1);let o=!1;Lt[t].buttons.forEach((a,h)=>{a&&(bn(h,Lt.length>1,t===1),o=!0)}),o||bn(-1,Lt.length>1,t===1),de.rumble&&de.rumble(),Qn()},ri=()=>{Lt&&Lt.length>0&&(Zs(0),Lt.length>1&&Zs(1))},ni=t=>{switch(t){case 0:N("JL");break;case 1:N("G",200);break;case 2:W("M"),N("O");break;case 3:N("L");break;case 4:N("F");break;case 5:W("P"),N("T");break;case 6:break;case 7:break;case 8:N("Z");break;case 9:{const e=So();e.includes("'N'")?W("N"):e.includes("'S'")?W("S"):e.includes("NUMERIC KEY")?W("1"):W("N");break}case 10:break;case 11:break;case 12:N("L");break;case 13:N("M");break;case 14:N("A");break;case 15:N("D");break;case-1:return}};let Te=0,Re=0,ye=!1;const br=.5,si={address:7587,data:[173,0,192],keymap:{},joystick:t=>t[0]<-br?(Re=0,Te===0||Te>2?(Te=0,W("A")):Te===1&&ye?N("W"):Te===2&&ye&&N("R"),Te++,ye=!1,t):t[0]>br?(Te=0,Re===0||Re>2?(Re=0,W("D")):Re===1&&ye?N("W"):Re===2&&ye&&N("R"),Re++,ye=!1,t):t[1]<-br?(N("C"),t):t[1]>br?(N("S"),t):(ye=!0,t),gamepad:ni,rumble:null,setup:null,helptext:`AZTEC
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
`},oi={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:W(" ");break;case 12:W("A");break;case 13:W("Z");break;case 14:W("\b");break;case 15:W("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},Ai={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},ii={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{ms("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let Fn=14,Un=14;const ai={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=B(182,!1);Fn<40&&t<Fn&&kn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Fn=t,t=B(183,!1),Un<40&&t<Un&&kn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Un=t},setup:null,helptext:`KARATEKA
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
`},ci=t=>{switch(t){case 0:N("A");break;case 1:N("C",50);break;case 2:N("O");break;case 3:N("T");break;case 4:N("\x1B");break;case 5:N("\r");break;case 6:break;case 7:break;case 8:W("N"),N("'");break;case 9:W("Y"),N("1");break;case 10:break;case 11:break;case 12:break;case 13:N(" ");break;case 14:break;case 15:N("	");break;case-1:return}},se=.5,li={address:768,data:[141,74,3,132],keymap:{},gamepad:ci,joystick:(t,e)=>{if(e)return t;const r=t[0]<-se?"\b":t[0]>se?"":"",o=t[1]<-se?"\v":t[1]>se?`
`:"";let a=r+o;return a||(a=t[2]<-se?"L\b":t[2]>se?"L":"",a||(a=t[3]<-se?"L\v":t[3]>se?`L
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
ESC  exit conversation`},ui={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},hi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},Ii={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&kn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{m(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},_s=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,fi=t=>{switch(t){case 1:m(109,255);break;case 12:W("A");break;case 13:W("Z");break;case 14:W("\b");break;case 15:W("");break}},Fr=.75,gi=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{m(25025,173),m(25036,64)},helptext:_s},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Fr?"\b":t[0]>Fr?"":t[1]<-Fr?"A":t[1]>Fr?"Z":"";return e&&W(e),t},gamepad:fi,rumble:null,setup:null,helptext:_s}],pi={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{yA(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Si={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Ci={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Ln();break;case 1:Ks();break;case 2:N(" ");break;case 3:N("U");break;case 4:N("\r");break;case 5:N("T");break;case 9:{const e=So();e.includes("'N'")?W("N"):e.includes("'S'")?W("S"):e.includes("NUMERIC KEY")?W("1"):W("N");break}case 10:Ln();break}},rumble:()=>{B(49178,!1)<128&&B(49181,!1)<128&&kn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{m(5128,0),m(5130,4);let t=5210;m(t,234),m(t+1,234),m(t+2,234),t=5224,m(t,234),m(t+1,234),m(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},Ar=new Array,mt=t=>{Array.isArray(t)?Ar.push(...t):Ar.push(t)};mt(si),mt(oi),mt(Ai),mt(ii),mt(ai),mt(li),mt(ui),mt(hi),mt(Ii),mt(gi),mt(pi),mt(Si),mt(Ci);const Ei=(t,e,r)=>{if(r)switch(t){case 0:zA();break;case 1:break;case 12:Os(-1);break;case 13:Os(1);break;case 14:Ys(-1);break;case 15:Ys(1);break}else switch(t){case 0:Ln();break;case 1:e||Ks();break;case 12:Ns(-1);break;case 13:Ns(1);break;case 14:qs(-1);break;case 15:qs(1);break}},Bi={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},Js=t=>{for(const e of Ar)if(vn(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},Di=()=>{for(const t of Ar)if(vn(t.address,t.data))return t;return Bi},Kn=(t=!1)=>{for(const e of Ar)if(vn(e.address,e.data)){RA(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(RA(" "),yA(0))},mi=t=>{et(49152,t|128,32)},ki=()=>{const t=Le(49152)&127;et(49152,t,32)};let Pe="",Vs=1e9;const wi=()=>{const t=performance.now();if(Pe!==""&&(Le(49152)<128||t-Vs>1900)){Vs=t;const e=Pe.charCodeAt(0);mi(e),Pe=Pe.slice(1),Pe.length===0&&EA(!0)}};let js="";const W=t=>{t===js&&Pe.length>0||(js=t,Pe+=t)};let Hs=0;const N=(t,e=300)=>{const r=performance.now();r-Hs<e||(Hs=r,W(t))},di=t=>{t.length===1&&(t=Js(t)),W(t)},Ti=t=>{t.length===1&&(t=Js(t)),W(t)},We=[],R=(t,e,r,o=!1,a=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:o,isSet:!1,setFunc:a};return t>=49152&&(We[t-49152]=h),e>=49152&&(We[e-49152]=h),r>=49152&&(We[r-49152]=h),h},Xe=()=>Math.floor(256*Math.random()),Ri=(t,e)=>{t&=11,e?E.BSR_PREWRITE.isSet=!1:t&1?E.BSR_PREWRITE.isSet?E.BSR_WRITE.isSet=!0:E.BSR_PREWRITE.isSet=!0:(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=!1),E.BSRBANK2.isSet=t<=3,E.BSRREADRAM.isSet=[0,3,8,11].includes(t)},E={STORE80:R(49152,49153,49176,!0),RAMRD:R(49154,49155,49171,!0),RAMWRT:R(49156,49157,49172,!0),INTCXROM:R(49158,49159,49173,!0),INTC8ROM:R(49194,0,0),ALTZP:R(49160,49161,49174,!0),SLOTC3ROM:R(49162,49163,49175,!0),COLUMN80:R(49164,49165,49183,!0),ALTCHARSET:R(49166,49167,49182,!0),KBRDSTROBE:R(49168,0,0,!1),BSRBANK2:R(0,0,49169),BSRREADRAM:R(0,0,49170),VBL:R(0,0,49177),CASSOUT:R(49184,0,0),SPEAKER:R(49200,0,0,!1,(t,e)=>{et(49200,Xe()),p1(e)}),GCSTROBE:R(49216,0,0),EMUBYTE:R(0,0,49231,!1,()=>{et(49231,205)}),TEXT:R(49232,49233,49178),MIXED:R(49234,49235,49179),PAGE2:R(49236,49237,49180),HIRES:R(49238,49239,49181),AN0:R(49240,49241,0),AN1:R(49242,49243,0),AN2:R(49244,49245,0),AN3:R(49246,49247,0),CASSIN1:R(0,0,49248,!1,()=>{et(49248,Xe())}),PB0:R(0,0,49249),PB1:R(0,0,49250),PB2:R(0,0,49251),JOYSTICK0:R(0,0,49252,!1,(t,e)=>{Qr(e)}),JOYSTICK1:R(0,0,49253,!1,(t,e)=>{Qr(e)}),JOYSTICK2:R(0,0,49254,!1,(t,e)=>{Qr(e)}),JOYSTICK3:R(0,0,49255,!1,(t,e)=>{Qr(e)}),CASSIN2:R(0,0,49256,!1,()=>{et(49256,Xe())}),FASTCHIP_LOCK:R(49258,0,0),FASTCHIP_ENABLE:R(49259,0,0),FASTCHIP_SPEED:R(49261,0,0),JOYSTICKRESET:R(0,0,49264,!1,(t,e)=>{$A(e),et(49264,Xe())}),BANKSEL:R(49267,0,0),LASER128EX:R(49268,0,0),BSR_PREWRITE:R(49280,0,0),BSR_WRITE:R(49288,0,0)};E.TEXT.isSet=!0;const yi=[49152,49153,49165,49167,49200,49236,49237,49183],vs=(t,e,r)=>{if(t>1048575&&!yi.includes(t)){const a=Le(t)>128?1:0;console.log(`${r} $${H(c.PC)}: $${H(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){Ri(t&-5,e);return}const o=We[t-49152];if(!o){console.error("Unknown softswitch "+H(t)),et(t,Xe());return}if(t<=49167?e||wi():(t===49168||t<=49183&&e)&&ki(),o.setFunc){o.setFunc(t,r);return}if(t===o.offAddr||t===o.onAddr){if((!o.writeOnly||e)&&(Kt[o.offAddr-49152]!==void 0?Kt[o.offAddr-49152]=t===o.onAddr:o.isSet=t===o.onAddr),o.isSetAddr){const a=Le(o.isSetAddr);et(o.isSetAddr,o.isSet?a|128:a&127)}t>=49184&&et(t,Xe())}else if(t===o.isSetAddr){const a=Le(t);et(t,o.isSet?a|128:a&127)}},Pi=()=>{for(const t in E){const e=t;Kt[E[e].offAddr-49152]!==void 0?Kt[E[e].offAddr-49152]=!1:E[e].isSet=!1}Kt[E.TEXT.offAddr-49152]!==void 0?Kt[E.TEXT.offAddr-49152]=!0:E.TEXT.isSet=!0},Kt=[],Mi=t=>{const e=We[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+H(t));return}Kt[e.offAddr-49152]===void 0&&(Kt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},Li=()=>{Kt.forEach((t,e)=>{t!==void 0&&(We[e].isSet=t)}),Kt.length=0},Qi=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,bi=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,zs=new Array(256),qn={},g=(t,e,r,o)=>{console.assert(!zs[r],"Duplicate instruction: "+t+" mode="+e),zs[r]={name:t,mode:e,bytes:o},qn[t]||(qn[t]=[]),qn[t][e]=r};g("ADC",A.IMM,105,2),g("ADC",A.ZP_REL,101,2),g("ADC",A.ZP_X,117,2),g("ADC",A.ABS,109,3),g("ADC",A.ABS_X,125,3),g("ADC",A.ABS_Y,121,3),g("ADC",A.IND_X,97,2),g("ADC",A.IND_Y,113,2),g("ADC",A.IND,114,2),g("AND",A.IMM,41,2),g("AND",A.ZP_REL,37,2),g("AND",A.ZP_X,53,2),g("AND",A.ABS,45,3),g("AND",A.ABS_X,61,3),g("AND",A.ABS_Y,57,3),g("AND",A.IND_X,33,2),g("AND",A.IND_Y,49,2),g("AND",A.IND,50,2),g("ASL",A.IMPLIED,10,1),g("ASL",A.ZP_REL,6,2),g("ASL",A.ZP_X,22,2),g("ASL",A.ABS,14,3),g("ASL",A.ABS_X,30,3),g("BCC",A.ZP_REL,144,2),g("BCS",A.ZP_REL,176,2),g("BEQ",A.ZP_REL,240,2),g("BIT",A.ZP_REL,36,2),g("BIT",A.ABS,44,3),g("BIT",A.IMM,137,2),g("BIT",A.ZP_X,52,2),g("BIT",A.ABS_X,60,3),g("BMI",A.ZP_REL,48,2),g("BNE",A.ZP_REL,208,2),g("BPL",A.ZP_REL,16,2),g("BVC",A.ZP_REL,80,2),g("BVS",A.ZP_REL,112,2),g("BRA",A.ZP_REL,128,2),g("BRK",A.IMPLIED,0,1),g("CLC",A.IMPLIED,24,1),g("CLD",A.IMPLIED,216,1),g("CLI",A.IMPLIED,88,1),g("CLV",A.IMPLIED,184,1),g("CMP",A.IMM,201,2),g("CMP",A.ZP_REL,197,2),g("CMP",A.ZP_X,213,2),g("CMP",A.ABS,205,3),g("CMP",A.ABS_X,221,3),g("CMP",A.ABS_Y,217,3),g("CMP",A.IND_X,193,2),g("CMP",A.IND_Y,209,2),g("CMP",A.IND,210,2),g("CPX",A.IMM,224,2),g("CPX",A.ZP_REL,228,2),g("CPX",A.ABS,236,3),g("CPY",A.IMM,192,2),g("CPY",A.ZP_REL,196,2),g("CPY",A.ABS,204,3),g("DEC",A.IMPLIED,58,1),g("DEC",A.ZP_REL,198,2),g("DEC",A.ZP_X,214,2),g("DEC",A.ABS,206,3),g("DEC",A.ABS_X,222,3),g("DEX",A.IMPLIED,202,1),g("DEY",A.IMPLIED,136,1),g("EOR",A.IMM,73,2),g("EOR",A.ZP_REL,69,2),g("EOR",A.ZP_X,85,2),g("EOR",A.ABS,77,3),g("EOR",A.ABS_X,93,3),g("EOR",A.ABS_Y,89,3),g("EOR",A.IND_X,65,2),g("EOR",A.IND_Y,81,2),g("EOR",A.IND,82,2),g("INC",A.IMPLIED,26,1),g("INC",A.ZP_REL,230,2),g("INC",A.ZP_X,246,2),g("INC",A.ABS,238,3),g("INC",A.ABS_X,254,3),g("INX",A.IMPLIED,232,1),g("INY",A.IMPLIED,200,1),g("JMP",A.ABS,76,3),g("JMP",A.IND,108,3),g("JMP",A.IND_X,124,3),g("JSR",A.ABS,32,3),g("LDA",A.IMM,169,2),g("LDA",A.ZP_REL,165,2),g("LDA",A.ZP_X,181,2),g("LDA",A.ABS,173,3),g("LDA",A.ABS_X,189,3),g("LDA",A.ABS_Y,185,3),g("LDA",A.IND_X,161,2),g("LDA",A.IND_Y,177,2),g("LDA",A.IND,178,2),g("LDX",A.IMM,162,2),g("LDX",A.ZP_REL,166,2),g("LDX",A.ZP_Y,182,2),g("LDX",A.ABS,174,3),g("LDX",A.ABS_Y,190,3),g("LDY",A.IMM,160,2),g("LDY",A.ZP_REL,164,2),g("LDY",A.ZP_X,180,2),g("LDY",A.ABS,172,3),g("LDY",A.ABS_X,188,3),g("LSR",A.IMPLIED,74,1),g("LSR",A.ZP_REL,70,2),g("LSR",A.ZP_X,86,2),g("LSR",A.ABS,78,3),g("LSR",A.ABS_X,94,3),g("NOP",A.IMPLIED,234,1),g("ORA",A.IMM,9,2),g("ORA",A.ZP_REL,5,2),g("ORA",A.ZP_X,21,2),g("ORA",A.ABS,13,3),g("ORA",A.ABS_X,29,3),g("ORA",A.ABS_Y,25,3),g("ORA",A.IND_X,1,2),g("ORA",A.IND_Y,17,2),g("ORA",A.IND,18,2),g("PHA",A.IMPLIED,72,1),g("PHP",A.IMPLIED,8,1),g("PHX",A.IMPLIED,218,1),g("PHY",A.IMPLIED,90,1),g("PLA",A.IMPLIED,104,1),g("PLP",A.IMPLIED,40,1),g("PLX",A.IMPLIED,250,1),g("PLY",A.IMPLIED,122,1),g("ROL",A.IMPLIED,42,1),g("ROL",A.ZP_REL,38,2),g("ROL",A.ZP_X,54,2),g("ROL",A.ABS,46,3),g("ROL",A.ABS_X,62,3),g("ROR",A.IMPLIED,106,1),g("ROR",A.ZP_REL,102,2),g("ROR",A.ZP_X,118,2),g("ROR",A.ABS,110,3),g("ROR",A.ABS_X,126,3),g("RTI",A.IMPLIED,64,1),g("RTS",A.IMPLIED,96,1),g("SBC",A.IMM,233,2),g("SBC",A.ZP_REL,229,2),g("SBC",A.ZP_X,245,2),g("SBC",A.ABS,237,3),g("SBC",A.ABS_X,253,3),g("SBC",A.ABS_Y,249,3),g("SBC",A.IND_X,225,2),g("SBC",A.IND_Y,241,2),g("SBC",A.IND,242,2),g("SEC",A.IMPLIED,56,1),g("SED",A.IMPLIED,248,1),g("SEI",A.IMPLIED,120,1),g("STA",A.ZP_REL,133,2),g("STA",A.ZP_X,149,2),g("STA",A.ABS,141,3),g("STA",A.ABS_X,157,3),g("STA",A.ABS_Y,153,3),g("STA",A.IND_X,129,2),g("STA",A.IND_Y,145,2),g("STA",A.IND,146,2),g("STX",A.ZP_REL,134,2),g("STX",A.ZP_Y,150,2),g("STX",A.ABS,142,3),g("STY",A.ZP_REL,132,2),g("STY",A.ZP_X,148,2),g("STY",A.ABS,140,3),g("STZ",A.ZP_REL,100,2),g("STZ",A.ZP_X,116,2),g("STZ",A.ABS,156,3),g("STZ",A.ABS_X,158,3),g("TAX",A.IMPLIED,170,1),g("TAY",A.IMPLIED,168,1),g("TSX",A.IMPLIED,186,1),g("TXA",A.IMPLIED,138,1),g("TXS",A.IMPLIED,154,1),g("TYA",A.IMPLIED,152,1),g("TRB",A.ZP_REL,20,2),g("TRB",A.ABS,28,3),g("TSB",A.ZP_REL,4,2),g("TSB",A.ABS,12,3);const Fi=65536,$s=65792,to=66048;class Ui{constructor(){T(this,"address");T(this,"watchpoint");T(this,"instruction");T(this,"disabled");T(this,"hidden");T(this,"once");T(this,"memget");T(this,"memset");T(this,"expression1");T(this,"expression2");T(this,"expressionOperator");T(this,"hexvalue");T(this,"hitcount");T(this,"nhits");T(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class eo extends Map{set(e,r){const o=[...this.entries()];o.push([e,r]),o.sort((a,h)=>a[0]-h[0]),super.clear();for(const[a,h]of o)super.set(a,h);return this}}let Nn=!1,Yn=!1,ft=new eo;const Ur=()=>{Nn=!0},Ki=()=>{new eo(ft).forEach((o,a)=>{o.once&&ft.delete(a)});const e=ia();if(e<0||ft.get(e))return;const r=new Ui;r.address=e,r.once=!0,r.hidden=!0,ft.set(e,r)},qi=t=>{ft=t},ro=(t,e)=>{const r=yt[t];return!(e<r.min||e>r.max||!r.enabled(e))},no=(t,e,r)=>{const o=ft.get(t);return!o||!o.watchpoint||o.disabled||o.hexvalue>=0&&o.hexvalue!==e||o.memoryBank&&!ro(o.memoryBank,t)?!1:r?o.memset:o.memget},ir=(t=0,e=!0)=>{e?c.flagIRQ|=1<<t:c.flagIRQ&=~(1<<t),c.flagIRQ&=255},Ni=(t=!0)=>{c.flagNMI=t===!0},Yi=()=>{c.flagIRQ=0,c.flagNMI=!1},On=[],so=[],oo=(t,e)=>{On.push(t),so.push(e)},Oi=()=>{for(let t=0;t<On.length;t++)On[t](so[t])},Ao=t=>{let e=0;switch(t.register){case"$":e=Ze(t.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},xi=t=>{const e=Ao(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:Ao(t.expression2)},io=()=>{Yn=!0},Wi=(t=-1,e=-1)=>{if(Yn)return Yn=!1,!0;if(ft.size===0||Nn)return!1;const r=ft.get(c.PC)||ft.get(-1)||ft.get(t|Fi)||t>=0&&ft.get($s)||t>=0&&ft.get(to);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===$s){if(V[t].name!=="???")return!1}else if(r.address===to){if(V[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!xi(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!ro(r.memoryBank,c.PC)?!1:(r.once&&ft.delete(c.PC),!0)},xn=()=>{let t=0;const e=c.PC,r=B(c.PC,!1),o=V[r],a=o.bytes>1?B(c.PC+1,!1):-1,h=o.bytes>2?B(c.PC+2,!1):0;if(Wi(r,(h<<8)+a))return Ut(K.PAUSED),-1;Nn=!1;const p=Io.get(e);if(p&&!E.INTCXROM.isSet&&p(),t=o.execute(a,h),Bo(o.bytes),Yr(c.cycleCount+t),Oi(),c.flagNMI&&(c.flagNMI=!1,t=la(),Yr(c.cycleCount+t)),c.flagIRQ){const u=ca();u>0&&(Yr(c.cycleCount+u),t=u)}return t},Xi=[197,58,163,92,197,58,163,92],Gi=1,ao=4;class Zi{constructor(){T(this,"bits",[]);T(this,"pattern",new Array(64));T(this,"patternIdx",0);T(this,"reset",()=>{this.patternIdx=0});T(this,"checkPattern",e=>{const o=Xi[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===o});T(this,"calcBits",()=>{const e=x=>{this.bits.push(x&8?1:0),this.bits.push(x&4?1:0),this.bits.push(x&2?1:0),this.bits.push(x&1?1:0)},r=x=>{e(Math.floor(x/10)),e(Math.floor(x%10))},o=new Date,a=o.getFullYear()%100,h=o.getDate(),p=o.getDay()+1,u=o.getMonth()+1,D=o.getHours(),J=o.getMinutes(),y=o.getSeconds(),z=o.getMilliseconds()/10;this.bits=[],r(a),r(u),r(h),r(p),r(D),r(J),r(y),r(z)});T(this,"access",e=>{e&ao?this.reset():this.checkPattern(e&Gi)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});T(this,"read",e=>{let r=-1;return this.bits.length>0?e&ao&&(r=this.bits.pop()):this.access(e),r})}}const _i=new Zi,co=320,lo=327,Kr=256*co,Ji=256*lo;let qt=0;const Wn=ne;let P=new Uint8Array(Wn+(qt+1)*65536).fill(0);const Xn=()=>Le(49194),qr=t=>{et(49194,t)},Me=()=>Le(49267),Gn=t=>{et(49267,t)},at=new Array(257).fill(0),Rt=new Array(257).fill(0),uo=t=>{let e="";switch(t){case"APPLE2EU":e=bi;break;case"APPLE2EE":e=Qi;break}const r=e.replace(/\n/g,""),o=new Uint8Array(Oe.Buffer.from(r,"base64"));t==="APPLE2EU"&&(o[15035]=5),P.set(o,sr)},Zn=t=>{t=Math.max(64,Math.min(8192,t));const e=qt;if(qt=Math.floor(t/64)-1,qt===e)return;Me()>qt&&(Gn(0),oe());const r=Wn+(qt+1)*65536;if(qt<e)P=P.slice(0,r);else{const o=P;P=new Uint8Array(r).fill(255),P.set(o)}},Vi=()=>{const t=E.RAMRD.isSet?xe+Me()*256:0,e=E.RAMWRT.isSet?xe+Me()*256:0,r=E.PAGE2.isSet?xe+Me()*256:0,o=E.STORE80.isSet?r:t,a=E.STORE80.isSet?r:e,h=E.STORE80.isSet&&E.HIRES.isSet?r:t,p=E.STORE80.isSet&&E.HIRES.isSet?r:e;for(let u=2;u<256;u++)at[u]=u+t,Rt[u]=u+e;for(let u=4;u<=7;u++)at[u]=u+o,Rt[u]=u+a;for(let u=32;u<=63;u++)at[u]=u+h,Rt[u]=u+p},ji=()=>{const t=E.ALTZP.isSet?xe+Me()*256:0;if(at[0]=t,at[1]=1+t,Rt[0]=t,Rt[1]=1+t,E.BSRREADRAM.isSet){for(let e=208;e<=255;e++)at[e]=e+t;if(!E.BSRBANK2.isSet)for(let e=208;e<=223;e++)at[e]=e-16+t}else for(let e=208;e<=255;e++)at[e]=nr+e-192},Hi=()=>{const t=E.ALTZP.isSet?xe+Me()*256:0,e=E.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Rt[r]=-1;if(e){for(let r=208;r<=255;r++)Rt[r]=r+t;if(!E.BSRBANK2.isSet)for(let r=208;r<=223;r++)Rt[r]=r-16+t}},ho=t=>E.INTCXROM.isSet?!1:t!==3?!0:E.SLOTC3ROM.isSet,vi=()=>!!(E.INTCXROM.isSet||E.INTC8ROM.isSet),_n=t=>{if(t<=7){if(E.INTCXROM.isSet)return;t===3&&!E.SLOTC3ROM.isSet&&(E.INTC8ROM.isSet||(E.INTC8ROM.isSet=!0,qr(255),oe())),Xn()===0&&(qr(t),oe())}else E.INTC8ROM.isSet=!1,qr(0),oe()},zi=()=>{at[192]=nr-192;for(let t=1;t<=7;t++){const e=192+t;at[e]=t+(ho(t)?co-1:nr)}if(vi())for(let t=200;t<=207;t++)at[t]=nr+t-192;else{const t=lo+8*(Xn()-1);for(let e=0;e<=7;e++){const r=200+e;at[r]=t+e}}},oe=()=>{Vi(),ji(),Hi(),zi();for(let t=0;t<256;t++)at[t]=256*at[t],Rt[t]=256*Rt[t]},Io=new Map,fo=new Array(8),Nr=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(_n(r),!ho(r)))return;const o=fo[r];if(o!==void 0){const a=o(t,e);if(a>=0){const h=t>=49408?Kr-256:sr;P[t-49152+h]=a}}},ar=(t,e)=>{fo[t]=e},Ge=(t,e,r=0,o=()=>{})=>{if(P.set(e.slice(0,256),Kr+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,h=Ji+(t-1)*2048;P.set(e.slice(256,a),h)}r&&Io.set(r,o)},$i=()=>{P.fill(255,0,65536),P.fill(255,Wn),qr(0),Gn(0),oe()},ta=t=>(t>=49296?Nr(t):vs(t,!1,c.cycleCount),t>=49232&&oe(),P[sr+t-49152]),X=(t,e)=>{const r=Kr+(t-1)*256+(e&255);return P[r]},F=(t,e,r)=>{if(r>=0){const o=Kr+(t-1)*256+(e&255);P[o]=r&255}},B=(t,e=!0)=>{let r=0;const o=t>>>8;if(o===192)r=ta(t);else if(r=-1,o>=193&&o<=199?(o==195&&!E.SLOTC3ROM.isSet&&(r=_i.read(t)),Nr(t)):t===53247&&_n(255),r<0){const a=at[o];r=P[a+(t&255)]}return e&&no(t,r,!1)&&io(),r},Ze=t=>{const e=t>>>8,r=at[e];return P[r+(t&255)]},ea=(t,e)=>{if(t===49265||t===49267){if(e>qt)return;Gn(e)}else t>=49296?Nr(t,e):vs(t,!0,c.cycleCount);(t<=49167||t>=49232)&&oe()},m=(t,e)=>{const r=t>>>8;if(r===192)ea(t,e);else{r>=193&&r<=199?Nr(t,e):t===53247&&_n(255);const o=Rt[r];if(o<0)return;P[o+(t&255)]=e}no(t,e,!0)&&io()},Le=t=>P[sr+t-49152],et=(t,e,r=1)=>{const o=sr+t-49152;P.fill(e,o,o+r)},go=1024,po=2048,Jn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Vn=(t=!1)=>{let e=0,r=24,o=!1;if(t){if(E.TEXT.isSet||E.HIRES.isSet)return new Uint8Array;r=E.MIXED.isSet?20:24,o=E.COLUMN80.isSet&&!E.AN3.isSet}else{if(!E.TEXT.isSet&&!E.MIXED.isSet)return new Uint8Array;!E.TEXT.isSet&&E.MIXED.isSet&&(e=20),o=E.COLUMN80.isSet}if(o){const a=E.PAGE2.isSet&&!E.STORE80.isSet?po:go,h=new Uint8Array(80*(r-e)).fill(160);for(let p=e;p<r;p++){const u=80*(p-e);for(let D=0;D<40;D++)h[u+2*D+1]=P[a+Jn[p]+D],h[u+2*D]=P[ne+a+Jn[p]+D]}return h}else{const a=E.PAGE2.isSet?po:go,h=new Uint8Array(40*(r-e));for(let p=e;p<r;p++){const u=40*(p-e),D=a+Jn[p];h.set(P.slice(D,D+40),u)}return h}},So=()=>Oe.Buffer.from(Vn().map(t=>t&=127)).toString(),ra=()=>{if(E.TEXT.isSet||!E.HIRES.isSet)return new Uint8Array;const t=E.COLUMN80.isSet&&!E.AN3.isSet,e=E.MIXED.isSet?160:192;if(t){const r=E.PAGE2.isSet&&!E.STORE80.isSet?16384:8192,o=new Uint8Array(80*e);for(let a=0;a<e;a++){const h=vA(r,a);for(let p=0;p<40;p++)o[a*80+2*p+1]=P[h+p],o[a*80+2*p]=P[ne+h+p]}return o}else{const r=E.PAGE2.isSet?16384:8192,o=new Uint8Array(40*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);o.set(P.slice(h,h+40),a*40)}return o}},jn=t=>{const e=at[t>>>8];return P.slice(e,e+512)},Hn=(t,e)=>{const r=Rt[t>>>8]+(t&255);P.set(e,r)},vn=(t,e)=>{for(let r=0;r<e.length;r++)if(B(t+r,!1)!==e[r])return!1;return!0},na=()=>P.slice(0,ne+65536),yt={};yt[""]={name:"Any",min:0,max:65535,enabled:()=>!0},yt.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?!E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?!E.RAMRD.isSet:!E.ALTZP.isSet},yt.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?E.ALTZP.isSet&&E.BSRREADRAM.isSet:t>=512?E.RAMRD.isSet:E.ALTZP.isSet},yt.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535,enabled:()=>!E.BSRREADRAM.isSet},yt["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet},yt["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet},yt["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&!E.BSRBANK2.isSet},yt["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>E.ALTZP.isSet&&E.BSRREADRAM.isSet&&E.BSRBANK2.isSet},yt["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet||!E.SLOTC3ROM.isSet:t>=51200?E.INTCXROM.isSet||E.INTC8ROM.isSet:E.INTCXROM.isSet},yt["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?E.INTCXROM.isSet?!1:E.SLOTC3ROM.isSet:t>=51200?!E.INTCXROM.isSet&&!E.INTC8ROM.isSet:!E.INTCXROM.isSet},Object.values(yt).map(t=>t.name);const c=JA(),cr=t=>{c.Accum=t},lr=t=>{c.XReg=t},ur=t=>{c.YReg=t},Yr=t=>{c.cycleCount=t},Co=t=>{Eo(),Object.assign(c,t)},Eo=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,Nt(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},Bo=t=>{Nt((c.PC+t+65536)%65536)},Nt=t=>{c.PC=t},Do=t=>{c.PStatus=t|48},Yt=new Array(256).fill(""),sa=()=>Yt.slice(0,256),oa=t=>{Yt.splice(0,t.length,...t)},Aa=()=>{const t=jn(256).slice(0,256),e=new Array;for(let r=255;r>c.StackPtr;r--){let o="$"+H(t[r]),a=Yt[r];Yt[r].length>3&&r-1>c.StackPtr&&(Yt[r-1]==="JSR"||Yt[r-1]==="BRK"||Yt[r-1]==="IRQ"?(r--,o+=H(t[r])):a=""),o=(o+"   ").substring(0,6),e.push(H(256+r,4)+": "+o+a)}return e.join(`
`)},ia=()=>{const t=jn(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const r=t[e];if(Yt[e].startsWith("JSR")&&e-1>c.StackPtr&&Yt[e-1]==="JSR"){const o=t[e-1]+1;return(r<<8)+o}}return-1},Jt=(t,e)=>{Yt[c.StackPtr]=t,m(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},Vt=()=>{c.StackPtr=(c.StackPtr+1)%256;const t=B(256+c.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},Pt=()=>(c.PStatus&1)!==0,Q=(t=!0)=>c.PStatus=t?c.PStatus|1:c.PStatus&254,mo=()=>(c.PStatus&2)!==0,hr=(t=!0)=>c.PStatus=t?c.PStatus|2:c.PStatus&253,aa=()=>(c.PStatus&4)!==0,zn=(t=!0)=>c.PStatus=t?c.PStatus|4:c.PStatus&251,ko=()=>(c.PStatus&8)!==0,ot=()=>ko()?1:0,$n=(t=!0)=>c.PStatus=t?c.PStatus|8:c.PStatus&247,ts=(t=!0)=>c.PStatus=t?c.PStatus|16:c.PStatus&239,wo=()=>(c.PStatus&64)!==0,Ir=(t=!0)=>c.PStatus=t?c.PStatus|64:c.PStatus&191,To=()=>(c.PStatus&128)!==0,Ro=(t=!0)=>c.PStatus=t?c.PStatus|128:c.PStatus&127,d=t=>{hr(t===0),Ro(t>=128)},jt=(t,e)=>{if(t){const r=c.PC;return Bo(e>127?e-256:e),3+v(r,c.PC)}return 2},L=(t,e)=>(t+e+256)%256,k=(t,e)=>e*256+t,U=(t,e,r)=>(e*256+t+r+65536)%65536,v=(t,e)=>t>>8!==e>>8?1:0,V=new Array(256),I=(t,e,r,o,a,h=!1)=>{console.assert(!V[r],"Duplicate instruction: "+t+" mode="+e),V[r]={name:t,pcode:r,mode:e,bytes:o,execute:a,is6502:!h}},G=!0,Ae=(t,e,r)=>{const o=B(t),a=B((t+1)%256),h=U(o,a,c.YReg);e(h);let p=5+v(h,k(o,a));return r&&(p+=ot()),p},ie=(t,e,r)=>{const o=B(t),a=B((t+1)%256),h=k(o,a);e(h);let p=5;return r&&(p+=ot()),p},yo=t=>{let e=(c.Accum&15)+(t&15)+(Pt()?1:0);e>=10&&(e+=6);let r=(c.Accum&240)+(t&240)+e;const o=c.Accum<=127&&t<=127,a=c.Accum>=128&&t>=128;Ir((r&255)>=128?o:a),Q(r>=160),Pt()&&(r+=96),c.Accum=r&255,d(c.Accum)},Or=t=>{let e=c.Accum+t+(Pt()?1:0);Q(e>=256),e=e%256;const r=c.Accum<=127&&t<=127,o=c.Accum>=128&&t>=128;Ir(e>=128?r:o),c.Accum=e,d(c.Accum)},ae=t=>{ko()?yo(B(t)):Or(B(t))};I("ADC",A.IMM,105,2,t=>(ot()?yo(t):Or(t),2+ot())),I("ADC",A.ZP_REL,101,2,t=>(ae(t),3+ot())),I("ADC",A.ZP_X,117,2,t=>(ae(L(t,c.XReg)),4+ot())),I("ADC",A.ABS,109,3,(t,e)=>(ae(k(t,e)),4+ot())),I("ADC",A.ABS_X,125,3,(t,e)=>{const r=U(t,e,c.XReg);return ae(r),4+ot()+v(r,k(t,e))}),I("ADC",A.ABS_Y,121,3,(t,e)=>{const r=U(t,e,c.YReg);return ae(r),4+ot()+v(r,k(t,e))}),I("ADC",A.IND_X,97,2,t=>{const e=L(t,c.XReg);return ae(k(B(e),B(e+1))),6+ot()}),I("ADC",A.IND_Y,113,2,t=>Ae(t,ae,!0)),I("ADC",A.IND,114,2,t=>ie(t,ae,!0),G);const ce=t=>{c.Accum&=B(t),d(c.Accum)};I("AND",A.IMM,41,2,t=>(c.Accum&=t,d(c.Accum),2)),I("AND",A.ZP_REL,37,2,t=>(ce(t),3)),I("AND",A.ZP_X,53,2,t=>(ce(L(t,c.XReg)),4)),I("AND",A.ABS,45,3,(t,e)=>(ce(k(t,e)),4)),I("AND",A.ABS_X,61,3,(t,e)=>{const r=U(t,e,c.XReg);return ce(r),4+v(r,k(t,e))}),I("AND",A.ABS_Y,57,3,(t,e)=>{const r=U(t,e,c.YReg);return ce(r),4+v(r,k(t,e))}),I("AND",A.IND_X,33,2,t=>{const e=L(t,c.XReg);return ce(k(B(e),B(e+1))),6}),I("AND",A.IND_Y,49,2,t=>Ae(t,ce,!1)),I("AND",A.IND,50,2,t=>ie(t,ce,!1),G);const xr=t=>{let e=B(t);B(t),Q((e&128)===128),e=(e<<1)%256,m(t,e),d(e)};I("ASL",A.IMPLIED,10,1,()=>(Q((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,d(c.Accum),2)),I("ASL",A.ZP_REL,6,2,t=>(xr(t),5)),I("ASL",A.ZP_X,22,2,t=>(xr(L(t,c.XReg)),6)),I("ASL",A.ABS,14,3,(t,e)=>(xr(k(t,e)),6)),I("ASL",A.ABS_X,30,3,(t,e)=>{const r=U(t,e,c.XReg);return xr(r),6+v(r,k(t,e))}),I("BCC",A.ZP_REL,144,2,t=>jt(!Pt(),t)),I("BCS",A.ZP_REL,176,2,t=>jt(Pt(),t)),I("BEQ",A.ZP_REL,240,2,t=>jt(mo(),t)),I("BMI",A.ZP_REL,48,2,t=>jt(To(),t)),I("BNE",A.ZP_REL,208,2,t=>jt(!mo(),t)),I("BPL",A.ZP_REL,16,2,t=>jt(!To(),t)),I("BVC",A.ZP_REL,80,2,t=>jt(!wo(),t)),I("BVS",A.ZP_REL,112,2,t=>jt(wo(),t)),I("BRA",A.ZP_REL,128,2,t=>jt(!0,t),G);const Wr=t=>{hr((c.Accum&t)===0),Ro((t&128)!==0),Ir((t&64)!==0)};I("BIT",A.ZP_REL,36,2,t=>(Wr(B(t)),3)),I("BIT",A.ABS,44,3,(t,e)=>(Wr(B(k(t,e))),4)),I("BIT",A.IMM,137,2,t=>(hr((c.Accum&t)===0),2),G),I("BIT",A.ZP_X,52,2,t=>(Wr(B(L(t,c.XReg))),4),G),I("BIT",A.ABS_X,60,3,(t,e)=>{const r=U(t,e,c.XReg);return Wr(B(r)),4+v(r,k(t,e))},G);const es=(t,e,r=0)=>{const o=(c.PC+r)%65536,a=B(e),h=B(e+1);Jt(`${t} $`+H(h)+H(a),Math.trunc(o/256)),Jt(t,o%256),Jt("P",c.PStatus),$n(!1),zn();const p=U(a,h,t==="BRK"?-1:0);Nt(p)},Po=()=>(ts(),es("BRK",65534,2),7);I("BRK",A.IMPLIED,0,1,Po);const ca=()=>aa()?0:(ts(!1),es("IRQ",65534),7),la=()=>(es("NMI",65530),7);I("CLC",A.IMPLIED,24,1,()=>(Q(!1),2)),I("CLD",A.IMPLIED,216,1,()=>($n(!1),2)),I("CLI",A.IMPLIED,88,1,()=>(zn(!1),2)),I("CLV",A.IMPLIED,184,1,()=>(Ir(!1),2));const Qe=t=>{const e=B(t);Q(c.Accum>=e),d((c.Accum-e+256)%256)},ua=t=>{const e=B(t);Q(c.Accum>=e),d((c.Accum-e+256)%256)};I("CMP",A.IMM,201,2,t=>(Q(c.Accum>=t),d((c.Accum-t+256)%256),2)),I("CMP",A.ZP_REL,197,2,t=>(Qe(t),3)),I("CMP",A.ZP_X,213,2,t=>(Qe(L(t,c.XReg)),4)),I("CMP",A.ABS,205,3,(t,e)=>(Qe(k(t,e)),4)),I("CMP",A.ABS_X,221,3,(t,e)=>{const r=U(t,e,c.XReg);return ua(r),4+v(r,k(t,e))}),I("CMP",A.ABS_Y,217,3,(t,e)=>{const r=U(t,e,c.YReg);return Qe(r),4+v(r,k(t,e))}),I("CMP",A.IND_X,193,2,t=>{const e=L(t,c.XReg);return Qe(k(B(e),B(e+1))),6}),I("CMP",A.IND_Y,209,2,t=>Ae(t,Qe,!1)),I("CMP",A.IND,210,2,t=>ie(t,Qe,!1),G);const Mo=t=>{const e=B(t);Q(c.XReg>=e),d((c.XReg-e+256)%256)};I("CPX",A.IMM,224,2,t=>(Q(c.XReg>=t),d((c.XReg-t+256)%256),2)),I("CPX",A.ZP_REL,228,2,t=>(Mo(t),3)),I("CPX",A.ABS,236,3,(t,e)=>(Mo(k(t,e)),4));const Lo=t=>{const e=B(t);Q(c.YReg>=e),d((c.YReg-e+256)%256)};I("CPY",A.IMM,192,2,t=>(Q(c.YReg>=t),d((c.YReg-t+256)%256),2)),I("CPY",A.ZP_REL,196,2,t=>(Lo(t),3)),I("CPY",A.ABS,204,3,(t,e)=>(Lo(k(t,e)),4));const Xr=t=>{const e=L(B(t),-1);m(t,e),d(e)};I("DEC",A.IMPLIED,58,1,()=>(c.Accum=L(c.Accum,-1),d(c.Accum),2),G),I("DEC",A.ZP_REL,198,2,t=>(Xr(t),5)),I("DEC",A.ZP_X,214,2,t=>(Xr(L(t,c.XReg)),6)),I("DEC",A.ABS,206,3,(t,e)=>(Xr(k(t,e)),6)),I("DEC",A.ABS_X,222,3,(t,e)=>{const r=U(t,e,c.XReg);return B(r),Xr(r),7}),I("DEX",A.IMPLIED,202,1,()=>(c.XReg=L(c.XReg,-1),d(c.XReg),2)),I("DEY",A.IMPLIED,136,1,()=>(c.YReg=L(c.YReg,-1),d(c.YReg),2));const le=t=>{c.Accum^=B(t),d(c.Accum)};I("EOR",A.IMM,73,2,t=>(c.Accum^=t,d(c.Accum),2)),I("EOR",A.ZP_REL,69,2,t=>(le(t),3)),I("EOR",A.ZP_X,85,2,t=>(le(L(t,c.XReg)),4)),I("EOR",A.ABS,77,3,(t,e)=>(le(k(t,e)),4)),I("EOR",A.ABS_X,93,3,(t,e)=>{const r=U(t,e,c.XReg);return le(r),4+v(r,k(t,e))}),I("EOR",A.ABS_Y,89,3,(t,e)=>{const r=U(t,e,c.YReg);return le(r),4+v(r,k(t,e))}),I("EOR",A.IND_X,65,2,t=>{const e=L(t,c.XReg);return le(k(B(e),B(e+1))),6}),I("EOR",A.IND_Y,81,2,t=>Ae(t,le,!1)),I("EOR",A.IND,82,2,t=>ie(t,le,!1),G);const Gr=t=>{const e=L(B(t),1);m(t,e),d(e)};I("INC",A.IMPLIED,26,1,()=>(c.Accum=L(c.Accum,1),d(c.Accum),2),G),I("INC",A.ZP_REL,230,2,t=>(Gr(t),5)),I("INC",A.ZP_X,246,2,t=>(Gr(L(t,c.XReg)),6)),I("INC",A.ABS,238,3,(t,e)=>(Gr(k(t,e)),6)),I("INC",A.ABS_X,254,3,(t,e)=>{const r=U(t,e,c.XReg);return B(r),Gr(r),7}),I("INX",A.IMPLIED,232,1,()=>(c.XReg=L(c.XReg,1),d(c.XReg),2)),I("INY",A.IMPLIED,200,1,()=>(c.YReg=L(c.YReg,1),d(c.YReg),2)),I("JMP",A.ABS,76,3,(t,e)=>(Nt(U(t,e,-3)),3)),I("JMP",A.IND,108,3,(t,e)=>{const r=k(t,e);return t=B(r),e=B((r+1)%65536),Nt(U(t,e,-3)),6}),I("JMP",A.IND_X,124,3,(t,e)=>{const r=U(t,e,c.XReg);return t=B(r),e=B((r+1)%65536),Nt(U(t,e,-3)),6},G),I("JSR",A.ABS,32,3,(t,e)=>{const r=(c.PC+2)%65536;return Jt("JSR $"+H(e)+H(t),Math.trunc(r/256)),Jt("JSR",r%256),Nt(U(t,e,-3)),6});const ue=t=>{c.Accum=B(t),d(c.Accum)};I("LDA",A.IMM,169,2,t=>(c.Accum=t,d(c.Accum),2)),I("LDA",A.ZP_REL,165,2,t=>(ue(t),3)),I("LDA",A.ZP_X,181,2,t=>(ue(L(t,c.XReg)),4)),I("LDA",A.ABS,173,3,(t,e)=>(ue(k(t,e)),4)),I("LDA",A.ABS_X,189,3,(t,e)=>{const r=U(t,e,c.XReg);return ue(r),4+v(r,k(t,e))}),I("LDA",A.ABS_Y,185,3,(t,e)=>{const r=U(t,e,c.YReg);return ue(r),4+v(r,k(t,e))}),I("LDA",A.IND_X,161,2,t=>{const e=L(t,c.XReg);return ue(k(B(e),B((e+1)%256))),6}),I("LDA",A.IND_Y,177,2,t=>Ae(t,ue,!1)),I("LDA",A.IND,178,2,t=>ie(t,ue,!1),G);const Zr=t=>{c.XReg=B(t),d(c.XReg)};I("LDX",A.IMM,162,2,t=>(c.XReg=t,d(c.XReg),2)),I("LDX",A.ZP_REL,166,2,t=>(Zr(t),3)),I("LDX",A.ZP_Y,182,2,t=>(Zr(L(t,c.YReg)),4)),I("LDX",A.ABS,174,3,(t,e)=>(Zr(k(t,e)),4)),I("LDX",A.ABS_Y,190,3,(t,e)=>{const r=U(t,e,c.YReg);return Zr(r),4+v(r,k(t,e))});const _r=t=>{c.YReg=B(t),d(c.YReg)};I("LDY",A.IMM,160,2,t=>(c.YReg=t,d(c.YReg),2)),I("LDY",A.ZP_REL,164,2,t=>(_r(t),3)),I("LDY",A.ZP_X,180,2,t=>(_r(L(t,c.XReg)),4)),I("LDY",A.ABS,172,3,(t,e)=>(_r(k(t,e)),4)),I("LDY",A.ABS_X,188,3,(t,e)=>{const r=U(t,e,c.XReg);return _r(r),4+v(r,k(t,e))});const Jr=t=>{let e=B(t);B(t),Q((e&1)===1),e>>=1,m(t,e),d(e)};I("LSR",A.IMPLIED,74,1,()=>(Q((c.Accum&1)===1),c.Accum>>=1,d(c.Accum),2)),I("LSR",A.ZP_REL,70,2,t=>(Jr(t),5)),I("LSR",A.ZP_X,86,2,t=>(Jr(L(t,c.XReg)),6)),I("LSR",A.ABS,78,3,(t,e)=>(Jr(k(t,e)),6)),I("LSR",A.ABS_X,94,3,(t,e)=>{const r=U(t,e,c.XReg);return Jr(r),6+v(r,k(t,e))}),I("NOP",A.IMPLIED,234,1,()=>2);const he=t=>{c.Accum|=B(t),d(c.Accum)};I("ORA",A.IMM,9,2,t=>(c.Accum|=t,d(c.Accum),2)),I("ORA",A.ZP_REL,5,2,t=>(he(t),3)),I("ORA",A.ZP_X,21,2,t=>(he(L(t,c.XReg)),4)),I("ORA",A.ABS,13,3,(t,e)=>(he(k(t,e)),4)),I("ORA",A.ABS_X,29,3,(t,e)=>{const r=U(t,e,c.XReg);return he(r),4+v(r,k(t,e))}),I("ORA",A.ABS_Y,25,3,(t,e)=>{const r=U(t,e,c.YReg);return he(r),4+v(r,k(t,e))}),I("ORA",A.IND_X,1,2,t=>{const e=L(t,c.XReg);return he(k(B(e),B(e+1))),6}),I("ORA",A.IND_Y,17,2,t=>Ae(t,he,!1)),I("ORA",A.IND,18,2,t=>ie(t,he,!1),G),I("PHA",A.IMPLIED,72,1,()=>(Jt("PHA",c.Accum),3)),I("PHP",A.IMPLIED,8,1,()=>(Jt("PHP",c.PStatus|16),3)),I("PHX",A.IMPLIED,218,1,()=>(Jt("PHX",c.XReg),3),G),I("PHY",A.IMPLIED,90,1,()=>(Jt("PHY",c.YReg),3),G),I("PLA",A.IMPLIED,104,1,()=>(c.Accum=Vt(),d(c.Accum),4)),I("PLP",A.IMPLIED,40,1,()=>(Do(Vt()),4)),I("PLX",A.IMPLIED,250,1,()=>(c.XReg=Vt(),d(c.XReg),4),G),I("PLY",A.IMPLIED,122,1,()=>(c.YReg=Vt(),d(c.YReg),4),G);const Vr=t=>{let e=B(t);B(t);const r=Pt()?1:0;Q((e&128)===128),e=(e<<1)%256|r,m(t,e),d(e)};I("ROL",A.IMPLIED,42,1,()=>{const t=Pt()?1:0;return Q((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|t,d(c.Accum),2}),I("ROL",A.ZP_REL,38,2,t=>(Vr(t),5)),I("ROL",A.ZP_X,54,2,t=>(Vr(L(t,c.XReg)),6)),I("ROL",A.ABS,46,3,(t,e)=>(Vr(k(t,e)),6)),I("ROL",A.ABS_X,62,3,(t,e)=>{const r=U(t,e,c.XReg);return Vr(r),6+v(r,k(t,e))});const jr=t=>{let e=B(t);B(t);const r=Pt()?128:0;Q((e&1)===1),e=e>>1|r,m(t,e),d(e)};I("ROR",A.IMPLIED,106,1,()=>{const t=Pt()?128:0;return Q((c.Accum&1)===1),c.Accum=c.Accum>>1|t,d(c.Accum),2}),I("ROR",A.ZP_REL,102,2,t=>(jr(t),5)),I("ROR",A.ZP_X,118,2,t=>(jr(L(t,c.XReg)),6)),I("ROR",A.ABS,110,3,(t,e)=>(jr(k(t,e)),6)),I("ROR",A.ABS_X,126,3,(t,e)=>{const r=U(t,e,c.XReg);return jr(r),6+v(r,k(t,e))}),I("RTI",A.IMPLIED,64,1,()=>(Do(Vt()),ts(!1),Nt(k(Vt(),Vt())-1),6)),I("RTS",A.IMPLIED,96,1,()=>(Nt(k(Vt(),Vt())),6));const Qo=t=>{const e=255-t;let r=c.Accum+e+(Pt()?1:0);const o=r>=256,a=c.Accum<=127&&e<=127,h=c.Accum>=128&&e>=128;Ir(r%256>=128?a:h);const p=(c.Accum&15)-(t&15)+(Pt()?0:-1);r=c.Accum-t+(Pt()?0:-1),r<0&&(r-=96),p<0&&(r-=6),c.Accum=r&255,d(c.Accum),Q(o)},Ie=t=>{ot()?Qo(B(t)):Or(255-B(t))};I("SBC",A.IMM,233,2,t=>(ot()?Qo(t):Or(255-t),2+ot())),I("SBC",A.ZP_REL,229,2,t=>(Ie(t),3+ot())),I("SBC",A.ZP_X,245,2,t=>(Ie(L(t,c.XReg)),4+ot())),I("SBC",A.ABS,237,3,(t,e)=>(Ie(k(t,e)),4+ot())),I("SBC",A.ABS_X,253,3,(t,e)=>{const r=U(t,e,c.XReg);return Ie(r),4+ot()+v(r,k(t,e))}),I("SBC",A.ABS_Y,249,3,(t,e)=>{const r=U(t,e,c.YReg);return Ie(r),4+ot()+v(r,k(t,e))}),I("SBC",A.IND_X,225,2,t=>{const e=L(t,c.XReg);return Ie(k(B(e),B(e+1))),6+ot()}),I("SBC",A.IND_Y,241,2,t=>Ae(t,Ie,!0)),I("SBC",A.IND,242,2,t=>ie(t,Ie,!0),G),I("SEC",A.IMPLIED,56,1,()=>(Q(),2)),I("SED",A.IMPLIED,248,1,()=>($n(),2)),I("SEI",A.IMPLIED,120,1,()=>(zn(),2)),I("STA",A.ZP_REL,133,2,t=>(m(t,c.Accum),3)),I("STA",A.ZP_X,149,2,t=>(m(L(t,c.XReg),c.Accum),4)),I("STA",A.ABS,141,3,(t,e)=>(m(k(t,e),c.Accum),4)),I("STA",A.ABS_X,157,3,(t,e)=>{const r=U(t,e,c.XReg);return B(r),m(r,c.Accum),5}),I("STA",A.ABS_Y,153,3,(t,e)=>(m(U(t,e,c.YReg),c.Accum),5)),I("STA",A.IND_X,129,2,t=>{const e=L(t,c.XReg);return m(k(B(e),B(e+1)),c.Accum),6});const bo=t=>{m(t,c.Accum)};I("STA",A.IND_Y,145,2,t=>(Ae(t,bo,!1),6)),I("STA",A.IND,146,2,t=>ie(t,bo,!1),G),I("STX",A.ZP_REL,134,2,t=>(m(t,c.XReg),3)),I("STX",A.ZP_Y,150,2,t=>(m(L(t,c.YReg),c.XReg),4)),I("STX",A.ABS,142,3,(t,e)=>(m(k(t,e),c.XReg),4)),I("STY",A.ZP_REL,132,2,t=>(m(t,c.YReg),3)),I("STY",A.ZP_X,148,2,t=>(m(L(t,c.XReg),c.YReg),4)),I("STY",A.ABS,140,3,(t,e)=>(m(k(t,e),c.YReg),4)),I("STZ",A.ZP_REL,100,2,t=>(m(t,0),3),G),I("STZ",A.ZP_X,116,2,t=>(m(L(t,c.XReg),0),4),G),I("STZ",A.ABS,156,3,(t,e)=>(m(k(t,e),0),4),G),I("STZ",A.ABS_X,158,3,(t,e)=>{const r=U(t,e,c.XReg);return B(r),m(r,0),5},G),I("TAX",A.IMPLIED,170,1,()=>(c.XReg=c.Accum,d(c.XReg),2)),I("TAY",A.IMPLIED,168,1,()=>(c.YReg=c.Accum,d(c.YReg),2)),I("TSX",A.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,d(c.XReg),2)),I("TXA",A.IMPLIED,138,1,()=>(c.Accum=c.XReg,d(c.Accum),2)),I("TXS",A.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),I("TYA",A.IMPLIED,152,1,()=>(c.Accum=c.YReg,d(c.Accum),2));const Fo=t=>{const e=B(t);hr((c.Accum&e)===0),m(t,e&~c.Accum)};I("TRB",A.ZP_REL,20,2,t=>(Fo(t),5),G),I("TRB",A.ABS,28,3,(t,e)=>(Fo(k(t,e)),6),G);const Uo=t=>{const e=B(t);hr((c.Accum&e)===0),m(t,e|c.Accum)};I("TSB",A.ZP_REL,4,2,t=>(Uo(t),5),G),I("TSB",A.ABS,12,3,(t,e)=>(Uo(k(t,e)),6),G);const ha=[2,34,66,98,130,194,226],Mt="???";ha.forEach(t=>{I(Mt,A.IMPLIED,t,2,()=>2),V[t].is6502=!1});for(let t=0;t<=15;t++)I(Mt,A.IMPLIED,3+16*t,1,()=>1),V[3+16*t].is6502=!1,I(Mt,A.IMPLIED,7+16*t,1,()=>1),V[7+16*t].is6502=!1,I(Mt,A.IMPLIED,11+16*t,1,()=>1),V[11+16*t].is6502=!1,I(Mt,A.IMPLIED,15+16*t,1,()=>1),V[15+16*t].is6502=!1;I(Mt,A.IMPLIED,68,2,()=>3),V[68].is6502=!1,I(Mt,A.IMPLIED,84,2,()=>4),V[84].is6502=!1,I(Mt,A.IMPLIED,212,2,()=>4),V[212].is6502=!1,I(Mt,A.IMPLIED,244,2,()=>4),V[244].is6502=!1,I(Mt,A.IMPLIED,92,3,()=>8),V[92].is6502=!1,I(Mt,A.IMPLIED,220,3,()=>4),V[220].is6502=!1,I(Mt,A.IMPLIED,252,3,()=>4),V[252].is6502=!1;for(let t=0;t<256;t++)V[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",A.IMPLIED,t,1,Po));const ht=(t,e,r)=>{const o=e&7,a=e>>>3;return t[a]|=r>>>o,o&&(t[a+1]|=r<<8-o),e+8},Hr=(t,e,r)=>(e=ht(t,e,r>>>1|170),e=ht(t,e,r|170),e),rs=(t,e)=>(e=ht(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Ia=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),o=[0,2,1,3];for(let h=0;h<84;h++)r[h]=o[t[h]&3]|o[t[h+86]&3]<<2|o[t[h+172]&3]<<4;r[84]=o[t[84]&3]<<0|o[t[170]&3]<<2,r[85]=o[t[85]&3]<<0|o[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const fa=(t,e,r)=>{let o=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)o=rs(a,o);for(let h=0;h<16;h++){o=ht(a,o,213),o=ht(a,o,170),o=ht(a,o,150),o=Hr(a,o,254),o=Hr(a,o,e),o=Hr(a,o,h),o=Hr(a,o,254^e^h),o=ht(a,o,222),o=ht(a,o,170),o=ht(a,o,235);for(let D=0;D<7;D++)o=rs(a,o);o=ht(a,o,213),o=ht(a,o,170),o=ht(a,o,173);const p=h===15?15:h*(r?8:7)%15,u=Ia(t.slice(p*256,p*256+256));for(let D=0;D<u.length;D++)o=ht(a,o,u[D]);o=ht(a,o,222),o=ht(a,o,170),o=ht(a,o,235);for(let D=0;D<16;D++)o=rs(a,o)}return a},ga=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const o=new Uint8Array(1536+r*13*512).fill(0);o.set(or(`WOZ2ÿ
\r
`),0),o.set(or("INFO"),12),o[16]=60,o[20]=2,o[21]=1,o[22]=0,o[23]=0,o[24]=1,o.fill(32,25,57),o.set(or("Apple2TS (CT6502)"),25),o[57]=1,o[58]=0,o[59]=32,o[60]=0,o[62]=0,o[64]=13,o.set(or("TMAP"),80),o[84]=160,o.fill(255,88,248);let a=0;for(let h=0;h<r;h++)a=88+(h<<2),h>0&&(o[a-1]=h),o[a]=o[a+1]=h;o.set(or("TRKS"),248),o.set(Ps(1280+r*13*512),252);for(let h=0;h<r;h++){a=256+(h<<3),o.set(VA(3+h*13),a),o[a+2]=13,o.set(Ps(50304),a+4);const p=t.slice(h*16*256,(h+1)*16*256),u=fa(p,h,e);a=1536+h*13*512,o.set(u,a)}return o},pa=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,D)=>u!==e[D])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,p=HA(e,12);if(h!==0&&h!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const D=e[88+u*2];if(D<255){const J=256+8*D,y=e.slice(J,J+8);t.trackStart[u]=512*((y[1]<<8)+y[0]),t.trackNbits[u]=y[4]+(y[5]<<8)+(y[6]<<16)+y[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},Sa=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const h=e[88+a*2];if(h<255){t.trackStart[a]=256+h*6656;const p=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=p[2]+(p[3]<<8),t.maxHalftrack=a}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},Ca=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),o=e.endsWith(".po");return r||o},Ea=(t,e)=>{const o=t.filename.toLowerCase().endsWith(".po"),a=ga(e,o);return a.length===0?new Uint8Array:(t.filename=Ms(t.filename,"woz"),t.diskHasChanges=!0,a)},Ko=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Ba=(t,e)=>{const r=Ko(e.slice(24,28)),o=Ko(e.slice(28,32));let a="";for(let h=0;h<4;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Ms(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(r,r+o))},qo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},Da=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(qo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return Ba(t,e)}return Ca(t.filename)&&(e=Ea(t,e)),pa(t,e)||Sa(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},ma=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let _e=0,rt=0,gt=0,vr=!1,ns=!1;const No=t=>{vr=!1,Zo(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},ka=(t=!1)=>{if(t){const e=rn();e.motorRunning&&_o(e)}else tr(ke.MOTOR_OFF)},Yo=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(tr(ke.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):tr(ke.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,kt(),gt+=r,t.trackLocation+=Math.floor(gt/4),gt=gt%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let Oo=0;const wa=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],xo=()=>(Oo++,wa[Oo&31]);let zr=0;const da=t=>(zr<<=1,zr|=t,zr&=15,zr===0?xo():t),Wo=[128,64,32,16,8,4,2,1],Ta=[127,191,223,239,247,251,253,254],$r=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[o],h=t.trackLocation&7;r=(a&Wo[h])>>7-h,r=da(r)}else r=xo();return t.trackLocation++,r},Ra=()=>Math.floor(256*Math.random()),Xo=(t,e,r)=>{if(e.length===0)return Ra();let o=0;if(t.isSynchronized){for(gt+=r;gt>=4;){const a=$r(t,e);if((rt>0||a)&&(rt=rt<<1|a),gt-=4,rt&128&&gt<=6)break}gt<0&&(gt=0),rt&=255}else if(rt===0){for(;$r(t,e)===0;);rt=64;for(let a=5;a>=0;a--)rt|=$r(t,e)<<a}else{const a=$r(t,e);rt=rt<<1|a}return o=rt,rt>127&&(rt=0),o};let Ht=0;const ss=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[o];const h=t.trackLocation&7;r?a|=Wo[h]:a&=Ta[h],e[o]=a}t.trackLocation++},Go=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&rt>0){if(r>=16)for(let o=7;o>=0;o--)ss(t,e,rt&2**o?1:0);r>=36&&ss(t,e,0),r>=40&&ss(t,e,0),os.push(r>=40?2:r>=36?1:rt),t.diskHasChanges=!0,rt=0}},Zo=t=>{_e=0,vr||(t.motorRunning=!1),kt(),tr(ke.MOTOR_OFF)},_o=t=>{_e?(clearTimeout(_e),_e=0):gt=0,t.motorRunning=!0,kt(),tr(ke.MOTOR_ON)},ya=t=>{_e===0&&(_e=setTimeout(()=>Zo(t),1e3))};let os=[];const tn=t=>{os.length>0&&t.halftrack===2*0&&(os=[])},en=[0,0,0,0],Pa=(t,e)=>{if(t>=49408)return-1;let r=rn();const o=Qa();if(r.hardDrive)return 0;let a=0;const h=c.cycleCount-Ht;switch(t=t&15,t){case 9:vr=!0,_o(r),tn(r);break;case 8:r.motorRunning&&!r.writeMode&&(a=Xo(r,o,h),Ht=c.cycleCount),vr=!1,ya(r),tn(r);break;case 10:case 11:{const p=t===10?2:3,u=rn();La(p),r=rn(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,kt());break}case 12:ns=!1,r.motorRunning&&!r.writeMode&&(a=Xo(r,o,h),Ht=c.cycleCount);break;case 13:ns=!0,r.motorRunning&&(r.writeMode?(Go(r,o,h),Ht=c.cycleCount):(rt=0,gt+=h,r.trackLocation+=Math.floor(gt/4),gt=gt%4,Ht=c.cycleCount),e>=0&&(rt=e));break;case 14:r.motorRunning&&r.writeMode&&(Go(r,o,h),Ht=c.cycleCount),r.writeMode=!1,ns&&(a=r.isWriteProtected?255:0),tn(r);break;case 15:r.writeMode=!0,Ht=c.cycleCount,e>=0&&(rt=e);break;default:{if(t<0||t>7)break;en[Math.floor(t/2)]=t%2;const p=en[(r.currentPhase+1)%4],u=en[(r.currentPhase+3)%4];en[r.currentPhase]||(r.motorRunning&&p?(Yo(r,1,h),r.currentPhase=(r.currentPhase+1)%4,Ht=c.cycleCount):r.motorRunning&&u&&(Yo(r,-1,h),r.currentPhase=(r.currentPhase+3)%4,Ht=c.cycleCount)),tn(r);break}}return a},Ma=()=>{Ge(6,Uint8Array.from(ma)),ar(6,Pa)},vt=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0}),Jo=()=>{Y[0]=vt(0,1,!0),Y[1]=vt(1,2,!0),Y[2]=vt(2,1,!1),Y[3]=vt(3,2,!1);for(let t=0;t<Y.length;t++)zt[t]=new Uint8Array},Y=[],zt=[];Jo();let be=2;const La=t=>{be=t},rn=()=>Y[be],Qa=()=>zt[be],As=t=>Y[t==2?1:0],nn=t=>zt[t==2?1:0],kt=()=>{for(let t=0;t<Y.length;t++){const e={index:t,hardDrive:Y[t].hardDrive,drive:Y[t].drive,filename:Y[t].filename,status:Y[t].status,motorRunning:Y[t].motorRunning,diskHasChanges:Y[t].diskHasChanges,isWriteProtected:Y[t].isWriteProtected,diskData:Y[t].diskHasChanges?zt[t]:new Uint8Array};S1(e)}},ba=t=>{const e=["","",""];for(let o=0;o<Y.length;o++)(t||zt[o].length<32e6)&&(e[o]=Oe.Buffer.from(zt[o]).toString("base64"));const r={currentDrive:be,driveState:[vt(0,1,!0),vt(1,2,!0),vt(2,1,!1),vt(3,2,!1)],driveData:e};for(let o=0;o<Y.length;o++)r.driveState[o]={...Y[o]};return r},Fa=t=>{tr(ke.MOTOR_OFF),be=t.currentDrive,t.driveState.length===3&&be>0&&be++,Jo();let e=0;for(let r=0;r<t.driveState.length;r++)Y[e]={...t.driveState[r]},t.driveData[r]!==""&&(zt[e]=new Uint8Array(Oe.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;kt()},Ua=()=>{No(Y[1]),No(Y[2]),kt()},Vo=(t=!1)=>{ka(t),kt()},Ka=t=>{let e=t.index,r=t.drive,o=t.hardDrive;t.filename!==""&&(qo(t.filename)?(o=!0,e=t.drive<=1?0:1,r=e+1):(o=!1,e=t.drive<=1?2:3,r=e-1)),Y[e]=vt(e,r,o),Y[e].filename=t.filename,Y[e].motorRunning=t.motorRunning,zt[e]=Da(Y[e],t.diskData),zt[e].length===0&&(Y[e].filename=""),kt()},qa=t=>{const e=t.index;Y[e].filename=t.filename,Y[e].motorRunning=t.motorRunning,Y[e].isWriteProtected=t.isWriteProtected,kt()};let sn=!1;const jo=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Ho=t=>{let e=A.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=A.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=A.IND_Y:t.endsWith(",X)")?e=A.IND_X:e=A.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?A.ABS_X:A.ZP_X:t.endsWith(",Y")?e=t.length>5?A.ABS_Y:A.ZP_Y:e=t.length>3?A.ABS:A.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const o=jo(t);if(o.operation&&o.value){switch(o.operation){case"+":r+=o.value;break;case"-":r-=o.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let Fe={};const vo=(t,e,r,o)=>{let a=A.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(Fe).forEach(([u,D])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+H(D))}),Ho(r);const p=jo(r);if(p.label){const u=p.label.startsWith("<"),D=p.label.startsWith(">"),J=p.label.startsWith("#")||D||u;if(J&&(p.label=p.label.substring(1)),p.label in Fe?(h=Fe[p.label],D?h=h>>8&255:u&&(h=h&255)):o===2&&console.error("Missing label: "+p.label),p.operation&&p.value){switch(p.operation){case"+":h+=p.value;break;case"-":h-=p.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}dn(e)?(a=A.ZP_REL,h=h-t+254,h>255&&(h-=256)):J?a=A.IMM:(a=h>=0&&h<=255?A.ZP_REL:A.ABS,a=p.idx==="X"?a===A.ABS?A.ABS_X:A.ZP_X:a,a=p.idx==="Y"?a===A.ABS?A.ABS_Y:A.ZP_Y:a)}return[a,h]},Na=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Ya=(t,e)=>{if(t.label in Fe&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,o]=vo(e,t.instr,t.operand,2);r!==A.ABS&&r!==A.ZP_REL&&console.error("Illegal EQU value: "+t.operand),Fe[t.label]=o}else Fe[t.label]=e},Oa=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,o=0;r.startsWith('"')&&r.endsWith('"')?o=128:r.startsWith("'")&&r.endsWith("'")?o=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let a=0;a<r.length;a++)e.push(r.charCodeAt(a)|o);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(a=>{const h=parseInt(a,16);isNaN(h)&&console.error(`Invalid HEX value: ${a} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},xa=(t,e)=>{const r=[],o=V[t];return r.push(t),e>=0&&(r.push(e%256),o.bytes===3&&r.push(Math.trunc(e/256))),r};let is=0;const zo=(t,e)=>{let r=is;const o=[];let a="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let p=(h+"                   ").slice(0,30)+H(r,4)+"- ";const u=Na(h,a);if(a="",!u.instr){a=u.label;return}if(u.instr==="ORG"){if(e===1){const[x,w]=Ho(u.operand);x===A.ABS&&(is=w,r=w)}sn&&e===2&&console.log(p);return}if(e===1&&u.label&&Ya(u,r),u.instr==="EQU")return;let D=[],J,y;if(["ASC","DA","HEX"].includes(u.instr))D=Oa(u),r+=D.length;else if([J,y]=vo(r,u.instr,u.operand,e),e===2&&isNaN(y)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")D.push(y&255),r++;else if(u.instr==="DW")D.push(y&255),D.push(y>>8&255),r+=2;else if(u.instr==="DS")for(let x=0;x<y;x++)D.push(0),r++;else{e===2&&dn(u.instr)&&(y<0||y>255)&&console.error(`Branch instruction out of range: ${h} value: ${y} pass: ${e}`);const x=V.findIndex(w=>w&&w.name===u.instr&&w.mode===J);x<0&&console.error(`Unknown instruction: "${h}" mode=${J} pass=${e}`),D=xa(x,y),r+=V[x].bytes}sn&&e===2&&(D.forEach(x=>{p+=` ${H(x)}`}),console.log(p)),o.push(...D)}),sn&&e===2){let h="";o.forEach(p=>{h+=` ${H(p)}`}),console.log(h)}return o},on=(t,e,r=!1)=>{Fe={},sn=r;try{return is=t,zo(e,1),zo(e,2)}catch(o){return console.error(o),[]}},$o=`
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
`,wt={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},fr={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Ue={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Wa{constructor(e){T(this,"_control");T(this,"_status");T(this,"_command");T(this,"_lastRead");T(this,"_lastConfig");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._control=fr.HW_RESET,this._command=Ue.HW_RESET,this._status=wt.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=wt.OVRN;this._status|=wt.RX_FULL,this._control&Ue.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&Ue.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(wt.PE|wt.FE|wt.OVRN),this._receiveBuffer.length?(this._status|=wt.RX_FULL,this._control&Ue.RX_INT_DIS||this.irq(!0)):this._status&=~wt.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&wt.IRQ&&this.irq(!1),this._status&=~wt.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=wt.IRQ:this._status&=~wt.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&fr.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&fr.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&fr.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Ue.PARITY_EN)switch(this._command&Ue.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=fr.HW_RESET,this._command=Ue.HW_RESET,this._status=wt.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const as=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let An=1,dt;const Xa=t=>{ir(An,t)},Ga=t=>{console.log("ConfigChange: ",t)},Za=t=>{dt&&dt.buffer(t)},_a=()=>{dt&&dt.reset()},Ja=(t=!0,e=1)=>{if(!t)return;An=e;const r={sendData:E1,interrupt:Xa,configChange:Ga};dt=new Wa(r);const o=new Uint8Array(as.length+256);o.set(as.slice(1792,2048)),o.set(as,256),Ge(An,o),ar(An,Va)},Va=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)dt.data=e;else return dt.data;break;case r.STATUS:if(e>=0)dt.status=e;else return dt.status;break;case r.COMMAND:if(e>=0)dt.command=e;else return dt.command;break;case r.CONTROL:if(e>=0)dt.control=e;else return dt.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},gr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const ja=()=>{const t=new Date,e=gr(t.getMonth()+1,2)+","+gr(t.getDay(),2)+","+gr(t.getDate(),2)+","+gr(t.getHours(),2)+","+gr(t.getMinutes(),2);for(let r=0;r<e.length;r++)m(512+r,e.charCodeAt(r)|128)},Ha=`
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
`,tA=()=>{Qt=0,bt=0,$t=0,te=0,Ke=1023,qe=1023,un(0),ct=0,ge=0,Je=0,pr=0,Sr=0,Ct=0,Ot=0,Ve=0,an=0};let Qt=0,bt=0,$t=0,te=0,Ke=1023,qe=1023,an=0,fe=0,ct=0,ge=0,Je=0,pr=0,Sr=0,Ct=0,Ot=0,Ve=0,eA=0,xt=5;const cn=54,ln=55,va=56,za=57,rA=()=>{const t=new Uint8Array(256).fill(0),e=on(0,Ha.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},$a=(t=!0,e=5)=>{if(!t)return;xt=e;const r=49152+xt*256,o=49152+xt*256+8;Ge(xt,rA(),r,rc),Ge(xt,rA(),o,ja),ar(xt,oc),tA()},un=t=>{fe=t,PA(!t)},tc=()=>{if(fe&1){let t=!1;fe&8&&(Ve|=8,t=!0),fe&ge&4&&(Ve|=4,t=!0),fe&ge&2&&(Ve|=2,t=!0),t&&ir(xt,!0)}},ec=t=>{if(fe&1)if(t.buttons>=0){switch(t.buttons){case 0:ct&=-129;break;case 16:ct|=128;break;case 1:ct&=-17;break;case 17:ct|=16;break}ge|=ct&128?4:0}else t.x>=0&&t.x<=1&&(Qt=Math.round((Ke-$t)*t.x+$t),ge|=2),t.y>=0&&t.y<=1&&(bt=Math.round((qe-te)*t.y+te),ge|=2)};let Cr=0,cs="",nA=0,sA=0;const rc=()=>{const t=192+xt;B(ln)===t&&B(cn)===0?sc():B(za)===t&&B(va)===0&&nc()},nc=()=>{if(Cr===0){const t=192+xt;nA=B(ln),sA=B(cn),m(ln,t),m(cn,3);const e=(ct&128)!==(Je&128);let r=0;ct&128?r=e?2:1:r=e?3:4,B(49152)&128&&(r=-r),Je=ct,cs=Qt.toString()+","+bt.toString()+","+r.toString()}Cr>=cs.length?(c.Accum=141,Cr=0,m(ln,nA),m(cn,sA)):(c.Accum=cs.charCodeAt(Cr)|128,Cr++)},sc=()=>{switch(c.Accum){case 128:console.log("mouse off"),un(0);break;case 129:console.log("mouse on"),un(1);break}},oc=(t,e)=>{if(t>=49408)return-1;const r=e<0,o={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case o.LOWX:if(r===!1)Ct=Ct&65280|e,Ct&=65535;else return Qt&255;break;case o.HIGHX:if(r===!1)Ct=e<<8|Ct&255,Ct&=65535;else return Qt>>8&255;break;case o.LOWY:if(r===!1)Ot=Ot&65280|e,Ot&=65535;else return bt&255;break;case o.HIGHY:if(r===!1)Ot=e<<8|Ot&255,Ot&=65535;else return bt>>8&255;break;case o.STATUS:return ct;case o.MODE:if(r===!1)un(e),console.log("Mouse mode: 0x",fe.toString(16));else return fe;break;case o.CLAMP:if(r===!1)an=78-e;else switch(an){case 0:return $t>>8&255;case 1:return te>>8&255;case 2:return $t&255;case 3:return te&255;case 4:return Ke>>8&255;case 5:return qe>>8&255;case 6:return Ke&255;case 7:return qe&255;default:return console.log("AppleMouse: invalid clamp index: "+an),0}break;case o.CLOCK:case o.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case o.COMMAND:if(r===!1)switch(eA=e,e){case a.INIT:console.log("cmd.init"),Qt=0,bt=0,pr=0,Sr=0,$t=0,te=0,Ke=1023,qe=1023,ct=0,ge=0;break;case a.READ:ge=0,ct&=-112,ct|=Je>>1&64,ct|=Je>>4&1,Je=ct,(pr!==Qt||Sr!==bt)&&(ct|=32),pr=Qt,Sr=bt;break;case a.CLEAR:console.log("cmd.clear"),Qt=0,bt=0,pr=0,Sr=0;break;case a.SERVE:ct&=-15,ct|=Ve,Ve=0,ir(xt,!1);break;case a.HOME:console.log("cmd.home"),Qt=$t,bt=te;break;case a.CLAMPX:console.log("cmd.clampx"),$t=Ct>32767?Ct-65536:Ct,Ke=Ot,console.log($t+" -> "+Ke);break;case a.CLAMPY:console.log("cmd.clampy"),te=Ct>32767?Ct-65536:Ct,qe=Ot,console.log(te+" -> "+qe);break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:console.log("cmd.pos"),Qt=Ct,bt=Ot;break}else return eA;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},Ft={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},ee={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class Ac{constructor(e){T(this,"_control");T(this,"_status");T(this,"_lastRead");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=Ft.OVRN;this._status|=Ft.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(ee.TX_INT_ENABLE|ee.NRTS))===ee.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Ft.FE|Ft.OVRN|Ft.PE),this._receiveBuffer.length?(this._status|=Ft.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~Ft.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(ee.COUNTER_DIV1|ee.COUNTER_DIV2))===(ee.COUNTER_DIV1|ee.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Ft.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Ft.IRQ:this._status&=~Ft.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Ft.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const Wt={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},ls={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class us{constructor(){T(this,"_latch");T(this,"_count");T(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&Wt.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Wt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class ic{constructor(e){T(this,"_timer");T(this,"_status");T(this,"_statusRead");T(this,"_msb");T(this,"_lsb");T(this,"_div8");T(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new us,new us,new us],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Wt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const o=this._timer[0].control&Wt.SPECIAL,a=this._msb*256+r;this._timer[e].latch=a,o&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const o=this._timer[0].control&Wt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=o&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),o>>8&255}update(e){const r=this._timer[0].control&Wt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let o=!1;for(let a=0;a<3;a++){let h=e;if(a==2&&this._timer[2].control&Wt.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),o=this._timer[a].decrement(h),o){const p=this._timer[a].control;switch(p&Wt.IRQ_ENABLE&&this.irq(a,!0),p&Wt.COUNTER_MODE){case 0:case 16:this._timer[a].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Wt.SPECIAL}irq(e,r){const o=1<<e|ls.ANY_IRQ;r?this._status|=o:this._status&=~o,this._status?(this._status|=ls.ANY_IRQ,this._interrupt(!0)):(this._status&=~ls.ANY_IRQ,this._interrupt(!1))}}let hn=2,At,pe,hs=0;const ac=t=>{if(hs){const e=c.cycleCount-hs;At.update(e)}hs=c.cycleCount},oA=t=>{ir(hn,t)},cc=t=>{pe&&pe.buffer(t)},lc=(t=!0,e=2)=>{if(!t)return;hn=e,At=new ic(oA);const r={sendData:B1,interrupt:oA};pe=new Ac(r),ar(hn,hc),oo(ac,hn)},uc=()=>{At&&(At.reset(),pe.reset())},hc=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let o=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?pe.data=e:o=pe.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?pe.control=e:o=pe.status;break;case r.TCONTROL1:e>=0?At.timerControl(0,e):o=0;break;case r.TCONTROL2:e>=0?At.timerControl(1,e):o=At.status();break;case r.T1MSB:e>=0?At.timerMSBw(0,e):o=At.timerMSBr(0);break;case r.T1LSB:e>=0?At.timerLSBw(0,e):o=At.timerLSBr(0);break;case r.T2MSB:e>=0?At.timerMSBw(1,e):o=At.timerMSBr(1);break;case r.T2LSB:e>=0?At.timerLSBw(1,e):o=At.timerLSBr(1);break;case r.T3MSB:e>=0?At.timerMSBw(2,e):o=At.timerMSBr(2);break;case r.T3LSB:e>=0?At.timerLSBw(2,e):o=At.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return o},Ic=(t=!0,e=4)=>{t&&(ar(e,Mc),oo(dc,e))},Is=[0,128],fs=[1,129],fc=[2,130],gc=[3,131],je=[4,132],He=[5,133],In=[6,134],gs=[7,135],Er=[8,136],Br=[9,137],pc=[10,138],ps=[11,139],Sc=[12,140],Ne=[13,141],Dr=[14,142],AA=[16,145],iA=[17,145],Xt=[18,146],Ss=[32,160],re=64,Se=32,Cc=(t=4)=>{for(let e=0;e<=255;e++)F(t,e,0);for(let e=0;e<=1;e++)Cs(t,e)},Ec=(t,e)=>(X(t,Dr[e])&re)!==0,Bc=(t,e)=>(X(t,Xt[e])&re)!==0,aA=(t,e)=>(X(t,ps[e])&re)!==0,Dc=(t,e,r)=>{let o=X(t,je[e])-r;if(F(t,je[e],o),o<0){o=o%256+256,F(t,je[e],o);let a=X(t,He[e]);if(a--,F(t,He[e],a),a<0&&(a+=256,F(t,He[e],a),Ec(t,e)&&(!Bc(t,e)||aA(t,e)))){const h=X(t,Xt[e]);F(t,Xt[e],h|re);const p=X(t,Ne[e]);if(F(t,Ne[e],p|re),Ce(t,e,-1),aA(t,e)){const u=X(t,gs[e]),D=X(t,In[e]);F(t,je[e],D),F(t,He[e],u)}}}},mc=(t,e)=>(X(t,Dr[e])&Se)!==0,kc=(t,e)=>(X(t,Xt[e])&Se)!==0,wc=(t,e,r)=>{if(X(t,ps[e])&Se)return;let o=X(t,Er[e])-r;if(F(t,Er[e],o),o<0){o=o%256+256,F(t,Er[e],o);let a=X(t,Br[e]);if(a--,F(t,Br[e],a),a<0&&(a+=256,F(t,Br[e],a),mc(t,e)&&!kc(t,e))){const h=X(t,Xt[e]);F(t,Xt[e],h|Se);const p=X(t,Ne[e]);F(t,Ne[e],p|Se),Ce(t,e,-1)}}},cA=new Array(8).fill(0),dc=t=>{const e=c.cycleCount-cA[t];for(let r=0;r<=1;r++)Dc(t,r,e),wc(t,r,e);cA[t]=c.cycleCount},Tc=(t,e)=>{const r=[];for(let o=0;o<=15;o++)r[o]=X(t,Ss[e]+o);return r},Rc=(t,e)=>t.length===e.length&&t.every((r,o)=>r===e[o]),ve={slot:-1,chip:-1,params:[-1]};let Cs=(t,e)=>{const r=Tc(t,e);t===ve.slot&&e===ve.chip&&Rc(r,ve.params)||(ve.slot=t,ve.chip=e,ve.params=r,C1({slot:t,chip:e,params:r}))};const yc=(t,e)=>{switch(X(t,Is[e])&7){case 0:for(let o=0;o<=15;o++)F(t,Ss[e]+o,0);Cs(t,e);break;case 7:F(t,iA[e],X(t,fs[e]));break;case 6:{const o=X(t,iA[e]),a=X(t,fs[e]);o>=0&&o<=15&&(F(t,Ss[e]+o,a),Cs(t,e));break}}},Ce=(t,e,r)=>{let o=X(t,Ne[e]);switch(r>=0&&(o&=127-(r&127),F(t,Ne[e],o)),e){case 0:ir(t,o!==0);break;case 1:Ni(o!==0);break}},Pc=(t,e,r)=>{let o=X(t,Dr[e]);r>=0&&(r=r&255,r&128?o|=r:o&=255-r),o|=128,F(t,Dr[e],o)},Mc=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,o=t&255,a=o&128?1:0;switch(o){case Is[a]:e>=0&&(F(r,Is[a],e),yc(r,a));break;case fs[a]:case fc[a]:case gc[a]:case pc[a]:case ps[a]:case Sc[a]:F(r,o,e);break;case je[a]:e>=0&&F(r,In[a],e),Ce(r,a,re);break;case He[a]:if(e>=0){F(r,gs[a],e),F(r,je[a],X(r,In[a])),F(r,He[a],e);const h=X(r,Xt[a]);F(r,Xt[a],h&~re),Ce(r,a,re)}break;case In[a]:e>=0&&(F(r,o,e),Ce(r,a,re));break;case gs[a]:e>=0&&F(r,o,e);break;case Er[a]:e>=0&&F(r,AA[a],e),Ce(r,a,Se);break;case Br[a]:if(e>=0){F(r,Br[a],e),F(r,Er[a],X(r,AA[a]));const h=X(r,Xt[a]);F(r,Xt[a],h&~Se),Ce(r,a,Se)}break;case Ne[a]:e>=0&&Ce(r,a,e);break;case Dr[a]:Pc(r,a,e);break}return-1},fn=40,Lc=(t,e)=>t+2+(e>127?e-256:e),Qc=(t,e,r,o)=>{let a="",h=`${H(e.pcode)}`,p="",u="";switch(e.bytes){case 1:h+="      ";break;case 2:p=H(r),h+=` ${p}   `;break;case 3:p=H(r),u=H(o),h+=` ${p} ${u}`;break}const D=dn(e.name)?H(Lc(t,r),4):p;switch(e.mode){case A.IMPLIED:break;case A.IMM:a=` #$${p}`;break;case A.ZP_REL:a=` $${D}`;break;case A.ZP_X:a=` $${p},X`;break;case A.ZP_Y:a=` $${p},Y`;break;case A.ABS:a=` $${u}${p}`;break;case A.ABS_X:a=` $${u}${p},X`;break;case A.ABS_Y:a=` $${u}${p},Y`;break;case A.IND_X:a=` ($${u.trim()}${p},X)`;break;case A.IND_Y:a=` ($${p}),Y`;break;case A.IND:a=` ($${u.trim()}${p})`;break}return`${H(t,4)}: ${h}  ${e.name}${a}`},bc=t=>{let e=t;e>65535-fn&&(e=65535-fn);let r="";for(let o=0;o<fn;o++){if(e>65535){r+=`
`;continue}const a=Ze(e),h=V[a],p=Ze(e+1),u=Ze(e+2);r+=Qc(e,h,p,u)+`
`,e+=h.bytes}return r},Fc=(t,e)=>{if(e<t||t<0)return!1;let r=t;for(let o=0;o<fn;o++){if(r===e)return!0;const a=Ze(r);if(r+=V[a].bytes,r>65535)break}return!1},Uc=t=>{const e=Ze(t);return V[e].name};let ze=0;const gn=192,Kc=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${H(gn)}   ; jump address
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
`,qc=`
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
`,Nc=()=>{const t=new Uint8Array(256).fill(0),e=on(0,Kc.split(`
`));t.set(e,0);const r=on(0,qc.split(`
`));return t.set(r,gn),t[254]=23,t[255]=gn,t};let mr=new Uint8Array;const Es=(t=!0)=>{mr.length===0&&(mr=Nc()),mr[1]=t?32:0;const r=49152+gn+7*256;Ge(7,mr,r,Xc),Ge(7,mr,r+3,Wc)},Yc=(t,e)=>{if(t===0)m(e,2);else if(t<=2){m(e,240);const a=nn(t).length/512;m(e+1,a&255),m(e+2,a>>>8),m(e+3,0),lr(4),ur(0)}else cr(40),lr(0),ur(0),Q()},Oc=(t,e)=>{const a=nn(t).length/512,h=a>1600?2:1,p=h==2?32:64;m(e,240),m(e+1,a&255),m(e+2,a>>>8),m(e+3,0);const u="Apple2TS SP";m(e+4,u.length);let D=0;for(;D<u.length;D++)m(e+5+D,u.charCodeAt(D));for(;D<16;D++)m(e+5+D,u.charCodeAt(8));m(e+21,h),m(e+22,p),m(e+23,1),m(e+24,0),lr(25),ur(0)},xc=(t,e,r)=>{if(B(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),cr(4),Q();return}const o=B(t+4);switch(o){case 0:Yc(e,r);break;case 1:case 2:cr(33),Q();break;case 3:case 4:Oc(e,r);break;default:console.error(`SmartPort statusCode ${o} not implemented`);break}},Wc=()=>{cr(0),Q(!1);const t=256+c.StackPtr,e=B(t+1)+256*B(t+2),r=B(e+1),o=B(e+2)+256*B(e+3),a=B(o+1),h=B(o+2)+256*B(o+3);switch(r){case 0:{xc(o,a,h);return}case 1:{if(B(o)!==3){console.error(`Incorrect SmartPort parameter count at address ${o}`),Q();return}const D=512*(B(o+4)+256*B(o+5)+65536*B(o+6)),y=nn(a).slice(D,D+512);Hn(h,y);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),Q();return}const p=As(a);p.motorRunning=!0,ze||(ze=setTimeout(()=>{ze=0,p&&(p.motorRunning=!1),kt()},500)),kt()},Xc=()=>{cr(0),Q(!1);const t=B(66),e=Math.max(Math.min(B(67)>>6,2),0),r=As(e);if(!r.hardDrive)return;const o=nn(e),a=B(70)+256*B(71),h=512*a,p=B(68)+256*B(69),u=o.length;switch(r.status=` ${H(a,4)}`,t){case 0:{if(r.filename.length===0||u===0){lr(0),ur(0),Q();return}const D=u/512;lr(D&255),ur(D>>>8);break}case 1:{if(h+512>u){Q();return}const D=o.slice(h,h+512);Hn(p,D);break}case 2:{if(h+512>u){Q();return}if(r.isWriteProtected){Q();return}const D=jn(p);o.set(D,h),r.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),Q();return;default:console.error("unknown hard drive command"),Q();return}Q(!1),r.motorRunning=!0,ze||(ze=setTimeout(()=>{ze=0,r&&(r.motorRunning=!1),kt()},500)),kt()};let lA=0,pn=0,kr=0,Sn=0,wr=ZA,Ee=-1,uA=16.6881,Bs=17030,hA=0,nt=K.IDLE,Be="APPLE2EE",$e=0,Cn=!1,Et=0;const O=[];let dr=0;const Gc=()=>{E.VBL.isSet=!0,tc()},Zc=()=>{E.VBL.isSet=!1},IA=()=>{const t={};for(const e in E)t[e]=E[e].isSet;return t},_c=()=>{const t=JSON.parse(JSON.stringify(c));let e=ne;for(let o=ne;o<P.length;o++)P[o]!==255&&(o+=255-o%256,e=o+1);const r=Oe.Buffer.from(P.slice(0,e));return{s6502:t,extraRamSize:64*(qt+1),machineName:Be,softSwitches:IA(),memory:r.toString("base64")}},Jc=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));Co(r);const o=t.softSwitches;for(const h in o){const p=h;try{E[p].isSet=o[h]}catch{}}"WRITEBSR1"in o&&(E.BSR_PREWRITE.isSet=!1,E.BSR_WRITE.isSet=o.WRITEBSR1||o.WRITEBSR2||o.RDWRBSR1||o.RDWRBSR2);const a=new Uint8Array(Oe.Buffer.from(t.memory,"base64"));if(e<1){P.set(a.slice(0,65536)),P.set(a.slice(131072,163584),65536),P.set(a.slice(65536,131072),ne);const h=(a.length-163584)/1024;h>0&&(Zn(h+64),P.set(a.slice(163584),ne+65536))}else Zn(t.extraRamSize),P.set(a);Be=t.machineName||"APPLE2EE",ms(Be,!1),oe(),Kn(!0)},Vc=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!1,colorMode:0,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:K.IDLE,breakpoints:ft,stackDump:sa()}),Ds=t=>({emulator:Vc(),state6502:_c(),driveState:ba(t),thumbnail:"",snapshots:null}),jc=()=>{const t=Ds(!0);return t.snapshots=O,t},Hc=t=>{t.PC!==c.PC&&(Ee=t.PC),Co(t),Gt()},En=(t,e=!1)=>{var o,a;Dn();const r=(o=t.emulator)!=null&&o.version?t.emulator.version:.9;Jc(t.state6502,r),(a=t.emulator)!=null&&a.stackDump&&oa(t.emulator.stackDump),Fa(t.driveState),Ee=c.PC,e&&(O.length=0,Et=0),t.snapshots&&(O.length=0,O.push(...t.snapshots),Et=O.length),Gt()};let fA=!1;const gA=()=>{fA||(fA=!0,Ja(),lc(!0,2),Ic(!0,4),$a(!0,5),Ma(),Es())},vc=()=>{Ua(),Qn(),tA(),uc(),_a(),Cc(4)},Bn=()=>{if(Yr(0),$i(),uo(Be),gA(),$o.length>0){const e=on(768,$o.split(`
`));P.set(e,768)}Dn(),Kn(!0),As(1).filename===""&&(Es(!1),setTimeout(()=>{Es()},200))},Dn=()=>{Yi(),Pi(),B(49282),Eo(),vc()},zc=t=>{kr=t,uA=[16.6881,16.6881,1][kr],Bs=[17030,17030*4,17030*4][kr],mA()},$c=t=>{wr=t,Gt()},t1=(t,e)=>{P[t]=e,wr&&Gt()},e1=t=>{Ee=t,Gt(),t===K.PAUSED&&(Ee=c.PC)},ms=(t,e=!0)=>{Be!==t&&(Be=t,uo(Be),e&&Dn(),Gt())},r1=t=>{Zn(t),Gt()},pA=()=>{const t=Et-1;return t<0||!O[t]?-1:t},SA=()=>{const t=Et+1;return t>=O.length||!O[t]?-1:t},CA=()=>{O.length===_A&&O.shift(),O.push(Ds(!1)),Et=O.length,D1(O[O.length-1].state6502.s6502.PC)},n1=()=>{let t=pA();t<0||(Ut(K.PAUSED),setTimeout(()=>{Et===O.length&&(CA(),t=Math.max(Et-2,0)),Et=t,En(O[Et])},50))},s1=()=>{const t=SA();t<0||(Ut(K.PAUSED),setTimeout(()=>{Et=t,En(O[t])},50))},o1=t=>{t<0||t>=O.length||(Ut(K.PAUSED),setTimeout(()=>{Et=t,En(O[t])},50))},A1=()=>{const t=[];for(let e=0;e<O.length;e++)t[e]={s6502:O[e].state6502.s6502,thumbnail:O[e].thumbnail};return t},i1=t=>{O.length>0&&(O[O.length-1].thumbnail=t)};let mn=null;const EA=(t=!1)=>{mn&&clearTimeout(mn),t?mn=setTimeout(()=>{Cn=!0,mn=null},100):Cn=!0},BA=()=>{Ur(),nt===K.IDLE&&(Bn(),nt=K.PAUSED),xn(),Ut(K.PAUSED)},a1=()=>{Ur(),nt===K.IDLE&&(Bn(),nt=K.PAUSED),B(c.PC,!1)===32?(xn(),DA()):BA()},DA=()=>{Ur(),nt===K.IDLE&&(Bn(),nt=K.PAUSED),Ki(),Ut(K.RUNNING)},mA=()=>{$e=0,pn=performance.now(),lA=pn},Ut=t=>{if(gA(),nt=t,nt===K.PAUSED)dr&&(clearInterval(dr),dr=0),Vo(),Fc(Ee,c.PC)||(Ee=c.PC);else if(nt===K.RUNNING){for(Vo(!0),Ur();O.length>0&&Et<O.length-1;)O.pop();Et=O.length,dr||(dr=setInterval(Kn,1e3))}Gt(),mA(),Sn===0&&(Sn=1,dA())},kA=t=>{nt===K.IDLE?(Ut(K.NEED_BOOT),setTimeout(()=>{Ut(K.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},c1=(t,e,r)=>{kA(()=>{Hn(t,e),r&&Nt(t)})},l1=t=>{kA(()=>{Ti(t)})},u1=()=>wr&&nt===K.PAUSED?na():new Uint8Array,h1=()=>nt===K.RUNNING?"":bc(Ee>=0?Ee:c.PC),I1=()=>wr&&nt!==K.IDLE?Aa():"",Gt=()=>{const t={addressGetTable:at,altChar:E.ALTCHARSET.isSet,arrowKeysAsJoystick:!1,breakpoints:ft,button0:E.PB0.isSet,button1:E.PB1.isSet,canGoBackward:pA()>=0,canGoForward:SA()>=0,capsLock:!0,c800Slot:Xn(),colorMode:ys.COLOR,cout:B(57)<<8|B(56),cpuSpeed:Sn,darkMode:!1,disassembly:h1(),extraRamSize:64*(qt+1),helpText:"",hires:ra(),iTempState:Et,isDebugging:wr,lores:Vn(!0),machineName:Be,memoryDump:u1(),nextInstruction:Uc(c.PC),noDelayMode:!E.COLUMN80.isSet&&!E.AN3.isSet,ramWorksBank:Me(),runMode:nt,s6502:c,softSwitches:IA(),speedMode:kr,stackString:I1(),textPage:Vn(),timeTravelThumbnails:A1(),useOpenAppleKey:!1};g1(t)},f1=t=>{if(t)for(let e=0;e<t.length;e++)Mi(t[e]);else Li();Gt()},wA=()=>{const t=performance.now();if(hA=t-pn,hA<uA||(pn=t,nt===K.IDLE||nt===K.PAUSED))return;nt===K.NEED_BOOT?(Bn(),Ut(K.RUNNING)):nt===K.NEED_RESET&&(Dn(),Ut(K.RUNNING));let e=0;for(;;){const o=xn();if(o<0)break;if(e+=o,e%17030>=12480&&(E.VBL.isSet||Gc()),e>=Bs){Zc();break}}$e++;const r=$e*Bs/(performance.now()-lA);Sn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,$e%2&&(ri(),Gt()),Cn&&(Cn=!1,CA())},dA=()=>{wA();const t=$e+[1,5,10][kr];for(;nt===K.RUNNING&&$e!==t;)wA();setTimeout(dA,nt===K.RUNNING?0:20)},Tt=(t,e)=>{self.postMessage({msg:t,payload:e})},g1=t=>{Tt(St.MACHINE_STATE,t)},p1=t=>{Tt(St.CLICK,t)},S1=t=>{Tt(St.DRIVE_PROPS,t)},tr=t=>{Tt(St.DRIVE_SOUND,t)},TA=t=>{Tt(St.SAVE_STATE,t)},kn=t=>{Tt(St.RUMBLE,t)},RA=t=>{Tt(St.HELP_TEXT,t)},yA=t=>{Tt(St.ENHANCED_MIDI,t)},PA=t=>{Tt(St.SHOW_MOUSE,t)},C1=t=>{Tt(St.MBOARD_SOUND,t)},E1=t=>{Tt(St.COMM_DATA,t)},B1=t=>{Tt(St.MIDI_DATA,t)},D1=t=>{Tt(St.REQUEST_THUMBNAIL,t)};typeof self<"u"&&(self.onmessage=t=>{if("msg"in t.data)switch(t.data.msg){case q.RUN_MODE:Ut(t.data.payload);break;case q.STATE6502:Hc(t.data.payload);break;case q.DEBUG:$c(t.data.payload);break;case q.DISASSEMBLE_ADDR:e1(t.data.payload);break;case q.BREAKPOINTS:qi(t.data.payload);break;case q.STEP_INTO:BA();break;case q.STEP_OVER:a1();break;case q.STEP_OUT:DA();break;case q.SPEED:zc(t.data.payload);break;case q.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?s1():n1();break;case q.TIME_TRAVEL_INDEX:o1(t.data.payload);break;case q.TIME_TRAVEL_SNAPSHOT:EA();break;case q.THUMBNAIL_IMAGE:i1(t.data.payload);break;case q.RESTORE_STATE:En(t.data.payload,!0);break;case q.KEYPRESS:di(t.data.payload);break;case q.MOUSEEVENT:ec(t.data.payload);break;case q.PASTE_TEXT:l1(t.data.payload);break;case q.APPLE_PRESS:xs(!0,t.data.payload);break;case q.APPLE_RELEASE:xs(!1,t.data.payload);break;case q.GET_SAVE_STATE:TA(Ds(!0));break;case q.GET_SAVE_STATE_SNAPSHOTS:TA(jc());break;case q.DRIVE_PROPS:{const e=t.data.payload;qa(e);break}case q.DRIVE_NEW_DATA:{const e=t.data.payload;Ka(e);break}case q.GAMEPAD:ti(t.data.payload);break;case q.SET_BINARY_BLOCK:{const e=t.data.payload;c1(e.address,e.data,e.run);break}case q.SET_MEMORY:{const e=t.data.payload;t1(e.address,e.value);break}case q.COMM_DATA:Za(t.data.payload);break;case q.MIDI_DATA:cc(t.data.payload);break;case q.RAMWORKS:r1(t.data.payload);break;case q.MACHINE_NAME:ms(t.data.payload);break;case q.SOFTSWITCHES:f1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
