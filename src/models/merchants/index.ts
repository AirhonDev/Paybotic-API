export interface IMerchant {
	id: Number
	name: String
	email: String
	businessName: String
	physicalAddressId: Number
	corporateAddressId: Number
	businessInformationId: Number
	businessEntity: Object
	bankName: String
	BankAccountNumber: String
	bankAccountRountingNumber: String
	createdAt: Date
	updatedAt: Date
}

export interface IMerchantDto {
	id: Number
}
