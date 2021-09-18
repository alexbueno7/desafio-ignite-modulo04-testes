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
  });

  it('should be able to send a transfer to another user', async () => {
    const receiver = await createUserUseCase.execute({
      name: 'Test',
      email: 'test@test.com.br',
      password: '12345'
    });

    const sender = await createUserUseCase.execute({
      name: 'Test 2',
      email: 'test2@test.com.br',
      password: '12345'
    });

    await createStatementUseCase.execute({
      user_id: sender.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Depósito bancário'
    });

    const transfer = await createStatementUseCase.execute({
      user_id: receiver.id,
      type: OperationType.TRANSFER,
      amount: 50,
      description: 'Pizza',
      sender_id: sender.id
    });

    expect(transfer).toHaveProperty('id');
  });

  it('should not be able to send a transfer without funds', async () => {
    expect(async () => {
      const receiver = await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com.br',
        password: '12345'
      });

      const sender = await createUserUseCase.execute({
        name: 'Test 2',
        email: 'test2@test.com.br',
        password: '12345'
      });

      await createStatementUseCase.execute({
        user_id: sender.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      });

      await createStatementUseCase.execute({
        user_id: receiver.id,
        type: OperationType.TRANSFER,
        amount: 200,
        description: 'Pizza',
        sender_id: sender.id
      });

      }).rejects.toBeInstanceOf(AppError)
  })
})
