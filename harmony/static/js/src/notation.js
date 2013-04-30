define(['lodash', 'vexflow', 'radio'], function(_, Vex, radio) {

	/**
	 * Notation object for converting MIDI notes to musical notation and
	 * displaying the notes on the screen as they are played.
	 */
	var Notation = function() {
		this.init();
	};

	_.extend(Notation.prototype, {
		/**
		 * Size of the canvas and staves.
		 */
		canvasSize: { width: 225, height: 250 },
		staveSize: { width: 180 },
		/**
		 * Initialize.
		 */
		init: function() {
			this.el = $('<canvas></canvas>');

			// TODO: move to CSS
			this.el.css({
				'background-color': '#eed',
				'padding': '10px',
				'border': '10px solid #ddc'
			});

			this.el[0].height = this.canvasSize.height;
			this.el[0].width = this.canvasSize.width;

			this.renderer = new Vex.Flow.Renderer(this.el[0], Vex.Flow.Renderer.Backends.CANVAS);
		},
		/**
		 * Renders the notation.
		 * @return {this}
		 */
		render: function() { 
			this.renderStave();
			return this;
		},
		/**
		 * Renders the stave(s).
		 * @return {this}
		 */
		renderStave: function() {
			var ctx = this.renderer.getContext();
			var staves = {}, x = 10, width = this.staveSize.width;

			_.each(['treble','bass'], function(clef, index) {
				var y = 75 * index;
				var stave = new Vex.Flow.Stave(x, y, width);
				stave.addClef(clef).setContext(ctx).draw();
				staves[clef] = stave;
			});

			this.staves = staves;

			return this;
		}
	});

	return Notation;
});
