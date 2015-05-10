\version "2.18.2" \language "english"
\markup {Complete the major triad above the given root (in close position).}
theKey = { \key c \major }
\absolute { \theKey << { <f'>1 } \\ { <a' c''> } >> }
