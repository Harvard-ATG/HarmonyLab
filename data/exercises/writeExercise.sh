#!/bin/bash

echo "Write a prompt."
read prompt

echo "Specify the key. (Keynote in Lilypond English-language format, with \"m\" suffix for minor keys.)"
read key

parsedKey=$(echo ${key} | sed --posix -E 's/^ *([a-g][f|s]*) *$/\1 \\major/;s/^ *([a-g][f|s]*) *m *$/\1 \\minor/')

echo "Enter chords. Use Lilypond English-language format, e.g. \"<a, a cs' e'>1\" except that to hide a note, prefix it with \"x\".)"
read chords

# following script adds whole note duration to Lilypond code which future versions of HarmonyLab may not want
parsedChords=$(echo ${chords} | sed --posix -E 's/x/\\xNote /g;s/>([ <])/>1\1/g;s/>$/>1/g')

echo "Specify the directory (exercise group)."
read directory

echo "Specify the filename (exercise number)."
read filename

txtPath="./txt/${directory}/${filename}.txt"

lyPath="./ly/${directory}/${filename}.ly"

jsonPath="./json/${directory}/${filename}.json"

echo "Choose what note names to display:"
echo "  [1] note names"
echo "  [2] scientific pitch notation"
echo "  [3] neither"

read opt1

echo "Choose what melodic analysis to display:"
echo "  [1] scale degrees"
echo "  [2] solfege"
echo "  [3] neither"

read opt2

echo "Choose what harmonic analysis to display:"
echo "  [1] Roman numerals"
echo "  [2] intervals"
echo "  [3] neither"
echo "  [4] both"

read opt3

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
	${chords}
	${opt1}
	${opt2}
	${opt3}
	${opt4}
	_EOF_

cat >${lyPath} <<- _EOF_
	\version "2.18.2" \language "english" #(set-global-staff-size 24)

	\markup \pad-around #2 \box \wordwrap {
	  ${prompt}
	}

	theKey = { \key
	  ${parsedKey}
	}

	%{ add no line breaks %} lyCommands = { \clef "alto" \override Staff.StaffSymbol.line-count = #11 \override Staff.StaffSymbol.line-positions = #'(10 8 6 4 2 -2 -2 -4 -6 -8 -10) \override Staff.TimeSignature #'stencil = ##f }

	\absolute { \theKey \lyCommands

	  ${parsedChords}

	} % end

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

if [[ "$opt3" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": true,
	      "intervals": false,
	_EOF_
elif [[ "$opt3" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": false,
	      "intervals": true,
	_EOF_
elif [[ "$opt3" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": false,
	      "intervals": false,
	_EOF_
elif [[ "$opt3" = "4" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roman_numerals": true,
	      "intervals": true,
	_EOF_
else
	echo "Failed to set harmonic analysis options."
fi

cat >>${lyPath} <<- _EOF_
	    },
	  },
	  "highlight": {
	    "enabled": true,
	    "mode": {
	_EOF_

if [[ "$opt4" = "1" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": true,
	      "tritonehighlight": false,
	_EOF_
elif [[ "$opt4" = "2" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": false,
	      "tritonehighlight": true,
	_EOF_
elif [[ "$opt4" = "3" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": false,
	      "tritonehighlight": false,
	_EOF_
elif [[ "$opt4" = "4" ]]; then
	cat >>${lyPath} <<- _EOF_
	      "roothighlight": true,
	      "tritonehighlight": true,
	_EOF_
else
	echo "Failed to set highlight options."
fi

cat >>${lyPath} <<- _EOF_
	    },
	  },
	%}
	_EOF_

parsedLy=$(cat ${lyPath} | sed --posix -E -f ./ly2json.sed )

cat >${jsonPath} <<- _EOF_
	{
	  "type": "matching",
	  "reviewText": "",
	${parsedLy}
	}
	_EOF_
