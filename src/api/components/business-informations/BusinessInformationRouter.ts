import * as express from 'express'

import Controller from './BusinessInformationController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.put('/:businessInformationId', Controller.updateBusinessInformation)
