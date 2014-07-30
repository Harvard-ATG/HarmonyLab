define(function() {
	require(["spec/models/exercise_definition_spec", "spec/models/metronome_spec", "spec/models/keyboard_generator_spec", "spec/models/exercise_grader_spec", "spec/models/exercise_context_spec", "spec/utils/util_spec", "spec/components/metronome_component_spec", "spec/components/component_spec", "spec/components/music_component_spec"], function(){
		console.log('Specs loaded.');
		var consoleReporter = new jasmine.ConsoleReporter();
		var htmlReporter = new jasmine.HtmlReporter();
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.addReporter(consoleReporter);
		jasmineEnv.addReporter(htmlReporter);
		jasmineEnv.execute();
	});
});
