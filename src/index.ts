import './env'

// if (process.env.USE_MODULE_ALIASES === 'true') {
//   require('module-alias/register');
//   console.log('Will use module aliases')
//   require('../module-aliases.js')()
// }

import Server from './server'
import routes from './api/routes'

const port = parseInt(process.env.APP_PORT)
export default new Server().router(routes).listen(port)
