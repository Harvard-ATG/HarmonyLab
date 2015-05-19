\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  You should now be able to resolve V{z5} in three different configurations in any given key. Before practicing this, review the four elements of the voice leading by playing the four note-pairs in succession.
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands

  <b,>1
  <c>
  <f''>
  <e''>
  <g'>
  <g'>
  <d''>
  <c''>
  
} % end

%{ % HarmonyLab options
  "analysis": {
    "enabled": true,
    "mode": {
      "note_names": false,
      "scale_degrees": true,
      "solfege": false,
      "roman_numerals": false,
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
