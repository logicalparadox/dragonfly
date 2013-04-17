/*!
 * Dragonfly - Tiny error manager for bigt applications.
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var debug = require('sherlock')('dragonfly:repo')
  , error = require('tea-error')
  , extend = require('tea-extend')
  , properties = require('tea-properties');

/*!
 * Internal dependencies
 */

var Definition = require('./definition');

/*!
 * File variables
 */

var clean = extend.exclude('message', 'name', 'stack')
  , DragonflyError = error('DragonflyError');

/*!
 * Primary exports
 */

module.exports = Dragonfly;

/**
 * ## Dragonfly (name)
 *
 * ```js
 * var dragonfly = require('dragonfly')
 *   , errs = dragonfly('CustomError');
 * ```
 *
 * @param {String} name (required)
 * @throws {Error} on error
 * @api public
 */

function Dragonfly (name) {
  // constructor as factory
  if (!(this instanceof Dragonfly)) return new Dragonfly(name);

  // throw error if no name defined
  if (!name || 'string' !== typeof name) {
    var msg = 'Unable to create Dragonfly repository without a valid name.'
      , err = new DragonflyError(msg, null, arguments.callee);
    debug('(constructor) error: %s', msg);
    throw err;
  }

  // set sane defaults
  this._errors = {};
  this._name = errorName(name);
  this.proto = error(this._name);
  debug('(constructed) %s', this._name);
}

/**
 * ### .define (key)
 *
 * Define a new error patern that can be constructed
 * from this dragonfly error repository. Returns a
 * definition for chaining. The key does not occur
 * in the constructed error object; it is simply for
 * lookup purposes.
 *
 * ```js
 * errs.create('not found')
 *   .message('Resource "#{path}" cannot be found.')
 *   .set('httpStatus', 404)
 *   .set('path', '/');
 * ```
 *
 * The slug `#{path}` will be replaced with either the
 * default value or the value defined on construction
 * for that key.
 *
 * @param {String} key (required)
 * @param {String} message
 * @throws {Error} on error
 * @return {Definition} chainable object
 * @api public
 */

Dragonfly.prototype.define = function (key, msg) {
  var name = this._name
    , def;

  // throw error if key is not define
  if (!key || 'string' !== typeof key) {
    var msg = 'Dragonfly#define requires a valid key for namespace "' + name + '".'
      , err = new DragonflyError(msg, null, arguments.callee);
    debug('[%s] (define:error) %s', name, msg);
    throw err;
  }

  // add key to repo and return for chaining
  debug('[%s] (define) %s', name, key);
  def = new Definition(name + ':' + key, msg);
  this._errors[key] = def;
  return def;
};

/**
 * ### .create (key[, props][, ssf])
 *
 * Create an error using the template of a defined
 * error as the basis for the newly constructed error.
 *
 * ```js
 * var err = errs.create('not found');
 * ```
 *
 * Extra properties can also be specified to be merged
 * on to the newly constructed error. These will also
 * be used for any message replacements. Properties that
 * do not have set defaults are also included.
 *
 * ```js
 * var err = errs.create('not found', { path: '/blog', method: 'GET' });
 * err.should.have.property('message', 'Resource "/blog" cannot be found.');
 * err.should.have.property('httpStatus', 404);
 * err.should.have.property('method', 'GET');
 * ```
 *
 * A returned error can also be serialized for rendering
 * in a template or sent over the wire. The `.toJSON()` method accepts
 * one argument of boolean value indicating whether the `stack`
 * property should be included (default: `true`).
 *
 * ```js
 * var json = err.toJSON(false);
 * // {
 * //     name: 'NotFoundError'
 * //   , message: 'Resource "/blog" cannot be found.'
 * //   , httpStatus: 404
 * //   , path: '/blog'
 * //   , method: 'GET'
 * // }
 * ```
 *
 * @param {String} key (required)
 * @param {Object|null} template properties to overwrite
 * @param {Function} start stack function (default: `arguments.callee`)
 * @throws {Error} on error
 * @return {Error} newly constructed error based on template
 * @see tea-error https://github.com/qualiancy/tea-error
 * @api public
 */

Dragonfly.prototype.create = function (key, _props, ssf) {
  var name = this._name
    , def;

  // throw error if key is not define
  if (!key || 'string' !== typeof key) {
    var msg = 'Dragonfly#create requires a valid key for namespace "' + name + '".'
      , err = new DragonflyError(msg, null, arguments.callee);
    debug('[%s] (create:error) %s', name, msg);
    throw err;
  }

  def = this._errors[key];

  // throw error if key doesn't exist
  if (!def || !(def instanceof Definition)) {
    var msg = 'Dragonfly#create cannot locate key "' + key + '" for namespace "' + name + '".'
      , err = new DragonflyError(msg, null, arguments.callee);
    debug('[%s] (create:error) %s', name, msg);
    throw err;
  }

  // parse args
  _props = _props || {};
  ssf = ssf || arguments.callee;

  // set sane defaults and merge default properties
  var message = _props.message || def.message()
    , props = extend({}, def._props, clean(_props))
    , err;

  // replace tokens with values
  message = message.replace(/#\{(.*?)\}/g, function (match, path) {
    var value = properties.get(props, path);
    return 'undefined' !== typeof value
      && null !== value
      && 'function' === typeof value.toString
        ? value.toString()
        : JSON.stringify(value);
  });

  // debug and return error
  debug('[%s] (create) %s: %s', name, key, message);
  err = new this.proto(message, props, ssf);
  return err;
};

/*!
 * Convert the error message to a PascalCase case,
 * appending `Error` if needed.
 *
 * - PascalCase
 * - removes special characters
 * - removes spaces
 *
 * ```js
 * 'Request Time-out'.should.equal('RequestTimeoutError');
 * 'RequestTimeout'.should.equal('RequestTimeoutError');
 * 'request timeout'.should.equal('RequestTimeoutError');
 * 'RequestTimeoutError'.should.equal('RequestTimeoutError');
 * ```
 *
 * @param {String} message
 * @return {String} error type
 * @api private
 */

function errorName (name) {
  name = name
    .split(/\s+/)
    .map(function (word) {
      return word.charAt(0).toUpperCase()
        + word.slice(1);
    })
    .join('')
    .replace(/\W+/, '')
    .replace(/error$/i, '');

  return name + 'Error';
}
