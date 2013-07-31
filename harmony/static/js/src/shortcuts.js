define(['lodash', 'jquery', 'app/eventbus', 'app/config'], function(_, $, eventBus, CONFIG) {

	var SHORTS = CONFIG.keyboardShortcuts;

	var KeyboardShortcuts = function(config) {
		this.init(config);
	};

	_.extend(KeyboardShortcuts.prototype, {
		midiNote: 48,
		enabled: false,
		init: function(config) {
			if(config.hasOwnProperty('enabled')) {
				this.enabled = config.enabled;
			}

			this.mapKeyName = _.memoize(this.mapKeyName);
			this.onKeyDown = this.filterKey(this.onKeyDown);
			this.onKeyUp = this.filterKey(this.onKeyUp);

			_.bindAll(this, ['onKeyDown', 'onKeyUp', 'onKeyChange']);
			this.events = {
				'keydown': this.onKeyDown,
				'keyup': this.onKeyUp
			};

			this.initListeners();
		},
		initListeners: function() {
			$('body').on(this.events);
		},
		removeListeners: function() {
			$('body').off(this.events);
		},
		enable: function() {
			this.enabled = true;
		},
		disable: function() {
			this.enabled = false;
		},
		toggleMode: function() {
			this.enabled = !this.enabled;
		},
		noteOn: function(noteOffset) {
			eventBus.trigger('note', 'on', this.calculateNote(noteOffset));
		},
		noteOff: function(noteOffset) {
			eventBus.trigger('note', 'off', this.calculateNote(noteOffset));
		},
		calculateNote: function(noteOffset) {
			return this.midiNote + noteOffset;
		},
		onKeyDown: function(e) {
			this.onKeyChange('down', e.keyCode, e);
		},
		onKeyUp: function(e) {
			this.onKeyChange('up', e.keyCode, e);
		},
		onKeyChange: function(state, keyCode, e) {
			var mapped = this.mapKeyName(keyCode);
			switch(mapped.type) {
				case 'note':
					this[state==='down'?'noteOn':'noteOff'](mapped.value);
					e.preventDefault();
					break;
				case 'control':
					if(state === 'down') {
						this[mapped.value]();
					}
					e.preventDefault();
					break;
			}
		},
		filterKey: function(callback) {
			return function(e) {
				var keyCode = e.keyCode;
				if(!this.existsKeyCode(keyCode)) {
					return;
				} else if(!this.modeEnabled(keyCode)) {
					return;
				} else if(!this.mappedKeyName(keyCode)) {
					return;
				}
				return callback.apply(this, arguments);
			};
		},
		existsKeyCode: function(keyCode) {
			if(SHORTS.keyCode.hasOwnProperty(keyCode)) {
				return true;
			}
			return false;
		},
		modeEnabled: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			if(mapped && mapped.value === 'toggleMode') {
				return true;
			}
			return this.enabled;
		},
		mappedKeyName: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			return mapped ? true : false;
		},
		mapKeyName: function(keyCode) {
			var key_name = SHORTS.keyCode[keyCode];
			var types = ['note', 'control'], len = types.length;
			var i, type;
			for(i = 0; i < len; i++) {
				type = types[i];
				if(SHORTS[type].hasOwnProperty(key_name)) {
					return {type: type, name: key_name, value: SHORTS[type][key_name]};
				}
			}
			return false;
		},
	});

	return KeyboardShortcuts;
});
