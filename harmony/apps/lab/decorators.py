from functools import wraps
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse_lazy
from django.utils.decorators import available_attrs
from django.shortcuts import redirect
from .verification import has_roles

def role_required(allowed_roles, redirect_url=reverse_lazy("not_authorized"), raise_exception=False):
    def decorator(view):
        @wraps(view, assigned=available_attrs(view))
        def wrapper(request, *args, **kwargs):
            if has_roles(request, allowed_roles):
                return view(request, *args, **kwargs)
            if raise_exception:
                raise PermissionDenied
            return redirect(redirect_url)
        return wrapper
    return decorator
