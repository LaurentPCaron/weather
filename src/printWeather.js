const print = (locationData, locationName) => {
  if (
    !(
      locationData &&
      typeof locationData === 'object' &&
      'weather_name' in locationData &&
      'weather_code' in locationData &&
      'temp' in locationData &&
      'min_temp' in locationData &&
      'max_temp' in locationData &&
      typeof locationName === 'string'
    )
  ) {
    throw new Error('locationData invalid in printWeather.print');
  }
  let { weather_name, weather_code, temp, min_temp, max_temp } = locationData;

  temp = formatNumber(temp);
  min_temp = formatNumber(min_temp);
  max_temp = formatNumber(max_temp);

  const message = `${locationName}:\n${temp}℃\n${weather_name}\nMin:${min_temp}℃ Max:${max_temp}℃`;
  console.log(message);
};

const formatNumber = input => {
  return (Math.round((input + Number.EPSILON) * 10) / 10).toFixed(1);
};

module.exports = { print };
