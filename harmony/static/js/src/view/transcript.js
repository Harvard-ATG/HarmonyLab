/* global define: false */
define([
	'jquery',
	'lodash', 
	'app/view/transcript/plain_notation'
], function($, _, PlainNotation) {
	"use strict";

	var Transcript = function(config) {
		this.init(config);
	};

	_.extend(Transcript.prototype, {
		sheets: [],
		analyzers: [],
		layout: {
			width: 520,
			height: 355
		},
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.el = $('<div></div>');
			this.el[0].width = this.getWidth(); 
			this.el[0].height = this.getHeight(); 

			this.initMethods();
			this.initComponents();
			this.initListeners();
		},
		initConfig: function() {
			var required = ['chords', 'keySignature'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		initComponents: function() {
			var config = {
				chords: this.chords, 
				keySignature: this.keySignature
			};
			if(this.sheets.length === 0) {
				this.sheets = [this.sheetFactory('plain')];
			}
			this.initSheets(this, config);
			this.initAnalyzers(this, config);
		},
		initMethods: function() {
			this.initSheets = this._invokeOn(this.getSheets, 'init');
			this.clearSheets = this._invokeOn(this.getSheets, 'clear');
			this.renderSheets = this._invokeOn(this.getSheets, 'render');

			this.initAnalyzers = this._invokeOn(this.getAnalyzers, 'init');
			this.clearAnalyzers = this._invokeOn(this.getAnalyzers, 'clear');
			this.renderAnalyzers = this._invokeOn(this.getAnalyzers, 'render');
		},
		initListeners: function() {},
		clear: function() {
			this.clearSheets();
			this.clearAnalyzers();
		},
		render: function() { 
			this.clear();
			this.renderSheets();
			this.renderAnalyzers();
			return this;
		},
		sheetFactory: function(name) {
			var factoryMap = {'plain': PlainNotation};
			if(factoryMap[name]) {
				return new factoryMap[name]();
			}
			return false;
		},
		analyzerFactory: function(name) {
			return false;
		},
		getSheets: function() {
			return this.sheets;
		},
		getAnalyzers: function() {
			return this.analyzers;
		},
		getWidth: function() {
			return this.layout.width;
		},
		getHeight: function() {
			return this.layout.height;
		},
		_invokeOn: function(delegatesFn, method) {
			var that = this;
			return function() {
				var delegates = delegatesFn.call(that);
				for(var i = 0, len = delegates.length; i < len; i++) {
					delegates[i][method].apply(delegates[i], arguments); 
				}
			};
		}
	});

	return Transcript;
});
