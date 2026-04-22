# 1. 换成 node:20，它更新，环境适配性更好
FROM node:20

# 2. 安装编译 sqlite3 必须的工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. 只拷贝 package 文件，防止本地 node_modules 干扰
COPY package*.json ./

# 4. 强制从源码重新编译 sqlite3，确保它能在 Linux 下跑
RUN npm install --build-from-source sqlite3
RUN npm install

# 5. 拷贝剩下的代码
COPY . .

# 6. 暴露端口
EXPOSE 7070

# 7. 启动
CMD ["node", "server.js"]
