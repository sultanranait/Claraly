import { ModelStatic, Sequelize } from "sequelize";
import { UserModel } from "./user_model";
import { getEnvVarOrFail } from "../shared/config";

export type DB = {
  sequelize: Sequelize;
  userModel: ModelStatic<UserModel>;
};

let db: DB | undefined;
export const getDB = (): DB => {
  if (!db) throw new Error("DB not initialized");
  return db;
};

async function initDB(): Promise<void> {
  const sqlDBCreds = getEnvVarOrFail("DB_CREDS");

  console.log(sqlDBCreds)
  // get database creds
  var dbCreds = JSON.parse(sqlDBCreds);
  console.log(dbCreds)
  console.log("[server]: connecting to db...");
  var sequelize = new Sequelize(
    dbCreds.dbname,
    dbCreds.username,
    dbCreds.password,
    {
      host: dbCreds.host,
      port: dbCreds.port,
      dialect: dbCreds.engine,
    }
  );
  // define all models
  let userModel = UserModel.define(sequelize);

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    console.log("[server]: connecting to db success!");
  } catch (err) {
    console.log("[server]: connecting to db failed :(");
    console.log(err);
    throw err;
  }
  db = {
    sequelize,
    userModel,
  };
}

export default initDB;
