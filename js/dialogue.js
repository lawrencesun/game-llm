/**
 * DialogueManager - NPC对话管理模块
 *
 * 负责：NPC对话流程、玩家输入处理、显示反馈、对话消息管理
 * 对话流程：NPC提问 → 玩家回答 → AI判断 → 显示反馈 → 解锁/继续
 */
var DialogueManager = (function () {

    var _isDialogueOpen = false;
    var _isWaitingForAI = false;
    var _currentSceneId = null;
    var _isSecretDialogue = false;

    var SECRET_QUESTION = "在你看来，AI 真正的价值，是让机器更像人，还是让人更理解自己？";
    var SECRET_HINT = "这是一道开放题。请从你自己的视角，谈谈 AI 与人、人与自我的关系。比如：让机器更像人，会带来什么？让人更理解自己，又意味着什么？";
    var SECRET_KEYWORDS = ["人", "自己", "理解", "思考", "智能", "学习", "价值", "意义", "心", "感受", "成长", "智慧", "温度", "机器", "算法"];
    var SECRET_MIN_KEYWORDS = 2;

    /**
     * 打开对话面板
     * 根据当前场景显示NPC的初始问候语
     */
    function openDialogue() {
        if (_isDialogueOpen) return;
        _isDialogueOpen = true;

        var scene = SceneManager.getCurrentScene();
        _currentSceneId = scene.id;

        var dialogueArea = document.getElementById("dialogue-area");
        dialogueArea.classList.remove("hidden");

        var dialogueInput = document.getElementById("dialogue-input");
        dialogueInput.value = "";
        dialogueInput.focus();

        clearMessages();

        var isCompleted = StateManager.isSceneCompleted(scene.id);
        if (isCompleted) {
            addMessage("npc", "你已经完成了这个场景的任务！可以前往下一个场景继续探险。");
        } else {
            var greeting = getGreeting(scene);
            addMessage("npc", greeting);

            setTimeout(function () {
                addMessage("npc", "📝 我的问题是：" + scene.npcQuestion);
            }, 500);

            setTimeout(function () {
                addMessage("system", "请在下方输入你的回答，然后点击发送。");
            }, 1000);
        }
    }

    /**
     * 关闭对话面板
     */
    function closeDialogue() {
        _isDialogueOpen = false;
        _isWaitingForAI = false;
        _currentSceneId = null;
        _isSecretDialogue = false;

        var dialogueArea = document.getElementById("dialogue-area");
        dialogueArea.classList.add("hidden");
    }

    /**
     * 打开隐藏关卡对话（AI 之灵）
     * 与普通对话不同，使用专属 NPC 名和终极问题
     */
    function openSecretDialogue() {
        if (_isDialogueOpen) return;
        _isDialogueOpen = true;
        _isSecretDialogue = true;
        _currentSceneId = "secretRoom";

        var dialogueArea = document.getElementById("dialogue-area");
        dialogueArea.classList.remove("hidden");

        var npcNameEl = document.querySelector(".dialogue-npc-name");
        if (npcNameEl) {
            npcNameEl.textContent = "💠 AI 之灵";
        }

        var dialogueInput = document.getElementById("dialogue-input");
        dialogueInput.value = "";
        dialogueInput.focus();

        clearMessages();

        addMessage("npc", "你踏入了光门。这里是隐秘之室。");
        setTimeout(function () {
            addMessage("npc", "我是 AI 之灵。只有集齐三件信物、并完成所有关卡的人，才有资格来到这里。");
        }, 600);
        setTimeout(function () {
            addMessage("npc", "✨ 终极之问：" + SECRET_QUESTION);
        }, 1200);
        setTimeout(function () {
            addMessage("system", "请在下方输入你的回答，然后点击发送。");
        }, 1800);
    }

    /**
     * 根据场景获取NPC问候语
     */
    function getGreeting(scene) {
        var greetings = {
            gate: "你好！欢迎来到校门！我是AI校园助手 🤖 很高兴见到你！这里是智慧校园探索计划的起点。",
            library: "欢迎来到图书馆！📚 这里是知识的宝库。你已经获得了校园地图，做得很好！",
            aiInstitute: "欢迎来到AI研究院！🧠 你已经通过了前两关的考验，这里是最终挑战！"
        };
        return greetings[scene.id] || "你好！我是AI校园助手。";
    }

    /**
     * 发送玩家消息
     * 调用Ollama判断答案并显示反馈
     */
    function sendMessage() {
        if (_isWaitingForAI) return;

        var input = document.getElementById("dialogue-input");
        var text = input.value.trim();

        if (!text) {
            addMessage("system", "请输入你的回答后再发送。");
            return;
        }

        addMessage("player", text);
        input.value = "";

        if (_isSecretDialogue) {
            handleSecretResponse(text);
            return;
        }

        var scene = SceneManager.getScene(_currentSceneId);
        if (!scene) return;

        _isWaitingForAI = true;
        setInputEnabled(false);
        showLoading(true);

        OllamaService.askAI(scene, text, function (result) {
            _isWaitingForAI = false;
            showLoading(false);
            setInputEnabled(true);

            handleAIResponse(result, scene);
        });
    }

    /**
     * 处理隐藏关卡答案
     * 使用本地关键词匹配（避免对开放题过度依赖 AI）
     */
    function handleSecretResponse(text) {
        var hit = 0;
        for (var i = 0; i < SECRET_KEYWORDS.length; i++) {
            if (text.indexOf(SECRET_KEYWORDS[i]) !== -1) {
                hit++;
            }
        }
        var pass = hit >= SECRET_MIN_KEYWORDS;

        if (pass) {
            addMessage("npc", "你的回答里有真正的思考。");
            addMessage("success", "🌟 恭喜！你通过了隐秘之室的考验！");
            addMessage("system", "🎁 获得终极物品：💎 智慧之源");
            addMessage("system", "🏅 获得终极徽章：🌟 完美通关徽章");

            if (typeof Game !== "undefined" && Game.completeSecretRoom) {
                Game.completeSecretRoom();
            }

            setTimeout(function () {
                addMessage("npc", "隐秘之室缓缓关闭。AI 之灵向你点头致意。");
                addMessage("system", "即将进入通关界面...");
                setTimeout(function () {
                    closeDialogue();
                    if (typeof Game !== "undefined" && Game.showVictory) {
                        Game.showVictory();
                    }
                }, 2000);
            }, 1500);
        } else {
            addMessage("system", "💡 提示：" + SECRET_HINT);
            addMessage("npc", "再用心想一想，没有标准答案。说出你自己的看法就好。");
        }
    }

    /**
     * 处理AI响应结果
     */
    function handleAIResponse(result, scene) {
        if (result.error) {
            addMessage("npc", "抱歉，AI助手暂时无法响应。错误信息：" + result.error);
            addMessage("system", "请检查Ollama是否正在运行，然后重新尝试。");
            return;
        }

        addMessage("npc", result.feedback);

        if (result.pass) {
            addMessage("success", "🎉 恭喜！你通过了「" + scene.name + "」的挑战！");

            var completedResult = SceneManager.completeSceneActions(scene.id);

            setTimeout(function () {
                if (completedResult.rewards.item) {
                    var item = completedResult.rewards.item;
                    addMessage("system", "🎁 获得物品：" + item.icon + " " + item.name);
                }
                if (completedResult.rewards.badge) {
                    var badge = completedResult.rewards.badge;
                    addMessage("system", "🏅 获得徽章：" + badge.icon + " " + badge.name);
                }
            }, 500);

            setTimeout(function () {
                if (completedResult.isGameFinished) {
                    addMessage("success", "🏆 你获得了智慧钥匙！所有任务已完成！");
                    addMessage("system", "即将进入通关界面...");
                    setTimeout(function () {
                        closeDialogue();
                        if (typeof Game !== "undefined" && Game.showVictory) {
                            Game.showVictory();
                        }
                    }, 2000);
                } else if (scene.id === "aiInstitute" && StateManager.canEnterSecretRoom()) {
                    addMessage("npc", "等等...你的背包里，似乎集齐了什么东西...");
                    setTimeout(function () {
                        addMessage("system", "🌌 实验室深处，浮现出一道温柔的光...");
                        addMessage("npc", "「隐秘之室」向你敞开了大门。");
                        addMessage("system", "💡 提示：点击场景中发光的传送门 ✨，进入隐秘之室");
                    }, 1200);
                    if (typeof UI !== "undefined" && UI.refreshAll) {
                        UI.refreshAll();
                    }
                } else if (completedResult.nextScene) {
                    addMessage("system", "🗺️ 新场景「" + completedResult.nextScene.name + "」已解锁！");
                    addMessage("npc", "太棒了！你可以在右侧的校园地图中前往下一个场景。");
                    if (typeof UI !== "undefined" && UI.refreshAll) {
                        UI.refreshAll();
                    }
                }
            }, 1200);
        } else {
            addMessage("system", "💡 提示：" + scene.npcHint);
            addMessage("npc", "别灰心，再试一次吧！你可以重新回答这个问题。");
        }

        if (typeof UI !== "undefined" && UI.refreshAll) {
            UI.refreshAll();
        }
    }

    /**
     * 添加对话消息
     * type: "npc" | "player" | "system" | "success"
     */
    function addMessage(type, content) {
        var container = document.getElementById("dialogue-messages");
        if (!container) return;

        var msgDiv = document.createElement("div");
        msgDiv.className = "message " + type;
        msgDiv.textContent = content;
        container.appendChild(msgDiv);

        container.scrollTop = container.scrollHeight;
    }

    /**
     * 清空所有对话消息
     */
    function clearMessages() {
        var container = document.getElementById("dialogue-messages");
        if (container) {
            container.innerHTML = "";
        }
    }

    /**
     * 设置输入框是否可用
     */
    function setInputEnabled(enabled) {
        var input = document.getElementById("dialogue-input");
        var btn = document.getElementById("btn-send");
        if (input) input.disabled = !enabled;
        if (btn) btn.disabled = !enabled;
    }

    /**
     * 显示/隐藏加载状态
     */
    function showLoading(show) {
        var overlay = document.getElementById("loading-overlay");
        if (overlay) {
            if (show) {
                overlay.classList.remove("hidden");
            } else {
                overlay.classList.add("hidden");
            }
        }
    }

    /**
     * 对话面板是否打开
     */
    function isOpen() {
        return _isDialogueOpen;
    }

    /**
     * 是否正在等待AI响应
     */
    function isWaiting() {
        return _isWaitingForAI;
    }

    /* 公开接口 */
    return {
        openDialogue: openDialogue,
        closeDialogue: closeDialogue,
        openSecretDialogue: openSecretDialogue,
        sendMessage: sendMessage,
        addMessage: addMessage,
        clearMessages: clearMessages,
        isOpen: isOpen,
        isWaiting: isWaiting
    };
})();
