from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic import View, TemplateView

import json

REQUIRE_JS_CONTEXT = {
    'REQUIREJS_DEBUG': settings.REQUIREJS_DEBUG,
    'REQUIREJS_CONFIG': json.dumps(settings.REQUIREJS_CONFIG)
}

class HomeView(TemplateView):
    template_name = "piano.html"
    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context.update(REQUIRE_JS_CONTEXT)
        return context

class ExerciseView(View):
    def get(self, request, *args, **kwargs):
        context = {}
        context.update(REQUIRE_JS_CONTEXT)
        context.update({
            "exercise": {
                "introduction": "This exercise is about learning to play simple chords.",
                "problems": [
                    {
                        "type": "matching",
                        "key": "jC_",
                        "text": "Play the C major chord in root position (0,4,7)",
                        "notes": [60,64,67],
                    },
                    {
                        "type": "matching",
                        "key": "jF_",
                        "text": "Play the F major chord in root position (0,4,7)",
                        "notes": [65,69,72],
                    },
                ]
            }
        })

        context['exercise'] = json.dumps(context['exercise'], indent=4, separators=(',', ': '), sort_keys=True)

        return render(request, "exercise.html", context)