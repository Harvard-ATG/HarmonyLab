# remove empty lines and space at line ends
/^\s*$/d
s/[ \t]*$//

# remove line containing version statement
/\\version/d

# remove line with custom commands for Lilypond
/lyCommands =/d

# create chord field
s/^\\absolute [^<]*/  "chord": [/
s/} % end/  \],/

/</s/>([0-9]*) *</>\1\n  </g

# NB in future HarmonyLab may require duration information be preserved
/</s/ *<([ a-g',si\\xNote]*)>[0-9]*/    \{"visible":[\1],"hidden":[],},/g

# organize X-ed out notes into hidden category for HarmonyLab
:loop;/xNote/{s/"visible":\[([ a-g',si\\xNote]*)\\xNote ([a-g',si]*)([ a-g',si\\xNote]*)\],"hidden":\[([ a-g',si\\xNote]*)\]/"visible":\[\1\3],"hidden":[\2 \4]/;b loop}

# generate MIDI numbers, pass one (enharmonics) ...
/"visible"/ s/\bcf'/b/g
/"visible"/ s/\bcf/b,/g
/"visible"/ s/\bdf/cs/g
/"visible"/ s/\bds/ef/g
/"visible"/ s/\bes/f/g
/"visible"/ s/\bff/e/g
/"visible"/ s/\bgf/fs/g
/"visible"/ s/\baf/gs/g
/"visible"/ s/\bas/bf/g
/"visible"/ s/\bbs,/c/g
/"visible"/ s/\bbs/c'/g

# generate MIDI numbers, pass two
/"visible"/  s/\bc'''''/108/g

/"visible"/  s/\bc''''/96/g
/"visible"/ s/\bcs''''/97/g
/"visible"/  s/\bd''''/98/g
/"visible"/ s/\bef''''/99/g
/"visible"/  s/\be''''/100/g
/"visible"/  s/\bf''''/101/g
/"visible"/ s/\bfs''''/102/g
/"visible"/  s/\bg''''/103/g
/"visible"/ s/\bgs''''/104/g
/"visible"/  s/\ba''''/105/g
/"visible"/ s/\bbf''''/106/g
/"visible"/  s/\bb''''/107/g

/"visible"/  s/\bc'''/84/g
/"visible"/ s/\bcs'''/85/g
/"visible"/  s/\bd'''/86/g
/"visible"/ s/\bef'''/87/g
/"visible"/  s/\be'''/88/g
/"visible"/  s/\bf'''/89/g
/"visible"/ s/\bfs'''/90/g
/"visible"/  s/\bg'''/91/g
/"visible"/ s/\bgs'''/92/g
/"visible"/  s/\ba'''/93/g
/"visible"/ s/\bbf'''/94/g
/"visible"/  s/\bb'''/95/g

/"visible"/  s/\bc''/72/g
/"visible"/ s/\bcs''/73/g
/"visible"/  s/\bd''/74/g
/"visible"/ s/\bef''/75/g
/"visible"/  s/\be''/76/g
/"visible"/  s/\bf''/77/g
/"visible"/ s/\bfs''/78/g
/"visible"/  s/\bg''/79/g
/"visible"/ s/\bgs''/80/g
/"visible"/  s/\ba''/81/g
/"visible"/ s/\bbf''/82/g
/"visible"/  s/\bb''/83/g

/"visible"/  s/\bc'/60/g
/"visible"/ s/\bcs'/61/g
/"visible"/  s/\bd'/62/g
/"visible"/ s/\bef'/63/g
/"visible"/  s/\be'/64/g
/"visible"/  s/\bf'/65/g
/"visible"/ s/\bfs'/66/g
/"visible"/  s/\bg'/67/g
/"visible"/ s/\bgs'/68/g
/"visible"/  s/\ba'/69/g
/"visible"/ s/\bbf'/70/g
/"visible"/  s/\bb'/71/g

/"visible"/  s/\ba,,,/21/g
/"visible"/ s/\bbf,,,/22/g
/"visible"/  s/\bb,,,/23/g

/"visible"/  s/\bc,,/24/g
/"visible"/ s/\bcs,,/25/g
/"visible"/  s/\bd,,/26/g
/"visible"/ s/\bef,,/27/g
/"visible"/  s/\be,,/28/g
/"visible"/  s/\bf,,/29/g
/"visible"/ s/\bfs,,/30/g
/"visible"/  s/\bg,,/31/g
/"visible"/ s/\bgs,,/32/g
/"visible"/  s/\ba,,/33/g
/"visible"/ s/\bbf,,/34/g
/"visible"/  s/\bb,,/35/g

/"visible"/  s/\bc,/36/g
/"visible"/ s/\bcs,/37/g
/"visible"/  s/\bd,/38/g
/"visible"/ s/\bef,/39/g
/"visible"/  s/\be,/40/g
/"visible"/  s/\bf,/41/g
/"visible"/ s/\bfs,/42/g
/"visible"/  s/\bg,/43/g
/"visible"/ s/\bgs,/44/g
/"visible"/  s/\ba,/45/g
/"visible"/ s/\bbf,/46/g
/"visible"/  s/\bb,/47/g

/"visible"/  s/\bc\b/48/g
/"visible"/ s/\bcs\b/49/g
/"visible"/  s/\bd\b/50/g
/"visible"/ s/\bef\b/51/g
/"visible"/  s/\be\b/52/g
/"visible"/  s/\bf\b/53/g
/"visible"/ s/\bfs\b/54/g
/"visible"/  s/\bg\b/55/g
/"visible"/ s/\bgs\b/56/g
/"visible"/  s/\ba\b/57/g
/"visible"/ s/\bbf\b/58/g
/"visible"/  s/\bb\b/59/g

/"visible"/ s/\b([0-9]+)\b +\b([0-9]+)\b/\1,\2/g
/"visible"/ s/\b([0-9]+)\b +\b([0-9]+)\b/\1,\2/g
/"visible"/ s/\[ +/[/g
/"visible"/ s/ +\]/]/g

# remove commenting-out of HarmonyLab options
/HarmonyLab options/d
/^%\{$/d
/^%}$/d

# translate exercise annotation
/markup/{N;N;s/"/\\"/g;s/\\markup[^{]*\{\n *(.*)\n *}/  "introText": "\1",/}

# translate key statement
/theKey/{N;N;s/theKey += +\{ +\\key\n *([a-gs]+) +\\major\n *}/  "key": "j\1",/;s/theKey += +\{ +\\key\n *([a-gs]+) +\\minor\n *}/  "key": "i\1",/}

s/"jcf"/"jCb"/
s/"jgf"/"jGb"/
s/"jdf"/"jDb"/
s/"jaf"/"jAb"/
s/"jef"/"jEb"/
s/"jbf"/"jBb"/
s/"jf"/"jF_"/
s/"jc"/"jC_"/
s/"jg"/"jG_"/
s/"jd"/"jD_"/
s/"ja"/"jA_"/
s/"je"/"jE_"/
s/"jb"/"jB_"/
s/"jfs"/"jF#"/
s/"jcs"/"jC#"/

s/"iaf"/"iAb"/
s/"ief"/"iEb"/
s/"ibf"/"iBb"/
s/"if"/"iF_"/
s/"ic"/"iC_"/
s/"ig"/"iG_"/
s/"id"/"iD_"/
s/"ia"/"iA_"/
s/"ie"/"iE_"/
s/"ib"/"iB_"/
s/"ifs"/"iF#"/
s/"ics"/"iC#"/
s/"igs"/"iG#"/
s/"ids"/"iD#"/
s/"ias"/"iA#"/
