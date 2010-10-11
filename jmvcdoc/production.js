steal.plugins("jquery/controller", "jquery/controller/history", "jquery/view/ejs", "jquery/model", "jquery/lang/json", "jquery/dom/cookie", "phui/filler", "phui/positionable", "phui/menuable").resources("helpers", "highlight", "languages/javascript", "languages/www").models("favorites", "search").controllers("documentation", "iframe", "demo").views("//jmvcdoc/views/attribute.ejs", "//jmvcdoc/views/class.ejs", "//jmvcdoc/views/constructor.ejs", "//jmvcdoc/views/favorite.ejs", "//jmvcdoc/views/function.ejs", "//jmvcdoc/views/page.ejs", "//jmvcdoc/views/results.ejs", "//jmvcdoc/views/top.ejs", "//jmvcdoc/views/iframe/init.ejs", "//jmvcdoc/views/iframe/menu.ejs", "//jmvcdoc/views/demo/init.ejs").then(function() {
	var a = window.location.href.match(/docs\/(.*)\.html/);
	if ((a = a && a[1]) && location.hash == "" ) window.location.hash = "&who=" + a
});
if ( typeof COMMENTS_LOCATION != "undefined" ) {
	steal.css("http://mediacdn.disqus.com/1066/build/themes/narcissus.css?1281560657&", "http://mediacdn.disqus.com/1066/styles/embed/thread.css?");
	if ( window.location.protocol == "file:" || window.location.hostname == "localhost" ) window.disqus_developer = 1
};;
steal.end();
steal.plugins("jquery/class", "jquery/lang", "jquery/event/destroyed").then(function( d ) {
	var n = function( a, b, c ) {
		var e;
		if ( b.indexOf(">") == 0 ) {
			b = b.substr(1);
			e = function( f ) {
				f.target === a ? c.apply(this, arguments) : (f.handled = null)
			}
		}
		d(a).bind(b, e || c);
		return function() {
			d(a).unbind(b, e || c);
			a = b = c = e = null
		}
	},
		o = function( a, b, c, e ) {
			d(a).delegate(b, c, e);
			return function() {
				d(a).undelegate(b, c, e);
				a = c = e = b = null
			}
		},
		i = function( a, b, c, e ) {
			return e ? o(a, e, b, c) : n(a, b, c)
		},
		h = function( a ) {
			return function() {
				return a.apply(null, [d(this)].concat(Array.prototype.slice.call(arguments, 0)))
			}
		},
		p = /\./g,
		q = /_?controllers?/ig,
		l = function( a ) {
			return d.String.underscore(a.replace(p, "_").replace(q, ""))
		},
		r = /[^\w]/,
		s = /^(>?default\.)|(>)/,
		j = /\{([^\}]+)\}/g,
		t = /^(?:(.*?)\s)?([\w\.\:>]+)$/;
	d.Class.extend("jQuery.Controller", {
		init: function() {
			if (!(!this.shortName || this.fullName == "jQuery.Controller")) {
				this._fullName = l(this.fullName);
				this._shortName = l(this.shortName);
				var a = this,
					b = this._fullName,
					c;
				d.fn[b] || (d.fn[b] = function( e ) {
					var f = d.makeArray(arguments),
						u = typeof e == "string" && d.isFunction(a.prototype[e]),
						v = f[0];
					this.each(function() {
						var g = d.data(this, "controllers");
						if ( g = g && g[b] ) u ? g[v].apply(g, f.slice(1)) : g.update.apply(g, f);
						else a.newInstance.apply(a, [this].concat(f))
					});
					return this
				});
				this.actions = {};
				for ( c in this.prototype ) if ( d.isFunction(this.prototype[c]) ) this._isAction(c) && (this.actions[c] = this._getAction(c));
				this.onDocument && new this(document.documentElement)
			}
		},
		hookup: function( a ) {
			return new this(a)
		},
		_isAction: function( a ) {
			if ( r.test(a) ) return true;
			else {
				a = a.replace(s, "");
				return d.inArray(a, this.listensTo) > -1 || d.event.special[a] || d.Controller.processors[a]
			}
		},
		_getAction: function( a, b ) {
			j.lastIndex = 0;
			if (!b && j.test(a) ) return null;
			a = (b ? a.replace(j, function( c, e ) {
				return d.Class.getObject(e, b).toString()
			}) : a).match(t);
			return {
				processor: this.processors[a[2]] || m,
				parts: a
			}
		},
		processors: {},
		listensTo: []
	}, {
		setup: function( a, b ) {
			var c, e = this.Class;
			a = a.jquery ? a[0] : a;
			this.element = d(a).addClass(e._fullName);
			(d.data(a, "controllers") || d.data(a, "controllers", {}))[e._fullName] = this;
			this._bindings = [];
			this.options = d.extend(d.extend(true, {}, e.defaults), b);
			for ( c in e.actions ) {
				b = e.actions[c] || e._getAction(c, this.options);
				this._bindings.push(b.processor(a, b.parts[2], b.parts[1], this.callback(c), this))
			}
			this.called = "init";
			var f = h(this.callback("destroy"));
			this.element.bind("destroyed", f);
			this._bindings.push(function() {
				f.removed = true;
				d(a).unbind("destroyed", f)
			});
			return this.element
		},
		bind: function( a, b, c ) {
			if ( typeof a == "string" ) {
				c = b;
				b = a;
				a = this.element
			}
			return this._binder(a, b, c)
		},
		_binder: function( a, b, c, e ) {
			if ( typeof c == "string" ) c = h(this.callback(c));
			this._bindings.push(i(a, b, c, e));
			return this._bindings.length
		},
		delegate: function( a, b, c, e ) {
			if ( typeof a == "string" ) {
				e = c;
				c = b;
				b = a;
				a = this.element
			}
			return this._binder(a, c, e, b)
		},
		update: function( a ) {
			d.extend(this.options, a)
		},
		destroy: function() {
			if ( this._destroyed ) throw this.Class.shortName + " controller instance has been deleted";
			var a = this,
				b = this.Class._fullName;
			this._destroyed = true;
			this.element.removeClass(b);
			d.each(this._bindings, function( e, f ) {
				d.isFunction(f) && f(a.element[0])
			});
			delete this._actions;
			var c = this.element.data("controllers");
			c && c[b] && delete c[b];
			d(this).triggerHandler("destroyed");
			this.element = null
		},
		find: function( a ) {
			return this.element.find(a)
		},
		_set_called: true
	});
	var m = function( a, b, c, e, f ) {
		f = f.Class;
		if ( f.onDocument && !/^Main(Controller)?$/.test(f.shortName) ) c = c ? "#" + f._shortName + " " + c : "#" + f._shortName;
		return i(a, b, h(e), c)
	},
		k = d.Controller.processors,
		w = function( a, b, c, e ) {
			return i(window, b.replace(/window/, ""), h(e))
		};
	d.each("change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset windowresize resize windowscroll scroll select submit dblclick focusin focusout load unload ready hashchange mouseenter mouseleave".split(" "), function( a, b ) {
		k[b] = m
	});
	d.each(["windowresize", "windowscroll", "load", "ready", "unload", "hashchange"], function( a, b ) {
		k[b] = w
	});
	k.ready = function( a, b, c, e ) {
		d(h(e))
	};
	d.fn.mixin = function() {
		var a = d.makeArray(arguments);
		return this.each(function() {
			for ( var b = 0; b < a.length; b++ ) new a[b](this)
		})
	};
	var x = function( a, b ) {
		for ( var c = 0; c < b.length; c++ ) if ( typeof b[c] == "string" ? a.Class._shortName == b[c] : a instanceof b[c] ) return true;
		return false
	};
	d.fn.controllers = function() {
		var a = d.makeArray(arguments),
			b = [],
			c;
		this.each(function() {
			if ( c =
			d.data(this, "controllers") ) for ( var e in c ) {
				var f = c[e];
				if (!a.length || x(f, a) ) b.push(f)
			}
		});
		return b
	};
	d.fn.controller = function() {
		return this.controllers.apply(this, arguments)[0]
	}
});;
steal.end();
steal.plugin("jquery").then(function( g ) {
	var j = false,
		n = /xyz/.test(function() {}) ? /\b_super\b/ : /.*/,
		m = function( a, c, d ) {
			d = d || a;
			for ( var b in a ) d[b] = typeof a[b] == "function" && typeof c[b] == "function" && n.test(a[b]) ?
			function( h, i ) {
				return function() {
					var e = this._super,
						f;
					this._super = c[h];
					f = i.apply(this, arguments);
					this._super = e;
					return f
				}
			}(b, a[b]) : a[b]
		};
	jQuery.Class = function() {
		arguments.length && this.extend.apply(this, arguments)
	};
	g.extend(g.Class, {
		callback: function( a ) {
			var c = jQuery.makeArray(arguments),
				d;
			a = c.shift();
			jQuery.isArray(a) || (a = [a]);
			d = this;
			return function() {
				for ( var b = c.concat(jQuery.makeArray(arguments)), h, i = a.length, e = 0, f; e < i; e++ ) if ( f = a[e] ) {
					if ((h = typeof f == "string") && d._set_called ) d.called = f;
					b = (h ? d[f] : f).apply(d, b || []);
					if ( e < i - 1 ) b = !jQuery.isArray(b) || b._use_call ? [b] : b
				}
				return b
			}
		},
		getObject: function( a, c ) {
			c = c || window;
			a = a ? a.split(/\./) : [];
			for ( var d = 0; d < a.length; d++ ) c = c[a[d]] || (c[a[d]] = {});
			return c
		},
		newInstance: function() {
			var a = this.rawInstance(),
				c;
			if ( a.setup ) c = a.setup.apply(a, arguments);
			if ( a.init ) a.init.apply(a, g.isArray(c) ? c : arguments);
			return a
		},
		setup: function( a ) {
			this.defaults = g.extend(true, {}, a.defaults, this.defaults);
			return arguments
		},
		rawInstance: function() {
			j = true;
			var a = new this;
			j = false;
			return a
		},
		extend: function( a, c, d ) {
			function b() {
				if (!j ) return this.constructor !== b && arguments.length ? this.extend.apply(this, arguments) : this.Class.newInstance.apply(this.Class, arguments)
			}
			if ( typeof a != "string" ) {
				d = c;
				c = a;
				a = null
			}
			if (!d ) {
				d = c;
				c = null
			}
			d = d || {};
			var h = this,
				i = this.prototype,
				e, f, k, l;
			j = true;
			l = new this;
			j = false;
			m(d, i, l);
			for ( e in this ) if ( this.hasOwnProperty(e) && g.inArray(e, ["prototype", "defaults", "getObject"]) == -1 ) b[e] = this[e];
			m(c, this, b);
			if ( a ) {
				k = a.split(/\./);
				f = k.pop();
				k = i = g.Class.getObject(k.join("."));
				i[f] = b
			}
			g.extend(b, {
				prototype: l,
				namespace: k,
				shortName: f,
				constructor: b,
				fullName: a
			});
			b.prototype.Class = b.prototype.constructor = b;
			h = b.setup.apply(b, [h].concat(g.makeArray(arguments)));
			if ( b.init ) b.init.apply(b, h || []);
			return b
		}
	});
	jQuery.Class.prototype.callback = jQuery.Class.callback
})();;
steal.end();
(function( y, w ) {
	function ka() {
		if (!c.isReady ) {
			try {
				document.documentElement.doScroll("left")
			} catch (a) {
				setTimeout(ka, 1);
				return
			}
			c.ready()
		}
	}
	function K() {
		return false
	}
	function W() {
		return true
	}
	function la(a, b, d) {
		d[0].type = a;
		return c.event.handle.apply(b, d)
	}
	function ma(a) {
		var b, d, e = [],
			f = [],
			h, k, j, l, r, s, t, q;
		k = c.data(this, "events");
		if (!(a.liveFired === this || !k || !k.live || a.button && a.type === "click")) {
			if ( a.namespace ) q = new RegExp("(^|\\.)" + a.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
			a.liveFired = this;
			var z =
			k.live.slice(0);
			for ( l = 0; l < z.length; l++ ) {
				k = z[l];
				k.origType.replace(X, "") === a.type ? f.push(k.selector) : z.splice(l--, 1)
			}
			f = c(a.target).closest(f, a.currentTarget);
			r = 0;
			for ( s = f.length; r < s; r++ ) {
				t = f[r];
				for ( l = 0; l < z.length; l++ ) {
					k = z[l];
					if ( t.selector === k.selector && (!q || q.test(k.namespace)) ) {
						j = t.elem;
						h = null;
						if ( k.preType === "mouseenter" || k.preType === "mouseleave" ) {
							a.type = k.preType;
							h = c(a.relatedTarget).closest(k.selector)[0]
						}
						if (!h || h !== j ) e.push({
							elem: j,
							handleObj: k,
							level: t.level
						})
					}
				}
			}
			r = 0;
			for ( s = e.length; r < s; r++ ) {
				f = e[r];
				if ( d && f.level > d ) break;
				a.currentTarget = f.elem;
				a.data = f.handleObj.data;
				a.handleObj = f.handleObj;
				q = a.handled;
				ret = f.handleObj.origHandler.apply(f.elem, arguments);
				a.handled = a.handled === null ? q : true;
				if ( ret === false || a.isPropagationStopped() ) {
					d = f.level;
					if ( ret === false ) b = false
				}
			}
			return b
		}
	}
	function P(a, b) {
		return (a && a !== "*" ? a + "." : "") + b.replace(/\./g, "`").replace(/ /g, "&")
	}
	function na(a) {
		return !a || !a.parentNode || a.parentNode.nodeType === 11
	}
	function oa(a, b, d) {
		if ( c.isFunction(b) ) return c.grep(a, function( f, h ) {
			return !!b.call(f, h, f) === d
		});
		else if ( b.nodeType ) return c.grep(a, function( f ) {
			return f === b === d
		});
		else if ( typeof b === "string" ) {
			var e = c.grep(a, function( f ) {
				return f.nodeType === 1
			});
			if ( pa.test(b) ) return c.filter(b, e, !d);
			else b = c.filter(b, e)
		}
		return c.grep(a, function( f ) {
			return c.inArray(f, b) >= 0 === d
		})
	}
	function Sa(a) {
		return c.nodeName(a, "table") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
	}
	function qa(a, b) {
		var d = 0;
		b.each(function() {
			if ( this.nodeName === (a[d] && a[d].nodeName) ) {
				var e =
				c.data(a[d++]),
					f = c.data(this, e);
				if ( e = e && e.events ) {
					delete f.handle;
					f.events = {};
					for ( var h in e ) for ( var k in e[h] ) c.event.add(this, h, e[h][k], e[h][k].data)
				}
			}
		})
	}
	function ra(a, b, d) {
		var e, f, h;
		b = b && b[0] ? b[0].ownerDocument || b[0] : document;
		if ( a.length === 1 && typeof a[0] === "string" && a[0].length < 512 && b === document && !sa.test(a[0]) && (c.support.checkClone || !ta.test(a[0])) ) {
			f = true;
			if ( h = c.fragments[a[0]] ) if ( h !== 1 ) e = h
		}
		if (!e ) {
			e = b.createDocumentFragment();
			c.clean(a, b, e, d)
		}
		if ( f ) c.fragments[a[0]] = h ? e : 1;
		return {
			fragment: e,
			cacheable: f
		}
	}

	function Ta(a, b) {
		b.src ? c.ajax({
			url: b.src,
			async: false,
			dataType: "script"
		}) : c.globalEval(b.text || b.textContent || b.innerHTML || "");
		b.parentNode && b.parentNode.removeChild(b)
	}
	function ua(a, b, d) {
		var e = b === "width" ? a.offsetWidth : a.offsetHeight;
		if ( d === "border" ) return e;
		c.each(b === "width" ? Ua : Va, function() {
			d || (e -= parseFloat(c.curCSS(a, "padding" + this, true)) || 0);
			if ( d === "margin" ) e += parseFloat(c.curCSS(a, "margin" + this, true)) || 0;
			else e -= parseFloat(c.curCSS(a, "border" + this + "Width", true)) || 0
		});
		return e
	}
	function Y(a, b, d, e) {
		if ( c.isArray(b) ) c.each(b, function( f, h ) {
			d || /\[\]$/.test(a) ? e(a, h) : Y(a + "[" + (typeof h === "object" || c.isArray(h) ? f : "") + "]", h, d, e)
		});
		else!d && b != null && typeof b === "object" ? c.each(b, function( f, h ) {
			Y(a + "[" + f + "]", h, d, e)
		}) : e(a, b)
	}
	function G(a, b) {
		var d = {};
		c.each(va.concat.apply([], va.slice(0, b)), function() {
			d[this] = a
		});
		return d
	}
	function Z(a) {
		return "scrollTo" in a && a.document && a.navigator ? a : a.nodeType === 9 ? a.defaultView || a.parentWindow : false
	}
	var c = function( a, b ) {
		return new c.fn.init(a, b)
	},
		Wa = y.jQuery,
		Xa = y.$,
		Q, Ya = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w\-]+)$/,
		pa = /^.[^:#\[\.,]*$/,
		Za = /\S/,
		wa = /^\s+/,
		xa = /\s+$/,
		$a = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
		L = navigator.userAgent,
		ya = false,
		M = [],
		H, $ = Object.prototype.toString,
		aa = Object.prototype.hasOwnProperty,
		ba = Array.prototype.push,
		N = Array.prototype.slice,
		za = String.prototype.trim,
		Aa = Array.prototype.indexOf;
	c.fn = c.prototype = {
		init: function( a, b ) {
			var d, e;
			if (!a ) return this;
			if ( a.nodeType ) {
				this.context = this[0] = a;
				this.length = 1;
				return this
			}
			if ( a === "body" && !b ) {
				this.context = document;
				this[0] =
				document.body;
				this.selector = "body";
				this.length = 1;
				return this
			}
			if ( typeof a === "string" ) if ((d = Ya.exec(a)) && (d[1] || !b)) if ( d[1] ) {
				e = b ? b.ownerDocument || b : document;
				if ( a = $a.exec(a) ) if ( c.isPlainObject(b) ) {
					a = [document.createElement(a[1])];
					c.fn.attr.call(a, b, true)
				} else a = [e.createElement(a[1])];
				else {
					a = ra([d[1]], [e]);
					a = (a.cacheable ? a.fragment.cloneNode(true) : a.fragment).childNodes
				}
				return c.merge(this, a)
			} else {
				if ( b = document.getElementById(d[2]) ) {
					if ( b.id !== d[2] ) return Q.find(a);
					this.length = 1;
					this[0] = b
				}
				this.context =
				document;
				this.selector = a;
				return this
			} else if (!b && /^\w+$/.test(a) ) {
				this.selector = a;
				this.context = document;
				a = document.getElementsByTagName(a);
				return c.merge(this, a)
			} else return !b || b.jquery ? (b || Q).find(a) : c(b).find(a);
			else if ( c.isFunction(a) ) return Q.ready(a);
			if ( a.selector !== w ) {
				this.selector = a.selector;
				this.context = a.context
			}
			return c.makeArray(a, this)
		},
		selector: "",
		jquery: "1.4.3pre",
		length: 0,
		size: function() {
			return this.length
		},
		toArray: function() {
			return N.call(this, 0)
		},
		get: function( a ) {
			return a == null ? this.toArray() : a < 0 ? this.slice(a)[0] : this[a]
		},
		pushStack: function( a, b, d ) {
			var e = c();
			c.isArray(a) ? ba.apply(e, a) : c.merge(e, a);
			e.prevObject = this;
			e.context = this.context;
			if ( b === "find" ) e.selector = this.selector + (this.selector ? " " : "") + d;
			else if ( b ) e.selector = this.selector + "." + b + "(" + d + ")";
			return e
		},
		each: function( a, b ) {
			return c.each(this, a, b)
		},
		ready: function( a ) {
			c.bindReady();
			if ( c.isReady ) a.call(document, c);
			else M && M.push(a);
			return this
		},
		eq: function( a ) {
			return a === -1 ? this.slice(a) : this.slice(a, +a + 1)
		},
		first: function() {
			return this.eq(0)
		},
		last: function() {
			return this.eq(-1)
		},
		slice: function() {
			return this.pushStack(N.apply(this, arguments), "slice", N.call(arguments).join(","))
		},
		map: function( a ) {
			return this.pushStack(c.map(this, function( b, d ) {
				return a.call(b, d, b)
			}))
		},
		end: function() {
			return this.prevObject || c(null)
		},
		push: ba,
		sort: [].sort,
		splice: [].splice
	};
	c.fn.init.prototype = c.fn;
	c.extend = c.fn.extend = function() {
		var a = arguments[0] || {},
			b = 1,
			d = arguments.length,
			e = false,
			f, h, k, j;
		if ( typeof a === "boolean" ) {
			e = a;
			a = arguments[1] || {};
			b = 2
		}
		if ( typeof a !== "object" && !c.isFunction(a) ) a = {};
		if ( d === b ) {
			a = this;
			--b
		}
		for (; b < d; b++ ) if ((f = arguments[b]) != null ) for ( h in f ) {
			k = a[h];
			j = f[h];
			if ( a !== j ) if ( e && j && (c.isPlainObject(j) || c.isArray(j)) ) {
				k = k && (c.isPlainObject(k) || c.isArray(k)) ? k : c.isArray(j) ? [] : {};
				a[h] = c.extend(e, k, j)
			} else if ( j !== w ) a[h] = j
		}
		return a
	};
	c.extend({
		noConflict: function( a ) {
			y.$ = Xa;
			if ( a ) y.jQuery = Wa;
			return c
		},
		isReady: false,
		ready: function() {
			if (!c.isReady ) {
				if (!document.body ) return setTimeout(c.ready, 13);
				c.isReady = true;
				if ( M ) {
					for ( var a, b = 0; a = M[b++]; ) a.call(document, c);
					M =
					null
				}
				c.fn.triggerHandler && c(document).triggerHandler("ready")
			}
		},
		bindReady: function() {
			if (!ya ) {
				ya = true;
				if ( document.readyState === "complete" ) return c.ready();
				if ( document.addEventListener ) {
					document.addEventListener("DOMContentLoaded", H, false);
					y.addEventListener("load", c.ready, false)
				} else if ( document.attachEvent ) {
					document.attachEvent("onreadystatechange", H);
					y.attachEvent("onload", c.ready);
					var a = false;
					try {
						a = y.frameElement == null
					} catch (b) {}
					document.documentElement.doScroll && a && ka()
				}
			}
		},
		isFunction: function( a ) {
			return $.call(a) === "[object Function]"
		},
		isArray: function( a ) {
			return $.call(a) === "[object Array]"
		},
		isPlainObject: function( a ) {
			if (!a || $.call(a) !== "[object Object]" || a.nodeType || a.setInterval ) return false;
			if ( a.constructor && !aa.call(a, "constructor") && !aa.call(a.constructor.prototype, "isPrototypeOf") ) return false;
			var b;
			for ( b in a );
			return b === w || aa.call(a, b)
		},
		isEmptyObject: function( a ) {
			for ( var b in a ) return false;
			return true
		},
		error: function( a ) {
			throw a;
		},
		parseJSON: function( a ) {
			if ( typeof a !== "string" || !a ) return null;
			a = c.trim(a);
			if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) return y.JSON && y.JSON.parse ? y.JSON.parse(a) : (new Function("return " + a))();
			else c.error("Invalid JSON: " + a)
		},
		noop: function() {},
		globalEval: function( a ) {
			if ( a && Za.test(a) ) {
				var b = document.getElementsByTagName("head")[0] || document.documentElement,
					d = document.createElement("script");
				d.type = "text/javascript";
				if ( c.support.scriptEval ) d.appendChild(document.createTextNode(a));
				else d.text = a;
				b.insertBefore(d, b.firstChild);
				b.removeChild(d)
			}
		},
		nodeName: function( a, b ) {
			return a.nodeName && a.nodeName.toUpperCase() === b.toUpperCase()
		},
		each: function( a, b, d ) {
			var e, f = 0,
				h = a.length,
				k = h === w || c.isFunction(a);
			if ( d ) if ( k ) for ( e in a ) {
				if ( b.apply(a[e], d) === false ) break
			} else for (; f < h; ) {
				if ( b.apply(a[f++], d) === false ) break
			} else if ( k ) for ( e in a ) {
				if ( b.call(a[e], e, a[e]) === false ) break
			} else for ( d = a[0]; f < h && b.call(d, f, d) !== false; d = a[++f] );
			return a
		},
		trim: za ?
		function( a ) {
			return a == null ? "" : za.call(a)
		} : function( a ) {
			return a == null ? "" : a.toString().replace(wa, "").replace(xa, "")
		},
		makeArray: function( a, b ) {
			b = b || [];
			if ( a != null ) a.length == null || typeof a === "string" || c.isFunction(a) || typeof a !== "function" && a.setInterval ? ba.call(b, a) : c.merge(b, a);
			return b
		},
		inArray: function( a, b ) {
			if ( b.indexOf ) return b.indexOf(a);
			for ( var d = 0, e = b.length; d < e; d++ ) if ( b[d] === a ) return d;
			return -1
		},
		merge: function( a, b ) {
			var d = a.length,
				e = 0;
			if ( typeof b.length === "number" ) for ( var f = b.length; e < f; e++ ) a[d++] = b[e];
			else for (; b[e] !== w; ) a[d++] = b[e++];
			a.length = d;
			return a
		},
		grep: function( a, b, d ) {
			var e = [],
				f;
			d = !! d;
			for ( var h = 0, k = a.length; h < k; h++ ) {
				f = !! b(a[h], h);
				d !== f && e.push(a[h])
			}
			return e
		},
		map: function( a, b, d ) {
			for ( var e = [], f, h = 0, k = a.length; h < k; h++ ) {
				f = b(a[h], h, d);
				if ( f != null ) e[e.length] = f
			}
			return e.concat.apply([], e)
		},
		guid: 1,
		proxy: function( a, b, d ) {
			if ( arguments.length === 2 ) if ( typeof b === "string" ) {
				d = a;
				a = d[b];
				b = w
			} else if ( b && !c.isFunction(b) ) {
				d = b;
				b = w
			}
			if (!b && a ) b = function() {
				return a.apply(d || this, arguments)
			};
			if ( a ) b.guid = a.guid = a.guid || b.guid || c.guid++;
			return b
		},
		access: function( a, b, d, e, f, h ) {
			var k = a.length;
			if ( typeof b === "object" ) {
				for ( var j in b ) c.access(a, j, b[j], e, f, d);
				return a
			}
			if ( d !== w ) {
				e = !h && e && c.isFunction(d);
				for ( j = 0; j < k; j++ ) f(a[j], b, e ? d.call(a[j], j, f(a[j], b)) : d, h);
				return a
			}
			return k ? f(a[0], b) : w
		},
		now: function() {
			return (new Date).getTime()
		},
		uaMatch: function( a ) {
			a = a.toLowerCase();
			a = /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || !/compatible/.test(a) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(a) || [];
			return {
				browser: a[1] || "",
				version: a[2] || "0"
			}
		},
		browser: {}
	});
	L = c.uaMatch(L);
	if ( L.browser ) {
		c.browser[L.browser] = true;
		c.browser.version = L.version
	}
	if ( c.browser.webkit ) c.browser.safari = true;
	if ( Aa ) c.inArray = function( a, b ) {
		return Aa.call(b, a)
	};
	if (!/\s/.test("\u00a0") ) {
		wa = /^[\s\xA0]+/;
		xa = /[\s\xA0]+$/
	}
	Q = c(document);
	if ( document.addEventListener ) H = function() {
		document.removeEventListener("DOMContentLoaded", H, false);
		c.ready()
	};
	else if ( document.attachEvent ) H = function() {
		if ( document.readyState === "complete" ) {
			document.detachEvent("onreadystatechange", H);
			c.ready()
		}
	};
	y.jQuery = y.$ = c;
	(function() {
		c.support = {};
		var a = document.documentElement,
			b = document.createElement("script"),
			d = document.createElement("div"),
			e = "script" + c.now();
		d.style.display = "none";
		d.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		var f = d.getElementsByTagName("*"),
			h = d.getElementsByTagName("a")[0];
		if (!(!f || !f.length || !h)) {
			c.support = {
				leadingWhitespace: d.firstChild.nodeType === 3,
				tbody: !d.getElementsByTagName("tbody").length,
				htmlSerialize: !! d.getElementsByTagName("link").length,
				style: /red/.test(h.getAttribute("style")),
				hrefNormalized: h.getAttribute("href") === "/a",
				opacity: /^0.55$/.test(h.style.opacity),
				cssFloat: !! h.style.cssFloat,
				checkOn: d.getElementsByTagName("input")[0].value === "on",
				optSelected: document.createElement("select").appendChild(document.createElement("option")).selected,
				checkClone: false,
				scriptEval: false,
				noCloneEvent: true,
				boxModel: null
			};
			b.type = "text/javascript";
			try {
				b.appendChild(document.createTextNode("window." + e + "=1;"))
			} catch (k) {}
			a.insertBefore(b, a.firstChild);
			if ( y[e] ) {
				c.support.scriptEval = true;
				delete y[e]
			}
			a.removeChild(b);
			if ( d.attachEvent && d.fireEvent ) {
				d.attachEvent("onclick", function j() {
					c.support.noCloneEvent = false;
					d.detachEvent("onclick", j)
				});
				d.cloneNode(true).fireEvent("onclick")
			}
			d = document.createElement("div");
			d.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
			a = document.createDocumentFragment();
			a.appendChild(d.firstChild);
			c.support.checkClone = a.cloneNode(true).cloneNode(true).lastChild.checked;
			c(function() {
				var j = document.createElement("div");
				j.style.width = j.style.paddingLeft = "1px";
				document.body.appendChild(j);
				c.boxModel = c.support.boxModel = j.offsetWidth === 2;
				document.body.removeChild(j).style.display = "none"
			});
			a = function( j ) {
				var l = document.createElement("div");
				j = "on" + j;
				var r = j in l;
				if (!r ) {
					l.setAttribute(j, "return;");
					r = typeof l[j] === "function"
				}
				return r
			};
			c.support.submitBubbles = a("submit");
			c.support.changeBubbles = a("change");
			a = b = d = f = h = null
		}
	})();
	c.props = {
		"for": "htmlFor",
		"class": "className",
		readonly: "readOnly",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		rowspan: "rowSpan",
		colspan: "colSpan",
		tabindex: "tabIndex",
		usemap: "useMap",
		frameborder: "frameBorder"
	};
	var Ba = {};
	c.extend({
		cache: {},
		uuid: 0,
		expando: "jQuery" + c.now(),
		noData: {
			embed: true,
			object: true,
			applet: true
		},
		data: function( a, b, d ) {
			if (!(a.nodeName && c.noData[a.nodeName.toLowerCase()])) {
				a = a == y ? Ba : a;
				var e = a[c.expando],
					f = c.cache;
				if (!(!e && typeof b === "string" && d === w)) {
					if ( a.nodeType ) e || (a[c.expando] = e = ++c.uuid);
					else {
						f = a;
						e = c.expando
					}
					if ( typeof b === "object" ) f[e] = c.extend(true, {}, b);
					else f[e] || (f[e] = {});
					a = f[e];
					if ( d !== w ) a[b] = d;
					return typeof b === "string" ? a[b] : a
				}
			}
		},
		removeData: function( a, b ) {
			if (!(a.nodeName && c.noData[a.nodeName.toLowerCase()])) {
				a = a == y ? Ba : a;
				var d = a[c.expando],
					e = c.cache,
					f = a.nodeType,
					h = f ? e[d] : d;
				if ( b ) {
					if ( h ) {
						delete h[b];
						c.isEmptyObject(h) && c.removeData(a)
					}
				} else {
					if ( c.support.deleteExpando || !f ) delete a[c.expando];
					else a.removeAttribute && a.removeAttribute(c.expando);
					f && delete e[d]
				}
			}
		}
	});
	c.fn.extend({
		data: function( a, b ) {
			if ( typeof a === "undefined" && this.length ) return c.data(this[0]);
			else if ( typeof a === "object" ) return this.each(function() {
				c.data(this, a)
			});
			var d = a.split(".");
			d[1] = d[1] ? "." + d[1] : "";
			if ( b === w ) {
				var e = this.triggerHandler("getData" + d[1] + "!", [d[0]]);
				if ( e === w && this.length ) e = c.data(this[0], a);
				return e === w && d[1] ? this.data(d[0]) : e
			} else return this.trigger("setData" + d[1] + "!", [d[0], b]).each(function() {
				c.data(this, a, b)
			})
		},
		removeData: function( a ) {
			return this.each(function() {
				c.removeData(this, a)
			})
		}
	});
	c.extend({
		queue: function( a, b, d ) {
			if ( a ) {
				b = (b || "fx") + "queue";
				var e = c.data(a, b);
				if (!d ) return e || [];
				if (!e || c.isArray(d) ) e = c.data(a, b, c.makeArray(d));
				else e.push(d);
				return e
			}
		},
		dequeue: function( a, b ) {
			b = b || "fx";
			var d = c.queue(a, b),
				e = d.shift();
			if ( e === "inprogress" ) e = d.shift();
			if ( e ) {
				b === "fx" && d.unshift("inprogress");
				e.call(a, function() {
					c.dequeue(a, b)
				})
			}
		}
	});
	c.fn.extend({
		queue: function( a, b ) {
			if ( typeof a !== "string" ) {
				b = a;
				a = "fx"
			}
			if ( b === w ) return c.queue(this[0], a);
			return this.each(function() {
				var d = c.queue(this, a, b);
				a === "fx" && d[0] !== "inprogress" && c.dequeue(this, a)
			})
		},
		dequeue: function( a ) {
			return this.each(function() {
				c.dequeue(this, a)
			})
		},
		delay: function( a, b ) {
			a = c.fx ? c.fx.speeds[a] || a : a;
			b = b || "fx";
			return this.queue(b, function() {
				var d = this;
				setTimeout(function() {
					c.dequeue(d, b)
				}, a)
			})
		},
		clearQueue: function( a ) {
			return this.queue(a || "fx", [])
		}
	});
	var Ca = /[\n\t]/g,
		ca = /\s+/,
		ab = /\r/g,
		bb = /href|src|style/,
		cb = /(button|input)/i,
		db = /(button|input|object|select|textarea)/i,
		eb = /^(a|area)$/i,
		Da = /radio|checkbox/;
	c.fn.extend({
		attr: function( a, b ) {
			return c.access(this, a, b, true, c.attr)
		},
		removeAttr: function( a ) {
			return this.each(function() {
				c.attr(this, a, "");
				this.nodeType === 1 && this.removeAttribute(a)
			})
		},
		addClass: function( a ) {
			if ( c.isFunction(a) ) return this.each(function( r ) {
				var s =
				c(this);
				s.addClass(a.call(this, r, s.attr("class")))
			});
			if ( a && typeof a === "string" ) for ( var b = (a || "").split(ca), d = 0, e = this.length; d < e; d++ ) {
				var f = this[d];
				if ( f.nodeType === 1 ) if ( f.className ) {
					for ( var h = " " + f.className + " ", k = f.className, j = 0, l = b.length; j < l; j++ ) if ( h.indexOf(" " + b[j] + " ") < 0 ) k += " " + b[j];
					f.className = c.trim(k)
				} else f.className = a
			}
			return this
		},
		removeClass: function( a ) {
			if ( c.isFunction(a) ) return this.each(function( l ) {
				var r = c(this);
				r.removeClass(a.call(this, l, r.attr("class")))
			});
			if ( a && typeof a === "string" || a === w ) for ( var b = (a || "").split(ca), d = 0, e = this.length; d < e; d++ ) {
				var f = this[d];
				if ( f.nodeType === 1 && f.className ) if ( a ) {
					for ( var h = (" " + f.className + " ").replace(Ca, " "), k = 0, j = b.length; k < j; k++ ) h = h.replace(" " + b[k] + " ", " ");
					f.className = c.trim(h)
				} else f.className = ""
			}
			return this
		},
		toggleClass: function( a, b ) {
			var d = typeof a,
				e = typeof b === "boolean";
			if ( c.isFunction(a) ) return this.each(function( f ) {
				var h = c(this);
				h.toggleClass(a.call(this, f, h.attr("class"), b), b)
			});
			return this.each(function() {
				if ( d === "string" ) for ( var f, h =
				0, k = c(this), j = b, l = a.split(ca); f = l[h++]; ) {
					j = e ? j : !k.hasClass(f);
					k[j ? "addClass" : "removeClass"](f)
				} else if ( d === "undefined" || d === "boolean" ) {
					this.className && c.data(this, "__className__", this.className);
					this.className = this.className || a === false ? "" : c.data(this, "__className__") || ""
				}
			})
		},
		hasClass: function( a ) {
			a = " " + a + " ";
			for ( var b = 0, d = this.length; b < d; b++ ) if ((" " + this[b].className + " ").replace(Ca, " ").indexOf(a) > -1 ) return true;
			return false
		},
		val: function( a ) {
			if ( a === w ) {
				var b = this[0];
				if ( b ) {
					if ( c.nodeName(b, "option") ) return (b.attributes.value || {}).specified ? b.value : b.text;
					if ( c.nodeName(b, "select") ) {
						var d = b.selectedIndex,
							e = [],
							f = b.options;
						b = b.type === "select-one";
						if ( d < 0 ) return null;
						var h = b ? d : 0;
						for ( d = b ? d + 1 : f.length; h < d; h++ ) {
							var k = f[h];
							if ( k.selected ) {
								a = c(k).val();
								if ( b ) return a;
								e.push(a)
							}
						}
						return e
					}
					if ( Da.test(b.type) && !c.support.checkOn ) return b.getAttribute("value") === null ? "on" : b.value;
					return (b.value || "").replace(ab, "")
				}
				return w
			}
			var j = c.isFunction(a);
			return this.each(function( l ) {
				var r = c(this),
					s = a;
				if ( this.nodeType === 1 ) {
					if ( j ) s = a.call(this, l, r.val());
					if ( typeof s === "number" ) s += "";
					if ( c.isArray(s) && Da.test(this.type) ) this.checked = c.inArray(r.val(), s) >= 0;
					else if ( c.nodeName(this, "select") ) {
						var t = c.makeArray(s);
						c("option", this).each(function() {
							this.selected = c.inArray(c(this).val(), t) >= 0
						});
						if (!t.length ) this.selectedIndex = -1
					} else this.value = s
				}
			})
		}
	});
	c.extend({
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
		attr: function( a, b, d, e ) {
			if (!a || a.nodeType === 3 || a.nodeType === 8 ) return w;
			if ( e && b in c.attrFn ) return c(a)[b](d);
			e = a.nodeType !== 1 || !c.isXMLDoc(a);
			var f = d !== w;
			b = e && c.props[b] || b;
			if ( a.nodeType === 1 ) {
				var h = bb.test(b);
				if ( b in a && e && !h ) {
					if ( f ) {
						b === "type" && cb.test(a.nodeName) && a.parentNode && c.error("type property can't be changed");
						a[b] = d
					}
					if ( c.nodeName(a, "form") && a.getAttributeNode(b) ) return a.getAttributeNode(b).nodeValue;
					if ( b === "tabIndex" ) return (b = a.getAttributeNode("tabIndex")) && b.specified ? b.value : db.test(a.nodeName) || eb.test(a.nodeName) && a.href ? 0 : w;
					return a[b]
				}
				if (!c.support.style && e && b === "style" ) {
					if ( f ) a.style.cssText = "" + d;
					return a.style.cssText
				}
				f && a.setAttribute(b, "" + d);
				a = !c.support.hrefNormalized && e && h ? a.getAttribute(b, 2) : a.getAttribute(b);
				return a === null ? w : a
			}
			return c.style(a, b, d)
		}
	});
	var X = /\.(.*)$/,
		fb = function( a ) {
			return a.replace(/[^\w\s\.\|`]/g, function( b ) {
				return "\\" + b
			})
		},
		R = {
			focusin: 0,
			focusout: 0
		};
	c.event = {
		add: function( a, b, d, e ) {
			if (!(a.nodeType === 3 || a.nodeType === 8)) {
				if ( a.setInterval && a !== y && !a.frameElement ) a = y;
				if ( d === false ) d = K;
				var f, h;
				if ( d.handler ) {
					f = d;
					d = f.handler
				}
				if (!d.guid ) d.guid = c.guid++;
				if ( h = c.data(a) ) {
					var k =
					h.events = h.events || {},
						j = h.handle;
					if (!j ) h.handle = j = function() {
						return typeof c !== "undefined" && !c.event.triggered ? c.event.handle.apply(j.elem, arguments) : w
					};
					j.elem = a;
					b = b.split(" ");
					for ( var l, r = 0, s; l = b[r++]; ) {
						h = f ? c.extend({}, f) : {
							handler: d,
							data: e
						};
						if ( l.indexOf(".") > -1 ) {
							s = l.split(".");
							l = s.shift();
							h.namespace = s.slice(0).sort().join(".")
						} else {
							s = [];
							h.namespace = ""
						}
						h.type = l;
						if (!h.guid ) h.guid = d.guid;
						var t = k[l],
							q = c.event.special[l] || {};
						if (!t ) {
							t = k[l] = [];
							if (!q.setup || q.setup.call(a, e, s, j) === false ) if ( a.addEventListener ) a.addEventListener(l, j, false);
							else a.attachEvent && a.attachEvent("on" + l, j)
						}
						if ( q.add ) {
							q.add.call(a, h);
							if (!h.handler.guid ) h.handler.guid = d.guid
						}
						t.push(h);
						c.event.global[l] = true
					}
					a = null
				}
			}
		},
		global: {},
		remove: function( a, b, d, e ) {
			if (!(a.nodeType === 3 || a.nodeType === 8)) {
				if ( d === false ) d = K;
				var f, h, k = 0,
					j, l, r, s, t, q, z = c.data(a),
					A = z && z.events;
				if ( z && A ) {
					if ( b && b.type ) {
						d = b.handler;
						b = b.type
					}
					if (!b || typeof b === "string" && b.charAt(0) === "." ) {
						b = b || "";
						for ( f in A ) c.event.remove(a, f + b)
					} else {
						for ( b = b.split(" "); f = b[k++]; ) {
							s = f;
							j = f.indexOf(".") < 0;
							l = [];
							if (!j ) {
								l =
								f.split(".");
								f = l.shift();
								r = new RegExp("(^|\\.)" + c.map(l.slice(0).sort(), fb).join("\\.(?:.*\\.)?") + "(\\.|$)")
							}
							if ( t = A[f] ) if ( d ) {
								s = c.event.special[f] || {};
								for ( h = e || 0; h < t.length; h++ ) {
									q = t[h];
									if ( d.guid === q.guid ) {
										if ( j || r.test(q.namespace) ) {
											e == null && t.splice(h--, 1);
											s.remove && s.remove.call(a, q)
										}
										if ( e != null ) break
									}
								}
								if ( t.length === 0 || e != null && t.length === 1 ) {
									if (!s.teardown || s.teardown.call(a, l) === false ) Ea(a, f, z.handle);
									delete A[f]
								}
							} else for ( h = 0; h < t.length; h++ ) {
								q = t[h];
								if ( j || r.test(q.namespace) ) {
									c.event.remove(a, s, q.handler, h);
									t.splice(h--, 1)
								}
							}
						}
						if ( c.isEmptyObject(A) ) {
							if ( b = z.handle ) b.elem = null;
							delete z.events;
							delete z.handle;
							c.isEmptyObject(z) && c.removeData(a)
						}
					}
				}
			}
		},
		trigger: function( a, b, d, e ) {
			var f = a.type || a;
			if (!e ) {
				a = typeof a === "object" ? a[c.expando] ? a : c.extend(c.Event(f), a) : c.Event(f);
				if ( f.indexOf("!") >= 0 ) {
					a.type = f = f.slice(0, -1);
					a.exclusive = true
				}
				if (!d ) {
					a.stopPropagation();
					c.event.global[f] && c.each(c.cache, function() {
						this.events && this.events[f] && c.event.trigger(a, b, this.handle.elem)
					})
				}
				if (!d || d.nodeType === 3 || d.nodeType === 8 ) return w;
				a.result = w;
				a.target = d;
				b = c.makeArray(b);
				b.unshift(a)
			}
			a.currentTarget = d;
			(e = c.data(d, "handle")) && e.apply(d, b);
			e = d.parentNode || d.ownerDocument;
			try {
				if (!(d && d.nodeName && c.noData[d.nodeName.toLowerCase()])) if ( d["on" + f] && d["on" + f].apply(d, b) === false ) a.result = false
			} catch (h) {}
			if (!a.isPropagationStopped() && e ) c.event.trigger(a, b, e, true);
			else if (!a.isDefaultPrevented() ) {
				e = a.target;
				var k, j = f.replace(/\..*$/, ""),
					l = c.nodeName(e, "a") && j === "click",
					r = c.event.special[j] || {};
				if ((!r._default || r._default.call(d, a) === false) && !l && !(e && e.nodeName && c.noData[e.nodeName.toLowerCase()]) ) {
					try {
						if ( e[j] ) {
							if ( k = e["on" + j] ) e["on" + j] = null;
							c.event.triggered = true;
							e[j]()
						}
					} catch (s) {}
					if ( k ) e["on" + j] = k;
					c.event.triggered = false
				}
			}
		},
		handle: function( a ) {
			var b, d, e;
			d = [];
			var f;
			a = c.makeArray(arguments)[0] = c.event.fix(a || y.event);
			a.currentTarget = this;
			b = a.type.indexOf(".") < 0 && !a.exclusive;
			if (!b ) {
				e = a.type.split(".");
				a.type = e.shift();
				d = e.slice(0).sort();
				e = new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.)?") + "(\\.|$)")
			}
			a.namespace = a.namespace || d.join(".");
			f = c.data(this, "events");
			d = (f || {})[a.type];
			if ( f && d ) {
				d = d.slice(0);
				f = 0;
				for ( var h = d.length; f < h; f++ ) {
					var k = d[f];
					if ( b || e.test(k.namespace) ) {
						a.handler = k.handler;
						a.data = k.data;
						a.handleObj = k;
						var j = a.handled;
						ret = k.handler.apply(this, arguments);
						a.handled = a.handled === null || k.handler === ma ? j : true;
						if ( ret !== w ) {
							a.result = ret;
							if ( ret === false ) {
								a.preventDefault();
								a.stopPropagation()
							}
						}
						if ( a.isImmediatePropagationStopped() ) break
					}
				}
			}
			return a.result
		},
		props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
		fix: function( a ) {
			if ( a[c.expando] ) return a;
			var b = a;
			a = c.Event(b);
			for ( var d = this.props.length, e; d; ) {
				e = this.props[--d];
				a[e] = b[e]
			}
			if (!a.target ) a.target = a.srcElement || document;
			if ( a.target.nodeType === 3 ) a.target = a.target.parentNode;
			if (!a.relatedTarget && a.fromElement ) a.relatedTarget = a.fromElement === a.target ? a.toElement : a.fromElement;
			if ( a.pageX == null && a.clientX != null ) {
				b = document.documentElement;
				d = document.body;
				a.pageX = a.clientX + (b && b.scrollLeft || d && d.scrollLeft || 0) - (b && b.clientLeft || d && d.clientLeft || 0);
				a.pageY =
				a.clientY + (b && b.scrollTop || d && d.scrollTop || 0) - (b && b.clientTop || d && d.clientTop || 0)
			}
			if (!a.which && (a.charCode || a.charCode === 0 ? a.charCode : a.keyCode) ) a.which = a.charCode || a.keyCode;
			if (!a.metaKey && a.ctrlKey ) a.metaKey = a.ctrlKey;
			if (!a.which && a.button !== w ) a.which = a.button & 1 ? 1 : a.button & 2 ? 3 : a.button & 4 ? 2 : 0;
			return a
		},
		guid: 1E8,
		proxy: c.proxy,
		special: {
			ready: {
				setup: c.bindReady,
				teardown: c.noop
			},
			live: {
				add: function( a ) {
					c.event.add(this, P(a.origType, a.selector), c.extend({}, a, {
						handler: ma,
						guid: a.handler.guid
					}))
				},
				remove: function( a ) {
					c.event.remove(this, P(a.origType, a.selector), a)
				}
			},
			beforeunload: {
				setup: function( a, b, d ) {
					if ( this.setInterval ) this.onbeforeunload = d
				},
				teardown: function( a, b ) {
					if ( this.onbeforeunload === b ) this.onbeforeunload = null
				}
			}
		}
	};
	var Ea = document.removeEventListener ?
	function( a, b, d ) {
		a.removeEventListener && a.removeEventListener(b, d, false)
	} : function( a, b, d ) {
		a.detachEvent && a.detachEvent("on" + b, d)
	};
	c.Event = function( a ) {
		if (!this.preventDefault ) return new c.Event(a);
		if ( a && a.type ) {
			this.originalEvent = a;
			this.type = a.type
		} else this.type = a;
		this.timeStamp =
		c.now();
		this[c.expando] = true
	};
	c.Event.prototype = {
		preventDefault: function() {
			this.isDefaultPrevented = W;
			var a = this.originalEvent;
			if ( a ) {
				a.preventDefault && a.preventDefault();
				a.returnValue = false
			}
		},
		stopPropagation: function() {
			this.isPropagationStopped = W;
			var a = this.originalEvent;
			if ( a ) {
				a.stopPropagation && a.stopPropagation();
				a.cancelBubble = true
			}
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = W;
			this.stopPropagation()
		},
		isDefaultPrevented: K,
		isPropagationStopped: K,
		isImmediatePropagationStopped: K
	};
	var Fa = function( a ) {
		var b = a.relatedTarget;
		try {
			for (; b && b !== this; ) b = b.parentNode;
			if ( b !== this ) {
				a.type = a.data;
				c.event.handle.apply(this, arguments)
			}
		} catch (d) {}
	},
		Ga = function( a ) {
			a.type = a.data;
			c.event.handle.apply(this, arguments)
		};
	c.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function( a, b ) {
		c.event.special[a] = {
			setup: function( d ) {
				c.event.add(this, b, d && d.selector ? Ga : Fa, a)
			},
			teardown: function( d ) {
				c.event.remove(this, b, d && d.selector ? Ga : Fa)
			}
		}
	});
	if (!c.support.submitBubbles ) c.event.special.submit = {
		setup: function() {
			if ( this.nodeName.toLowerCase() !== "form" ) {
				c.event.add(this, "click.specialSubmit", function( a ) {
					var b = a.target,
						d = b.type;
					if ((d === "submit" || d === "image") && c(b).closest("form").length ) return la("submit", this, arguments)
				});
				c.event.add(this, "keypress.specialSubmit", function( a ) {
					var b = a.target,
						d = b.type;
					if ((d === "text" || d === "password") && c(b).closest("form").length && a.keyCode === 13 ) return la("submit", this, arguments)
				})
			} else return false
		},
		teardown: function() {
			c.event.remove(this, ".specialSubmit")
		}
	};
	if (!c.support.changeBubbles ) {
		var da = /textarea|input|select/i,
			ea, Ha = function( a ) {
				var b = a.type,
					d = a.value;
				if ( b === "radio" || b === "checkbox" ) d = a.checked;
				else if ( b === "select-multiple" ) d = a.selectedIndex > -1 ? c.map(a.options, function( e ) {
					return e.selected
				}).join("-") : "";
				else if ( a.nodeName.toLowerCase() === "select" ) d = a.selectedIndex;
				return d
			},
			S = function( a, b ) {
				var d = a.target,
					e, f;
				if (!(!da.test(d.nodeName) || d.readOnly)) {
					e = c.data(d, "_change_data");
					f = Ha(d);
					if ( a.type !== "focusout" || d.type !== "radio" ) c.data(d, "_change_data", f);
					if (!(e === w || f === e)) if ( e != null || f ) {
						a.type = "change";
						return c.event.trigger(a, b, d)
					}
				}
			};
		c.event.special.change = {
			filters: {
				focusout: S,
				beforedeactivate: S,
				click: function( a ) {
					var b = a.target,
						d = b.type;
					if ( d === "radio" || d === "checkbox" || b.nodeName.toLowerCase() === "select" ) return S.call(this, a)
				},
				keydown: function( a ) {
					var b = a.target,
						d = b.type;
					if ( a.keyCode === 13 && b.nodeName.toLowerCase() !== "textarea" || a.keyCode === 32 && (d === "checkbox" || d === "radio") || d === "select-multiple" ) return S.call(this, a)
				},
				beforeactivate: function( a ) {
					a = a.target;
					c.data(a, "_change_data", Ha(a))
				}
			},
			setup: function() {
				if ( this.type === "file" ) return false;
				for ( var a in ea ) c.event.add(this, a + ".specialChange", ea[a]);
				return da.test(this.nodeName)
			},
			teardown: function() {
				c.event.remove(this, ".specialChange");
				return da.test(this.nodeName)
			}
		};
		ea = c.event.special.change.filters
	}
	document.addEventListener && c.each({
		focus: "focusin",
		blur: "focusout"
	}, function( a, b ) {
		function d(e) {
			e = c.event.fix(e);
			e.type = b;
			return c.event.trigger(e, null, e.target)
		}
		c.event.special[b] = {
			setup: function() {
				R[b] === 0 && document.addEventListener(a, d, true);
				R[b]++
			},
			teardown: function() {
				R[b]--;
				R[b] === 0 && document.removeEventListener(a, d, true)
			}
		}
	});
	c.each(["bind", "one"], function( a, b ) {
		c.fn[b] = function( d, e, f ) {
			if ( typeof d === "object" ) {
				for ( var h in d ) this[b](h, e, d[h], f);
				return this
			}
			if ( c.isFunction(e) || e === false ) {
				f = e;
				e = w
			}
			var k = b === "one" ? c.proxy(f, function( l ) {
				c(this).unbind(l, k);
				return f.apply(this, arguments)
			}) : f;
			if ( d === "unload" && b !== "one" ) this.one(d, e, f);
			else {
				h = 0;
				for ( var j = this.length; h < j; h++ ) c.event.add(this[h], d, k, e)
			}
			return this
		}
	});
	c.fn.extend({
		unbind: function( a, b ) {
			if ( typeof a === "object" && !a.preventDefault ) for ( var d in a ) this.unbind(d, a[d]);
			else {
				d = 0;
				for ( var e = this.length; d < e; d++ ) c.event.remove(this[d], a, b)
			}
			return this
		},
		delegate: function( a, b, d, e ) {
			return this.live(b, d, e, a)
		},
		undelegate: function( a, b, d ) {
			return arguments.length === 0 ? this.unbind("live") : this.die(b, null, d, a)
		},
		trigger: function( a, b ) {
			return this.each(function() {
				c.event.trigger(a, b, this)
			})
		},
		triggerHandler: function( a, b ) {
			if ( this[0] ) {
				a = c.Event(a);
				a.preventDefault();
				a.stopPropagation();
				c.event.trigger(a, b, this[0]);
				return a.result
			}
		},
		toggle: function( a ) {
			for ( var b = arguments, d = 1; d < b.length; ) c.proxy(a, b[d++]);
			return this.click(c.proxy(a, function( e ) {
				var f = (c.data(this, "lastToggle" + a.guid) || 0) % d;
				c.data(this, "lastToggle" + a.guid, f + 1);
				e.preventDefault();
				return b[f].apply(this, arguments) || false
			}))
		},
		hover: function( a, b ) {
			return this.mouseenter(a).mouseleave(b || a)
		}
	});
	var Ia = {
		focus: "focusin",
		blur: "focusout",
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	};
	c.each(["live", "die"], function( a, b ) {
		c.fn[b] = function( d, e, f, h ) {
			var k = 0,
				j, l, r = h || this.selector,
				s = h ? this : c(this.context);
			if ( c.isFunction(e) ) {
				f =
				e;
				e = w
			}
			for ( d = (d || "").split(" ");
			(h = d[k++]) != null; ) {
				j = X.exec(h);
				l = "";
				if ( j ) {
					l = j[0];
					h = h.replace(X, "")
				}
				if ( h === "hover" ) d.push("mouseenter" + l, "mouseleave" + l);
				else {
					j = h;
					if ( h === "focus" || h === "blur" ) {
						d.push(Ia[h] + l);
						h += l
					} else h = (Ia[h] || h) + l;
					if ( b === "live" ) {
						l = 0;
						for ( var t = s.length; l < t; l++ ) c.event.add(s[l], "live." + P(h, r), {
							data: e,
							selector: r,
							handler: f,
							origType: h,
							origHandler: f,
							preType: j
						})
					} else s.unbind("live." + P(h, r), f)
				}
			}
			return this
		}
	});
	c.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "), function( a, b ) {
		c.fn[b] = function( d, e ) {
			if ( e == null ) {
				e = d;
				d = null
			}
			return arguments.length > 0 ? this.bind(b, d, e) : this.trigger(b)
		};
		if ( c.attrFn ) c.attrFn[b] = true
	});
	y.attachEvent && !y.addEventListener && y.attachEvent("onunload", function() {
		for ( var a in c.cache ) if ( c.cache[a].handle ) try {
			c.event.remove(c.cache[a].handle.elem)
		} catch (b) {}
	});
	(function() {
		function a(g, i, m, n, o, p) {
			o = 0;
			for ( var v = n.length; o < v; o++ ) {
				var u = n[o];
				if ( u ) {
					u = u[g];
					for ( var x = false; u; ) {
						if ( u.sizcache === m ) {
							x = n[u.sizset];
							break
						}
						if ( u.nodeType === 1 && !p ) {
							u.sizcache =
							m;
							u.sizset = o
						}
						if ( u.nodeName.toLowerCase() === i ) {
							x = u;
							break
						}
						u = u[g]
					}
					n[o] = x
				}
			}
		}
		function b(g, i, m, n, o, p) {
			o = 0;
			for ( var v = n.length; o < v; o++ ) {
				var u = n[o];
				if ( u ) {
					u = u[g];
					for ( var x = false; u; ) {
						if ( u.sizcache === m ) {
							x = n[u.sizset];
							break
						}
						if ( u.nodeType === 1 ) {
							if (!p ) {
								u.sizcache = m;
								u.sizset = o
							}
							if ( typeof i !== "string" ) {
								if ( u === i ) {
									x = true;
									break
								}
							} else if ( j.filter(i, [u]).length > 0 ) {
								x = u;
								break
							}
						}
						u = u[g]
					}
					n[o] = x
				}
			}
		}
		var d = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
			e = 0,
			f = Object.prototype.toString,
			h = false,
			k = true;
		[0, 0].sort(function() {
			k = false;
			return 0
		});
		var j = function( g, i, m, n ) {
			m = m || [];
			var o = i = i || document;
			if ( i.nodeType !== 1 && i.nodeType !== 9 ) return [];
			if (!g || typeof g !== "string" ) return m;
			var p = [],
				v, u, x, O, E = true,
				I = j.isXML(i),
				F = g,
				B;
			do {
				d.exec("");
				if ( v = d.exec(F) ) {
					F = v[3];
					p.push(v[1]);
					if ( v[2] ) {
						O = v[3];
						break
					}
				}
			} while ( v );
			if ( p.length > 1 && r.exec(g) ) if ( p.length === 2 && l.relative[p[0]] ) u = D(p[0] + p[1], i);
			else for ( u = l.relative[p[0]] ? [i] : j(p.shift(), i); p.length; ) {
				g = p.shift();
				if ( l.relative[g] ) g += p.shift();
				u = D(g, u)
			} else {
				if (!n && p.length > 1 && i.nodeType === 9 && !I && l.match.ID.test(p[0]) && !l.match.ID.test(p[p.length - 1]) ) {
					v = j.find(p.shift(), i, I);
					i = v.expr ? j.filter(v.expr, v.set)[0] : v.set[0]
				}
				if ( i ) {
					v = n ? {
						expr: p.pop(),
						set: q(n)
					} : j.find(p.pop(), p.length === 1 && (p[0] === "~" || p[0] === "+") && i.parentNode ? i.parentNode : i, I);
					u = v.expr ? j.filter(v.expr, v.set) : v.set;
					if ( p.length > 0 ) x = q(u);
					else E = false;
					for (; p.length; ) {
						v = B = p.pop();
						if ( l.relative[B] ) v = p.pop();
						else B = "";
						if ( v == null ) v = i;
						l.relative[B](x, v, I)
					}
				} else x = []
			}
			x || (x = u);
			x || j.error(B || g);
			if ( f.call(x) === "[object Array]" ) if ( E ) if ( i && i.nodeType === 1 ) for ( g = 0; x[g] != null; g++ ) {
				if ( x[g] && (x[g] === true || x[g].nodeType === 1 && j.contains(i, x[g])) ) m.push(u[g])
			} else for ( g = 0; x[g] != null; g++ ) x[g] && x[g].nodeType === 1 && m.push(u[g]);
			else m.push.apply(m, x);
			else q(x, m);
			if ( O ) {
				j(O, o, m, n);
				j.uniqueSort(m)
			}
			return m
		};
		j.uniqueSort = function( g ) {
			if ( A ) {
				h = k;
				g.sort(A);
				if ( h ) for ( var i = 1; i < g.length; i++ ) g[i] === g[i - 1] && g.splice(i--, 1)
			}
			return g
		};
		j.matches = function( g, i ) {
			return j(g, null, null, i)
		};
		j.find = function( g, i, m ) {
			var n;
			if (!g ) return [];
			for ( var o = 0, p = l.order.length; o < p; o++ ) {
				var v = l.order[o],
					u;
				if ( u = l.leftMatch[v].exec(g) ) {
					var x = u[1];
					u.splice(1, 1);
					if ( x.substr(x.length - 1) !== "\\" ) {
						u[1] = (u[1] || "").replace(/\\/g, "");
						n = l.find[v](u, i, m);
						if ( n != null ) {
							g = g.replace(l.match[v], "");
							break
						}
					}
				}
			}
			n || (n = i.getElementsByTagName("*"));
			return {
				set: n,
				expr: g
			}
		};
		j.filter = function( g, i, m, n ) {
			for ( var o = g, p = [], v = i, u, x, O = i && i[0] && j.isXML(i[0]); g && i.length; ) {
				for ( var E in l.filter ) if ((u = l.leftMatch[E].exec(g)) != null && u[2] ) {
					var I = l.filter[E],
						F, B;
					B = u[1];
					x = false;
					u.splice(1, 1);
					if ( B.substr(B.length - 1) !== "\\" ) {
						if ( v === p ) p = [];
						if ( l.preFilter[E] ) if ( u = l.preFilter[E](u, v, m, p, n, O) ) {
							if ( u === true ) continue
						} else x = F = true;
						if ( u ) for ( var T = 0;
						(B = v[T]) != null; T++ ) if ( B ) {
							F = I(B, u, T, v);
							var Ja = n ^ !! F;
							if ( m && F != null ) if ( Ja ) x = true;
							else v[T] = false;
							else if ( Ja ) {
								p.push(B);
								x = true
							}
						}
						if ( F !== w ) {
							m || (v = p);
							g = g.replace(l.match[E], "");
							if (!x ) return [];
							break
						}
					}
				}
				if ( g === o ) if ( x == null ) j.error(g);
				else break;
				o = g
			}
			return v
		};
		j.error = function( g ) {
			throw "Syntax error, unrecognized expression: " + g;
		};
		var l = j.selectors = {
			order: ["ID", "NAME", "TAG"],
			match: {
				ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
				ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
				TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
				CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
				POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
				PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			},
			leftMatch: {},
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			attrHandle: {
				href: function( g ) {
					return g.getAttribute("href")
				}
			},
			relative: {
				"+": function( g, i ) {
					var m = typeof i === "string",
						n = m && !/\W/.test(i);
					m = m && !n;
					if ( n ) i = i.toLowerCase();
					n = 0;
					for ( var o = g.length, p; n < o; n++ ) if ( p = g[n] ) {
						for (;
						(p = p.previousSibling) && p.nodeType !== 1; );
						g[n] = m || p && p.nodeName.toLowerCase() === i ? p || false : p === i
					}
					m && j.filter(i, g, true)
				},
				">": function( g, i ) {
					var m = typeof i === "string",
						n, o = 0,
						p = g.length;
					if ( m && !/\W/.test(i) ) for ( i = i.toLowerCase(); o < p; o++ ) {
						if ( n =
						g[o] ) {
							m = n.parentNode;
							g[o] = m.nodeName.toLowerCase() === i ? m : false
						}
					} else {
						for (; o < p; o++ ) if ( n = g[o] ) g[o] = m ? n.parentNode : n.parentNode === i;
						m && j.filter(i, g, true)
					}
				},
				"": function( g, i, m ) {
					var n = e++,
						o = b,
						p;
					if ( typeof i === "string" && !/\W/.test(i) ) {
						p = i = i.toLowerCase();
						o = a
					}
					o("parentNode", i, n, g, p, m)
				},
				"~": function( g, i, m ) {
					var n = e++,
						o = b,
						p;
					if ( typeof i === "string" && !/\W/.test(i) ) {
						p = i = i.toLowerCase();
						o = a
					}
					o("previousSibling", i, n, g, p, m)
				}
			},
			find: {
				ID: function( g, i, m ) {
					if ( typeof i.getElementById !== "undefined" && !m ) return (g = i.getElementById(g[1])) ? [g] : []
				},
				NAME: function( g, i ) {
					if ( typeof i.getElementsByName !== "undefined" ) {
						var m = [];
						i = i.getElementsByName(g[1]);
						for ( var n = 0, o = i.length; n < o; n++ ) i[n].getAttribute("name") === g[1] && m.push(i[n]);
						return m.length === 0 ? null : m
					}
				},
				TAG: function( g, i ) {
					return i.getElementsByTagName(g[1])
				}
			},
			preFilter: {
				CLASS: function( g, i, m, n, o, p ) {
					g = " " + g[1].replace(/\\/g, "") + " ";
					if ( p ) return g;
					p = 0;
					for ( var v;
					(v = i[p]) != null; p++ ) if ( v ) if ( o ^ (v.className && (" " + v.className + " ").replace(/[\t\n]/g, " ").indexOf(g) >= 0) ) m || n.push(v);
					else if ( m ) i[p] = false;
					return false
				},
				ID: function( g ) {
					return g[1].replace(/\\/g, "")
				},
				TAG: function( g ) {
					return g[1].toLowerCase()
				},
				CHILD: function( g ) {
					if ( g[1] === "nth" ) {
						var i = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(g[2] === "even" && "2n" || g[2] === "odd" && "2n+1" || !/\D/.test(g[2]) && "0n+" + g[2] || g[2]);
						g[2] = i[1] + (i[2] || 1) - 0;
						g[3] = i[3] - 0
					}
					g[0] = e++;
					return g
				},
				ATTR: function( g, i, m, n, o, p ) {
					i = g[1].replace(/\\/g, "");
					if (!p && l.attrMap[i] ) g[1] = l.attrMap[i];
					if ( g[2] === "~=" ) g[4] = " " + g[4] + " ";
					return g
				},
				PSEUDO: function( g, i, m, n, o ) {
					if ( g[1] === "not" ) if ((d.exec(g[3]) || "").length > 1 || /^\w/.test(g[3]) ) g[3] = j(g[3], null, null, i);
					else {
						g = j.filter(g[3], i, m, true ^ o);
						m || n.push.apply(n, g);
						return false
					} else if ( l.match.POS.test(g[0]) || l.match.CHILD.test(g[0]) ) return true;
					return g
				},
				POS: function( g ) {
					g.unshift(true);
					return g
				}
			},
			filters: {
				enabled: function( g ) {
					return g.disabled === false && g.type !== "hidden"
				},
				disabled: function( g ) {
					return g.disabled === true
				},
				checked: function( g ) {
					return g.checked === true
				},
				selected: function( g ) {
					return g.selected === true
				},
				parent: function( g ) {
					return !!g.firstChild
				},
				empty: function( g ) {
					return !g.firstChild
				},
				has: function( g, i, m ) {
					return !!j(m[3], g).length
				},
				header: function( g ) {
					return /h\d/i.test(g.nodeName)
				},
				text: function( g ) {
					return "text" === g.type
				},
				radio: function( g ) {
					return "radio" === g.type
				},
				checkbox: function( g ) {
					return "checkbox" === g.type
				},
				file: function( g ) {
					return "file" === g.type
				},
				password: function( g ) {
					return "password" === g.type
				},
				submit: function( g ) {
					return "submit" === g.type
				},
				image: function( g ) {
					return "image" === g.type
				},
				reset: function( g ) {
					return "reset" === g.type
				},
				button: function( g ) {
					return "button" === g.type || g.nodeName.toLowerCase() === "button"
				},
				input: function( g ) {
					return /input|select|textarea|button/i.test(g.nodeName)
				}
			},
			setFilters: {
				first: function( g, i ) {
					return i === 0
				},
				last: function( g, i, m, n ) {
					return i === n.length - 1
				},
				even: function( g, i ) {
					return i % 2 === 0
				},
				odd: function( g, i ) {
					return i % 2 === 1
				},
				lt: function( g, i, m ) {
					return i < m[3] - 0
				},
				gt: function( g, i, m ) {
					return i > m[3] - 0
				},
				nth: function( g, i, m ) {
					return m[3] - 0 === i
				},
				eq: function( g, i, m ) {
					return m[3] - 0 === i
				}
			},
			filter: {
				PSEUDO: function( g, i, m, n ) {
					var o = i[1],
						p = l.filters[o];
					if ( p ) return p(g, m, i, n);
					else if ( o === "contains" ) return (g.textContent || g.innerText || j.getText([g]) || "").indexOf(i[3]) >= 0;
					else if ( o === "not" ) {
						i = i[3];
						m = 0;
						for ( n = i.length; m < n; m++ ) if ( i[m] === g ) return false;
						return true
					} else j.error("Syntax error, unrecognized expression: " + o)
				},
				CHILD: function( g, i ) {
					var m = i[1],
						n = g;
					switch ( m ) {
					case "only":
					case "first":
						for (; n = n.previousSibling; ) if ( n.nodeType === 1 ) return false;
						if ( m === "first" ) return true;
						n = g;
					case "last":
						for (; n = n.nextSibling; ) if ( n.nodeType === 1 ) return false;
						return true;
					case "nth":
						m = i[2];
						var o = i[3];
						if ( m === 1 && o === 0 ) return true;
						i = i[0];
						var p =
						g.parentNode;
						if ( p && (p.sizcache !== i || !g.nodeIndex) ) {
							var v = 0;
							for ( n = p.firstChild; n; n = n.nextSibling ) if ( n.nodeType === 1 ) n.nodeIndex = ++v;
							p.sizcache = i
						}
						g = g.nodeIndex - o;
						return m === 0 ? g === 0 : g % m === 0 && g / m >= 0
					}
				},
				ID: function( g, i ) {
					return g.nodeType === 1 && g.getAttribute("id") === i
				},
				TAG: function( g, i ) {
					return i === "*" && g.nodeType === 1 || g.nodeName.toLowerCase() === i
				},
				CLASS: function( g, i ) {
					return (" " + (g.className || g.getAttribute("class")) + " ").indexOf(i) > -1
				},
				ATTR: function( g, i ) {
					var m = i[1];
					g = l.attrHandle[m] ? l.attrHandle[m](g) : g[m] != null ? g[m] : g.getAttribute(m);
					m = g + "";
					var n = i[2];
					i = i[4];
					return g == null ? n === "!=" : n === "=" ? m === i : n === "*=" ? m.indexOf(i) >= 0 : n === "~=" ? (" " + m + " ").indexOf(i) >= 0 : !i ? m && g !== false : n === "!=" ? m !== i : n === "^=" ? m.indexOf(i) === 0 : n === "$=" ? m.substr(m.length - i.length) === i : n === "|=" ? m === i || m.substr(0, i.length + 1) === i + "-" : false
				},
				POS: function( g, i, m, n ) {
					var o = l.setFilters[i[2]];
					if ( o ) return o(g, m, i, n)
				}
			}
		},
			r = l.match.POS,
			s = function( g, i ) {
				return "\\" + (i - 0 + 1)
			};
		for ( var t in l.match ) {
			l.match[t] = new RegExp(l.match[t].source + /(?![^\[]*\])(?![^\(]*\))/.source);
			l.leftMatch[t] = new RegExp(/(^(?:.|\r|\n)*?)/.source + l.match[t].source.replace(/\\(\d+)/g, s))
		}
		var q = function( g, i ) {
			g = Array.prototype.slice.call(g, 0);
			if ( i ) {
				i.push.apply(i, g);
				return i
			}
			return g
		};
		try {
			Array.prototype.slice.call(document.documentElement.childNodes, 0)
		} catch (z) {
			q = function( g, i ) {
				i = i || [];
				var m = 0;
				if ( f.call(g) === "[object Array]" ) Array.prototype.push.apply(i, g);
				else if ( typeof g.length === "number" ) for ( var n = g.length; m < n; m++ ) i.push(g[m]);
				else for (; g[m]; m++ ) i.push(g[m]);
				return i
			}
		}
		var A;
		if ( document.documentElement.compareDocumentPosition ) A = function( g, i ) {
			if (!g.compareDocumentPosition || !i.compareDocumentPosition ) {
				if ( g == i ) h = true;
				return g.compareDocumentPosition ? -1 : 1
			}
			g = g.compareDocumentPosition(i) & 4 ? -1 : g === i ? 0 : 1;
			if ( g === 0 ) h = true;
			return g
		};
		else if ("sourceIndex" in document.documentElement ) A = function( g, i ) {
			if (!g.sourceIndex || !i.sourceIndex ) {
				if ( g == i ) h = true;
				return g.sourceIndex ? -1 : 1
			}
			g = g.sourceIndex - i.sourceIndex;
			if ( g === 0 ) h = true;
			return g
		};
		else if ( document.createRange ) A = function( g, i ) {
			if (!g.ownerDocument || !i.ownerDocument ) {
				if ( g == i ) h = true;
				return g.ownerDocument ? -1 : 1
			}
			var m = g.ownerDocument.createRange(),
				n = i.ownerDocument.createRange();
			m.setStart(g, 0);
			m.setEnd(g, 0);
			n.setStart(i, 0);
			n.setEnd(i, 0);
			g = m.compareBoundaryPoints(Range.START_TO_END, n);
			if ( g === 0 ) h = true;
			return g
		};
		j.getText = function( g ) {
			for ( var i = "", m, n = 0; g[n]; n++ ) {
				m = g[n];
				if ( m.nodeType === 3 || m.nodeType === 4 ) i += m.nodeValue;
				else if ( m.nodeType !== 8 ) i += j.getText(m.childNodes)
			}
			return i
		};
		(function() {
			var g = document.createElement("div"),
				i = "script" + (new Date).getTime();
			g.innerHTML = "<a name='" + i + "'/>";
			var m = document.documentElement;
			m.insertBefore(g, m.firstChild);
			if ( document.getElementById(i) ) {
				l.find.ID = function( n, o, p ) {
					if ( typeof o.getElementById !== "undefined" && !p ) return (o = o.getElementById(n[1])) ? o.id === n[1] || typeof o.getAttributeNode !== "undefined" && o.getAttributeNode("id").nodeValue === n[1] ? [o] : w : []
				};
				l.filter.ID = function( n, o ) {
					var p = typeof n.getAttributeNode !== "undefined" && n.getAttributeNode("id");
					return n.nodeType === 1 && p && p.nodeValue === o
				}
			}
			m.removeChild(g);
			m = g = null
		})();
		(function() {
			var g = document.createElement("div");
			g.appendChild(document.createComment(""));
			if ( g.getElementsByTagName("*").length > 0 ) l.find.TAG = function( i, m ) {
				m = m.getElementsByTagName(i[1]);
				if ( i[1] === "*" ) {
					i = [];
					for ( var n = 0; m[n]; n++ ) m[n].nodeType === 1 && i.push(m[n]);
					m = i
				}
				return m
			};
			g.innerHTML = "<a href='#'></a>";
			if ( g.firstChild && typeof g.firstChild.getAttribute !== "undefined" && g.firstChild.getAttribute("href") !== "#" ) l.attrHandle.href = function( i ) {
				return i.getAttribute("href", 2)
			};
			g = null
		})();
		document.querySelectorAll &&
		function() {
			var g = j,
				i = document.createElement("div");
			i.innerHTML = "<p class='TEST'></p>";
			if (!(i.querySelectorAll && i.querySelectorAll(".TEST").length === 0)) {
				j = function( n, o, p, v ) {
					o = o || document;
					if (!v && o.nodeType === 9 && !j.isXML(o) ) try {
						return q(o.querySelectorAll(n), p)
					} catch (u) {}
					return g(n, o, p, v)
				};
				for ( var m in g ) j[m] = g[m];
				i = null
			}
		}();
		(function() {
			var g = document.createElement("div");
			g.innerHTML = "<div class='test e'></div><div class='test'></div>";
			if (!(!g.getElementsByClassName || g.getElementsByClassName("e").length === 0)) {
				g.lastChild.className = "e";
				if ( g.getElementsByClassName("e").length !== 1 ) {
					l.order.splice(1, 0, "CLASS");
					l.find.CLASS = function( i, m, n ) {
						if ( typeof m.getElementsByClassName !== "undefined" && !n ) return m.getElementsByClassName(i[1])
					};
					g = null
				}
			}
		})();
		j.contains = document.compareDocumentPosition ?
		function( g, i ) {
			return !!(g.compareDocumentPosition(i) & 16)
		} : function( g, i ) {
			return g !== i && (g.contains ? g.contains(i) : true)
		};
		j.isXML = function( g ) {
			return (g = (g ? g.ownerDocument || g : 0).documentElement) ? g.nodeName !== "HTML" : false
		};
		var D = function( g, i ) {
			var m = [],
				n = "",
				o;
			for ( i = i.nodeType ? [i] : i; o = l.match.PSEUDO.exec(g); ) {
				n += o[0];
				g =
				g.replace(l.match.PSEUDO, "")
			}
			g = l.relative[g] ? g + "*" : g;
			o = 0;
			for ( var p = i.length; o < p; o++ ) j(g, i[o], m);
			return j.filter(n, m)
		};
		c.find = j;
		c.expr = j.selectors;
		c.expr[":"] = c.expr.filters;
		c.unique = j.uniqueSort;
		c.text = j.getText;
		c.isXMLDoc = j.isXML;
		c.contains = j.contains
	})();
	var gb = /Until$/,
		hb = /^(?:parents|prevUntil|prevAll)/,
		ib = /,/;
	pa = /^.[^:#\[\.,]*$/;
	N = Array.prototype.slice;
	c.fn.extend({
		find: function( a ) {
			for ( var b = this.pushStack("", "find", a), d = 0, e = 0, f = this.length; e < f; e++ ) {
				d = b.length;
				c.find(a, this[e], b);
				if ( e > 0 ) for ( var h =
				d; h < b.length; h++ ) for ( var k = 0; k < d; k++ ) if ( b[k] === b[h] ) {
					b.splice(h--, 1);
					break
				}
			}
			return b
		},
		has: function( a ) {
			var b = c(a);
			return this.filter(function() {
				for ( var d = 0, e = b.length; d < e; d++ ) if ( c.contains(this, b[d]) ) return true
			})
		},
		not: function( a ) {
			return this.pushStack(oa(this, a, false), "not", a)
		},
		filter: function( a ) {
			return this.pushStack(oa(this, a, true), "filter", a)
		},
		is: function( a ) {
			return !!a && c.filter(a, this).length > 0
		},
		closest: function( a, b ) {
			if ( c.isArray(a) ) {
				var d = [],
					e = this[0],
					f, h = {},
					k, j = 1;
				if ( e && a.length ) {
					f = 0;
					for ( var l =
					a.length; f < l; f++ ) {
						k = a[f];
						h[k] || (h[k] = c.expr.match.POS.test(k) ? c(k, b || this.context) : k)
					}
					for (; e && e.ownerDocument && e !== b; ) {
						for ( k in h ) {
							f = h[k];
							if ( f.jquery ? f.index(e) > -1 : c(e).is(f) ) d.push({
								selector: k,
								elem: e,
								level: j
							})
						}
						e = e.parentNode;
						j++
					}
				}
				return d
			}
			var r = c.expr.match.POS.test(a) ? c(a, b || this.context) : null;
			return this.map(function( s, t ) {
				for (; t && t.ownerDocument && t !== b; ) {
					if ( r ? r.index(t) > -1 : c(t).is(a) ) return t;
					t = t.parentNode
				}
				return null
			})
		},
		index: function( a ) {
			if (!a || typeof a === "string" ) return c.inArray(this[0], a ? c(a) : this.parent().children());
			return c.inArray(a.jquery ? a[0] : a, this)
		},
		add: function( a, b ) {
			a = typeof a === "string" ? c(a, b || this.context) : c.makeArray(a);
			b = c.merge(this.get(), a);
			return this.pushStack(na(a[0]) || na(b[0]) ? b : c.unique(b))
		},
		andSelf: function() {
			return this.add(this.prevObject)
		}
	});
	c.each({
		parent: function( a ) {
			return (a = a.parentNode) && a.nodeType !== 11 ? a : null
		},
		parents: function( a ) {
			return c.dir(a, "parentNode")
		},
		parentsUntil: function( a, b, d ) {
			return c.dir(a, "parentNode", d)
		},
		next: function( a ) {
			return c.nth(a, 2, "nextSibling")
		},
		prev: function( a ) {
			return c.nth(a, 2, "previousSibling")
		},
		nextAll: function( a ) {
			return c.dir(a, "nextSibling")
		},
		prevAll: function( a ) {
			return c.dir(a, "previousSibling")
		},
		nextUntil: function( a, b, d ) {
			return c.dir(a, "nextSibling", d)
		},
		prevUntil: function( a, b, d ) {
			return c.dir(a, "previousSibling", d)
		},
		siblings: function( a ) {
			return c.sibling(a.parentNode.firstChild, a)
		},
		children: function( a ) {
			return c.sibling(a.firstChild)
		},
		contents: function( a ) {
			return c.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : c.makeArray(a.childNodes)
		}
	}, function( a, b ) {
		c.fn[a] = function( d, e ) {
			var f = c.map(this, b, d);
			gb.test(a) || (e = d);
			if ( e && typeof e === "string" ) f = c.filter(e, f);
			f = this.length > 1 ? c.unique(f) : f;
			if ((this.length > 1 || ib.test(e)) && hb.test(a) ) f = f.reverse();
			return this.pushStack(f, a, N.call(arguments).join(","))
		}
	});
	c.extend({
		filter: function( a, b, d ) {
			if ( d ) a = ":not(" + a + ")";
			return c.find.matches(a, b)
		},
		dir: function( a, b, d ) {
			var e = [];
			for ( a = a[b]; a && a.nodeType !== 9 && (d === w || a.nodeType !== 1 || !c(a).is(d)); ) {
				a.nodeType === 1 && e.push(a);
				a = a[b]
			}
			return e
		},
		nth: function( a, b, d ) {
			b = b || 1;
			for ( var e = 0; a; a = a[d] ) if ( a.nodeType === 1 && ++e === b ) break;
			return a
		},
		sibling: function( a, b ) {
			for ( var d = []; a; a = a.nextSibling ) a.nodeType === 1 && a !== b && d.push(a);
			return d
		}
	});
	var Ka = / jQuery\d+="(?:\d+|null)"/g,
		U = /^\s+/,
		La = /(<([\w:]+)[^>]*?)\/>/g,
		jb = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
		Ma = /<([\w:]+)/,
		kb = /<tbody/i,
		lb = /<|&#?\w+;/,
		sa = /<script|<object|<embed|<option|<style/i,
		ta = /checked\s*(?:[^=]|=\s*.checked.)/i,
		Na = function( a, b, d ) {
			return jb.test(d) ? a : b + "></" + d + ">"
		},
		C = {
			option: [1, "<select multiple='multiple'>", "</select>"],
			legend: [1, "<fieldset>", "</fieldset>"],
			thead: [1, "<table>", "</table>"],
			tr: [2, "<table><tbody>", "</tbody></table>"],
			td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
			col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
			area: [1, "<map>", "</map>"],
			_default: [0, "", ""]
		};
	C.optgroup = C.option;
	C.tbody = C.tfoot = C.colgroup = C.caption = C.thead;
	C.th = C.td;
	if (!c.support.htmlSerialize ) C._default = [1, "div<div>", "</div>"];
	c.fn.extend({
		text: function( a ) {
			if ( c.isFunction(a) ) return this.each(function( b ) {
				var d =
				c(this);
				d.text(a.call(this, b, d.text()))
			});
			if ( typeof a !== "object" && a !== w ) return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(a));
			return c.text(this)
		},
		wrapAll: function( a ) {
			if ( c.isFunction(a) ) return this.each(function( d ) {
				c(this).wrapAll(a.call(this, d))
			});
			if ( this[0] ) {
				var b = c(a, this[0].ownerDocument).eq(0).clone(true);
				this[0].parentNode && b.insertBefore(this[0]);
				b.map(function() {
					for ( var d = this; d.firstChild && d.firstChild.nodeType === 1; ) d = d.firstChild;
					return d
				}).append(this)
			}
			return this
		},
		wrapInner: function( a ) {
			if ( c.isFunction(a) ) return this.each(function( b ) {
				c(this).wrapInner(a.call(this, b))
			});
			return this.each(function() {
				var b = c(this),
					d = b.contents();
				d.length ? d.wrapAll(a) : b.append(a)
			})
		},
		wrap: function( a ) {
			return this.each(function() {
				c(this).wrapAll(a)
			})
		},
		unwrap: function() {
			return this.parent().each(function() {
				c.nodeName(this, "body") || c(this).replaceWith(this.childNodes)
			}).end()
		},
		append: function() {
			return this.domManip(arguments, true, function( a ) {
				this.nodeType === 1 && this.appendChild(a)
			})
		},
		prepend: function() {
			return this.domManip(arguments, true, function( a ) {
				this.nodeType === 1 && this.insertBefore(a, this.firstChild)
			})
		},
		before: function() {
			if ( this[0] && this[0].parentNode ) return this.domManip(arguments, false, function( b ) {
				this.parentNode.insertBefore(b, this)
			});
			else if ( arguments.length ) {
				var a = c(arguments[0]);
				a.push.apply(a, this.toArray());
				return this.pushStack(a, "before", arguments)
			}
		},
		after: function() {
			if ( this[0] && this[0].parentNode ) return this.domManip(arguments, false, function( b ) {
				this.parentNode.insertBefore(b, this.nextSibling)
			});
			else if ( arguments.length ) {
				var a = this.pushStack(this, "after", arguments);
				a.push.apply(a, c(arguments[0]).toArray());
				return a
			}
		},
		remove: function( a, b ) {
			for ( var d = 0, e;
			(e = this[d]) != null; d++ ) if (!a || c.filter(a, [e]).length ) {
				if (!b && e.nodeType === 1 ) {
					c.cleanData(e.getElementsByTagName("*"));
					c.cleanData([e])
				}
				e.parentNode && e.parentNode.removeChild(e)
			}
			return this
		},
		empty: function() {
			for ( var a = 0, b;
			(b = this[a]) != null; a++ ) for ( b.nodeType === 1 && c.cleanData(b.getElementsByTagName("*")); b.firstChild; ) b.removeChild(b.firstChild);
			return this
		},
		clone: function( a ) {
			var b = this.map(function() {
				if (!c.support.noCloneEvent && !c.isXMLDoc(this) ) {
					var d = this.outerHTML,
						e = this.ownerDocument;
					if (!d ) {
						d = e.createElement("div");
						d.appendChild(this.cloneNode(true));
						d = d.innerHTML
					}
					return c.clean([d.replace(Ka, "").replace(/\=([^="'>\s]+\/)>/g, '="$1">').replace(U, "")], e)[0]
				} else return this.cloneNode(true)
			});
			if ( a === true ) {
				qa(this, b);
				qa(this.find("*"), b.find("*"))
			}
			return b
		},
		html: function( a ) {
			if ( a === w ) return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(Ka, "") : null;
			else if ( typeof a === "string" && !sa.test(a) && (c.support.leadingWhitespace || !U.test(a)) && !C[(Ma.exec(a) || ["", ""])[1].toLowerCase()] ) {
				a = a.replace(La, Na);
				try {
					for ( var b = 0, d = this.length; b < d; b++ ) if ( this[b].nodeType === 1 ) {
						c.cleanData(this[b].getElementsByTagName("*"));
						this[b].innerHTML = a
					}
				} catch (e) {
					this.empty().append(a)
				}
			} else c.isFunction(a) ? this.each(function( f ) {
				var h = c(this),
					k = h.html();
				h.empty().append(function() {
					return a.call(this, f, k)
				})
			}) : this.empty().append(a);
			return this
		},
		replaceWith: function( a ) {
			if ( this[0] && this[0].parentNode ) {
				if ( c.isFunction(a) ) return this.each(function( b ) {
					var d = c(this),
						e = d.html();
					d.replaceWith(a.call(this, b, e))
				});
				if ( typeof a !== "string" ) a = c(a).detach();
				return this.each(function() {
					var b = this.nextSibling,
						d = this.parentNode;
					c(this).remove();
					b ? c(b).before(a) : c(d).append(a)
				})
			} else return this.pushStack(c(c.isFunction(a) ? a() : a), "replaceWith", a)
		},
		detach: function( a ) {
			return this.remove(a, true)
		},
		domManip: function( a, b, d ) {
			var e, f, h = a[0],
				k = [],
				j;
			if (!c.support.checkClone && arguments.length === 3 && typeof h === "string" && ta.test(h) ) return this.each(function() {
				c(this).domManip(a, b, d, true)
			});
			if ( c.isFunction(h) ) return this.each(function( s ) {
				var t = c(this);
				a[0] = h.call(this, s, b ? t.html() : w);
				t.domManip(a, b, d)
			});
			if ( this[0] ) {
				e = h && h.parentNode;
				e = c.support.parentNode && e && e.nodeType === 11 && e.childNodes.length === this.length ? {
					fragment: e
				} : ra(a, this, k);
				j = e.fragment;
				if ( f = j.childNodes.length === 1 ? (j = j.firstChild) : j.firstChild ) {
					b = b && c.nodeName(f, "tr");
					for ( var l = 0, r = this.length; l < r; l++ ) d.call(b ? Sa(this[l], f) : this[l], l > 0 || e.cacheable || this.length > 1 ? j.cloneNode(true) : j)
				}
				k.length && c.each(k, Ta)
			}
			return this
		}
	});
	c.fragments = {};
	c.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( a, b ) {
		c.fn[a] = function( d ) {
			var e = [];
			d = c(d);
			var f = this.length === 1 && this[0].parentNode;
			if ( f && f.nodeType === 11 && f.childNodes.length === 1 && d.length === 1 ) {
				d[b](this[0]);
				return this
			} else {
				f = 0;
				for ( var h = d.length; f < h; f++ ) {
					var k = (f > 0 ? this.clone(true) : this).get();
					c(d[f])[b](k);
					e = e.concat(k)
				}
				return this.pushStack(e, a, d.selector)
			}
		}
	});
	c.extend({
		clean: function( a, b, d, e ) {
			b = b || document;
			if ( typeof b.createElement === "undefined" ) b = b.ownerDocument || b[0] && b[0].ownerDocument || document;
			for ( var f = [], h = 0, k;
			(k = a[h]) != null; h++ ) {
				if ( typeof k === "number" ) k += "";
				if ( k ) {
					if ( typeof k === "string" && !lb.test(k) ) k = b.createTextNode(k);
					else if ( typeof k === "string" ) {
						k = k.replace(La, Na);
						var j = (Ma.exec(k) || ["", ""])[1].toLowerCase(),
							l = C[j] || C._default,
							r = l[0],
							s = b.createElement("div");
						for ( s.innerHTML = l[1] + k + l[2]; r--; ) s = s.lastChild;
						if (!c.support.tbody ) {
							r =
							kb.test(k);
							j = j === "table" && !r ? s.firstChild && s.firstChild.childNodes : l[1] === "<table>" && !r ? s.childNodes : [];
							for ( l = j.length - 1; l >= 0; --l ) c.nodeName(j[l], "tbody") && !j[l].childNodes.length && j[l].parentNode.removeChild(j[l])
						}!c.support.leadingWhitespace && U.test(k) && s.insertBefore(b.createTextNode(U.exec(k)[0]), s.firstChild);
						k = s.childNodes
					}
					if ( k.nodeType ) f.push(k);
					else f = c.merge(f, k)
				}
			}
			if ( d ) for ( h = 0; f[h]; h++ ) if ( e && c.nodeName(f[h], "script") && (!f[h].type || f[h].type.toLowerCase() === "text/javascript") ) e.push(f[h].parentNode ? f[h].parentNode.removeChild(f[h]) : f[h]);
			else {
				f[h].nodeType === 1 && f.splice.apply(f, [h + 1, 0].concat(c.makeArray(f[h].getElementsByTagName("script"))));
				d.appendChild(f[h])
			}
			return f
		},
		cleanData: function( a ) {
			for ( var b, d, e = c.cache, f = c.event.special, h = c.support.deleteExpando, k = 0, j;
			(j = a[k]) != null; k++ ) if (!(j.nodeName && c.noData[j.nodeName.toLowerCase()])) if ( d = j[c.expando] ) {
				if ((b = e[d]) && b.events ) for ( var l in b.events ) f[l] ? c.event.remove(j, l) : Ea(j, l, b.handle);
				if ( h ) delete j[c.expando];
				else j.removeAttribute && j.removeAttribute(c.expando);
				delete e[d]
			}
		}
	});
	var mb = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		Oa = /alpha\([^)]*\)/,
		Pa = /opacity=([^)]*)/,
		fa = /float/i,
		ga = /-([a-z])/ig,
		nb = /([A-Z])/g,
		ob = /^-?\d+(?:px)?$/i,
		pb = /^-?\d/,
		qb = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		},
		Ua = ["Left", "Right"],
		Va = ["Top", "Bottom"],
		rb = document.defaultView && document.defaultView.getComputedStyle,
		Qa = c.support.cssFloat ? "cssFloat" : "styleFloat",
		ha = function( a, b ) {
			return b.toUpperCase()
		};
	c.fn.css = function( a, b ) {
		return c.access(this, a, b, true, function( d, e, f ) {
			if ( f === w ) return c.curCSS(d, e);
			if ( typeof f === "number" && !mb.test(e) ) f += "px";
			c.style(d, e, f)
		})
	};
	c.extend({
		style: function( a, b, d ) {
			if (!a || a.nodeType === 3 || a.nodeType === 8 ) return w;
			if ((b === "width" || b === "height") && parseFloat(d) < 0 ) d = w;
			var e = a.style || a,
				f = d !== w;
			if (!c.support.opacity && b === "opacity" ) {
				if ( f ) {
					e.zoom = 1;
					b = parseInt(d, 10) + "" === "NaN" ? "" : "alpha(opacity=" + d * 100 + ")";
					a = e.filter || c.curCSS(a, "filter") || "";
					e.filter = Oa.test(a) ? a.replace(Oa, b) : b
				}
				return e.filter && e.filter.indexOf("opacity=") >= 0 ? parseFloat(Pa.exec(e.filter)[1]) / 100 + "" : ""
			}
			if ( fa.test(b) ) b = Qa;
			b = b.replace(ga, ha);
			if ( f ) e[b] = d;
			return e[b]
		},
		css: function( a, b, d, e ) {
			if ( b === "width" || b === "height" ) {
				if ( a.offsetWidth !== 0 ) val = ua(a, b, e);
				else c.swap(a, qb, function() {
					val = ua(a, b, e)
				});
				return Math.max(0, Math.round(val))
			}
			return c.curCSS(a, b, d)
		},
		curCSS: function( a, b, d ) {
			var e, f = a.style;
			if (!c.support.opacity && b === "opacity" && a.currentStyle ) {
				e = Pa.test(a.currentStyle.filter || "") ? parseFloat(RegExp.$1) / 100 + "" : "";
				return e === "" ? "1" : e
			}
			if ( fa.test(b) ) b = Qa;
			if (!d && f && f[b] ) e = f[b];
			else if ( rb ) {
				if ( fa.test(b) ) b = "float";
				b = b.replace(nb, "-$1").toLowerCase();
				f = a.ownerDocument.defaultView;
				if (!f ) return null;
				if ( a = f.getComputedStyle(a, null) ) e = a.getPropertyValue(b);
				if ( b === "opacity" && e === "" ) e = "1"
			} else if ( a.currentStyle ) {
				d = b.replace(ga, ha);
				e = a.currentStyle[b] || a.currentStyle[d];
				if (!ob.test(e) && pb.test(e) ) {
					b = f.left;
					var h = a.runtimeStyle.left;
					a.runtimeStyle.left = a.currentStyle.left;
					f.left = d === "fontSize" ? "1em" : e || 0;
					e = f.pixelLeft + "px";
					f.left = b;
					a.runtimeStyle.left = h
				}
			}
			return e
		},
		swap: function( a, b, d ) {
			var e = {};
			for ( var f in b ) {
				e[f] =
				a.style[f];
				a.style[f] = b[f]
			}
			d.call(a);
			for ( f in b ) a.style[f] = e[f]
		}
	});
	if ( c.expr && c.expr.filters ) {
		c.expr.filters.hidden = function( a ) {
			var b = a.offsetWidth,
				d = a.offsetHeight,
				e = a.nodeName.toLowerCase() === "tr";
			return b === 0 && d === 0 && !e ? true : b > 0 && d > 0 && !e ? false : c.curCSS(a, "display") === "none"
		};
		c.expr.filters.visible = function( a ) {
			return !c.expr.filters.hidden(a)
		}
	}
	var sb = c.now(),
		tb = /<script(.|\s)*?\/script>/gi,
		ub = /select|textarea/i,
		vb = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
		J = /\=\?(&|$)/,
		ia = /\?/,
		wb = /(\?|&)_=.*?(&|$)/,
		xb = /^(\w+:)?\/\/([^\/?#]+)/,
		yb = /%20/g,
		Ra = c.fn.load;
	c.fn.extend({
		load: function( a, b, d ) {
			if ( typeof a !== "string" && Ra ) return Ra.apply(this, arguments);
			else if (!this.length ) return this;
			var e = a.indexOf(" ");
			if ( e >= 0 ) {
				var f = a.slice(e, a.length);
				a = a.slice(0, e)
			}
			e = "GET";
			if ( b ) if ( c.isFunction(b) ) {
				d = b;
				b = null
			} else if ( typeof b === "object" ) {
				b = c.param(b, c.ajaxSettings.traditional);
				e = "POST"
			}
			var h = this;
			c.ajax({
				url: a,
				type: e,
				dataType: "html",
				data: b,
				complete: function( k, j ) {
					if ( j === "success" || j === "notmodified" ) h.html(f ? c("<div />").append(k.responseText.replace(tb, "")).find(f) : k.responseText);
					d && h.each(d, [k.responseText, j, k])
				}
			});
			return this
		},
		serialize: function() {
			return c.param(this.serializeArray())
		},
		serializeArray: function() {
			return this.map(function() {
				return this.elements ? c.makeArray(this.elements) : this
			}).filter(function() {
				return this.name && !this.disabled && (this.checked || ub.test(this.nodeName) || vb.test(this.type))
			}).map(function( a, b ) {
				a = c(this).val();
				return a == null ? null : c.isArray(a) ? c.map(a, function( d ) {
					return {
						name: b.name,
						value: d
					}
				}) : {
					name: b.name,
					value: a
				}
			}).get()
		}
	});
	c.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function( a, b ) {
		c.fn[b] = function( d ) {
			return this.bind(b, d)
		}
	});
	c.extend({
		get: function( a, b, d, e ) {
			if ( c.isFunction(b) ) {
				e = e || d;
				d = b;
				b = null
			}
			return c.ajax({
				type: "GET",
				url: a,
				data: b,
				success: d,
				dataType: e
			})
		},
		getScript: function( a, b ) {
			return c.get(a, null, b, "script")
		},
		getJSON: function( a, b, d ) {
			return c.get(a, b, d, "json")
		},
		post: function( a, b, d, e ) {
			if ( c.isFunction(b) ) {
				e =
				e || d;
				d = b;
				b = {}
			}
			return c.ajax({
				type: "POST",
				url: a,
				data: b,
				success: d,
				dataType: e
			})
		},
		ajaxSetup: function( a ) {
			c.extend(c.ajaxSettings, a)
		},
		ajaxSettings: {
			url: location.href,
			global: true,
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			processData: true,
			async: true,
			xhr: y.XMLHttpRequest && (y.location.protocol !== "file:" || !y.ActiveXObject) ?
			function() {
				return new y.XMLHttpRequest
			} : function() {
				try {
					return new y.ActiveXObject("Microsoft.XMLHTTP")
				} catch (a) {}
			},
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				script: "text/javascript, application/javascript",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},
		ajax: function( a ) {
			var b = c.extend(true, {}, c.ajaxSettings, a),
				d, e, f, h = b.type.toUpperCase();
			b.context = a && a.context || b;
			if ( b.data && b.processData && typeof b.data !== "string" ) b.data = c.param(b.data, b.traditional);
			if ( b.dataType === "jsonp" ) {
				if ( h === "GET" ) J.test(b.url) || (b.url += (ia.test(b.url) ? "&" : "?") + (b.jsonp || "callback") + "=?");
				else if (!b.data || !J.test(b.data) ) b.data = (b.data ? b.data + "&" : "") + (b.jsonp || "callback") + "=?";
				b.dataType = "json"
			}
			if ( b.dataType === "json" && (b.data && J.test(b.data) || J.test(b.url)) ) {
				d = b.jsonpCallback || "jsonp" + sb++;
				if ( b.data ) b.data = (b.data + "").replace(J, "=" + d + "$1");
				b.url = b.url.replace(J, "=" + d + "$1");
				b.dataType = "script";
				y[d] = y[d] ||
				function( m ) {
					y[d] = w;
					try {
						delete y[d]
					} catch (n) {}
					l && l.removeChild(r);
					f = m;
					c.ajax.handleSuccess(b, q, e, f);
					c.ajax.handleComplete(b, q, e, f)
				}
			}
			if ( b.dataType === "script" && b.cache === null ) b.cache = false;
			if ( b.cache === false && h === "GET" ) {
				var k = c.now(),
					j = b.url.replace(wb, "$1_=" + k + "$2");
				b.url = j + (j === b.url ? (ia.test(b.url) ? "&" : "?") + "_=" + k : "")
			}
			if ( b.data && h === "GET" ) b.url += (ia.test(b.url) ? "&" : "?") + b.data;
			b.global && c.ajax.active++ === 0 && c.event.trigger("ajaxStart");
			k = (k = xb.exec(b.url)) && (k[1] && k[1] !== location.protocol || k[2] !== location.host);
			if ( b.dataType === "script" && h === "GET" && k ) {
				var l = document.getElementsByTagName("head")[0] || document.documentElement,
					r = document.createElement("script");
				r.src = b.url;
				if ( b.scriptCharset ) r.charset = b.scriptCharset;
				if (!d ) {
					var s = false;
					r.onload = r.onreadystatechange =

					function() {
						if (!s && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
							s = true;
							c.ajax.handleSuccess(b, q, e, f);
							c.ajax.handleComplete(b, q, e, f);
							r.onload = r.onreadystatechange = null;
							l && r.parentNode && l.removeChild(r)
						}
					}
				}
				l.insertBefore(r, l.firstChild);
				return w
			}
			var t = false,
				q = b.xhr();
			if ( q ) {
				b.username ? q.open(h, b.url, b.async, b.username, b.password) : q.open(h, b.url, b.async);
				try {
					if ( b.data || a && a.contentType ) q.setRequestHeader("Content-Type", b.contentType);
					if ( b.ifModified ) {
						c.lastModified[b.url] && q.setRequestHeader("If-Modified-Since", c.lastModified[b.url]);
						c.ajax.etag[b.url] && q.setRequestHeader("If-None-Match", c.ajax.etag[b.url])
					}
					k || q.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					q.setRequestHeader("Accept", b.dataType && b.accepts[b.dataType] ? b.accepts[b.dataType] + ", */*" : b.accepts._default)
				} catch (z) {}
				if ( b.beforeSend && b.beforeSend.call(b.context, q, b) === false ) {
					b.global && c.ajax.active-- === 1 && c.event.trigger("ajaxStop");
					q.abort();
					return false
				}
				b.global && c.ajax.triggerGlobal(b, "ajaxSend", [q, b]);
				var A = q.onreadystatechange = function( m ) {
					if (!q || q.readyState === 0 || m === "abort" ) {
						t || c.ajax.handleComplete(b, q, e, f);
						t = true;
						if ( q ) q.onreadystatechange = c.noop
					} else if (!t && q && (q.readyState === 4 || m === "timeout") ) {
						t = true;
						q.onreadystatechange = c.noop;
						e = m === "timeout" ? "timeout" : !c.ajax.httpSuccess(q) ? "error" : b.ifModified && c.ajax.httpNotModified(q, b.url) ? "notmodified" : "success";
						var n;
						if ( e === "success" ) try {
							f = c.ajax.httpData(q, b.dataType, b)
						} catch (o) {
							e = "parsererror";
							n = o
						}
						if ( e === "success" || e === "notmodified" ) d || c.ajax.handleSuccess(b, q, e, f);
						else c.ajax.handleError(b, q, e, n);
						c.ajax.handleComplete(b, q, e, f);
						m === "timeout" && q.abort();
						if ( b.async ) q = null
					}
				};
				try {
					var D = q.abort;
					q.abort = function() {
						q && D.call(q);
						A("abort")
					}
				} catch (g) {}
				b.async && b.timeout > 0 && setTimeout(function() {
					q && !t && A("timeout")
				}, b.timeout);
				try {
					q.send(h === "POST" || h === "PUT" || h === "DELETE" ? b.data : null)
				} catch (i) {
					c.ajax.handleError(b, q, null, i);
					c.ajax.handleComplete(b, q, e, f)
				}
				b.async || A();
				return q
			}
		},
		param: function( a, b ) {
			var d = [],
				e = function( h, k ) {
					k = c.isFunction(k) ? k() : k;
					d[d.length] = encodeURIComponent(h) + "=" + encodeURIComponent(k)
				};
			if ( b === w ) b = c.ajaxSettings.traditional;
			if ( c.isArray(a) || a.jquery ) c.each(a, function() {
				e(this.name, this.value)
			});
			else for ( var f in a ) Y(f, a[f], b, e);
			return d.join("&").replace(yb, "+")
		}
	});
	c.extend(c.ajax, {
		active: 0,
		lastModified: {},
		etag: {},
		handleError: function( a, b, d, e ) {
			a.error && a.error.call(a.context, b, d, e);
			a.global && c.ajax.triggerGlobal(a, "ajaxError", [b, a, e])
		},
		handleSuccess: function( a, b, d, e ) {
			a.success && a.success.call(a.context, e, d, b);
			a.global && c.ajax.triggerGlobal(a, "ajaxSuccess", [b, a])
		},
		handleComplete: function( a, b, d ) {
			a.complete && a.complete.call(a.context, b, d);
			a.global && c.ajax.triggerGlobal(a, "ajaxComplete", [b, a]);
			a.global && c.ajax.active-- === 1 && c.event.trigger("ajaxStop")
		},
		triggerGlobal: function( a, b, d ) {
			(a.context && a.context.url == null ? c(a.context) : c.event).trigger(b, d)
		},
		httpSuccess: function( a ) {
			try {
				return !a.status && location.protocol === "file:" || a.status >= 200 && a.status < 300 || a.status === 304 || a.status === 1223 || a.status === 0
			} catch (b) {}
			return false
		},
		httpNotModified: function( a, b ) {
			var d =
			a.getResponseHeader("Last-Modified"),
				e = a.getResponseHeader("Etag");
			if ( d ) c.ajax.lastModified[b] = d;
			if ( e ) c.ajax.etag[b] = e;
			return a.status === 304 || a.status === 0
		},
		httpData: function( a, b, d ) {
			var e = a.getResponseHeader("content-type") || "",
				f = b === "xml" || !b && e.indexOf("xml") >= 0;
			a = f ? a.responseXML : a.responseText;
			f && a.documentElement.nodeName === "parsererror" && c.error("parsererror");
			if ( d && d.dataFilter ) a = d.dataFilter(a, b);
			if ( typeof a === "string" ) if ( b === "json" || !b && e.indexOf("json") >= 0 ) a = c.parseJSON(a);
			else if ( b === "script" || !b && e.indexOf("javascript") >= 0 ) c.globalEval(a);
			return a
		}
	});
	c.extend(c.ajax);
	var ja = {},
		zb = /toggle|show|hide/,
		Ab = /^([+\-]=)?([\d+.\-]+)(.*)$/,
		V, va = [
			["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
			["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
			["opacity"]
		];
	c.fn.extend({
		show: function( a, b ) {
			if ( a || a === 0 ) return this.animate(G("show", 3), a, b);
			else {
				a = 0;
				for ( b = this.length; a < b; a++ ) {
					var d = c.data(this[a], "olddisplay");
					this[a].style.display = d || "";
					if ( c.css(this[a], "display") === "none" ) {
						d = this[a].nodeName;
						var e;
						if ( ja[d] ) e = ja[d];
						else {
							var f = c("<" + d + " />").appendTo("body");
							e = f.css("display");
							if ( e === "none" ) e = "block";
							f.remove();
							ja[d] = e
						}
						c.data(this[a], "olddisplay", e)
					}
				}
				a = 0;
				for ( b = this.length; a < b; a++ ) this[a].style.display = c.data(this[a], "olddisplay") || "";
				return this
			}
		},
		hide: function( a, b ) {
			if ( a || a === 0 ) return this.animate(G("hide", 3), a, b);
			else {
				a = 0;
				for ( b = this.length; a < b; a++ ) {
					var d = c.data(this[a], "olddisplay");
					!d && d !== "none" && c.data(this[a], "olddisplay", c.css(this[a], "display"))
				}
				a = 0;
				for ( b =
				this.length; a < b; a++ ) this[a].style.display = "none";
				return this
			}
		},
		_toggle: c.fn.toggle,
		toggle: function( a, b ) {
			var d = typeof a === "boolean";
			if ( c.isFunction(a) && c.isFunction(b) ) this._toggle.apply(this, arguments);
			else a == null || d ? this.each(function() {
				var e = d ? a : c(this).is(":hidden");
				c(this)[e ? "show" : "hide"]()
			}) : this.animate(G("toggle", 3), a, b);
			return this
		},
		fadeTo: function( a, b, d ) {
			return this.filter(":hidden").css("opacity", 0).show().end().animate({
				opacity: b
			}, a, d)
		},
		animate: function( a, b, d, e ) {
			var f = c.speed(b, d, e);
			if ( c.isEmptyObject(a) ) return this.each(f.complete);
			return this[f.queue === false ? "each" : "queue"](function() {
				var h = c.extend({}, f),
					k, j = this.nodeType === 1 && c(this).is(":hidden"),
					l = this;
				for ( k in a ) {
					var r = k.replace(ga, ha);
					if ( k !== r ) {
						a[r] = a[k];
						delete a[k];
						k = r
					}
					if ( a[k] === "hide" && j || a[k] === "show" && !j ) return h.complete.call(this);
					if ((k === "height" || k === "width") && this.style ) {
						h.display = c.css(this, "display");
						h.overflow = this.style.overflow
					}
					if ( c.isArray(a[k]) ) {
						(h.specialEasing = h.specialEasing || {})[k] = a[k][1];
						a[k] = a[k][0]
					}
				}
				if ( h.overflow != null ) this.style.overflow = "hidden";
				h.curAnim = c.extend({}, a);
				c.each(a, function( s, t ) {
					var q = new c.fx(l, h, s);
					if ( zb.test(t) ) q[t === "toggle" ? j ? "show" : "hide" : t](a);
					else {
						var z = Ab.exec(t),
							A = q.cur(true) || 0;
						if ( z ) {
							t = parseFloat(z[2]);
							var D = z[3] || "px";
							if ( D !== "px" ) {
								l.style[s] = (t || 1) + D;
								A = (t || 1) / q.cur(true) * A;
								l.style[s] = A + D
							}
							if ( z[1] ) t = (z[1] === "-=" ? -1 : 1) * t + A;
							q.custom(A, t, D)
						} else q.custom(A, t, "")
					}
				});
				return true
			})
		},
		stop: function( a, b ) {
			var d = c.timers;
			a && this.queue([]);
			this.each(function() {
				for ( var e = d.length - 1; e >= 0; e-- ) if ( d[e].elem === this ) {
					b && d[e](true);
					d.splice(e, 1)
				}
			});
			b || this.dequeue();
			return this
		}
	});
	c.each({
		slideDown: G("show", 1),
		slideUp: G("hide", 1),
		slideToggle: G("toggle", 1),
		fadeIn: {
			opacity: "show"
		},
		fadeOut: {
			opacity: "hide"
		}
	}, function( a, b ) {
		c.fn[a] = function( d, e ) {
			return this.animate(b, d, e)
		}
	});
	c.extend({
		speed: function( a, b, d ) {
			var e = a && typeof a === "object" ? a : {
				complete: d || !d && b || c.isFunction(a) && a,
				duration: a,
				easing: d && b || b && !c.isFunction(b) && b
			};
			e.duration = c.fx.off ? 0 : typeof e.duration === "number" ? e.duration : c.fx.speeds[e.duration] || c.fx.speeds._default;
			e.old = e.complete;
			e.complete = function() {
				e.queue !== false && c(this).dequeue();
				c.isFunction(e.old) && e.old.call(this)
			};
			return e
		},
		easing: {
			linear: function( a, b, d, e ) {
				return d + e * a
			},
			swing: function( a, b, d, e ) {
				return (-Math.cos(a * Math.PI) / 2 + 0.5) * e + d
			}
		},
		timers: [],
		fx: function( a, b, d ) {
			this.options = b;
			this.elem = a;
			this.prop = d;
			if (!b.orig ) b.orig = {}
		}
	});
	c.fx.prototype = {
		update: function() {
			this.options.step && this.options.step.call(this.elem, this.now, this);
			(c.fx.step[this.prop] || c.fx.step._default)(this);
			if ((this.prop === "height" || this.prop === "width") && this.elem.style ) this.elem.style.display = "block"
		},
		cur: function( a ) {
			if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) return this.elem[this.prop];
			return (a = parseFloat(c.css(this.elem, this.prop, a))) && a > -10000 ? a : parseFloat(c.curCSS(this.elem, this.prop)) || 0
		},
		custom: function( a, b, d ) {
			function e(h) {
				return f.step(h)
			}
			this.startTime = c.now();
			this.start = a;
			this.end = b;
			this.unit = d || this.unit || "px";
			this.now = this.start;
			this.pos = this.state = 0;
			var f = this;
			e.elem = this.elem;
			if ( e() && c.timers.push(e) && !V ) V = setInterval(c.fx.tick, 13)
		},
		show: function() {
			this.options.orig[this.prop] = c.style(this.elem, this.prop);
			this.options.show = true;
			this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
			c(this.elem).show()
		},
		hide: function() {
			this.options.orig[this.prop] = c.style(this.elem, this.prop);
			this.options.hide = true;
			this.custom(this.cur(), 0)
		},
		step: function( a ) {
			var b = c.now(),
				d = true;
			if ( a || b >= this.options.duration + this.startTime ) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();
				this.options.curAnim[this.prop] = true;
				for ( var e in this.options.curAnim ) if ( this.options.curAnim[e] !== true ) d = false;
				if ( d ) {
					if ( this.options.display != null ) {
						this.elem.style.overflow = this.options.overflow;
						a = c.data(this.elem, "olddisplay");
						this.elem.style.display = a ? a : this.options.display;
						if ( c.css(this.elem, "display") === "none" ) this.elem.style.display = "block"
					}
					this.options.hide && c(this.elem).hide();
					if ( this.options.hide || this.options.show ) for ( var f in this.options.curAnim ) c.style(this.elem, f, this.options.orig[f]);
					this.options.complete.call(this.elem)
				}
				return false
			} else {
				f = b - this.startTime;
				this.state = f / this.options.duration;
				a = this.options.easing || (c.easing.swing ? "swing" : "linear");
				this.pos = c.easing[this.options.specialEasing && this.options.specialEasing[this.prop] || a](this.state, f, 0, 1, this.options.duration);
				this.now = this.start + (this.end - this.start) * this.pos;
				this.update()
			}
			return true
		}
	};
	c.extend(c.fx, {
		tick: function() {
			for ( var a = c.timers, b = 0; b < a.length; b++ ) a[b]() || a.splice(b--, 1);
			a.length || c.fx.stop()
		},
		stop: function() {
			clearInterval(V);
			V = null
		},
		speeds: {
			slow: 600,
			fast: 200,
			_default: 400
		},
		step: {
			opacity: function( a ) {
				c.style(a.elem, "opacity", a.now)
			},
			_default: function( a ) {
				if ( a.elem.style && a.elem.style[a.prop] != null ) a.elem.style[a.prop] = (a.prop === "width" || a.prop === "height" ? Math.max(0, a.now) : a.now) + a.unit;
				else a.elem[a.prop] = a.now
			}
		}
	});
	if ( c.expr && c.expr.filters ) c.expr.filters.animated = function( a ) {
		return c.grep(c.timers, function( b ) {
			return a === b.elem
		}).length
	};
	c.fn.offset = "getBoundingClientRect" in document.documentElement ?
	function( a ) {
		var b = this[0];
		if ( a ) return this.each(function( h ) {
			c.offset.setOffset(this, a, h)
		});
		if (!b || !b.ownerDocument ) return null;
		if ( b === b.ownerDocument.body ) return c.offset.bodyOffset(b);
		var d = b.getBoundingClientRect(),
			e = b.ownerDocument;
		b = e.body;
		var f = e.documentElement;
		e = Z(e);
		return {
			top: d.top + (e.pageYOffset || c.support.boxModel && f.scrollTop || b.scrollTop) - (f.clientTop || b.clientTop || 0),
			left: d.left + (e.pageXOffset || c.support.boxModel && f.scrollLeft || b.scrollLeft) - (f.clientLeft || b.clientLeft || 0)
		}
	} : function( a ) {
		var b = this[0];
		if ( a ) return this.each(function( s ) {
			c.offset.setOffset(this, a, s)
		});
		if (!b || !b.ownerDocument ) return null;
		if ( b === b.ownerDocument.body ) return c.offset.bodyOffset(b);
		c.offset.initialize();
		var d = b.offsetParent,
			e = b,
			f = b.ownerDocument,
			h, k = f.documentElement,
			j = f.body;
		e = (f = f.defaultView) ? f.getComputedStyle(b, null) : b.currentStyle;
		for ( var l = b.offsetTop, r = b.offsetLeft;
		(b = b.parentNode) && b !== j && b !== k; ) {
			if ( c.offset.supportsFixedPosition && e.position === "fixed" ) break;
			h = f ? f.getComputedStyle(b, null) : b.currentStyle;
			l -= b.scrollTop;
			r -= b.scrollLeft;
			if ( b === d ) {
				l += b.offsetTop;
				r += b.offsetLeft;
				if ( c.offset.doesNotAddBorder && !(c.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(b.nodeName)) ) {
					l += parseFloat(h.borderTopWidth) || 0;
					r += parseFloat(h.borderLeftWidth) || 0
				}
				e = d;
				d = b.offsetParent
			}
			if ( c.offset.subtractsBorderForOverflowNotVisible && h.overflow !== "visible" ) {
				l += parseFloat(h.borderTopWidth) || 0;
				r += parseFloat(h.borderLeftWidth) || 0
			}
			e = h
		}
		if ( e.position === "relative" || e.position === "static" ) {
			l += j.offsetTop;
			r += j.offsetLeft
		}
		if ( c.offset.supportsFixedPosition && e.position === "fixed" ) {
			l += Math.max(k.scrollTop, j.scrollTop);
			r += Math.max(k.scrollLeft, j.scrollLeft)
		}
		return {
			top: l,
			left: r
		}
	};
	c.offset = {
		initialize: function() {
			var a = document.body,
				b = document.createElement("div"),
				d, e, f, h = parseFloat(c.curCSS(a, "marginTop", true)) || 0;
			c.extend(b.style, {
				position: "absolute",
				top: 0,
				left: 0,
				margin: 0,
				border: 0,
				width: "1px",
				height: "1px",
				visibility: "hidden"
			});
			b.innerHTML = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
			a.insertBefore(b, a.firstChild);
			d = b.firstChild;
			e = d.firstChild;
			f = d.nextSibling.firstChild.firstChild;
			this.doesNotAddBorder = e.offsetTop !== 5;
			this.doesAddBorderForTableAndCells = f.offsetTop === 5;
			e.style.position = "fixed";
			e.style.top = "20px";
			this.supportsFixedPosition = e.offsetTop === 20 || e.offsetTop === 15;
			e.style.position = e.style.top = "";
			d.style.overflow = "hidden";
			d.style.position = "relative";
			this.subtractsBorderForOverflowNotVisible = e.offsetTop === -5;
			this.doesNotIncludeMarginInBodyOffset = a.offsetTop !== h;
			a.removeChild(b);
			c.offset.initialize = c.noop
		},
		bodyOffset: function( a ) {
			var b = a.offsetTop,
				d = a.offsetLeft;
			c.offset.initialize();
			if ( c.offset.doesNotIncludeMarginInBodyOffset ) {
				b += parseFloat(c.curCSS(a, "marginTop", true)) || 0;
				d += parseFloat(c.curCSS(a, "marginLeft", true)) || 0
			}
			return {
				top: b,
				left: d
			}
		},
		setOffset: function( a, b, d ) {
			var e = c.curCSS(a, "position");
			if ( e === "static" ) a.style.position = "relative";
			var f = c(a),
				h = f.offset(),
				k = c.curCSS(a, "top", true),
				j = c.curCSS(a, "left", true);
			e = e === "absolute" && c.inArray("auto", [k, j]) > -1;
			var l = {};
			l = {};
			if ( e ) l = f.position();
			k = e ? l.top : parseInt(k, 10) || 0;
			j = e ? l.left : parseInt(j, 10) || 0;
			if ( c.isFunction(b) ) b = b.call(a, d, h);
			l = !f.is(":visible") && !h.top && !h.left || isNaN(k) || isNaN(j) ? {
				top: b.top,
				left: b.left
			} : {
				top: b.top - h.top + k,
				left: b.left - h.left + j
			};
			"using" in b ? b.using.call(a, l) : f.css(l)
		}
	};
	c.fn.extend({
		position: function() {
			if (!this[0] ) return null;
			var a = this[0],
				b = this.offsetParent(),
				d = this.offset(),
				e = /^body|html$/i.test(b[0].nodeName) ? {
					top: 0,
					left: 0
				} : b.offset();
			d.top -= parseFloat(c.curCSS(a, "marginTop", true)) || 0;
			d.left -= parseFloat(c.curCSS(a, "marginLeft", true)) || 0;
			e.top += parseFloat(c.curCSS(b[0], "borderTopWidth", true)) || 0;
			e.left += parseFloat(c.curCSS(b[0], "borderLeftWidth", true)) || 0;
			return {
				top: d.top - e.top,
				left: d.left - e.left
			}
		},
		offsetParent: function() {
			return this.map(function() {
				for ( var a = this.offsetParent || document.body; a && !/^body|html$/i.test(a.nodeName) && c.css(a, "position") === "static"; ) a = a.offsetParent;
				return a
			})
		}
	});
	c.each(["Left", "Top"], function( a, b ) {
		var d = "scroll" + b;
		c.fn[d] = function( e ) {
			var f = this[0],
				h;
			if (!f ) return null;
			if ( e !== w ) return this.each(function() {
				if ( h = Z(this) ) h.scrollTo(!a ? e : c(h).scrollLeft(), a ? e : c(h).scrollTop());
				else this[d] = e
			});
			else return (h = Z(f)) ? "pageXOffset" in h ? h[a ? "pageYOffset" : "pageXOffset"] : c.support.boxModel && h.document.documentElement[d] || h.document.body[d] : f[d]
		}
	});
	c.each(["Height", "Width"], function( a, b ) {
		var d = b.toLowerCase();
		c.fn["inner" + b] = function() {
			return this[0] ? c.css(this[0], d, false, "padding") : null
		};
		c.fn["outer" + b] = function( e ) {
			return this[0] ? c.css(this[0], d, false, e ? "margin" : "border") : null
		};
		c.fn[d] = function( e ) {
			var f = this[0];
			if (!f ) return e == null ? null : this;
			if ( c.isFunction(e) ) return this.each(function( h ) {
				var k = c(this);
				k[d](e.call(this, h, k[d]()))
			});
			return "scrollTo" in f && f.document && f.navigator ? f.document.compatMode === "CSS1Compat" && f.document.documentElement["client" + b] || f.document.body["client" + b] : f.nodeType === 9 ? Math.max(f.documentElement["client" + b], f.body["scroll" + b], f.documentElement["scroll" + b], f.body["offset" + b], f.documentElement["offset" + b]) : e === w ? c.css(f, d) : this.css(d, typeof e === "string" ? e : e + "px")
		}
	})
})(window);;
steal.end();
steal.plugins("jquery").then(function( f ) {
	var c = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowerUpper: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g
	},
		d = f.String = {
			strip: function( a ) {
				return a.replace(/^\s+/, "").replace(/\s+$/, "")
			},
			capitalize: function( a ) {
				return a.charAt(0).toUpperCase() + a.substr(1)
			},
			endsWith: function( a, b ) {
				var e = a.length - b.length;
				return e >= 0 && a.lastIndexOf(b) === e
			},
			camelize: function( a ) {
				a = a.split(c.undHash);
				var b = 1;
				for ( a[0] = a[0].charAt(0).toLowerCase() + a[0].substr(1); b < a.length; b++ ) a[b] =
				d.capitalize(a[b]);
				return a.join("")
			},
			classize: function( a ) {
				a = a.split(c.undHash);
				for ( var b = 0; b < a.length; b++ ) a[b] = d.capitalize(a[b]);
				return a.join("")
			},
			niceName: function( a ) {
				a = a.split(c.undHash);
				for ( var b = 0; b < a.length; b++ ) a[b] = d.capitalize(a[b]);
				return a.join(" ")
			},
			underscore: function( a ) {
				return a.replace(c.colons, "/").replace(c.words, "$1_$2").replace(c.lowerUpper, "$1_$2").replace(c.dash, "_").toLowerCase()
			}
		}
});;
steal.end();
steal.plugins("jquery/event").then(function( a ) {
	var e = jQuery.cleanData;
	a.cleanData = function( b ) {
		for ( var c = 0, d;
		(d = b[c]) != null; c++ ) a(d).triggerHandler("destroyed");
		e(b)
	}
});;
steal.end();
steal.plugins("jquery");;
steal.end();
steal.plugins("jquery/controller/subscribe", "jquery/event/hashchange").then(function( g ) {
	var k = /([^\[\]]+)|(\[\])/g;
	g.Controller.History = {
		pathname: function( a ) {
			return (a = a.match(/#([^&]*)/)) ? a[1] : null
		},
		search: function( a ) {
			return (a = a.match(/#[^&]*&(.*)/)) ? a[1] : null
		},
		getData: function( a ) {
			var b = g.Controller.History.search(a);
			a = /^\d+$/;
			if (!b || !b.match(/([^?#]*)(#.*)?$/) ) return {};
			b = b.replace(/\+/g, "%20");
			var c = {};
			b = b.split("&");
			for ( var e, j = 0; j < b.length; j++ ) {
				e = c;
				var d = b[j].split("=");
				if ( d.length != 2 ) d = [d[0], d.slice(1).join("=")];
				var f = decodeURIComponent(d[0]);
				d = decodeURIComponent(d[1]);
				f = f.match(k);
				for ( var h = 0; h < f.length - 1; h++ ) {
					var i = f[h];
					e[i] || (e[i] = a.test(i) || f[h + 1] == "[]" ? [] : {});
					e = e[i]
				}
				lastPart = f[f.length - 1];
				if ( lastPart == "[]" ) e.push(d);
				else e[lastPart] = d
			}
			return c
		}
	};
	jQuery(function( a ) {
		a(window).bind("hashchange", function() {
			var b = a.Controller.History.getData(location.href),
				c = a.Controller.History.pathname(location.href) || "index";
			if ( c.indexOf("/") == -1 && c != "index" ) c += "/index";
			OpenAjax.hub.publish("history." + c.replace("/", "."), b)
		});
		setTimeout(function() {
			a(window).trigger("hashchange")
		}, 1)
	});
	g.extend(g.Controller.prototype, {
		redirectTo: function( a ) {
			a = this._get_history_point(a);
			location.hash = a
		},
		replaceWith: function( a ) {
			a = this._get_history_point(a);
			location.replace(location.href.split("#")[0] + a)
		},
		historyAdd: function( a ) {
			a = this._get_history_point(a);
			location.hash = a
		},
		_get_history_point: function( a ) {
			var b = a.controller || this.Class.underscoreName,
				c = a.action || "index";
			a.controller && delete a.controller;
			a.action && delete a.action;
			a = a ? g.param(a) : "";
			if ( a.length ) a = "&" + a;
			return "#" + b + "/" + c + a
		},
		pathData: function() {
			return g.Controller.History.getData(location.href)
		}
	})
});;
steal.end();
steal.plugins("jquery", "jquery/controller", "jquery/lang/openajax").then(function() {
	jQuery.Controller.processors.subscribe = function( e, f, b, c, a ) {
		a = a;
		var d = OpenAjax.hub.subscribe(b, c);
		return function() {
			OpenAjax.hub.unsubscribe(d)
		}
	};
	jQuery.Controller.prototype.publish = function() {
		OpenAjax.hub.publish.apply(OpenAjax.hub, arguments)
	}
});;
steal.end();
steal.then(function() {
	if (!window.OpenAjax ) {
		OpenAjax = new(function() {
			var d = {};
			this.hub = d;
			d.implementer = "http://openajax.org";
			d.implVersion = "1.0";
			d.specVersion = "1.0";
			d.implExtraData = {};
			var h = {};
			d.libraries = h;
			d.registerLibrary = function( a, c, b, e ) {
				h[a] = {
					prefix: a,
					namespaceURI: c,
					version: b,
					extraData: e
				};
				this.publish("org.openajax.hub.registerLibrary", h[a])
			};
			d.unregisterLibrary = function( a ) {
				this.publish("org.openajax.hub.unregisterLibrary", h[a]);
				delete h[a]
			};
			d._subscriptions = {
				c: {},
				s: []
			};
			d._cleanup = [];
			d._subIndex =
			0;
			d._pubDepth = 0;
			d.subscribe = function( a, c, b, e, f ) {
				b || (b = window);
				var g = a + "." + this._subIndex;
				c = {
					scope: b,
					cb: c,
					fcb: f,
					data: e,
					sid: this._subIndex++,
					hdl: g
				};
				this._subscribe(this._subscriptions, a.split("."), 0, c);
				return g
			};
			d.publish = function( a, c ) {
				var b = a.split(".");
				this._pubDepth++;
				this._publish(this._subscriptions, b, 0, a, c);
				this._pubDepth--;
				if ( this._cleanup.length > 0 && this._pubDepth == 0 ) {
					for ( a = 0; a < this._cleanup.length; a++ ) this.unsubscribe(this._cleanup[a].hdl);
					delete this._cleanup;
					this._cleanup = []
				}
			};
			d.unsubscribe =

			function( a ) {
				a = a.split(".");
				var c = a.pop();
				this._unsubscribe(this._subscriptions, a, 0, c)
			};
			d._subscribe = function( a, c, b, e ) {
				var f = c[b];
				if ( b == c.length ) a.s.push(e);
				else {
					if ( typeof a.c == "undefined" ) a.c = {};
					if ( typeof a.c[f] == "undefined" ) a.c[f] = {
						c: {},
						s: []
					};
					this._subscribe(a.c[f], c, b + 1, e)
				}
			};
			d._publish = function( a, c, b, e, f, g, l ) {
				if ( typeof a != "undefined" ) {
					if ( b == c.length ) a = a;
					else {
						this._publish(a.c[c[b]], c, b + 1, e, f, g, l);
						this._publish(a.c["*"], c, b + 1, e, f, g, l);
						a = a.c["**"]
					}
					if ( typeof a != "undefined" ) {
						a = a.s;
						c = a.length;
						for ( b =
						0; b < c; b++ ) if ( a[b].cb ) {
							var j = a[b].scope,
								k = a[b].cb,
								i = a[b].fcb,
								m = a[b].data,
								n = a[b].sid,
								o = a[b].cid;
							if ( typeof k == "string" ) k = j[k];
							if ( typeof i == "string" ) i = j[i];
							if (!i || i.call(j, e, f, m) ) if (!g || g(e, f, l, o) ) k.call(j, e, f, m, n)
						}
					}
				}
			};
			d._unsubscribe = function( a, c, b, e ) {
				if ( typeof a != "undefined" ) if ( b < c.length ) {
					var f = a.c[c[b]];
					this._unsubscribe(f, c, b + 1, e);
					if ( f.s.length == 0 ) {
						for ( var g in f.c ) return;
						delete a.c[c[b]]
					}
				} else {
					a = a.s;
					c = a.length;
					for ( b = 0; b < c; b++ ) if ( e == a[b].sid ) {
						if ( this._pubDepth > 0 ) {
							a[b].cb = null;
							this._cleanup.push(a[b])
						} else a.splice(b, 1);
						return
					}
				}
			};
			d.reinit = function() {
				for ( var a in OpenAjax.hub.libraries ) delete OpenAjax.hub.libraries[a];
				OpenAjax.hub.registerLibrary("OpenAjax", "http://openajax.org/hub", "1.0", {});
				delete OpenAjax._subscriptions;
				OpenAjax._subscriptions = {
					c: {},
					s: []
				};
				delete OpenAjax._cleanup;
				OpenAjax._cleanup = [];
				OpenAjax._subIndex = 0;
				OpenAjax._pubDepth = 0
			}
		});
		OpenAjax.hub.registerLibrary("OpenAjax", "http://openajax.org/hub", "1.0", {})
	}
	OpenAjax.hub.registerLibrary("JavaScriptMVC", "http://JavaScriptMVC.com", "1.5", {})
});;
steal.end();
(function( a, d, u ) {
	function i(e) {
		e = e || d[f][j];
		return e.replace(/^[^#]*#?(.*)$/, "$1")
	}
	var l, p = a.event.special,
		f = "location",
		j = "href",
		q = document.documentMode,
		r = a.browser.msie && (q === u || q < 8),
		s = "onhashchange" in d && !r;
	a.hashchangeDelay = 100;
	p.hashchange = a.extend(p.hashchange, {
		setup: function() {
			if ( s ) return false;
			a(l.start)
		},
		teardown: function() {
			if ( s ) return false;
			a(l.stop)
		}
	});
	l = function() {
		function e() {
			g = m = function( b ) {
				return b
			};
			if ( r ) {
				k = a('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;
				m = function() {
					return i(k.document[f][j])
				};
				g = function( b, c ) {
					if ( b !== c ) {
						c = k.document;
						c.open().close();
						c[f].hash = "#" + b
					}
				};
				g(i())
			}
		}
		var n = {},
			h, k, g, m;
		n.start = function() {
			if (!h ) {
				var b = i();
				g || e();
				navigator.userAgent.match(/Rhino/) ||
				function c() {
					var t = i(),
						o = m(b);
					if ( t !== b ) {
						g(b = t, o);
						a(d).trigger("hashchange")
					} else if ( o !== b ) d[f][j] = d[f][j].replace(/#.*/, "") + "#" + o;
					h = setTimeout(c, a.hashchangeDelay)
				}()
			}
		};
		n.stop = function() {
			if (!k ) {
				h && clearTimeout(h);
				h = 0
			}
		};
		return n
	}()
})(jQuery, this);;
steal.end();
steal.plugins("jquery/view", "jquery/lang/rsplit").then(function( f ) {
	var k = function( a ) {
		return a.substr(0, a.length - 1)
	},
		j = f.extend,
		l = f.isArray,
		e = function( a ) {
			if ( this.constructor != e ) {
				var b = new e(a);
				return function( d, g ) {
					return b.render(d, g)
				}
			}
			if ( typeof a == "function" ) {
				this.template = {};
				this.template.process = a
			} else {
				f.extend(this, e.options, a);
				var c = new e.Compiler(this.text, this.type);
				c.compile(a, this.name);
				this.template = c
			}
		};
	f.View.EJS = e;
	e.prototype = {
		constructor: e,
		render: function( a, b ) {
			a = a || {};
			this._extra_helpers =
			b;
			b = new e.Helpers(a, b || {});
			return this.template.process.call(a, a, b)
		},
		out: function() {
			return this.template.out
		}
	};
	e.Scanner = function( a, b, c ) {
		j(this, {
			left_delimiter: b + "%",
			right_delimiter: "%" + c,
			double_left: b + "%%",
			double_right: "%%" + c,
			left_equal: b + "%=",
			left_comment: b + "%#"
		});
		this.SplitRegexp = b == "[" ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp("(" + this.double_left + ")|(%%" + this.double_right + ")|(" + this.left_equal + ")|(" + this.left_comment + ")|(" + this.left_delimiter + ")|(" + this.right_delimiter + "\n)|(" + this.right_delimiter + ")|(\n)");
		this.source = a;
		this.stag = null;
		this.lines = 0
	};
	e.Scanner.to_text = function( a ) {
		var b;
		if ( a == null || a === undefined ) return "";
		if ( a instanceof Date ) return a.toDateString();
		if ( a.hookup ) {
			b = f.View.hookup(function( c, d ) {
				a.hookup.call(a, c, d)
			});
			return "data-view-id='" + b + "'"
		}
		if ( typeof a == "function" ) return "data-view-id='" + f.View.hookup(a) + "'";
		if ( l(a) ) {
			b = f.View.hookup(function( c, d ) {
				for ( var g = 0; g < a.length; g++ ) a[g].hookup ? a[g].hookup(c, d) : a[g](c, d)
			});
			return "data-view-id='" + b + "'"
		}
		if ( a.nodeName || a.jQuery ) throw "elements in views are not supported";
		if ( a.toString ) return b ? a.toString(b) : a.toString();
		return ""
	};
	e.Scanner.prototype = {
		scan: function( a ) {
			var b = this.SplitRegexp;
			if (!this.source == "" ) for ( var c = f.String.rsplit(this.source, /\n/), d = 0; d < c.length; d++ ) this.scanline(c[d], b, a)
		},
		scanline: function( a, b, c ) {
			this.lines++;
			a = f.String.rsplit(a, b);
			for ( b = 0; b < a.length; b++ ) {
				var d = a[b];
				if ( d != null ) try {
					c(d, this)
				} catch (g) {
					throw {
						type: "jQuery.View.EJS.Scanner",
						line: this.lines
					};
				}
			}
		}
	};
	e.Buffer = function( a, b ) {
		this.line = [];
		this.script = "";
		this.pre_cmd = a;
		this.post_cmd = b;
		for ( b = 0; b < this.pre_cmd.length; b++ ) this.push(a[b])
	};
	e.Buffer.prototype = {
		push: function( a ) {
			this.line.push(a)
		},
		cr: function() {
			this.script += this.line.join("; ");
			this.line = [];
			this.script += "\n"
		},
		close: function() {
			if ( this.line.length > 0 ) {
				for ( var a = 0; a < this.post_cmd.length; a++ ) this.push(pre_cmd[a]);
				this.script += this.line.join("; ");
				line = null
			}
		}
	};
	e.Compiler = function( a, b ) {
		this.pre_cmd = ["var ___ViewO = [];"];
		this.post_cmd = [];
		this.source = " ";
		if ( a != null ) {
			if ( typeof a == "string" ) {
				a = a.replace(/\r\n/g, "\n");
				this.source = a = a.replace(/\r/g, "\n")
			} else if ( a.innerHTML ) this.source = a.innerHTML;
			if ( typeof this.source != "string" ) this.source = ""
		}
		b = b || "<";
		a = ">";
		switch ( b ) {
		case "[":
			a = "]";
			break;
		case "<":
			break;
		default:
			throw b + " is not a supported deliminator";
		}
		this.scanner = new e.Scanner(this.source, b, a);
		this.out = ""
	};
	e.Compiler.prototype = {
		compile: function( a, b ) {
			a = a || {};
			this.out = "";
			var c = new e.Buffer(this.pre_cmd, this.post_cmd),
				d = "",
				g = function( i ) {
					i = i.replace(/\\/g, "\\\\");
					i = i.replace(/\n/g, "\\n");
					return i = i.replace(/"/g, '\\"')
				};
			this.scanner.scan(function( i, h ) {
				if ( h.stag == null ) switch ( i ) {
				case "\n":
					d += "\n";
					c.push('___ViewO.push("' + g(d) + '");');
					c.cr();
					d = "";
					break;
				case h.left_delimiter:
				case h.left_equal:
				case h.left_comment:
					h.stag = i;
					d.length > 0 && c.push('___ViewO.push("' + g(d) + '")');
					d = "";
					break;
				case h.double_left:
					d += h.left_delimiter;
					break;
				default:
					d += i;
					break
				} else switch ( i ) {
				case h.right_delimiter:
					switch ( h.stag ) {
					case h.left_delimiter:
						if ( d[d.length - 1] == "\n" ) {
							d = k(d);
							c.push(d);
							c.cr()
						} else c.push(d);
						break;
					case h.left_equal:
						c.push("___ViewO.push((jQuery.View.EJS.Scanner.to_text(" + d + ")))");
						break
					}
					h.stag = null;
					d = "";
					break;
				case h.double_right:
					d += h.right_delimiter;
					break;
				default:
					d += i;
					break
				}
			});
			d.length > 0 && c.push('___ViewO.push("' + g(d) + '")');
			c.close();
			this.out = c.script + ";";
			eval("/*" + b + "*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {" + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};")
		}
	};
	e.options = {
		cache: true,
		type: "<",
		ext: ".ejs"
	};
	e.INVALID_PATH = -1;
	e.Helpers = function( a, b ) {
		this._data = a;
		this._extras = b;
		j(this, b)
	};
	e.Helpers.prototype = {
		view: function( a, b, c ) {
			if (!c ) c = this._extras;
			if (!b ) b = this._data;
			return f.View(a, b, c)
		},
		to_text: function( a, b ) {
			if ( a == null || a === undefined ) return b || "";
			if ( a instanceof Date ) return a.toDateString();
			if ( a.toString ) return a.toString().replace(/\n/g, "<br />").replace(/''/g, "'");
			return ""
		},
		plugin: function() {
			var a = f.makeArray(arguments),
				b = a.shift();
			return function( c ) {
				c = f(c);
				c[b].apply(c, a)
			}
		}
	};
	f.View.register({
		suffix: "ejs",
		get: function( a, b ) {
			var c = f.ajax({
				async: false,
				url: b,
				dataType: "text",
				error: function() {
					throw "ejs.js ERROR: There is no template or an empty template at " + b;
				}
			}).responseText;
			if (!c.match(/[^\s]/) ) throw "ejs.js ERROR: There is no template or an empty template at " + b;
			return this.renderer(a, c)
		},
		script: function( a, b ) {
			return "jQuery.View.EJS(function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {" + (new e({
				text: b
			})).out() + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}})"
		},
		renderer: function( a, b ) {
			var c =
			new e({
				text: b,
				name: a
			});
			return function( d, g ) {
				return c.render.call(c, d, g)
			}
		}
	})
});;
steal.end();
window.jQuery && jQuery.Controller && steal.plugins("jquery/controller/view");
steal.plugins("jquery").then(function( c ) {
	var k = function( a ) {
		return a.replace(/^\/\//, "").replace(/[\/\.]/g, "_")
	},
		l = 1;
	c.View = function( a, d, e ) {
		var b = a.match(/\.[\w\d]+$/),
			f, g, h;
		g = a;
		if (!b ) {
			b = c.View.ext;
			g += c.View.ext
		}
		h = k(g);
		if ( g.match(/^\/\//) ) g = steal.root.join(g.substr(2));
		b = c.View.types[b];
		a = c.View.cached[h] ? c.View.cached[h] : (f = document.getElementById(a)) ? b.renderer(h, f.innerHTML) : b.get(h, g);
		if ( c.View.cache ) c.View.cached[h] = a;
		return a.call(b, d, e)
	};
	c.extend(c.View, {
		hookups: {},
		hookup: function( a ) {
			var d = ++l;
			jQuery.View.hookups[d] = a;
			return d
		},
		cached: {},
		cache: true,
		register: function( a ) {
			this.types["." + a.suffix] = a
		},
		types: {},
		ext: ".ejs",
		registerScript: function( a, d, e ) {
			return "$.View.preload('" + d + "'," + c.View.types["." + a].script(d, e) + ");"
		},
		preload: function( a, d ) {
			c.View.cached[a] = function( e, b ) {
				return d.call(e, e, b)
			}
		}
	});
	for ( var n = function( a ) {
		var d = jQuery.fn[a];
		jQuery.fn[a] = function() {
			var e = arguments,
				b;
			b = typeof arguments[1];
			if ( typeof arguments[0] == "string" && (b == "object" || b == "function") && !arguments[1].nodeType && !arguments[1].jquery ) e = [c.View.apply(c.View, c.makeArray(arguments))];
			for ( var f in jQuery.View.hookups );
			if ( f ) e[0] = c(e[0]);
			b = d.apply(this, e);
			f && m(e[0]);
			return b
		}
	}, m = function( a ) {
		var d = jQuery.View.hookups,
			e, b = 0,
			f, g;
		jQuery.View.hookups = {};
		a = a.add("[data-view-id]", a);
		for ( e = a.length; b < e; b++ ) if ( a[b].getAttribute && (f = a[b].getAttribute("data-view-id")) && (g = d[f]) ) {
			g(a[b], f);
			delete d[f];
			a[b].removeAttribute("data-view-id")
		}
		c.extend(jQuery.View.hookups, d)
	}, j = ["prepend", "append", "after", "before", "replace", "text", "html", "replaceWith"], i = 0; i < j.length; i++ ) n(j[i])
});;
steal.end();
steal.plugins("jquery/controller", "jquery/view").then(function() {
	jQuery.Controller.getFolder = function() {
		return jQuery.String.underscore(this.fullName.replace(/\./g, "/")).replace("/Controllers", "")
	};
	var g = function( a, b, c ) {
		var d = a.fullName.replace(/\./g, "/"),
			e = d.indexOf("/Controllers/" + a.shortName) != -1;
		d = jQuery.String.underscore(d.replace("/Controllers/" + a.shortName, ""));
		a = a._shortName;
		var f = typeof b == "string" && b.match(/\.[\w\d]+$/) || jQuery.View.ext;
		if ( typeof b == "string" ) {
			if ( b.substr(0, 2) != "//" ) b = "//" + (new steal.File("views/" + (b.indexOf("/") !== -1 ? b : (e ? a + "/" : "") + b))).joinFrom(d) + f
		} else b || (b = "//" + (new steal.File("views/" + (e ? a + "/" : "") + c.replace(/\.|#/g, "").replace(/ /g, "_"))).joinFrom(d) + f);
		return b
	},
		h = function( a ) {
			var b = {};
			if ( a ) if ( jQuery.isArray(a) ) for ( var c = 0; c < a.length; c++ ) jQuery.extend(b, a[c]);
			else jQuery.extend(b, a);
			else {
				if ( this._default_helpers ) b = this._default_helpers;
				a = window;
				c = this.Class.fullName.split(/\./);
				for ( var d = 0; d < c.length; d++ ) {
					typeof a.Helpers == "object" && jQuery.extend(b, a.Helpers);
					a = a[c[d]]
				}
				typeof a.Helpers == "object" && jQuery.extend(b, a.Helpers);
				this._default_helpers = b
			}
			return b
		};
	jQuery.Controller.prototype.view = function( a, b, c ) {
		if ( typeof a != "string" && !c ) {
			c = b;
			b = a;
			a = null
		}
		a = g(this.Class, a, this.called);
		b = b || this;
		c = h.call(this, c);
		return jQuery.View(a, b, c)
	}
});;
steal.end();
steal.plugins("jquery/lang").then(function( f ) {
	f.String.rsplit = function( a, e ) {
		for ( var b = e.exec(a), c = [], d; b != null; ) {
			d = b.index;
			if ( d != 0 ) {
				c.push(a.substring(0, d));
				a = a.slice(d)
			}
			c.push(b[0]);
			a = a.slice(b[0].length);
			b = e.exec(a)
		}
		a != "" && c.push(a);
		return c
	}
});;
steal.end();
steal.plugins("jquery/class", "jquery/lang").then(function() {
	var j = $.String.underscore,
		k = $.String.classize;
	jQuery.Class.extend("jQuery.Model", {
		setup: function( a ) {
			if (!this.attributes || a.attributes === this.attributes ) this.attributes = {};
			if (!this.associations || a.associations === this.associations ) this.associations = {};
			if (!this.validations || a.validations === this.validations ) this.validations = {};
			if ( a.convert != this.convert ) this.convert = $.extend(a.convert, this.convert);
			this._fullName = j(this.fullName.replace(/\./g, "_"));
			if ( this.fullName.substr(0, 7) != "jQuery." ) {
				jQuery.Model.models[this._fullName] = this;
				if ( this.listType ) this.list = new this.listType([])
			}
		},
		attributes: {},
		defaults: {},
		wrap: function( a ) {
			if (!a ) return null;
			return new this(a[this.singularName] || a.data || a.attributes || a)
		},
		wrapMany: function( a ) {
			if (!a ) return null;
			var b = new(this.List || $.Model.List || Array),
				c = $.isArray(a),
				g = c ? a : a.data,
				f = g.length,
				d = 0;
			for ( b._use_call = true; d < f; d++ ) b.push(this.wrap(g[d]));
			if (!c ) for ( var e in a ) if ( e !== "data" ) b[e] = a[e];
			return b
		},
		id: "id",
		addAttr: function( a, b ) {
			if (!this.associations[a] ) {
				this.attributes[a] || (this.attributes[a] = b);
				return b
			}
		},
		models: {},
		publish: function( a, b ) {
			window.OpenAjax && OpenAjax.hub.publish(j(this.shortName) + "." + a, b)
		},
		guessType: function( a ) {
			if ( typeof a != "string" ) {
				if ( a == null ) return typeof a;
				if ( a.constructor == Date ) return "date";
				if ( $.isArray(a) ) return "array";
				return typeof a
			}
			if ( a == "" ) return "string";
			if ( a == "true" || a == "false" ) return "boolean";
			if (!isNaN(a) && +a !== Infinity ) return "number";
			return typeof a
		},
		convert: {
			date: function( a ) {
				return typeof a == "string" ? Date.parse(a) == NaN ? null : Date.parse(a) : a
			},
			number: function( a ) {
				return parseFloat(a)
			},
			"boolean": function( a ) {
				return Boolean(a)
			}
		},
		create: function() {
			throw "Model: Implement Create";
		},
		update: function() {
			throw "Model: Implement " + this.fullName + '\'s "update"!';
		},
		destroy: function() {
			throw "Model: Implement " + this.fullName + '\'s "destroy"!';
		},
		findAll: function() {},
		findOne: function() {}
	}, {
		setup: function( a ) {
			this._initializing = true;
			this.Class.defaults && this.attrs(this.Class.defaults);
			this.attrs(a);
			delete this._initializing
		},
		update: function( a, b, c ) {
			this.attrs(a);
			return this.save(b, c)
		},
		errors: function( a ) {
			if ( a ) a = $.isArray(a) ? a : $.makeArray(arguments);
			var b = {},
				c = this,
				g = function( d, e ) {
					$.each(e, function( h, i ) {
						if ( h = i.call(c) ) {
							b.hasOwnProperty(d) || (b[d] = []);
							b[d].push(h)
						}
					})
				};
			$.each(a || this.Class.validations || {}, function( d, e ) {
				if ( typeof d == "number" ) {
					d = e;
					e = c.Class.validations[d]
				}
				g(d, e || [])
			});
			for ( var f in b ) return b;
			return null
		},
		attr: function( a, b, c, g ) {
			var f = k(a),
				d = "get" + f;
			if ( b !== undefined ) {
				this._setProperty(a, b, c, g, f);
				return this
			}
			return this[d] ? this[d]() : this[a]
		},
		bind: function() {
			var a = $(this);
			a.bind.apply(a, arguments);
			return this
		},
		unbind: function() {
			var a = $(this);
			a.unbind.apply(a, arguments);
			return this
		},
		_setProperty: function( a, b, c, g, f ) {
			f = "set" + f;
			var d = this[a],
				e = this,
				h = function( i ) {
					g && g.call(e, i);
					$(e).triggerHandler("error." + a, i)
				};
			this[f] && (b = this[f](b, this.callback("_updateProperty", a, b, d, c, h), h)) === undefined || this._updateProperty(a, b, d, c, h)
		},
		_updateProperty: function( a, b, c, g, f ) {
			var d = this.Class,
				e = d.attributes[a] || d.addAttr(a, d.guessType(b)),
				h = d.convert[e];
			e = null;
			b = this[a] = b == null ? null : h ? h.call(d, b) : b;
			this._initializing || (e = this.errors(a));
			if ( e ) f(e);
			else {
				c !== b && !this._initializing && $(this).triggerHandler(a, b);
				g && g(this)
			}
			if ( a == d.id && b != null && d.list ) if ( c ) {
				if ( c != b ) {
					d.list.remove(c);
					d.list.push(this)
				}
			} else d.list.push(this)
		},
		attrs: function( a ) {
			var b;
			if ( a ) {
				var c = this.Class.id;
				for ( b in a ) b != c && this.attr(b, a[b]);
				c in a && this.attr(c, a[c])
			} else {
				a = {};
				for ( b in this.Class.attributes ) a[b] = this.attr(b)
			}
			return a
		},
		isNew: function() {
			return this[this.Class.id] == null
		},
		save: function( a, b ) {
			if ( this.errors() ) return false;
			this.isNew() ? this.Class.create(this.attrs(), this.callback(["created", a]), b) : this.Class.update(this[this.Class.id], this.attrs(), this.callback(["updated", a]), b);
			return true
		},
		destroy: function( a, b ) {
			this.Class.destroy(this[this.Class.id], this.callback(["destroyed", a]), b)
		},
		identity: function() {
			var a = this[this.Class.id];
			return this.Class._fullName + "_" + (this.Class.escapeIdentity ? encodeURIComponent(a) : a)
		},
		elements: function( a ) {
			return $("." + this.identity(), a)
		},
		publish: function( a, b ) {
			this.Class.publish(a, b || this)
		},
		hookup: function( a ) {
			var b = j(this.Class.shortName),
				c = $.data(a, "models") || $.data(a, "models", {});
			$(a).addClass(b + " " + this.identity());
			c[b] = this
		}
	});
	$.each(["created", "updated", "destroyed"], function( a, b ) {
		$.Model.prototype[b] = function( c ) {
			b === "destroyed" && this.Class.list && this.Class.list.remove(this[this.Class.id]);
			$(this).triggerHandler(b);
			c && typeof c == "object" && this.attrs(c.attrs ? c.attrs() : c);
			this.publish(b, this);
			return [this].concat($.makeArray(arguments))
		}
	});
	$.fn.models = function() {
		var a = [],
			b, c;
		this.each(function() {
			$.each($.data(this, "models") || {}, function( g, f ) {
				b = b === undefined ? f.Class.List || null : f.Class.List === b ? b : null;
				a.push(f)
			})
		});
		c = new(b || $.Model.List || Array);
		c.push.apply(c, $.unique(a));
		return c
	};
	$.fn.model = function( a ) {
		if ( a && a instanceof $.Model ) {
			a.hookup(this[0]);
			return this
		} else return this.models.apply(this, arguments)[0]
	}
});;
steal.end();
steal.plugins("jquery").then(function() {
	(function( e ) {
		e.toJSON = function( a, c, b, h ) {
			if ( typeof JSON == "object" && JSON.stringify ) return JSON.stringify(a, c, b);
			if (!h && e.isFunction(c) ) a = c("", a);
			if ( typeof b == "number" ) b = "          ".substring(0, b);
			b = typeof b == "string" ? b.substring(0, 10) : "";
			var f = typeof a;
			if ( a === null ) return "null";
			if (!(f == "undefined" || f == "function")) {
				if ( f == "number" || f == "boolean" ) return a + "";
				if ( f == "string" ) return e.quoteString(a);
				if ( f == "object" ) {
					if ( typeof a.toJSON == "function" ) return e.toJSON(a.toJSON(), c, b, true);
					if ( a.constructor === Date ) {
						b = a.getUTCMonth() + 1;
						if ( b < 10 ) b = "0" + b;
						h = a.getUTCDate();
						if ( h < 10 ) h = "0" + h;
						var i = a.getUTCFullYear(),
							g = a.getUTCHours();
						if ( g < 10 ) g = "0" + g;
						var d = a.getUTCMinutes();
						if ( d < 10 ) d = "0" + d;
						var j = a.getUTCSeconds();
						if ( j < 10 ) j = "0" + j;
						a = a.getUTCMilliseconds();
						if ( a < 100 ) a = "0" + a;
						if ( a < 10 ) a = "0" + a;
						return '"' + i + "-" + b + "-" + h + "T" + g + ":" + d + ":" + j + "." + a + 'Z"'
					}
					h = e.isFunction(c) ?
					function( k, l ) {
						return c(k, l)
					} : function( k, l ) {
						return l
					};
					i = b ? "\n" : "";
					j = b ? " " : "";
					if ( a.constructor === Array ) {
						g = [];
						for ( d = 0; d < a.length; d++ ) g.push((e.toJSON(h(d, a[d]), c, b, true) || "null").replace(/^/gm, b));
						return "[" + i + g.join("," + i) + i + "]"
					}
					var n = [];
					if ( e.isArray(c) ) g = e.map(c, function( k ) {
						return typeof k == "string" || typeof k == "number" ? k + "" : null
					});
					for ( d in a ) {
						var m;
						f = typeof d;
						if (!(g && e.inArray(d + "", g) == -1)) {
							if ( f == "number" ) f = '"' + d + '"';
							else if ( f == "string" ) f = e.quoteString(d);
							else continue;
							m = e.toJSON(h(d, a[d]), c, b, true);
							typeof m != "undefined" && n.push((f + ":" + j + m).replace(/^/gm, b))
						}
					}
					return "{" + i + n.join("," + i) + i + "}"
				}
			}
		};
		e.evalJSON = function( a ) {
			if ( typeof JSON == "object" && JSON.parse ) return JSON.parse(a);
			return eval("(" + a + ")")
		};
		e.secureEvalJSON = function( a ) {
			if ( typeof JSON == "object" && JSON.parse ) return JSON.parse(a);
			var c = a;
			c = c.replace(/\\["\\\/bfnrtu]/g, "@");
			c = c.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]");
			c = c.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
			if (/^[\],:{}\s]*$/.test(c) ) return eval("(" + a + ")");
			else throw new SyntaxError("Error parsing JSON, source is not valid.");
		};
		e.quoteString = function( a ) {
			if ( a.match(o) ) return '"' + a.replace(o, function( c ) {
				var b = p[c];
				if ( typeof b === "string" ) return b;
				b = c.charCodeAt();
				return "\\u00" + Math.floor(b / 16).toString(16) + (b % 16).toString(16)
			}) + '"';
			return '"' + a + '"'
		};
		var o = /["\\\x00-\x1f\x7f-\x9f]/g,
			p = {
				"\u0008": "\\b",
				"\t": "\\t",
				"\n": "\\n",
				"\u000c": "\\f",
				"\r": "\\r",
				'"': '\\"',
				"\\": "\\\\"
			}
	})(jQuery)
});;
steal.end();
steal.plugins("jquery/lang/json").then(function() {
	jQuery.cookie = function( d, b, a ) {
		if ( typeof b != "undefined" ) {
			a = a || {};
			if ( b === null ) {
				b = "";
				a.expires = -1
			}
			if ( typeof b == "object" && jQuery.toJSON ) b = jQuery.toJSON(b);
			var c = "";
			if ( a.expires && (typeof a.expires == "number" || a.expires.toUTCString) ) {
				if ( typeof a.expires == "number" ) {
					c = new Date;
					c.setTime(c.getTime() + a.expires * 24 * 60 * 60 * 1E3)
				} else c = a.expires;
				c = "; expires=" + c.toUTCString()
			}
			var e = a.path ? "; path=" + a.path : "",
				f = a.domain ? "; domain=" + a.domain : "";
			a = a.secure ? "; secure" : "";
			document.cookie = [d, "=", encodeURIComponent(b), c, e, f, a].join("")
		} else {
			b = null;
			if ( document.cookie && document.cookie != "" ) {
				a = document.cookie.split(";");
				for ( c = 0; c < a.length; c++ ) {
					e = jQuery.trim(a[c]);
					if ( e.substring(0, d.length + 1) == d + "=" ) {
						b = decodeURIComponent(e.substring(d.length + 1));
						break
					}
				}
			}
			if ( jQuery.evalJSON && b && b.match(/^\s*\{/) ) try {
				b = jQuery.evalJSON(b)
			} catch (g) {}
			return b
		}
	}
});;
steal.end();
steal.plugins("jquery/dom/dimensions", "jquery/event/resize").then(function( c ) {
	var i = /script|td/,
		j = function( a ) {
			return a === document || a === document.documentElement || a === window || a === document.body
		},
		k = function( a ) {
			if ( a[0] == window ) return false;
			a = a.curStyles("borderBottomWidth", "paddingBottom");
			return !parseInt(a.borderBottomWidth) && !parseInt(a.paddingBottom)
		},
		l = function( a, b ) {
			return a.outerHeight() + b(a)
		};
	pageOffset = function( a ) {
		return a.offset().top
	};
	offsetTop = function( a ) {
		return a[0].offsetTop
	};
	inFloat = function( a, b ) {
		for (; a && a != b; ) {
			var d = c(a).css("float");
			if ( d == "left" || d == "right" ) return d;
			a = a.parentNode
		}
	};
	filler = c.fn.phui_filler = function( a ) {
		a || (a = {});
		a.parent || (a.parent = c(this).parent());
		a.parent = c(a.parent);
		var b = j(a.parent[0]);
		if ( b ) a.parent = c(window);
		b = {
			filler: this,
			inFloat: inFloat(this[0], b ? document.body : a.parent[0])
		};
		c(a.parent).bind("resize", b, filler.parentResize);
		this.bind("destroyed", b, function( d ) {
			d.filler.removeClass("phui_filler");
			c(a.parent).unbind("resize", filler.parentResize)
		});
		this.addClass("phui_filler");
		b = function() {
			setTimeout(function() {
				a.parent.triggerHandler("resize")
			}, 13)
		};
		c.isReady ? b() : c(b);
		return this
	};
	c.extend(filler, {
		parentResize: function( a ) {
			var b = c(this),
				d = this == window ? c(document.body) : b,
				g = k(b),
				e = d.children().filter(function() {
					if ( i.test(this.nodeName.toLowerCase()) ) return false;
					var f = c.curStyles(this, ["position", "display"]);
					return f.position !== "absolute" && f.position !== "fixed" && f.display !== "none" && !jQuery.expr.filters.hidden(this)
				}).eq(-1),
				h = a.data.filler.offsetParent()[0] === d[0];
			offset =
			h || e.offsetParent()[0] == d.offsetParent()[0] ? offsetTop : pageOffset;
			firstOffset = h ? 0 : offset(d);
			parentHeight = b.height();
			if ( g ) e = c('<div style="height: 0px; line-height:0px;overflow:hidden;' + (a.data.inFloat ? "clear: both" : "") + ';"/>').appendTo(d);
			b = l(e, offset) - 0 - firstOffset;
			b = parentHeight - b;
			d = a.data.filler.height();
			a.data.filler.height(d + b);
			g && e.remove();
			a.data.filler.triggerHandler("resize")
		}
	})
});;
steal.end();
steal.plugins("jquery/dom/cur_styles").then(function( a ) {
	var m = /button|select/i,
		f = {},
		h = {
			width: ["Left", "Right"],
			height: ["Top", "Bottom"],
			oldOuterHeight: a.fn.outerHeight,
			oldOuterWidth: a.fn.outerWidth,
			oldInnerWidth: a.fn.innerWidth,
			oldInnerHeight: a.fn.innerHeight
		};
	a.each({
		width: "Width",
		height: "Height"
	}, function( d, e ) {
		f[d] = function( c, b ) {
			var j = 0;
			if (!m.test(c.nodeName) ) {
				var k = [];
				a.each(h[d], function() {
					var l = this;
					a.each(b, function( g, n ) {
						if ( n ) k.push(g + l + (g == "border" ? "Width" : ""))
					})
				});
				a.each(a.curStyles(c, k), function( l, g ) {
					j += parseFloat(g) || 0
				})
			}
			return j
		};
		a.fn["outer" + e] = function( c, b ) {
			if ( typeof c == "number" ) {
				this[d](c - f[d](this[0], {
					padding: true,
					border: true,
					margin: b
				}));
				return this
			} else return h["oldOuter" + e].call(this, c)
		};
		a.fn["inner" + e] = function( c ) {
			if ( typeof c == "number" ) {
				this[d](c - f[d](this[0], {
					padding: true
				}));
				return this
			} else return h["oldInner" + e].call(this, c)
		};
		var i = function( c ) {
			return function( b ) {
				if ( b.state == 0 ) {
					b.start = a(b.elem)[d]();
					b.end -= f[d](b.elem, c)
				}
				b.elem.style[d] = b.pos * (b.end - b.start) + b.start + "px"
			}
		};
		a.fx.step["outer" + e] = i({
			padding: true,
			border: true
		});
		a.fx.step["outer" + e + "Margin"] = i({
			padding: true,
			border: true,
			margin: true
		});
		a.fx.step["inner" + e] = i({
			padding: true
		})
	})
});;
steal.end();
steal.plugin("jquery/dom").then(function( f ) {
	var i = document.defaultView && document.defaultView.getComputedStyle,
		n = /([A-Z])/g,
		l = /-([a-z])/ig,
		m = function( a, g ) {
			return g.toUpperCase()
		},
		o = function( a ) {
			if ( i ) return i(a, null);
			else if ( a.currentStyle ) return a.currentStyle
		},
		p = /float/i,
		q = /^-?\d+(?:px)?$/i,
		r = /^-?\d/;
	f.curStyles = function( a, g ) {
		if (!a ) return null;
		for ( var j = o(a), c, d, h = a.style, e = {}, k = 0, b; k < g.length; k++ ) {
			b = g[k];
			c = b.replace(l, m);
			if ( p.test(b) ) {
				b = jQuery.support.cssFloat ? "float" : "styleFloat";
				c = "cssFloat"
			}
			if ( i ) {
				b =
				b.replace(n, "-$1").toLowerCase();
				d = j.getPropertyValue(b);
				if ( b === "opacity" && d === "" ) d = "1";
				e[c] = d
			} else {
				d = b.replace(l, m);
				e[c] = j[b] || j[d];
				if (!q.test(e[c]) && r.test(e[c]) ) {
					b = h.left;
					var s = a.runtimeStyle.left;
					a.runtimeStyle.left = a.currentStyle.left;
					h.left = d === "fontSize" ? "1em" : e[c] || 0;
					e[c] = h.pixelLeft + "px";
					h.left = b;
					a.runtimeStyle.left = s
				}
			}
		}
		return e
	};
	f.fn.curStyles = function() {
		return f.curStyles(this[0], f.makeArray(arguments))
	}
});;
steal.end();
steal.plugins("jquery");;
steal.end();
steal.plugins("jquery/event").then(function( f ) {
	var c = 0,
		a = f(window),
		g = a.width(),
		h = a.height(),
		i;
	f.event.special.resize = {
		add: function( d ) {
			d.origHandler = d.handler;
			d.handler = function( b, e ) {
				if ( this !== window || c === 0 && !b.originalEvent ) {
					c++;
					d.origHandler.call(this, b, e);
					c--
				}
				b = a.width();
				e = a.height();
				if ( c === 0 && (b != g || e != h) ) {
					g = b;
					h = e;
					clearTimeout(i);
					i = setTimeout(function() {
						a.triggerHandler("resize")
					}, 1)
				}
			}
		},
		setup: function() {
			return this !== window
		}
	}
});;
steal.end();
steal.plugins("jquery", "jquery/controller").then(function( d ) {
	d.Controller.extend("Phui.Positionable", {
		listensTo: ["show", "move"],
		iframe: false,
		keep: false
	}, {
		init: function() {
			this.element.css("position", "absolute");
			if (!this.options.keep ) {
				this.element[0].parentNode.removeChild(this.element[0]);
				document.body.appendChild(this.element[0])
			}
		},
		show: function() {
			this.move.apply(this, arguments)
		},
		move: function( a, b, e ) {
			var c = d.extend({}, this.options);
			c.of = e || c.of;
			if ( c.of ) {
				a = d(c.of);
				var h = (c.collision || "flip").split(" "),
					g = c.offset ? c.offset.split(" ") : [0, 0],
					i, j;
				if ( c.of.nodeType === 9 ) {
					i = a.width();
					j = a.height();
					a = {
						top: 0,
						left: 0
					}
				} else if ( c.of.scrollTo && c.of.document ) {
					i = a.width();
					j = a.height();
					a = {
						top: a.scrollTop(),
						left: a.scrollLeft()
					}
				} else if ( c.of.preventDefault ) {
					c.at = "left top";
					i = j = 0;
					a = {
						top: c.of.pageY,
						left: c.of.pageX
					}
				} else if ( c.of.top ) {
					c.at = "left top";
					i = j = 0;
					a = {
						top: c.of.top,
						left: c.of.left
					}
				} else {
					i = a.outerWidth();
					j = a.outerHeight();
					if ( this.options.keep ) {
						a = a.offset();
						b = this.element.parent().children(":first").offset();
						a = {
							left: a.left - b.left,
							top: a.top - b.top
						}
					} else a = a.offset()
				}
				d.each(["my", "at"], function() {
					var f = (c[this] || "").split(" ");
					if ( f.length === 1 ) f = p.test(f[0]) ? f.concat([l]) : q.test(f[0]) ? [m].concat(f) : [m, l];
					f[0] = p.test(f[0]) ? f[0] : m;
					f[1] = q.test(f[1]) ? f[1] : l;
					c[this] = f
				});
				if ( h.length === 1 ) h[1] = h[0];
				g[0] = parseInt(g[0], 10) || 0;
				if ( g.length === 1 ) g[1] = g[0];
				g[1] = parseInt(g[1], 10) || 0;
				if ( c.at[0] === "right" ) a.left += i;
				else if ( c.at[0] === m ) a.left += i / 2;
				if ( c.at[1] === "bottom" ) a.top += j;
				else if ( c.at[1] === l ) a.top += j / 2;
				a.left += g[0];
				a.top += g[1];
				b = this.element;
				var n = b.outerWidth(),
					o = b.outerHeight(),
					k = d.extend({}, a);
				if ( c.my[0] === "right" ) k.left -= n;
				else if ( c.my[0] === m ) k.left -= n / 2;
				if ( c.my[1] === "bottom" ) k.top -= o;
				else if ( c.my[1] === l ) k.top -= o / 2;
				d.each(["left", "top"], function( f, r ) {
					d.ui.position[h[f]] && d.ui.position[h[f]][r](k, {
						targetWidth: i,
						targetHeight: j,
						elemWidth: n,
						elemHeight: o,
						offset: g,
						my: c.my,
						at: c.at
					})
				});
				b.offset(d.extend(k, {
					using: c.using
				}))
			}
		}
	});
	d.ui = d.ui || {};
	var p = /left|center|right/,
		m = "center",
		q = /top|center|bottom/,
		l = "center",
		s = d.fn.position;
	d.fn.position =

	function( a ) {
		if (!a || !a.of ) return s.apply(this, arguments)
	};
	d.ui.position = {
		fit: {
			left: function( a, b ) {
				var e = d(window);
				b = a.left + b.elemWidth - e.width() - e.scrollLeft();
				a.left = b > 0 ? a.left - b : Math.max(0, a.left)
			},
			top: function( a, b ) {
				var e = d(window);
				b = a.top + b.elemHeight - e.height() - e.scrollTop();
				a.top = b > 0 ? a.top - b : Math.max(0, a.top)
			}
		},
		flip: {
			left: function( a, b ) {
				if ( b.at[0] !== "center" ) {
					var e = d(window);
					e = a.left + b.elemWidth - e.width() - e.scrollLeft();
					var c = b.my[0] === "left" ? -b.elemWidth : b.my[0] === "right" ? b.elemWidth : 0,
						h = -2 * b.offset[0];
					a.left += a.left < 0 ? c + b.targetWidth + h : e > 0 ? c - b.targetWidth + h : 0
				}
			},
			top: function( a, b ) {
				if ( b.at[1] !== "center" ) {
					var e = d(window);
					e = a.top + b.elemHeight - e.height() - e.scrollTop();
					var c = b.my[1] === "top" ? -b.elemHeight : b.my[1] === "bottom" ? b.elemHeight : 0,
						h = b.at[1] === "top" ? b.targetHeight : -b.targetHeight,
						g = -2 * b.offset[1];
					a.top += a.top < 0 ? c + b.targetHeight + g : e > 0 ? c + h + g : 0
				}
			}
		}
	}
});;
steal.end();
steal.plugins("jquery/controller", "jquery/event/default", "jquery/event/livehack", "jquery/dom/closest").then(function( e ) {
	e.Controller.extend("Phui.Menuable", {
		defaults: {
			types: [],
			active: "active",
			select: "selected",
			child_selector: "li"
		},
		listensTo: ["hide", "show", "hide:before", "hide:after", "show:before", "show:after"]
	}, {
		ifThereIs: function( a ) {
			var b = function() {
				if ( typeof a.beforeTriggering == "string" ) a.on.trigger(a.beforeTriggering);
				else a.beforeTriggering && a.beforeTriggering()
			};
			if ( a.a.length ) {
				a.a.bind(a.andWaitFor, function( d ) {
					if ( this == d.target ) {
						e(this).unbind(a.andWaitFor, arguments.callee);
						b()
					}
				});
				if (!a.a.triggerHandled(a.trigger, a.withData) ) {
					a.ifNothingResponds && a.ifNothingResponds(a.a);
					b()
				}
			} else b()
		},
		sub: function( a ) {
			return a.children().eq(1)
		},
		calculateSubmenuPosition: function( a ) {
			return a
		},
		">{child_selector} default.activate": function( a, b ) {
			if (!a.hasClass(this.options.active) ) if (!this.activating ) {
				this.activating = true;
				var d = this.find("." + this.options.active + ":first"),
					c = this,
					f = function() {
						c.ifThereIs({
							a: d,
							trigger: "deactivate",
							andWaitFor: "deactivate:after",
							beforeTriggering: function() {
								c.ifThereIs({
									a: c.sub(a),
									trigger: "show",
									withData: c.calculateSubmenuPosition(a, b),
									andWaitFor: "show:after",
									ifNothingResponds: function( g ) {
										g.show()
									},
									beforeTriggering: "activate:before",
									on: a
								})
							}
						})
					};
				a.hasClass(this.options.select) ? f() : a.one("select:after", f).trigger("select")
			}
		},
		">{child_selector} default.activate:before": function( a ) {
			a.trigger("activate:after")
		},
		">{child_selector} default.activate:after": function( a ) {
			a.addClass(this.options.active);
			this.activating =
			false;
			this.element.trigger("change")
		},
		">{child_selector} default.deactivate": function( a ) {
			this.ifThereIs({
				a: this.sub(a),
				trigger: "hide",
				andWaitFor: "hide:after",
				ifNothingResponds: function( b ) {
					b.hide()
				},
				beforeTriggering: "deactivate:before",
				on: a
			})
		},
		">{child_selector} default.deactivate:before": function( a ) {
			a.trigger("deactivate:after")
		},
		">{child_selector} default.deactivate:after": function( a ) {
			a.removeClass(this.options.active)
		},
		">{child_selector} default.select": function( a ) {
			if (!this.selecting ) {
				this.selecting =
				true;
				this.ifThereIs({
					a: this.find("." + this.options.select + ":first"),
					trigger: "deselect",
					andWaitFor: "deselect:after",
					beforeTriggering: "select:before",
					on: a
				})
			}
		},
		">{child_selector} default.select:before": function( a ) {
			a.trigger("select:after")
		},
		">{child_selector} default.select:after": function( a ) {
			a.addClass(this.options.select);
			this.selecting = false
		},
		">{child_selector} default.deselect": function( a ) {
			a.trigger("deselect:before")
		},
		">{child_selector} default.deselect:before": function( a ) {
			a.trigger("deselect:after")
		},
		">{child_selector} default.deselect:after": function( a ) {
			a.removeClass(this.options.select)
		},
		">default.hide": function( a ) {
			var b = this;
			this.ifThereIs({
				a: this.element.find("." + this.options.active),
				trigger: "deactivate",
				andWaitFor: "deactivate:after",
				beforeTriggering: function() {
					b.ifThereIs({
						a: b.element.find("." + b.options.select),
						trigger: "deselect",
						andWaitFor: "deselect:after",
						beforeTriggering: "hide:before",
						on: a
					})
				}
			})
		},
		">default.hide:before": function( a ) {
			a.triggerDefaults("hide:after")
		},
		">default.show": function( a ) {
			a.trigger("show:before")
		},
		">default.show:before": function( a ) {
			a.triggerDefaults("show:after")
		}
	})
});;
steal.end();
steal.plugins("jquery/event").then(function( d ) {
	var h = {},
		i = /\.(.*)$/;
	d.event.special["default"] = {
		add: function( a ) {
			h[a.namespace.replace(i, "")] = true;
			var c = a.handler;
			a.origHandler = c;
			a.handler = function( b, f ) {
				if (!b._defaultActions ) b._defaultActions = [];
				b._defaultActions.push({
					element: this,
					handler: c,
					event: b,
					data: f,
					currentTarget: b.currentTarget
				})
			}
		},
		setup: function() {
			return true
		}
	};
	var g = d.event.trigger;
	d.event.trigger = function( a, c, b, f ) {
		var e = a.type || a;
		if (!f ) {
			a = typeof a === "object" ? a[d.expando] ? a : jQuery.extend(jQuery.Event(e), a) : jQuery.Event(e);
			if ( e.indexOf("!") >= 0 ) {
				a.type = e.slice(0, -1);
				a.exclusive = true
			}
			a._defaultActions = []
		}
		e = jQuery.Event("default." + a.type);
		d.extend(e, {
			target: b,
			_defaultActions: a._defaultActions,
			exclusive: true
		});
		e.stopPropagation();
		b && g.call(d.event, e, [e, c], b, true);
		g.call(d.event, a, c, b, f);
		if (!a.isDefaultPrevented() && a._defaultActions && (a.isPropagationStopped() || !b.parentNode && !b.ownerDocument) ) {
			a.namespace = a.type;
			a.type = "default";
			a.liveFired = null;
			for ( c = 0; c < a._defaultActions.length; c++ ) {
				b = a._defaultActions[c];
				f = a.handled;
				a.currentTarget = b.currentTarget;
				b.handler.call(b.element, a, b.data);
				a.handled = a.handled === null ? f : true
			}
			a._defaultActions = null
		}
	};
	d.fn.triggerDefault = function( a, c ) {
		if ( this[0] ) {
			a = d.Event(a);
			a.stopPropagation();
			jQuery.event.trigger(a, c, this[0]);
			return !a.isDefaultPrevented()
		}
		return true
	};
	d.fn.triggerDefaults = function( a, c ) {
		if ( this[0] ) {
			a = d.Event(a);
			jQuery.event.trigger(a, c, this[0]);
			return !a.isDefaultPrevented()
		}
		return true
	}
});;
steal.end();
steal.plugins("jquery/event").then(function() {
	var g = jQuery.event,
		l = function( b, d, e ) {
			for ( var f = 0; f < d.length; f++ ) {
				var c = d[f],
					a, h = c.indexOf(".") < 0,
					i;
				if (!h ) {
					a = c.split(".");
					c = a.shift();
					i = new RegExp("(^|\\.)" + a.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)")
				}
				a = (b[c] || []).slice(0);
				for ( var k = 0; k < a.length; k++ ) {
					var j = a[k];
					if (!j.selector && (h || i.test(j.namespace)) ) e(c, j.origHandler || j.handler)
				}
			}
		};
	g.find = function( b, d, e ) {
		b = $.data(b, "events");
		var f = [];
		if (!b ) return f;
		if ( e ) {
			if (!b.live ) return [];
			b = b.live;
			for ( var c =
			0; c < b.length; c++ ) {
				var a = b[c];
				if ( a.selector === e && $.inArray(a.origType, d) !== -1 ) f.push(a.origHandler || a.handler)
			}
		} else l(b, d, function( h, i ) {
			f.push(i)
		});
		return f
	};
	g.findBySelector = function( b, d ) {
		b = $.data(b, "events");
		var e = {},
			f = function( c, a, h ) {
				c = e[c] || (e[c] = {});
				(c[a] || (c[a] = [])).push(h)
			};
		if (!b ) return e;
		$.each(b.live || [], function( c, a ) {
			if ( $.inArray(a.origType, d) !== -1 ) f(a.selector, a.origType, a.origHandler || a.handler)
		});
		l(b, d, function( c, a ) {
			f("", c, a)
		});
		return e
	};
	$.fn.respondsTo = function( b ) {
		return this.length ? g.find(this[0], $.isArray(b) ? b : [b]).length > 0 : false
	};
	$.fn.triggerHandled = function( b, d ) {
		b = typeof b == "string" ? $.Event(b) : b;
		this.trigger(b, d);
		return b.handled
	};
	g.setupHelper = function( b, d, e ) {
		if (!e ) {
			e = d;
			d = null
		}
		var f = function( a ) {
			if ( a = a.selector || "" ) g.find(this, b, a).length || $(this).delegate(a, d, e);
			else g.find(this, b, a).length || g.add(this, d, e, {
				selector: a,
				delegate: this
			})
		},
			c = function( a ) {
				if ( a = a.selector || "" ) g.find(this, b, a).length || $(this).undelegate(a, d, e);
				else g.find(this, b, a).length || g.remove(this, d, e, {
					selector: a,
					delegate: this
				})
			};
		$.each(b, function() {
			g.special[this] = {
				add: f,
				remove: c,
				setup: function() {},
				teardown: function() {}
			}
		})
	}
});;
steal.end();
steal.plugins("jquery/dom").then(function() {
	var k = jQuery.fn.closest;
	jQuery.fn.closest = function( a, i ) {
		var f = {},
			b, c, d, g, j = true,
			h = a;
		if ( typeof a == "string" ) h = [a];
		$.each(h, function( l, e ) {
			if ( e.indexOf(">") == 0 ) {
				if ( e.indexOf(" ") != -1 ) throw " closest does not work with > followed by spaces!";
				f[h[l] = e.substr(1)] = e;
				if ( typeof a == "string" ) a = e.substr(1);
				j = false
			}
		});
		b = k.call(this, a, i);
		if ( j ) return b;
		for ( d = 0; d < b.length; ) {
			c = b[d];
			g = c.selector;
			if ( f[g] !== undefined ) {
				c.selector = f[g];
				f[g] = false;
				if ( typeof c.selector !== "string" || c.elem.parentNode !== i ) {
					b.splice(d, 1);
					continue
				}
			}
			d++
		}
		return b
	}
});;
steal.end();
var orderedParams = function( a ) {
	var c = [];
	for ( var d in a ) c[a[d].order] = a[d];
	return c
};
DocumentationHelpers = {
	previousIndent: 0,
	calculateDisplay: function( a, c ) {
		var d = c.split(/\./);
		a = a.split(/\./);
		for ( var b = [], f = [], e = 0; e < d.length; e++ ) if ( a[e] && a[e] == d[e] ) b.push(d[e]);
		else {
			f = d.slice(e);
			break
		}
		if ( b.length == 1 && (b[0] == "jQuery" || b[0] == "steal") ) return {
			length: 1,
			name: c
		};
		if ( this.indentAdjust === undefined ) this.indentAdjust = b.length ? 0 : 1;
		return {
			length: b.length < 2 ? b.length + this.indentAdjust : b.length,
			name: f.join(".")
		}
	},
	normalizeName: function( a ) {
		return a.replace(/&gt;/, "_gt_").replace(/\*/g, "_star_")
	},
	linkTags: function( a ) {
		for ( var c = [], d = 0; d < a.length; d++ ) c.push("<a href='#&search=" + a[d] + "'>" + a[d] + "</a>");
		return c.join(" ")
	},
	linkOpen: function( a ) {
		return "<a href='#&who=" + a + "'>" + a + "</a>"
	},
	signiture: function() {
		var a = [],
			c = this._data.name;
		c = c.replace("jQuery.", "$.");
		var d = c.lastIndexOf(".static."),
			b = c.lastIndexOf(".prototype.");
		if ( d != -1 ) c = c.substring(0, d) + "." + c.substring(d + 8);
		else if ( b != -1 ) c = jQuery.String.underscore(c.substring(0, b).replace("$.", "")) + "." + c.substring(b + 11);
		if ( this._data.shortName == "constructor" ) c = "new " + c;
		d = orderedParams(this._data.params);
		for ( b = 0; b < d.length; b++ ) a.push(d[b].name);
		return c + "(" + a.join(", ") + ")" + (this._data.ret ? " -> " + this._data.ret.type : "")
	},
	link: function( a, c ) {
		return a.replace(/\[\s*((?:['"][^"']*["'])|[^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function( d, b, f ) {
			if (/^["']/.test(b) ) b = b.substr(1, b.length - 2);
			var e = Search._data.list[b] ? b : null;
			if ( e ) {
				f || (f = c ? b : b.replace(/\.prototype|\.static/, ""));
				return "<a href='#&who=" + e + "'>" + f + "</a>"
			} else if ( typeof b == "string" && b.match(/^https?|www\.|#/) ) return "<a href='" + b + "'>" + (f || b) + "</a>";
			return d
		})
	},
	shortenUrl: function( a ) {
		a = a.href ? a.href : a;
		var c = a.match(/(https?:\/\/|file:\/\/)[^\/]*\/(.*)/);
		return c[2] ? c[2] : a
	}
};;
steal.end();
var hljs = new(function() {
	function G(d) {
		for ( var c = "", g = 0; g < d.childNodes.length; g++ ) if ( d.childNodes[g].nodeType == 3 ) c += d.childNodes[g].nodeValue;
		else if ( d.childNodes[g].nodeName == "BR" ) c += "\n";
		else throw "No highlight";
		return c
	}
	function H(d) {
		d = d.className.split(/\s+/);
		for ( var c = 0; c < d.length; c++ ) {
			if ( d[c] == "no-highlight" ) throw "No highlight";
			if ( l[d[c]] ) return d[c]
		}
	}
	function B(d, c) {
		try {
			var g = G(d),
				k = H(d)
		} catch (m) {
			if ( m == "No highlight" ) return
		}
		if ( k ) var n = i.highlight(k, g).value;
		else {
			var v = 0;
			for ( var s in t ) if ( t.hasOwnProperty(s) ) {
				var u =
				i.highlight(s, g),
					p = u.keyword_count + u.relevance;
				if ( p > v ) {
					v = p;
					n = u.value;
					k = s
				}
			}
		}
		if ( n ) {
			if ( c ) n = n.replace(/^(\t+)/gm, function( x, y ) {
				return y.replace(/\t/g, c)
			});
			g = d.className;
			g.match(k) || (g += " " + k);
			k = document.createElement("div");
			k.innerHTML = '<pre><code class="' + g + '">' + n + "</code></pre>";
			d.parentNode.parentNode.replaceChild(k.firstChild, d.parentNode)
		}
	}
	function C() {
		for ( var d in l ) if ( l.hasOwnProperty(d) ) for ( var c = l[d], g = 0; g < c.modes.length; g++ ) {
			if ( c.modes[g].begin ) c.modes[g].beginRe = i.langRe(c, "^" + c.modes[g].begin);
			if ( c.modes[g].end ) c.modes[g].endRe = i.langRe(c, "^" + c.modes[g].end);
			if ( c.modes[g].illegal ) c.modes[g].illegalRe = i.langRe(c, "^(?:" + c.modes[g].illegal + ")");
			c.defaultMode.illegalRe = i.langRe(c, "^(?:" + c.defaultMode.illegal + ")");
			if ( c.modes[g].relevance == undefined ) c.modes[g].relevance = 1
		}
	}
	function D() {
		function d(m) {
			if (!m.keywordGroups ) for ( var n in m.keywords ) if ( m.keywords.hasOwnProperty(n) ) {
				m.keywordGroups = m.keywords[n] instanceof Object ? m.keywords : {
					keyword: m.keywords
				};
				break
			}
		}
		for ( var c in l ) if ( l.hasOwnProperty(c) ) {
			var g =
			l[c];
			d(g.defaultMode);
			for ( var k = 0; k < g.modes.length; k++ ) d(g.modes[k])
		}
	}
	function I(d) {
		for ( var c = 0; c < d.childNodes.length; c++ ) {
			node = d.childNodes[c];
			if ( node.nodeName == "CODE" ) return node;
			if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/))) return null
		}
	}
	function w() {
		if (!w.called ) {
			w.called = true;
			C();
			D();
			if ( arguments.length ) for ( var d = 0; d < arguments.length; d++ ) {
				if ( l[arguments[d]] ) t[arguments[d]] = l[arguments[d]]
			} else t = l;
			var c = document.getElementsByTagName("pre");
			for ( d = 0; d < c.length; d++ ) {
				var g = I(c[d]);
				g && B(g, hljs.tabReplace)
			}
		}
	}

	function J() {
		var d = arguments,
			c = function() {
				w.apply(null, d)
			};
		if ( window.addEventListener ) {
			window.addEventListener("DOMContentLoaded", c, false);
			window.addEventListener("load", c, false)
		} else if ( window.attachEvent ) window.attachEvent("onload", c);
		else window.onload = c
	}
	var l = {},
		t = {},
		i = {};
	i.escape = function( d ) {
		return d.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;")
	};
	i.contains = function( d, c ) {
		if (!d ) return false;
		for ( var g = 0; g < d.length; g++ ) if ( d[g] == c ) return true;
		return false
	};
	i.highlight = function( d, c ) {
		function g(a, b) {
			a.sub_modes = [];
			for ( var e = 0; e < a.contains.length; e++ ) for ( var f = 0; f < b.modes.length; f++ ) if ( b.modes[f].className == a.contains[e] ) a.sub_modes[a.sub_modes.length] = b.modes[f]
		}
		function k(a, b) {
			if ( j[a].end && j[a].endRe.test(b) ) return 1;
			if ( j[a].endsWithParent ) return (a = k(a - 1, b)) ? a + 1 : 0;
			return 0
		}
		function m(a, b) {
			return b.illegalRe && b.illegalRe.test(a)
		}
		function n(a, b) {
			function e(E) {
				i.contains(f, E) || (f[f.length] = E)
			}
			var f = [];
			if ( a.contains ) for ( var h = 0; h < b.modes.length; h++ ) i.contains(a.contains, b.modes[h].className) && e(b.modes[h].begin);
			h = j.length - 1;
			do {
				j[h].end && e(j[h].end);
				h--
			} while ( j[h + 1].endsWithParent );
			a.illegal && e(a.illegal);
			a = "(" + f[0];
			for ( h = 0; h < f.length; h++ ) a += "|" + f[h];
			a += ")";
			return i.langRe(b, a)
		}
		function v(a, b) {
			var e = j[j.length - 1];
			if (!e.terminators ) e.terminators = n(e, o);
			a = a.substr(b);
			b = e.terminators.exec(a);
			if (!b ) return [a, "", true];
			return b.index == 0 ? ["", b[0], false] : [a.substr(0, b.index), b[0], false]
		}
		function s(a, b) {
			b = o.case_insensitive ? b[0].toLowerCase() : b[0];
			for ( var e in a.keywordGroups ) if ( a.keywordGroups.hasOwnProperty(e) ) {
				var f =
				a.keywordGroups[e].hasOwnProperty(b);
				if ( f ) return [e, f]
			}
			return false
		}
		function u(a, b) {
			if (!b.keywords || !b.lexems ) return i.escape(a);
			if (!b.lexemsRe ) {
				for ( var e = "(" + b.lexems[0], f = 1; f < b.lexems.length; f++ ) e += "|" + b.lexems[f];
				e += ")";
				b.lexemsRe = i.langRe(o, e, true)
			}
			e = "";
			var h = 0;
			b.lexemsRe.lastIndex = 0;
			for ( f = b.lexemsRe.exec(a); f; ) {
				e += i.escape(a.substr(h, f.index - h));
				if ( h = s(b, f) ) {
					z += h[1];
					e += '<span class="' + h[0] + '">' + i.escape(f[0]) + "</span>"
				} else e += i.escape(f[0]);
				h = b.lexemsRe.lastIndex;
				f = b.lexemsRe.exec(a)
			}
			e += i.escape(a.substr(h, a.length - h));
			return e
		}
		function p(a, b) {
			if ( b.subLanguage && t[b.subLanguage] ) {
				a = i.highlight(b.subLanguage, a);
				z += a.keyword_count;
				A += a.relevance;
				return a.value
			} else return u(a, b)
		}
		function x(a, b) {
			var e = a.noMarkup ? "" : '<span class="' + a.className + '">';
			if ( a.returnBegin ) {
				q += e;
				a.buffer = ""
			} else if ( a.excludeBegin ) {
				q += i.escape(b) + e;
				a.buffer = ""
			} else {
				q += e;
				a.buffer = b
			}
			j[j.length] = a
		}
		function y(a, b, e) {
			var f = j[j.length - 1];
			if ( e ) {
				q += p(f.buffer + a, f);
				return false
			}
			if ( e = i.subMode(b, f) ) {
				q += p(f.buffer + a, f);
				x(e, b);
				A += e.relevance;
				return e.returnBegin
			}
			if ( e = k(j.length - 1, b) ) {
				var h = f.noMarkup ? "" : "</span>";
				for ( q += f.returnEnd ? p(f.buffer + a, f) + h : f.excludeEnd ? p(f.buffer + a, f) + h + i.escape(b) : p(f.buffer + a + b, f) + h; e > 1; ) {
					h = j[j.length - 2].noMarkup ? "" : "</span>";
					q += h;
					e--;
					j.length--
				}
				j.length--;
				j[j.length - 1].buffer = "";
				if ( f.starts ) for ( a = 0; a < o.modes.length; a++ ) if ( o.modes[a].className == f.starts ) {
					x(o.modes[a], "");
					break
				}
				return f.returnEnd
			}
			if ( m(b, f) ) throw "Illegal";
		}
		i.subMode = function( a, b ) {
			if (!b.contains ) return null;
			b.sub_modes || g(b, o);
			for ( var e = 0; e < b.sub_modes.length; e++ ) if ( b.sub_modes[e].beginRe.test(a) ) return b.sub_modes[e];
			return null
		};
		var o = l[d],
			j = [o.defaultMode],
			A = 0,
			z = 0,
			q = "";
		try {
			d = 0;
			o.defaultMode.buffer = "";
			do {
				var r = v(c, d),
					K = y(r[0], r[1], r[2]);
				d += r[0].length;
				K || (d += r[1].length)
			} while (!r[2] );
			if ( j.length > 1 ) throw "Illegal";
			return {
				relevance: A,
				keyword_count: z,
				value: q
			}
		} catch (F) {
			if ( F == "Illegal" ) return {
				relevance: 0,
				keyword_count: 0,
				value: i.escape(c)
			};
			else throw F;
		}
	};
	i.langRe = function( d, c, g ) {
		return new RegExp(c, "m" + (d.case_insensitive ? "i" : "") + (g ? "g" : ""))
	};
	this.LANGUAGES = l;
	this.initHighlightingOnLoad = J;
	this.highlightBlock = B;
	this.initHighlighting = w;
	this.IDENT_RE = "[a-zA-Z][a-zA-Z0-9_]*";
	this.UNDERSCORE_IDENT_RE = "[a-zA-Z_][a-zA-Z0-9_]*";
	this.NUMBER_RE = "\\b\\d+(\\.\\d+)?";
	this.C_NUMBER_RE = "\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)";
	this.RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
	this.APOS_STRING_MODE = {
		className: "string",
		begin: "'",
		end: "'",
		illegal: "\\n",
		contains: ["escape"],
		relevance: 0
	};
	this.QUOTE_STRING_MODE = {
		className: "string",
		begin: '"',
		end: '"',
		illegal: "\\n",
		contains: ["escape"],
		relevance: 0
	};
	this.BACKSLASH_ESCAPE = {
		className: "escape",
		begin: "\\\\.",
		end: "^",
		noMarkup: true,
		relevance: 0
	};
	this.C_LINE_COMMENT_MODE = {
		className: "comment",
		begin: "//",
		end: "$",
		relevance: 0
	};
	this.C_BLOCK_COMMENT_MODE = {
		className: "comment",
		begin: "/\\*",
		end: "\\*/|\\*\\|"
	};
	this.HASH_COMMENT_MODE = {
		className: "comment",
		begin: "#",
		end: "$"
	};
	this.C_NUMBER_MODE = {
		className: "number",
		begin: this.C_NUMBER_RE,
		end: "^",
		relevance: 0
	};
	this.start = function() {
		C();
		D()
	}
});;
steal.end();
hljs.LANGUAGES.javascript = {
	defaultMode: {
		lexems: [hljs.UNDERSCORE_IDENT_RE],
		contains: ["string", "comment", "number", "regexp_container", "function"],
		keywords: {
			keyword: {
				"in": 1,
				"if": 1,
				"for": 1,
				"while": 1,
				"finally": 1,
				"var": 1,
				"new": 1,
				"function": 1,
				"do": 1,
				"return": 1,
				"void": 1,
				"else": 1,
				"break": 1,
				"catch": 1,
				"instanceof": 1,
				"with": 1,
				"throw": 1,
				"case": 1,
				"default": 1,
				"try": 1,
				"this": 1,
				"switch": 1,
				"continue": 1,
				"typeof": 1,
				"delete": 1
			},
			literal: {
				"true": 1,
				"false": 1,
				"null": 1
			}
		}
	},
	modes: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.C_NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.BACKSLASH_ESCAPE,
	{
		className: "regexp_container",
		begin: "(" + hljs.RE_STARTERS_RE + "|case|return|throw)\\s*",
		end: "^",
		noMarkup: true,
		lexems: [hljs.IDENT_RE],
		keywords: {
			"return": 1,
			"throw": 1,
			"case": 1
		},
		contains: ["comment", "regexp"],
		relevance: 0
	},
	{
		className: "regexp",
		begin: "/.*?[^\\\\/]/[gim]*",
		end: "^"
	},
	{
		className: "function",
		begin: "\\bfunction\\b",
		end: "{",
		lexems: [hljs.UNDERSCORE_IDENT_RE],
		keywords: {
			"function": 1
		},
		contains: ["title", "params"]
	},
	{
		className: "title",
		begin: "[A-Za-z$_][0-9A-Za-z$_]*",
		end: "^"
	},
	{
		className: "params",
		begin: "\\(",
		end: "\\)",
		contains: ["string", "comment"]
	}]
};;
steal.end();
hljs.XML_COMMENT = {
	className: "comment",
	begin: "<!--",
	end: "--\>"
};
hljs.XML_ATTR = {
	className: "attribute",
	begin: "\\s[a-zA-Z\\:-]+=",
	end: "^",
	contains: ["value"]
};
hljs.XML_VALUE_QUOT = {
	className: "value",
	begin: '"',
	end: '"'
};
hljs.XML_VALUE_APOS = {
	className: "value",
	begin: "'",
	end: "'"
};
hljs.LANGUAGES.xml = {
	defaultMode: {
		contains: ["pi", "comment", "cdata", "tag"]
	},
	case_insensitive: true,
	modes: [{
		className: "pi",
		begin: "<\\?",
		end: "\\?>",
		relevance: 10
	},
	hljs.XML_COMMENT,
	{
		className: "cdata",
		begin: "<\\!\\[CDATA\\[",
		end: "\\]\\]>"
	},
	{
		className: "tag",
		begin: "</?",
		end: ">",
		contains: ["title", "tag_internal"],
		relevance: 1.5
	},
	{
		className: "title",
		begin: "[A-Za-z:_][A-Za-z0-9\\._:-]+",
		end: "^",
		relevance: 0
	},
	{
		className: "tag_internal",
		begin: "^",
		endsWithParent: true,
		noMarkup: true,
		contains: ["attribute"],
		relevance: 0,
		illegal: "[\\+\\.]"
	},
	hljs.XML_ATTR, hljs.XML_VALUE_QUOT, hljs.XML_VALUE_APOS]
};
hljs.HTML_TAGS = {
	code: 1,
	kbd: 1,
	font: 1,
	noscript: 1,
	style: 1,
	img: 1,
	title: 1,
	menu: 1,
	tt: 1,
	tr: 1,
	param: 1,
	li: 1,
	tfoot: 1,
	th: 1,
	input: 1,
	td: 1,
	dl: 1,
	blockquote: 1,
	fieldset: 1,
	big: 1,
	dd: 1,
	abbr: 1,
	optgroup: 1,
	dt: 1,
	button: 1,
	isindex: 1,
	p: 1,
	small: 1,
	div: 1,
	dir: 1,
	em: 1,
	frame: 1,
	meta: 1,
	sub: 1,
	bdo: 1,
	label: 1,
	acronym: 1,
	sup: 1,
	body: 1,
	xml: 1,
	basefont: 1,
	base: 1,
	br: 1,
	address: 1,
	strong: 1,
	legend: 1,
	ol: 1,
	script: 1,
	caption: 1,
	s: 1,
	col: 1,
	h2: 1,
	h3: 1,
	h1: 1,
	h6: 1,
	h4: 1,
	h5: 1,
	table: 1,
	select: 1,
	noframes: 1,
	span: 1,
	area: 1,
	dfn: 1,
	strike: 1,
	cite: 1,
	thead: 1,
	head: 1,
	option: 1,
	form: 1,
	hr: 1,
	"var": 1,
	link: 1,
	b: 1,
	colgroup: 1,
	ul: 1,
	applet: 1,
	del: 1,
	iframe: 1,
	pre: 1,
	frameset: 1,
	ins: 1,
	tbody: 1,
	html: 1,
	samp: 1,
	map: 1,
	object: 1,
	a: 1,
	xmlns: 1,
	center: 1,
	textarea: 1,
	i: 1,
	q: 1,
	u: 1
};
hljs.HTML_DOCTYPE = {
	className: "doctype",
	begin: "<!DOCTYPE",
	end: ">",
	relevance: 10
};
hljs.HTML_ATTR = {
	className: "attribute",
	begin: "\\s[a-zA-Z\\:-]+=",
	end: "^",
	contains: ["value"]
};
hljs.HTML_SHORT_ATTR = {
	className: "attribute",
	begin: " [a-zA-Z]+",
	end: "^"
};
hljs.HTML_VALUE = {
	className: "value",
	begin: "[a-zA-Z0-9]+",
	end: "^"
};
hljs.LANGUAGES.html = {
	defaultMode: {
		contains: ["tag", "comment", "doctype", "vbscript"]
	},
	case_insensitive: true,
	modes: [hljs.XML_COMMENT, hljs.HTML_DOCTYPE,
	{
		className: "tag",
		lexems: [hljs.IDENT_RE],
		keywords: hljs.HTML_TAGS,
		begin: "<style",
		end: ">",
		contains: ["attribute"],
		illegal: "[\\+\\.]",
		starts: "css"
	},
	{
		className: "tag",
		lexems: [hljs.IDENT_RE],
		keywords: hljs.HTML_TAGS,
		begin: "<script",
		end: ">",
		contains: ["attribute"],
		illegal: "[\\+\\.]",
		starts: "javascript"
	},
	{
		className: "tag",
		lexems: [hljs.IDENT_RE],
		keywords: hljs.HTML_TAGS,
		begin: "<[A-Za-z/]",
		end: ">",
		contains: ["attribute"],
		illegal: "[\\+\\.]"
	},
	{
		className: "css",
		end: "</style>",
		returnEnd: true,
		subLanguage: "css"
	},
	{
		className: "javascript",
		end: "<\/script>",
		returnEnd: true,
		subLanguage: "javascript"
	},
	hljs.HTML_ATTR, hljs.HTML_SHORT_ATTR, hljs.XML_VALUE_QUOT, hljs.XML_VALUE_APOS, hljs.HTML_VALUE,
	{
		className: "vbscript",
		begin: "<%",
		end: "%>",
		subLanguage: "vbscript"
	}]
};;
steal.end();
Favorites = {
	toggle: function( a ) {
		var b = this.findAll(),
			c = Favorites.isFavorite(a);
		if ( c ) for ( var d = 0; d < b.length; d++ ) {
			if ( b[d].name == a.name ) {
				b.splice(d, 1);
				break
			}
		} else b.push(a);
		fav = $.toJSON(b);
		$.cookie("favorites", fav, {
			expires: 364
		});
		return !c
	},
	findAll: function() {
		var a = $.cookie("favorites");
		return a ? eval("(" + a + ")") : []
	},
	isFavorite: function( a ) {
		for ( var b = Favorites.findAll(), c = 0; c < b.length; c++ ) if ( b[c].name == a.name ) return true;
		return false
	}
};;
steal.end();
$.Class.extend("Search", {
	load: function( a ) {
		$.ajax({
			url: DOCS_LOCATION + "searchData.json",
			success: this.callback(["setData", a]),
			jsonpCallback: "C",
			dataType: "jsonp"
		})
	},
	setData: function( a ) {
		this._data = a;
		return arguments
	},
	find: function( a ) {
		var c;
		a = a.toLowerCase();
		if (!a || a === "*" ) {
			a = "home";
			c = true
		}
		if ( a == "favorites" ) return Favorites.findAll();
		for ( var b = this._data, d = 0; d < 2; d++ ) {
			if ( a.length <= d || !b ) break;
			var e = a.substring(d, d + 1);
			b = b[e]
		}
		e = [];
		if ( b && a.length > 2 ) {
			b = this.lookup(b.list);
			for ( d = 0; d < b.length; d++ ) this.matches(b[d], a, c) && e.push(b[d])
		} else if ( b ) e = this.lookup(b.list);
		return e.sort(this.sortFn)
	},
	matches: function( a, c, b ) {
		if (!b && a.name.toLowerCase().indexOf(c) > -1 ) return true;
		if ( a.tags ) for ( b = 0; b < a.tags.length; b++ ) if ( a.tags[b].toLowerCase().indexOf(c) > -1 ) return true;
		return false
	},
	sortFn: function( a, c ) {
		a = (a.title && a.name.indexOf(".") == -1 ? a.title : a.name).replace(".prototype", ".zzzaprototype").replace(".static", ".zzzbstatic").toLowerCase();
		c = (c.title && c.name.indexOf(".") == -1 ? c.title : c.name).replace(".prototype", ".zzzaprototype").replace(".static", ".zzzbstatic").toLowerCase();
		if ( a < c ) return -1;
		return 1
	},
	sortJustStrings: function( a, c ) {
		a = a.replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");
		c = c.replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");
		if ( a < c ) return -1;
		return 1
	},
	lookup: function( a ) {
		for ( var c = [], b = 0; b < a.length; b++ ) c.push(this._data.list[a[b]]);
		return c
	}
}, {});;
steal.end();
jQuery.Controller.extend("DocumentationController", {
	onDocument: true
}, {
	init: function() {
		this.selected = []
	},
	searchCurrent: function() {
		this.search($("#search").val() || "")
	},
	search: function( a ) {
		if ( a == "Search API" ) a = "";
		a = Search.find(a);
		this.selected = [];
		$("#left").html("//jmvcdoc/views/results.ejs", {
			list: a,
			selected: this.selected,
			hide: false
		}, DocumentationHelpers)
	},
	showDoc: function( a ) {
		$("#doc").html("//jmvcdoc/views/" + a.type.toLowerCase() + ".ejs", a, DocumentationHelpers).find("h1.addFavorite").append('&nbsp;<span class="favorite favorite' + (a.isFavorite ? "on" : "off") + '">&nbsp;&nbsp;&nbsp;</span>');
		$("#doc_container").scrollTop(0);
		$("#doc code").highlight();
		if ( $("#api").length ) {
			var b = [];
			for ( var c in Search._data.list ) b.push(c);
			$("#api").html(DocumentationHelpers.link("[" + b.sort(Search.sortJustStrings).join("]<br/>[") + "]", true))
		}
		$(".iframe_menu_wrapper").length && $(".iframe_menu_wrapper").remove();
		b = $(".iframe_wrapper");
		b.length && b.iframe();
		b = $(".demo_wrapper");
		b.length && b.demo();
		$("#disqus_thread").children().remove();
		if ( a.name != "index" && typeof COMMENTS_LOCATION != "undefined" && $("#disqus_thread").length ) {
			window.disqus_title = a.name;
			a = location.href.match(/\/\/(.*\.)\w*\.\w*\//);
			b = location.href;
			if ( a ) b = location.href.replace(a[1], "");
			window.disqus_url = b.replace(/\#/, "");
			window.disqus_identifier = window.disqus_url;
			steal.insertHead(COMMENTS_LOCATION)
		}
	},
	showResultsAndDoc: function( a, b ) {
		$("#left").html("//jmvcdoc/views/results.ejs", a, DocumentationHelpers);
		$("#results").slideDown("fast");
		this.showDoc(b)
	},
	show: function( a, b ) {
		this.who = {
			name: b.name,
			shortName: b.shortName,
			tag: b.name
		};
		b.isFavorite = Favorites.isFavorite(b);
		if ( b.children && b.children.length ) {
			this.selected.push(b);
			a = $.grep(Search.lookup(b.children), function( c ) {
				return c.hide !== true
			}).sort(Search.sortFn);
			$("#results").length ? $("#results").slideUp("fast", this.callback("showResultsAndDoc", {
				list: a,
				selected: this.selected,
				hide: true
			}, b)) : this.showResultsAndDoc({
				list: a,
				selected: this.selected,
				hide: true
			}, b)
		} else {
			$("#results a").length == 0 && $("#left").html("//jmvcdoc/views/results.ejs", {
				list: Search.find(""),
				selected: this.selected,
				hide: false
			}, DocumentationHelpers);
			$(".result").removeClass("picked");
			$(".result[href=#&who=" + a + "]").addClass("picked").focus();
			this.showDoc(b)
		}
	},
	"#search focus": function( a ) {
		a.val() == "Search API" && a.val("").removeClass("notFocused")
	},
	"#search blur": function( a ) {
		a.val() || a.val("Search API").addClass("notFocused")
	},
	"#search keyup": function( a, b ) {
		if ( b.keyCode == 40 ) {
			for ( a = $("#results a:first"); a && this._isInvalidMenuItem(a); ) a = a.next("a");
			a[0].focus()
		} else if ( b.keyCode == 13 ) window.location.hash = $("#results a:first").attr("href");
		else if ( this.skipSet ) this.skipSet = false;
		else {
			window.location.hash = "#";
			this.search(a.val());
			$("#results a:first").addClass("highlight")
		}
	},
	_isInvalidMenuItem: function( a ) {
		return a.hasClass("prototype") || a.hasClass("static")
	},
	_highlight: function( a ) {
		this._isInvalidMenuItem(a) || a.addClass("highlight")
	},
	"#results a focus": function( a ) {
		this._highlight(a)
	},
	"#results a blur": function( a ) {
		a.removeClass("highlight")
	},
	"#results a mouseover": function( a ) {
		this._highlight(a)
	},
	"#results a mouseout": function( a ) {
		a.removeClass("highlight")
	},
	"#results a keyup": function( a, b ) {
		if ( b.keyCode == 40 ) {
			for ( a = a.next(); a && this._isInvalidMenuItem(a); ) a = a.next("a");
			a.length && a[0].focus();
			b.preventDefault()
		} else if ( b.keyCode == 38 ) {
			for ( a = a.prev("a"); a && this._isInvalidMenuItem(a); ) a = a.prev("a");
			if ( a.length ) a[0].focus();
			else {
				this.skipSet = true;
				$("#search")[0].focus()
			}
			b.preventDefault()
		} else if ( b.keyCode == 13 ) window.location.hash = a.attr("href")
	},
	"#results a keydown": function( a, b ) {
		b.preventDefault()
	},
	".remove click": function( a, b ) {
		b.stopImmediatePropagation();
		this.selected.pop();
		if ( this.selected.length ) {
			var c = this.selected.pop().name;
			$("#results").slideUp("fast", function() {
				window.location.hash = "#&who=" + c
			})
		} else $("#results").slideUp("fast", function() {
			window.location.hash = "#"
		})
	},
	".favorite click": function( a ) {
		if ( Favorites.toggle(this.who) ) {
			a.removeClass("favoriteoff");
			a.addClass("favoriteon")
		} else {
			a.removeClass("favoriteon");
			a.addClass("favoriteoff")
		}
	},
	"history.favorites.index subscribe": function() {
		this.selected = [];
		$("#search").val("favorites");
		var a = Favorites.findAll();
		$("#left").html("//jmvcdoc/views/results.ejs", {
			list: a,
			selected: this.selected,
			hide: false
		}, DocumentationHelpers);
		a.length || $("#doc").html("//jmvcdoc/views/favorite.ejs", {})
	},
	ready: function() {
		this.loaded = true;
		hljs.start();
		this.loadText = $("#search").val();
		$("#search").val("Loading ...");
		Search.load(this.callback("setSearchReady"))
	},
	setSearchReady: function() {
		this.searchReady = true;
		$("#search").attr("disabled", false);
		$("#search").val(this.loadText).focus();
		if ( this.loadHistoryData ) {
			var a = this;
			setTimeout(function() {
				a.handleHistoryChange(a.loadHistoryData)
			}, 1)
		}
	},
	handleHistoryChange: function( a ) {
		if ( a.search ) {
			$("#search").val(a.search);
			this.searchCurrent();
			if (!a.who ) return
		}
		if (!a.who ) {
			this.searchCurrent();
			if ( this.who ) return;
			a.who = "index"
		}
		a = a.who;
		for ( var b = 0; b < this.selected.length; b++ ) if ( this.selected[b].name == a ) {
			this.selected.splice(b, this.selected.length - b);
			break
		}
		$.ajax({
			url: DOCS_LOCATION + a.replace(/ /g, "_").replace(/&#46;/g, ".") + ".json",
			success: this.callback("show", a),
			error: this.callback("whoNotFound", a),
			jsonpCallback: "C",
			dataType: "jsonp"
		})
	},
	"history.index subscribe": function( a, b ) {
		if ( this.searchReady ) this.handleHistoryChange(b);
		else this.loadHistoryData = b
	},
	whoNotFound: function( a ) {
		a = a.split(".");
		a.pop();
		if ( a.length ) {
			a = a.join(".");
			$.ajax({
				url: DOCS_LOCATION + a.replace(/ /g, "_").replace(/&#46;/g, ".") + ".json",
				success: this.callback("show", a),
				error: this.callback("whoNotFound", a),
				jsonpCallback: "C",
				dataType: "jsonp"
			})
		}
	}
});
$.fn.highlight = function() {
	this.each(function() {
		hljs.highlightBlock(this)
	});
	return this
};;
steal.end();
jQuery.Controller.extend("IframeController", {}, {
	init: function() {
		var a = this,
			c = 320,
			d = [];
		hljs.start();
		this.element.html(this.view("//jmvcdoc/views/iframe/init.ejs"));
		var e = steal.root.join(this.element.attr("data-iframe-src"));
		c = !this.element.attr("data-iframe-height") ? c : this.element.attr("data-iframe-height");
		var b = this.find("iframe");
		b.attr("src", e);
		b.attr("height", c);
		b.bind("load", function() {
			$("script", b[0].contentWindow.document).each(function( g, f ) {
				f.text.match(/steal.end()/) || d.push(f)
			});
			if (!a.iframesCache ) a.iframesCache = {};
			a.iframesCache[a.toId(b.attr("src"))] = d
		})
	},
	toId: function( a ) {
		return a.replace(/[\/\.]/g, "_")
	},
	".iframe_menu_button click": function( a ) {
		var c = this.find("iframe"),
			d = this.iframesCache[this.toId(c.attr("src"))];
		if ( d && d.length > 0 ) {
			var e = $(".iframe_menu_wrapper");
			if ( e.length ) e.slideToggle("slow");
			else {
				a.after("//jmvcdoc/views/iframe/menu.ejs", {
					scripts: d,
					iframeWindow: c[0].contentWindow
				}, DocumentationController.Helpers);
				e = $(".iframe_menu_wrapper");
				e.phui_positionable({
					my: "right top",
					at: "right bottom"
				}).trigger("move", a);
				$iframeMenuItem = $(".iframe_menu_item a");
				$iframeMenuItem.bind("click", function() {
					var b = steal.root.join($(this).attr("data-src"));
					window.open(b, b)
				})
			}
		}
	},
	windowresize: function() {
		$(".iframe_menu_wrapper").trigger("move", $(".iframe_menu_button"))
	}
});;
steal.end();
jQuery.Controller.extend("DemoController", {}, {
	init: function() {
		var a = this,
			d = 320,
			g = "",
			e = "",
			h;
		hljs.start();
		this.element.html(this.view("//jmvcdoc/views/demo/init.ejs"));
		var i = steal.root.join(this.element.attr("data-demo-src")),
			b = this.find("iframe");
		b.bind("load", function() {
			var c = $(this.contentWindow.document.body);
			a.find(".demo_content").css({
				padding: "5px"
			});
			g = this.contentWindow.DEMO_HTML || c.find("#demo-html").html();
			a.find(".html_content").html('<pre><code class="html"></code></pre>').find("code").text($.trim(g)).highlight();
			c.find("#demo-instructions").hide();
			e = c.find("#demo-source").html();
			a.find(".source_content").html('<pre><code class="javascript"></code></pre>').find("code").text($.trim(e)).highlight();
			if (!e ) {
				$("script", b[0].contentWindow.document).each(function( j, f ) {
					if (!f.text.match(/steal.end()/) ) {
						h = f.text;
						if (!f.src.match(/steal.js/) ) return false
					}
				});
				a.find(".source_content").html('<pre><code class="javascript"></code></pre>').find("code").text($.trim(h)).highlight()
			}
			setTimeout(function() {
				d = c.outerHeight();
				b.height(d + 50);
				a.find(".demo_content").height(d + 55)
			}, 200)
		});
		b.attr("src", i)
	},
	".header click": function( a ) {
		a.next().toggle("slow");
		a.find("span").toggleClass("ui-icon-triangle-1-s").toggleClass("ui-icon-triangle-1-e")
	}
});;
steal.end();
$.View.preload('jmvcdoc_views_attribute_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(view("//jmvcdoc/views/top.ejs", this))));
				___ViewO.push("\n");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(link(comment))));
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_class_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(view("//jmvcdoc/views/top.ejs", this))));
				___ViewO.push("\n");
				___ViewO.push("\n");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(link(comment))));
				___ViewO.push("\n");
				___ViewO.push("\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_constructor_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(view("//jmvcdoc/views/top.ejs", this))));
				___ViewO.push("\n");
				___ViewO.push("\n");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(link(comment))));
				___ViewO.push("\n");
				___ViewO.push("<h2>Constructor</h2>\n");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(this.init)));
				___ViewO.push("\n");
				___ViewO.push("<pre class='signiture'><code>");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(signiture())));
				___ViewO.push("</code></pre>\n");
				___ViewO.push("\n");
				___ViewO.push("  <div class='params'>\n");
				___ViewO.push("  \n");
				___ViewO.push("  ");
				for ( var name in this.params ) {
					var param = this.params[name];;
					___ViewO.push("  \n");
					___ViewO.push("      <div class='param ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(param.optional ? "optional" : "")));
					___ViewO.push("'>\n");
					___ViewO.push("          <label>");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(param.name)));
					___ViewO.push("</label>\n");
					___ViewO.push("          <code>{");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((param.optional ? 'optional:' : '') + "" + (param.type))));
					___ViewO.push("}</code> - ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((param.description))));
					___ViewO.push("\n");
					___ViewO.push("      </div>\n");
					___ViewO.push(" ");
				};
				___ViewO.push("\n");
				___ViewO.push("\n");
				___ViewO.push(" ");
				if ( this.ret.type != "undefined" ) {;
					___ViewO.push("\n");
					___ViewO.push("     <div class='return'>\n");
					___ViewO.push("         <label>returns</label> \n");
					___ViewO.push("         <code>{");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((this.ret.type))));
					___ViewO.push("}</code> - ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((this.ret.description))));
					___ViewO.push("\n");
					___ViewO.push("     </div>\n");
					___ViewO.push(" ");
				};
				___ViewO.push("   \n");
				___ViewO.push(" \n");
				___ViewO.push(" </div>");
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_favorite_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push("You can add  favorites by clicking the \n");
				___ViewO.push("Favorite button (<span class=\"favorite favoriteoff\" style=\"background-position: center center\">&nbsp;&nbsp;&nbsp;</span>) by page's title.  \n");
				___ViewO.push("<br/>After adding favorites, they will appear on the left.");
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_function_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(view("//jmvcdoc/views/top.ejs", this))));
				___ViewO.push("\n");
				___ViewO.push(" <div class='comment'>");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(link(this.comment))));
				___ViewO.push("</div>\n");
				___ViewO.push(" <pre class='signiture'><code>");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(signiture())));
				___ViewO.push("</code></pre>\n");
				___ViewO.push("  \n");
				___ViewO.push("  <div class='params'>\n");
				___ViewO.push("  \n");
				___ViewO.push("  ");
				for ( var name in this.params ) {
					var param = this.params[name];;
					___ViewO.push("  \n");
					___ViewO.push("      <div class='param ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(param.optional ? "optional" : "")));
					___ViewO.push("'>\n");
					___ViewO.push("          <label>");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(param.name)));
					___ViewO.push("</label>\n");
					___ViewO.push("          <code>{");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((param.optional ? 'optional:' : '') + "" + (param.type))));
					___ViewO.push("}</code> - ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((param.description))));
					___ViewO.push("\n");
					___ViewO.push("      </div>\n");
					___ViewO.push(" ");
				};
				___ViewO.push("\n");
				___ViewO.push("\n");
				___ViewO.push(" ");
				if ( this.ret && this.ret.type ) {;
					___ViewO.push("\n");
					___ViewO.push("     <div class='return'>\n");
					___ViewO.push("         <label>returns</label> \n");
					___ViewO.push("         <code>{");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((this.ret.type))));
					___ViewO.push("}</code> - ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text((this.ret.description))));
					___ViewO.push("\n");
					___ViewO.push("     </div>\n");
					___ViewO.push(" ");
				};
				___ViewO.push("   \n");
				___ViewO.push(" \n");
				___ViewO.push(" </div>");
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_page_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(link(comment))));
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_results_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				var previous = "",
					res, current, title;
				___ViewO.push("\n");
				___ViewO.push("\n");
				if ( selected && selected.length ) {;
					___ViewO.push("\n");
					___ViewO.push("	<div id='selected'>\n");
					___ViewO.push("		    ");
					for ( var i = 0; i < selected.length; i++ ) {;
						___ViewO.push("\n");
						___ViewO.push("				");
						current = selected[i];
						title = (current.title ? current.title : current.name);
						res = calculateDisplay(previous, title);
						name = normalizeName(current.name);
						___ViewO.push("\n");
						___ViewO.push("		<div class=\"topCorner\"><div>&nbsp;</div></div>\n");
						___ViewO.push("		<div class=\"content\">\n");
						___ViewO.push("			    <a href=\"#&who=");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(name)));
						___ViewO.push("\" class='selected choice ");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(current.type)));
						___ViewO.push("' style=\"padding-left: ");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(res.length * 20)));
						___ViewO.push("px\">\n");
						___ViewO.push("			    	<span class='remove' title=\"close\"></span>\n");
						___ViewO.push("					");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(res.name.replace("jQuery", "$"))));
						___ViewO.push("\n");
						___ViewO.push("					\n");
						___ViewO.push("				</a>\n");
						___ViewO.push("				");
						previous = title;
						___ViewO.push("\n");
						___ViewO.push("		</div>\n");
						___ViewO.push("		<div class=\"bottomCorner\"><div>&nbsp;</div></div>\n");
						___ViewO.push("			");
						if ( i < (selected.length - 1) ) {;
							___ViewO.push("\n");
							___ViewO.push("		<div class=\"spacer\"><div>&nbsp;</div></div>\n");
							___ViewO.push("			");
						};
						___ViewO.push("\n");
						___ViewO.push("			");
					};
					___ViewO.push("\n");
					___ViewO.push("	</div>\n");
				};
				___ViewO.push("\n");
				___ViewO.push("<div id='results' style=\"display: ");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(hide ? 'none' : 'block')));
				___ViewO.push("\">\n");
				___ViewO.push("	<div class=\"topCorner\"><div>&nbsp;</div></div>\n");
				___ViewO.push("	<div class=\"content\">\n");
				___ViewO.push("	    ");
				for ( var i = 0; i < list.length; i++ ) {;
					___ViewO.push("\n");
					___ViewO.push("			");
					current = list[i];
					if ( current.hide ) {
						continue;
					}
					title = (current.title ? current.title : current.name);
					res = calculateDisplay(previous, title);
					name = normalizeName(current.name);
					___ViewO.push("\n");
					___ViewO.push("		    <a href=\"");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(current.type == 'prototype' || current.type == 'static' ? 'javascript://' : '#&who=' + name)));
					___ViewO.push("\" class='result choice ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(current.type)));
					___ViewO.push("' style=\"padding-left: ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(res.length * 20)));
					___ViewO.push("px\">\n");
					___ViewO.push("		    	");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(res.name.replace("jQuery", "$"))));
					___ViewO.push("\n");
					___ViewO.push("			</a>\n");
					___ViewO.push("			");
					previous = title;
					___ViewO.push("\n");
					___ViewO.push("		");
				};
				___ViewO.push("\n");
				___ViewO.push("	</div>\n");
				___ViewO.push("	<div class=\"bottomCorner\"><div>&nbsp;</div></div>\n");
				___ViewO.push("</div>\n");
				___ViewO.push("\n");
				___ViewO.push("\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_top_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push("<div class='top'>\n");
				___ViewO.push("	<div class=\"topCorner\"><div>&nbsp;</div></div>\n");
				___ViewO.push("	<div class=\"content\">\n");
				___ViewO.push("	    <h1>");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(name.replace(/~/g, "."))));
				___ViewO.push("&nbsp;\n");
				___ViewO.push("	    	<span class='");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(type)));
				___ViewO.push(" type'><span class=\"typeEnd\">");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(type)));
				___ViewO.push("</span></span>&nbsp;\n");
				___ViewO.push("	    	<span class=\"favorite favorite");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(isFavorite ? 'on' : 'off')));
				___ViewO.push("\">&nbsp;&nbsp;&nbsp;</span></h1>\n");
				___ViewO.push("	    ");
				if ( this.inherits ) {;
					___ViewO.push("\n");
					___ViewO.push("	    <div class='inherits'>\n");
					___ViewO.push("	        inherits: ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(linkOpen(this.inherits))));
					___ViewO.push("\n");
					___ViewO.push("	    </div>\n");
					___ViewO.push("	    ");
				};
				___ViewO.push("\n");
				___ViewO.push("	    ");
				if ( this.tags ) {;
					___ViewO.push("\n");
					___ViewO.push("	    <div class='tags'>\n");
					___ViewO.push("	        tags: ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(linkTags(this.tags))));
					___ViewO.push("\n");
					___ViewO.push("	    </div>\n");
					___ViewO.push("	    ");
				};
				___ViewO.push("\n");
				___ViewO.push("	    ");
				if ( this.plugin ) {;
					___ViewO.push("\n");
					___ViewO.push("	    <div class='plugin'>\n");
					___ViewO.push("	        plugin: ");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(this.plugin)));
					___ViewO.push("\n");
					___ViewO.push("	    </div>\n");
					___ViewO.push("	    ");
				};
				___ViewO.push("\n");
				___ViewO.push("		");
				if ( this.download ) {;
					___ViewO.push("\n");
					___ViewO.push("	    <div class='download'>\n");
					___ViewO.push("	        download: <a href='");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(steal.root.join(this.download))));
					___ViewO.push("'>");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(this.download.match(/[^\/]*$/)[0])));
					___ViewO.push("</a>\n");
					___ViewO.push("	    </div>\n");
					___ViewO.push("	    ");
				};
				___ViewO.push("\n");
				___ViewO.push("		");
				if ( this.test ) {;
					___ViewO.push("\n");
					___ViewO.push("	    <div class='test'>\n");
					___ViewO.push("	        test: <a href='");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(steal.root.join(this.test))));
					___ViewO.push("'>");
					___ViewO.push((jQuery.View.EJS.Scanner.to_text(this.test.match(/[^\/]*$/)[0])));
					___ViewO.push("</a>\n");
					___ViewO.push("	    </div>\n");
					___ViewO.push("	    ");
				};
				___ViewO.push("\n");
				___ViewO.push("	</div>\n");
				___ViewO.push("	<div class=\"bottomCorner\"><div>&nbsp;</div></div>	 	\n");
				___ViewO.push("</div>\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_iframe_init_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push("<button class='iframe_menu_button ui-button ui-widget ui-state-default ui-corner-top ui-button-text-only'>Scripts</button>\n");
				___ViewO.push("<iframe frameborder=0></iframe>\n");
				___ViewO.push("\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_iframe_menu_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push("<div class=\"iframe_menu_wrapper\">\n");
				___ViewO.push("	<ul class=\"iframe_menu\">		\n");
				___ViewO.push("	    <li class=\"iframe_menu_item\">\n");
				___ViewO.push("			<a href=\"javascript://\" data-src=\"");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(iframeWindow.location)));
				___ViewO.push(".js\">\n");
				___ViewO.push("    		    ");
				___ViewO.push((jQuery.View.EJS.Scanner.to_text(shortenUrl(iframeWindow.location))));
				___ViewO.push("\n");
				___ViewO.push("		    </a>\n");
				___ViewO.push("		</li>					\n");
				___ViewO.push("	");
				for ( var s = 0; s < scripts.length; s++ ) {
					var script = scripts[s];;
					___ViewO.push("\n");
					___ViewO.push("	    <li class=\"iframe_menu_item\">\n");
					___ViewO.push("	    	");
					if ( script.src ) {;
						___ViewO.push("\n");
						___ViewO.push("    			<a href=\"javascript://\"  data-src=\"");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(script.src)));
						___ViewO.push("\">\n");
						___ViewO.push("	    		    ");
						___ViewO.push((jQuery.View.EJS.Scanner.to_text(shortenUrl(script.src))));
						___ViewO.push("\n");
						___ViewO.push("		    ");
					};
					___ViewO.push("\n");
					___ViewO.push("		    </a>\n");
					___ViewO.push("		</li>	\n");
					___ViewO.push("	");
				};
				___ViewO.push("\n");
				___ViewO.push("	</ul>\n");
				___ViewO.push("</div>\n");
				___ViewO.push("\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end();
$.View.preload('jmvcdoc_views_demo_init_ejs', jQuery.View.EJS(function( _CONTEXT, _VIEW ) {
	try {
		with( _VIEW ) {
			with( _CONTEXT ) {
				var ___ViewO = [];;
				___ViewO.push("<div class=\"demo\">\n");
				___ViewO.push("  <h3 class=\"demo_header header reset\">\n");
				___ViewO.push("    <span class=\"ui-icon ui-icon-triangle-1-s\"/>\n");
				___ViewO.push("    <a href=\"javascript://\">Demo</a>\n");
				___ViewO.push("  </h3>\n");
				___ViewO.push("  <div class=\"demo_content content\">\n");
				___ViewO.push("    <iframe height=\"100%\" frameborder=0></iframe>\n");
				___ViewO.push("  </div>\n");
				___ViewO.push("  <h3 class=\"html_header header reset\">\n");
				___ViewO.push("    <span class=\"ui-icon ui-icon-triangle-1-e\"/>\n");
				___ViewO.push("    <a href=\"javascript://\">HTML</a>\n");
				___ViewO.push("  </h3>\n");
				___ViewO.push("  <div class=\"html_content content\" style=\"display: none\">\n");
				___ViewO.push("    HTML content\n");
				___ViewO.push("  </div>\n");
				___ViewO.push("  <h3 class=\"source_header header reset\">\n");
				___ViewO.push("    <span class=\"ui-icon ui-icon-triangle-1-e\"/>\n");
				___ViewO.push("    <a href=\"javascript://\">Source</a>\n");
				___ViewO.push("  </h3>\n");
				___ViewO.push("  <div class=\"source_content content\" style=\"display: none\">\n");
				___ViewO.push("    Source content\n");
				___ViewO.push("  </div>\n");
				___ViewO.push("</div>\n");
				___ViewO.push("\n");;
				return ___ViewO.join('');
			}
		}
	} catch (e) {
		e.lineNumber = null;
		throw e;
	}
}));;
steal.end()