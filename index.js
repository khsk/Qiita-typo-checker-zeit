const { get, post, router } = require('microrouter')
const checker = require('./checker')
const pug = require('pug');
const compiledFunction = pug.compileFile('template.pug');

module.exports = router(
  get('/', () => compiledFunction()),
//  post('/users', createUser()),
  post('/', checker.main),
  () => 'not found',
)
