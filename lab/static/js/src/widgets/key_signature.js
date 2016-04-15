/* global define:false */
define(['lodash', 'jquery', 'app/config'], function(_, $, Config) {
	"use strict";

	var KEY_MAP = Config.get('general.keyMap');
	var KEY_DISPLAY_GROUPS = Config.get('general.keyDisplayGroups');
	var KEY_SIGNATURE_MAP = Config.get('general.keySignatureMap');

	var KeySignatureWidget = function(keySignature, settings) {
		this.settings = settings || {};
		this.settings = _.merge({
			widgetCls: "widget-keysignature widget-keysignature-header",
			lockedCls: "ioncustom-siglocked",
			unlockedCls: "ioncustom-sigunlocked"
		}, settings);
		this.lock = keySignature.locked();
		this.keySignature = keySignature;
		this.el = $('<div class="'+this.settings.widgetCls+'"></div>');
		this.initListeners();
	};

	_.extend(KeySignatureWidget.prototype, {
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
				} 
			});
			this.el.on('click', function(e) {
				var target = e.target;
				if(target == that.lockEl[0]) {
					that._updateSignatureLock();
					that.keySignature.changeSignatureLock(that.lock);
				}
			});

			// observe changes to key signature and refresh when needed
			this.keySignature.bind('change', function() {
				that.lock = this.locked();
				that.render();
			});
		},
		// render the control elements
		render: function() {
			this._renderKeySelector();
			this._renderSignatureLock();
			this._renderSignatureSelector();
			this.el.empty();
			this.el.append(this.keyEl, this.lockContainerEl, this.signatureEl);
			return this;
		},
		// renders the lock checkbox that is used to bind the key and signature
		// together (change one and the other should change accordingly).
		_renderSignatureLock: function() {
			var lock = (this.lock ? true : false);
			var lockCls = ['btn ion-locked '+this.settings.lockedCls,'btn ion-unlocked '+this.settings.unlockedCls];
			var lockContainerEl = $("<span/>"); 
			var lockEl = $('<span class="'+(lock?lockCls[0]:lockCls[1])+'" data-lock="'+(lock?'yes':'no')+'"/>');
			var style='style="margin: 0 10px"';

			lockContainerEl.append(lockEl);

			this.lockCls = lockCls; 
			this.lockEl = lockEl;
			this.lockContainerEl = lockContainerEl;
	
			return this;
		},
		// updates the signature lock based on the value of the 
		_updateSignatureLock: function() {
			var lockCls = this.lockCls.slice(0);

			this.lock = (this.lockEl.data('lock') == "yes" ? false : true);
			if(this.lock) {
				lockCls.reverse();
			}
			this.lockEl.removeClass(lockCls[0]).addClass(lockCls[1]);
			this.lockEl.data('lock', (this.lock?'yes':'no'));
		},
		// renders a selectable list of signatures
		_renderSignatureSelector: function() {
			var select = document.createElement('select');
			select.name = "keysignature";
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
			select.name = "key";
			var selected_key = this.keySignature.getKey();

			_.each(KEY_DISPLAY_GROUPS, function(keyList, index) {
				var optgroup = document.createElement('optgroup');
				optgroup.label = keyList[0];
	
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
