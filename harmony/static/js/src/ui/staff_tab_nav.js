// This module is responsible for the expand/collapse behavior of the
// tabs on either side of the staff notation area. 
define(['jquery'], function($) {
	return {
		// initialize tabs
		init: function() {
			var tabs = [], 
				that = this;

			// initialize each tab
			$('.js-tab').each(function(index, el) {
				var tab = {
					'el': $(this),
					'animEl': $(this).parent(),
					'width': $(this).next().width(),
					'expanded': false
				};

				if($(this).hasClass('js-tab-left')) {
					tab.expand = that.makeExpander(tab, '-=', true);
					tab.collapse = that.makeExpander(tab, '+=', false);
				} else {
					tab.expand = that.makeExpander(tab, '+=', true);
					tab.collapse = that.makeExpander(tab, '-=', false);
				}

				$(this).on('click', function(e) {
					tab[tab.expanded?'collapse':'expand']();
					e.preventDefault();
					e.stopPropagation();
				});

				tabs.push(tab);
			});
	
			// initialize button to expand/collapse all tabs
			$('.js-toggle-tabs').on('click', function(e) {
				var cls = ['staff-btn-open','staff-btn-close'];
				if($(this).hasClass('staff-btn-close')) {
					cls.reverse();
				}

				$(this).removeClass(cls[0]).addClass(cls[1]);

				$.each(tabs, function(index, tab) {
					tab[that.tabsExpanded?'collapse':'expand']();
				});

				that.tabsExpanded = !that.tabsExpanded;

				e.preventDefault();
				e.stopPropagation();
			});
		},
		// function to expand or collapse a tab
		makeExpander: function(tab, dir, expand) {
			return function() {
				if(tab.expanded !== expand) {
					tab.animEl.animate({marginLeft: dir + tab.width}, 0, 'swing', function() {
						tab.el[expand?'addClass':'removeClass']('expanded');
						tab.expanded = expand;
					});
				}
				return false;
			}
		}
	};
});
