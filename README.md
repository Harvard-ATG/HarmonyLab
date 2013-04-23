# Overview

Harmony Lab is an application for music theory students, faculty, and staff in higher ed or K-12 
who are learning to read and write music or who are instructing students in reading and writing music. 
The Harmony Lab suite is Open Source educational software that notates, teaches, tests, and corrects 
your harmony; unlike Sibelius and Finale this application enhances a learner's understanding of
harmony by providing instant feedback.

# Quickstart

Requires [http://python.org/download/releases/](Python 2.7.x) and [Pip](http://www.pip-installer.org/).

```sh
$ git clone git@github.com:Harvard-ATG/HarmonyLab.git harmony
$ cd harmony
$ pip install -r requirements.txt
$ django-admin.py syncdb
$ django-admin.py runserver
```
