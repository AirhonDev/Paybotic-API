import { asClass, Lifetime, AwilixContainer } from 'awilix'
import l from '@logger'

import PostRepository from '@components/posts/PostRepository'

const REPOSITORIES = [PostRepository]

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
