import * as express from 'express'

import Controller from './MerchantController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.post('/', Controller.createMerchant)
	.get('/', Controller.retrieveListOfMerchants, Metadata)
	.get('/:merchantId', Controller.retrieveMerchantById, Metadata)
	.put('/:merchantId', Controller.updateMerchant, Metadata)
