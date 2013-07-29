define(['lodash', 'jquery', 'app/config/analysis'], function(_, $, ANALYSIS_CONFIG) {

	var KEY_MAP = ANALYSIS_CONFIG.keyMap;
	var KEY_DISPLAY_GROUPS = ANALYSIS_CONFIG.keyDisplayGroups;	
	var KEY_SIGNATURE_MAP = ANALYSIS_CONFIG.keySignatureMap;

	var KeySignatureWidget = function(keySignature) {
		this.el = $('<div></div>');
		this.lock = true;
		this.keySignature = keySignature;
	};

	_.extend(KeySignatureWidget.prototype, {
		render: function() {
			this.el.empty();
			this._renderKeySelector();
			this._renderSignatureLock();
			this._renderSignatureSelector();
			this.el.append(this.keyEl, this.lockEl, this.signatureEl);
			this.initListeners();
			return this;
		},
		initListeners: function() {
			var that = this;

			// delegate events on the root element
			this.el.on('change', function(e) {
				var target = e.target;
				if(target === that.keyEl[0]) {
					that.keySignature.changeKey($(target).val(), that.lock);
					that.render();
				} else if(target === that.signatureEl[0]) {
					that.keySignature.changeSignature($(target).val(), that.lock);
					that.render();
				} else if(target === that.lockEl.find('input')[0]) {
					that.lock = that.lockEl.find('input').is(':checked'); 
				}
			});
		},
		_renderSignatureLock: function() {
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.value = 'locked';
			input.checked = this.lock ? true : false;

			this.lockEl = $('<div class="sig-lock"></div>').append(input);
	
			return this;
		},
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
