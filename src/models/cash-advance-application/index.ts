export interface ICashAdvanceApplication {
	uuid: number
	merchantId: number
	principalAmount: number
	startDate: Date
	endDate?: Date
	paymentFrequency: string
	factorRate: number
	originationFee: number
	repaymentType: string
	status: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface ICashAdvanceApplicationDto {
	merchantId: number
	principalAmount: number
	startDate: string
	paymentFrequency: string
	factorRate: number
	originationFee: number
	repaymentType: string
	status: string
}
