\version "2.18.2" \language "english"
\markup {Complete the minor triad above the given root (in close position).}
theKey = { \key c \major }
\absolute { \theKey << { <a>1 } \\ { <c' e'> } >> }
