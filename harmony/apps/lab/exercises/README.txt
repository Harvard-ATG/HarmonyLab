The sed find and replace tool (ly2json.sh) converts from Lilypond syntax to the json format used by HarmonyLab exercises, when the Lilypond file is formatted as illustrated below. The currently supported MIDI pitch range is 36--83 (for output); the currently supported pitch classes are C, C#, D, Eb, E, F, G, G#, A, Bb, and B (for input); and the all 30 major and minor keys are supported (for both input and output).

Issue: currently, any word matching a pitch class in Lilypond syntax will be replaced (c, cs, d, ef, e, f, fs, g, gs, a, bf, b). This means that the word "a" cannot be used for introText at present!

-------------------------------------------------
An example of input in Lilypond syntax.
Use spaces and line breaks exactly as shown here.
-------------------------------------------------

\version "2.18.2" \language "english"
\markup {Play the dominant tetrad and resolve it to the tonic triad with smooth voice leading.}
theKey = { \key c \major }
\absolute { \theKey <b, g' d'' f''>1 << { <> } \\ { <c g' c'' e''> } >> }


-------------------------
The corresponding output.
-------------------------

{
  "type": "matching",
  "reviewText": "Good job!",
  "introText": "Play the dominant tetrad and resolve it to the tonic triad with smooth voice leading.",
  "key": "jC_",
  "chord": [[47,67,74,77],{"visible":[],"hidden":[48,67,72,76]}]
}

----------------
RM, October 2014
