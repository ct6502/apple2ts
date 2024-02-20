var Pe=Object.defineProperty;var ke=(e,t,r)=>t in e?Pe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var g=(e,t,r)=>(ke(e,typeof t!="symbol"?t+"":t,r),r);(function(){"use strict";var buffer={},base64Js={};base64Js.byteLength=byteLength,base64Js.toByteArray=toByteArray,base64Js.fromByteArray=fromByteArray;for(var lookup=[],revLookup=[],Arr=typeof Uint8Array<"u"?Uint8Array:Array,code$2="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,len=code$2.length;i<len;++i)lookup[i]=code$2[i],revLookup[code$2.charCodeAt(i)]=i;revLookup["-".charCodeAt(0)]=62,revLookup["_".charCodeAt(0)]=63;function getLens(e){var t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=e.indexOf("=");r===-1&&(r=t);var n=r===t?0:4-r%4;return[r,n]}function byteLength(e){var t=getLens(e),r=t[0],n=t[1];return(r+n)*3/4-n}function _byteLength(e,t,r){return(t+r)*3/4-r}function toByteArray(e){var t,r=getLens(e),n=r[0],D=r[1],u=new Arr(_byteLength(e,n,D)),C=0,l=D>0?n-4:n,d;for(d=0;d<l;d+=4)t=revLookup[e.charCodeAt(d)]<<18|revLookup[e.charCodeAt(d+1)]<<12|revLookup[e.charCodeAt(d+2)]<<6|revLookup[e.charCodeAt(d+3)],u[C++]=t>>16&255,u[C++]=t>>8&255,u[C++]=t&255;return D===2&&(t=revLookup[e.charCodeAt(d)]<<2|revLookup[e.charCodeAt(d+1)]>>4,u[C++]=t&255),D===1&&(t=revLookup[e.charCodeAt(d)]<<10|revLookup[e.charCodeAt(d+1)]<<4|revLookup[e.charCodeAt(d+2)]>>2,u[C++]=t>>8&255,u[C++]=t&255),u}function tripletToBase64(e){return lookup[e>>18&63]+lookup[e>>12&63]+lookup[e>>6&63]+lookup[e&63]}function encodeChunk(e,t,r){for(var n,D=[],u=t;u<r;u+=3)n=(e[u]<<16&16711680)+(e[u+1]<<8&65280)+(e[u+2]&255),D.push(tripletToBase64(n));return D.join("")}function fromByteArray(e){for(var t,r=e.length,n=r%3,D=[],u=16383,C=0,l=r-n;C<l;C+=u)D.push(encodeChunk(e,C,C+u>l?l:C+u));return n===1?(t=e[r-1],D.push(lookup[t>>2]+lookup[t<<4&63]+"==")):n===2&&(t=(e[r-2]<<8)+e[r-1],D.push(lookup[t>>10]+lookup[t>>4&63]+lookup[t<<2&63]+"=")),D.join("")}var ieee754={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ieee754.read=function(e,t,r,n,D){var u,C,l=D*8-n-1,d=(1<<l)-1,R=d>>1,f=-7,h=r?D-1:0,M=r?-1:1,w=e[t+h];for(h+=M,u=w&(1<<-f)-1,w>>=-f,f+=l;f>0;u=u*256+e[t+h],h+=M,f-=8);for(C=u&(1<<-f)-1,u>>=-f,f+=n;f>0;C=C*256+e[t+h],h+=M,f-=8);if(u===0)u=1-R;else{if(u===d)return C?NaN:(w?-1:1)*(1/0);C=C+Math.pow(2,n),u=u-R}return(w?-1:1)*C*Math.pow(2,u-n)},ieee754.write=function(e,t,r,n,D,u){var C,l,d,R=u*8-D-1,f=(1<<R)-1,h=f>>1,M=D===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=n?0:u-1,_=n?1:-1,b=t<0||t===0&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(l=isNaN(t)?1:0,C=f):(C=Math.floor(Math.log(t)/Math.LN2),t*(d=Math.pow(2,-C))<1&&(C--,d*=2),C+h>=1?t+=M/d:t+=M*Math.pow(2,1-h),t*d>=2&&(C++,d/=2),C+h>=f?(l=0,C=f):C+h>=1?(l=(t*d-1)*Math.pow(2,D),C=C+h):(l=t*Math.pow(2,h-1)*Math.pow(2,D),C=0));D>=8;e[r+w]=l&255,w+=_,l/=256,D-=8);for(C=C<<D|l,R+=D;R>0;e[r+w]=C&255,w+=_,C/=256,R-=8);e[r+w-_]|=b*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(e){const t=base64Js,r=ieee754,n=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;e.Buffer=l,e.SlowBuffer=W,e.INSPECT_MAX_BYTES=50;const D=2147483647;e.kMaxLength=D,l.TYPED_ARRAY_SUPPORT=u(),!l.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function u(){try{const a=new Uint8Array(1),s={foo:function(){return 42}};return Object.setPrototypeOf(s,Uint8Array.prototype),Object.setPrototypeOf(a,s),a.foo()===42}catch{return!1}}Object.defineProperty(l.prototype,"parent",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.buffer}}),Object.defineProperty(l.prototype,"offset",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.byteOffset}});function C(a){if(a>D)throw new RangeError('The value "'+a+'" is invalid for option "size"');const s=new Uint8Array(a);return Object.setPrototypeOf(s,l.prototype),s}function l(a,s,o){if(typeof a=="number"){if(typeof s=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return h(a)}return d(a,s,o)}l.poolSize=8192;function d(a,s,o){if(typeof a=="string")return M(a,s);if(ArrayBuffer.isView(a))return _(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(U(a,ArrayBuffer)||a&&U(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(U(a,SharedArrayBuffer)||a&&U(a.buffer,SharedArrayBuffer)))return b(a,s,o);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const c=a.valueOf&&a.valueOf();if(c!=null&&c!==a)return l.from(c,s,o);const E=H(a);if(E)return E;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return l.from(a[Symbol.toPrimitive]("string"),s,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}l.from=function(a,s,o){return d(a,s,o)},Object.setPrototypeOf(l.prototype,Uint8Array.prototype),Object.setPrototypeOf(l,Uint8Array);function R(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function f(a,s,o){return R(a),a<=0?C(a):s!==void 0?typeof o=="string"?C(a).fill(s,o):C(a).fill(s):C(a)}l.alloc=function(a,s,o){return f(a,s,o)};function h(a){return R(a),C(a<0?0:q(a)|0)}l.allocUnsafe=function(a){return h(a)},l.allocUnsafeSlow=function(a){return h(a)};function M(a,s){if((typeof s!="string"||s==="")&&(s="utf8"),!l.isEncoding(s))throw new TypeError("Unknown encoding: "+s);const o=$(a,s)|0;let c=C(o);const E=c.write(a,s);return E!==o&&(c=c.slice(0,E)),c}function w(a){const s=a.length<0?0:q(a.length)|0,o=C(s);for(let c=0;c<s;c+=1)o[c]=a[c]&255;return o}function _(a){if(U(a,Uint8Array)){const s=new Uint8Array(a);return b(s.buffer,s.byteOffset,s.byteLength)}return w(a)}function b(a,s,o){if(s<0||a.byteLength<s)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<s+(o||0))throw new RangeError('"length" is outside of buffer bounds');let c;return s===void 0&&o===void 0?c=new Uint8Array(a):o===void 0?c=new Uint8Array(a,s):c=new Uint8Array(a,s,o),Object.setPrototypeOf(c,l.prototype),c}function H(a){if(l.isBuffer(a)){const s=q(a.length)|0,o=C(s);return o.length===0||a.copy(o,0,0,s),o}if(a.length!==void 0)return typeof a.length!="number"||V(a.length)?C(0):w(a);if(a.type==="Buffer"&&Array.isArray(a.data))return w(a.data)}function q(a){if(a>=D)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+D.toString(16)+" bytes");return a|0}function W(a){return+a!=a&&(a=0),l.alloc(+a)}l.isBuffer=function(s){return s!=null&&s._isBuffer===!0&&s!==l.prototype},l.compare=function(s,o){if(U(s,Uint8Array)&&(s=l.from(s,s.offset,s.byteLength)),U(o,Uint8Array)&&(o=l.from(o,o.offset,o.byteLength)),!l.isBuffer(s)||!l.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(s===o)return 0;let c=s.length,E=o.length;for(let I=0,m=Math.min(c,E);I<m;++I)if(s[I]!==o[I]){c=s[I],E=o[I];break}return c<E?-1:E<c?1:0},l.isEncoding=function(s){switch(String(s).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},l.concat=function(s,o){if(!Array.isArray(s))throw new TypeError('"list" argument must be an Array of Buffers');if(s.length===0)return l.alloc(0);let c;if(o===void 0)for(o=0,c=0;c<s.length;++c)o+=s[c].length;const E=l.allocUnsafe(o);let I=0;for(c=0;c<s.length;++c){let m=s[c];if(U(m,Uint8Array))I+m.length>E.length?(l.isBuffer(m)||(m=l.from(m)),m.copy(E,I)):Uint8Array.prototype.set.call(E,m,I);else if(l.isBuffer(m))m.copy(E,I);else throw new TypeError('"list" argument must be an Array of Buffers');I+=m.length}return E};function $(a,s){if(l.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||U(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const o=a.length,c=arguments.length>2&&arguments[2]===!0;if(!c&&o===0)return 0;let E=!1;for(;;)switch(s){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return J(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return ie(a).length;default:if(E)return c?-1:J(a).length;s=(""+s).toLowerCase(),E=!0}}l.byteLength=$;function De(a,s,o){let c=!1;if((s===void 0||s<0)&&(s=0),s>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,s>>>=0,o<=s))return"";for(a||(a="utf8");;)switch(a){case"hex":return he(this,s,o);case"utf8":case"utf-8":return z(this,s,o);case"ascii":return me(this,s,o);case"latin1":case"binary":return de(this,s,o);case"base64":return Ce(this,s,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return pe(this,s,o);default:if(c)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),c=!0}}l.prototype._isBuffer=!0;function Q(a,s,o){const c=a[s];a[s]=a[o],a[o]=c}l.prototype.swap16=function(){const s=this.length;if(s%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<s;o+=2)Q(this,o,o+1);return this},l.prototype.swap32=function(){const s=this.length;if(s%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<s;o+=4)Q(this,o,o+3),Q(this,o+1,o+2);return this},l.prototype.swap64=function(){const s=this.length;if(s%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<s;o+=8)Q(this,o,o+7),Q(this,o+1,o+6),Q(this,o+2,o+5),Q(this,o+3,o+4);return this},l.prototype.toString=function(){const s=this.length;return s===0?"":arguments.length===0?z(this,0,s):De.apply(this,arguments)},l.prototype.toLocaleString=l.prototype.toString,l.prototype.equals=function(s){if(!l.isBuffer(s))throw new TypeError("Argument must be a Buffer");return this===s?!0:l.compare(this,s)===0},l.prototype.inspect=function(){let s="";const o=e.INSPECT_MAX_BYTES;return s=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(s+=" ... "),"<Buffer "+s+">"},n&&(l.prototype[n]=l.prototype.inspect),l.prototype.compare=function(s,o,c,E,I){if(U(s,Uint8Array)&&(s=l.from(s,s.offset,s.byteLength)),!l.isBuffer(s))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof s);if(o===void 0&&(o=0),c===void 0&&(c=s?s.length:0),E===void 0&&(E=0),I===void 0&&(I=this.length),o<0||c>s.length||E<0||I>this.length)throw new RangeError("out of range index");if(E>=I&&o>=c)return 0;if(E>=I)return-1;if(o>=c)return 1;if(o>>>=0,c>>>=0,E>>>=0,I>>>=0,this===s)return 0;let m=I-E,p=c-o;const T=Math.min(m,p),O=this.slice(E,I),k=s.slice(o,c);for(let B=0;B<T;++B)if(O[B]!==k[B]){m=O[B],p=k[B];break}return m<p?-1:p<m?1:0};function v(a,s,o,c,E){if(a.length===0)return-1;if(typeof o=="string"?(c=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,V(o)&&(o=E?0:a.length-1),o<0&&(o=a.length+o),o>=a.length){if(E)return-1;o=a.length-1}else if(o<0)if(E)o=0;else return-1;if(typeof s=="string"&&(s=l.from(s,c)),l.isBuffer(s))return s.length===0?-1:j(a,s,o,c,E);if(typeof s=="number")return s=s&255,typeof Uint8Array.prototype.indexOf=="function"?E?Uint8Array.prototype.indexOf.call(a,s,o):Uint8Array.prototype.lastIndexOf.call(a,s,o):j(a,[s],o,c,E);throw new TypeError("val must be string, number or Buffer")}function j(a,s,o,c,E){let I=1,m=a.length,p=s.length;if(c!==void 0&&(c=String(c).toLowerCase(),c==="ucs2"||c==="ucs-2"||c==="utf16le"||c==="utf-16le")){if(a.length<2||s.length<2)return-1;I=2,m/=2,p/=2,o/=2}function T(k,B){return I===1?k[B]:k.readUInt16BE(B*I)}let O;if(E){let k=-1;for(O=o;O<m;O++)if(T(a,O)===T(s,k===-1?0:O-k)){if(k===-1&&(k=O),O-k+1===p)return k*I}else k!==-1&&(O-=O-k),k=-1}else for(o+p>m&&(o=m-p),O=o;O>=0;O--){let k=!0;for(let B=0;B<p;B++)if(T(a,O+B)!==T(s,B)){k=!1;break}if(k)return O}return-1}l.prototype.includes=function(s,o,c){return this.indexOf(s,o,c)!==-1},l.prototype.indexOf=function(s,o,c){return v(this,s,o,c,!0)},l.prototype.lastIndexOf=function(s,o,c){return v(this,s,o,c,!1)};function ce(a,s,o,c){o=Number(o)||0;const E=a.length-o;c?(c=Number(c),c>E&&(c=E)):c=E;const I=s.length;c>I/2&&(c=I/2);let m;for(m=0;m<c;++m){const p=parseInt(s.substr(m*2,2),16);if(V(p))return m;a[o+m]=p}return m}function le(a,s,o,c){return x(J(s,a.length-o),a,o,c)}function ue(a,s,o,c){return x(Re(s),a,o,c)}function Ee(a,s,o,c){return x(ie(s),a,o,c)}function Se(a,s,o,c){return x(Oe(s,a.length-o),a,o,c)}l.prototype.write=function(s,o,c,E){if(o===void 0)E="utf8",c=this.length,o=0;else if(c===void 0&&typeof o=="string")E=o,c=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(c)?(c=c>>>0,E===void 0&&(E="utf8")):(E=c,c=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const I=this.length-o;if((c===void 0||c>I)&&(c=I),s.length>0&&(c<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");E||(E="utf8");let m=!1;for(;;)switch(E){case"hex":return ce(this,s,o,c);case"utf8":case"utf-8":return le(this,s,o,c);case"ascii":case"latin1":case"binary":return ue(this,s,o,c);case"base64":return Ee(this,s,o,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Se(this,s,o,c);default:if(m)throw new TypeError("Unknown encoding: "+E);E=(""+E).toLowerCase(),m=!0}},l.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Ce(a,s,o){return s===0&&o===a.length?t.fromByteArray(a):t.fromByteArray(a.slice(s,o))}function z(a,s,o){o=Math.min(a.length,o);const c=[];let E=s;for(;E<o;){const I=a[E];let m=null,p=I>239?4:I>223?3:I>191?2:1;if(E+p<=o){let T,O,k,B;switch(p){case 1:I<128&&(m=I);break;case 2:T=a[E+1],(T&192)===128&&(B=(I&31)<<6|T&63,B>127&&(m=B));break;case 3:T=a[E+1],O=a[E+2],(T&192)===128&&(O&192)===128&&(B=(I&15)<<12|(T&63)<<6|O&63,B>2047&&(B<55296||B>57343)&&(m=B));break;case 4:T=a[E+1],O=a[E+2],k=a[E+3],(T&192)===128&&(O&192)===128&&(k&192)===128&&(B=(I&15)<<18|(T&63)<<12|(O&63)<<6|k&63,B>65535&&B<1114112&&(m=B))}}m===null?(m=65533,p=1):m>65535&&(m-=65536,c.push(m>>>10&1023|55296),m=56320|m&1023),c.push(m),E+=p}return Ie(c)}const ee=4096;function Ie(a){const s=a.length;if(s<=ee)return String.fromCharCode.apply(String,a);let o="",c=0;for(;c<s;)o+=String.fromCharCode.apply(String,a.slice(c,c+=ee));return o}function me(a,s,o){let c="";o=Math.min(a.length,o);for(let E=s;E<o;++E)c+=String.fromCharCode(a[E]&127);return c}function de(a,s,o){let c="";o=Math.min(a.length,o);for(let E=s;E<o;++E)c+=String.fromCharCode(a[E]);return c}function he(a,s,o){const c=a.length;(!s||s<0)&&(s=0),(!o||o<0||o>c)&&(o=c);let E="";for(let I=s;I<o;++I)E+=Me[a[I]];return E}function pe(a,s,o){const c=a.slice(s,o);let E="";for(let I=0;I<c.length-1;I+=2)E+=String.fromCharCode(c[I]+c[I+1]*256);return E}l.prototype.slice=function(s,o){const c=this.length;s=~~s,o=o===void 0?c:~~o,s<0?(s+=c,s<0&&(s=0)):s>c&&(s=c),o<0?(o+=c,o<0&&(o=0)):o>c&&(o=c),o<s&&(o=s);const E=this.subarray(s,o);return Object.setPrototypeOf(E,l.prototype),E};function y(a,s,o){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+s>o)throw new RangeError("Trying to access beyond buffer length")}l.prototype.readUintLE=l.prototype.readUIntLE=function(s,o,c){s=s>>>0,o=o>>>0,c||y(s,o,this.length);let E=this[s],I=1,m=0;for(;++m<o&&(I*=256);)E+=this[s+m]*I;return E},l.prototype.readUintBE=l.prototype.readUIntBE=function(s,o,c){s=s>>>0,o=o>>>0,c||y(s,o,this.length);let E=this[s+--o],I=1;for(;o>0&&(I*=256);)E+=this[s+--o]*I;return E},l.prototype.readUint8=l.prototype.readUInt8=function(s,o){return s=s>>>0,o||y(s,1,this.length),this[s]},l.prototype.readUint16LE=l.prototype.readUInt16LE=function(s,o){return s=s>>>0,o||y(s,2,this.length),this[s]|this[s+1]<<8},l.prototype.readUint16BE=l.prototype.readUInt16BE=function(s,o){return s=s>>>0,o||y(s,2,this.length),this[s]<<8|this[s+1]},l.prototype.readUint32LE=l.prototype.readUInt32LE=function(s,o){return s=s>>>0,o||y(s,4,this.length),(this[s]|this[s+1]<<8|this[s+2]<<16)+this[s+3]*16777216},l.prototype.readUint32BE=l.prototype.readUInt32BE=function(s,o){return s=s>>>0,o||y(s,4,this.length),this[s]*16777216+(this[s+1]<<16|this[s+2]<<8|this[s+3])},l.prototype.readBigUInt64LE=N(function(s){s=s>>>0,K(s,"offset");const o=this[s],c=this[s+7];(o===void 0||c===void 0)&&G(s,this.length-8);const E=o+this[++s]*2**8+this[++s]*2**16+this[++s]*2**24,I=this[++s]+this[++s]*2**8+this[++s]*2**16+c*2**24;return BigInt(E)+(BigInt(I)<<BigInt(32))}),l.prototype.readBigUInt64BE=N(function(s){s=s>>>0,K(s,"offset");const o=this[s],c=this[s+7];(o===void 0||c===void 0)&&G(s,this.length-8);const E=o*2**24+this[++s]*2**16+this[++s]*2**8+this[++s],I=this[++s]*2**24+this[++s]*2**16+this[++s]*2**8+c;return(BigInt(E)<<BigInt(32))+BigInt(I)}),l.prototype.readIntLE=function(s,o,c){s=s>>>0,o=o>>>0,c||y(s,o,this.length);let E=this[s],I=1,m=0;for(;++m<o&&(I*=256);)E+=this[s+m]*I;return I*=128,E>=I&&(E-=Math.pow(2,8*o)),E},l.prototype.readIntBE=function(s,o,c){s=s>>>0,o=o>>>0,c||y(s,o,this.length);let E=o,I=1,m=this[s+--E];for(;E>0&&(I*=256);)m+=this[s+--E]*I;return I*=128,m>=I&&(m-=Math.pow(2,8*o)),m},l.prototype.readInt8=function(s,o){return s=s>>>0,o||y(s,1,this.length),this[s]&128?(255-this[s]+1)*-1:this[s]},l.prototype.readInt16LE=function(s,o){s=s>>>0,o||y(s,2,this.length);const c=this[s]|this[s+1]<<8;return c&32768?c|4294901760:c},l.prototype.readInt16BE=function(s,o){s=s>>>0,o||y(s,2,this.length);const c=this[s+1]|this[s]<<8;return c&32768?c|4294901760:c},l.prototype.readInt32LE=function(s,o){return s=s>>>0,o||y(s,4,this.length),this[s]|this[s+1]<<8|this[s+2]<<16|this[s+3]<<24},l.prototype.readInt32BE=function(s,o){return s=s>>>0,o||y(s,4,this.length),this[s]<<24|this[s+1]<<16|this[s+2]<<8|this[s+3]},l.prototype.readBigInt64LE=N(function(s){s=s>>>0,K(s,"offset");const o=this[s],c=this[s+7];(o===void 0||c===void 0)&&G(s,this.length-8);const E=this[s+4]+this[s+5]*2**8+this[s+6]*2**16+(c<<24);return(BigInt(E)<<BigInt(32))+BigInt(o+this[++s]*2**8+this[++s]*2**16+this[++s]*2**24)}),l.prototype.readBigInt64BE=N(function(s){s=s>>>0,K(s,"offset");const o=this[s],c=this[s+7];(o===void 0||c===void 0)&&G(s,this.length-8);const E=(o<<24)+this[++s]*2**16+this[++s]*2**8+this[++s];return(BigInt(E)<<BigInt(32))+BigInt(this[++s]*2**24+this[++s]*2**16+this[++s]*2**8+c)}),l.prototype.readFloatLE=function(s,o){return s=s>>>0,o||y(s,4,this.length),r.read(this,s,!0,23,4)},l.prototype.readFloatBE=function(s,o){return s=s>>>0,o||y(s,4,this.length),r.read(this,s,!1,23,4)},l.prototype.readDoubleLE=function(s,o){return s=s>>>0,o||y(s,8,this.length),r.read(this,s,!0,52,8)},l.prototype.readDoubleBE=function(s,o){return s=s>>>0,o||y(s,8,this.length),r.read(this,s,!1,52,8)};function L(a,s,o,c,E,I){if(!l.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(s>E||s<I)throw new RangeError('"value" argument is out of bounds');if(o+c>a.length)throw new RangeError("Index out of range")}l.prototype.writeUintLE=l.prototype.writeUIntLE=function(s,o,c,E){if(s=+s,o=o>>>0,c=c>>>0,!E){const p=Math.pow(2,8*c)-1;L(this,s,o,c,p,0)}let I=1,m=0;for(this[o]=s&255;++m<c&&(I*=256);)this[o+m]=s/I&255;return o+c},l.prototype.writeUintBE=l.prototype.writeUIntBE=function(s,o,c,E){if(s=+s,o=o>>>0,c=c>>>0,!E){const p=Math.pow(2,8*c)-1;L(this,s,o,c,p,0)}let I=c-1,m=1;for(this[o+I]=s&255;--I>=0&&(m*=256);)this[o+I]=s/m&255;return o+c},l.prototype.writeUint8=l.prototype.writeUInt8=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,1,255,0),this[o]=s&255,o+1},l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,2,65535,0),this[o]=s&255,this[o+1]=s>>>8,o+2},l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,2,65535,0),this[o]=s>>>8,this[o+1]=s&255,o+2},l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,4,4294967295,0),this[o+3]=s>>>24,this[o+2]=s>>>16,this[o+1]=s>>>8,this[o]=s&255,o+4},l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,4,4294967295,0),this[o]=s>>>24,this[o+1]=s>>>16,this[o+2]=s>>>8,this[o+3]=s&255,o+4};function te(a,s,o,c,E){ae(s,c,E,a,o,7);let I=Number(s&BigInt(4294967295));a[o++]=I,I=I>>8,a[o++]=I,I=I>>8,a[o++]=I,I=I>>8,a[o++]=I;let m=Number(s>>BigInt(32)&BigInt(4294967295));return a[o++]=m,m=m>>8,a[o++]=m,m=m>>8,a[o++]=m,m=m>>8,a[o++]=m,o}function re(a,s,o,c,E){ae(s,c,E,a,o,7);let I=Number(s&BigInt(4294967295));a[o+7]=I,I=I>>8,a[o+6]=I,I=I>>8,a[o+5]=I,I=I>>8,a[o+4]=I;let m=Number(s>>BigInt(32)&BigInt(4294967295));return a[o+3]=m,m=m>>8,a[o+2]=m,m=m>>8,a[o+1]=m,m=m>>8,a[o]=m,o+8}l.prototype.writeBigUInt64LE=N(function(s,o=0){return te(this,s,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeBigUInt64BE=N(function(s,o=0){return re(this,s,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeIntLE=function(s,o,c,E){if(s=+s,o=o>>>0,!E){const T=Math.pow(2,8*c-1);L(this,s,o,c,T-1,-T)}let I=0,m=1,p=0;for(this[o]=s&255;++I<c&&(m*=256);)s<0&&p===0&&this[o+I-1]!==0&&(p=1),this[o+I]=(s/m>>0)-p&255;return o+c},l.prototype.writeIntBE=function(s,o,c,E){if(s=+s,o=o>>>0,!E){const T=Math.pow(2,8*c-1);L(this,s,o,c,T-1,-T)}let I=c-1,m=1,p=0;for(this[o+I]=s&255;--I>=0&&(m*=256);)s<0&&p===0&&this[o+I+1]!==0&&(p=1),this[o+I]=(s/m>>0)-p&255;return o+c},l.prototype.writeInt8=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,1,127,-128),s<0&&(s=255+s+1),this[o]=s&255,o+1},l.prototype.writeInt16LE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,2,32767,-32768),this[o]=s&255,this[o+1]=s>>>8,o+2},l.prototype.writeInt16BE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,2,32767,-32768),this[o]=s>>>8,this[o+1]=s&255,o+2},l.prototype.writeInt32LE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,4,2147483647,-2147483648),this[o]=s&255,this[o+1]=s>>>8,this[o+2]=s>>>16,this[o+3]=s>>>24,o+4},l.prototype.writeInt32BE=function(s,o,c){return s=+s,o=o>>>0,c||L(this,s,o,4,2147483647,-2147483648),s<0&&(s=4294967295+s+1),this[o]=s>>>24,this[o+1]=s>>>16,this[o+2]=s>>>8,this[o+3]=s&255,o+4},l.prototype.writeBigInt64LE=N(function(s,o=0){return te(this,s,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),l.prototype.writeBigInt64BE=N(function(s,o=0){return re(this,s,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function se(a,s,o,c,E,I){if(o+c>a.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function oe(a,s,o,c,E){return s=+s,o=o>>>0,E||se(a,s,o,4),r.write(a,s,o,c,23,4),o+4}l.prototype.writeFloatLE=function(s,o,c){return oe(this,s,o,!0,c)},l.prototype.writeFloatBE=function(s,o,c){return oe(this,s,o,!1,c)};function Ae(a,s,o,c,E){return s=+s,o=o>>>0,E||se(a,s,o,8),r.write(a,s,o,c,52,8),o+8}l.prototype.writeDoubleLE=function(s,o,c){return Ae(this,s,o,!0,c)},l.prototype.writeDoubleBE=function(s,o,c){return Ae(this,s,o,!1,c)},l.prototype.copy=function(s,o,c,E){if(!l.isBuffer(s))throw new TypeError("argument should be a Buffer");if(c||(c=0),!E&&E!==0&&(E=this.length),o>=s.length&&(o=s.length),o||(o=0),E>0&&E<c&&(E=c),E===c||s.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(c<0||c>=this.length)throw new RangeError("Index out of range");if(E<0)throw new RangeError("sourceEnd out of bounds");E>this.length&&(E=this.length),s.length-o<E-c&&(E=s.length-o+c);const I=E-c;return this===s&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,c,E):Uint8Array.prototype.set.call(s,this.subarray(c,E),o),I},l.prototype.fill=function(s,o,c,E){if(typeof s=="string"){if(typeof o=="string"?(E=o,o=0,c=this.length):typeof c=="string"&&(E=c,c=this.length),E!==void 0&&typeof E!="string")throw new TypeError("encoding must be a string");if(typeof E=="string"&&!l.isEncoding(E))throw new TypeError("Unknown encoding: "+E);if(s.length===1){const m=s.charCodeAt(0);(E==="utf8"&&m<128||E==="latin1")&&(s=m)}}else typeof s=="number"?s=s&255:typeof s=="boolean"&&(s=Number(s));if(o<0||this.length<o||this.length<c)throw new RangeError("Out of range index");if(c<=o)return this;o=o>>>0,c=c===void 0?this.length:c>>>0,s||(s=0);let I;if(typeof s=="number")for(I=o;I<c;++I)this[I]=s;else{const m=l.isBuffer(s)?s:l.from(s,E),p=m.length;if(p===0)throw new TypeError('The value "'+s+'" is invalid for argument "value"');for(I=0;I<c-o;++I)this[I+o]=m[I%p]}return this};const F={};function Z(a,s,o){F[a]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:s.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(E){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:E,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}Z("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Z("ERR_INVALID_ARG_TYPE",function(a,s){return`The "${a}" argument must be of type number. Received type ${typeof s}`},TypeError),Z("ERR_OUT_OF_RANGE",function(a,s,o){let c=`The value of "${a}" is out of range.`,E=o;return Number.isInteger(o)&&Math.abs(o)>2**32?E=ne(String(o)):typeof o=="bigint"&&(E=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(E=ne(E)),E+="n"),c+=` It must be ${s}. Received ${E}`,c},RangeError);function ne(a){let s="",o=a.length;const c=a[0]==="-"?1:0;for(;o>=c+4;o-=3)s=`_${a.slice(o-3,o)}${s}`;return`${a.slice(0,o)}${s}`}function fe(a,s,o){K(s,"offset"),(a[s]===void 0||a[s+o]===void 0)&&G(s,a.length-(o+1))}function ae(a,s,o,c,E,I){if(a>o||a<s){const m=typeof s=="bigint"?"n":"";let p;throw I>3?s===0||s===BigInt(0)?p=`>= 0${m} and < 2${m} ** ${(I+1)*8}${m}`:p=`>= -(2${m} ** ${(I+1)*8-1}${m}) and < 2 ** ${(I+1)*8-1}${m}`:p=`>= ${s}${m} and <= ${o}${m}`,new F.ERR_OUT_OF_RANGE("value",p,a)}fe(c,E,I)}function K(a,s){if(typeof a!="number")throw new F.ERR_INVALID_ARG_TYPE(s,"number",a)}function G(a,s,o){throw Math.floor(a)!==a?(K(a,o),new F.ERR_OUT_OF_RANGE(o||"offset","an integer",a)):s<0?new F.ERR_BUFFER_OUT_OF_BOUNDS:new F.ERR_OUT_OF_RANGE(o||"offset",`>= ${o?1:0} and <= ${s}`,a)}const ge=/[^+/0-9A-Za-z-_]/g;function Be(a){if(a=a.split("=")[0],a=a.trim().replace(ge,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function J(a,s){s=s||1/0;let o;const c=a.length;let E=null;const I=[];for(let m=0;m<c;++m){if(o=a.charCodeAt(m),o>55295&&o<57344){if(!E){if(o>56319){(s-=3)>-1&&I.push(239,191,189);continue}else if(m+1===c){(s-=3)>-1&&I.push(239,191,189);continue}E=o;continue}if(o<56320){(s-=3)>-1&&I.push(239,191,189),E=o;continue}o=(E-55296<<10|o-56320)+65536}else E&&(s-=3)>-1&&I.push(239,191,189);if(E=null,o<128){if((s-=1)<0)break;I.push(o)}else if(o<2048){if((s-=2)<0)break;I.push(o>>6|192,o&63|128)}else if(o<65536){if((s-=3)<0)break;I.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((s-=4)<0)break;I.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return I}function Re(a){const s=[];for(let o=0;o<a.length;++o)s.push(a.charCodeAt(o)&255);return s}function Oe(a,s){let o,c,E;const I=[];for(let m=0;m<a.length&&!((s-=2)<0);++m)o=a.charCodeAt(m),c=o>>8,E=o%256,I.push(E),I.push(c);return I}function ie(a){return t.toByteArray(Be(a))}function x(a,s,o,c){let E;for(E=0;E<c&&!(E+o>=s.length||E>=a.length);++E)s[E+o]=a[E];return E}function U(a,s){return a instanceof s||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===s.name}function V(a){return a!==a}const Me=function(){const a="0123456789abcdef",s=new Array(256);for(let o=0;o<16;++o){const c=o*16;for(let E=0;E<16;++E)s[c+E]=a[o]+a[E]}return s}();function N(a){return typeof BigInt>"u"?Te:a}function Te(){throw new Error("BigInt not supported")}})(buffer);const TEST_DEBUG=!1,MAX_SNAPSHOTS=60;var RUN_MODE=(e=>(e[e.IDLE=0]="IDLE",e[e.RUNNING=-1]="RUNNING",e[e.PAUSED=-2]="PAUSED",e[e.NEED_BOOT=-3]="NEED_BOOT",e[e.NEED_RESET=-4]="NEED_RESET",e))(RUN_MODE||{}),MSG_WORKER=(e=>(e[e.MACHINE_STATE=0]="MACHINE_STATE",e[e.CLICK=1]="CLICK",e[e.DRIVE_PROPS=2]="DRIVE_PROPS",e[e.DRIVE_SOUND=3]="DRIVE_SOUND",e[e.SAVE_STATE=4]="SAVE_STATE",e[e.RUMBLE=5]="RUMBLE",e[e.HELP_TEXT=6]="HELP_TEXT",e[e.SHOW_MOUSE=7]="SHOW_MOUSE",e[e.MBOARD_SOUND=8]="MBOARD_SOUND",e[e.COMM_DATA=9]="COMM_DATA",e[e.MIDI_DATA=10]="MIDI_DATA",e[e.REQUEST_THUMBNAIL=11]="REQUEST_THUMBNAIL",e))(MSG_WORKER||{}),MSG_MAIN=(e=>(e[e.RUN_MODE=0]="RUN_MODE",e[e.STATE6502=1]="STATE6502",e[e.DEBUG=2]="DEBUG",e[e.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",e[e.BREAKPOINTS=4]="BREAKPOINTS",e[e.STEP_INTO=5]="STEP_INTO",e[e.STEP_OVER=6]="STEP_OVER",e[e.STEP_OUT=7]="STEP_OUT",e[e.SPEED=8]="SPEED",e[e.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",e[e.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",e[e.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",e[e.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",e[e.RESTORE_STATE=13]="RESTORE_STATE",e[e.KEYPRESS=14]="KEYPRESS",e[e.MOUSEEVENT=15]="MOUSEEVENT",e[e.PASTE_TEXT=16]="PASTE_TEXT",e[e.APPLE_PRESS=17]="APPLE_PRESS",e[e.APPLE_RELEASE=18]="APPLE_RELEASE",e[e.GET_SAVE_STATE=19]="GET_SAVE_STATE",e[e.GET_SAVE_STATE_SNAPSHOTS=20]="GET_SAVE_STATE_SNAPSHOTS",e[e.DRIVE_PROPS=21]="DRIVE_PROPS",e[e.GAMEPAD=22]="GAMEPAD",e[e.SET_BINARY_BLOCK=23]="SET_BINARY_BLOCK",e[e.COMM_DATA=24]="COMM_DATA",e[e.MIDI_DATA=25]="MIDI_DATA",e[e.RAMWORKS=26]="RAMWORKS",e[e.SOFTSWITCHES=27]="SOFTSWITCHES",e))(MSG_MAIN||{}),COLOR_MODE=(e=>(e[e.COLOR=0]="COLOR",e[e.NOFRINGE=1]="NOFRINGE",e[e.GREEN=2]="GREEN",e[e.AMBER=3]="AMBER",e[e.BLACKANDWHITE=4]="BLACKANDWHITE",e))(COLOR_MODE||{}),DRIVE=(e=>(e[e.MOTOR_OFF=0]="MOTOR_OFF",e[e.MOTOR_ON=1]="MOTOR_ON",e[e.TRACK_END=2]="TRACK_END",e[e.TRACK_SEEK=3]="TRACK_SEEK",e))(DRIVE||{}),ADDR_MODE=(e=>(e[e.IMPLIED=0]="IMPLIED",e[e.IMM=1]="IMM",e[e.ZP_REL=2]="ZP_REL",e[e.ZP_X=3]="ZP_X",e[e.ZP_Y=4]="ZP_Y",e[e.ABS=5]="ABS",e[e.ABS_X=6]="ABS_X",e[e.ABS_Y=7]="ABS_Y",e[e.IND_X=8]="IND_X",e[e.IND_Y=9]="IND_Y",e[e.IND=10]="IND",e))(ADDR_MODE||{});const default6502State=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),isBranchInstruction=e=>e.startsWith("B")&&e!=="BIT"&&e!=="BRK",toHex=(e,t=2)=>(e>255&&(t=4),("0000"+e.toString(16).toUpperCase()).slice(-t)),toASCII=e=>e.split("").map(t=>t.charCodeAt(0)),uint16toBytes=e=>[e&255,e>>>8&255],uint32toBytes=e=>[e&255,e>>>8&255,e>>>16&255,e>>>24&255],replaceSuffix=(e,t)=>{const r=e.lastIndexOf(".")+1;return e.substring(0,r)+t},crcTable=new Uint32Array(256).fill(0),makeCRCTable=()=>{let e;for(let t=0;t<256;t++){e=t;for(let r=0;r<8;r++)e=e&1?3988292384^e>>>1:e>>>1;crcTable[t]=e}},crc32=(e,t=0)=>{crcTable[255]===0&&makeCRCTable();let r=-1;for(let n=t;n<e.length;n++)r=r>>>8^crcTable[(r^e[n])&255];return(r^-1)>>>0};let gamePads;const maxTimeoutCycles=Math.trunc(.0028*1020484);let paddle0timeout=maxTimeoutCycles/2,paddle1timeout=maxTimeoutCycles/2,paddle2timeout=maxTimeoutCycles/2,paddle3timeout=maxTimeoutCycles/2,countStart=0,leftAppleDown=!1,rightAppleDown=!1,leftButtonDown=!1,rightButtonDown=!1,isPB2down=!1,isLeftDown=!1,isRightDown=!1;const setLeftButtonDown=()=>{leftButtonDown=!0},setRightButtonDown=()=>{rightButtonDown=!0},setPushButton2=()=>{isPB2down=!0},valueToTimeout=e=>(e=Math.min(Math.max(e,-1),1),(e+1)*maxTimeoutCycles/2),setGamepad0=e=>{paddle0timeout=valueToTimeout(e)},setGamepad1=e=>{paddle1timeout=valueToTimeout(e)},setGamepad2=e=>{paddle2timeout=valueToTimeout(e)},setGamepad3=e=>{paddle3timeout=valueToTimeout(e)},setButtonState=()=>{isLeftDown=leftAppleDown||leftButtonDown,isRightDown=rightAppleDown||rightButtonDown,SWITCHES.PB0.isSet=isLeftDown,SWITCHES.PB1.isSet=isRightDown||isPB2down,SWITCHES.PB2.isSet=isPB2down},pressAppleCommandKey=(e,t)=>{t?leftAppleDown=e:rightAppleDown=e,setButtonState()},resetJoystick=e=>{memSetC000(49252,128),memSetC000(49253,128),memSetC000(49254,128),memSetC000(49255,128),countStart=e},checkJoystickValues=e=>{const t=e-countStart;memSetC000(49252,t<paddle0timeout?128:0),memSetC000(49253,t<paddle1timeout?128:0),memSetC000(49254,t<paddle2timeout?128:0),memSetC000(49255,t<paddle3timeout?128:0)};let gameMapping,gamePadMapping,isKeyboardJoystick=!1;const setGamepads=e=>{gamePads=e,isKeyboardJoystick=!gamePads.length||!gamePads[0].buttons.length,gameMapping=getGameMapping(),gamePadMapping=gameMapping.gamepad?gameMapping.gamepad:defaultButtons},nearZero=e=>e>-.01&&e<.01,convertGamepadAxes=e=>{let t=e[0],r=e[1];nearZero(t)&&(t=0),nearZero(r)&&(r=0);const n=Math.sqrt(t*t+r*r),D=.95*(n===0?1:Math.max(Math.abs(t),Math.abs(r))/n);return t=Math.min(Math.max(-D,t),D),r=Math.min(Math.max(-D,r),D),t=Math.trunc(maxTimeoutCycles*(t+D)/(2*D)),r=Math.trunc(maxTimeoutCycles*(r+D)/(2*D)),[t,r]},handleGamepad=e=>{const t=gameMapping.joystick?gameMapping.joystick(gamePads[e].axes,isKeyboardJoystick):gamePads[e].axes,r=convertGamepadAxes(t);e===0?(paddle0timeout=r[0],paddle1timeout=r[1],leftButtonDown=!1,rightButtonDown=!1):(paddle2timeout=r[0],paddle3timeout=r[1],isPB2down=!1);let n=!1;gamePads[e].buttons.forEach((D,u)=>{D&&(gamePadMapping(u,gamePads.length>1,e===1),n=!0)}),n||gamePadMapping(-1,gamePads.length>1,e===1),gameMapping.rumble&&gameMapping.rumble(),setButtonState()},handleGamepads=()=>{gamePads&&gamePads.length>0&&(handleGamepad(0),gamePads.length>1&&handleGamepad(1))},gamepad$4=e=>{switch(e){case 0:addToBufferDebounce("JL");break;case 1:addToBufferDebounce("G",200);break;case 2:addToBuffer("M"),addToBufferDebounce("O");break;case 3:addToBufferDebounce("L");break;case 4:addToBufferDebounce("F");break;case 5:addToBuffer("P"),addToBufferDebounce("T");break;case 6:break;case 7:break;case 8:addToBufferDebounce("Z");break;case 9:{const t=getTextPageAsString();t.includes("'N'")?addToBuffer("N"):t.includes("'S'")?addToBuffer("S"):t.includes("NUMERIC KEY")?addToBuffer("1"):addToBuffer("N");break}case 10:break;case 11:break;case 12:addToBufferDebounce("L");break;case 13:addToBufferDebounce("M");break;case 14:addToBufferDebounce("A");break;case 15:addToBufferDebounce("D");break;case-1:return}};let leftdown=0,rightdown=0,buttonreleased=!1;const threshold$2=.5,joystick$2=e=>e[0]<-threshold$2?(rightdown=0,leftdown===0||leftdown>2?(leftdown=0,addToBuffer("A")):leftdown===1&&buttonreleased?addToBufferDebounce("W"):leftdown===2&&buttonreleased&&addToBufferDebounce("R"),leftdown++,buttonreleased=!1,e):e[0]>threshold$2?(leftdown=0,rightdown===0||rightdown>2?(rightdown=0,addToBuffer("D")):rightdown===1&&buttonreleased?addToBufferDebounce("W"):rightdown===2&&buttonreleased&&addToBufferDebounce("R"),rightdown++,buttonreleased=!1,e):e[1]<-threshold$2?(addToBufferDebounce("C"),e):e[1]>threshold$2?(addToBufferDebounce("S"),e):(buttonreleased=!0,e),helptext$7=`AZTEC
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
`,aztec={address:6509,data:[173,0,192],keymap:{},joystick:joystick$2,gamepad:gamepad$4,rumble:null,setup:null,helptext:helptext$7},helptext$6=`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`,gamepad$3=e=>{switch(e){case 0:addToBuffer(" ");break;case 12:addToBuffer("A");break;case 13:addToBuffer("Z");break;case 14:addToBuffer("\b");break;case 15:addToBuffer("");break;case-1:return}},drol={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:gamepad$3,rumble:null,setup:null,helptext:helptext$6},helptext$5=`FIREBUG
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
`,firebug={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:helptext$5};let memB6=14,memB7=14;const karatekaRumble=()=>{let e=memGet(182,!1);memB6<40&&e<memB6&&passRumble({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),memB6=e,e=memGet(183,!1),memB7<40&&e<memB7&&passRumble({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),memB7=e},helptext$4=`KARATEKA
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
`,karateka={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:karatekaRumble,setup:null,helptext:helptext$4},gamepad$2=e=>{switch(e){case 0:addToBufferDebounce("A");break;case 1:addToBufferDebounce("C",50);break;case 2:addToBufferDebounce("O");break;case 3:addToBufferDebounce("T");break;case 4:addToBufferDebounce("\x1B");break;case 5:addToBufferDebounce("\r");break;case 6:break;case 7:break;case 8:addToBuffer("N"),addToBufferDebounce("'");break;case 9:addToBuffer("Y"),addToBufferDebounce("1");break;case 10:break;case 11:break;case 12:break;case 13:addToBufferDebounce(" ");break;case 14:break;case 15:addToBufferDebounce("	");break;case-1:return}},threshold$1=.5,joystick$1=(e,t)=>{if(t)return e;const r=e[0]<-threshold$1?"\b":e[0]>threshold$1?"":"",n=e[1]<-threshold$1?"\v":e[1]>threshold$1?`
`:"";let D=r+n;return D||(D=e[2]<-threshold$1?"L\b":e[2]>threshold$1?"L":"",D||(D=e[3]<-threshold$1?"L\v":e[3]>threshold$1?`L
`:"")),D&&addToBufferDebounce(D,200),[0,0,0,0]},helptext$3=`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
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
ESC  exit conversation`,noxarchaist={address:768,data:[141,74,3,132],keymap:{},gamepad:gamepad$2,joystick:joystick$1,rumble:null,setup:null,helptext:helptext$3},helptext$2=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,gamepad$1=e=>{switch(e){case 1:memSet(109,255);break;case 12:addToBuffer("A");break;case 13:addToBuffer("Z");break;case 14:addToBuffer("\b");break;case 15:addToBuffer("");break}},threshold=.75,joystick=e=>{const t=e[0]<-threshold?"\b":e[0]>threshold?"":e[1]<-threshold?"A":e[1]>threshold?"Z":"";return t&&addToBuffer(t),e},setup=()=>{memSet(25025,173),memSet(25036,64)},snoggle=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup,helptext:helptext$2},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick,gamepad:gamepad$1,rumble:null,setup:null,helptext:helptext$2}],helptext$1=`Wizardry
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
`,wizardry={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:helptext$1},helptext=`Castle Wolfenstein
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
LB button: Inventory`,gamepad=e=>{switch(e){case 0:setLeftButtonDown();break;case 1:setRightButtonDown();break;case 2:addToBufferDebounce(" ");break;case 3:addToBufferDebounce("U");break;case 4:addToBufferDebounce("\r");break;case 5:addToBufferDebounce("T");break;case 9:{const t=getTextPageAsString();t.includes("'N'")?addToBuffer("N"):t.includes("'S'")?addToBuffer("S"):t.includes("NUMERIC KEY")?addToBuffer("1"):addToBuffer("N");break}case 10:setLeftButtonDown();break}},wolfsetup=()=>{memSet(5128,0),memSet(5130,4);let e=5210;memSet(e,234),memSet(e+1,234),memSet(e+2,234),e=5224,memSet(e,234),memSet(e+1,234),memSet(e+2,234)},rumble=()=>{memGet(49178,!1)<128&&memGet(49181,!1)<128&&passRumble({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},wolfenstein={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad,rumble,setup:wolfsetup,helptext},gameLibrary=new Array,AddGameLibraryItem=e=>{Array.isArray(e)?gameLibrary.push(...e):gameLibrary.push(e)};AddGameLibraryItem(aztec),AddGameLibraryItem(drol),AddGameLibraryItem(firebug),AddGameLibraryItem(karateka),AddGameLibraryItem(noxarchaist),AddGameLibraryItem(snoggle),AddGameLibraryItem(wizardry),AddGameLibraryItem(wolfenstein);const defaultButtons=(e,t,r)=>{if(r)switch(e){case 0:setPushButton2();break;case 1:break;case 12:setGamepad3(-1);break;case 13:setGamepad3(1);break;case 14:setGamepad2(-1);break;case 15:setGamepad2(1);break}else switch(e){case 0:setLeftButtonDown();break;case 1:t||setRightButtonDown();break;case 12:setGamepad1(-1);break;case 13:setGamepad1(1);break;case 14:setGamepad0(-1);break;case 15:setGamepad0(1);break}},defaultGame={address:0,data:[],keymap:{},gamepad:null,joystick:e=>e,rumble:null,setup:null,helptext:""},handleKeyMapping=e=>{for(const t of gameLibrary)if(matchMemory(t.address,t.data))return e in t.keymap?t.keymap[e]:e;return e},getGameMapping=()=>{for(const e of gameLibrary)if(matchMemory(e.address,e.data))return e;return defaultGame},handleGameSetup=(e=!1)=>{for(const t of gameLibrary)if(matchMemory(t.address,t.data)){passHelptext(t.helptext?t.helptext:" "),t.setup&&t.setup();return}e&&passHelptext(" ")},keyPress=e=>{memSetC000(49152,e|128,32)};let keyBuffer="",tPrevPop=1e9;const popKey=()=>{const e=performance.now();if(keyBuffer!==""&&(memGetC000(49152)<128||e-tPrevPop>1500)){tPrevPop=e;const t=keyBuffer.charCodeAt(0);keyPress(t),keyBuffer=keyBuffer.slice(1),keyBuffer.length===0&&doTakeSnapshot(!0)}};let prevKey="";const addToBuffer=e=>{e===prevKey&&keyBuffer.length>0||(prevKey=e,keyBuffer+=e)};let tPrev=0;const addToBufferDebounce=(e,t=300)=>{const r=performance.now();r-tPrev<t||(tPrev=r,addToBuffer(e))},sendTextToEmulator=e=>{e.length===1&&(e=handleKeyMapping(e)),addToBuffer(e)},sendPastedText=e=>{e.length===1&&(e=handleKeyMapping(e)),addToBuffer(e)},sswitchArray=[],NewSwitch=(e,t,r,n=!1,D=null)=>{const u={offAddr:e,onAddr:t,isSetAddr:r,writeOnly:n,isSet:!1,setFunc:D};return e>=49152&&(sswitchArray[e-49152]=u),t>=49152&&(sswitchArray[t-49152]=u),r>=49152&&(sswitchArray[r-49152]=u),u},rand=()=>Math.floor(256*Math.random()),handleBankedRAM=e=>{e&=11,SWITCHES.READBSR2.isSet=e===0,SWITCHES.WRITEBSR2.isSet=e===1,SWITCHES.OFFBSR2.isSet=e===2,SWITCHES.RDWRBSR2.isSet=e===3,SWITCHES.READBSR1.isSet=e===8,SWITCHES.WRITEBSR1.isSet=e===9,SWITCHES.OFFBSR1.isSet=e===10,SWITCHES.RDWRBSR1.isSet=e===11,SWITCHES.BSRBANK2.isSet=e<=3,SWITCHES.BSRREADRAM.isSet=[0,3,8,11].includes(e)},SWITCHES={STORE80:NewSwitch(49152,49153,49176,!0),RAMRD:NewSwitch(49154,49155,49171,!0),RAMWRT:NewSwitch(49156,49157,49172,!0),INTCXROM:NewSwitch(49158,49159,49173,!0),INTC8ROM:NewSwitch(0,0,0),ALTZP:NewSwitch(49160,49161,49174,!0),SLOTC3ROM:NewSwitch(49162,49163,49175,!0),COLUMN80:NewSwitch(49164,49165,49183,!0),ALTCHARSET:NewSwitch(49166,49167,49182,!0),KBRDSTROBE:NewSwitch(0,0,49168,!1,()=>{const e=memGetC000(49152)&127;memSetC000(49152,e,32)}),BSRBANK2:NewSwitch(0,0,49169),BSRREADRAM:NewSwitch(0,0,49170),CASSOUT:NewSwitch(49184,0,0),SPEAKER:NewSwitch(49200,0,0,!1,(e,t)=>{memSetC000(49200,rand()),passClickSpeaker(t)}),GCSTROBE:NewSwitch(49216,0,0),EMUBYTE:NewSwitch(0,0,49231,!1,()=>{memSetC000(49231,205)}),TEXT:NewSwitch(49232,49233,49178),MIXED:NewSwitch(49234,49235,49179),PAGE2:NewSwitch(49236,49237,49180),HIRES:NewSwitch(49238,49239,49181),AN0:NewSwitch(49240,49241,0),AN1:NewSwitch(49242,49243,0),AN2:NewSwitch(49244,49245,0),AN3:NewSwitch(49246,49247,0),CASSIN1:NewSwitch(0,0,49248,!1,()=>{memSetC000(49248,rand())}),PB0:NewSwitch(0,0,49249),PB1:NewSwitch(0,0,49250),PB2:NewSwitch(0,0,49251),JOYSTICK0:NewSwitch(0,0,49252,!1,(e,t)=>{checkJoystickValues(t)}),JOYSTICK1:NewSwitch(0,0,49253,!1,(e,t)=>{checkJoystickValues(t)}),JOYSTICK2:NewSwitch(0,0,49254,!1,(e,t)=>{checkJoystickValues(t)}),JOYSTICK3:NewSwitch(0,0,49255,!1,(e,t)=>{checkJoystickValues(t)}),CASSIN2:NewSwitch(0,0,49256,!1,()=>{memSetC000(49256,rand())}),FASTCHIP_LOCK:NewSwitch(49258,0,0),FASTCHIP_ENABLE:NewSwitch(49259,0,0),FASTCHIP_SPEED:NewSwitch(49261,0,0),JOYSTICKRESET:NewSwitch(0,0,49264,!1,(e,t)=>{resetJoystick(t),memSetC000(49264,rand())}),LASER128EX:NewSwitch(49268,0,0),READBSR2:NewSwitch(49280,0,0),WRITEBSR2:NewSwitch(49281,0,0),OFFBSR2:NewSwitch(49282,0,0),RDWRBSR2:NewSwitch(49283,0,0),READBSR1:NewSwitch(49288,0,0),WRITEBSR1:NewSwitch(49289,0,0),OFFBSR1:NewSwitch(49290,0,0),RDWRBSR1:NewSwitch(49291,0,0)};SWITCHES.TEXT.isSet=!0;const skipDebugFlags=[49152,49153,49165,49167,49200,49236,49237,49183],checkSoftSwitches=(e,t,r)=>{if(e>1048575&&!skipDebugFlags.includes(e)){const D=memGetC000(e)>128?1:0;console.log(`${r} $${toHex(s6502.PC)}: $${toHex(e)} [${D}] ${t?"write":""}`)}if(e>=49280&&e<=49295){e-=e&4,handleBankedRAM(e);return}if(e===49152&&!t){popKey();return}const n=sswitchArray[e-49152];if(!n){console.error("Unknown softswitch "+toHex(e)),memSetC000(e,rand());return}if(n.setFunc){n.setFunc(e,r);return}e===n.offAddr||e===n.onAddr?((!n.writeOnly||t)&&(overriddenSwitches[n.offAddr-49152]!==void 0?overriddenSwitches[n.offAddr-49152]=e===n.onAddr:n.isSet=e===n.onAddr),n.isSetAddr&&memSetC000(n.isSetAddr,n.isSet?141:13),e>=49184&&memSetC000(e,rand())):e===n.isSetAddr&&memSetC000(e,n.isSet?141:13)},overriddenSwitches=[],overrideSoftSwitch=e=>{const t=sswitchArray[e-49152];if(!t){console.error("overrideSoftSwitch: Unknown softswitch "+toHex(e));return}overriddenSwitches[t.offAddr-49152]===void 0&&(overriddenSwitches[t.offAddr-49152]=t.isSet),t.isSet=e===t.onAddr},restoreSoftSwitches=()=>{overriddenSwitches.forEach((e,t)=>{e!==void 0&&(sswitchArray[t].isSet=e)}),overriddenSwitches.length=0},romBase64=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,edmBase64=`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
wMiYSqixKCxUwKQqLB7AEAbJILACCUBgSCn/MBat+wRqaEiQDiwewBAJSUAslM7w
AklALB/AEB2NAcBIhCqYRSBKsAStVcDImEqoaJEorVTApCpoYJEoaGBImEisewUg
LM6NewYpgEmrTLXOSJhIrHsFrXsGIFjOaKhoYCBZzan/hTKt+wQpBPACRjKteweF
KK37B4UprfsFhSVgLBLAED2pBs2z+/A2ogMsEcAwAqILjbP7LIDArbP7yQbwAegs
gcAsgcCgAKn4hTeENrE2kTbI0PnmN9D1vYDAvYDAYOmBStAUpD+mPtABiMqKGOU6
hT4QAciY5TvQUaQvuT0ASCDyxGggZsbGLxDvIEj5IBr8IBr8INjFIFP5hDuFOkya
z6U9II74qr0A+sVC0BO9wPnFQ9AMpSykLsCd8KLFLvC5xj3Q3OYsxjXw1qQ0mKog
Svmp3iDs/CDd+yC0/SDH/60AAsmg8BHJjdABYCAF+cmT0Nogdf7w1akDhT0gE/8K
6b7JwpDHCgqiBAomQiZDyhD4xj3w9BDkogUgxMelLAoKBTXJILAGpjXwAgmAhSyE
NLkAAsm78ATJjdC1TGHPVG/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvf0A2zybvJy8nbyf/JO8mrZVfKF8qXyyvIX8/QD
9ANh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD5/QD9AMS43rn1NqV2KTWadaf20jW
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
ZemFG4YaILcAycXQCSDA3iC59iAR9KX5YCAt90wF9iAt90xh9mCQYAAAAAAAAAAA
AAAAAAAAAL0BAhARpQ7wFski8BKlE8lJ8Ay9AAIIyWGQAilfKGC9AAJgSKkgIFzb
aEwk7aUkySEsH8AQBa17BclJYIosH8AwCCyFJDiK5SRg7XsFYAAAAACpQIUUIOPf
qQCFFEzw2CD45sqpKMUhsAKlISDK94YkkNaqIPva0OtKCCBH+CipD5ACaeCFLrEm
RTAlLlEmkSZgIAD4xCywEcggDviQ9mkBSCAA+GjFLZD1YKAv0AKgJ4QtoCepAIUw
ICj4iBD2YEhKKQMJBIUnaCkYkAJpf4UmCgoFJoUmYKUwGGkDKQ+FMAoKCgoFMIUw
YEoIIEf4sSYokARKSkpKKQ9gpjqkOyCW/SBI+aE6qEqQBWqwDCmHSqq9YvkgefjQ
BKD/qQCqvab5hS7JSdABiCkDIP7+8Bgpj6qYoAPgivALSpAISkoJIIjQ+siI0PJg
oAZMrv2NBsCiAr0Fw92c/NAHysoQ9IjQ740HwGCNBsBQBIEAcPOhAFDvpSHJSKkP
sAKpB2ClMdAKrfsGKYEJQI37BiCn/8mo0AqlMdD1pT4pARDsSIrwESz7BlAMpTHQ
CK37BgmAjfsGaGAAAAAAAJgg2v2KTNr9ogOpoCDs/MrQ+GA4pS+kO6oQAYhlOpAB
yGAPIv8zy2L/cwMi/zPLZv93DyD/M8tg/3APIv85y2b/fQsi/zPLpv9zESL/M8um
/4cBIv8zy2D/cAEi/zPLYP9wJDFleAAhgYJZTZGShkqFnUla2QDYpKQArKmso6ik
HIocI12LG6Gdih0jnYsdoRwpGa5pqBkjJFMbIyRTGaGtGlulpWkkJK6uqK0pinyL
FZxtnKVpKVOEEzQRpWkjoNhiWkgmYpSIVETIVGhE6JTEtAiEdLQobnT0zEpy8qSK
BqqidnR0dHJEaLIysnIichoaJiZycojIxMomSEREosiFRaVFTPrDjQbAhUUoIEz/
aIU6aIU7bPADIIL4INr6TGX/2CCE/iAv+yCT/iCJ/q1YwK1awKAJILT76q3/zywQ
wNggOv+t8wNJpc30A9AXrfID0A+p4M3zA9AIoANMrf6Ki6xs8gMgYPuiBb38+p3v
A8rQ96nIhgCFAaAFxgGpAKUBycDw1Y34B7EA2QH70OqIiBD1bAAAII79ovrQBv//
dHTG/6mgIO39vR76IO39qb0g7f21SiDa/egw6GBZ+gDgRSD/AP8D/zzB8PDs5aDd
28TCwf/D///NwdjZ0NOtcMCgAOrqvWTAEATI0PiIYKkAhUitVsCtVMCtUcCpAPAL
rVDArVPAIDb4qRSFIqkAhSCgDNBfqRiFI6kXhSVMIvwgWPygCrkI+5kOBIjQ92Ct
8wNJpY30A2DJjdAYrADAEBPAk9APLBDArADAEPvAg/ADLBDATP37OEws/Ki5SPog
l/sgIf3JzrDuycmQ6snM8ObQ6AYsFcAIjQfATADB///hSEopAwkEhSloKRiQAml/
hSgKCgUohShgyYfQEqlAIKj8oMCpDCCo/K0wwIjQ9WCkJJEo5iSlJMUhsGZgyaCw
76gQ7MmN8FrJivBayYjQycYkEOilIYUkxiSlIsUlsNzGJaUlhSiYoATQiQBJwPAo
af2QwPDaaf2QLPDeaf2QXNC6oArQ4ywfwBAEoADwC5hIIHj7aKQ1YKAFTLT7FFXf
AACpAIUk5iWlJcUjkLbGJaAG0LWNBsBs/gNojfgHycGQDY3/z6AApgGFAbEAhgGN
B8BMo8SQAiUyTPf9OJAYhCqgB7B4yNB1OEjpAdD8aOkB0PZg5kLQAuZDpTzFPqU9
5T/mPNAC5j1gINP8pjykPUyZ/amNIOz8rfsGMOsg4/2pr9AIqaDQBJACaQYsFcAI
jQbAIO39KBADjQfAYLkAAsjJ4ZAGyfuwAinfYKAL0ANMGP0gtPvq6mw4AKADTLT7
6iAM/aAB0PVO+AdMDP3qICH9IKX7ICj9yZvw82CgDSC0+6QknQACIO396urqvQAC
yYjwHcmY8Arg+JADIDr/6NATqdwg7f0gjv2lMyDt/aIBivDzyiA1/cmV0AixKCwf
wDC66p0AAsmN0LwgnPypjdBbpD2mPCCO/SBA+aAAqa1M7Pwg+vgFPIU+pT2FP40H
wEzXwo0GwCBn/Uz5/IRBqUSFQEzX+kqQ5UpKpT6QAkn/ZTxIqb0g7f1oSEpKSkog
5f1oKQ8JsMm6TOj8/2w2AEjJoEyV/EiENahoTEb86urGNPCfytAWybrQu8jIyMjI
0JwAAAAAAACkNLn/AYUxYK37Bo37B6IBqYDQCrE8kUIgtPyQ92CN+wa1PpVCyhD5
YBQaHDQ6PFpsenyJnJ7/4jfiITYh4CLhIiEjI///IHX+qRRIIND4IFP5hTqEO2g4
6QHQ72CK8Ae1PJU6yhD5YKA/0AKg/4QyYKkAhT6iOKAb0AipAIU+ojag8KU+KQ/w
BAnAoACUAJUBoA7QQYzyA0wA4EwD4CB1/iA//2w6AEy9/WDqYI0GwGAATPgDYI0H
wCB1/mhopTtIpTpIID//CEhISIpImEilREyBxwAATLT7IAz+8AMgAP5oaNBsYIUv
mKIN3UH+8ATKEPhgvU/+oABgACD9/Mmg8PlgsG3JoNAouQACogfJjfB9yNBjqcUg
7f2p0iDt/SDt/amHTO39pUhIpUWmRqRHKGCFRYZGhEcIaIVIuoZJ2GAghP4gL/sg
k/4gif7YIDr/qaqFMyBn/SDH/yAF+YQ0oBeIMOjZzP/Q+CC+/6Q0THP/ogMKCgoK
CiY+Jj/KEPilMdAGtT+VPZVB6PDz0AaiAIY+hj8g/fzqSbDJCpDTaYjJ+kwb/6n+
SLnj/0ilMaAAhDFgvLK+mu/E7Km7pqQGlQcCBfAAq5Onxpmyyb7wDIwOlq8XFw0f
g39dzLXNFxf1A/sDYvr6ww==`,opCodes=new Array(256),opTable={},PCODE$1=(e,t,r)=>{console.assert(!opCodes[r],"Duplicate instruction: "+e+" mode="+t),opCodes[r]={name:e,mode:t},opTable[e]||(opTable[e]=[]),opTable[e][t]=r};PCODE$1("ADC",ADDR_MODE.IMM,105),PCODE$1("ADC",ADDR_MODE.ZP_REL,101),PCODE$1("ADC",ADDR_MODE.ZP_X,117),PCODE$1("ADC",ADDR_MODE.ABS,109),PCODE$1("ADC",ADDR_MODE.ABS_X,125),PCODE$1("ADC",ADDR_MODE.ABS_Y,121),PCODE$1("ADC",ADDR_MODE.IND_X,97),PCODE$1("ADC",ADDR_MODE.IND_Y,113),PCODE$1("ADC",ADDR_MODE.IND,114),PCODE$1("AND",ADDR_MODE.IMM,41),PCODE$1("AND",ADDR_MODE.ZP_REL,37),PCODE$1("AND",ADDR_MODE.ZP_X,53),PCODE$1("AND",ADDR_MODE.ABS,45),PCODE$1("AND",ADDR_MODE.ABS_X,61),PCODE$1("AND",ADDR_MODE.ABS_Y,57),PCODE$1("AND",ADDR_MODE.IND_X,33),PCODE$1("AND",ADDR_MODE.IND_Y,49),PCODE$1("AND",ADDR_MODE.IND,50),PCODE$1("ASL",ADDR_MODE.IMPLIED,10),PCODE$1("ASL",ADDR_MODE.ZP_REL,6),PCODE$1("ASL",ADDR_MODE.ZP_X,22),PCODE$1("ASL",ADDR_MODE.ABS,14),PCODE$1("ASL",ADDR_MODE.ABS_X,30),PCODE$1("BCC",ADDR_MODE.ZP_REL,144),PCODE$1("BCS",ADDR_MODE.ZP_REL,176),PCODE$1("BEQ",ADDR_MODE.ZP_REL,240),PCODE$1("BMI",ADDR_MODE.ZP_REL,48),PCODE$1("BNE",ADDR_MODE.ZP_REL,208),PCODE$1("BPL",ADDR_MODE.ZP_REL,16),PCODE$1("BVC",ADDR_MODE.ZP_REL,80),PCODE$1("BVS",ADDR_MODE.ZP_REL,112),PCODE$1("BRA",ADDR_MODE.ZP_REL,128),PCODE$1("BIT",ADDR_MODE.ZP_REL,36),PCODE$1("BIT",ADDR_MODE.ABS,44),PCODE$1("BIT",ADDR_MODE.IMM,137),PCODE$1("BIT",ADDR_MODE.ZP_X,52),PCODE$1("BIT",ADDR_MODE.ABS_X,60),PCODE$1("BRK",ADDR_MODE.IMPLIED,0),PCODE$1("CLC",ADDR_MODE.IMPLIED,24),PCODE$1("CLD",ADDR_MODE.IMPLIED,216),PCODE$1("CLI",ADDR_MODE.IMPLIED,88),PCODE$1("CLV",ADDR_MODE.IMPLIED,184),PCODE$1("CMP",ADDR_MODE.IMM,201),PCODE$1("CMP",ADDR_MODE.ZP_REL,197),PCODE$1("CMP",ADDR_MODE.ZP_X,213),PCODE$1("CMP",ADDR_MODE.ABS,205),PCODE$1("CMP",ADDR_MODE.ABS_X,221),PCODE$1("CMP",ADDR_MODE.ABS_Y,217),PCODE$1("CMP",ADDR_MODE.IND_X,193),PCODE$1("CMP",ADDR_MODE.IND_Y,209),PCODE$1("CMP",ADDR_MODE.IND,210),PCODE$1("CPX",ADDR_MODE.IMM,224),PCODE$1("CPX",ADDR_MODE.ZP_REL,228),PCODE$1("CPX",ADDR_MODE.ABS,236),PCODE$1("CPY",ADDR_MODE.IMM,192),PCODE$1("CPY",ADDR_MODE.ZP_REL,196),PCODE$1("CPY",ADDR_MODE.ABS,204),PCODE$1("DEC",ADDR_MODE.IMPLIED,58),PCODE$1("DEC",ADDR_MODE.ZP_REL,198),PCODE$1("DEC",ADDR_MODE.ZP_X,214),PCODE$1("DEC",ADDR_MODE.ABS,206),PCODE$1("DEC",ADDR_MODE.ABS_X,222),PCODE$1("DEX",ADDR_MODE.IMPLIED,202),PCODE$1("DEY",ADDR_MODE.IMPLIED,136),PCODE$1("EOR",ADDR_MODE.IMM,73),PCODE$1("EOR",ADDR_MODE.ZP_REL,69),PCODE$1("EOR",ADDR_MODE.ZP_X,85),PCODE$1("EOR",ADDR_MODE.ABS,77),PCODE$1("EOR",ADDR_MODE.ABS_X,93),PCODE$1("EOR",ADDR_MODE.ABS_Y,89),PCODE$1("EOR",ADDR_MODE.IND_X,65),PCODE$1("EOR",ADDR_MODE.IND_Y,81),PCODE$1("EOR",ADDR_MODE.IND,82),PCODE$1("INC",ADDR_MODE.IMPLIED,26),PCODE$1("INC",ADDR_MODE.ZP_REL,230),PCODE$1("INC",ADDR_MODE.ZP_X,246),PCODE$1("INC",ADDR_MODE.ABS,238),PCODE$1("INC",ADDR_MODE.ABS_X,254),PCODE$1("INX",ADDR_MODE.IMPLIED,232),PCODE$1("INY",ADDR_MODE.IMPLIED,200),PCODE$1("JMP",ADDR_MODE.ABS,76),PCODE$1("JMP",ADDR_MODE.IND,108),PCODE$1("JMP",ADDR_MODE.IND_X,124),PCODE$1("JSR",ADDR_MODE.ABS,32),PCODE$1("LDA",ADDR_MODE.IMM,169),PCODE$1("LDA",ADDR_MODE.ZP_REL,165),PCODE$1("LDA",ADDR_MODE.ZP_X,181),PCODE$1("LDA",ADDR_MODE.ABS,173),PCODE$1("LDA",ADDR_MODE.ABS_X,189),PCODE$1("LDA",ADDR_MODE.ABS_Y,185),PCODE$1("LDA",ADDR_MODE.IND_X,161),PCODE$1("LDA",ADDR_MODE.IND_Y,177),PCODE$1("LDA",ADDR_MODE.IND,178),PCODE$1("LDX",ADDR_MODE.IMM,162),PCODE$1("LDX",ADDR_MODE.ZP_REL,166),PCODE$1("LDX",ADDR_MODE.ZP_Y,182),PCODE$1("LDX",ADDR_MODE.ABS,174),PCODE$1("LDX",ADDR_MODE.ABS_Y,190),PCODE$1("LDY",ADDR_MODE.IMM,160),PCODE$1("LDY",ADDR_MODE.ZP_REL,164),PCODE$1("LDY",ADDR_MODE.ZP_X,180),PCODE$1("LDY",ADDR_MODE.ABS,172),PCODE$1("LDY",ADDR_MODE.ABS_X,188),PCODE$1("LSR",ADDR_MODE.IMPLIED,74),PCODE$1("LSR",ADDR_MODE.ZP_REL,70),PCODE$1("LSR",ADDR_MODE.ZP_X,86),PCODE$1("LSR",ADDR_MODE.ABS,78),PCODE$1("LSR",ADDR_MODE.ABS_X,94),PCODE$1("NOP",ADDR_MODE.IMPLIED,234),PCODE$1("ORA",ADDR_MODE.IMM,9),PCODE$1("ORA",ADDR_MODE.ZP_REL,5),PCODE$1("ORA",ADDR_MODE.ZP_X,21),PCODE$1("ORA",ADDR_MODE.ABS,13),PCODE$1("ORA",ADDR_MODE.ABS_X,29),PCODE$1("ORA",ADDR_MODE.ABS_Y,25),PCODE$1("ORA",ADDR_MODE.IND_X,1),PCODE$1("ORA",ADDR_MODE.IND_Y,17),PCODE$1("ORA",ADDR_MODE.IND,18),PCODE$1("PHA",ADDR_MODE.IMPLIED,72),PCODE$1("PHP",ADDR_MODE.IMPLIED,8),PCODE$1("PHX",ADDR_MODE.IMPLIED,218),PCODE$1("PHY",ADDR_MODE.IMPLIED,90),PCODE$1("PLA",ADDR_MODE.IMPLIED,104),PCODE$1("PLP",ADDR_MODE.IMPLIED,40),PCODE$1("PLX",ADDR_MODE.IMPLIED,250),PCODE$1("PLY",ADDR_MODE.IMPLIED,122),PCODE$1("ROL",ADDR_MODE.IMPLIED,42),PCODE$1("ROL",ADDR_MODE.ZP_REL,38),PCODE$1("ROL",ADDR_MODE.ZP_X,54),PCODE$1("ROL",ADDR_MODE.ABS,46),PCODE$1("ROL",ADDR_MODE.ABS_X,62),PCODE$1("ROR",ADDR_MODE.IMPLIED,106),PCODE$1("ROR",ADDR_MODE.ZP_REL,102),PCODE$1("ROR",ADDR_MODE.ZP_X,118),PCODE$1("ROR",ADDR_MODE.ABS,110),PCODE$1("ROR",ADDR_MODE.ABS_X,126),PCODE$1("RTI",ADDR_MODE.IMPLIED,64),PCODE$1("RTS",ADDR_MODE.IMPLIED,96),PCODE$1("SBC",ADDR_MODE.IMM,233),PCODE$1("SBC",ADDR_MODE.ZP_REL,229),PCODE$1("SBC",ADDR_MODE.ZP_X,245),PCODE$1("SBC",ADDR_MODE.ABS,237),PCODE$1("SBC",ADDR_MODE.ABS_X,253),PCODE$1("SBC",ADDR_MODE.ABS_Y,249),PCODE$1("SBC",ADDR_MODE.IND_X,225),PCODE$1("SBC",ADDR_MODE.IND_Y,241),PCODE$1("SBC",ADDR_MODE.IND,242),PCODE$1("SEC",ADDR_MODE.IMPLIED,56),PCODE$1("SED",ADDR_MODE.IMPLIED,248),PCODE$1("SEI",ADDR_MODE.IMPLIED,120),PCODE$1("STA",ADDR_MODE.ZP_REL,133),PCODE$1("STA",ADDR_MODE.ZP_X,149),PCODE$1("STA",ADDR_MODE.ABS,141),PCODE$1("STA",ADDR_MODE.ABS_X,157),PCODE$1("STA",ADDR_MODE.ABS_Y,153),PCODE$1("STA",ADDR_MODE.IND_X,129),PCODE$1("STA",ADDR_MODE.IND_Y,145),PCODE$1("STA",ADDR_MODE.IND,146),PCODE$1("STX",ADDR_MODE.ZP_REL,134),PCODE$1("STX",ADDR_MODE.ZP_Y,150),PCODE$1("STX",ADDR_MODE.ABS,142),PCODE$1("STY",ADDR_MODE.ZP_REL,132),PCODE$1("STY",ADDR_MODE.ZP_X,148),PCODE$1("STY",ADDR_MODE.ABS,140),PCODE$1("STZ",ADDR_MODE.ZP_REL,100),PCODE$1("STZ",ADDR_MODE.ZP_X,116),PCODE$1("STZ",ADDR_MODE.ABS,156),PCODE$1("STZ",ADDR_MODE.ABS_X,158),PCODE$1("TAX",ADDR_MODE.IMPLIED,170),PCODE$1("TAY",ADDR_MODE.IMPLIED,168),PCODE$1("TSX",ADDR_MODE.IMPLIED,186),PCODE$1("TXA",ADDR_MODE.IMPLIED,138),PCODE$1("TXS",ADDR_MODE.IMPLIED,154),PCODE$1("TYA",ADDR_MODE.IMPLIED,152),PCODE$1("TRB",ADDR_MODE.ZP_REL,20),PCODE$1("TRB",ADDR_MODE.ABS,28),PCODE$1("TSB",ADDR_MODE.ZP_REL,4),PCODE$1("TSB",ADDR_MODE.ABS,12);const twoByteNops$1=[2,34,66,98,130,194,226],nopUndoc$1="???";twoByteNops$1.forEach(e=>{PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,e)});for(let e=0;e<=15;e++)PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,3+16*e),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,7+16*e),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,11+16*e),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,15+16*e);PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,68),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,84),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,212),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,244),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,92),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,220),PCODE$1(nopUndoc$1,ADDR_MODE.IMPLIED,252);for(let e=0;e<256;e++)opCodes[e]||console.log("ERROR: OPCODE "+e.toString(16)+" should be implemented");const convertBreakpointExpression=e=>{let t=e.toUpperCase();return t=t.replace(/#\$/g,"0x"),t=t.replace(/#/g,""),t=t.replace(/\$([0-9A-F]+)/g,"memGet(0x$1)"),t};class Breakpoint{constructor(){g(this,"address");g(this,"watchpoint");g(this,"instruction");g(this,"disabled");g(this,"hidden");g(this,"once");g(this,"memget");g(this,"memset");g(this,"expression");g(this,"hexvalue");g(this,"hitcount");g(this,"nhits");g(this,"memoryBank");this.address=0,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class BreakpointMap extends Map{set(t,r){const n=[...this.entries()];n.push([t,r]),n.sort((D,u)=>D[0]-u[0]),super.clear();for(const[D,u]of n)super.set(D,u);return this}}let breakpointSkipOnce=!1,doWatchpointBreak=!1,breakpointMap=new BreakpointMap;const doSetBreakpointSkipOnce=()=>{breakpointSkipOnce=!0},setStepOut=()=>{new BreakpointMap(breakpointMap).forEach((n,D)=>{n.once&&breakpointMap.delete(D)});const t=getLastJSR();if(t<0||breakpointMap.get(t))return;const r=new Breakpoint;r.address=t,r.once=!0,r.hidden=!0,breakpointMap.set(t,r)},doSetBreakpoints=e=>{breakpointMap=e},checkMemoryBank=(e,t)=>{const r=MEMORY_BANKS[e];return!(t<r.min||t>r.max||!r.enabled(t))},isWatchpoint=(e,t,r)=>{const n=breakpointMap.get(e);return!n||!n.watchpoint||n.disabled||n.hexvalue>=0&&n.hexvalue!==t||n.memoryBank&&!checkMemoryBank(n.memoryBank,e)?!1:r?n.memset:n.memget},interruptRequest=(e=0,t=!0)=>{t?s6502.flagIRQ|=1<<e:s6502.flagIRQ&=~(1<<e),s6502.flagIRQ&=255},nonMaskableInterrupt=(e=!0)=>{s6502.flagNMI=e===!0},clearInterrupts=()=>{s6502.flagIRQ=0,s6502.flagNMI=!1},cycleCountCallbacks=[],cycleCountCBdata=[],registerCycleCountCallback=(e,t)=>{cycleCountCallbacks.push(e),cycleCountCBdata.push(t)},processCycleCountCallbacks=()=>{for(let e=0;e<cycleCountCallbacks.length;e++)cycleCountCallbacks[e](cycleCountCBdata[e])},evaluateBreakpointExpression=expression=>{const A=s6502.Accum,X=s6502.XReg,Y=s6502.YReg,S=s6502.StackPtr,P=s6502.PStatus;try{return eval(expression)}catch(e){return A+X+Y+S+P===-1}},setWatchpointBreak=()=>{doWatchpointBreak=!0},hitBreakpoint=(e=-1,t=-1)=>{if(doWatchpointBreak)return doWatchpointBreak=!1,!0;if(breakpointMap.size===0||breakpointSkipOnce)return!1;const r=breakpointMap.get(s6502.PC)||breakpointMap.get(e|65536);if(!r||r.disabled||r.watchpoint||r.instruction&&r.hexvalue>=0&&r.hexvalue!==t)return!1;if(r.expression){const n=convertBreakpointExpression(r.expression);if(!evaluateBreakpointExpression(n))return!1}if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!checkMemoryBank(r.memoryBank,s6502.PC)?!1:(r.once&&breakpointMap.delete(s6502.PC),!0)},processInstruction=()=>{let e=0;const t=s6502.PC,r=memGet(s6502.PC,!1),n=pcodes[r],D=n.bytes>1?memGet(s6502.PC+1,!1):0,u=n.bytes>2?memGet(s6502.PC+2,!1):0;if(hitBreakpoint(r,(u<<8)+D))return doSetRunMode(RUN_MODE.PAUSED),-1;breakpointSkipOnce=!1;const C=specialJumpTable.get(t);if(C&&!SWITCHES.INTCXROM.isSet&&C(),e=n.execute(D,u),incrementPC(n.bytes),setCycleCount(s6502.cycleCount+e),processCycleCountCallbacks(),s6502.flagNMI&&(s6502.flagNMI=!1,e=doNonMaskableInterrupt(),setCycleCount(s6502.cycleCount+e)),s6502.flagIRQ){const l=doInterruptRequest();l>0&&(setCycleCount(s6502.cycleCount+l),e=l)}return e},RAMWorksSize=1024-64;let RAMWorksMaxBank=0;const BaseMachineMemory=163584;let memory=new Uint8Array(BaseMachineMemory+RAMWorksMaxBank*65536).fill(0);const addressGetTable=new Array(257).fill(0),addressSetTable=new Array(257).fill(0),AUXindex=256,ROMindex=512,SLOTindex=576,SLOTC8index=583,RAMWorksIndex=639,ROMstart=256*ROMindex,SLOTstart=256*SLOTindex,SLOTC8start=256*SLOTC8index,AUXstart=256*AUXindex;let C800Slot=0,RAMWorksBankIndex=0;const doSetRAMWorks=e=>{if(e){if(RAMWorksMaxBank>0)return;RAMWorksMaxBank=RAMWorksSize/64;const t=memory.slice(0,BaseMachineMemory);memory=new Uint8Array(BaseMachineMemory+RAMWorksMaxBank*65536).fill(0),memory.set(t),memory.fill(0,BaseMachineMemory,BaseMachineMemory+RAMWorksMaxBank*65536)}else{if(RAMWorksMaxBank===0)return;RAMWorksMaxBank=0,RAMWorksBankIndex=0,memory=memory.slice(0,BaseMachineMemory)}},updateMainAuxMemoryTable=()=>{const e=SWITCHES.RAMRD.isSet?RAMWorksBankIndex||AUXindex:0,t=SWITCHES.RAMWRT.isSet?RAMWorksBankIndex||AUXindex:0,r=SWITCHES.PAGE2.isSet?RAMWorksBankIndex||AUXindex:0,n=SWITCHES.STORE80.isSet?r:e,D=SWITCHES.STORE80.isSet?r:t,u=SWITCHES.STORE80.isSet&&SWITCHES.HIRES.isSet?r:e,C=SWITCHES.STORE80.isSet&&SWITCHES.HIRES.isSet?r:t;for(let l=2;l<256;l++)addressGetTable[l]=l+e,addressSetTable[l]=l+t;for(let l=4;l<=7;l++)addressGetTable[l]=l+n,addressSetTable[l]=l+D;for(let l=32;l<=63;l++)addressGetTable[l]=l+u,addressSetTable[l]=l+C},updateReadBankSwitchedRamTable=()=>{const e=SWITCHES.ALTZP.isSet?RAMWorksBankIndex||AUXindex:0;if(addressGetTable[0]=e,addressGetTable[1]=1+e,addressSetTable[0]=e,addressSetTable[1]=1+e,SWITCHES.BSRREADRAM.isSet){for(let t=208;t<=255;t++)addressGetTable[t]=t+e;if(!SWITCHES.BSRBANK2.isSet)for(let t=208;t<=223;t++)addressGetTable[t]=t-16+e}else for(let t=208;t<=255;t++)addressGetTable[t]=ROMindex+t-192},updateWriteBankSwitchedRamTable=()=>{const e=SWITCHES.ALTZP.isSet?RAMWorksBankIndex||AUXindex:0,t=SWITCHES.WRITEBSR1.isSet||SWITCHES.WRITEBSR2.isSet||SWITCHES.RDWRBSR1.isSet||SWITCHES.RDWRBSR2.isSet;for(let r=192;r<=255;r++)addressSetTable[r]=-1;if(t){for(let r=208;r<=255;r++)addressSetTable[r]=r+e;if(!SWITCHES.BSRBANK2.isSet)for(let r=208;r<=223;r++)addressSetTable[r]=r-16+e}},slotIsActive=e=>SWITCHES.INTCXROM.isSet?!1:e!==3?!0:SWITCHES.SLOTC3ROM.isSet,slotC8IsActive=()=>!(SWITCHES.INTCXROM.isSet||SWITCHES.INTC8ROM.isSet||C800Slot<=0),manageC800=e=>{if(e<8){if(SWITCHES.INTCXROM.isSet)return;e===3&&!SWITCHES.SLOTC3ROM.isSet&&(SWITCHES.INTC8ROM.isSet||(SWITCHES.INTC8ROM.isSet=!0,C800Slot=-1,updateAddressTables())),C800Slot===0&&(C800Slot=e,updateAddressTables())}else SWITCHES.INTC8ROM.isSet=!1,C800Slot=0,updateAddressTables()},updateSlotRomTable=()=>{addressGetTable[192]=ROMindex-192;for(let e=1;e<=7;e++){const t=192+e;addressGetTable[t]=e+(slotIsActive(e)?SLOTindex-1:ROMindex)}if(slotC8IsActive()){const e=SLOTC8index+8*(C800Slot-1);for(let t=0;t<=7;t++){const r=200+t;addressGetTable[r]=e+t}}else for(let e=200;e<=207;e++)addressGetTable[e]=ROMindex+e-192},updateAddressTables=()=>{updateMainAuxMemoryTable(),updateReadBankSwitchedRamTable(),updateWriteBankSwitchedRamTable(),updateSlotRomTable();for(let e=0;e<256;e++)addressGetTable[e]=256*addressGetTable[e],addressSetTable[e]=256*addressSetTable[e]},specialJumpTable=new Map,slotIOCallbackTable=new Array(8),checkSlotIO=(e,t=-1)=>{const r=e>>8===192?e-49280>>4:(e>>8)-192;if(e>=49408&&(manageC800(r),!slotIsActive(r)))return;const n=slotIOCallbackTable[r];if(n!==void 0){const D=n(e,t);if(D>=0){const u=e>=49408?SLOTstart-256:ROMstart;memory[e-49152+u]=D}}},setSlotIOCallback=(e,t)=>{slotIOCallbackTable[e]=t},setSlotDriver=(e,t,r=0,n=()=>{})=>{if(memory.set(t.slice(0,256),SLOTstart+(e-1)*256),t.length>256){const D=t.length>2304?2304:t.length,u=SLOTC8start+(e-1)*2048;memory.set(t.slice(256,D),u)}r&&specialJumpTable.set(r,n)},memoryReset=()=>{memory.fill(255,0,131072);const t=(isDebugging?edmBase64:romBase64).replace(/\n/g,""),r=new Uint8Array(buffer.Buffer.from(t,"base64"));memory.set(r,ROMstart),C800Slot=0,RAMWorksBankIndex=0,updateAddressTables()},memGetSoftSwitch=e=>e===49177?inVBL?13:141:(e>=49296?checkSlotIO(e):checkSoftSwitches(e,!1,s6502.cycleCount),e>=49232&&updateAddressTables(),memory[ROMstart+e-49152]),memGetSlotROM=(e,t)=>{const r=SLOTstart+(e-1)*256+(t&255);return memory[r]},memSetSlotROM=(e,t,r)=>{if(r>=0){const n=SLOTstart+(e-1)*256+(t&255);memory[n]=r&255}},memGet=(e,t=!0)=>{let r=0;const n=e>>>8;if(n===192)r=memGetSoftSwitch(e);else{n>=193&&n<=199?checkSlotIO(e):e===53247&&manageC800(255);const D=addressGetTable[n];r=memory[D+(e&255)]}return t&&isWatchpoint(e,r,!1)&&setWatchpointBreak(),r},memGetRaw=e=>{const t=e>>>8,r=addressGetTable[t];return memory[r+(e&255)]},memSetSoftSwitch=(e,t)=>{if(e===49265||e===49267){if(t>RAMWorksMaxBank)return;RAMWorksBankIndex=t?(t-1)*256+RAMWorksIndex:0}else e>=49296?checkSlotIO(e,t):checkSoftSwitches(e,!0,s6502.cycleCount);(e<=49167||e>=49232)&&updateAddressTables()},memSet=(e,t)=>{const r=e>>>8;if(r===192)memSetSoftSwitch(e,t);else{r>=193&&r<=199?checkSlotIO(e,t):e===53247&&manageC800(255);const n=addressSetTable[r];if(n<0)return;memory[n+(e&255)]=t}isWatchpoint(e,t,!0)&&setWatchpointBreak()},memGetC000=e=>memory[ROMstart+e-49152],memSetC000=(e,t,r=1)=>{const n=ROMstart+e-49152;memory.fill(t,n,n+r)},TEXT_PAGE1=1024,TEXT_PAGE2=2048,offset=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],getTextPage=(e=!1)=>{let t=0,r=24,n=!1;if(e){if(SWITCHES.TEXT.isSet||SWITCHES.HIRES.isSet)return new Uint8Array;r=SWITCHES.MIXED.isSet?20:24,n=SWITCHES.COLUMN80.isSet&&!SWITCHES.AN3.isSet}else{if(!SWITCHES.TEXT.isSet&&!SWITCHES.MIXED.isSet)return new Uint8Array;!SWITCHES.TEXT.isSet&&SWITCHES.MIXED.isSet&&(t=20),n=SWITCHES.COLUMN80.isSet}if(n){const D=SWITCHES.PAGE2.isSet&&!SWITCHES.STORE80.isSet?TEXT_PAGE2:TEXT_PAGE1,u=new Uint8Array(80*(r-t)).fill(160);for(let C=t;C<r;C++){const l=80*(C-t);for(let d=0;d<40;d++)u[l+2*d+1]=memory[D+offset[C]+d],u[l+2*d]=memory[AUXstart+D+offset[C]+d]}return u}else{const D=SWITCHES.PAGE2.isSet?TEXT_PAGE2:TEXT_PAGE1,u=new Uint8Array(40*(r-t));for(let C=t;C<r;C++){const l=40*(C-t),d=D+offset[C];u.set(memory.slice(d,d+40),l)}return u}},getTextPageAsString=()=>buffer.Buffer.from(getTextPage().map(e=>e&=127)).toString(),getHires=()=>{if(SWITCHES.TEXT.isSet||!SWITCHES.HIRES.isSet)return new Uint8Array;const e=SWITCHES.COLUMN80.isSet&&!SWITCHES.AN3.isSet,t=SWITCHES.MIXED.isSet?160:192;if(e){const r=SWITCHES.PAGE2.isSet&&!SWITCHES.STORE80.isSet?16384:8192,n=new Uint8Array(80*t);for(let D=0;D<t;D++){const u=r+40*Math.trunc(D/64)+1024*(D%8)+128*(Math.trunc(D/8)&7);for(let C=0;C<40;C++)n[D*80+2*C+1]=memory[u+C],n[D*80+2*C]=memory[AUXstart+u+C]}return n}else{const r=SWITCHES.PAGE2.isSet?16384:8192,n=new Uint8Array(40*t);for(let D=0;D<t;D++){const u=r+40*Math.trunc(D/64)+1024*(D%8)+128*(Math.trunc(D/8)&7);n.set(memory.slice(u,u+40),D*40)}return n}},getDataBlock=e=>{const t=addressGetTable[e>>>8];return memory.slice(t,t+512)},setMemoryBlock=(e,t)=>{const r=addressSetTable[e>>>8]+(e&255);memory.set(t,r),handleGameSetup()},matchMemory=(e,t)=>{for(let r=0;r<t.length;r++)if(memGet(e+r,!1)!==t[r])return!1;return!0},getZeroPage=()=>{const e=[""],t=addressGetTable[0],r=memory.slice(t,t+256);e[0]="     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F";for(let n=0;n<16;n++){let D=toHex(16*n)+":";for(let u=0;u<16;u++)D+=" "+toHex(r[n*16+u]);e[n+1]=D}return e.join(`
`)},getBaseMemory=()=>memory.slice(0,BaseMachineMemory),MEMORY_BANKS={};MEMORY_BANKS[""]={name:"Any",min:0,max:65535,enabled:()=>!0},MEMORY_BANKS.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535,enabled:(e=0)=>e>=53248?!SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet:e>=512?!SWITCHES.RAMRD.isSet:!SWITCHES.ALTZP.isSet},MEMORY_BANKS.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535,enabled:(e=0)=>e>=53248?SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet:e>=512?SWITCHES.RAMRD.isSet:SWITCHES.ALTZP.isSet},MEMORY_BANKS.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535,enabled:()=>!SWITCHES.BSRREADRAM.isSet},MEMORY_BANKS["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet&&!SWITCHES.BSRBANK2.isSet},MEMORY_BANKS["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet&&SWITCHES.BSRBANK2.isSet},MEMORY_BANKS["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet&&!SWITCHES.BSRBANK2.isSet},MEMORY_BANKS["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>SWITCHES.ALTZP.isSet&&SWITCHES.BSRREADRAM.isSet&&SWITCHES.BSRBANK2.isSet},MEMORY_BANKS["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(e=0)=>e>=49920&&e<=50175?SWITCHES.INTCXROM.isSet||!SWITCHES.SLOTC3ROM.isSet:e>=51200?SWITCHES.INTCXROM.isSet||SWITCHES.INTC8ROM.isSet:SWITCHES.INTCXROM.isSet},MEMORY_BANKS["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(e=0)=>e>=49920&&e<=50175?SWITCHES.INTCXROM.isSet?!1:SWITCHES.SLOTC3ROM.isSet:e>=51200?!SWITCHES.INTCXROM.isSet&&!SWITCHES.INTC8ROM.isSet:!SWITCHES.INTCXROM.isSet},Object.values(MEMORY_BANKS).map(e=>e.name);const s6502=default6502State(),setX=e=>{s6502.XReg=e},setY=e=>{s6502.YReg=e},setCycleCount=e=>{s6502.cycleCount=e},setState6502=e=>{reset6502(),Object.assign(s6502,e)},reset6502=()=>{s6502.Accum=0,s6502.XReg=0,s6502.YReg=0,s6502.PStatus=36,s6502.StackPtr=255,setPC(memGet(65533,!1)*256+memGet(65532,!1)),s6502.flagIRQ=0,s6502.flagNMI=!1},incrementPC=e=>{setPC((s6502.PC+e+65536)%65536)},setPC=e=>{s6502.PC=e},setPStatus=e=>{s6502.PStatus=e|48},stackDump=new Array(256).fill(""),getStackString=()=>{const e=memory.slice(256,512),t=new Array;for(let r=255;r>s6502.StackPtr;r--){let n="$"+toHex(e[r]),D=stackDump[r];stackDump[r].length>3&&r-1>s6502.StackPtr&&(stackDump[r-1]==="JSR"||stackDump[r-1]==="BRK"?(r--,n+=toHex(e[r])):D=""),n=(n+"   ").substring(0,6),t.push(toHex(256+r,4)+": "+n+D)}return t},getLastJSR=()=>{const e=memory.slice(256,512);for(let t=s6502.StackPtr-2;t<=255;t++){const r=e[t];if(stackDump[t].startsWith("JSR")&&t-1>s6502.StackPtr&&stackDump[t-1]==="JSR"){const n=e[t-1]+1;return(r<<8)+n}}return-1},pushStack=(e,t)=>{stackDump[s6502.StackPtr]=e,memSet(256+s6502.StackPtr,t),s6502.StackPtr=(s6502.StackPtr+255)%256},popStack=()=>{s6502.StackPtr=(s6502.StackPtr+1)%256;const e=memGet(256+s6502.StackPtr);if(isNaN(e))throw new Error("illegal stack value");return e},isCarry=()=>(s6502.PStatus&1)!==0,setCarry=(e=!0)=>s6502.PStatus=e?s6502.PStatus|1:s6502.PStatus&254,isZero=()=>(s6502.PStatus&2)!==0,setZero=(e=!0)=>s6502.PStatus=e?s6502.PStatus|2:s6502.PStatus&253,isInterruptDisabled=()=>(s6502.PStatus&4)!==0,setInterruptDisabled=(e=!0)=>s6502.PStatus=e?s6502.PStatus|4:s6502.PStatus&251,isDecimal=()=>(s6502.PStatus&8)!==0,BCD=()=>isDecimal()?1:0,setDecimal=(e=!0)=>s6502.PStatus=e?s6502.PStatus|8:s6502.PStatus&247,setBreak=(e=!0)=>s6502.PStatus=e?s6502.PStatus|16:s6502.PStatus&239,isOverflow=()=>(s6502.PStatus&64)!==0,setOverflow=(e=!0)=>s6502.PStatus=e?s6502.PStatus|64:s6502.PStatus&191,isNegative=()=>(s6502.PStatus&128)!==0,setNegative=(e=!0)=>s6502.PStatus=e?s6502.PStatus|128:s6502.PStatus&127,checkStatus=e=>{setZero(e===0),setNegative(e>=128)},doBranch=(e,t)=>{if(e){const r=s6502.PC;return incrementPC(t>127?t-256:t),3+pageBoundary(r,s6502.PC)}return 2},oneByteAdd=(e,t)=>(e+t+256)%256,address=(e,t)=>t*256+e,twoByteAdd=(e,t,r)=>(t*256+e+r+65536)%65536,pageBoundary=(e,t)=>e>>8!==t>>8?1:0,pcodes=new Array(256),PCODE=(e,t,r,n,D)=>{console.assert(!pcodes[r],"Duplicate instruction: "+e+" mode="+t),pcodes[r]={name:e,pcode:r,mode:t,bytes:n,execute:D}},doIndirectYinstruction=(e,t,r)=>{const n=memGet(e),D=memGet((e+1)%256),u=twoByteAdd(n,D,s6502.YReg);t(u);let C=5+pageBoundary(u,address(n,D));return r&&(C+=BCD()),C},doIndirectInstruction=(e,t,r)=>{const n=memGet(e),D=memGet((e+1)%256),u=address(n,D);t(u);let C=5;return r&&(C+=BCD()),C},doADC_BCD=e=>{let t=(s6502.Accum&15)+(e&15)+(isCarry()?1:0);t>=10&&(t+=6);let r=(s6502.Accum&240)+(e&240)+t;const n=s6502.Accum<=127&&e<=127,D=s6502.Accum>=128&&e>=128;setOverflow((r&255)>=128?n:D),setCarry(r>=160),isCarry()&&(r+=96),s6502.Accum=r&255,checkStatus(s6502.Accum)},doADC_HEX=e=>{let t=s6502.Accum+e+(isCarry()?1:0);setCarry(t>=256),t=t%256;const r=s6502.Accum<=127&&e<=127,n=s6502.Accum>=128&&e>=128;setOverflow(t>=128?r:n),s6502.Accum=t,checkStatus(s6502.Accum)},doADC=e=>{isDecimal()?doADC_BCD(memGet(e)):doADC_HEX(memGet(e))};PCODE("ADC",ADDR_MODE.IMM,105,2,e=>(BCD()?doADC_BCD(e):doADC_HEX(e),2+BCD())),PCODE("ADC",ADDR_MODE.ZP_REL,101,2,e=>(doADC(e),3+BCD())),PCODE("ADC",ADDR_MODE.ZP_X,117,2,e=>(doADC(oneByteAdd(e,s6502.XReg)),4+BCD())),PCODE("ADC",ADDR_MODE.ABS,109,3,(e,t)=>(doADC(address(e,t)),4+BCD())),PCODE("ADC",ADDR_MODE.ABS_X,125,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doADC(r),4+BCD()+pageBoundary(r,address(e,t))}),PCODE("ADC",ADDR_MODE.ABS_Y,121,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doADC(r),4+BCD()+pageBoundary(r,address(e,t))}),PCODE("ADC",ADDR_MODE.IND_X,97,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doADC(address(memGet(t),memGet(t+1))),6+BCD()}),PCODE("ADC",ADDR_MODE.IND_Y,113,2,e=>doIndirectYinstruction(e,doADC,!0)),PCODE("ADC",ADDR_MODE.IND,114,2,e=>doIndirectInstruction(e,doADC,!0));const doAND=e=>{s6502.Accum&=memGet(e),checkStatus(s6502.Accum)};PCODE("AND",ADDR_MODE.IMM,41,2,e=>(s6502.Accum&=e,checkStatus(s6502.Accum),2)),PCODE("AND",ADDR_MODE.ZP_REL,37,2,e=>(doAND(e),3)),PCODE("AND",ADDR_MODE.ZP_X,53,2,e=>(doAND(oneByteAdd(e,s6502.XReg)),4)),PCODE("AND",ADDR_MODE.ABS,45,3,(e,t)=>(doAND(address(e,t)),4)),PCODE("AND",ADDR_MODE.ABS_X,61,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doAND(r),4+pageBoundary(r,address(e,t))}),PCODE("AND",ADDR_MODE.ABS_Y,57,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doAND(r),4+pageBoundary(r,address(e,t))}),PCODE("AND",ADDR_MODE.IND_X,33,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doAND(address(memGet(t),memGet(t+1))),6}),PCODE("AND",ADDR_MODE.IND_Y,49,2,e=>doIndirectYinstruction(e,doAND,!1)),PCODE("AND",ADDR_MODE.IND,50,2,e=>doIndirectInstruction(e,doAND,!1));const doASL=e=>{let t=memGet(e);memGet(e),setCarry((t&128)===128),t=(t<<1)%256,memSet(e,t),checkStatus(t)};PCODE("ASL",ADDR_MODE.IMPLIED,10,1,()=>(setCarry((s6502.Accum&128)===128),s6502.Accum=(s6502.Accum<<1)%256,checkStatus(s6502.Accum),2)),PCODE("ASL",ADDR_MODE.ZP_REL,6,2,e=>(doASL(e),5)),PCODE("ASL",ADDR_MODE.ZP_X,22,2,e=>(doASL(oneByteAdd(e,s6502.XReg)),6)),PCODE("ASL",ADDR_MODE.ABS,14,3,(e,t)=>(doASL(address(e,t)),6)),PCODE("ASL",ADDR_MODE.ABS_X,30,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doASL(r),6+pageBoundary(r,address(e,t))}),PCODE("BCC",ADDR_MODE.ZP_REL,144,2,e=>doBranch(!isCarry(),e)),PCODE("BCS",ADDR_MODE.ZP_REL,176,2,e=>doBranch(isCarry(),e)),PCODE("BEQ",ADDR_MODE.ZP_REL,240,2,e=>doBranch(isZero(),e)),PCODE("BMI",ADDR_MODE.ZP_REL,48,2,e=>doBranch(isNegative(),e)),PCODE("BNE",ADDR_MODE.ZP_REL,208,2,e=>doBranch(!isZero(),e)),PCODE("BPL",ADDR_MODE.ZP_REL,16,2,e=>doBranch(!isNegative(),e)),PCODE("BVC",ADDR_MODE.ZP_REL,80,2,e=>doBranch(!isOverflow(),e)),PCODE("BVS",ADDR_MODE.ZP_REL,112,2,e=>doBranch(isOverflow(),e)),PCODE("BRA",ADDR_MODE.ZP_REL,128,2,e=>doBranch(!0,e));const doBit=e=>{setZero((s6502.Accum&e)===0),setNegative((e&128)!==0),setOverflow((e&64)!==0)};PCODE("BIT",ADDR_MODE.ZP_REL,36,2,e=>(doBit(memGet(e)),3)),PCODE("BIT",ADDR_MODE.ABS,44,3,(e,t)=>(doBit(memGet(address(e,t))),4)),PCODE("BIT",ADDR_MODE.IMM,137,2,e=>(setZero((s6502.Accum&e)===0),2)),PCODE("BIT",ADDR_MODE.ZP_X,52,2,e=>(doBit(memGet(oneByteAdd(e,s6502.XReg))),4)),PCODE("BIT",ADDR_MODE.ABS_X,60,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doBit(memGet(r)),4+pageBoundary(r,address(e,t))});const doInterrupt=(e,t,r=0)=>{const n=(s6502.PC+r)%65536,D=memGet(t),u=memGet(t+1);pushStack(`${e} $`+toHex(u)+toHex(D),Math.trunc(n/256)),pushStack(e,n%256),pushStack("P",s6502.PStatus),setDecimal(!1),setInterruptDisabled();const C=twoByteAdd(D,u,e==="BRK"?-1:0);setPC(C)},doBrk=()=>(setBreak(),doInterrupt("BRK",65534,2),7);PCODE("BRK",ADDR_MODE.IMPLIED,0,1,doBrk);const doInterruptRequest=()=>isInterruptDisabled()?0:(setBreak(!1),doInterrupt("IRQ",65534),7),doNonMaskableInterrupt=()=>(doInterrupt("NMI",65530),7);PCODE("CLC",ADDR_MODE.IMPLIED,24,1,()=>(setCarry(!1),2)),PCODE("CLD",ADDR_MODE.IMPLIED,216,1,()=>(setDecimal(!1),2)),PCODE("CLI",ADDR_MODE.IMPLIED,88,1,()=>(setInterruptDisabled(!1),2)),PCODE("CLV",ADDR_MODE.IMPLIED,184,1,()=>(setOverflow(!1),2));const doCMP=e=>{const t=memGet(e);setCarry(s6502.Accum>=t),checkStatus((s6502.Accum-t+256)%256)},doCMP1=e=>{const t=memGet(e);setCarry(s6502.Accum>=t),checkStatus((s6502.Accum-t+256)%256)};PCODE("CMP",ADDR_MODE.IMM,201,2,e=>(setCarry(s6502.Accum>=e),checkStatus((s6502.Accum-e+256)%256),2)),PCODE("CMP",ADDR_MODE.ZP_REL,197,2,e=>(doCMP(e),3)),PCODE("CMP",ADDR_MODE.ZP_X,213,2,e=>(doCMP(oneByteAdd(e,s6502.XReg)),4)),PCODE("CMP",ADDR_MODE.ABS,205,3,(e,t)=>(doCMP(address(e,t)),4)),PCODE("CMP",ADDR_MODE.ABS_X,221,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doCMP1(r),4+pageBoundary(r,address(e,t))}),PCODE("CMP",ADDR_MODE.ABS_Y,217,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doCMP(r),4+pageBoundary(r,address(e,t))}),PCODE("CMP",ADDR_MODE.IND_X,193,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doCMP(address(memGet(t),memGet(t+1))),6}),PCODE("CMP",ADDR_MODE.IND_Y,209,2,e=>doIndirectYinstruction(e,doCMP,!1)),PCODE("CMP",ADDR_MODE.IND,210,2,e=>doIndirectInstruction(e,doCMP,!1));const doCPX=e=>{const t=memGet(e);setCarry(s6502.XReg>=t),checkStatus((s6502.XReg-t+256)%256)};PCODE("CPX",ADDR_MODE.IMM,224,2,e=>(setCarry(s6502.XReg>=e),checkStatus((s6502.XReg-e+256)%256),2)),PCODE("CPX",ADDR_MODE.ZP_REL,228,2,e=>(doCPX(e),3)),PCODE("CPX",ADDR_MODE.ABS,236,3,(e,t)=>(doCPX(address(e,t)),4));const doCPY=e=>{const t=memGet(e);setCarry(s6502.YReg>=t),checkStatus((s6502.YReg-t+256)%256)};PCODE("CPY",ADDR_MODE.IMM,192,2,e=>(setCarry(s6502.YReg>=e),checkStatus((s6502.YReg-e+256)%256),2)),PCODE("CPY",ADDR_MODE.ZP_REL,196,2,e=>(doCPY(e),3)),PCODE("CPY",ADDR_MODE.ABS,204,3,(e,t)=>(doCPY(address(e,t)),4));const doDEC=e=>{const t=oneByteAdd(memGet(e),-1);memSet(e,t),checkStatus(t)};PCODE("DEC",ADDR_MODE.IMPLIED,58,1,()=>(s6502.Accum=oneByteAdd(s6502.Accum,-1),checkStatus(s6502.Accum),2)),PCODE("DEC",ADDR_MODE.ZP_REL,198,2,e=>(doDEC(e),5)),PCODE("DEC",ADDR_MODE.ZP_X,214,2,e=>(doDEC(oneByteAdd(e,s6502.XReg)),6)),PCODE("DEC",ADDR_MODE.ABS,206,3,(e,t)=>(doDEC(address(e,t)),6)),PCODE("DEC",ADDR_MODE.ABS_X,222,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return memGet(r),doDEC(r),7}),PCODE("DEX",ADDR_MODE.IMPLIED,202,1,()=>(s6502.XReg=oneByteAdd(s6502.XReg,-1),checkStatus(s6502.XReg),2)),PCODE("DEY",ADDR_MODE.IMPLIED,136,1,()=>(s6502.YReg=oneByteAdd(s6502.YReg,-1),checkStatus(s6502.YReg),2));const doEOR=e=>{s6502.Accum^=memGet(e),checkStatus(s6502.Accum)};PCODE("EOR",ADDR_MODE.IMM,73,2,e=>(s6502.Accum^=e,checkStatus(s6502.Accum),2)),PCODE("EOR",ADDR_MODE.ZP_REL,69,2,e=>(doEOR(e),3)),PCODE("EOR",ADDR_MODE.ZP_X,85,2,e=>(doEOR(oneByteAdd(e,s6502.XReg)),4)),PCODE("EOR",ADDR_MODE.ABS,77,3,(e,t)=>(doEOR(address(e,t)),4)),PCODE("EOR",ADDR_MODE.ABS_X,93,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doEOR(r),4+pageBoundary(r,address(e,t))}),PCODE("EOR",ADDR_MODE.ABS_Y,89,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doEOR(r),4+pageBoundary(r,address(e,t))}),PCODE("EOR",ADDR_MODE.IND_X,65,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doEOR(address(memGet(t),memGet(t+1))),6}),PCODE("EOR",ADDR_MODE.IND_Y,81,2,e=>doIndirectYinstruction(e,doEOR,!1)),PCODE("EOR",ADDR_MODE.IND,82,2,e=>doIndirectInstruction(e,doEOR,!1));const doINC=e=>{const t=oneByteAdd(memGet(e),1);memSet(e,t),checkStatus(t)};PCODE("INC",ADDR_MODE.IMPLIED,26,1,()=>(s6502.Accum=oneByteAdd(s6502.Accum,1),checkStatus(s6502.Accum),2)),PCODE("INC",ADDR_MODE.ZP_REL,230,2,e=>(doINC(e),5)),PCODE("INC",ADDR_MODE.ZP_X,246,2,e=>(doINC(oneByteAdd(e,s6502.XReg)),6)),PCODE("INC",ADDR_MODE.ABS,238,3,(e,t)=>(doINC(address(e,t)),6)),PCODE("INC",ADDR_MODE.ABS_X,254,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return memGet(r),doINC(r),7}),PCODE("INX",ADDR_MODE.IMPLIED,232,1,()=>(s6502.XReg=oneByteAdd(s6502.XReg,1),checkStatus(s6502.XReg),2)),PCODE("INY",ADDR_MODE.IMPLIED,200,1,()=>(s6502.YReg=oneByteAdd(s6502.YReg,1),checkStatus(s6502.YReg),2)),PCODE("JMP",ADDR_MODE.ABS,76,3,(e,t)=>(setPC(twoByteAdd(e,t,-3)),3)),PCODE("JMP",ADDR_MODE.IND,108,3,(e,t)=>{const r=address(e,t);return e=memGet(r),t=memGet((r+1)%65536),setPC(twoByteAdd(e,t,-3)),6}),PCODE("JMP",ADDR_MODE.IND_X,124,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return e=memGet(r),t=memGet((r+1)%65536),setPC(twoByteAdd(e,t,-3)),6}),PCODE("JSR",ADDR_MODE.ABS,32,3,(e,t)=>{const r=(s6502.PC+2)%65536;return pushStack("JSR $"+toHex(t)+toHex(e),Math.trunc(r/256)),pushStack("JSR",r%256),setPC(twoByteAdd(e,t,-3)),6});const doLDA=e=>{s6502.Accum=memGet(e),checkStatus(s6502.Accum)};PCODE("LDA",ADDR_MODE.IMM,169,2,e=>(s6502.Accum=e,checkStatus(s6502.Accum),2)),PCODE("LDA",ADDR_MODE.ZP_REL,165,2,e=>(doLDA(e),3)),PCODE("LDA",ADDR_MODE.ZP_X,181,2,e=>(doLDA(oneByteAdd(e,s6502.XReg)),4)),PCODE("LDA",ADDR_MODE.ABS,173,3,(e,t)=>(doLDA(address(e,t)),4)),PCODE("LDA",ADDR_MODE.ABS_X,189,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doLDA(r),4+pageBoundary(r,address(e,t))}),PCODE("LDA",ADDR_MODE.ABS_Y,185,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doLDA(r),4+pageBoundary(r,address(e,t))}),PCODE("LDA",ADDR_MODE.IND_X,161,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doLDA(address(memGet(t),memGet((t+1)%256))),6}),PCODE("LDA",ADDR_MODE.IND_Y,177,2,e=>doIndirectYinstruction(e,doLDA,!1)),PCODE("LDA",ADDR_MODE.IND,178,2,e=>doIndirectInstruction(e,doLDA,!1));const doLDX=e=>{s6502.XReg=memGet(e),checkStatus(s6502.XReg)};PCODE("LDX",ADDR_MODE.IMM,162,2,e=>(s6502.XReg=e,checkStatus(s6502.XReg),2)),PCODE("LDX",ADDR_MODE.ZP_REL,166,2,e=>(doLDX(e),3)),PCODE("LDX",ADDR_MODE.ZP_Y,182,2,e=>(doLDX(oneByteAdd(e,s6502.YReg)),4)),PCODE("LDX",ADDR_MODE.ABS,174,3,(e,t)=>(doLDX(address(e,t)),4)),PCODE("LDX",ADDR_MODE.ABS_Y,190,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doLDX(r),4+pageBoundary(r,address(e,t))});const doLDY=e=>{s6502.YReg=memGet(e),checkStatus(s6502.YReg)};PCODE("LDY",ADDR_MODE.IMM,160,2,e=>(s6502.YReg=e,checkStatus(s6502.YReg),2)),PCODE("LDY",ADDR_MODE.ZP_REL,164,2,e=>(doLDY(e),3)),PCODE("LDY",ADDR_MODE.ZP_X,180,2,e=>(doLDY(oneByteAdd(e,s6502.XReg)),4)),PCODE("LDY",ADDR_MODE.ABS,172,3,(e,t)=>(doLDY(address(e,t)),4)),PCODE("LDY",ADDR_MODE.ABS_X,188,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doLDY(r),4+pageBoundary(r,address(e,t))});const doLSR=e=>{let t=memGet(e);memGet(e),setCarry((t&1)===1),t>>=1,memSet(e,t),checkStatus(t)};PCODE("LSR",ADDR_MODE.IMPLIED,74,1,()=>(setCarry((s6502.Accum&1)===1),s6502.Accum>>=1,checkStatus(s6502.Accum),2)),PCODE("LSR",ADDR_MODE.ZP_REL,70,2,e=>(doLSR(e),5)),PCODE("LSR",ADDR_MODE.ZP_X,86,2,e=>(doLSR(oneByteAdd(e,s6502.XReg)),6)),PCODE("LSR",ADDR_MODE.ABS,78,3,(e,t)=>(doLSR(address(e,t)),6)),PCODE("LSR",ADDR_MODE.ABS_X,94,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doLSR(r),6+pageBoundary(r,address(e,t))}),PCODE("NOP",ADDR_MODE.IMPLIED,234,1,()=>2);const doORA=e=>{s6502.Accum|=memGet(e),checkStatus(s6502.Accum)};PCODE("ORA",ADDR_MODE.IMM,9,2,e=>(s6502.Accum|=e,checkStatus(s6502.Accum),2)),PCODE("ORA",ADDR_MODE.ZP_REL,5,2,e=>(doORA(e),3)),PCODE("ORA",ADDR_MODE.ZP_X,21,2,e=>(doORA(oneByteAdd(e,s6502.XReg)),4)),PCODE("ORA",ADDR_MODE.ABS,13,3,(e,t)=>(doORA(address(e,t)),4)),PCODE("ORA",ADDR_MODE.ABS_X,29,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doORA(r),4+pageBoundary(r,address(e,t))}),PCODE("ORA",ADDR_MODE.ABS_Y,25,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doORA(r),4+pageBoundary(r,address(e,t))}),PCODE("ORA",ADDR_MODE.IND_X,1,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doORA(address(memGet(t),memGet(t+1))),6}),PCODE("ORA",ADDR_MODE.IND_Y,17,2,e=>doIndirectYinstruction(e,doORA,!1)),PCODE("ORA",ADDR_MODE.IND,18,2,e=>doIndirectInstruction(e,doORA,!1)),PCODE("PHA",ADDR_MODE.IMPLIED,72,1,()=>(pushStack("PHA",s6502.Accum),3)),PCODE("PHP",ADDR_MODE.IMPLIED,8,1,()=>(pushStack("PHP",s6502.PStatus|16),3)),PCODE("PHX",ADDR_MODE.IMPLIED,218,1,()=>(pushStack("PHX",s6502.XReg),3)),PCODE("PHY",ADDR_MODE.IMPLIED,90,1,()=>(pushStack("PHY",s6502.YReg),3)),PCODE("PLA",ADDR_MODE.IMPLIED,104,1,()=>(s6502.Accum=popStack(),checkStatus(s6502.Accum),4)),PCODE("PLP",ADDR_MODE.IMPLIED,40,1,()=>(setPStatus(popStack()),4)),PCODE("PLX",ADDR_MODE.IMPLIED,250,1,()=>(s6502.XReg=popStack(),checkStatus(s6502.XReg),4)),PCODE("PLY",ADDR_MODE.IMPLIED,122,1,()=>(s6502.YReg=popStack(),checkStatus(s6502.YReg),4));const doROL=e=>{let t=memGet(e);memGet(e);const r=isCarry()?1:0;setCarry((t&128)===128),t=(t<<1)%256|r,memSet(e,t),checkStatus(t)};PCODE("ROL",ADDR_MODE.IMPLIED,42,1,()=>{const e=isCarry()?1:0;return setCarry((s6502.Accum&128)===128),s6502.Accum=(s6502.Accum<<1)%256|e,checkStatus(s6502.Accum),2}),PCODE("ROL",ADDR_MODE.ZP_REL,38,2,e=>(doROL(e),5)),PCODE("ROL",ADDR_MODE.ZP_X,54,2,e=>(doROL(oneByteAdd(e,s6502.XReg)),6)),PCODE("ROL",ADDR_MODE.ABS,46,3,(e,t)=>(doROL(address(e,t)),6)),PCODE("ROL",ADDR_MODE.ABS_X,62,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doROL(r),6+pageBoundary(r,address(e,t))});const doROR=e=>{let t=memGet(e);memGet(e);const r=isCarry()?128:0;setCarry((t&1)===1),t=t>>1|r,memSet(e,t),checkStatus(t)};PCODE("ROR",ADDR_MODE.IMPLIED,106,1,()=>{const e=isCarry()?128:0;return setCarry((s6502.Accum&1)===1),s6502.Accum=s6502.Accum>>1|e,checkStatus(s6502.Accum),2}),PCODE("ROR",ADDR_MODE.ZP_REL,102,2,e=>(doROR(e),5)),PCODE("ROR",ADDR_MODE.ZP_X,118,2,e=>(doROR(oneByteAdd(e,s6502.XReg)),6)),PCODE("ROR",ADDR_MODE.ABS,110,3,(e,t)=>(doROR(address(e,t)),6)),PCODE("ROR",ADDR_MODE.ABS_X,126,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doROR(r),6+pageBoundary(r,address(e,t))}),PCODE("RTI",ADDR_MODE.IMPLIED,64,1,()=>(setPStatus(popStack()),setBreak(!1),setPC(address(popStack(),popStack())-1),6)),PCODE("RTS",ADDR_MODE.IMPLIED,96,1,()=>(setPC(address(popStack(),popStack())),6));const doSBC_BCD=e=>{const t=255-e;let r=s6502.Accum+t+(isCarry()?1:0);const n=r>=256,D=s6502.Accum<=127&&t<=127,u=s6502.Accum>=128&&t>=128;setOverflow(r%256>=128?D:u);const C=(s6502.Accum&15)-(e&15)+(isCarry()?0:-1);r=s6502.Accum-e+(isCarry()?0:-1),r<0&&(r-=96),C<0&&(r-=6),s6502.Accum=r&255,checkStatus(s6502.Accum),setCarry(n)},doSBC=e=>{BCD()?doSBC_BCD(memGet(e)):doADC_HEX(255-memGet(e))};PCODE("SBC",ADDR_MODE.IMM,233,2,e=>(BCD()?doSBC_BCD(e):doADC_HEX(255-e),2+BCD())),PCODE("SBC",ADDR_MODE.ZP_REL,229,2,e=>(doSBC(e),3+BCD())),PCODE("SBC",ADDR_MODE.ZP_X,245,2,e=>(doSBC(oneByteAdd(e,s6502.XReg)),4+BCD())),PCODE("SBC",ADDR_MODE.ABS,237,3,(e,t)=>(doSBC(address(e,t)),4+BCD())),PCODE("SBC",ADDR_MODE.ABS_X,253,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return doSBC(r),4+BCD()+pageBoundary(r,address(e,t))}),PCODE("SBC",ADDR_MODE.ABS_Y,249,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.YReg);return doSBC(r),4+BCD()+pageBoundary(r,address(e,t))}),PCODE("SBC",ADDR_MODE.IND_X,225,2,e=>{const t=oneByteAdd(e,s6502.XReg);return doSBC(address(memGet(t),memGet(t+1))),6+BCD()}),PCODE("SBC",ADDR_MODE.IND_Y,241,2,e=>doIndirectYinstruction(e,doSBC,!0)),PCODE("SBC",ADDR_MODE.IND,242,2,e=>doIndirectInstruction(e,doSBC,!0)),PCODE("SEC",ADDR_MODE.IMPLIED,56,1,()=>(setCarry(),2)),PCODE("SED",ADDR_MODE.IMPLIED,248,1,()=>(setDecimal(),2)),PCODE("SEI",ADDR_MODE.IMPLIED,120,1,()=>(setInterruptDisabled(),2)),PCODE("STA",ADDR_MODE.ZP_REL,133,2,e=>(memSet(e,s6502.Accum),3)),PCODE("STA",ADDR_MODE.ZP_X,149,2,e=>(memSet(oneByteAdd(e,s6502.XReg),s6502.Accum),4)),PCODE("STA",ADDR_MODE.ABS,141,3,(e,t)=>(memSet(address(e,t),s6502.Accum),4)),PCODE("STA",ADDR_MODE.ABS_X,157,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return memGet(r),memSet(r,s6502.Accum),5}),PCODE("STA",ADDR_MODE.ABS_Y,153,3,(e,t)=>(memSet(twoByteAdd(e,t,s6502.YReg),s6502.Accum),5)),PCODE("STA",ADDR_MODE.IND_X,129,2,e=>{const t=oneByteAdd(e,s6502.XReg);return memSet(address(memGet(t),memGet(t+1)),s6502.Accum),6});const doSTA=e=>{memSet(e,s6502.Accum)};PCODE("STA",ADDR_MODE.IND_Y,145,2,e=>(doIndirectYinstruction(e,doSTA,!1),6)),PCODE("STA",ADDR_MODE.IND,146,2,e=>doIndirectInstruction(e,doSTA,!1)),PCODE("STX",ADDR_MODE.ZP_REL,134,2,e=>(memSet(e,s6502.XReg),3)),PCODE("STX",ADDR_MODE.ZP_Y,150,2,e=>(memSet(oneByteAdd(e,s6502.YReg),s6502.XReg),4)),PCODE("STX",ADDR_MODE.ABS,142,3,(e,t)=>(memSet(address(e,t),s6502.XReg),4)),PCODE("STY",ADDR_MODE.ZP_REL,132,2,e=>(memSet(e,s6502.YReg),3)),PCODE("STY",ADDR_MODE.ZP_X,148,2,e=>(memSet(oneByteAdd(e,s6502.XReg),s6502.YReg),4)),PCODE("STY",ADDR_MODE.ABS,140,3,(e,t)=>(memSet(address(e,t),s6502.YReg),4)),PCODE("STZ",ADDR_MODE.ZP_REL,100,2,e=>(memSet(e,0),3)),PCODE("STZ",ADDR_MODE.ZP_X,116,2,e=>(memSet(oneByteAdd(e,s6502.XReg),0),4)),PCODE("STZ",ADDR_MODE.ABS,156,3,(e,t)=>(memSet(address(e,t),0),4)),PCODE("STZ",ADDR_MODE.ABS_X,158,3,(e,t)=>{const r=twoByteAdd(e,t,s6502.XReg);return memGet(r),memSet(r,0),5}),PCODE("TAX",ADDR_MODE.IMPLIED,170,1,()=>(s6502.XReg=s6502.Accum,checkStatus(s6502.XReg),2)),PCODE("TAY",ADDR_MODE.IMPLIED,168,1,()=>(s6502.YReg=s6502.Accum,checkStatus(s6502.YReg),2)),PCODE("TSX",ADDR_MODE.IMPLIED,186,1,()=>(s6502.XReg=s6502.StackPtr,checkStatus(s6502.XReg),2)),PCODE("TXA",ADDR_MODE.IMPLIED,138,1,()=>(s6502.Accum=s6502.XReg,checkStatus(s6502.Accum),2)),PCODE("TXS",ADDR_MODE.IMPLIED,154,1,()=>(s6502.StackPtr=s6502.XReg,2)),PCODE("TYA",ADDR_MODE.IMPLIED,152,1,()=>(s6502.Accum=s6502.YReg,checkStatus(s6502.Accum),2));const doTRB=e=>{const t=memGet(e);setZero((s6502.Accum&t)===0),memSet(e,t&~s6502.Accum)};PCODE("TRB",ADDR_MODE.ZP_REL,20,2,e=>(doTRB(e),5)),PCODE("TRB",ADDR_MODE.ABS,28,3,(e,t)=>(doTRB(address(e,t)),6));const doTSB=e=>{const t=memGet(e);setZero((s6502.Accum&t)===0),memSet(e,t|s6502.Accum)};PCODE("TSB",ADDR_MODE.ZP_REL,4,2,e=>(doTSB(e),5)),PCODE("TSB",ADDR_MODE.ABS,12,3,(e,t)=>(doTSB(address(e,t)),6));const twoByteNops=[2,34,66,98,130,194,226],nopUndoc="???";twoByteNops.forEach(e=>{PCODE(nopUndoc,ADDR_MODE.IMPLIED,e,2,()=>2)});for(let e=0;e<=15;e++)PCODE(nopUndoc,ADDR_MODE.IMPLIED,3+16*e,1,()=>1),PCODE(nopUndoc,ADDR_MODE.IMPLIED,7+16*e,1,()=>1),PCODE(nopUndoc,ADDR_MODE.IMPLIED,11+16*e,1,()=>1),PCODE(nopUndoc,ADDR_MODE.IMPLIED,15+16*e,1,()=>1);PCODE(nopUndoc,ADDR_MODE.IMPLIED,68,2,()=>3),PCODE(nopUndoc,ADDR_MODE.IMPLIED,84,2,()=>4),PCODE(nopUndoc,ADDR_MODE.IMPLIED,212,2,()=>4),PCODE(nopUndoc,ADDR_MODE.IMPLIED,244,2,()=>4),PCODE(nopUndoc,ADDR_MODE.IMPLIED,92,3,()=>8),PCODE(nopUndoc,ADDR_MODE.IMPLIED,220,3,()=>4),PCODE(nopUndoc,ADDR_MODE.IMPLIED,252,3,()=>4);for(let e=0;e<256;e++)pcodes[e]||(console.log("ERROR: OPCODE "+e.toString(16)+" should be implemented"),PCODE("BRK",ADDR_MODE.IMPLIED,e,1,doBrk));const write_byte=(e,t,r)=>{const n=t&7,D=t>>>3;return e[D]|=r>>>n,n&&(e[D+1]|=r<<8-n),t+8},write_4_and_4=(e,t,r)=>(t=write_byte(e,t,r>>>1|170),t=write_byte(e,t,r|170),t),write_sync=(e,t)=>(t=write_byte(e,t,255),t+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const encode_6_and_2=e=>{const t=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),n=[0,2,1,3];for(let u=0;u<84;u++)r[u]=n[e[u]&3]|n[e[u+86]&3]<<2|n[e[u+172]&3]<<4;r[84]=n[e[84]&3]<<0|n[e[170]&3]<<2,r[85]=n[e[85]&3]<<0|n[e[171]&3]<<2;for(let u=0;u<256;u++)r[86+u]=e[u]>>>2;r[342]=r[341];let D=342;for(;D>1;)D--,r[D]^=r[D-1];for(let u=0;u<343;u++)r[u]=t[r[u]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const serialise_track=(e,t,r)=>{let n=0;const D=new Uint8Array(6646).fill(0);for(let u=0;u<16;u++)n=write_sync(D,n);for(let u=0;u<16;u++){n=write_byte(D,n,213),n=write_byte(D,n,170),n=write_byte(D,n,150),n=write_4_and_4(D,n,254),n=write_4_and_4(D,n,t),n=write_4_and_4(D,n,u),n=write_4_and_4(D,n,254^t^u),n=write_byte(D,n,222),n=write_byte(D,n,170),n=write_byte(D,n,235);for(let d=0;d<7;d++)n=write_sync(D,n);n=write_byte(D,n,213),n=write_byte(D,n,170),n=write_byte(D,n,173);const C=u===15?15:u*(r?8:7)%15,l=encode_6_and_2(e.slice(C*256,C*256+256));for(let d=0;d<l.length;d++)n=write_byte(D,n,l[d]);n=write_byte(D,n,222),n=write_byte(D,n,170),n=write_byte(D,n,235);for(let d=0;d<16;d++)n=write_sync(D,n)}return D},convertdsk2woz=(e,t)=>{const r=e.length/4096;if(r<34||r>40)return new Uint8Array;const n=new Uint8Array(1536+r*13*512).fill(0);n.set(toASCII(`WOZ2ÿ
\r
`),0),n.set(toASCII("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(toASCII("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(toASCII("TMAP"),80),n[84]=160,n.fill(255,88,88+160);let D=0;for(let u=0;u<r;u++)D=88+(u<<2),u>0&&(n[D-1]=u),n[D]=n[D+1]=u;n.set(toASCII("TRKS"),248),n.set(uint32toBytes(1280+r*13*512),252);for(let u=0;u<r;u++){D=256+(u<<3),n.set(uint16toBytes(3+u*13),D),n[D+2]=13,n.set(uint32toBytes(50304),D+4);const C=e.slice(u*16*256,(u+1)*16*256),l=serialise_track(C,u,t);D=1536+u*13*512,n.set(l,D)}return n},decodeWoz2=(e,t)=>{if(!([87,79,90,50,255,10,13,10].find((l,d)=>l!==t[d])===void 0))return!1;e.isWriteProtected=t[22]===1;const D=t.slice(8,12),u=D[0]+(D[1]<<8)+(D[2]<<16)+D[3]*2**24,C=crc32(t,12);if(u!==0&&u!==C)return alert("CRC checksum error: "+e.filename),!1;for(let l=0;l<80;l++){const d=t[88+l*2];if(d<255){const R=256+8*d,f=t.slice(R,R+8);e.trackStart[l]=512*(f[0]+(f[1]<<8)),e.trackNbits[l]=f[4]+(f[5]<<8)+(f[6]<<16)+f[7]*2**24}else e.trackStart[l]=0,e.trackNbits[l]=51200}return!0},decodeWoz1=(e,t)=>{if(!([87,79,90,49,255,10,13,10].find((D,u)=>D!==t[u])===void 0))return!1;e.isWriteProtected=t[22]===1;for(let D=0;D<80;D++){const u=t[88+D*2];if(u<255){e.trackStart[D]=256+u*6656;const C=t.slice(e.trackStart[D]+6646,e.trackStart[D]+6656);e.trackNbits[D]=C[2]+(C[3]<<8)}else e.trackStart[D]=0,e.trackNbits[D]=51200}return!0},isDSK=e=>{const t=e.toLowerCase(),r=t.endsWith(".dsk")||t.endsWith(".do"),n=t.endsWith(".po");return r||n},decodeDSK=(e,t)=>{const n=e.filename.toLowerCase().endsWith(".po"),D=convertdsk2woz(t,n);return D.length===0?new Uint8Array:(e.filename=replaceSuffix(e.filename,"woz"),e.diskHasChanges=!0,D)},int32=e=>e[0]+256*(e[1]+256*(e[2]+256*e[3])),decode2MG=(e,t)=>{const r=int32(t.slice(24,28)),n=int32(t.slice(28,32));let D="";for(let u=0;u<4;u++)D+=String.fromCharCode(t[u]);return D!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):t[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(e.filename=replaceSuffix(e.filename,"hdv"),e.diskHasChanges=!0,t.slice(r,r+n))},isHardDriveImage=e=>{const t=e.toLowerCase();return t.endsWith(".hdv")||t.endsWith(".po")||t.endsWith(".2mg")},decodeDiskData=(e,t)=>{e.diskHasChanges=!1;const r=e.filename.toLowerCase();if(isHardDriveImage(r)){if(e.hardDrive=!0,e.status="",r.endsWith(".hdv")||r.endsWith(".po"))return t;if(r.endsWith(".2mg"))return decode2MG(e,t)}return isDSK(e.filename)&&(t=decodeDSK(e,t)),decodeWoz2(e,t)||decodeWoz1(e,t)?t:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},disk2driver=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let motorOffTimeout=0;const SWITCH={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},doResetDiskDrive=e=>{SWITCH.MOTOR_RUNNING=!1,doMotorTimeout(e),e.halftrack=68,e.prevHalfTrack=68},doPauseDiskDrive=(e=!1)=>{if(e){const t=getCurrentDriveState();t.motorRunning&&startMotor(t)}else passDriveSound(DRIVE.MOTOR_OFF)},moveHead=(e,t)=>{e.trackStart[e.halftrack]>0&&(e.prevHalfTrack=e.halftrack),e.halftrack+=t,e.halftrack<0||e.halftrack>68?(passDriveSound(DRIVE.TRACK_END),e.halftrack=e.halftrack<0?0:e.halftrack>68?68:e.halftrack):passDriveSound(DRIVE.TRACK_SEEK),e.status=` Track ${e.halftrack/2}`,passData(),e.trackStart[e.halftrack]>0&&e.prevHalfTrack!==e.halftrack&&(e.trackLocation=Math.floor(e.trackLocation*(e.trackNbits[e.halftrack]/e.trackNbits[e.prevHalfTrack])),e.trackLocation>3&&(e.trackLocation-=4))},pickbit=[128,64,32,16,8,4,2,1],clearbit=[127,191,223,239,247,251,253,254],getNextBit=(e,t)=>{e.trackLocation=e.trackLocation%e.trackNbits[e.halftrack];let r;if(e.trackStart[e.halftrack]>0){const n=e.trackStart[e.halftrack]+(e.trackLocation>>3),D=t[n],u=e.trackLocation&7;r=(D&pickbit[u])>>7-u}else r=1;return e.trackLocation++,r};let dataRegister=0;const getNextByte=(e,t)=>{if(t.length===0)return 0;let r=0;if(dataRegister===0){for(;getNextBit(e,t)===0;);dataRegister=64;for(let n=5;n>=0;n--)dataRegister|=getNextBit(e,t)<<n}else{const n=getNextBit(e,t);dataRegister=dataRegister<<1|n}return r=dataRegister,dataRegister>127&&(dataRegister=0),r};let prevCycleCount$2=0;const doWriteBit=(e,t,r)=>{if(e.trackLocation=e.trackLocation%e.trackNbits[e.halftrack],e.trackStart[e.halftrack]>0){const n=e.trackStart[e.halftrack]+(e.trackLocation>>3);let D=t[n];const u=e.trackLocation&7;r?D|=pickbit[u]:D&=clearbit[u],t[n]=D}e.trackLocation++},doWriteByte=(e,t,r)=>{if(!(t.length===0||e.trackStart[e.halftrack]===0)&&dataRegister>0){if(r>=16)for(let n=7;n>=0;n--)doWriteBit(e,t,dataRegister&2**n?1:0);r>=36&&doWriteBit(e,t,0),r>=40&&doWriteBit(e,t,0),debugCache.push(r>=40?2:r>=36?1:dataRegister),e.diskHasChanges=!0,dataRegister=0}},doMotorTimeout=e=>{motorOffTimeout=0,SWITCH.MOTOR_RUNNING||(e.motorRunning=!1),passData(),passDriveSound(DRIVE.MOTOR_OFF)},startMotor=e=>{motorOffTimeout&&(clearTimeout(motorOffTimeout),motorOffTimeout=0),e.motorRunning=!0,passData(),passDriveSound(DRIVE.MOTOR_ON)},stopMotor=e=>{motorOffTimeout===0&&(motorOffTimeout=setTimeout(()=>doMotorTimeout(e),1e3))};let debugCache=[];const dumpData=e=>{debugCache.length>0&&e.halftrack===2*0&&(debugCache=[])},STEPPER_MOTORS=[0,0,0,0],handleDriveSoftSwitches=(e,t)=>{if(e>=49408)return-1;let r=getCurrentDriveState();const n=getCurrentDriveData();if(r.hardDrive)return 0;let D=0;const u=s6502.cycleCount-prevCycleCount$2;switch(e=e&15,e){case SWITCH.DATA_LATCH_OFF:SWITCH.DATA_LATCH=!1,r.motorRunning&&!r.writeMode&&(D=getNextByte(r,n));break;case SWITCH.MOTOR_ON:SWITCH.MOTOR_RUNNING=!0,startMotor(r),dumpData(r);break;case SWITCH.MOTOR_OFF:SWITCH.MOTOR_RUNNING=!1,stopMotor(r),dumpData(r);break;case SWITCH.DRIVE1:case SWITCH.DRIVE2:{const C=e===SWITCH.DRIVE1?1:2,l=getCurrentDriveState();setCurrentDrive(C),r=getCurrentDriveState(),r!==l&&l.motorRunning&&(l.motorRunning=!1,r.motorRunning=!0,passData());break}case SWITCH.WRITE_OFF:r.motorRunning&&r.writeMode&&(doWriteByte(r,n,u),prevCycleCount$2=s6502.cycleCount),r.writeMode=!1,SWITCH.DATA_LATCH&&(D=r.isWriteProtected?255:0),dumpData(r);break;case SWITCH.WRITE_ON:r.writeMode=!0,prevCycleCount$2=s6502.cycleCount,t>=0&&(dataRegister=t);break;case SWITCH.DATA_LATCH_ON:SWITCH.DATA_LATCH=!0,r.motorRunning&&(r.writeMode&&(doWriteByte(r,n,u),prevCycleCount$2=s6502.cycleCount),t>=0&&(dataRegister=t));break;default:{if(e<0||e>7)break;STEPPER_MOTORS[Math.floor(e/2)]=e%2;const C=STEPPER_MOTORS[(r.currentPhase+1)%4],l=STEPPER_MOTORS[(r.currentPhase+3)%4];STEPPER_MOTORS[r.currentPhase]||(r.motorRunning&&C?(moveHead(r,1),r.currentPhase=(r.currentPhase+1)%4):r.motorRunning&&l&&(moveHead(r,-1),r.currentPhase=(r.currentPhase+3)%4)),dumpData(r);break}}return D},enableDiskDrive=()=>{setSlotDriver(6,Uint8Array.from(disk2driver)),setSlotIOCallback(6,handleDriveSoftSwitches)};let doOutput=!1;const splitOperand=e=>{const t=e.split(","),r=t[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:t[1]?t[1]:""}},parseNumberOptionalAddressMode=e=>{let t=ADDR_MODE.IMPLIED,r=-1;if(e.length>0){e.startsWith("#")?(t=ADDR_MODE.IMM,e=e.substring(1)):e.startsWith("(")?(e.endsWith(",Y")?t=ADDR_MODE.IND_Y:e.endsWith(",X)")?t=ADDR_MODE.IND_X:t=ADDR_MODE.IND,e=e.substring(1)):e.endsWith(",X")?t=e.length>5?ADDR_MODE.ABS_X:ADDR_MODE.ZP_X:e.endsWith(",Y")?t=e.length>5?ADDR_MODE.ABS_Y:ADDR_MODE.ZP_Y:t=e.length>3?ADDR_MODE.ABS:ADDR_MODE.ZP_REL,e.startsWith("$")&&(e="0x"+e.substring(1)),r=parseInt(e);const n=splitOperand(e);if(n.operation&&n.value){switch(n.operation){case"+":r+=n.value;break;case"-":r-=n.value;break;default:throw new Error("Unknown operation in operand: "+e)}r=(r%65536+65536)%65536}}return[t,r]};let labels={};const getOperandModeValue=(e,t,r,n)=>{let D=ADDR_MODE.IMPLIED,u=-1;if(r.match(/^[#]?[$0-9()]+/))return parseNumberOptionalAddressMode(r);const C=splitOperand(r);if(C.label){const l=C.label.startsWith("<"),d=C.label.startsWith(">"),R=C.label.startsWith("#")||d||l;if(R&&(C.label=C.label.substring(1)),C.label in labels)u=labels[C.label],d?u=u>>8&255:l&&(u=u&255);else if(n===2)throw new Error("Missing label: "+C.label);if(C.operation&&C.value){switch(C.operation){case"+":u+=C.value;break;case"-":u-=C.value;break;default:throw new Error("Unknown operation in operand: "+r)}u=(u%65536+65536)%65536}isBranchInstruction(t)?(D=ADDR_MODE.ZP_REL,u=u-e+254,u>255&&(u-=256)):R?D=ADDR_MODE.IMM:(D=u>=0&&u<=255?ADDR_MODE.ZP_REL:ADDR_MODE.ABS,D=C.idx==="X"?D===ADDR_MODE.ABS?ADDR_MODE.ABS_X:ADDR_MODE.ZP_X:D,D=C.idx==="Y"?D===ADDR_MODE.ABS?ADDR_MODE.ABS_Y:ADDR_MODE.ZP_Y:D)}return[D,u]},splitLine=(e,t)=>{e=e.replace(/\s+/g," ");const r=e.split(" ");return{label:r[0]?r[0]:t,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},handleLabel=(e,t)=>{if(e.label in labels)throw new Error("Redefined label: "+e.label);if(e.instr==="EQU"){const[r,n]=getOperandModeValue(t,e.instr,e.operand,2);if(r!==ADDR_MODE.ABS&&r!==ADDR_MODE.ZP_REL)throw new Error("Illegal EQU value: "+e.operand);labels[e.label]=n}else labels[e.label]=t},getHexCodesForInstruction=(e,t)=>{const r=[],n=pcodes[e];return r.push(e),t>=0&&(r.push(t%256),n.bytes===3&&r.push(Math.trunc(t/256))),r};let orgStart=0;const parseOnce=(e,t)=>{let r=orgStart;const n=[];let D="";if(e.forEach(u=>{if(u=u.split(";")[0].trimEnd().toUpperCase(),!u)return;let C=(u+"                   ").slice(0,30)+toHex(r,4)+"- ";const l=splitLine(u,D);if(D="",!l.instr){D=l.label;return}if(l.instr==="ORG"){if(t===1){const[h,M]=parseNumberOptionalAddressMode(l.operand);h===ADDR_MODE.ABS&&(orgStart=M,r=M)}doOutput&&t===2&&console.log(C);return}if(t===1&&l.label&&handleLabel(l,r),l.instr==="EQU")return;let d=[],R,f;if(l.instr==="ASC"||l.instr==="DA"){let h=l.operand,M=0;if(h.startsWith('"')&&h.endsWith('"'))M=128;else if(h.startsWith("'")&&h.endsWith("'"))M=0;else throw new Error("Invalid string: "+h);h=h.substring(1,h.length-1);for(let w=0;w<h.length;w++)d.push(h.charCodeAt(w)|M);d.push(0),r+=h.length+1}else if([R,f]=getOperandModeValue(r,l.instr,l.operand,t),l.instr==="DB")d.push(f&255),r++;else if(l.instr==="DW")d.push(f&255),d.push(f>>8&255),r+=2;else if(l.instr==="DS")for(let h=0;h<f;h++)d.push(0),r++;else{if(t===2&&isBranchInstruction(l.instr)&&(f<0||f>255))throw new Error(`Branch instruction out of range: ${u} value: ${f} pass: ${t}`);const h=pcodes.findIndex(M=>M&&M.name===l.instr&&M.mode===R);if(h<0)throw new Error(`Unknown instruction: "${u}" mode=${R} pass=${t}`);d=getHexCodesForInstruction(h,f),r+=pcodes[h].bytes}doOutput&&t===2&&(d.forEach(h=>{C+=` ${toHex(h)}`}),console.log(C)),n.push(...d)}),doOutput&&t===2){let u="";n.forEach(C=>{u+=` ${toHex(C)}`}),console.log(u)}return n},parseAssembly=(e,t,r=!1)=>{labels={},doOutput=r;try{return orgStart=e,parseOnce(t,1),parseOnce(t,2)}catch(n){return console.error(n),[]}};let timerID=0;const driverAddr=192,code1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${toHex(driverAddr)}   ; jump address
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
`,code2=`
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
`,prodos8driver$1=()=>{const e=new Uint8Array(256).fill(0),t=parseAssembly(0,code1.split(`
`));e.set(t,0);const r=parseAssembly(0,code2.split(`
`));return e.set(r,driverAddr),e[254]=23,e[255]=driverAddr,e};let code$1=new Uint8Array;const enableHardDrive=(e=!0)=>{code$1.length===0&&(code$1=prodos8driver$1()),code$1[1]=e?32:0;const r=49152+driverAddr+7*256;setSlotDriver(7,code$1,r,processHardDriveBlockAccess),setSlotDriver(7,code$1,r+3,processSmartPortAccess)},processSmartPortAccess=()=>{const e=getHardDriveState();if(!e.hardDrive)return;const t=getHardDriveData(),r=256+s6502.StackPtr,n=memGet(r+1)+256*memGet(r+2),D=memGet(n+1),u=memGet(n+2)+256*memGet(n+3),C=memGet(u+1),l=memGet(u+2)+256*memGet(u+3);switch(D){case 0:{if(memGet(u)!==3){console.error(`Incorrect SmartPort parameter count at address ${u}`),setCarry();return}const d=memGet(u+4);switch(d){case 0:if(C===0)memSet(l,1),setCarry(!1);else if(C===1){const W=getHardDriveData().length/512;memSet(l,240),memSet(l+1,W&255),memSet(l+2,W>>>8),memSet(l+3,0),setX(4),setY(0),setCarry(!1)}else console.error(`SmartPort status for unitNumber ${C} not implemented`),setX(0),setY(0),setCarry();break;case 3:const h=getHardDriveData().length/512,M=h>1600?2:1,w=M==2?32:64;memSet(l+0,240),memSet(l+1,h&255),memSet(l+2,h>>>8),memSet(l+3,0);const _="Apple2ts SP";memSet(l+4,_.length);let b=0;for(;b<_.length;b++)memSet(l+5+b,_.charCodeAt(b));for(;b<16;b++)memSet(l+5+b,_.charCodeAt(8));memSet(l+21,M),memSet(l+22,w),memSet(l+23,1),memSet(l+24,0),setX(25),setY(0),setCarry(!1);break;default:console.error(`SmartPort statusCode ${d} not implemented`),setCarry();break}return}case 1:{if(memGet(u)!==3){console.error(`Incorrect SmartPort parameter count at address ${u}`),setCarry();return}const R=512*(memGet(u+4)+256*memGet(u+5)+65536*memGet(u+6)),f=t.slice(R,R+512);setMemoryBlock(l,f);break}case 2:default:console.error(`SmartPort command ${D} not implemented`),setCarry();return}setCarry(!1),e.motorRunning=!0,timerID||(timerID=setTimeout(()=>{timerID=0,e&&(e.motorRunning=!1),passData()},500)),passData()},processHardDriveBlockAccess=()=>{const e=getHardDriveState();if(!e.hardDrive)return;const t=getHardDriveData(),r=memGet(70)+256*memGet(71),n=512*r,D=memGet(68)+256*memGet(69),u=t.length;switch(e.status=` ${toHex(r,4)} ${toHex(D,4)}`,memGet(66)){case 0:{if(e.filename.length===0||u===0){setX(0),setY(0),setCarry();return}const C=u/512;setX(C&255),setY(C>>>8);break}case 1:{if(n+512>u){setCarry();return}const C=t.slice(n,n+512);setMemoryBlock(D,C);break}case 2:{if(n+512>u){setCarry();return}const C=getDataBlock(D);t.set(C,n),e.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),setCarry();return;default:console.error("unknown hard drive command"),setCarry();return}setCarry(!1),e.motorRunning=!0,timerID||(timerID=setTimeout(()=>{timerID=0,e&&(e.motorRunning=!1),passData()},500)),passData()},initDriveState=e=>({hardDrive:e===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:e>0?Array(80):Array(),trackNbits:e>0?Array(80):Array(),trackLocation:0}),driveState=[initDriveState(0),initDriveState(1),initDriveState(2)],driveData=[new Uint8Array,new Uint8Array,new Uint8Array];let currentDrive=1;const setCurrentDrive=e=>{currentDrive=e},getCurrentDriveState=()=>driveState[currentDrive],getCurrentDriveData=()=>driveData[currentDrive],getHardDriveState=()=>driveState[0],getHardDriveData=()=>driveData[0],passData=()=>{for(let e=0;e<driveState.length;e++){const t={hardDrive:driveState[e].hardDrive,drive:e,filename:driveState[e].filename,status:driveState[e].status,motorRunning:driveState[e].motorRunning,diskHasChanges:driveState[e].diskHasChanges,diskData:driveState[e].diskHasChanges?driveData[e]:new Uint8Array};passDriveProps(t)}},getDriveSaveState=e=>{const t=["","",""];for(let r=e?0:1;r<3;r++)t[r]=buffer.Buffer.from(driveData[r]).toString("base64");return{currentDrive,driveState,driveData:t}},restoreDriveSaveState=e=>{passDriveSound(DRIVE.MOTOR_OFF),currentDrive=e.currentDrive;for(let t=0;t<3;t++)driveState[t]=initDriveState(t),driveData[t]=new Uint8Array;for(let t=0;t<e.driveState.length;t++)driveState[t]=e.driveState[t],e.driveData[t]!==""&&(driveData[t]=new Uint8Array(buffer.Buffer.from(e.driveData[t],"base64")));driveState[0].hardDrive&&enableHardDrive(driveState[0].filename!==""),passData()},resetDrive=()=>{doResetDiskDrive(driveState[1]),doResetDiskDrive(driveState[2]),passData()},doPauseDrive=(e=!1)=>{doPauseDiskDrive(e),passData()},doSetDriveProps=e=>{let t=e.drive;e.filename!==""&&(isHardDriveImage(e.filename)?(t=0,driveState[0].hardDrive=!0):t===0&&(t=1)),driveState[t]=initDriveState(t),driveState[t].filename=e.filename,driveState[t].motorRunning=e.motorRunning,driveData[t]=decodeDiskData(driveState[t],e.diskData),driveData[t].length===0&&(driveState[t].filename=""),driveState[t].hardDrive&&enableHardDrive(driveState[t].filename!==""),passData()},code=`
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
`,STATUS$2={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},CONTROL$2={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},COMMAND={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class SY6551{constructor(t){g(this,"_control");g(this,"_status");g(this,"_command");g(this,"_lastRead");g(this,"_lastConfig");g(this,"_receiveBuffer");g(this,"_extFuncs");this._extFuncs=t,this._control=CONTROL$2.HW_RESET,this._command=COMMAND.HW_RESET,this._status=STATUS$2.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(t){for(let n=0;n<t.length;n++)this._receiveBuffer.push(t[n]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let n=0;n<r;n++)this._receiveBuffer.shift(),this._status|=STATUS$2.OVRN;this._status|=STATUS$2.RX_FULL,this._control&COMMAND.RX_INT_DIS||this.irq(!0)}set data(t){const r=new Uint8Array(1).fill(t);this._extFuncs.sendData(r),this._command&COMMAND.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(STATUS$2.PE|STATUS$2.FE|STATUS$2.OVRN),this._receiveBuffer.length?(this._status|=STATUS$2.RX_FULL,this._control&COMMAND.RX_INT_DIS||this.irq(!0)):this._status&=~STATUS$2.RX_FULL,this._lastRead}set control(t){this._control=t,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(t){this._command=t,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const t=this._status;return this._status&STATUS$2.IRQ&&this.irq(!1),this._status&=~STATUS$2.IRQ,t}set status(t){this.reset()}irq(t){t?this._status|=STATUS$2.IRQ:this._status&=~STATUS$2.IRQ,this._extFuncs.interrupt(t)}buildConfigChange(){let t={};switch(this._control&CONTROL$2.BAUD_RATE){case 0:t.baud=0;break;case 1:t.baud=50;break;case 2:t.baud=75;break;case 3:t.baud=109;break;case 4:t.baud=134;break;case 5:t.baud=150;break;case 6:t.baud=300;break;case 7:t.baud=600;break;case 8:t.baud=1200;break;case 9:t.baud=1800;break;case 10:t.baud=2400;break;case 11:t.baud=3600;break;case 12:t.baud=4800;break;case 13:t.baud=7200;break;case 14:t.baud=9600;break;case 15:t.baud=19200;break}switch(this._control&CONTROL$2.WORD_LENGTH){case 0:t.bits=8;break;case 32:t.bits=7;break;case 64:t.bits=6;break;case 96:t.bits=5;break}if(this._control&CONTROL$2.STOP_BITS?t.stop=2:t.stop=1,t.parity="none",this._command&COMMAND.PARITY_EN)switch(this._command&COMMAND.PARITY_CNF){case 0:t.parity="odd";break;case 64:t.parity="even";break;case 128:t.parity="mark";break;case 192:t.parity="space";break}return t}configChange(t){let r=!1;t.baud!=this._lastConfig.baud&&(r=!0),t.bits!=this._lastConfig.bits&&(r=!0),t.stop!=this._lastConfig.stop&&(r=!0),t.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=t,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=CONTROL$2.HW_RESET,this._command=COMMAND.HW_RESET,this._status=STATUS$2.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const rom=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let slot$2=1,acia$1;const interrupt$1=e=>{interruptRequest(slot$2,e)},configChange=e=>{console.log("ConfigChange: ",e)},receiveCommData=e=>{acia$1&&acia$1.buffer(e)},resetSerial=()=>{acia$1&&acia$1.reset()},enableSerialCard=(e=!0,t=1)=>{if(!e)return;slot$2=t;const r={sendData:passTxCommData,interrupt:interrupt$1,configChange};acia$1=new SY6551(r);const n=new Uint8Array(rom.length+256);n.set(rom.slice(1792,2048)),n.set(rom,256),setSlotDriver(slot$2,n),setSlotIOCallback(slot$2,handleSerialIO)},handleSerialIO=(e,t=-1)=>{if(e>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(e&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(t>=0)acia$1.data=t;else return acia$1.data;break;case r.STATUS:if(t>=0)acia$1.status=t;else return acia$1.status;break;case r.COMMAND:if(t>=0)acia$1.command=t;else return acia$1.command;break;case r.CONTROL:if(t>=0)acia$1.control=t;else return acia$1.control;break;default:console.log("SSC unknown softswitch",(e&15).toString(16));break}return-1},zeroPad=(e,t)=>String(e).padStart(t,"0"),prodos8driver=()=>{const e=new Uint8Array(256).fill(96);return e[0]=8,e[2]=40,e[4]=88,e[6]=112,e};prodos8driver();const handleClockRead=()=>{const e=new Date,t=zeroPad(e.getMonth()+1,2)+","+zeroPad(e.getDay(),2)+","+zeroPad(e.getDate(),2)+","+zeroPad(e.getHours(),2)+","+zeroPad(e.getMinutes(),2);for(let r=0;r<t.length;r++)memSet(512+r,t.charCodeAt(r)|128)},mouseDriver=`
Cx00	php	        ; BASIC entry (handled in JS)  This will only work for mouse
Cx01	sei         ; Clock bytes required as above.
Cx02	plp
Cx03	rts
Cx04	db $58      ; Clock
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
`,resetMouse=()=>{mousex=0,mousey=0,clampxmin=0,clampymin=0,clampxmax=1023,clampymax=1023,setMode(0),bstatus=0,istatus=0,lastbstatus=0,lastmousex=0,lastmousey=0,tmpmousex=0,tmpmousey=0,servestatus=0,clampidx=0};let mousex=0,mousey=0,clampxmin=0,clampymin=0,clampxmax=1023,clampymax=1023,clampidx=0,mode=0,bstatus=0,istatus=0,lastbstatus=0,lastmousex=0,lastmousey=0,tmpmousex=0,tmpmousey=0,servestatus=0,command=0,slot$1=5;const CSWL=54,CSWH=55,KSWL=56,KSWH=57,slotROM=()=>{const e=new Uint8Array(256).fill(0),t=parseAssembly(0,mouseDriver.split(`
`));return e.set(t,0),e[251]=214,e[255]=1,e},enableMouseCard=(e=!0,t=5)=>{if(!e)return;slot$1=t;const r=49152+slot$1*256,n=49152+slot$1*256+8;setSlotDriver(slot$1,slotROM(),r,handleBasic),setSlotDriver(slot$1,slotROM(),n,handleClockRead),setSlotIOCallback(slot$1,handleMouse),resetMouse()},setMode=e=>{mode=e,passShowMouse(!e)},onMouseVBL=()=>{if(mode&1){let e=!1;mode&8&&(servestatus|=8,e=!0),mode&istatus&4&&(servestatus|=4,e=!0),mode&istatus&2&&(servestatus|=2,e=!0),e&&interruptRequest(slot$1,!0)}},MouseCardEvent=e=>{if(mode&1)if(e.buttons>=0){switch(e.buttons){case 0:bstatus&=-129;break;case 16:bstatus|=128;break;case 1:bstatus&=-17;break;case 17:bstatus|=16;break}istatus|=bstatus&128?4:0}else e.x>=0&&e.x<=1&&(mousex=Math.round((clampxmax-clampxmin)*e.x+clampxmin),istatus|=2),e.y>=0&&e.y<=1&&(mousey=Math.round((clampymax-clampymin)*e.y+clampymin),istatus|=2)};let basicPos=0,basicString="",CSWHSave=0,CSWLSave=0;const handleBasic=()=>{const e=192+slot$1;memGet(CSWH)===e&&memGet(CSWL)===0?basicWrite():memGet(KSWH)===e&&memGet(KSWL)===0&&basicRead()},basicRead=()=>{if(basicPos===0){const e=192+slot$1;CSWHSave=memGet(CSWH),CSWLSave=memGet(CSWL),memSet(CSWH,e),memSet(CSWL,3);const t=(bstatus&128)!==(lastbstatus&128);let r=0;bstatus&128?r=t?2:1:r=t?3:4,memGet(49152)&128&&(r=-r),lastbstatus=bstatus,basicString=mousex.toString()+","+mousey.toString()+","+r.toString()}basicPos>=basicString.length?(s6502.Accum=141,basicPos=0,memSet(CSWH,CSWHSave),memSet(CSWL,CSWLSave)):(s6502.Accum=basicString.charCodeAt(basicPos)|128,basicPos++)},basicWrite=()=>{switch(s6502.Accum){case 128:console.log("mouse off"),setMode(0);break;case 129:console.log("mouse on"),setMode(1);break}},handleMouse=(e,t)=>{if(e>=49408)return-1;const r=t<0,n={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},D={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(e&15){case n.LOWX:if(r===!1)tmpmousex=tmpmousex&65280|t,tmpmousex&=65535;else return mousex&255;break;case n.HIGHX:if(r===!1)tmpmousex=t<<8|tmpmousex&255,tmpmousex&=65535;else return mousex>>8&255;break;case n.LOWY:if(r===!1)tmpmousey=tmpmousey&65280|t,tmpmousey&=65535;else return mousey&255;break;case n.HIGHY:if(r===!1)tmpmousey=t<<8|tmpmousey&255,tmpmousey&=65535;else return mousey>>8&255;break;case n.STATUS:return bstatus;case n.MODE:if(r===!1)setMode(t),console.log("Mouse mode: 0x",mode.toString(16));else return mode;break;case n.CLAMP:if(r===!1)clampidx=78-t;else switch(clampidx){case 0:return clampxmin>>8&255;case 1:return clampymin>>8&255;case 2:return clampxmin&255;case 3:return clampymin&255;case 4:return clampxmax>>8&255;case 5:return clampymax>>8&255;case 6:return clampxmax&255;case 7:return clampymax&255;default:return console.log("AppleMouse: invalid clamp index: "+clampidx),0}break;case n.CLOCK:case n.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case n.COMMAND:if(r===!1)switch(command=t,t){case D.INIT:console.log("cmd.init"),mousex=0,mousey=0,lastmousex=0,lastmousey=0,clampxmin=0,clampymin=0,clampxmax=1023,clampymax=1023,bstatus=0,istatus=0;break;case D.READ:istatus=0,bstatus&=-112,bstatus|=lastbstatus>>1&64,bstatus|=lastbstatus>>4&1,lastbstatus=bstatus,(lastmousex!==mousex||lastmousey!==mousey)&&(bstatus|=32),lastmousex=mousex,lastmousey=mousey;break;case D.CLEAR:console.log("cmd.clear"),mousex=0,mousey=0,lastmousex=0,lastmousey=0;break;case D.SERVE:bstatus&=-15,bstatus|=servestatus,servestatus=0,interruptRequest(slot$1,!1);break;case D.HOME:console.log("cmd.home"),mousex=clampxmin,mousey=clampymin;break;case D.CLAMPX:console.log("cmd.clampx"),clampxmin=tmpmousex>32767?tmpmousex-65536:tmpmousex,clampxmax=tmpmousey,console.log(clampxmin+" -> "+clampxmax);break;case D.CLAMPY:console.log("cmd.clampy"),clampymin=tmpmousex>32767?tmpmousex-65536:tmpmousex,clampymax=tmpmousey,console.log(clampymin+" -> "+clampymax);break;case D.GCLAMP:console.log("cmd.getclamp");break;case D.POS:console.log("cmd.pos"),mousex=tmpmousex,mousey=tmpmousey;break}else return command;break;default:console.log("AppleMouse unknown IO addr",e.toString(16));break}return 0},STATUS$1={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},CONTROL$1={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class MC6850{constructor(t){g(this,"_control");g(this,"_status");g(this,"_lastRead");g(this,"_receiveBuffer");g(this,"_extFuncs");this._extFuncs=t,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(t){for(let n=0;n<t.length;n++)this._receiveBuffer.push(t[n]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let n=0;n<r;n++)this._receiveBuffer.shift(),this._status|=STATUS$1.OVRN;this._status|=STATUS$1.RX_FULL,this._control&CONTROL$1.RX_INT_ENABLE&&this.irq(!0)}set data(t){const r=new Uint8Array(1).fill(t);this._extFuncs.sendData(r),(this._control&(CONTROL$1.TX_INT_ENABLE|CONTROL$1.NRTS))===CONTROL$1.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(STATUS$1.FE|STATUS$1.OVRN|STATUS$1.PE),this._receiveBuffer.length?(this._status|=STATUS$1.RX_FULL,this._control&CONTROL$1.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~STATUS$1.RX_FULL,this.irq(!1)),this._lastRead}set control(t){this._control=t,(this._control&(CONTROL$1.COUNTER_DIV1|CONTROL$1.COUNTER_DIV2))===(CONTROL$1.COUNTER_DIV1|CONTROL$1.COUNTER_DIV2)&&this.reset()}get status(){const t=this._status;return this._status&STATUS$1.IRQ&&this.irq(!1),t}irq(t){t?this._status|=STATUS$1.IRQ:this._status&=~STATUS$1.IRQ,this._extFuncs.interrupt(t)}reset(){this._control=0,this._status=STATUS$1.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const CONTROL={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},STATUS={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class PTMTimer{constructor(){g(this,"_latch");g(this,"_count");g(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(t){return!(this._control&CONTROL.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=t,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(t){this._control=t}get control(){return this._control}set latch(t){switch(this._latch=t,this._control&CONTROL.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class MC6840{constructor(t){g(this,"_timer");g(this,"_status");g(this,"_statusRead");g(this,"_msb");g(this,"_lsb");g(this,"_div8");g(this,"_interrupt");this._interrupt=t,this._status=0,this._statusRead=!1,this._timer=[new PTMTimer,new PTMTimer,new PTMTimer],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(t,r){t===0&&(t=this._timer[1].control&CONTROL.SPECIAL?0:2),this._timer[t].control=r}timerLSBw(t,r){const n=this._timer[0].control&CONTROL.SPECIAL,D=this._msb*256+r;this._timer[t].latch=D,n&&this._timer[t].reload(),this.irq(t,!1)}timerLSBr(t){return this._lsb}timerMSBw(t,r){this._msb=r}timerMSBr(t){const n=this._timer[0].control&CONTROL.SPECIAL?this._timer[t].latch:this._timer[t].count;return this._lsb=n&255,this._statusRead&&(this._statusRead=!1,this.irq(t,!1)),n>>8&255}update(t){const r=this._timer[0].control&CONTROL.SPECIAL;if(this._div8+=t,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let n=!1;for(let D=0;D<3;D++){let u=t;if(D==2&&this._timer[2].control&CONTROL.SPECIAL&&(this._div8>8?(u=1,this._div8%=8):u=0),n=this._timer[D].decrement(u),n){const C=this._timer[D].control;switch(C&CONTROL.IRQ_ENABLE&&this.irq(D,!0),C&CONTROL.COUNTER_MODE){case 0:case 16:this._timer[D].reload();break}}}}}reset(){this._timer.forEach(t=>{t.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=CONTROL.SPECIAL}irq(t,r){const n=1<<t|STATUS.ANY_IRQ;r?this._status|=n:this._status&=~n,this._status?(this._status|=STATUS.ANY_IRQ,this._interrupt(!0)):(this._status&=~STATUS.ANY_IRQ,this._interrupt(!1))}}let slot=2,timer,acia,prevCycleCount$1=0;const cycleCountCallback$1=e=>{if(prevCycleCount$1){const t=s6502.cycleCount-prevCycleCount$1;timer.update(t)}prevCycleCount$1=s6502.cycleCount},interrupt=e=>{interruptRequest(slot,e)},receiveMidiData=e=>{acia&&acia.buffer(e)},enablePassportCard=(e=!0,t=2)=>{if(!e)return;slot=t,timer=new MC6840(interrupt);const r={sendData:passTxMidiData,interrupt};acia=new MC6850(r),setSlotIOCallback(slot,handleMIDIIO),registerCycleCountCallback(cycleCountCallback$1,slot)},resetPassport=()=>{timer&&(timer.reset(),acia.reset())},handleMIDIIO=(e,t=-1)=>{if(e>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let n=-1;switch(e&15){case r.SDMIDIDATA:case r.ACIADATA:t>=0?acia.data=t:n=acia.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:t>=0?acia.control=t:n=acia.status;break;case r.TCONTROL1:t>=0?timer.timerControl(0,t):n=0;break;case r.TCONTROL2:t>=0?timer.timerControl(1,t):n=timer.status();break;case r.T1MSB:t>=0?timer.timerMSBw(0,t):n=timer.timerMSBr(0);break;case r.T1LSB:t>=0?timer.timerLSBw(0,t):n=timer.timerLSBr(0);break;case r.T2MSB:t>=0?timer.timerMSBw(1,t):n=timer.timerMSBr(1);break;case r.T2LSB:t>=0?timer.timerLSBw(1,t):n=timer.timerLSBr(1);break;case r.T3MSB:t>=0?timer.timerMSBw(2,t):n=timer.timerMSBr(2);break;case r.T3LSB:t>=0?timer.timerLSBw(2,t):n=timer.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(e&15).toString(16));break}return n},enableMockingboard=(e=!0,t=4)=>{e&&(setSlotIOCallback(t,handleMockingboard),registerCycleCountCallback(cycleCountCallback,t))},ORB=[0,128],ORA=[1,129],DDRB=[2,130],DDRA=[3,131],T1CL=[4,132],T1CH=[5,133],T1LL=[6,134],T1LH=[7,135],T2CL=[8,136],T2CH=[9,137],SHR=[10,138],ACR=[11,139],PCR=[12,140],IFR=[13,141],IER=[14,142],T2LL=[16,145],REG_LATCH=[17,145],TIMER_FIRED=[18,146],REG=[32,160],TIMER1=64,TIMER2=32,resetMockingboard=(e=4)=>{for(let t=0;t<=255;t++)memSetSlotROM(e,t,0);for(let t=0;t<=1;t++)doPassRegisters(e,t)},T1enabled=(e,t)=>(memGetSlotROM(e,IER[t])&TIMER1)!==0,T1fired=(e,t)=>(memGetSlotROM(e,TIMER_FIRED[t])&TIMER1)!==0,T1continuous=(e,t)=>(memGetSlotROM(e,ACR[t])&TIMER1)!==0,handleTimerT1=(e,t,r)=>{let n=memGetSlotROM(e,T1CL[t])-r;if(memSetSlotROM(e,T1CL[t],n),n<0){n=n%256+256,memSetSlotROM(e,T1CL[t],n);let D=memGetSlotROM(e,T1CH[t]);if(D--,memSetSlotROM(e,T1CH[t],D),D<0&&(D+=256,memSetSlotROM(e,T1CH[t],D),T1enabled(e,t)&&(!T1fired(e,t)||T1continuous(e,t)))){const u=memGetSlotROM(e,TIMER_FIRED[t]);memSetSlotROM(e,TIMER_FIRED[t],u|TIMER1);const C=memGetSlotROM(e,IFR[t]);if(memSetSlotROM(e,IFR[t],C|TIMER1),handleInterruptFlag(e,t,-1),T1continuous(e,t)){const l=memGetSlotROM(e,T1LH[t]),d=memGetSlotROM(e,T1LL[t]);memSetSlotROM(e,T1CL[t],d),memSetSlotROM(e,T1CH[t],l)}}}},T2enabled=(e,t)=>(memGetSlotROM(e,IER[t])&TIMER2)!==0,T2fired=(e,t)=>(memGetSlotROM(e,TIMER_FIRED[t])&TIMER2)!==0,handleTimerT2=(e,t,r)=>{if(memGetSlotROM(e,ACR[t])&TIMER2)return;let n=memGetSlotROM(e,T2CL[t])-r;if(memSetSlotROM(e,T2CL[t],n),n<0){n=n%256+256,memSetSlotROM(e,T2CL[t],n);let D=memGetSlotROM(e,T2CH[t]);if(D--,memSetSlotROM(e,T2CH[t],D),D<0&&(D+=256,memSetSlotROM(e,T2CH[t],D),T2enabled(e,t)&&!T2fired(e,t))){const u=memGetSlotROM(e,TIMER_FIRED[t]);memSetSlotROM(e,TIMER_FIRED[t],u|TIMER2);const C=memGetSlotROM(e,IFR[t]);memSetSlotROM(e,IFR[t],C|TIMER2),handleInterruptFlag(e,t,-1)}}},prevCycleCount=new Array(8).fill(0),cycleCountCallback=e=>{const t=s6502.cycleCount-prevCycleCount[e];for(let r=0;r<=1;r++)handleTimerT1(e,r,t),handleTimerT2(e,r,t);prevCycleCount[e]=s6502.cycleCount},getRegisters=(e,t)=>{const r=[];for(let n=0;n<=15;n++)r[n]=memGetSlotROM(e,REG[t]+n);return r},compareArrays=(e,t)=>e.length===t.length&&e.every((r,n)=>r===t[n]),prev={slot:-1,chip:-1,params:[-1]};let doPassRegisters=(e,t)=>{const r=getRegisters(e,t);e===prev.slot&&t===prev.chip&&compareArrays(r,prev.params)||(prev.slot=e,prev.chip=t,prev.params=r,passMockingboard({slot:e,chip:t,params:r}))};const handleCommand=(e,t)=>{switch(memGetSlotROM(e,ORB[t])&7){case 0:for(let n=0;n<=15;n++)memSetSlotROM(e,REG[t]+n,0);doPassRegisters(e,t);break;case 7:memSetSlotROM(e,REG_LATCH[t],memGetSlotROM(e,ORA[t]));break;case 6:{const n=memGetSlotROM(e,REG_LATCH[t]),D=memGetSlotROM(e,ORA[t]);n>=0&&n<=15&&(memSetSlotROM(e,REG[t]+n,D),doPassRegisters(e,t));break}}},handleInterruptFlag=(e,t,r)=>{let n=memGetSlotROM(e,IFR[t]);switch(r>=0&&(n&=127-(r&127),memSetSlotROM(e,IFR[t],n)),t){case 0:interruptRequest(e,n!==0);break;case 1:nonMaskableInterrupt(n!==0);break}},handleInterruptEnable=(e,t,r)=>{let n=memGetSlotROM(e,IER[t]);r>=0&&(r=r&255,r&128?n|=r:n&=255-r),n|=128,memSetSlotROM(e,IER[t],n)},handleMockingboard=(e,t=-1)=>{if(e<49408)return-1;const r=(e&3840)>>8,n=e&255,D=n&128?1:0;switch(n){case ORB[D]:t>=0&&(memSetSlotROM(r,ORB[D],t),handleCommand(r,D));break;case ORA[D]:case DDRB[D]:case DDRA[D]:case SHR[D]:case ACR[D]:case PCR[D]:memSetSlotROM(r,n,t);break;case T1CL[D]:t>=0&&memSetSlotROM(r,T1LL[D],t),handleInterruptFlag(r,D,TIMER1);break;case T1CH[D]:if(t>=0){memSetSlotROM(r,T1LH[D],t),memSetSlotROM(r,T1CL[D],memGetSlotROM(r,T1LL[D])),memSetSlotROM(r,T1CH[D],t);const u=memGetSlotROM(r,TIMER_FIRED[D]);memSetSlotROM(r,TIMER_FIRED[D],u&~TIMER1),handleInterruptFlag(r,D,TIMER1)}break;case T1LL[D]:t>=0&&(memSetSlotROM(r,n,t),handleInterruptFlag(r,D,TIMER1));break;case T1LH[D]:t>=0&&memSetSlotROM(r,n,t);break;case T2CL[D]:t>=0&&memSetSlotROM(r,T2LL[D],t),handleInterruptFlag(r,D,TIMER2);break;case T2CH[D]:if(t>=0){memSetSlotROM(r,T2CH[D],t),memSetSlotROM(r,T2CL[D],memGetSlotROM(r,T2LL[D]));const u=memGetSlotROM(r,TIMER_FIRED[D]);memSetSlotROM(r,TIMER_FIRED[D],u&~TIMER2),handleInterruptFlag(r,D,TIMER2)}break;case IFR[D]:t>=0&&handleInterruptFlag(r,D,t);break;case IER[D]:handleInterruptEnable(r,D,t);break}return-1},nlines=40,decodeBranch=(e,t)=>e+2+(t>127?t-256:t),getInstructionString=(e,t,r,n)=>{let D="",u=`${toHex(t.pcode)}`,C="",l="";switch(t.bytes){case 1:u+="      ";break;case 2:C=toHex(r),u+=` ${C}   `;break;case 3:C=toHex(r),l=toHex(n),u+=` ${C} ${l}`;break}const d=isBranchInstruction(t.name)?toHex(decodeBranch(e,r)):C;switch(t.mode){case ADDR_MODE.IMPLIED:break;case ADDR_MODE.IMM:D=` #$${C}`;break;case ADDR_MODE.ZP_REL:D=` $${d}`;break;case ADDR_MODE.ZP_X:D=` $${C},X`;break;case ADDR_MODE.ZP_Y:D=` $${C},Y`;break;case ADDR_MODE.ABS:D=` $${l}${C}`;break;case ADDR_MODE.ABS_X:D=` $${l}${C},X`;break;case ADDR_MODE.ABS_Y:D=` $${l}${C},Y`;break;case ADDR_MODE.IND_X:D=` ($${l.trim()}${C},X)`;break;case ADDR_MODE.IND_Y:D=` ($${C}),Y`;break;case ADDR_MODE.IND:D=` ($${l.trim()}${C})`;break}return`${toHex(e,4)}: ${u}  ${t.name}${D}`},getDisassembly=e=>{let t=e;t>65535-nlines&&(t=65535-nlines);let r="";for(let n=0;n<nlines;n++){if(t>65535){r+=`
`;continue}const D=memGetRaw(t),u=pcodes[D],C=memGetRaw(t+1),l=memGetRaw(t+2);r+=getInstructionString(t,u,C,l)+`
`,t+=u.bytes}return r},verifyAddressWithinDisassembly=(e,t)=>{if(t<e||e<0)return!1;let r=e;for(let n=0;n<nlines;n++){if(r===t)return!0;const D=memGetRaw(r);if(r+=pcodes[D].bytes,r>65535)break}return!1},getInstruction=e=>{const t=memGetRaw(e);return pcodes[t].name};let startTime=0,prevTime=0,speedMode=0,cpuSpeed=0,isDebugging=TEST_DEBUG,disassemblyAddr=-1,refreshTime=16.6881,timeDelta=0,cpuRunMode=RUN_MODE.IDLE,iRefresh=0,takeSnapshot=!1,iTempState=0;const saveStates=[];let inVBL=!1;const startVBL=()=>{inVBL=!0,onMouseVBL()},endVBL=()=>{inVBL=!1},getApple2State=()=>{const e=JSON.parse(JSON.stringify(s6502)),t={};for(const n in SWITCHES)t[n]=SWITCHES[n].isSet;const r=buffer.Buffer.from(memory);return{s6502:e,softSwitches:t,memory:r.toString("base64")}},setApple2State=e=>{const t=JSON.parse(JSON.stringify(e.s6502));setState6502(t);const r=e.softSwitches;for(const n in r){const D=n;try{SWITCHES[D].isSet=r[n]}catch{}}memory.set(buffer.Buffer.from(e.memory,"base64")),updateAddressTables(),handleGameSetup(!0)},getDisplaySaveState=()=>({name:"",date:"",colorMode:0,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode}),doGetSaveState=(e=!1)=>({emulator:getDisplaySaveState(),state6502:getApple2State(),driveState:getDriveSaveState(e),thumbnail:"",snapshots:null}),doGetSaveStateWithSnapshots=()=>{const e=doGetSaveState(!0);return e.snapshots=saveStates,e},doSetState6502=e=>{e.PC!==s6502.PC&&(disassemblyAddr=e.PC),setState6502(e),updateExternalMachineState()},doRestoreSaveState=(e,t=!1)=>{var r,n;doReset(),setApple2State(e.state6502),restoreDriveSaveState(e.driveState),disassemblyAddr=s6502.PC,((r=e.emulator)==null?void 0:r.speedMode)!==void 0&&(speedMode=(n=e.emulator)==null?void 0:n.speedMode),t&&(saveStates.length=0,iTempState=0),e.snapshots&&(saveStates.length=0,saveStates.push(...e.snapshots),iTempState=saveStates.length),updateExternalMachineState()};let didConfiguration=!1;const configureMachine=()=>{didConfiguration||(didConfiguration=!0,enableSerialCard(),enablePassportCard(!0,2),enableMockingboard(!0,4),enableMouseCard(!0,5),enableDiskDrive())},resetMachine=()=>{resetDrive(),setButtonState(),resetMouse(),resetPassport(),resetSerial(),resetMockingboard(4)},doBoot=()=>{if(setCycleCount(0),memoryReset(),configureMachine(),code.length>0){const e=parseAssembly(768,code.split(`
`));memory.set(e,768)}doReset()},doReset=()=>{clearInterrupts();for(const e in SWITCHES){const t=e;SWITCHES[t].isSet=!1}SWITCHES.TEXT.isSet=!0,memGet(49282),reset6502(),resetMachine()},doSetSpeedMode=e=>{speedMode=e,refreshTime=speedMode>0?0:16.6881,resetRefreshCounter()},doSetIsDebugging=e=>{isDebugging=e,updateExternalMachineState()},doSetDisassembleAddress=e=>{disassemblyAddr=e,updateExternalMachineState(),e===RUN_MODE.PAUSED&&(disassemblyAddr=s6502.PC)},getGoBackwardIndex=()=>{const e=iTempState-1;return e<0||!saveStates[e]?-1:e},getGoForwardIndex=()=>{const e=iTempState+1;return e>=saveStates.length||!saveStates[e]?-1:e},doSnapshot=()=>{saveStates.length===MAX_SNAPSHOTS&&saveStates.shift(),saveStates.push(doGetSaveState()),iTempState=saveStates.length,passRequestThumbnail(saveStates[saveStates.length-1].state6502.s6502.PC),handleGameSetup(!1)},doGoBackInTime=()=>{let e=getGoBackwardIndex();e<0||(doSetRunMode(RUN_MODE.PAUSED),setTimeout(()=>{iTempState===saveStates.length&&(doSnapshot(),e=Math.max(iTempState-2,0)),iTempState=e,doRestoreSaveState(saveStates[iTempState])},50))},doGoForwardInTime=()=>{const e=getGoForwardIndex();e<0||(doSetRunMode(RUN_MODE.PAUSED),setTimeout(()=>{iTempState=e,doRestoreSaveState(saveStates[e])},50))},doGotoTimeTravelIndex=e=>{e<0||e>=saveStates.length||(doSetRunMode(RUN_MODE.PAUSED),setTimeout(()=>{iTempState=e,doRestoreSaveState(saveStates[e])},50))},getTimeTravelThumbnails=()=>{const e=[];for(let t=0;t<saveStates.length;t++)e[t]={s6502:saveStates[t].state6502.s6502,thumbnail:saveStates[t].thumbnail};return e},doSetThumbnailImage=e=>{saveStates.length>0&&(saveStates[saveStates.length-1].thumbnail=e)};let timeout=null;const doTakeSnapshot=(e=!1)=>{timeout&&clearTimeout(timeout),e?timeout=setTimeout(()=>{takeSnapshot=!0,timeout=null},100):takeSnapshot=!0},doStepInto=()=>{doSetBreakpointSkipOnce(),cpuRunMode===RUN_MODE.IDLE&&(doBoot(),cpuRunMode=RUN_MODE.PAUSED),processInstruction(),doSetRunMode(RUN_MODE.PAUSED)},doStepOver=()=>{doSetBreakpointSkipOnce(),cpuRunMode===RUN_MODE.IDLE&&(doBoot(),cpuRunMode=RUN_MODE.PAUSED),memGet(s6502.PC,!1)===32?(processInstruction(),doStepOut()):doStepInto()},doStepOut=()=>{doSetBreakpointSkipOnce(),cpuRunMode===RUN_MODE.IDLE&&(doBoot(),cpuRunMode=RUN_MODE.PAUSED),setStepOut(),doSetRunMode(RUN_MODE.RUNNING)},resetRefreshCounter=()=>{iRefresh=0,prevTime=performance.now(),startTime=prevTime},doSetRunMode=e=>{if(configureMachine(),cpuRunMode=e,cpuRunMode===RUN_MODE.PAUSED)doPauseDrive(),verifyAddressWithinDisassembly(disassemblyAddr,s6502.PC)||(disassemblyAddr=s6502.PC);else if(cpuRunMode===RUN_MODE.RUNNING){for(doPauseDrive(!0),doSetBreakpointSkipOnce();saveStates.length>0&&iTempState<saveStates.length-1;)saveStates.pop();iTempState=saveStates.length}updateExternalMachineState(),resetRefreshCounter(),cpuSpeed===0&&(cpuSpeed=1,doAdvance6502Timer())},doAutoboot=e=>{cpuRunMode===RUN_MODE.IDLE?(doSetRunMode(RUN_MODE.NEED_BOOT),setTimeout(()=>{doSetRunMode(RUN_MODE.NEED_RESET),setTimeout(()=>{e()},200)},200)):e()},doSetBinaryBlock=(e,t,r)=>{doAutoboot(()=>{setMemoryBlock(e,t),r&&setPC(e)})},doSetPastedText=e=>{doAutoboot(()=>{sendPastedText(e)})},getDebugDump=()=>{if(!isDebugging)return"";const e=[];e.push(getZeroPage());const t=getStackString();for(let r=0;r<Math.min(20,t.length);r++)e.push(t[r]);return e.join(`
`)},getMemoryDump=()=>isDebugging&&cpuRunMode===RUN_MODE.PAUSED?getBaseMemory():new Uint8Array,doGetDisassembly=()=>cpuRunMode===RUN_MODE.RUNNING?"":getDisassembly(disassemblyAddr>=0?disassemblyAddr:s6502.PC),updateExternalMachineState=()=>{const e={runMode:cpuRunMode,s6502,cpuSpeed,memSize:0,speedMode,isDebugging,altChar:SWITCHES.ALTCHARSET.isSet,noDelayMode:!SWITCHES.COLUMN80.isSet&&!SWITCHES.AN3.isSet,colorMode:COLOR_MODE.COLOR,capsLock:!0,textPage:getTextPage(),lores:getTextPage(!0),hires:getHires(),debugDump:getDebugDump(),memoryDump:getMemoryDump(),addressGetTable,disassembly:doGetDisassembly(),nextInstruction:getInstruction(s6502.PC),button0:SWITCHES.PB0.isSet,button1:SWITCHES.PB1.isSet,canGoBackward:getGoBackwardIndex()>=0,canGoForward:getGoForwardIndex()>=0,iTempState,timeTravelThumbnails:getTimeTravelThumbnails()};passMachineState(e)},forceSoftSwitches=e=>{if(e)for(let t=0;t<e.length;t++)overrideSoftSwitch(e[t]);else restoreSoftSwitches();updateExternalMachineState()},doAdvance6502=()=>{const e=performance.now();if(timeDelta=e-prevTime,timeDelta<refreshTime||(prevTime=e,cpuRunMode===RUN_MODE.IDLE||cpuRunMode===RUN_MODE.PAUSED))return;cpuRunMode===RUN_MODE.NEED_BOOT?(doBoot(),doSetRunMode(RUN_MODE.RUNNING)):cpuRunMode===RUN_MODE.NEED_RESET&&(doReset(),doSetRunMode(RUN_MODE.RUNNING));let t=0;for(;;){const r=processInstruction();if(r<0)break;if(t+=r,t>=12480&&inVBL===!1&&startVBL(),t>=17030){endVBL();break}}iRefresh++,cpuSpeed=Math.round(iRefresh*1703/(performance.now()-startTime))/100,iRefresh%2&&(handleGamepads(),updateExternalMachineState()),takeSnapshot&&(takeSnapshot=!1,doSnapshot())},doAdvance6502Timer=()=>{doAdvance6502();const e=iRefresh+1;for(;cpuRunMode===RUN_MODE.RUNNING&&iRefresh!==e;)doAdvance6502();setTimeout(doAdvance6502Timer,cpuRunMode===RUN_MODE.RUNNING?0:20)},doPostMessage=(e,t)=>{self.postMessage({msg:e,payload:t})},passMachineState=e=>{doPostMessage(MSG_WORKER.MACHINE_STATE,e)},passClickSpeaker=e=>{doPostMessage(MSG_WORKER.CLICK,e)},passDriveProps=e=>{doPostMessage(MSG_WORKER.DRIVE_PROPS,e)},passDriveSound=e=>{doPostMessage(MSG_WORKER.DRIVE_SOUND,e)},passSaveState=e=>{doPostMessage(MSG_WORKER.SAVE_STATE,e)},passRumble=e=>{doPostMessage(MSG_WORKER.RUMBLE,e)},passHelptext=e=>{doPostMessage(MSG_WORKER.HELP_TEXT,e)},passShowMouse=e=>{doPostMessage(MSG_WORKER.SHOW_MOUSE,e)},passMockingboard=e=>{doPostMessage(MSG_WORKER.MBOARD_SOUND,e)},passTxCommData=e=>{doPostMessage(MSG_WORKER.COMM_DATA,e)},passTxMidiData=e=>{doPostMessage(MSG_WORKER.MIDI_DATA,e)},passRequestThumbnail=e=>{doPostMessage(MSG_WORKER.REQUEST_THUMBNAIL,e)};typeof self<"u"&&(self.onmessage=e=>{switch(e.data.msg){case MSG_MAIN.RUN_MODE:doSetRunMode(e.data.payload);break;case MSG_MAIN.STATE6502:doSetState6502(e.data.payload);break;case MSG_MAIN.DEBUG:doSetIsDebugging(e.data.payload);break;case MSG_MAIN.DISASSEMBLE_ADDR:doSetDisassembleAddress(e.data.payload);break;case MSG_MAIN.BREAKPOINTS:doSetBreakpoints(e.data.payload);break;case MSG_MAIN.STEP_INTO:doStepInto();break;case MSG_MAIN.STEP_OVER:doStepOver();break;case MSG_MAIN.STEP_OUT:doStepOut();break;case MSG_MAIN.SPEED:doSetSpeedMode(e.data.payload);break;case MSG_MAIN.TIME_TRAVEL_STEP:e.data.payload==="FORWARD"?doGoForwardInTime():doGoBackInTime();break;case MSG_MAIN.TIME_TRAVEL_INDEX:doGotoTimeTravelIndex(e.data.payload);break;case MSG_MAIN.TIME_TRAVEL_SNAPSHOT:doTakeSnapshot();break;case MSG_MAIN.THUMBNAIL_IMAGE:doSetThumbnailImage(e.data.payload);break;case MSG_MAIN.RESTORE_STATE:doRestoreSaveState(e.data.payload,!0);break;case MSG_MAIN.KEYPRESS:sendTextToEmulator(e.data.payload);break;case MSG_MAIN.MOUSEEVENT:MouseCardEvent(e.data.payload);break;case MSG_MAIN.PASTE_TEXT:doSetPastedText(e.data.payload),sendPastedText(e.data.payload);break;case MSG_MAIN.APPLE_PRESS:pressAppleCommandKey(!0,e.data.payload);break;case MSG_MAIN.APPLE_RELEASE:pressAppleCommandKey(!1,e.data.payload);break;case MSG_MAIN.GET_SAVE_STATE:passSaveState(doGetSaveState(!0));break;case MSG_MAIN.GET_SAVE_STATE_SNAPSHOTS:passSaveState(doGetSaveStateWithSnapshots());break;case MSG_MAIN.DRIVE_PROPS:{const t=e.data.payload;doSetDriveProps(t);break}case MSG_MAIN.GAMEPAD:setGamepads(e.data.payload);break;case MSG_MAIN.SET_BINARY_BLOCK:{const t=e.data.payload;doSetBinaryBlock(t.address,t.data,t.run);break}case MSG_MAIN.COMM_DATA:receiveCommData(e.data.payload);break;case MSG_MAIN.MIDI_DATA:receiveMidiData(e.data.payload);break;case MSG_MAIN.RAMWORKS:doSetRAMWorks(e.data.payload);break;case MSG_MAIN.SOFTSWITCHES:forceSoftSwitches(e.data.payload);break;default:console.error(`worker2main: unhandled msg: ${e.data.msg}`);break}})})();
