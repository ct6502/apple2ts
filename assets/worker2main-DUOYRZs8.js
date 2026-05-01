(function(){"use strict";var Fr={},ze={},as;function Qi(){if(as)return ze;as=1,ze.byteLength=u,ze.toByteArray=m,ze.fromByteArray=M;for(var A=[],e=[],t=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,I=s.length;i<I;++i)A[i]=s[i],e[s.charCodeAt(i)]=i;e[45]=62,e[95]=63;function C(d){var W=d.length;if(W%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var j=d.indexOf("=");j===-1&&(j=W);var CA=j===W?0:4-j%4;return[j,CA]}function u(d){var W=C(d),j=W[0],CA=W[1];return(j+CA)*3/4-CA}function D(d,W,j){return(W+j)*3/4-j}function m(d){var W,j=C(d),CA=j[0],EA=j[1],aA=new t(D(d,CA,EA)),kA=0,qe=EA>0?CA-4:CA,oA;for(oA=0;oA<qe;oA+=4)W=e[d.charCodeAt(oA)]<<18|e[d.charCodeAt(oA+1)]<<12|e[d.charCodeAt(oA+2)]<<6|e[d.charCodeAt(oA+3)],aA[kA++]=W>>16&255,aA[kA++]=W>>8&255,aA[kA++]=W&255;return EA===2&&(W=e[d.charCodeAt(oA)]<<2|e[d.charCodeAt(oA+1)]>>4,aA[kA++]=W&255),EA===1&&(W=e[d.charCodeAt(oA)]<<10|e[d.charCodeAt(oA+1)]<<4|e[d.charCodeAt(oA+2)]>>2,aA[kA++]=W>>8&255,aA[kA++]=W&255),aA}function k(d){return A[d>>18&63]+A[d>>12&63]+A[d>>6&63]+A[d&63]}function P(d,W,j){for(var CA,EA=[],aA=W;aA<j;aA+=3)CA=(d[aA]<<16&16711680)+(d[aA+1]<<8&65280)+(d[aA+2]&255),EA.push(k(CA));return EA.join("")}function M(d){for(var W,j=d.length,CA=j%3,EA=[],aA=16383,kA=0,qe=j-CA;kA<qe;kA+=aA)EA.push(P(d,kA,kA+aA>qe?qe:kA+aA));return CA===1?(W=d[j-1],EA.push(A[W>>2]+A[W<<4&63]+"==")):CA===2&&(W=(d[j-2]<<8)+d[j-1],EA.push(A[W>>10]+A[W>>4&63]+A[W<<2&63]+"=")),EA.join("")}return ze}var dt={};var cs;function bi(){return cs||(cs=1,dt.read=function(A,e,t,s,i){var I,C,u=i*8-s-1,D=(1<<u)-1,m=D>>1,k=-7,P=t?i-1:0,M=t?-1:1,d=A[e+P];for(P+=M,I=d&(1<<-k)-1,d>>=-k,k+=u;k>0;I=I*256+A[e+P],P+=M,k-=8);for(C=I&(1<<-k)-1,I>>=-k,k+=s;k>0;C=C*256+A[e+P],P+=M,k-=8);if(I===0)I=1-m;else{if(I===D)return C?NaN:(d?-1:1)*(1/0);C=C+Math.pow(2,s),I=I-m}return(d?-1:1)*C*Math.pow(2,I-s)},dt.write=function(A,e,t,s,i,I){var C,u,D,m=I*8-i-1,k=(1<<m)-1,P=k>>1,M=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,d=s?0:I-1,W=s?1:-1,j=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,C=k):(C=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-C))<1&&(C--,D*=2),C+P>=1?e+=M/D:e+=M*Math.pow(2,1-P),e*D>=2&&(C++,D/=2),C+P>=k?(u=0,C=k):C+P>=1?(u=(e*D-1)*Math.pow(2,i),C=C+P):(u=e*Math.pow(2,P-1)*Math.pow(2,i),C=0));i>=8;A[t+d]=u&255,d+=W,u/=256,i-=8);for(C=C<<i|u,m+=i;m>0;A[t+d]=C&255,d+=W,C/=256,m-=8);A[t+d-W]|=j*128}),dt}var ls;function Li(){return ls||(ls=1,(function(A){const e=Qi(),t=bi(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;A.Buffer=u,A.SlowBuffer=aA,A.INSPECT_MAX_BYTES=50;const i=2147483647;A.kMaxLength=i,u.TYPED_ARRAY_SUPPORT=I(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function I(){try{const a=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(a,r),a.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function C(a){if(a>i)throw new RangeError('The value "'+a+'" is invalid for option "size"');const r=new Uint8Array(a);return Object.setPrototypeOf(r,u.prototype),r}function u(a,r,o){if(typeof a=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return P(a)}return D(a,r,o)}u.poolSize=8192;function D(a,r,o){if(typeof a=="string")return M(a,r);if(ArrayBuffer.isView(a))return W(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(ZA(a,ArrayBuffer)||a&&ZA(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(ZA(a,SharedArrayBuffer)||a&&ZA(a.buffer,SharedArrayBuffer)))return j(a,r,o);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=a.valueOf&&a.valueOf();if(l!=null&&l!==a)return u.from(l,r,o);const g=CA(a);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return u.from(a[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}u.from=function(a,r,o){return D(a,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function m(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function k(a,r,o){return m(a),a<=0?C(a):r!==void 0?typeof o=="string"?C(a).fill(r,o):C(a).fill(r):C(a)}u.alloc=function(a,r,o){return k(a,r,o)};function P(a){return m(a),C(a<0?0:EA(a)|0)}u.allocUnsafe=function(a){return P(a)},u.allocUnsafeSlow=function(a){return P(a)};function M(a,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=kA(a,r)|0;let l=C(o);const g=l.write(a,r);return g!==o&&(l=l.slice(0,g)),l}function d(a){const r=a.length<0?0:EA(a.length)|0,o=C(r);for(let l=0;l<r;l+=1)o[l]=a[l]&255;return o}function W(a){if(ZA(a,Uint8Array)){const r=new Uint8Array(a);return j(r.buffer,r.byteOffset,r.byteLength)}return d(a)}function j(a,r,o){if(r<0||a.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return r===void 0&&o===void 0?l=new Uint8Array(a):o===void 0?l=new Uint8Array(a,r):l=new Uint8Array(a,r,o),Object.setPrototypeOf(l,u.prototype),l}function CA(a){if(u.isBuffer(a)){const r=EA(a.length)|0,o=C(r);return o.length===0||a.copy(o,0,0,r),o}if(a.length!==void 0)return typeof a.length!="number"||is(a.length)?C(0):d(a);if(a.type==="Buffer"&&Array.isArray(a.data))return d(a.data)}function EA(a){if(a>=i)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i.toString(16)+" bytes");return a|0}function aA(a){return+a!=a&&(a=0),u.alloc(+a)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(ZA(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),ZA(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let l=r.length,g=o.length;for(let f=0,E=Math.min(l,g);f<E;++f)if(r[f]!==o[f]){l=r[f],g=o[f];break}return l<g?-1:g<l?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<r.length;++l)o+=r[l].length;const g=u.allocUnsafe(o);let f=0;for(l=0;l<r.length;++l){let E=r[l];if(ZA(E,Uint8Array))f+E.length>g.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(g,f)):Uint8Array.prototype.set.call(g,E,f);else if(u.isBuffer(E))E.copy(g,f);else throw new TypeError('"list" argument must be an Array of Buffers');f+=E.length}return g};function kA(a,r){if(u.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||ZA(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const o=a.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let g=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return ns(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return Pi(a).length;default:if(g)return l?-1:ns(a).length;r=(""+r).toLowerCase(),g=!0}}u.byteLength=kA;function qe(a,r,o){let l=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(a||(a="utf8");;)switch(a){case"hex":return r0(this,r,o);case"utf8":case"utf-8":return Bi(this,r,o);case"ascii":return e0(this,r,o);case"latin1":case"binary":return t0(this,r,o);case"base64":return $1(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o0(this,r,o);default:if(l)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function oA(a,r,o){const l=a[r];a[r]=a[o],a[o]=l}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)oA(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)oA(this,o,o+3),oA(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)oA(this,o,o+7),oA(this,o+1,o+6),oA(this,o+2,o+5),oA(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?Bi(this,0,r):qe.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=A.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(r,o,l,g,f){if(ZA(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),l===void 0&&(l=r?r.length:0),g===void 0&&(g=0),f===void 0&&(f=this.length),o<0||l>r.length||g<0||f>this.length)throw new RangeError("out of range index");if(g>=f&&o>=l)return 0;if(g>=f)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,g>>>=0,f>>>=0,this===r)return 0;let E=f-g,q=l-o;const AA=Math.min(E,q),z=this.slice(g,f),eA=r.slice(o,l);for(let H=0;H<AA;++H)if(z[H]!==eA[H]){E=z[H],q=eA[H];break}return E<q?-1:q<E?1:0};function fi(a,r,o,l,g){if(a.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,is(o)&&(o=g?0:a.length-1),o<0&&(o=a.length+o),o>=a.length){if(g)return-1;o=a.length-1}else if(o<0)if(g)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,l)),u.isBuffer(r))return r.length===0?-1:Ei(a,r,o,l,g);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(a,r,o):Uint8Array.prototype.lastIndexOf.call(a,r,o):Ei(a,[r],o,l,g);throw new TypeError("val must be string, number or Buffer")}function Ei(a,r,o,l,g){let f=1,E=a.length,q=r.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(a.length<2||r.length<2)return-1;f=2,E/=2,q/=2,o/=2}function AA(eA,H){return f===1?eA[H]:eA.readUInt16BE(H*f)}let z;if(g){let eA=-1;for(z=o;z<E;z++)if(AA(a,z)===AA(r,eA===-1?0:z-eA)){if(eA===-1&&(eA=z),z-eA+1===q)return eA*f}else eA!==-1&&(z-=z-eA),eA=-1}else for(o+q>E&&(o=E-q),z=o;z>=0;z--){let eA=!0;for(let H=0;H<q;H++)if(AA(a,z+H)!==AA(r,H)){eA=!1;break}if(eA)return z}return-1}u.prototype.includes=function(r,o,l){return this.indexOf(r,o,l)!==-1},u.prototype.indexOf=function(r,o,l){return fi(this,r,o,l,!0)},u.prototype.lastIndexOf=function(r,o,l){return fi(this,r,o,l,!1)};function J1(a,r,o,l){o=Number(o)||0;const g=a.length-o;l?(l=Number(l),l>g&&(l=g)):l=g;const f=r.length;l>f/2&&(l=f/2);let E;for(E=0;E<l;++E){const q=parseInt(r.substr(E*2,2),16);if(is(q))return E;a[o+E]=q}return E}function j1(a,r,o,l){return Lr(ns(r,a.length-o),a,o,l)}function H1(a,r,o,l){return Lr(a0(r),a,o,l)}function v1(a,r,o,l){return Lr(Pi(r),a,o,l)}function z1(a,r,o,l){return Lr(c0(r,a.length-o),a,o,l)}u.prototype.write=function(r,o,l,g){if(o===void 0)g="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")g=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,g===void 0&&(g="utf8")):(g=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const f=this.length-o;if((l===void 0||l>f)&&(l=f),r.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let E=!1;for(;;)switch(g){case"hex":return J1(this,r,o,l);case"utf8":case"utf-8":return j1(this,r,o,l);case"ascii":case"latin1":case"binary":return H1(this,r,o,l);case"base64":return v1(this,r,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return z1(this,r,o,l);default:if(E)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function $1(a,r,o){return r===0&&o===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(r,o))}function Bi(a,r,o){o=Math.min(a.length,o);const l=[];let g=r;for(;g<o;){const f=a[g];let E=null,q=f>239?4:f>223?3:f>191?2:1;if(g+q<=o){let AA,z,eA,H;switch(q){case 1:f<128&&(E=f);break;case 2:AA=a[g+1],(AA&192)===128&&(H=(f&31)<<6|AA&63,H>127&&(E=H));break;case 3:AA=a[g+1],z=a[g+2],(AA&192)===128&&(z&192)===128&&(H=(f&15)<<12|(AA&63)<<6|z&63,H>2047&&(H<55296||H>57343)&&(E=H));break;case 4:AA=a[g+1],z=a[g+2],eA=a[g+3],(AA&192)===128&&(z&192)===128&&(eA&192)===128&&(H=(f&15)<<18|(AA&63)<<12|(z&63)<<6|eA&63,H>65535&&H<1114112&&(E=H))}}E===null?(E=65533,q=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),g+=q}return A0(l)}const Di=4096;function A0(a){const r=a.length;if(r<=Di)return String.fromCharCode.apply(String,a);let o="",l=0;for(;l<r;)o+=String.fromCharCode.apply(String,a.slice(l,l+=Di));return o}function e0(a,r,o){let l="";o=Math.min(a.length,o);for(let g=r;g<o;++g)l+=String.fromCharCode(a[g]&127);return l}function t0(a,r,o){let l="";o=Math.min(a.length,o);for(let g=r;g<o;++g)l+=String.fromCharCode(a[g]);return l}function r0(a,r,o){const l=a.length;(!r||r<0)&&(r=0),(!o||o<0||o>l)&&(o=l);let g="";for(let f=r;f<o;++f)g+=l0[a[f]];return g}function o0(a,r,o){const l=a.slice(r,o);let g="";for(let f=0;f<l.length-1;f+=2)g+=String.fromCharCode(l[f]+l[f+1]*256);return g}u.prototype.slice=function(r,o){const l=this.length;r=~~r,o=o===void 0?l:~~o,r<0?(r+=l,r<0&&(r=0)):r>l&&(r=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<r&&(o=r);const g=this.subarray(r,o);return Object.setPrototypeOf(g,u.prototype),g};function hA(a,r,o){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,l){r=r>>>0,o=o>>>0,l||hA(r,o,this.length);let g=this[r],f=1,E=0;for(;++E<o&&(f*=256);)g+=this[r+E]*f;return g},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,l){r=r>>>0,o=o>>>0,l||hA(r,o,this.length);let g=this[r+--o],f=1;for(;o>0&&(f*=256);)g+=this[r+--o]*f;return g},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||hA(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||hA(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||hA(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=fe(function(r){r=r>>>0,ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&wt(r,this.length-8);const g=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,f=this[++r]+this[++r]*2**8+this[++r]*2**16+l*2**24;return BigInt(g)+(BigInt(f)<<BigInt(32))}),u.prototype.readBigUInt64BE=fe(function(r){r=r>>>0,ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&wt(r,this.length-8);const g=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],f=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+l;return(BigInt(g)<<BigInt(32))+BigInt(f)}),u.prototype.readIntLE=function(r,o,l){r=r>>>0,o=o>>>0,l||hA(r,o,this.length);let g=this[r],f=1,E=0;for(;++E<o&&(f*=256);)g+=this[r+E]*f;return f*=128,g>=f&&(g-=Math.pow(2,8*o)),g},u.prototype.readIntBE=function(r,o,l){r=r>>>0,o=o>>>0,l||hA(r,o,this.length);let g=o,f=1,E=this[r+--g];for(;g>0&&(f*=256);)E+=this[r+--g]*f;return f*=128,E>=f&&(E-=Math.pow(2,8*o)),E},u.prototype.readInt8=function(r,o){return r=r>>>0,o||hA(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||hA(r,2,this.length);const l=this[r]|this[r+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||hA(r,2,this.length);const l=this[r+1]|this[r]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=fe(function(r){r=r>>>0,ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&wt(r,this.length-8);const g=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(l<<24);return(BigInt(g)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=fe(function(r){r=r>>>0,ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&wt(r,this.length-8);const g=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(g)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+l)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),t.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||hA(r,4,this.length),t.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||hA(r,8,this.length),t.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||hA(r,8,this.length),t.read(this,r,!1,52,8)};function RA(a,r,o,l,g,f){if(!u.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>g||r<f)throw new RangeError('"value" argument is out of bounds');if(o+l>a.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,l,g){if(r=+r,o=o>>>0,l=l>>>0,!g){const q=Math.pow(2,8*l)-1;RA(this,r,o,l,q,0)}let f=1,E=0;for(this[o]=r&255;++E<l&&(f*=256);)this[o+E]=r/f&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,l,g){if(r=+r,o=o>>>0,l=l>>>0,!g){const q=Math.pow(2,8*l)-1;RA(this,r,o,l,q,0)}let f=l-1,E=1;for(this[o+f]=r&255;--f>=0&&(E*=256);)this[o+f]=r/E&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function mi(a,r,o,l,g){Ri(r,l,g,a,o,7);let f=Number(r&BigInt(4294967295));a[o++]=f,f=f>>8,a[o++]=f,f=f>>8,a[o++]=f,f=f>>8,a[o++]=f;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,o}function ki(a,r,o,l,g){Ri(r,l,g,a,o,7);let f=Number(r&BigInt(4294967295));a[o+7]=f,f=f>>8,a[o+6]=f,f=f>>8,a[o+5]=f,f=f>>8,a[o+4]=f;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o+3]=E,E=E>>8,a[o+2]=E,E=E>>8,a[o+1]=E,E=E>>8,a[o]=E,o+8}u.prototype.writeBigUInt64LE=fe(function(r,o=0){return mi(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=fe(function(r,o=0){return ki(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,l,g){if(r=+r,o=o>>>0,!g){const AA=Math.pow(2,8*l-1);RA(this,r,o,l,AA-1,-AA)}let f=0,E=1,q=0;for(this[o]=r&255;++f<l&&(E*=256);)r<0&&q===0&&this[o+f-1]!==0&&(q=1),this[o+f]=(r/E>>0)-q&255;return o+l},u.prototype.writeIntBE=function(r,o,l,g){if(r=+r,o=o>>>0,!g){const AA=Math.pow(2,8*l-1);RA(this,r,o,l,AA-1,-AA)}let f=l-1,E=1,q=0;for(this[o+f]=r&255;--f>=0&&(E*=256);)r<0&&q===0&&this[o+f+1]!==0&&(q=1),this[o+f]=(r/E>>0)-q&255;return o+l},u.prototype.writeInt8=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,l){return r=+r,o=o>>>0,l||RA(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=fe(function(r,o=0){return mi(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=fe(function(r,o=0){return ki(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Ti(a,r,o,l,g,f){if(o+l>a.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function wi(a,r,o,l,g){return r=+r,o=o>>>0,g||Ti(a,r,o,4),t.write(a,r,o,l,23,4),o+4}u.prototype.writeFloatLE=function(r,o,l){return wi(this,r,o,!0,l)},u.prototype.writeFloatBE=function(r,o,l){return wi(this,r,o,!1,l)};function di(a,r,o,l,g){return r=+r,o=o>>>0,g||Ti(a,r,o,8),t.write(a,r,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,l){return di(this,r,o,!0,l)},u.prototype.writeDoubleBE=function(r,o,l){return di(this,r,o,!1,l)},u.prototype.copy=function(r,o,l,g){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(l||(l=0),!g&&g!==0&&(g=this.length),o>=r.length&&(o=r.length),o||(o=0),g>0&&g<l&&(g=l),g===l||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),r.length-o<g-l&&(g=r.length-o+l);const f=g-l;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,g):Uint8Array.prototype.set.call(r,this.subarray(l,g),o),f},u.prototype.fill=function(r,o,l,g){if(typeof r=="string"){if(typeof o=="string"?(g=o,o=0,l=this.length):typeof l=="string"&&(g=l,l=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!u.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(r.length===1){const E=r.charCodeAt(0);(g==="utf8"&&E<128||g==="latin1")&&(r=E)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,r||(r=0);let f;if(typeof r=="number")for(f=o;f<l;++f)this[f]=r;else{const E=u.isBuffer(r)?r:u.from(r,g),q=E.length;if(q===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(f=0;f<l-o;++f)this[f+o]=E[f%q]}return this};const He={};function ss(a,r,o){He[a]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}ss("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),ss("ERR_INVALID_ARG_TYPE",function(a,r){return`The "${a}" argument must be of type number. Received type ${typeof r}`},TypeError),ss("ERR_OUT_OF_RANGE",function(a,r,o){let l=`The value of "${a}" is out of range.`,g=o;return Number.isInteger(o)&&Math.abs(o)>2**32?g=yi(String(o)):typeof o=="bigint"&&(g=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(g=yi(g)),g+="n"),l+=` It must be ${r}. Received ${g}`,l},RangeError);function yi(a){let r="",o=a.length;const l=a[0]==="-"?1:0;for(;o>=l+4;o-=3)r=`_${a.slice(o-3,o)}${r}`;return`${a.slice(0,o)}${r}`}function s0(a,r,o){ve(r,"offset"),(a[r]===void 0||a[r+o]===void 0)&&wt(r,a.length-(o+1))}function Ri(a,r,o,l,g,f){if(a>o||a<r){const E=typeof r=="bigint"?"n":"";let q;throw r===0||r===BigInt(0)?q=`>= 0${E} and < 2${E} ** ${(f+1)*8}${E}`:q=`>= -(2${E} ** ${(f+1)*8-1}${E}) and < 2 ** ${(f+1)*8-1}${E}`,new He.ERR_OUT_OF_RANGE("value",q,a)}s0(l,g,f)}function ve(a,r){if(typeof a!="number")throw new He.ERR_INVALID_ARG_TYPE(r,"number",a)}function wt(a,r,o){throw Math.floor(a)!==a?(ve(a,o),new He.ERR_OUT_OF_RANGE("offset","an integer",a)):r<0?new He.ERR_BUFFER_OUT_OF_BOUNDS:new He.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${r}`,a)}const n0=/[^+/0-9A-Za-z-_]/g;function i0(a){if(a=a.split("=")[0],a=a.trim().replace(n0,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function ns(a,r){r=r||1/0;let o;const l=a.length;let g=null;const f=[];for(let E=0;E<l;++E){if(o=a.charCodeAt(E),o>55295&&o<57344){if(!g){if(o>56319){(r-=3)>-1&&f.push(239,191,189);continue}else if(E+1===l){(r-=3)>-1&&f.push(239,191,189);continue}g=o;continue}if(o<56320){(r-=3)>-1&&f.push(239,191,189),g=o;continue}o=(g-55296<<10|o-56320)+65536}else g&&(r-=3)>-1&&f.push(239,191,189);if(g=null,o<128){if((r-=1)<0)break;f.push(o)}else if(o<2048){if((r-=2)<0)break;f.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;f.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;f.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return f}function a0(a){const r=[];for(let o=0;o<a.length;++o)r.push(a.charCodeAt(o)&255);return r}function c0(a,r){let o,l,g;const f=[];for(let E=0;E<a.length&&!((r-=2)<0);++E)o=a.charCodeAt(E),l=o>>8,g=o%256,f.push(g),f.push(l);return f}function Pi(a){return e.toByteArray(i0(a))}function Lr(a,r,o,l){let g;for(g=0;g<l&&!(g+o>=r.length||g>=a.length);++g)r[g+o]=a[g];return g}function ZA(a,r){return a instanceof r||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===r.name}function is(a){return a!==a}const l0=(function(){const a="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let g=0;g<16;++g)r[l+g]=a[o]+a[g]}return r})();function fe(a){return typeof BigInt>"u"?u0:a}function u0(){throw new Error("BigInt not supported")}})(Fr)),Fr}var Ke=Li();const Fi=!1,Mi=30,qi=".2mg,.hdv,.po,.2meg",$e=256,Ue=383,At=256*$e,xA=256*Ue;var _=(A=>(A[A.IDLE=0]="IDLE",A[A.RUNNING=-1]="RUNNING",A[A.PAUSED=-2]="PAUSED",A[A.NEED_BOOT=-3]="NEED_BOOT",A[A.NEED_RESET=-4]="NEED_RESET",A))(_||{}),SA=(A=>(A[A.MACHINE_STATE=0]="MACHINE_STATE",A[A.CLICK=1]="CLICK",A[A.DRIVE_PROPS=2]="DRIVE_PROPS",A[A.DRIVE_SOUND=3]="DRIVE_SOUND",A[A.SAVE_STATE=4]="SAVE_STATE",A[A.RUMBLE=5]="RUMBLE",A[A.HELP_TEXT=6]="HELP_TEXT",A[A.SHOW_APPLE_MOUSE=7]="SHOW_APPLE_MOUSE",A[A.MBOARD_SOUND=8]="MBOARD_SOUND",A[A.COMM_DATA=9]="COMM_DATA",A[A.MIDI_DATA=10]="MIDI_DATA",A[A.ENHANCED_MIDI=11]="ENHANCED_MIDI",A[A.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",A[A.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",A[A.INSTRUCTIONS=14]="INSTRUCTIONS",A))(SA||{}),L=(A=>(A[A.APPLE_PRESS=0]="APPLE_PRESS",A[A.APPLE_RELEASE=1]="APPLE_RELEASE",A[A.APP_MODE=2]="APP_MODE",A[A.BASIC_STEP=3]="BASIC_STEP",A[A.BREAKPOINTS=4]="BREAKPOINTS",A[A.COMM_DATA=5]="COMM_DATA",A[A.DEBUG=6]="DEBUG",A[A.DRIVE_NEW_DATA=7]="DRIVE_NEW_DATA",A[A.DRIVE_PROPS=8]="DRIVE_PROPS",A[A.GAMEPAD=9]="GAMEPAD",A[A.GET_SAVE_STATE=10]="GET_SAVE_STATE",A[A.GET_SAVE_STATE_SNAPSHOTS=11]="GET_SAVE_STATE_SNAPSHOTS",A[A.KEYPRESS=12]="KEYPRESS",A[A.KEYRELEASE=13]="KEYRELEASE",A[A.MACHINE_NAME=14]="MACHINE_NAME",A[A.MIDI_DATA=15]="MIDI_DATA",A[A.MOUSEEVENT=16]="MOUSEEVENT",A[A.PASTE_TEXT=17]="PASTE_TEXT",A[A.RAMWORKS=18]="RAMWORKS",A[A.RESTORE_STATE=19]="RESTORE_STATE",A[A.REVERSE_YAXIS=20]="REVERSE_YAXIS",A[A.RUN_MODE=21]="RUN_MODE",A[A.SET_BINARY_BLOCK=22]="SET_BINARY_BLOCK",A[A.SET_CYCLECOUNT=23]="SET_CYCLECOUNT",A[A.SET_MEMORY=24]="SET_MEMORY",A[A.SHOW_DEBUG_TAB=25]="SHOW_DEBUG_TAB",A[A.SIRIUS_JOYPORT=26]="SIRIUS_JOYPORT",A[A.SOFTSWITCHES=27]="SOFTSWITCHES",A[A.SPEED=28]="SPEED",A[A.STATE6502=29]="STATE6502",A[A.STEP_INTO=30]="STEP_INTO",A[A.STEP_OUT=31]="STEP_OUT",A[A.STEP_OVER=32]="STEP_OVER",A[A.THUMBNAIL_IMAGE=33]="THUMBNAIL_IMAGE",A[A.TIME_TRAVEL_INDEX=34]="TIME_TRAVEL_INDEX",A[A.TIME_TRAVEL_SNAPSHOT=35]="TIME_TRAVEL_SNAPSHOT",A[A.TIME_TRAVEL_STEP=36]="TIME_TRAVEL_STEP",A[A.TRACING=37]="TRACING",A[A.TRACE_SETTINGS=38]="TRACE_SETTINGS",A))(L||{}),Ee=(A=>(A[A.MOTOR_OFF=0]="MOTOR_OFF",A[A.MOTOR_ON=1]="MOTOR_ON",A[A.TRACK_END=2]="TRACK_END",A[A.TRACK_SEEK=3]="TRACK_SEEK",A))(Ee||{}),n=(A=>(A[A.IMPLIED=0]="IMPLIED",A[A.IMM=1]="IMM",A[A.ZP_REL=2]="ZP_REL",A[A.ZP_X=3]="ZP_X",A[A.ZP_Y=4]="ZP_Y",A[A.ABS=5]="ABS",A[A.ABS_X=6]="ABS_X",A[A.ABS_Y=7]="ABS_Y",A[A.IND_X=8]="IND_X",A[A.IND_Y=9]="IND_Y",A[A.IND=10]="IND",A))(n||{});const Ki=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),yt=A=>A.startsWith("B")&&A!=="BIT"&&A!=="BRK",K=(A,e=2)=>(A>255&&(e=4),("0000"+A.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const et=A=>A.split("").map(e=>e.charCodeAt(0)),Ui=A=>[A&255,A>>>8&255],us=A=>[A&255,A>>>8&255,A>>>16&255,A>>>24&255],Yi=(A,e)=>{const t=A.lastIndexOf(".")+1;return A.substring(0,t)+e},Mr=new Uint32Array(256).fill(0),Oi=()=>{let A;for(let e=0;e<256;e++){A=e;for(let t=0;t<8;t++)A=A&1?3988292384^A>>>1:A>>>1;Mr[e]=A}},Wi=(A,e=0)=>{Mr[255]===0&&Oi();let t=-1;for(let s=e;s<A.length;s++)t=t>>>8^Mr[(t^A[s])&255];return(t^-1)>>>0},Ni=(A,e)=>A+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),Is=A=>{const e=A.toLowerCase();return qi.split(",").some(s=>e.endsWith(s))};let hs=!1;const qr=()=>hs,Kr=A=>{hs=A};let Ur=!1,Yr=!1,Or=!1,Wr=!1,Nr=!1,Gr=!1,_r=!1,Xr=!1,Zr=!1,xr=!1;const Gi=A=>{const e=S.AN0.isSet,t=S.AN1.isSet;let s=!1;switch(A){case S.PB0.isSetAddr:S.PB0.isSet=!e&&Ur||e&&Yr,s=S.PB0.isSet;break;case S.PB1.isSetAddr:S.PB1.isSet=!e&&t&&Nr||e&&t&&Gr||!e&&!t&&_r||e&&!t&&Xr,s=S.PB1.isSet;break;case S.PB2.isSetAddr:S.PB2.isSet=!e&&t&&Or||e&&t&&Wr||!e&&!t&&Zr||e&&!t&&xr,s=S.PB2.isSet;break}Z(A,s?0:128)},_i=(A,e,t)=>{let s=!t;switch(e||(s=!0,t=!0),A){case-1:s&&(Ur=!1,Or=!1,Nr=!1,_r=!1,Zr=!1),t&&(Yr=!1,Wr=!1,Gr=!1,Xr=!1,xr=!1);break;case 0:s&&(Ur=!0),t&&(Yr=!0);break;case 1:break;case 12:s&&(Nr=!0),t&&(Gr=!0);break;case 13:s&&(Or=!0),t&&(Wr=!0);break;case 14:s&&(_r=!0),t&&(Xr=!0);break;case 15:s&&(Zr=!0),t&&(xr=!0);break}};let FA;const Be=Math.trunc(.00278*1020484);let Vr=Be/2,Jr=Be/2,jr=Be/2,Hr=Be/2,gs=0,ps=!1,Cs=!1,vr=!1,zr=!1,Ss=!1,fs=!1,Es=!1,$r=!1;const tt=()=>{vr=!0},Ao=()=>{zr=!0},Rt=(A,e=!1)=>(A=Math.min(Math.max(A,-1),1),e&&$r&&(A=-A),(A+1)*Be/2),ee=(A,e)=>{switch(A){case 0:Vr=Rt(e);break;case 1:Jr=Rt(e,!0);break;case 2:jr=Rt(e);break;case 3:Hr=Rt(e);break}},eo=()=>{fs=ps||vr,Es=Cs||zr,S.PB0.isSet=fs,S.PB1.isSet=Es,S.PB2.isSet=Ss},Bs=(A,e)=>{e?ps=A:Cs=A,eo()},Xi=A=>{$r=A},Zi=A=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),gs=A},Pt=(A,e)=>{const t=A-gs;Z(49252,t<Vr?e|128:e&127),Z(49253,t<Jr?e|128:e&127),Z(49254,t<jr?e|128:e&127),Z(49255,t<Hr?e|128:e&127)},to=(A,e)=>{if(qr())Gi(A);else{let t=!1;switch(A){case S.PB0.isSetAddr:t=S.PB0.isSet;break;case S.PB1.isSetAddr:t=S.PB1.isSet;break;case S.PB2.isSetAddr:t=S.PB2.isSet;break}Z(A,t?e|128:e&127)}};let De,Qt,Ds=!1;const xi=A=>{FA=A,Ds=!FA.length||!FA[0].buttons.length,De=ma(),De.gamepad?Qt=De.gamepad:Qt=qr()?_i:Ba},ms=A=>A>-.01&&A<.01,Vi=(A,e)=>{ms(A)&&(A=0),ms(e)&&(e=0);const t=Math.sqrt(A*A+e*e),s=.95*(t===0?1:Math.max(Math.abs(A),Math.abs(e))/t);return A=Math.min(Math.max(-s,A),s),e=Math.min(Math.max(-s,e),s),A=(A+s)/(2*s),e=(e+s)/(2*s),[A,e]},ks=(A,e)=>([A,e]=Vi(A,e),A=Math.trunc(Be*A),e=Math.trunc(Be*e),[A,e]),Ji=A=>{$r&&(A=A.map((C,u)=>u%2===1?-C:C));const[e,t]=ks(A[0],A[1]),s=A.length>=6?A[5]:A[3],[i,I]=A.length>=4?ks(A[2],s):[0,0];return[e,t,i,I]},Ts=A=>{const e=De.joystick?De.joystick(FA[A].axes,Ds):FA[A].axes,t=Ji(e);A===0?(Vr=t[0],Jr=t[1]):(jr=t[0],Hr=t[1]);const s=FA[A].buttons;e.length>=10&&e[9]!==0&&e[9]<2&&(e[9]<-.4&&e[9]>-.5?s[15]=!0:e[9]>.7&&e[9]<.8?s[14]=!0:e[9]>.1&&e[9]<.2?s[13]=!0:e[9]<-.95&&(s[12]=!0)),Qt(-1,FA.length>1,A===1),s.forEach((i,I)=>{i&&Qt(I,FA.length>1,A===1)}),De.rumble&&De.rumble(),eo()},ji=()=>{vr=!1,zr=!1,Ss=!1,FA&&FA.length>0&&(Ts(0),FA.length>1&&Ts(1))},Hi=A=>{switch(A){case 0:U("JL");break;case 1:U("G",200);break;case 2:X("M"),U("O");break;case 3:U("L");break;case 4:U("F");break;case 5:X("P"),U("T");break;case 6:break;case 7:break;case 8:U("Z");break;case 9:{const e=mo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:break;case 11:break;case 12:U("L");break;case 13:U("M");break;case 14:U("A");break;case 15:U("D");break;case-1:return}};let me=0,ke=0,Te=!1;const bt=.5,vi={address:24835,data:[173,198,9],keymap:{},joystick:A=>A[0]<-bt?(ke=0,me===0||me>2?(me=0,X("A")):me===1&&Te?U("W"):me===2&&Te&&U("R"),me++,Te=!1,A):A[0]>bt?(me=0,ke===0||ke>2?(ke=0,X("D")):ke===1&&Te?U("W"):ke===2&&Te&&U("R"),ke++,Te=!1,A):A[1]<-bt?(U("C"),A):A[1]>bt?(U("S"),A):(Te=!0,A),gamepad:Hi,rumble:null,setup:null,helptext:`AZTEC
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
`},zi={address:25200,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
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
`},$i={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:A=>{switch(A){case 0:X(" ");break;case 12:X("A");break;case 13:X("Z");break;case 14:X("\b");break;case 15:X("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},Aa={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},ea={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{rs("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let ro=14,oo=14;const ta={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let A=B(182,!1);ro<40&&A<ro&&br({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),ro=A,A=B(183,!1),oo<40&&A<oo&&br({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),oo=A},setup:null,helptext:`KARATEKA
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
`},ra={address:25078,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:()=>{T(46793,234),T(46794,234)},helptext:`Lode Runner by Doug Smith
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
`},oa=A=>{switch(A){case 0:U("A");break;case 1:U("C",50);break;case 2:U("O");break;case 3:U("T");break;case 4:U("\x1B");break;case 5:U("\r");break;case 6:break;case 7:break;case 8:X("N"),U("'");break;case 9:X("Y"),U("1");break;case 10:break;case 11:break;case 12:break;case 13:U(" ");break;case 14:break;case 15:U("	");break;case-1:return}},te=.5,sa={address:768,data:[141,74,3,132],keymap:{},gamepad:oa,joystick:(A,e)=>{if(e)return A;const t=A[0]<-te?"\b":A[0]>te?"":"",s=A[1]<-te?"\v":A[1]>te?`
`:"";let i=t+s;return i||(i=A[2]<-te?"L\b":A[2]>te?"L":"",i||(i=A[3]<-te?"L\v":A[3]>te?`L
`:"")),i&&U(i,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},na={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},ia={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},aa={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},ca={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&br({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{T(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},ws=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,la=A=>{switch(A){case 1:T(109,255);break;case 12:X("A");break;case 13:X("Z");break;case 14:X("\b");break;case 15:X("");break}},Lt=.75,ua=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{T(25025,173),T(25036,64)},helptext:ws},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:A=>{const e=A[0]<-Lt?"\b":A[0]>Lt?"":A[1]<-Lt?"A":A[1]>Lt?"Z":"";return e&&X(e),A},gamepad:la,rumble:null,setup:null,helptext:ws}],Ia={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{Ci(1)},helptext:`Ultima V: Warriors of Destiny
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

`},ha={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},ds=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,ga=A=>{switch(A){case 0:tt();break;case 1:Ao();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U("T");break;case 9:{const e=mo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:tt();break}},pa=()=>{T(5128,0),T(5130,4);let A=5210;T(A,234),T(A+1,234),T(A+2,234),A=5224,T(A,234),T(A+1,234),T(A+2,234)},Ca=()=>{B(49178,!1)<128&&B(49181,!1)<128&&br({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},Sa={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:ds},fa={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:ga,rumble:Ca,setup:pa,helptext:ds},Ea={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:A=>{switch(A){case 0:tt();break;case 1:Ao();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U(":");break;case 9:{const e=mo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:tt();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},rt=new Array,cA=A=>{Array.isArray(A)?rt.push(...A):rt.push(A)};cA(vi),cA(zi),cA($i),cA(Aa),cA(ea),cA(ta),cA(ra),cA(sa),cA(na),cA(ia),cA(aa),cA(ca),cA(ua),cA(Ia),cA(ha),cA(fa),cA(Sa),cA(Ea);const Ba=(A,e,t)=>{const s=!t;switch(A){case 0:s&&tt();break;case 1:s&&Ao();break;case 12:ee(t?3:1,-1);break;case 13:ee(t?3:1,1);break;case 14:ee(t?2:0,-1);break;case 15:ee(t?2:0,1);break}},Da={address:0,data:[],keymap:{},gamepad:null,joystick:A=>A,rumble:null,setup:null,helptext:""},ys=A=>{for(const e of rt)if(Ro(e.address,e.data))return A.toUpperCase()in e.keymap?e.keymap[A.toUpperCase()]:A;return A},ma=()=>{for(const A of rt)if(Ro(A.address,A.data))return A;return Da},so=(A=!1)=>{for(const e of rt)if(Ro(e.address,e.data)){pi(e.helptext?e.helptext:" "),e.setup&&e.setup();return}A&&(pi(" "),Ci(0))},ka=A=>{Z(49152,A|128,16),Z(49168,A&255|128,16)},Rs=()=>{const A=gA(49152)&127;Z(49152,A,16)},Ta=()=>{const A=gA(49152)&127;Z(49152,A,32)};let we="",Ps=1e9,Qs=0;const no=()=>{const A=performance.now();if(we!==""&&(gA(49152)<128||A-Ps>3800)){Ps=A;const e=we.charCodeAt(0);ka(e),we=we.slice(1),we.length===0&&A-Qs>500&&(Qs=A,os(!0))}};let bs="";const X=A=>{A===bs&&we.length>0||(bs=A,we+=A)};let Ls=0;const U=(A,e=300)=>{const t=performance.now();t-Ls<e||(Ls=t,X(A))},wa=A=>{let e=String.fromCharCode(A);e=ys(e),X(e),no()},da=A=>{A.length===1&&(A=ys(A)),X(A)},Ye=[],y=(A,e,t,s=!1,i=null)=>{const I={offAddr:A,onAddr:e,isSetAddr:t,writeOnly:s,isSet:!1,setFunc:i};return A>=49152&&(Ye[A-49152]=I),e>=49152&&(Ye[e-49152]=I),t>=49152&&(Ye[t-49152]=I),I},TA=()=>Math.floor(180*Math.random()),ya=()=>Math.floor(256*Math.random()),re=A=>{const e=gA(A&65527);Z(A,e&128|TA()&127)},Fs=(A,e)=>{A&=11,e?S.BSR_PREWRITE.isSet=!1:A&1?S.BSR_PREWRITE.isSet?S.BSR_WRITE.isSet=!0:S.BSR_PREWRITE.isSet=!0:(S.BSR_PREWRITE.isSet=!1,S.BSR_WRITE.isSet=!1),S.BSRBANK2.isSet=A<=3,S.BSRREADRAM.isSet=[0,3,8,11].includes(A)},S={STORE80:y(49152,49153,49176,!0),RAMRD:y(49154,49155,49171,!0),RAMWRT:y(49156,49157,49172,!0),INTCXROM:y(49158,49159,49173,!0),INTC8ROM:y(49194,0,0),ALTZP:y(49160,49161,49174,!0),SLOTC3ROM:y(49162,49163,49175,!0),COLUMN80:y(49164,49165,49183,!0),ALTCHARSET:y(49166,49167,49182,!0),KBRDSTROBE:y(49168,0,0,!1),BSRBANK2:y(0,0,49169),BSRREADRAM:y(0,0,49170),VBL:y(0,0,49177),CASSOUT:y(49184,0,0),SPEAKER:y(49200,0,0,!1,(A,e)=>{Z(49200,TA()),W1(e)}),GCSTROBE:y(49216,0,0),EMUBYTE:y(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:y(49232,49233,49178),MIXED:y(49234,49235,49179),PAGE2:y(49236,49237,49180),HIRES:y(49238,49239,49181),AN0:y(49240,49241,0),AN1:y(49242,49243,0),AN2:y(49244,49245,0),DHIRES:y(49247,49246,0),CASSIN1:y(0,0,49248,!1,()=>{Z(49248,TA())}),PB0:y(0,0,49249,!1,A=>{to(A,TA())}),PB1:y(0,0,49250,!1,A=>{to(A,TA())}),PB2:y(0,0,49251,!1,A=>{to(A,TA())}),JOYSTICK0:y(0,0,49252,!1,(A,e)=>{Pt(e,TA())}),JOYSTICK1:y(0,0,49253,!1,(A,e)=>{Pt(e,TA())}),JOYSTICK2:y(0,0,49254,!1,(A,e)=>{Pt(e,TA())}),JOYSTICK3:y(0,0,49255,!1,(A,e)=>{Pt(e,TA())}),CASSIN2:y(0,0,49256,!1,A=>{re(A)}),C069:y(0,0,49257,!1,A=>{re(A)}),FASTCHIP_LOCK:y(49258,0,0,!1,A=>{re(A)}),FASTCHIP_ENABLE:y(49259,0,0,!1,A=>{re(A)}),C06C:y(0,0,49260,!1,A=>{re(A)}),FASTCHIP_SPEED:y(49261,0,0,!1,A=>{re(A)}),C06E:y(0,0,49262,!1,A=>{re(A)}),C06F:y(0,0,49263,!1,A=>{re(A)}),JOYSTICKRESET:y(0,0,49264,!1,(A,e)=>{Zi(e),Z(49264,TA())}),BANKSEL:y(49267,0,0),LASER128EX:y(49268,0,0),VIDEO7_160:y(49272,49273,0),VIDEO7_MONO:y(49274,49275,0),VIDEO7_MIXED:y(49276,49277,0),BSR_PREWRITE:y(49280,0,0),BSR_WRITE:y(49288,0,0)};S.TEXT.isSet=!0;let Ms=!0,Ft=0;const qs=A=>{if(Ms!==A&&S.STORE80.isSet){if(A)switch(S.VIDEO7_160.isSet=!1,S.VIDEO7_MONO.isSet=!1,S.VIDEO7_MIXED.isSet=!1,Ft=Ft<<1&2,Ft|=S.COLUMN80.isSet?0:1,Ft){case 0:break;case 1:{S.VIDEO7_160.isSet=!0;break}case 2:{S.VIDEO7_MIXED.isSet=!0;break}case 3:{S.VIDEO7_MONO.isSet=!0;break}}Ms=A}},Ra=[49152,49153,49165,49167,49168,49200,49236,49237,49183],Pa=(A,e)=>8192+1024*(A%8)+128*(Math.trunc(A/8)&7)+40*Math.trunc(A/64)+e,Ks=(A,e,t)=>{if(A>1048575&&!Ra.includes(A)){const i=gA(A)>128?1:0;console.log(`${t} $${K(c.PC)}: $${K(A)} [${i}] ${e?"write":""}`)}if(A<=49183&&rc()==="APPLE2P"){!e&&A<=49167&&no(),A===49168?Rs():A!==49152&&Z(A,TA());return}if(A>=49280&&A<=49295){Fs(A&-5,e);return}const s=Ye[A-49152];if(!s){console.error("Unknown softswitch "+K(A)),Z(A,TA());return}if(A<=49167?e||no():(A===49168||A<=49183&&e)&&Rs(),s.setFunc){(A===s.offAddr||A===s.onAddr)&&(s.isSet=A===s.onAddr),s.setFunc(A,t);return}if(A===S.DHIRES.offAddr?qs(!0):A===S.DHIRES.onAddr&&qs(!1),A===s.offAddr||A===s.onAddr){if((!s.writeOnly||e)&&(YA[s.offAddr-49152]!==void 0?YA[s.offAddr-49152]=A===s.onAddr:s.isSet=A===s.onAddr),s.isSetAddr){const i=gA(s.isSetAddr);Z(s.isSetAddr,s.isSet?i|128:i&127)}if(A>=49184){let i;if(A>=49232&&A<=49247){const I=t%17030-4550;if(I>=0){const C=Math.floor(I/65),u=t%65,D=Pa(C,u);i=B(D)}else i=ya()}else i=TA();Z(A,i)}}else if(A===s.isSetAddr){const i=gA(A);Z(A,s.isSet?i|128:i&127)}},Qa=()=>{for(const A in S){const e=A;YA[S[e].offAddr-49152]!==void 0?YA[S[e].offAddr-49152]=!1:S[e].isSet=!1}YA[S.TEXT.offAddr-49152]!==void 0?YA[S.TEXT.offAddr-49152]=!0:S.TEXT.isSet=!0},YA=[],ba=A=>{if(A>=49280&&A<=49295){Fs(A&-5,!1);return}const e=Ye[A-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+K(A));return}YA[e.offAddr-49152]===void 0&&(YA[e.offAddr-49152]=e.isSet),e.isSet=A===e.onAddr},La=()=>{YA.forEach((A,e)=>{A!==void 0&&(Ye[e].isSet=A)}),YA.length=0},Oe=[],Fa=()=>{if(Oe.length===0)for(const A in S){const e=S[A],t=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const i=K(e.offAddr)+" "+A;Oe[e.offAddr]=i+(t?"-OFF":"")+s}if(e.onAddr>0){const i=K(e.onAddr)+" "+A;Oe[e.onAddr]=i+"-ON"+s}if(e.isSetAddr>0){const i=K(e.isSetAddr)+" "+A;Oe[e.isSetAddr]=i+"-STATUS"+s}}return Oe[49152]="C000 KBRD/STORE80-OFF",Oe},Ma=()=>{for(const A in S){const t=S[A];if(t.isSetAddr){const s=gA(t.isSetAddr);Z(t.isSetAddr,t.isSet?s|128:s&127)}}},qa=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
g39dzLX8Fxf1A/sDYvpA+g==`,Ka=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,Ua=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,Us=new Array(256),io={},p=(A,e,t,s)=>{console.assert(!Us[t],"Duplicate instruction: "+A+" mode="+e),Us[t]={name:A,mode:e,bytes:s},io[A]||(io[A]=[]),io[A][e]=t};p("ADC",n.IMM,105,2),p("ADC",n.ZP_REL,101,2),p("ADC",n.ZP_X,117,2),p("ADC",n.ABS,109,3),p("ADC",n.ABS_X,125,3),p("ADC",n.ABS_Y,121,3),p("ADC",n.IND_X,97,2),p("ADC",n.IND_Y,113,2),p("ADC",n.IND,114,2),p("AND",n.IMM,41,2),p("AND",n.ZP_REL,37,2),p("AND",n.ZP_X,53,2),p("AND",n.ABS,45,3),p("AND",n.ABS_X,61,3),p("AND",n.ABS_Y,57,3),p("AND",n.IND_X,33,2),p("AND",n.IND_Y,49,2),p("AND",n.IND,50,2),p("ASL",n.IMPLIED,10,1),p("ASL",n.ZP_REL,6,2),p("ASL",n.ZP_X,22,2),p("ASL",n.ABS,14,3),p("ASL",n.ABS_X,30,3),p("BCC",n.ZP_REL,144,2),p("BCS",n.ZP_REL,176,2),p("BEQ",n.ZP_REL,240,2),p("BIT",n.ZP_REL,36,2),p("BIT",n.ABS,44,3),p("BIT",n.IMM,137,2),p("BIT",n.ZP_X,52,2),p("BIT",n.ABS_X,60,3),p("BMI",n.ZP_REL,48,2),p("BNE",n.ZP_REL,208,2),p("BPL",n.ZP_REL,16,2),p("BVC",n.ZP_REL,80,2),p("BVS",n.ZP_REL,112,2),p("BRA",n.ZP_REL,128,2),p("BRK",n.IMPLIED,0,1),p("CLC",n.IMPLIED,24,1),p("CLD",n.IMPLIED,216,1),p("CLI",n.IMPLIED,88,1),p("CLV",n.IMPLIED,184,1),p("CMP",n.IMM,201,2),p("CMP",n.ZP_REL,197,2),p("CMP",n.ZP_X,213,2),p("CMP",n.ABS,205,3),p("CMP",n.ABS_X,221,3),p("CMP",n.ABS_Y,217,3),p("CMP",n.IND_X,193,2),p("CMP",n.IND_Y,209,2),p("CMP",n.IND,210,2),p("CPX",n.IMM,224,2),p("CPX",n.ZP_REL,228,2),p("CPX",n.ABS,236,3),p("CPY",n.IMM,192,2),p("CPY",n.ZP_REL,196,2),p("CPY",n.ABS,204,3),p("DEC",n.IMPLIED,58,1),p("DEC",n.ZP_REL,198,2),p("DEC",n.ZP_X,214,2),p("DEC",n.ABS,206,3),p("DEC",n.ABS_X,222,3),p("DEX",n.IMPLIED,202,1),p("DEY",n.IMPLIED,136,1),p("EOR",n.IMM,73,2),p("EOR",n.ZP_REL,69,2),p("EOR",n.ZP_X,85,2),p("EOR",n.ABS,77,3),p("EOR",n.ABS_X,93,3),p("EOR",n.ABS_Y,89,3),p("EOR",n.IND_X,65,2),p("EOR",n.IND_Y,81,2),p("EOR",n.IND,82,2),p("INC",n.IMPLIED,26,1),p("INC",n.ZP_REL,230,2),p("INC",n.ZP_X,246,2),p("INC",n.ABS,238,3),p("INC",n.ABS_X,254,3),p("INX",n.IMPLIED,232,1),p("INY",n.IMPLIED,200,1),p("JMP",n.ABS,76,3),p("JMP",n.IND,108,3),p("JMP",n.IND_X,124,3),p("JSR",n.ABS,32,3),p("LDA",n.IMM,169,2),p("LDA",n.ZP_REL,165,2),p("LDA",n.ZP_X,181,2),p("LDA",n.ABS,173,3),p("LDA",n.ABS_X,189,3),p("LDA",n.ABS_Y,185,3),p("LDA",n.IND_X,161,2),p("LDA",n.IND_Y,177,2),p("LDA",n.IND,178,2),p("LDX",n.IMM,162,2),p("LDX",n.ZP_REL,166,2),p("LDX",n.ZP_Y,182,2),p("LDX",n.ABS,174,3),p("LDX",n.ABS_Y,190,3),p("LDY",n.IMM,160,2),p("LDY",n.ZP_REL,164,2),p("LDY",n.ZP_X,180,2),p("LDY",n.ABS,172,3),p("LDY",n.ABS_X,188,3),p("LSR",n.IMPLIED,74,1),p("LSR",n.ZP_REL,70,2),p("LSR",n.ZP_X,86,2),p("LSR",n.ABS,78,3),p("LSR",n.ABS_X,94,3),p("NOP",n.IMPLIED,234,1),p("ORA",n.IMM,9,2),p("ORA",n.ZP_REL,5,2),p("ORA",n.ZP_X,21,2),p("ORA",n.ABS,13,3),p("ORA",n.ABS_X,29,3),p("ORA",n.ABS_Y,25,3),p("ORA",n.IND_X,1,2),p("ORA",n.IND_Y,17,2),p("ORA",n.IND,18,2),p("PHA",n.IMPLIED,72,1),p("PHP",n.IMPLIED,8,1),p("PHX",n.IMPLIED,218,1),p("PHY",n.IMPLIED,90,1),p("PLA",n.IMPLIED,104,1),p("PLP",n.IMPLIED,40,1),p("PLX",n.IMPLIED,250,1),p("PLY",n.IMPLIED,122,1),p("ROL",n.IMPLIED,42,1),p("ROL",n.ZP_REL,38,2),p("ROL",n.ZP_X,54,2),p("ROL",n.ABS,46,3),p("ROL",n.ABS_X,62,3),p("ROR",n.IMPLIED,106,1),p("ROR",n.ZP_REL,102,2),p("ROR",n.ZP_X,118,2),p("ROR",n.ABS,110,3),p("ROR",n.ABS_X,126,3),p("RTI",n.IMPLIED,64,1),p("RTS",n.IMPLIED,96,1),p("SBC",n.IMM,233,2),p("SBC",n.ZP_REL,229,2),p("SBC",n.ZP_X,245,2),p("SBC",n.ABS,237,3),p("SBC",n.ABS_X,253,3),p("SBC",n.ABS_Y,249,3),p("SBC",n.IND_X,225,2),p("SBC",n.IND_Y,241,2),p("SBC",n.IND,242,2),p("SEC",n.IMPLIED,56,1),p("SED",n.IMPLIED,248,1),p("SEI",n.IMPLIED,120,1),p("STA",n.ZP_REL,133,2),p("STA",n.ZP_X,149,2),p("STA",n.ABS,141,3),p("STA",n.ABS_X,157,3),p("STA",n.ABS_Y,153,3),p("STA",n.IND_X,129,2),p("STA",n.IND_Y,145,2),p("STA",n.IND,146,2),p("STX",n.ZP_REL,134,2),p("STX",n.ZP_Y,150,2),p("STX",n.ABS,142,3),p("STY",n.ZP_REL,132,2),p("STY",n.ZP_X,148,2),p("STY",n.ABS,140,3),p("STZ",n.ZP_REL,100,2),p("STZ",n.ZP_X,116,2),p("STZ",n.ABS,156,3),p("STZ",n.ABS_X,158,3),p("TAX",n.IMPLIED,170,1),p("TAY",n.IMPLIED,168,1),p("TSX",n.IMPLIED,186,1),p("TXA",n.IMPLIED,138,1),p("TXS",n.IMPLIED,154,1),p("TYA",n.IMPLIED,152,1),p("TRB",n.ZP_REL,20,2),p("TRB",n.ABS,28,3),p("TSB",n.ZP_REL,4,2),p("TSB",n.ABS,12,3);const Ya=65536,Ys=65792,Os=66048,Ws=()=>{const A={register:"",address:768,operator:"==",value:128},e={action:"",register:"A",address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...A},expression2:{...A},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:"",action1:{...e},action2:{...e},halt:!1,basic:!1}};class ao extends Map{set(e,t){const s=[...this.entries()];s.push([e,t]),s.sort((i,I)=>i[0]-I[0]),super.clear();for(const[i,I]of s)super.set(i,I);return this}}const tA={};tA[""]={name:"Any",min:0,max:65535},tA.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},tA.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},tA.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},tA["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},tA["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(tA).map(A=>A.name);const Oa=(A,e)=>A+2+(e>127?e-256:e),Wa=(A,e)=>{if(e<0)return!1;let t=!1;switch(A){case"BCS":t=(e&1)!==0;break;case"BCC":t=(e&1)===0;break;case"BEQ":t=(e&2)!==0;break;case"BNE":t=(e&2)===0;break;case"BMI":t=(e&128)!==0;break;case"BPL":t=(e&128)===0;break;case"BVS":t=(e&64)!==0;break;case"BVC":t=(e&64)===0;break;case"BRA":t=!0;break}return t},Ns=(A,e,t,s,i)=>{if(A>>8===192){let P="---";return A>=49168&&A<=49183&&(P=e.pcode>=128?"ON":"OFF"),`${K(A,4)}: ${K(e.pcode)}        ${P}`}let I="",C=`${K(e.pcode)}`,u="",D="";switch(e.bytes){case 1:C+="      ";break;case 2:u=K(t),C+=` ${u}   `;break;case 3:u=K(t),D=K(s),C+=` ${u} ${D}`;break}let m="";i>=0&&yt(e.name)&&(m=Wa(e.name,i)?"  ✓":"  ✗");const k=yt(e.name)?K(Oa(A,t),4):u;switch(e.mode){case n.IMPLIED:break;case n.IMM:I=` #$${u}`;break;case n.ZP_REL:I=` $${k}`;break;case n.ZP_X:I=` $${u},X`;break;case n.ZP_Y:I=` $${u},Y`;break;case n.ABS:I=` $${D}${u}`;break;case n.ABS_X:I=` $${D}${u},X`;break;case n.ABS_Y:I=` $${D}${u},Y`;break;case n.IND_X:I=` ($${D.trim()}${u},X)`;break;case n.IND_Y:I=` ($${u}),Y`;break;case n.IND:I=` ($${D.trim()}${u})`;break}return`${K(A,4)}: ${C}  ${e.name}${I}${m}`},co={numLines:1e4,collapseLoops:!0,ignoreRegisters:!1};let Mt=!1,lo=!1,lA=new ao;const qt=()=>{Mt=!0},Na=()=>{new ao(lA).forEach((s,i)=>{s.once&&lA.delete(i)});const e=Bc();if(e<0||lA.get(e))return;const t=Ws();t.address=e,t.once=!0,t.hidden=!0,lA.set(e,t)},Ga=()=>{new ao(lA).forEach((s,i)=>{s.once&&lA.delete(i)});const e=55301,t=Ws();t.address=e,t.once=!0,t.hidden=!0,lA.set(e,t)},_a=A=>{lA=A};let Gs=!1;const Xa=()=>{Gs=!0,tA.MAIN.enabled=(A=0)=>A>=53248?!S.ALTZP.isSet&&S.BSRREADRAM.isSet:A>=512?!S.RAMRD.isSet:!S.ALTZP.isSet,tA.AUX.enabled=(A=0)=>A>=53248?S.ALTZP.isSet&&S.BSRREADRAM.isSet:A>=512?S.RAMRD.isSet:S.ALTZP.isSet,tA.ROM.enabled=()=>!S.BSRREADRAM.isSet,tA["MAIN-DXXX-1"].enabled=()=>!S.ALTZP.isSet&&S.BSRREADRAM.isSet&&!S.BSRBANK2.isSet,tA["MAIN-DXXX-2"].enabled=()=>!S.ALTZP.isSet&&S.BSRREADRAM.isSet&&S.BSRBANK2.isSet,tA["AUX-DXXX-1"].enabled=()=>S.ALTZP.isSet&&S.BSRREADRAM.isSet&&!S.BSRBANK2.isSet,tA["AUX-DXXX-2"].enabled=()=>S.ALTZP.isSet&&S.BSRREADRAM.isSet&&S.BSRBANK2.isSet,tA["CXXX-ROM"].enabled=(A=0)=>A>=49920&&A<=50175?S.INTCXROM.isSet||!S.SLOTC3ROM.isSet:A>=51200?S.INTCXROM.isSet||S.INTC8ROM.isSet:S.INTCXROM.isSet,tA["CXXX-CARD"].enabled=(A=0)=>A>=49920&&A<=50175?S.INTCXROM.isSet?!1:S.SLOTC3ROM.isSet:A>=51200?!S.INTCXROM.isSet&&!S.INTC8ROM.isSet:!S.INTCXROM.isSet},_s=(A,e)=>{Gs||Xa();const t=tA[A];return!(e<t.min||e>t.max||t.enabled&&!t?.enabled(e))},Xs=(A,e,t)=>{const s=lA.get(A);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!_s(s.memoryBank,A)?!1:t?s.memset:s.memget},ot=(A=0,e=!0)=>{e?c.flagIRQ|=1<<A:c.flagIRQ&=~(1<<A),c.flagIRQ&=255},Za=(A=!0)=>{c.flagNMI=A===!0},xa=()=>{c.flagIRQ=0,c.flagNMI=!1},uo=[],Zs=[],xs=(A,e)=>{uo.push(A),Zs.push(e)},Va=()=>{for(let A=0;A<uo.length;A++)uo[A](Zs[A])},Vs=A=>{let e=0;switch(A.register){case"$":e=uc(A.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(A.operator){case"==":return e===A.value;case"!=":return e!==A.value;case"<":return e<A.value;case"<=":return e<=A.value;case">":return e>A.value;case">=":return e>=A.value}},Ja=A=>{const e=Vs(A.expression1);return A.expressionOperator===""?e:A.expressionOperator==="&&"&&!e?!1:A.expressionOperator==="||"&&e?!0:Vs(A.expression2)},Js=()=>{lo=!0},ja=(A,e,t)=>{const s=Ns(c.PC,{...t},A,e,c.PStatus)+"          ",I=`${("0000000000"+c.cycleCount.toString()).slice(-10)}  ${s.slice(0,29)}  ${un()}`;console.log(I)},js=(A,e,t,s)=>{if(A.action==="")return!1;const i=A.value&255,I=A.address&65535;switch(A.action){case"set":switch(A.register){case"A":c.Accum=i;break;case"X":c.XReg=i;break;case"Y":c.YReg=i;break;case"S":c.StackPtr=i;break;case"P":c.PStatus=i;break;case"C":c.PC=A.value&65535;break}break;case"jump":c.PC=I;break;case"print":ja(e,t,s);break;case"snapshot":os();break}return!0},Ha=(A,e,t,s)=>{const i=js(A.action1,e,t,s),I=js(A.action2,e,t,s);return i||I?A.halt?1:2:A.hidden?3:1},va=(A=-1,e=0,t=0,s=null)=>{if(lo)return lo=!1,1;if(lA.size===0||Mt)return 0;if(c.PC===55301){const I=B(117)+(B(118)<<8),C=lA.get(I);if(C&&!C.disabled)return 3}const i=lA.get(c.PC)||lA.get(-1)||lA.get(A|Ya)||A>=0&&lA.get(Ys)||A>=0&&lA.get(Os);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){const I=(t<<8)+e;if(i.address===Ys){if(v[A].name!=="???")return 0}else if(i.address===Os){if(v[A].is6502)return 0}else if(I>=0&&i.hexvalue>=0&&i.hexvalue!==I)return 0}if(i.expression1.register!==""&&!Ja(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!_s(i.memoryBank,c.PC)?0:(i.once&&lA.delete(c.PC),Ha(i,e,t,s))},Io=(A=null)=>{let e=0;const t=c.PC,s=B(c.PC,!1),i=v[s],I=i.bytes>1?B(c.PC+1,!1):-1,C=i.bytes>2?B(c.PC+2,!1):0;if(!k1()){const D=va(s,I,C,i);if(D===1||D===3)return KA(_.PAUSED,D!==3),-1;if(D===2)return c.PC===t&&(Mt=!0),0;Mt=!1}const u=en.get(t);if(u&&(!S.INTCXROM.isSet||(t&61440)!==49152)&&u(),e=i.execute(I,C),A&&(t<64680||t>64691)){const D=Ns(t,i,I,C,c.PStatus)+"          ";let k=`${("00000000"+c.cycleCount.toString()).slice(-8)}  ${D.slice(0,29)}  ${un()}`,P=k.indexOf("JMP");if(P===-1&&(P=k.indexOf("RTS")),P!==-1){let M=k.slice(P,P+15);M=M.replaceAll(" ","_"),k=k.slice(0,P)+M+k.slice(P+15)}A(k)}if(cn(i.bytes),ct(c.cycleCount+e),Va(),c.flagNMI&&(c.flagNMI=!1,e=kc(),ct(c.cycleCount+e)),c.flagIRQ){const D=mc();D>0&&(ct(c.cycleCount+D),e=D)}return e},za=[197,58,163,92,197,58,163,92],$a=1,Hs=4;class Ac{bits=[];pattern=new Array(64);patternIdx=0;constructor(){}reset=()=>{this.patternIdx=0};checkPattern=e=>{const s=za[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s};calcBits=()=>{const e=M=>{this.bits.push(M&8?1:0),this.bits.push(M&4?1:0),this.bits.push(M&2?1:0),this.bits.push(M&1?1:0)},t=M=>{e(Math.floor(M/10)),e(Math.floor(M%10))},s=new Date,i=s.getFullYear()%100,I=s.getDate(),C=s.getDay()+1,u=s.getMonth()+1,D=s.getHours(),m=s.getMinutes(),k=s.getSeconds(),P=s.getMilliseconds()/10;this.bits=[],t(i),t(u),t(I),t(C),t(D),t(m),t(k),t(P)};access=e=>{e&Hs?this.reset():this.checkPattern(e&$a)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()};read=e=>{let t=-1;return this.bits.length>0?e&Hs&&(t=this.bits.pop()):this.access(e),t}}const ec=new Ac,vs=320,zs=327,Kt=256*vs,tc=256*zs;let OA=0;const ho=xA;let b=new Uint8Array(ho+(OA+1)*65536).fill(0);const go=new Uint8Array(8).fill(0),po=()=>gA(49194),Ut=A=>{Z(49194,A)},de=()=>gA(49267),Co=A=>{Z(49267,A)},sA=new Array(257).fill(0),QA=new Array(257).fill(0);let $s="APPLE2EE";const rc=()=>$s,An=A=>{$s=A;let e="";switch(A){case"APPLE2P":e=qa;break;case"APPLE2EU":e=Ua;break;case"APPLE2EE":e=Ka;break}const t=e.replace(/\n/g,""),s=new Uint8Array(Ke.Buffer.from(t,"base64"));s[15035]=5,b.set(s,At)},So=A=>{A=Math.max(64,Math.min(8192,A));const e=OA;if(OA=Math.floor(A/64)-1,OA===e)return;de()>OA&&(Co(0),VA());const t=ho+(OA+1)*65536;if(OA<e)b=b.slice(0,t);else{const s=b;b=new Uint8Array(t).fill(255),b.set(s)}},oc=()=>{const A=S.RAMRD.isSet?Ue+de()*256:0,e=S.RAMWRT.isSet?Ue+de()*256:0,t=S.PAGE2.isSet?Ue+de()*256:0,s=S.STORE80.isSet?t:A,i=S.STORE80.isSet?t:e,I=S.STORE80.isSet&&S.HIRES.isSet?t:A,C=S.STORE80.isSet&&S.HIRES.isSet?t:e;for(let u=2;u<256;u++)sA[u]=u+A,QA[u]=u+e;for(let u=4;u<=7;u++)sA[u]=u+s,QA[u]=u+i;for(let u=32;u<=63;u++)sA[u]=u+I,QA[u]=u+C},sc=()=>{const A=S.ALTZP.isSet?Ue+de()*256:0;if(sA[0]=A,sA[1]=1+A,QA[0]=A,QA[1]=1+A,S.BSRREADRAM.isSet){for(let e=208;e<=255;e++)sA[e]=e+A;if(!S.BSRBANK2.isSet)for(let e=208;e<=223;e++)sA[e]=e-16+A}else for(let e=208;e<=255;e++)sA[e]=$e+e-192},nc=()=>{const A=S.ALTZP.isSet?Ue+de()*256:0,e=S.BSR_WRITE.isSet;for(let t=192;t<=255;t++)QA[t]=-1;if(e){for(let t=208;t<=255;t++)QA[t]=t+A;if(!S.BSRBANK2.isSet)for(let t=208;t<=223;t++)QA[t]=t-16+A}},fo=A=>S.INTCXROM.isSet?!1:A!==3?!0:S.SLOTC3ROM.isSet,ic=()=>!!(S.INTCXROM.isSet||S.INTC8ROM.isSet),Eo=A=>{if(A<=7){if(S.INTCXROM.isSet)return;A===3&&!S.SLOTC3ROM.isSet&&(S.INTC8ROM.isSet||(S.INTC8ROM.isSet=!0,Ut(255),VA())),po()===0&&rn[A]&&(Ut(A),VA())}else S.INTC8ROM.isSet=!1,Ut(0),VA()},ac=()=>{sA[192]=$e-192;for(let A=1;A<=7;A++){const e=192+A;sA[e]=A+(fo(A)?vs-1:$e)}if(ic())for(let A=200;A<=207;A++)sA[A]=$e+A-192;else{const A=zs+8*(po()-1);for(let e=0;e<=7;e++){const t=200+e;sA[t]=A+e}}},VA=()=>{oc(),sc(),nc(),ac();for(let A=0;A<256;A++)sA[A]=256*sA[A],QA[A]=256*QA[A]},en=new Map,tn=new Array(8),rn=new Uint8Array(8),Yt=(A,e=-1)=>{const t=A>>8===192?A-49280>>4:(A>>8)-192;if(A>=49408&&(Eo(t),!fo(t)))return;const s=tn[t];if(s!==void 0){const i=s(A,e);if(i>=0){const I=A>=49408?Kt-256:At;b[A-49152+I]=i}}},st=(A,e)=>{go[A]=1,tn[A]=e},We=(A,e,t=0,s=()=>{})=>{if(b.set(e.slice(0,256),Kt+(A-1)*256),go[A]=e.some(i=>i!==0)?1:0,e.length>256){const i=e.length>2304?2304:e.length,I=tc+(A-1)*2048;b.set(e.slice(256,i),I),rn[A]=255}t&&en.set(t,s)},cc=()=>{b.fill(255,0,65536),b.fill(255,ho),Ut(0),Co(0),VA()},lc=A=>(A>=49296?Yt(A):Ks(A,!1,c.cycleCount),A>=49232&&VA(),b[At+A-49152]),V=(A,e)=>{const t=Kt+(A-1)*256+(e&255);return b[t]},N=(A,e,t)=>{if(t>=0){const s=Kt+(A-1)*256+(e&255);b[s]=t&255}},B=(A,e=!0)=>{let t=0;const s=A>>>8;if(s===192)t=lc(A);else if(t=-1,s>=193&&s<=199?(s==195&&(S.INTCXROM.isSet||!S.SLOTC3ROM.isSet)?t=ec.read(A):fo(s-192)&&!go[s-192]&&(t=Math.floor(256*Math.random())),Yt(A)):A===53247&&Eo(255),t<0){const i=sA[s];t=b[i+(A&255)]}return e&&Xs(A,t,!1)&&Js(),t},uc=A=>{const e=A>>>8,t=sA[e];return b[t+(A&255)]},Ic=(A,e)=>{if(A===49265||A===49267){if(e>OA)return;Co(e)}else A>=49296?Yt(A,e):Ks(A,!0,c.cycleCount);(A<=49167||A>=49232)&&VA()},T=(A,e)=>{const t=A>>>8;if(t===192)Ic(A,e);else{t>=193&&t<=199?Yt(A,e):A===53247&&Eo(255);const s=QA[t];if(s<0)return;b[s+(A&255)]=e}Xs(A,e,!0)&&Js()},gA=A=>b[At+A-49152],Z=(A,e,t=1)=>{const s=At+A-49152;b.fill(e,s,s+t)},Bo=1024,on=2048,Ot=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Do=(A=!1)=>{let e=0,t=24,s=!1;if(A){if(S.TEXT.isSet||S.HIRES.isSet)return new Uint8Array;t=S.MIXED.isSet?20:24,s=S.COLUMN80.isSet&&S.DHIRES.isSet}else{if(!S.TEXT.isSet&&!S.MIXED.isSet)return new Uint8Array;!S.TEXT.isSet&&S.MIXED.isSet&&(e=20),s=S.COLUMN80.isSet}if(s){const u=S.PAGE2.isSet&&!S.STORE80.isSet?on:Bo,D=new Uint8Array(80*(t-e)).fill(160);for(let m=e;m<t;m++){const k=80*(m-e);for(let P=0;P<40;P++)D[k+2*P+1]=b[u+Ot[m]+P],D[k+2*P]=b[xA+u+Ot[m]+P]}return D}if(S.DHIRES.isSet&&!S.COLUMN80.isSet&&S.STORE80.isSet){const u=new Uint8Array(80*(t-e));for(let D=e;D<t;D++){const m=80*(D-e);let k=Bo+Ot[D];u.set(b.slice(k,k+40),m),k+=xA,u.set(b.slice(k,k+40),m+40)}return u}const I=S.PAGE2.isSet&&!S.STORE80.isSet?on:Bo,C=new Uint8Array(40*(t-e));for(let u=e;u<t;u++){const D=40*(u-e),m=I+Ot[u];C.set(b.slice(m,m+40),D)}return C},mo=()=>Ke.Buffer.from(Do().map(A=>A&=127)).toString(),ko=new Uint8Array(7680),To=new Uint8Array(15360);let Wt=ko,Nt=192;const hc=A=>{const e=S.DHIRES.isSet&&S.COLUMN80.isSet,t=S.DHIRES.isSet&&!S.COLUMN80.isSet&&S.STORE80.isSet;if(e||S.VIDEO7_MONO.isSet||S.VIDEO7_160.isSet||t){A===0&&(Wt=To,Nt=S.MIXED.isSet?160:192);const s=S.PAGE2.isSet&&!S.STORE80.isSet?16384:8192,i=Ni(s,A);for(let I=0;I<40;I++)To[A*80+2*I+1]=b[i+I],To[A*80+2*I]=b[xA+i+I]}else{A===0&&(Wt=ko,Nt=S.MIXED.isSet?160:192);const i=(S.PAGE2.isSet?16384:8192)+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);ko.set(b.slice(i,i+40),A*40)}},gc=()=>S.TEXT.isSet||!S.HIRES.isSet?new Uint8Array:Nt===192?Wt:Wt.slice(0,40*Nt),wo=A=>{const e=sA[A>>>8]+(A&255);return b.slice(e,e+512)},yo=(A,e)=>{const t=QA[A>>>8]+(A&255);b.set(e,t)},Ro=(A,e)=>{for(let t=0;t<e.length;t++)if(B(A+t,!1)!==e[t])return!1;return!0},sn=()=>{const A=sA[0];return b.slice(A,A+256)},pc=()=>b.slice(0,xA+65536),c=Ki(),nt=A=>{c.Accum=A},it=A=>{c.XReg=A},at=A=>{c.YReg=A},ct=A=>{c.cycleCount=A},nn=A=>{an(),Object.assign(c,A)},an=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,WA(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},cn=A=>{WA((c.PC+A+65536)%65536)},WA=A=>{c.PC=A},ln=A=>{c.PStatus=A|48},Cc=A=>(A&128?"N":".")+(A&64?"V":".")+(A&16?"B":".")+(A&8?"D":".")+(A&4?"I":".")+(A&2?"Z":".")+(A&1?"C":"."),un=()=>`${K(c.Accum)}  ${K(c.XReg)}  ${K(c.YReg)}  ${K(c.StackPtr)}  ${K(c.PStatus)}  ${Cc(c.PStatus)}`,NA=new Array(256).fill(""),Sc=()=>NA.slice(0,256),fc=A=>{NA.splice(0,A.length,...A)},Ec=()=>{const A=wo(256).slice(0,256),e=new Array;for(let t=255;t>c.StackPtr;t--){let s="$"+K(A[t]),i=NA[t];NA[t].length>3&&t-1>c.StackPtr&&(NA[t-1]==="JSR"||NA[t-1]==="BRK"||NA[t-1]==="IRQ"?(t--,s+=K(A[t])):i=""),s=(s+"   ").substring(0,6),e.push(K(256+t,4)+": "+s+i)}return e.join(`
`)},Bc=()=>{const A=wo(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const t=A[e];if(NA[e].startsWith("JSR")&&e-1>c.StackPtr&&NA[e-1]==="JSR"){const s=A[e-1]+1;return(t<<8)+s}}return-1},JA=(A,e)=>{NA[c.StackPtr]=A,T(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},jA=()=>{c.StackPtr=(c.StackPtr+1)%256;const A=B(256+c.StackPtr);if(isNaN(A))throw new Error("illegal stack value");return A},bA=()=>(c.PStatus&1)!==0,O=(A=!0)=>c.PStatus=A?c.PStatus|1:c.PStatus&254,In=()=>(c.PStatus&2)!==0,lt=(A=!0)=>c.PStatus=A?c.PStatus|2:c.PStatus&253,Dc=()=>(c.PStatus&4)!==0,Po=(A=!0)=>c.PStatus=A?c.PStatus|4:c.PStatus&251,hn=()=>(c.PStatus&8)!==0,nA=()=>hn()?1:0,Qo=(A=!0)=>c.PStatus=A?c.PStatus|8:c.PStatus&247,bo=(A=!0)=>c.PStatus=A?c.PStatus|16:c.PStatus&239,gn=()=>(c.PStatus&64)!==0,ut=(A=!0)=>c.PStatus=A?c.PStatus|64:c.PStatus&191,pn=()=>(c.PStatus&128)!==0,Cn=(A=!0)=>c.PStatus=A?c.PStatus|128:c.PStatus&127,Q=A=>{lt(A===0),Cn(A>=128)},Y=(A,e)=>(A+e+256)%256,w=(A,e)=>e*256+A,G=(A,e,t)=>(e*256+A+t+65536)%65536,$=(A,e)=>A>>8!==e>>8?1:0,HA=(A,e)=>{if(A){const t=c.PC;return cn(e>127?e-256:e),3+$(t+2,c.PC+2)}return 2},v=new Array(256),h=(A,e,t,s,i,I=!1)=>{console.assert(!v[t],"Duplicate instruction: "+A+" mode="+e),v[t]={name:A,pcode:t,mode:e,bytes:s,execute:i,is6502:!I}},J=!0,oe=(A,e,t)=>{const s=B(A),i=B((A+1)%256),I=G(s,i,c.YReg);e(I);let C=5+$(I,w(s,i));return t&&(C+=nA()),C},se=(A,e,t)=>{const s=B(A),i=B((A+1)%256),I=w(s,i);e(I);let C=5;return t&&(C+=nA()),C},Sn=A=>{let e=(c.Accum&15)+(A&15)+(bA()?1:0);e>=10&&(e+=6);let t=(c.Accum&240)+(A&240)+e;const s=c.Accum<=127&&A<=127,i=c.Accum>=128&&A>=128;ut((t&255)>=128?s:i),O(t>=160),bA()&&(t+=96),c.Accum=t&255,Q(c.Accum)},Gt=A=>{let e=c.Accum+A+(bA()?1:0);O(e>=256),e=e%256;const t=c.Accum<=127&&A<=127,s=c.Accum>=128&&A>=128;ut(e>=128?t:s),c.Accum=e,Q(c.Accum)},ne=A=>{hn()?Sn(B(A)):Gt(B(A))};h("ADC",n.IMM,105,2,A=>(nA()?Sn(A):Gt(A),2+nA())),h("ADC",n.ZP_REL,101,2,A=>(ne(A),3+nA())),h("ADC",n.ZP_X,117,2,A=>(ne(Y(A,c.XReg)),4+nA())),h("ADC",n.ABS,109,3,(A,e)=>(ne(w(A,e)),4+nA())),h("ADC",n.ABS_X,125,3,(A,e)=>{const t=G(A,e,c.XReg);return ne(t),4+nA()+$(t,w(A,e))}),h("ADC",n.ABS_Y,121,3,(A,e)=>{const t=G(A,e,c.YReg);return ne(t),4+nA()+$(t,w(A,e))}),h("ADC",n.IND_X,97,2,A=>{const e=Y(A,c.XReg);return ne(w(B(e),B(e+1))),6+nA()}),h("ADC",n.IND_Y,113,2,A=>oe(A,ne,!0)),h("ADC",n.IND,114,2,A=>se(A,ne,!0),J);const ie=A=>{c.Accum&=B(A),Q(c.Accum)};h("AND",n.IMM,41,2,A=>(c.Accum&=A,Q(c.Accum),2)),h("AND",n.ZP_REL,37,2,A=>(ie(A),3)),h("AND",n.ZP_X,53,2,A=>(ie(Y(A,c.XReg)),4)),h("AND",n.ABS,45,3,(A,e)=>(ie(w(A,e)),4)),h("AND",n.ABS_X,61,3,(A,e)=>{const t=G(A,e,c.XReg);return ie(t),4+$(t,w(A,e))}),h("AND",n.ABS_Y,57,3,(A,e)=>{const t=G(A,e,c.YReg);return ie(t),4+$(t,w(A,e))}),h("AND",n.IND_X,33,2,A=>{const e=Y(A,c.XReg);return ie(w(B(e),B(e+1))),6}),h("AND",n.IND_Y,49,2,A=>oe(A,ie,!1)),h("AND",n.IND,50,2,A=>se(A,ie,!1),J);const _t=A=>{let e=B(A);B(A),O((e&128)===128),e=(e<<1)%256,T(A,e),Q(e)};h("ASL",n.IMPLIED,10,1,()=>(O((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,Q(c.Accum),2)),h("ASL",n.ZP_REL,6,2,A=>(_t(A),5)),h("ASL",n.ZP_X,22,2,A=>(_t(Y(A,c.XReg)),6)),h("ASL",n.ABS,14,3,(A,e)=>(_t(w(A,e)),6)),h("ASL",n.ABS_X,30,3,(A,e)=>{const t=G(A,e,c.XReg);return _t(t),6+$(t,w(A,e))}),h("BCC",n.ZP_REL,144,2,A=>HA(!bA(),A)),h("BCS",n.ZP_REL,176,2,A=>HA(bA(),A)),h("BEQ",n.ZP_REL,240,2,A=>HA(In(),A)),h("BMI",n.ZP_REL,48,2,A=>HA(pn(),A)),h("BNE",n.ZP_REL,208,2,A=>HA(!In(),A)),h("BPL",n.ZP_REL,16,2,A=>HA(!pn(),A)),h("BVC",n.ZP_REL,80,2,A=>HA(!gn(),A)),h("BVS",n.ZP_REL,112,2,A=>HA(gn(),A)),h("BRA",n.ZP_REL,128,2,A=>HA(!0,A),J);const Xt=A=>{lt((c.Accum&A)===0),Cn((A&128)!==0),ut((A&64)!==0)};h("BIT",n.ZP_REL,36,2,A=>(Xt(B(A)),3)),h("BIT",n.ABS,44,3,(A,e)=>(Xt(B(w(A,e))),4)),h("BIT",n.IMM,137,2,A=>(lt((c.Accum&A)===0),2),J),h("BIT",n.ZP_X,52,2,A=>(Xt(B(Y(A,c.XReg))),4),J),h("BIT",n.ABS_X,60,3,(A,e)=>{const t=G(A,e,c.XReg);return Xt(B(t)),4+$(t,w(A,e))},J);const Lo=(A,e,t=0)=>{const s=(c.PC+t)%65536,i=B(e),I=B(e+1);JA(`${A} $`+K(I)+K(i),Math.trunc(s/256)),JA(A,s%256),JA("P",c.PStatus),Qo(!1),Po();const C=G(i,I,A==="BRK"?-1:0);WA(C)},fn=()=>(bo(),Lo("BRK",65534,2),7);h("BRK",n.IMPLIED,0,1,fn);const mc=()=>Dc()?0:(bo(!1),Lo("IRQ",65534),7),kc=()=>(Lo("NMI",65530),7);h("CLC",n.IMPLIED,24,1,()=>(O(!1),2)),h("CLD",n.IMPLIED,216,1,()=>(Qo(!1),2)),h("CLI",n.IMPLIED,88,1,()=>(Po(!1),2)),h("CLV",n.IMPLIED,184,1,()=>(ut(!1),2));const ye=A=>{const e=B(A);O(c.Accum>=e),Q((c.Accum-e+256)%256)},Tc=A=>{const e=B(A);O(c.Accum>=e),Q((c.Accum-e+256)%256)};h("CMP",n.IMM,201,2,A=>(O(c.Accum>=A),Q((c.Accum-A+256)%256),2)),h("CMP",n.ZP_REL,197,2,A=>(ye(A),3)),h("CMP",n.ZP_X,213,2,A=>(ye(Y(A,c.XReg)),4)),h("CMP",n.ABS,205,3,(A,e)=>(ye(w(A,e)),4)),h("CMP",n.ABS_X,221,3,(A,e)=>{const t=G(A,e,c.XReg);return Tc(t),4+$(t,w(A,e))}),h("CMP",n.ABS_Y,217,3,(A,e)=>{const t=G(A,e,c.YReg);return ye(t),4+$(t,w(A,e))}),h("CMP",n.IND_X,193,2,A=>{const e=Y(A,c.XReg);return ye(w(B(e),B(e+1))),6}),h("CMP",n.IND_Y,209,2,A=>oe(A,ye,!1)),h("CMP",n.IND,210,2,A=>se(A,ye,!1),J);const En=A=>{const e=B(A);O(c.XReg>=e),Q((c.XReg-e+256)%256)};h("CPX",n.IMM,224,2,A=>(O(c.XReg>=A),Q((c.XReg-A+256)%256),2)),h("CPX",n.ZP_REL,228,2,A=>(En(A),3)),h("CPX",n.ABS,236,3,(A,e)=>(En(w(A,e)),4));const Bn=A=>{const e=B(A);O(c.YReg>=e),Q((c.YReg-e+256)%256)};h("CPY",n.IMM,192,2,A=>(O(c.YReg>=A),Q((c.YReg-A+256)%256),2)),h("CPY",n.ZP_REL,196,2,A=>(Bn(A),3)),h("CPY",n.ABS,204,3,(A,e)=>(Bn(w(A,e)),4));const Zt=A=>{const e=Y(B(A),-1);T(A,e),Q(e)};h("DEC",n.IMPLIED,58,1,()=>(c.Accum=Y(c.Accum,-1),Q(c.Accum),2),J),h("DEC",n.ZP_REL,198,2,A=>(Zt(A),5)),h("DEC",n.ZP_X,214,2,A=>(Zt(Y(A,c.XReg)),6)),h("DEC",n.ABS,206,3,(A,e)=>(Zt(w(A,e)),6)),h("DEC",n.ABS_X,222,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),Zt(t),7}),h("DEX",n.IMPLIED,202,1,()=>(c.XReg=Y(c.XReg,-1),Q(c.XReg),2)),h("DEY",n.IMPLIED,136,1,()=>(c.YReg=Y(c.YReg,-1),Q(c.YReg),2));const ae=A=>{c.Accum^=B(A),Q(c.Accum)};h("EOR",n.IMM,73,2,A=>(c.Accum^=A,Q(c.Accum),2)),h("EOR",n.ZP_REL,69,2,A=>(ae(A),3)),h("EOR",n.ZP_X,85,2,A=>(ae(Y(A,c.XReg)),4)),h("EOR",n.ABS,77,3,(A,e)=>(ae(w(A,e)),4)),h("EOR",n.ABS_X,93,3,(A,e)=>{const t=G(A,e,c.XReg);return ae(t),4+$(t,w(A,e))}),h("EOR",n.ABS_Y,89,3,(A,e)=>{const t=G(A,e,c.YReg);return ae(t),4+$(t,w(A,e))}),h("EOR",n.IND_X,65,2,A=>{const e=Y(A,c.XReg);return ae(w(B(e),B(e+1))),6}),h("EOR",n.IND_Y,81,2,A=>oe(A,ae,!1)),h("EOR",n.IND,82,2,A=>se(A,ae,!1),J);const xt=A=>{const e=Y(B(A),1);T(A,e),Q(e)};h("INC",n.IMPLIED,26,1,()=>(c.Accum=Y(c.Accum,1),Q(c.Accum),2),J),h("INC",n.ZP_REL,230,2,A=>(xt(A),5)),h("INC",n.ZP_X,246,2,A=>(xt(Y(A,c.XReg)),6)),h("INC",n.ABS,238,3,(A,e)=>(xt(w(A,e)),6)),h("INC",n.ABS_X,254,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),xt(t),7}),h("INX",n.IMPLIED,232,1,()=>(c.XReg=Y(c.XReg,1),Q(c.XReg),2)),h("INY",n.IMPLIED,200,1,()=>(c.YReg=Y(c.YReg,1),Q(c.YReg),2)),h("JMP",n.ABS,76,3,(A,e)=>(WA(G(A,e,-3)),3)),h("JMP",n.IND,108,3,(A,e)=>{const t=w(A,e);return A=B(t),e=B((t+1)%65536),WA(G(A,e,-3)),6}),h("JMP",n.IND_X,124,3,(A,e)=>{const t=G(A,e,c.XReg);return A=B(t),e=B((t+1)%65536),WA(G(A,e,-3)),6},J),h("JSR",n.ABS,32,3,(A,e)=>{const t=(c.PC+2)%65536;return JA("JSR $"+K(e)+K(A),Math.trunc(t/256)),JA("JSR",t%256),WA(G(A,e,-3)),6});const ce=A=>{c.Accum=B(A),Q(c.Accum)};h("LDA",n.IMM,169,2,A=>(c.Accum=A,Q(c.Accum),2)),h("LDA",n.ZP_REL,165,2,A=>(ce(A),3)),h("LDA",n.ZP_X,181,2,A=>(ce(Y(A,c.XReg)),4)),h("LDA",n.ABS,173,3,(A,e)=>(ce(w(A,e)),4)),h("LDA",n.ABS_X,189,3,(A,e)=>{const t=G(A,e,c.XReg);return ce(t),4+$(t,w(A,e))}),h("LDA",n.ABS_Y,185,3,(A,e)=>{const t=G(A,e,c.YReg);return ce(t),4+$(t,w(A,e))}),h("LDA",n.IND_X,161,2,A=>{const e=Y(A,c.XReg);return ce(w(B(e),B((e+1)%256))),6}),h("LDA",n.IND_Y,177,2,A=>oe(A,ce,!1)),h("LDA",n.IND,178,2,A=>se(A,ce,!1),J);const Vt=A=>{c.XReg=B(A),Q(c.XReg)};h("LDX",n.IMM,162,2,A=>(c.XReg=A,Q(c.XReg),2)),h("LDX",n.ZP_REL,166,2,A=>(Vt(A),3)),h("LDX",n.ZP_Y,182,2,A=>(Vt(Y(A,c.YReg)),4)),h("LDX",n.ABS,174,3,(A,e)=>(Vt(w(A,e)),4)),h("LDX",n.ABS_Y,190,3,(A,e)=>{const t=G(A,e,c.YReg);return Vt(t),4+$(t,w(A,e))});const Jt=A=>{c.YReg=B(A),Q(c.YReg)};h("LDY",n.IMM,160,2,A=>(c.YReg=A,Q(c.YReg),2)),h("LDY",n.ZP_REL,164,2,A=>(Jt(A),3)),h("LDY",n.ZP_X,180,2,A=>(Jt(Y(A,c.XReg)),4)),h("LDY",n.ABS,172,3,(A,e)=>(Jt(w(A,e)),4)),h("LDY",n.ABS_X,188,3,(A,e)=>{const t=G(A,e,c.XReg);return Jt(t),4+$(t,w(A,e))});const jt=A=>{let e=B(A);B(A),O((e&1)===1),e>>=1,T(A,e),Q(e)};h("LSR",n.IMPLIED,74,1,()=>(O((c.Accum&1)===1),c.Accum>>=1,Q(c.Accum),2)),h("LSR",n.ZP_REL,70,2,A=>(jt(A),5)),h("LSR",n.ZP_X,86,2,A=>(jt(Y(A,c.XReg)),6)),h("LSR",n.ABS,78,3,(A,e)=>(jt(w(A,e)),6)),h("LSR",n.ABS_X,94,3,(A,e)=>{const t=G(A,e,c.XReg);return jt(t),6+$(t,w(A,e))}),h("NOP",n.IMPLIED,234,1,()=>2);const le=A=>{c.Accum|=B(A),Q(c.Accum)};h("ORA",n.IMM,9,2,A=>(c.Accum|=A,Q(c.Accum),2)),h("ORA",n.ZP_REL,5,2,A=>(le(A),3)),h("ORA",n.ZP_X,21,2,A=>(le(Y(A,c.XReg)),4)),h("ORA",n.ABS,13,3,(A,e)=>(le(w(A,e)),4)),h("ORA",n.ABS_X,29,3,(A,e)=>{const t=G(A,e,c.XReg);return le(t),4+$(t,w(A,e))}),h("ORA",n.ABS_Y,25,3,(A,e)=>{const t=G(A,e,c.YReg);return le(t),4+$(t,w(A,e))}),h("ORA",n.IND_X,1,2,A=>{const e=Y(A,c.XReg);return le(w(B(e),B(e+1))),6}),h("ORA",n.IND_Y,17,2,A=>oe(A,le,!1)),h("ORA",n.IND,18,2,A=>se(A,le,!1),J),h("PHA",n.IMPLIED,72,1,()=>(JA("PHA",c.Accum),3)),h("PHP",n.IMPLIED,8,1,()=>(JA("PHP",c.PStatus|16),3)),h("PHX",n.IMPLIED,218,1,()=>(JA("PHX",c.XReg),3),J),h("PHY",n.IMPLIED,90,1,()=>(JA("PHY",c.YReg),3),J),h("PLA",n.IMPLIED,104,1,()=>(c.Accum=jA(),Q(c.Accum),4)),h("PLP",n.IMPLIED,40,1,()=>(ln(jA()),4)),h("PLX",n.IMPLIED,250,1,()=>(c.XReg=jA(),Q(c.XReg),4),J),h("PLY",n.IMPLIED,122,1,()=>(c.YReg=jA(),Q(c.YReg),4),J);const Ht=A=>{let e=B(A);B(A);const t=bA()?1:0;O((e&128)===128),e=(e<<1)%256|t,T(A,e),Q(e)};h("ROL",n.IMPLIED,42,1,()=>{const A=bA()?1:0;return O((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|A,Q(c.Accum),2}),h("ROL",n.ZP_REL,38,2,A=>(Ht(A),5)),h("ROL",n.ZP_X,54,2,A=>(Ht(Y(A,c.XReg)),6)),h("ROL",n.ABS,46,3,(A,e)=>(Ht(w(A,e)),6)),h("ROL",n.ABS_X,62,3,(A,e)=>{const t=G(A,e,c.XReg);return Ht(t),6+$(t,w(A,e))});const vt=A=>{let e=B(A);B(A);const t=bA()?128:0;O((e&1)===1),e=e>>1|t,T(A,e),Q(e)};h("ROR",n.IMPLIED,106,1,()=>{const A=bA()?128:0;return O((c.Accum&1)===1),c.Accum=c.Accum>>1|A,Q(c.Accum),2}),h("ROR",n.ZP_REL,102,2,A=>(vt(A),5)),h("ROR",n.ZP_X,118,2,A=>(vt(Y(A,c.XReg)),6)),h("ROR",n.ABS,110,3,(A,e)=>(vt(w(A,e)),6)),h("ROR",n.ABS_X,126,3,(A,e)=>{const t=G(A,e,c.XReg);return vt(t),6+$(t,w(A,e))}),h("RTI",n.IMPLIED,64,1,()=>(ln(jA()),bo(!1),WA(w(jA(),jA())-1),6)),h("RTS",n.IMPLIED,96,1,()=>(WA(w(jA(),jA())),6));const Dn=A=>{const e=255-A;let t=c.Accum+e+(bA()?1:0);const s=t>=256,i=c.Accum<=127&&e<=127,I=c.Accum>=128&&e>=128;ut(t%256>=128?i:I);const C=(c.Accum&15)-(A&15)+(bA()?0:-1);t=c.Accum-A+(bA()?0:-1),t<0&&(t-=96),C<0&&(t-=6),c.Accum=t&255,Q(c.Accum),O(s)},ue=A=>{nA()?Dn(B(A)):Gt(255-B(A))};h("SBC",n.IMM,233,2,A=>(nA()?Dn(A):Gt(255-A),2+nA())),h("SBC",n.ZP_REL,229,2,A=>(ue(A),3+nA())),h("SBC",n.ZP_X,245,2,A=>(ue(Y(A,c.XReg)),4+nA())),h("SBC",n.ABS,237,3,(A,e)=>(ue(w(A,e)),4+nA())),h("SBC",n.ABS_X,253,3,(A,e)=>{const t=G(A,e,c.XReg);return ue(t),4+nA()+$(t,w(A,e))}),h("SBC",n.ABS_Y,249,3,(A,e)=>{const t=G(A,e,c.YReg);return ue(t),4+nA()+$(t,w(A,e))}),h("SBC",n.IND_X,225,2,A=>{const e=Y(A,c.XReg);return ue(w(B(e),B(e+1))),6+nA()}),h("SBC",n.IND_Y,241,2,A=>oe(A,ue,!0)),h("SBC",n.IND,242,2,A=>se(A,ue,!0),J),h("SEC",n.IMPLIED,56,1,()=>(O(),2)),h("SED",n.IMPLIED,248,1,()=>(Qo(),2)),h("SEI",n.IMPLIED,120,1,()=>(Po(),2)),h("STA",n.ZP_REL,133,2,A=>(T(A,c.Accum),3)),h("STA",n.ZP_X,149,2,A=>(T(Y(A,c.XReg),c.Accum),4)),h("STA",n.ABS,141,3,(A,e)=>(T(w(A,e),c.Accum),4)),h("STA",n.ABS_X,157,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),T(t,c.Accum),5}),h("STA",n.ABS_Y,153,3,(A,e)=>(T(G(A,e,c.YReg),c.Accum),5)),h("STA",n.IND_X,129,2,A=>{const e=Y(A,c.XReg);return T(w(B(e),B(e+1)),c.Accum),6});const mn=A=>{T(A,c.Accum)};h("STA",n.IND_Y,145,2,A=>(oe(A,mn,!1),6)),h("STA",n.IND,146,2,A=>se(A,mn,!1),J),h("STX",n.ZP_REL,134,2,A=>(T(A,c.XReg),3)),h("STX",n.ZP_Y,150,2,A=>(T(Y(A,c.YReg),c.XReg),4)),h("STX",n.ABS,142,3,(A,e)=>(T(w(A,e),c.XReg),4)),h("STY",n.ZP_REL,132,2,A=>(T(A,c.YReg),3)),h("STY",n.ZP_X,148,2,A=>(T(Y(A,c.XReg),c.YReg),4)),h("STY",n.ABS,140,3,(A,e)=>(T(w(A,e),c.YReg),4)),h("STZ",n.ZP_REL,100,2,A=>(T(A,0),3),J),h("STZ",n.ZP_X,116,2,A=>(T(Y(A,c.XReg),0),4),J),h("STZ",n.ABS,156,3,(A,e)=>(T(w(A,e),0),4),J),h("STZ",n.ABS_X,158,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),T(t,0),5},J),h("TAX",n.IMPLIED,170,1,()=>(c.XReg=c.Accum,Q(c.XReg),2)),h("TAY",n.IMPLIED,168,1,()=>(c.YReg=c.Accum,Q(c.YReg),2)),h("TSX",n.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,Q(c.XReg),2)),h("TXA",n.IMPLIED,138,1,()=>(c.Accum=c.XReg,Q(c.Accum),2)),h("TXS",n.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),h("TYA",n.IMPLIED,152,1,()=>(c.Accum=c.YReg,Q(c.Accum),2));const kn=A=>{const e=B(A);lt((c.Accum&e)===0),T(A,e&~c.Accum)};h("TRB",n.ZP_REL,20,2,A=>(kn(A),5),J),h("TRB",n.ABS,28,3,(A,e)=>(kn(w(A,e)),6),J);const Tn=A=>{const e=B(A);lt((c.Accum&e)===0),T(A,e|c.Accum)};h("TSB",n.ZP_REL,4,2,A=>(Tn(A),5),J),h("TSB",n.ABS,12,3,(A,e)=>(Tn(w(A,e)),6),J);const wc=[2,34,66,98,130,194,226],LA="???";wc.forEach(A=>{h(LA,n.IMPLIED,A,2,()=>2),v[A].is6502=!1});for(let A=0;A<=15;A++)h(LA,n.IMPLIED,3+16*A,1,()=>1),v[3+16*A].is6502=!1,h(LA,n.IMPLIED,7+16*A,1,()=>1),v[7+16*A].is6502=!1,h(LA,n.IMPLIED,11+16*A,1,()=>1),v[11+16*A].is6502=!1,h(LA,n.IMPLIED,15+16*A,1,()=>1),v[15+16*A].is6502=!1;h(LA,n.IMPLIED,68,2,()=>3),v[68].is6502=!1,h(LA,n.IMPLIED,84,2,()=>4),v[84].is6502=!1,h(LA,n.IMPLIED,212,2,()=>4),v[212].is6502=!1,h(LA,n.IMPLIED,244,2,()=>4),v[244].is6502=!1,h(LA,n.IMPLIED,92,3,()=>8),v[92].is6502=!1,h(LA,n.IMPLIED,220,3,()=>4),v[220].is6502=!1,h(LA,n.IMPLIED,252,3,()=>4),v[252].is6502=!1;for(let A=0;A<256;A++)v[A]||(console.error("ERROR: OPCODE "+A.toString(16)+" should be implemented"),h("BRK",n.IMPLIED,A,1,fn));const dc=()=>{const A=new Array(256);for(let e=0;e<256;e++)A[e]={name:v[e].name,mode:v[e].mode,pcode:v[e].pcode,bytes:v[e].bytes,is6502:v[e].is6502};V1(A)},fA=(A,e,t)=>{const s=e&7,i=e>>>3;return A[i]|=t>>>s,s&&(A[i+1]|=t<<8-s),e+8},zt=(A,e,t)=>(e=fA(A,e,t>>>1|170),e=fA(A,e,t|170),e),Fo=(A,e)=>(e=fA(A,e,255),e+2),yc=A=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],t=new Uint8Array(343),s=[0,2,1,3];for(let I=0;I<84;I++)t[I]=s[A[I]&3]|s[A[I+86]&3]<<2|s[A[I+172]&3]<<4;t[84]=s[A[84]&3]<<0|s[A[170]&3]<<2,t[85]=s[A[85]&3]<<0|s[A[171]&3]<<2;for(let I=0;I<256;I++)t[86+I]=A[I]>>>2;t[342]=t[341];let i=342;for(;i>1;)i--,t[i]^=t[i-1];for(let I=0;I<343;I++)t[I]=e[t[I]];return t},Rc=(A,e,t)=>{let s=0;const i=new Uint8Array(6646).fill(0);for(let I=0;I<16;I++)s=Fo(i,s);for(let I=0;I<16;I++){s=fA(i,s,213),s=fA(i,s,170),s=fA(i,s,150),s=zt(i,s,254),s=zt(i,s,e),s=zt(i,s,I),s=zt(i,s,254^e^I),s=fA(i,s,222),s=fA(i,s,170),s=fA(i,s,235);for(let D=0;D<7;D++)s=Fo(i,s);s=fA(i,s,213),s=fA(i,s,170),s=fA(i,s,173);const C=I===15?15:I*(t?8:7)%15,u=yc(A.slice(C*256,C*256+256));for(let D=0;D<u.length;D++)s=fA(i,s,u[D]);s=fA(i,s,222),s=fA(i,s,170),s=fA(i,s,235);for(let D=0;D<16;D++)s=Fo(i,s)}return i},Pc=(A,e)=>{const t=A.length/4096;if(t<34||t>40)return new Uint8Array;const s=new Uint8Array(1536+t*13*512).fill(0);s.set(et(`WOZ2ÿ
\r
`),0),s.set(et("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(et("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(et("TMAP"),80),s[84]=160,s.fill(255,88,248);let i=0;for(let I=0;I<t;I++)i=88+(I<<2),I>0&&(s[i-1]=I),s[i]=s[i+1]=I;s.set(et("TRKS"),248),s.set(us(1280+t*13*512),252);for(let I=0;I<t;I++){i=256+(I<<3),s.set(Ui(3+I*13),i),s[i+2]=13,s.set(us(50304),i+4);const C=A.slice(I*16*256,(I+1)*16*256),u=Rc(C,I,e);i=1536+I*13*512,s.set(u,i)}return s},Qc=(A,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,D)=>u!==e[D])===void 0))return!1;A.isWriteProtected=e[22]===1,A.isSynchronized=e[23]===1,A.optimalTiming=e[59]>0?e[59]:32,A.optimalTiming!==32&&console.log(`${A.filename} optimal timing = ${A.optimalTiming}`);const i=e.slice(8,12),I=i[0]+(i[1]<<8)+(i[2]<<16)+i[3]*2**24,C=Wi(e,12);if(I!==0&&I!==C)return alert("CRC checksum error: "+A.filename),!1;for(let u=0;u<160;u++){const D=e[88+u];if(D<255){const m=256+8*D,k=e.slice(m,m+8);A.trackStart[u]=512*((k[1]<<8)+k[0]),A.trackNbits[u]=k[4]+(k[5]<<8)+(k[6]<<16)+k[7]*2**24,A.maxQuarterTrack=u}}return!0},bc=(A,e)=>{if(!([87,79,90,49,255,10,13,10].find((i,I)=>i!==e[I])===void 0))return!1;A.isWriteProtected=e[22]===1;for(let i=0;i<160;i++){const I=e[88+i];if(I<255){A.trackStart[i]=256+I*6656;const C=e.slice(A.trackStart[i]+6646,A.trackStart[i]+6656);A.trackNbits[i]=C[2]+(C[3]<<8),A.maxQuarterTrack=i}}return!0},Lc=A=>{const e=A.toLowerCase(),t=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return t||s},Fc=(A,e)=>{const s=A.filename.toLowerCase().endsWith(".po"),i=Pc(e,s);return i.length===0?new Uint8Array:(A.filename=Yi(A.filename,"woz"),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),i)},Mc=(A,e)=>{A.diskHasChanges=!1;const t=A.filename.toLowerCase();return e.length>1e4&&(Is(t)&&(A.hardDrive=!0,A.status="",t.endsWith(".hdv")||t.endsWith(".po")||t.endsWith(".2meg")||t.endsWith(".2mg"))||((Lc(A.filename)||e.length===143360)&&(e=Fc(A,e)),Qc(A,e))||bc(A,e))?e:(t!==""&&console.error(`Unknown disk format or unable to decode: ${A.filename} (${e.length} bytes).`),new Uint8Array)},qc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ne=0,BA=0,DA=0,$t=!1,Mo=!1;const Kc=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],Uc=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],Yc=A=>{$t=!1,Qn(A),A.quarterTrack=A.maxQuarterTrack,A.prevQuarterTrack=A.maxQuarterTrack},Oc=(A=!1)=>{if(A){const e=rr();e.motorRunning&&bn(e)}else je(Ee.MOTOR_OFF)};let Ar=0;const Wc=(A,e,t)=>{Ar=0,A.prevQuarterTrack=A.quarterTrack,A.quarterTrack+=e,A.quarterTrack<0||A.quarterTrack>A.maxQuarterTrack?(je(Ee.TRACK_END),A.quarterTrack=Math.max(0,Math.min(A.quarterTrack,A.maxQuarterTrack))):je(Ee.TRACK_SEEK),A.status=` Trk ${A.quarterTrack/4}`,wA(),DA+=t,A.trackLocation+=Math.floor(DA/4),DA=DA%4,A.quarterTrack!=A.prevQuarterTrack&&(A.trackLocation=Math.floor(A.trackLocation*(A.trackNbits[A.quarterTrack]/A.trackNbits[A.prevQuarterTrack])))};let wn=0;const Nc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],dn=()=>(wn++,Nc[wn&31]);let er=0;const Gc=A=>(er<<=1,er|=A,er&=15,er===0?dn():A),yn=[128,64,32,16,8,4,2,1],_c=[127,191,223,239,247,251,253,254],Xc=(A,e)=>{const t=A.trackLocation;A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],t!==A.trackLocation&&(Ar>=9?(Ar=0,A.trackLocation+=4):Ar++);let s;if(A.trackStart[A.quarterTrack]>0){const i=A.trackStart[A.quarterTrack]+(A.trackLocation>>3),I=e[i],C=A.trackLocation&7;s=(I&yn[C])>>7-C,s=Gc(s)}else s=dn();return A.trackLocation++,s},Zc=()=>Math.floor(256*Math.random()),Rn=(A,e,t)=>{if(e.length===0)return Zc();let s=0;for(DA+=t;DA>=A.optimalTiming/8;){const i=Xc(A,e);if(BA&128&&!i||(BA&128&&(BA=0),BA=BA<<1|i),DA-=A.optimalTiming/8,BA&128&&DA<=A.optimalTiming/4)break}return DA<0&&(DA=0),BA&=255,s=BA,s};let Ie=0;const qo=(A,e,t)=>{if(A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],A.trackStart[A.quarterTrack]>0){const s=A.trackStart[A.quarterTrack]+(A.trackLocation>>3);let i=e[s];const I=A.trackLocation&7;t?i|=yn[I]:i&=_c[I],e[s]=i}A.trackLocation++},Pn=(A,e,t)=>{if(!(e.length===0||A.trackStart[A.quarterTrack]===0)&&BA>0){if(t>=16)for(let s=7;s>=0;s--)qo(A,e,BA&2**s?1:0);t>=36&&qo(A,e,0),t>=40&&qo(A,e,0),Ko.push(t>=40?2:t>=36?1:BA),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),BA=0}},Qn=A=>{Ne=0,$t||(A.motorRunning=!1),wA(),je(Ee.MOTOR_OFF)},bn=A=>{Ne?(clearTimeout(Ne),Ne=0):DA=0,A.motorRunning=!0,wA(),je(Ee.MOTOR_ON)},xc=A=>{Ne===0&&(Ne=setTimeout(()=>Qn(A),1e3))};let Ko=[];const tr=A=>{Ko.length>0&&A.quarterTrack===0&&(Ko=[])},Vc=(A,e)=>{if(A>=49408)return-1;let t=rr();const s=Hc();if(t.hardDrive)return 0;let i=0;const I=c.cycleCount-Ie;switch(A=A&15,A){case 9:$t=!0,bn(t),tr(t);break;case 8:t.motorRunning&&!t.writeMode&&(i=Rn(t,s,I),Ie=c.cycleCount),$t=!1,xc(t),tr(t);break;case 10:case 11:{const C=A===10?2:3,u=rr();jc(C),t=rr(),t!==u&&u.motorRunning&&(u.motorRunning=!1,t.motorRunning=!0,wA());break}case 12:Mo=!1,t.motorRunning&&!t.writeMode&&(i=Rn(t,s,I),Ie=c.cycleCount);break;case 13:Mo=!0,t.motorRunning&&(t.writeMode?(Pn(t,s,I),Ie=c.cycleCount,e>=0&&(BA=e)):(BA=0,DA+=I,t.trackLocation+=Math.floor(DA/4),DA=DA%4,Ie=c.cycleCount,e>=0?console.log(`${t.filename}: Illegal LOAD of write data latch during read: PC=${K(c.PC)} Value=${K(e)}`):console.log(`${t.filename}: Illegal READ of write data latch during read: PC=${K(c.PC)}`)));break;case 14:t.motorRunning&&t.writeMode&&(Pn(t,s,I),t.lastAppleWriteTime=Date.now(),Ie=c.cycleCount),t.writeMode=!1,Mo&&(i=t.isWriteProtected?255:0),tr(t);break;case 15:t.writeMode=!0,Ie=c.cycleCount,e>=0&&(BA=e);break;default:{if(A<0||A>7)break;const C=A/2;A%2?t.currentPhase|=1<<C:t.currentPhase&=~(1<<C);const D=Kc[t.currentPhase];if(t.motorRunning&&D>=0){const m=t.quarterTrack&7,k=Uc[m][D];Wc(t,k,I),Ie=c.cycleCount}tr(t);break}}return i},Jc=()=>{We(6,Uint8Array.from(qc)),st(6,Vc)},vA=(A,e,t)=>({index:A,hardDrive:t,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:t?Array():Array(160).fill(0),trackNbits:t?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),Ln=()=>{R[0]=vA(0,1,!0),R[1]=vA(1,2,!0),R[2]=vA(2,1,!1),R[3]=vA(3,2,!1);for(let A=0;A<R.length;A++)zA[A]=new Uint8Array},R=[],zA=[];Ln();let Re=2;const jc=A=>{Re=A},rr=()=>R[Re],Hc=()=>zA[Re],Uo=A=>R[A==2?1:0],or=A=>{const e=zA[A==2?1:0];let t="";for(let i=0;i<4;i++)t+=String.fromCharCode(e[i]);const s=t==="2IMG"?64:0;return[e,s,e.length-s]},It=[],wA=()=>{for(let A=0;A<R.length;A++){if(R[A].filename===""&&!R[A].cloudData&&It[A]&&It[A].diskHasChanges===R[A].diskHasChanges&&It[A].motorRunning===R[A].motorRunning&&It[A].status===R[A].status)continue;const e={index:A,hardDrive:R[A].hardDrive,drive:R[A].drive,filename:R[A].filename,status:R[A].status,motorRunning:R[A].motorRunning,diskHasChanges:R[A].diskHasChanges,isWriteProtected:R[A].isWriteProtected,diskData:R[A].diskHasChanges&&!R[A].motorRunning?zA[A]:new Uint8Array,lastAppleWriteTime:R[A].lastAppleWriteTime,lastLocalFileWriteTime:R[A].lastLocalFileWriteTime,cloudData:R[A].cloudData,writableFileHandle:R[A].writableFileHandle};N1(e),It[A]={diskHasChanges:e.diskHasChanges,motorRunning:e.motorRunning,status:e.status}}},vc=A=>{const e=["","",""];for(let s=0;s<R.length;s++)(A||zA[s].length<32e6)&&(e[s]=Ke.Buffer.from(zA[s]).toString("base64"));const t={currentDrive:Re,driveState:[vA(0,1,!0),vA(1,2,!0),vA(2,1,!1),vA(3,2,!1)],driveData:e};for(let s=0;s<R.length;s++)t.driveState[s]={...R[s]};return t},zc=A=>{je(Ee.MOTOR_OFF),Re=A.currentDrive,A.driveState.length===3&&Re>0&&Re++,Ln();let e=0;for(let t=0;t<A.driveState.length;t++)R[e]={...A.driveState[t]},A.driveData[t]!==""&&(zA[e]=new Uint8Array(Ke.Buffer.from(A.driveData[t],"base64"))),A.driveState.length===3&&t===0&&(e=1),e++;wA()},$c=()=>{for(let A=0;A<R.length;A++)R[A].hardDrive||Yc(R[A]);wA()},Fn=(A=!1)=>{Oc(A),wA()},Al=(A,e=!1)=>{let t=A.index,s=A.drive,i=A.hardDrive;if(e||A.filename!==""&&(Is(A.filename)?(i=!0,t=A.drive<=1?0:1,s=t+1):(i=!1,t=A.drive<=1?2:3,s=t-1)),R[t]=vA(t,s,i),R[t].filename=A.filename,zA[t]=Mc(R[t],A.diskData),zA[t].length===0){R[t].filename="",wA();return}R[t].motorRunning=A.motorRunning,R[t].cloudData=A.cloudData,R[t].writableFileHandle=A.writableFileHandle,R[t].lastLocalFileWriteTime=A.lastLocalFileWriteTime,wA()},el=A=>{const e=A.index;R[e].filename=A.filename,R[e].motorRunning=A.motorRunning,R[e].isWriteProtected=A.isWriteProtected,R[e].diskHasChanges=A.diskHasChanges,R[e].lastAppleWriteTime=A.lastAppleWriteTime,R[e].lastLocalFileWriteTime=A.lastLocalFileWriteTime,R[e].cloudData=A.cloudData,R[e].writableFileHandle=A.writableFileHandle,wA()},Pe={OVRN:4,RX_FULL:8,IRQ:128,HW_RESET:16},ht={BAUD_RATE:15,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Qe={RX_INT_DIS:2,TX_INT_EN:4,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0};class tl{_control;_status;_command;_lastRead;_lastConfig;_receiveBuffer;_extFuncs;buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let s=0;s<t;s++)this._receiveBuffer.shift(),this._status|=Pe.OVRN;this._status|=Pe.RX_FULL,(this._control&Qe.RX_INT_DIS)==0&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&Qe.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-8,this._receiveBuffer.length?(this._status|=Pe.RX_FULL,(this._control&Qe.RX_INT_DIS)==0&&this.irq(!0)):this._status&=-9,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&Pe.IRQ&&this.irq(!1),this._status&=-129,e}set status(e){this.reset()}irq(e){e?this._status|=Pe.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&ht.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ht.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ht.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Qe.PARITY_EN)switch(this._command&Qe.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let t=!1;e.baud!=this._lastConfig.baud&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=ht.HW_RESET,this._command=Qe.HW_RESET,this._status=Pe.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=ht.HW_RESET,this._command=Qe.HW_RESET,this._status=Pe.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}}const Yo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let sr=1,PA;const rl=A=>{ot(sr,A)},ol=A=>{console.log("ConfigChange: ",A)},sl=A=>{PA&&PA.buffer(A)},nl=()=>{PA&&PA.reset()},il=(A=!0,e=1)=>{if(!A)return;sr=e;const t={sendData:_1,interrupt:rl,configChange:ol};PA=new tl(t);const s=new Uint8Array(Yo.length+256);s.set(Yo.slice(1792,2048)),s.set(Yo,256),We(sr,s),st(sr,al)},al=(A,e=-1)=>{if(A>=49408)return-1;const t={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(A&15){case t.DIPSW1:return 226;case t.DIPSW2:return 40;case t.IOREG:if(e>=0)PA.data=e;else return PA.data;break;case t.STATUS:if(e>=0)PA.status=e;else return PA.status;break;case t.COMMAND:if(e>=0)PA.command=e;else return PA.command;break;case t.CONTROL:if(e>=0)PA.control=e;else return PA.control;break;default:console.log("SSC unknown softswitch",(A&15).toString(16));break}return-1},gt=(A,e)=>String(A).padStart(e,"0");(()=>{const A=new Uint8Array(256).fill(96);return A[0]=8,A[2]=40,A[4]=88,A[6]=112,A})();const cl=()=>{const A=new Date,e=gt(A.getMonth()+1,2)+","+gt(A.getDay(),2)+","+gt(A.getDate(),2)+","+gt(A.getHours(),2)+","+gt(A.getMinutes(),2);for(let t=0;t<e.length;t++)T(512+t,e.charCodeAt(t)|128)};let nr=!1;const Mn=A=>{const e=A.split(","),t=e[0].split(/([+-])/);return{label:t[0]?t[0]:"",operation:t[1]?t[1]:"",value:t[2]?parseInt(t[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},qn=A=>{let e=n.IMPLIED,t=-1;if(A.length>0){A.startsWith("#")?(e=n.IMM,A=A.substring(1)):A.startsWith("(")?(A.endsWith(",Y")?e=n.IND_Y:A.endsWith(",X)")?e=n.IND_X:e=n.IND,A=A.substring(1)):A.endsWith(",X")?e=A.length>5?n.ABS_X:n.ZP_X:A.endsWith(",Y")?e=A.length>5?n.ABS_Y:n.ZP_Y:e=A.length>3?n.ABS:n.ZP_REL,A.startsWith("$")&&(A="0x"+A.substring(1)),t=parseInt(A);const s=Mn(A);if(s.operation&&s.value){switch(s.operation){case"+":t+=s.value;break;case"-":t-=s.value;break;default:console.error("Unknown operation in operand: "+A)}t=(t%65536+65536)%65536}}return[e,t]};let be={};const Kn=(A,e,t,s)=>{let i=n.IMPLIED,I=-1;if(t.match(/^[#]?[$0-9()]+/))return Object.entries(be).forEach(([u,D])=>{t=t.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+K(D))}),qn(t);const C=Mn(t);if(C.label){const u=C.label.startsWith("<"),D=C.label.startsWith(">"),m=C.label.startsWith("#")||D||u;if(m&&(C.label=C.label.substring(1)),C.label in be?(I=be[C.label],D?I=I>>8&255:u&&(I=I&255)):s===2&&console.error("Missing label: "+C.label),C.operation&&C.value){switch(C.operation){case"+":I+=C.value;break;case"-":I-=C.value;break;default:console.error("Unknown operation in operand: "+t)}I=(I%65536+65536)%65536}yt(e)?(i=n.ZP_REL,I=I-A+254,I>255&&(I-=256)):m?i=n.IMM:(i=I>=0&&I<=255?n.ZP_REL:n.ABS,i=C.idx==="X"?i===n.ABS?n.ABS_X:n.ZP_X:i,i=C.idx==="Y"?i===n.ABS?n.ABS_Y:n.ZP_Y:i)}return[i,I]},ll=(A,e)=>{A=A.replace(/\s+/g," ");const t=A.split(" ");return{label:t[0]?t[0]:e,instr:t[1]?t[1]:"",operand:t[2]?t[2]:""}},ul=(A,e)=>{if(A.label in be&&console.error("Redefined label: "+A.label),A.instr==="EQU"){const[t,s]=Kn(e,A.instr,A.operand,2);t!==n.ABS&&t!==n.ZP_REL&&console.error("Illegal EQU value: "+A.operand),be[A.label]=s}else be[A.label]=e},Il=A=>{const e=[];switch(A.instr){case"ASC":case"DA":{let t=A.operand,s=0;t.startsWith('"')&&t.endsWith('"')?s=128:t.startsWith("'")&&t.endsWith("'")?s=0:console.error("Invalid string: "+t),t=t.substring(1,t.length-1);for(let i=0;i<t.length;i++)e.push(t.charCodeAt(i)|s);e.push(0);break}case"HEX":{(A.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(i=>{const I=parseInt(i,16);isNaN(I)&&console.error(`Invalid HEX value: ${i} in ${A.operand}`),e.push(I)});break}default:console.error("Unknown pseudo ops: "+A.instr);break}return e},hl=(A,e)=>{const t=[],s=v[A];return t.push(A),e>=0&&(t.push(e%256),s.bytes===3&&t.push(Math.trunc(e/256))),t};let Oo=0;const Un=(A,e)=>{let t=Oo;const s=[];let i="";if(A.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;let C=(I+"                   ").slice(0,30)+K(t,4)+"- ";const u=ll(I,i);if(i="",!u.instr){i=u.label;return}if(u.instr==="ORG"){if(e===1){const[M,d]=qn(u.operand);M===n.ABS&&(Oo=d,t=d)}nr&&e===2&&console.log(C);return}if(e===1&&u.label&&ul(u,t),u.instr==="EQU")return;let D=[],m,k;if(["ASC","DA","HEX"].includes(u.instr))D=Il(u),t+=D.length;else if([m,k]=Kn(t,u.instr,u.operand,e),e===2&&isNaN(k)&&console.error(`Unknown/illegal value: ${I}`),u.instr==="DB")D.push(k&255),t++;else if(u.instr==="DW")D.push(k&255),D.push(k>>8&255),t+=2;else if(u.instr==="DS")for(let M=0;M<k;M++)D.push(0),t++;else{e===2&&yt(u.instr)&&(k<0||k>255)&&console.error(`Branch instruction out of range: ${I} value: ${k} pass: ${e}`);const M=v.findIndex(d=>d&&d.name===u.instr&&d.mode===m);M<0&&console.error(`Unknown instruction: "${I}" mode=${m} pass=${e}`),D=hl(M,k),t+=v[M].bytes}nr&&e===2&&(D.forEach(M=>{C+=` ${K(M)}`}),console.log(C)),s.push(...D)}),nr&&e===2){let I="";s.forEach(C=>{I+=` ${K(C)}`}),console.log(I)}return s},ir=(A,e,t=!1)=>{be={},nr=t;try{return Oo=A,Un(e,1),Un(e,2)}catch(s){return console.error(s),[]}},gl=`
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
`;let Le=49286,ar=49289,cr=49291,lr=49292,ur=49293,Ir=49294,hr=49295;const Yn=(A,e,t,s,i)=>{const I=A&255,C=A>>8&3,u=e&255,D=e>>8&3;Z(t,I),Z(s,C<<4|D),Z(i,u)},On=(A,e,t)=>{const s=gA(A),i=gA(e),I=gA(t),C=i>>4&3,u=i&3;return[s|C<<8,I|u<<8]},gr=()=>On(ar,cr,lr),Wo=()=>On(ur,Ir,hr),pr=(A,e)=>{Yn(A,e,ar,cr,lr)},Cr=(A,e)=>{Yn(A,e,ur,Ir,hr)},Sr=A=>{Z(Le,A),Si(!!A)},pl=()=>{MA=0,qA=0,pr(0,1023),Cr(0,1023),Sr(0),uA=0,he=0,Ge=0,pt=0,Ct=0,dA=0,GA=0,_e=0,fr=0};let MA=0,qA=0,fr=0,uA=0,he=0,Ge=0,pt=0,Ct=0,dA=0,GA=0,_e=0,Wn=0,pA=5;const Er=54,Br=55,Cl=56,Sl=57,Nn=()=>{const A=new Uint8Array(256).fill(0),e=ir(0,gl.split(`
`));return A.set(e,0),A[251]=214,A[255]=1,A},fl=(A=!0,e=5)=>{if(!A)return;pA=e;const t=49152+pA*256,s=49152+pA*256+8;We(pA,Nn(),t,Dl),We(pA,Nn(),s,cl),st(pA,Tl),Le=49280+(Le&15)+pA*16,ar=49280+(ar&15)+pA*16,cr=49280+(cr&15)+pA*16,lr=49280+(lr&15)+pA*16,ur=49280+(ur&15)+pA*16,Ir=49280+(Ir&15)+pA*16,hr=49280+(hr&15)+pA*16;const[i,I]=gr();i===0&&I===0&&(pr(0,1023),Cr(0,1023)),gA(Le)!==0&&Si(!0)},El=()=>{const A=gA(Le);if(A&1){let e=!1;A&8&&(_e|=8,e=!0),A&he&4&&(_e|=4,e=!0),A&he&2&&(_e|=2,e=!0),e&&ot(pA,!0)}},Bl=A=>{if(gA(Le)&1)if(A.buttons>=0){switch(A.buttons){case 0:uA&=-129;break;case 16:uA|=128;break;case 1:uA&=-17;break;case 17:uA|=16;break}he|=uA&128?4:0}else{if(A.x>=0&&A.x<=1){const[t,s]=gr();MA=Math.round((s-t)*A.x+t),he|=2}if(A.y>=0&&A.y<=1){const[t,s]=Wo();qA=Math.round((s-t)*A.y+t),he|=2}}};let St=0,No="",Gn=0,_n=0;const Dl=()=>{const A=192+pA;B(Br)===A&&B(Er)===0?kl():B(Sl)===A&&B(Cl)===0&&ml()},ml=()=>{if(St===0){const A=192+pA;Gn=B(Br),_n=B(Er),T(Br,A),T(Er,3);const e=(uA&128)!==(Ge&128);let t=0;uA&128?t=e?2:1:t=e?3:4,B(49152)&128&&(t=-t),Ge=uA,No=MA.toString()+","+qA.toString()+","+t.toString()}St>=No.length?(c.Accum=141,St=0,T(Br,Gn),T(Er,_n)):(c.Accum=No.charCodeAt(St)|128,St++)},kl=()=>{switch(c.Accum){case 128:console.log("mouse off"),Sr(0);break;case 129:console.log("mouse on"),Sr(1);break}},Tl=(A,e)=>{if(A>=49408)return-1;const t=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(A&15){case s.LOWX:if(t)return MA&255;dA=dA&65280|e,dA&=65535;break;case s.HIGHX:if(t)return MA>>8&255;dA=e<<8|dA&255,dA&=65535;break;case s.LOWY:if(t)return qA&255;GA=GA&65280|e,GA&=65535;break;case s.HIGHY:if(t)return qA>>8&255;GA=e<<8|GA&255,GA&=65535;break;case s.STATUS:return uA;case s.MODE:if(t)return gA(Le);Sr(e);break;case s.CLAMP:if(t){const[I,C]=gr(),[u,D]=Wo();switch(fr){case 0:return I>>8&255;case 1:return u>>8&255;case 2:return I&255;case 3:return u&255;case 4:return C>>8&255;case 5:return D>>8&255;case 6:return C&255;case 7:return D&255;default:return console.log("AppleMouse: invalid clamp index: "+fr),0}}fr=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(t)return Wn;switch(Wn=e,e){case i.INIT:MA=0,qA=0,pt=0,Ct=0,pr(0,1023),Cr(0,1023),uA=0,he=0;break;case i.READ:he=0,uA&=-112,uA|=Ge>>1&64,uA|=Ge>>4&1,Ge=uA,(pt!==MA||Ct!==qA)&&(uA|=32,pt=MA,Ct=qA);break;case i.CLEAR:console.log("cmd.clear"),MA=0,qA=0,pt=0,Ct=0;break;case i.SERVE:uA&=-15,uA|=_e,_e=0,ot(pA,!1);break;case i.HOME:{const[I]=gr(),[C]=Wo();MA=I,qA=C}break;case i.CLAMPX:{const I=dA>32767?dA-65536:dA,C=GA;pr(I,C),console.log(I+" -> "+C)}break;case i.CLAMPY:{const I=dA>32767?dA-65536:dA,C=GA;Cr(I,C),console.log(I+" -> "+C)}break;case i.GCLAMP:console.log("cmd.getclamp");break;case i.POS:MA=dA,qA=GA;break}break;default:console.log("AppleMouse unknown IO addr",A.toString(16));break}return e},_A={RX_FULL:1,TX_EMPTY:2,DCD:4,OVRN:32,IRQ:128},Xe={COUNTER_DIV:3,TX_RTS:96,RX_INT_ENABLE:128},wl={RESET:3},Xn={RTS_TX_INT:32},dl=320;class yl{_control;_status;_lastRead;_receiveBuffer;_extFuncs;_outCount;_outDelay;update(e){(this._status&_A.TX_EMPTY)===0&&(this._outDelay+=e,this._outDelay>dl&&(this._outDelay=0,this._status|=_A.TX_EMPTY,(this._control&Xe.TX_RTS)===Xn.RTS_TX_INT&&this.irq(!0)))}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let s=0;s<t;s++)this._receiveBuffer.shift(),this._status|=_A.OVRN;this._status|=_A.RX_FULL,this._control&Xe.RX_INT_ENABLE&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._status&=-3,this._outCount++}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-117,this._receiveBuffer.length?(this._status|=_A.RX_FULL,this._control&Xe.RX_INT_ENABLE&&this.irq(!0)):(this._status&=-2,this.irq(!1)),this._lastRead}set control(e){this._control,this._control=e,(this._control&Xe.COUNTER_DIV)===wl.RESET?this.reset():(this._control&Xe.TX_RTS)==Xn.RTS_TX_INT&&(this._status&=-3),this._status&_A.RX_FULL&&this._control&Xe.RX_INT_ENABLE&&this.irq(!0)}get status(){const e=this._status;return this._status&_A.IRQ&&this.irq(!1),e}irq(e){e?this._status|=_A.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=_A.TX_EMPTY|_A.DCD,this.irq(!1),this._receiveBuffer=[],this._outCount=0,this._outDelay=0}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this._outCount=0,this._outDelay=0,this.reset()}}const IA={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Rl={ANY_IRQ:128},Pl=(A,e)=>{let t="";if(e&IA.OUTPUT_ENABLE?t+="OE   ":t+="/OE  ",e&IA.IRQ_ENABLE?t+="IRQ  ":t+="/IRQ ",e&IA.BIT8_MODE?t+="D8BIT ":t+="16BIT ",e&IA.INTERNAL_CLOCK?t+="ICLK ":t+="ECLK ",e&IA.SPECIAL)switch(A){case 0:t+="RST  ";break;case 1:t+="WR0  ";break;case 2:t+="DIV8 ";break}else switch(A){case 0:t+="RUN  ";break;case 1:t+="WR2  ";break;case 2:t+="DIV1 ";break}switch(t+="-> ",e&IA.COUNTER_MODE){case 0:t+="CONTINUOUS0";break;case 8:t+="FREQUENCY_CMP0";break;case 16:t+="CONTINUOUS1";break;case 24:t+="PULSE_WIDTH_CMP0";break;case 32:t+="SINGLE_SHOT0";break;case 40:t+="FREQUENCY_CMP1";break;case 48:t+="SINGLE_SHOT1";break;case 56:t+="PULSE_WIDTH_CMP1";break}return t};class Go{_latch;_count;_control;_enabled;decrement(e){return this._enabled?(this._count-=e,this._count<0?(this._count=65535,this._enabled=!1,!0):!1):!1}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&IA.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch,this._enabled=!0}reset(){this._latch=65535,this._control=0,this._enabled=!0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0,this._enabled=!0}}class Ql{_timer;_status;_irqMask;_debugStatus;_debugStatusCount;_statusRead;_msb;_lsb;_div8;_interrupt;status(){return this._statusRead=this._status&7,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&IA.SPECIAL?0:2);let s=this._timer[e].control;if(this._timer[e].control=t,s!=t&&(t&IA.IRQ_ENABLE?this._irqMask|=1<<e:this._irqMask&=~(1<<e),e==0))switch((s&IA.SPECIAL)<<1|t&IA.SPECIAL){case 0:case 3:break;case 1:case 2:this._timer[0].reload(),this._timer[1].reload(),this._timer[2].reload(),this.irq(0,!1),this.irq(1,!1),this.irq(2,!1);break}}timerLSBw(e,t){const s=this._timer[0].control&IA.SPECIAL;let i=!1;switch(this._timer[e].control&IA.COUNTER_MODE){case 16:case 48:i=!0;break}const I=this._msb*256+t;this._timer[e].latch=I,(s||i)&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){const s=this._timer[0].control&IA.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&1<<e&&(this._statusRead&=~(1<<e),this.irq(e,!1)),s>>8&255}update(e){const t=this._timer[0].control&IA.SPECIAL;if(this._debugStatus&&(this._debugStatusCount++,this._debugStatusCount>1020300&&(this._debugStatusCount=0,this.printStatus())),!t){this._div8+=e;let s=!1;for(let i=0;i<3;i++){let I=e;if(i==2&&this._timer[2].control&IA.SPECIAL)if(this._div8>8)I=Math.floor(this._div8/8),this._div8%=8;else continue;if(s=this._timer[i].decrement(I),s)switch(this.irq(i,!0),this._timer[i].control&IA.COUNTER_MODE){case 0:case 16:this._timer[i].reload();break}}}}irq(e,t){const s=1<<e;t?this._status|=s:this._status&=~s,this._status&this._irqMask?(this._status|=Rl.ANY_IRQ,this._statusRead&=~s,this._interrupt(!0)):(this._status&=-129,this._interrupt(!1))}printStatus(){console.log("Status : "+this._status.toString(16)),console.log("IRQMask: "+this._irqMask.toString(16));for(let e=0;e<3;e++)console.log("["+e+"]: "+Pl(e,this._timer[e].control)+" : "+this._timer[e].latch+" : "+this._timer[e].count)}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this._irqMask=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=IA.SPECIAL}constructor(e){this._interrupt=e,this._status=0,this._irqMask=0,this._statusRead=0,this._timer=[new Go,new Go,new Go],this._msb=this._lsb=0,this._div8=0,this._debugStatus=!1,this._debugStatusCount=0,this.reset()}}let Dr=2,iA,$A,_o=0;const bl=A=>{if(_o){const e=c.cycleCount-_o;iA.update(e),$A.update(e)}_o=c.cycleCount},Zn=A=>{ot(Dr,A)},Ll=A=>{$A&&$A.buffer(A)},Fl=(A=!0,e=2)=>{if(!A)return;Dr=e,iA=new Ql(Zn);const t={sendData:X1,interrupt:Zn};$A=new yl(t),st(Dr,ql),xs(bl,Dr)},Ml=()=>{iA&&(iA.reset(),$A.reset())},ql=(A,e=-1)=>{if(A>=49408)return-1;const t={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(A&15){case t.SDMIDIDATA:case t.ACIADATA:e>=0?$A.data=e:s=$A.data;break;case t.SDMIDICTRL:case t.ACIASTATCTRL:e>=0?$A.control=e:s=$A.status;break;case t.TCONTROL1:e>=0?iA.timerControl(0,e):s=0;break;case t.TCONTROL2:e>=0?iA.timerControl(1,e):s=iA.status();break;case t.T1MSB:e>=0?iA.timerMSBw(0,e):s=iA.timerMSBr(0);break;case t.T1LSB:e>=0?iA.timerLSBw(0,e):s=iA.timerLSBr(0);break;case t.T2MSB:e>=0?iA.timerMSBw(1,e):s=iA.timerMSBr(1);break;case t.T2LSB:e>=0?iA.timerLSBw(1,e):s=iA.timerLSBr(1);break;case t.T3MSB:e>=0?iA.timerMSBw(2,e):s=iA.timerMSBr(2);break;case t.T3LSB:e>=0?iA.timerLSBw(2,e):s=iA.timerLSBr(2);break;case t.DRUMSET:case t.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(A&15).toString(16));break}return s},Kl=(A=!0,e=4)=>{A&&(st(e,$l),xs(Jl,e))},Xo=[0,128],Zo=[1,129],Ul=[2,130],Yl=[3,131],Ze=[4,132],xe=[5,133],mr=[6,134],xo=[7,135],ft=[8,136],Et=[9,137],Ol=[10,138],Vo=[11,139],Wl=[12,140],Fe=[13,141],Bt=[14,142],xn=[16,145],Vn=[17,145],XA=[18,146],Jo=[32,160],Ae=64,ge=32,Nl=(A=4)=>{for(let e=0;e<=255;e++)N(A,e,0);for(let e=0;e<=1;e++)jo(A,e)},Gl=(A,e)=>(V(A,Bt[e])&Ae)!==0,_l=(A,e)=>(V(A,XA[e])&Ae)!==0,Jn=(A,e)=>(V(A,Vo[e])&Ae)!==0,Xl=(A,e,t)=>{let s=V(A,Ze[e])-t;if(N(A,Ze[e],s),s<0){s=s%256+256,N(A,Ze[e],s);let i=V(A,xe[e]);if(i--,N(A,xe[e],i),i<0&&(i+=256,N(A,xe[e],i),Gl(A,e)&&(!_l(A,e)||Jn(A,e)))){const I=V(A,XA[e]);N(A,XA[e],I|Ae);const C=V(A,Fe[e]);if(N(A,Fe[e],C|Ae),pe(A,e,-1),Jn(A,e)){const u=V(A,xo[e]),D=V(A,mr[e]);N(A,Ze[e],D),N(A,xe[e],u)}}}},Zl=(A,e)=>(V(A,Bt[e])&ge)!==0,xl=(A,e)=>(V(A,XA[e])&ge)!==0,Vl=(A,e,t)=>{if((V(A,Vo[e])&ge)!==0)return;let s=V(A,ft[e])-t;if(N(A,ft[e],s),s<0){s=s%256+256,N(A,ft[e],s);let i=V(A,Et[e]);if(i--,N(A,Et[e],i),i<0&&(i+=256,N(A,Et[e],i),Zl(A,e)&&!xl(A,e))){const I=V(A,XA[e]);N(A,XA[e],I|ge);const C=V(A,Fe[e]);N(A,Fe[e],C|ge),pe(A,e,-1)}}},jn=new Array(8).fill(0),Jl=A=>{const e=c.cycleCount-jn[A];for(let t=0;t<=1;t++)Xl(A,t,e),Vl(A,t,e);jn[A]=c.cycleCount},jl=(A,e)=>{const t=[];for(let s=0;s<=15;s++)t[s]=V(A,Jo[e]+s);return t},Hl=(A,e)=>A.length===e.length&&A.every((t,s)=>t===e[s]),Ve={slot:-1,chip:-1,params:[-1]};let jo=(A,e)=>{const t=jl(A,e);A===Ve.slot&&e===Ve.chip&&Hl(t,Ve.params)||(Ve.slot=A,Ve.chip=e,Ve.params=t,G1({slot:A,chip:e,params:t}))};const vl=(A,e)=>{switch(V(A,Xo[e])&7){case 0:for(let s=0;s<=15;s++)N(A,Jo[e]+s,0);jo(A,e);break;case 7:N(A,Vn[e],V(A,Zo[e]));break;case 6:{const s=V(A,Vn[e]),i=V(A,Zo[e]);s>=0&&s<=15&&(N(A,Jo[e]+s,i),jo(A,e));break}}},pe=(A,e,t)=>{let s=V(A,Fe[e]);switch(t>=0&&(s&=127-(t&127),N(A,Fe[e],s)),e){case 0:ot(A,s!==0);break;case 1:Za(s!==0);break}},zl=(A,e,t)=>{let s=V(A,Bt[e]);t>=0&&(t=t&255,t&128?s|=t:s&=255-t),s|=128,N(A,Bt[e],s)},$l=(A,e=-1)=>{if(A<49408)return-1;const t=(A&3840)>>8,s=A&255,i=s&128?1:0;switch(s){case Xo[i]:e>=0&&(N(t,Xo[i],e),vl(t,i));break;case Zo[i]:case Ul[i]:case Yl[i]:case Ol[i]:case Vo[i]:case Wl[i]:N(t,s,e);break;case Ze[i]:e>=0&&N(t,mr[i],e),pe(t,i,Ae);break;case xe[i]:if(e>=0){N(t,xo[i],e),N(t,Ze[i],V(t,mr[i])),N(t,xe[i],e);const I=V(t,XA[i]);N(t,XA[i],I&~Ae),pe(t,i,Ae)}break;case mr[i]:e>=0&&(N(t,s,e),pe(t,i,Ae));break;case xo[i]:e>=0&&N(t,s,e);break;case ft[i]:e>=0&&N(t,xn[i],e),pe(t,i,ge);break;case Et[i]:if(e>=0){N(t,Et[i],e),N(t,ft[i],V(t,xn[i]));const I=V(t,XA[i]);N(t,XA[i],I&~ge),pe(t,i,ge)}break;case Fe[i]:e>=0&&pe(t,i,e);break;case Bt[i]:zl(t,i,e);break}return-1};let Je=0;const kr=192,A1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${K(kr)}   ; jump address
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
`,e1=`
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
`,t1=()=>{const A=new Uint8Array(256).fill(0),e=ir(0,A1.split(`
`));A.set(e,0);const t=ir(0,e1.split(`
`));return A.set(t,kr),A[254]=23,A[255]=kr,A};let Dt=new Uint8Array;const Ho=(A=!0)=>{Dt.length===0&&(Dt=t1()),Dt[1]=A?32:0;const t=49152+kr+7*256;We(7,Dt,t,i1),We(7,Dt,t+3,n1)},r1=(A,e)=>{if(A===0)T(e,2);else if(A<=2){T(e,240);const[,,t]=or(A),s=t/512;T(e+1,s&255),T(e+2,s>>>8),T(e+3,0),it(4),at(0)}else nt(40),it(0),at(0),O()},o1=(A,e)=>{const[,,t]=or(A),s=t/512,i=s>1600?2:1,I=i==2?32:64;T(e,240),T(e+1,s&255),T(e+2,s>>>8),T(e+3,0);const C="Apple2TS SP";T(e+4,C.length);let u=0;for(;u<C.length;u++)T(e+5+u,C.charCodeAt(u));for(;u<16;u++)T(e+5+u,C.charCodeAt(8));T(e+21,i),T(e+22,I),T(e+23,1),T(e+24,0),it(25),at(0)},s1=(A,e,t)=>{if(B(A)!==3){console.error(`Incorrect SmartPort parameter count at address ${A}`),nt(4),O();return}const s=B(A+4);switch(s){case 0:r1(e,t);break;case 1:case 2:nt(33),O();break;case 3:case 4:o1(e,t);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},n1=()=>{nt(0),O(!1);const A=256+c.StackPtr,e=B(A+1)+256*B(A+2),t=B(e+1),s=B(e+2)+256*B(e+3),i=B(s+1),I=B(s+2)+256*B(s+3);switch(t){case 0:{s1(s,i,I);return}case 1:{if(B(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),O();return}const D=512*(B(s+4)+256*B(s+5)+65536*B(s+6)),[m,k]=or(i),P=m.slice(D+k,D+512+k);yo(I,P);break}default:console.error(`SmartPort command ${t} not implemented`),O();return}const C=Uo(i);C.motorRunning=!0,Je||(Je=setTimeout(()=>{Je=0,C&&(C.motorRunning=!1),wA()},500)),wA()},i1=()=>{nt(0),O(!1);const A=B(66),e=Math.max(Math.min(B(67)>>6,2),0),t=Uo(e);if(!t.hardDrive)return;const[s,i,I]=or(e),C=B(70)+256*B(71),u=512*C,D=B(68)+256*B(69);switch(t.status=` ${K(C,4)}`,A){case 0:{if(t.filename.length===0||I===0){it(0),at(0),O();return}const m=I/512;it(m&255),at(m>>>8);break}case 1:{if(u+512>I){O();return}const m=s.slice(u+i,u+512+i);yo(D,m);break}case 2:{if(u+512>I){O();return}if(t.isWriteProtected){O();return}const m=wo(D);s.set(m,u+i),t.diskHasChanges=!0,t.lastAppleWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),O();return;default:console.error("unknown hard drive command"),O();return}O(!1),t.motorRunning=!0,Je||(Je=setTimeout(()=>{Je=0,t&&(t.motorRunning=!1),wA()},500)),wA()},Hn=`
        ORG   $300
OVER    LDA   #$00
LOOPA   LDX   #$00
LOOPX   LDY   #$00
LOOPY   INY
        BNE   LOOPY
        INX
        BNE   LOOPX  ; do inner Y loop again, 256 times
        INC
        BNE   LOOPA  ; do inner X loop again, 256 times
        JMP   OVER   ; do outer loop forever
        RTS
`,Ce={numLines:co.numLines,collapseLoops:co.collapseLoops,ignoreRegisters:co.ignoreRegisters},a1=A=>{Ce.numLines=A.numLines,Ce.collapseLoops=A.collapseLoops,Ce.ignoreRegisters=A.ignoreRegisters};let F=[];const c1=()=>{if(F.length<50)return;const A=10,e=Ce.ignoreRegisters?24:99,t=F[F.length-1].slice(A,e);let s=F.length-2;const i=Math.max(F.length-20,0);let I=-1;for(;s>=i;){if(F[s].slice(A,e)===t){I=s;break}s--}const C=F.length-I-1;if(I===-1||F.length-2*C<0)return;for(let m=I-1;m>=I-C+1;m--)if(F[m].slice(A,e)!==F[m+C].slice(A,e))return;const u=F[I-C].indexOf("repeated"),D=`******** ${C===1?"1 line repeated":`${C} lines repeated`}`;if(Ce.ignoreRegisters)for(let m=I-C+1;m<I;m++){const k=F[m],P=F[m+C];F[m+C]=P.slice(0,e)+P.slice(e).split("").map((M,d)=>M!==k[e+d]?"*":M).join("")}if(I>=C&&u>0){F.splice(I-C+1,C);const m=parseInt(F[I-C].slice(u+9))+1;F[I-C]=`${D} ${m} times`}else F[I]=`${D} 1 time`,F.splice(I-C+1,C-1);for(let m=I-C+1;m<F.length;m++)F[m].startsWith("    ")?F[m]="      .."+F[m].slice(8):F[m].startsWith("  ")?F[m]="    ...."+F[m].slice(8):F[m].startsWith("..")?F[m]="  ......"+F[m].slice(8):F[m]="........"+F[m].slice(8)},vo=A=>{F.length>Ce.numLines&&(F=F.slice(F.length-Ce.numLines)),F.push(A),Ce.collapseLoops&&c1()},zo=()=>{F=[]},l1=()=>F;let vn=0,Tr=0,mt=0,wr=0,zn=!1,$o="default",As=!1,$n=16.6881,es=17030,Ai=0,rA=_.IDLE,Se="APPLE2EE",kt=0,dr=!1,yA=0;const x=[];let Tt=0,Me=Fi;const u1=A=>{Me=A},I1=()=>{S.VBL.isSet=!0,El()},h1=()=>{S.VBL.isSet=!1},ei=()=>{const A={};for(const e in S)A[e]=S[e].isSet;return A},g1=()=>{const A=JSON.parse(JSON.stringify(c));let e=xA;for(let s=xA;s<b.length;s++)b[s]!==255&&(s+=255-s%256,e=s+1);const t=Ke.Buffer.from(b.slice(0,e));return{s6502:A,extraRamSize:64*(OA+1),machineName:Se,softSwitches:ei(),stackDump:Sc(),memory:t.toString("base64")}},p1=(A,e)=>{const t=JSON.parse(JSON.stringify(A.s6502));nn(t);const s=A.softSwitches;for(const I in s){const C=I;try{S[C].isSet=s[I]}catch{}}"WRITEBSR1"in s&&(S.BSR_PREWRITE.isSet=!1,S.BSR_WRITE.isSet=s.WRITEBSR1||s.WRITEBSR2||s.RDWRBSR1||s.RDWRBSR2);const i=new Uint8Array(Ke.Buffer.from(A.memory,"base64"));if(e<1){b.set(i.slice(0,65536)),b.set(i.slice(131072,163584),65536),b.set(i.slice(65536,131072),xA);const I=(i.length-163584)/1024;I>0&&(So(I+64),b.set(i.slice(163584),xA+65536))}else So(A.extraRamSize),b.set(i);A.stackDump&&fc(A.stackDump),Se=A.machineName||"APPLE2EE",rs(Se,!1),VA(),so(!0)},ts=A=>({emulator:null,state6502:g1(),driveState:vc(A),thumbnail:"",snapshots:null}),C1=()=>{const A=ts(!0);return A.snapshots=x,A},S1=A=>{nn(A),UA()},f1=A=>{ct(A),UA()},E1=A=>{As=A,UA()},yr=(A,e=!1)=>{Pr();const t=A.emulator?.version?A.emulator.version:.9;p1(A.state6502,t),zc(A.driveState),e&&(x.length=0,yA=0),A.snapshots&&(x.length=0,x.push(...A.snapshots),yA=x.length),UA()};let ti=!1;const ri=()=>{ti||(ti=!0,il(),Fl(!0,2),Kl(!0,4),fl(!0,5),Jc(),Ho(),dc())},B1=()=>{$c(),eo(),pl(),Ml(),nl(),Nl(4)},Rr=()=>{if(ct(0),cc(),An(Se),ri(),Hn.length>0){const e=ir(768,Hn.split(`
`));b.set(e,768)}Pr(),so(!0),Uo(1).filename===""&&(Ho(!1),setTimeout(()=>{Ho()},200))},Pr=()=>{if(xa(),Qa(),B(49282),an(),B1(),qr()){Kr(!1);const A=c.cycleCount,e=setInterval(()=>{c.cycleCount-A>1e3&&(Kr(!0),clearInterval(e))},50)}},D1=A=>{mt=A,$n=mt===4?1:16.6881,es=17030*[.1,.5,1,2,3,4,4][mt+2],ci()},m1=A=>{$o=A},k1=()=>$o==="game"||$o==="embed",T1=A=>{zn=A,UA()},w1=(A,e)=>{A>>8===192?T(A,e):b[A]=e,UA()},rs=(A,e=!0)=>{Se!==A&&(Se=A,An(Se),e&&Pr(),UA())},d1=A=>{So(A),UA()},oi=()=>{const A=yA-1;return A<0||!x[A]?-1:A},si=()=>{const A=yA+1;return A>=x.length||!x[A]?-1:A},ni=()=>{x.length===Mi&&x.shift(),x.push(ts(!1)),yA=x.length,Z1(x[x.length-1].state6502.s6502.PC)},y1=()=>{let A=oi();A<0||(KA(_.PAUSED),setTimeout(()=>{yA===x.length&&(ni(),A=Math.max(yA-2,0)),yA=A,yr(x[yA])},50))},R1=()=>{const A=si();A<0||(KA(_.PAUSED),setTimeout(()=>{yA=A,yr(x[A])},50))},P1=A=>{A<0||A>=x.length||(KA(_.PAUSED),setTimeout(()=>{yA=A,yr(x[A])},50))},Q1=()=>{const A=[];for(let e=0;e<x.length;e++)A[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return A},b1=A=>{x.length>0&&(x[x.length-1].thumbnail=A)};let Qr=null;const os=(A=!1)=>{Qr&&clearTimeout(Qr),A?Qr=setTimeout(()=>{dr=!0,Qr=null},100):dr=!0},ii=()=>{qt(),rA===_.IDLE&&(Rr(),rA=_.PAUSED),Me||zo(),Io(Me?vo:null),KA(_.PAUSED)},L1=()=>{qt(),rA===_.IDLE&&(Rr(),rA=_.PAUSED),B(c.PC,!1)===32?(Me||zo(),Io(Me?vo:null),ai()):ii()},ai=()=>{qt(),rA===_.IDLE&&(Rr(),rA=_.PAUSED),Na(),KA(_.RUNNING)},ci=()=>{kt=0,Tr=performance.now(),vn=Tr},KA=(A,e=!0)=>{if(ri(),e&&rA===_.RUNNING&&A===_.PAUSED&&(As=!0),rA=A,rA===_.PAUSED)Ma(),Tt&&(clearInterval(Tt),Tt=0),Fn();else if(rA===_.RUNNING){for(Fn(!0),qt();x.length>0&&yA<x.length-1;)x.pop();yA=x.length,Tt||(Tt=setInterval(so,1e3))}Me||zo(),UA(),ci(),wr===0&&(wr=1,hi())},li=A=>{rA===_.IDLE?(KA(_.NEED_BOOT),setTimeout(()=>{KA(_.NEED_RESET),setTimeout(()=>{A()},200)},200)):A()},F1=(A,e,t)=>{li(()=>{yo(A,e),t&&WA(A)})},M1=A=>{li(()=>{da(A)})},q1=()=>rA===_.PAUSED?pc():new Uint8Array,K1=()=>{const A=sn(),e=A[105]|A[106]<<8,t=A[107]|A[108]<<8;let s=b.slice(e,t+1);const i=s.length-1;s[i]=0;for(let I=0;I<i;I+=7){const C=s.slice(I,I+7),u=C[0];if(u===0)break;const D=C[1];if((u&128)===0&&D&128){const k=C[3]|C[4]<<8,P=C[2],M=b.slice(k,k+P);s[I+3]=s.length&255,s[I+4]=s.length>>8&255,s=new Uint8Array([...s,...M])}}return s},U1=()=>rA!==_.IDLE?Ec():"";let ui=!1;const UA=()=>{B(S.PB0.isSetAddr),B(S.PB1.isSetAddr);const A={addressGetTable:sA,altChar:S.ALTCHARSET.isSet,basicMemory:K1(),breakpoints:lA,button0:S.PB0.isSet,button1:S.PB1.isSet,canGoBackward:oi()>=0,canGoForward:si()>=0,c800Slot:po(),cout:B(57)<<8|B(56),cpuSpeed:wr,extraRamSize:64*(OA+1),hires:gc(),iTempState:yA,isDebugging:zn,isTracing:!1,lores:Do(!0),machineName:Se,memoryDump:q1(),noDelayMode:!S.COLUMN80.isSet&&S.DHIRES.isSet,ramWorksBank:de(),runMode:rA,s6502:c,showDebugTab:As,softSwitches:ei(),speedMode:mt,stackString:U1(),textPage:Do(),timeTravelThumbnails:Q1(),tracelog:rA===_.PAUSED?l1():[],zeroPage:sn()};O1(A),ui||(ui=!0,x1(Fa()))},Y1=A=>{if(A)for(let e=0;e<A.length;e++)ba(A[e]);else La();A&&(A[0]<=49167||A[0]>=49232)&&VA(),UA()},Ii=()=>{const A=performance.now();if(Ai=A-Tr,Ai<$n||(Tr=A,rA===_.IDLE||rA===_.PAUSED))return;rA===_.NEED_BOOT?(Rr(),KA(_.RUNNING)):rA===_.NEED_RESET&&(Pr(),KA(_.RUNNING));let e=0,t=-1;for(;;){const i=Io(Me?vo:null);if(i<0)break;if(e+=i,e<4550)S.VBL.isSet||I1();else{h1();const I=Math.floor((e-4550)/65);I!==t&&I<192&&(t=I,hc(I))}if(e>=es)break}kt++;const s=kt*es/(performance.now()-vn);wr=s<1e4?Math.round(s/10)/100:Math.round(s/100)/10,ji(),UA(),dr&&(dr=!1,ni())},hi=()=>{Ii();const A=kt+[1,1,1,5,5,5,10][mt+2];for(;rA===_.RUNNING&&kt!==A;)Ii();setTimeout(hi,rA===_.RUNNING?0:20)},mA=(A,e)=>{try{self.postMessage({msg:A,payload:e})}catch(t){console.error(`worker2main: doPostMessage error: ${t}`)}},O1=A=>{mA(SA.MACHINE_STATE,A)},W1=A=>{mA(SA.CLICK,A)},N1=A=>{mA(SA.DRIVE_PROPS,A)},je=A=>{mA(SA.DRIVE_SOUND,A)},gi=A=>{mA(SA.SAVE_STATE,A)},br=A=>{mA(SA.RUMBLE,A)},pi=A=>{mA(SA.HELP_TEXT,A)},Ci=A=>{mA(SA.ENHANCED_MIDI,A)},Si=A=>{mA(SA.SHOW_APPLE_MOUSE,A)},G1=A=>{mA(SA.MBOARD_SOUND,A)},_1=A=>{mA(SA.COMM_DATA,A)},X1=A=>{mA(SA.MIDI_DATA,A)},Z1=A=>{mA(SA.REQUEST_THUMBNAIL,A)},x1=A=>{mA(SA.SOFTSWITCH_DESCRIPTIONS,A)},V1=A=>{mA(SA.INSTRUCTIONS,A)};typeof self<"u"&&(self.onmessage=A=>{if(!(!A.data||typeof A.data!="object")&&"msg"in A.data)switch(A.data.msg){case L.RUN_MODE:KA(A.data.payload);break;case L.STATE6502:S1(A.data.payload);break;case L.DEBUG:T1(A.data.payload);break;case L.APP_MODE:m1(A.data.payload);break;case L.SHOW_DEBUG_TAB:E1(A.data.payload);break;case L.BREAKPOINTS:_a(A.data.payload);break;case L.STEP_INTO:ii();break;case L.STEP_OVER:L1();break;case L.STEP_OUT:ai();break;case L.BASIC_STEP:Ga();break;case L.SPEED:D1(A.data.payload);break;case L.TIME_TRAVEL_STEP:A.data.payload==="FORWARD"?R1():y1();break;case L.TIME_TRAVEL_INDEX:P1(A.data.payload);break;case L.TIME_TRAVEL_SNAPSHOT:os();break;case L.THUMBNAIL_IMAGE:b1(A.data.payload);break;case L.RESTORE_STATE:yr(A.data.payload,!0);break;case L.KEYPRESS:wa(A.data.payload);break;case L.KEYRELEASE:Ta();break;case L.MOUSEEVENT:Bl(A.data.payload);break;case L.PASTE_TEXT:M1(A.data.payload);break;case L.APPLE_PRESS:Bs(!0,A.data.payload);break;case L.APPLE_RELEASE:Bs(!1,A.data.payload);break;case L.GET_SAVE_STATE:gi(ts(!0));break;case L.GET_SAVE_STATE_SNAPSHOTS:gi(C1());break;case L.DRIVE_PROPS:{const e=A.data.payload;el(e);break}case L.DRIVE_NEW_DATA:{const e=A.data.payload;Al(e);break}case L.GAMEPAD:xi(A.data.payload);break;case L.SET_BINARY_BLOCK:{const e=A.data.payload;F1(e.address,e.data,e.run);break}case L.SET_CYCLECOUNT:f1(A.data.payload);break;case L.SET_MEMORY:{const e=A.data.payload;w1(e.address,e.value);break}case L.COMM_DATA:sl(A.data.payload);break;case L.MIDI_DATA:Ll(A.data.payload);break;case L.RAMWORKS:d1(A.data.payload);break;case L.MACHINE_NAME:rs(A.data.payload);break;case L.REVERSE_YAXIS:Xi(A.data.payload);break;case L.SOFTSWITCHES:Y1(A.data.payload);break;case L.SIRIUS_JOYPORT:Kr(A.data.payload);break;case L.TRACING:u1(A.data.payload);break;case L.TRACE_SETTINGS:a1(A.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(A.data)}`);break}})})();
