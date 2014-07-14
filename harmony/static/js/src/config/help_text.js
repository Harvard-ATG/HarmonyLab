// Help Text Configuration
//
// This defines help text that is displayed in parts of the application.
//
define({
	// Application info modal.
	'appInfo': {
		'title': 'Harmony App Information',
		'content': '<h4>Keyboard Shortcuts</h4><p>There are a number of QWERTY Keyboard shorcuts below for Harmony controls and (piano) keyboard notes.</p><div class="qwerty-keyboard-legend"></div>'
	},
	// Jazz MIDI Plugin required modal.
	'jazzMidiError': {
		'title': 'Jazz MIDI Plugin Required',
		'content': '<p>Your browser is missing the <a href="http://jazz-soft.net/download">Jazz MIDI plugin</a>. ' 
					+ 'This browser plugin is required to produce sound with the on-screen keyboard or to ' 
					+ 'connect and use your own MIDI keyboard.</p>'
					+ '<p>Please download and install the Jazz MIDI plugin here: <br/>' 
					+ '<a href="http://jazz-soft.net/download">http://jazz-soft.net/</a>.</p>'
	}
});
