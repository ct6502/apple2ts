var f0=Object.defineProperty;var p0=(Vt,kt,Ee)=>kt in Vt?f0(Vt,kt,{enumerable:!0,configurable:!0,writable:!0,value:Ee}):Vt[kt]=Ee;var W=(Vt,kt,Ee)=>p0(Vt,typeof kt!="symbol"?kt+"":kt,Ee);(function(){"use strict";var Vt={},kt={},Ee;function oi(){if(Ee)return kt;Ee=1,kt.byteLength=u,kt.toByteArray=L,kt.fromByteArray=G;for(var t=[],e=[],r=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=0,I=s.length;c<I;++c)t[c]=s[c],e[s.charCodeAt(c)]=c;e[45]=62,e[95]=63;function S(w){var q=w.length;if(q%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var J=w.indexOf("=");J===-1&&(J=q);var It=J===q?0:4-J%4;return[J,It]}function u(w){var q=S(w),J=q[0],It=q[1];return(J+It)*3/4-It}function m(w,q,J){return(q+J)*3/4-J}function L(w){var q,J=S(w),It=J[0],ft=J[1],it=new r(m(w,It,ft)),mt=0,qe=ft>0?It-4:It,ot;for(ot=0;ot<qe;ot+=4)q=e[w.charCodeAt(ot)]<<18|e[w.charCodeAt(ot+1)]<<12|e[w.charCodeAt(ot+2)]<<6|e[w.charCodeAt(ot+3)],it[mt++]=q>>16&255,it[mt++]=q>>8&255,it[mt++]=q&255;return ft===2&&(q=e[w.charCodeAt(ot)]<<2|e[w.charCodeAt(ot+1)]>>4,it[mt++]=q&255),ft===1&&(q=e[w.charCodeAt(ot)]<<10|e[w.charCodeAt(ot+1)]<<4|e[w.charCodeAt(ot+2)]>>2,it[mt++]=q>>8&255,it[mt++]=q&255),it}function T(w){return t[w>>18&63]+t[w>>12&63]+t[w>>6&63]+t[w&63]}function X(w,q,J){for(var It,ft=[],it=q;it<J;it+=3)It=(w[it]<<16&16711680)+(w[it+1]<<8&65280)+(w[it+2]&255),ft.push(T(It));return ft.join("")}function G(w){for(var q,J=w.length,It=J%3,ft=[],it=16383,mt=0,qe=J-It;mt<qe;mt+=it)ft.push(X(w,mt,mt+it>qe?qe:mt+it));return It===1?(q=w[J-1],ft.push(t[q>>2]+t[q<<4&63]+"==")):It===2&&(q=(w[J-2]<<8)+w[J-1],ft.push(t[q>>10]+t[q>>4&63]+t[q<<2&63]+"=")),ft.join("")}return kt}var kr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */var Ko;function si(){return Ko||(Ko=1,kr.read=function(t,e,r,s,c){var I,S,u=c*8-s-1,m=(1<<u)-1,L=m>>1,T=-7,X=r?c-1:0,G=r?-1:1,w=t[e+X];for(X+=G,I=w&(1<<-T)-1,w>>=-T,T+=u;T>0;I=I*256+t[e+X],X+=G,T-=8);for(S=I&(1<<-T)-1,I>>=-T,T+=s;T>0;S=S*256+t[e+X],X+=G,T-=8);if(I===0)I=1-L;else{if(I===m)return S?NaN:(w?-1:1)*(1/0);S=S+Math.pow(2,s),I=I-L}return(w?-1:1)*S*Math.pow(2,I-s)},kr.write=function(t,e,r,s,c,I){var S,u,m,L=I*8-c-1,T=(1<<L)-1,X=T>>1,G=c===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=s?0:I-1,q=s?1:-1,J=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,S=T):(S=Math.floor(Math.log(e)/Math.LN2),e*(m=Math.pow(2,-S))<1&&(S--,m*=2),S+X>=1?e+=G/m:e+=G*Math.pow(2,1-X),e*m>=2&&(S++,m/=2),S+X>=T?(u=0,S=T):S+X>=1?(u=(e*m-1)*Math.pow(2,c),S=S+X):(u=e*Math.pow(2,X-1)*Math.pow(2,c),S=0));c>=8;t[r+w]=u&255,w+=q,u/=256,c-=8);for(S=S<<c|u,L+=c;L>0;t[r+w]=S&255,w+=q,S/=256,L-=8);t[r+w-q]|=J*128}),kr}/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var Oo;function Ai(){return Oo||(Oo=1,function(t){const e=oi(),r=si(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=it,t.INSPECT_MAX_BYTES=50;const c=2147483647;t.kMaxLength=c,u.TYPED_ARRAY_SUPPORT=I(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function I(){try{const i=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(i,n),i.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function S(i){if(i>c)throw new RangeError('The value "'+i+'" is invalid for option "size"');const n=new Uint8Array(i);return Object.setPrototypeOf(n,u.prototype),n}function u(i,n,o){if(typeof i=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return X(i)}return m(i,n,o)}u.poolSize=8192;function m(i,n,o){if(typeof i=="string")return G(i,n);if(ArrayBuffer.isView(i))return q(i);if(i==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i);if(Zt(i,ArrayBuffer)||i&&Zt(i.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Zt(i,SharedArrayBuffer)||i&&Zt(i.buffer,SharedArrayBuffer)))return J(i,n,o);if(typeof i=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=i.valueOf&&i.valueOf();if(l!=null&&l!==i)return u.from(l,n,o);const g=It(i);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof i[Symbol.toPrimitive]=="function")return u.from(i[Symbol.toPrimitive]("string"),n,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof i)}u.from=function(i,n,o){return m(i,n,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function L(i){if(typeof i!="number")throw new TypeError('"size" argument must be of type number');if(i<0)throw new RangeError('The value "'+i+'" is invalid for option "size"')}function T(i,n,o){return L(i),i<=0?S(i):n!==void 0?typeof o=="string"?S(i).fill(n,o):S(i).fill(n):S(i)}u.alloc=function(i,n,o){return T(i,n,o)};function X(i){return L(i),S(i<0?0:ft(i)|0)}u.allocUnsafe=function(i){return X(i)},u.allocUnsafeSlow=function(i){return X(i)};function G(i,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const o=mt(i,n)|0;let l=S(o);const g=l.write(i,n);return g!==o&&(l=l.slice(0,g)),l}function w(i){const n=i.length<0?0:ft(i.length)|0,o=S(n);for(let l=0;l<n;l+=1)o[l]=i[l]&255;return o}function q(i){if(Zt(i,Uint8Array)){const n=new Uint8Array(i);return J(n.buffer,n.byteOffset,n.byteLength)}return w(i)}function J(i,n,o){if(n<0||i.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(i.byteLength<n+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&o===void 0?l=new Uint8Array(i):o===void 0?l=new Uint8Array(i,n):l=new Uint8Array(i,n,o),Object.setPrototypeOf(l,u.prototype),l}function It(i){if(u.isBuffer(i)){const n=ft(i.length)|0,o=S(n);return o.length===0||i.copy(o,0,0,n),o}if(i.length!==void 0)return typeof i.length!="number"||qo(i.length)?S(0):w(i);if(i.type==="Buffer"&&Array.isArray(i.data))return w(i.data)}function ft(i){if(i>=c)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+c.toString(16)+" bytes");return i|0}function it(i){return+i!=i&&(i=0),u.alloc(+i)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,o){if(Zt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),Zt(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(n)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===o)return 0;let l=n.length,g=o.length;for(let p=0,E=Math.min(l,g);p<E;++p)if(n[p]!==o[p]){l=n[p],g=o[p];break}return l<g?-1:g<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,o){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<n.length;++l)o+=n[l].length;const g=u.allocUnsafe(o);let p=0;for(l=0;l<n.length;++l){let E=n[l];if(Zt(E,Uint8Array))p+E.length>g.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(g,p)):Uint8Array.prototype.set.call(g,E,p);else if(u.isBuffer(E))E.copy(g,p);else throw new TypeError('"list" argument must be an Array of Buffers');p+=E.length}return g};function mt(i,n){if(u.isBuffer(i))return i.length;if(ArrayBuffer.isView(i)||Zt(i,ArrayBuffer))return i.byteLength;if(typeof i!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof i);const o=i.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let g=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Uo(i).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return ni(i).length;default:if(g)return l?-1:Uo(i).length;n=(""+n).toLowerCase(),g=!0}}u.byteLength=mt;function qe(i,n,o){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,n>>>=0,o<=n))return"";for(i||(i="utf8");;)switch(i){case"hex":return A0(this,n,o);case"utf8":case"utf-8":return JA(this,n,o);case"ascii":return o0(this,n,o);case"latin1":case"binary":return s0(this,n,o);case"base64":return r0(this,n,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return i0(this,n,o);default:if(l)throw new TypeError("Unknown encoding: "+i);i=(i+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function ot(i,n,o){const l=i[n];i[n]=i[o],i[o]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<n;o+=2)ot(this,o,o+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<n;o+=4)ot(this,o,o+3),ot(this,o+1,o+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<n;o+=8)ot(this,o,o+7),ot(this,o+1,o+6),ot(this,o+2,o+5),ot(this,o+3,o+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?JA(this,0,n):qe.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const o=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(n+=" ... "),"<Buffer "+n+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(n,o,l,g,p){if(Zt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(o===void 0&&(o=0),l===void 0&&(l=n?n.length:0),g===void 0&&(g=0),p===void 0&&(p=this.length),o<0||l>n.length||g<0||p>this.length)throw new RangeError("out of range index");if(g>=p&&o>=l)return 0;if(g>=p)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,g>>>=0,p>>>=0,this===n)return 0;let E=p-g,b=l-o;const tt=Math.min(E,b),v=this.slice(g,p),et=n.slice(o,l);for(let j=0;j<tt;++j)if(v[j]!==et[j]){E=v[j],b=et[j];break}return E<b?-1:b<E?1:0};function ZA(i,n,o,l,g){if(i.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,qo(o)&&(o=g?0:i.length-1),o<0&&(o=i.length+o),o>=i.length){if(g)return-1;o=i.length-1}else if(o<0)if(g)o=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:VA(i,n,o,l,g);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(i,n,o):Uint8Array.prototype.lastIndexOf.call(i,n,o):VA(i,[n],o,l,g);throw new TypeError("val must be string, number or Buffer")}function VA(i,n,o,l,g){let p=1,E=i.length,b=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(i.length<2||n.length<2)return-1;p=2,E/=2,b/=2,o/=2}function tt(et,j){return p===1?et[j]:et.readUInt16BE(j*p)}let v;if(g){let et=-1;for(v=o;v<E;v++)if(tt(i,v)===tt(n,et===-1?0:v-et)){if(et===-1&&(et=v),v-et+1===b)return et*p}else et!==-1&&(v-=v-et),et=-1}else for(o+b>E&&(o=E-b),v=o;v>=0;v--){let et=!0;for(let j=0;j<b;j++)if(tt(i,v+j)!==tt(n,j)){et=!1;break}if(et)return v}return-1}u.prototype.includes=function(n,o,l){return this.indexOf(n,o,l)!==-1},u.prototype.indexOf=function(n,o,l){return ZA(this,n,o,l,!0)},u.prototype.lastIndexOf=function(n,o,l){return ZA(this,n,o,l,!1)};function v1(i,n,o,l){o=Number(o)||0;const g=i.length-o;l?(l=Number(l),l>g&&(l=g)):l=g;const p=n.length;l>p/2&&(l=p/2);let E;for(E=0;E<l;++E){const b=parseInt(n.substr(E*2,2),16);if(qo(b))return E;i[o+E]=b}return E}function z1(i,n,o,l){return bn(Uo(n,i.length-o),i,o,l)}function $1(i,n,o,l){return bn(u0(n),i,o,l)}function t0(i,n,o,l){return bn(ni(n),i,o,l)}function e0(i,n,o,l){return bn(I0(n,i.length-o),i,o,l)}u.prototype.write=function(n,o,l,g){if(o===void 0)g="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")g=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,g===void 0&&(g="utf8")):(g=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const p=this.length-o;if((l===void 0||l>p)&&(l=p),n.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let E=!1;for(;;)switch(g){case"hex":return v1(this,n,o,l);case"utf8":case"utf-8":return z1(this,n,o,l);case"ascii":case"latin1":case"binary":return $1(this,n,o,l);case"base64":return t0(this,n,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return e0(this,n,o,l);default:if(E)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function r0(i,n,o){return n===0&&o===i.length?e.fromByteArray(i):e.fromByteArray(i.slice(n,o))}function JA(i,n,o){o=Math.min(i.length,o);const l=[];let g=n;for(;g<o;){const p=i[g];let E=null,b=p>239?4:p>223?3:p>191?2:1;if(g+b<=o){let tt,v,et,j;switch(b){case 1:p<128&&(E=p);break;case 2:tt=i[g+1],(tt&192)===128&&(j=(p&31)<<6|tt&63,j>127&&(E=j));break;case 3:tt=i[g+1],v=i[g+2],(tt&192)===128&&(v&192)===128&&(j=(p&15)<<12|(tt&63)<<6|v&63,j>2047&&(j<55296||j>57343)&&(E=j));break;case 4:tt=i[g+1],v=i[g+2],et=i[g+3],(tt&192)===128&&(v&192)===128&&(et&192)===128&&(j=(p&15)<<18|(tt&63)<<12|(v&63)<<6|et&63,j>65535&&j<1114112&&(E=j))}}E===null?(E=65533,b=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),g+=b}return n0(l)}const jA=4096;function n0(i){const n=i.length;if(n<=jA)return String.fromCharCode.apply(String,i);let o="",l=0;for(;l<n;)o+=String.fromCharCode.apply(String,i.slice(l,l+=jA));return o}function o0(i,n,o){let l="";o=Math.min(i.length,o);for(let g=n;g<o;++g)l+=String.fromCharCode(i[g]&127);return l}function s0(i,n,o){let l="";o=Math.min(i.length,o);for(let g=n;g<o;++g)l+=String.fromCharCode(i[g]);return l}function A0(i,n,o){const l=i.length;(!n||n<0)&&(n=0),(!o||o<0||o>l)&&(o=l);let g="";for(let p=n;p<o;++p)g+=h0[i[p]];return g}function i0(i,n,o){const l=i.slice(n,o);let g="";for(let p=0;p<l.length-1;p+=2)g+=String.fromCharCode(l[p]+l[p+1]*256);return g}u.prototype.slice=function(n,o){const l=this.length;n=~~n,o=o===void 0?l:~~o,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<n&&(o=n);const g=this.subarray(n,o);return Object.setPrototypeOf(g,u.prototype),g};function lt(i,n,o){if(i%1!==0||i<0)throw new RangeError("offset is not uint");if(i+n>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||lt(n,o,this.length);let g=this[n],p=1,E=0;for(;++E<o&&(p*=256);)g+=this[n+E]*p;return g},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||lt(n,o,this.length);let g=this[n+--o],p=1;for(;o>0&&(p*=256);)g+=this[n+--o]*p;return g},u.prototype.readUint8=u.prototype.readUInt8=function(n,o){return n=n>>>0,o||lt(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,o){return n=n>>>0,o||lt(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,o){return n=n>>>0,o||lt(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=Ce(function(n){n=n>>>0,tr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Tr(n,this.length-8);const g=o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,p=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(g)+(BigInt(p)<<BigInt(32))}),u.prototype.readBigUInt64BE=Ce(function(n){n=n>>>0,tr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Tr(n,this.length-8);const g=o*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],p=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(g)<<BigInt(32))+BigInt(p)}),u.prototype.readIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||lt(n,o,this.length);let g=this[n],p=1,E=0;for(;++E<o&&(p*=256);)g+=this[n+E]*p;return p*=128,g>=p&&(g-=Math.pow(2,8*o)),g},u.prototype.readIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||lt(n,o,this.length);let g=o,p=1,E=this[n+--g];for(;g>0&&(p*=256);)E+=this[n+--g]*p;return p*=128,E>=p&&(E-=Math.pow(2,8*o)),E},u.prototype.readInt8=function(n,o){return n=n>>>0,o||lt(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,o){n=n>>>0,o||lt(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,o){n=n>>>0,o||lt(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=Ce(function(n){n=n>>>0,tr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Tr(n,this.length-8);const g=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(g)<<BigInt(32))+BigInt(o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=Ce(function(n){n=n>>>0,tr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Tr(n,this.length-8);const g=(o<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(g)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,o){return n=n>>>0,o||lt(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,o){return n=n>>>0,o||lt(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,o){return n=n>>>0,o||lt(n,8,this.length),r.read(this,n,!1,52,8)};function Tt(i,n,o,l,g,p){if(!u.isBuffer(i))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>g||n<p)throw new RangeError('"value" argument is out of bounds');if(o+l>i.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,o,l,g){if(n=+n,o=o>>>0,l=l>>>0,!g){const b=Math.pow(2,8*l)-1;Tt(this,n,o,l,b,0)}let p=1,E=0;for(this[o]=n&255;++E<l&&(p*=256);)this[o+E]=n/p&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,o,l,g){if(n=+n,o=o>>>0,l=l>>>0,!g){const b=Math.pow(2,8*l)-1;Tt(this,n,o,l,b,0)}let p=l-1,E=1;for(this[o+p]=n&255;--p>=0&&(E*=256);)this[o+p]=n/E&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,1,255,0),this[o]=n&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,2,65535,0),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,2,65535,0),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,4,4294967295,0),this[o+3]=n>>>24,this[o+2]=n>>>16,this[o+1]=n>>>8,this[o]=n&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,4,4294967295,0),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4};function HA(i,n,o,l,g){ri(n,l,g,i,o,7);let p=Number(n&BigInt(4294967295));i[o++]=p,p=p>>8,i[o++]=p,p=p>>8,i[o++]=p,p=p>>8,i[o++]=p;let E=Number(n>>BigInt(32)&BigInt(4294967295));return i[o++]=E,E=E>>8,i[o++]=E,E=E>>8,i[o++]=E,E=E>>8,i[o++]=E,o}function vA(i,n,o,l,g){ri(n,l,g,i,o,7);let p=Number(n&BigInt(4294967295));i[o+7]=p,p=p>>8,i[o+6]=p,p=p>>8,i[o+5]=p,p=p>>8,i[o+4]=p;let E=Number(n>>BigInt(32)&BigInt(4294967295));return i[o+3]=E,E=E>>8,i[o+2]=E,E=E>>8,i[o+1]=E,E=E>>8,i[o]=E,o+8}u.prototype.writeBigUInt64LE=Ce(function(n,o=0){return HA(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Ce(function(n,o=0){return vA(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,o,l,g){if(n=+n,o=o>>>0,!g){const tt=Math.pow(2,8*l-1);Tt(this,n,o,l,tt-1,-tt)}let p=0,E=1,b=0;for(this[o]=n&255;++p<l&&(E*=256);)n<0&&b===0&&this[o+p-1]!==0&&(b=1),this[o+p]=(n/E>>0)-b&255;return o+l},u.prototype.writeIntBE=function(n,o,l,g){if(n=+n,o=o>>>0,!g){const tt=Math.pow(2,8*l-1);Tt(this,n,o,l,tt-1,-tt)}let p=l-1,E=1,b=0;for(this[o+p]=n&255;--p>=0&&(E*=256);)n<0&&b===0&&this[o+p+1]!==0&&(b=1),this[o+p]=(n/E>>0)-b&255;return o+l},u.prototype.writeInt8=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,1,127,-128),n<0&&(n=255+n+1),this[o]=n&255,o+1},u.prototype.writeInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,2,32767,-32768),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,2,32767,-32768),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,4,2147483647,-2147483648),this[o]=n&255,this[o+1]=n>>>8,this[o+2]=n>>>16,this[o+3]=n>>>24,o+4},u.prototype.writeInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||Tt(this,n,o,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4},u.prototype.writeBigInt64LE=Ce(function(n,o=0){return HA(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Ce(function(n,o=0){return vA(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function zA(i,n,o,l,g,p){if(o+l>i.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function $A(i,n,o,l,g){return n=+n,o=o>>>0,g||zA(i,n,o,4),r.write(i,n,o,l,23,4),o+4}u.prototype.writeFloatLE=function(n,o,l){return $A(this,n,o,!0,l)},u.prototype.writeFloatBE=function(n,o,l){return $A(this,n,o,!1,l)};function ti(i,n,o,l,g){return n=+n,o=o>>>0,g||zA(i,n,o,8),r.write(i,n,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(n,o,l){return ti(this,n,o,!0,l)},u.prototype.writeDoubleBE=function(n,o,l){return ti(this,n,o,!1,l)},u.prototype.copy=function(n,o,l,g){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!g&&g!==0&&(g=this.length),o>=n.length&&(o=n.length),o||(o=0),g>0&&g<l&&(g=l),g===l||n.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),n.length-o<g-l&&(g=n.length-o+l);const p=g-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,g):Uint8Array.prototype.set.call(n,this.subarray(l,g),o),p},u.prototype.fill=function(n,o,l,g){if(typeof n=="string"){if(typeof o=="string"?(g=o,o=0,l=this.length):typeof l=="string"&&(g=l,l=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!u.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(n.length===1){const E=n.charCodeAt(0);(g==="utf8"&&E<128||g==="latin1")&&(n=E)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let p;if(typeof n=="number")for(p=o;p<l;++p)this[p]=n;else{const E=u.isBuffer(n)?n:u.from(n,g),b=E.length;if(b===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(p=0;p<l-o;++p)this[p+o]=E[p%b]}return this};const $e={};function Fo(i,n,o){$e[i]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${i}]`,this.stack,delete this.name}get code(){return i}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${i}]: ${this.message}`}}}Fo("ERR_BUFFER_OUT_OF_BOUNDS",function(i){return i?`${i} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Fo("ERR_INVALID_ARG_TYPE",function(i,n){return`The "${i}" argument must be of type number. Received type ${typeof n}`},TypeError),Fo("ERR_OUT_OF_RANGE",function(i,n,o){let l=`The value of "${i}" is out of range.`,g=o;return Number.isInteger(o)&&Math.abs(o)>2**32?g=ei(String(o)):typeof o=="bigint"&&(g=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(g=ei(g)),g+="n"),l+=` It must be ${n}. Received ${g}`,l},RangeError);function ei(i){let n="",o=i.length;const l=i[0]==="-"?1:0;for(;o>=l+4;o-=3)n=`_${i.slice(o-3,o)}${n}`;return`${i.slice(0,o)}${n}`}function a0(i,n,o){tr(n,"offset"),(i[n]===void 0||i[n+o]===void 0)&&Tr(n,i.length-(o+1))}function ri(i,n,o,l,g,p){if(i>o||i<n){const E=typeof n=="bigint"?"n":"";let b;throw n===0||n===BigInt(0)?b=`>= 0${E} and < 2${E} ** ${(p+1)*8}${E}`:b=`>= -(2${E} ** ${(p+1)*8-1}${E}) and < 2 ** ${(p+1)*8-1}${E}`,new $e.ERR_OUT_OF_RANGE("value",b,i)}a0(l,g,p)}function tr(i,n){if(typeof i!="number")throw new $e.ERR_INVALID_ARG_TYPE(n,"number",i)}function Tr(i,n,o){throw Math.floor(i)!==i?(tr(i,o),new $e.ERR_OUT_OF_RANGE("offset","an integer",i)):n<0?new $e.ERR_BUFFER_OUT_OF_BOUNDS:new $e.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,i)}const c0=/[^+/0-9A-Za-z-_]/g;function l0(i){if(i=i.split("=")[0],i=i.trim().replace(c0,""),i.length<2)return"";for(;i.length%4!==0;)i=i+"=";return i}function Uo(i,n){n=n||1/0;let o;const l=i.length;let g=null;const p=[];for(let E=0;E<l;++E){if(o=i.charCodeAt(E),o>55295&&o<57344){if(!g){if(o>56319){(n-=3)>-1&&p.push(239,191,189);continue}else if(E+1===l){(n-=3)>-1&&p.push(239,191,189);continue}g=o;continue}if(o<56320){(n-=3)>-1&&p.push(239,191,189),g=o;continue}o=(g-55296<<10|o-56320)+65536}else g&&(n-=3)>-1&&p.push(239,191,189);if(g=null,o<128){if((n-=1)<0)break;p.push(o)}else if(o<2048){if((n-=2)<0)break;p.push(o>>6|192,o&63|128)}else if(o<65536){if((n-=3)<0)break;p.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((n-=4)<0)break;p.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return p}function u0(i){const n=[];for(let o=0;o<i.length;++o)n.push(i.charCodeAt(o)&255);return n}function I0(i,n){let o,l,g;const p=[];for(let E=0;E<i.length&&!((n-=2)<0);++E)o=i.charCodeAt(E),l=o>>8,g=o%256,p.push(g),p.push(l);return p}function ni(i){return e.toByteArray(l0(i))}function bn(i,n,o,l){let g;for(g=0;g<l&&!(g+o>=n.length||g>=i.length);++g)n[g+o]=i[g];return g}function Zt(i,n){return i instanceof n||i!=null&&i.constructor!=null&&i.constructor.name!=null&&i.constructor.name===n.name}function qo(i){return i!==i}const h0=function(){const i="0123456789abcdef",n=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let g=0;g<16;++g)n[l+g]=i[o]+i[g]}return n}();function Ce(i){return typeof BigInt>"u"?g0:i}function g0(){throw new Error("BigInt not supported")}}(Vt)),Vt}var Ke=Ai();const ii=!1,ai=30,ci=4,er=256,Oe=383,rr=256*er,Jt=256*Oe;var N=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(N||{}),ht=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_APPLE_MOUSE=7]="SHOW_APPLE_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t[t.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",t[t.INSTRUCTIONS=14]="INSTRUCTIONS",t))(ht||{}),F=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.SHOW_DEBUG_TAB=3]="SHOW_DEBUG_TAB",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.KEYRELEASE=15]="KEYRELEASE",t[t.MOUSEEVENT=16]="MOUSEEVENT",t[t.PASTE_TEXT=17]="PASTE_TEXT",t[t.APPLE_PRESS=18]="APPLE_PRESS",t[t.APPLE_RELEASE=19]="APPLE_RELEASE",t[t.GET_SAVE_STATE=20]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=21]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=22]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=23]="DRIVE_NEW_DATA",t[t.GAMEPAD=24]="GAMEPAD",t[t.SET_BINARY_BLOCK=25]="SET_BINARY_BLOCK",t[t.SET_CYCLECOUNT=26]="SET_CYCLECOUNT",t[t.SET_MEMORY=27]="SET_MEMORY",t[t.COMM_DATA=28]="COMM_DATA",t[t.MIDI_DATA=29]="MIDI_DATA",t[t.RAMWORKS=30]="RAMWORKS",t[t.MACHINE_NAME=31]="MACHINE_NAME",t[t.SOFTSWITCHES=32]="SOFTSWITCHES",t))(F||{}),Be=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Be||{}),A=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(A||{});const li=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),No=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",z=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const nr=t=>t.split("").map(e=>e.charCodeAt(0)),ui=t=>[t&255,t>>>8&255],Yo=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Wo=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},Mn=new Uint32Array(256).fill(0),Ii=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;Mn[e]=t}},hi=(t,e=0)=>{Mn[255]===0&&Ii();let r=-1;for(let s=e;s<t.length;s++)r=r>>>8^Mn[(r^t[s])&255];return(r^-1)>>>0},gi=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),xo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")};let Qt;const me=Math.trunc(.0028*1020484);let Qn=me/2,Fn=me/2,Rr=me/2,yr=me/2,Xo=0,Go=!1,_o=!1,Un=!1,qn=!1,Pr=!1,Zo=!1,Vo=!1;const or=()=>{Un=!0},Kn=()=>{qn=!0},fi=()=>{Pr=!0},Lr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*me/2),Jo=t=>{Qn=Lr(t)},jo=t=>{Fn=Lr(t)},Ho=t=>{Rr=Lr(t)},vo=t=>{yr=Lr(t)},On=()=>{Zo=Go||Un,Vo=_o||qn,C.PB0.isSet=Zo,C.PB1.isSet=Vo||Pr,C.PB2.isSet=Pr},zo=(t,e)=>{e?Go=t:_o=t,On()},pi=t=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),Xo=t},br=t=>{const e=t-Xo;Z(49252,e<Qn?128:0),Z(49253,e<Fn?128:0),Z(49254,e<Rr?128:0),Z(49255,e<yr?128:0)};let De,Nn,$o=!1;const Si=t=>{Qt=t,$o=!Qt.length||!Qt[0].buttons.length,De=Xi(),Nn=De.gamepad?De.gamepad:Wi},ts=t=>t>-.01&&t<.01,es=(t,e)=>{ts(t)&&(t=0),ts(e)&&(e=0);const r=Math.sqrt(t*t+e*e),s=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-s,t),s),e=Math.min(Math.max(-s,e),s),t=Math.trunc(me*(t+s)/(2*s)),e=Math.trunc(me*(e+s)/(2*s)),[t,e]},Ci=t=>{const[e,r]=es(t[0],t[1]),s=t.length>=6?t[5]:t[3],[c,I]=t.length>=4?es(t[2],s):[0,0];return[e,r,c,I]},rs=t=>{const e=De.joystick?De.joystick(Qt[t].axes,$o):Qt[t].axes,r=Ci(e);t===0?(Qn=r[0],Fn=r[1],Un=!1,qn=!1,Rr=r[2],yr=r[3]):(Rr=r[0],yr=r[1],Pr=!1);let s=!1;Qt[t].buttons.forEach((c,I)=>{c&&(Nn(I,Qt.length>1,t===1),s=!0)}),s||Nn(-1,Qt.length>1,t===1),De.rumble&&De.rumble(),On()},Ei=()=>{Qt&&Qt.length>0&&(rs(0),Qt.length>1&&rs(1))},Bi=t=>{switch(t){case 0:M("JL");break;case 1:M("G",200);break;case 2:Y("M"),M("O");break;case 3:M("L");break;case 4:M("F");break;case 5:Y("P"),M("T");break;case 6:break;case 7:break;case 8:M("Z");break;case 9:{const e=ro();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:break;case 11:break;case 12:M("L");break;case 13:M("M");break;case 14:M("A");break;case 15:M("D");break;case-1:return}};let de=0,we=0,Te=!1;const Mr=.5,mi={address:24835,data:[173,198,9],keymap:{},joystick:t=>t[0]<-Mr?(we=0,de===0||de>2?(de=0,Y("A")):de===1&&Te?M("W"):de===2&&Te&&M("R"),de++,Te=!1,t):t[0]>Mr?(de=0,we===0||we>2?(we=0,Y("D")):we===1&&Te?M("W"):we===2&&Te&&M("R"),we++,Te=!1,t):t[1]<-Mr?(M("C"),t):t[1]>Mr?(M("S"),t):(Te=!0,t),gamepad:Bi,rumble:null,setup:null,helptext:`AZTEC
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
`},Di={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:Y(" ");break;case 12:Y("A");break;case 13:Y("Z");break;case 14:Y("\b");break;case 15:Y("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},di={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},wi={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Qo("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let Yn=14,Wn=14;const Ti={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=B(182,!1);Yn<40&&t<Yn&&Ln({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Yn=t,t=B(183,!1),Wn<40&&t<Wn&&Ln({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Wn=t},setup:null,helptext:`KARATEKA
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
`},ki=t=>{switch(t){case 0:M("A");break;case 1:M("C",50);break;case 2:M("O");break;case 3:M("T");break;case 4:M("\x1B");break;case 5:M("\r");break;case 6:break;case 7:break;case 8:Y("N"),M("'");break;case 9:Y("Y"),M("1");break;case 10:break;case 11:break;case 12:break;case 13:M(" ");break;case 14:break;case 15:M("	");break;case-1:return}},ne=.5,Ri={address:768,data:[141,74,3,132],keymap:{},gamepad:ki,joystick:(t,e)=>{if(e)return t;const r=t[0]<-ne?"\b":t[0]>ne?"":"",s=t[1]<-ne?"\v":t[1]>ne?`
`:"";let c=r+s;return c||(c=t[2]<-ne?"L\b":t[2]>ne?"L":"",c||(c=t[3]<-ne?"L\v":t[3]>ne?`L
`:"")),c&&M(c,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},yi={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},Pi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},Li={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&Ln({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},ns=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,bi=t=>{switch(t){case 1:D(109,255);break;case 12:Y("A");break;case 13:Y("Z");break;case 14:Y("\b");break;case 15:Y("");break}},Qr=.75,Mi=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{D(25025,173),D(25036,64)},helptext:ns},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Qr?"\b":t[0]>Qr?"":t[1]<-Qr?"A":t[1]>Qr?"Z":"";return e&&Y(e),t},gamepad:bi,rumble:null,setup:null,helptext:ns}],Qi={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{GA(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Fi={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},os=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,Ui=t=>{switch(t){case 0:or();break;case 1:Kn();break;case 2:M(" ");break;case 3:M("U");break;case 4:M("\r");break;case 5:M("T");break;case 9:{const e=ro();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:or();break}},qi=()=>{D(5128,0),D(5130,4);let t=5210;D(t,234),D(t+1,234),D(t+2,234),t=5224,D(t,234),D(t+1,234),D(t+2,234)},Ki=()=>{B(49178,!1)<128&&B(49181,!1)<128&&Ln({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},Oi={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:os},Ni={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:Ui,rumble:Ki,setup:qi,helptext:os},Yi={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:or();break;case 1:Kn();break;case 2:M(" ");break;case 3:M("U");break;case 4:M("\r");break;case 5:M(":");break;case 9:{const e=ro();e.includes("'N'")?Y("N"):e.includes("'S'")?Y("S"):e.includes("NUMERIC KEY")?Y("1"):Y("N");break}case 10:or();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},sr=new Array,pt=t=>{Array.isArray(t)?sr.push(...t):sr.push(t)};pt(mi),pt(Di),pt(di),pt(wi),pt(Ti),pt(Ri),pt(yi),pt(Pi),pt(Li),pt(Mi),pt(Qi),pt(Fi),pt(Ni),pt(Oi),pt(Yi);const Wi=(t,e,r)=>{if(r)switch(t){case 0:fi();break;case 1:break;case 12:vo(-1);break;case 13:vo(1);break;case 14:Ho(-1);break;case 15:Ho(1);break}else switch(t){case 0:or();break;case 1:e||Kn();break;case 12:jo(-1);break;case 13:jo(1);break;case 14:Jo(-1);break;case 15:Jo(1);break}},xi={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},ss=t=>{for(const e of sr)if(so(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},Xi=()=>{for(const t of sr)if(so(t.address,t.data))return t;return xi},xn=(t=!1)=>{for(const e of sr)if(so(e.address,e.data)){XA(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(XA(" "),GA(0))},Gi=t=>{Z(49152,t|128,16),Z(49168,t&127,16)},_i=()=>{const t=St(49152)&127;Z(49152,t,16)},Zi=()=>{const t=St(49152)&127;Z(49152,t,32)};let ke="",As=1e9,is=0;const Vi=()=>{const t=performance.now();if(ke!==""&&(St(49152)<128||t-As>3800)){As=t;const e=ke.charCodeAt(0);Gi(e),ke=ke.slice(1),ke.length===0&&t-is>500&&(is=t,FA(!0))}};let as="";const Y=t=>{t===as&&ke.length>0||(as=t,ke+=t)};let cs=0;const M=(t,e=300)=>{const r=performance.now();r-cs<e||(cs=r,Y(t))},Ji=t=>{let e=String.fromCharCode(t);e=ss(e),Y(e)},ji=t=>{t.length===1&&(t=ss(t)),Y(t)},Ne=[],R=(t,e,r,s=!1,c=null)=>{const I={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:s,isSet:!1,setFunc:c};return t>=49152&&(Ne[t-49152]=I),e>=49152&&(Ne[e-49152]=I),r>=49152&&(Ne[r-49152]=I),I},Ye=()=>Math.floor(180*Math.random()),ls=(t,e)=>{t&=11,e?C.BSR_PREWRITE.isSet=!1:t&1?C.BSR_PREWRITE.isSet?C.BSR_WRITE.isSet=!0:C.BSR_PREWRITE.isSet=!0:(C.BSR_PREWRITE.isSet=!1,C.BSR_WRITE.isSet=!1),C.BSRBANK2.isSet=t<=3,C.BSRREADRAM.isSet=[0,3,8,11].includes(t)},C={STORE80:R(49152,49153,49176,!0),RAMRD:R(49154,49155,49171,!0),RAMWRT:R(49156,49157,49172,!0),INTCXROM:R(49158,49159,49173,!0),INTC8ROM:R(49194,0,0),ALTZP:R(49160,49161,49174,!0),SLOTC3ROM:R(49162,49163,49175,!0),COLUMN80:R(49164,49165,49183,!0),ALTCHARSET:R(49166,49167,49182,!0),KBRDSTROBE:R(49168,0,0,!1),BSRBANK2:R(0,0,49169),BSRREADRAM:R(0,0,49170),VBL:R(0,0,49177),CASSOUT:R(49184,0,0),SPEAKER:R(49200,0,0,!1,(t,e)=>{Z(49200,Ye()),X1(e)}),GCSTROBE:R(49216,0,0),EMUBYTE:R(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:R(49232,49233,49178),MIXED:R(49234,49235,49179),PAGE2:R(49236,49237,49180),HIRES:R(49238,49239,49181),AN0:R(49240,49241,0),AN1:R(49242,49243,0),AN2:R(49244,49245,0),DHIRES:R(49247,49246,0),CASSIN1:R(0,0,49248,!1,()=>{Z(49248,Ye())}),PB0:R(0,0,49249),PB1:R(0,0,49250),PB2:R(0,0,49251),JOYSTICK0:R(0,0,49252,!1,(t,e)=>{br(e)}),JOYSTICK1:R(0,0,49253,!1,(t,e)=>{br(e)}),JOYSTICK2:R(0,0,49254,!1,(t,e)=>{br(e)}),JOYSTICK3:R(0,0,49255,!1,(t,e)=>{br(e)}),CASSIN2:R(0,0,49256,!1,()=>{Z(49256,Ye())}),FASTCHIP_LOCK:R(49258,0,0),FASTCHIP_ENABLE:R(49259,0,0),FASTCHIP_SPEED:R(49261,0,0),JOYSTICKRESET:R(0,0,49264,!1,(t,e)=>{pi(e),Z(49264,Ye())}),BANKSEL:R(49267,0,0),LASER128EX:R(49268,0,0),VIDEO7_MONO:R(49274,49275,0),VIDEO7_MIXED:R(49276,49277,0),BSR_PREWRITE:R(49280,0,0),BSR_WRITE:R(49288,0,0)};C.TEXT.isSet=!0;const us=C.COLUMN80.offAddr,Is=C.COLUMN80.onAddr,We=C.DHIRES.onAddr,Fr=C.DHIRES.offAddr,Xn=[us,We,Fr,We,Fr,Is,We],hs=[us,We,Fr,Is,We,Fr,We];let Re=[],ye=[];const Hi=t=>{if(C.VIDEO7_MONO.isSet=!1,C.VIDEO7_MIXED.isSet=!1,!C.HIRES.isSet){Re=[],ye=[];return}let e=!1;Xn[Re.length]===t&&(e=!0,Re.push(t),Re.length===Xn.length&&(C.VIDEO7_MONO.isSet=!0,Re=[])),hs[ye.length]===t&&(e=!0,ye.push(t),ye.length===hs.length&&(C.VIDEO7_MIXED.isSet=!0,ye=[])),e||(Re=[],ye=[])},vi=[49152,49153,49165,49167,49168,49200,49236,49237,49183],gs=(t,e,r)=>{if(t>1048575&&!vi.includes(t)){const c=St(t)>128?1:0;console.log(`${r} $${z(a.PC)}: $${z(t)} [${c}] ${e?"write":""}`)}if(t>=49280&&t<=49295){ls(t&-5,e);return}const s=Ne[t-49152];if(!s){console.error("Unknown softswitch "+z(t)),Z(t,Ye());return}if(t<=49167?e||Vi():(t===49168||t<=49183&&e)&&_i(),s.setFunc){s.setFunc(t,r);return}if(Xn.includes(t)?Hi(t):(Re=[],ye=[]),t===s.offAddr||t===s.onAddr){if((!s.writeOnly||e)&&(Nt[s.offAddr-49152]!==void 0?Nt[s.offAddr-49152]=t===s.onAddr:s.isSet=t===s.onAddr),s.isSetAddr){const c=St(s.isSetAddr);Z(s.isSetAddr,s.isSet?c|128:c&127)}t>=49184&&Z(t,Ye())}else if(t===s.isSetAddr){const c=St(t);Z(t,s.isSet?c|128:c&127)}},zi=()=>{for(const t in C){const e=t;Nt[C[e].offAddr-49152]!==void 0?Nt[C[e].offAddr-49152]=!1:C[e].isSet=!1}Nt[C.TEXT.offAddr-49152]!==void 0?Nt[C.TEXT.offAddr-49152]=!0:C.TEXT.isSet=!0},Nt=[],$i=t=>{if(t>=49280&&t<=49295){ls(t&-5,!1);return}const e=Ne[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+z(t));return}Nt[e.offAddr-49152]===void 0&&(Nt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},ta=()=>{Nt.forEach((t,e)=>{t!==void 0&&(Ne[e].isSet=t)}),Nt.length=0},xe=[],ea=()=>{if(xe.length===0)for(const t in C){const e=C[t],r=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const c=z(e.offAddr)+" "+t;xe[e.offAddr]=c+(r?"-OFF":"")+s}if(e.onAddr>0){const c=z(e.onAddr)+" "+t;xe[e.onAddr]=c+"-ON"+s}if(e.isSetAddr>0){const c=z(e.isSetAddr)+" "+t;xe[e.isSetAddr]=c+"-STATUS"+s}}return xe[49152]="C000 KBRD/STORE80-OFF",xe},ra=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,na=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,fs=new Array(256),Gn={},f=(t,e,r,s)=>{console.assert(!fs[r],"Duplicate instruction: "+t+" mode="+e),fs[r]={name:t,mode:e,bytes:s},Gn[t]||(Gn[t]=[]),Gn[t][e]=r};f("ADC",A.IMM,105,2),f("ADC",A.ZP_REL,101,2),f("ADC",A.ZP_X,117,2),f("ADC",A.ABS,109,3),f("ADC",A.ABS_X,125,3),f("ADC",A.ABS_Y,121,3),f("ADC",A.IND_X,97,2),f("ADC",A.IND_Y,113,2),f("ADC",A.IND,114,2),f("AND",A.IMM,41,2),f("AND",A.ZP_REL,37,2),f("AND",A.ZP_X,53,2),f("AND",A.ABS,45,3),f("AND",A.ABS_X,61,3),f("AND",A.ABS_Y,57,3),f("AND",A.IND_X,33,2),f("AND",A.IND_Y,49,2),f("AND",A.IND,50,2),f("ASL",A.IMPLIED,10,1),f("ASL",A.ZP_REL,6,2),f("ASL",A.ZP_X,22,2),f("ASL",A.ABS,14,3),f("ASL",A.ABS_X,30,3),f("BCC",A.ZP_REL,144,2),f("BCS",A.ZP_REL,176,2),f("BEQ",A.ZP_REL,240,2),f("BIT",A.ZP_REL,36,2),f("BIT",A.ABS,44,3),f("BIT",A.IMM,137,2),f("BIT",A.ZP_X,52,2),f("BIT",A.ABS_X,60,3),f("BMI",A.ZP_REL,48,2),f("BNE",A.ZP_REL,208,2),f("BPL",A.ZP_REL,16,2),f("BVC",A.ZP_REL,80,2),f("BVS",A.ZP_REL,112,2),f("BRA",A.ZP_REL,128,2),f("BRK",A.IMPLIED,0,1),f("CLC",A.IMPLIED,24,1),f("CLD",A.IMPLIED,216,1),f("CLI",A.IMPLIED,88,1),f("CLV",A.IMPLIED,184,1),f("CMP",A.IMM,201,2),f("CMP",A.ZP_REL,197,2),f("CMP",A.ZP_X,213,2),f("CMP",A.ABS,205,3),f("CMP",A.ABS_X,221,3),f("CMP",A.ABS_Y,217,3),f("CMP",A.IND_X,193,2),f("CMP",A.IND_Y,209,2),f("CMP",A.IND,210,2),f("CPX",A.IMM,224,2),f("CPX",A.ZP_REL,228,2),f("CPX",A.ABS,236,3),f("CPY",A.IMM,192,2),f("CPY",A.ZP_REL,196,2),f("CPY",A.ABS,204,3),f("DEC",A.IMPLIED,58,1),f("DEC",A.ZP_REL,198,2),f("DEC",A.ZP_X,214,2),f("DEC",A.ABS,206,3),f("DEC",A.ABS_X,222,3),f("DEX",A.IMPLIED,202,1),f("DEY",A.IMPLIED,136,1),f("EOR",A.IMM,73,2),f("EOR",A.ZP_REL,69,2),f("EOR",A.ZP_X,85,2),f("EOR",A.ABS,77,3),f("EOR",A.ABS_X,93,3),f("EOR",A.ABS_Y,89,3),f("EOR",A.IND_X,65,2),f("EOR",A.IND_Y,81,2),f("EOR",A.IND,82,2),f("INC",A.IMPLIED,26,1),f("INC",A.ZP_REL,230,2),f("INC",A.ZP_X,246,2),f("INC",A.ABS,238,3),f("INC",A.ABS_X,254,3),f("INX",A.IMPLIED,232,1),f("INY",A.IMPLIED,200,1),f("JMP",A.ABS,76,3),f("JMP",A.IND,108,3),f("JMP",A.IND_X,124,3),f("JSR",A.ABS,32,3),f("LDA",A.IMM,169,2),f("LDA",A.ZP_REL,165,2),f("LDA",A.ZP_X,181,2),f("LDA",A.ABS,173,3),f("LDA",A.ABS_X,189,3),f("LDA",A.ABS_Y,185,3),f("LDA",A.IND_X,161,2),f("LDA",A.IND_Y,177,2),f("LDA",A.IND,178,2),f("LDX",A.IMM,162,2),f("LDX",A.ZP_REL,166,2),f("LDX",A.ZP_Y,182,2),f("LDX",A.ABS,174,3),f("LDX",A.ABS_Y,190,3),f("LDY",A.IMM,160,2),f("LDY",A.ZP_REL,164,2),f("LDY",A.ZP_X,180,2),f("LDY",A.ABS,172,3),f("LDY",A.ABS_X,188,3),f("LSR",A.IMPLIED,74,1),f("LSR",A.ZP_REL,70,2),f("LSR",A.ZP_X,86,2),f("LSR",A.ABS,78,3),f("LSR",A.ABS_X,94,3),f("NOP",A.IMPLIED,234,1),f("ORA",A.IMM,9,2),f("ORA",A.ZP_REL,5,2),f("ORA",A.ZP_X,21,2),f("ORA",A.ABS,13,3),f("ORA",A.ABS_X,29,3),f("ORA",A.ABS_Y,25,3),f("ORA",A.IND_X,1,2),f("ORA",A.IND_Y,17,2),f("ORA",A.IND,18,2),f("PHA",A.IMPLIED,72,1),f("PHP",A.IMPLIED,8,1),f("PHX",A.IMPLIED,218,1),f("PHY",A.IMPLIED,90,1),f("PLA",A.IMPLIED,104,1),f("PLP",A.IMPLIED,40,1),f("PLX",A.IMPLIED,250,1),f("PLY",A.IMPLIED,122,1),f("ROL",A.IMPLIED,42,1),f("ROL",A.ZP_REL,38,2),f("ROL",A.ZP_X,54,2),f("ROL",A.ABS,46,3),f("ROL",A.ABS_X,62,3),f("ROR",A.IMPLIED,106,1),f("ROR",A.ZP_REL,102,2),f("ROR",A.ZP_X,118,2),f("ROR",A.ABS,110,3),f("ROR",A.ABS_X,126,3),f("RTI",A.IMPLIED,64,1),f("RTS",A.IMPLIED,96,1),f("SBC",A.IMM,233,2),f("SBC",A.ZP_REL,229,2),f("SBC",A.ZP_X,245,2),f("SBC",A.ABS,237,3),f("SBC",A.ABS_X,253,3),f("SBC",A.ABS_Y,249,3),f("SBC",A.IND_X,225,2),f("SBC",A.IND_Y,241,2),f("SBC",A.IND,242,2),f("SEC",A.IMPLIED,56,1),f("SED",A.IMPLIED,248,1),f("SEI",A.IMPLIED,120,1),f("STA",A.ZP_REL,133,2),f("STA",A.ZP_X,149,2),f("STA",A.ABS,141,3),f("STA",A.ABS_X,157,3),f("STA",A.ABS_Y,153,3),f("STA",A.IND_X,129,2),f("STA",A.IND_Y,145,2),f("STA",A.IND,146,2),f("STX",A.ZP_REL,134,2),f("STX",A.ZP_Y,150,2),f("STX",A.ABS,142,3),f("STY",A.ZP_REL,132,2),f("STY",A.ZP_X,148,2),f("STY",A.ABS,140,3),f("STZ",A.ZP_REL,100,2),f("STZ",A.ZP_X,116,2),f("STZ",A.ABS,156,3),f("STZ",A.ABS_X,158,3),f("TAX",A.IMPLIED,170,1),f("TAY",A.IMPLIED,168,1),f("TSX",A.IMPLIED,186,1),f("TXA",A.IMPLIED,138,1),f("TXS",A.IMPLIED,154,1),f("TYA",A.IMPLIED,152,1),f("TRB",A.ZP_REL,20,2),f("TRB",A.ABS,28,3),f("TSB",A.ZP_REL,4,2),f("TSB",A.ABS,12,3);const oa=65536,ps=65792,Ss=66048,sa=()=>({address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{register:"",address:768,operator:"==",value:128},expression2:{register:"",address:768,operator:"==",value:128},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:""});class Cs extends Map{set(e,r){const s=[...this.entries()];s.push([e,r]),s.sort((c,I)=>c[0]-I[0]),super.clear();for(const[c,I]of s)super.set(c,I);return this}}const rt={};rt[""]={name:"Any",min:0,max:65535},rt.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},rt.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},rt.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},rt["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},rt["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},rt["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},rt["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},rt["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},rt["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(rt).map(t=>t.name);let _n=!1,Zn=!1,Dt=new Cs;const Ur=()=>{_n=!0},Aa=()=>{new Cs(Dt).forEach((s,c)=>{s.once&&Dt.delete(c)});const e=Qa();if(e<0||Dt.get(e))return;const r=sa();r.address=e,r.once=!0,r.hidden=!0,Dt.set(e,r)},ia=t=>{Dt=t};let Es=!1;const aa=()=>{Es=!0,rt.MAIN.enabled=(t=0)=>t>=53248?!C.ALTZP.isSet&&C.BSRREADRAM.isSet:t>=512?!C.RAMRD.isSet:!C.ALTZP.isSet,rt.AUX.enabled=(t=0)=>t>=53248?C.ALTZP.isSet&&C.BSRREADRAM.isSet:t>=512?C.RAMRD.isSet:C.ALTZP.isSet,rt.ROM.enabled=()=>!C.BSRREADRAM.isSet,rt["MAIN-DXXX-1"].enabled=()=>!C.ALTZP.isSet&&C.BSRREADRAM.isSet&&!C.BSRBANK2.isSet,rt["MAIN-DXXX-2"].enabled=()=>!C.ALTZP.isSet&&C.BSRREADRAM.isSet&&C.BSRBANK2.isSet,rt["AUX-DXXX-1"].enabled=()=>C.ALTZP.isSet&&C.BSRREADRAM.isSet&&!C.BSRBANK2.isSet,rt["AUX-DXXX-2"].enabled=()=>C.ALTZP.isSet&&C.BSRREADRAM.isSet&&C.BSRBANK2.isSet,rt["CXXX-ROM"].enabled=(t=0)=>t>=49920&&t<=50175?C.INTCXROM.isSet||!C.SLOTC3ROM.isSet:t>=51200?C.INTCXROM.isSet||C.INTC8ROM.isSet:C.INTCXROM.isSet,rt["CXXX-CARD"].enabled=(t=0)=>t>=49920&&t<=50175?C.INTCXROM.isSet?!1:C.SLOTC3ROM.isSet:t>=51200?!C.INTCXROM.isSet&&!C.INTC8ROM.isSet:!C.INTCXROM.isSet},Bs=(t,e)=>{Es||aa();const r=rt[t];return!(e<r.min||e>r.max||r.enabled&&!(r!=null&&r.enabled(e)))},ms=(t,e,r)=>{const s=Dt.get(t);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!Bs(s.memoryBank,t)?!1:r?s.memset:s.memget},Ar=(t=0,e=!0)=>{e?a.flagIRQ|=1<<t:a.flagIRQ&=~(1<<t),a.flagIRQ&=255},ca=(t=!0)=>{a.flagNMI=t===!0},la=()=>{a.flagIRQ=0,a.flagNMI=!1},Vn=[],Ds=[],ds=(t,e)=>{Vn.push(t),Ds.push(e)},ua=()=>{for(let t=0;t<Vn.length;t++)Vn[t](Ds[t])},ws=t=>{let e=0;switch(t.register){case"$":e=ka(t.address);break;case"A":e=a.Accum;break;case"X":e=a.XReg;break;case"Y":e=a.YReg;break;case"S":e=a.StackPtr;break;case"P":e=a.PStatus;break;case"C":e=a.PC;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},Ia=t=>{const e=ws(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:ws(t.expression2)},Ts=()=>{Zn=!0},ha=(t=-1,e=-1)=>{if(Zn)return Zn=!1,!0;if(Dt.size===0||_n)return!1;const r=Dt.get(a.PC)||Dt.get(-1)||Dt.get(t|oa)||t>=0&&Dt.get(ps)||t>=0&&Dt.get(Ss);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===ps){if(H[t].name!=="???")return!1}else if(r.address===Ss){if(H[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!Ia(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!Bs(r.memoryBank,a.PC)?!1:(r.once&&Dt.delete(a.PC),!0)},Jn=()=>{let t=0;const e=a.PC,r=B(a.PC,!1),s=H[r],c=s.bytes>1?B(a.PC+1,!1):-1,I=s.bytes>2?B(a.PC+2,!1):0;if(ha(r,(I<<8)+c))return Kt(N.PAUSED),-1;_n=!1;const S=bs.get(e);if(S&&!C.INTCXROM.isSet&&S(),t=s.execute(c,I),Ks(s.bytes),ur(a.cycleCount+t),ua(),a.flagNMI&&(a.flagNMI=!1,t=qa(),ur(a.cycleCount+t)),a.flagIRQ){const u=Ua();u>0&&(ur(a.cycleCount+u),t=u)}return t},ga=[197,58,163,92,197,58,163,92],fa=1,ks=4;class pa{constructor(){W(this,"bits",[]);W(this,"pattern",new Array(64));W(this,"patternIdx",0);W(this,"reset",()=>{this.patternIdx=0});W(this,"checkPattern",e=>{const s=ga[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s});W(this,"calcBits",()=>{const e=G=>{this.bits.push(G&8?1:0),this.bits.push(G&4?1:0),this.bits.push(G&2?1:0),this.bits.push(G&1?1:0)},r=G=>{e(Math.floor(G/10)),e(Math.floor(G%10))},s=new Date,c=s.getFullYear()%100,I=s.getDate(),S=s.getDay()+1,u=s.getMonth()+1,m=s.getHours(),L=s.getMinutes(),T=s.getSeconds(),X=s.getMilliseconds()/10;this.bits=[],r(c),r(u),r(I),r(S),r(m),r(L),r(T),r(X)});W(this,"access",e=>{e&ks?this.reset():this.checkPattern(e&fa)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});W(this,"read",e=>{let r=-1;return this.bits.length>0?e&ks&&(r=this.bits.pop()):this.access(e),r})}}const Sa=new pa,Rs=320,ys=327,qr=256*Rs,Ca=256*ys;let Yt=0;const jn=Jt;let P=new Uint8Array(jn+(Yt+1)*65536).fill(0);const Hn=()=>St(49194),Kr=t=>{Z(49194,t)},Pe=()=>St(49267),vn=t=>{Z(49267,t)},at=new Array(257).fill(0),Lt=new Array(257).fill(0),Ps=t=>{let e="";switch(t){case"APPLE2EU":e=na;break;case"APPLE2EE":e=ra;break}const r=e.replace(/\n/g,""),s=new Uint8Array(Ke.Buffer.from(r,"base64"));t==="APPLE2EU"&&(s[15035]=5),P.set(s,rr)},zn=t=>{t=Math.max(64,Math.min(8192,t));const e=Yt;if(Yt=Math.floor(t/64)-1,Yt===e)return;Pe()>Yt&&(vn(0),jt());const r=jn+(Yt+1)*65536;if(Yt<e)P=P.slice(0,r);else{const s=P;P=new Uint8Array(r).fill(255),P.set(s)}},Ea=()=>{const t=C.RAMRD.isSet?Oe+Pe()*256:0,e=C.RAMWRT.isSet?Oe+Pe()*256:0,r=C.PAGE2.isSet?Oe+Pe()*256:0,s=C.STORE80.isSet?r:t,c=C.STORE80.isSet?r:e,I=C.STORE80.isSet&&C.HIRES.isSet?r:t,S=C.STORE80.isSet&&C.HIRES.isSet?r:e;for(let u=2;u<256;u++)at[u]=u+t,Lt[u]=u+e;for(let u=4;u<=7;u++)at[u]=u+s,Lt[u]=u+c;for(let u=32;u<=63;u++)at[u]=u+I,Lt[u]=u+S},Ba=()=>{const t=C.ALTZP.isSet?Oe+Pe()*256:0;if(at[0]=t,at[1]=1+t,Lt[0]=t,Lt[1]=1+t,C.BSRREADRAM.isSet){for(let e=208;e<=255;e++)at[e]=e+t;if(!C.BSRBANK2.isSet)for(let e=208;e<=223;e++)at[e]=e-16+t}else for(let e=208;e<=255;e++)at[e]=er+e-192},ma=()=>{const t=C.ALTZP.isSet?Oe+Pe()*256:0,e=C.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Lt[r]=-1;if(e){for(let r=208;r<=255;r++)Lt[r]=r+t;if(!C.BSRBANK2.isSet)for(let r=208;r<=223;r++)Lt[r]=r-16+t}},Ls=t=>C.INTCXROM.isSet?!1:t!==3?!0:C.SLOTC3ROM.isSet,Da=()=>!!(C.INTCXROM.isSet||C.INTC8ROM.isSet),$n=t=>{if(t<=7){if(C.INTCXROM.isSet)return;t===3&&!C.SLOTC3ROM.isSet&&(C.INTC8ROM.isSet||(C.INTC8ROM.isSet=!0,Kr(255),jt())),Hn()===0&&Qs[t]&&(Kr(t),jt())}else C.INTC8ROM.isSet=!1,Kr(0),jt()},da=()=>{at[192]=er-192;for(let t=1;t<=7;t++){const e=192+t;at[e]=t+(Ls(t)?Rs-1:er)}if(Da())for(let t=200;t<=207;t++)at[t]=er+t-192;else{const t=ys+8*(Hn()-1);for(let e=0;e<=7;e++){const r=200+e;at[r]=t+e}}},jt=()=>{Ea(),Ba(),ma(),da();for(let t=0;t<256;t++)at[t]=256*at[t],Lt[t]=256*Lt[t]},bs=new Map,Ms=new Array(8),Qs=new Uint8Array(8),Or=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&($n(r),!Ls(r)))return;const s=Ms[r];if(s!==void 0){const c=s(t,e);if(c>=0){const I=t>=49408?qr-256:rr;P[t-49152+I]=c}}},ir=(t,e)=>{Ms[t]=e},Xe=(t,e,r=0,s=()=>{})=>{if(P.set(e.slice(0,256),qr+(t-1)*256),e.length>256){const c=e.length>2304?2304:e.length,I=Ca+(t-1)*2048;P.set(e.slice(256,c),I),Qs[t]=255}r&&bs.set(r,s)},wa=()=>{P.fill(255,0,65536),P.fill(255,jn),Kr(0),vn(0),jt()},Ta=t=>(t>=49296?Or(t):gs(t,!1,a.cycleCount),t>=49232&&jt(),P[rr+t-49152]),_=(t,e)=>{const r=qr+(t-1)*256+(e&255);return P[r]},K=(t,e,r)=>{if(r>=0){const s=qr+(t-1)*256+(e&255);P[s]=r&255}},B=(t,e=!0)=>{let r=0;const s=t>>>8;if(s===192)r=Ta(t);else if(r=-1,s>=193&&s<=199?(s==195&&(C.INTCXROM.isSet||!C.SLOTC3ROM.isSet)&&(r=Sa.read(t)),Or(t)):t===53247&&$n(255),r<0){const c=at[s];r=P[c+(t&255)]}return e&&ms(t,r,!1)&&Ts(),r},ka=t=>{const e=t>>>8,r=at[e];return P[r+(t&255)]},Ra=(t,e)=>{if(t===49265||t===49267){if(e>Yt)return;vn(e)}else t>=49296?Or(t,e):gs(t,!0,a.cycleCount);(t<=49167||t>=49232)&&jt()},D=(t,e)=>{const r=t>>>8;if(r===192)Ra(t,e);else{r>=193&&r<=199?Or(t,e):t===53247&&$n(255);const s=Lt[r];if(s<0)return;P[s+(t&255)]=e}ms(t,e,!0)&&Ts()},St=t=>P[rr+t-49152],Z=(t,e,r=1)=>{const s=rr+t-49152;P.fill(e,s,s+r)},to=1024,Fs=2048,Nr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],eo=(t=!1)=>{let e=0,r=24,s=!1;if(t){if(C.TEXT.isSet||C.HIRES.isSet)return new Uint8Array;r=C.MIXED.isSet?20:24,s=C.COLUMN80.isSet&&C.DHIRES.isSet}else{if(!C.TEXT.isSet&&!C.MIXED.isSet)return new Uint8Array;!C.TEXT.isSet&&C.MIXED.isSet&&(e=20),s=C.COLUMN80.isSet}if(s){const u=C.PAGE2.isSet&&!C.STORE80.isSet?Fs:to,m=new Uint8Array(80*(r-e)).fill(160);for(let L=e;L<r;L++){const T=80*(L-e);for(let X=0;X<40;X++)m[T+2*X+1]=P[u+Nr[L]+X],m[T+2*X]=P[Jt+u+Nr[L]+X]}return m}if(C.DHIRES.isSet&&!C.COLUMN80.isSet&&C.STORE80.isSet){const u=new Uint8Array(80*(r-e));for(let m=e;m<r;m++){const L=80*(m-e);let T=to+Nr[m];u.set(P.slice(T,T+40),L),T+=Jt,u.set(P.slice(T,T+40),L+40)}return u}const I=C.PAGE2.isSet?Fs:to,S=new Uint8Array(40*(r-e));for(let u=e;u<r;u++){const m=40*(u-e),L=I+Nr[u];S.set(P.slice(L,L+40),m)}return S},ro=()=>Ke.Buffer.from(eo().map(t=>t&=127)).toString(),ya=()=>{if(C.TEXT.isSet||!C.HIRES.isSet)return new Uint8Array;const t=C.DHIRES.isSet&&C.COLUMN80.isSet,e=C.DHIRES.isSet&&!C.COLUMN80.isSet&&C.STORE80.isSet,r=C.MIXED.isSet?160:192;if(t||C.VIDEO7_MONO.isSet||C.VIDEO7_MONO.isSet||e){const s=C.PAGE2.isSet&&!C.STORE80.isSet?16384:8192,c=new Uint8Array(80*r);for(let I=0;I<r;I++){const S=gi(s,I);for(let u=0;u<40;u++)c[I*80+2*u+1]=P[S+u],c[I*80+2*u]=P[Jt+S+u]}return c}else{const s=C.PAGE2.isSet?16384:8192,c=new Uint8Array(40*r);for(let I=0;I<r;I++){const S=s+40*Math.trunc(I/64)+1024*(I%8)+128*(Math.trunc(I/8)&7);c.set(P.slice(S,S+40),I*40)}return c}},no=t=>{const e=at[t>>>8];return P.slice(e,e+512)},oo=(t,e)=>{const r=Lt[t>>>8]+(t&255);P.set(e,r)},so=(t,e)=>{for(let r=0;r<e.length;r++)if(B(t+r,!1)!==e[r])return!1;return!0},Pa=()=>P.slice(0,Jt+65536),a=li(),ar=t=>{a.Accum=t},cr=t=>{a.XReg=t},lr=t=>{a.YReg=t},ur=t=>{a.cycleCount=t},Us=t=>{qs(),Object.assign(a,t)},qs=()=>{a.Accum=0,a.XReg=0,a.YReg=0,a.PStatus=36,a.StackPtr=255,Wt(B(65533,!1)*256+B(65532,!1)),a.flagIRQ=0,a.flagNMI=!1},Ks=t=>{Wt((a.PC+t+65536)%65536)},Wt=t=>{a.PC=t},Os=t=>{a.PStatus=t|48},xt=new Array(256).fill(""),La=()=>xt.slice(0,256),ba=t=>{xt.splice(0,t.length,...t)},Ma=()=>{const t=no(256).slice(0,256),e=new Array;for(let r=255;r>a.StackPtr;r--){let s="$"+z(t[r]),c=xt[r];xt[r].length>3&&r-1>a.StackPtr&&(xt[r-1]==="JSR"||xt[r-1]==="BRK"||xt[r-1]==="IRQ"?(r--,s+=z(t[r])):c=""),s=(s+"   ").substring(0,6),e.push(z(256+r,4)+": "+s+c)}return e.join(`
`)},Qa=()=>{const t=no(256).slice(0,256);for(let e=a.StackPtr-2;e<=255;e++){const r=t[e];if(xt[e].startsWith("JSR")&&e-1>a.StackPtr&&xt[e-1]==="JSR"){const s=t[e-1]+1;return(r<<8)+s}}return-1},Ht=(t,e)=>{xt[a.StackPtr]=t,D(256+a.StackPtr,e),a.StackPtr=(a.StackPtr+255)%256},vt=()=>{a.StackPtr=(a.StackPtr+1)%256;const t=B(256+a.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},bt=()=>(a.PStatus&1)!==0,U=(t=!0)=>a.PStatus=t?a.PStatus|1:a.PStatus&254,Ns=()=>(a.PStatus&2)!==0,Ir=(t=!0)=>a.PStatus=t?a.PStatus|2:a.PStatus&253,Fa=()=>(a.PStatus&4)!==0,Ao=(t=!0)=>a.PStatus=t?a.PStatus|4:a.PStatus&251,Ys=()=>(a.PStatus&8)!==0,st=()=>Ys()?1:0,io=(t=!0)=>a.PStatus=t?a.PStatus|8:a.PStatus&247,ao=(t=!0)=>a.PStatus=t?a.PStatus|16:a.PStatus&239,Ws=()=>(a.PStatus&64)!==0,hr=(t=!0)=>a.PStatus=t?a.PStatus|64:a.PStatus&191,xs=()=>(a.PStatus&128)!==0,Xs=(t=!0)=>a.PStatus=t?a.PStatus|128:a.PStatus&127,k=t=>{Ir(t===0),Xs(t>=128)},Q=(t,e)=>(t+e+256)%256,d=(t,e)=>e*256+t,O=(t,e,r)=>(e*256+t+r+65536)%65536,$=(t,e)=>t>>8!==e>>8?1:0,zt=(t,e)=>{if(t){const r=a.PC;return Ks(e>127?e-256:e),3+$(r+2,a.PC+2)}return 2},H=new Array(256),h=(t,e,r,s,c,I=!1)=>{console.assert(!H[r],"Duplicate instruction: "+t+" mode="+e),H[r]={name:t,pcode:r,mode:e,bytes:s,execute:c,is6502:!I}},V=!0,oe=(t,e,r)=>{const s=B(t),c=B((t+1)%256),I=O(s,c,a.YReg);e(I);let S=5+$(I,d(s,c));return r&&(S+=st()),S},se=(t,e,r)=>{const s=B(t),c=B((t+1)%256),I=d(s,c);e(I);let S=5;return r&&(S+=st()),S},Gs=t=>{let e=(a.Accum&15)+(t&15)+(bt()?1:0);e>=10&&(e+=6);let r=(a.Accum&240)+(t&240)+e;const s=a.Accum<=127&&t<=127,c=a.Accum>=128&&t>=128;hr((r&255)>=128?s:c),U(r>=160),bt()&&(r+=96),a.Accum=r&255,k(a.Accum)},Yr=t=>{let e=a.Accum+t+(bt()?1:0);U(e>=256),e=e%256;const r=a.Accum<=127&&t<=127,s=a.Accum>=128&&t>=128;hr(e>=128?r:s),a.Accum=e,k(a.Accum)},Ae=t=>{Ys()?Gs(B(t)):Yr(B(t))};h("ADC",A.IMM,105,2,t=>(st()?Gs(t):Yr(t),2+st())),h("ADC",A.ZP_REL,101,2,t=>(Ae(t),3+st())),h("ADC",A.ZP_X,117,2,t=>(Ae(Q(t,a.XReg)),4+st())),h("ADC",A.ABS,109,3,(t,e)=>(Ae(d(t,e)),4+st())),h("ADC",A.ABS_X,125,3,(t,e)=>{const r=O(t,e,a.XReg);return Ae(r),4+st()+$(r,d(t,e))}),h("ADC",A.ABS_Y,121,3,(t,e)=>{const r=O(t,e,a.YReg);return Ae(r),4+st()+$(r,d(t,e))}),h("ADC",A.IND_X,97,2,t=>{const e=Q(t,a.XReg);return Ae(d(B(e),B(e+1))),6+st()}),h("ADC",A.IND_Y,113,2,t=>oe(t,Ae,!0)),h("ADC",A.IND,114,2,t=>se(t,Ae,!0),V);const ie=t=>{a.Accum&=B(t),k(a.Accum)};h("AND",A.IMM,41,2,t=>(a.Accum&=t,k(a.Accum),2)),h("AND",A.ZP_REL,37,2,t=>(ie(t),3)),h("AND",A.ZP_X,53,2,t=>(ie(Q(t,a.XReg)),4)),h("AND",A.ABS,45,3,(t,e)=>(ie(d(t,e)),4)),h("AND",A.ABS_X,61,3,(t,e)=>{const r=O(t,e,a.XReg);return ie(r),4+$(r,d(t,e))}),h("AND",A.ABS_Y,57,3,(t,e)=>{const r=O(t,e,a.YReg);return ie(r),4+$(r,d(t,e))}),h("AND",A.IND_X,33,2,t=>{const e=Q(t,a.XReg);return ie(d(B(e),B(e+1))),6}),h("AND",A.IND_Y,49,2,t=>oe(t,ie,!1)),h("AND",A.IND,50,2,t=>se(t,ie,!1),V);const Wr=t=>{let e=B(t);B(t),U((e&128)===128),e=(e<<1)%256,D(t,e),k(e)};h("ASL",A.IMPLIED,10,1,()=>(U((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256,k(a.Accum),2)),h("ASL",A.ZP_REL,6,2,t=>(Wr(t),5)),h("ASL",A.ZP_X,22,2,t=>(Wr(Q(t,a.XReg)),6)),h("ASL",A.ABS,14,3,(t,e)=>(Wr(d(t,e)),6)),h("ASL",A.ABS_X,30,3,(t,e)=>{const r=O(t,e,a.XReg);return Wr(r),6+$(r,d(t,e))}),h("BCC",A.ZP_REL,144,2,t=>zt(!bt(),t)),h("BCS",A.ZP_REL,176,2,t=>zt(bt(),t)),h("BEQ",A.ZP_REL,240,2,t=>zt(Ns(),t)),h("BMI",A.ZP_REL,48,2,t=>zt(xs(),t)),h("BNE",A.ZP_REL,208,2,t=>zt(!Ns(),t)),h("BPL",A.ZP_REL,16,2,t=>zt(!xs(),t)),h("BVC",A.ZP_REL,80,2,t=>zt(!Ws(),t)),h("BVS",A.ZP_REL,112,2,t=>zt(Ws(),t)),h("BRA",A.ZP_REL,128,2,t=>zt(!0,t),V);const xr=t=>{Ir((a.Accum&t)===0),Xs((t&128)!==0),hr((t&64)!==0)};h("BIT",A.ZP_REL,36,2,t=>(xr(B(t)),3)),h("BIT",A.ABS,44,3,(t,e)=>(xr(B(d(t,e))),4)),h("BIT",A.IMM,137,2,t=>(Ir((a.Accum&t)===0),2),V),h("BIT",A.ZP_X,52,2,t=>(xr(B(Q(t,a.XReg))),4),V),h("BIT",A.ABS_X,60,3,(t,e)=>{const r=O(t,e,a.XReg);return xr(B(r)),4+$(r,d(t,e))},V);const co=(t,e,r=0)=>{const s=(a.PC+r)%65536,c=B(e),I=B(e+1);Ht(`${t} $`+z(I)+z(c),Math.trunc(s/256)),Ht(t,s%256),Ht("P",a.PStatus),io(!1),Ao();const S=O(c,I,t==="BRK"?-1:0);Wt(S)},_s=()=>(ao(),co("BRK",65534,2),7);h("BRK",A.IMPLIED,0,1,_s);const Ua=()=>Fa()?0:(ao(!1),co("IRQ",65534),7),qa=()=>(co("NMI",65530),7);h("CLC",A.IMPLIED,24,1,()=>(U(!1),2)),h("CLD",A.IMPLIED,216,1,()=>(io(!1),2)),h("CLI",A.IMPLIED,88,1,()=>(Ao(!1),2)),h("CLV",A.IMPLIED,184,1,()=>(hr(!1),2));const Le=t=>{const e=B(t);U(a.Accum>=e),k((a.Accum-e+256)%256)},Ka=t=>{const e=B(t);U(a.Accum>=e),k((a.Accum-e+256)%256)};h("CMP",A.IMM,201,2,t=>(U(a.Accum>=t),k((a.Accum-t+256)%256),2)),h("CMP",A.ZP_REL,197,2,t=>(Le(t),3)),h("CMP",A.ZP_X,213,2,t=>(Le(Q(t,a.XReg)),4)),h("CMP",A.ABS,205,3,(t,e)=>(Le(d(t,e)),4)),h("CMP",A.ABS_X,221,3,(t,e)=>{const r=O(t,e,a.XReg);return Ka(r),4+$(r,d(t,e))}),h("CMP",A.ABS_Y,217,3,(t,e)=>{const r=O(t,e,a.YReg);return Le(r),4+$(r,d(t,e))}),h("CMP",A.IND_X,193,2,t=>{const e=Q(t,a.XReg);return Le(d(B(e),B(e+1))),6}),h("CMP",A.IND_Y,209,2,t=>oe(t,Le,!1)),h("CMP",A.IND,210,2,t=>se(t,Le,!1),V);const Zs=t=>{const e=B(t);U(a.XReg>=e),k((a.XReg-e+256)%256)};h("CPX",A.IMM,224,2,t=>(U(a.XReg>=t),k((a.XReg-t+256)%256),2)),h("CPX",A.ZP_REL,228,2,t=>(Zs(t),3)),h("CPX",A.ABS,236,3,(t,e)=>(Zs(d(t,e)),4));const Vs=t=>{const e=B(t);U(a.YReg>=e),k((a.YReg-e+256)%256)};h("CPY",A.IMM,192,2,t=>(U(a.YReg>=t),k((a.YReg-t+256)%256),2)),h("CPY",A.ZP_REL,196,2,t=>(Vs(t),3)),h("CPY",A.ABS,204,3,(t,e)=>(Vs(d(t,e)),4));const Xr=t=>{const e=Q(B(t),-1);D(t,e),k(e)};h("DEC",A.IMPLIED,58,1,()=>(a.Accum=Q(a.Accum,-1),k(a.Accum),2),V),h("DEC",A.ZP_REL,198,2,t=>(Xr(t),5)),h("DEC",A.ZP_X,214,2,t=>(Xr(Q(t,a.XReg)),6)),h("DEC",A.ABS,206,3,(t,e)=>(Xr(d(t,e)),6)),h("DEC",A.ABS_X,222,3,(t,e)=>{const r=O(t,e,a.XReg);return B(r),Xr(r),7}),h("DEX",A.IMPLIED,202,1,()=>(a.XReg=Q(a.XReg,-1),k(a.XReg),2)),h("DEY",A.IMPLIED,136,1,()=>(a.YReg=Q(a.YReg,-1),k(a.YReg),2));const ae=t=>{a.Accum^=B(t),k(a.Accum)};h("EOR",A.IMM,73,2,t=>(a.Accum^=t,k(a.Accum),2)),h("EOR",A.ZP_REL,69,2,t=>(ae(t),3)),h("EOR",A.ZP_X,85,2,t=>(ae(Q(t,a.XReg)),4)),h("EOR",A.ABS,77,3,(t,e)=>(ae(d(t,e)),4)),h("EOR",A.ABS_X,93,3,(t,e)=>{const r=O(t,e,a.XReg);return ae(r),4+$(r,d(t,e))}),h("EOR",A.ABS_Y,89,3,(t,e)=>{const r=O(t,e,a.YReg);return ae(r),4+$(r,d(t,e))}),h("EOR",A.IND_X,65,2,t=>{const e=Q(t,a.XReg);return ae(d(B(e),B(e+1))),6}),h("EOR",A.IND_Y,81,2,t=>oe(t,ae,!1)),h("EOR",A.IND,82,2,t=>se(t,ae,!1),V);const Gr=t=>{const e=Q(B(t),1);D(t,e),k(e)};h("INC",A.IMPLIED,26,1,()=>(a.Accum=Q(a.Accum,1),k(a.Accum),2),V),h("INC",A.ZP_REL,230,2,t=>(Gr(t),5)),h("INC",A.ZP_X,246,2,t=>(Gr(Q(t,a.XReg)),6)),h("INC",A.ABS,238,3,(t,e)=>(Gr(d(t,e)),6)),h("INC",A.ABS_X,254,3,(t,e)=>{const r=O(t,e,a.XReg);return B(r),Gr(r),7}),h("INX",A.IMPLIED,232,1,()=>(a.XReg=Q(a.XReg,1),k(a.XReg),2)),h("INY",A.IMPLIED,200,1,()=>(a.YReg=Q(a.YReg,1),k(a.YReg),2)),h("JMP",A.ABS,76,3,(t,e)=>(Wt(O(t,e,-3)),3)),h("JMP",A.IND,108,3,(t,e)=>{const r=d(t,e);return t=B(r),e=B((r+1)%65536),Wt(O(t,e,-3)),6}),h("JMP",A.IND_X,124,3,(t,e)=>{const r=O(t,e,a.XReg);return t=B(r),e=B((r+1)%65536),Wt(O(t,e,-3)),6},V),h("JSR",A.ABS,32,3,(t,e)=>{const r=(a.PC+2)%65536;return Ht("JSR $"+z(e)+z(t),Math.trunc(r/256)),Ht("JSR",r%256),Wt(O(t,e,-3)),6});const ce=t=>{a.Accum=B(t),k(a.Accum)};h("LDA",A.IMM,169,2,t=>(a.Accum=t,k(a.Accum),2)),h("LDA",A.ZP_REL,165,2,t=>(ce(t),3)),h("LDA",A.ZP_X,181,2,t=>(ce(Q(t,a.XReg)),4)),h("LDA",A.ABS,173,3,(t,e)=>(ce(d(t,e)),4)),h("LDA",A.ABS_X,189,3,(t,e)=>{const r=O(t,e,a.XReg);return ce(r),4+$(r,d(t,e))}),h("LDA",A.ABS_Y,185,3,(t,e)=>{const r=O(t,e,a.YReg);return ce(r),4+$(r,d(t,e))}),h("LDA",A.IND_X,161,2,t=>{const e=Q(t,a.XReg);return ce(d(B(e),B((e+1)%256))),6}),h("LDA",A.IND_Y,177,2,t=>oe(t,ce,!1)),h("LDA",A.IND,178,2,t=>se(t,ce,!1),V);const _r=t=>{a.XReg=B(t),k(a.XReg)};h("LDX",A.IMM,162,2,t=>(a.XReg=t,k(a.XReg),2)),h("LDX",A.ZP_REL,166,2,t=>(_r(t),3)),h("LDX",A.ZP_Y,182,2,t=>(_r(Q(t,a.YReg)),4)),h("LDX",A.ABS,174,3,(t,e)=>(_r(d(t,e)),4)),h("LDX",A.ABS_Y,190,3,(t,e)=>{const r=O(t,e,a.YReg);return _r(r),4+$(r,d(t,e))});const Zr=t=>{a.YReg=B(t),k(a.YReg)};h("LDY",A.IMM,160,2,t=>(a.YReg=t,k(a.YReg),2)),h("LDY",A.ZP_REL,164,2,t=>(Zr(t),3)),h("LDY",A.ZP_X,180,2,t=>(Zr(Q(t,a.XReg)),4)),h("LDY",A.ABS,172,3,(t,e)=>(Zr(d(t,e)),4)),h("LDY",A.ABS_X,188,3,(t,e)=>{const r=O(t,e,a.XReg);return Zr(r),4+$(r,d(t,e))});const Vr=t=>{let e=B(t);B(t),U((e&1)===1),e>>=1,D(t,e),k(e)};h("LSR",A.IMPLIED,74,1,()=>(U((a.Accum&1)===1),a.Accum>>=1,k(a.Accum),2)),h("LSR",A.ZP_REL,70,2,t=>(Vr(t),5)),h("LSR",A.ZP_X,86,2,t=>(Vr(Q(t,a.XReg)),6)),h("LSR",A.ABS,78,3,(t,e)=>(Vr(d(t,e)),6)),h("LSR",A.ABS_X,94,3,(t,e)=>{const r=O(t,e,a.XReg);return Vr(r),6+$(r,d(t,e))}),h("NOP",A.IMPLIED,234,1,()=>2);const le=t=>{a.Accum|=B(t),k(a.Accum)};h("ORA",A.IMM,9,2,t=>(a.Accum|=t,k(a.Accum),2)),h("ORA",A.ZP_REL,5,2,t=>(le(t),3)),h("ORA",A.ZP_X,21,2,t=>(le(Q(t,a.XReg)),4)),h("ORA",A.ABS,13,3,(t,e)=>(le(d(t,e)),4)),h("ORA",A.ABS_X,29,3,(t,e)=>{const r=O(t,e,a.XReg);return le(r),4+$(r,d(t,e))}),h("ORA",A.ABS_Y,25,3,(t,e)=>{const r=O(t,e,a.YReg);return le(r),4+$(r,d(t,e))}),h("ORA",A.IND_X,1,2,t=>{const e=Q(t,a.XReg);return le(d(B(e),B(e+1))),6}),h("ORA",A.IND_Y,17,2,t=>oe(t,le,!1)),h("ORA",A.IND,18,2,t=>se(t,le,!1),V),h("PHA",A.IMPLIED,72,1,()=>(Ht("PHA",a.Accum),3)),h("PHP",A.IMPLIED,8,1,()=>(Ht("PHP",a.PStatus|16),3)),h("PHX",A.IMPLIED,218,1,()=>(Ht("PHX",a.XReg),3),V),h("PHY",A.IMPLIED,90,1,()=>(Ht("PHY",a.YReg),3),V),h("PLA",A.IMPLIED,104,1,()=>(a.Accum=vt(),k(a.Accum),4)),h("PLP",A.IMPLIED,40,1,()=>(Os(vt()),4)),h("PLX",A.IMPLIED,250,1,()=>(a.XReg=vt(),k(a.XReg),4),V),h("PLY",A.IMPLIED,122,1,()=>(a.YReg=vt(),k(a.YReg),4),V);const Jr=t=>{let e=B(t);B(t);const r=bt()?1:0;U((e&128)===128),e=(e<<1)%256|r,D(t,e),k(e)};h("ROL",A.IMPLIED,42,1,()=>{const t=bt()?1:0;return U((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256|t,k(a.Accum),2}),h("ROL",A.ZP_REL,38,2,t=>(Jr(t),5)),h("ROL",A.ZP_X,54,2,t=>(Jr(Q(t,a.XReg)),6)),h("ROL",A.ABS,46,3,(t,e)=>(Jr(d(t,e)),6)),h("ROL",A.ABS_X,62,3,(t,e)=>{const r=O(t,e,a.XReg);return Jr(r),6+$(r,d(t,e))});const jr=t=>{let e=B(t);B(t);const r=bt()?128:0;U((e&1)===1),e=e>>1|r,D(t,e),k(e)};h("ROR",A.IMPLIED,106,1,()=>{const t=bt()?128:0;return U((a.Accum&1)===1),a.Accum=a.Accum>>1|t,k(a.Accum),2}),h("ROR",A.ZP_REL,102,2,t=>(jr(t),5)),h("ROR",A.ZP_X,118,2,t=>(jr(Q(t,a.XReg)),6)),h("ROR",A.ABS,110,3,(t,e)=>(jr(d(t,e)),6)),h("ROR",A.ABS_X,126,3,(t,e)=>{const r=O(t,e,a.XReg);return jr(r),6+$(r,d(t,e))}),h("RTI",A.IMPLIED,64,1,()=>(Os(vt()),ao(!1),Wt(d(vt(),vt())-1),6)),h("RTS",A.IMPLIED,96,1,()=>(Wt(d(vt(),vt())),6));const Js=t=>{const e=255-t;let r=a.Accum+e+(bt()?1:0);const s=r>=256,c=a.Accum<=127&&e<=127,I=a.Accum>=128&&e>=128;hr(r%256>=128?c:I);const S=(a.Accum&15)-(t&15)+(bt()?0:-1);r=a.Accum-t+(bt()?0:-1),r<0&&(r-=96),S<0&&(r-=6),a.Accum=r&255,k(a.Accum),U(s)},ue=t=>{st()?Js(B(t)):Yr(255-B(t))};h("SBC",A.IMM,233,2,t=>(st()?Js(t):Yr(255-t),2+st())),h("SBC",A.ZP_REL,229,2,t=>(ue(t),3+st())),h("SBC",A.ZP_X,245,2,t=>(ue(Q(t,a.XReg)),4+st())),h("SBC",A.ABS,237,3,(t,e)=>(ue(d(t,e)),4+st())),h("SBC",A.ABS_X,253,3,(t,e)=>{const r=O(t,e,a.XReg);return ue(r),4+st()+$(r,d(t,e))}),h("SBC",A.ABS_Y,249,3,(t,e)=>{const r=O(t,e,a.YReg);return ue(r),4+st()+$(r,d(t,e))}),h("SBC",A.IND_X,225,2,t=>{const e=Q(t,a.XReg);return ue(d(B(e),B(e+1))),6+st()}),h("SBC",A.IND_Y,241,2,t=>oe(t,ue,!0)),h("SBC",A.IND,242,2,t=>se(t,ue,!0),V),h("SEC",A.IMPLIED,56,1,()=>(U(),2)),h("SED",A.IMPLIED,248,1,()=>(io(),2)),h("SEI",A.IMPLIED,120,1,()=>(Ao(),2)),h("STA",A.ZP_REL,133,2,t=>(D(t,a.Accum),3)),h("STA",A.ZP_X,149,2,t=>(D(Q(t,a.XReg),a.Accum),4)),h("STA",A.ABS,141,3,(t,e)=>(D(d(t,e),a.Accum),4)),h("STA",A.ABS_X,157,3,(t,e)=>{const r=O(t,e,a.XReg);return B(r),D(r,a.Accum),5}),h("STA",A.ABS_Y,153,3,(t,e)=>(D(O(t,e,a.YReg),a.Accum),5)),h("STA",A.IND_X,129,2,t=>{const e=Q(t,a.XReg);return D(d(B(e),B(e+1)),a.Accum),6});const js=t=>{D(t,a.Accum)};h("STA",A.IND_Y,145,2,t=>(oe(t,js,!1),6)),h("STA",A.IND,146,2,t=>se(t,js,!1),V),h("STX",A.ZP_REL,134,2,t=>(D(t,a.XReg),3)),h("STX",A.ZP_Y,150,2,t=>(D(Q(t,a.YReg),a.XReg),4)),h("STX",A.ABS,142,3,(t,e)=>(D(d(t,e),a.XReg),4)),h("STY",A.ZP_REL,132,2,t=>(D(t,a.YReg),3)),h("STY",A.ZP_X,148,2,t=>(D(Q(t,a.XReg),a.YReg),4)),h("STY",A.ABS,140,3,(t,e)=>(D(d(t,e),a.YReg),4)),h("STZ",A.ZP_REL,100,2,t=>(D(t,0),3),V),h("STZ",A.ZP_X,116,2,t=>(D(Q(t,a.XReg),0),4),V),h("STZ",A.ABS,156,3,(t,e)=>(D(d(t,e),0),4),V),h("STZ",A.ABS_X,158,3,(t,e)=>{const r=O(t,e,a.XReg);return B(r),D(r,0),5},V),h("TAX",A.IMPLIED,170,1,()=>(a.XReg=a.Accum,k(a.XReg),2)),h("TAY",A.IMPLIED,168,1,()=>(a.YReg=a.Accum,k(a.YReg),2)),h("TSX",A.IMPLIED,186,1,()=>(a.XReg=a.StackPtr,k(a.XReg),2)),h("TXA",A.IMPLIED,138,1,()=>(a.Accum=a.XReg,k(a.Accum),2)),h("TXS",A.IMPLIED,154,1,()=>(a.StackPtr=a.XReg,2)),h("TYA",A.IMPLIED,152,1,()=>(a.Accum=a.YReg,k(a.Accum),2));const Hs=t=>{const e=B(t);Ir((a.Accum&e)===0),D(t,e&~a.Accum)};h("TRB",A.ZP_REL,20,2,t=>(Hs(t),5),V),h("TRB",A.ABS,28,3,(t,e)=>(Hs(d(t,e)),6),V);const vs=t=>{const e=B(t);Ir((a.Accum&e)===0),D(t,e|a.Accum)};h("TSB",A.ZP_REL,4,2,t=>(vs(t),5),V),h("TSB",A.ABS,12,3,(t,e)=>(vs(d(t,e)),6),V);const Oa=[2,34,66,98,130,194,226],Mt="???";Oa.forEach(t=>{h(Mt,A.IMPLIED,t,2,()=>2),H[t].is6502=!1});for(let t=0;t<=15;t++)h(Mt,A.IMPLIED,3+16*t,1,()=>1),H[3+16*t].is6502=!1,h(Mt,A.IMPLIED,7+16*t,1,()=>1),H[7+16*t].is6502=!1,h(Mt,A.IMPLIED,11+16*t,1,()=>1),H[11+16*t].is6502=!1,h(Mt,A.IMPLIED,15+16*t,1,()=>1),H[15+16*t].is6502=!1;h(Mt,A.IMPLIED,68,2,()=>3),H[68].is6502=!1,h(Mt,A.IMPLIED,84,2,()=>4),H[84].is6502=!1,h(Mt,A.IMPLIED,212,2,()=>4),H[212].is6502=!1,h(Mt,A.IMPLIED,244,2,()=>4),H[244].is6502=!1,h(Mt,A.IMPLIED,92,3,()=>8),H[92].is6502=!1,h(Mt,A.IMPLIED,220,3,()=>4),H[220].is6502=!1,h(Mt,A.IMPLIED,252,3,()=>4),H[252].is6502=!1;for(let t=0;t<256;t++)H[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),h("BRK",A.IMPLIED,t,1,_s));const Na=()=>{const t=new Array(256);for(let e=0;e<256;e++)t[e]={name:H[e].name,mode:H[e].mode,pcode:H[e].pcode,bytes:H[e].bytes,is6502:H[e].is6502};H1(t)},gt=(t,e,r)=>{const s=e&7,c=e>>>3;return t[c]|=r>>>s,s&&(t[c+1]|=r<<8-s),e+8},Hr=(t,e,r)=>(e=gt(t,e,r>>>1|170),e=gt(t,e,r|170),e),lo=(t,e)=>(e=gt(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Ya=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),s=[0,2,1,3];for(let I=0;I<84;I++)r[I]=s[t[I]&3]|s[t[I+86]&3]<<2|s[t[I+172]&3]<<4;r[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,r[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let I=0;I<256;I++)r[86+I]=t[I]>>>2;r[342]=r[341];let c=342;for(;c>1;)c--,r[c]^=r[c-1];for(let I=0;I<343;I++)r[I]=e[r[I]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Wa=(t,e,r)=>{let s=0;const c=new Uint8Array(6646).fill(0);for(let I=0;I<16;I++)s=lo(c,s);for(let I=0;I<16;I++){s=gt(c,s,213),s=gt(c,s,170),s=gt(c,s,150),s=Hr(c,s,254),s=Hr(c,s,e),s=Hr(c,s,I),s=Hr(c,s,254^e^I),s=gt(c,s,222),s=gt(c,s,170),s=gt(c,s,235);for(let m=0;m<7;m++)s=lo(c,s);s=gt(c,s,213),s=gt(c,s,170),s=gt(c,s,173);const S=I===15?15:I*(r?8:7)%15,u=Ya(t.slice(S*256,S*256+256));for(let m=0;m<u.length;m++)s=gt(c,s,u[m]);s=gt(c,s,222),s=gt(c,s,170),s=gt(c,s,235);for(let m=0;m<16;m++)s=lo(c,s)}return c},xa=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const s=new Uint8Array(1536+r*13*512).fill(0);s.set(nr(`WOZ2ÿ
\r
`),0),s.set(nr("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(nr("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(nr("TMAP"),80),s[84]=160,s.fill(255,88,248);let c=0;for(let I=0;I<r;I++)c=88+(I<<2),I>0&&(s[c-1]=I),s[c]=s[c+1]=I;s.set(nr("TRKS"),248),s.set(Yo(1280+r*13*512),252);for(let I=0;I<r;I++){c=256+(I<<3),s.set(ui(3+I*13),c),s[c+2]=13,s.set(Yo(50304),c+4);const S=t.slice(I*16*256,(I+1)*16*256),u=Wa(S,I,e);c=1536+I*13*512,s.set(u,c)}return s},Xa=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,m)=>u!==e[m])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1,t.optimalTiming=e[59]>0?e[59]:32,t.optimalTiming!==32&&console.log(`${t.filename} optimal timing = ${t.optimalTiming}`);const c=e.slice(8,12),I=c[0]+(c[1]<<8)+(c[2]<<16)+c[3]*2**24,S=hi(e,12);if(I!==0&&I!==S)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<160;u++){const m=e[88+u];if(m<255){const L=256+8*m,T=e.slice(L,L+8);t.trackStart[u]=512*((T[1]<<8)+T[0]),t.trackNbits[u]=T[4]+(T[5]<<8)+(T[6]<<16)+T[7]*2**24,t.maxQuarterTrack=u}}return!0},Ga=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((c,I)=>c!==e[I])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let c=0;c<160;c++){const I=e[88+c];if(I<255){t.trackStart[c]=256+I*6656;const S=e.slice(t.trackStart[c]+6646,t.trackStart[c]+6656);t.trackNbits[c]=S[2]+(S[3]<<8),t.maxQuarterTrack=c}}return!0},_a=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return r||s},Za=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),c=xa(e,s);return c.length===0?new Uint8Array:(t.filename=Wo(t.filename,"woz"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),c)},zs=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Va=(t,e)=>{const r=zs(e.slice(24,28)),s=zs(e.slice(28,32));let c="";for(let I=0;I<ci;I++)c+=String.fromCharCode(e[I]);return c!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Wo(t.filename,"hdv"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),e.slice(r,r+s))},Ja=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(xo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return Va(t,e)}return _a(t.filename)&&(e=Za(t,e)),Xa(t,e)||Ga(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},ja=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ge=0,Ct=0,Et=0,vr=!1,uo=!1;const Ha=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],va=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],za=t=>{vr=!1,oA(t),t.quarterTrack=t.maxQuarterTrack,t.prevQuarterTrack=t.maxQuarterTrack},$a=(t=!1)=>{if(t){const e=en();e.motorRunning&&sA(e)}else ze(Be.MOTOR_OFF)};let zr=0;const tc=(t,e,r)=>{zr=0,t.prevQuarterTrack=t.quarterTrack,t.quarterTrack+=e,t.quarterTrack<0||t.quarterTrack>t.maxQuarterTrack?(ze(Be.TRACK_END),t.quarterTrack=Math.max(0,Math.min(t.quarterTrack,t.maxQuarterTrack))):ze(Be.TRACK_SEEK),t.status=` Trk ${t.quarterTrack/4}`,Rt(),Et+=r,t.trackLocation+=Math.floor(Et/4),Et=Et%4,t.quarterTrack!=t.prevQuarterTrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.quarterTrack]/t.trackNbits[t.prevQuarterTrack])))};let $s=0;const ec=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],tA=()=>($s++,ec[$s&31]);let $r=0;const rc=t=>($r<<=1,$r|=t,$r&=15,$r===0?tA():t),eA=[128,64,32,16,8,4,2,1],nc=[127,191,223,239,247,251,253,254],oc=(t,e)=>{const r=t.trackLocation;t.trackLocation=t.trackLocation%t.trackNbits[t.quarterTrack],r!==t.trackLocation&&(zr>=9?(zr=0,t.trackLocation+=4):zr++);let s;if(t.trackStart[t.quarterTrack]>0){const c=t.trackStart[t.quarterTrack]+(t.trackLocation>>3),I=e[c],S=t.trackLocation&7;s=(I&eA[S])>>7-S,s=rc(s)}else s=tA();return t.trackLocation++,s},sc=()=>Math.floor(256*Math.random()),rA=(t,e,r)=>{if(e.length===0)return sc();let s=0;for(Et+=r;Et>=t.optimalTiming/8;){const c=oc(t,e);if(Ct&128&&!c||(Ct&128&&(Ct=0),Ct=Ct<<1|c),Et-=t.optimalTiming/8,Ct&128&&Et<=t.optimalTiming/4)break}return Et<0&&(Et=0),Ct&=255,s=Ct,s};let Ie=0;const Io=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.quarterTrack],t.trackStart[t.quarterTrack]>0){const s=t.trackStart[t.quarterTrack]+(t.trackLocation>>3);let c=e[s];const I=t.trackLocation&7;r?c|=eA[I]:c&=nc[I],e[s]=c}t.trackLocation++},nA=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.quarterTrack]===0)&&Ct>0){if(r>=16)for(let s=7;s>=0;s--)Io(t,e,Ct&2**s?1:0);r>=36&&Io(t,e,0),r>=40&&Io(t,e,0),ho.push(r>=40?2:r>=36?1:Ct),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),Ct=0}},oA=t=>{Ge=0,vr||(t.motorRunning=!1),Rt(),ze(Be.MOTOR_OFF)},sA=t=>{Ge?(clearTimeout(Ge),Ge=0):Et=0,t.motorRunning=!0,Rt(),ze(Be.MOTOR_ON)},Ac=t=>{Ge===0&&(Ge=setTimeout(()=>oA(t),1e3))};let ho=[];const tn=t=>{ho.length>0&&t.quarterTrack===4*0&&(ho=[])},ic=(t,e)=>{if(t>=49408)return-1;let r=en();const s=lc();if(r.hardDrive)return 0;let c=0;const I=a.cycleCount-Ie;switch(t=t&15,t){case 9:vr=!0,sA(r),tn(r);break;case 8:r.motorRunning&&!r.writeMode&&(c=rA(r,s,I),Ie=a.cycleCount),vr=!1,Ac(r),tn(r);break;case 10:case 11:{const S=t===10?2:3,u=en();cc(S),r=en(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,Rt());break}case 12:uo=!1,r.motorRunning&&!r.writeMode&&(c=rA(r,s,I),Ie=a.cycleCount);break;case 13:uo=!0,r.motorRunning&&(r.writeMode?(nA(r,s,I),Ie=a.cycleCount,e>=0&&(Ct=e)):(Ct=0,Et+=I,r.trackLocation+=Math.floor(Et/4),Et=Et%4,Ie=a.cycleCount,e>=0?console.log(`${r.filename}: Illegal LOAD of write data latch during read: PC=${z(a.PC)} Value=${z(e)}`):console.log(`${r.filename}: Illegal READ of write data latch during read: PC=${z(a.PC)}`)));break;case 14:r.motorRunning&&r.writeMode&&(nA(r,s,I),r.lastWriteTime=Date.now(),Ie=a.cycleCount),r.writeMode=!1,uo&&(c=r.isWriteProtected?255:0),tn(r);break;case 15:r.writeMode=!0,Ie=a.cycleCount,e>=0&&(Ct=e);break;default:{if(t<0||t>7)break;const S=t/2;t%2?r.currentPhase|=1<<S:r.currentPhase&=~(1<<S);const m=Ha[r.currentPhase];if(r.motorRunning&&m>=0){const L=r.quarterTrack&7,T=va[L][m];tc(r,T,I),Ie=a.cycleCount}tn(r);break}}return c},ac=()=>{Xe(6,Uint8Array.from(ja)),ir(6,ic)},$t=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(160).fill(0),trackNbits:r?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalWriteTime:-1,cloudData:null,writableFileHandle:null,lastWriteTime:-1,optimalTiming:32}),AA=()=>{y[0]=$t(0,1,!0),y[1]=$t(1,2,!0),y[2]=$t(2,1,!1),y[3]=$t(3,2,!1);for(let t=0;t<y.length;t++)te[t]=new Uint8Array},y=[],te=[];AA();let be=2;const cc=t=>{be=t},en=()=>y[be],lc=()=>te[be],go=t=>y[t==2?1:0],rn=t=>te[t==2?1:0],Rt=()=>{for(let t=0;t<y.length;t++){const e={index:t,hardDrive:y[t].hardDrive,drive:y[t].drive,filename:y[t].filename,status:y[t].status,motorRunning:y[t].motorRunning,diskHasChanges:y[t].diskHasChanges,isWriteProtected:y[t].isWriteProtected,diskData:y[t].diskHasChanges?te[t]:new Uint8Array,lastWriteTime:y[t].lastWriteTime,lastLocalWriteTime:y[t].lastLocalWriteTime,cloudData:y[t].cloudData,writableFileHandle:y[t].writableFileHandle};G1(e)}},uc=t=>{const e=["","",""];for(let s=0;s<y.length;s++)(t||te[s].length<32e6)&&(e[s]=Ke.Buffer.from(te[s]).toString("base64"));const r={currentDrive:be,driveState:[$t(0,1,!0),$t(1,2,!0),$t(2,1,!1),$t(3,2,!1)],driveData:e};for(let s=0;s<y.length;s++)r.driveState[s]={...y[s]};return r},Ic=t=>{ze(Be.MOTOR_OFF),be=t.currentDrive,t.driveState.length===3&&be>0&&be++,AA();let e=0;for(let r=0;r<t.driveState.length;r++)y[e]={...t.driveState[r]},t.driveData[r]!==""&&(te[e]=new Uint8Array(Ke.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;Rt()},hc=()=>{for(let t=0;t<y.length;t++)y[t].hardDrive||za(y[t]);Rt()},iA=(t=!1)=>{$a(t),Rt()},gc=(t,e=!1)=>{let r=t.index,s=t.drive,c=t.hardDrive;e||t.filename!==""&&(xo(t.filename)?(c=!0,r=t.drive<=1?0:1,s=r+1):(c=!1,r=t.drive<=1?2:3,s=r-1)),y[r]=$t(r,s,c),y[r].filename=t.filename,y[r].motorRunning=t.motorRunning,te[r]=Ja(y[r],t.diskData),te[r].length===0&&(y[r].filename=""),y[r].cloudData=t.cloudData,y[r].writableFileHandle=t.writableFileHandle,y[r].lastLocalWriteTime=t.lastLocalWriteTime,Rt()},fc=t=>{const e=t.index;y[e].filename=t.filename,y[e].motorRunning=t.motorRunning,y[e].isWriteProtected=t.isWriteProtected,y[e].diskHasChanges=t.diskHasChanges,y[e].lastWriteTime=t.lastWriteTime,y[e].lastLocalWriteTime=t.lastLocalWriteTime,y[e].cloudData=t.cloudData,y[e].writableFileHandle=t.writableFileHandle,Rt()},yt={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},gr={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Me={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class pc{constructor(e){W(this,"_control");W(this,"_status");W(this,"_command");W(this,"_lastRead");W(this,"_lastConfig");W(this,"_receiveBuffer");W(this,"_extFuncs");this._extFuncs=e,this._control=gr.HW_RESET,this._command=Me.HW_RESET,this._status=yt.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=yt.OVRN;this._status|=yt.RX_FULL,this._control&Me.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&Me.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(yt.PE|yt.FE|yt.OVRN),this._receiveBuffer.length?(this._status|=yt.RX_FULL,this._control&Me.RX_INT_DIS||this.irq(!0)):this._status&=~yt.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&yt.IRQ&&this.irq(!1),this._status&=~yt.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=yt.IRQ:this._status&=~yt.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&gr.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&gr.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&gr.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Me.PARITY_EN)switch(this._command&Me.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=gr.HW_RESET,this._command=Me.HW_RESET,this._status=yt.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const fo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let nn=1,Pt;const Sc=t=>{Ar(nn,t)},Cc=t=>{console.log("ConfigChange: ",t)},Ec=t=>{Pt&&Pt.buffer(t)},Bc=()=>{Pt&&Pt.reset()},mc=(t=!0,e=1)=>{if(!t)return;nn=e;const r={sendData:Z1,interrupt:Sc,configChange:Cc};Pt=new pc(r);const s=new Uint8Array(fo.length+256);s.set(fo.slice(1792,2048)),s.set(fo,256),Xe(nn,s),ir(nn,Dc)},Dc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Pt.data=e;else return Pt.data;break;case r.STATUS:if(e>=0)Pt.status=e;else return Pt.status;break;case r.COMMAND:if(e>=0)Pt.command=e;else return Pt.command;break;case r.CONTROL:if(e>=0)Pt.control=e;else return Pt.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},fr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const dc=()=>{const t=new Date,e=fr(t.getMonth()+1,2)+","+fr(t.getDay(),2)+","+fr(t.getDate(),2)+","+fr(t.getHours(),2)+","+fr(t.getMinutes(),2);for(let r=0;r<e.length;r++)D(512+r,e.charCodeAt(r)|128)};let on=!1;const aA=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},cA=t=>{let e=A.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=A.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=A.IND_Y:t.endsWith(",X)")?e=A.IND_X:e=A.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?A.ABS_X:A.ZP_X:t.endsWith(",Y")?e=t.length>5?A.ABS_Y:A.ZP_Y:e=t.length>3?A.ABS:A.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const s=aA(t);if(s.operation&&s.value){switch(s.operation){case"+":r+=s.value;break;case"-":r-=s.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let Qe={};const lA=(t,e,r,s)=>{let c=A.IMPLIED,I=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(Qe).forEach(([u,m])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+z(m))}),cA(r);const S=aA(r);if(S.label){const u=S.label.startsWith("<"),m=S.label.startsWith(">"),L=S.label.startsWith("#")||m||u;if(L&&(S.label=S.label.substring(1)),S.label in Qe?(I=Qe[S.label],m?I=I>>8&255:u&&(I=I&255)):s===2&&console.error("Missing label: "+S.label),S.operation&&S.value){switch(S.operation){case"+":I+=S.value;break;case"-":I-=S.value;break;default:console.error("Unknown operation in operand: "+r)}I=(I%65536+65536)%65536}No(e)?(c=A.ZP_REL,I=I-t+254,I>255&&(I-=256)):L?c=A.IMM:(c=I>=0&&I<=255?A.ZP_REL:A.ABS,c=S.idx==="X"?c===A.ABS?A.ABS_X:A.ZP_X:c,c=S.idx==="Y"?c===A.ABS?A.ABS_Y:A.ZP_Y:c)}return[c,I]},wc=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Tc=(t,e)=>{if(t.label in Qe&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,s]=lA(e,t.instr,t.operand,2);r!==A.ABS&&r!==A.ZP_REL&&console.error("Illegal EQU value: "+t.operand),Qe[t.label]=s}else Qe[t.label]=e},kc=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,s=0;r.startsWith('"')&&r.endsWith('"')?s=128:r.startsWith("'")&&r.endsWith("'")?s=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let c=0;c<r.length;c++)e.push(r.charCodeAt(c)|s);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(c=>{const I=parseInt(c,16);isNaN(I)&&console.error(`Invalid HEX value: ${c} in ${t.operand}`),e.push(I)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},Rc=(t,e)=>{const r=[],s=H[t];return r.push(t),e>=0&&(r.push(e%256),s.bytes===3&&r.push(Math.trunc(e/256))),r};let po=0;const uA=(t,e)=>{let r=po;const s=[];let c="";if(t.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;let S=(I+"                   ").slice(0,30)+z(r,4)+"- ";const u=wc(I,c);if(c="",!u.instr){c=u.label;return}if(u.instr==="ORG"){if(e===1){const[G,w]=cA(u.operand);G===A.ABS&&(po=w,r=w)}on&&e===2&&console.log(S);return}if(e===1&&u.label&&Tc(u,r),u.instr==="EQU")return;let m=[],L,T;if(["ASC","DA","HEX"].includes(u.instr))m=kc(u),r+=m.length;else if([L,T]=lA(r,u.instr,u.operand,e),e===2&&isNaN(T)&&console.error(`Unknown/illegal value: ${I}`),u.instr==="DB")m.push(T&255),r++;else if(u.instr==="DW")m.push(T&255),m.push(T>>8&255),r+=2;else if(u.instr==="DS")for(let G=0;G<T;G++)m.push(0),r++;else{e===2&&No(u.instr)&&(T<0||T>255)&&console.error(`Branch instruction out of range: ${I} value: ${T} pass: ${e}`);const G=H.findIndex(w=>w&&w.name===u.instr&&w.mode===L);G<0&&console.error(`Unknown instruction: "${I}" mode=${L} pass=${e}`),m=Rc(G,T),r+=H[G].bytes}on&&e===2&&(m.forEach(G=>{S+=` ${z(G)}`}),console.log(S)),s.push(...m)}),on&&e===2){let I="";s.forEach(S=>{I+=` ${z(S)}`}),console.log(I)}return s},sn=(t,e,r=!1)=>{Qe={},on=r;try{return po=t,uA(e,1),uA(e,2)}catch(s){return console.error(s),[]}},yc=`
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
`;let Fe=49286,An=49289,an=49291,cn=49292,ln=49293,un=49294,In=49295;const IA=(t,e,r,s,c)=>{const I=t&255,S=t>>8&3,u=e&255,m=e>>8&3;Z(r,I),Z(s,S<<4|m),Z(c,u)},hA=(t,e,r)=>{const s=St(t),c=St(e),I=St(r),S=c>>4&3,u=c&3;return[s|S<<8,I|u<<8]},hn=()=>hA(An,an,cn),So=()=>hA(ln,un,In),gn=(t,e)=>{IA(t,e,An,an,cn)},fn=(t,e)=>{IA(t,e,ln,un,In)},pn=t=>{Z(Fe,t),_A(!!t)},Pc=()=>{Ft=0,Ut=0,gn(0,1023),fn(0,1023),pn(0),ct=0,he=0,_e=0,pr=0,Sr=0,dt=0,Xt=0,Ze=0,Sn=0};let Ft=0,Ut=0,Sn=0,ct=0,he=0,_e=0,pr=0,Sr=0,dt=0,Xt=0,Ze=0,gA=0,ut=5;const Cn=54,En=55,Lc=56,bc=57,fA=()=>{const t=new Uint8Array(256).fill(0),e=sn(0,yc.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},Mc=(t=!0,e=5)=>{if(!t)return;ut=e;const r=49152+ut*256,s=49152+ut*256+8;Xe(ut,fA(),r,Uc),Xe(ut,fA(),s,dc),ir(ut,Oc),Fe=49280+(Fe&15)+ut*16,An=49280+(An&15)+ut*16,an=49280+(an&15)+ut*16,cn=49280+(cn&15)+ut*16,ln=49280+(ln&15)+ut*16,un=49280+(un&15)+ut*16,In=49280+(In&15)+ut*16;const[c,I]=hn();c===0&&I===0&&(gn(0,1023),fn(0,1023)),St(Fe)!==0&&_A(!0)},Qc=()=>{const t=St(Fe);if(t&1){let e=!1;t&8&&(Ze|=8,e=!0),t&he&4&&(Ze|=4,e=!0),t&he&2&&(Ze|=2,e=!0),e&&Ar(ut,!0)}},Fc=t=>{if(St(Fe)&1)if(t.buttons>=0){switch(t.buttons){case 0:ct&=-129;break;case 16:ct|=128;break;case 1:ct&=-17;break;case 17:ct|=16;break}he|=ct&128?4:0}else{if(t.x>=0&&t.x<=1){const[r,s]=hn();Ft=Math.round((s-r)*t.x+r),he|=2}if(t.y>=0&&t.y<=1){const[r,s]=So();Ut=Math.round((s-r)*t.y+r),he|=2}}};let Cr=0,Co="",pA=0,SA=0;const Uc=()=>{const t=192+ut;B(En)===t&&B(Cn)===0?Kc():B(bc)===t&&B(Lc)===0&&qc()},qc=()=>{if(Cr===0){const t=192+ut;pA=B(En),SA=B(Cn),D(En,t),D(Cn,3);const e=(ct&128)!==(_e&128);let r=0;ct&128?r=e?2:1:r=e?3:4,B(49152)&128&&(r=-r),_e=ct,Co=Ft.toString()+","+Ut.toString()+","+r.toString()}Cr>=Co.length?(a.Accum=141,Cr=0,D(En,pA),D(Cn,SA)):(a.Accum=Co.charCodeAt(Cr)|128,Cr++)},Kc=()=>{switch(a.Accum){case 128:console.log("mouse off"),pn(0);break;case 129:console.log("mouse on"),pn(1);break}},Oc=(t,e)=>{if(t>=49408)return-1;const r=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},c={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(r)return Ft&255;dt=dt&65280|e,dt&=65535;break;case s.HIGHX:if(r)return Ft>>8&255;dt=e<<8|dt&255,dt&=65535;break;case s.LOWY:if(r)return Ut&255;Xt=Xt&65280|e,Xt&=65535;break;case s.HIGHY:if(r)return Ut>>8&255;Xt=e<<8|Xt&255,Xt&=65535;break;case s.STATUS:return ct;case s.MODE:if(r)return St(Fe);pn(e);break;case s.CLAMP:if(r){const[I,S]=hn(),[u,m]=So();switch(Sn){case 0:return I>>8&255;case 1:return u>>8&255;case 2:return I&255;case 3:return u&255;case 4:return S>>8&255;case 5:return m>>8&255;case 6:return S&255;case 7:return m&255;default:return console.log("AppleMouse: invalid clamp index: "+Sn),0}}Sn=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(r)return gA;switch(gA=e,e){case c.INIT:Ft=0,Ut=0,pr=0,Sr=0,gn(0,1023),fn(0,1023),ct=0,he=0;break;case c.READ:he=0,ct&=-112,ct|=_e>>1&64,ct|=_e>>4&1,_e=ct,(pr!==Ft||Sr!==Ut)&&(ct|=32,pr=Ft,Sr=Ut);break;case c.CLEAR:console.log("cmd.clear"),Ft=0,Ut=0,pr=0,Sr=0;break;case c.SERVE:ct&=-15,ct|=Ze,Ze=0,Ar(ut,!1);break;case c.HOME:{const[I]=hn(),[S]=So();Ft=I,Ut=S}break;case c.CLAMPX:{const I=dt>32767?dt-65536:dt,S=Xt;gn(I,S),console.log(I+" -> "+S)}break;case c.CLAMPY:{const I=dt>32767?dt-65536:dt,S=Xt;fn(I,S),console.log(I+" -> "+S)}break;case c.GCLAMP:console.log("cmd.getclamp");break;case c.POS:Ft=dt,Ut=Xt;break}break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return e},qt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},ee={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class Nc{constructor(e){W(this,"_control");W(this,"_status");W(this,"_lastRead");W(this,"_receiveBuffer");W(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=qt.OVRN;this._status|=qt.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(ee.TX_INT_ENABLE|ee.NRTS))===ee.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(qt.FE|qt.OVRN|qt.PE),this._receiveBuffer.length?(this._status|=qt.RX_FULL,this._control&ee.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~qt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(ee.COUNTER_DIV1|ee.COUNTER_DIV2))===(ee.COUNTER_DIV1|ee.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&qt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=qt.IRQ:this._status&=~qt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=qt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const Gt={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Eo={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class Bo{constructor(){W(this,"_latch");W(this,"_count");W(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&Gt.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Gt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class Yc{constructor(e){W(this,"_timer");W(this,"_status");W(this,"_statusRead");W(this,"_msb");W(this,"_lsb");W(this,"_div8");W(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new Bo,new Bo,new Bo],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Gt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const s=this._timer[0].control&Gt.SPECIAL,c=this._msb*256+r;this._timer[e].latch=c,s&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const s=this._timer[0].control&Gt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),s>>8&255}update(e){const r=this._timer[0].control&Gt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let s=!1;for(let c=0;c<3;c++){let I=e;if(c==2&&this._timer[2].control&Gt.SPECIAL&&(this._div8>8?(I=1,this._div8%=8):I=0),s=this._timer[c].decrement(I),s){const S=this._timer[c].control;switch(S&Gt.IRQ_ENABLE&&this.irq(c,!0),S&Gt.COUNTER_MODE){case 0:case 16:this._timer[c].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Gt.SPECIAL}irq(e,r){const s=1<<e|Eo.ANY_IRQ;r?this._status|=s:this._status&=~s,this._status?(this._status|=Eo.ANY_IRQ,this._interrupt(!0)):(this._status&=~Eo.ANY_IRQ,this._interrupt(!1))}}let Bn=2,At,ge,mo=0;const Wc=t=>{if(mo){const e=a.cycleCount-mo;At.update(e)}mo=a.cycleCount},CA=t=>{Ar(Bn,t)},xc=t=>{ge&&ge.buffer(t)},Xc=(t=!0,e=2)=>{if(!t)return;Bn=e,At=new Yc(CA);const r={sendData:V1,interrupt:CA};ge=new Nc(r),ir(Bn,_c),ds(Wc,Bn)},Gc=()=>{At&&(At.reset(),ge.reset())},_c=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?ge.data=e:s=ge.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?ge.control=e:s=ge.status;break;case r.TCONTROL1:e>=0?At.timerControl(0,e):s=0;break;case r.TCONTROL2:e>=0?At.timerControl(1,e):s=At.status();break;case r.T1MSB:e>=0?At.timerMSBw(0,e):s=At.timerMSBr(0);break;case r.T1LSB:e>=0?At.timerLSBw(0,e):s=At.timerLSBr(0);break;case r.T2MSB:e>=0?At.timerMSBw(1,e):s=At.timerMSBr(1);break;case r.T2LSB:e>=0?At.timerLSBw(1,e):s=At.timerLSBr(1);break;case r.T3MSB:e>=0?At.timerMSBw(2,e):s=At.timerMSBr(2);break;case r.T3LSB:e>=0?At.timerLSBw(2,e):s=At.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return s},Zc=(t=!0,e=4)=>{t&&(ir(e,c1),ds(o1,e))},Do=[0,128],wo=[1,129],Vc=[2,130],Jc=[3,131],Ve=[4,132],Je=[5,133],mn=[6,134],To=[7,135],Er=[8,136],Br=[9,137],jc=[10,138],ko=[11,139],Hc=[12,140],Ue=[13,141],mr=[14,142],EA=[16,145],BA=[17,145],_t=[18,146],Ro=[32,160],re=64,fe=32,vc=(t=4)=>{for(let e=0;e<=255;e++)K(t,e,0);for(let e=0;e<=1;e++)yo(t,e)},zc=(t,e)=>(_(t,mr[e])&re)!==0,$c=(t,e)=>(_(t,_t[e])&re)!==0,mA=(t,e)=>(_(t,ko[e])&re)!==0,t1=(t,e,r)=>{let s=_(t,Ve[e])-r;if(K(t,Ve[e],s),s<0){s=s%256+256,K(t,Ve[e],s);let c=_(t,Je[e]);if(c--,K(t,Je[e],c),c<0&&(c+=256,K(t,Je[e],c),zc(t,e)&&(!$c(t,e)||mA(t,e)))){const I=_(t,_t[e]);K(t,_t[e],I|re);const S=_(t,Ue[e]);if(K(t,Ue[e],S|re),pe(t,e,-1),mA(t,e)){const u=_(t,To[e]),m=_(t,mn[e]);K(t,Ve[e],m),K(t,Je[e],u)}}}},e1=(t,e)=>(_(t,mr[e])&fe)!==0,r1=(t,e)=>(_(t,_t[e])&fe)!==0,n1=(t,e,r)=>{if(_(t,ko[e])&fe)return;let s=_(t,Er[e])-r;if(K(t,Er[e],s),s<0){s=s%256+256,K(t,Er[e],s);let c=_(t,Br[e]);if(c--,K(t,Br[e],c),c<0&&(c+=256,K(t,Br[e],c),e1(t,e)&&!r1(t,e))){const I=_(t,_t[e]);K(t,_t[e],I|fe);const S=_(t,Ue[e]);K(t,Ue[e],S|fe),pe(t,e,-1)}}},DA=new Array(8).fill(0),o1=t=>{const e=a.cycleCount-DA[t];for(let r=0;r<=1;r++)t1(t,r,e),n1(t,r,e);DA[t]=a.cycleCount},s1=(t,e)=>{const r=[];for(let s=0;s<=15;s++)r[s]=_(t,Ro[e]+s);return r},A1=(t,e)=>t.length===e.length&&t.every((r,s)=>r===e[s]),je={slot:-1,chip:-1,params:[-1]};let yo=(t,e)=>{const r=s1(t,e);t===je.slot&&e===je.chip&&A1(r,je.params)||(je.slot=t,je.chip=e,je.params=r,_1({slot:t,chip:e,params:r}))};const i1=(t,e)=>{switch(_(t,Do[e])&7){case 0:for(let s=0;s<=15;s++)K(t,Ro[e]+s,0);yo(t,e);break;case 7:K(t,BA[e],_(t,wo[e]));break;case 6:{const s=_(t,BA[e]),c=_(t,wo[e]);s>=0&&s<=15&&(K(t,Ro[e]+s,c),yo(t,e));break}}},pe=(t,e,r)=>{let s=_(t,Ue[e]);switch(r>=0&&(s&=127-(r&127),K(t,Ue[e],s)),e){case 0:Ar(t,s!==0);break;case 1:ca(s!==0);break}},a1=(t,e,r)=>{let s=_(t,mr[e]);r>=0&&(r=r&255,r&128?s|=r:s&=255-r),s|=128,K(t,mr[e],s)},c1=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,s=t&255,c=s&128?1:0;switch(s){case Do[c]:e>=0&&(K(r,Do[c],e),i1(r,c));break;case wo[c]:case Vc[c]:case Jc[c]:case jc[c]:case ko[c]:case Hc[c]:K(r,s,e);break;case Ve[c]:e>=0&&K(r,mn[c],e),pe(r,c,re);break;case Je[c]:if(e>=0){K(r,To[c],e),K(r,Ve[c],_(r,mn[c])),K(r,Je[c],e);const I=_(r,_t[c]);K(r,_t[c],I&~re),pe(r,c,re)}break;case mn[c]:e>=0&&(K(r,s,e),pe(r,c,re));break;case To[c]:e>=0&&K(r,s,e);break;case Er[c]:e>=0&&K(r,EA[c],e),pe(r,c,fe);break;case Br[c]:if(e>=0){K(r,Br[c],e),K(r,Er[c],_(r,EA[c]));const I=_(r,_t[c]);K(r,_t[c],I&~fe),pe(r,c,fe)}break;case Ue[c]:e>=0&&pe(r,c,e);break;case mr[c]:a1(r,c,e);break}return-1};let He=0;const Dn=192,l1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${z(Dn)}   ; jump address
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
`,u1=`
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
`,I1=()=>{const t=new Uint8Array(256).fill(0),e=sn(0,l1.split(`
`));t.set(e,0);const r=sn(0,u1.split(`
`));return t.set(r,Dn),t[254]=23,t[255]=Dn,t};let Dr=new Uint8Array;const Po=(t=!0)=>{Dr.length===0&&(Dr=I1()),Dr[1]=t?32:0;const r=49152+Dn+7*256;Xe(7,Dr,r,S1),Xe(7,Dr,r+3,p1)},h1=(t,e)=>{if(t===0)D(e,2);else if(t<=2){D(e,240);const c=rn(t).length/512;D(e+1,c&255),D(e+2,c>>>8),D(e+3,0),cr(4),lr(0)}else ar(40),cr(0),lr(0),U()},g1=(t,e)=>{const c=rn(t).length/512,I=c>1600?2:1,S=I==2?32:64;D(e,240),D(e+1,c&255),D(e+2,c>>>8),D(e+3,0);const u="Apple2TS SP";D(e+4,u.length);let m=0;for(;m<u.length;m++)D(e+5+m,u.charCodeAt(m));for(;m<16;m++)D(e+5+m,u.charCodeAt(8));D(e+21,I),D(e+22,S),D(e+23,1),D(e+24,0),cr(25),lr(0)},f1=(t,e,r)=>{if(B(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),ar(4),U();return}const s=B(t+4);switch(s){case 0:h1(e,r);break;case 1:case 2:ar(33),U();break;case 3:case 4:g1(e,r);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},p1=()=>{ar(0),U(!1);const t=256+a.StackPtr,e=B(t+1)+256*B(t+2),r=B(e+1),s=B(e+2)+256*B(e+3),c=B(s+1),I=B(s+2)+256*B(s+3);switch(r){case 0:{f1(s,c,I);return}case 1:{if(B(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),U();return}const m=512*(B(s+4)+256*B(s+5)+65536*B(s+6)),T=rn(c).slice(m,m+512);oo(I,T);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),U();return}const S=go(c);S.motorRunning=!0,He||(He=setTimeout(()=>{He=0,S&&(S.motorRunning=!1),Rt()},500)),Rt()},S1=()=>{ar(0),U(!1);const t=B(66),e=Math.max(Math.min(B(67)>>6,2),0),r=go(e);if(!r.hardDrive)return;const s=rn(e),c=B(70)+256*B(71),I=512*c,S=B(68)+256*B(69),u=s.length;switch(r.status=` ${z(c,4)}`,t){case 0:{if(r.filename.length===0||u===0){cr(0),lr(0),U();return}const m=u/512;cr(m&255),lr(m>>>8);break}case 1:{if(I+512>u){U();return}const m=s.slice(I,I+512);oo(S,m);break}case 2:{if(I+512>u){U();return}if(r.isWriteProtected){U();return}const m=no(S);s.set(m,I),r.diskHasChanges=!0,r.lastWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),U();return;default:console.error("unknown hard drive command"),U();return}U(!1),r.motorRunning=!0,He||(He=setTimeout(()=>{He=0,r&&(r.motorRunning=!1),Rt()},500)),Rt()},dA=`
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
`;let wA=0,dn=0,dr=0,wn=0,TA=ii,Lo=!1,kA=16.6881,bo=17030,RA=0,nt=N.IDLE,Se="APPLE2EE",ve=0,Tn=!1,wt=0;const x=[];let wr=0;const C1=()=>{C.VBL.isSet=!0,Qc()},E1=()=>{C.VBL.isSet=!1},yA=()=>{const t={};for(const e in C)t[e]=C[e].isSet;return t},B1=()=>{const t=JSON.parse(JSON.stringify(a));let e=Jt;for(let s=Jt;s<P.length;s++)P[s]!==255&&(s+=255-s%256,e=s+1);const r=Ke.Buffer.from(P.slice(0,e));return{s6502:t,extraRamSize:64*(Yt+1),machineName:Se,softSwitches:yA(),stackDump:La(),memory:r.toString("base64")}},m1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));Us(r);const s=t.softSwitches;for(const I in s){const S=I;try{C[S].isSet=s[I]}catch{}}"WRITEBSR1"in s&&(C.BSR_PREWRITE.isSet=!1,C.BSR_WRITE.isSet=s.WRITEBSR1||s.WRITEBSR2||s.RDWRBSR1||s.RDWRBSR2);const c=new Uint8Array(Ke.Buffer.from(t.memory,"base64"));if(e<1){P.set(c.slice(0,65536)),P.set(c.slice(131072,163584),65536),P.set(c.slice(65536,131072),Jt);const I=(c.length-163584)/1024;I>0&&(zn(I+64),P.set(c.slice(163584),Jt+65536))}else zn(t.extraRamSize),P.set(c);t.stackDump&&ba(t.stackDump),Se=t.machineName||"APPLE2EE",Qo(Se,!1),jt(),xn(!0)},Mo=t=>({emulator:null,state6502:B1(),driveState:uc(t),thumbnail:"",snapshots:null}),D1=()=>{const t=Mo(!0);return t.snapshots=x,t},d1=t=>{Us(t),Ot()},w1=t=>{ur(t),Ot()},T1=t=>{Lo=t,Ot()},kn=(t,e=!1)=>{var s;yn();const r=(s=t.emulator)!=null&&s.version?t.emulator.version:.9;m1(t.state6502,r),Ic(t.driveState),e&&(x.length=0,wt=0),t.snapshots&&(x.length=0,x.push(...t.snapshots),wt=x.length),Ot()};let PA=!1;const LA=()=>{PA||(PA=!0,mc(),Xc(!0,2),Zc(!0,4),Mc(!0,5),ac(),Po(),Na())},k1=()=>{hc(),On(),Pc(),Gc(),Bc(),vc(4)},Rn=()=>{if(ur(0),wa(),Ps(Se),LA(),dA.length>0){const e=sn(768,dA.split(`
`));P.set(e,768)}yn(),xn(!0),go(1).filename===""&&(Po(!1),setTimeout(()=>{Po()},200))},yn=()=>{la(),zi(),B(49282),qs(),k1()},R1=t=>{dr=t,kA=dr===4?1:16.6881,bo=17030*[.1,.5,1,2,3,4,4][dr+2],KA()},y1=t=>{TA=t,Ot()},P1=(t,e)=>{P[t]=e,Ot()},Qo=(t,e=!0)=>{Se!==t&&(Se=t,Ps(Se),e&&yn(),Ot())},L1=t=>{zn(t),Ot()},bA=()=>{const t=wt-1;return t<0||!x[t]?-1:t},MA=()=>{const t=wt+1;return t>=x.length||!x[t]?-1:t},QA=()=>{x.length===ai&&x.shift(),x.push(Mo(!1)),wt=x.length,J1(x[x.length-1].state6502.s6502.PC)},b1=()=>{let t=bA();t<0||(Kt(N.PAUSED),setTimeout(()=>{wt===x.length&&(QA(),t=Math.max(wt-2,0)),wt=t,kn(x[wt])},50))},M1=()=>{const t=MA();t<0||(Kt(N.PAUSED),setTimeout(()=>{wt=t,kn(x[t])},50))},Q1=t=>{t<0||t>=x.length||(Kt(N.PAUSED),setTimeout(()=>{wt=t,kn(x[t])},50))},F1=()=>{const t=[];for(let e=0;e<x.length;e++)t[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return t},U1=t=>{x.length>0&&(x[x.length-1].thumbnail=t)};let Pn=null;const FA=(t=!1)=>{Pn&&clearTimeout(Pn),t?Pn=setTimeout(()=>{Tn=!0,Pn=null},100):Tn=!0},UA=()=>{Ur(),nt===N.IDLE&&(Rn(),nt=N.PAUSED),Jn(),Kt(N.PAUSED)},q1=()=>{Ur(),nt===N.IDLE&&(Rn(),nt=N.PAUSED),B(a.PC,!1)===32?(Jn(),qA()):UA()},qA=()=>{Ur(),nt===N.IDLE&&(Rn(),nt=N.PAUSED),Aa(),Kt(N.RUNNING)},KA=()=>{ve=0,dn=performance.now(),wA=dn},Kt=t=>{if(LA(),nt===N.RUNNING&&t===N.PAUSED&&(Lo=!0),nt=t,nt===N.PAUSED)wr&&(clearInterval(wr),wr=0),iA();else if(nt===N.RUNNING){for(iA(!0),Ur();x.length>0&&wt<x.length-1;)x.pop();wt=x.length,wr||(wr=setInterval(xn,1e3))}Ot(),KA(),wn===0&&(wn=1,WA())},OA=t=>{nt===N.IDLE?(Kt(N.NEED_BOOT),setTimeout(()=>{Kt(N.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},K1=(t,e,r)=>{OA(()=>{oo(t,e),r&&Wt(t)})},O1=t=>{OA(()=>{ji(t)})},N1=()=>nt===N.PAUSED?Pa():new Uint8Array,Y1=()=>nt!==N.IDLE?Ma():"";let NA=!1;const Ot=()=>{const t={addressGetTable:at,altChar:C.ALTCHARSET.isSet,breakpoints:Dt,button0:C.PB0.isSet,button1:C.PB1.isSet,canGoBackward:bA()>=0,canGoForward:MA()>=0,c800Slot:Hn(),cout:B(57)<<8|B(56),cpuSpeed:wn,extraRamSize:64*(Yt+1),hires:ya(),iTempState:wt,isDebugging:TA,lores:eo(!0),machineName:Se,memoryDump:N1(),noDelayMode:!C.COLUMN80.isSet&&C.DHIRES.isSet,ramWorksBank:Pe(),runMode:nt,s6502:a,showDebugTab:Lo,softSwitches:yA(),speedMode:dr,stackString:Y1(),textPage:eo(),timeTravelThumbnails:F1()};x1(t),NA||(NA=!0,j1(ea()))},W1=t=>{if(t)for(let e=0;e<t.length;e++)$i(t[e]);else ta();t&&(t[0]<=49167||t[0]>=49232)&&jt(),Ot()},YA=()=>{const t=performance.now();if(RA=t-dn,RA<kA||(dn=t,nt===N.IDLE||nt===N.PAUSED))return;nt===N.NEED_BOOT?(Rn(),Kt(N.RUNNING)):nt===N.NEED_RESET&&(yn(),Kt(N.RUNNING));let e=0;for(;;){const s=Jn();if(s<0||(e+=s,e<4550?C.VBL.isSet||C1():E1(),e>=bo))break}ve++;const r=ve*bo/(performance.now()-wA);wn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,ve%2&&(Ei(),Ot()),Tn&&(Tn=!1,QA())},WA=()=>{YA();const t=ve+[1,1,1,5,5,5,10][dr+2];for(;nt===N.RUNNING&&ve!==t;)YA();setTimeout(WA,nt===N.RUNNING?0:20)},Bt=(t,e)=>{self.postMessage({msg:t,payload:e})},x1=t=>{Bt(ht.MACHINE_STATE,t)},X1=t=>{Bt(ht.CLICK,t)},G1=t=>{Bt(ht.DRIVE_PROPS,t)},ze=t=>{Bt(ht.DRIVE_SOUND,t)},xA=t=>{Bt(ht.SAVE_STATE,t)},Ln=t=>{Bt(ht.RUMBLE,t)},XA=t=>{Bt(ht.HELP_TEXT,t)},GA=t=>{Bt(ht.ENHANCED_MIDI,t)},_A=t=>{Bt(ht.SHOW_APPLE_MOUSE,t)},_1=t=>{Bt(ht.MBOARD_SOUND,t)},Z1=t=>{Bt(ht.COMM_DATA,t)},V1=t=>{Bt(ht.MIDI_DATA,t)},J1=t=>{Bt(ht.REQUEST_THUMBNAIL,t)},j1=t=>{Bt(ht.SOFTSWITCH_DESCRIPTIONS,t)},H1=t=>{Bt(ht.INSTRUCTIONS,t)};typeof self<"u"&&(self.onmessage=t=>{if(!(!t.data||typeof t.data!="object")&&"msg"in t.data)switch(t.data.msg){case F.RUN_MODE:Kt(t.data.payload);break;case F.STATE6502:d1(t.data.payload);break;case F.DEBUG:y1(t.data.payload);break;case F.SHOW_DEBUG_TAB:T1(t.data.payload);break;case F.BREAKPOINTS:ia(t.data.payload);break;case F.STEP_INTO:UA();break;case F.STEP_OVER:q1();break;case F.STEP_OUT:qA();break;case F.SPEED:R1(t.data.payload);break;case F.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?M1():b1();break;case F.TIME_TRAVEL_INDEX:Q1(t.data.payload);break;case F.TIME_TRAVEL_SNAPSHOT:FA();break;case F.THUMBNAIL_IMAGE:U1(t.data.payload);break;case F.RESTORE_STATE:kn(t.data.payload,!0);break;case F.KEYPRESS:Ji(t.data.payload);break;case F.KEYRELEASE:Zi();break;case F.MOUSEEVENT:Fc(t.data.payload);break;case F.PASTE_TEXT:O1(t.data.payload);break;case F.APPLE_PRESS:zo(!0,t.data.payload);break;case F.APPLE_RELEASE:zo(!1,t.data.payload);break;case F.GET_SAVE_STATE:xA(Mo(!0));break;case F.GET_SAVE_STATE_SNAPSHOTS:xA(D1());break;case F.DRIVE_PROPS:{const e=t.data.payload;fc(e);break}case F.DRIVE_NEW_DATA:{const e=t.data.payload;gc(e);break}case F.GAMEPAD:Si(t.data.payload);break;case F.SET_BINARY_BLOCK:{const e=t.data.payload;K1(e.address,e.data,e.run);break}case F.SET_CYCLECOUNT:w1(t.data.payload);break;case F.SET_MEMORY:{const e=t.data.payload;P1(e.address,e.value);break}case F.COMM_DATA:Ec(t.data.payload);break;case F.MIDI_DATA:xc(t.data.payload);break;case F.RAMWORKS:L1(t.data.payload);break;case F.MACHINE_NAME:Qo(t.data.payload);break;case F.SOFTSWITCHES:W1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
