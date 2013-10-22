# Shared Hosting

This document describes the steps necessary to run this application as a CGI in a shared hosting environment. It is based on [this blog post about running django as a CGI](http://joemaller.com/1467/django-via-cgi-on-shared-hosting/).

Here's a basic outline of what needs to be done:

1. Create a directory in your shared hosting environment to hold the application and all of its dependencies.
1. Install [virtualenv](http://www.virtualenv.org/) locally into that directory.
1. Checkout branch [feature/runascgi](/Harvard-ATG/HarmonyLab/tree/feature/runascgi).
1. Run `pip install -r requirements.txt` to install the dependencies into the virtualenv that you installed.
1. Modify the hard-coded paths in cgiwrapper.py as necessary.
1. Modify the `STATIC_URL` in harmony/settings/sitesfas.py as necessary.
1. Point your browser to the cgiwrapper.py script. If all goes well, it should be executed as a CGI.
