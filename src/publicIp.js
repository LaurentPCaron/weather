const publicIp = require('public-ip');

const getPublicIp = async () => {
  return await publicIp.v4();
};

module.exports = { getPublicIp };
