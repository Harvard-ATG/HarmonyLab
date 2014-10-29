#!/bin/bash

for FILE in ./ly/*.ly; do
  sed -r -f ./ly2json.sed <"./${FILE}" >"./json/`basename ${FILE} .ly`.json" ;
  # mate-open "./json/`basename ${FILE} .ly`.json" ;
done