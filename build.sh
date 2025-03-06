#!/bin/bash

# 安装前端依赖
cd frontend
npm install
npm run build

# 返回项目根目录
cd ..

# 提交更改
git add .
git commit -m "Build frontend"
git push 