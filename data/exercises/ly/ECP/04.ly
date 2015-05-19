\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Now repeat the progression in D major, transposing up a major second.
}

theKey = { \key
  d \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands
  
  <fs a' d''>1
  <\xNote g \xNote e' \xNote d''>
  <\xNote a \xNote e' \xNote cs''>
  <\xNote d \xNote fs' \xNote d''>
  
} % end

%{ % HarmonyLab options
  "analysis": {
    "enabled": false,
    "mode": {
      "note_names": false,
      "scale_degrees": false,
      "solfege": false,
      "roman_numerals": true,
      "intervals": false,
    },
  },
  "highlight": {
    "enabled": true,
    "mode": {
      "roothighlight": true,
      "tritonehighlight": false,
    },
  },
%}
