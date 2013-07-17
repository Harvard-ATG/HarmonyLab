[![Build Status](https://travis-ci.org/Harvard-ATG/HarmonyLab.png?branch=master)](https://travis-ci.org/Harvard-ATG/HarmonyLab)

# Overview

Harmony Lab is an application for music theory students, faculty, and staff in higher ed or K-12 
who are learning to read and write music or who are instructing students in reading and writing music. 
The Harmony Lab suite is Open Source educational software that notates, teaches, tests, and corrects 
your harmony; unlike Sibelius and Finale this application enhances a learner's understanding of
harmony by providing instant feedback.

# Quickstart

- Requires [Python 2.7.x](http://python.org/download/releases/) and [Pip](http://www.pip-installer.org/) to install. 
- To install Pip, see [their instructions](http://www.pip-installer.org/en/latest/installing.html).
- Requires [Jazz Browser Plugin](http://jazz-soft.net/) to run.

```sh
$ git clone git@github.com:Harvard-ATG/HarmonyLab.git harmony
$ cd harmony
$ pip install -r requirements.txt
$ ./manage.py syncdb
$ ./manage.py runserver
```
You should now be able to run the application on your localhost at ```http://127.0.0.1:8000```. 
