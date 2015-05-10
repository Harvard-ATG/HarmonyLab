#!/bin/bash

mkdir -p ./json

cd ./ly/

find . -type d >listOfSubdirectories.txt

cd ../json/

xargs mkdir -p <../ly/listOfSubdirectories.txt

cd ../ly/

for FILE in ./*/*.ly; do
	lyPath="./${FILE}"
	parsedLy=$(cat ${lyPath} | sed -E -f ../ly2json.sed |\
		tr '\n' '\r' |\
		# removes hanging commas in json
		sed -E 's/,( *\r* *[]}])/\1/g;' |\
		# inserts missing commas in chord array if Lilypond input had linebreaks
		sed -E 's/}(\r* *\{)/},\1/g' |\
		# removes possible hanging comma from end of Lilypond input
		sed -E 's/}, *\r* *$/}/' |\
		tr '\r' '\n'\
	)
	jsonPath="../json/`dirname ./${FILE}`/`basename ${FILE} .ly`.json"
	cat >${jsonPath} <<- _EOF_
	{
	  "type": "matching",
	  "reviewText": "",
	${parsedLy}
	}
	_EOF_
done
