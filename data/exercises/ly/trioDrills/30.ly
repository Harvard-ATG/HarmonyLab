\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Here is another trio drill.
}

theKey = { \key
  g \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f }

\absolute { \theKey \lyCommands

  <c g' e''>1 <b, g' d''>1 <a, g' c''>1 <a, e' c''>1 <d fs' c''>1 <d g' b'>1 <d, g' a'>1 <d, fs' a'>1 <g, g' b'>1

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
