import log from '@logger'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import { utils, writeFile } from 'xlsx'
import { resolve} from 'path'
import { some, transform, map } from 'lodash'

const TAG = '[ExportToExcelService]'

export default class ExportToExcelService {
    private readonly _amortizationScheduleRepository: AmortizationScheduleRepository

    constructor({ AmortizationScheduleRepository }) {
        this._amortizationScheduleRepository = AmortizationScheduleRepository
    }

    public async exportToExcel(
        data: any,
        workSheetColumnNames: any,
        workSheetName: any,
        filePath: any
    ): Promise<any> {
        try {
            const workBook = await utils.book_new()
            const workSheetData = [
                workSheetColumnNames,
                ...data
            ]

            const workSheet = await utils.aoa_to_sheet(workSheetData)
            await utils.book_append_sheet(workBook, workSheet, workSheetName)
            await writeFile(workBook, resolve(filePath))
        } catch (error) {
            throw new Error(error)
        }

    }

    public async exportAmortizationSchedule(
        amortizationSchedules: any,
        workSheetColumnNames: any,
        workSheetName: any,
        filePath: any
    ): Promise<any> {
        try {
            const data = await Promise.all(map(amortizationSchedules, async (amortizationSchedule) => {

                return [
                    amortizationSchedule.principal_amount,
                    amortizationSchedule.factoring_fees,
                    amortizationSchedule.total_daily_repayment,
                    amortizationSchedule.remaining_principal,
                    amortizationSchedule.remaining_total_balance,
                    amortizationSchedule.payments.daily_sales,
                    amortizationSchedule.payments.with_holding_amount,
                    amortizationSchedule.payments.principal_amount,
                    amortizationSchedule.payments.factoring_fees,
                    amortizationSchedule.payments.remaining_principal,
                    amortizationSchedule.payments.remaining_total_balance,
                ]
            }))

            this.exportToExcel(data, workSheetColumnNames, workSheetName, filePath)
        } catch (error) {
            throw new Error(error)
        }

    }
}
