/* global define:false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/config',
	'app/util'
], function(_, $, MicroEvent, Config, util) {
	"use strict";

	var HIGHLIGHT_COLORS = Config.get('highlight.colors');

	var HIGHLIGHT_SETTINGS = Config.get('general.highlightSettings');

	var ITEMS = [{
		'label': 'Highlight', 
		'value': 'highlight',
		'items': [
			{
				'label': 'Roots', 
				'value': 'highlight.roothighlight',
				'colors': [util.toHSLString(HIGHLIGHT_COLORS.root)]
			},
			{
				'label': 'Tritones', 
				'value': 'highlight.tritonehighlight',
				'colors': [util.toHSLString(HIGHLIGHT_COLORS.tritone)]
			}
			/* Removing the following highlight options per Rowland's instructions 10/4/13
			,{
				'label': 'Awk. Doublings', 
				'value': 'highlight.doublinghighlight',
				'colors': [util.toHSLString(HIGHLIGHT_COLORS.double)]
			}
			,{
				'label': '8ves &amp; 5ths', 
				'value': 'highlight.octaveshighlight',
				'colors': [
					util.toHSLString(HIGHLIGHT_COLORS.octave), 
					util.toHSLString(HIGHLIGHT_COLORS.perfectfifth)
				]
			}
			*/
		]
	}];

	var HighlightWidget = function(settings) {
		settings = settings || {};
		this.el = $('<div></div>');
		this.items = ITEMS;
		this.state = _.merge(_.cloneDeep(HIGHLIGHT_SETTINGS), settings);
	};

	_.extend(HighlightWidget.prototype, {
		listTpl: _.template('<ul class="notation-checkboxes"><%= items %></ul>'),
		itemTpl: _.template('<li><label><input type="checkbox" class="js-notation-checkbox" name="<%= label %>" value="<%= value %>" <%= checked %> /><%= label %><%= extra %></label><%= itemlist %></li>'),
		colorTpl: _.template('<span style="margin-left: 5px; color: <%= color %>">&#9834;</span>'),
		initListeners: function() {
			var that = this;
			this.el.on('change', 'li', null, function(e) {
				var currentTarget = e.currentTarget;
				var target = e.target;
				var $children = $(currentTarget).children('ul');
				var val = $(target).val();
				var checked = $(target).is(':checked');
				var valDot, valCat, valOpt;

				if($children.length > 0) {
					$children.find('input').attr('disabled', (checked ? null : 'disabled'));
				}

				if(val.indexOf('.') === -1) {
					that.state.enabled = checked;
					that.trigger('changeCategory', val, checked);
				} else {
					valDot = val.indexOf('.');
					valCat = val.substr(0, valDot);
					valOpt = val.substr(valDot + 1);
					that.state.mode[valOpt] = checked;
					that.trigger('changeOption', valCat, valOpt, checked);
				}

				e.stopPropagation();
				e.preventDefault();

				return false;
			});
			return this;
		},
		render: function() {
			var content = this.listTpl({ items: this.renderItems(this.items) });
			var enabled = this.state.enabled;

			this.el.remove();
			this.el.append(content);
			this.el.find('ul').each(function(index, el) {
				var $parents = $(el).parents('ul');
				if(!enabled && $parents.length > 0) {
					$(el).find('input').attr('disabled', 'disabled');
				}
			});
			this.initListeners();
			return this;
		},
		renderItems: function(items) {
			return _.map(items, function(item) {
				var itemlist = item.items ? this.listTpl({ items: this.renderItems(item.items) }) : ""; 
				var label = item.label;
				var prop = item.value.replace('highlight.','');
				var extra = '';
				var checked;

				if(prop === 'highlight') {
					checked = this.state.enabled;
				} else {
					checked = this.state.mode[prop];
				}

				if(item.colors) {
					extra = _.map(item.colors, function(color) {
						return this.colorTpl({ color: color });
					}, this).join("");
				}

				return this.itemTpl({
					label: item.label,
					extra: extra,
					value: item.value,
					checked: (checked ? 'checked' : ''),
					itemlist: itemlist
				});
			}, this).join('');
		}
	});

	MicroEvent.mixin(HighlightWidget);

	return HighlightWidget;
});
