define(function() {

	// Renderer for white keys.
	var WhiteKeyRenderer = function(config) {
		this.key = config.key; 
		this.width = (config.keyboardWidth / config.numWhiteKeys);
		this.height = config.keyboardHeight;
	};
	_.extend(WhiteKeyRenderer.prototype, {
		isWhite: true,
		offsetX: function(whiteKeyIndex) {
			return (whiteKeyIndex * this.width);
		},
		render: function(paper, whiteKeyIndex) {
			var el = paper.rect(this.offsetX(whiteKeyIndex), 0, this.width, this.height);
			el.attr({'stroke': '#000', 'fill': '#fff'});
			el.toBack();
			el.mouseup(function() {
				this.attr('fill', '#fff');
			});
			this.el = el;
			return this;
		}
	});

	// Renderer for black keys.
	var BlackKeyRenderer = function(config) {
		this.key = config.key;
		this.offsetWidth = (config.keyboardWidth / config.numWhiteKeys);
		this.width = (config.keyboardWidth / config.numWhiteKeys) / 2;
		this.height = 0.75 * config.keyboardHeight;
	};
	_.extend(BlackKeyRenderer.prototype, {
		isWhite: false,
		offsetX: function(whiteKeyIndex) {
			return (whiteKeyIndex * this.offsetWidth) - (this.width / 2);
		},
		render: function(paper, whiteKeyIndex) {
			var el = paper.rect(this.offsetX(whiteKeyIndex), 0, this.width, this.height);
			el.attr('fill', '90-#333-#000');
			el.toFront();
			el.mouseup(function() {
				this.attr('fill', '90-#333-#000');
			});
			this.el = el;
			return this;
		}
	});

	// Factory to create white or black key renderers.
	var KeyRenderer = function() {};
	KeyRenderer.create = function(isWhite, config) { 
		if(isWhite) {
			return new WhiteKeyRenderer(config);
		}
		return new BlackKeyRenderer(config);
	};

	return KeyRenderer;
});
