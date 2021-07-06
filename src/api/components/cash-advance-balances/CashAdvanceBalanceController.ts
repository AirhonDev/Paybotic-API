import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'


const TAG = '[CashAdvanceBalanceController]'

export class Controller {
    public async retrieveCashAdvanceBalanceById(
        req: any,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        const METHOD = '[retrieveCashAdvanceBalanceById]'
        log.info(`${TAG} ${METHOD}`)
        const { CashAdvanceBalanceService } = req.container.cradle
        let result
        try {
            result = await CashAdvanceBalanceService.retrieveCashAdvanceBalanceById(
                req.params,
            )
        } catch (error) {
            return next(error)
        }

        return res.send(
            new CreateSucess(
                `Cash advance balance Successfully Retrieved`,
                result,
            ),
        )
    }

}

export default new Controller()
