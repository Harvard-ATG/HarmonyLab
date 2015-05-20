from django.core.exceptions import PermissionDenied
from django_auth_lti.verification import has_lti_roles
from django_auth_lti import const


def has_roles(request, roles):
    if request.user.is_superuser:
        return True
    return has_lti_roles(request, roles)

def has_course_authorization(request, course_id, raise_exception=False):
    authorized = True
    if not request.user.is_superuser:
        if course_id is None:
            if raise_exception:
                raise PermissionDenied
            else:
                authorized = False
        else:
            LTI_course_id = request.LTI.get("context_id", None)
            if course_id != LTI_course_id:
                if raise_exception:
                    raise PermissionDenied
                else:
                    authorized = False
    return authorized
