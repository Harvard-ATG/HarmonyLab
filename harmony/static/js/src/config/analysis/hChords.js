// Input should consist of mod-12 elements excluding 0 (123456789yz) where 0 = pc of bass.
// "47" means chord is composed in intervals of four and seven semitones above the bass.
// In label output, use "&R" for name of root and "&X" for name of bass pitch;
// use "&dim;" for diminished sign and "&hdim;" for half-diminished sign.

/* global define: false */
define({
	// major triad
		"47": {"label": "&R", "description": "", "spellbass": "iC_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
		"38": {"label": "&R/&X", "description": "", "spellbass": "iE_", "stepwise": "25", "root": "8", "rootstepwise": "5"},
		"59": {"label": "&R/&X", "description": "", "spellbass": "iG_", "stepwise": "35", "root": "5", "rootstepwise": "3"},
	// minor triad
		"37": {"label": "&Rm", "description": "", "spellbass": "iD_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
		"49": {"label": "&Rm/&X", "description": "", "spellbass": "iF_", "stepwise": "25", "root": "9", "rootstepwise": "5"},
		"58": {"label": "&Rm/&X", "description": "", "spellbass": "iA_", "stepwise": "35", "root": "5", "rootstepwise": "3"},
	// diminished triad
		"36": {"label": "&Rdim", "description": "", "spellbass": "iE_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
		"39": {"label": "&Rdim/&X", "description": "", "spellbass": "iG_", "stepwise": "25", "root": "9", "rootstepwise": "5"},
		"69": {"label": "&Rdim/&X", "description": "", "spellbass": "iBb", "stepwise": "25", "root": "6", "rootstepwise": "3"},
	// augmented triad, assuming root position (given symmetrical division)
		"48": {"label": "&Raug", "description": "", "spellbass": "iF_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
		// or not making that assumption:
		// "48": {"label": "aug", "description": "", "spellbass": "___", "stepwise": "___", "root": "_", "rootstepwise": "_"},
	// "wannabe" triads
		"57": {"label": "&Rsus4", "description": "", "spellbass": "iC_", "stepwise": "34", "root": "0", "rootstepwise": "0"},
	// dominant tetrad
		"47y": {"label": "&R7", "description": "", "spellbass": "iG_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
		"368": {"label": "&R7/&X", "description": "", "spellbass": "iB_", "stepwise": "245", "root": "8", "rootstepwise": "5"},
		"359": {"label": "&R7/&X", "description": "", "spellbass": "iD_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
		"269": {"label": "&R7/&X", "description": "", "spellbass": "iF_", "stepwise": "135", "root": "2", "rootstepwise": "1"},
	// incomplete dominant tetrad
		// "4y": {"label": "&R7 (no 5)", "description": "", "spellbass": "iG_", "stepwise": "26", "root": "0", "rootstepwise": "0"},
	// minor tetrad
		"37y": {"label": "&Rm7", "description": "", "spellbass": "iD_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
		"479": {"label": "&Rm7/&X", "description": "", "spellbass": "iF_", "stepwise": "245", "root": "9", "rootstepwise": "5"},
		"358": {"label": "&Rm7/&X", "description": "", "spellbass": "iA_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
		"259": {"label": "&Rm7/&X", "description": "", "spellbass": "iC_", "stepwise": "135", "root": "2", "rootstepwise": "1"},
	// half-diminished tetrad
		"36y": {"label": "&R&hdim;7", "description": "", "spellbass": "iE_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
		"379": {"label": "&R&hdim;7/&X", "description": "", "spellbass": "iG_", "stepwise": "245", "root": "9", "rootstepwise": "5"},
		"469": {"label": "&R&hdim;7/&X", "description": "", "spellbass": "iBb", "stepwise": "235", "root": "6", "rootstepwise": "3"},
		"258": {"label": "&R&hdim;7/&X", "description": "", "spellbass": "iD_", "stepwise": "135", "root": "2", "rootstepwise": "1"},
	// diminished tetrad, assuming root position (given symmetrical division)
		"369": {"label": "&Rdim7", "description": "", "spellbass": "iF#", "stepwise": "246", "root": "0", "rootstepwise": "0"},
		// or not making that assumption:
		// "369": {"label": "&dim;7", "description": "", spellbass": "___", "stepwise": "___", ""root": "_", "rootstepwise": "_"},
	// major tetrad
		"47z": {"label": "&RM7", "description": "", "spellbass": "iC_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
		"378": {"label": "&RM7/&X", "description": "", "spellbass": "iE_", "stepwise": "245", "root": "8", "rootstepwise": "5"},
		"459": {"label": "&RM7/&X", "description": "", "spellbass": "iG_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
		"158": {"label": "&RM7/&X", "description": "", "spellbass": "iB_", "stepwise": "135", "root": "1", "rootstepwise": "1"}
});
