import { Application } from 'express'

import PostRouter from '@components/posts/PostRouter'

function v1Routes(app: Application): void {
	app.use('/api/v1/posts', PostRouter)
}

export default function routes(app: Application): void {
	v1Routes(app)
}
