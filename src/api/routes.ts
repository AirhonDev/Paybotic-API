import { Application } from 'express'

import PostRouter from '@components/posts/PostRouter'
import MerchantRouter from '@components/merchants/MerchantRouter'
import SettlementRouter from '@components/settlements/SettlementRouter'
import CashAdvanceApplicationRouter from '@components/cash-advance-application/CashAdvanceApplicationRouter'
import AmortizationScheduleRouter from '@components/amortization-schedules/AmortizationScheduleRouter'

function v1Routes(app: Application): void {
	app.use('/api/v1/posts', PostRouter)
	app.use('/api/v1/merchants', MerchantRouter)
	app.use('/api/v1/cash-advance-applications', CashAdvanceApplicationRouter)
	app.use('/api/v1/settlements', SettlementRouter)
	app.use('/api/v1/amortization-schedules', AmortizationScheduleRouter)
}

export default function routes(app: Application): void {
	v1Routes(app)
}
