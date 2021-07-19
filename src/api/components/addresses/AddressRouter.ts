import * as express from 'express'

import Controller from './AddressController'
import Metadata from '@middlewares/metadata.list'

export default express.Router().put('/:addressId', Controller.updateAddress)
