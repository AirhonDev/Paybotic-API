export interface IPost {
	uuid: string
	createdAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IPostDto {
	uuid: string
}
