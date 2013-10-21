# Developer Overview

Here's what you need to know to get started:

## Tech

- The app is written in Python and Javascript. Python on the backend (Django) and Javascript on the frontend.
- The javascript is loosely organized into modules using [requirejs](http://requirejs.org/). 
- The [Vex Flow](http://www.vexflow.com/) javascript library is used *extensively* to render musical notation. **Important**:  the Vex Flow library has been [forked and modified](https://github.com/arthurian/vexflow) for this project in order to implement a number of features, but most importantly, the ability to set the color of individual notes and accidentals. 

## Directory Structure

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

## Testing & QA

- To run the javascript tests go to the URL http://[host:port]/jasmine. For example, if you are running the app locally, point your browser to http://localhost:8000/jasmine. This will load all of the jasmine specs in the `js/spec` directory and run them.
- To run the javascript linter, jshint, make sure you have jshint installed on your machine `npm -g install jshint` and then run this command:

```
find harmony/static/js/src -type f -name "*.js" -print0 | xargs -0 jshint --config harmony/static/js/conf/jshintrc.json
```

- To run the django/python tests execute django admin test command: `./manage.py test`. You can read more about [django testing here](https://docs.djangoproject.com/en/dev/topics/testing/overview/).

## Build & Deploy

- To build the javascript, run `build-requirejs.py`. This script will run the requirejs optimizer on the sources and concatenate and minify them. To install the requirejs optimizer execute: `npm -g install requirejs`. 
- The result of running the build script will be two files:
  - `harmony/static/js/build/main-{version}.js` - the compiled javascript
  - `data/requirejs-build.json` - a JSON config with the {version} string. This JSON file may be loaded by the django settings module to configure `REQUIREJS_CONFIG`. See `harmony/settings/googleappengine.py` for example.

