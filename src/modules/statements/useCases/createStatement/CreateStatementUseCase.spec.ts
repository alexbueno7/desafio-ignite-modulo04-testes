import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

import { OperationType } from '../../entities/Statement';
import { AppError } from "../../../../shared/errors/AppError";

describe('Create a Statement', () => {

  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersMemory: InMemoryUsersRepository;
  let inMemoryStatementMemory: InMemoryStatementsRepository;

  beforeEach(() => {
    inMemoryStatementMemory = new InMemoryStatementsRepository();
    inMemoryUsersMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersMemory);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersMemory, inMemoryStatementMemory)
  })

  it('should be able create a new statement', async () => {
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

    expect(statement).toHaveProperty('id');
  })

  it('should not be able create a statement with user not exists', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com.br',
        password: '12345'
      })

      await createStatementUseCase.execute({
        user_id: 'user-id',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      });
    }).rejects.toBeInstanceOf(AppError)
  })
})
