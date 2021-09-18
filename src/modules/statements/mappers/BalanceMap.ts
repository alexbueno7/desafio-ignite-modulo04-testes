import { OperationType, Statement } from "../entities/Statement";

interface BalanceMapDTO{
  statement: Statement[];
  balance: number;
}
export class BalanceMap {
  static toDTO({statement, balance}: BalanceMapDTO) {
    const parsedStatement = statement.map((statement) => {
      const statementDTO = {
        id: statement.id,
        amount: Number(statement.amount),
        description: statement.description,
        type: statement.type,
        created_at: statement.created_at,
        updated_at: statement.updated_at
      }

      if (statement.type === OperationType.TRANSFER){
        return Object.assign(statementDTO, { sender_id: statement.sender_id})
      }

      return statementDTO
    })

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
