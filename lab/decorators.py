from functools import wraps
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse_lazy
from django.utils.decorators import available_attrs
from django.shortcuts import redirect

from django_auth_lti import const
from .verification import has_roles, has_course_authorization

def role_required(allowed_roles, redirect_url=reverse_lazy("not_authorized"), raise_exception=False):
    def decorator(view):
        @wraps(view, assigned=available_attrs(view))
        def _wrapper(request, *args, **kwargs):
            if has_roles(request, allowed_roles):
                return view(request, *args, **kwargs)
            if raise_exception:
                raise PermissionDenied
            return redirect(redirect_url)
        return _wrapper
    return decorator

def course_authorization_required(**decorator_kwargs):
    def decorator(view):
        source = decorator_kwargs.get('source', None)
        valid_sources = ('arguments', 'query')
        if not (source in valid_sources):
            raise Exception("invalid source: %s" % source)
        @wraps(view, assigned=available_attrs(view))
        def _wrapper(request, *args, **kwargs):
            course_id = None
            if source == valid_sources[0]:
                argname = decorator_kwargs.get('argname', 'course_id')
                course_id = kwargs.get(argname, None)
            elif source == valid_sources[1]:
                method = decorator_kwargs.get('method', 'GET')
                param = decorator_kwargs.get('param', 'course_id')
                course_id = getattr(request, method).get(param, None)

            if not has_course_authorization(request, course_id):
                raise PermissionDenied

            return view(request, *args, **kwargs)
        return _wrapper
    return decorator