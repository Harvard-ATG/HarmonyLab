define(['lodash', 'microevent'], function(_, MicroEvent) {

	var EVENT_HUB = new MicroEvent();

	/**
	 * Component class.
	 *
	 * This is the building block object for constructing the application.
	 * It provides a standard interface for composing objects that expose 
	 * services and a standard way for them to interact and communicate. 
	 *
	 * The standard methods for adding/removing sub-components are: 
	 *
	 *	- addComponent(component)
	 *	- setComponent(name, component) and getComponent(name)
	 *	- removeComponent(name)
	 *
	 * The first method just simply adds a component to be initialized. This
	 * is useful if the component will be communicating primarily through
	 * events and a direct reference isn't needed. The second method is
	 * useful if a direct reference to the sub-component will be needed.
	 *
	 * Components should be define their sub-components in the constructor.
	 * When the "init" method is called, all sub-components will be
	 * recursively initialized. As part of the initialization process,
	 * the sub-component's "initComponent" method will be called. This
	 * is where component-specific setup should be done. So minimally, 
	 * components should implement the following:
	 *
	 *	- initComponent() 
	 *	- destroy() 
	 *
	 * Components can communicate through event interfaces. Every component
	 * is observable and can trigger events on themselves, and they also
	 * have the ability to broadcast events to all other components. So
	 * every instance will have these two pairs of methods:
	 *
	 *	- bind() and trigger(): observable events
	 *	- subscribe() and broadcast(): event hub events
	 *
	 * @constructor
	 */
	var Component = function(settings) {
		this.settings = settings || {};
		this.components = [];
		this.componentMap = {};
		this.parentComponent = null;
	};

	/**
	 * Initializes the component.
	 *
	 * Sets the parent component reference (top-level component
	 * should have a "null" parent), invokes "init" recursively
	 * on all sub-components, and then calls "initComponent."
	 */
	Component.prototype.init = function(parentComponent) {
		this.parentComponent = parentComponent;

		_.invoke(this.components, "init", this);

		this.initComponent(this);

		return this;
	};

	/**
	 * Reference to the component event hub for broadcasting events.
	 * @type {object}
	 */
	Component.EVENT_HUB = EVENT_HUB;

	/**
	 * Initializes the component. 
	 * Sub-classes should implment this method.
	 *
	 * @param {object} C the component (i.e. this)
	 * @return undefined
	 */
	Component.prototype.initComponent = function(C) {
		throw new Error("subclass responsibility");
	};

	/**
	 * Adds a sub-component.
	 *
	 * @return this
	 */
	Component.prototype.addComponent = function() {
		this.components = this.components || [];
		this.components.push.apply(this.components, arguments);
		return this;
	};

	/**
	 * Removes a component.
	 * Note: does *not* automatically destroy the component first.
	 *
	 * @param {object} c The component to remove.
	 * @return {number} 0 if no components removed, 1 if removed unnamed component, 2 if 
	 *		a named component was removed.
	 */
	Component.prototype.removeComponent = function(c) {
		var removed = 0;
		for(var i = 0, len = this.components.length; i < len; i++) {
			if(this.components[i] === c) {
				this.components.splice(i, 1);
				++removed;
			}
		}
		for(var x in this.componentMap) {
			if(this.componentMap.hasOwnProperty(x) && this.componentMap[x] === c) {
				this.componentMap[x] = null;
				delete this.componentMap[x];
				++removed;
			}
		}
		return removed;
	};

	/**
	 * Adds a named component for direct reference.
	 *
	 * @param {string} name
	 * @param {object} component
	 * @return this
	 */
	Component.prototype.setComponent = function(name, component) {
		this.componentMap = this.componentMap || {};
		this.componentMap[name] = component;
		this.addComponent(component);
		return this;
	};

	/**
	 * Returns the named component.
	 *
	 * @param {string} name
	 * @return {object} component
	 */
	Component.prototype.getComponent = function(name) {
		return this.componentMap[name];
	};

	/**
	 * Returns true if the named component is present.
	 *
	 * @param {string} name
	 * @return {boolean}
	 */
	Component.prototype.hasComponent = function(name) {
		return this.componentMap.hasOwnProperty(name);
	};

	/**
	 * Destroys the component and all sub-scomponents.
	 * 
	 * Should destroy all event listeners, elements, etc.
	 *
	 * @return this;
	 */
	Component.prototype.destroy = function() {
		_.invoke(this.components, "destroy");
		return this;
	};

	/**
	 * Broadcasts to the component event hub.
	 *
	 * @return undefined
	 */
	Component.prototype.broadcast = function() {
		this.debug("broadcast()", "args:", arguments, "this:", this);
		EVENT_HUB.trigger.apply(EVENT_HUB, arguments);
	};

	/**
	 * Subscribes to the component event hub.
	 *
	 * @return undefined
	 */
	Component.prototype.subscribe = function() {
		EVENT_HUB.bind.apply(EVENT_HUB, arguments);
	};

	/**
	 * Unsubscribes an event handler from the component event hub.
	 *
	 * @return undefined
	 */
	Component.prototype.unsubscribe = function() {
		EVENT_HUB.unbind.apply(EVENT_HUB, arguments);
	};

	/**
	 * Triggers an event on the component.
	 *
	 * @return undfined
	 */
	Component.prototype.trigger = function() {
		this.debug("trigger()", "args:", arguments, "this:", this);
		MicroEvent.prototype.trigger.apply(this, arguments);
	};

	/**
	 * Binds to an event on the component.
	 *
	 * @return undfined
	 */
	Component.prototype.bind = function() {
		MicroEvent.prototype.bind.apply(this, arguments);
	};

	/**
	 * Unbinds an event handler on the component.
	 *
	 * @return undfined
	 */
	Component.prototype.unbind = function() {
		MicroEvent.prototype.unbind.apply(this, arguments);
	};

	/**
	 * Logs to the console.
	 *
	 * @return undfined
	 */
	Component.prototype.log = function() {
		console.log.apply(console, arguments);		
	};

	/**
	 * Outputs a debug message to the component log
	 * if debugging is enabled.
	 *
	 * @return undefined
	 */
	Component.prototype.debug = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("[DEBUG]");
		if(this.DEBUG || window.APP_DEBUG) {
			this.log.apply(this, args);
		}
	};

	return Component;
});
