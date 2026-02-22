(function(){"use strict";var yr={},Je={},Uo;function oi(){if(Uo)return Je;Uo=1,Je.byteLength=u,Je.toByteArray=T,Je.fromByteArray=x;for(var A=[],e=[],t=typeof Uint8Array<"u"?Uint8Array:Array,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,I=n.length;i<I;++i)A[i]=n[i],e[n.charCodeAt(i)]=i;e[45]=62,e[95]=63;function C(w){var U=w.length;if(U%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var J=w.indexOf("=");J===-1&&(J=U);var hA=J===U?0:4-J%4;return[J,hA]}function u(w){var U=C(w),J=U[0],hA=U[1];return(J+hA)*3/4-hA}function D(w,U,J){return(U+J)*3/4-J}function T(w){var U,J=C(w),hA=J[0],SA=J[1],iA=new t(D(w,hA,SA)),DA=0,Qe=SA>0?hA-4:hA,rA;for(rA=0;rA<Qe;rA+=4)U=e[w.charCodeAt(rA)]<<18|e[w.charCodeAt(rA+1)]<<12|e[w.charCodeAt(rA+2)]<<6|e[w.charCodeAt(rA+3)],iA[DA++]=U>>16&255,iA[DA++]=U>>8&255,iA[DA++]=U&255;return SA===2&&(U=e[w.charCodeAt(rA)]<<2|e[w.charCodeAt(rA+1)]>>4,iA[DA++]=U&255),SA===1&&(U=e[w.charCodeAt(rA)]<<10|e[w.charCodeAt(rA+1)]<<4|e[w.charCodeAt(rA+2)]>>2,iA[DA++]=U>>8&255,iA[DA++]=U&255),iA}function d(w){return A[w>>18&63]+A[w>>12&63]+A[w>>6&63]+A[w&63]}function G(w,U,J){for(var hA,SA=[],iA=U;iA<J;iA+=3)hA=(w[iA]<<16&16711680)+(w[iA+1]<<8&65280)+(w[iA+2]&255),SA.push(d(hA));return SA.join("")}function x(w){for(var U,J=w.length,hA=J%3,SA=[],iA=16383,DA=0,Qe=J-hA;DA<Qe;DA+=iA)SA.push(G(w,DA,DA+iA>Qe?Qe:DA+iA));return hA===1?(U=w[J-1],SA.push(A[U>>2]+A[U<<4&63]+"==")):hA===2&&(U=(w[J-2]<<8)+w[J-1],SA.push(A[U>>10]+A[U>>4&63]+A[U<<2&63]+"=")),SA.join("")}return Je}var Dt={};var Yo;function ni(){return Yo||(Yo=1,Dt.read=function(A,e,t,n,i){var I,C,u=i*8-n-1,D=(1<<u)-1,T=D>>1,d=-7,G=t?i-1:0,x=t?-1:1,w=A[e+G];for(G+=x,I=w&(1<<-d)-1,w>>=-d,d+=u;d>0;I=I*256+A[e+G],G+=x,d-=8);for(C=I&(1<<-d)-1,I>>=-d,d+=n;d>0;C=C*256+A[e+G],G+=x,d-=8);if(I===0)I=1-T;else{if(I===D)return C?NaN:(w?-1:1)*(1/0);C=C+Math.pow(2,n),I=I-T}return(w?-1:1)*C*Math.pow(2,I-n)},Dt.write=function(A,e,t,n,i,I){var C,u,D,T=I*8-i-1,d=(1<<T)-1,G=d>>1,x=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=n?0:I-1,U=n?1:-1,J=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(u=isNaN(e)?1:0,C=d):(C=Math.floor(Math.log(e)/Math.LN2),e*(D=Math.pow(2,-C))<1&&(C--,D*=2),C+G>=1?e+=x/D:e+=x*Math.pow(2,1-G),e*D>=2&&(C++,D/=2),C+G>=d?(u=0,C=d):C+G>=1?(u=(e*D-1)*Math.pow(2,i),C=C+G):(u=e*Math.pow(2,G-1)*Math.pow(2,i),C=0));i>=8;A[t+w]=u&255,w+=U,u/=256,i-=8);for(C=C<<i|u,T+=i;T>0;A[t+w]=C&255,w+=U,C/=256,T-=8);A[t+w-U]|=J*128}),Dt}var Oo;function si(){return Oo||(Oo=1,(function(A){const e=oi(),t=ni(),n=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;A.Buffer=u,A.SlowBuffer=iA,A.INSPECT_MAX_BYTES=50;const i=2147483647;A.kMaxLength=i,u.TYPED_ARRAY_SUPPORT=I(),!u.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function I(){try{const a=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(a,r),a.foo()===42}catch{return!1}}Object.defineProperty(u.prototype,"parent",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.buffer}}),Object.defineProperty(u.prototype,"offset",{enumerable:!0,get:function(){if(u.isBuffer(this))return this.byteOffset}});function C(a){if(a>i)throw new RangeError('The value "'+a+'" is invalid for option "size"');const r=new Uint8Array(a);return Object.setPrototypeOf(r,u.prototype),r}function u(a,r,o){if(typeof a=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return G(a)}return D(a,r,o)}u.poolSize=8192;function D(a,r,o){if(typeof a=="string")return x(a,r);if(ArrayBuffer.isView(a))return U(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(GA(a,ArrayBuffer)||a&&GA(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(GA(a,SharedArrayBuffer)||a&&GA(a.buffer,SharedArrayBuffer)))return J(a,r,o);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const l=a.valueOf&&a.valueOf();if(l!=null&&l!==a)return u.from(l,r,o);const g=hA(a);if(g)return g;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return u.from(a[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}u.from=function(a,r,o){return D(a,r,o)},Object.setPrototypeOf(u.prototype,Uint8Array.prototype),Object.setPrototypeOf(u,Uint8Array);function T(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function d(a,r,o){return T(a),a<=0?C(a):r!==void 0?typeof o=="string"?C(a).fill(r,o):C(a).fill(r):C(a)}u.alloc=function(a,r,o){return d(a,r,o)};function G(a){return T(a),C(a<0?0:SA(a)|0)}u.allocUnsafe=function(a){return G(a)},u.allocUnsafeSlow=function(a){return G(a)};function x(a,r){if((typeof r!="string"||r==="")&&(r="utf8"),!u.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=DA(a,r)|0;let l=C(o);const g=l.write(a,r);return g!==o&&(l=l.slice(0,g)),l}function w(a){const r=a.length<0?0:SA(a.length)|0,o=C(r);for(let l=0;l<r;l+=1)o[l]=a[l]&255;return o}function U(a){if(GA(a,Uint8Array)){const r=new Uint8Array(a);return J(r.buffer,r.byteOffset,r.byteLength)}return w(a)}function J(a,r,o){if(r<0||a.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let l;return r===void 0&&o===void 0?l=new Uint8Array(a):o===void 0?l=new Uint8Array(a,r):l=new Uint8Array(a,r,o),Object.setPrototypeOf(l,u.prototype),l}function hA(a){if(u.isBuffer(a)){const r=SA(a.length)|0,o=C(r);return o.length===0||a.copy(o,0,0,r),o}if(a.length!==void 0)return typeof a.length!="number"||Ko(a.length)?C(0):w(a);if(a.type==="Buffer"&&Array.isArray(a.data))return w(a.data)}function SA(a){if(a>=i)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i.toString(16)+" bytes");return a|0}function iA(a){return+a!=a&&(a=0),u.alloc(+a)}u.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==u.prototype},u.compare=function(r,o){if(GA(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),GA(o,Uint8Array)&&(o=u.from(o,o.offset,o.byteLength)),!u.isBuffer(r)||!u.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let l=r.length,g=o.length;for(let S=0,E=Math.min(l,g);S<E;++S)if(r[S]!==o[S]){l=r[S],g=o[S];break}return l<g?-1:g<l?1:0},u.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return u.alloc(0);let l;if(o===void 0)for(o=0,l=0;l<r.length;++l)o+=r[l].length;const g=u.allocUnsafe(o);let S=0;for(l=0;l<r.length;++l){let E=r[l];if(GA(E,Uint8Array))S+E.length>g.length?(u.isBuffer(E)||(E=u.from(E)),E.copy(g,S)):Uint8Array.prototype.set.call(g,E,S);else if(u.isBuffer(E))E.copy(g,S);else throw new TypeError('"list" argument must be an Array of Buffers');S+=E.length}return g};function DA(a,r){if(u.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||GA(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const o=a.length,l=arguments.length>2&&arguments[2]===!0;if(!l&&o===0)return 0;let g=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return qo(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return ri(a).length;default:if(g)return l?-1:qo(a).length;r=(""+r).toLowerCase(),g=!0}}u.byteLength=DA;function Qe(a,r,o){let l=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(a||(a="utf8");;)switch(a){case"hex":return B1(this,r,o);case"utf8":case"utf-8":return Js(this,r,o);case"ascii":return f1(this,r,o);case"latin1":case"binary":return E1(this,r,o);case"base64":return C1(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return D1(this,r,o);default:if(l)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),l=!0}}u.prototype._isBuffer=!0;function rA(a,r,o){const l=a[r];a[r]=a[o],a[o]=l}u.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)rA(this,o,o+1);return this},u.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)rA(this,o,o+3),rA(this,o+1,o+2);return this},u.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)rA(this,o,o+7),rA(this,o+1,o+6),rA(this,o+2,o+5),rA(this,o+3,o+4);return this},u.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?Js(this,0,r):Qe.apply(this,arguments)},u.prototype.toLocaleString=u.prototype.toString,u.prototype.equals=function(r){if(!u.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:u.compare(this,r)===0},u.prototype.inspect=function(){let r="";const o=A.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},n&&(u.prototype[n]=u.prototype.inspect),u.prototype.compare=function(r,o,l,g,S){if(GA(r,Uint8Array)&&(r=u.from(r,r.offset,r.byteLength)),!u.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),l===void 0&&(l=r?r.length:0),g===void 0&&(g=0),S===void 0&&(S=this.length),o<0||l>r.length||g<0||S>this.length)throw new RangeError("out of range index");if(g>=S&&o>=l)return 0;if(g>=S)return-1;if(o>=l)return 1;if(o>>>=0,l>>>=0,g>>>=0,S>>>=0,this===r)return 0;let E=S-g,F=l-o;const $=Math.min(E,F),v=this.slice(g,S),AA=r.slice(o,l);for(let j=0;j<$;++j)if(v[j]!==AA[j]){E=v[j],F=AA[j];break}return E<F?-1:F<E?1:0};function _s(a,r,o,l,g){if(a.length===0)return-1;if(typeof o=="string"?(l=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,Ko(o)&&(o=g?0:a.length-1),o<0&&(o=a.length+o),o>=a.length){if(g)return-1;o=a.length-1}else if(o<0)if(g)o=0;else return-1;if(typeof r=="string"&&(r=u.from(r,l)),u.isBuffer(r))return r.length===0?-1:Vs(a,r,o,l,g);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?g?Uint8Array.prototype.indexOf.call(a,r,o):Uint8Array.prototype.lastIndexOf.call(a,r,o):Vs(a,[r],o,l,g);throw new TypeError("val must be string, number or Buffer")}function Vs(a,r,o,l,g){let S=1,E=a.length,F=r.length;if(l!==void 0&&(l=String(l).toLowerCase(),l==="ucs2"||l==="ucs-2"||l==="utf16le"||l==="utf-16le")){if(a.length<2||r.length<2)return-1;S=2,E/=2,F/=2,o/=2}function $(AA,j){return S===1?AA[j]:AA.readUInt16BE(j*S)}let v;if(g){let AA=-1;for(v=o;v<E;v++)if($(a,v)===$(r,AA===-1?0:v-AA)){if(AA===-1&&(AA=v),v-AA+1===F)return AA*S}else AA!==-1&&(v-=v-AA),AA=-1}else for(o+F>E&&(o=E-F),v=o;v>=0;v--){let AA=!0;for(let j=0;j<F;j++)if($(a,v+j)!==$(r,j)){AA=!1;break}if(AA)return v}return-1}u.prototype.includes=function(r,o,l){return this.indexOf(r,o,l)!==-1},u.prototype.indexOf=function(r,o,l){return _s(this,r,o,l,!0)},u.prototype.lastIndexOf=function(r,o,l){return _s(this,r,o,l,!1)};function u1(a,r,o,l){o=Number(o)||0;const g=a.length-o;l?(l=Number(l),l>g&&(l=g)):l=g;const S=r.length;l>S/2&&(l=S/2);let E;for(E=0;E<l;++E){const F=parseInt(r.substr(E*2,2),16);if(Ko(F))return E;a[o+E]=F}return E}function I1(a,r,o,l){return Tr(qo(r,a.length-o),a,o,l)}function h1(a,r,o,l){return Tr(d1(r),a,o,l)}function g1(a,r,o,l){return Tr(ri(r),a,o,l)}function p1(a,r,o,l){return Tr(T1(r,a.length-o),a,o,l)}u.prototype.write=function(r,o,l,g){if(o===void 0)g="utf8",l=this.length,o=0;else if(l===void 0&&typeof o=="string")g=o,l=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(l)?(l=l>>>0,g===void 0&&(g="utf8")):(g=l,l=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const S=this.length-o;if((l===void 0||l>S)&&(l=S),r.length>0&&(l<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");g||(g="utf8");let E=!1;for(;;)switch(g){case"hex":return u1(this,r,o,l);case"utf8":case"utf-8":return I1(this,r,o,l);case"ascii":case"latin1":case"binary":return h1(this,r,o,l);case"base64":return g1(this,r,o,l);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return p1(this,r,o,l);default:if(E)throw new TypeError("Unknown encoding: "+g);g=(""+g).toLowerCase(),E=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function C1(a,r,o){return r===0&&o===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(r,o))}function Js(a,r,o){o=Math.min(a.length,o);const l=[];let g=r;for(;g<o;){const S=a[g];let E=null,F=S>239?4:S>223?3:S>191?2:1;if(g+F<=o){let $,v,AA,j;switch(F){case 1:S<128&&(E=S);break;case 2:$=a[g+1],($&192)===128&&(j=(S&31)<<6|$&63,j>127&&(E=j));break;case 3:$=a[g+1],v=a[g+2],($&192)===128&&(v&192)===128&&(j=(S&15)<<12|($&63)<<6|v&63,j>2047&&(j<55296||j>57343)&&(E=j));break;case 4:$=a[g+1],v=a[g+2],AA=a[g+3],($&192)===128&&(v&192)===128&&(AA&192)===128&&(j=(S&15)<<18|($&63)<<12|(v&63)<<6|AA&63,j>65535&&j<1114112&&(E=j))}}E===null?(E=65533,F=1):E>65535&&(E-=65536,l.push(E>>>10&1023|55296),E=56320|E&1023),l.push(E),g+=F}return S1(l)}const js=4096;function S1(a){const r=a.length;if(r<=js)return String.fromCharCode.apply(String,a);let o="",l=0;for(;l<r;)o+=String.fromCharCode.apply(String,a.slice(l,l+=js));return o}function f1(a,r,o){let l="";o=Math.min(a.length,o);for(let g=r;g<o;++g)l+=String.fromCharCode(a[g]&127);return l}function E1(a,r,o){let l="";o=Math.min(a.length,o);for(let g=r;g<o;++g)l+=String.fromCharCode(a[g]);return l}function B1(a,r,o){const l=a.length;(!r||r<0)&&(r=0),(!o||o<0||o>l)&&(o=l);let g="";for(let S=r;S<o;++S)g+=y1[a[S]];return g}function D1(a,r,o){const l=a.slice(r,o);let g="";for(let S=0;S<l.length-1;S+=2)g+=String.fromCharCode(l[S]+l[S+1]*256);return g}u.prototype.slice=function(r,o){const l=this.length;r=~~r,o=o===void 0?l:~~o,r<0?(r+=l,r<0&&(r=0)):r>l&&(r=l),o<0?(o+=l,o<0&&(o=0)):o>l&&(o=l),o<r&&(o=r);const g=this.subarray(r,o);return Object.setPrototypeOf(g,u.prototype),g};function uA(a,r,o){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+r>o)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUintLE=u.prototype.readUIntLE=function(r,o,l){r=r>>>0,o=o>>>0,l||uA(r,o,this.length);let g=this[r],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[r+E]*S;return g},u.prototype.readUintBE=u.prototype.readUIntBE=function(r,o,l){r=r>>>0,o=o>>>0,l||uA(r,o,this.length);let g=this[r+--o],S=1;for(;o>0&&(S*=256);)g+=this[r+--o]*S;return g},u.prototype.readUint8=u.prototype.readUInt8=function(r,o){return r=r>>>0,o||uA(r,1,this.length),this[r]},u.prototype.readUint16LE=u.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||uA(r,2,this.length),this[r]|this[r+1]<<8},u.prototype.readUint16BE=u.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||uA(r,2,this.length),this[r]<<8|this[r+1]},u.prototype.readUint32LE=u.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},u.prototype.readUint32BE=u.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},u.prototype.readBigUInt64LE=he(function(r){r=r>>>0,Ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&Bt(r,this.length-8);const g=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,S=this[++r]+this[++r]*2**8+this[++r]*2**16+l*2**24;return BigInt(g)+(BigInt(S)<<BigInt(32))}),u.prototype.readBigUInt64BE=he(function(r){r=r>>>0,Ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&Bt(r,this.length-8);const g=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],S=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+l;return(BigInt(g)<<BigInt(32))+BigInt(S)}),u.prototype.readIntLE=function(r,o,l){r=r>>>0,o=o>>>0,l||uA(r,o,this.length);let g=this[r],S=1,E=0;for(;++E<o&&(S*=256);)g+=this[r+E]*S;return S*=128,g>=S&&(g-=Math.pow(2,8*o)),g},u.prototype.readIntBE=function(r,o,l){r=r>>>0,o=o>>>0,l||uA(r,o,this.length);let g=o,S=1,E=this[r+--g];for(;g>0&&(S*=256);)E+=this[r+--g]*S;return S*=128,E>=S&&(E-=Math.pow(2,8*o)),E},u.prototype.readInt8=function(r,o){return r=r>>>0,o||uA(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},u.prototype.readInt16LE=function(r,o){r=r>>>0,o||uA(r,2,this.length);const l=this[r]|this[r+1]<<8;return l&32768?l|4294901760:l},u.prototype.readInt16BE=function(r,o){r=r>>>0,o||uA(r,2,this.length);const l=this[r+1]|this[r]<<8;return l&32768?l|4294901760:l},u.prototype.readInt32LE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},u.prototype.readInt32BE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},u.prototype.readBigInt64LE=he(function(r){r=r>>>0,Ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&Bt(r,this.length-8);const g=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(l<<24);return(BigInt(g)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),u.prototype.readBigInt64BE=he(function(r){r=r>>>0,Ve(r,"offset");const o=this[r],l=this[r+7];(o===void 0||l===void 0)&&Bt(r,this.length-8);const g=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(g)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+l)}),u.prototype.readFloatLE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),t.read(this,r,!0,23,4)},u.prototype.readFloatBE=function(r,o){return r=r>>>0,o||uA(r,4,this.length),t.read(this,r,!1,23,4)},u.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||uA(r,8,this.length),t.read(this,r,!0,52,8)},u.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||uA(r,8,this.length),t.read(this,r,!1,52,8)};function dA(a,r,o,l,g,S){if(!u.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>g||r<S)throw new RangeError('"value" argument is out of bounds');if(o+l>a.length)throw new RangeError("Index out of range")}u.prototype.writeUintLE=u.prototype.writeUIntLE=function(r,o,l,g){if(r=+r,o=o>>>0,l=l>>>0,!g){const F=Math.pow(2,8*l)-1;dA(this,r,o,l,F,0)}let S=1,E=0;for(this[o]=r&255;++E<l&&(S*=256);)this[o+E]=r/S&255;return o+l},u.prototype.writeUintBE=u.prototype.writeUIntBE=function(r,o,l,g){if(r=+r,o=o>>>0,l=l>>>0,!g){const F=Math.pow(2,8*l)-1;dA(this,r,o,l,F,0)}let S=l-1,E=1;for(this[o+S]=r&255;--S>=0&&(E*=256);)this[o+S]=r/E&255;return o+l},u.prototype.writeUint8=u.prototype.writeUInt8=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,1,255,0),this[o]=r&255,o+1},u.prototype.writeUint16LE=u.prototype.writeUInt16LE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeUint16BE=u.prototype.writeUInt16BE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeUint32LE=u.prototype.writeUInt32LE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},u.prototype.writeUint32BE=u.prototype.writeUInt32BE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function Hs(a,r,o,l,g){ti(r,l,g,a,o,7);let S=Number(r&BigInt(4294967295));a[o++]=S,S=S>>8,a[o++]=S,S=S>>8,a[o++]=S,S=S>>8,a[o++]=S;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,o}function vs(a,r,o,l,g){ti(r,l,g,a,o,7);let S=Number(r&BigInt(4294967295));a[o+7]=S,S=S>>8,a[o+6]=S,S=S>>8,a[o+5]=S,S=S>>8,a[o+4]=S;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o+3]=E,E=E>>8,a[o+2]=E,E=E>>8,a[o+1]=E,E=E>>8,a[o]=E,o+8}u.prototype.writeBigUInt64LE=he(function(r,o=0){return Hs(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeBigUInt64BE=he(function(r,o=0){return vs(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),u.prototype.writeIntLE=function(r,o,l,g){if(r=+r,o=o>>>0,!g){const $=Math.pow(2,8*l-1);dA(this,r,o,l,$-1,-$)}let S=0,E=1,F=0;for(this[o]=r&255;++S<l&&(E*=256);)r<0&&F===0&&this[o+S-1]!==0&&(F=1),this[o+S]=(r/E>>0)-F&255;return o+l},u.prototype.writeIntBE=function(r,o,l,g){if(r=+r,o=o>>>0,!g){const $=Math.pow(2,8*l-1);dA(this,r,o,l,$-1,-$)}let S=l-1,E=1,F=0;for(this[o+S]=r&255;--S>=0&&(E*=256);)r<0&&F===0&&this[o+S+1]!==0&&(F=1),this[o+S]=(r/E>>0)-F&255;return o+l},u.prototype.writeInt8=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},u.prototype.writeInt16LE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},u.prototype.writeInt16BE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},u.prototype.writeInt32LE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},u.prototype.writeInt32BE=function(r,o,l){return r=+r,o=o>>>0,l||dA(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},u.prototype.writeBigInt64LE=he(function(r,o=0){return Hs(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),u.prototype.writeBigInt64BE=he(function(r,o=0){return vs(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function zs(a,r,o,l,g,S){if(o+l>a.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function $s(a,r,o,l,g){return r=+r,o=o>>>0,g||zs(a,r,o,4),t.write(a,r,o,l,23,4),o+4}u.prototype.writeFloatLE=function(r,o,l){return $s(this,r,o,!0,l)},u.prototype.writeFloatBE=function(r,o,l){return $s(this,r,o,!1,l)};function Ai(a,r,o,l,g){return r=+r,o=o>>>0,g||zs(a,r,o,8),t.write(a,r,o,l,52,8),o+8}u.prototype.writeDoubleLE=function(r,o,l){return Ai(this,r,o,!0,l)},u.prototype.writeDoubleBE=function(r,o,l){return Ai(this,r,o,!1,l)},u.prototype.copy=function(r,o,l,g){if(!u.isBuffer(r))throw new TypeError("argument should be a Buffer");if(l||(l=0),!g&&g!==0&&(g=this.length),o>=r.length&&(o=r.length),o||(o=0),g>0&&g<l&&(g=l),g===l||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(l<0||l>=this.length)throw new RangeError("Index out of range");if(g<0)throw new RangeError("sourceEnd out of bounds");g>this.length&&(g=this.length),r.length-o<g-l&&(g=r.length-o+l);const S=g-l;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,l,g):Uint8Array.prototype.set.call(r,this.subarray(l,g),o),S},u.prototype.fill=function(r,o,l,g){if(typeof r=="string"){if(typeof o=="string"?(g=o,o=0,l=this.length):typeof l=="string"&&(g=l,l=this.length),g!==void 0&&typeof g!="string")throw new TypeError("encoding must be a string");if(typeof g=="string"&&!u.isEncoding(g))throw new TypeError("Unknown encoding: "+g);if(r.length===1){const E=r.charCodeAt(0);(g==="utf8"&&E<128||g==="latin1")&&(r=E)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<l)throw new RangeError("Out of range index");if(l<=o)return this;o=o>>>0,l=l===void 0?this.length:l>>>0,r||(r=0);let S;if(typeof r=="number")for(S=o;S<l;++S)this[S]=r;else{const E=u.isBuffer(r)?r:u.from(r,g),F=E.length;if(F===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(S=0;S<l-o;++S)this[S+o]=E[S%F]}return this};const _e={};function bo(a,r,o){_e[a]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(g){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:g,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}bo("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),bo("ERR_INVALID_ARG_TYPE",function(a,r){return`The "${a}" argument must be of type number. Received type ${typeof r}`},TypeError),bo("ERR_OUT_OF_RANGE",function(a,r,o){let l=`The value of "${a}" is out of range.`,g=o;return Number.isInteger(o)&&Math.abs(o)>2**32?g=ei(String(o)):typeof o=="bigint"&&(g=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(g=ei(g)),g+="n"),l+=` It must be ${r}. Received ${g}`,l},RangeError);function ei(a){let r="",o=a.length;const l=a[0]==="-"?1:0;for(;o>=l+4;o-=3)r=`_${a.slice(o-3,o)}${r}`;return`${a.slice(0,o)}${r}`}function m1(a,r,o){Ve(r,"offset"),(a[r]===void 0||a[r+o]===void 0)&&Bt(r,a.length-(o+1))}function ti(a,r,o,l,g,S){if(a>o||a<r){const E=typeof r=="bigint"?"n":"";let F;throw r===0||r===BigInt(0)?F=`>= 0${E} and < 2${E} ** ${(S+1)*8}${E}`:F=`>= -(2${E} ** ${(S+1)*8-1}${E}) and < 2 ** ${(S+1)*8-1}${E}`,new _e.ERR_OUT_OF_RANGE("value",F,a)}m1(l,g,S)}function Ve(a,r){if(typeof a!="number")throw new _e.ERR_INVALID_ARG_TYPE(r,"number",a)}function Bt(a,r,o){throw Math.floor(a)!==a?(Ve(a,o),new _e.ERR_OUT_OF_RANGE("offset","an integer",a)):r<0?new _e.ERR_BUFFER_OUT_OF_BOUNDS:new _e.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${r}`,a)}const k1=/[^+/0-9A-Za-z-_]/g;function w1(a){if(a=a.split("=")[0],a=a.trim().replace(k1,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function qo(a,r){r=r||1/0;let o;const l=a.length;let g=null;const S=[];for(let E=0;E<l;++E){if(o=a.charCodeAt(E),o>55295&&o<57344){if(!g){if(o>56319){(r-=3)>-1&&S.push(239,191,189);continue}else if(E+1===l){(r-=3)>-1&&S.push(239,191,189);continue}g=o;continue}if(o<56320){(r-=3)>-1&&S.push(239,191,189),g=o;continue}o=(g-55296<<10|o-56320)+65536}else g&&(r-=3)>-1&&S.push(239,191,189);if(g=null,o<128){if((r-=1)<0)break;S.push(o)}else if(o<2048){if((r-=2)<0)break;S.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;S.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;S.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return S}function d1(a){const r=[];for(let o=0;o<a.length;++o)r.push(a.charCodeAt(o)&255);return r}function T1(a,r){let o,l,g;const S=[];for(let E=0;E<a.length&&!((r-=2)<0);++E)o=a.charCodeAt(E),l=o>>8,g=o%256,S.push(g),S.push(l);return S}function ri(a){return e.toByteArray(w1(a))}function Tr(a,r,o,l){let g;for(g=0;g<l&&!(g+o>=r.length||g>=a.length);++g)r[g+o]=a[g];return g}function GA(a,r){return a instanceof r||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===r.name}function Ko(a){return a!==a}const y1=(function(){const a="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const l=o*16;for(let g=0;g<16;++g)r[l+g]=a[o]+a[g]}return r})();function he(a){return typeof BigInt>"u"?R1:a}function R1(){throw new Error("BigInt not supported")}})(yr)),yr}var Fe=si();const ii=!1,ai=30,ci=".2mg,.hdv,.po,.2meg",je=256,Le=383,He=256*je,ZA=256*Le;var W=(A=>(A[A.IDLE=0]="IDLE",A[A.RUNNING=-1]="RUNNING",A[A.PAUSED=-2]="PAUSED",A[A.NEED_BOOT=-3]="NEED_BOOT",A[A.NEED_RESET=-4]="NEED_RESET",A))(W||{}),gA=(A=>(A[A.MACHINE_STATE=0]="MACHINE_STATE",A[A.CLICK=1]="CLICK",A[A.DRIVE_PROPS=2]="DRIVE_PROPS",A[A.DRIVE_SOUND=3]="DRIVE_SOUND",A[A.SAVE_STATE=4]="SAVE_STATE",A[A.RUMBLE=5]="RUMBLE",A[A.HELP_TEXT=6]="HELP_TEXT",A[A.SHOW_APPLE_MOUSE=7]="SHOW_APPLE_MOUSE",A[A.MBOARD_SOUND=8]="MBOARD_SOUND",A[A.COMM_DATA=9]="COMM_DATA",A[A.MIDI_DATA=10]="MIDI_DATA",A[A.ENHANCED_MIDI=11]="ENHANCED_MIDI",A[A.REQUEST_THUMBNAIL=12]="REQUEST_THUMBNAIL",A[A.SOFTSWITCH_DESCRIPTIONS=13]="SOFTSWITCH_DESCRIPTIONS",A[A.INSTRUCTIONS=14]="INSTRUCTIONS",A))(gA||{}),L=(A=>(A[A.RUN_MODE=0]="RUN_MODE",A[A.STATE6502=1]="STATE6502",A[A.DEBUG=2]="DEBUG",A[A.APP_MODE=3]="APP_MODE",A[A.SHOW_DEBUG_TAB=4]="SHOW_DEBUG_TAB",A[A.BREAKPOINTS=5]="BREAKPOINTS",A[A.STEP_INTO=6]="STEP_INTO",A[A.STEP_OVER=7]="STEP_OVER",A[A.STEP_OUT=8]="STEP_OUT",A[A.BASIC_STEP=9]="BASIC_STEP",A[A.SPEED=10]="SPEED",A[A.TIME_TRAVEL_STEP=11]="TIME_TRAVEL_STEP",A[A.TIME_TRAVEL_INDEX=12]="TIME_TRAVEL_INDEX",A[A.TIME_TRAVEL_SNAPSHOT=13]="TIME_TRAVEL_SNAPSHOT",A[A.THUMBNAIL_IMAGE=14]="THUMBNAIL_IMAGE",A[A.RESTORE_STATE=15]="RESTORE_STATE",A[A.KEYPRESS=16]="KEYPRESS",A[A.KEYRELEASE=17]="KEYRELEASE",A[A.MOUSEEVENT=18]="MOUSEEVENT",A[A.PASTE_TEXT=19]="PASTE_TEXT",A[A.APPLE_PRESS=20]="APPLE_PRESS",A[A.APPLE_RELEASE=21]="APPLE_RELEASE",A[A.GET_SAVE_STATE=22]="GET_SAVE_STATE",A[A.GET_SAVE_STATE_SNAPSHOTS=23]="GET_SAVE_STATE_SNAPSHOTS",A[A.DRIVE_PROPS=24]="DRIVE_PROPS",A[A.DRIVE_NEW_DATA=25]="DRIVE_NEW_DATA",A[A.GAMEPAD=26]="GAMEPAD",A[A.SET_BINARY_BLOCK=27]="SET_BINARY_BLOCK",A[A.SET_CYCLECOUNT=28]="SET_CYCLECOUNT",A[A.SET_MEMORY=29]="SET_MEMORY",A[A.COMM_DATA=30]="COMM_DATA",A[A.MIDI_DATA=31]="MIDI_DATA",A[A.RAMWORKS=32]="RAMWORKS",A[A.MACHINE_NAME=33]="MACHINE_NAME",A[A.SOFTSWITCHES=34]="SOFTSWITCHES",A))(L||{}),ge=(A=>(A[A.MOTOR_OFF=0]="MOTOR_OFF",A[A.MOTOR_ON=1]="MOTOR_ON",A[A.TRACK_END=2]="TRACK_END",A[A.TRACK_SEEK=3]="TRACK_SEEK",A))(ge||{}),s=(A=>(A[A.IMPLIED=0]="IMPLIED",A[A.IMM=1]="IMM",A[A.ZP_REL=2]="ZP_REL",A[A.ZP_X=3]="ZP_X",A[A.ZP_Y=4]="ZP_Y",A[A.ABS=5]="ABS",A[A.ABS_X=6]="ABS_X",A[A.ABS_Y=7]="ABS_Y",A[A.IND_X=8]="IND_X",A[A.IND_Y=9]="IND_Y",A[A.IND=10]="IND",A))(s||{});const li=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Rr=A=>A.startsWith("B")&&A!=="BIT"&&A!=="BRK",M=(A,e=2)=>(A>255&&(e=4),("0000"+A.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const ve=A=>A.split("").map(e=>e.charCodeAt(0)),ui=A=>[A&255,A>>>8&255],Wo=A=>[A&255,A>>>8&255,A>>>16&255,A>>>24&255],Ii=(A,e)=>{const t=A.lastIndexOf(".")+1;return A.substring(0,t)+e},Pr=new Uint32Array(256).fill(0),hi=()=>{let A;for(let e=0;e<256;e++){A=e;for(let t=0;t<8;t++)A=A&1?3988292384^A>>>1:A>>>1;Pr[e]=A}},gi=(A,e=0)=>{Pr[255]===0&&hi();let t=-1;for(let n=e;n<A.length;n++)t=t>>>8^Pr[(t^A[n])&255];return(t^-1)>>>0},pi=(A,e)=>A+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),No=A=>{const e=A.toLowerCase();return ci.split(",").some(n=>e.endsWith(n))};let QA;const pe=Math.trunc(.0028*1020484);let Qr=pe/2,Fr=pe/2,mt=pe/2,kt=pe/2,Go=0,Zo=!1,Xo=!1,Lr=!1,Mr=!1,wt=!1,xo=!1,_o=!1;const ze=()=>{Lr=!0},br=()=>{Mr=!0},Ci=()=>{wt=!0},dt=A=>(A=Math.min(Math.max(A,-1),1),(A+1)*pe/2),Vo=A=>{Qr=dt(A)},Jo=A=>{Fr=dt(A)},jo=A=>{mt=dt(A)},Ho=A=>{kt=dt(A)},qr=()=>{xo=Zo||Lr,_o=Xo||Mr,f.PB0.isSet=xo,f.PB1.isSet=_o||wt,f.PB2.isSet=wt},vo=(A,e)=>{e?Zo=A:Xo=A,qr()},Si=A=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),Go=A},Tt=A=>{const e=A-Go;Z(49252,e<Qr?128:0),Z(49253,e<Fr?128:0),Z(49254,e<mt?128:0),Z(49255,e<kt?128:0)};let Ce,Kr,zo=!1;const fi=A=>{QA=A,zo=!QA.length||!QA[0].buttons.length,Ce=Vi(),Kr=Ce.gamepad?Ce.gamepad:xi},$o=A=>A>-.01&&A<.01,An=(A,e)=>{$o(A)&&(A=0),$o(e)&&(e=0);const t=Math.sqrt(A*A+e*e),n=.95*(t===0?1:Math.max(Math.abs(A),Math.abs(e))/t);return A=Math.min(Math.max(-n,A),n),e=Math.min(Math.max(-n,e),n),A=Math.trunc(pe*(A+n)/(2*n)),e=Math.trunc(pe*(e+n)/(2*n)),[A,e]},Ei=A=>{const[e,t]=An(A[0],A[1]),n=A.length>=6?A[5]:A[3],[i,I]=A.length>=4?An(A[2],n):[0,0];return[e,t,i,I]},en=A=>{const e=Ce.joystick?Ce.joystick(QA[A].axes,zo):QA[A].axes,t=Ei(e);A===0?(Qr=t[0],Fr=t[1],Lr=!1,Mr=!1,mt=t[2],kt=t[3]):(mt=t[0],kt=t[1],wt=!1);let n=!1;QA[A].buttons.forEach((i,I)=>{i&&(Kr(I,QA.length>1,A===1),n=!0)}),n||Kr(-1,QA.length>1,A===1),Ce.rumble&&Ce.rumble(),qr()},Bi=()=>{QA&&QA.length>0&&(en(0),QA.length>1&&en(1))},Di=A=>{switch(A){case 0:b("JL");break;case 1:b("G",200);break;case 2:N("M"),b("O");break;case 3:b("L");break;case 4:b("F");break;case 5:N("P"),b("T");break;case 6:break;case 7:break;case 8:b("Z");break;case 9:{const e=eo();e.includes("'N'")?N("N"):e.includes("'S'")?N("S"):e.includes("NUMERIC KEY")?N("1"):N("N");break}case 10:break;case 11:break;case 12:b("L");break;case 13:b("M");break;case 14:b("A");break;case 15:b("D");break;case-1:return}};let Se=0,fe=0,Ee=!1;const yt=.5,mi={address:24835,data:[173,198,9],keymap:{},joystick:A=>A[0]<-yt?(fe=0,Se===0||Se>2?(Se=0,N("A")):Se===1&&Ee?b("W"):Se===2&&Ee&&b("R"),Se++,Ee=!1,A):A[0]>yt?(Se=0,fe===0||fe>2?(fe=0,N("D")):fe===1&&Ee?b("W"):fe===2&&Ee&&b("R"),fe++,Ee=!1,A):A[1]<-yt?(b("C"),A):A[1]>yt?(b("S"),A):(Ee=!0,A),gamepad:Di,rumble:null,setup:null,helptext:`AZTEC
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
`},ki={address:25200,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
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
`},wi={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:A=>{switch(A){case 0:N(" ");break;case 12:N("A");break;case 13:N("Z");break;case 14:N("\b");break;case 15:N("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
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
`},Ti={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Lo("APPLE2EU",!1)},helptext:`Injured Engine
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
C         Close throttle`};let Ur=14,Yr=14;const yi={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let A=B(182,!1);Ur<40&&A<Ur&&dr({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Ur=A,A=B(183,!1),Yr<40&&A<Yr&&dr({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),Yr=A},setup:null,helptext:`KARATEKA
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
`},Ri={address:25078,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:()=>{m(46793,234),m(46794,234)},helptext:`Lode Runner by Doug Smith
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
`},Pi=A=>{switch(A){case 0:b("A");break;case 1:b("C",50);break;case 2:b("O");break;case 3:b("T");break;case 4:b("\x1B");break;case 5:b("\r");break;case 6:break;case 7:break;case 8:N("N"),b("'");break;case 9:N("Y"),b("1");break;case 10:break;case 11:break;case 12:break;case 13:b(" ");break;case 14:break;case 15:b("	");break;case-1:return}},zA=.5,Qi={address:768,data:[141,74,3,132],keymap:{},gamepad:Pi,joystick:(A,e)=>{if(e)return A;const t=A[0]<-zA?"\b":A[0]>zA?"":"",n=A[1]<-zA?"\v":A[1]>zA?`
`:"";let i=t+n;return i||(i=A[2]<-zA?"L\b":A[2]>zA?"L":"",i||(i=A[3]<-zA?"L\v":A[3]>zA?`L
`:"")),i&&b(i,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},Fi={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},Li={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},Mi={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},bi={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&dr({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{m(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},tn=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,qi=A=>{switch(A){case 1:m(109,255);break;case 12:N("A");break;case 13:N("Z");break;case 14:N("\b");break;case 15:N("");break}},Rt=.75,Ki=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{m(25025,173),m(25036,64)},helptext:tn},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:A=>{const e=A[0]<-Rt?"\b":A[0]>Rt?"":A[1]<-Rt?"A":A[1]>Rt?"Z":"";return e&&N(e),A},gamepad:qi,rumble:null,setup:null,helptext:tn}],Ui={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{Xs(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Yi={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},rn=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,Oi=A=>{switch(A){case 0:ze();break;case 1:br();break;case 2:b(" ");break;case 3:b("U");break;case 4:b("\r");break;case 5:b("T");break;case 9:{const e=eo();e.includes("'N'")?N("N"):e.includes("'S'")?N("S"):e.includes("NUMERIC KEY")?N("1"):N("N");break}case 10:ze();break}},Wi=()=>{m(5128,0),m(5130,4);let A=5210;m(A,234),m(A+1,234),m(A+2,234),A=5224,m(A,234),m(A+1,234),m(A+2,234)},Ni=()=>{B(49178,!1)<128&&B(49181,!1)<128&&dr({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},Gi={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:rn},Zi={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:Oi,rumble:Ni,setup:Wi,helptext:rn},Xi={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:A=>{switch(A){case 0:ze();break;case 1:br();break;case 2:b(" ");break;case 3:b("U");break;case 4:b("\r");break;case 5:b(":");break;case 9:{const e=eo();e.includes("'N'")?N("N"):e.includes("'S'")?N("S"):e.includes("NUMERIC KEY")?N("1"):N("N");break}case 10:ze();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},$e=new Array,aA=A=>{Array.isArray(A)?$e.push(...A):$e.push(A)};aA(mi),aA(ki),aA(wi),aA(di),aA(Ti),aA(yi),aA(Ri),aA(Qi),aA(Fi),aA(Li),aA(Mi),aA(bi),aA(Ki),aA(Ui),aA(Yi),aA(Zi),aA(Gi),aA(Xi);const xi=(A,e,t)=>{if(t)switch(A){case 0:Ci();break;case 1:break;case 12:Ho(-1);break;case 13:Ho(1);break;case 14:jo(-1);break;case 15:jo(1);break}else switch(A){case 0:ze();break;case 1:e||br();break;case 12:Jo(-1);break;case 13:Jo(1);break;case 14:Vo(-1);break;case 15:Vo(1);break}},_i={address:0,data:[],keymap:{},gamepad:null,joystick:A=>A,rumble:null,setup:null,helptext:""},on=A=>{for(const e of $e)if(oo(e.address,e.data))return A.toUpperCase()in e.keymap?e.keymap[A.toUpperCase()]:A;return A},Vi=()=>{for(const A of $e)if(oo(A.address,A.data))return A;return _i},Or=(A=!1)=>{for(const e of $e)if(oo(e.address,e.data)){Zs(e.helptext?e.helptext:" "),e.setup&&e.setup();return}A&&(Zs(" "),Xs(0))},Ji=A=>{Z(49152,A|128,16),Z(49168,A&255|128,16)},nn=()=>{const A=pA(49152)&127;Z(49152,A,16)},ji=()=>{const A=pA(49152)&127;Z(49152,A,32)};let Be="",sn=1e9,an=0;const Wr=()=>{const A=performance.now();if(Be!==""&&(pA(49152)<128||A-sn>3800)){sn=A;const e=Be.charCodeAt(0);Ji(e),Be=Be.slice(1),Be.length===0&&A-an>500&&(an=A,Mo(!0))}};let cn="";const N=A=>{A===cn&&Be.length>0||(cn=A,Be+=A)};let ln=0;const b=(A,e=300)=>{const t=performance.now();t-ln<e||(ln=t,N(A))},Hi=A=>{let e=String.fromCharCode(A);e=on(e),N(e),Wr()},vi=A=>{A.length===1&&(A=on(A)),N(A)},Me=[],P=(A,e,t,n=!1,i=null)=>{const I={offAddr:A,onAddr:e,isSetAddr:t,writeOnly:n,isSet:!1,setFunc:i};return A>=49152&&(Me[A-49152]=I),e>=49152&&(Me[e-49152]=I),t>=49152&&(Me[t-49152]=I),I},De=()=>Math.floor(180*Math.random()),zi=()=>Math.floor(256*Math.random()),un=(A,e)=>{A&=11,e?f.BSR_PREWRITE.isSet=!1:A&1?f.BSR_PREWRITE.isSet?f.BSR_WRITE.isSet=!0:f.BSR_PREWRITE.isSet=!0:(f.BSR_PREWRITE.isSet=!1,f.BSR_WRITE.isSet=!1),f.BSRBANK2.isSet=A<=3,f.BSRREADRAM.isSet=[0,3,8,11].includes(A)},f={STORE80:P(49152,49153,49176,!0),RAMRD:P(49154,49155,49171,!0),RAMWRT:P(49156,49157,49172,!0),INTCXROM:P(49158,49159,49173,!0),INTC8ROM:P(49194,0,0),ALTZP:P(49160,49161,49174,!0),SLOTC3ROM:P(49162,49163,49175,!0),COLUMN80:P(49164,49165,49183,!0),ALTCHARSET:P(49166,49167,49182,!0),KBRDSTROBE:P(49168,0,0,!1),BSRBANK2:P(0,0,49169),BSRREADRAM:P(0,0,49170),VBL:P(0,0,49177),CASSOUT:P(49184,0,0),SPEAKER:P(49200,0,0,!1,(A,e)=>{Z(49200,De()),r1(e)}),GCSTROBE:P(49216,0,0),EMUBYTE:P(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:P(49232,49233,49178),MIXED:P(49234,49235,49179),PAGE2:P(49236,49237,49180),HIRES:P(49238,49239,49181),AN0:P(49240,49241,0),AN1:P(49242,49243,0),AN2:P(49244,49245,0),DHIRES:P(49247,49246,0),CASSIN1:P(0,0,49248,!1,()=>{Z(49248,De())}),PB0:P(0,0,49249),PB1:P(0,0,49250),PB2:P(0,0,49251),JOYSTICK0:P(0,0,49252,!1,(A,e)=>{Tt(e)}),JOYSTICK1:P(0,0,49253,!1,(A,e)=>{Tt(e)}),JOYSTICK2:P(0,0,49254,!1,(A,e)=>{Tt(e)}),JOYSTICK3:P(0,0,49255,!1,(A,e)=>{Tt(e)}),CASSIN2:P(0,0,49256,!1,()=>{Z(49256,De())}),FASTCHIP_LOCK:P(49258,0,0),FASTCHIP_ENABLE:P(49259,0,0),FASTCHIP_SPEED:P(49261,0,0),JOYSTICKRESET:P(0,0,49264,!1,(A,e)=>{Si(e),Z(49264,De())}),BANKSEL:P(49267,0,0),LASER128EX:P(49268,0,0),VIDEO7_160:P(49272,49273,0),VIDEO7_MONO:P(49274,49275,0),VIDEO7_MIXED:P(49276,49277,0),BSR_PREWRITE:P(49280,0,0),BSR_WRITE:P(49288,0,0)};f.TEXT.isSet=!0;let In=!0,Pt=0;const hn=A=>{if(In!==A&&f.STORE80.isSet){if(A)switch(f.VIDEO7_160.isSet=!1,f.VIDEO7_MONO.isSet=!1,f.VIDEO7_MIXED.isSet=!1,Pt=Pt<<1&2,Pt|=f.COLUMN80.isSet?0:1,Pt){case 0:break;case 1:{f.VIDEO7_160.isSet=!0;break}case 2:{f.VIDEO7_MIXED.isSet=!0;break}case 3:{f.VIDEO7_MONO.isSet=!0;break}}In=A}},$i=[49152,49153,49165,49167,49168,49200,49236,49237,49183],Aa=(A,e)=>8192+1024*(A%8)+128*(Math.trunc(A/8)&7)+40*Math.trunc(A/64)+e,gn=(A,e,t)=>{if(A>1048575&&!$i.includes(A)){const i=pA(A)>128?1:0;console.log(`${t} $${M(c.PC)}: $${M(A)} [${i}] ${e?"write":""}`)}if(A<=49183&&Ra()==="APPLE2P"){!e&&A<=49167&&Wr(),A===49168?nn():A!==49152&&Z(A,De());return}if(A>=49280&&A<=49295){un(A&-5,e);return}const n=Me[A-49152];if(!n){console.error("Unknown softswitch "+M(A)),Z(A,De());return}if(A<=49167?e||Wr():(A===49168||A<=49183&&e)&&nn(),n.setFunc){n.setFunc(A,t);return}if(A===f.DHIRES.offAddr?hn(!0):A===f.DHIRES.onAddr&&hn(!1),A===n.offAddr||A===n.onAddr){if((!n.writeOnly||e)&&(qA[n.offAddr-49152]!==void 0?qA[n.offAddr-49152]=A===n.onAddr:n.isSet=A===n.onAddr),n.isSetAddr){const i=pA(n.isSetAddr);Z(n.isSetAddr,n.isSet?i|128:i&127)}if(A>=49184){let i;if(A>=49232&&A<=49247){const I=t%17030-4550;if(I>=0){const C=Math.floor(I/65),u=t%65,D=Aa(C,u);i=B(D)}else i=zi()}else i=De();Z(A,i)}}else if(A===n.isSetAddr){const i=pA(A);Z(A,n.isSet?i|128:i&127)}},ea=()=>{for(const A in f){const e=A;qA[f[e].offAddr-49152]!==void 0?qA[f[e].offAddr-49152]=!1:f[e].isSet=!1}qA[f.TEXT.offAddr-49152]!==void 0?qA[f.TEXT.offAddr-49152]=!0:f.TEXT.isSet=!0},qA=[],ta=A=>{if(A>=49280&&A<=49295){un(A&-5,!1);return}const e=Me[A-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+M(A));return}qA[e.offAddr-49152]===void 0&&(qA[e.offAddr-49152]=e.isSet),e.isSet=A===e.onAddr},ra=()=>{qA.forEach((A,e)=>{A!==void 0&&(Me[e].isSet=A)}),qA.length=0},be=[],oa=()=>{if(be.length===0)for(const A in f){const e=f[A],t=e.onAddr>0,n=e.writeOnly?" (write)":"";if(e.offAddr>0){const i=M(e.offAddr)+" "+A;be[e.offAddr]=i+(t?"-OFF":"")+n}if(e.onAddr>0){const i=M(e.onAddr)+" "+A;be[e.onAddr]=i+"-ON"+n}if(e.isSetAddr>0){const i=M(e.isSetAddr)+" "+A;be[e.isSetAddr]=i+"-STATUS"+n}}return be[49152]="C000 KBRD/STORE80-OFF",be},na=()=>{for(const A in f){const t=f[A];if(t.isSetAddr){const n=pA(t.isSetAddr);Z(t.isSetAddr,t.isSet?n|128:n&127)}}},sa=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
g39dzLX8Fxf1A/sDYvpA+g==`,ia=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`,aa=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`,pn=new Array(256),Nr={},p=(A,e,t,n)=>{console.assert(!pn[t],"Duplicate instruction: "+A+" mode="+e),pn[t]={name:A,mode:e,bytes:n},Nr[A]||(Nr[A]=[]),Nr[A][e]=t};p("ADC",s.IMM,105,2),p("ADC",s.ZP_REL,101,2),p("ADC",s.ZP_X,117,2),p("ADC",s.ABS,109,3),p("ADC",s.ABS_X,125,3),p("ADC",s.ABS_Y,121,3),p("ADC",s.IND_X,97,2),p("ADC",s.IND_Y,113,2),p("ADC",s.IND,114,2),p("AND",s.IMM,41,2),p("AND",s.ZP_REL,37,2),p("AND",s.ZP_X,53,2),p("AND",s.ABS,45,3),p("AND",s.ABS_X,61,3),p("AND",s.ABS_Y,57,3),p("AND",s.IND_X,33,2),p("AND",s.IND_Y,49,2),p("AND",s.IND,50,2),p("ASL",s.IMPLIED,10,1),p("ASL",s.ZP_REL,6,2),p("ASL",s.ZP_X,22,2),p("ASL",s.ABS,14,3),p("ASL",s.ABS_X,30,3),p("BCC",s.ZP_REL,144,2),p("BCS",s.ZP_REL,176,2),p("BEQ",s.ZP_REL,240,2),p("BIT",s.ZP_REL,36,2),p("BIT",s.ABS,44,3),p("BIT",s.IMM,137,2),p("BIT",s.ZP_X,52,2),p("BIT",s.ABS_X,60,3),p("BMI",s.ZP_REL,48,2),p("BNE",s.ZP_REL,208,2),p("BPL",s.ZP_REL,16,2),p("BVC",s.ZP_REL,80,2),p("BVS",s.ZP_REL,112,2),p("BRA",s.ZP_REL,128,2),p("BRK",s.IMPLIED,0,1),p("CLC",s.IMPLIED,24,1),p("CLD",s.IMPLIED,216,1),p("CLI",s.IMPLIED,88,1),p("CLV",s.IMPLIED,184,1),p("CMP",s.IMM,201,2),p("CMP",s.ZP_REL,197,2),p("CMP",s.ZP_X,213,2),p("CMP",s.ABS,205,3),p("CMP",s.ABS_X,221,3),p("CMP",s.ABS_Y,217,3),p("CMP",s.IND_X,193,2),p("CMP",s.IND_Y,209,2),p("CMP",s.IND,210,2),p("CPX",s.IMM,224,2),p("CPX",s.ZP_REL,228,2),p("CPX",s.ABS,236,3),p("CPY",s.IMM,192,2),p("CPY",s.ZP_REL,196,2),p("CPY",s.ABS,204,3),p("DEC",s.IMPLIED,58,1),p("DEC",s.ZP_REL,198,2),p("DEC",s.ZP_X,214,2),p("DEC",s.ABS,206,3),p("DEC",s.ABS_X,222,3),p("DEX",s.IMPLIED,202,1),p("DEY",s.IMPLIED,136,1),p("EOR",s.IMM,73,2),p("EOR",s.ZP_REL,69,2),p("EOR",s.ZP_X,85,2),p("EOR",s.ABS,77,3),p("EOR",s.ABS_X,93,3),p("EOR",s.ABS_Y,89,3),p("EOR",s.IND_X,65,2),p("EOR",s.IND_Y,81,2),p("EOR",s.IND,82,2),p("INC",s.IMPLIED,26,1),p("INC",s.ZP_REL,230,2),p("INC",s.ZP_X,246,2),p("INC",s.ABS,238,3),p("INC",s.ABS_X,254,3),p("INX",s.IMPLIED,232,1),p("INY",s.IMPLIED,200,1),p("JMP",s.ABS,76,3),p("JMP",s.IND,108,3),p("JMP",s.IND_X,124,3),p("JSR",s.ABS,32,3),p("LDA",s.IMM,169,2),p("LDA",s.ZP_REL,165,2),p("LDA",s.ZP_X,181,2),p("LDA",s.ABS,173,3),p("LDA",s.ABS_X,189,3),p("LDA",s.ABS_Y,185,3),p("LDA",s.IND_X,161,2),p("LDA",s.IND_Y,177,2),p("LDA",s.IND,178,2),p("LDX",s.IMM,162,2),p("LDX",s.ZP_REL,166,2),p("LDX",s.ZP_Y,182,2),p("LDX",s.ABS,174,3),p("LDX",s.ABS_Y,190,3),p("LDY",s.IMM,160,2),p("LDY",s.ZP_REL,164,2),p("LDY",s.ZP_X,180,2),p("LDY",s.ABS,172,3),p("LDY",s.ABS_X,188,3),p("LSR",s.IMPLIED,74,1),p("LSR",s.ZP_REL,70,2),p("LSR",s.ZP_X,86,2),p("LSR",s.ABS,78,3),p("LSR",s.ABS_X,94,3),p("NOP",s.IMPLIED,234,1),p("ORA",s.IMM,9,2),p("ORA",s.ZP_REL,5,2),p("ORA",s.ZP_X,21,2),p("ORA",s.ABS,13,3),p("ORA",s.ABS_X,29,3),p("ORA",s.ABS_Y,25,3),p("ORA",s.IND_X,1,2),p("ORA",s.IND_Y,17,2),p("ORA",s.IND,18,2),p("PHA",s.IMPLIED,72,1),p("PHP",s.IMPLIED,8,1),p("PHX",s.IMPLIED,218,1),p("PHY",s.IMPLIED,90,1),p("PLA",s.IMPLIED,104,1),p("PLP",s.IMPLIED,40,1),p("PLX",s.IMPLIED,250,1),p("PLY",s.IMPLIED,122,1),p("ROL",s.IMPLIED,42,1),p("ROL",s.ZP_REL,38,2),p("ROL",s.ZP_X,54,2),p("ROL",s.ABS,46,3),p("ROL",s.ABS_X,62,3),p("ROR",s.IMPLIED,106,1),p("ROR",s.ZP_REL,102,2),p("ROR",s.ZP_X,118,2),p("ROR",s.ABS,110,3),p("ROR",s.ABS_X,126,3),p("RTI",s.IMPLIED,64,1),p("RTS",s.IMPLIED,96,1),p("SBC",s.IMM,233,2),p("SBC",s.ZP_REL,229,2),p("SBC",s.ZP_X,245,2),p("SBC",s.ABS,237,3),p("SBC",s.ABS_X,253,3),p("SBC",s.ABS_Y,249,3),p("SBC",s.IND_X,225,2),p("SBC",s.IND_Y,241,2),p("SBC",s.IND,242,2),p("SEC",s.IMPLIED,56,1),p("SED",s.IMPLIED,248,1),p("SEI",s.IMPLIED,120,1),p("STA",s.ZP_REL,133,2),p("STA",s.ZP_X,149,2),p("STA",s.ABS,141,3),p("STA",s.ABS_X,157,3),p("STA",s.ABS_Y,153,3),p("STA",s.IND_X,129,2),p("STA",s.IND_Y,145,2),p("STA",s.IND,146,2),p("STX",s.ZP_REL,134,2),p("STX",s.ZP_Y,150,2),p("STX",s.ABS,142,3),p("STY",s.ZP_REL,132,2),p("STY",s.ZP_X,148,2),p("STY",s.ABS,140,3),p("STZ",s.ZP_REL,100,2),p("STZ",s.ZP_X,116,2),p("STZ",s.ABS,156,3),p("STZ",s.ABS_X,158,3),p("TAX",s.IMPLIED,170,1),p("TAY",s.IMPLIED,168,1),p("TSX",s.IMPLIED,186,1),p("TXA",s.IMPLIED,138,1),p("TXS",s.IMPLIED,154,1),p("TYA",s.IMPLIED,152,1),p("TRB",s.ZP_REL,20,2),p("TRB",s.ABS,28,3),p("TSB",s.ZP_REL,4,2),p("TSB",s.ABS,12,3);const ca=65536,Cn=65792,Sn=66048,fn=()=>{const A={register:"",address:768,operator:"==",value:128},e={action:"",register:"A",address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...A},expression2:{...A},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:"",action1:{...e},action2:{...e},halt:!1,basic:!1}};class Gr extends Map{set(e,t){const n=[...this.entries()];n.push([e,t]),n.sort((i,I)=>i[0]-I[0]),super.clear();for(const[i,I]of n)super.set(i,I);return this}}const eA={};eA[""]={name:"Any",min:0,max:65535},eA.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},eA.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},eA.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},eA["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},eA["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},eA["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},eA["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},eA["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},eA["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(eA).map(A=>A.name);const la=(A,e)=>A+2+(e>127?e-256:e),ua=(A,e,t,n)=>{if(A>>8===192){let T="---";return A>=49168&&A<=49183&&(T=e.pcode>=128?"ON":"OFF"),`${M(A,4)}: ${M(e.pcode)}        ${T}`}let i="",I=`${M(e.pcode)}`,C="",u="";switch(e.bytes){case 1:I+="      ";break;case 2:C=M(t),I+=` ${C}   `;break;case 3:C=M(t),u=M(n),I+=` ${C} ${u}`;break}const D=Rr(e.name)?M(la(A,t),4):C;switch(e.mode){case s.IMPLIED:break;case s.IMM:i=` #$${C}`;break;case s.ZP_REL:i=` $${D}`;break;case s.ZP_X:i=` $${C},X`;break;case s.ZP_Y:i=` $${C},Y`;break;case s.ABS:i=` $${u}${C}`;break;case s.ABS_X:i=` $${u}${C},X`;break;case s.ABS_Y:i=` $${u}${C},Y`;break;case s.IND_X:i=` ($${u.trim()}${C},X)`;break;case s.IND_Y:i=` ($${C}),Y`;break;case s.IND:i=` ($${u.trim()}${C})`;break}return`${M(A,4)}: ${I}  ${e.name}${i}`};let Qt=!1,Zr=!1,cA=new Gr;const Ft=()=>{Qt=!0},Ia=()=>{new Gr(cA).forEach((n,i)=>{n.once&&cA.delete(i)});const e=_a();if(e<0||cA.get(e))return;const t=fn();t.address=e,t.once=!0,t.hidden=!0,cA.set(e,t)},ha=()=>{new Gr(cA).forEach((n,i)=>{n.once&&cA.delete(i)});const e=55301,t=fn();t.address=e,t.once=!0,t.hidden=!0,cA.set(e,t)},ga=A=>{cA=A};let En=!1;const pa=()=>{En=!0,eA.MAIN.enabled=(A=0)=>A>=53248?!f.ALTZP.isSet&&f.BSRREADRAM.isSet:A>=512?!f.RAMRD.isSet:!f.ALTZP.isSet,eA.AUX.enabled=(A=0)=>A>=53248?f.ALTZP.isSet&&f.BSRREADRAM.isSet:A>=512?f.RAMRD.isSet:f.ALTZP.isSet,eA.ROM.enabled=()=>!f.BSRREADRAM.isSet,eA["MAIN-DXXX-1"].enabled=()=>!f.ALTZP.isSet&&f.BSRREADRAM.isSet&&!f.BSRBANK2.isSet,eA["MAIN-DXXX-2"].enabled=()=>!f.ALTZP.isSet&&f.BSRREADRAM.isSet&&f.BSRBANK2.isSet,eA["AUX-DXXX-1"].enabled=()=>f.ALTZP.isSet&&f.BSRREADRAM.isSet&&!f.BSRBANK2.isSet,eA["AUX-DXXX-2"].enabled=()=>f.ALTZP.isSet&&f.BSRREADRAM.isSet&&f.BSRBANK2.isSet,eA["CXXX-ROM"].enabled=(A=0)=>A>=49920&&A<=50175?f.INTCXROM.isSet||!f.SLOTC3ROM.isSet:A>=51200?f.INTCXROM.isSet||f.INTC8ROM.isSet:f.INTCXROM.isSet,eA["CXXX-CARD"].enabled=(A=0)=>A>=49920&&A<=50175?f.INTCXROM.isSet?!1:f.SLOTC3ROM.isSet:A>=51200?!f.INTCXROM.isSet&&!f.INTC8ROM.isSet:!f.INTCXROM.isSet},Bn=(A,e)=>{En||pa();const t=eA[A];return!(e<t.min||e>t.max||t.enabled&&!t?.enabled(e))},Dn=(A,e,t)=>{const n=cA.get(A);return!n||!n.watchpoint||n.disabled||n.hexvalue>=0&&n.hexvalue!==e||n.memoryBank&&!Bn(n.memoryBank,A)?!1:t?n.memset:n.memget},At=(A=0,e=!0)=>{e?c.flagIRQ|=1<<A:c.flagIRQ&=~(1<<A),c.flagIRQ&=255},Ca=(A=!0)=>{c.flagNMI=A===!0},Sa=()=>{c.flagIRQ=0,c.flagNMI=!1},Xr=[],mn=[],kn=(A,e)=>{Xr.push(A),mn.push(e)},fa=()=>{for(let A=0;A<Xr.length;A++)Xr[A](mn[A])},wn=A=>{let e=0;switch(A.register){case"$":e=Ka(A.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(A.operator){case"==":return e===A.value;case"!=":return e!==A.value;case"<":return e<A.value;case"<=":return e<=A.value;case">":return e>A.value;case">=":return e>=A.value}},Ea=A=>{const e=wn(A.expression1);return A.expressionOperator===""?e:A.expressionOperator==="&&"&&!e?!1:A.expressionOperator==="||"&&e?!0:wn(A.expression2)},dn=()=>{Zr=!0},Ba=(A,e,t)=>{const n=ua(c.PC,{...t},A,e)+"          ",I=`${("          "+c.cycleCount.toString()).slice(-10)}  ${n.slice(0,29)}  ${Ga()}`;console.log(I)},Tn=(A,e,t,n)=>{if(A.action==="")return!1;const i=A.value&255,I=A.address&65535;switch(A.action){case"set":switch(A.register){case"A":c.Accum=i;break;case"X":c.XReg=i;break;case"Y":c.YReg=i;break;case"S":c.StackPtr=i;break;case"P":c.PStatus=i;break;case"C":c.PC=A.value&65535;break}break;case"jump":c.PC=I;break;case"print":Ba(e,t,n);break;case"snapshot":Mo();break}return!0},Da=(A,e,t,n)=>{const i=Tn(A.action1,e,t,n),I=Tn(A.action2,e,t,n);return i||I?A.halt?1:2:A.hidden?3:1},ma=(A=-1,e=0,t=0,n=null)=>{if(Zr)return Zr=!1,1;if(cA.size===0||Qt)return 0;if(c.PC===55301){const I=B(117)+(B(118)<<8),C=cA.get(I);if(C&&!C.disabled)return 3}const i=cA.get(c.PC)||cA.get(-1)||cA.get(A|ca)||A>=0&&cA.get(Cn)||A>=0&&cA.get(Sn);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){const I=(t<<8)+e;if(i.address===Cn){if(H[A].name!=="???")return 0}else if(i.address===Sn){if(H[A].is6502)return 0}else if(I>=0&&i.hexvalue>=0&&i.hexvalue!==I)return 0}if(i.expression1.register!==""&&!Ea(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!Bn(i.memoryBank,c.PC)?0:(i.once&&cA.delete(c.PC),Da(i,e,t,n))},xr=()=>{let A=0;const e=c.PC,t=B(c.PC,!1),n=H[t],i=n.bytes>1?B(c.PC+1,!1):-1,I=n.bytes>2?B(c.PC+2,!1):0;if(!Nl()){const u=ma(t,i,I,n);if(u===1||u===3)return MA(W.PAUSED,u!==3),-1;if(u===2)return c.PC===e&&(Qt=!0),0;Qt=!1}const C=Ln.get(e);if(C&&(!f.INTCXROM.isSet||(e&61440)!==49152)&&C(),A=n.execute(i,I),Yn(n.bytes),nt(c.cycleCount+A),fa(),c.flagNMI&&(c.flagNMI=!1,A=ja(),nt(c.cycleCount+A)),c.flagIRQ){const u=Ja();u>0&&(nt(c.cycleCount+u),A=u)}return A},ka=[197,58,163,92,197,58,163,92],wa=1,yn=4;class da{bits=[];pattern=new Array(64);patternIdx=0;constructor(){}reset=()=>{this.patternIdx=0};checkPattern=e=>{const n=ka[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===n};calcBits=()=>{const e=x=>{this.bits.push(x&8?1:0),this.bits.push(x&4?1:0),this.bits.push(x&2?1:0),this.bits.push(x&1?1:0)},t=x=>{e(Math.floor(x/10)),e(Math.floor(x%10))},n=new Date,i=n.getFullYear()%100,I=n.getDate(),C=n.getDay()+1,u=n.getMonth()+1,D=n.getHours(),T=n.getMinutes(),d=n.getSeconds(),G=n.getMilliseconds()/10;this.bits=[],t(i),t(u),t(I),t(C),t(D),t(T),t(d),t(G)};access=e=>{e&yn?this.reset():this.checkPattern(e&wa)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()};read=e=>{let t=-1;return this.bits.length>0?e&yn&&(t=this.bits.pop()):this.access(e),t}}const Ta=new da,Rn=320,Pn=327,Lt=256*Rn,ya=256*Pn;let KA=0;const _r=ZA;let Q=new Uint8Array(_r+(KA+1)*65536).fill(0);const Vr=new Uint8Array(8).fill(0),Jr=()=>pA(49194),Mt=A=>{Z(49194,A)},me=()=>pA(49267),jr=A=>{Z(49267,A)},oA=new Array(257).fill(0),yA=new Array(257).fill(0);let Qn="APPLE2EE";const Ra=()=>Qn,Fn=A=>{Qn=A;let e="";switch(A){case"APPLE2P":e=sa;break;case"APPLE2EU":e=aa;break;case"APPLE2EE":e=ia;break}const t=e.replace(/\n/g,""),n=new Uint8Array(Fe.Buffer.from(t,"base64"));n[15035]=5,Q.set(n,He)},Hr=A=>{A=Math.max(64,Math.min(8192,A));const e=KA;if(KA=Math.floor(A/64)-1,KA===e)return;me()>KA&&(jr(0),XA());const t=_r+(KA+1)*65536;if(KA<e)Q=Q.slice(0,t);else{const n=Q;Q=new Uint8Array(t).fill(255),Q.set(n)}},Pa=()=>{const A=f.RAMRD.isSet?Le+me()*256:0,e=f.RAMWRT.isSet?Le+me()*256:0,t=f.PAGE2.isSet?Le+me()*256:0,n=f.STORE80.isSet?t:A,i=f.STORE80.isSet?t:e,I=f.STORE80.isSet&&f.HIRES.isSet?t:A,C=f.STORE80.isSet&&f.HIRES.isSet?t:e;for(let u=2;u<256;u++)oA[u]=u+A,yA[u]=u+e;for(let u=4;u<=7;u++)oA[u]=u+n,yA[u]=u+i;for(let u=32;u<=63;u++)oA[u]=u+I,yA[u]=u+C},Qa=()=>{const A=f.ALTZP.isSet?Le+me()*256:0;if(oA[0]=A,oA[1]=1+A,yA[0]=A,yA[1]=1+A,f.BSRREADRAM.isSet){for(let e=208;e<=255;e++)oA[e]=e+A;if(!f.BSRBANK2.isSet)for(let e=208;e<=223;e++)oA[e]=e-16+A}else for(let e=208;e<=255;e++)oA[e]=je+e-192},Fa=()=>{const A=f.ALTZP.isSet?Le+me()*256:0,e=f.BSR_WRITE.isSet;for(let t=192;t<=255;t++)yA[t]=-1;if(e){for(let t=208;t<=255;t++)yA[t]=t+A;if(!f.BSRBANK2.isSet)for(let t=208;t<=223;t++)yA[t]=t-16+A}},vr=A=>f.INTCXROM.isSet?!1:A!==3?!0:f.SLOTC3ROM.isSet,La=()=>!!(f.INTCXROM.isSet||f.INTC8ROM.isSet),zr=A=>{if(A<=7){if(f.INTCXROM.isSet)return;A===3&&!f.SLOTC3ROM.isSet&&(f.INTC8ROM.isSet||(f.INTC8ROM.isSet=!0,Mt(255),XA())),Jr()===0&&bn[A]&&(Mt(A),XA())}else f.INTC8ROM.isSet=!1,Mt(0),XA()},Ma=()=>{oA[192]=je-192;for(let A=1;A<=7;A++){const e=192+A;oA[e]=A+(vr(A)?Rn-1:je)}if(La())for(let A=200;A<=207;A++)oA[A]=je+A-192;else{const A=Pn+8*(Jr()-1);for(let e=0;e<=7;e++){const t=200+e;oA[t]=A+e}}},XA=()=>{Pa(),Qa(),Fa(),Ma();for(let A=0;A<256;A++)oA[A]=256*oA[A],yA[A]=256*yA[A]},Ln=new Map,Mn=new Array(8),bn=new Uint8Array(8),bt=(A,e=-1)=>{const t=A>>8===192?A-49280>>4:(A>>8)-192;if(A>=49408&&(zr(t),!vr(t)))return;const n=Mn[t];if(n!==void 0){const i=n(A,e);if(i>=0){const I=A>=49408?Lt-256:He;Q[A-49152+I]=i}}},et=(A,e)=>{Vr[A]=1,Mn[A]=e},qe=(A,e,t=0,n=()=>{})=>{if(Q.set(e.slice(0,256),Lt+(A-1)*256),Vr[A]=e.some(i=>i!==0)?1:0,e.length>256){const i=e.length>2304?2304:e.length,I=ya+(A-1)*2048;Q.set(e.slice(256,i),I),bn[A]=255}t&&Ln.set(t,n)},ba=()=>{Q.fill(255,0,65536),Q.fill(255,_r),Mt(0),jr(0),XA()},qa=A=>(A>=49296?bt(A):gn(A,!1,c.cycleCount),A>=49232&&XA(),Q[He+A-49152]),_=(A,e)=>{const t=Lt+(A-1)*256+(e&255);return Q[t]},Y=(A,e,t)=>{if(t>=0){const n=Lt+(A-1)*256+(e&255);Q[n]=t&255}},B=(A,e=!0)=>{let t=0;const n=A>>>8;if(n===192)t=qa(A);else if(t=-1,n>=193&&n<=199?(n==195&&(f.INTCXROM.isSet||!f.SLOTC3ROM.isSet)?t=Ta.read(A):vr(n-192)&&!Vr[n-192]&&(t=Math.floor(256*Math.random())),bt(A)):A===53247&&zr(255),t<0){const i=oA[n];t=Q[i+(A&255)]}return e&&Dn(A,t,!1)&&dn(),t},Ka=A=>{const e=A>>>8,t=oA[e];return Q[t+(A&255)]},Ua=(A,e)=>{if(A===49265||A===49267){if(e>KA)return;jr(e)}else A>=49296?bt(A,e):gn(A,!0,c.cycleCount);(A<=49167||A>=49232)&&XA()},m=(A,e)=>{const t=A>>>8;if(t===192)Ua(A,e);else{t>=193&&t<=199?bt(A,e):A===53247&&zr(255);const n=yA[t];if(n<0)return;Q[n+(A&255)]=e}Dn(A,e,!0)&&dn()},pA=A=>Q[He+A-49152],Z=(A,e,t=1)=>{const n=He+A-49152;Q.fill(e,n,n+t)},$r=1024,qn=2048,qt=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Ao=(A=!1)=>{let e=0,t=24,n=!1;if(A){if(f.TEXT.isSet||f.HIRES.isSet)return new Uint8Array;t=f.MIXED.isSet?20:24,n=f.COLUMN80.isSet&&f.DHIRES.isSet}else{if(!f.TEXT.isSet&&!f.MIXED.isSet)return new Uint8Array;!f.TEXT.isSet&&f.MIXED.isSet&&(e=20),n=f.COLUMN80.isSet}if(n){const u=f.PAGE2.isSet&&!f.STORE80.isSet?qn:$r,D=new Uint8Array(80*(t-e)).fill(160);for(let T=e;T<t;T++){const d=80*(T-e);for(let G=0;G<40;G++)D[d+2*G+1]=Q[u+qt[T]+G],D[d+2*G]=Q[ZA+u+qt[T]+G]}return D}if(f.DHIRES.isSet&&!f.COLUMN80.isSet&&f.STORE80.isSet){const u=new Uint8Array(80*(t-e));for(let D=e;D<t;D++){const T=80*(D-e);let d=$r+qt[D];u.set(Q.slice(d,d+40),T),d+=ZA,u.set(Q.slice(d,d+40),T+40)}return u}const I=f.PAGE2.isSet&&!f.STORE80.isSet?qn:$r,C=new Uint8Array(40*(t-e));for(let u=e;u<t;u++){const D=40*(u-e),T=I+qt[u];C.set(Q.slice(T,T+40),D)}return C},eo=()=>Fe.Buffer.from(Ao().map(A=>A&=127)).toString(),Ya=()=>{if(f.TEXT.isSet||!f.HIRES.isSet)return new Uint8Array;const A=f.DHIRES.isSet&&f.COLUMN80.isSet,e=f.DHIRES.isSet&&!f.COLUMN80.isSet&&f.STORE80.isSet,t=f.MIXED.isSet?160:192;if(A||f.VIDEO7_MONO.isSet||f.VIDEO7_160.isSet||e){const n=f.PAGE2.isSet&&!f.STORE80.isSet?16384:8192,i=new Uint8Array(80*t);for(let I=0;I<t;I++){const C=pi(n,I);for(let u=0;u<40;u++)i[I*80+2*u+1]=Q[C+u],i[I*80+2*u]=Q[ZA+C+u]}return i}else{const n=f.PAGE2.isSet?16384:8192,i=new Uint8Array(40*t);for(let I=0;I<t;I++){const C=n+40*Math.trunc(I/64)+1024*(I%8)+128*(Math.trunc(I/8)&7);i.set(Q.slice(C,C+40),I*40)}return i}},to=A=>{const e=oA[A>>>8]+(A&255);return Q.slice(e,e+512)},ro=(A,e)=>{const t=yA[A>>>8]+(A&255);Q.set(e,t)},oo=(A,e)=>{for(let t=0;t<e.length;t++)if(B(A+t,!1)!==e[t])return!1;return!0},Oa=()=>{const A=oA[0];return Q.slice(A,A+256)},Wa=()=>Q.slice(0,ZA+65536),c=li(),tt=A=>{c.Accum=A},rt=A=>{c.XReg=A},ot=A=>{c.YReg=A},nt=A=>{c.cycleCount=A},Kn=A=>{Un(),Object.assign(c,A)},Un=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,UA(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},Yn=A=>{UA((c.PC+A+65536)%65536)},UA=A=>{c.PC=A},On=A=>{c.PStatus=A|48},Na=A=>(A&128?"N":"n")+(A&64?"V":"v")+"-"+(A&16?"B":"b")+(A&8?"D":"d")+(A&4?"I":"i")+(A&2?"Z":"z")+(A&1?"C":"c"),Ga=()=>`A=${M(c.Accum)} X=${M(c.XReg)} Y=${M(c.YReg)} P=${M(c.PStatus)} ${Na(c.PStatus)} S=${M(c.StackPtr)}`,YA=new Array(256).fill(""),Za=()=>YA.slice(0,256),Xa=A=>{YA.splice(0,A.length,...A)},xa=()=>{const A=to(256).slice(0,256),e=new Array;for(let t=255;t>c.StackPtr;t--){let n="$"+M(A[t]),i=YA[t];YA[t].length>3&&t-1>c.StackPtr&&(YA[t-1]==="JSR"||YA[t-1]==="BRK"||YA[t-1]==="IRQ"?(t--,n+=M(A[t])):i=""),n=(n+"   ").substring(0,6),e.push(M(256+t,4)+": "+n+i)}return e.join(`
`)},_a=()=>{const A=to(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const t=A[e];if(YA[e].startsWith("JSR")&&e-1>c.StackPtr&&YA[e-1]==="JSR"){const n=A[e-1]+1;return(t<<8)+n}}return-1},xA=(A,e)=>{YA[c.StackPtr]=A,m(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},_A=()=>{c.StackPtr=(c.StackPtr+1)%256;const A=B(256+c.StackPtr);if(isNaN(A))throw new Error("illegal stack value");return A},RA=()=>(c.PStatus&1)!==0,K=(A=!0)=>c.PStatus=A?c.PStatus|1:c.PStatus&254,Wn=()=>(c.PStatus&2)!==0,st=(A=!0)=>c.PStatus=A?c.PStatus|2:c.PStatus&253,Va=()=>(c.PStatus&4)!==0,no=(A=!0)=>c.PStatus=A?c.PStatus|4:c.PStatus&251,Nn=()=>(c.PStatus&8)!==0,nA=()=>Nn()?1:0,so=(A=!0)=>c.PStatus=A?c.PStatus|8:c.PStatus&247,io=(A=!0)=>c.PStatus=A?c.PStatus|16:c.PStatus&239,Gn=()=>(c.PStatus&64)!==0,it=(A=!0)=>c.PStatus=A?c.PStatus|64:c.PStatus&191,Zn=()=>(c.PStatus&128)!==0,Xn=(A=!0)=>c.PStatus=A?c.PStatus|128:c.PStatus&127,R=A=>{st(A===0),Xn(A>=128)},q=(A,e)=>(A+e+256)%256,k=(A,e)=>e*256+A,O=(A,e,t)=>(e*256+A+t+65536)%65536,z=(A,e)=>A>>8!==e>>8?1:0,VA=(A,e)=>{if(A){const t=c.PC;return Yn(e>127?e-256:e),3+z(t+2,c.PC+2)}return 2},H=new Array(256),h=(A,e,t,n,i,I=!1)=>{console.assert(!H[t],"Duplicate instruction: "+A+" mode="+e),H[t]={name:A,pcode:t,mode:e,bytes:n,execute:i,is6502:!I}},V=!0,$A=(A,e,t)=>{const n=B(A),i=B((A+1)%256),I=O(n,i,c.YReg);e(I);let C=5+z(I,k(n,i));return t&&(C+=nA()),C},Ae=(A,e,t)=>{const n=B(A),i=B((A+1)%256),I=k(n,i);e(I);let C=5;return t&&(C+=nA()),C},xn=A=>{let e=(c.Accum&15)+(A&15)+(RA()?1:0);e>=10&&(e+=6);let t=(c.Accum&240)+(A&240)+e;const n=c.Accum<=127&&A<=127,i=c.Accum>=128&&A>=128;it((t&255)>=128?n:i),K(t>=160),RA()&&(t+=96),c.Accum=t&255,R(c.Accum)},Kt=A=>{let e=c.Accum+A+(RA()?1:0);K(e>=256),e=e%256;const t=c.Accum<=127&&A<=127,n=c.Accum>=128&&A>=128;it(e>=128?t:n),c.Accum=e,R(c.Accum)},ee=A=>{Nn()?xn(B(A)):Kt(B(A))};h("ADC",s.IMM,105,2,A=>(nA()?xn(A):Kt(A),2+nA())),h("ADC",s.ZP_REL,101,2,A=>(ee(A),3+nA())),h("ADC",s.ZP_X,117,2,A=>(ee(q(A,c.XReg)),4+nA())),h("ADC",s.ABS,109,3,(A,e)=>(ee(k(A,e)),4+nA())),h("ADC",s.ABS_X,125,3,(A,e)=>{const t=O(A,e,c.XReg);return ee(t),4+nA()+z(t,k(A,e))}),h("ADC",s.ABS_Y,121,3,(A,e)=>{const t=O(A,e,c.YReg);return ee(t),4+nA()+z(t,k(A,e))}),h("ADC",s.IND_X,97,2,A=>{const e=q(A,c.XReg);return ee(k(B(e),B(e+1))),6+nA()}),h("ADC",s.IND_Y,113,2,A=>$A(A,ee,!0)),h("ADC",s.IND,114,2,A=>Ae(A,ee,!0),V);const te=A=>{c.Accum&=B(A),R(c.Accum)};h("AND",s.IMM,41,2,A=>(c.Accum&=A,R(c.Accum),2)),h("AND",s.ZP_REL,37,2,A=>(te(A),3)),h("AND",s.ZP_X,53,2,A=>(te(q(A,c.XReg)),4)),h("AND",s.ABS,45,3,(A,e)=>(te(k(A,e)),4)),h("AND",s.ABS_X,61,3,(A,e)=>{const t=O(A,e,c.XReg);return te(t),4+z(t,k(A,e))}),h("AND",s.ABS_Y,57,3,(A,e)=>{const t=O(A,e,c.YReg);return te(t),4+z(t,k(A,e))}),h("AND",s.IND_X,33,2,A=>{const e=q(A,c.XReg);return te(k(B(e),B(e+1))),6}),h("AND",s.IND_Y,49,2,A=>$A(A,te,!1)),h("AND",s.IND,50,2,A=>Ae(A,te,!1),V);const Ut=A=>{let e=B(A);B(A),K((e&128)===128),e=(e<<1)%256,m(A,e),R(e)};h("ASL",s.IMPLIED,10,1,()=>(K((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,R(c.Accum),2)),h("ASL",s.ZP_REL,6,2,A=>(Ut(A),5)),h("ASL",s.ZP_X,22,2,A=>(Ut(q(A,c.XReg)),6)),h("ASL",s.ABS,14,3,(A,e)=>(Ut(k(A,e)),6)),h("ASL",s.ABS_X,30,3,(A,e)=>{const t=O(A,e,c.XReg);return Ut(t),6+z(t,k(A,e))}),h("BCC",s.ZP_REL,144,2,A=>VA(!RA(),A)),h("BCS",s.ZP_REL,176,2,A=>VA(RA(),A)),h("BEQ",s.ZP_REL,240,2,A=>VA(Wn(),A)),h("BMI",s.ZP_REL,48,2,A=>VA(Zn(),A)),h("BNE",s.ZP_REL,208,2,A=>VA(!Wn(),A)),h("BPL",s.ZP_REL,16,2,A=>VA(!Zn(),A)),h("BVC",s.ZP_REL,80,2,A=>VA(!Gn(),A)),h("BVS",s.ZP_REL,112,2,A=>VA(Gn(),A)),h("BRA",s.ZP_REL,128,2,A=>VA(!0,A),V);const Yt=A=>{st((c.Accum&A)===0),Xn((A&128)!==0),it((A&64)!==0)};h("BIT",s.ZP_REL,36,2,A=>(Yt(B(A)),3)),h("BIT",s.ABS,44,3,(A,e)=>(Yt(B(k(A,e))),4)),h("BIT",s.IMM,137,2,A=>(st((c.Accum&A)===0),2),V),h("BIT",s.ZP_X,52,2,A=>(Yt(B(q(A,c.XReg))),4),V),h("BIT",s.ABS_X,60,3,(A,e)=>{const t=O(A,e,c.XReg);return Yt(B(t)),4+z(t,k(A,e))},V);const ao=(A,e,t=0)=>{const n=(c.PC+t)%65536,i=B(e),I=B(e+1);xA(`${A} $`+M(I)+M(i),Math.trunc(n/256)),xA(A,n%256),xA("P",c.PStatus),so(!1),no();const C=O(i,I,A==="BRK"?-1:0);UA(C)},_n=()=>(io(),ao("BRK",65534,2),7);h("BRK",s.IMPLIED,0,1,_n);const Ja=()=>Va()?0:(io(!1),ao("IRQ",65534),7),ja=()=>(ao("NMI",65530),7);h("CLC",s.IMPLIED,24,1,()=>(K(!1),2)),h("CLD",s.IMPLIED,216,1,()=>(so(!1),2)),h("CLI",s.IMPLIED,88,1,()=>(no(!1),2)),h("CLV",s.IMPLIED,184,1,()=>(it(!1),2));const ke=A=>{const e=B(A);K(c.Accum>=e),R((c.Accum-e+256)%256)},Ha=A=>{const e=B(A);K(c.Accum>=e),R((c.Accum-e+256)%256)};h("CMP",s.IMM,201,2,A=>(K(c.Accum>=A),R((c.Accum-A+256)%256),2)),h("CMP",s.ZP_REL,197,2,A=>(ke(A),3)),h("CMP",s.ZP_X,213,2,A=>(ke(q(A,c.XReg)),4)),h("CMP",s.ABS,205,3,(A,e)=>(ke(k(A,e)),4)),h("CMP",s.ABS_X,221,3,(A,e)=>{const t=O(A,e,c.XReg);return Ha(t),4+z(t,k(A,e))}),h("CMP",s.ABS_Y,217,3,(A,e)=>{const t=O(A,e,c.YReg);return ke(t),4+z(t,k(A,e))}),h("CMP",s.IND_X,193,2,A=>{const e=q(A,c.XReg);return ke(k(B(e),B(e+1))),6}),h("CMP",s.IND_Y,209,2,A=>$A(A,ke,!1)),h("CMP",s.IND,210,2,A=>Ae(A,ke,!1),V);const Vn=A=>{const e=B(A);K(c.XReg>=e),R((c.XReg-e+256)%256)};h("CPX",s.IMM,224,2,A=>(K(c.XReg>=A),R((c.XReg-A+256)%256),2)),h("CPX",s.ZP_REL,228,2,A=>(Vn(A),3)),h("CPX",s.ABS,236,3,(A,e)=>(Vn(k(A,e)),4));const Jn=A=>{const e=B(A);K(c.YReg>=e),R((c.YReg-e+256)%256)};h("CPY",s.IMM,192,2,A=>(K(c.YReg>=A),R((c.YReg-A+256)%256),2)),h("CPY",s.ZP_REL,196,2,A=>(Jn(A),3)),h("CPY",s.ABS,204,3,(A,e)=>(Jn(k(A,e)),4));const Ot=A=>{const e=q(B(A),-1);m(A,e),R(e)};h("DEC",s.IMPLIED,58,1,()=>(c.Accum=q(c.Accum,-1),R(c.Accum),2),V),h("DEC",s.ZP_REL,198,2,A=>(Ot(A),5)),h("DEC",s.ZP_X,214,2,A=>(Ot(q(A,c.XReg)),6)),h("DEC",s.ABS,206,3,(A,e)=>(Ot(k(A,e)),6)),h("DEC",s.ABS_X,222,3,(A,e)=>{const t=O(A,e,c.XReg);return B(t),Ot(t),7}),h("DEX",s.IMPLIED,202,1,()=>(c.XReg=q(c.XReg,-1),R(c.XReg),2)),h("DEY",s.IMPLIED,136,1,()=>(c.YReg=q(c.YReg,-1),R(c.YReg),2));const re=A=>{c.Accum^=B(A),R(c.Accum)};h("EOR",s.IMM,73,2,A=>(c.Accum^=A,R(c.Accum),2)),h("EOR",s.ZP_REL,69,2,A=>(re(A),3)),h("EOR",s.ZP_X,85,2,A=>(re(q(A,c.XReg)),4)),h("EOR",s.ABS,77,3,(A,e)=>(re(k(A,e)),4)),h("EOR",s.ABS_X,93,3,(A,e)=>{const t=O(A,e,c.XReg);return re(t),4+z(t,k(A,e))}),h("EOR",s.ABS_Y,89,3,(A,e)=>{const t=O(A,e,c.YReg);return re(t),4+z(t,k(A,e))}),h("EOR",s.IND_X,65,2,A=>{const e=q(A,c.XReg);return re(k(B(e),B(e+1))),6}),h("EOR",s.IND_Y,81,2,A=>$A(A,re,!1)),h("EOR",s.IND,82,2,A=>Ae(A,re,!1),V);const Wt=A=>{const e=q(B(A),1);m(A,e),R(e)};h("INC",s.IMPLIED,26,1,()=>(c.Accum=q(c.Accum,1),R(c.Accum),2),V),h("INC",s.ZP_REL,230,2,A=>(Wt(A),5)),h("INC",s.ZP_X,246,2,A=>(Wt(q(A,c.XReg)),6)),h("INC",s.ABS,238,3,(A,e)=>(Wt(k(A,e)),6)),h("INC",s.ABS_X,254,3,(A,e)=>{const t=O(A,e,c.XReg);return B(t),Wt(t),7}),h("INX",s.IMPLIED,232,1,()=>(c.XReg=q(c.XReg,1),R(c.XReg),2)),h("INY",s.IMPLIED,200,1,()=>(c.YReg=q(c.YReg,1),R(c.YReg),2)),h("JMP",s.ABS,76,3,(A,e)=>(UA(O(A,e,-3)),3)),h("JMP",s.IND,108,3,(A,e)=>{const t=k(A,e);return A=B(t),e=B((t+1)%65536),UA(O(A,e,-3)),6}),h("JMP",s.IND_X,124,3,(A,e)=>{const t=O(A,e,c.XReg);return A=B(t),e=B((t+1)%65536),UA(O(A,e,-3)),6},V),h("JSR",s.ABS,32,3,(A,e)=>{const t=(c.PC+2)%65536;return xA("JSR $"+M(e)+M(A),Math.trunc(t/256)),xA("JSR",t%256),UA(O(A,e,-3)),6});const oe=A=>{c.Accum=B(A),R(c.Accum)};h("LDA",s.IMM,169,2,A=>(c.Accum=A,R(c.Accum),2)),h("LDA",s.ZP_REL,165,2,A=>(oe(A),3)),h("LDA",s.ZP_X,181,2,A=>(oe(q(A,c.XReg)),4)),h("LDA",s.ABS,173,3,(A,e)=>(oe(k(A,e)),4)),h("LDA",s.ABS_X,189,3,(A,e)=>{const t=O(A,e,c.XReg);return oe(t),4+z(t,k(A,e))}),h("LDA",s.ABS_Y,185,3,(A,e)=>{const t=O(A,e,c.YReg);return oe(t),4+z(t,k(A,e))}),h("LDA",s.IND_X,161,2,A=>{const e=q(A,c.XReg);return oe(k(B(e),B((e+1)%256))),6}),h("LDA",s.IND_Y,177,2,A=>$A(A,oe,!1)),h("LDA",s.IND,178,2,A=>Ae(A,oe,!1),V);const Nt=A=>{c.XReg=B(A),R(c.XReg)};h("LDX",s.IMM,162,2,A=>(c.XReg=A,R(c.XReg),2)),h("LDX",s.ZP_REL,166,2,A=>(Nt(A),3)),h("LDX",s.ZP_Y,182,2,A=>(Nt(q(A,c.YReg)),4)),h("LDX",s.ABS,174,3,(A,e)=>(Nt(k(A,e)),4)),h("LDX",s.ABS_Y,190,3,(A,e)=>{const t=O(A,e,c.YReg);return Nt(t),4+z(t,k(A,e))});const Gt=A=>{c.YReg=B(A),R(c.YReg)};h("LDY",s.IMM,160,2,A=>(c.YReg=A,R(c.YReg),2)),h("LDY",s.ZP_REL,164,2,A=>(Gt(A),3)),h("LDY",s.ZP_X,180,2,A=>(Gt(q(A,c.XReg)),4)),h("LDY",s.ABS,172,3,(A,e)=>(Gt(k(A,e)),4)),h("LDY",s.ABS_X,188,3,(A,e)=>{const t=O(A,e,c.XReg);return Gt(t),4+z(t,k(A,e))});const Zt=A=>{let e=B(A);B(A),K((e&1)===1),e>>=1,m(A,e),R(e)};h("LSR",s.IMPLIED,74,1,()=>(K((c.Accum&1)===1),c.Accum>>=1,R(c.Accum),2)),h("LSR",s.ZP_REL,70,2,A=>(Zt(A),5)),h("LSR",s.ZP_X,86,2,A=>(Zt(q(A,c.XReg)),6)),h("LSR",s.ABS,78,3,(A,e)=>(Zt(k(A,e)),6)),h("LSR",s.ABS_X,94,3,(A,e)=>{const t=O(A,e,c.XReg);return Zt(t),6+z(t,k(A,e))}),h("NOP",s.IMPLIED,234,1,()=>2);const ne=A=>{c.Accum|=B(A),R(c.Accum)};h("ORA",s.IMM,9,2,A=>(c.Accum|=A,R(c.Accum),2)),h("ORA",s.ZP_REL,5,2,A=>(ne(A),3)),h("ORA",s.ZP_X,21,2,A=>(ne(q(A,c.XReg)),4)),h("ORA",s.ABS,13,3,(A,e)=>(ne(k(A,e)),4)),h("ORA",s.ABS_X,29,3,(A,e)=>{const t=O(A,e,c.XReg);return ne(t),4+z(t,k(A,e))}),h("ORA",s.ABS_Y,25,3,(A,e)=>{const t=O(A,e,c.YReg);return ne(t),4+z(t,k(A,e))}),h("ORA",s.IND_X,1,2,A=>{const e=q(A,c.XReg);return ne(k(B(e),B(e+1))),6}),h("ORA",s.IND_Y,17,2,A=>$A(A,ne,!1)),h("ORA",s.IND,18,2,A=>Ae(A,ne,!1),V),h("PHA",s.IMPLIED,72,1,()=>(xA("PHA",c.Accum),3)),h("PHP",s.IMPLIED,8,1,()=>(xA("PHP",c.PStatus|16),3)),h("PHX",s.IMPLIED,218,1,()=>(xA("PHX",c.XReg),3),V),h("PHY",s.IMPLIED,90,1,()=>(xA("PHY",c.YReg),3),V),h("PLA",s.IMPLIED,104,1,()=>(c.Accum=_A(),R(c.Accum),4)),h("PLP",s.IMPLIED,40,1,()=>(On(_A()),4)),h("PLX",s.IMPLIED,250,1,()=>(c.XReg=_A(),R(c.XReg),4),V),h("PLY",s.IMPLIED,122,1,()=>(c.YReg=_A(),R(c.YReg),4),V);const Xt=A=>{let e=B(A);B(A);const t=RA()?1:0;K((e&128)===128),e=(e<<1)%256|t,m(A,e),R(e)};h("ROL",s.IMPLIED,42,1,()=>{const A=RA()?1:0;return K((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|A,R(c.Accum),2}),h("ROL",s.ZP_REL,38,2,A=>(Xt(A),5)),h("ROL",s.ZP_X,54,2,A=>(Xt(q(A,c.XReg)),6)),h("ROL",s.ABS,46,3,(A,e)=>(Xt(k(A,e)),6)),h("ROL",s.ABS_X,62,3,(A,e)=>{const t=O(A,e,c.XReg);return Xt(t),6+z(t,k(A,e))});const xt=A=>{let e=B(A);B(A);const t=RA()?128:0;K((e&1)===1),e=e>>1|t,m(A,e),R(e)};h("ROR",s.IMPLIED,106,1,()=>{const A=RA()?128:0;return K((c.Accum&1)===1),c.Accum=c.Accum>>1|A,R(c.Accum),2}),h("ROR",s.ZP_REL,102,2,A=>(xt(A),5)),h("ROR",s.ZP_X,118,2,A=>(xt(q(A,c.XReg)),6)),h("ROR",s.ABS,110,3,(A,e)=>(xt(k(A,e)),6)),h("ROR",s.ABS_X,126,3,(A,e)=>{const t=O(A,e,c.XReg);return xt(t),6+z(t,k(A,e))}),h("RTI",s.IMPLIED,64,1,()=>(On(_A()),io(!1),UA(k(_A(),_A())-1),6)),h("RTS",s.IMPLIED,96,1,()=>(UA(k(_A(),_A())),6));const jn=A=>{const e=255-A;let t=c.Accum+e+(RA()?1:0);const n=t>=256,i=c.Accum<=127&&e<=127,I=c.Accum>=128&&e>=128;it(t%256>=128?i:I);const C=(c.Accum&15)-(A&15)+(RA()?0:-1);t=c.Accum-A+(RA()?0:-1),t<0&&(t-=96),C<0&&(t-=6),c.Accum=t&255,R(c.Accum),K(n)},se=A=>{nA()?jn(B(A)):Kt(255-B(A))};h("SBC",s.IMM,233,2,A=>(nA()?jn(A):Kt(255-A),2+nA())),h("SBC",s.ZP_REL,229,2,A=>(se(A),3+nA())),h("SBC",s.ZP_X,245,2,A=>(se(q(A,c.XReg)),4+nA())),h("SBC",s.ABS,237,3,(A,e)=>(se(k(A,e)),4+nA())),h("SBC",s.ABS_X,253,3,(A,e)=>{const t=O(A,e,c.XReg);return se(t),4+nA()+z(t,k(A,e))}),h("SBC",s.ABS_Y,249,3,(A,e)=>{const t=O(A,e,c.YReg);return se(t),4+nA()+z(t,k(A,e))}),h("SBC",s.IND_X,225,2,A=>{const e=q(A,c.XReg);return se(k(B(e),B(e+1))),6+nA()}),h("SBC",s.IND_Y,241,2,A=>$A(A,se,!0)),h("SBC",s.IND,242,2,A=>Ae(A,se,!0),V),h("SEC",s.IMPLIED,56,1,()=>(K(),2)),h("SED",s.IMPLIED,248,1,()=>(so(),2)),h("SEI",s.IMPLIED,120,1,()=>(no(),2)),h("STA",s.ZP_REL,133,2,A=>(m(A,c.Accum),3)),h("STA",s.ZP_X,149,2,A=>(m(q(A,c.XReg),c.Accum),4)),h("STA",s.ABS,141,3,(A,e)=>(m(k(A,e),c.Accum),4)),h("STA",s.ABS_X,157,3,(A,e)=>{const t=O(A,e,c.XReg);return B(t),m(t,c.Accum),5}),h("STA",s.ABS_Y,153,3,(A,e)=>(m(O(A,e,c.YReg),c.Accum),5)),h("STA",s.IND_X,129,2,A=>{const e=q(A,c.XReg);return m(k(B(e),B(e+1)),c.Accum),6});const Hn=A=>{m(A,c.Accum)};h("STA",s.IND_Y,145,2,A=>($A(A,Hn,!1),6)),h("STA",s.IND,146,2,A=>Ae(A,Hn,!1),V),h("STX",s.ZP_REL,134,2,A=>(m(A,c.XReg),3)),h("STX",s.ZP_Y,150,2,A=>(m(q(A,c.YReg),c.XReg),4)),h("STX",s.ABS,142,3,(A,e)=>(m(k(A,e),c.XReg),4)),h("STY",s.ZP_REL,132,2,A=>(m(A,c.YReg),3)),h("STY",s.ZP_X,148,2,A=>(m(q(A,c.XReg),c.YReg),4)),h("STY",s.ABS,140,3,(A,e)=>(m(k(A,e),c.YReg),4)),h("STZ",s.ZP_REL,100,2,A=>(m(A,0),3),V),h("STZ",s.ZP_X,116,2,A=>(m(q(A,c.XReg),0),4),V),h("STZ",s.ABS,156,3,(A,e)=>(m(k(A,e),0),4),V),h("STZ",s.ABS_X,158,3,(A,e)=>{const t=O(A,e,c.XReg);return B(t),m(t,0),5},V),h("TAX",s.IMPLIED,170,1,()=>(c.XReg=c.Accum,R(c.XReg),2)),h("TAY",s.IMPLIED,168,1,()=>(c.YReg=c.Accum,R(c.YReg),2)),h("TSX",s.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,R(c.XReg),2)),h("TXA",s.IMPLIED,138,1,()=>(c.Accum=c.XReg,R(c.Accum),2)),h("TXS",s.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),h("TYA",s.IMPLIED,152,1,()=>(c.Accum=c.YReg,R(c.Accum),2));const vn=A=>{const e=B(A);st((c.Accum&e)===0),m(A,e&~c.Accum)};h("TRB",s.ZP_REL,20,2,A=>(vn(A),5),V),h("TRB",s.ABS,28,3,(A,e)=>(vn(k(A,e)),6),V);const zn=A=>{const e=B(A);st((c.Accum&e)===0),m(A,e|c.Accum)};h("TSB",s.ZP_REL,4,2,A=>(zn(A),5),V),h("TSB",s.ABS,12,3,(A,e)=>(zn(k(A,e)),6),V);const va=[2,34,66,98,130,194,226],PA="???";va.forEach(A=>{h(PA,s.IMPLIED,A,2,()=>2),H[A].is6502=!1});for(let A=0;A<=15;A++)h(PA,s.IMPLIED,3+16*A,1,()=>1),H[3+16*A].is6502=!1,h(PA,s.IMPLIED,7+16*A,1,()=>1),H[7+16*A].is6502=!1,h(PA,s.IMPLIED,11+16*A,1,()=>1),H[11+16*A].is6502=!1,h(PA,s.IMPLIED,15+16*A,1,()=>1),H[15+16*A].is6502=!1;h(PA,s.IMPLIED,68,2,()=>3),H[68].is6502=!1,h(PA,s.IMPLIED,84,2,()=>4),H[84].is6502=!1,h(PA,s.IMPLIED,212,2,()=>4),H[212].is6502=!1,h(PA,s.IMPLIED,244,2,()=>4),H[244].is6502=!1,h(PA,s.IMPLIED,92,3,()=>8),H[92].is6502=!1,h(PA,s.IMPLIED,220,3,()=>4),H[220].is6502=!1,h(PA,s.IMPLIED,252,3,()=>4),H[252].is6502=!1;for(let A=0;A<256;A++)H[A]||(console.error("ERROR: OPCODE "+A.toString(16)+" should be implemented"),h("BRK",s.IMPLIED,A,1,_n));const za=()=>{const A=new Array(256);for(let e=0;e<256;e++)A[e]={name:H[e].name,mode:H[e].mode,pcode:H[e].pcode,bytes:H[e].bytes,is6502:H[e].is6502};l1(A)},CA=(A,e,t)=>{const n=e&7,i=e>>>3;return A[i]|=t>>>n,n&&(A[i+1]|=t<<8-n),e+8},_t=(A,e,t)=>(e=CA(A,e,t>>>1|170),e=CA(A,e,t|170),e),co=(A,e)=>(e=CA(A,e,255),e+2),$a=A=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],t=new Uint8Array(343),n=[0,2,1,3];for(let I=0;I<84;I++)t[I]=n[A[I]&3]|n[A[I+86]&3]<<2|n[A[I+172]&3]<<4;t[84]=n[A[84]&3]<<0|n[A[170]&3]<<2,t[85]=n[A[85]&3]<<0|n[A[171]&3]<<2;for(let I=0;I<256;I++)t[86+I]=A[I]>>>2;t[342]=t[341];let i=342;for(;i>1;)i--,t[i]^=t[i-1];for(let I=0;I<343;I++)t[I]=e[t[I]];return t},Ac=(A,e,t)=>{let n=0;const i=new Uint8Array(6646).fill(0);for(let I=0;I<16;I++)n=co(i,n);for(let I=0;I<16;I++){n=CA(i,n,213),n=CA(i,n,170),n=CA(i,n,150),n=_t(i,n,254),n=_t(i,n,e),n=_t(i,n,I),n=_t(i,n,254^e^I),n=CA(i,n,222),n=CA(i,n,170),n=CA(i,n,235);for(let D=0;D<7;D++)n=co(i,n);n=CA(i,n,213),n=CA(i,n,170),n=CA(i,n,173);const C=I===15?15:I*(t?8:7)%15,u=$a(A.slice(C*256,C*256+256));for(let D=0;D<u.length;D++)n=CA(i,n,u[D]);n=CA(i,n,222),n=CA(i,n,170),n=CA(i,n,235);for(let D=0;D<16;D++)n=co(i,n)}return i},ec=(A,e)=>{const t=A.length/4096;if(t<34||t>40)return new Uint8Array;const n=new Uint8Array(1536+t*13*512).fill(0);n.set(ve(`WOZ2ÿ
\r
`),0),n.set(ve("INFO"),12),n[16]=60,n[20]=2,n[21]=1,n[22]=0,n[23]=0,n[24]=1,n.fill(32,25,57),n.set(ve("Apple2TS (CT6502)"),25),n[57]=1,n[58]=0,n[59]=32,n[60]=0,n[62]=0,n[64]=13,n.set(ve("TMAP"),80),n[84]=160,n.fill(255,88,248);let i=0;for(let I=0;I<t;I++)i=88+(I<<2),I>0&&(n[i-1]=I),n[i]=n[i+1]=I;n.set(ve("TRKS"),248),n.set(Wo(1280+t*13*512),252);for(let I=0;I<t;I++){i=256+(I<<3),n.set(ui(3+I*13),i),n[i+2]=13,n.set(Wo(50304),i+4);const C=A.slice(I*16*256,(I+1)*16*256),u=Ac(C,I,e);i=1536+I*13*512,n.set(u,i)}return n},tc=(A,e)=>{if(!([87,79,90,50,255,10,13,10].find((u,D)=>u!==e[D])===void 0))return!1;A.isWriteProtected=e[22]===1,A.isSynchronized=e[23]===1,A.optimalTiming=e[59]>0?e[59]:32,A.optimalTiming!==32&&console.log(`${A.filename} optimal timing = ${A.optimalTiming}`);const i=e.slice(8,12),I=i[0]+(i[1]<<8)+(i[2]<<16)+i[3]*2**24,C=gi(e,12);if(I!==0&&I!==C)return alert("CRC checksum error: "+A.filename),!1;for(let u=0;u<160;u++){const D=e[88+u];if(D<255){const T=256+8*D,d=e.slice(T,T+8);A.trackStart[u]=512*((d[1]<<8)+d[0]),A.trackNbits[u]=d[4]+(d[5]<<8)+(d[6]<<16)+d[7]*2**24,A.maxQuarterTrack=u}}return!0},rc=(A,e)=>{if(!([87,79,90,49,255,10,13,10].find((i,I)=>i!==e[I])===void 0))return!1;A.isWriteProtected=e[22]===1;for(let i=0;i<160;i++){const I=e[88+i];if(I<255){A.trackStart[i]=256+I*6656;const C=e.slice(A.trackStart[i]+6646,A.trackStart[i]+6656);A.trackNbits[i]=C[2]+(C[3]<<8),A.maxQuarterTrack=i}}return!0},oc=A=>{const e=A.toLowerCase(),t=e.endsWith(".dsk")||e.endsWith(".do"),n=e.endsWith(".po");return t||n},nc=(A,e)=>{const n=A.filename.toLowerCase().endsWith(".po"),i=ec(e,n);return i.length===0?new Uint8Array:(A.filename=Ii(A.filename,"woz"),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),i)},sc=(A,e)=>{A.diskHasChanges=!1;const t=A.filename.toLowerCase();return e.length>1e4&&(No(t)&&(A.hardDrive=!0,A.status="",t.endsWith(".hdv")||t.endsWith(".po")||t.endsWith(".2meg")||t.endsWith(".2mg"))||((oc(A.filename)||e.length===143360)&&(e=nc(A,e)),tc(A,e))||rc(A,e))?e:(t!==""&&console.error(`Unknown disk format or unable to decode: ${A.filename} (${e.length} bytes).`),new Uint8Array)},ic=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Ke=0,fA=0,EA=0,Vt=!1,lo=!1;const ac=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],cc=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],lc=A=>{Vt=!1,os(A),A.quarterTrack=A.maxQuarterTrack,A.prevQuarterTrack=A.maxQuarterTrack},uc=(A=!1)=>{if(A){const e=vt();e.motorRunning&&ns(e)}else xe(ge.MOTOR_OFF)};let Jt=0;const Ic=(A,e,t)=>{Jt=0,A.prevQuarterTrack=A.quarterTrack,A.quarterTrack+=e,A.quarterTrack<0||A.quarterTrack>A.maxQuarterTrack?(xe(ge.TRACK_END),A.quarterTrack=Math.max(0,Math.min(A.quarterTrack,A.maxQuarterTrack))):xe(ge.TRACK_SEEK),A.status=` Trk ${A.quarterTrack/4}`,mA(),EA+=t,A.trackLocation+=Math.floor(EA/4),EA=EA%4,A.quarterTrack!=A.prevQuarterTrack&&(A.trackLocation=Math.floor(A.trackLocation*(A.trackNbits[A.quarterTrack]/A.trackNbits[A.prevQuarterTrack])))};let $n=0;const hc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],As=()=>($n++,hc[$n&31]);let jt=0;const gc=A=>(jt<<=1,jt|=A,jt&=15,jt===0?As():A),es=[128,64,32,16,8,4,2,1],pc=[127,191,223,239,247,251,253,254],Cc=(A,e)=>{const t=A.trackLocation;A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],t!==A.trackLocation&&(Jt>=9?(Jt=0,A.trackLocation+=4):Jt++);let n;if(A.trackStart[A.quarterTrack]>0){const i=A.trackStart[A.quarterTrack]+(A.trackLocation>>3),I=e[i],C=A.trackLocation&7;n=(I&es[C])>>7-C,n=gc(n)}else n=As();return A.trackLocation++,n},Sc=()=>Math.floor(256*Math.random()),ts=(A,e,t)=>{if(e.length===0)return Sc();let n=0;for(EA+=t;EA>=A.optimalTiming/8;){const i=Cc(A,e);if(fA&128&&!i||(fA&128&&(fA=0),fA=fA<<1|i),EA-=A.optimalTiming/8,fA&128&&EA<=A.optimalTiming/4)break}return EA<0&&(EA=0),fA&=255,n=fA,n};let ie=0;const uo=(A,e,t)=>{if(A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],A.trackStart[A.quarterTrack]>0){const n=A.trackStart[A.quarterTrack]+(A.trackLocation>>3);let i=e[n];const I=A.trackLocation&7;t?i|=es[I]:i&=pc[I],e[n]=i}A.trackLocation++},rs=(A,e,t)=>{if(!(e.length===0||A.trackStart[A.quarterTrack]===0)&&fA>0){if(t>=16)for(let n=7;n>=0;n--)uo(A,e,fA&2**n?1:0);t>=36&&uo(A,e,0),t>=40&&uo(A,e,0),Io.push(t>=40?2:t>=36?1:fA),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),fA=0}},os=A=>{Ke=0,Vt||(A.motorRunning=!1),mA(),xe(ge.MOTOR_OFF)},ns=A=>{Ke?(clearTimeout(Ke),Ke=0):EA=0,A.motorRunning=!0,mA(),xe(ge.MOTOR_ON)},fc=A=>{Ke===0&&(Ke=setTimeout(()=>os(A),1e3))};let Io=[];const Ht=A=>{Io.length>0&&A.quarterTrack===0&&(Io=[])},Ec=(A,e)=>{if(A>=49408)return-1;let t=vt();const n=mc();if(t.hardDrive)return 0;let i=0;const I=c.cycleCount-ie;switch(A=A&15,A){case 9:Vt=!0,ns(t),Ht(t);break;case 8:t.motorRunning&&!t.writeMode&&(i=ts(t,n,I),ie=c.cycleCount),Vt=!1,fc(t),Ht(t);break;case 10:case 11:{const C=A===10?2:3,u=vt();Dc(C),t=vt(),t!==u&&u.motorRunning&&(u.motorRunning=!1,t.motorRunning=!0,mA());break}case 12:lo=!1,t.motorRunning&&!t.writeMode&&(i=ts(t,n,I),ie=c.cycleCount);break;case 13:lo=!0,t.motorRunning&&(t.writeMode?(rs(t,n,I),ie=c.cycleCount,e>=0&&(fA=e)):(fA=0,EA+=I,t.trackLocation+=Math.floor(EA/4),EA=EA%4,ie=c.cycleCount,e>=0?console.log(`${t.filename}: Illegal LOAD of write data latch during read: PC=${M(c.PC)} Value=${M(e)}`):console.log(`${t.filename}: Illegal READ of write data latch during read: PC=${M(c.PC)}`)));break;case 14:t.motorRunning&&t.writeMode&&(rs(t,n,I),t.lastAppleWriteTime=Date.now(),ie=c.cycleCount),t.writeMode=!1,lo&&(i=t.isWriteProtected?255:0),Ht(t);break;case 15:t.writeMode=!0,ie=c.cycleCount,e>=0&&(fA=e);break;default:{if(A<0||A>7)break;const C=A/2;A%2?t.currentPhase|=1<<C:t.currentPhase&=~(1<<C);const D=ac[t.currentPhase];if(t.motorRunning&&D>=0){const T=t.quarterTrack&7,d=cc[T][D];Ic(t,d,I),ie=c.cycleCount}Ht(t);break}}return i},Bc=()=>{qe(6,Uint8Array.from(ic)),et(6,Ec)},JA=(A,e,t)=>({index:A,hardDrive:t,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:t?Array():Array(160).fill(0),trackNbits:t?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),ss=()=>{y[0]=JA(0,1,!0),y[1]=JA(1,2,!0),y[2]=JA(2,1,!1),y[3]=JA(3,2,!1);for(let A=0;A<y.length;A++)jA[A]=new Uint8Array},y=[],jA=[];ss();let we=2;const Dc=A=>{we=A},vt=()=>y[we],mc=()=>jA[we],ho=A=>y[A==2?1:0],zt=A=>{const e=jA[A==2?1:0];let t="";for(let i=0;i<4;i++)t+=String.fromCharCode(e[i]);const n=t==="2IMG"?64:0;return[e,n,e.length-n]},at=[],mA=()=>{for(let A=0;A<y.length;A++){if(y[A].filename===""&&!y[A].cloudData&&at[A]&&at[A].diskHasChanges===y[A].diskHasChanges&&at[A].motorRunning===y[A].motorRunning&&at[A].status===y[A].status)continue;const e={index:A,hardDrive:y[A].hardDrive,drive:y[A].drive,filename:y[A].filename,status:y[A].status,motorRunning:y[A].motorRunning,diskHasChanges:y[A].diskHasChanges,isWriteProtected:y[A].isWriteProtected,diskData:y[A].diskHasChanges&&!y[A].motorRunning?jA[A]:new Uint8Array,lastAppleWriteTime:y[A].lastAppleWriteTime,lastLocalFileWriteTime:y[A].lastLocalFileWriteTime,cloudData:y[A].cloudData,writableFileHandle:y[A].writableFileHandle};o1(e),at[A]={diskHasChanges:e.diskHasChanges,motorRunning:e.motorRunning,status:e.status}}},kc=A=>{const e=["","",""];for(let n=0;n<y.length;n++)(A||jA[n].length<32e6)&&(e[n]=Fe.Buffer.from(jA[n]).toString("base64"));const t={currentDrive:we,driveState:[JA(0,1,!0),JA(1,2,!0),JA(2,1,!1),JA(3,2,!1)],driveData:e};for(let n=0;n<y.length;n++)t.driveState[n]={...y[n]};return t},wc=A=>{xe(ge.MOTOR_OFF),we=A.currentDrive,A.driveState.length===3&&we>0&&we++,ss();let e=0;for(let t=0;t<A.driveState.length;t++)y[e]={...A.driveState[t]},A.driveData[t]!==""&&(jA[e]=new Uint8Array(Fe.Buffer.from(A.driveData[t],"base64"))),A.driveState.length===3&&t===0&&(e=1),e++;mA()},dc=()=>{for(let A=0;A<y.length;A++)y[A].hardDrive||lc(y[A]);mA()},is=(A=!1)=>{uc(A),mA()},Tc=(A,e=!1)=>{let t=A.index,n=A.drive,i=A.hardDrive;if(e||A.filename!==""&&(No(A.filename)?(i=!0,t=A.drive<=1?0:1,n=t+1):(i=!1,t=A.drive<=1?2:3,n=t-1)),y[t]=JA(t,n,i),y[t].filename=A.filename,jA[t]=sc(y[t],A.diskData),jA[t].length===0){y[t].filename="",mA();return}y[t].motorRunning=A.motorRunning,y[t].cloudData=A.cloudData,y[t].writableFileHandle=A.writableFileHandle,y[t].lastLocalFileWriteTime=A.lastLocalFileWriteTime,mA()},yc=A=>{const e=A.index;y[e].filename=A.filename,y[e].motorRunning=A.motorRunning,y[e].isWriteProtected=A.isWriteProtected,y[e].diskHasChanges=A.diskHasChanges,y[e].lastAppleWriteTime=A.lastAppleWriteTime,y[e].lastLocalFileWriteTime=A.lastLocalFileWriteTime,y[e].cloudData=A.cloudData,y[e].writableFileHandle=A.writableFileHandle,mA()},de={OVRN:4,RX_FULL:8,IRQ:128,HW_RESET:16},ct={BAUD_RATE:15,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Te={RX_INT_DIS:2,TX_INT_EN:4,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0};class Rc{_control;_status;_command;_lastRead;_lastConfig;_receiveBuffer;_extFuncs;buffer(e){for(let n=0;n<e.length;n++)this._receiveBuffer.push(e[n]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let n=0;n<t;n++)this._receiveBuffer.shift(),this._status|=de.OVRN;this._status|=de.RX_FULL,(this._control&Te.RX_INT_DIS)==0&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&Te.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-8,this._receiveBuffer.length?(this._status|=de.RX_FULL,(this._control&Te.RX_INT_DIS)==0&&this.irq(!0)):this._status&=-9,this._lastRead}set control(e){this._control=e,this.configChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.configChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&de.IRQ&&this.irq(!1),this._status&=-129,e}set status(e){this.reset()}irq(e){e?this._status|=de.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&ct.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ct.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ct.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Te.PARITY_EN)switch(this._command&Te.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}configChange(e){let t=!1;e.baud!=this._lastConfig.baud&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.configChange(this._lastConfig))}reset(){this._control=ct.HW_RESET,this._command=Te.HW_RESET,this._status=de.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=ct.HW_RESET,this._command=Te.HW_RESET,this._status=de.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}}const go=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let $t=1,TA;const Pc=A=>{At($t,A)},Qc=A=>{console.log("ConfigChange: ",A)},Fc=A=>{TA&&TA.buffer(A)},Lc=()=>{TA&&TA.reset()},Mc=(A=!0,e=1)=>{if(!A)return;$t=e;const t={sendData:s1,interrupt:Pc,configChange:Qc};TA=new Rc(t);const n=new Uint8Array(go.length+256);n.set(go.slice(1792,2048)),n.set(go,256),qe($t,n),et($t,bc)},bc=(A,e=-1)=>{if(A>=49408)return-1;const t={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(A&15){case t.DIPSW1:return 226;case t.DIPSW2:return 40;case t.IOREG:if(e>=0)TA.data=e;else return TA.data;break;case t.STATUS:if(e>=0)TA.status=e;else return TA.status;break;case t.COMMAND:if(e>=0)TA.command=e;else return TA.command;break;case t.CONTROL:if(e>=0)TA.control=e;else return TA.control;break;default:console.log("SSC unknown softswitch",(A&15).toString(16));break}return-1},lt=(A,e)=>String(A).padStart(e,"0");(()=>{const A=new Uint8Array(256).fill(96);return A[0]=8,A[2]=40,A[4]=88,A[6]=112,A})();const qc=()=>{const A=new Date,e=lt(A.getMonth()+1,2)+","+lt(A.getDay(),2)+","+lt(A.getDate(),2)+","+lt(A.getHours(),2)+","+lt(A.getMinutes(),2);for(let t=0;t<e.length;t++)m(512+t,e.charCodeAt(t)|128)};let Ar=!1;const as=A=>{const e=A.split(","),t=e[0].split(/([+-])/);return{label:t[0]?t[0]:"",operation:t[1]?t[1]:"",value:t[2]?parseInt(t[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},cs=A=>{let e=s.IMPLIED,t=-1;if(A.length>0){A.startsWith("#")?(e=s.IMM,A=A.substring(1)):A.startsWith("(")?(A.endsWith(",Y")?e=s.IND_Y:A.endsWith(",X)")?e=s.IND_X:e=s.IND,A=A.substring(1)):A.endsWith(",X")?e=A.length>5?s.ABS_X:s.ZP_X:A.endsWith(",Y")?e=A.length>5?s.ABS_Y:s.ZP_Y:e=A.length>3?s.ABS:s.ZP_REL,A.startsWith("$")&&(A="0x"+A.substring(1)),t=parseInt(A);const n=as(A);if(n.operation&&n.value){switch(n.operation){case"+":t+=n.value;break;case"-":t-=n.value;break;default:console.error("Unknown operation in operand: "+A)}t=(t%65536+65536)%65536}}return[e,t]};let ye={};const ls=(A,e,t,n)=>{let i=s.IMPLIED,I=-1;if(t.match(/^[#]?[$0-9()]+/))return Object.entries(ye).forEach(([u,D])=>{t=t.replace(new RegExp(`\\b${u}\\b`,"g"),"$"+M(D))}),cs(t);const C=as(t);if(C.label){const u=C.label.startsWith("<"),D=C.label.startsWith(">"),T=C.label.startsWith("#")||D||u;if(T&&(C.label=C.label.substring(1)),C.label in ye?(I=ye[C.label],D?I=I>>8&255:u&&(I=I&255)):n===2&&console.error("Missing label: "+C.label),C.operation&&C.value){switch(C.operation){case"+":I+=C.value;break;case"-":I-=C.value;break;default:console.error("Unknown operation in operand: "+t)}I=(I%65536+65536)%65536}Rr(e)?(i=s.ZP_REL,I=I-A+254,I>255&&(I-=256)):T?i=s.IMM:(i=I>=0&&I<=255?s.ZP_REL:s.ABS,i=C.idx==="X"?i===s.ABS?s.ABS_X:s.ZP_X:i,i=C.idx==="Y"?i===s.ABS?s.ABS_Y:s.ZP_Y:i)}return[i,I]},Kc=(A,e)=>{A=A.replace(/\s+/g," ");const t=A.split(" ");return{label:t[0]?t[0]:e,instr:t[1]?t[1]:"",operand:t[2]?t[2]:""}},Uc=(A,e)=>{if(A.label in ye&&console.error("Redefined label: "+A.label),A.instr==="EQU"){const[t,n]=ls(e,A.instr,A.operand,2);t!==s.ABS&&t!==s.ZP_REL&&console.error("Illegal EQU value: "+A.operand),ye[A.label]=n}else ye[A.label]=e},Yc=A=>{const e=[];switch(A.instr){case"ASC":case"DA":{let t=A.operand,n=0;t.startsWith('"')&&t.endsWith('"')?n=128:t.startsWith("'")&&t.endsWith("'")?n=0:console.error("Invalid string: "+t),t=t.substring(1,t.length-1);for(let i=0;i<t.length;i++)e.push(t.charCodeAt(i)|n);e.push(0);break}case"HEX":{(A.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(i=>{const I=parseInt(i,16);isNaN(I)&&console.error(`Invalid HEX value: ${i} in ${A.operand}`),e.push(I)});break}default:console.error("Unknown pseudo ops: "+A.instr);break}return e},Oc=(A,e)=>{const t=[],n=H[A];return t.push(A),e>=0&&(t.push(e%256),n.bytes===3&&t.push(Math.trunc(e/256))),t};let po=0;const us=(A,e)=>{let t=po;const n=[];let i="";if(A.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;let C=(I+"                   ").slice(0,30)+M(t,4)+"- ";const u=Kc(I,i);if(i="",!u.instr){i=u.label;return}if(u.instr==="ORG"){if(e===1){const[x,w]=cs(u.operand);x===s.ABS&&(po=w,t=w)}Ar&&e===2&&console.log(C);return}if(e===1&&u.label&&Uc(u,t),u.instr==="EQU")return;let D=[],T,d;if(["ASC","DA","HEX"].includes(u.instr))D=Yc(u),t+=D.length;else if([T,d]=ls(t,u.instr,u.operand,e),e===2&&isNaN(d)&&console.error(`Unknown/illegal value: ${I}`),u.instr==="DB")D.push(d&255),t++;else if(u.instr==="DW")D.push(d&255),D.push(d>>8&255),t+=2;else if(u.instr==="DS")for(let x=0;x<d;x++)D.push(0),t++;else{e===2&&Rr(u.instr)&&(d<0||d>255)&&console.error(`Branch instruction out of range: ${I} value: ${d} pass: ${e}`);const x=H.findIndex(w=>w&&w.name===u.instr&&w.mode===T);x<0&&console.error(`Unknown instruction: "${I}" mode=${T} pass=${e}`),D=Oc(x,d),t+=H[x].bytes}Ar&&e===2&&(D.forEach(x=>{C+=` ${M(x)}`}),console.log(C)),n.push(...D)}),Ar&&e===2){let I="";n.forEach(C=>{I+=` ${M(C)}`}),console.log(I)}return n},er=(A,e,t=!1)=>{ye={},Ar=t;try{return po=A,us(e,1),us(e,2)}catch(n){return console.error(n),[]}},Wc=`
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
`;let Re=49286,tr=49289,rr=49291,or=49292,nr=49293,sr=49294,ir=49295;const Is=(A,e,t,n,i)=>{const I=A&255,C=A>>8&3,u=e&255,D=e>>8&3;Z(t,I),Z(n,C<<4|D),Z(i,u)},hs=(A,e,t)=>{const n=pA(A),i=pA(e),I=pA(t),C=i>>4&3,u=i&3;return[n|C<<8,I|u<<8]},ar=()=>hs(tr,rr,or),Co=()=>hs(nr,sr,ir),cr=(A,e)=>{Is(A,e,tr,rr,or)},lr=(A,e)=>{Is(A,e,nr,sr,ir)},ur=A=>{Z(Re,A),xs(!!A)},Nc=()=>{FA=0,LA=0,cr(0,1023),lr(0,1023),ur(0),lA=0,ae=0,Ue=0,ut=0,It=0,kA=0,OA=0,Ye=0,Ir=0};let FA=0,LA=0,Ir=0,lA=0,ae=0,Ue=0,ut=0,It=0,kA=0,OA=0,Ye=0,gs=0,IA=5;const hr=54,gr=55,Gc=56,Zc=57,ps=()=>{const A=new Uint8Array(256).fill(0),e=er(0,Wc.split(`
`));return A.set(e,0),A[251]=214,A[255]=1,A},Xc=(A=!0,e=5)=>{if(!A)return;IA=e;const t=49152+IA*256,n=49152+IA*256+8;qe(IA,ps(),t,Vc),qe(IA,ps(),n,qc),et(IA,Hc),Re=49280+(Re&15)+IA*16,tr=49280+(tr&15)+IA*16,rr=49280+(rr&15)+IA*16,or=49280+(or&15)+IA*16,nr=49280+(nr&15)+IA*16,sr=49280+(sr&15)+IA*16,ir=49280+(ir&15)+IA*16;const[i,I]=ar();i===0&&I===0&&(cr(0,1023),lr(0,1023)),pA(Re)!==0&&xs(!0)},xc=()=>{const A=pA(Re);if(A&1){let e=!1;A&8&&(Ye|=8,e=!0),A&ae&4&&(Ye|=4,e=!0),A&ae&2&&(Ye|=2,e=!0),e&&At(IA,!0)}},_c=A=>{if(pA(Re)&1)if(A.buttons>=0){switch(A.buttons){case 0:lA&=-129;break;case 16:lA|=128;break;case 1:lA&=-17;break;case 17:lA|=16;break}ae|=lA&128?4:0}else{if(A.x>=0&&A.x<=1){const[t,n]=ar();FA=Math.round((n-t)*A.x+t),ae|=2}if(A.y>=0&&A.y<=1){const[t,n]=Co();LA=Math.round((n-t)*A.y+t),ae|=2}}};let ht=0,So="",Cs=0,Ss=0;const Vc=()=>{const A=192+IA;B(gr)===A&&B(hr)===0?jc():B(Zc)===A&&B(Gc)===0&&Jc()},Jc=()=>{if(ht===0){const A=192+IA;Cs=B(gr),Ss=B(hr),m(gr,A),m(hr,3);const e=(lA&128)!==(Ue&128);let t=0;lA&128?t=e?2:1:t=e?3:4,B(49152)&128&&(t=-t),Ue=lA,So=FA.toString()+","+LA.toString()+","+t.toString()}ht>=So.length?(c.Accum=141,ht=0,m(gr,Cs),m(hr,Ss)):(c.Accum=So.charCodeAt(ht)|128,ht++)},jc=()=>{switch(c.Accum){case 128:console.log("mouse off"),ur(0);break;case 129:console.log("mouse on"),ur(1);break}},Hc=(A,e)=>{if(A>=49408)return-1;const t=e<0,n={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(A&15){case n.LOWX:if(t)return FA&255;kA=kA&65280|e,kA&=65535;break;case n.HIGHX:if(t)return FA>>8&255;kA=e<<8|kA&255,kA&=65535;break;case n.LOWY:if(t)return LA&255;OA=OA&65280|e,OA&=65535;break;case n.HIGHY:if(t)return LA>>8&255;OA=e<<8|OA&255,OA&=65535;break;case n.STATUS:return lA;case n.MODE:if(t)return pA(Re);ur(e);break;case n.CLAMP:if(t){const[I,C]=ar(),[u,D]=Co();switch(Ir){case 0:return I>>8&255;case 1:return u>>8&255;case 2:return I&255;case 3:return u&255;case 4:return C>>8&255;case 5:return D>>8&255;case 6:return C&255;case 7:return D&255;default:return console.log("AppleMouse: invalid clamp index: "+Ir),0}}Ir=78-e;break;case n.CLOCK:case n.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case n.COMMAND:if(t)return gs;switch(gs=e,e){case i.INIT:FA=0,LA=0,ut=0,It=0,cr(0,1023),lr(0,1023),lA=0,ae=0;break;case i.READ:ae=0,lA&=-112,lA|=Ue>>1&64,lA|=Ue>>4&1,Ue=lA,(ut!==FA||It!==LA)&&(lA|=32,ut=FA,It=LA);break;case i.CLEAR:console.log("cmd.clear"),FA=0,LA=0,ut=0,It=0;break;case i.SERVE:lA&=-15,lA|=Ye,Ye=0,At(IA,!1);break;case i.HOME:{const[I]=ar(),[C]=Co();FA=I,LA=C}break;case i.CLAMPX:{const I=kA>32767?kA-65536:kA,C=OA;cr(I,C),console.log(I+" -> "+C)}break;case i.CLAMPY:{const I=kA>32767?kA-65536:kA,C=OA;lr(I,C),console.log(I+" -> "+C)}break;case i.GCLAMP:console.log("cmd.getclamp");break;case i.POS:FA=kA,LA=OA;break}break;default:console.log("AppleMouse unknown IO addr",A.toString(16));break}return e},Oe={RX_FULL:1,TX_EMPTY:2,OVRN:32,IRQ:128},HA={COUNTER_DIV1:1,COUNTER_DIV2:2,TX_INT_ENABLE:32,NRTS:64,RX_INT_ENABLE:128};class vc{_control;_status;_lastRead;_receiveBuffer;_extFuncs;buffer(e){for(let n=0;n<e.length;n++)this._receiveBuffer.push(e[n]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let n=0;n<t;n++)this._receiveBuffer.shift(),this._status|=Oe.OVRN;this._status|=Oe.RX_FULL,this._control&HA.RX_INT_ENABLE&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),(this._control&(HA.TX_INT_ENABLE|HA.NRTS))===HA.TX_INT_ENABLE&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-113,this._receiveBuffer.length?(this._status|=Oe.RX_FULL,this._control&HA.RX_INT_ENABLE&&this.irq(!0)):(this._status&=-2,this.irq(!1)),this._lastRead}set control(e){this._control=e,(this._control&(HA.COUNTER_DIV1|HA.COUNTER_DIV2))===(HA.COUNTER_DIV1|HA.COUNTER_DIV2)&&this.reset()}get status(){const e=this._status;return this._status&Oe.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Oe.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Oe.TX_EMPTY,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this.reset()}}const WA={IRQ_ENABLE:64,COUNTER_MODE:56,INTERNAL_CLOCK:2,SPECIAL:1},fs={ANY_IRQ:128};class fo{_latch;_count;_control;decrement(e){return(this._control&WA.INTERNAL_CLOCK)==0||this._count===65535?!1:(this._count-=e,this._count<0?(this._count=65535,!0):!1)}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&WA.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch}reset(){this._latch=65535,this._control=0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0}}class zc{_timer;_status;_statusRead;_msb;_lsb;_div8;_interrupt;status(){return this._statusRead=!!this._status,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&WA.SPECIAL?0:2),this._timer[e].control=t}timerLSBw(e,t){const n=this._timer[0].control&WA.SPECIAL,i=this._msb*256+t;this._timer[e].latch=i,n&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){const n=this._timer[0].control&WA.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=n&255,this._statusRead&&(this._statusRead=!1,this.irq(e,!1)),n>>8&255}update(e){const t=this._timer[0].control&WA.SPECIAL;if(this._div8+=e,t)this._status&&(this.irq(0,!1),this.irq(1,!1),this.irq(2,!1));else{let n=!1;for(let i=0;i<3;i++){let I=e;if(i==2&&this._timer[2].control&WA.SPECIAL&&(this._div8>8?(I=1,this._div8%=8):I=0),n=this._timer[i].decrement(I),n){const C=this._timer[i].control;switch(C&WA.IRQ_ENABLE&&this.irq(i,!0),C&WA.COUNTER_MODE){case 0:case 16:this._timer[i].reload();break}}}}}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=WA.SPECIAL}irq(e,t){const n=1<<e|fs.ANY_IRQ;t?this._status|=n:this._status&=~n,this._status?(this._status|=fs.ANY_IRQ,this._interrupt(!0)):(this._status&=-129,this._interrupt(!1))}constructor(e){this._interrupt=e,this._status=0,this._statusRead=!1,this._timer=[new fo,new fo,new fo],this._msb=this._lsb=0,this._div8=0,this.reset()}}let pr=2,sA,ce,Eo=0;const $c=A=>{if(Eo){const e=c.cycleCount-Eo;sA.update(e)}Eo=c.cycleCount},Es=A=>{At(pr,A)},Al=A=>{ce&&ce.buffer(A)},el=(A=!0,e=2)=>{if(!A)return;pr=e,sA=new zc(Es);const t={sendData:i1,interrupt:Es};ce=new vc(t),et(pr,rl),kn($c,pr)},tl=()=>{sA&&(sA.reset(),ce.reset())},rl=(A,e=-1)=>{if(A>=49408)return-1;const t={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let n=-1;switch(A&15){case t.SDMIDIDATA:case t.ACIADATA:e>=0?ce.data=e:n=ce.data;break;case t.SDMIDICTRL:case t.ACIASTATCTRL:e>=0?ce.control=e:n=ce.status;break;case t.TCONTROL1:e>=0?sA.timerControl(0,e):n=0;break;case t.TCONTROL2:e>=0?sA.timerControl(1,e):n=sA.status();break;case t.T1MSB:e>=0?sA.timerMSBw(0,e):n=sA.timerMSBr(0);break;case t.T1LSB:e>=0?sA.timerLSBw(0,e):n=sA.timerLSBr(0);break;case t.T2MSB:e>=0?sA.timerMSBw(1,e):n=sA.timerMSBr(1);break;case t.T2LSB:e>=0?sA.timerLSBw(1,e):n=sA.timerLSBr(1);break;case t.T3MSB:e>=0?sA.timerMSBw(2,e):n=sA.timerMSBr(2);break;case t.T3LSB:e>=0?sA.timerLSBw(2,e):n=sA.timerLSBr(2);break;case t.DRUMSET:case t.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(A&15).toString(16));break}return n},ol=(A=!0,e=4)=>{A&&(et(e,Dl),kn(Cl,e))},Bo=[0,128],Do=[1,129],nl=[2,130],sl=[3,131],We=[4,132],Ne=[5,133],Cr=[6,134],mo=[7,135],gt=[8,136],pt=[9,137],il=[10,138],ko=[11,139],al=[12,140],Pe=[13,141],Ct=[14,142],Bs=[16,145],Ds=[17,145],NA=[18,146],wo=[32,160],vA=64,le=32,cl=(A=4)=>{for(let e=0;e<=255;e++)Y(A,e,0);for(let e=0;e<=1;e++)To(A,e)},ll=(A,e)=>(_(A,Ct[e])&vA)!==0,ul=(A,e)=>(_(A,NA[e])&vA)!==0,ms=(A,e)=>(_(A,ko[e])&vA)!==0,Il=(A,e,t)=>{let n=_(A,We[e])-t;if(Y(A,We[e],n),n<0){n=n%256+256,Y(A,We[e],n);let i=_(A,Ne[e]);if(i--,Y(A,Ne[e],i),i<0&&(i+=256,Y(A,Ne[e],i),ll(A,e)&&(!ul(A,e)||ms(A,e)))){const I=_(A,NA[e]);Y(A,NA[e],I|vA);const C=_(A,Pe[e]);if(Y(A,Pe[e],C|vA),ue(A,e,-1),ms(A,e)){const u=_(A,mo[e]),D=_(A,Cr[e]);Y(A,We[e],D),Y(A,Ne[e],u)}}}},hl=(A,e)=>(_(A,Ct[e])&le)!==0,gl=(A,e)=>(_(A,NA[e])&le)!==0,pl=(A,e,t)=>{if((_(A,ko[e])&le)!==0)return;let n=_(A,gt[e])-t;if(Y(A,gt[e],n),n<0){n=n%256+256,Y(A,gt[e],n);let i=_(A,pt[e]);if(i--,Y(A,pt[e],i),i<0&&(i+=256,Y(A,pt[e],i),hl(A,e)&&!gl(A,e))){const I=_(A,NA[e]);Y(A,NA[e],I|le);const C=_(A,Pe[e]);Y(A,Pe[e],C|le),ue(A,e,-1)}}},ks=new Array(8).fill(0),Cl=A=>{const e=c.cycleCount-ks[A];for(let t=0;t<=1;t++)Il(A,t,e),pl(A,t,e);ks[A]=c.cycleCount},Sl=(A,e)=>{const t=[];for(let n=0;n<=15;n++)t[n]=_(A,wo[e]+n);return t},fl=(A,e)=>A.length===e.length&&A.every((t,n)=>t===e[n]),Ge={slot:-1,chip:-1,params:[-1]};let To=(A,e)=>{const t=Sl(A,e);A===Ge.slot&&e===Ge.chip&&fl(t,Ge.params)||(Ge.slot=A,Ge.chip=e,Ge.params=t,n1({slot:A,chip:e,params:t}))};const El=(A,e)=>{switch(_(A,Bo[e])&7){case 0:for(let n=0;n<=15;n++)Y(A,wo[e]+n,0);To(A,e);break;case 7:Y(A,Ds[e],_(A,Do[e]));break;case 6:{const n=_(A,Ds[e]),i=_(A,Do[e]);n>=0&&n<=15&&(Y(A,wo[e]+n,i),To(A,e));break}}},ue=(A,e,t)=>{let n=_(A,Pe[e]);switch(t>=0&&(n&=127-(t&127),Y(A,Pe[e],n)),e){case 0:At(A,n!==0);break;case 1:Ca(n!==0);break}},Bl=(A,e,t)=>{let n=_(A,Ct[e]);t>=0&&(t=t&255,t&128?n|=t:n&=255-t),n|=128,Y(A,Ct[e],n)},Dl=(A,e=-1)=>{if(A<49408)return-1;const t=(A&3840)>>8,n=A&255,i=n&128?1:0;switch(n){case Bo[i]:e>=0&&(Y(t,Bo[i],e),El(t,i));break;case Do[i]:case nl[i]:case sl[i]:case il[i]:case ko[i]:case al[i]:Y(t,n,e);break;case We[i]:e>=0&&Y(t,Cr[i],e),ue(t,i,vA);break;case Ne[i]:if(e>=0){Y(t,mo[i],e),Y(t,We[i],_(t,Cr[i])),Y(t,Ne[i],e);const I=_(t,NA[i]);Y(t,NA[i],I&~vA),ue(t,i,vA)}break;case Cr[i]:e>=0&&(Y(t,n,e),ue(t,i,vA));break;case mo[i]:e>=0&&Y(t,n,e);break;case gt[i]:e>=0&&Y(t,Bs[i],e),ue(t,i,le);break;case pt[i]:if(e>=0){Y(t,pt[i],e),Y(t,gt[i],_(t,Bs[i]));const I=_(t,NA[i]);Y(t,NA[i],I&~le),ue(t,i,le)}break;case Pe[i]:e>=0&&ue(t,i,e);break;case Ct[i]:Bl(t,i,e);break}return-1};let Ze=0;const Sr=192,ml=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${M(Sr)}   ; jump address
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
`,kl=`
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
`,wl=()=>{const A=new Uint8Array(256).fill(0),e=er(0,ml.split(`
`));A.set(e,0);const t=er(0,kl.split(`
`));return A.set(t,Sr),A[254]=23,A[255]=Sr,A};let St=new Uint8Array;const yo=(A=!0)=>{St.length===0&&(St=wl()),St[1]=A?32:0;const t=49152+Sr+7*256;qe(7,St,t,Pl),qe(7,St,t+3,Rl)},dl=(A,e)=>{if(A===0)m(e,2);else if(A<=2){m(e,240);const[,,t]=zt(A),n=t/512;m(e+1,n&255),m(e+2,n>>>8),m(e+3,0),rt(4),ot(0)}else tt(40),rt(0),ot(0),K()},Tl=(A,e)=>{const[,,t]=zt(A),n=t/512,i=n>1600?2:1,I=i==2?32:64;m(e,240),m(e+1,n&255),m(e+2,n>>>8),m(e+3,0);const C="Apple2TS SP";m(e+4,C.length);let u=0;for(;u<C.length;u++)m(e+5+u,C.charCodeAt(u));for(;u<16;u++)m(e+5+u,C.charCodeAt(8));m(e+21,i),m(e+22,I),m(e+23,1),m(e+24,0),rt(25),ot(0)},yl=(A,e,t)=>{if(B(A)!==3){console.error(`Incorrect SmartPort parameter count at address ${A}`),tt(4),K();return}const n=B(A+4);switch(n){case 0:dl(e,t);break;case 1:case 2:tt(33),K();break;case 3:case 4:Tl(e,t);break;default:console.error(`SmartPort statusCode ${n} not implemented`);break}},Rl=()=>{tt(0),K(!1);const A=256+c.StackPtr,e=B(A+1)+256*B(A+2),t=B(e+1),n=B(e+2)+256*B(e+3),i=B(n+1),I=B(n+2)+256*B(n+3);switch(t){case 0:{yl(n,i,I);return}case 1:{if(B(n)!==3){console.error(`Incorrect SmartPort parameter count at address ${n}`),K();return}const D=512*(B(n+4)+256*B(n+5)+65536*B(n+6)),[T,d]=zt(i),G=T.slice(D+d,D+512+d);ro(I,G);break}default:console.error(`SmartPort command ${t} not implemented`),K();return}const C=ho(i);C.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,C&&(C.motorRunning=!1),mA()},500)),mA()},Pl=()=>{tt(0),K(!1);const A=B(66),e=Math.max(Math.min(B(67)>>6,2),0),t=ho(e);if(!t.hardDrive)return;const[n,i,I]=zt(e),C=B(70)+256*B(71),u=512*C,D=B(68)+256*B(69);switch(t.status=` ${M(C,4)}`,A){case 0:{if(t.filename.length===0||I===0){rt(0),ot(0),K();return}const T=I/512;rt(T&255),ot(T>>>8);break}case 1:{if(u+512>I){K();return}const T=n.slice(u+i,u+512+i);ro(D,T);break}case 2:{if(u+512>I){K();return}if(t.isWriteProtected){K();return}const T=to(D);n.set(T,u+i),t.diskHasChanges=!0,t.lastAppleWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),K();return;default:console.error("unknown hard drive command"),K();return}K(!1),t.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,t&&(t.motorRunning=!1),mA()},500)),mA()},ws=`
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
`;let ds=0,fr=0,ft=0,Er=0,Ts=ii,Ro="default",Po=!1,ys=16.6881,Qo=17030,Rs=0,tA=W.IDLE,Ie="APPLE2EE",Xe=0,Br=!1,wA=0;const X=[];let Et=0;const Ql=()=>{f.VBL.isSet=!0,xc()},Fl=()=>{f.VBL.isSet=!1},Ps=()=>{const A={};for(const e in f)A[e]=f[e].isSet;return A},Ll=()=>{const A=JSON.parse(JSON.stringify(c));let e=ZA;for(let n=ZA;n<Q.length;n++)Q[n]!==255&&(n+=255-n%256,e=n+1);const t=Fe.Buffer.from(Q.slice(0,e));return{s6502:A,extraRamSize:64*(KA+1),machineName:Ie,softSwitches:Ps(),stackDump:Za(),memory:t.toString("base64")}},Ml=(A,e)=>{const t=JSON.parse(JSON.stringify(A.s6502));Kn(t);const n=A.softSwitches;for(const I in n){const C=I;try{f[C].isSet=n[I]}catch{}}"WRITEBSR1"in n&&(f.BSR_PREWRITE.isSet=!1,f.BSR_WRITE.isSet=n.WRITEBSR1||n.WRITEBSR2||n.RDWRBSR1||n.RDWRBSR2);const i=new Uint8Array(Fe.Buffer.from(A.memory,"base64"));if(e<1){Q.set(i.slice(0,65536)),Q.set(i.slice(131072,163584),65536),Q.set(i.slice(65536,131072),ZA);const I=(i.length-163584)/1024;I>0&&(Hr(I+64),Q.set(i.slice(163584),ZA+65536))}else Hr(A.extraRamSize),Q.set(i);A.stackDump&&Xa(A.stackDump),Ie=A.machineName||"APPLE2EE",Lo(Ie,!1),XA(),Or(!0)},Fo=A=>({emulator:null,state6502:Ll(),driveState:kc(A),thumbnail:"",snapshots:null}),bl=()=>{const A=Fo(!0);return A.snapshots=X,A},ql=A=>{Kn(A),bA()},Kl=A=>{nt(A),bA()},Ul=A=>{Po=A,bA()},Dr=(A,e=!1)=>{kr();const t=A.emulator?.version?A.emulator.version:.9;Ml(A.state6502,t),wc(A.driveState),e&&(X.length=0,wA=0),A.snapshots&&(X.length=0,X.push(...A.snapshots),wA=X.length),bA()};let Qs=!1;const Fs=()=>{Qs||(Qs=!0,Mc(),el(!0,2),ol(!0,4),Xc(!0,5),Bc(),yo(),za())},Yl=()=>{dc(),qr(),Nc(),tl(),Lc(),cl(4)},mr=()=>{if(nt(0),ba(),Fn(Ie),Fs(),ws.length>0){const e=er(768,ws.split(`
`));Q.set(e,768)}kr(),Or(!0),ho(1).filename===""&&(yo(!1),setTimeout(()=>{yo()},200))},kr=()=>{Sa(),ea(),B(49282),Un(),Yl()},Ol=A=>{ft=A,ys=ft===4?1:16.6881,Qo=17030*[.1,.5,1,2,3,4,4][ft+2],Us()},Wl=A=>{Ro=A},Nl=()=>Ro==="game"||Ro==="embed",Gl=A=>{Ts=A,bA()},Zl=(A,e)=>{A>>8===192?m(A,e):Q[A]=e,bA()},Lo=(A,e=!0)=>{Ie!==A&&(Ie=A,Fn(Ie),e&&kr(),bA())},Xl=A=>{Hr(A),bA()},Ls=()=>{const A=wA-1;return A<0||!X[A]?-1:A},Ms=()=>{const A=wA+1;return A>=X.length||!X[A]?-1:A},bs=()=>{X.length===ai&&X.shift(),X.push(Fo(!1)),wA=X.length,a1(X[X.length-1].state6502.s6502.PC)},xl=()=>{let A=Ls();A<0||(MA(W.PAUSED),setTimeout(()=>{wA===X.length&&(bs(),A=Math.max(wA-2,0)),wA=A,Dr(X[wA])},50))},_l=()=>{const A=Ms();A<0||(MA(W.PAUSED),setTimeout(()=>{wA=A,Dr(X[A])},50))},Vl=A=>{A<0||A>=X.length||(MA(W.PAUSED),setTimeout(()=>{wA=A,Dr(X[A])},50))},Jl=()=>{const A=[];for(let e=0;e<X.length;e++)A[e]={s6502:X[e].state6502.s6502,thumbnail:X[e].thumbnail};return A},jl=A=>{X.length>0&&(X[X.length-1].thumbnail=A)};let wr=null;const Mo=(A=!1)=>{wr&&clearTimeout(wr),A?wr=setTimeout(()=>{Br=!0,wr=null},100):Br=!0},qs=()=>{Ft(),tA===W.IDLE&&(mr(),tA=W.PAUSED),xr(),MA(W.PAUSED)},Hl=()=>{Ft(),tA===W.IDLE&&(mr(),tA=W.PAUSED),B(c.PC,!1)===32?(xr(),Ks()):qs()},Ks=()=>{Ft(),tA===W.IDLE&&(mr(),tA=W.PAUSED),Ia(),MA(W.RUNNING)},Us=()=>{Xe=0,fr=performance.now(),ds=fr},MA=(A,e=!0)=>{if(Fs(),e&&tA===W.RUNNING&&A===W.PAUSED&&(Po=!0),tA=A,tA===W.PAUSED)na(),Et&&(clearInterval(Et),Et=0),is();else if(tA===W.RUNNING){for(is(!0),Ft();X.length>0&&wA<X.length-1;)X.pop();wA=X.length,Et||(Et=setInterval(Or,1e3))}bA(),Us(),Er===0&&(Er=1,Ns())},Ys=A=>{tA===W.IDLE?(MA(W.NEED_BOOT),setTimeout(()=>{MA(W.NEED_RESET),setTimeout(()=>{A()},200)},200)):A()},vl=(A,e,t)=>{Ys(()=>{ro(A,e),t&&UA(A)})},zl=A=>{Ys(()=>{vi(A)})},$l=()=>tA===W.PAUSED?Wa():new Uint8Array,A1=()=>tA!==W.IDLE?xa():"";let Os=!1;const bA=()=>{const A={addressGetTable:oA,altChar:f.ALTCHARSET.isSet,breakpoints:cA,button0:f.PB0.isSet,button1:f.PB1.isSet,canGoBackward:Ls()>=0,canGoForward:Ms()>=0,c800Slot:Jr(),cout:B(57)<<8|B(56),cpuSpeed:Er,extraRamSize:64*(KA+1),hires:Ya(),iTempState:wA,isDebugging:Ts,lores:Ao(!0),machineName:Ie,memoryDump:$l(),noDelayMode:!f.COLUMN80.isSet&&f.DHIRES.isSet,ramWorksBank:me(),runMode:tA,s6502:c,showDebugTab:Po,softSwitches:Ps(),speedMode:ft,stackString:A1(),textPage:Ao(),timeTravelThumbnails:Jl(),zeroPage:Oa()};t1(A),Os||(Os=!0,c1(oa()))},e1=A=>{if(A)for(let e=0;e<A.length;e++)ta(A[e]);else ra();A&&(A[0]<=49167||A[0]>=49232)&&XA(),bA()},Ws=()=>{const A=performance.now();if(Rs=A-fr,Rs<ys||(fr=A,tA===W.IDLE||tA===W.PAUSED))return;tA===W.NEED_BOOT?(mr(),MA(W.RUNNING)):tA===W.NEED_RESET&&(kr(),MA(W.RUNNING));let e=0;for(;;){const n=xr();if(n<0||(e+=n,e<4550?f.VBL.isSet||Ql():Fl(),e>=Qo))break}Xe++;const t=Xe*Qo/(performance.now()-ds);Er=t<1e4?Math.round(t/10)/100:Math.round(t/100)/10,Xe%2&&(Bi(),bA()),Br&&(Br=!1,bs())},Ns=()=>{Ws();const A=Xe+[1,1,1,5,5,5,10][ft+2];for(;tA===W.RUNNING&&Xe!==A;)Ws();setTimeout(Ns,tA===W.RUNNING?0:20)},BA=(A,e)=>{try{self.postMessage({msg:A,payload:e})}catch(t){console.error(`worker2main: doPostMessage error: ${t}`)}},t1=A=>{BA(gA.MACHINE_STATE,A)},r1=A=>{BA(gA.CLICK,A)},o1=A=>{BA(gA.DRIVE_PROPS,A)},xe=A=>{BA(gA.DRIVE_SOUND,A)},Gs=A=>{BA(gA.SAVE_STATE,A)},dr=A=>{BA(gA.RUMBLE,A)},Zs=A=>{BA(gA.HELP_TEXT,A)},Xs=A=>{BA(gA.ENHANCED_MIDI,A)},xs=A=>{BA(gA.SHOW_APPLE_MOUSE,A)},n1=A=>{BA(gA.MBOARD_SOUND,A)},s1=A=>{BA(gA.COMM_DATA,A)},i1=A=>{BA(gA.MIDI_DATA,A)},a1=A=>{BA(gA.REQUEST_THUMBNAIL,A)},c1=A=>{BA(gA.SOFTSWITCH_DESCRIPTIONS,A)},l1=A=>{BA(gA.INSTRUCTIONS,A)};typeof self<"u"&&(self.onmessage=A=>{if(!(!A.data||typeof A.data!="object")&&"msg"in A.data)switch(A.data.msg){case L.RUN_MODE:MA(A.data.payload);break;case L.STATE6502:ql(A.data.payload);break;case L.DEBUG:Gl(A.data.payload);break;case L.APP_MODE:Wl(A.data.payload);break;case L.SHOW_DEBUG_TAB:Ul(A.data.payload);break;case L.BREAKPOINTS:ga(A.data.payload);break;case L.STEP_INTO:qs();break;case L.STEP_OVER:Hl();break;case L.STEP_OUT:Ks();break;case L.BASIC_STEP:ha();break;case L.SPEED:Ol(A.data.payload);break;case L.TIME_TRAVEL_STEP:A.data.payload==="FORWARD"?_l():xl();break;case L.TIME_TRAVEL_INDEX:Vl(A.data.payload);break;case L.TIME_TRAVEL_SNAPSHOT:Mo();break;case L.THUMBNAIL_IMAGE:jl(A.data.payload);break;case L.RESTORE_STATE:Dr(A.data.payload,!0);break;case L.KEYPRESS:Hi(A.data.payload);break;case L.KEYRELEASE:ji();break;case L.MOUSEEVENT:_c(A.data.payload);break;case L.PASTE_TEXT:zl(A.data.payload);break;case L.APPLE_PRESS:vo(!0,A.data.payload);break;case L.APPLE_RELEASE:vo(!1,A.data.payload);break;case L.GET_SAVE_STATE:Gs(Fo(!0));break;case L.GET_SAVE_STATE_SNAPSHOTS:Gs(bl());break;case L.DRIVE_PROPS:{const e=A.data.payload;yc(e);break}case L.DRIVE_NEW_DATA:{const e=A.data.payload;Tc(e);break}case L.GAMEPAD:fi(A.data.payload);break;case L.SET_BINARY_BLOCK:{const e=A.data.payload;vl(e.address,e.data,e.run);break}case L.SET_CYCLECOUNT:Kl(A.data.payload);break;case L.SET_MEMORY:{const e=A.data.payload;Zl(e.address,e.value);break}case L.COMM_DATA:Fc(A.data.payload);break;case L.MIDI_DATA:Al(A.data.payload);break;case L.RAMWORKS:Xl(A.data.payload);break;case L.MACHINE_NAME:Lo(A.data.payload);break;case L.SOFTSWITCHES:e1(A.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(A.data)}`);break}})})();
