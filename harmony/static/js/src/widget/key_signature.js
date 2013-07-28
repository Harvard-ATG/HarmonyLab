define(['lodash', 'jquery', 'microevent', 'app/config/analysis'], function(_, $, MicroEvent, ANALYSIS_CONFIG) {

	var KEY_MAP = ANALYSIS_CONFIG.keyMap;
	var KEY_DISPLAY_GROUPS = ANALYSIS_CONFIG.keyDisplayGroups;	
	var KEY_SIGNATURE_MAP = ANALYSIS_CONFIG.keySignatureMap;

	var KeySignatureWidget = function() {
		this.el = $('<div></div>');
	};

	_.extend(KeySignatureWidget.prototype, {
		render: function() {
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
				that.trigger('changekey', $(this).val());
			});
			this.lockEl.on('change', function() {
				that.trigger('lock', $(this).val() === 'lock');
			});
			this.signatureEl.on('change', function() {
				that.trigger('changesignature', $(this).val()); 
			});
		},
		_renderSignatureLock: function() {
			this.lockEl = $('<div class="sig-lock"><input data-component="lock" type="checkbox" value="lock"/></div>');
			return this;
		},
		_renderSignatureSelector: function() {
			var select = document.createElement('select');
			select.setAttribute('component', 'signature');

			_.each(KEY_SIGNATURE_MAP, function(key, signature) {
				var option = document.createElement('option');
				option.text = signature;
				option.value = key;
				select.appendChild(option);
			});

			this.signatureEl = $(select);
			return this;
		},
		_renderKeySelector: function() {
			var select = document.createElement('select');
			select.setAttribute('component', 'key');

			_.each(KEY_DISPLAY_GROUPS, function(keyList, index) {
				var optgroup = document.createElement('optgroup');
	
				_.each(keyList, function(key, index) {
					var opt = document.createElement('option');
					opt.value = key;
					opt.text = KEY_MAP[key].name;
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
