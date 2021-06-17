export interface IAddress {
	uuid: number
	streetAddress: string
	city: string
	state: string
	zipCode: string
	country: string
	phoneNumber: string
	faxNumber: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IAddressDto {
	streetAddress: string
	city: string
	state: string
	zipCode: string
	country: string
	phoneNumber: string
	faxNumber: string
}
