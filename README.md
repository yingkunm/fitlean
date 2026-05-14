# FitLean Tracker / 减脂助手

一个可在浏览器运行、也可封装为 iOS/Android Native App 的减脂记录与推荐 MVP。项目使用 React + TypeScript + Vite + Capacitor 构建，数据只保存在本地 `localStorage`，不包含云端登录、后端服务或付费 API。

## 功能

- 个人资料：记录年龄、性别估算选项、身高、体重、目标日期、围度、饮食偏好、运动偏好、器械和伤病备注。
- Dashboard：首页展示今日摄入、运动消耗、净摄入、建议摄入、BMI、目标差距、记录数量和 7 日趋势。
- 饮食记录：内置 30+ 常见食物，支持按克数自动估算热量和三大营养素，也支持自定义食物。
- 运动记录：内置 MET 表，按体重和运动时长估算消耗。
- 进度记录：记录体重和围度，展示体重、腰围趋势以及从第一条到最新记录的变化。
- 推荐页：基于本地规则生成每日热量和宏量建议、食谱推荐、一周运动计划。
- 数据管理：支持加载示例数据、导出 JSON、导入 JSON、清空数据。

## 安装

```bash
npm install
```

## 本地运行

```bash
npm run dev
```

运行后在浏览器打开终端输出的本地地址，通常是：

```text
http://localhost:5173
```

## 构建测试

```bash
npm run build
```

当前 MVP 未配置单元测试脚本，因此没有 `npm test`。构建会执行 TypeScript 检查和 Vite 生产构建。

## Native App 运行

本项目已接入 Capacitor，包含 `ios/` 和 `android/` 原生工程。

同步 Web 构建到原生工程：

```bash
npm run native:sync
```

打开 iOS 工程：

```bash
npm run native:open:ios
```

打开 Android 工程：

```bash
npm run native:open:android
```

直接运行到模拟器或真机：

```bash
npm run native:run:ios
npm run native:run:android
```

iOS 需要本机安装 Xcode。Android 需要安装 Android Studio 和 Android SDK。每次修改 Web 代码后，先执行 `npm run native:sync`，再在 Xcode 或 Android Studio 中构建运行。

## 微信小程序版本

仓库内新增了 Taro 小程序版本：

```bash
cd miniprogram
npm install
npm run build:weapp
```

然后用微信开发者工具导入 `miniprogram/` 目录即可预览。小程序版同样只使用本地 storage，不接入云开发或后端服务。

## 主要计算公式

- BMI = 体重 kg / 身高 m²
- BMR 使用 Mifflin-St Jeor 公式：
  - 男：`10 * weightKg + 6.25 * heightCm - 5 * age + 5`
  - 女：`10 * weightKg + 6.25 * heightCm - 5 * age - 161`
  - 其他/不透露：取男女公式平均值
- TDEE = BMR * 活动系数
  - 久坐 1.2
  - 轻度活动 1.375
  - 中等活动 1.55
  - 高度活动 1.725
  - 非常活跃 1.9
- 理论每日热量缺口 = 目标减重 kg * 7700 / 距目标日期天数
- 推荐每日热量缺口限制在 250 到 750 kcal/天
- 建议每日摄入 = TDEE - 推荐每日热量缺口
- 运动消耗 = MET * 3.5 * 体重 kg / 200 * 时长分钟

## 本地数据说明

所有个人资料、饮食、运动和进度记录都保存在当前浏览器或 Native WebView 的 `localStorage` 中。换浏览器、卸载 App、清除站点数据或使用隐私模式可能导致数据不可见或丢失。建议需要备份时使用「导出 JSON」。

## 健康免责声明

本应用提供的热量、运动消耗、食谱和运动建议均为估算，仅用于自我记录和一般健康管理，不构成医疗建议。孕期、哺乳期、未成年人、有慢性疾病、进食障碍史、严重肥胖或正在服药的人，请先咨询医生或注册营养师。
