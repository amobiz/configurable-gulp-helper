'use strict';

var PluginError = require('gulp-util').PluginError;

function helper(name) {
	var MESSAGES = {
		NO_STREAM: 'recipes in ' + name + ' stream-processor must return a stream',
		NO_TASK: 'no child task specified',
		UPSTREAM: name + ' stream-processor do not accept up-stream',
		DONE: 'recipes in ' + name + ' stream-processor must return a stream, not call done()'
	};

	return {
		prerequisite: prerequisite,
		runTask: runTask
	};

	function prerequisite(context, upstream, minTasks) {
		var tasks;

		if (!upstream && context.upstream) {
			throw new PluginError(name, MESSAGES.UPSTREAM);
		}

		tasks = typeof minTasks === 'number' ? minTasks : 1;
		if (!context.tasks || context.tasks.length < tasks) {
			throw new PluginError(name, MESSAGES.NO_TASK);
		}
	}

	function runTask(context, task) {
		var stream;

		stream = task.call(context, done);
		if (!isStream(stream)) {
			// Since we are between streams, not inside a stream, it's ok to throw.
			// According to the [Guidelines: Do not throw errors inside a stream]
			// https://github.com/gulpjs/gulp/blob/4.0/docs/writing-a-plugin/guidelines.md
			throw new PluginError(name, MESSAGES.NO_STREAM);
		}
		return stream;

		function done() {
			throw new PluginError(name, MESSAGES.DONE);
		}

		function isStream(target) {
			return target && typeof target.pipe === 'function';
		}
	}
}

module.exports = helper;
