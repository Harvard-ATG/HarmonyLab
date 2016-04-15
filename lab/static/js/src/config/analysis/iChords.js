// The input is a list of mod-12 integers that indicate the pitch classes 
// present, taking pc 0 to be the keynote. "y" stands for pc 10 and "z" for 
// pc 11. The initial integer, to the left of the forward slash, specifies 
// the pitch class of the bass; the remaining pitch classes are listed in 
// increasing numerical order.

// Characters entered inside {} braces will be rendered as follows by the
// font Sebastian-FigBass-Harvard.woff:
//    Z, U --> figured bass characters 6, 7 on upper row
//    e, r, t, z, u, d, ' --> figured bass characters 3, 4, 5, 6, 7, +, #
//                            on main row
//    2, 3, 4, 5 --> figured bass characters 2, 3, 4, 5 on lower row
//    C, K --> flat, sharp signs to precede Roman numerals

// The priority field contains an interpretation of learning priorities.
// (1 = learn first, 99 = learn last)

/* global define: false */

define({

   // i

   "0/37":  {"root": "0", "label": "i"},
   "0/3":   {"root": "0", "label": "i{e}"},
   "3/07":  {"root": "0", "label": "i{z}"},
   "7/03":  {"root": "7", "label": "i{z4}"},

   "0/37y": {"root": "0", "label": "i{u}"},
   "3/07y": {"root": "0", "label": "i{z5}"},
   "7/03y": {"root": "0", "label": "i{r3}"},
   "y/037": {"root": "0", "label": "i{r2}"},

   // i#

   "0/47":  {"root": "0", "label": "i{'}"},
   "0/4":   {"root": "0", "label": "i{'e}"},

   // V/iv

   "4/07":  {"root": "0", "label": "V{z}/iv"},
   "7/04":  {"root": "0", "label": "V{z4}/iv"},

   "0/47y": {"root": "0", "label": "V{u}/iv"},
   "0/4y":  {"root": "0", "label": "V{u3}/iv"},
   "4/07y": {"root": "0", "label": "V{z5}/iv"},
   "7/04y": {"root": "0", "label": "V{r3}/iv"},
   "y/047": {"root": "0", "label": "V{r2}/iv"},

   // i+6

   "0/379": {"root": "0", "label": "i{dz}"},

   // bII (a.k.a. N)

   "1/58":  {"root": "1", "label": "♭II"},
   "5/18":  {"root": "1", "label": "♭II{z}"},
   "8/15":  {"root": "1", "label": "♭II{z4}"},

   "1/058": {"root": "1", "label": "♭II{u}"},
   "5/018": {"root": "1", "label": "♭II{z5}"},
   "8/015": {"root": "1", "label": "♭II{r3}"},
   "0/158": {"root": "1", "label": "♭II{r2}"},

   // iio

   "2/58":  {"root": "2", "label": "ii°"},
   "5/28":  {"root": "2", "label": "ii°{z}"},
   "8/25":  {"root": "2", "label": "ii{z4}"},

   "2/058": {"root": "2", "label": "ii⌀{u}"},
   "5/028": {"root": "2", "label": "ii⌀{z5}", "altLabel": "iv{dz}"},
   "5/02":  {"root": "2", "label": "ii⌀{z5}"},
   "8/025": {"root": "2", "label": "ii⌀{r3}"},
   "0/258": {"root": "2", "label": "ii⌀{r2}"},

   // [!]ii
   
   "2/59":  {"root": "2", "label": "[!]ii"},
   "5/29":  {"root": "2", "label": "[!]ii{z}"},

   "2/059": {"root": "2", "label": "[!]ii{u}"},
   "5/029": {"root": "2", "label": "[!]ii{z5}"},
   "9/025": {"root": "2", "label": "[!]ii{r3}"},
   "0/259": {"root": "2", "label": "[!]ii{r2}"},

   // II (a.k.a. V/V)

   "2/69":  {"root": "2", "label": "II"},
   "6/29":  {"root": "2", "label": "II{z}"},
   "9/26":  {"root": "2", "label": "II{z4}"},

   "2/069": {"root": "2", "label": "II{u}"},
   "2/06":  {"root": "2", "label": "II{u3}"},
   "6/029": {"root": "2", "label": "II{z5}"},
   "9/026": {"root": "2", "label": "II{r3}"},
   "0/269": {"root": "2", "label": "II{r2}"},

   // III

   "3/7y":  {"root": "3", "label": "III"},
   "7/3y":  {"root": "3", "label": "III{z}"},
   "y/37":  {"root": "3", "label": "III{z4}"},

   "3/27y":  {"root": "3", "label": "III{u}"},
   "7/23y":  {"root": "3", "label": "III{z5}"},
   "y/237":  {"root": "3", "label": "III{r3}"},
   "2/37y":  {"root": "3", "label": "III{r2}"},

   // V/VI

   "3/17y": {"root": "3", "label": "V{u}/VI"},
   "3/17":  {"root": "3", "label": "V{u3}/VI"},
   "7/13y": {"root": "3", "label": "V{z5}/VI"},
   "y/137": {"root": "3", "label": "V{r3}/VI"},
   "1/37y": {"root": "3", "label": "V{r2}/VI"},

   // viio/iv

   "4/7y":  {"root": "4", "label": "vii°/iv"},
   "7/4y":  {"root": "4", "label": "vii°{z}/iv"},

   "4/17y": {"root": "4", "label": "vii°{u}/iv"},
   "7/14y": {"root": "4", "label": "vii°{z5}/iv"},

   // iv

   "5/08":  {"root": "5", "label": "iv"},
   "8/05":  {"root": "5", "label": "iv{z}"},
   "0/58":  {"root": "5", "label": "iv{z4}"},

   "5/038": {"root": "5", "label": "iv{u}"},
   "8/035": {"root": "5", "label": "iv{z5}"},
   "0/358": {"root": "5", "label": "iv{r3}"},
   "3/058": {"root": "5", "label": "iv{r2}"},

   // IV

   "5/09":  {"root": "5", "label": "IV"},
   "9/05":  {"root": "5", "label": "IV{z}"},
   "0/59":  {"root": "5", "label": "IV{z4}"},

   "5/039": {"root": "5", "label": "IV{u}"},
   "5/39":  {"root": "5", "label": "IV{u3}"},
   "9/035": {"root": "5", "label": "IV{z5}"},
   "0/359": {"root": "5", "label": "IV{r3}"},
   "3/059": {"root": "5", "label": "IV{r2}"},

   // #ivo (a.k.a. viio/V)

   "6/09":  {"root": "6", "label": "♯iv°"},
   "9/06":  {"root": "6", "label": "♯iv°{z}"},
   "0/69":  {"root": "6", "label": "♯iv°{z4}"},

   "6/039": {"root": "6", "label": "♯iv°{u}"},
   "9/036": {"root": "6", "label": "♯iv°{z5}"},
   "0/369": {"root": "6", "label": "♯iv°{r3}"},
   "3/069": {"root": "6", "label": "♯iv°{r2}"},

   // V
   
   "7/2z": {"root": "7", "label": "V"},
   "7/z":  {"root": "7", "label": "V{e}"},
   "z/27": {"root": "7", "label": "V{z}"},
   "2/7z": {"root": "7", "label": "V{z4}"},
   
   "7/25z": {"root": "7", "label": "V{u}"},
   "7/5z":  {"root": "7", "label": "V{u3}"},
   "7/25":  {"root": "7", "label": "V{u5}"},
   "z/257": {"root": "7", "label": "V{z5}"},
   "2/57z": {"root": "7", "label": "V{r3}"},
   "5/27z": {"root": "7", "label": "V{r2}"},

   // v

   "7/2y":  {"root": "7", "label": "[!]v"},
   "y/27":  {"root": "7", "label": "v{z}"},

   // VI

   "8/03":  {"root": "8", "label": "VI"},
   "0/38":  {"root": "8", "label": "VI{z}"},
   "3/08":  {"root": "8", "label": "VI{z4}"},

   "8/037": {"root": "8", "label": "VI{u}"},
   "0/378": {"root": "8", "label": "VI{z5}"},
   "3/078": {"root": "8", "label": "VI{r3}"},
   "7/038": {"root": "8", "label": "VI{r2}"},

   // VII

   "y/25":  {"root": "y", "label": "VII"},
   "2/5y":  {"root": "y", "label": "VII{z}"},
   "5/2y":  {"root": "y", "label": "VII{z4}"},

   "y/258": {"root": "y", "label": "VII{u}"},
   "y/28":  {"root": "y", "label": "VII{u3}"},
   "2/58y": {"root": "y", "label": "VII{z5}"},
   "5/28y": {"root": "y", "label": "VII{r3}"},
   "8/25y": {"root": "y", "label": "VII{r2}"},

   // viio

   "z/25":  {"root": "z", "label": "vii°"},
   "2/5z":  {"root": "z", "label": "vii°{z}"},
   "5/2z":  {"root": "z", "label": "vii°{z4}"},

   "z/258": {"root": "z", "label": "vii°{u}"},
   "z/28":  {"root": "z", "label": "vii°{u3}"},
   "z/58":  {"root": "z", "label": "vii°{u5}"},
   "2/58z": {"root": "z", "label": "vii°{z5}"},
   "5/28z": {"root": "z", "label": "vii°{r3}"},
   "8/25z": {"root": "z", "label": "vii°{r2}"},

   // augmented-sixth chords

   "8/06":  {"root": "2", "label": "It.{z}"},
   "8/026": {"root": "2", "label": "Fr.{z}"},
   "8/036": {"root": "2", "label": "Ger.{z}"},
   "6/038": {"root": "2", "label": "Ger.{u}"},

   // Tristan chord
   
   "8/26z": {"root": "2", "label": "..."}

});
