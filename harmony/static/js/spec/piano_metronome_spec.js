define(['lodash', 'app/view/piano/piano_metronome'], function(_, PianoMetronome) {
	"use strict";

	describe("Piano metronome", function() {
		it("should be created", function() {
			var pianoMetronome = new PianoMetronome();
			expect(pianoMetronome).toBeTruthy();
		});

		it("should render", function() {
			var pianoMetronome = new PianoMetronome();
			pianoMetronome.render()
			expect(pianoMetronome.el).toBeTruthy();
		});

		it("should toggle", function() {
			var pianoMetronome = new PianoMetronome();
			var metronome = jasmine.createSpyObj('metronome', ['start','stop','isPlaying','bind','getTempo']);
			pianoMetronome.metronome = metronome;

			pianoMetronome.render();

			metronome.isPlaying.andReturn(false);
			pianoMetronome.toggle();
			expect(metronome.start).toHaveBeenCalled();
			metronome.isPlaying.andReturn(true);
			pianoMetronome.toggle();
			expect(metronome.stop).toHaveBeenCalled();
		});

		it("should blink", function() {
			var pianoMetronome = new PianoMetronome();
			var onbeatSpy = jasmine.createSpy("onbeatSpy");
			var offbeatSpy = jasmine.createSpy("offbeatSpy");

			pianoMetronome.bind("onbeat", onbeatSpy);
			pianoMetronome.bind("offbeat", offbeatSpy);
			pianoMetronome.render();

			expect(onbeatSpy).not.toHaveBeenCalled();
			expect(offbeatSpy).not.toHaveBeenCalled();
			pianoMetronome.blink();
			expect(onbeatSpy).toHaveBeenCalled();
			pianoMetronome.blink();
			expect(offbeatSpy).toHaveBeenCalled();
		});

		it("should play", function() {
			var pianoMetronome = new PianoMetronome();
			var audio = jasmine.createSpyObj('audio', ['play','load']);
			pianoMetronome.audio = audio;
			pianoMetronome.render();

			pianoMetronome.play();
			expect(pianoMetronome.audio.play).toHaveBeenCalled();
		});
	});
});
