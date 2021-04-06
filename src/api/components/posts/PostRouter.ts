import * as express from 'express'

import Controller from './PostController'
import Metadata from '@middlewares/error.handler'

export default express
	.Router()
	.get('/', Controller.retrieveListofLoanee, Metadata)
