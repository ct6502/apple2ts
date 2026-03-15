(function(){"use strict";var br={},He={},Vo;function gi(){if(Vo)return He;Vo=1,He.byteLength=l,He.toByteArray=d,He.fromByteArray=N;for(var A=[],e=[],t=typeof Uint8Array<"u"?Uint8Array:Array,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,I=n.length;i<I;++i)A[i]=n[i],e[n.charCodeAt(i)]=i;e[45]=62,e[95]=63;function C(T){var Y=T.length;if(Y%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var j=T.indexOf("=");j===-1&&(j=Y);var pA=j===Y?0:4-j%4;return[j,pA]}function l(T){var Y=C(T),j=Y[0],pA=Y[1];return(j+pA)*3/4-pA}function D(T,Y,j){return(Y+j)*3/4-j}function d(T){var Y,j=C(T),pA=j[0],EA=j[1],aA=new t(D(T,pA,EA)),kA=0,be=EA>0?pA-4:pA,oA;for(oA=0;oA<be;oA+=4)Y=e[T.charCodeAt(oA)]<<18|e[T.charCodeAt(oA+1)]<<12|e[T.charCodeAt(oA+2)]<<6|e[T.charCodeAt(oA+3)],aA[kA++]=Y>>16&255,aA[kA++]=Y>>8&255,aA[kA++]=Y&255;return EA===2&&(Y=e[T.charCodeAt(oA)]<<2|e[T.charCodeAt(oA+1)]>>4,aA[kA++]=Y&255),EA===1&&(Y=e[T.charCodeAt(oA)]<<10|e[T.charCodeAt(oA+1)]<<4|e[T.charCodeAt(oA+2)]>>2,aA[kA++]=Y>>8&255,aA[kA++]=Y&255),aA}function m(T){return A[T>>18&63]+A[T>>12&63]+A[T>>6&63]+A[T&63]}function Q(T,Y,j){for(var pA,EA=[],aA=Y;aA<j;aA+=3)pA=(T[aA]<<16&16711680)+(T[aA+1]<<8&65280)+(T[aA+2]&255),EA.push(m(pA));return EA.join("")}function N(T){for(var Y,j=T.length,pA=j%3,EA=[],aA=16383,kA=0,be=j-pA;kA<be;kA+=aA)EA.push(Q(T,kA,kA+aA>be?be:kA+aA));return pA===1?(Y=T[j-1],EA.push(A[Y>>2]+A[Y<<4&63]+"==")):pA===2&&(Y=(T[j-2]<<8)+T[j-1],EA.push(A[Y>>10]+A[Y>>4&63]+A[Y<<2&63]+"=")),EA.join("")}return He}var Tt={};var Jo;function pi(){return Jo||(Jo=1,Tt.read=function(A,e,t,n,i){var I,C,l=i*8-n-1,D=(1<<l)-1,d=D>>1,m=-7,Q=t?i-1:0,N=t?-1:1,T=A[e+Q];for(Q+=N,I=T&(1<<-m)-1,T>>=-m,m+=l;m>0;I=I*256+A[e+Q],Q+=N,m-=8);for(C=I&(1<<-m)-1,I>>=-m,m+=n;m>0;C=C*256+A[e+Q],Q+=N,m-=8);if(I===0)I=1-d;else{if(I===D)return C?NaN:(T?-1:1)*(1/0);C=C+Math.pow(2,n),I=I-d}return(T?-1:1)*C*Math.pow(2,I-n)},Tt.write=function(A,e,t,n,i,I){var C,l,D,d=I*8-i-1,m=(1<<d)-1,Q=m>>1,N=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,T=n?0:I-1,Y=n?1:-1,j=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(l=isNaN(e)?1:0,C=m):(C=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-C))<1&&(C--,D*=2),C+Q>=1?e+=N/D:e+=N*Math.pow(2,1-Q),e*D>=2&&(C++,D/=2),C+Q>=m?(l=0,C=m):C+Q>=1?(l=(e*D-1)*Math.pow(2,i),C=C+Q):(l=e*Math.pow(2,Q-1)*Math.pow(2,i),C=0));i>=8;A[t+T]=l&255,T+=Y,l/=256,i-=8);for(C=C<<i|l,d+=i;d>0;A[t+T]=C&255,T+=Y,C/=256,d-=8);A[t+T-Y]|=j*128}),Tt}var jo;function Ci(){return jo||(jo=1,(function(A){const e=gi(),t=pi(),n=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;A.Buffer=l,A.SlowBuffer=aA,A.INSPECT_MAX_BYTES=50;const i=2147483647;A.kMaxLength=i,l.TYPED_ARRAY_SUPPORT=I(),!l.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function I(){try{const a=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(a,r),a.foo()===42}catch{return!1}}Object.defineProperty(l.prototype,"parent",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.buffer}}),Object.defineProperty(l.prototype,"offset",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.byteOffset}});function C(a){if(a>i)throw new RangeError('The value "'+a+'" is invalid for option "size"');const r=new Uint8Array(a);return Object.setPrototypeOf(r,l.prototype),r}function l(a,r,o){if(typeof a=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return Q(a)}return D(a,r,o)}l.poolSize=8192;function D(a,r,o){if(typeof a=="string")return N(a,r);if(ArrayBuffer.isView(a))return Y(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(ZA(a,ArrayBuffer)||a&&ZA(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(ZA(a,SharedArrayBuffer)||a&&ZA(a.buffer,SharedArrayBuffer)))return j(a,r,o);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const u=a.valueOf&&a.valueOf();if(u!=null&&u!==a)return l.from(u,r,o);const g=pA(a);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return l.from(a[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}l.from=function(a,r,o){return D(a,r,o)},Object.setPrototypeOf(l.prototype,Uint8Array.prototype),Object.setPrototypeOf(l,Uint8Array);function d(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function m(a,r,o){return d(a),a<=0?C(a):r!==void 0?typeof o=="string"?C(a).fill(r,o):C(a).fill(r):C(a)}l.alloc=function(a,r,o){return m(a,r,o)};function Q(a){return d(a),C(a<0?0:EA(a)|0)}l.allocUnsafe=function(a){return Q(a)},l.allocUnsafeSlow=function(a){return Q(a)};function N(a,r){if((typeof r!="string"||r==="")&&(r="utf8"),!l.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=kA(a,r)|0;let u=C(o);const g=u.write(a,r);return g!==o&&(u=u.slice(0,g)),u}function T(a){const r=a.length<0?0:EA(a.length)|0,o=C(r);for(let u=0;u<r;u+=1)o[u]=a[u]&255;return o}function Y(a){if(ZA(a,Uint8Array)){const r=new Uint8Array(a);return j(r.buffer,r.byteOffset,r.byteLength)}return T(a)}function j(a,r,o){if(r<0||a.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let u;return r===void 0&&o===void 0?u=new Uint8Array(a):o===void 0?u=new Uint8Array(a,r):u=new Uint8Array(a,r,o),Object.setPrototypeOf(u,l.prototype),u}function pA(a){if(l.isBuffer(a)){const r=EA(a.length)|0,o=C(r);return o.length===0||a.copy(o,0,0,r),o}if(a.length!==void 0)return typeof a.length!="number"||xo(a.length)?C(0):T(a);if(a.type==="Buffer"&&Array.isArray(a.data))return T(a.data)}function EA(a){if(a>=i)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i.toString(16)+" bytes");return a|0}function aA(a){return+a!=a&&(a=0),l.alloc(+a)}l.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==l.prototype},l.compare=function(r,o){if(ZA(r,Uint8Array)&&(r=l.from(r,r.offset,r.byteLength)),ZA(o,Uint8Array)&&(o=l.from(o,o.offset,o.byteLength)),!l.isBuffer(r)||!l.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let u=r.length,g=o.length;for(let S=0,E=Math.min(u,g);S<E;++S)if(r[S]!==o[S]){u=r[S],g=o[S];break}return u<g?-1:g<u?1:0},l.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},l.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return l.alloc(0);let u;if(o===void 0)for(o=0,u=0;u<r.length;++u)o+=r[u].length;const g=l.allocUnsafe(o);let S=0;for(u=0;u<r.length;++u){let E=r[u];if(ZA(E,Uint8Array))S+E.length>g.length?(l.isBuffer(E)||(E=l.from(E)),E.copy(g,S)):Uint8Array.prototype.set.call(g,E,S);else if(l.isBuffer(E))E.copy(g,S);else throw new TypeError('"list" argument must be an Array of Buffers');S+=E.length}return g};function kA(a,r){if(l.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||ZA(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const o=a.length,u=arguments.length>2&&arguments[2]===!0;if(!u&&o===0)return 0;let g=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Xo(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return hi(a).length;default:if(g)return u?-1:Xo(a).length;r=(""+r).toLowerCase(),g=!0}}l.byteLength=kA;function be(a,r,o){let u=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(a||(a="utf8");;)switch(a){case"hex":return U0(this,r,o);case"utf8":case"utf-8":return oi(this,r,o);case"ascii":return q0(this,r,o);case"latin1":case"binary":return K0(this,r,o);case"base64":return b0(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Y0(this,r,o);default:if(u)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),u=!0}}l.prototype._isBuffer=!0;function oA(a,r,o){const u=a[r];a[r]=a[o],a[o]=u}l.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)oA(this,o,o+1);return this},l.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)oA(this,o,o+3),oA(this,o+1,o+2);return this},l.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)oA(this,o,o+7),oA(this,o+1,o+6),oA(this,o+2,o+5),oA(this,o+3,o+4);return this},l.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?oi(this,0,r):be.apply(this,arguments)},l.prototype.toLocaleString=l.prototype.toString,l.prototype.equals=function(r){if(!l.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:l.compare(this,r)===0},l.prototype.inspect=function(){let r="";const o=A.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},n&&(l.prototype[n]=l.prototype.inspect),l.prototype.compare=function(r,o,u,g,S){if(ZA(r,Uint8Array)&&(r=l.from(r,r.offset,r.byteLength)),!l.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),u===void 0&&(u=r?r.length:0),g===void 0&&(g=0),S===void 0&&(S=this.length),o<0||u>r.length||g<0||S>this.length)throw new RangeError("out of range index");if(g>=S&&o>=u)return 0;if(g>=S)return-1;if(o>=u)return 1;if(o>>>=0,u>>>=0,g>>>=0,S>>>=0,this===r)return 0;let E=S-g,b=u-o;const AA=Math.min(E,b),z=this.slice(g,S),eA=r.slice(o,u);for(let H=0;H<AA;++H)if(z[H]!==eA[H]){E=z[H],b=eA[H];break}return E<b?-1:b<E?1:0};function ti(a,r,o,u,g){if(a.length===0)return-1;if(typeof o=="string"?(u=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,xo(o)&&(o=g?0:a.length-1),o<0&&(o=a.length+o),o>=a.length){if(g)return-1;o=a.length-1}else if(o<0)if(g)o=0;else return-1;if(typeof r=="string"&&(r=l.from(r,u)),l.isBuffer(r))return r.length===0?-1:ri(a,r,o,u,g);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(a,r,o):Uint8Array.prototype.lastIndexOf.call(a,r,o):ri(a,[r],o,u,g);throw new TypeError("val must be string, number or Buffer")}function ri(a,r,o,u,g){let S=1,E=a.length,b=r.length;if(u!==void 0&&(u=String(u).toLowerCase(),u==="ucs2"||u==="ucs-2"||u==="utf16le"||u==="utf-16le")){if(a.length<2||r.length<2)return-1;S=2,E/=2,b/=2,o/=2}function AA(eA,H){return S===1?eA[H]:eA.readUInt16BE(H*S)}let z;if(g){let eA=-1;for(z=o;z<E;z++)if(AA(a,z)===AA(r,eA===-1?0:z-eA)){if(eA===-1&&(eA=z),z-eA+1===b)return eA*S}else eA!==-1&&(z-=z-eA),eA=-1}else for(o+b>E&&(o=E-b),z=o;z>=0;z--){let eA=!0;for(let H=0;H<b;H++)if(AA(a,z+H)!==AA(r,H)){eA=!1;break}if(eA)return z}return-1}l.prototype.includes=function(r,o,u){return this.indexOf(r,o,u)!==-1},l.prototype.indexOf=function(r,o,u){return ti(this,r,o,u,!0)},l.prototype.lastIndexOf=function(r,o,u){return ti(this,r,o,u,!1)};function R0(a,r,o,u){o=Number(o)||0;const g=a.length-o;u?(u=Number(u),u>g&&(u=g)):u=g;const S=r.length;u>S/2&&(u=S/2);let E;for(E=0;E<u;++E){const b=parseInt(r.substr(E*2,2),16);if(xo(b))return E;a[o+E]=b}return E}function P0(a,r,o,u){return Lr(Xo(r,a.length-o),a,o,u)}function Q0(a,r,o,u){return Lr(G0(r),a,o,u)}function F0(a,r,o,u){return Lr(hi(r),a,o,u)}function L0(a,r,o,u){return Lr(_0(r,a.length-o),a,o,u)}l.prototype.write=function(r,o,u,g){if(o===void 0)g="utf8",u=this.length,o=0;else if(u===void 0&&typeof o=="string")g=o,u=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(u)?(u=u>>>0,g===void 0&&(g="utf8")):(g=u,u=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const S=this.length-o;if((u===void 0||u>S)&&(u=S),r.length>0&&(u<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let E=!1;for(;;)switch(g){case"hex":return R0(this,r,o,u);case"utf8":case"utf-8":return P0(this,r,o,u);case"ascii":case"latin1":case"binary":return Q0(this,r,o,u);case"base64":return F0(this,r,o,u);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return L0(this,r,o,u);default:if(E)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),E=!0}},l.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function b0(a,r,o){return r===0&&o===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(r,o))}function oi(a,r,o){o=Math.min(a.length,o);const u=[];let g=r;for(;g<o;){const S=a[g];let E=null,b=S>239?4:S>223?3:S>191?2:1;if(g+b<=o){let AA,z,eA,H;switch(b){case 1:S<128&&(E=S);break;case 2:AA=a[g+1],(AA&192)===128&&(H=(S&31)<<6|AA&63,H>127&&(E=H));break;case 3:AA=a[g+1],z=a[g+2],(AA&192)===128&&(z&192)===128&&(H=(S&15)<<12|(AA&63)<<6|z&63,H>2047&&(H<55296||H>57343)&&(E=H));break;case 4:AA=a[g+1],z=a[g+2],eA=a[g+3],(AA&192)===128&&(z&192)===128&&(eA&192)===128&&(H=(S&15)<<18|(AA&63)<<12|(z&63)<<6|eA&63,H>65535&&H<1114112&&(E=H))}}E===null?(E=65533,b=1):E>65535&&(E-=65536,u.push(E>>>10&1023|55296),E=56320|E&1023),u.push(E),g+=b}return M0(u)}const ni=4096;function M0(a){const r=a.length;if(r<=ni)return String.fromCharCode.apply(String,a);let o="",u=0;for(;u<r;)o+=String.fromCharCode.apply(String,a.slice(u,u+=ni));return o}function q0(a,r,o){let u="";o=Math.min(a.length,o);for(let g=r;g<o;++g)u+=String.fromCharCode(a[g]&127);return u}function K0(a,r,o){let u="";o=Math.min(a.length,o);for(let g=r;g<o;++g)u+=String.fromCharCode(a[g]);return u}function U0(a,r,o){const u=a.length;(!r||r<0)&&(r=0),(!o||o<0||o>u)&&(o=u);let g="";for(let S=r;S<o;++S)g+=Z0[a[S]];return g}function Y0(a,r,o){const u=a.slice(r,o);let g="";for(let S=0;S<u.length-1;S+=2)g+=String.fromCharCode(u[S]+u[S+1]*256);return g}l.prototype.slice=function(r,o){const u=this.length;r=~~r,o=o===void 0?u:~~o,r<0?(r+=u,r<0&&(r=0)):r>u&&(r=u),o<0?(o+=u,o<0&&(o=0)):o>u&&(o=u),o<r&&(o=r);const g=this.subarray(r,o);return Object.setPrototypeOf(g,l.prototype),g};function hA(a,r,o){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+r>o)throw new RangeError("Trying to access beyond buffer length")}l.prototype.readUintLE=l.prototype.readUIntLE=function(r,o,u){r=r>>>0,o=o>>>0,u||hA(r,o,this.length);let g=this[r],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[r+E]*S;return g},l.prototype.readUintBE=l.prototype.readUIntBE=function(r,o,u){r=r>>>0,o=o>>>0,u||hA(r,o,this.length);let g=this[r+--o],S=1;for(;o>0&&(S*=256);)g+=this[r+--o]*S;return g},l.prototype.readUint8=l.prototype.readUInt8=function(r,o){return r=r>>>0,o||hA(r,1,this.length),this[r]},l.prototype.readUint16LE=l.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||hA(r,2,this.length),this[r]|this[r+1]<<8},l.prototype.readUint16BE=l.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||hA(r,2,this.length),this[r]<<8|this[r+1]},l.prototype.readUint32LE=l.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},l.prototype.readUint32BE=l.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},l.prototype.readBigUInt64LE=pe(function(r){r=r>>>0,je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&wt(r,this.length-8);const g=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,S=this[++r]+this[++r]*2**8+this[++r]*2**16+u*2**24;return BigInt(g)+(BigInt(S)<<BigInt(32))}),l.prototype.readBigUInt64BE=pe(function(r){r=r>>>0,je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&wt(r,this.length-8);const g=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],S=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+u;return(BigInt(g)<<BigInt(32))+BigInt(S)}),l.prototype.readIntLE=function(r,o,u){r=r>>>0,o=o>>>0,u||hA(r,o,this.length);let g=this[r],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[r+E]*S;return S*=128,g>=S&&(g-=Math.pow(2,8*o)),g},l.prototype.readIntBE=function(r,o,u){r=r>>>0,o=o>>>0,u||hA(r,o,this.length);let g=o,S=1,E=this[r+--g];for(;g>0&&(S*=256);)E+=this[r+--g]*S;return S*=128,E>=S&&(E-=Math.pow(2,8*o)),E},l.prototype.readInt8=function(r,o){return r=r>>>0,o||hA(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},l.prototype.readInt16LE=function(r,o){r=r>>>0,o||hA(r,2,this.length);const u=this[r]|this[r+1]<<8;return u&32768?u|4294901760:u},l.prototype.readInt16BE=function(r,o){r=r>>>0,o||hA(r,2,this.length);const u=this[r+1]|this[r]<<8;return u&32768?u|4294901760:u},l.prototype.readInt32LE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},l.prototype.readInt32BE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},l.prototype.readBigInt64LE=pe(function(r){r=r>>>0,je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&wt(r,this.length-8);const g=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(u<<24);return(BigInt(g)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),l.prototype.readBigInt64BE=pe(function(r){r=r>>>0,je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&wt(r,this.length-8);const g=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(g)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+u)}),l.prototype.readFloatLE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),t.read(this,r,!0,23,4)},l.prototype.readFloatBE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),t.read(this,r,!1,23,4)},l.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||hA(r,8,this.length),t.read(this,r,!0,52,8)},l.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||hA(r,8,this.length),t.read(this,r,!1,52,8)};function yA(a,r,o,u,g,S){if(!l.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>g||r<S)throw new RangeError('"value" argument is out of bounds');if(o+u>a.length)throw new RangeError("Index out of range")}l.prototype.writeUintLE=l.prototype.writeUIntLE=function(r,o,u,g){if(r=+r,o=o>>>0,u=u>>>0,!g){const b=Math.pow(2,8*u)-1;yA(this,r,o,u,b,0)}let S=1,E=0;for(this[o]=r&255;++E<u&&(S*=256);)this[o+E]=r/S&255;return o+u},l.prototype.writeUintBE=l.prototype.writeUIntBE=function(r,o,u,g){if(r=+r,o=o>>>0,u=u>>>0,!g){const b=Math.pow(2,8*u)-1;yA(this,r,o,u,b,0)}let S=u-1,E=1;for(this[o+S]=r&255;--S>=0&&(E*=256);)this[o+S]=r/E&255;return o+u},l.prototype.writeUint8=l.prototype.writeUInt8=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,1,255,0),this[o]=r&255,o+1},l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function si(a,r,o,u,g){Ii(r,u,g,a,o,7);let S=Number(r&BigInt(4294967295));a[o++]=S,S=S>>8,a[o++]=S,S=S>>8,a[o++]=S,S=S>>8,a[o++]=S;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,o}function ii(a,r,o,u,g){Ii(r,u,g,a,o,7);let S=Number(r&BigInt(4294967295));a[o+7]=S,S=S>>8,a[o+6]=S,S=S>>8,a[o+5]=S,S=S>>8,a[o+4]=S;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o+3]=E,E=E>>8,a[o+2]=E,E=E>>8,a[o+1]=E,E=E>>8,a[o]=E,o+8}l.prototype.writeBigUInt64LE=pe(function(r,o=0){return si(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeBigUInt64BE=pe(function(r,o=0){return ii(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeIntLE=function(r,o,u,g){if(r=+r,o=o>>>0,!g){const AA=Math.pow(2,8*u-1);yA(this,r,o,u,AA-1,-AA)}let S=0,E=1,b=0;for(this[o]=r&255;++S<u&&(E*=256);)r<0&&b===0&&this[o+S-1]!==0&&(b=1),this[o+S]=(r/E>>0)-b&255;return o+u},l.prototype.writeIntBE=function(r,o,u,g){if(r=+r,o=o>>>0,!g){const AA=Math.pow(2,8*u-1);yA(this,r,o,u,AA-1,-AA)}let S=u-1,E=1,b=0;for(this[o+S]=r&255;--S>=0&&(E*=256);)r<0&&b===0&&this[o+S+1]!==0&&(b=1),this[o+S]=(r/E>>0)-b&255;return o+u},l.prototype.writeInt8=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},l.prototype.writeInt16LE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},l.prototype.writeInt16BE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},l.prototype.writeInt32LE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},l.prototype.writeInt32BE=function(r,o,u){return r=+r,o=o>>>0,u||yA(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},l.prototype.writeBigInt64LE=pe(function(r,o=0){return si(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),l.prototype.writeBigInt64BE=pe(function(r,o=0){return ii(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function ai(a,r,o,u,g,S){if(o+u>a.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function ci(a,r,o,u,g){return r=+r,o=o>>>0,g||ai(a,r,o,4),t.write(a,r,o,u,23,4),o+4}l.prototype.writeFloatLE=function(r,o,u){return ci(this,r,o,!0,u)},l.prototype.writeFloatBE=function(r,o,u){return ci(this,r,o,!1,u)};function li(a,r,o,u,g){return r=+r,o=o>>>0,g||ai(a,r,o,8),t.write(a,r,o,u,52,8),o+8}l.prototype.writeDoubleLE=function(r,o,u){return li(this,r,o,!0,u)},l.prototype.writeDoubleBE=function(r,o,u){return li(this,r,o,!1,u)},l.prototype.copy=function(r,o,u,g){if(!l.isBuffer(r))throw new TypeError("argument should be a Buffer");if(u||(u=0),!g&&g!==0&&(g=this.length),o>=r.length&&(o=r.length),o||(o=0),g>0&&g<u&&(g=u),g===u||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(u<0||u>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),r.length-o<g-u&&(g=r.length-o+u);const S=g-u;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,u,g):Uint8Array.prototype.set.call(r,this.subarray(u,g),o),S},l.prototype.fill=function(r,o,u,g){if(typeof r=="string"){if(typeof o=="string"?(g=o,o=0,u=this.length):typeof u=="string"&&(g=u,u=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!l.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(r.length===1){const E=r.charCodeAt(0);(g==="utf8"&&E<128||g==="latin1")&&(r=E)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<u)throw new RangeError("Out of range index");if(u<=o)return this;o=o>>>0,u=u===void 0?this.length:u>>>0,r||(r=0);let S;if(typeof r=="number")for(S=o;S<u;++S)this[S]=r;else{const E=l.isBuffer(r)?r:l.from(r,g),b=E.length;if(b===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(S=0;S<u-o;++S)this[S+o]=E[S%b]}return this};const Je={};function Zo(a,r,o){Je[a]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}Zo("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Zo("ERR_INVALID_ARG_TYPE",function(a,r){return`The "${a}" argument must be of type number. Received type ${typeof r}`},TypeError),Zo("ERR_OUT_OF_RANGE",function(a,r,o){let u=`The value of "${a}" is out of range.`,g=o;return Number.isInteger(o)&&Math.abs(o)>2**32?g=ui(String(o)):typeof o=="bigint"&&(g=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(g=ui(g)),g+="n"),u+=` It must be ${r}. Received ${g}`,u},RangeError);function ui(a){let r="",o=a.length;const u=a[0]==="-"?1:0;for(;o>=u+4;o-=3)r=`_${a.slice(o-3,o)}${r}`;return`${a.slice(0,o)}${r}`}function O0(a,r,o){je(r,"offset"),(a[r]===void 0||a[r+o]===void 0)&&wt(r,a.length-(o+1))}function Ii(a,r,o,u,g,S){if(a>o||a<r){const E=typeof r=="bigint"?"n":"";let b;throw r===0||r===BigInt(0)?b=`>= 0${E} and < 2${E} ** ${(S+1)*8}${E}`:b=`>= -(2${E} ** ${(S+1)*8-1}${E}) and < 2 ** ${(S+1)*8-1}${E}`,new Je.ERR_OUT_OF_RANGE("value",b,a)}O0(u,g,S)}function je(a,r){if(typeof a!="number")throw new Je.ERR_INVALID_ARG_TYPE(r,"number",a)}function wt(a,r,o){throw Math.floor(a)!==a?(je(a,o),new Je.ERR_OUT_OF_RANGE("offset","an integer",a)):r<0?new Je.ERR_BUFFER_OUT_OF_BOUNDS:new Je.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${r}`,a)}const W0=/[^+/0-9A-Za-z-_]/g;function N0(a){if(a=a.split("=")[0],a=a.trim().replace(W0,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function Xo(a,r){r=r||1/0;let o;const u=a.length;let g=null;const S=[];for(let E=0;E<u;++E){if(o=a.charCodeAt(E),o>55295&&o<57344){if(!g){if(o>56319){(r-=3)>-1&&S.push(239,191,189);continue}else if(E+1===u){(r-=3)>-1&&S.push(239,191,189);continue}g=o;continue}if(o<56320){(r-=3)>-1&&S.push(239,191,189),g=o;continue}o=(g-55296<<10|o-56320)+65536}else g&&(r-=3)>-1&&S.push(239,191,189);if(g=null,o<128){if((r-=1)<0)break;S.push(o)}else if(o<2048){if((r-=2)<0)break;S.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;S.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;S.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return S}function G0(a){const r=[];for(let o=0;o<a.length;++o)r.push(a.charCodeAt(o)&255);return r}function _0(a,r){let o,u,g;const S=[];for(let E=0;E<a.length&&!((r-=2)<0);++E)o=a.charCodeAt(E),u=o>>8,g=o%256,S.push(g),S.push(u);return S}function hi(a){return e.toByteArray(N0(a))}function Lr(a,r,o,u){let g;for(g=0;g<u&&!(g+o>=r.length||g>=a.length);++g)r[g+o]=a[g];return g}function ZA(a,r){return a instanceof r||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===r.name}function xo(a){return a!==a}const Z0=(function(){const a="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const u=o*16;for(let g=0;g<16;++g)r[u+g]=a[o]+a[g]}return r})();function pe(a){return typeof BigInt>"u"?X0:a}function X0(){throw new Error("BigInt not supported")}})(br)),br}var Me=Ci();const Si=!1,fi=30,Ei=".2mg,.hdv,.po,.2meg",ve=256,qe=383,ze=256*ve,XA=256*qe;var G=(A=>(A[A.IDLE=0]="IDLE",A[A.RUNNING=-1]="RUNNING",A[A.PAUSED=-2]="PAUSED",A[A.NEED_BOOT=-3]="NEED_BOOT",A[A.NEED_RESET=-4]="NEED_RESET",A))(G||{}),CA=(A=>(A[A.MACHINE_STATE=0]="MACHINE_STATE",A[A.CLICK=1]="CLICK",A[A.DRIVE_PROPS=2]="DRIVE_PROPS",A[A.DRIVE_SOUND=3]="DRIVE_SOUND",A[A.SAVE_STATE=4]="SAVE_STATE",A[A.RUMBLE=5]="RUMBLE",A[A.HELP_TEXT=6]="HELP_TEXT",A[A.SHOW_APPLE_MOUSE=7]="SHOW_APPLE_MOUSE",A[A.MBOARD_SOUND=8]="MBOARD_SOUND",A[A.COMM_DATA=9]="COMM_DATA",A[A.MIDI_DATA=10]="MIDI_DATA",A[A.ENHANCED_MIDI=11]="ENHANCED_MIDI",A[A.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",A[A.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",A[A.INSTRUCTIONS=14]="INSTRUCTIONS",A))(CA||{}),L=(A=>(A[A.APPLE_PRESS=0]="APPLE_PRESS",A[A.APPLE_RELEASE=1]="APPLE_RELEASE",A[A.APP_MODE=2]="APP_MODE",A[A.BASIC_STEP=3]="BASIC_STEP",A[A.BREAKPOINTS=4]="BREAKPOINTS",A[A.COMM_DATA=5]="COMM_DATA",A[A.DEBUG=6]="DEBUG",A[A.DRIVE_NEW_DATA=7]="DRIVE_NEW_DATA",A[A.DRIVE_PROPS=8]="DRIVE_PROPS",A[A.GAMEPAD=9]="GAMEPAD",A[A.GET_SAVE_STATE=10]="GET_SAVE_STATE",A[A.GET_SAVE_STATE_SNAPSHOTS=11]="GET_SAVE_STATE_SNAPSHOTS",A[A.KEYPRESS=12]="KEYPRESS",A[A.KEYRELEASE=13]="KEYRELEASE",A[A.MACHINE_NAME=14]="MACHINE_NAME",A[A.MIDI_DATA=15]="MIDI_DATA",A[A.MOUSEEVENT=16]="MOUSEEVENT",A[A.PASTE_TEXT=17]="PASTE_TEXT",A[A.RAMWORKS=18]="RAMWORKS",A[A.RESTORE_STATE=19]="RESTORE_STATE",A[A.RUN_MODE=20]="RUN_MODE",A[A.SET_BINARY_BLOCK=21]="SET_BINARY_BLOCK",A[A.SET_CYCLECOUNT=22]="SET_CYCLECOUNT",A[A.SET_MEMORY=23]="SET_MEMORY",A[A.SHOW_DEBUG_TAB=24]="SHOW_DEBUG_TAB",A[A.SIRIUS_JOYPORT=25]="SIRIUS_JOYPORT",A[A.SOFTSWITCHES=26]="SOFTSWITCHES",A[A.SPEED=27]="SPEED",A[A.STATE6502=28]="STATE6502",A[A.STEP_INTO=29]="STEP_INTO",A[A.STEP_OUT=30]="STEP_OUT",A[A.STEP_OVER=31]="STEP_OVER",A[A.THUMBNAIL_IMAGE=32]="THUMBNAIL_IMAGE",A[A.TIME_TRAVEL_INDEX=33]="TIME_TRAVEL_INDEX",A[A.TIME_TRAVEL_SNAPSHOT=34]="TIME_TRAVEL_SNAPSHOT",A[A.TIME_TRAVEL_STEP=35]="TIME_TRAVEL_STEP",A[A.TRACING=36]="TRACING",A))(L||{}),Ce=(A=>(A[A.MOTOR_OFF=0]="MOTOR_OFF",A[A.MOTOR_ON=1]="MOTOR_ON",A[A.TRACK_END=2]="TRACK_END",A[A.TRACK_SEEK=3]="TRACK_SEEK",A))(Ce||{}),s=(A=>(A[A.IMPLIED=0]="IMPLIED",A[A.IMM=1]="IMM",A[A.ZP_REL=2]="ZP_REL",A[A.ZP_X=3]="ZP_X",A[A.ZP_Y=4]="ZP_Y",A[A.ABS=5]="ABS",A[A.ABS_X=6]="ABS_X",A[A.ABS_Y=7]="ABS_Y",A[A.IND_X=8]="IND_X",A[A.IND_Y=9]="IND_Y",A[A.IND=10]="IND",A))(s||{});const Bi=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),dt=A=>A.startsWith("B")&&A!=="BIT"&&A!=="BRK",M=(A,e=2)=>(A>255&&(e=4),("0000"+A.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const $e=A=>A.split("").map(e=>e.charCodeAt(0)),Di=A=>[A&255,A>>>8&255],Ho=A=>[A&255,A>>>8&255,A>>>16&255,A>>>24&255],mi=(A,e)=>{const t=A.lastIndexOf(".")+1;return A.substring(0,t)+e},Mr=new Uint32Array(256).fill(0),ki=()=>{let A;for(let e=0;e<256;e++){A=e;for(let t=0;t<8;t++)A=A&1?3988292384^A>>>1:A>>>1;Mr[e]=A}},wi=(A,e=0)=>{Mr[255]===0&&ki();let t=-1;for(let n=e;n<A.length;n++)t=t>>>8^Mr[(t^A[n])&255];return(t^-1)>>>0},Ti=(A,e)=>A+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),vo=A=>{const e=A.toLowerCase();return Ei.split(",").some(n=>e.endsWith(n))};let bA;const Se=Math.trunc(.00278*1020484);let qr=Se/2,Kr=Se/2,Ur=Se/2,Yr=Se/2,zo=0,$o=!1,An=!1,Or=!1,Wr=!1,yt=!1,en=!1,tn=!1;const At=()=>{Or=!0},et=()=>{Wr=!0},rn=()=>{yt=!0},Rt=A=>(A=Math.min(Math.max(A,-1),1),(A+1)*Se/2),Ae=(A,e)=>{switch(A){case 0:qr=Rt(e);break;case 1:Kr=Rt(e);break;case 2:Ur=Rt(e);break;case 3:Yr=Rt(e);break}},Nr=()=>{en=$o||Or,tn=An||Wr,f.PB0.isSet=en,f.PB1.isSet=tn||yt,f.PB2.isSet=yt},on=(A,e)=>{e?$o=A:An=A,Nr()},di=A=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),zo=A},Pt=A=>{const e=A-zo;Z(49252,e<qr?128:0),Z(49253,e<Kr?128:0),Z(49254,e<Ur?128:0),Z(49255,e<Yr?128:0)};let fe,Gr,nn=!1;const yi=A=>{bA=A,nn=!bA.length||!bA[0].buttons.length,fe=ra(),Gr=fe.gamepad?fe.gamepad:ea},sn=A=>A>-.01&&A<.01,Ri=(A,e)=>{sn(A)&&(A=0),sn(e)&&(e=0);const t=Math.sqrt(A*A+e*e),n=.95*(t===0?1:Math.max(Math.abs(A),Math.abs(e))/t);return A=Math.min(Math.max(-n,A),n),e=Math.min(Math.max(-n,e),n),A=(A+n)/(2*n),e=(e+n)/(2*n),[A,e]},an=(A,e)=>([A,e]=Ri(A,e),A=Math.trunc(Se*A),e=Math.trunc(Se*e),[A,e]),Pi=A=>{const[e,t]=an(A[0],A[1]),n=A.length>=6?A[5]:A[3],[i,I]=A.length>=4?an(A[2],n):[0,0];return[e,t,i,I]},cn=A=>{const e=fe.joystick?fe.joystick(bA[A].axes,nn):bA[A].axes,t=Pi(e);A===0?(qr=t[0],Kr=t[1],Or=!1,Wr=!1):(Ur=t[0],Yr=t[1],yt=!1);let n=!1;bA[A].buttons.forEach((i,I)=>{i&&(Gr(I,bA.length>1,A===1),n=!0)}),n||Gr(-1,bA.length>1,A===1),fe.rumble&&fe.rumble(),Nr()},Qi=()=>{bA&&bA.length>0&&(cn(0),bA.length>1&&cn(1))},Fi=A=>{switch(A){case 0:q("JL");break;case 1:q("G",200);break;case 2:_("M"),q("O");break;case 3:q("L");break;case 4:q("F");break;case 5:_("P"),q("T");break;case 6:break;case 7:break;case 8:q("Z");break;case 9:{const e=io();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:break;case 11:break;case 12:q("L");break;case 13:q("M");break;case 14:q("A");break;case 15:q("D");break;case-1:return}};let Ee=0,Be=0,De=!1;const Qt=.5,Li={address:24835,data:[173,198,9],keymap:{},joystick:A=>A[0]<-Qt?(Be=0,Ee===0||Ee>2?(Ee=0,_("A")):Ee===1&&De?q("W"):Ee===2&&De&&q("R"),Ee++,De=!1,A):A[0]>Qt?(Ee=0,Be===0||Be>2?(Be=0,_("D")):Be===1&&De?q("W"):Be===2&&De&&q("R"),Be++,De=!1,A):A[1]<-Qt?(q("C"),A):A[1]>Qt?(q("S"),A):(De=!0,A),gamepad:Fi,rumble:null,setup:null,helptext:`AZTEC
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
`},bi={address:25200,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
(c) 1984 Brøderbund Software
_____________________________________________
Joystick (Ctrl+J):   move
Button 0:   dig left
Button 1:   dig right

Keyboard (Ctrl+K):
   W
A     D
   S
Left arrow    dig left
Right arrow   dig right

Keyboard original controls:
   I
J     L
   K
U       dig left
O       dig right
ESC     pause game
_____________________________________________
Other Controls:
Ctrl+A        abort man
Ctrl+J        joystick mode
Ctrl+K        keyboard mode
Ctrl+R        reset game
Ctrl+S        toggle sound
Ctrl+X        flip joystick x-axis
Ctrl+Y        flip joystick y-axis
`},Mi={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:A=>{switch(A){case 0:_(" ");break;case 12:_("A");break;case 13:_("Z");break;case 14:_("\b");break;case 15:_("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},qi={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},Ki={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Go("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let _r=14,Zr=14;const Ui={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let A=B(182,!1);_r<40&&A<_r&&Fr({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),_r=A,A=B(183,!1),Zr<40&&A<Zr&&Fr({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Zr=A},setup:null,helptext:`KARATEKA
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
`},Yi={address:25078,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:()=>{k(46793,234),k(46794,234)},helptext:`Lode Runner by Doug Smith
(c) 1983 Brøderbund Software
_____________________________________________
Joystick (Ctrl+J):   move
Button 0:   dig left
Button 1:   dig right

Keyboard (Ctrl+K):
   W
A     D
   S
Left arrow    dig left
Right arrow   dig right

Keyboard original controls:
   I
J     L
   K
U       dig left
O       dig right
ESC     pause game
_____________________________________________
Other Controls:
Ctrl+A        abort man
Ctrl+J        joystick mode
Ctrl+K        keyboard mode
Ctrl+R        reset game
Ctrl+S        toggle sound
Ctrl+X        flip joystick x-axis
Ctrl+Y        flip joystick y-axis
Ctrl+Shift+6  next level (no high score)
Ctrl+Shift+2  add life (no high score)
_____________________________________________
Editor:
From demo mode, press Ctrl+E
E        edit
P        play
I        initialize
C        clear level
M        move (copy level)
S        clear high scores
I/J/K/M  move cursor
0-9      make shapes
Ctrl+S   save level
Ctrl+Q   quit editor
`},Oi=A=>{switch(A){case 0:q("A");break;case 1:q("C",50);break;case 2:q("O");break;case 3:q("T");break;case 4:q("\x1B");break;case 5:q("\r");break;case 6:break;case 7:break;case 8:_("N"),q("'");break;case 9:_("Y"),q("1");break;case 10:break;case 11:break;case 12:break;case 13:q(" ");break;case 14:break;case 15:q("	");break;case-1:return}},ee=.5,Wi={address:768,data:[141,74,3,132],keymap:{},gamepad:Oi,joystick:(A,e)=>{if(e)return A;const t=A[0]<-ee?"\b":A[0]>ee?"":"",n=A[1]<-ee?"\v":A[1]>ee?`
`:"";let i=t+n;return i||(i=A[2]<-ee?"L\b":A[2]>ee?"L":"",i||(i=A[3]<-ee?"L\v":A[3]>ee?`L
`:"")),i&&q(i,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},Ni={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},Gi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},_i={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},Zi={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&Fr({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{k(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},ln=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,Xi=A=>{switch(A){case 1:k(109,255);break;case 12:_("A");break;case 13:_("Z");break;case 14:_("\b");break;case 15:_("");break}},Ft=.75,xi=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{k(25025,173),k(25036,64)},helptext:ln},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:A=>{const e=A[0]<-Ft?"\b":A[0]>Ft?"":A[1]<-Ft?"A":A[1]>Ft?"Z":"";return e&&_(e),A},gamepad:Xi,rumble:null,setup:null,helptext:ln}],Vi={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{Ai(1)},helptext:`Ultima V: Warriors of Destiny
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
1) Launch a WebMIDI supported player (such as https://signal.vercel.app/) in a separate tab, and leave it running.  Be sure to allow WebMIDI support. You may need to go into the Settings and enable "Inputs" from your system's WebMIDI driver.
2) In U5, Go to Activate Music -> Change Music Configuration, add Passport to slot 2, and hit enter. 
3) In the Midi Information screen, select Channel 1 (default), 16 voices, and then enter the numbers 1-15 for "Midi Number" in each song (where Ultima Theme is '1' and Rule Britannia is '15'). Then hit enter on each song to test.

`},Ji={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},un=`<b>Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

World War II is raging across Europe, and Castle Wolfenstein has been occupied by the Nazis and converted into their HQ. You have just been captured behind enemy lines and await interrogation and torture by the dreaded SS in the dungeons of Castle Wolfenstein. A dying cellmate bequeaths you your only hope - a gun and ten bullets.

Your Mission: Find the war plans and escape from Castle Wolfenstein ALIVE!

<a href="https://archive.org/details/muse-castle-wolfenstein-a2-ph/" target="_blank">Detailed instructions</a>

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>Space</b>  Search guards, unlock doors & chests
<b>T</b>      Throw grenade
<b>U</b>      Use contents of chest
<b>RETURN</b> Inventory

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
Right button (1): Shoot
X button:  Search/unlock
Y button:  Use chest contents
RB button: Throw grenade
LB button: Inventory`,ji=A=>{switch(A){case 0:At();break;case 1:et();break;case 2:q(" ");break;case 3:q("U");break;case 4:q("\r");break;case 5:q("T");break;case 9:{const e=io();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:At();break}},Hi=()=>{k(5128,0),k(5130,4);let A=5210;k(A,234),k(A+1,234),k(A+2,234),A=5224,k(A,234),k(A+1,234),k(A+2,234)},vi=()=>{B(49178,!1)<128&&B(49181,!1)<128&&Fr({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},zi={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:un},$i={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:ji,rumble:vi,setup:Hi,helptext:un},Aa={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:A=>{switch(A){case 0:At();break;case 1:et();break;case 2:q(" ");break;case 3:q("U");break;case 4:q("\r");break;case 5:q(":");break;case 9:{const e=io();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:At();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

<a href="https://archive.org/details/beyondcastlewolfensteinmusesoftware/" target="_blank">Detailed instructions</a>

Find the bomb, locate the private conference room, and leave the bomb, timed to detonate! Then return to the courtyard from which you entered the bunker. Good luck!

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>:</b>    Switch weapons (gun or dagger)
<b>B</b>    Bomb drop or pick up
<b>F</b>    Use first aid kit
<b>H</b>    Holster gun
<b>M</b>    Give money to bribe guard
<b>R</b>    Reset bomb
<b>U</b>    Use contents of open closet
<b>1-5</b>  Use pass
<b>Ctrl+T</b>  Use tool kit
<b>Ctrl+K</b>  Use key
<b>SPACE</b>   Search guards, unlock closets
<b>ESC</b>     Save game and exit
<b>RETURN</b>  Inventory

Open Closet: Aim gun and press SPACE
Unlock Closet: Aim gun then use number keys for 3-digit combo
Search Dead Guards: Stand over body and press SPACE
Drag Dead Guards: Stand next to body, aim gun at body and press SPACE

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
Right button (1): Shoot
X button:  Search guards or open closet
Y button:  Use contents of open closet
RB button: Switch weapons
LB button: Inventory`},tt=new Array,cA=A=>{Array.isArray(A)?tt.push(...A):tt.push(A)};cA(Li),cA(bi),cA(Mi),cA(qi),cA(Ki),cA(Ui),cA(Yi),cA(Wi),cA(Ni),cA(Gi),cA(_i),cA(Zi),cA(xi),cA(Vi),cA(Ji),cA($i),cA(zi),cA(Aa);const ea=(A,e,t)=>{const n=f.AN0.isSet,i=f.AN1.isSet,I=Ys();switch(A){case 0:(t&&n||!t&&!n)&&At();break;case 1:(t&&n||!t&&!n)&&et();break;case 12:I?i&&et():Ae(t?3:1,-1);break;case 13:I?i&&rn():Ae(t?3:1,1);break;case 14:I?i||et():Ae(t?2:0,-1);break;case 15:I?i||rn():Ae(t?2:0,1);break}},ta={address:0,data:[],keymap:{},gamepad:null,joystick:A=>A,rumble:null,setup:null,helptext:""},In=A=>{for(const e of tt)if(Io(e.address,e.data))return A.toUpperCase()in e.keymap?e.keymap[A.toUpperCase()]:A;return A},ra=()=>{for(const A of tt)if(Io(A.address,A.data))return A;return ta},Xr=(A=!1)=>{for(const e of tt)if(Io(e.address,e.data)){$s(e.helptext?e.helptext:" "),e.setup&&e.setup();return}A&&($s(" "),Ai(0))},oa=A=>{Z(49152,A|128,16),Z(49168,A&255|128,16)},hn=()=>{const A=SA(49152)&127;Z(49152,A,16)},na=()=>{const A=SA(49152)&127;Z(49152,A,32)};let me="",gn=1e9,pn=0;const xr=()=>{const A=performance.now();if(me!==""&&(SA(49152)<128||A-gn>3800)){gn=A;const e=me.charCodeAt(0);oa(e),me=me.slice(1),me.length===0&&A-pn>500&&(pn=A,_o(!0))}};let Cn="";const _=A=>{A===Cn&&me.length>0||(Cn=A,me+=A)};let Sn=0;const q=(A,e=300)=>{const t=performance.now();t-Sn<e||(Sn=t,_(A))},sa=A=>{let e=String.fromCharCode(A);e=In(e),_(e),xr()},ia=A=>{A.length===1&&(A=In(A)),_(A)},Ke=[],P=(A,e,t,n=!1,i=null)=>{const I={offAddr:A,onAddr:e,isSetAddr:t,writeOnly:n,isSet:!1,setFunc:i};return A>=49152&&(Ke[A-49152]=I),e>=49152&&(Ke[e-49152]=I),t>=49152&&(Ke[t-49152]=I),I},ke=()=>Math.floor(180*Math.random()),aa=()=>Math.floor(256*Math.random()),fn=(A,e)=>{A&=11,e?f.BSR_PREWRITE.isSet=!1:A&1?f.BSR_PREWRITE.isSet?f.BSR_WRITE.isSet=!0:f.BSR_PREWRITE.isSet=!0:(f.BSR_PREWRITE.isSet=!1,f.BSR_WRITE.isSet=!1),f.BSRBANK2.isSet=A<=3,f.BSRREADRAM.isSet=[0,3,8,11].includes(A)},f={STORE80:P(49152,49153,49176,!0),RAMRD:P(49154,49155,49171,!0),RAMWRT:P(49156,49157,49172,!0),INTCXROM:P(49158,49159,49173,!0),INTC8ROM:P(49194,0,0),ALTZP:P(49160,49161,49174,!0),SLOTC3ROM:P(49162,49163,49175,!0),COLUMN80:P(49164,49165,49183,!0),ALTCHARSET:P(49166,49167,49182,!0),KBRDSTROBE:P(49168,0,0,!1),BSRBANK2:P(0,0,49169),BSRREADRAM:P(0,0,49170),VBL:P(0,0,49177),CASSOUT:P(49184,0,0),SPEAKER:P(49200,0,0,!1,(A,e)=>{Z(49200,ke()),B0(e)}),GCSTROBE:P(49216,0,0),EMUBYTE:P(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:P(49232,49233,49178),MIXED:P(49234,49235,49179),PAGE2:P(49236,49237,49180),HIRES:P(49238,49239,49181),AN0:P(49240,49241,0),AN1:P(49242,49243,0),AN2:P(49244,49245,0),DHIRES:P(49247,49246,0),CASSIN1:P(0,0,49248,!1,()=>{Z(49248,ke())}),PB0:P(0,0,49249),PB1:P(0,0,49250),PB2:P(0,0,49251),JOYSTICK0:P(0,0,49252,!1,(A,e)=>{Pt(e)}),JOYSTICK1:P(0,0,49253,!1,(A,e)=>{Pt(e)}),JOYSTICK2:P(0,0,49254,!1,(A,e)=>{Pt(e)}),JOYSTICK3:P(0,0,49255,!1,(A,e)=>{Pt(e)}),CASSIN2:P(0,0,49256,!1,()=>{Z(49256,ke())}),FASTCHIP_LOCK:P(49258,0,0),FASTCHIP_ENABLE:P(49259,0,0),FASTCHIP_SPEED:P(49261,0,0),JOYSTICKRESET:P(0,0,49264,!1,(A,e)=>{di(e),Z(49264,ke())}),BANKSEL:P(49267,0,0),LASER128EX:P(49268,0,0),VIDEO7_160:P(49272,49273,0),VIDEO7_MONO:P(49274,49275,0),VIDEO7_MIXED:P(49276,49277,0),BSR_PREWRITE:P(49280,0,0),BSR_WRITE:P(49288,0,0)};f.TEXT.isSet=!0;let En=!0,Lt=0;const Bn=A=>{if(En!==A&&f.STORE80.isSet){if(A)switch(f.VIDEO7_160.isSet=!1,f.VIDEO7_MONO.isSet=!1,f.VIDEO7_MIXED.isSet=!1,Lt=Lt<<1&2,Lt|=f.COLUMN80.isSet?0:1,Lt){case 0:break;case 1:{f.VIDEO7_160.isSet=!0;break}case 2:{f.VIDEO7_MIXED.isSet=!0;break}case 3:{f.VIDEO7_MONO.isSet=!0;break}}En=A}},ca=[49152,49153,49165,49167,49168,49200,49236,49237,49183],la=(A,e)=>8192+1024*(A%8)+128*(Math.trunc(A/8)&7)+40*Math.trunc(A/64)+e,Dn=(A,e,t)=>{if(A>1048575&&!ca.includes(A)){const i=SA(A)>128?1:0;console.log(`${t} $${M(c.PC)}: $${M(A)} [${i}] ${e?"write":""}`)}if(A<=49183&&Ya()==="APPLE2P"){!e&&A<=49167&&xr(),A===49168?hn():A!==49152&&Z(A,ke());return}if(A>=49280&&A<=49295){fn(A&-5,e);return}const n=Ke[A-49152];if(!n){console.error("Unknown softswitch "+M(A)),Z(A,ke());return}if(A<=49167?e||xr():(A===49168||A<=49183&&e)&&hn(),n.setFunc){n.setFunc(A,t);return}if(A===f.DHIRES.offAddr?Bn(!0):A===f.DHIRES.onAddr&&Bn(!1),A===n.offAddr||A===n.onAddr){if((!n.writeOnly||e)&&(UA[n.offAddr-49152]!==void 0?UA[n.offAddr-49152]=A===n.onAddr:n.isSet=A===n.onAddr),n.isSetAddr){const i=SA(n.isSetAddr);Z(n.isSetAddr,n.isSet?i|128:i&127)}if(A>=49184){let i;if(A>=49232&&A<=49247){const I=t%17030-4550;if(I>=0){const C=Math.floor(I/65),l=t%65,D=la(C,l);i=B(D)}else i=aa()}else i=ke();Z(A,i)}}else if(A===n.isSetAddr)if(A>=f.PB0.isSetAddr&&A<=f.PB2.isSetAddr&&Ys())Z(A,n.isSet?0:128);else{const i=SA(A);Z(A,n.isSet?i|128:i&127)}},ua=()=>{for(const A in f){const e=A;UA[f[e].offAddr-49152]!==void 0?UA[f[e].offAddr-49152]=!1:f[e].isSet=!1}UA[f.TEXT.offAddr-49152]!==void 0?UA[f.TEXT.offAddr-49152]=!0:f.TEXT.isSet=!0},UA=[],Ia=A=>{if(A>=49280&&A<=49295){fn(A&-5,!1);return}const e=Ke[A-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+M(A));return}UA[e.offAddr-49152]===void 0&&(UA[e.offAddr-49152]=e.isSet),e.isSet=A===e.onAddr},ha=()=>{UA.forEach((A,e)=>{A!==void 0&&(Ke[e].isSet=A)}),UA.length=0},Ue=[],ga=()=>{if(Ue.length===0)for(const A in f){const e=f[A],t=e.onAddr>0,n=e.writeOnly?" (write)":"";if(e.offAddr>0){const i=M(e.offAddr)+" "+A;Ue[e.offAddr]=i+(t?"-OFF":"")+n}if(e.onAddr>0){const i=M(e.onAddr)+" "+A;Ue[e.onAddr]=i+"-ON"+n}if(e.isSetAddr>0){const i=M(e.isSetAddr)+" "+A;Ue[e.isSetAddr]=i+"-STATUS"+n}}return Ue[49152]="C000 KBRD/STORE80-OFF",Ue},pa=()=>{for(const A in f){const t=f[A];if(t.isSetAddr){const n=SA(t.isSetAddr);Z(t.isSetAddr,t.isSet?n|128:n&127)}}},Ca=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
LFj/cBg4kBi4UBIBgBEUFxpMFstMHMtMyslMIstIikiYSAiGNa3/z3ggWP+6aGho
aKjKmmiqjvgHmI17BooKCgoKqIz4BihMQMgIeI17BqUASKUBSCy0wK17BYUArfsF
hQGtewaiACyywDD7LLLAEPuBACy2wGiFAWiFAChgCHilAEilAUgstMCtewWFAK37
BYUBogAsssAw+yyywBD7oQCqLLbAaIUBaIUAKGAIeKUASKUBSCy0wKIArXsFhQCt
+wWFAakgLLLAMPssssAQ+4EArXsHyU+wE+57B+YA0OTmAaUBydCQ3KnI0NYstsBo
hQFohQAoYP///////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
oiCgAKIDhjyKCiQ88BAFPEn/KX6wCErQ+5idVgPI6BDlIFj/ur0AAQoKCgqFK6q9
jsC9jMC9isC9icCgUL2AwJgpAwoFK6q9gcCpViCo/IgQ64UmhT2FQakIhScYCL2M
wBD7SdXQ972MwBD7yarQ8+q9jMAQ+8mW8AkokN9JrfAl0NmgA4VAvYzAEPsqhTy9
jMAQ+yU8iNDsKMU90L6lQMVB0Liwt6BWhDy8jMAQ+1nWAqQ8iJkAA9DuhDy8jMAQ
+1nWAqQ8kSbI0O+8jMAQ+1nWAtCHoACiVsow+7EmXgADKl4AAyqRJsjQ7uYn5j2l
Pc0ACKYrkNtMAQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAG/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
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
0Kqp/+XRhR2k5bAFCiBl9Dil1GXShdSl1ekAhdWxJkUcJTBRJpEm6NAE5h3wYqXT
sNog0/QYpdRl0IXUpdVl0VDZgYKEiJCgwBz//vr07OHUxbShjXhhSTEY/6UmCqUn
KQMqBSYKCgqF4qUnSkopBwXiheKl5Qpl5QqqyqUwKX/oStD8heGKGGXlkALm4YXg
YIYahBuqSkpKSoXTiikPqry69YTQSQ+qvLv1yITSpOWiAIbqoRqF0aKAhtSG1abn
pdQ4ZdCF1JAEILP0GKXVZdKF1ZADILT0ytDlpdFKSkrQ1OYa0ALmG6Ea0MpghhqE
G6pKSkpKhdOKKQ+qvLr1hNBJD6q8u/XIhNKk5aIAhuqhGoXRooCG1IbVpuel1Dhl
0IXUkAQgnPQYpdVl0oXVkAMgnfTK0OWl0UpKStDU5hrQAuYboRrQymAgZ90gUuek
UaZQwAGQBtAd4BiwGYpImEipLCDA3iD45uDAsAmGnWioaKqlnWBMBvIg+ObgCLD2
vfb2heRgACpVf4Cq1f/JwfANILn2IFf0ILcAycHQ5iDA3iC59oSdqIqmnSA69UwI
9yD45ob5YCD45obnYCD45qXohRql6YUbiqIAwRrwArClCpAD5hsYqLEaZRqqyLEa
ZemFG4YaILcAycXQCSDA3iC59iAR9KX5YCAt90wF9iAt90xh9qkAhT2FP6BQhDzI
hD4g/f4YpXOqyoY+5VBIpXSo6NABiIQ/5VHFbpAC0ANMENSFdIVwhT2F6WiF6IVz
hW+FPCD6/KkDTAL/GKWbZVCFPqWcZVGFP6AEsZsg7+CllIU8pZWFPWCpQIUUIOPf
qQCFFEzw2CD45sqKySiQCukoSCD72mhM7PeFJGDL0tdKCCBH+CipD5ACaeCFLrEm
RTAlLlEmkSZgIAD4xCywEcggDviQ9mkBSCAA+GjFLZD1YKAv0AKgJ4QtoCepAIUw
ICj4iBD2YEhKKQMJBIUnaCkYkAJpf4UmCgoFJoUmYKUwGGkDKQ+FMAoKCgoFMIUw
YEoIIEf4sSYokARKSkpKKQ9gpjqkOyCW/SBI+aE6qEqQCWqwEMmi8Awph0qqvWL5
IHn40ASggKkAqr2m+YUuKQOFL5gpj6qYoAPgivALSpAISkoJIIjQ+siI0PJg////
IIL4SLE6INr9ogEgSvnEL8iQ8aIDwASQ8mioucD5hSy5APqFLakAoAUGLSYsKojQ
+Gm/IO39ytDsIEj5pC+iBuAD8BwGLpAOvbP5IO39vbn58AMg7f3K0OdgiDDnINr9
pS7J6LE6kPIgVvmq6NAByJgg2v2KTNr9ogOpoCDt/crQ+GA4pS+kO6oQAYhlOpAB
yGAEIFQwDYAEkAMiVDMNgASQBCBUMw2ABJAEIFQ7DYAEkAAiRDMNyEQAESJEMw3I
RKkBIkQzDYAEkAEiRDMNgASQJjGHmgAhgYIAAFlNkZKGSoWdrKmso6ik2QDYpKQA
HIocI12LG6Gdih0jnYsdoQApGa5pqBkjJFMbIyRTGaEAGltbpWkkJK6uqK0pAHwA
FZxtnKVpKVOEEzQRpWkjoNhiWkgmYpSIVETIVGhE6JQAtAiEdLQobnT0zEpy8qSK
AKqionR0dHJEaLIysgAiABoaJiZycojIxMomSEREosiFRWhICgoKMANs/gMoIEz/
aIU6aIU7bPADIIL4INr6TGX/2CCE/iAv+yCT/iCJ/q1YwK1awK1dwK1fwK3/zywQ
wNggOv+t8wNJpc30A9AXrfID0A+p4M3zA9AIoAOM8gNMAOBs8gMgYPuiBb38+p3v
A8rQ96nIhgCFAaAHxgGlAcnA8NeN+AexANkB+9DsiIgQ9WwAAOrqII79qUWFQKkA
hUGi+6mgIO39vR76IO39qb0g7f21SiDa/egw6GBZ+gDgRSD/AP8D/zzB0NDMxaDd
28TCwf/D////wdjZ0NOtcMCgAOrqvWTAEATI0PiIYKkAhUitVsCtVMCtUcCpAPAL
rVDArVPAIDb4qRSFIqkAhSCpKIUhqRiFI6kXhSVMIvwgWPygCLkI+5kOBIjQ92Ct
8wNJpY30A2DJjdAYrADAEBPAk9APLBDArADAEPvAg/ADLBDATP37OEws/Ki5SPog
l/sgDP3JzrDuycmQ6snM8ObQ6Orq6urq6urq6urq6urqSEopAwkEhSloKRiQAml/
hSgKCgUohShgyYfQEqlAIKj8oMCpDCCo/K0wwIjQ9WCkJJEo5iSlJMUhsGZgyaCw
76gQ7MmN8FrJivBayYjQycYkEOilIYUkxiSlIsUlsAvGJaUlIMH7ZSCFKGBJwPAo
af2QwPDaaf2QLPDeaf2QXNDppCSlJUggJPwgnvygAGhpAMUjkPCwyqUihSWgAIQk
8OSpAIUk5iWlJcUjkLbGJaUiSCAk/KUohSqlKYUrpCGIaGkBxSOwDUggJPyxKJEq
iBD5MOGgACCe/LCGpCSpoJEoyMQhkPlgOEjpAdD8aOkB0PZg5kLQAuZDpTzFPqU9
5T/mPNAC5j1goEsg2/zQ+Wn+sPWgISDb/MjIiND9kAWgMojQ/awgwKAsymCiCEgg
+vxoKqA6ytD1YCD9/IitYMBFLxD4RS+FL8CAYKQksShIKT8JQJEoaGw4AOZO0ALm
TywAwBD1kSitAMAsEMBgIAz9IKX7IAz9yZvw82ClMkip/4UyvQACIO39aIUyvQAC
yYjwHcmY8Arg+JADIDr/6NATqdwg7f0gjv2lMyDt/aIBivDzyiA1/cmV0AKxKMng
kAIp350AAsmN0LIgnPypjdBbpD2mPCCO/SBA+aAAqa1M7f2lPAkHhT6lPYU/pTwp
B9ADIJL9qaAg7f2xPCDa/SC6/JDoYEqQ6kpKpT6QAkn/ZTxIqb0g7f1oSEpKSkog
5f1oKQ8JsMm6kAJpBmw2AMmgkAIlMoQ1SCB4+2ikNWDGNPCfytAWybrQu4UxpT6R
QOZA0ALmQWCkNLn/AYUxYKIBtT6VQpVEyhD3YLE8kUIgtPyQ92CxPNFC8Bwgkv2x
PCDa/amgIO39qagg7f2xQiDa/ampIO39ILT8kNlgIHX+qRRIIND4IFP5hTqEO2g4
6QHQ72CK8Ae1PJU6yhD5YKA/0AKg/4QyYKkAhT6iOKAb0AipAIU+ojag8KU+KQ/w
BgnAoADwAqn9lACVAWDq6kwA4EwD4CB1/iA//2w6AEzX+mDqYOrq6urqTPgDqUAg
yfygJ6IAQTxIoTwg7f4guvygHWiQ7qAiIO3+8E2iEAog1vzQ+mAgAP5oaNBsIPr8
qRYgyfyFLiD6/KAkIP38sPkg/fygOyDs/IE8RS6FLiC6/KA1kPAg7PzFLvANqcUg
7f2p0iDt/SDt/amHTO39pUhIpUWmRqRHKGCFRYZGhEcIaIVIuoZJ2GAghP4gL/sg
k/4gif7YIDr/qaqFMyBn/SDH/yCn/4Q0oBeIMOjZzP/Q+CC+/6Q0THP/ogMKCgoK
CiY+Jj/KEPilMdAGtT+VPZVB6PDz0AaiAIY+hj+5AALISbDJCpDTaYjJ+rDNYKn+
SLnj/0ilMaAAhDFgvLK+su/Esqm7pqQGlQcCBfAA65Onxpmyyb7BNYzElq8XFysf
g39dzLX8Fxf1A/sDYvpA+g==`,Sa=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,fa=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,mn=new Array(256),Vr={},p=(A,e,t,n)=>{console.assert(!mn[t],"Duplicate instruction: "+A+" mode="+e),mn[t]={name:A,mode:e,bytes:n},Vr[A]||(Vr[A]=[]),Vr[A][e]=t};p("ADC",s.IMM,105,2),p("ADC",s.ZP_REL,101,2),p("ADC",s.ZP_X,117,2),p("ADC",s.ABS,109,3),p("ADC",s.ABS_X,125,3),p("ADC",s.ABS_Y,121,3),p("ADC",s.IND_X,97,2),p("ADC",s.IND_Y,113,2),p("ADC",s.IND,114,2),p("AND",s.IMM,41,2),p("AND",s.ZP_REL,37,2),p("AND",s.ZP_X,53,2),p("AND",s.ABS,45,3),p("AND",s.ABS_X,61,3),p("AND",s.ABS_Y,57,3),p("AND",s.IND_X,33,2),p("AND",s.IND_Y,49,2),p("AND",s.IND,50,2),p("ASL",s.IMPLIED,10,1),p("ASL",s.ZP_REL,6,2),p("ASL",s.ZP_X,22,2),p("ASL",s.ABS,14,3),p("ASL",s.ABS_X,30,3),p("BCC",s.ZP_REL,144,2),p("BCS",s.ZP_REL,176,2),p("BEQ",s.ZP_REL,240,2),p("BIT",s.ZP_REL,36,2),p("BIT",s.ABS,44,3),p("BIT",s.IMM,137,2),p("BIT",s.ZP_X,52,2),p("BIT",s.ABS_X,60,3),p("BMI",s.ZP_REL,48,2),p("BNE",s.ZP_REL,208,2),p("BPL",s.ZP_REL,16,2),p("BVC",s.ZP_REL,80,2),p("BVS",s.ZP_REL,112,2),p("BRA",s.ZP_REL,128,2),p("BRK",s.IMPLIED,0,1),p("CLC",s.IMPLIED,24,1),p("CLD",s.IMPLIED,216,1),p("CLI",s.IMPLIED,88,1),p("CLV",s.IMPLIED,184,1),p("CMP",s.IMM,201,2),p("CMP",s.ZP_REL,197,2),p("CMP",s.ZP_X,213,2),p("CMP",s.ABS,205,3),p("CMP",s.ABS_X,221,3),p("CMP",s.ABS_Y,217,3),p("CMP",s.IND_X,193,2),p("CMP",s.IND_Y,209,2),p("CMP",s.IND,210,2),p("CPX",s.IMM,224,2),p("CPX",s.ZP_REL,228,2),p("CPX",s.ABS,236,3),p("CPY",s.IMM,192,2),p("CPY",s.ZP_REL,196,2),p("CPY",s.ABS,204,3),p("DEC",s.IMPLIED,58,1),p("DEC",s.ZP_REL,198,2),p("DEC",s.ZP_X,214,2),p("DEC",s.ABS,206,3),p("DEC",s.ABS_X,222,3),p("DEX",s.IMPLIED,202,1),p("DEY",s.IMPLIED,136,1),p("EOR",s.IMM,73,2),p("EOR",s.ZP_REL,69,2),p("EOR",s.ZP_X,85,2),p("EOR",s.ABS,77,3),p("EOR",s.ABS_X,93,3),p("EOR",s.ABS_Y,89,3),p("EOR",s.IND_X,65,2),p("EOR",s.IND_Y,81,2),p("EOR",s.IND,82,2),p("INC",s.IMPLIED,26,1),p("INC",s.ZP_REL,230,2),p("INC",s.ZP_X,246,2),p("INC",s.ABS,238,3),p("INC",s.ABS_X,254,3),p("INX",s.IMPLIED,232,1),p("INY",s.IMPLIED,200,1),p("JMP",s.ABS,76,3),p("JMP",s.IND,108,3),p("JMP",s.IND_X,124,3),p("JSR",s.ABS,32,3),p("LDA",s.IMM,169,2),p("LDA",s.ZP_REL,165,2),p("LDA",s.ZP_X,181,2),p("LDA",s.ABS,173,3),p("LDA",s.ABS_X,189,3),p("LDA",s.ABS_Y,185,3),p("LDA",s.IND_X,161,2),p("LDA",s.IND_Y,177,2),p("LDA",s.IND,178,2),p("LDX",s.IMM,162,2),p("LDX",s.ZP_REL,166,2),p("LDX",s.ZP_Y,182,2),p("LDX",s.ABS,174,3),p("LDX",s.ABS_Y,190,3),p("LDY",s.IMM,160,2),p("LDY",s.ZP_REL,164,2),p("LDY",s.ZP_X,180,2),p("LDY",s.ABS,172,3),p("LDY",s.ABS_X,188,3),p("LSR",s.IMPLIED,74,1),p("LSR",s.ZP_REL,70,2),p("LSR",s.ZP_X,86,2),p("LSR",s.ABS,78,3),p("LSR",s.ABS_X,94,3),p("NOP",s.IMPLIED,234,1),p("ORA",s.IMM,9,2),p("ORA",s.ZP_REL,5,2),p("ORA",s.ZP_X,21,2),p("ORA",s.ABS,13,3),p("ORA",s.ABS_X,29,3),p("ORA",s.ABS_Y,25,3),p("ORA",s.IND_X,1,2),p("ORA",s.IND_Y,17,2),p("ORA",s.IND,18,2),p("PHA",s.IMPLIED,72,1),p("PHP",s.IMPLIED,8,1),p("PHX",s.IMPLIED,218,1),p("PHY",s.IMPLIED,90,1),p("PLA",s.IMPLIED,104,1),p("PLP",s.IMPLIED,40,1),p("PLX",s.IMPLIED,250,1),p("PLY",s.IMPLIED,122,1),p("ROL",s.IMPLIED,42,1),p("ROL",s.ZP_REL,38,2),p("ROL",s.ZP_X,54,2),p("ROL",s.ABS,46,3),p("ROL",s.ABS_X,62,3),p("ROR",s.IMPLIED,106,1),p("ROR",s.ZP_REL,102,2),p("ROR",s.ZP_X,118,2),p("ROR",s.ABS,110,3),p("ROR",s.ABS_X,126,3),p("RTI",s.IMPLIED,64,1),p("RTS",s.IMPLIED,96,1),p("SBC",s.IMM,233,2),p("SBC",s.ZP_REL,229,2),p("SBC",s.ZP_X,245,2),p("SBC",s.ABS,237,3),p("SBC",s.ABS_X,253,3),p("SBC",s.ABS_Y,249,3),p("SBC",s.IND_X,225,2),p("SBC",s.IND_Y,241,2),p("SBC",s.IND,242,2),p("SEC",s.IMPLIED,56,1),p("SED",s.IMPLIED,248,1),p("SEI",s.IMPLIED,120,1),p("STA",s.ZP_REL,133,2),p("STA",s.ZP_X,149,2),p("STA",s.ABS,141,3),p("STA",s.ABS_X,157,3),p("STA",s.ABS_Y,153,3),p("STA",s.IND_X,129,2),p("STA",s.IND_Y,145,2),p("STA",s.IND,146,2),p("STX",s.ZP_REL,134,2),p("STX",s.ZP_Y,150,2),p("STX",s.ABS,142,3),p("STY",s.ZP_REL,132,2),p("STY",s.ZP_X,148,2),p("STY",s.ABS,140,3),p("STZ",s.ZP_REL,100,2),p("STZ",s.ZP_X,116,2),p("STZ",s.ABS,156,3),p("STZ",s.ABS_X,158,3),p("TAX",s.IMPLIED,170,1),p("TAY",s.IMPLIED,168,1),p("TSX",s.IMPLIED,186,1),p("TXA",s.IMPLIED,138,1),p("TXS",s.IMPLIED,154,1),p("TYA",s.IMPLIED,152,1),p("TRB",s.ZP_REL,20,2),p("TRB",s.ABS,28,3),p("TSB",s.ZP_REL,4,2),p("TSB",s.ABS,12,3);const Ea=65536,kn=65792,wn=66048,Tn=()=>{const A={register:"",address:768,operator:"==",value:128},e={action:"",register:"A",address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...A},expression2:{...A},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:"",action1:{...e},action2:{...e},halt:!1,basic:!1}};class Jr extends Map{set(e,t){const n=[...this.entries()];n.push([e,t]),n.sort((i,I)=>i[0]-I[0]),super.clear();for(const[i,I]of n)super.set(i,I);return this}}const tA={};tA[""]={name:"Any",min:0,max:65535},tA.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},tA.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},tA.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},tA["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},tA["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(tA).map(A=>A.name);const Ba=(A,e)=>A+2+(e>127?e-256:e),Da=(A,e)=>{if(e<0)return!1;let t=!1;switch(A){case"BCS":t=(e&1)!==0;break;case"BCC":t=(e&1)===0;break;case"BEQ":t=(e&2)!==0;break;case"BNE":t=(e&2)===0;break;case"BMI":t=(e&128)!==0;break;case"BPL":t=(e&128)===0;break;case"BVS":t=(e&64)!==0;break;case"BVC":t=(e&64)===0;break;case"BRA":t=!0;break}return t},dn=(A,e,t,n,i)=>{if(A>>8===192){let Q="---";return A>=49168&&A<=49183&&(Q=e.pcode>=128?"ON":"OFF"),`${M(A,4)}: ${M(e.pcode)}        ${Q}`}let I="",C=`${M(e.pcode)}`,l="",D="";switch(e.bytes){case 1:C+="      ";break;case 2:l=M(t),C+=` ${l}   `;break;case 3:l=M(t),D=M(n),C+=` ${l} ${D}`;break}let d="";i>=0&&dt(e.name)&&(d=Da(e.name,i)?"  ✓":"  ✗");const m=dt(e.name)?M(Ba(A,t),4):l;switch(e.mode){case s.IMPLIED:break;case s.IMM:I=` #$${l}`;break;case s.ZP_REL:I=` $${m}`;break;case s.ZP_X:I=` $${l},X`;break;case s.ZP_Y:I=` $${l},Y`;break;case s.ABS:I=` $${D}${l}`;break;case s.ABS_X:I=` $${D}${l},X`;break;case s.ABS_Y:I=` $${D}${l},Y`;break;case s.IND_X:I=` ($${D.trim()}${l},X)`;break;case s.IND_Y:I=` ($${l}),Y`;break;case s.IND:I=` ($${D.trim()}${l})`;break}return`${M(A,4)}: ${C}  ${e.name}${I}${d}`};let bt=!1,jr=!1,lA=new Jr;const Mt=()=>{bt=!0},ma=()=>{new Jr(lA).forEach((n,i)=>{n.once&&lA.delete(i)});const e=tc();if(e<0||lA.get(e))return;const t=Tn();t.address=e,t.once=!0,t.hidden=!0,lA.set(e,t)},ka=()=>{new Jr(lA).forEach((n,i)=>{n.once&&lA.delete(i)});const e=55301,t=Tn();t.address=e,t.once=!0,t.hidden=!0,lA.set(e,t)},wa=A=>{lA=A};let yn=!1;const Ta=()=>{yn=!0,tA.MAIN.enabled=(A=0)=>A>=53248?!f.ALTZP.isSet&&f.BSRREADRAM.isSet:A>=512?!f.RAMRD.isSet:!f.ALTZP.isSet,tA.AUX.enabled=(A=0)=>A>=53248?f.ALTZP.isSet&&f.BSRREADRAM.isSet:A>=512?f.RAMRD.isSet:f.ALTZP.isSet,tA.ROM.enabled=()=>!f.BSRREADRAM.isSet,tA["MAIN-DXXX-1"].enabled=()=>!f.ALTZP.isSet&&f.BSRREADRAM.isSet&&!f.BSRBANK2.isSet,tA["MAIN-DXXX-2"].enabled=()=>!f.ALTZP.isSet&&f.BSRREADRAM.isSet&&f.BSRBANK2.isSet,tA["AUX-DXXX-1"].enabled=()=>f.ALTZP.isSet&&f.BSRREADRAM.isSet&&!f.BSRBANK2.isSet,tA["AUX-DXXX-2"].enabled=()=>f.ALTZP.isSet&&f.BSRREADRAM.isSet&&f.BSRBANK2.isSet,tA["CXXX-ROM"].enabled=(A=0)=>A>=49920&&A<=50175?f.INTCXROM.isSet||!f.SLOTC3ROM.isSet:A>=51200?f.INTCXROM.isSet||f.INTC8ROM.isSet:f.INTCXROM.isSet,tA["CXXX-CARD"].enabled=(A=0)=>A>=49920&&A<=50175?f.INTCXROM.isSet?!1:f.SLOTC3ROM.isSet:A>=51200?!f.INTCXROM.isSet&&!f.INTC8ROM.isSet:!f.INTCXROM.isSet},Rn=(A,e)=>{yn||Ta();const t=tA[A];return!(e<t.min||e>t.max||t.enabled&&!t?.enabled(e))},Pn=(A,e,t)=>{const n=lA.get(A);return!n||!n.watchpoint||n.disabled||n.hexvalue>=0&&n.hexvalue!==e||n.memoryBank&&!Rn(n.memoryBank,A)?!1:t?n.memset:n.memget},rt=(A=0,e=!0)=>{e?c.flagIRQ|=1<<A:c.flagIRQ&=~(1<<A),c.flagIRQ&=255},da=(A=!0)=>{c.flagNMI=A===!0},ya=()=>{c.flagIRQ=0,c.flagNMI=!1},Hr=[],Qn=[],Fn=(A,e)=>{Hr.push(A),Qn.push(e)},Ra=()=>{for(let A=0;A<Hr.length;A++)Hr[A](Qn[A])},Ln=A=>{let e=0;switch(A.register){case"$":e=xa(A.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(A.operator){case"==":return e===A.value;case"!=":return e!==A.value;case"<":return e<A.value;case"<=":return e<=A.value;case">":return e>A.value;case">=":return e>=A.value}},Pa=A=>{const e=Ln(A.expression1);return A.expressionOperator===""?e:A.expressionOperator==="&&"&&!e?!1:A.expressionOperator==="||"&&e?!0:Ln(A.expression2)},bn=()=>{jr=!0},Qa=(A,e,t)=>{const n=dn(c.PC,{...t},A,e,c.PStatus)+"          ",I=`${("0000000000"+c.cycleCount.toString()).slice(-10)}  ${n.slice(0,29)}  ${Jn()}`;console.log(I)},Mn=(A,e,t,n)=>{if(A.action==="")return!1;const i=A.value&255,I=A.address&65535;switch(A.action){case"set":switch(A.register){case"A":c.Accum=i;break;case"X":c.XReg=i;break;case"Y":c.YReg=i;break;case"S":c.StackPtr=i;break;case"P":c.PStatus=i;break;case"C":c.PC=A.value&65535;break}break;case"jump":c.PC=I;break;case"print":Qa(e,t,n);break;case"snapshot":_o();break}return!0},Fa=(A,e,t,n)=>{const i=Mn(A.action1,e,t,n),I=Mn(A.action2,e,t,n);return i||I?A.halt?1:2:A.hidden?3:1},La=(A=-1,e=0,t=0,n=null)=>{if(jr)return jr=!1,1;if(lA.size===0||bt)return 0;if(c.PC===55301){const I=B(117)+(B(118)<<8),C=lA.get(I);if(C&&!C.disabled)return 3}const i=lA.get(c.PC)||lA.get(-1)||lA.get(A|Ea)||A>=0&&lA.get(kn)||A>=0&&lA.get(wn);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){const I=(t<<8)+e;if(i.address===kn){if(v[A].name!=="???")return 0}else if(i.address===wn){if(v[A].is6502)return 0}else if(I>=0&&i.hexvalue>=0&&i.hexvalue!==I)return 0}if(i.expression1.register!==""&&!Pa(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!Rn(i.memoryBank,c.PC)?0:(i.once&&lA.delete(c.PC),Fa(i,e,t,n))},vr=(A=null)=>{let e=0;const t=c.PC,n=B(c.PC,!1),i=v[n],I=i.bytes>1?B(c.PC+1,!1):-1,C=i.bytes>2?B(c.PC+2,!1):0;if(!o0()){const D=La(n,I,C,i);if(D===1||D===3)return KA(G.PAUSED,D!==3),-1;if(D===2)return c.PC===t&&(bt=!0),0;bt=!1}const l=Wn.get(t);if(l&&(!f.INTCXROM.isSet||(t&61440)!==49152)&&l(),e=i.execute(I,C),A&&(t<64680||t>64691)){const D=dn(t,i,I,C,c.PStatus)+"          ";let m=`${("00000000"+c.cycleCount.toString()).slice(-8)}  ${D.slice(0,29)}  ${Jn()}`,Q=m.indexOf("JMP");if(Q===-1&&(Q=m.indexOf("RTS")),Q!==-1){let N=m.slice(Q,Q+15);N=N.replaceAll(" ","_"),m=m.slice(0,Q)+N+m.slice(Q+15)}A(m)}if(xn(i.bytes),at(c.cycleCount+e),Ra(),c.flagNMI&&(c.flagNMI=!1,e=nc(),at(c.cycleCount+e)),c.flagIRQ){const D=oc();D>0&&(at(c.cycleCount+D),e=D)}return e},ba=[197,58,163,92,197,58,163,92],Ma=1,qn=4;class qa{bits=[];pattern=new Array(64);patternIdx=0;constructor(){}reset=()=>{this.patternIdx=0};checkPattern=e=>{const n=ba[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===n};calcBits=()=>{const e=N=>{this.bits.push(N&8?1:0),this.bits.push(N&4?1:0),this.bits.push(N&2?1:0),this.bits.push(N&1?1:0)},t=N=>{e(Math.floor(N/10)),e(Math.floor(N%10))},n=new Date,i=n.getFullYear()%100,I=n.getDate(),C=n.getDay()+1,l=n.getMonth()+1,D=n.getHours(),d=n.getMinutes(),m=n.getSeconds(),Q=n.getMilliseconds()/10;this.bits=[],t(i),t(l),t(I),t(C),t(D),t(d),t(m),t(Q)};access=e=>{e&qn?this.reset():this.checkPattern(e&Ma)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()};read=e=>{let t=-1;return this.bits.length>0?e&qn&&(t=this.bits.pop()):this.access(e),t}}const Ka=new qa,Kn=320,Un=327,qt=256*Kn,Ua=256*Un;let YA=0;const zr=XA;let F=new Uint8Array(zr+(YA+1)*65536).fill(0);const $r=new Uint8Array(8).fill(0),Ao=()=>SA(49194),Kt=A=>{Z(49194,A)},we=()=>SA(49267),eo=A=>{Z(49267,A)},nA=new Array(257).fill(0),PA=new Array(257).fill(0);let Yn="APPLE2EE";const Ya=()=>Yn,On=A=>{Yn=A;let e="";switch(A){case"APPLE2P":e=Ca;break;case"APPLE2EU":e=fa;break;case"APPLE2EE":e=Sa;break}const t=e.replace(/\n/g,""),n=new Uint8Array(Me.Buffer.from(t,"base64"));n[15035]=5,F.set(n,ze)},to=A=>{A=Math.max(64,Math.min(8192,A));const e=YA;if(YA=Math.floor(A/64)-1,YA===e)return;we()>YA&&(eo(0),xA());const t=zr+(YA+1)*65536;if(YA<e)F=F.slice(0,t);else{const n=F;F=new Uint8Array(t).fill(255),F.set(n)}},Oa=()=>{const A=f.RAMRD.isSet?qe+we()*256:0,e=f.RAMWRT.isSet?qe+we()*256:0,t=f.PAGE2.isSet?qe+we()*256:0,n=f.STORE80.isSet?t:A,i=f.STORE80.isSet?t:e,I=f.STORE80.isSet&&f.HIRES.isSet?t:A,C=f.STORE80.isSet&&f.HIRES.isSet?t:e;for(let l=2;l<256;l++)nA[l]=l+A,PA[l]=l+e;for(let l=4;l<=7;l++)nA[l]=l+n,PA[l]=l+i;for(let l=32;l<=63;l++)nA[l]=l+I,PA[l]=l+C},Wa=()=>{const A=f.ALTZP.isSet?qe+we()*256:0;if(nA[0]=A,nA[1]=1+A,PA[0]=A,PA[1]=1+A,f.BSRREADRAM.isSet){for(let e=208;e<=255;e++)nA[e]=e+A;if(!f.BSRBANK2.isSet)for(let e=208;e<=223;e++)nA[e]=e-16+A}else for(let e=208;e<=255;e++)nA[e]=ve+e-192},Na=()=>{const A=f.ALTZP.isSet?qe+we()*256:0,e=f.BSR_WRITE.isSet;for(let t=192;t<=255;t++)PA[t]=-1;if(e){for(let t=208;t<=255;t++)PA[t]=t+A;if(!f.BSRBANK2.isSet)for(let t=208;t<=223;t++)PA[t]=t-16+A}},ro=A=>f.INTCXROM.isSet?!1:A!==3?!0:f.SLOTC3ROM.isSet,Ga=()=>!!(f.INTCXROM.isSet||f.INTC8ROM.isSet),oo=A=>{if(A<=7){if(f.INTCXROM.isSet)return;A===3&&!f.SLOTC3ROM.isSet&&(f.INTC8ROM.isSet||(f.INTC8ROM.isSet=!0,Kt(255),xA())),Ao()===0&&Gn[A]&&(Kt(A),xA())}else f.INTC8ROM.isSet=!1,Kt(0),xA()},_a=()=>{nA[192]=ve-192;for(let A=1;A<=7;A++){const e=192+A;nA[e]=A+(ro(A)?Kn-1:ve)}if(Ga())for(let A=200;A<=207;A++)nA[A]=ve+A-192;else{const A=Un+8*(Ao()-1);for(let e=0;e<=7;e++){const t=200+e;nA[t]=A+e}}},xA=()=>{Oa(),Wa(),Na(),_a();for(let A=0;A<256;A++)nA[A]=256*nA[A],PA[A]=256*PA[A]},Wn=new Map,Nn=new Array(8),Gn=new Uint8Array(8),Ut=(A,e=-1)=>{const t=A>>8===192?A-49280>>4:(A>>8)-192;if(A>=49408&&(oo(t),!ro(t)))return;const n=Nn[t];if(n!==void 0){const i=n(A,e);if(i>=0){const I=A>=49408?qt-256:ze;F[A-49152+I]=i}}},ot=(A,e)=>{$r[A]=1,Nn[A]=e},Ye=(A,e,t=0,n=()=>{})=>{if(F.set(e.slice(0,256),qt+(A-1)*256),$r[A]=e.some(i=>i!==0)?1:0,e.length>256){const i=e.length>2304?2304:e.length,I=Ua+(A-1)*2048;F.set(e.slice(256,i),I),Gn[A]=255}t&&Wn.set(t,n)},Za=()=>{F.fill(255,0,65536),F.fill(255,zr),Kt(0),eo(0),xA()},Xa=A=>(A>=49296?Ut(A):Dn(A,!1,c.cycleCount),A>=49232&&xA(),F[ze+A-49152]),V=(A,e)=>{const t=qt+(A-1)*256+(e&255);return F[t]},O=(A,e,t)=>{if(t>=0){const n=qt+(A-1)*256+(e&255);F[n]=t&255}},B=(A,e=!0)=>{let t=0;const n=A>>>8;if(n===192)t=Xa(A);else if(t=-1,n>=193&&n<=199?(n==195&&(f.INTCXROM.isSet||!f.SLOTC3ROM.isSet)?t=Ka.read(A):ro(n-192)&&!$r[n-192]&&(t=Math.floor(256*Math.random())),Ut(A)):A===53247&&oo(255),t<0){const i=nA[n];t=F[i+(A&255)]}return e&&Pn(A,t,!1)&&bn(),t},xa=A=>{const e=A>>>8,t=nA[e];return F[t+(A&255)]},Va=(A,e)=>{if(A===49265||A===49267){if(e>YA)return;eo(e)}else A>=49296?Ut(A,e):Dn(A,!0,c.cycleCount);(A<=49167||A>=49232)&&xA()},k=(A,e)=>{const t=A>>>8;if(t===192)Va(A,e);else{t>=193&&t<=199?Ut(A,e):A===53247&&oo(255);const n=PA[t];if(n<0)return;F[n+(A&255)]=e}Pn(A,e,!0)&&bn()},SA=A=>F[ze+A-49152],Z=(A,e,t=1)=>{const n=ze+A-49152;F.fill(e,n,n+t)},no=1024,_n=2048,Yt=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],so=(A=!1)=>{let e=0,t=24,n=!1;if(A){if(f.TEXT.isSet||f.HIRES.isSet)return new Uint8Array;t=f.MIXED.isSet?20:24,n=f.COLUMN80.isSet&&f.DHIRES.isSet}else{if(!f.TEXT.isSet&&!f.MIXED.isSet)return new Uint8Array;!f.TEXT.isSet&&f.MIXED.isSet&&(e=20),n=f.COLUMN80.isSet}if(n){const l=f.PAGE2.isSet&&!f.STORE80.isSet?_n:no,D=new Uint8Array(80*(t-e)).fill(160);for(let d=e;d<t;d++){const m=80*(d-e);for(let Q=0;Q<40;Q++)D[m+2*Q+1]=F[l+Yt[d]+Q],D[m+2*Q]=F[XA+l+Yt[d]+Q]}return D}if(f.DHIRES.isSet&&!f.COLUMN80.isSet&&f.STORE80.isSet){const l=new Uint8Array(80*(t-e));for(let D=e;D<t;D++){const d=80*(D-e);let m=no+Yt[D];l.set(F.slice(m,m+40),d),m+=XA,l.set(F.slice(m,m+40),d+40)}return l}const I=f.PAGE2.isSet&&!f.STORE80.isSet?_n:no,C=new Uint8Array(40*(t-e));for(let l=e;l<t;l++){const D=40*(l-e),d=I+Yt[l];C.set(F.slice(d,d+40),D)}return C},io=()=>Me.Buffer.from(so().map(A=>A&=127)).toString(),ao=new Uint8Array(7680),co=new Uint8Array(15360);let Ot=ao,Wt=192;const Ja=A=>{const e=f.DHIRES.isSet&&f.COLUMN80.isSet,t=f.DHIRES.isSet&&!f.COLUMN80.isSet&&f.STORE80.isSet;if(e||f.VIDEO7_MONO.isSet||f.VIDEO7_160.isSet||t){A===0&&(Ot=co,Wt=f.MIXED.isSet?160:192);const n=f.PAGE2.isSet&&!f.STORE80.isSet?16384:8192,i=Ti(n,A);for(let I=0;I<40;I++)co[A*80+2*I+1]=F[i+I],co[A*80+2*I]=F[XA+i+I]}else{A===0&&(Ot=ao,Wt=f.MIXED.isSet?160:192);const i=(f.PAGE2.isSet?16384:8192)+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);ao.set(F.slice(i,i+40),A*40)}},ja=()=>f.TEXT.isSet||!f.HIRES.isSet?new Uint8Array:Wt===192?Ot:Ot.slice(0,40*Wt),lo=A=>{const e=nA[A>>>8]+(A&255);return F.slice(e,e+512)},uo=(A,e)=>{const t=PA[A>>>8]+(A&255);F.set(e,t)},Io=(A,e)=>{for(let t=0;t<e.length;t++)if(B(A+t,!1)!==e[t])return!1;return!0},Ha=()=>{const A=nA[0];return F.slice(A,A+256)},va=()=>F.slice(0,XA+65536),c=Bi(),nt=A=>{c.Accum=A},st=A=>{c.XReg=A},it=A=>{c.YReg=A},at=A=>{c.cycleCount=A},Zn=A=>{Xn(),Object.assign(c,A)},Xn=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,OA(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},xn=A=>{OA((c.PC+A+65536)%65536)},OA=A=>{c.PC=A},Vn=A=>{c.PStatus=A|48},za=A=>(A&128?"N":".")+(A&64?"V":".")+(A&16?"B":".")+(A&8?"D":".")+(A&4?"I":".")+(A&2?"Z":".")+(A&1?"C":"."),Jn=()=>`${M(c.Accum)}  ${M(c.XReg)}  ${M(c.YReg)}  ${M(c.StackPtr)}  ${M(c.PStatus)}  ${za(c.PStatus)}`,WA=new Array(256).fill(""),$a=()=>WA.slice(0,256),Ac=A=>{WA.splice(0,A.length,...A)},ec=()=>{const A=lo(256).slice(0,256),e=new Array;for(let t=255;t>c.StackPtr;t--){let n="$"+M(A[t]),i=WA[t];WA[t].length>3&&t-1>c.StackPtr&&(WA[t-1]==="JSR"||WA[t-1]==="BRK"||WA[t-1]==="IRQ"?(t--,n+=M(A[t])):i=""),n=(n+"   ").substring(0,6),e.push(M(256+t,4)+": "+n+i)}return e.join(`
`)},tc=()=>{const A=lo(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const t=A[e];if(WA[e].startsWith("JSR")&&e-1>c.StackPtr&&WA[e-1]==="JSR"){const n=A[e-1]+1;return(t<<8)+n}}return-1},VA=(A,e)=>{WA[c.StackPtr]=A,k(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},JA=()=>{c.StackPtr=(c.StackPtr+1)%256;const A=B(256+c.StackPtr);if(isNaN(A))throw new Error("illegal stack value");return A},QA=()=>(c.PStatus&1)!==0,U=(A=!0)=>c.PStatus=A?c.PStatus|1:c.PStatus&254,jn=()=>(c.PStatus&2)!==0,ct=(A=!0)=>c.PStatus=A?c.PStatus|2:c.PStatus&253,rc=()=>(c.PStatus&4)!==0,ho=(A=!0)=>c.PStatus=A?c.PStatus|4:c.PStatus&251,Hn=()=>(c.PStatus&8)!==0,sA=()=>Hn()?1:0,go=(A=!0)=>c.PStatus=A?c.PStatus|8:c.PStatus&247,po=(A=!0)=>c.PStatus=A?c.PStatus|16:c.PStatus&239,vn=()=>(c.PStatus&64)!==0,lt=(A=!0)=>c.PStatus=A?c.PStatus|64:c.PStatus&191,zn=()=>(c.PStatus&128)!==0,$n=(A=!0)=>c.PStatus=A?c.PStatus|128:c.PStatus&127,R=A=>{ct(A===0),$n(A>=128)},K=(A,e)=>(A+e+256)%256,w=(A,e)=>e*256+A,W=(A,e,t)=>(e*256+A+t+65536)%65536,$=(A,e)=>A>>8!==e>>8?1:0,jA=(A,e)=>{if(A){const t=c.PC;return xn(e>127?e-256:e),3+$(t+2,c.PC+2)}return 2},v=new Array(256),h=(A,e,t,n,i,I=!1)=>{console.assert(!v[t],"Duplicate instruction: "+A+" mode="+e),v[t]={name:A,pcode:t,mode:e,bytes:n,execute:i,is6502:!I}},J=!0,te=(A,e,t)=>{const n=B(A),i=B((A+1)%256),I=W(n,i,c.YReg);e(I);let C=5+$(I,w(n,i));return t&&(C+=sA()),C},re=(A,e,t)=>{const n=B(A),i=B((A+1)%256),I=w(n,i);e(I);let C=5;return t&&(C+=sA()),C},As=A=>{let e=(c.Accum&15)+(A&15)+(QA()?1:0);e>=10&&(e+=6);let t=(c.Accum&240)+(A&240)+e;const n=c.Accum<=127&&A<=127,i=c.Accum>=128&&A>=128;lt((t&255)>=128?n:i),U(t>=160),QA()&&(t+=96),c.Accum=t&255,R(c.Accum)},Nt=A=>{let e=c.Accum+A+(QA()?1:0);U(e>=256),e=e%256;const t=c.Accum<=127&&A<=127,n=c.Accum>=128&&A>=128;lt(e>=128?t:n),c.Accum=e,R(c.Accum)},oe=A=>{Hn()?As(B(A)):Nt(B(A))};h("ADC",s.IMM,105,2,A=>(sA()?As(A):Nt(A),2+sA())),h("ADC",s.ZP_REL,101,2,A=>(oe(A),3+sA())),h("ADC",s.ZP_X,117,2,A=>(oe(K(A,c.XReg)),4+sA())),h("ADC",s.ABS,109,3,(A,e)=>(oe(w(A,e)),4+sA())),h("ADC",s.ABS_X,125,3,(A,e)=>{const t=W(A,e,c.XReg);return oe(t),4+sA()+$(t,w(A,e))}),h("ADC",s.ABS_Y,121,3,(A,e)=>{const t=W(A,e,c.YReg);return oe(t),4+sA()+$(t,w(A,e))}),h("ADC",s.IND_X,97,2,A=>{const e=K(A,c.XReg);return oe(w(B(e),B(e+1))),6+sA()}),h("ADC",s.IND_Y,113,2,A=>te(A,oe,!0)),h("ADC",s.IND,114,2,A=>re(A,oe,!0),J);const ne=A=>{c.Accum&=B(A),R(c.Accum)};h("AND",s.IMM,41,2,A=>(c.Accum&=A,R(c.Accum),2)),h("AND",s.ZP_REL,37,2,A=>(ne(A),3)),h("AND",s.ZP_X,53,2,A=>(ne(K(A,c.XReg)),4)),h("AND",s.ABS,45,3,(A,e)=>(ne(w(A,e)),4)),h("AND",s.ABS_X,61,3,(A,e)=>{const t=W(A,e,c.XReg);return ne(t),4+$(t,w(A,e))}),h("AND",s.ABS_Y,57,3,(A,e)=>{const t=W(A,e,c.YReg);return ne(t),4+$(t,w(A,e))}),h("AND",s.IND_X,33,2,A=>{const e=K(A,c.XReg);return ne(w(B(e),B(e+1))),6}),h("AND",s.IND_Y,49,2,A=>te(A,ne,!1)),h("AND",s.IND,50,2,A=>re(A,ne,!1),J);const Gt=A=>{let e=B(A);B(A),U((e&128)===128),e=(e<<1)%256,k(A,e),R(e)};h("ASL",s.IMPLIED,10,1,()=>(U((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,R(c.Accum),2)),h("ASL",s.ZP_REL,6,2,A=>(Gt(A),5)),h("ASL",s.ZP_X,22,2,A=>(Gt(K(A,c.XReg)),6)),h("ASL",s.ABS,14,3,(A,e)=>(Gt(w(A,e)),6)),h("ASL",s.ABS_X,30,3,(A,e)=>{const t=W(A,e,c.XReg);return Gt(t),6+$(t,w(A,e))}),h("BCC",s.ZP_REL,144,2,A=>jA(!QA(),A)),h("BCS",s.ZP_REL,176,2,A=>jA(QA(),A)),h("BEQ",s.ZP_REL,240,2,A=>jA(jn(),A)),h("BMI",s.ZP_REL,48,2,A=>jA(zn(),A)),h("BNE",s.ZP_REL,208,2,A=>jA(!jn(),A)),h("BPL",s.ZP_REL,16,2,A=>jA(!zn(),A)),h("BVC",s.ZP_REL,80,2,A=>jA(!vn(),A)),h("BVS",s.ZP_REL,112,2,A=>jA(vn(),A)),h("BRA",s.ZP_REL,128,2,A=>jA(!0,A),J);const _t=A=>{ct((c.Accum&A)===0),$n((A&128)!==0),lt((A&64)!==0)};h("BIT",s.ZP_REL,36,2,A=>(_t(B(A)),3)),h("BIT",s.ABS,44,3,(A,e)=>(_t(B(w(A,e))),4)),h("BIT",s.IMM,137,2,A=>(ct((c.Accum&A)===0),2),J),h("BIT",s.ZP_X,52,2,A=>(_t(B(K(A,c.XReg))),4),J),h("BIT",s.ABS_X,60,3,(A,e)=>{const t=W(A,e,c.XReg);return _t(B(t)),4+$(t,w(A,e))},J);const Co=(A,e,t=0)=>{const n=(c.PC+t)%65536,i=B(e),I=B(e+1);VA(`${A} $`+M(I)+M(i),Math.trunc(n/256)),VA(A,n%256),VA("P",c.PStatus),go(!1),ho();const C=W(i,I,A==="BRK"?-1:0);OA(C)},es=()=>(po(),Co("BRK",65534,2),7);h("BRK",s.IMPLIED,0,1,es);const oc=()=>rc()?0:(po(!1),Co("IRQ",65534),7),nc=()=>(Co("NMI",65530),7);h("CLC",s.IMPLIED,24,1,()=>(U(!1),2)),h("CLD",s.IMPLIED,216,1,()=>(go(!1),2)),h("CLI",s.IMPLIED,88,1,()=>(ho(!1),2)),h("CLV",s.IMPLIED,184,1,()=>(lt(!1),2));const Te=A=>{const e=B(A);U(c.Accum>=e),R((c.Accum-e+256)%256)},sc=A=>{const e=B(A);U(c.Accum>=e),R((c.Accum-e+256)%256)};h("CMP",s.IMM,201,2,A=>(U(c.Accum>=A),R((c.Accum-A+256)%256),2)),h("CMP",s.ZP_REL,197,2,A=>(Te(A),3)),h("CMP",s.ZP_X,213,2,A=>(Te(K(A,c.XReg)),4)),h("CMP",s.ABS,205,3,(A,e)=>(Te(w(A,e)),4)),h("CMP",s.ABS_X,221,3,(A,e)=>{const t=W(A,e,c.XReg);return sc(t),4+$(t,w(A,e))}),h("CMP",s.ABS_Y,217,3,(A,e)=>{const t=W(A,e,c.YReg);return Te(t),4+$(t,w(A,e))}),h("CMP",s.IND_X,193,2,A=>{const e=K(A,c.XReg);return Te(w(B(e),B(e+1))),6}),h("CMP",s.IND_Y,209,2,A=>te(A,Te,!1)),h("CMP",s.IND,210,2,A=>re(A,Te,!1),J);const ts=A=>{const e=B(A);U(c.XReg>=e),R((c.XReg-e+256)%256)};h("CPX",s.IMM,224,2,A=>(U(c.XReg>=A),R((c.XReg-A+256)%256),2)),h("CPX",s.ZP_REL,228,2,A=>(ts(A),3)),h("CPX",s.ABS,236,3,(A,e)=>(ts(w(A,e)),4));const rs=A=>{const e=B(A);U(c.YReg>=e),R((c.YReg-e+256)%256)};h("CPY",s.IMM,192,2,A=>(U(c.YReg>=A),R((c.YReg-A+256)%256),2)),h("CPY",s.ZP_REL,196,2,A=>(rs(A),3)),h("CPY",s.ABS,204,3,(A,e)=>(rs(w(A,e)),4));const Zt=A=>{const e=K(B(A),-1);k(A,e),R(e)};h("DEC",s.IMPLIED,58,1,()=>(c.Accum=K(c.Accum,-1),R(c.Accum),2),J),h("DEC",s.ZP_REL,198,2,A=>(Zt(A),5)),h("DEC",s.ZP_X,214,2,A=>(Zt(K(A,c.XReg)),6)),h("DEC",s.ABS,206,3,(A,e)=>(Zt(w(A,e)),6)),h("DEC",s.ABS_X,222,3,(A,e)=>{const t=W(A,e,c.XReg);return B(t),Zt(t),7}),h("DEX",s.IMPLIED,202,1,()=>(c.XReg=K(c.XReg,-1),R(c.XReg),2)),h("DEY",s.IMPLIED,136,1,()=>(c.YReg=K(c.YReg,-1),R(c.YReg),2));const se=A=>{c.Accum^=B(A),R(c.Accum)};h("EOR",s.IMM,73,2,A=>(c.Accum^=A,R(c.Accum),2)),h("EOR",s.ZP_REL,69,2,A=>(se(A),3)),h("EOR",s.ZP_X,85,2,A=>(se(K(A,c.XReg)),4)),h("EOR",s.ABS,77,3,(A,e)=>(se(w(A,e)),4)),h("EOR",s.ABS_X,93,3,(A,e)=>{const t=W(A,e,c.XReg);return se(t),4+$(t,w(A,e))}),h("EOR",s.ABS_Y,89,3,(A,e)=>{const t=W(A,e,c.YReg);return se(t),4+$(t,w(A,e))}),h("EOR",s.IND_X,65,2,A=>{const e=K(A,c.XReg);return se(w(B(e),B(e+1))),6}),h("EOR",s.IND_Y,81,2,A=>te(A,se,!1)),h("EOR",s.IND,82,2,A=>re(A,se,!1),J);const Xt=A=>{const e=K(B(A),1);k(A,e),R(e)};h("INC",s.IMPLIED,26,1,()=>(c.Accum=K(c.Accum,1),R(c.Accum),2),J),h("INC",s.ZP_REL,230,2,A=>(Xt(A),5)),h("INC",s.ZP_X,246,2,A=>(Xt(K(A,c.XReg)),6)),h("INC",s.ABS,238,3,(A,e)=>(Xt(w(A,e)),6)),h("INC",s.ABS_X,254,3,(A,e)=>{const t=W(A,e,c.XReg);return B(t),Xt(t),7}),h("INX",s.IMPLIED,232,1,()=>(c.XReg=K(c.XReg,1),R(c.XReg),2)),h("INY",s.IMPLIED,200,1,()=>(c.YReg=K(c.YReg,1),R(c.YReg),2)),h("JMP",s.ABS,76,3,(A,e)=>(OA(W(A,e,-3)),3)),h("JMP",s.IND,108,3,(A,e)=>{const t=w(A,e);return A=B(t),e=B((t+1)%65536),OA(W(A,e,-3)),6}),h("JMP",s.IND_X,124,3,(A,e)=>{const t=W(A,e,c.XReg);return A=B(t),e=B((t+1)%65536),OA(W(A,e,-3)),6},J),h("JSR",s.ABS,32,3,(A,e)=>{const t=(c.PC+2)%65536;return VA("JSR $"+M(e)+M(A),Math.trunc(t/256)),VA("JSR",t%256),OA(W(A,e,-3)),6});const ie=A=>{c.Accum=B(A),R(c.Accum)};h("LDA",s.IMM,169,2,A=>(c.Accum=A,R(c.Accum),2)),h("LDA",s.ZP_REL,165,2,A=>(ie(A),3)),h("LDA",s.ZP_X,181,2,A=>(ie(K(A,c.XReg)),4)),h("LDA",s.ABS,173,3,(A,e)=>(ie(w(A,e)),4)),h("LDA",s.ABS_X,189,3,(A,e)=>{const t=W(A,e,c.XReg);return ie(t),4+$(t,w(A,e))}),h("LDA",s.ABS_Y,185,3,(A,e)=>{const t=W(A,e,c.YReg);return ie(t),4+$(t,w(A,e))}),h("LDA",s.IND_X,161,2,A=>{const e=K(A,c.XReg);return ie(w(B(e),B((e+1)%256))),6}),h("LDA",s.IND_Y,177,2,A=>te(A,ie,!1)),h("LDA",s.IND,178,2,A=>re(A,ie,!1),J);const xt=A=>{c.XReg=B(A),R(c.XReg)};h("LDX",s.IMM,162,2,A=>(c.XReg=A,R(c.XReg),2)),h("LDX",s.ZP_REL,166,2,A=>(xt(A),3)),h("LDX",s.ZP_Y,182,2,A=>(xt(K(A,c.YReg)),4)),h("LDX",s.ABS,174,3,(A,e)=>(xt(w(A,e)),4)),h("LDX",s.ABS_Y,190,3,(A,e)=>{const t=W(A,e,c.YReg);return xt(t),4+$(t,w(A,e))});const Vt=A=>{c.YReg=B(A),R(c.YReg)};h("LDY",s.IMM,160,2,A=>(c.YReg=A,R(c.YReg),2)),h("LDY",s.ZP_REL,164,2,A=>(Vt(A),3)),h("LDY",s.ZP_X,180,2,A=>(Vt(K(A,c.XReg)),4)),h("LDY",s.ABS,172,3,(A,e)=>(Vt(w(A,e)),4)),h("LDY",s.ABS_X,188,3,(A,e)=>{const t=W(A,e,c.XReg);return Vt(t),4+$(t,w(A,e))});const Jt=A=>{let e=B(A);B(A),U((e&1)===1),e>>=1,k(A,e),R(e)};h("LSR",s.IMPLIED,74,1,()=>(U((c.Accum&1)===1),c.Accum>>=1,R(c.Accum),2)),h("LSR",s.ZP_REL,70,2,A=>(Jt(A),5)),h("LSR",s.ZP_X,86,2,A=>(Jt(K(A,c.XReg)),6)),h("LSR",s.ABS,78,3,(A,e)=>(Jt(w(A,e)),6)),h("LSR",s.ABS_X,94,3,(A,e)=>{const t=W(A,e,c.XReg);return Jt(t),6+$(t,w(A,e))}),h("NOP",s.IMPLIED,234,1,()=>2);const ae=A=>{c.Accum|=B(A),R(c.Accum)};h("ORA",s.IMM,9,2,A=>(c.Accum|=A,R(c.Accum),2)),h("ORA",s.ZP_REL,5,2,A=>(ae(A),3)),h("ORA",s.ZP_X,21,2,A=>(ae(K(A,c.XReg)),4)),h("ORA",s.ABS,13,3,(A,e)=>(ae(w(A,e)),4)),h("ORA",s.ABS_X,29,3,(A,e)=>{const t=W(A,e,c.XReg);return ae(t),4+$(t,w(A,e))}),h("ORA",s.ABS_Y,25,3,(A,e)=>{const t=W(A,e,c.YReg);return ae(t),4+$(t,w(A,e))}),h("ORA",s.IND_X,1,2,A=>{const e=K(A,c.XReg);return ae(w(B(e),B(e+1))),6}),h("ORA",s.IND_Y,17,2,A=>te(A,ae,!1)),h("ORA",s.IND,18,2,A=>re(A,ae,!1),J),h("PHA",s.IMPLIED,72,1,()=>(VA("PHA",c.Accum),3)),h("PHP",s.IMPLIED,8,1,()=>(VA("PHP",c.PStatus|16),3)),h("PHX",s.IMPLIED,218,1,()=>(VA("PHX",c.XReg),3),J),h("PHY",s.IMPLIED,90,1,()=>(VA("PHY",c.YReg),3),J),h("PLA",s.IMPLIED,104,1,()=>(c.Accum=JA(),R(c.Accum),4)),h("PLP",s.IMPLIED,40,1,()=>(Vn(JA()),4)),h("PLX",s.IMPLIED,250,1,()=>(c.XReg=JA(),R(c.XReg),4),J),h("PLY",s.IMPLIED,122,1,()=>(c.YReg=JA(),R(c.YReg),4),J);const jt=A=>{let e=B(A);B(A);const t=QA()?1:0;U((e&128)===128),e=(e<<1)%256|t,k(A,e),R(e)};h("ROL",s.IMPLIED,42,1,()=>{const A=QA()?1:0;return U((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|A,R(c.Accum),2}),h("ROL",s.ZP_REL,38,2,A=>(jt(A),5)),h("ROL",s.ZP_X,54,2,A=>(jt(K(A,c.XReg)),6)),h("ROL",s.ABS,46,3,(A,e)=>(jt(w(A,e)),6)),h("ROL",s.ABS_X,62,3,(A,e)=>{const t=W(A,e,c.XReg);return jt(t),6+$(t,w(A,e))});const Ht=A=>{let e=B(A);B(A);const t=QA()?128:0;U((e&1)===1),e=e>>1|t,k(A,e),R(e)};h("ROR",s.IMPLIED,106,1,()=>{const A=QA()?128:0;return U((c.Accum&1)===1),c.Accum=c.Accum>>1|A,R(c.Accum),2}),h("ROR",s.ZP_REL,102,2,A=>(Ht(A),5)),h("ROR",s.ZP_X,118,2,A=>(Ht(K(A,c.XReg)),6)),h("ROR",s.ABS,110,3,(A,e)=>(Ht(w(A,e)),6)),h("ROR",s.ABS_X,126,3,(A,e)=>{const t=W(A,e,c.XReg);return Ht(t),6+$(t,w(A,e))}),h("RTI",s.IMPLIED,64,1,()=>(Vn(JA()),po(!1),OA(w(JA(),JA())-1),6)),h("RTS",s.IMPLIED,96,1,()=>(OA(w(JA(),JA())),6));const os=A=>{const e=255-A;let t=c.Accum+e+(QA()?1:0);const n=t>=256,i=c.Accum<=127&&e<=127,I=c.Accum>=128&&e>=128;lt(t%256>=128?i:I);const C=(c.Accum&15)-(A&15)+(QA()?0:-1);t=c.Accum-A+(QA()?0:-1),t<0&&(t-=96),C<0&&(t-=6),c.Accum=t&255,R(c.Accum),U(n)},ce=A=>{sA()?os(B(A)):Nt(255-B(A))};h("SBC",s.IMM,233,2,A=>(sA()?os(A):Nt(255-A),2+sA())),h("SBC",s.ZP_REL,229,2,A=>(ce(A),3+sA())),h("SBC",s.ZP_X,245,2,A=>(ce(K(A,c.XReg)),4+sA())),h("SBC",s.ABS,237,3,(A,e)=>(ce(w(A,e)),4+sA())),h("SBC",s.ABS_X,253,3,(A,e)=>{const t=W(A,e,c.XReg);return ce(t),4+sA()+$(t,w(A,e))}),h("SBC",s.ABS_Y,249,3,(A,e)=>{const t=W(A,e,c.YReg);return ce(t),4+sA()+$(t,w(A,e))}),h("SBC",s.IND_X,225,2,A=>{const e=K(A,c.XReg);return ce(w(B(e),B(e+1))),6+sA()}),h("SBC",s.IND_Y,241,2,A=>te(A,ce,!0)),h("SBC",s.IND,242,2,A=>re(A,ce,!0),J),h("SEC",s.IMPLIED,56,1,()=>(U(),2)),h("SED",s.IMPLIED,248,1,()=>(go(),2)),h("SEI",s.IMPLIED,120,1,()=>(ho(),2)),h("STA",s.ZP_REL,133,2,A=>(k(A,c.Accum),3)),h("STA",s.ZP_X,149,2,A=>(k(K(A,c.XReg),c.Accum),4)),h("STA",s.ABS,141,3,(A,e)=>(k(w(A,e),c.Accum),4)),h("STA",s.ABS_X,157,3,(A,e)=>{const t=W(A,e,c.XReg);return B(t),k(t,c.Accum),5}),h("STA",s.ABS_Y,153,3,(A,e)=>(k(W(A,e,c.YReg),c.Accum),5)),h("STA",s.IND_X,129,2,A=>{const e=K(A,c.XReg);return k(w(B(e),B(e+1)),c.Accum),6});const ns=A=>{k(A,c.Accum)};h("STA",s.IND_Y,145,2,A=>(te(A,ns,!1),6)),h("STA",s.IND,146,2,A=>re(A,ns,!1),J),h("STX",s.ZP_REL,134,2,A=>(k(A,c.XReg),3)),h("STX",s.ZP_Y,150,2,A=>(k(K(A,c.YReg),c.XReg),4)),h("STX",s.ABS,142,3,(A,e)=>(k(w(A,e),c.XReg),4)),h("STY",s.ZP_REL,132,2,A=>(k(A,c.YReg),3)),h("STY",s.ZP_X,148,2,A=>(k(K(A,c.XReg),c.YReg),4)),h("STY",s.ABS,140,3,(A,e)=>(k(w(A,e),c.YReg),4)),h("STZ",s.ZP_REL,100,2,A=>(k(A,0),3),J),h("STZ",s.ZP_X,116,2,A=>(k(K(A,c.XReg),0),4),J),h("STZ",s.ABS,156,3,(A,e)=>(k(w(A,e),0),4),J),h("STZ",s.ABS_X,158,3,(A,e)=>{const t=W(A,e,c.XReg);return B(t),k(t,0),5},J),h("TAX",s.IMPLIED,170,1,()=>(c.XReg=c.Accum,R(c.XReg),2)),h("TAY",s.IMPLIED,168,1,()=>(c.YReg=c.Accum,R(c.YReg),2)),h("TSX",s.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,R(c.XReg),2)),h("TXA",s.IMPLIED,138,1,()=>(c.Accum=c.XReg,R(c.Accum),2)),h("TXS",s.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),h("TYA",s.IMPLIED,152,1,()=>(c.Accum=c.YReg,R(c.Accum),2));const ss=A=>{const e=B(A);ct((c.Accum&e)===0),k(A,e&~c.Accum)};h("TRB",s.ZP_REL,20,2,A=>(ss(A),5),J),h("TRB",s.ABS,28,3,(A,e)=>(ss(w(A,e)),6),J);const is=A=>{const e=B(A);ct((c.Accum&e)===0),k(A,e|c.Accum)};h("TSB",s.ZP_REL,4,2,A=>(is(A),5),J),h("TSB",s.ABS,12,3,(A,e)=>(is(w(A,e)),6),J);const ic=[2,34,66,98,130,194,226],FA="???";ic.forEach(A=>{h(FA,s.IMPLIED,A,2,()=>2),v[A].is6502=!1});for(let A=0;A<=15;A++)h(FA,s.IMPLIED,3+16*A,1,()=>1),v[3+16*A].is6502=!1,h(FA,s.IMPLIED,7+16*A,1,()=>1),v[7+16*A].is6502=!1,h(FA,s.IMPLIED,11+16*A,1,()=>1),v[11+16*A].is6502=!1,h(FA,s.IMPLIED,15+16*A,1,()=>1),v[15+16*A].is6502=!1;h(FA,s.IMPLIED,68,2,()=>3),v[68].is6502=!1,h(FA,s.IMPLIED,84,2,()=>4),v[84].is6502=!1,h(FA,s.IMPLIED,212,2,()=>4),v[212].is6502=!1,h(FA,s.IMPLIED,244,2,()=>4),v[244].is6502=!1,h(FA,s.IMPLIED,92,3,()=>8),v[92].is6502=!1,h(FA,s.IMPLIED,220,3,()=>4),v[220].is6502=!1,h(FA,s.IMPLIED,252,3,()=>4),v[252].is6502=!1;for(let A=0;A<256;A++)v[A]||(console.error("ERROR: OPCODE "+A.toString(16)+" should be implemented"),h("BRK",s.IMPLIED,A,1,es));const ac=()=>{const A=new Array(256);for(let e=0;e<256;e++)A[e]={name:v[e].name,mode:v[e].mode,pcode:v[e].pcode,bytes:v[e].bytes,is6502:v[e].is6502};y0(A)},fA=(A,e,t)=>{const n=e&7,i=e>>>3;return A[i]|=t>>>n,n&&(A[i+1]|=t<<8-n),e+8},vt=(A,e,t)=>(e=fA(A,e,t>>>1|170),e=fA(A,e,t|170),e),So=(A,e)=>(e=fA(A,e,255),e+2),cc=A=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],t=new Uint8Array(343),n=[0,2,1,3];for(let I=0;I<84;I++)t[I]=n[A[I]&3]|n[A[I+86]&3]<<2|n[A[I+172]&3]<<4;t[84]=n[A[84]&3]<<0|n[A[170]&3]<<2,t[85]=n[A[85]&3]<<0|n[A[171]&3]<<2;for(let I=0;I<256;I++)t[86+I]=A[I]>>>2;t[342]=t[341];let i=342;for(;i>1;)i--,t[i]^=t[i-1];for(let I=0;I<343;I++)t[I]=e[t[I]];return t},lc=(A,e,t)=>{let n=0;const i=new Uint8Array(6646).fill(0);for(let I=0;I<16;I++)n=So(i,n);for(let I=0;I<16;I++){n=fA(i,n,213),n=fA(i,n,170),n=fA(i,n,150),n=vt(i,n,254),n=vt(i,n,e),n=vt(i,n,I),n=vt(i,n,254^e^I),n=fA(i,n,222),n=fA(i,n,170),n=fA(i,n,235);for(let D=0;D<7;D++)n=So(i,n);n=fA(i,n,213),n=fA(i,n,170),n=fA(i,n,173);const C=I===15?15:I*(t?8:7)%15,l=cc(A.slice(C*256,C*256+256));for(let D=0;D<l.length;D++)n=fA(i,n,l[D]);n=fA(i,n,222),n=fA(i,n,170),n=fA(i,n,235);for(let D=0;D<16;D++)n=So(i,n)}return i},uc=(A,e)=>{const t=A.length/4096;if(t<34||t>40)return new Uint8Array;const n=new Uint8Array(1536+t*13*512).fill(0);n.set($e(`WOZ2ÿ
\r
`),0),n.set($e("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set($e("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set($e("TMAP"),80),n[84]=160,n.fill(255,88,248);let i=0;for(let I=0;I<t;I++)i=88+(I<<2),I>0&&(n[i-1]=I),n[i]=n[i+1]=I;n.set($e("TRKS"),248),n.set(Ho(1280+t*13*512),252);for(let I=0;I<t;I++){i=256+(I<<3),n.set(Di(3+I*13),i),n[i+2]=13,n.set(Ho(50304),i+4);const C=A.slice(I*16*256,(I+1)*16*256),l=lc(C,I,e);i=1536+I*13*512,n.set(l,i)}return n},Ic=(A,e)=>{if(!([87,79,90,50,255,10,13,10].find((l,D)=>l!==e[D])===void 0))return!1;A.isWriteProtected=e[22]===1,A.isSynchronized=e[23]===1,A.optimalTiming=e[59]>0?e[59]:32,A.optimalTiming!==32&&console.log(`${A.filename} optimal timing = ${A.optimalTiming}`);const i=e.slice(8,12),I=i[0]+(i[1]<<8)+(i[2]<<16)+i[3]*2**24,C=wi(e,12);if(I!==0&&I!==C)return alert("CRC checksum error: "+A.filename),!1;for(let l=0;l<160;l++){const D=e[88+l];if(D<255){const d=256+8*D,m=e.slice(d,d+8);A.trackStart[l]=512*((m[1]<<8)+m[0]),A.trackNbits[l]=m[4]+(m[5]<<8)+(m[6]<<16)+m[7]*2**24,A.maxQuarterTrack=l}}return!0},hc=(A,e)=>{if(!([87,79,90,49,255,10,13,10].find((i,I)=>i!==e[I])===void 0))return!1;A.isWriteProtected=e[22]===1;for(let i=0;i<160;i++){const I=e[88+i];if(I<255){A.trackStart[i]=256+I*6656;const C=e.slice(A.trackStart[i]+6646,A.trackStart[i]+6656);A.trackNbits[i]=C[2]+(C[3]<<8),A.maxQuarterTrack=i}}return!0},gc=A=>{const e=A.toLowerCase(),t=e.endsWith(".dsk")||e.endsWith(".do"),n=e.endsWith(".po");return t||n},pc=(A,e)=>{const n=A.filename.toLowerCase().endsWith(".po"),i=uc(e,n);return i.length===0?new Uint8Array:(A.filename=mi(A.filename,"woz"),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),i)},Cc=(A,e)=>{A.diskHasChanges=!1;const t=A.filename.toLowerCase();return e.length>1e4&&(vo(t)&&(A.hardDrive=!0,A.status="",t.endsWith(".hdv")||t.endsWith(".po")||t.endsWith(".2meg")||t.endsWith(".2mg"))||((gc(A.filename)||e.length===143360)&&(e=pc(A,e)),Ic(A,e))||hc(A,e))?e:(t!==""&&console.error(`Unknown disk format or unable to decode: ${A.filename} (${e.length} bytes).`),new Uint8Array)},Sc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Oe=0,BA=0,DA=0,zt=!1,fo=!1;const fc=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],Ec=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],Bc=A=>{zt=!1,hs(A),A.quarterTrack=A.maxQuarterTrack,A.prevQuarterTrack=A.maxQuarterTrack},Dc=(A=!1)=>{if(A){const e=tr();e.motorRunning&&gs(e)}else Ve(Ce.MOTOR_OFF)};let $t=0;const mc=(A,e,t)=>{$t=0,A.prevQuarterTrack=A.quarterTrack,A.quarterTrack+=e,A.quarterTrack<0||A.quarterTrack>A.maxQuarterTrack?(Ve(Ce.TRACK_END),A.quarterTrack=Math.max(0,Math.min(A.quarterTrack,A.maxQuarterTrack))):Ve(Ce.TRACK_SEEK),A.status=` Trk ${A.quarterTrack/4}`,wA(),DA+=t,A.trackLocation+=Math.floor(DA/4),DA=DA%4,A.quarterTrack!=A.prevQuarterTrack&&(A.trackLocation=Math.floor(A.trackLocation*(A.trackNbits[A.quarterTrack]/A.trackNbits[A.prevQuarterTrack])))};let as=0;const kc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],cs=()=>(as++,kc[as&31]);let Ar=0;const wc=A=>(Ar<<=1,Ar|=A,Ar&=15,Ar===0?cs():A),ls=[128,64,32,16,8,4,2,1],Tc=[127,191,223,239,247,251,253,254],dc=(A,e)=>{const t=A.trackLocation;A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],t!==A.trackLocation&&($t>=9?($t=0,A.trackLocation+=4):$t++);let n;if(A.trackStart[A.quarterTrack]>0){const i=A.trackStart[A.quarterTrack]+(A.trackLocation>>3),I=e[i],C=A.trackLocation&7;n=(I&ls[C])>>7-C,n=wc(n)}else n=cs();return A.trackLocation++,n},yc=()=>Math.floor(256*Math.random()),us=(A,e,t)=>{if(e.length===0)return yc();let n=0;for(DA+=t;DA>=A.optimalTiming/8;){const i=dc(A,e);if(BA&128&&!i||(BA&128&&(BA=0),BA=BA<<1|i),DA-=A.optimalTiming/8,BA&128&&DA<=A.optimalTiming/4)break}return DA<0&&(DA=0),BA&=255,n=BA,n};let le=0;const Eo=(A,e,t)=>{if(A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],A.trackStart[A.quarterTrack]>0){const n=A.trackStart[A.quarterTrack]+(A.trackLocation>>3);let i=e[n];const I=A.trackLocation&7;t?i|=ls[I]:i&=Tc[I],e[n]=i}A.trackLocation++},Is=(A,e,t)=>{if(!(e.length===0||A.trackStart[A.quarterTrack]===0)&&BA>0){if(t>=16)for(let n=7;n>=0;n--)Eo(A,e,BA&2**n?1:0);t>=36&&Eo(A,e,0),t>=40&&Eo(A,e,0),Bo.push(t>=40?2:t>=36?1:BA),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),BA=0}},hs=A=>{Oe=0,zt||(A.motorRunning=!1),wA(),Ve(Ce.MOTOR_OFF)},gs=A=>{Oe?(clearTimeout(Oe),Oe=0):DA=0,A.motorRunning=!0,wA(),Ve(Ce.MOTOR_ON)},Rc=A=>{Oe===0&&(Oe=setTimeout(()=>hs(A),1e3))};let Bo=[];const er=A=>{Bo.length>0&&A.quarterTrack===0&&(Bo=[])},Pc=(A,e)=>{if(A>=49408)return-1;let t=tr();const n=Lc();if(t.hardDrive)return 0;let i=0;const I=c.cycleCount-le;switch(A=A&15,A){case 9:zt=!0,gs(t),er(t);break;case 8:t.motorRunning&&!t.writeMode&&(i=us(t,n,I),le=c.cycleCount),zt=!1,Rc(t),er(t);break;case 10:case 11:{const C=A===10?2:3,l=tr();Fc(C),t=tr(),t!==l&&l.motorRunning&&(l.motorRunning=!1,t.motorRunning=!0,wA());break}case 12:fo=!1,t.motorRunning&&!t.writeMode&&(i=us(t,n,I),le=c.cycleCount);break;case 13:fo=!0,t.motorRunning&&(t.writeMode?(Is(t,n,I),le=c.cycleCount,e>=0&&(BA=e)):(BA=0,DA+=I,t.trackLocation+=Math.floor(DA/4),DA=DA%4,le=c.cycleCount,e>=0?console.log(`${t.filename}: Illegal LOAD of write data latch during read: PC=${M(c.PC)} Value=${M(e)}`):console.log(`${t.filename}: Illegal READ of write data latch during read: PC=${M(c.PC)}`)));break;case 14:t.motorRunning&&t.writeMode&&(Is(t,n,I),t.lastAppleWriteTime=Date.now(),le=c.cycleCount),t.writeMode=!1,fo&&(i=t.isWriteProtected?255:0),er(t);break;case 15:t.writeMode=!0,le=c.cycleCount,e>=0&&(BA=e);break;default:{if(A<0||A>7)break;const C=A/2;A%2?t.currentPhase|=1<<C:t.currentPhase&=~(1<<C);const D=fc[t.currentPhase];if(t.motorRunning&&D>=0){const d=t.quarterTrack&7,m=Ec[d][D];mc(t,m,I),le=c.cycleCount}er(t);break}}return i},Qc=()=>{Ye(6,Uint8Array.from(Sc)),ot(6,Pc)},HA=(A,e,t)=>({index:A,hardDrive:t,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:t?Array():Array(160).fill(0),trackNbits:t?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),ps=()=>{y[0]=HA(0,1,!0),y[1]=HA(1,2,!0),y[2]=HA(2,1,!1),y[3]=HA(3,2,!1);for(let A=0;A<y.length;A++)vA[A]=new Uint8Array},y=[],vA=[];ps();let de=2;const Fc=A=>{de=A},tr=()=>y[de],Lc=()=>vA[de],Do=A=>y[A==2?1:0],rr=A=>{const e=vA[A==2?1:0];let t="";for(let i=0;i<4;i++)t+=String.fromCharCode(e[i]);const n=t==="2IMG"?64:0;return[e,n,e.length-n]},ut=[],wA=()=>{for(let A=0;A<y.length;A++){if(y[A].filename===""&&!y[A].cloudData&&ut[A]&&ut[A].diskHasChanges===y[A].diskHasChanges&&ut[A].motorRunning===y[A].motorRunning&&ut[A].status===y[A].status)continue;const e={index:A,hardDrive:y[A].hardDrive,drive:y[A].drive,filename:y[A].filename,status:y[A].status,motorRunning:y[A].motorRunning,diskHasChanges:y[A].diskHasChanges,isWriteProtected:y[A].isWriteProtected,diskData:y[A].diskHasChanges&&!y[A].motorRunning?vA[A]:new Uint8Array,lastAppleWriteTime:y[A].lastAppleWriteTime,lastLocalFileWriteTime:y[A].lastLocalFileWriteTime,cloudData:y[A].cloudData,writableFileHandle:y[A].writableFileHandle};D0(e),ut[A]={diskHasChanges:e.diskHasChanges,motorRunning:e.motorRunning,status:e.status}}},bc=A=>{const e=["","",""];for(let n=0;n<y.length;n++)(A||vA[n].length<32e6)&&(e[n]=Me.Buffer.from(vA[n]).toString("base64"));const t={currentDrive:de,driveState:[HA(0,1,!0),HA(1,2,!0),HA(2,1,!1),HA(3,2,!1)],driveData:e};for(let n=0;n<y.length;n++)t.driveState[n]={...y[n]};return t},Mc=A=>{Ve(Ce.MOTOR_OFF),de=A.currentDrive,A.driveState.length===3&&de>0&&de++,ps();let e=0;for(let t=0;t<A.driveState.length;t++)y[e]={...A.driveState[t]},A.driveData[t]!==""&&(vA[e]=new Uint8Array(Me.Buffer.from(A.driveData[t],"base64"))),A.driveState.length===3&&t===0&&(e=1),e++;wA()},qc=()=>{for(let A=0;A<y.length;A++)y[A].hardDrive||Bc(y[A]);wA()},Cs=(A=!1)=>{Dc(A),wA()},Kc=(A,e=!1)=>{let t=A.index,n=A.drive,i=A.hardDrive;if(e||A.filename!==""&&(vo(A.filename)?(i=!0,t=A.drive<=1?0:1,n=t+1):(i=!1,t=A.drive<=1?2:3,n=t-1)),y[t]=HA(t,n,i),y[t].filename=A.filename,vA[t]=Cc(y[t],A.diskData),vA[t].length===0){y[t].filename="",wA();return}y[t].motorRunning=A.motorRunning,y[t].cloudData=A.cloudData,y[t].writableFileHandle=A.writableFileHandle,y[t].lastLocalFileWriteTime=A.lastLocalFileWriteTime,wA()},Uc=A=>{const e=A.index;y[e].filename=A.filename,y[e].motorRunning=A.motorRunning,y[e].isWriteProtected=A.isWriteProtected,y[e].diskHasChanges=A.diskHasChanges,y[e].lastAppleWriteTime=A.lastAppleWriteTime,y[e].lastLocalFileWriteTime=A.lastLocalFileWriteTime,y[e].cloudData=A.cloudData,y[e].writableFileHandle=A.writableFileHandle,wA()},ye={OVRN:4,RX_FULL:8,IRQ:128,HW_RESET:16},It={BAUD_RATE:15,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Re={RX_INT_DIS:2,TX_INT_EN:4,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0};class Yc{_control;_status;_command;_lastRead;_lastConfig;_receiveBuffer;_extFuncs;buffer(e){for(let n=0;n<e.length;n++)this._receiveBuffer.push(e[n]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let n=0;n<t;n++)this._receiveBuffer.shift(),this._status|=ye.OVRN;this._status|=ye.RX_FULL,(this._control&Re.RX_INT_DIS)==0&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&Re.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-8,this._receiveBuffer.length?(this._status|=ye.RX_FULL,(this._control&Re.RX_INT_DIS)==0&&this.irq(!0)):this._status&=-9,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&ye.IRQ&&this.irq(!1),this._status&=-129,e}set status(e){this.reset()}irq(e){e?this._status|=ye.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&It.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&It.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&It.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Re.PARITY_EN)switch(this._command&Re.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let t=!1;e.baud!=this._lastConfig.baud&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=It.HW_RESET,this._command=Re.HW_RESET,this._status=ye.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=It.HW_RESET,this._command=Re.HW_RESET,this._status=ye.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}}const mo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let or=1,RA;const Oc=A=>{rt(or,A)},Wc=A=>{console.log("ConfigChange: ",A)},Nc=A=>{RA&&RA.buffer(A)},Gc=()=>{RA&&RA.reset()},_c=(A=!0,e=1)=>{if(!A)return;or=e;const t={sendData:k0,interrupt:Oc,configChange:Wc};RA=new Yc(t);const n=new Uint8Array(mo.length+256);n.set(mo.slice(1792,2048)),n.set(mo,256),Ye(or,n),ot(or,Zc)},Zc=(A,e=-1)=>{if(A>=49408)return-1;const t={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(A&15){case t.DIPSW1:return 226;case t.DIPSW2:return 40;case t.IOREG:if(e>=0)RA.data=e;else return RA.data;break;case t.STATUS:if(e>=0)RA.status=e;else return RA.status;break;case t.COMMAND:if(e>=0)RA.command=e;else return RA.command;break;case t.CONTROL:if(e>=0)RA.control=e;else return RA.control;break;default:console.log("SSC unknown softswitch",(A&15).toString(16));break}return-1},ht=(A,e)=>String(A).padStart(e,"0");(()=>{const A=new Uint8Array(256).fill(96);return A[0]=8,A[2]=40,A[4]=88,A[6]=112,A})();const Xc=()=>{const A=new Date,e=ht(A.getMonth()+1,2)+","+ht(A.getDay(),2)+","+ht(A.getDate(),2)+","+ht(A.getHours(),2)+","+ht(A.getMinutes(),2);for(let t=0;t<e.length;t++)k(512+t,e.charCodeAt(t)|128)};let nr=!1;const Ss=A=>{const e=A.split(","),t=e[0].split(/([+-])/);return{label:t[0]?t[0]:"",operation:t[1]?t[1]:"",value:t[2]?parseInt(t[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},fs=A=>{let e=s.IMPLIED,t=-1;if(A.length>0){A.startsWith("#")?(e=s.IMM,A=A.substring(1)):A.startsWith("(")?(A.endsWith(",Y")?e=s.IND_Y:A.endsWith(",X)")?e=s.IND_X:e=s.IND,A=A.substring(1)):A.endsWith(",X")?e=A.length>5?s.ABS_X:s.ZP_X:A.endsWith(",Y")?e=A.length>5?s.ABS_Y:s.ZP_Y:e=A.length>3?s.ABS:s.ZP_REL,A.startsWith("$")&&(A="0x"+A.substring(1)),t=parseInt(A);const n=Ss(A);if(n.operation&&n.value){switch(n.operation){case"+":t+=n.value;break;case"-":t-=n.value;break;default:console.error("Unknown operation in operand: "+A)}t=(t%65536+65536)%65536}}return[e,t]};let Pe={};const Es=(A,e,t,n)=>{let i=s.IMPLIED,I=-1;if(t.match(/^[#]?[$0-9()]+/))return Object.entries(Pe).forEach(([l,D])=>{t=t.replace(new RegExp(`\\b${l}\\b`,"g"),"$"+M(D))}),fs(t);const C=Ss(t);if(C.label){const l=C.label.startsWith("<"),D=C.label.startsWith(">"),d=C.label.startsWith("#")||D||l;if(d&&(C.label=C.label.substring(1)),C.label in Pe?(I=Pe[C.label],D?I=I>>8&255:l&&(I=I&255)):n===2&&console.error("Missing label: "+C.label),C.operation&&C.value){switch(C.operation){case"+":I+=C.value;break;case"-":I-=C.value;break;default:console.error("Unknown operation in operand: "+t)}I=(I%65536+65536)%65536}dt(e)?(i=s.ZP_REL,I=I-A+254,I>255&&(I-=256)):d?i=s.IMM:(i=I>=0&&I<=255?s.ZP_REL:s.ABS,i=C.idx==="X"?i===s.ABS?s.ABS_X:s.ZP_X:i,i=C.idx==="Y"?i===s.ABS?s.ABS_Y:s.ZP_Y:i)}return[i,I]},xc=(A,e)=>{A=A.replace(/\s+/g," ");const t=A.split(" ");return{label:t[0]?t[0]:e,instr:t[1]?t[1]:"",operand:t[2]?t[2]:""}},Vc=(A,e)=>{if(A.label in Pe&&console.error("Redefined label: "+A.label),A.instr==="EQU"){const[t,n]=Es(e,A.instr,A.operand,2);t!==s.ABS&&t!==s.ZP_REL&&console.error("Illegal EQU value: "+A.operand),Pe[A.label]=n}else Pe[A.label]=e},Jc=A=>{const e=[];switch(A.instr){case"ASC":case"DA":{let t=A.operand,n=0;t.startsWith('"')&&t.endsWith('"')?n=128:t.startsWith("'")&&t.endsWith("'")?n=0:console.error("Invalid string: "+t),t=t.substring(1,t.length-1);for(let i=0;i<t.length;i++)e.push(t.charCodeAt(i)|n);e.push(0);break}case"HEX":{(A.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(i=>{const I=parseInt(i,16);isNaN(I)&&console.error(`Invalid HEX value: ${i} in ${A.operand}`),e.push(I)});break}default:console.error("Unknown pseudo ops: "+A.instr);break}return e},jc=(A,e)=>{const t=[],n=v[A];return t.push(A),e>=0&&(t.push(e%256),n.bytes===3&&t.push(Math.trunc(e/256))),t};let ko=0;const Bs=(A,e)=>{let t=ko;const n=[];let i="";if(A.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;let C=(I+"                   ").slice(0,30)+M(t,4)+"- ";const l=xc(I,i);if(i="",!l.instr){i=l.label;return}if(l.instr==="ORG"){if(e===1){const[N,T]=fs(l.operand);N===s.ABS&&(ko=T,t=T)}nr&&e===2&&console.log(C);return}if(e===1&&l.label&&Vc(l,t),l.instr==="EQU")return;let D=[],d,m;if(["ASC","DA","HEX"].includes(l.instr))D=Jc(l),t+=D.length;else if([d,m]=Es(t,l.instr,l.operand,e),e===2&&isNaN(m)&&console.error(`Unknown/illegal value: ${I}`),l.instr==="DB")D.push(m&255),t++;else if(l.instr==="DW")D.push(m&255),D.push(m>>8&255),t+=2;else if(l.instr==="DS")for(let N=0;N<m;N++)D.push(0),t++;else{e===2&&dt(l.instr)&&(m<0||m>255)&&console.error(`Branch instruction out of range: ${I} value: ${m} pass: ${e}`);const N=v.findIndex(T=>T&&T.name===l.instr&&T.mode===d);N<0&&console.error(`Unknown instruction: "${I}" mode=${d} pass=${e}`),D=jc(N,m),t+=v[N].bytes}nr&&e===2&&(D.forEach(N=>{C+=` ${M(N)}`}),console.log(C)),n.push(...D)}),nr&&e===2){let I="";n.forEach(C=>{I+=` ${M(C)}`}),console.log(I)}return n},sr=(A,e,t=!1)=>{Pe={},nr=t;try{return ko=A,Bs(e,1),Bs(e,2)}catch(n){return console.error(n),[]}},Hc=`
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
`;let Qe=49286,ir=49289,ar=49291,cr=49292,lr=49293,ur=49294,Ir=49295;const Ds=(A,e,t,n,i)=>{const I=A&255,C=A>>8&3,l=e&255,D=e>>8&3;Z(t,I),Z(n,C<<4|D),Z(i,l)},ms=(A,e,t)=>{const n=SA(A),i=SA(e),I=SA(t),C=i>>4&3,l=i&3;return[n|C<<8,I|l<<8]},hr=()=>ms(ir,ar,cr),wo=()=>ms(lr,ur,Ir),gr=(A,e)=>{Ds(A,e,ir,ar,cr)},pr=(A,e)=>{Ds(A,e,lr,ur,Ir)},Cr=A=>{Z(Qe,A),ei(!!A)},vc=()=>{MA=0,qA=0,gr(0,1023),pr(0,1023),Cr(0),uA=0,ue=0,We=0,gt=0,pt=0,TA=0,NA=0,Ne=0,Sr=0};let MA=0,qA=0,Sr=0,uA=0,ue=0,We=0,gt=0,pt=0,TA=0,NA=0,Ne=0,ks=0,gA=5;const fr=54,Er=55,zc=56,$c=57,ws=()=>{const A=new Uint8Array(256).fill(0),e=sr(0,Hc.split(`
`));return A.set(e,0),A[251]=214,A[255]=1,A},Al=(A=!0,e=5)=>{if(!A)return;gA=e;const t=49152+gA*256,n=49152+gA*256+8;Ye(gA,ws(),t,rl),Ye(gA,ws(),n,Xc),ot(gA,sl),Qe=49280+(Qe&15)+gA*16,ir=49280+(ir&15)+gA*16,ar=49280+(ar&15)+gA*16,cr=49280+(cr&15)+gA*16,lr=49280+(lr&15)+gA*16,ur=49280+(ur&15)+gA*16,Ir=49280+(Ir&15)+gA*16;const[i,I]=hr();i===0&&I===0&&(gr(0,1023),pr(0,1023)),SA(Qe)!==0&&ei(!0)},el=()=>{const A=SA(Qe);if(A&1){let e=!1;A&8&&(Ne|=8,e=!0),A&ue&4&&(Ne|=4,e=!0),A&ue&2&&(Ne|=2,e=!0),e&&rt(gA,!0)}},tl=A=>{if(SA(Qe)&1)if(A.buttons>=0){switch(A.buttons){case 0:uA&=-129;break;case 16:uA|=128;break;case 1:uA&=-17;break;case 17:uA|=16;break}ue|=uA&128?4:0}else{if(A.x>=0&&A.x<=1){const[t,n]=hr();MA=Math.round((n-t)*A.x+t),ue|=2}if(A.y>=0&&A.y<=1){const[t,n]=wo();qA=Math.round((n-t)*A.y+t),ue|=2}}};let Ct=0,To="",Ts=0,ds=0;const rl=()=>{const A=192+gA;B(Er)===A&&B(fr)===0?nl():B($c)===A&&B(zc)===0&&ol()},ol=()=>{if(Ct===0){const A=192+gA;Ts=B(Er),ds=B(fr),k(Er,A),k(fr,3);const e=(uA&128)!==(We&128);let t=0;uA&128?t=e?2:1:t=e?3:4,B(49152)&128&&(t=-t),We=uA,To=MA.toString()+","+qA.toString()+","+t.toString()}Ct>=To.length?(c.Accum=141,Ct=0,k(Er,Ts),k(fr,ds)):(c.Accum=To.charCodeAt(Ct)|128,Ct++)},nl=()=>{switch(c.Accum){case 128:console.log("mouse off"),Cr(0);break;case 129:console.log("mouse on"),Cr(1);break}},sl=(A,e)=>{if(A>=49408)return-1;const t=e<0,n={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(A&15){case n.LOWX:if(t)return MA&255;TA=TA&65280|e,TA&=65535;break;case n.HIGHX:if(t)return MA>>8&255;TA=e<<8|TA&255,TA&=65535;break;case n.LOWY:if(t)return qA&255;NA=NA&65280|e,NA&=65535;break;case n.HIGHY:if(t)return qA>>8&255;NA=e<<8|NA&255,NA&=65535;break;case n.STATUS:return uA;case n.MODE:if(t)return SA(Qe);Cr(e);break;case n.CLAMP:if(t){const[I,C]=hr(),[l,D]=wo();switch(Sr){case 0:return I>>8&255;case 1:return l>>8&255;case 2:return I&255;case 3:return l&255;case 4:return C>>8&255;case 5:return D>>8&255;case 6:return C&255;case 7:return D&255;default:return console.log("AppleMouse: invalid clamp index: "+Sr),0}}Sr=78-e;break;case n.CLOCK:case n.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case n.COMMAND:if(t)return ks;switch(ks=e,e){case i.INIT:MA=0,qA=0,gt=0,pt=0,gr(0,1023),pr(0,1023),uA=0,ue=0;break;case i.READ:ue=0,uA&=-112,uA|=We>>1&64,uA|=We>>4&1,We=uA,(gt!==MA||pt!==qA)&&(uA|=32,gt=MA,pt=qA);break;case i.CLEAR:console.log("cmd.clear"),MA=0,qA=0,gt=0,pt=0;break;case i.SERVE:uA&=-15,uA|=Ne,Ne=0,rt(gA,!1);break;case i.HOME:{const[I]=hr(),[C]=wo();MA=I,qA=C}break;case i.CLAMPX:{const I=TA>32767?TA-65536:TA,C=NA;gr(I,C),console.log(I+" -> "+C)}break;case i.CLAMPY:{const I=TA>32767?TA-65536:TA,C=NA;pr(I,C),console.log(I+" -> "+C)}break;case i.GCLAMP:console.log("cmd.getclamp");break;case i.POS:MA=TA,qA=NA;break}break;default:console.log("AppleMouse unknown IO addr",A.toString(16));break}return e},GA={RX_FULL:1,TX_EMPTY:2,DCD:4,OVRN:32,IRQ:128},Ge={COUNTER_DIV:3,TX_RTS:96,RX_INT_ENABLE:128},il={RESET:3},ys={RTS_TX_INT:32},al=320;class cl{_control;_status;_lastRead;_receiveBuffer;_extFuncs;_outCount;_outDelay;update(e){(this._status&GA.TX_EMPTY)===0&&(this._outDelay+=e,this._outDelay>al&&(this._outDelay=0,this._status|=GA.TX_EMPTY,(this._control&Ge.TX_RTS)===ys.RTS_TX_INT&&this.irq(!0)))}buffer(e){for(let n=0;n<e.length;n++)this._receiveBuffer.push(e[n]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let n=0;n<t;n++)this._receiveBuffer.shift(),this._status|=GA.OVRN;this._status|=GA.RX_FULL,this._control&Ge.RX_INT_ENABLE&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._status&=-3,this._outCount++}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-117,this._receiveBuffer.length?(this._status|=GA.RX_FULL,this._control&Ge.RX_INT_ENABLE&&this.irq(!0)):(this._status&=-2,this.irq(!1)),this._lastRead}set control(e){this._control,this._control=e,(this._control&Ge.COUNTER_DIV)===il.RESET?this.reset():(this._control&Ge.TX_RTS)==ys.RTS_TX_INT&&(this._status&=-3),this._status&GA.RX_FULL&&this._control&Ge.RX_INT_ENABLE&&this.irq(!0)}get status(){const e=this._status;return this._status&GA.IRQ&&this.irq(!1),e}irq(e){e?this._status|=GA.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=GA.TX_EMPTY|GA.DCD,this.irq(!1),this._receiveBuffer=[],this._outCount=0,this._outDelay=0}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this._outCount=0,this._outDelay=0,this.reset()}}const IA={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},ll={ANY_IRQ:128},ul=(A,e)=>{let t="";if(e&IA.OUTPUT_ENABLE?t+="OE   ":t+="/OE  ",e&IA.IRQ_ENABLE?t+="IRQ  ":t+="/IRQ ",e&IA.BIT8_MODE?t+="D8BIT ":t+="16BIT ",e&IA.INTERNAL_CLOCK?t+="ICLK ":t+="ECLK ",e&IA.SPECIAL)switch(A){case 0:t+="RST  ";break;case 1:t+="WR0  ";break;case 2:t+="DIV8 ";break}else switch(A){case 0:t+="RUN  ";break;case 1:t+="WR2  ";break;case 2:t+="DIV1 ";break}switch(t+="-> ",e&IA.COUNTER_MODE){case 0:t+="CONTINUOUS0";break;case 8:t+="FREQUENCY_CMP0";break;case 16:t+="CONTINUOUS1";break;case 24:t+="PULSE_WIDTH_CMP0";break;case 32:t+="SINGLE_SHOT0";break;case 40:t+="FREQUENCY_CMP1";break;case 48:t+="SINGLE_SHOT1";break;case 56:t+="PULSE_WIDTH_CMP1";break}return t};class yo{_latch;_count;_control;_enabled;decrement(e){return this._enabled?(this._count-=e,this._count<0?(this._count=65535,this._enabled=!1,!0):!1):!1}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&IA.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch,this._enabled=!0}reset(){this._latch=65535,this._control=0,this._enabled=!0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0,this._enabled=!0}}class Il{_timer;_status;_irqMask;_debugStatus;_debugStatusCount;_statusRead;_msb;_lsb;_div8;_interrupt;status(){return this._statusRead=this._status&7,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&IA.SPECIAL?0:2);let n=this._timer[e].control;if(this._timer[e].control=t,n!=t&&(t&IA.IRQ_ENABLE?this._irqMask|=1<<e:this._irqMask&=~(1<<e),e==0))switch((n&IA.SPECIAL)<<1|t&IA.SPECIAL){case 0:case 3:break;case 1:case 2:this._timer[0].reload(),this._timer[1].reload(),this._timer[2].reload(),this.irq(0,!1),this.irq(1,!1),this.irq(2,!1);break}}timerLSBw(e,t){const n=this._timer[0].control&IA.SPECIAL;let i=!1;switch(this._timer[e].control&IA.COUNTER_MODE){case 16:case 48:i=!0;break}const I=this._msb*256+t;this._timer[e].latch=I,(n||i)&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){const n=this._timer[0].control&IA.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=n&255,this._statusRead&1<<e&&(this._statusRead&=~(1<<e),this.irq(e,!1)),n>>8&255}update(e){const t=this._timer[0].control&IA.SPECIAL;if(this._debugStatus&&(this._debugStatusCount++,this._debugStatusCount>1020300&&(this._debugStatusCount=0,this.printStatus())),!t){this._div8+=e;let n=!1;for(let i=0;i<3;i++){let I=e;if(i==2&&this._timer[2].control&IA.SPECIAL)if(this._div8>8)I=Math.floor(this._div8/8),this._div8%=8;else continue;if(n=this._timer[i].decrement(I),n)switch(this.irq(i,!0),this._timer[i].control&IA.COUNTER_MODE){case 0:case 16:this._timer[i].reload();break}}}}irq(e,t){const n=1<<e;t?this._status|=n:this._status&=~n,this._status&this._irqMask?(this._status|=ll.ANY_IRQ,this._statusRead&=~n,this._interrupt(!0)):(this._status&=-129,this._interrupt(!1))}printStatus(){console.log("Status : "+this._status.toString(16)),console.log("IRQMask: "+this._irqMask.toString(16));for(let e=0;e<3;e++)console.log("["+e+"]: "+ul(e,this._timer[e].control)+" : "+this._timer[e].latch+" : "+this._timer[e].count)}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this._irqMask=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=IA.SPECIAL}constructor(e){this._interrupt=e,this._status=0,this._irqMask=0,this._statusRead=0,this._timer=[new yo,new yo,new yo],this._msb=this._lsb=0,this._div8=0,this._debugStatus=!1,this._debugStatusCount=0,this.reset()}}let Br=2,iA,zA,Ro=0;const hl=A=>{if(Ro){const e=c.cycleCount-Ro;iA.update(e),zA.update(e)}Ro=c.cycleCount},Rs=A=>{rt(Br,A)},gl=A=>{zA&&zA.buffer(A)},pl=(A=!0,e=2)=>{if(!A)return;Br=e,iA=new Il(Rs);const t={sendData:w0,interrupt:Rs};zA=new cl(t),ot(Br,Sl),Fn(hl,Br)},Cl=()=>{iA&&(iA.reset(),zA.reset())},Sl=(A,e=-1)=>{if(A>=49408)return-1;const t={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let n=-1;switch(A&15){case t.SDMIDIDATA:case t.ACIADATA:e>=0?zA.data=e:n=zA.data;break;case t.SDMIDICTRL:case t.ACIASTATCTRL:e>=0?zA.control=e:n=zA.status;break;case t.TCONTROL1:e>=0?iA.timerControl(0,e):n=0;break;case t.TCONTROL2:e>=0?iA.timerControl(1,e):n=iA.status();break;case t.T1MSB:e>=0?iA.timerMSBw(0,e):n=iA.timerMSBr(0);break;case t.T1LSB:e>=0?iA.timerLSBw(0,e):n=iA.timerLSBr(0);break;case t.T2MSB:e>=0?iA.timerMSBw(1,e):n=iA.timerMSBr(1);break;case t.T2LSB:e>=0?iA.timerLSBw(1,e):n=iA.timerLSBr(1);break;case t.T3MSB:e>=0?iA.timerMSBw(2,e):n=iA.timerMSBr(2);break;case t.T3LSB:e>=0?iA.timerLSBw(2,e):n=iA.timerLSBr(2);break;case t.DRUMSET:case t.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(A&15).toString(16));break}return n},fl=(A=!0,e=4)=>{A&&(ot(e,ql),Fn(Ql,e))},Po=[0,128],Qo=[1,129],El=[2,130],Bl=[3,131],_e=[4,132],Ze=[5,133],Dr=[6,134],Fo=[7,135],St=[8,136],ft=[9,137],Dl=[10,138],Lo=[11,139],ml=[12,140],Fe=[13,141],Et=[14,142],Ps=[16,145],Qs=[17,145],_A=[18,146],bo=[32,160],$A=64,Ie=32,kl=(A=4)=>{for(let e=0;e<=255;e++)O(A,e,0);for(let e=0;e<=1;e++)Mo(A,e)},wl=(A,e)=>(V(A,Et[e])&$A)!==0,Tl=(A,e)=>(V(A,_A[e])&$A)!==0,Fs=(A,e)=>(V(A,Lo[e])&$A)!==0,dl=(A,e,t)=>{let n=V(A,_e[e])-t;if(O(A,_e[e],n),n<0){n=n%256+256,O(A,_e[e],n);let i=V(A,Ze[e]);if(i--,O(A,Ze[e],i),i<0&&(i+=256,O(A,Ze[e],i),wl(A,e)&&(!Tl(A,e)||Fs(A,e)))){const I=V(A,_A[e]);O(A,_A[e],I|$A);const C=V(A,Fe[e]);if(O(A,Fe[e],C|$A),he(A,e,-1),Fs(A,e)){const l=V(A,Fo[e]),D=V(A,Dr[e]);O(A,_e[e],D),O(A,Ze[e],l)}}}},yl=(A,e)=>(V(A,Et[e])&Ie)!==0,Rl=(A,e)=>(V(A,_A[e])&Ie)!==0,Pl=(A,e,t)=>{if((V(A,Lo[e])&Ie)!==0)return;let n=V(A,St[e])-t;if(O(A,St[e],n),n<0){n=n%256+256,O(A,St[e],n);let i=V(A,ft[e]);if(i--,O(A,ft[e],i),i<0&&(i+=256,O(A,ft[e],i),yl(A,e)&&!Rl(A,e))){const I=V(A,_A[e]);O(A,_A[e],I|Ie);const C=V(A,Fe[e]);O(A,Fe[e],C|Ie),he(A,e,-1)}}},Ls=new Array(8).fill(0),Ql=A=>{const e=c.cycleCount-Ls[A];for(let t=0;t<=1;t++)dl(A,t,e),Pl(A,t,e);Ls[A]=c.cycleCount},Fl=(A,e)=>{const t=[];for(let n=0;n<=15;n++)t[n]=V(A,bo[e]+n);return t},Ll=(A,e)=>A.length===e.length&&A.every((t,n)=>t===e[n]),Xe={slot:-1,chip:-1,params:[-1]};let Mo=(A,e)=>{const t=Fl(A,e);A===Xe.slot&&e===Xe.chip&&Ll(t,Xe.params)||(Xe.slot=A,Xe.chip=e,Xe.params=t,m0({slot:A,chip:e,params:t}))};const bl=(A,e)=>{switch(V(A,Po[e])&7){case 0:for(let n=0;n<=15;n++)O(A,bo[e]+n,0);Mo(A,e);break;case 7:O(A,Qs[e],V(A,Qo[e]));break;case 6:{const n=V(A,Qs[e]),i=V(A,Qo[e]);n>=0&&n<=15&&(O(A,bo[e]+n,i),Mo(A,e));break}}},he=(A,e,t)=>{let n=V(A,Fe[e]);switch(t>=0&&(n&=127-(t&127),O(A,Fe[e],n)),e){case 0:rt(A,n!==0);break;case 1:da(n!==0);break}},Ml=(A,e,t)=>{let n=V(A,Et[e]);t>=0&&(t=t&255,t&128?n|=t:n&=255-t),n|=128,O(A,Et[e],n)},ql=(A,e=-1)=>{if(A<49408)return-1;const t=(A&3840)>>8,n=A&255,i=n&128?1:0;switch(n){case Po[i]:e>=0&&(O(t,Po[i],e),bl(t,i));break;case Qo[i]:case El[i]:case Bl[i]:case Dl[i]:case Lo[i]:case ml[i]:O(t,n,e);break;case _e[i]:e>=0&&O(t,Dr[i],e),he(t,i,$A);break;case Ze[i]:if(e>=0){O(t,Fo[i],e),O(t,_e[i],V(t,Dr[i])),O(t,Ze[i],e);const I=V(t,_A[i]);O(t,_A[i],I&~$A),he(t,i,$A)}break;case Dr[i]:e>=0&&(O(t,n,e),he(t,i,$A));break;case Fo[i]:e>=0&&O(t,n,e);break;case St[i]:e>=0&&O(t,Ps[i],e),he(t,i,Ie);break;case ft[i]:if(e>=0){O(t,ft[i],e),O(t,St[i],V(t,Ps[i]));const I=V(t,_A[i]);O(t,_A[i],I&~Ie),he(t,i,Ie)}break;case Fe[i]:e>=0&&he(t,i,e);break;case Et[i]:Ml(t,i,e);break}return-1};let xe=0;const mr=192,Kl=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${M(mr)}   ; jump address
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
`,Ul=`
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
`,Yl=()=>{const A=new Uint8Array(256).fill(0),e=sr(0,Kl.split(`
`));A.set(e,0);const t=sr(0,Ul.split(`
`));return A.set(t,mr),A[254]=23,A[255]=mr,A};let Bt=new Uint8Array;const qo=(A=!0)=>{Bt.length===0&&(Bt=Yl()),Bt[1]=A?32:0;const t=49152+mr+7*256;Ye(7,Bt,t,_l),Ye(7,Bt,t+3,Gl)},Ol=(A,e)=>{if(A===0)k(e,2);else if(A<=2){k(e,240);const[,,t]=rr(A),n=t/512;k(e+1,n&255),k(e+2,n>>>8),k(e+3,0),st(4),it(0)}else nt(40),st(0),it(0),U()},Wl=(A,e)=>{const[,,t]=rr(A),n=t/512,i=n>1600?2:1,I=i==2?32:64;k(e,240),k(e+1,n&255),k(e+2,n>>>8),k(e+3,0);const C="Apple2TS SP";k(e+4,C.length);let l=0;for(;l<C.length;l++)k(e+5+l,C.charCodeAt(l));for(;l<16;l++)k(e+5+l,C.charCodeAt(8));k(e+21,i),k(e+22,I),k(e+23,1),k(e+24,0),st(25),it(0)},Nl=(A,e,t)=>{if(B(A)!==3){console.error(`Incorrect SmartPort parameter count at address ${A}`),nt(4),U();return}const n=B(A+4);switch(n){case 0:Ol(e,t);break;case 1:case 2:nt(33),U();break;case 3:case 4:Wl(e,t);break;default:console.error(`SmartPort statusCode ${n} not implemented`);break}},Gl=()=>{nt(0),U(!1);const A=256+c.StackPtr,e=B(A+1)+256*B(A+2),t=B(e+1),n=B(e+2)+256*B(e+3),i=B(n+1),I=B(n+2)+256*B(n+3);switch(t){case 0:{Nl(n,i,I);return}case 1:{if(B(n)!==3){console.error(`Incorrect SmartPort parameter count at address ${n}`),U();return}const D=512*(B(n+4)+256*B(n+5)+65536*B(n+6)),[d,m]=rr(i),Q=d.slice(D+m,D+512+m);uo(I,Q);break}default:console.error(`SmartPort command ${t} not implemented`),U();return}const C=Do(i);C.motorRunning=!0,xe||(xe=setTimeout(()=>{xe=0,C&&(C.motorRunning=!1),wA()},500)),wA()},_l=()=>{nt(0),U(!1);const A=B(66),e=Math.max(Math.min(B(67)>>6,2),0),t=Do(e);if(!t.hardDrive)return;const[n,i,I]=rr(e),C=B(70)+256*B(71),l=512*C,D=B(68)+256*B(69);switch(t.status=` ${M(C,4)}`,A){case 0:{if(t.filename.length===0||I===0){st(0),it(0),U();return}const d=I/512;st(d&255),it(d>>>8);break}case 1:{if(l+512>I){U();return}const d=n.slice(l+i,l+512+i);uo(D,d);break}case 2:{if(l+512>I){U();return}if(t.isWriteProtected){U();return}const d=lo(D);n.set(d,l+i),t.diskHasChanges=!0,t.lastAppleWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),U();return;default:console.error("unknown hard drive command"),U();return}U(!1),t.motorRunning=!0,xe||(xe=setTimeout(()=>{xe=0,t&&(t.motorRunning=!1),wA()},500)),wA()},bs=`
        ORG   $300
        LDA   $C050
        LDA   $C052
        LDA   $C057
LOOP    LDA   $C055
        LDA   #$4F ;73
        JSR   $FCA8
        LDA   #$09
        JSR   $FCA8
        BIT   $01
        LDA   $C054
        LDA   #$4F ;73
        JSR   $FCA8
        LDA   #$09
        JSR   $FCA8
        JMP   LOOP
        RTS
`;let Ms=0,kr=0,Dt=0,wr=0,qs=!1,Ko="default",Uo=!1,Ks=16.6881,Yo=17030,Us=0,rA=G.IDLE,ge="APPLE2EE",mt=0,Tr=!1,dA=0;const X=[];let kt=0,dr=!1,Le=Si;const Ys=()=>dr,Oo=A=>{dr=A,LA()},Zl=A=>{Le=A},x=[],Xl=()=>{if(x.length<50)return;const A=10,e=399,t=x[x.length-1].slice(A,e);let n=x.length-2;const i=Math.max(x.length-20,0);let I=-1;for(;n>=i;){const l=x[n];if(l.startsWith("... repeats"))return;if(l.slice(A,e)===t){I=n;break}n--}const C=x.length-I-1;if(!(I===-1||x.length-2*C<0)){for(let l=I-1;l>=I-C+1;l--)if(x[l].slice(A,e)!==x[l+C].slice(A,e))return;if(I>=C&&x[I-C].slice(0,12)==="... repeats "){x.splice(I-C+1,C);const l=parseInt(x[I-C].slice(12))+1;x[I-C]=`... repeats ${l}`;for(let D=I-C+1;D<x.length;D++)x[D]="..."+x[D].slice(3)}else{x[I]="... repeats 1",x.splice(I-C+1,C-1);for(let l=I-C+1;l<x.length;l++)x[l]="..."+x[l].slice(3)}}},Wo=A=>{x.length>101&&x.shift(),x.push(A),Xl()},xl=()=>rA===G.PAUSED?x:[],Vl=()=>{f.VBL.isSet=!0,el()},Jl=()=>{f.VBL.isSet=!1},Os=()=>{const A={};for(const e in f)A[e]=f[e].isSet;return A},jl=()=>{const A=JSON.parse(JSON.stringify(c));let e=XA;for(let n=XA;n<F.length;n++)F[n]!==255&&(n+=255-n%256,e=n+1);const t=Me.Buffer.from(F.slice(0,e));return{s6502:A,extraRamSize:64*(YA+1),machineName:ge,softSwitches:Os(),stackDump:$a(),memory:t.toString("base64")}},Hl=(A,e)=>{const t=JSON.parse(JSON.stringify(A.s6502));Zn(t);const n=A.softSwitches;for(const I in n){const C=I;try{f[C].isSet=n[I]}catch{}}"WRITEBSR1"in n&&(f.BSR_PREWRITE.isSet=!1,f.BSR_WRITE.isSet=n.WRITEBSR1||n.WRITEBSR2||n.RDWRBSR1||n.RDWRBSR2);const i=new Uint8Array(Me.Buffer.from(A.memory,"base64"));if(e<1){F.set(i.slice(0,65536)),F.set(i.slice(131072,163584),65536),F.set(i.slice(65536,131072),XA);const I=(i.length-163584)/1024;I>0&&(to(I+64),F.set(i.slice(163584),XA+65536))}else to(A.extraRamSize),F.set(i);A.stackDump&&Ac(A.stackDump),ge=A.machineName||"APPLE2EE",Go(ge,!1),xA(),Xr(!0)},No=A=>({emulator:null,state6502:jl(),driveState:bc(A),thumbnail:"",snapshots:null}),vl=()=>{const A=No(!0);return A.snapshots=X,A},zl=A=>{Zn(A),LA()},$l=A=>{at(A),LA()},A0=A=>{Uo=A,LA()},yr=(A,e=!1)=>{Pr();const t=A.emulator?.version?A.emulator.version:.9;Hl(A.state6502,t),Mc(A.driveState),e&&(X.length=0,dA=0),A.snapshots&&(X.length=0,X.push(...A.snapshots),dA=X.length),LA()};let Ws=!1;const Ns=()=>{Ws||(Ws=!0,_c(),pl(!0,2),fl(!0,4),Al(!0,5),Qc(),qo(),ac())},e0=()=>{qc(),Nr(),vc(),Cl(),Gc(),kl(4)},Rr=()=>{if(at(0),Za(),On(ge),Ns(),bs.length>0){const e=sr(768,bs.split(`
`));F.set(e,768)}Pr(),Xr(!0),Do(1).filename===""&&(qo(!1),setTimeout(()=>{qo()},200))},Pr=()=>{if(ya(),ua(),B(49282),Xn(),e0(),dr){Oo(!1);const A=c.PC,e=setInterval(()=>{c.PC-A>1e3&&(Oo(!0),clearInterval(e))},50)}},t0=A=>{Dt=A,Ks=Dt===4?1:16.6881,Yo=17030*[.1,.5,1,2,3,4,4][Dt+2],Vs()},r0=A=>{Ko=A},o0=()=>Ko==="game"||Ko==="embed",n0=A=>{qs=A,LA()},s0=(A,e)=>{A>>8===192?k(A,e):F[A]=e,LA()},Go=(A,e=!0)=>{ge!==A&&(ge=A,On(ge),e&&Pr(),LA())},i0=A=>{to(A),LA()},Gs=()=>{const A=dA-1;return A<0||!X[A]?-1:A},_s=()=>{const A=dA+1;return A>=X.length||!X[A]?-1:A},Zs=()=>{X.length===fi&&X.shift(),X.push(No(!1)),dA=X.length,T0(X[X.length-1].state6502.s6502.PC)},a0=()=>{let A=Gs();A<0||(KA(G.PAUSED),setTimeout(()=>{dA===X.length&&(Zs(),A=Math.max(dA-2,0)),dA=A,yr(X[dA])},50))},c0=()=>{const A=_s();A<0||(KA(G.PAUSED),setTimeout(()=>{dA=A,yr(X[A])},50))},l0=A=>{A<0||A>=X.length||(KA(G.PAUSED),setTimeout(()=>{dA=A,yr(X[A])},50))},u0=()=>{const A=[];for(let e=0;e<X.length;e++)A[e]={s6502:X[e].state6502.s6502,thumbnail:X[e].thumbnail};return A},I0=A=>{X.length>0&&(X[X.length-1].thumbnail=A)};let Qr=null;const _o=(A=!1)=>{Qr&&clearTimeout(Qr),A?Qr=setTimeout(()=>{Tr=!0,Qr=null},100):Tr=!0},Xs=()=>{Mt(),rA===G.IDLE&&(Rr(),rA=G.PAUSED),Le||(x.length=0),vr(Le?Wo:null),KA(G.PAUSED)},h0=()=>{Mt(),rA===G.IDLE&&(Rr(),rA=G.PAUSED),B(c.PC,!1)===32?(Le||(x.length=0),vr(Le?Wo:null),xs()):Xs()},xs=()=>{Mt(),rA===G.IDLE&&(Rr(),rA=G.PAUSED),ma(),KA(G.RUNNING)},Vs=()=>{mt=0,kr=performance.now(),Ms=kr},KA=(A,e=!0)=>{if(Ns(),e&&rA===G.RUNNING&&A===G.PAUSED&&(Uo=!0),rA=A,rA===G.PAUSED)pa(),kt&&(clearInterval(kt),kt=0),Cs();else if(rA===G.RUNNING){for(Cs(!0),Mt();X.length>0&&dA<X.length-1;)X.pop();dA=X.length,kt||(kt=setInterval(Xr,1e3))}Le||(x.length=0),LA(),Vs(),wr===0&&(wr=1,vs())},Js=A=>{rA===G.IDLE?(KA(G.NEED_BOOT),setTimeout(()=>{KA(G.NEED_RESET),setTimeout(()=>{A()},200)},200)):A()},g0=(A,e,t)=>{Js(()=>{uo(A,e),t&&OA(A)})},p0=A=>{Js(()=>{ia(A)})},C0=()=>rA===G.PAUSED?va():new Uint8Array,S0=()=>rA!==G.IDLE?ec():"";let js=!1;const LA=()=>{const A={addressGetTable:nA,altChar:f.ALTCHARSET.isSet,breakpoints:lA,button0:f.PB0.isSet,button1:f.PB1.isSet,canGoBackward:Gs()>=0,canGoForward:_s()>=0,c800Slot:Ao(),cout:B(57)<<8|B(56),cpuSpeed:wr,extraRamSize:64*(YA+1),hires:ja(),iTempState:dA,isDebugging:qs,isTracing:!1,lores:so(!0),machineName:ge,memoryDump:C0(),noDelayMode:!f.COLUMN80.isSet&&f.DHIRES.isSet,ramWorksBank:we(),runMode:rA,s6502:c,showDebugTab:Uo,siriusJoyport:dr,softSwitches:Os(),speedMode:Dt,stackString:S0(),textPage:so(),timeTravelThumbnails:u0(),tracelog:xl(),zeroPage:Ha()};E0(A),js||(js=!0,d0(ga()))},f0=A=>{if(A)for(let e=0;e<A.length;e++)Ia(A[e]);else ha();A&&(A[0]<=49167||A[0]>=49232)&&xA(),LA()},Hs=()=>{const A=performance.now();if(Us=A-kr,Us<Ks||(kr=A,rA===G.IDLE||rA===G.PAUSED))return;rA===G.NEED_BOOT?(Rr(),KA(G.RUNNING)):rA===G.NEED_RESET&&(Pr(),KA(G.RUNNING));let e=0,t=-1;for(;;){const i=vr(Le?Wo:null);if(i<0)break;if(e+=i,e<4550)f.VBL.isSet||Vl();else{Jl();const I=Math.floor((e-4550)/65);I!==t&&I<192&&(t=I,Ja(I))}if(e>=Yo)break}mt++;const n=mt*Yo/(performance.now()-Ms);wr=n<1e4?Math.round(n/10)/100:Math.round(n/100)/10,Qi(),LA(),Tr&&(Tr=!1,Zs())},vs=()=>{Hs();const A=mt+[1,1,1,5,5,5,10][Dt+2];for(;rA===G.RUNNING&&mt!==A;)Hs();setTimeout(vs,rA===G.RUNNING?0:20)},mA=(A,e)=>{try{self.postMessage({msg:A,payload:e})}catch(t){console.error(`worker2main: doPostMessage error: ${t}`)}},E0=A=>{mA(CA.MACHINE_STATE,A)},B0=A=>{mA(CA.CLICK,A)},D0=A=>{mA(CA.DRIVE_PROPS,A)},Ve=A=>{mA(CA.DRIVE_SOUND,A)},zs=A=>{mA(CA.SAVE_STATE,A)},Fr=A=>{mA(CA.RUMBLE,A)},$s=A=>{mA(CA.HELP_TEXT,A)},Ai=A=>{mA(CA.ENHANCED_MIDI,A)},ei=A=>{mA(CA.SHOW_APPLE_MOUSE,A)},m0=A=>{mA(CA.MBOARD_SOUND,A)},k0=A=>{mA(CA.COMM_DATA,A)},w0=A=>{mA(CA.MIDI_DATA,A)},T0=A=>{mA(CA.REQUEST_THUMBNAIL,A)},d0=A=>{mA(CA.SOFTSWITCH_DESCRIPTIONS,A)},y0=A=>{mA(CA.INSTRUCTIONS,A)};typeof self<"u"&&(self.onmessage=A=>{if(!(!A.data||typeof A.data!="object")&&"msg"in A.data)switch(A.data.msg){case L.RUN_MODE:KA(A.data.payload);break;case L.STATE6502:zl(A.data.payload);break;case L.DEBUG:n0(A.data.payload);break;case L.APP_MODE:r0(A.data.payload);break;case L.SHOW_DEBUG_TAB:A0(A.data.payload);break;case L.BREAKPOINTS:wa(A.data.payload);break;case L.STEP_INTO:Xs();break;case L.STEP_OVER:h0();break;case L.STEP_OUT:xs();break;case L.BASIC_STEP:ka();break;case L.SPEED:t0(A.data.payload);break;case L.TIME_TRAVEL_STEP:A.data.payload==="FORWARD"?c0():a0();break;case L.TIME_TRAVEL_INDEX:l0(A.data.payload);break;case L.TIME_TRAVEL_SNAPSHOT:_o();break;case L.THUMBNAIL_IMAGE:I0(A.data.payload);break;case L.RESTORE_STATE:yr(A.data.payload,!0);break;case L.KEYPRESS:sa(A.data.payload);break;case L.KEYRELEASE:na();break;case L.MOUSEEVENT:tl(A.data.payload);break;case L.PASTE_TEXT:p0(A.data.payload);break;case L.APPLE_PRESS:on(!0,A.data.payload);break;case L.APPLE_RELEASE:on(!1,A.data.payload);break;case L.GET_SAVE_STATE:zs(No(!0));break;case L.GET_SAVE_STATE_SNAPSHOTS:zs(vl());break;case L.DRIVE_PROPS:{const e=A.data.payload;Uc(e);break}case L.DRIVE_NEW_DATA:{const e=A.data.payload;Kc(e);break}case L.GAMEPAD:yi(A.data.payload);break;case L.SET_BINARY_BLOCK:{const e=A.data.payload;g0(e.address,e.data,e.run);break}case L.SET_CYCLECOUNT:$l(A.data.payload);break;case L.SET_MEMORY:{const e=A.data.payload;s0(e.address,e.value);break}case L.COMM_DATA:Nc(A.data.payload);break;case L.MIDI_DATA:gl(A.data.payload);break;case L.RAMWORKS:i0(A.data.payload);break;case L.MACHINE_NAME:Go(A.data.payload);break;case L.SOFTSWITCHES:f0(A.data.payload);break;case L.SIRIUS_JOYPORT:Oo(A.data.payload);break;case L.TRACING:Zl(A.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(A.data)}`);break}})})();
