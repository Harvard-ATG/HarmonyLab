define([
	'lodash', 
	'app/models/metronome'
], function(
	_, 
	Metronome
) {
	"use strict";

	describe("Metronome constructor", function() {
		var MIN_TEMPO = Metronome.MIN_TEMPO;
		var MAX_TEMPO = Metronome.MAX_TEMPO;
		var DEFAULT_TEMPO = Metronome.DEFAULT_TEMPO;

		it("sets a default tempo", function() {
			var metronome = new Metronome();
			expect(metronome.getTempo()).toBe(DEFAULT_TEMPO);
		});

		it("sets a given tempo", function() {
			var tempos = [
				MIN_TEMPO, 
				Math.floor(MIN_TEMPO + MAX_TEMPO / 2),
				MAX_TEMPO
			];
			_.each(tempos, function(tempo) {
				var metronome = new Metronome(tempo);
				expect(metronome.getTempo()).toBe(tempo);
			});
		});

		it("throws an error when created with an invalid tempo", function() {
			var invalid_tempos = [MIN_TEMPO - 1, MAX_TEMPO + 1];
			_.each(invalid_tempos, function(invalid_tempo) {
				var createMetronome = function() { 
					new Metronome(invalid_tempo);
				};
				expect(createMetronome).toThrow(new Error("invalid tempo"));
			});

		});
	});

	describe("Metronome playback", function() {
		it("starts and stops", function() {
			jasmine.Clock.useMock();
			var metronome = new Metronome();
			expect(metronome.isPlaying()).toBe(false);
			metronome.start();
			expect(metronome.isPlaying()).toBe(true);
			metronome.stop();
			expect(metronome.isPlaying()).toBe(false);
		});

		it("ticks", function() {
			jasmine.Clock.useMock();
			var tickSpy = jasmine.createSpy("tickSpy");
			var tempo = 100;
			var metronome = new Metronome(tempo);
			var delay = metronome.getDelay();

			metronome.bind("tick", tickSpy);
			expect(tickSpy).not.toHaveBeenCalled();

			metronome.start();
			expect(tickSpy).not.toHaveBeenCalled();

			// should tick after the first interval is done
			jasmine.Clock.tick(delay + 1);
			expect(tickSpy).toHaveBeenCalled();
			expect(tickSpy.callCount).toEqual(1);

			// shouldn't tick in between the delay interval
			jasmine.Clock.tick(10);
			expect(tickSpy.callCount).toEqual(1);
			jasmine.Clock.tick(10);
			expect(tickSpy.callCount).toEqual(1);

			jasmine.Clock.tick(delay + 1);
			expect(tickSpy.callCount).toEqual(2);

			jasmine.Clock.tick(delay + 1);
			expect(tickSpy.callCount).toEqual(3);

			metronome.stop();

			// shouldn't tick after the metronome stopped
			jasmine.Clock.tick(delay + 1);
			expect(tickSpy.callCount).toEqual(3);
		});
	});
});
