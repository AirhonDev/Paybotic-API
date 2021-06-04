import * as express from 'express'

import Controller from './MerchantController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.post('/', Controller.createMerchant, Metadata)
	.get('/', Controller.retrieveListOfMerchants, Metadata)
