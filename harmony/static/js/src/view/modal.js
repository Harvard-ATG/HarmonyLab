/* global define:false */
define(['lodash', 'jquery'], function(_, $) {
	"use strict";

	var tpl = _.template([
		'<div>',
			'<a href="#" class="modal-close-btn js-modal-close-btn">X</a>',
			'<h2 class="modal-title"><%= title %></h2>',
			'<div class="modal-body"><%= msg %><div>',
		'</div>'
	].join(''));

	// Simple modal dialog to display a message to the user.
	// If something more complex is needed, get a plugin for jQuery
	// or another off-the-shelf component.
	//
	// This only permits one modal to be active at a time.
	var Modal = function(config) {
		this.init(config);	
	};

	Modal.add = function(modal) {
		this.modals.push(modal);
	};
	Modal.destroyAll = function() {
		_.each(this.modals, function(modal) {
			modal.destroy();
		});
		this.modals = [];
	};

	_.extend(Modal.prototype, {
		init: function(config) {
			this.title = config.title;
			this.msg = config.msg;
			this.el = $('<div class="modal close"></div>');
			this.initListeners();
			Modal.add(this);
		},
		render: function() {
			var html = tpl({ title: this.title, msg: this.msg });
			this.el.html(html);
			return this;
		},
		initListeners: function() {
			this.el.on('click', '.js-modal-close-btn', null, _.bind(this.onClose,this));
			return this;
		},
		open: function() {
			this.render().appendToDOM();
			this.el.removeClass('close').addClass('open');
			return this;
		},
		onClose: function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			this.close();
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

	// shortcut method to display simple modal dialog
	Modal.msg  = function(title, msg) {
		Modal.destroyAll();
		return new Modal({ title: title, msg: msg }).open();
	};

	return Modal;
});
