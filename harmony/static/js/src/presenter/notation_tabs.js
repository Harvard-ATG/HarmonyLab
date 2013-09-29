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
			$('.js-toggle-tabs')
				.on('mousedown', this.cancelEvent) // fixes issue with unwated text selections on click
				.on('click', this.onClickToggleTabs) // handles the expand/collapse behavior we want
			
			$('.js-screenshot').on('mousedown', this.onClickScreenshot);
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
		// Generate a screenshot/image of the staff area.
		onClickScreenshot: function(e) {
			var $canvas = $('#staff-area canvas');
			var $target = $(e.target);
			var data_url = $canvas[0].toDataURL();
			$target[0].href = data_url;
			$target[0].target = '_blank';
			return true;
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
			};
		},
		// utility function to cancel an event
		cancelEvent: function(ev) {
			return false;
		}
	};
});
