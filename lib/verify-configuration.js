'use strict';

var _ = require('lodash');
var PluginError = require('gulp-util').PluginError;

function verify(rootSchema, rootConfig) {
	var title;

	if (rootSchema && rootConfig) {
		title = rootSchema.title;
		_entry(title, rootSchema, rootConfig);
	}

	function _entry(name, schema, config) {
		_object() || _array();

		function _object() {
			if (_strict('object') || _loose('object', _.isPlainObject) || _implicit()) {
				if (!_.isPlainObject(config)) {
					throw new PluginError(title, 'configuration property "' + name + '" should be an object');
				}

				if (schema.required) {
					schema.required.forEach(function (property) {
						if (!config.hasOwnProperty(property)) {
							throw new PluginError(title, 'configuration property "' + property + '" is required');
						}
					});
				}

				if (schema.properties) {
					_.forEach(config, function (item, property) {
						_entry(property, schema.properties[property], item);
					});
				}

				if (schema.patternProperties) {
					_.forEach(schema.patternProperties, function (propertySchema, pattern) {
						var regex;

						regex = new RegExp(pattern);
						_.forEach(config, function (item, property) {
							if (regex.test(property)) {
								_entry(property, propertySchema, item);
							}
						});
					});
				}

				return true;
			}
		}

		function _array() {
			if (_strict('array') || _loose('array', Array.isArray)) {
				if (!Array.isArray(config)) {
					throw new PluginError(title, 'configuration property "' + name + '" should be an array');
				}

				if ('minItems' in schema && config.length < schema.minItems) {
					throw new PluginError(title, 'configuration property "' + name + '" should at least contains ' + schema.minItems + (schema.minItems > 1 ? ' items' : ' item'));
				}

				if ('maxItems' in schema && schema.maxItems < config.length) {
					throw new PluginError(title, 'configuration property "' + name + '" should at most contains ' + schema.minItems + (schema.minItems > 1 ? ' items' : ' item'));
				}

				if (schema.items) {
					config.forEach(function (item) {
						_entry('item', schema.items, item);
					});
				}

				return true;
			}
		}

		function _strict(type) {
			return schema.type === type;
		}

		function _loose(type, fn) {
			return _.includes(schema.type, type) && fn(config);
		}

		function _implicit() {
			return _.size(schema.properties) > 0 || _.size(schema.patternProperties) > 0;
		}
	}
}

module.exports = verify;
