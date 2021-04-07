const { APP_DOMAIN } = process.env

import { RetrieveSuccess } from '@responses'
import { omit } from 'lodash'

const buildUrl = (path, queries, editPageValue) => {
	const url = new URL(`${path}`)
	for (const query in queries) {
		if (query === 'page') {
			if (editPageValue) url.searchParams.append(query, `${editPageValue}`)
		} else {
			url.searchParams.append(query, queries[query])
		}
	}
	return url.toString()
}

export default (req, res, next): void => {
	const message = req.locals.message
	const total = req.locals.total
	const limit = req.query.perPage ? req.query.perPage : 5
	const lastPage = Math.ceil(Number(total) / Number(limit))
	const currentPage = req.query.page ? req.query.page : 1
	const path = `${APP_DOMAIN}${req.openapi.openApiRoute}`

	if (!req.query.page) req.query.page = 1

	const result = {
		data: req.locals.result,
		_links: {
			first: buildUrl(path, req.query, 1),
			last: buildUrl(path, req.query, lastPage),
			prev:
				currentPage <= 1 ? null : buildUrl(path, req.query, currentPage - 1),
			next:
				currentPage >= lastPage
					? null
					: buildUrl(path, req.query, currentPage + 1),
		},
		meta: {
			total: total,
			length: req.locals.result.length,
			currentPage: currentPage > lastPage ? lastPage : currentPage,
			startPage: 1,
			lastPage: lastPage,
			perPage: limit,
			path,
		},
	}

	res.send(new RetrieveSuccess(message, result))
}
