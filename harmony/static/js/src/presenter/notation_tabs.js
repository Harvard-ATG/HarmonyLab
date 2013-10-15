/**
 * @fileoverview This file is responsible for the expand/collapse behavior of
 * tabs on the staff notation area and the related toolbar buttons.
 */
/* global define: false */
define([
	'jquery', 
	'lodash', 
	'app/config',
	'app/view/modal'
], function(
	$, 
	_, 
	Config, 
	Modal
) {
	"use strict";

	/**
	 * Defines the title of the app info modal.
	 * @type {string}
	 * @const
	 */
	var APP_INFO_TITLE = Config.get('helpText.appInfo.title');
	/**
	 * Defines the content of the app info modal.
	 * @type {string}
	 * @const
	 */
	var APP_INFO_CONTENT = Config.get('helpText.appInfo.content');

	/**
	 * Defines a namespace for setting up tab behavior around the notation
	 * canvas.
	 *
	 * @namespace
	 */
	var notation_tabs = {
		/**
		 * Holds the tab elements.
		 * @type {array}
		 */
		tabs: [],
		/**
		 * Flag to indicate if tabs are all expanded or not.
		 * @type {boolean}
		 */
		tabsExpanded: false,
		/**
		 * Initializes the tab expand/collapse behavior and other buttons.
		 *
		 * @return undefined
		 */
		init: function() {
			_.bindAll(this, ['initTab', 'onClickToggleTabs']);

			$('.js-tab').each(this.initTab);
			$('.js-toggle-tabs')
				.on('mousedown', this.cancelEvent) // fixes issue with unwated text selections on click
				.on('click', this.onClickToggleTabs); // handles the expand/collapse behavior we want
			
			$('.js-btn-screenshot').on('mousedown', this.onClickScreenshot);
			$('.js-btn-info').on('click', this.onClickInfo);
		},
		/**
		 * Initializes each tab so it can expand/collapse.
		 *
		 * @param {number} index
		 * @param {object} el
		 * @return undefined
		 */
		initTab: function(index, el) {
			var $el = $(el);
			var tab = {
				'el': $el,
				'animEl': $el.parent(),
				'width': $el.next().width(),
				'expanded': false
			};

			if($el.hasClass('js-tab-left')) {
				tab.expand = this.makeExpander(tab, '-=', true);
				tab.collapse = this.makeExpander(tab, '+=', false);
			} else {
				tab.expand = this.makeExpander(tab, '+=', true);
				tab.collapse = this.makeExpander(tab, '-=', false);
			}

			$el.on('click', function(ev) {
				tab[tab.expanded?'collapse':'expand']();
				return false;
			});

			this.tabs.push(tab);
		},
		/**
		 * Expands or collapses *all* tabs.
		 *
		 * @param {object} evt
		 * @return {boolean} false
		 */
		onClickToggleTabs: function(evt) {
			var el = evt.target;
			var cls = ['icon-btn-open','icon-btn-close'];
			var tabsExpanded = this.tabsExpanded;

			if($(el).hasClass('icon-btn-close')) {
				cls.revterse();
			}

			$(el).removeClass(cls[0]).addClass(cls[1]);

			$.each(this.tabs, function(index, tab) {
				tab[tabsExpanded?'collapse':'expand']();
			});

			this.tabsExpanded = !tabsExpanded;

			return false;
		},
		/**
		 * Handler to generate a screenshot/image of the staff area.
		 *
		 * @param {object} evt
		 * @return {boolean} true
		 */
		onClickScreenshot: function(evt) {
			var $canvas = $('#staff-area canvas');
			var $target = $(evt.target);
			var data_url = $canvas[0].toDataURL();
			$target[0].href = data_url;
			$target[0].target = '_blank';
			return true;
		},
		/**
		 * Handler to shows the info modal.
		 *
		 * @param {object} evt
		 * @return {boolean} false
		 */
		onClickInfo: function(evt) {
			if(!this.modal) {
				this.modal = Modal.msg(APP_INFO_TITLE, APP_INFO_CONTENT);
			}
			this.modal.open();
			return false;
		},
		/**
		 * Utility function that returns a function to expand or collapse a tab.
		 *
		 * @param {object} tab
		 * @param {string} dir '+=' or '-='
		 * @param {boolean} expand 
		 * @return {function}
		 */
		makeExpander: function(tab, dir, expand) {
			var animOpts = {marginLeft: dir + tab.width};
			return function() {
				if(tab.expanded !== expand) {
					tab.animEl.animate(animOpts, 0, 'swing', function() {
						tab.el[expand?'addClass':'removeClass']('expanded');
						tab.expanded = expand;
					});
				}
				return false;
			};
		},
		/**
		 * Utility function to cancel an event.
		 *
		 * @param evt
		 * @return {boolean} false
		 */
		cancelEvent: function(evt) {
			return false;
		}
	};

	return notation_tabs;
});
