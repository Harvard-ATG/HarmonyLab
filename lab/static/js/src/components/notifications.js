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
        this.settings = _.extend({
			defaultHidden: true,
		}, settings || {});
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
		if (this.settings.defaultHidden) {
			this.el.hide();
		}
		this.alertEl = $("#notificationAlerts");
		this.initListeners();
	};
    
	/**
	 * Initializes listeners.
	 *
	 * @return undefined
	 */
	NotificationsComponent.prototype.initListeners = function() {
		var that = this;
		this.subscribe(EVENTS.BROADCAST.NOTIFICATION, this.onNotification);
        this.el.on("click", this.onClickDetails);
		this.alertEl.on("click", function(e) {
			that.el.toggle(400);
		});
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
		if (msg.action == "clearall") {
			this.clearAll();
		}
        this.messages.push(msg);
        this.el.append(this.getMessageEl(msg, this.messages.length-1));
		this.renderAlert();
    };

	/**
	 * Handles showing the notification details.
	 *
	 * @return undefined
	 */   
    NotificationsComponent.prototype.onClickDetails = function(evt) {
        var $target = $(evt.target);
		var $notification = $target.closest('.notification');
		
        if ($target.hasClass("moredetails")) {
            $notification.find('.details').toggle(400);
        } else if ($target.hasClass("delete")) {
            $notification.remove();
			this.messages[parseInt($notification.data('id'))].deleted = true;
			this.renderAlert();
        }
    };

	/**
	 * Creates a message element.
	 *
	 * @return jQuery
	 */   
    NotificationsComponent.prototype.getMessageEl = function(msg, id) {
        var title = msg.title || "";
        var $n = $('<div class="notification" data-id='+id+'></div>');
        
        $n.addClass(msg.type || "info")
        $n.html('<span class="title"><b>'+title+'</b></span> <span class="btn delete" alt="Dismiss Notification">Dismiss</span>');
        
        if ("description" in msg) {
            $n.prepend('<span class="btn moredetails">Expand or collapse</span> ');
            $n.append('<div class="details">' + msg.description+'</div>');
        }

        return $n;
    };

	/**
	 * Updates the alert icon.
	 *
	 * @return jQuery
	 */   	
	NotificationsComponent.prototype.renderAlert = function() {
		var num_messages = $.grep(this.messages, function(m, i) {
			return !m.deleted;
		}).length;
		
		this.alertEl.html(num_messages > 0 ? '<i class="ion-alert-circled"></i>' : '');
	};
	
	/**
	 * Clears all notifications.
	 *
	 * @return jQuery
	 */   	
	NotificationsComponent.prototype.clearAll = function() {
		this.messages = [];
		this.el.html('');
	};
    
    return NotificationsComponent;   
});
