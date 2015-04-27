define([
    'lodash',
    'jquery',
    'app/components/events',
	'app/components/component'
], function(
    _,
    $,
    EVENTS,
    Component
) {
    "use strict";
    
    var NotificationsComponent = function(settings) {
        this.settings = settings || {};
        this.messages = [];
        _.bindAll(this, ['onNotification', 'onClickDetails']);
        //console.log("notifications component loaded");
    };
    
    NotificationsComponent.prototype = new Component();

	/**
	 * Initializes the component.
	 *
	 * @return undefined
	 */
	NotificationsComponent.prototype.initComponent = function() {
		this.el = $('<div class="notifications-wrapper"></div>');
		this.initListeners();
	};
    
	/**
	 * Initializes listeners.
	 *
	 * @return undefined
	 */
	NotificationsComponent.prototype.initListeners = function() {
		this.subscribe(EVENTS.BROADCAST.NOTIFICATION, this.onNotification);
        this.el.on("click", this.onClickDetails);
	};

	/**
	 * Renders to the specified DOM element or valid jQuery object/selector.
	 *
	 * @return undefined
	 */
	NotificationsComponent.prototype.renderTo = function(renderTo) {
		$(renderTo).append(this.el);
	};
    
	/**
	 * Handles a notification event.
	 *
	 * @return undefined
	 */   
    NotificationsComponent.prototype.onNotification = function(msg) {
        //console.log("notification event", msg);
        this.messages.push(msg);
        this.el.append(this.getMessageEl(msg));
    };

	/**
	 * Handles showing the notification details.
	 *
	 * @return undefined
	 */   
    NotificationsComponent.prototype.onClickDetails = function(evt) {
        var $target = $(evt.target);
        if ($target.hasClass("moredetails")) {
            $target.closest(".notification").find('.details').toggle(400);
        } else if ($target.hasClass("delete")) {
            $target.closest(".notification").remove();
        }
    };

	/**
	 * Creates a message element.
	 *
	 * @return jQuery
	 */   
    NotificationsComponent.prototype.getMessageEl = function(msg) {
        var title = msg.title || "";
        var $n = $('<div class="notification"></div>');
        
        $n.addClass(msg.type || "info")
        $n.html('<span class="title"><b>'+title+'</b></span> <span class="btn delete" alt="Dismiss Notification">Dismiss</span>');
        
        if ("description" in msg) {
            $n.prepend('<span class="btn moredetails">View</span> ');
            $n.append('<div class="details">' + msg.description+'</div>');
        }

        return $n;
    };
    
    return NotificationsComponent;   
});