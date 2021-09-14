import { Connection, createConnection, getConnectionOptions } from 'typeorm';


export default async (host = "fin_api"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  return createConnection(
    Object.assign(defaultOptions, {
      host: "localhost",
      database: defaultOptions.database,
    })
  );
};
