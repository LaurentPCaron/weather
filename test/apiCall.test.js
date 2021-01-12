const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const axios = require('axios').default;

const apiCall = require('../src/apiCall');
const ip = require('../src/publicIp');

const mockWeather = require('./mockResponse/weather.json');
const mockIpLocation = require('./mockResponse/ipLocation.json');

context('apiCall', () => {
  context('fetchLocationId', () => {
    it('should return an error message if the api throw an error', async () => {
      const scope = nock('https://www.metaweather.com')
        .get('/api/location/search/')
        .query({ query: 'mont' })
        .reply(404);

      axios.defaults.adapter = require('axios/lib/adapters/http');

      try {
        expect(await apiCall.fetchLocationId('mont')).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('404:null');
      }

      scope.done();
      nock.cleanAll();
    });

    it('should throw an error: "No result" if no the api can\'t find any location', async () => {
      try {
        expect(await apiCall.fetchLocationId('lolnope')).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('No result for "lolnope"');
      }
    });

    it('should return a array with the name and the location of the result', async () => {
      const response = await apiCall.fetchLocationId('mont');
      expect(response[0]).to.deep.equal({
        title: 'Montréal',
        locationId: 3534,
      });
      expect(response[1]).to.deep.equal({
        title: 'Edmonton',
        locationId: 8676,
      });
    });
  });

  context('fetchWeather', () => {
    it('should return an error if locationID is empty', async () => {
      try {
        expect(await apiCall.fetchWeather()).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('parameter "locationID" invalid.');
      }
    });

    it('should return an error if locationID is not valid', async () => {
      try {
        expect(await apiCall.fetchWeather()).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('parameter "locationID" invalid.');
      }
    });

    it('should return an error message if the api throw an error', async () => {
      const scope = nock('https://www.metaweather.com')
        .get('/api/location/1111')
        .reply(404);

      axios.defaults.adapter = require('axios/lib/adapters/http');

      try {
        expect(await apiCall.fetchWeather(1111)).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('404:null');
      }
      scope.done();
      nock.cleanAll();
    });

    it('should return an error if no result was found', async () => {
      try {
        expect(await apiCall.fetchWeather(0)).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('404:Not Found');
      }
    });

    it('should return a object if the id is valid', async () => {
      axios.defaults.adapter = require('axios/lib/adapters/http');
      const scope = nock('https://www.metaweather.com')
        .get('/api/location/110')
        .reply(200, mockWeather);

      const response = await apiCall.fetchWeather(110);

      expect(response).to.deep.equal({
        weather_name: 'Heavy Cloud',
        weather_code: 'hc',
        temp: 3.045,
        min_temp: -1.4,
        max_temp: 2.9450000000000003,
      });
      scope.done();
      nock.cleanAll();
    });
  });

  context('fetchLocationName', () => {
    let getPublicIpStub;

    afterEach(() => {
      getPublicIpStub.restore();
    });

    it('should thorow an error if the IP is not valid', async () => {
      getPublicIpStub = sinon.stub(ip, 'getPublicIp').returns('');

      try {
        expect(await apiCall.fetchLocationName()).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('apiCal.fetchLocation\nIP address invalid');
      }
    });

    it('shoud throw an error if the API return an error', async () => {
      getPublicIpStub = sinon.stub(ip, 'getPublicIp').returns('24.48.0.1');
      const scope = nock('http://ip-api.com').get('/json/24.48.0.1').reply(404);

      axios.defaults.adapter = require('axios/lib/adapters/http');

      try {
        expect(await apiCall.fetchLocationName()).to.be.undefined;
      } catch (err) {
        expect(err.message).equal('apiCal.fetchLocation\n404:null');
      }

      scope.done();
      nock.cleanAll();
    });

    it('should return "Montréal" if the ip send is "24.48.0.1"', async () => {
      getPublicIpStub = sinon.stub(ip, 'getPublicIp').returns('24.48.0.1');
      axios.defaults.adapter = require('axios/lib/adapters/http');
      const scope = nock('http://ip-api.com')
        .get('/json/24.48.0.1')
        .reply(200, mockIpLocation);

      expect(await apiCall.fetchLocationName()).to.deep.equal('Montréal');

      scope.done();
      nock.cleanAll();
    });
  });
});
