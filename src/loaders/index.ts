import { AwilixContainer } from 'awilix'

import initializeRepositories from './Repositories'
import initializeServices from './Services'

export default (container: AwilixContainer): void => {
	initializeRepositories(container)
	initializeServices(container)
}
