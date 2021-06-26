import * as express from 'express'
import Controller from './AmortizationScheduleController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.get('/', Controller.retrieveListOfAmortizationSchedules, Metadata)
