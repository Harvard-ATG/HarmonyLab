// This module is responsible for the expand/collapse behavior of the
// tabs on either side of the staff notation area. 

/* global define: false */
define(['jquery'], function($) {
	"use strict";
	return {
		// Defines a mapping of tabs (via selector) to toggle functions.
		// The toggle functions encapsulate the difference between left
		// and right tabs.
		tabs: {
			// left side 
			'#tab-nav-1 > ul > li > a': function(expanded) {
				return expanded ? {'cls':'removeClass','dir':'+='} : {'cls':'addClass','dir':'-='};
			},
			// right side 
			'#tab-nav-2 > ul > li > a': function(expanded) {
				return expanded ? {'cls':'removeClass','dir':'-='} : {'cls':'addClass','dir':'+='};
			}
		},
		init: function() {
			$.each(this.tabs, this.setupTab);
			this.setupToggleAllTabs();
		},
		// for toggling all tabs at once (open or close)
		setupToggleAllTabs: function() {
			var that = this;

			$('.js-toggle-tabs').on('click', function(e) {
				var cls = ['staff-btn-open','staff-btn-close'];
				if($(this).hasClass('staff-btn-close')) {
					cls.reverse();
				}
				$(this).removeClass(cls[0]).addClass(cls[1]);
				that.toggleAllTabs();
				return false;
			});
		},
		// should cause all tabs to be opened or closed
		toggleAllTabs: function() {
			this.expanded = !!!this.expanded;
			for(var k in this.tabs) {
				if(this.tabs.hasOwnProperty(k)) {
					this.toggleTab(k, this.expanded);
				}
			}
		},
		// setup a tab to be toggled open or closed
		setupTab: function(tabSelector) {
			$(tabSelector).on('click', function(e) {
				this.toggleTab(tabSelector, null);
				return false;
			}, this);
		},
		toggleTab: function(tabSelector, expanded) {
			var $tab = $(tabSelector),
				$parentItem = $tab.parent(),
				slideAmt = $tab.next().width(),
				change;

			if(expanded === null) {
				expanded = $tab.hasClass('expanded');
			}

			change = this.tabs[tabSelector](expanded);
			if(change) {
				$parentItem.animate({marginLeft: change.dir + slideAmt}, 0, 'swing', function() {
					$tab[change.cls]('expanded');
				});
			}
		},
	};
});
