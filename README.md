# 实验室登记系统 - Vercel 后端

这是实验室登记系统的 Vercel 后端服务，使用 Express.js 和 MongoDB。

## 部署说明

### 1. 环境变量配置

在 Vercel 中添加以下环境变量：

- `MONGODB_URI`: MongoDB 连接字符串（格式：`mongodb+srv://username:password@cluster.mongodb.net/dbname`）

### 2. API 接口

#### 获取实验室列表
- **URL**: `/api/getLabList`
- **方法**: GET
- **响应**: `{ success: true, data: ['lab1', 'lab2', ...] }`

#### 添加实验室
- **URL**: `/api/addLab`
- **方法**: POST
- **请求体**: `{ labName: 'lab name' }`
- **响应**: `{ success: true, data: 'id', message: '添加成功' }`

#### 删除实验室
- **URL**: `/api/deleteLab`
- **方法**: POST/DELETE
- **请求体**: `{ labName: 'lab name' }` 或 `{ labId: 'id' }`
- **响应**: `{ success: true, message: '删除成功' }`

#### 生成二维码
- **URL**: `/api/generateQR`
- **方法**: POST
- **请求体**: `{ labName: 'lab name' }`
- **响应**: `{ success: true, qrCode: 'data:image/png;base64,...' }`

#### 提交登记
- **URL**: `/api/submitRegister`
- **方法**: POST
- **请求体**: `{ lab: 'lab name', studentId: '123', name: '张三', phone: '13800000000', fromScan: false }`
- **响应**: `{ success: true, _id: 'id', message: '登记成功' }`

#### 检查管理员密码
- **URL**: `/api/checkAdminPassword`
- **方法**: POST
- **请求体**: `{ password: '9850' }`
- **响应**: `{ success: true, message: '管理员验证成功' }`

#### 记录错误
- **URL**: `/api/logError`
- **方法**: POST
- **请求体**: `{ type: 'error', message: 'error message', error: 'error', stack: 'stack trace' }`
- **响应**: `{ success: true, message: '错误日志已记录' }`

#### 获取错误日志
- **URL**: `/api/getErrorLogs`
- **方法**: GET
- **响应**: `{ success: true, data: [...], count: 0 }`

#### 获取登记记录
- **URL**: `/api/getRegisters?lab=lab_name&date=2024-01-01`
- **方法**: GET
- **响应**: `{ success: true, data: [...], count: 0 }`

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 Vercel

```bash
npm install -g vercel
vercel
```
