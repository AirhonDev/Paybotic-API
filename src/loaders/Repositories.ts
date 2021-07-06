import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostRepository from '@components/posts/PostRepository'
import MerchantRepository from '@components/merchants/MerchantRepository'
import MerchantEntityRepository from '@components/merchant-entities/MerchantEntityRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'
import CashAdvanceBalanceRepository from '@components/cash-advance-balances/CashAdvanceBalanceRepository'

const REPOSITORIES = [
	PostRepository,
	MerchantRepository,
	AddressRepository,
	CashAdvanceApplicationRepository,
	BusinessInformationRepository,
	MerchantTerminalRepository,
	AmortizationScheduleRepository,
	MerchantEntityRepository,
	CashAdvancePaymentsRepository,
	CashAdvanceBalanceRepository,
]

export default (container: AwilixContainer): void => {
	REPOSITORIES.forEach((service: any) => {
		container.register(
			service.name,
			asClass(service, {
				lifetime: Lifetime.SINGLETON,
			}),
		)
		l.info(`Container ${service.name} has been initialized.`)
	})
}
