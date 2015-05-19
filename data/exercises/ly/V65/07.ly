\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Preserving the same structure in each hand, complete the progression in the key shown.
}

theKey = { \key
  a \minor
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands

  <gs e' b' d''>1
  <\xNote a \xNote e' \xNote a' \xNote c''>1
  
} % end

%{ % HarmonyLab options
  "analysis": {
    "enabled": true,
    "mode": {
      "note_names": false,
      "scale_degrees": false,
      "solfege": false,
      "roman_numerals": true,
      "intervals": false,
    },
  },
  "highlight": {
    "enabled": false,
    "mode": {
      "roothighlight": true,
      "tritonehighlight": false,
    },
  },
%}