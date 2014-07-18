import unittest
from mock import Mock
from .views import ToolConfigView
from django.core.urlresolvers import reverse, resolve
from django.test import RequestFactory

class ToolConfigViewTest(unittest.TestCase):
    def setUp(self):
        self.view = ToolConfigView()
        self.view.request = RequestFactory().get('/tool_config')
        self.view.request.session = {}

    def test_launch_secure_luanch_url(self):
        host = "localhost"
        self.view.request.get_host = Mock(return_value=host)
        self.view.request.is_secure = Mock(return_value=True)

        actual = self.view.get_launch_url(self.view.request)
        expected = 'https://' + host + reverse(self.view.LAUNCH_URL)

        self.assertEqual(actual, expected)
