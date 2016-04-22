// Input should consist of mod-12 elements excluding 0 (123456789yz) 
// where 0 = pc of bass. E.g. "47" means chord is composed in intervals of 
// four and seven semitones above the bass.
//
// In label output, use "&R" for name of root and "&X" for name of bass pitch;
// use "&dim;" for diminished sign and "&hdim;" for half-diminished sign.

/* global define: false */

define({

  // major triad

    "47": {"label": "&R", "description": "&R major", "spellbass": "iC_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
    "38": {"label": "&R/&X", "description": "&R major &6;", "spellbass": "iE_", "stepwise": "25", "root": "8", "rootstepwise": "5"},
    "59": {"label": "&R/&X", "description": "&64; dischord", "spellbass": "iG_", "stepwise": "35", "root": "5", "rootstepwise": "3"},

  // minor triad

    "37": {"label": "&R-", "description": "&R minor", "spellbass": "iD_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
    "49": {"label": "&R-/&X", "description": "&R minor &6;", "spellbass": "iF_", "stepwise": "25", "root": "9", "rootstepwise": "5"},
    "58": {"label": "&R-/&X", "description": "&64; dischord", "spellbass": "iA_", "stepwise": "35", "root": "5", "rootstepwise": "3"},

  // diminished triad

    "36": {"label": "&R&dim;", "description": "&R diminished &53; (!)", "spellbass": "iE_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
    "39": {"label": "&R&dim;/&X", "description": "&R diminished &6;", "spellbass": "iG_", "stepwise": "25", "root": "9", "rootstepwise": "5"},
    "69": {"label": "&R&dim;/&X", "description": "?!", "spellbass": "iBb", "stepwise": "25", "root": "6", "rootstepwise": "3"},

  // augmented triad, assuming root position (given symmetrical division)

    "48": {"label": "&R+", "description": "&R augmented", "spellbass": "iF_", "stepwise": "24", "root": "0", "rootstepwise": "0"},
    
    // or not making that assumption:
    
    // "48": {"label": "+", "description": "augmented triad", "spellbass": "___", "stepwise": "___", "root": "_", "rootstepwise": "_"},

  // "wannabe" triads

    "57": {"label": "&Rsus4", "description": "&54; dischord", "spellbass": "iC_", "stepwise": "34", "root": "0", "rootstepwise": "0"},
    // "3y": {"label": "(diss.)", "description": "&73; dischord", "spellbass": "iG_", "stepwise": "26", "root": "_", "rootstepwise": "_"},
    // "4z": {"label": "(diss.)", "description": "&73; dischord", "spellbass": "iEb_", "stepwise": "26", "root": "_", "rootstepwise": "_"},
    // "27": {"label": "(diss.)", "description": "&52; dischord", "spellbass": "iC_", "stepwise": "14", "root": "_", "rootstepwise": "_"}, // could resolve to 53 or 63 (bass moves)

  // incomplete dominant tetrad

    // "4y": {"label": "&R7(no5)", "description": "&R dominant &73;", "spellbass": "iG_", "stepwise": "26", "root": "0", "rootstepwise": "0"},

  // dominant tetrad

    "47y": {"label": "&R7", "description": "&R dominant &7;", "spellbass": "iG_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
    "368": {"label": "&R7/&X", "description": "&R dominant &65;", "spellbass": "iB_", "stepwise": "245", "root": "8", "rootstepwise": "5"},
    "359": {"label": "&R7/&X", "description": "&R dominant &43;", "spellbass": "iD_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
    "269": {"label": "&R7/&X", "description": "&R dominant &42;", "spellbass": "iF_", "stepwise": "135", "root": "2", "rootstepwise": "1"},

  // minor tetrad


    "37y": {"label": "&R-7", "description": "&R minor &7;", "spellbass": "iD_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
    "479": {"label": "&R-7/&X", "description": "&R minor &65;", "spellbass": "iF_", "stepwise": "245", "root": "9", "rootstepwise": "5"},
    "358": {"label": "&R-7/&X", "description": "&R minor &43;", "spellbass": "iA_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
    "259": {"label": "&R-7/&X", "description": "&R minor &42;", "spellbass": "iC_", "stepwise": "135", "root": "2", "rootstepwise": "1"},

  // half-diminished tetrad

    "36y": {"label": "&R&hdim;7", "description": "&R half-dim. &7;", "spellbass": "iE_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
    "379": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &65;", "spellbass": "iG_", "stepwise": "245", "root": "9", "rootstepwise": "5"},
    "469": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &43;", "spellbass": "iBb", "stepwise": "235", "root": "6", "rootstepwise": "3"},
    "258": {"label": "&R&hdim;7/&X", "description": "&R half-dim. &42;", "spellbass": "iD_", "stepwise": "135", "root": "2", "rootstepwise": "1"},

  // diminished tetrad, assuming root position (given symmetrical division)

    "369": {"label": "&R&dim;7", "description": "&R dim. &7;", "spellbass": "iF#", "stepwise": "246", "root": "0", "rootstepwise": "0"},
    // or not making that assumption:
    // "369": {"label": "&dim;7", "description": "fully diminished seventh", spellbass": "___", "stepwise": "___", ""root": "_", "rootstepwise": "_"},

  // major tetrad

    "47z": {"label": "&RM7", "description": "&R major &7;", "spellbass": "iC_", "stepwise": "246", "root": "0", "rootstepwise": "0"},
    "378": {"label": "&RM7/&X", "description": "&R major &65;", "spellbass": "iE_", "stepwise": "245", "root": "8", "rootstepwise": "5"},
    "459": {"label": "&RM7/&X", "description": "&R major &43;", "spellbass": "iG_", "stepwise": "235", "root": "5", "rootstepwise": "3"},
    "158": {"label": "&RM7/&X", "description": "&R major &42;", "spellbass": "iB_", "stepwise": "135", "root": "1", "rootstepwise": "1"}

});
