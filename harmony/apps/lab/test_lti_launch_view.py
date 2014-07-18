import unittest
from .views import LTILaunchView
from braces.views import LoginRequiredMixin
from django.views.generic import RedirectView


class LTILaunchViewTest(unittest.TestCase):
    longMessage = True

    def setUp(self):
        self.view = LTILaunchView()

    def test_view_required_login(self):
        """
        Test that the launch view requires users to log in
        """
        self.assertIsInstance(self.view, LoginRequiredMixin, 'LTI launch view expected to be a subclass of LoginRequiredMixin')

    def test_view_redirects_to_index(self):
        """
        Test that the launch view is a RedirectView that will redirect to the lab index
        """
        self.assertIsInstance(self.view, RedirectView, 'LTI launch view expected to be a subclass of RedirectView')
        self.assertEqual('lab:index', self.view.pattern_name, 'The redirect pattern is expected to go to the index view')
