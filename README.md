# 中国农作物虫子百科

一个以地图为核心交互的中国农作物害虫百科系统。点开即见全国分布，点作物见其害虫，点害虫见其词条。

## 在线演示

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 http://localhost:3000

## 功能特性

- **地图总览** — ECharts 省级热力图，展示全国害虫发生程度分布
- **月份时间轴** — 拖动查看害虫逐月发生动态（迁飞性害虫的季节性变化）
- **百科词条** — 形态特征、生活史、为害症状、发生规律、防治方法
- **作物↔害虫关联** — 点作物看其主要害虫，点害虫看其寄主作物
- **智能检索** — 支持中文名、拉丁名、拼音、俗名模糊搜索
- **分布数据** — 10 种主要害虫覆盖全国各省发生程度（数据来源：全国农技中心）

## 当前数据

| 类型 | 数量 | 说明 |
|------|------|------|
| 作物 | 5 种 | 水稻、小麦、玉米、棉花、大豆 |
| 害虫 | 10 种 | 褐飞虱、白背飞虱、二化螟、稻纵卷叶螟、草地贪夜蛾、棉铃虫、玉米螟、小麦蚜虫、粘虫、大豆食心虫 |
| 分布记录 | 10 种害虫 × 9-18 省 | 含综合等级 + 逐月发生程度 |

## 技术栈

- **前端框架**：Vue 3 + Vite
- **地图可视化**：ECharts 5（中国省级 GeoJSON）
- **客户端检索**：MiniSearch + pinyin-pro（拼音/俗名/模糊匹配）
- **数据格式**：静态 JSON（构建期生成，零服务器依赖）
- **地图数据**：阿里云 DataV 行政区划 GeoJSON

## 项目结构

```
├── frontend/
│   ├── public/
│   │   ├── data/
│   │   │   ├── index.json              # 物种索引
│   │   │   ├── crop-pest.json          # 作物-害虫关联
│   │   │   └── map/
│   │   │       └── pest-distribution.json  # 分布数据
│   │   └── geo/
│   │       └── 100000.json             # 中国省级边界
│   └── src/
│       ├── api/dataSource.js           # 数据加载层
│       ├── components/SearchBar.vue    # 搜索组件
│       ├── views/
│       │   ├── MapHome.vue             # 地图首页
│       │   ├── SpeciesDetail.vue       # 词条详情
│       │   ├── CropList.vue            # 作物列表
│       │   ├── PestList.vue            # 害虫列表
│       │   └── SearchResult.vue        # 搜索结果
│       └── router/index.js
├── 实现方案.md                          # 全栈架构方案
├── 最终方案.md                          # 终态大规模架构方案
└── 轻量方案.md                          # 纯静态架构方案（当前实现）
```

## 架构说明

本项目采用**轻量方案**（纯静态架构），数据全部为构建期生成的 JSON 文件，前端按需 fetch，无需后端服务。

三套方案文档记录了从原型到终态的演进路径：

1. **轻量方案**（当前）— 零服务器，静态 JSON + CDN 托管
2. **实现方案** — Spring Boot 全栈版，含 MySQL + ES + Redis
3. **最终方案** — 大规模数据版，PostgreSQL + Doris + NebulaGraph + K8s

轻量方案的前端可无缝升级到全栈方案（只需将 `fetch('/data/xxx.json')` 替换为 `axios.get('/api/xxx')`）。

## 数据来源

- [全国农技推广服务中心](http://www.natesc.org.cn/) — 病虫害测报数据
- [CropDP-KG](https://github.com/dadadaray/CropDP-KG) — 中国农作物病虫害知识图谱
- [IP102](https://github.com/xpwu95/IP102) — 害虫图像基准数据集
- [中国大百科全书](https://www.zgbk.com/) — 物种分类与分布信息
- 百度百科、Agropages 等公开渠道

## 声明

> 数据仅供参考，防治方案以当地植保部门为准。

## License

MIT
