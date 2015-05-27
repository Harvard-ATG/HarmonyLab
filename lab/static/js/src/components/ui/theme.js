define([
	'lodash',
	'app/components/component',
	'app/widgets/theme_selector'
], function(
	_,
	Component,
	ThemeSelectorWidget
) {

	/**
	 * ThemeComponent adds the ability to apply a theme to a target element
	 * and render a selection interface to change the theme. 
	 *
	 * @param {object} settings
	 * @param {string} settings.targetEl The container to apply the theme.
	 * @constructor
	 */
	var ThemeComponent = function(settings) {
		this.settings = settings || {};

		if(!("targetEl" in this.settings)) {
			throw new Error("missing settings.targetEl");
		}

		this.themeSelector = new ThemeSelectorWidget(settings.targetEl);
	};

	ThemeComponent.prototype = new Component();

	/**
	 * Initializes the component.
	 *
	 * @return undefined
	 */
	ThemeComponent.prototype.initComponent = function() {
		this.themeSelector.init();
	};

	/**
	 * Renders the component.
	 *
	 * @return this
	 */
	ThemeComponent.prototype.render = function() {
		this.themeSelector.render();
		return this;
	};

	/**
	 * Renders the component elemtnt to a specific element.
	 *
	 * @return this
	 */
	ThemeComponent.prototype.renderTo = function(selector) {
		this.render();
		$(selector).append(this.themeSelector.el);
		return this;
	};

	return ThemeComponent;
});
