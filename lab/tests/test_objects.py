import unittest

from ..objects import ExerciseLilyPond

class ExerciseRepositoryTest(unittest.TestCase):
    def setUp(self):
        pass

class ExerciseLilyPondTest(unittest.TestCase):
    def setUp(self):
        pass

    def test_parse_chords(self):
        chord_tests = [
            {
                "input": "<c e b>1 <c' e' b'>1",
                "output": [
                    {'visible': [48,52,59], 'hidden': []},
                    {'visible': [60,64,71], 'hidden': []}
                ]
            },
            {
                "input": "<c' cs' cf''>1",
                "output": [
                    {'visible': [60,61,71], 'hidden': []}
                ]               
            },
            {
                "input": "<c' e' g' \\xNote bf'>1",
                "output": [
                    {'visible': [60,64,67], 'hidden': [70]}
                ]
            },
            {
                "input": "<e c' g' bf'>1\n<f \\xNote c' \\xNote f' a'>1",
                "output": [
                    {'visible': [52, 60, 67, 70], 'hidden': []},
                    {'visible': [53, 69], 'hidden': [60, 65]}
                ]
            }
        ]
        for t in chord_tests:
            lp = ExerciseLilyPond(t['input'])
            self.assertTrue(lp.isValid())
            self.assertEqual(t['output'], lp.toMIDI())
        


