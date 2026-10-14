#!/bin/bash
# 单词魔境 · 启动脚本（macOS：双击运行；Linux：在终端里执行 ./start.command）
# 作用：在本机开一个只给自己用的小服务器，再用浏览器打开游戏。
# 口语关要用麦克风，通过 http://localhost 打开时浏览器只会问一次权限。
cd "$(dirname "$0")" || exit 1
PORT=8777
URL="http://localhost:$PORT/"
open_browser() {
  if [ "$(uname)" = "Darwin" ]; then open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1
  else echo "请在浏览器里打开 $URL"; fi
}
if command -v curl >/dev/null 2>&1 && curl -s -o /dev/null "$URL"; then
  echo "游戏已经在运行，直接打开 $URL"; open_browser; exit 0
fi
( sleep 1; open_browser ) &
if command -v node >/dev/null 2>&1; then
  exec node tools/serve.js "$PORT"
elif command -v python3 >/dev/null 2>&1; then
  echo "单词魔境已启动： $URL   （关闭这个窗口或按 Ctrl + C 停止）"
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
else
  echo "没有找到 node 或 python3。可以直接双击 index.html 玩（口语关会反复询问麦克风权限）。"
  read -r -p "按回车键关闭…" _
fi
