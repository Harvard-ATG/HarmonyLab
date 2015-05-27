define([
	'jquery',
	'lodash',
	'app/components/component',
], function(
	$,
	_,
	Component
) {
	/**
	 * Creates an instance of a main menu component.
	 *
	 * Intended to be used a sidebar / slideout menu.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {string} settings.headerEl Ex: #header
	 * @param {string} settings.menuEl Ex: #mainmenu
	 * @param {string} settings.menuSelector Ex: .js-btn-menu
	 * @return instance of component
	 */
	var MainMenuComponent = function(settings) {
		this.settings = settings || {};
		this.$headerEl = $(settings.headerEl);
		this.$menuEl = $(settings.menuEl);
		this.menuSelector = settings.menuSelector;

		_.bindAll(this, ['onClickMenu', 'onClickOutsideMenu']);
	};

	MainMenuComponent.prototype = new Component();

	/**
	 * Initializes the component.
	 *
	 * @return undefined
	 */
	MainMenuComponent.prototype.initComponent = function() {
		this.$headerEl.find(this.menuSelector).on('click', this.onClickMenu);
	};

	/**
	 * Handles clicking on the button.
	 *
	 * @return undefined
	 */
	MainMenuComponent.prototype.onClickMenu = function(evt) {
		this.toggleState = !this.toggleState;
		this.toggleMenu(this.toggleState);
		evt.preventDefault();
	};

	/**
	 * Handles closing the menu when clicking outside the menu.
	 *
	 * @return undefined
	 */
	MainMenuComponent.prototype.onClickOutsideMenu = function(evt) {
		var isOutside = $(evt.target).closest(this.$menuEl).length == 0;
		if (isOutside) {
			this.toggleState = false;
			this.toggleMenu(this.toggleState);
		}
	};

	/**
	 * Shows or hides the menu (slide out).
	 *
	 * @return undefined
	 */
	MainMenuComponent.prototype.toggleMenu = function(state) {
		var that = this;
		this.$menuEl.animate({
			width: (state?"show":"hide")
		}, {
			duration: 350,
			complete: function() {
				$(window)[state?'on':'off']('click', that.onClickOutsideMenu);
			}
		});
	};

	return MainMenuComponent;
});
