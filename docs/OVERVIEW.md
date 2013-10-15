# Developer Overview

Here's what you need to know to get started:

## Tech

- The app is Written in Python and Javascript. Python on the backend (Django) and Javascript on the frontend (RequireJS).
- The javascript is loosely organized into modules using [requirejs](http://requirejs.org/). 
- The [Vex Flow](http://www.vexflow.com/) javascript library is used *extensively* to render musical notation. You should know that this library has been forked and modified for this project in order to implement a number of features, but most importantly, the ability to set the color of individual notes and accidentals. 

## Layout

- The overall application is structured like a normal [django](https://www.djangoproject.com/) project with some inspiration from [deploydjango](http://www.deploydjango.com/).
- The bulk of the application is javascript, so you should become familiar with the following directory structure:
```sh
```
