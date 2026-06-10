/**
 * UI - 界面管理模块
 *
 * 负责：刷新所有UI面板、更新场景显示、更新背包/徽章/任务面板、场景导航按钮
 * 所有DOM操作集中在此模块
 */
var UI = (function () {

    /**
     * 刷新所有UI组件
     */
    function refreshAll() {
        var state = StateManager.getState();
        var scene = SceneManager.getScene(state.currentScene);

        refreshSceneArea(scene);
        refreshTaskPanel(scene, state);
        refreshInventoryPanel(state);
        refreshBadgePanel(state);
        refreshSceneNav(state, scene);
        refreshHeader(scene);
    }

    /**
     * 刷新顶部标题栏
     */
    function refreshHeader(scene) {
        var titleEl = document.getElementById("scene-title");
        var nameEl = document.getElementById("current-scene-name");
        if (titleEl) titleEl.textContent = "AI 校园探险 - " + scene.name;
        if (nameEl) nameEl.textContent = "当前场景：" + scene.name + "（" + scene.nameEn + "）";
    }

    /**
     * 刷新场景区域
     * 更新背景CSS类和场景标签
     */
    function refreshSceneArea(scene) {
        var bg = document.getElementById("scene-background");
        var area = document.getElementById("scene-area");

        if (bg) {
            bg.className = "";
            bg.classList.add(scene.cssClass);
            if (scene.backgroundImage) {
                bg.style.backgroundImage = "url('" + scene.backgroundImage + "')";
            }
        }

        if (area) {
            area.setAttribute("data-scene-label", scene.nameEn);
        }
    }

    /**
     * 刷新任务面板
     */
    function refreshTaskPanel(scene, state) {
        var sceneEl = document.getElementById("task-scene");
        var goalEl = document.getElementById("task-goal");
        var statusEl = document.getElementById("task-status");

        if (sceneEl) sceneEl.textContent = "当前场景：" + scene.name;
        if (goalEl) goalEl.textContent = "任务目标：" + scene.taskGoal;

        if (statusEl) {
            var isCompleted = state.completedScenes[scene.id];
            statusEl.textContent = "完成状态：" + (isCompleted ? "✅ 已完成" : "⏳ 未完成");
            if (isCompleted) {
                statusEl.classList.add("completed");
            } else {
                statusEl.classList.remove("completed");
            }
        }
    }

    /**
     * 刷新背包面板
     */
    function refreshInventoryPanel(state) {
        var listEl = document.getElementById("inventory-list");
        if (!listEl) return;

        if (state.inventory.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无物品</p>';
            return;
        }

        var html = "";
        state.inventory.forEach(function (item) {
            html += '<div class="inventory-item">';
            html += '<span class="item-icon">' + item.icon + '</span>';
            html += '<span>' + item.name + '</span>';
            html += '</div>';
        });
        listEl.innerHTML = html;
    }

    /**
     * 刷新徽章面板
     */
    function refreshBadgePanel(state) {
        var listEl = document.getElementById("badge-list");
        if (!listEl) return;

        if (state.badges.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无徽章</p>';
            return;
        }

        var html = "";
        state.badges.forEach(function (badge) {
            html += '<div class="badge-item">';
            html += '<span class="badge-icon">' + badge.icon + '</span>';
            html += '<span>' + badge.name + '</span>';
            html += '</div>';
        });
        listEl.innerHTML = html;
    }

    /**
     * 刷新场景导航按钮
     * 根据解锁状态和当前场景更新按钮样式
     */
    function refreshSceneNav(state, currentScene) {
        var buttons = document.querySelectorAll(".btn-scene");
        var sceneOrder = SceneManager.getSceneOrder();

        buttons.forEach(function (btn) {
            var sceneId = btn.getAttribute("data-scene");
            var isUnlocked = state.unlockedScenes[sceneId];
            var isCurrent = sceneId === currentScene.id;
            var isCompleted = state.completedScenes[sceneId];
            var scene = SceneManager.getScene(sceneId);

            btn.className = "btn-scene";

            if (isUnlocked) {
                btn.classList.add("unlocked");
                btn.disabled = false;
                btn.textContent = (isCompleted ? "✅ " : "") + scene.name;
            } else {
                btn.classList.add("locked");
                btn.disabled = true;
                btn.textContent = "🔒 " + scene.name;
            }

            if (isCurrent) {
                btn.classList.add("current");
            }
        });
    }

    /**
     * 切换页面显示
     * screenId: "start-screen" | "game-screen" | "victory-screen"
     */
    function showScreen(screenId) {
        var screens = document.querySelectorAll(".screen");
        screens.forEach(function (screen) {
            screen.classList.remove("active");
        });

        var target = document.getElementById(screenId);
        if (target) {
            target.classList.add("active");
        }
    }

    /**
     * 更新通关页面的徽章展示
     */
    function refreshVictoryBadges() {
        var state = StateManager.getState();
        var listEl = document.getElementById("victory-badge-list");
        if (!listEl) return;

        var allItems = [];

        state.inventory.forEach(function (item) {
            allItems.push({ icon: item.icon, name: item.name });
        });
        state.badges.forEach(function (badge) {
            allItems.push({ icon: badge.icon, name: badge.name });
        });

        var html = "";
        allItems.forEach(function (item) {
            html += '<div class="victory-badge-item">';
            html += '<div class="icon">' + item.icon + '</div>';
            html += '<div class="name">' + item.name + '</div>';
            html += '</div>';
        });
        listEl.innerHTML = html;
    }

    /* 公开接口 */
    return {
        refreshAll: refreshAll,
        refreshSceneArea: refreshSceneArea,
        refreshTaskPanel: refreshTaskPanel,
        refreshInventoryPanel: refreshInventoryPanel,
        refreshBadgePanel: refreshBadgePanel,
        refreshSceneNav: refreshSceneNav,
        refreshVictoryBadges: refreshVictoryBadges,
        showScreen: showScreen
    };
})();
