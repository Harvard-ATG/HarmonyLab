#!/bin/bash

mkdir -p ./json

cd ./ly/

find . -type d >listOfSubdirectories.txt

cd ../json/

xargs mkdir -p <../ly/listOfSubdirectories.txt

cd ../ly/

for FILE in ./*/*.ly; do
	lyPath="./${FILE}"
	parsedLy=$(cat ${lyPath} | sed -r -f ../ly2json.sed )
	jsonPath="../json/`dirname ./${FILE}`/`basename ${FILE} .ly`.json"
	cat >${jsonPath} <<- _EOF_
	{
	  "type": "matching",
	  "reviewText": "",
	${parsedLy}
	}
	_EOF_
done
