define(['lodash'], function(_) {

	/**
	 * ExerciseDefinition object is responsible for knowing the definition
	 * or description of an exercise.
	 *
	 * @param settings {object}
	 * @param settings.definition {object}
	 * @constructor
	 */
	var ExerciseDefinition = function(settings) {
		this.settings = settings || {};

		if(!("definition" in this.settings)) {
			throw new Error("misisng settings.definition");
		}

		this.exercise = this.parse(this.settings.definition);
	};

	/**
	 * Defines the possible exercise types.
	 */
	ExerciseDefinition.TYPES = {
		matching: "matching"
	};

	_.extend(ExerciseDefinition.prototype, {
		/**
		 * Returns true if the exercise has introductory text, false otherwies.
		 *
		 * @return {boolean}
		 */
		hasIntro: function() {
			return this.exercise.introText !== false;
		},
		/**
		 * Returns true if the exercise has review text, false otherwise.
		 *
		 * @return {boolean}
		 */
		hasReview: function() {
			return this.exercise.reviewText !== false;
		},
		/**
		 * Returns true if the exercise has any problems attached.
		 *
		 * @return {boolean}
		 */
		hasProblems: function() {
			return this.exercise.problems.length > 0;
		},
		/**
		 * Returns the introductory text.
		 *
		 * @return {string}
		 */
		getIntro: function() {
			return this.exercise.introText;
		},
		/**
		 * Returns the key for the exercise (i.e. C Major, A minor, etc).
		 * The format of the key string should be consistent with the
		 * KeySignature model.
		 *
		 * @return {string}
		 */
		getKey: function() {
			return this.exercise.key;
		},
		/**
		 * Returns the key signature for the exercise.
		 *
		 * The format of the key signature string should be consistent with the
		 * KeySignature model.
		 *
		 * @return {string}
		 */
		getKeySignature: function() {
			return this.exercise.keySignature;
		},
		/**
		 * Returns the review text.
		 *
		 * @return {string}
		 */
		getReview: function() {
			return this.exercise.reviewText;
		},
		/**
		 * Returns the URL to the next exercise.
		 *
		 * @return {string}
		 */
		getNextExercise: function() {
			return this.exercise.nextExercise;
		},
		/*
		 * Returns the list of exercises in the set.
		 *
		 * @return {array}
		 */
		getExerciseList: function() {
			return this.exercise.exerciseList.slice(0);
		},
		/**
		 * Returns the analysis settings.
		 *
		 * @return {object}
		 */
		getAnalysisSettings: function() {
			return this.exercise.analysis;
		},
		/**
		 * Returns the highlight settings.
		 *
		 * @return {object}
		 */
		getHighlightSettings: function() {
			return this.exercise.highlight;
		},
		/**
		 * Returns all the problems.
		 *
		 * @return {array}
		 */
		getProblems: function() {
			return this.exercise.problems;
		},
		/**
		 * Returns the number of problems.
		 *
		 * @return {number}
		 */
		getNumProblems: function() {
			return this.exercise.problems.length;
		},
		/**
		 * Returns the given problem at an index.
		 *
		 * @return {object}
		 */
		getProblemAt: function(index) {
			var num_problems = this.exercise.problems;
			if(index < 0 || index >= num_problems) {
				throw new Error("invalid problem index: "+index);
			} else if(!this.exercise.problems[index]) {
				throw new Error("problem doesn not exist at index: "+index);
			}
			return this.exercise.problems[index];
		},
		/**
		 * Parses an exercise definition and performs sanity checking
		 * and basic validation.
		 *
		 * @param {object} definition
		 * @return {object} the parsed definition
		 */
		parse: function(definition) {
			var exercise = {};
			var problems = [];

			// check for a chord entry which may be an array of note numbers
			// to represent one chord, or an array of arrays to represent
			// chord sequence
			if(definition.hasOwnProperty("chord")) {
				if(_.isArray(definition.chord)) {
					if(_.isArray(definition.chord[0])) {
						problems = definition.chord;
					} else if(_.isObject(definition.chord[0])) {
						problems = definition.chord;
					} else {
						problems = [definition.chord];
					}
				} else {
					throw new Error("definition.problems must be an array");
				}
			} 

			// normalize the internal representation of each chord in the
			// set of problems to have VISIBLE/HIDDEN parts
			problems = _.map(problems, function(chord, index) {
				var normalized = {"visible":[], "hidden":[],"notes":[]};

				if(_.isArray(chord)) {
					normalized.visible = chord;
				} else if(_.isObject(chord)) {
					if(!chord.hasOwnProperty("visible") || !chord.hasOwnProperty("hidden")) {
						throw new Error("invalid chord at index: " + index + "; chord must have 'visible' and 'hidden' properties");
					}
					normalized.visible = chord.visible;
					normalized.hidden = chord.hidden;
				} else {
					throw new Error("invalid chord at index: " + index);
				}

				// get the sum of the visible and hidden notes
				normalized.notes = ExerciseDefinition.getNotesForProblem(normalized.visible, normalized.hidden);

				// normalize the note order
				normalized.visible = ExerciseDefinition.sortNotes(normalized.visible);
				normalized.hidden = ExerciseDefinition.sortNotes(normalized.hidden);
				normalized.notes = ExerciseDefinition.sortNotes(normalized.notes);

				return normalized;
			});

			exercise.problems = problems;

			// check that the problem type is supported
			if(definition.hasOwnProperty('type') && (definition.type in ExerciseDefinition.TYPES)) {
				exercise.type = definition.type;
			} else {
				throw new Error("invalid definition.type: "+definition.type);
			}

			// check for the "key" entry to use for the problem set
			exercise.key = "h"; // means "no key" 
			if(definition.hasOwnProperty('key')) {
				exercise.key = definition.key;
			} 

			// check for the "keySignature" entry 
			exercise.keySignature = false; 
			if(definition.hasOwnProperty('keySignature')) {
				exercise.keySignature = definition.keySignature;
			} 

			// check for the introductory text
			exercise.introText = false;
			if(definition.hasOwnProperty("introText") && definition.introText) {
				exercise.introText = definition.introText;
			}

			// check for the review text
			exercise.reviewText = false;
			if(definition.hasOwnProperty("reviewText") && definition.reviewText) {
				exercise.reviewText = definition.reviewText;
			}

			// check for the next exercise 
			exercise.nextExercise = false;
			if(definition.hasOwnProperty("nextExercise") && definition.nextExercise) {
				exercise.nextExercise = definition.nextExercise;
			}

			// check for the exercise list
			exercise.exerciseList = [];
			if(definition.hasOwnProperty("exerciseList") && definition.exerciseList) {
				exercise.exerciseList = definition.exerciseList.slice(0);
			}

			// get analysis options (see config.general.analysisSettings)
			exercise.analysis = {};
			if(definition.hasOwnProperty("analysis") && definition.analysis) {
				exercise.analysis = definition.analysis;
			}

			// get highlight options (see config.general.highlightSettings)
			exercise.highlight = {};
			if(definition.hasOwnProperty("highlight") && definition.highlight) {
				exercise.highlight = definition.highlight;
			}

			return exercise;
		},
		/**
		 * Utility function to assert that a given set of keys are
		 * present, otherwise throw an exception.
		 *
		 * @param {array} valid_keys The valid key names to check
		 * @param {array} actual_keys The actual key names to check
		 * @param {string} msg The prefix for the exception message
		 * @return undefined
		 */
		assertHasKeys: function(valid_keys, actual_keys, msg) {
			var i, len, map = {};
			msg = msg || "invalid key: ";

			for(i = 0, len = valid_keys.length; i < len; i++) {
				map[valid_keys[i]] = true;
			}
			
			for(i = 0, len = actual_keys.length; i < len; i++) {
				if(!map[actual_keys[i]]) {
					throw new Error(msg + actual_keys[i]);
				}
			}
		}
	});

	/**
	 * Returns a complete list of the notes that is the sum of the
	 * visible and hidden parts.
	 *
	 * @param {array} visible the visible note numbers
	 * @param {array} hidden the hidden note numbers
	 * @return {array} the set of unique notes from the visible and hidden parts
	 */
	ExerciseDefinition.getNotesForProblem = function(visible, hidden) {
		var note, notes = [], map = {}; 

		for(var i = 0, len = visible.length; i < len; i++) { 
			note = visible[i];
			if(!map.hasOwnProperty(note)) {
				map[note] = 1;
				notes.push(note);
			}
		}

		for(var i = 0, len = hidden.length; i < len; i++) {
			note = hidden[i];
			if(!map.hasOwnProperty(note)) {
				map[note] = 1;
				notes.push(note);
			}
		}

		return notes;
	};

	/**
	 * Returns a sorted copy of the notes. Expects
	 * an array of note numbers.
	 *
	 * @param {array} notes
	 * @return {array} of sorted notes
	 */
	ExerciseDefinition.sortNotes = function(notes) {
		var copy = notes.slice();
		copy.sort(function(a, b) {
			return a - b;
		});
		return copy;
	};

	return ExerciseDefinition;
});
