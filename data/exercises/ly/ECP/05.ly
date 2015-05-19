\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  How does the same progression sound in the parallel minor, D minor? The Roman numeral analysis will help.
}

theKey = { \key
  d \minor
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands
  
  <\xNote f \xNote a' d''>1
  <\xNote g \xNote e' d''>
  <\xNote a \xNote e' cs''>
  <\xNote d \xNote f' d''>
  
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
