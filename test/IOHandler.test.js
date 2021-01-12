const expect = require('chai').expect;
const sinon = require('sinon');
const robot = require('robotjs');
const prompt = require('prompt');

const IOHandler = require('../src/IOHandler');

context('IOHandler', () => {
  context('printLocationChoises', () => {
    const cities = ['Montréal', 'Edmonton'];
    let promptSpy;

    beforeEach(() => {
      promptSpy = sinon.spy(prompt, 'get');
    });

    afterEach(() => {
      promptSpy.restore();
    });

    it('should throw an error if arguments are invalide', () => {
      expect(() => IOHandler.printLocationChoises()).to.throw(
        'Argument invalid'
      );
    });

    it('should show a message that ask the user to chose a location', async () => {
      const response = IOHandler.printLocationChoises(cities);

      robot.typeString('1');
      robot.keyTap('enter');

      await response;

      expect(promptSpy.args[0][0].properties.cityNumber.description).equal(
        '\n***Select a location****\n0- Cancel\n1- Montréal\n2- Edmonton\n'
      );
    });

    it('should return a value -1 what the user input', async () => {
      const response = IOHandler.printLocationChoises(cities);

      robot.typeString('1');
      robot.keyTap('enter');

      await response.then(res => {
        expect(res).equal(0);
      });
    });

    it('should only allow to return a valid input', async function () {
      this.timeout(0);
      const response = IOHandler.printLocationChoises(cities);

      robot.keyTap('enter');

      robot.typeString('-1');
      robot.keyTap('enter');

      robot.typeString('3');
      robot.keyTap('enter');

      robot.typeString('a');
      robot.keyTap('enter');

      robot.typeString('1');
      robot.keyTap('enter');

      await response.then(res => {
        expect(res).equal(0);
      });
    });
  });
});
