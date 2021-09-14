import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import {OperationType} from '../../entities/Statement';

let createStatementUseCase :  CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersMemory: InMemoryUsersRepository;
let inMemoryStatementMemory: InMemoryStatementsRepository;



describe('Get Balance',()=> {

    beforeEach(() => {
        inMemoryStatementMemory = new InMemoryStatementsRepository();
        inMemoryUsersMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersMemory);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersMemory, inMemoryStatementMemory)
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementMemory, inMemoryUsersMemory)
    })

    it('should be able a get balance', async()=>{
        const user = await createUserUseCase.execute({
            name: 'Test',
            email: 'teste@teste.com.br',
            password: '12345'

        });

        await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: 'Depósito bancário'
        });
        await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: 'Depósito bancário'
        });

        const balance = await getBalanceUseCase.execute({ user_id: user.id})
        expect(balance).toHaveProperty('balance');

    });


});
