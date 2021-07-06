import * as express from 'express'
import Controller from './CashAdvancePaymentsController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.get('/', Controller.retrieveListOfCashAdvancePayments, Metadata)
