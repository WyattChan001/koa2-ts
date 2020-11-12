import fs from "fs";
import path from "path";
import http from "http";
import { Context } from "koa";
import { get, post } from "../decorator/httpMethod";
import log from "../common/logger";
const folder = path.normalize(__dirname + "/../../public");

export default class Common {
  /**
   * 检查 jwt 是否有效
   * @param ctx
   */
  @get("/check", true)
  async checkJwt(ctx: Context) {
    ctx.body = {
      code: 0,
      msg: "登录有效",
    };
  }

  /**
   * 上传 formData
   * @param ctx
   * 参数格式{file: File}
   */
  @post("/upload")
  async uploadFile(ctx: Context) {
    const file = ctx.request.files.file;
    const dotPos = file.name.indexOf(".");
    const fileName =
      file.name.substr(0, dotPos) +
      new Date().getTime() +
      file.name.substr(dotPos);
    const filePath = folder + fileName;
    const stream = fs.createWriteStream(filePath); // 创建可写流
    fs.createReadStream(file.path).pipe(stream);
    // 删除 file 临时文件
    fs.unlink(file.path, (err) => {
      if (err) log.error(err);
    });
    ctx.body = {
      code: 0,
      data: filePath,
      msg: "success",
    };
  }

  /**
   * @description 上传 base64
   * @param ctx
   * 参数格式 {name: string, data: string}
   */
  async uploadBase64(ctx: Context) {
    const form = ctx.request.body;
    const { dir, name, ext } = path.parse(form.name);
    const fileName = dir + "/" + name + new Date().getTime() + ext;
    const filePath = folder + fileName;
    const bas64Data = form.data.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(bas64Data, "base64");
    fs.writeFileSync(filePath, dataBuffer);
    ctx.body = {
      code: 0,
      data: filePath,
      msg: "success",
    };
  }

  async downLoad(ctx: Context) {
    const form = ctx.request.body;
    const that = this;
    for (const { k, v } of form) {
      that.downLoadRemote(k, v);
    }

    ctx.body = await {
      status: 0,
      msg: "download success!",
    };
  }

  /**
   * @description 下载网络文件到本地
   * @param fileName
   * @param src
   */
  private downLoadRemote(fileName: string, src: string) {
    let imgData = "";
    const ext = path.extname(src);
    const dir = path.normalize(__dirname + "/../..");

    http.get(src, (res) => {
      res.setEncoding("binary"); // 一定要设置 response 的编码为 binary，否则下载下来的文件打不开
      res.on("data", (chunk) => {
        imgData += chunk;
      });

      res.on("end", () => {
        // ! 必须使用绝对路径
        fs.writeFile(
          dir + "/upload/download/" + fileName + ext,
          imgData,
          "binary",
          (err) => {
            console.log("%s download %s", fileName, err ? "fail" : "success");
          }
        );
      });
    });
  }
}
