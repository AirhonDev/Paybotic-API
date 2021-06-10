import * as express from 'express'

import Controller from './CashAdvanceApplicationController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.post('/', Controller.createCashAdvanceApplication)
	.get('/', Controller.retrieveListOfCashAdvanceApplications, Metadata)
	.get(
		'/:cashAdvanceApplicationId',
		Controller.retrieveCashAdvanceApplicationById,
		Metadata,
	)
