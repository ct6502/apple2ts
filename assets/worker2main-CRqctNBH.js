(function(){"use strict";var Tn={},Ve={},Fo;function eA(){if(Fo)return Ve;Fo=1,Ve.byteLength=u,Ve.toByteArray=b,Ve.fromByteArray=X;for(var t=[],e=[],r=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,h=s.length;a<h;++a)t[a]=s[a],e[s.charCodeAt(a)]=a;e[45]=62,e[95]=63;function f(k){var q=k.length;if(q%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var V=k.indexOf("=");V===-1&&(V=q);var ht=V===q?0:4-V%4;return[V,ht]}function u(k){var q=f(k),V=q[0],ht=q[1];return(V+ht)*3/4-ht}function m(k,q,V){return(q+V)*3/4-V}function b(k){var q,V=f(k),ht=V[0],pt=V[1],it=new r(m(k,ht,pt)),Bt=0,Pe=pt>0?ht-4:ht,nt;for(nt=0;nt<Pe;nt+=4)q=e[k.charCodeAt(nt)]<<18|e[k.charCodeAt(nt+1)]<<12|e[k.charCodeAt(nt+2)]<<6|e[k.charCodeAt(nt+3)],it[Bt++]=q>>16&255,it[Bt++]=q>>8&255,it[Bt++]=q&255;return pt===2&&(q=e[k.charCodeAt(nt)]<<2|e[k.charCodeAt(nt+1)]>>4,it[Bt++]=q&255),pt===1&&(q=e[k.charCodeAt(nt)]<<10|e[k.charCodeAt(nt+1)]<<4|e[k.charCodeAt(nt+2)]>>2,it[Bt++]=q>>8&255,it[Bt++]=q&255),it}function w(k){return t[k>>18&63]+t[k>>12&63]+t[k>>6&63]+t[k&63]}function W(k,q,V){for(var ht,pt=[],it=q;it<V;it+=3)ht=(k[it]<<16&16711680)+(k[it+1]<<8&65280)+(k[it+2]&255),pt.push(w(ht));return pt.join("")}function X(k){for(var q,V=k.length,ht=V%3,pt=[],it=16383,Bt=0,Pe=V-ht;Bt<Pe;Bt+=it)pt.push(W(k,Bt,Bt+it>Pe?Pe:Bt+it));return ht===1?(q=k[V-1],pt.push(t[q>>2]+t[q<<4&63]+"==")):ht===2&&(q=(k[V-2]<<8)+k[V-1],pt.push(t[q>>10]+t[q>>4&63]+t[q<<2&63]+"=")),pt.join("")}return Ve}var Br={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */var Uo;function rA(){return Uo||(Uo=1,Br.read=function(t,e,r,s,a){var h,f,u=a*8-s-1,m=(1<<u)-1,b=m>>1,w=-7,W=r?a-1:0,X=r?-1:1,k=t[e+W];for(W+=X,h=k&(1<<-w)-1,k>>=-w,w+=u;w>0;h=h*256+t[e+W],W+=X,w-=8);for(f=h&(1<<-w)-1,h>>=-w,w+=s;w>0;f=f*256+t[e+W],W+=X,w-=8);if(h===0)h=1-b;else{if(h===m)return f?NaN:(k?-1:1)*(1/0);f=f+Math.pow(2,s),h=h-b}return(k?-1:1)*f*Math.pow(2,h-s)},Br.write=function(t,e,r,s,a,h){var f,u,m,b=h*8-a-1,w=(1<<b)-1,W=w>>1,X=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,k=s?0:h-1,q=s?1:-1,V=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,f=w):(f=Math.floor(Math.log(e)/Math.LN2),e*(m=Math.pow(2,-f))<1&&(f--,m*=2),f+W>=1?e+=X/m:e+=X*Math.pow(2,1-W),e*m>=2&&(f++,m/=2),f+W>=w?(u=0,f=w):f+W>=1?(u=(e*m-1)*Math.pow(2,a),f=f+W):(u=e*Math.pow(2,W-1)*Math.pow(2,a),f=0));a>=8;t[r+k]=u&255,k+=q,u/=256,a-=8);for(f=f<<a|u,b+=a;b>0;t[r+k]=f&255,k+=q,f/=256,b-=8);t[r+k-q]|=V*128}),Br}/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var Ko;function nA(){return Ko||(Ko=1,(function(t){const e=eA(),r=rA(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=it,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const A=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(A,n),A.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function f(A){if(A>a)throw new RangeError('The value "'+A+'" is invalid for option "size"');const n=new Uint8Array(A);return Object.setPrototypeOf(n,u.prototype),n}function u(A,n,o){if(typeof A=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return W(A)}return m(A,n,o)}u.poolSize=8192;function m(A,n,o){if(typeof A=="string")return X(A,n);if(ArrayBuffer.isView(A))return q(A);if(A==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof A);if(xt(A,ArrayBuffer)||A&&xt(A.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(xt(A,SharedArrayBuffer)||A&&xt(A.buffer,SharedArrayBuffer)))return V(A,n,o);if(typeof A=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=A.valueOf&&A.valueOf();if(l!=null&&l!==A)return u.from(l,n,o);const g=ht(A);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof A[Symbol.toPrimitive]=="function")return u.from(A[Symbol.toPrimitive]("string"),n,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof A)}u.from=function(A,n,o){return m(A,n,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function b(A){if(typeof A!="number")throw new TypeError('"size" argument must be of type number');if(A<0)throw new RangeError('The value "'+A+'" is invalid for option "size"')}function w(A,n,o){return b(A),A<=0?f(A):n!==void 0?typeof o=="string"?f(A).fill(n,o):f(A).fill(n):f(A)}u.alloc=function(A,n,o){return w(A,n,o)};function W(A){return b(A),f(A<0?0:pt(A)|0)}u.allocUnsafe=function(A){return W(A)},u.allocUnsafeSlow=function(A){return W(A)};function X(A,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const o=Bt(A,n)|0;let l=f(o);const g=l.write(A,n);return g!==o&&(l=l.slice(0,g)),l}function k(A){const n=A.length<0?0:pt(A.length)|0,o=f(n);for(let l=0;l<n;l+=1)o[l]=A[l]&255;return o}function q(A){if(xt(A,Uint8Array)){const n=new Uint8Array(A);return V(n.buffer,n.byteOffset,n.byteLength)}return k(A)}function V(A,n,o){if(n<0||A.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(A.byteLength<n+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&o===void 0?l=new Uint8Array(A):o===void 0?l=new Uint8Array(A,n):l=new Uint8Array(A,n,o),Object.setPrototypeOf(l,u.prototype),l}function ht(A){if(u.isBuffer(A)){const n=pt(A.length)|0,o=f(n);return o.length===0||A.copy(o,0,0,n),o}if(A.length!==void 0)return typeof A.length!="number"||Qo(A.length)?f(0):k(A);if(A.type==="Buffer"&&Array.isArray(A.data))return k(A.data)}function pt(A){if(A>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return A|0}function it(A){return+A!=A&&(A=0),u.alloc(+A)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,o){if(xt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),xt(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(n)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===o)return 0;let l=n.length,g=o.length;for(let S=0,E=Math.min(l,g);S<E;++S)if(n[S]!==o[S]){l=n[S],g=o[S];break}return l<g?-1:g<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,o){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<n.length;++l)o+=n[l].length;const g=u.allocUnsafe(o);let S=0;for(l=0;l<n.length;++l){let E=n[l];if(xt(E,Uint8Array))S+E.length>g.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(g,S)):Uint8Array.prototype.set.call(g,E,S);else if(u.isBuffer(E))E.copy(g,S);else throw new TypeError('"list" argument must be an Array of Buffers');S+=E.length}return g};function Bt(A,n){if(u.isBuffer(A))return A.length;if(ArrayBuffer.isView(A)||xt(A,ArrayBuffer))return A.byteLength;if(typeof A!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof A);const o=A.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let g=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Lo(A).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return tA(A).length;default:if(g)return l?-1:Lo(A).length;n=(""+n).toLowerCase(),g=!0}}u.byteLength=Bt;function Pe(A,n,o){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,n>>>=0,o<=n))return"";for(A||(A="utf8");;)switch(A){case"hex":return c0(this,n,o);case"utf8":case"utf-8":return Gi(this,n,o);case"ascii":return A0(this,n,o);case"latin1":case"binary":return a0(this,n,o);case"base64":return s0(this,n,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return l0(this,n,o);default:if(l)throw new TypeError("Unknown encoding: "+A);A=(A+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function nt(A,n,o){const l=A[n];A[n]=A[o],A[o]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<n;o+=2)nt(this,o,o+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<n;o+=4)nt(this,o,o+3),nt(this,o+1,o+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<n;o+=8)nt(this,o,o+7),nt(this,o+1,o+6),nt(this,o+2,o+5),nt(this,o+3,o+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?Gi(this,0,n):Pe.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const o=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(n+=" ... "),"<Buffer "+n+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(n,o,l,g,S){if(xt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(o===void 0&&(o=0),l===void 0&&(l=n?n.length:0),g===void 0&&(g=0),S===void 0&&(S=this.length),o<0||l>n.length||g<0||S>this.length)throw new RangeError("out of range index");if(g>=S&&o>=l)return 0;if(g>=S)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,g>>>=0,S>>>=0,this===n)return 0;let E=S-g,M=l-o;const z=Math.min(E,M),v=this.slice(g,S),tt=n.slice(o,l);for(let j=0;j<z;++j)if(v[j]!==tt[j]){E=v[j],M=tt[j];break}return E<M?-1:M<E?1:0};function Wi(A,n,o,l,g){if(A.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Qo(o)&&(o=g?0:A.length-1),o<0&&(o=A.length+o),o>=A.length){if(g)return-1;o=A.length-1}else if(o<0)if(g)o=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:Xi(A,n,o,l,g);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(A,n,o):Uint8Array.prototype.lastIndexOf.call(A,n,o):Xi(A,[n],o,l,g);throw new TypeError("val must be string, number or Buffer")}function Xi(A,n,o,l,g){let S=1,E=A.length,M=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(A.length<2||n.length<2)return-1;S=2,E/=2,M/=2,o/=2}function z(tt,j){return S===1?tt[j]:tt.readUInt16BE(j*S)}let v;if(g){let tt=-1;for(v=o;v<E;v++)if(z(A,v)===z(n,tt===-1?0:v-tt)){if(tt===-1&&(tt=v),v-tt+1===M)return tt*S}else tt!==-1&&(v-=v-tt),tt=-1}else for(o+M>E&&(o=E-M),v=o;v>=0;v--){let tt=!0;for(let j=0;j<M;j++)if(z(A,v+j)!==z(n,j)){tt=!1;break}if(tt)return v}return-1}u.prototype.includes=function(n,o,l){return this.indexOf(n,o,l)!==-1},u.prototype.indexOf=function(n,o,l){return Wi(this,n,o,l,!0)},u.prototype.lastIndexOf=function(n,o,l){return Wi(this,n,o,l,!1)};function t0(A,n,o,l){o=Number(o)||0;const g=A.length-o;l?(l=Number(l),l>g&&(l=g)):l=g;const S=n.length;l>S/2&&(l=S/2);let E;for(E=0;E<l;++E){const M=parseInt(n.substr(E*2,2),16);if(Qo(M))return E;A[o+E]=M}return E}function e0(A,n,o,l){return wn(Lo(n,A.length-o),A,o,l)}function r0(A,n,o,l){return wn(g0(n),A,o,l)}function n0(A,n,o,l){return wn(tA(n),A,o,l)}function o0(A,n,o,l){return wn(p0(n,A.length-o),A,o,l)}u.prototype.write=function(n,o,l,g){if(o===void 0)g="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")g=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,g===void 0&&(g="utf8")):(g=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const S=this.length-o;if((l===void 0||l>S)&&(l=S),n.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let E=!1;for(;;)switch(g){case"hex":return t0(this,n,o,l);case"utf8":case"utf-8":return e0(this,n,o,l);case"ascii":case"latin1":case"binary":return r0(this,n,o,l);case"base64":return n0(this,n,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o0(this,n,o,l);default:if(E)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function s0(A,n,o){return n===0&&o===A.length?e.fromByteArray(A):e.fromByteArray(A.slice(n,o))}function Gi(A,n,o){o=Math.min(A.length,o);const l=[];let g=n;for(;g<o;){const S=A[g];let E=null,M=S>239?4:S>223?3:S>191?2:1;if(g+M<=o){let z,v,tt,j;switch(M){case 1:S<128&&(E=S);break;case 2:z=A[g+1],(z&192)===128&&(j=(S&31)<<6|z&63,j>127&&(E=j));break;case 3:z=A[g+1],v=A[g+2],(z&192)===128&&(v&192)===128&&(j=(S&15)<<12|(z&63)<<6|v&63,j>2047&&(j<55296||j>57343)&&(E=j));break;case 4:z=A[g+1],v=A[g+2],tt=A[g+3],(z&192)===128&&(v&192)===128&&(tt&192)===128&&(j=(S&15)<<18|(z&63)<<12|(v&63)<<6|tt&63,j>65535&&j<1114112&&(E=j))}}E===null?(E=65533,M=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),g+=M}return i0(l)}const Zi=4096;function i0(A){const n=A.length;if(n<=Zi)return String.fromCharCode.apply(String,A);let o="",l=0;for(;l<n;)o+=String.fromCharCode.apply(String,A.slice(l,l+=Zi));return o}function A0(A,n,o){let l="";o=Math.min(A.length,o);for(let g=n;g<o;++g)l+=String.fromCharCode(A[g]&127);return l}function a0(A,n,o){let l="";o=Math.min(A.length,o);for(let g=n;g<o;++g)l+=String.fromCharCode(A[g]);return l}function c0(A,n,o){const l=A.length;(!n||n<0)&&(n=0),(!o||o<0||o>l)&&(o=l);let g="";for(let S=n;S<o;++S)g+=f0[A[S]];return g}function l0(A,n,o){const l=A.slice(n,o);let g="";for(let S=0;S<l.length-1;S+=2)g+=String.fromCharCode(l[S]+l[S+1]*256);return g}u.prototype.slice=function(n,o){const l=this.length;n=~~n,o=o===void 0?l:~~o,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<n&&(o=n);const g=this.subarray(n,o);return Object.setPrototypeOf(g,u.prototype),g};function ct(A,n,o){if(A%1!==0||A<0)throw new RangeError("offset is not uint");if(A+n>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||ct(n,o,this.length);let g=this[n],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[n+E]*S;return g},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||ct(n,o,this.length);let g=this[n+--o],S=1;for(;o>0&&(S*=256);)g+=this[n+--o]*S;return g},u.prototype.readUint8=u.prototype.readUInt8=function(n,o){return n=n>>>0,o||ct(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,o){return n=n>>>0,o||ct(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,o){return n=n>>>0,o||ct(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=Ie(function(n){n=n>>>0,Je(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Er(n,this.length-8);const g=o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,S=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(g)+(BigInt(S)<<BigInt(32))}),u.prototype.readBigUInt64BE=Ie(function(n){n=n>>>0,Je(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Er(n,this.length-8);const g=o*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],S=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(g)<<BigInt(32))+BigInt(S)}),u.prototype.readIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||ct(n,o,this.length);let g=this[n],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[n+E]*S;return S*=128,g>=S&&(g-=Math.pow(2,8*o)),g},u.prototype.readIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||ct(n,o,this.length);let g=o,S=1,E=this[n+--g];for(;g>0&&(S*=256);)E+=this[n+--g]*S;return S*=128,E>=S&&(E-=Math.pow(2,8*o)),E},u.prototype.readInt8=function(n,o){return n=n>>>0,o||ct(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,o){n=n>>>0,o||ct(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,o){n=n>>>0,o||ct(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=Ie(function(n){n=n>>>0,Je(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Er(n,this.length-8);const g=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(g)<<BigInt(32))+BigInt(o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=Ie(function(n){n=n>>>0,Je(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Er(n,this.length-8);const g=(o<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(g)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,o){return n=n>>>0,o||ct(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,o){return n=n>>>0,o||ct(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,o){return n=n>>>0,o||ct(n,8,this.length),r.read(this,n,!1,52,8)};function wt(A,n,o,l,g,S){if(!u.isBuffer(A))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>g||n<S)throw new RangeError('"value" argument is out of bounds');if(o+l>A.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,o,l,g){if(n=+n,o=o>>>0,l=l>>>0,!g){const M=Math.pow(2,8*l)-1;wt(this,n,o,l,M,0)}let S=1,E=0;for(this[o]=n&255;++E<l&&(S*=256);)this[o+E]=n/S&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,o,l,g){if(n=+n,o=o>>>0,l=l>>>0,!g){const M=Math.pow(2,8*l)-1;wt(this,n,o,l,M,0)}let S=l-1,E=1;for(this[o+S]=n&255;--S>=0&&(E*=256);)this[o+S]=n/E&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,1,255,0),this[o]=n&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,2,65535,0),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,2,65535,0),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,4,4294967295,0),this[o+3]=n>>>24,this[o+2]=n>>>16,this[o+1]=n>>>8,this[o]=n&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,4,4294967295,0),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4};function Ji(A,n,o,l,g){zi(n,l,g,A,o,7);let S=Number(n&BigInt(4294967295));A[o++]=S,S=S>>8,A[o++]=S,S=S>>8,A[o++]=S,S=S>>8,A[o++]=S;let E=Number(n>>BigInt(32)&BigInt(4294967295));return A[o++]=E,E=E>>8,A[o++]=E,E=E>>8,A[o++]=E,E=E>>8,A[o++]=E,o}function Vi(A,n,o,l,g){zi(n,l,g,A,o,7);let S=Number(n&BigInt(4294967295));A[o+7]=S,S=S>>8,A[o+6]=S,S=S>>8,A[o+5]=S,S=S>>8,A[o+4]=S;let E=Number(n>>BigInt(32)&BigInt(4294967295));return A[o+3]=E,E=E>>8,A[o+2]=E,E=E>>8,A[o+1]=E,E=E>>8,A[o]=E,o+8}u.prototype.writeBigUInt64LE=Ie(function(n,o=0){return Ji(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Ie(function(n,o=0){return Vi(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,o,l,g){if(n=+n,o=o>>>0,!g){const z=Math.pow(2,8*l-1);wt(this,n,o,l,z-1,-z)}let S=0,E=1,M=0;for(this[o]=n&255;++S<l&&(E*=256);)n<0&&M===0&&this[o+S-1]!==0&&(M=1),this[o+S]=(n/E>>0)-M&255;return o+l},u.prototype.writeIntBE=function(n,o,l,g){if(n=+n,o=o>>>0,!g){const z=Math.pow(2,8*l-1);wt(this,n,o,l,z-1,-z)}let S=l-1,E=1,M=0;for(this[o+S]=n&255;--S>=0&&(E*=256);)n<0&&M===0&&this[o+S+1]!==0&&(M=1),this[o+S]=(n/E>>0)-M&255;return o+l},u.prototype.writeInt8=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,1,127,-128),n<0&&(n=255+n+1),this[o]=n&255,o+1},u.prototype.writeInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,2,32767,-32768),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,2,32767,-32768),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,4,2147483647,-2147483648),this[o]=n&255,this[o+1]=n>>>8,this[o+2]=n>>>16,this[o+3]=n>>>24,o+4},u.prototype.writeInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||wt(this,n,o,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4},u.prototype.writeBigInt64LE=Ie(function(n,o=0){return Ji(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Ie(function(n,o=0){return Vi(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function ji(A,n,o,l,g,S){if(o+l>A.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function Hi(A,n,o,l,g){return n=+n,o=o>>>0,g||ji(A,n,o,4),r.write(A,n,o,l,23,4),o+4}u.prototype.writeFloatLE=function(n,o,l){return Hi(this,n,o,!0,l)},u.prototype.writeFloatBE=function(n,o,l){return Hi(this,n,o,!1,l)};function vi(A,n,o,l,g){return n=+n,o=o>>>0,g||ji(A,n,o,8),r.write(A,n,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(n,o,l){return vi(this,n,o,!0,l)},u.prototype.writeDoubleBE=function(n,o,l){return vi(this,n,o,!1,l)},u.prototype.copy=function(n,o,l,g){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!g&&g!==0&&(g=this.length),o>=n.length&&(o=n.length),o||(o=0),g>0&&g<l&&(g=l),g===l||n.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),n.length-o<g-l&&(g=n.length-o+l);const S=g-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,g):Uint8Array.prototype.set.call(n,this.subarray(l,g),o),S},u.prototype.fill=function(n,o,l,g){if(typeof n=="string"){if(typeof o=="string"?(g=o,o=0,l=this.length):typeof l=="string"&&(g=l,l=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!u.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(n.length===1){const E=n.charCodeAt(0);(g==="utf8"&&E<128||g==="latin1")&&(n=E)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let S;if(typeof n=="number")for(S=o;S<l;++S)this[S]=n;else{const E=u.isBuffer(n)?n:u.from(n,g),M=E.length;if(M===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(S=0;S<l-o;++S)this[S+o]=E[S%M]}return this};const Ze={};function Mo(A,n,o){Ze[A]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${A}]`,this.stack,delete this.name}get code(){return A}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${A}]: ${this.message}`}}}Mo("ERR_BUFFER_OUT_OF_BOUNDS",function(A){return A?`${A} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Mo("ERR_INVALID_ARG_TYPE",function(A,n){return`The "${A}" argument must be of type number. Received type ${typeof n}`},TypeError),Mo("ERR_OUT_OF_RANGE",function(A,n,o){let l=`The value of "${A}" is out of range.`,g=o;return Number.isInteger(o)&&Math.abs(o)>2**32?g=$i(String(o)):typeof o=="bigint"&&(g=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(g=$i(g)),g+="n"),l+=` It must be ${n}. Received ${g}`,l},RangeError);function $i(A){let n="",o=A.length;const l=A[0]==="-"?1:0;for(;o>=l+4;o-=3)n=`_${A.slice(o-3,o)}${n}`;return`${A.slice(0,o)}${n}`}function u0(A,n,o){Je(n,"offset"),(A[n]===void 0||A[n+o]===void 0)&&Er(n,A.length-(o+1))}function zi(A,n,o,l,g,S){if(A>o||A<n){const E=typeof n=="bigint"?"n":"";let M;throw n===0||n===BigInt(0)?M=`>= 0${E} and < 2${E} ** ${(S+1)*8}${E}`:M=`>= -(2${E} ** ${(S+1)*8-1}${E}) and < 2 ** ${(S+1)*8-1}${E}`,new Ze.ERR_OUT_OF_RANGE("value",M,A)}u0(l,g,S)}function Je(A,n){if(typeof A!="number")throw new Ze.ERR_INVALID_ARG_TYPE(n,"number",A)}function Er(A,n,o){throw Math.floor(A)!==A?(Je(A,o),new Ze.ERR_OUT_OF_RANGE("offset","an integer",A)):n<0?new Ze.ERR_BUFFER_OUT_OF_BOUNDS:new Ze.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,A)}const h0=/[^+/0-9A-Za-z-_]/g;function I0(A){if(A=A.split("=")[0],A=A.trim().replace(h0,""),A.length<2)return"";for(;A.length%4!==0;)A=A+"=";return A}function Lo(A,n){n=n||1/0;let o;const l=A.length;let g=null;const S=[];for(let E=0;E<l;++E){if(o=A.charCodeAt(E),o>55295&&o<57344){if(!g){if(o>56319){(n-=3)>-1&&S.push(239,191,189);continue}else if(E+1===l){(n-=3)>-1&&S.push(239,191,189);continue}g=o;continue}if(o<56320){(n-=3)>-1&&S.push(239,191,189),g=o;continue}o=(g-55296<<10|o-56320)+65536}else g&&(n-=3)>-1&&S.push(239,191,189);if(g=null,o<128){if((n-=1)<0)break;S.push(o)}else if(o<2048){if((n-=2)<0)break;S.push(o>>6|192,o&63|128)}else if(o<65536){if((n-=3)<0)break;S.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((n-=4)<0)break;S.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return S}function g0(A){const n=[];for(let o=0;o<A.length;++o)n.push(A.charCodeAt(o)&255);return n}function p0(A,n){let o,l,g;const S=[];for(let E=0;E<A.length&&!((n-=2)<0);++E)o=A.charCodeAt(E),l=o>>8,g=o%256,S.push(g),S.push(l);return S}function tA(A){return e.toByteArray(I0(A))}function wn(A,n,o,l){let g;for(g=0;g<l&&!(g+o>=n.length||g>=A.length);++g)n[g+o]=A[g];return g}function xt(A,n){return A instanceof n||A!=null&&A.constructor!=null&&A.constructor.name!=null&&A.constructor.name===n.name}function Qo(A){return A!==A}const f0=(function(){const A="0123456789abcdef",n=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let g=0;g<16;++g)n[l+g]=A[o]+A[g]}return n})();function Ie(A){return typeof BigInt>"u"?S0:A}function S0(){throw new Error("BigInt not supported")}})(Tn)),Tn}var be=nA();const oA=!1,sA=30,iA=4,je=256,Me=383,He=256*je,Wt=256*Me;var Y=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(Y||{}),It=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_APPLE_MOUSE=7]="SHOW_APPLE_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t[t.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",t[t.INSTRUCTIONS=14]="INSTRUCTIONS",t))(It||{}),F=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.SHOW_DEBUG_TAB=3]="SHOW_DEBUG_TAB",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.KEYRELEASE=15]="KEYRELEASE",t[t.MOUSEEVENT=16]="MOUSEEVENT",t[t.PASTE_TEXT=17]="PASTE_TEXT",t[t.APPLE_PRESS=18]="APPLE_PRESS",t[t.APPLE_RELEASE=19]="APPLE_RELEASE",t[t.GET_SAVE_STATE=20]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=21]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=22]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=23]="DRIVE_NEW_DATA",t[t.GAMEPAD=24]="GAMEPAD",t[t.SET_BINARY_BLOCK=25]="SET_BINARY_BLOCK",t[t.SET_CYCLECOUNT=26]="SET_CYCLECOUNT",t[t.SET_MEMORY=27]="SET_MEMORY",t[t.COMM_DATA=28]="COMM_DATA",t[t.MIDI_DATA=29]="MIDI_DATA",t[t.RAMWORKS=30]="RAMWORKS",t[t.MACHINE_NAME=31]="MACHINE_NAME",t[t.SOFTSWITCHES=32]="SOFTSWITCHES",t))(F||{}),ge=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(ge||{}),i=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(i||{});const AA=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Rn=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",U=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const ve=t=>t.split("").map(e=>e.charCodeAt(0)),aA=t=>[t&255,t>>>8&255],qo=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Oo=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},yn=new Uint32Array(256).fill(0),cA=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;yn[e]=t}},lA=(t,e=0)=>{yn[255]===0&&cA();let r=-1;for(let s=e;s<t.length;s++)r=r>>>8^yn[(r^t[s])&255];return(r^-1)>>>0},uA=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),No=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")};let bt;const pe=Math.trunc(.0028*1020484);let Pn=pe/2,bn=pe/2,mr=pe/2,Dr=pe/2,Yo=0,_o=!1,xo=!1,Mn=!1,Ln=!1,dr=!1,Wo=!1,Xo=!1;const $e=()=>{Mn=!0},Qn=()=>{Ln=!0},hA=()=>{dr=!0},kr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*pe/2),Go=t=>{Pn=kr(t)},Zo=t=>{bn=kr(t)},Jo=t=>{mr=kr(t)},Vo=t=>{Dr=kr(t)},Fn=()=>{Wo=_o||Mn,Xo=xo||Ln,C.PB0.isSet=Wo,C.PB1.isSet=Xo||dr,C.PB2.isSet=dr},jo=(t,e)=>{e?_o=t:xo=t,Fn()},IA=t=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),Yo=t},wr=t=>{const e=t-Yo;Z(49252,e<Pn?128:0),Z(49253,e<bn?128:0),Z(49254,e<mr?128:0),Z(49255,e<Dr?128:0)};let fe,Un,Ho=!1;const gA=t=>{bt=t,Ho=!bt.length||!bt[0].buttons.length,fe=xA(),Un=fe.gamepad?fe.gamepad:YA},vo=t=>t>-.01&&t<.01,$o=(t,e)=>{vo(t)&&(t=0),vo(e)&&(e=0);const r=Math.sqrt(t*t+e*e),s=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-s,t),s),e=Math.min(Math.max(-s,e),s),t=Math.trunc(pe*(t+s)/(2*s)),e=Math.trunc(pe*(e+s)/(2*s)),[t,e]},pA=t=>{const[e,r]=$o(t[0],t[1]),s=t.length>=6?t[5]:t[3],[a,h]=t.length>=4?$o(t[2],s):[0,0];return[e,r,a,h]},zo=t=>{const e=fe.joystick?fe.joystick(bt[t].axes,Ho):bt[t].axes,r=pA(e);t===0?(Pn=r[0],bn=r[1],Mn=!1,Ln=!1,mr=r[2],Dr=r[3]):(mr=r[0],Dr=r[1],dr=!1);let s=!1;bt[t].buttons.forEach((a,h)=>{a&&(Un(h,bt.length>1,t===1),s=!0)}),s||Un(-1,bt.length>1,t===1),fe.rumble&&fe.rumble(),Fn()},fA=()=>{bt&&bt.length>0&&(zo(0),bt.length>1&&zo(1))},SA=t=>{switch(t){case 0:L("JL");break;case 1:L("G",200);break;case 2:_("M"),L("O");break;case 3:L("L");break;case 4:L("F");break;case 5:_("P"),L("T");break;case 6:break;case 7:break;case 8:L("Z");break;case 9:{const e=zn();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:break;case 11:break;case 12:L("L");break;case 13:L("M");break;case 14:L("A");break;case 15:L("D");break;case-1:return}};let Se=0,Ce=0,Ee=!1;const Tr=.5,CA={address:24835,data:[173,198,9],keymap:{},joystick:t=>t[0]<-Tr?(Ce=0,Se===0||Se>2?(Se=0,_("A")):Se===1&&Ee?L("W"):Se===2&&Ee&&L("R"),Se++,Ee=!1,t):t[0]>Tr?(Se=0,Ce===0||Ce>2?(Ce=0,_("D")):Ce===1&&Ee?L("W"):Ce===2&&Ee&&L("R"),Ce++,Ee=!1,t):t[1]<-Tr?(L("C"),t):t[1]>Tr?(L("S"),t):(Ee=!0,t),gamepad:SA,rumble:null,setup:null,helptext:`AZTEC
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
`},EA={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:_(" ");break;case 12:_("A");break;case 13:_("Z");break;case 14:_("\b");break;case 15:_("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},BA={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},mA={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Po("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let Kn=14,qn=14;const DA={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=B(182,!1);Kn<40&&t<Kn&&kn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Kn=t,t=B(183,!1),qn<40&&t<qn&&kn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),qn=t},setup:null,helptext:`KARATEKA
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
`},dA={address:25078,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:()=>{D(46793,234),D(46794,234)},helptext:`Lode Runner by Doug Smith
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
`},kA=t=>{switch(t){case 0:L("A");break;case 1:L("C",50);break;case 2:L("O");break;case 3:L("T");break;case 4:L("\x1B");break;case 5:L("\r");break;case 6:break;case 7:break;case 8:_("N"),L("'");break;case 9:_("Y"),L("1");break;case 10:break;case 11:break;case 12:break;case 13:L(" ");break;case 14:break;case 15:L("	");break;case-1:return}},$t=.5,wA={address:768,data:[141,74,3,132],keymap:{},gamepad:kA,joystick:(t,e)=>{if(e)return t;const r=t[0]<-$t?"\b":t[0]>$t?"":"",s=t[1]<-$t?"\v":t[1]>$t?`
`:"";let a=r+s;return a||(a=t[2]<-$t?"L\b":t[2]>$t?"L":"",a||(a=t[3]<-$t?"L\v":t[3]>$t?`L
`:"")),a&&L(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},TA={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},RA={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},yA={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},PA={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&kn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},ts=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,bA=t=>{switch(t){case 1:D(109,255);break;case 12:_("A");break;case 13:_("Z");break;case 14:_("\b");break;case 15:_("");break}},Rr=.75,MA=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{D(25025,173),D(25036,64)},helptext:ts},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Rr?"\b":t[0]>Rr?"":t[1]<-Rr?"A":t[1]>Rr?"Z":"";return e&&_(e),t},gamepad:bA,rumble:null,setup:null,helptext:ts}],LA={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{_i(1)},helptext:`Ultima V: Warriors of Destiny
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

`},QA={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},es=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,FA=t=>{switch(t){case 0:$e();break;case 1:Qn();break;case 2:L(" ");break;case 3:L("U");break;case 4:L("\r");break;case 5:L("T");break;case 9:{const e=zn();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:$e();break}},UA=()=>{D(5128,0),D(5130,4);let t=5210;D(t,234),D(t+1,234),D(t+2,234),t=5224,D(t,234),D(t+1,234),D(t+2,234)},KA=()=>{B(49178,!1)<128&&B(49181,!1)<128&&kn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},qA={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:es},OA={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:FA,rumble:KA,setup:UA,helptext:es},NA={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:$e();break;case 1:Qn();break;case 2:L(" ");break;case 3:L("U");break;case 4:L("\r");break;case 5:L(":");break;case 9:{const e=zn();e.includes("'N'")?_("N"):e.includes("'S'")?_("S"):e.includes("NUMERIC KEY")?_("1"):_("N");break}case 10:$e();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},ze=new Array,lt=t=>{Array.isArray(t)?ze.push(...t):ze.push(t)};lt(CA),lt(EA),lt(BA),lt(mA),lt(DA),lt(dA),lt(wA),lt(TA),lt(RA),lt(yA),lt(PA),lt(MA),lt(LA),lt(QA),lt(OA),lt(qA),lt(NA);const YA=(t,e,r)=>{if(r)switch(t){case 0:hA();break;case 1:break;case 12:Vo(-1);break;case 13:Vo(1);break;case 14:Jo(-1);break;case 15:Jo(1);break}else switch(t){case 0:$e();break;case 1:e||Qn();break;case 12:Zo(-1);break;case 13:Zo(1);break;case 14:Go(-1);break;case 15:Go(1);break}},_A={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},rs=t=>{for(const e of ze)if(ro(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},xA=()=>{for(const t of ze)if(ro(t.address,t.data))return t;return _A},On=(t=!1)=>{for(const e of ze)if(ro(e.address,e.data)){Yi(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(Yi(" "),_i(0))},WA=t=>{Z(49152,t|128,16),Z(49168,t&255|128,16)},XA=()=>{const t=ft(49152)&127;Z(49152,t,16)},GA=()=>{const t=ft(49152)&127;Z(49152,t,32)};let Be="",ns=1e9,os=0;const ss=()=>{const t=performance.now();if(Be!==""&&(ft(49152)<128||t-ns>3800)){ns=t;const e=Be.charCodeAt(0);WA(e),Be=Be.slice(1),Be.length===0&&t-os>500&&(os=t,bo(!0))}};let is="";const _=t=>{t===is&&Be.length>0||(is=t,Be+=t)};let As=0;const L=(t,e=300)=>{const r=performance.now();r-As<e||(As=r,_(t))},ZA=t=>{let e=String.fromCharCode(t);e=rs(e),_(e),ss()},JA=t=>{t.length===1&&(t=rs(t)),_(t)},Le=[],R=(t,e,r,s=!1,a=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:s,isSet:!1,setFunc:a};return t>=49152&&(Le[t-49152]=h),e>=49152&&(Le[e-49152]=h),r>=49152&&(Le[r-49152]=h),h},Qe=()=>Math.floor(180*Math.random()),as=(t,e)=>{t&=11,e?C.BSR_PREWRITE.isSet=!1:t&1?C.BSR_PREWRITE.isSet?C.BSR_WRITE.isSet=!0:C.BSR_PREWRITE.isSet=!0:(C.BSR_PREWRITE.isSet=!1,C.BSR_WRITE.isSet=!1),C.BSRBANK2.isSet=t<=3,C.BSRREADRAM.isSet=[0,3,8,11].includes(t)},C={STORE80:R(49152,49153,49176,!0),RAMRD:R(49154,49155,49171,!0),RAMWRT:R(49156,49157,49172,!0),INTCXROM:R(49158,49159,49173,!0),INTC8ROM:R(49194,0,0),ALTZP:R(49160,49161,49174,!0),SLOTC3ROM:R(49162,49163,49175,!0),COLUMN80:R(49164,49165,49183,!0),ALTCHARSET:R(49166,49167,49182,!0),KBRDSTROBE:R(49168,0,0,!1),BSRBANK2:R(0,0,49169),BSRREADRAM:R(0,0,49170),VBL:R(0,0,49177),CASSOUT:R(49184,0,0),SPEAKER:R(49200,0,0,!1,(t,e)=>{Z(49200,Qe()),Z1(e)}),GCSTROBE:R(49216,0,0),EMUBYTE:R(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:R(49232,49233,49178),MIXED:R(49234,49235,49179),PAGE2:R(49236,49237,49180),HIRES:R(49238,49239,49181),AN0:R(49240,49241,0),AN1:R(49242,49243,0),AN2:R(49244,49245,0),DHIRES:R(49247,49246,0),CASSIN1:R(0,0,49248,!1,()=>{Z(49248,Qe())}),PB0:R(0,0,49249),PB1:R(0,0,49250),PB2:R(0,0,49251),JOYSTICK0:R(0,0,49252,!1,(t,e)=>{wr(e)}),JOYSTICK1:R(0,0,49253,!1,(t,e)=>{wr(e)}),JOYSTICK2:R(0,0,49254,!1,(t,e)=>{wr(e)}),JOYSTICK3:R(0,0,49255,!1,(t,e)=>{wr(e)}),CASSIN2:R(0,0,49256,!1,()=>{Z(49256,Qe())}),FASTCHIP_LOCK:R(49258,0,0),FASTCHIP_ENABLE:R(49259,0,0),FASTCHIP_SPEED:R(49261,0,0),JOYSTICKRESET:R(0,0,49264,!1,(t,e)=>{IA(e),Z(49264,Qe())}),BANKSEL:R(49267,0,0),LASER128EX:R(49268,0,0),VIDEO7_160:R(49272,49273,0),VIDEO7_MONO:R(49274,49275,0),VIDEO7_MIXED:R(49276,49277,0),BSR_PREWRITE:R(49280,0,0),BSR_WRITE:R(49288,0,0)};C.TEXT.isSet=!0;let cs=!0,yr=0;const ls=t=>{if(cs!==t&&C.STORE80.isSet){if(t)switch(C.VIDEO7_160.isSet=!1,C.VIDEO7_MONO.isSet=!1,C.VIDEO7_MIXED.isSet=!1,yr=yr<<1&2,yr|=C.COLUMN80.isSet?0:1,yr){case 0:break;case 1:{C.VIDEO7_160.isSet=!0;break}case 2:{C.VIDEO7_MIXED.isSet=!0;break}case 3:{C.VIDEO7_MONO.isSet=!0;break}}cs=t}},VA=[49152,49153,49165,49167,49168,49200,49236,49237,49183],us=(t,e,r)=>{if(t>1048575&&!VA.includes(t)){const a=ft(t)>128?1:0;console.log(`${r} $${U(c.PC)}: $${U(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){as(t&-5,e);return}const s=Le[t-49152];if(!s){console.error("Unknown softswitch "+U(t)),Z(t,Qe());return}if(t<=49167?e||ss():(t===49168||t<=49183&&e)&&XA(),s.setFunc){s.setFunc(t,r);return}if(t===C.DHIRES.offAddr?ls(!0):t===C.DHIRES.onAddr&&ls(!1),t===s.offAddr||t===s.onAddr){if((!s.writeOnly||e)&&(Ut[s.offAddr-49152]!==void 0?Ut[s.offAddr-49152]=t===s.onAddr:s.isSet=t===s.onAddr),s.isSetAddr){const a=ft(s.isSetAddr);Z(s.isSetAddr,s.isSet?a|128:a&127)}t>=49184&&Z(t,Qe())}else if(t===s.isSetAddr){const a=ft(t);Z(t,s.isSet?a|128:a&127)}},jA=()=>{for(const t in C){const e=t;Ut[C[e].offAddr-49152]!==void 0?Ut[C[e].offAddr-49152]=!1:C[e].isSet=!1}Ut[C.TEXT.offAddr-49152]!==void 0?Ut[C.TEXT.offAddr-49152]=!0:C.TEXT.isSet=!0},Ut=[],HA=t=>{if(t>=49280&&t<=49295){as(t&-5,!1);return}const e=Le[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+U(t));return}Ut[e.offAddr-49152]===void 0&&(Ut[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},vA=()=>{Ut.forEach((t,e)=>{t!==void 0&&(Le[e].isSet=t)}),Ut.length=0},Fe=[],$A=()=>{if(Fe.length===0)for(const t in C){const e=C[t],r=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const a=U(e.offAddr)+" "+t;Fe[e.offAddr]=a+(r?"-OFF":"")+s}if(e.onAddr>0){const a=U(e.onAddr)+" "+t;Fe[e.onAddr]=a+"-ON"+s}if(e.isSetAddr>0){const a=U(e.isSetAddr)+" "+t;Fe[e.isSetAddr]=a+"-STATUS"+s}}return Fe[49152]="C000 KBRD/STORE80-OFF",Fe},zA=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,ta=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,hs=new Array(256),Nn={},p=(t,e,r,s)=>{console.assert(!hs[r],"Duplicate instruction: "+t+" mode="+e),hs[r]={name:t,mode:e,bytes:s},Nn[t]||(Nn[t]=[]),Nn[t][e]=r};p("ADC",i.IMM,105,2),p("ADC",i.ZP_REL,101,2),p("ADC",i.ZP_X,117,2),p("ADC",i.ABS,109,3),p("ADC",i.ABS_X,125,3),p("ADC",i.ABS_Y,121,3),p("ADC",i.IND_X,97,2),p("ADC",i.IND_Y,113,2),p("ADC",i.IND,114,2),p("AND",i.IMM,41,2),p("AND",i.ZP_REL,37,2),p("AND",i.ZP_X,53,2),p("AND",i.ABS,45,3),p("AND",i.ABS_X,61,3),p("AND",i.ABS_Y,57,3),p("AND",i.IND_X,33,2),p("AND",i.IND_Y,49,2),p("AND",i.IND,50,2),p("ASL",i.IMPLIED,10,1),p("ASL",i.ZP_REL,6,2),p("ASL",i.ZP_X,22,2),p("ASL",i.ABS,14,3),p("ASL",i.ABS_X,30,3),p("BCC",i.ZP_REL,144,2),p("BCS",i.ZP_REL,176,2),p("BEQ",i.ZP_REL,240,2),p("BIT",i.ZP_REL,36,2),p("BIT",i.ABS,44,3),p("BIT",i.IMM,137,2),p("BIT",i.ZP_X,52,2),p("BIT",i.ABS_X,60,3),p("BMI",i.ZP_REL,48,2),p("BNE",i.ZP_REL,208,2),p("BPL",i.ZP_REL,16,2),p("BVC",i.ZP_REL,80,2),p("BVS",i.ZP_REL,112,2),p("BRA",i.ZP_REL,128,2),p("BRK",i.IMPLIED,0,1),p("CLC",i.IMPLIED,24,1),p("CLD",i.IMPLIED,216,1),p("CLI",i.IMPLIED,88,1),p("CLV",i.IMPLIED,184,1),p("CMP",i.IMM,201,2),p("CMP",i.ZP_REL,197,2),p("CMP",i.ZP_X,213,2),p("CMP",i.ABS,205,3),p("CMP",i.ABS_X,221,3),p("CMP",i.ABS_Y,217,3),p("CMP",i.IND_X,193,2),p("CMP",i.IND_Y,209,2),p("CMP",i.IND,210,2),p("CPX",i.IMM,224,2),p("CPX",i.ZP_REL,228,2),p("CPX",i.ABS,236,3),p("CPY",i.IMM,192,2),p("CPY",i.ZP_REL,196,2),p("CPY",i.ABS,204,3),p("DEC",i.IMPLIED,58,1),p("DEC",i.ZP_REL,198,2),p("DEC",i.ZP_X,214,2),p("DEC",i.ABS,206,3),p("DEC",i.ABS_X,222,3),p("DEX",i.IMPLIED,202,1),p("DEY",i.IMPLIED,136,1),p("EOR",i.IMM,73,2),p("EOR",i.ZP_REL,69,2),p("EOR",i.ZP_X,85,2),p("EOR",i.ABS,77,3),p("EOR",i.ABS_X,93,3),p("EOR",i.ABS_Y,89,3),p("EOR",i.IND_X,65,2),p("EOR",i.IND_Y,81,2),p("EOR",i.IND,82,2),p("INC",i.IMPLIED,26,1),p("INC",i.ZP_REL,230,2),p("INC",i.ZP_X,246,2),p("INC",i.ABS,238,3),p("INC",i.ABS_X,254,3),p("INX",i.IMPLIED,232,1),p("INY",i.IMPLIED,200,1),p("JMP",i.ABS,76,3),p("JMP",i.IND,108,3),p("JMP",i.IND_X,124,3),p("JSR",i.ABS,32,3),p("LDA",i.IMM,169,2),p("LDA",i.ZP_REL,165,2),p("LDA",i.ZP_X,181,2),p("LDA",i.ABS,173,3),p("LDA",i.ABS_X,189,3),p("LDA",i.ABS_Y,185,3),p("LDA",i.IND_X,161,2),p("LDA",i.IND_Y,177,2),p("LDA",i.IND,178,2),p("LDX",i.IMM,162,2),p("LDX",i.ZP_REL,166,2),p("LDX",i.ZP_Y,182,2),p("LDX",i.ABS,174,3),p("LDX",i.ABS_Y,190,3),p("LDY",i.IMM,160,2),p("LDY",i.ZP_REL,164,2),p("LDY",i.ZP_X,180,2),p("LDY",i.ABS,172,3),p("LDY",i.ABS_X,188,3),p("LSR",i.IMPLIED,74,1),p("LSR",i.ZP_REL,70,2),p("LSR",i.ZP_X,86,2),p("LSR",i.ABS,78,3),p("LSR",i.ABS_X,94,3),p("NOP",i.IMPLIED,234,1),p("ORA",i.IMM,9,2),p("ORA",i.ZP_REL,5,2),p("ORA",i.ZP_X,21,2),p("ORA",i.ABS,13,3),p("ORA",i.ABS_X,29,3),p("ORA",i.ABS_Y,25,3),p("ORA",i.IND_X,1,2),p("ORA",i.IND_Y,17,2),p("ORA",i.IND,18,2),p("PHA",i.IMPLIED,72,1),p("PHP",i.IMPLIED,8,1),p("PHX",i.IMPLIED,218,1),p("PHY",i.IMPLIED,90,1),p("PLA",i.IMPLIED,104,1),p("PLP",i.IMPLIED,40,1),p("PLX",i.IMPLIED,250,1),p("PLY",i.IMPLIED,122,1),p("ROL",i.IMPLIED,42,1),p("ROL",i.ZP_REL,38,2),p("ROL",i.ZP_X,54,2),p("ROL",i.ABS,46,3),p("ROL",i.ABS_X,62,3),p("ROR",i.IMPLIED,106,1),p("ROR",i.ZP_REL,102,2),p("ROR",i.ZP_X,118,2),p("ROR",i.ABS,110,3),p("ROR",i.ABS_X,126,3),p("RTI",i.IMPLIED,64,1),p("RTS",i.IMPLIED,96,1),p("SBC",i.IMM,233,2),p("SBC",i.ZP_REL,229,2),p("SBC",i.ZP_X,245,2),p("SBC",i.ABS,237,3),p("SBC",i.ABS_X,253,3),p("SBC",i.ABS_Y,249,3),p("SBC",i.IND_X,225,2),p("SBC",i.IND_Y,241,2),p("SBC",i.IND,242,2),p("SEC",i.IMPLIED,56,1),p("SED",i.IMPLIED,248,1),p("SEI",i.IMPLIED,120,1),p("STA",i.ZP_REL,133,2),p("STA",i.ZP_X,149,2),p("STA",i.ABS,141,3),p("STA",i.ABS_X,157,3),p("STA",i.ABS_Y,153,3),p("STA",i.IND_X,129,2),p("STA",i.IND_Y,145,2),p("STA",i.IND,146,2),p("STX",i.ZP_REL,134,2),p("STX",i.ZP_Y,150,2),p("STX",i.ABS,142,3),p("STY",i.ZP_REL,132,2),p("STY",i.ZP_X,148,2),p("STY",i.ABS,140,3),p("STZ",i.ZP_REL,100,2),p("STZ",i.ZP_X,116,2),p("STZ",i.ABS,156,3),p("STZ",i.ABS_X,158,3),p("TAX",i.IMPLIED,170,1),p("TAY",i.IMPLIED,168,1),p("TSX",i.IMPLIED,186,1),p("TXA",i.IMPLIED,138,1),p("TXS",i.IMPLIED,154,1),p("TYA",i.IMPLIED,152,1),p("TRB",i.ZP_REL,20,2),p("TRB",i.ABS,28,3),p("TSB",i.ZP_REL,4,2),p("TSB",i.ABS,12,3);const ea=65536,Is=65792,gs=66048,ra=()=>{const t={register:"",address:768,operator:"==",value:128},e={action:"",register:"A",address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...t},expression2:{...t},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:"",action1:{...e},action2:{...e},halt:!1}};class ps extends Map{set(e,r){const s=[...this.entries()];s.push([e,r]),s.sort((a,h)=>a[0]-h[0]),super.clear();for(const[a,h]of s)super.set(a,h);return this}}const et={};et[""]={name:"Any",min:0,max:65535},et.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},et.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},et.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},et["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},et["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},et["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},et["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},et["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},et["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(et).map(t=>t.name);const na=(t,e)=>t+2+(e>127?e-256:e),oa=(t,e,r,s)=>{let a="",h=`${U(e.pcode)}`,f="",u="";switch(e.bytes){case 1:h+="      ";break;case 2:f=U(r),h+=` ${f}   `;break;case 3:f=U(r),u=U(s),h+=` ${f} ${u}`;break}const m=Rn(e.name)?U(na(t,r),4):f;switch(e.mode){case i.IMPLIED:break;case i.IMM:a=` #$${f}`;break;case i.ZP_REL:a=` $${m}`;break;case i.ZP_X:a=` $${f},X`;break;case i.ZP_Y:a=` $${f},Y`;break;case i.ABS:a=` $${u}${f}`;break;case i.ABS_X:a=` $${u}${f},X`;break;case i.ABS_Y:a=` $${u}${f},Y`;break;case i.IND_X:a=` ($${u.trim()}${f},X)`;break;case i.IND_Y:a=` ($${f}),Y`;break;case i.IND:a=` ($${u.trim()}${f})`;break}return`${U(t,4)}: ${h}  ${e.name}${a}`};let Yn=!1,_n=!1,mt=new ps;const Pr=()=>{Yn=!0},sa=()=>{new ps(mt).forEach((s,a)=>{s.once&&mt.delete(a)});const e=Ka();if(e<0||mt.get(e))return;const r=ra();r.address=e,r.once=!0,r.hidden=!0,mt.set(e,r)},ia=t=>{mt=t};let fs=!1;const Aa=()=>{fs=!0,et.MAIN.enabled=(t=0)=>t>=53248?!C.ALTZP.isSet&&C.BSRREADRAM.isSet:t>=512?!C.RAMRD.isSet:!C.ALTZP.isSet,et.AUX.enabled=(t=0)=>t>=53248?C.ALTZP.isSet&&C.BSRREADRAM.isSet:t>=512?C.RAMRD.isSet:C.ALTZP.isSet,et.ROM.enabled=()=>!C.BSRREADRAM.isSet,et["MAIN-DXXX-1"].enabled=()=>!C.ALTZP.isSet&&C.BSRREADRAM.isSet&&!C.BSRBANK2.isSet,et["MAIN-DXXX-2"].enabled=()=>!C.ALTZP.isSet&&C.BSRREADRAM.isSet&&C.BSRBANK2.isSet,et["AUX-DXXX-1"].enabled=()=>C.ALTZP.isSet&&C.BSRREADRAM.isSet&&!C.BSRBANK2.isSet,et["AUX-DXXX-2"].enabled=()=>C.ALTZP.isSet&&C.BSRREADRAM.isSet&&C.BSRBANK2.isSet,et["CXXX-ROM"].enabled=(t=0)=>t>=49920&&t<=50175?C.INTCXROM.isSet||!C.SLOTC3ROM.isSet:t>=51200?C.INTCXROM.isSet||C.INTC8ROM.isSet:C.INTCXROM.isSet,et["CXXX-CARD"].enabled=(t=0)=>t>=49920&&t<=50175?C.INTCXROM.isSet?!1:C.SLOTC3ROM.isSet:t>=51200?!C.INTCXROM.isSet&&!C.INTC8ROM.isSet:!C.INTCXROM.isSet},Ss=(t,e)=>{fs||Aa();const r=et[t];return!(e<r.min||e>r.max||r.enabled&&!r?.enabled(e))},Cs=(t,e,r)=>{const s=mt.get(t);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!Ss(s.memoryBank,t)?!1:r?s.memset:s.memget},tr=(t=0,e=!0)=>{e?c.flagIRQ|=1<<t:c.flagIRQ&=~(1<<t),c.flagIRQ&=255},aa=(t=!0)=>{c.flagNMI=t===!0},ca=()=>{c.flagIRQ=0,c.flagNMI=!1},xn=[],Es=[],Bs=(t,e)=>{xn.push(t),Es.push(e)},la=()=>{for(let t=0;t<xn.length;t++)xn[t](Es[t])},ms=t=>{let e=0;switch(t.register){case"$":e=Ra(t.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},ua=t=>{const e=ms(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:ms(t.expression2)},Ds=()=>{_n=!0},ha=(t,e,r)=>{const s=oa(c.PC,{...r},t,e)+"          ",h=`${("          "+c.cycleCount.toString()).slice(-10)}  ${s.slice(0,29)}  ${La()}`;console.log(h)},ds=(t,e,r,s)=>{if(t.action==="")return!1;const a=t.value&255,h=t.address&65535;switch(t.action){case"set":switch(t.register){case"A":c.Accum=a;break;case"X":c.XReg=a;break;case"Y":c.YReg=a;break;case"S":c.StackPtr=a;break;case"P":c.PStatus=a;break;case"C":c.PC=t.value&65535;break}break;case"jump":c.PC=h;break;case"print":ha(e,r,s);break;case"snapshot":bo();break}return!0},Ia=(t,e,r,s)=>{const a=ds(t.action1,e,r,s),h=ds(t.action2,e,r,s);return a||h?t.halt?1:2:1},ga=(t=-1,e=0,r=0,s=null)=>{if(_n)return _n=!1,1;if(mt.size===0||Yn)return 0;const a=mt.get(c.PC)||mt.get(-1)||mt.get(t|ea)||t>=0&&mt.get(Is)||t>=0&&mt.get(gs);if(!a||a.disabled||a.watchpoint)return 0;if(a.instruction){const h=(r<<8)+e;if(a.address===Is){if(H[t].name!=="???")return 0}else if(a.address===gs){if(H[t].is6502)return 0}else if(h>=0&&a.hexvalue>=0&&a.hexvalue!==h)return 0}if(a.expression1.register!==""&&!ua(a))return 0;if(a.hitcount>1){if(a.nhits++,a.nhits<a.hitcount)return 0;a.nhits=0}return a.memoryBank&&!Ss(a.memoryBank,c.PC)?0:(a.once&&mt.delete(c.PC),Ia(a,e,r,s))},Wn=()=>{let t=0;const e=c.PC,r=B(c.PC,!1),s=H[r],a=s.bytes>1?B(c.PC+1,!1):-1,h=s.bytes>2?B(c.PC+2,!1):0,f=ga(r,a,h,s);if(f===1)return Qt(Y.PAUSED),-1;if(f===2)return 0;Yn=!1;const u=ys.get(e);if(u&&!C.INTCXROM.isSet&&u(),t=s.execute(a,h),Fs(s.bytes),sr(c.cycleCount+t),la(),c.flagNMI&&(c.flagNMI=!1,t=Na(),sr(c.cycleCount+t)),c.flagIRQ){const m=Oa();m>0&&(sr(c.cycleCount+m),t=m)}return t},pa=[197,58,163,92,197,58,163,92],fa=1,ks=4;class Sa{bits=[];pattern=new Array(64);patternIdx=0;constructor(){}reset=()=>{this.patternIdx=0};checkPattern=e=>{const s=pa[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s};calcBits=()=>{const e=X=>{this.bits.push(X&8?1:0),this.bits.push(X&4?1:0),this.bits.push(X&2?1:0),this.bits.push(X&1?1:0)},r=X=>{e(Math.floor(X/10)),e(Math.floor(X%10))},s=new Date,a=s.getFullYear()%100,h=s.getDate(),f=s.getDay()+1,u=s.getMonth()+1,m=s.getHours(),b=s.getMinutes(),w=s.getSeconds(),W=s.getMilliseconds()/10;this.bits=[],r(a),r(u),r(h),r(f),r(m),r(b),r(w),r(W)};access=e=>{e&ks?this.reset():this.checkPattern(e&fa)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()};read=e=>{let r=-1;return this.bits.length>0?e&ks&&(r=this.bits.pop()):this.access(e),r}}const Ca=new Sa,ws=320,Ts=327,br=256*ws,Ea=256*Ts;let Kt=0;const Xn=Wt;let P=new Uint8Array(Xn+(Kt+1)*65536).fill(0);const Gn=new Uint8Array(8).fill(0),Zn=()=>ft(49194),Mr=t=>{Z(49194,t)},me=()=>ft(49267),Jn=t=>{Z(49267,t)},At=new Array(257).fill(0),Rt=new Array(257).fill(0),Rs=t=>{let e="";switch(t){case"APPLE2EU":e=ta;break;case"APPLE2EE":e=zA;break}const r=e.replace(/\n/g,""),s=new Uint8Array(be.Buffer.from(r,"base64"));t==="APPLE2EU"&&(s[15035]=5),P.set(s,He)},Vn=t=>{t=Math.max(64,Math.min(8192,t));const e=Kt;if(Kt=Math.floor(t/64)-1,Kt===e)return;me()>Kt&&(Jn(0),Xt());const r=Xn+(Kt+1)*65536;if(Kt<e)P=P.slice(0,r);else{const s=P;P=new Uint8Array(r).fill(255),P.set(s)}},Ba=()=>{const t=C.RAMRD.isSet?Me+me()*256:0,e=C.RAMWRT.isSet?Me+me()*256:0,r=C.PAGE2.isSet?Me+me()*256:0,s=C.STORE80.isSet?r:t,a=C.STORE80.isSet?r:e,h=C.STORE80.isSet&&C.HIRES.isSet?r:t,f=C.STORE80.isSet&&C.HIRES.isSet?r:e;for(let u=2;u<256;u++)At[u]=u+t,Rt[u]=u+e;for(let u=4;u<=7;u++)At[u]=u+s,Rt[u]=u+a;for(let u=32;u<=63;u++)At[u]=u+h,Rt[u]=u+f},ma=()=>{const t=C.ALTZP.isSet?Me+me()*256:0;if(At[0]=t,At[1]=1+t,Rt[0]=t,Rt[1]=1+t,C.BSRREADRAM.isSet){for(let e=208;e<=255;e++)At[e]=e+t;if(!C.BSRBANK2.isSet)for(let e=208;e<=223;e++)At[e]=e-16+t}else for(let e=208;e<=255;e++)At[e]=je+e-192},Da=()=>{const t=C.ALTZP.isSet?Me+me()*256:0,e=C.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Rt[r]=-1;if(e){for(let r=208;r<=255;r++)Rt[r]=r+t;if(!C.BSRBANK2.isSet)for(let r=208;r<=223;r++)Rt[r]=r-16+t}},jn=t=>C.INTCXROM.isSet?!1:t!==3?!0:C.SLOTC3ROM.isSet,da=()=>!!(C.INTCXROM.isSet||C.INTC8ROM.isSet),Hn=t=>{if(t<=7){if(C.INTCXROM.isSet)return;t===3&&!C.SLOTC3ROM.isSet&&(C.INTC8ROM.isSet||(C.INTC8ROM.isSet=!0,Mr(255),Xt())),Zn()===0&&bs[t]&&(Mr(t),Xt())}else C.INTC8ROM.isSet=!1,Mr(0),Xt()},ka=()=>{At[192]=je-192;for(let t=1;t<=7;t++){const e=192+t;At[e]=t+(jn(t)?ws-1:je)}if(da())for(let t=200;t<=207;t++)At[t]=je+t-192;else{const t=Ts+8*(Zn()-1);for(let e=0;e<=7;e++){const r=200+e;At[r]=t+e}}},Xt=()=>{Ba(),ma(),Da(),ka();for(let t=0;t<256;t++)At[t]=256*At[t],Rt[t]=256*Rt[t]},ys=new Map,Ps=new Array(8),bs=new Uint8Array(8),Lr=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Hn(r),!jn(r)))return;const s=Ps[r];if(s!==void 0){const a=s(t,e);if(a>=0){const h=t>=49408?br-256:He;P[t-49152+h]=a}}},er=(t,e)=>{Gn[t]=1,Ps[t]=e},Ue=(t,e,r=0,s=()=>{})=>{if(P.set(e.slice(0,256),br+(t-1)*256),Gn[t]=e.some(a=>a!==0)?1:0,e.length>256){const a=e.length>2304?2304:e.length,h=Ea+(t-1)*2048;P.set(e.slice(256,a),h),bs[t]=255}r&&ys.set(r,s)},wa=()=>{P.fill(255,0,65536),P.fill(255,Xn),Mr(0),Jn(0),Xt()},Ta=t=>(t>=49296?Lr(t):us(t,!1,c.cycleCount),t>=49232&&Xt(),P[He+t-49152]),G=(t,e)=>{const r=br+(t-1)*256+(e&255);return P[r]},O=(t,e,r)=>{if(r>=0){const s=br+(t-1)*256+(e&255);P[s]=r&255}},B=(t,e=!0)=>{let r=0;const s=t>>>8;if(s===192)r=Ta(t);else if(r=-1,s>=193&&s<=199?(s==195&&(C.INTCXROM.isSet||!C.SLOTC3ROM.isSet)?r=Ca.read(t):jn(s-192)&&!Gn[s-192]&&(r=Math.floor(256*Math.random())),Lr(t)):t===53247&&Hn(255),r<0){const a=At[s];r=P[a+(t&255)]}return e&&Cs(t,r,!1)&&Ds(),r},Ra=t=>{const e=t>>>8,r=At[e];return P[r+(t&255)]},ya=(t,e)=>{if(t===49265||t===49267){if(e>Kt)return;Jn(e)}else t>=49296?Lr(t,e):us(t,!0,c.cycleCount);(t<=49167||t>=49232)&&Xt()},D=(t,e)=>{const r=t>>>8;if(r===192)ya(t,e);else{r>=193&&r<=199?Lr(t,e):t===53247&&Hn(255);const s=Rt[r];if(s<0)return;P[s+(t&255)]=e}Cs(t,e,!0)&&Ds()},ft=t=>P[He+t-49152],Z=(t,e,r=1)=>{const s=He+t-49152;P.fill(e,s,s+r)},vn=1024,Ms=2048,Qr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],$n=(t=!1)=>{let e=0,r=24,s=!1;if(t){if(C.TEXT.isSet||C.HIRES.isSet)return new Uint8Array;r=C.MIXED.isSet?20:24,s=C.COLUMN80.isSet&&C.DHIRES.isSet}else{if(!C.TEXT.isSet&&!C.MIXED.isSet)return new Uint8Array;!C.TEXT.isSet&&C.MIXED.isSet&&(e=20),s=C.COLUMN80.isSet}if(s){const u=C.PAGE2.isSet&&!C.STORE80.isSet?Ms:vn,m=new Uint8Array(80*(r-e)).fill(160);for(let b=e;b<r;b++){const w=80*(b-e);for(let W=0;W<40;W++)m[w+2*W+1]=P[u+Qr[b]+W],m[w+2*W]=P[Wt+u+Qr[b]+W]}return m}if(C.DHIRES.isSet&&!C.COLUMN80.isSet&&C.STORE80.isSet){const u=new Uint8Array(80*(r-e));for(let m=e;m<r;m++){const b=80*(m-e);let w=vn+Qr[m];u.set(P.slice(w,w+40),b),w+=Wt,u.set(P.slice(w,w+40),b+40)}return u}const h=C.PAGE2.isSet&&!C.STORE80.isSet?Ms:vn,f=new Uint8Array(40*(r-e));for(let u=e;u<r;u++){const m=40*(u-e),b=h+Qr[u];f.set(P.slice(b,b+40),m)}return f},zn=()=>be.Buffer.from($n().map(t=>t&=127)).toString(),Pa=()=>{if(C.TEXT.isSet||!C.HIRES.isSet)return new Uint8Array;const t=C.DHIRES.isSet&&C.COLUMN80.isSet,e=C.DHIRES.isSet&&!C.COLUMN80.isSet&&C.STORE80.isSet,r=C.MIXED.isSet?160:192;if(t||C.VIDEO7_MONO.isSet||C.VIDEO7_160.isSet||e){const s=C.PAGE2.isSet&&!C.STORE80.isSet?16384:8192,a=new Uint8Array(80*r);for(let h=0;h<r;h++){const f=uA(s,h);for(let u=0;u<40;u++)a[h*80+2*u+1]=P[f+u],a[h*80+2*u]=P[Wt+f+u]}return a}else{const s=C.PAGE2.isSet?16384:8192,a=new Uint8Array(40*r);for(let h=0;h<r;h++){const f=s+40*Math.trunc(h/64)+1024*(h%8)+128*(Math.trunc(h/8)&7);a.set(P.slice(f,f+40),h*40)}return a}},to=t=>{const e=At[t>>>8]+(t&255);return P.slice(e,e+512)},eo=(t,e)=>{const r=Rt[t>>>8]+(t&255);P.set(e,r)},ro=(t,e)=>{for(let r=0;r<e.length;r++)if(B(t+r,!1)!==e[r])return!1;return!0},ba=()=>P.slice(0,Wt+65536),c=AA(),rr=t=>{c.Accum=t},nr=t=>{c.XReg=t},or=t=>{c.YReg=t},sr=t=>{c.cycleCount=t},Ls=t=>{Qs(),Object.assign(c,t)},Qs=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,qt(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},Fs=t=>{qt((c.PC+t+65536)%65536)},qt=t=>{c.PC=t},Us=t=>{c.PStatus=t|48},Ma=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),La=()=>`A=${U(c.Accum)} X=${U(c.XReg)} Y=${U(c.YReg)} P=${U(c.PStatus)} ${Ma(c.PStatus)} S=${U(c.StackPtr)}`,Ot=new Array(256).fill(""),Qa=()=>Ot.slice(0,256),Fa=t=>{Ot.splice(0,t.length,...t)},Ua=()=>{const t=to(256).slice(0,256),e=new Array;for(let r=255;r>c.StackPtr;r--){let s="$"+U(t[r]),a=Ot[r];Ot[r].length>3&&r-1>c.StackPtr&&(Ot[r-1]==="JSR"||Ot[r-1]==="BRK"||Ot[r-1]==="IRQ"?(r--,s+=U(t[r])):a=""),s=(s+"   ").substring(0,6),e.push(U(256+r,4)+": "+s+a)}return e.join(`
`)},Ka=()=>{const t=to(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const r=t[e];if(Ot[e].startsWith("JSR")&&e-1>c.StackPtr&&Ot[e-1]==="JSR"){const s=t[e-1]+1;return(r<<8)+s}}return-1},Gt=(t,e)=>{Ot[c.StackPtr]=t,D(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},Zt=()=>{c.StackPtr=(c.StackPtr+1)%256;const t=B(256+c.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},yt=()=>(c.PStatus&1)!==0,K=(t=!0)=>c.PStatus=t?c.PStatus|1:c.PStatus&254,Ks=()=>(c.PStatus&2)!==0,ir=(t=!0)=>c.PStatus=t?c.PStatus|2:c.PStatus&253,qa=()=>(c.PStatus&4)!==0,no=(t=!0)=>c.PStatus=t?c.PStatus|4:c.PStatus&251,qs=()=>(c.PStatus&8)!==0,ot=()=>qs()?1:0,oo=(t=!0)=>c.PStatus=t?c.PStatus|8:c.PStatus&247,so=(t=!0)=>c.PStatus=t?c.PStatus|16:c.PStatus&239,Os=()=>(c.PStatus&64)!==0,Ar=(t=!0)=>c.PStatus=t?c.PStatus|64:c.PStatus&191,Ns=()=>(c.PStatus&128)!==0,Ys=(t=!0)=>c.PStatus=t?c.PStatus|128:c.PStatus&127,T=t=>{ir(t===0),Ys(t>=128)},Q=(t,e)=>(t+e+256)%256,d=(t,e)=>e*256+t,N=(t,e,r)=>(e*256+t+r+65536)%65536,$=(t,e)=>t>>8!==e>>8?1:0,Jt=(t,e)=>{if(t){const r=c.PC;return Fs(e>127?e-256:e),3+$(r+2,c.PC+2)}return 2},H=new Array(256),I=(t,e,r,s,a,h=!1)=>{console.assert(!H[r],"Duplicate instruction: "+t+" mode="+e),H[r]={name:t,pcode:r,mode:e,bytes:s,execute:a,is6502:!h}},J=!0,zt=(t,e,r)=>{const s=B(t),a=B((t+1)%256),h=N(s,a,c.YReg);e(h);let f=5+$(h,d(s,a));return r&&(f+=ot()),f},te=(t,e,r)=>{const s=B(t),a=B((t+1)%256),h=d(s,a);e(h);let f=5;return r&&(f+=ot()),f},_s=t=>{let e=(c.Accum&15)+(t&15)+(yt()?1:0);e>=10&&(e+=6);let r=(c.Accum&240)+(t&240)+e;const s=c.Accum<=127&&t<=127,a=c.Accum>=128&&t>=128;Ar((r&255)>=128?s:a),K(r>=160),yt()&&(r+=96),c.Accum=r&255,T(c.Accum)},Fr=t=>{let e=c.Accum+t+(yt()?1:0);K(e>=256),e=e%256;const r=c.Accum<=127&&t<=127,s=c.Accum>=128&&t>=128;Ar(e>=128?r:s),c.Accum=e,T(c.Accum)},ee=t=>{qs()?_s(B(t)):Fr(B(t))};I("ADC",i.IMM,105,2,t=>(ot()?_s(t):Fr(t),2+ot())),I("ADC",i.ZP_REL,101,2,t=>(ee(t),3+ot())),I("ADC",i.ZP_X,117,2,t=>(ee(Q(t,c.XReg)),4+ot())),I("ADC",i.ABS,109,3,(t,e)=>(ee(d(t,e)),4+ot())),I("ADC",i.ABS_X,125,3,(t,e)=>{const r=N(t,e,c.XReg);return ee(r),4+ot()+$(r,d(t,e))}),I("ADC",i.ABS_Y,121,3,(t,e)=>{const r=N(t,e,c.YReg);return ee(r),4+ot()+$(r,d(t,e))}),I("ADC",i.IND_X,97,2,t=>{const e=Q(t,c.XReg);return ee(d(B(e),B(e+1))),6+ot()}),I("ADC",i.IND_Y,113,2,t=>zt(t,ee,!0)),I("ADC",i.IND,114,2,t=>te(t,ee,!0),J);const re=t=>{c.Accum&=B(t),T(c.Accum)};I("AND",i.IMM,41,2,t=>(c.Accum&=t,T(c.Accum),2)),I("AND",i.ZP_REL,37,2,t=>(re(t),3)),I("AND",i.ZP_X,53,2,t=>(re(Q(t,c.XReg)),4)),I("AND",i.ABS,45,3,(t,e)=>(re(d(t,e)),4)),I("AND",i.ABS_X,61,3,(t,e)=>{const r=N(t,e,c.XReg);return re(r),4+$(r,d(t,e))}),I("AND",i.ABS_Y,57,3,(t,e)=>{const r=N(t,e,c.YReg);return re(r),4+$(r,d(t,e))}),I("AND",i.IND_X,33,2,t=>{const e=Q(t,c.XReg);return re(d(B(e),B(e+1))),6}),I("AND",i.IND_Y,49,2,t=>zt(t,re,!1)),I("AND",i.IND,50,2,t=>te(t,re,!1),J);const Ur=t=>{let e=B(t);B(t),K((e&128)===128),e=(e<<1)%256,D(t,e),T(e)};I("ASL",i.IMPLIED,10,1,()=>(K((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,T(c.Accum),2)),I("ASL",i.ZP_REL,6,2,t=>(Ur(t),5)),I("ASL",i.ZP_X,22,2,t=>(Ur(Q(t,c.XReg)),6)),I("ASL",i.ABS,14,3,(t,e)=>(Ur(d(t,e)),6)),I("ASL",i.ABS_X,30,3,(t,e)=>{const r=N(t,e,c.XReg);return Ur(r),6+$(r,d(t,e))}),I("BCC",i.ZP_REL,144,2,t=>Jt(!yt(),t)),I("BCS",i.ZP_REL,176,2,t=>Jt(yt(),t)),I("BEQ",i.ZP_REL,240,2,t=>Jt(Ks(),t)),I("BMI",i.ZP_REL,48,2,t=>Jt(Ns(),t)),I("BNE",i.ZP_REL,208,2,t=>Jt(!Ks(),t)),I("BPL",i.ZP_REL,16,2,t=>Jt(!Ns(),t)),I("BVC",i.ZP_REL,80,2,t=>Jt(!Os(),t)),I("BVS",i.ZP_REL,112,2,t=>Jt(Os(),t)),I("BRA",i.ZP_REL,128,2,t=>Jt(!0,t),J);const Kr=t=>{ir((c.Accum&t)===0),Ys((t&128)!==0),Ar((t&64)!==0)};I("BIT",i.ZP_REL,36,2,t=>(Kr(B(t)),3)),I("BIT",i.ABS,44,3,(t,e)=>(Kr(B(d(t,e))),4)),I("BIT",i.IMM,137,2,t=>(ir((c.Accum&t)===0),2),J),I("BIT",i.ZP_X,52,2,t=>(Kr(B(Q(t,c.XReg))),4),J),I("BIT",i.ABS_X,60,3,(t,e)=>{const r=N(t,e,c.XReg);return Kr(B(r)),4+$(r,d(t,e))},J);const io=(t,e,r=0)=>{const s=(c.PC+r)%65536,a=B(e),h=B(e+1);Gt(`${t} $`+U(h)+U(a),Math.trunc(s/256)),Gt(t,s%256),Gt("P",c.PStatus),oo(!1),no();const f=N(a,h,t==="BRK"?-1:0);qt(f)},xs=()=>(so(),io("BRK",65534,2),7);I("BRK",i.IMPLIED,0,1,xs);const Oa=()=>qa()?0:(so(!1),io("IRQ",65534),7),Na=()=>(io("NMI",65530),7);I("CLC",i.IMPLIED,24,1,()=>(K(!1),2)),I("CLD",i.IMPLIED,216,1,()=>(oo(!1),2)),I("CLI",i.IMPLIED,88,1,()=>(no(!1),2)),I("CLV",i.IMPLIED,184,1,()=>(Ar(!1),2));const De=t=>{const e=B(t);K(c.Accum>=e),T((c.Accum-e+256)%256)},Ya=t=>{const e=B(t);K(c.Accum>=e),T((c.Accum-e+256)%256)};I("CMP",i.IMM,201,2,t=>(K(c.Accum>=t),T((c.Accum-t+256)%256),2)),I("CMP",i.ZP_REL,197,2,t=>(De(t),3)),I("CMP",i.ZP_X,213,2,t=>(De(Q(t,c.XReg)),4)),I("CMP",i.ABS,205,3,(t,e)=>(De(d(t,e)),4)),I("CMP",i.ABS_X,221,3,(t,e)=>{const r=N(t,e,c.XReg);return Ya(r),4+$(r,d(t,e))}),I("CMP",i.ABS_Y,217,3,(t,e)=>{const r=N(t,e,c.YReg);return De(r),4+$(r,d(t,e))}),I("CMP",i.IND_X,193,2,t=>{const e=Q(t,c.XReg);return De(d(B(e),B(e+1))),6}),I("CMP",i.IND_Y,209,2,t=>zt(t,De,!1)),I("CMP",i.IND,210,2,t=>te(t,De,!1),J);const Ws=t=>{const e=B(t);K(c.XReg>=e),T((c.XReg-e+256)%256)};I("CPX",i.IMM,224,2,t=>(K(c.XReg>=t),T((c.XReg-t+256)%256),2)),I("CPX",i.ZP_REL,228,2,t=>(Ws(t),3)),I("CPX",i.ABS,236,3,(t,e)=>(Ws(d(t,e)),4));const Xs=t=>{const e=B(t);K(c.YReg>=e),T((c.YReg-e+256)%256)};I("CPY",i.IMM,192,2,t=>(K(c.YReg>=t),T((c.YReg-t+256)%256),2)),I("CPY",i.ZP_REL,196,2,t=>(Xs(t),3)),I("CPY",i.ABS,204,3,(t,e)=>(Xs(d(t,e)),4));const qr=t=>{const e=Q(B(t),-1);D(t,e),T(e)};I("DEC",i.IMPLIED,58,1,()=>(c.Accum=Q(c.Accum,-1),T(c.Accum),2),J),I("DEC",i.ZP_REL,198,2,t=>(qr(t),5)),I("DEC",i.ZP_X,214,2,t=>(qr(Q(t,c.XReg)),6)),I("DEC",i.ABS,206,3,(t,e)=>(qr(d(t,e)),6)),I("DEC",i.ABS_X,222,3,(t,e)=>{const r=N(t,e,c.XReg);return B(r),qr(r),7}),I("DEX",i.IMPLIED,202,1,()=>(c.XReg=Q(c.XReg,-1),T(c.XReg),2)),I("DEY",i.IMPLIED,136,1,()=>(c.YReg=Q(c.YReg,-1),T(c.YReg),2));const ne=t=>{c.Accum^=B(t),T(c.Accum)};I("EOR",i.IMM,73,2,t=>(c.Accum^=t,T(c.Accum),2)),I("EOR",i.ZP_REL,69,2,t=>(ne(t),3)),I("EOR",i.ZP_X,85,2,t=>(ne(Q(t,c.XReg)),4)),I("EOR",i.ABS,77,3,(t,e)=>(ne(d(t,e)),4)),I("EOR",i.ABS_X,93,3,(t,e)=>{const r=N(t,e,c.XReg);return ne(r),4+$(r,d(t,e))}),I("EOR",i.ABS_Y,89,3,(t,e)=>{const r=N(t,e,c.YReg);return ne(r),4+$(r,d(t,e))}),I("EOR",i.IND_X,65,2,t=>{const e=Q(t,c.XReg);return ne(d(B(e),B(e+1))),6}),I("EOR",i.IND_Y,81,2,t=>zt(t,ne,!1)),I("EOR",i.IND,82,2,t=>te(t,ne,!1),J);const Or=t=>{const e=Q(B(t),1);D(t,e),T(e)};I("INC",i.IMPLIED,26,1,()=>(c.Accum=Q(c.Accum,1),T(c.Accum),2),J),I("INC",i.ZP_REL,230,2,t=>(Or(t),5)),I("INC",i.ZP_X,246,2,t=>(Or(Q(t,c.XReg)),6)),I("INC",i.ABS,238,3,(t,e)=>(Or(d(t,e)),6)),I("INC",i.ABS_X,254,3,(t,e)=>{const r=N(t,e,c.XReg);return B(r),Or(r),7}),I("INX",i.IMPLIED,232,1,()=>(c.XReg=Q(c.XReg,1),T(c.XReg),2)),I("INY",i.IMPLIED,200,1,()=>(c.YReg=Q(c.YReg,1),T(c.YReg),2)),I("JMP",i.ABS,76,3,(t,e)=>(qt(N(t,e,-3)),3)),I("JMP",i.IND,108,3,(t,e)=>{const r=d(t,e);return t=B(r),e=B((r+1)%65536),qt(N(t,e,-3)),6}),I("JMP",i.IND_X,124,3,(t,e)=>{const r=N(t,e,c.XReg);return t=B(r),e=B((r+1)%65536),qt(N(t,e,-3)),6},J),I("JSR",i.ABS,32,3,(t,e)=>{const r=(c.PC+2)%65536;return Gt("JSR $"+U(e)+U(t),Math.trunc(r/256)),Gt("JSR",r%256),qt(N(t,e,-3)),6});const oe=t=>{c.Accum=B(t),T(c.Accum)};I("LDA",i.IMM,169,2,t=>(c.Accum=t,T(c.Accum),2)),I("LDA",i.ZP_REL,165,2,t=>(oe(t),3)),I("LDA",i.ZP_X,181,2,t=>(oe(Q(t,c.XReg)),4)),I("LDA",i.ABS,173,3,(t,e)=>(oe(d(t,e)),4)),I("LDA",i.ABS_X,189,3,(t,e)=>{const r=N(t,e,c.XReg);return oe(r),4+$(r,d(t,e))}),I("LDA",i.ABS_Y,185,3,(t,e)=>{const r=N(t,e,c.YReg);return oe(r),4+$(r,d(t,e))}),I("LDA",i.IND_X,161,2,t=>{const e=Q(t,c.XReg);return oe(d(B(e),B((e+1)%256))),6}),I("LDA",i.IND_Y,177,2,t=>zt(t,oe,!1)),I("LDA",i.IND,178,2,t=>te(t,oe,!1),J);const Nr=t=>{c.XReg=B(t),T(c.XReg)};I("LDX",i.IMM,162,2,t=>(c.XReg=t,T(c.XReg),2)),I("LDX",i.ZP_REL,166,2,t=>(Nr(t),3)),I("LDX",i.ZP_Y,182,2,t=>(Nr(Q(t,c.YReg)),4)),I("LDX",i.ABS,174,3,(t,e)=>(Nr(d(t,e)),4)),I("LDX",i.ABS_Y,190,3,(t,e)=>{const r=N(t,e,c.YReg);return Nr(r),4+$(r,d(t,e))});const Yr=t=>{c.YReg=B(t),T(c.YReg)};I("LDY",i.IMM,160,2,t=>(c.YReg=t,T(c.YReg),2)),I("LDY",i.ZP_REL,164,2,t=>(Yr(t),3)),I("LDY",i.ZP_X,180,2,t=>(Yr(Q(t,c.XReg)),4)),I("LDY",i.ABS,172,3,(t,e)=>(Yr(d(t,e)),4)),I("LDY",i.ABS_X,188,3,(t,e)=>{const r=N(t,e,c.XReg);return Yr(r),4+$(r,d(t,e))});const _r=t=>{let e=B(t);B(t),K((e&1)===1),e>>=1,D(t,e),T(e)};I("LSR",i.IMPLIED,74,1,()=>(K((c.Accum&1)===1),c.Accum>>=1,T(c.Accum),2)),I("LSR",i.ZP_REL,70,2,t=>(_r(t),5)),I("LSR",i.ZP_X,86,2,t=>(_r(Q(t,c.XReg)),6)),I("LSR",i.ABS,78,3,(t,e)=>(_r(d(t,e)),6)),I("LSR",i.ABS_X,94,3,(t,e)=>{const r=N(t,e,c.XReg);return _r(r),6+$(r,d(t,e))}),I("NOP",i.IMPLIED,234,1,()=>2);const se=t=>{c.Accum|=B(t),T(c.Accum)};I("ORA",i.IMM,9,2,t=>(c.Accum|=t,T(c.Accum),2)),I("ORA",i.ZP_REL,5,2,t=>(se(t),3)),I("ORA",i.ZP_X,21,2,t=>(se(Q(t,c.XReg)),4)),I("ORA",i.ABS,13,3,(t,e)=>(se(d(t,e)),4)),I("ORA",i.ABS_X,29,3,(t,e)=>{const r=N(t,e,c.XReg);return se(r),4+$(r,d(t,e))}),I("ORA",i.ABS_Y,25,3,(t,e)=>{const r=N(t,e,c.YReg);return se(r),4+$(r,d(t,e))}),I("ORA",i.IND_X,1,2,t=>{const e=Q(t,c.XReg);return se(d(B(e),B(e+1))),6}),I("ORA",i.IND_Y,17,2,t=>zt(t,se,!1)),I("ORA",i.IND,18,2,t=>te(t,se,!1),J),I("PHA",i.IMPLIED,72,1,()=>(Gt("PHA",c.Accum),3)),I("PHP",i.IMPLIED,8,1,()=>(Gt("PHP",c.PStatus|16),3)),I("PHX",i.IMPLIED,218,1,()=>(Gt("PHX",c.XReg),3),J),I("PHY",i.IMPLIED,90,1,()=>(Gt("PHY",c.YReg),3),J),I("PLA",i.IMPLIED,104,1,()=>(c.Accum=Zt(),T(c.Accum),4)),I("PLP",i.IMPLIED,40,1,()=>(Us(Zt()),4)),I("PLX",i.IMPLIED,250,1,()=>(c.XReg=Zt(),T(c.XReg),4),J),I("PLY",i.IMPLIED,122,1,()=>(c.YReg=Zt(),T(c.YReg),4),J);const xr=t=>{let e=B(t);B(t);const r=yt()?1:0;K((e&128)===128),e=(e<<1)%256|r,D(t,e),T(e)};I("ROL",i.IMPLIED,42,1,()=>{const t=yt()?1:0;return K((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|t,T(c.Accum),2}),I("ROL",i.ZP_REL,38,2,t=>(xr(t),5)),I("ROL",i.ZP_X,54,2,t=>(xr(Q(t,c.XReg)),6)),I("ROL",i.ABS,46,3,(t,e)=>(xr(d(t,e)),6)),I("ROL",i.ABS_X,62,3,(t,e)=>{const r=N(t,e,c.XReg);return xr(r),6+$(r,d(t,e))});const Wr=t=>{let e=B(t);B(t);const r=yt()?128:0;K((e&1)===1),e=e>>1|r,D(t,e),T(e)};I("ROR",i.IMPLIED,106,1,()=>{const t=yt()?128:0;return K((c.Accum&1)===1),c.Accum=c.Accum>>1|t,T(c.Accum),2}),I("ROR",i.ZP_REL,102,2,t=>(Wr(t),5)),I("ROR",i.ZP_X,118,2,t=>(Wr(Q(t,c.XReg)),6)),I("ROR",i.ABS,110,3,(t,e)=>(Wr(d(t,e)),6)),I("ROR",i.ABS_X,126,3,(t,e)=>{const r=N(t,e,c.XReg);return Wr(r),6+$(r,d(t,e))}),I("RTI",i.IMPLIED,64,1,()=>(Us(Zt()),so(!1),qt(d(Zt(),Zt())-1),6)),I("RTS",i.IMPLIED,96,1,()=>(qt(d(Zt(),Zt())),6));const Gs=t=>{const e=255-t;let r=c.Accum+e+(yt()?1:0);const s=r>=256,a=c.Accum<=127&&e<=127,h=c.Accum>=128&&e>=128;Ar(r%256>=128?a:h);const f=(c.Accum&15)-(t&15)+(yt()?0:-1);r=c.Accum-t+(yt()?0:-1),r<0&&(r-=96),f<0&&(r-=6),c.Accum=r&255,T(c.Accum),K(s)},ie=t=>{ot()?Gs(B(t)):Fr(255-B(t))};I("SBC",i.IMM,233,2,t=>(ot()?Gs(t):Fr(255-t),2+ot())),I("SBC",i.ZP_REL,229,2,t=>(ie(t),3+ot())),I("SBC",i.ZP_X,245,2,t=>(ie(Q(t,c.XReg)),4+ot())),I("SBC",i.ABS,237,3,(t,e)=>(ie(d(t,e)),4+ot())),I("SBC",i.ABS_X,253,3,(t,e)=>{const r=N(t,e,c.XReg);return ie(r),4+ot()+$(r,d(t,e))}),I("SBC",i.ABS_Y,249,3,(t,e)=>{const r=N(t,e,c.YReg);return ie(r),4+ot()+$(r,d(t,e))}),I("SBC",i.IND_X,225,2,t=>{const e=Q(t,c.XReg);return ie(d(B(e),B(e+1))),6+ot()}),I("SBC",i.IND_Y,241,2,t=>zt(t,ie,!0)),I("SBC",i.IND,242,2,t=>te(t,ie,!0),J),I("SEC",i.IMPLIED,56,1,()=>(K(),2)),I("SED",i.IMPLIED,248,1,()=>(oo(),2)),I("SEI",i.IMPLIED,120,1,()=>(no(),2)),I("STA",i.ZP_REL,133,2,t=>(D(t,c.Accum),3)),I("STA",i.ZP_X,149,2,t=>(D(Q(t,c.XReg),c.Accum),4)),I("STA",i.ABS,141,3,(t,e)=>(D(d(t,e),c.Accum),4)),I("STA",i.ABS_X,157,3,(t,e)=>{const r=N(t,e,c.XReg);return B(r),D(r,c.Accum),5}),I("STA",i.ABS_Y,153,3,(t,e)=>(D(N(t,e,c.YReg),c.Accum),5)),I("STA",i.IND_X,129,2,t=>{const e=Q(t,c.XReg);return D(d(B(e),B(e+1)),c.Accum),6});const Zs=t=>{D(t,c.Accum)};I("STA",i.IND_Y,145,2,t=>(zt(t,Zs,!1),6)),I("STA",i.IND,146,2,t=>te(t,Zs,!1),J),I("STX",i.ZP_REL,134,2,t=>(D(t,c.XReg),3)),I("STX",i.ZP_Y,150,2,t=>(D(Q(t,c.YReg),c.XReg),4)),I("STX",i.ABS,142,3,(t,e)=>(D(d(t,e),c.XReg),4)),I("STY",i.ZP_REL,132,2,t=>(D(t,c.YReg),3)),I("STY",i.ZP_X,148,2,t=>(D(Q(t,c.XReg),c.YReg),4)),I("STY",i.ABS,140,3,(t,e)=>(D(d(t,e),c.YReg),4)),I("STZ",i.ZP_REL,100,2,t=>(D(t,0),3),J),I("STZ",i.ZP_X,116,2,t=>(D(Q(t,c.XReg),0),4),J),I("STZ",i.ABS,156,3,(t,e)=>(D(d(t,e),0),4),J),I("STZ",i.ABS_X,158,3,(t,e)=>{const r=N(t,e,c.XReg);return B(r),D(r,0),5},J),I("TAX",i.IMPLIED,170,1,()=>(c.XReg=c.Accum,T(c.XReg),2)),I("TAY",i.IMPLIED,168,1,()=>(c.YReg=c.Accum,T(c.YReg),2)),I("TSX",i.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,T(c.XReg),2)),I("TXA",i.IMPLIED,138,1,()=>(c.Accum=c.XReg,T(c.Accum),2)),I("TXS",i.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),I("TYA",i.IMPLIED,152,1,()=>(c.Accum=c.YReg,T(c.Accum),2));const Js=t=>{const e=B(t);ir((c.Accum&e)===0),D(t,e&~c.Accum)};I("TRB",i.ZP_REL,20,2,t=>(Js(t),5),J),I("TRB",i.ABS,28,3,(t,e)=>(Js(d(t,e)),6),J);const Vs=t=>{const e=B(t);ir((c.Accum&e)===0),D(t,e|c.Accum)};I("TSB",i.ZP_REL,4,2,t=>(Vs(t),5),J),I("TSB",i.ABS,12,3,(t,e)=>(Vs(d(t,e)),6),J);const _a=[2,34,66,98,130,194,226],Pt="???";_a.forEach(t=>{I(Pt,i.IMPLIED,t,2,()=>2),H[t].is6502=!1});for(let t=0;t<=15;t++)I(Pt,i.IMPLIED,3+16*t,1,()=>1),H[3+16*t].is6502=!1,I(Pt,i.IMPLIED,7+16*t,1,()=>1),H[7+16*t].is6502=!1,I(Pt,i.IMPLIED,11+16*t,1,()=>1),H[11+16*t].is6502=!1,I(Pt,i.IMPLIED,15+16*t,1,()=>1),H[15+16*t].is6502=!1;I(Pt,i.IMPLIED,68,2,()=>3),H[68].is6502=!1,I(Pt,i.IMPLIED,84,2,()=>4),H[84].is6502=!1,I(Pt,i.IMPLIED,212,2,()=>4),H[212].is6502=!1,I(Pt,i.IMPLIED,244,2,()=>4),H[244].is6502=!1,I(Pt,i.IMPLIED,92,3,()=>8),H[92].is6502=!1,I(Pt,i.IMPLIED,220,3,()=>4),H[220].is6502=!1,I(Pt,i.IMPLIED,252,3,()=>4),H[252].is6502=!1;for(let t=0;t<256;t++)H[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",i.IMPLIED,t,1,xs));const xa=()=>{const t=new Array(256);for(let e=0;e<256;e++)t[e]={name:H[e].name,mode:H[e].mode,pcode:H[e].pcode,bytes:H[e].bytes,is6502:H[e].is6502};z1(t)},gt=(t,e,r)=>{const s=e&7,a=e>>>3;return t[a]|=r>>>s,s&&(t[a+1]|=r<<8-s),e+8},Xr=(t,e,r)=>(e=gt(t,e,r>>>1|170),e=gt(t,e,r|170),e),Ao=(t,e)=>(e=gt(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Wa=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),s=[0,2,1,3];for(let h=0;h<84;h++)r[h]=s[t[h]&3]|s[t[h+86]&3]<<2|s[t[h+172]&3]<<4;r[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,r[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Xa=(t,e,r)=>{let s=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)s=Ao(a,s);for(let h=0;h<16;h++){s=gt(a,s,213),s=gt(a,s,170),s=gt(a,s,150),s=Xr(a,s,254),s=Xr(a,s,e),s=Xr(a,s,h),s=Xr(a,s,254^e^h),s=gt(a,s,222),s=gt(a,s,170),s=gt(a,s,235);for(let m=0;m<7;m++)s=Ao(a,s);s=gt(a,s,213),s=gt(a,s,170),s=gt(a,s,173);const f=h===15?15:h*(r?8:7)%15,u=Wa(t.slice(f*256,f*256+256));for(let m=0;m<u.length;m++)s=gt(a,s,u[m]);s=gt(a,s,222),s=gt(a,s,170),s=gt(a,s,235);for(let m=0;m<16;m++)s=Ao(a,s)}return a},Ga=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const s=new Uint8Array(1536+r*13*512).fill(0);s.set(ve(`WOZ2ÿ
\r
`),0),s.set(ve("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(ve("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(ve("TMAP"),80),s[84]=160,s.fill(255,88,248);let a=0;for(let h=0;h<r;h++)a=88+(h<<2),h>0&&(s[a-1]=h),s[a]=s[a+1]=h;s.set(ve("TRKS"),248),s.set(qo(1280+r*13*512),252);for(let h=0;h<r;h++){a=256+(h<<3),s.set(aA(3+h*13),a),s[a+2]=13,s.set(qo(50304),a+4);const f=t.slice(h*16*256,(h+1)*16*256),u=Xa(f,h,e);a=1536+h*13*512,s.set(u,a)}return s},Za=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,m)=>u!==e[m])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1,t.optimalTiming=e[59]>0?e[59]:32,t.optimalTiming!==32&&console.log(`${t.filename} optimal timing = ${t.optimalTiming}`);const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,f=lA(e,12);if(h!==0&&h!==f)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<160;u++){const m=e[88+u];if(m<255){const b=256+8*m,w=e.slice(b,b+8);t.trackStart[u]=512*((w[1]<<8)+w[0]),t.trackNbits[u]=w[4]+(w[5]<<8)+(w[6]<<16)+w[7]*2**24,t.maxQuarterTrack=u}}return!0},Ja=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<160;a++){const h=e[88+a];if(h<255){t.trackStart[a]=256+h*6656;const f=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=f[2]+(f[3]<<8),t.maxQuarterTrack=a}}return!0},Va=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return r||s},ja=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),a=Ga(e,s);return a.length===0?new Uint8Array:(t.filename=Oo(t.filename,"woz"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),a)},js=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Ha=(t,e)=>{const r=js(e.slice(24,28)),s=js(e.slice(28,32));let a="";for(let h=0;h<iA;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Oo(t.filename,"hdv"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),e.slice(r,r+s))},va=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(e.length>1e4){if(No(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return Ha(t,e)}if((Va(t.filename)||e.length===143360)&&(e=ja(t,e)),Za(t,e)||Ja(t,e))return e}return r!==""&&console.error("Unknown disk format or unable to decode: "+t.filename),new Uint8Array},$a=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ke=0,St=0,Ct=0,Gr=!1,ao=!1;const za=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],tc=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],ec=t=>{Gr=!1,ei(t),t.quarterTrack=t.maxQuarterTrack,t.prevQuarterTrack=t.maxQuarterTrack},rc=(t=!1)=>{if(t){const e=jr();e.motorRunning&&ri(e)}else Ge(ge.MOTOR_OFF)};let Zr=0;const nc=(t,e,r)=>{Zr=0,t.prevQuarterTrack=t.quarterTrack,t.quarterTrack+=e,t.quarterTrack<0||t.quarterTrack>t.maxQuarterTrack?(Ge(ge.TRACK_END),t.quarterTrack=Math.max(0,Math.min(t.quarterTrack,t.maxQuarterTrack))):Ge(ge.TRACK_SEEK),t.status=` Trk ${t.quarterTrack/4}`,Dt(),Ct+=r,t.trackLocation+=Math.floor(Ct/4),Ct=Ct%4,t.quarterTrack!=t.prevQuarterTrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.quarterTrack]/t.trackNbits[t.prevQuarterTrack])))};let Hs=0;const oc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],vs=()=>(Hs++,oc[Hs&31]);let Jr=0;const sc=t=>(Jr<<=1,Jr|=t,Jr&=15,Jr===0?vs():t),$s=[128,64,32,16,8,4,2,1],ic=[127,191,223,239,247,251,253,254],Ac=(t,e)=>{const r=t.trackLocation;t.trackLocation=t.trackLocation%t.trackNbits[t.quarterTrack],r!==t.trackLocation&&(Zr>=9?(Zr=0,t.trackLocation+=4):Zr++);let s;if(t.trackStart[t.quarterTrack]>0){const a=t.trackStart[t.quarterTrack]+(t.trackLocation>>3),h=e[a],f=t.trackLocation&7;s=(h&$s[f])>>7-f,s=sc(s)}else s=vs();return t.trackLocation++,s},ac=()=>Math.floor(256*Math.random()),zs=(t,e,r)=>{if(e.length===0)return ac();let s=0;for(Ct+=r;Ct>=t.optimalTiming/8;){const a=Ac(t,e);if(St&128&&!a||(St&128&&(St=0),St=St<<1|a),Ct-=t.optimalTiming/8,St&128&&Ct<=t.optimalTiming/4)break}return Ct<0&&(Ct=0),St&=255,s=St,s};let Ae=0;const co=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.quarterTrack],t.trackStart[t.quarterTrack]>0){const s=t.trackStart[t.quarterTrack]+(t.trackLocation>>3);let a=e[s];const h=t.trackLocation&7;r?a|=$s[h]:a&=ic[h],e[s]=a}t.trackLocation++},ti=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.quarterTrack]===0)&&St>0){if(r>=16)for(let s=7;s>=0;s--)co(t,e,St&2**s?1:0);r>=36&&co(t,e,0),r>=40&&co(t,e,0),lo.push(r>=40?2:r>=36?1:St),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),St=0}},ei=t=>{Ke=0,Gr||(t.motorRunning=!1),Dt(),Ge(ge.MOTOR_OFF)},ri=t=>{Ke?(clearTimeout(Ke),Ke=0):Ct=0,t.motorRunning=!0,Dt(),Ge(ge.MOTOR_ON)},cc=t=>{Ke===0&&(Ke=setTimeout(()=>ei(t),1e3))};let lo=[];const Vr=t=>{lo.length>0&&t.quarterTrack===0&&(lo=[])},lc=(t,e)=>{if(t>=49408)return-1;let r=jr();const s=Ic();if(r.hardDrive)return 0;let a=0;const h=c.cycleCount-Ae;switch(t=t&15,t){case 9:Gr=!0,ri(r),Vr(r);break;case 8:r.motorRunning&&!r.writeMode&&(a=zs(r,s,h),Ae=c.cycleCount),Gr=!1,cc(r),Vr(r);break;case 10:case 11:{const f=t===10?2:3,u=jr();hc(f),r=jr(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,Dt());break}case 12:ao=!1,r.motorRunning&&!r.writeMode&&(a=zs(r,s,h),Ae=c.cycleCount);break;case 13:ao=!0,r.motorRunning&&(r.writeMode?(ti(r,s,h),Ae=c.cycleCount,e>=0&&(St=e)):(St=0,Ct+=h,r.trackLocation+=Math.floor(Ct/4),Ct=Ct%4,Ae=c.cycleCount,e>=0?console.log(`${r.filename}: Illegal LOAD of write data latch during read: PC=${U(c.PC)} Value=${U(e)}`):console.log(`${r.filename}: Illegal READ of write data latch during read: PC=${U(c.PC)}`)));break;case 14:r.motorRunning&&r.writeMode&&(ti(r,s,h),r.lastWriteTime=Date.now(),Ae=c.cycleCount),r.writeMode=!1,ao&&(a=r.isWriteProtected?255:0),Vr(r);break;case 15:r.writeMode=!0,Ae=c.cycleCount,e>=0&&(St=e);break;default:{if(t<0||t>7)break;const f=t/2;t%2?r.currentPhase|=1<<f:r.currentPhase&=~(1<<f);const m=za[r.currentPhase];if(r.motorRunning&&m>=0){const b=r.quarterTrack&7,w=tc[b][m];nc(r,w,h),Ae=c.cycleCount}Vr(r);break}}return a},uc=()=>{Ue(6,Uint8Array.from($a)),er(6,lc)},Vt=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(160).fill(0),trackNbits:r?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalWriteTime:-1,cloudData:null,writableFileHandle:null,lastWriteTime:-1,optimalTiming:32}),ni=()=>{y[0]=Vt(0,1,!0),y[1]=Vt(1,2,!0),y[2]=Vt(2,1,!1),y[3]=Vt(3,2,!1);for(let t=0;t<y.length;t++)jt[t]=new Uint8Array},y=[],jt=[];ni();let de=2;const hc=t=>{de=t},jr=()=>y[de],Ic=()=>jt[de],uo=t=>y[t==2?1:0],Hr=t=>jt[t==2?1:0],Dt=()=>{for(let t=0;t<y.length;t++){const e={index:t,hardDrive:y[t].hardDrive,drive:y[t].drive,filename:y[t].filename,status:y[t].status,motorRunning:y[t].motorRunning,diskHasChanges:y[t].diskHasChanges,isWriteProtected:y[t].isWriteProtected,diskData:y[t].diskHasChanges?jt[t]:new Uint8Array,lastWriteTime:y[t].lastWriteTime,lastLocalWriteTime:y[t].lastLocalWriteTime,cloudData:y[t].cloudData,writableFileHandle:y[t].writableFileHandle};J1(e)}},gc=t=>{const e=["","",""];for(let s=0;s<y.length;s++)(t||jt[s].length<32e6)&&(e[s]=be.Buffer.from(jt[s]).toString("base64"));const r={currentDrive:de,driveState:[Vt(0,1,!0),Vt(1,2,!0),Vt(2,1,!1),Vt(3,2,!1)],driveData:e};for(let s=0;s<y.length;s++)r.driveState[s]={...y[s]};return r},pc=t=>{Ge(ge.MOTOR_OFF),de=t.currentDrive,t.driveState.length===3&&de>0&&de++,ni();let e=0;for(let r=0;r<t.driveState.length;r++)y[e]={...t.driveState[r]},t.driveData[r]!==""&&(jt[e]=new Uint8Array(be.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;Dt()},fc=()=>{for(let t=0;t<y.length;t++)y[t].hardDrive||ec(y[t]);Dt()},oi=(t=!1)=>{rc(t),Dt()},Sc=(t,e=!1)=>{let r=t.index,s=t.drive,a=t.hardDrive;if(e||t.filename!==""&&(No(t.filename)?(a=!0,r=t.drive<=1?0:1,s=r+1):(a=!1,r=t.drive<=1?2:3,s=r-1)),y[r]=Vt(r,s,a),y[r].filename=t.filename,jt[r]=va(y[r],t.diskData),jt[r].length===0){y[r].filename="",Dt();return}y[r].motorRunning=t.motorRunning,y[r].cloudData=t.cloudData,y[r].writableFileHandle=t.writableFileHandle,y[r].lastLocalWriteTime=t.lastLocalWriteTime,Dt()},Cc=t=>{const e=t.index;y[e].filename=t.filename,y[e].motorRunning=t.motorRunning,y[e].isWriteProtected=t.isWriteProtected,y[e].diskHasChanges=t.diskHasChanges,y[e].lastWriteTime=t.lastWriteTime,y[e].lastLocalWriteTime=t.lastLocalWriteTime,y[e].cloudData=t.cloudData,y[e].writableFileHandle=t.writableFileHandle,Dt()},ke={OVRN:4,RX_FULL:8,IRQ:128,HW_RESET:16},ar={BAUD_RATE:15,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},we={RX_INT_DIS:2,TX_INT_EN:4,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0};class Ec{_control;_status;_command;_lastRead;_lastConfig;_receiveBuffer;_extFuncs;buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=ke.OVRN;this._status|=ke.RX_FULL,(this._control&we.RX_INT_DIS)==0&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&we.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-8,this._receiveBuffer.length?(this._status|=ke.RX_FULL,(this._control&we.RX_INT_DIS)==0&&this.irq(!0)):this._status&=-9,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&ke.IRQ&&this.irq(!1),this._status&=-129,e}set status(e){this.reset()}irq(e){e?this._status|=ke.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&ar.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ar.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ar.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&we.PARITY_EN)switch(this._command&we.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=ar.HW_RESET,this._command=we.HW_RESET,this._status=ke.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=ar.HW_RESET,this._command=we.HW_RESET,this._status=ke.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}}const ho=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let vr=1,Tt;const Bc=t=>{tr(vr,t)},mc=t=>{console.log("ConfigChange: ",t)},Dc=t=>{Tt&&Tt.buffer(t)},dc=()=>{Tt&&Tt.reset()},kc=(t=!0,e=1)=>{if(!t)return;vr=e;const r={sendData:j1,interrupt:Bc,configChange:mc};Tt=new Ec(r);const s=new Uint8Array(ho.length+256);s.set(ho.slice(1792,2048)),s.set(ho,256),Ue(vr,s),er(vr,wc)},wc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Tt.data=e;else return Tt.data;break;case r.STATUS:if(e>=0)Tt.status=e;else return Tt.status;break;case r.COMMAND:if(e>=0)Tt.command=e;else return Tt.command;break;case r.CONTROL:if(e>=0)Tt.control=e;else return Tt.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},cr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Tc=()=>{const t=new Date,e=cr(t.getMonth()+1,2)+","+cr(t.getDay(),2)+","+cr(t.getDate(),2)+","+cr(t.getHours(),2)+","+cr(t.getMinutes(),2);for(let r=0;r<e.length;r++)D(512+r,e.charCodeAt(r)|128)};let $r=!1;const si=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},ii=t=>{let e=i.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=i.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=i.IND_Y:t.endsWith(",X)")?e=i.IND_X:e=i.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?i.ABS_X:i.ZP_X:t.endsWith(",Y")?e=t.length>5?i.ABS_Y:i.ZP_Y:e=t.length>3?i.ABS:i.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const s=si(t);if(s.operation&&s.value){switch(s.operation){case"+":r+=s.value;break;case"-":r-=s.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let Te={};const Ai=(t,e,r,s)=>{let a=i.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(Te).forEach(([u,m])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+U(m))}),ii(r);const f=si(r);if(f.label){const u=f.label.startsWith("<"),m=f.label.startsWith(">"),b=f.label.startsWith("#")||m||u;if(b&&(f.label=f.label.substring(1)),f.label in Te?(h=Te[f.label],m?h=h>>8&255:u&&(h=h&255)):s===2&&console.error("Missing label: "+f.label),f.operation&&f.value){switch(f.operation){case"+":h+=f.value;break;case"-":h-=f.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}Rn(e)?(a=i.ZP_REL,h=h-t+254,h>255&&(h-=256)):b?a=i.IMM:(a=h>=0&&h<=255?i.ZP_REL:i.ABS,a=f.idx==="X"?a===i.ABS?i.ABS_X:i.ZP_X:a,a=f.idx==="Y"?a===i.ABS?i.ABS_Y:i.ZP_Y:a)}return[a,h]},Rc=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},yc=(t,e)=>{if(t.label in Te&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,s]=Ai(e,t.instr,t.operand,2);r!==i.ABS&&r!==i.ZP_REL&&console.error("Illegal EQU value: "+t.operand),Te[t.label]=s}else Te[t.label]=e},Pc=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,s=0;r.startsWith('"')&&r.endsWith('"')?s=128:r.startsWith("'")&&r.endsWith("'")?s=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let a=0;a<r.length;a++)e.push(r.charCodeAt(a)|s);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(a=>{const h=parseInt(a,16);isNaN(h)&&console.error(`Invalid HEX value: ${a} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},bc=(t,e)=>{const r=[],s=H[t];return r.push(t),e>=0&&(r.push(e%256),s.bytes===3&&r.push(Math.trunc(e/256))),r};let Io=0;const ai=(t,e)=>{let r=Io;const s=[];let a="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let f=(h+"                   ").slice(0,30)+U(r,4)+"- ";const u=Rc(h,a);if(a="",!u.instr){a=u.label;return}if(u.instr==="ORG"){if(e===1){const[X,k]=ii(u.operand);X===i.ABS&&(Io=k,r=k)}$r&&e===2&&console.log(f);return}if(e===1&&u.label&&yc(u,r),u.instr==="EQU")return;let m=[],b,w;if(["ASC","DA","HEX"].includes(u.instr))m=Pc(u),r+=m.length;else if([b,w]=Ai(r,u.instr,u.operand,e),e===2&&isNaN(w)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")m.push(w&255),r++;else if(u.instr==="DW")m.push(w&255),m.push(w>>8&255),r+=2;else if(u.instr==="DS")for(let X=0;X<w;X++)m.push(0),r++;else{e===2&&Rn(u.instr)&&(w<0||w>255)&&console.error(`Branch instruction out of range: ${h} value: ${w} pass: ${e}`);const X=H.findIndex(k=>k&&k.name===u.instr&&k.mode===b);X<0&&console.error(`Unknown instruction: "${h}" mode=${b} pass=${e}`),m=bc(X,w),r+=H[X].bytes}$r&&e===2&&(m.forEach(X=>{f+=` ${U(X)}`}),console.log(f)),s.push(...m)}),$r&&e===2){let h="";s.forEach(f=>{h+=` ${U(f)}`}),console.log(h)}return s},zr=(t,e,r=!1)=>{Te={},$r=r;try{return Io=t,ai(e,1),ai(e,2)}catch(s){return console.error(s),[]}},Mc=`
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
`;let Re=49286,tn=49289,en=49291,rn=49292,nn=49293,on=49294,sn=49295;const ci=(t,e,r,s,a)=>{const h=t&255,f=t>>8&3,u=e&255,m=e>>8&3;Z(r,h),Z(s,f<<4|m),Z(a,u)},li=(t,e,r)=>{const s=ft(t),a=ft(e),h=ft(r),f=a>>4&3,u=a&3;return[s|f<<8,h|u<<8]},An=()=>li(tn,en,rn),go=()=>li(nn,on,sn),an=(t,e)=>{ci(t,e,tn,en,rn)},cn=(t,e)=>{ci(t,e,nn,on,sn)},ln=t=>{Z(Re,t),xi(!!t)},Lc=()=>{Mt=0,Lt=0,an(0,1023),cn(0,1023),ln(0),at=0,ae=0,qe=0,lr=0,ur=0,dt=0,Nt=0,Oe=0,un=0};let Mt=0,Lt=0,un=0,at=0,ae=0,qe=0,lr=0,ur=0,dt=0,Nt=0,Oe=0,ui=0,ut=5;const hn=54,In=55,Qc=56,Fc=57,hi=()=>{const t=new Uint8Array(256).fill(0),e=zr(0,Mc.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},Uc=(t=!0,e=5)=>{if(!t)return;ut=e;const r=49152+ut*256,s=49152+ut*256+8;Ue(ut,hi(),r,Oc),Ue(ut,hi(),s,Tc),er(ut,_c),Re=49280+(Re&15)+ut*16,tn=49280+(tn&15)+ut*16,en=49280+(en&15)+ut*16,rn=49280+(rn&15)+ut*16,nn=49280+(nn&15)+ut*16,on=49280+(on&15)+ut*16,sn=49280+(sn&15)+ut*16;const[a,h]=An();a===0&&h===0&&(an(0,1023),cn(0,1023)),ft(Re)!==0&&xi(!0)},Kc=()=>{const t=ft(Re);if(t&1){let e=!1;t&8&&(Oe|=8,e=!0),t&ae&4&&(Oe|=4,e=!0),t&ae&2&&(Oe|=2,e=!0),e&&tr(ut,!0)}},qc=t=>{if(ft(Re)&1)if(t.buttons>=0){switch(t.buttons){case 0:at&=-129;break;case 16:at|=128;break;case 1:at&=-17;break;case 17:at|=16;break}ae|=at&128?4:0}else{if(t.x>=0&&t.x<=1){const[r,s]=An();Mt=Math.round((s-r)*t.x+r),ae|=2}if(t.y>=0&&t.y<=1){const[r,s]=go();Lt=Math.round((s-r)*t.y+r),ae|=2}}};let hr=0,po="",Ii=0,gi=0;const Oc=()=>{const t=192+ut;B(In)===t&&B(hn)===0?Yc():B(Fc)===t&&B(Qc)===0&&Nc()},Nc=()=>{if(hr===0){const t=192+ut;Ii=B(In),gi=B(hn),D(In,t),D(hn,3);const e=(at&128)!==(qe&128);let r=0;at&128?r=e?2:1:r=e?3:4,B(49152)&128&&(r=-r),qe=at,po=Mt.toString()+","+Lt.toString()+","+r.toString()}hr>=po.length?(c.Accum=141,hr=0,D(In,Ii),D(hn,gi)):(c.Accum=po.charCodeAt(hr)|128,hr++)},Yc=()=>{switch(c.Accum){case 128:console.log("mouse off"),ln(0);break;case 129:console.log("mouse on"),ln(1);break}},_c=(t,e)=>{if(t>=49408)return-1;const r=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(r)return Mt&255;dt=dt&65280|e,dt&=65535;break;case s.HIGHX:if(r)return Mt>>8&255;dt=e<<8|dt&255,dt&=65535;break;case s.LOWY:if(r)return Lt&255;Nt=Nt&65280|e,Nt&=65535;break;case s.HIGHY:if(r)return Lt>>8&255;Nt=e<<8|Nt&255,Nt&=65535;break;case s.STATUS:return at;case s.MODE:if(r)return ft(Re);ln(e);break;case s.CLAMP:if(r){const[h,f]=An(),[u,m]=go();switch(un){case 0:return h>>8&255;case 1:return u>>8&255;case 2:return h&255;case 3:return u&255;case 4:return f>>8&255;case 5:return m>>8&255;case 6:return f&255;case 7:return m&255;default:return console.log("AppleMouse: invalid clamp index: "+un),0}}un=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(r)return ui;switch(ui=e,e){case a.INIT:Mt=0,Lt=0,lr=0,ur=0,an(0,1023),cn(0,1023),at=0,ae=0;break;case a.READ:ae=0,at&=-112,at|=qe>>1&64,at|=qe>>4&1,qe=at,(lr!==Mt||ur!==Lt)&&(at|=32,lr=Mt,ur=Lt);break;case a.CLEAR:console.log("cmd.clear"),Mt=0,Lt=0,lr=0,ur=0;break;case a.SERVE:at&=-15,at|=Oe,Oe=0,tr(ut,!1);break;case a.HOME:{const[h]=An(),[f]=go();Mt=h,Lt=f}break;case a.CLAMPX:{const h=dt>32767?dt-65536:dt,f=Nt;an(h,f),console.log(h+" -> "+f)}break;case a.CLAMPY:{const h=dt>32767?dt-65536:dt,f=Nt;cn(h,f),console.log(h+" -> "+f)}break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:Mt=dt,Lt=Nt;break}break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return e},Ne={RX_FULL:1,TX_EMPTY:2,OVRN:32,IRQ:128},Ht={COUNTER_DIV1:1,COUNTER_DIV2:2,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class xc{_control;_status;_lastRead;_receiveBuffer;_extFuncs;buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=Ne.OVRN;this._status|=Ne.RX_FULL,this._control&Ht.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(Ht.TX_INT_ENABLE|Ht.NRTS))===Ht.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-113,this._receiveBuffer.length?(this._status|=Ne.RX_FULL,this._control&Ht.RX_INT_ENABLE&&this.irq(!0)):(this._status&=-2,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(Ht.COUNTER_DIV1|Ht.COUNTER_DIV2))===(Ht.COUNTER_DIV1|Ht.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Ne.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Ne.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Ne.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}}const Yt={IRQ_ENABLE:64,COUNTER_MODE:56,INTERNAL_CLOCK:2,SPECIAL:1},pi={ANY_IRQ:128};class fo{_latch;_count;_control;decrement(e){return(this._control&Yt.INTERNAL_CLOCK)==0||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Yt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0}}class Wc{_timer;_status;_statusRead;_msb;_lsb;_div8;_interrupt;status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Yt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const s=this._timer[0].control&Yt.SPECIAL,a=this._msb*256+r;this._timer[e].latch=a,s&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const s=this._timer[0].control&Yt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),s>>8&255}update(e){const r=this._timer[0].control&Yt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let s=!1;for(let a=0;a<3;a++){let h=e;if(a==2&&this._timer[2].control&Yt.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),s=this._timer[a].decrement(h),s){const f=this._timer[a].control;switch(f&Yt.IRQ_ENABLE&&this.irq(a,!0),f&Yt.COUNTER_MODE){case 0:case 16:this._timer[a].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Yt.SPECIAL}irq(e,r){const s=1<<e|pi.ANY_IRQ;r?this._status|=s:this._status&=~s,this._status?(this._status|=pi.ANY_IRQ,this._interrupt(!0)):(this._status&=-129,this._interrupt(!1))}constructor(e){this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new fo,new fo,new fo],this._msb=this._lsb=0,this._div8=0,this.reset()}}let gn=2,st,ce,So=0;const Xc=t=>{if(So){const e=c.cycleCount-So;st.update(e)}So=c.cycleCount},fi=t=>{tr(gn,t)},Gc=t=>{ce&&ce.buffer(t)},Zc=(t=!0,e=2)=>{if(!t)return;gn=e,st=new Wc(fi);const r={sendData:H1,interrupt:fi};ce=new xc(r),er(gn,Vc),Bs(Xc,gn)},Jc=()=>{st&&(st.reset(),ce.reset())},Vc=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?ce.data=e:s=ce.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?ce.control=e:s=ce.status;break;case r.TCONTROL1:e>=0?st.timerControl(0,e):s=0;break;case r.TCONTROL2:e>=0?st.timerControl(1,e):s=st.status();break;case r.T1MSB:e>=0?st.timerMSBw(0,e):s=st.timerMSBr(0);break;case r.T1LSB:e>=0?st.timerLSBw(0,e):s=st.timerLSBr(0);break;case r.T2MSB:e>=0?st.timerMSBw(1,e):s=st.timerMSBr(1);break;case r.T2LSB:e>=0?st.timerLSBw(1,e):s=st.timerLSBr(1);break;case r.T3MSB:e>=0?st.timerMSBw(2,e):s=st.timerMSBr(2);break;case r.T3LSB:e>=0?st.timerLSBw(2,e):s=st.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return s},jc=(t=!0,e=4)=>{t&&(er(e,h1),Bs(A1,e))},Co=[0,128],Eo=[1,129],Hc=[2,130],vc=[3,131],Ye=[4,132],_e=[5,133],pn=[6,134],Bo=[7,135],Ir=[8,136],gr=[9,137],$c=[10,138],mo=[11,139],zc=[12,140],ye=[13,141],pr=[14,142],Si=[16,145],Ci=[17,145],_t=[18,146],Do=[32,160],vt=64,le=32,t1=(t=4)=>{for(let e=0;e<=255;e++)O(t,e,0);for(let e=0;e<=1;e++)ko(t,e)},e1=(t,e)=>(G(t,pr[e])&vt)!==0,r1=(t,e)=>(G(t,_t[e])&vt)!==0,Ei=(t,e)=>(G(t,mo[e])&vt)!==0,n1=(t,e,r)=>{let s=G(t,Ye[e])-r;if(O(t,Ye[e],s),s<0){s=s%256+256,O(t,Ye[e],s);let a=G(t,_e[e]);if(a--,O(t,_e[e],a),a<0&&(a+=256,O(t,_e[e],a),e1(t,e)&&(!r1(t,e)||Ei(t,e)))){const h=G(t,_t[e]);O(t,_t[e],h|vt);const f=G(t,ye[e]);if(O(t,ye[e],f|vt),ue(t,e,-1),Ei(t,e)){const u=G(t,Bo[e]),m=G(t,pn[e]);O(t,Ye[e],m),O(t,_e[e],u)}}}},o1=(t,e)=>(G(t,pr[e])&le)!==0,s1=(t,e)=>(G(t,_t[e])&le)!==0,i1=(t,e,r)=>{if((G(t,mo[e])&le)!==0)return;let s=G(t,Ir[e])-r;if(O(t,Ir[e],s),s<0){s=s%256+256,O(t,Ir[e],s);let a=G(t,gr[e]);if(a--,O(t,gr[e],a),a<0&&(a+=256,O(t,gr[e],a),o1(t,e)&&!s1(t,e))){const h=G(t,_t[e]);O(t,_t[e],h|le);const f=G(t,ye[e]);O(t,ye[e],f|le),ue(t,e,-1)}}},Bi=new Array(8).fill(0),A1=t=>{const e=c.cycleCount-Bi[t];for(let r=0;r<=1;r++)n1(t,r,e),i1(t,r,e);Bi[t]=c.cycleCount},a1=(t,e)=>{const r=[];for(let s=0;s<=15;s++)r[s]=G(t,Do[e]+s);return r},c1=(t,e)=>t.length===e.length&&t.every((r,s)=>r===e[s]),xe={slot:-1,chip:-1,params:[-1]};let ko=(t,e)=>{const r=a1(t,e);t===xe.slot&&e===xe.chip&&c1(r,xe.params)||(xe.slot=t,xe.chip=e,xe.params=r,V1({slot:t,chip:e,params:r}))};const l1=(t,e)=>{switch(G(t,Co[e])&7){case 0:for(let s=0;s<=15;s++)O(t,Do[e]+s,0);ko(t,e);break;case 7:O(t,Ci[e],G(t,Eo[e]));break;case 6:{const s=G(t,Ci[e]),a=G(t,Eo[e]);s>=0&&s<=15&&(O(t,Do[e]+s,a),ko(t,e));break}}},ue=(t,e,r)=>{let s=G(t,ye[e]);switch(r>=0&&(s&=127-(r&127),O(t,ye[e],s)),e){case 0:tr(t,s!==0);break;case 1:aa(s!==0);break}},u1=(t,e,r)=>{let s=G(t,pr[e]);r>=0&&(r=r&255,r&128?s|=r:s&=255-r),s|=128,O(t,pr[e],s)},h1=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,s=t&255,a=s&128?1:0;switch(s){case Co[a]:e>=0&&(O(r,Co[a],e),l1(r,a));break;case Eo[a]:case Hc[a]:case vc[a]:case $c[a]:case mo[a]:case zc[a]:O(r,s,e);break;case Ye[a]:e>=0&&O(r,pn[a],e),ue(r,a,vt);break;case _e[a]:if(e>=0){O(r,Bo[a],e),O(r,Ye[a],G(r,pn[a])),O(r,_e[a],e);const h=G(r,_t[a]);O(r,_t[a],h&~vt),ue(r,a,vt)}break;case pn[a]:e>=0&&(O(r,s,e),ue(r,a,vt));break;case Bo[a]:e>=0&&O(r,s,e);break;case Ir[a]:e>=0&&O(r,Si[a],e),ue(r,a,le);break;case gr[a]:if(e>=0){O(r,gr[a],e),O(r,Ir[a],G(r,Si[a]));const h=G(r,_t[a]);O(r,_t[a],h&~le),ue(r,a,le)}break;case ye[a]:e>=0&&ue(r,a,e);break;case pr[a]:u1(r,a,e);break}return-1};let We=0;const fn=192,I1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${U(fn)}   ; jump address
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
`,g1=`
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
`,p1=()=>{const t=new Uint8Array(256).fill(0),e=zr(0,I1.split(`
`));t.set(e,0);const r=zr(0,g1.split(`
`));return t.set(r,fn),t[254]=23,t[255]=fn,t};let fr=new Uint8Array;const wo=(t=!0)=>{fr.length===0&&(fr=p1()),fr[1]=t?32:0;const r=49152+fn+7*256;Ue(7,fr,r,B1),Ue(7,fr,r+3,E1)},f1=(t,e)=>{if(t===0)D(e,2);else if(t<=2){D(e,240);const a=Hr(t).length/512;D(e+1,a&255),D(e+2,a>>>8),D(e+3,0),nr(4),or(0)}else rr(40),nr(0),or(0),K()},S1=(t,e)=>{const a=Hr(t).length/512,h=a>1600?2:1,f=h==2?32:64;D(e,240),D(e+1,a&255),D(e+2,a>>>8),D(e+3,0);const u="Apple2TS SP";D(e+4,u.length);let m=0;for(;m<u.length;m++)D(e+5+m,u.charCodeAt(m));for(;m<16;m++)D(e+5+m,u.charCodeAt(8));D(e+21,h),D(e+22,f),D(e+23,1),D(e+24,0),nr(25),or(0)},C1=(t,e,r)=>{if(B(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),rr(4),K();return}const s=B(t+4);switch(s){case 0:f1(e,r);break;case 1:case 2:rr(33),K();break;case 3:case 4:S1(e,r);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},E1=()=>{rr(0),K(!1);const t=256+c.StackPtr,e=B(t+1)+256*B(t+2),r=B(e+1),s=B(e+2)+256*B(e+3),a=B(s+1),h=B(s+2)+256*B(s+3);switch(r){case 0:{C1(s,a,h);return}case 1:{if(B(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),K();return}const m=512*(B(s+4)+256*B(s+5)+65536*B(s+6)),w=Hr(a).slice(m,m+512);eo(h,w);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),K();return}const f=uo(a);f.motorRunning=!0,We||(We=setTimeout(()=>{We=0,f&&(f.motorRunning=!1),Dt()},500)),Dt()},B1=()=>{rr(0),K(!1);const t=B(66),e=Math.max(Math.min(B(67)>>6,2),0),r=uo(e);if(!r.hardDrive)return;const s=Hr(e),a=B(70)+256*B(71),h=512*a,f=B(68)+256*B(69),u=s.length;switch(r.status=` ${U(a,4)}`,t){case 0:{if(r.filename.length===0||u===0){nr(0),or(0),K();return}const m=u/512;nr(m&255),or(m>>>8);break}case 1:{if(h+512>u){K();return}const m=s.slice(h,h+512);eo(f,m);break}case 2:{if(h+512>u){K();return}if(r.isWriteProtected){K();return}const m=to(f);s.set(m,h),r.diskHasChanges=!0,r.lastWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),K();return;default:console.error("unknown hard drive command"),K();return}K(!1),r.motorRunning=!0,We||(We=setTimeout(()=>{We=0,r&&(r.motorRunning=!1),Dt()},500)),Dt()},mi=`
        ORG   $300
        LDA   $C000
        LDX   $C010
        JSR   $F941
        JSR   $FD8E
        JMP   $0300
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
`;let Di=0,Sn=0,Sr=0,Cn=0,di=oA,To=!1,ki=16.6881,Ro=17030,wi=0,rt=Y.IDLE,he="APPLE2EE",Xe=0,En=!1,kt=0;const x=[];let Cr=0;const m1=()=>{C.VBL.isSet=!0,Kc()},D1=()=>{C.VBL.isSet=!1},Ti=()=>{const t={};for(const e in C)t[e]=C[e].isSet;return t},d1=()=>{const t=JSON.parse(JSON.stringify(c));let e=Wt;for(let s=Wt;s<P.length;s++)P[s]!==255&&(s+=255-s%256,e=s+1);const r=be.Buffer.from(P.slice(0,e));return{s6502:t,extraRamSize:64*(Kt+1),machineName:he,softSwitches:Ti(),stackDump:Qa(),memory:r.toString("base64")}},k1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));Ls(r);const s=t.softSwitches;for(const h in s){const f=h;try{C[f].isSet=s[h]}catch{}}"WRITEBSR1"in s&&(C.BSR_PREWRITE.isSet=!1,C.BSR_WRITE.isSet=s.WRITEBSR1||s.WRITEBSR2||s.RDWRBSR1||s.RDWRBSR2);const a=new Uint8Array(be.Buffer.from(t.memory,"base64"));if(e<1){P.set(a.slice(0,65536)),P.set(a.slice(131072,163584),65536),P.set(a.slice(65536,131072),Wt);const h=(a.length-163584)/1024;h>0&&(Vn(h+64),P.set(a.slice(163584),Wt+65536))}else Vn(t.extraRamSize),P.set(a);t.stackDump&&Fa(t.stackDump),he=t.machineName||"APPLE2EE",Po(he,!1),Xt(),On(!0)},yo=t=>({emulator:null,state6502:d1(),driveState:gc(t),thumbnail:"",snapshots:null}),w1=()=>{const t=yo(!0);return t.snapshots=x,t},T1=t=>{Ls(t),Ft()},R1=t=>{sr(t),Ft()},y1=t=>{To=t,Ft()},Bn=(t,e=!1)=>{Dn();const r=t.emulator?.version?t.emulator.version:.9;k1(t.state6502,r),pc(t.driveState),e&&(x.length=0,kt=0),t.snapshots&&(x.length=0,x.push(...t.snapshots),kt=x.length),Ft()};let Ri=!1;const yi=()=>{Ri||(Ri=!0,kc(),Zc(!0,2),jc(!0,4),Uc(!0,5),uc(),wo(),xa())},P1=()=>{fc(),Fn(),Lc(),Jc(),dc(),t1(4)},mn=()=>{if(sr(0),wa(),Rs(he),yi(),mi.length>0){const e=zr(768,mi.split(`
`));P.set(e,768)}Dn(),On(!0),uo(1).filename===""&&(wo(!1),setTimeout(()=>{wo()},200))},Dn=()=>{ca(),jA(),B(49282),Qs(),P1()},b1=t=>{Sr=t,ki=Sr===4?1:16.6881,Ro=17030*[.1,.5,1,2,3,4,4][Sr+2],Fi()},M1=t=>{di=t,Ft()},L1=(t,e)=>{P[t]=e,Ft()},Po=(t,e=!0)=>{he!==t&&(he=t,Rs(he),e&&Dn(),Ft())},Q1=t=>{Vn(t),Ft()},Pi=()=>{const t=kt-1;return t<0||!x[t]?-1:t},bi=()=>{const t=kt+1;return t>=x.length||!x[t]?-1:t},Mi=()=>{x.length===sA&&x.shift(),x.push(yo(!1)),kt=x.length,v1(x[x.length-1].state6502.s6502.PC)},F1=()=>{let t=Pi();t<0||(Qt(Y.PAUSED),setTimeout(()=>{kt===x.length&&(Mi(),t=Math.max(kt-2,0)),kt=t,Bn(x[kt])},50))},U1=()=>{const t=bi();t<0||(Qt(Y.PAUSED),setTimeout(()=>{kt=t,Bn(x[t])},50))},K1=t=>{t<0||t>=x.length||(Qt(Y.PAUSED),setTimeout(()=>{kt=t,Bn(x[t])},50))},q1=()=>{const t=[];for(let e=0;e<x.length;e++)t[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return t},O1=t=>{x.length>0&&(x[x.length-1].thumbnail=t)};let dn=null;const bo=(t=!1)=>{dn&&clearTimeout(dn),t?dn=setTimeout(()=>{En=!0,dn=null},100):En=!0},Li=()=>{Pr(),rt===Y.IDLE&&(mn(),rt=Y.PAUSED),Wn(),Qt(Y.PAUSED)},N1=()=>{Pr(),rt===Y.IDLE&&(mn(),rt=Y.PAUSED),B(c.PC,!1)===32?(Wn(),Qi()):Li()},Qi=()=>{Pr(),rt===Y.IDLE&&(mn(),rt=Y.PAUSED),sa(),Qt(Y.RUNNING)},Fi=()=>{Xe=0,Sn=performance.now(),Di=Sn},Qt=t=>{if(yi(),rt===Y.RUNNING&&t===Y.PAUSED&&(To=!0),rt=t,rt===Y.PAUSED)Cr&&(clearInterval(Cr),Cr=0),oi();else if(rt===Y.RUNNING){for(oi(!0),Pr();x.length>0&&kt<x.length-1;)x.pop();kt=x.length,Cr||(Cr=setInterval(On,1e3))}Ft(),Fi(),Cn===0&&(Cn=1,Oi())},Ui=t=>{rt===Y.IDLE?(Qt(Y.NEED_BOOT),setTimeout(()=>{Qt(Y.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},Y1=(t,e,r)=>{Ui(()=>{eo(t,e),r&&qt(t)})},_1=t=>{Ui(()=>{JA(t)})},x1=()=>rt===Y.PAUSED?ba():new Uint8Array,W1=()=>rt!==Y.IDLE?Ua():"";let Ki=!1;const Ft=()=>{const t={addressGetTable:At,altChar:C.ALTCHARSET.isSet,breakpoints:mt,button0:C.PB0.isSet,button1:C.PB1.isSet,canGoBackward:Pi()>=0,canGoForward:bi()>=0,c800Slot:Zn(),cout:B(57)<<8|B(56),cpuSpeed:Cn,extraRamSize:64*(Kt+1),hires:Pa(),iTempState:kt,isDebugging:di,lores:$n(!0),machineName:he,memoryDump:x1(),noDelayMode:!C.COLUMN80.isSet&&C.DHIRES.isSet,ramWorksBank:me(),runMode:rt,s6502:c,showDebugTab:To,softSwitches:Ti(),speedMode:Sr,stackString:W1(),textPage:$n(),timeTravelThumbnails:q1()};G1(t),Ki||(Ki=!0,$1($A()))},X1=t=>{if(t)for(let e=0;e<t.length;e++)HA(t[e]);else vA();t&&(t[0]<=49167||t[0]>=49232)&&Xt(),Ft()},qi=()=>{const t=performance.now();if(wi=t-Sn,wi<ki||(Sn=t,rt===Y.IDLE||rt===Y.PAUSED))return;rt===Y.NEED_BOOT?(mn(),Qt(Y.RUNNING)):rt===Y.NEED_RESET&&(Dn(),Qt(Y.RUNNING));let e=0;for(;;){const s=Wn();if(s<0||(e+=s,e<4550?C.VBL.isSet||m1():D1(),e>=Ro))break}Xe++;const r=Xe*Ro/(performance.now()-Di);Cn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,Xe%2&&(fA(),Ft()),En&&(En=!1,Mi())},Oi=()=>{qi();const t=Xe+[1,1,1,5,5,5,10][Sr+2];for(;rt===Y.RUNNING&&Xe!==t;)qi();setTimeout(Oi,rt===Y.RUNNING?0:20)},Et=(t,e)=>{self.postMessage({msg:t,payload:e})},G1=t=>{Et(It.MACHINE_STATE,t)},Z1=t=>{Et(It.CLICK,t)},J1=t=>{Et(It.DRIVE_PROPS,t)},Ge=t=>{Et(It.DRIVE_SOUND,t)},Ni=t=>{Et(It.SAVE_STATE,t)},kn=t=>{Et(It.RUMBLE,t)},Yi=t=>{Et(It.HELP_TEXT,t)},_i=t=>{Et(It.ENHANCED_MIDI,t)},xi=t=>{Et(It.SHOW_APPLE_MOUSE,t)},V1=t=>{Et(It.MBOARD_SOUND,t)},j1=t=>{Et(It.COMM_DATA,t)},H1=t=>{Et(It.MIDI_DATA,t)},v1=t=>{Et(It.REQUEST_THUMBNAIL,t)},$1=t=>{Et(It.SOFTSWITCH_DESCRIPTIONS,t)},z1=t=>{Et(It.INSTRUCTIONS,t)};typeof self<"u"&&(self.onmessage=t=>{if(!(!t.data||typeof t.data!="object")&&"msg"in t.data)switch(t.data.msg){case F.RUN_MODE:Qt(t.data.payload);break;case F.STATE6502:T1(t.data.payload);break;case F.DEBUG:M1(t.data.payload);break;case F.SHOW_DEBUG_TAB:y1(t.data.payload);break;case F.BREAKPOINTS:ia(t.data.payload);break;case F.STEP_INTO:Li();break;case F.STEP_OVER:N1();break;case F.STEP_OUT:Qi();break;case F.SPEED:b1(t.data.payload);break;case F.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?U1():F1();break;case F.TIME_TRAVEL_INDEX:K1(t.data.payload);break;case F.TIME_TRAVEL_SNAPSHOT:bo();break;case F.THUMBNAIL_IMAGE:O1(t.data.payload);break;case F.RESTORE_STATE:Bn(t.data.payload,!0);break;case F.KEYPRESS:ZA(t.data.payload);break;case F.KEYRELEASE:GA();break;case F.MOUSEEVENT:qc(t.data.payload);break;case F.PASTE_TEXT:_1(t.data.payload);break;case F.APPLE_PRESS:jo(!0,t.data.payload);break;case F.APPLE_RELEASE:jo(!1,t.data.payload);break;case F.GET_SAVE_STATE:Ni(yo(!0));break;case F.GET_SAVE_STATE_SNAPSHOTS:Ni(w1());break;case F.DRIVE_PROPS:{const e=t.data.payload;Cc(e);break}case F.DRIVE_NEW_DATA:{const e=t.data.payload;Sc(e);break}case F.GAMEPAD:gA(t.data.payload);break;case F.SET_BINARY_BLOCK:{const e=t.data.payload;Y1(e.address,e.data,e.run);break}case F.SET_CYCLECOUNT:R1(t.data.payload);break;case F.SET_MEMORY:{const e=t.data.payload;L1(e.address,e.value);break}case F.COMM_DATA:Dc(t.data.payload);break;case F.MIDI_DATA:Gc(t.data.payload);break;case F.RAMWORKS:Q1(t.data.payload);break;case F.MACHINE_NAME:Po(t.data.payload);break;case F.SOFTSWITCHES:X1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
