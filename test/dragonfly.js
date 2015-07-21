var chai = require('chai')
var should = chai.should()
var dragonfly = require('..')

describe('dragonfly(name)', function () {
  it('should allow creation with a name', function () {
    var repo;
    (function () {
      repo = dragonfly('custom');
    }).should.not.throw();
  });

  it('should throw error if name invalid', function () {
    var msg = 'Unable to create Dragonfly repository without a valid name.'
      , tests = []
      , repo;

    tests.push(function () { repo = dragonfly() });
    tests.push(function () { repo = dragonfly(42) });
    tests.push(function () { repo = dragonfly({ name: 'custom' }) });

    tests.forEach(function (t) {
      t.should.throw(msg);
    });
  });

  it('should normalize the error name', function () {
    var repos = [];

    repos.push(dragonfly('custom'));
    repos.push(dragonfly('custom error'));
    repos.push(dragonfly('customerror'));
    repos.push(dragonfly('customError'));
    repos.push(dragonfly('CustomError'));

    repos.forEach(function (repo) {
      repo.should.have.property('_name', 'CustomError');
    });

    dragonfly('BigCustomError')
      .should.have.property('_name', 'BigCustomError');
    dragonfly('BigCustom')
      .should.have.property('_name', 'BigCustomError');
  });

  /*!
   * Tests for when a definition is added to the repo
   */

  describe('.define(key)', function () {
    it('should be an available method', function () {
      dragonfly.should.respondTo('define');
    });

    it('should error without a valid key', function () {
      var msg = 'Dragonfly#define requires a valid key for namespace "DefineError".'
        , repo = dragonfly('define')
        , tests = [];

      tests.push(function () { repo.define(); });
      tests.push(function () { repo.define(42); });
      tests.push(function () { repo.define({ key: 'custom' }); });

      tests.forEach(function (t) {
        t.should.throw(msg);
      })
    });

    /*!
     * Tests for the the chainable Definitions constructor is created
     */

    describe('Definitions', function () {
      var repo;

      // flush before each
      beforeEach(function () {
        repo = dragonfly('definitions')
      });

      describe('construction', function () {
        it('should have a default message', function () {
          var def = repo.define('key');
          def.should.have.property('_message', 'Undefined message for error: DefinitionsError:key.');
        });
      });

      describe('.message([str])', function () {
        it('should be an available method', function () {
          var def = repo.define('key');
          def.should.itself.respondTo('message');
        });

        it('should set the message', function () {
          var def = repo.define('key');
          def.should.itself.respondTo('message');
          def.message('Testing');
          def.should.have.property('_message', 'Testing');
        });

        it('should get the message', function () {
          var def = repo.define('key');
          def.should.itself.respondTo('message');
          def.message('Testing');
          def.message().should.equal('Testing');
        });
      });

      describe('.set(key, value)', function () {
        it('should be an available method', function () {
          var def = repo.define('key');
          def.should.itself.respondTo('set');
        });

        it('should set custom values', function () {
          var def = repo.define('key');
          def.set('key', 'value');
          def.should.have.property('_props')
            .and.have.property('key', 'value');
        });
      });
    });
  });

  /*!
   * Tests for creation of errors from the repository
   */

  describe('.create(key, props, ssf)', function () {
    var repo

    // flush before each
    beforeEach(function () {
      repo = dragonfly('create');
    });

    it('should be an available method', function () {
      repo.should.itself.respondTo('create');
    });

    it('should return an error', function () {
      repo.define('key')
        .message('test');

      repo.create('key').should.be.instanceof(Error);
    });

    it('should merge properties', function () {
      repo.define('key')
        .message('test')
        .set('custom', 'value')
        .set('key', 42);

      var err = repo.create('key', { key: 123});

      err.should.have.property('custom', 'value');
      err.should.have.property('key', 123);
    });

    it('should perform #{template} replacement', function () {
      repo.define('key')
        .message('hello #{where}')
        .set('where', 'world');

      var err1 = repo.create('key')
        , err2 = repo.create('key', { where: 'universe' });
      err1.should.have.property('message', 'hello world');
      err2.should.have.property('message', 'hello universe');
    });

    it('should throw if key does not exist', function () {
      (function () {
        repo.create();
      }).should.throw('Dragonfly#create requires a valid key for namespace "CreateError".');
      (function () {
        repo.create('key');
      }).should.throw('Dragonfly#create cannot locate key "key" for namespace "CreateError".');
    });
  });
});
