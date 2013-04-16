module.exports = process.env.dragonfly_COV
  ? require('./lib-cov/dragonfly')
  : require('./lib/dragonfly');
