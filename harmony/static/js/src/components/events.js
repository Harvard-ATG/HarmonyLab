/**
 * Symbol table for event names. 
 *
 * Used to refer to events symbolically instead of having to use strings
 * everywhere, which are susceptible to typo errors when used in multiple
 * places. This also is useful to document the complete set of events used
 * in the application.
 */
define({
	"BROADCAST": {
		"JAZZ_MIDI_ERROR": "jazzmidierror",
		"PEDAL": "pedal",
		"NOTE": "note",
		"CLEAR_NOTES": "clearnotes",
		"BANK_NOTES": "banknotes",
		"INSTRUMENT": "instrument",
		"TRANSPOSE": "transpose",
		"METRONOME": "metronome",
		"TOGGLE_METRONOME": "togglemetronome",
		"TOGGLE_SHORTCUTS": "toggleshortcuts",
		"KEYBOARD_SIZE": "keyboardsize"
	},
	"TRIGGER": {
	}
});
