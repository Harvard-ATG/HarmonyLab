require(['jquery', 'lab/piano'], function($, Piano) {
	console.log("lab.js loaded", $, Piano, 'this context', this);

	$('#piano').append(Piano.content);
});
