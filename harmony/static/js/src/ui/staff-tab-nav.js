// This module is responsible for the expand/collapse behavior of the
// tabs on either side of the staff notation area. 
define(['jquery'], function($) {
	return {
		// Defines a mapping of tabs (via selector) to toggle functions.
		// The toggle functions encapsulate the difference between left
		// and right tabs.
		tabs: {
			'#tab-nav-1 > ul > li > a': function(marginLeft) {
				// left side 
				return marginLeft < 0 
					? {'cls':'removeClass','dir':'+='}
					: {'cls':'addClass','dir':'-='};
			},
			'#tab-nav-2 > ul > li > a': function(marginLeft) {
				// right side 
				return marginLeft > 0
					? {'cls':'removeClass','dir':'-='}
					: {'cls':'addClass','dir':'+='};
			}
		},
		init: function() {
			$.each(this.tabs, this.setupTab);
		},
		setupTab: function(tabSelector, toggleTab) {
			$(tabSelector).click(function() {
				var $parentItem = $(this).parent(),
					slideAmt = $(this).next().width(),
					that = this,
					change;

				change = toggleTab(parseInt($parentItem.css('marginLeft'), 10));
				if(change) {
					$parentItem.animate({marginLeft: change.dir + slideAmt}, 0, 'swing', function() {
						$(that)[change.cls]('expanded');
					});
				}
				return false;
			});
		}
	};
});
