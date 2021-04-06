import BaseRepository from '@baserepository'

export default class PostRepository extends BaseRepository {
	constructor() {
		super(process.env.POST_TABLE)
	}
}
