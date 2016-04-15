[![Build Status](https://travis-ci.org/Harvard-ATG/HarmonyLab.png?branch=master)](https://travis-ci.org/Harvard-ATG/HarmonyLab)

# Overview

HarmonyLab is an Open-Source application for students of music theory and 
keyboard skills at college or in K-12. It works with input from a MIDI 
keyboard in a web browser to provide simple practice aids and exercises for 
learning tonal harmony. By bringing together tactile, visual, and aural 
elements, this software helps students to build a robust and ready knowledge 
of the fundamentals of melodic and harmonic grammar.

Working with the input from a MIDI keyboard (subject to key and key 
signature selections), the application notates pitch elements and provides 
various analytical notations for melody and harmony.

Demo: http://harmony-lab.appspot.com/

# Quickstart

- Requires [Python 2.7.x](http://python.org/download/releases/) and [Pip](http://www.pip-installer.org/) to install. 
- To install Pip, see [their instructions](http://www.pip-installer.org/en/latest/installing.html).
- Requires [Jazz Browser Plugin](http://jazz-soft.net/) to run.

```sh
$ git clone git@github.com:Harvard-ATG/HarmonyLab.git harmony
$ cd harmony
$ pip install -r requirements.txt
$ ./manage.py migrate
$ ./manage.py runserver
```
You should now be able to run the application on your localhost at ```http://127.0.0.1:8000```. 

# Supported Web Browsers

1. Firefox 
2. Safari 
3. Chrome**

** The Jazz Midi Plugin may not work if you are running Chrome v42 or later because Chrome [disabled NPAPI by default](https://threatpost.com/google-shuts-off-npapi-in-chrome/112295) and will completely remove the option at some point. You may be able to temporarily re-enable support for NPAPI via flags: ```chrome://flags/#enable-npapi```.  Alternatively, the plugin should work in [Firefox](http://www.getfirefox.com/).


