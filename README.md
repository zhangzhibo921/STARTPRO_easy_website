# easy_website
这是一个简单的官网内容管理系统，它可满足小微型企业或组织在几乎不需要技术基础的情况下快速搭建官网的需求，但这些需求仅限于普通的官网内容展示，几乎不会涉及到交互式的复杂功能。

一体化企业站/官网 CMS，提供可视化拖拽建站、赛博风模板、媒体管理、联系表单和通知中心。面向运营/市场/设计同学，后台直接拖组件、改文案、上传图片，即可发布官网。

## 你能做什么
- 拖拽搭建页面：选择模板块（Hero、Feature、Pricing、Timeline/Cyber-Timeline、Cyber Showcase、Contact 等），所见即所得。
- 主题和风格：内置赛博风暗/亮主题，按钮、输入、卡片保持统一视觉。
- 导航与页面管理：后台配置导航、页面、区块，保存即发布。
- 媒体库：上传图片/文件到 `/uploads`，也可复用默认素材。
- 联系表单与通知：表单内建校验与防刷；配置 SMTP 后可收到邮件，后台通知中心支持测试、重发。
- 角色权限：`admin / editor / viewer`，自动保护敏感页面（目前仅有admin）。

## 快速上手（本地体验）
###基础环境：nodejs 24.0+、mysql 8.0、nginx、
1) 安装依赖  
```bash
cd frontend
npm install
cd ../backend
npm install
npm install nodemailer@7 --save
```
2) 修改数据库配置(替换数据库账户和密码)
```bash
vim .env
```
3) 初始化数据库  
导入 `init.sql`，确保 MySQL 账户有建表权限。
```bash
source ./init.sql
```
4) 启动服务  
```bash
# 前端：http://localhost:3000
cd frontend && npm run build && npm start
# 后端 API：http://localhost:3003
cd ../backend && npm start
```
注意：也可以使用pm2管理启动进程
```bash
# 安装pm2管理工具
npm install -g pm2
# 进入前端目录，启动前端进程
cd frontend
npm run build
pm2 start npm --name "frontend" -- run start
# 进入后端目录，启动后端进程
cd ../backend
pm2 start npm --name "backend" -- run start
```
5) 登录后台  
打开 `http://localhost:3000/admin/login`。使用admin/admin123默认账户登录。

## 创建与发布页面
1) 后台点击“新建页面”或编辑现有页面。  
2) 在 Page Builder 中拖入组件，左侧改文字/图片/按钮链接，右侧实时预览。  
3) 需要时间轴/赛博展示等特殊模块，直接选对应模板即可。  
4) 切换主题/色彩检查视觉，保存后发布，前台立即生效。

## 媒体与上传
- 上传入口：后台媒体区或组件编辑时选择图片。  
- 体积限制：默认前台 10 MB、后台 100 MB，可在 `.env` 用 `MAX_UPLOAD_SIZE` 调整。  
- 存储位置：`/uploads`，部署时请让 Nginx/静态资源路径可访问。

## 联系表单与通知
- 表单：组件已接入 `/api/contact`，含校验、防刷（honeypot + rate-limit）。  
- 邮件通知：后台“通知设置”填写 SMTP，可用“发送测试”验证。  
- 消息中心：查看提交、标记已读、重发通知，便于跟进线索。

## 部署要点
- 前端：`cd frontend && npm run build && npm start`。  
- 后端：`cd backend && npm start`，保持端口与前端环境变量一致。  
- 反向代理：参考 `tech-website.conf`，区分官网/后台与 API（示例 80/23080 -> 3000，3003 为 API）。  
- 安全：使用环境变量提供 DB/JWT/SMTP，首发后修改默认管理员密码，开启 HTTPS、防火墙与上传大小限制。

## 使用nginx代理
- 项目目录下有tech-website.conf文件，拷贝到nginx配置目录下，请替换域名部分，重启nginx；
- 如果有ssl需求，可自行添加
- 该配置文件主要是将80端口反代至前端[3000]普通页面访问[http://localhost:3000]，将23080端口反代至前端[3000]管理员页面访问[http://localhost:3000/admin/]
- 用户访问：(http://localhost)
- 管理员访问：(http://localhost:23080/admin/login)

## 技术支持
zhangzhibo@startpro.com.cn
