/* global define:false */
define(['lodash', 'jquery'], function(_, $) {
	"use strict";

	/**
	 * Defines the html template. 
	 * @type {function}
	 * @const
	 */
	var MODAL_TPL = _.template([
		'<div class="modal-wrapper">',
			'<a href="#" class="modal-close-btn js-modal-close-btn">x</a>',
			'<h2 class="modal-title"><%= title %></h2>',
			'<div class="modal-body"><%= msg %><div>',
		'</div>'
	].join(''));

	/**
	 * Creates an instance of a modal dialog.
	 *
	 * Only one modal dialog may be active at a time.
	 *
	 * This is *not* intended to be a feature-complete modal dialog, just a
	 * simple dialog to display a message to the user. If something more complex
	 * is needed, get a jQuery plugin or other ready-made component.
	 *
	 * @constructor
	 * @param {object} config
	 */
	var Modal = function(config) {
		_.bindAll(this, ['onClose', 'onClickOutsideModal']);
		this.init(config);	
	};

	/**
	 * Adds a modal dialog to the list.
	 *
	 * @param {Modal} modal
	 * @return undefined
	 */
	Modal.add = function(modal) {
		this.modals = this.modals || [];
		this.modals.push(modal);
	};

	/**
	 * Closes all modals.
	 *
	 * @return undefined
	 */
	Modal.closeAll = function() {
		_.invoke(this.modals, 'close');
	};

	/**
	 * Destroys all active modals.
	 *
	 * @return undefined
	 */
	Modal.destroyAll = function() {
		_.invoke(this.modals, 'destroy');
		this.modals = [];
	};

	_.extend(Modal.prototype, {
		/**
		 * Initializes the modal dialog.
		 *
		 * @param {object} config
		 * @param {string} config.title
		 * @param {string} config.msg
		 * @return undefinefd
		 */
		init: function(config) {
			this.title = config.title;
			this.msg = config.msg;
			this.el = $('<div class="modal close"></div>');
			Modal.add(this);
		},
		/**
		 * Renders the dialog.
		 *
		 * @return this
		 */
		render: function() {
			var html = MODAL_TPL({ title: this.title, msg: this.msg });
			this.el.html(html);
			return this;
		},
		/**
		 * Initializes listeners.
		 *
		 * @return this
		 */
		initListeners: function() {
			this.el.on('click', '.js-modal-close-btn', null, this.onClose);
			$("body").on('click', this.onClickOutsideModal);
			return this;
		},
		/**
		 * Removes listeners.
		 *
		 * @return this
		 */
		removeListeners: function() {
			this.el.unbind('click', '.js-modal-close-btn', null, this.onClose);
			$("body").unbind('click', this.onClickOutsideModal);
			return this;
		},
		/**
		 * Opens the dialog.
		 *
		 * @return this
		 */
		open: function() {
			this.render().appendToDOM();
			this.initListeners();
			this.el.removeClass('close').addClass('open');
			return this;
		},
		/**
		 * Handles the close event.
		 *
		 * @param evt
		 * @return undefined
		 */
		onClose: function(evt) {
			evt.preventDefault();
			this.close();
		},
		/**
		 * Closes the modal if a click is detected outside the modal
		 *
		 * @return undefined
		 */
		onClickOutsideModal: function(evt) {
			evt.preventDefault();
			if($(".modal").find(evt.target).length == 0) {
				this.close();
			}
		},
		/**
		 * Closes the dialog.
		 *
		 * @return this
		 */
		close: function() {
			this.el.removeClass('open').addClass('close');
			this.removeListeners();
			return this;
		},
		/**
		 * Destroys the dialog.
		 *
		 * @return this
		 */
		destroy: function() {
			this.removeListeners();
			this.el.remove();
			return this;
		},
		/**
		 * Appends the modal dialog to the DOM.
		 *
		 * @return this
		 */
		appendToDOM: function() {
			if(!this.appendedToDom) {
				$('body').append(this.el);
				this.appendedToDom = true;
			}
			return this;
		}
	});

	/**
	 * Shortcut method to display simple modal dialog
	 *
	 * @static
	 * @param {string} title
	 * @param {string} msg
	 * @return {Modal} The modal dialog object.
	 */
	Modal.msg  = function(title, msg) {
		var cacheKey = title + msg;
		Modal.cache = Modal.cache || {};
		if(Modal.cache[cacheKey]) {
			Modal.cache[cacheKey].open();
		} else {
			var modal = new Modal({ title: title, msg: msg });
			Modal.closeAll();
			modal.open();
			Modal.cache[cacheKey] = modal;
		}
	};

	return Modal;
});
