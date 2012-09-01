var chai = require('chai')
  , fs = require('fs')
  , libxml = require('libxmljs')
  , path = require('path')
  , sinon = require('sinon')
  , mocha = require('../../')
  , JUnit = mocha.reporters.JUnit
  , Runner = mocha.Runner
  , Suite = mocha.Suite
  , Test = mocha.Test;

chai.use(require('sinon-chai'));

describe('mocha.reporters.JUnit', function () {
  var junit, log, run, runner, suite;

  run = function () {
    runner.run();

    return libxml.parseXmlString(log.lastCall.args[0]);
  };

  beforeEach(function () {
    suite = new Suite(null, 'root');
    runner = new Runner(suite);
    log = sinon.spy();
    junit = new JUnit(runner, log);
  });

  describe('XSD validation', function () {
    var xsd;

    beforeEach(function () {
      xsd = libxml.parseXmlString(fs.readFileSync(path.join(__dirname, './junit.xsd')));
    });

    it('passes on failure', function () {
      run().validate(xsd).should.be.ok;
    });
  });
});
