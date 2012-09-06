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
 * @param {Function?} log
 * @api public
 */

function JUnit(runner, log) {
  var xml  = libxml.Document()
    , root = xml.node('testsuite');

  Base.call(this, runner);

  runner.on('suite', function onSuite(suite) {
    root.attr({
      name: suite.fullTitle()
    });

    runner.removeListener('suite', onSuite);
  });

  runner.on('test', function (test) {
    var testCase = root.node('testcase')
      , onFail;

    onFail = function (_, error) {
      testCase
        .node('failure')
        .text(escape(test.err.message))
        .attr({
          type: error.constructor.name || 'Unknown'
        });
    };

    runner.on('fail', onFail);

    runner.on('test end', function onTestEnd() {
      runner.removeListener('fail', onFail);
      runner.removeListener('test end', onTestEnd);

      testCase.attr({
          name: test.fullTitle()
        , time: (test.duration / 1000) || 0 // avoid NaN
      });

      if (test.pending) {
        testCase.node('skipped');
      }
    });
  });

  runner.on('end', (function () {
    root.attr({
        tests: this.stats.tests
      , skipped: this.stats.tests - this.stats.failures - this.stats.passes
      , failures: this.stats.failures
      , errors: this.stats.failures
      , time: (this.stats.duration / 1000) || 0 // avoid NaN
    });

    console.log(xml.toString());
  }).bind(this));
}

/**
 * Inherit from `Base.prototype`.
 */

JUnit.prototype.__proto__ = Base.prototype;
