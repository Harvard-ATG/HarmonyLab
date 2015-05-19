\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  In the same vein, complete a series of V{z5} resolutions that form a descending sequence.
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands

  <gs \xNote e' \xNote b' d''>1
  <a \xNote e' \xNote a' c''>1
  <fs \xNote d' \xNote a' c''>1
  <g \xNote d' \xNote g' b'>1
  <e \xNote c' \xNote g' bf'>1
  <f \xNote c' \xNote f' a'>1
  <g b d' g'>1
  <c c' e' g'>1
  
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
