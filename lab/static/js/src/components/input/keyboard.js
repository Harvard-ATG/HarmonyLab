define([
	'lodash', 
	'jquery', 
	'app/components/component'
], function(
	_, 
	$, 
	Component
) {

	/**
	 * The KeyboardInputComponent is responsible for handling low-level
	 * keyboard input and turning that into msgs understood by the
	 * application.
	 */
	var KeyboardInputComponent = function(settings) {
		var errors;
		this.settings = settings || {};

		if(this.settings.hasOwnProperty('keyCode')) {
			this.keyCode = this.settings.keyCode;
		} else {
			throw new Error("missing 'keyCode' setting");
		}

		if(this.settings.hasOwnProperty('keyMap')) {
			this.keyMap = this.settings.keyMap;
			errors = this.validate(this.keyMap, this.keyCode);
			if(errors) {
				throw new Error("keyMap validation error: " + errors.join('; '));
			}
		} else {
			throw new Error("missing 'keyMap' setting");
		}

		// memoize to improve performance, assumes mappings are fixed at runtime
		this.cmdsFor = _.memoize(this.cmdsFor);
	};

	KeyboardInputComponent.prototype = new Component();

	_.assign(KeyboardInputComponent.prototype, {
		initComponent: function() {
			_.bindAll(this, ['onKeyDown', 'onKeyUp', 'onKeyChange']);

			this.keyState = {};
			this.events = {
				'keydown': this.overrideKey(this.onKeyDown),
				'keyup': this.overrideKey(this.onKeyUp)
			};

			this.initListeners();
		},
		initListeners: function() {
			$('body').on(this.events);
		},
		removeListeners: function() {
			$('body').off(this.events);
		},
		destroy: function() {
			this.removeListeners();
		},
		validate: function(keyMap, keyCode) {
			var keyName, code, errors = [];
			var codeFor = _.invert(keyCode); // invert so {code => name} becomes {name => code}
			
			for(keyName in keyMap) {
				if(keyMap.hasOwnProperty(keyName)) {
					keyObj = keyMap[keyName];
					if(!codeFor.hasOwnProperty(keyName)) {
						errors.push("keyMap key ["+keyName+"] is invalid, does not have a key code");
					} else if(!(keyObj.hasOwnProperty('msg') && typeof keyObj.msg === 'string' && keyObj.msg.length > 0)) {
						errors.push("keyMap key ["+keyName+"] is missing 'msg' property");
					}
				}
			}
			if(errors.length > 0) {
				return errors;
			}
			return false;
		},
		/**
		 * Overrides up/down key events if they are supported and passes control
		 * to the provided callback, otherwise lets the event propagate as
		 * normal and execute the default action.
		 *
		 * @param {function} callback
		 * @return {boolean}
		 */
		overrideKey: function(callback) {
			var that = this;
			return function(e) {
				var which = e.which;
				var target = e.target;

				if(that.isModifierKey(e)) {
					return true; // skip alt/ctrl/meta key combos
				} else if(that.isInputElement(target)) {
					return true; // skip if the target of the key event is an input 
				} else if(!that.existsKeyCode(which)) {
					return true; // skip if not supported
				} else if(that.cmdsFor(which) === false) {
					return true; // skip if no command found
				} else {
					// stop the default behavior
					e.preventDefault();
					e.stopPropagation();
				}

				return callback.apply(that, arguments);
			};
		},
		/**
		 * Returns true if the passed dom node is an input element, false
		 * otherwise.
		 *
		 * @param {object} node
		 * @return {boolean}
		 */
		isInputElement: function(node) {
			return node.nodeName === 'INPUT';
		},
		/**
		 * Returns true if the event indicates that the key is an alt, ctrl, or
		 * meta key (i.e. "modifier" key), otherwise false.
		 *
		 * @param {object} keyEvent
		 * @return {boolean}
		 */
		isModifierKey: function(keyEvent) {
			return (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey) ? true : false;
		},
		/**
		 * Returns true if the key code exists in the shortcuts table,
		 * false otherwise
		 *
		 * @param {number} keyCode
		 * @return {boolean}
		 */
		existsKeyCode: function(keyCode) {
			if(this.keyCode.hasOwnProperty(keyCode)) {
				return true;
			}
			return false;
		},
		onKeyDown: function(e) {
			// skip repeated keydowns (chrome repeats keydown msgs)
			if(this.keyState[e.which]) {
				return false;
			}
			this.keyState[e.which] = true;
			this.onKeyChange(true, e.which, e);
		},
		onKeyUp: function(e) {
			this.keyState[e.which] = false;
			this.onKeyChange(false, e.which, e);
		},
		onKeyChange: function(state, which, e) {
			var cmds = this.cmdsFor(which);
			var args, i, len;

			if(cmds !== false) {
				for(i = 0, len = cmds.length; i < len; i++ ) {
					args = [cmds[i].msg, state];
					if(cmds[i].hasOwnProperty("data")) {
						args.push(cmds[i].data);
					}
					this.trigger.apply(this, args); // trigger => msg, state [,data]
				}
			}
		},
		cmdsFor: function(which) {
			var key_name = this.keyCode[which];
			var cmds = [];
			var key, i, len, cmd;

			if(this.keyMap.hasOwnProperty(key_name)) {
				value = this.keyMap[key_name];
				if(!_.isArray(value)) {
					value = [value]; // normalize to array
				}
				for(i = 0, len = value.length; i < len; i++) {
					cmd = {
						which: which,
						name: key_name, 
						msg: value[i].msg,
					};
					if(value[i].hasOwnProperty('data')) {
						cmd['data'] = value[i]['data'];
					}
					cmds.push(cmd);
				}
				return cmds;
			}
			return false;
		}
	});

	return KeyboardInputComponent;
});
