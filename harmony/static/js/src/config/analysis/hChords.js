// Input should consist of mod-12 elements excluding 0 (123456789yz) where 0 = pc of bass.
// "47" means chord is composed in intervals of four and seven semitones above the bass.
// In label output, use "&R" for name of root and "&X" for name of bass pitch.

/* global define: false */
define({
	"47": {"label": "&R", "description": "&R major", "stepwise": "24", "spellbass": "iC_", "root": "0", "rootstepwise": "0"},
	"38": {"label": "&R/&X", "description": "&R major &6;", "stepwise": "25", "spellbass": "iE_", "root": "8", "rootstepwise": "5"},
	"59": {"label": "&R/&X", "description": "&64; dischord", "stepwise": "35", "spellbass": "iG_", "root": "5", "rootstepwise": "3"},
	"37": {"label": "&Rm", "description": "&R minor", "stepwise": "24", "spellbass": "iD_", "root": "0", "rootstepwise": "0"},
	"49": {"label": "&Rm/&X", "description": "&R minor &6;", "stepwise": "25", "spellbass": "iF_", "root": "9", "rootstepwise": "5"},
	"58": {"label": "&Rm/&X", "description": "&64; dischord", "stepwise": "35", "spellbass": "iA_", "root": "5", "rootstepwise": "3"},
	"36": {"label": "&Rdim", "description": "&R diminished &53; (!)", "stepwise": "24", "spellbass": "iE_", "root": "0", "rootstepwise": "0"},
	"39": {"label": "&Rdim/&X", "description": "&R diminished &6;", "stepwise": "25", "spellbass": "iG_", "root": "9", "rootstepwise": "5"},
	"57": {"label": "&Rsus4", "description": "&54; dischord", "stepwise": "34", "spellbass": "iC_", "root": "0", "rootstepwise": "0"},
	// "3y": {"label": "(diss.)", "description": "&73; dischord", "stepwise": "26", "spellbass": "iG_", "root": "_", "rootstepwise": "_"},
	// "4z": {"label": "(diss.)", "description": "&73; dischord", "stepwise": "26", "spellbass": "iEb_", "root": "_", "rootstepwise": "_"},
	// "27": {"label": "(diss.)", "description": "&52; dischord", "stepwise": "14", "spellbass": "iC_", "root": "_", "rootstepwise": "_"}, // could resolve to 53 or 63 (bass moves)
	// "4y": {"label": "&R7 (no 5)", "description": "&R dominant &73;", "stepwise": "26", "spellbass": "iG_", "root": "0", "rootstepwise": "0"},
	"47y": {"label": "&R7", "description": "&R dominant &7;", "stepwise": "246", "spellbass": "iG_", "root": "0", "rootstepwise": "0"},
	"368": {"label": "&R7/&X", "description": "&R dominant &65;", "stepwise": "245", "spellbass": "iB_", "root": "8", "rootstepwise": "5"},
	"359": {"label": "&R7/&X", "description": "&R dominant &43;", "stepwise": "235", "spellbass": "iD_", "root": "5", "rootstepwise": "3"},
	"269": {"label": "&R7/&X", "description": "&R dominant &42;", "stepwise": "135", "spellbass": "iF_", "root": "2", "rootstepwise": "1"},
	"37y": {"label": "&Rm7", "description": "&R minor &7;", "stepwise": "246", "spellbass": "iD_", "root": "0", "rootstepwise": "0"},
	"479": {"label": "&Rm7/&X", "description": "&R minor &65;", "stepwise": "245", "spellbass": "iF_", "root": "9", "rootstepwise": "5"},
	"358": {"label": "&Rm7/&X", "description": "&R minor &43;", "stepwise": "235", "spellbass": "iA_", "root": "5", "rootstepwise": "3"},
	"259": {"label": "&Rm7/&X", "description": "&R minor &42;", "stepwise": "135", "spellbass": "iC_", "root": "2", "rootstepwise": "1"},
	"36y": {"label": "&R&hdim;7", "description": "&R half-dim. &7;", "stepwise": "246", "spellbass": "iE_", "root": "0", "rootstepwise": "0"},
	"379": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &65;", "stepwise": "245", "spellbass": "iG_", "root": "9", "rootstepwise": "5"},
	"469": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &43;", "stepwise": "235", "spellbass": "iBb", "root": "6", "rootstepwise": "3"},
	"258": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &42;", "stepwise": "135", "spellbass": "iD_", "root": "2", "rootstepwise": "1"},
	"369": {"label": "dim7", "description": "fully diminished seventh", "stepwise": "___", "spellbass": "___", "root": "_", "rootstepwise": "_"}, // root analysis or snap spelling not possible for symmetrical division of octave
	"47z": {"label": "&RM7", "description": "&R major &7;", "stepwise": "246", "spellbass": "iC_", "root": "0", "rootstepwise": "0"},
	"378": {"label": "&RM7/&X", "description": "&R major &65;", "stepwise": "245", "spellbass": "iE_", "root": "8", "rootstepwise": "5"},
	"459": {"label": "&RM7/&X", "description": "&R major &43;", "stepwise": "235", "spellbass": "iG_", "root": "5", "rootstepwise": "3"},
	"158": {"label": "&RM7/&X", "description": "&R major &42;", "stepwise": "135", "spellbass": "iB_", "root": "1", "rootstepwise": "1"}
});
