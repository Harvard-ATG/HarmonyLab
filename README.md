[![Build Status](https://travis-ci.org/Harvard-ATG/HarmonyLab.png?branch=master)](https://travis-ci.org/Harvard-ATG/HarmonyLab)

# Overview

Harmony Lab is an application for music theory students, faculty, and staff in higher ed or K-12 
who are learning to read and write music or who are instructing students in reading and writing music. 
The Harmony Lab suite is Open Source educational software that notates, teaches, tests, and corrects 
your harmony; unlike Sibelius and Finale this application enhances a learner's understanding of
harmony by providing instant feedback.


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


