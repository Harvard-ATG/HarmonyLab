from django.http import HttpResponse
from django.shortcuts import redirect
from django.core.urlresolvers import reverse
from django.contrib.auth import logout
from django.views.generic import View
from ims_lti_py.tool_config import ToolConfig
from braces.views import CsrfExemptMixin, LoginRequiredMixin

from .models import LTIConsumer, LTICourse

def logout_view(request):
    logout(request)
    return redirect("lti:logged-out")

def logged_out_view(request):
    return HttpResponse('Logged out successfully.')

class LTILaunchView(CsrfExemptMixin, LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        '''Shows an error message because LTI launch requests must be POSTed.'''
        content = 'Invalid LTI launch request.'
        return HttpResponse(content, content_type='text/html', status=200)

    def post(self, request, *args, **kwargs):
        '''Handles the LTI launch request and redirects to the main page. '''
        
        # Collect a subset of the LTI launch parameters for mapping the
        # tool consumer instance to this app's internal course instance.
        launch = {
            "consumer_key": request.POST.get('oauth_consumer_key', None),
            "resource_link_id": request.POST.get('resource_link_id', None),
            "context_id": request.POST.get('context_id', None),
            "course_name_short": request.POST.get("context_label"),
            "course_name": request.POST.get("context_title"),
            "canvas_course_id": request.POST.get('custom_canvas_course_id', None),
        }
        
        # Lookup tool consumer instance, uniquely identified by the
        # combination of: oauth consumer key and resource link ID, which
        # are the only required attributes specified by LTI. If none is found,
        # setup a new course instance associated with the tool consumer instance.
        identifiers = [launch[x] for x in ('consumer_key', 'resource_link_id')]
        if LTIConsumer.hasCourse(*identifiers):
            lti_consumer = LTIConsumer.getConsumer(*identifiers)
        else:
            lti_consumer = LTIConsumer.setupCourse(launch)
        
        # Save the course ID in the session
        course_id = lti_consumer.course.id
        request.session['course_id'] = course_id
        
        # Redirect back to the index.
        return redirect(reverse('lab:course-index', kwargs={"course_id": course_id}))

class LTIToolConfigView(View):
    TOOL_TITLE = 'Harmony Lab'
    LAUNCH_URL = 'lti:launch'
    """
    Outputs LTI configuration XML for Canvas as specified in the IMS Global Common Cartridge Profile.

    The XML produced by this view can either be copy-pasted into the Canvas tool
    settings, or exposed as an endpoint to Canvas by linking to this view.
    """
    def get_launch_url(self, request):
        '''
        Returns the launch URL for the LTI tool. When a secure request is made,
        a secure launch URL will be supplied.
        '''
        host = 'https://' + request.get_host()
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
            'enabled': 'true', 
            'default': 'disabled',
            'text': self.TOOL_TITLE, 
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

