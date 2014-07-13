define(['lodash', 'microevent'], function(_, MicroEvent) {

	var EVENT_BUS = new MicroEvent();

	var Component = function() {
		this.parentComponent = null;
		this.components = [];
		this.componentMap = {};
	};

	Component.prototype.init = function(parentComponent, settings) {
		if(!this.hasOwnProperty('settings')) {
			this.settings = {};
		}
		_.assign(this.settings, settings);

		this.parentComponent = parentComponent;
		_.invoke(this.components, "init", this);

		this.initComponent(this);

		return this;
	};

	Component.prototype.initComponent = function() {
		throw new Error("subclass responsibility");
	};

	Component.prototype.addComponent = function() {
		this.components.push.apply(this.components, arguments);
	};

	Component.prototype.removeComponent = function(c) {
		for(var i = 0, len = this.components.length; i < len; i++) {
			if(this.components[i] === c) {
				this.components.splice(i, 1);
			}
		}
		for(var x in this.componentMap) {
			if(this.componentMap.hasOwnProperty(x) && this.componentMap[x] === c) {
				this.componentMap[x] = null;
				delete this.componentMap[x];
			}
		}
	};

	Component.prototype.setComponent = function(name, component) {
		this.componentMap = this.componentMap || {};
		this.componentMap[name] = component;
		this.addComponent(component);
	};

	Component.prototype.getComponent = function(name) {
		return this.componentMap[name];
	};

	Component.prototype.destroy = function() {};

	Component.prototype.broadcast = function() {
		this.debug("broadcast()", "args:", arguments, "this:", this);
		EVENT_BUS.trigger.apply(EVENT_BUS, arguments);
	};
	Component.prototype.subscribe = function() {
		EVENT_BUS.bind.apply(EVENT_BUS, arguments);
	};
	Component.prototype.unsubscribe = function() {
		EVENT_BUS.unbind.apply(EVENT_BUS, arguments);
	};

	Component.prototype.trigger = function() {
		this.debug("trigger()", "args:", arguments, "this:", this);
		MicroEvent.prototype.trigger.apply(this, arguments);
	};
	Component.prototype.bind = function() {
		MicroEvent.prototype.bind.apply(this, arguments);
	};
	Component.prototype.unbind = function() {
		MicroEvent.prototype.unbind.apply(this, arguments);
	};

	Component.prototype.log = function() {
		console.log.apply(console, arguments);		
	};

	Component.prototype.debug = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("[DEBUG]");
		if(this.DEBUG || window.APP_DEBUG) {
			this.log.apply(this, args);
		}
	}

	return Component;
});