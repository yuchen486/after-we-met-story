# 话到这里

后来我们仍说了许多话。有些意思，却一直留在上一句。

[在线阅读《话到这里》](https://yuchen486.github.io/after-we-met-story/)

[微信与手机新版直达](https://yuchen486.github.io/after-we-met-story/releases/20261019-3/)

一篇关于李向武的散文。以《再往前一些》的语气为参照，通过“真诚、南京、推算、朋友、往后”五个词，回看一段关系里的自我解释、试探与停留。正文采用完整段落，不按事件流水编排。

## 阅读与维护

原生 HTML、CSS、JavaScript，无依赖、无构建步骤。支持连读/分节、字号、夜读、本地书签、摘句、正文下载与打印。手机和桌面自适应，尊重减少动态效果的系统设置。

本地打开 `index.html`，或运行 `python -m http.server 8000` 后访问 `http://localhost:8000/`。

- `story.js`：正文、关键词梗概、摘句、素材原句。
- `index.html`、`style.css`、`app.js`：页面、样式、阅读交互。
- `话到这里.md`：当前完整正文；`相识以后.md` 保留旧链接，内容同步为修订稿。
- `assets/rain-window.jpg`：封面摄影。

GitHub Pages 从 `main` 分支根目录发布，推送后自动更新。旧版 `#company` 链接与书签转到修订后的第一节。

### 发布更新

编辑根目录中的 HTML、CSS、JavaScript 与正文后，使用一个新的版本号生成发布文件：

```sh
node scripts/release.mjs 20261019-4
git add .
git commit -m "Update essay"
git push
```

发布脚本为资源生成内容指纹，并生成独立的 `releases/<版本>/` 页面和 `release.json`。保留旧资源，以便尚未更新的浏览器仍可完整阅读。已存在的版本不可覆盖为不同内容。未来版本号应继续递增。

网页会在载入、从历史快照恢复或重新显示时检查版本，也可在文末点“检查更新”。检查采用不复用浏览器缓存的请求及一次性查询参数；发现新版后进入新的页面路径并保留章节位置。网络不可用时继续阅读当前稿。

此前缓存了旧 HTML 的微信窗口可能仍无法执行后来新增的检查代码；首次请使用上面的“新版直达”地址，避开旧入口缓存。

## 素材与文学转述

文章基于既有叙述与可读聊天文字进行散文化改写。反复、犹疑、设想与自我追问经过文学整理，不代表对方已经表达的内心；未将尚未成行的见面写成事实，也未编写未转写语音或通话中的具体内容。页面文后可展开查看关键词心路与素材说明。

## 摄影与许可

封面为 Alexander Höhn 拍摄的真实雨夜照片，按 [Unsplash License](https://unsplash.com/license) 使用。[原始摄影页面](https://unsplash.com/photos/rainy-window-with-blurred-city-lights-at-night-NASAVbhNb6g)。照片仅用于氛围表达，与文中人物的实际地点、经历无关。

网页程序代码采用 [MIT License](LICENSE)。文学正文、聊天摘句和第三方摄影不属于该 MIT 授权范围；摄影适用上述独立许可。
