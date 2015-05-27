// Highlight configuration.
//
// This defines the colors used to highlight notes to show off 
// certain phenomena.
//
define({
	// Colors are expressed in HSL format, a triple: (hue, saturation, lightness).
	//
	// The reason this format was chosen is because it is easier to tweak the
	// colors to get the desired color scheme. Of course, it could be
	// changed to a different format if desired. These colors are primarily
	// used by the analysis routines.
	"colors": {
		"default": [0, 0, 0], // black
		"perfectfifth": [120, 100, 25], // green
		"perfectfifthoctave": [180, 100, 60], // light blue
		"octave": [240, 100, 50], // blue
		"tritone": [322, 85, 50], // fuchsia
		"double": [39, 100, 50], // orange
		"root": [0, 100, 50], // red
	}
});
