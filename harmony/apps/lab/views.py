from django.shortcuts import render

def index(request):
    #return HttpResponse("Hello Werld. This is the Harmony Index.")
    return render(request, 'index.html')