# s/input/output/g

s/^\\version "[0-9\.]+" \\language "english"$/\{\n  "type": "matching",\n  "reviewText": "",/g

s/^\\markup \{([^"]*)}$/  "introText": "\1",/g

s/^theKey = \{ \\key ([a-gs]+) \\major }$/  "key": "j\1",/g
s/^theKey = \{ \\key ([a-gs]+) \\minor }$/  "key": "i\1",/g

s/"jcf"/"jCb"/g
s/"jgf"/"jGb"/g
s/"jdf"/"jDb"/g
s/"jaf"/"jAb"/g
s/"jef"/"jEb"/g
s/"jbf"/"jBb"/g
s/"jf"/"jF_"/g
s/"jc"/"jC_"/g
s/"jg"/"jG_"/g
s/"jd"/"jD_"/g
s/"ja"/"jA_"/g
s/"je"/"jE_"/g
s/"jb"/"jB_"/g
s/"jfs"/"jF#"/g
s/"jcs"/"jC#"/g

s/"iaf"/"iAb"/g
s/"ief"/"iEb"/g
s/"ibf"/"iBb"/g
s/"if"/"iF_"/g
s/"ic"/"iC_"/g
s/"ig"/"iG_"/g
s/"id"/"iD_"/g
s/"ia"/"iA_"/g
s/"ie"/"iE_"/g
s/"ib"/"iB_"/g
s/"ifs"/"iF#"/g
s/"ics"/"iC#"/g
s/"igs"/"iG#"/g
s/"ids"/"iD#"/g
s/"ias"/"iA#"/g

s/^\\absolute \{ \\theKey (.*) }$/  "chord": \[\1]\n}/g
s/<< \{ ([^}]*) } \\\\ \{ ([^}]*) } >>/\{"visible":\1,"hidden":\2}/g

/"chord":/ s/\bcf'/b/g
/"chord":/ s/\bcf/b,/g
/"chord":/ s/\bdf/cs/g
/"chord":/ s/\bds/ef/g
/"chord":/ s/\bes/f/g
/"chord":/ s/\bff/e/g
/"chord":/ s/\bgf/fs/g
/"chord":/ s/\baf/gs/g
/"chord":/ s/\bas/bf/g
/"chord":/ s/\bbs,/c/g
/"chord":/ s/\bbs/c'/g

/"chord":/  s/\bc'''''/108/g

/"chord":/  s/\bc''''/96/g
/"chord":/ s/\bcs''''/97/g
/"chord":/  s/\bd''''/98/g
/"chord":/ s/\bef''''/99/g
/"chord":/  s/\be''''/100/g
/"chord":/  s/\bf''''/101/g
/"chord":/ s/\bfs''''/102/g
/"chord":/  s/\bg''''/103/g
/"chord":/ s/\bgs''''/104/g
/"chord":/  s/\ba''''/105/g
/"chord":/ s/\bbf''''/106/g
/"chord":/  s/\bb''''/107/g

/"chord":/  s/\bc'''/84/g
/"chord":/ s/\bcs'''/85/g
/"chord":/  s/\bd'''/86/g
/"chord":/ s/\bef'''/87/g
/"chord":/  s/\be'''/88/g
/"chord":/  s/\bf'''/89/g
/"chord":/ s/\bfs'''/90/g
/"chord":/  s/\bg'''/91/g
/"chord":/ s/\bgs'''/92/g
/"chord":/  s/\ba'''/93/g
/"chord":/ s/\bbf'''/94/g
/"chord":/  s/\bb'''/95/g

/"chord":/  s/\bc''/72/g
/"chord":/ s/\bcs''/73/g
/"chord":/  s/\bd''/74/g
/"chord":/ s/\bef''/75/g
/"chord":/  s/\be''/76/g
/"chord":/  s/\bf''/77/g
/"chord":/ s/\bfs''/78/g
/"chord":/  s/\bg''/79/g
/"chord":/ s/\bgs''/80/g
/"chord":/  s/\ba''/81/g
/"chord":/ s/\bbf''/82/g
/"chord":/  s/\bb''/83/g

/"chord":/  s/\bc'/60/g
/"chord":/ s/\bcs'/61/g
/"chord":/  s/\bd'/62/g
/"chord":/ s/\bef'/63/g
/"chord":/  s/\be'/64/g
/"chord":/  s/\bf'/65/g
/"chord":/ s/\bfs'/66/g
/"chord":/  s/\bg'/67/g
/"chord":/ s/\bgs'/68/g
/"chord":/  s/\ba'/69/g
/"chord":/ s/\bbf'/70/g
/"chord":/  s/\bb'/71/g

/"chord":/  s/\ba,,,/21/g
/"chord":/ s/\bbf,,,/22/g
/"chord":/  s/\bb,,,/23/g

/"chord":/  s/\bc,,/24/g
/"chord":/ s/\bcs,,/25/g
/"chord":/  s/\bd,,/26/g
/"chord":/ s/\bef,,/27/g
/"chord":/  s/\be,,/28/g
/"chord":/  s/\bf,,/29/g
/"chord":/ s/\bfs,,/30/g
/"chord":/  s/\bg,,/31/g
/"chord":/ s/\bgs,,/32/g
/"chord":/  s/\ba,,/33/g
/"chord":/ s/\bbf,,/34/g
/"chord":/  s/\bb,,/35/g

/"chord":/  s/\bc,/36/g
/"chord":/ s/\bcs,/37/g
/"chord":/  s/\bd,/38/g
/"chord":/ s/\bef,/39/g
/"chord":/  s/\be,/40/g
/"chord":/  s/\bf,/41/g
/"chord":/ s/\bfs,/42/g
/"chord":/  s/\bg,/43/g
/"chord":/ s/\bgs,/44/g
/"chord":/  s/\ba,/45/g
/"chord":/ s/\bbf,/46/g
/"chord":/  s/\bb,/47/g

/"chord":/  s/\bc\b/48/g
/"chord":/ s/\bcs\b/49/g
/"chord":/  s/\bd\b/50/g
/"chord":/ s/\bef\b/51/g
/"chord":/  s/\be\b/52/g
/"chord":/  s/\bf\b/53/g
/"chord":/ s/\bfs\b/54/g
/"chord":/  s/\bg\b/55/g
/"chord":/ s/\bgs\b/56/g
/"chord":/  s/\ba\b/57/g
/"chord":/ s/\bbf\b/58/g
/"chord":/  s/\bb\b/59/g

/"chord":/ s/\b([0-9]+)\b \b([0-9]+)\b/\1,\2/g
/"chord":/ s/\b([0-9]+)\b \b([0-9]+)\b/\1,\2/g

/"chord":/ s/<([,0-9]+)>[1-8]*/\[\1]/g
/"chord":/ s/<>/\[]/g

/"chord":/ s/] \[/],\[/g
/"chord":/ s/} \{/},\{/g
/"chord":/ s/} \[/},\[/g
/"chord":/ s/] \{/],\{/g
