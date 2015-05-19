\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Now match this three-part realization. Memorize the upper parts!
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands
  
  <e g' c''>1
  <f d' c''>
  <g d' b'>
  <c e' c''>
  
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
    "enabled": false,
    "mode": {
      "roothighlight": true,
      "tritonehighlight": false,
    },
  },
%}
