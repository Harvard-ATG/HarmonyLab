define(['lodash', 'jquery', 'microevent', 'app/config/analysis'], function(_, $, MicroEvent, ANALYSIS_CONFIG) {

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
			this.keyEl.on('change', function() {
				that.keySignature.setKey($(this).val(), that.lock);
				that.render();
			});
			this.signatureEl.on('change', function() {
				that.keySignature.setSignature($(this).val(), that.lock);
				that.render();
			});
			this.lockEl.on('change', function() {
				that.lock = ($(this).val() === 'lock');
			});
		},
		_renderSignatureLock: function() {
			this.lockEl = $('<div class="sig-lock"><input data-component="lock" type="checkbox" value="lock" '+(this.lock?'checked="checked"':'')+'/></div>');
			return this;
		},
		_renderSignatureSelector: function() {
			var select = document.createElement('select');
			var selected_signature = KEY_MAP[this.keySignature.getKey()].signature;
			select.setAttribute('component', 'signature');

			_.each(KEY_SIGNATURE_MAP, function(key, signature) {
				var option = document.createElement('option');
				option.text = option.value = signature;
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
			select.setAttribute('component', 'key');

			_.each(KEY_DISPLAY_GROUPS, function(keyList, index) {
				var optgroup = document.createElement('optgroup');
	
				_.each(keyList, function(key, index) {
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

	MicroEvent.mixin(KeySignatureWidget);

	return KeySignatureWidget;
});
