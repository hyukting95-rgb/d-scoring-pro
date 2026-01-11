# 进入项目目录
cd "D:\d-scoring-pro-management-system"

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: D-Scoring Pro system"

# 添加远程仓库
git remote add origin https://github.com/hyukting95-rgb/d-scoring-pro.git

# 推送所有分支
git push origin --all

# 推送标签
git push origin --tags

Write-Host "代码推送完成！"
