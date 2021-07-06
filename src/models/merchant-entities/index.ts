export interface IMerchantEntities {
	merchantId: number
	merchantHandle: string
	privateKey: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IMerchantEntitiesDto {
	merchantId: number
	merchantHandle: number
	privateKey: string
}
