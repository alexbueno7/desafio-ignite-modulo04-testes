import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

import { OperationType } from '../../entities/Statement';

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it('should be able a get statement operation', async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      password: "12345",
      email: "user@test.com.br",
    });

    const { token, id } = responseToken.body;


    const statementResponse = await request(app)
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

      const statementId = statementResponse.body.id;

      const response = await request(app)
      .get("/api/v1/statements/"+statementId)
      .set({
        Authorization: `Bearer ${token}`,
      });
      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
  });

  it('should not be able a get statement with nonexists user', async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      password: "12345",
      email: "user@test.com.br",
    });

    const { token, id } = responseToken.body;


    const statementResponse = await request(app)
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

      const statementId = statementResponse.body.id;


      const response = await request(app)
      .get("/api/v1/statements/"+statementId)

      expect(response.status).toBe(401);
  });

  it('should not be able a get balance with nonexists statement', async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      password: "12345",
      email: "user@test.com.br",
    });

    const { token, id } = responseToken.body;


    const statementResponse = await request(app)
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

      const statementId = statementResponse.body.id;


      const response = await request(app)
      .get("/api/v1/statements/")
      .send(statementId)
      .set({
        Authorization: `Bearer ${token}`,
      });

      expect(response.status).toBe(404);
  })
});
