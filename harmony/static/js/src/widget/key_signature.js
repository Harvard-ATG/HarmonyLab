define(['lodash', 'jquery', 'app/config'], function(_, $, CONFIG) {

	var KEY_MAP = CONFIG.keyMap;
	var KEY_DISPLAY_GROUPS = CONFIG.keyDisplayGroups;	
	var KEY_SIGNATURE_MAP = CONFIG.keySignatureMap;

	var KeySignatureWidget = function(keySignature) {
		this.lock = true;
		this.keySignature = keySignature;
		this.el = $('<div></div>');
		this.initListeners();
	};

	_.extend(KeySignatureWidget.prototype, {
		// render the control elements
		render: function() {
			this._renderKeySelector();
			this._renderSignatureLock();
			this._renderSignatureSelector();
			this.el.empty();
			this.el.append(this.keyEl, this.lockEl, this.signatureEl);
			return this;
		},
		// initialize event listeners
		initListeners: function() {
			var that = this;

			// delegate change events on the root element
			this.el.on('change', function(e) {
				var target = e.target;
				if(target === that.keyEl[0]) {
					that.keySignature.changeKey($(target).val(), that.lock);
					that.render();
				} else if(target === that.signatureEl[0]) {
					that.keySignature.changeSignatureKey($(target).val(), that.lock);
					that.render();
				} else if(target === that.lockEl.find('input')[0]) {
					that.lock = that.lockEl.find('input').is(':checked'); 
				}
			});
		},
		// renders the lock checkbox that is used to bind the key and signature
		// together (change one and the other should change accordingly).
		_renderSignatureLock: function() {
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.value = 'locked';
			input.checked = this.lock ? true : false;

			this.lockEl = $('<div class="sig-lock"></div>').append(input);
	
			return this;
		},
		// renders a selectable list of signatures
		_renderSignatureSelector: function() {
			var select = document.createElement('select');
			var selected_signature = this.keySignature.getSignatureSpec();

			_.each(KEY_SIGNATURE_MAP, function(key, signature) {
				var option = document.createElement('option');
				option.text = signature;
				option.value = key;
				if(signature === selected_signature) {
					option.selected = true;
				}
				select.appendChild(option);
			});

			this.signatureEl = $(select);
			return this;
		},
		// renders a selectable list of keys
		_renderKeySelector: function() {
			var select = document.createElement('select');
			var selected_key = this.keySignature.getKey();

			_.each(KEY_DISPLAY_GROUPS, function(keyList, index) {
				var optgroup = document.createElement('optgroup');
				optgroup.label = keyList[0]
	
				_.each(keyList.slice(1), function(key, index) {
					var opt = document.createElement('option');
					opt.value = key;
					opt.text = KEY_MAP[key].name;
					if(key === selected_key) {
						opt.selected = true;
					}
					optgroup.appendChild(opt);
				});

				select.appendChild(optgroup);
			});

			this.keyEl = $(select);
			return this;
		}
	});

	return KeySignatureWidget;
});
