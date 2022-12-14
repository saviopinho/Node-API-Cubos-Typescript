import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizeError } from '../helper/ApiError';
import { transactionRepo } from '../data/repositories/transactionRepository';
import Utils from '../helper/utils';
import { v4 as uuid } from 'uuid';
import { accountRepo } from '../data/repositories/accountRepository';
import { Transaction } from '../data/entities/Transaction';

class TransactionsController {
    async createOne(req: Request, res: Response, next: NextFunction) {
        const { accountId } = req.params;
        const { value, description } = req.body;

        if (!(value && description)) {
            throw new BadRequestError('All input is required');
        }

        const transactionList = await transactionRepo.findBy({
            accountId,
        });

        const balance = Utils.getBalance(transactionList as []);

        if (Number(balance) + Number(value) < 0) {
            throw new UnauthorizeError(
                'Insufficient funds for that transaction'
            );
        }

        const transactionData = {
            id: uuid(),
            value,
            description,
            accountId,
        };

        const foundAccount = await accountRepo.findOneBy({ id: accountId });

        if (!foundAccount) {
            throw new UnauthorizeError(
                'Account ID does not exist in Account table.'
            );
        }

        const newTransaction = transactionRepo.create(transactionData);
        await transactionRepo.save(newTransaction);

        const responseData = {
            id: newTransaction.id,
            value: newTransaction.value,
            description: newTransaction.description,
            createdAt: newTransaction.createdAt,
            updatedAt: newTransaction.updatedAt,
        };

        res.status(201).json(responseData);
    }

    async fetchAll(req: Request, res: Response, next: NextFunction) {
        const { accountId } = req.params;

        const transactionList = await transactionRepo.find({
            where: { accountId },
        });

        const responseData = transactionList.map((el: Transaction) => {
            return {
                id: el.id,
                value: Number(el.value),
                description: el.description,
                createdAt: el.createdAt,
                updatedAt: el.updatedAt,
            };
        });

        req.body.list = responseData;
        req.body.title = 'transactions';

        next();
    }

    async fetchBalance(req: Request, res: Response, next: NextFunction) {
        const { accountId } = req.params;
        const transactionList = await transactionRepo.findBy({ accountId });
        const balance = Utils.getBalance(transactionList as []);

        return res
            .status(200)
            .send({ balance: parseFloat(balance.toFixed(2)) });
    }

    async execTransfer(req: Request, res: Response, next: NextFunction) {
        const { accountId } = req.params;
        const { receiverAccountId, value, description } = req.body;

        if (!(receiverAccountId && value && description)) {
            throw new BadRequestError('All input is required');
        }

        const transactionList = await transactionRepo.findBy({
            accountId,
        });

        const balance = Utils.getBalance(transactionList as []);

        if (Number(balance) - Number(value) < 0) {
            throw new UnauthorizeError('Insufficient funds for transfer');
        }

        const senderData = {
            id: uuid(),
            value: -value,
            description,
            accountId,
        };

        const receiverData = {
            id: uuid(),
            value,
            description,
            accountId: receiverAccountId,
        };

        const newSenderTransaction = transactionRepo.create(senderData);
        const newReceiverTransaction = transactionRepo.create(receiverData);

        await transactionRepo.save(newSenderTransaction);
        await transactionRepo.save(newReceiverTransaction);

        const transfeData = {
            id: newReceiverTransaction.id,
            value: newReceiverTransaction.value,
            description: newReceiverTransaction.description,
            createdAt: newReceiverTransaction.createdAt,
            updatedAt: newReceiverTransaction.updatedAt,
        };

        res.status(201).send(transfeData);
    }

    async execRevert(req: Request, res: Response, next: NextFunction) {
        const { accountId, transactionId } = req.params;

        const transactionList = await transactionRepo.findBy({
            accountId,
        });

        const foundTransaction = await transactionRepo.findOneBy({
            id: transactionId,
        });

        if (foundTransaction!.reversedAt) {
            throw new UnauthorizeError(
                'The same transaction cannot be reversed more than once'
            );
        }

        const balance = Utils.getBalance(transactionList as []);
        const reversedValue = -foundTransaction!.value;

        if (Number(balance) + Number(reversedValue) < 0) {
            throw new UnauthorizeError('Negative balance is not allowed');
        }

        const revertDate = new Date();

        const revertData = {
            id: uuid(),
            value: parseFloat(reversedValue.toFixed(2)),
            description: 'Refund of improper transaction',
            accountId,
            reversedAt: revertDate,
        };

        await transactionRepo.update(
            { id: transactionId },
            { reversedAt: revertDate }
        );

        const newTransaction = transactionRepo.create(revertData);
        await transactionRepo.save(newTransaction);

        const revertResponseData = {
            id: newTransaction.id,
            value: Number(foundTransaction!.value),
            description: newTransaction.description,
            createdAt: newTransaction.createdAt,
            updatedAt: newTransaction.updatedAt,
        };

        res.status(201).send(revertResponseData);
    }
}

export default new TransactionsController();
