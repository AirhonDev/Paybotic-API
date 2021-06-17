import * as express from 'express'
import Controller from './SettlementController'
import Metadata from '@middlewares/metadata.list'

export default express.Router().post('/', Controller.settlePayments)
