/*!
 * Dragonfly - Error Definition
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var debug = require('sherlock')('dragonfly:definition')
  , facet = require('facet');

/*!
 * Primary exports
 */

module.exports = Definition;

/**
 * Create a definition for storage on the repo.
 * Encapsulates all default properties.
 *
 * @param {String} key (required)
 * @param {String} message
 * @api public
 */

function Definition (key, msg) {
  this._key = key;
  this._message = 'Undefined message for error: ' + key + '.';
  debug('(constructed) %s', this._key);
  if (msg) this.message(msg);
}

/*!
 * Getters/Setters provided by facet.
 */

facet(Definition.prototype, '_props', function (key, value) {
  debug('[%s] (property) %s: %j', this._key, key, value);
});

/**
 * ### .message ([msg])
 *
 * Set or get the default message for this
 * definition.
 *
 * @param {String} message
 * @returns {this|String} `this` if setting
 * @api public
 */

Definition.prototype.message = function (msg) {
  if (arguments.length) {
    debug('[%s] (message) %s', msg);
    this._message = msg;
    return this;
  } else {
    return this._message;
  }
};
