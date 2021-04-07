import { Request } from 'express'

import PostService from '@components/posts/PostService'

// declare namespace req {
//   export interface AwilixRequest extends Request {
//     container: {
//       cradle: {
//         PostService: PostService
//       }
//     }
//     query: {
//       apiKey: string
//     }
//     locals: any
//   }
// }

// export = req
interface AwilixRequest extends Request {
	container: {
		cradle: {
			PostService: PostService
		}
	}
	query: {
		apiKey: string
	}
	locals: any
}
