# AI校园探险（AI Campus Adventure）

基于本地大模型（Ollama）的校园探险网页游戏。

## 游戏简介

玩家通过探索校园场景，与 AI 校园助手对话，完成校园知识与人工智能相关任务，最终获得"智慧钥匙"。

**游戏流程：** 校门 → 图书馆 → AI研究院 → 获得智慧钥匙 → 通关

## 运行环境

- **浏览器：** Chrome（推荐）/ Edge / Firefox
- **AI模型：** Ollama + qwen3:0.6b
- **系统：** Windows / macOS / Linux

## 快速开始

### 1. 安装 Ollama

前往 [Ollama 官网](https://ollama.ai) 下载并安装。

或使用命令行安装：

```bash
# macOS / Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# 从官网下载安装包
```

### 2. 拉取模型

```bash
ollama pull qwen3:0.6b
```

### 3. 启动 Ollama 服务

```bash
ollama serve
```

> 如果 Ollama 已作为系统服务运行，则无需重复启动。

### 4. 启动游戏

由于浏览器安全策略限制（CORS），需要通过 HTTP 服务器访问页面，而非直接双击打开 HTML 文件。

**方式一：Python（推荐）**

```bash
# 进入项目目录
cd game-llm

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**方式二：Node.js**

```bash
# 安装 http-server
npm install -g http-server

# 进入项目目录
cd game-llm

# 启动服务
http-server -p 8080 --cors
```

**方式三：VS Code**

安装 Live Server 扩展，右键 `index.html` 选择"Open with Live Server"。

### 5. 开始游戏

在浏览器中访问：

```
http://localhost:8080
```

## 项目结构

```
project/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── main.js             # 入口文件
│   ├── game.js             # 游戏主逻辑
│   ├── sceneManager.js     # 场景管理
│   ├── dialogue.js         # NPC对话系统
│   ├── ollama.js           # Ollama AI接口
│   ├── state.js            # 游戏状态管理
│   └── ui.js               # UI管理
├── assets/                 # 资源目录（图片等）
└── README.md               # 项目说明
```

## 模块说明

| 模块 | 文件 | 职责 |
|------|------|------|
| StateManager | state.js | 游戏状态持久化（localStorage） |
| SceneManager | sceneManager.js | 场景数据定义、切换、解锁 |
| DialogueManager | dialogue.js | NPC对话流程管理 |
| OllamaService | ollama.js | 调用本地Ollama模型 |
| UI | ui.js | 界面DOM操作 |
| Game | game.js | 游戏主逻辑、事件绑定 |

## 游戏玩法

1. 点击"开始探险"进入游戏
2. 点击场景中的 AI 校园助手 NPC 进入对话
3. 阅读 NPC 提出的问题
4. 在输入框中输入你的回答
5. AI 模型会判断你的回答是否合理
6. 通过后获得奖励并解锁下一场景
7. 完成全部三个场景的挑战即可通关

## 三个场景

| 场景 | 任务目标 | 问题 |
|------|---------|------|
| 校门 | 了解校园基础设施功能 | 大学图书馆有哪些主要功能？ |
| 图书馆 | 学习信息检索能力 | 查找人工智能相关资料可通过哪些途径？ |
| AI研究院 | 展示创新思维 | 人工智能的核心要素有哪些？ |

## 注意事项

- 确保 Ollama 服务在 `localhost:11434` 上运行
- 确保已拉取 `qwen3:0.6b` 模型
- 即使 AI 模型不可用，游戏也会使用本地关键词匹配进行兜底判断
- 游戏进度自动保存在浏览器 localStorage 中
- 如需重新开始，点击通关页面的"重新开始"按钮，或清除浏览器缓存
