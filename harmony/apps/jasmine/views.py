import logging

from django.shortcuts import render

def run_tests(request):
    return render(request, 'jasmine/index.html')
