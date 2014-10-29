# s/input/output/g

s/^\\version "2.18.2" \\language "english"$/\{\n  "type": "matching",\n  "reviewText": "Good job!",/g

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

# PROBLEM: the following replacements interfere with possible entries for introText (especially the word "a"). ly2json must be changed to apply these replacements in the "chord" line only.

s/\bc''/72/g
s/\bcs''/73/g
s/\bd''/74/g
s/\bef''/75/g
s/\be''/76/g
s/\bf''/77/g
s/\bfs''/78/g
s/\bg''/79/g
s/\bgs''/80/g
s/\ba''/81/g
s/\bbf''/82/g
s/\bb''/83/g

s/\bc'/60/g
s/\bcs'/61/g
s/\bd'/62/g
s/\bef'/63/g
s/\be'/64/g
s/\bf'/65/g
s/\bfs'/66/g
s/\bg'/67/g
s/\bgs'/68/g
s/\ba'/69/g
s/\bbf'/70/g
s/\bb'/71/g

s/\bc,/36/g
s/\bcs,/37/g
s/\bd,/38/g
s/\bef,/39/g
s/\be,/40/g
s/\bf,/41/g
s/\bfs,/42/g
s/\bg,/43/g
s/\bgs,/44/g
s/\ba,/45/g
s/\bbf,/46/g
s/\bb,/47/g

s/\bc\b/48/g
s/\bcs\b/49/g
s/\bd\b/50/g
s/\bef\b/51/g
s/\be\b/52/g
s/\bf\b/53/g
s/\bfs\b/54/g
s/\bg\b/55/g
s/\bgs\b/56/g
s/\ba\b/57/g
s/\bbf\b/58/g
s/\bb\b/59/g

s/\b([0-9]+)\b \b([0-9]+)\b/\1,\2/g
s/\b([0-9]+)\b \b([0-9]+)\b/\1,\2/g

s/<([,0-9]+)>[1-8]*/\[\1]/g
s/<>/\[]/g

s/] \[/],\[/g
s/} \{/},\{/g
s/} \[/},\[/g
s/] \{/],\{/g
