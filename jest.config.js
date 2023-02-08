const path = require('path');
const _ = require('lodash');
const packageConfig = require('./package.json');

const aliases = _.transform(packageConfig['_moduleAliases'] || {}, (res, val, key) => {
  res[`^${key}(.*)$`] = `<rootDir>/${val.replace('dist/', '')}$1`;
}, {})

module.exports = {
  clearMocks: true,
  rootDir: path.resolve(__dirname),
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: aliases,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {},
  preset: 'ts-jest',
  testEnvironment: 'node',
};
