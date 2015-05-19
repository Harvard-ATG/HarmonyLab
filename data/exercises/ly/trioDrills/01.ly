\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  Match this three-part drill, which demonstrates the resolution of dominant harmonies including scale degree 4. Here, V{u3} appears as a substitute of vii${6}, since the resolution of a 7-6 suspension is accompanied by a bass motion.
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f }

\absolute { \theKey \lyCommands

  <b, g' f''>1 <c g' e''>1 <f g' b'>1 <e g' c''>1 <d f' c''>1 <g f' b'>1 <c e' c''>1

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
      "tritonehighlight": true,
    },
  },
%}
