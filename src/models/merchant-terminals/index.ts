export interface IMerchantTerminal {
	merchant_id: number
	terminal_api_id: number
	name: string
	createdAt: Date
	updatedAt: Date
	dateArchived: Date
	archived: boolean
}

export interface IMerchantTerminalDto {
	uuid: number
	merchant_id: number
	terminal_api_id: number
	name: string
}
