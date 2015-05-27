// The input is a list of mod-12 integers that indicate the intervals formed
// above the bass in terms of semitones. "y" stands for 10 and "z" for 11.
// Use "&R" for name of root and "&X" for name of bass pitch in label output.
// Use $ for diminished sign and % for half-diminished sign.

/* global define: false */

define({

   // major triad

      "47": {"label": "&R", "spellbass": "iC_", "stepwise": "24", 
             "root": "0", "rootstepwise": "0"},
      "38": {"label": "&R/&X", "spellbass": "iE_", "stepwise": "25", 
             "root": "8", "rootstepwise": "5"},
      "59": {"label": "&R/&X", "spellbass": "iG_", "stepwise": "35", 
             "root": "5", "rootstepwise": "3"},

   // minor triad

      "37": {"label": "&Rm", "spellbass": "iD_", "stepwise": "24", 
             "root": "0", "rootstepwise": "0"},
      "49": {"label": "&Rm/&X", "spellbass": "iF_", "stepwise": "25", 
             "root": "9", "rootstepwise": "5"},
      "58": {"label": "&Rm/&X", "spellbass": "iA_", "stepwise": "35", 
             "root": "5", "rootstepwise": "3"},

   // diminished triad

      "36": {"label": "&R$", "spellbass": "iE_", "stepwise": "24", 
             "root": "0", "rootstepwise": "0"},
      "39": {"label": "&R$/&X", "spellbass": "iG_", "stepwise": "25", 
             "root": "9", "rootstepwise": "5"},
      "69": {"label": "&R$/&X", "spellbass": "iBb", "stepwise": "25", 
             "root": "6", "rootstepwise": "3"},

   // augmented triad, assuming root position

      "48": {"label": "&R+", "spellbass": "iF_", "stepwise": "24", 
             "root": "0", "rootstepwise": "0"},

      // or not making that assumption:
      // "48": {"label": "aug", "spellbass": "___", "stepwise": "___", 
      //        "root": "_", "rootstepwise": "_"},

   // sus4 chords

      "57": {"label": "&Rsus4", "spellbass": "iC_", "stepwise": "34", 
             "root": "0", "rootstepwise": "0"},

   // dominant tetrad

      "47y": {"label": "&R{u}", "spellbass": "iG_", "stepwise": "246", 
              "root": "0", "rootstepwise": "0"},
      "368": {"label": "&R{u}/&X", "spellbass": "iB_", "stepwise": "245", 
              "root": "8", "rootstepwise": "5"},
      "359": {"label": "&R{u}/&X", "spellbass": "iD_", "stepwise": "235", 
              "root": "5", "rootstepwise": "3"},
      "269": {"label": "&R{u}/&X", "spellbass": "iF_", "stepwise": "135", 
              "root": "2", "rootstepwise": "1"},

   // incomplete dominant tetrad

      "4y": {"label": "&R{u3}", "spellbass": "iG_", "stepwise": "26", 
             "root": "0", "rootstepwise": "0"},

   // minor tetrad

      "37y": {"label": "&Rm{u}", "spellbass": "iD_", "stepwise": "246", 
              "root": "0", "rootstepwise": "0"},
      "479": {"label": "&Rm{u}/&X", "spellbass": "iF_", "stepwise": "245", 
              "root": "9", "rootstepwise": "5"},
      "358": {"label": "&Rm{u}/&X", "spellbass": "iA_", "stepwise": "235", 
              "root": "5", "rootstepwise": "3"},
      "259": {"label": "&Rm{u}/&X", "spellbass": "iC_", "stepwise": "135", 
              "root": "2", "rootstepwise": "1"},

   // half-diminished tetrad

      "36y": {"label": "&R%{u}", "spellbass": "iE_", "stepwise": "246", 
              "root": "0", "rootstepwise": "0"},
      "379": {"label": "&R%{u}/&X", "spellbass": "iG_", "stepwise": "245",
              "root": "9", "rootstepwise": "5"},
      "469": {"label": "&R%{u}/&X", "spellbass": "iBb", "stepwise": "235",
              "root": "6", "rootstepwise": "3"},
      "258": {"label": "&R%{u}/&X", "spellbass": "iD_", "stepwise": "135",
              "root": "2", "rootstepwise": "1"},

   // diminished tetrad, assuming root position

      "369": {"label": "&R${u}", "spellbass": "iF#", "stepwise": "246", 
              "root": "0", "rootstepwise": "0"},

      // or not making that assumption:
      // "369": {"label": "${u}", spellbass": "___", "stepwise": "___", 
      //         "root": "_", "rootstepwise": "_"},

   // major tetrad

      "47z": {"label": "&RM{u}", "spellbass": "iC_", "stepwise": "246", 
              "root": "0", "rootstepwise": "0"},
      "378": {"label": "&RM{u}/&X", "spellbass": "iE_", "stepwise": "245", 
              "root": "8", "rootstepwise": "5"},
      "459": {"label": "&RM{u}/&X", "spellbass": "iG_", "stepwise": "235", 
              "root": "5", "rootstepwise": "3"},
      "158": {"label": "&RM{u}/&X", "spellbass": "iB_", "stepwise": "135", 
              "root": "1", "rootstepwise": "1"}

});
