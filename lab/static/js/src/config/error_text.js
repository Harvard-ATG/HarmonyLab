define({
	// Notification to display when there is an error loading/running
    // the Jazz MIDI browser plugin.
	'jazzMidiPluginError': {
		'title': 'Jazz MIDI Plugin Required',
		'description': '<p>Your browser is missing the <a href="http://jazz-soft.net/download">Jazz MIDI plugin</a>. ' 
					+ 'This browser plugin is required to produce sound with the on-screen keyboard or to ' 
					+ 'connect and use your own MIDI keyboard.</p>'
					+ '<p>Please download and install the Jazz MIDI plugin here: ' 
					+ '<a href="http://jazz-soft.net/download">http://jazz-soft.net/</a>.</p>'
					+ '<p>Note: if you are using the Chrome browser, version 42 or later, you need to enable "NPAPI"'
					+ 'after installing the plugin by browsing to <a href="chrome://flags/#enable-npapi">chrome://flags/#enable-npapi</a> '
					+ 'clicking "Enable" and then relaunching your browser.'
	}
});