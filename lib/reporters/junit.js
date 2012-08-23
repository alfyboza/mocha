/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils')
  , clean = utils.clean
  , escape = utils.escape
  , libxml = require('libxmljs');

/**
 * Expose `JUnit`.
 */

exports = module.exports = JUnit;

/**
 * Initialize a new `JUnit` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function JUnit(runner) {
  var tests = [];

  Base.call(this, runner);

  runner.on('pass', function (test) {
    tests.push(test);
  });

  runner.on('fail', function (test) {
    tests.push(test);
  });

  runner.on('end', (function () {
    var xml  = libxml.Document()
      , root = xml.node('testsuite');

    root.attr({
        tests: this.stats.tests
      , skipped: this.stats.tests - this.stats.failures - this.stats.passes
      , failures: this.stats.failures
      , errors: this.stats.failures
      , time: this.stats.duration / 1000
    });

    tests.forEach(function (test) {
      var testCase = root.node('testcase');

      testCase.attr({
          name: test.title
        , time: test.duration / 1000
      });

      if (test.state === 'failed') {
        testCase.node('failure').text(escape(test.err.message));
      } else if (test.pending) {
        testCase.node('skipped');
      }
    });

    console.log(xml.toString());
  }).bind(this));
}

/**
 * Inherit from `Base.prototype`.
 */

JUnit.prototype.__proto__ = Base.prototype;
