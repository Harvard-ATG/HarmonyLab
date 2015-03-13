#!/bin/bash

mkdir -p ./json

cd ./ly/

find . -type d >listOfSubdirectories.txt

cd ../json/

xargs mkdir -p <../ly/listOfSubdirectories.txt

cd ../ly/

for FILE in ./*.ly; do
  sed -r -f ../ly2json.sed <"./${FILE}" >"../json/`basename ${FILE} .ly`.json" ;
  # mate-open "../json/`basename ${FILE} .ly`.json" ;
done

for FILE in ./*/*.ly; do
  sed -r -f ../ly2json.sed <"./${FILE}" >"../json/`dirname ./${FILE}`/`basename ${FILE} .ly`.json" ;
  # mate-open "../json/`dirname ./${FILE} .ly`/`basename ${FILE} .ly`.json" ;
done
