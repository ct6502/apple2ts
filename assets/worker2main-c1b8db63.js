(function(){"use strict";var Vt={},Ve={};Ve.byteLength=Xs,Ve.toByteArray=Gs,Ve.fromByteArray=_s;for(var It=[],st=[],Ks=typeof Uint8Array<"u"?Uint8Array:Array,Or="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fe=0,qs=Or.length;fe<qs;++fe)It[fe]=Or[fe],st[Or.charCodeAt(fe)]=fe;st["-".charCodeAt(0)]=62,st["_".charCodeAt(0)]=63;function Fn(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=t.indexOf("=");n===-1&&(n=e);var i=n===e?0:4-n%4;return[n,i]}function Xs(t){var e=Fn(t),n=e[0],i=e[1];return(n+i)*3/4-i}function Ws(t,e,n){return(e+n)*3/4-n}function Gs(t){var e,n=Fn(t),i=n[0],A=n[1],g=new Ks(Ws(t,i,A)),p=0,u=A>0?i-4:i,B;for(B=0;B<u;B+=4)e=st[t.charCodeAt(B)]<<18|st[t.charCodeAt(B+1)]<<12|st[t.charCodeAt(B+2)]<<6|st[t.charCodeAt(B+3)],g[p++]=e>>16&255,g[p++]=e>>8&255,g[p++]=e&255;return A===2&&(e=st[t.charCodeAt(B)]<<2|st[t.charCodeAt(B+1)]>>4,g[p++]=e&255),A===1&&(e=st[t.charCodeAt(B)]<<10|st[t.charCodeAt(B+1)]<<4|st[t.charCodeAt(B+2)]>>2,g[p++]=e>>8&255,g[p++]=e&255),g}function Zs(t){return It[t>>18&63]+It[t>>12&63]+It[t>>6&63]+It[t&63]}function Js(t,e,n){for(var i,A=[],g=e;g<n;g+=3)i=(t[g]<<16&16711680)+(t[g+1]<<8&65280)+(t[g+2]&255),A.push(Zs(i));return A.join("")}function _s(t){for(var e,n=t.length,i=n%3,A=[],g=16383,p=0,u=n-i;p<u;p+=g)A.push(Js(t,p,p+g>u?u:p+g));return i===1?(e=t[n-1],A.push(It[e>>2]+It[e<<4&63]+"==")):i===2&&(e=(t[n-2]<<8)+t[n-1],A.push(It[e>>10]+It[e>>4&63]+It[e<<2&63]+"=")),A.join("")}var Qr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */Qr.read=function(t,e,n,i,A){var g,p,u=A*8-i-1,B=(1<<u)-1,q=B>>1,y=-7,T=n?A-1:0,et=n?-1:1,$=t[e+T];for(T+=et,g=$&(1<<-y)-1,$>>=-y,y+=u;y>0;g=g*256+t[e+T],T+=et,y-=8);for(p=g&(1<<-y)-1,g>>=-y,y+=i;y>0;p=p*256+t[e+T],T+=et,y-=8);if(g===0)g=1-q;else{if(g===B)return p?NaN:($?-1:1)*(1/0);p=p+Math.pow(2,i),g=g-q}return($?-1:1)*p*Math.pow(2,g-i)},Qr.write=function(t,e,n,i,A,g){var p,u,B,q=g*8-A-1,y=(1<<q)-1,T=y>>1,et=A===23?Math.pow(2,-24)-Math.pow(2,-77):0,$=i?0:g-1,Ze=i?1:-1,Je=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=y):(p=Math.floor(Math.log(e)/Math.LN2),e*(B=Math.pow(2,-p))<1&&(p--,B*=2),p+T>=1?e+=et/B:e+=et*Math.pow(2,1-T),e*B>=2&&(p++,B/=2),p+T>=y?(u=0,p=y):p+T>=1?(u=(e*B-1)*Math.pow(2,A),p=p+T):(u=e*Math.pow(2,T-1)*Math.pow(2,A),p=0));A>=8;t[n+$]=u&255,$+=Ze,u/=256,A-=8);for(p=p<<A|u,q+=A;q>0;t[n+$]=p&255,$+=Ze,p/=256,q-=8);t[n+$-Ze]|=Je*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=Ve,n=Qr,i=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=Fa,t.INSPECT_MAX_BYTES=50;const A=2147483647;t.kMaxLength=A,u.TYPED_ARRAY_SUPPORT=g(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function g(){try{const s=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(s,r),s.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(s){if(s>A)throw new RangeError('The value "'+s+'" is invalid for option "size"');const r=new Uint8Array(s);return Object.setPrototypeOf(r,u.prototype),r}function u(s,r,o){if(typeof s=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return T(s)}return B(s,r,o)}u.poolSize=8192;function B(s,r,o){if(typeof s=="string")return et(s,r);if(ArrayBuffer.isView(s))return Ze(s);if(s==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof s);if(dt(s,ArrayBuffer)||s&&dt(s.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(dt(s,SharedArrayBuffer)||s&&dt(s.buffer,SharedArrayBuffer)))return Je(s,r,o);if(typeof s=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const c=s.valueOf&&s.valueOf();if(c!=null&&c!==s)return u.from(c,r,o);const h=Ua(s);if(h)return h;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof s[Symbol.toPrimitive]=="function")return u.from(s[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof s)}u.from=function(s,r,o){return B(s,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function q(s){if(typeof s!="number")throw new TypeError('"size" argument must be of type number');if(s<0)throw new RangeError('The value "'+s+'" is invalid for option "size"')}function y(s,r,o){return q(s),s<=0?p(s):r!==void 0?typeof o=="string"?p(s).fill(r,o):p(s).fill(r):p(s)}u.alloc=function(s,r,o){return y(s,r,o)};function T(s){return q(s),p(s<0?0:bn(s)|0)}u.allocUnsafe=function(s){return T(s)},u.allocUnsafeSlow=function(s){return T(s)};function et(s,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=ys(s,r)|0;let c=p(o);const h=c.write(s,r);return h!==o&&(c=c.slice(0,h)),c}function $(s){const r=s.length<0?0:bn(s.length)|0,o=p(r);for(let c=0;c<r;c+=1)o[c]=s[c]&255;return o}function Ze(s){if(dt(s,Uint8Array)){const r=new Uint8Array(s);return Je(r.buffer,r.byteOffset,r.byteLength)}return $(s)}function Je(s,r,o){if(r<0||s.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(s.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let c;return r===void 0&&o===void 0?c=new Uint8Array(s):o===void 0?c=new Uint8Array(s,r):c=new Uint8Array(s,r,o),Object.setPrototypeOf(c,u.prototype),c}function Ua(s){if(u.isBuffer(s)){const r=bn(s.length)|0,o=p(r);return o.length===0||s.copy(o,0,0,r),o}if(s.length!==void 0)return typeof s.length!="number"||Un(s.length)?p(0):$(s);if(s.type==="Buffer"&&Array.isArray(s.data))return $(s.data)}function bn(s){if(s>=A)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+A.toString(16)+" bytes");return s|0}function Fa(s){return+s!=s&&(s=0),u.alloc(+s)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(dt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),dt(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let c=r.length,h=o.length;for(let I=0,S=Math.min(c,h);I<S;++I)if(r[I]!==o[I]){c=r[I],h=o[I];break}return c<h?-1:h<c?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let c;if(o===void 0)for(o=0,c=0;c<r.length;++c)o+=r[c].length;const h=u.allocUnsafe(o);let I=0;for(c=0;c<r.length;++c){let S=r[c];if(dt(S,Uint8Array))I+S.length>h.length?(u.isBuffer(S)||(S=u.from(S)),S.copy(h,I)):Uint8Array.prototype.set.call(h,S,I);else if(u.isBuffer(S))S.copy(h,I);else throw new TypeError('"list" argument must be an Array of Buffers');I+=S.length}return h};function ys(s,r){if(u.isBuffer(s))return s.length;if(ArrayBuffer.isView(s)||dt(s,ArrayBuffer))return s.byteLength;if(typeof s!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof s);const o=s.length,c=arguments.length>2&&arguments[2]===!0;if(!c&&o===0)return 0;let h=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Ln(s).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return Ys(s).length;default:if(h)return c?-1:Ln(s).length;r=(""+r).toLowerCase(),h=!0}}u.byteLength=ys;function Oa(s,r,o){let c=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(s||(s="utf8");;)switch(s){case"hex":return Za(this,r,o);case"utf8":case"utf-8":return bs(this,r,o);case"ascii":return Wa(this,r,o);case"latin1":case"binary":return Ga(this,r,o);case"base64":return qa(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Ja(this,r,o);default:if(c)throw new TypeError("Unknown encoding: "+s);s=(s+"").toLowerCase(),c=!0}}u.prototype._isBuffer=!0;function le(s,r,o){const c=s[r];s[r]=s[o],s[o]=c}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)le(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)le(this,o,o+3),le(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)le(this,o,o+7),le(this,o+1,o+6),le(this,o+2,o+5),le(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?bs(this,0,r):Oa.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=t.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},i&&(u.prototype[i]=u.prototype.inspect),u.prototype.compare=function(r,o,c,h,I){if(dt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),c===void 0&&(c=r?r.length:0),h===void 0&&(h=0),I===void 0&&(I=this.length),o<0||c>r.length||h<0||I>this.length)throw new RangeError("out of range index");if(h>=I&&o>=c)return 0;if(h>=I)return-1;if(o>=c)return 1;if(o>>>=0,c>>>=0,h>>>=0,I>>>=0,this===r)return 0;let S=I-h,R=c-o;const W=Math.min(S,R),Y=this.slice(h,I),G=r.slice(o,c);for(let N=0;N<W;++N)if(Y[N]!==G[N]){S=Y[N],R=G[N];break}return S<R?-1:R<S?1:0};function Ts(s,r,o,c,h){if(s.length===0)return-1;if(typeof o=="string"?(c=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Un(o)&&(o=h?0:s.length-1),o<0&&(o=s.length+o),o>=s.length){if(h)return-1;o=s.length-1}else if(o<0)if(h)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,c)),u.isBuffer(r))return r.length===0?-1:Ps(s,r,o,c,h);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?h?Uint8Array.prototype.indexOf.call(s,r,o):Uint8Array.prototype.lastIndexOf.call(s,r,o):Ps(s,[r],o,c,h);throw new TypeError("val must be string, number or Buffer")}function Ps(s,r,o,c,h){let I=1,S=s.length,R=r.length;if(c!==void 0&&(c=String(c).toLowerCase(),c==="ucs2"||c==="ucs-2"||c==="utf16le"||c==="utf-16le")){if(s.length<2||r.length<2)return-1;I=2,S/=2,R/=2,o/=2}function W(G,N){return I===1?G[N]:G.readUInt16BE(N*I)}let Y;if(h){let G=-1;for(Y=o;Y<S;Y++)if(W(s,Y)===W(r,G===-1?0:Y-G)){if(G===-1&&(G=Y),Y-G+1===R)return G*I}else G!==-1&&(Y-=Y-G),G=-1}else for(o+R>S&&(o=S-R),Y=o;Y>=0;Y--){let G=!0;for(let N=0;N<R;N++)if(W(s,Y+N)!==W(r,N)){G=!1;break}if(G)return Y}return-1}u.prototype.includes=function(r,o,c){return this.indexOf(r,o,c)!==-1},u.prototype.indexOf=function(r,o,c){return Ts(this,r,o,c,!0)},u.prototype.lastIndexOf=function(r,o,c){return Ts(this,r,o,c,!1)};function Qa(s,r,o,c){o=Number(o)||0;const h=s.length-o;c?(c=Number(c),c>h&&(c=h)):c=h;const I=r.length;c>I/2&&(c=I/2);let S;for(S=0;S<c;++S){const R=parseInt(r.substr(S*2,2),16);if(Un(R))return S;s[o+S]=R}return S}function Na(s,r,o,c){return Fr(Ln(r,s.length-o),s,o,c)}function xa(s,r,o,c){return Fr(ja(r),s,o,c)}function Ya(s,r,o,c){return Fr(Ys(r),s,o,c)}function Ka(s,r,o,c){return Fr($a(r,s.length-o),s,o,c)}u.prototype.write=function(r,o,c,h){if(o===void 0)h="utf8",c=this.length,o=0;else if(c===void 0&&typeof o=="string")h=o,c=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(c)?(c=c>>>0,h===void 0&&(h="utf8")):(h=c,c=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const I=this.length-o;if((c===void 0||c>I)&&(c=I),r.length>0&&(c<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");h||(h="utf8");let S=!1;for(;;)switch(h){case"hex":return Qa(this,r,o,c);case"utf8":case"utf-8":return Na(this,r,o,c);case"ascii":case"latin1":case"binary":return xa(this,r,o,c);case"base64":return Ya(this,r,o,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Ka(this,r,o,c);default:if(S)throw new TypeError("Unknown encoding: "+h);h=(""+h).toLowerCase(),S=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function qa(s,r,o){return r===0&&o===s.length?e.fromByteArray(s):e.fromByteArray(s.slice(r,o))}function bs(s,r,o){o=Math.min(s.length,o);const c=[];let h=r;for(;h<o;){const I=s[h];let S=null,R=I>239?4:I>223?3:I>191?2:1;if(h+R<=o){let W,Y,G,N;switch(R){case 1:I<128&&(S=I);break;case 2:W=s[h+1],(W&192)===128&&(N=(I&31)<<6|W&63,N>127&&(S=N));break;case 3:W=s[h+1],Y=s[h+2],(W&192)===128&&(Y&192)===128&&(N=(I&15)<<12|(W&63)<<6|Y&63,N>2047&&(N<55296||N>57343)&&(S=N));break;case 4:W=s[h+1],Y=s[h+2],G=s[h+3],(W&192)===128&&(Y&192)===128&&(G&192)===128&&(N=(I&15)<<18|(W&63)<<12|(Y&63)<<6|G&63,N>65535&&N<1114112&&(S=N))}}S===null?(S=65533,R=1):S>65535&&(S-=65536,c.push(S>>>10&1023|55296),S=56320|S&1023),c.push(S),h+=R}return Xa(c)}const Ms=4096;function Xa(s){const r=s.length;if(r<=Ms)return String.fromCharCode.apply(String,s);let o="",c=0;for(;c<r;)o+=String.fromCharCode.apply(String,s.slice(c,c+=Ms));return o}function Wa(s,r,o){let c="";o=Math.min(s.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(s[h]&127);return c}function Ga(s,r,o){let c="";o=Math.min(s.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(s[h]);return c}function Za(s,r,o){const c=s.length;(!r||r<0)&&(r=0),(!o||o<0||o>c)&&(o=c);let h="";for(let I=r;I<o;++I)h+=va[s[I]];return h}function Ja(s,r,o){const c=s.slice(r,o);let h="";for(let I=0;I<c.length-1;I+=2)h+=String.fromCharCode(c[I]+c[I+1]*256);return h}u.prototype.slice=function(r,o){const c=this.length;r=~~r,o=o===void 0?c:~~o,r<0?(r+=c,r<0&&(r=0)):r>c&&(r=c),o<0?(o+=c,o<0&&(o=0)):o>c&&(o=c),o<r&&(o=r);const h=this.subarray(r,o);return Object.setPrototypeOf(h,u.prototype),h};function v(s,r,o){if(s%1!==0||s<0)throw new RangeError("offset is not uint");if(s+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||v(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return h},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||v(r,o,this.length);let h=this[r+--o],I=1;for(;o>0&&(I*=256);)h+=this[r+--o]*I;return h},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||v(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||v(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||v(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||v(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||v(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=_t(function(r){r=r>>>0,ye(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,I=this[++r]+this[++r]*2**8+this[++r]*2**16+c*2**24;return BigInt(h)+(BigInt(I)<<BigInt(32))}),u.prototype.readBigUInt64BE=_t(function(r){r=r>>>0,ye(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],I=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c;return(BigInt(h)<<BigInt(32))+BigInt(I)}),u.prototype.readIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||v(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return I*=128,h>=I&&(h-=Math.pow(2,8*o)),h},u.prototype.readIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||v(r,o,this.length);let h=o,I=1,S=this[r+--h];for(;h>0&&(I*=256);)S+=this[r+--h]*I;return I*=128,S>=I&&(S-=Math.pow(2,8*o)),S},u.prototype.readInt8=function(r,o){return r=r>>>0,o||v(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||v(r,2,this.length);const c=this[r]|this[r+1]<<8;return c&32768?c|4294901760:c},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||v(r,2,this.length);const c=this[r+1]|this[r]<<8;return c&32768?c|4294901760:c},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||v(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||v(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=_t(function(r){r=r>>>0,ye(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(c<<24);return(BigInt(h)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=_t(function(r){r=r>>>0,ye(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(h)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||v(r,4,this.length),n.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||v(r,4,this.length),n.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||v(r,8,this.length),n.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||v(r,8,this.length),n.read(this,r,!1,52,8)};function ot(s,r,o,c,h,I){if(!u.isBuffer(s))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>h||r<I)throw new RangeError('"value" argument is out of bounds');if(o+c>s.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const R=Math.pow(2,8*c)-1;ot(this,r,o,c,R,0)}let I=1,S=0;for(this[o]=r&255;++S<c&&(I*=256);)this[o+S]=r/I&255;return o+c},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const R=Math.pow(2,8*c)-1;ot(this,r,o,c,R,0)}let I=c-1,S=1;for(this[o+I]=r&255;--I>=0&&(S*=256);)this[o+I]=r/S&255;return o+c},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function Ls(s,r,o,c,h){xs(r,c,h,s,o,7);let I=Number(r&BigInt(4294967295));s[o++]=I,I=I>>8,s[o++]=I,I=I>>8,s[o++]=I,I=I>>8,s[o++]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return s[o++]=S,S=S>>8,s[o++]=S,S=S>>8,s[o++]=S,S=S>>8,s[o++]=S,o}function Us(s,r,o,c,h){xs(r,c,h,s,o,7);let I=Number(r&BigInt(4294967295));s[o+7]=I,I=I>>8,s[o+6]=I,I=I>>8,s[o+5]=I,I=I>>8,s[o+4]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return s[o+3]=S,S=S>>8,s[o+2]=S,S=S>>8,s[o+1]=S,S=S>>8,s[o]=S,o+8}u.prototype.writeBigUInt64LE=_t(function(r,o=0){return Ls(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=_t(function(r,o=0){return Us(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const W=Math.pow(2,8*c-1);ot(this,r,o,c,W-1,-W)}let I=0,S=1,R=0;for(this[o]=r&255;++I<c&&(S*=256);)r<0&&R===0&&this[o+I-1]!==0&&(R=1),this[o+I]=(r/S>>0)-R&255;return o+c},u.prototype.writeIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const W=Math.pow(2,8*c-1);ot(this,r,o,c,W-1,-W)}let I=c-1,S=1,R=0;for(this[o+I]=r&255;--I>=0&&(S*=256);)r<0&&R===0&&this[o+I+1]!==0&&(R=1),this[o+I]=(r/S>>0)-R&255;return o+c},u.prototype.writeInt8=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||ot(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=_t(function(r,o=0){return Ls(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=_t(function(r,o=0){return Us(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Fs(s,r,o,c,h,I){if(o+c>s.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function Os(s,r,o,c,h){return r=+r,o=o>>>0,h||Fs(s,r,o,4),n.write(s,r,o,c,23,4),o+4}u.prototype.writeFloatLE=function(r,o,c){return Os(this,r,o,!0,c)},u.prototype.writeFloatBE=function(r,o,c){return Os(this,r,o,!1,c)};function Qs(s,r,o,c,h){return r=+r,o=o>>>0,h||Fs(s,r,o,8),n.write(s,r,o,c,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,c){return Qs(this,r,o,!0,c)},u.prototype.writeDoubleBE=function(r,o,c){return Qs(this,r,o,!1,c)},u.prototype.copy=function(r,o,c,h){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(c||(c=0),!h&&h!==0&&(h=this.length),o>=r.length&&(o=r.length),o||(o=0),h>0&&h<c&&(h=c),h===c||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(c<0||c>=this.length)throw new RangeError("Index out of range");if(h<0)throw new RangeError("sourceEnd out of bounds");h>this.length&&(h=this.length),r.length-o<h-c&&(h=r.length-o+c);const I=h-c;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,c,h):Uint8Array.prototype.set.call(r,this.subarray(c,h),o),I},u.prototype.fill=function(r,o,c,h){if(typeof r=="string"){if(typeof o=="string"?(h=o,o=0,c=this.length):typeof c=="string"&&(h=c,c=this.length),h!==void 0&&typeof h!="string")throw new TypeError("encoding must be a string");if(typeof h=="string"&&!u.isEncoding(h))throw new TypeError("Unknown encoding: "+h);if(r.length===1){const S=r.charCodeAt(0);(h==="utf8"&&S<128||h==="latin1")&&(r=S)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<c)throw new RangeError("Out of range index");if(c<=o)return this;o=o>>>0,c=c===void 0?this.length:c>>>0,r||(r=0);let I;if(typeof r=="number")for(I=o;I<c;++I)this[I]=r;else{const S=u.isBuffer(r)?r:u.from(r,h),R=S.length;if(R===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(I=0;I<c-o;++I)this[I+o]=S[I%R]}return this};const ke={};function Mn(s,r,o){ke[s]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${s}]`,this.stack,delete this.name}get code(){return s}set code(h){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:h,writable:!0})}toString(){return`${this.name} [${s}]: ${this.message}`}}}Mn("ERR_BUFFER_OUT_OF_BOUNDS",function(s){return s?`${s} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Mn("ERR_INVALID_ARG_TYPE",function(s,r){return`The "${s}" argument must be of type number. Received type ${typeof r}`},TypeError),Mn("ERR_OUT_OF_RANGE",function(s,r,o){let c=`The value of "${s}" is out of range.`,h=o;return Number.isInteger(o)&&Math.abs(o)>2**32?h=Ns(String(o)):typeof o=="bigint"&&(h=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(h=Ns(h)),h+="n"),c+=` It must be ${r}. Received ${h}`,c},RangeError);function Ns(s){let r="",o=s.length;const c=s[0]==="-"?1:0;for(;o>=c+4;o-=3)r=`_${s.slice(o-3,o)}${r}`;return`${s.slice(0,o)}${r}`}function _a(s,r,o){ye(r,"offset"),(s[r]===void 0||s[r+o]===void 0)&&_e(r,s.length-(o+1))}function xs(s,r,o,c,h,I){if(s>o||s<r){const S=typeof r=="bigint"?"n":"";let R;throw I>3?r===0||r===BigInt(0)?R=`>= 0${S} and < 2${S} ** ${(I+1)*8}${S}`:R=`>= -(2${S} ** ${(I+1)*8-1}${S}) and < 2 ** ${(I+1)*8-1}${S}`:R=`>= ${r}${S} and <= ${o}${S}`,new ke.ERR_OUT_OF_RANGE("value",R,s)}_a(c,h,I)}function ye(s,r){if(typeof s!="number")throw new ke.ERR_INVALID_ARG_TYPE(r,"number",s)}function _e(s,r,o){throw Math.floor(s)!==s?(ye(s,o),new ke.ERR_OUT_OF_RANGE(o||"offset","an integer",s)):r<0?new ke.ERR_BUFFER_OUT_OF_BOUNDS:new ke.ERR_OUT_OF_RANGE(o||"offset",`>= ${o?1:0} and <= ${r}`,s)}const Va=/[^+/0-9A-Za-z-_]/g;function Ha(s){if(s=s.split("=")[0],s=s.trim().replace(Va,""),s.length<2)return"";for(;s.length%4!==0;)s=s+"=";return s}function Ln(s,r){r=r||1/0;let o;const c=s.length;let h=null;const I=[];for(let S=0;S<c;++S){if(o=s.charCodeAt(S),o>55295&&o<57344){if(!h){if(o>56319){(r-=3)>-1&&I.push(239,191,189);continue}else if(S+1===c){(r-=3)>-1&&I.push(239,191,189);continue}h=o;continue}if(o<56320){(r-=3)>-1&&I.push(239,191,189),h=o;continue}o=(h-55296<<10|o-56320)+65536}else h&&(r-=3)>-1&&I.push(239,191,189);if(h=null,o<128){if((r-=1)<0)break;I.push(o)}else if(o<2048){if((r-=2)<0)break;I.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;I.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;I.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return I}function ja(s){const r=[];for(let o=0;o<s.length;++o)r.push(s.charCodeAt(o)&255);return r}function $a(s,r){let o,c,h;const I=[];for(let S=0;S<s.length&&!((r-=2)<0);++S)o=s.charCodeAt(S),c=o>>8,h=o%256,I.push(h),I.push(c);return I}function Ys(s){return e.toByteArray(Ha(s))}function Fr(s,r,o,c){let h;for(h=0;h<c&&!(h+o>=r.length||h>=s.length);++h)r[h+o]=s[h];return h}function dt(s,r){return s instanceof r||s!=null&&s.constructor!=null&&s.constructor.name!=null&&s.constructor.name===r.name}function Un(s){return s!==s}const va=function(){const s="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const c=o*16;for(let h=0;h<16;++h)r[c+h]=s[o]+s[h]}return r}();function _t(s){return typeof BigInt>"u"?za:s}function za(){throw new Error("BigInt not supported")}})(Vt);var U=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(U||{}),ft=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t))(ft||{}),Z=(t=>(t[t.STATE=0]="STATE",t[t.DEBUG=1]="DEBUG",t[t.DISASSEMBLE_ADDR=2]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=3]="BREAKPOINTS",t[t.STEP_INTO=4]="STEP_INTO",t[t.STEP_OVER=5]="STEP_OVER",t[t.STEP_OUT=6]="STEP_OUT",t[t.SPEED=7]="SPEED",t[t.TIME_TRAVEL=8]="TIME_TRAVEL",t[t.RESTORE_STATE=9]="RESTORE_STATE",t[t.KEYPRESS=10]="KEYPRESS",t[t.MOUSEEVENT=11]="MOUSEEVENT",t[t.PASTE_TEXT=12]="PASTE_TEXT",t[t.APPLE_PRESS=13]="APPLE_PRESS",t[t.APPLE_RELEASE=14]="APPLE_RELEASE",t[t.GET_SAVE_STATE=15]="GET_SAVE_STATE",t[t.DRIVE_PROPS=16]="DRIVE_PROPS",t[t.GAMEPAD=17]="GAMEPAD",t[t.SET_BINARY_BLOCK=18]="SET_BINARY_BLOCK",t[t.COMM_DATA=19]="COMM_DATA",t))(Z||{}),Ht=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Ht||{}),l=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(l||{});const Vs=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Nr=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",F=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),Te=t=>t.split("").map(e=>e.charCodeAt(0)),Hs=t=>[t&255,t>>>8&255],On=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Qn=(t,e)=>{const n=t.lastIndexOf(".")+1;return t.substring(0,n)+e},xr=new Uint32Array(256).fill(0),js=()=>{let t;for(let e=0;e<256;e++){t=e;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;xr[e]=t}},$s=(t,e=0)=>{xr[255]===0&&js();let n=-1;for(let i=e;i<t.length;i++)n=n>>>8^xr[(n^t[i])&255];return(n^-1)>>>0};let ht;const jt=Math.trunc(.0028*1020484);let Yr=jt/2,Kr=jt/2,qr=jt/2,Xr=jt/2,Nn=0,xn=!1,Yn=!1,Wr=!1,Gr=!1,He=!1,Kn=!1,qn=!1;const Zr=()=>{Wr=!0},Xn=()=>{Gr=!0},vs=()=>{He=!0},je=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*jt/2),Wn=t=>{Yr=je(t)},Gn=t=>{Kr=je(t)},Zn=t=>{qr=je(t)},Jn=t=>{Xr=je(t)},Jr=()=>{Kn=xn||Wr,qn=Yn||Gr,C.PB0.isSet=Kn,C.PB1.isSet=qn||He,C.PB2.isSet=He},_n=(t,e)=>{e?xn=t:Yn=t,Jr()},zs=t=>{J(49252,128),J(49253,128),J(49254,128),J(49255,128),Nn=t},Vn=t=>{const e=t-Nn;J(49252,e<Yr?128:0),J(49253,e<Kr?128:0),J(49254,e<qr?128:0),J(49255,e<Xr?128:0)};let $t,_r,Hn=!1;const ti=t=>{ht=t,Hn=!ht.length||!ht[0].buttons.length,$t=pi(),_r=$t.gamepad?$t.gamepad:hi},jn=t=>t>-.01&&t<.01,ei=t=>{let e=t[0],n=t[1];jn(e)&&(e=0),jn(n)&&(n=0);const i=Math.sqrt(e*e+n*n),A=.95*(i===0?1:Math.max(Math.abs(e),Math.abs(n))/i);return e=Math.min(Math.max(-A,e),A),n=Math.min(Math.max(-A,n),A),e=Math.trunc(jt*(e+A)/(2*A)),n=Math.trunc(jt*(n+A)/(2*A)),[e,n]},$n=t=>{const e=$t.joystick?$t.joystick(ht[t].axes,Hn):ht[t].axes,n=ei(e);t===0?(Yr=n[0],Kr=n[1],Wr=!1,Gr=!1):(qr=n[0],Xr=n[1],He=!1);let i=!1;ht[t].buttons.forEach((A,g)=>{A&&(_r(g,ht.length>1,t===1),i=!0)}),i||_r(-1,ht.length>1,t===1),$t.rumble&&$t.rumble(),Jr()},ri=()=>{ht&&ht.length>0&&($n(0),ht.length>1&&$n(1))},ni=t=>{switch(t){case 0:L("JL");break;case 1:L("G",200);break;case 2:X("M"),L("O");break;case 3:L("L");break;case 4:L("F");break;case 5:X("P"),L("T");break;case 6:break;case 7:break;case 8:L("Z");break;case 9:{const e=go();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:break;case 11:break;case 12:L("L");break;case 13:L("M");break;case 14:L("A");break;case 15:L("D");break;case-1:return}};let vt=0,zt=0,te=!1;const $e=.5,oi={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-$e?(zt=0,vt===0||vt>2?(vt=0,X("A")):vt===1&&te?L("W"):vt===2&&te&&L("R"),vt++,te=!1,t):t[0]>$e?(vt=0,zt===0||zt>2?(zt=0,X("D")):zt===1&&te?L("W"):zt===2&&te&&L("R"),zt++,te=!1,t):t[1]<-$e?(L("C"),t):t[1]>$e?(L("S"),t):(te=!0,t),gamepad:ni,rumble:null,setup:null,helptext:`AZTEC
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
`},si={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let Vr=14,Hr=14;const ii={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=E(182);Vr<40&&t<Vr&&Pn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Vr=t,t=E(183),Hr<40&&t<Hr&&Pn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Hr=t},setup:null,helptext:`KARATEKA
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
`},ai=t=>{switch(t){case 0:L("A");break;case 1:L("C",50);break;case 2:L("O");break;case 3:L("T");break;case 4:L("\x1B");break;case 5:L("\r");break;case 6:break;case 7:break;case 8:X("N"),L("'");break;case 9:X("Y"),L("1");break;case 10:break;case 11:break;case 12:break;case 13:L(" ");break;case 14:break;case 15:L("	");break;case-1:return}},Lt=.5,Ai={address:768,data:[141,74,3,132],keymap:{},gamepad:ai,joystick:(t,e)=>{if(e)return t;const n=t[0]<-Lt?"\b":t[0]>Lt?"":"",i=t[1]<-Lt?"\v":t[1]>Lt?`
`:"";let A=n+i;return A||(A=t[2]<-Lt?"L\b":t[2]>Lt?"L":"",A||(A=t[3]<-Lt?"L\v":t[3]>Lt?`L
`:"")),A&&L(A,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
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
`,ci=t=>{switch(t){case 1:d(109,255);break;case 12:X("A");break;case 13:X("Z");break;case 14:X("\b");break;case 15:X("");break}},ve=.75,ui=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{d(25025,173),d(25036,64)},helptext:vn},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-ve?"\b":t[0]>ve?"":t[1]<-ve?"A":t[1]>ve?"Z":"";return e&&X(e),t},gamepad:ci,rumble:null,setup:null,helptext:vn}],li={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},fi={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Zr();break;case 1:Xn();break;case 2:L(" ");break;case 3:L("U");break;case 4:L("\r");break;case 5:L("T");break;case 9:{const e=go();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:Zr();break}},rumble:()=>{E(49178)<128&&E(49181)<128&&Pn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{d(5128,0),d(5130,4);let t=5210;d(t,234),d(t+1,234),d(t+2,234),t=5224,d(t,234),d(t+1,234),d(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},Pe=new Array,ee=t=>{Array.isArray(t)?Pe.push(...t):Pe.push(t)};ee(oi),ee(si),ee(ii),ee(Ai),ee(ui),ee(li),ee(fi);const hi=(t,e,n)=>{if(n)switch(t){case 0:vs();break;case 1:break;case 12:Jn(-1);break;case 13:Jn(1);break;case 14:Zn(-1);break;case 15:Zn(1);break}else switch(t){case 0:Zr();break;case 1:e||Xn();break;case 12:Gn(-1);break;case 13:Gn(1);break;case 14:Wn(-1);break;case 15:Wn(1);break}},gi={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},zn=t=>{for(const e of Pe)if(en(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},pi=()=>{for(const t of Pe)if(en(t.address,t.data))return t;return gi},to=(t=!1)=>{for(const e of Pe)if(en(e.address,e.data)){Rs(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&Rs(" ")},Ii=t=>{J(49152,t|128,32)};let re="",eo=1e9;const Si=()=>{const t=performance.now();if(re!==""&&($r(49152)<128||t-eo>1500)){eo=t;const e=re.charCodeAt(0);Ii(e),re=re.slice(1),re.length===0&&Cs()}};let ro="";const X=t=>{t===ro&&re.length>0||(ro=t,re+=t)};let no=0;const L=(t,e=300)=>{const n=performance.now();n-no<e||(no=n,X(t))},Ei=t=>{t.length===1&&(t=zn(t)),X(t)},Ci=t=>{t.length===1&&(t=zn(t)),X(t)},ze=[],w=(t,e,n=!1,i=null)=>{const A={offAddr:t,onAddr:t+1,isSetAddr:e,writeOnly:n,isSet:!1,setFunc:i};return t>=49152&&(ze[t-49152]=A,ze[t+1-49152]=A),e>=49152&&(ze[e-49152]=A),A},he=()=>Math.floor(256*Math.random()),Bi=t=>{t&=11,C.READBSR2.isSet=t===0,C.WRITEBSR2.isSet=t===1,C.OFFBSR2.isSet=t===2,C.RDWRBSR2.isSet=t===3,C.READBSR1.isSet=t===8,C.WRITEBSR1.isSet=t===9,C.OFFBSR1.isSet=t===10,C.RDWRBSR1.isSet=t===11,C.BSRBANK2.isSet=t<=3,C.BSRREADRAM.isSet=[0,3,8,11].includes(t)},C={STORE80:w(49152,49176,!0),RAMRD:w(49154,49171,!0),RAMWRT:w(49156,49172,!0),INTCXROM:w(49158,49173,!0),INTC8ROM:w(0,0),ALTZP:w(49160,49174,!0),SLOTC3ROM:w(49162,49175,!0),COLUMN80:w(49164,49183,!0),ALTCHARSET:w(49166,49182,!0),KBRDSTROBE:w(0,49168,!1,()=>{const t=$r(49152)&127;J(49152,t,32)}),BSRBANK2:w(0,49169),BSRREADRAM:w(0,49170),CASSOUT:w(49184,0),SPEAKER:w(49200,0,!1,(t,e)=>{J(49200,he()),Ta(e)}),GCSTROBE:w(49216,0),EMUBYTE:w(0,49231,!1,()=>{J(49231,205)}),TEXT:w(49232,49178),MIXED:w(49234,49179),PAGE2:w(49236,49180),HIRES:w(49238,49181),AN0:w(49240,0),AN1:w(49242,0),AN2:w(49244,0),AN3:w(49246,0),CASSIN1:w(0,49248,!1,()=>{J(49248,he())}),PB0:w(0,49249),PB1:w(0,49250),PB2:w(0,49251),JOYSTICK12:w(49252,0,!1,(t,e)=>{Vn(e)}),JOYSTICK34:w(49254,0,!1,(t,e)=>{Vn(e)}),CASSIN2:w(0,49256,!1,()=>{J(49256,he())}),FASTCHIP_LOCK:w(49258,0),FASTCHIP_ENABLE:w(49259,0),FASTCHIP_SPEED:w(49261,0),JOYSTICKRESET:w(49264,0,!1,(t,e)=>{zs(e),J(49264,he())}),LASER128EX:w(49268,0),READBSR2:w(49280,0),WRITEBSR2:w(49281,0),OFFBSR2:w(49282,0),RDWRBSR2:w(49283,0),READBSR1:w(49288,0),WRITEBSR1:w(49289,0),OFFBSR1:w(49290,0),RDWRBSR1:w(49291,0)};C.TEXT.isSet=!0;const mi=[49152,49153,49165,49167,49200,49236,49237,49183],oo=(t,e,n)=>{if(t>1048575&&!mi.includes(t)){const A=$r(t)>128?1:0;console.log(`${n} $${F(a.PC)}: $${F(t)} [${A}] ${e?"write":""}`)}if(t>=49280&&t<=49295){t-=t&4,Bi(t);return}if(t===49152&&!e){Si();return}const i=ze[t-49152];if(!i){console.error("Unknown softswitch "+F(t)),J(t,he());return}if(i.setFunc){i.setFunc(t,n);return}t===i.offAddr||t===i.onAddr?((!i.writeOnly||e)&&(i.isSet=t===i.onAddr),i.isSetAddr&&J(i.isSetAddr,i.isSet?141:13),t>=49184&&J(t,he())):t===i.isSetAddr&&J(t,i.isSet?141:13)},Di=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,so=(1024-64)/64,O=new Uint8Array(163584+so*65536).fill(0),V=new Array(257).fill(0),it=new Array(257).fill(0),ge=256,be=512,io=576,ao=583,wi=639,Me=256*be,tr=256*io,di=256*ao,Ao=256*ge;let ne=0,at=0;const Ri=()=>{const t=C.RAMRD.isSet?at||ge:0,e=C.RAMWRT.isSet?at||ge:0,n=C.PAGE2.isSet?at||ge:0,i=C.STORE80.isSet?n:t,A=C.STORE80.isSet?n:e,g=C.STORE80.isSet&&C.HIRES.isSet?n:t,p=C.STORE80.isSet&&C.HIRES.isSet?n:e;for(let u=2;u<256;u++)V[u]=u+t,it[u]=u+e;for(let u=4;u<=7;u++)V[u]=u+i,it[u]=u+A;for(let u=32;u<=63;u++)V[u]=u+g,it[u]=u+p},ki=()=>{const t=C.ALTZP.isSet?at||ge:0;if(V[0]=t,V[1]=1+t,it[0]=t,it[1]=1+t,C.BSRREADRAM.isSet){for(let e=208;e<=255;e++)V[e]=e+t;if(!C.BSRBANK2.isSet)for(let e=208;e<=223;e++)V[e]=e-16+t}else for(let e=208;e<=255;e++)V[e]=be+e-192},yi=()=>{const t=C.ALTZP.isSet?at||ge:0,e=C.WRITEBSR1.isSet||C.WRITEBSR2.isSet||C.RDWRBSR1.isSet||C.RDWRBSR2.isSet;for(let n=192;n<=255;n++)it[n]=-1;if(e){for(let n=208;n<=255;n++)it[n]=n+t;if(!C.BSRBANK2.isSet)for(let n=208;n<=223;n++)it[n]=n-16+t}},co=t=>C.INTCXROM.isSet?!1:t!==3?!0:C.SLOTC3ROM.isSet,Ti=()=>!(C.INTCXROM.isSet||C.INTC8ROM.isSet||ne<=0),jr=t=>{if(t<8){if(C.INTCXROM.isSet)return;t===3&&!C.SLOTC3ROM.isSet&&(C.INTC8ROM.isSet||(C.INTC8ROM.isSet=!0,ne=-1,oe())),ne===0&&(ne=t,oe())}else C.INTC8ROM.isSet=!1,ne=0,oe()},Pi=()=>{V[192]=be-192;for(let t=1;t<=7;t++){const e=192+t;V[e]=t+(co(t)?io-1:be)}if(Ti()){const t=ao+8*(ne-1);for(let e=0;e<=7;e++){const n=200+e;V[n]=t+e}}else for(let t=200;t<=207;t++)V[t]=be+t-192},oe=()=>{Ri(),ki(),yi(),Pi();for(let t=0;t<256;t++)V[t]=256*V[t],it[t]=256*it[t]},uo=new Map,lo=new Array(8),er=(t,e=-1)=>{const n=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(jr(n),!co(n)))return;const i=lo[n];if(i!==void 0){const A=i(t,e);if(A>=0){const g=t>=49408?tr-256:Me;O[t-49152+g]=A}}},rr=(t,e)=>{lo[t]=e},pe=(t,e,n=0,i=()=>{})=>{if(O.set(e.slice(0,256),tr+(t-1)*256),e.length>256){const A=e.length>2304?2304:e.length,g=di+(t-1)*2048;O.set(e.slice(256,A),g)}n&&uo.set(n,i)},bi=()=>{O.fill(255,0,131071);const t=Di.replace(/\n/g,""),e=new Uint8Array(Vt.Buffer.from(t,"base64"));O.set(e,Me),ne=0,at=0,oe()},Mi=t=>t===49177?Mr?13:141:(t>=49296?er(t):oo(t,!1,a.cycleCount),t>=49232&&oe(),O[Me+t-49152]),Q=(t,e)=>{const n=tr+(t-1)*256+(e&255);return O[n]},P=(t,e,n)=>{if(n>=0){const i=tr+(t-1)*256+(e&255);O[i]=n&255}},E=t=>{const e=t>>>8;if(e===192)return Mi(t);e>=193&&e<=199?er(t):t===53247&&jr(255);const n=V[e];return O[n+(t&255)]},Le=t=>{const e=t>>>8,n=V[e];return O[n+(t&255)]},Li=(t,e)=>{if(t===49265||t===49267){if(e>so)return;at=e?(e-1)*256+wi:0}else t>=49296?er(t,e):oo(t,!0,a.cycleCount);(t<=49167||t>=49232)&&oe()},d=(t,e)=>{const n=t>>>8;if(n===192)Li(t,e);else{n>=193&&n<=199?er(t,e):t===53247&&jr(255);const i=it[n];if(i<0)return;O[i+(t&255)]=e}},$r=t=>O[Me+t-49152],J=(t,e,n=1)=>{const i=Me+t-49152;O.fill(e,i,i+n)},fo=1024,ho=2048,vr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],zr=(t=!1)=>{let e=0,n=24,i=!1;if(t){if(C.TEXT.isSet||C.HIRES.isSet)return new Uint8Array;n=C.MIXED.isSet?20:24,i=C.COLUMN80.isSet&&!C.AN3.isSet}else{if(!C.TEXT.isSet&&!C.MIXED.isSet)return new Uint8Array;!C.TEXT.isSet&&C.MIXED.isSet&&(e=20),i=C.COLUMN80.isSet}if(i){const A=C.PAGE2.isSet&&!C.STORE80.isSet?ho:fo,g=new Uint8Array(80*(n-e)).fill(160);for(let p=e;p<n;p++){const u=80*(p-e);for(let B=0;B<40;B++)g[u+2*B+1]=O[A+vr[p]+B],g[u+2*B]=O[Ao+A+vr[p]+B]}return g}else{const A=C.PAGE2.isSet?ho:fo,g=new Uint8Array(40*(n-e));for(let p=e;p<n;p++){const u=40*(p-e),B=A+vr[p];g.set(O.slice(B,B+40),u)}return g}},go=()=>Vt.Buffer.from(zr().map(t=>t&=127)).toString(),Ui=()=>{if(C.TEXT.isSet||!C.HIRES.isSet)return new Uint8Array;const t=C.COLUMN80.isSet&&!C.AN3.isSet,e=C.MIXED.isSet?160:192;if(t){const n=C.PAGE2.isSet&&!C.STORE80.isSet?16384:8192,i=new Uint8Array(80*e);for(let A=0;A<e;A++){const g=n+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);for(let p=0;p<40;p++)i[A*80+2*p+1]=O[g+p],i[A*80+2*p]=O[Ao+g+p]}return i}else{const n=C.PAGE2.isSet?16384:8192,i=new Uint8Array(40*e);for(let A=0;A<e;A++){const g=n+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);i.set(O.slice(g,g+40),A*40)}return i}},Fi=t=>{const e=V[t>>>8];return O.slice(e,e+512)},tn=(t,e)=>{const n=it[t>>>8]+(t&255);O.set(e,n),to()},en=(t,e)=>{for(let n=0;n<e.length;n++)if(E(t+n)!==e[n])return!1;return!0},Oi=()=>{const t=[""],e=V[0],n=O.slice(e,e+256);t[0]="     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F";for(let i=0;i<16;i++){let A=F(16*i)+":";for(let g=0;g<16;g++)A+=" "+F(n[i*16+g]);t[i+1]=A}return t.join(`
`)},a=Vs(),po=t=>{a.XReg=t},Io=t=>{a.YReg=t},nr=t=>{a.cycleCount=t},Qi=t=>{So(),Object.assign(a,t)},So=()=>{a.Accum=0,a.XReg=0,a.YReg=0,a.PStatus=36,a.StackPtr=255,St(E(65533)*256+E(65532)),a.flagIRQ=0,a.flagNMI=!1},Eo=t=>{St((a.PC+t+65536)%65536)},St=t=>{a.PC=t},Co=t=>{a.PStatus=t|48},Ni=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),xi=()=>`A=${F(a.Accum)} X=${F(a.XReg)} Y=${F(a.YReg)} P=${F(a.PStatus)} ${Ni(a.PStatus)} S=${F(a.StackPtr)}`,Yi=()=>`PC= ${F(a.PC)}  ${xi()}`,se=new Array(256).fill(""),Ki=()=>{const t=O.slice(256,512),e=new Array;for(let n=255;n>a.StackPtr;n--){let i="$"+F(t[n]),A=se[n];se[n].length>3&&n-1>a.StackPtr&&(se[n-1]==="JSR"||se[n-1]==="BRK"?(n--,i+=F(t[n])):A=""),i=(i+"   ").substring(0,6),e.push(F(256+n,4)+": "+i+A)}return e},qi=()=>{const t=O.slice(256,512);for(let e=a.StackPtr-2;e<=255;e++){const n=t[e];if(se[e].startsWith("JSR")&&e-1>a.StackPtr&&se[e-1]==="JSR"){const i=t[e-1]+1;return(n<<8)+i}}return-1},Rt=(t,e)=>{se[a.StackPtr]=t,d(256+a.StackPtr,e),a.StackPtr=(a.StackPtr+255)%256},kt=()=>{a.StackPtr=(a.StackPtr+1)%256;const t=E(256+a.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},At=()=>(a.PStatus&1)!==0,b=(t=!0)=>a.PStatus=t?a.PStatus|1:a.PStatus&254,Bo=()=>(a.PStatus&2)!==0,mo=(t=!0)=>a.PStatus=t?a.PStatus|2:a.PStatus&253,Xi=()=>(a.PStatus&4)!==0,rn=(t=!0)=>a.PStatus=t?a.PStatus|4:a.PStatus&251,Do=()=>(a.PStatus&8)!==0,_=()=>Do()?1:0,nn=(t=!0)=>a.PStatus=t?a.PStatus|8:a.PStatus&247,on=(t=!0)=>a.PStatus=t?a.PStatus|16:a.PStatus&239,wo=()=>(a.PStatus&64)!==0,Ue=(t=!0)=>a.PStatus=t?a.PStatus|64:a.PStatus&191,Ro=()=>(a.PStatus&128)!==0,ko=(t=!0)=>a.PStatus=t?a.PStatus|128:a.PStatus&127,D=t=>{mo(t===0),ko(t>=128)},yt=(t,e)=>{if(t){const n=a.PC;return Eo(e>127?e-256:e),3+K(n,a.PC)}return 2},k=(t,e)=>(t+e+256)%256,m=(t,e)=>e*256+t,M=(t,e,n)=>(e*256+t+n+65536)%65536,K=(t,e)=>t>>8!==e>>8?1:0,Et=new Array(256),f=(t,e,n,i,A)=>{console.assert(!Et[n],"Duplicate instruction: "+t+" mode="+e),Et[n]={name:t,pcode:n,mode:e,PC:i,execute:A}},Ut=(t,e,n)=>{const i=E(t),A=E((t+1)%256),g=M(i,A,a.YReg);e(g);let p=5+K(g,m(i,A));return n&&(p+=_()),p},Ft=(t,e,n)=>{const i=E(t),A=E((t+1)%256),g=m(i,A);e(g);let p=5;return n&&(p+=_()),p},yo=t=>{let e=(a.Accum&15)+(t&15)+(At()?1:0);e>=10&&(e+=6);let n=(a.Accum&240)+(t&240)+e;const i=a.Accum<=127&&t<=127,A=a.Accum>=128&&t>=128;Ue((n&255)>=128?i:A),b(n>=160),At()&&(n+=96),a.Accum=n&255,D(a.Accum)},or=t=>{let e=a.Accum+t+(At()?1:0);b(e>=256),e=e%256;const n=a.Accum<=127&&t<=127,i=a.Accum>=128&&t>=128;Ue(e>=128?n:i),a.Accum=e,D(a.Accum)},Ot=t=>{Do()?yo(E(t)):or(E(t))};f("ADC",l.IMM,105,2,t=>(_()?yo(t):or(t),2+_())),f("ADC",l.ZP_REL,101,2,t=>(Ot(t),3+_())),f("ADC",l.ZP_X,117,2,t=>(Ot(k(t,a.XReg)),4+_())),f("ADC",l.ABS,109,3,(t,e)=>(Ot(m(t,e)),4+_())),f("ADC",l.ABS_X,125,3,(t,e)=>{const n=M(t,e,a.XReg);return Ot(n),4+_()+K(n,m(t,e))}),f("ADC",l.ABS_Y,121,3,(t,e)=>{const n=M(t,e,a.YReg);return Ot(n),4+_()+K(n,m(t,e))}),f("ADC",l.IND_X,97,2,t=>{const e=k(t,a.XReg);return Ot(m(E(e),E(e+1))),6+_()}),f("ADC",l.IND_Y,113,2,t=>Ut(t,Ot,!0)),f("ADC",l.IND,114,2,t=>Ft(t,Ot,!0));const Qt=t=>{a.Accum&=E(t),D(a.Accum)};f("AND",l.IMM,41,2,t=>(a.Accum&=t,D(a.Accum),2)),f("AND",l.ZP_REL,37,2,t=>(Qt(t),3)),f("AND",l.ZP_X,53,2,t=>(Qt(k(t,a.XReg)),4)),f("AND",l.ABS,45,3,(t,e)=>(Qt(m(t,e)),4)),f("AND",l.ABS_X,61,3,(t,e)=>{const n=M(t,e,a.XReg);return Qt(n),4+K(n,m(t,e))}),f("AND",l.ABS_Y,57,3,(t,e)=>{const n=M(t,e,a.YReg);return Qt(n),4+K(n,m(t,e))}),f("AND",l.IND_X,33,2,t=>{const e=k(t,a.XReg);return Qt(m(E(e),E(e+1))),6}),f("AND",l.IND_Y,49,2,t=>Ut(t,Qt,!1)),f("AND",l.IND,50,2,t=>Ft(t,Qt,!1));const sr=t=>{let e=E(t);E(t),b((e&128)===128),e=(e<<1)%256,d(t,e),D(e)};f("ASL",l.IMPLIED,10,1,()=>(b((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256,D(a.Accum),2)),f("ASL",l.ZP_REL,6,2,t=>(sr(t),5)),f("ASL",l.ZP_X,22,2,t=>(sr(k(t,a.XReg)),6)),f("ASL",l.ABS,14,3,(t,e)=>(sr(m(t,e)),6)),f("ASL",l.ABS_X,30,3,(t,e)=>{const n=M(t,e,a.XReg);return sr(n),6+K(n,m(t,e))}),f("BCC",l.ZP_REL,144,2,t=>yt(!At(),t)),f("BCS",l.ZP_REL,176,2,t=>yt(At(),t)),f("BEQ",l.ZP_REL,240,2,t=>yt(Bo(),t)),f("BMI",l.ZP_REL,48,2,t=>yt(Ro(),t)),f("BNE",l.ZP_REL,208,2,t=>yt(!Bo(),t)),f("BPL",l.ZP_REL,16,2,t=>yt(!Ro(),t)),f("BVC",l.ZP_REL,80,2,t=>yt(!wo(),t)),f("BVS",l.ZP_REL,112,2,t=>yt(wo(),t)),f("BRA",l.ZP_REL,128,2,t=>yt(!0,t));const Fe=t=>{mo((a.Accum&t)===0),ko((t&128)!==0),Ue((t&64)!==0)};f("BIT",l.ZP_REL,36,2,t=>(Fe(E(t)),3)),f("BIT",l.ABS,44,3,(t,e)=>(Fe(E(m(t,e))),4)),f("BIT",l.IMM,137,2,t=>(Fe(t),2)),f("BIT",l.ZP_X,52,2,t=>(Fe(E(k(t,a.XReg))),4)),f("BIT",l.ABS_X,60,3,(t,e)=>{const n=M(t,e,a.XReg);return Fe(E(n)),4+K(n,m(t,e))});const sn=(t,e,n=0)=>{const i=(a.PC+n)%65536,A=E(e),g=E(e+1);Rt(`${t} $`+F(g)+F(A),Math.trunc(i/256)),Rt(t,i%256),Rt("P",a.PStatus),nn(!1),rn();const p=M(A,g,t==="BRK"?-1:0);St(p)},To=()=>(on(),sn("BRK",65534,2),7);f("BRK",l.IMPLIED,0,1,To);const Wi=()=>Xi()?0:(on(!1),sn("IRQ",65534),7),Gi=()=>(sn("NMI",65530),7);f("CLC",l.IMPLIED,24,1,()=>(b(!1),2)),f("CLD",l.IMPLIED,216,1,()=>(nn(!1),2)),f("CLI",l.IMPLIED,88,1,()=>(rn(!1),2)),f("CLV",l.IMPLIED,184,1,()=>(Ue(!1),2));const ie=t=>{const e=E(t);b(a.Accum>=e),D((a.Accum-e+256)%256)},Zi=t=>{const e=E(t);b(a.Accum>=e),D((a.Accum-e+256)%256)};f("CMP",l.IMM,201,2,t=>(b(a.Accum>=t),D((a.Accum-t+256)%256),2)),f("CMP",l.ZP_REL,197,2,t=>(ie(t),3)),f("CMP",l.ZP_X,213,2,t=>(ie(k(t,a.XReg)),4)),f("CMP",l.ABS,205,3,(t,e)=>(ie(m(t,e)),4)),f("CMP",l.ABS_X,221,3,(t,e)=>{const n=M(t,e,a.XReg);return Zi(n),4+K(n,m(t,e))}),f("CMP",l.ABS_Y,217,3,(t,e)=>{const n=M(t,e,a.YReg);return ie(n),4+K(n,m(t,e))}),f("CMP",l.IND_X,193,2,t=>{const e=k(t,a.XReg);return ie(m(E(e),E(e+1))),6}),f("CMP",l.IND_Y,209,2,t=>Ut(t,ie,!1)),f("CMP",l.IND,210,2,t=>Ft(t,ie,!1));const Po=t=>{const e=E(t);b(a.XReg>=e),D((a.XReg-e+256)%256)};f("CPX",l.IMM,224,2,t=>(b(a.XReg>=t),D((a.XReg-t+256)%256),2)),f("CPX",l.ZP_REL,228,2,t=>(Po(t),3)),f("CPX",l.ABS,236,3,(t,e)=>(Po(m(t,e)),4));const bo=t=>{const e=E(t);b(a.YReg>=e),D((a.YReg-e+256)%256)};f("CPY",l.IMM,192,2,t=>(b(a.YReg>=t),D((a.YReg-t+256)%256),2)),f("CPY",l.ZP_REL,196,2,t=>(bo(t),3)),f("CPY",l.ABS,204,3,(t,e)=>(bo(m(t,e)),4));const ir=t=>{const e=k(E(t),-1);d(t,e),D(e)};f("DEC",l.IMPLIED,58,1,()=>(a.Accum=k(a.Accum,-1),D(a.Accum),2)),f("DEC",l.ZP_REL,198,2,t=>(ir(t),5)),f("DEC",l.ZP_X,214,2,t=>(ir(k(t,a.XReg)),6)),f("DEC",l.ABS,206,3,(t,e)=>(ir(m(t,e)),6)),f("DEC",l.ABS_X,222,3,(t,e)=>{const n=M(t,e,a.XReg);return E(n),ir(n),7}),f("DEX",l.IMPLIED,202,1,()=>(a.XReg=k(a.XReg,-1),D(a.XReg),2)),f("DEY",l.IMPLIED,136,1,()=>(a.YReg=k(a.YReg,-1),D(a.YReg),2));const Nt=t=>{a.Accum^=E(t),D(a.Accum)};f("EOR",l.IMM,73,2,t=>(a.Accum^=t,D(a.Accum),2)),f("EOR",l.ZP_REL,69,2,t=>(Nt(t),3)),f("EOR",l.ZP_X,85,2,t=>(Nt(k(t,a.XReg)),4)),f("EOR",l.ABS,77,3,(t,e)=>(Nt(m(t,e)),4)),f("EOR",l.ABS_X,93,3,(t,e)=>{const n=M(t,e,a.XReg);return Nt(n),4+K(n,m(t,e))}),f("EOR",l.ABS_Y,89,3,(t,e)=>{const n=M(t,e,a.YReg);return Nt(n),4+K(n,m(t,e))}),f("EOR",l.IND_X,65,2,t=>{const e=k(t,a.XReg);return Nt(m(E(e),E(e+1))),6}),f("EOR",l.IND_Y,81,2,t=>Ut(t,Nt,!1)),f("EOR",l.IND,82,2,t=>Ft(t,Nt,!1));const ar=t=>{const e=k(E(t),1);d(t,e),D(e)};f("INC",l.IMPLIED,26,1,()=>(a.Accum=k(a.Accum,1),D(a.Accum),2)),f("INC",l.ZP_REL,230,2,t=>(ar(t),5)),f("INC",l.ZP_X,246,2,t=>(ar(k(t,a.XReg)),6)),f("INC",l.ABS,238,3,(t,e)=>(ar(m(t,e)),6)),f("INC",l.ABS_X,254,3,(t,e)=>{const n=M(t,e,a.XReg);return E(n),ar(n),7}),f("INX",l.IMPLIED,232,1,()=>(a.XReg=k(a.XReg,1),D(a.XReg),2)),f("INY",l.IMPLIED,200,1,()=>(a.YReg=k(a.YReg,1),D(a.YReg),2)),f("JMP",l.ABS,76,3,(t,e)=>(St(M(t,e,-3)),3)),f("JMP",l.IND,108,3,(t,e)=>{const n=m(t,e);return t=E(n),e=E((n+1)%65536),St(M(t,e,-3)),6}),f("JMP",l.IND_X,124,3,(t,e)=>{const n=M(t,e,a.XReg);return t=E(n),e=E((n+1)%65536),St(M(t,e,-3)),6}),f("JSR",l.ABS,32,3,(t,e)=>{const n=(a.PC+2)%65536;return Rt("JSR $"+F(e)+F(t),Math.trunc(n/256)),Rt("JSR",n%256),St(M(t,e,-3)),6});const xt=t=>{a.Accum=E(t),D(a.Accum)};f("LDA",l.IMM,169,2,t=>(a.Accum=t,D(a.Accum),2)),f("LDA",l.ZP_REL,165,2,t=>(xt(t),3)),f("LDA",l.ZP_X,181,2,t=>(xt(k(t,a.XReg)),4)),f("LDA",l.ABS,173,3,(t,e)=>(xt(m(t,e)),4)),f("LDA",l.ABS_X,189,3,(t,e)=>{const n=M(t,e,a.XReg);return xt(n),4+K(n,m(t,e))}),f("LDA",l.ABS_Y,185,3,(t,e)=>{const n=M(t,e,a.YReg);return xt(n),4+K(n,m(t,e))}),f("LDA",l.IND_X,161,2,t=>{const e=k(t,a.XReg);return xt(m(E(e),E((e+1)%256))),6}),f("LDA",l.IND_Y,177,2,t=>Ut(t,xt,!1)),f("LDA",l.IND,178,2,t=>Ft(t,xt,!1));const Ar=t=>{a.XReg=E(t),D(a.XReg)};f("LDX",l.IMM,162,2,t=>(a.XReg=t,D(a.XReg),2)),f("LDX",l.ZP_REL,166,2,t=>(Ar(t),3)),f("LDX",l.ZP_Y,182,2,t=>(Ar(k(t,a.YReg)),4)),f("LDX",l.ABS,174,3,(t,e)=>(Ar(m(t,e)),4)),f("LDX",l.ABS_Y,190,3,(t,e)=>{const n=M(t,e,a.YReg);return Ar(n),4+K(n,m(t,e))});const cr=t=>{a.YReg=E(t),D(a.YReg)};f("LDY",l.IMM,160,2,t=>(a.YReg=t,D(a.YReg),2)),f("LDY",l.ZP_REL,164,2,t=>(cr(t),3)),f("LDY",l.ZP_X,180,2,t=>(cr(k(t,a.XReg)),4)),f("LDY",l.ABS,172,3,(t,e)=>(cr(m(t,e)),4)),f("LDY",l.ABS_X,188,3,(t,e)=>{const n=M(t,e,a.XReg);return cr(n),4+K(n,m(t,e))});const ur=t=>{let e=E(t);E(t),b((e&1)===1),e>>=1,d(t,e),D(e)};f("LSR",l.IMPLIED,74,1,()=>(b((a.Accum&1)===1),a.Accum>>=1,D(a.Accum),2)),f("LSR",l.ZP_REL,70,2,t=>(ur(t),5)),f("LSR",l.ZP_X,86,2,t=>(ur(k(t,a.XReg)),6)),f("LSR",l.ABS,78,3,(t,e)=>(ur(m(t,e)),6)),f("LSR",l.ABS_X,94,3,(t,e)=>{const n=M(t,e,a.XReg);return ur(n),6+K(n,m(t,e))}),f("NOP",l.IMPLIED,234,1,()=>2);const Yt=t=>{a.Accum|=E(t),D(a.Accum)};f("ORA",l.IMM,9,2,t=>(a.Accum|=t,D(a.Accum),2)),f("ORA",l.ZP_REL,5,2,t=>(Yt(t),3)),f("ORA",l.ZP_X,21,2,t=>(Yt(k(t,a.XReg)),4)),f("ORA",l.ABS,13,3,(t,e)=>(Yt(m(t,e)),4)),f("ORA",l.ABS_X,29,3,(t,e)=>{const n=M(t,e,a.XReg);return Yt(n),4+K(n,m(t,e))}),f("ORA",l.ABS_Y,25,3,(t,e)=>{const n=M(t,e,a.YReg);return Yt(n),4+K(n,m(t,e))}),f("ORA",l.IND_X,1,2,t=>{const e=k(t,a.XReg);return Yt(m(E(e),E(e+1))),6}),f("ORA",l.IND_Y,17,2,t=>Ut(t,Yt,!1)),f("ORA",l.IND,18,2,t=>Ft(t,Yt,!1)),f("PHA",l.IMPLIED,72,1,()=>(Rt("PHA",a.Accum),3)),f("PHP",l.IMPLIED,8,1,()=>(Rt("PHP",a.PStatus|16),3)),f("PHX",l.IMPLIED,218,1,()=>(Rt("PHX",a.XReg),3)),f("PHY",l.IMPLIED,90,1,()=>(Rt("PHY",a.YReg),3)),f("PLA",l.IMPLIED,104,1,()=>(a.Accum=kt(),D(a.Accum),4)),f("PLP",l.IMPLIED,40,1,()=>(Co(kt()),4)),f("PLX",l.IMPLIED,250,1,()=>(a.XReg=kt(),D(a.XReg),4)),f("PLY",l.IMPLIED,122,1,()=>(a.YReg=kt(),D(a.YReg),4));const lr=t=>{let e=E(t);E(t);const n=At()?1:0;b((e&128)===128),e=(e<<1)%256|n,d(t,e),D(e)};f("ROL",l.IMPLIED,42,1,()=>{const t=At()?1:0;return b((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256|t,D(a.Accum),2}),f("ROL",l.ZP_REL,38,2,t=>(lr(t),5)),f("ROL",l.ZP_X,54,2,t=>(lr(k(t,a.XReg)),6)),f("ROL",l.ABS,46,3,(t,e)=>(lr(m(t,e)),6)),f("ROL",l.ABS_X,62,3,(t,e)=>{const n=M(t,e,a.XReg);return lr(n),6+K(n,m(t,e))});const fr=t=>{let e=E(t);E(t);const n=At()?128:0;b((e&1)===1),e=e>>1|n,d(t,e),D(e)};f("ROR",l.IMPLIED,106,1,()=>{const t=At()?128:0;return b((a.Accum&1)===1),a.Accum=a.Accum>>1|t,D(a.Accum),2}),f("ROR",l.ZP_REL,102,2,t=>(fr(t),5)),f("ROR",l.ZP_X,118,2,t=>(fr(k(t,a.XReg)),6)),f("ROR",l.ABS,110,3,(t,e)=>(fr(m(t,e)),6)),f("ROR",l.ABS_X,126,3,(t,e)=>{const n=M(t,e,a.XReg);return fr(n),6+K(n,m(t,e))}),f("RTI",l.IMPLIED,64,1,()=>(Co(kt()),on(!1),St(m(kt(),kt())-1),6)),f("RTS",l.IMPLIED,96,1,()=>(St(m(kt(),kt())),6));const Mo=t=>{const e=255-t;let n=a.Accum+e+(At()?1:0);const i=n>=256,A=a.Accum<=127&&e<=127,g=a.Accum>=128&&e>=128;Ue(n%256>=128?A:g);const p=(a.Accum&15)-(t&15)+(At()?0:-1);n=a.Accum-t+(At()?0:-1),n<0&&(n-=96),p<0&&(n-=6),a.Accum=n&255,D(a.Accum),b(i)},Kt=t=>{_()?Mo(E(t)):or(255-E(t))};f("SBC",l.IMM,233,2,t=>(_()?Mo(t):or(255-t),2+_())),f("SBC",l.ZP_REL,229,2,t=>(Kt(t),3+_())),f("SBC",l.ZP_X,245,2,t=>(Kt(k(t,a.XReg)),4+_())),f("SBC",l.ABS,237,3,(t,e)=>(Kt(m(t,e)),4+_())),f("SBC",l.ABS_X,253,3,(t,e)=>{const n=M(t,e,a.XReg);return Kt(n),4+_()+K(n,m(t,e))}),f("SBC",l.ABS_Y,249,3,(t,e)=>{const n=M(t,e,a.YReg);return Kt(n),4+_()+K(n,m(t,e))}),f("SBC",l.IND_X,225,2,t=>{const e=k(t,a.XReg);return Kt(m(E(e),E(e+1))),6+_()}),f("SBC",l.IND_Y,241,2,t=>Ut(t,Kt,!0)),f("SBC",l.IND,242,2,t=>Ft(t,Kt,!0)),f("SEC",l.IMPLIED,56,1,()=>(b(),2)),f("SED",l.IMPLIED,248,1,()=>(nn(),2)),f("SEI",l.IMPLIED,120,1,()=>(rn(),2)),f("STA",l.ZP_REL,133,2,t=>(d(t,a.Accum),3)),f("STA",l.ZP_X,149,2,t=>(d(k(t,a.XReg),a.Accum),4)),f("STA",l.ABS,141,3,(t,e)=>(d(m(t,e),a.Accum),4)),f("STA",l.ABS_X,157,3,(t,e)=>{const n=M(t,e,a.XReg);return E(n),d(n,a.Accum),5}),f("STA",l.ABS_Y,153,3,(t,e)=>(d(M(t,e,a.YReg),a.Accum),5)),f("STA",l.IND_X,129,2,t=>{const e=k(t,a.XReg);return d(m(E(e),E(e+1)),a.Accum),6});const Lo=t=>{d(t,a.Accum)};f("STA",l.IND_Y,145,2,t=>(Ut(t,Lo,!1),6)),f("STA",l.IND,146,2,t=>Ft(t,Lo,!1)),f("STX",l.ZP_REL,134,2,t=>(d(t,a.XReg),3)),f("STX",l.ZP_Y,150,2,t=>(d(k(t,a.YReg),a.XReg),4)),f("STX",l.ABS,142,3,(t,e)=>(d(m(t,e),a.XReg),4)),f("STY",l.ZP_REL,132,2,t=>(d(t,a.YReg),3)),f("STY",l.ZP_X,148,2,t=>(d(k(t,a.XReg),a.YReg),4)),f("STY",l.ABS,140,3,(t,e)=>(d(m(t,e),a.YReg),4)),f("STZ",l.ZP_REL,100,2,t=>(d(t,0),3)),f("STZ",l.ZP_X,116,2,t=>(d(k(t,a.XReg),0),4)),f("STZ",l.ABS,156,3,(t,e)=>(d(m(t,e),0),4)),f("STZ",l.ABS_X,158,3,(t,e)=>{const n=M(t,e,a.XReg);return E(n),d(n,0),5}),f("TAX",l.IMPLIED,170,1,()=>(a.XReg=a.Accum,D(a.XReg),2)),f("TAY",l.IMPLIED,168,1,()=>(a.YReg=a.Accum,D(a.YReg),2)),f("TSX",l.IMPLIED,186,1,()=>(a.XReg=a.StackPtr,D(a.XReg),2)),f("TXA",l.IMPLIED,138,1,()=>(a.Accum=a.XReg,D(a.Accum),2)),f("TXS",l.IMPLIED,154,1,()=>(a.StackPtr=a.XReg,2)),f("TYA",l.IMPLIED,152,1,()=>(a.Accum=a.YReg,D(a.Accum),2));const Ji=[2,34,66,98,130,194,226],ct="???";Ji.forEach(t=>{f(ct,l.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)f(ct,l.IMPLIED,3+16*t,1,()=>1),f(ct,l.IMPLIED,7+16*t,1,()=>1),f(ct,l.IMPLIED,11+16*t,1,()=>1),f(ct,l.IMPLIED,15+16*t,1,()=>1);f(ct,l.IMPLIED,68,2,()=>3),f(ct,l.IMPLIED,84,2,()=>4),f(ct,l.IMPLIED,212,2,()=>4),f(ct,l.IMPLIED,244,2,()=>4),f(ct,l.IMPLIED,92,3,()=>8),f(ct,l.IMPLIED,220,3,()=>4),f(ct,l.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)Et[t]||f("BRK",l.IMPLIED,t,1,To);const z=(t,e,n)=>{const i=e&7,A=e>>>3;return t[A]|=n>>>i,i&&(t[A+1]|=n<<8-i),e+8},hr=(t,e,n)=>(e=z(t,e,n>>>1|170),e=z(t,e,n|170),e),an=(t,e)=>(e=z(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const _i=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),i=[0,2,1,3];for(let g=0;g<84;g++)n[g]=i[t[g]&3]|i[t[g+86]&3]<<2|i[t[g+172]&3]<<4;n[84]=i[t[84]&3]<<0|i[t[170]&3]<<2,n[85]=i[t[85]&3]<<0|i[t[171]&3]<<2;for(let g=0;g<256;g++)n[86+g]=t[g]>>>2;n[342]=n[341];let A=342;for(;A>1;)A--,n[A]^=n[A-1];for(let g=0;g<343;g++)n[g]=e[n[g]];return n};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Vi=(t,e,n)=>{let i=0;const A=new Uint8Array(6646).fill(0);for(let g=0;g<16;g++)i=an(A,i);for(let g=0;g<16;g++){i=z(A,i,213),i=z(A,i,170),i=z(A,i,150),i=hr(A,i,254),i=hr(A,i,e),i=hr(A,i,g),i=hr(A,i,254^e^g),i=z(A,i,222),i=z(A,i,170),i=z(A,i,235);for(let B=0;B<7;B++)i=an(A,i);i=z(A,i,213),i=z(A,i,170),i=z(A,i,173);const p=g===15?15:g*(n?8:7)%15,u=_i(t.slice(p*256,p*256+256));for(let B=0;B<u.length;B++)i=z(A,i,u[B]);i=z(A,i,222),i=z(A,i,170),i=z(A,i,235);for(let B=0;B<16;B++)i=an(A,i)}return A},Hi=(t,e)=>{if(t.length!==35*16*256)return new Uint8Array;const n=new Uint8Array(512*3+512*35*13).fill(0);n.set(Te(`WOZ2ÿ
\r
`),0),n.set(Te("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(Te("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(Te("TMAP"),80),n[84]=160,n.fill(255,88,88+160);let i=0;for(let A=0;A<35;A++)i=88+(A<<2),A>0&&(n[i-1]=A),n[i]=n[i+1]=A;n.set(Te("TRKS"),248),n.set(On(1280+35*13*512),252);for(let A=0;A<35;A++){i=256+(A<<3),n.set(Hs(3+A*13),i),n[i+2]=13,n.set(On(50304),i+4);const g=t.slice(A*16*256,(A+1)*16*256),p=Vi(g,A,e);i=512*(3+13*A),n.set(p,i)}return n},ji=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,B)=>u!==e[B])===void 0))return!1;t.isWriteProtected=e[22]===1;const A=e.slice(8,12),g=A[0]+(A[1]<<8)+(A[2]<<16)+A[3]*2**24,p=$s(e,12);if(g!==0&&g!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const B=e[88+u*2];if(B<255){const q=256+8*B,y=e.slice(q,q+8);t.trackStart[u]=512*(y[0]+(y[1]<<8)),t.trackNbits[u]=y[4]+(y[5]<<8)+(y[6]<<16)+y[7]*2**24}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},$i=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((A,g)=>A!==e[g])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let A=0;A<80;A++){const g=e[88+A*2];if(g<255){t.trackStart[A]=256+g*6656;const p=e.slice(t.trackStart[A]+6646,t.trackStart[A]+6656);t.trackNbits[A]=p[2]+(p[3]<<8)}else t.trackStart[A]=0,t.trackNbits[A]=51200}return!0},vi=t=>{const e=t.toLowerCase(),n=e.endsWith(".dsk")||e.endsWith(".do"),i=e.endsWith(".po");return n||i},zi=(t,e)=>{const i=t.filename.toLowerCase().endsWith(".po"),A=Hi(e,i);return A.length===0?new Uint8Array:(t.filename=Qn(t.filename,"woz"),t.diskHasChanges=!0,A)},Uo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),t1=(t,e)=>{const n=Uo(e.slice(24,28)),i=Uo(e.slice(28,32));let A="";for(let g=0;g<4;g++)A+=String.fromCharCode(e[g]);return A!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Qn(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(n,n+i))},Fo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},e1=(t,e)=>{t.diskHasChanges=!1;const n=t.filename.toLowerCase();if(Fo(n)){if(t.hardDrive=!0,t.status="",n.endsWith(".hdv")||n.endsWith(".po"))return e;if(n.endsWith(".2mg"))return t1(t,e)}return vi(t.filename)&&(e=zi(t,e)),ji(t,e)||$i(t,e)?e:(n!==""&&console.error("Unknown disk format."),new Uint8Array)},r1=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ie=0;const tt={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},Oo=t=>{tt.MOTOR_RUNNING=!1,Yo(t),t.halftrack=68,t.prevHalfTrack=68},n1=(t=!1)=>{if(t){const e=Cr();e.motorRunning&&Ko(e)}else Re(Ht.MOTOR_OFF)},Qo=(t,e)=>{t.trackStart[t.halftrack]>0&&(t.prevHalfTrack=t.halftrack),t.halftrack+=e,t.halftrack<0||t.halftrack>68?(Re(Ht.TRACK_END),t.halftrack=t.halftrack<0?0:t.halftrack>68?68:t.halftrack):Re(Ht.TRACK_SEEK),t.status=` Track ${t.halftrack/2}`,ut(),t.trackStart[t.halftrack]>0&&t.prevHalfTrack!==t.halftrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack])),t.trackLocation>3&&(t.trackLocation-=4))},No=[128,64,32,16,8,4,2,1],o1=[127,191,223,239,247,251,253,254],An=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let n;if(t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3),A=e[i],g=t.trackLocation&7;n=(A&No[g])>>7-g}else n=1;return t.trackLocation++,n};let rt=0;const s1=(t,e)=>{if(e.length===0)return 0;let n=0;if(rt===0){for(;An(t,e)===0;);rt=64;for(let i=5;i>=0;i--)rt|=An(t,e)<<i}else{const i=An(t,e);rt=rt<<1|i}return n=rt,rt>127&&(rt=0),n};let gr=0;const cn=(t,e,n)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3);let A=e[i];const g=t.trackLocation&7;n?A|=No[g]:A&=o1[g],e[i]=A}t.trackLocation++},xo=(t,e,n)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&rt>0){if(n>=16)for(let i=7;i>=0;i--)cn(t,e,rt&2**i?1:0);n>=36&&cn(t,e,0),n>=40&&cn(t,e,0),un.push(n>=40?2:n>=36?1:rt),t.diskHasChanges=!0,rt=0}},Yo=t=>{Ie=0,tt.MOTOR_RUNNING||(t.motorRunning=!1),ut(),Re(Ht.MOTOR_OFF)},Ko=t=>{Ie&&(clearTimeout(Ie),Ie=0),t.motorRunning=!0,ut(),Re(Ht.MOTOR_ON)},i1=t=>{Ie===0&&(Ie=setTimeout(()=>Yo(t),1e3))};let un=[];const pr=t=>{un.length>0&&t.halftrack===2*0&&(un=[])},Ir=[0,0,0,0],a1=(t,e)=>{if(t>=49408)return-1;let n=Cr();const i=C1();if(n.hardDrive)return 0;let A=0;const g=a.cycleCount-gr;switch(t=t&15,t){case tt.DATA_LATCH_OFF:tt.DATA_LATCH=!1,n.motorRunning&&!n.writeMode&&(A=s1(n,i));break;case tt.MOTOR_ON:tt.MOTOR_RUNNING=!0,Ko(n),pr(n);break;case tt.MOTOR_OFF:tt.MOTOR_RUNNING=!1,i1(n),pr(n);break;case tt.DRIVE1:case tt.DRIVE2:{const p=t===tt.DRIVE1?1:2,u=Cr();E1(p),n=Cr(),n!==u&&u.motorRunning&&(u.motorRunning=!1,n.motorRunning=!0,ut());break}case tt.WRITE_OFF:n.motorRunning&&n.writeMode&&(xo(n,i,g),gr=a.cycleCount),n.writeMode=!1,tt.DATA_LATCH&&(A=n.isWriteProtected?255:0),pr(n);break;case tt.WRITE_ON:n.writeMode=!0,gr=a.cycleCount,e>=0&&(rt=e);break;case tt.DATA_LATCH_ON:tt.DATA_LATCH=!0,n.motorRunning&&(n.writeMode&&(xo(n,i,g),gr=a.cycleCount),e>=0&&(rt=e));break;default:{if(t<0||t>7)break;Ir[Math.floor(t/2)]=t%2;const p=Ir[(n.currentPhase+1)%4],u=Ir[(n.currentPhase+3)%4];Ir[n.currentPhase]||(n.motorRunning&&p?(Qo(n,1),n.currentPhase=(n.currentPhase+1)%4):n.motorRunning&&u&&(Qo(n,-1),n.currentPhase=(n.currentPhase+3)%4)),pr(n);break}}return A},A1=()=>{pe(6,Uint8Array.from(r1)),rr(6,a1)},qo=t=>{const e=t.split(","),n=e[0].split(/([+-])/);return{label:n[0]?n[0]:"",operation:n[1]?n[1]:"",value:n[2]?parseInt(n[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},c1=t=>{let e=l.IMPLIED,n=-1;if(t.length>0){t.startsWith("#")?(e=l.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=l.IND_Y:t.endsWith(",X)")?e=l.IND_X:e=l.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?l.ABS_X:l.ZP_X:t.endsWith(",Y")?e=t.length>5?l.ABS_Y:l.ZP_Y:e=t.length>3?l.ABS:l.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),n=parseInt(t);const i=qo(t);if(i.operation&&i.value){switch(i.operation){case"+":n+=i.value;break;case"-":n-=i.value;break;default:throw new Error("Unknown operation in operand: "+t)}n=(n%65536+65536)%65536}}return[e,n]};let Se={};const Xo=(t,e,n,i)=>{let A=l.IMPLIED,g=-1;if(n.match(/^[#]?[$0-9()]+/))return c1(n);const p=qo(n);if(p.label){const u=p.label.startsWith("<"),B=p.label.startsWith(">"),q=p.label.startsWith("#")||B||u;if(q&&(p.label=p.label.substring(1)),p.label in Se)g=Se[p.label],B?g=g>>8&255:u&&(g=g&255);else if(i===2)throw new Error("Missing label: "+p.label);if(p.operation&&p.value){switch(p.operation){case"+":g+=p.value;break;case"-":g-=p.value;break;default:throw new Error("Unknown operation in operand: "+n)}g=(g%65536+65536)%65536}Nr(e)?(A=l.ZP_REL,g=g-t+254,g>255&&(g-=256)):q?A=l.IMM:(A=g>=0&&g<=255?l.ZP_REL:l.ABS,A=p.idx==="X"?A===l.ABS?l.ABS_X:l.ZP_X:A,A=p.idx==="Y"?A===l.ABS?l.ABS_Y:l.ZP_Y:A)}return[A,g]},u1=(t,e)=>{t=t.replace(/\s+/g," ");const n=t.split(" ");return{label:n[0]?n[0]:e,instr:n[1]?n[1]:"",operand:n[2]?n[2]:""}},l1=(t,e)=>{if(t.label in Se)throw new Error("Redefined label: "+t.label);if(t.instr==="EQU"){const[n,i]=Xo(e,t.instr,t.operand,2);if(n!==l.ABS&&n!==l.ZP_REL)throw new Error("Illegal EQU value: "+t.operand);Se[t.label]=i}else Se[t.label]=e},f1=(t,e)=>{const n=[],i=Et[t];return n.push(t),e>=0&&(n.push(e%256),i.PC===3&&n.push(Math.trunc(e/256))),n},Wo=(t,e,n)=>{let i=t;const A=[];let g="";return e.forEach(p=>{if(p=p.split(";")[0].trimEnd().toUpperCase(),!p)return;(p+"                   ").slice(0,30)+F(i,4)+"";const u=u1(p,g);if(g="",!u.instr){g=u.label;return}if(u.instr==="ORG"||(n===1&&u.label&&l1(u,i),u.instr==="EQU"))return;let B=[],q,y;if(u.instr==="ASC"||u.instr==="DA"){let T=u.operand,et=0;if(T.startsWith('"')&&T.endsWith('"'))et=128;else if(T.startsWith("'")&&T.endsWith("'"))et=0;else throw new Error("Invalid string: "+T);T=T.substring(1,T.length-1);for(let $=0;$<T.length;$++)B.push(T.charCodeAt($)|et);B.push(0),i+=T.length+1}else if([q,y]=Xo(i,u.instr,u.operand,n),u.instr==="DB")B.push(y&255),i++;else if(u.instr==="DW")B.push(y&255),B.push(y>>8&255),i+=2;else if(u.instr==="DS")for(let T=0;T<y;T++)B.push(0),i++;else{if(n===2&&Nr(u.instr)&&(y<0||y>255))throw new Error(`Branch instruction out of range: ${p} value: ${y} pass: ${n}`);const T=Et.findIndex(et=>et&&et.name===u.instr&&et.mode===q);if(T<0)throw new Error(`Unknown instruction: ${u.instr} mode=${q} pass=${n}`);B=f1(T,y),i+=Et[T].PC}A.push(...B)}),A},Sr=(t,e)=>{Se={};try{return Wo(t,e,1),Wo(t,e,2)}catch(n){return console.error(n),[]}};let Ee=0;const Er=192,h1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${F(Er)}   ; jump address
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
`,p1=()=>{const t=new Uint8Array(256).fill(0),e=Sr(0,h1.split(`
`));t.set(e,0);const n=Sr(0,g1.split(`
`));return t.set(n,Er),t[254]=23,t[255]=Er,t};let Oe=new Uint8Array;const Go=(t=!0)=>{Oe.length===0&&(Oe=p1()),Oe[1]=t?32:0;const n=49152+Er+7*256;pe(7,Oe,n,S1),pe(7,Oe,n+3,I1)},I1=()=>{const t=Zo();if(!t.hardDrive)return;const e=Jo(),n=256+a.StackPtr,i=E(n+1)+256*E(n+2),A=E(i+1),g=E(i+2)+256*E(i+3),p=E(g+1),u=E(g+2)+256*E(g+3);switch(A){case 0:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),b();return}const B=E(g+4);switch(B){case 0:p===0?(d(u,1),b(!1)):(console.error(`SmartPort status for unitNumber ${p} not implemented`),b());break;default:console.error(`SmartPort statusCode ${B} not implemented`),b();break}return}case 1:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),b();return}const q=512*(E(g+4)+256*E(g+5)+65536*E(g+6)),y=e.slice(q,q+512);tn(u,y);break}case 2:default:console.error(`SmartPort command ${A} not implemented`),b();return}b(!1),t.motorRunning=!0,Ee||(Ee=setTimeout(()=>{Ee=0,t&&(t.motorRunning=!1),ut()},500)),ut()},S1=()=>{const t=Zo();if(!t.hardDrive)return;const e=Jo(),n=E(70)+256*E(71),i=512*n,A=E(68)+256*E(69),g=e.length;switch(t.status=` ${F(n,4)} ${F(A,4)}`,E(66)){case 0:{if(t.filename.length===0||g===0){po(0),Io(0),b();return}const p=g/512;po(p&255),Io(p>>>8);break}case 1:{if(i+512>g){b();return}const p=e.slice(i,i+512);tn(A,p);break}case 2:{if(i+512>g){b();return}const p=Fi(A);e.set(p,i),t.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),b();return;default:console.error("unknown hard drive command"),b();return}b(!1),t.motorRunning=!0,Ee||(Ee=setTimeout(()=>{Ee=0,t&&(t.motorRunning=!1),ut()},500)),ut()},Qe=t=>({hardDrive:t===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:t>0?Array(80):Array(),trackNbits:t>0?Array(80):Array(),trackLocation:0}),x=[Qe(0),Qe(1),Qe(2)],qt=[new Uint8Array,new Uint8Array,new Uint8Array];let Ne=1;const E1=t=>{Ne=t},Cr=()=>x[Ne],C1=()=>qt[Ne],Zo=()=>x[0],Jo=()=>qt[0],ut=()=>{for(let t=0;t<x.length;t++){const e={hardDrive:x[t].hardDrive,drive:t,filename:x[t].filename,status:x[t].status,motorRunning:x[t].motorRunning,diskHasChanges:x[t].diskHasChanges,diskData:x[t].diskHasChanges?qt[t]:new Uint8Array};Pa(e)}},B1=t=>{const e=["","",""];for(let n=t?0:1;n<3;n++)e[n]=Vt.Buffer.from(qt[n]).toString("base64");return{currentDrive:Ne,driveState:x,driveData:e}},m1=t=>{Re(Ht.MOTOR_OFF),Ne=t.currentDrive;for(let e=0;e<3;e++)x[e]=Qe(e),qt[e]=new Uint8Array;for(let e=0;e<t.driveState.length;e++)x[e]=t.driveState[e],t.driveData[e]!==""&&(qt[e]=new Uint8Array(Vt.Buffer.from(t.driveData[e],"base64")));x[0].hardDrive&&Go(x[0].filename!==""),ut()},D1=()=>{Oo(x[1]),Oo(x[2]),ut()},_o=(t=!1)=>{n1(t),ut()},w1=t=>{let e=t.drive;t.filename!==""&&(Fo(t.filename)?(e=0,x[0].hardDrive=!0):e===0&&(e=1)),x[e]=Qe(e),x[e].filename=t.filename,x[e].motorRunning=t.motorRunning,qt[e]=e1(x[e],t.diskData),qt[e].length===0&&(x[e].filename=""),x[e].hardDrive&&Go(x[e].filename!==""),ut()},Vo=`
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
`;let ln=!1,Xt=new Map;const Br=()=>{ln=!0},d1=()=>{new Map(Xt).forEach((n,i)=>{n.once&&Xt.delete(i)});const e=qi();e<0||Xt.get(e)||Xt.set(e,{disabled:!1,hidden:!0,once:!0})},R1=t=>{Xt=t},fn=(t=0,e=!0)=>{e?a.flagIRQ|=1<<t:a.flagIRQ&=~(1<<t),a.flagIRQ&=255},k1=(t=!0)=>{a.flagNMI=t===!0},y1=()=>{a.flagIRQ=0,a.flagNMI=!1},hn=[],Ho=[],T1=(t,e)=>{hn.push(t),Ho.push(e)},P1=()=>{for(let t=0;t<hn.length;t++)hn[t](Ho[t])},gn=(t=!1)=>{let e=0;const n=a.PC,i=E(a.PC),A=E(a.PC+1),g=E(a.PC+2),p=Et[i];if(Xt.size>0&&!t){const B=Xt.get(n);if(B&&!B.disabled&&!ln)return B.once&&Xt.delete(n),Dt(U.PAUSED),-1}ln=!1;const u=uo.get(n);return u&&!C.INTCXROM.isSet&&u(),e=p.execute(A,g),Eo(p.PC),nr(a.cycleCount+e),P1(),a.flagNMI&&(a.flagNMI=!1,e=Gi(),nr(a.cycleCount+e)),a.flagIRQ&&(e=Wi(),nr(a.cycleCount+e)),e},pn=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let In=1,Sn=0,En=0;const b1=(t=!0,e=1)=>{if(!t)return;In=e;const n=new Uint8Array(pn.length+256);n.set(pn.slice(1792,2048)),n.set(pn,256),pe(In,n),rr(In,U1)};let mr=new Uint8Array(0),Dr=-1;const M1=t=>{const e=new Uint8Array(mr.length+t.length);e.set(t),e.set(mr,t.length),mr=e,Dr+=t.length},L1=t=>{const e=new Uint8Array(1).fill(t);La(e)},U1=(t,e=-1)=>{if(t>=49408)return-1;const n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(e>=0)L1(e);else return Dr>=0?mr[Dr--]:0;break;case n.STATUS:if(e>=0)console.log("SSC RESET"),Sn=2,En=0;else{let i=16;return i|=Dr>=0?8:0,i}break;case n.COMMAND:if(e>=0){console.log("SSC COMMAND: 0x"+e.toString(16)),Sn=e;break}else return Sn;case n.CONTROL:if(e>=0){console.log("SSC CONTROL: 0x"+e.toString(16)),En=e;break}else return En;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},xe=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const F1=()=>{const t=new Date,e=xe(t.getMonth()+1,2)+","+xe(t.getDay(),2)+","+xe(t.getDate(),2)+","+xe(t.getHours(),2)+","+xe(t.getMinutes(),2);for(let n=0;n<e.length;n++)d(512+n,e.charCodeAt(n)|128)},O1=`
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
`,jo=()=>{gt=0,pt=0,Tt=0,Pt=0,ae=1023,Ae=1023,kr(0),H=0,Gt=0,Ce=0,Ye=0,Ke=0,nt=0,Ct=0,Be=0,wr=0};let gt=0,pt=0,Tt=0,Pt=0,ae=1023,Ae=1023,wr=0,Wt=0,H=0,Gt=0,Ce=0,Ye=0,Ke=0,nt=0,Ct=0,Be=0,$o=0,Bt=5;const dr=54,Rr=55,Q1=56,N1=57,vo=()=>{const t=new Uint8Array(256).fill(0),e=Sr(0,O1.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},x1=(t=!0,e=5)=>{if(!t)return;Bt=e;const n=49152+Bt*256,i=49152+Bt*256+8;pe(Bt,vo(),n,q1),pe(Bt,vo(),i,F1),rr(Bt,G1),jo()},kr=t=>{Wt=t,ks(!t)},Y1=()=>{if(Wt&1){let t=!1;Wt&8&&(Be|=8,t=!0),Wt&Gt&4&&(Be|=4,t=!0),Wt&Gt&2&&(Be|=2,t=!0),t&&fn(Bt,!0)}},K1=t=>{if(Wt&1)if(t.buttons>=0){switch(t.buttons){case 0:H&=-129;break;case 16:H|=128;break;case 1:H&=-17;break;case 17:H|=16;break}Gt|=H&128?4:0}else t.x>=0&&t.x<=1&&(gt=Math.round((ae-Tt)*t.x+Tt),Gt|=2),t.y>=0&&t.y<=1&&(pt=Math.round((Ae-Pt)*t.y+Pt),Gt|=2)};let qe=0,Cn="",zo=0,ts=0;const q1=()=>{const t=192+Bt;E(Rr)===t&&E(dr)===0?W1():E(N1)===t&&E(Q1)===0&&X1()},X1=()=>{if(qe===0){const t=192+Bt;zo=E(Rr),ts=E(dr),d(Rr,t),d(dr,3);const e=(H&128)!==(Ce&128);let n=0;H&128?n=e?2:1:n=e?3:4,E(49152)&128&&(n=-n),Ce=H,Cn=gt.toString()+","+pt.toString()+","+n.toString()}qe>=Cn.length?(a.Accum=141,qe=0,d(Rr,zo),d(dr,ts)):(a.Accum=Cn.charCodeAt(qe)|128,qe++)},W1=()=>{switch(a.Accum){case 128:console.log("mouse off"),kr(0);break;case 129:console.log("mouse on"),kr(1);break}},G1=(t,e)=>{if(t>=49408)return-1;const n=e<0,i={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},A={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case i.LOWX:if(n===!1)nt=nt&65280|e,nt&=65535;else return gt&255;break;case i.HIGHX:if(n===!1)nt=e<<8|nt&255,nt&=65535;else return gt>>8&255;break;case i.LOWY:if(n===!1)Ct=Ct&65280|e,Ct&=65535;else return pt&255;break;case i.HIGHY:if(n===!1)Ct=e<<8|Ct&255,Ct&=65535;else return pt>>8&255;break;case i.STATUS:return H;case i.MODE:if(n===!1)kr(e),console.log("Mouse mode: 0x",Wt.toString(16));else return Wt;break;case i.CLAMP:if(n===!1)wr=78-e;else switch(wr){case 0:return Tt>>8&255;case 1:return Pt>>8&255;case 2:return Tt&255;case 3:return Pt&255;case 4:return ae>>8&255;case 5:return Ae>>8&255;case 6:return ae&255;case 7:return Ae&255;default:return console.log("AppleMouse: invalid clamp index: "+wr),0}break;case i.CLOCK:case i.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case i.COMMAND:if(n===!1)switch($o=e,e){case A.INIT:console.log("cmd.init"),gt=0,pt=0,Ye=0,Ke=0,Tt=0,Pt=0,ae=1023,Ae=1023,H=0,Gt=0;break;case A.READ:Gt=0,H&=-112,H|=Ce>>1&64,H|=Ce>>4&1,Ce=H,(Ye!==gt||Ke!==pt)&&(H|=32),Ye=gt,Ke=pt;break;case A.CLEAR:console.log("cmd.clear"),gt=0,pt=0,Ye=0,Ke=0;break;case A.SERVE:H&=-15,H|=Be,Be=0,fn(Bt,!1);break;case A.HOME:console.log("cmd.home"),gt=Tt,pt=Pt;break;case A.CLAMPX:console.log("cmd.clampx"),Tt=nt>32767?nt-65536:nt,ae=Ct,console.log(Tt+" -> "+ae);break;case A.CLAMPY:console.log("cmd.clampy"),Pt=nt>32767?nt-65536:nt,Ae=Ct,console.log(Pt+" -> "+Ae);break;case A.GCLAMP:console.log("cmd.getclamp");break;case A.POS:console.log("cmd.pos"),gt=nt,pt=Ct;break}else return $o;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},es=(t=!0,e=4)=>{t&&(rr(e,ia),T1(ea,e))},Bn=[0,128],mn=[1,129],Z1=[2,130],J1=[3,131],me=[4,132],De=[5,133],yr=[6,134],Dn=[7,135],Xe=[8,136],We=[9,137],_1=[10,138],wn=[11,139],V1=[12,140],ce=[13,141],Ge=[14,142],rs=[16,145],ns=[17,145],mt=[18,146],dn=[32,160],bt=64,Zt=32,os=(t=4)=>{for(let e=0;e<=255;e++)P(t,e,0);for(let e=0;e<=1;e++)Rn(t,e)},H1=(t,e)=>(Q(t,Ge[e])&bt)!==0,j1=(t,e)=>(Q(t,mt[e])&bt)!==0,ss=(t,e)=>(Q(t,wn[e])&bt)!==0,$1=(t,e,n)=>{let i=Q(t,me[e])-n;if(P(t,me[e],i),i<0){i=i%256+256,P(t,me[e],i);let A=Q(t,De[e]);if(A--,P(t,De[e],A),A<0&&(A+=256,P(t,De[e],A),H1(t,e)&&(!j1(t,e)||ss(t,e)))){const g=Q(t,mt[e]);P(t,mt[e],g|bt);const p=Q(t,ce[e]);if(P(t,ce[e],p|bt),Jt(t,e,-1),ss(t,e)){const u=Q(t,Dn[e]),B=Q(t,yr[e]);P(t,me[e],B),P(t,De[e],u)}}}},v1=(t,e)=>(Q(t,Ge[e])&Zt)!==0,z1=(t,e)=>(Q(t,mt[e])&Zt)!==0,ta=(t,e,n)=>{if(Q(t,wn[e])&Zt)return;let i=Q(t,Xe[e])-n;if(P(t,Xe[e],i),i<0){i=i%256+256,P(t,Xe[e],i);let A=Q(t,We[e]);if(A--,P(t,We[e],A),A<0&&(A+=256,P(t,We[e],A),v1(t,e)&&!z1(t,e))){const g=Q(t,mt[e]);P(t,mt[e],g|Zt);const p=Q(t,ce[e]);P(t,ce[e],p|Zt),Jt(t,e,-1)}}},is=new Array(8).fill(0),ea=t=>{const e=a.cycleCount-is[t];for(let n=0;n<=1;n++)$1(t,n,e),ta(t,n,e);is[t]=a.cycleCount},ra=(t,e)=>{const n=[];for(let i=0;i<=15;i++)n[i]=Q(t,dn[e]+i);return n},na=(t,e)=>t.length===e.length&&t.every((n,i)=>n===e[i]),we={slot:-1,chip:-1,params:[-1]};let Rn=(t,e)=>{const n=ra(t,e);t===we.slot&&e===we.chip&&na(n,we.params)||(we.slot=t,we.chip=e,we.params=n,Ma({slot:t,chip:e,params:n}))};const oa=(t,e)=>{switch(Q(t,Bn[e])&7){case 0:for(let i=0;i<=15;i++)P(t,dn[e]+i,0);Rn(t,e);break;case 7:P(t,ns[e],Q(t,mn[e]));break;case 6:{const i=Q(t,ns[e]),A=Q(t,mn[e]);i>=0&&i<=15&&(P(t,dn[e]+i,A),Rn(t,e));break}}},Jt=(t,e,n)=>{let i=Q(t,ce[e]);switch(n>=0&&(i&=127-(n&127),P(t,ce[e],i)),e){case 0:fn(t,i!==0);break;case 1:k1(i!==0);break}},sa=(t,e,n)=>{let i=Q(t,Ge[e]);n>=0&&(n=n&255,n&128?i|=n:i&=255-n),i|=128,P(t,Ge[e],i)},ia=(t,e=-1)=>{if(t<49408)return-1;const n=(t&3840)>>8,i=t&255,A=i&128?1:0;switch(i){case Bn[A]:e>=0&&(P(n,Bn[A],e),oa(n,A));break;case mn[A]:case Z1[A]:case J1[A]:case _1[A]:case wn[A]:case V1[A]:P(n,i,e);break;case me[A]:e>=0&&P(n,yr[A],e),Jt(n,A,bt);break;case De[A]:if(e>=0){P(n,Dn[A],e),P(n,me[A],Q(n,yr[A])),P(n,De[A],e);const g=Q(n,mt[A]);P(n,mt[A],g&~bt),Jt(n,A,bt)}break;case yr[A]:e>=0&&(P(n,i,e),Jt(n,A,bt));break;case Dn[A]:e>=0&&P(n,i,e);break;case Xe[A]:e>=0&&P(n,rs[A],e),Jt(n,A,Zt);break;case We[A]:if(e>=0){P(n,We[A],e),P(n,Xe[A],Q(n,rs[A]));const g=Q(n,mt[A]);P(n,mt[A],g&~Zt),Jt(n,A,Zt)}break;case ce[A]:e>=0&&Jt(n,A,e);break;case Ge[A]:sa(n,A,e);break}return-1},Tr=40,aa=(t,e)=>t+2+(e>127?e-256:e),Aa=(t,e,n,i)=>{let A="",g=`${F(e.pcode)}`,p="",u="";switch(e.PC){case 1:g+="      ";break;case 2:p=F(n),g+=` ${p}   `;break;case 3:p=F(n),u=F(i),g+=` ${p} ${u}`;break}const B=Nr(e.name)?F(aa(t,n)):p;switch(e.mode){case l.IMPLIED:break;case l.IMM:A=` #$${p}`;break;case l.ZP_REL:A=` $${B}`;break;case l.ZP_X:A=` $${p},X`;break;case l.ZP_Y:A=` $${p},Y`;break;case l.ABS:A=` $${u}${p}`;break;case l.ABS_X:A=` $${u}${p},X`;break;case l.ABS_Y:A=` $${u}${p},Y`;break;case l.IND_X:A=` ($${u.trim()}${p},X)`;break;case l.IND_Y:A=` ($${p}),Y`;break;case l.IND:A=` ($${u.trim()}${p})`;break}return`${F(t,4)}: ${g}  ${e.name}${A}`},ca=t=>{let e=t;e>65535-Tr&&(e=65535-Tr);let n="";for(let i=0;i<2*Tr;i++){if(e>65535){n+=`
`;continue}const A=Le(e),g=Et[A],p=Le(e+1),u=Le(e+2);n+=Aa(e,g,p,u)+`
`,e+=g.PC}return n},ua=(t,e)=>{if(e<t||t<0)return!1;let n=t;for(let i=0;i<Tr;i++){if(n===e)return!0;const A=Le(n);if(n+=Et[A].PC,n>65535)break}return!1},la=t=>{const e=Le(t);return Et[e].name};let as=0,Pr=0,As=!0,br=0,cs=!0,ue=-1,us=16.6881,ls=0,j=U.IDLE,de=0,kn=!1,Mt=0;const fs=5,lt=[];let Mr=!1;const fa=()=>{Mr=!0,Y1()},ha=()=>{Mr=!1},ga=()=>{const t=JSON.parse(JSON.stringify(a)),e={};for(const i in C)e[i]=C[i].isSet;const n=Vt.Buffer.from(O);return{s6502:t,softSwitches:e,memory:n.toString("base64")}},pa=t=>{const e=JSON.parse(JSON.stringify(t.s6502));Qi(e);const n=t.softSwitches;for(const i in n){const A=i;try{C[A].isSet=n[i]}catch{}}O.set(Vt.Buffer.from(t.memory,"base64")),oe(),to(!0)},hs=(t=!1)=>({emulator:null,state6502:ga(),driveState:B1(t)}),yn=t=>{Tn(),pa(t.state6502),m1(t.driveState),ue=a.PC,Ur()};let gs=!1;const ps=()=>{gs||(gs=!0,b1(),x1(!0,2),es(!0,4),es(!0,5),A1())},Ia=()=>{D1(),Jr(),jo(),os(4),os(5)},Lr=()=>{if(nr(0),bi(),ps(),Vo.length>0){const t=Sr(768,Vo.split(`
`));O.set(t,768)}Tn()},Tn=()=>{y1();for(const t in C){const e=t;C[e].isSet=!1}C.TEXT.isSet=!0,E(49282),So(),Ia()},Sa=t=>{As=t,us=As?16.6881:0,Ds()},Ea=t=>{cs=t},Ca=t=>{ue=t,Ur(),t===U.PAUSED&&(ue=a.PC)},Is=()=>{const t=Mt-1;return t<0||!lt[t]?-1:t},Ss=()=>{const t=Mt+1;return t>=lt.length||!lt[t]?-1:t},Es=()=>{lt.length===fs&&lt.shift(),lt.push(hs()),Mt=lt.length},Ba=()=>{let t=Is();t<0||(Dt(U.PAUSED),setTimeout(()=>{Mt===lt.length&&(Es(),t=Math.max(Mt-2,0)),Mt=t,yn(lt[Mt])},50))},ma=()=>{const t=Ss();t<0||(Dt(U.PAUSED),setTimeout(()=>{Mt=t,yn(lt[t])},50))},Da=()=>{const t=[];for(let e=0;e<lt.length;e++)t[e]={s6502:lt[e].state6502.s6502};return t},Cs=()=>{kn=!0},Bs=()=>{Br(),j===U.IDLE&&(Lr(),j=U.PAUSED),gn(!0),Dt(U.PAUSED)},wa=()=>{Br(),j===U.IDLE&&(Lr(),j=U.PAUSED),E(a.PC)===32?(gn(!0),ms()):Bs()},ms=()=>{Br(),j===U.IDLE&&(Lr(),j=U.PAUSED),d1(),Dt(U.RUNNING)},Ds=()=>{de=0,Pr=performance.now(),as=Pr},Dt=t=>{ps(),j=t,j===U.PAUSED?(_o(),ua(ue,a.PC)||(ue=a.PC)):j===U.RUNNING&&(_o(!0),Br()),Ur(),Ds(),br===0&&(br=1,Cs(),ds())},da=(t,e,n)=>{const i=()=>{tn(t,e),n&&St(t)};j===U.IDLE?(Dt(U.NEED_BOOT),setTimeout(()=>{Dt(U.NEED_RESET),setTimeout(()=>{i()},200)},200)):i()},Ra=()=>{if(!cs)return"";const t=[Yi()];t.push(Oi());const e=Ki();for(let n=0;n<Math.min(20,e.length);n++)t.push(e[n]);return t.join(`
`)},ka=()=>j===U.RUNNING?"":ca(ue>=0?ue:a.PC),Ur=()=>{const t={state:j,s6502:a,speed:br,altChar:C.ALTCHARSET.isSet,noDelayMode:!C.COLUMN80.isSet&&!C.AN3.isSet,textPage:zr(),lores:zr(!0),hires:Ui(),debugDump:Ra(),disassembly:ka(),nextInstruction:la(a.PC),button0:C.PB0.isSet,button1:C.PB1.isSet,canGoBackward:Is()>=0,canGoForward:Ss()>=0,maxState:fs,iTempState:Mt,timeTravelThumbnails:Da()};ya(t)},ws=()=>{const t=performance.now();if(ls=t-Pr,ls<us||(Pr=t,j===U.IDLE||j===U.PAUSED))return;j===U.NEED_BOOT?(Lr(),Dt(U.RUNNING)):j===U.NEED_RESET&&(Tn(),Dt(U.RUNNING));let e=0;for(;;){const n=gn();if(n<0)break;if(e+=n,e>=12480&&Mr===!1&&fa(),e>=17030){ha();break}}de++,br=Math.round(de*1703/(performance.now()-as))/100,de%2&&(ri(),Ur()),kn&&(kn=!1,Es())},ds=()=>{ws();const t=de+1;for(;j===U.RUNNING&&de!==t;)ws();setTimeout(ds,j===U.RUNNING?0:20)},wt=(t,e)=>{self.postMessage({msg:t,payload:e})},ya=t=>{wt(ft.MACHINE_STATE,t)},Ta=t=>{wt(ft.CLICK,t)},Pa=t=>{wt(ft.DRIVE_PROPS,t)},Re=t=>{wt(ft.DRIVE_SOUND,t)},ba=t=>{wt(ft.SAVE_STATE,t)},Pn=t=>{wt(ft.RUMBLE,t)},Rs=t=>{wt(ft.HELP_TEXT,t)},ks=t=>{wt(ft.SHOW_MOUSE,t)},Ma=t=>{wt(ft.MBOARD_SOUND,t)},La=t=>{wt(ft.COMM_DATA,t)};self.onmessage=t=>{switch(t.data.msg){case Z.STATE:Dt(t.data.payload);break;case Z.DEBUG:Ea(t.data.payload);break;case Z.DISASSEMBLE_ADDR:Ca(t.data.payload);break;case Z.BREAKPOINTS:R1(t.data.payload);break;case Z.STEP_INTO:Bs();break;case Z.STEP_OVER:wa();break;case Z.STEP_OUT:ms();break;case Z.SPEED:Sa(t.data.payload);break;case Z.TIME_TRAVEL:t.data.payload==="FORWARD"?ma():Ba();break;case Z.RESTORE_STATE:yn(t.data.payload);break;case Z.KEYPRESS:Ei(t.data.payload);break;case Z.MOUSEEVENT:K1(t.data.payload);break;case Z.PASTE_TEXT:Ci(t.data.payload);break;case Z.APPLE_PRESS:_n(!0,t.data.payload);break;case Z.APPLE_RELEASE:_n(!1,t.data.payload);break;case Z.GET_SAVE_STATE:ba(hs(!0));break;case Z.DRIVE_PROPS:{const e=t.data.payload;w1(e);break}case Z.GAMEPAD:ti(t.data.payload);break;case Z.SET_BINARY_BLOCK:{const e=t.data.payload;da(e.address,e.data,e.run);break}case Z.COMM_DATA:M1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${t.data.msg}`);break}}})();
