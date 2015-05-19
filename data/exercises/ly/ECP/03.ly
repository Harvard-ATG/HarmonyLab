\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Can you repeat the progression you just played? Notice the root of each chord, now highlighted in red.
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands
  
  <e g' c''>1
  <\xNote f \xNote d' \xNote c''>
  <\xNote g \xNote d' \xNote b'>
  <\xNote c \xNote e' \xNote c''>
  
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
