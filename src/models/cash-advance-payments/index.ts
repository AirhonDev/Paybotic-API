export interface ICashAdvancePayment {
	cashAdvanceApplicationId: number
	amortizationScheduleId: number
	merchantId: number
	dailySales: number
	withHoldingAmount: number
	principalAmount: number
	factoringFees: number
	remainingPrincipal: number
	remainingTotalBalance: number
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface ICashAdvancePaymentDto {
	cashAdvanceApplicationId: number
	amortizationScheduleId: number
	merchantId: number
	dailySales: number
	withHoldingAmount: number
	factoringFees: number
	remainingPrincipal: number
	remainingTotalBalance: number
}
