# Shared Hosting

This document describes the steps necessary to run this application as a CGI in a shared hosting environment. It is based on [this blog post about running django as a CGI](http://joemaller.com/1467/django-via-cgi-on-shared-hosting/).

Here's a basic outline of what needs to be done:

1. Create a directory in your shared hosting environment to hold the application and all of its dependencies.
1. Install [virtualenv](http://www.virtualenv.org/) locally into that directory and follow the directions to activate it.
1. Clone the app into a local directory: `git clone https://github.com/Harvard-ATG/HarmonyLab.git` 
1. Run `pip install -r requirements.txt` to install the dependencies into the virtualenv that you have installed and activated.
1. Modify the hard-coded paths in runascgi.py (location of django library, django settings module, etc).
1. Modify and uncomment the `STATIC_URL` in harmony/settings/sharedhosting.py if necessary.

If the above worked, you should be able to point your browser to the runascgi.py script and it should run the application.
