var A0=Object.defineProperty;var a0=(oe,Ut,Le)=>Ut in oe?A0(oe,Ut,{enumerable:!0,configurable:!0,writable:!0,value:Le}):oe[Ut]=Le;var P=(oe,Ut,Le)=>a0(oe,typeof Ut!="symbol"?Ut+"":Ut,Le);(function(){"use strict";var oe={},Ut={},Le;function pA(){if(Le)return Ut;Le=1,Ut.byteLength=u,Ut.toByteArray=G,Ut.fromByteArray=q;for(var t=[],e=[],r=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,h=s.length;a<h;++a)t[a]=s[a],e[s.charCodeAt(a)]=a;e[45]=62,e[95]=63;function S(w){var F=w.length;if(F%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var J=w.indexOf("=");J===-1&&(J=F);var st=J===F?0:4-J%4;return[J,st]}function u(w){var F=S(w),J=F[0],st=F[1];return(J+st)*3/4-st}function D(w,F,J){return(F+J)*3/4-J}function G(w){var F,J=S(w),st=J[0],Bt=J[1],at=new r(D(w,st,Bt)),mt=0,re=Bt>0?st-4:st,ct;for(ct=0;ct<re;ct+=4)F=e[w.charCodeAt(ct)]<<18|e[w.charCodeAt(ct+1)]<<12|e[w.charCodeAt(ct+2)]<<6|e[w.charCodeAt(ct+3)],at[mt++]=F>>16&255,at[mt++]=F>>8&255,at[mt++]=F&255;return Bt===2&&(F=e[w.charCodeAt(ct)]<<2|e[w.charCodeAt(ct+1)]>>4,at[mt++]=F&255),Bt===1&&(F=e[w.charCodeAt(ct)]<<10|e[w.charCodeAt(ct+1)]<<4|e[w.charCodeAt(ct+2)]>>2,at[mt++]=F>>8&255,at[mt++]=F&255),at}function y(w){return t[w>>18&63]+t[w>>12&63]+t[w>>6&63]+t[w&63]}function Z(w,F,J){for(var st,Bt=[],at=F;at<J;at+=3)st=(w[at]<<16&16711680)+(w[at+1]<<8&65280)+(w[at+2]&255),Bt.push(y(st));return Bt.join("")}function q(w){for(var F,J=w.length,st=J%3,Bt=[],at=16383,mt=0,re=J-st;mt<re;mt+=at)Bt.push(Z(w,mt,mt+at>re?re:mt+at));return st===1?(F=w[J-1],Bt.push(t[F>>2]+t[F<<4&63]+"==")):st===2&&(F=(w[J-2]<<8)+w[J-1],Bt.push(t[F>>10]+t[F>>4&63]+t[F<<2&63]+"=")),Bt.join("")}return Ut}var Yr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */var es;function gA(){return es||(es=1,Yr.read=function(t,e,r,s,a){var h,S,u=a*8-s-1,D=(1<<u)-1,G=D>>1,y=-7,Z=r?a-1:0,q=r?-1:1,w=t[e+Z];for(Z+=q,h=w&(1<<-y)-1,w>>=-y,y+=u;y>0;h=h*256+t[e+Z],Z+=q,y-=8);for(S=h&(1<<-y)-1,h>>=-y,y+=s;y>0;S=S*256+t[e+Z],Z+=q,y-=8);if(h===0)h=1-G;else{if(h===D)return S?NaN:(w?-1:1)*(1/0);S=S+Math.pow(2,s),h=h-G}return(w?-1:1)*S*Math.pow(2,h-s)},Yr.write=function(t,e,r,s,a,h){var S,u,D,G=h*8-a-1,y=(1<<G)-1,Z=y>>1,q=a===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=s?0:h-1,F=s?1:-1,J=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,S=y):(S=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-S))<1&&(S--,D*=2),S+Z>=1?e+=q/D:e+=q*Math.pow(2,1-Z),e*D>=2&&(S++,D/=2),S+Z>=y?(u=0,S=y):S+Z>=1?(u=(e*D-1)*Math.pow(2,a),S=S+Z):(u=e*Math.pow(2,Z-1)*Math.pow(2,a),S=0));a>=8;t[r+w]=u&255,w+=F,u/=256,a-=8);for(S=S<<a|u,G+=a;G>0;t[r+w]=S&255,w+=F,S/=256,G-=8);t[r+w-F]|=J*128}),Yr}/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var rs;function SA(){return rs||(rs=1,function(t){const e=pA(),r=gA(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=at,t.INSPECT_MAX_BYTES=50;const a=2147483647;t.kMaxLength=a,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const A=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(A,n),A.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function S(A){if(A>a)throw new RangeError('The value "'+A+'" is invalid for option "size"');const n=new Uint8Array(A);return Object.setPrototypeOf(n,u.prototype),n}function u(A,n,o){if(typeof A=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return Z(A)}return D(A,n,o)}u.poolSize=8192;function D(A,n,o){if(typeof A=="string")return q(A,n);if(ArrayBuffer.isView(A))return F(A);if(A==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof A);if(ne(A,ArrayBuffer)||A&&ne(A.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(ne(A,SharedArrayBuffer)||A&&ne(A.buffer,SharedArrayBuffer)))return J(A,n,o);if(typeof A=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=A.valueOf&&A.valueOf();if(l!=null&&l!==A)return u.from(l,n,o);const f=st(A);if(f)return f;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof A[Symbol.toPrimitive]=="function")return u.from(A[Symbol.toPrimitive]("string"),n,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof A)}u.from=function(A,n,o){return D(A,n,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function G(A){if(typeof A!="number")throw new TypeError('"size" argument must be of type number');if(A<0)throw new RangeError('The value "'+A+'" is invalid for option "size"')}function y(A,n,o){return G(A),A<=0?S(A):n!==void 0?typeof o=="string"?S(A).fill(n,o):S(A).fill(n):S(A)}u.alloc=function(A,n,o){return y(A,n,o)};function Z(A){return G(A),S(A<0?0:Bt(A)|0)}u.allocUnsafe=function(A){return Z(A)},u.allocUnsafeSlow=function(A){return Z(A)};function q(A,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const o=mt(A,n)|0;let l=S(o);const f=l.write(A,n);return f!==o&&(l=l.slice(0,f)),l}function w(A){const n=A.length<0?0:Bt(A.length)|0,o=S(n);for(let l=0;l<n;l+=1)o[l]=A[l]&255;return o}function F(A){if(ne(A,Uint8Array)){const n=new Uint8Array(A);return J(n.buffer,n.byteOffset,n.byteLength)}return w(A)}function J(A,n,o){if(n<0||A.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(A.byteLength<n+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&o===void 0?l=new Uint8Array(A):o===void 0?l=new Uint8Array(A,n):l=new Uint8Array(A,n,o),Object.setPrototypeOf(l,u.prototype),l}function st(A){if(u.isBuffer(A)){const n=Bt(A.length)|0,o=S(n);return o.length===0||A.copy(o,0,0,n),o}if(A.length!==void 0)return typeof A.length!="number"||ts(A.length)?S(0):w(A);if(A.type==="Buffer"&&Array.isArray(A.data))return w(A.data)}function Bt(A){if(A>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return A|0}function at(A){return+A!=A&&(A=0),u.alloc(+A)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,o){if(ne(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),ne(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(n)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===o)return 0;let l=n.length,f=o.length;for(let C=0,E=Math.min(l,f);C<E;++C)if(n[C]!==o[C]){l=n[C],f=o[C];break}return l<f?-1:f<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,o){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<n.length;++l)o+=n[l].length;const f=u.allocUnsafe(o);let C=0;for(l=0;l<n.length;++l){let E=n[l];if(ne(E,Uint8Array))C+E.length>f.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(f,C)):Uint8Array.prototype.set.call(f,E,C);else if(u.isBuffer(E))E.copy(f,C);else throw new TypeError('"list" argument must be an Array of Buffers');C+=E.length}return f};function mt(A,n){if(u.isBuffer(A))return A.length;if(ArrayBuffer.isView(A)||ne(A,ArrayBuffer))return A.byteLength;if(typeof A!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof A);const o=A.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let f=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return $o(A).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return fA(A).length;default:if(f)return l?-1:$o(A).length;n=(""+n).toLowerCase(),f=!0}}u.byteLength=mt;function re(A,n,o){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,n>>>=0,o<=n))return"";for(A||(A="utf8");;)switch(A){case"hex":return zo(this,n,o);case"utf8":case"utf-8":return Ge(this,n,o);case"ascii":return kt(this,n,o);case"latin1":case"binary":return cr(this,n,o);case"base64":return Nr(this,n,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Zn(this,n,o);default:if(l)throw new TypeError("Unknown encoding: "+A);A=(A+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function ct(A,n,o){const l=A[n];A[n]=A[o],A[o]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<n;o+=2)ct(this,o,o+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<n;o+=4)ct(this,o,o+3),ct(this,o+1,o+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<n;o+=8)ct(this,o,o+7),ct(this,o+1,o+6),ct(this,o+2,o+5),ct(this,o+3,o+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?Ge(this,0,n):re.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const o=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(n+=" ... "),"<Buffer "+n+">"},s&&(u.prototype[s]=u.prototype.inspect),u.prototype.compare=function(n,o,l,f,C){if(ne(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(o===void 0&&(o=0),l===void 0&&(l=n?n.length:0),f===void 0&&(f=0),C===void 0&&(C=this.length),o<0||l>n.length||f<0||C>this.length)throw new RangeError("out of range index");if(f>=C&&o>=l)return 0;if(f>=C)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,f>>>=0,C>>>=0,this===n)return 0;let E=C-f,U=l-o;const ht=Math.min(E,U),it=this.slice(f,C),It=n.slice(o,l);for(let et=0;et<ht;++et)if(it[et]!==It[et]){E=it[et],U=It[et];break}return E<U?-1:U<E?1:0};function ar(A,n,o,l,f){if(A.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,ts(o)&&(o=f?0:A.length-1),o<0&&(o=A.length+o),o>=A.length){if(f)return-1;o=A.length-1}else if(o<0)if(f)o=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:Kr(A,n,o,l,f);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?f?Uint8Array.prototype.indexOf.call(A,n,o):Uint8Array.prototype.lastIndexOf.call(A,n,o):Kr(A,[n],o,l,f);throw new TypeError("val must be string, number or Buffer")}function Kr(A,n,o,l,f){let C=1,E=A.length,U=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(A.length<2||n.length<2)return-1;C=2,E/=2,U/=2,o/=2}function ht(It,et){return C===1?It[et]:It.readUInt16BE(et*C)}let it;if(f){let It=-1;for(it=o;it<E;it++)if(ht(A,it)===ht(n,It===-1?0:it-It)){if(It===-1&&(It=it),it-It+1===U)return It*C}else It!==-1&&(it-=it-It),It=-1}else for(o+U>E&&(o=E-U),it=o;it>=0;it--){let It=!0;for(let et=0;et<U;et++)if(ht(A,it+et)!==ht(n,et)){It=!1;break}if(It)return it}return-1}u.prototype.includes=function(n,o,l){return this.indexOf(n,o,l)!==-1},u.prototype.indexOf=function(n,o,l){return ar(this,n,o,l,!0)},u.prototype.lastIndexOf=function(n,o,l){return ar(this,n,o,l,!1)};function _n(A,n,o,l){o=Number(o)||0;const f=A.length-o;l?(l=Number(l),l>f&&(l=f)):l=f;const C=n.length;l>C/2&&(l=C/2);let E;for(E=0;E<l;++E){const U=parseInt(n.substr(E*2,2),16);if(ts(U))return E;A[o+E]=U}return E}function jo(A,n,o,l){return Jn($o(n,A.length-o),A,o,l)}function qr(A,n,o,l){return Jn(n0(n),A,o,l)}function Ho(A,n,o,l){return Jn(fA(n),A,o,l)}function Gn(A,n,o,l){return Jn(o0(n,A.length-o),A,o,l)}u.prototype.write=function(n,o,l,f){if(o===void 0)f="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")f=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,f===void 0&&(f="utf8")):(f=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const C=this.length-o;if((l===void 0||l>C)&&(l=C),n.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");f||(f="utf8");let E=!1;for(;;)switch(f){case"hex":return _n(this,n,o,l);case"utf8":case"utf-8":return jo(this,n,o,l);case"ascii":case"latin1":case"binary":return qr(this,n,o,l);case"base64":return Ho(this,n,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Gn(this,n,o,l);default:if(E)throw new TypeError("Unknown encoding: "+f);f=(""+f).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Nr(A,n,o){return n===0&&o===A.length?e.fromByteArray(A):e.fromByteArray(A.slice(n,o))}function Ge(A,n,o){o=Math.min(A.length,o);const l=[];let f=n;for(;f<o;){const C=A[f];let E=null,U=C>239?4:C>223?3:C>191?2:1;if(f+U<=o){let ht,it,It,et;switch(U){case 1:C<128&&(E=C);break;case 2:ht=A[f+1],(ht&192)===128&&(et=(C&31)<<6|ht&63,et>127&&(E=et));break;case 3:ht=A[f+1],it=A[f+2],(ht&192)===128&&(it&192)===128&&(et=(C&15)<<12|(ht&63)<<6|it&63,et>2047&&(et<55296||et>57343)&&(E=et));break;case 4:ht=A[f+1],it=A[f+2],It=A[f+3],(ht&192)===128&&(it&192)===128&&(It&192)===128&&(et=(C&15)<<18|(ht&63)<<12|(it&63)<<6|It&63,et>65535&&et<1114112&&(E=et))}}E===null?(E=65533,U=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),f+=U}return vo(l)}const Ze=4096;function vo(A){const n=A.length;if(n<=Ze)return String.fromCharCode.apply(String,A);let o="",l=0;for(;l<n;)o+=String.fromCharCode.apply(String,A.slice(l,l+=Ze));return o}function kt(A,n,o){let l="";o=Math.min(A.length,o);for(let f=n;f<o;++f)l+=String.fromCharCode(A[f]&127);return l}function cr(A,n,o){let l="";o=Math.min(A.length,o);for(let f=n;f<o;++f)l+=String.fromCharCode(A[f]);return l}function zo(A,n,o){const l=A.length;(!n||n<0)&&(n=0),(!o||o<0||o>l)&&(o=l);let f="";for(let C=n;C<o;++C)f+=s0[A[C]];return f}function Zn(A,n,o){const l=A.slice(n,o);let f="";for(let C=0;C<l.length-1;C+=2)f+=String.fromCharCode(l[C]+l[C+1]*256);return f}u.prototype.slice=function(n,o){const l=this.length;n=~~n,o=o===void 0?l:~~o,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<n&&(o=n);const f=this.subarray(n,o);return Object.setPrototypeOf(f,u.prototype),f};function g(A,n,o){if(A%1!==0||A<0)throw new RangeError("offset is not uint");if(A+n>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||g(n,o,this.length);let f=this[n],C=1,E=0;for(;++E<o&&(C*=256);)f+=this[n+E]*C;return f},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||g(n,o,this.length);let f=this[n+--o],C=1;for(;o>0&&(C*=256);)f+=this[n+--o]*C;return f},u.prototype.readUint8=u.prototype.readUInt8=function(n,o){return n=n>>>0,o||g(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,o){return n=n>>>0,o||g(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,o){return n=n>>>0,o||g(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,o){return n=n>>>0,o||g(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,o){return n=n>>>0,o||g(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=Pe(function(n){n=n>>>0,lr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Or(n,this.length-8);const f=o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,C=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(f)+(BigInt(C)<<BigInt(32))}),u.prototype.readBigUInt64BE=Pe(function(n){n=n>>>0,lr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Or(n,this.length-8);const f=o*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],C=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(f)<<BigInt(32))+BigInt(C)}),u.prototype.readIntLE=function(n,o,l){n=n>>>0,o=o>>>0,l||g(n,o,this.length);let f=this[n],C=1,E=0;for(;++E<o&&(C*=256);)f+=this[n+E]*C;return C*=128,f>=C&&(f-=Math.pow(2,8*o)),f},u.prototype.readIntBE=function(n,o,l){n=n>>>0,o=o>>>0,l||g(n,o,this.length);let f=o,C=1,E=this[n+--f];for(;f>0&&(C*=256);)E+=this[n+--f]*C;return C*=128,E>=C&&(E-=Math.pow(2,8*o)),E},u.prototype.readInt8=function(n,o){return n=n>>>0,o||g(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,o){n=n>>>0,o||g(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,o){n=n>>>0,o||g(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,o){return n=n>>>0,o||g(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,o){return n=n>>>0,o||g(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=Pe(function(n){n=n>>>0,lr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Or(n,this.length-8);const f=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(f)<<BigInt(32))+BigInt(o+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=Pe(function(n){n=n>>>0,lr(n,"offset");const o=this[n],l=this[n+7];(o===void 0||l===void 0)&&Or(n,this.length-8);const f=(o<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(f)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,o){return n=n>>>0,o||g(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,o){return n=n>>>0,o||g(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,o){return n=n>>>0,o||g(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,o){return n=n>>>0,o||g(n,8,this.length),r.read(this,n,!1,52,8)};function d(A,n,o,l,f,C){if(!u.isBuffer(A))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>f||n<C)throw new RangeError('"value" argument is out of bounds');if(o+l>A.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,o,l,f){if(n=+n,o=o>>>0,l=l>>>0,!f){const U=Math.pow(2,8*l)-1;d(this,n,o,l,U,0)}let C=1,E=0;for(this[o]=n&255;++E<l&&(C*=256);)this[o+E]=n/C&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,o,l,f){if(n=+n,o=o>>>0,l=l>>>0,!f){const U=Math.pow(2,8*l)-1;d(this,n,o,l,U,0)}let C=l-1,E=1;for(this[o+C]=n&255;--C>=0&&(E*=256);)this[o+C]=n/E&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,1,255,0),this[o]=n&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,2,65535,0),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,2,65535,0),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,4,4294967295,0),this[o+3]=n>>>24,this[o+2]=n>>>16,this[o+1]=n>>>8,this[o]=n&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,4,4294967295,0),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4};function x(A,n,o,l,f){IA(n,l,f,A,o,7);let C=Number(n&BigInt(4294967295));A[o++]=C,C=C>>8,A[o++]=C,C=C>>8,A[o++]=C,C=C>>8,A[o++]=C;let E=Number(n>>BigInt(32)&BigInt(4294967295));return A[o++]=E,E=E>>8,A[o++]=E,E=E>>8,A[o++]=E,E=E>>8,A[o++]=E,o}function H(A,n,o,l,f){IA(n,l,f,A,o,7);let C=Number(n&BigInt(4294967295));A[o+7]=C,C=C>>8,A[o+6]=C,C=C>>8,A[o+5]=C,C=C>>8,A[o+4]=C;let E=Number(n>>BigInt(32)&BigInt(4294967295));return A[o+3]=E,E=E>>8,A[o+2]=E,E=E>>8,A[o+1]=E,E=E>>8,A[o]=E,o+8}u.prototype.writeBigUInt64LE=Pe(function(n,o=0){return x(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Pe(function(n,o=0){return H(this,n,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,o,l,f){if(n=+n,o=o>>>0,!f){const ht=Math.pow(2,8*l-1);d(this,n,o,l,ht-1,-ht)}let C=0,E=1,U=0;for(this[o]=n&255;++C<l&&(E*=256);)n<0&&U===0&&this[o+C-1]!==0&&(U=1),this[o+C]=(n/E>>0)-U&255;return o+l},u.prototype.writeIntBE=function(n,o,l,f){if(n=+n,o=o>>>0,!f){const ht=Math.pow(2,8*l-1);d(this,n,o,l,ht-1,-ht)}let C=l-1,E=1,U=0;for(this[o+C]=n&255;--C>=0&&(E*=256);)n<0&&U===0&&this[o+C+1]!==0&&(U=1),this[o+C]=(n/E>>0)-U&255;return o+l},u.prototype.writeInt8=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,1,127,-128),n<0&&(n=255+n+1),this[o]=n&255,o+1},u.prototype.writeInt16LE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,2,32767,-32768),this[o]=n&255,this[o+1]=n>>>8,o+2},u.prototype.writeInt16BE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,2,32767,-32768),this[o]=n>>>8,this[o+1]=n&255,o+2},u.prototype.writeInt32LE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,4,2147483647,-2147483648),this[o]=n&255,this[o+1]=n>>>8,this[o+2]=n>>>16,this[o+3]=n>>>24,o+4},u.prototype.writeInt32BE=function(n,o,l){return n=+n,o=o>>>0,l||d(this,n,o,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[o]=n>>>24,this[o+1]=n>>>16,this[o+2]=n>>>8,this[o+3]=n&255,o+4},u.prototype.writeBigInt64LE=Pe(function(n,o=0){return x(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Pe(function(n,o=0){return H(this,n,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function j(A,n,o,l,f,C){if(o+l>A.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function lt(A,n,o,l,f){return n=+n,o=o>>>0,f||j(A,n,o,4),r.write(A,n,o,l,23,4),o+4}u.prototype.writeFloatLE=function(n,o,l){return lt(this,n,o,!0,l)},u.prototype.writeFloatBE=function(n,o,l){return lt(this,n,o,!1,l)};function ut(A,n,o,l,f){return n=+n,o=o>>>0,f||j(A,n,o,8),r.write(A,n,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(n,o,l){return ut(this,n,o,!0,l)},u.prototype.writeDoubleBE=function(n,o,l){return ut(this,n,o,!1,l)},u.prototype.copy=function(n,o,l,f){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!f&&f!==0&&(f=this.length),o>=n.length&&(o=n.length),o||(o=0),f>0&&f<l&&(f=l),f===l||n.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(f<0)throw new RangeError("sourceEnd out of bounds");f>this.length&&(f=this.length),n.length-o<f-l&&(f=n.length-o+l);const C=f-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,f):Uint8Array.prototype.set.call(n,this.subarray(l,f),o),C},u.prototype.fill=function(n,o,l,f){if(typeof n=="string"){if(typeof o=="string"?(f=o,o=0,l=this.length):typeof l=="string"&&(f=l,l=this.length),f!==void 0&&typeof f!="string")throw new TypeError("encoding must be a string");if(typeof f=="string"&&!u.isEncoding(f))throw new TypeError("Unknown encoding: "+f);if(n.length===1){const E=n.charCodeAt(0);(f==="utf8"&&E<128||f==="latin1")&&(n=E)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let C;if(typeof n=="number")for(C=o;C<l;++C)this[C]=n;else{const E=u.isBuffer(n)?n:u.from(n,f),U=E.length;if(U===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(C=0;C<l-o;++C)this[C+o]=E[C%U]}return this};const tt={};function ot(A,n,o){tt[A]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${A}]`,this.stack,delete this.name}get code(){return A}set code(f){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:f,writable:!0})}toString(){return`${this.name} [${A}]: ${this.message}`}}}ot("ERR_BUFFER_OUT_OF_BOUNDS",function(A){return A?`${A} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),ot("ERR_INVALID_ARG_TYPE",function(A,n){return`The "${A}" argument must be of type number. Received type ${typeof n}`},TypeError),ot("ERR_OUT_OF_RANGE",function(A,n,o){let l=`The value of "${A}" is out of range.`,f=o;return Number.isInteger(o)&&Math.abs(o)>2**32?f=Ft(String(o)):typeof o=="bigint"&&(f=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(f=Ft(f)),f+="n"),l+=` It must be ${n}. Received ${f}`,l},RangeError);function Ft(A){let n="",o=A.length;const l=A[0]==="-"?1:0;for(;o>=l+4;o-=3)n=`_${A.slice(o-3,o)}${n}`;return`${A.slice(0,o)}${n}`}function t0(A,n,o){lr(n,"offset"),(A[n]===void 0||A[n+o]===void 0)&&Or(n,A.length-(o+1))}function IA(A,n,o,l,f,C){if(A>o||A<n){const E=typeof n=="bigint"?"n":"";let U;throw n===0||n===BigInt(0)?U=`>= 0${E} and < 2${E} ** ${(C+1)*8}${E}`:U=`>= -(2${E} ** ${(C+1)*8-1}${E}) and < 2 ** ${(C+1)*8-1}${E}`,new tt.ERR_OUT_OF_RANGE("value",U,A)}t0(l,f,C)}function lr(A,n){if(typeof A!="number")throw new tt.ERR_INVALID_ARG_TYPE(n,"number",A)}function Or(A,n,o){throw Math.floor(A)!==A?(lr(A,o),new tt.ERR_OUT_OF_RANGE("offset","an integer",A)):n<0?new tt.ERR_BUFFER_OUT_OF_BOUNDS:new tt.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,A)}const e0=/[^+/0-9A-Za-z-_]/g;function r0(A){if(A=A.split("=")[0],A=A.trim().replace(e0,""),A.length<2)return"";for(;A.length%4!==0;)A=A+"=";return A}function $o(A,n){n=n||1/0;let o;const l=A.length;let f=null;const C=[];for(let E=0;E<l;++E){if(o=A.charCodeAt(E),o>55295&&o<57344){if(!f){if(o>56319){(n-=3)>-1&&C.push(239,191,189);continue}else if(E+1===l){(n-=3)>-1&&C.push(239,191,189);continue}f=o;continue}if(o<56320){(n-=3)>-1&&C.push(239,191,189),f=o;continue}o=(f-55296<<10|o-56320)+65536}else f&&(n-=3)>-1&&C.push(239,191,189);if(f=null,o<128){if((n-=1)<0)break;C.push(o)}else if(o<2048){if((n-=2)<0)break;C.push(o>>6|192,o&63|128)}else if(o<65536){if((n-=3)<0)break;C.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((n-=4)<0)break;C.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return C}function n0(A){const n=[];for(let o=0;o<A.length;++o)n.push(A.charCodeAt(o)&255);return n}function o0(A,n){let o,l,f;const C=[];for(let E=0;E<A.length&&!((n-=2)<0);++E)o=A.charCodeAt(E),l=o>>8,f=o%256,C.push(f),C.push(l);return C}function fA(A){return e.toByteArray(r0(A))}function Jn(A,n,o,l){let f;for(f=0;f<l&&!(f+o>=n.length||f>=A.length);++f)n[f+o]=A[f];return f}function ne(A,n){return A instanceof n||A!=null&&A.constructor!=null&&A.constructor.name!=null&&A.constructor.name===n.name}function ts(A){return A!==A}const s0=function(){const A="0123456789abcdef",n=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let f=0;f<16;++f)n[l+f]=A[o]+A[f]}return n}();function Pe(A){return typeof BigInt>"u"?i0:A}function i0(){throw new Error("BigInt not supported")}}(oe)),oe}var Je=SA(),Vn={exports:{}},ur={},jn={exports:{}},Q={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ns;function CA(){if(ns)return Q;ns=1;var t=Symbol.for("react.element"),e=Symbol.for("react.portal"),r=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),a=Symbol.for("react.profiler"),h=Symbol.for("react.provider"),S=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),D=Symbol.for("react.suspense"),G=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),Z=Symbol.iterator;function q(g){return g===null||typeof g!="object"?null:(g=Z&&g[Z]||g["@@iterator"],typeof g=="function"?g:null)}var w={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},F=Object.assign,J={};function st(g,d,x){this.props=g,this.context=d,this.refs=J,this.updater=x||w}st.prototype.isReactComponent={},st.prototype.setState=function(g,d){if(typeof g!="object"&&typeof g!="function"&&g!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,g,d,"setState")},st.prototype.forceUpdate=function(g){this.updater.enqueueForceUpdate(this,g,"forceUpdate")};function Bt(){}Bt.prototype=st.prototype;function at(g,d,x){this.props=g,this.context=d,this.refs=J,this.updater=x||w}var mt=at.prototype=new Bt;mt.constructor=at,F(mt,st.prototype),mt.isPureReactComponent=!0;var re=Array.isArray,ct=Object.prototype.hasOwnProperty,ar={current:null},Kr={key:!0,ref:!0,__self:!0,__source:!0};function _n(g,d,x){var H,j={},lt=null,ut=null;if(d!=null)for(H in d.ref!==void 0&&(ut=d.ref),d.key!==void 0&&(lt=""+d.key),d)ct.call(d,H)&&!Kr.hasOwnProperty(H)&&(j[H]=d[H]);var tt=arguments.length-2;if(tt===1)j.children=x;else if(1<tt){for(var ot=Array(tt),Ft=0;Ft<tt;Ft++)ot[Ft]=arguments[Ft+2];j.children=ot}if(g&&g.defaultProps)for(H in tt=g.defaultProps,tt)j[H]===void 0&&(j[H]=tt[H]);return{$$typeof:t,type:g,key:lt,ref:ut,props:j,_owner:ar.current}}function jo(g,d){return{$$typeof:t,type:g.type,key:d,ref:g.ref,props:g.props,_owner:g._owner}}function qr(g){return typeof g=="object"&&g!==null&&g.$$typeof===t}function Ho(g){var d={"=":"=0",":":"=2"};return"$"+g.replace(/[=:]/g,function(x){return d[x]})}var Gn=/\/+/g;function Nr(g,d){return typeof g=="object"&&g!==null&&g.key!=null?Ho(""+g.key):d.toString(36)}function Ge(g,d,x,H,j){var lt=typeof g;(lt==="undefined"||lt==="boolean")&&(g=null);var ut=!1;if(g===null)ut=!0;else switch(lt){case"string":case"number":ut=!0;break;case"object":switch(g.$$typeof){case t:case e:ut=!0}}if(ut)return ut=g,j=j(ut),g=H===""?"."+Nr(ut,0):H,re(j)?(x="",g!=null&&(x=g.replace(Gn,"$&/")+"/"),Ge(j,d,x,"",function(Ft){return Ft})):j!=null&&(qr(j)&&(j=jo(j,x+(!j.key||ut&&ut.key===j.key?"":(""+j.key).replace(Gn,"$&/")+"/")+g)),d.push(j)),1;if(ut=0,H=H===""?".":H+":",re(g))for(var tt=0;tt<g.length;tt++){lt=g[tt];var ot=H+Nr(lt,tt);ut+=Ge(lt,d,x,ot,j)}else if(ot=q(g),typeof ot=="function")for(g=ot.call(g),tt=0;!(lt=g.next()).done;)lt=lt.value,ot=H+Nr(lt,tt++),ut+=Ge(lt,d,x,ot,j);else if(lt==="object")throw d=String(g),Error("Objects are not valid as a React child (found: "+(d==="[object Object]"?"object with keys {"+Object.keys(g).join(", ")+"}":d)+"). If you meant to render a collection of children, use an array instead.");return ut}function Ze(g,d,x){if(g==null)return g;var H=[],j=0;return Ge(g,H,"","",function(lt){return d.call(x,lt,j++)}),H}function vo(g){if(g._status===-1){var d=g._result;d=d(),d.then(function(x){(g._status===0||g._status===-1)&&(g._status=1,g._result=x)},function(x){(g._status===0||g._status===-1)&&(g._status=2,g._result=x)}),g._status===-1&&(g._status=0,g._result=d)}if(g._status===1)return g._result.default;throw g._result}var kt={current:null},cr={transition:null},zo={ReactCurrentDispatcher:kt,ReactCurrentBatchConfig:cr,ReactCurrentOwner:ar};function Zn(){throw Error("act(...) is not supported in production builds of React.")}return Q.Children={map:Ze,forEach:function(g,d,x){Ze(g,function(){d.apply(this,arguments)},x)},count:function(g){var d=0;return Ze(g,function(){d++}),d},toArray:function(g){return Ze(g,function(d){return d})||[]},only:function(g){if(!qr(g))throw Error("React.Children.only expected to receive a single React element child.");return g}},Q.Component=st,Q.Fragment=r,Q.Profiler=a,Q.PureComponent=at,Q.StrictMode=s,Q.Suspense=D,Q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=zo,Q.act=Zn,Q.cloneElement=function(g,d,x){if(g==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+g+".");var H=F({},g.props),j=g.key,lt=g.ref,ut=g._owner;if(d!=null){if(d.ref!==void 0&&(lt=d.ref,ut=ar.current),d.key!==void 0&&(j=""+d.key),g.type&&g.type.defaultProps)var tt=g.type.defaultProps;for(ot in d)ct.call(d,ot)&&!Kr.hasOwnProperty(ot)&&(H[ot]=d[ot]===void 0&&tt!==void 0?tt[ot]:d[ot])}var ot=arguments.length-2;if(ot===1)H.children=x;else if(1<ot){tt=Array(ot);for(var Ft=0;Ft<ot;Ft++)tt[Ft]=arguments[Ft+2];H.children=tt}return{$$typeof:t,type:g.type,key:j,ref:lt,props:H,_owner:ut}},Q.createContext=function(g){return g={$$typeof:S,_currentValue:g,_currentValue2:g,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},g.Provider={$$typeof:h,_context:g},g.Consumer=g},Q.createElement=_n,Q.createFactory=function(g){var d=_n.bind(null,g);return d.type=g,d},Q.createRef=function(){return{current:null}},Q.forwardRef=function(g){return{$$typeof:u,render:g}},Q.isValidElement=qr,Q.lazy=function(g){return{$$typeof:y,_payload:{_status:-1,_result:g},_init:vo}},Q.memo=function(g,d){return{$$typeof:G,type:g,compare:d===void 0?null:d}},Q.startTransition=function(g){var d=cr.transition;cr.transition={};try{g()}finally{cr.transition=d}},Q.unstable_act=Zn,Q.useCallback=function(g,d){return kt.current.useCallback(g,d)},Q.useContext=function(g){return kt.current.useContext(g)},Q.useDebugValue=function(){},Q.useDeferredValue=function(g){return kt.current.useDeferredValue(g)},Q.useEffect=function(g,d){return kt.current.useEffect(g,d)},Q.useId=function(){return kt.current.useId()},Q.useImperativeHandle=function(g,d,x){return kt.current.useImperativeHandle(g,d,x)},Q.useInsertionEffect=function(g,d){return kt.current.useInsertionEffect(g,d)},Q.useLayoutEffect=function(g,d){return kt.current.useLayoutEffect(g,d)},Q.useMemo=function(g,d){return kt.current.useMemo(g,d)},Q.useReducer=function(g,d,x){return kt.current.useReducer(g,d,x)},Q.useRef=function(g){return kt.current.useRef(g)},Q.useState=function(g){return kt.current.useState(g)},Q.useSyncExternalStore=function(g,d,x){return kt.current.useSyncExternalStore(g,d,x)},Q.useTransition=function(){return kt.current.useTransition()},Q.version="18.3.1",Q}var os;function EA(){return os||(os=1,jn.exports=CA()),jn.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ss;function BA(){if(ss)return ur;ss=1;var t=EA(),e=Symbol.for("react.element"),r=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,a=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,h={key:!0,ref:!0,__self:!0,__source:!0};function S(u,D,G){var y,Z={},q=null,w=null;G!==void 0&&(q=""+G),D.key!==void 0&&(q=""+D.key),D.ref!==void 0&&(w=D.ref);for(y in D)s.call(D,y)&&!h.hasOwnProperty(y)&&(Z[y]=D[y]);if(u&&u.defaultProps)for(y in D=u.defaultProps,D)Z[y]===void 0&&(Z[y]=D[y]);return{$$typeof:e,type:u,key:q,ref:w,props:Z,_owner:a.current}}return ur.Fragment=r,ur.jsx=S,ur.jsxs=S,ur}var is;function mA(){return is||(is=1,Vn.exports=BA()),Vn.exports}mA();const DA=!1,dA=30,wA=4,hr=256,Ve=383,Ir=256*hr,fe=256*Ve;var _=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(_||{}),Tt=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t[t.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",t[t.INSTRUCTIONS=14]="INSTRUCTIONS",t))(Tt||{}),W=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.BREAKPOINTS=3]="BREAKPOINTS",t[t.STEP_INTO=4]="STEP_INTO",t[t.STEP_OVER=5]="STEP_OVER",t[t.STEP_OUT=6]="STEP_OUT",t[t.SPEED=7]="SPEED",t[t.TIME_TRAVEL_STEP=8]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=9]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=10]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=11]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=12]="RESTORE_STATE",t[t.KEYPRESS=13]="KEYPRESS",t[t.MOUSEEVENT=14]="MOUSEEVENT",t[t.PASTE_TEXT=15]="PASTE_TEXT",t[t.APPLE_PRESS=16]="APPLE_PRESS",t[t.APPLE_RELEASE=17]="APPLE_RELEASE",t[t.GET_SAVE_STATE=18]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=19]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=20]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=21]="DRIVE_NEW_DATA",t[t.GAMEPAD=22]="GAMEPAD",t[t.SET_BINARY_BLOCK=23]="SET_BINARY_BLOCK",t[t.SET_CYCLECOUNT=24]="SET_CYCLECOUNT",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RAMWORKS=28]="RAMWORKS",t[t.MACHINE_NAME=29]="MACHINE_NAME",t[t.SOFTSWITCHES=30]="SOFTSWITCHES",t))(W||{}),As=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t[t.INVERSEBLACKANDWHITE=5]="INVERSEBLACKANDWHITE",t))(As||{}),as=(t=>(t[t.CLASSIC=0]="CLASSIC",t[t.DARK=1]="DARK",t[t.MINIMAL=2]="MINIMAL",t))(as||{}),Me=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Me||{}),i=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(i||{});const kA=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),cs=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",pt=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const fr=t=>t.split("").map(e=>e.charCodeAt(0)),TA=t=>[t&255,t>>>8&255],ls=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],us=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},Hn=new Uint32Array(256).fill(0),yA=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;Hn[e]=t}},RA=(t,e=0)=>{Hn[255]===0&&yA();let r=-1;for(let s=e;s<t.length;s++)r=r>>>8^Hn[(r^t[s])&255];return(r^-1)>>>0},PA=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),hs=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")};let Xt;const Qe=Math.trunc(.0028*1020484);let vn=Qe/2,zn=Qe/2,xr=Qe/2,Wr=Qe/2,Is=0,fs=!1,ps=!1,$n=!1,to=!1,Xr=!1,gs=!1,Ss=!1;const eo=()=>{$n=!0},Cs=()=>{to=!0},LA=()=>{Xr=!0},_r=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*Qe/2),Es=t=>{vn=_r(t)},Bs=t=>{zn=_r(t)},ms=t=>{xr=_r(t)},Ds=t=>{Wr=_r(t)},ro=()=>{gs=fs||$n,Ss=ps||to,B.PB0.isSet=gs,B.PB1.isSet=Ss||Xr,B.PB2.isSet=Xr},ds=(t,e)=>{e?fs=t:ps=t,ro()},MA=t=>{nt(49252,128),nt(49253,128),nt(49254,128),nt(49255,128),Is=t},Gr=t=>{const e=t-Is;nt(49252,e<vn?128:0),nt(49253,e<zn?128:0),nt(49254,e<xr?128:0),nt(49255,e<Wr?128:0)};let be,no,ws=!1;const QA=t=>{Xt=t,ws=!Xt.length||!Xt[0].buttons.length,be=$A(),no=be.gamepad?be.gamepad:vA},ks=t=>t>-.01&&t<.01,Ts=(t,e)=>{ks(t)&&(t=0),ks(e)&&(e=0);const r=Math.sqrt(t*t+e*e),s=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-s,t),s),e=Math.min(Math.max(-s,e),s),t=Math.trunc(Qe*(t+s)/(2*s)),e=Math.trunc(Qe*(e+s)/(2*s)),[t,e]},bA=t=>{const[e,r]=Ts(t[0],t[1]),s=t.length>=6?t[5]:t[3],[a,h]=t.length>=4?Ts(t[2],s):[0,0];return[e,r,a,h]},ys=t=>{const e=be.joystick?be.joystick(Xt[t].axes,ws):Xt[t].axes,r=bA(e);t===0?(vn=r[0],zn=r[1],$n=!1,to=!1,xr=r[2],Wr=r[3]):(xr=r[0],Wr=r[1],Xr=!1);let s=!1;Xt[t].buttons.forEach((a,h)=>{a&&(no(h,Xt.length>1,t===1),s=!0)}),s||no(-1,Xt.length>1,t===1),be.rumble&&be.rumble(),ro()},FA=()=>{Xt&&Xt.length>0&&(ys(0),Xt.length>1&&ys(1))},UA=t=>{switch(t){case 0:X("JL");break;case 1:X("G",200);break;case 2:v("M"),X("O");break;case 3:X("L");break;case 4:X("F");break;case 5:v("P"),X("T");break;case 6:break;case 7:break;case 8:X("Z");break;case 9:{const e=ei();e.includes("'N'")?v("N"):e.includes("'S'")?v("S"):e.includes("NUMERIC KEY")?v("1"):v("N");break}case 10:break;case 11:break;case 12:X("L");break;case 13:X("M");break;case 14:X("A");break;case 15:X("D");break;case-1:return}};let Fe=0,Ue=0,Ke=!1;const Zr=.5,KA={address:49803,data:[173,0,192],keymap:{},joystick:t=>t[0]<-Zr?(Ue=0,Fe===0||Fe>2?(Fe=0,v("A")):Fe===1&&Ke?X("W"):Fe===2&&Ke&&X("R"),Fe++,Ke=!1,t):t[0]>Zr?(Fe=0,Ue===0||Ue>2?(Ue=0,v("D")):Ue===1&&Ke?X("W"):Ue===2&&Ke&&X("R"),Ue++,Ke=!1,t):t[1]<-Zr?(X("C"),t):t[1]>Zr?(X("S"),t):(Ke=!0,t),gamepad:UA,rumble:null,setup:null,helptext:`AZTEC
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
`},qA={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:v(" ");break;case 12:v("A");break;case 13:v("Z");break;case 14:v("\b");break;case 15:v("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},NA={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},OA={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Vo("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let oo=14,so=14;const YA={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=m(182,!1);oo<40&&t<oo&&Xn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),oo=t,t=m(183,!1),so<40&&t<so&&Xn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),so=t},setup:null,helptext:`KARATEKA
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
`},xA=t=>{switch(t){case 0:X("A");break;case 1:X("C",50);break;case 2:X("O");break;case 3:X("T");break;case 4:X("\x1B");break;case 5:X("\r");break;case 6:break;case 7:break;case 8:v("N"),X("'");break;case 9:v("Y"),X("1");break;case 10:break;case 11:break;case 12:break;case 13:X(" ");break;case 14:break;case 15:X("	");break;case-1:return}},pe=.5,WA={address:768,data:[141,74,3,132],keymap:{},gamepad:xA,joystick:(t,e)=>{if(e)return t;const r=t[0]<-pe?"\b":t[0]>pe?"":"",s=t[1]<-pe?"\v":t[1]>pe?`
`:"";let a=r+s;return a||(a=t[2]<-pe?"L\b":t[2]>pe?"L":"",a||(a=t[3]<-pe?"L\v":t[3]>pe?`L
`:"")),a&&X(a,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},XA={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},_A={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},GA={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{m(14799,!1)===255&&Xn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{k(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},Rs=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,ZA=t=>{switch(t){case 1:k(109,255);break;case 12:v("A");break;case 13:v("Z");break;case 14:v("\b");break;case 15:v("");break}},Jr=.75,JA=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{k(25025,173),k(25036,64)},helptext:Rs},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-Jr?"\b":t[0]>Jr?"":t[1]<-Jr?"A":t[1]>Jr?"Z":"";return e&&v(e),t},gamepad:ZA,rumble:null,setup:null,helptext:Rs}],VA={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{uA(1)},helptext:`Ultima V: Warriors of Destiny
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

`},jA={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},HA={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:eo();break;case 1:Cs();break;case 2:X(" ");break;case 3:X("U");break;case 4:X("\r");break;case 5:X("T");break;case 9:{const e=ei();e.includes("'N'")?v("N"):e.includes("'S'")?v("S"):e.includes("NUMERIC KEY")?v("1"):v("N");break}case 10:eo();break}},rumble:()=>{m(49178,!1)<128&&m(49181,!1)<128&&Xn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{k(5128,0),k(5130,4);let t=5210;k(t,234),k(t+1,234),k(t+2,234),t=5224,k(t,234),k(t+1,234),k(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},pr=new Array,Kt=t=>{Array.isArray(t)?pr.push(...t):pr.push(t)};Kt(KA),Kt(qA),Kt(NA),Kt(OA),Kt(YA),Kt(WA),Kt(XA),Kt(_A),Kt(GA),Kt(JA),Kt(VA),Kt(jA),Kt(HA);const vA=(t,e,r)=>{if(r)switch(t){case 0:LA();break;case 1:break;case 12:Ds(-1);break;case 13:Ds(1);break;case 14:ms(-1);break;case 15:ms(1);break}else switch(t){case 0:eo();break;case 1:e||Cs();break;case 12:Bs(-1);break;case 13:Bs(1);break;case 14:Es(-1);break;case 15:Es(1);break}},zA={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},Ps=t=>{for(const e of pr)if(mo(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},$A=()=>{for(const t of pr)if(mo(t.address,t.data))return t;return zA},io=(t=!1)=>{for(const e of pr)if(mo(e.address,e.data)){lA(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(lA(" "),uA(0))},ta=t=>{nt(49152,t|128,32)},ea=()=>{const t=Mt(49152)&127;nt(49152,t,32)};let qe="",Ls=1e9;const ra=()=>{const t=performance.now();if(qe!==""&&(Mt(49152)<128||t-Ls>3800)){Ls=t;const e=qe.charCodeAt(0);ta(e),qe=qe.slice(1),qe.length===0&&rA(!0)}};let Ms="";const v=t=>{t===Ms&&qe.length>0||(Ms=t,qe+=t)};let Qs=0;const X=(t,e=300)=>{const r=performance.now();r-Qs<e||(Qs=r,v(t))},na=t=>{t.length===1&&(t=Ps(t)),v(t)},oa=t=>{t.length===1&&(t=Ps(t)),v(t)},je=[],L=(t,e,r,s=!1,a=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:s,isSet:!1,setFunc:a};return t>=49152&&(je[t-49152]=h),e>=49152&&(je[e-49152]=h),r>=49152&&(je[r-49152]=h),h},He=()=>Math.floor(180*Math.random()),bs=(t,e)=>{t&=11,e?B.BSR_PREWRITE.isSet=!1:t&1?B.BSR_PREWRITE.isSet?B.BSR_WRITE.isSet=!0:B.BSR_PREWRITE.isSet=!0:(B.BSR_PREWRITE.isSet=!1,B.BSR_WRITE.isSet=!1),B.BSRBANK2.isSet=t<=3,B.BSRREADRAM.isSet=[0,3,8,11].includes(t)},B={STORE80:L(49152,49153,49176,!0),RAMRD:L(49154,49155,49171,!0),RAMWRT:L(49156,49157,49172,!0),INTCXROM:L(49158,49159,49173,!0),INTC8ROM:L(49194,0,0),ALTZP:L(49160,49161,49174,!0),SLOTC3ROM:L(49162,49163,49175,!0),COLUMN80:L(49164,49165,49183,!0),ALTCHARSET:L(49166,49167,49182,!0),KBRDSTROBE:L(49168,0,0,!1),BSRBANK2:L(0,0,49169),BSRREADRAM:L(0,0,49170),VBL:L(0,0,49177),CASSOUT:L(49184,0,0),SPEAKER:L(49200,0,0,!1,(t,e)=>{nt(49200,He()),Z1(e)}),GCSTROBE:L(49216,0,0),EMUBYTE:L(0,0,49231,!1,()=>{nt(49231,205)}),TEXT:L(49232,49233,49178),MIXED:L(49234,49235,49179),PAGE2:L(49236,49237,49180),HIRES:L(49238,49239,49181),AN0:L(49240,49241,0),AN1:L(49242,49243,0),AN2:L(49244,49245,0),AN3:L(49246,49247,0),CASSIN1:L(0,0,49248,!1,()=>{nt(49248,He())}),PB0:L(0,0,49249),PB1:L(0,0,49250),PB2:L(0,0,49251),JOYSTICK0:L(0,0,49252,!1,(t,e)=>{Gr(e)}),JOYSTICK1:L(0,0,49253,!1,(t,e)=>{Gr(e)}),JOYSTICK2:L(0,0,49254,!1,(t,e)=>{Gr(e)}),JOYSTICK3:L(0,0,49255,!1,(t,e)=>{Gr(e)}),CASSIN2:L(0,0,49256,!1,()=>{nt(49256,He())}),FASTCHIP_LOCK:L(49258,0,0),FASTCHIP_ENABLE:L(49259,0,0),FASTCHIP_SPEED:L(49261,0,0),JOYSTICKRESET:L(0,0,49264,!1,(t,e)=>{MA(e),nt(49264,He())}),BANKSEL:L(49267,0,0),LASER128EX:L(49268,0,0),BSR_PREWRITE:L(49280,0,0),BSR_WRITE:L(49288,0,0)};B.TEXT.isSet=!0;const sa=[49152,49153,49165,49167,49200,49236,49237,49183],Fs=(t,e,r)=>{if(t>1048575&&!sa.includes(t)){const a=Mt(t)>128?1:0;console.log(`${r} $${pt(c.PC)}: $${pt(t)} [${a}] ${e?"write":""}`)}if(t>=49280&&t<=49295){bs(t&-5,e);return}const s=je[t-49152];if(!s){console.error("Unknown softswitch "+pt(t)),nt(t,He());return}if(t<=49167?e||ra():(t===49168||t<=49183&&e)&&ea(),s.setFunc){s.setFunc(t,r);return}if(t===s.offAddr||t===s.onAddr){if((!s.writeOnly||e)&&(Vt[s.offAddr-49152]!==void 0?Vt[s.offAddr-49152]=t===s.onAddr:s.isSet=t===s.onAddr),s.isSetAddr){const a=Mt(s.isSetAddr);nt(s.isSetAddr,s.isSet?a|128:a&127)}t>=49184&&nt(t,He())}else if(t===s.isSetAddr){const a=Mt(t);nt(t,s.isSet?a|128:a&127)}},ia=()=>{for(const t in B){const e=t;Vt[B[e].offAddr-49152]!==void 0?Vt[B[e].offAddr-49152]=!1:B[e].isSet=!1}Vt[B.TEXT.offAddr-49152]!==void 0?Vt[B.TEXT.offAddr-49152]=!0:B.TEXT.isSet=!0},Vt=[],Aa=t=>{if(t>=49280&&t<=49295){bs(t&-5,!1);return}const e=je[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+pt(t));return}Vt[e.offAddr-49152]===void 0&&(Vt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},aa=()=>{Vt.forEach((t,e)=>{t!==void 0&&(je[e].isSet=t)}),Vt.length=0},ve=[],ca=()=>{if(ve.length===0)for(const t in B){const e=B[t],r=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const a=pt(e.offAddr)+" "+t;ve[e.offAddr]=a+(r?"-OFF":"")+s}if(e.onAddr>0){const a=pt(e.onAddr)+" "+t;ve[e.onAddr]=a+"-ON"+s}if(e.isSetAddr>0){const a=pt(e.isSetAddr)+" "+t;ve[e.isSetAddr]=a+"-STATUS"+s}}return ve[49152]="C000 KBRD/STORE80-OFF",ve},la=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,ua=`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
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
qQCFFEzw2CD45sqKySiQCukoSCD72mhM7PeFJGDL0nhKCCBH+CipD5ACaeCFLrEm
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
aIU6aIU7bPADIIL4INr6TGX/2CCE/iAv+yCT/iCJ/q1YwK1awKAFILT76q3/zywQ
wNggOv+t8wNJpc30A9AXrfID0A+p4M3zA9AIoAOM8gNMAOBs8gMgYPuiBb38+p3v
A8rQ96nIhgCFAaAHxgGlAcnA8NeN+AexANkB+9DsiIgQ9WwAAOrqII79qUWFQKkA
hUGi+6mgIO39vR76IO39qb0g7f21SiDa/egw6GBZ+gDgRSD/AP8D/zzB8PDs5aDd
28TCwf/D////wdjZ0NOtcMCgAOrqvWTAEATI0PiIYKkAhUitVsCtVMCtUcCpAPAL
rVDArVPAIDb4qRSFIqkAhSCgCNBfqRiFI6kXhSVMIvwgWPygCLkI+5kOBIjQ92Ct
8wNJpY30A2DJjdAYrADAEBPAk9APLBDArADAEPvAg/ADLBDATP37OEws/Ki5SPog
l/sgIf3JzrDuycmQ6snM8ObQ6AYIeCwVwAiNB8BMAMHqSEopAwkEhSloKRiQAml/
hSgKCgUohShgyYfQEqlAIKj8oMCpDCCo/K0wwIjQ9WCkJJEo5iSlJMUhsGZgyaCw
76gQ7MmN8FrJivBayYjQycYkEOilIYUkxiSlIsUlsAvGJaUlIMH7ZSCFKGBJwPAo
af2QwPDaaf2QLPDeaf2QXNDpoADwLKjDqaCxubixrbiyrKDB0NDMxaAB0BbSycPL
oMGpAIUk5iWlJcUjkLbGJaACTLT7SK0YwApoLBzACJADjVTALBXAjQbAWHgQA40H
wCiQBRADLFXAYOrqGLA4hB+gA5DNyNDKOEjpAdD8aOkB0PZg5kLQAuZDpTzFPqU9
5T/mPNAC5j1goEsg2/zQ+Wn+sPWgISDb/MjIiND9kAWgMojQ/awgwKAsymCiCEgg
+vxoKqA6ytD1YCD9/IitYMBFLxD4RS+FL8CAYKQksShIKT8JQJEoaGw4AKAGTLT7
6iAM/aAHTLT7jQbAKGBgICH9IKX7IAz9yZvw82ClMkip/+rqvQACIO39aIUyvQAC
yYjwHcmY8Arg+JADIDr/6NATqdwg7f0gjv2lMyDt/aIBivDzyiA1/cmV0AKxKMng
kAIp/50AAsmN0LIgnPypjdBbpD2mPCCO/SBA+aAAqa1M7f2lPAkHhT6lPYU/pTwp
B9ADIJL9qaAg7f2xPCDa/SC6/JDoYEqQ6kpKpT6QAkn/ZTxIqb0g7f1oSEpKSkog
5f1oKQ8JsMm6kAJpBmw2AMmgkAIlMoQ1SCB4+2ikNWDGNPCfytAWybrQu4UxpT6R
QOZA0ALmQWCkNLn/AYUxYKIBtT6VQpVEyhD3YLE8kUIgtPyQ92CxPNFC8Bwgkv2x
PCDa/amgIO39qagg7f2xQiDa/ampIO39ILT8kNlgIHX+qRRIIND4IFP5hTqEO2g4
6QHQ72CK8Ae1PJU6yhD5YKA/0AKg/4QyYKkAhT6iOKAb0AipAIU+ojag8KU+KQ/w
BgnAoADwAqn9lACVAWDq0UwA4EwD4CB1/iA//2w6AEzX+mDqYMLy+eHuTPgDqUAg
yfygJ6IAQTxIoTwg7f4guvygHWiQ7qAiIO3+8E2iEAog1vzQ+mAgAP5oaNBsIPr8
qRYgyfyFLiD6/KAkIP38sPkg/fygOyDs/IE8RS6FLiC6/KA1kPAg7PzFLvANqcUg
7f2p0iDt/SDt/amHTO39pUhIpUWmRqRHKGCFRYZGhEcIaIVIuoZJ2GAghP4gL/sg
k/4gif7YIDr/qaqFMyBn/SDH/yCn/4Q0oBeIMOjZzP/Q+CC+/6Q0THP/ogMKCgoK
CiY+Jj/KEPilMdAGtT+VPZVB6PDz0AaiAIY+hj+5AALISbDJCpDTaYjJ+rDNYKn+
SLnj/0ilMaAAhDFgvLK+su/Esqm7pqQGlQcCBfAA65Onxpmyyb7BNYzElq8XFysf
g39dzLX8Fxf1A/sDYvpA+g==`,Us=new Array(256),Ao={},p=(t,e,r,s)=>{console.assert(!Us[r],"Duplicate instruction: "+t+" mode="+e),Us[r]={name:t,mode:e,bytes:s},Ao[t]||(Ao[t]=[]),Ao[t][e]=r};p("ADC",i.IMM,105,2),p("ADC",i.ZP_REL,101,2),p("ADC",i.ZP_X,117,2),p("ADC",i.ABS,109,3),p("ADC",i.ABS_X,125,3),p("ADC",i.ABS_Y,121,3),p("ADC",i.IND_X,97,2),p("ADC",i.IND_Y,113,2),p("ADC",i.IND,114,2),p("AND",i.IMM,41,2),p("AND",i.ZP_REL,37,2),p("AND",i.ZP_X,53,2),p("AND",i.ABS,45,3),p("AND",i.ABS_X,61,3),p("AND",i.ABS_Y,57,3),p("AND",i.IND_X,33,2),p("AND",i.IND_Y,49,2),p("AND",i.IND,50,2),p("ASL",i.IMPLIED,10,1),p("ASL",i.ZP_REL,6,2),p("ASL",i.ZP_X,22,2),p("ASL",i.ABS,14,3),p("ASL",i.ABS_X,30,3),p("BCC",i.ZP_REL,144,2),p("BCS",i.ZP_REL,176,2),p("BEQ",i.ZP_REL,240,2),p("BIT",i.ZP_REL,36,2),p("BIT",i.ABS,44,3),p("BIT",i.IMM,137,2),p("BIT",i.ZP_X,52,2),p("BIT",i.ABS_X,60,3),p("BMI",i.ZP_REL,48,2),p("BNE",i.ZP_REL,208,2),p("BPL",i.ZP_REL,16,2),p("BVC",i.ZP_REL,80,2),p("BVS",i.ZP_REL,112,2),p("BRA",i.ZP_REL,128,2),p("BRK",i.IMPLIED,0,1),p("CLC",i.IMPLIED,24,1),p("CLD",i.IMPLIED,216,1),p("CLI",i.IMPLIED,88,1),p("CLV",i.IMPLIED,184,1),p("CMP",i.IMM,201,2),p("CMP",i.ZP_REL,197,2),p("CMP",i.ZP_X,213,2),p("CMP",i.ABS,205,3),p("CMP",i.ABS_X,221,3),p("CMP",i.ABS_Y,217,3),p("CMP",i.IND_X,193,2),p("CMP",i.IND_Y,209,2),p("CMP",i.IND,210,2),p("CPX",i.IMM,224,2),p("CPX",i.ZP_REL,228,2),p("CPX",i.ABS,236,3),p("CPY",i.IMM,192,2),p("CPY",i.ZP_REL,196,2),p("CPY",i.ABS,204,3),p("DEC",i.IMPLIED,58,1),p("DEC",i.ZP_REL,198,2),p("DEC",i.ZP_X,214,2),p("DEC",i.ABS,206,3),p("DEC",i.ABS_X,222,3),p("DEX",i.IMPLIED,202,1),p("DEY",i.IMPLIED,136,1),p("EOR",i.IMM,73,2),p("EOR",i.ZP_REL,69,2),p("EOR",i.ZP_X,85,2),p("EOR",i.ABS,77,3),p("EOR",i.ABS_X,93,3),p("EOR",i.ABS_Y,89,3),p("EOR",i.IND_X,65,2),p("EOR",i.IND_Y,81,2),p("EOR",i.IND,82,2),p("INC",i.IMPLIED,26,1),p("INC",i.ZP_REL,230,2),p("INC",i.ZP_X,246,2),p("INC",i.ABS,238,3),p("INC",i.ABS_X,254,3),p("INX",i.IMPLIED,232,1),p("INY",i.IMPLIED,200,1),p("JMP",i.ABS,76,3),p("JMP",i.IND,108,3),p("JMP",i.IND_X,124,3),p("JSR",i.ABS,32,3),p("LDA",i.IMM,169,2),p("LDA",i.ZP_REL,165,2),p("LDA",i.ZP_X,181,2),p("LDA",i.ABS,173,3),p("LDA",i.ABS_X,189,3),p("LDA",i.ABS_Y,185,3),p("LDA",i.IND_X,161,2),p("LDA",i.IND_Y,177,2),p("LDA",i.IND,178,2),p("LDX",i.IMM,162,2),p("LDX",i.ZP_REL,166,2),p("LDX",i.ZP_Y,182,2),p("LDX",i.ABS,174,3),p("LDX",i.ABS_Y,190,3),p("LDY",i.IMM,160,2),p("LDY",i.ZP_REL,164,2),p("LDY",i.ZP_X,180,2),p("LDY",i.ABS,172,3),p("LDY",i.ABS_X,188,3),p("LSR",i.IMPLIED,74,1),p("LSR",i.ZP_REL,70,2),p("LSR",i.ZP_X,86,2),p("LSR",i.ABS,78,3),p("LSR",i.ABS_X,94,3),p("NOP",i.IMPLIED,234,1),p("ORA",i.IMM,9,2),p("ORA",i.ZP_REL,5,2),p("ORA",i.ZP_X,21,2),p("ORA",i.ABS,13,3),p("ORA",i.ABS_X,29,3),p("ORA",i.ABS_Y,25,3),p("ORA",i.IND_X,1,2),p("ORA",i.IND_Y,17,2),p("ORA",i.IND,18,2),p("PHA",i.IMPLIED,72,1),p("PHP",i.IMPLIED,8,1),p("PHX",i.IMPLIED,218,1),p("PHY",i.IMPLIED,90,1),p("PLA",i.IMPLIED,104,1),p("PLP",i.IMPLIED,40,1),p("PLX",i.IMPLIED,250,1),p("PLY",i.IMPLIED,122,1),p("ROL",i.IMPLIED,42,1),p("ROL",i.ZP_REL,38,2),p("ROL",i.ZP_X,54,2),p("ROL",i.ABS,46,3),p("ROL",i.ABS_X,62,3),p("ROR",i.IMPLIED,106,1),p("ROR",i.ZP_REL,102,2),p("ROR",i.ZP_X,118,2),p("ROR",i.ABS,110,3),p("ROR",i.ABS_X,126,3),p("RTI",i.IMPLIED,64,1),p("RTS",i.IMPLIED,96,1),p("SBC",i.IMM,233,2),p("SBC",i.ZP_REL,229,2),p("SBC",i.ZP_X,245,2),p("SBC",i.ABS,237,3),p("SBC",i.ABS_X,253,3),p("SBC",i.ABS_Y,249,3),p("SBC",i.IND_X,225,2),p("SBC",i.IND_Y,241,2),p("SBC",i.IND,242,2),p("SEC",i.IMPLIED,56,1),p("SED",i.IMPLIED,248,1),p("SEI",i.IMPLIED,120,1),p("STA",i.ZP_REL,133,2),p("STA",i.ZP_X,149,2),p("STA",i.ABS,141,3),p("STA",i.ABS_X,157,3),p("STA",i.ABS_Y,153,3),p("STA",i.IND_X,129,2),p("STA",i.IND_Y,145,2),p("STA",i.IND,146,2),p("STX",i.ZP_REL,134,2),p("STX",i.ZP_Y,150,2),p("STX",i.ABS,142,3),p("STY",i.ZP_REL,132,2),p("STY",i.ZP_X,148,2),p("STY",i.ABS,140,3),p("STZ",i.ZP_REL,100,2),p("STZ",i.ZP_X,116,2),p("STZ",i.ABS,156,3),p("STZ",i.ABS_X,158,3),p("TAX",i.IMPLIED,170,1),p("TAY",i.IMPLIED,168,1),p("TSX",i.IMPLIED,186,1),p("TXA",i.IMPLIED,138,1),p("TXS",i.IMPLIED,154,1),p("TYA",i.IMPLIED,152,1),p("TRB",i.ZP_REL,20,2),p("TRB",i.ABS,28,3),p("TSB",i.ZP_REL,4,2),p("TSB",i.ABS,12,3);const ha=65536,Ks=65792,qs=66048;class Ia{constructor(){P(this,"address");P(this,"watchpoint");P(this,"instruction");P(this,"disabled");P(this,"hidden");P(this,"once");P(this,"memget");P(this,"memset");P(this,"expression1");P(this,"expression2");P(this,"expressionOperator");P(this,"hexvalue");P(this,"hitcount");P(this,"nhits");P(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class Ns extends Map{set(e,r){const s=[...this.entries()];s.push([e,r]),s.sort((a,h)=>a[0]-h[0]),super.clear();for(const[a,h]of s)super.set(a,h);return this}}const ft={};ft[""]={name:"Any",min:0,max:65535},ft.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},ft.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},ft.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},ft["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},ft["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},ft["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},ft["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},ft["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},ft["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(ft).map(t=>t.name);let ao=!1,co=!1,Rt=new Ns;const Vr=()=>{ao=!0},fa=()=>{new Ns(Rt).forEach((s,a)=>{s.once&&Rt.delete(a)});const e=xa();if(e<0||Rt.get(e))return;const r=new Ia;r.address=e,r.once=!0,r.hidden=!0,Rt.set(e,r)},pa=t=>{Rt=t};let Os=!1;const ga=()=>{Os=!0,ft.MAIN.enabled=(t=0)=>t>=53248?!B.ALTZP.isSet&&B.BSRREADRAM.isSet:t>=512?!B.RAMRD.isSet:!B.ALTZP.isSet,ft.AUX.enabled=(t=0)=>t>=53248?B.ALTZP.isSet&&B.BSRREADRAM.isSet:t>=512?B.RAMRD.isSet:B.ALTZP.isSet,ft.ROM.enabled=()=>!B.BSRREADRAM.isSet,ft["MAIN-DXXX-1"].enabled=()=>!B.ALTZP.isSet&&B.BSRREADRAM.isSet&&!B.BSRBANK2.isSet,ft["MAIN-DXXX-2"].enabled=()=>!B.ALTZP.isSet&&B.BSRREADRAM.isSet&&B.BSRBANK2.isSet,ft["AUX-DXXX-1"].enabled=()=>B.ALTZP.isSet&&B.BSRREADRAM.isSet&&!B.BSRBANK2.isSet,ft["AUX-DXXX-2"].enabled=()=>B.ALTZP.isSet&&B.BSRREADRAM.isSet&&B.BSRBANK2.isSet,ft["CXXX-ROM"].enabled=(t=0)=>t>=49920&&t<=50175?B.INTCXROM.isSet||!B.SLOTC3ROM.isSet:t>=51200?B.INTCXROM.isSet||B.INTC8ROM.isSet:B.INTCXROM.isSet,ft["CXXX-CARD"].enabled=(t=0)=>t>=49920&&t<=50175?B.INTCXROM.isSet?!1:B.SLOTC3ROM.isSet:t>=51200?!B.INTCXROM.isSet&&!B.INTC8ROM.isSet:!B.INTCXROM.isSet},Ys=(t,e)=>{Os||ga();const r=ft[t];return!(e<r.min||e>r.max||r.enabled&&!(r!=null&&r.enabled(e)))},xs=(t,e,r)=>{const s=Rt.get(t);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!Ys(s.memoryBank,t)?!1:r?s.memset:s.memget},gr=(t=0,e=!0)=>{e?c.flagIRQ|=1<<t:c.flagIRQ&=~(1<<t),c.flagIRQ&=255},Sa=(t=!0)=>{c.flagNMI=t===!0},Ca=()=>{c.flagIRQ=0,c.flagNMI=!1},lo=[],Ws=[],Xs=(t,e)=>{lo.push(t),Ws.push(e)},Ea=()=>{for(let t=0;t<lo.length;t++)lo[t](Ws[t])},_s=t=>{let e=0;switch(t.register){case"$":e=Fa(t.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},Ba=t=>{const e=_s(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:_s(t.expression2)},Gs=()=>{co=!0},ma=(t=-1,e=-1)=>{if(co)return co=!1,!0;if(Rt.size===0||ao)return!1;const r=Rt.get(c.PC)||Rt.get(-1)||Rt.get(t|ha)||t>=0&&Rt.get(Ks)||t>=0&&Rt.get(qs);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===Ks){if(rt[t].name!=="???")return!1}else if(r.address===qs){if(rt[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!Ba(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!Ys(r.memoryBank,c.PC)?!1:(r.once&&Rt.delete(c.PC),!0)},uo=()=>{let t=0;const e=c.PC,r=m(c.PC,!1),s=rt[r],a=s.bytes>1?m(c.PC+1,!1):-1,h=s.bytes>2?m(c.PC+2,!1):0;if(ma(r,(h<<8)+a))return Jt(_.PAUSED),-1;ao=!1;const S=vs.get(e);if(S&&!B.INTCXROM.isSet&&S(),t=s.execute(a,h),oi(s.bytes),mr(c.cycleCount+t),Ea(),c.flagNMI&&(c.flagNMI=!1,t=_a(),mr(c.cycleCount+t)),c.flagIRQ){const u=Xa();u>0&&(mr(c.cycleCount+u),t=u)}return t},Da=[197,58,163,92,197,58,163,92],da=1,Zs=4;class wa{constructor(){P(this,"bits",[]);P(this,"pattern",new Array(64));P(this,"patternIdx",0);P(this,"reset",()=>{this.patternIdx=0});P(this,"checkPattern",e=>{const s=Da[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s});P(this,"calcBits",()=>{const e=q=>{this.bits.push(q&8?1:0),this.bits.push(q&4?1:0),this.bits.push(q&2?1:0),this.bits.push(q&1?1:0)},r=q=>{e(Math.floor(q/10)),e(Math.floor(q%10))},s=new Date,a=s.getFullYear()%100,h=s.getDate(),S=s.getDay()+1,u=s.getMonth()+1,D=s.getHours(),G=s.getMinutes(),y=s.getSeconds(),Z=s.getMilliseconds()/10;this.bits=[],r(a),r(u),r(h),r(S),r(D),r(G),r(y),r(Z)});P(this,"access",e=>{e&Zs?this.reset():this.checkPattern(e&da)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});P(this,"read",e=>{let r=-1;return this.bits.length>0?e&Zs&&(r=this.bits.pop()):this.access(e),r})}}const ka=new wa,Js=320,Vs=327,jr=256*Js,Ta=256*Vs;let jt=0;const ho=fe;let b=new Uint8Array(ho+(jt+1)*65536).fill(0);const Io=()=>Mt(49194),Hr=t=>{nt(49194,t)},Ne=()=>Mt(49267),fo=t=>{nt(49267,t)},Dt=new Array(257).fill(0),Yt=new Array(257).fill(0),js=t=>{let e="";switch(t){case"APPLE2EU":e=ua;break;case"APPLE2EE":e=la;break}const r=e.replace(/\n/g,""),s=new Uint8Array(Je.Buffer.from(r,"base64"));t==="APPLE2EU"&&(s[15035]=5),b.set(s,Ir)},po=t=>{t=Math.max(64,Math.min(8192,t));const e=jt;if(jt=Math.floor(t/64)-1,jt===e)return;Ne()>jt&&(fo(0),se());const r=ho+(jt+1)*65536;if(jt<e)b=b.slice(0,r);else{const s=b;b=new Uint8Array(r).fill(255),b.set(s)}},ya=()=>{const t=B.RAMRD.isSet?Ve+Ne()*256:0,e=B.RAMWRT.isSet?Ve+Ne()*256:0,r=B.PAGE2.isSet?Ve+Ne()*256:0,s=B.STORE80.isSet?r:t,a=B.STORE80.isSet?r:e,h=B.STORE80.isSet&&B.HIRES.isSet?r:t,S=B.STORE80.isSet&&B.HIRES.isSet?r:e;for(let u=2;u<256;u++)Dt[u]=u+t,Yt[u]=u+e;for(let u=4;u<=7;u++)Dt[u]=u+s,Yt[u]=u+a;for(let u=32;u<=63;u++)Dt[u]=u+h,Yt[u]=u+S},Ra=()=>{const t=B.ALTZP.isSet?Ve+Ne()*256:0;if(Dt[0]=t,Dt[1]=1+t,Yt[0]=t,Yt[1]=1+t,B.BSRREADRAM.isSet){for(let e=208;e<=255;e++)Dt[e]=e+t;if(!B.BSRBANK2.isSet)for(let e=208;e<=223;e++)Dt[e]=e-16+t}else for(let e=208;e<=255;e++)Dt[e]=hr+e-192},Pa=()=>{const t=B.ALTZP.isSet?Ve+Ne()*256:0,e=B.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Yt[r]=-1;if(e){for(let r=208;r<=255;r++)Yt[r]=r+t;if(!B.BSRBANK2.isSet)for(let r=208;r<=223;r++)Yt[r]=r-16+t}},Hs=t=>B.INTCXROM.isSet?!1:t!==3?!0:B.SLOTC3ROM.isSet,La=()=>!!(B.INTCXROM.isSet||B.INTC8ROM.isSet),go=t=>{if(t<=7){if(B.INTCXROM.isSet)return;t===3&&!B.SLOTC3ROM.isSet&&(B.INTC8ROM.isSet||(B.INTC8ROM.isSet=!0,Hr(255),se())),Io()===0&&(Hr(t),se())}else B.INTC8ROM.isSet=!1,Hr(0),se()},Ma=()=>{Dt[192]=hr-192;for(let t=1;t<=7;t++){const e=192+t;Dt[e]=t+(Hs(t)?Js-1:hr)}if(La())for(let t=200;t<=207;t++)Dt[t]=hr+t-192;else{const t=Vs+8*(Io()-1);for(let e=0;e<=7;e++){const r=200+e;Dt[r]=t+e}}},se=()=>{ya(),Ra(),Pa(),Ma();for(let t=0;t<256;t++)Dt[t]=256*Dt[t],Yt[t]=256*Yt[t]},vs=new Map,zs=new Array(8),vr=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(go(r),!Hs(r)))return;const s=zs[r];if(s!==void 0){const a=s(t,e);if(a>=0){const h=t>=49408?jr-256:Ir;b[t-49152+h]=a}}},Sr=(t,e)=>{zs[t]=e},ze=(t,e,r=0,s=()=>{})=>{if(b.set(e.slice(0,256),jr+(t-1)*256),e.length>256){const a=e.length>2304?2304:e.length,h=Ta+(t-1)*2048;b.set(e.slice(256,a),h)}r&&vs.set(r,s)},Qa=()=>{b.fill(255,0,65536),b.fill(255,ho),Hr(0),fo(0),se()},ba=t=>(t>=49296?vr(t):Fs(t,!1,c.cycleCount),t>=49232&&se(),b[Ir+t-49152]),z=(t,e)=>{const r=jr+(t-1)*256+(e&255);return b[r]},O=(t,e,r)=>{if(r>=0){const s=jr+(t-1)*256+(e&255);b[s]=r&255}},m=(t,e=!0)=>{let r=0;const s=t>>>8;if(s===192)r=ba(t);else if(r=-1,s>=193&&s<=199?(s==195&&!B.SLOTC3ROM.isSet&&(r=ka.read(t)),vr(t)):t===53247&&go(255),r<0){const a=Dt[s];r=b[a+(t&255)]}return e&&xs(t,r,!1)&&Gs(),r},Fa=t=>{const e=t>>>8,r=Dt[e];return b[r+(t&255)]},Ua=(t,e)=>{if(t===49265||t===49267){if(e>jt)return;fo(e)}else t>=49296?vr(t,e):Fs(t,!0,c.cycleCount);(t<=49167||t>=49232)&&se()},k=(t,e)=>{const r=t>>>8;if(r===192)Ua(t,e);else{r>=193&&r<=199?vr(t,e):t===53247&&go(255);const s=Yt[r];if(s<0)return;b[s+(t&255)]=e}xs(t,e,!0)&&Gs()},Mt=t=>b[Ir+t-49152],nt=(t,e,r=1)=>{const s=Ir+t-49152;b.fill(e,s,s+r)},$s=1024,ti=2048,So=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Co=(t=!1)=>{let e=0,r=24,s=!1;if(t){if(B.TEXT.isSet||B.HIRES.isSet)return new Uint8Array;r=B.MIXED.isSet?20:24,s=B.COLUMN80.isSet&&!B.AN3.isSet}else{if(!B.TEXT.isSet&&!B.MIXED.isSet)return new Uint8Array;!B.TEXT.isSet&&B.MIXED.isSet&&(e=20),s=B.COLUMN80.isSet}if(s){const a=B.PAGE2.isSet&&!B.STORE80.isSet?ti:$s,h=new Uint8Array(80*(r-e)).fill(160);for(let S=e;S<r;S++){const u=80*(S-e);for(let D=0;D<40;D++)h[u+2*D+1]=b[a+So[S]+D],h[u+2*D]=b[fe+a+So[S]+D]}return h}else{const a=B.PAGE2.isSet?ti:$s,h=new Uint8Array(40*(r-e));for(let S=e;S<r;S++){const u=40*(S-e),D=a+So[S];h.set(b.slice(D,D+40),u)}return h}},ei=()=>Je.Buffer.from(Co().map(t=>t&=127)).toString(),Ka=()=>{if(B.TEXT.isSet||!B.HIRES.isSet)return new Uint8Array;const t=B.COLUMN80.isSet&&!B.AN3.isSet,e=B.MIXED.isSet?160:192;if(t){const r=B.PAGE2.isSet&&!B.STORE80.isSet?16384:8192,s=new Uint8Array(80*e);for(let a=0;a<e;a++){const h=PA(r,a);for(let S=0;S<40;S++)s[a*80+2*S+1]=b[h+S],s[a*80+2*S]=b[fe+h+S]}return s}else{const r=B.PAGE2.isSet?16384:8192,s=new Uint8Array(40*e);for(let a=0;a<e;a++){const h=r+40*Math.trunc(a/64)+1024*(a%8)+128*(Math.trunc(a/8)&7);s.set(b.slice(h,h+40),a*40)}return s}},Eo=t=>{const e=Dt[t>>>8];return b.slice(e,e+512)},Bo=(t,e)=>{const r=Yt[t>>>8]+(t&255);b.set(e,r)},mo=(t,e)=>{for(let r=0;r<e.length;r++)if(m(t+r,!1)!==e[r])return!1;return!0},qa=()=>b.slice(0,fe+65536),c=kA(),Cr=t=>{c.Accum=t},Er=t=>{c.XReg=t},Br=t=>{c.YReg=t},mr=t=>{c.cycleCount=t},ri=t=>{ni(),Object.assign(c,t)},ni=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,Ht(m(65533,!1)*256+m(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},oi=t=>{Ht((c.PC+t+65536)%65536)},Ht=t=>{c.PC=t},si=t=>{c.PStatus=t|48},vt=new Array(256).fill(""),Na=()=>vt.slice(0,256),Oa=t=>{vt.splice(0,t.length,...t)},Ya=()=>{const t=Eo(256).slice(0,256),e=new Array;for(let r=255;r>c.StackPtr;r--){let s="$"+pt(t[r]),a=vt[r];vt[r].length>3&&r-1>c.StackPtr&&(vt[r-1]==="JSR"||vt[r-1]==="BRK"||vt[r-1]==="IRQ"?(r--,s+=pt(t[r])):a=""),s=(s+"   ").substring(0,6),e.push(pt(256+r,4)+": "+s+a)}return e.join(`
`)},xa=()=>{const t=Eo(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const r=t[e];if(vt[e].startsWith("JSR")&&e-1>c.StackPtr&&vt[e-1]==="JSR"){const s=t[e-1]+1;return(r<<8)+s}}return-1},ie=(t,e)=>{vt[c.StackPtr]=t,k(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},Ae=()=>{c.StackPtr=(c.StackPtr+1)%256;const t=m(256+c.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},xt=()=>(c.PStatus&1)!==0,N=(t=!0)=>c.PStatus=t?c.PStatus|1:c.PStatus&254,ii=()=>(c.PStatus&2)!==0,Dr=(t=!0)=>c.PStatus=t?c.PStatus|2:c.PStatus&253,Wa=()=>(c.PStatus&4)!==0,Do=(t=!0)=>c.PStatus=t?c.PStatus|4:c.PStatus&251,Ai=()=>(c.PStatus&8)!==0,St=()=>Ai()?1:0,wo=(t=!0)=>c.PStatus=t?c.PStatus|8:c.PStatus&247,ko=(t=!0)=>c.PStatus=t?c.PStatus|16:c.PStatus&239,ai=()=>(c.PStatus&64)!==0,dr=(t=!0)=>c.PStatus=t?c.PStatus|64:c.PStatus&191,ci=()=>(c.PStatus&128)!==0,li=(t=!0)=>c.PStatus=t?c.PStatus|128:c.PStatus&127,R=t=>{Dr(t===0),li(t>=128)},K=(t,e)=>(t+e+256)%256,T=(t,e)=>e*256+t,Y=(t,e,r)=>(e*256+t+r+65536)%65536,At=(t,e)=>t>>8!==e>>8?1:0,ae=(t,e)=>{if(t){const r=c.PC;return oi(e>127?e-256:e),3+At(r+2,c.PC+2)}return 2},rt=new Array(256),I=(t,e,r,s,a,h=!1)=>{console.assert(!rt[r],"Duplicate instruction: "+t+" mode="+e),rt[r]={name:t,pcode:r,mode:e,bytes:s,execute:a,is6502:!h}},$=!0,ge=(t,e,r)=>{const s=m(t),a=m((t+1)%256),h=Y(s,a,c.YReg);e(h);let S=5+At(h,T(s,a));return r&&(S+=St()),S},Se=(t,e,r)=>{const s=m(t),a=m((t+1)%256),h=T(s,a);e(h);let S=5;return r&&(S+=St()),S},ui=t=>{let e=(c.Accum&15)+(t&15)+(xt()?1:0);e>=10&&(e+=6);let r=(c.Accum&240)+(t&240)+e;const s=c.Accum<=127&&t<=127,a=c.Accum>=128&&t>=128;dr((r&255)>=128?s:a),N(r>=160),xt()&&(r+=96),c.Accum=r&255,R(c.Accum)},zr=t=>{let e=c.Accum+t+(xt()?1:0);N(e>=256),e=e%256;const r=c.Accum<=127&&t<=127,s=c.Accum>=128&&t>=128;dr(e>=128?r:s),c.Accum=e,R(c.Accum)},Ce=t=>{Ai()?ui(m(t)):zr(m(t))};I("ADC",i.IMM,105,2,t=>(St()?ui(t):zr(t),2+St())),I("ADC",i.ZP_REL,101,2,t=>(Ce(t),3+St())),I("ADC",i.ZP_X,117,2,t=>(Ce(K(t,c.XReg)),4+St())),I("ADC",i.ABS,109,3,(t,e)=>(Ce(T(t,e)),4+St())),I("ADC",i.ABS_X,125,3,(t,e)=>{const r=Y(t,e,c.XReg);return Ce(r),4+St()+At(r,T(t,e))}),I("ADC",i.ABS_Y,121,3,(t,e)=>{const r=Y(t,e,c.YReg);return Ce(r),4+St()+At(r,T(t,e))}),I("ADC",i.IND_X,97,2,t=>{const e=K(t,c.XReg);return Ce(T(m(e),m(e+1))),6+St()}),I("ADC",i.IND_Y,113,2,t=>ge(t,Ce,!0)),I("ADC",i.IND,114,2,t=>Se(t,Ce,!0),$);const Ee=t=>{c.Accum&=m(t),R(c.Accum)};I("AND",i.IMM,41,2,t=>(c.Accum&=t,R(c.Accum),2)),I("AND",i.ZP_REL,37,2,t=>(Ee(t),3)),I("AND",i.ZP_X,53,2,t=>(Ee(K(t,c.XReg)),4)),I("AND",i.ABS,45,3,(t,e)=>(Ee(T(t,e)),4)),I("AND",i.ABS_X,61,3,(t,e)=>{const r=Y(t,e,c.XReg);return Ee(r),4+At(r,T(t,e))}),I("AND",i.ABS_Y,57,3,(t,e)=>{const r=Y(t,e,c.YReg);return Ee(r),4+At(r,T(t,e))}),I("AND",i.IND_X,33,2,t=>{const e=K(t,c.XReg);return Ee(T(m(e),m(e+1))),6}),I("AND",i.IND_Y,49,2,t=>ge(t,Ee,!1)),I("AND",i.IND,50,2,t=>Se(t,Ee,!1),$);const $r=t=>{let e=m(t);m(t),N((e&128)===128),e=(e<<1)%256,k(t,e),R(e)};I("ASL",i.IMPLIED,10,1,()=>(N((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,R(c.Accum),2)),I("ASL",i.ZP_REL,6,2,t=>($r(t),5)),I("ASL",i.ZP_X,22,2,t=>($r(K(t,c.XReg)),6)),I("ASL",i.ABS,14,3,(t,e)=>($r(T(t,e)),6)),I("ASL",i.ABS_X,30,3,(t,e)=>{const r=Y(t,e,c.XReg);return $r(r),6+At(r,T(t,e))}),I("BCC",i.ZP_REL,144,2,t=>ae(!xt(),t)),I("BCS",i.ZP_REL,176,2,t=>ae(xt(),t)),I("BEQ",i.ZP_REL,240,2,t=>ae(ii(),t)),I("BMI",i.ZP_REL,48,2,t=>ae(ci(),t)),I("BNE",i.ZP_REL,208,2,t=>ae(!ii(),t)),I("BPL",i.ZP_REL,16,2,t=>ae(!ci(),t)),I("BVC",i.ZP_REL,80,2,t=>ae(!ai(),t)),I("BVS",i.ZP_REL,112,2,t=>ae(ai(),t)),I("BRA",i.ZP_REL,128,2,t=>ae(!0,t),$);const tn=t=>{Dr((c.Accum&t)===0),li((t&128)!==0),dr((t&64)!==0)};I("BIT",i.ZP_REL,36,2,t=>(tn(m(t)),3)),I("BIT",i.ABS,44,3,(t,e)=>(tn(m(T(t,e))),4)),I("BIT",i.IMM,137,2,t=>(Dr((c.Accum&t)===0),2),$),I("BIT",i.ZP_X,52,2,t=>(tn(m(K(t,c.XReg))),4),$),I("BIT",i.ABS_X,60,3,(t,e)=>{const r=Y(t,e,c.XReg);return tn(m(r)),4+At(r,T(t,e))},$);const To=(t,e,r=0)=>{const s=(c.PC+r)%65536,a=m(e),h=m(e+1);ie(`${t} $`+pt(h)+pt(a),Math.trunc(s/256)),ie(t,s%256),ie("P",c.PStatus),wo(!1),Do();const S=Y(a,h,t==="BRK"?-1:0);Ht(S)},hi=()=>(ko(),To("BRK",65534,2),7);I("BRK",i.IMPLIED,0,1,hi);const Xa=()=>Wa()?0:(ko(!1),To("IRQ",65534),7),_a=()=>(To("NMI",65530),7);I("CLC",i.IMPLIED,24,1,()=>(N(!1),2)),I("CLD",i.IMPLIED,216,1,()=>(wo(!1),2)),I("CLI",i.IMPLIED,88,1,()=>(Do(!1),2)),I("CLV",i.IMPLIED,184,1,()=>(dr(!1),2));const Oe=t=>{const e=m(t);N(c.Accum>=e),R((c.Accum-e+256)%256)},Ga=t=>{const e=m(t);N(c.Accum>=e),R((c.Accum-e+256)%256)};I("CMP",i.IMM,201,2,t=>(N(c.Accum>=t),R((c.Accum-t+256)%256),2)),I("CMP",i.ZP_REL,197,2,t=>(Oe(t),3)),I("CMP",i.ZP_X,213,2,t=>(Oe(K(t,c.XReg)),4)),I("CMP",i.ABS,205,3,(t,e)=>(Oe(T(t,e)),4)),I("CMP",i.ABS_X,221,3,(t,e)=>{const r=Y(t,e,c.XReg);return Ga(r),4+At(r,T(t,e))}),I("CMP",i.ABS_Y,217,3,(t,e)=>{const r=Y(t,e,c.YReg);return Oe(r),4+At(r,T(t,e))}),I("CMP",i.IND_X,193,2,t=>{const e=K(t,c.XReg);return Oe(T(m(e),m(e+1))),6}),I("CMP",i.IND_Y,209,2,t=>ge(t,Oe,!1)),I("CMP",i.IND,210,2,t=>Se(t,Oe,!1),$);const Ii=t=>{const e=m(t);N(c.XReg>=e),R((c.XReg-e+256)%256)};I("CPX",i.IMM,224,2,t=>(N(c.XReg>=t),R((c.XReg-t+256)%256),2)),I("CPX",i.ZP_REL,228,2,t=>(Ii(t),3)),I("CPX",i.ABS,236,3,(t,e)=>(Ii(T(t,e)),4));const fi=t=>{const e=m(t);N(c.YReg>=e),R((c.YReg-e+256)%256)};I("CPY",i.IMM,192,2,t=>(N(c.YReg>=t),R((c.YReg-t+256)%256),2)),I("CPY",i.ZP_REL,196,2,t=>(fi(t),3)),I("CPY",i.ABS,204,3,(t,e)=>(fi(T(t,e)),4));const en=t=>{const e=K(m(t),-1);k(t,e),R(e)};I("DEC",i.IMPLIED,58,1,()=>(c.Accum=K(c.Accum,-1),R(c.Accum),2),$),I("DEC",i.ZP_REL,198,2,t=>(en(t),5)),I("DEC",i.ZP_X,214,2,t=>(en(K(t,c.XReg)),6)),I("DEC",i.ABS,206,3,(t,e)=>(en(T(t,e)),6)),I("DEC",i.ABS_X,222,3,(t,e)=>{const r=Y(t,e,c.XReg);return m(r),en(r),7}),I("DEX",i.IMPLIED,202,1,()=>(c.XReg=K(c.XReg,-1),R(c.XReg),2)),I("DEY",i.IMPLIED,136,1,()=>(c.YReg=K(c.YReg,-1),R(c.YReg),2));const Be=t=>{c.Accum^=m(t),R(c.Accum)};I("EOR",i.IMM,73,2,t=>(c.Accum^=t,R(c.Accum),2)),I("EOR",i.ZP_REL,69,2,t=>(Be(t),3)),I("EOR",i.ZP_X,85,2,t=>(Be(K(t,c.XReg)),4)),I("EOR",i.ABS,77,3,(t,e)=>(Be(T(t,e)),4)),I("EOR",i.ABS_X,93,3,(t,e)=>{const r=Y(t,e,c.XReg);return Be(r),4+At(r,T(t,e))}),I("EOR",i.ABS_Y,89,3,(t,e)=>{const r=Y(t,e,c.YReg);return Be(r),4+At(r,T(t,e))}),I("EOR",i.IND_X,65,2,t=>{const e=K(t,c.XReg);return Be(T(m(e),m(e+1))),6}),I("EOR",i.IND_Y,81,2,t=>ge(t,Be,!1)),I("EOR",i.IND,82,2,t=>Se(t,Be,!1),$);const rn=t=>{const e=K(m(t),1);k(t,e),R(e)};I("INC",i.IMPLIED,26,1,()=>(c.Accum=K(c.Accum,1),R(c.Accum),2),$),I("INC",i.ZP_REL,230,2,t=>(rn(t),5)),I("INC",i.ZP_X,246,2,t=>(rn(K(t,c.XReg)),6)),I("INC",i.ABS,238,3,(t,e)=>(rn(T(t,e)),6)),I("INC",i.ABS_X,254,3,(t,e)=>{const r=Y(t,e,c.XReg);return m(r),rn(r),7}),I("INX",i.IMPLIED,232,1,()=>(c.XReg=K(c.XReg,1),R(c.XReg),2)),I("INY",i.IMPLIED,200,1,()=>(c.YReg=K(c.YReg,1),R(c.YReg),2)),I("JMP",i.ABS,76,3,(t,e)=>(Ht(Y(t,e,-3)),3)),I("JMP",i.IND,108,3,(t,e)=>{const r=T(t,e);return t=m(r),e=m((r+1)%65536),Ht(Y(t,e,-3)),6}),I("JMP",i.IND_X,124,3,(t,e)=>{const r=Y(t,e,c.XReg);return t=m(r),e=m((r+1)%65536),Ht(Y(t,e,-3)),6},$),I("JSR",i.ABS,32,3,(t,e)=>{const r=(c.PC+2)%65536;return ie("JSR $"+pt(e)+pt(t),Math.trunc(r/256)),ie("JSR",r%256),Ht(Y(t,e,-3)),6});const me=t=>{c.Accum=m(t),R(c.Accum)};I("LDA",i.IMM,169,2,t=>(c.Accum=t,R(c.Accum),2)),I("LDA",i.ZP_REL,165,2,t=>(me(t),3)),I("LDA",i.ZP_X,181,2,t=>(me(K(t,c.XReg)),4)),I("LDA",i.ABS,173,3,(t,e)=>(me(T(t,e)),4)),I("LDA",i.ABS_X,189,3,(t,e)=>{const r=Y(t,e,c.XReg);return me(r),4+At(r,T(t,e))}),I("LDA",i.ABS_Y,185,3,(t,e)=>{const r=Y(t,e,c.YReg);return me(r),4+At(r,T(t,e))}),I("LDA",i.IND_X,161,2,t=>{const e=K(t,c.XReg);return me(T(m(e),m((e+1)%256))),6}),I("LDA",i.IND_Y,177,2,t=>ge(t,me,!1)),I("LDA",i.IND,178,2,t=>Se(t,me,!1),$);const nn=t=>{c.XReg=m(t),R(c.XReg)};I("LDX",i.IMM,162,2,t=>(c.XReg=t,R(c.XReg),2)),I("LDX",i.ZP_REL,166,2,t=>(nn(t),3)),I("LDX",i.ZP_Y,182,2,t=>(nn(K(t,c.YReg)),4)),I("LDX",i.ABS,174,3,(t,e)=>(nn(T(t,e)),4)),I("LDX",i.ABS_Y,190,3,(t,e)=>{const r=Y(t,e,c.YReg);return nn(r),4+At(r,T(t,e))});const on=t=>{c.YReg=m(t),R(c.YReg)};I("LDY",i.IMM,160,2,t=>(c.YReg=t,R(c.YReg),2)),I("LDY",i.ZP_REL,164,2,t=>(on(t),3)),I("LDY",i.ZP_X,180,2,t=>(on(K(t,c.XReg)),4)),I("LDY",i.ABS,172,3,(t,e)=>(on(T(t,e)),4)),I("LDY",i.ABS_X,188,3,(t,e)=>{const r=Y(t,e,c.XReg);return on(r),4+At(r,T(t,e))});const sn=t=>{let e=m(t);m(t),N((e&1)===1),e>>=1,k(t,e),R(e)};I("LSR",i.IMPLIED,74,1,()=>(N((c.Accum&1)===1),c.Accum>>=1,R(c.Accum),2)),I("LSR",i.ZP_REL,70,2,t=>(sn(t),5)),I("LSR",i.ZP_X,86,2,t=>(sn(K(t,c.XReg)),6)),I("LSR",i.ABS,78,3,(t,e)=>(sn(T(t,e)),6)),I("LSR",i.ABS_X,94,3,(t,e)=>{const r=Y(t,e,c.XReg);return sn(r),6+At(r,T(t,e))}),I("NOP",i.IMPLIED,234,1,()=>2);const De=t=>{c.Accum|=m(t),R(c.Accum)};I("ORA",i.IMM,9,2,t=>(c.Accum|=t,R(c.Accum),2)),I("ORA",i.ZP_REL,5,2,t=>(De(t),3)),I("ORA",i.ZP_X,21,2,t=>(De(K(t,c.XReg)),4)),I("ORA",i.ABS,13,3,(t,e)=>(De(T(t,e)),4)),I("ORA",i.ABS_X,29,3,(t,e)=>{const r=Y(t,e,c.XReg);return De(r),4+At(r,T(t,e))}),I("ORA",i.ABS_Y,25,3,(t,e)=>{const r=Y(t,e,c.YReg);return De(r),4+At(r,T(t,e))}),I("ORA",i.IND_X,1,2,t=>{const e=K(t,c.XReg);return De(T(m(e),m(e+1))),6}),I("ORA",i.IND_Y,17,2,t=>ge(t,De,!1)),I("ORA",i.IND,18,2,t=>Se(t,De,!1),$),I("PHA",i.IMPLIED,72,1,()=>(ie("PHA",c.Accum),3)),I("PHP",i.IMPLIED,8,1,()=>(ie("PHP",c.PStatus|16),3)),I("PHX",i.IMPLIED,218,1,()=>(ie("PHX",c.XReg),3),$),I("PHY",i.IMPLIED,90,1,()=>(ie("PHY",c.YReg),3),$),I("PLA",i.IMPLIED,104,1,()=>(c.Accum=Ae(),R(c.Accum),4)),I("PLP",i.IMPLIED,40,1,()=>(si(Ae()),4)),I("PLX",i.IMPLIED,250,1,()=>(c.XReg=Ae(),R(c.XReg),4),$),I("PLY",i.IMPLIED,122,1,()=>(c.YReg=Ae(),R(c.YReg),4),$);const An=t=>{let e=m(t);m(t);const r=xt()?1:0;N((e&128)===128),e=(e<<1)%256|r,k(t,e),R(e)};I("ROL",i.IMPLIED,42,1,()=>{const t=xt()?1:0;return N((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|t,R(c.Accum),2}),I("ROL",i.ZP_REL,38,2,t=>(An(t),5)),I("ROL",i.ZP_X,54,2,t=>(An(K(t,c.XReg)),6)),I("ROL",i.ABS,46,3,(t,e)=>(An(T(t,e)),6)),I("ROL",i.ABS_X,62,3,(t,e)=>{const r=Y(t,e,c.XReg);return An(r),6+At(r,T(t,e))});const an=t=>{let e=m(t);m(t);const r=xt()?128:0;N((e&1)===1),e=e>>1|r,k(t,e),R(e)};I("ROR",i.IMPLIED,106,1,()=>{const t=xt()?128:0;return N((c.Accum&1)===1),c.Accum=c.Accum>>1|t,R(c.Accum),2}),I("ROR",i.ZP_REL,102,2,t=>(an(t),5)),I("ROR",i.ZP_X,118,2,t=>(an(K(t,c.XReg)),6)),I("ROR",i.ABS,110,3,(t,e)=>(an(T(t,e)),6)),I("ROR",i.ABS_X,126,3,(t,e)=>{const r=Y(t,e,c.XReg);return an(r),6+At(r,T(t,e))}),I("RTI",i.IMPLIED,64,1,()=>(si(Ae()),ko(!1),Ht(T(Ae(),Ae())-1),6)),I("RTS",i.IMPLIED,96,1,()=>(Ht(T(Ae(),Ae())),6));const pi=t=>{const e=255-t;let r=c.Accum+e+(xt()?1:0);const s=r>=256,a=c.Accum<=127&&e<=127,h=c.Accum>=128&&e>=128;dr(r%256>=128?a:h);const S=(c.Accum&15)-(t&15)+(xt()?0:-1);r=c.Accum-t+(xt()?0:-1),r<0&&(r-=96),S<0&&(r-=6),c.Accum=r&255,R(c.Accum),N(s)},de=t=>{St()?pi(m(t)):zr(255-m(t))};I("SBC",i.IMM,233,2,t=>(St()?pi(t):zr(255-t),2+St())),I("SBC",i.ZP_REL,229,2,t=>(de(t),3+St())),I("SBC",i.ZP_X,245,2,t=>(de(K(t,c.XReg)),4+St())),I("SBC",i.ABS,237,3,(t,e)=>(de(T(t,e)),4+St())),I("SBC",i.ABS_X,253,3,(t,e)=>{const r=Y(t,e,c.XReg);return de(r),4+St()+At(r,T(t,e))}),I("SBC",i.ABS_Y,249,3,(t,e)=>{const r=Y(t,e,c.YReg);return de(r),4+St()+At(r,T(t,e))}),I("SBC",i.IND_X,225,2,t=>{const e=K(t,c.XReg);return de(T(m(e),m(e+1))),6+St()}),I("SBC",i.IND_Y,241,2,t=>ge(t,de,!0)),I("SBC",i.IND,242,2,t=>Se(t,de,!0),$),I("SEC",i.IMPLIED,56,1,()=>(N(),2)),I("SED",i.IMPLIED,248,1,()=>(wo(),2)),I("SEI",i.IMPLIED,120,1,()=>(Do(),2)),I("STA",i.ZP_REL,133,2,t=>(k(t,c.Accum),3)),I("STA",i.ZP_X,149,2,t=>(k(K(t,c.XReg),c.Accum),4)),I("STA",i.ABS,141,3,(t,e)=>(k(T(t,e),c.Accum),4)),I("STA",i.ABS_X,157,3,(t,e)=>{const r=Y(t,e,c.XReg);return m(r),k(r,c.Accum),5}),I("STA",i.ABS_Y,153,3,(t,e)=>(k(Y(t,e,c.YReg),c.Accum),5)),I("STA",i.IND_X,129,2,t=>{const e=K(t,c.XReg);return k(T(m(e),m(e+1)),c.Accum),6});const gi=t=>{k(t,c.Accum)};I("STA",i.IND_Y,145,2,t=>(ge(t,gi,!1),6)),I("STA",i.IND,146,2,t=>Se(t,gi,!1),$),I("STX",i.ZP_REL,134,2,t=>(k(t,c.XReg),3)),I("STX",i.ZP_Y,150,2,t=>(k(K(t,c.YReg),c.XReg),4)),I("STX",i.ABS,142,3,(t,e)=>(k(T(t,e),c.XReg),4)),I("STY",i.ZP_REL,132,2,t=>(k(t,c.YReg),3)),I("STY",i.ZP_X,148,2,t=>(k(K(t,c.XReg),c.YReg),4)),I("STY",i.ABS,140,3,(t,e)=>(k(T(t,e),c.YReg),4)),I("STZ",i.ZP_REL,100,2,t=>(k(t,0),3),$),I("STZ",i.ZP_X,116,2,t=>(k(K(t,c.XReg),0),4),$),I("STZ",i.ABS,156,3,(t,e)=>(k(T(t,e),0),4),$),I("STZ",i.ABS_X,158,3,(t,e)=>{const r=Y(t,e,c.XReg);return m(r),k(r,0),5},$),I("TAX",i.IMPLIED,170,1,()=>(c.XReg=c.Accum,R(c.XReg),2)),I("TAY",i.IMPLIED,168,1,()=>(c.YReg=c.Accum,R(c.YReg),2)),I("TSX",i.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,R(c.XReg),2)),I("TXA",i.IMPLIED,138,1,()=>(c.Accum=c.XReg,R(c.Accum),2)),I("TXS",i.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),I("TYA",i.IMPLIED,152,1,()=>(c.Accum=c.YReg,R(c.Accum),2));const Si=t=>{const e=m(t);Dr((c.Accum&e)===0),k(t,e&~c.Accum)};I("TRB",i.ZP_REL,20,2,t=>(Si(t),5),$),I("TRB",i.ABS,28,3,(t,e)=>(Si(T(t,e)),6),$);const Ci=t=>{const e=m(t);Dr((c.Accum&e)===0),k(t,e|c.Accum)};I("TSB",i.ZP_REL,4,2,t=>(Ci(t),5),$),I("TSB",i.ABS,12,3,(t,e)=>(Ci(T(t,e)),6),$);const Za=[2,34,66,98,130,194,226],Wt="???";Za.forEach(t=>{I(Wt,i.IMPLIED,t,2,()=>2),rt[t].is6502=!1});for(let t=0;t<=15;t++)I(Wt,i.IMPLIED,3+16*t,1,()=>1),rt[3+16*t].is6502=!1,I(Wt,i.IMPLIED,7+16*t,1,()=>1),rt[7+16*t].is6502=!1,I(Wt,i.IMPLIED,11+16*t,1,()=>1),rt[11+16*t].is6502=!1,I(Wt,i.IMPLIED,15+16*t,1,()=>1),rt[15+16*t].is6502=!1;I(Wt,i.IMPLIED,68,2,()=>3),rt[68].is6502=!1,I(Wt,i.IMPLIED,84,2,()=>4),rt[84].is6502=!1,I(Wt,i.IMPLIED,212,2,()=>4),rt[212].is6502=!1,I(Wt,i.IMPLIED,244,2,()=>4),rt[244].is6502=!1,I(Wt,i.IMPLIED,92,3,()=>8),rt[92].is6502=!1,I(Wt,i.IMPLIED,220,3,()=>4),rt[220].is6502=!1,I(Wt,i.IMPLIED,252,3,()=>4),rt[252].is6502=!1;for(let t=0;t<256;t++)rt[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),I("BRK",i.IMPLIED,t,1,hi));const Ja=()=>{const t=new Array(256);for(let e=0;e<256;e++)t[e]={name:rt[e].name,mode:rt[e].mode,pcode:rt[e].pcode,bytes:rt[e].bytes,is6502:rt[e].is6502};$1(t)},yt=(t,e,r)=>{const s=e&7,a=e>>>3;return t[a]|=r>>>s,s&&(t[a+1]|=r<<8-s),e+8},cn=(t,e,r)=>(e=yt(t,e,r>>>1|170),e=yt(t,e,r|170),e),yo=(t,e)=>(e=yt(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Va=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),s=[0,2,1,3];for(let h=0;h<84;h++)r[h]=s[t[h]&3]|s[t[h+86]&3]<<2|s[t[h+172]&3]<<4;r[84]=s[t[84]&3]<<0|s[t[170]&3]<<2,r[85]=s[t[85]&3]<<0|s[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let a=342;for(;a>1;)a--,r[a]^=r[a-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const ja=(t,e,r)=>{let s=0;const a=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)s=yo(a,s);for(let h=0;h<16;h++){s=yt(a,s,213),s=yt(a,s,170),s=yt(a,s,150),s=cn(a,s,254),s=cn(a,s,e),s=cn(a,s,h),s=cn(a,s,254^e^h),s=yt(a,s,222),s=yt(a,s,170),s=yt(a,s,235);for(let D=0;D<7;D++)s=yo(a,s);s=yt(a,s,213),s=yt(a,s,170),s=yt(a,s,173);const S=h===15?15:h*(r?8:7)%15,u=Va(t.slice(S*256,S*256+256));for(let D=0;D<u.length;D++)s=yt(a,s,u[D]);s=yt(a,s,222),s=yt(a,s,170),s=yt(a,s,235);for(let D=0;D<16;D++)s=yo(a,s)}return a},Ha=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const s=new Uint8Array(1536+r*13*512).fill(0);s.set(fr(`WOZ2ÿ
\r
`),0),s.set(fr("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(fr("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(fr("TMAP"),80),s[84]=160,s.fill(255,88,248);let a=0;for(let h=0;h<r;h++)a=88+(h<<2),h>0&&(s[a-1]=h),s[a]=s[a+1]=h;s.set(fr("TRKS"),248),s.set(ls(1280+r*13*512),252);for(let h=0;h<r;h++){a=256+(h<<3),s.set(TA(3+h*13),a),s[a+2]=13,s.set(ls(50304),a+4);const S=t.slice(h*16*256,(h+1)*16*256),u=ja(S,h,e);a=1536+h*13*512,s.set(u,a)}return s},va=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,D)=>u!==e[D])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const a=e.slice(8,12),h=a[0]+(a[1]<<8)+(a[2]<<16)+a[3]*2**24,S=RA(e,12);if(h!==0&&h!==S)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const D=e[88+u*2];if(D<255){const G=256+8*D,y=e.slice(G,G+8);t.trackStart[u]=512*((y[1]<<8)+y[0]),t.trackNbits[u]=y[4]+(y[5]<<8)+(y[6]<<16)+y[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},za=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((a,h)=>a!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let a=0;a<80;a++){const h=e[88+a*2];if(h<255){t.trackStart[a]=256+h*6656;const S=e.slice(t.trackStart[a]+6646,t.trackStart[a]+6656);t.trackNbits[a]=S[2]+(S[3]<<8),t.maxHalftrack=a}else t.trackStart[a]=0,t.trackNbits[a]=51200}return!0},$a=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return r||s},tc=(t,e)=>{const s=t.filename.toLowerCase().endsWith(".po"),a=Ha(e,s);return a.length===0?new Uint8Array:(t.filename=us(t.filename,"woz"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),a)},Ei=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),ec=(t,e)=>{const r=Ei(e.slice(24,28)),s=Ei(e.slice(28,32));let a="";for(let h=0;h<wA;h++)a+=String.fromCharCode(e[h]);return a!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=us(t.filename,"hdv"),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),e.slice(r,r+s))},rc=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(hs(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return ec(t,e)}return $a(t.filename)&&(e=tc(t,e)),va(t,e)||za(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},nc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let $e=0,gt=0,Pt=0,ln=!1,Ro=!1;const Bi=t=>{ln=!1,yi(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},oc=(t=!1)=>{if(t){const e=pn();e.motorRunning&&Ri(e)}else Ar(Me.MOTOR_OFF)},mi=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(Ar(Me.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):Ar(Me.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,qt(),Pt+=r,t.trackLocation+=Math.floor(Pt/4),Pt=Pt%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let Di=0;const sc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],di=()=>(Di++,sc[Di&31]);let un=0;const ic=t=>(un<<=1,un|=t,un&=15,un===0?di():t),wi=[128,64,32,16,8,4,2,1],Ac=[127,191,223,239,247,251,253,254],hn=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3),a=e[s],h=t.trackLocation&7;r=(a&wi[h])>>7-h,r=ic(r)}else r=di();return t.trackLocation++,r},ac=()=>Math.floor(256*Math.random()),ki=(t,e,r)=>{if(e.length===0)return ac();let s=0;if(t.isSynchronized){for(Pt+=r;Pt>=4;){const a=hn(t,e);if((gt>0||a)&&(gt=gt<<1|a),Pt-=4,gt&128&&Pt<=6)break}Pt<0&&(Pt=0),gt&=255}else if(gt===0){for(;hn(t,e)===0;);gt=64;for(let a=5;a>=0;a--)gt|=hn(t,e)<<a}else{const a=hn(t,e);gt=gt<<1|a}return s=gt,gt>127&&(gt=0),s};let ce=0;const Po=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const s=t.trackStart[t.halftrack]+(t.trackLocation>>3);let a=e[s];const h=t.trackLocation&7;r?a|=wi[h]:a&=Ac[h],e[s]=a}t.trackLocation++},Ti=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&gt>0){if(r>=16)for(let s=7;s>=0;s--)Po(t,e,gt&2**s?1:0);r>=36&&Po(t,e,0),r>=40&&Po(t,e,0),Lo.push(r>=40?2:r>=36?1:gt),t.diskHasChanges=!0,t.lastWriteTime=Date.now(),gt=0}},yi=t=>{$e=0,ln||(t.motorRunning=!1),qt(),Ar(Me.MOTOR_OFF)},Ri=t=>{$e?(clearTimeout($e),$e=0):Pt=0,t.motorRunning=!0,qt(),Ar(Me.MOTOR_ON)},cc=t=>{$e===0&&($e=setTimeout(()=>yi(t),1e3))};let Lo=[];const In=t=>{Lo.length>0&&t.halftrack===2*0&&(Lo=[])},fn=[0,0,0,0],lc=(t,e)=>{if(t>=49408)return-1;let r=pn();const s=Ic();if(r.hardDrive)return 0;let a=0;const h=c.cycleCount-ce;switch(t=t&15,t){case 9:ln=!0,Ri(r),In(r);break;case 8:r.motorRunning&&!r.writeMode&&(a=ki(r,s,h),ce=c.cycleCount),ln=!1,cc(r),In(r);break;case 10:case 11:{const S=t===10?2:3,u=pn();hc(S),r=pn(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,qt());break}case 12:Ro=!1,r.motorRunning&&!r.writeMode&&(a=ki(r,s,h),ce=c.cycleCount);break;case 13:Ro=!0,r.motorRunning&&(r.writeMode?(Ti(r,s,h),ce=c.cycleCount):(gt=0,Pt+=h,r.trackLocation+=Math.floor(Pt/4),Pt=Pt%4,ce=c.cycleCount),e>=0&&(gt=e));break;case 14:r.motorRunning&&r.writeMode&&(Ti(r,s,h),r.lastWriteTime=Date.now(),ce=c.cycleCount),r.writeMode=!1,Ro&&(a=r.isWriteProtected?255:0),In(r);break;case 15:r.writeMode=!0,ce=c.cycleCount,e>=0&&(gt=e);break;default:{if(t<0||t>7)break;fn[Math.floor(t/2)]=t%2;const S=fn[(r.currentPhase+1)%4],u=fn[(r.currentPhase+3)%4];fn[r.currentPhase]||(r.motorRunning&&S?(mi(r,1,h),r.currentPhase=(r.currentPhase+1)%4,ce=c.cycleCount):r.motorRunning&&u&&(mi(r,-1,h),r.currentPhase=(r.currentPhase+3)%4,ce=c.cycleCount)),In(r);break}}return a},uc=()=>{ze(6,Uint8Array.from(nc)),Sr(6,lc)},le=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0,lastLocalWriteTime:-1,cloudData:null,writableFileHandle:null,lastWriteTime:-1}),Pi=()=>{M[0]=le(0,1,!0),M[1]=le(1,2,!0),M[2]=le(2,1,!1),M[3]=le(3,2,!1);for(let t=0;t<M.length;t++)ue[t]=new Uint8Array},M=[],ue=[];Pi();let Ye=2;const hc=t=>{Ye=t},pn=()=>M[Ye],Ic=()=>ue[Ye],Mo=t=>M[t==2?1:0],gn=t=>ue[t==2?1:0],qt=()=>{for(let t=0;t<M.length;t++){const e={index:t,hardDrive:M[t].hardDrive,drive:M[t].drive,filename:M[t].filename,status:M[t].status,motorRunning:M[t].motorRunning,diskHasChanges:M[t].diskHasChanges,isWriteProtected:M[t].isWriteProtected,diskData:M[t].diskHasChanges?ue[t]:new Uint8Array,lastWriteTime:M[t].lastWriteTime,lastLocalWriteTime:M[t].lastLocalWriteTime,cloudData:M[t].cloudData,writableFileHandle:M[t].writableFileHandle};J1(e)}},fc=t=>{const e=["","",""];for(let s=0;s<M.length;s++)(t||ue[s].length<32e6)&&(e[s]=Je.Buffer.from(ue[s]).toString("base64"));const r={currentDrive:Ye,driveState:[le(0,1,!0),le(1,2,!0),le(2,1,!1),le(3,2,!1)],driveData:e};for(let s=0;s<M.length;s++)r.driveState[s]={...M[s]};return r},pc=t=>{Ar(Me.MOTOR_OFF),Ye=t.currentDrive,t.driveState.length===3&&Ye>0&&Ye++,Pi();let e=0;for(let r=0;r<t.driveState.length;r++)M[e]={...t.driveState[r]},t.driveData[r]!==""&&(ue[e]=new Uint8Array(Je.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;qt()},gc=()=>{Bi(M[1]),Bi(M[2]),qt()},Li=(t=!1)=>{oc(t),qt()},Sc=(t,e=!1)=>{let r=t.index,s=t.drive,a=t.hardDrive;e||t.filename!==""&&(hs(t.filename)?(a=!0,r=t.drive<=1?0:1,s=r+1):(a=!1,r=t.drive<=1?2:3,s=r-1)),M[r]=le(r,s,a),M[r].filename=t.filename,M[r].motorRunning=t.motorRunning,ue[r]=rc(M[r],t.diskData),ue[r].length===0&&(M[r].filename=""),M[r].cloudData=t.cloudData,M[r].writableFileHandle=t.writableFileHandle,M[r].lastLocalWriteTime=t.lastLocalWriteTime,qt()},Cc=t=>{const e=t.index;M[e].filename=t.filename,M[e].motorRunning=t.motorRunning,M[e].isWriteProtected=t.isWriteProtected,M[e].diskHasChanges=t.diskHasChanges,M[e].lastWriteTime=t.lastWriteTime,M[e].lastLocalWriteTime=t.lastLocalWriteTime,M[e].cloudData=t.cloudData,M[e].writableFileHandle=t.writableFileHandle,qt()},Nt={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},wr={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},xe={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Ec{constructor(e){P(this,"_control");P(this,"_status");P(this,"_command");P(this,"_lastRead");P(this,"_lastConfig");P(this,"_receiveBuffer");P(this,"_extFuncs");this._extFuncs=e,this._control=wr.HW_RESET,this._command=xe.HW_RESET,this._status=Nt.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=Nt.OVRN;this._status|=Nt.RX_FULL,this._control&xe.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&xe.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Nt.PE|Nt.FE|Nt.OVRN),this._receiveBuffer.length?(this._status|=Nt.RX_FULL,this._control&xe.RX_INT_DIS||this.irq(!0)):this._status&=~Nt.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&Nt.IRQ&&this.irq(!1),this._status&=~Nt.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=Nt.IRQ:this._status&=~Nt.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&wr.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&wr.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&wr.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&xe.PARITY_EN)switch(this._command&xe.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=wr.HW_RESET,this._command=xe.HW_RESET,this._status=Nt.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const Qo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let Sn=1,Ot;const Bc=t=>{gr(Sn,t)},mc=t=>{console.log("ConfigChange: ",t)},Dc=t=>{Ot&&Ot.buffer(t)},dc=()=>{Ot&&Ot.reset()},wc=(t=!0,e=1)=>{if(!t)return;Sn=e;const r={sendData:j1,interrupt:Bc,configChange:mc};Ot=new Ec(r);const s=new Uint8Array(Qo.length+256);s.set(Qo.slice(1792,2048)),s.set(Qo,256),ze(Sn,s),Sr(Sn,kc)},kc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Ot.data=e;else return Ot.data;break;case r.STATUS:if(e>=0)Ot.status=e;else return Ot.status;break;case r.COMMAND:if(e>=0)Ot.command=e;else return Ot.command;break;case r.CONTROL:if(e>=0)Ot.control=e;else return Ot.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},kr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Tc=()=>{const t=new Date,e=kr(t.getMonth()+1,2)+","+kr(t.getDay(),2)+","+kr(t.getDate(),2)+","+kr(t.getHours(),2)+","+kr(t.getMinutes(),2);for(let r=0;r<e.length;r++)k(512+r,e.charCodeAt(r)|128)};let Cn=!1;const Mi=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Qi=t=>{let e=i.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=i.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=i.IND_Y:t.endsWith(",X)")?e=i.IND_X:e=i.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?i.ABS_X:i.ZP_X:t.endsWith(",Y")?e=t.length>5?i.ABS_Y:i.ZP_Y:e=t.length>3?i.ABS:i.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const s=Mi(t);if(s.operation&&s.value){switch(s.operation){case"+":r+=s.value;break;case"-":r-=s.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let We={};const bi=(t,e,r,s)=>{let a=i.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(We).forEach(([u,D])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+pt(D))}),Qi(r);const S=Mi(r);if(S.label){const u=S.label.startsWith("<"),D=S.label.startsWith(">"),G=S.label.startsWith("#")||D||u;if(G&&(S.label=S.label.substring(1)),S.label in We?(h=We[S.label],D?h=h>>8&255:u&&(h=h&255)):s===2&&console.error("Missing label: "+S.label),S.operation&&S.value){switch(S.operation){case"+":h+=S.value;break;case"-":h-=S.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}cs(e)?(a=i.ZP_REL,h=h-t+254,h>255&&(h-=256)):G?a=i.IMM:(a=h>=0&&h<=255?i.ZP_REL:i.ABS,a=S.idx==="X"?a===i.ABS?i.ABS_X:i.ZP_X:a,a=S.idx==="Y"?a===i.ABS?i.ABS_Y:i.ZP_Y:a)}return[a,h]},yc=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Rc=(t,e)=>{if(t.label in We&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,s]=bi(e,t.instr,t.operand,2);r!==i.ABS&&r!==i.ZP_REL&&console.error("Illegal EQU value: "+t.operand),We[t.label]=s}else We[t.label]=e},Pc=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,s=0;r.startsWith('"')&&r.endsWith('"')?s=128:r.startsWith("'")&&r.endsWith("'")?s=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let a=0;a<r.length;a++)e.push(r.charCodeAt(a)|s);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(a=>{const h=parseInt(a,16);isNaN(h)&&console.error(`Invalid HEX value: ${a} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},Lc=(t,e)=>{const r=[],s=rt[t];return r.push(t),e>=0&&(r.push(e%256),s.bytes===3&&r.push(Math.trunc(e/256))),r};let bo=0;const Fi=(t,e)=>{let r=bo;const s=[];let a="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let S=(h+"                   ").slice(0,30)+pt(r,4)+"- ";const u=yc(h,a);if(a="",!u.instr){a=u.label;return}if(u.instr==="ORG"){if(e===1){const[q,w]=Qi(u.operand);q===i.ABS&&(bo=w,r=w)}Cn&&e===2&&console.log(S);return}if(e===1&&u.label&&Rc(u,r),u.instr==="EQU")return;let D=[],G,y;if(["ASC","DA","HEX"].includes(u.instr))D=Pc(u),r+=D.length;else if([G,y]=bi(r,u.instr,u.operand,e),e===2&&isNaN(y)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")D.push(y&255),r++;else if(u.instr==="DW")D.push(y&255),D.push(y>>8&255),r+=2;else if(u.instr==="DS")for(let q=0;q<y;q++)D.push(0),r++;else{e===2&&cs(u.instr)&&(y<0||y>255)&&console.error(`Branch instruction out of range: ${h} value: ${y} pass: ${e}`);const q=rt.findIndex(w=>w&&w.name===u.instr&&w.mode===G);q<0&&console.error(`Unknown instruction: "${h}" mode=${G} pass=${e}`),D=Lc(q,y),r+=rt[q].bytes}Cn&&e===2&&(D.forEach(q=>{S+=` ${pt(q)}`}),console.log(S)),s.push(...D)}),Cn&&e===2){let h="";s.forEach(S=>{h+=` ${pt(S)}`}),console.log(h)}return s},En=(t,e,r=!1)=>{We={},Cn=r;try{return bo=t,Fi(e,1),Fi(e,2)}catch(s){return console.error(s),[]}},Mc=`
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
`;let Xe=49286,Bn=49289,mn=49291,Dn=49292,dn=49293,wn=49294,kn=49295;const Ui=(t,e,r,s,a)=>{const h=t&255,S=t>>8&3,u=e&255,D=e>>8&3;nt(r,h),nt(s,S<<4|D),nt(a,u)},Ki=(t,e,r)=>{const s=Mt(t),a=Mt(e),h=Mt(r),S=a>>4&3,u=a&3;return[s|S<<8,h|u<<8]},Tn=()=>Ki(Bn,mn,Dn),Fo=()=>Ki(dn,wn,kn),yn=(t,e)=>{Ui(t,e,Bn,mn,Dn)},Rn=(t,e)=>{Ui(t,e,dn,wn,kn)},Pn=t=>{nt(Xe,t),hA(!t)},Qc=()=>{_t=0,Gt=0,yn(0,1023),Rn(0,1023),Pn(0),dt=0,we=0,tr=0,Tr=0,yr=0,Qt=0,zt=0,er=0,Ln=0};let _t=0,Gt=0,Ln=0,dt=0,we=0,tr=0,Tr=0,yr=0,Qt=0,zt=0,er=0,qi=0,wt=5;const Mn=54,Qn=55,bc=56,Fc=57,Ni=()=>{const t=new Uint8Array(256).fill(0),e=En(0,Mc.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},Uc=(t=!0,e=5)=>{if(!t)return;wt=e;const r=49152+wt*256,s=49152+wt*256+8;ze(wt,Ni(),r,Nc),ze(wt,Ni(),s,Tc),Sr(wt,xc),Xe=49280+(Xe&15)+wt*16,Bn=49280+(Bn&15)+wt*16,mn=49280+(mn&15)+wt*16,Dn=49280+(Dn&15)+wt*16,dn=49280+(dn&15)+wt*16,wn=49280+(wn&15)+wt*16,kn=49280+(kn&15)+wt*16;const[a,h]=Tn();a===0&&h===0&&(yn(0,1023),Rn(0,1023)),Mt(Xe)!==0&&hA(!1)},Kc=()=>{const t=Mt(Xe);if(t&1){let e=!1;t&8&&(er|=8,e=!0),t&we&4&&(er|=4,e=!0),t&we&2&&(er|=2,e=!0),e&&gr(wt,!0)}},qc=t=>{if(Mt(Xe)&1)if(t.buttons>=0){switch(t.buttons){case 0:dt&=-129;break;case 16:dt|=128;break;case 1:dt&=-17;break;case 17:dt|=16;break}we|=dt&128?4:0}else{if(t.x>=0&&t.x<=1){const[r,s]=Tn();_t=Math.round((s-r)*t.x+r),we|=2}if(t.y>=0&&t.y<=1){const[r,s]=Fo();Gt=Math.round((s-r)*t.y+r),we|=2}}};let Rr=0,Uo="",Oi=0,Yi=0;const Nc=()=>{const t=192+wt;m(Qn)===t&&m(Mn)===0?Yc():m(Fc)===t&&m(bc)===0&&Oc()},Oc=()=>{if(Rr===0){const t=192+wt;Oi=m(Qn),Yi=m(Mn),k(Qn,t),k(Mn,3);const e=(dt&128)!==(tr&128);let r=0;dt&128?r=e?2:1:r=e?3:4,m(49152)&128&&(r=-r),tr=dt,Uo=_t.toString()+","+Gt.toString()+","+r.toString()}Rr>=Uo.length?(c.Accum=141,Rr=0,k(Qn,Oi),k(Mn,Yi)):(c.Accum=Uo.charCodeAt(Rr)|128,Rr++)},Yc=()=>{switch(c.Accum){case 128:console.log("mouse off"),Pn(0);break;case 129:console.log("mouse on"),Pn(1);break}},xc=(t,e)=>{if(t>=49408)return-1;const r=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},a={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case s.LOWX:if(r)return _t&255;Qt=Qt&65280|e,Qt&=65535;break;case s.HIGHX:if(r)return _t>>8&255;Qt=e<<8|Qt&255,Qt&=65535;break;case s.LOWY:if(r)return Gt&255;zt=zt&65280|e,zt&=65535;break;case s.HIGHY:if(r)return Gt>>8&255;zt=e<<8|zt&255,zt&=65535;break;case s.STATUS:return dt;case s.MODE:if(r)return Mt(Xe);Pn(e);break;case s.CLAMP:if(r){const[h,S]=Tn(),[u,D]=Fo();switch(Ln){case 0:return h>>8&255;case 1:return u>>8&255;case 2:return h&255;case 3:return u&255;case 4:return S>>8&255;case 5:return D>>8&255;case 6:return S&255;case 7:return D&255;default:return console.log("AppleMouse: invalid clamp index: "+Ln),0}}Ln=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(r)return qi;switch(qi=e,e){case a.INIT:console.log("cmd.init"),_t=0,Gt=0,Tr=0,yr=0,yn(0,1023),Rn(0,1023),dt=0,we=0;break;case a.READ:we=0,dt&=-112,dt|=tr>>1&64,dt|=tr>>4&1,tr=dt,(Tr!==_t||yr!==Gt)&&(dt|=32,Tr=_t,yr=Gt);break;case a.CLEAR:console.log("cmd.clear"),_t=0,Gt=0,Tr=0,yr=0;break;case a.SERVE:dt&=-15,dt|=er,er=0,gr(wt,!1);break;case a.HOME:{const[h]=Tn(),[S]=Fo();_t=h,Gt=S}break;case a.CLAMPX:{const h=Qt>32767?Qt-65536:Qt,S=zt;yn(h,S),console.log(h+" -> "+S)}break;case a.CLAMPY:{const h=Qt>32767?Qt-65536:Qt,S=zt;Rn(h,S),console.log(h+" -> "+S)}break;case a.GCLAMP:console.log("cmd.getclamp");break;case a.POS:_t=Qt,Gt=zt;break}break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return e},Zt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},he={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class Wc{constructor(e){P(this,"_control");P(this,"_status");P(this,"_lastRead");P(this,"_receiveBuffer");P(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let s=0;s<r;s++)this._receiveBuffer.shift(),this._status|=Zt.OVRN;this._status|=Zt.RX_FULL,this._control&he.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(he.TX_INT_ENABLE|he.NRTS))===he.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Zt.FE|Zt.OVRN|Zt.PE),this._receiveBuffer.length?(this._status|=Zt.RX_FULL,this._control&he.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~Zt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(he.COUNTER_DIV1|he.COUNTER_DIV2))===(he.COUNTER_DIV1|he.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Zt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Zt.IRQ:this._status&=~Zt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Zt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const $t={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Ko={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class qo{constructor(){P(this,"_latch");P(this,"_count");P(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&$t.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&$t.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class Xc{constructor(e){P(this,"_timer");P(this,"_status");P(this,"_statusRead");P(this,"_msb");P(this,"_lsb");P(this,"_div8");P(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new qo,new qo,new qo],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&$t.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const s=this._timer[0].control&$t.SPECIAL,a=this._msb*256+r;this._timer[e].latch=a,s&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const s=this._timer[0].control&$t.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),s>>8&255}update(e){const r=this._timer[0].control&$t.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let s=!1;for(let a=0;a<3;a++){let h=e;if(a==2&&this._timer[2].control&$t.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),s=this._timer[a].decrement(h),s){const S=this._timer[a].control;switch(S&$t.IRQ_ENABLE&&this.irq(a,!0),S&$t.COUNTER_MODE){case 0:case 16:this._timer[a].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=$t.SPECIAL}irq(e,r){const s=1<<e|Ko.ANY_IRQ;r?this._status|=s:this._status&=~s,this._status?(this._status|=Ko.ANY_IRQ,this._interrupt(!0)):(this._status&=~Ko.ANY_IRQ,this._interrupt(!1))}}let bn=2,Ct,ke,No=0;const _c=t=>{if(No){const e=c.cycleCount-No;Ct.update(e)}No=c.cycleCount},xi=t=>{gr(bn,t)},Gc=t=>{ke&&ke.buffer(t)},Zc=(t=!0,e=2)=>{if(!t)return;bn=e,Ct=new Xc(xi);const r={sendData:H1,interrupt:xi};ke=new Wc(r),Sr(bn,Vc),Xs(_c,bn)},Jc=()=>{Ct&&(Ct.reset(),ke.reset())},Vc=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?ke.data=e:s=ke.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?ke.control=e:s=ke.status;break;case r.TCONTROL1:e>=0?Ct.timerControl(0,e):s=0;break;case r.TCONTROL2:e>=0?Ct.timerControl(1,e):s=Ct.status();break;case r.T1MSB:e>=0?Ct.timerMSBw(0,e):s=Ct.timerMSBr(0);break;case r.T1LSB:e>=0?Ct.timerLSBw(0,e):s=Ct.timerLSBr(0);break;case r.T2MSB:e>=0?Ct.timerMSBw(1,e):s=Ct.timerMSBr(1);break;case r.T2LSB:e>=0?Ct.timerLSBw(1,e):s=Ct.timerLSBr(1);break;case r.T3MSB:e>=0?Ct.timerMSBw(2,e):s=Ct.timerMSBr(2);break;case r.T3LSB:e>=0?Ct.timerLSBw(2,e):s=Ct.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return s},jc=(t=!0,e=4)=>{t&&(Sr(e,h1),Xs(A1,e))},Oo=[0,128],Yo=[1,129],Hc=[2,130],vc=[3,131],rr=[4,132],nr=[5,133],Fn=[6,134],xo=[7,135],Pr=[8,136],Lr=[9,137],zc=[10,138],Wo=[11,139],$c=[12,140],_e=[13,141],Mr=[14,142],Wi=[16,145],Xi=[17,145],te=[18,146],Xo=[32,160],Ie=64,Te=32,t1=(t=4)=>{for(let e=0;e<=255;e++)O(t,e,0);for(let e=0;e<=1;e++)_o(t,e)},e1=(t,e)=>(z(t,Mr[e])&Ie)!==0,r1=(t,e)=>(z(t,te[e])&Ie)!==0,_i=(t,e)=>(z(t,Wo[e])&Ie)!==0,n1=(t,e,r)=>{let s=z(t,rr[e])-r;if(O(t,rr[e],s),s<0){s=s%256+256,O(t,rr[e],s);let a=z(t,nr[e]);if(a--,O(t,nr[e],a),a<0&&(a+=256,O(t,nr[e],a),e1(t,e)&&(!r1(t,e)||_i(t,e)))){const h=z(t,te[e]);O(t,te[e],h|Ie);const S=z(t,_e[e]);if(O(t,_e[e],S|Ie),ye(t,e,-1),_i(t,e)){const u=z(t,xo[e]),D=z(t,Fn[e]);O(t,rr[e],D),O(t,nr[e],u)}}}},o1=(t,e)=>(z(t,Mr[e])&Te)!==0,s1=(t,e)=>(z(t,te[e])&Te)!==0,i1=(t,e,r)=>{if(z(t,Wo[e])&Te)return;let s=z(t,Pr[e])-r;if(O(t,Pr[e],s),s<0){s=s%256+256,O(t,Pr[e],s);let a=z(t,Lr[e]);if(a--,O(t,Lr[e],a),a<0&&(a+=256,O(t,Lr[e],a),o1(t,e)&&!s1(t,e))){const h=z(t,te[e]);O(t,te[e],h|Te);const S=z(t,_e[e]);O(t,_e[e],S|Te),ye(t,e,-1)}}},Gi=new Array(8).fill(0),A1=t=>{const e=c.cycleCount-Gi[t];for(let r=0;r<=1;r++)n1(t,r,e),i1(t,r,e);Gi[t]=c.cycleCount},a1=(t,e)=>{const r=[];for(let s=0;s<=15;s++)r[s]=z(t,Xo[e]+s);return r},c1=(t,e)=>t.length===e.length&&t.every((r,s)=>r===e[s]),or={slot:-1,chip:-1,params:[-1]};let _o=(t,e)=>{const r=a1(t,e);t===or.slot&&e===or.chip&&c1(r,or.params)||(or.slot=t,or.chip=e,or.params=r,V1({slot:t,chip:e,params:r}))};const l1=(t,e)=>{switch(z(t,Oo[e])&7){case 0:for(let s=0;s<=15;s++)O(t,Xo[e]+s,0);_o(t,e);break;case 7:O(t,Xi[e],z(t,Yo[e]));break;case 6:{const s=z(t,Xi[e]),a=z(t,Yo[e]);s>=0&&s<=15&&(O(t,Xo[e]+s,a),_o(t,e));break}}},ye=(t,e,r)=>{let s=z(t,_e[e]);switch(r>=0&&(s&=127-(r&127),O(t,_e[e],s)),e){case 0:gr(t,s!==0);break;case 1:Sa(s!==0);break}},u1=(t,e,r)=>{let s=z(t,Mr[e]);r>=0&&(r=r&255,r&128?s|=r:s&=255-r),s|=128,O(t,Mr[e],s)},h1=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,s=t&255,a=s&128?1:0;switch(s){case Oo[a]:e>=0&&(O(r,Oo[a],e),l1(r,a));break;case Yo[a]:case Hc[a]:case vc[a]:case zc[a]:case Wo[a]:case $c[a]:O(r,s,e);break;case rr[a]:e>=0&&O(r,Fn[a],e),ye(r,a,Ie);break;case nr[a]:if(e>=0){O(r,xo[a],e),O(r,rr[a],z(r,Fn[a])),O(r,nr[a],e);const h=z(r,te[a]);O(r,te[a],h&~Ie),ye(r,a,Ie)}break;case Fn[a]:e>=0&&(O(r,s,e),ye(r,a,Ie));break;case xo[a]:e>=0&&O(r,s,e);break;case Pr[a]:e>=0&&O(r,Wi[a],e),ye(r,a,Te);break;case Lr[a]:if(e>=0){O(r,Lr[a],e),O(r,Pr[a],z(r,Wi[a]));const h=z(r,te[a]);O(r,te[a],h&~Te),ye(r,a,Te)}break;case _e[a]:e>=0&&ye(r,a,e);break;case Mr[a]:u1(r,a,e);break}return-1};let sr=0;const Un=192,I1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${pt(Un)}   ; jump address
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
`,f1=`
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
`,p1=()=>{const t=new Uint8Array(256).fill(0),e=En(0,I1.split(`
`));t.set(e,0);const r=En(0,f1.split(`
`));return t.set(r,Un),t[254]=23,t[255]=Un,t};let Qr=new Uint8Array;const Go=(t=!0)=>{Qr.length===0&&(Qr=p1()),Qr[1]=t?32:0;const r=49152+Un+7*256;ze(7,Qr,r,B1),ze(7,Qr,r+3,E1)},g1=(t,e)=>{if(t===0)k(e,2);else if(t<=2){k(e,240);const a=gn(t).length/512;k(e+1,a&255),k(e+2,a>>>8),k(e+3,0),Er(4),Br(0)}else Cr(40),Er(0),Br(0),N()},S1=(t,e)=>{const a=gn(t).length/512,h=a>1600?2:1,S=h==2?32:64;k(e,240),k(e+1,a&255),k(e+2,a>>>8),k(e+3,0);const u="Apple2TS SP";k(e+4,u.length);let D=0;for(;D<u.length;D++)k(e+5+D,u.charCodeAt(D));for(;D<16;D++)k(e+5+D,u.charCodeAt(8));k(e+21,h),k(e+22,S),k(e+23,1),k(e+24,0),Er(25),Br(0)},C1=(t,e,r)=>{if(m(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),Cr(4),N();return}const s=m(t+4);switch(s){case 0:g1(e,r);break;case 1:case 2:Cr(33),N();break;case 3:case 4:S1(e,r);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},E1=()=>{Cr(0),N(!1);const t=256+c.StackPtr,e=m(t+1)+256*m(t+2),r=m(e+1),s=m(e+2)+256*m(e+3),a=m(s+1),h=m(s+2)+256*m(s+3);switch(r){case 0:{C1(s,a,h);return}case 1:{if(m(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),N();return}const D=512*(m(s+4)+256*m(s+5)+65536*m(s+6)),y=gn(a).slice(D,D+512);Bo(h,y);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),N();return}const S=Mo(a);S.motorRunning=!0,sr||(sr=setTimeout(()=>{sr=0,S&&(S.motorRunning=!1),qt()},500)),qt()},B1=()=>{Cr(0),N(!1);const t=m(66),e=Math.max(Math.min(m(67)>>6,2),0),r=Mo(e);if(!r.hardDrive)return;const s=gn(e),a=m(70)+256*m(71),h=512*a,S=m(68)+256*m(69),u=s.length;switch(r.status=` ${pt(a,4)}`,t){case 0:{if(r.filename.length===0||u===0){Er(0),Br(0),N();return}const D=u/512;Er(D&255),Br(D>>>8);break}case 1:{if(h+512>u){N();return}const D=s.slice(h,h+512);Bo(S,D);break}case 2:{if(h+512>u){N();return}if(r.isWriteProtected){N();return}const D=Eo(S);s.set(D,h),r.diskHasChanges=!0,r.lastWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),N();return;default:console.error("unknown hard drive command"),N();return}N(!1),r.motorRunning=!0,sr||(sr=setTimeout(()=>{sr=0,r&&(r.motorRunning=!1),qt()},500)),qt()},Zi=`
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
`;let Ji=0,Kn=0,br=0,qn=0,Fr=DA,Vi=16.6881,Zo=17030,ji=0,Et=_.IDLE,Re="APPLE2EE",ir=0,Nn=!1,bt=0;const V=[];let Ur=0;const m1=()=>{B.VBL.isSet=!0,Kc()},D1=()=>{B.VBL.isSet=!1},Hi=()=>{const t={};for(const e in B)t[e]=B[e].isSet;return t},d1=()=>{const t=JSON.parse(JSON.stringify(c));let e=fe;for(let s=fe;s<b.length;s++)b[s]!==255&&(s+=255-s%256,e=s+1);const r=Je.Buffer.from(b.slice(0,e));return{s6502:t,extraRamSize:64*(jt+1),machineName:Re,softSwitches:Hi(),memory:r.toString("base64")}},w1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));ri(r);const s=t.softSwitches;for(const h in s){const S=h;try{B[S].isSet=s[h]}catch{}}"WRITEBSR1"in s&&(B.BSR_PREWRITE.isSet=!1,B.BSR_WRITE.isSet=s.WRITEBSR1||s.WRITEBSR2||s.RDWRBSR1||s.RDWRBSR2);const a=new Uint8Array(Je.Buffer.from(t.memory,"base64"));if(e<1){b.set(a.slice(0,65536)),b.set(a.slice(131072,163584),65536),b.set(a.slice(65536,131072),fe);const h=(a.length-163584)/1024;h>0&&(po(h+64),b.set(a.slice(163584),fe+65536))}else po(t.extraRamSize),b.set(a);Re=t.machineName||"APPLE2EE",Vo(Re,!1),se(),io(!0)},k1=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!0,colorMode:0,showScanlines:!1,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:_.IDLE,breakpoints:Rt,stackDump:Na()}),Jo=t=>({emulator:k1(),state6502:d1(),driveState:fc(t),thumbnail:"",snapshots:null}),T1=()=>{const t=Jo(!0);return t.snapshots=V,t},y1=t=>{ri(t),ee()},R1=t=>{mr(t),ee()},On=(t,e=!1)=>{var s,a;xn();const r=(s=t.emulator)!=null&&s.version?t.emulator.version:.9;w1(t.state6502,r),(a=t.emulator)!=null&&a.stackDump&&Oa(t.emulator.stackDump),pc(t.driveState),e&&(V.length=0,bt=0),t.snapshots&&(V.length=0,V.push(...t.snapshots),bt=V.length),ee()};let vi=!1;const zi=()=>{vi||(vi=!0,wc(),Zc(!0,2),jc(!0,4),Uc(!0,5),uc(),Go(),Ja())},P1=()=>{gc(),ro(),Qc(),Jc(),dc(),t1(4)},Yn=()=>{if(mr(0),Qa(),js(Re),zi(),Zi.length>0){const e=En(768,Zi.split(`
`));b.set(e,768)}xn(),io(!0),Mo(1).filename===""&&(Go(!1),setTimeout(()=>{Go()},200))},xn=()=>{Ca(),ia(),m(49282),ni(),P1()},L1=t=>{br=t,Vi=[16.6881,16.6881,1][br],Zo=[17030,17030*4,17030*4][br],sA()},M1=t=>{Fr=t,ee(),z1(ca())},Q1=(t,e)=>{b[t]=e,Fr&&ee()},Vo=(t,e=!0)=>{Re!==t&&(Re=t,js(Re),e&&xn(),ee())},b1=t=>{po(t),ee()},$i=()=>{const t=bt-1;return t<0||!V[t]?-1:t},tA=()=>{const t=bt+1;return t>=V.length||!V[t]?-1:t},eA=()=>{V.length===dA&&V.shift(),V.push(Jo(!1)),bt=V.length,v1(V[V.length-1].state6502.s6502.PC)},F1=()=>{let t=$i();t<0||(Jt(_.PAUSED),setTimeout(()=>{bt===V.length&&(eA(),t=Math.max(bt-2,0)),bt=t,On(V[bt])},50))},U1=()=>{const t=tA();t<0||(Jt(_.PAUSED),setTimeout(()=>{bt=t,On(V[t])},50))},K1=t=>{t<0||t>=V.length||(Jt(_.PAUSED),setTimeout(()=>{bt=t,On(V[t])},50))},q1=()=>{const t=[];for(let e=0;e<V.length;e++)t[e]={s6502:V[e].state6502.s6502,thumbnail:V[e].thumbnail};return t},N1=t=>{V.length>0&&(V[V.length-1].thumbnail=t)};let Wn=null;const rA=(t=!1)=>{Wn&&clearTimeout(Wn),t?Wn=setTimeout(()=>{Nn=!0,Wn=null},100):Nn=!0},nA=()=>{Vr(),Et===_.IDLE&&(Yn(),Et=_.PAUSED),uo(),Jt(_.PAUSED)},O1=()=>{Vr(),Et===_.IDLE&&(Yn(),Et=_.PAUSED),m(c.PC,!1)===32?(uo(),oA()):nA()},oA=()=>{Vr(),Et===_.IDLE&&(Yn(),Et=_.PAUSED),fa(),Jt(_.RUNNING)},sA=()=>{ir=0,Kn=performance.now(),Ji=Kn},Jt=t=>{if(zi(),Et=t,Et===_.PAUSED)Ur&&(clearInterval(Ur),Ur=0),Li();else if(Et===_.RUNNING){for(Li(!0),Vr();V.length>0&&bt<V.length-1;)V.pop();bt=V.length,Ur||(Ur=setInterval(io,1e3))}ee(),sA(),qn===0&&(qn=1,aA())},iA=t=>{Et===_.IDLE?(Jt(_.NEED_BOOT),setTimeout(()=>{Jt(_.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},Y1=(t,e,r)=>{iA(()=>{Bo(t,e),r&&Ht(t)})},x1=t=>{iA(()=>{oa(t)})},W1=()=>Fr&&Et===_.PAUSED?qa():new Uint8Array,X1=()=>Fr&&Et!==_.IDLE?Ya():"",ee=()=>{const t={addressGetTable:Dt,altChar:B.ALTCHARSET.isSet,arrowKeysAsJoystick:!0,breakpoints:Rt,button0:B.PB0.isSet,button1:B.PB1.isSet,canGoBackward:$i()>=0,canGoForward:tA()>=0,capsLock:!0,c800Slot:Io(),colorMode:As.COLOR,showScanlines:!1,cout:m(57)<<8|m(56),cpuSpeed:qn,theme:as.CLASSIC,extraRamSize:64*(jt+1),helpText:"",hires:Ka(),iTempState:bt,isDebugging:Fr,lores:Co(!0),machineName:Re,memoryDump:W1(),noDelayMode:!B.COLUMN80.isSet&&!B.AN3.isSet,ramWorksBank:Ne(),runMode:Et,s6502:c,softSwitches:Hi(),speedMode:br,stackString:X1(),textPage:Co(),timeTravelThumbnails:q1(),useOpenAppleKey:!1,hotReload:!1};G1(t)},_1=t=>{if(t)for(let e=0;e<t.length;e++)Aa(t[e]);else aa();t&&(t[0]<=49167||t[0]>=49232)&&se(),ee()},AA=()=>{const t=performance.now();if(ji=t-Kn,ji<Vi||(Kn=t,Et===_.IDLE||Et===_.PAUSED))return;Et===_.NEED_BOOT?(Yn(),Jt(_.RUNNING)):Et===_.NEED_RESET&&(xn(),Jt(_.RUNNING));let e=0;for(;;){const s=uo();if(s<0)break;if(e+=s,e%17030>=12480&&(B.VBL.isSet||m1()),e>=Zo){D1();break}}ir++;const r=ir*Zo/(performance.now()-Ji);qn=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,ir%2&&(FA(),ee()),Nn&&(Nn=!1,eA())},aA=()=>{AA();const t=ir+[1,5,10][br];for(;Et===_.RUNNING&&ir!==t;)AA();setTimeout(aA,Et===_.RUNNING?0:20)},Lt=(t,e)=>{self.postMessage({msg:t,payload:e})},G1=t=>{Lt(Tt.MACHINE_STATE,t)},Z1=t=>{Lt(Tt.CLICK,t)},J1=t=>{Lt(Tt.DRIVE_PROPS,t)},Ar=t=>{Lt(Tt.DRIVE_SOUND,t)},cA=t=>{Lt(Tt.SAVE_STATE,t)},Xn=t=>{Lt(Tt.RUMBLE,t)},lA=t=>{Lt(Tt.HELP_TEXT,t)},uA=t=>{Lt(Tt.ENHANCED_MIDI,t)},hA=t=>{Lt(Tt.SHOW_MOUSE,t)},V1=t=>{Lt(Tt.MBOARD_SOUND,t)},j1=t=>{Lt(Tt.COMM_DATA,t)},H1=t=>{Lt(Tt.MIDI_DATA,t)},v1=t=>{Lt(Tt.REQUEST_THUMBNAIL,t)},z1=t=>{Lt(Tt.SOFTSWITCH_DESCRIPTIONS,t)},$1=t=>{Lt(Tt.INSTRUCTIONS,t)};typeof self<"u"&&(self.onmessage=t=>{if(!(!t.data||typeof t.data!="object")&&"msg"in t.data)switch(t.data.msg){case W.RUN_MODE:Jt(t.data.payload);break;case W.STATE6502:y1(t.data.payload);break;case W.DEBUG:M1(t.data.payload);break;case W.BREAKPOINTS:pa(t.data.payload);break;case W.STEP_INTO:nA();break;case W.STEP_OVER:O1();break;case W.STEP_OUT:oA();break;case W.SPEED:L1(t.data.payload);break;case W.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?U1():F1();break;case W.TIME_TRAVEL_INDEX:K1(t.data.payload);break;case W.TIME_TRAVEL_SNAPSHOT:rA();break;case W.THUMBNAIL_IMAGE:N1(t.data.payload);break;case W.RESTORE_STATE:On(t.data.payload,!0);break;case W.KEYPRESS:na(t.data.payload);break;case W.MOUSEEVENT:qc(t.data.payload);break;case W.PASTE_TEXT:x1(t.data.payload);break;case W.APPLE_PRESS:ds(!0,t.data.payload);break;case W.APPLE_RELEASE:ds(!1,t.data.payload);break;case W.GET_SAVE_STATE:cA(Jo(!0));break;case W.GET_SAVE_STATE_SNAPSHOTS:cA(T1());break;case W.DRIVE_PROPS:{const e=t.data.payload;Cc(e);break}case W.DRIVE_NEW_DATA:{const e=t.data.payload;Sc(e);break}case W.GAMEPAD:QA(t.data.payload);break;case W.SET_BINARY_BLOCK:{const e=t.data.payload;Y1(e.address,e.data,e.run);break}case W.SET_CYCLECOUNT:R1(t.data.payload);break;case W.SET_MEMORY:{const e=t.data.payload;Q1(e.address,e.value);break}case W.COMM_DATA:Dc(t.data.payload);break;case W.MIDI_DATA:Gc(t.data.payload);break;case W.RAMWORKS:b1(t.data.payload);break;case W.MACHINE_NAME:Vo(t.data.payload);break;case W.SOFTSWITCHES:_1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
