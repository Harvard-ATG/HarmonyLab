// Input should consist of mod-12 elements excluding 0 (123456789yz) where 0 = pc of bass.
// "47" means chord is composed in intervals of four and seven semitones above the bass.
// In label output, use "&R" for name of root and "&X" for name of bass pitch.

/* global define: false */
define({
	"47": {"label": "&R major", "stepwise": "24", "spellbass": "iC_", "root": "0", "rootstepwise": "0"},
	"38": {"label": "&R major &6;", "stepwise": "25", "spellbass": "iE_", "root": "8", "rootstepwise": "5"},
	"37": {"label": "&R minor", "stepwise": "24", "spellbass": "iC_", "root": "0", "rootstepwise": "0"},
	"49": {"label": "&R minor &6;", "stepwise": "25", "spellbass": "iF_", "root": "9", "rootstepwise": "5"},
	"36": {"label": "&R diminished &53; (!)", "stepwise": "24", "spellbass": "iD_", "root": "0", "rootstepwise": "0"},
	"39": {"label": "&R diminished &6;", "stepwise": "25", "spellbass": "iF_", "root": "9", "rootstepwise": "5"},
	"3y": {"label": "&73; dischord", "stepwise": "26", "spellbass": "iF#", "root": "_", "rootstepwise": "_"},
	"4z": {"label": "&73; dischord", "stepwise": "26", "spellbass": "iF#", "root": "_", "rootstepwise": "_"},
	"57": {"label": "&54; dischord", "stepwise": "34", "spellbass": "iG_", "root": "0", "rootstepwise": "0"},
	"27": {"label": "&52; dischord", "stepwise": "14", "spellbass": "iG_", "root": "_", "rootstepwise": "_"}, // could resolve to 53 or 63 (bass moves)
	"59": {"label": "&64; dischord", "stepwise": "35", "spellbass": "iG_", "root": "_", "rootstepwise": "_"},
	"58": {"label": "&64; dischord", "stepwise": "35", "spellbass": "iG_", "root": "_", "rootstepwise": "_"},
	"4y": {"label": "&R dominant &73;", "stepwise": "26", "spellbass": "iD_", "root": "0", "rootstepwise": "0"},
	"47y": {"label": "&R dominant &7;", "stepwise": "246", "spellbass": "iG_", "root": "0", "rootstepwise": "0"},
	"368": {"label": "&R dominant &65;", "stepwise": "245", "spellbass": "iF#", "root": "8", "rootstepwise": "5"},
	"359": {"label": "&R dominant &43;", "stepwise": "235", "spellbass": "iA_", "root": "5", "rootstepwise": "3"},
	"269": {"label": "&R dominant &42;", "stepwise": "135", "spellbass": "iC_", "root": "2", "rootstepwise": "1"},
	"37y": {"label": "&R minor &7;", "stepwise": "246", "spellbass": "iB_", "root": "0", "rootstepwise": "0"},
	"479": {"label": "&R minor &65;", "stepwise": "245", "spellbass": "iD_", "root": "9", "rootstepwise": "5"},
	"358": {"label": "&R minor &43;", "stepwise": "235", "spellbass": "iF#", "root": "5", "rootstepwise": "3"},
	"259": {"label": "&R minor &42;", "stepwise": "135", "spellbass": "iA_", "root": "2", "rootstepwise": "1"},
	"36y": {"label": "&R half-dim. &7;", "stepwise": "246", "spellbass": "iF#", "root": "0", "rootstepwise": "0"},
	"379": {"label": "&R half-dim. &65;", "stepwise": "245", "spellbass": "iAb", "root": "9", "rootstepwise": "5"},
	"469": {"label": "&R half-dim. &43;", "stepwise": "235", "spellbass": "iB_", "root": "6", "rootstepwise": "3"},
	"258": {"label": "&R half-dim. &42;", "stepwise": "135", "spellbass": "iEb", "root": "2", "rootstepwise": "1"},
	"369": {"label": "fully diminished seventh", "stepwise": "___", "spellbass": "___", "root": "_", "rootstepwise": "_"}, // root analysis or snap spelling not possible for symmetrical division of octave
	"47z": {"label": "&R major &7;", "stepwise": "246", "spellbass": "iD_", "root": "0", "rootstepwise": "0"},
	"378": {"label": "&R major &65;", "stepwise": "245", "spellbass": "iF#", "root": "8", "rootstepwise": "5"},
	"459": {"label": "&R major &43;", "stepwise": "235", "spellbass": "iB_", "root": "5", "rootstepwise": "3"},
	"158": {"label": "&R major &42;", "stepwise": "135", "spellbass": "iE_", "root": "1", "rootstepwise": "1"}
});
