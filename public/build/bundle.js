var app=function(){"use strict";function n(){}function t(n){return n()}function e(){return Object.create(null)}function o(n){n.forEach(t)}function r(n){return"function"==typeof n}function i(n,t){return n!=n?t==t:n!==t||n&&"object"==typeof n||"function"==typeof n}function a(n,t){n.appendChild(t)}function c(n,t,e){n.insertBefore(t,e||null)}function u(n){n.parentNode.removeChild(n)}function l(n){return document.createElement(n)}function f(n){return document.createTextNode(n)}function s(){return f(" ")}function d(n,t,e,o){return n.addEventListener(t,e,o),()=>n.removeEventListener(t,e,o)}function m(n,t){t=""+t,n.data!==t&&(n.data=t)}function g(n,t,e,o){n.style.setProperty(t,e,o?"important":"")}let p;function x(n){p=n}function $(n){(function(){if(!p)throw new Error("Function called outside component initialization");return p})().$$.on_mount.push(n)}const h=[],A=[],w=[],y=[],b=Promise.resolve();let v=!1;function _(n){w.push(n)}function E(n){y.push(n)}let j=!1;const k=new Set;function F(){if(!j){j=!0;do{for(let n=0;n<h.length;n+=1){const t=h[n];x(t),H(t.$$)}for(h.length=0;A.length;)A.pop()();for(let n=0;n<w.length;n+=1){const t=w[n];k.has(t)||(k.add(t),t())}w.length=0}while(h.length);for(;y.length;)y.pop()();v=!1,j=!1,k.clear()}}function H(n){if(null!==n.fragment){n.update(),o(n.before_update);const t=n.dirty;n.dirty=[-1],n.fragment&&n.fragment.p(n.ctx,t),n.after_update.forEach(_)}}const N=new Set;function W(n,t){n&&n.i&&(N.delete(n),n.i(t))}const q="undefined"!=typeof window?window:global;function z(n,t,e){const o=n.$$.props[t];void 0!==o&&(n.$$.bound[o]=e,e(n.$$.ctx[o]))}function C(n,e,i){const{fragment:a,on_mount:c,on_destroy:u,after_update:l}=n.$$;a&&a.m(e,i),_(()=>{const e=c.map(t).filter(r);u?u.push(...e):o(e),n.$$.on_mount=[]}),l.forEach(_)}function L(n,t){const e=n.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(t),e.on_destroy=e.fragment=null,e.ctx=[])}function O(n,t){-1===n.$$.dirty[0]&&(h.push(n),v||(v=!0,b.then(F)),n.$$.dirty.fill(0)),n.$$.dirty[t/31|0]|=1<<t%31}function P(t,r,i,a,c,l,f=[-1]){const s=p;x(t);const d=r.props||{},m=t.$$={fragment:null,ctx:null,props:l,update:n,not_equal:c,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(s?s.$$.context:[]),callbacks:e(),dirty:f};let g=!1;if(m.ctx=i?i(t,d,(n,e,...o)=>{const r=o.length?o[0]:e;return m.ctx&&c(m.ctx[n],m.ctx[n]=r)&&(m.bound[n]&&m.bound[n](r),g&&O(t,n)),e}):[],m.update(),g=!0,o(m.before_update),m.fragment=!!a&&a(m.ctx),r.target){if(r.hydrate){const n=function(n){return Array.from(n.childNodes)}(r.target);m.fragment&&m.fragment.l(n),n.forEach(u)}else m.fragment&&m.fragment.c();r.intro&&W(t.$$.fragment),C(t,r.target,r.anchor),F()}x(s)}class S{$destroy(){L(this,1),this.$destroy=n}$on(n,t){const e=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return e.push(t),()=>{const n=e.indexOf(t);-1!==n&&e.splice(n,1)}}$set(){}}let B=function(n,t,e){return n<t?t:n>e?e:n};function M(t){let e;return{c(){var n,o,r;e=l("span"),n=e,o="class",null==(r="dot svelte-1y9zjco")?n.removeAttribute(o):n.getAttribute(o)!==r&&n.setAttribute(o,r),g(e,"width",T+"px"),g(e,"height",T+"px"),g(e,"transform","translate( "+(t[0]-T/2)+"px, "+(t[1]-T/2)+"px )")},m(n,t){c(n,e,t)},p(n,[t]){3&t&&g(e,"transform","translate( "+(n[0]-T/2)+"px, "+(n[1]-T/2)+"px )")},i:n,o:n,d(n){n&&u(e)}}}let T=48;function X(n,t,e){let o,r,{x:i}=t,{y:a}=t;return n.$set=n=>{"x"in n&&e(2,i=n.x),"y"in n&&e(3,a=n.y)},n.$$.update=()=>{4&n.$$.dirty&&e(0,o=B((i+1)/2*window.innerWidth,T/2,window.innerWidth-T/2)),8&n.$$.dirty&&e(1,r=B((a+1)/2*window.innerHeight,T/2,window.innerHeight-T/2))},[o,r,i,a]}class Y extends S{constructor(n){super(),P(this,n,X,M,i,{x:2,y:3})}}const{window:D}=q;function G(n){let t,e,r,i,g,p,x,$,h,w;function y(t){n[10].call(null,t)}function b(t){n[11].call(null,t)}let v={};void 0!==n[0]&&(v.x=n[0]),void 0!==n[1]&&(v.y=n[1]);const _=new Y({props:v});return A.push(()=>z(_,"x",y)),A.push(()=>z(_,"y",b)),{c(){var o;t=s(),e=l("p"),r=f(n[0]),i=f(" / "),g=f(n[1]),p=s(),(o=_.$$.fragment)&&o.c(),document.title="A003"},m(u,l,f){c(u,t,l),c(u,e,l),a(e,r),a(e,i),a(e,g),c(u,p,l),C(_,u,l),h=!0,f&&o(w),w=[d(D,"mousemove",n[2]),d(D,"deviceorientation",n[3])]},p(n,[t]){(!h||1&t)&&m(r,n[0]),(!h||2&t)&&m(g,n[1]);const e={};!x&&1&t&&(x=!0,e.x=n[0],E(()=>x=!1)),!$&&2&t&&($=!0,e.y=n[1],E(()=>$=!1)),_.$set(e)},i(n){h||(W(_.$$.fragment,n),h=!0)},o(n){!function(n,t,e,o){if(n&&n.o){if(N.has(n))return;N.add(n),(void 0).c.push(()=>{N.delete(n),o&&(e&&n.d(1),o())}),n.o(t)}}(_.$$.fragment,n),h=!1},d(n){n&&u(t),n&&u(e),n&&u(p),L(_,n),o(w)}}}function I(n,t,e){let o={damping:4,maxAngle:60},r="mouse",i=0,a=0,c=0,u=0,l=0,f=0;return $(()=>{let n;return function t(){n=requestAnimationFrame(t),c=i-l,u=a-f,e(0,l+=c/o.damping),e(1,f+=u/o.damping)}(),()=>{cancelAnimationFrame(n)}}),[l,f,function(n){"mouse"===r&&(i=2*(n.clientX/window.innerWidth-.5),a=2*(n.clientY/window.innerHeight-.5))},function(n){r="orientation";let t=void 0!==window.orientation?window.orientation:0;0===t?(i=B(n.gamma,-1*o.maxAngle,o.maxAngle)/o.maxAngle,a=B(n.beta,-1*o.maxAngle,o.maxAngle)/o.maxAngle):180===t?(i=B(n.gamma,-1*o.maxAngle,o.maxAngle)/o.maxAngle,a=B(-n.beta,-1*o.maxAngle,o.maxAngle)/o.maxAngle):90===t?(i=B(n.beta,-1*o.maxAngle,o.maxAngle)/o.maxAngle,a=B(-n.gamma,-1*o.maxAngle,o.maxAngle)/o.maxAngle):-90===t&&(i=B(-n.beta,-1*o.maxAngle,o.maxAngle)/o.maxAngle,a=B(n.gamma,-1*o.maxAngle,o.maxAngle)/o.maxAngle)},r,i,a,c,u,o,function(n){l=n,e(0,l)},function(n){f=n,e(1,f)}]}return new class extends S{constructor(n){super(),P(this,n,I,G,i,{})}}({target:document.body,props:{name:"a003"}})}();
//# sourceMappingURL=bundle.js.map
