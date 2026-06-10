/**
 * StateManager - 游戏状态管理模块
 *
 * 负责：保存游戏状态、读取游戏状态、更新进度
 * 使用 localStorage 进行持久化存储
 */
const StateManager = (function () {

    var STORAGE_KEY = "ai_campus_adventure_state";

    /**
     * 创建初始游戏状态
     */
    function createInitialState() {
        return {
            currentScene: "gate",
            unlockedScenes: {
                gate: true,
                library: false,
                aiInstitute: false
            },
            completedScenes: {
                gate: false,
                library: false,
                aiInstitute: false
            },
            badges: [],
            inventory: [],
            gameFinished: false,
            secretRoomCompleted: false
        };
    }

    /**
     * 保存游戏状态到 localStorage
     */
    function saveState(state) {
        try {
            var json = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, json);
        } catch (e) {
            console.error("保存游戏状态失败:", e);
        }
    }

    /**
     * 从 localStorage 读取游戏状态
     * 自动补全缺失字段，兼容旧存档
     * 如果不存在则返回初始状态
     */
    function loadState() {
        try {
            var json = localStorage.getItem(STORAGE_KEY);
            if (json) {
                var saved = JSON.parse(json);
                var initial = createInitialState();
                for (var key in initial) {
                    if (initial.hasOwnProperty(key) && !saved.hasOwnProperty(key)) {
                        saved[key] = initial[key];
                    }
                }
                return saved;
            }
        } catch (e) {
            console.error("读取游戏状态失败:", e);
        }
        return createInitialState();
    }

    /**
     * 重置游戏状态
     */
    function resetState() {
        var state = createInitialState();
        saveState(state);
        return state;
    }

    /**
     * 更新当前场景
     */
    function setCurrentScene(sceneId) {
        var state = loadState();
        state.currentScene = sceneId;
        saveState(state);
        return state;
    }

    /**
     * 解锁指定场景
     */
    function unlockScene(sceneId) {
        var state = loadState();
        if (state.unlockedScenes.hasOwnProperty(sceneId)) {
            state.unlockedScenes[sceneId] = true;
            saveState(state);
        }
        return state;
    }

    /**
     * 标记场景已完成
     */
    function completeScene(sceneId) {
        var state = loadState();
        if (state.completedScenes.hasOwnProperty(sceneId)) {
            state.completedScenes[sceneId] = true;
            saveState(state);
        }
        return state;
    }

    /**
     * 添加物品到背包
     */
    function addInventoryItem(item) {
        var state = loadState();
        var exists = state.inventory.some(function (i) {
            return i.id === item.id;
        });
        if (!exists) {
            state.inventory.push(item);
            saveState(state);
        }
        return state;
    }

    /**
     * 添加徽章
     */
    function addBadge(badge) {
        var state = loadState();
        var exists = state.badges.some(function (b) {
            return b.id === badge.id;
        });
        if (!exists) {
            state.badges.push(badge);
            saveState(state);
        }
        return state;
    }

    /**
     * 设置游戏通关
     */
    function setGameFinished() {
        var state = loadState();
        state.gameFinished = true;
        saveState(state);
        return state;
    }

    /**
     * 标记隐藏关卡已完成
     */
    function completeSecretRoom() {
        var state = loadState();
        state.secretRoomCompleted = true;
        saveState(state);
        return state;
    }

    /**
     * 检查是否集齐了三个隐藏物品
     */
    function hasAllHiddenItems() {
        var state = loadState();
        var requiredIds = ["lucky_cat_paw", "warm_reading_note", "researcher_notebook"];
        return requiredIds.every(function (id) {
            return state.inventory.some(function (i) {
                return i.id === id;
            });
        });
    }

    /**
     * 检查是否可以进入隐藏关卡
     * 条件：三个主关卡全部完成 + 三个隐藏物品全部集齐 + 未完成过
     */
    function canEnterSecretRoom() {
        var state = loadState();
        if (state.secretRoomCompleted) return false;
        var allScenesDone = state.completedScenes.gate
            && state.completedScenes.library
            && state.completedScenes.aiInstitute;
        return allScenesDone && hasAllHiddenItems();
    }

    /**
     * 获取当前状态
     */
    function getState() {
        return loadState();
    }

    /**
     * 检查场景是否已解锁
     */
    function isSceneUnlocked(sceneId) {
        var state = loadState();
        return state.unlockedScenes[sceneId] === true;
    }

    /**
     * 检查场景是否已完成
     */
    function isSceneCompleted(sceneId) {
        var state = loadState();
        return state.completedScenes[sceneId] === true;
    }

    /* 公开接口 */
    return {
        createInitialState: createInitialState,
        saveState: saveState,
        loadState: loadState,
        resetState: resetState,
        setCurrentScene: setCurrentScene,
        unlockScene: unlockScene,
        completeScene: completeScene,
        addInventoryItem: addInventoryItem,
        addBadge: addBadge,
        setGameFinished: setGameFinished,
        completeSecretRoom: completeSecretRoom,
        hasAllHiddenItems: hasAllHiddenItems,
        canEnterSecretRoom: canEnterSecretRoom,
        getState: getState,
        isSceneUnlocked: isSceneUnlocked,
        isSceneCompleted: isSceneCompleted
    };
})();
