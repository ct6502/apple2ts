var Q0=Object.defineProperty;var X0=(It,Ct,ct)=>Ct in It?Q0(It,Ct,{enumerable:!0,configurable:!0,writable:!0,value:ct}):It[Ct]=ct;var T=(It,Ct,ct)=>X0(It,typeof Ct!="symbol"?Ct+"":Ct,ct);(function(){"use strict";var It={},Ct={};Ct.byteLength=Xi,Ct.toByteArray=Ki,Ct.fromByteArray=Zi;for(var ct=[],Bt=[],xi=typeof Uint8Array<"u"?Uint8Array:Array,En="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_e=0,Qi=En.length;_e<Qi;++_e)ct[_e]=En[_e],Bt[En.charCodeAt(_e)]=_e;Bt[45]=62,Bt[95]=63;function Bs(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");r===-1&&(r=e);var o=r===e?0:4-r%4;return[r,o]}function Xi(t){var e=Bs(t),r=e[0],o=e[1];return(r+o)*3/4-o}function Yi(t,e,r){return(e+r)*3/4-r}function Ki(t){var e,r=Bs(t),o=r[0],c=r[1],f=new xi(Yi(t,o,c)),S=0,u=c>0?o-4:o,B;for(B=0;B<u;B+=4)e=Bt[t.charCodeAt(B)]<<18|Bt[t.charCodeAt(B+1)]<<12|Bt[t.charCodeAt(B+2)]<<6|Bt[t.charCodeAt(B+3)],f[S++]=e>>16&255,f[S++]=e>>8&255,f[S++]=e&255;return c===2&&(e=Bt[t.charCodeAt(B)]<<2|Bt[t.charCodeAt(B+1)]>>4,f[S++]=e&255),c===1&&(e=Bt[t.charCodeAt(B)]<<10|Bt[t.charCodeAt(B+1)]<<4|Bt[t.charCodeAt(B+2)]>>2,f[S++]=e>>8&255,f[S++]=e&255),f}function qi(t){return ct[t>>18&63]+ct[t>>12&63]+ct[t>>6&63]+ct[t&63]}function Wi(t,e,r){for(var o,c=[],f=e;f<r;f+=3)o=(t[f]<<16&16711680)+(t[f+1]<<8&65280)+(t[f+2]&255),c.push(qi(o));return c.join("")}function Zi(t){for(var e,r=t.length,o=r%3,c=[],f=16383,S=0,u=r-o;S<u;S+=f)c.push(Wi(t,S,S+f>u?u:S+f));return o===1?(e=t[r-1],c.push(ct[e>>2]+ct[e<<4&63]+"==")):o===2&&(e=(t[r-2]<<8)+t[r-1],c.push(ct[e>>10]+ct[e>>4&63]+ct[e<<2&63]+"=")),c.join("")}var mn={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */mn.read=function(t,e,r,o,c){var f,S,u=c*8-o-1,B=(1<<u)-1,V=B>>1,y=-7,et=r?c-1:0,K=r?-1:1,v=t[e+et];for(et+=K,f=v&(1<<-y)-1,v>>=-y,y+=u;y>0;f=f*256+t[e+et],et+=K,y-=8);for(S=f&(1<<-y)-1,f>>=-y,y+=o;y>0;S=S*256+t[e+et],et+=K,y-=8);if(f===0)f=1-V;else{if(f===B)return S?NaN:(v?-1:1)*(1/0);S=S+Math.pow(2,o),f=f-V}return(v?-1:1)*S*Math.pow(2,f-o)},mn.write=function(t,e,r,o,c,f){var S,u,B,V=f*8-c-1,y=(1<<V)-1,et=y>>1,K=c===23?Math.pow(2,-24)-Math.pow(2,-77):0,v=o?0:f-1,Er=o?1:-1,mr=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,S=y):(S=Math.floor(Math.log(e)/Math.LN2),e*(B=Math.pow(2,-S))<1&&(S--,B*=2),S+et>=1?e+=K/B:e+=K*Math.pow(2,1-et),e*B>=2&&(S++,B/=2),S+et>=y?(u=0,S=y):S+et>=1?(u=(e*B-1)*Math.pow(2,c),S=S+et):(u=e*Math.pow(2,et-1)*Math.pow(2,c),S=0));c>=8;t[r+v]=u&255,v+=Er,u/=256,c-=8);for(S=S<<c|u,V+=c;V>0;t[r+v]=S&255,v+=Er,S/=256,V-=8);t[r+v-Er]|=mr*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=Ct,r=mn,o=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=m0,t.INSPECT_MAX_BYTES=50;const c=2147483647;t.kMaxLength=c,u.TYPED_ARRAY_SUPPORT=f(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function f(){try{const a=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(a,n),a.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function S(a){if(a>c)throw new RangeError('The value "'+a+'" is invalid for option "size"');const n=new Uint8Array(a);return Object.setPrototypeOf(n,u.prototype),n}function u(a,n,s){if(typeof a=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return et(a)}return B(a,n,s)}u.poolSize=8192;function B(a,n,s){if(typeof a=="string")return K(a,n);if(ArrayBuffer.isView(a))return Er(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(Xt(a,ArrayBuffer)||a&&Xt(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Xt(a,SharedArrayBuffer)||a&&Xt(a.buffer,SharedArrayBuffer)))return mr(a,n,s);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=a.valueOf&&a.valueOf();if(l!=null&&l!==a)return u.from(l,n,s);const p=E0(a);if(p)return p;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return u.from(a[Symbol.toPrimitive]("string"),n,s);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}u.from=function(a,n,s){return B(a,n,s)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function V(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function y(a,n,s){return V(a),a<=0?S(a):n!==void 0?typeof s=="string"?S(a).fill(n,s):S(a).fill(n):S(a)}u.alloc=function(a,n,s){return y(a,n,s)};function et(a){return V(a),S(a<0?0:gs(a)|0)}u.allocUnsafe=function(a){return et(a)},u.allocUnsafeSlow=function(a){return et(a)};function K(a,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const s=Ti(a,n)|0;let l=S(s);const p=l.write(a,n);return p!==s&&(l=l.slice(0,p)),l}function v(a){const n=a.length<0?0:gs(a.length)|0,s=S(n);for(let l=0;l<n;l+=1)s[l]=a[l]&255;return s}function Er(a){if(Xt(a,Uint8Array)){const n=new Uint8Array(a);return mr(n.buffer,n.byteOffset,n.byteLength)}return v(a)}function mr(a,n,s){if(n<0||a.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<n+(s||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&s===void 0?l=new Uint8Array(a):s===void 0?l=new Uint8Array(a,n):l=new Uint8Array(a,n,s),Object.setPrototypeOf(l,u.prototype),l}function E0(a){if(u.isBuffer(a)){const n=gs(a.length)|0,s=S(n);return s.length===0||a.copy(s,0,0,n),s}if(a.length!==void 0)return typeof a.length!="number"||Cs(a.length)?S(0):v(a);if(a.type==="Buffer"&&Array.isArray(a.data))return v(a.data)}function gs(a){if(a>=c)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+c.toString(16)+" bytes");return a|0}function m0(a){return+a!=a&&(a=0),u.alloc(+a)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,s){if(Xt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),Xt(s,Uint8Array)&&(s=u.from(s,s.offset,s.byteLength)),!u.isBuffer(n)||!u.isBuffer(s))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===s)return 0;let l=n.length,p=s.length;for(let g=0,E=Math.min(l,p);g<E;++g)if(n[g]!==s[g]){l=n[g],p=s[g];break}return l<p?-1:p<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,s){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(s===void 0)for(s=0,l=0;l<n.length;++l)s+=n[l].length;const p=u.allocUnsafe(s);let g=0;for(l=0;l<n.length;++l){let E=n[l];if(Xt(E,Uint8Array))g+E.length>p.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(p,g)):Uint8Array.prototype.set.call(p,E,g);else if(u.isBuffer(E))E.copy(p,g);else throw new TypeError('"list" argument must be an Array of Buffers');g+=E.length}return p};function Ti(a,n){if(u.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||Xt(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const s=a.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&s===0)return 0;let p=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return s;case"utf8":case"utf-8":return ms(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return s*2;case"hex":return s>>>1;case"base64":return Fi(a).length;default:if(p)return l?-1:ms(a).length;n=(""+n).toLowerCase(),p=!0}}u.byteLength=Ti;function C0(a,n,s){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((s===void 0||s>this.length)&&(s=this.length),s<=0)||(s>>>=0,n>>>=0,s<=n))return"";for(a||(a="utf8");;)switch(a){case"hex":return b0(this,n,s);case"utf8":case"utf-8":return Pi(this,n,s);case"ascii":return P0(this,n,s);case"latin1":case"binary":return w0(this,n,s);case"base64":return k0(this,n,s);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return L0(this,n,s);default:if(l)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function Me(a,n,s){const l=a[n];a[n]=a[s],a[s]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let s=0;s<n;s+=2)Me(this,s,s+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let s=0;s<n;s+=4)Me(this,s,s+3),Me(this,s+1,s+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let s=0;s<n;s+=8)Me(this,s,s+7),Me(this,s+1,s+6),Me(this,s+2,s+5),Me(this,s+3,s+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?Pi(this,0,n):C0.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const s=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,s).replace(/(.{2})/g,"$1 ").trim(),this.length>s&&(n+=" ... "),"<Buffer "+n+">"},o&&(u.prototype[o]=u.prototype.inspect),u.prototype.compare=function(n,s,l,p,g){if(Xt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(s===void 0&&(s=0),l===void 0&&(l=n?n.length:0),p===void 0&&(p=0),g===void 0&&(g=this.length),s<0||l>n.length||p<0||g>this.length)throw new RangeError("out of range index");if(p>=g&&s>=l)return 0;if(p>=g)return-1;if(s>=l)return 1;if(s>>>=0,l>>>=0,p>>>=0,g>>>=0,this===n)return 0;let E=g-p,w=l-s;const H=Math.min(E,w),Z=this.slice(p,g),j=n.slice(s,l);for(let q=0;q<H;++q)if(Z[q]!==j[q]){E=Z[q],w=j[q];break}return E<w?-1:w<E?1:0};function ki(a,n,s,l,p){if(a.length===0)return-1;if(typeof s=="string"?(l=s,s=0):s>2147483647?s=2147483647:s<-2147483648&&(s=-2147483648),s=+s,Cs(s)&&(s=p?0:a.length-1),s<0&&(s=a.length+s),s>=a.length){if(p)return-1;s=a.length-1}else if(s<0)if(p)s=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:yi(a,n,s,l,p);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?p?Uint8Array.prototype.indexOf.call(a,n,s):Uint8Array.prototype.lastIndexOf.call(a,n,s):yi(a,[n],s,l,p);throw new TypeError("val must be string, number or Buffer")}function yi(a,n,s,l,p){let g=1,E=a.length,w=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(a.length<2||n.length<2)return-1;g=2,E/=2,w/=2,s/=2}function H(j,q){return g===1?j[q]:j.readUInt16BE(q*g)}let Z;if(p){let j=-1;for(Z=s;Z<E;Z++)if(H(a,Z)===H(n,j===-1?0:Z-j)){if(j===-1&&(j=Z),Z-j+1===w)return j*g}else j!==-1&&(Z-=Z-j),j=-1}else for(s+w>E&&(s=E-w),Z=s;Z>=0;Z--){let j=!0;for(let q=0;q<w;q++)if(H(a,Z+q)!==H(n,q)){j=!1;break}if(j)return Z}return-1}u.prototype.includes=function(n,s,l){return this.indexOf(n,s,l)!==-1},u.prototype.indexOf=function(n,s,l){return ki(this,n,s,l,!0)},u.prototype.lastIndexOf=function(n,s,l){return ki(this,n,s,l,!1)};function B0(a,n,s,l){s=Number(s)||0;const p=a.length-s;l?(l=Number(l),l>p&&(l=p)):l=p;const g=n.length;l>g/2&&(l=g/2);let E;for(E=0;E<l;++E){const w=parseInt(n.substr(E*2,2),16);if(Cs(w))return E;a[s+E]=w}return E}function d0(a,n,s,l){return gn(ms(n,a.length-s),a,s,l)}function D0(a,n,s,l){return gn(U0(n),a,s,l)}function R0(a,n,s,l){return gn(Fi(n),a,s,l)}function T0(a,n,s,l){return gn(N0(n,a.length-s),a,s,l)}u.prototype.write=function(n,s,l,p){if(s===void 0)p="utf8",l=this.length,s=0;else if(l===void 0&&typeof s=="string")p=s,l=this.length,s=0;else if(isFinite(s))s=s>>>0,isFinite(l)?(l=l>>>0,p===void 0&&(p="utf8")):(p=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const g=this.length-s;if((l===void 0||l>g)&&(l=g),n.length>0&&(l<0||s<0)||s>this.length)throw new RangeError("Attempt to write outside buffer bounds");p||(p="utf8");let E=!1;for(;;)switch(p){case"hex":return B0(this,n,s,l);case"utf8":case"utf-8":return d0(this,n,s,l);case"ascii":case"latin1":case"binary":return D0(this,n,s,l);case"base64":return R0(this,n,s,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return T0(this,n,s,l);default:if(E)throw new TypeError("Unknown encoding: "+p);p=(""+p).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function k0(a,n,s){return n===0&&s===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(n,s))}function Pi(a,n,s){s=Math.min(a.length,s);const l=[];let p=n;for(;p<s;){const g=a[p];let E=null,w=g>239?4:g>223?3:g>191?2:1;if(p+w<=s){let H,Z,j,q;switch(w){case 1:g<128&&(E=g);break;case 2:H=a[p+1],(H&192)===128&&(q=(g&31)<<6|H&63,q>127&&(E=q));break;case 3:H=a[p+1],Z=a[p+2],(H&192)===128&&(Z&192)===128&&(q=(g&15)<<12|(H&63)<<6|Z&63,q>2047&&(q<55296||q>57343)&&(E=q));break;case 4:H=a[p+1],Z=a[p+2],j=a[p+3],(H&192)===128&&(Z&192)===128&&(j&192)===128&&(q=(g&15)<<18|(H&63)<<12|(Z&63)<<6|j&63,q>65535&&q<1114112&&(E=q))}}E===null?(E=65533,w=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),p+=w}return y0(l)}const wi=4096;function y0(a){const n=a.length;if(n<=wi)return String.fromCharCode.apply(String,a);let s="",l=0;for(;l<n;)s+=String.fromCharCode.apply(String,a.slice(l,l+=wi));return s}function P0(a,n,s){let l="";s=Math.min(a.length,s);for(let p=n;p<s;++p)l+=String.fromCharCode(a[p]&127);return l}function w0(a,n,s){let l="";s=Math.min(a.length,s);for(let p=n;p<s;++p)l+=String.fromCharCode(a[p]);return l}function b0(a,n,s){const l=a.length;(!n||n<0)&&(n=0),(!s||s<0||s>l)&&(s=l);let p="";for(let g=n;g<s;++g)p+=F0[a[g]];return p}function L0(a,n,s){const l=a.slice(n,s);let p="";for(let g=0;g<l.length-1;g+=2)p+=String.fromCharCode(l[g]+l[g+1]*256);return p}u.prototype.slice=function(n,s){const l=this.length;n=~~n,s=s===void 0?l:~~s,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),s<0?(s+=l,s<0&&(s=0)):s>l&&(s=l),s<n&&(s=n);const p=this.subarray(n,s);return Object.setPrototypeOf(p,u.prototype),p};function it(a,n,s){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+n>s)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||it(n,s,this.length);let p=this[n],g=1,E=0;for(;++E<s&&(g*=256);)p+=this[n+E]*g;return p},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||it(n,s,this.length);let p=this[n+--s],g=1;for(;s>0&&(g*=256);)p+=this[n+--s]*g;return p},u.prototype.readUint8=u.prototype.readUInt8=function(n,s){return n=n>>>0,s||it(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,s){return n=n>>>0,s||it(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,s){return n=n>>>0,s||it(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,s){return n=n>>>0,s||it(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,s){return n=n>>>0,s||it(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=Ie(function(n){n=n>>>0,je(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Cr(n,this.length-8);const p=s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,g=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(p)+(BigInt(g)<<BigInt(32))}),u.prototype.readBigUInt64BE=Ie(function(n){n=n>>>0,je(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Cr(n,this.length-8);const p=s*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],g=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(p)<<BigInt(32))+BigInt(g)}),u.prototype.readIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||it(n,s,this.length);let p=this[n],g=1,E=0;for(;++E<s&&(g*=256);)p+=this[n+E]*g;return g*=128,p>=g&&(p-=Math.pow(2,8*s)),p},u.prototype.readIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||it(n,s,this.length);let p=s,g=1,E=this[n+--p];for(;p>0&&(g*=256);)E+=this[n+--p]*g;return g*=128,E>=g&&(E-=Math.pow(2,8*s)),E},u.prototype.readInt8=function(n,s){return n=n>>>0,s||it(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,s){n=n>>>0,s||it(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,s){n=n>>>0,s||it(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,s){return n=n>>>0,s||it(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,s){return n=n>>>0,s||it(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=Ie(function(n){n=n>>>0,je(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Cr(n,this.length-8);const p=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(p)<<BigInt(32))+BigInt(s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=Ie(function(n){n=n>>>0,je(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&Cr(n,this.length-8);const p=(s<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(p)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,s){return n=n>>>0,s||it(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,s){return n=n>>>0,s||it(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,s){return n=n>>>0,s||it(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,s){return n=n>>>0,s||it(n,8,this.length),r.read(this,n,!1,52,8)};function pt(a,n,s,l,p,g){if(!u.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>p||n<g)throw new RangeError('"value" argument is out of bounds');if(s+l>a.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,s,l,p){if(n=+n,s=s>>>0,l=l>>>0,!p){const w=Math.pow(2,8*l)-1;pt(this,n,s,l,w,0)}let g=1,E=0;for(this[s]=n&255;++E<l&&(g*=256);)this[s+E]=n/g&255;return s+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,s,l,p){if(n=+n,s=s>>>0,l=l>>>0,!p){const w=Math.pow(2,8*l)-1;pt(this,n,s,l,w,0)}let g=l-1,E=1;for(this[s+g]=n&255;--g>=0&&(E*=256);)this[s+g]=n/E&255;return s+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,1,255,0),this[s]=n&255,s+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,2,65535,0),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,2,65535,0),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,4,4294967295,0),this[s+3]=n>>>24,this[s+2]=n>>>16,this[s+1]=n>>>8,this[s]=n&255,s+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,4,4294967295,0),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4};function bi(a,n,s,l,p){Ni(n,l,p,a,s,7);let g=Number(n&BigInt(4294967295));a[s++]=g,g=g>>8,a[s++]=g,g=g>>8,a[s++]=g,g=g>>8,a[s++]=g;let E=Number(n>>BigInt(32)&BigInt(4294967295));return a[s++]=E,E=E>>8,a[s++]=E,E=E>>8,a[s++]=E,E=E>>8,a[s++]=E,s}function Li(a,n,s,l,p){Ni(n,l,p,a,s,7);let g=Number(n&BigInt(4294967295));a[s+7]=g,g=g>>8,a[s+6]=g,g=g>>8,a[s+5]=g,g=g>>8,a[s+4]=g;let E=Number(n>>BigInt(32)&BigInt(4294967295));return a[s+3]=E,E=E>>8,a[s+2]=E,E=E>>8,a[s+1]=E,E=E>>8,a[s]=E,s+8}u.prototype.writeBigUInt64LE=Ie(function(n,s=0){return bi(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=Ie(function(n,s=0){return Li(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,s,l,p){if(n=+n,s=s>>>0,!p){const H=Math.pow(2,8*l-1);pt(this,n,s,l,H-1,-H)}let g=0,E=1,w=0;for(this[s]=n&255;++g<l&&(E*=256);)n<0&&w===0&&this[s+g-1]!==0&&(w=1),this[s+g]=(n/E>>0)-w&255;return s+l},u.prototype.writeIntBE=function(n,s,l,p){if(n=+n,s=s>>>0,!p){const H=Math.pow(2,8*l-1);pt(this,n,s,l,H-1,-H)}let g=l-1,E=1,w=0;for(this[s+g]=n&255;--g>=0&&(E*=256);)n<0&&w===0&&this[s+g+1]!==0&&(w=1),this[s+g]=(n/E>>0)-w&255;return s+l},u.prototype.writeInt8=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,1,127,-128),n<0&&(n=255+n+1),this[s]=n&255,s+1},u.prototype.writeInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,2,32767,-32768),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,2,32767,-32768),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,4,2147483647,-2147483648),this[s]=n&255,this[s+1]=n>>>8,this[s+2]=n>>>16,this[s+3]=n>>>24,s+4},u.prototype.writeInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||pt(this,n,s,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4},u.prototype.writeBigInt64LE=Ie(function(n,s=0){return bi(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=Ie(function(n,s=0){return Li(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Mi(a,n,s,l,p,g){if(s+l>a.length)throw new RangeError("Index out of range");if(s<0)throw new RangeError("Index out of range")}function _i(a,n,s,l,p){return n=+n,s=s>>>0,p||Mi(a,n,s,4),r.write(a,n,s,l,23,4),s+4}u.prototype.writeFloatLE=function(n,s,l){return _i(this,n,s,!0,l)},u.prototype.writeFloatBE=function(n,s,l){return _i(this,n,s,!1,l)};function Oi(a,n,s,l,p){return n=+n,s=s>>>0,p||Mi(a,n,s,8),r.write(a,n,s,l,52,8),s+8}u.prototype.writeDoubleLE=function(n,s,l){return Oi(this,n,s,!0,l)},u.prototype.writeDoubleBE=function(n,s,l){return Oi(this,n,s,!1,l)},u.prototype.copy=function(n,s,l,p){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!p&&p!==0&&(p=this.length),s>=n.length&&(s=n.length),s||(s=0),p>0&&p<l&&(p=l),p===l||n.length===0||this.length===0)return 0;if(s<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(p<0)throw new RangeError("sourceEnd out of bounds");p>this.length&&(p=this.length),n.length-s<p-l&&(p=n.length-s+l);const g=p-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(s,l,p):Uint8Array.prototype.set.call(n,this.subarray(l,p),s),g},u.prototype.fill=function(n,s,l,p){if(typeof n=="string"){if(typeof s=="string"?(p=s,s=0,l=this.length):typeof l=="string"&&(p=l,l=this.length),p!==void 0&&typeof p!="string")throw new TypeError("encoding must be a string");if(typeof p=="string"&&!u.isEncoding(p))throw new TypeError("Unknown encoding: "+p);if(n.length===1){const E=n.charCodeAt(0);(p==="utf8"&&E<128||p==="latin1")&&(n=E)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(s<0||this.length<s||this.length<l)throw new RangeError("Out of range index");if(l<=s)return this;s=s>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let g;if(typeof n=="number")for(g=s;g<l;++g)this[g]=n;else{const E=u.isBuffer(n)?n:u.from(n,p),w=E.length;if(w===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(g=0;g<l-s;++g)this[g+s]=E[g%w]}return this};const He={};function Es(a,n,s){He[a]=class extends s{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(p){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:p,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}Es("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Es("ERR_INVALID_ARG_TYPE",function(a,n){return`The "${a}" argument must be of type number. Received type ${typeof n}`},TypeError),Es("ERR_OUT_OF_RANGE",function(a,n,s){let l=`The value of "${a}" is out of range.`,p=s;return Number.isInteger(s)&&Math.abs(s)>2**32?p=Ui(String(s)):typeof s=="bigint"&&(p=String(s),(s>BigInt(2)**BigInt(32)||s<-(BigInt(2)**BigInt(32)))&&(p=Ui(p)),p+="n"),l+=` It must be ${n}. Received ${p}`,l},RangeError);function Ui(a){let n="",s=a.length;const l=a[0]==="-"?1:0;for(;s>=l+4;s-=3)n=`_${a.slice(s-3,s)}${n}`;return`${a.slice(0,s)}${n}`}function M0(a,n,s){je(n,"offset"),(a[n]===void 0||a[n+s]===void 0)&&Cr(n,a.length-(s+1))}function Ni(a,n,s,l,p,g){if(a>s||a<n){const E=typeof n=="bigint"?"n":"";let w;throw n===0||n===BigInt(0)?w=`>= 0${E} and < 2${E} ** ${(g+1)*8}${E}`:w=`>= -(2${E} ** ${(g+1)*8-1}${E}) and < 2 ** ${(g+1)*8-1}${E}`,new He.ERR_OUT_OF_RANGE("value",w,a)}M0(l,p,g)}function je(a,n){if(typeof a!="number")throw new He.ERR_INVALID_ARG_TYPE(n,"number",a)}function Cr(a,n,s){throw Math.floor(a)!==a?(je(a,s),new He.ERR_OUT_OF_RANGE("offset","an integer",a)):n<0?new He.ERR_BUFFER_OUT_OF_BOUNDS:new He.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,a)}const _0=/[^+/0-9A-Za-z-_]/g;function O0(a){if(a=a.split("=")[0],a=a.trim().replace(_0,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function ms(a,n){n=n||1/0;let s;const l=a.length;let p=null;const g=[];for(let E=0;E<l;++E){if(s=a.charCodeAt(E),s>55295&&s<57344){if(!p){if(s>56319){(n-=3)>-1&&g.push(239,191,189);continue}else if(E+1===l){(n-=3)>-1&&g.push(239,191,189);continue}p=s;continue}if(s<56320){(n-=3)>-1&&g.push(239,191,189),p=s;continue}s=(p-55296<<10|s-56320)+65536}else p&&(n-=3)>-1&&g.push(239,191,189);if(p=null,s<128){if((n-=1)<0)break;g.push(s)}else if(s<2048){if((n-=2)<0)break;g.push(s>>6|192,s&63|128)}else if(s<65536){if((n-=3)<0)break;g.push(s>>12|224,s>>6&63|128,s&63|128)}else if(s<1114112){if((n-=4)<0)break;g.push(s>>18|240,s>>12&63|128,s>>6&63|128,s&63|128)}else throw new Error("Invalid code point")}return g}function U0(a){const n=[];for(let s=0;s<a.length;++s)n.push(a.charCodeAt(s)&255);return n}function N0(a,n){let s,l,p;const g=[];for(let E=0;E<a.length&&!((n-=2)<0);++E)s=a.charCodeAt(E),l=s>>8,p=s%256,g.push(p),g.push(l);return g}function Fi(a){return e.toByteArray(O0(a))}function gn(a,n,s,l){let p;for(p=0;p<l&&!(p+s>=n.length||p>=a.length);++p)n[p+s]=a[p];return p}function Xt(a,n){return a instanceof n||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===n.name}function Cs(a){return a!==a}const F0=function(){const a="0123456789abcdef",n=new Array(256);for(let s=0;s<16;++s){const l=s*16;for(let p=0;p<16;++p)n[l+p]=a[s]+a[p]}return n}();function Ie(a){return typeof BigInt>"u"?x0:a}function x0(){throw new Error("BigInt not supported")}})(It);const Gi=!1,Ji=30,$e=256,Oe=383,ve=256*$e,$t=256*Oe;var O=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(O||{}),ut=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t))(ut||{}),N=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.MOUSEEVENT=15]="MOUSEEVENT",t[t.PASTE_TEXT=16]="PASTE_TEXT",t[t.APPLE_PRESS=17]="APPLE_PRESS",t[t.APPLE_RELEASE=18]="APPLE_RELEASE",t[t.GET_SAVE_STATE=19]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=20]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=21]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=22]="DRIVE_NEW_DATA",t[t.GAMEPAD=23]="GAMEPAD",t[t.SET_BINARY_BLOCK=24]="SET_BINARY_BLOCK",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RamWorks=28]="RamWorks",t[t.SOFTSWITCHES=29]="SOFTSWITCHES",t))(N||{}),ds=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t))(ds||{}),Se=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Se||{}),i=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(i||{});const Vi=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Cn=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",G=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),ze=t=>t.split("").map(e=>e.charCodeAt(0)),Hi=t=>[t&255,t>>>8&255],Ds=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Rs=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},Bn=new Uint32Array(256).fill(0),ji=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;Bn[e]=t}},$i=(t,e=0)=>{Bn[255]===0&&ji();let r=-1;for(let o=e;o<t.length;o++)r=r>>>8^Bn[(r^t[o])&255];return(r^-1)>>>0},vi=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7);let yt;const ge=Math.trunc(.0028*1020484);let dn=ge/2,Dn=ge/2,Br=ge/2,dr=ge/2,Ts=0,ks=!1,ys=!1,Rn=!1,Tn=!1,Dr=!1,Ps=!1,ws=!1;const kn=()=>{Rn=!0},bs=()=>{Tn=!0},zi=()=>{Dr=!0},Rr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*ge/2),Ls=t=>{dn=Rr(t)},Ms=t=>{Dn=Rr(t)},_s=t=>{Br=Rr(t)},Os=t=>{dr=Rr(t)},yn=()=>{Ps=ks||Rn,ws=ys||Tn,m.PB0.isSet=Ps,m.PB1.isSet=ws||Dr,m.PB2.isSet=Dr},Us=(t,e)=>{e?ks=t:ys=t,yn()},ta=t=>{$(49252,128),$(49253,128),$(49254,128),$(49255,128),Ts=t},Tr=t=>{const e=t-Ts;$(49252,e<dn?128:0),$(49253,e<Dn?128:0),$(49254,e<Br?128:0),$(49255,e<dr?128:0)};let Ee,Pn,Ns=!1;const ea=t=>{yt=t,Ns=!yt.length||!yt[0].buttons.length,Ee=Ba(),Pn=Ee.gamepad?Ee.gamepad:ma},Fs=t=>t>-.01&&t<.01,xs=(t,e)=>{Fs(t)&&(t=0),Fs(e)&&(e=0);const r=Math.sqrt(t*t+e*e),o=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-o,t),o),e=Math.min(Math.max(-o,e),o),t=Math.trunc(ge*(t+o)/(2*o)),e=Math.trunc(ge*(e+o)/(2*o)),[t,e]},ra=t=>{const[e,r]=xs(t[0],t[1]),o=t.length>=6?t[5]:t[3],[c,f]=t.length>=4?xs(t[2],o):[0,0];return[e,r,c,f]},Qs=t=>{const e=Ee.joystick?Ee.joystick(yt[t].axes,Ns):yt[t].axes,r=ra(e);t===0?(dn=r[0],Dn=r[1],Rn=!1,Tn=!1,Br=r[2],dr=r[3]):(Br=r[0],dr=r[1],Dr=!1);let o=!1;yt[t].buttons.forEach((c,f)=>{c&&(Pn(f,yt.length>1,t===1),o=!0)}),o||Pn(-1,yt.length>1,t===1),Ee.rumble&&Ee.rumble(),yn()},na=()=>{yt&&yt.length>0&&(Qs(0),yt.length>1&&Qs(1))},sa=t=>{switch(t){case 0:U("JL");break;case 1:U("G",200);break;case 2:Q("M"),U("O");break;case 3:U("L");break;case 4:U("F");break;case 5:Q("P"),U("T");break;case 6:break;case 7:break;case 8:U("Z");break;case 9:{const e=fo();e.includes("'N'")?Q("N"):e.includes("'S'")?Q("S"):e.includes("NUMERIC KEY")?Q("1"):Q("N");break}case 10:break;case 11:break;case 12:U("L");break;case 13:U("M");break;case 14:U("A");break;case 15:U("D");break;case-1:return}};let me=0,Ce=0,Be=!1;const kr=.5,oa={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-kr?(Ce=0,me===0||me>2?(me=0,Q("A")):me===1&&Be?U("W"):me===2&&Be&&U("R"),me++,Be=!1,t):t[0]>kr?(me=0,Ce===0||Ce>2?(Ce=0,Q("D")):Ce===1&&Be?U("W"):Ce===2&&Be&&U("R"),Ce++,Be=!1,t):t[1]<-kr?(U("C"),t):t[1]>kr?(U("S"),t):(Be=!0,t),gamepad:sa,rumble:null,setup:null,helptext:`AZTEC
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
`},ia={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:Q(" ");break;case 12:Q("A");break;case 13:Q("Z");break;case 14:Q("\b");break;case 15:Q("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},aa={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let wn=14,bn=14;const ca={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=C(182,!1);wn<40&&t<wn&&Sn({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),wn=t,t=C(183,!1),bn<40&&t<bn&&Sn({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),bn=t},setup:null,helptext:`KARATEKA
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
`},Aa=t=>{switch(t){case 0:U("A");break;case 1:U("C",50);break;case 2:U("O");break;case 3:U("T");break;case 4:U("\x1B");break;case 5:U("\r");break;case 6:break;case 7:break;case 8:Q("N"),U("'");break;case 9:Q("Y"),U("1");break;case 10:break;case 11:break;case 12:break;case 13:U(" ");break;case 14:break;case 15:U("	");break;case-1:return}},vt=.5,la={address:768,data:[141,74,3,132],keymap:{},gamepad:Aa,joystick:(t,e)=>{if(e)return t;const r=t[0]<-vt?"\b":t[0]>vt?"":"",o=t[1]<-vt?"\v":t[1]>vt?`
`:"";let c=r+o;return c||(c=t[2]<-vt?"L\b":t[2]>vt?"L":"",c||(c=t[3]<-vt?"L\v":t[3]>vt?`L
`:"")),c&&U(c,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},ua={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},fa={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},ha={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{C(14799,!1)===255&&Sn({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{d(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},Xs=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,pa=t=>{switch(t){case 1:d(109,255);break;case 12:Q("A");break;case 13:Q("Z");break;case 14:Q("\b");break;case 15:Q("");break}},yr=.75,Ia=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{d(25025,173),d(25036,64)},helptext:Xs},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-yr?"\b":t[0]>yr?"":t[1]<-yr?"A":t[1]>yr?"Z":"";return e&&Q(e),t},gamepad:pa,rumble:null,setup:null,helptext:Xs}],Sa={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{Di(1)},helptext:`Ultima V: Warriors of Destiny
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

`},ga={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Ea={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:kn();break;case 1:bs();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U("T");break;case 9:{const e=fo();e.includes("'N'")?Q("N"):e.includes("'S'")?Q("S"):e.includes("NUMERIC KEY")?Q("1"):Q("N");break}case 10:kn();break}},rumble:()=>{C(49178,!1)<128&&C(49181,!1)<128&&Sn({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{d(5128,0),d(5130,4);let t=5210;d(t,234),d(t+1,234),d(t+2,234),t=5224,d(t,234),d(t+1,234),d(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},tr=new Array,dt=t=>{Array.isArray(t)?tr.push(...t):tr.push(t)};dt(oa),dt(ia),dt(aa),dt(ca),dt(la),dt(ua),dt(fa),dt(ha),dt(Ia),dt(Sa),dt(ga),dt(Ea);const ma=(t,e,r)=>{if(r)switch(t){case 0:zi();break;case 1:break;case 12:Os(-1);break;case 13:Os(1);break;case 14:_s(-1);break;case 15:_s(1);break}else switch(t){case 0:kn();break;case 1:e||bs();break;case 12:Ms(-1);break;case 13:Ms(1);break;case 14:Ls(-1);break;case 15:Ls(1);break}},Ca={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},Ys=t=>{for(const e of tr)if(Zn(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},Ba=()=>{for(const t of tr)if(Zn(t.address,t.data))return t;return Ca},Pr=(t=!1)=>{for(const e of tr)if(Zn(e.address,e.data)){di(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(di(" "),Di(0))},da=t=>{$(49152,t|128,32)},Da=()=>{const t=Re(49152)&127;$(49152,t,32)};let de="",Ks=1e9;const Ra=()=>{const t=performance.now();if(de!==""&&(Re(49152)<128||t-Ks>1500)){Ks=t;const e=de.charCodeAt(0);da(e),de=de.slice(1),de.length===0&&pi(!0)}};let qs="";const Q=t=>{t===qs&&de.length>0||(qs=t,de+=t)};let Ws=0;const U=(t,e=300)=>{const r=performance.now();r-Ws<e||(Ws=r,Q(t))},Ta=t=>{t.length===1&&(t=Ys(t)),Q(t)},Zs=t=>{t.length===1&&(t=Ys(t)),Q(t)},Ue=[],k=(t,e,r,o=!1,c=null)=>{const f={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:o,isSet:!1,setFunc:c};return t>=49152&&(Ue[t-49152]=f),e>=49152&&(Ue[e-49152]=f),r>=49152&&(Ue[r-49152]=f),f},Ne=()=>Math.floor(256*Math.random()),ka=(t,e)=>{t&=11,e?m.BSR_PREWRITE.isSet=!1:t&1?m.BSR_PREWRITE.isSet?m.BSR_WRITE.isSet=!0:m.BSR_PREWRITE.isSet=!0:(m.BSR_PREWRITE.isSet=!1,m.BSR_WRITE.isSet=!1),m.BSRBANK2.isSet=t<=3,m.BSRREADRAM.isSet=[0,3,8,11].includes(t)},m={STORE80:k(49152,49153,49176,!0),RAMRD:k(49154,49155,49171,!0),RAMWRT:k(49156,49157,49172,!0),INTCXROM:k(49158,49159,49173,!0),INTC8ROM:k(49194,0,0),ALTZP:k(49160,49161,49174,!0),SLOTC3ROM:k(49162,49163,49175,!0),COLUMN80:k(49164,49165,49183,!0),ALTCHARSET:k(49166,49167,49182,!0),KBRDSTROBE:k(49168,0,0,!1),BSRBANK2:k(0,0,49169),BSRREADRAM:k(0,0,49170),VBL:k(0,0,49177),CASSOUT:k(49184,0,0),SPEAKER:k(49200,0,0,!1,(t,e)=>{$(49200,Ne()),f0(e)}),GCSTROBE:k(49216,0,0),EMUBYTE:k(0,0,49231,!1,()=>{$(49231,205)}),TEXT:k(49232,49233,49178),MIXED:k(49234,49235,49179),PAGE2:k(49236,49237,49180),HIRES:k(49238,49239,49181),AN0:k(49240,49241,0),AN1:k(49242,49243,0),AN2:k(49244,49245,0),AN3:k(49246,49247,0),CASSIN1:k(0,0,49248,!1,()=>{$(49248,Ne())}),PB0:k(0,0,49249),PB1:k(0,0,49250),PB2:k(0,0,49251),JOYSTICK0:k(0,0,49252,!1,(t,e)=>{Tr(e)}),JOYSTICK1:k(0,0,49253,!1,(t,e)=>{Tr(e)}),JOYSTICK2:k(0,0,49254,!1,(t,e)=>{Tr(e)}),JOYSTICK3:k(0,0,49255,!1,(t,e)=>{Tr(e)}),CASSIN2:k(0,0,49256,!1,()=>{$(49256,Ne())}),FASTCHIP_LOCK:k(49258,0,0),FASTCHIP_ENABLE:k(49259,0,0),FASTCHIP_SPEED:k(49261,0,0),JOYSTICKRESET:k(0,0,49264,!1,(t,e)=>{ta(e),$(49264,Ne())}),BANKSEL:k(49267,0,0),LASER128EX:k(49268,0,0),BSR_PREWRITE:k(49280,0,0),BSR_WRITE:k(49288,0,0)};m.TEXT.isSet=!0;const ya=[49152,49153,49165,49167,49200,49236,49237,49183],Gs=(t,e,r)=>{if(t>1048575&&!ya.includes(t)){const c=Re(t)>128?1:0;console.log(`${r} $${G(A.PC)}: $${G(t)} [${c}] ${e?"write":""}`)}if(t>=49280&&t<=49295){ka(t&-5,e);return}const o=Ue[t-49152];if(!o){console.error("Unknown softswitch "+G(t)),$(t,Ne());return}if(t<=49167?e||Ra():(t===49168||t<=49183&&e)&&Da(),o.setFunc){o.setFunc(t,r);return}if(t===o.offAddr||t===o.onAddr){if((!o.writeOnly||e)&&(Mt[o.offAddr-49152]!==void 0?Mt[o.offAddr-49152]=t===o.onAddr:o.isSet=t===o.onAddr),o.isSetAddr){const c=Re(o.isSetAddr);$(o.isSetAddr,o.isSet?c|128:c&127)}t>=49184&&$(t,Ne())}else if(t===o.isSetAddr){const c=Re(t);$(t,o.isSet?c|128:c&127)}},Pa=()=>{for(const t in m){const e=t;Mt[m[e].offAddr-49152]!==void 0?Mt[m[e].offAddr-49152]=!1:m[e].isSet=!1}Mt[m.TEXT.offAddr-49152]!==void 0?Mt[m.TEXT.offAddr-49152]=!0:m.TEXT.isSet=!0},Mt=[],wa=t=>{const e=Ue[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+G(t));return}Mt[e.offAddr-49152]===void 0&&(Mt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},ba=()=>{Mt.forEach((t,e)=>{t!==void 0&&(Ue[e].isSet=t)}),Mt.length=0},Js=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAEwTwqQkpSVIIAPOIPTBoABoaQDFI5DwsDSlIoUloACE
JPDkpSJIIAPOpSiFKqUphSukIYhoaQHFI7ANSCADzrEokSqIEPkw4aAAIPTBpSVM
A86pKIUhqRiFI6kXhSXQ76QqTPTBTOvLTJrMpCpMncxMdMxMoMJMsMJM8sIgkMyt
ewWFJI17BEz+zbQA8A/AG/AOIIDNtADwBKn9lQG1AWClN8nD0PNMMsikJLEoSCk/
CUCRKGhgqKUoILrKkEwgFM6gA9nuwtADuaTJiBD1MDogcMhMCsKKKQOFL6UqKY9M
ccog8PyKhTRgrHsFIETOCYBgpCSpoCwewBAGJDIwAqkgTKjMqKUoIAPOKDADTMX+
TMj+iDC6iDCliDCaiDA9iDDiqcJIqQlIrfsEKdbQDZgYaQxIIFDIIP7NaKipwUi5
RMJIYBgi8V91AqhR4ZTo1XtkZ2p1b3hy4Yno1SwfwBAGIHTITArCqIpImEhIaMn/
8ASp/9ACaEhIpCSRKOZO0AqlT+ZPRU8pQNDirQDAEO1oaKQkkShoqq0AwI0QwDDE
IFLBLB/AEAIGIaUljfsFYKn/jfsErV3ArV/ArWLAEANMAMatYcAQGqCwqQCFPKm/
OIU9SKmgkTyIkTxo6QHJAdDvjQvAIInK0AONCsBgiJWKi6QksSgsH8Aw8kwmzgAA
LEPOcBI4kBi4UAwBiEpQVlxMdsNMw8ONewaYSIpICK37BCz4BzAFCQiN+wQgbcMo
cBWQEKoQDSBbzWiqaKitewZsOABMfMhMA8ggbcNMtMkgbcNM1skgbcNM8Mmq8AjK
0AcsAMAQBDhgogMYYKLDjvgHrv/PYEiYSK0TwEitFMBIkAiNAsCNBcCwBo0EwI0D
wKAAsTyRQuZC0ALmQ6U8xT6lPeU/5jzQAuY9kOaNBMBoEAONBcCNAsBoEAONA8Bo
qGhgSK3tA0it7gNIkAiNA8CNBcCwBo0CwI0EwGiN7gNoje0DaHAFjQjAUAONCcBs
7QMAAI2BwEx6/CwVwI0HwNg4MAEYSEhIirro6OjoSJhIvQABKRCorRjALRzAKYDw
BakgjVTAKiwTwBAFjQLACSAsFMAQBY0EwAkQLBLAEAwJDCwRwBACSQaNgcAsFsAQ
DbqOAQGuAAGajQjACYCIMAyFRGioaKpoaGhMR/pIrfgHSKnDSKn0SAhMdPytgcBo
EAeNCcCuAQGaoAYQBr7BxP4AwIgwAwrQ8goKaKi6qUBIqcBIqQZpAEipjUiaimkD
qjjpB50AAeipAZ0AAWiqaGCDi4sFA1UAIBP/hDTdtPnQEyAT/926+fANvbr58AfJ
pPADpDQYiCZE4APQDSCn/6U/8AHohjWiA4iGPcoQyWCQSKkAhT2FP6BQhDzIhD4g
0cUYpXOqyoY+5VBIpXSo6NABiIQ/5VHFbpAC0AI4YIV0hXCFPYXpaIXohXOFb4U8
IJjFqQMg1sUYYKWbZVCFPqWcZVGFP6AEsZsg7+CllIU8pZWFPRhgoEsgecXQ+Wn+
sPWgISB5xcjIiND9kAWgMojQ/awgwKAsymCiCEggmMVoKqA6ytD1YCCbxYitYMBF
LxD4RS+FL8CAYCBnxaAnogBBPEihPCDIxSC6/KAdaJDuoCIgyMXwCKIQCiB0xdD6
YCCYxakWIGfFhS4gmMWgJCCbxbD5IJvFoDsgisWBPEUuhS4guvygNZDwIIrFxS5g
jVDAoASiABh5tMeVAOjQ9xh5tMfVANAQ6ND1aiwZwBACSaWIEOEwBlUAGEzNxoYB
hgKGA6IEhgTmAaiNg8CNg8ClASnwycDQDK2LwK2LwKUBaQ/QAqUBhQOYoAAYfbTH
kQLKEAKiBMjQ8uYB0MzmAaitg8Ctg8ClASnwycDQCa2LwKUBaQ/QAqUBhQOYoAAY
fbTHUQLQNbECyhACogTI0O7mAdDLaiwZwBACSaXGBBCHqiCNydAHDgAMCs0ADNB2
zQAI8HGKjQnATAPGOKqtE8C4EAMstMepoKAGmf6/mQbAiIjQ9o1RwI1UwJkABJkA
BZkABpkAB8jQ8YrwJ6ADsAKgBamqUAONsAW56seZsQWIEPegEIpKqqlYKpm2BYiI
0PPw/qACufDHkAO588eZuAWIEPIw/qABqX9qvrnH8A+QA77Jx53/v8jQ764wwCqI
vtnH8BMw9CqQBx4AwJAXsO4eAMCwEJDnKsg46QGwy4jQC6AJ0MKiAMAKTNfGRoDQ
tamgoACZAASZAAWZAAaZAAfI0PGtYcAtYsAK5v+l/5ADTADGrVHAoAi59seZuAWI
EPcw4FNDKykHAIkxAwUJCwEAg1FTVVcPDQCBMQQGCgwCAIRSVFZYEA4AEf8TFBYX
GAASGhscHR4fANLBzaDa0M3N1cnP1dP58/Tl7aDPywBMsMkg9M4gKsggLs2pAY37
BCCQytAIBiGNAcCNDcCND8AgkMysewVMfsipB4U2qcOFN6kFhTipw4U5YOZO0ALm
T60AwBD1jRDAYAAAAExQw6UljfsFpCTMewTwA4x7BaUhGO17BbAFoACMewWsewVg
pDUYsDiNewaYSIpIsF4gUMitewbJjdAYrgDAEBPgk9APLBDArgDAEPvgg/ADLBDA
KX/JILAGINLKTL3IrXsGIDjOyIx7BcQhkAMgUcut+wQp9437BK17BSwfwBACqQCF
JI17BGiqaKitewZgpCStewaRKCBQyCAmziA7yI17BiAmzqit+wQpCPDLwI3QCK37
BCn3jfsEwJvwEcCV0LesewUgRM4JgI17BtCqILHOIDvIIMTOIBTOKX+gENl8yfAF
iBD4MA+5a8kpfyDWyrlryTDZEKKorfsEwBHQCyBNzamYjXsGTMXIwAXQCCnfjfsE
TObIwATQ+Qkg0PIMHAgKHx0Ln4icihESiIqfnEBBQkNERUZJSktNNDgICgsVLBPA
MBGp7o0FwI0DwI0ADI0ACM0ADGDKy83JAACtewZMVsOpg9ACqYFIIJDK8ARooglg
aI37BI0BwI0NwI0PwCDUziCQzEwfyiDUziA7yCl/jXsGogCt+wQpAvACosOtewZg
KX+qINTOqQgs+wTQMoosLsrwUKx7BSQyEAIJgCBwzsiMewXEIZAIqQCNewUg2Mul
KI17B6UpjfsHIB/OogBgIB/OijjpICz7BjAwjfsFhSUgusqt+waNewWp9y37BI37
BNDMIB/Oiske8AYg1spMH8qpCA37BI37BKn/jfsGTCnKqqUqoAPgivALSpAISkoJ
IIjQ+siI0PJgILf40ALIYK0cwAqpiCwYwI0BwAiNVcCsAASNAAStAASMAAQosAON
VMAwA40AwMmIYEhKKQMJBIUpaCkYkAJpf4UoCgoFKIUoYCwGy1C4jXsHSJhIrHsH
wAWQE7m0y/AOUBIwEI17B637BCko8AM4sAmtewcJgCAHyxhoqGhgSLmZy0hgrfsE
EAUp7437BGCt+wQQ+gkQ0POpQCA0y6DAqQwgNMutMMCI0PVgOEjpAdD8aOkB0PZg
znsFEAulIY17Bc57BSB5y2CpAI17Ba37BDADINjLYKUihSWpAI17BUz+ze57Ba17
BcUhkAMgUctgpSLFJbAexiVM/s2t+wQQAin7oP/QCa37BBACCQSgf437BIQyYAwX
ID8A13OPUIOOAOn7AABM0+o8XpVDapkAeEtLy8sAy0xMy0tLAExMAABNS0tNS0xN
S0wAS6AA8BXmJaUljfsFxSOwA0wDzs77BcYloAGKSIx7B6UhSCwfwBAcjQHASqql
IEq4kAMsBssqRSFKcAOwAcqGIa0fwAimIpjQA6YjyoogA86lKIUqpSmFK617B/Ay
6OQjsDKKIAPOpCEoCBAerVXAmPAHsSiRKojQ+XAEsSiRKq1UwKQhsASxKJEqiBD5
MMHK5CIQzihohSEglswg/s1oqmAgmsylJUgQBiADziCWzOYlpSXFI5DyaIUlTP7N
IF/LTHTMoADwA6x7BaUyKYAJICwfwDAVkSjIxCGQ+WCGKqLYoBSlMimgTNXMhipI
mEg45SGqmEqoaEUgarADEAHIaLALLFXAkSgsVMDo8AaRKMjo0O+mKjhgrfsEME0g
Mc0sH8AQEiCRzZANIJDK0DssH8AwAyDEza17BRhlICwfwDAGySiQAqknjXsFhSSl
JSC6yiwfwBAFIHHN8AMgbc2pACwawDACqRSFImCt+wQJAdAFrfsEKf6N+wRgrfsE
MBogLs0ggM0gZM2p/YU5qRuFOGCp/YU3qfCFNmCpKNACqVCFIakYhSOpAIUihSBg
LB/AEAMg78yNDsCp/437BGCKSKIXjQHAiiC6yqAnhCqYSrADLFXAqLEoLFTApCqR
KIgQ6sowBOQisN2NAMCNDMBM+M2KSKIXiiC6yqAAjQHAsSiEKkiYSrADjVXAqGiR
KI1UwKQqyMAokOYgsMzKMATkIrDTjQ3AIP7NaKpgpSWN+wUgusqlICwfwBABShhl
KIUoYMnhkAbJ+7ACKd9grfsEKRDQEUiYSKx7BSBEzkmAIHDOaKhoYEgkMjACKX8g
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
g39dzLX8Fxf1A/sDYvr6ww==`,Vs=new Array(256),Ln={},I=(t,e,r,o)=>{console.assert(!Vs[r],"Duplicate instruction: "+t+" mode="+e),Vs[r]={name:t,mode:e,bytes:o},Ln[t]||(Ln[t]=[]),Ln[t][e]=r};I("ADC",i.IMM,105,2),I("ADC",i.ZP_REL,101,2),I("ADC",i.ZP_X,117,2),I("ADC",i.ABS,109,3),I("ADC",i.ABS_X,125,3),I("ADC",i.ABS_Y,121,3),I("ADC",i.IND_X,97,2),I("ADC",i.IND_Y,113,2),I("ADC",i.IND,114,2),I("AND",i.IMM,41,2),I("AND",i.ZP_REL,37,2),I("AND",i.ZP_X,53,2),I("AND",i.ABS,45,3),I("AND",i.ABS_X,61,3),I("AND",i.ABS_Y,57,3),I("AND",i.IND_X,33,2),I("AND",i.IND_Y,49,2),I("AND",i.IND,50,2),I("ASL",i.IMPLIED,10,1),I("ASL",i.ZP_REL,6,2),I("ASL",i.ZP_X,22,2),I("ASL",i.ABS,14,3),I("ASL",i.ABS_X,30,3),I("BCC",i.ZP_REL,144,2),I("BCS",i.ZP_REL,176,2),I("BEQ",i.ZP_REL,240,2),I("BIT",i.ZP_REL,36,2),I("BIT",i.ABS,44,3),I("BIT",i.IMM,137,2),I("BIT",i.ZP_X,52,2),I("BIT",i.ABS_X,60,3),I("BMI",i.ZP_REL,48,2),I("BNE",i.ZP_REL,208,2),I("BPL",i.ZP_REL,16,2),I("BVC",i.ZP_REL,80,2),I("BVS",i.ZP_REL,112,2),I("BRA",i.ZP_REL,128,2),I("BRK",i.IMPLIED,0,1),I("CLC",i.IMPLIED,24,1),I("CLD",i.IMPLIED,216,1),I("CLI",i.IMPLIED,88,1),I("CLV",i.IMPLIED,184,1),I("CMP",i.IMM,201,2),I("CMP",i.ZP_REL,197,2),I("CMP",i.ZP_X,213,2),I("CMP",i.ABS,205,3),I("CMP",i.ABS_X,221,3),I("CMP",i.ABS_Y,217,3),I("CMP",i.IND_X,193,2),I("CMP",i.IND_Y,209,2),I("CMP",i.IND,210,2),I("CPX",i.IMM,224,2),I("CPX",i.ZP_REL,228,2),I("CPX",i.ABS,236,3),I("CPY",i.IMM,192,2),I("CPY",i.ZP_REL,196,2),I("CPY",i.ABS,204,3),I("DEC",i.IMPLIED,58,1),I("DEC",i.ZP_REL,198,2),I("DEC",i.ZP_X,214,2),I("DEC",i.ABS,206,3),I("DEC",i.ABS_X,222,3),I("DEX",i.IMPLIED,202,1),I("DEY",i.IMPLIED,136,1),I("EOR",i.IMM,73,2),I("EOR",i.ZP_REL,69,2),I("EOR",i.ZP_X,85,2),I("EOR",i.ABS,77,3),I("EOR",i.ABS_X,93,3),I("EOR",i.ABS_Y,89,3),I("EOR",i.IND_X,65,2),I("EOR",i.IND_Y,81,2),I("EOR",i.IND,82,2),I("INC",i.IMPLIED,26,1),I("INC",i.ZP_REL,230,2),I("INC",i.ZP_X,246,2),I("INC",i.ABS,238,3),I("INC",i.ABS_X,254,3),I("INX",i.IMPLIED,232,1),I("INY",i.IMPLIED,200,1),I("JMP",i.ABS,76,3),I("JMP",i.IND,108,3),I("JMP",i.IND_X,124,3),I("JSR",i.ABS,32,3),I("LDA",i.IMM,169,2),I("LDA",i.ZP_REL,165,2),I("LDA",i.ZP_X,181,2),I("LDA",i.ABS,173,3),I("LDA",i.ABS_X,189,3),I("LDA",i.ABS_Y,185,3),I("LDA",i.IND_X,161,2),I("LDA",i.IND_Y,177,2),I("LDA",i.IND,178,2),I("LDX",i.IMM,162,2),I("LDX",i.ZP_REL,166,2),I("LDX",i.ZP_Y,182,2),I("LDX",i.ABS,174,3),I("LDX",i.ABS_Y,190,3),I("LDY",i.IMM,160,2),I("LDY",i.ZP_REL,164,2),I("LDY",i.ZP_X,180,2),I("LDY",i.ABS,172,3),I("LDY",i.ABS_X,188,3),I("LSR",i.IMPLIED,74,1),I("LSR",i.ZP_REL,70,2),I("LSR",i.ZP_X,86,2),I("LSR",i.ABS,78,3),I("LSR",i.ABS_X,94,3),I("NOP",i.IMPLIED,234,1),I("ORA",i.IMM,9,2),I("ORA",i.ZP_REL,5,2),I("ORA",i.ZP_X,21,2),I("ORA",i.ABS,13,3),I("ORA",i.ABS_X,29,3),I("ORA",i.ABS_Y,25,3),I("ORA",i.IND_X,1,2),I("ORA",i.IND_Y,17,2),I("ORA",i.IND,18,2),I("PHA",i.IMPLIED,72,1),I("PHP",i.IMPLIED,8,1),I("PHX",i.IMPLIED,218,1),I("PHY",i.IMPLIED,90,1),I("PLA",i.IMPLIED,104,1),I("PLP",i.IMPLIED,40,1),I("PLX",i.IMPLIED,250,1),I("PLY",i.IMPLIED,122,1),I("ROL",i.IMPLIED,42,1),I("ROL",i.ZP_REL,38,2),I("ROL",i.ZP_X,54,2),I("ROL",i.ABS,46,3),I("ROL",i.ABS_X,62,3),I("ROR",i.IMPLIED,106,1),I("ROR",i.ZP_REL,102,2),I("ROR",i.ZP_X,118,2),I("ROR",i.ABS,110,3),I("ROR",i.ABS_X,126,3),I("RTI",i.IMPLIED,64,1),I("RTS",i.IMPLIED,96,1),I("SBC",i.IMM,233,2),I("SBC",i.ZP_REL,229,2),I("SBC",i.ZP_X,245,2),I("SBC",i.ABS,237,3),I("SBC",i.ABS_X,253,3),I("SBC",i.ABS_Y,249,3),I("SBC",i.IND_X,225,2),I("SBC",i.IND_Y,241,2),I("SBC",i.IND,242,2),I("SEC",i.IMPLIED,56,1),I("SED",i.IMPLIED,248,1),I("SEI",i.IMPLIED,120,1),I("STA",i.ZP_REL,133,2),I("STA",i.ZP_X,149,2),I("STA",i.ABS,141,3),I("STA",i.ABS_X,157,3),I("STA",i.ABS_Y,153,3),I("STA",i.IND_X,129,2),I("STA",i.IND_Y,145,2),I("STA",i.IND,146,2),I("STX",i.ZP_REL,134,2),I("STX",i.ZP_Y,150,2),I("STX",i.ABS,142,3),I("STY",i.ZP_REL,132,2),I("STY",i.ZP_X,148,2),I("STY",i.ABS,140,3),I("STZ",i.ZP_REL,100,2),I("STZ",i.ZP_X,116,2),I("STZ",i.ABS,156,3),I("STZ",i.ABS_X,158,3),I("TAX",i.IMPLIED,170,1),I("TAY",i.IMPLIED,168,1),I("TSX",i.IMPLIED,186,1),I("TXA",i.IMPLIED,138,1),I("TXS",i.IMPLIED,154,1),I("TYA",i.IMPLIED,152,1),I("TRB",i.ZP_REL,20,2),I("TRB",i.ABS,28,3),I("TSB",i.ZP_REL,4,2),I("TSB",i.ABS,12,3);const La=65536,Hs=65792,js=66048;class Ma{constructor(){T(this,"address");T(this,"watchpoint");T(this,"instruction");T(this,"disabled");T(this,"hidden");T(this,"once");T(this,"memget");T(this,"memset");T(this,"expression1");T(this,"expression2");T(this,"expressionOperator");T(this,"hexvalue");T(this,"hitcount");T(this,"nhits");T(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class $s extends Map{set(e,r){const o=[...this.entries()];o.push([e,r]),o.sort((c,f)=>c[0]-f[0]),super.clear();for(const[c,f]of o)super.set(c,f);return this}}let Mn=!1,_n=!1,At=new $s;const wr=()=>{Mn=!0},_a=()=>{new $s(At).forEach((o,c)=>{o.once&&At.delete(c)});const e=sc();if(e<0||At.get(e))return;const r=new Ma;r.address=e,r.once=!0,r.hidden=!0,At.set(e,r)},Oa=t=>{At=t},vs=(t,e)=>{const r=Rt[t];return!(e<r.min||e>r.max||!r.enabled(e))},zs=(t,e,r)=>{const o=At.get(t);return!o||!o.watchpoint||o.disabled||o.hexvalue>=0&&o.hexvalue!==e||o.memoryBank&&!vs(o.memoryBank,t)?!1:r?o.memset:o.memget},er=(t=0,e=!0)=>{e?A.flagIRQ|=1<<t:A.flagIRQ&=~(1<<t),A.flagIRQ&=255},Ua=(t=!0)=>{A.flagNMI=t===!0},Na=()=>{A.flagIRQ=0,A.flagNMI=!1},On=[],to=[],eo=(t,e)=>{On.push(t),to.push(e)},Fa=()=>{for(let t=0;t<On.length;t++)On[t](to[t])},ro=t=>{let e=0;switch(t.register){case"$":e=xe(t.address);break;case"A":e=A.Accum;break;case"X":e=A.XReg;break;case"Y":e=A.YReg;break;case"S":e=A.StackPtr;break;case"P":e=A.PStatus;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},xa=t=>{const e=ro(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:ro(t.expression2)},no=()=>{_n=!0},Qa=(t=-1,e=-1)=>{if(_n)return _n=!1,!0;if(At.size===0||Mn)return!1;const r=At.get(A.PC)||At.get(-1)||At.get(t|La)||t>=0&&At.get(Hs)||t>=0&&At.get(js);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===Hs){if(W[t].name!=="???")return!1}else if(r.address===js){if(W[t].is6502)return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!xa(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!vs(r.memoryBank,A.PC)?!1:(r.once&&At.delete(A.PC),!0)},Un=()=>{let t=0;const e=A.PC,r=C(A.PC,!1),o=W[r],c=o.bytes>1?C(A.PC+1,!1):-1,f=o.bytes>2?C(A.PC+2,!1):0;if(Qa(r,(f<<8)+c))return Lt(O.PAUSED),-1;Mn=!1;const S=co.get(e);if(S&&!m.INTCXROM.isSet&&S(),t=o.execute(c,f),Io(o.bytes),_r(A.cycleCount+t),Fa(),A.flagNMI&&(A.flagNMI=!1,t=ac(),_r(A.cycleCount+t)),A.flagIRQ){const u=ic();u>0&&(_r(A.cycleCount+u),t=u)}return t},Xa=[197,58,163,92,197,58,163,92],Ya=1,so=4;class Ka{constructor(){T(this,"bits",[]);T(this,"pattern",new Array(64));T(this,"patternIdx",0);T(this,"reset",()=>{this.patternIdx=0});T(this,"checkPattern",e=>{const o=Xa[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===o});T(this,"calcBits",()=>{const e=K=>{this.bits.push(K&8?1:0),this.bits.push(K&4?1:0),this.bits.push(K&2?1:0),this.bits.push(K&1?1:0)},r=K=>{e(Math.floor(K/10)),e(Math.floor(K%10))},o=new Date,c=o.getFullYear()%100,f=o.getDate(),S=o.getDay()+1,u=o.getMonth()+1,B=o.getHours(),V=o.getMinutes(),y=o.getSeconds(),et=o.getMilliseconds()/10;this.bits=[],r(c),r(u),r(f),r(S),r(B),r(V),r(y),r(et)});T(this,"access",e=>{e&so?this.reset():this.checkPattern(e&Ya)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});T(this,"read",e=>{let r=-1;return this.bits.length>0?e&so&&(r=this.bits.pop()):this.access(e),r})}}const qa=new Ka,oo=320,io=327,br=256*oo,Wa=256*io;let _t=0;const Nn=$t;let P=new Uint8Array(Nn+(_t+1)*65536).fill(0);const Fn=()=>Re(49194),Lr=t=>{$(49194,t)},De=()=>Re(49267),xn=t=>{$(49267,t)},st=new Array(257).fill(0),Dt=new Array(257).fill(0),Qn=t=>{t=Math.max(64,Math.min(8192,t));const e=_t;if(_t=Math.floor(t/64)-1,_t===e)return;De()>_t&&(xn(0),zt());const r=Nn+(_t+1)*65536;if(_t<e)P=P.slice(0,r);else{const o=P;P=new Uint8Array(r).fill(255),P.set(o)}},Za=()=>{const t=m.RAMRD.isSet?Oe+De()*256:0,e=m.RAMWRT.isSet?Oe+De()*256:0,r=m.PAGE2.isSet?Oe+De()*256:0,o=m.STORE80.isSet?r:t,c=m.STORE80.isSet?r:e,f=m.STORE80.isSet&&m.HIRES.isSet?r:t,S=m.STORE80.isSet&&m.HIRES.isSet?r:e;for(let u=2;u<256;u++)st[u]=u+t,Dt[u]=u+e;for(let u=4;u<=7;u++)st[u]=u+o,Dt[u]=u+c;for(let u=32;u<=63;u++)st[u]=u+f,Dt[u]=u+S},Ga=()=>{const t=m.ALTZP.isSet?Oe+De()*256:0;if(st[0]=t,st[1]=1+t,Dt[0]=t,Dt[1]=1+t,m.BSRREADRAM.isSet){for(let e=208;e<=255;e++)st[e]=e+t;if(!m.BSRBANK2.isSet)for(let e=208;e<=223;e++)st[e]=e-16+t}else for(let e=208;e<=255;e++)st[e]=$e+e-192},Ja=()=>{const t=m.ALTZP.isSet?Oe+De()*256:0,e=m.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Dt[r]=-1;if(e){for(let r=208;r<=255;r++)Dt[r]=r+t;if(!m.BSRBANK2.isSet)for(let r=208;r<=223;r++)Dt[r]=r-16+t}},ao=t=>m.INTCXROM.isSet?!1:t!==3?!0:m.SLOTC3ROM.isSet,Va=()=>!!(m.INTCXROM.isSet||m.INTC8ROM.isSet),Xn=t=>{if(t<=7){if(m.INTCXROM.isSet)return;t===3&&!m.SLOTC3ROM.isSet&&(m.INTC8ROM.isSet||(m.INTC8ROM.isSet=!0,Lr(255),zt())),Fn()===0&&(Lr(t),zt())}else m.INTC8ROM.isSet=!1,Lr(0),zt()},Ha=()=>{st[192]=$e-192;for(let t=1;t<=7;t++){const e=192+t;st[e]=t+(ao(t)?oo-1:$e)}if(Va())for(let t=200;t<=207;t++)st[t]=$e+t-192;else{const t=io+8*(Fn()-1);for(let e=0;e<=7;e++){const r=200+e;st[r]=t+e}}},zt=()=>{Za(),Ga(),Ja(),Ha();for(let t=0;t<256;t++)st[t]=256*st[t],Dt[t]=256*Dt[t]},co=new Map,Ao=new Array(8),Mr=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Xn(r),!ao(r)))return;const o=Ao[r];if(o!==void 0){const c=o(t,e);if(c>=0){const f=t>=49408?br-256:ve;P[t-49152+f]=c}}},rr=(t,e)=>{Ao[t]=e},Fe=(t,e,r=0,o=()=>{})=>{if(P.set(e.slice(0,256),br+(t-1)*256),e.length>256){const c=e.length>2304?2304:e.length,f=Wa+(t-1)*2048;P.set(e.slice(256,c),f)}r&&co.set(r,o)},ja=()=>{P.fill(255,0,65536),P.fill(255,Nn);const e=Js.replace(/\n/g,""),r=new Uint8Array(It.Buffer.from(e,"base64"));P.set(r,ve),Lr(0),xn(0),zt()},$a=t=>(t>=49296?Mr(t):Gs(t,!1,A.cycleCount),t>=49232&&zt(),P[ve+t-49152]),X=(t,e)=>{const r=br+(t-1)*256+(e&255);return P[r]},M=(t,e,r)=>{if(r>=0){const o=br+(t-1)*256+(e&255);P[o]=r&255}},C=(t,e=!0)=>{let r=0;const o=t>>>8;if(o===192)r=$a(t);else if(r=-1,o>=193&&o<=199?(o==195&&!m.SLOTC3ROM.isSet&&(r=qa.read(t)),Mr(t)):t===53247&&Xn(255),r<0){const c=st[o];r=P[c+(t&255)]}return e&&zs(t,r,!1)&&no(),r},xe=t=>{const e=t>>>8,r=st[e];return P[r+(t&255)]},va=(t,e)=>{if(t===49265||t===49267){if(e>_t)return;xn(e)}else t>=49296?Mr(t,e):Gs(t,!0,A.cycleCount);(t<=49167||t>=49232)&&zt()},d=(t,e)=>{const r=t>>>8;if(r===192)va(t,e);else{r>=193&&r<=199?Mr(t,e):t===53247&&Xn(255);const o=Dt[r];if(o<0)return;P[o+(t&255)]=e}zs(t,e,!0)&&no()},Re=t=>P[ve+t-49152],$=(t,e,r=1)=>{const o=ve+t-49152;P.fill(e,o,o+r)},lo=1024,uo=2048,Yn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Kn=(t=!1)=>{let e=0,r=24,o=!1;if(t){if(m.TEXT.isSet||m.HIRES.isSet)return new Uint8Array;r=m.MIXED.isSet?20:24,o=m.COLUMN80.isSet&&!m.AN3.isSet}else{if(!m.TEXT.isSet&&!m.MIXED.isSet)return new Uint8Array;!m.TEXT.isSet&&m.MIXED.isSet&&(e=20),o=m.COLUMN80.isSet}if(o){const c=m.PAGE2.isSet&&!m.STORE80.isSet?uo:lo,f=new Uint8Array(80*(r-e)).fill(160);for(let S=e;S<r;S++){const u=80*(S-e);for(let B=0;B<40;B++)f[u+2*B+1]=P[c+Yn[S]+B],f[u+2*B]=P[$t+c+Yn[S]+B]}return f}else{const c=m.PAGE2.isSet?uo:lo,f=new Uint8Array(40*(r-e));for(let S=e;S<r;S++){const u=40*(S-e),B=c+Yn[S];f.set(P.slice(B,B+40),u)}return f}},fo=()=>It.Buffer.from(Kn().map(t=>t&=127)).toString(),za=()=>{if(m.TEXT.isSet||!m.HIRES.isSet)return new Uint8Array;const t=m.COLUMN80.isSet&&!m.AN3.isSet,e=m.MIXED.isSet?160:192;if(t){const r=m.PAGE2.isSet&&!m.STORE80.isSet?16384:8192,o=new Uint8Array(80*e);for(let c=0;c<e;c++){const f=vi(r,c);for(let S=0;S<40;S++)o[c*80+2*S+1]=P[f+S],o[c*80+2*S]=P[$t+f+S]}return o}else{const r=m.PAGE2.isSet?16384:8192,o=new Uint8Array(40*e);for(let c=0;c<e;c++){const f=r+40*Math.trunc(c/64)+1024*(c%8)+128*(Math.trunc(c/8)&7);o.set(P.slice(f,f+40),c*40)}return o}},qn=t=>{const e=st[t>>>8];return P.slice(e,e+512)},Wn=(t,e)=>{const r=Dt[t>>>8]+(t&255);P.set(e,r),Pr()},Zn=(t,e)=>{for(let r=0;r<e.length;r++)if(C(t+r,!1)!==e[r])return!1;return!0},tc=()=>P.slice(0,$t+65536),Rt={};Rt[""]={name:"Any",min:0,max:65535,enabled:()=>!0},Rt.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?!m.ALTZP.isSet&&m.BSRREADRAM.isSet:t>=512?!m.RAMRD.isSet:!m.ALTZP.isSet},Rt.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?m.ALTZP.isSet&&m.BSRREADRAM.isSet:t>=512?m.RAMRD.isSet:m.ALTZP.isSet},Rt.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535,enabled:()=>!m.BSRREADRAM.isSet},Rt["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!m.ALTZP.isSet&&m.BSRREADRAM.isSet&&!m.BSRBANK2.isSet},Rt["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!m.ALTZP.isSet&&m.BSRREADRAM.isSet&&m.BSRBANK2.isSet},Rt["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>m.ALTZP.isSet&&m.BSRREADRAM.isSet&&!m.BSRBANK2.isSet},Rt["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>m.ALTZP.isSet&&m.BSRREADRAM.isSet&&m.BSRBANK2.isSet},Rt["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?m.INTCXROM.isSet||!m.SLOTC3ROM.isSet:t>=51200?m.INTCXROM.isSet||m.INTC8ROM.isSet:m.INTCXROM.isSet},Rt["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?m.INTCXROM.isSet?!1:m.SLOTC3ROM.isSet:t>=51200?!m.INTCXROM.isSet&&!m.INTC8ROM.isSet:!m.INTCXROM.isSet},Object.values(Rt).map(t=>t.name);const A=Vi(),nr=t=>{A.Accum=t},sr=t=>{A.XReg=t},or=t=>{A.YReg=t},_r=t=>{A.cycleCount=t},ho=t=>{po(),Object.assign(A,t)},po=()=>{A.Accum=0,A.XReg=0,A.YReg=0,A.PStatus=36,A.StackPtr=255,Ot(C(65533,!1)*256+C(65532,!1)),A.flagIRQ=0,A.flagNMI=!1},Io=t=>{Ot((A.PC+t+65536)%65536)},Ot=t=>{A.PC=t},So=t=>{A.PStatus=t|48},Ut=new Array(256).fill(""),ec=()=>Ut.slice(0,256),rc=t=>{Ut.splice(0,t.length,...t)},nc=()=>{const t=qn(256).slice(0,256),e=new Array;for(let r=255;r>A.StackPtr;r--){let o="$"+G(t[r]),c=Ut[r];Ut[r].length>3&&r-1>A.StackPtr&&(Ut[r-1]==="JSR"||Ut[r-1]==="BRK"||Ut[r-1]==="IRQ"?(r--,o+=G(t[r])):c=""),o=(o+"   ").substring(0,6),e.push(G(256+r,4)+": "+o+c)}return e.join(`
`)},sc=()=>{const t=qn(256).slice(0,256);for(let e=A.StackPtr-2;e<=255;e++){const r=t[e];if(Ut[e].startsWith("JSR")&&e-1>A.StackPtr&&Ut[e-1]==="JSR"){const o=t[e-1]+1;return(r<<8)+o}}return-1},Yt=(t,e)=>{Ut[A.StackPtr]=t,d(256+A.StackPtr,e),A.StackPtr=(A.StackPtr+255)%256},Kt=()=>{A.StackPtr=(A.StackPtr+1)%256;const t=C(256+A.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},Tt=()=>(A.PStatus&1)!==0,L=(t=!0)=>A.PStatus=t?A.PStatus|1:A.PStatus&254,go=()=>(A.PStatus&2)!==0,ir=(t=!0)=>A.PStatus=t?A.PStatus|2:A.PStatus&253,oc=()=>(A.PStatus&4)!==0,Gn=(t=!0)=>A.PStatus=t?A.PStatus|4:A.PStatus&251,Eo=()=>(A.PStatus&8)!==0,rt=()=>Eo()?1:0,Jn=(t=!0)=>A.PStatus=t?A.PStatus|8:A.PStatus&247,Vn=(t=!0)=>A.PStatus=t?A.PStatus|16:A.PStatus&239,mo=()=>(A.PStatus&64)!==0,ar=(t=!0)=>A.PStatus=t?A.PStatus|64:A.PStatus&191,Co=()=>(A.PStatus&128)!==0,Bo=(t=!0)=>A.PStatus=t?A.PStatus|128:A.PStatus&127,R=t=>{ir(t===0),Bo(t>=128)},qt=(t,e)=>{if(t){const r=A.PC;return Io(e>127?e-256:e),3+J(r,A.PC)}return 2},b=(t,e)=>(t+e+256)%256,D=(t,e)=>e*256+t,_=(t,e,r)=>(e*256+t+r+65536)%65536,J=(t,e)=>t>>8!==e>>8?1:0,W=new Array(256),h=(t,e,r,o,c,f=!1)=>{console.assert(!W[r],"Duplicate instruction: "+t+" mode="+e),W[r]={name:t,pcode:r,mode:e,bytes:o,execute:c,is6502:!f}},Y=!0,te=(t,e,r)=>{const o=C(t),c=C((t+1)%256),f=_(o,c,A.YReg);e(f);let S=5+J(f,D(o,c));return r&&(S+=rt()),S},ee=(t,e,r)=>{const o=C(t),c=C((t+1)%256),f=D(o,c);e(f);let S=5;return r&&(S+=rt()),S},Do=t=>{let e=(A.Accum&15)+(t&15)+(Tt()?1:0);e>=10&&(e+=6);let r=(A.Accum&240)+(t&240)+e;const o=A.Accum<=127&&t<=127,c=A.Accum>=128&&t>=128;ar((r&255)>=128?o:c),L(r>=160),Tt()&&(r+=96),A.Accum=r&255,R(A.Accum)},Or=t=>{let e=A.Accum+t+(Tt()?1:0);L(e>=256),e=e%256;const r=A.Accum<=127&&t<=127,o=A.Accum>=128&&t>=128;ar(e>=128?r:o),A.Accum=e,R(A.Accum)},re=t=>{Eo()?Do(C(t)):Or(C(t))};h("ADC",i.IMM,105,2,t=>(rt()?Do(t):Or(t),2+rt())),h("ADC",i.ZP_REL,101,2,t=>(re(t),3+rt())),h("ADC",i.ZP_X,117,2,t=>(re(b(t,A.XReg)),4+rt())),h("ADC",i.ABS,109,3,(t,e)=>(re(D(t,e)),4+rt())),h("ADC",i.ABS_X,125,3,(t,e)=>{const r=_(t,e,A.XReg);return re(r),4+rt()+J(r,D(t,e))}),h("ADC",i.ABS_Y,121,3,(t,e)=>{const r=_(t,e,A.YReg);return re(r),4+rt()+J(r,D(t,e))}),h("ADC",i.IND_X,97,2,t=>{const e=b(t,A.XReg);return re(D(C(e),C(e+1))),6+rt()}),h("ADC",i.IND_Y,113,2,t=>te(t,re,!0)),h("ADC",i.IND,114,2,t=>ee(t,re,!0),Y);const ne=t=>{A.Accum&=C(t),R(A.Accum)};h("AND",i.IMM,41,2,t=>(A.Accum&=t,R(A.Accum),2)),h("AND",i.ZP_REL,37,2,t=>(ne(t),3)),h("AND",i.ZP_X,53,2,t=>(ne(b(t,A.XReg)),4)),h("AND",i.ABS,45,3,(t,e)=>(ne(D(t,e)),4)),h("AND",i.ABS_X,61,3,(t,e)=>{const r=_(t,e,A.XReg);return ne(r),4+J(r,D(t,e))}),h("AND",i.ABS_Y,57,3,(t,e)=>{const r=_(t,e,A.YReg);return ne(r),4+J(r,D(t,e))}),h("AND",i.IND_X,33,2,t=>{const e=b(t,A.XReg);return ne(D(C(e),C(e+1))),6}),h("AND",i.IND_Y,49,2,t=>te(t,ne,!1)),h("AND",i.IND,50,2,t=>ee(t,ne,!1),Y);const Ur=t=>{let e=C(t);C(t),L((e&128)===128),e=(e<<1)%256,d(t,e),R(e)};h("ASL",i.IMPLIED,10,1,()=>(L((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256,R(A.Accum),2)),h("ASL",i.ZP_REL,6,2,t=>(Ur(t),5)),h("ASL",i.ZP_X,22,2,t=>(Ur(b(t,A.XReg)),6)),h("ASL",i.ABS,14,3,(t,e)=>(Ur(D(t,e)),6)),h("ASL",i.ABS_X,30,3,(t,e)=>{const r=_(t,e,A.XReg);return Ur(r),6+J(r,D(t,e))}),h("BCC",i.ZP_REL,144,2,t=>qt(!Tt(),t)),h("BCS",i.ZP_REL,176,2,t=>qt(Tt(),t)),h("BEQ",i.ZP_REL,240,2,t=>qt(go(),t)),h("BMI",i.ZP_REL,48,2,t=>qt(Co(),t)),h("BNE",i.ZP_REL,208,2,t=>qt(!go(),t)),h("BPL",i.ZP_REL,16,2,t=>qt(!Co(),t)),h("BVC",i.ZP_REL,80,2,t=>qt(!mo(),t)),h("BVS",i.ZP_REL,112,2,t=>qt(mo(),t)),h("BRA",i.ZP_REL,128,2,t=>qt(!0,t),Y);const Nr=t=>{ir((A.Accum&t)===0),Bo((t&128)!==0),ar((t&64)!==0)};h("BIT",i.ZP_REL,36,2,t=>(Nr(C(t)),3)),h("BIT",i.ABS,44,3,(t,e)=>(Nr(C(D(t,e))),4)),h("BIT",i.IMM,137,2,t=>(ir((A.Accum&t)===0),2),Y),h("BIT",i.ZP_X,52,2,t=>(Nr(C(b(t,A.XReg))),4),Y),h("BIT",i.ABS_X,60,3,(t,e)=>{const r=_(t,e,A.XReg);return Nr(C(r)),4+J(r,D(t,e))},Y);const Hn=(t,e,r=0)=>{const o=(A.PC+r)%65536,c=C(e),f=C(e+1);Yt(`${t} $`+G(f)+G(c),Math.trunc(o/256)),Yt(t,o%256),Yt("P",A.PStatus),Jn(!1),Gn();const S=_(c,f,t==="BRK"?-1:0);Ot(S)},Ro=()=>(Vn(),Hn("BRK",65534,2),7);h("BRK",i.IMPLIED,0,1,Ro);const ic=()=>oc()?0:(Vn(!1),Hn("IRQ",65534),7),ac=()=>(Hn("NMI",65530),7);h("CLC",i.IMPLIED,24,1,()=>(L(!1),2)),h("CLD",i.IMPLIED,216,1,()=>(Jn(!1),2)),h("CLI",i.IMPLIED,88,1,()=>(Gn(!1),2)),h("CLV",i.IMPLIED,184,1,()=>(ar(!1),2));const Te=t=>{const e=C(t);L(A.Accum>=e),R((A.Accum-e+256)%256)},cc=t=>{const e=C(t);L(A.Accum>=e),R((A.Accum-e+256)%256)};h("CMP",i.IMM,201,2,t=>(L(A.Accum>=t),R((A.Accum-t+256)%256),2)),h("CMP",i.ZP_REL,197,2,t=>(Te(t),3)),h("CMP",i.ZP_X,213,2,t=>(Te(b(t,A.XReg)),4)),h("CMP",i.ABS,205,3,(t,e)=>(Te(D(t,e)),4)),h("CMP",i.ABS_X,221,3,(t,e)=>{const r=_(t,e,A.XReg);return cc(r),4+J(r,D(t,e))}),h("CMP",i.ABS_Y,217,3,(t,e)=>{const r=_(t,e,A.YReg);return Te(r),4+J(r,D(t,e))}),h("CMP",i.IND_X,193,2,t=>{const e=b(t,A.XReg);return Te(D(C(e),C(e+1))),6}),h("CMP",i.IND_Y,209,2,t=>te(t,Te,!1)),h("CMP",i.IND,210,2,t=>ee(t,Te,!1),Y);const To=t=>{const e=C(t);L(A.XReg>=e),R((A.XReg-e+256)%256)};h("CPX",i.IMM,224,2,t=>(L(A.XReg>=t),R((A.XReg-t+256)%256),2)),h("CPX",i.ZP_REL,228,2,t=>(To(t),3)),h("CPX",i.ABS,236,3,(t,e)=>(To(D(t,e)),4));const ko=t=>{const e=C(t);L(A.YReg>=e),R((A.YReg-e+256)%256)};h("CPY",i.IMM,192,2,t=>(L(A.YReg>=t),R((A.YReg-t+256)%256),2)),h("CPY",i.ZP_REL,196,2,t=>(ko(t),3)),h("CPY",i.ABS,204,3,(t,e)=>(ko(D(t,e)),4));const Fr=t=>{const e=b(C(t),-1);d(t,e),R(e)};h("DEC",i.IMPLIED,58,1,()=>(A.Accum=b(A.Accum,-1),R(A.Accum),2),Y),h("DEC",i.ZP_REL,198,2,t=>(Fr(t),5)),h("DEC",i.ZP_X,214,2,t=>(Fr(b(t,A.XReg)),6)),h("DEC",i.ABS,206,3,(t,e)=>(Fr(D(t,e)),6)),h("DEC",i.ABS_X,222,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),Fr(r),7}),h("DEX",i.IMPLIED,202,1,()=>(A.XReg=b(A.XReg,-1),R(A.XReg),2)),h("DEY",i.IMPLIED,136,1,()=>(A.YReg=b(A.YReg,-1),R(A.YReg),2));const se=t=>{A.Accum^=C(t),R(A.Accum)};h("EOR",i.IMM,73,2,t=>(A.Accum^=t,R(A.Accum),2)),h("EOR",i.ZP_REL,69,2,t=>(se(t),3)),h("EOR",i.ZP_X,85,2,t=>(se(b(t,A.XReg)),4)),h("EOR",i.ABS,77,3,(t,e)=>(se(D(t,e)),4)),h("EOR",i.ABS_X,93,3,(t,e)=>{const r=_(t,e,A.XReg);return se(r),4+J(r,D(t,e))}),h("EOR",i.ABS_Y,89,3,(t,e)=>{const r=_(t,e,A.YReg);return se(r),4+J(r,D(t,e))}),h("EOR",i.IND_X,65,2,t=>{const e=b(t,A.XReg);return se(D(C(e),C(e+1))),6}),h("EOR",i.IND_Y,81,2,t=>te(t,se,!1)),h("EOR",i.IND,82,2,t=>ee(t,se,!1),Y);const xr=t=>{const e=b(C(t),1);d(t,e),R(e)};h("INC",i.IMPLIED,26,1,()=>(A.Accum=b(A.Accum,1),R(A.Accum),2),Y),h("INC",i.ZP_REL,230,2,t=>(xr(t),5)),h("INC",i.ZP_X,246,2,t=>(xr(b(t,A.XReg)),6)),h("INC",i.ABS,238,3,(t,e)=>(xr(D(t,e)),6)),h("INC",i.ABS_X,254,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),xr(r),7}),h("INX",i.IMPLIED,232,1,()=>(A.XReg=b(A.XReg,1),R(A.XReg),2)),h("INY",i.IMPLIED,200,1,()=>(A.YReg=b(A.YReg,1),R(A.YReg),2)),h("JMP",i.ABS,76,3,(t,e)=>(Ot(_(t,e,-3)),3)),h("JMP",i.IND,108,3,(t,e)=>{const r=D(t,e);return t=C(r),e=C((r+1)%65536),Ot(_(t,e,-3)),6}),h("JMP",i.IND_X,124,3,(t,e)=>{const r=_(t,e,A.XReg);return t=C(r),e=C((r+1)%65536),Ot(_(t,e,-3)),6},Y),h("JSR",i.ABS,32,3,(t,e)=>{const r=(A.PC+2)%65536;return Yt("JSR $"+G(e)+G(t),Math.trunc(r/256)),Yt("JSR",r%256),Ot(_(t,e,-3)),6});const oe=t=>{A.Accum=C(t),R(A.Accum)};h("LDA",i.IMM,169,2,t=>(A.Accum=t,R(A.Accum),2)),h("LDA",i.ZP_REL,165,2,t=>(oe(t),3)),h("LDA",i.ZP_X,181,2,t=>(oe(b(t,A.XReg)),4)),h("LDA",i.ABS,173,3,(t,e)=>(oe(D(t,e)),4)),h("LDA",i.ABS_X,189,3,(t,e)=>{const r=_(t,e,A.XReg);return oe(r),4+J(r,D(t,e))}),h("LDA",i.ABS_Y,185,3,(t,e)=>{const r=_(t,e,A.YReg);return oe(r),4+J(r,D(t,e))}),h("LDA",i.IND_X,161,2,t=>{const e=b(t,A.XReg);return oe(D(C(e),C((e+1)%256))),6}),h("LDA",i.IND_Y,177,2,t=>te(t,oe,!1)),h("LDA",i.IND,178,2,t=>ee(t,oe,!1),Y);const Qr=t=>{A.XReg=C(t),R(A.XReg)};h("LDX",i.IMM,162,2,t=>(A.XReg=t,R(A.XReg),2)),h("LDX",i.ZP_REL,166,2,t=>(Qr(t),3)),h("LDX",i.ZP_Y,182,2,t=>(Qr(b(t,A.YReg)),4)),h("LDX",i.ABS,174,3,(t,e)=>(Qr(D(t,e)),4)),h("LDX",i.ABS_Y,190,3,(t,e)=>{const r=_(t,e,A.YReg);return Qr(r),4+J(r,D(t,e))});const Xr=t=>{A.YReg=C(t),R(A.YReg)};h("LDY",i.IMM,160,2,t=>(A.YReg=t,R(A.YReg),2)),h("LDY",i.ZP_REL,164,2,t=>(Xr(t),3)),h("LDY",i.ZP_X,180,2,t=>(Xr(b(t,A.XReg)),4)),h("LDY",i.ABS,172,3,(t,e)=>(Xr(D(t,e)),4)),h("LDY",i.ABS_X,188,3,(t,e)=>{const r=_(t,e,A.XReg);return Xr(r),4+J(r,D(t,e))});const Yr=t=>{let e=C(t);C(t),L((e&1)===1),e>>=1,d(t,e),R(e)};h("LSR",i.IMPLIED,74,1,()=>(L((A.Accum&1)===1),A.Accum>>=1,R(A.Accum),2)),h("LSR",i.ZP_REL,70,2,t=>(Yr(t),5)),h("LSR",i.ZP_X,86,2,t=>(Yr(b(t,A.XReg)),6)),h("LSR",i.ABS,78,3,(t,e)=>(Yr(D(t,e)),6)),h("LSR",i.ABS_X,94,3,(t,e)=>{const r=_(t,e,A.XReg);return Yr(r),6+J(r,D(t,e))}),h("NOP",i.IMPLIED,234,1,()=>2);const ie=t=>{A.Accum|=C(t),R(A.Accum)};h("ORA",i.IMM,9,2,t=>(A.Accum|=t,R(A.Accum),2)),h("ORA",i.ZP_REL,5,2,t=>(ie(t),3)),h("ORA",i.ZP_X,21,2,t=>(ie(b(t,A.XReg)),4)),h("ORA",i.ABS,13,3,(t,e)=>(ie(D(t,e)),4)),h("ORA",i.ABS_X,29,3,(t,e)=>{const r=_(t,e,A.XReg);return ie(r),4+J(r,D(t,e))}),h("ORA",i.ABS_Y,25,3,(t,e)=>{const r=_(t,e,A.YReg);return ie(r),4+J(r,D(t,e))}),h("ORA",i.IND_X,1,2,t=>{const e=b(t,A.XReg);return ie(D(C(e),C(e+1))),6}),h("ORA",i.IND_Y,17,2,t=>te(t,ie,!1)),h("ORA",i.IND,18,2,t=>ee(t,ie,!1),Y),h("PHA",i.IMPLIED,72,1,()=>(Yt("PHA",A.Accum),3)),h("PHP",i.IMPLIED,8,1,()=>(Yt("PHP",A.PStatus|16),3)),h("PHX",i.IMPLIED,218,1,()=>(Yt("PHX",A.XReg),3),Y),h("PHY",i.IMPLIED,90,1,()=>(Yt("PHY",A.YReg),3),Y),h("PLA",i.IMPLIED,104,1,()=>(A.Accum=Kt(),R(A.Accum),4)),h("PLP",i.IMPLIED,40,1,()=>(So(Kt()),4)),h("PLX",i.IMPLIED,250,1,()=>(A.XReg=Kt(),R(A.XReg),4),Y),h("PLY",i.IMPLIED,122,1,()=>(A.YReg=Kt(),R(A.YReg),4),Y);const Kr=t=>{let e=C(t);C(t);const r=Tt()?1:0;L((e&128)===128),e=(e<<1)%256|r,d(t,e),R(e)};h("ROL",i.IMPLIED,42,1,()=>{const t=Tt()?1:0;return L((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256|t,R(A.Accum),2}),h("ROL",i.ZP_REL,38,2,t=>(Kr(t),5)),h("ROL",i.ZP_X,54,2,t=>(Kr(b(t,A.XReg)),6)),h("ROL",i.ABS,46,3,(t,e)=>(Kr(D(t,e)),6)),h("ROL",i.ABS_X,62,3,(t,e)=>{const r=_(t,e,A.XReg);return Kr(r),6+J(r,D(t,e))});const qr=t=>{let e=C(t);C(t);const r=Tt()?128:0;L((e&1)===1),e=e>>1|r,d(t,e),R(e)};h("ROR",i.IMPLIED,106,1,()=>{const t=Tt()?128:0;return L((A.Accum&1)===1),A.Accum=A.Accum>>1|t,R(A.Accum),2}),h("ROR",i.ZP_REL,102,2,t=>(qr(t),5)),h("ROR",i.ZP_X,118,2,t=>(qr(b(t,A.XReg)),6)),h("ROR",i.ABS,110,3,(t,e)=>(qr(D(t,e)),6)),h("ROR",i.ABS_X,126,3,(t,e)=>{const r=_(t,e,A.XReg);return qr(r),6+J(r,D(t,e))}),h("RTI",i.IMPLIED,64,1,()=>(So(Kt()),Vn(!1),Ot(D(Kt(),Kt())-1),6)),h("RTS",i.IMPLIED,96,1,()=>(Ot(D(Kt(),Kt())),6));const yo=t=>{const e=255-t;let r=A.Accum+e+(Tt()?1:0);const o=r>=256,c=A.Accum<=127&&e<=127,f=A.Accum>=128&&e>=128;ar(r%256>=128?c:f);const S=(A.Accum&15)-(t&15)+(Tt()?0:-1);r=A.Accum-t+(Tt()?0:-1),r<0&&(r-=96),S<0&&(r-=6),A.Accum=r&255,R(A.Accum),L(o)},ae=t=>{rt()?yo(C(t)):Or(255-C(t))};h("SBC",i.IMM,233,2,t=>(rt()?yo(t):Or(255-t),2+rt())),h("SBC",i.ZP_REL,229,2,t=>(ae(t),3+rt())),h("SBC",i.ZP_X,245,2,t=>(ae(b(t,A.XReg)),4+rt())),h("SBC",i.ABS,237,3,(t,e)=>(ae(D(t,e)),4+rt())),h("SBC",i.ABS_X,253,3,(t,e)=>{const r=_(t,e,A.XReg);return ae(r),4+rt()+J(r,D(t,e))}),h("SBC",i.ABS_Y,249,3,(t,e)=>{const r=_(t,e,A.YReg);return ae(r),4+rt()+J(r,D(t,e))}),h("SBC",i.IND_X,225,2,t=>{const e=b(t,A.XReg);return ae(D(C(e),C(e+1))),6+rt()}),h("SBC",i.IND_Y,241,2,t=>te(t,ae,!0)),h("SBC",i.IND,242,2,t=>ee(t,ae,!0),Y),h("SEC",i.IMPLIED,56,1,()=>(L(),2)),h("SED",i.IMPLIED,248,1,()=>(Jn(),2)),h("SEI",i.IMPLIED,120,1,()=>(Gn(),2)),h("STA",i.ZP_REL,133,2,t=>(d(t,A.Accum),3)),h("STA",i.ZP_X,149,2,t=>(d(b(t,A.XReg),A.Accum),4)),h("STA",i.ABS,141,3,(t,e)=>(d(D(t,e),A.Accum),4)),h("STA",i.ABS_X,157,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),d(r,A.Accum),5}),h("STA",i.ABS_Y,153,3,(t,e)=>(d(_(t,e,A.YReg),A.Accum),5)),h("STA",i.IND_X,129,2,t=>{const e=b(t,A.XReg);return d(D(C(e),C(e+1)),A.Accum),6});const Po=t=>{d(t,A.Accum)};h("STA",i.IND_Y,145,2,t=>(te(t,Po,!1),6)),h("STA",i.IND,146,2,t=>ee(t,Po,!1),Y),h("STX",i.ZP_REL,134,2,t=>(d(t,A.XReg),3)),h("STX",i.ZP_Y,150,2,t=>(d(b(t,A.YReg),A.XReg),4)),h("STX",i.ABS,142,3,(t,e)=>(d(D(t,e),A.XReg),4)),h("STY",i.ZP_REL,132,2,t=>(d(t,A.YReg),3)),h("STY",i.ZP_X,148,2,t=>(d(b(t,A.XReg),A.YReg),4)),h("STY",i.ABS,140,3,(t,e)=>(d(D(t,e),A.YReg),4)),h("STZ",i.ZP_REL,100,2,t=>(d(t,0),3),Y),h("STZ",i.ZP_X,116,2,t=>(d(b(t,A.XReg),0),4),Y),h("STZ",i.ABS,156,3,(t,e)=>(d(D(t,e),0),4),Y),h("STZ",i.ABS_X,158,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),d(r,0),5},Y),h("TAX",i.IMPLIED,170,1,()=>(A.XReg=A.Accum,R(A.XReg),2)),h("TAY",i.IMPLIED,168,1,()=>(A.YReg=A.Accum,R(A.YReg),2)),h("TSX",i.IMPLIED,186,1,()=>(A.XReg=A.StackPtr,R(A.XReg),2)),h("TXA",i.IMPLIED,138,1,()=>(A.Accum=A.XReg,R(A.Accum),2)),h("TXS",i.IMPLIED,154,1,()=>(A.StackPtr=A.XReg,2)),h("TYA",i.IMPLIED,152,1,()=>(A.Accum=A.YReg,R(A.Accum),2));const wo=t=>{const e=C(t);ir((A.Accum&e)===0),d(t,e&~A.Accum)};h("TRB",i.ZP_REL,20,2,t=>(wo(t),5),Y),h("TRB",i.ABS,28,3,(t,e)=>(wo(D(t,e)),6),Y);const bo=t=>{const e=C(t);ir((A.Accum&e)===0),d(t,e|A.Accum)};h("TSB",i.ZP_REL,4,2,t=>(bo(t),5),Y),h("TSB",i.ABS,12,3,(t,e)=>(bo(D(t,e)),6),Y);const Ac=[2,34,66,98,130,194,226],kt="???";Ac.forEach(t=>{h(kt,i.IMPLIED,t,2,()=>2),W[t].is6502=!1});for(let t=0;t<=15;t++)h(kt,i.IMPLIED,3+16*t,1,()=>1),W[3+16*t].is6502=!1,h(kt,i.IMPLIED,7+16*t,1,()=>1),W[7+16*t].is6502=!1,h(kt,i.IMPLIED,11+16*t,1,()=>1),W[11+16*t].is6502=!1,h(kt,i.IMPLIED,15+16*t,1,()=>1),W[15+16*t].is6502=!1;h(kt,i.IMPLIED,68,2,()=>3),W[68].is6502=!1,h(kt,i.IMPLIED,84,2,()=>4),W[84].is6502=!1,h(kt,i.IMPLIED,212,2,()=>4),W[212].is6502=!1,h(kt,i.IMPLIED,244,2,()=>4),W[244].is6502=!1,h(kt,i.IMPLIED,92,3,()=>8),W[92].is6502=!1,h(kt,i.IMPLIED,220,3,()=>4),W[220].is6502=!1,h(kt,i.IMPLIED,252,3,()=>4),W[252].is6502=!1;for(let t=0;t<256;t++)W[t]||(console.error("ERROR: OPCODE "+t.toString(16)+" should be implemented"),h("BRK",i.IMPLIED,t,1,Ro));const at=(t,e,r)=>{const o=e&7,c=e>>>3;return t[c]|=r>>>o,o&&(t[c+1]|=r<<8-o),e+8},Wr=(t,e,r)=>(e=at(t,e,r>>>1|170),e=at(t,e,r|170),e),jn=(t,e)=>(e=at(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const lc=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),o=[0,2,1,3];for(let f=0;f<84;f++)r[f]=o[t[f]&3]|o[t[f+86]&3]<<2|o[t[f+172]&3]<<4;r[84]=o[t[84]&3]<<0|o[t[170]&3]<<2,r[85]=o[t[85]&3]<<0|o[t[171]&3]<<2;for(let f=0;f<256;f++)r[86+f]=t[f]>>>2;r[342]=r[341];let c=342;for(;c>1;)c--,r[c]^=r[c-1];for(let f=0;f<343;f++)r[f]=e[r[f]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const uc=(t,e,r)=>{let o=0;const c=new Uint8Array(6646).fill(0);for(let f=0;f<16;f++)o=jn(c,o);for(let f=0;f<16;f++){o=at(c,o,213),o=at(c,o,170),o=at(c,o,150),o=Wr(c,o,254),o=Wr(c,o,e),o=Wr(c,o,f),o=Wr(c,o,254^e^f),o=at(c,o,222),o=at(c,o,170),o=at(c,o,235);for(let B=0;B<7;B++)o=jn(c,o);o=at(c,o,213),o=at(c,o,170),o=at(c,o,173);const S=f===15?15:f*(r?8:7)%15,u=lc(t.slice(S*256,S*256+256));for(let B=0;B<u.length;B++)o=at(c,o,u[B]);o=at(c,o,222),o=at(c,o,170),o=at(c,o,235);for(let B=0;B<16;B++)o=jn(c,o)}return c},fc=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const o=new Uint8Array(1536+r*13*512).fill(0);o.set(ze(`WOZ2ÿ
\r
`),0),o.set(ze("INFO"),12),o[16]=60,o[20]=2,o[21]=1,o[22]=0,o[23]=0,o[24]=1,o.fill(32,25,57),o.set(ze("Apple2TS (CT6502)"),25),o[57]=1,o[58]=0,o[59]=32,o[60]=0,o[62]=0,o[64]=13,o.set(ze("TMAP"),80),o[84]=160,o.fill(255,88,248);let c=0;for(let f=0;f<r;f++)c=88+(f<<2),f>0&&(o[c-1]=f),o[c]=o[c+1]=f;o.set(ze("TRKS"),248),o.set(Ds(1280+r*13*512),252);for(let f=0;f<r;f++){c=256+(f<<3),o.set(Hi(3+f*13),c),o[c+2]=13,o.set(Ds(50304),c+4);const S=t.slice(f*16*256,(f+1)*16*256),u=uc(S,f,e);c=1536+f*13*512,o.set(u,c)}return o},hc=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,B)=>u!==e[B])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const c=e.slice(8,12),f=c[0]+(c[1]<<8)+(c[2]<<16)+c[3]*2**24,S=$i(e,12);if(f!==0&&f!==S)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const B=e[88+u*2];if(B<255){const V=256+8*B,y=e.slice(V,V+8);t.trackStart[u]=512*((y[1]<<8)+y[0]),t.trackNbits[u]=y[4]+(y[5]<<8)+(y[6]<<16)+y[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},pc=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((c,f)=>c!==e[f])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let c=0;c<80;c++){const f=e[88+c*2];if(f<255){t.trackStart[c]=256+f*6656;const S=e.slice(t.trackStart[c]+6646,t.trackStart[c]+6656);t.trackNbits[c]=S[2]+(S[3]<<8),t.maxHalftrack=c}else t.trackStart[c]=0,t.trackNbits[c]=51200}return!0},Ic=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),o=e.endsWith(".po");return r||o},Sc=(t,e)=>{const o=t.filename.toLowerCase().endsWith(".po"),c=fc(e,o);return c.length===0?new Uint8Array:(t.filename=Rs(t.filename,"woz"),t.diskHasChanges=!0,c)},Lo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),gc=(t,e)=>{const r=Lo(e.slice(24,28)),o=Lo(e.slice(28,32));let c="";for(let f=0;f<4;f++)c+=String.fromCharCode(e[f]);return c!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Rs(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(r,r+o))},Mo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},Ec=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(Mo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return gc(t,e)}return Ic(t.filename)&&(e=Sc(t,e)),hc(t,e)||pc(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},mc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Qe=0,z=0,lt=0,Zr=!1,$n=!1;const _o=t=>{Zr=!1,Xo(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},Cc=(t=!1)=>{if(t){const e=jr();e.motorRunning&&Yo(e)}else Ve(Se.MOTOR_OFF)},Oo=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(Ve(Se.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):Ve(Se.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,St(),lt+=r,t.trackLocation+=Math.floor(lt/4),lt=lt%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let Uo=0;const Bc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],No=()=>(Uo++,Bc[Uo&31]);let Gr=0;const dc=t=>(Gr<<=1,Gr|=t,Gr&=15,Gr===0?No():t),Fo=[128,64,32,16,8,4,2,1],Dc=[127,191,223,239,247,251,253,254],Jr=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3),c=e[o],f=t.trackLocation&7;r=(c&Fo[f])>>7-f,r=dc(r)}else r=No();return t.trackLocation++,r},Rc=()=>Math.floor(256*Math.random()),xo=(t,e,r)=>{if(e.length===0)return Rc();let o=0;if(t.isSynchronized){for(lt+=r;lt>=4;){const c=Jr(t,e);if((z>0||c)&&(z=z<<1|c),lt-=4,z&128&&lt<=6)break}lt<0&&(lt=0),z&=255}else if(z===0){for(;Jr(t,e)===0;);z=64;for(let c=5;c>=0;c--)z|=Jr(t,e)<<c}else{const c=Jr(t,e);z=z<<1|c}return o=z,z>127&&(z=0),o};let Wt=0;const vn=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3);let c=e[o];const f=t.trackLocation&7;r?c|=Fo[f]:c&=Dc[f],e[o]=c}t.trackLocation++},Qo=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&z>0){if(r>=16)for(let o=7;o>=0;o--)vn(t,e,z&2**o?1:0);r>=36&&vn(t,e,0),r>=40&&vn(t,e,0),zn.push(r>=40?2:r>=36?1:z),t.diskHasChanges=!0,z=0}},Xo=t=>{Qe=0,Zr||(t.motorRunning=!1),St(),Ve(Se.MOTOR_OFF)},Yo=t=>{Qe?(clearTimeout(Qe),Qe=0):lt=0,t.motorRunning=!0,St(),Ve(Se.MOTOR_ON)},Tc=t=>{Qe===0&&(Qe=setTimeout(()=>Xo(t),1e3))};let zn=[];const Vr=t=>{zn.length>0&&t.halftrack===2*0&&(zn=[])},Hr=[0,0,0,0],kc=(t,e)=>{if(t>=49408)return-1;let r=jr();const o=wc();if(r.hardDrive)return 0;let c=0;const f=A.cycleCount-Wt;switch(t=t&15,t){case 9:Zr=!0,Yo(r),Vr(r);break;case 8:r.motorRunning&&!r.writeMode&&(c=xo(r,o,f),Wt=A.cycleCount),Zr=!1,Tc(r),Vr(r);break;case 10:case 11:{const S=t===10?2:3,u=jr();Pc(S),r=jr(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,St());break}case 12:$n=!1,r.motorRunning&&!r.writeMode&&(c=xo(r,o,f),Wt=A.cycleCount);break;case 13:$n=!0,r.motorRunning&&(r.writeMode?(Qo(r,o,f),Wt=A.cycleCount):(z=0,lt+=f,r.trackLocation+=Math.floor(lt/4),lt=lt%4,Wt=A.cycleCount),e>=0&&(z=e));break;case 14:r.motorRunning&&r.writeMode&&(Qo(r,o,f),Wt=A.cycleCount),r.writeMode=!1,$n&&(c=r.isWriteProtected?255:0),Vr(r);break;case 15:r.writeMode=!0,Wt=A.cycleCount,e>=0&&(z=e);break;default:{if(t<0||t>7)break;Hr[Math.floor(t/2)]=t%2;const S=Hr[(r.currentPhase+1)%4],u=Hr[(r.currentPhase+3)%4];Hr[r.currentPhase]||(r.motorRunning&&S?(Oo(r,1,f),r.currentPhase=(r.currentPhase+1)%4,Wt=A.cycleCount):r.motorRunning&&u&&(Oo(r,-1,f),r.currentPhase=(r.currentPhase+3)%4,Wt=A.cycleCount)),Vr(r);break}}return c},yc=()=>{Fe(6,Uint8Array.from(mc)),rr(6,kc)},Zt=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0}),Ko=()=>{F[0]=Zt(0,1,!0),F[1]=Zt(1,2,!0),F[2]=Zt(2,1,!1),F[3]=Zt(3,2,!1);for(let t=0;t<F.length;t++)Gt[t]=new Uint8Array},F=[],Gt=[];Ko();let ke=2;const Pc=t=>{ke=t},jr=()=>F[ke],wc=()=>Gt[ke],ts=t=>F[t==2?1:0],$r=t=>Gt[t==2?1:0],St=()=>{for(let t=0;t<F.length;t++){const e={index:t,hardDrive:F[t].hardDrive,drive:F[t].drive,filename:F[t].filename,status:F[t].status,motorRunning:F[t].motorRunning,diskHasChanges:F[t].diskHasChanges,isWriteProtected:F[t].isWriteProtected,diskData:F[t].diskHasChanges?Gt[t]:new Uint8Array};h0(e)}},bc=t=>{const e=["","",""];for(let o=0;o<F.length;o++)(t||Gt[o].length<32e6)&&(e[o]=It.Buffer.from(Gt[o]).toString("base64"));const r={currentDrive:ke,driveState:[Zt(0,1,!0),Zt(1,2,!0),Zt(2,1,!1),Zt(3,2,!1)],driveData:e};for(let o=0;o<F.length;o++)r.driveState[o]={...F[o]};return r},Lc=t=>{Ve(Se.MOTOR_OFF),ke=t.currentDrive,t.driveState.length===3&&ke>0&&ke++,Ko();let e=0;for(let r=0;r<t.driveState.length;r++)F[e]={...t.driveState[r]},t.driveData[r]!==""&&(Gt[e]=new Uint8Array(It.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;St()},Mc=()=>{_o(F[1]),_o(F[2]),St()},qo=(t=!1)=>{Cc(t),St()},_c=t=>{let e=t.index,r=t.drive,o=t.hardDrive;t.filename!==""&&(Mo(t.filename)?(o=!0,e=t.drive<=1?0:1,r=e+1):(o=!1,e=t.drive<=1?2:3,r=e-1)),F[e]=Zt(e,r,o),F[e].filename=t.filename,F[e].motorRunning=t.motorRunning,Gt[e]=Ec(F[e],t.diskData),Gt[e].length===0&&(F[e].filename=""),St()},Oc=t=>{const e=t.index;F[e].filename=t.filename,F[e].motorRunning=t.motorRunning,F[e].isWriteProtected=t.isWriteProtected,St()};let vr=!1;const Wo=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Zo=t=>{let e=i.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=i.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=i.IND_Y:t.endsWith(",X)")?e=i.IND_X:e=i.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?i.ABS_X:i.ZP_X:t.endsWith(",Y")?e=t.length>5?i.ABS_Y:i.ZP_Y:e=t.length>3?i.ABS:i.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const o=Wo(t);if(o.operation&&o.value){switch(o.operation){case"+":r+=o.value;break;case"-":r-=o.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let ye={};const Go=(t,e,r,o)=>{let c=i.IMPLIED,f=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(ye).forEach(([u,B])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+G(B))}),Zo(r);const S=Wo(r);if(S.label){const u=S.label.startsWith("<"),B=S.label.startsWith(">"),V=S.label.startsWith("#")||B||u;if(V&&(S.label=S.label.substring(1)),S.label in ye?(f=ye[S.label],B?f=f>>8&255:u&&(f=f&255)):o===2&&console.error("Missing label: "+S.label),S.operation&&S.value){switch(S.operation){case"+":f+=S.value;break;case"-":f-=S.value;break;default:console.error("Unknown operation in operand: "+r)}f=(f%65536+65536)%65536}Cn(e)?(c=i.ZP_REL,f=f-t+254,f>255&&(f-=256)):V?c=i.IMM:(c=f>=0&&f<=255?i.ZP_REL:i.ABS,c=S.idx==="X"?c===i.ABS?i.ABS_X:i.ZP_X:c,c=S.idx==="Y"?c===i.ABS?i.ABS_Y:i.ZP_Y:c)}return[c,f]},Uc=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Nc=(t,e)=>{if(t.label in ye&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,o]=Go(e,t.instr,t.operand,2);r!==i.ABS&&r!==i.ZP_REL&&console.error("Illegal EQU value: "+t.operand),ye[t.label]=o}else ye[t.label]=e},Fc=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,o=0;r.startsWith('"')&&r.endsWith('"')?o=128:r.startsWith("'")&&r.endsWith("'")?o=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let c=0;c<r.length;c++)e.push(r.charCodeAt(c)|o);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(c=>{const f=parseInt(c,16);isNaN(f)&&console.error(`Invalid HEX value: ${c} in ${t.operand}`),e.push(f)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},xc=(t,e)=>{const r=[],o=W[t];return r.push(t),e>=0&&(r.push(e%256),o.bytes===3&&r.push(Math.trunc(e/256))),r};let es=0;const Jo=(t,e)=>{let r=es;const o=[];let c="";if(t.forEach(f=>{if(f=f.split(";")[0].trimEnd().toUpperCase(),!f)return;let S=(f+"                   ").slice(0,30)+G(r,4)+"- ";const u=Uc(f,c);if(c="",!u.instr){c=u.label;return}if(u.instr==="ORG"){if(e===1){const[K,v]=Zo(u.operand);K===i.ABS&&(es=v,r=v)}vr&&e===2&&console.log(S);return}if(e===1&&u.label&&Nc(u,r),u.instr==="EQU")return;let B=[],V,y;if(["ASC","DA","HEX"].includes(u.instr))B=Fc(u),r+=B.length;else if([V,y]=Go(r,u.instr,u.operand,e),e===2&&isNaN(y)&&console.error(`Unknown/illegal value: ${f}`),u.instr==="DB")B.push(y&255),r++;else if(u.instr==="DW")B.push(y&255),B.push(y>>8&255),r+=2;else if(u.instr==="DS")for(let K=0;K<y;K++)B.push(0),r++;else{e===2&&Cn(u.instr)&&(y<0||y>255)&&console.error(`Branch instruction out of range: ${f} value: ${y} pass: ${e}`);const K=W.findIndex(v=>v&&v.name===u.instr&&v.mode===V);K<0&&console.error(`Unknown instruction: "${f}" mode=${V} pass=${e}`),B=xc(K,y),r+=W[K].bytes}vr&&e===2&&(B.forEach(K=>{S+=` ${G(K)}`}),console.log(S)),o.push(...B)}),vr&&e===2){let f="";o.forEach(S=>{f+=` ${G(S)}`}),console.log(f)}return o},zr=(t,e,r=!1)=>{ye={},vr=r;try{return es=t,Jo(e,1),Jo(e,2)}catch(o){return console.error(o),[]}},Vo=`
        ORG   $300
        LDX   #$60
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
`,gt={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},cr={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Pe={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Qc{constructor(e){T(this,"_control");T(this,"_status");T(this,"_command");T(this,"_lastRead");T(this,"_lastConfig");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._control=cr.HW_RESET,this._command=Pe.HW_RESET,this._status=gt.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=gt.OVRN;this._status|=gt.RX_FULL,this._control&Pe.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&Pe.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(gt.PE|gt.FE|gt.OVRN),this._receiveBuffer.length?(this._status|=gt.RX_FULL,this._control&Pe.RX_INT_DIS||this.irq(!0)):this._status&=~gt.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&gt.IRQ&&this.irq(!1),this._status&=~gt.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=gt.IRQ:this._status&=~gt.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&cr.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&cr.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&cr.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Pe.PARITY_EN)switch(this._command&Pe.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=cr.HW_RESET,this._command=Pe.HW_RESET,this._status=gt.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const rs=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let tn=1,Et;const Xc=t=>{er(tn,t)},Yc=t=>{console.log("ConfigChange: ",t)},Kc=t=>{Et&&Et.buffer(t)},qc=()=>{Et&&Et.reset()},Wc=(t=!0,e=1)=>{if(!t)return;tn=e;const r={sendData:I0,interrupt:Xc,configChange:Yc};Et=new Qc(r);const o=new Uint8Array(rs.length+256);o.set(rs.slice(1792,2048)),o.set(rs,256),Fe(tn,o),rr(tn,Zc)},Zc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)Et.data=e;else return Et.data;break;case r.STATUS:if(e>=0)Et.status=e;else return Et.status;break;case r.COMMAND:if(e>=0)Et.command=e;else return Et.command;break;case r.CONTROL:if(e>=0)Et.control=e;else return Et.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},Ar=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Gc=()=>{const t=new Date,e=Ar(t.getMonth()+1,2)+","+Ar(t.getDay(),2)+","+Ar(t.getDate(),2)+","+Ar(t.getHours(),2)+","+Ar(t.getMinutes(),2);for(let r=0;r<e.length;r++)d(512+r,e.charCodeAt(r)|128)},Jc=`
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
`,Ho=()=>{Pt=0,wt=0,Jt=0,Vt=0,we=1023,be=1023,sn(0),ot=0,Ae=0,Xe=0,lr=0,ur=0,ft=0,Nt=0,Ye=0,en=0};let Pt=0,wt=0,Jt=0,Vt=0,we=1023,be=1023,en=0,ce=0,ot=0,Ae=0,Xe=0,lr=0,ur=0,ft=0,Nt=0,Ye=0,jo=0,Ft=5;const rn=54,nn=55,Vc=56,Hc=57,$o=()=>{const t=new Uint8Array(256).fill(0),e=zr(0,Jc.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},jc=(t=!0,e=5)=>{if(!t)return;Ft=e;const r=49152+Ft*256,o=49152+Ft*256+8;Fe(Ft,$o(),r,zc),Fe(Ft,$o(),o,Gc),rr(Ft,r1),Ho()},sn=t=>{ce=t,Ri(!t)},$c=()=>{if(ce&1){let t=!1;ce&8&&(Ye|=8,t=!0),ce&Ae&4&&(Ye|=4,t=!0),ce&Ae&2&&(Ye|=2,t=!0),t&&er(Ft,!0)}},vc=t=>{if(ce&1)if(t.buttons>=0){switch(t.buttons){case 0:ot&=-129;break;case 16:ot|=128;break;case 1:ot&=-17;break;case 17:ot|=16;break}Ae|=ot&128?4:0}else t.x>=0&&t.x<=1&&(Pt=Math.round((we-Jt)*t.x+Jt),Ae|=2),t.y>=0&&t.y<=1&&(wt=Math.round((be-Vt)*t.y+Vt),Ae|=2)};let fr=0,ns="",vo=0,zo=0;const zc=()=>{const t=192+Ft;C(nn)===t&&C(rn)===0?e1():C(Hc)===t&&C(Vc)===0&&t1()},t1=()=>{if(fr===0){const t=192+Ft;vo=C(nn),zo=C(rn),d(nn,t),d(rn,3);const e=(ot&128)!==(Xe&128);let r=0;ot&128?r=e?2:1:r=e?3:4,C(49152)&128&&(r=-r),Xe=ot,ns=Pt.toString()+","+wt.toString()+","+r.toString()}fr>=ns.length?(A.Accum=141,fr=0,d(nn,vo),d(rn,zo)):(A.Accum=ns.charCodeAt(fr)|128,fr++)},e1=()=>{switch(A.Accum){case 128:console.log("mouse off"),sn(0);break;case 129:console.log("mouse on"),sn(1);break}},r1=(t,e)=>{if(t>=49408)return-1;const r=e<0,o={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},c={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case o.LOWX:if(r===!1)ft=ft&65280|e,ft&=65535;else return Pt&255;break;case o.HIGHX:if(r===!1)ft=e<<8|ft&255,ft&=65535;else return Pt>>8&255;break;case o.LOWY:if(r===!1)Nt=Nt&65280|e,Nt&=65535;else return wt&255;break;case o.HIGHY:if(r===!1)Nt=e<<8|Nt&255,Nt&=65535;else return wt>>8&255;break;case o.STATUS:return ot;case o.MODE:if(r===!1)sn(e),console.log("Mouse mode: 0x",ce.toString(16));else return ce;break;case o.CLAMP:if(r===!1)en=78-e;else switch(en){case 0:return Jt>>8&255;case 1:return Vt>>8&255;case 2:return Jt&255;case 3:return Vt&255;case 4:return we>>8&255;case 5:return be>>8&255;case 6:return we&255;case 7:return be&255;default:return console.log("AppleMouse: invalid clamp index: "+en),0}break;case o.CLOCK:case o.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case o.COMMAND:if(r===!1)switch(jo=e,e){case c.INIT:console.log("cmd.init"),Pt=0,wt=0,lr=0,ur=0,Jt=0,Vt=0,we=1023,be=1023,ot=0,Ae=0;break;case c.READ:Ae=0,ot&=-112,ot|=Xe>>1&64,ot|=Xe>>4&1,Xe=ot,(lr!==Pt||ur!==wt)&&(ot|=32),lr=Pt,ur=wt;break;case c.CLEAR:console.log("cmd.clear"),Pt=0,wt=0,lr=0,ur=0;break;case c.SERVE:ot&=-15,ot|=Ye,Ye=0,er(Ft,!1);break;case c.HOME:console.log("cmd.home"),Pt=Jt,wt=Vt;break;case c.CLAMPX:console.log("cmd.clampx"),Jt=ft>32767?ft-65536:ft,we=Nt,console.log(Jt+" -> "+we);break;case c.CLAMPY:console.log("cmd.clampy"),Vt=ft>32767?ft-65536:ft,be=Nt,console.log(Vt+" -> "+be);break;case c.GCLAMP:console.log("cmd.getclamp");break;case c.POS:console.log("cmd.pos"),Pt=ft,wt=Nt;break}else return jo;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},bt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},Ht={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class n1{constructor(e){T(this,"_control");T(this,"_status");T(this,"_lastRead");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=bt.OVRN;this._status|=bt.RX_FULL,this._control&Ht.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(Ht.TX_INT_ENABLE|Ht.NRTS))===Ht.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(bt.FE|bt.OVRN|bt.PE),this._receiveBuffer.length?(this._status|=bt.RX_FULL,this._control&Ht.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~bt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(Ht.COUNTER_DIV1|Ht.COUNTER_DIV2))===(Ht.COUNTER_DIV1|Ht.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&bt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=bt.IRQ:this._status&=~bt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=bt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const xt={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},ss={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class os{constructor(){T(this,"_latch");T(this,"_count");T(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&xt.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&xt.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class s1{constructor(e){T(this,"_timer");T(this,"_status");T(this,"_statusRead");T(this,"_msb");T(this,"_lsb");T(this,"_div8");T(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new os,new os,new os],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&xt.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const o=this._timer[0].control&xt.SPECIAL,c=this._msb*256+r;this._timer[e].latch=c,o&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const o=this._timer[0].control&xt.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=o&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),o>>8&255}update(e){const r=this._timer[0].control&xt.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let o=!1;for(let c=0;c<3;c++){let f=e;if(c==2&&this._timer[2].control&xt.SPECIAL&&(this._div8>8?(f=1,this._div8%=8):f=0),o=this._timer[c].decrement(f),o){const S=this._timer[c].control;switch(S&xt.IRQ_ENABLE&&this.irq(c,!0),S&xt.COUNTER_MODE){case 0:case 16:this._timer[c].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=xt.SPECIAL}irq(e,r){const o=1<<e|ss.ANY_IRQ;r?this._status|=o:this._status&=~o,this._status?(this._status|=ss.ANY_IRQ,this._interrupt(!0)):(this._status&=~ss.ANY_IRQ,this._interrupt(!1))}}let on=2,nt,le,is=0;const o1=t=>{if(is){const e=A.cycleCount-is;nt.update(e)}is=A.cycleCount},ti=t=>{er(on,t)},i1=t=>{le&&le.buffer(t)},a1=(t=!0,e=2)=>{if(!t)return;on=e,nt=new s1(ti);const r={sendData:S0,interrupt:ti};le=new n1(r),rr(on,A1),eo(o1,on)},c1=()=>{nt&&(nt.reset(),le.reset())},A1=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let o=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?le.data=e:o=le.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?le.control=e:o=le.status;break;case r.TCONTROL1:e>=0?nt.timerControl(0,e):o=0;break;case r.TCONTROL2:e>=0?nt.timerControl(1,e):o=nt.status();break;case r.T1MSB:e>=0?nt.timerMSBw(0,e):o=nt.timerMSBr(0);break;case r.T1LSB:e>=0?nt.timerLSBw(0,e):o=nt.timerLSBr(0);break;case r.T2MSB:e>=0?nt.timerMSBw(1,e):o=nt.timerMSBr(1);break;case r.T2LSB:e>=0?nt.timerLSBw(1,e):o=nt.timerLSBr(1);break;case r.T3MSB:e>=0?nt.timerMSBw(2,e):o=nt.timerMSBr(2);break;case r.T3LSB:e>=0?nt.timerLSBw(2,e):o=nt.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return o},l1=(t=!0,e=4)=>{t&&(rr(e,y1),eo(d1,e))},as=[0,128],cs=[1,129],u1=[2,130],f1=[3,131],Ke=[4,132],qe=[5,133],an=[6,134],As=[7,135],hr=[8,136],pr=[9,137],h1=[10,138],ls=[11,139],p1=[12,140],Le=[13,141],Ir=[14,142],ei=[16,145],ri=[17,145],Qt=[18,146],us=[32,160],jt=64,ue=32,I1=(t=4)=>{for(let e=0;e<=255;e++)M(t,e,0);for(let e=0;e<=1;e++)fs(t,e)},S1=(t,e)=>(X(t,Ir[e])&jt)!==0,g1=(t,e)=>(X(t,Qt[e])&jt)!==0,ni=(t,e)=>(X(t,ls[e])&jt)!==0,E1=(t,e,r)=>{let o=X(t,Ke[e])-r;if(M(t,Ke[e],o),o<0){o=o%256+256,M(t,Ke[e],o);let c=X(t,qe[e]);if(c--,M(t,qe[e],c),c<0&&(c+=256,M(t,qe[e],c),S1(t,e)&&(!g1(t,e)||ni(t,e)))){const f=X(t,Qt[e]);M(t,Qt[e],f|jt);const S=X(t,Le[e]);if(M(t,Le[e],S|jt),fe(t,e,-1),ni(t,e)){const u=X(t,As[e]),B=X(t,an[e]);M(t,Ke[e],B),M(t,qe[e],u)}}}},m1=(t,e)=>(X(t,Ir[e])&ue)!==0,C1=(t,e)=>(X(t,Qt[e])&ue)!==0,B1=(t,e,r)=>{if(X(t,ls[e])&ue)return;let o=X(t,hr[e])-r;if(M(t,hr[e],o),o<0){o=o%256+256,M(t,hr[e],o);let c=X(t,pr[e]);if(c--,M(t,pr[e],c),c<0&&(c+=256,M(t,pr[e],c),m1(t,e)&&!C1(t,e))){const f=X(t,Qt[e]);M(t,Qt[e],f|ue);const S=X(t,Le[e]);M(t,Le[e],S|ue),fe(t,e,-1)}}},si=new Array(8).fill(0),d1=t=>{const e=A.cycleCount-si[t];for(let r=0;r<=1;r++)E1(t,r,e),B1(t,r,e);si[t]=A.cycleCount},D1=(t,e)=>{const r=[];for(let o=0;o<=15;o++)r[o]=X(t,us[e]+o);return r},R1=(t,e)=>t.length===e.length&&t.every((r,o)=>r===e[o]),We={slot:-1,chip:-1,params:[-1]};let fs=(t,e)=>{const r=D1(t,e);t===We.slot&&e===We.chip&&R1(r,We.params)||(We.slot=t,We.chip=e,We.params=r,p0({slot:t,chip:e,params:r}))};const T1=(t,e)=>{switch(X(t,as[e])&7){case 0:for(let o=0;o<=15;o++)M(t,us[e]+o,0);fs(t,e);break;case 7:M(t,ri[e],X(t,cs[e]));break;case 6:{const o=X(t,ri[e]),c=X(t,cs[e]);o>=0&&o<=15&&(M(t,us[e]+o,c),fs(t,e));break}}},fe=(t,e,r)=>{let o=X(t,Le[e]);switch(r>=0&&(o&=127-(r&127),M(t,Le[e],o)),e){case 0:er(t,o!==0);break;case 1:Ua(o!==0);break}},k1=(t,e,r)=>{let o=X(t,Ir[e]);r>=0&&(r=r&255,r&128?o|=r:o&=255-r),o|=128,M(t,Ir[e],o)},y1=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,o=t&255,c=o&128?1:0;switch(o){case as[c]:e>=0&&(M(r,as[c],e),T1(r,c));break;case cs[c]:case u1[c]:case f1[c]:case h1[c]:case ls[c]:case p1[c]:M(r,o,e);break;case Ke[c]:e>=0&&M(r,an[c],e),fe(r,c,jt);break;case qe[c]:if(e>=0){M(r,As[c],e),M(r,Ke[c],X(r,an[c])),M(r,qe[c],e);const f=X(r,Qt[c]);M(r,Qt[c],f&~jt),fe(r,c,jt)}break;case an[c]:e>=0&&(M(r,o,e),fe(r,c,jt));break;case As[c]:e>=0&&M(r,o,e);break;case hr[c]:e>=0&&M(r,ei[c],e),fe(r,c,ue);break;case pr[c]:if(e>=0){M(r,pr[c],e),M(r,hr[c],X(r,ei[c]));const f=X(r,Qt[c]);M(r,Qt[c],f&~ue),fe(r,c,ue)}break;case Le[c]:e>=0&&fe(r,c,e);break;case Ir[c]:k1(r,c,e);break}return-1},cn=40,P1=(t,e)=>t+2+(e>127?e-256:e),w1=(t,e,r,o)=>{let c="",f=`${G(e.pcode)}`,S="",u="";switch(e.bytes){case 1:f+="      ";break;case 2:S=G(r),f+=` ${S}   `;break;case 3:S=G(r),u=G(o),f+=` ${S} ${u}`;break}const B=Cn(e.name)?G(P1(t,r),4):S;switch(e.mode){case i.IMPLIED:break;case i.IMM:c=` #$${S}`;break;case i.ZP_REL:c=` $${B}`;break;case i.ZP_X:c=` $${S},X`;break;case i.ZP_Y:c=` $${S},Y`;break;case i.ABS:c=` $${u}${S}`;break;case i.ABS_X:c=` $${u}${S},X`;break;case i.ABS_Y:c=` $${u}${S},Y`;break;case i.IND_X:c=` ($${u.trim()}${S},X)`;break;case i.IND_Y:c=` ($${S}),Y`;break;case i.IND:c=` ($${u.trim()}${S})`;break}return`${G(t,4)}: ${f}  ${e.name}${c}`},b1=t=>{let e=t;e>65535-cn&&(e=65535-cn);let r="";for(let o=0;o<cn;o++){if(e>65535){r+=`
`;continue}const c=xe(e),f=W[c],S=xe(e+1),u=xe(e+2);r+=w1(e,f,S,u)+`
`,e+=f.bytes}return r},L1=(t,e)=>{if(e<t||t<0)return!1;let r=t;for(let o=0;o<cn;o++){if(r===e)return!0;const c=xe(r);if(r+=W[c].bytes,r>65535)break}return!1},M1=t=>{const e=xe(t);return W[e].name};let Ze=0;const An=192,_1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${G(An)}   ; jump address
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
`,O1=`
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
`,U1=()=>{const t=new Uint8Array(256).fill(0),e=zr(0,_1.split(`
`));t.set(e,0);const r=zr(0,O1.split(`
`));return t.set(r,An),t[254]=23,t[255]=An,t};let Sr=new Uint8Array;const hs=(t=!0)=>{Sr.length===0&&(Sr=U1()),Sr[1]=t?32:0;const r=49152+An+7*256;Fe(7,Sr,r,X1),Fe(7,Sr,r+3,Q1)},N1=(t,e)=>{if(t===0)d(e,2);else if(t<=2){d(e,240);const c=$r(t).length/512;d(e+1,c&255),d(e+2,c>>>8),d(e+3,0),sr(4),or(0)}else nr(40),sr(0),or(0),L()},F1=(t,e)=>{const c=$r(t).length/512,f=c>1600?2:1,S=f==2?32:64;d(e,240),d(e+1,c&255),d(e+2,c>>>8),d(e+3,0);const u="Apple2TS SP";d(e+4,u.length);let B=0;for(;B<u.length;B++)d(e+5+B,u.charCodeAt(B));for(;B<16;B++)d(e+5+B,u.charCodeAt(8));d(e+21,f),d(e+22,S),d(e+23,1),d(e+24,0),sr(25),or(0)},x1=(t,e,r)=>{if(C(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),nr(4),L();return}const o=C(t+4);switch(o){case 0:N1(e,r);break;case 1:case 2:nr(33),L();break;case 3:case 4:F1(e,r);break;default:console.error(`SmartPort statusCode ${o} not implemented`);break}},Q1=()=>{nr(0),L(!1);const t=256+A.StackPtr,e=C(t+1)+256*C(t+2),r=C(e+1),o=C(e+2)+256*C(e+3),c=C(o+1),f=C(o+2)+256*C(o+3);switch(r){case 0:{x1(o,c,f);return}case 1:{if(C(o)!==3){console.error(`Incorrect SmartPort parameter count at address ${o}`),L();return}const B=512*(C(o+4)+256*C(o+5)+65536*C(o+6)),y=$r(c).slice(B,B+512);Wn(f,y);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),L();return}const S=ts(c);S.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,S&&(S.motorRunning=!1),St()},500)),St()},X1=()=>{nr(0),L(!1);const t=C(66),e=Math.max(Math.min(C(67)>>6,2),0),r=ts(e);if(!r.hardDrive)return;const o=$r(e),c=C(70)+256*C(71),f=512*c,S=C(68)+256*C(69),u=o.length;switch(r.status=` ${G(c,4)}`,t){case 0:{if(r.filename.length===0||u===0){sr(0),or(0),L();return}const B=u/512;sr(B&255),or(B>>>8);break}case 1:{if(f+512>u){L();return}const B=o.slice(f,f+512);Wn(S,B);break}case 2:{if(f+512>u){L();return}if(r.isWriteProtected){L();return}const B=qn(S);o.set(B,f),r.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),L();return;default:console.error("unknown hard drive command"),L();return}L(!1),r.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,r&&(r.motorRunning=!1),St()},500)),St()};let oi=0,ln=0,gr=0,un=0,Ge=Gi,he=-1,ii=16.6881,ps=17030,ai=0,tt=O.IDLE,Je=0,fn=!1,ht=0;const x=[],Y1=()=>{m.VBL.isSet=!0,$c()},K1=()=>{m.VBL.isSet=!1},ci=()=>{const t={};for(const e in m)t[e]=m[e].isSet;return t},q1=()=>{const t=JSON.parse(JSON.stringify(A));let e=$t;for(let o=$t;o<P.length;o++)P[o]!==255&&(o+=255-o%256,e=o+1);const r=It.Buffer.from(P.slice(0,e));return{s6502:t,extraRamSize:64*(_t+1),softSwitches:ci(),memory:r.toString("base64")}},W1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));ho(r);const o=t.softSwitches;for(const f in o){const S=f;try{m[S].isSet=o[f]}catch{}}"WRITEBSR1"in o&&(m.BSR_PREWRITE.isSet=!1,m.BSR_WRITE.isSet=o.WRITEBSR1||o.WRITEBSR2||o.RDWRBSR1||o.RDWRBSR2);const c=new Uint8Array(It.Buffer.from(t.memory,"base64"));if(e<1){P.set(c.slice(0,65536)),P.set(c.slice(131072,163584),65536),P.set(c.slice(65536,131072),$t);const f=(c.length-163584)/1024;f>0&&(Qn(f+64),P.set(c.slice(163584),$t+65536))}else Qn(t.extraRamSize),P.set(c);zt(),Pr(!0)},Z1=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!1,colorMode:0,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:O.IDLE,breakpoints:At,stackDump:ec()}),Is=t=>({emulator:Z1(),state6502:q1(),driveState:bc(t),thumbnail:"",snapshots:null}),G1=()=>{const t=Is(!0);return t.snapshots=x,t},J1=t=>{t.PC!==A.PC&&(he=t.PC),ho(t),pe()},hn=(t,e=!1)=>{var o,c;Ss();const r=(o=t.emulator)!=null&&o.version?t.emulator.version:.9;W1(t.state6502,r),(c=t.emulator)!=null&&c.stackDump&&rc(t.emulator.stackDump),Lc(t.driveState),he=A.PC,e&&(x.length=0,ht=0),t.snapshots&&(x.length=0,x.push(...t.snapshots),ht=x.length),pe()};let Ai=!1;const li=()=>{Ai||(Ai=!0,Wc(),a1(!0,2),l1(!0,4),jc(!0,5),yc(),hs())},V1=()=>{Mc(),yn(),Ho(),c1(),qc(),I1(4)},pn=()=>{if(_r(0),ja(),li(),Vo.length>0){const e=zr(768,Vo.split(`
`));P.set(e,768)}Ss(),Pr(!0),ts(1).filename===""&&(hs(!1),setTimeout(()=>{hs()},200))},Ss=()=>{Na(),Pa(),C(49282),po(),V1()},H1=t=>{gr=t,ii=[16.6881,16.6881,1][gr],ps=[17030,17030*4,17030*4][gr],gi()},j1=t=>{Ge=t,pe()},$1=(t,e)=>{P[t]=e,Ge&&pe()},v1=t=>{he=t,pe(),t===O.PAUSED&&(he=A.PC)},ui=()=>{const t=ht-1;return t<0||!x[t]?-1:t},fi=()=>{const t=ht+1;return t>=x.length||!x[t]?-1:t},hi=()=>{x.length===Ji&&x.shift(),x.push(Is(!1)),ht=x.length,g0(x[x.length-1].state6502.s6502.PC),Pr(!1)},z1=()=>{let t=ui();t<0||(Lt(O.PAUSED),setTimeout(()=>{ht===x.length&&(hi(),t=Math.max(ht-2,0)),ht=t,hn(x[ht])},50))},t0=()=>{const t=fi();t<0||(Lt(O.PAUSED),setTimeout(()=>{ht=t,hn(x[t])},50))},e0=t=>{t<0||t>=x.length||(Lt(O.PAUSED),setTimeout(()=>{ht=t,hn(x[t])},50))},r0=()=>{const t=[];for(let e=0;e<x.length;e++)t[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return t},n0=t=>{x.length>0&&(x[x.length-1].thumbnail=t)};let In=null;const pi=(t=!1)=>{In&&clearTimeout(In),t?In=setTimeout(()=>{fn=!0,In=null},100):fn=!0},Ii=()=>{wr(),tt===O.IDLE&&(pn(),tt=O.PAUSED),Un(),Lt(O.PAUSED)},s0=()=>{wr(),tt===O.IDLE&&(pn(),tt=O.PAUSED),C(A.PC,!1)===32?(Un(),Si()):Ii()},Si=()=>{wr(),tt===O.IDLE&&(pn(),tt=O.PAUSED),_a(),Lt(O.RUNNING)},gi=()=>{Je=0,ln=performance.now(),oi=ln},Lt=t=>{if(li(),tt=t,tt===O.PAUSED)qo(),L1(he,A.PC)||(he=A.PC);else if(tt===O.RUNNING){for(qo(!0),wr();x.length>0&&ht<x.length-1;)x.pop();ht=x.length}pe(),gi(),un===0&&(un=1,Ci())},Ei=t=>{tt===O.IDLE?(Lt(O.NEED_BOOT),setTimeout(()=>{Lt(O.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},o0=(t,e,r)=>{Ei(()=>{Wn(t,e),r&&Ot(t)})},i0=t=>{Ei(()=>{Zs(t)})},a0=()=>Ge&&tt===O.PAUSED?tc():new Uint8Array,c0=()=>tt===O.RUNNING?"":b1(he>=0?he:A.PC),A0=()=>Ge&&tt!==O.IDLE?nc():"",pe=()=>{const t={addressGetTable:st,altChar:m.ALTCHARSET.isSet,arrowKeysAsJoystick:!1,breakpoints:At,button0:m.PB0.isSet,button1:m.PB1.isSet,canGoBackward:ui()>=0,canGoForward:fi()>=0,capsLock:!0,c800Slot:Fn(),colorMode:ds.COLOR,cout:C(57)<<8|C(56),cpuSpeed:un,darkMode:!1,disassembly:c0(),extraRamSize:64*(_t+1),helpText:"",hires:za(),iTempState:ht,isDebugging:Ge,lores:Kn(!0),memoryDump:a0(),nextInstruction:M1(A.PC),noDelayMode:!m.COLUMN80.isSet&&!m.AN3.isSet,ramWorksBank:De(),runMode:tt,s6502:A,softSwitches:ci(),speedMode:gr,stackString:A0(),textPage:Kn(),timeTravelThumbnails:r0(),useOpenAppleKey:!1};u0(t)},l0=t=>{if(t)for(let e=0;e<t.length;e++)wa(t[e]);else ba();pe()},mi=()=>{const t=performance.now();if(ai=t-ln,ai<ii||(ln=t,tt===O.IDLE||tt===O.PAUSED))return;tt===O.NEED_BOOT?(pn(),Lt(O.RUNNING)):tt===O.NEED_RESET&&(Ss(),Lt(O.RUNNING));let e=0;for(;;){const o=Un();if(o<0)break;if(e+=o,e%17030>=12480&&(m.VBL.isSet||Y1()),e>=ps){K1();break}}Je++;const r=Je*ps/(performance.now()-oi);un=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,Je%2&&(na(),pe()),fn&&(fn=!1,hi())},Ci=()=>{mi();const t=Je+[1,5,10][gr];for(;tt===O.RUNNING&&Je!==t;)mi();setTimeout(Ci,tt===O.RUNNING?0:20)},mt=(t,e)=>{self.postMessage({msg:t,payload:e})},u0=t=>{mt(ut.MACHINE_STATE,t)},f0=t=>{mt(ut.CLICK,t)},h0=t=>{mt(ut.DRIVE_PROPS,t)},Ve=t=>{mt(ut.DRIVE_SOUND,t)},Bi=t=>{mt(ut.SAVE_STATE,t)},Sn=t=>{mt(ut.RUMBLE,t)},di=t=>{mt(ut.HELP_TEXT,t)},Di=t=>{mt(ut.ENHANCED_MIDI,t)},Ri=t=>{mt(ut.SHOW_MOUSE,t)},p0=t=>{mt(ut.MBOARD_SOUND,t)},I0=t=>{mt(ut.COMM_DATA,t)},S0=t=>{mt(ut.MIDI_DATA,t)},g0=t=>{mt(ut.REQUEST_THUMBNAIL,t)};typeof self<"u"&&(self.onmessage=t=>{if("msg"in t.data)switch(t.data.msg){case N.RUN_MODE:Lt(t.data.payload);break;case N.STATE6502:J1(t.data.payload);break;case N.DEBUG:j1(t.data.payload);break;case N.DISASSEMBLE_ADDR:v1(t.data.payload);break;case N.BREAKPOINTS:Oa(t.data.payload);break;case N.STEP_INTO:Ii();break;case N.STEP_OVER:s0();break;case N.STEP_OUT:Si();break;case N.SPEED:H1(t.data.payload);break;case N.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?t0():z1();break;case N.TIME_TRAVEL_INDEX:e0(t.data.payload);break;case N.TIME_TRAVEL_SNAPSHOT:pi();break;case N.THUMBNAIL_IMAGE:n0(t.data.payload);break;case N.RESTORE_STATE:hn(t.data.payload,!0);break;case N.KEYPRESS:Ta(t.data.payload);break;case N.MOUSEEVENT:vc(t.data.payload);break;case N.PASTE_TEXT:i0(t.data.payload),Zs(t.data.payload);break;case N.APPLE_PRESS:Us(!0,t.data.payload);break;case N.APPLE_RELEASE:Us(!1,t.data.payload);break;case N.GET_SAVE_STATE:Bi(Is(!0));break;case N.GET_SAVE_STATE_SNAPSHOTS:Bi(G1());break;case N.DRIVE_PROPS:{const e=t.data.payload;Oc(e);break}case N.DRIVE_NEW_DATA:{const e=t.data.payload;_c(e);break}case N.GAMEPAD:ea(t.data.payload);break;case N.SET_BINARY_BLOCK:{const e=t.data.payload;o0(e.address,e.data,e.run);break}case N.SET_MEMORY:{const e=t.data.payload;$1(e.address,e.value);break}case N.COMM_DATA:Kc(t.data.payload);break;case N.MIDI_DATA:i1(t.data.payload);break;case N.RamWorks:Qn(t.data.payload);break;case N.SOFTSWITCHES:l0(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
