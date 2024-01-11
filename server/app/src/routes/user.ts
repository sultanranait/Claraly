import { Response, Request } from "express";
import bcrypt from "bcrypt";
import Router from "express-promise-router";
import status from "http-status";
import { v4 as uuidv4 } from "uuid";
import { getDB } from "../models/db";
import { Config } from "../shared/config";
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const router = Router();

/** ---------------------------------------------------------------------------
 * POST /example
 *
 * Example route to store some arbitrary value in the database for the user
 * making the request.
 *
 * @param   {string}  req.query.email  The value to store.
 * @param   {string}  req.query.password  The value to store.
 *
 * @return  {status}
 */
router.post("/signup", async (req: Request, res: Response) => {
  // validate required query params
  if (!req.body.email || !req.body.password) {
    return res
      .json({
        message: "Validation error.",
      })
      .sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    const checkUser = await getDB().userModel.findOne({
      where: { email: req.body.email },
    });

    if (checkUser) {
      return res
        .json({
          message: "User already exists.",
        })
        .sendStatus(status.BAD_REQUEST);
    }

    // create the value in the db
    bcrypt.hash(
      req.body.password,
      saltRounds,
      async function (err, hash: string) {
        if (err) {
          return res
            .json({
              message: "Something went wrong.",
            })
            .sendStatus(status.INTERNAL_SERVER_ERROR);
        }

        // Store hash in your password DB.
        await getDB().userModel.create({
          id: uuidv4(),
          email: req.body.email,
          password: hash,
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .json({
        message: "Something went wrong.",
      })
      .sendStatus(status.INTERNAL_SERVER_ERROR);
  }

  return res
    .json({
      message: "User signed up",
    })
    .sendStatus(status.OK);
});

router.post("/login", async (req: Request, res: Response) => {
  // validate required query params
  if (!req.body.email || !req.body.password) {
    return res
      .json({
        message: "Validation error.",
      })
      .sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    // create the value in the db
    const user = await getDB().userModel.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res
        .json({
          message: "User not found.",
        })
        .sendStatus(status.NOT_FOUND);
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res
        .json({
          message: "Invalid credentials.",
        })
        .sendStatus(status.UNAUTHORIZED);
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      "secret-key-to-be-saved-in-.env"
    );

    return res
      .json({
        access_token: token,
        email: user.email,
        date: (new Date()).toISOString()
      })
      .sendStatus(status.OK);
  } catch (error) {
    console.log(error);
    return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  }

  return res.sendStatus(status.OK);
});

export default router;
