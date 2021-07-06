import { Application } from 'express'

import PostRouter from '@components/posts/PostRouter'
import MerchantRouter from '@components/merchants/MerchantRouter'
import SettlementRouter from '@components/settlements/SettlementRouter'
import CashAdvanceApplicationRouter from '@components/cash-advance-application/CashAdvanceApplicationRouter'
import AmortizationScheduleRouter from '@components/amortization-schedules/AmortizationScheduleRouter'
import CashAdvancePaymentsRouter from '@components/cash-advance-payments/CashAdvancePaymentsRouter'
import CashAdvanceBalanceRouter from '@components/cash-advance-balances/CashAdvanceBalanceRouter'
import BusinessInformationRouter from '@components/business-informations/BusinessInformationRouter'
import AddressRouter from '@components/addresses/AddressRouter'

function v1Routes(app: Application): void {
	app.use('/api/v1/posts', PostRouter)
	app.use('/api/v1/merchants', MerchantRouter)
	app.use('/api/v1/cash-advance-applications', CashAdvanceApplicationRouter)
	app.use('/api/v1/settlements', SettlementRouter)
	app.use('/api/v1/amortization-schedules', AmortizationScheduleRouter)
	app.use('/api/v1/cash-advance-payments', CashAdvancePaymentsRouter)
	app.use('/api/v1/cash-advance-balances', CashAdvanceBalanceRouter)
	app.use('/api/v1/business-informations', BusinessInformationRouter)
	app.use('/api/v1/addresses', AddressRouter)
}

export default function routes(app: Application): void {
	v1Routes(app)
}
