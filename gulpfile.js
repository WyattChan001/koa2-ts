const { src, dest, watch, series, task } = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const nodemon = require("gulp-nodemon");
const tsProject = ts.createProject("tsconfig.json");

function clean(cb) {
  // return del(["dist", cb]);
  return del(["dist"]);
}

// 输出 js 到 dist 目录
function toJs() {
  return src("src/**/*.ts").pipe(tsProject()).pipe(dest("dist"));
}

// nodemon 监控 ts 文件
function runNodemon() {
  nodemon({
    inspect: true,
    script: "src/app.ts",
    watch: ["src"],
    ext: "ts",
    env: {
      NODE_ENV: "development",
    },
  }).on("crash", () => {
    console.error("Application has crashed!\n");
  });
}

const build = series(clean, toJs);
task("build", build);
exports.build = build;
exports.default = runNodemon;
