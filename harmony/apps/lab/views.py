from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic import View, TemplateView

from .exercise import Exercise

import json

REQUIRE_JS_CONTEXT = {
    'REQUIREJS_DEBUG': settings.REQUIREJS_DEBUG,
    'REQUIREJS_CONFIG': json.dumps(settings.REQUIREJS_CONFIG)
}

class PlayView(TemplateView):
    template_name = "play.html"
    def get_context_data(self, **kwargs):
        context = super(PlayView, self).get_context_data(**kwargs)
        context.update(REQUIRE_JS_CONTEXT)
        return context

class ExerciseView(View):
    def get(self, request, exercise_id, *args, **kwargs):
        exercise = self.get_exercise(exercise_id)

        context = {}
        context.update(REQUIRE_JS_CONTEXT)
        context.update({"exercise_json": exercise.as_json()})

        return render(request, "exercise.html", context)

    def get_exercise(self, exercise_id):
        return Exercise().load(exercise_id)
