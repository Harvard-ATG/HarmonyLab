#!/bin/bash

echo "Exercise creating tool. First write a PROMPT."
read prompt

echo ""
echo "Specify the KEY. (Keynote in Lilypond English-language format, with \"m\" suffix for minor keys. Hit return for none.)"
read key

parsedKey=$(echo ${key} | sed -E 's/^$/none/;s/^ *([a-g][f|s]*) *$/\1 \\major/;s/^ *([a-g][f|s]*) *m *$/\1 \\minor/')

echo ""
echo "Specify the KEY SIGNATURE. (Enter \"=\" to match the key named above or, for a non-matching key signature, enter the desired number of \"#\" or \"b\".)"
read keySignatureInput

if [[ ${keySignatureInput} == "=" ]]; then
	keySignature=$(echo ${key} | sed -E 's/ *af *m */bbbbbbb/;s/ *ef *m */bbbbbb/;s/ *bf *m */bbbbb/;s/ *f *m */bbbb/;s/ *c *m */bbb/;s/ *g *m */bb/;s/ *d *m */b/;s/ *a *m *//;s/ *e *m */#/;s/ *b *m */##/;s/ *fs *m */###/;s/ *cs *m */####/;s/ *gs *m */#####/;s/ *ds *m */######/;s/ *as *m */#######/;s/cf */bbbbbbb/;s/ *gf */bbbbbb/;s/ *df */bbbbb/;s/ *af */bbbb/;s/ *ef */bbb/;s/ *bf */bb/;s/ *g */#/;s/ *d */##/;s/ *a */###/;s/ *e */####/;s/ *fs */######/;s/ *cs *m */#######/;s/ *f */b/;s/ *c *//')
else
	keySignature=$(echo ${keySignatureInput})
fi

echo ""
echo "Enter CHORDS. Use Lilypond English-language format, e.g. \"<a, a cs' e'>\" except that to hide a note, prefix it with \"x\".)"
read chords

# following script adds whole note duration to Lilypond code which future versions of HarmonyLab may not want
parsedChords=$(echo ${chords} | sed -E 's/x/\\xNote /g;s/>([ <])/>1\1/g;s/>$/>1/g')

echo ""
echo "Write some REVIEW text to show after the exercise is completed."
read review

echo ""
echo "Specify the DIRECTORY (exercise group)."
read directory

echo ""
echo "Specify the FILENAME (exercise number)."
read filename

txtPath="./txt/${directory}/${filename}.txt"

lyPath="./ly/${directory}/${filename}.ly"

jsonPath="./json/${directory}/${filename}.json"

echo ""
echo "Choose what note names to display:"
echo "  [1] note names"
echo "  [2] scientific pitch notation"
echo "  [3] neither"

read opt1

echo ""
echo "Choose what melodic analysis to display:"
echo "  [1] scale degrees"
echo "  [2] solfege"
echo "  [3] neither"

read opt2

echo ""
echo "Choose what harmonic analysis to display:"
echo "  [1] Roman numerals"
echo "  [2] intervals"
echo "  [3] neither"
echo "  [4] both"

read opt3

echo ""
echo "Choose what highlights to display:"
echo "  [1] roots"
echo "  [2] tritones"
echo "  [3] neither"
echo "  [4] both"

read opt4

mkdir -p ./txt/"$directory"

mkdir -p ./ly/"$directory"

mkdir -p ./json/"$directory"

cat >${txtPath} <<- _EOF_
	${prompt}
	${key}
	${keySignatureInput}
	${chords}
	${review}
	${directory}
	${filename}
	${opt1}
	${opt2}
	${opt3}
	${opt4}
	_EOF_

cat >${lyPath} <<- _EOF_
	\version "2.18.2" \language "english" #(set-global-staff-size 18)

	\paper { paper-height = 4.25\in paper-width = 5.5\in indent = 0 system-count = 1 page-count = 1 oddFooterMarkup = \markup \tiny { Exercise preview in Lilypond for HarmonyLab json file. } }

	\markup \small \left-column { \line { ${directory} } \line { ${filename} } }

	\markup \pad-around #3 \box \pad-markup #1 \wordwrap {
	  ${prompt}
	}

	theKey = { \key
	  ${parsedKey} % ${keySignature}
	}

	%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f \override Staff.BarLine #'stencil = ##f }

	\absolute { \theKey \lyCommands

	  ${parsedChords}

	} % end

	\markup \italic \pad-around #3 \box \pad-markup #1 \wordwrap {
	  ${review}
	}

	%{ % HarmonyLab options
	  "analysis": {
	    "enabled": true,
	    "mode": {
	_EOF_

if [[ "$opt1" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "note_names": true,
	      "scientific_pitch": false,
	_EOF_
elif [[ "$opt1" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "note_names": false,
	      "scientific_pitch": true,
	_EOF_
elif [[ "$opt1" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "note_names": false,
	      "scientific_pitch": false,
	_EOF_
else
	echo "Failed to set note-name analysis options."
fi

if [[ "$opt2" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "scale_degrees": true,
	      "solfege": false,
	_EOF_
elif [[ "$opt2" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "scale_degrees": false,
	      "solfege": true,
	_EOF_
elif [[ "$opt2" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "scale_degrees": false,
	      "solfege": false,
	_EOF_
else
	echo "Failed to set melodic analysis options."
fi

# following code assumes "intervals" is last item in array (no comma)
if [[ "$opt3" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": true,
	      "intervals": false
	_EOF_
elif [[ "$opt3" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": false,
	      "intervals": true
	_EOF_
elif [[ "$opt3" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": false,
	      "intervals": false
	_EOF_
elif [[ "$opt3" = "4" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": true,
	      "intervals": true
	_EOF_
else
	echo "Failed to set harmonic analysis options."
fi

cat >>${lyPath} <<- _EOF_
	    }
	  },
	  "highlight": {
	    "enabled": true,
	    "mode": {
	_EOF_

# following code assumes "tritonehiglight" is last item in array (no comma)
if [[ "$opt4" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": true,
	      "tritonehighlight": false
	_EOF_
elif [[ "$opt4" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": false,
	      "tritonehighlight": true
	_EOF_
elif [[ "$opt4" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": false,
	      "tritonehighlight": false
	_EOF_
elif [[ "$opt4" = "4" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": true,
	      "tritonehighlight": true
	_EOF_
else
	echo "Failed to set highlight options."
fi

cat >>${lyPath} <<- _EOF_
	    }
	  }
	%}
	_EOF_

# includes guard against hanging commas in json
parsedLy=$(cat ${lyPath} | sed -E -f ./ly2json.sed |\
	tr '\n' '\r' |\
	# removes hanging commas in json
	sed -E 's/,( *\r* *[]}])/\1/g;' |\
	tr '\r' '\n'\
)

cat >${jsonPath} <<- _EOF_
	{
	  "type": "matching",
	${parsedLy}
	}
	_EOF_

echo ""
echo "This is the json exercise file you created:"

cat ${jsonPath}
