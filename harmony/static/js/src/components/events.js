/**
 * Broadcast Events Table
 *
 * Used to refer to events symbolically instead of string literals to prevent
 * typo errors and also to document the set of events broadcasted in the
 * application.
 */
define({
	"BROADCAST": {
		"JAZZ_MIDI_ERROR": "jazzmidierror",
		"PEDAL": "pedal",
		"NOTE": "note",
		"CLEAR_NOTES": "clearnotes",
		"BANK_NOTES": "banknotes",
		"HIGHLIGHT_NOTES": "notation:highlight",
		"ANALYZE_NOTES": "notation:analyze",
		"INSTRUMENT": "instrument",
		"TRANSPOSE": "transpose",
		"METRONOME": "metronome",
		"TOGGLE_METRONOME": "togglemetronome",
		"TOGGLE_SHORTCUTS": "toggleshortcuts",
		"KEYBOARD_SIZE": "keyboardsize"
	}
});