import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostRepository from '@components/posts/PostRepository'
import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'

const REPOSITORIES = [
	PostRepository,
	MerchantRepository,
	AddressRepository,
	CashAdvanceApplicationRepository,
	BusinessInformationRepository,
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
