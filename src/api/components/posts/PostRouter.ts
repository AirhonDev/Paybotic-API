import * as express from 'express'

import Controller from './PostController'
import Metadata from '@middlewares/metadata.list'

export default express
	.Router()
	.get('/', Controller.retrieveListofPosts, Metadata)
