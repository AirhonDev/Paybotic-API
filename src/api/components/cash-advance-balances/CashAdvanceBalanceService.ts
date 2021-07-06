const { CASH_ADVANCE_PAYMENTS_TABLE } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import * as moment from 'moment'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvanceBalanceRepository from '@components/cash-advance-balances/CashAdvanceBalanceRepository'


export default class CashAdvanceBalanceService {
    private readonly _cashAdvanceBalanceRepository: CashAdvanceBalanceRepository

    constructor({
        CashAdvanceBalanceRepository,
    }) {
        this._cashAdvanceBalanceRepository = CashAdvanceBalanceRepository
    }

    public async retrieveCashAdvanceBalanceById(condition): Promise<any> {
        let cashAdvanceApplicationResult
        try {
            cashAdvanceApplicationResult = await this._cashAdvanceBalanceRepository.findOneByUuid(
                condition.cashAdvanceApplicationId,
            )
        } catch (DBError) {
            throw new Error(DBError)
        }

        return cashAdvanceApplicationResult
    }

}