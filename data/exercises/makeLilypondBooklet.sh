#!/bin/bash

mkdir -p ./preview

cd ./ly/

find . -type d >listOfSubdirectories.txt

cd ../preview/

xargs mkdir -p <../ly/listOfSubdirectories.txt

cd ../ly/

for FILE in ./*/*.ly; do
	lilypond --output=../preview/`dirname ./${FILE}`/ ${FILE}
done

cd ..

pdftk ./preview/*/*.pdf cat output ./LilypondBooklet.pdf

echo "Remove preview directory? (Type y for yes.)"
read yn
if [[ "$yn" = "y" ]]; then
	rm -r ./preview/
else
	exit
fi

