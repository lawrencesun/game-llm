/**
 * Game - 游戏主逻辑模块
 *
 * 负责：游戏初始化、开始游戏、场景切换、通关处理、重新开始
 * 协调各模块之间的交互
 */
var Game = (function () {

    /**
     * 初始化游戏
     * 检查是否有已保存的游戏进度
     */
    function init() {
        var state = StateManager.getState();

        if (state.gameFinished) {
            showVictory();
            return;
        }

        if (state.currentScene && state.currentScene !== "gate") {
            startGame(false);
            return;
        }

        UI.showScreen("start-screen");
    }

    /**
     * 开始游戏
     * reset: 是否重置游戏状态
     */
    function startGame(reset) {
        if (reset !== false) {
            StateManager.resetState();
        }

        UI.showScreen("game-screen");
        UI.refreshAll();
    }

    /**
     * 切换到指定场景
     */
    function goToScene(sceneId) {
        if (DialogueManager.isOpen()) {
            return;
        }

        var scene = SceneManager.changeScene(sceneId);
        if (!scene) {
            console.warn("无法切换到场景:", sceneId);
            return;
        }

        UI.refreshAll();
    }

    /**
     * 显示通关界面
     */
    function showVictory() {
        UI.refreshVictoryBadges();
        UI.showScreen("victory-screen");
    }

    /**
     * 重新开始游戏
     */
    function restart() {
        StateManager.resetState();
        startGame(true);
    }

    /**
     * 隐藏物品定义
     * 点击场景中的彩蛋猫咪后获得
     */
    var CAT_HIDDEN_ITEM = {
        id: "lucky_cat_paw",
        name: "Lucky Cat Paw",
        cnName: "幸运猫爪印",
        icon: "\uD83D\uDC3E"
    };

    /**
     * 隐藏物品定义
     * 点击场景中的彩蛋咖啡后获得
     */
    var COFFEE_HIDDEN_ITEM = {
        id: "warm_reading_note",
        name: "Warm Reading Note",
        cnName: "温暖阅读便签",
        icon: "\uD83D\uDCDC"
    };

    /**
     * 隐藏物品定义
     * 点击场景中的彩蛋笔记本后获得
     */
    var NOTEBOOK_HIDDEN_ITEM = {
        id: "researcher_notebook",
        name: "Researcher Notebook",
        cnName: "研究员手稿",
        icon: "\uD83D\uDCD3"
    };

    /**
     * 隐藏关卡终极奖励
     * 集齐三个隐藏物品后，进入隐秘之室完成终极问题获得
     */
    var SECRET_REWARD_ITEM = {
        id: "wisdom_source",
        name: "Wisdom Source",
        cnName: "智慧之源",
        icon: "\uD83D\uDC8E"
    };

    var SECRET_REWARD_BADGE = {
        id: "perfect_badge",
        name: "Perfect Clear Badge",
        cnName: "完美通关徽章",
        icon: "\uD83C\uDF1F"
    };

    /**
     * 处理点击彩蛋猫咪
     */
    function onCatClick() {
        var state = StateManager.getState();
        if (state.currentScene !== "gate") return;

        var hasItem = state.inventory.some(function (i) {
            return i.id === CAT_HIDDEN_ITEM.id;
        });
        if (hasItem) {
            alert("You have already got the lucky cat paw. Keep exploring!");
            return;
        }

        var popup = document.getElementById("cat-popup");
        var textEl = document.getElementById("cat-popup-text");
        var itemEl = document.getElementById("cat-popup-item");

        if (textEl) {
            textEl.textContent = '校门口的花坛边，趴着一只晒太阳的小橘猫。大家都叫它"学长"。它蹭了蹭你的裤脚，掉下一枚发着微光的猫爪印——听说带着它去探险，会特别幸运哦！';
        }
        if (itemEl) {
            itemEl.innerHTML = '<span class="item-icon">' + CAT_HIDDEN_ITEM.icon + '</span>' + CAT_HIDDEN_ITEM.cnName;
        }
        if (popup) {
            popup.classList.remove("hidden");
        }
    }

    /**
     * 关闭猫咪彩蛋弹窗
     * 同时发放物品
     */
    function closeCatPopup() {
        StateManager.addInventoryItem({
            id: CAT_HIDDEN_ITEM.id,
            name: CAT_HIDDEN_ITEM.cnName,
            icon: CAT_HIDDEN_ITEM.icon
        });

        var cat = document.getElementById("hidden-cat");
        if (cat) {
            cat.classList.add("found");
        }

        var popup = document.getElementById("cat-popup");
        if (popup) {
            popup.classList.add("hidden");
        }

        if (typeof UI !== "undefined" && UI.refreshAll) {
            UI.refreshAll();
        }
    }

    /**
     * 处理点击彩蛋咖啡
     */
    function onCoffeeClick() {
        var state = StateManager.getState();
        if (state.currentScene !== "library") return;

        var hasItem = state.inventory.some(function (i) {
            return i.id === COFFEE_HIDDEN_ITEM.id;
        });
        if (hasItem) {
            alert("你已经收下这杯咖啡的便签啦，继续探索吧！");
            return;
        }

        var popup = document.getElementById("coffee-popup");
        var textEl = document.getElementById("coffee-popup-text");
        var itemEl = document.getElementById("coffee-popup-item");

        if (textEl) {
            textEl.textContent = '自习桌的角落，安静地放着一杯还冒着热气的拿铁。杯套下面压着一张便签："学习辛苦啦，这张便签留给你当书签吧——每一页新知，都值得被温柔对待。"';
        }
        if (itemEl) {
            itemEl.innerHTML = '<span class="item-icon">' + COFFEE_HIDDEN_ITEM.icon + '</span>' + COFFEE_HIDDEN_ITEM.cnName;
        }
        if (popup) {
            popup.classList.remove("hidden");
        }
    }

    /**
     * 关闭咖啡彩蛋弹窗
     * 同时发放物品
     */
    function closeCoffeePopup() {
        StateManager.addInventoryItem({
            id: COFFEE_HIDDEN_ITEM.id,
            name: COFFEE_HIDDEN_ITEM.cnName,
            icon: COFFEE_HIDDEN_ITEM.icon
        });

        var coffee = document.getElementById("hidden-coffee");
        if (coffee) {
            coffee.classList.add("found");
        }

        var popup = document.getElementById("coffee-popup");
        if (popup) {
            popup.classList.add("hidden");
        }

        if (typeof UI !== "undefined" && UI.refreshAll) {
            UI.refreshAll();
        }
    }

    /**
     * 处理点击彩蛋笔记本
     */
    function onNotebookClick() {
        var state = StateManager.getState();
        if (state.currentScene !== "aiInstitute") return;

        var hasItem = state.inventory.some(function (i) {
            return i.id === NOTEBOOK_HIDDEN_ITEM.id;
        });
        if (hasItem) {
            alert("你已收下这本研究员手稿，继续你的AI探索之旅吧！");
            return;
        }

        var popup = document.getElementById("notebook-popup");
        var textEl = document.getElementById("notebook-popup-text");
        var itemEl = document.getElementById("notebook-popup-item");

        if (textEl) {
            textEl.textContent = '实验台角落压着一本摊开的手稿，字迹有些潦草。扉页写着："真正的智能，不只是算法跑得更快，而是让机器学会理解人的温度。这本笔记留给你——愿你走得更远。"';
        }
        if (itemEl) {
            itemEl.innerHTML = '<span class="item-icon">' + NOTEBOOK_HIDDEN_ITEM.icon + '</span>' + NOTEBOOK_HIDDEN_ITEM.cnName;
        }
        if (popup) {
            popup.classList.remove("hidden");
        }
    }

    /**
     * 关闭笔记本彩蛋弹窗
     * 同时发放物品
     */
    function closeNotebookPopup() {
        StateManager.addInventoryItem({
            id: NOTEBOOK_HIDDEN_ITEM.id,
            name: NOTEBOOK_HIDDEN_ITEM.cnName,
            icon: NOTEBOOK_HIDDEN_ITEM.icon
        });

        var notebook = document.getElementById("hidden-notebook");
        if (notebook) {
            notebook.classList.add("found");
        }

        var popup = document.getElementById("notebook-popup");
        if (popup) {
            popup.classList.add("hidden");
        }

        if (typeof UI !== "undefined" && UI.refreshAll) {
            UI.refreshAll();
        }
    }

    /**
     * 处理点击隐藏关卡传送门
     * 委托给 DialogueManager.openSecretDialogue
     */
    function onSecretPortalClick() {
        if (DialogueManager.isOpen()) return;
        if (typeof DialogueManager.openSecretDialogue === "function") {
            DialogueManager.openSecretDialogue();
        }
    }

    /**
     * 完成隐藏关卡，发放终极奖励
     */
    function completeSecretRoom() {
        StateManager.addInventoryItem({
            id: SECRET_REWARD_ITEM.id,
            name: SECRET_REWARD_ITEM.cnName,
            icon: SECRET_REWARD_ITEM.icon
        });
        StateManager.addBadge({
            id: SECRET_REWARD_BADGE.id,
            name: SECRET_REWARD_BADGE.cnName,
            icon: SECRET_REWARD_BADGE.icon
        });
        StateManager.completeSecretRoom();

        var portal = document.getElementById("secret-portal");
        if (portal) {
            portal.classList.add("entered");
        }

        if (typeof UI !== "undefined" && UI.refreshAll) {
            UI.refreshAll();
        }
    }

    /**
     * 绑定事件处理器
     */
    function bindEvents() {
        var btnStart = document.getElementById("btn-start");
        if (btnStart) {
            btnStart.addEventListener("click", function () {
                startGame(true);
            });
        }

        var npcCharacter = document.getElementById("npc-character");
        if (npcCharacter) {
            npcCharacter.addEventListener("click", function () {
                if (!DialogueManager.isOpen()) {
                    DialogueManager.openDialogue();
                }
            });
        }

        var hiddenCat = document.getElementById("hidden-cat");
        if (hiddenCat) {
            hiddenCat.addEventListener("click", function () {
                onCatClick();
            });
        }

        var btnCatClose = document.getElementById("btn-cat-popup-close");
        if (btnCatClose) {
            btnCatClose.addEventListener("click", function () {
                closeCatPopup();
            });
        }

        var hiddenCoffee = document.getElementById("hidden-coffee");
        if (hiddenCoffee) {
            hiddenCoffee.addEventListener("click", function () {
                onCoffeeClick();
            });
        }

        var btnCoffeeClose = document.getElementById("btn-coffee-popup-close");
        if (btnCoffeeClose) {
            btnCoffeeClose.addEventListener("click", function () {
                closeCoffeePopup();
            });
        }

        var hiddenNotebook = document.getElementById("hidden-notebook");
        if (hiddenNotebook) {
            hiddenNotebook.addEventListener("click", function () {
                onNotebookClick();
            });
        }

        var btnNotebookClose = document.getElementById("btn-notebook-popup-close");
        if (btnNotebookClose) {
            btnNotebookClose.addEventListener("click", function () {
                closeNotebookPopup();
            });
        }

        var secretPortal = document.getElementById("secret-portal");
        if (secretPortal) {
            secretPortal.addEventListener("click", function () {
                onSecretPortalClick();
            });
        }

        var btnCloseDialogue = document.getElementById("btn-close-dialogue");
        if (btnCloseDialogue) {
            btnCloseDialogue.addEventListener("click", function () {
                DialogueManager.closeDialogue();
            });
        }

        var btnSend = document.getElementById("btn-send");
        if (btnSend) {
            btnSend.addEventListener("click", function () {
                DialogueManager.sendMessage();
            });
        }

        var dialogueInput = document.getElementById("dialogue-input");
        if (dialogueInput) {
            dialogueInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    DialogueManager.sendMessage();
                }
            });
        }

        var sceneButtons = document.querySelectorAll(".btn-scene");
        sceneButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var sceneId = btn.getAttribute("data-scene");
                goToScene(sceneId);
            });
        });

        var btnRestart = document.getElementById("btn-restart");
        if (btnRestart) {
            btnRestart.addEventListener("click", function () {
                restart();
            });
        }
    }

    /* 公开接口 */
    return {
        init: init,
        startGame: startGame,
        goToScene: goToScene,
        showVictory: showVictory,
        restart: restart,
        bindEvents: bindEvents,
        onCatClick: onCatClick,
        closeCatPopup: closeCatPopup,
        onCoffeeClick: onCoffeeClick,
        closeCoffeePopup: closeCoffeePopup,
        onNotebookClick: onNotebookClick,
        closeNotebookPopup: closeNotebookPopup,
        onSecretPortalClick: onSecretPortalClick,
        completeSecretRoom: completeSecretRoom
    };
})();
