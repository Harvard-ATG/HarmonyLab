#!/bin/bash

rm ./exercise*.pdf
lilypond ./ly/*.ly
pdftk ./exercise*.pdf cat output ./LilypondBooklet.pdf
rm ./exercise*.pdf