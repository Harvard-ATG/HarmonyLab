// This module is responsible for the expand/collapse behavior of the
// tabs on either side of the staff notation area. 

/* global define: false */
define(['jquery', 'lodash'], function($, _) {
	"use strict";

	return {
		tabs: [],
		tabsExpanded: false,
		init: function() {
			_.bindAll(this, ['initTab', 'onClickToggleTabs']);

			$('.js-tab').each(this.initTab);
			$('.js-toggle-tabs').on('click', this.onClickToggleTabs);
		},
		// initializes each tab so it can expand/collapse
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
		// expands or collapses *all* tabs
		onClickToggleTabs: function(ev) {
			var el = ev.target;
			var cls = ['staff-btn-open','staff-btn-close'];
			var tabsExpanded = this.tabsExpanded;

			if($(el).hasClass('staff-btn-close')) {
				cls.reverse();
			}

			$(el).removeClass(cls[0]).addClass(cls[1]);

			$.each(this.tabs, function(index, tab) {
				tab[tabsExpanded?'collapse':'expand']();
			});

			this.tabsExpanded = !tabsExpanded;

			return false;
		},
		// function to expand or collapse a tab
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
			}
		}
	};
});
