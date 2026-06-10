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
            textEl.textContent = "A hidden tabby cat is sunbathing in the school gate. Everyone calls it \"Senior\". It rubs against your leg and drops a small glowing paw print. It seems to bring good luck on your campus adventure!";
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
        closeCatPopup: closeCatPopup
    };
})();
