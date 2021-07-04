export interface IAmortizationSchedule {
	uuid: number
	cashAdvanceApplicationId: number
	merchantId: number
	principalAmount: number
	factoringFees: number
	totalDailyRepayment: number
	actualAmountPaid: number
	status: string
	settlement_date: Date
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IAmortizationSchedulesDto {
	cash_advance_application_id: number
	amount: number
	actual_amount_paid: number
	settlement_date: Date
	status: string
}
