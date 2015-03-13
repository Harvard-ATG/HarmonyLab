The sed find and replace tool (ly2json.sh) converts from Lilypond syntax to the json format used by HarmonyLab exercises, when the Lilypond file is formatted as illustrated below. The supported MIDI pitch range is 21--108 (for output); the supported pitch classes are the 21 naturals, sharps, and flats (for input); and all 30 major and minor keys are supported (for both input and output).


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
  "reviewText": "",
  "introText": "Play the dominant tetrad and resolve it to the tonic triad with smooth voice leading.",
  "key": "jC_",
  "chord": [[47,67,74,77],{"visible":[],"hidden":[48,67,72,76]}]
}

--------------
RM, March 2015
