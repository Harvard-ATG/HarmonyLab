define(['lodash', 'microevent'], function(_, MicroEvent) {

	// Knows which notes are currently active.
	var MidiNotes = function() {
		this._notes = {};
	};

	_.extend(MidiNotes.prototype, {
		noteOn: function(number) {
			var changed = (this._notes[number] !== true); 
			this._notes[number] = true;
			if(changed) {
				this.trigger('note:change', 'on', number);
			}
		},
		noteOff: function(number) {
			var changed = (this._notes[number] === true);
			delete this._notes[number];
			if(changed) {
				this.trigger('note:change', 'off', number);
			}
		},
		getNotes: function() {
			return _.keys(this._notes);
		},
		getNotesForClef: function(clef) {
			var notes = [], _notes = this._notes; 
			var note;
			for(note in _notes) {
				switch(clef) {
					case 'treble':
						if(note >= 60) {
							notes.push(note);
						}
						break;
					case 'bass':
						if(note < 60) {
							notes.push(note);
						}
						break;
					default:
						throw new Error("invalid clef");
				}
			}
			return notes;
		}
	});

	MicroEvent.mixin(MidiNotes); // make object observable

	return MidiNotes;
});
