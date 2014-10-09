define(['lodash', 'app/models/chord'], function(_, Chord) {
	describe("Chord", function() {
		it("should create an empty chord", function() {
			var chord = new Chord();
			expect(chord.hasNotes()).toBe(false);
		});

		it("should create a chord with some notes", function() {
			var notes = [59,60,61];
			var chord = new Chord({notes:notes});
			expect(chord.hasNotes()).toBe(true);
			expect(chord.getSortedNotes()).toEqual(notes);
		});

		it("should know which clef notes belong to", function() {
			var tests = [{
				notes: [60,127],
				clef: "treble",
				invalidClef: "bass"
			},{
				notes: [0,59],
				clef: "bass",
				invalidClef: "treble"
			},{
				notes: [59,60],
				clef: "treble",
				invalidClef: false
			},{
				notes: [59,60],
				clef: "bass",
				invalidClef: false
			}];
			_.each(tests, function(test) {
				var notes = test.notes;
				var clef = test.clef;
				var chord = new Chord({notes:notes});
				expect(chord.hasNotes()).toBe(true);
				expect(chord.hasNotes(clef)).toBe(true);
				if(test.invalidClef) {
					expect(chord.hasNotes(test.invalidClef)).toBe(false);
				}
				expect(chord.getSortedNotes(clef)).toEqual(notes);
			});
		});

		it("should be able to turn a note on and off", function() {
			var chord = new Chord();
			var note = 60;
			expect(chord.getSortedNotes()).not.toEqual([note]);
			chord.noteOn(note);
			expect(chord.getSortedNotes()).toEqual([note]);
			chord.noteOff(note);
			expect(chord.getSortedNotes()).not.toEqual([note]);
		});

		it("should be able to sustain notes", function() {
			var chord = new Chord();
			var note = 60;
			chord.sustainNotes();
			chord.noteOn(note);
			chord.noteOff(note);
			expect(chord.getSortedNotes()).toEqual([note]);
			chord.releaseSustain();
			chord.noteOff(note);
			expect(chord.getSortedNotes()).not.toEqual([note]);
		});

		it("should be able to turn off a single sustained note", function() {
			var note = 60;
			var chord = new Chord();
			chord.sustainNotes();
			chord.noteOn(note);
			expect(chord.getSortedNotes()).toEqual([note]);
			chord.noteOff({
				notes: [note],
				overrideSustain: true
			});
			expect(chord.getSortedNotes()).not.toEqual([note]);
		});
	});
});
