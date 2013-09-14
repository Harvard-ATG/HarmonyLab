/* global define: false */
define(['jquery', 'lodash'], function($, _) {
	"use strict";

	var ThemeSelectorWidget = function(selectorEl, targetEl) {
		this.selectorEl = $(selectorEl); // select the theme using this el
		this.targetEl = $(targetEl); // set theme on this el
		this.themes = []; // available themes

		this.init();
	};

	_.extend(ThemeSelectorWidget.prototype, {
		init: function() {
			if(this.selectorEl.data('themes')) {
				this.themes = this.selectorEl.data('themes').split(',');
			}
			this.initListeners();
		},
		initListeners: function() {
			_.bindAll(this, ['onSelectTheme']);
			this.selectorEl.delegate('.theme-thumbnail', 'click', this.onSelectTheme);
		},
		onSelectTheme: function(ev) {
			var prefix = 'theme-';
			var targetEl = this.targetEl;
			var $el = $(ev.target); 
			var old_theme = targetEl.data('theme');
			var new_theme = $el.data('theme'); 

			if(new_theme !== old_theme) {
				targetEl.removeClass(prefix + old_theme)
					.addClass(prefix + new_theme)
					.data('theme', new_theme);
			}
			return false;
		},
		render: function() {
			this.selectorEl.html('');
			_.each(this.themes, function(name) {
				var el = $("<div/>");
				el[0].className = ['theme-thumbnail','theme-'+name].join(' ');
				el[0].setAttribute('data-theme', name);
				this.selectorEl.append(el);
			}, this);
			return this;
		}
	});

	return ThemeSelectorWidget;
});

