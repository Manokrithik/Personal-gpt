Set oShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
pythonw = strPath & "\backend\.venv\Scripts\pythonw.exe"
appScript = strPath & "\desktop_app.py"

oShell.CurrentDirectory = strPath
oShell.Run """" & pythonw & """ """ & appScript & """", 0, False
