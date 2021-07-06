export interface IMerchant {
	uuid: number
	name: string
	email: string
	businessName: string
	physicalAddressId: number
	corporateAddressId: number
	businessInformationId: number
	businessEntity: string
	bankName: string
	bankType: string
	salesAgent1: string
	salesAgent2: string
	bankAccountNumber: string
	bankAccountRountingNumber: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IMerchantDto {
	name: string
	email: string
	businessName: string
	physicalAddressId: number
	corporateAddressId: number
	businessInformationId: number
	businessEntity: string
	bankName: string
	bankType: string
	bankAccountNumber: string
	bankAccountRountingNumber: string
	salesAgent1: string
	salesAgent2: string
	uuid: number
}
