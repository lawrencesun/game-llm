# AI校园探险

## Vibe Coding项目设计文档 V1.0

### 项目名称

AI校园探险（AI Campus Adventure）

### 项目定位

基于本地大模型（Ollama）的校园探险网页游戏。

玩家通过探索校园场景，与AI校园助手对话，完成校园知识与人工智能相关任务，最终获得“智慧钥匙”。

# 一、总体要求

## 开发目标

开发一个前端网页游戏。

技术要求：

* HTML5
* CSS3
* JavaScript

AI能力通过本地Ollama提供。

---

## 部署要求

运行环境：
* Chrome浏览器
* Ollama

本地模型：
qwen3:0.6b

---

# 二、游戏背景

新学期开学。

玩家收到一条来自AI研究院的通知：

“欢迎参加智慧校园探索计划。

只有完成校园探索任务的人，才能获得进入AI研究院的智慧钥匙。

请寻找AI校园助手。”

玩家需要依次完成三个场景挑战：

校门 → 图书馆 → AI研究院

完成全部任务后通关。

---

# 三、核心玩法

玩家在校园地图中探索。

点击NPC后进入对话模式。

NPC提出与校园场景相关的问题。

玩家输入答案。

系统调用本地大模型判断答案是否合理。

通过后解锁下一关。

---

# 四、场景设计

## 场景1：校门

场景名称：

Campus Gate

背景：

学校正门

任务目标：

了解校园基础设施功能

NPC问题：

“大学图书馆有哪些主要功能？”

正确回答应包含：

* 学习
* 阅读
* 查阅资料
* 借阅图书
* 自习

通过条件：

回答内容合理即可。

奖励：

校园地图

解锁：

图书馆

---

## 场景2：图书馆

场景名称：

Library

背景：

图书馆大厅

任务目标：

学习信息检索能力

NPC问题：

“如果你想查找人工智能相关资料，可以通过哪些途径获取？”

正确回答应包含：

* 图书
* 论文
* 学术数据库
* 网络

通过条件：

至少提到一种合理方式。

奖励：

知识徽章

解锁：

AI研究院

---

## 场景3：AI研究院

场景名称：

AI Institute

背景：

AI研究院大厅

任务目标：

展示创新思维

NPC问题：

“人工智能的核心要素有哪些？”

正确回答应包含：

* 算法
* 算力
* 数据

通过条件：

至少提到两个要素。

奖励：

智慧钥匙

游戏结束。

---

# 五、NPC设计

## 唯一NPC

名称：

AI校园助手

英文：

Campus AI Assistant

职责：

* 介绍剧情
* 发布任务
* 与玩家对话
* 判断答案
* 解锁场景

性格设定：

友好
积极
鼓励式反馈

---

# 六、Prompt设计

系统Prompt：

你是校园中的AI校园助手。

你的职责：

1. 根据当前关卡提出问题
2. 判断玩家回答是否合理
3. 给出反馈
4. 决定是否通过关卡
5. 引导玩家进入下一关

---

# 七、游戏状态设计

GameState

{
currentScene: "gate",

unlockedScenes: {
gate: true,
library: false,
aiInstitute: false
},

badges: [],

inventory: [],

gameFinished: false
}

---

# 八、UI设计

## 主界面

顶部：

游戏标题

中间：

场景区域

底部：

任务栏

右侧：

背包栏

---

## 场景区域

显示：

* 背景图片
* 玩家角色
* AI助手NPC

---

## 对话框

包含：

NPC头像

对话内容

输入框

发送按钮

---

## 任务面板

显示：

当前场景

任务目标

完成状态

---

# 九、资源需求

assets/

gate.jpg

library.jpg

ai_institute.jpg

player.png

assistant.png

key.png

badge.png

---

# 十、文件结构

project/

index.html

css/

style.css

js/

main.js

game.js

sceneManager.js

dialogue.js

ollama.js

state.js

ui.js

assets/

README.md

---

# 十一、模块设计

## SceneManager

负责：

场景切换

场景解锁

获取当前场景

主要函数：

loadScene()

unlockScene()

changeScene()

---

## DialogueManager

负责：

NPC对话

玩家输入

显示反馈

主要函数：

startDialogue()

sendMessage()

showFeedback()

---

## OllamaService

负责：

调用本地模型

主要函数：

askAI()

返回：

{
pass,
score,
feedback,
nextScene
}

---

## StateManager

负责：

保存游戏状态

读取游戏状态

更新进度

---

# 十二、Ollama接口

POST

http://localhost:11434/api/generate

请求：

{
"model":"qwen3:0.6b",
"prompt":"完整Prompt",
"stream":false
}

返回：

{
"response":"..."
}

程序需要解析JSON结果。

---

# 十三、通关流程

开始游戏

↓

校门任务

↓

图书馆任务

↓

AI研究院任务

↓

获得智慧钥匙

↓

显示通关界面

↓

结束

---

# 十四、验收标准

功能验收：

* 能正常进入游戏
* 能切换三个场景
* 能与NPC对话
* 能调用Ollama
* 能自动评分
* 能解锁下一关
* 能完成通关

代码验收：

* HTML/CSS/JS分离
* 注释完整
* 模块化结构
* 无严重报错

性能验收：

* 页面加载时间＜10秒
* 单次AI响应＜20秒