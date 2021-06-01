import { Application } from 'express'

import PostRouter from '@components/posts/PostRouter'
import MerchantRouter from '@components/merchants/MerchantRouter'

function v1Routes(app: Application): void {
	app.use('/api/v1/posts', PostRouter)
	app.use('/api/v1/merchants', MerchantRouter)
}

export default function routes(app: Application): void {
	v1Routes(app)
}
