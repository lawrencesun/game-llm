/**
 * main.js - 游戏入口文件
 *
 * 负责：在DOM加载完成后初始化游戏、绑定事件
 * 所有模块通过此文件启动
 */
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("AI校园探险 - 游戏加载中...");

        Game.bindEvents();

        Game.init();

        console.log("AI校园探险 - 游戏加载完成！");
        console.log("提示：请确保Ollama已启动并加载了qwen3:0.6b模型");
    });
})();
