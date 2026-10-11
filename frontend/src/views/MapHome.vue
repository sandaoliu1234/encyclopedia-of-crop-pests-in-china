<template>
  <div class="map-home">
    <div class="map-container">
      <aside class="map-sidebar">
        <div class="sidebar-header">
          <h2>地图总览</h2>
          <p class="sidebar-desc">选择害虫查看全国分布与发生动态</p>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">&#128269;</span>
            害虫筛选
          </label>
          <select v-model="selectedPestId" @change="onPestChange" class="filter-select">
            <option value="">全部害虫综合总览</option>
            <option v-for="pest in pests" :key="pest.id" :value="pest.id">
              {{ pest.name }}（{{ pest.latin }}）
            </option>
          </select>
        </div>

        <div v-if="selectedPestId" class="timeline-group">
          <label class="filter-label">
            <span class="label-icon">&#128197;</span>
            月份：{{ selectedMonth > 0 ? selectedMonth + '月' : '全年综合' }}
          </label>
          <input type="range" min="0" max="12" v-model.number="selectedMonth" class="timeline-slider" />
          <div class="timeline-labels">
            <span>全年</span>
            <span>1月</span>
            <span>6月</span>
            <span>12月</span>
          </div>
        </div>

        <div v-if="selectedPest" class="pest-info-card">
          <div class="pest-card-header">
            <h3>{{ selectedPest.name }}</h3>
            <span class="pest-order">{{ selectedPest.order }}</span>
          </div>
          <p class="latin">{{ selectedPest.latin }}</p>
          <p class="pest-damage">{{ selectedPest.damage }}</p>
          <router-link :to="`/species/${selectedPest.id}`" class="detail-link">
            查看完整词条
            <span class="arrow">&rarr;</span>
          </router-link>
        </div>

        <div v-if="!selectedPestId" class="legend-card">
          <h4>发生程度图例</h4>
          <div class="legend-items">
            <div class="legend-item"><span class="legend-color" style="background:#f7fcf5;border:1px solid #ddd"></span> 无记载</div>
            <div class="legend-item"><span class="legend-color" style="background:#e5f5e0"></span> 轻发生</div>
            <div class="legend-item"><span class="legend-color" style="background:#c7e9c0"></span> 偏轻</div>
            <div class="legend-item"><span class="legend-color" style="background:#74c476"></span> 中等</div>
            <div class="legend-item"><span class="legend-color" style="background:#31a354"></span> 偏重</div>
            <div class="legend-item"><span class="legend-color" style="background:#00441b"></span> 大发生</div>
          </div>
        </div>
      </aside>

      <div ref="chartRef" class="chart-area"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { getPests, getDistributionForPest, loadGeoJSON } from '../api/dataSource.js'

const chartRef = ref(null)
const pests = ref([])
const selectedPestId = ref('')
const selectedMonth = ref(0)
let chart = null
let geoData = null
let distributionData = ref([])

const selectedPest = computed(() => {
  return pests.value.find(p => p.id === selectedPestId.value)
})

onMounted(async () => {
  pests.value = await getPests()
  geoData = await loadGeoJSON(100000)
  echarts.registerMap('china', geoData)
  chart = echarts.init(chartRef.value)
  await loadOverview()
  window.addEventListener('resize', () => chart?.resize())
})

async function loadOverview() {
  if (!selectedPestId.value) {
    await loadAllPestsOverview()
  } else {
    await loadSinglePestDistribution()
  }
}

async function loadAllPestsOverview() {
  const allDist = {}
  for (const pest of pests.value.filter(p => p.isChief)) {
    const dist = await getDistributionForPest(pest.id)
    for (const d of dist) {
      if (!allDist[d.adcode]) allDist[d.adcode] = { adcode: d.adcode, name: d.name, totalLevel: 0, count: 0 }
      allDist[d.adcode].totalLevel += d.level
      allDist[d.adcode].count++
    }
  }
  const mapData = Object.values(allDist).map(d => ({
    name: d.name,
    value: Math.round(d.totalLevel / d.count * 10) / 10,
  }))
  renderChart(mapData, '主要害虫综合发生程度')
}

async function loadSinglePestDistribution() {
  distributionData.value = await getDistributionForPest(selectedPestId.value)
  const month = selectedMonth.value
  const mapData = distributionData.value.map(d => {
    const value = month > 0 ? (d.months[month - 1] ?? null) : d.level
    return { name: d.name, value }
  }).filter(d => d.value !== null)
  const title = month > 0
    ? `${selectedPest.value?.name || ''} ${month}月发生程度`
    : `${selectedPest.value?.name || ''} 综合发生程度`
  renderChart(mapData, title)
}

function renderChart(mapData, title) {
  const option = {
    title: {
      text: title,
      left: 'center',
      top: 16,
      textStyle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#1a1a2e', fontSize: 13 },
      formatter: (params) => {
        if (params.value === null || params.value === undefined) {
          return `<b>${params.name}</b><br/><span style="color:#999">暂无记载</span>`
        }
        const levelText = ['', '轻发生', '偏轻', '中等', '偏重', '大发生']
        const colors = ['', '#74c476', '#74c476', '#31a354', '#238b45', '#00441b']
        return `<b>${params.name}</b><br/>发生程度：<span style="color:${colors[params.value]};font-weight:600">${levelText[params.value] || params.value}</span>`
      },
    },
    visualMap: {
      min: 0,
      max: 5,
      left: 24,
      bottom: 24,
      text: ['大发生', '无'],
      inRange: { color: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#74c476', '#31a354', '#00441b'] },
      calculable: true,
      textStyle: { color: '#5a6577' },
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: true,
      scaleLimit: { min: 1, max: 5 },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 600, color: '#1a1a2e' },
        itemStyle: { areaColor: '#ffd54f', borderColor: '#fff', borderWidth: 2 },
      },
      itemStyle: {
        areaColor: '#e8ece8',
        borderColor: '#fff',
        borderWidth: 1,
      },
      data: mapData,
    }],
  }
  chart.setOption(option, true)
}

function onPestChange() {
  loadOverview()
}

watch(selectedMonth, () => {
  if (selectedPestId.value) loadSinglePestDistribution()
})
</script>

<style scoped>
.map-home {
  padding: 20px 24px;
}

.map-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 64px - 56px - 40px);
}

.map-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-bottom: 4px;
}

.sidebar-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}

.filter-group, .timeline-group {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.label-icon {
  font-size: 14px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text);
  background: #fafbfc;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a6577' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 122, 76, 0.1);
}

.timeline-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, var(--color-primary-light), var(--color-primary));
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid #fff;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.15s;
}

.timeline-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.pest-info-card {
  background: linear-gradient(135deg, #f0faf4 0%, #e8f5e9 100%);
  border: 1px solid #c8e6c9;
  border-radius: var(--radius-md);
  padding: 16px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.pest-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.pest-card-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.pest-order {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(26, 122, 76, 0.12);
  color: var(--color-primary);
  font-weight: 500;
}

.pest-info-card .latin {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 10px;
}

.pest-damage {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: rgba(26, 122, 76, 0.08);
  transition: all var(--transition);
}

.detail-link:hover {
  background: rgba(26, 122, 76, 0.15);
}

.detail-link .arrow {
  transition: transform 0.2s;
}

.detail-link:hover .arrow {
  transform: translateX(3px);
}

.legend-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.legend-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.chart-area {
  flex: 1;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-height: 500px;
  overflow: hidden;
}
</style>
