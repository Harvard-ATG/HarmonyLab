/* global define:false */
define(['lodash', 'jquery'], function(_, $) {
	"use strict";

	var tpl = _.template([
		'<div>',
			'<a href="#" class="modal-close-btn js-modal-close-btn">X</a>',
			'<h2 class="modal-title"><%= title %></h2>',
			'<div class="modal-body"><%= msg %><div>',
		'</div>',
	].join(''));

	// Simple modal dialog to display a message to the user.
	// If something more complex is needed, get a plugin for jQuery
	// or another off-the-shelf component.
	var Modal = function(config) {
		this.init(config);	
	};

	_.extend(Modal.prototype, {
		init: function(config) {
			this.title = config.title;
			this.msg = config.msg;
			this.el = $('<div class="modal close"></div>');
			this.initListeners();
		},
		render: function() {
			var html = tpl({ title: this.title, msg: this.msg });
			this.el.html(html);
			return this;
		},
		initListeners: function() {
			var that = this;
			this.el.on('click', '.js-modal-close-btn', null, function(e) {
				e.stopPropagation();
				e.preventDefault();
				that.close();
			});
			return this;
		},
		open: function() {
			this.render().appendToDOM();
			this.el.removeClass('close').addClass('open');
			return this;
		},
		close: function() {
			this.el.removeClass('open').addClass('close');
			return this;
		},
		destroy: function() {
			this.el.remove();
			return this;
		},
		appendToDOM: function() {
			if(!this.appendedToDom) {
				$('body').append(this.el);
				this.appendedToDom = true;
			}
			return this;
		}
	});

	// static shortcut method to display message
	Modal.msg  = function(title, msg) {
		return new Modal({ title: title, msg: msg }).open();
	};

	return Modal;
});
