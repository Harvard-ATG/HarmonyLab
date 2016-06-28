# remove empty lines and space at line ends
/^\s*$/d
s/[ \t]*$//

# remove line containing version statement
/\\version/d

# remove line containing paper settings for Lilypond
/\\paper/d

# remove line with custom commands for Lilypond
/lyCommands =/d

# create chord field
s/^\\absolute [^<]*/  "chord": [/
s/} % end/  \],/

/</ s/>([0-9]*) *</>\1,\n  </g

# NB in future HarmonyLab may require duration information be preserved
/</ s/ *<([ a-gs',\\xNote]*)>[0-9]*/    \{"visible":[\1],"hidden":[]}/g

# organize Xed out notes into hidden category for HarmonyLab
:loop;/xNote/{s/"visible":\[([ a-gs',]*)\\xNote  *([a-gs',]*)([ a-gs',\\xNote]*)\],"hidden":\[([ a-gs',\\xNote]*)\]/"visible":\[\1\3],"hidden":[\2 \4]/;b loop}

# generate MIDI numbers, pass one of two (enharmonics)
/"visible"/ s/([[ ])cf'/\1b/g
/"visible"/ s/([[ ])cf/\1b,/g
/"visible"/ s/([[ ])df/\1cs/g
/"visible"/ s/([[ ])ds/\1ef/g
/"visible"/ s/([[ ])es/\1f/g
/"visible"/ s/([[ ])ff/\1e/g
/"visible"/ s/([[ ])gf/\1fs/g
/"visible"/ s/([[ ])af/\1gs/g
/"visible"/ s/([[ ])as/\1bf/g
/"visible"/ s/([[ ])bs,/\1c/g
/"visible"/ s/([[ ])bs/\1c'/g

# generate MIDI numbers, pass two of two
/"visible"/  s/([[ ])c'''''/\1108/g

/"visible"/  s/([[ ])c''''/\196/g
/"visible"/ s/([[ ])cs''''/\197/g
/"visible"/  s/([[ ])d''''/\198/g
/"visible"/ s/([[ ])ef''''/\199/g
/"visible"/  s/([[ ])e''''/\1100/g
/"visible"/  s/([[ ])f''''/\1101/g
/"visible"/ s/([[ ])fs''''/\1102/g
/"visible"/  s/([[ ])g''''/\1103/g
/"visible"/ s/([[ ])gs''''/\1104/g
/"visible"/  s/([[ ])a''''/\1105/g
/"visible"/ s/([[ ])bf''''/\1106/g
/"visible"/  s/([[ ])b''''/\1107/g

/"visible"/  s/([[ ])c'''/\184/g
/"visible"/ s/([[ ])cs'''/\185/g
/"visible"/  s/([[ ])d'''/\186/g
/"visible"/ s/([[ ])ef'''/\187/g
/"visible"/  s/([[ ])e'''/\188/g
/"visible"/  s/([[ ])f'''/\189/g
/"visible"/ s/([[ ])fs'''/\190/g
/"visible"/  s/([[ ])g'''/\191/g
/"visible"/ s/([[ ])gs'''/\192/g
/"visible"/  s/([[ ])a'''/\193/g
/"visible"/ s/([[ ])bf'''/\194/g
/"visible"/  s/([[ ])b'''/\195/g

/"visible"/  s/([[ ])c''/\172/g
/"visible"/ s/([[ ])cs''/\173/g
/"visible"/  s/([[ ])d''/\174/g
/"visible"/ s/([[ ])ef''/\175/g
/"visible"/  s/([[ ])e''/\176/g
/"visible"/  s/([[ ])f''/\177/g
/"visible"/ s/([[ ])fs''/\178/g
/"visible"/  s/([[ ])g''/\179/g
/"visible"/ s/([[ ])gs''/\180/g
/"visible"/  s/([[ ])a''/\181/g
/"visible"/ s/([[ ])bf''/\182/g
/"visible"/  s/([[ ])b''/\183/g

/"visible"/  s/([[ ])c'/\160/g
/"visible"/ s/([[ ])cs'/\161/g
/"visible"/  s/([[ ])d'/\162/g
/"visible"/ s/([[ ])ef'/\163/g
/"visible"/  s/([[ ])e'/\164/g
/"visible"/  s/([[ ])f'/\165/g
/"visible"/ s/([[ ])fs'/\166/g
/"visible"/  s/([[ ])g'/\167/g
/"visible"/ s/([[ ])gs'/\168/g
/"visible"/  s/([[ ])a'/\169/g
/"visible"/ s/([[ ])bf'/\170/g
/"visible"/  s/([[ ])b'/\171/g

/"visible"/  s/([[ ])a,,,/\121/g
/"visible"/ s/([[ ])bf,,,/\122/g
/"visible"/  s/([[ ])b,,,/\123/g

/"visible"/  s/([[ ])c,,/\124/g
/"visible"/ s/([[ ])cs,,/\125/g
/"visible"/  s/([[ ])d,,/\126/g
/"visible"/ s/([[ ])ef,,/\127/g
/"visible"/  s/([[ ])e,,/\128/g
/"visible"/  s/([[ ])f,,/\129/g
/"visible"/ s/([[ ])fs,,/\130/g
/"visible"/  s/([[ ])g,,/\131/g
/"visible"/ s/([[ ])gs,,/\132/g
/"visible"/  s/([[ ])a,,/\133/g
/"visible"/ s/([[ ])bf,,/\134/g
/"visible"/  s/([[ ])b,,/\135/g

/"visible"/  s/([[ ])c,/\136/g
/"visible"/ s/([[ ])cs,/\137/g
/"visible"/  s/([[ ])d,/\138/g
/"visible"/ s/([[ ])ef,/\139/g
/"visible"/  s/([[ ])e,/\140/g
/"visible"/  s/([[ ])f,/\141/g
/"visible"/ s/([[ ])fs,/\142/g
/"visible"/  s/([[ ])g,/\143/g
/"visible"/ s/([[ ])gs,/\144/g
/"visible"/  s/([[ ])a,/\145/g
/"visible"/ s/([[ ])bf,/\146/g
/"visible"/  s/([[ ])b,/\147/g

/"visible"/  s/([[ ])c([] ])/\148\2/g
/"visible"/ s/([[ ])cs([] ])/\149\2/g
/"visible"/  s/([[ ])d([] ])/\150\2/g
/"visible"/ s/([[ ])ef([] ])/\151\2/g
/"visible"/  s/([[ ])e([] ])/\152\2/g
/"visible"/  s/([[ ])f([] ])/\153\2/g
/"visible"/ s/([[ ])fs([] ])/\154\2/g
/"visible"/  s/([[ ])g([] ])/\155\2/g
/"visible"/ s/([[ ])gs([] ])/\156\2/g
/"visible"/  s/([[ ])a([] ])/\157\2/g
/"visible"/  s/([[ ])a([] ])/\157\2/g
/"visible"/ s/([[ ])bf([] ])/\158\2/g
/"visible"/  s/([[ ])b([] ])/\159\2/g

/"visible"/ s/([0-9][0-9]*)  *([0-9][0-9]*)/\1,\2/g
/"visible"/ s/([0-9][0-9]*)  *([0-9][0-9]*)/\1,\2/g
/"visible"/ s/\[  */[/g
/"visible"/ s/  *\]/]/g

# remove commenting-out of HarmonyLab options
/HarmonyLab options/d
/^%\{$/d
/^%}$/d

# remove directory and filename statement
/\\small/d

# translate exercise review text
/\\italic/{
N
N
s/"/\\"/g;s/\\markup[^{]*\{\n *(.*)\\strut\n *}/  "reviewText": "\1",/;
}

# translate exercise prompt
/markup/{
N
N
s/"/\\"/g;s/\\markup[^{]*\{\n *(.*)\\strut\n *}/  "introText": "\1",/;
}

# translate key statement
/theKey/{
N
N
s/theKey *= *\{ *\\key *\n *([a-g][fs]*)  *\\major *% *([hij][A-G]*[b_#]*) *\n *}/  "keySignature": "j\1",\
  "key": "\2",/;s/theKey *= *\{ *\\key *\n *([a-g][fs]*)  *\\minor *% *([hij][A-G]*[b_#]*) *\n *}/  "keySignature": "i\1",\
  "key": "\2",/;s/theKey *= *\{ *\\key *\n *([a-g][fs]*)  *\\major *\n *}/  "keySignature": "j\1",\
  "key": "j\1",/;s/theKey *= *\{ *\\key *\n *([a-g][fs]*)  *\\minor *\n *}/  "keySignature": "i\1",\
  "key": "i\1",/
}

/"keySignature"/ s/"jcf"/"bbbbbbb"/;s/"jgf"/"bbbbbb"/;s/"jdf"/"bbbbb"/;s/"jaf"/"bbbb"/;s/"jef"/"bbb"/;s/"jbf"/"bb"/;s/"jf"/"b"/;s/"jc"/""/;s/"jg"/"#"/;s/"jd"/"##"/;s/"ja"/"###"/;s/"je"/"####"/;s/"jb"/"#####"/;s/"jfs"/"######"/;s/"jcs"/"#######"/;s/"iaf"/"bbbbbbb"/;s/"ief"/"bbbbbb"/;s/"ibf"/"bbbbb"/;s/"if"/"bbbb"/;s/"ic"/"bbb"/;s/"ig"/"bb"/;s/"id"/"b"/;s/"ia"/""/;s/"ie"/"#"/;s/"ib"/"##"/;s/"ifs"/"###"/;s/"ics"/"####"/;s/"igs"/"#####"/;s/"ids"/"######"/;s/"ias"/"#######"/

/"key"/ s/"jcf"/"jCb"/;s/"jgf"/"jGb"/;s/"jdf"/"jDb"/;s/"jaf"/"jAb"/;s/"jef"/"jEb"/;s/"jbf"/"jBb"/;s/"jf"/"jF_"/;s/"jc"/"jC_"/;s/"jg"/"jG_"/;s/"jd"/"jD_"/;s/"ja"/"jA_"/;s/"je"/"jE_"/;s/"jb"/"jB_"/;s/"jfs"/"jF#"/;s/"jcs"/"jC#"/;s/"iaf"/"iAb"/;s/"ief"/"iEb"/;s/"ibf"/"iBb"/;s/"if"/"iF_"/;s/"ic"/"iC_"/;s/"ig"/"iG_"/;s/"id"/"iD_"/;s/"ia"/"iA_"/;s/"ie"/"iE_"/;s/"ib"/"iB_"/;s/"ifs"/"iF#"/;s/"ics"/"iC#"/;s/"igs"/"iG#"/;s/"ids"/"iD#"/;s/"ias"/"iA#"/
