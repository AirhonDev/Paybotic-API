import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostService from '@components/posts/PostService'
import MerchantService from '@components/merchants/MerchantService'
import CashAdvanceApplicationService from '@components/cash-advance-application/CashAdvanceApplicationService'

const SERVICES = [PostService, MerchantService, CashAdvanceApplicationService]

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
