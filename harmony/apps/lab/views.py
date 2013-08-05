from django.shortcuts import render
from django.conf import settings

import json

def index(request):
	return render(request, 'piano.html', { 
		'REQUIREJS_DEBUG': settings.REQUIREJS_DEBUG,
		'REQUIREJS_CONFIG': json.dumps(settings.REQUIREJS_CONFIG)
	})
