/* global define: false */
define([
	'jquery',
	'lodash', 
	'vexflow',
	'app/view/transcript/stave'
], function($, _, Vex, Stave) {
	"use strict";

	// Plain Sheet Music Notation
	var PlainNotation = function() {};

	_.extend(PlainNotation.prototype, {
		init: function(transcript, config) {
			this.transcript = transcript;
			this.config = config;
			this.initConfig();
			this.initRenderer();
			this.initStaves();
			this.initListeners();
		},
		initConfig: function() {
			var required = ['chords', 'keySignature'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		initRenderer: function() {
			var CANVAS = Vex.Flow.Renderer.Backends.CANVAS;

			this.el = $('<canvas></canvas>');
			this.el[0].width = this.transcript.getWidth();
			this.el[0].height = this.transcript.getHeight();

			this.vexRenderer = new Vex.Flow.Renderer(this.el[0], CANVAS);

			this.transcript.el.append(this.el);
		},
		initStaves: function() {
			this.staves = [];
			this.addStave('treble'); 
			this.addStave('bass');
		},
		initListeners: function() {
			_.bindAll(this, ['render']);
			this.chords.bind('change', this.render);
			this.keySignature.bind('change', this.render);
		},
		clear: function() {
			this.vexRenderer.getContext().clear();
		},
		render: function() { 
			this.clear();
			this.renderStaves();
			this.connectStaves();
			this.renderAnnotations();
			return this;
		},
		addStave: function(clef) {
			var width = 0.8 * this.transcript.getWidth();
			var config = {
				clef: clef,
				width: width,
				chords: this.chords,
				keySignature: this.keySignature,
				vexRenderer: this.vexRenderer
			};
			this.staves.push(new Stave(config));
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
		},
		getBottomStaveY: function() {
			if(this.staves.length > 0) {
				return this.staves[this.staves.length-1].getVexStave().getBottomY();
			}
			return 0;
		},
		getBottomStaveX: function() {
			if(this.staves.length > 0) {
				return this.staves[this.staves.length-1].getVexStave().x;
			}
			return 0;
		},
		renderAnnotations: function() {
			var ctx = this.vexRenderer.getContext();
			var key = this.keySignature.getKeyShortName() + ':';
			var font = "14px serif";

			ctx.font = font;
			ctx.fillText(this.convertSymbols(key), this.getBottomStaveX(), this.getBottomStaveY());
		},
		convertSymbols: function(text) {
			var rules = [
				[/&dim;/g,"\u00b0"], //	diminished and half-diminished signs
				[/&hdim;/g,"\u2300"],
				[/&3;/g,"\u00b3"],//	figured bass
				[/&6;/g,"\u2076"],
				[/&7;/g,"\u2077"],
				[/&42;/g,"\u2074\u2082"],
				[/&43;/g,"\u2074\u2083"],
				[/&52;/g,"\u2075\u2082"],
				[/&53;/g,"\u2075\u2083"],
				[/&54;/g,"\u2075\u2084"],
				[/&64;/g,"\u2076\u2084"],
				[/&65;/g,"\u2076\u2085"],
				[/&73;/g,"\u2077\u2083"],
				[/&75;/g,"\u2077\u2085"],
				//[/&d5;/g,"5\u0337"],			figured bass chord of the false fifth
				//[/&d7;/g,"7\u0337"],			figured bass diminished seveth
				[/&b;/g,"\u266d"],		//	flat
				//[/&#;/g,"\u266f"],			sharp
				//[/&n;/g,"\u266e"],			natural
				//[/&bb;/g,"\ud834\udd2b"],		double flat
				//[/&##;/g,"\ud834\udd2A"],		double sharp
				["&#x131;","\u0131"],		//	i for fake "Fi" ligature
				[/([cdefgab])b([ :])/i,"$1\u266d$2"],	//	necessary for key labels but could be changed
				[/b([0-9])/,"\u266d$1"],			//	necessary for figured bass and scale degrees but could be changed
				[/^([cdefgab])n /i,"$1\u266e "],
				[/^n([0-9])$/i,"\u266e$1"],
				[/^n$/i,"\u266e"],
				['&nbsp;', '']
			];
			var i, rule, len;

			for(i = 0, len = rules.length; i < len; i++) {
				rule = rules[i];
				text = text.replace(rule[0], rule[1]);
			}

			return text;
		}
	});

	return PlainNotation;
});
