const program = require('caporal');

const publicIp = require('./publicIp');
const apiCall = require('./apiCall');
const IOHandler = require('./IOHandler');
const printWeather = require('./printWeather');

module.exports = {
  run: async () => {
    return new Promise((resolve, reject) => {
      program
        .version('0.0.1')
        .argument('[location]', 'Name of the location to get the weather')
        .action(async ({ location }) => {
          let locationName;
          let myIp;
          let locationIds;

          //Check if there's a argument
          if (location) {
            locationName = location;
          } else {
            myIp = await publicIp.getPublicIp();
            try {
              locationName = await apiCall.fetchLocationName(myIp);
            } catch (error) {
              console.error(
                'No location is available with your IP address.\n Please input a location.'
              );
              resolve();
              return;
            }
          }

          try {
            locationIds = await apiCall.fetchLocationId(locationName);
          } catch (error) {
            if (myIp) {
              console.error(
                `No forcast is available for your area: ${locationName}.\n Please input a location.`
              );
            } else {
              console.error(
                `No forcast is available for: ${locationName}.\n Please input an another location.`
              );
            }
            resolve();
            return;
          }

          let locationData;
          if (locationIds[1]) {
            const response = await IOHandler.printLocationChoises(
              locationIds
            ).then(res => {
              return res;
            });
            if (response === -1) {
              resolve();
              return;
            }
            locationData = locationIds[response];
          } else {
            locationData = locationIds[0];
          }

          let locationWeather;
          try {
            locationWeather = await apiCall.fetchWeather(
              locationData.locationId
            );
          } catch (error) {
            console.error('Something went wrong while fetching the forecast.');
            resolve();
            return;
          }

          printWeather.print(locationWeather, locationData.title);

          resolve();
        });

      program.parse(process.argv);
    });
  },
};
