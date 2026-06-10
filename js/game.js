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
        bindEvents: bindEvents
    };
})();
