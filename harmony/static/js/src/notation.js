define([
	'lodash', 
	'vexflow', 
	'app/notation/stave_renderer', 
	'app/notation/key_signature'
], function(_, Vex, StaveRenderer, KeySignature) {

	// Knows how to render the grand staff and notes as they are played.
	var Notation = function(config) {
		this.config = config || {};
		this.init();
	};

	_.extend(Notation.prototype, {
		init: function() {
			if(!this.config.hasOwnProperty('midiNotes')) {
				throw new Error("missing config property");
			}

			this.midiNotes = this.config.midiNotes;
			this.keySignature = this.config.keySignature;

			this.initRenderer();
			this.initStaves();
			this.initListeners();
		},
		initRenderer: function() {
			var CANVAS = Vex.Flow.Renderer.Backends.CANVAS;
			var css = {
				'background-color': '#eed',
				'padding': '10px',
				'border': '1px solid #ddc'
			};
	
			this.el = $('<canvas></canvas>');
			this.el.css(css);
			this.el[0].width = 520;
			this.el[0].height = 380;

			this.vexRenderer = new Vex.Flow.Renderer(this.el[0], CANVAS);
		},
		initStaves: function() {
			this.staves = [];
			this.addStave({ clef: 'treble' });
			this.addStave({ clef: 'bass' });
		},
		initListeners: function() {
			_.bindAll(this, ['render']);
			this.midiNotes.bind('note:change', this.render);
			this.keySignature.bind('change', this.render);
		},
		clear: function() {
			this.vexRenderer.getContext().clear();
		},
		render: function() { 
			this.clear();
			this.renderStaves();
			this.connectStaves();
			return this;
		},
		addStave: function(config) {
			_.extend(config, {
				midiNotes: this.midiNotes,
				keySignature: this.keySignature,
				vexRenderer: this.vexRenderer
			});
			this.staves.push(new StaveRenderer(config));
		},
		renderStaves: function() {
			var i, len;
			for(i = 0, len = this.staves.length; i < len; i++) {
				this.staves[i].render();
			}
		},
		connectStaves: function() {
			if(this.staves.length === 2) { 
				this.staves[0].connectWith(this.staves[1]);
			}
		}
	});

	return Notation;
});
