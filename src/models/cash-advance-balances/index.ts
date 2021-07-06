export interface ICashAdvanceBalance {
	cashAdvanceApplicationId: number
	merchantId: number
	totalRevenue: number
	badDebtExpense: number
	factoringFeesCollected: number
	principalCollected: number
	cashAdvanceTotalRemainingBalance: number
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface ICashAdvanceBalanceDto {
	cashAdvanceApplicationId: number
	merchantId: number
	totalRevenue: number
	badDebtExpense: number
	factoringFeesCollected: number
	principalCollected: number
	cashAdvanceTotalRemainingBalance: number
}
