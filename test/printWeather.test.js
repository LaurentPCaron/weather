const expect = require('chai').expect;
const sinon = require('sinon');

const printWeather = require('../src/printWeather');

context('printWeather', () => {
  context('print', () => {
    const locationData = {
      weather_name: 'Heavy Cloud',
      weather_code: 'hc',
      temp: 3.045,
      min_temp: -1.4,
      max_temp: 2.9450000000000003,
    };
    it('should trow an error if the arguments are invalid', () => {
      expect(() => printWeather.print()).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print(null)).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print(0)).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print('a')).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print({ a: 1 })).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print(locationData)).to.throw(
        'locationData invalid in printWeather.print'
      );

      expect(() => printWeather.print(locationData, 0)).to.throw(
        'locationData invalid in printWeather.print'
      );
    });

    it('should print the weather with the argument given', () => {
      const goodOutput = 'Montreal:\n3.0℃\nHeavy Cloud\nMin:-1.4℃ Max:2.9℃';

      const consoleSpy = sinon.spy(console, 'log');

      printWeather.print(locationData, 'Montreal');

      expect(consoleSpy.calledWith(goodOutput)).to.be.true;
    });
  });
});
