export interface IBusinessInformation {
	uuid: number
	owner1FirstName: string
	owner1LastName: string
	owner2FirstName: string
	owner2LastName: string
	primaryContactName: string
	idNumber: string
	tinType: string
	businessLicense: string
	title: string
	businessLicenseState: string
	numberOfLocations: number
	businessFormationDate: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IBusinessInformationDto {
	owner1FirstName: string
	owner1LastName: string
	owner2FirstName: string
	owner2LastName: string
	primaryContactName: string
	idNumber: string
	tinType: string
	businessLicense: string
	businessLicenseState: string
	numberOfLocations: number
	businessFormationDate: string
	title: string
}
