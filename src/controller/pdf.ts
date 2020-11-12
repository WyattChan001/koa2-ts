import { Context } from "koa";
import { get } from "../decorator/httpMethod";
import log from "../common/logger";

export default class PdfController {
  @get("/pdf/print")
  async printPdf(ctx: Context) {
    log.info(`url: ${ctx.url} was visited, method: ${ctx.method}`);
    ctx.body = "<h1>你打印了一份pdf文件</h1>";
  }
}
