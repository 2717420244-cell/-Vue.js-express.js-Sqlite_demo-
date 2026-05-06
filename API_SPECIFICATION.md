# Express.js 学生管理系统 — API 接口设计规范

---

## 一、API 全局约定

### 1.1 接口根路径

| 环境 | 根路径 |
|------|--------|
| 开发环境 | `http://localhost:3000/api/v1` |
| 测试环境 | `https://test.example.com/api/v1` |
| 生产环境 | `https://api.example.com/api/v1` |

所有接口均以 `/api/v1` 为版本前缀，便于后续版本迭代。

---

### 1.2 统一响应体格式

#### 成功响应

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": { }
}
```

#### 列表成功响应（带分页）

```json
{
  "success": true,
  "code": 200,
  "message": "获取列表成功",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": "字段 'name' 不能为空"
}
```

#### 状态码约定

| HTTP 状态码 | 说明 |
|------------|------|
| `200` | 请求成功（GET/PUT/DELETE） |
| `201` | 资源创建成功（POST） |
| `400` | 请求参数错误或缺失必填字段 |
| `401` | 未认证（Token 缺失或无效） |
| `403` | 无权限访问该资源 |
| `404` | 请求的资源不存在 |
| `409` | 资源冲突（如重复创建） |
| `500` | 服务器内部错误 |

---

### 1.3 身份认证方式

所有需要认证的接口均使用 **JWT Bearer Token** 认证机制。

**请求头格式：**

```
Authorization: Bearer <token>
```

**Token 获取方式：** 通过 `POST /api/v1/auth/login` 登录接口获取。

**Token 有效期：** 7200 秒（2 小时），过期后需重新登录。

**示例：**

```http
GET /api/v1/students HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.xxx
Content-Type: application/json
```

**未认证时的错误响应：**

```json
{
  "success": false,
  "code": 401,
  "message": "未提供认证令牌",
  "error": "请在请求头中添加 Authorization: Bearer <token>"
}
```

---

### 1.4 公共请求头

| 请求头 | 值 | 是否必需 | 说明 |
|--------|-----|---------|------|
| `Content-Type` | `application/json` | POST/PUT 必需 | 请求体格式 |
| `Authorization` | `Bearer <token>` | 需认证接口必需 | JWT 认证令牌 |
| `Accept` | `application/json` | 可选 | 期望响应格式 |

---

## 二、API 接口详细设计清单

---

### 接口 1：用户登录

| 项目 | 说明 |
|------|------|
| **接口描述** | 用户通过邮箱和密码登录，获取 JWT 认证令牌 |
| **请求方法** | `POST` |
| **请求路径** | `/api/v1/auth/login` |
| **请求头** | `Content-Type: application/json` |
| **请求体** | `email` (String, 必需) — 用户邮箱 |
| | `password` (String, 必需) — 用户密码 |
| **请求体示例** | ```json { "email": "zhangsan@example.com", "password": "123456" } ``` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "登录成功", "data": { "token": "eyJhbGciOiJIUzI1NiIs...", "expiresIn": 7200, "userInfo": { "id": 1, "name": "张三", "email": "zhangsan@example.com", "role": "student" } } } ``` |
| **错误响应** | `400` — 缺少必填字段：`{ "success": false, "code": 400, "message": "邮箱和密码不能为空" }` |
| | `401` — 账号密码错误：`{ "success": false, "code": 401, "message": "邮箱或密码错误" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 2：获取学生列表

| 项目 | 说明 |
|------|------|
| **接口描述** | 获取所有学生信息，支持按专业、年龄范围、年级进行筛选和分页 |
| **请求方法** | `GET` |
| **请求路径** | `/api/v1/students` |
| **请求头** | `Authorization: Bearer <token>`（必需） |
| **请求参数** (Query) | `major` (String, 可选) — 按专业筛选 |
| | `minAge` (Integer, 可选) — 最小年龄 |
| | `maxAge` (Integer, 可选) — 最大年龄 |
| | `grade` (String, 可选) — 按年级筛选（大一/大二/大三/大四） |
| | `page` (Integer, 可选, 默认1) — 页码 |
| | `limit` (Integer, 可选, 默认10) — 每页条数 |
| **请求示例** | `GET /api/v1/students?major=计算机科学与技术&minAge=20&page=1&limit=10` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "获取学生列表成功", "data": [ { "id": 1, "name": "张三", "age": 20, "major": "计算机科学与技术", "grade": "大二", "created_at": "2026-04-08 13:43:57" }, { "id": 3, "name": "孙七", "age": 22, "major": "人工智能", "grade": "大四", "created_at": "2026-04-26 13:33:44" } ], "pagination": { "page": 1, "limit": 10, "total": 2 } } ``` |
| **错误响应** | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 3：创建学生

| 项目 | 说明 |
|------|------|
| **接口描述** | 新增一条学生记录，需提供姓名、年龄、专业，年级可选 |
| **请求方法** | `POST` |
| **请求路径** | `/api/v1/students` |
| **请求头** | `Content-Type: application/json`（必需） |
| | `Authorization: Bearer <token>`（必需） |
| **请求体** | `name` (String, 必需) — 学生姓名 |
| | `age` (Integer, 必需) — 学生年龄 |
| | `major` (String, 必需) — 专业名称 |
| | `grade` (String, 可选) — 年级 |
| **请求体示例** | ```json { "name": "赵六", "age": 21, "major": "软件工程", "grade": "大三" } ``` |
| **成功响应** | `201 Created` |
| **成功响应体** | ```json { "success": true, "code": 201, "message": "学生创建成功", "data": { "id": 4, "name": "赵六", "age": 21, "major": "软件工程", "grade": "大三" } } ``` |
| **错误响应** | `400` — 缺少必填字段：`{ "success": false, "code": 400, "message": "姓名、年龄、专业为必填项", "error": "received fields: { name: '赵六' }" }` |
| | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 4：更新学生信息

| 项目 | 说明 |
|------|------|
| **接口描述** | 根据学生 ID 更新学生信息，支持部分更新（仅提交需要修改的字段） |
| **请求方法** | `PUT` |
| **请求路径** | `/api/v1/students/:id` |
| **请求头** | `Content-Type: application/json`（必需） |
| | `Authorization: Bearer <token>`（必需） |
| **请求参数** (Path) | `id` (Integer, 必需) — 学生 ID |
| **请求体** | `name` (String, 可选) — 学生姓名 |
| | `age` (Integer, 可选) — 学生年龄 |
| | `major` (String, 可选) — 专业名称 |
| | `grade` (String, 可选) — 年级 |
| **请求体示例** | ```json { "age": 22, "grade": "大四" } ``` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "学生更新成功", "changes": 1, "data": { "id": 1, "name": "张三", "age": 22, "major": "计算机科学与技术", "grade": "大四", "created_at": "2026-04-08 13:43:57" } } ``` |
| **错误响应** | `400` — 无更新字段：`{ "success": false, "code": 400, "message": "没有提供要更新的字段" }` |
| | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `404` — 学生不存在：`{ "success": false, "code": 404, "message": "学生不存在" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 5：删除学生

| 项目 | 说明 |
|------|------|
| **接口描述** | 根据学生 ID 删除一条学生记录（物理删除） |
| **请求方法** | `DELETE` |
| **请求路径** | `/api/v1/students/:id` |
| **请求头** | `Authorization: Bearer <token>`（必需） |
| **请求参数** (Path) | `id` (Integer, 必需) — 学生 ID |
| **请求示例** | `DELETE /api/v1/students/3` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "学生删除成功", "data": { "id": 3, "name": "王五", "age": 19, "major": "计算机科学与技术", "grade": "大一", "created_at": "2026-04-08 13:43:57" } } ``` |
| **错误响应** | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `404` — 学生不存在：`{ "success": false, "code": 404, "message": "学生不存在" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 6：获取单个学生详情

| 项目 | 说明 |
|------|------|
| **接口描述** | 根据学生 ID 获取单个学生的完整信息 |
| **请求方法** | `GET` |
| **请求路径** | `/api/v1/students/:id` |
| **请求头** | `Authorization: Bearer <token>`（必需） |
| **请求参数** (Path) | `id` (Integer, 必需) — 学生 ID |
| **请求示例** | `GET /api/v1/students/1` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "获取学生信息成功", "data": { "id": 1, "name": "张三", "age": 20, "major": "计算机科学与技术", "grade": "大二", "created_at": "2026-04-08 13:43:57" } } ``` |
| **错误响应** | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `404` — 学生不存在：`{ "success": false, "code": 404, "message": "学生不存在" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 7：获取学生统计信息

| 项目 | 说明 |
|------|------|
| **接口描述** | 获取学生的统计数据，包括总人数、按专业分组统计、按年级分组统计 |
| **请求方法** | `GET` |
| **请求路径** | `/api/v1/students/stats` |
| **请求头** | `Authorization: Bearer <token>`（必需） |
| **请求示例** | `GET /api/v1/students/stats` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "获取统计信息成功", "data": { "total": 3, "byMajor": [ { "major": "人工智能", "count": 1 }, { "major": "计算机科学与技术", "count": 1 }, { "major": "软件工程", "count": 1 } ], "byGrade": [ { "grade": "大一", "count": 1 }, { "grade": "大三", "count": 1 }, { "grade": "大四", "count": 1 } ] } } ``` |
| **错误响应** | `401` — 未认证：`{ "success": false, "code": 401, "message": "未提供认证令牌" }` |
| | `500` — 服务器错误：`{ "success": false, "code": 500, "message": "服务器内部错误" }` |

---

### 接口 8：健康检查（无需认证）

| 项目 | 说明 |
|------|------|
| **接口描述** | 检查服务器运行状态、运行时间，用于监控和负载均衡探活 |
| **请求方法** | `GET` |
| **请求路径** | `/api/v1/health` |
| **请求头** | 无特殊要求（无需认证） |
| **请求示例** | `GET /api/v1/health` |
| **成功响应** | `200 OK` |
| **成功响应体** | ```json { "success": true, "code": 200, "message": "服务运行正常", "data": { "status": "healthy", "timestamp": "2026-04-26T14:00:00.000Z", "uptime": 3600.5, "version": "1.0.0" } } ``` |

---

## 三、接口总览

| # | 方法 | 路径 | 描述 | 认证 |
|---|------|------|------|------|
| 1 | POST | `/api/v1/auth/login` | 用户登录获取 Token | 否 |
| 2 | GET | `/api/v1/students` | 获取学生列表（筛选+分页） | 是 |
| 3 | POST | `/api/v1/students` | 创建学生 | 是 |
| 4 | GET | `/api/v1/students/:id` | 获取单个学生详情 | 是 |
| 5 | PUT | `/api/v1/students/:id` | 更新学生信息 | 是 |
| 6 | DELETE | `/api/v1/students/:id` | 删除学生 | 是 |
| 7 | GET | `/api/v1/students/stats` | 学生统计信息 | 是 |
| 8 | GET | `/api/v1/health` | 健康检查 | 否 |

---

## 四、curl 测试示例

```bash
# 1. 登录获取 Token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zhangsan@example.com","password":"123456"}'

# 2. 使用 Token 获取学生列表
curl http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer <your_token_here>"

# 3. 创建学生
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{"name":"周八","age":20,"major":"数据科学","grade":"大二"}'

# 4. 更新学生
curl -X PUT http://localhost:3000/api/v1/students/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{"grade":"大四"}'

# 5. 删除学生
curl -X DELETE http://localhost:3000/api/v1/students/3 \
  -H "Authorization: Bearer <your_token_here>"
```
