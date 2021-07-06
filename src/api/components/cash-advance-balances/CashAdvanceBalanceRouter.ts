import * as express from 'express'

import Controller from './CashAdvanceBalanceController'
import Metadata from '@middlewares/metadata.list'

export default express
    .Router()
    .get(
        '/:cashAdvanceApplicationId',
        Controller.retrieveCashAdvanceBalanceById,
        Metadata,
    )