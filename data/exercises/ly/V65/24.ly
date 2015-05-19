\version "2.18.2" \language "english" #(set-global-staff-size 24)

\markup \pad-around #2 \box \wordwrap {
  In the same vein, complete a series of V{z5} resolutions that form an ascending sequence.
}

theKey = { \key
  c \major
}

%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) }

\absolute { \theKey \lyCommands

  <e \xNote g' \xNote bf' c''>1
  <f \xNote f' \xNote a' c''>1
  <fs \xNote a' \xNote c'' d''>1
  <g \xNote g' \xNote b' d''>1
  <gs \xNote b' \xNote d'' e''>1
  <a \xNote a' \xNote c'' e''>1
  <a c'' e'' f''>1
  <b g' d'' f''>1
  <c' g' c'' e''>1
  <e g' c'' e''>1
  <f a' c'' d''>1
  <g g' b' d''>1
  <c e' c'' c''>1
  
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
