import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostService from '@components/posts/PostService'
import MerchantService from '@components/merchants/MerchantService'
import CashAdvanceApplicationService from '@components/cash-advance-application/CashAdvanceApplicationService'
// import BusinessInformationService from '@components/business-informations/BusinessInformationService'
import PaymentDashboardApiService from '@components/merchants/PaymentDashboardApiService'
import SettlementService from '@components/settlements/SettlementService'
import AmortizationScheduleService from '@components/amortization-schedules/AmortizationScheduleService'

const SERVICES = [
	PostService,
	MerchantService,
	CashAdvanceApplicationService,
	PaymentDashboardApiService,
	SettlementService,
	AmortizationScheduleService,
]

export default (container: AwilixContainer): void => {
	SERVICES.forEach((service: any) => {
		container.register(
			service.name,
			asClass(service, {
				lifetime: Lifetime.SINGLETON,
			}),
		)
		l.info(`Container ${service.name} has been initialized.`)
	})
}
