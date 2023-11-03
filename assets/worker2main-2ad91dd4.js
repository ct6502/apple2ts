(function(){"use strict";var Ht={},He={};He.byteLength=Zs,He.toByteArray=Vs,He.fromByteArray=js;for(var Et=[],it=[],Ws=typeof Uint8Array<"u"?Uint8Array:Array,Nr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fe=0,Gs=Nr.length;fe<Gs;++fe)Et[fe]=Nr[fe],it[Nr.charCodeAt(fe)]=fe;it["-".charCodeAt(0)]=62,it["_".charCodeAt(0)]=63;function On(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=t.indexOf("=");n===-1&&(n=e);var i=n===e?0:4-n%4;return[n,i]}function Zs(t){var e=On(t),n=e[0],i=e[1];return(n+i)*3/4-i}function Js(t,e,n){return(e+n)*3/4-n}function Vs(t){var e,n=On(t),i=n[0],A=n[1],g=new Ws(Js(t,i,A)),p=0,u=A>0?i-4:i,B;for(B=0;B<u;B+=4)e=it[t.charCodeAt(B)]<<18|it[t.charCodeAt(B+1)]<<12|it[t.charCodeAt(B+2)]<<6|it[t.charCodeAt(B+3)],g[p++]=e>>16&255,g[p++]=e>>8&255,g[p++]=e&255;return A===2&&(e=it[t.charCodeAt(B)]<<2|it[t.charCodeAt(B+1)]>>4,g[p++]=e&255),A===1&&(e=it[t.charCodeAt(B)]<<10|it[t.charCodeAt(B+1)]<<4|it[t.charCodeAt(B+2)]>>2,g[p++]=e>>8&255,g[p++]=e&255),g}function _s(t){return Et[t>>18&63]+Et[t>>12&63]+Et[t>>6&63]+Et[t&63]}function Hs(t,e,n){for(var i,A=[],g=e;g<n;g+=3)i=(t[g]<<16&16711680)+(t[g+1]<<8&65280)+(t[g+2]&255),A.push(_s(i));return A.join("")}function js(t){for(var e,n=t.length,i=n%3,A=[],g=16383,p=0,u=n-i;p<u;p+=g)A.push(Hs(t,p,p+g>u?u:p+g));return i===1?(e=t[n-1],A.push(Et[e>>2]+Et[e<<4&63]+"==")):i===2&&(e=(t[n-2]<<8)+t[n-1],A.push(Et[e>>10]+Et[e>>4&63]+Et[e<<2&63]+"=")),A.join("")}var xr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */xr.read=function(t,e,n,i,A){var g,p,u=A*8-i-1,B=(1<<u)-1,X=B>>1,R=-7,T=n?A-1:0,rt=n?-1:1,v=t[e+T];for(T+=rt,g=v&(1<<-R)-1,v>>=-R,R+=u;R>0;g=g*256+t[e+T],T+=rt,R-=8);for(p=g&(1<<-R)-1,g>>=-R,R+=i;R>0;p=p*256+t[e+T],T+=rt,R-=8);if(g===0)g=1-X;else{if(g===B)return p?NaN:(v?-1:1)*(1/0);p=p+Math.pow(2,i),g=g-X}return(v?-1:1)*p*Math.pow(2,g-i)},xr.write=function(t,e,n,i,A,g){var p,u,B,X=g*8-A-1,R=(1<<X)-1,T=R>>1,rt=A===23?Math.pow(2,-24)-Math.pow(2,-77):0,v=i?0:g-1,Je=i?1:-1,Ve=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,p=R):(p=Math.floor(Math.log(e)/Math.LN2),e*(B=Math.pow(2,-p))<1&&(p--,B*=2),p+T>=1?e+=rt/B:e+=rt*Math.pow(2,1-T),e*B>=2&&(p++,B/=2),p+T>=R?(u=0,p=R):p+T>=1?(u=(e*B-1)*Math.pow(2,A),p=p+T):(u=e*Math.pow(2,T-1)*Math.pow(2,A),p=0));A>=8;t[n+v]=u&255,v+=Je,u/=256,A-=8);for(p=p<<A|u,X+=A;X>0;t[n+v]=p&255,v+=Je,p/=256,X-=8);t[n+v-Je]|=Ve*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=He,n=xr,i=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=xa,t.INSPECT_MAX_BYTES=50;const A=2147483647;t.kMaxLength=A,u.TYPED_ARRAY_SUPPORT=g(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function g(){try{const s=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(s,r),s.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function p(s){if(s>A)throw new RangeError('The value "'+s+'" is invalid for option "size"');const r=new Uint8Array(s);return Object.setPrototypeOf(r,u.prototype),r}function u(s,r,o){if(typeof s=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return T(s)}return B(s,r,o)}u.poolSize=8192;function B(s,r,o){if(typeof s=="string")return rt(s,r);if(ArrayBuffer.isView(s))return Je(s);if(s==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof s);if(kt(s,ArrayBuffer)||s&&kt(s.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(kt(s,SharedArrayBuffer)||s&&kt(s.buffer,SharedArrayBuffer)))return Ve(s,r,o);if(typeof s=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const c=s.valueOf&&s.valueOf();if(c!=null&&c!==s)return u.from(c,r,o);const h=Na(s);if(h)return h;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof s[Symbol.toPrimitive]=="function")return u.from(s[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof s)}u.from=function(s,r,o){return B(s,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function X(s){if(typeof s!="number")throw new TypeError('"size" argument must be of type number');if(s<0)throw new RangeError('The value "'+s+'" is invalid for option "size"')}function R(s,r,o){return X(s),s<=0?p(s):r!==void 0?typeof o=="string"?p(s).fill(r,o):p(s).fill(r):p(s)}u.alloc=function(s,r,o){return R(s,r,o)};function T(s){return X(s),p(s<0?0:Ln(s)|0)}u.allocUnsafe=function(s){return T(s)},u.allocUnsafeSlow=function(s){return T(s)};function rt(s,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=bs(s,r)|0;let c=p(o);const h=c.write(s,r);return h!==o&&(c=c.slice(0,h)),c}function v(s){const r=s.length<0?0:Ln(s.length)|0,o=p(r);for(let c=0;c<r;c+=1)o[c]=s[c]&255;return o}function Je(s){if(kt(s,Uint8Array)){const r=new Uint8Array(s);return Ve(r.buffer,r.byteOffset,r.byteLength)}return v(s)}function Ve(s,r,o){if(r<0||s.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(s.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let c;return r===void 0&&o===void 0?c=new Uint8Array(s):o===void 0?c=new Uint8Array(s,r):c=new Uint8Array(s,r,o),Object.setPrototypeOf(c,u.prototype),c}function Na(s){if(u.isBuffer(s)){const r=Ln(s.length)|0,o=p(r);return o.length===0||s.copy(o,0,0,r),o}if(s.length!==void 0)return typeof s.length!="number"||Fn(s.length)?p(0):v(s);if(s.type==="Buffer"&&Array.isArray(s.data))return v(s.data)}function Ln(s){if(s>=A)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+A.toString(16)+" bytes");return s|0}function xa(s){return+s!=s&&(s=0),u.alloc(+s)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(kt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),kt(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let c=r.length,h=o.length;for(let I=0,S=Math.min(c,h);I<S;++I)if(r[I]!==o[I]){c=r[I],h=o[I];break}return c<h?-1:h<c?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let c;if(o===void 0)for(o=0,c=0;c<r.length;++c)o+=r[c].length;const h=u.allocUnsafe(o);let I=0;for(c=0;c<r.length;++c){let S=r[c];if(kt(S,Uint8Array))I+S.length>h.length?(u.isBuffer(S)||(S=u.from(S)),S.copy(h,I)):Uint8Array.prototype.set.call(h,S,I);else if(u.isBuffer(S))S.copy(h,I);else throw new TypeError('"list" argument must be an Array of Buffers');I+=S.length}return h};function bs(s,r){if(u.isBuffer(s))return s.length;if(ArrayBuffer.isView(s)||kt(s,ArrayBuffer))return s.byteLength;if(typeof s!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof s);const o=s.length,c=arguments.length>2&&arguments[2]===!0;if(!c&&o===0)return 0;let h=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return Un(s).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return Xs(s).length;default:if(h)return c?-1:Un(s).length;r=(""+r).toLowerCase(),h=!0}}u.byteLength=bs;function Ya(s,r,o){let c=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(s||(s="utf8");;)switch(s){case"hex":return Ha(this,r,o);case"utf8":case"utf-8":return Us(this,r,o);case"ascii":return Va(this,r,o);case"latin1":case"binary":return _a(this,r,o);case"base64":return Za(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ja(this,r,o);default:if(c)throw new TypeError("Unknown encoding: "+s);s=(s+"").toLowerCase(),c=!0}}u.prototype._isBuffer=!0;function le(s,r,o){const c=s[r];s[r]=s[o],s[o]=c}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)le(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)le(this,o,o+3),le(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)le(this,o,o+7),le(this,o+1,o+6),le(this,o+2,o+5),le(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?Us(this,0,r):Ya.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=t.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},i&&(u.prototype[i]=u.prototype.inspect),u.prototype.compare=function(r,o,c,h,I){if(kt(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),c===void 0&&(c=r?r.length:0),h===void 0&&(h=0),I===void 0&&(I=this.length),o<0||c>r.length||h<0||I>this.length)throw new RangeError("out of range index");if(h>=I&&o>=c)return 0;if(h>=I)return-1;if(o>=c)return 1;if(o>>>=0,c>>>=0,h>>>=0,I>>>=0,this===r)return 0;let S=I-h,k=c-o;const G=Math.min(S,k),Y=this.slice(h,I),Z=r.slice(o,c);for(let N=0;N<G;++N)if(Y[N]!==Z[N]){S=Y[N],k=Z[N];break}return S<k?-1:k<S?1:0};function Ls(s,r,o,c,h){if(s.length===0)return-1;if(typeof o=="string"?(c=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Fn(o)&&(o=h?0:s.length-1),o<0&&(o=s.length+o),o>=s.length){if(h)return-1;o=s.length-1}else if(o<0)if(h)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,c)),u.isBuffer(r))return r.length===0?-1:Ms(s,r,o,c,h);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?h?Uint8Array.prototype.indexOf.call(s,r,o):Uint8Array.prototype.lastIndexOf.call(s,r,o):Ms(s,[r],o,c,h);throw new TypeError("val must be string, number or Buffer")}function Ms(s,r,o,c,h){let I=1,S=s.length,k=r.length;if(c!==void 0&&(c=String(c).toLowerCase(),c==="ucs2"||c==="ucs-2"||c==="utf16le"||c==="utf-16le")){if(s.length<2||r.length<2)return-1;I=2,S/=2,k/=2,o/=2}function G(Z,N){return I===1?Z[N]:Z.readUInt16BE(N*I)}let Y;if(h){let Z=-1;for(Y=o;Y<S;Y++)if(G(s,Y)===G(r,Z===-1?0:Y-Z)){if(Z===-1&&(Z=Y),Y-Z+1===k)return Z*I}else Z!==-1&&(Y-=Y-Z),Z=-1}else for(o+k>S&&(o=S-k),Y=o;Y>=0;Y--){let Z=!0;for(let N=0;N<k;N++)if(G(s,Y+N)!==G(r,N)){Z=!1;break}if(Z)return Y}return-1}u.prototype.includes=function(r,o,c){return this.indexOf(r,o,c)!==-1},u.prototype.indexOf=function(r,o,c){return Ls(this,r,o,c,!0)},u.prototype.lastIndexOf=function(r,o,c){return Ls(this,r,o,c,!1)};function Ka(s,r,o,c){o=Number(o)||0;const h=s.length-o;c?(c=Number(c),c>h&&(c=h)):c=h;const I=r.length;c>I/2&&(c=I/2);let S;for(S=0;S<c;++S){const k=parseInt(r.substr(S*2,2),16);if(Fn(k))return S;s[o+S]=k}return S}function qa(s,r,o,c){return Qr(Un(r,s.length-o),s,o,c)}function Xa(s,r,o,c){return Qr(tA(r),s,o,c)}function Wa(s,r,o,c){return Qr(Xs(r),s,o,c)}function Ga(s,r,o,c){return Qr(eA(r,s.length-o),s,o,c)}u.prototype.write=function(r,o,c,h){if(o===void 0)h="utf8",c=this.length,o=0;else if(c===void 0&&typeof o=="string")h=o,c=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(c)?(c=c>>>0,h===void 0&&(h="utf8")):(h=c,c=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const I=this.length-o;if((c===void 0||c>I)&&(c=I),r.length>0&&(c<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");h||(h="utf8");let S=!1;for(;;)switch(h){case"hex":return Ka(this,r,o,c);case"utf8":case"utf-8":return qa(this,r,o,c);case"ascii":case"latin1":case"binary":return Xa(this,r,o,c);case"base64":return Wa(this,r,o,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Ga(this,r,o,c);default:if(S)throw new TypeError("Unknown encoding: "+h);h=(""+h).toLowerCase(),S=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Za(s,r,o){return r===0&&o===s.length?e.fromByteArray(s):e.fromByteArray(s.slice(r,o))}function Us(s,r,o){o=Math.min(s.length,o);const c=[];let h=r;for(;h<o;){const I=s[h];let S=null,k=I>239?4:I>223?3:I>191?2:1;if(h+k<=o){let G,Y,Z,N;switch(k){case 1:I<128&&(S=I);break;case 2:G=s[h+1],(G&192)===128&&(N=(I&31)<<6|G&63,N>127&&(S=N));break;case 3:G=s[h+1],Y=s[h+2],(G&192)===128&&(Y&192)===128&&(N=(I&15)<<12|(G&63)<<6|Y&63,N>2047&&(N<55296||N>57343)&&(S=N));break;case 4:G=s[h+1],Y=s[h+2],Z=s[h+3],(G&192)===128&&(Y&192)===128&&(Z&192)===128&&(N=(I&15)<<18|(G&63)<<12|(Y&63)<<6|Z&63,N>65535&&N<1114112&&(S=N))}}S===null?(S=65533,k=1):S>65535&&(S-=65536,c.push(S>>>10&1023|55296),S=56320|S&1023),c.push(S),h+=k}return Ja(c)}const Fs=4096;function Ja(s){const r=s.length;if(r<=Fs)return String.fromCharCode.apply(String,s);let o="",c=0;for(;c<r;)o+=String.fromCharCode.apply(String,s.slice(c,c+=Fs));return o}function Va(s,r,o){let c="";o=Math.min(s.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(s[h]&127);return c}function _a(s,r,o){let c="";o=Math.min(s.length,o);for(let h=r;h<o;++h)c+=String.fromCharCode(s[h]);return c}function Ha(s,r,o){const c=s.length;(!r||r<0)&&(r=0),(!o||o<0||o>c)&&(o=c);let h="";for(let I=r;I<o;++I)h+=rA[s[I]];return h}function ja(s,r,o){const c=s.slice(r,o);let h="";for(let I=0;I<c.length-1;I+=2)h+=String.fromCharCode(c[I]+c[I+1]*256);return h}u.prototype.slice=function(r,o){const c=this.length;r=~~r,o=o===void 0?c:~~o,r<0?(r+=c,r<0&&(r=0)):r>c&&(r=c),o<0?(o+=c,o<0&&(o=0)):o>c&&(o=c),o<r&&(o=r);const h=this.subarray(r,o);return Object.setPrototypeOf(h,u.prototype),h};function z(s,r,o){if(s%1!==0||s<0)throw new RangeError("offset is not uint");if(s+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||z(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return h},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||z(r,o,this.length);let h=this[r+--o],I=1;for(;o>0&&(I*=256);)h+=this[r+--o]*I;return h},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||z(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||z(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||z(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||z(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||z(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=_t(function(r){r=r>>>0,Re(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,I=this[++r]+this[++r]*2**8+this[++r]*2**16+c*2**24;return BigInt(h)+(BigInt(I)<<BigInt(32))}),u.prototype.readBigUInt64BE=_t(function(r){r=r>>>0,Re(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],I=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c;return(BigInt(h)<<BigInt(32))+BigInt(I)}),u.prototype.readIntLE=function(r,o,c){r=r>>>0,o=o>>>0,c||z(r,o,this.length);let h=this[r],I=1,S=0;for(;++S<o&&(I*=256);)h+=this[r+S]*I;return I*=128,h>=I&&(h-=Math.pow(2,8*o)),h},u.prototype.readIntBE=function(r,o,c){r=r>>>0,o=o>>>0,c||z(r,o,this.length);let h=o,I=1,S=this[r+--h];for(;h>0&&(I*=256);)S+=this[r+--h]*I;return I*=128,S>=I&&(S-=Math.pow(2,8*o)),S},u.prototype.readInt8=function(r,o){return r=r>>>0,o||z(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||z(r,2,this.length);const c=this[r]|this[r+1]<<8;return c&32768?c|4294901760:c},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||z(r,2,this.length);const c=this[r+1]|this[r]<<8;return c&32768?c|4294901760:c},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||z(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||z(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=_t(function(r){r=r>>>0,Re(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(c<<24);return(BigInt(h)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=_t(function(r){r=r>>>0,Re(r,"offset");const o=this[r],c=this[r+7];(o===void 0||c===void 0)&&_e(r,this.length-8);const h=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(h)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+c)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||z(r,4,this.length),n.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||z(r,4,this.length),n.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||z(r,8,this.length),n.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||z(r,8,this.length),n.read(this,r,!1,52,8)};function st(s,r,o,c,h,I){if(!u.isBuffer(s))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>h||r<I)throw new RangeError('"value" argument is out of bounds');if(o+c>s.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const k=Math.pow(2,8*c)-1;st(this,r,o,c,k,0)}let I=1,S=0;for(this[o]=r&255;++S<c&&(I*=256);)this[o+S]=r/I&255;return o+c},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,c=c>>>0,!h){const k=Math.pow(2,8*c)-1;st(this,r,o,c,k,0)}let I=c-1,S=1;for(this[o+I]=r&255;--I>=0&&(S*=256);)this[o+I]=r/S&255;return o+c},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function Os(s,r,o,c,h){qs(r,c,h,s,o,7);let I=Number(r&BigInt(4294967295));s[o++]=I,I=I>>8,s[o++]=I,I=I>>8,s[o++]=I,I=I>>8,s[o++]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return s[o++]=S,S=S>>8,s[o++]=S,S=S>>8,s[o++]=S,S=S>>8,s[o++]=S,o}function Qs(s,r,o,c,h){qs(r,c,h,s,o,7);let I=Number(r&BigInt(4294967295));s[o+7]=I,I=I>>8,s[o+6]=I,I=I>>8,s[o+5]=I,I=I>>8,s[o+4]=I;let S=Number(r>>BigInt(32)&BigInt(4294967295));return s[o+3]=S,S=S>>8,s[o+2]=S,S=S>>8,s[o+1]=S,S=S>>8,s[o]=S,o+8}u.prototype.writeBigUInt64LE=_t(function(r,o=0){return Os(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=_t(function(r,o=0){return Qs(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const G=Math.pow(2,8*c-1);st(this,r,o,c,G-1,-G)}let I=0,S=1,k=0;for(this[o]=r&255;++I<c&&(S*=256);)r<0&&k===0&&this[o+I-1]!==0&&(k=1),this[o+I]=(r/S>>0)-k&255;return o+c},u.prototype.writeIntBE=function(r,o,c,h){if(r=+r,o=o>>>0,!h){const G=Math.pow(2,8*c-1);st(this,r,o,c,G-1,-G)}let I=c-1,S=1,k=0;for(this[o+I]=r&255;--I>=0&&(S*=256);)r<0&&k===0&&this[o+I+1]!==0&&(k=1),this[o+I]=(r/S>>0)-k&255;return o+c},u.prototype.writeInt8=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,c){return r=+r,o=o>>>0,c||st(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=_t(function(r,o=0){return Os(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=_t(function(r,o=0){return Qs(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Ns(s,r,o,c,h,I){if(o+c>s.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function xs(s,r,o,c,h){return r=+r,o=o>>>0,h||Ns(s,r,o,4),n.write(s,r,o,c,23,4),o+4}u.prototype.writeFloatLE=function(r,o,c){return xs(this,r,o,!0,c)},u.prototype.writeFloatBE=function(r,o,c){return xs(this,r,o,!1,c)};function Ys(s,r,o,c,h){return r=+r,o=o>>>0,h||Ns(s,r,o,8),n.write(s,r,o,c,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,c){return Ys(this,r,o,!0,c)},u.prototype.writeDoubleBE=function(r,o,c){return Ys(this,r,o,!1,c)},u.prototype.copy=function(r,o,c,h){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(c||(c=0),!h&&h!==0&&(h=this.length),o>=r.length&&(o=r.length),o||(o=0),h>0&&h<c&&(h=c),h===c||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(c<0||c>=this.length)throw new RangeError("Index out of range");if(h<0)throw new RangeError("sourceEnd out of bounds");h>this.length&&(h=this.length),r.length-o<h-c&&(h=r.length-o+c);const I=h-c;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,c,h):Uint8Array.prototype.set.call(r,this.subarray(c,h),o),I},u.prototype.fill=function(r,o,c,h){if(typeof r=="string"){if(typeof o=="string"?(h=o,o=0,c=this.length):typeof c=="string"&&(h=c,c=this.length),h!==void 0&&typeof h!="string")throw new TypeError("encoding must be a string");if(typeof h=="string"&&!u.isEncoding(h))throw new TypeError("Unknown encoding: "+h);if(r.length===1){const S=r.charCodeAt(0);(h==="utf8"&&S<128||h==="latin1")&&(r=S)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<c)throw new RangeError("Out of range index");if(c<=o)return this;o=o>>>0,c=c===void 0?this.length:c>>>0,r||(r=0);let I;if(typeof r=="number")for(I=o;I<c;++I)this[I]=r;else{const S=u.isBuffer(r)?r:u.from(r,h),k=S.length;if(k===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(I=0;I<c-o;++I)this[I+o]=S[I%k]}return this};const ye={};function Mn(s,r,o){ye[s]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${s}]`,this.stack,delete this.name}get code(){return s}set code(h){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:h,writable:!0})}toString(){return`${this.name} [${s}]: ${this.message}`}}}Mn("ERR_BUFFER_OUT_OF_BOUNDS",function(s){return s?`${s} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Mn("ERR_INVALID_ARG_TYPE",function(s,r){return`The "${s}" argument must be of type number. Received type ${typeof r}`},TypeError),Mn("ERR_OUT_OF_RANGE",function(s,r,o){let c=`The value of "${s}" is out of range.`,h=o;return Number.isInteger(o)&&Math.abs(o)>2**32?h=Ks(String(o)):typeof o=="bigint"&&(h=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(h=Ks(h)),h+="n"),c+=` It must be ${r}. Received ${h}`,c},RangeError);function Ks(s){let r="",o=s.length;const c=s[0]==="-"?1:0;for(;o>=c+4;o-=3)r=`_${s.slice(o-3,o)}${r}`;return`${s.slice(0,o)}${r}`}function $a(s,r,o){Re(r,"offset"),(s[r]===void 0||s[r+o]===void 0)&&_e(r,s.length-(o+1))}function qs(s,r,o,c,h,I){if(s>o||s<r){const S=typeof r=="bigint"?"n":"";let k;throw I>3?r===0||r===BigInt(0)?k=`>= 0${S} and < 2${S} ** ${(I+1)*8}${S}`:k=`>= -(2${S} ** ${(I+1)*8-1}${S}) and < 2 ** ${(I+1)*8-1}${S}`:k=`>= ${r}${S} and <= ${o}${S}`,new ye.ERR_OUT_OF_RANGE("value",k,s)}$a(c,h,I)}function Re(s,r){if(typeof s!="number")throw new ye.ERR_INVALID_ARG_TYPE(r,"number",s)}function _e(s,r,o){throw Math.floor(s)!==s?(Re(s,o),new ye.ERR_OUT_OF_RANGE(o||"offset","an integer",s)):r<0?new ye.ERR_BUFFER_OUT_OF_BOUNDS:new ye.ERR_OUT_OF_RANGE(o||"offset",`>= ${o?1:0} and <= ${r}`,s)}const va=/[^+/0-9A-Za-z-_]/g;function za(s){if(s=s.split("=")[0],s=s.trim().replace(va,""),s.length<2)return"";for(;s.length%4!==0;)s=s+"=";return s}function Un(s,r){r=r||1/0;let o;const c=s.length;let h=null;const I=[];for(let S=0;S<c;++S){if(o=s.charCodeAt(S),o>55295&&o<57344){if(!h){if(o>56319){(r-=3)>-1&&I.push(239,191,189);continue}else if(S+1===c){(r-=3)>-1&&I.push(239,191,189);continue}h=o;continue}if(o<56320){(r-=3)>-1&&I.push(239,191,189),h=o;continue}o=(h-55296<<10|o-56320)+65536}else h&&(r-=3)>-1&&I.push(239,191,189);if(h=null,o<128){if((r-=1)<0)break;I.push(o)}else if(o<2048){if((r-=2)<0)break;I.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;I.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;I.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return I}function tA(s){const r=[];for(let o=0;o<s.length;++o)r.push(s.charCodeAt(o)&255);return r}function eA(s,r){let o,c,h;const I=[];for(let S=0;S<s.length&&!((r-=2)<0);++S)o=s.charCodeAt(S),c=o>>8,h=o%256,I.push(h),I.push(c);return I}function Xs(s){return e.toByteArray(za(s))}function Qr(s,r,o,c){let h;for(h=0;h<c&&!(h+o>=r.length||h>=s.length);++h)r[h+o]=s[h];return h}function kt(s,r){return s instanceof r||s!=null&&s.constructor!=null&&s.constructor.name!=null&&s.constructor.name===r.name}function Fn(s){return s!==s}const rA=function(){const s="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const c=o*16;for(let h=0;h<16;++h)r[c+h]=s[o]+s[h]}return r}();function _t(s){return typeof BigInt>"u"?nA:s}function nA(){throw new Error("BigInt not supported")}})(Ht);var U=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(U||{}),ht=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t))(ht||{}),K=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL=9]="TIME_TRAVEL",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.RESTORE_STATE=11]="RESTORE_STATE",t[t.KEYPRESS=12]="KEYPRESS",t[t.MOUSEEVENT=13]="MOUSEEVENT",t[t.PASTE_TEXT=14]="PASTE_TEXT",t[t.APPLE_PRESS=15]="APPLE_PRESS",t[t.APPLE_RELEASE=16]="APPLE_RELEASE",t[t.GET_SAVE_STATE=17]="GET_SAVE_STATE",t[t.DRIVE_PROPS=18]="DRIVE_PROPS",t[t.GAMEPAD=19]="GAMEPAD",t[t.SET_BINARY_BLOCK=20]="SET_BINARY_BLOCK",t[t.COMM_DATA=21]="COMM_DATA",t))(K||{}),jt=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(jt||{}),l=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(l||{});const $s=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Yr=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",F=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),Te=t=>t.split("").map(e=>e.charCodeAt(0)),vs=t=>[t&255,t>>>8&255],Qn=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Nn=(t,e)=>{const n=t.lastIndexOf(".")+1;return t.substring(0,n)+e},Kr=new Uint32Array(256).fill(0),zs=()=>{let t;for(let e=0;e<256;e++){t=e;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;Kr[e]=t}},ti=(t,e=0)=>{Kr[255]===0&&zs();let n=-1;for(let i=e;i<t.length;i++)n=n>>>8^Kr[(n^t[i])&255];return(n^-1)>>>0};let gt;const $t=Math.trunc(.0028*1020484);let qr=$t/2,Xr=$t/2,Wr=$t/2,Gr=$t/2,xn=0,Yn=!1,Kn=!1,Zr=!1,Jr=!1,je=!1,qn=!1,Xn=!1;const Vr=()=>{Zr=!0},Wn=()=>{Jr=!0},ei=()=>{je=!0},$e=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*$t/2),Gn=t=>{qr=$e(t)},Zn=t=>{Xr=$e(t)},Jn=t=>{Wr=$e(t)},Vn=t=>{Gr=$e(t)},_r=()=>{qn=Yn||Zr,Xn=Kn||Jr,C.PB0.isSet=qn,C.PB1.isSet=Xn||je,C.PB2.isSet=je},_n=(t,e)=>{e?Yn=t:Kn=t,_r()},ri=t=>{J(49252,128),J(49253,128),J(49254,128),J(49255,128),xn=t},Hn=t=>{const e=t-xn;J(49252,e<qr?128:0),J(49253,e<Xr?128:0),J(49254,e<Wr?128:0),J(49255,e<Gr?128:0)};let vt,Hr,jn=!1;const ni=t=>{gt=t,jn=!gt.length||!gt[0].buttons.length,vt=Ei(),Hr=vt.gamepad?vt.gamepad:Ii},$n=t=>t>-.01&&t<.01,oi=t=>{let e=t[0],n=t[1];$n(e)&&(e=0),$n(n)&&(n=0);const i=Math.sqrt(e*e+n*n),A=.95*(i===0?1:Math.max(Math.abs(e),Math.abs(n))/i);return e=Math.min(Math.max(-A,e),A),n=Math.min(Math.max(-A,n),A),e=Math.trunc($t*(e+A)/(2*A)),n=Math.trunc($t*(n+A)/(2*A)),[e,n]},vn=t=>{const e=vt.joystick?vt.joystick(gt[t].axes,jn):gt[t].axes,n=oi(e);t===0?(qr=n[0],Xr=n[1],Zr=!1,Jr=!1):(Wr=n[0],Gr=n[1],je=!1);let i=!1;gt[t].buttons.forEach((A,g)=>{A&&(Hr(g,gt.length>1,t===1),i=!0)}),i||Hr(-1,gt.length>1,t===1),vt.rumble&&vt.rumble(),_r()},si=()=>{gt&&gt.length>0&&(vn(0),gt.length>1&&vn(1))},ii=t=>{switch(t){case 0:M("JL");break;case 1:M("G",200);break;case 2:W("M"),M("O");break;case 3:M("L");break;case 4:M("F");break;case 5:W("P"),M("T");break;case 6:break;case 7:break;case 8:M("Z");break;case 9:{const e=po();e.includes("'N'")?W("N"):e.includes("'S'")?W("S"):e.includes("NUMERIC KEY")?W("1"):W("N");break}case 10:break;case 11:break;case 12:M("L");break;case 13:M("M");break;case 14:M("A");break;case 15:M("D");break;case-1:return}};let zt=0,te=0,ee=!1;const ve=.5,ai={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-ve?(te=0,zt===0||zt>2?(zt=0,W("A")):zt===1&&ee?M("W"):zt===2&&ee&&M("R"),zt++,ee=!1,t):t[0]>ve?(zt=0,te===0||te>2?(te=0,W("D")):te===1&&ee?M("W"):te===2&&ee&&M("R"),te++,ee=!1,t):t[1]<-ve?(M("C"),t):t[1]>ve?(M("S"),t):(ee=!0,t),gamepad:ii,rumble:null,setup:null,helptext:`AZTEC
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
`};let jr=14,$r=14;const ci={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=E(182);jr<40&&t<jr&&bn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),jr=t,t=E(183),$r<40&&t<$r&&bn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),$r=t},setup:null,helptext:`KARATEKA
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
`},ui=t=>{switch(t){case 0:M("A");break;case 1:M("C",50);break;case 2:M("O");break;case 3:M("T");break;case 4:M("\x1B");break;case 5:M("\r");break;case 6:break;case 7:break;case 8:W("N"),M("'");break;case 9:W("Y"),M("1");break;case 10:break;case 11:break;case 12:break;case 13:M(" ");break;case 14:break;case 15:M("	");break;case-1:return}},Mt=.5,li={address:768,data:[141,74,3,132],keymap:{},gamepad:ui,joystick:(t,e)=>{if(e)return t;const n=t[0]<-Mt?"\b":t[0]>Mt?"":"",i=t[1]<-Mt?"\v":t[1]>Mt?`
`:"";let A=n+i;return A||(A=t[2]<-Mt?"L\b":t[2]>Mt?"L":"",A||(A=t[3]<-Mt?"L\v":t[3]>Mt?`L
`:"")),A&&M(A,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
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
ESC  exit conversation`},zn=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,fi=t=>{switch(t){case 1:w(109,255);break;case 12:W("A");break;case 13:W("Z");break;case 14:W("\b");break;case 15:W("");break}},ze=.75,hi=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{w(25025,173),w(25036,64)},helptext:zn},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-ze?"\b":t[0]>ze?"":t[1]<-ze?"A":t[1]>ze?"Z":"";return e&&W(e),t},gamepad:fi,rumble:null,setup:null,helptext:zn}],gi={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},pi={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Vr();break;case 1:Wn();break;case 2:M(" ");break;case 3:M("U");break;case 4:M("\r");break;case 5:M("T");break;case 9:{const e=po();e.includes("'N'")?W("N"):e.includes("'S'")?W("S"):e.includes("NUMERIC KEY")?W("1"):W("N");break}case 10:Vr();break}},rumble:()=>{E(49178)<128&&E(49181)<128&&bn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{w(5128,0),w(5130,4);let t=5210;w(t,234),w(t+1,234),w(t+2,234),t=5224,w(t,234),w(t+1,234),w(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},Pe=new Array,re=t=>{Array.isArray(t)?Pe.push(...t):Pe.push(t)};re(ai),re(Ai),re(ci),re(li),re(hi),re(gi),re(pi);const Ii=(t,e,n)=>{if(n)switch(t){case 0:ei();break;case 1:break;case 12:Vn(-1);break;case 13:Vn(1);break;case 14:Jn(-1);break;case 15:Jn(1);break}else switch(t){case 0:Vr();break;case 1:e||Wn();break;case 12:Zn(-1);break;case 13:Zn(1);break;case 14:Gn(-1);break;case 15:Gn(1);break}},Si={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},to=t=>{for(const e of Pe)if(nn(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},Ei=()=>{for(const t of Pe)if(nn(t.address,t.data))return t;return Si},eo=(t=!1)=>{for(const e of Pe)if(nn(e.address,e.data)){Ts(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&Ts(" ")},Ci=t=>{J(49152,t|128,32)};let ne="",ro=1e9;const Bi=()=>{const t=performance.now();if(ne!==""&&(zr(49152)<128||t-ro>1500)){ro=t;const e=ne.charCodeAt(0);Ci(e),ne=ne.slice(1),ne.length===0&&Ds()}};let no="";const W=t=>{t===no&&ne.length>0||(no=t,ne+=t)};let oo=0;const M=(t,e=300)=>{const n=performance.now();n-oo<e||(oo=n,W(t))},mi=t=>{t.length===1&&(t=to(t)),W(t)},Di=t=>{t.length===1&&(t=to(t)),W(t)},tr=[],d=(t,e,n=!1,i=null)=>{const A={offAddr:t,onAddr:t+1,isSetAddr:e,writeOnly:n,isSet:!1,setFunc:i};return t>=49152&&(tr[t-49152]=A,tr[t+1-49152]=A),e>=49152&&(tr[e-49152]=A),A},he=()=>Math.floor(256*Math.random()),di=t=>{t&=11,C.READBSR2.isSet=t===0,C.WRITEBSR2.isSet=t===1,C.OFFBSR2.isSet=t===2,C.RDWRBSR2.isSet=t===3,C.READBSR1.isSet=t===8,C.WRITEBSR1.isSet=t===9,C.OFFBSR1.isSet=t===10,C.RDWRBSR1.isSet=t===11,C.BSRBANK2.isSet=t<=3,C.BSRREADRAM.isSet=[0,3,8,11].includes(t)},C={STORE80:d(49152,49176,!0),RAMRD:d(49154,49171,!0),RAMWRT:d(49156,49172,!0),INTCXROM:d(49158,49173,!0),INTC8ROM:d(0,0),ALTZP:d(49160,49174,!0),SLOTC3ROM:d(49162,49175,!0),COLUMN80:d(49164,49183,!0),ALTCHARSET:d(49166,49182,!0),KBRDSTROBE:d(0,49168,!1,()=>{const t=zr(49152)&127;J(49152,t,32)}),BSRBANK2:d(0,49169),BSRREADRAM:d(0,49170),CASSOUT:d(49184,0),SPEAKER:d(49200,0,!1,(t,e)=>{J(49200,he()),Ma(e)}),GCSTROBE:d(49216,0),EMUBYTE:d(0,49231,!1,()=>{J(49231,205)}),TEXT:d(49232,49178),MIXED:d(49234,49179),PAGE2:d(49236,49180),HIRES:d(49238,49181),AN0:d(49240,0),AN1:d(49242,0),AN2:d(49244,0),AN3:d(49246,0),CASSIN1:d(0,49248,!1,()=>{J(49248,he())}),PB0:d(0,49249),PB1:d(0,49250),PB2:d(0,49251),JOYSTICK12:d(49252,0,!1,(t,e)=>{Hn(e)}),JOYSTICK34:d(49254,0,!1,(t,e)=>{Hn(e)}),CASSIN2:d(0,49256,!1,()=>{J(49256,he())}),FASTCHIP_LOCK:d(49258,0),FASTCHIP_ENABLE:d(49259,0),FASTCHIP_SPEED:d(49261,0),JOYSTICKRESET:d(49264,0,!1,(t,e)=>{ri(e),J(49264,he())}),LASER128EX:d(49268,0),READBSR2:d(49280,0),WRITEBSR2:d(49281,0),OFFBSR2:d(49282,0),RDWRBSR2:d(49283,0),READBSR1:d(49288,0),WRITEBSR1:d(49289,0),OFFBSR1:d(49290,0),RDWRBSR1:d(49291,0)};C.TEXT.isSet=!0;const wi=[49152,49153,49165,49167,49200,49236,49237,49183],so=(t,e,n)=>{if(t>1048575&&!wi.includes(t)){const A=zr(t)>128?1:0;console.log(`${n} $${F(a.PC)}: $${F(t)} [${A}] ${e?"write":""}`)}if(t>=49280&&t<=49295){t-=t&4,di(t);return}if(t===49152&&!e){Bi();return}const i=tr[t-49152];if(!i){console.error("Unknown softswitch "+F(t)),J(t,he());return}if(i.setFunc){i.setFunc(t,n);return}t===i.offAddr||t===i.onAddr?((!i.writeOnly||e)&&(i.isSet=t===i.onAddr),i.isSetAddr&&J(i.isSetAddr,i.isSet?141:13),t>=49184&&J(t,he())):t===i.isSetAddr&&J(t,i.isSet?141:13)},ki=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,io=(1024-64)/64,O=new Uint8Array(163584+io*65536).fill(0),_=new Array(257).fill(0),at=new Array(257).fill(0),ge=256,be=512,ao=576,Ao=583,yi=639,Le=256*be,er=256*ao,Ri=256*Ao,co=256*ge;let oe=0,At=0;const Ti=()=>{const t=C.RAMRD.isSet?At||ge:0,e=C.RAMWRT.isSet?At||ge:0,n=C.PAGE2.isSet?At||ge:0,i=C.STORE80.isSet?n:t,A=C.STORE80.isSet?n:e,g=C.STORE80.isSet&&C.HIRES.isSet?n:t,p=C.STORE80.isSet&&C.HIRES.isSet?n:e;for(let u=2;u<256;u++)_[u]=u+t,at[u]=u+e;for(let u=4;u<=7;u++)_[u]=u+i,at[u]=u+A;for(let u=32;u<=63;u++)_[u]=u+g,at[u]=u+p},Pi=()=>{const t=C.ALTZP.isSet?At||ge:0;if(_[0]=t,_[1]=1+t,at[0]=t,at[1]=1+t,C.BSRREADRAM.isSet){for(let e=208;e<=255;e++)_[e]=e+t;if(!C.BSRBANK2.isSet)for(let e=208;e<=223;e++)_[e]=e-16+t}else for(let e=208;e<=255;e++)_[e]=be+e-192},bi=()=>{const t=C.ALTZP.isSet?At||ge:0,e=C.WRITEBSR1.isSet||C.WRITEBSR2.isSet||C.RDWRBSR1.isSet||C.RDWRBSR2.isSet;for(let n=192;n<=255;n++)at[n]=-1;if(e){for(let n=208;n<=255;n++)at[n]=n+t;if(!C.BSRBANK2.isSet)for(let n=208;n<=223;n++)at[n]=n-16+t}},uo=t=>C.INTCXROM.isSet?!1:t!==3?!0:C.SLOTC3ROM.isSet,Li=()=>!(C.INTCXROM.isSet||C.INTC8ROM.isSet||oe<=0),vr=t=>{if(t<8){if(C.INTCXROM.isSet)return;t===3&&!C.SLOTC3ROM.isSet&&(C.INTC8ROM.isSet||(C.INTC8ROM.isSet=!0,oe=-1,se())),oe===0&&(oe=t,se())}else C.INTC8ROM.isSet=!1,oe=0,se()},Mi=()=>{_[192]=be-192;for(let t=1;t<=7;t++){const e=192+t;_[e]=t+(uo(t)?ao-1:be)}if(Li()){const t=Ao+8*(oe-1);for(let e=0;e<=7;e++){const n=200+e;_[n]=t+e}}else for(let t=200;t<=207;t++)_[t]=be+t-192},se=()=>{Ti(),Pi(),bi(),Mi();for(let t=0;t<256;t++)_[t]=256*_[t],at[t]=256*at[t]},lo=new Map,fo=new Array(8),rr=(t,e=-1)=>{const n=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(vr(n),!uo(n)))return;const i=fo[n];if(i!==void 0){const A=i(t,e);if(A>=0){const g=t>=49408?er-256:Le;O[t-49152+g]=A}}},nr=(t,e)=>{fo[t]=e},pe=(t,e,n=0,i=()=>{})=>{if(O.set(e.slice(0,256),er+(t-1)*256),e.length>256){const A=e.length>2304?2304:e.length,g=Ri+(t-1)*2048;O.set(e.slice(256,A),g)}n&&lo.set(n,i)},Ui=()=>{O.fill(255,0,131071);const t=ki.replace(/\n/g,""),e=new Uint8Array(Ht.Buffer.from(t,"base64"));O.set(e,Le),oe=0,At=0,se()},Fi=t=>t===49177?Ur?13:141:(t>=49296?rr(t):so(t,!1,a.cycleCount),t>=49232&&se(),O[Le+t-49152]),Q=(t,e)=>{const n=er+(t-1)*256+(e&255);return O[n]},P=(t,e,n)=>{if(n>=0){const i=er+(t-1)*256+(e&255);O[i]=n&255}},E=t=>{const e=t>>>8;if(e===192)return Fi(t);e>=193&&e<=199?rr(t):t===53247&&vr(255);const n=_[e];return O[n+(t&255)]},Me=t=>{const e=t>>>8,n=_[e];return O[n+(t&255)]},Oi=(t,e)=>{if(t===49265||t===49267){if(e>io)return;At=e?(e-1)*256+yi:0}else t>=49296?rr(t,e):so(t,!0,a.cycleCount);(t<=49167||t>=49232)&&se()},w=(t,e)=>{const n=t>>>8;if(n===192)Oi(t,e);else{n>=193&&n<=199?rr(t,e):t===53247&&vr(255);const i=at[n];if(i<0)return;O[i+(t&255)]=e}},zr=t=>O[Le+t-49152],J=(t,e,n=1)=>{const i=Le+t-49152;O.fill(e,i,i+n)},ho=1024,go=2048,tn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],en=(t=!1)=>{let e=0,n=24,i=!1;if(t){if(C.TEXT.isSet||C.HIRES.isSet)return new Uint8Array;n=C.MIXED.isSet?20:24,i=C.COLUMN80.isSet&&!C.AN3.isSet}else{if(!C.TEXT.isSet&&!C.MIXED.isSet)return new Uint8Array;!C.TEXT.isSet&&C.MIXED.isSet&&(e=20),i=C.COLUMN80.isSet}if(i){const A=C.PAGE2.isSet&&!C.STORE80.isSet?go:ho,g=new Uint8Array(80*(n-e)).fill(160);for(let p=e;p<n;p++){const u=80*(p-e);for(let B=0;B<40;B++)g[u+2*B+1]=O[A+tn[p]+B],g[u+2*B]=O[co+A+tn[p]+B]}return g}else{const A=C.PAGE2.isSet?go:ho,g=new Uint8Array(40*(n-e));for(let p=e;p<n;p++){const u=40*(p-e),B=A+tn[p];g.set(O.slice(B,B+40),u)}return g}},po=()=>Ht.Buffer.from(en().map(t=>t&=127)).toString(),Qi=()=>{if(C.TEXT.isSet||!C.HIRES.isSet)return new Uint8Array;const t=C.COLUMN80.isSet&&!C.AN3.isSet,e=C.MIXED.isSet?160:192;if(t){const n=C.PAGE2.isSet&&!C.STORE80.isSet?16384:8192,i=new Uint8Array(80*e);for(let A=0;A<e;A++){const g=n+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);for(let p=0;p<40;p++)i[A*80+2*p+1]=O[g+p],i[A*80+2*p]=O[co+g+p]}return i}else{const n=C.PAGE2.isSet?16384:8192,i=new Uint8Array(40*e);for(let A=0;A<e;A++){const g=n+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);i.set(O.slice(g,g+40),A*40)}return i}},Ni=t=>{const e=_[t>>>8];return O.slice(e,e+512)},rn=(t,e)=>{const n=at[t>>>8]+(t&255);O.set(e,n),eo()},nn=(t,e)=>{for(let n=0;n<e.length;n++)if(E(t+n)!==e[n])return!1;return!0},xi=()=>{const t=[""],e=_[0],n=O.slice(e,e+256);t[0]="     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F";for(let i=0;i<16;i++){let A=F(16*i)+":";for(let g=0;g<16;g++)A+=" "+F(n[i*16+g]);t[i+1]=A}return t.join(`
`)},a=$s(),Io=t=>{a.XReg=t},So=t=>{a.YReg=t},or=t=>{a.cycleCount=t},Eo=t=>{Co(),Object.assign(a,t)},Co=()=>{a.Accum=0,a.XReg=0,a.YReg=0,a.PStatus=36,a.StackPtr=255,Ct(E(65533)*256+E(65532)),a.flagIRQ=0,a.flagNMI=!1},Bo=t=>{Ct((a.PC+t+65536)%65536)},Ct=t=>{a.PC=t},mo=t=>{a.PStatus=t|48},Yi=t=>(t&128?"N":"n")+(t&64?"V":"v")+"-"+(t&16?"B":"b")+(t&8?"D":"d")+(t&4?"I":"i")+(t&2?"Z":"z")+(t&1?"C":"c"),Ki=()=>`A=${F(a.Accum)} X=${F(a.XReg)} Y=${F(a.YReg)} P=${F(a.PStatus)} ${Yi(a.PStatus)} S=${F(a.StackPtr)}`,qi=()=>`PC= ${F(a.PC)}  ${Ki()}`,ie=new Array(256).fill(""),Xi=()=>{const t=O.slice(256,512),e=new Array;for(let n=255;n>a.StackPtr;n--){let i="$"+F(t[n]),A=ie[n];ie[n].length>3&&n-1>a.StackPtr&&(ie[n-1]==="JSR"||ie[n-1]==="BRK"?(n--,i+=F(t[n])):A=""),i=(i+"   ").substring(0,6),e.push(F(256+n,4)+": "+i+A)}return e},Wi=()=>{const t=O.slice(256,512);for(let e=a.StackPtr-2;e<=255;e++){const n=t[e];if(ie[e].startsWith("JSR")&&e-1>a.StackPtr&&ie[e-1]==="JSR"){const i=t[e-1]+1;return(n<<8)+i}}return-1},yt=(t,e)=>{ie[a.StackPtr]=t,w(256+a.StackPtr,e),a.StackPtr=(a.StackPtr+255)%256},Rt=()=>{a.StackPtr=(a.StackPtr+1)%256;const t=E(256+a.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},ct=()=>(a.PStatus&1)!==0,b=(t=!0)=>a.PStatus=t?a.PStatus|1:a.PStatus&254,Do=()=>(a.PStatus&2)!==0,sr=(t=!0)=>a.PStatus=t?a.PStatus|2:a.PStatus&253,Gi=()=>(a.PStatus&4)!==0,on=(t=!0)=>a.PStatus=t?a.PStatus|4:a.PStatus&251,wo=()=>(a.PStatus&8)!==0,V=()=>wo()?1:0,sn=(t=!0)=>a.PStatus=t?a.PStatus|8:a.PStatus&247,an=(t=!0)=>a.PStatus=t?a.PStatus|16:a.PStatus&239,ko=()=>(a.PStatus&64)!==0,Ue=(t=!0)=>a.PStatus=t?a.PStatus|64:a.PStatus&191,yo=()=>(a.PStatus&128)!==0,Ro=(t=!0)=>a.PStatus=t?a.PStatus|128:a.PStatus&127,D=t=>{sr(t===0),Ro(t>=128)},Tt=(t,e)=>{if(t){const n=a.PC;return Bo(e>127?e-256:e),3+q(n,a.PC)}return 2},y=(t,e)=>(t+e+256)%256,m=(t,e)=>e*256+t,L=(t,e,n)=>(e*256+t+n+65536)%65536,q=(t,e)=>t>>8!==e>>8?1:0,Bt=new Array(256),f=(t,e,n,i,A)=>{console.assert(!Bt[n],"Duplicate instruction: "+t+" mode="+e),Bt[n]={name:t,pcode:n,mode:e,PC:i,execute:A}},Ut=(t,e,n)=>{const i=E(t),A=E((t+1)%256),g=L(i,A,a.YReg);e(g);let p=5+q(g,m(i,A));return n&&(p+=V()),p},Ft=(t,e,n)=>{const i=E(t),A=E((t+1)%256),g=m(i,A);e(g);let p=5;return n&&(p+=V()),p},To=t=>{let e=(a.Accum&15)+(t&15)+(ct()?1:0);e>=10&&(e+=6);let n=(a.Accum&240)+(t&240)+e;const i=a.Accum<=127&&t<=127,A=a.Accum>=128&&t>=128;Ue((n&255)>=128?i:A),b(n>=160),ct()&&(n+=96),a.Accum=n&255,D(a.Accum)},ir=t=>{let e=a.Accum+t+(ct()?1:0);b(e>=256),e=e%256;const n=a.Accum<=127&&t<=127,i=a.Accum>=128&&t>=128;Ue(e>=128?n:i),a.Accum=e,D(a.Accum)},Ot=t=>{wo()?To(E(t)):ir(E(t))};f("ADC",l.IMM,105,2,t=>(V()?To(t):ir(t),2+V())),f("ADC",l.ZP_REL,101,2,t=>(Ot(t),3+V())),f("ADC",l.ZP_X,117,2,t=>(Ot(y(t,a.XReg)),4+V())),f("ADC",l.ABS,109,3,(t,e)=>(Ot(m(t,e)),4+V())),f("ADC",l.ABS_X,125,3,(t,e)=>{const n=L(t,e,a.XReg);return Ot(n),4+V()+q(n,m(t,e))}),f("ADC",l.ABS_Y,121,3,(t,e)=>{const n=L(t,e,a.YReg);return Ot(n),4+V()+q(n,m(t,e))}),f("ADC",l.IND_X,97,2,t=>{const e=y(t,a.XReg);return Ot(m(E(e),E(e+1))),6+V()}),f("ADC",l.IND_Y,113,2,t=>Ut(t,Ot,!0)),f("ADC",l.IND,114,2,t=>Ft(t,Ot,!0));const Qt=t=>{a.Accum&=E(t),D(a.Accum)};f("AND",l.IMM,41,2,t=>(a.Accum&=t,D(a.Accum),2)),f("AND",l.ZP_REL,37,2,t=>(Qt(t),3)),f("AND",l.ZP_X,53,2,t=>(Qt(y(t,a.XReg)),4)),f("AND",l.ABS,45,3,(t,e)=>(Qt(m(t,e)),4)),f("AND",l.ABS_X,61,3,(t,e)=>{const n=L(t,e,a.XReg);return Qt(n),4+q(n,m(t,e))}),f("AND",l.ABS_Y,57,3,(t,e)=>{const n=L(t,e,a.YReg);return Qt(n),4+q(n,m(t,e))}),f("AND",l.IND_X,33,2,t=>{const e=y(t,a.XReg);return Qt(m(E(e),E(e+1))),6}),f("AND",l.IND_Y,49,2,t=>Ut(t,Qt,!1)),f("AND",l.IND,50,2,t=>Ft(t,Qt,!1));const ar=t=>{let e=E(t);E(t),b((e&128)===128),e=(e<<1)%256,w(t,e),D(e)};f("ASL",l.IMPLIED,10,1,()=>(b((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256,D(a.Accum),2)),f("ASL",l.ZP_REL,6,2,t=>(ar(t),5)),f("ASL",l.ZP_X,22,2,t=>(ar(y(t,a.XReg)),6)),f("ASL",l.ABS,14,3,(t,e)=>(ar(m(t,e)),6)),f("ASL",l.ABS_X,30,3,(t,e)=>{const n=L(t,e,a.XReg);return ar(n),6+q(n,m(t,e))}),f("BCC",l.ZP_REL,144,2,t=>Tt(!ct(),t)),f("BCS",l.ZP_REL,176,2,t=>Tt(ct(),t)),f("BEQ",l.ZP_REL,240,2,t=>Tt(Do(),t)),f("BMI",l.ZP_REL,48,2,t=>Tt(yo(),t)),f("BNE",l.ZP_REL,208,2,t=>Tt(!Do(),t)),f("BPL",l.ZP_REL,16,2,t=>Tt(!yo(),t)),f("BVC",l.ZP_REL,80,2,t=>Tt(!ko(),t)),f("BVS",l.ZP_REL,112,2,t=>Tt(ko(),t)),f("BRA",l.ZP_REL,128,2,t=>Tt(!0,t));const Fe=t=>{sr((a.Accum&t)===0),Ro((t&128)!==0),Ue((t&64)!==0)};f("BIT",l.ZP_REL,36,2,t=>(Fe(E(t)),3)),f("BIT",l.ABS,44,3,(t,e)=>(Fe(E(m(t,e))),4)),f("BIT",l.IMM,137,2,t=>(Fe(t),2)),f("BIT",l.ZP_X,52,2,t=>(Fe(E(y(t,a.XReg))),4)),f("BIT",l.ABS_X,60,3,(t,e)=>{const n=L(t,e,a.XReg);return Fe(E(n)),4+q(n,m(t,e))});const An=(t,e,n=0)=>{const i=(a.PC+n)%65536,A=E(e),g=E(e+1);yt(`${t} $`+F(g)+F(A),Math.trunc(i/256)),yt(t,i%256),yt("P",a.PStatus),sn(!1),on();const p=L(A,g,t==="BRK"?-1:0);Ct(p)},Po=()=>(an(),An("BRK",65534,2),7);f("BRK",l.IMPLIED,0,1,Po);const Zi=()=>Gi()?0:(an(!1),An("IRQ",65534),7),Ji=()=>(An("NMI",65530),7);f("CLC",l.IMPLIED,24,1,()=>(b(!1),2)),f("CLD",l.IMPLIED,216,1,()=>(sn(!1),2)),f("CLI",l.IMPLIED,88,1,()=>(on(!1),2)),f("CLV",l.IMPLIED,184,1,()=>(Ue(!1),2));const ae=t=>{const e=E(t);b(a.Accum>=e),D((a.Accum-e+256)%256)},Vi=t=>{const e=E(t);b(a.Accum>=e),D((a.Accum-e+256)%256)};f("CMP",l.IMM,201,2,t=>(b(a.Accum>=t),D((a.Accum-t+256)%256),2)),f("CMP",l.ZP_REL,197,2,t=>(ae(t),3)),f("CMP",l.ZP_X,213,2,t=>(ae(y(t,a.XReg)),4)),f("CMP",l.ABS,205,3,(t,e)=>(ae(m(t,e)),4)),f("CMP",l.ABS_X,221,3,(t,e)=>{const n=L(t,e,a.XReg);return Vi(n),4+q(n,m(t,e))}),f("CMP",l.ABS_Y,217,3,(t,e)=>{const n=L(t,e,a.YReg);return ae(n),4+q(n,m(t,e))}),f("CMP",l.IND_X,193,2,t=>{const e=y(t,a.XReg);return ae(m(E(e),E(e+1))),6}),f("CMP",l.IND_Y,209,2,t=>Ut(t,ae,!1)),f("CMP",l.IND,210,2,t=>Ft(t,ae,!1));const bo=t=>{const e=E(t);b(a.XReg>=e),D((a.XReg-e+256)%256)};f("CPX",l.IMM,224,2,t=>(b(a.XReg>=t),D((a.XReg-t+256)%256),2)),f("CPX",l.ZP_REL,228,2,t=>(bo(t),3)),f("CPX",l.ABS,236,3,(t,e)=>(bo(m(t,e)),4));const Lo=t=>{const e=E(t);b(a.YReg>=e),D((a.YReg-e+256)%256)};f("CPY",l.IMM,192,2,t=>(b(a.YReg>=t),D((a.YReg-t+256)%256),2)),f("CPY",l.ZP_REL,196,2,t=>(Lo(t),3)),f("CPY",l.ABS,204,3,(t,e)=>(Lo(m(t,e)),4));const Ar=t=>{const e=y(E(t),-1);w(t,e),D(e)};f("DEC",l.IMPLIED,58,1,()=>(a.Accum=y(a.Accum,-1),D(a.Accum),2)),f("DEC",l.ZP_REL,198,2,t=>(Ar(t),5)),f("DEC",l.ZP_X,214,2,t=>(Ar(y(t,a.XReg)),6)),f("DEC",l.ABS,206,3,(t,e)=>(Ar(m(t,e)),6)),f("DEC",l.ABS_X,222,3,(t,e)=>{const n=L(t,e,a.XReg);return E(n),Ar(n),7}),f("DEX",l.IMPLIED,202,1,()=>(a.XReg=y(a.XReg,-1),D(a.XReg),2)),f("DEY",l.IMPLIED,136,1,()=>(a.YReg=y(a.YReg,-1),D(a.YReg),2));const Nt=t=>{a.Accum^=E(t),D(a.Accum)};f("EOR",l.IMM,73,2,t=>(a.Accum^=t,D(a.Accum),2)),f("EOR",l.ZP_REL,69,2,t=>(Nt(t),3)),f("EOR",l.ZP_X,85,2,t=>(Nt(y(t,a.XReg)),4)),f("EOR",l.ABS,77,3,(t,e)=>(Nt(m(t,e)),4)),f("EOR",l.ABS_X,93,3,(t,e)=>{const n=L(t,e,a.XReg);return Nt(n),4+q(n,m(t,e))}),f("EOR",l.ABS_Y,89,3,(t,e)=>{const n=L(t,e,a.YReg);return Nt(n),4+q(n,m(t,e))}),f("EOR",l.IND_X,65,2,t=>{const e=y(t,a.XReg);return Nt(m(E(e),E(e+1))),6}),f("EOR",l.IND_Y,81,2,t=>Ut(t,Nt,!1)),f("EOR",l.IND,82,2,t=>Ft(t,Nt,!1));const cr=t=>{const e=y(E(t),1);w(t,e),D(e)};f("INC",l.IMPLIED,26,1,()=>(a.Accum=y(a.Accum,1),D(a.Accum),2)),f("INC",l.ZP_REL,230,2,t=>(cr(t),5)),f("INC",l.ZP_X,246,2,t=>(cr(y(t,a.XReg)),6)),f("INC",l.ABS,238,3,(t,e)=>(cr(m(t,e)),6)),f("INC",l.ABS_X,254,3,(t,e)=>{const n=L(t,e,a.XReg);return E(n),cr(n),7}),f("INX",l.IMPLIED,232,1,()=>(a.XReg=y(a.XReg,1),D(a.XReg),2)),f("INY",l.IMPLIED,200,1,()=>(a.YReg=y(a.YReg,1),D(a.YReg),2)),f("JMP",l.ABS,76,3,(t,e)=>(Ct(L(t,e,-3)),3)),f("JMP",l.IND,108,3,(t,e)=>{const n=m(t,e);return t=E(n),e=E((n+1)%65536),Ct(L(t,e,-3)),6}),f("JMP",l.IND_X,124,3,(t,e)=>{const n=L(t,e,a.XReg);return t=E(n),e=E((n+1)%65536),Ct(L(t,e,-3)),6}),f("JSR",l.ABS,32,3,(t,e)=>{const n=(a.PC+2)%65536;return yt("JSR $"+F(e)+F(t),Math.trunc(n/256)),yt("JSR",n%256),Ct(L(t,e,-3)),6});const xt=t=>{a.Accum=E(t),D(a.Accum)};f("LDA",l.IMM,169,2,t=>(a.Accum=t,D(a.Accum),2)),f("LDA",l.ZP_REL,165,2,t=>(xt(t),3)),f("LDA",l.ZP_X,181,2,t=>(xt(y(t,a.XReg)),4)),f("LDA",l.ABS,173,3,(t,e)=>(xt(m(t,e)),4)),f("LDA",l.ABS_X,189,3,(t,e)=>{const n=L(t,e,a.XReg);return xt(n),4+q(n,m(t,e))}),f("LDA",l.ABS_Y,185,3,(t,e)=>{const n=L(t,e,a.YReg);return xt(n),4+q(n,m(t,e))}),f("LDA",l.IND_X,161,2,t=>{const e=y(t,a.XReg);return xt(m(E(e),E((e+1)%256))),6}),f("LDA",l.IND_Y,177,2,t=>Ut(t,xt,!1)),f("LDA",l.IND,178,2,t=>Ft(t,xt,!1));const ur=t=>{a.XReg=E(t),D(a.XReg)};f("LDX",l.IMM,162,2,t=>(a.XReg=t,D(a.XReg),2)),f("LDX",l.ZP_REL,166,2,t=>(ur(t),3)),f("LDX",l.ZP_Y,182,2,t=>(ur(y(t,a.YReg)),4)),f("LDX",l.ABS,174,3,(t,e)=>(ur(m(t,e)),4)),f("LDX",l.ABS_Y,190,3,(t,e)=>{const n=L(t,e,a.YReg);return ur(n),4+q(n,m(t,e))});const lr=t=>{a.YReg=E(t),D(a.YReg)};f("LDY",l.IMM,160,2,t=>(a.YReg=t,D(a.YReg),2)),f("LDY",l.ZP_REL,164,2,t=>(lr(t),3)),f("LDY",l.ZP_X,180,2,t=>(lr(y(t,a.XReg)),4)),f("LDY",l.ABS,172,3,(t,e)=>(lr(m(t,e)),4)),f("LDY",l.ABS_X,188,3,(t,e)=>{const n=L(t,e,a.XReg);return lr(n),4+q(n,m(t,e))});const fr=t=>{let e=E(t);E(t),b((e&1)===1),e>>=1,w(t,e),D(e)};f("LSR",l.IMPLIED,74,1,()=>(b((a.Accum&1)===1),a.Accum>>=1,D(a.Accum),2)),f("LSR",l.ZP_REL,70,2,t=>(fr(t),5)),f("LSR",l.ZP_X,86,2,t=>(fr(y(t,a.XReg)),6)),f("LSR",l.ABS,78,3,(t,e)=>(fr(m(t,e)),6)),f("LSR",l.ABS_X,94,3,(t,e)=>{const n=L(t,e,a.XReg);return fr(n),6+q(n,m(t,e))}),f("NOP",l.IMPLIED,234,1,()=>2);const Yt=t=>{a.Accum|=E(t),D(a.Accum)};f("ORA",l.IMM,9,2,t=>(a.Accum|=t,D(a.Accum),2)),f("ORA",l.ZP_REL,5,2,t=>(Yt(t),3)),f("ORA",l.ZP_X,21,2,t=>(Yt(y(t,a.XReg)),4)),f("ORA",l.ABS,13,3,(t,e)=>(Yt(m(t,e)),4)),f("ORA",l.ABS_X,29,3,(t,e)=>{const n=L(t,e,a.XReg);return Yt(n),4+q(n,m(t,e))}),f("ORA",l.ABS_Y,25,3,(t,e)=>{const n=L(t,e,a.YReg);return Yt(n),4+q(n,m(t,e))}),f("ORA",l.IND_X,1,2,t=>{const e=y(t,a.XReg);return Yt(m(E(e),E(e+1))),6}),f("ORA",l.IND_Y,17,2,t=>Ut(t,Yt,!1)),f("ORA",l.IND,18,2,t=>Ft(t,Yt,!1)),f("PHA",l.IMPLIED,72,1,()=>(yt("PHA",a.Accum),3)),f("PHP",l.IMPLIED,8,1,()=>(yt("PHP",a.PStatus|16),3)),f("PHX",l.IMPLIED,218,1,()=>(yt("PHX",a.XReg),3)),f("PHY",l.IMPLIED,90,1,()=>(yt("PHY",a.YReg),3)),f("PLA",l.IMPLIED,104,1,()=>(a.Accum=Rt(),D(a.Accum),4)),f("PLP",l.IMPLIED,40,1,()=>(mo(Rt()),4)),f("PLX",l.IMPLIED,250,1,()=>(a.XReg=Rt(),D(a.XReg),4)),f("PLY",l.IMPLIED,122,1,()=>(a.YReg=Rt(),D(a.YReg),4));const hr=t=>{let e=E(t);E(t);const n=ct()?1:0;b((e&128)===128),e=(e<<1)%256|n,w(t,e),D(e)};f("ROL",l.IMPLIED,42,1,()=>{const t=ct()?1:0;return b((a.Accum&128)===128),a.Accum=(a.Accum<<1)%256|t,D(a.Accum),2}),f("ROL",l.ZP_REL,38,2,t=>(hr(t),5)),f("ROL",l.ZP_X,54,2,t=>(hr(y(t,a.XReg)),6)),f("ROL",l.ABS,46,3,(t,e)=>(hr(m(t,e)),6)),f("ROL",l.ABS_X,62,3,(t,e)=>{const n=L(t,e,a.XReg);return hr(n),6+q(n,m(t,e))});const gr=t=>{let e=E(t);E(t);const n=ct()?128:0;b((e&1)===1),e=e>>1|n,w(t,e),D(e)};f("ROR",l.IMPLIED,106,1,()=>{const t=ct()?128:0;return b((a.Accum&1)===1),a.Accum=a.Accum>>1|t,D(a.Accum),2}),f("ROR",l.ZP_REL,102,2,t=>(gr(t),5)),f("ROR",l.ZP_X,118,2,t=>(gr(y(t,a.XReg)),6)),f("ROR",l.ABS,110,3,(t,e)=>(gr(m(t,e)),6)),f("ROR",l.ABS_X,126,3,(t,e)=>{const n=L(t,e,a.XReg);return gr(n),6+q(n,m(t,e))}),f("RTI",l.IMPLIED,64,1,()=>(mo(Rt()),an(!1),Ct(m(Rt(),Rt())-1),6)),f("RTS",l.IMPLIED,96,1,()=>(Ct(m(Rt(),Rt())),6));const Mo=t=>{const e=255-t;let n=a.Accum+e+(ct()?1:0);const i=n>=256,A=a.Accum<=127&&e<=127,g=a.Accum>=128&&e>=128;Ue(n%256>=128?A:g);const p=(a.Accum&15)-(t&15)+(ct()?0:-1);n=a.Accum-t+(ct()?0:-1),n<0&&(n-=96),p<0&&(n-=6),a.Accum=n&255,D(a.Accum),b(i)},Kt=t=>{V()?Mo(E(t)):ir(255-E(t))};f("SBC",l.IMM,233,2,t=>(V()?Mo(t):ir(255-t),2+V())),f("SBC",l.ZP_REL,229,2,t=>(Kt(t),3+V())),f("SBC",l.ZP_X,245,2,t=>(Kt(y(t,a.XReg)),4+V())),f("SBC",l.ABS,237,3,(t,e)=>(Kt(m(t,e)),4+V())),f("SBC",l.ABS_X,253,3,(t,e)=>{const n=L(t,e,a.XReg);return Kt(n),4+V()+q(n,m(t,e))}),f("SBC",l.ABS_Y,249,3,(t,e)=>{const n=L(t,e,a.YReg);return Kt(n),4+V()+q(n,m(t,e))}),f("SBC",l.IND_X,225,2,t=>{const e=y(t,a.XReg);return Kt(m(E(e),E(e+1))),6+V()}),f("SBC",l.IND_Y,241,2,t=>Ut(t,Kt,!0)),f("SBC",l.IND,242,2,t=>Ft(t,Kt,!0)),f("SEC",l.IMPLIED,56,1,()=>(b(),2)),f("SED",l.IMPLIED,248,1,()=>(sn(),2)),f("SEI",l.IMPLIED,120,1,()=>(on(),2)),f("STA",l.ZP_REL,133,2,t=>(w(t,a.Accum),3)),f("STA",l.ZP_X,149,2,t=>(w(y(t,a.XReg),a.Accum),4)),f("STA",l.ABS,141,3,(t,e)=>(w(m(t,e),a.Accum),4)),f("STA",l.ABS_X,157,3,(t,e)=>{const n=L(t,e,a.XReg);return E(n),w(n,a.Accum),5}),f("STA",l.ABS_Y,153,3,(t,e)=>(w(L(t,e,a.YReg),a.Accum),5)),f("STA",l.IND_X,129,2,t=>{const e=y(t,a.XReg);return w(m(E(e),E(e+1)),a.Accum),6});const Uo=t=>{w(t,a.Accum)};f("STA",l.IND_Y,145,2,t=>(Ut(t,Uo,!1),6)),f("STA",l.IND,146,2,t=>Ft(t,Uo,!1)),f("STX",l.ZP_REL,134,2,t=>(w(t,a.XReg),3)),f("STX",l.ZP_Y,150,2,t=>(w(y(t,a.YReg),a.XReg),4)),f("STX",l.ABS,142,3,(t,e)=>(w(m(t,e),a.XReg),4)),f("STY",l.ZP_REL,132,2,t=>(w(t,a.YReg),3)),f("STY",l.ZP_X,148,2,t=>(w(y(t,a.XReg),a.YReg),4)),f("STY",l.ABS,140,3,(t,e)=>(w(m(t,e),a.YReg),4)),f("STZ",l.ZP_REL,100,2,t=>(w(t,0),3)),f("STZ",l.ZP_X,116,2,t=>(w(y(t,a.XReg),0),4)),f("STZ",l.ABS,156,3,(t,e)=>(w(m(t,e),0),4)),f("STZ",l.ABS_X,158,3,(t,e)=>{const n=L(t,e,a.XReg);return E(n),w(n,0),5}),f("TAX",l.IMPLIED,170,1,()=>(a.XReg=a.Accum,D(a.XReg),2)),f("TAY",l.IMPLIED,168,1,()=>(a.YReg=a.Accum,D(a.YReg),2)),f("TSX",l.IMPLIED,186,1,()=>(a.XReg=a.StackPtr,D(a.XReg),2)),f("TXA",l.IMPLIED,138,1,()=>(a.Accum=a.XReg,D(a.Accum),2)),f("TXS",l.IMPLIED,154,1,()=>(a.StackPtr=a.XReg,2)),f("TYA",l.IMPLIED,152,1,()=>(a.Accum=a.YReg,D(a.Accum),2));const Fo=t=>{const e=E(t);sr((a.Accum&e)===0),w(t,e&~a.Accum)};f("TRB",l.ZP_REL,20,2,t=>(Fo(t),5)),f("TRB",l.ABS,28,3,(t,e)=>(Fo(m(t,e)),6));const Oo=t=>{const e=E(t);sr((a.Accum&e)===0),w(t,e|a.Accum)};f("TSB",l.ZP_REL,4,2,t=>(Oo(t),5)),f("TSB",l.ABS,12,3,(t,e)=>(Oo(m(t,e)),6));const _i=[2,34,66,98,130,194,226],ut="???";_i.forEach(t=>{f(ut,l.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)f(ut,l.IMPLIED,3+16*t,1,()=>1),f(ut,l.IMPLIED,7+16*t,1,()=>1),f(ut,l.IMPLIED,11+16*t,1,()=>1),f(ut,l.IMPLIED,15+16*t,1,()=>1);f(ut,l.IMPLIED,68,2,()=>3),f(ut,l.IMPLIED,84,2,()=>4),f(ut,l.IMPLIED,212,2,()=>4),f(ut,l.IMPLIED,244,2,()=>4),f(ut,l.IMPLIED,92,3,()=>8),f(ut,l.IMPLIED,220,3,()=>4),f(ut,l.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)Bt[t]||(console.log("ERROR: OPCODE "+t.toString(16)+" should be implemented"),f("BRK",l.IMPLIED,t,1,Po));const tt=(t,e,n)=>{const i=e&7,A=e>>>3;return t[A]|=n>>>i,i&&(t[A+1]|=n<<8-i),e+8},pr=(t,e,n)=>(e=tt(t,e,n>>>1|170),e=tt(t,e,n|170),e),cn=(t,e)=>(e=tt(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const Hi=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),i=[0,2,1,3];for(let g=0;g<84;g++)n[g]=i[t[g]&3]|i[t[g+86]&3]<<2|i[t[g+172]&3]<<4;n[84]=i[t[84]&3]<<0|i[t[170]&3]<<2,n[85]=i[t[85]&3]<<0|i[t[171]&3]<<2;for(let g=0;g<256;g++)n[86+g]=t[g]>>>2;n[342]=n[341];let A=342;for(;A>1;)A--,n[A]^=n[A-1];for(let g=0;g<343;g++)n[g]=e[n[g]];return n};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const ji=(t,e,n)=>{let i=0;const A=new Uint8Array(6646).fill(0);for(let g=0;g<16;g++)i=cn(A,i);for(let g=0;g<16;g++){i=tt(A,i,213),i=tt(A,i,170),i=tt(A,i,150),i=pr(A,i,254),i=pr(A,i,e),i=pr(A,i,g),i=pr(A,i,254^e^g),i=tt(A,i,222),i=tt(A,i,170),i=tt(A,i,235);for(let B=0;B<7;B++)i=cn(A,i);i=tt(A,i,213),i=tt(A,i,170),i=tt(A,i,173);const p=g===15?15:g*(n?8:7)%15,u=Hi(t.slice(p*256,p*256+256));for(let B=0;B<u.length;B++)i=tt(A,i,u[B]);i=tt(A,i,222),i=tt(A,i,170),i=tt(A,i,235);for(let B=0;B<16;B++)i=cn(A,i)}return A},$i=(t,e)=>{if(t.length!==35*16*256)return new Uint8Array;const n=new Uint8Array(512*3+512*35*13).fill(0);n.set(Te(`WOZ2ÿ
\r
`),0),n.set(Te("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(Te("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(Te("TMAP"),80),n[84]=160,n.fill(255,88,88+160);let i=0;for(let A=0;A<35;A++)i=88+(A<<2),A>0&&(n[i-1]=A),n[i]=n[i+1]=A;n.set(Te("TRKS"),248),n.set(Qn(1280+35*13*512),252);for(let A=0;A<35;A++){i=256+(A<<3),n.set(vs(3+A*13),i),n[i+2]=13,n.set(Qn(50304),i+4);const g=t.slice(A*16*256,(A+1)*16*256),p=ji(g,A,e);i=512*(3+13*A),n.set(p,i)}return n},vi=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,B)=>u!==e[B])===void 0))return!1;t.isWriteProtected=e[22]===1;const A=e.slice(8,12),g=A[0]+(A[1]<<8)+(A[2]<<16)+A[3]*2**24,p=ti(e,12);if(g!==0&&g!==p)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const B=e[88+u*2];if(B<255){const X=256+8*B,R=e.slice(X,X+8);t.trackStart[u]=512*(R[0]+(R[1]<<8)),t.trackNbits[u]=R[4]+(R[5]<<8)+(R[6]<<16)+R[7]*2**24}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},zi=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((A,g)=>A!==e[g])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let A=0;A<80;A++){const g=e[88+A*2];if(g<255){t.trackStart[A]=256+g*6656;const p=e.slice(t.trackStart[A]+6646,t.trackStart[A]+6656);t.trackNbits[A]=p[2]+(p[3]<<8)}else t.trackStart[A]=0,t.trackNbits[A]=51200}return!0},t1=t=>{const e=t.toLowerCase(),n=e.endsWith(".dsk")||e.endsWith(".do"),i=e.endsWith(".po");return n||i},e1=(t,e)=>{const i=t.filename.toLowerCase().endsWith(".po"),A=$i(e,i);return A.length===0?new Uint8Array:(t.filename=Nn(t.filename,"woz"),t.diskHasChanges=!0,A)},Qo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),r1=(t,e)=>{const n=Qo(e.slice(24,28)),i=Qo(e.slice(28,32));let A="";for(let g=0;g<4;g++)A+=String.fromCharCode(e[g]);return A!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Nn(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(n,n+i))},No=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},n1=(t,e)=>{t.diskHasChanges=!1;const n=t.filename.toLowerCase();if(No(n)){if(t.hardDrive=!0,t.status="",n.endsWith(".hdv")||n.endsWith(".po"))return e;if(n.endsWith(".2mg"))return r1(t,e)}return t1(t.filename)&&(e=e1(t,e)),vi(t,e)||zi(t,e)?e:(n!==""&&console.error("Unknown disk format."),new Uint8Array)},o1=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ie=0;const et={MOTOR_OFF:8,MOTOR_ON:9,DRIVE1:10,DRIVE2:11,DATA_LATCH_OFF:12,DATA_LATCH_ON:13,WRITE_OFF:14,WRITE_ON:15,MOTOR_RUNNING:!1,DATA_LATCH:!1},xo=t=>{et.MOTOR_RUNNING=!1,Xo(t),t.halftrack=68,t.prevHalfTrack=68},s1=(t=!1)=>{if(t){const e=mr();e.motorRunning&&Wo(e)}else ke(jt.MOTOR_OFF)},Yo=(t,e)=>{t.trackStart[t.halftrack]>0&&(t.prevHalfTrack=t.halftrack),t.halftrack+=e,t.halftrack<0||t.halftrack>68?(ke(jt.TRACK_END),t.halftrack=t.halftrack<0?0:t.halftrack>68?68:t.halftrack):ke(jt.TRACK_SEEK),t.status=` Track ${t.halftrack/2}`,lt(),t.trackStart[t.halftrack]>0&&t.prevHalfTrack!==t.halftrack&&(t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack])),t.trackLocation>3&&(t.trackLocation-=4))},Ko=[128,64,32,16,8,4,2,1],i1=[127,191,223,239,247,251,253,254],un=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let n;if(t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3),A=e[i],g=t.trackLocation&7;n=(A&Ko[g])>>7-g}else n=1;return t.trackLocation++,n};let nt=0;const a1=(t,e)=>{if(e.length===0)return 0;let n=0;if(nt===0){for(;un(t,e)===0;);nt=64;for(let i=5;i>=0;i--)nt|=un(t,e)<<i}else{const i=un(t,e);nt=nt<<1|i}return n=nt,nt>127&&(nt=0),n};let Ir=0;const ln=(t,e,n)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const i=t.trackStart[t.halftrack]+(t.trackLocation>>3);let A=e[i];const g=t.trackLocation&7;n?A|=Ko[g]:A&=i1[g],e[i]=A}t.trackLocation++},qo=(t,e,n)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&nt>0){if(n>=16)for(let i=7;i>=0;i--)ln(t,e,nt&2**i?1:0);n>=36&&ln(t,e,0),n>=40&&ln(t,e,0),fn.push(n>=40?2:n>=36?1:nt),t.diskHasChanges=!0,nt=0}},Xo=t=>{Ie=0,et.MOTOR_RUNNING||(t.motorRunning=!1),lt(),ke(jt.MOTOR_OFF)},Wo=t=>{Ie&&(clearTimeout(Ie),Ie=0),t.motorRunning=!0,lt(),ke(jt.MOTOR_ON)},A1=t=>{Ie===0&&(Ie=setTimeout(()=>Xo(t),1e3))};let fn=[];const Sr=t=>{fn.length>0&&t.halftrack===2*0&&(fn=[])},Er=[0,0,0,0],c1=(t,e)=>{if(t>=49408)return-1;let n=mr();const i=m1();if(n.hardDrive)return 0;let A=0;const g=a.cycleCount-Ir;switch(t=t&15,t){case et.DATA_LATCH_OFF:et.DATA_LATCH=!1,n.motorRunning&&!n.writeMode&&(A=a1(n,i));break;case et.MOTOR_ON:et.MOTOR_RUNNING=!0,Wo(n),Sr(n);break;case et.MOTOR_OFF:et.MOTOR_RUNNING=!1,A1(n),Sr(n);break;case et.DRIVE1:case et.DRIVE2:{const p=t===et.DRIVE1?1:2,u=mr();B1(p),n=mr(),n!==u&&u.motorRunning&&(u.motorRunning=!1,n.motorRunning=!0,lt());break}case et.WRITE_OFF:n.motorRunning&&n.writeMode&&(qo(n,i,g),Ir=a.cycleCount),n.writeMode=!1,et.DATA_LATCH&&(A=n.isWriteProtected?255:0),Sr(n);break;case et.WRITE_ON:n.writeMode=!0,Ir=a.cycleCount,e>=0&&(nt=e);break;case et.DATA_LATCH_ON:et.DATA_LATCH=!0,n.motorRunning&&(n.writeMode&&(qo(n,i,g),Ir=a.cycleCount),e>=0&&(nt=e));break;default:{if(t<0||t>7)break;Er[Math.floor(t/2)]=t%2;const p=Er[(n.currentPhase+1)%4],u=Er[(n.currentPhase+3)%4];Er[n.currentPhase]||(n.motorRunning&&p?(Yo(n,1),n.currentPhase=(n.currentPhase+1)%4):n.motorRunning&&u&&(Yo(n,-1),n.currentPhase=(n.currentPhase+3)%4)),Sr(n);break}}return A},u1=()=>{pe(6,Uint8Array.from(o1)),nr(6,c1)},Go=t=>{const e=t.split(","),n=e[0].split(/([+-])/);return{label:n[0]?n[0]:"",operation:n[1]?n[1]:"",value:n[2]?parseInt(n[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},l1=t=>{let e=l.IMPLIED,n=-1;if(t.length>0){t.startsWith("#")?(e=l.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=l.IND_Y:t.endsWith(",X)")?e=l.IND_X:e=l.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?l.ABS_X:l.ZP_X:t.endsWith(",Y")?e=t.length>5?l.ABS_Y:l.ZP_Y:e=t.length>3?l.ABS:l.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),n=parseInt(t);const i=Go(t);if(i.operation&&i.value){switch(i.operation){case"+":n+=i.value;break;case"-":n-=i.value;break;default:throw new Error("Unknown operation in operand: "+t)}n=(n%65536+65536)%65536}}return[e,n]};let Se={};const Zo=(t,e,n,i)=>{let A=l.IMPLIED,g=-1;if(n.match(/^[#]?[$0-9()]+/))return l1(n);const p=Go(n);if(p.label){const u=p.label.startsWith("<"),B=p.label.startsWith(">"),X=p.label.startsWith("#")||B||u;if(X&&(p.label=p.label.substring(1)),p.label in Se)g=Se[p.label],B?g=g>>8&255:u&&(g=g&255);else if(i===2)throw new Error("Missing label: "+p.label);if(p.operation&&p.value){switch(p.operation){case"+":g+=p.value;break;case"-":g-=p.value;break;default:throw new Error("Unknown operation in operand: "+n)}g=(g%65536+65536)%65536}Yr(e)?(A=l.ZP_REL,g=g-t+254,g>255&&(g-=256)):X?A=l.IMM:(A=g>=0&&g<=255?l.ZP_REL:l.ABS,A=p.idx==="X"?A===l.ABS?l.ABS_X:l.ZP_X:A,A=p.idx==="Y"?A===l.ABS?l.ABS_Y:l.ZP_Y:A)}return[A,g]},f1=(t,e)=>{t=t.replace(/\s+/g," ");const n=t.split(" ");return{label:n[0]?n[0]:e,instr:n[1]?n[1]:"",operand:n[2]?n[2]:""}},h1=(t,e)=>{if(t.label in Se)throw new Error("Redefined label: "+t.label);if(t.instr==="EQU"){const[n,i]=Zo(e,t.instr,t.operand,2);if(n!==l.ABS&&n!==l.ZP_REL)throw new Error("Illegal EQU value: "+t.operand);Se[t.label]=i}else Se[t.label]=e},g1=(t,e)=>{const n=[],i=Bt[t];return n.push(t),e>=0&&(n.push(e%256),i.PC===3&&n.push(Math.trunc(e/256))),n},Jo=(t,e,n)=>{let i=t;const A=[];let g="";return e.forEach(p=>{if(p=p.split(";")[0].trimEnd().toUpperCase(),!p)return;(p+"                   ").slice(0,30)+F(i,4)+"";const u=f1(p,g);if(g="",!u.instr){g=u.label;return}if(u.instr==="ORG"||(n===1&&u.label&&h1(u,i),u.instr==="EQU"))return;let B=[],X,R;if(u.instr==="ASC"||u.instr==="DA"){let T=u.operand,rt=0;if(T.startsWith('"')&&T.endsWith('"'))rt=128;else if(T.startsWith("'")&&T.endsWith("'"))rt=0;else throw new Error("Invalid string: "+T);T=T.substring(1,T.length-1);for(let v=0;v<T.length;v++)B.push(T.charCodeAt(v)|rt);B.push(0),i+=T.length+1}else if([X,R]=Zo(i,u.instr,u.operand,n),u.instr==="DB")B.push(R&255),i++;else if(u.instr==="DW")B.push(R&255),B.push(R>>8&255),i+=2;else if(u.instr==="DS")for(let T=0;T<R;T++)B.push(0),i++;else{if(n===2&&Yr(u.instr)&&(R<0||R>255))throw new Error(`Branch instruction out of range: ${p} value: ${R} pass: ${n}`);const T=Bt.findIndex(rt=>rt&&rt.name===u.instr&&rt.mode===X);if(T<0)throw new Error(`Unknown instruction: ${u.instr} mode=${X} pass=${n}`);B=g1(T,R),i+=Bt[T].PC}A.push(...B)}),A},Cr=(t,e)=>{Se={};try{return Jo(t,e,1),Jo(t,e,2)}catch(n){return console.error(n),[]}};let Ee=0;const Br=192,p1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${F(Br)}   ; jump address
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
`,I1=`
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
`,S1=()=>{const t=new Uint8Array(256).fill(0),e=Cr(0,p1.split(`
`));t.set(e,0);const n=Cr(0,I1.split(`
`));return t.set(n,Br),t[254]=23,t[255]=Br,t};let Oe=new Uint8Array;const Vo=(t=!0)=>{Oe.length===0&&(Oe=S1()),Oe[1]=t?32:0;const n=49152+Br+7*256;pe(7,Oe,n,C1),pe(7,Oe,n+3,E1)},E1=()=>{const t=_o();if(!t.hardDrive)return;const e=Ho(),n=256+a.StackPtr,i=E(n+1)+256*E(n+2),A=E(i+1),g=E(i+2)+256*E(i+3),p=E(g+1),u=E(g+2)+256*E(g+3);switch(A){case 0:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),b();return}const B=E(g+4);switch(B){case 0:p===0?(w(u,1),b(!1)):(console.error(`SmartPort status for unitNumber ${p} not implemented`),b());break;default:console.error(`SmartPort statusCode ${B} not implemented`),b();break}return}case 1:{if(E(g)!==3){console.error(`Incorrect SmartPort parameter count at address ${g}`),b();return}const X=512*(E(g+4)+256*E(g+5)+65536*E(g+6)),R=e.slice(X,X+512);rn(u,R);break}case 2:default:console.error(`SmartPort command ${A} not implemented`),b();return}b(!1),t.motorRunning=!0,Ee||(Ee=setTimeout(()=>{Ee=0,t&&(t.motorRunning=!1),lt()},500)),lt()},C1=()=>{const t=_o();if(!t.hardDrive)return;const e=Ho(),n=E(70)+256*E(71),i=512*n,A=E(68)+256*E(69),g=e.length;switch(t.status=` ${F(n,4)} ${F(A,4)}`,E(66)){case 0:{if(t.filename.length===0||g===0){Io(0),So(0),b();return}const p=g/512;Io(p&255),So(p>>>8);break}case 1:{if(i+512>g){b();return}const p=e.slice(i,i+512);rn(A,p);break}case 2:{if(i+512>g){b();return}const p=Ni(A);e.set(p,i),t.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),b();return;default:console.error("unknown hard drive command"),b();return}b(!1),t.motorRunning=!0,Ee||(Ee=setTimeout(()=>{Ee=0,t&&(t.motorRunning=!1),lt()},500)),lt()},Qe=t=>({hardDrive:t===0,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:t>0?Array(80):Array(),trackNbits:t>0?Array(80):Array(),trackLocation:0}),x=[Qe(0),Qe(1),Qe(2)],qt=[new Uint8Array,new Uint8Array,new Uint8Array];let Ne=1;const B1=t=>{Ne=t},mr=()=>x[Ne],m1=()=>qt[Ne],_o=()=>x[0],Ho=()=>qt[0],lt=()=>{for(let t=0;t<x.length;t++){const e={hardDrive:x[t].hardDrive,drive:t,filename:x[t].filename,status:x[t].status,motorRunning:x[t].motorRunning,diskHasChanges:x[t].diskHasChanges,diskData:x[t].diskHasChanges?qt[t]:new Uint8Array};Ua(e)}},D1=t=>{const e=["","",""];for(let n=t?0:1;n<3;n++)e[n]=Ht.Buffer.from(qt[n]).toString("base64");return{currentDrive:Ne,driveState:x,driveData:e}},d1=t=>{ke(jt.MOTOR_OFF),Ne=t.currentDrive;for(let e=0;e<3;e++)x[e]=Qe(e),qt[e]=new Uint8Array;for(let e=0;e<t.driveState.length;e++)x[e]=t.driveState[e],t.driveData[e]!==""&&(qt[e]=new Uint8Array(Ht.Buffer.from(t.driveData[e],"base64")));x[0].hardDrive&&Vo(x[0].filename!==""),lt()},w1=()=>{xo(x[1]),xo(x[2]),lt()},jo=(t=!1)=>{s1(t),lt()},k1=t=>{let e=t.drive;t.filename!==""&&(No(t.filename)?(e=0,x[0].hardDrive=!0):e===0&&(e=1)),x[e]=Qe(e),x[e].filename=t.filename,x[e].motorRunning=t.motorRunning,qt[e]=n1(x[e],t.diskData),qt[e].length===0&&(x[e].filename=""),x[e].hardDrive&&Vo(x[e].filename!==""),lt()},$o=`
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
`;let hn=!1,Xt=new Map;const Dr=()=>{hn=!0},y1=()=>{new Map(Xt).forEach((n,i)=>{n.once&&Xt.delete(i)});const e=Wi();e<0||Xt.get(e)||Xt.set(e,{disabled:!1,hidden:!0,once:!0})},R1=t=>{Xt=t},gn=(t=0,e=!0)=>{e?a.flagIRQ|=1<<t:a.flagIRQ&=~(1<<t),a.flagIRQ&=255},T1=(t=!0)=>{a.flagNMI=t===!0},P1=()=>{a.flagIRQ=0,a.flagNMI=!1},pn=[],vo=[],b1=(t,e)=>{pn.push(t),vo.push(e)},L1=()=>{for(let t=0;t<pn.length;t++)pn[t](vo[t])},In=(t=!1)=>{let e=0;const n=a.PC,i=E(a.PC),A=E(a.PC+1),g=E(a.PC+2),p=Bt[i];if(Xt.size>0&&!t){const B=Xt.get(n);if(B&&!B.disabled&&!hn)return B.once&&Xt.delete(n),St(U.PAUSED),-1}hn=!1;const u=lo.get(n);return u&&!C.INTCXROM.isSet&&u(),e=p.execute(A,g),Bo(p.PC),or(a.cycleCount+e),L1(),a.flagNMI&&(a.flagNMI=!1,e=Ji(),or(a.cycleCount+e)),a.flagIRQ&&(e=Zi(),or(a.cycleCount+e)),e},Sn=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let En=1,Cn=0,Bn=0;const M1=(t=!0,e=1)=>{if(!t)return;En=e;const n=new Uint8Array(Sn.length+256);n.set(Sn.slice(1792,2048)),n.set(Sn,256),pe(En,n),nr(En,O1)};let dr=new Uint8Array(0),wr=-1;const U1=t=>{const e=new Uint8Array(dr.length+t.length);e.set(t),e.set(dr,t.length),dr=e,wr+=t.length},F1=t=>{const e=new Uint8Array(1).fill(t);Qa(e)},O1=(t,e=-1)=>{if(t>=49408)return-1;const n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(e>=0)F1(e);else return wr>=0?dr[wr--]:0;break;case n.STATUS:if(e>=0)console.log("SSC RESET"),Cn=2,Bn=0;else{let i=16;return i|=wr>=0?8:0,i}break;case n.COMMAND:if(e>=0){console.log("SSC COMMAND: 0x"+e.toString(16)),Cn=e;break}else return Cn;case n.CONTROL:if(e>=0){console.log("SSC CONTROL: 0x"+e.toString(16)),Bn=e;break}else return Bn;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},xe=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Q1=()=>{const t=new Date,e=xe(t.getMonth()+1,2)+","+xe(t.getDay(),2)+","+xe(t.getDate(),2)+","+xe(t.getHours(),2)+","+xe(t.getMinutes(),2);for(let n=0;n<e.length;n++)w(512+n,e.charCodeAt(n)|128)},N1=`
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
`,zo=()=>{pt=0,It=0,Pt=0,bt=0,Ae=1023,ce=1023,Tr(0),H=0,Gt=0,Ce=0,Ye=0,Ke=0,ot=0,mt=0,Be=0,kr=0};let pt=0,It=0,Pt=0,bt=0,Ae=1023,ce=1023,kr=0,Wt=0,H=0,Gt=0,Ce=0,Ye=0,Ke=0,ot=0,mt=0,Be=0,ts=0,Dt=5;const yr=54,Rr=55,x1=56,Y1=57,es=()=>{const t=new Uint8Array(256).fill(0),e=Cr(0,N1.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},K1=(t=!0,e=5)=>{if(!t)return;Dt=e;const n=49152+Dt*256,i=49152+Dt*256+8;pe(Dt,es(),n,W1),pe(Dt,es(),i,Q1),nr(Dt,J1),zo()},Tr=t=>{Wt=t,Ps(!t)},q1=()=>{if(Wt&1){let t=!1;Wt&8&&(Be|=8,t=!0),Wt&Gt&4&&(Be|=4,t=!0),Wt&Gt&2&&(Be|=2,t=!0),t&&gn(Dt,!0)}},X1=t=>{if(Wt&1)if(t.buttons>=0){switch(t.buttons){case 0:H&=-129;break;case 16:H|=128;break;case 1:H&=-17;break;case 17:H|=16;break}Gt|=H&128?4:0}else t.x>=0&&t.x<=1&&(pt=Math.round((Ae-Pt)*t.x+Pt),Gt|=2),t.y>=0&&t.y<=1&&(It=Math.round((ce-bt)*t.y+bt),Gt|=2)};let qe=0,mn="",rs=0,ns=0;const W1=()=>{const t=192+Dt;E(Rr)===t&&E(yr)===0?Z1():E(Y1)===t&&E(x1)===0&&G1()},G1=()=>{if(qe===0){const t=192+Dt;rs=E(Rr),ns=E(yr),w(Rr,t),w(yr,3);const e=(H&128)!==(Ce&128);let n=0;H&128?n=e?2:1:n=e?3:4,E(49152)&128&&(n=-n),Ce=H,mn=pt.toString()+","+It.toString()+","+n.toString()}qe>=mn.length?(a.Accum=141,qe=0,w(Rr,rs),w(yr,ns)):(a.Accum=mn.charCodeAt(qe)|128,qe++)},Z1=()=>{switch(a.Accum){case 128:console.log("mouse off"),Tr(0);break;case 129:console.log("mouse on"),Tr(1);break}},J1=(t,e)=>{if(t>=49408)return-1;const n=e<0,i={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},A={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case i.LOWX:if(n===!1)ot=ot&65280|e,ot&=65535;else return pt&255;break;case i.HIGHX:if(n===!1)ot=e<<8|ot&255,ot&=65535;else return pt>>8&255;break;case i.LOWY:if(n===!1)mt=mt&65280|e,mt&=65535;else return It&255;break;case i.HIGHY:if(n===!1)mt=e<<8|mt&255,mt&=65535;else return It>>8&255;break;case i.STATUS:return H;case i.MODE:if(n===!1)Tr(e),console.log("Mouse mode: 0x",Wt.toString(16));else return Wt;break;case i.CLAMP:if(n===!1)kr=78-e;else switch(kr){case 0:return Pt>>8&255;case 1:return bt>>8&255;case 2:return Pt&255;case 3:return bt&255;case 4:return Ae>>8&255;case 5:return ce>>8&255;case 6:return Ae&255;case 7:return ce&255;default:return console.log("AppleMouse: invalid clamp index: "+kr),0}break;case i.CLOCK:case i.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case i.COMMAND:if(n===!1)switch(ts=e,e){case A.INIT:console.log("cmd.init"),pt=0,It=0,Ye=0,Ke=0,Pt=0,bt=0,Ae=1023,ce=1023,H=0,Gt=0;break;case A.READ:Gt=0,H&=-112,H|=Ce>>1&64,H|=Ce>>4&1,Ce=H,(Ye!==pt||Ke!==It)&&(H|=32),Ye=pt,Ke=It;break;case A.CLEAR:console.log("cmd.clear"),pt=0,It=0,Ye=0,Ke=0;break;case A.SERVE:H&=-15,H|=Be,Be=0,gn(Dt,!1);break;case A.HOME:console.log("cmd.home"),pt=Pt,It=bt;break;case A.CLAMPX:console.log("cmd.clampx"),Pt=ot>32767?ot-65536:ot,Ae=mt,console.log(Pt+" -> "+Ae);break;case A.CLAMPY:console.log("cmd.clampy"),bt=ot>32767?ot-65536:ot,ce=mt,console.log(bt+" -> "+ce);break;case A.GCLAMP:console.log("cmd.getclamp");break;case A.POS:console.log("cmd.pos"),pt=ot,It=mt;break}else return ts;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},os=(t=!0,e=4)=>{t&&(nr(e,Aa),b1(na,e))},Dn=[0,128],dn=[1,129],V1=[2,130],_1=[3,131],me=[4,132],De=[5,133],Pr=[6,134],wn=[7,135],Xe=[8,136],We=[9,137],H1=[10,138],kn=[11,139],j1=[12,140],ue=[13,141],Ge=[14,142],ss=[16,145],is=[17,145],dt=[18,146],yn=[32,160],Lt=64,Zt=32,as=(t=4)=>{for(let e=0;e<=255;e++)P(t,e,0);for(let e=0;e<=1;e++)Rn(t,e)},$1=(t,e)=>(Q(t,Ge[e])&Lt)!==0,v1=(t,e)=>(Q(t,dt[e])&Lt)!==0,As=(t,e)=>(Q(t,kn[e])&Lt)!==0,z1=(t,e,n)=>{let i=Q(t,me[e])-n;if(P(t,me[e],i),i<0){i=i%256+256,P(t,me[e],i);let A=Q(t,De[e]);if(A--,P(t,De[e],A),A<0&&(A+=256,P(t,De[e],A),$1(t,e)&&(!v1(t,e)||As(t,e)))){const g=Q(t,dt[e]);P(t,dt[e],g|Lt);const p=Q(t,ue[e]);if(P(t,ue[e],p|Lt),Jt(t,e,-1),As(t,e)){const u=Q(t,wn[e]),B=Q(t,Pr[e]);P(t,me[e],B),P(t,De[e],u)}}}},ta=(t,e)=>(Q(t,Ge[e])&Zt)!==0,ea=(t,e)=>(Q(t,dt[e])&Zt)!==0,ra=(t,e,n)=>{if(Q(t,kn[e])&Zt)return;let i=Q(t,Xe[e])-n;if(P(t,Xe[e],i),i<0){i=i%256+256,P(t,Xe[e],i);let A=Q(t,We[e]);if(A--,P(t,We[e],A),A<0&&(A+=256,P(t,We[e],A),ta(t,e)&&!ea(t,e))){const g=Q(t,dt[e]);P(t,dt[e],g|Zt);const p=Q(t,ue[e]);P(t,ue[e],p|Zt),Jt(t,e,-1)}}},cs=new Array(8).fill(0),na=t=>{const e=a.cycleCount-cs[t];for(let n=0;n<=1;n++)z1(t,n,e),ra(t,n,e);cs[t]=a.cycleCount},oa=(t,e)=>{const n=[];for(let i=0;i<=15;i++)n[i]=Q(t,yn[e]+i);return n},sa=(t,e)=>t.length===e.length&&t.every((n,i)=>n===e[i]),de={slot:-1,chip:-1,params:[-1]};let Rn=(t,e)=>{const n=oa(t,e);t===de.slot&&e===de.chip&&sa(n,de.params)||(de.slot=t,de.chip=e,de.params=n,Oa({slot:t,chip:e,params:n}))};const ia=(t,e)=>{switch(Q(t,Dn[e])&7){case 0:for(let i=0;i<=15;i++)P(t,yn[e]+i,0);Rn(t,e);break;case 7:P(t,is[e],Q(t,dn[e]));break;case 6:{const i=Q(t,is[e]),A=Q(t,dn[e]);i>=0&&i<=15&&(P(t,yn[e]+i,A),Rn(t,e));break}}},Jt=(t,e,n)=>{let i=Q(t,ue[e]);switch(n>=0&&(i&=127-(n&127),P(t,ue[e],i)),e){case 0:gn(t,i!==0);break;case 1:T1(i!==0);break}},aa=(t,e,n)=>{let i=Q(t,Ge[e]);n>=0&&(n=n&255,n&128?i|=n:i&=255-n),i|=128,P(t,Ge[e],i)},Aa=(t,e=-1)=>{if(t<49408)return-1;const n=(t&3840)>>8,i=t&255,A=i&128?1:0;switch(i){case Dn[A]:e>=0&&(P(n,Dn[A],e),ia(n,A));break;case dn[A]:case V1[A]:case _1[A]:case H1[A]:case kn[A]:case j1[A]:P(n,i,e);break;case me[A]:e>=0&&P(n,Pr[A],e),Jt(n,A,Lt);break;case De[A]:if(e>=0){P(n,wn[A],e),P(n,me[A],Q(n,Pr[A])),P(n,De[A],e);const g=Q(n,dt[A]);P(n,dt[A],g&~Lt),Jt(n,A,Lt)}break;case Pr[A]:e>=0&&(P(n,i,e),Jt(n,A,Lt));break;case wn[A]:e>=0&&P(n,i,e);break;case Xe[A]:e>=0&&P(n,ss[A],e),Jt(n,A,Zt);break;case We[A]:if(e>=0){P(n,We[A],e),P(n,Xe[A],Q(n,ss[A]));const g=Q(n,dt[A]);P(n,dt[A],g&~Zt),Jt(n,A,Zt)}break;case ue[A]:e>=0&&Jt(n,A,e);break;case Ge[A]:aa(n,A,e);break}return-1},br=40,ca=(t,e)=>t+2+(e>127?e-256:e),ua=(t,e,n,i)=>{let A="",g=`${F(e.pcode)}`,p="",u="";switch(e.PC){case 1:g+="      ";break;case 2:p=F(n),g+=` ${p}   `;break;case 3:p=F(n),u=F(i),g+=` ${p} ${u}`;break}const B=Yr(e.name)?F(ca(t,n)):p;switch(e.mode){case l.IMPLIED:break;case l.IMM:A=` #$${p}`;break;case l.ZP_REL:A=` $${B}`;break;case l.ZP_X:A=` $${p},X`;break;case l.ZP_Y:A=` $${p},Y`;break;case l.ABS:A=` $${u}${p}`;break;case l.ABS_X:A=` $${u}${p},X`;break;case l.ABS_Y:A=` $${u}${p},Y`;break;case l.IND_X:A=` ($${u.trim()}${p},X)`;break;case l.IND_Y:A=` ($${p}),Y`;break;case l.IND:A=` ($${u.trim()}${p})`;break}return`${F(t,4)}: ${g}  ${e.name}${A}`},la=t=>{let e=t;e>65535-br&&(e=65535-br);let n="";for(let i=0;i<2*br;i++){if(e>65535){n+=`
`;continue}const A=Me(e),g=Bt[A],p=Me(e+1),u=Me(e+2);n+=ua(e,g,p,u)+`
`,e+=g.PC}return n},fa=(t,e)=>{if(e<t||t<0)return!1;let n=t;for(let i=0;i<br;i++){if(n===e)return!0;const A=Me(n);if(n+=Bt[A].PC,n>65535)break}return!1},ha=t=>{const e=Me(t);return Bt[e].name};let us=0,Lr=0,ls=!0,Mr=0,fs=!0,Vt=-1,hs=16.6881,gs=0,j=U.IDLE,we=0,Tn=!1,ft=0;const ps=60,$=[];let Ur=!1;const ga=()=>{Ur=!0,q1()},pa=()=>{Ur=!1},Ia=()=>{const t=JSON.parse(JSON.stringify(a)),e={};for(const i in C)e[i]=C[i].isSet;const n=Ht.Buffer.from(O);return{s6502:t,softSwitches:e,memory:n.toString("base64")}},Sa=t=>{const e=JSON.parse(JSON.stringify(t.s6502));Eo(e);const n=t.softSwitches;for(const i in n){const A=i;try{C[A].isSet=n[i]}catch{}}O.set(Ht.Buffer.from(t.memory,"base64")),se(),eo(!0)},Is=(t=!1)=>({emulator:null,state6502:Ia(),driveState:D1(t)}),Ea=t=>{t.PC!==a.PC&&(Vt=t.PC),Eo(t),Ze()},Fr=t=>{Pn(),Sa(t.state6502),d1(t.driveState),Vt=a.PC,Ze()};let Ss=!1;const Es=()=>{Ss||(Ss=!0,M1(),K1(!0,2),os(!0,4),os(!0,5),u1())},Ca=()=>{w1(),_r(),zo(),as(4),as(5)},Or=()=>{if(or(0),Ui(),Es(),$o.length>0){const t=Cr(768,$o.split(`
`));O.set(t,768)}Pn()},Pn=()=>{P1();for(const t in C){const e=t;C[e].isSet=!1}C.TEXT.isSet=!0,E(49282),Co(),Ca()},Ba=t=>{ls=t,hs=ls?16.6881:0,ks()},ma=t=>{fs=t},Da=t=>{Vt=t,Ze(),t===U.PAUSED&&(Vt=a.PC)},Cs=()=>{const t=ft-1;return t<0||!$[t]?-1:t},Bs=()=>{const t=ft+1;return t>=$.length||!$[t]?-1:t},ms=()=>{$.length===ps&&$.shift(),$.push(Is()),ft=$.length},da=()=>{let t=Cs();t<0||(St(U.PAUSED),setTimeout(()=>{ft===$.length&&(ms(),t=Math.max(ft-2,0)),ft=t,Fr($[ft])},50))},wa=()=>{const t=Bs();t<0||(St(U.PAUSED),setTimeout(()=>{ft=t,Fr($[t])},50))},ka=t=>{t<0||t>=$.length||(St(U.PAUSED),setTimeout(()=>{ft=t,Fr($[t])},50))},ya=()=>{const t=[];for(let e=0;e<$.length;e++)t[e]={s6502:$[e].state6502.s6502};return t},Ds=()=>{Tn=!0},ds=()=>{Dr(),j===U.IDLE&&(Or(),j=U.PAUSED),In(!0),St(U.PAUSED)},Ra=()=>{Dr(),j===U.IDLE&&(Or(),j=U.PAUSED),E(a.PC)===32?(In(!0),ws()):ds()},ws=()=>{Dr(),j===U.IDLE&&(Or(),j=U.PAUSED),y1(),St(U.RUNNING)},ks=()=>{we=0,Lr=performance.now(),us=Lr},St=t=>{if(Es(),j=t,j===U.PAUSED)jo(),fa(Vt,a.PC)||(Vt=a.PC);else if(j===U.RUNNING){for(jo(!0),Dr();$.length>0&&ft<$.length-1;)$.pop();ft=$.length}Ze(),ks(),Mr===0&&(Mr=1,Ds(),Rs())},Ta=(t,e,n)=>{const i=()=>{rn(t,e),n&&Ct(t)};j===U.IDLE?(St(U.NEED_BOOT),setTimeout(()=>{St(U.NEED_RESET),setTimeout(()=>{i()},200)},200)):i()},Pa=()=>{if(!fs)return"";const t=[qi()];t.push(xi());const e=Xi();for(let n=0;n<Math.min(20,e.length);n++)t.push(e[n]);return t.join(`
`)},ba=()=>j===U.RUNNING?"":la(Vt>=0?Vt:a.PC),Ze=()=>{const t={runMode:j,s6502:a,speed:Mr,altChar:C.ALTCHARSET.isSet,noDelayMode:!C.COLUMN80.isSet&&!C.AN3.isSet,textPage:en(),lores:en(!0),hires:Qi(),debugDump:Pa(),disassembly:ba(),nextInstruction:ha(a.PC),button0:C.PB0.isSet,button1:C.PB1.isSet,canGoBackward:Cs()>=0,canGoForward:Bs()>=0,maxState:ps,iTempState:ft,timeTravelThumbnails:ya()};La(t)},ys=()=>{const t=performance.now();if(gs=t-Lr,gs<hs||(Lr=t,j===U.IDLE||j===U.PAUSED))return;j===U.NEED_BOOT?(Or(),St(U.RUNNING)):j===U.NEED_RESET&&(Pn(),St(U.RUNNING));let e=0;for(;;){const n=In();if(n<0)break;if(e+=n,e>=12480&&Ur===!1&&ga(),e>=17030){pa();break}}we++,Mr=Math.round(we*1703/(performance.now()-us))/100,we%2&&(si(),Ze()),Tn&&(Tn=!1,ms())},Rs=()=>{ys();const t=we+1;for(;j===U.RUNNING&&we!==t;)ys();setTimeout(Rs,j===U.RUNNING?0:20)},wt=(t,e)=>{self.postMessage({msg:t,payload:e})},La=t=>{wt(ht.MACHINE_STATE,t)},Ma=t=>{wt(ht.CLICK,t)},Ua=t=>{wt(ht.DRIVE_PROPS,t)},ke=t=>{wt(ht.DRIVE_SOUND,t)},Fa=t=>{wt(ht.SAVE_STATE,t)},bn=t=>{wt(ht.RUMBLE,t)},Ts=t=>{wt(ht.HELP_TEXT,t)},Ps=t=>{wt(ht.SHOW_MOUSE,t)},Oa=t=>{wt(ht.MBOARD_SOUND,t)},Qa=t=>{wt(ht.COMM_DATA,t)};self.onmessage=t=>{switch(t.data.msg){case K.RUN_MODE:St(t.data.payload);break;case K.STATE6502:Ea(t.data.payload);break;case K.DEBUG:ma(t.data.payload);break;case K.DISASSEMBLE_ADDR:Da(t.data.payload);break;case K.BREAKPOINTS:R1(t.data.payload);break;case K.STEP_INTO:ds();break;case K.STEP_OVER:Ra();break;case K.STEP_OUT:ws();break;case K.SPEED:Ba(t.data.payload);break;case K.TIME_TRAVEL:t.data.payload==="FORWARD"?wa():da();break;case K.TIME_TRAVEL_INDEX:ka(t.data.payload);break;case K.RESTORE_STATE:Fr(t.data.payload);break;case K.KEYPRESS:mi(t.data.payload);break;case K.MOUSEEVENT:X1(t.data.payload);break;case K.PASTE_TEXT:Di(t.data.payload);break;case K.APPLE_PRESS:_n(!0,t.data.payload);break;case K.APPLE_RELEASE:_n(!1,t.data.payload);break;case K.GET_SAVE_STATE:Fa(Is(!0));break;case K.DRIVE_PROPS:{const e=t.data.payload;k1(e);break}case K.GAMEPAD:ni(t.data.payload);break;case K.SET_BINARY_BLOCK:{const e=t.data.payload;Ta(e.address,e.data,e.run);break}case K.COMM_DATA:U1(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${t.data.msg}`);break}}})();
