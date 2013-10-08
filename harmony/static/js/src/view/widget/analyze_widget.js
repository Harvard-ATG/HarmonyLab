/* global define:false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/config',
	'app/util/analyze'
], function(_, $, MicroEvent, Config, Analyze) {
	"use strict";

	var ITEMS = [{
		'label': 'Analyze', 
		'value': 'analyze',
		'items': [
			[{
				'label': 'Note names',
				'value': 'analyze.note_names',
				'checked': 'checked'
			},{
				'label': 'Helmholtz',
				'value': 'analyze.helmholtz'
			}],
			[{
				'label': 'Scale degrees',
				'value': 'analyze.scale_degrees',
				'checked': 'checked'
			},{
				'label': 'Solfege',
				'value': 'analyze.solfege'
			}]
		]
	}];

	var AnalyzeWidget = function() {
		this.el = $('<div></div>');
		this.items = ITEMS;
	};

	_.extend(AnalyzeWidget.prototype, {
		listTpl: _.template('<ul class="notation-checkboxes"><%= items %></ul>'),
		itemTpl: _.template('<li><label><input type="checkbox" class="js-notation-checkbox" name="<%= label %>" value="<%= value %>" <%= checked %> /><%= label %></label><%= itemlist %></li>'),
		colorTpl: _.template('<span style="margin-left: 5px; color: <%= color %>">&#9834;</span>'),
		initListeners: function() {
			var that = this;
			this.el.on('change', 'li', null, function(e) {
				var currentTarget = e.currentTarget;
				var target = e.target;
				var $children = $(currentTarget).children('ul');
				var val = $(target).val();
				var checked = $(target).is(':checked');
				var parsed_val;

				if($children.length > 0) {
					$children.find('input').attr('disabled', (checked ? null : 'disabled'));
				}

				if(val.indexOf('.') === -1) {
					that.trigger('changeCategory', val, checked);
				} else {
					parsed_val = that.parseValue(val);
					that.trigger('changeOption', parsed_val.category, parsed_val.option, checked);
					that.uncheckRelated(target);
				}

				e.stopPropagation();
				e.preventDefault();

				return false;
			});
			return this;
		},
		parseValue: function(val) {
			var valDot = val.indexOf('.');
			var valCat = val.substr(0, valDot);
			var valOpt = val.substr(valDot + 1);
			return {category: valCat, option: valOpt};
		},
		uncheckRelated: function(target) {
			var $target = $(target);
			var value = $(target).val();
			var items = ITEMS[0].items;
			var group = [];
			var i, j, len, len2;

			for(i = 0, len = items.length; i < len; i++) {
				for(j = 0, len2 = items[i].length; j < len; j++) {
					if(items[i][j].value === value) {
						group = items[i];
						break;
					}
				}
			}

			_.each(group, function(related) {
				var selector, parsed_val, checked = false;
				if(related.value !== value) {
					selector = 'input[value="'+related.value+'"]';
					parsed_val = this.parseValue(related.value);
					$(selector, this.el).attr('checked', checked);
					this.trigger('changeOption', parsed_val.category, parsed_val.option, checked);
				}
			}, this);
		},
		render: function() {
			var content = this.listTpl({ items: this.renderItems(this.items) });
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
			return _.map(_.flatten(items), function(item) {
				var itemlist = item.items ? this.listTpl({ items: this.renderItems(item.items) }) : ""; 
				return this.itemTpl({
					label: item.label,
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
