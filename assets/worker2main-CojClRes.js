var F0=Object.defineProperty;var x0=(ft,Et,it)=>Et in ft?F0(ft,Et,{enumerable:!0,configurable:!0,writable:!0,value:it}):ft[Et]=it;var T=(ft,Et,it)=>x0(ft,typeof Et!="symbol"?Et+"":Et,it);(function(){"use strict";var ft={},Et={};Et.byteLength=xi,Et.toByteArray=Xi,Et.fromByteArray=qi;for(var it=[],mt=[],Ni=typeof Uint8Array<"u"?Uint8Array:Array,gn="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Me=0,Fi=gn.length;Me<Fi;++Me)it[Me]=gn[Me],mt[gn.charCodeAt(Me)]=Me;mt[45]=62,mt[95]=63;function Cs(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");r===-1&&(r=e);var o=r===e?0:4-r%4;return[r,o]}function xi(t){var e=Cs(t),r=e[0],o=e[1];return(r+o)*3/4-o}function Qi(t,e,r){return(e+r)*3/4-r}function Xi(t){var e,r=Cs(t),o=r[0],c=r[1],h=new Ni(Qi(t,o,c)),S=0,u=c>0?o-4:o,B;for(B=0;B<u;B+=4)e=mt[t.charCodeAt(B)]<<18|mt[t.charCodeAt(B+1)]<<12|mt[t.charCodeAt(B+2)]<<6|mt[t.charCodeAt(B+3)],h[S++]=e>>16&255,h[S++]=e>>8&255,h[S++]=e&255;return c===2&&(e=mt[t.charCodeAt(B)]<<2|mt[t.charCodeAt(B+1)]>>4,h[S++]=e&255),c===1&&(e=mt[t.charCodeAt(B)]<<10|mt[t.charCodeAt(B+1)]<<4|mt[t.charCodeAt(B+2)]>>2,h[S++]=e>>8&255,h[S++]=e&255),h}function Yi(t){return it[t>>18&63]+it[t>>12&63]+it[t>>6&63]+it[t&63]}function Ki(t,e,r){for(var o,c=[],h=e;h<r;h+=3)o=(t[h]<<16&16711680)+(t[h+1]<<8&65280)+(t[h+2]&255),c.push(Yi(o));return c.join("")}function qi(t){for(var e,r=t.length,o=r%3,c=[],h=16383,S=0,u=r-o;S<u;S+=h)c.push(Ki(t,S,S+h>u?u:S+h));return o===1?(e=t[r-1],c.push(it[e>>2]+it[e<<4&63]+"==")):o===2&&(e=(t[r-2]<<8)+t[r-1],c.push(it[e>>10]+it[e>>4&63]+it[e<<2&63]+"=")),c.join("")}var En={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */En.read=function(t,e,r,o,c){var h,S,u=c*8-o-1,B=(1<<u)-1,G=B>>1,y=-7,z=r?c-1:0,Y=r?-1:1,j=t[e+z];for(z+=Y,h=j&(1<<-y)-1,j>>=-y,y+=u;y>0;h=h*256+t[e+z],z+=Y,y-=8);for(S=h&(1<<-y)-1,h>>=-y,y+=o;y>0;S=S*256+t[e+z],z+=Y,y-=8);if(h===0)h=1-G;else{if(h===B)return S?NaN:(j?-1:1)*(1/0);S=S+Math.pow(2,o),h=h-G}return(j?-1:1)*S*Math.pow(2,h-o)},En.write=function(t,e,r,o,c,h){var S,u,B,G=h*8-c-1,y=(1<<G)-1,z=y>>1,Y=c===23?Math.pow(2,-24)-Math.pow(2,-77):0,j=o?0:h-1,gr=o?1:-1,Er=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,S=y):(S=Math.floor(Math.log(e)/Math.LN2),e*(B=Math.pow(2,-S))<1&&(S--,B*=2),S+z>=1?e+=Y/B:e+=Y*Math.pow(2,1-z),e*B>=2&&(S++,B/=2),S+z>=y?(u=0,S=y):S+z>=1?(u=(e*B-1)*Math.pow(2,c),S=S+z):(u=e*Math.pow(2,z-1)*Math.pow(2,c),S=0));c>=8;t[r+j]=u&255,j+=gr,u/=256,c-=8);for(S=S<<c|u,G+=c;G>0;t[r+j]=S&255,j+=gr,S/=256,G-=8);t[r+j-gr]|=Er*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(t){const e=Et,r=En,o=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;t.Buffer=u,t.SlowBuffer=g0,t.INSPECT_MAX_BYTES=50;const c=2147483647;t.kMaxLength=c,u.TYPED_ARRAY_SUPPORT=h(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const a=new Uint8Array(1),n={foo:function(){return 42}};return Object.setPrototypeOf(n,Uint8Array.prototype),Object.setPrototypeOf(a,n),a.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function S(a){if(a>c)throw new RangeError('The value "'+a+'" is invalid for option "size"');const n=new Uint8Array(a);return Object.setPrototypeOf(n,u.prototype),n}function u(a,n,s){if(typeof a=="number"){if(typeof n=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return z(a)}return B(a,n,s)}u.poolSize=8192;function B(a,n,s){if(typeof a=="string")return Y(a,n);if(ArrayBuffer.isView(a))return gr(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(Qt(a,ArrayBuffer)||a&&Qt(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Qt(a,SharedArrayBuffer)||a&&Qt(a.buffer,SharedArrayBuffer)))return Er(a,n,s);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=a.valueOf&&a.valueOf();if(l!=null&&l!==a)return u.from(l,n,s);const p=S0(a);if(p)return p;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return u.from(a[Symbol.toPrimitive]("string"),n,s);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}u.from=function(a,n,s){return B(a,n,s)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function G(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function y(a,n,s){return G(a),a<=0?S(a):n!==void 0?typeof s=="string"?S(a).fill(n,s):S(a).fill(n):S(a)}u.alloc=function(a,n,s){return y(a,n,s)};function z(a){return G(a),S(a<0?0:Ss(a)|0)}u.allocUnsafe=function(a){return z(a)},u.allocUnsafeSlow=function(a){return z(a)};function Y(a,n){if((typeof n!="string"||n==="")&&(n="utf8"),!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n);const s=Di(a,n)|0;let l=S(s);const p=l.write(a,n);return p!==s&&(l=l.slice(0,p)),l}function j(a){const n=a.length<0?0:Ss(a.length)|0,s=S(n);for(let l=0;l<n;l+=1)s[l]=a[l]&255;return s}function gr(a){if(Qt(a,Uint8Array)){const n=new Uint8Array(a);return Er(n.buffer,n.byteOffset,n.byteLength)}return j(a)}function Er(a,n,s){if(n<0||a.byteLength<n)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<n+(s||0))throw new RangeError('"length" is outside of buffer bounds');let l;return n===void 0&&s===void 0?l=new Uint8Array(a):s===void 0?l=new Uint8Array(a,n):l=new Uint8Array(a,n,s),Object.setPrototypeOf(l,u.prototype),l}function S0(a){if(u.isBuffer(a)){const n=Ss(a.length)|0,s=S(n);return s.length===0||a.copy(s,0,0,n),s}if(a.length!==void 0)return typeof a.length!="number"||ms(a.length)?S(0):j(a);if(a.type==="Buffer"&&Array.isArray(a.data))return j(a.data)}function Ss(a){if(a>=c)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+c.toString(16)+" bytes");return a|0}function g0(a){return+a!=a&&(a=0),u.alloc(+a)}u.isBuffer=function(n){return n!=null&&n._isBuffer===!0&&n!==u.prototype},u.compare=function(n,s){if(Qt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),Qt(s,Uint8Array)&&(s=u.from(s,s.offset,s.byteLength)),!u.isBuffer(n)||!u.isBuffer(s))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(n===s)return 0;let l=n.length,p=s.length;for(let g=0,E=Math.min(l,p);g<E;++g)if(n[g]!==s[g]){l=n[g],p=s[g];break}return l<p?-1:p<l?1:0},u.isEncoding=function(n){switch(String(n).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(n,s){if(!Array.isArray(n))throw new TypeError('"list" argument must be an Array of Buffers');if(n.length===0)return u.alloc(0);let l;if(s===void 0)for(s=0,l=0;l<n.length;++l)s+=n[l].length;const p=u.allocUnsafe(s);let g=0;for(l=0;l<n.length;++l){let E=n[l];if(Qt(E,Uint8Array))g+E.length>p.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(p,g)):Uint8Array.prototype.set.call(p,E,g);else if(u.isBuffer(E))E.copy(p,g);else throw new TypeError('"list" argument must be an Array of Buffers');g+=E.length}return p};function Di(a,n){if(u.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||Qt(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const s=a.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&s===0)return 0;let p=!1;for(;;)switch(n){case"ascii":case"latin1":case"binary":return s;case"utf8":case"utf-8":return Es(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return s*2;case"hex":return s>>>1;case"base64":return Ui(a).length;default:if(p)return l?-1:Es(a).length;n=(""+n).toLowerCase(),p=!0}}u.byteLength=Di;function E0(a,n,s){let l=!1;if((n===void 0||n<0)&&(n=0),n>this.length||((s===void 0||s>this.length)&&(s=this.length),s<=0)||(s>>>=0,n>>>=0,s<=n))return"";for(a||(a="utf8");;)switch(a){case"hex":return P0(this,n,s);case"utf8":case"utf-8":return ki(this,n,s);case"ascii":return k0(this,n,s);case"latin1":case"binary":return y0(this,n,s);case"base64":return R0(this,n,s);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return w0(this,n,s);default:if(l)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function Le(a,n,s){const l=a[n];a[n]=a[s],a[s]=l}u.prototype.swap16=function(){const n=this.length;if(n%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let s=0;s<n;s+=2)Le(this,s,s+1);return this},u.prototype.swap32=function(){const n=this.length;if(n%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let s=0;s<n;s+=4)Le(this,s,s+3),Le(this,s+1,s+2);return this},u.prototype.swap64=function(){const n=this.length;if(n%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let s=0;s<n;s+=8)Le(this,s,s+7),Le(this,s+1,s+6),Le(this,s+2,s+5),Le(this,s+3,s+4);return this},u.prototype.toString=function(){const n=this.length;return n===0?"":arguments.length===0?ki(this,0,n):E0.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(n){if(!u.isBuffer(n))throw new TypeError("Argument must be a Buffer");return this===n?!0:u.compare(this,n)===0},u.prototype.inspect=function(){let n="";const s=t.INSPECT_MAX_BYTES;return n=this.toString("hex",0,s).replace(/(.{2})/g,"$1 ").trim(),this.length>s&&(n+=" ... "),"<Buffer "+n+">"},o&&(u.prototype[o]=u.prototype.inspect),u.prototype.compare=function(n,s,l,p,g){if(Qt(n,Uint8Array)&&(n=u.from(n,n.offset,n.byteLength)),!u.isBuffer(n))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof n);if(s===void 0&&(s=0),l===void 0&&(l=n?n.length:0),p===void 0&&(p=0),g===void 0&&(g=this.length),s<0||l>n.length||p<0||g>this.length)throw new RangeError("out of range index");if(p>=g&&s>=l)return 0;if(p>=g)return-1;if(s>=l)return 1;if(s>>>=0,l>>>=0,p>>>=0,g>>>=0,this===n)return 0;let E=g-p,w=l-s;const J=Math.min(E,w),q=this.slice(p,g),V=n.slice(s,l);for(let K=0;K<J;++K)if(q[K]!==V[K]){E=q[K],w=V[K];break}return E<w?-1:w<E?1:0};function Ri(a,n,s,l,p){if(a.length===0)return-1;if(typeof s=="string"?(l=s,s=0):s>2147483647?s=2147483647:s<-2147483648&&(s=-2147483648),s=+s,ms(s)&&(s=p?0:a.length-1),s<0&&(s=a.length+s),s>=a.length){if(p)return-1;s=a.length-1}else if(s<0)if(p)s=0;else return-1;if(typeof n=="string"&&(n=u.from(n,l)),u.isBuffer(n))return n.length===0?-1:Ti(a,n,s,l,p);if(typeof n=="number")return n=n&255,typeof Uint8Array.prototype.indexOf=="function"?p?Uint8Array.prototype.indexOf.call(a,n,s):Uint8Array.prototype.lastIndexOf.call(a,n,s):Ti(a,[n],s,l,p);throw new TypeError("val must be string, number or Buffer")}function Ti(a,n,s,l,p){let g=1,E=a.length,w=n.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(a.length<2||n.length<2)return-1;g=2,E/=2,w/=2,s/=2}function J(V,K){return g===1?V[K]:V.readUInt16BE(K*g)}let q;if(p){let V=-1;for(q=s;q<E;q++)if(J(a,q)===J(n,V===-1?0:q-V)){if(V===-1&&(V=q),q-V+1===w)return V*g}else V!==-1&&(q-=q-V),V=-1}else for(s+w>E&&(s=E-w),q=s;q>=0;q--){let V=!0;for(let K=0;K<w;K++)if(J(a,q+K)!==J(n,K)){V=!1;break}if(V)return q}return-1}u.prototype.includes=function(n,s,l){return this.indexOf(n,s,l)!==-1},u.prototype.indexOf=function(n,s,l){return Ri(this,n,s,l,!0)},u.prototype.lastIndexOf=function(n,s,l){return Ri(this,n,s,l,!1)};function m0(a,n,s,l){s=Number(s)||0;const p=a.length-s;l?(l=Number(l),l>p&&(l=p)):l=p;const g=n.length;l>g/2&&(l=g/2);let E;for(E=0;E<l;++E){const w=parseInt(n.substr(E*2,2),16);if(ms(w))return E;a[s+E]=w}return E}function C0(a,n,s,l){return Sn(Es(n,a.length-s),a,s,l)}function B0(a,n,s,l){return Sn(_0(n),a,s,l)}function d0(a,n,s,l){return Sn(Ui(n),a,s,l)}function D0(a,n,s,l){return Sn(O0(n,a.length-s),a,s,l)}u.prototype.write=function(n,s,l,p){if(s===void 0)p="utf8",l=this.length,s=0;else if(l===void 0&&typeof s=="string")p=s,l=this.length,s=0;else if(isFinite(s))s=s>>>0,isFinite(l)?(l=l>>>0,p===void 0&&(p="utf8")):(p=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const g=this.length-s;if((l===void 0||l>g)&&(l=g),n.length>0&&(l<0||s<0)||s>this.length)throw new RangeError("Attempt to write outside buffer bounds");p||(p="utf8");let E=!1;for(;;)switch(p){case"hex":return m0(this,n,s,l);case"utf8":case"utf-8":return C0(this,n,s,l);case"ascii":case"latin1":case"binary":return B0(this,n,s,l);case"base64":return d0(this,n,s,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return D0(this,n,s,l);default:if(E)throw new TypeError("Unknown encoding: "+p);p=(""+p).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function R0(a,n,s){return n===0&&s===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(n,s))}function ki(a,n,s){s=Math.min(a.length,s);const l=[];let p=n;for(;p<s;){const g=a[p];let E=null,w=g>239?4:g>223?3:g>191?2:1;if(p+w<=s){let J,q,V,K;switch(w){case 1:g<128&&(E=g);break;case 2:J=a[p+1],(J&192)===128&&(K=(g&31)<<6|J&63,K>127&&(E=K));break;case 3:J=a[p+1],q=a[p+2],(J&192)===128&&(q&192)===128&&(K=(g&15)<<12|(J&63)<<6|q&63,K>2047&&(K<55296||K>57343)&&(E=K));break;case 4:J=a[p+1],q=a[p+2],V=a[p+3],(J&192)===128&&(q&192)===128&&(V&192)===128&&(K=(g&15)<<18|(J&63)<<12|(q&63)<<6|V&63,K>65535&&K<1114112&&(E=K))}}E===null?(E=65533,w=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),p+=w}return T0(l)}const yi=4096;function T0(a){const n=a.length;if(n<=yi)return String.fromCharCode.apply(String,a);let s="",l=0;for(;l<n;)s+=String.fromCharCode.apply(String,a.slice(l,l+=yi));return s}function k0(a,n,s){let l="";s=Math.min(a.length,s);for(let p=n;p<s;++p)l+=String.fromCharCode(a[p]&127);return l}function y0(a,n,s){let l="";s=Math.min(a.length,s);for(let p=n;p<s;++p)l+=String.fromCharCode(a[p]);return l}function P0(a,n,s){const l=a.length;(!n||n<0)&&(n=0),(!s||s<0||s>l)&&(s=l);let p="";for(let g=n;g<s;++g)p+=U0[a[g]];return p}function w0(a,n,s){const l=a.slice(n,s);let p="";for(let g=0;g<l.length-1;g+=2)p+=String.fromCharCode(l[g]+l[g+1]*256);return p}u.prototype.slice=function(n,s){const l=this.length;n=~~n,s=s===void 0?l:~~s,n<0?(n+=l,n<0&&(n=0)):n>l&&(n=l),s<0?(s+=l,s<0&&(s=0)):s>l&&(s=l),s<n&&(s=n);const p=this.subarray(n,s);return Object.setPrototypeOf(p,u.prototype),p};function st(a,n,s){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+n>s)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||st(n,s,this.length);let p=this[n],g=1,E=0;for(;++E<s&&(g*=256);)p+=this[n+E]*g;return p},u.prototype.readUintBE=u.prototype.readUIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||st(n,s,this.length);let p=this[n+--s],g=1;for(;s>0&&(g*=256);)p+=this[n+--s]*g;return p},u.prototype.readUint8=u.prototype.readUInt8=function(n,s){return n=n>>>0,s||st(n,1,this.length),this[n]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(n,s){return n=n>>>0,s||st(n,2,this.length),this[n]|this[n+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(n,s){return n=n>>>0,s||st(n,2,this.length),this[n]<<8|this[n+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(n,s){return n=n>>>0,s||st(n,4,this.length),(this[n]|this[n+1]<<8|this[n+2]<<16)+this[n+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(n,s){return n=n>>>0,s||st(n,4,this.length),this[n]*16777216+(this[n+1]<<16|this[n+2]<<8|this[n+3])},u.prototype.readBigUInt64LE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const p=s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24,g=this[++n]+this[++n]*2**8+this[++n]*2**16+l*2**24;return BigInt(p)+(BigInt(g)<<BigInt(32))}),u.prototype.readBigUInt64BE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const p=s*2**24+this[++n]*2**16+this[++n]*2**8+this[++n],g=this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l;return(BigInt(p)<<BigInt(32))+BigInt(g)}),u.prototype.readIntLE=function(n,s,l){n=n>>>0,s=s>>>0,l||st(n,s,this.length);let p=this[n],g=1,E=0;for(;++E<s&&(g*=256);)p+=this[n+E]*g;return g*=128,p>=g&&(p-=Math.pow(2,8*s)),p},u.prototype.readIntBE=function(n,s,l){n=n>>>0,s=s>>>0,l||st(n,s,this.length);let p=s,g=1,E=this[n+--p];for(;p>0&&(g*=256);)E+=this[n+--p]*g;return g*=128,E>=g&&(E-=Math.pow(2,8*s)),E},u.prototype.readInt8=function(n,s){return n=n>>>0,s||st(n,1,this.length),this[n]&128?(255-this[n]+1)*-1:this[n]},u.prototype.readInt16LE=function(n,s){n=n>>>0,s||st(n,2,this.length);const l=this[n]|this[n+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(n,s){n=n>>>0,s||st(n,2,this.length);const l=this[n+1]|this[n]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(n,s){return n=n>>>0,s||st(n,4,this.length),this[n]|this[n+1]<<8|this[n+2]<<16|this[n+3]<<24},u.prototype.readInt32BE=function(n,s){return n=n>>>0,s||st(n,4,this.length),this[n]<<24|this[n+1]<<16|this[n+2]<<8|this[n+3]},u.prototype.readBigInt64LE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const p=this[n+4]+this[n+5]*2**8+this[n+6]*2**16+(l<<24);return(BigInt(p)<<BigInt(32))+BigInt(s+this[++n]*2**8+this[++n]*2**16+this[++n]*2**24)}),u.prototype.readBigInt64BE=pe(function(n){n=n>>>0,He(n,"offset");const s=this[n],l=this[n+7];(s===void 0||l===void 0)&&mr(n,this.length-8);const p=(s<<24)+this[++n]*2**16+this[++n]*2**8+this[++n];return(BigInt(p)<<BigInt(32))+BigInt(this[++n]*2**24+this[++n]*2**16+this[++n]*2**8+l)}),u.prototype.readFloatLE=function(n,s){return n=n>>>0,s||st(n,4,this.length),r.read(this,n,!0,23,4)},u.prototype.readFloatBE=function(n,s){return n=n>>>0,s||st(n,4,this.length),r.read(this,n,!1,23,4)},u.prototype.readDoubleLE=function(n,s){return n=n>>>0,s||st(n,8,this.length),r.read(this,n,!0,52,8)},u.prototype.readDoubleBE=function(n,s){return n=n>>>0,s||st(n,8,this.length),r.read(this,n,!1,52,8)};function ht(a,n,s,l,p,g){if(!u.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(n>p||n<g)throw new RangeError('"value" argument is out of bounds');if(s+l>a.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(n,s,l,p){if(n=+n,s=s>>>0,l=l>>>0,!p){const w=Math.pow(2,8*l)-1;ht(this,n,s,l,w,0)}let g=1,E=0;for(this[s]=n&255;++E<l&&(g*=256);)this[s+E]=n/g&255;return s+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(n,s,l,p){if(n=+n,s=s>>>0,l=l>>>0,!p){const w=Math.pow(2,8*l)-1;ht(this,n,s,l,w,0)}let g=l-1,E=1;for(this[s+g]=n&255;--g>=0&&(E*=256);)this[s+g]=n/E&255;return s+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,1,255,0),this[s]=n&255,s+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,2,65535,0),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,2,65535,0),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,4,4294967295,0),this[s+3]=n>>>24,this[s+2]=n>>>16,this[s+1]=n>>>8,this[s]=n&255,s+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,4,4294967295,0),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4};function Pi(a,n,s,l,p){Oi(n,l,p,a,s,7);let g=Number(n&BigInt(4294967295));a[s++]=g,g=g>>8,a[s++]=g,g=g>>8,a[s++]=g,g=g>>8,a[s++]=g;let E=Number(n>>BigInt(32)&BigInt(4294967295));return a[s++]=E,E=E>>8,a[s++]=E,E=E>>8,a[s++]=E,E=E>>8,a[s++]=E,s}function wi(a,n,s,l,p){Oi(n,l,p,a,s,7);let g=Number(n&BigInt(4294967295));a[s+7]=g,g=g>>8,a[s+6]=g,g=g>>8,a[s+5]=g,g=g>>8,a[s+4]=g;let E=Number(n>>BigInt(32)&BigInt(4294967295));return a[s+3]=E,E=E>>8,a[s+2]=E,E=E>>8,a[s+1]=E,E=E>>8,a[s]=E,s+8}u.prototype.writeBigUInt64LE=pe(function(n,s=0){return Pi(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=pe(function(n,s=0){return wi(this,n,s,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(n,s,l,p){if(n=+n,s=s>>>0,!p){const J=Math.pow(2,8*l-1);ht(this,n,s,l,J-1,-J)}let g=0,E=1,w=0;for(this[s]=n&255;++g<l&&(E*=256);)n<0&&w===0&&this[s+g-1]!==0&&(w=1),this[s+g]=(n/E>>0)-w&255;return s+l},u.prototype.writeIntBE=function(n,s,l,p){if(n=+n,s=s>>>0,!p){const J=Math.pow(2,8*l-1);ht(this,n,s,l,J-1,-J)}let g=l-1,E=1,w=0;for(this[s+g]=n&255;--g>=0&&(E*=256);)n<0&&w===0&&this[s+g+1]!==0&&(w=1),this[s+g]=(n/E>>0)-w&255;return s+l},u.prototype.writeInt8=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,1,127,-128),n<0&&(n=255+n+1),this[s]=n&255,s+1},u.prototype.writeInt16LE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,2,32767,-32768),this[s]=n&255,this[s+1]=n>>>8,s+2},u.prototype.writeInt16BE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,2,32767,-32768),this[s]=n>>>8,this[s+1]=n&255,s+2},u.prototype.writeInt32LE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,4,2147483647,-2147483648),this[s]=n&255,this[s+1]=n>>>8,this[s+2]=n>>>16,this[s+3]=n>>>24,s+4},u.prototype.writeInt32BE=function(n,s,l){return n=+n,s=s>>>0,l||ht(this,n,s,4,2147483647,-2147483648),n<0&&(n=4294967295+n+1),this[s]=n>>>24,this[s+1]=n>>>16,this[s+2]=n>>>8,this[s+3]=n&255,s+4},u.prototype.writeBigInt64LE=pe(function(n,s=0){return Pi(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=pe(function(n,s=0){return wi(this,n,s,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function bi(a,n,s,l,p,g){if(s+l>a.length)throw new RangeError("Index out of range");if(s<0)throw new RangeError("Index out of range")}function Li(a,n,s,l,p){return n=+n,s=s>>>0,p||bi(a,n,s,4),r.write(a,n,s,l,23,4),s+4}u.prototype.writeFloatLE=function(n,s,l){return Li(this,n,s,!0,l)},u.prototype.writeFloatBE=function(n,s,l){return Li(this,n,s,!1,l)};function Mi(a,n,s,l,p){return n=+n,s=s>>>0,p||bi(a,n,s,8),r.write(a,n,s,l,52,8),s+8}u.prototype.writeDoubleLE=function(n,s,l){return Mi(this,n,s,!0,l)},u.prototype.writeDoubleBE=function(n,s,l){return Mi(this,n,s,!1,l)},u.prototype.copy=function(n,s,l,p){if(!u.isBuffer(n))throw new TypeError("argument should be a Buffer");if(l||(l=0),!p&&p!==0&&(p=this.length),s>=n.length&&(s=n.length),s||(s=0),p>0&&p<l&&(p=l),p===l||n.length===0||this.length===0)return 0;if(s<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(p<0)throw new RangeError("sourceEnd out of bounds");p>this.length&&(p=this.length),n.length-s<p-l&&(p=n.length-s+l);const g=p-l;return this===n&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(s,l,p):Uint8Array.prototype.set.call(n,this.subarray(l,p),s),g},u.prototype.fill=function(n,s,l,p){if(typeof n=="string"){if(typeof s=="string"?(p=s,s=0,l=this.length):typeof l=="string"&&(p=l,l=this.length),p!==void 0&&typeof p!="string")throw new TypeError("encoding must be a string");if(typeof p=="string"&&!u.isEncoding(p))throw new TypeError("Unknown encoding: "+p);if(n.length===1){const E=n.charCodeAt(0);(p==="utf8"&&E<128||p==="latin1")&&(n=E)}}else typeof n=="number"?n=n&255:typeof n=="boolean"&&(n=Number(n));if(s<0||this.length<s||this.length<l)throw new RangeError("Out of range index");if(l<=s)return this;s=s>>>0,l=l===void 0?this.length:l>>>0,n||(n=0);let g;if(typeof n=="number")for(g=s;g<l;++g)this[g]=n;else{const E=u.isBuffer(n)?n:u.from(n,p),w=E.length;if(w===0)throw new TypeError('The value "'+n+'" is invalid for argument "value"');for(g=0;g<l-s;++g)this[g+s]=E[g%w]}return this};const Ve={};function gs(a,n,s){Ve[a]=class extends s{constructor(){super(),Object.defineProperty(this,"message",{value:n.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(p){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:p,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}gs("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),gs("ERR_INVALID_ARG_TYPE",function(a,n){return`The "${a}" argument must be of type number. Received type ${typeof n}`},TypeError),gs("ERR_OUT_OF_RANGE",function(a,n,s){let l=`The value of "${a}" is out of range.`,p=s;return Number.isInteger(s)&&Math.abs(s)>2**32?p=_i(String(s)):typeof s=="bigint"&&(p=String(s),(s>BigInt(2)**BigInt(32)||s<-(BigInt(2)**BigInt(32)))&&(p=_i(p)),p+="n"),l+=` It must be ${n}. Received ${p}`,l},RangeError);function _i(a){let n="",s=a.length;const l=a[0]==="-"?1:0;for(;s>=l+4;s-=3)n=`_${a.slice(s-3,s)}${n}`;return`${a.slice(0,s)}${n}`}function b0(a,n,s){He(n,"offset"),(a[n]===void 0||a[n+s]===void 0)&&mr(n,a.length-(s+1))}function Oi(a,n,s,l,p,g){if(a>s||a<n){const E=typeof n=="bigint"?"n":"";let w;throw n===0||n===BigInt(0)?w=`>= 0${E} and < 2${E} ** ${(g+1)*8}${E}`:w=`>= -(2${E} ** ${(g+1)*8-1}${E}) and < 2 ** ${(g+1)*8-1}${E}`,new Ve.ERR_OUT_OF_RANGE("value",w,a)}b0(l,p,g)}function He(a,n){if(typeof a!="number")throw new Ve.ERR_INVALID_ARG_TYPE(n,"number",a)}function mr(a,n,s){throw Math.floor(a)!==a?(He(a,s),new Ve.ERR_OUT_OF_RANGE("offset","an integer",a)):n<0?new Ve.ERR_BUFFER_OUT_OF_BOUNDS:new Ve.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${n}`,a)}const L0=/[^+/0-9A-Za-z-_]/g;function M0(a){if(a=a.split("=")[0],a=a.trim().replace(L0,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function Es(a,n){n=n||1/0;let s;const l=a.length;let p=null;const g=[];for(let E=0;E<l;++E){if(s=a.charCodeAt(E),s>55295&&s<57344){if(!p){if(s>56319){(n-=3)>-1&&g.push(239,191,189);continue}else if(E+1===l){(n-=3)>-1&&g.push(239,191,189);continue}p=s;continue}if(s<56320){(n-=3)>-1&&g.push(239,191,189),p=s;continue}s=(p-55296<<10|s-56320)+65536}else p&&(n-=3)>-1&&g.push(239,191,189);if(p=null,s<128){if((n-=1)<0)break;g.push(s)}else if(s<2048){if((n-=2)<0)break;g.push(s>>6|192,s&63|128)}else if(s<65536){if((n-=3)<0)break;g.push(s>>12|224,s>>6&63|128,s&63|128)}else if(s<1114112){if((n-=4)<0)break;g.push(s>>18|240,s>>12&63|128,s>>6&63|128,s&63|128)}else throw new Error("Invalid code point")}return g}function _0(a){const n=[];for(let s=0;s<a.length;++s)n.push(a.charCodeAt(s)&255);return n}function O0(a,n){let s,l,p;const g=[];for(let E=0;E<a.length&&!((n-=2)<0);++E)s=a.charCodeAt(E),l=s>>8,p=s%256,g.push(p),g.push(l);return g}function Ui(a){return e.toByteArray(M0(a))}function Sn(a,n,s,l){let p;for(p=0;p<l&&!(p+s>=n.length||p>=a.length);++p)n[p+s]=a[p];return p}function Qt(a,n){return a instanceof n||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===n.name}function ms(a){return a!==a}const U0=function(){const a="0123456789abcdef",n=new Array(256);for(let s=0;s<16;++s){const l=s*16;for(let p=0;p<16;++p)n[l+p]=a[s]+a[p]}return n}();function pe(a){return typeof BigInt>"u"?N0:a}function N0(){throw new Error("BigInt not supported")}})(ft);const Wi=!1,Zi=30,je=256,_e=383,$e=256*je,jt=256*_e;var O=(t=>(t[t.IDLE=0]="IDLE",t[t.RUNNING=-1]="RUNNING",t[t.PAUSED=-2]="PAUSED",t[t.NEED_BOOT=-3]="NEED_BOOT",t[t.NEED_RESET=-4]="NEED_RESET",t))(O||{}),ct=(t=>(t[t.MACHINE_STATE=0]="MACHINE_STATE",t[t.CLICK=1]="CLICK",t[t.DRIVE_PROPS=2]="DRIVE_PROPS",t[t.DRIVE_SOUND=3]="DRIVE_SOUND",t[t.SAVE_STATE=4]="SAVE_STATE",t[t.RUMBLE=5]="RUMBLE",t[t.HELP_TEXT=6]="HELP_TEXT",t[t.SHOW_MOUSE=7]="SHOW_MOUSE",t[t.MBOARD_SOUND=8]="MBOARD_SOUND",t[t.COMM_DATA=9]="COMM_DATA",t[t.MIDI_DATA=10]="MIDI_DATA",t[t.ENHANCED_MIDI=11]="ENHANCED_MIDI",t[t.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",t))(ct||{}),N=(t=>(t[t.RUN_MODE=0]="RUN_MODE",t[t.STATE6502=1]="STATE6502",t[t.DEBUG=2]="DEBUG",t[t.DISASSEMBLE_ADDR=3]="DISASSEMBLE_ADDR",t[t.BREAKPOINTS=4]="BREAKPOINTS",t[t.STEP_INTO=5]="STEP_INTO",t[t.STEP_OVER=6]="STEP_OVER",t[t.STEP_OUT=7]="STEP_OUT",t[t.SPEED=8]="SPEED",t[t.TIME_TRAVEL_STEP=9]="TIME_TRAVEL_STEP",t[t.TIME_TRAVEL_INDEX=10]="TIME_TRAVEL_INDEX",t[t.TIME_TRAVEL_SNAPSHOT=11]="TIME_TRAVEL_SNAPSHOT",t[t.THUMBNAIL_IMAGE=12]="THUMBNAIL_IMAGE",t[t.RESTORE_STATE=13]="RESTORE_STATE",t[t.KEYPRESS=14]="KEYPRESS",t[t.MOUSEEVENT=15]="MOUSEEVENT",t[t.PASTE_TEXT=16]="PASTE_TEXT",t[t.APPLE_PRESS=17]="APPLE_PRESS",t[t.APPLE_RELEASE=18]="APPLE_RELEASE",t[t.GET_SAVE_STATE=19]="GET_SAVE_STATE",t[t.GET_SAVE_STATE_SNAPSHOTS=20]="GET_SAVE_STATE_SNAPSHOTS",t[t.DRIVE_PROPS=21]="DRIVE_PROPS",t[t.DRIVE_NEW_DATA=22]="DRIVE_NEW_DATA",t[t.GAMEPAD=23]="GAMEPAD",t[t.SET_BINARY_BLOCK=24]="SET_BINARY_BLOCK",t[t.SET_MEMORY=25]="SET_MEMORY",t[t.COMM_DATA=26]="COMM_DATA",t[t.MIDI_DATA=27]="MIDI_DATA",t[t.RamWorks=28]="RamWorks",t[t.SOFTSWITCHES=29]="SOFTSWITCHES",t))(N||{}),Bs=(t=>(t[t.COLOR=0]="COLOR",t[t.NOFRINGE=1]="NOFRINGE",t[t.GREEN=2]="GREEN",t[t.AMBER=3]="AMBER",t[t.BLACKANDWHITE=4]="BLACKANDWHITE",t))(Bs||{}),Ie=(t=>(t[t.MOTOR_OFF=0]="MOTOR_OFF",t[t.MOTOR_ON=1]="MOTOR_ON",t[t.TRACK_END=2]="TRACK_END",t[t.TRACK_SEEK=3]="TRACK_SEEK",t))(Ie||{}),i=(t=>(t[t.IMPLIED=0]="IMPLIED",t[t.IMM=1]="IMM",t[t.ZP_REL=2]="ZP_REL",t[t.ZP_X=3]="ZP_X",t[t.ZP_Y=4]="ZP_Y",t[t.ABS=5]="ABS",t[t.ABS_X=6]="ABS_X",t[t.ABS_Y=7]="ABS_Y",t[t.IND_X=8]="IND_X",t[t.IND_Y=9]="IND_Y",t[t.IND=10]="IND",t))(i||{});const Gi=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),mn=t=>t.startsWith("B")&&t!=="BIT"&&t!=="BRK",W=(t,e=2)=>(t>255&&(e=4),("0000"+t.toString(16).toUpperCase()).slice(-e)),ve=t=>t.split("").map(e=>e.charCodeAt(0)),Ji=t=>[t&255,t>>>8&255],ds=t=>[t&255,t>>>8&255,t>>>16&255,t>>>24&255],Ds=(t,e)=>{const r=t.lastIndexOf(".")+1;return t.substring(0,r)+e},Cn=new Uint32Array(256).fill(0),Vi=()=>{let t;for(let e=0;e<256;e++){t=e;for(let r=0;r<8;r++)t=t&1?3988292384^t>>>1:t>>>1;Cn[e]=t}},Hi=(t,e=0)=>{Cn[255]===0&&Vi();let r=-1;for(let o=e;o<t.length;o++)r=r>>>8^Cn[(r^t[o])&255];return(r^-1)>>>0},ji=(t,e)=>t+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7);let Tt;const Se=Math.trunc(.0028*1020484);let Bn=Se/2,dn=Se/2,Cr=Se/2,Br=Se/2,Rs=0,Ts=!1,ks=!1,Dn=!1,Rn=!1,dr=!1,ys=!1,Ps=!1;const Tn=()=>{Dn=!0},ws=()=>{Rn=!0},$i=()=>{dr=!0},Dr=t=>(t=Math.min(Math.max(t,-1),1),(t+1)*Se/2),bs=t=>{Bn=Dr(t)},Ls=t=>{dn=Dr(t)},Ms=t=>{Cr=Dr(t)},_s=t=>{Br=Dr(t)},kn=()=>{ys=Ts||Dn,Ps=ks||Rn,m.PB0.isSet=ys,m.PB1.isSet=Ps||dr,m.PB2.isSet=dr},Os=(t,e)=>{e?Ts=t:ks=t,kn()},vi=t=>{H(49252,128),H(49253,128),H(49254,128),H(49255,128),Rs=t},Rr=t=>{const e=t-Rs;H(49252,e<Bn?128:0),H(49253,e<dn?128:0),H(49254,e<Cr?128:0),H(49255,e<Br?128:0)};let ge,yn,Us=!1;const zi=t=>{Tt=t,Us=!Tt.length||!Tt[0].buttons.length,ge=ma(),yn=ge.gamepad?ge.gamepad:ga},Ns=t=>t>-.01&&t<.01,Fs=(t,e)=>{Ns(t)&&(t=0),Ns(e)&&(e=0);const r=Math.sqrt(t*t+e*e),o=.95*(r===0?1:Math.max(Math.abs(t),Math.abs(e))/r);return t=Math.min(Math.max(-o,t),o),e=Math.min(Math.max(-o,e),o),t=Math.trunc(Se*(t+o)/(2*o)),e=Math.trunc(Se*(e+o)/(2*o)),[t,e]},ta=t=>{const[e,r]=Fs(t[0],t[1]),o=t.length>=6?t[5]:t[3],[c,h]=t.length>=4?Fs(t[2],o):[0,0];return[e,r,c,h]},xs=t=>{const e=ge.joystick?ge.joystick(Tt[t].axes,Us):Tt[t].axes,r=ta(e);t===0?(Bn=r[0],dn=r[1],Dn=!1,Rn=!1,Cr=r[2],Br=r[3]):(Cr=r[0],Br=r[1],dr=!1);let o=!1;Tt[t].buttons.forEach((c,h)=>{c&&(yn(h,Tt.length>1,t===1),o=!0)}),o||yn(-1,Tt.length>1,t===1),ge.rumble&&ge.rumble(),kn()},ea=()=>{Tt&&Tt.length>0&&(xs(0),Tt.length>1&&xs(1))},ra=t=>{switch(t){case 0:U("JL");break;case 1:U("G",200);break;case 2:Q("M"),U("O");break;case 3:U("L");break;case 4:U("F");break;case 5:Q("P"),U("T");break;case 6:break;case 7:break;case 8:U("Z");break;case 9:{const e=lo();e.includes("'N'")?Q("N"):e.includes("'S'")?Q("S"):e.includes("NUMERIC KEY")?Q("1"):Q("N");break}case 10:break;case 11:break;case 12:U("L");break;case 13:U("M");break;case 14:U("A");break;case 15:U("D");break;case-1:return}};let Ee=0,me=0,Ce=!1;const Tr=.5,na={address:6509,data:[173,0,192],keymap:{},joystick:t=>t[0]<-Tr?(me=0,Ee===0||Ee>2?(Ee=0,Q("A")):Ee===1&&Ce?U("W"):Ee===2&&Ce&&U("R"),Ee++,Ce=!1,t):t[0]>Tr?(Ee=0,me===0||me>2?(me=0,Q("D")):me===1&&Ce?U("W"):me===2&&Ce&&U("R"),me++,Ce=!1,t):t[1]<-Tr?(U("C"),t):t[1]>Tr?(U("S"),t):(Ce=!0,t),gamepad:ra,rumble:null,setup:null,helptext:`AZTEC
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
`},sa={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:t=>{switch(t){case 0:Q(" ");break;case 12:Q("A");break;case 13:Q("Z");break;case 14:Q("\b");break;case 15:Q("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},oa={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`};let Pn=14,wn=14;const ia={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let t=C(182,!1);Pn<40&&t<Pn&&In({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Pn=t,t=C(183,!1),wn<40&&t<wn&&In({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),wn=t},setup:null,helptext:`KARATEKA
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
`},aa=t=>{switch(t){case 0:U("A");break;case 1:U("C",50);break;case 2:U("O");break;case 3:U("T");break;case 4:U("\x1B");break;case 5:U("\r");break;case 6:break;case 7:break;case 8:Q("N"),U("'");break;case 9:Q("Y"),U("1");break;case 10:break;case 11:break;case 12:break;case 13:U(" ");break;case 14:break;case 15:U("	");break;case-1:return}},$t=.5,ca={address:768,data:[141,74,3,132],keymap:{},gamepad:aa,joystick:(t,e)=>{if(e)return t;const r=t[0]<-$t?"\b":t[0]>$t?"":"",o=t[1]<-$t?"\v":t[1]>$t?`
`:"";let c=r+o;return c||(c=t[2]<-$t?"L\b":t[2]>$t?"L":"",c||(c=t[3]<-$t?"L\v":t[3]>$t?`L
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
ESC  exit conversation`},Aa={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},la={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},ua={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{C(14799,!1)===255&&In({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{d(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},Qs=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,ha=t=>{switch(t){case 1:d(109,255);break;case 12:Q("A");break;case 13:Q("Z");break;case 14:Q("\b");break;case 15:Q("");break}},kr=.75,fa=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{d(25025,173),d(25036,64)},helptext:Qs},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:t=>{const e=t[0]<-kr?"\b":t[0]>kr?"":t[1]<-kr?"A":t[1]>kr?"Z":"";return e&&Q(e),t},gamepad:ha,rumble:null,setup:null,helptext:Qs}],pa={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{Bi(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Ia={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Sa={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:t=>{switch(t){case 0:Tn();break;case 1:ws();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U("T");break;case 9:{const e=lo();e.includes("'N'")?Q("N"):e.includes("'S'")?Q("S"):e.includes("NUMERIC KEY")?Q("1"):Q("N");break}case 10:Tn();break}},rumble:()=>{C(49178,!1)<128&&C(49181,!1)<128&&In({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},setup:()=>{d(5128,0),d(5130,4);let t=5210;d(t,234),d(t+1,234),d(t+2,234),t=5224,d(t,234),d(t+1,234),d(t+2,234)},helptext:`Castle Wolfenstein
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
LB button: Inventory`},ze=new Array,Ct=t=>{Array.isArray(t)?ze.push(...t):ze.push(t)};Ct(na),Ct(sa),Ct(oa),Ct(ia),Ct(ca),Ct(Aa),Ct(la),Ct(ua),Ct(fa),Ct(pa),Ct(Ia),Ct(Sa);const ga=(t,e,r)=>{if(r)switch(t){case 0:$i();break;case 1:break;case 12:_s(-1);break;case 13:_s(1);break;case 14:Ms(-1);break;case 15:Ms(1);break}else switch(t){case 0:Tn();break;case 1:e||ws();break;case 12:Ls(-1);break;case 13:Ls(1);break;case 14:bs(-1);break;case 15:bs(1);break}},Ea={address:0,data:[],keymap:{},gamepad:null,joystick:t=>t,rumble:null,setup:null,helptext:""},Xs=t=>{for(const e of ze)if(Wn(e.address,e.data))return t in e.keymap?e.keymap[t]:t;return t},ma=()=>{for(const t of ze)if(Wn(t.address,t.data))return t;return Ea},yr=(t=!1)=>{for(const e of ze)if(Wn(e.address,e.data)){Ci(e.helptext?e.helptext:" "),e.setup&&e.setup();return}t&&(Ci(" "),Bi(0))},Ca=t=>{H(49152,t|128,32)},Ba=()=>{const t=De(49152)&127;H(49152,t,32)};let Be="",Ys=1e9;const da=()=>{const t=performance.now();if(Be!==""&&(De(49152)<128||t-Ys>1500)){Ys=t;const e=Be.charCodeAt(0);Ca(e),Be=Be.slice(1),Be.length===0&&hi(!0)}};let Ks="";const Q=t=>{t===Ks&&Be.length>0||(Ks=t,Be+=t)};let qs=0;const U=(t,e=300)=>{const r=performance.now();r-qs<e||(qs=r,Q(t))},Da=t=>{t.length===1&&(t=Xs(t)),Q(t)},Ws=t=>{t.length===1&&(t=Xs(t)),Q(t)},Oe=[],k=(t,e,r,o=!1,c=null)=>{const h={offAddr:t,onAddr:e,isSetAddr:r,writeOnly:o,isSet:!1,setFunc:c};return t>=49152&&(Oe[t-49152]=h),e>=49152&&(Oe[e-49152]=h),r>=49152&&(Oe[r-49152]=h),h},Ue=()=>Math.floor(256*Math.random()),Ra=(t,e)=>{t&=11,e?m.BSR_PREWRITE.isSet=!1:t&1?m.BSR_PREWRITE.isSet?m.BSR_WRITE.isSet=!0:m.BSR_PREWRITE.isSet=!0:(m.BSR_PREWRITE.isSet=!1,m.BSR_WRITE.isSet=!1),m.BSRBANK2.isSet=t<=3,m.BSRREADRAM.isSet=[0,3,8,11].includes(t)},m={STORE80:k(49152,49153,49176,!0),RAMRD:k(49154,49155,49171,!0),RAMWRT:k(49156,49157,49172,!0),INTCXROM:k(49158,49159,49173,!0),INTC8ROM:k(49194,0,0),ALTZP:k(49160,49161,49174,!0),SLOTC3ROM:k(49162,49163,49175,!0),COLUMN80:k(49164,49165,49183,!0),ALTCHARSET:k(49166,49167,49182,!0),KBRDSTROBE:k(49168,0,0,!1),BSRBANK2:k(0,0,49169),BSRREADRAM:k(0,0,49170),VBL:k(0,0,49177),CASSOUT:k(49184,0,0),SPEAKER:k(49200,0,0,!1,(t,e)=>{H(49200,Ue()),l0(e)}),GCSTROBE:k(49216,0,0),EMUBYTE:k(0,0,49231,!1,()=>{H(49231,205)}),TEXT:k(49232,49233,49178),MIXED:k(49234,49235,49179),PAGE2:k(49236,49237,49180),HIRES:k(49238,49239,49181),AN0:k(49240,49241,0),AN1:k(49242,49243,0),AN2:k(49244,49245,0),AN3:k(49246,49247,0),CASSIN1:k(0,0,49248,!1,()=>{H(49248,Ue())}),PB0:k(0,0,49249),PB1:k(0,0,49250),PB2:k(0,0,49251),JOYSTICK0:k(0,0,49252,!1,(t,e)=>{Rr(e)}),JOYSTICK1:k(0,0,49253,!1,(t,e)=>{Rr(e)}),JOYSTICK2:k(0,0,49254,!1,(t,e)=>{Rr(e)}),JOYSTICK3:k(0,0,49255,!1,(t,e)=>{Rr(e)}),CASSIN2:k(0,0,49256,!1,()=>{H(49256,Ue())}),FASTCHIP_LOCK:k(49258,0,0),FASTCHIP_ENABLE:k(49259,0,0),FASTCHIP_SPEED:k(49261,0,0),JOYSTICKRESET:k(0,0,49264,!1,(t,e)=>{vi(e),H(49264,Ue())}),BANKSEL:k(49267,0,0),LASER128EX:k(49268,0,0),BSR_PREWRITE:k(49280,0,0),BSR_WRITE:k(49288,0,0)};m.TEXT.isSet=!0;const Ta=[49152,49153,49165,49167,49200,49236,49237,49183],Zs=(t,e,r)=>{if(t>1048575&&!Ta.includes(t)){const c=De(t)>128?1:0;console.log(`${r} $${W(A.PC)}: $${W(t)} [${c}] ${e?"write":""}`)}if(t>=49280&&t<=49295){Ra(t&-5,e);return}const o=Oe[t-49152];if(!o){console.error("Unknown softswitch "+W(t)),H(t,Ue());return}if(t<=49167?e||da():(t===49168||t<=49183&&e)&&Ba(),o.setFunc){o.setFunc(t,r);return}if(t===o.offAddr||t===o.onAddr){if((!o.writeOnly||e)&&(Lt[o.offAddr-49152]!==void 0?Lt[o.offAddr-49152]=t===o.onAddr:o.isSet=t===o.onAddr),o.isSetAddr){const c=De(o.isSetAddr);H(o.isSetAddr,o.isSet?c|128:c&127)}t>=49184&&H(t,Ue())}else if(t===o.isSetAddr){const c=De(t);H(t,o.isSet?c|128:c&127)}},ka=()=>{for(const t in m){const e=t;Lt[m[e].offAddr-49152]!==void 0?Lt[m[e].offAddr-49152]=!1:m[e].isSet=!1}Lt[m.TEXT.offAddr-49152]!==void 0?Lt[m.TEXT.offAddr-49152]=!0:m.TEXT.isSet=!0},Lt=[],ya=t=>{const e=Oe[t-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+W(t));return}Lt[e.offAddr-49152]===void 0&&(Lt[e.offAddr-49152]=e.isSet),e.isSet=t===e.onAddr},Pa=()=>{Lt.forEach((t,e)=>{t!==void 0&&(Oe[e].isSet=t)}),Lt.length=0},Gs=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,Js=new Array(256),bn={},I=(t,e,r,o)=>{console.assert(!Js[r],"Duplicate instruction: "+t+" mode="+e),Js[r]={name:t,mode:e,bytes:o},bn[t]||(bn[t]=[]),bn[t][e]=r};I("ADC",i.IMM,105,2),I("ADC",i.ZP_REL,101,2),I("ADC",i.ZP_X,117,2),I("ADC",i.ABS,109,3),I("ADC",i.ABS_X,125,3),I("ADC",i.ABS_Y,121,3),I("ADC",i.IND_X,97,2),I("ADC",i.IND_Y,113,2),I("ADC",i.IND,114,2),I("AND",i.IMM,41,2),I("AND",i.ZP_REL,37,2),I("AND",i.ZP_X,53,2),I("AND",i.ABS,45,3),I("AND",i.ABS_X,61,3),I("AND",i.ABS_Y,57,3),I("AND",i.IND_X,33,2),I("AND",i.IND_Y,49,2),I("AND",i.IND,50,2),I("ASL",i.IMPLIED,10,1),I("ASL",i.ZP_REL,6,2),I("ASL",i.ZP_X,22,2),I("ASL",i.ABS,14,3),I("ASL",i.ABS_X,30,3),I("BCC",i.ZP_REL,144,2),I("BCS",i.ZP_REL,176,2),I("BEQ",i.ZP_REL,240,2),I("BIT",i.ZP_REL,36,2),I("BIT",i.ABS,44,3),I("BIT",i.IMM,137,2),I("BIT",i.ZP_X,52,2),I("BIT",i.ABS_X,60,3),I("BMI",i.ZP_REL,48,2),I("BNE",i.ZP_REL,208,2),I("BPL",i.ZP_REL,16,2),I("BVC",i.ZP_REL,80,2),I("BVS",i.ZP_REL,112,2),I("BRA",i.ZP_REL,128,2),I("BRK",i.IMPLIED,0,1),I("CLC",i.IMPLIED,24,1),I("CLD",i.IMPLIED,216,1),I("CLI",i.IMPLIED,88,1),I("CLV",i.IMPLIED,184,1),I("CMP",i.IMM,201,2),I("CMP",i.ZP_REL,197,2),I("CMP",i.ZP_X,213,2),I("CMP",i.ABS,205,3),I("CMP",i.ABS_X,221,3),I("CMP",i.ABS_Y,217,3),I("CMP",i.IND_X,193,2),I("CMP",i.IND_Y,209,2),I("CMP",i.IND,210,2),I("CPX",i.IMM,224,2),I("CPX",i.ZP_REL,228,2),I("CPX",i.ABS,236,3),I("CPY",i.IMM,192,2),I("CPY",i.ZP_REL,196,2),I("CPY",i.ABS,204,3),I("DEC",i.IMPLIED,58,1),I("DEC",i.ZP_REL,198,2),I("DEC",i.ZP_X,214,2),I("DEC",i.ABS,206,3),I("DEC",i.ABS_X,222,3),I("DEX",i.IMPLIED,202,1),I("DEY",i.IMPLIED,136,1),I("EOR",i.IMM,73,2),I("EOR",i.ZP_REL,69,2),I("EOR",i.ZP_X,85,2),I("EOR",i.ABS,77,3),I("EOR",i.ABS_X,93,3),I("EOR",i.ABS_Y,89,3),I("EOR",i.IND_X,65,2),I("EOR",i.IND_Y,81,2),I("EOR",i.IND,82,2),I("INC",i.IMPLIED,26,1),I("INC",i.ZP_REL,230,2),I("INC",i.ZP_X,246,2),I("INC",i.ABS,238,3),I("INC",i.ABS_X,254,3),I("INX",i.IMPLIED,232,1),I("INY",i.IMPLIED,200,1),I("JMP",i.ABS,76,3),I("JMP",i.IND,108,3),I("JMP",i.IND_X,124,3),I("JSR",i.ABS,32,3),I("LDA",i.IMM,169,2),I("LDA",i.ZP_REL,165,2),I("LDA",i.ZP_X,181,2),I("LDA",i.ABS,173,3),I("LDA",i.ABS_X,189,3),I("LDA",i.ABS_Y,185,3),I("LDA",i.IND_X,161,2),I("LDA",i.IND_Y,177,2),I("LDA",i.IND,178,2),I("LDX",i.IMM,162,2),I("LDX",i.ZP_REL,166,2),I("LDX",i.ZP_Y,182,2),I("LDX",i.ABS,174,3),I("LDX",i.ABS_Y,190,3),I("LDY",i.IMM,160,2),I("LDY",i.ZP_REL,164,2),I("LDY",i.ZP_X,180,2),I("LDY",i.ABS,172,3),I("LDY",i.ABS_X,188,3),I("LSR",i.IMPLIED,74,1),I("LSR",i.ZP_REL,70,2),I("LSR",i.ZP_X,86,2),I("LSR",i.ABS,78,3),I("LSR",i.ABS_X,94,3),I("NOP",i.IMPLIED,234,1),I("ORA",i.IMM,9,2),I("ORA",i.ZP_REL,5,2),I("ORA",i.ZP_X,21,2),I("ORA",i.ABS,13,3),I("ORA",i.ABS_X,29,3),I("ORA",i.ABS_Y,25,3),I("ORA",i.IND_X,1,2),I("ORA",i.IND_Y,17,2),I("ORA",i.IND,18,2),I("PHA",i.IMPLIED,72,1),I("PHP",i.IMPLIED,8,1),I("PHX",i.IMPLIED,218,1),I("PHY",i.IMPLIED,90,1),I("PLA",i.IMPLIED,104,1),I("PLP",i.IMPLIED,40,1),I("PLX",i.IMPLIED,250,1),I("PLY",i.IMPLIED,122,1),I("ROL",i.IMPLIED,42,1),I("ROL",i.ZP_REL,38,2),I("ROL",i.ZP_X,54,2),I("ROL",i.ABS,46,3),I("ROL",i.ABS_X,62,3),I("ROR",i.IMPLIED,106,1),I("ROR",i.ZP_REL,102,2),I("ROR",i.ZP_X,118,2),I("ROR",i.ABS,110,3),I("ROR",i.ABS_X,126,3),I("RTI",i.IMPLIED,64,1),I("RTS",i.IMPLIED,96,1),I("SBC",i.IMM,233,2),I("SBC",i.ZP_REL,229,2),I("SBC",i.ZP_X,245,2),I("SBC",i.ABS,237,3),I("SBC",i.ABS_X,253,3),I("SBC",i.ABS_Y,249,3),I("SBC",i.IND_X,225,2),I("SBC",i.IND_Y,241,2),I("SBC",i.IND,242,2),I("SEC",i.IMPLIED,56,1),I("SED",i.IMPLIED,248,1),I("SEI",i.IMPLIED,120,1),I("STA",i.ZP_REL,133,2),I("STA",i.ZP_X,149,2),I("STA",i.ABS,141,3),I("STA",i.ABS_X,157,3),I("STA",i.ABS_Y,153,3),I("STA",i.IND_X,129,2),I("STA",i.IND_Y,145,2),I("STA",i.IND,146,2),I("STX",i.ZP_REL,134,2),I("STX",i.ZP_Y,150,2),I("STX",i.ABS,142,3),I("STY",i.ZP_REL,132,2),I("STY",i.ZP_X,148,2),I("STY",i.ABS,140,3),I("STZ",i.ZP_REL,100,2),I("STZ",i.ZP_X,116,2),I("STZ",i.ABS,156,3),I("STZ",i.ABS_X,158,3),I("TAX",i.IMPLIED,170,1),I("TAY",i.IMPLIED,168,1),I("TSX",i.IMPLIED,186,1),I("TXA",i.IMPLIED,138,1),I("TXS",i.IMPLIED,154,1),I("TYA",i.IMPLIED,152,1),I("TRB",i.ZP_REL,20,2),I("TRB",i.ABS,28,3),I("TSB",i.ZP_REL,4,2),I("TSB",i.ABS,12,3);const wa=65536,Vs=65792;class ba{constructor(){T(this,"address");T(this,"watchpoint");T(this,"instruction");T(this,"disabled");T(this,"hidden");T(this,"once");T(this,"memget");T(this,"memset");T(this,"expression1");T(this,"expression2");T(this,"expressionOperator");T(this,"hexvalue");T(this,"hitcount");T(this,"nhits");T(this,"memoryBank");this.address=-1,this.watchpoint=!1,this.instruction=!1,this.disabled=!1,this.hidden=!1,this.once=!1,this.memget=!1,this.memset=!0,this.expression1={register:"",address:768,operator:"==",value:128},this.expression2={register:"",address:768,operator:"==",value:128},this.expressionOperator="",this.hexvalue=-1,this.hitcount=1,this.nhits=0,this.memoryBank=""}}class Hs extends Map{set(e,r){const o=[...this.entries()];o.push([e,r]),o.sort((c,h)=>c[0]-h[0]),super.clear();for(const[c,h]of o)super.set(c,h);return this}}let Ln=!1,Mn=!1,At=new Hs;const Pr=()=>{Ln=!0},La=()=>{new Hs(At).forEach((o,c)=>{o.once&&At.delete(c)});const e=rc();if(e<0||At.get(e))return;const r=new ba;r.address=e,r.once=!0,r.hidden=!0,At.set(e,r)},Ma=t=>{At=t},js=(t,e)=>{const r=dt[t];return!(e<r.min||e>r.max||!r.enabled(e))},$s=(t,e,r)=>{const o=At.get(t);return!o||!o.watchpoint||o.disabled||o.hexvalue>=0&&o.hexvalue!==e||o.memoryBank&&!js(o.memoryBank,t)?!1:r?o.memset:o.memget},tr=(t=0,e=!0)=>{e?A.flagIRQ|=1<<t:A.flagIRQ&=~(1<<t),A.flagIRQ&=255},_a=(t=!0)=>{A.flagNMI=t===!0},Oa=()=>{A.flagIRQ=0,A.flagNMI=!1},_n=[],vs=[],zs=(t,e)=>{_n.push(t),vs.push(e)},Ua=()=>{for(let t=0;t<_n.length;t++)_n[t](vs[t])},to=t=>{let e=0;switch(t.register){case"$":e=Fe(t.address);break;case"A":e=A.Accum;break;case"X":e=A.XReg;break;case"Y":e=A.YReg;break;case"S":e=A.StackPtr;break;case"P":e=A.PStatus;break}switch(t.operator){case"==":return e===t.value;case"!=":return e!==t.value;case"<":return e<t.value;case"<=":return e<=t.value;case">":return e>t.value;case">=":return e>=t.value}},Na=t=>{const e=to(t.expression1);return t.expressionOperator===""?e:t.expressionOperator==="&&"&&!e?!1:t.expressionOperator==="||"&&e?!0:to(t.expression2)},eo=()=>{Mn=!0},Fa=(t=-1,e=-1)=>{if(Mn)return Mn=!1,!0;if(At.size===0||Ln)return!1;const r=At.get(A.PC)||At.get(-1)||At.get(t|wa)||t>=0&&At.get(Vs);if(!r||r.disabled||r.watchpoint)return!1;if(r.instruction){if(r.address===Vs){if(kt[t].name!=="???")return!1}else if(e>=0&&r.hexvalue>=0&&r.hexvalue!==e)return!1}if(r.expression1.register!==""&&!Na(r))return!1;if(r.hitcount>1){if(r.nhits++,r.nhits<r.hitcount)return!1;r.nhits=0}return r.memoryBank&&!js(r.memoryBank,A.PC)?!1:(r.once&&At.delete(A.PC),!0)},On=()=>{let t=0;const e=A.PC,r=C(A.PC,!1),o=kt[r],c=o.bytes>1?C(A.PC+1,!1):-1,h=o.bytes>2?C(A.PC+2,!1):0;if(Fa(r,(h<<8)+c))return bt(O.PAUSED),-1;Ln=!1;const S=io.get(e);if(S&&!m.INTCXROM.isSet&&S(),t=o.execute(c,h),fo(o.bytes),Mr(A.cycleCount+t),Ua(),A.flagNMI&&(A.flagNMI=!1,t=oc(),Mr(A.cycleCount+t)),A.flagIRQ){const u=sc();u>0&&(Mr(A.cycleCount+u),t=u)}return t},xa=[197,58,163,92,197,58,163,92],Qa=1,ro=4;class Xa{constructor(){T(this,"bits",[]);T(this,"pattern",new Array(64));T(this,"patternIdx",0);T(this,"reset",()=>{this.patternIdx=0});T(this,"checkPattern",e=>{const o=xa[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===o});T(this,"calcBits",()=>{const e=Y=>{this.bits.push(Y&8?1:0),this.bits.push(Y&4?1:0),this.bits.push(Y&2?1:0),this.bits.push(Y&1?1:0)},r=Y=>{e(Math.floor(Y/10)),e(Math.floor(Y%10))},o=new Date,c=o.getFullYear()%100,h=o.getDate(),S=o.getDay()+1,u=o.getMonth()+1,B=o.getHours(),G=o.getMinutes(),y=o.getSeconds(),z=o.getMilliseconds()/10;this.bits=[],r(c),r(u),r(h),r(S),r(B),r(G),r(y),r(z)});T(this,"access",e=>{e&ro?this.reset():this.checkPattern(e&Qa)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()});T(this,"read",e=>{let r=-1;return this.bits.length>0?e&ro&&(r=this.bits.pop()):this.access(e),r})}}const Ya=new Xa,no=320,so=327,wr=256*no,Ka=256*so;let Mt=0;const Un=jt;let P=new Uint8Array(Un+(Mt+1)*65536).fill(0);const Nn=()=>De(49194),br=t=>{H(49194,t)},de=()=>De(49267),Fn=t=>{H(49267,t)},rt=new Array(257).fill(0),Bt=new Array(257).fill(0),xn=t=>{t=Math.max(64,Math.min(8192,t));const e=Mt;if(Mt=Math.floor(t/64)-1,Mt===e)return;de()>Mt&&(Fn(0),vt());const r=Un+(Mt+1)*65536;if(Mt<e)P=P.slice(0,r);else{const o=P;P=new Uint8Array(r).fill(255),P.set(o)}},qa=()=>{const t=m.RAMRD.isSet?_e+de()*256:0,e=m.RAMWRT.isSet?_e+de()*256:0,r=m.PAGE2.isSet?_e+de()*256:0,o=m.STORE80.isSet?r:t,c=m.STORE80.isSet?r:e,h=m.STORE80.isSet&&m.HIRES.isSet?r:t,S=m.STORE80.isSet&&m.HIRES.isSet?r:e;for(let u=2;u<256;u++)rt[u]=u+t,Bt[u]=u+e;for(let u=4;u<=7;u++)rt[u]=u+o,Bt[u]=u+c;for(let u=32;u<=63;u++)rt[u]=u+h,Bt[u]=u+S},Wa=()=>{const t=m.ALTZP.isSet?_e+de()*256:0;if(rt[0]=t,rt[1]=1+t,Bt[0]=t,Bt[1]=1+t,m.BSRREADRAM.isSet){for(let e=208;e<=255;e++)rt[e]=e+t;if(!m.BSRBANK2.isSet)for(let e=208;e<=223;e++)rt[e]=e-16+t}else for(let e=208;e<=255;e++)rt[e]=je+e-192},Za=()=>{const t=m.ALTZP.isSet?_e+de()*256:0,e=m.BSR_WRITE.isSet;for(let r=192;r<=255;r++)Bt[r]=-1;if(e){for(let r=208;r<=255;r++)Bt[r]=r+t;if(!m.BSRBANK2.isSet)for(let r=208;r<=223;r++)Bt[r]=r-16+t}},oo=t=>m.INTCXROM.isSet?!1:t!==3?!0:m.SLOTC3ROM.isSet,Ga=()=>!!(m.INTCXROM.isSet||m.INTC8ROM.isSet),Qn=t=>{if(t<=7){if(m.INTCXROM.isSet)return;t===3&&!m.SLOTC3ROM.isSet&&(m.INTC8ROM.isSet||(m.INTC8ROM.isSet=!0,br(255),vt())),Nn()===0&&(br(t),vt())}else m.INTC8ROM.isSet=!1,br(0),vt()},Ja=()=>{rt[192]=je-192;for(let t=1;t<=7;t++){const e=192+t;rt[e]=t+(oo(t)?no-1:je)}if(Ga())for(let t=200;t<=207;t++)rt[t]=je+t-192;else{const t=so+8*(Nn()-1);for(let e=0;e<=7;e++){const r=200+e;rt[r]=t+e}}},vt=()=>{qa(),Wa(),Za(),Ja();for(let t=0;t<256;t++)rt[t]=256*rt[t],Bt[t]=256*Bt[t]},io=new Map,ao=new Array(8),Lr=(t,e=-1)=>{const r=t>>8===192?t-49280>>4:(t>>8)-192;if(t>=49408&&(Qn(r),!oo(r)))return;const o=ao[r];if(o!==void 0){const c=o(t,e);if(c>=0){const h=t>=49408?wr-256:$e;P[t-49152+h]=c}}},er=(t,e)=>{ao[t]=e},Ne=(t,e,r=0,o=()=>{})=>{if(P.set(e.slice(0,256),wr+(t-1)*256),e.length>256){const c=e.length>2304?2304:e.length,h=Ka+(t-1)*2048;P.set(e.slice(256,c),h)}r&&io.set(r,o)},Va=()=>{P.fill(255,0,65536),P.fill(255,Un);const e=Gs.replace(/\n/g,""),r=new Uint8Array(ft.Buffer.from(e,"base64"));P.set(r,$e),br(0),Fn(0),vt()},Ha=t=>(t>=49296?Lr(t):Zs(t,!1,A.cycleCount),t>=49232&&vt(),P[$e+t-49152]),X=(t,e)=>{const r=wr+(t-1)*256+(e&255);return P[r]},M=(t,e,r)=>{if(r>=0){const o=wr+(t-1)*256+(e&255);P[o]=r&255}},C=(t,e=!0)=>{let r=0;const o=t>>>8;if(o===192)r=Ha(t);else if(r=-1,o>=193&&o<=199?(o==195&&!m.SLOTC3ROM.isSet&&(r=Ya.read(t)),Lr(t)):t===53247&&Qn(255),r<0){const c=rt[o];r=P[c+(t&255)]}return e&&$s(t,r,!1)&&eo(),r},Fe=t=>{const e=t>>>8,r=rt[e];return P[r+(t&255)]},ja=(t,e)=>{if(t===49265||t===49267){if(e>Mt)return;Fn(e)}else t>=49296?Lr(t,e):Zs(t,!0,A.cycleCount);(t<=49167||t>=49232)&&vt()},d=(t,e)=>{const r=t>>>8;if(r===192)ja(t,e);else{r>=193&&r<=199?Lr(t,e):t===53247&&Qn(255);const o=Bt[r];if(o<0)return;P[o+(t&255)]=e}$s(t,e,!0)&&eo()},De=t=>P[$e+t-49152],H=(t,e,r=1)=>{const o=$e+t-49152;P.fill(e,o,o+r)},co=1024,Ao=2048,Xn=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Yn=(t=!1)=>{let e=0,r=24,o=!1;if(t){if(m.TEXT.isSet||m.HIRES.isSet)return new Uint8Array;r=m.MIXED.isSet?20:24,o=m.COLUMN80.isSet&&!m.AN3.isSet}else{if(!m.TEXT.isSet&&!m.MIXED.isSet)return new Uint8Array;!m.TEXT.isSet&&m.MIXED.isSet&&(e=20),o=m.COLUMN80.isSet}if(o){const c=m.PAGE2.isSet&&!m.STORE80.isSet?Ao:co,h=new Uint8Array(80*(r-e)).fill(160);for(let S=e;S<r;S++){const u=80*(S-e);for(let B=0;B<40;B++)h[u+2*B+1]=P[c+Xn[S]+B],h[u+2*B]=P[jt+c+Xn[S]+B]}return h}else{const c=m.PAGE2.isSet?Ao:co,h=new Uint8Array(40*(r-e));for(let S=e;S<r;S++){const u=40*(S-e),B=c+Xn[S];h.set(P.slice(B,B+40),u)}return h}},lo=()=>ft.Buffer.from(Yn().map(t=>t&=127)).toString(),$a=()=>{if(m.TEXT.isSet||!m.HIRES.isSet)return new Uint8Array;const t=m.COLUMN80.isSet&&!m.AN3.isSet,e=m.MIXED.isSet?160:192;if(t){const r=m.PAGE2.isSet&&!m.STORE80.isSet?16384:8192,o=new Uint8Array(80*e);for(let c=0;c<e;c++){const h=ji(r,c);for(let S=0;S<40;S++)o[c*80+2*S+1]=P[h+S],o[c*80+2*S]=P[jt+h+S]}return o}else{const r=m.PAGE2.isSet?16384:8192,o=new Uint8Array(40*e);for(let c=0;c<e;c++){const h=r+40*Math.trunc(c/64)+1024*(c%8)+128*(Math.trunc(c/8)&7);o.set(P.slice(h,h+40),c*40)}return o}},Kn=t=>{const e=rt[t>>>8];return P.slice(e,e+512)},qn=(t,e)=>{const r=Bt[t>>>8]+(t&255);P.set(e,r),yr()},Wn=(t,e)=>{for(let r=0;r<e.length;r++)if(C(t+r,!1)!==e[r])return!1;return!0},va=()=>P.slice(0,jt+65536),dt={};dt[""]={name:"Any",min:0,max:65535,enabled:()=>!0},dt.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?!m.ALTZP.isSet&&m.BSRREADRAM.isSet:t>=512?!m.RAMRD.isSet:!m.ALTZP.isSet},dt.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535,enabled:(t=0)=>t>=53248?m.ALTZP.isSet&&m.BSRREADRAM.isSet:t>=512?m.RAMRD.isSet:m.ALTZP.isSet},dt.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535,enabled:()=>!m.BSRREADRAM.isSet},dt["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!m.ALTZP.isSet&&m.BSRREADRAM.isSet&&!m.BSRBANK2.isSet},dt["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>!m.ALTZP.isSet&&m.BSRREADRAM.isSet&&m.BSRBANK2.isSet},dt["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>m.ALTZP.isSet&&m.BSRREADRAM.isSet&&!m.BSRBANK2.isSet},dt["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343,enabled:()=>m.ALTZP.isSet&&m.BSRREADRAM.isSet&&m.BSRBANK2.isSet},dt["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?m.INTCXROM.isSet||!m.SLOTC3ROM.isSet:t>=51200?m.INTCXROM.isSet||m.INTC8ROM.isSet:m.INTCXROM.isSet},dt["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247,enabled:(t=0)=>t>=49920&&t<=50175?m.INTCXROM.isSet?!1:m.SLOTC3ROM.isSet:t>=51200?!m.INTCXROM.isSet&&!m.INTC8ROM.isSet:!m.INTCXROM.isSet},Object.values(dt).map(t=>t.name);const A=Gi(),rr=t=>{A.Accum=t},nr=t=>{A.XReg=t},sr=t=>{A.YReg=t},Mr=t=>{A.cycleCount=t},uo=t=>{ho(),Object.assign(A,t)},ho=()=>{A.Accum=0,A.XReg=0,A.YReg=0,A.PStatus=36,A.StackPtr=255,_t(C(65533,!1)*256+C(65532,!1)),A.flagIRQ=0,A.flagNMI=!1},fo=t=>{_t((A.PC+t+65536)%65536)},_t=t=>{A.PC=t},po=t=>{A.PStatus=t|48},Ot=new Array(256).fill(""),za=()=>Ot.slice(0,256),tc=t=>{Ot.splice(0,t.length,...t)},ec=()=>{const t=Kn(256).slice(0,256),e=new Array;for(let r=255;r>A.StackPtr;r--){let o="$"+W(t[r]),c=Ot[r];Ot[r].length>3&&r-1>A.StackPtr&&(Ot[r-1]==="JSR"||Ot[r-1]==="BRK"||Ot[r-1]==="IRQ"?(r--,o+=W(t[r])):c=""),o=(o+"   ").substring(0,6),e.push(W(256+r,4)+": "+o+c)}return e.join(`
`)},rc=()=>{const t=Kn(256).slice(0,256);for(let e=A.StackPtr-2;e<=255;e++){const r=t[e];if(Ot[e].startsWith("JSR")&&e-1>A.StackPtr&&Ot[e-1]==="JSR"){const o=t[e-1]+1;return(r<<8)+o}}return-1},Xt=(t,e)=>{Ot[A.StackPtr]=t,d(256+A.StackPtr,e),A.StackPtr=(A.StackPtr+255)%256},Yt=()=>{A.StackPtr=(A.StackPtr+1)%256;const t=C(256+A.StackPtr);if(isNaN(t))throw new Error("illegal stack value");return t},Dt=()=>(A.PStatus&1)!==0,L=(t=!0)=>A.PStatus=t?A.PStatus|1:A.PStatus&254,Io=()=>(A.PStatus&2)!==0,or=(t=!0)=>A.PStatus=t?A.PStatus|2:A.PStatus&253,nc=()=>(A.PStatus&4)!==0,Zn=(t=!0)=>A.PStatus=t?A.PStatus|4:A.PStatus&251,So=()=>(A.PStatus&8)!==0,tt=()=>So()?1:0,Gn=(t=!0)=>A.PStatus=t?A.PStatus|8:A.PStatus&247,Jn=(t=!0)=>A.PStatus=t?A.PStatus|16:A.PStatus&239,go=()=>(A.PStatus&64)!==0,ir=(t=!0)=>A.PStatus=t?A.PStatus|64:A.PStatus&191,Eo=()=>(A.PStatus&128)!==0,mo=(t=!0)=>A.PStatus=t?A.PStatus|128:A.PStatus&127,R=t=>{or(t===0),mo(t>=128)},Kt=(t,e)=>{if(t){const r=A.PC;return fo(e>127?e-256:e),3+Z(r,A.PC)}return 2},b=(t,e)=>(t+e+256)%256,D=(t,e)=>e*256+t,_=(t,e,r)=>(e*256+t+r+65536)%65536,Z=(t,e)=>t>>8!==e>>8?1:0,kt=new Array(256),f=(t,e,r,o,c)=>{console.assert(!kt[r],"Duplicate instruction: "+t+" mode="+e),kt[r]={name:t,pcode:r,mode:e,bytes:o,execute:c}},zt=(t,e,r)=>{const o=C(t),c=C((t+1)%256),h=_(o,c,A.YReg);e(h);let S=5+Z(h,D(o,c));return r&&(S+=tt()),S},te=(t,e,r)=>{const o=C(t),c=C((t+1)%256),h=D(o,c);e(h);let S=5;return r&&(S+=tt()),S},Co=t=>{let e=(A.Accum&15)+(t&15)+(Dt()?1:0);e>=10&&(e+=6);let r=(A.Accum&240)+(t&240)+e;const o=A.Accum<=127&&t<=127,c=A.Accum>=128&&t>=128;ir((r&255)>=128?o:c),L(r>=160),Dt()&&(r+=96),A.Accum=r&255,R(A.Accum)},_r=t=>{let e=A.Accum+t+(Dt()?1:0);L(e>=256),e=e%256;const r=A.Accum<=127&&t<=127,o=A.Accum>=128&&t>=128;ir(e>=128?r:o),A.Accum=e,R(A.Accum)},ee=t=>{So()?Co(C(t)):_r(C(t))};f("ADC",i.IMM,105,2,t=>(tt()?Co(t):_r(t),2+tt())),f("ADC",i.ZP_REL,101,2,t=>(ee(t),3+tt())),f("ADC",i.ZP_X,117,2,t=>(ee(b(t,A.XReg)),4+tt())),f("ADC",i.ABS,109,3,(t,e)=>(ee(D(t,e)),4+tt())),f("ADC",i.ABS_X,125,3,(t,e)=>{const r=_(t,e,A.XReg);return ee(r),4+tt()+Z(r,D(t,e))}),f("ADC",i.ABS_Y,121,3,(t,e)=>{const r=_(t,e,A.YReg);return ee(r),4+tt()+Z(r,D(t,e))}),f("ADC",i.IND_X,97,2,t=>{const e=b(t,A.XReg);return ee(D(C(e),C(e+1))),6+tt()}),f("ADC",i.IND_Y,113,2,t=>zt(t,ee,!0)),f("ADC",i.IND,114,2,t=>te(t,ee,!0));const re=t=>{A.Accum&=C(t),R(A.Accum)};f("AND",i.IMM,41,2,t=>(A.Accum&=t,R(A.Accum),2)),f("AND",i.ZP_REL,37,2,t=>(re(t),3)),f("AND",i.ZP_X,53,2,t=>(re(b(t,A.XReg)),4)),f("AND",i.ABS,45,3,(t,e)=>(re(D(t,e)),4)),f("AND",i.ABS_X,61,3,(t,e)=>{const r=_(t,e,A.XReg);return re(r),4+Z(r,D(t,e))}),f("AND",i.ABS_Y,57,3,(t,e)=>{const r=_(t,e,A.YReg);return re(r),4+Z(r,D(t,e))}),f("AND",i.IND_X,33,2,t=>{const e=b(t,A.XReg);return re(D(C(e),C(e+1))),6}),f("AND",i.IND_Y,49,2,t=>zt(t,re,!1)),f("AND",i.IND,50,2,t=>te(t,re,!1));const Or=t=>{let e=C(t);C(t),L((e&128)===128),e=(e<<1)%256,d(t,e),R(e)};f("ASL",i.IMPLIED,10,1,()=>(L((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256,R(A.Accum),2)),f("ASL",i.ZP_REL,6,2,t=>(Or(t),5)),f("ASL",i.ZP_X,22,2,t=>(Or(b(t,A.XReg)),6)),f("ASL",i.ABS,14,3,(t,e)=>(Or(D(t,e)),6)),f("ASL",i.ABS_X,30,3,(t,e)=>{const r=_(t,e,A.XReg);return Or(r),6+Z(r,D(t,e))}),f("BCC",i.ZP_REL,144,2,t=>Kt(!Dt(),t)),f("BCS",i.ZP_REL,176,2,t=>Kt(Dt(),t)),f("BEQ",i.ZP_REL,240,2,t=>Kt(Io(),t)),f("BMI",i.ZP_REL,48,2,t=>Kt(Eo(),t)),f("BNE",i.ZP_REL,208,2,t=>Kt(!Io(),t)),f("BPL",i.ZP_REL,16,2,t=>Kt(!Eo(),t)),f("BVC",i.ZP_REL,80,2,t=>Kt(!go(),t)),f("BVS",i.ZP_REL,112,2,t=>Kt(go(),t)),f("BRA",i.ZP_REL,128,2,t=>Kt(!0,t));const Ur=t=>{or((A.Accum&t)===0),mo((t&128)!==0),ir((t&64)!==0)};f("BIT",i.ZP_REL,36,2,t=>(Ur(C(t)),3)),f("BIT",i.ABS,44,3,(t,e)=>(Ur(C(D(t,e))),4)),f("BIT",i.IMM,137,2,t=>(or((A.Accum&t)===0),2)),f("BIT",i.ZP_X,52,2,t=>(Ur(C(b(t,A.XReg))),4)),f("BIT",i.ABS_X,60,3,(t,e)=>{const r=_(t,e,A.XReg);return Ur(C(r)),4+Z(r,D(t,e))});const Vn=(t,e,r=0)=>{const o=(A.PC+r)%65536,c=C(e),h=C(e+1);Xt(`${t} $`+W(h)+W(c),Math.trunc(o/256)),Xt(t,o%256),Xt("P",A.PStatus),Gn(!1),Zn();const S=_(c,h,t==="BRK"?-1:0);_t(S)},Bo=()=>(Jn(),Vn("BRK",65534,2),7);f("BRK",i.IMPLIED,0,1,Bo);const sc=()=>nc()?0:(Jn(!1),Vn("IRQ",65534),7),oc=()=>(Vn("NMI",65530),7);f("CLC",i.IMPLIED,24,1,()=>(L(!1),2)),f("CLD",i.IMPLIED,216,1,()=>(Gn(!1),2)),f("CLI",i.IMPLIED,88,1,()=>(Zn(!1),2)),f("CLV",i.IMPLIED,184,1,()=>(ir(!1),2));const Re=t=>{const e=C(t);L(A.Accum>=e),R((A.Accum-e+256)%256)},ic=t=>{const e=C(t);L(A.Accum>=e),R((A.Accum-e+256)%256)};f("CMP",i.IMM,201,2,t=>(L(A.Accum>=t),R((A.Accum-t+256)%256),2)),f("CMP",i.ZP_REL,197,2,t=>(Re(t),3)),f("CMP",i.ZP_X,213,2,t=>(Re(b(t,A.XReg)),4)),f("CMP",i.ABS,205,3,(t,e)=>(Re(D(t,e)),4)),f("CMP",i.ABS_X,221,3,(t,e)=>{const r=_(t,e,A.XReg);return ic(r),4+Z(r,D(t,e))}),f("CMP",i.ABS_Y,217,3,(t,e)=>{const r=_(t,e,A.YReg);return Re(r),4+Z(r,D(t,e))}),f("CMP",i.IND_X,193,2,t=>{const e=b(t,A.XReg);return Re(D(C(e),C(e+1))),6}),f("CMP",i.IND_Y,209,2,t=>zt(t,Re,!1)),f("CMP",i.IND,210,2,t=>te(t,Re,!1));const Do=t=>{const e=C(t);L(A.XReg>=e),R((A.XReg-e+256)%256)};f("CPX",i.IMM,224,2,t=>(L(A.XReg>=t),R((A.XReg-t+256)%256),2)),f("CPX",i.ZP_REL,228,2,t=>(Do(t),3)),f("CPX",i.ABS,236,3,(t,e)=>(Do(D(t,e)),4));const Ro=t=>{const e=C(t);L(A.YReg>=e),R((A.YReg-e+256)%256)};f("CPY",i.IMM,192,2,t=>(L(A.YReg>=t),R((A.YReg-t+256)%256),2)),f("CPY",i.ZP_REL,196,2,t=>(Ro(t),3)),f("CPY",i.ABS,204,3,(t,e)=>(Ro(D(t,e)),4));const Nr=t=>{const e=b(C(t),-1);d(t,e),R(e)};f("DEC",i.IMPLIED,58,1,()=>(A.Accum=b(A.Accum,-1),R(A.Accum),2)),f("DEC",i.ZP_REL,198,2,t=>(Nr(t),5)),f("DEC",i.ZP_X,214,2,t=>(Nr(b(t,A.XReg)),6)),f("DEC",i.ABS,206,3,(t,e)=>(Nr(D(t,e)),6)),f("DEC",i.ABS_X,222,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),Nr(r),7}),f("DEX",i.IMPLIED,202,1,()=>(A.XReg=b(A.XReg,-1),R(A.XReg),2)),f("DEY",i.IMPLIED,136,1,()=>(A.YReg=b(A.YReg,-1),R(A.YReg),2));const ne=t=>{A.Accum^=C(t),R(A.Accum)};f("EOR",i.IMM,73,2,t=>(A.Accum^=t,R(A.Accum),2)),f("EOR",i.ZP_REL,69,2,t=>(ne(t),3)),f("EOR",i.ZP_X,85,2,t=>(ne(b(t,A.XReg)),4)),f("EOR",i.ABS,77,3,(t,e)=>(ne(D(t,e)),4)),f("EOR",i.ABS_X,93,3,(t,e)=>{const r=_(t,e,A.XReg);return ne(r),4+Z(r,D(t,e))}),f("EOR",i.ABS_Y,89,3,(t,e)=>{const r=_(t,e,A.YReg);return ne(r),4+Z(r,D(t,e))}),f("EOR",i.IND_X,65,2,t=>{const e=b(t,A.XReg);return ne(D(C(e),C(e+1))),6}),f("EOR",i.IND_Y,81,2,t=>zt(t,ne,!1)),f("EOR",i.IND,82,2,t=>te(t,ne,!1));const Fr=t=>{const e=b(C(t),1);d(t,e),R(e)};f("INC",i.IMPLIED,26,1,()=>(A.Accum=b(A.Accum,1),R(A.Accum),2)),f("INC",i.ZP_REL,230,2,t=>(Fr(t),5)),f("INC",i.ZP_X,246,2,t=>(Fr(b(t,A.XReg)),6)),f("INC",i.ABS,238,3,(t,e)=>(Fr(D(t,e)),6)),f("INC",i.ABS_X,254,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),Fr(r),7}),f("INX",i.IMPLIED,232,1,()=>(A.XReg=b(A.XReg,1),R(A.XReg),2)),f("INY",i.IMPLIED,200,1,()=>(A.YReg=b(A.YReg,1),R(A.YReg),2)),f("JMP",i.ABS,76,3,(t,e)=>(_t(_(t,e,-3)),3)),f("JMP",i.IND,108,3,(t,e)=>{const r=D(t,e);return t=C(r),e=C((r+1)%65536),_t(_(t,e,-3)),6}),f("JMP",i.IND_X,124,3,(t,e)=>{const r=_(t,e,A.XReg);return t=C(r),e=C((r+1)%65536),_t(_(t,e,-3)),6}),f("JSR",i.ABS,32,3,(t,e)=>{const r=(A.PC+2)%65536;return Xt("JSR $"+W(e)+W(t),Math.trunc(r/256)),Xt("JSR",r%256),_t(_(t,e,-3)),6});const se=t=>{A.Accum=C(t),R(A.Accum)};f("LDA",i.IMM,169,2,t=>(A.Accum=t,R(A.Accum),2)),f("LDA",i.ZP_REL,165,2,t=>(se(t),3)),f("LDA",i.ZP_X,181,2,t=>(se(b(t,A.XReg)),4)),f("LDA",i.ABS,173,3,(t,e)=>(se(D(t,e)),4)),f("LDA",i.ABS_X,189,3,(t,e)=>{const r=_(t,e,A.XReg);return se(r),4+Z(r,D(t,e))}),f("LDA",i.ABS_Y,185,3,(t,e)=>{const r=_(t,e,A.YReg);return se(r),4+Z(r,D(t,e))}),f("LDA",i.IND_X,161,2,t=>{const e=b(t,A.XReg);return se(D(C(e),C((e+1)%256))),6}),f("LDA",i.IND_Y,177,2,t=>zt(t,se,!1)),f("LDA",i.IND,178,2,t=>te(t,se,!1));const xr=t=>{A.XReg=C(t),R(A.XReg)};f("LDX",i.IMM,162,2,t=>(A.XReg=t,R(A.XReg),2)),f("LDX",i.ZP_REL,166,2,t=>(xr(t),3)),f("LDX",i.ZP_Y,182,2,t=>(xr(b(t,A.YReg)),4)),f("LDX",i.ABS,174,3,(t,e)=>(xr(D(t,e)),4)),f("LDX",i.ABS_Y,190,3,(t,e)=>{const r=_(t,e,A.YReg);return xr(r),4+Z(r,D(t,e))});const Qr=t=>{A.YReg=C(t),R(A.YReg)};f("LDY",i.IMM,160,2,t=>(A.YReg=t,R(A.YReg),2)),f("LDY",i.ZP_REL,164,2,t=>(Qr(t),3)),f("LDY",i.ZP_X,180,2,t=>(Qr(b(t,A.XReg)),4)),f("LDY",i.ABS,172,3,(t,e)=>(Qr(D(t,e)),4)),f("LDY",i.ABS_X,188,3,(t,e)=>{const r=_(t,e,A.XReg);return Qr(r),4+Z(r,D(t,e))});const Xr=t=>{let e=C(t);C(t),L((e&1)===1),e>>=1,d(t,e),R(e)};f("LSR",i.IMPLIED,74,1,()=>(L((A.Accum&1)===1),A.Accum>>=1,R(A.Accum),2)),f("LSR",i.ZP_REL,70,2,t=>(Xr(t),5)),f("LSR",i.ZP_X,86,2,t=>(Xr(b(t,A.XReg)),6)),f("LSR",i.ABS,78,3,(t,e)=>(Xr(D(t,e)),6)),f("LSR",i.ABS_X,94,3,(t,e)=>{const r=_(t,e,A.XReg);return Xr(r),6+Z(r,D(t,e))}),f("NOP",i.IMPLIED,234,1,()=>2);const oe=t=>{A.Accum|=C(t),R(A.Accum)};f("ORA",i.IMM,9,2,t=>(A.Accum|=t,R(A.Accum),2)),f("ORA",i.ZP_REL,5,2,t=>(oe(t),3)),f("ORA",i.ZP_X,21,2,t=>(oe(b(t,A.XReg)),4)),f("ORA",i.ABS,13,3,(t,e)=>(oe(D(t,e)),4)),f("ORA",i.ABS_X,29,3,(t,e)=>{const r=_(t,e,A.XReg);return oe(r),4+Z(r,D(t,e))}),f("ORA",i.ABS_Y,25,3,(t,e)=>{const r=_(t,e,A.YReg);return oe(r),4+Z(r,D(t,e))}),f("ORA",i.IND_X,1,2,t=>{const e=b(t,A.XReg);return oe(D(C(e),C(e+1))),6}),f("ORA",i.IND_Y,17,2,t=>zt(t,oe,!1)),f("ORA",i.IND,18,2,t=>te(t,oe,!1)),f("PHA",i.IMPLIED,72,1,()=>(Xt("PHA",A.Accum),3)),f("PHP",i.IMPLIED,8,1,()=>(Xt("PHP",A.PStatus|16),3)),f("PHX",i.IMPLIED,218,1,()=>(Xt("PHX",A.XReg),3)),f("PHY",i.IMPLIED,90,1,()=>(Xt("PHY",A.YReg),3)),f("PLA",i.IMPLIED,104,1,()=>(A.Accum=Yt(),R(A.Accum),4)),f("PLP",i.IMPLIED,40,1,()=>(po(Yt()),4)),f("PLX",i.IMPLIED,250,1,()=>(A.XReg=Yt(),R(A.XReg),4)),f("PLY",i.IMPLIED,122,1,()=>(A.YReg=Yt(),R(A.YReg),4));const Yr=t=>{let e=C(t);C(t);const r=Dt()?1:0;L((e&128)===128),e=(e<<1)%256|r,d(t,e),R(e)};f("ROL",i.IMPLIED,42,1,()=>{const t=Dt()?1:0;return L((A.Accum&128)===128),A.Accum=(A.Accum<<1)%256|t,R(A.Accum),2}),f("ROL",i.ZP_REL,38,2,t=>(Yr(t),5)),f("ROL",i.ZP_X,54,2,t=>(Yr(b(t,A.XReg)),6)),f("ROL",i.ABS,46,3,(t,e)=>(Yr(D(t,e)),6)),f("ROL",i.ABS_X,62,3,(t,e)=>{const r=_(t,e,A.XReg);return Yr(r),6+Z(r,D(t,e))});const Kr=t=>{let e=C(t);C(t);const r=Dt()?128:0;L((e&1)===1),e=e>>1|r,d(t,e),R(e)};f("ROR",i.IMPLIED,106,1,()=>{const t=Dt()?128:0;return L((A.Accum&1)===1),A.Accum=A.Accum>>1|t,R(A.Accum),2}),f("ROR",i.ZP_REL,102,2,t=>(Kr(t),5)),f("ROR",i.ZP_X,118,2,t=>(Kr(b(t,A.XReg)),6)),f("ROR",i.ABS,110,3,(t,e)=>(Kr(D(t,e)),6)),f("ROR",i.ABS_X,126,3,(t,e)=>{const r=_(t,e,A.XReg);return Kr(r),6+Z(r,D(t,e))}),f("RTI",i.IMPLIED,64,1,()=>(po(Yt()),Jn(!1),_t(D(Yt(),Yt())-1),6)),f("RTS",i.IMPLIED,96,1,()=>(_t(D(Yt(),Yt())),6));const To=t=>{const e=255-t;let r=A.Accum+e+(Dt()?1:0);const o=r>=256,c=A.Accum<=127&&e<=127,h=A.Accum>=128&&e>=128;ir(r%256>=128?c:h);const S=(A.Accum&15)-(t&15)+(Dt()?0:-1);r=A.Accum-t+(Dt()?0:-1),r<0&&(r-=96),S<0&&(r-=6),A.Accum=r&255,R(A.Accum),L(o)},ie=t=>{tt()?To(C(t)):_r(255-C(t))};f("SBC",i.IMM,233,2,t=>(tt()?To(t):_r(255-t),2+tt())),f("SBC",i.ZP_REL,229,2,t=>(ie(t),3+tt())),f("SBC",i.ZP_X,245,2,t=>(ie(b(t,A.XReg)),4+tt())),f("SBC",i.ABS,237,3,(t,e)=>(ie(D(t,e)),4+tt())),f("SBC",i.ABS_X,253,3,(t,e)=>{const r=_(t,e,A.XReg);return ie(r),4+tt()+Z(r,D(t,e))}),f("SBC",i.ABS_Y,249,3,(t,e)=>{const r=_(t,e,A.YReg);return ie(r),4+tt()+Z(r,D(t,e))}),f("SBC",i.IND_X,225,2,t=>{const e=b(t,A.XReg);return ie(D(C(e),C(e+1))),6+tt()}),f("SBC",i.IND_Y,241,2,t=>zt(t,ie,!0)),f("SBC",i.IND,242,2,t=>te(t,ie,!0)),f("SEC",i.IMPLIED,56,1,()=>(L(),2)),f("SED",i.IMPLIED,248,1,()=>(Gn(),2)),f("SEI",i.IMPLIED,120,1,()=>(Zn(),2)),f("STA",i.ZP_REL,133,2,t=>(d(t,A.Accum),3)),f("STA",i.ZP_X,149,2,t=>(d(b(t,A.XReg),A.Accum),4)),f("STA",i.ABS,141,3,(t,e)=>(d(D(t,e),A.Accum),4)),f("STA",i.ABS_X,157,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),d(r,A.Accum),5}),f("STA",i.ABS_Y,153,3,(t,e)=>(d(_(t,e,A.YReg),A.Accum),5)),f("STA",i.IND_X,129,2,t=>{const e=b(t,A.XReg);return d(D(C(e),C(e+1)),A.Accum),6});const ko=t=>{d(t,A.Accum)};f("STA",i.IND_Y,145,2,t=>(zt(t,ko,!1),6)),f("STA",i.IND,146,2,t=>te(t,ko,!1)),f("STX",i.ZP_REL,134,2,t=>(d(t,A.XReg),3)),f("STX",i.ZP_Y,150,2,t=>(d(b(t,A.YReg),A.XReg),4)),f("STX",i.ABS,142,3,(t,e)=>(d(D(t,e),A.XReg),4)),f("STY",i.ZP_REL,132,2,t=>(d(t,A.YReg),3)),f("STY",i.ZP_X,148,2,t=>(d(b(t,A.XReg),A.YReg),4)),f("STY",i.ABS,140,3,(t,e)=>(d(D(t,e),A.YReg),4)),f("STZ",i.ZP_REL,100,2,t=>(d(t,0),3)),f("STZ",i.ZP_X,116,2,t=>(d(b(t,A.XReg),0),4)),f("STZ",i.ABS,156,3,(t,e)=>(d(D(t,e),0),4)),f("STZ",i.ABS_X,158,3,(t,e)=>{const r=_(t,e,A.XReg);return C(r),d(r,0),5}),f("TAX",i.IMPLIED,170,1,()=>(A.XReg=A.Accum,R(A.XReg),2)),f("TAY",i.IMPLIED,168,1,()=>(A.YReg=A.Accum,R(A.YReg),2)),f("TSX",i.IMPLIED,186,1,()=>(A.XReg=A.StackPtr,R(A.XReg),2)),f("TXA",i.IMPLIED,138,1,()=>(A.Accum=A.XReg,R(A.Accum),2)),f("TXS",i.IMPLIED,154,1,()=>(A.StackPtr=A.XReg,2)),f("TYA",i.IMPLIED,152,1,()=>(A.Accum=A.YReg,R(A.Accum),2));const yo=t=>{const e=C(t);or((A.Accum&e)===0),d(t,e&~A.Accum)};f("TRB",i.ZP_REL,20,2,t=>(yo(t),5)),f("TRB",i.ABS,28,3,(t,e)=>(yo(D(t,e)),6));const Po=t=>{const e=C(t);or((A.Accum&e)===0),d(t,e|A.Accum)};f("TSB",i.ZP_REL,4,2,t=>(Po(t),5)),f("TSB",i.ABS,12,3,(t,e)=>(Po(D(t,e)),6));const ac=[2,34,66,98,130,194,226],Rt="???";ac.forEach(t=>{f(Rt,i.IMPLIED,t,2,()=>2)});for(let t=0;t<=15;t++)f(Rt,i.IMPLIED,3+16*t,1,()=>1),f(Rt,i.IMPLIED,7+16*t,1,()=>1),f(Rt,i.IMPLIED,11+16*t,1,()=>1),f(Rt,i.IMPLIED,15+16*t,1,()=>1);f(Rt,i.IMPLIED,68,2,()=>3),f(Rt,i.IMPLIED,84,2,()=>4),f(Rt,i.IMPLIED,212,2,()=>4),f(Rt,i.IMPLIED,244,2,()=>4),f(Rt,i.IMPLIED,92,3,()=>8),f(Rt,i.IMPLIED,220,3,()=>4),f(Rt,i.IMPLIED,252,3,()=>4);for(let t=0;t<256;t++)kt[t]||(console.log("ERROR: OPCODE "+t.toString(16)+" should be implemented"),f("BRK",i.IMPLIED,t,1,Bo));const ot=(t,e,r)=>{const o=e&7,c=e>>>3;return t[c]|=r>>>o,o&&(t[c+1]|=r<<8-o),e+8},qr=(t,e,r)=>(e=ot(t,e,r>>>1|170),e=ot(t,e,r|170),e),Hn=(t,e)=>(e=ot(t,e,255),e+2);/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/const cc=t=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],r=new Uint8Array(343),o=[0,2,1,3];for(let h=0;h<84;h++)r[h]=o[t[h]&3]|o[t[h+86]&3]<<2|o[t[h+172]&3]<<4;r[84]=o[t[84]&3]<<0|o[t[170]&3]<<2,r[85]=o[t[85]&3]<<0|o[t[171]&3]<<2;for(let h=0;h<256;h++)r[86+h]=t[h]>>>2;r[342]=r[341];let c=342;for(;c>1;)c--,r[c]^=r[c-1];for(let h=0;h<343;h++)r[h]=e[r[h]];return r};/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/const Ac=(t,e,r)=>{let o=0;const c=new Uint8Array(6646).fill(0);for(let h=0;h<16;h++)o=Hn(c,o);for(let h=0;h<16;h++){o=ot(c,o,213),o=ot(c,o,170),o=ot(c,o,150),o=qr(c,o,254),o=qr(c,o,e),o=qr(c,o,h),o=qr(c,o,254^e^h),o=ot(c,o,222),o=ot(c,o,170),o=ot(c,o,235);for(let B=0;B<7;B++)o=Hn(c,o);o=ot(c,o,213),o=ot(c,o,170),o=ot(c,o,173);const S=h===15?15:h*(r?8:7)%15,u=cc(t.slice(S*256,S*256+256));for(let B=0;B<u.length;B++)o=ot(c,o,u[B]);o=ot(c,o,222),o=ot(c,o,170),o=ot(c,o,235);for(let B=0;B<16;B++)o=Hn(c,o)}return c},lc=(t,e)=>{const r=t.length/4096;if(r<34||r>40)return new Uint8Array;const o=new Uint8Array(1536+r*13*512).fill(0);o.set(ve(`WOZ2ÿ
\r
`),0),o.set(ve("INFO"),12),o[16]=60,o[20]=2,o[21]=1,o[22]=0,o[23]=0,o[24]=1,o.fill(32,25,57),o.set(ve("Apple2TS (CT6502)"),25),o[57]=1,o[58]=0,o[59]=32,o[60]=0,o[62]=0,o[64]=13,o.set(ve("TMAP"),80),o[84]=160,o.fill(255,88,248);let c=0;for(let h=0;h<r;h++)c=88+(h<<2),h>0&&(o[c-1]=h),o[c]=o[c+1]=h;o.set(ve("TRKS"),248),o.set(ds(1280+r*13*512),252);for(let h=0;h<r;h++){c=256+(h<<3),o.set(Ji(3+h*13),c),o[c+2]=13,o.set(ds(50304),c+4);const S=t.slice(h*16*256,(h+1)*16*256),u=Ac(S,h,e);c=1536+h*13*512,o.set(u,c)}return o},uc=(t,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,B)=>u!==e[B])===void 0))return!1;t.isWriteProtected=e[22]===1,t.isSynchronized=e[23]===1;const c=e.slice(8,12),h=c[0]+(c[1]<<8)+(c[2]<<16)+c[3]*2**24,S=Hi(e,12);if(h!==0&&h!==S)return alert("CRC checksum error: "+t.filename),!1;for(let u=0;u<80;u++){const B=e[88+u*2];if(B<255){const G=256+8*B,y=e.slice(G,G+8);t.trackStart[u]=512*((y[1]<<8)+y[0]),t.trackNbits[u]=y[4]+(y[5]<<8)+(y[6]<<16)+y[7]*2**24,t.maxHalftrack=u}else t.trackStart[u]=0,t.trackNbits[u]=51200}return!0},hc=(t,e)=>{if(!([87,79,90,49,255,10,13,10].find((c,h)=>c!==e[h])===void 0))return!1;t.isWriteProtected=e[22]===1;for(let c=0;c<80;c++){const h=e[88+c*2];if(h<255){t.trackStart[c]=256+h*6656;const S=e.slice(t.trackStart[c]+6646,t.trackStart[c]+6656);t.trackNbits[c]=S[2]+(S[3]<<8),t.maxHalftrack=c}else t.trackStart[c]=0,t.trackNbits[c]=51200}return!0},fc=t=>{const e=t.toLowerCase(),r=e.endsWith(".dsk")||e.endsWith(".do"),o=e.endsWith(".po");return r||o},pc=(t,e)=>{const o=t.filename.toLowerCase().endsWith(".po"),c=lc(e,o);return c.length===0?new Uint8Array:(t.filename=Ds(t.filename,"woz"),t.diskHasChanges=!0,c)},wo=t=>t[0]+256*(t[1]+256*(t[2]+256*t[3])),Ic=(t,e)=>{const r=wo(e.slice(24,28)),o=wo(e.slice(28,32));let c="";for(let h=0;h<4;h++)c+=String.fromCharCode(e[h]);return c!=="2IMG"?(console.error("Corrupt 2MG file."),new Uint8Array):e[12]!==1?(console.error("Only ProDOS 2MG files are supported."),new Uint8Array):(t.filename=Ds(t.filename,"hdv"),t.diskHasChanges=!0,e.slice(r,r+o))},bo=t=>{const e=t.toLowerCase();return e.endsWith(".hdv")||e.endsWith(".po")||e.endsWith(".2mg")},Sc=(t,e)=>{t.diskHasChanges=!1;const r=t.filename.toLowerCase();if(bo(r)){if(t.hardDrive=!0,t.status="",r.endsWith(".hdv")||r.endsWith(".po"))return e;if(r.endsWith(".2mg"))return Ic(t,e)}return fc(t.filename)&&(e=pc(t,e)),uc(t,e)||hc(t,e)?e:(r!==""&&console.error("Unknown disk format."),new Uint8Array)},gc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let xe=0,$=0,at=0,Wr=!1,jn=!1;const Lo=t=>{Wr=!1,xo(t),t.halftrack=t.maxHalftrack,t.prevHalfTrack=t.maxHalftrack},Ec=(t=!1)=>{if(t){const e=Hr();e.motorRunning&&Qo(e)}else Je(Ie.MOTOR_OFF)},Mo=(t,e,r)=>{t.prevHalfTrack=t.halftrack,t.halftrack+=e,t.halftrack<0||t.halftrack>t.maxHalftrack?(Je(Ie.TRACK_END),t.halftrack=Math.max(0,Math.min(t.halftrack,t.maxHalftrack))):Je(Ie.TRACK_SEEK),t.status=` Trk ${t.halftrack/2}`,pt(),at+=r,t.trackLocation+=Math.floor(at/4),at=at%4,t.trackLocation=Math.floor(t.trackLocation*(t.trackNbits[t.halftrack]/t.trackNbits[t.prevHalfTrack]))+7};let _o=0;const mc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],Oo=()=>(_o++,mc[_o&31]);let Zr=0;const Cc=t=>(Zr<<=1,Zr|=t,Zr&=15,Zr===0?Oo():t),Uo=[128,64,32,16,8,4,2,1],Bc=[127,191,223,239,247,251,253,254],Gr=(t,e)=>{t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack];let r;if(t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3),c=e[o],h=t.trackLocation&7;r=(c&Uo[h])>>7-h,r=Cc(r)}else r=Oo();return t.trackLocation++,r},dc=()=>Math.floor(256*Math.random()),No=(t,e,r)=>{if(e.length===0)return dc();let o=0;if(t.isSynchronized){for(at+=r;at>=4;){const c=Gr(t,e);if(($>0||c)&&($=$<<1|c),at-=4,$&128&&at<=6)break}at<0&&(at=0),$&=255}else if($===0){for(;Gr(t,e)===0;);$=64;for(let c=5;c>=0;c--)$|=Gr(t,e)<<c}else{const c=Gr(t,e);$=$<<1|c}return o=$,$>127&&($=0),o};let qt=0;const $n=(t,e,r)=>{if(t.trackLocation=t.trackLocation%t.trackNbits[t.halftrack],t.trackStart[t.halftrack]>0){const o=t.trackStart[t.halftrack]+(t.trackLocation>>3);let c=e[o];const h=t.trackLocation&7;r?c|=Uo[h]:c&=Bc[h],e[o]=c}t.trackLocation++},Fo=(t,e,r)=>{if(!(e.length===0||t.trackStart[t.halftrack]===0)&&$>0){if(r>=16)for(let o=7;o>=0;o--)$n(t,e,$&2**o?1:0);r>=36&&$n(t,e,0),r>=40&&$n(t,e,0),vn.push(r>=40?2:r>=36?1:$),t.diskHasChanges=!0,$=0}},xo=t=>{xe=0,Wr||(t.motorRunning=!1),pt(),Je(Ie.MOTOR_OFF)},Qo=t=>{xe?(clearTimeout(xe),xe=0):at=0,t.motorRunning=!0,pt(),Je(Ie.MOTOR_ON)},Dc=t=>{xe===0&&(xe=setTimeout(()=>xo(t),1e3))};let vn=[];const Jr=t=>{vn.length>0&&t.halftrack===2*0&&(vn=[])},Vr=[0,0,0,0],Rc=(t,e)=>{if(t>=49408)return-1;let r=Hr();const o=yc();if(r.hardDrive)return 0;let c=0;const h=A.cycleCount-qt;switch(t=t&15,t){case 9:Wr=!0,Qo(r),Jr(r);break;case 8:r.motorRunning&&!r.writeMode&&(c=No(r,o,h),qt=A.cycleCount),Wr=!1,Dc(r),Jr(r);break;case 10:case 11:{const S=t===10?2:3,u=Hr();kc(S),r=Hr(),r!==u&&u.motorRunning&&(u.motorRunning=!1,r.motorRunning=!0,pt());break}case 12:jn=!1,r.motorRunning&&!r.writeMode&&(c=No(r,o,h),qt=A.cycleCount);break;case 13:jn=!0,r.motorRunning&&(r.writeMode?(Fo(r,o,h),qt=A.cycleCount):($=0,at+=h,r.trackLocation+=Math.floor(at/4),at=at%4,qt=A.cycleCount),e>=0&&($=e));break;case 14:r.motorRunning&&r.writeMode&&(Fo(r,o,h),qt=A.cycleCount),r.writeMode=!1,jn&&(c=r.isWriteProtected?255:0),Jr(r);break;case 15:r.writeMode=!0,qt=A.cycleCount,e>=0&&($=e);break;default:{if(t<0||t>7)break;Vr[Math.floor(t/2)]=t%2;const S=Vr[(r.currentPhase+1)%4],u=Vr[(r.currentPhase+3)%4];Vr[r.currentPhase]||(r.motorRunning&&S?(Mo(r,1,h),r.currentPhase=(r.currentPhase+1)%4,qt=A.cycleCount):r.motorRunning&&u&&(Mo(r,-1,h),r.currentPhase=(r.currentPhase+3)%4,qt=A.cycleCount)),Jr(r);break}}return c},Tc=()=>{Ne(6,Uint8Array.from(gc)),er(6,Rc)},Wt=(t,e,r)=>({index:t,hardDrive:r,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,halftrack:0,prevHalfTrack:0,writeMode:!1,currentPhase:0,trackStart:r?Array():Array(80),trackNbits:r?Array():Array(80),trackLocation:0,maxHalftrack:0}),Xo=()=>{F[0]=Wt(0,1,!0),F[1]=Wt(1,2,!0),F[2]=Wt(2,1,!1),F[3]=Wt(3,2,!1);for(let t=0;t<F.length;t++)Zt[t]=new Uint8Array},F=[],Zt=[];Xo();let Te=2;const kc=t=>{Te=t},Hr=()=>F[Te],yc=()=>Zt[Te],zn=t=>F[t==2?1:0],jr=t=>Zt[t==2?1:0],pt=()=>{for(let t=0;t<F.length;t++){const e={index:t,hardDrive:F[t].hardDrive,drive:F[t].drive,filename:F[t].filename,status:F[t].status,motorRunning:F[t].motorRunning,diskHasChanges:F[t].diskHasChanges,isWriteProtected:F[t].isWriteProtected,diskData:F[t].diskHasChanges?Zt[t]:new Uint8Array};u0(e)}},Pc=t=>{const e=["","",""];for(let o=0;o<F.length;o++)(t||Zt[o].length<32e6)&&(e[o]=ft.Buffer.from(Zt[o]).toString("base64"));const r={currentDrive:Te,driveState:[Wt(0,1,!0),Wt(1,2,!0),Wt(2,1,!1),Wt(3,2,!1)],driveData:e};for(let o=0;o<F.length;o++)r.driveState[o]={...F[o]};return r},wc=t=>{Je(Ie.MOTOR_OFF),Te=t.currentDrive,t.driveState.length===3&&Te>0&&Te++,Xo();let e=0;for(let r=0;r<t.driveState.length;r++)F[e]={...t.driveState[r]},t.driveData[r]!==""&&(Zt[e]=new Uint8Array(ft.Buffer.from(t.driveData[r],"base64"))),t.driveState.length===3&&r===0&&(e=1),e++;pt()},bc=()=>{Lo(F[1]),Lo(F[2]),pt()},Yo=(t=!1)=>{Ec(t),pt()},Lc=t=>{let e=t.index,r=t.drive,o=t.hardDrive;t.filename!==""&&(bo(t.filename)?(o=!0,e=t.drive<=1?0:1,r=e+1):(o=!1,e=t.drive<=1?2:3,r=e-1)),F[e]=Wt(e,r,o),F[e].filename=t.filename,F[e].motorRunning=t.motorRunning,Zt[e]=Sc(F[e],t.diskData),Zt[e].length===0&&(F[e].filename=""),pt()},Mc=t=>{const e=t.index;F[e].filename=t.filename,F[e].motorRunning=t.motorRunning,F[e].isWriteProtected=t.isWriteProtected,pt()};let $r=!1;const Ko=t=>{const e=t.split(","),r=e[0].split(/([+-])/);return{label:r[0]?r[0]:"",operation:r[1]?r[1]:"",value:r[2]?parseInt(r[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},qo=t=>{let e=i.IMPLIED,r=-1;if(t.length>0){t.startsWith("#")?(e=i.IMM,t=t.substring(1)):t.startsWith("(")?(t.endsWith(",Y")?e=i.IND_Y:t.endsWith(",X)")?e=i.IND_X:e=i.IND,t=t.substring(1)):t.endsWith(",X")?e=t.length>5?i.ABS_X:i.ZP_X:t.endsWith(",Y")?e=t.length>5?i.ABS_Y:i.ZP_Y:e=t.length>3?i.ABS:i.ZP_REL,t.startsWith("$")&&(t="0x"+t.substring(1)),r=parseInt(t);const o=Ko(t);if(o.operation&&o.value){switch(o.operation){case"+":r+=o.value;break;case"-":r-=o.value;break;default:console.error("Unknown operation in operand: "+t)}r=(r%65536+65536)%65536}}return[e,r]};let ke={};const Wo=(t,e,r,o)=>{let c=i.IMPLIED,h=-1;if(r.match(/^[#]?[$0-9()]+/))return Object.entries(ke).forEach(([u,B])=>{r=r.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+W(B))}),qo(r);const S=Ko(r);if(S.label){const u=S.label.startsWith("<"),B=S.label.startsWith(">"),G=S.label.startsWith("#")||B||u;if(G&&(S.label=S.label.substring(1)),S.label in ke?(h=ke[S.label],B?h=h>>8&255:u&&(h=h&255)):o===2&&console.error("Missing label: "+S.label),S.operation&&S.value){switch(S.operation){case"+":h+=S.value;break;case"-":h-=S.value;break;default:console.error("Unknown operation in operand: "+r)}h=(h%65536+65536)%65536}mn(e)?(c=i.ZP_REL,h=h-t+254,h>255&&(h-=256)):G?c=i.IMM:(c=h>=0&&h<=255?i.ZP_REL:i.ABS,c=S.idx==="X"?c===i.ABS?i.ABS_X:i.ZP_X:c,c=S.idx==="Y"?c===i.ABS?i.ABS_Y:i.ZP_Y:c)}return[c,h]},_c=(t,e)=>{t=t.replace(/\s+/g," ");const r=t.split(" ");return{label:r[0]?r[0]:e,instr:r[1]?r[1]:"",operand:r[2]?r[2]:""}},Oc=(t,e)=>{if(t.label in ke&&console.error("Redefined label: "+t.label),t.instr==="EQU"){const[r,o]=Wo(e,t.instr,t.operand,2);r!==i.ABS&&r!==i.ZP_REL&&console.error("Illegal EQU value: "+t.operand),ke[t.label]=o}else ke[t.label]=e},Uc=t=>{const e=[];switch(t.instr){case"ASC":case"DA":{let r=t.operand,o=0;r.startsWith('"')&&r.endsWith('"')?o=128:r.startsWith("'")&&r.endsWith("'")?o=0:console.error("Invalid string: "+r),r=r.substring(1,r.length-1);for(let c=0;c<r.length;c++)e.push(r.charCodeAt(c)|o);e.push(0);break}case"HEX":{(t.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(c=>{const h=parseInt(c,16);isNaN(h)&&console.error(`Invalid HEX value: ${c} in ${t.operand}`),e.push(h)});break}default:console.error("Unknown pseudo ops: "+t.instr);break}return e},Nc=(t,e)=>{const r=[],o=kt[t];return r.push(t),e>=0&&(r.push(e%256),o.bytes===3&&r.push(Math.trunc(e/256))),r};let ts=0;const Zo=(t,e)=>{let r=ts;const o=[];let c="";if(t.forEach(h=>{if(h=h.split(";")[0].trimEnd().toUpperCase(),!h)return;let S=(h+"                   ").slice(0,30)+W(r,4)+"- ";const u=_c(h,c);if(c="",!u.instr){c=u.label;return}if(u.instr==="ORG"){if(e===1){const[Y,j]=qo(u.operand);Y===i.ABS&&(ts=j,r=j)}$r&&e===2&&console.log(S);return}if(e===1&&u.label&&Oc(u,r),u.instr==="EQU")return;let B=[],G,y;if(["ASC","DA","HEX"].includes(u.instr))B=Uc(u),r+=B.length;else if([G,y]=Wo(r,u.instr,u.operand,e),e===2&&isNaN(y)&&console.error(`Unknown/illegal value: ${h}`),u.instr==="DB")B.push(y&255),r++;else if(u.instr==="DW")B.push(y&255),B.push(y>>8&255),r+=2;else if(u.instr==="DS")for(let Y=0;Y<y;Y++)B.push(0),r++;else{e===2&&mn(u.instr)&&(y<0||y>255)&&console.error(`Branch instruction out of range: ${h} value: ${y} pass: ${e}`);const Y=kt.findIndex(j=>j&&j.name===u.instr&&j.mode===G);Y<0&&console.error(`Unknown instruction: "${h}" mode=${G} pass=${e}`),B=Nc(Y,y),r+=kt[Y].bytes}$r&&e===2&&(B.forEach(Y=>{S+=` ${W(Y)}`}),console.log(S)),o.push(...B)}),$r&&e===2){let h="";o.forEach(S=>{h+=` ${W(S)}`}),console.log(h)}return o},vr=(t,e,r=!1)=>{ke={},$r=r;try{return ts=t,Zo(e,1),Zo(e,2)}catch(o){return console.error(o),[]}},Go=`
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
`,It={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},ar={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},ye={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};class Fc{constructor(e){T(this,"_control");T(this,"_status");T(this,"_command");T(this,"_lastRead");T(this,"_lastConfig");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._control=ar.HW_RESET,this._command=ye.HW_RESET,this._status=It.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=It.OVRN;this._status|=It.RX_FULL,this._control&ye.RX_INT_DIS||this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),this._command&ye.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(It.PE|It.FE|It.OVRN),this._receiveBuffer.length?(this._status|=It.RX_FULL,this._control&ye.RX_INT_DIS||this.irq(!0)):this._status&=~It.RX_FULL,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&It.IRQ&&this.irq(!1),this._status&=~It.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=It.IRQ:this._status&=~It.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&ar.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ar.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ar.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&ye.PARITY_EN)switch(this._command&ye.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let r=!1;e.baud!=this._lastConfig.baud&&(r=!0),e.bits!=this._lastConfig.bits&&(r=!0),e.stop!=this._lastConfig.stop&&(r=!0),e.parity!=this._lastConfig.parity&&(r=!0),r&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=ar.HW_RESET,this._command=ye.HW_RESET,this._status=It.HW_RESET,this.irq(!1),this._receiveBuffer=[]}}const es=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let zr=1,St;const xc=t=>{tr(zr,t)},Qc=t=>{console.log("ConfigChange: ",t)},Xc=t=>{St&&St.buffer(t)},Yc=()=>{St&&St.reset()},Kc=(t=!0,e=1)=>{if(!t)return;zr=e;const r={sendData:f0,interrupt:xc,configChange:Qc};St=new Fc(r);const o=new Uint8Array(es.length+256);o.set(es.slice(1792,2048)),o.set(es,256),Ne(zr,o),er(zr,qc)},qc=(t,e=-1)=>{if(t>=49408)return-1;const r={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(t&15){case r.DIPSW1:return 226;case r.DIPSW2:return 40;case r.IOREG:if(e>=0)St.data=e;else return St.data;break;case r.STATUS:if(e>=0)St.status=e;else return St.status;break;case r.COMMAND:if(e>=0)St.command=e;else return St.command;break;case r.CONTROL:if(e>=0)St.control=e;else return St.control;break;default:console.log("SSC unknown softswitch",(t&15).toString(16));break}return-1},cr=(t,e)=>String(t).padStart(e,"0");(()=>{const t=new Uint8Array(256).fill(96);return t[0]=8,t[2]=40,t[4]=88,t[6]=112,t})();const Wc=()=>{const t=new Date,e=cr(t.getMonth()+1,2)+","+cr(t.getDay(),2)+","+cr(t.getDate(),2)+","+cr(t.getHours(),2)+","+cr(t.getMinutes(),2);for(let r=0;r<e.length;r++)d(512+r,e.charCodeAt(r)|128)},Zc=`
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
`,Jo=()=>{yt=0,Pt=0,Gt=0,Jt=0,Pe=1023,we=1023,nn(0),nt=0,ce=0,Qe=0,Ar=0,lr=0,lt=0,Ut=0,Xe=0,tn=0};let yt=0,Pt=0,Gt=0,Jt=0,Pe=1023,we=1023,tn=0,ae=0,nt=0,ce=0,Qe=0,Ar=0,lr=0,lt=0,Ut=0,Xe=0,Vo=0,Nt=5;const en=54,rn=55,Gc=56,Jc=57,Ho=()=>{const t=new Uint8Array(256).fill(0),e=vr(0,Zc.split(`
`));return t.set(e,0),t[251]=214,t[255]=1,t},Vc=(t=!0,e=5)=>{if(!t)return;Nt=e;const r=49152+Nt*256,o=49152+Nt*256+8;Ne(Nt,Ho(),r,$c),Ne(Nt,Ho(),o,Wc),er(Nt,t1),Jo()},nn=t=>{ae=t,di(!t)},Hc=()=>{if(ae&1){let t=!1;ae&8&&(Xe|=8,t=!0),ae&ce&4&&(Xe|=4,t=!0),ae&ce&2&&(Xe|=2,t=!0),t&&tr(Nt,!0)}},jc=t=>{if(ae&1)if(t.buttons>=0){switch(t.buttons){case 0:nt&=-129;break;case 16:nt|=128;break;case 1:nt&=-17;break;case 17:nt|=16;break}ce|=nt&128?4:0}else t.x>=0&&t.x<=1&&(yt=Math.round((Pe-Gt)*t.x+Gt),ce|=2),t.y>=0&&t.y<=1&&(Pt=Math.round((we-Jt)*t.y+Jt),ce|=2)};let ur=0,rs="",jo=0,$o=0;const $c=()=>{const t=192+Nt;C(rn)===t&&C(en)===0?zc():C(Jc)===t&&C(Gc)===0&&vc()},vc=()=>{if(ur===0){const t=192+Nt;jo=C(rn),$o=C(en),d(rn,t),d(en,3);const e=(nt&128)!==(Qe&128);let r=0;nt&128?r=e?2:1:r=e?3:4,C(49152)&128&&(r=-r),Qe=nt,rs=yt.toString()+","+Pt.toString()+","+r.toString()}ur>=rs.length?(A.Accum=141,ur=0,d(rn,jo),d(en,$o)):(A.Accum=rs.charCodeAt(ur)|128,ur++)},zc=()=>{switch(A.Accum){case 128:console.log("mouse off"),nn(0);break;case 129:console.log("mouse on"),nn(1);break}},t1=(t,e)=>{if(t>=49408)return-1;const r=e<0,o={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},c={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(t&15){case o.LOWX:if(r===!1)lt=lt&65280|e,lt&=65535;else return yt&255;break;case o.HIGHX:if(r===!1)lt=e<<8|lt&255,lt&=65535;else return yt>>8&255;break;case o.LOWY:if(r===!1)Ut=Ut&65280|e,Ut&=65535;else return Pt&255;break;case o.HIGHY:if(r===!1)Ut=e<<8|Ut&255,Ut&=65535;else return Pt>>8&255;break;case o.STATUS:return nt;case o.MODE:if(r===!1)nn(e),console.log("Mouse mode: 0x",ae.toString(16));else return ae;break;case o.CLAMP:if(r===!1)tn=78-e;else switch(tn){case 0:return Gt>>8&255;case 1:return Jt>>8&255;case 2:return Gt&255;case 3:return Jt&255;case 4:return Pe>>8&255;case 5:return we>>8&255;case 6:return Pe&255;case 7:return we&255;default:return console.log("AppleMouse: invalid clamp index: "+tn),0}break;case o.CLOCK:case o.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case o.COMMAND:if(r===!1)switch(Vo=e,e){case c.INIT:console.log("cmd.init"),yt=0,Pt=0,Ar=0,lr=0,Gt=0,Jt=0,Pe=1023,we=1023,nt=0,ce=0;break;case c.READ:ce=0,nt&=-112,nt|=Qe>>1&64,nt|=Qe>>4&1,Qe=nt,(Ar!==yt||lr!==Pt)&&(nt|=32),Ar=yt,lr=Pt;break;case c.CLEAR:console.log("cmd.clear"),yt=0,Pt=0,Ar=0,lr=0;break;case c.SERVE:nt&=-15,nt|=Xe,Xe=0,tr(Nt,!1);break;case c.HOME:console.log("cmd.home"),yt=Gt,Pt=Jt;break;case c.CLAMPX:console.log("cmd.clampx"),Gt=lt>32767?lt-65536:lt,Pe=Ut,console.log(Gt+" -> "+Pe);break;case c.CLAMPY:console.log("cmd.clampy"),Jt=lt>32767?lt-65536:lt,we=Ut,console.log(Jt+" -> "+we);break;case c.GCLAMP:console.log("cmd.getclamp");break;case c.POS:console.log("cmd.pos"),yt=lt,Pt=Ut;break}else return Vo;break;default:console.log("AppleMouse unknown IO addr",t.toString(16));break}return 0},wt={RX_FULL:1,TX_EMPTY:2,NDCD:4,NCTS:8,FE:16,OVRN:32,PE:64,IRQ:128},Vt={COUNTER_DIV1:1,COUNTER_DIV2:2,WORD_SEL1:4,WORD_SEL2:8,WORD_SEL3:16,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class e1{constructor(e){T(this,"_control");T(this,"_status");T(this,"_lastRead");T(this,"_receiveBuffer");T(this,"_extFuncs");this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}buffer(e){for(let o=0;o<e.length;o++)this._receiveBuffer.push(e[o]);let r=this._receiveBuffer.length-16;r=r<0?0:r;for(let o=0;o<r;o++)this._receiveBuffer.shift(),this._status|=wt.OVRN;this._status|=wt.RX_FULL,this._control&Vt.RX_INT_ENABLE&&this.irq(!0)}set data(e){const r=new Uint8Array(1).fill(e);this._extFuncs.sendData(r),(this._control&(Vt.TX_INT_ENABLE|Vt.NRTS))===Vt.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(wt.FE|wt.OVRN|wt.PE),this._receiveBuffer.length?(this._status|=wt.RX_FULL,this._control&Vt.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~wt.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(Vt.COUNTER_DIV1|Vt.COUNTER_DIV2))===(Vt.COUNTER_DIV1|Vt.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&wt.IRQ&&this.irq(!1),e}irq(e){e?this._status|=wt.IRQ:this._status&=~wt.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=wt.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}}const Ft={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},ns={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128};class ss{constructor(){T(this,"_latch");T(this,"_count");T(this,"_control");this._latch=65535,this._count=65535,this._control=0}decrement(e){return!(this._control&Ft.INTERNAL_CLOCK)||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Ft.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}}class r1{constructor(e){T(this,"_timer");T(this,"_status");T(this,"_statusRead");T(this,"_msb");T(this,"_lsb");T(this,"_div8");T(this,"_interrupt");this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new ss,new ss,new ss],this._msb=this._lsb=0,this._div8=0,this.reset()}status(){return this._statusRead=!!this._status,this._status}timerControl(e,r){e===0&&(e=this._timer[1].control&Ft.SPECIAL?0:2),this._timer[e].control=r}timerLSBw(e,r){const o=this._timer[0].control&Ft.SPECIAL,c=this._msb*256+r;this._timer[e].latch=c,o&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,r){this._msb=r}timerMSBr(e){const o=this._timer[0].control&Ft.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=o&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),o>>8&255}update(e){const r=this._timer[0].control&Ft.SPECIAL;if(this._div8+=e,r)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let o=!1;for(let c=0;c<3;c++){let h=e;if(c==2&&this._timer[2].control&Ft.SPECIAL&&(this._div8>8?(h=1,this._div8%=8):h=0),o=this._timer[c].decrement(h),o){const S=this._timer[c].control;switch(S&Ft.IRQ_ENABLE&&this.irq(c,!0),S&Ft.COUNTER_MODE){case 0:case 16:this._timer[c].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Ft.SPECIAL}irq(e,r){const o=1<<e|ns.ANY_IRQ;r?this._status|=o:this._status&=~o,this._status?(this._status|=ns.ANY_IRQ,this._interrupt(!0)):(this._status&=~ns.ANY_IRQ,this._interrupt(!1))}}let sn=2,et,Ae,os=0;const n1=t=>{if(os){const e=A.cycleCount-os;et.update(e)}os=A.cycleCount},vo=t=>{tr(sn,t)},s1=t=>{Ae&&Ae.buffer(t)},o1=(t=!0,e=2)=>{if(!t)return;sn=e,et=new r1(vo);const r={sendData:p0,interrupt:vo};Ae=new e1(r),er(sn,a1),zs(n1,sn)},i1=()=>{et&&(et.reset(),Ae.reset())},a1=(t,e=-1)=>{if(t>=49408)return-1;const r={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let o=-1;switch(t&15){case r.SDMIDIDATA:case r.ACIADATA:e>=0?Ae.data=e:o=Ae.data;break;case r.SDMIDICTRL:case r.ACIASTATCTRL:e>=0?Ae.control=e:o=Ae.status;break;case r.TCONTROL1:e>=0?et.timerControl(0,e):o=0;break;case r.TCONTROL2:e>=0?et.timerControl(1,e):o=et.status();break;case r.T1MSB:e>=0?et.timerMSBw(0,e):o=et.timerMSBr(0);break;case r.T1LSB:e>=0?et.timerLSBw(0,e):o=et.timerLSBr(0);break;case r.T2MSB:e>=0?et.timerMSBw(1,e):o=et.timerMSBr(1);break;case r.T2LSB:e>=0?et.timerLSBw(1,e):o=et.timerLSBr(1);break;case r.T3MSB:e>=0?et.timerMSBw(2,e):o=et.timerMSBr(2);break;case r.T3LSB:e>=0?et.timerLSBw(2,e):o=et.timerLSBr(2);break;case r.DRUMSET:case r.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(t&15).toString(16));break}return o},c1=(t=!0,e=4)=>{t&&(er(e,T1),zs(C1,e))},is=[0,128],as=[1,129],A1=[2,130],l1=[3,131],Ye=[4,132],Ke=[5,133],on=[6,134],cs=[7,135],hr=[8,136],fr=[9,137],u1=[10,138],As=[11,139],h1=[12,140],be=[13,141],pr=[14,142],zo=[16,145],ti=[17,145],xt=[18,146],ls=[32,160],Ht=64,le=32,f1=(t=4)=>{for(let e=0;e<=255;e++)M(t,e,0);for(let e=0;e<=1;e++)us(t,e)},p1=(t,e)=>(X(t,pr[e])&Ht)!==0,I1=(t,e)=>(X(t,xt[e])&Ht)!==0,ei=(t,e)=>(X(t,As[e])&Ht)!==0,S1=(t,e,r)=>{let o=X(t,Ye[e])-r;if(M(t,Ye[e],o),o<0){o=o%256+256,M(t,Ye[e],o);let c=X(t,Ke[e]);if(c--,M(t,Ke[e],c),c<0&&(c+=256,M(t,Ke[e],c),p1(t,e)&&(!I1(t,e)||ei(t,e)))){const h=X(t,xt[e]);M(t,xt[e],h|Ht);const S=X(t,be[e]);if(M(t,be[e],S|Ht),ue(t,e,-1),ei(t,e)){const u=X(t,cs[e]),B=X(t,on[e]);M(t,Ye[e],B),M(t,Ke[e],u)}}}},g1=(t,e)=>(X(t,pr[e])&le)!==0,E1=(t,e)=>(X(t,xt[e])&le)!==0,m1=(t,e,r)=>{if(X(t,As[e])&le)return;let o=X(t,hr[e])-r;if(M(t,hr[e],o),o<0){o=o%256+256,M(t,hr[e],o);let c=X(t,fr[e]);if(c--,M(t,fr[e],c),c<0&&(c+=256,M(t,fr[e],c),g1(t,e)&&!E1(t,e))){const h=X(t,xt[e]);M(t,xt[e],h|le);const S=X(t,be[e]);M(t,be[e],S|le),ue(t,e,-1)}}},ri=new Array(8).fill(0),C1=t=>{const e=A.cycleCount-ri[t];for(let r=0;r<=1;r++)S1(t,r,e),m1(t,r,e);ri[t]=A.cycleCount},B1=(t,e)=>{const r=[];for(let o=0;o<=15;o++)r[o]=X(t,ls[e]+o);return r},d1=(t,e)=>t.length===e.length&&t.every((r,o)=>r===e[o]),qe={slot:-1,chip:-1,params:[-1]};let us=(t,e)=>{const r=B1(t,e);t===qe.slot&&e===qe.chip&&d1(r,qe.params)||(qe.slot=t,qe.chip=e,qe.params=r,h0({slot:t,chip:e,params:r}))};const D1=(t,e)=>{switch(X(t,is[e])&7){case 0:for(let o=0;o<=15;o++)M(t,ls[e]+o,0);us(t,e);break;case 7:M(t,ti[e],X(t,as[e]));break;case 6:{const o=X(t,ti[e]),c=X(t,as[e]);o>=0&&o<=15&&(M(t,ls[e]+o,c),us(t,e));break}}},ue=(t,e,r)=>{let o=X(t,be[e]);switch(r>=0&&(o&=127-(r&127),M(t,be[e],o)),e){case 0:tr(t,o!==0);break;case 1:_a(o!==0);break}},R1=(t,e,r)=>{let o=X(t,pr[e]);r>=0&&(r=r&255,r&128?o|=r:o&=255-r),o|=128,M(t,pr[e],o)},T1=(t,e=-1)=>{if(t<49408)return-1;const r=(t&3840)>>8,o=t&255,c=o&128?1:0;switch(o){case is[c]:e>=0&&(M(r,is[c],e),D1(r,c));break;case as[c]:case A1[c]:case l1[c]:case u1[c]:case As[c]:case h1[c]:M(r,o,e);break;case Ye[c]:e>=0&&M(r,on[c],e),ue(r,c,Ht);break;case Ke[c]:if(e>=0){M(r,cs[c],e),M(r,Ye[c],X(r,on[c])),M(r,Ke[c],e);const h=X(r,xt[c]);M(r,xt[c],h&~Ht),ue(r,c,Ht)}break;case on[c]:e>=0&&(M(r,o,e),ue(r,c,Ht));break;case cs[c]:e>=0&&M(r,o,e);break;case hr[c]:e>=0&&M(r,zo[c],e),ue(r,c,le);break;case fr[c]:if(e>=0){M(r,fr[c],e),M(r,hr[c],X(r,zo[c]));const h=X(r,xt[c]);M(r,xt[c],h&~le),ue(r,c,le)}break;case be[c]:e>=0&&ue(r,c,e);break;case pr[c]:R1(r,c,e);break}return-1},an=40,k1=(t,e)=>t+2+(e>127?e-256:e),y1=(t,e,r,o)=>{let c="",h=`${W(e.pcode)}`,S="",u="";switch(e.bytes){case 1:h+="      ";break;case 2:S=W(r),h+=` ${S}   `;break;case 3:S=W(r),u=W(o),h+=` ${S} ${u}`;break}const B=mn(e.name)?W(k1(t,r),4):S;switch(e.mode){case i.IMPLIED:break;case i.IMM:c=` #$${S}`;break;case i.ZP_REL:c=` $${B}`;break;case i.ZP_X:c=` $${S},X`;break;case i.ZP_Y:c=` $${S},Y`;break;case i.ABS:c=` $${u}${S}`;break;case i.ABS_X:c=` $${u}${S},X`;break;case i.ABS_Y:c=` $${u}${S},Y`;break;case i.IND_X:c=` ($${u.trim()}${S},X)`;break;case i.IND_Y:c=` ($${S}),Y`;break;case i.IND:c=` ($${u.trim()}${S})`;break}return`${W(t,4)}: ${h}  ${e.name}${c}`},P1=t=>{let e=t;e>65535-an&&(e=65535-an);let r="";for(let o=0;o<an;o++){if(e>65535){r+=`
`;continue}const c=Fe(e),h=kt[c],S=Fe(e+1),u=Fe(e+2);r+=y1(e,h,S,u)+`
`,e+=h.bytes}return r},w1=(t,e)=>{if(e<t||t<0)return!1;let r=t;for(let o=0;o<an;o++){if(r===e)return!0;const c=Fe(r);if(r+=kt[c].bytes,r>65535)break}return!1},b1=t=>{const e=Fe(t);return kt[e].name};let We=0;const cn=192,L1=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${W(cn)}   ; jump address
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
`,M1=`
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
`,_1=()=>{const t=new Uint8Array(256).fill(0),e=vr(0,L1.split(`
`));t.set(e,0);const r=vr(0,M1.split(`
`));return t.set(r,cn),t[254]=23,t[255]=cn,t};let Ir=new Uint8Array;const hs=(t=!0)=>{Ir.length===0&&(Ir=_1()),Ir[1]=t?32:0;const r=49152+cn+7*256;Ne(7,Ir,r,x1),Ne(7,Ir,r+3,F1)},O1=(t,e)=>{if(t===0)d(e,2);else if(t<=2){d(e,240);const c=jr(t).length/512;d(e+1,c&255),d(e+2,c>>>8),d(e+3,0),nr(4),sr(0)}else rr(40),nr(0),sr(0),L()},U1=(t,e)=>{const c=jr(t).length/512,h=c>1600?2:1,S=h==2?32:64;d(e,240),d(e+1,c&255),d(e+2,c>>>8),d(e+3,0);const u="Apple2TS SP";d(e+4,u.length);let B=0;for(;B<u.length;B++)d(e+5+B,u.charCodeAt(B));for(;B<16;B++)d(e+5+B,u.charCodeAt(8));d(e+21,h),d(e+22,S),d(e+23,1),d(e+24,0),nr(25),sr(0)},N1=(t,e,r)=>{if(C(t)!==3){console.error(`Incorrect SmartPort parameter count at address ${t}`),rr(4),L();return}const o=C(t+4);switch(o){case 0:O1(e,r);break;case 1:case 2:rr(33),L();break;case 3:case 4:U1(e,r);break;default:console.error(`SmartPort statusCode ${o} not implemented`);break}},F1=()=>{rr(0),L(!1);const t=256+A.StackPtr,e=C(t+1)+256*C(t+2),r=C(e+1),o=C(e+2)+256*C(e+3),c=C(o+1),h=C(o+2)+256*C(o+3);switch(r){case 0:{N1(o,c,h);return}case 1:{if(C(o)!==3){console.error(`Incorrect SmartPort parameter count at address ${o}`),L();return}const B=512*(C(o+4)+256*C(o+5)+65536*C(o+6)),y=jr(c).slice(B,B+512);qn(h,y);break}case 2:default:console.error(`SmartPort command ${r} not implemented`),L();return}const S=zn(c);S.motorRunning=!0,We||(We=setTimeout(()=>{We=0,S&&(S.motorRunning=!1),pt()},500)),pt()},x1=()=>{rr(0),L(!1);const t=C(66),e=Math.max(Math.min(C(67)>>6,2),0),r=zn(e);if(!r.hardDrive)return;const o=jr(e),c=C(70)+256*C(71),h=512*c,S=C(68)+256*C(69),u=o.length;switch(r.status=` ${W(c,4)}`,t){case 0:{if(r.filename.length===0||u===0){nr(0),sr(0),L();return}const B=u/512;nr(B&255),sr(B>>>8);break}case 1:{if(h+512>u){L();return}const B=o.slice(h,h+512);qn(S,B);break}case 2:{if(h+512>u){L();return}if(r.isWriteProtected){L();return}const B=Kn(S);o.set(B,h),r.diskHasChanges=!0;break}case 3:console.error("Hard drive format not implemented yet"),L();return;default:console.error("unknown hard drive command"),L();return}L(!1),r.motorRunning=!0,We||(We=setTimeout(()=>{We=0,r&&(r.motorRunning=!1),pt()},500)),pt()};let ni=0,An=0,Sr=0,ln=0,Ze=Wi,he=-1,si=16.6881,fs=17030,oi=0,v=O.IDLE,Ge=0,un=!1,ut=0;const x=[],Q1=()=>{m.VBL.isSet=!0,Hc()},X1=()=>{m.VBL.isSet=!1},ii=()=>{const t={};for(const e in m)t[e]=m[e].isSet;return t},Y1=()=>{const t=JSON.parse(JSON.stringify(A));let e=jt;for(let o=jt;o<P.length;o++)P[o]!==255&&(o+=255-o%256,e=o+1);const r=ft.Buffer.from(P.slice(0,e));return{s6502:t,extraRamSize:64*(Mt+1),softSwitches:ii(),memory:r.toString("base64")}},K1=(t,e)=>{const r=JSON.parse(JSON.stringify(t.s6502));uo(r);const o=t.softSwitches;for(const h in o){const S=h;try{m[S].isSet=o[h]}catch{}}"WRITEBSR1"in o&&(m.BSR_PREWRITE.isSet=!1,m.BSR_WRITE.isSet=o.WRITEBSR1||o.WRITEBSR2||o.RDWRBSR1||o.RDWRBSR2);const c=new Uint8Array(ft.Buffer.from(t.memory,"base64"));if(e<1){P.set(c.slice(0,65536)),P.set(c.slice(131072,163584),65536),P.set(c.slice(65536,131072),jt);const h=(c.length-163584)/1024;h>0&&(xn(h+64),P.set(c.slice(163584),jt+65536))}else xn(t.extraRamSize),P.set(c);vt(),yr(!0)},q1=()=>({name:"",date:"",version:0,arrowKeysAsJoystick:!1,colorMode:0,capsLock:!1,audioEnable:!1,mockingboardMode:0,speedMode:0,helptext:"",isDebugging:!1,runMode:O.IDLE,breakpoints:At,stackDump:za()}),ps=t=>({emulator:q1(),state6502:Y1(),driveState:Pc(t),thumbnail:"",snapshots:null}),W1=()=>{const t=ps(!0);return t.snapshots=x,t},Z1=t=>{t.PC!==A.PC&&(he=t.PC),uo(t),fe()},hn=(t,e=!1)=>{var o,c;Is();const r=(o=t.emulator)!=null&&o.version?t.emulator.version:.9;K1(t.state6502,r),(c=t.emulator)!=null&&c.stackDump&&tc(t.emulator.stackDump),wc(t.driveState),he=A.PC,e&&(x.length=0,ut=0),t.snapshots&&(x.length=0,x.push(...t.snapshots),ut=x.length),fe()};let ai=!1;const ci=()=>{ai||(ai=!0,Kc(),o1(!0,2),c1(!0,4),Vc(!0,5),Tc(),hs())},G1=()=>{bc(),kn(),Jo(),i1(),Yc(),f1(4)},fn=()=>{if(Mr(0),Va(),ci(),Go.length>0){const e=vr(768,Go.split(`
`));P.set(e,768)}Is(),yr(!0),zn(1).filename===""&&(hs(!1),setTimeout(()=>{hs()},200))},Is=()=>{Oa(),ka(),C(49282),ho(),G1()},J1=t=>{Sr=t,si=[16.6881,16.6881,1][Sr],fs=[17030,17030*4,17030*4][Sr],Ii()},V1=t=>{Ze=t,fe()},H1=(t,e)=>{P[t]=e,Ze&&fe()},j1=t=>{he=t,fe(),t===O.PAUSED&&(he=A.PC)},Ai=()=>{const t=ut-1;return t<0||!x[t]?-1:t},li=()=>{const t=ut+1;return t>=x.length||!x[t]?-1:t},ui=()=>{x.length===Zi&&x.shift(),x.push(ps(!1)),ut=x.length,I0(x[x.length-1].state6502.s6502.PC),yr(!1)},$1=()=>{let t=Ai();t<0||(bt(O.PAUSED),setTimeout(()=>{ut===x.length&&(ui(),t=Math.max(ut-2,0)),ut=t,hn(x[ut])},50))},v1=()=>{const t=li();t<0||(bt(O.PAUSED),setTimeout(()=>{ut=t,hn(x[t])},50))},z1=t=>{t<0||t>=x.length||(bt(O.PAUSED),setTimeout(()=>{ut=t,hn(x[t])},50))},t0=()=>{const t=[];for(let e=0;e<x.length;e++)t[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return t},e0=t=>{x.length>0&&(x[x.length-1].thumbnail=t)};let pn=null;const hi=(t=!1)=>{pn&&clearTimeout(pn),t?pn=setTimeout(()=>{un=!0,pn=null},100):un=!0},fi=()=>{Pr(),v===O.IDLE&&(fn(),v=O.PAUSED),On(),bt(O.PAUSED)},r0=()=>{Pr(),v===O.IDLE&&(fn(),v=O.PAUSED),C(A.PC,!1)===32?(On(),pi()):fi()},pi=()=>{Pr(),v===O.IDLE&&(fn(),v=O.PAUSED),La(),bt(O.RUNNING)},Ii=()=>{Ge=0,An=performance.now(),ni=An},bt=t=>{if(ci(),v=t,v===O.PAUSED)Yo(),w1(he,A.PC)||(he=A.PC);else if(v===O.RUNNING){for(Yo(!0),Pr();x.length>0&&ut<x.length-1;)x.pop();ut=x.length}fe(),Ii(),ln===0&&(ln=1,Ei())},Si=t=>{v===O.IDLE?(bt(O.NEED_BOOT),setTimeout(()=>{bt(O.NEED_RESET),setTimeout(()=>{t()},200)},200)):t()},n0=(t,e,r)=>{Si(()=>{qn(t,e),r&&_t(t)})},s0=t=>{Si(()=>{Ws(t)})},o0=()=>Ze&&v===O.PAUSED?va():new Uint8Array,i0=()=>v===O.RUNNING?"":P1(he>=0?he:A.PC),a0=()=>Ze&&v!==O.IDLE?ec():"",fe=()=>{const t={addressGetTable:rt,altChar:m.ALTCHARSET.isSet,arrowKeysAsJoystick:!1,breakpoints:At,button0:m.PB0.isSet,button1:m.PB1.isSet,canGoBackward:Ai()>=0,canGoForward:li()>=0,capsLock:!0,c800Slot:Nn(),colorMode:Bs.COLOR,cout:C(57)<<8|C(56),cpuSpeed:ln,darkMode:!1,disassembly:i0(),extraRamSize:64*(Mt+1),helpText:"",hires:$a(),iTempState:ut,isDebugging:Ze,lores:Yn(!0),memoryDump:o0(),nextInstruction:b1(A.PC),noDelayMode:!m.COLUMN80.isSet&&!m.AN3.isSet,ramWorksBank:de(),runMode:v,s6502:A,softSwitches:ii(),speedMode:Sr,stackString:a0(),textPage:Yn(),timeTravelThumbnails:t0(),useOpenAppleKey:!1};A0(t)},c0=t=>{if(t)for(let e=0;e<t.length;e++)ya(t[e]);else Pa();fe()},gi=()=>{const t=performance.now();if(oi=t-An,oi<si||(An=t,v===O.IDLE||v===O.PAUSED))return;v===O.NEED_BOOT?(fn(),bt(O.RUNNING)):v===O.NEED_RESET&&(Is(),bt(O.RUNNING));let e=0;for(;;){const o=On();if(o<0)break;if(e+=o,e%17030>=12480&&(m.VBL.isSet||Q1()),e>=fs){X1();break}}Ge++;const r=Ge*fs/(performance.now()-ni);ln=r<1e4?Math.round(r/10)/100:Math.round(r/100)/10,Ge%2&&(ea(),fe()),un&&(un=!1,ui())},Ei=()=>{gi();const t=Ge+[1,5,10][Sr];for(;v===O.RUNNING&&Ge!==t;)gi();setTimeout(Ei,v===O.RUNNING?0:20)},gt=(t,e)=>{self.postMessage({msg:t,payload:e})},A0=t=>{gt(ct.MACHINE_STATE,t)},l0=t=>{gt(ct.CLICK,t)},u0=t=>{gt(ct.DRIVE_PROPS,t)},Je=t=>{gt(ct.DRIVE_SOUND,t)},mi=t=>{gt(ct.SAVE_STATE,t)},In=t=>{gt(ct.RUMBLE,t)},Ci=t=>{gt(ct.HELP_TEXT,t)},Bi=t=>{gt(ct.ENHANCED_MIDI,t)},di=t=>{gt(ct.SHOW_MOUSE,t)},h0=t=>{gt(ct.MBOARD_SOUND,t)},f0=t=>{gt(ct.COMM_DATA,t)},p0=t=>{gt(ct.MIDI_DATA,t)},I0=t=>{gt(ct.REQUEST_THUMBNAIL,t)};typeof self<"u"&&(self.onmessage=t=>{if("msg"in t.data)switch(t.data.msg){case N.RUN_MODE:bt(t.data.payload);break;case N.STATE6502:Z1(t.data.payload);break;case N.DEBUG:V1(t.data.payload);break;case N.DISASSEMBLE_ADDR:j1(t.data.payload);break;case N.BREAKPOINTS:Ma(t.data.payload);break;case N.STEP_INTO:fi();break;case N.STEP_OVER:r0();break;case N.STEP_OUT:pi();break;case N.SPEED:J1(t.data.payload);break;case N.TIME_TRAVEL_STEP:t.data.payload==="FORWARD"?v1():$1();break;case N.TIME_TRAVEL_INDEX:z1(t.data.payload);break;case N.TIME_TRAVEL_SNAPSHOT:hi();break;case N.THUMBNAIL_IMAGE:e0(t.data.payload);break;case N.RESTORE_STATE:hn(t.data.payload,!0);break;case N.KEYPRESS:Da(t.data.payload);break;case N.MOUSEEVENT:jc(t.data.payload);break;case N.PASTE_TEXT:s0(t.data.payload),Ws(t.data.payload);break;case N.APPLE_PRESS:Os(!0,t.data.payload);break;case N.APPLE_RELEASE:Os(!1,t.data.payload);break;case N.GET_SAVE_STATE:mi(ps(!0));break;case N.GET_SAVE_STATE_SNAPSHOTS:mi(W1());break;case N.DRIVE_PROPS:{const e=t.data.payload;Mc(e);break}case N.DRIVE_NEW_DATA:{const e=t.data.payload;Lc(e);break}case N.GAMEPAD:zi(t.data.payload);break;case N.SET_BINARY_BLOCK:{const e=t.data.payload;n0(e.address,e.data,e.run);break}case N.SET_MEMORY:{const e=t.data.payload;H1(e.address,e.value);break}case N.COMM_DATA:Xc(t.data.payload);break;case N.MIDI_DATA:s1(t.data.payload);break;case N.RamWorks:xn(t.data.payload);break;case N.SOFTSWITCHES:c0(t.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(t.data)}`);break}})})();
