/**
 * SceneManager - 场景管理模块
 *
 * 负责：场景切换、场景解锁、获取当前场景、场景数据定义
 * 每个场景包含：名称、描述、任务目标、NPC问题、通过条件、奖励等
 */
var SceneManager = (function () {

    /**
     * 场景数据配置
     * 包含所有场景的完整信息
     */
    var SCENES = {
        gate: {
            id: "gate",
            name: "校门",
            nameEn: "Campus Gate",
            cssClass: "scene-gate",
            description: "学校正门，你的校园探险从这里开始。",
            taskGoal: "了解校园基础设施功能",
            npcQuestion: "大学图书馆有哪些主要功能？",
            npcHint: "请说出图书馆的主要功能，比如学习、阅读、借阅图书等方面。",
            passCriteria: {
                keywords: ["学习", "阅读", "查阅", "资料", "借阅", "图书", "自习", "文献"],
                minKeywords: 1,
                description: "回答内容合理即可"
            },
            reward: {
                item: { id: "campus_map", name: "校园地图", icon: "🗺️" },
                badge: { id: "gate_badge", name: "校园入门徽章", icon: "🏫" }
            },
            unlockNext: "library"
        },
        library: {
            id: "library",
            name: "图书馆",
            nameEn: "Library",
            cssClass: "scene-library",
            description: "图书馆大厅，知识的海洋等待你探索。",
            taskGoal: "学习信息检索能力",
            npcQuestion: "如果你想查找人工智能相关资料，可以通过哪些途径获取？",
            npcHint: "请说出获取学术资料的途径，比如图书、论文、数据库等。",
            passCriteria: {
                keywords: ["图书", "论文", "学术", "数据库", "网络", "互联网", "搜索引擎", "期刊", "杂志", "图书馆", "知网", "检索"],
                minKeywords: 1,
                description: "至少提到一种合理方式"
            },
            reward: {
                item: { id: "knowledge_badge_item", name: "知识徽章", icon: "📖" },
                badge: { id: "library_badge", name: "知识探索徽章", icon: "📚" }
            },
            unlockNext: "aiInstitute"
        },
        aiInstitute: {
            id: "aiInstitute",
            name: "AI研究院",
            nameEn: "AI Institute",
            cssClass: "scene-aiInstitute",
            description: "AI研究院大厅，这里是探索人工智能奥秘的地方。",
            taskGoal: "展示创新思维",
            npcQuestion: "人工智能的核心要素有哪些？",
            npcHint: "请说出人工智能的核心要素，比如算法、算力、数据等。",
            passCriteria: {
                keywords: ["算法", "算力", "数据", "模型", "训练", "计算", "深度学习", "机器学习", "神经网络"],
                minKeywords: 2,
                description: "至少提到两个要素"
            },
            reward: {
                item: { id: "wisdom_key", name: "智慧钥匙", icon: "🔑" },
                badge: { id: "ai_badge", name: "AI智慧徽章", icon: "🧠" }
            },
            unlockNext: null
        }
    };

    /**
     * 场景顺序列表
     */
    var SCENE_ORDER = ["gate", "library", "aiInstitute"];

    /**
     * 获取场景数据
     */
    function getScene(sceneId) {
        return SCENES[sceneId] || null;
    }

    /**
     * 获取所有场景数据
     */
    function getAllScenes() {
        return SCENES;
    }

    /**
     * 获取当前场景数据
     */
    function getCurrentScene() {
        var state = StateManager.getState();
        return SCENES[state.currentScene] || SCENES.gate;
    }

    /**
     * 获取下一个场景ID
     */
    function getNextScene(sceneId) {
        var scene = SCENES[sceneId];
        if (scene && scene.unlockNext) {
            return SCENES[scene.unlockNext] || null;
        }
        return null;
    }

    /**
     * 切换到指定场景
     * 返回更新后的状态
     */
    function changeScene(sceneId) {
        if (!SCENES[sceneId]) {
            console.error("场景不存在:", sceneId);
            return null;
        }

        if (!StateManager.isSceneUnlocked(sceneId)) {
            console.warn("场景未解锁:", sceneId);
            return null;
        }

        var state = StateManager.setCurrentScene(sceneId);
        return SCENES[sceneId];
    }

    /**
     * 解锁下一个场景
     * 完成当前场景后调用
     */
    function unlockNextScene(currentSceneId) {
        var scene = SCENES[currentSceneId];
        if (scene && scene.unlockNext) {
            StateManager.unlockScene(scene.unlockNext);
            return SCENES[scene.unlockNext];
        }
        return null;
    }

    /**
     * 完成场景：标记完成 + 发放奖励 + 解锁下一关
     * 返回 { rewards, nextScene, isGameFinished }
     */
    function completeSceneActions(sceneId) {
        var scene = SCENES[sceneId];
        if (!scene) return null;

        StateManager.completeScene(sceneId);

        if (scene.reward.item) {
            StateManager.addInventoryItem(scene.reward.item);
        }
        if (scene.reward.badge) {
            StateManager.addBadge(scene.reward.badge);
        }

        var nextScene = unlockNextScene(sceneId);

        var isGameFinished = scene.unlockNext === null;
        if (isGameFinished) {
            StateManager.setGameFinished();
        }

        return {
            rewards: scene.reward,
            nextScene: nextScene,
            isGameFinished: isGameFinished
        };
    }

    /**
     * 获取场景顺序列表
     */
    function getSceneOrder() {
        return SCENE_ORDER;
    }

    /**
     * 检查是否为最后一个场景
     */
    function isLastScene(sceneId) {
        var scene = SCENES[sceneId];
        return scene && scene.unlockNext === null;
    }

    /* 公开接口 */
    return {
        getScene: getScene,
        getAllScenes: getAllScenes,
        getCurrentScene: getCurrentScene,
        getNextScene: getNextScene,
        changeScene: changeScene,
        unlockNextScene: unlockNextScene,
        completeSceneActions: completeSceneActions,
        getSceneOrder: getSceneOrder,
        isLastScene: isLastScene
    };
})();
