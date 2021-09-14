import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

import { OperationType } from '../../entities/Statement';

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("12345", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'user', 'user@test.com.br', '${password}', 'now()', 'now()')
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      password: "12345",
      email: "user@test.com.br",
    });

    const { token, id } = responseToken.body;


    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should be able to create a new withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      password: "12345",
      email: "user@test.com.br",
    });

    const { token, id } = responseToken.body;


    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 20,
        description: 'Retirada'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able create a statement without login', async () => {

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        user_id: 'user_id',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Depósito bancário'
      });

    expect(response.status).toBe(401);
  });
});
