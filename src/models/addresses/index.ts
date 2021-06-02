export interface IAddress {
	uuid: number
	street_address: string
	city: string
	state: string
	zipCode: number
	country: number
	phoneNumber: number
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IAddressDto {
	uuid: number
}
