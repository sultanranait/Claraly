import { Application } from "express";
import { processAuthorization } from "./middlewares/auth";
import user from "./user";
import webhook from './webhook';

export default (app: Application) => {
  app.use("/user", user);
  app.use("/webhook", webhook);
};
