define([
	'lodash', 
	'app/components/piano/metronome'
], function(
	_, 
	MetronomeComponent
) {

	function createMetronome() {
		var metronomeComponent = new MetronomeComponent();
		metronomeComponent.init(null);
		return metronomeComponent;
	}

	describe("Piano metronome component", function() {
		it("should be created", function() {
			var metronomeComponent = createMetronome();
			expect(metronomeComponent).toBeTruthy();
		});

		it("should render", function() {
			var metronomeComponent = createMetronome();
			metronomeComponent.render();
			expect(metronomeComponent.el).toBeTruthy();
		});

		it("should toggle", function() {
			var metronomeComponent = createMetronome();
			var metronome = jasmine.createSpyObj('metronome', ['start','stop','isPlaying','bind','getTempo']);
			metronomeComponent.metronome = metronome;

			metronomeComponent.render();

			metronome.isPlaying.andReturn(false);
			metronomeComponent.toggle();
			expect(metronome.start).toHaveBeenCalled();
			metronome.isPlaying.andReturn(true);
			metronomeComponent.toggle();
			expect(metronome.stop).toHaveBeenCalled();
		});

		it("should blink", function() {
			var metronomeComponent = createMetronome();
			var onbeatSpy = jasmine.createSpy("onbeatSpy");
			var offbeatSpy = jasmine.createSpy("offbeatSpy");

			metronomeComponent.bind("onbeat", onbeatSpy);
			metronomeComponent.bind("offbeat", offbeatSpy);
			metronomeComponent.render();

			expect(onbeatSpy).not.toHaveBeenCalled();
			expect(offbeatSpy).not.toHaveBeenCalled();
			metronomeComponent.blink();
			expect(onbeatSpy).toHaveBeenCalled();
			metronomeComponent.blink();
			expect(offbeatSpy).toHaveBeenCalled();
		});

		it("should play", function() {
			var metronomeComponent = createMetronome();
			var audio = jasmine.createSpyObj('audio', ['play','load']);
			metronomeComponent.audio = audio;
			metronomeComponent.render();

			metronomeComponent.play();
			expect(metronomeComponent.audio.play).toHaveBeenCalled();
		});
	});
});
