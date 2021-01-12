const nock = require('nock');
const sinon = require('sinon');
const expect = require('chai').expect;
const axios = require('axios').default;

const index = require('../src/index.js');
const publicIp = require('../src/publicIp');
const apiCall = require('../src/apiCall');
const IOHandler = require('../src/IOHandler');
const printWeather = require('../src/printWeather');

const mockIpLocation = require('./mockResponse/ipLocation.json');

context('index', () => {
  let scope;

  let getPublicIpStub;
  let fetchLocationNameStub;

  let consoleErrorSpy;

  beforeEach(function () {
    process.argv = process.argv.slice(0, 2);
  });

  afterEach(() => {
    scope.done();
    nock.cleanAll();
    consoleErrorSpy.restore();
    process.argv = process.argv.slice(0, 2);
  });

  it('should stop the app if no location is found', async function () {
    this.timeout(0);

    consoleErrorSpy = sinon.spy(console, 'error');
    getPublicIpStub = sinon.stub(publicIp, 'getPublicIp').returns('24.48.0.1');
    scope = nock('http://ip-api.com').get('/json/24.48.0.1').reply(404);

    axios.defaults.adapter = require('axios/lib/adapters/http');
    await index
      .run()
      .then(
        () =>
          expect(
            consoleErrorSpy.calledWith(
              'No location is available with your IP address.\n Please input a location.'
            )
          ).to.be.true
      );

    getPublicIpStub.restore();
    consoleErrorSpy.restore();
  });

  it('should stop the app if no forecast is found for the location by IP', async function () {
    this.timeout(0);

    consoleErrorSpy = sinon.spy(console, 'error');
    getPublicIpStub = sinon.stub(publicIp, 'getPublicIp').returns('24.48.0.1');
    fetchLocationNameStub = sinon
      .stub(apiCall, 'fetchLocationName')
      .returns('Montréal');
    scope = nock('https://www.metaweather.com')
      .get('/api/location/search/')
      .query({ query: 'Montréal' })
      .reply(404);

    axios.defaults.adapter = require('axios/lib/adapters/http');

    await index
      .run()
      .then(
        () =>
          expect(
            consoleErrorSpy.calledWith(
              'No forcast is available for your area: Montréal.\n Please input a location.'
            )
          ).to.be.true
      );

    getPublicIpStub.restore();
    consoleErrorSpy.restore();
    fetchLocationNameStub.restore();
  });

  it('should stop the app if no forecast is found for the location entered', async function () {
    this.timeout(0);

    process.argv[2] = 'Montréal';

    consoleErrorSpy = sinon.spy(console, 'error');

    scope = nock('https://www.metaweather.com')
      .get('/api/location/search/')
      .query({ query: 'Montréal' })
      .reply(404);

    axios.defaults.adapter = require('axios/lib/adapters/http');

    await index
      .run()
      .then(
        () =>
          expect(
            consoleErrorSpy.calledWith(
              'No forcast is available for: Montréal.\n Please input an another location.'
            )
          ).to.be.true
      );
    consoleErrorSpy.restore();
  });

  it('should select the first location if only one location is found', async () => {
    sinon.restore();
    process.argv[2] = 'montréal';

    const printLocationChoisesStub = sinon
      .stub(IOHandler, 'printLocationChoises')
      .resolves(0);

    await index.run().then(() => {
      expect(printLocationChoisesStub.callCount === 0).to.be.true;
    });

    printLocationChoisesStub.restore();
  });

  it('should ask the user to chose a location if multiple location is returned', async () => {
    sinon.restore();
    process.argv[2] = 'mon';

    const printLocationChoisesStub = sinon
      .stub(IOHandler, 'printLocationChoises')
      .resolves(0);

    await index.run().then(() => {
      expect(printLocationChoisesStub.callCount === 1).to.be.true;
    });

    printLocationChoisesStub.restore();
  });

  it('should stop the app if the user cancel the choice of location', async () => {
    sinon.restore();
    process.argv[2] = 'mon';

    const fetchWeatherSpy = sinon.spy(apiCall, 'fetchWeather');
    const printLocationChoisesStub = sinon
      .stub(IOHandler, 'printLocationChoises')
      .resolves(-1);

    await index.run().then(() => {
      expect(fetchWeatherSpy.callCount === 0).to.be.true;
    });

    fetchWeatherSpy.restore();
    printLocationChoisesStub.restore();
  });

  it('should stop the app if an error happen when the forcast is fetched', async () => {
    sinon.restore();
    process.argv[2] = 'montréal';

    consoleErrorSpy = sinon.spy(console, 'error');
    const fetchWeatherStub = sinon.stub(apiCall, 'fetchWeather').throws();

    await index.run().then(() => {
      expect(
        consoleErrorSpy.calledWith(
          'Something went wrong while fetching the forecast.'
        )
      ).to.be.true;
    });

    fetchWeatherStub.restore();
  });

  it('should print the forcast', async () => {
    sinon.restore();
    process.argv[2] = 'montréal';

    const printSpy = sinon.spy(printWeather, 'print');

    await index.run().then(() => {
      expect(printSpy.callCount === 1).to.be.true;
    });

    printSpy.restore();
  });
});
