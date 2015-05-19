\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Complete the descending minor scale.
}

theKey = { \key
  d \minor
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f }

\absolute { \theKey \lyCommands

  <d''>1 <\xNote c''>1 <\xNote bf'>1 <\xNote a'>1 <\xNote g'>1 <\xNote f'>1 <\xNote e'>1 <\xNote d'>1

} % end

%{ % HarmonyLab options
  "analysis": {
    "enabled": true,
    "mode": {
      "note_names": false,
      "scientific_pitch": false,
      "scale_degrees": true,
      "solfege": false,
      "roman_numerals": false,
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
