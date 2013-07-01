define(['jquery'], function($) {
	$(document).ready(function() {
	$('#tab-nav-1 > ul > li > a').click(function() {
		var $parentItem = $(this).parent(),
			slideAmt = $(this).next().width(),
			direction;

		if (parseInt($parentItem.css('marginLeft'), 10) < 0) {
		  direction = '+=';
		  $(this).removeClass('expanded');
		} else {
		  $(this).addClass('expanded');
		  direction = '-=';
		}
		$parentItem
		  .animate({marginLeft: direction + slideAmt}, 00);
		return false;
	  });
	 
	});

	$(document).ready(function() {
		$('#tab-nav-2 > ul > li > a').click(function() {
		var $parentItem = $(this).parent(),
			slideAmt = $(this).next().width(),
			direction;

		if (parseInt($parentItem.css('marginLeft'), 10) > 0) {
		  direction = '-=';
		  $(this).removeClass('expanded');
		} else {
		  $(this).addClass('expanded');
		  direction = '+=';
		}
		$parentItem
		  .animate({marginLeft: direction + slideAmt}, 00);
		return false;
	  });
	 
	});
});
