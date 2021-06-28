export interface IAmortizationSchedule {
	uuid: number
	cash_advance_application_id: number
	principal_amount: number
	factoring_fees: number
	total_daily_repayment: number
	actual_amount_paid: number
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
