const axios = require('axios').default;

const api = require('./publicIp');

const callAPI = async (endUrl, query) => {
  return await axios
    .get(`https://www.metaweather.com/api${endUrl}`, {
      params: query ? { query: query } : {},
    })
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorMessage = `${err.response.status}:${err.response.statusText}`;
      throw new Error(errorMessage);
    });
};

const fetchLocationId = async locationName => {
  return await callAPI('/location/search/', locationName)
    .then(results => {
      if (results.length === 0) {
        throw new Error(`No result for "${locationName}"`);
      }
      return results.map(result => {
        return { title: result.title, locationId: result.woeid };
      });
    })
    .catch(err => {
      throw new Error(err.message);
    });
};

const fetchWeather = async locationID => {
  if (!Number.isInteger(locationID) || locationID < 0) {
    throw new Error('parameter "locationID" invalid.');
  }
  return await callAPI(`/location/${locationID}`)
    .then(({ consolidated_weather }) => {
      const result = consolidated_weather[0];
      return {
        weather_name: result.weather_state_name,
        weather_code: result.weather_state_abbr,
        temp: result.the_temp,
        min_temp: result.min_temp,
        max_temp: result.max_temp,
      };
    })
    .catch(err => {
      throw new Error(err.message);
    });
};

const fetchLocationName = async () => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  const ip = await api.getPublicIp();
  if (!ipRegex.test(ip)) {
    throw new Error('apiCal.fetchLocation\nIP address invalid');
  }
  return await axios
    .get(`http://ip-api.com/json/${ip}`)
    .then(({ data }) => {
      return data.city;
    })
    .catch(err => {
      const errorMessage = `${err.response.status}:${err.response.statusText}`;
      throw new Error(`apiCal.fetchLocation\n${errorMessage}`);
    });
};

module.exports = {
  fetchLocationId,
  fetchWeather,
  fetchLocationName,
};
