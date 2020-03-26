
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    let Utils = {
      clamp: function( value, min, max ) {
        if( value < min) {
          return min;
        } else if (value > max) {
          return max;
        }

        return value;
      },

      lerp: function(value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
      },

      easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInCubic: t => t * t * t,
        easeOutCubic: t => --t * t * t + 1,
        easeInOutCubic: t =>
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - --t * t * t * t,
        easeInOutQuart: t =>
          t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + --t * t * t * t * t,
        easeInOutQuint: t =>
          t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
      }
    };

    /* src/Dot.svelte generated by Svelte v3.20.1 */
    const file = "src/Dot.svelte";

    function create_fragment(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "dot svelte-vt84qd");
    			set_style(span, "width", /*size*/ ctx[2] + "px");
    			set_style(span, "height", /*size*/ ctx[2] + "px");
    			set_style(span, "transform", "translate( " + (/*xAbsolute*/ ctx[0] - /*size*/ ctx[2] / 2) + "px, " + (/*yAbsolute*/ ctx[1] - /*size*/ ctx[2] / 2) + "px )");
    			add_location(span, file, 13, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*xAbsolute, yAbsolute*/ 3) {
    				set_style(span, "transform", "translate( " + (/*xAbsolute*/ ctx[0] - /*size*/ ctx[2] / 2) + "px, " + (/*yAbsolute*/ ctx[1] - /*size*/ ctx[2] / 2) + "px )");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { x } = $$props;
    	let { y } = $$props;
    	let size = 48;
    	const writable_props = ["x", "y"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dot> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dot", $$slots, []);

    	$$self.$set = $$props => {
    		if ("x" in $$props) $$invalidate(3, x = $$props.x);
    		if ("y" in $$props) $$invalidate(4, y = $$props.y);
    	};

    	$$self.$capture_state = () => ({ Utils, x, y, size, xAbsolute, yAbsolute });

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(3, x = $$props.x);
    		if ("y" in $$props) $$invalidate(4, y = $$props.y);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("xAbsolute" in $$props) $$invalidate(0, xAbsolute = $$props.xAbsolute);
    		if ("yAbsolute" in $$props) $$invalidate(1, yAbsolute = $$props.yAbsolute);
    	};

    	let xAbsolute;
    	let yAbsolute;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x*/ 8) {
    			 $$invalidate(0, xAbsolute = Utils.clamp((x + 1) / 2 * window.innerWidth, size / 2, window.innerWidth - size / 2));
    		}

    		if ($$self.$$.dirty & /*y*/ 16) {
    			 $$invalidate(1, yAbsolute = Utils.clamp((y + 1) / 2 * window.innerHeight, size / 2, window.innerHeight - size / 2));
    		}
    	};

    	return [xAbsolute, yAbsolute, size, x, y];
    }

    class Dot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { x: 3, y: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dot",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[3] === undefined && !("x" in props)) {
    			console.warn("<Dot> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[4] === undefined && !("y" in props)) {
    			console.warn("<Dot> was created without expected prop 'y'");
    		}
    	}

    	get x() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Synth.svelte generated by Svelte v3.20.1 */

    const { console: console_1, window: window_1 } = globals;
    const file$1 = "src/Synth.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Start";
    			attr_dev(button, "class", "start svelte-hv7iqx");
    			add_location(button, file$1, 98, 0, 1399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window_1, "touchstart", /*onTouchStart*/ ctx[0], false, false, false),
    				listen_dev(window_1, "touchend", /*onTouchEnd*/ ctx[1], false, false, false),
    				listen_dev(button, "click", onClick, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onClick() {
    	console.log("Synth.onClick()");
    	Tone.start();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { x } = $$props;
    	let { y } = $$props;

    	const settings = {
    		baseNote: 261.6256, // C4
    		noteRange: 200
    	};

    	let synth;

    	function onTouchStart() {
    		console.log("Synth.onTouchStart()");
    		synth.triggerAttack(settings.baseNote + y * settings.noteRange);
    		window.navigator.vibrate(100);
    	}

    	function onTouchEnd() {
    		console.log("Synth.onTouchEnd()");
    		synth.triggerRelease();
    	}

    	onMount(() => {
    		console.log("Synth.onMount()");
    		let interval;

    		synth = new Tone.Synth({
    				oscillator: { type: triangle },
    				envelope: {
    					attack: 0.000001,
    					decay: 0.1,
    					sustain: 0.3,
    					release: 1
    				}
    			}).toMaster();

    		console.log(synth);

    		interval = setInterval(
    			() => {
    				synth.frequency.rampTo(settings.baseNote + y * settings.noteRange, 0.5);
    			},
    			400
    		);

    		// onUnmount
    		return () => {
    			synth.triggerRelease();
    			clearInterval(interval);
    		};
    	});

    	const writable_props = ["x", "y"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Synth> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Synth", $$slots, []);

    	$$self.$set = $$props => {
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		x,
    		y,
    		settings,
    		synth,
    		onClick,
    		onTouchStart,
    		onTouchEnd
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    		if ("synth" in $$props) synth = $$props.synth;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onTouchStart, onTouchEnd, x, y];
    }

    class Synth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { x: 2, y: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Synth",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[2] === undefined && !("x" in props)) {
    			console_1.warn("<Synth> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[3] === undefined && !("y" in props)) {
    			console_1.warn("<Synth> was created without expected prop 'y'");
    		}
    	}

    	get x() {
    		throw new Error("<Synth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Synth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Synth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Synth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { window: window_1$1 } = globals;
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let t0;
    	let p;
    	let t1_value = Math.round(/*x*/ ctx[0] * 1000) / 1000 + "";
    	let t1;
    	let t2;
    	let t3_value = Math.round(/*y*/ ctx[1] * 1000) / 1000 + "";
    	let t3;
    	let t4;
    	let updating_x;
    	let updating_y;
    	let t5;
    	let updating_x_1;
    	let updating_y_1;
    	let current;
    	let dispose;

    	function dot_x_binding(value) {
    		/*dot_x_binding*/ ctx[10].call(null, value);
    	}

    	function dot_y_binding(value) {
    		/*dot_y_binding*/ ctx[11].call(null, value);
    	}

    	let dot_props = {};

    	if (/*x*/ ctx[0] !== void 0) {
    		dot_props.x = /*x*/ ctx[0];
    	}

    	if (/*y*/ ctx[1] !== void 0) {
    		dot_props.y = /*y*/ ctx[1];
    	}

    	const dot = new Dot({ props: dot_props, $$inline: true });
    	binding_callbacks.push(() => bind(dot, "x", dot_x_binding));
    	binding_callbacks.push(() => bind(dot, "y", dot_y_binding));

    	function synth_x_binding(value) {
    		/*synth_x_binding*/ ctx[12].call(null, value);
    	}

    	function synth_y_binding(value) {
    		/*synth_y_binding*/ ctx[13].call(null, value);
    	}

    	let synth_props = {};

    	if (/*x*/ ctx[0] !== void 0) {
    		synth_props.x = /*x*/ ctx[0];
    	}

    	if (/*y*/ ctx[1] !== void 0) {
    		synth_props.y = /*y*/ ctx[1];
    	}

    	const synth = new Synth({ props: synth_props, $$inline: true });
    	binding_callbacks.push(() => bind(synth, "x", synth_x_binding));
    	binding_callbacks.push(() => bind(synth, "y", synth_y_binding));

    	const block = {
    		c: function create() {
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = text(" — ");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(dot.$$.fragment);
    			t5 = space();
    			create_component(synth.$$.fragment);
    			document.title = "A003";
    			attr_dev(p, "class", "log svelte-xacozf");
    			add_location(p, file$2, 93, 0, 2292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(dot, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(synth, target, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window_1$1, "mousemove", /*onMousemove*/ ctx[2], false, false, false),
    				listen_dev(window_1$1, "deviceorientation", /*onDeviceOrientation*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*x*/ 1) && t1_value !== (t1_value = Math.round(/*x*/ ctx[0] * 1000) / 1000 + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*y*/ 2) && t3_value !== (t3_value = Math.round(/*y*/ ctx[1] * 1000) / 1000 + "")) set_data_dev(t3, t3_value);
    			const dot_changes = {};

    			if (!updating_x && dirty & /*x*/ 1) {
    				updating_x = true;
    				dot_changes.x = /*x*/ ctx[0];
    				add_flush_callback(() => updating_x = false);
    			}

    			if (!updating_y && dirty & /*y*/ 2) {
    				updating_y = true;
    				dot_changes.y = /*y*/ ctx[1];
    				add_flush_callback(() => updating_y = false);
    			}

    			dot.$set(dot_changes);
    			const synth_changes = {};

    			if (!updating_x_1 && dirty & /*x*/ 1) {
    				updating_x_1 = true;
    				synth_changes.x = /*x*/ ctx[0];
    				add_flush_callback(() => updating_x_1 = false);
    			}

    			if (!updating_y_1 && dirty & /*y*/ 2) {
    				updating_y_1 = true;
    				synth_changes.y = /*y*/ ctx[1];
    				add_flush_callback(() => updating_y_1 = false);
    			}

    			synth.$set(synth_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dot.$$.fragment, local);
    			transition_in(synth.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dot.$$.fragment, local);
    			transition_out(synth.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			destroy_component(dot, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(synth, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let settings = { damping: 4, maxAngle: 60 };
    	let mode = "mouse";

    	//
    	// -1 ... 1
    	// 
    	let xInput = 0;

    	let yInput = 0;
    	let xDelta = 0;
    	let yDelta = 0;
    	let x = 0;
    	let y = 0;

    	function onMousemove(event) {
    		if (mode !== "mouse") {
    			return;
    		}

    		xInput = (event.clientX / window.innerWidth - 0.5) * 2;
    		yInput = (event.clientY / window.innerHeight - 0.5) * 2;
    	}

    	function onDeviceOrientation(event) {
    		mode = "orientation";

    		let orientation = typeof window.orientation !== "undefined"
    		? window.orientation
    		: 0;

    		if (orientation === 0) {
    			xInput = Utils.clamp(event.gamma, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    			yInput = Utils.clamp(event.beta, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    		} else if (orientation === 180) {
    			xInput = Utils.clamp(event.gamma, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    			yInput = Utils.clamp(-event.beta, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    		} else if (orientation === 90) {
    			xInput = Utils.clamp(event.beta, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    			yInput = Utils.clamp(-event.gamma, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    		} else if (orientation === -90) {
    			xInput = Utils.clamp(-event.beta, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    			yInput = Utils.clamp(event.gamma, -1 * settings.maxAngle, settings.maxAngle) / settings.maxAngle;
    		}
    	}

    	onMount(() => {
    		let frame;

    		(function onLoop() {
    			frame = requestAnimationFrame(onLoop);
    			xDelta = xInput - x;
    			yDelta = yInput - y;
    			$$invalidate(0, x = x + xDelta / settings.damping);
    			$$invalidate(1, y = y + yDelta / settings.damping);
    		})();

    		// onUnmount
    		return () => {
    			cancelAnimationFrame(frame);
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function dot_x_binding(value) {
    		x = value;
    		$$invalidate(0, x);
    	}

    	function dot_y_binding(value) {
    		y = value;
    		$$invalidate(1, y);
    	}

    	function synth_x_binding(value) {
    		x = value;
    		$$invalidate(0, x);
    	}

    	function synth_y_binding(value) {
    		y = value;
    		$$invalidate(1, y);
    	}

    	$$self.$capture_state = () => ({
    		Utils,
    		onMount,
    		Dot,
    		Synth,
    		settings,
    		mode,
    		xInput,
    		yInput,
    		xDelta,
    		yDelta,
    		x,
    		y,
    		onMousemove,
    		onDeviceOrientation
    	});

    	$$self.$inject_state = $$props => {
    		if ("settings" in $$props) settings = $$props.settings;
    		if ("mode" in $$props) mode = $$props.mode;
    		if ("xInput" in $$props) xInput = $$props.xInput;
    		if ("yInput" in $$props) yInput = $$props.yInput;
    		if ("xDelta" in $$props) xDelta = $$props.xDelta;
    		if ("yDelta" in $$props) yDelta = $$props.yDelta;
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		x,
    		y,
    		onMousemove,
    		onDeviceOrientation,
    		mode,
    		xInput,
    		yInput,
    		xDelta,
    		yDelta,
    		settings,
    		dot_x_binding,
    		dot_y_binding,
    		synth_x_binding,
    		synth_y_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'a003'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
