var a0=Object.defineProperty;var c0=(st,ct,et)=>ct in st?a0(st,ct,{enumerable:!0,configurable:!0,writable:!0,value:et}):st[ct]=et;var pe=(st,ct,et)=>(c0(st,typeof ct!="symbol"?ct+"":ct,et),et);(function(){"use strict";var st={},ct={};ct.byteLength=Ho,ct.toByteArray=_o,ct.fromByteArray=ti;for(var et=[],lt=[],Vo=typeof Uint8Array<"u"?Uint8Array:Array,JA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Ce=0,jo=JA.length;Ce<jo;++Ce)et[Ce]=JA[Ce],lt[JA.charCodeAt(Ce)]=Ce;lt["-".charCodeAt(0)]=62,lt["_".charCodeAt(0)]=63;function Gr(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");r===-1&&(r=e);var i=r===e?0:4-r%4;return[r,i]}function Ho(t){var e=Gr(t),r=e[0],i=e[1];return(r+i)*3/4-i}function vo(t,e,r){return(e+r)*3/4-r}function _o(t){var e,r=Gr(t),i=r[0],a=r[1],h=new Vo(vo(t,i,a)),p=0,l=a>0?i-4:i,B;for(B=0;B<l;B+=4)e=lt[t.charCodeAt(B)]<<18|lt[t.charCodeAt(B+1)]<<12|lt[t.charCodeAt(B+2)]<<6|lt[t.charCodeAt(B+3)],h[p++]=e>>16&255,h[p++]=e>>8&255,h[p++]=e&255;return a===2&&(e=lt[t.charCodeAt(B)]<<2|lt[t.charCodeAt(B+1)]>>4,h[p++]=e&255),a===1&&(e=lt[t.charCodeAt(B)]<<10|lt[t.charCodeAt(B+1)]<<4|lt[t.charCodeAt(B+2)]>>2,h[p++]=e>>8&255,h[p++]=e&255),h}function zo(t){return et[t>>18&63]+et[t>>12&63]+et[t>>6&63]+et[t&63]}function $o(t,e,r){for(var i,a=[],h=e;h<r;h+=3)i=(t[h]<<16&16711680)+(t[h+1]<<8&65280)+(t[h+2]&255),a.push(zo(i));return a.join("")}function ti(t){for(var e,r=t.length,i=r%3,a=[],h=16383,p=0,l=r-i;p<l;p+=h)a.push($o(t,p,p+h>l?l:p+h));return i===1?(e=t[r-1],a.push(et[e>>2]+et[e<<4&63]+"==")):i===2&&(e=(t[r-2]<<8)+t[r-1],a.push(et[e>>10]+et[e>>4&63]+et[e<<2&63]+"=")),a.join("")}var XA={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */XA.read=function(t,e,r,i,a){var h,p,l=a*8-i-1,B=(1<<l)-1,O=B>>1,d=-7,y=r?a-1:0,H=r?-1:1,X=t[e+y];for(y+=H,h=X&(1<<-d)-1,X>>=-d,d+=l;d>0;h=h*256+t[e+y],y+=H,d-=8);for(p=h&(1<<-d)-1,h>>=-d,d+=i;d>0;p=p*256+t[e+y],y+=H,d-=8);if(h===0)h=1-O;else{if(h===B)return p?NaN:(X?-1:1)*(1/0);p=p+Math.pow(2,i),h=h-O}return(X?-1:1)*p*Math.pow(2,h-i)},XA.write=function(t,e,r,i,a,h){var p,l,B,O=h*8-a-1,d=(1<<O)-1,y=d>>1,H=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,X=i?0:h-1,Rt=i?1:-1,at=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(l=isNaN(e)?1:0,p=d):(p=Math.floor(Math.log(e)/Math.LN2),e*(B=Math.pow(2,-p))<1&&(p--,B*=2),p+y>=1?e+=H/B:e+=H*Math.pow(2,1-y),e*B>=2&&(p++,B/=2),p+y>=d?(l=0,p=d):p+y>=1?(l=(e*B-1)*Math.pow(2,a),p=p+y):(l=e*Math.pow(2,y-1)*Math.pow(2,a),p=0));a>=8;t[r+X]=l&255,X+=Rt,l/=256,a-=8);for(p=p<<a|l,O+=a;O>0;t[r+X]=p&255,X+=Rt,p/=256,O-=8);t[r+X-Rt]|=at*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=ct,r=XA,i=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=l,t.SlowBuffer=xA,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,l.TYPED_ARRAY_SUPPORT=h(),!l.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const o=new Uint8Array(1),A={foo:function(){return 42}};return Object.setPrototypeOf(A,Uint8Array.prototype),Object.setPrototypeOf(o,A),o.foo()===42}catch{return!1}}Object.defineProperty(l.prototype,"parent",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.buffer}}),Object.defineProperty(l.prototype,"offset",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.byteOffset}});function p(o){if(o>a)throw new RangeError('The value "'+o+'" is invalid for option "size"');const A=new Uint8Array(o);return Object.setPrototypeOf(A,l.prototype),A}function l(o,A,n){if(typeof o=="number"){if(typeof A=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return y(o)}return B(o,A,n)}l.poolSize=8192;function B(o,A,n){if(typeof o=="string")return H(o,A);if(ArrayBuffer.isView(o))return Rt(o);if(o==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof o);if(Qt(o,ArrayBuffer)||o&&Qt(o.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Qt(o,SharedArrayBuffer)||o&&Qt(o.buffer,SharedArrayBuffer)))return at(o,A,n);if(typeof o=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const c=o.valueOf&&o.valueOf();if(c!=null&&c!==o)return l.from(c,A,n);const g=Uo(o);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof o[Symbol.toPrimitive]=="function")return l.from(o[Symbol.toPrimitive]("string"),A,n);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof o)}l.from=function(o,A,n){return B(o,A,n)},Object.setPrototypeOf(l.prototype,Uint8Array.prototype),Object.setPrototypeOf(l,Uint8Array);function O(o){if(typeof o!="number")throw new TypeError('"size" argument must be of type number');if(o<0)throw new RangeError('The value "'+o+'" is invalid for option "size"')}function d(o,A,n){return O(o),o<=0?p(o):A!==void 0?typeof n=="string"?p(o).fill(A,n):p(o).fill(A):p(o)}l.alloc=function(o,A,n){return d(o,A,n)};function y(o){return O(o),p(o<0?0:WA(o)|0)}l.allocUnsafe=function(o){return y(o)},l.allocUnsafeSlow=function(o){return y(o)};function H(o,A){if((typeof A!="string"||A==="")&&(A="utf8"),!l.isEncoding(A))throw new TypeError("Unknown encoding: "+A);const n=Ko(o,A)|0;let c=p(n);const g=c.write(o,A);return g!==n&&(c=c.slice(0,g)),c}function X(o){const A=o.length<0?0:WA(o.length)|0,n=p(A);for(let c=0;c<A;c+=1)n[c]=o[c]&255;return n}function Rt(o){if(Qt(o,Uint8Array)){const A=new Uint8Array(o);return at(A.buffer,A.byteOffset,A.byteLength)}return X(o)}function at(o,A,n){if(A<0||o.byteLength<A)throw new RangeError('"offset" is outside of buffer bounds');if(o.byteLength<A+(n||0))throw new RangeError('"length" is outside of buffer bounds');let c;return A===void 0&&n===void 0?c=new Uint8Array(o):n===void 0?c=new Uint8Array(o,A):c=new Uint8Array(o,A,n),Object.setPrototypeOf(c,l.prototype),c}function Uo(o){if(l.isBuffer(o)){const A=WA(o.length)|0,n=p(A);return n.length===0||o.copy(n,0,0,A),n}if(o.length!==void 0)return typeof o.length!="number"||Nr(o.length)?p(0):X(o);if(o.type==="Buffer"&&Array.isArray(o.data))return X(o.data)}function WA(o){if(o>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return o|0}function xA(o){return+o!=o&&(o=0),l.alloc(+o)}l.isBuffer=function(A){return A!=null&&A._isBuffer===!0&&A!==l.prototype},l.compare=function(A,n){if(Qt(A,Uint8Array)&&(A=l.from(A,A.offset,A.byteLength)),Qt(n,Uint8Array)&&(n=l.from(n,n.offset,n.byteLength)),!l.isBuffer(A)||!l.isBuffer(n))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(A===n)return 0;let c=A.length,g=n.length;for(let C=0,f=Math.min(c,g);C<f;++C)if(A[C]!==n[C]){c=A[C],g=n[C];break}return c<g?-1:g<c?1:0},l.isEncoding=function(A){switch(String(A).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},l.concat=function(A,n){if(!Array.isArray(A))throw new TypeError('"list" argument must be an Array of Buffers');if(A.length===0)return l.alloc(0);let c;if(n===void 0)for(n=0,c=0;c<A.length;++c)n+=A[c].length;const g=l.allocUnsafe(n);let C=0;for(c=0;c<A.length;++c){let f=A[c];if(Qt(f,Uint8Array))C+f.length>g.length?(l.isBuffer(f)||(f=l.from(f)),f.copy(g,C)):Uint8Array.prototype.set.call(g,f,C);else if(l.isBuffer(f))f.copy(g,C);else throw new TypeError('"list" argument must be an Array of Buffers');C+=f.length}return g};function Ko(o,A){if(l.isBuffer(o))return o.length;if(ArrayBuffer.isView(o)||Qt(o,ArrayBuffer))return o.byteLength;if(typeof o!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof o);const n=o.length,c=arguments.length>2&&arguments[2]===!0;if(!c&&n===0)return 0;let g=!1;for(;;)switch(A){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":return Or(o).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return n*2;case"hex":return n>>>1;case"base64":return Xo(o).length;default:if(g)return c?-1:Or(o).length;A=(""+A).toLowerCase(),g=!0}}l.byteLength=Ko;function xa(o,A,n){let c=!1;if((A===void 0||A<0)&&(A=0),A>this.length||((n===void 0||n>this.length)&&(n=this.length),n<=0)||(n>>>=0,A>>>=0,n<=A))return"";for(o||(o="utf8");;)switch(o){case"hex":return $a(this,A,n);case"utf8":case"utf-8":return bo(this,A,n);case"ascii":return _a(this,A,n);case"latin1":case"binary":return za(this,A,n);case"base64":return Ha(this,A,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return t0(this,A,n);default:if(c)throw new TypeError("Unknown encoding: "+o);o=(o+"").toLowerCase(),c=!0}}l.prototype._isBuffer=!0;function he(o,A,n){const c=o[A];o[A]=o[n],o[n]=c}l.prototype.swap16=function(){const A=this.length;if(A%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let n=0;n<A;n+=2)he(this,n,n+1);return this},l.prototype.swap32=function(){const A=this.length;if(A%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let n=0;n<A;n+=4)he(this,n,n+3),he(this,n+1,n+2);return this},l.prototype.swap64=function(){const A=this.length;if(A%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let n=0;n<A;n+=8)he(this,n,n+7),he(this,n+1,n+6),he(this,n+2,n+5),he(this,n+3,n+4);return this},l.prototype.toString=function(){const A=this.length;return A===0?"":arguments.length===0?bo(this,0,A):xa.apply(this,arguments)},l.prototype.toLocaleString=l.prototype.toString,l.prototype.equals=function(A){if(!l.isBuffer(A))throw new TypeError("Argument must be a Buffer");return this===A?!0:l.compare(this,A)===0},l.prototype.inspect=function(){let A="";const n=t.INSPECT_MAX_BYTES;return A=this.toString("hex",0,n).replace(/(.{2})/g,"$1 ").trim(),this.length>n&&(A+=" ... "),"<Buffer "+A+">"},i&&(l.prototype[i]=l.prototype.inspect),l.prototype.compare=function(A,n,c,g,C){if(Qt(A,Uint8Array)&&(A=l.from(A,A.offset,A.byteLength)),!l.isBuffer(A))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof A);if(n===void 0&&(n=0),c===void 0&&(c=A?A.length:0),g===void 0&&(g=0),C===void 0&&(C=this.length),n<0||c>A.length||g<0||C>this.length)throw new RangeError("out of range index");if(g>=C&&n>=c)return 0;if(g>=C)return-1;if(n>=c)return 1;if(n>>>=0,c>>>=0,g>>>=0,C>>>=0,this===A)return 0;let f=C-g,T=c-n;const Z=Math.min(f,T),N=this.slice(g,C),J=A.slice(n,c);for(let b=0;b<Z;++b)if(N[b]!==J[b]){f=N[b],T=J[b];break}return f<T?-1:T<f?1:0};function Lo(o,A,n,c,g){if(o.length===0)return-1;if(typeof n=="string"?(c=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,Nr(n)&&(n=g?0:o.length-1),n<0&&(n=o.length+n),n>=o.length){if(g)return-1;n=o.length-1}else if(n<0)if(g)n=0;else return-1;if(typeof A=="string"&&(A=l.from(A,c)),l.isBuffer(A))return A.length===0?-1:qo(o,A,n,c,g);if(typeof A=="number")return A=A&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(o,A,n):Uint8Array.prototype.lastIndexOf.call(o,A,n):qo(o,[A],n,c,g);throw new TypeError("val must be string, number or Buffer")}function qo(o,A,n,c,g){let C=1,f=o.length,T=A.length;if(c!==void 0&&(c=String(c).toLowerCase(),c==="ucs2"||c==="ucs-2"||c==="utf16le"||c==="utf-16le")){if(o.length<2||A.length<2)return-1;C=2,f/=2,T/=2,n/=2}function Z(J,b){return C===1?J[b]:J.readUInt16BE(b*C)}let N;if(g){let J=-1;for(N=n;N<f;N++)if(Z(o,N)===Z(A,J===-1?0:N-J)){if(J===-1&&(J=N),N-J+1===T)return J*C}else J!==-1&&(N-=N-J),J=-1}else for(n+T>f&&(n=f-T),N=n;N>=0;N--){let J=!0;for(let b=0;b<T;b++)if(Z(o,N+b)!==Z(A,b)){J=!1;break}if(J)return N}return-1}l.prototype.includes=function(A,n,c){return this.indexOf(A,n,c)!==-1},l.prototype.indexOf=function(A,n,c){return Lo(this,A,n,c,!0)},l.prototype.lastIndexOf=function(A,n,c){return Lo(this,A,n,c,!1)};function Za(o,A,n,c){n=Number(n)||0;const g=o.length-n;c?(c=Number(c),c>g&&(c=g)):c=g;const C=A.length;c>C/2&&(c=C/2);let f;for(f=0;f<c;++f){const T=parseInt(A.substr(f*2,2),16);if(Nr(T))return f;o[n+f]=T}return f}function Ja(o,A,n,c){return ZA(Or(A,o.length-n),o,n,c)}function Xa(o,A,n,c){return ZA(n0(A),o,n,c)}function Va(o,A,n,c){return ZA(Xo(A),o,n,c)}function ja(o,A,n,c){return ZA(o0(A,o.length-n),o,n,c)}l.prototype.write=function(A,n,c,g){if(n===void 0)g="utf8",c=this.length,n=0;else if(c===void 0&&typeof n=="string")g=n,c=this.length,n=0;else if(isFinite(n))n=n>>>0,isFinite(c)?(c=c>>>0,g===void 0&&(g="utf8")):(g=c,c=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const C=this.length-n;if((c===void 0||c>C)&&(c=C),A.length>0&&(c<0||n<0)||n>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let f=!1;for(;;)switch(g){case"hex":return Za(this,A,n,c);case"utf8":case"utf-8":return Ja(this,A,n,c);case"ascii":case"latin1":case"binary":return Xa(this,A,n,c);case"base64":return Va(this,A,n,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ja(this,A,n,c);default:if(f)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),f=!0}},l.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Ha(o,A,n){return A===0&&n===o.length?e.fromByteArray(o):e.fromByteArray(o.slice(A,n))}function bo(o,A,n){n=Math.min(o.length,n);const c=[];let g=A;for(;g<n;){const C=o[g];let f=null,T=C>239?4:C>223?3:C>191?2:1;if(g+T<=n){let Z,N,J,b;switch(T){case 1:C<128&&(f=C);break;case 2:Z=o[g+1],(Z&192)===128&&(b=(C&31)<<6|Z&63,b>127&&(f=b));break;case 3:Z=o[g+1],N=o[g+2],(Z&192)===128&&(N&192)===128&&(b=(C&15)<<12|(Z&63)<<6|N&63,b>2047&&(b<55296||b>57343)&&(f=b));break;case 4:Z=o[g+1],N=o[g+2],J=o[g+3],(Z&192)===128&&(N&192)===128&&(J&192)===128&&(b=(C&15)<<18|(Z&63)<<12|(N&63)<<6|J&63,b>65535&&b<1114112&&(f=b))}}f===null?(f=65533,T=1):f>65535&&(f-=65536,c.push(f>>>10&1023|55296),f=56320|f&1023),c.push(f),g+=T}return va(c)}const Yo=4096;function va(o){const A=o.length;if(A<=Yo)return String.fromCharCode.apply(String,o);let n="",c=0;for(;c<A;)n+=String.fromCharCode.apply(String,o.slice(c,c+=Yo));return n}function _a(o,A,n){let c="";n=Math.min(o.length,n);for(let g=A;g<n;++g)c+=String.fromCharCode(o[g]&127);return c}function za(o,A,n){let c="";n=Math.min(o.length,n);for(let g=A;g<n;++g)c+=String.fromCharCode(o[g]);return c}function $a(o,A,n){const c=o.length;(!A||A<0)&&(A=0),(!n||n<0||n>c)&&(n=c);let g="";for(let C=A;C<n;++C)g+=i0[o[C]];return g}function t0(o,A,n){const c=o.slice(A,n);let g="";for(let C=0;C<c.length-1;C+=2)g+=String.fromCharCode(c[C]+c[C+1]*256);return g}l.prototype.slice=function(A,n){const c=this.length;A=~~A,n=n===void 0?c:~~n,A<0?(A+=c,A<0&&(A=0)):A>c&&(A=c),n<0?(n+=c,n<0&&(n=0)):n>c&&(n=c),n<A&&(n=A);const g=this.subarray(A,n);return Object.setPrototypeOf(g,l.prototype),g};function tt(o,A,n){if(o%1!==0||o<0)throw new RangeError("offset is not uint");if(o+A>n)throw new RangeError("Trying to access beyond buffer length")}l.prototype.readUintLE=l.prototype.readUIntLE=function(A,n,c){A=A>>>0,n=n>>>0,c||tt(A,n,this.length);let g=this[A],C=1,f=0;for(;++f<n&&(C*=256);)g+=this[A+f]*C;return g},l.prototype.readUintBE=l.prototype.readUIntBE=function(A,n,c){A=A>>>0,n=n>>>0,c||tt(A,n,this.length);let g=this[A+--n],C=1;for(;n>0&&(C*=256);)g+=this[A+--n]*C;return g},l.prototype.readUint8=l.prototype.readUInt8=function(A,n){return A=A>>>0,n||tt(A,1,this.length),this[A]},l.prototype.readUint16LE=l.prototype.readUInt16LE=function(A,n){return A=A>>>0,n||tt(A,2,this.length),this[A]|this[A+1]<<8},l.prototype.readUint16BE=l.prototype.readUInt16BE=function(A,n){return A=A>>>0,n||tt(A,2,this.length),this[A]<<8|this[A+1]},l.prototype.readUint32LE=l.prototype.readUInt32LE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),(this[A]|this[A+1]<<8|this[A+2]<<16)+this[A+3]*16777216},l.prototype.readUint32BE=l.prototype.readUInt32BE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),this[A]*16777216+(this[A+1]<<16|this[A+2]<<8|this[A+3])},l.prototype.readBigUInt64LE=zt(function(A){A=A>>>0,Me(A,"offset");const n=this[A],c=this[A+7];(n===void 0||c===void 0)&&ze(A,this.length-8);const g=n+this[++A]*2**8+this[++A]*2**16+this[++A]*2**24,C=this[++A]+this[++A]*2**8+this[++A]*2**16+c*2**24;return BigInt(g)+(BigInt(C)<<BigInt(32))}),l.prototype.readBigUInt64BE=zt(function(A){A=A>>>0,Me(A,"offset");const n=this[A],c=this[A+7];(n===void 0||c===void 0)&&ze(A,this.length-8);const g=n*2**24+this[++A]*2**16+this[++A]*2**8+this[++A],C=this[++A]*2**24+this[++A]*2**16+this[++A]*2**8+c;return(BigInt(g)<<BigInt(32))+BigInt(C)}),l.prototype.readIntLE=function(A,n,c){A=A>>>0,n=n>>>0,c||tt(A,n,this.length);let g=this[A],C=1,f=0;for(;++f<n&&(C*=256);)g+=this[A+f]*C;return C*=128,g>=C&&(g-=Math.pow(2,8*n)),g},l.prototype.readIntBE=function(A,n,c){A=A>>>0,n=n>>>0,c||tt(A,n,this.length);let g=n,C=1,f=this[A+--g];for(;g>0&&(C*=256);)f+=this[A+--g]*C;return C*=128,f>=C&&(f-=Math.pow(2,8*n)),f},l.prototype.readInt8=function(A,n){return A=A>>>0,n||tt(A,1,this.length),this[A]&128?(255-this[A]+1)*-1:this[A]},l.prototype.readInt16LE=function(A,n){A=A>>>0,n||tt(A,2,this.length);const c=this[A]|this[A+1]<<8;return c&32768?c|4294901760:c},l.prototype.readInt16BE=function(A,n){A=A>>>0,n||tt(A,2,this.length);const c=this[A+1]|this[A]<<8;return c&32768?c|4294901760:c},l.prototype.readInt32LE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),this[A]|this[A+1]<<8|this[A+2]<<16|this[A+3]<<24},l.prototype.readInt32BE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),this[A]<<24|this[A+1]<<16|this[A+2]<<8|this[A+3]},l.prototype.readBigInt64LE=zt(function(A){A=A>>>0,Me(A,"offset");const n=this[A],c=this[A+7];(n===void 0||c===void 0)&&ze(A,this.length-8);const g=this[A+4]+this[A+5]*2**8+this[A+6]*2**16+(c<<24);return(BigInt(g)<<BigInt(32))+BigInt(n+this[++A]*2**8+this[++A]*2**16+this[++A]*2**24)}),l.prototype.readBigInt64BE=zt(function(A){A=A>>>0,Me(A,"offset");const n=this[A],c=this[A+7];(n===void 0||c===void 0)&&ze(A,this.length-8);const g=(n<<24)+this[++A]*2**16+this[++A]*2**8+this[++A];return(BigInt(g)<<BigInt(32))+BigInt(this[++A]*2**24+this[++A]*2**16+this[++A]*2**8+c)}),l.prototype.readFloatLE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),r.read(this,A,!0,23,4)},l.prototype.readFloatBE=function(A,n){return A=A>>>0,n||tt(A,4,this.length),r.read(this,A,!1,23,4)},l.prototype.readDoubleLE=function(A,n){return A=A>>>0,n||tt(A,8,this.length),r.read(this,A,!0,52,8)},l.prototype.readDoubleBE=function(A,n){return A=A>>>0,n||tt(A,8,this.length),r.read(this,A,!1,52,8)};function it(o,A,n,c,g,C){if(!l.isBuffer(o))throw new TypeError('"buffer" argument must be a Buffer instance');if(A>g||A<C)throw new RangeError('"value" argument is out of bounds');if(n+c>o.length)throw new RangeError("Index out of range")}l.prototype.writeUintLE=l.prototype.writeUIntLE=function(A,n,c,g){if(A=+A,n=n>>>0,c=c>>>0,!g){const T=Math.pow(2,8*c)-1;it(this,A,n,c,T,0)}let C=1,f=0;for(this[n]=A&255;++f<c&&(C*=256);)this[n+f]=A/C&255;return n+c},l.prototype.writeUintBE=l.prototype.writeUIntBE=function(A,n,c,g){if(A=+A,n=n>>>0,c=c>>>0,!g){const T=Math.pow(2,8*c)-1;it(this,A,n,c,T,0)}let C=c-1,f=1;for(this[n+C]=A&255;--C>=0&&(f*=256);)this[n+C]=A/f&255;return n+c},l.prototype.writeUint8=l.prototype.writeUInt8=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,1,255,0),this[n]=A&255,n+1},l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,2,65535,0),this[n]=A&255,this[n+1]=A>>>8,n+2},l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,2,65535,0),this[n]=A>>>8,this[n+1]=A&255,n+2},l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,4,4294967295,0),this[n+3]=A>>>24,this[n+2]=A>>>16,this[n+1]=A>>>8,this[n]=A&255,n+4},l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,4,4294967295,0),this[n]=A>>>24,this[n+1]=A>>>16,this[n+2]=A>>>8,this[n+3]=A&255,n+4};function Oo(o,A,n,c,g){Jo(A,c,g,o,n,7);let C=Number(A&BigInt(4294967295));o[n++]=C,C=C>>8,o[n++]=C,C=C>>8,o[n++]=C,C=C>>8,o[n++]=C;let f=Number(A>>BigInt(32)&BigInt(4294967295));return o[n++]=f,f=f>>8,o[n++]=f,f=f>>8,o[n++]=f,f=f>>8,o[n++]=f,n}function No(o,A,n,c,g){Jo(A,c,g,o,n,7);let C=Number(A&BigInt(4294967295));o[n+7]=C,C=C>>8,o[n+6]=C,C=C>>8,o[n+5]=C,C=C>>8,o[n+4]=C;let f=Number(A>>BigInt(32)&BigInt(4294967295));return o[n+3]=f,f=f>>8,o[n+2]=f,f=f>>8,o[n+1]=f,f=f>>8,o[n]=f,n+8}l.prototype.writeBigUInt64LE=zt(function(A,n=0){return Oo(this,A,n,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeBigUInt64BE=zt(function(A,n=0){return No(this,A,n,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeIntLE=function(A,n,c,g){if(A=+A,n=n>>>0,!g){const Z=Math.pow(2,8*c-1);it(this,A,n,c,Z-1,-Z)}let C=0,f=1,T=0;for(this[n]=A&255;++C<c&&(f*=256);)A<0&&T===0&&this[n+C-1]!==0&&(T=1),this[n+C]=(A/f>>0)-T&255;return n+c},l.prototype.writeIntBE=function(A,n,c,g){if(A=+A,n=n>>>0,!g){const Z=Math.pow(2,8*c-1);it(this,A,n,c,Z-1,-Z)}let C=c-1,f=1,T=0;for(this[n+C]=A&255;--C>=0&&(f*=256);)A<0&&T===0&&this[n+C+1]!==0&&(T=1),this[n+C]=(A/f>>0)-T&255;return n+c},l.prototype.writeInt8=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,1,127,-128),A<0&&(A=255+A+1),this[n]=A&255,n+1},l.prototype.writeInt16LE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,2,32767,-32768),this[n]=A&255,this[n+1]=A>>>8,n+2},l.prototype.writeInt16BE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,2,32767,-32768),this[n]=A>>>8,this[n+1]=A&255,n+2},l.prototype.writeInt32LE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,4,2147483647,-2147483648),this[n]=A&255,this[n+1]=A>>>8,this[n+2]=A>>>16,this[n+3]=A>>>24,n+4},l.prototype.writeInt32BE=function(A,n,c){return A=+A,n=n>>>0,c||it(this,A,n,4,2147483647,-2147483648),A<0&&(A=4294967295+A+1),this[n]=A>>>24,this[n+1]=A>>>16,this[n+2]=A>>>8,this[n+3]=A&255,n+4},l.prototype.writeBigInt64LE=zt(function(A,n=0){return Oo(this,A,n,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),l.prototype.writeBigInt64BE=zt(function(A,n=0){return No(this,A,n,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Go(o,A,n,c,g,C){if(n+c>o.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("Index out of range")}function Wo(o,A,n,c,g){return A=+A,n=n>>>0,g||Go(o,A,n,4),r.write(o,A,n,c,23,4),n+4}l.prototype.writeFloatLE=function(A,n,c){return Wo(this,A,n,!0,c)},l.prototype.writeFloatBE=function(A,n,c){return Wo(this,A,n,!1,c)};function xo(o,A,n,c,g){return A=+A,n=n>>>0,g||Go(o,A,n,8),r.write(o,A,n,c,52,8),n+8}l.prototype.writeDoubleLE=function(A,n,c){return xo(this,A,n,!0,c)},l.prototype.writeDoubleBE=function(A,n,c){return xo(this,A,n,!1,c)},l.prototype.copy=function(A,n,c,g){if(!l.isBuffer(A))throw new TypeError("argument should be a Buffer");if(c||(c=0),!g&&g!==0&&(g=this.length),n>=A.length&&(n=A.length),n||(n=0),g>0&&g<c&&(g=c),g===c||A.length===0||this.length===0)return 0;if(n<0)throw new RangeError("targetStart out of bounds");if(c<0||c>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),A.length-n<g-c&&(g=A.length-n+c);const C=g-c;return this===A&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(n,c,g):Uint8Array.prototype.set.call(A,this.subarray(c,g),n),C},l.prototype.fill=function(A,n,c,g){if(typeof A=="string"){if(typeof n=="string"?(g=n,n=0,c=this.length):typeof c=="string"&&(g=c,c=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!l.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(A.length===1){const f=A.charCodeAt(0);(g==="utf8"&&f<128||g==="latin1")&&(A=f)}}else typeof A=="number"?A=A&255:typeof A=="boolean"&&(A=Number(A));if(n<0||this.length<n||this.length<c)throw new RangeError("Out of range index");if(c<=n)return this;n=n>>>0,c=c===void 0?this.length:c>>>0,A||(A=0);let C;if(typeof A=="number")for(C=n;C<c;++C)this[C]=A;else{const f=l.isBuffer(A)?A:l.from(A,g),T=f.length;if(T===0)throw new TypeError('The value "'+A+'" is invalid for argument "value"');for(C=0;C<c-n;++C)this[C+n]=f[C%T]}return this};const Pe={};function Yr(o,A,n){Pe[o]=class extends n{constructor(){super(),Object.defineProperty(this,"message",{value:A.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${o}]`,this.stack,delete this.name}get code(){return o}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${o}]: ${this.message}`}}}Yr("ERR_BUFFER_OUT_OF_BOUNDS",function(o){return o?`${o} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Yr("ERR_INVALID_ARG_TYPE",function(o,A){return`The "${o}" argument must be of type number. Received type ${typeof A}`},TypeError),Yr("ERR_OUT_OF_RANGE",function(o,A,n){let c=`The value of "${o}" is out of range.`,g=n;return Number.isInteger(n)&&Math.abs(n)>2**32?g=Zo(String(n)):typeof n=="bigint"&&(g=String(n),(n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(g=Zo(g)),g+="n"),c+=` It must be ${A}. Received ${g}`,c},RangeError);function Zo(o){let A="",n=o.length;const c=o[0]==="-"?1:0;for(;n>=c+4;n-=3)A=`_${o.slice(n-3,n)}${A}`;return`${o.slice(0,n)}${A}`}function e0(o,A,n){Me(A,"offset"),(o[A]===void 0||o[A+n]===void 0)&&ze(A,o.length-(n+1))}function Jo(o,A,n,c,g,C){if(o>n||o<A){const f=typeof A=="bigint"?"n":"";let T;throw C>3?A===0||A===BigInt(0)?T=`>= 0${f} and < 2${f} ** ${(C+1)*8}${f}`:T=`>= -(2${f} ** ${(C+1)*8-1}${f}) and < 2 ** ${(C+1)*8-1}${f}`:T=`>= ${A}${f} and <= ${n}${f}`,new Pe.ERR_OUT_OF_RANGE("value",T,o)}e0(c,g,C)}function Me(o,A){if(typeof o!="number")throw new Pe.ERR_INVALID_ARG_TYPE(A,"number",o)}function ze(o,A,n){throw Math.floor(o)!==o?(Me(o,n),new Pe.ERR_OUT_OF_RANGE(n||"offset","an integer",o)):A<0?new Pe.ERR_BUFFER_OUT_OF_BOUNDS:new Pe.ERR_OUT_OF_RANGE(n||"offset",`>= ${n?1:0} and <= ${A}`,o)}const A0=/[^+/0-9A-Za-z-_]/g;function r0(o){if(o=o.split("=")[0],o=o.trim().replace(A0,""),o.length<2)return"";for(;o.length%4!==0;)o=o+"=";return o}function Or(o,A){A=A||1/0;let n;const c=o.length;let g=null;const C=[];for(let f=0;f<c;++f){if(n=o.charCodeAt(f),n>55295&&n<57344){if(!g){if(n>56319){(A-=3)>-1&&C.push(239,191,189);continue}else if(f+1===c){(A-=3)>-1&&C.push(239,191,189);continue}g=n;continue}if(n<56320){(A-=3)>-1&&C.push(239,191,189),g=n;continue}n=(g-55296<<10|n-56320)+65536}else g&&(A-=3)>-1&&C.push(239,191,189);if(g=null,n<128){if((A-=1)<0)break;C.push(n)}else if(n<2048){if((A-=2)<0)break;C.push(n>>6|192,n&63|128)}else if(n<65536){if((A-=3)<0)break;C.push(n>>12|224,n>>6&63|128,n&63|128)}else if(n<1114112){if((A-=4)<0)break;C.push(n>>18|240,n>>12&63|128,n>>6&63|128,n&63|128)}else throw new Error("Invalid code point")}return C}function n0(o){const A=[];for(let n=0;n<o.length;++n)A.push(o.charCodeAt(n)&255);return A}function o0(o,A){let n,c,g;const C=[];for(let f=0;f<o.length&&!((A-=2)<0);++f)n=o.charCodeAt(f),c=n>>8,g=n%256,C.push(g),C.push(c);return C}function Xo(o){return e.toByteArray(r0(o))}function ZA(o,A,n,c){let g;for(g=0;g<c&&!(g+n>=A.length||g>=o.length);++g)A[g+n]=o[g];return g}function Qt(o,A){return o instanceof A||o!=null&&o.constructor!=null&&o.constructor.name!=null&&o.constructor.name===A.name}function Nr(o){return o!==o}const i0=function(){const o="0123456789abcdef",A=new Array(256);for(let n=0;n<16;++n){const c=n*16;for(let g=0;g<16;++g)A[c+g]=o[n]+o[g]}return A}();function zt(o){return typeof BigInt>"u"?s0:o}function s0(){throw new Error("BigInt not supported")}})(st);var U=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(U||{}),ft=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t))(ft||{}),G=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL=9]="TIME_TRAVEL",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.RESTORE_STATE=11]="RESTORE_STATE",t[t.KEYPRESS=12]="KEYPRESS",t[t.MOUSEEVENT=13]="MOUSEEVENT",t[t.PASTE_TEXT=14]="PASTE_TEXT",t[t.APPLE_PRESS=15]="APPLE_PRESS",t[t.APPLE_RELEASE=16]="APPLE_RELEASE",t[t.GET_SAVE_STATE=17]="GET_SAVE_STATE",t[t.DRIVE_PROPS=18]="DRIVE_PROPS",t[t.GAMEPAD=19]="GAMEPAD",t[t.SET_BINARY_BLOCK=20]="SET_BINARY_BLOCK",t[t.COMM_DATA=21]="COMM_DATA",t))(G||{}),$t=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))($t||{}),u=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(u||{});const ei=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),VA=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",K=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),Fe=t=>t.split("").map(e=>e.charCodeAt(0)),Ai=t=>[t&255,t>>>8&255],Wr=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],xr=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},jA=new Uint32Array(256).fill(0),ri=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;jA[e]=t}},ni=(t,e=0)=>{jA[255]===0&&ri();let r=-1;for(let i=e;i<t.length;i++)r=r>>>8^jA[(r^t[i])&255];return(r^-1)>>>0};let St;const te=Math.trunc(.0028*1020484);let HA=te/2,vA=te/2,_A=te/2,zA=te/2,Zr=0,Jr=!1,Xr=!1,$A=!1,tr=!1,$e=!1,Vr=!1,jr=!1;const er=()=>{$A=!0},Hr=()=>{tr=!0},oi=()=>{$e=!0},tA=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*te/2),vr=t=>{HA=tA(t)},_r=t=>{vA=tA(t)},zr=t=>{_A=tA(t)},$r=t=>{zA=tA(t)},Ar=()=>{Vr=Jr||$A,jr=Xr||tr,E.PB0.isSet=Vr,E.PB1.isSet=jr||$e,E.PB2.isSet=$e},tn=(t,e)=>{e?Jr=t:Xr=t,Ar()},ii=t=>{V(49252,128),V(49253,128),V(49254,128),V(49255,128),Zr=t},en=t=>{const e=t-Zr;V(49252,e<HA?128:0),V(49253,e<vA?128:0),V(49254,e<_A?128:0),V(49255,e<zA?128:0)};let ee,rr,An=!1;const si=t=>{St=t,An=!St.length||!St[0].buttons.length,ee=mi(),rr=ee.gamepad?ee.gamepad:Ei},rn=t=>t>-.01&&t<.01,ai=t=>{let e=t[0],r=t[1];rn(e)&&(e=0),rn(r)&&(r=0);const i=Math.sqrt(e*e+r*r),a=.95*(i===0?1:Math.max(Math.abs(e),Math.abs(r))/i);return e=Math.min(Math.max(-a,e),a),r=Math.min(Math.max(-a,r),a),e=Math.trunc(te*(e+a)/(2*a)),r=Math.trunc(te*(r+a)/(2*a)),[e,r]},nn=t=>{const e=ee.joystick?ee.joystick(St[t].axes,An):St[t].axes,r=ai(e);t===0?(HA=r[0],vA=r[1],$A=!1,tr=!1):(_A=r[0],zA=r[1],$e=!1);let i=!1;St[t].buttons.forEach((a,h)=>{a&&(rr(h,St.length>1,t===1),i=!0)}),i||rr(-1,St.length>1,t===1),ee.rumble&&ee.rumble(),Ar()},ci=()=>{St&&St.length>0&&(nn(0),St.length>1&&nn(1))},li=t=>{switch(t){case 0:F("JL");break;case 1:F("G",200);break;case 2:x("M"),F("O");break;case 3:F("L");break;case 4:F("F");break;case 5:x("P"),F("T");break;case 6:break;case 7:break;case 8:F("Z");break;case 9:{const e=mn();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:break;case 11:break;case 12:F("L");break;case 13:F("M");break;case 14:F("A");break;case 15:F("D");break;case-1:return}};let Ae=0,re=0,ne=!1;const eA=.5,ui={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-eA?(re=0,Ae===0||Ae>2?(Ae=0,x("A")):Ae===1&&ne?F("W"):Ae===2&&ne&&F("R"),Ae++,ne=!1,t):t[0]>eA?(Ae=0,re===0||re>2?(re=0,x("D")):re===1&&ne?F("W"):re===2&&ne&&F("R"),re++,ne=!1,t):t[1]<-eA?(F("C"),t):t[1]>eA?(F("S"),t):(ne=!0,t),gamepad:li,rumble:null,setup:null,helptext:`AZTEC
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
`},Ii={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let nr=14,or=14;const gi={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=S(182);nr<40&&t<nr&&br({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),nr=t,t=S(183),or<40&&t<or&&br({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),or=t},setup:null,helptext:`KARATEKA
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
`},hi=t=>{switch(t){case 0:F("A");break;case 1:F("C",50);break;case 2:F("O");break;case 3:F("T");break;case 4:F("\x1B");break;case 5:F("\r");break;case 6:break;case 7:break;case 8:x("N"),F("'");break;case 9:x("Y"),F("1");break;case 10:break;case 11:break;case 12:break;case 13:F(" ");break;case 14:break;case 15:F("	");break;case-1:return}},qt=.5,pi={address:768,data:[141,74,3,132],keymap:{},gamepad:hi,joystick:(t,e)=>{if(e)return t;const r=t[0]<-qt?"\b":t[0]>qt?"":"",i=t[1]<-qt?"\v":t[1]>qt?`
`:"";let a=r+i;return a||(a=t[2]<-qt?"L\b":t[2]>qt?"L":"",a||(a=t[3]<-qt?"L\v":t[3]>qt?`L
`:"")),a&&F(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
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
ESC  exit conversation`},on=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,Ci=t=>{switch(t){case 1:D(109,255);break;case 12:x("A");break;case 13:x("Z");break;case 14:x("\b");break;case 15:x("");break}},AA=.75,fi=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{D(25025,173),D(25036,64)},helptext:on},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-AA?"\b":t[0]>AA?"":t[1]<-AA?"A":t[1]>AA?"Z":"";return e&&x(e),t},gamepad:Ci,rumble:null,setup:null,helptext:on}],Si={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Bi={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:er();break;case 1:Hr();break;case 2:F(" ");break;case 3:F("U");break;case 4:F("\r");break;case 5:F("T");break;case 9:{const e=mn();e.includes("'N'")?x("N"):e.includes("'S'")?x("S"):e.includes("NUMERIC KEY")?x("1"):x("N");break}case 10:er();break}},rumble:()=>{S(49178)<128&&S(49181)<128&&br({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(5128,0),D(5130,4);let t=5210;D(t,234),D(t+1,234),D(t+2,234),t=5224,D(t,234),D(t+1,234),D(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},Ue=new Array,oe=t=>{Array.isArray(t)?Ue.push(...t):Ue.push(t)};oe(ui),oe(Ii),oe(gi),oe(pi),oe(fi),oe(Si),oe(Bi);const Ei=(t,e,r)=>{if(r)switch(t){case 0:oi();break;case 1:break;case 12:$r(-1);break;case 13:$r(1);break;case 14:zr(-1);break;case 15:zr(1);break}else switch(t){case 0:er();break;case 1:e||Hr();break;case 12:_r(-1);break;case 13:_r(1);break;case 14:vr(-1);break;case 15:vr(1);break}},Di={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},sn=t=>{for(const e of Ue)if(ur(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},mi=()=>{for(const t of Ue)if(ur(t.address,t.data))return t;return Di},an=(t=!1)=>{for(const e of Ue)if(ur(e.address,e.data)){Mo(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&Mo(" ")},wi=t=>{V(49152,t|128,32)};let ie="",cn=1e9;const ki=()=>{const t=performance.now();if(ie!==""&&(sr(49152)<128||t-cn>1500)){cn=t;const e=ie.charCodeAt(0);wi(e),ie=ie.slice(1),ie.length===0&&ko(!0)}};let ln="";const x=t=>{t===ln&&ie.length>0||(ln=t,ie+=t)};let un=0;const F=(t,e=300)=>{const r=performance.now();r-un<e||(un=r,x(t))},yi=t=>{t.length===1&&(t=sn(t)),x(t)},Ti=t=>{t.length===1&&(t=sn(t)),x(t)},rA=[],k=(t,e,r=!1,i=null)=>{const a={offAddr:t,onAddr:t+1,isSetAddr:e,writeOnly:r,isSet:!1,setFunc:i};return t>=49152&&(rA[t-49152]=a,rA[t+1-49152]=a),e>=49152&&(rA[e-49152]=a),a},fe=()=>Math.floor(256*Math.random()),di=t=>{t&=11,E.READBSR2.isSet=t===0,E.WRITEBSR2.isSet=t===1,E.OFFBSR2.isSet=t===2,E.RDWRBSR2.isSet=t===3,E.READBSR1.isSet=t===8,E.WRITEBSR1.isSet=t===9,E.OFFBSR1.isSet=t===10,E.RDWRBSR1.isSet=t===11,E.BSRBANK2.isSet=t<=3,E.BSRREADRAM.isSet=[0,3,8,11].includes(t)},E={STORE80:k(49152,49176,!0),RAMRD:k(49154,49171,!0),RAMWRT:k(49156,49172,!0),INTCXROM:k(49158,49173,!0),INTC8ROM:k(0,0),ALTZP:k(49160,49174,!0),SLOTC3ROM:k(49162,49175,!0),COLUMN80:k(49164,49183,!0),ALTCHARSET:k(49166,49182,!0),KBRDSTROBE:k(0,49168,!1,()=>{const t=sr(49152)&127;V(49152,t,32)}),BSRBANK2:k(0,49169),BSRREADRAM:k(0,49170),CASSOUT:k(49184,0),SPEAKER:k(49200,0,!1,(t,e)=>{V(49200,fe()),Ya(e)}),GCSTROBE:k(49216,0),EMUBYTE:k(0,49231,!1,()=>{V(49231,205)}),TEXT:k(49232,49178),MIXED:k(49234,49179),PAGE2:k(49236,49180),HIRES:k(49238,49181),AN0:k(49240,0),AN1:k(49242,0),AN2:k(49244,0),AN3:k(49246,0),CASSIN1:k(0,49248,!1,()=>{V(49248,fe())}),PB0:k(0,49249),PB1:k(0,49250),PB2:k(0,49251),JOYSTICK12:k(49252,0,!1,(t,e)=>{en(e)}),JOYSTICK34:k(49254,0,!1,(t,e)=>{en(e)}),CASSIN2:k(0,49256,!1,()=>{V(49256,fe())}),FASTCHIP_LOCK:k(49258,0),FASTCHIP_ENABLE:k(49259,0),FASTCHIP_SPEED:k(49261,0),JOYSTICKRESET:k(49264,0,!1,(t,e)=>{ii(e),V(49264,fe())}),LASER128EX:k(49268,0),READBSR2:k(49280,0),WRITEBSR2:k(49281,0),OFFBSR2:k(49282,0),RDWRBSR2:k(49283,0),READBSR1:k(49288,0),WRITEBSR1:k(49289,0),OFFBSR1:k(49290,0),RDWRBSR1:k(49291,0)};E.TEXT.isSet=!0;const Ri=[49152,49153,49165,49167,49200,49236,49237,49183],In=(t,e,r)=>{if(t>1048575&&!Ri.includes(t)){const a=sr(t)>128?1:0;console.log(`${r} $${K(s.PC)}: $${K(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){t-=t&4,di(t);return}if(t===49152&&!e){ki();return}const i=rA[t-49152];if(!i){console.error("Unknown softswitch "+K(t)),V(t,fe());return}if(i.setFunc){i.setFunc(t,r);return}t===i.offAddr||t===i.onAddr?((!i.writeOnly||e)&&(i.isSet=t===i.onAddr),i.isSetAddr&&V(i.isSetAddr,i.isSet?141:13),t>=49184&&V(t,fe())):t===i.isSetAddr&&V(t,i.isSet?141:13)},Qi=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,Pi=`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
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
g39dzLXNFxf1A/sDYvr6ww==`,gn=(1024-64)/64,L=new Uint8Array(163584+gn*65536).fill(0),v=new Array(257).fill(0),ut=new Array(257).fill(0),Se=256,Ke=512,hn=576,pn=583,Mi=639,Le=256*Ke,nA=256*hn,Fi=256*pn,Cn=256*Se;let se=0,It=0;const Ui=()=>{const t=E.RAMRD.isSet?It||Se:0,e=E.RAMWRT.isSet?It||Se:0,r=E.PAGE2.isSet?It||Se:0,i=E.STORE80.isSet?r:t,a=E.STORE80.isSet?r:e,h=E.STORE80.isSet&&E.HIRES.isSet?r:t,p=E.STORE80.isSet&&E.HIRES.isSet?r:e;for(let l=2;l<256;l++)v[l]=l+t,ut[l]=l+e;for(let l=4;l<=7;l++)v[l]=l+i,ut[l]=l+a;for(let l=32;l<=63;l++)v[l]=l+h,ut[l]=l+p},Ki=()=>{const t=E.ALTZP.isSet?It||Se:0;if(v[0]=t,v[1]=1+t,ut[0]=t,ut[1]=1+t,E.BSRREADRAM.isSet){for(let e=208;e<=255;e++)v[e]=e+t;if(!E.BSRBANK2.isSet)for(let e=208;e<=223;e++)v[e]=e-16+t}else for(let e=208;e<=255;e++)v[e]=Ke+e-192},Li=()=>{const t=E.ALTZP.isSet?It||Se:0,e=E.WRITEBSR1.isSet||E.WRITEBSR2.isSet||E.RDWRBSR1.isSet||E.RDWRBSR2.isSet;for(let r=192;r<=255;r++)ut[r]=-1;if(e){for(let r=208;r<=255;r++)ut[r]=r+t;if(!E.BSRBANK2.isSet)for(let r=208;r<=223;r++)ut[r]=r-16+t}},fn=t=>E.INTCXROM.isSet?!1:t!==3?!0:E.SLOTC3ROM.isSet,qi=()=>!(E.INTCXROM.isSet||E.INTC8ROM.isSet||se<=0),ir=t=>{if(t<8){if(E.INTCXROM.isSet)return;t===3&&!E.SLOTC3ROM.isSet&&(E.INTC8ROM.isSet||(E.INTC8ROM.isSet=!0,se=-1,ae())),se===0&&(se=t,ae())}else E.INTC8ROM.isSet=!1,se=0,ae()},bi=()=>{v[192]=Ke-192;for(let t=1;t<=7;t++){const e=192+t;v[e]=t+(fn(t)?hn-1:Ke)}if(qi()){const t=pn+8*(se-1);for(let e=0;e<=7;e++){const r=200+e;v[r]=t+e}}else for(let t=200;t<=207;t++)v[t]=Ke+t-192},ae=()=>{Ui(),Ki(),Li(),bi();for(let t=0;t<256;t++)v[t]=256*v[t],ut[t]=256*ut[t]},Sn=new Map,Bn=new Array(8),oA=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(ir(r),!fn(r)))return;const i=Bn[r];if(i!==void 0){const a=i(t,e);if(a>=0){const h=t>=49408?nA-256:Le;L[t-49152+h]=a}}},iA=(t,e)=>{Bn[t]=e},Be=(t,e,r=0,i=()=>{})=>{if(L.set(e.slice(0,256),nA+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,h=Fi+(t-1)*2048;L.set(e.slice(256,a),h)}r&&Sn.set(r,i)},Yi=()=>{L.fill(255,0,131071);const e=(Lr?Pi:Qi).replace(/\n/g,""),r=new Uint8Array(st.Buffer.from(e,"base64"));L.set(r,Le),se=0,It=0,ae()},Oi=t=>t===49177?YA?13:141:(t>=49296?oA(t):In(t,!1,s.cycleCount),t>=49232&&ae(),L[Le+t-49152]),q=(t,e)=>{const r=nA+(t-1)*256+(e&255);return L[r]},P=(t,e,r)=>{if(r>=0){const i=nA+(t-1)*256+(e&255);L[i]=r&255}},S=t=>{const e=t>>>8;if(e===192)return Oi(t);e>=193&&e<=199?oA(t):t===53247&&ir(255);const r=v[e];return L[r+(t&255)]},qe=t=>{const e=t>>>8,r=v[e];return L[r+(t&255)]},Ni=(t,e)=>{if(t===49265||t===49267){if(e>gn)return;It=e?(e-1)*256+Mi:0}else t>=49296?oA(t,e):In(t,!0,s.cycleCount);(t<=49167||t>=49232)&&ae()},D=(t,e)=>{const r=t>>>8;if(r===192)Ni(t,e);else{r>=193&&r<=199?oA(t,e):t===53247&&ir(255);const i=ut[r];if(i<0)return;L[i+(t&255)]=e}},sr=t=>L[Le+t-49152],V=(t,e,r=1)=>{const i=Le+t-49152;L.fill(e,i,i+r)},En=1024,Dn=2048,ar=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],cr=(t=!1)=>{let e=0,r=24,i=!1;if(t){if(E.TEXT.isSet||E.HIRES.isSet)return new Uint8Array;r=E.MIXED.isSet?20:24,i=E.COLUMN80.isSet&&!E.AN3.isSet}else{if(!E.TEXT.isSet&&!E.MIXED.isSet)return new Uint8Array;!E.TEXT.isSet&&E.MIXED.isSet&&(e=20),i=E.COLUMN80.isSet}if(i){const a=E.PAGE2.isSet&&!E.STORE80.isSet?Dn:En,h=new Uint8Array(80*(r-e)).fill(160);for(let p=e;p<r;p++){const l=80*(p-e);for(let B=0;B<40;B++)h[l+2*B+1]=L[a+ar[p]+B],h[l+2*B]=L[Cn+a+ar[p]+B]}return h}else{const a=E.PAGE2.isSet?Dn:En,h=new Uint8Array(40*(r-e));for(let p=e;p<r;p++){const l=40*(p-e),B=a+ar[p];h.set(L.slice(B,B+40),l)}return h}},mn=()=>st.Buffer.from(cr().map(t=>t&=127)).toString(),Gi=()=>{if(E.TEXT.isSet||!E.HIRES.isSet)return new Uint8Array;const t=E.COLUMN80.isSet&&!E.AN3.isSet,e=E.MIXED.isSet?160:192;if(t){const r=E.PAGE2.isSet&&!E.STORE80.isSet?16384:8192,i=new Uint8Array(80*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);for(let p=0;p<40;p++)i[a*80+2*p+1]=L[h+p],i[a*80+2*p]=L[Cn+h+p]}return i}else{const r=E.PAGE2.isSet?16384:8192,i=new Uint8Array(40*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);i.set(L.slice(h,h+40),a*40)}return i}},Wi=t=>{const e=v[t>>>8];return L.slice(e,e+512)},lr=(t,e)=>{const r=ut[t>>>8]+(t&255);L.set(e,r),an()},ur=(t,e)=>{for(let r=0;r<e.length;r++)if(S(t+r)!==e[r])return!1;return!0},xi=()=>{const t=[""],e=v[0],r=L.slice(e,e+256);t[0]="     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F";for(let i=0;i<16;i++){let a=K(16*i)+":";for(let h=0;h<16;h++)a+=" "+K(r[i*16+h]);t[i+1]=a}return t.join(`
`)},s=ei(),be=t=>{s.XReg=t},Ye=t=>{s.YReg=t},sA=t=>{s.cycleCount=t},wn=t=>{kn(),Object.assign(s,t)},kn=()=>{s.Accum=0,s.XReg=0,s.YReg=0,s.PStatus=36,s.StackPtr=255,mt(S(65533)*256+S(65532)),s.flagIRQ=0,s.flagNMI=!1},yn=t=>{mt((s.PC+t+65536)%65536)},mt=t=>{s.PC=t},Tn=t=>{s.PStatus=t|48},Zi=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),Ji=()=>`A=${K(s.Accum)} X=${K(s.XReg)} Y=${K(s.YReg)} P=${K(s.PStatus)} ${Zi(s.PStatus)} S=${K(s.StackPtr)}`,Xi=()=>`${K(s.PC)} ${Ji()} NMI=${s.flagNMI?"1":"0"} IRQ=${K(s.flagIRQ)}`,ce=new Array(256).fill(""),Vi=()=>{const t=L.slice(256,512),e=new Array;for(let r=255;r>s.StackPtr;r--){let i="$"+K(t[r]),a=ce[r];ce[r].length>3&&r-1>s.StackPtr&&(ce[r-1]==="JSR"||ce[r-1]==="BRK"?(r--,i+=K(t[r])):a=""),i=(i+"   ").substring(0,6),e.push(K(256+r,4)+": "+i+a)}return e},ji=()=>{const t=L.slice(256,512);for(let e=s.StackPtr-2;e<=255;e++){const r=t[e];if(ce[e].startsWith("JSR")&&e-1>s.StackPtr&&ce[e-1]==="JSR"){const i=t[e-1]+1;return(r<<8)+i}}return-1},Pt=(t,e)=>{ce[s.StackPtr]=t,D(256+s.StackPtr,e),s.StackPtr=(s.StackPtr+255)%256},Mt=()=>{s.StackPtr=(s.StackPtr+1)%256;const t=S(256+s.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},gt=()=>(s.PStatus&1)!==0,Q=(t=!0)=>s.PStatus=t?s.PStatus|1:s.PStatus&254,dn=()=>(s.PStatus&2)!==0,aA=(t=!0)=>s.PStatus=t?s.PStatus|2:s.PStatus&253,Hi=()=>(s.PStatus&4)!==0,Ir=(t=!0)=>s.PStatus=t?s.PStatus|4:s.PStatus&251,Rn=()=>(s.PStatus&8)!==0,j=()=>Rn()?1:0,gr=(t=!0)=>s.PStatus=t?s.PStatus|8:s.PStatus&247,hr=(t=!0)=>s.PStatus=t?s.PStatus|16:s.PStatus&239,Qn=()=>(s.PStatus&64)!==0,Oe=(t=!0)=>s.PStatus=t?s.PStatus|64:s.PStatus&191,Pn=()=>(s.PStatus&128)!==0,Mn=(t=!0)=>s.PStatus=t?s.PStatus|128:s.PStatus&127,w=t=>{aA(t===0),Mn(t>=128)},Ft=(t,e)=>{if(t){const r=s.PC;return yn(e>127?e-256:e),3+W(r,s.PC)}return 2},R=(t,e)=>(t+e+256)%256,m=(t,e)=>e*256+t,M=(t,e,r)=>(e*256+t+r+65536)%65536,W=(t,e)=>t>>8!==e>>8?1:0,wt=new Array(256),I=(t,e,r,i,a)=>{console.assert(!wt[r],"Duplicate instruction: "+t+" mode="+e),wt[r]={name:t,pcode:r,mode:e,PC:i,execute:a}},bt=(t,e,r)=>{const i=S(t),a=S((t+1)%256),h=M(i,a,s.YReg);e(h);let p=5+W(h,m(i,a));return r&&(p+=j()),p},Yt=(t,e,r)=>{const i=S(t),a=S((t+1)%256),h=m(i,a);e(h);let p=5;return r&&(p+=j()),p},Fn=t=>{let e=(s.Accum&15)+(t&15)+(gt()?1:0);e>=10&&(e+=6);let r=(s.Accum&240)+(t&240)+e;const i=s.Accum<=127&&t<=127,a=s.Accum>=128&&t>=128;Oe((r&255)>=128?i:a),Q(r>=160),gt()&&(r+=96),s.Accum=r&255,w(s.Accum)},cA=t=>{let e=s.Accum+t+(gt()?1:0);Q(e>=256),e=e%256;const r=s.Accum<=127&&t<=127,i=s.Accum>=128&&t>=128;Oe(e>=128?r:i),s.Accum=e,w(s.Accum)},Ot=t=>{Rn()?Fn(S(t)):cA(S(t))};I("ADC",u.IMM,105,2,t=>(j()?Fn(t):cA(t),2+j())),I("ADC",u.ZP_REL,101,2,t=>(Ot(t),3+j())),I("ADC",u.ZP_X,117,2,t=>(Ot(R(t,s.XReg)),4+j())),I("ADC",u.ABS,109,3,(t,e)=>(Ot(m(t,e)),4+j())),I("ADC",u.ABS_X,125,3,(t,e)=>{const r=M(t,e,s.XReg);return Ot(r),4+j()+W(r,m(t,e))}),I("ADC",u.ABS_Y,121,3,(t,e)=>{const r=M(t,e,s.YReg);return Ot(r),4+j()+W(r,m(t,e))}),I("ADC",u.IND_X,97,2,t=>{const e=R(t,s.XReg);return Ot(m(S(e),S(e+1))),6+j()}),I("ADC",u.IND_Y,113,2,t=>bt(t,Ot,!0)),I("ADC",u.IND,114,2,t=>Yt(t,Ot,!0));const Nt=t=>{s.Accum&=S(t),w(s.Accum)};I("AND",u.IMM,41,2,t=>(s.Accum&=t,w(s.Accum),2)),I("AND",u.ZP_REL,37,2,t=>(Nt(t),3)),I("AND",u.ZP_X,53,2,t=>(Nt(R(t,s.XReg)),4)),I("AND",u.ABS,45,3,(t,e)=>(Nt(m(t,e)),4)),I("AND",u.ABS_X,61,3,(t,e)=>{const r=M(t,e,s.XReg);return Nt(r),4+W(r,m(t,e))}),I("AND",u.ABS_Y,57,3,(t,e)=>{const r=M(t,e,s.YReg);return Nt(r),4+W(r,m(t,e))}),I("AND",u.IND_X,33,2,t=>{const e=R(t,s.XReg);return Nt(m(S(e),S(e+1))),6}),I("AND",u.IND_Y,49,2,t=>bt(t,Nt,!1)),I("AND",u.IND,50,2,t=>Yt(t,Nt,!1));const lA=t=>{let e=S(t);S(t),Q((e&128)===128),e=(e<<1)%256,D(t,e),w(e)};I("ASL",u.IMPLIED,10,1,()=>(Q((s.Accum&128)===128),s.Accum=(s.Accum<<1)%256,w(s.Accum),2)),I("ASL",u.ZP_REL,6,2,t=>(lA(t),5)),I("ASL",u.ZP_X,22,2,t=>(lA(R(t,s.XReg)),6)),I("ASL",u.ABS,14,3,(t,e)=>(lA(m(t,e)),6)),I("ASL",u.ABS_X,30,3,(t,e)=>{const r=M(t,e,s.XReg);return lA(r),6+W(r,m(t,e))}),I("BCC",u.ZP_REL,144,2,t=>Ft(!gt(),t)),I("BCS",u.ZP_REL,176,2,t=>Ft(gt(),t)),I("BEQ",u.ZP_REL,240,2,t=>Ft(dn(),t)),I("BMI",u.ZP_REL,48,2,t=>Ft(Pn(),t)),I("BNE",u.ZP_REL,208,2,t=>Ft(!dn(),t)),I("BPL",u.ZP_REL,16,2,t=>Ft(!Pn(),t)),I("BVC",u.ZP_REL,80,2,t=>Ft(!Qn(),t)),I("BVS",u.ZP_REL,112,2,t=>Ft(Qn(),t)),I("BRA",u.ZP_REL,128,2,t=>Ft(!0,t));const Ne=t=>{aA((s.Accum&t)===0),Mn((t&128)!==0),Oe((t&64)!==0)};I("BIT",u.ZP_REL,36,2,t=>(Ne(S(t)),3)),I("BIT",u.ABS,44,3,(t,e)=>(Ne(S(m(t,e))),4)),I("BIT",u.IMM,137,2,t=>(Ne(t),2)),I("BIT",u.ZP_X,52,2,t=>(Ne(S(R(t,s.XReg))),4)),I("BIT",u.ABS_X,60,3,(t,e)=>{const r=M(t,e,s.XReg);return Ne(S(r)),4+W(r,m(t,e))});const pr=(t,e,r=0)=>{const i=(s.PC+r)%65536,a=S(e),h=S(e+1);Pt(`${t} $`+K(h)+K(a),Math.trunc(i/256)),Pt(t,i%256),Pt("P",s.PStatus),gr(!1),Ir();const p=M(a,h,t==="BRK"?-1:0);mt(p)},Un=()=>(hr(),pr("BRK",65534,2),7);I("BRK",u.IMPLIED,0,1,Un);const vi=()=>Hi()?0:(hr(!1),pr("IRQ",65534),7),_i=()=>(pr("NMI",65530),7);I("CLC",u.IMPLIED,24,1,()=>(Q(!1),2)),I("CLD",u.IMPLIED,216,1,()=>(gr(!1),2)),I("CLI",u.IMPLIED,88,1,()=>(Ir(!1),2)),I("CLV",u.IMPLIED,184,1,()=>(Oe(!1),2));const le=t=>{const e=S(t);Q(s.Accum>=e),w((s.Accum-e+256)%256)},zi=t=>{const e=S(t);Q(s.Accum>=e),w((s.Accum-e+256)%256)};I("CMP",u.IMM,201,2,t=>(Q(s.Accum>=t),w((s.Accum-t+256)%256),2)),I("CMP",u.ZP_REL,197,2,t=>(le(t),3)),I("CMP",u.ZP_X,213,2,t=>(le(R(t,s.XReg)),4)),I("CMP",u.ABS,205,3,(t,e)=>(le(m(t,e)),4)),I("CMP",u.ABS_X,221,3,(t,e)=>{const r=M(t,e,s.XReg);return zi(r),4+W(r,m(t,e))}),I("CMP",u.ABS_Y,217,3,(t,e)=>{const r=M(t,e,s.YReg);return le(r),4+W(r,m(t,e))}),I("CMP",u.IND_X,193,2,t=>{const e=R(t,s.XReg);return le(m(S(e),S(e+1))),6}),I("CMP",u.IND_Y,209,2,t=>bt(t,le,!1)),I("CMP",u.IND,210,2,t=>Yt(t,le,!1));const Kn=t=>{const e=S(t);Q(s.XReg>=e),w((s.XReg-e+256)%256)};I("CPX",u.IMM,224,2,t=>(Q(s.XReg>=t),w((s.XReg-t+256)%256),2)),I("CPX",u.ZP_REL,228,2,t=>(Kn(t),3)),I("CPX",u.ABS,236,3,(t,e)=>(Kn(m(t,e)),4));const Ln=t=>{const e=S(t);Q(s.YReg>=e),w((s.YReg-e+256)%256)};I("CPY",u.IMM,192,2,t=>(Q(s.YReg>=t),w((s.YReg-t+256)%256),2)),I("CPY",u.ZP_REL,196,2,t=>(Ln(t),3)),I("CPY",u.ABS,204,3,(t,e)=>(Ln(m(t,e)),4));const uA=t=>{const e=R(S(t),-1);D(t,e),w(e)};I("DEC",u.IMPLIED,58,1,()=>(s.Accum=R(s.Accum,-1),w(s.Accum),2)),I("DEC",u.ZP_REL,198,2,t=>(uA(t),5)),I("DEC",u.ZP_X,214,2,t=>(uA(R(t,s.XReg)),6)),I("DEC",u.ABS,206,3,(t,e)=>(uA(m(t,e)),6)),I("DEC",u.ABS_X,222,3,(t,e)=>{const r=M(t,e,s.XReg);return S(r),uA(r),7}),I("DEX",u.IMPLIED,202,1,()=>(s.XReg=R(s.XReg,-1),w(s.XReg),2)),I("DEY",u.IMPLIED,136,1,()=>(s.YReg=R(s.YReg,-1),w(s.YReg),2));const Gt=t=>{s.Accum^=S(t),w(s.Accum)};I("EOR",u.IMM,73,2,t=>(s.Accum^=t,w(s.Accum),2)),I("EOR",u.ZP_REL,69,2,t=>(Gt(t),3)),I("EOR",u.ZP_X,85,2,t=>(Gt(R(t,s.XReg)),4)),I("EOR",u.ABS,77,3,(t,e)=>(Gt(m(t,e)),4)),I("EOR",u.ABS_X,93,3,(t,e)=>{const r=M(t,e,s.XReg);return Gt(r),4+W(r,m(t,e))}),I("EOR",u.ABS_Y,89,3,(t,e)=>{const r=M(t,e,s.YReg);return Gt(r),4+W(r,m(t,e))}),I("EOR",u.IND_X,65,2,t=>{const e=R(t,s.XReg);return Gt(m(S(e),S(e+1))),6}),I("EOR",u.IND_Y,81,2,t=>bt(t,Gt,!1)),I("EOR",u.IND,82,2,t=>Yt(t,Gt,!1));const IA=t=>{const e=R(S(t),1);D(t,e),w(e)};I("INC",u.IMPLIED,26,1,()=>(s.Accum=R(s.Accum,1),w(s.Accum),2)),I("INC",u.ZP_REL,230,2,t=>(IA(t),5)),I("INC",u.ZP_X,246,2,t=>(IA(R(t,s.XReg)),6)),I("INC",u.ABS,238,3,(t,e)=>(IA(m(t,e)),6)),I("INC",u.ABS_X,254,3,(t,e)=>{const r=M(t,e,s.XReg);return S(r),IA(r),7}),I("INX",u.IMPLIED,232,1,()=>(s.XReg=R(s.XReg,1),w(s.XReg),2)),I("INY",u.IMPLIED,200,1,()=>(s.YReg=R(s.YReg,1),w(s.YReg),2)),I("JMP",u.ABS,76,3,(t,e)=>(mt(M(t,e,-3)),3)),I("JMP",u.IND,108,3,(t,e)=>{const r=m(t,e);return t=S(r),e=S((r+1)%65536),mt(M(t,e,-3)),6}),I("JMP",u.IND_X,124,3,(t,e)=>{const r=M(t,e,s.XReg);return t=S(r),e=S((r+1)%65536),mt(M(t,e,-3)),6}),I("JSR",u.ABS,32,3,(t,e)=>{const r=(s.PC+2)%65536;return Pt("JSR $"+K(e)+K(t),Math.trunc(r/256)),Pt("JSR",r%256),mt(M(t,e,-3)),6});const Wt=t=>{s.Accum=S(t),w(s.Accum)};I("LDA",u.IMM,169,2,t=>(s.Accum=t,w(s.Accum),2)),I("LDA",u.ZP_REL,165,2,t=>(Wt(t),3)),I("LDA",u.ZP_X,181,2,t=>(Wt(R(t,s.XReg)),4)),I("LDA",u.ABS,173,3,(t,e)=>(Wt(m(t,e)),4)),I("LDA",u.ABS_X,189,3,(t,e)=>{const r=M(t,e,s.XReg);return Wt(r),4+W(r,m(t,e))}),I("LDA",u.ABS_Y,185,3,(t,e)=>{const r=M(t,e,s.YReg);return Wt(r),4+W(r,m(t,e))}),I("LDA",u.IND_X,161,2,t=>{const e=R(t,s.XReg);return Wt(m(S(e),S((e+1)%256))),6}),I("LDA",u.IND_Y,177,2,t=>bt(t,Wt,!1)),I("LDA",u.IND,178,2,t=>Yt(t,Wt,!1));const gA=t=>{s.XReg=S(t),w(s.XReg)};I("LDX",u.IMM,162,2,t=>(s.XReg=t,w(s.XReg),2)),I("LDX",u.ZP_REL,166,2,t=>(gA(t),3)),I("LDX",u.ZP_Y,182,2,t=>(gA(R(t,s.YReg)),4)),I("LDX",u.ABS,174,3,(t,e)=>(gA(m(t,e)),4)),I("LDX",u.ABS_Y,190,3,(t,e)=>{const r=M(t,e,s.YReg);return gA(r),4+W(r,m(t,e))});const hA=t=>{s.YReg=S(t),w(s.YReg)};I("LDY",u.IMM,160,2,t=>(s.YReg=t,w(s.YReg),2)),I("LDY",u.ZP_REL,164,2,t=>(hA(t),3)),I("LDY",u.ZP_X,180,2,t=>(hA(R(t,s.XReg)),4)),I("LDY",u.ABS,172,3,(t,e)=>(hA(m(t,e)),4)),I("LDY",u.ABS_X,188,3,(t,e)=>{const r=M(t,e,s.XReg);return hA(r),4+W(r,m(t,e))});const pA=t=>{let e=S(t);S(t),Q((e&1)===1),e>>=1,D(t,e),w(e)};I("LSR",u.IMPLIED,74,1,()=>(Q((s.Accum&1)===1),s.Accum>>=1,w(s.Accum),2)),I("LSR",u.ZP_REL,70,2,t=>(pA(t),5)),I("LSR",u.ZP_X,86,2,t=>(pA(R(t,s.XReg)),6)),I("LSR",u.ABS,78,3,(t,e)=>(pA(m(t,e)),6)),I("LSR",u.ABS_X,94,3,(t,e)=>{const r=M(t,e,s.XReg);return pA(r),6+W(r,m(t,e))}),I("NOP",u.IMPLIED,234,1,()=>2);const xt=t=>{s.Accum|=S(t),w(s.Accum)};I("ORA",u.IMM,9,2,t=>(s.Accum|=t,w(s.Accum),2)),I("ORA",u.ZP_REL,5,2,t=>(xt(t),3)),I("ORA",u.ZP_X,21,2,t=>(xt(R(t,s.XReg)),4)),I("ORA",u.ABS,13,3,(t,e)=>(xt(m(t,e)),4)),I("ORA",u.ABS_X,29,3,(t,e)=>{const r=M(t,e,s.XReg);return xt(r),4+W(r,m(t,e))}),I("ORA",u.ABS_Y,25,3,(t,e)=>{const r=M(t,e,s.YReg);return xt(r),4+W(r,m(t,e))}),I("ORA",u.IND_X,1,2,t=>{const e=R(t,s.XReg);return xt(m(S(e),S(e+1))),6}),I("ORA",u.IND_Y,17,2,t=>bt(t,xt,!1)),I("ORA",u.IND,18,2,t=>Yt(t,xt,!1)),I("PHA",u.IMPLIED,72,1,()=>(Pt("PHA",s.Accum),3)),I("PHP",u.IMPLIED,8,1,()=>(Pt("PHP",s.PStatus|16),3)),I("PHX",u.IMPLIED,218,1,()=>(Pt("PHX",s.XReg),3)),I("PHY",u.IMPLIED,90,1,()=>(Pt("PHY",s.YReg),3)),I("PLA",u.IMPLIED,104,1,()=>(s.Accum=Mt(),w(s.Accum),4)),I("PLP",u.IMPLIED,40,1,()=>(Tn(Mt()),4)),I("PLX",u.IMPLIED,250,1,()=>(s.XReg=Mt(),w(s.XReg),4)),I("PLY",u.IMPLIED,122,1,()=>(s.YReg=Mt(),w(s.YReg),4));const CA=t=>{let e=S(t);S(t);const r=gt()?1:0;Q((e&128)===128),e=(e<<1)%256|r,D(t,e),w(e)};I("ROL",u.IMPLIED,42,1,()=>{const t=gt()?1:0;return Q((s.Accum&128)===128),s.Accum=(s.Accum<<1)%256|t,w(s.Accum),2}),I("ROL",u.ZP_REL,38,2,t=>(CA(t),5)),I("ROL",u.ZP_X,54,2,t=>(CA(R(t,s.XReg)),6)),I("ROL",u.ABS,46,3,(t,e)=>(CA(m(t,e)),6)),I("ROL",u.ABS_X,62,3,(t,e)=>{const r=M(t,e,s.XReg);return CA(r),6+W(r,m(t,e))});const fA=t=>{let e=S(t);S(t);const r=gt()?128:0;Q((e&1)===1),e=e>>1|r,D(t,e),w(e)};I("ROR",u.IMPLIED,106,1,()=>{const t=gt()?128:0;return Q((s.Accum&1)===1),s.Accum=s.Accum>>1|t,w(s.Accum),2}),I("ROR",u.ZP_REL,102,2,t=>(fA(t),5)),I("ROR",u.ZP_X,118,2,t=>(fA(R(t,s.XReg)),6)),I("ROR",u.ABS,110,3,(t,e)=>(fA(m(t,e)),6)),I("ROR",u.ABS_X,126,3,(t,e)=>{const r=M(t,e,s.XReg);return fA(r),6+W(r,m(t,e))}),I("RTI",u.IMPLIED,64,1,()=>(Tn(Mt()),hr(!1),mt(m(Mt(),Mt())-1),6)),I("RTS",u.IMPLIED,96,1,()=>(mt(m(Mt(),Mt())),6));const qn=t=>{const e=255-t;let r=s.Accum+e+(gt()?1:0);const i=r>=256,a=s.Accum<=127&&e<=127,h=s.Accum>=128&&e>=128;Oe(r%256>=128?a:h);const p=(s.Accum&15)-(t&15)+(gt()?0:-1);r=s.Accum-t+(gt()?0:-1),r<0&&(r-=96),p<0&&(r-=6),s.Accum=r&255,w(s.Accum),Q(i)},Zt=t=>{j()?qn(S(t)):cA(255-S(t))};I("SBC",u.IMM,233,2,t=>(j()?qn(t):cA(255-t),2+j())),I("SBC",u.ZP_REL,229,2,t=>(Zt(t),3+j())),I("SBC",u.ZP_X,245,2,t=>(Zt(R(t,s.XReg)),4+j())),I("SBC",u.ABS,237,3,(t,e)=>(Zt(m(t,e)),4+j())),I("SBC",u.ABS_X,253,3,(t,e)=>{const r=M(t,e,s.XReg);return Zt(r),4+j()+W(r,m(t,e))}),I("SBC",u.ABS_Y,249,3,(t,e)=>{const r=M(t,e,s.YReg);return Zt(r),4+j()+W(r,m(t,e))}),I("SBC",u.IND_X,225,2,t=>{const e=R(t,s.XReg);return Zt(m(S(e),S(e+1))),6+j()}),I("SBC",u.IND_Y,241,2,t=>bt(t,Zt,!0)),I("SBC",u.IND,242,2,t=>Yt(t,Zt,!0)),I("SEC",u.IMPLIED,56,1,()=>(Q(),2)),I("SED",u.IMPLIED,248,1,()=>(gr(),2)),I("SEI",u.IMPLIED,120,1,()=>(Ir(),2)),I("STA",u.ZP_REL,133,2,t=>(D(t,s.Accum),3)),I("STA",u.ZP_X,149,2,t=>(D(R(t,s.XReg),s.Accum),4)),I("STA",u.ABS,141,3,(t,e)=>(D(m(t,e),s.Accum),4)),I("STA",u.ABS_X,157,3,(t,e)=>{const r=M(t,e,s.XReg);return S(r),D(r,s.Accum),5}),I("STA",u.ABS_Y,153,3,(t,e)=>(D(M(t,e,s.YReg),s.Accum),5)),I("STA",u.IND_X,129,2,t=>{const e=R(t,s.XReg);return D(m(S(e),S(e+1)),s.Accum),6});const bn=t=>{D(t,s.Accum)};I("STA",u.IND_Y,145,2,t=>(bt(t,bn,!1),6)),I("STA",u.IND,146,2,t=>Yt(t,bn,!1)),I("STX",u.ZP_REL,134,2,t=>(D(t,s.XReg),3)),I("STX",u.ZP_Y,150,2,t=>(D(R(t,s.YReg),s.XReg),4)),I("STX",u.ABS,142,3,(t,e)=>(D(m(t,e),s.XReg),4)),I("STY",u.ZP_REL,132,2,t=>(D(t,s.YReg),3)),I("STY",u.ZP_X,148,2,t=>(D(R(t,s.XReg),s.YReg),4)),I("STY",u.ABS,140,3,(t,e)=>(D(m(t,e),s.YReg),4)),I("STZ",u.ZP_REL,100,2,t=>(D(t,0),3)),I("STZ",u.ZP_X,116,2,t=>(D(R(t,s.XReg),0),4)),I("STZ",u.ABS,156,3,(t,e)=>(D(m(t,e),0),4)),I("STZ",u.ABS_X,158,3,(t,e)=>{const r=M(t,e,s.XReg);return S(r),D(r,0),5}),I("TAX",u.IMPLIED,170,1,()=>(s.XReg=s.Accum,w(s.XReg),2)),I("TAY",u.IMPLIED,168,1,()=>(s.YReg=s.Accum,w(s.YReg),2)),I("TSX",u.IMPLIED,186,1,()=>(s.XReg=s.StackPtr,w(s.XReg),2)),I("TXA",u.IMPLIED,138,1,()=>(s.Accum=s.XReg,w(s.Accum),2)),I("TXS",u.IMPLIED,154,1,()=>(s.StackPtr=s.XReg,2)),I("TYA",u.IMPLIED,152,1,()=>(s.Accum=s.YReg,w(s.Accum),2));const Yn=t=>{const e=S(t);aA((s.Accum&e)===0),D(t,e&~s.Accum)};I("TRB",u.ZP_REL,20,2,t=>(Yn(t),5)),I("TRB",u.ABS,28,3,(t,e)=>(Yn(m(t,e)),6));const On=t=>{const e=S(t);aA((s.Accum&e)===0),D(t,e|s.Accum)};I("TSB",u.ZP_REL,4,2,t=>(On(t),5)),I("TSB",u.ABS,12,3,(t,e)=>(On(m(t,e)),6));const $i=[2,34,66,98,130,194,226],ht="???";$i.forEach(t=>{I(ht,u.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)I(ht,u.IMPLIED,3+16*t,1,()=>1),I(ht,u.IMPLIED,7+16*t,1,()=>1),I(ht,u.IMPLIED,11+16*t,1,()=>1),I(ht,u.IMPLIED,15+16*t,1,()=>1);I(ht,u.IMPLIED,68,2,()=>3),I(ht,u.IMPLIED,84,2,()=>4),I(ht,u.IMPLIED,212,2,()=>4),I(ht,u.IMPLIED,244,2,()=>4),I(ht,u.IMPLIED,92,3,()=>8),I(ht,u.IMPLIED,220,3,()=>4),I(ht,u.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)wt[t]||(console.log("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",u.IMPLIED,t,1,Un));const At=(t,e,r)=>{const i=e&7,a=e>>>3;return t[a]|=r>>>i,i&&(t[a+1]|=r<<8-i),e+8},SA=(t,e,r)=>(e=At(t,e,r>>>1|170),e=At(t,e,r|170),e),Cr=(t,e)=>(e=At(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const ts=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),i=[0,2,1,3];for(let h=0;h<84;h++)r[h]=i[t[h]&3]|i[t[h+86]&3]<<2|i[t[h+172]&3]<<4;r[84]=i[t[84]&3]<<0|i[t[170]&3]<<2,r[85]=i[t[85]&3]<<0|i[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const es=(t,e,r)=>{let i=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)i=Cr(a,i);for(let h=0;h<16;h++){i=At(a,i,213),i=At(a,i,170),i=At(a,i,150),i=SA(a,i,254),i=SA(a,i,e),i=SA(a,i,h),i=SA(a,i,254^e^h),i=At(a,i,222),i=At(a,i,170),i=At(a,i,235);for(let B=0;B<7;B++)i=Cr(a,i);i=At(a,i,213),i=At(a,i,170),i=At(a,i,173);const p=h===15?15:h*(r?8:7)%15,l=ts(t.slice(p*256,p*256+256));for(let B=0;B<l.length;B++)i=At(a,i,l[B]);i=At(a,i,222),i=At(a,i,170),i=At(a,i,235);for(let B=0;B<16;B++)i=Cr(a,i)}return a},As=(t,e)=>{if(t.length!==35*16*256)return new Uint8Array;const r=new Uint8Array(512*3+512*35*13).fill(0);r.set(Fe(`WOZ2ÿ
\r
`),0),r.set(Fe("INFO"),12),r[16]=60,r[20]=2,r[21]=1,r[22]=0,r[23]=0,r[24]=1,r.fill(32,25,57),r.set(Fe("Apple2TS (CT6502)"),25),r[57]=1,r[58]=0,r[59]=32,r[60]=0,r[62]=0,r[64]=13,r.set(Fe("TMAP"),80),r[84]=160,r.fill(255,88,88+160);let i=0;for(let a=0;a<35;a++)i=88+(a<<2),a>0&&(r[i-1]=a),r[i]=r[i+1]=a;r.set(Fe("TRKS"),248),r.set(Wr(1280+35*13*512),252);for(let a=0;a<35;a++){i=256+(a<<3),r.set(Ai(3+a*13),i),r[i+2]=13,r.set(Wr(50304),i+4);const h=t.slice(a*16*256,(a+1)*16*256),p=es(h,a,e);i=512*(3+13*a),r.set(p,i)}return r},rs=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((l,B)=>l!==e[B])===void 0))return!1;t.isWriteProtected=e[22]===1;const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,p=ni(e,12);if(h!==0&&h!==p)return alert("CRC checksum error: "+t.filename),!1;for(let l=0;l<80;l++){const B=e[88+l*2];if(B<255){const O=256+8*B,d=e.slice(O,O+8);t.trackStart[l]=512*(d[0]+(d[1]<<8)),t.trackNbits[l]=d[4]+(d[5]<<8)+(d[6]<<16)+d[7]*2**24}else t.trackStart[l]=0,t.trackNbits[l]=51200}return!0},ns=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const h=e[88+a*2];if(h<255){t.trackStart[a]=256+h*6656;const p=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=p[2]+(p[3]<<8)}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},os=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),i=e.endsWith(".po");return r||i},is=(t,e)=>{const i=t.filename.toLowerCase().endsWith(".po"),a=As(e,i);return a.length===0?new Uint8Array:(t.filename=xr(t.filename,"woz"),t.diskHasChanges=!0,a)},Nn=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),ss=(t,e)=>{const r=Nn(e.slice(24,28)),i=Nn(e.slice(28,32));let a="";for(let h=0;h<4;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=xr(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(r,r+i))},Gn=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},as=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(Gn(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return ss(t,e)}return os(t.filename)&&(e=is(t,e)),rs(t,e)||ns(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},cs=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ee=0;const rt={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},Wn=t=>{rt.MOTOR_RUNNING=!1,Xn(t),t.halftrack=68,t.prevHalfTrack=68},ls=(t=!1)=>{if(t){const e=kA();e.motorRunning&&Vn(e)}else Qe($t.MOTOR_OFF)},xn=(t,e)=>{t.trackStart[t.halftrack]>0&&(t.prevHalfTrack=t.halftrack),t.halftrack+=e,t.halftrack<0||t.halftrack>68?(Qe($t.TRACK_END),t.halftrack=t.halftrack<0?0:t.halftrack>68?68:t.halftrack):Qe($t.TRACK_SEEK),t.status=` Track ${t.halftrack/2}`,pt(),t.trackStart[t.halftrack]>0&&t.prevHalfTrack!==t.halftrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack])),t.trackLocation>3&&(t.trackLocation-=4))},Zn=[128,64,32,16,8,4,2,1],us=[127,191,223,239,247,251,253,254],fr=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[i],h=t.trackLocation&7;r=(a&Zn[h])>>7-h}else r=1;return t.trackLocation++,r};let nt=0;const Is=(t,e)=>{if(e.length===0)return 0;let r=0;if(nt===0){for(;fr(t,e)===0;);nt=64;for(let i=5;i>=0;i--)nt|=fr(t,e)<<i}else{const i=fr(t,e);nt=nt<<1|i}return r=nt,nt>127&&(nt=0),r};let BA=0;const Sr=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[i];const h=t.trackLocation&7;r?a|=Zn[h]:a&=us[h],e[i]=a}t.trackLocation++},Jn=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&nt>0){if(r>=16)for(let i=7;i>=0;i--)Sr(t,e,nt&2**i?1:0);r>=36&&Sr(t,e,0),r>=40&&Sr(t,e,0),Br.push(r>=40?2:r>=36?1:nt),t.diskHasChanges=!0,nt=0}},Xn=t=>{Ee=0,rt.MOTOR_RUNNING||(t.motorRunning=!1),pt(),Qe($t.MOTOR_OFF)},Vn=t=>{Ee&&(clearTimeout(Ee),Ee=0),t.motorRunning=!0,pt(),Qe($t.MOTOR_ON)},gs=t=>{Ee===0&&(Ee=setTimeout(()=>Xn(t),1e3))};let Br=[];const EA=t=>{Br.length>0&&t.halftrack===2*0&&(Br=[])},DA=[0,0,0,0],hs=(t,e)=>{if(t>=49408)return-1;let r=kA();const i=Ts();if(r.hardDrive)return 0;let a=0;const h=s.cycleCount-BA;switch(t=t&15,t){case rt.DATA_LATCH_OFF:rt.DATA_LATCH=!1,r.motorRunning&&!r.writeMode&&(a=Is(r,i));break;case rt.MOTOR_ON:rt.MOTOR_RUNNING=!0,Vn(r),EA(r);break;case rt.MOTOR_OFF:rt.MOTOR_RUNNING=!1,gs(r),EA(r);break;case rt.DRIVE1:case rt.DRIVE2:{const p=t===rt.DRIVE1?1:2,l=kA();ys(p),r=kA(),r!==l&&l.motorRunning&&(l.motorRunning=!1,r.motorRunning=!0,pt());break}case rt.WRITE_OFF:r.motorRunning&&r.writeMode&&(Jn(r,i,h),BA=s.cycleCount),r.writeMode=!1,rt.DATA_LATCH&&(a=r.isWriteProtected?255:0),EA(r);break;case rt.WRITE_ON:r.writeMode=!0,BA=s.cycleCount,e>=0&&(nt=e);break;case rt.DATA_LATCH_ON:rt.DATA_LATCH=!0,r.motorRunning&&(r.writeMode&&(Jn(r,i,h),BA=s.cycleCount),e>=0&&(nt=e));break;default:{if(t<0||t>7)break;DA[Math.floor(t/2)]=t%2;const p=DA[(r.currentPhase+1)%4],l=DA[(r.currentPhase+3)%4];DA[r.currentPhase]||(r.motorRunning&&p?(xn(r,1),r.currentPhase=(r.currentPhase+1)%4):r.motorRunning&&l&&(xn(r,-1),r.currentPhase=(r.currentPhase+3)%4)),EA(r);break}}return a},ps=()=>{Be(6,Uint8Array.from(cs)),iA(6,hs)},jn=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Cs=t=>{let e=u.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=u.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=u.IND_Y:t.endsWith(",X)")?e=u.IND_X:e=u.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?u.ABS_X:u.ZP_X:t.endsWith(",Y")?e=t.length>5?u.ABS_Y:u.ZP_Y:e=t.length>3?u.ABS:u.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const i=jn(t);if(i.operation&&i.value){switch(i.operation){case"+":r+=i.value;break;case"-":r-=i.value;break;default:throw new Error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let De={};const Hn=(t,e,r,i)=>{let a=u.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Cs(r);const p=jn(r);if(p.label){const l=p.label.startsWith("<"),B=p.label.startsWith(">"),O=p.label.startsWith("#")||B||l;if(O&&(p.label=p.label.substring(1)),p.label in De)h=De[p.label],B?h=h>>8&255:l&&(h=h&255);else if(i===2)throw new Error("Missing label: "+p.label);if(p.operation&&p.value){switch(p.operation){case"+":h+=p.value;break;case"-":h-=p.value;break;default:throw new Error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}VA(e)?(a=u.ZP_REL,h=h-t+254,h>255&&(h-=256)):O?a=u.IMM:(a=h>=0&&h<=255?u.ZP_REL:u.ABS,a=p.idx==="X"?a===u.ABS?u.ABS_X:u.ZP_X:a,a=p.idx==="Y"?a===u.ABS?u.ABS_Y:u.ZP_Y:a)}return[a,h]},fs=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Ss=(t,e)=>{if(t.label in De)throw new Error("Redefined label: "+t.label);if(t.instr==="EQU"){const[r,i]=Hn(e,t.instr,t.operand,2);if(r!==u.ABS&&r!==u.ZP_REL)throw new Error("Illegal EQU value: "+t.operand);De[t.label]=i}else De[t.label]=e},Bs=(t,e)=>{const r=[],i=wt[t];return r.push(t),e>=0&&(r.push(e%256),i.PC===3&&r.push(Math.trunc(e/256))),r},vn=(t,e,r)=>{let i=t;const a=[];let h="";return e.forEach(p=>{if(p=p.split(";")[0].trimEnd().toUpperCase(),!p)return;(p+"                   ").slice(0,30)+K(i,4)+"";const l=fs(p,h);if(h="",!l.instr){h=l.label;return}if(l.instr==="ORG"||(r===1&&l.label&&Ss(l,i),l.instr==="EQU"))return;let B=[],O,d;if(l.instr==="ASC"||l.instr==="DA"){let y=l.operand,H=0;if(y.startsWith('"')&&y.endsWith('"'))H=128;else if(y.startsWith("'")&&y.endsWith("'"))H=0;else throw new Error("Invalid string: "+y);y=y.substring(1,y.length-1);for(let X=0;X<y.length;X++)B.push(y.charCodeAt(X)|H);B.push(0),i+=y.length+1}else if([O,d]=Hn(i,l.instr,l.operand,r),l.instr==="DB")B.push(d&255),i++;else if(l.instr==="DW")B.push(d&255),B.push(d>>8&255),i+=2;else if(l.instr==="DS")for(let y=0;y<d;y++)B.push(0),i++;else{if(r===2&&VA(l.instr)&&(d<0||d>255))throw new Error(`Branch instruction out of range: ${p} value: ${d} pass: ${r}`);const y=wt.findIndex(H=>H&&H.name===l.instr&&H.mode===O);if(y<0)throw new Error(`Unknown instruction: ${l.instr} mode=${O} pass=${r}`);B=Bs(y,d),i+=wt[y].PC}a.push(...B)}),a},mA=(t,e)=>{De={};try{return vn(t,e,1),vn(t,e,2)}catch(r){return console.error(r),[]}};let me=0;const wA=192,Es=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${K(wA)}   ; jump address
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
`,Ds=`
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
`,ms=()=>{const t=new Uint8Array(256).fill(0),e=mA(0,Es.split(`
`));t.set(e,0);const r=mA(0,Ds.split(`
`));return t.set(r,wA),t[254]=23,t[255]=wA,t};let Ge=new Uint8Array;const _n=(t=!0)=>{Ge.length===0&&(Ge=ms()),Ge[1]=t?32:0;const r=49152+wA+7*256;Be(7,Ge,r,ks),Be(7,Ge,r+3,ws)},ws=()=>{const t=zn();if(!t.hardDrive)return;const e=yA(),r=256+s.StackPtr,i=S(r+1)+256*S(r+2),a=S(i+1),h=S(i+2)+256*S(i+3),p=S(h+1),l=S(h+2)+256*S(h+3);switch(a){case 0:{if(S(h)!==3){console.error(`Incorrect SmartPort parameter count at address ${h}`),Q();return}const B=S(h+4);switch(B){case 0:if(p===0)D(l,1),Q(!1);else if(p===1){const xA=yA().length/512;D(l,240),D(l+1,xA&255),D(l+2,xA>>>8),D(l+3,0),be(4),Ye(0),Q(!1)}else console.error(`SmartPort status for unitNumber ${p} not implemented`),be(0),Ye(0),Q();break;case 3:const y=yA().length/512,H=y>1600?2:1,X=H==2?32:64;D(l+0,240),D(l+1,y&255),D(l+2,y>>>8),D(l+3,0);const Rt="Apple2ts SP";D(l+4,Rt.length);let at=0;for(;at<Rt.length;at++)D(l+5+at,Rt.charCodeAt(at));for(;at<16;at++)D(l+5+at,Rt.charCodeAt(8));D(l+21,H),D(l+22,X),D(l+23,1),D(l+24,0),be(25),Ye(0),Q(!1);break;default:console.error(`SmartPort statusCode ${B} not implemented`),Q();break}return}case 1:{if(S(h)!==3){console.error(`Incorrect SmartPort parameter count at address ${h}`),Q();return}const O=512*(S(h+4)+256*S(h+5)+65536*S(h+6)),d=e.slice(O,O+512);lr(l,d);break}case 2:default:console.error(`SmartPort command ${a} not implemented`),Q();return}Q(!1),t.motorRunning=!0,me||(me=setTimeout(()=>{me=0,t&&(t.motorRunning=!1),pt()},500)),pt()},ks=()=>{const t=zn();if(!t.hardDrive)return;const e=yA(),r=S(70)+256*S(71),i=512*r,a=S(68)+256*S(69),h=e.length;switch(t.status=` ${K(r,4)} ${K(a,4)}`,S(66)){case 0:{if(t.filename.length===0||h===0){be(0),Ye(0),Q();return}const p=h/512;be(p&255),Ye(p>>>8);break}case 1:{if(i+512>h){Q();return}const p=e.slice(i,i+512);lr(a,p);break}case 2:{if(i+512>h){Q();return}const p=Wi(a);e.set(p,i),t.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),Q();return;default:console.error("unknown hard drive command"),Q();return}Q(!1),t.motorRunning=!0,me||(me=setTimeout(()=>{me=0,t&&(t.motorRunning=!1),pt()},500)),pt()},We=t=>({hardDrive:t===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:t>0?Array(80):Array(),trackNbits:t>0?Array(80):Array(),trackLocation:0}),Y=[We(0),We(1),We(2)],Jt=[new Uint8Array,new Uint8Array,new Uint8Array];let xe=1;const ys=t=>{xe=t},kA=()=>Y[xe],Ts=()=>Jt[xe],zn=()=>Y[0],yA=()=>Jt[0],pt=()=>{for(let t=0;t<Y.length;t++){const e={hardDrive:Y[t].hardDrive,drive:t,filename:Y[t].filename,status:Y[t].status,motorRunning:Y[t].motorRunning,diskHasChanges:Y[t].diskHasChanges,diskData:Y[t].diskHasChanges?Jt[t]:new Uint8Array};Oa(e)}},ds=t=>{const e=["","",""];for(let r=t?0:1;r<3;r++)e[r]=st.Buffer.from(Jt[r]).toString("base64");return{currentDrive:xe,driveState:Y,driveData:e}},Rs=t=>{Qe($t.MOTOR_OFF),xe=t.currentDrive;for(let e=0;e<3;e++)Y[e]=We(e),Jt[e]=new Uint8Array;for(let e=0;e<t.driveState.length;e++)Y[e]=t.driveState[e],t.driveData[e]!==""&&(Jt[e]=new Uint8Array(st.Buffer.from(t.driveData[e],"base64")));Y[0].hardDrive&&_n(Y[0].filename!==""),pt()},Qs=()=>{Wn(Y[1]),Wn(Y[2]),pt()},$n=(t=!1)=>{ls(t),pt()},Ps=t=>{let e=t.drive;t.filename!==""&&(Gn(t.filename)?(e=0,Y[0].hardDrive=!0):e===0&&(e=1)),Y[e]=We(e),Y[e].filename=t.filename,Y[e].motorRunning=t.motorRunning,Jt[e]=as(Y[e],t.diskData),Jt[e].length===0&&(Y[e].filename=""),Y[e].hardDrive&&_n(Y[e].filename!==""),pt()},to=`
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
`;class Ms{constructor(){pe(this,"address");pe(this,"disabled");pe(this,"hidden");pe(this,"once");pe(this,"expression");pe(this,"hitcount");this.address=0,this.disabled=!1,this.hidden=!1,this.once=!1,this.expression="",this.hitcount=0}}let Er=!1,Xt=new Map;const TA=()=>{Er=!0},Fs=()=>{new Map(Xt).forEach((i,a)=>{i.once&&Xt.delete(a)});const e=ji();if(e<0||Xt.get(e))return;const r=new Ms;r.address=e,r.once=!0,r.hidden=!0,Xt.set(e,r)},Us=t=>{Xt=t},Dr=(t=0,e=!0)=>{e?s.flagIRQ|=1<<t:s.flagIRQ&=~(1<<t),s.flagIRQ&=255},Ks=(t=!0)=>{s.flagNMI=t===!0},Ls=()=>{s.flagIRQ=0,s.flagNMI=!1},mr=[],eo=[],qs=(t,e)=>{mr.push(t),eo.push(e)},bs=()=>{for(let t=0;t<mr.length;t++)mr[t](eo[t])},wr=(t=!1)=>{let e=0;const r=s.PC,i=S(s.PC),a=S(s.PC+1),h=S(s.PC+2),p=wt[i];if(Xt.size>0&&!t){const B=Xt.get(r);if(B&&!B.disabled&&!Er)return B.once&&Xt.delete(r),Dt(U.PAUSED),-1}Er=!1;const l=Sn.get(r);if(l&&!E.INTCXROM.isSet&&l(),e=p.execute(a,h),yn(p.PC),sA(s.cycleCount+e),bs(),s.flagNMI&&(s.flagNMI=!1,e=_i(),sA(s.cycleCount+e)),s.flagIRQ){const B=vi();B>0&&(sA(s.cycleCount+B),e=B)}return e},kr=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let yr=1,Tr=0,dr=0;const Ys=(t=!0,e=1)=>{if(!t)return;yr=e;const r=new Uint8Array(kr.length+256);r.set(kr.slice(1792,2048)),r.set(kr,256),Be(yr,r),iA(yr,Gs)};let dA=new Uint8Array(0),RA=-1;const Os=t=>{const e=new Uint8Array(dA.length+t.length);e.set(t),e.set(dA,t.length),dA=e,RA+=t.length},Ns=t=>{const e=new Uint8Array(1).fill(t);Wa(e)},Gs=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Ns(e);else return RA>=0?dA[RA--]:0;break;case r.STATUS:if(e>=0)console.log("SSC RESET"),Tr=2,dr=0;else{let i=16;return i|=RA>=0?8:0,i}break;case r.COMMAND:if(e>=0){console.log("SSC COMMAND: 0x"+e.toString(16)),Tr=e;break}else return Tr;case r.CONTROL:if(e>=0){console.log("SSC CONTROL: 0x"+e.toString(16)),dr=e;break}else return dr;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},Ze=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Ws=()=>{const t=new Date,e=Ze(t.getMonth()+1,2)+","+Ze(t.getDay(),2)+","+Ze(t.getDate(),2)+","+Ze(t.getHours(),2)+","+Ze(t.getMinutes(),2);for(let r=0;r<e.length;r++)D(512+r,e.charCodeAt(r)|128)},xs=`
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
;     | | | | | | | ---  Previously, button 1 was up (0) or down (1)
;     | | | | | | -----  Movement interrupt
;     | | | | | -------  Button 0/1 interrupt
;     | | | | ---------  VBL interrupt
;     | | | -----------  Currently, button 1 is up (0) or down (1)
;     | | -------------  X/Y moved since last READMOUSE
;     | ---------------  Previously, button 0 was up (0) or down (1)
;     -----------------  Currently, button 0 is up (0) or down (1)
; 
; (Button 1 is not physically present on the mouse, and is probably only
; supported for an ADB mouse on the IIgs.)
; 
; 
; The mode byte is defined as follows.
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | ---  Mouse off (0) or on (1)
;     | | | | | | -----  Interrupt if mouse is moved
;     | | | | | -------  Interrupt if button is pressed
;     | | | | ---------  Interrupt on VBL
;     | | | -----------  Reserved
;     | | -------------  Reserved
;     | ---------------  Reserved
;     -----------------  Reserved
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
`,Ao=()=>{Bt=0,Et=0,Ut=0,Kt=0,ue=1023,Ie=1023,FA(0),_=0,jt=0,we=0,Je=0,Xe=0,ot=0,kt=0,ke=0,QA=0};let Bt=0,Et=0,Ut=0,Kt=0,ue=1023,Ie=1023,QA=0,Vt=0,_=0,jt=0,we=0,Je=0,Xe=0,ot=0,kt=0,ke=0,ro=0,yt=5;const PA=54,MA=55,Zs=56,Js=57,no=()=>{const t=new Uint8Array(256).fill(0),e=mA(0,xs.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},Xs=(t=!0,e=5)=>{if(!t)return;yt=e;const r=49152+yt*256,i=49152+yt*256+8;Be(yt,no(),r,Hs),Be(yt,no(),i,Ws),iA(yt,zs),Ao()},FA=t=>{Vt=t,Fo(!t)},Vs=()=>{if(Vt&1){let t=!1;Vt&8&&(ke|=8,t=!0),Vt&jt&4&&(ke|=4,t=!0),Vt&jt&2&&(ke|=2,t=!0),t&&Dr(yt,!0)}},js=t=>{if(Vt&1)if(t.buttons>=0){switch(t.buttons){case 0:_&=-129;break;case 16:_|=128;break;case 1:_&=-17;break;case 17:_|=16;break}jt|=_&128?4:0}else t.x>=0&&t.x<=1&&(Bt=Math.round((ue-Ut)*t.x+Ut),jt|=2),t.y>=0&&t.y<=1&&(Et=Math.round((Ie-Kt)*t.y+Kt),jt|=2)};let Ve=0,Rr="",oo=0,io=0;const Hs=()=>{const t=192+yt;S(MA)===t&&S(PA)===0?_s():S(Js)===t&&S(Zs)===0&&vs()},vs=()=>{if(Ve===0){const t=192+yt;oo=S(MA),io=S(PA),D(MA,t),D(PA,3);const e=(_&128)!==(we&128);let r=0;_&128?r=e?2:1:r=e?3:4,S(49152)&128&&(r=-r),we=_,Rr=Bt.toString()+","+Et.toString()+","+r.toString()}Ve>=Rr.length?(s.Accum=141,Ve=0,D(MA,oo),D(PA,io)):(s.Accum=Rr.charCodeAt(Ve)|128,Ve++)},_s=()=>{switch(s.Accum){case 128:console.log("mouse off"),FA(0);break;case 129:console.log("mouse on"),FA(1);break}},zs=(t,e)=>{if(t>=49408)return-1;const r=e<0,i={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case i.LOWX:if(r===!1)ot=ot&65280|e,ot&=65535;else return Bt&255;break;case i.HIGHX:if(r===!1)ot=e<<8|ot&255,ot&=65535;else return Bt>>8&255;break;case i.LOWY:if(r===!1)kt=kt&65280|e,kt&=65535;else return Et&255;break;case i.HIGHY:if(r===!1)kt=e<<8|kt&255,kt&=65535;else return Et>>8&255;break;case i.STATUS:return _;case i.MODE:if(r===!1)FA(e),console.log("Mouse mode: 0x",Vt.toString(16));else return Vt;break;case i.CLAMP:if(r===!1)QA=78-e;else switch(QA){case 0:return Ut>>8&255;case 1:return Kt>>8&255;case 2:return Ut&255;case 3:return Kt&255;case 4:return ue>>8&255;case 5:return Ie>>8&255;case 6:return ue&255;case 7:return Ie&255;default:return console.log("AppleMouse: invalid clamp index: "+QA),0}break;case i.CLOCK:case i.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case i.COMMAND:if(r===!1)switch(ro=e,e){case a.INIT:console.log("cmd.init"),Bt=0,Et=0,Je=0,Xe=0,Ut=0,Kt=0,ue=1023,Ie=1023,_=0,jt=0;break;case a.READ:jt=0,_&=-112,_|=we>>1&64,_|=we>>4&1,we=_,(Je!==Bt||Xe!==Et)&&(_|=32),Je=Bt,Xe=Et;break;case a.CLEAR:console.log("cmd.clear"),Bt=0,Et=0,Je=0,Xe=0;break;case a.SERVE:_&=-15,_|=ke,ke=0,Dr(yt,!1);break;case a.HOME:console.log("cmd.home"),Bt=Ut,Et=Kt;break;case a.CLAMPX:console.log("cmd.clampx"),Ut=ot>32767?ot-65536:ot,ue=kt,console.log(Ut+" -> "+ue);break;case a.CLAMPY:console.log("cmd.clampy"),Kt=ot>32767?ot-65536:ot,Ie=kt,console.log(Kt+" -> "+Ie);break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:console.log("cmd.pos"),Bt=ot,Et=kt;break}else return ro;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},so=(t=!0,e=4)=>{t&&(iA(e,ha),qs(ca,e))},Qr=[0,128],Pr=[1,129],$s=[2,130],ta=[3,131],ye=[4,132],Te=[5,133],UA=[6,134],Mr=[7,135],je=[8,136],He=[9,137],ea=[10,138],Fr=[11,139],Aa=[12,140],ge=[13,141],ve=[14,142],ao=[16,145],co=[17,145],Tt=[18,146],Ur=[32,160],Lt=64,Ht=32,lo=(t=4)=>{for(let e=0;e<=255;e++)P(t,e,0);for(let e=0;e<=1;e++)Kr(t,e)},ra=(t,e)=>(q(t,ve[e])&Lt)!==0,na=(t,e)=>(q(t,Tt[e])&Lt)!==0,uo=(t,e)=>(q(t,Fr[e])&Lt)!==0,oa=(t,e,r)=>{let i=q(t,ye[e])-r;if(P(t,ye[e],i),i<0){i=i%256+256,P(t,ye[e],i);let a=q(t,Te[e]);if(a--,P(t,Te[e],a),a<0&&(a+=256,P(t,Te[e],a),ra(t,e)&&(!na(t,e)||uo(t,e)))){const h=q(t,Tt[e]);P(t,Tt[e],h|Lt);const p=q(t,ge[e]);if(P(t,ge[e],p|Lt),vt(t,e,-1),uo(t,e)){const l=q(t,Mr[e]),B=q(t,UA[e]);P(t,ye[e],B),P(t,Te[e],l)}}}},ia=(t,e)=>(q(t,ve[e])&Ht)!==0,sa=(t,e)=>(q(t,Tt[e])&Ht)!==0,aa=(t,e,r)=>{if(q(t,Fr[e])&Ht)return;let i=q(t,je[e])-r;if(P(t,je[e],i),i<0){i=i%256+256,P(t,je[e],i);let a=q(t,He[e]);if(a--,P(t,He[e],a),a<0&&(a+=256,P(t,He[e],a),ia(t,e)&&!sa(t,e))){const h=q(t,Tt[e]);P(t,Tt[e],h|Ht);const p=q(t,ge[e]);P(t,ge[e],p|Ht),vt(t,e,-1)}}},Io=new Array(8).fill(0),ca=t=>{const e=s.cycleCount-Io[t];for(let r=0;r<=1;r++)oa(t,r,e),aa(t,r,e);Io[t]=s.cycleCount},la=(t,e)=>{const r=[];for(let i=0;i<=15;i++)r[i]=q(t,Ur[e]+i);return r},ua=(t,e)=>t.length===e.length&&t.every((r,i)=>r===e[i]),de={slot:-1,chip:-1,params:[-1]};let Kr=(t,e)=>{const r=la(t,e);t===de.slot&&e===de.chip&&ua(r,de.params)||(de.slot=t,de.chip=e,de.params=r,Ga({slot:t,chip:e,params:r}))};const Ia=(t,e)=>{switch(q(t,Qr[e])&7){case 0:for(let i=0;i<=15;i++)P(t,Ur[e]+i,0);Kr(t,e);break;case 7:P(t,co[e],q(t,Pr[e]));break;case 6:{const i=q(t,co[e]),a=q(t,Pr[e]);i>=0&&i<=15&&(P(t,Ur[e]+i,a),Kr(t,e));break}}},vt=(t,e,r)=>{let i=q(t,ge[e]);switch(r>=0&&(i&=127-(r&127),P(t,ge[e],i)),e){case 0:Dr(t,i!==0);break;case 1:Ks(i!==0);break}},ga=(t,e,r)=>{let i=q(t,ve[e]);r>=0&&(r=r&255,r&128?i|=r:i&=255-r),i|=128,P(t,ve[e],i)},ha=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,i=t&255,a=i&128?1:0;switch(i){case Qr[a]:e>=0&&(P(r,Qr[a],e),Ia(r,a));break;case Pr[a]:case $s[a]:case ta[a]:case ea[a]:case Fr[a]:case Aa[a]:P(r,i,e);break;case ye[a]:e>=0&&P(r,UA[a],e),vt(r,a,Lt);break;case Te[a]:if(e>=0){P(r,Mr[a],e),P(r,ye[a],q(r,UA[a])),P(r,Te[a],e);const h=q(r,Tt[a]);P(r,Tt[a],h&~Lt),vt(r,a,Lt)}break;case UA[a]:e>=0&&(P(r,i,e),vt(r,a,Lt));break;case Mr[a]:e>=0&&P(r,i,e);break;case je[a]:e>=0&&P(r,ao[a],e),vt(r,a,Ht);break;case He[a]:if(e>=0){P(r,He[a],e),P(r,je[a],q(r,ao[a]));const h=q(r,Tt[a]);P(r,Tt[a],h&~Ht),vt(r,a,Ht)}break;case ge[a]:e>=0&&vt(r,a,e);break;case ve[a]:ga(r,a,e);break}return-1},KA=40,pa=(t,e)=>t+2+(e>127?e-256:e),Ca=(t,e,r,i)=>{let a="",h=`${K(e.pcode)}`,p="",l="";switch(e.PC){case 1:h+="      ";break;case 2:p=K(r),h+=` ${p}   `;break;case 3:p=K(r),l=K(i),h+=` ${p} ${l}`;break}const B=VA(e.name)?K(pa(t,r)):p;switch(e.mode){case u.IMPLIED:break;case u.IMM:a=` #$${p}`;break;case u.ZP_REL:a=` $${B}`;break;case u.ZP_X:a=` $${p},X`;break;case u.ZP_Y:a=` $${p},Y`;break;case u.ABS:a=` $${l}${p}`;break;case u.ABS_X:a=` $${l}${p},X`;break;case u.ABS_Y:a=` $${l}${p},Y`;break;case u.IND_X:a=` ($${l.trim()}${p},X)`;break;case u.IND_Y:a=` ($${p}),Y`;break;case u.IND:a=` ($${l.trim()}${p})`;break}return`${K(t,4)}: ${h}  ${e.name}${a}`},fa=t=>{let e=t;e>65535-KA&&(e=65535-KA);let r="";for(let i=0;i<2*KA;i++){if(e>65535){r+=`
`;continue}const a=qe(e),h=wt[a],p=qe(e+1),l=qe(e+2);r+=Ca(e,h,p,l)+`
`,e+=h.PC}return r},Sa=(t,e)=>{if(e<t||t<0)return!1;let r=t;for(let i=0;i<KA;i++){if(r===e)return!0;const a=qe(r);if(r+=wt[a].PC,r>65535)break}return!1},Ba=t=>{const e=qe(t);return wt[e].name};let go=0,LA=0,ho=!0,qA=0,Lr=!0,_t=-1,po=16.6881,Co=0,z=U.IDLE,Re=0,bA=!1,Ct=0;const fo=60,$=[];let YA=!1;const Ea=()=>{YA=!0,Vs()},Da=()=>{YA=!1},ma=()=>{const t=JSON.parse(JSON.stringify(s)),e={};for(const i in E)e[i]=E[i].isSet;const r=st.Buffer.from(L);return{s6502:t,softSwitches:e,memory:r.toString("base64")}},wa=t=>{const e=JSON.parse(JSON.stringify(t.s6502));wn(e);const r=t.softSwitches;for(const i in r){const a=i;try{E[a].isSet=r[i]}catch{}}L.set(st.Buffer.from(t.memory,"base64")),ae(),an(!0)},So=(t=!1)=>({emulator:null,state6502:ma(),driveState:ds(t)}),ka=t=>{t.PC!==s.PC&&(_t=t.PC),wn(t),_e()},OA=t=>{qr(),wa(t.state6502),Rs(t.driveState),_t=s.PC,_e()};let Bo=!1;const Eo=()=>{Bo||(Bo=!0,Ys(),Xs(!0,2),so(!0,4),so(!0,5),ps())},ya=()=>{Qs(),Ar(),Ao(),lo(4),lo(5)},NA=()=>{if(sA(0),Yi(),Eo(),to.length>0){const t=mA(768,to.split(`
`));L.set(t,768)}qr()},qr=()=>{Ls();for(const t in E){const e=t;E[e].isSet=!1}E.TEXT.isSet=!0,S(49282),kn(),ya()},Ta=t=>{ho=t,po=ho?16.6881:0,Ro()},da=t=>{Lr=t},Ra=t=>{_t=t,_e(),t===U.PAUSED&&(_t=s.PC)},Do=()=>{const t=Ct-1;return t<0||!$[t]?-1:t},mo=()=>{const t=Ct+1;return t>=$.length||!$[t]?-1:t},wo=()=>{$.length===fo&&$.shift(),$.push(So()),Ct=$.length},Qa=()=>{let t=Do();t<0||(Dt(U.PAUSED),setTimeout(()=>{Ct===$.length&&(wo(),t=Math.max(Ct-2,0)),Ct=t,OA($[Ct])},50))},Pa=()=>{const t=mo();t<0||(Dt(U.PAUSED),setTimeout(()=>{Ct=t,OA($[t])},50))},Ma=t=>{t<0||t>=$.length||(Dt(U.PAUSED),setTimeout(()=>{Ct=t,OA($[t])},50))},Fa=()=>{const t=[];for(let e=0;e<$.length;e++)t[e]={s6502:$[e].state6502.s6502};return t};let GA=null;const ko=(t=!1)=>{GA&&clearTimeout(GA),t?GA=setTimeout(()=>{bA=!0,GA=null},100):bA=!0},yo=()=>{TA(),z===U.IDLE&&(NA(),z=U.PAUSED),wr(!0),Dt(U.PAUSED)},Ua=()=>{TA(),z===U.IDLE&&(NA(),z=U.PAUSED),S(s.PC)===32?(wr(!0),To()):yo()},To=()=>{TA(),z===U.IDLE&&(NA(),z=U.PAUSED),Fs(),Dt(U.RUNNING)},Ro=()=>{Re=0,LA=performance.now(),go=LA},Dt=t=>{if(Eo(),z=t,z===U.PAUSED)$n(),Sa(_t,s.PC)||(_t=s.PC);else if(z===U.RUNNING){for($n(!0),TA();$.length>0&&Ct<$.length-1;)$.pop();Ct=$.length}_e(),Ro(),qA===0&&(qA=1,ko(),Po())},Ka=(t,e,r)=>{const i=()=>{lr(t,e),r&&mt(t)};z===U.IDLE?(Dt(U.NEED_BOOT),setTimeout(()=>{Dt(U.NEED_RESET),setTimeout(()=>{i()},200)},200)):i()},La=()=>{if(!Lr)return"";const t=[Xi()];t.push(xi());const e=Vi();for(let r=0;r<Math.min(20,e.length);r++)t.push(e[r]);return t.join(`
`)},qa=()=>z===U.RUNNING?"":fa(_t>=0?_t:s.PC),_e=()=>{const t={runMode:z,s6502:s,speed:qA,altChar:E.ALTCHARSET.isSet,noDelayMode:!E.COLUMN80.isSet&&!E.AN3.isSet,textPage:cr(),lores:cr(!0),hires:Gi(),debugDump:La(),disassembly:qa(),nextInstruction:Ba(s.PC),button0:E.PB0.isSet,button1:E.PB1.isSet,canGoBackward:Do()>=0,canGoForward:mo()>=0,maxState:fo,iTempState:Ct,timeTravelThumbnails:Fa()};ba(t)},Qo=()=>{const t=performance.now();if(Co=t-LA,Co<po||(LA=t,z===U.IDLE||z===U.PAUSED))return;z===U.NEED_BOOT?(NA(),Dt(U.RUNNING)):z===U.NEED_RESET&&(qr(),Dt(U.RUNNING));let e=0;for(;;){const r=wr();if(r<0)break;if(e+=r,e>=12480&&YA===!1&&Ea(),e>=17030){Da();break}}Re++,qA=Math.round(Re*1703/(performance.now()-go))/100,Re%2&&(ci(),_e()),bA&&(bA=!1,wo())},Po=()=>{Qo();const t=Re+1;for(;z===U.RUNNING&&Re!==t;)Qo();setTimeout(Po,z===U.RUNNING?0:20)},dt=(t,e)=>{self.postMessage({msg:t,payload:e})},ba=t=>{dt(ft.MACHINE_STATE,t)},Ya=t=>{dt(ft.CLICK,t)},Oa=t=>{dt(ft.DRIVE_PROPS,t)},Qe=t=>{dt(ft.DRIVE_SOUND,t)},Na=t=>{dt(ft.SAVE_STATE,t)},br=t=>{dt(ft.RUMBLE,t)},Mo=t=>{dt(ft.HELP_TEXT,t)},Fo=t=>{dt(ft.SHOW_MOUSE,t)},Ga=t=>{dt(ft.MBOARD_SOUND,t)},Wa=t=>{dt(ft.COMM_DATA,t)};self.onmessage=t=>{switch(t.data.msg){case G.RUN_MODE:Dt(t.data.payload);break;case G.STATE6502:ka(t.data.payload);break;case G.DEBUG:da(t.data.payload);break;case G.DISASSEMBLE_ADDR:Ra(t.data.payload);break;case G.BREAKPOINTS:Us(t.data.payload);break;case G.STEP_INTO:yo();break;case G.STEP_OVER:Ua();break;case G.STEP_OUT:To();break;case G.SPEED:Ta(t.data.payload);break;case G.TIME_TRAVEL:t.data.payload==="FORWARD"?Pa():Qa();break;case G.TIME_TRAVEL_INDEX:Ma(t.data.payload);break;case G.RESTORE_STATE:OA(t.data.payload);break;case G.KEYPRESS:yi(t.data.payload);break;case G.MOUSEEVENT:js(t.data.payload);break;case G.PASTE_TEXT:Ti(t.data.payload);break;case G.APPLE_PRESS:tn(!0,t.data.payload);break;case G.APPLE_RELEASE:tn(!1,t.data.payload);break;case G.GET_SAVE_STATE:Na(So(!0));break;case G.DRIVE_PROPS:{const e=t.data.payload;Ps(e);break}case G.GAMEPAD:si(t.data.payload);break;case G.SET_BINARY_BLOCK:{const e=t.data.payload;Ka(e.address,e.data,e.run);break}case G.COMM_DATA:Os(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${t.data.msg}`);break}}})();
