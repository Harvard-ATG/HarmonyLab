from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic import View, TemplateView, RedirectView
from django.core.urlresolvers import reverse
from ims_lti_py.tool_config import ToolConfig
from braces.views import CsrfExemptMixin, LoginRequiredMixin
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
        return Exercise(exercise_id).load()

class LTILaunchView(CsrfExemptMixin, LoginRequiredMixin, RedirectView):
    """
    LTI consumers will POST to this view.
    """
    pattern_name = 'lab:index'

    def get_context_data(self, **kwargs):
        context = super(PlayView, self).get_context_data(**kwargs)
        context.update(REQUIRE_JS_CONTEXT)
        return context

class LTIToolConfigView(View):
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
    # This is the tool title
    TOOL_TITLE = 'Harmony Lab'

    # This is the launch URL 
    LAUNCH_URL = 'lab:lti-launch'

    # This is how to tell Canvas that this tool provides a course navigation link:

    def get_launch_url(self, request):
        '''
        Returns the launch URL for the LTI tool. When a secure request is made,
        a secure launch URL will be supplied.
        '''
        if request.is_secure():
            host = 'https://' + request.get_host()
        else:
            host = 'http://' + request.get_host()
        return host + reverse(self.LAUNCH_URL);

    def set_extra_params(self, lti_tool_config):
        '''
        Sets extra parameters on the ToolConfig() instance using
        the following method or by directly mutating attributes 
        on the config:
        
        lti_tool_config.set_ext_param(ext_key, ext_params)
        lti_tool_config.description = "my description..."
        '''
        lti_tool_config.set_ext_param('canvas.instructure.com', 'privacy_level', 'public')
        lti_tool_config.set_ext_param('canvas.instructure.com', 'course_navigation', {
            'enabled':'true', 
			'default': 'disabled',
            'text':'Harmony Lab',
        })
        lti_tool_config.description = 'Harmony Lab is an application for music theory students and instructors.'

    def get_tool_config(self, request):
        '''
        Returns an instance of ToolConfig().
        '''
        launch_url = self.get_launch_url(request)
        return ToolConfig(
            title=self.TOOL_TITLE,
            launch_url=launch_url,
            secure_launch_url=launch_url,
        )

    def get(self, request, *args, **kwargs):
        '''
        Returns the LTI tool configuration as XML.
        '''
        lti_tool_config = self.get_tool_config(request)
        self.set_extra_params(lti_tool_config)
        return HttpResponse(lti_tool_config.to_xml(), content_type='text/xml', status=200)

