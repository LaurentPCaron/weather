const prompt = require('prompt');

const printLocationChoises = choices => {
  if (!Array.isArray(choices)) {
    throw new Error('Argument invalid');
  }
  return new Promise((resolve, reject) => {
    let message = '\n***Select a location****\n0- Cancel\n';
    choices.forEach((choice, index) => {
      message += `${index + 1}- ${choice}\n`;
    });
    const schema = {
      properties: {
        cityNumber: {
          message: message,
          required: true,
          warning: 'Invalide choice',
          conform: value => {
            const val = parseInt(value, 10);
            return val >= 0 && val <= choices.length;
          },
        },
      },
    };
    prompt.message = '';
    prompt.delimiter = '> ';

    prompt.start();

    prompt.get(schema, (err, result) => {
      resolve(result.cityNumber - 1);
    });
  });
};

module.exports = { printLocationChoises };
