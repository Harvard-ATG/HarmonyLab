The sed find and replace tool (ly2json.sh) converts from Lilypond syntax to the json format used by HarmonyLab exercises, when the Lilypond file is formatted as illustrated in the file SAMPLE.ly. The supported MIDI pitch range is 21--108 (for output); the supported pitch classes are the 21 naturals, sharps, and flats (for input); and all 30 major and minor keys are supported (for both input and output). Users should be cautious to preserve the formatting of SAMPLE.ly else ly2json may not function.

The exercise writing tool (writeExercise.sh) allows any users with access to a unix terminal to produce exercises for HarmonyLab with ease. No experience of Lilypond or json is required.

--------------
RM, May 2015
