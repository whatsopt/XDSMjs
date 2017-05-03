const path = require('path');

module.exports = {
  entry: './xdsm-main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'xdsm.bundle.js'
  }
};
