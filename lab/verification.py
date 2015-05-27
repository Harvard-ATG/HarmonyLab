from django.core.exceptions import PermissionDenied
from django_auth_lti.verification import has_lti_roles
from django_auth_lti import const

def has_instructor_role(request):
    return has_roles(request, [const.ADMINISTRATOR,const.INSTRUCTOR])

def has_roles(request, roles):
    if request.user.is_superuser:
        return True
    if hasattr(request, 'LTI'):
        return has_lti_roles(request, roles)
    return False

def has_course_authorization(request, course_id, raise_exception=False):
    authorized = True
    if not request.user.is_superuser:
        if course_id is None:
            if raise_exception:
                raise PermissionDenied
            else:
                authorized = False
        else:
            session_course_id = request.session.get("course_id", None)
            if str(course_id) != str(session_course_id):
                if raise_exception:
                    raise PermissionDenied
                else:
                    authorized = False
    return authorized
