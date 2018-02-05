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

```sh
$ git clone git@github.com:Harvard-ATG/HarmonyLab.git harmony
$ cd harmony
$ pip install -r requirements.txt
$ ./manage.py runserver
```
You should now be able to run the application on your localhost at ```http://127.0.0.1:8000```. 

# Supported Web Browsers
Chrome is currently the only browser supported, being the single browser that implements the WebMIDI specification. 

# Heroku Deployment

This application can be deployed to any platform that supports python and django. One such example is 
[heroku](https://heroku.com/), a cloud platform as a service provider, which makes it easy to deploy changes
directly from the git repository. 

Read the [Getting Started on Heroku with Python](https://devcenter.heroku.com/articles/getting-started-with-python#introduction)
instructions to get an idea of how it works. You will need to setup an account login and then create an "app".

The required  **Config Variables** that should be added on the app settings page are as follows:

```
SECRET_KEY = YOUR_RANDOM_LONG_PASSWORD
DJANGO_SETTINGS_MODULE = harmony.settings.heroku
LTI_OAUTH_CREDENTIALS = {"harmonykey":"harmonysecret"}
```

In the root directory of the git repo, use the heroku CLI to login and then deploy the code to heroku:

```bash
$ heroku login
$ git push heroku master
```

If the build succeeded, you should be able to visit the webpage of the app. Heroku provides a handy shortcut:

```bash
$ heroku open
```