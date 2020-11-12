import jsonWebToken from "jsonwebtoken";
import log from "../common/logger";
import { app } from "../config";
import { ResData, MiddleWare } from "@/type";

/**
 * jwt verify
 * @param path 
 * @param isVerify 
 */
const jwt: MiddleWare = (path: string, isVerify: boolean) => async (
  ctx,
  next
) => {
  // 签发 Token，并添加到 header 中
  ctx.sign = (payload: { uid: string; name: string }, exp: number) => {
    const token = jsonWebToken.sign(payload, app.secret, {
      expiresIn: exp || app.exp,
    });
    ctx.set("Authorization", token);
  };

  if (isVerify && path === ctx.path) {
    if (!ctx.header || !ctx.header.authorization) {
      ctx.body = {
        code: 401,
        msg: "Authorization not exist",
      };
    } else {
      const credentials = ctx.header.authorization;
      try {
        ctx.state.token = await jsonWebToken.verify(credentials, app.secret);
      } catch (err) {
        err.url = ctx.url;
        log.error(err);
        const obj: ResData = {
          code: 401,
          msg: err.message,
        };
        if (ctx.app.env === "development") {
          obj.err = err;
        }
        ctx.body = obj;
      }
      // 通过 jwt 校验，转入下一个中间件
      if (ctx.state.token) await next();
    }
  } else {
    await next();
  }
};

export default jwt;
