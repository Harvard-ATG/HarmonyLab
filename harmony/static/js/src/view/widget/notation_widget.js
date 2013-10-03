/* global define:false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/config',
	'app/util/analyze'
], function(_, $, MicroEvent, Config, Analyze) {
	"use strict";

	var HIGHLIGHT_COLORS = Config.get('highlight.colors');

	var ITEMS = [{
		'label': 'Analyze', 
		'value': 'analyze'
	},{
		'label': 'Highlight', 
		'value': 'highlight',
		'items': [
			{
				'label': 'Roots', 
				'value': 'highlight.roots',
				'colors': [Analyze.toHSLString(HIGHLIGHT_COLORS.root)]
			},
			{
				'label': 'Tritones', 
				'value': 'highlight.tritones',
				'colors': [Analyze.toHSLString(HIGHLIGHT_COLORS.tritone)]
			},
			{
				'label': 'Awk. Doublings', 
				'value': 'highlight.doubles',
				'colors': [Analyze.toHSLString(HIGHLIGHT_COLORS.double)]
			},
			{
				'label': '8ves &amp; 5ths', 
				'value': 'highlight.octaves',
				'colors': [
					Analyze.toHSLString(HIGHLIGHT_COLORS.octave), 
					Analyze.toHSLString(HIGHLIGHT_COLORS.perfectfifth)
				]
			}
		]
	}];

	var AnalyzeWidget = function() {
		this.el = $('<div></div>');
		this.items = ITEMS;
	};

	_.extend(AnalyzeWidget.prototype, {
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
					that.trigger('changeCategory', val, checked);
				} else {
					valDot = val.indexOf('.');
					valCat = val.substr(0, valDot);
					valOpt = val.substr(valDot + 1);
					that.trigger('changeOption', valCat, valOpt, checked);
				}

				e.stopPropagation();
				e.preventDefault();

				return false;
			});
			return this;
		},
		render: function() {
			var content = this.listTpl({ items: this.renderItems(this.items) })
			this.el.remove();
			this.el.append(content);
			this.el.find('ul').each(function(index, el) {
				var $parents = $(el).parents('ul');
				if($parents.length > 0) {
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
				var extra = '';
				if(item.colors) {
					extra = _.map(item.colors, function(color) {
						return this.colorTpl({ color: color });
					}, this).join("");
				}
				return this.itemTpl({
					label: item.label,
					extra: extra,
					value: item.value,
					checked: item.checked || "",
					itemlist: itemlist
				});
			}, this).join('');
		}
	});

	MicroEvent.mixin(AnalyzeWidget);

	return AnalyzeWidget;
});
