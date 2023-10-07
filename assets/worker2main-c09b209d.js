(function(){"use strict";var xt={},We={};We.byteLength=M1,We.toByteArray=N1,We.fromByteArray=K1;for(var ft=[],nt=[],b1=typeof Uint8Array<"u"?Uint8Array:Array,Lr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",ne=0,F1=Lr.length;ne<F1;++ne)ft[ne]=Lr[ne],nt[Lr.charCodeAt(ne)]=ne;nt["-".charCodeAt(0)]=62,nt["_".charCodeAt(0)]=63;function Fn(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=t.indexOf("=");n===-1&&(n=e);var s=n===e?0:4-n%4;return[n,s]}function M1(t){var e=Fn(t),n=e[0],s=e[1];return(n+s)*3/4-s}function U1(t,e,n){return(e+n)*3/4-n}function N1(t){var e,n=Fn(t),s=n[0],c=n[1],g=new b1(U1(t,s,c)),p=0,u=c>0?s-4:s,C;for(C=0;C<u;C+=4)e=nt[t.charCodeAt(C)]<<18|nt[t.charCodeAt(C+1)]<<12|nt[t.charCodeAt(C+2)]<<6|nt[t.charCodeAt(C+3)],g[p++]=e>>16&255,g[p++]=e>>8&255,g[p++]=e&255;return c===2&&(e=nt[t.charCodeAt(C)]<<2|nt[t.charCodeAt(C+1)]>>4,g[p++]=e&255),c===1&&(e=nt[t.charCodeAt(C)]<<10|nt[t.charCodeAt(C+1)]<<4|nt[t.charCodeAt(C+2)]>>2,g[p++]=e>>8&255,g[p++]=e&255),g}function Q1(t){return ft[t>>18&63]+ft[t>>12&63]+ft[t>>6&63]+ft[t&63]}function O1(t,e,n){for(var s,c=[],g=e;g<n;g+=3)s=(t[g]<<16&16711680)+(t[g+1]<<8&65280)+(t[g+2]&255),c.push(Q1(s));return c.join("")}function K1(t){for(var e,n=t.length,s=n%3,c=[],g=16383,p=0,u=n-s;p<u;p+=g)c.push(O1(t,p,p+g>u?u:p+g));return s===1?(e=t[n-1],c.push(ft[e>>2]+ft[e<<4&63]+"==")):s===2&&(e=(t[n-2]<<8)+t[n-1],c.push(ft[e>>10]+ft[e>>4&63]+ft[e<<2&63]+"=")),c.join("")}var br={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */br.read=function(t,e,n,s,c){var g,p,u=c*8-s-1,C=(1<<u)-1,Q=C>>1,b=-7,V=n?c-1:0,At=n?-1:1,et=t[e+V];for(V+=At,g=et&(1<<-b)-1,et>>=-b,b+=u;b>0;g=g*256+t[e+V],V+=At,b-=8);for(p=g&(1<<-b)-1,g>>=-b,b+=s;b>0;p=p*256+t[e+V],V+=At,b-=8);if(g===0)g=1-Q;else{if(g===C)return p?NaN:(et?-1:1)*(1/0);p=p+Math.pow(2,s),g=g-Q}return(et?-1:1)*p*Math.pow(2,g-s)},br.write=function(t,e,n,s,c,g){var p,u,C,Q=g*8-c-1,b=(1<<Q)-1,V=b>>1,At=c===23?Math.pow(2,-24)-Math.pow(2,-77):0,et=s?0:g-1,Ye=s?1:-1,xe=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=b):(p=Math.floor(Math.log(e)/Math.LN2),e*(C=Math.pow(2,-p))<1&&(p--,C*=2),p+V>=1?e+=At/C:e+=At*Math.pow(2,1-V),e*C>=2&&(p++,C/=2),p+V>=b?(u=0,p=b):p+V>=1?(u=(e*C-1)*Math.pow(2,c),p=p+V):(u=e*Math.pow(2,V-1)*Math.pow(2,c),p=0));c>=8;t[n+et]=u&255,et+=Ye,u/=256,c-=8);for(p=p<<c|u,Q+=c;Q>0;t[n+et]=p&255,et+=Ye,p/=256,Q-=8);t[n+et-Ye]|=xe*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=We,n=br,s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=BA,t.INSPECT_MAX_BYTES=50;const c=2147483647;t.kMaxLength=c,u.TYPED_ARRAY_SUPPORT=g(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function g(){try{const i=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(i,r),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(i){if(i>c)throw new RangeError('The value "'+i+'" is invalid for option "size"');const r=new Uint8Array(i);return Object.setPrototypeOf(r,u.prototype),r}function u(i,r,o){if(typeof i=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return V(i)}return C(i,r,o)}u.poolSize=8192;function C(i,r,o){if(typeof i=="string")return At(i,r);if(ArrayBuffer.isView(i))return Ye(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(Bt(i,ArrayBuffer)||i&&Bt(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Bt(i,SharedArrayBuffer)||i&&Bt(i.buffer,SharedArrayBuffer)))return xe(i,r,o);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const a=i.valueOf&&i.valueOf();if(a!=null&&a!==i)return u.from(a,r,o);const h=EA(i);if(h)return h;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,r,o){return C(i,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function Q(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function b(i,r,o){return Q(i),i<=0?p(i):r!==void 0?typeof o=="string"?p(i).fill(r,o):p(i).fill(r):p(i)}u.alloc=function(i,r,o){return b(i,r,o)};function V(i){return Q(i),p(i<0?0:Pn(i)|0)}u.allocUnsafe=function(i){return V(i)},u.allocUnsafeSlow=function(i){return V(i)};function At(i,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=E1(i,r)|0;let a=p(o);const h=a.write(i,r);return h!==o&&(a=a.slice(0,h)),a}function et(i){const r=i.length<0?0:Pn(i.length)|0,o=p(r);for(let a=0;a<r;a+=1)o[a]=i[a]&255;return o}function Ye(i){if(Bt(i,Uint8Array)){const r=new Uint8Array(i);return xe(r.buffer,r.byteOffset,r.byteLength)}return et(i)}function xe(i,r,o){if(r<0||i.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let a;return r===void 0&&o===void 0?a=new Uint8Array(i):o===void 0?a=new Uint8Array(i,r):a=new Uint8Array(i,r,o),Object.setPrototypeOf(a,u.prototype),a}function EA(i){if(u.isBuffer(i)){const r=Pn(i.length)|0,o=p(r);return o.length===0||i.copy(o,0,0,r),o}if(i.length!==void 0)return typeof i.length!="number"||bn(i.length)?p(0):et(i);if(i.type==="Buffer"&&Array.isArray(i.data))return et(i.data)}function Pn(i){if(i>=c)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+c.toString(16)+" bytes");return i|0}function BA(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(Bt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),Bt(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let a=r.length,h=o.length;for(let I=0,S=Math.min(a,h);I<S;++I)if(r[I]!==o[I]){a=r[I],h=o[I];break}return a<h?-1:h<a?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let a;if(o===void 0)for(o=0,a=0;a<r.length;++a)o+=r[a].length;const h=u.allocUnsafe(o);let I=0;for(a=0;a<r.length;++a){let S=r[a];if(Bt(S,Uint8Array))I+S.length>h.length?(u.isBuffer(S)||(S=u.from(S)),S.copy(h,I)):Uint8Array.prototype.set.call(h,S,I);else if(u.isBuffer(S))S.copy(h,I);else throw new TypeError('"list" argument must be an Array of Buffers');I+=S.length}return h};function E1(i,r){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||Bt(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const o=i.length,a=arguments.length>2&&arguments[2]===!0;if(!a&&o===0)return 0;let h=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Ln(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return L1(i).length;default:if(h)return a?-1:Ln(i).length;r=(""+r).toLowerCase(),h=!0}}u.byteLength=E1;function CA(i,r,o){let a=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(i||(i="utf8");;)switch(i){case"hex":return LA(this,r,o);case"utf8":case"utf-8":return m1(this,r,o);case"ascii":return PA(this,r,o);case"latin1":case"binary":return dA(this,r,o);case"base64":return yA(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return bA(this,r,o);default:if(a)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),a=!0}}u.prototype._isBuffer=!0;function re(i,r,o){const a=i[r];i[r]=i[o],i[o]=a}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)re(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)re(this,o,o+3),re(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)re(this,o,o+7),re(this,o+1,o+6),re(this,o+2,o+5),re(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?m1(this,0,r):CA.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=t.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(r,o,a,h,I){if(Bt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),a===void 0&&(a=r?r.length:0),h===void 0&&(h=0),I===void 0&&(I=this.length),o<0||a>r.length||h<0||I>this.length)throw new RangeError("out of range index");if(h>=I&&o>=a)return 0;if(h>=I)return-1;if(o>=a)return 1;if(o>>>=0,a>>>=0,h>>>=0,I>>>=0,this===r)return 0;let S=I-h,k=a-o;const x=Math.min(S,k),O=this.slice(h,I),X=r.slice(o,a);for(let U=0;U<x;++U)if(O[U]!==X[U]){S=O[U],k=X[U];break}return S<k?-1:k<S?1:0};function B1(i,r,o,a,h){if(i.length===0)return-1;if(typeof o=="string"?(a=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,bn(o)&&(o=h?0:i.length-1),o<0&&(o=i.length+o),o>=i.length){if(h)return-1;o=i.length-1}else if(o<0)if(h)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,a)),u.isBuffer(r))return r.length===0?-1:C1(i,r,o,a,h);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?h?Uint8Array.prototype.indexOf.call(i,r,o):Uint8Array.prototype.lastIndexOf.call(i,r,o):C1(i,[r],o,a,h);throw new TypeError("val must be string, number or Buffer")}function C1(i,r,o,a,h){let I=1,S=i.length,k=r.length;if(a!==void 0&&(a=String(a).toLowerCase(),a==="ucs2"||a==="ucs-2"||a==="utf16le"||a==="utf-16le")){if(i.length<2||r.length<2)return-1;I=2,S/=2,k/=2,o/=2}function x(X,U){return I===1?X[U]:X.readUInt16BE(U*I)}let O;if(h){let X=-1;for(O=o;O<S;O++)if(x(i,O)===x(r,X===-1?0:O-X)){if(X===-1&&(X=O),O-X+1===k)return X*I}else X!==-1&&(O-=O-X),X=-1}else for(o+k>S&&(o=S-k),O=o;O>=0;O--){let X=!0;for(let U=0;U<k;U++)if(x(i,O+U)!==x(r,U)){X=!1;break}if(X)return O}return-1}u.prototype.includes=function(r,o,a){return this.indexOf(r,o,a)!==-1},u.prototype.indexOf=function(r,o,a){return B1(this,r,o,a,!0)},u.prototype.lastIndexOf=function(r,o,a){return B1(this,r,o,a,!1)};function mA(i,r,o,a){o=Number(o)||0;const h=i.length-o;a?(a=Number(a),a>h&&(a=h)):a=h;const I=r.length;a>I/2&&(a=I/2);let S;for(S=0;S<a;++S){const k=parseInt(r.substr(S*2,2),16);if(bn(k))return S;i[o+S]=k}return S}function DA(i,r,o,a){return dr(Ln(r,i.length-o),i,o,a)}function wA(i,r,o,a){return dr(NA(r),i,o,a)}function RA(i,r,o,a){return dr(L1(r),i,o,a)}function kA(i,r,o,a){return dr(QA(r,i.length-o),i,o,a)}u.prototype.write=function(r,o,a,h){if(o===void 0)h="utf8",a=this.length,o=0;else if(a===void 0&&typeof o=="string")h=o,a=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(a)?(a=a>>>0,h===void 0&&(h="utf8")):(h=a,a=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const I=this.length-o;if((a===void 0||a>I)&&(a=I),r.length>0&&(a<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");h||(h="utf8");let S=!1;for(;;)switch(h){case"hex":return mA(this,r,o,a);case"utf8":case"utf-8":return DA(this,r,o,a);case"ascii":case"latin1":case"binary":return wA(this,r,o,a);case"base64":return RA(this,r,o,a);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return kA(this,r,o,a);default:if(S)throw new TypeError("Unknown encoding: "+h);h=(""+h).toLowerCase(),S=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function yA(i,r,o){return r===0&&o===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(r,o))}function m1(i,r,o){o=Math.min(i.length,o);const a=[];let h=r;for(;h<o;){const I=i[h];let S=null,k=I>239?4:I>223?3:I>191?2:1;if(h+k<=o){let x,O,X,U;switch(k){case 1:I<128&&(S=I);break;case 2:x=i[h+1],(x&192)===128&&(U=(I&31)<<6|x&63,U>127&&(S=U));break;case 3:x=i[h+1],O=i[h+2],(x&192)===128&&(O&192)===128&&(U=(I&15)<<12|(x&63)<<6|O&63,U>2047&&(U<55296||U>57343)&&(S=U));break;case 4:x=i[h+1],O=i[h+2],X=i[h+3],(x&192)===128&&(O&192)===128&&(X&192)===128&&(U=(I&15)<<18|(x&63)<<12|(O&63)<<6|X&63,U>65535&&U<1114112&&(S=U))}}S===null?(S=65533,k=1):S>65535&&(S-=65536,a.push(S>>>10&1023|55296),S=56320|S&1023),a.push(S),h+=k}return TA(a)}const D1=4096;function TA(i){const r=i.length;if(r<=D1)return String.fromCharCode.apply(String,i);let o="",a=0;for(;a<r;)o+=String.fromCharCode.apply(String,i.slice(a,a+=D1));return o}function PA(i,r,o){let a="";o=Math.min(i.length,o);for(let h=r;h<o;++h)a+=String.fromCharCode(i[h]&127);return a}function dA(i,r,o){let a="";o=Math.min(i.length,o);for(let h=r;h<o;++h)a+=String.fromCharCode(i[h]);return a}function LA(i,r,o){const a=i.length;(!r||r<0)&&(r=0),(!o||o<0||o>a)&&(o=a);let h="";for(let I=r;I<o;++I)h+=OA[i[I]];return h}function bA(i,r,o){const a=i.slice(r,o);let h="";for(let I=0;I<a.length-1;I+=2)h+=String.fromCharCode(a[I]+a[I+1]*256);return h}u.prototype.slice=function(r,o){const a=this.length;r=~~r,o=o===void 0?a:~~o,r<0?(r+=a,r<0&&(r=0)):r>a&&(r=a),o<0?(o+=a,o<0&&(o=0)):o>a&&(o=a),o<r&&(o=r);const h=this.subarray(r,o);return Object.setPrototypeOf(h,u.prototype),h};function H(i,r,o){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,a){r=r>>>0,o=o>>>0,a||H(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return h},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,a){r=r>>>0,o=o>>>0,a||H(r,o,this.length);let h=this[r+--o],I=1;for(;o>0&&(I*=256);)h+=this[r+--o]*I;return h},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||H(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||H(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||H(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||H(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||H(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=Yt(function(r){r=r>>>0,me(r,"offset");const o=this[r],a=this[r+7];(o===void 0||a===void 0)&&Xe(r,this.length-8);const h=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,I=this[++r]+this[++r]*2**8+this[++r]*2**16+a*2**24;return BigInt(h)+(BigInt(I)<<BigInt(32))}),u.prototype.readBigUInt64BE=Yt(function(r){r=r>>>0,me(r,"offset");const o=this[r],a=this[r+7];(o===void 0||a===void 0)&&Xe(r,this.length-8);const h=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],I=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+a;return(BigInt(h)<<BigInt(32))+BigInt(I)}),u.prototype.readIntLE=function(r,o,a){r=r>>>0,o=o>>>0,a||H(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return I*=128,h>=I&&(h-=Math.pow(2,8*o)),h},u.prototype.readIntBE=function(r,o,a){r=r>>>0,o=o>>>0,a||H(r,o,this.length);let h=o,I=1,S=this[r+--h];for(;h>0&&(I*=256);)S+=this[r+--h]*I;return I*=128,S>=I&&(S-=Math.pow(2,8*o)),S},u.prototype.readInt8=function(r,o){return r=r>>>0,o||H(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||H(r,2,this.length);const a=this[r]|this[r+1]<<8;return a&32768?a|4294901760:a},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||H(r,2,this.length);const a=this[r+1]|this[r]<<8;return a&32768?a|4294901760:a},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||H(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||H(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=Yt(function(r){r=r>>>0,me(r,"offset");const o=this[r],a=this[r+7];(o===void 0||a===void 0)&&Xe(r,this.length-8);const h=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(a<<24);return(BigInt(h)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=Yt(function(r){r=r>>>0,me(r,"offset");const o=this[r],a=this[r+7];(o===void 0||a===void 0)&&Xe(r,this.length-8);const h=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(h)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+a)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||H(r,4,this.length),n.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||H(r,4,this.length),n.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||H(r,8,this.length),n.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||H(r,8,this.length),n.read(this,r,!1,52,8)};function rt(i,r,o,a,h,I){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>h||r<I)throw new RangeError('"value" argument is out of bounds');if(o+a>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,a,h){if(r=+r,o=o>>>0,a=a>>>0,!h){const k=Math.pow(2,8*a)-1;rt(this,r,o,a,k,0)}let I=1,S=0;for(this[o]=r&255;++S<a&&(I*=256);)this[o+S]=r/I&255;return o+a},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,a,h){if(r=+r,o=o>>>0,a=a>>>0,!h){const k=Math.pow(2,8*a)-1;rt(this,r,o,a,k,0)}let I=a-1,S=1;for(this[o+I]=r&255;--I>=0&&(S*=256);)this[o+I]=r/S&255;return o+a},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function w1(i,r,o,a,h){d1(r,a,h,i,o,7);let I=Number(r&BigInt(4294967295));i[o++]=I,I=I>>8,i[o++]=I,I=I>>8,i[o++]=I,I=I>>8,i[o++]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,S=S>>8,i[o++]=S,o}function R1(i,r,o,a,h){d1(r,a,h,i,o,7);let I=Number(r&BigInt(4294967295));i[o+7]=I,I=I>>8,i[o+6]=I,I=I>>8,i[o+5]=I,I=I>>8,i[o+4]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return i[o+3]=S,S=S>>8,i[o+2]=S,S=S>>8,i[o+1]=S,S=S>>8,i[o]=S,o+8}u.prototype.writeBigUInt64LE=Yt(function(r,o=0){return w1(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Yt(function(r,o=0){return R1(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,a,h){if(r=+r,o=o>>>0,!h){const x=Math.pow(2,8*a-1);rt(this,r,o,a,x-1,-x)}let I=0,S=1,k=0;for(this[o]=r&255;++I<a&&(S*=256);)r<0&&k===0&&this[o+I-1]!==0&&(k=1),this[o+I]=(r/S>>0)-k&255;return o+a},u.prototype.writeIntBE=function(r,o,a,h){if(r=+r,o=o>>>0,!h){const x=Math.pow(2,8*a-1);rt(this,r,o,a,x-1,-x)}let I=a-1,S=1,k=0;for(this[o+I]=r&255;--I>=0&&(S*=256);)r<0&&k===0&&this[o+I+1]!==0&&(k=1),this[o+I]=(r/S>>0)-k&255;return o+a},u.prototype.writeInt8=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,a){return r=+r,o=o>>>0,a||rt(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=Yt(function(r,o=0){return w1(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Yt(function(r,o=0){return R1(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function k1(i,r,o,a,h,I){if(o+a>i.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function y1(i,r,o,a,h){return r=+r,o=o>>>0,h||k1(i,r,o,4),n.write(i,r,o,a,23,4),o+4}u.prototype.writeFloatLE=function(r,o,a){return y1(this,r,o,!0,a)},u.prototype.writeFloatBE=function(r,o,a){return y1(this,r,o,!1,a)};function T1(i,r,o,a,h){return r=+r,o=o>>>0,h||k1(i,r,o,8),n.write(i,r,o,a,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,a){return T1(this,r,o,!0,a)},u.prototype.writeDoubleBE=function(r,o,a){return T1(this,r,o,!1,a)},u.prototype.copy=function(r,o,a,h){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(a||(a=0),!h&&h!==0&&(h=this.length),o>=r.length&&(o=r.length),o||(o=0),h>0&&h<a&&(h=a),h===a||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(a<0||a>=this.length)throw new RangeError("Index out of range");if(h<0)throw new RangeError("sourceEnd out of bounds");h>this.length&&(h=this.length),r.length-o<h-a&&(h=r.length-o+a);const I=h-a;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,a,h):Uint8Array.prototype.set.call(r,this.subarray(a,h),o),I},u.prototype.fill=function(r,o,a,h){if(typeof r=="string"){if(typeof o=="string"?(h=o,o=0,a=this.length):typeof a=="string"&&(h=a,a=this.length),h!==void 0&&typeof h!="string")throw new TypeError("encoding must be a string");if(typeof h=="string"&&!u.isEncoding(h))throw new TypeError("Unknown encoding: "+h);if(r.length===1){const S=r.charCodeAt(0);(h==="utf8"&&S<128||h==="latin1")&&(r=S)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<a)throw new RangeError("Out of range index");if(a<=o)return this;o=o>>>0,a=a===void 0?this.length:a>>>0,r||(r=0);let I;if(typeof r=="number")for(I=o;I<a;++I)this[I]=r;else{const S=u.isBuffer(r)?r:u.from(r,h),k=S.length;if(k===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(I=0;I<a-o;++I)this[I+o]=S[I%k]}return this};const Ce={};function dn(i,r,o){Ce[i]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(h){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:h,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}dn("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),dn("ERR_INVALID_ARG_TYPE",function(i,r){return`The "${i}" argument must be of type number. Received type ${typeof r}`},TypeError),dn("ERR_OUT_OF_RANGE",function(i,r,o){let a=`The value of "${i}" is out of range.`,h=o;return Number.isInteger(o)&&Math.abs(o)>2**32?h=P1(String(o)):typeof o=="bigint"&&(h=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(h=P1(h)),h+="n"),a+=` It must be ${r}. Received ${h}`,a},RangeError);function P1(i){let r="",o=i.length;const a=i[0]==="-"?1:0;for(;o>=a+4;o-=3)r=`_${i.slice(o-3,o)}${r}`;return`${i.slice(0,o)}${r}`}function FA(i,r,o){me(r,"offset"),(i[r]===void 0||i[r+o]===void 0)&&Xe(r,i.length-(o+1))}function d1(i,r,o,a,h,I){if(i>o||i<r){const S=typeof r=="bigint"?"n":"";let k;throw I>3?r===0||r===BigInt(0)?k=`>= 0${S} and < 2${S} ** ${(I+1)*8}${S}`:k=`>= -(2${S} ** ${(I+1)*8-1}${S}) and < 2 ** ${(I+1)*8-1}${S}`:k=`>= ${r}${S} and <= ${o}${S}`,new Ce.ERR_OUT_OF_RANGE("value",k,i)}FA(a,h,I)}function me(i,r){if(typeof i!="number")throw new Ce.ERR_INVALID_ARG_TYPE(r,"number",i)}function Xe(i,r,o){throw Math.floor(i)!==i?(me(i,o),new Ce.ERR_OUT_OF_RANGE(o||"offset","an integer",i)):r<0?new Ce.ERR_BUFFER_OUT_OF_BOUNDS:new Ce.ERR_OUT_OF_RANGE(o||"offset",`>= ${o?1:0} and <= ${r}`,i)}const MA=/[^+/0-9A-Za-z-_]/g;function UA(i){if(i=i.split("=")[0],i=i.trim().replace(MA,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function Ln(i,r){r=r||1/0;let o;const a=i.length;let h=null;const I=[];for(let S=0;S<a;++S){if(o=i.charCodeAt(S),o>55295&&o<57344){if(!h){if(o>56319){(r-=3)>-1&&I.push(239,191,189);continue}else if(S+1===a){(r-=3)>-1&&I.push(239,191,189);continue}h=o;continue}if(o<56320){(r-=3)>-1&&I.push(239,191,189),h=o;continue}o=(h-55296<<10|o-56320)+65536}else h&&(r-=3)>-1&&I.push(239,191,189);if(h=null,o<128){if((r-=1)<0)break;I.push(o)}else if(o<2048){if((r-=2)<0)break;I.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;I.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;I.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return I}function NA(i){const r=[];for(let o=0;o<i.length;++o)r.push(i.charCodeAt(o)&255);return r}function QA(i,r){let o,a,h;const I=[];for(let S=0;S<i.length&&!((r-=2)<0);++S)o=i.charCodeAt(S),a=o>>8,h=o%256,I.push(h),I.push(a);return I}function L1(i){return e.toByteArray(UA(i))}function dr(i,r,o,a){let h;for(h=0;h<a&&!(h+o>=r.length||h>=i.length);++h)r[h+o]=i[h];return h}function Bt(i,r){return i instanceof r||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===r.name}function bn(i){return i!==i}const OA=function(){const i="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const a=o*16;for(let h=0;h<16;++h)r[a+h]=i[o]+i[h]}return r}();function Yt(i){return typeof BigInt>"u"?KA:i}function KA(){throw new Error("BigInt not supported")}})(xt);var F=(t=>(t[t.IDLE=0]="IDLE",t[t.NEED_BOOT=1]="NEED_BOOT",t[t.NEED_RESET=2]="NEED_RESET",t[t.RUNNING=3]="RUNNING",t[t.PAUSED=4]="PAUSED",t))(F||{}),at=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t))(at||{}),W=(t=>(t[t.STATE=0]="STATE",t[t.DEBUG=1]="DEBUG",t[t.BREAKPOINT=2]="BREAKPOINT",t[t.STEP_INTO=3]="STEP_INTO",t[t.STEP_OVER=4]="STEP_OVER",t[t.STEP_OUT=5]="STEP_OUT",t[t.SPEED=6]="SPEED",t[t.TIME_TRAVEL=7]="TIME_TRAVEL",t[t.RESTORE_STATE=8]="RESTORE_STATE",t[t.KEYPRESS=9]="KEYPRESS",t[t.MOUSEEVENT=10]="MOUSEEVENT",t[t.PASTE_TEXT=11]="PASTE_TEXT",t[t.APPLE_PRESS=12]="APPLE_PRESS",t[t.APPLE_RELEASE=13]="APPLE_RELEASE",t[t.GET_SAVE_STATE=14]="GET_SAVE_STATE",t[t.DRIVE_PROPS=15]="DRIVE_PROPS",t[t.GAMEPAD=16]="GAMEPAD",t[t.SET_BINARY_BLOCK=17]="SET_BINARY_BLOCK",t[t.COMM_DATA=18]="COMM_DATA",t))(W||{}),Xt=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Xt||{}),l=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(l||{});const Fr=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",q1=(t,e)=>e*256+t,G=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),Y1=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),x1=t=>`A=${G(t.Accum)} X=${G(t.XReg)} Y=${G(t.YReg)} P=${G(t.PStatus)} ${Y1(t.PStatus)} S=${G(t.StackPtr)}`,X1=t=>{let e="",n="";switch(t){case 1:e="#";break;case 3:case 6:n=",X";break;case 4:case 7:n=",Y";break;case 10:e="(",n=")";break;case 8:e="(",n=",X)";break;case 9:e="(",n="),Y";break}return[e,n]},W1=(t,e,n,s)=>{let c=`${G(s,4)}`;if(t){const g=X1(t.mode);let p=g[0];const u=g[1];if(t.PC>=2&&(p=`   ${t.name}   ${p}$`),Fr(t.name)){const C=s+2+(e>127?e-256:e);c+=`${p}${G(C,4)}${u}`}else switch(t.PC){case 1:c+=`   ${t.name}`;break;case 2:c+=`${p}${G(e)}${u}`;break;case 3:c+=`${p}${G(q1(e,n),4)}${u}`;break}}else c+="         ???";return c},De=t=>t.split("").map(e=>e.charCodeAt(0)),G1=t=>[t&255,t>>>8&255],Mn=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Un=(t,e)=>{const n=t.lastIndexOf(".")+1;return t.substring(0,n)+e},Mr=new Uint32Array(256).fill(0),Z1=()=>{let t;for(let e=0;e<256;e++){t=e;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;Mr[e]=t}},J1=(t,e=0)=>{Mr[255]===0&&Z1();let n=-1;for(let s=e;s<t.length;s++)n=n>>>8^Mr[(n^t[s])&255];return(n^-1)>>>0};let ct;const Wt=Math.trunc(.0028*1020484);let Ur=Wt/2,Nr=Wt/2,Qr=Wt/2,Or=Wt/2,Nn=0,Qn=!1,On=!1,Kr=!1,qr=!1,Ge=!1,Kn=!1,qn=!1;const Yr=()=>{Kr=!0},Yn=()=>{qr=!0},_1=()=>{Ge=!0},Ze=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*Wt/2),xn=t=>{Ur=Ze(t)},Xn=t=>{Nr=Ze(t)},Wn=t=>{Qr=Ze(t)},Gn=t=>{Or=Ze(t)},xr=()=>{Kn=Qn||Kr,qn=On||qr,B.PB0.isSet=Kn,B.PB1.isSet=qn||Ge,B.PB2.isSet=Ge},Zn=(t,e)=>{e?Qn=t:On=t,xr()},V1=t=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),Nn=t},Jn=t=>{const e=t-Nn;Z(49252,e<Ur?128:0),Z(49253,e<Nr?128:0),Z(49254,e<Qr?128:0),Z(49255,e<Or?128:0)};let Gt,Xr,_n=!1;const j1=t=>{ct=t,_n=!ct.length||!ct[0].buttons.length,Gt=ui(),Xr=Gt.gamepad?Gt.gamepad:ai},Vn=t=>t>-.01&&t<.01,H1=t=>{let e=t[0],n=t[1];Vn(e)&&(e=0),Vn(n)&&(n=0);const s=Math.sqrt(e*e+n*n),c=.95*(s===0?1:Math.max(Math.abs(e),Math.abs(n))/s);return e=Math.min(Math.max(-c,e),c),n=Math.min(Math.max(-c,n),c),e=Math.trunc(Wt*(e+c)/(2*c)),n=Math.trunc(Wt*(n+c)/(2*c)),[e,n]},jn=t=>{const e=Gt.joystick?Gt.joystick(ct[t].axes,_n):ct[t].axes,n=H1(e);t===0?(Ur=n[0],Nr=n[1],Kr=!1,qr=!1):(Qr=n[0],Or=n[1],Ge=!1);let s=!1;ct[t].buttons.forEach((c,g)=>{c&&(Xr(g,ct.length>1,t===1),s=!0)}),s||Xr(-1,ct.length>1,t===1),Gt.rumble&&Gt.rumble(),xr()},$1=()=>{ct&&ct.length>0&&(jn(0),ct.length>1&&jn(1))},z1=t=>{switch(t){case 0:L("JL");break;case 1:L("G",200);break;case 2:Y("M"),L("O");break;case 3:L("L");break;case 4:L("F");break;case 5:Y("P"),L("T");break;case 6:break;case 7:break;case 8:L("Z");break;case 9:{const e=lo();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:break;case 11:break;case 12:L("L");break;case 13:L("M");break;case 14:L("A");break;case 15:L("D");break;case-1:return}};let Zt=0,Jt=0,_t=!1;const Je=.5,v1={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-Je?(Jt=0,Zt===0||Zt>2?(Zt=0,Y("A")):Zt===1&&_t?L("W"):Zt===2&&_t&&L("R"),Zt++,_t=!1,t):t[0]>Je?(Zt=0,Jt===0||Jt>2?(Jt=0,Y("D")):Jt===1&&_t?L("W"):Jt===2&&_t&&L("R"),Jt++,_t=!1,t):t[1]<-Je?(L("C"),t):t[1]>Je?(L("S"),t):(_t=!0,t),gamepad:z1,rumble:null,setup:null,helptext:`AZTEC
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
`},ti={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let Wr=14,Gr=14;const ei={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=E(182);Wr<40&&t<Wr&&Tn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Wr=t,t=E(183),Gr<40&&t<Gr&&Tn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Gr=t},setup:null,helptext:`KARATEKA
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
`},ri=t=>{switch(t){case 0:L("A");break;case 1:L("C",50);break;case 2:L("O");break;case 3:L("T");break;case 4:L("\x1B");break;case 5:L("\r");break;case 6:break;case 7:break;case 8:Y("N"),L("'");break;case 9:Y("Y"),L("1");break;case 10:break;case 11:break;case 12:break;case 13:L(" ");break;case 14:break;case 15:L("	");break;case-1:return}},Rt=.5,ni={address:768,data:[141,74,3,132],keymap:{},gamepad:ri,joystick:(t,e)=>{if(e)return t;const n=t[0]<-Rt?"\b":t[0]>Rt?"":"",s=t[1]<-Rt?"\v":t[1]>Rt?`
`:"";let c=n+s;return c||(c=t[2]<-Rt?"L\b":t[2]>Rt?"L":"",c||(c=t[3]<-Rt?"L\v":t[3]>Rt?`L
`:"")),c&&L(c,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
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
ESC  exit conversation`},Hn=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A    up
Z    down
N , ←     left
M . →     right
`,oi=t=>{switch(t){case 1:R(109,255);break;case 12:Y("A");break;case 13:Y("Z");break;case 14:Y("\b");break;case 15:Y("");break}},_e=.75,ii=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{R(25025,173),R(25036,64)},helptext:Hn},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-_e?"\b":t[0]>_e?"":t[1]<-_e?"A":t[1]>_e?"Z":"";return e&&Y(e),t},gamepad:oi,rumble:null,setup:null,helptext:Hn}],si={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Ai={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Yr();break;case 1:Yn();break;case 2:L(" ");break;case 3:L("U");break;case 4:L("\r");break;case 5:L("T");break;case 9:{const e=lo();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:Yr();break}},rumble:()=>{E(49178)<128&&E(49181)<128&&Tn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{R(5128,0),R(5130,4);let t=5210;R(t,234),R(t+1,234),R(t+2,234),t=5224,R(t,234),R(t+1,234),R(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},we=new Array,Vt=t=>{Array.isArray(t)?we.push(...t):we.push(t)};Vt(v1),Vt(ti),Vt(ei),Vt(ni),Vt(ii),Vt(si),Vt(Ai);const ai=(t,e,n)=>{if(n)switch(t){case 0:_1();break;case 1:break;case 12:Gn(-1);break;case 13:Gn(1);break;case 14:Wn(-1);break;case 15:Wn(1);break}else switch(t){case 0:Yr();break;case 1:e||Yn();break;case 12:Xn(-1);break;case 13:Xn(1);break;case 14:xn(-1);break;case 15:xn(1);break}},ci={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},$n=t=>{for(const e of we)if(Hr(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},ui=()=>{for(const t of we)if(Hr(t.address,t.data))return t;return ci},zn=(t=!1)=>{for(const e of we)if(Hr(e.address,e.data)){p1(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&p1(" ")},li=t=>{Z(49152,t|128,32)};let jt="",vn=1e9;const fi=()=>{const t=performance.now();if(jt!==""&&(Jr(49152)<128||t-vn>1500)){vn=t;const e=jt.charCodeAt(0);li(e),jt=jt.slice(1),jt.length===0&&u1()}};let to="";const Y=t=>{t===to&&jt.length>0||(to=t,jt+=t)};let eo=0;const L=(t,e=300)=>{const n=performance.now();n-eo<e||(eo=n,Y(t))},hi=t=>{t.length===1&&(t=$n(t)),Y(t)},gi=t=>{t.length===1&&(t=$n(t)),Y(t)},Ve=[],w=(t,e,n=!1,s=null)=>{const c={offAddr:t,onAddr:t+1,isSetAddr:e,writeOnly:n,isSet:!1,setFunc:s};return t>=49152&&(Ve[t-49152]=c,Ve[t+1-49152]=c),e>=49152&&(Ve[e-49152]=c),c},oe=()=>Math.floor(256*Math.random()),Ii=t=>{t&=11,B.READBSR2.isSet=t===0,B.WRITEBSR2.isSet=t===1,B.OFFBSR2.isSet=t===2,B.RDWRBSR2.isSet=t===3,B.READBSR1.isSet=t===8,B.WRITEBSR1.isSet=t===9,B.OFFBSR1.isSet=t===10,B.RDWRBSR1.isSet=t===11,B.BSRBANK2.isSet=t<=3,B.BSRREADRAM.isSet=[0,3,8,11].includes(t)},B={STORE80:w(49152,49176,!0),RAMRD:w(49154,49171,!0),RAMWRT:w(49156,49172,!0),INTCXROM:w(49158,49173,!0),INTC8ROM:w(0,0),ALTZP:w(49160,49174,!0),SLOTC3ROM:w(49162,49175,!0),COLUMN80:w(49164,49183,!0),ALTCHARSET:w(49166,49182,!0),KBRDSTROBE:w(0,49168,!1,()=>{const t=Jr(49152)&127;Z(49152,t,32)}),BSRBANK2:w(0,49169),BSRREADRAM:w(0,49170),CASSOUT:w(49184,0),SPEAKER:w(49200,0,!1,(t,e)=>{Z(49200,oe()),hA(e)}),GCSTROBE:w(49216,0),EMUBYTE:w(0,49231,!1,()=>{Z(49231,205)}),TEXT:w(49232,49178),MIXED:w(49234,49179),PAGE2:w(49236,49180),HIRES:w(49238,49181),AN0:w(49240,0),AN1:w(49242,0),AN2:w(49244,0),AN3:w(49246,0),CASSIN1:w(0,49248,!1,()=>{Z(49248,oe())}),PB0:w(0,49249),PB1:w(0,49250),PB2:w(0,49251),JOYSTICK12:w(49252,0,!1,(t,e)=>{Jn(e)}),JOYSTICK34:w(49254,0,!1,(t,e)=>{Jn(e)}),CASSIN2:w(0,49256,!1,()=>{Z(49256,oe())}),FASTCHIP_LOCK:w(49258,0),FASTCHIP_ENABLE:w(49259,0),FASTCHIP_SPEED:w(49261,0),JOYSTICKRESET:w(49264,0,!1,(t,e)=>{V1(e),Z(49264,oe())}),BANKSEL:w(49267,0),LASER128EX:w(49268,0),READBSR2:w(49280,0),WRITEBSR2:w(49281,0),OFFBSR2:w(49282,0),RDWRBSR2:w(49283,0),READBSR1:w(49288,0),WRITEBSR1:w(49289,0),OFFBSR1:w(49290,0),RDWRBSR1:w(49291,0)};B.TEXT.isSet=!0;const pi=[49152,49153,49165,49167,49200,49236,49237,49183],ro=(t,e,n)=>{if(t>1048575&&!pi.includes(t)){const c=Jr(t)>128?1:0;console.log(`${n} $${G(A.PC)}: $${G(t)} [${c}] ${e?"write":""}`)}if(t>=49280&&t<=49295){t-=t&4,Ii(t);return}if(t===49152&&!e){fi();return}const s=Ve[t-49152];if(!s){console.error("Unknown softswitch "+G(t)),Z(t,oe());return}if(s.setFunc){s.setFunc(t,n);return}t===s.offAddr||t===s.onAddr?((!s.writeOnly||e)&&(s.isSet=t===s.onAddr),s.isSetAddr&&Z(s.isSetAddr,s.isSet?141:13),t>=49184&&Z(t,oe())):t===s.isSetAddr&&Z(t,s.isSet?141:13)},Si=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,K=new Uint8Array(163584).fill(0),$=new Array(257).fill(0),ot=new Array(257).fill(0),Re=512,no=576,oo=583,ie=256,ke=256*Re,je=256*no,Ei=256*oo,io=256*ie;let Ht=0;const Bi=()=>{const t=B.RAMRD.isSet?ie:0,e=B.RAMWRT.isSet?ie:0,n=B.PAGE2.isSet?ie:0,s=B.STORE80.isSet?n:t,c=B.STORE80.isSet?n:e,g=B.STORE80.isSet&&B.HIRES.isSet?n:t,p=B.STORE80.isSet&&B.HIRES.isSet?n:e;for(let u=2;u<256;u++)$[u]=u+t,ot[u]=u+e;for(let u=4;u<=7;u++)$[u]=u+s,ot[u]=u+c;for(let u=32;u<=63;u++)$[u]=u+g,ot[u]=u+p},Ci=()=>{const t=B.ALTZP.isSet?ie:0;if($[0]=t,$[1]=1+t,ot[0]=t,ot[1]=1+t,B.BSRREADRAM.isSet){for(let e=208;e<=255;e++)$[e]=e+t;if(!B.BSRBANK2.isSet)for(let e=208;e<=223;e++)$[e]=e-16+t}else for(let e=208;e<=255;e++)$[e]=Re+e-192},mi=()=>{const t=B.ALTZP.isSet?ie:0,e=B.WRITEBSR1.isSet||B.WRITEBSR2.isSet||B.RDWRBSR1.isSet||B.RDWRBSR2.isSet;for(let n=192;n<=255;n++)ot[n]=-1;if(e){for(let n=208;n<=255;n++)ot[n]=n+t;if(!B.BSRBANK2.isSet)for(let n=208;n<=223;n++)ot[n]=n-16+t}},so=t=>B.INTCXROM.isSet?!1:t!==3?!0:B.SLOTC3ROM.isSet,Di=()=>!(B.INTCXROM.isSet||B.INTC8ROM.isSet||Ht<=0),Zr=t=>{if(t<8){if(B.INTCXROM.isSet)return;t===3&&!B.SLOTC3ROM.isSet&&(B.INTC8ROM.isSet||(B.INTC8ROM.isSet=!0,Ht=-1,$t())),Ht===0&&(Ht=t,$t())}else B.INTC8ROM.isSet=!1,Ht=0,$t()},wi=()=>{$[192]=Re-192;for(let t=1;t<=7;t++){const e=192+t;$[e]=t+(so(t)?no-1:Re)}if(Di()){const t=oo+8*(Ht-1);for(let e=0;e<=7;e++){const n=200+e;$[n]=t+e}}else for(let t=200;t<=207;t++)$[t]=Re+t-192},$t=()=>{Bi(),Ci(),mi(),wi();for(let t=0;t<256;t++)$[t]=256*$[t],ot[t]=256*ot[t]},Ao=new Map,ao=new Array(8),He=(t,e=-1)=>{const n=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Zr(n),!so(n)))return;const s=ao[n];if(s!==void 0){const c=s(t,e);if(c>=0){const g=t>=49408?je-256:ke;K[t-49152+g]=c}}},$e=(t,e)=>{ao[t]=e},se=(t,e,n=0,s=()=>{})=>{if(K.set(e.slice(0,256),je+(t-1)*256),e.length>256){const c=e.length>2304?2304:e.length,g=Ei+(t-1)*2048;K.set(e.slice(256,c),g)}n&&Ao.set(n,s)},Ri=()=>{K.fill(255,0,131071);const t=Si.replace(/\n/g,""),e=new Uint8Array(xt.Buffer.from(t,"base64"));K.set(e,ke),Ht=0,$t()},ki=t=>t===49177?yr?13:141:(t>=49296?He(t):ro(t,!1,A.cycleCount),t>=49232&&$t(),K[ke+t-49152]),M=(t,e)=>{const n=je+(t-1)*256+(e&255);return K[n]},T=(t,e,n)=>{if(n>=0){const s=je+(t-1)*256+(e&255);K[s]=n&255}},E=t=>{const e=t>>>8;if(e===192)return ki(t);e>=193&&e<=199?He(t):t===53247&&Zr(255);const n=$[e];return K[n+(t&255)]},yi=(t,e)=>{t>=49296?He(t,e):ro(t,!0,A.cycleCount),(t<=49167||t>=49232)&&$t()},R=(t,e)=>{const n=t>>>8;if(n===192)yi(t,e);else{n>=193&&n<=199?He(t,e):t===53247&&Zr(255);const s=ot[n];if(s<0)return;K[s+(t&255)]=e}},Jr=t=>K[ke+t-49152],Z=(t,e,n=1)=>{const s=ke+t-49152;K.fill(e,s,s+n)},co=1024,uo=2048,_r=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Vr=(t=!1)=>{let e=0,n=24,s=!1;if(t){if(B.TEXT.isSet||B.HIRES.isSet)return new Uint8Array;n=B.MIXED.isSet?20:24,s=B.COLUMN80.isSet&&!B.AN3.isSet}else{if(!B.TEXT.isSet&&!B.MIXED.isSet)return new Uint8Array;!B.TEXT.isSet&&B.MIXED.isSet&&(e=20),s=B.COLUMN80.isSet}if(s){const c=B.PAGE2.isSet&&!B.STORE80.isSet?uo:co,g=new Uint8Array(80*(n-e)).fill(160);for(let p=e;p<n;p++){const u=80*(p-e);for(let C=0;C<40;C++)g[u+2*C+1]=K[c+_r[p]+C],g[u+2*C]=K[io+c+_r[p]+C]}return g}else{const c=B.PAGE2.isSet?uo:co,g=new Uint8Array(40*(n-e));for(let p=e;p<n;p++){const u=40*(p-e),C=c+_r[p];g.set(K.slice(C,C+40),u)}return g}},lo=()=>xt.Buffer.from(Vr().map(t=>t&=127)).toString(),Ti=()=>{if(B.TEXT.isSet||!B.HIRES.isSet)return new Uint8Array;const t=B.COLUMN80.isSet&&!B.AN3.isSet,e=B.MIXED.isSet?160:192;if(t){const n=B.PAGE2.isSet&&!B.STORE80.isSet?16384:8192,s=new Uint8Array(80*e);for(let c=0;c<e;c++){const g=n+40*Math.trunc(c/64)+1024*(c%8)+128*(Math.trunc(c/8)&7);for(let p=0;p<40;p++)s[c*80+2*p+1]=K[g+p],s[c*80+2*p]=K[io+g+p]}return s}else{const n=B.PAGE2.isSet?16384:8192,s=new Uint8Array(40*e);for(let c=0;c<e;c++){const g=n+40*Math.trunc(c/64)+1024*(c%8)+128*(Math.trunc(c/8)&7);s.set(K.slice(g,g+40),c*40)}return s}},Pi=t=>{const e=$[t>>>8];return K.slice(e,e+512)},jr=(t,e)=>{const n=ot[t>>>8]+(t&255);K.set(e,n),zn()},Hr=(t,e)=>{for(let n=0;n<e.length;n++)if(E(t+n)!==e[n])return!1;return!0},A={cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1},fo=t=>{A.XReg=t},ho=t=>{A.YReg=t},ze=t=>{A.cycleCount=t},di=t=>{go(),Object.assign(A,t)},go=()=>{A.Accum=0,A.XReg=0,A.YReg=0,A.PStatus=36,A.StackPtr=255,ht(E(65533)*256+E(65532)),A.flagIRQ=0,A.flagNMI=!1},Io=t=>{ht((A.PC+t+65536)%65536)},ht=t=>{A.PC=t},po=t=>{A.PStatus=t|48},Li=new Array(256).fill(""),Ct=(t,e)=>{Li[A.StackPtr]=t,R(256+A.StackPtr,e),A.StackPtr=(A.StackPtr+255)%256},mt=()=>{A.StackPtr=(A.StackPtr+1)%256;const t=E(256+A.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},it=()=>(A.PStatus&1)!==0,P=(t=!0)=>A.PStatus=t?A.PStatus|1:A.PStatus&254,So=()=>(A.PStatus&2)!==0,Eo=(t=!0)=>A.PStatus=t?A.PStatus|2:A.PStatus&253,bi=()=>(A.PStatus&4)!==0,$r=(t=!0)=>A.PStatus=t?A.PStatus|4:A.PStatus&251,Bo=()=>(A.PStatus&8)!==0,J=()=>Bo()?1:0,zr=(t=!0)=>A.PStatus=t?A.PStatus|8:A.PStatus&247,vr=(t=!0)=>A.PStatus=t?A.PStatus|16:A.PStatus&239,Co=()=>(A.PStatus&64)!==0,ye=(t=!0)=>A.PStatus=t?A.PStatus|64:A.PStatus&191,mo=()=>(A.PStatus&128)!==0,Do=(t=!0)=>A.PStatus=t?A.PStatus|128:A.PStatus&127,D=t=>{Eo(t===0),Do(t>=128)},Dt=(t,e)=>{if(t){const n=A.PC;return Io(e>127?e-256:e),3+q(n,A.PC)}return 2},y=(t,e)=>(t+e+256)%256,m=(t,e)=>e*256+t,d=(t,e,n)=>(e*256+t+n+65536)%65536,q=(t,e)=>t>>8!==e>>8?1:0,zt=new Array(256),f=(t,e,n,s,c)=>{console.assert(!zt[n],"Duplicate instruction: "+t+" mode="+e),zt[n]={name:t,pcode:n,mode:e,PC:s,execute:c}},kt=(t,e,n)=>{const s=E(t),c=E((t+1)%256),g=d(s,c,A.YReg);e(g);let p=5+q(g,m(s,c));return n&&(p+=J()),p},yt=(t,e,n)=>{const s=E(t),c=E((t+1)%256),g=m(s,c);e(g);let p=5;return n&&(p+=J()),p},wo=t=>{let e=(A.Accum&15)+(t&15)+(it()?1:0);e>=10&&(e+=6);let n=(A.Accum&240)+(t&240)+e;const s=A.Accum<=127&&t<=127,c=A.Accum>=128&&t>=128;ye((n&255)>=128?s:c),P(n>=160),it()&&(n+=96),A.Accum=n&255,D(A.Accum)},ve=t=>{let e=A.Accum+t+(it()?1:0);P(e>=256),e=e%256;const n=A.Accum<=127&&t<=127,s=A.Accum>=128&&t>=128;ye(e>=128?n:s),A.Accum=e,D(A.Accum)},Tt=t=>{Bo()?wo(E(t)):ve(E(t))};f("ADC",l.IMM,105,2,t=>(J()?wo(t):ve(t),2+J())),f("ADC",l.ZP_REL,101,2,t=>(Tt(t),3+J())),f("ADC",l.ZP_X,117,2,t=>(Tt(y(t,A.XReg)),4+J())),f("ADC",l.ABS,109,3,(t,e)=>(Tt(m(t,e)),4+J())),f("ADC",l.ABS_X,125,3,(t,e)=>{const n=d(t,e,A.XReg);return Tt(n),4+J()+q(n,m(t,e))}),f("ADC",l.ABS_Y,121,3,(t,e)=>{const n=d(t,e,A.YReg);return Tt(n),4+J()+q(n,m(t,e))}),f("ADC",l.IND_X,97,2,t=>{const e=y(t,A.XReg);return Tt(m(E(e),E(e+1))),6+J()}),f("ADC",l.IND_Y,113,2,t=>kt(t,Tt,!0)),f("ADC",l.IND,114,2,t=>yt(t,Tt,!0));const Pt=t=>{A.Accum&=E(t),D(A.Accum)};f("AND",l.IMM,41,2,t=>(A.Accum&=t,D(A.Accum),2)),f("AND",l.ZP_REL,37,2,t=>(Pt(t),3)),f("AND",l.ZP_X,53,2,t=>(Pt(y(t,A.XReg)),4)),f("AND",l.ABS,45,3,(t,e)=>(Pt(m(t,e)),4)),f("AND",l.ABS_X,61,3,(t,e)=>{const n=d(t,e,A.XReg);return Pt(n),4+q(n,m(t,e))}),f("AND",l.ABS_Y,57,3,(t,e)=>{const n=d(t,e,A.YReg);return Pt(n),4+q(n,m(t,e))}),f("AND",l.IND_X,33,2,t=>{const e=y(t,A.XReg);return Pt(m(E(e),E(e+1))),6}),f("AND",l.IND_Y,49,2,t=>kt(t,Pt,!1)),f("AND",l.IND,50,2,t=>yt(t,Pt,!1));const tr=t=>{let e=E(t);E(t),P((e&128)===128),e=(e<<1)%256,R(t,e),D(e)};f("ASL",l.IMPLIED,10,1,()=>(P((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256,D(A.Accum),2)),f("ASL",l.ZP_REL,6,2,t=>(tr(t),5)),f("ASL",l.ZP_X,22,2,t=>(tr(y(t,A.XReg)),6)),f("ASL",l.ABS,14,3,(t,e)=>(tr(m(t,e)),6)),f("ASL",l.ABS_X,30,3,(t,e)=>{const n=d(t,e,A.XReg);return tr(n),6+q(n,m(t,e))}),f("BCC",l.ZP_REL,144,2,t=>Dt(!it(),t)),f("BCS",l.ZP_REL,176,2,t=>Dt(it(),t)),f("BEQ",l.ZP_REL,240,2,t=>Dt(So(),t)),f("BMI",l.ZP_REL,48,2,t=>Dt(mo(),t)),f("BNE",l.ZP_REL,208,2,t=>Dt(!So(),t)),f("BPL",l.ZP_REL,16,2,t=>Dt(!mo(),t)),f("BVC",l.ZP_REL,80,2,t=>Dt(!Co(),t)),f("BVS",l.ZP_REL,112,2,t=>Dt(Co(),t)),f("BRA",l.ZP_REL,128,2,t=>Dt(!0,t));const Te=t=>{Eo((A.Accum&t)===0),Do((t&128)!==0),ye((t&64)!==0)};f("BIT",l.ZP_REL,36,2,t=>(Te(E(t)),3)),f("BIT",l.ABS,44,3,(t,e)=>(Te(E(m(t,e))),4)),f("BIT",l.IMM,137,2,t=>(Te(t),2)),f("BIT",l.ZP_X,52,2,t=>(Te(E(y(t,A.XReg))),4)),f("BIT",l.ABS_X,60,3,(t,e)=>{const n=d(t,e,A.XReg);return Te(E(n)),4+q(n,m(t,e))});const tn=(t,e,n=0)=>{const s=(A.PC+n)%65536,c=E(e),g=E(e+1);Ct(`${t} $`+G(g)+G(c),Math.trunc(s/256)),Ct(t,s%256),Ct("P",A.PStatus),zr(!1),$r();const p=d(c,g,t==="BRK"?-1:0);ht(p)},Ro=()=>(vr(),tn("BRK",65534,2),7);f("BRK",l.IMPLIED,0,1,Ro);const Fi=()=>bi()?0:(vr(!1),tn("IRQ",65534),7),Mi=()=>(tn("NMI",65530),7);f("CLC",l.IMPLIED,24,1,()=>(P(!1),2)),f("CLD",l.IMPLIED,216,1,()=>(zr(!1),2)),f("CLI",l.IMPLIED,88,1,()=>($r(!1),2)),f("CLV",l.IMPLIED,184,1,()=>(ye(!1),2));const vt=t=>{const e=E(t);P(A.Accum>=e),D((A.Accum-e+256)%256)},Ui=t=>{const e=E(t);P(A.Accum>=e),D((A.Accum-e+256)%256)};f("CMP",l.IMM,201,2,t=>(P(A.Accum>=t),D((A.Accum-t+256)%256),2)),f("CMP",l.ZP_REL,197,2,t=>(vt(t),3)),f("CMP",l.ZP_X,213,2,t=>(vt(y(t,A.XReg)),4)),f("CMP",l.ABS,205,3,(t,e)=>(vt(m(t,e)),4)),f("CMP",l.ABS_X,221,3,(t,e)=>{const n=d(t,e,A.XReg);return Ui(n),4+q(n,m(t,e))}),f("CMP",l.ABS_Y,217,3,(t,e)=>{const n=d(t,e,A.YReg);return vt(n),4+q(n,m(t,e))}),f("CMP",l.IND_X,193,2,t=>{const e=y(t,A.XReg);return vt(m(E(e),E(e+1))),6}),f("CMP",l.IND_Y,209,2,t=>kt(t,vt,!1)),f("CMP",l.IND,210,2,t=>yt(t,vt,!1));const ko=t=>{const e=E(t);P(A.XReg>=e),D((A.XReg-e+256)%256)};f("CPX",l.IMM,224,2,t=>(P(A.XReg>=t),D((A.XReg-t+256)%256),2)),f("CPX",l.ZP_REL,228,2,t=>(ko(t),3)),f("CPX",l.ABS,236,3,(t,e)=>(ko(m(t,e)),4));const yo=t=>{const e=E(t);P(A.YReg>=e),D((A.YReg-e+256)%256)};f("CPY",l.IMM,192,2,t=>(P(A.YReg>=t),D((A.YReg-t+256)%256),2)),f("CPY",l.ZP_REL,196,2,t=>(yo(t),3)),f("CPY",l.ABS,204,3,(t,e)=>(yo(m(t,e)),4));const er=t=>{const e=y(E(t),-1);R(t,e),D(e)};f("DEC",l.IMPLIED,58,1,()=>(A.Accum=y(A.Accum,-1),D(A.Accum),2)),f("DEC",l.ZP_REL,198,2,t=>(er(t),5)),f("DEC",l.ZP_X,214,2,t=>(er(y(t,A.XReg)),6)),f("DEC",l.ABS,206,3,(t,e)=>(er(m(t,e)),6)),f("DEC",l.ABS_X,222,3,(t,e)=>{const n=d(t,e,A.XReg);return E(n),er(n),7}),f("DEX",l.IMPLIED,202,1,()=>(A.XReg=y(A.XReg,-1),D(A.XReg),2)),f("DEY",l.IMPLIED,136,1,()=>(A.YReg=y(A.YReg,-1),D(A.YReg),2));const dt=t=>{A.Accum^=E(t),D(A.Accum)};f("EOR",l.IMM,73,2,t=>(A.Accum^=t,D(A.Accum),2)),f("EOR",l.ZP_REL,69,2,t=>(dt(t),3)),f("EOR",l.ZP_X,85,2,t=>(dt(y(t,A.XReg)),4)),f("EOR",l.ABS,77,3,(t,e)=>(dt(m(t,e)),4)),f("EOR",l.ABS_X,93,3,(t,e)=>{const n=d(t,e,A.XReg);return dt(n),4+q(n,m(t,e))}),f("EOR",l.ABS_Y,89,3,(t,e)=>{const n=d(t,e,A.YReg);return dt(n),4+q(n,m(t,e))}),f("EOR",l.IND_X,65,2,t=>{const e=y(t,A.XReg);return dt(m(E(e),E(e+1))),6}),f("EOR",l.IND_Y,81,2,t=>kt(t,dt,!1)),f("EOR",l.IND,82,2,t=>yt(t,dt,!1));const rr=t=>{const e=y(E(t),1);R(t,e),D(e)};f("INC",l.IMPLIED,26,1,()=>(A.Accum=y(A.Accum,1),D(A.Accum),2)),f("INC",l.ZP_REL,230,2,t=>(rr(t),5)),f("INC",l.ZP_X,246,2,t=>(rr(y(t,A.XReg)),6)),f("INC",l.ABS,238,3,(t,e)=>(rr(m(t,e)),6)),f("INC",l.ABS_X,254,3,(t,e)=>{const n=d(t,e,A.XReg);return E(n),rr(n),7}),f("INX",l.IMPLIED,232,1,()=>(A.XReg=y(A.XReg,1),D(A.XReg),2)),f("INY",l.IMPLIED,200,1,()=>(A.YReg=y(A.YReg,1),D(A.YReg),2)),f("JMP",l.ABS,76,3,(t,e)=>(ht(d(t,e,-3)),3)),f("JMP",l.IND,108,3,(t,e)=>{const n=m(t,e);return t=E(n),e=E((n+1)%65536),ht(d(t,e,-3)),6}),f("JMP",l.IND_X,124,3,(t,e)=>{const n=d(t,e,A.XReg);return t=E(n),e=E((n+1)%65536),ht(d(t,e,-3)),6}),f("JSR",l.ABS,32,3,(t,e)=>{const n=(A.PC+2)%65536;return Ct("JSR $"+G(e)+G(t),Math.trunc(n/256)),Ct("JSR",n%256),ht(d(t,e,-3)),6});const Lt=t=>{A.Accum=E(t),D(A.Accum)};f("LDA",l.IMM,169,2,t=>(A.Accum=t,D(A.Accum),2)),f("LDA",l.ZP_REL,165,2,t=>(Lt(t),3)),f("LDA",l.ZP_X,181,2,t=>(Lt(y(t,A.XReg)),4)),f("LDA",l.ABS,173,3,(t,e)=>(Lt(m(t,e)),4)),f("LDA",l.ABS_X,189,3,(t,e)=>{const n=d(t,e,A.XReg);return Lt(n),4+q(n,m(t,e))}),f("LDA",l.ABS_Y,185,3,(t,e)=>{const n=d(t,e,A.YReg);return Lt(n),4+q(n,m(t,e))}),f("LDA",l.IND_X,161,2,t=>{const e=y(t,A.XReg);return Lt(m(E(e),E((e+1)%256))),6}),f("LDA",l.IND_Y,177,2,t=>kt(t,Lt,!1)),f("LDA",l.IND,178,2,t=>yt(t,Lt,!1));const nr=t=>{A.XReg=E(t),D(A.XReg)};f("LDX",l.IMM,162,2,t=>(A.XReg=t,D(A.XReg),2)),f("LDX",l.ZP_REL,166,2,t=>(nr(t),3)),f("LDX",l.ZP_Y,182,2,t=>(nr(y(t,A.YReg)),4)),f("LDX",l.ABS,174,3,(t,e)=>(nr(m(t,e)),4)),f("LDX",l.ABS_Y,190,3,(t,e)=>{const n=d(t,e,A.YReg);return nr(n),4+q(n,m(t,e))});const or=t=>{A.YReg=E(t),D(A.YReg)};f("LDY",l.IMM,160,2,t=>(A.YReg=t,D(A.YReg),2)),f("LDY",l.ZP_REL,164,2,t=>(or(t),3)),f("LDY",l.ZP_X,180,2,t=>(or(y(t,A.XReg)),4)),f("LDY",l.ABS,172,3,(t,e)=>(or(m(t,e)),4)),f("LDY",l.ABS_X,188,3,(t,e)=>{const n=d(t,e,A.XReg);return or(n),4+q(n,m(t,e))});const ir=t=>{let e=E(t);E(t),P((e&1)===1),e>>=1,R(t,e),D(e)};f("LSR",l.IMPLIED,74,1,()=>(P((A.Accum&1)===1),A.Accum>>=1,D(A.Accum),2)),f("LSR",l.ZP_REL,70,2,t=>(ir(t),5)),f("LSR",l.ZP_X,86,2,t=>(ir(y(t,A.XReg)),6)),f("LSR",l.ABS,78,3,(t,e)=>(ir(m(t,e)),6)),f("LSR",l.ABS_X,94,3,(t,e)=>{const n=d(t,e,A.XReg);return ir(n),6+q(n,m(t,e))}),f("NOP",l.IMPLIED,234,1,()=>2);const bt=t=>{A.Accum|=E(t),D(A.Accum)};f("ORA",l.IMM,9,2,t=>(A.Accum|=t,D(A.Accum),2)),f("ORA",l.ZP_REL,5,2,t=>(bt(t),3)),f("ORA",l.ZP_X,21,2,t=>(bt(y(t,A.XReg)),4)),f("ORA",l.ABS,13,3,(t,e)=>(bt(m(t,e)),4)),f("ORA",l.ABS_X,29,3,(t,e)=>{const n=d(t,e,A.XReg);return bt(n),4+q(n,m(t,e))}),f("ORA",l.ABS_Y,25,3,(t,e)=>{const n=d(t,e,A.YReg);return bt(n),4+q(n,m(t,e))}),f("ORA",l.IND_X,1,2,t=>{const e=y(t,A.XReg);return bt(m(E(e),E(e+1))),6}),f("ORA",l.IND_Y,17,2,t=>kt(t,bt,!1)),f("ORA",l.IND,18,2,t=>yt(t,bt,!1)),f("PHA",l.IMPLIED,72,1,()=>(Ct("PHA",A.Accum),3)),f("PHP",l.IMPLIED,8,1,()=>(Ct("PHP",A.PStatus|16),3)),f("PHX",l.IMPLIED,218,1,()=>(Ct("PHX",A.XReg),3)),f("PHY",l.IMPLIED,90,1,()=>(Ct("PHY",A.YReg),3)),f("PLA",l.IMPLIED,104,1,()=>(A.Accum=mt(),D(A.Accum),4)),f("PLP",l.IMPLIED,40,1,()=>(po(mt()),4)),f("PLX",l.IMPLIED,250,1,()=>(A.XReg=mt(),D(A.XReg),4)),f("PLY",l.IMPLIED,122,1,()=>(A.YReg=mt(),D(A.YReg),4));const sr=t=>{let e=E(t);E(t);const n=it()?1:0;P((e&128)===128),e=(e<<1)%256|n,R(t,e),D(e)};f("ROL",l.IMPLIED,42,1,()=>{const t=it()?1:0;return P((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256|t,D(A.Accum),2}),f("ROL",l.ZP_REL,38,2,t=>(sr(t),5)),f("ROL",l.ZP_X,54,2,t=>(sr(y(t,A.XReg)),6)),f("ROL",l.ABS,46,3,(t,e)=>(sr(m(t,e)),6)),f("ROL",l.ABS_X,62,3,(t,e)=>{const n=d(t,e,A.XReg);return sr(n),6+q(n,m(t,e))});const Ar=t=>{let e=E(t);E(t);const n=it()?128:0;P((e&1)===1),e=e>>1|n,R(t,e),D(e)};f("ROR",l.IMPLIED,106,1,()=>{const t=it()?128:0;return P((A.Accum&1)===1),A.Accum=A.Accum>>1|t,D(A.Accum),2}),f("ROR",l.ZP_REL,102,2,t=>(Ar(t),5)),f("ROR",l.ZP_X,118,2,t=>(Ar(y(t,A.XReg)),6)),f("ROR",l.ABS,110,3,(t,e)=>(Ar(m(t,e)),6)),f("ROR",l.ABS_X,126,3,(t,e)=>{const n=d(t,e,A.XReg);return Ar(n),6+q(n,m(t,e))}),f("RTI",l.IMPLIED,64,1,()=>(po(mt()),vr(!1),ht(m(mt(),mt())-1),6)),f("RTS",l.IMPLIED,96,1,()=>(ht(m(mt(),mt())),6));const To=t=>{const e=255-t;let n=A.Accum+e+(it()?1:0);const s=n>=256,c=A.Accum<=127&&e<=127,g=A.Accum>=128&&e>=128;ye(n%256>=128?c:g);const p=(A.Accum&15)-(t&15)+(it()?0:-1);n=A.Accum-t+(it()?0:-1),n<0&&(n-=96),p<0&&(n-=6),A.Accum=n&255,D(A.Accum),P(s)},Ft=t=>{J()?To(E(t)):ve(255-E(t))};f("SBC",l.IMM,233,2,t=>(J()?To(t):ve(255-t),2+J())),f("SBC",l.ZP_REL,229,2,t=>(Ft(t),3+J())),f("SBC",l.ZP_X,245,2,t=>(Ft(y(t,A.XReg)),4+J())),f("SBC",l.ABS,237,3,(t,e)=>(Ft(m(t,e)),4+J())),f("SBC",l.ABS_X,253,3,(t,e)=>{const n=d(t,e,A.XReg);return Ft(n),4+J()+q(n,m(t,e))}),f("SBC",l.ABS_Y,249,3,(t,e)=>{const n=d(t,e,A.YReg);return Ft(n),4+J()+q(n,m(t,e))}),f("SBC",l.IND_X,225,2,t=>{const e=y(t,A.XReg);return Ft(m(E(e),E(e+1))),6+J()}),f("SBC",l.IND_Y,241,2,t=>kt(t,Ft,!0)),f("SBC",l.IND,242,2,t=>yt(t,Ft,!0)),f("SEC",l.IMPLIED,56,1,()=>(P(),2)),f("SED",l.IMPLIED,248,1,()=>(zr(),2)),f("SEI",l.IMPLIED,120,1,()=>($r(),2)),f("STA",l.ZP_REL,133,2,t=>(R(t,A.Accum),3)),f("STA",l.ZP_X,149,2,t=>(R(y(t,A.XReg),A.Accum),4)),f("STA",l.ABS,141,3,(t,e)=>(R(m(t,e),A.Accum),4)),f("STA",l.ABS_X,157,3,(t,e)=>{const n=d(t,e,A.XReg);return E(n),R(n,A.Accum),5}),f("STA",l.ABS_Y,153,3,(t,e)=>(R(d(t,e,A.YReg),A.Accum),5)),f("STA",l.IND_X,129,2,t=>{const e=y(t,A.XReg);return R(m(E(e),E(e+1)),A.Accum),6});const Po=t=>{R(t,A.Accum)};f("STA",l.IND_Y,145,2,t=>(kt(t,Po,!1),6)),f("STA",l.IND,146,2,t=>yt(t,Po,!1)),f("STX",l.ZP_REL,134,2,t=>(R(t,A.XReg),3)),f("STX",l.ZP_Y,150,2,t=>(R(y(t,A.YReg),A.XReg),4)),f("STX",l.ABS,142,3,(t,e)=>(R(m(t,e),A.XReg),4)),f("STY",l.ZP_REL,132,2,t=>(R(t,A.YReg),3)),f("STY",l.ZP_X,148,2,t=>(R(y(t,A.XReg),A.YReg),4)),f("STY",l.ABS,140,3,(t,e)=>(R(m(t,e),A.YReg),4)),f("STZ",l.ZP_REL,100,2,t=>(R(t,0),3)),f("STZ",l.ZP_X,116,2,t=>(R(y(t,A.XReg),0),4)),f("STZ",l.ABS,156,3,(t,e)=>(R(m(t,e),0),4)),f("STZ",l.ABS_X,158,3,(t,e)=>{const n=d(t,e,A.XReg);return E(n),R(n,0),5}),f("TAX",l.IMPLIED,170,1,()=>(A.XReg=A.Accum,D(A.XReg),2)),f("TAY",l.IMPLIED,168,1,()=>(A.YReg=A.Accum,D(A.YReg),2)),f("TSX",l.IMPLIED,186,1,()=>(A.XReg=A.StackPtr,D(A.XReg),2)),f("TXA",l.IMPLIED,138,1,()=>(A.Accum=A.XReg,D(A.Accum),2)),f("TXS",l.IMPLIED,154,1,()=>(A.StackPtr=A.XReg,2)),f("TYA",l.IMPLIED,152,1,()=>(A.Accum=A.YReg,D(A.Accum),2)),[2,34,66,98,130,194,226].forEach(t=>{f("NOPX",l.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)f("NOPX",l.IMPLIED,3+16*t,1,()=>1),f("NOPX",l.IMPLIED,7+16*t,1,()=>1),f("NOPX",l.IMPLIED,11+16*t,1,()=>1),f("NOPX",l.IMPLIED,15+16*t,1,()=>1);f("NOPX",l.IMPLIED,68,2,()=>3),f("NOPX",l.IMPLIED,84,2,()=>4),f("NOPX",l.IMPLIED,212,2,()=>4),f("NOPX",l.IMPLIED,244,2,()=>4),f("NOPX",l.IMPLIED,92,3,()=>8),f("NOPX",l.IMPLIED,220,3,()=>4),f("NOPX",l.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)zt[t]||f("BRK",l.IMPLIED,t,1,Ro);const z=(t,e,n)=>{const s=e&7,c=e>>>3;return t[c]|=n>>>s,s&&(t[c+1]|=n<<8-s),e+8},ar=(t,e,n)=>(e=z(t,e,n>>>1|170),e=z(t,e,n|170),e),en=(t,e)=>(e=z(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Ni=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),s=[0,2,1,3];for(let g=0;g<84;g++)n[g]=s[t[g]&3]|s[t[g+86]&3]<<2|s[t[g+172]&3]<<4;n[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,n[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let g=0;g<256;g++)n[86+g]=t[g]>>>2;n[342]=n[341];let c=342;for(;c>1;)c--,n[c]^=n[c-1];for(let g=0;g<343;g++)n[g]=e[n[g]];return n};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Qi=(t,e,n)=>{let s=0;const c=new Uint8Array(6646).fill(0);for(let g=0;g<16;g++)s=en(c,s);for(let g=0;g<16;g++){s=z(c,s,213),s=z(c,s,170),s=z(c,s,150),s=ar(c,s,254),s=ar(c,s,e),s=ar(c,s,g),s=ar(c,s,254^e^g),s=z(c,s,222),s=z(c,s,170),s=z(c,s,235);for(let C=0;C<7;C++)s=en(c,s);s=z(c,s,213),s=z(c,s,170),s=z(c,s,173);const p=g===15?15:g*(n?8:7)%15,u=Ni(t.slice(p*256,p*256+256));for(let C=0;C<u.length;C++)s=z(c,s,u[C]);s=z(c,s,222),s=z(c,s,170),s=z(c,s,235);for(let C=0;C<16;C++)s=en(c,s)}return c},Oi=(t,e)=>{if(t.length!==35*16*256)return new Uint8Array;const n=new Uint8Array(512*3+512*35*13).fill(0);n.set(De(`WOZ2ÿ
\r
`),0),n.set(De("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(De("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(De("TMAP"),80),n[84]=160,n.fill(255,88,88+160);let s=0;for(let c=0;c<35;c++)s=88+(c<<2),c>0&&(n[s-1]=c),n[s]=n[s+1]=c;n.set(De("TRKS"),248),n.set(Mn(1280+35*13*512),252);for(let c=0;c<35;c++){s=256+(c<<3),n.set(G1(3+c*13),s),n[s+2]=13,n.set(Mn(50304),s+4);const g=t.slice(c*16*256,(c+1)*16*256),p=Qi(g,c,e);s=512*(3+13*c),n.set(p,s)}return n},Ki=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,C)=>u!==e[C])===void 0))return!1;t.isWriteProtected=e[22]===1;const c=e.slice(8,12),g=c[0]+(c[1]<<8)+(c[2]<<16)+c[3]*2**24,p=J1(e,12);if(g!==0&&g!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const C=e[88+u*2];if(C<255){const Q=256+8*C,b=e.slice(Q,Q+8);t.trackStart[u]=512*(b[0]+(b[1]<<8)),t.trackNbits[u]=b[4]+(b[5]<<8)+(b[6]<<16)+b[7]*2**24}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},qi=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((c,g)=>c!==e[g])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let c=0;c<80;c++){const g=e[88+c*2];if(g<255){t.trackStart[c]=256+g*6656;const p=e.slice(t.trackStart[c]+6646,t.trackStart[c]+6656);t.trackNbits[c]=p[2]+(p[3]<<8)}else t.trackStart[c]=0,t.trackNbits[c]=51200}return!0},Yi=t=>{const e=t.toLowerCase(),n=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return n||s},xi=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),c=Oi(e,s);return c.length===0?new Uint8Array:(t.filename=Un(t.filename,"woz"),t.diskHasChanges=!0,c)},Lo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Xi=(t,e)=>{const n=Lo(e.slice(24,28)),s=Lo(e.slice(28,32));let c="";for(let g=0;g<4;g++)c+=String.fromCharCode(e[g]);return c!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Un(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(n,n+s))},bo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},Wi=(t,e)=>{t.diskHasChanges=!1;const n=t.filename.toLowerCase();if(bo(n)){if(t.hardDrive=!0,t.status="",n.endsWith(".hdv")||n.endsWith(".po"))return e;if(n.endsWith(".2mg"))return Xi(t,e)}return Yi(t.filename)&&(e=xi(t,e)),Ki(t,e)||qi(t,e)?e:(n!==""&&console.error("Unknown disk format."),new Uint8Array)},Gi=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ae=0;const v={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},Fo=t=>{v.MOTOR_RUNNING=!1,Qo(t),t.halftrack=68,t.prevHalfTrack=68},Zi=(t=!1)=>{if(t){const e=hr();e.motorRunning&&Oo(e)}else Be(Xt.MOTOR_OFF)},Mo=(t,e)=>{t.trackStart[t.halftrack]>0&&(t.prevHalfTrack=t.halftrack),t.halftrack+=e,t.halftrack<0||t.halftrack>68?(Be(Xt.TRACK_END),t.halftrack=t.halftrack<0?0:t.halftrack>68?68:t.halftrack):Be(Xt.TRACK_SEEK),t.status=` Track ${t.halftrack/2}`,st(),t.trackStart[t.halftrack]>0&&t.prevHalfTrack!==t.halftrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack])),t.trackLocation>3&&(t.trackLocation-=4))},Uo=[128,64,32,16,8,4,2,1],Ji=[127,191,223,239,247,251,253,254],rn=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let n;if(t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3),c=e[s],g=t.trackLocation&7;n=(c&Uo[g])>>7-g}else n=1;return t.trackLocation++,n};let tt=0;const _i=(t,e)=>{if(e.length===0)return 0;let n=0;if(tt===0){for(;rn(t,e)===0;);tt=64;for(let s=5;s>=0;s--)tt|=rn(t,e)<<s}else{const s=rn(t,e);tt=tt<<1|s}return n=tt,tt>127&&(tt=0),n};let cr=0;const nn=(t,e,n)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3);let c=e[s];const g=t.trackLocation&7;n?c|=Uo[g]:c&=Ji[g],e[s]=c}t.trackLocation++},No=(t,e,n)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&tt>0){if(n>=16)for(let s=7;s>=0;s--)nn(t,e,tt&2**s?1:0);n>=36&&nn(t,e,0),n>=40&&nn(t,e,0),on.push(n>=40?2:n>=36?1:tt),t.diskHasChanges=!0,tt=0}},Qo=t=>{Ae=0,v.MOTOR_RUNNING||(t.motorRunning=!1),st(),Be(Xt.MOTOR_OFF)},Oo=t=>{Ae&&(clearTimeout(Ae),Ae=0),t.motorRunning=!0,st(),Be(Xt.MOTOR_ON)},Vi=t=>{Ae===0&&(Ae=setTimeout(()=>Qo(t),1e3))};let on=[];const ur=t=>{on.length>0&&t.halftrack===2*0&&(on=[])},lr=[0,0,0,0],ji=(t,e)=>{if(t>=49408)return-1;let n=hr();const s=as();if(n.hardDrive)return 0;let c=0;const g=A.cycleCount-cr;switch(t=t&15,t){case v.DATA_LATCH_OFF:v.DATA_LATCH=!1,n.motorRunning&&!n.writeMode&&(c=_i(n,s));break;case v.MOTOR_ON:v.MOTOR_RUNNING=!0,Oo(n),ur(n);break;case v.MOTOR_OFF:v.MOTOR_RUNNING=!1,Vi(n),ur(n);break;case v.DRIVE1:case v.DRIVE2:{const p=t===v.DRIVE1?1:2,u=hr();As(p),n=hr(),n!==u&&u.motorRunning&&(u.motorRunning=!1,n.motorRunning=!0,st());break}case v.WRITE_OFF:n.motorRunning&&n.writeMode&&(No(n,s,g),cr=A.cycleCount),n.writeMode=!1,v.DATA_LATCH&&(c=n.isWriteProtected?255:0),ur(n);break;case v.WRITE_ON:n.writeMode=!0,cr=A.cycleCount,e>=0&&(tt=e);break;case v.DATA_LATCH_ON:v.DATA_LATCH=!0,n.motorRunning&&(n.writeMode&&(No(n,s,g),cr=A.cycleCount),e>=0&&(tt=e));break;default:{if(t<0||t>7)break;lr[Math.floor(t/2)]=t%2;const p=lr[(n.currentPhase+1)%4],u=lr[(n.currentPhase+3)%4];lr[n.currentPhase]||(n.motorRunning&&p?(Mo(n,1),n.currentPhase=(n.currentPhase+1)%4):n.motorRunning&&u&&(Mo(n,-1),n.currentPhase=(n.currentPhase+3)%4)),ur(n);break}}return c},Hi=()=>{se(6,Uint8Array.from(Gi)),$e(6,ji)},Ko=t=>{let e=l.IMPLIED,n=-1;return t.length>0&&(t.startsWith("#")?(e=l.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=l.IND_Y:t.endsWith(",X)")?e=l.IND_X:e=l.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?l.ABS_X:l.ZP_X:t.endsWith(",Y")?e=t.length>5?l.ABS_Y:l.ZP_Y:e=t.length>3?l.ABS:l.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),n=parseInt(t)),[e,n]};let ae={};const $i=t=>{const e=t.split(/([+-])/);return{label:e[0]?e[0]:"",operation:e[1]?e[1]:"",value:e[2]?parseInt(e[2].replace("#","").replace("$","0x")):0}},zi=(t,e,n,s)=>{let c=l.IMPLIED,g=-1;if(n.match(/^[#]?[$0-9()]+/))return Ko(n);const p=$i(n);if(p.label){const u=p.label.startsWith("#");if(u&&(p.label=p.label.substring(1)),p.label in ae)g=ae[p.label];else if(s===2)throw new Error("Missing label: "+p.label);if(p.operation&&p.value){switch(p.operation){case"+":g+=p.value;break;case"-":g-=p.value;break;default:throw new Error("Unknown operation in operand: "+n)}g=(g%65536+65536)%65536}Fr(e)?(c=l.ZP_REL,g=g-t+254,g>255&&(g-=256)):u?c=l.IMM:c=g>=0&&g<=255?l.ZP_REL:l.ABS}return[c,g]},vi=(t,e)=>{t=t.replace(/\s+/g," ");const n=t.split(" ");return{label:n[0]?n[0]:e,instr:n[1]?n[1]:"",operand:n[2]?n[2]:""}},ts=(t,e)=>{if(t.label in ae)throw new Error("Redefined label: "+t.label);if(t.instr==="EQU"){const[n,s]=Ko(t.operand);if(n!==l.ABS&&n!==l.ZP_REL)throw new Error("Illegal EQU value: "+t.operand);ae[t.label]=s}else ae[t.label]=e},es=(t,e)=>{const n=[],s=zt[t];return n.push(t),e>=0&&(n.push(e%256),s.PC===3&&n.push(Math.trunc(e/256))),n},qo=(t,e,n)=>{let s=t;const c=[];let g="";return e.forEach(p=>{if(p=p.split(";")[0].trimEnd().toUpperCase(),!p)return;(p+"                   ").slice(0,30)+G(s,4)+"";const u=vi(p,g);if(g="",!u.instr){g=u.label;return}if(u.instr==="ORG"||(n===1&&u.label&&ts(u,s),u.instr==="EQU"))return;const[C,Q]=zi(s,u.instr,u.operand,n);if(n===2&&Fr(u.instr)&&(Q<0||Q>255))throw new Error(`Branch instruction out of range: ${p} value: ${Q} pass: ${n}`);const b=zt.findIndex(At=>At&&At.name===u.instr&&At.mode===C);if(b<0)throw new Error(`Unknown instruction: ${u.instr} mode=${C} pass=${n}`);const V=es(b,Q);s+=zt[b].PC,c.push(...V)}),c},sn=(t,e)=>{ae={};try{return qo(t,e,1),qo(t,e,2)}catch(n){return console.error(n),[]}};let ce=0;const fr=192,rs=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${G(fr)}   ; jump address
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
`,ns=`
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
`,os=()=>{const t=new Uint8Array(256).fill(0),e=sn(0,rs.split(`
`));t.set(e,0);const n=sn(0,ns.split(`
`));return t.set(n,fr),t[254]=23,t[255]=fr,t};let Pe=new Uint8Array;const Yo=(t=!0)=>{Pe.length===0&&(Pe=os()),Pe[1]=t?32:0;const n=49152+fr+7*256;se(7,Pe,n,ss),se(7,Pe,n+3,is)},is=()=>{const t=xo();if(!t.hardDrive)return;const e=Xo(),n=256+A.StackPtr,s=E(n+1)+256*E(n+2),c=E(s+1),g=E(s+2)+256*E(s+3),p=E(g+1),u=E(g+2)+256*E(g+3);switch(c){case 0:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),P();return}const C=E(g+4);switch(C){case 0:p===0?(R(u,1),P(!1)):(console.error(`SmartPort status for unitNumber ${p} not implemented`),P());break;default:console.error(`SmartPort statusCode ${C} not implemented`),P();break}return}case 1:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),P();return}const Q=512*(E(g+4)+256*E(g+5)+65536*E(g+6)),b=e.slice(Q,Q+512);jr(u,b);break}case 2:default:console.error(`SmartPort command ${c} not implemented`),P();return}P(!1),t.motorRunning=!0,ce||(ce=setTimeout(()=>{ce=0,t&&(t.motorRunning=!1),st()},500)),st()},ss=()=>{const t=xo();if(!t.hardDrive)return;const e=Xo(),n=E(70)+256*E(71),s=512*n,c=E(68)+256*E(69),g=e.length;switch(t.status=` ${G(n,4)} ${G(c,4)}`,E(66)){case 0:{if(t.filename.length===0||g===0){fo(0),ho(0),P();return}const p=g/512;fo(p&255),ho(p>>>8);break}case 1:{if(s+512>g){P();return}const p=e.slice(s,s+512);jr(c,p);break}case 2:{if(s+512>g){P();return}const p=Pi(c);e.set(p,s),t.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),P();return;default:console.error("unknown hard drive command"),P();return}P(!1),t.motorRunning=!0,ce||(ce=setTimeout(()=>{ce=0,t&&(t.motorRunning=!1),st()},500)),st()},de=t=>({hardDrive:t===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:t>0?Array(80):Array(),trackNbits:t>0?Array(80):Array(),trackLocation:0}),N=[de(0),de(1),de(2)],Mt=[new Uint8Array,new Uint8Array,new Uint8Array];let Le=1;const As=t=>{Le=t},hr=()=>N[Le],as=()=>Mt[Le],xo=()=>N[0],Xo=()=>Mt[0],st=()=>{for(let t=0;t<N.length;t++){const e={hardDrive:N[t].hardDrive,drive:t,filename:N[t].filename,status:N[t].status,motorRunning:N[t].motorRunning,diskHasChanges:N[t].diskHasChanges,diskData:N[t].diskHasChanges?Mt[t]:new Uint8Array};gA(e)}},cs=t=>{const e=["","",""];for(let n=t?0:1;n<3;n++)e[n]=xt.Buffer.from(Mt[n]).toString("base64");return{currentDrive:Le,driveState:N,driveData:e}},us=t=>{Be(Xt.MOTOR_OFF),Le=t.currentDrive;for(let e=0;e<3;e++)N[e]=de(e),Mt[e]=new Uint8Array;for(let e=0;e<t.driveState.length;e++)N[e]=t.driveState[e],t.driveData[e]!==""&&(Mt[e]=new Uint8Array(xt.Buffer.from(t.driveData[e],"base64")));N[0].hardDrive&&Yo(N[0].filename!==""),st()},ls=()=>{Fo(N[1]),Fo(N[2]),st()},fs=(t=!1)=>{Zi(t),st()},hs=t=>{let e=t.drive;t.filename!==""&&(bo(t.filename)?(e=0,N[0].hardDrive=!0):e===0&&(e=1)),N[e]=de(e),N[e].filename=t.filename,N[e].motorRunning=t.motorRunning,Mt[e]=Wi(N[e],t.diskData),Mt[e].length===0&&(N[e].filename=""),N[e].hardDrive&&Yo(N[e].filename!==""),st()},Wo=`
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
`;let An=1e4;const gr=new Array(1e3);let be=0,Go=-1,an=!1;const Ir=(t=!0)=>{An=t?0:1e3},gs=(t=!0)=>{an=t},Is=t=>{Go=t},ps=()=>{gr.slice(be).forEach(t=>console.log(t)),gr.slice(0,be).forEach(t=>console.log(t))},cn=(t=0,e=!0)=>{e?A.flagIRQ|=1<<t:A.flagIRQ&=~(1<<t),A.flagIRQ&=255},Ss=(t=!0)=>{A.flagNMI=t===!0},Es=()=>{A.flagIRQ=0,A.flagNMI=!1},un=[],Zo=[],Bs=(t,e)=>{un.push(t),Zo.push(e)},Cs=()=>{for(let t=0;t<un.length;t++)un[t](Zo[t])},ln=(t=!1)=>{let e=0;const n=A.PC,s=E(A.PC),c=E(A.PC+1),g=E(A.PC+2),p=zt[s];if(n===Go&&!t)return St(F.PAUSED),-1;const u=Ao.get(n);if(u&&!B.INTCXROM.isSet&&u(),e=p.execute(c,g),An<1e3&&(n<64680||n>64691)&&n<65351){An++,n===1048575&&ps();const C=W1(p,c,g,n)+"            ",Q=`${A.cycleCount}  ${C.slice(0,22)}  ${x1(A)}`;gr[be]=Q,be=(be+1)%gr.length,console.log(Q)}return Io(p.PC),ze(A.cycleCount+e),Cs(),A.flagNMI&&(A.flagNMI=!1,e=Mi(),ze(A.cycleCount+e)),A.flagIRQ&&(e=Fi(),ze(A.cycleCount+e)),an&&p.pcode===96?(an=!1,St(F.PAUSED),-1):e},fn=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let hn=1,gn=0,In=0;const ms=(t=!0,e=1)=>{if(!t)return;hn=e;const n=new Uint8Array(fn.length+256);n.set(fn.slice(1792,2048)),n.set(fn,256),se(hn,n),$e(hn,Rs)};let pr=new Uint8Array(0),Sr=-1;const Ds=t=>{const e=new Uint8Array(pr.length+t.length);e.set(t),e.set(pr,t.length),pr=e,Sr+=t.length},ws=t=>{const e=new Uint8Array(1).fill(t);SA(e)},Rs=(t,e=-1)=>{if(t>=49408)return-1;const n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(e>=0)ws(e);else return Sr>=0?pr[Sr--]:0;break;case n.STATUS:if(e>=0)console.log("SSC RESET"),gn=2,In=0;else{let s=16;return s|=Sr>=0?8:0,s}break;case n.COMMAND:if(e>=0){console.log("SSC COMMAND: 0x"+e.toString(16)),gn=e;break}else return gn;case n.CONTROL:if(e>=0){console.log("SSC CONTROL: 0x"+e.toString(16)),In=e;break}else return In;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},Fe=(t,e)=>String(t).padStart(e,"0"),ks=(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})(),ys=(t=!0,e=2)=>{if(!t)return;const s=49152+8+e*256;se(e,ks,s,Ts)},Ts=()=>{const t=new Date,e=Fe(t.getMonth()+1,2)+","+Fe(t.getDay(),2)+","+Fe(t.getDate(),2)+","+Fe(t.getHours(),2)+","+Fe(t.getMinutes(),2);for(let n=0;n<e.length;n++)R(512+n,e.charCodeAt(n)|128)},Ps=new Uint8Array([96,96,96,0,0,56,0,24,0,0,0,1,32,29,29,29,29,0,40,54,182,198,170,146,206,213,35,0,33,162,3,56,96,24,96,158,184,4,24,96,201,16,176,9,153,133,192,185,133,192,157,56,7,96,164,6,169,96,133,6,32,6,0,132,6,186,189,0,1,170,10,10,10,10,168,169,4,153,134,192,185,132,192,41,14,56,240,221,29,184,6,157,184,6,24,96,189,184,3,153,128,192,189,56,4,153,130,192,189,184,4,153,129,192,189,56,5,153,131,192,96,185,128,192,157,184,3,185,130,192,157,56,4,185,129,192,157,184,4,185,131,192,157,56,5,96,41,1,157,184,5,218,218,162,192,169,159,72,128,192,250,169,6,29,184,5,153,134,192,96,218,169,175,72,128,176,169,8,153,134,192,96,169,1,153,134,192,185,132,192,41,241,157,184,6,24,128,179,169,2,153,134,192,24,128,171,169,5,153,134,192,24,96,169,0,153,134,192,185,133,192,157,56,7,128,212,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214,214]),Jo=()=>{ut=0,lt=0,ue=0,le=0,Er=1023,Br=1023,Dr(0),j=0,Nt=0,fe=0,Me=0,Ue=0,gt=0,It=0,he=0};let ut=0,lt=0,ue=0,le=0,Er=1023,Br=1023,Ut=0,j=0,Nt=0,fe=0,Me=0,Ue=0,gt=0,It=0,he=0,_o=0,Qt=5;const ds=0,Cr=54,mr=55,Ls=56,bs=57,Fs=(t=!0,e=5)=>{if(!t)return;Qt=e;const n=49152+Qt*256;se(Qt,Ps,n+ds,Ns),$e(Qt,Ks),Jo()},Dr=t=>{Ut=t,S1(!t)},Ms=()=>{if(Ut&1){let t=!1;Ut&8&&(he|=8,t=!0),Ut&Nt&4&&(he|=4,t=!0),Ut&Nt&2&&(he|=2,t=!0),t&&cn(Qt,!0)}},Us=t=>{if(Ut&1)if(t.buttons>=0){switch(t.buttons){case 0:j&=-129;break;case 16:j|=128;break;case 1:j&=-17;break;case 17:j|=16;break}Nt|=j&128?4:0}else t.x>=0&&t.x<=1&&(ut=Math.round((Er-ue)*t.x+ue),Nt|=2),t.y>=0&&t.y<=1&&(lt=Math.round((Br-le)*t.y+le),Nt|=2)};let Ne=0,pn="",Vo=0,jo=0;const Ns=()=>{const t=192+Qt;E(mr)===t&&E(Cr)===0?Os():E(bs)===t&&E(Ls)===0&&Qs()},Qs=()=>{if(Ne===0){const t=192+Qt;Vo=E(mr),jo=E(Cr),R(mr,t),R(Cr,1);const e=(j&128)!==(fe&128);let n=0;j&128?n=e?2:1:n=e?3:4,E(49152)&128&&(n=-n),fe=j,pn=ut.toString()+","+lt.toString()+","+n.toString()}Ne>=pn.length?(A.Accum=141,Ne=0,R(mr,Vo),R(Cr,jo)):(A.Accum=pn.charCodeAt(Ne)|128,Ne++)},Os=()=>{switch(A.Accum){case 128:console.log("mouse off"),Dr(0);break;case 129:console.log("mouse on"),Dr(1);break}},Ks=(t,e)=>{if(t>=49408)return-1;const n=e<0,s={LOWX:0,HIGHX:1,LOWY:2,HIGHY:3,STATUS:4,MODE:5,COMMAND:6},c={INIT:0,READ:1,CLEAR:2,GETCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(n===!1)gt=gt&65280|e,console.log("lowx",gt);else return ut&255;break;case s.HIGHX:if(n===!1)gt=e<<8|gt&255,console.log("highx",gt);else return ut>>8&255;break;case s.LOWY:if(n===!1)It=It&65280|e,console.log("lowy",It);else return lt&255;break;case s.HIGHY:if(n===!1)It=e<<8|It&255,console.log("highy",It);else return lt>>8&255;break;case s.STATUS:return j;case s.MODE:if(n===!1)Dr(e),console.log("Mouse mode: 0x",Ut.toString(16));else return Ut;break;case s.COMMAND:if(n===!1)switch(_o=e,e){case c.INIT:console.log("cmd.init"),ut=0,lt=0,Me=0,Ue=0,ue=0,le=0,Er=1023,Br=1023,j=0,Nt=0;break;case c.READ:Nt=0,j&=-112,j|=fe>>1&64,j|=fe>>4&1,fe=j,(Me!==ut||Ue!==lt)&&(j|=32),Me=ut,Ue=lt;break;case c.CLEAR:console.log("cmd.clear"),ut=0,lt=0,Me=0,Ue=0;break;case c.SERVE:j&=-15,j|=he,he=0,cn(Qt,!1);break;case c.HOME:console.log("cmd.home"),ut=ue,lt=le;break;case c.CLAMPX:console.log("cmd.clampx"),ue=gt,Er=It;break;case c.CLAMPY:console.log("cmd.clampy"),le=gt,Br=It;break;case c.GETCLAMP:console.log("cmd.getclamp");break;case c.POS:console.log("cmd.pos"),ut=gt,lt=It;break}else return _o;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},Ho=(t=!0,e=4)=>{t&&($e(e,tA),Bs(js,e))},Sn=[0,128],En=[1,129],qs=[2,130],Ys=[3,131],ge=[4,132],Ie=[5,133],wr=[6,134],Bn=[7,135],Qe=[8,136],Oe=[9,137],xs=[10,138],Cn=[11,139],Xs=[12,140],te=[13,141],Ke=[14,142],$o=[16,145],zo=[17,145],pt=[18,146],mn=[32,160],wt=64,Ot=32,vo=(t=4)=>{for(let e=0;e<=255;e++)T(t,e,0);for(let e=0;e<=1;e++)Dn(t,e)},Ws=(t,e)=>(M(t,Ke[e])&wt)!==0,Gs=(t,e)=>(M(t,pt[e])&wt)!==0,t1=(t,e)=>(M(t,Cn[e])&wt)!==0,Zs=(t,e,n)=>{let s=M(t,ge[e])-n;if(T(t,ge[e],s),s<0){s=s%256+256,T(t,ge[e],s);let c=M(t,Ie[e]);if(c--,T(t,Ie[e],c),c<0&&(c+=256,T(t,Ie[e],c),Ws(t,e)&&(!Gs(t,e)||t1(t,e)))){const g=M(t,pt[e]);T(t,pt[e],g|wt);const p=M(t,te[e]);if(T(t,te[e],p|wt),Kt(t,e,-1),t1(t,e)){const u=M(t,Bn[e]),C=M(t,wr[e]);T(t,ge[e],C),T(t,Ie[e],u)}}}},Js=(t,e)=>(M(t,Ke[e])&Ot)!==0,_s=(t,e)=>(M(t,pt[e])&Ot)!==0,Vs=(t,e,n)=>{if(M(t,Cn[e])&Ot)return;let s=M(t,Qe[e])-n;if(T(t,Qe[e],s),s<0){s=s%256+256,T(t,Qe[e],s);let c=M(t,Oe[e]);if(c--,T(t,Oe[e],c),c<0&&(c+=256,T(t,Oe[e],c),Js(t,e)&&!_s(t,e))){const g=M(t,pt[e]);T(t,pt[e],g|Ot);const p=M(t,te[e]);T(t,te[e],p|Ot),Kt(t,e,-1)}}},e1=new Array(8).fill(0),js=t=>{const e=A.cycleCount-e1[t];for(let n=0;n<=1;n++)Zs(t,n,e),Vs(t,n,e);e1[t]=A.cycleCount},Hs=(t,e)=>{const n=[];for(let s=0;s<=15;s++)n[s]=M(t,mn[e]+s);return n},$s=(t,e)=>t.length===e.length&&t.every((n,s)=>n===e[s]),pe={slot:-1,chip:-1,params:[-1]};let Dn=(t,e)=>{const n=Hs(t,e);t===pe.slot&&e===pe.chip&&$s(n,pe.params)||(pe.slot=t,pe.chip=e,pe.params=n,pA({slot:t,chip:e,params:n}))};const zs=(t,e)=>{switch(M(t,Sn[e])&7){case 0:for(let s=0;s<=15;s++)T(t,mn[e]+s,0);Dn(t,e);break;case 7:T(t,zo[e],M(t,En[e]));break;case 6:{const s=M(t,zo[e]),c=M(t,En[e]);s>=0&&s<=15&&(T(t,mn[e]+s,c),Dn(t,e));break}}},Kt=(t,e,n)=>{let s=M(t,te[e]);switch(n>=0&&(s&=127-(n&127),T(t,te[e],s)),e){case 0:cn(t,s!==0);break;case 1:Ss(s!==0);break}},vs=(t,e,n)=>{let s=M(t,Ke[e]);n>=0&&(n=n&255,n&128?s|=n:s&=255-n),s|=128,T(t,Ke[e],s)},tA=(t,e=-1)=>{if(t<49408)return-1;const n=(t&3840)>>8,s=t&255,c=s&128?1:0;switch(s){case Sn[c]:e>=0&&(T(n,Sn[c],e),zs(n,c));break;case En[c]:case qs[c]:case Ys[c]:case xs[c]:case Cn[c]:case Xs[c]:T(n,s,e);break;case ge[c]:e>=0&&T(n,wr[c],e),Kt(n,c,wt);break;case Ie[c]:if(e>=0){T(n,Bn[c],e),T(n,ge[c],M(n,wr[c])),T(n,Ie[c],e);const g=M(n,pt[c]);T(n,pt[c],g&~wt),Kt(n,c,wt)}break;case wr[c]:e>=0&&(T(n,s,e),Kt(n,c,wt));break;case Bn[c]:e>=0&&T(n,s,e);break;case Qe[c]:e>=0&&T(n,$o[c],e),Kt(n,c,Ot);break;case Oe[c]:if(e>=0){T(n,Oe[c],e),T(n,Qe[c],M(n,$o[c]));const g=M(n,pt[c]);T(n,pt[c],g&~Ot),Kt(n,c,Ot)}break;case te[c]:e>=0&&Kt(n,c,e);break;case Ke[c]:vs(n,c,e);break}return-1};let r1=0,Rr=0,n1=!0,kr=0,o1=16.6881,i1=0,_=F.IDLE,Se=0,wn=!1,qt=0,ee=0;const qe=60,Ee=Array(qe);let yr=!1;const eA=()=>{yr=!0,Ms()},rA=()=>{yr=!1},nA=()=>{const t=JSON.parse(JSON.stringify(A)),e={};for(const s in B)e[s]=B[s].isSet;const n=xt.Buffer.from(K);return{s6502:t,softSwitches:e,memory:n.toString("base64")}},oA=t=>{const e=JSON.parse(JSON.stringify(t.s6502));di(e);const n=t.softSwitches;for(const s in n){const c=s;try{B[c].isSet=n[s]}catch{}}K.set(xt.Buffer.from(t.memory,"base64")),$t(),zn(!0)},Rn=(t=!1)=>({emulator:null,state6502:nA(),driveState:cs(t)}),kn=t=>{yn(),oA(t.state6502),us(t.driveState),Pr()};let s1=!1;const A1=()=>{s1||(s1=!0,ms(),ys(),Fs(!0,2),Ho(!0,4),Ho(!0,5),Hi())},iA=()=>{ls(),xr(),Jo(),vo(4),vo(5)},Tr=()=>{if(ze(0),Ri(),A1(),Wo.length>0){const t=sn(768,Wo.split(`
`));K.set(t,768)}yn()},yn=()=>{Es();for(const t in B){const e=t;B[e].isSet=!1}B.TEXT.isSet=!0,E(49282),go(),iA()},sA=t=>{n1=t,o1=n1?16.6881:0,h1()},a1=()=>{const t=(ee+qe-1)%qe;return t===qt||!Ee[t]?-1:t},c1=()=>{if(ee===qt)return-1;const t=(ee+1)%qe;return Ee[t]?t:-1},AA=()=>{const t=a1();t<0||(St(F.PAUSED),setTimeout(()=>{ee===qt&&(Ee[qt]=Rn()),ee=t,kn(Ee[t])},50))},aA=()=>{const t=c1();t<0||(St(F.PAUSED),setTimeout(()=>{ee=t,kn(Ee[t])},50))},u1=()=>{wn=!0},l1=()=>{Ir(),_===F.IDLE&&(Tr(),_=F.PAUSED),ln(!0),_=F.PAUSED,Pr()},cA=()=>{Ir(),_===F.IDLE&&(Tr(),_=F.PAUSED),E(A.PC)===32?(ln(!0),f1()):l1()},f1=()=>{Ir(),_===F.IDLE&&(Tr(),_=F.PAUSED),gs(),St(F.RUNNING)},h1=()=>{Se=0,Rr=performance.now(),r1=Rr},St=t=>{A1(),_=t,(_===F.PAUSED||_===F.RUNNING)&&fs(_===F.RUNNING),Pr(),h1(),kr===0&&(kr=1,u1(),I1())},uA=(t,e,n)=>{const s=()=>{jr(t,e),n&&ht(t)};_===F.IDLE?(St(F.NEED_BOOT),setTimeout(()=>{St(F.NEED_RESET),setTimeout(()=>{s()},200)},200)):s()},lA=()=>"",Pr=()=>{const t={state:_,speed:kr,altChar:B.ALTCHARSET.isSet,noDelayMode:!B.COLUMN80.isSet&&!B.AN3.isSet,textPage:Vr(),lores:Vr(!0),hires:Ti(),zeroPageStack:lA(),button0:B.PB0.isSet,button1:B.PB1.isSet,canGoBackward:a1()>=0,canGoForward:c1()>=0};fA(t)},g1=()=>{const t=performance.now();if(i1=t-Rr,i1<o1||(Rr=t,_===F.IDLE||_===F.PAUSED))return;_===F.NEED_BOOT?(Tr(),St(F.RUNNING)):_===F.NEED_RESET&&(yn(),St(F.RUNNING));let e=0;for(;;){const n=ln();if(n<0)break;if(e+=n,e>=12480&&yr===!1&&eA(),e>=17030){rA();break}}Se++,kr=Math.round(Se*1703/(performance.now()-r1))/100,Se%2&&($1(),Pr()),wn&&(wn=!1,Ee[qt]=Rn(),qt=(qt+1)%qe,ee=qt)},I1=()=>{g1();const t=Se+1;for(;_===F.RUNNING&&Se!==t;)g1();setTimeout(I1,_===F.RUNNING?0:20)},Et=(t,e)=>{self.postMessage({msg:t,payload:e})},fA=t=>{Et(at.MACHINE_STATE,t)},hA=t=>{Et(at.CLICK,t)},gA=t=>{Et(at.DRIVE_PROPS,t)},Be=t=>{Et(at.DRIVE_SOUND,t)},IA=t=>{Et(at.SAVE_STATE,t)},Tn=t=>{Et(at.RUMBLE,t)},p1=t=>{Et(at.HELP_TEXT,t)},S1=t=>{Et(at.SHOW_MOUSE,t)},pA=t=>{Et(at.MBOARD_SOUND,t)},SA=t=>{Et(at.COMM_DATA,t)};self.onmessage=t=>{switch(t.data.msg){case W.STATE:St(t.data.payload);break;case W.DEBUG:Ir(t.data.payload);break;case W.BREAKPOINT:Is(t.data.payload);break;case W.STEP_INTO:l1();break;case W.STEP_OVER:cA();break;case W.STEP_OUT:f1();break;case W.SPEED:sA(t.data.payload);break;case W.TIME_TRAVEL:t.data.payload==="FORWARD"?aA():AA();break;case W.RESTORE_STATE:kn(t.data.payload);break;case W.KEYPRESS:hi(t.data.payload);break;case W.MOUSEEVENT:Us(t.data.payload);break;case W.PASTE_TEXT:gi(t.data.payload);break;case W.APPLE_PRESS:Zn(!0,t.data.payload);break;case W.APPLE_RELEASE:Zn(!1,t.data.payload);break;case W.GET_SAVE_STATE:IA(Rn(!0));break;case W.DRIVE_PROPS:{const e=t.data.payload;hs(e);break}case W.GAMEPAD:j1(t.data.payload);break;case W.SET_BINARY_BLOCK:{const e=t.data.payload;uA(e.address,e.data,e.run);break}case W.COMM_DATA:Ds(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${t.data.msg}`);break}}})();
