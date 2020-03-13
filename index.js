
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/persistence-store.min.js')
} else {
  module.exports = require('./dist/persistence-store.js')
}

