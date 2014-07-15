define(['jquery', 'lodash'], function($, _) {

	var ThemeSelectorWidget = function(targetEl) {
		this.el = $('<ul class="theme-thumbnails"></ul>');
		this.targetEl = $(targetEl); // set theme on this el
		this.themes = []; // available themes
		_.bindAll(this, ['onSelectTheme']);
	};

	_.extend(ThemeSelectorWidget.prototype, {
		init: function() {
			if(this.targetEl.data('themes')) {
				this.themes = this.targetEl.data('themes').split(',');
			}
			this.initListeners();
		},
		initListeners: function() {
			this.el.delegate('.theme-thumbnail', 'click', this.onSelectTheme);
		},
		onSelectTheme: function(ev) {
			var theme_key = "theme";
			var prefix = 'theme-';
			var $el = $(ev.target); 
			var old_theme = this.targetEl.data(theme_key);
			var new_theme = $el.data(theme_key); 

			if(new_theme !== old_theme) {
				this.targetEl.removeClass(prefix+old_theme);
				this.targetEl.addClass(prefix+new_theme);
				this.targetEl.data(theme_key, new_theme);

				// force update of data attribute in DOM as well
				this.targetEl[0].setAttribute("data-"+theme_key, new_theme); 
			}
			return false;
		},
		render: function() {
			this.el.html('');

			var els = _.map(this.themes, function(name) {
				var el = $("<li/>");
				el[0].className = ['theme-thumbnail','theme-'+name].join(' ');
				el[0].setAttribute('data-theme', name);
				return el;
			}, this);

			this.el.append(els);

			return this;
		}
	});

	return ThemeSelectorWidget;
});

