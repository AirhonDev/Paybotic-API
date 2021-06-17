import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostRepository from '@components/posts/PostRepository'
import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'

const REPOSITORIES = [
	PostRepository,
	MerchantRepository,
	AddressRepository,
	CashAdvanceApplicationRepository,
	BusinessInformationRepository,
	MerchantTerminalRepository,
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
