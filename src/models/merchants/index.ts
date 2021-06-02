export interface IMerchant {
	uuid: number
	name: string
	email: string
	businessName: string
	physicalAddressId: number
	corporateAddressId: number
	businessInformationId: number
	businessEntity: Object
	bankName: string
	BankAccountNumber: string
	bankAccountRountingNumber: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IMerchantDto {
	uuid: number
}
