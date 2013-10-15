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
  $ cd harmony
  $ tree -d -L 2 harmony/static
  harmony/static
  ├── audio
  ├── css
  ├── img
  └── js
      ├── lib
      ├── spec
      └── src
  
  7 directories
  
  ```
  
  Key points about the above structure:
    - `js/lib` contains 3rd party javascript libraries such as Vex.Flow, jQuery, etc.
    - `js/spec` contains jasmine unit tests.
    - `js/src` contains the source code for app-specific libraries and scripts.
    
- Within the `js/src` directory you will find a `main.js`. This file is the only script that is explicitly loaded from `harmony/templates/piano.html`. It initializes the user interface and automatically loads all of its dependencies via [requirejs](http://requirejs.org/).
- Requirejs configuration is defined in `harmony/settings/common.py` under the name `REQUIREJS_CONFIG`. This config is passed into the `harmony/templates/base.html` template to configure requirejs. Note that this configuration can be modified on a per-environment basis. So for example, in development you want each file to be loaded separately for debugging purposes, however in production, you would prefer for a single minified and compressed file to be loaded. That can all be defined in the settings.py files.
 
## Build & Deploy

- To build the javascript, run `build-requirejs.py`. This script will run the requirejs optimizer and build the javascript into a single, versioned file that can be sent to the client instead of loading each module separately.
