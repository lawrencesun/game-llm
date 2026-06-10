/**
 * OllamaService - Ollama AI接口模块
 *
 * 负责：调用本地Ollama模型，构建Prompt，解析AI响应
 * 默认使用 qwen3:0.6b 模型
 * 接口地址: http://localhost:11434/api/generate
 */
var OllamaService = (function () {

    var OLLAMA_URL = "http://localhost:11434/api/generate";
    var MODEL_NAME = "qwen3:0.6b";
    var REQUEST_TIMEOUT = 60000;

    /**
     * 构建系统Prompt
     * 根据场景和通过条件动态生成
     */
    function buildSystemPrompt(scene) {
        var criteria = scene.passCriteria;
        var keywordsStr = criteria.keywords.join("、");

        var prompt = "你是校园中的AI校园助手。你的性格友好、积极，善于鼓励学生。\n\n";
        prompt += "你的职责：\n";
        prompt += "1. 根据当前关卡提出问题\n";
        prompt += "2. 判断玩家回答是否合理\n";
        prompt += "3. 给出反馈\n";
        prompt += "4. 决定是否通过关卡\n";
        prompt += "5. 引导玩家进入下一关\n\n";
        prompt += "当前场景：" + scene.name + "（" + scene.nameEn + "）\n";
        prompt += "任务目标：" + scene.taskGoal + "\n";
        prompt += "提问内容：" + scene.npcQuestion + "\n";
        prompt += "通过条件：" + criteria.description + "\n";
        prompt += "参考关键词：" + keywordsStr + "\n";
        prompt += "最少需匹配关键词数：" + criteria.minKeywords + "\n\n";
        prompt += "请严格按照以下JSON格式回复（不要包含其他文字，只返回JSON）：\n";
        prompt += "{\n";
        prompt += '  "pass": true或false,\n';
        prompt += '  "score": 1到10的评分,\n';
        prompt += '  "feedback": "你的反馈内容，要友好且具有鼓励性",\n';
        prompt += '  "matched": ["匹配到的关键词列表"]\n';
        prompt += "}\n\n";
        prompt += "重要规则：\n";
        prompt += "- 如果回答中包含至少" + criteria.minKeywords + "个相关关键词或合理内容，则pass为true\n";
        prompt += "- feedback要用中文，语气友好鼓励\n";
        prompt += "- 即使回答不完美，也要给予正向鼓励\n";
        prompt += "- 只返回JSON，不要有任何其他文字";

        return prompt;
    }

    /**
     * 构建完整的用户Prompt
     */
    function buildUserPrompt(scene, playerAnswer) {
        var prompt = buildSystemPrompt(scene);
        prompt += "\n\n玩家回答：" + playerAnswer + "\n\n";
        prompt += "请判断该回答是否通过，并返回JSON格式结果。";
        return prompt;
    }

    /**
     * 解析AI返回的JSON结果
     * 兼容处理：AI可能在JSON前后添加额外文字
     */
    function parseAIResponse(responseText) {
        var result = {
            pass: false,
            score: 0,
            feedback: "抱歉，无法解析AI的反馈。",
            matched: []
        };

        try {
            var jsonStr = responseText;

            var jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }

            var parsed = JSON.parse(jsonStr);

            result.pass = parsed.pass === true;
            result.score = parseInt(parsed.score) || 0;
            result.feedback = parsed.feedback || result.feedback;
            result.matched = parsed.matched || [];
        } catch (e) {
            console.warn("AI响应JSON解析失败，尝试关键词匹配:", e);

            result = keywordFallback(responseText);
        }

        return result;
    }

    /**
     * 关键词匹配兜底方案
     * 当AI返回的JSON无法解析时，使用关键词匹配判断
     */
    function keywordFallback(responseText, scene, playerAnswer) {
        var currentScene = scene || SceneManager.getCurrentScene();
        var answer = playerAnswer || responseText;
        var criteria = currentScene.passCriteria;

        var matched = [];
        var lowerAnswer = answer.toLowerCase();

        criteria.keywords.forEach(function (keyword) {
            if (lowerAnswer.indexOf(keyword.toLowerCase()) !== -1) {
                matched.push(keyword);
            }
        });

        var pass = matched.length >= criteria.minKeywords;

        return {
            pass: pass,
            score: pass ? Math.min(matched.length * 3, 10) : Math.max(matched.length, 1),
            feedback: pass
                ? "回答得不错！你提到了：" + matched.join("、") + "。继续加油！"
                : "你的回答还需要更丰富一些。提示：可以从不同角度思考这个问题。",
            matched: matched
        };
    }

    /**
     * 调用Ollama API
     * scene: 场景数据对象
     * playerAnswer: 玩家输入的回答
     * callback: 回调函数，参数为 { pass, score, feedback, matched, error }
     */
    function askAI(scene, playerAnswer, callback) {
        var fullPrompt = buildUserPrompt(scene, playerAnswer);

        var requestBody = {
            model: MODEL_NAME,
            prompt: fullPrompt,
            stream: false
        };

        var controller = new AbortController();
        var timeoutId = setTimeout(function () {
            controller.abort();
        }, REQUEST_TIMEOUT);

        fetch(OLLAMA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        })
        .then(function (response) {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error("HTTP错误: " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            var responseText = data.response || "";
            console.log("Ollama原始响应:", responseText);

            var aiResult = parseAIResponse(responseText);

            var criteria = scene.passCriteria;
            var lowerAnswer = playerAnswer.toLowerCase();
            var localMatched = [];
            criteria.keywords.forEach(function (keyword) {
                if (lowerAnswer.indexOf(keyword.toLowerCase()) !== -1) {
                    localMatched.push(keyword);
                }
            });

            if (!aiResult.pass && localMatched.length >= criteria.minKeywords) {
                console.log("AI判断未通过但本地关键词匹配通过，采用本地结果");
                aiResult.pass = true;
                aiResult.matched = localMatched;
                aiResult.feedback = "回答得很好！你提到了" + localMatched.join("、") + "等相关内容。" + aiResult.feedback;
            }

            callback(aiResult);
        })
        .catch(function (error) {
            clearTimeout(timeoutId);
            console.error("Ollama请求失败:", error);

            var fallbackResult = keywordFallback(null, scene, playerAnswer);
            fallbackResult.feedback = "（AI模型连接失败，使用本地匹配模式）" + fallbackResult.feedback;
            fallbackResult.error = null;

            if (error.name === "AbortError") {
                fallbackResult.error = "请求超时，请检查Ollama是否正常运行。";
            } else if (error.message.indexOf("Failed to fetch") !== -1 || error.message.indexOf("NetworkError") !== -1) {
                fallbackResult.error = "无法连接到Ollama服务，请确保Ollama已启动（运行 ollama serve）。";
            } else {
                fallbackResult.error = error.message;
            }

            callback(fallbackResult);
        });
    }

    /**
     * 检查Ollama服务是否可用
     */
    function checkConnection(callback) {
        fetch("http://localhost:11434/api/tags", {
            method: "GET",
            signal: AbortSignal.timeout(5000)
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var models = data.models || [];
            var hasModel = models.some(function (m) {
                return m.name.indexOf("qwen3") !== -1;
            });
            callback({
                connected: true,
                hasModel: hasModel,
                models: models.map(function (m) { return m.name; })
            });
        })
        .catch(function () {
            callback({
                connected: false,
                hasModel: false,
                models: []
            });
        });
    }

    /* 公开接口 */
    return {
        askAI: askAI,
        checkConnection: checkConnection,
        buildSystemPrompt: buildSystemPrompt,
        parseAIResponse: parseAIResponse
    };
})();
