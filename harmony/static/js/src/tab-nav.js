define(['jquery'], function($) {
	var tab_buttons = {
		'#tab-nav-1 > ul > li > a': function(marginLeft) {
			return marginLeft < 0 
				? {'cls':'removeClass','dir':'+='}
				: {'cls':'addClass','dir':'-='};
		},
		'#tab-nav-2 > ul > li > a': function(marginLeft) {
			return marginLeft > 0
				? {'cls':'removeClass','dir':'-='}
				: {'cls':'addClass','dir':'+='};
		}
	};

	$(document).ready(function() {
		$.each(tab_buttons, function(selector, toggle) {
			$(selector).click(function() {
				var $parentItem = $(this).parent(),
					slideAmt = $(this).next().width(),
					change;

				change = toggle(parseInt($parentItem.css('marginLeft'), 10));

				$(this)[change.cls]('expanded');
				$parentItem.animate({marginLeft: change.dir + slideAmt}, 00);

				return false;
			});
		});
	});
});
