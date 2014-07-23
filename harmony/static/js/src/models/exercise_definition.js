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
		 * Returns the review text.
		 *
		 * @return {string}
		 */
		getReview: function() {
			return this.exercise.reviewText;
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

			if(definition.hasOwnProperty("problems")) {
				if(_.isArray(definition.problems)) {
					problems = definition.problems;
				} else {
					throw new Error("definition.problems must be an array");
				}
			} 

			if(definition.hasOwnProperty('type') && (definition.type in ExerciseDefinition.TYPES)) {
				exercise.type = definition.type;
			} else {
				throw new Error("invalid definition.type: "+definition.type);
			}

			exercise.introText = false;
			if(definition.hasOwnProperty("introText") && definition.introText) {
				exercise.introText = definition.introText;
			}

			exercise.reviewText = false;
			if(definition.hasOwnProperty("reviewText") && definition.reviewText) {
				exercise.reviewText = definition.reviewText;
			}

			exercise.problems = _.map(problems, function(problem) {
				var valid_keys = ['text','notes'];
				var actual_keys = _.keys(problem);
				this.assertHasKeys(valid_keys, actual_keys, "invalid problem.type: ");
				return problem; 
			}, this);

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

	return ExerciseDefinition;
});
