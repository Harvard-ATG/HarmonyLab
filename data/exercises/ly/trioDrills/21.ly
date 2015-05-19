\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  To complete the same three-part drill in F major, add to the visible bass and alto parts a soprano part which harmonizes the bass in parallel tenths.
}

theKey = { \key
  f \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f }

\absolute { \theKey \lyCommands

  <bf f' \xNote d''>1 <a f' \xNote c''>1 <g e' \xNote bf'>1 <f f' \xNote a'>1

} % end

%{ % HarmonyLab options
  "analysis": {
    "enabled": true,
    "mode": {
      "note_names": false,
      "scientific_pitch": false,
      "scale_degrees": false,
      "solfege": false,
      "roman_numerals": true,
      "intervals": false,
    },
  },
  "highlight": {
    "enabled": true,
    "mode": {
      "roothighlight": false,
      "tritonehighlight": false,
    },
  },
%}
