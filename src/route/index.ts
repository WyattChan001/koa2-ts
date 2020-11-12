import "reflect-metadata";
import fs from "fs";
import path from "path";
import jwt from "../middleware/jwt";
import { ROUTER_MAP } from "../constant";
import { RouteMeta } from "../type";
import Router from "koa-router";

const addRouter = (router: Router) => {
  const ctrPath = path.join(__dirname, "../controller");
  console.log("ctrPath: ", ctrPath);
  const modules: ObjectConstructor[] = [];
  // ! 扫描 controller 文件夹，收集所有 controller
  fs.readdirSync(ctrPath).forEach((name) => {
    if (/^[^.]+\.(t|j)s$/.test(name)) {
      modules.push(require(path.join(ctrPath, name)).default);
    }
  });

  console.log("modules: ", modules);
  // ! 结合 meta 数据添加 路由 和 验证
  modules.forEach((m) => {
    const routerMap: RouteMeta[] =
      Reflect.getMetadata(ROUTER_MAP, m, "method") || [];
    if (routerMap.length) {
      const ctr = new m();
      routerMap.forEach((route) => {
        const { name, method, path, isVerify } = route;
        router[method](path, jwt(path, isVerify), ctr[name]);
      });
    }
  });
};

export default addRouter;
