import unittest

from ..objects import ExerciseLilyPond

class ExerciseLilyPondTest(unittest.TestCase):
    def setUp(self):
        pass

    def test_parse_chords(self):
        chord_input = "<e c' g' bf'>1\n<f \\xNote c' \\xNote f' a'>1"
        chord_midi = [{'visible': [52, 60, 67, 70], 'hidden': []}, {'visible': [53, 69], 'hidden': [60, 65]}]
        elp = ExerciseLilyPond(chord_input)
        self.assertTrue(elp.isValid())
        self.assertEqual(chord_midi, elp.toMIDI())
        


