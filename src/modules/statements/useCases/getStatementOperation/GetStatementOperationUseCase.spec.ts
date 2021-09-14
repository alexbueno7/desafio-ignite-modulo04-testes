import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

import { OperationType } from '../../entities/Statement';
import { AppError } from "../../../../shared/errors/AppError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe('Get statement operation', () => {

  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersMemory: InMemoryUsersRepository;
  let inMemoryStatementMemory: InMemoryStatementsRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() => {
    inMemoryStatementMemory = new InMemoryStatementsRepository();
    inMemoryUsersMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersMemory);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersMemory, inMemoryStatementMemory)
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersMemory, inMemoryStatementMemory)
  })

  it('should be able a get statement operation', async () => {
    const user = await createUserUseCase.execute({
      name: 'Test',
      email: 'test@test.com.br',
      password: '12345'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Depósito bancário'
    });

    const getStatementOperation = await getStatementOperationUseCase.execute(
      { user_id: user.id, statement_id: statement.id })

    expect(getStatementOperation).toHaveProperty('id');
  })

  it('should not be able a get balance with nonexists user', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com.br',
        password: '12345'
      });

      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      });

      await getStatementOperationUseCase.execute({ user_id: 'user-id', statement_id: statement.id })
    }).rejects.toBeInstanceOf(AppError);
  })

  it('should not be able a get balance with nonexists statement', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com.br',
        password: '12345'
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      });

      await getStatementOperationUseCase.execute({ user_id: 'user-id', statement_id: 'statement-id' })
    }).rejects.toBeInstanceOf(AppError);
  })
})
