define([
	'lodash',
	'app/components/component',
	'app/widgets/modal'
], function(
	_,
	Component,
	Modal
) {

	/**
	 * ModalComponent is a simple component that listens for a "modal" event
	 * on the parent component and then shows a modal dialog.
	 *
	 * @param {object} settings
	 * @param {string} settings.eventName defaults to "modal"
	 * @constructor
	 */
	var ModalComponent = function(settings) {
		this.settings = settings || {};
		this.eventName = this.settings.eventName || "modal";
	};

	ModalComponent.prototype = new Component();

	/**
	 * Initializes the component.
	 *
	 * @return undefined
	 */
	ModalComponent.prototype.initComponent = function() {
		this.parentComponent.bind(this.eventName, this.onModalEvent);	
	};

	/**
	 * Handles the modal event by showing a modal.
	 *
	 * @return undefined
	 */
	ModalComponent.prototype.onModalEvent = function(modalConfig) {
		if(!("title" in modalConfig) || !("content" in modalConfig)) {
			throw new Error("missing modalConfig.title or modalConfig.content");
		}
		Modal.msg(modalConfig.title, modalConfig.content);
	};

	return ModalComponent;
});
