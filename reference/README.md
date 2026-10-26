# 食材参考包

这个文件夹是《解压火锅店》19 种食材的豆包生图参考与成品原图。

- 豆包生成的 19 张成品原图：`ingredient-icons/`
- 成品透明化并接入游戏后的资源：`../assets/ingredients/`

## 内容

- `ingredient-sheet.png`：19 种食材 + 风格说明的总览图，适合直接作为风格参考。
- `icons/`：每种食材一张独立卡片图，中文名和描述都在图上。
- `doubao-prompt.txt`：可直接复制给豆包的完整提示词。
- `hotpot-ingredients-for-doubao.zip`：上述内容的压缩包。

## 当前状态

豆包生成的 19 张新图已经接入游戏，白底通过 macOS Vision 前景分割去除，并统一成 512px 透明 PNG。
游戏内资源在 `../assets/ingredients/`，原图保留在 `ingredient-icons/`。

## 如果之后还要继续重绘

1. 把 `ingredient-sheet.png` 和独立卡片发给豆包。
2. 粘贴 `doubao-prompt.txt` 里的提示词。
3. 让豆包按单张、1:1、透明背景输出。

## 食材清单

螃蟹、鱼豆腐、红枣、姜片、鸡蛋、午餐肉、鸡排、黄豆芽、鱼片、虾、排骨、青花椒、鸭血、带鱼、响铃卷、黄瓜、泥鳅、鲳鱼、西番茄。
