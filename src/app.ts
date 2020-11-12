import path from "path";
import Koa, { Context } from "koa";
import KoaStatic from "koa-static";
import KoaBody from "koa-body";
import KoaRouter from "koa-router";
// import Favicon from "koa-favicon";

import log from "./common/logger";
import addRouter from "./route";
import tpl from "./middleware/tpl";
import errorHandler from "./middleware/error";

// import log from './c'

const app = new Koa();
const router = new KoaRouter();
const baseDir = path.normalize(__dirname + "/..");

app.use(
  KoaBody({
    jsonLimit: 1024 * 1024 * 5,
    formLimit: 1024 * 1024 * 5,
    textLimit: 1024 * 1024 * 5,
    multipart: true, // 解析 FormData 数据
    formidable: {
      uploadDir: path.join(baseDir, "upload"),
    },
  })
);

app.use(KoaStatic(path.join(baseDir, "public"), { index: false }));
// app.use(Favicon(path.join(baseDir, "public/favicon.jpg")));

// set template engine
app.use(tpl({ path: path.join(baseDir, "public") }));

// handle the error
app.use(errorHandler());

// add route
addRouter(router);
app.use(router.routes()).use(router.allowedMethods());

// deal 404
app.use(async (ctx: Context) => {
  log.error(`404 ${ctx.message}: ${ctx.href}`);
  ctx.status = 404;
  ctx.body = "404! content not found !";
});

// koa already had middleware to deal with the error, just register the error event
app.on("error", (err, ctx: Context) => {
  // ! log all errors
  log.error(err);
  ctx.status = 500;
  // thrown the error to frontEnd when in the develop mode
  if (ctx.app.env === "development") {
    ctx.res.end(err.stack);
  }
});

if (!module.parent) {
  const port = process.env.PORT || 4000;
  app.listen(port);
  log.info(`=== app server running on port ${port} ===`);
  console.log("app server running at: http://localhost:%d", port);
}
