from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic import View, TemplateView
from django.core.urlresolvers import reverse
from ims_lti_py.tool_config import ToolConfig
from .exercise import Exercise

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
    Outputs LTI configuration XML for Canvas as specified in the IMS Global Common Cartridge Profile.

    The XML produced by this view can either be copy-pasted into the Canvas tool
    settings, or exposed as an endpoint to Canvas by linking to this view.

    See the Canvas API documentation about configuring tools via XML:

    https://canvas.instructure.com/doc/api/file.tools_xml.html

    Sample view output:

        <cartridge_basiclti_link
        xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0"
        xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0"
        xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imslticc_v1p0
        http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd
        http://www.imsglobal.org/xsd/imsbasiclti_v1p0
        http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0p1.xsd
        http://www.imsglobal.org/xsd/imslticm_v1p0
        http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd
        http://www.imsglobal.org/xsd/imslticp_v1p0
        http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">
        <blti:title>Harmony Labs</blti:title>
        <blti:description>
        This LTI tool helps instructors teach music theory to beginning music
        students.
        </blti:description>
        <blti:launch_url>http://localhost:8000/lab/</blti:launch_url>
        <blti:secure_launch_url>http://localhost:8000/lab/</blti:secure_launch_url>
        <blti:vendor/>
        <blti:extensions platform="canvas.instructure.com">
        <lticm:property name="privacy_level">public</lticm:property>
        <lticm:options name="course_navigation">
        <lticm:property name="text">Harmony Lab</lticm:property>
        <lticm:property name="enabled">true</lticm:property>
        </lticm:options>
        </blti:extensions>
        </cartridge_basiclti_link>

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

