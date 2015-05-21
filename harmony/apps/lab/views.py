from django.conf import settings
from django.contrib.auth import logout
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.utils.http import urlencode
from django.views.generic import View, TemplateView, RedirectView
from django.views.decorators.csrf import csrf_exempt, csrf_protect

from braces.views import CsrfExemptMixin, LoginRequiredMixin
from ims_lti_py.tool_config import ToolConfig
from django_auth_lti import const

from .objects import ExerciseRepository
from .decorators import role_required, course_authorization_required
from .verification import has_instructor_role
from .models import LTIConsumer, Course

import json
import copy


class RequirejsContext(object):
    def __init__(self, config, debug=True):
        self._debug = debug
        self._config = copy.deepcopy(config)
    
    def set_module_params(self, module_id, params):
        module_config = {}
        module_config.update(params)
        if 'config' not in self._config:
            self._config['config'] = {}
        if module_id not in self._config['config']:
            self._config['config'][module_id] = {}
        self._config['config'][module_id].update(module_config)
        return self
    
    def set_app_module(self, app_module_id):
        self.set_module_params('app/main', {'app_module': app_module_id})
        return self
    
    def add_to_view(self, view_context):
        view_context['requirejs'] = self
        return self

    def debug(self):
        if self._debug:
            return True
        return False

    def config_json(self):
        return json.dumps(self._config)
    


class RequirejsTemplateView(TemplateView):
    requirejs_app = None

    def __init__(self, *args, **kwargs):
        super(RequirejsTemplateView, self).__init__(*args, **kwargs)
        self.requirejs_context = RequirejsContext(settings.REQUIREJS_CONFIG, settings.REQUIREJS_DEBUG)
    
    def get_context_data(self, **kwargs):
        context = super(RequirejsTemplateView, self).get_context_data(**kwargs)
        self.requirejs_context.set_app_module(getattr(self, 'requirejs_app'))
        self.requirejs_context.add_to_view(context)
        return context



class RequirejsView(View):
    def __init__(self, *args, **kwargs):
        super(RequirejsView, self).__init__(*args, **kwargs)
        self.requirejs_context = RequirejsContext(settings.REQUIREJS_CONFIG, settings.REQUIREJS_DEBUG)



class PlayView(RequirejsTemplateView):
    template_name = "play.html"
    requirejs_app = 'app/components/app/play'

    def get_context_data(self, **kwargs):
        context = super(PlayView, self).get_context_data(**kwargs)

        context['has_manage_perm'] = False
        context['group_list'] = []
        if hasattr(self.request, 'LTI'):
            course_id = self.request.session.get('course_id', None)
            er = ExerciseRepository.create(course_id=course_id)
            context['group_list'] = er.getGroupList()
            context['has_manage_perm'] = has_instructor_role(self.request)
            if course_id is None:
                context['manage_url'] = reverse('lab:manage')
            else:
                context['manage_url'] = reverse('lab:course-manage', kwargs={"course_id":course_id})

        return context

class ExerciseView(RequirejsView):
    def get(self, request, course_id=None, group_name=None, exercise_name=None):
        context = {}
        er = ExerciseRepository.create(course_id=course_id)
        
        context['group_list'] = er.getGroupList()
        context['has_manage_perm'] = False
        if hasattr(self.request, 'LTI'): 
            context['has_manage_perm'] = has_instructor_role(request)
            if course_id is None:
                context['manage_url'] = reverse('lab:manage')
            else:
                context['manage_url'] = reverse('lab:course-manage', kwargs={"course_id":course_id})

        if exercise_name is not None and group_name is not None:
            exercise = er.findExerciseByGroup(group_name, exercise_name)
            if exercise is None:
                raise Http404("Exercise %s of group %s does not exist." % (exercise_name, group_name))
        elif exercise_name is None and group_name is not None:
            group = er.findGroup(group_name)
            if group is None:
                raise Http404("Exercise group %s does not exist." % group_name)
            exercise = group.first()
        elif exercise_name is not None and group_name is None:
            raise Http404("Group name required to get exercise %s." % exercise_name)
        else:
            group = er.getGroupAtIndex(0)
            if group is None:
                raise Http404("No exercises found.")
            exercise = group.first()

        exercise.load()
        exercise.selected = True
        exercise_context = {}
        exercise_context.update(exercise.asDict())
        exercise_context.update({
            "nextExercise": exercise.nextUrl(),
            "previousExercise": exercise.previousUrl(),
            "exerciseList": exercise.group.getList()
        })

        self.requirejs_context.set_app_module('app/components/app/exercise')
        self.requirejs_context.set_module_params('app/components/app/exercise', exercise_context)
        self.requirejs_context.add_to_view(context)
        
        return render(request, "exercise.html", context)


class ManageView(RequirejsView, LoginRequiredMixin):
    @method_decorator(course_authorization_required(source="arguments"))
    @method_decorator(role_required([const.ADMINISTRATOR,const.INSTRUCTOR], redirect_url='lab:not_authorized', raise_exception=True))
    def get(self, request, course_id=None):
        er = ExerciseRepository.create(course_id=course_id)
        context = {"course_label": "", "has_manage_perm": True}
        manage_params = {"group_list": er.getGroupList()}
        
        if course_id is None:
            context['manage_url'] = reverse('lab:manage')
            manage_params['exercise_api_url'] = reverse('lab:api-exercises')
        else:
            course_names = Course.getCourseNames(course_id)
            context['course_label'] = "%s (ID: %s)" % (course_names.get('name'), course_id)
            context['manage_url'] = reverse('lab:course-manage', kwargs={"course_id":course_id})
            manage_params['exercise_api_url'] = "%s?%s" % (reverse('lab:api-exercises'), urlencode({"course_id":course_id}))

        self.requirejs_context.set_app_module('app/components/app/manage')
        self.requirejs_context.set_module_params('app/components/app/manage', manage_params)
        self.requirejs_context.add_to_view(context)
        
        return render(request, "manage.html", context)


class APIView(View):
    api_version = 1
    def get(self, request):
        return HttpResponse(json.dumps({
            'url': reverse('lab:api'),
            'version': self.api_version
        }))

class APIGroupView(CsrfExemptMixin, View):
    def get(self, request):
        '''Public list of groups and exercises.'''
        course_id = request.GET.get('course_id', None)
        er = ExerciseRepository.create(course_id=course_id)
        data = er.getGroupList()
        json_data = json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
        return HttpResponse(json_data, content_type='application/json')

class APIExerciseView(CsrfExemptMixin, View):
    def get(self, request):
        course_id = request.GET.get('course_id', None)
        group_name = request.GET.get('group_name', None)
        exercise_name = request.GET.get('exercise_name', None)
        
        er = ExerciseRepository.create(course_id=course_id)
        if exercise_name is not None and group_name is not None:
            exercise = er.findExerciseByGroup(group_name, exercise_name)
            if exercise is None:
                raise Http404("Exercise does not exist.")
            exercise.load()
            data = exercise.asDict()
        elif exercise_name is None and group_name is not None:
            group = er.findGroup(group_name)
            if group is None:
                raise Http404("Exercise group does not exist.")
            data = group.asDict()
        else:
            data = er.asDict()

        return HttpResponse(json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')), content_type='application/json')
 
    @method_decorator(course_authorization_required(source='query'))
    @method_decorator(role_required([const.ADMINISTRATOR,const.INSTRUCTOR], redirect_url='lab:not_authorized', raise_exception=True))
    def post(self, request):
        course_id = request.GET.get("course_id", None)
        exercise_data = json.loads(request.POST.get('exercise', None))
        result = ExerciseRepository.create(course_id=course_id).createExercise(exercise_data)

        return HttpResponse(json.dumps(result), content_type='application/json')
    
    @method_decorator(course_authorization_required(source='query'))
    @method_decorator(role_required([const.ADMINISTRATOR,const.INSTRUCTOR], redirect_url='lab:not_authorized', raise_exception=True))
    def delete(self, request):
        course_id = request.GET.get("course_id", None)
        group_name = request.GET.get('group_name', None)
        exercise_name = request.GET.get('exercise_name', None)

        er = ExerciseRepository.create(course_id=course_id)
        deleted, description = (False, "No action taken")
        if group_name is not None and exercise_name is not None:
            deleted, description = er.deleteExercise(group_name, exercise_name)
        elif group_name is not None:
            deleted, description = er.deleteGroup(group_name)

        result = {}
        if deleted:
            result['status'] = "success"
            result['description'] = description
        else:
            result['status'] = "failure"
            result['description'] = "Error: %s" % description
            
        return HttpResponse(json.dumps(result), content_type='application/json')


class LTILaunchView(CsrfExemptMixin, LoginRequiredMixin, View):
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
        request.session['course_id'] = lti_consumer.course.id
        
        # Redirect back to the index.
        return redirect('lab:index')

    def get(self, request, *args, **kwargs):
        '''Shows an error message because LTI launch requests must be POSTed.'''
        return HttpResponse('Invalid LTI launch request.', content_type='text/html', status=200)

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


def logout_view(request):
    logout(request)
    return redirect("lab:logged-out")

def logged_out_view(request):
    return HttpResponse('Logged out successfully.')

def not_authorized(request):
    return HttpResponse('Unauthorized', status=401)

def check_course_authorization(request, course_id, raise_exception=False):
    authorized = has_course_authorization(request, course_id, raise_exception)
    result = {
        "user_id": request.user.id,
        "course_id": course_id,
        "is_authorized": authorized
    }
    status = 200
    if not authorized:
        status = 403 # forbidden
    return HttpResponse(json.dumps(result), content_type='application/json', status=status)
