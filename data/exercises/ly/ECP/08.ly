\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Play the same four-part progression in F major from the given starting position.
}

theKey = { \key
  f \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands
  
  <a, a' c'' f''>1
  <\xNote bf, \xNote g' \xNote d'' \xNote f''>
  <\xNote c \xNote g' \xNote c'' \xNote e''>
  <\xNote f, \xNote a' \xNote c'' \xNote f''>
  
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
