' 登录时静默唤醒 WSL，由 systemd 自动启动 Redis，无黑窗口闪现
' 用法：Win+R 输入 shell:startup 回车，把本文件拖进打开的文件夹
Set ws = CreateObject("Wscript.Shell")
ws.Run "wsl.exe -d Ubuntu --exec /bin/true", 0, False
