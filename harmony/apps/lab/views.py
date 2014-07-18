from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic import View, TemplateView
from django.core.urlresolvers import reverse
from ims_lti_py.tool_config import ToolConfig
from braces.views import CsrfExemptMixin
from .exercise import Exercise

import json

REQUIRE_JS_CONTEXT = {
    'REQUIREJS_DEBUG': settings.REQUIREJS_DEBUG,
    'REQUIREJS_CONFIG': json.dumps(settings.REQUIREJS_CONFIG)
}


class HomeView(CsrfExemptMixin, TemplateView):
    template_name = "piano.html"

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context.update(REQUIRE_JS_CONTEXT)
        return context

    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)


class ExerciseView(View):
    def get(self, request, exercise_id, *args, **kwargs):
        exercise = self.get_exercise(exercise_id)

        context = {}
        context.update(REQUIRE_JS_CONTEXT)
        context.update({"exercise": exercise.as_json()})

        return render(request, "exercise.html", context)

    def get_exercise(self, exercise_id):
        return Exercise().load(exercise_id)


class ToolConfigView(View):
    """
    Need something here
    """
    def get(self, request, *args, **kwargs):
        if request.is_secure():
            host = 'https://' + request.get_host()
        else:
            host = 'http://' + request.get_host()

        url = host + reverse('lab:index')

        lti_tool_config = ToolConfig(
            title='Harmony Labs',
            launch_url=url,
            secure_launch_url=url,
        )
        # this is how to tell Canvas that this tool provides a course navigation link:
        account_nav_params = {
            'enabled': 'true',
            # optionally, supply a different URL for the link:
            # 'url': 'http://library.harvard.edu',
            'text': 'Harmony Labs',
        }
        lti_tool_config.set_ext_param('canvas.instructure.com', 'privacy_level', 'public')
        lti_tool_config.set_ext_param('canvas.instructure.com', 'course_navigation', account_nav_params)
        lti_tool_config.description = 'This LTI tool allows instructors to create and link blogs to a course site.'

        resp = HttpResponse(lti_tool_config.to_xml(), content_type='text/xml', status=200)
        return resp

