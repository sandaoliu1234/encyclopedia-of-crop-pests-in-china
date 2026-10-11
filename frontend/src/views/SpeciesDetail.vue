<template>
  <div class="species-detail" v-if="species">
    <div class="detail-header">
      <div class="header-text">
        <span class="type-tag" :class="species.type">
          {{ species.type === 'crop' ? '作物' : '害虫' }}
        </span>
        <h1>{{ species.name }}</h1>
        <p class="latin-name">{{ species.latin }}</p>
        <p v-if="species.order" class="taxonomy">
          <span class="tax-item">{{ species.order }}</span>
          <span class="tax-sep">/</span>
          <span class="tax-item">{{ species.family }}</span>
        </p>
      </div>
    </div>

    <div class="detail-body">
      <div class="main-content">
        <template v-if="species.type === 'pest'">
          <section class="info-section">
            <h2><span class="section-icon">&#128064;</span> 形态特征</h2>
            <p>{{ species.morphology }}</p>
          </section>
          <section class="info-section">
            <h2><span class="section-icon">&#128337;</span> 生活史</h2>
            <p>{{ species.lifeHistory }}</p>
          </section>
          <section class="info-section">
            <h2><span class="section-icon">&#9888;&#65039;</span> 为害症状</h2>
            <p>{{ species.damage }}</p>
          </section>
          <section class="info-section">
            <h2><span class="section-icon">&#128197;</span> 发生规律</h2>
            <p>{{ species.occurrence }}</p>
          </section>
          <section class="info-section">
            <h2><span class="section-icon">&#128737;&#65039;</span> 防治方法</h2>
            <p>{{ species.control }}</p>
          </section>
        </template>

        <template v-if="species.type === 'crop'">
          <section class="info-section">
            <h2><span class="section-icon">&#127793;</span> 简介</h2>
            <p>{{ species.intro }}</p>
          </section>
          <section class="info-section" v-if="cropPests.length">
            <h2><span class="section-icon">&#128027;</span> 主要害虫（{{ cropPests.length }}种）</h2>
            <div class="pest-grid">
              <router-link
                v-for="link in cropPests"
                :key="link.pestId"
                :to="`/species/${link.pestId}`"
                class="pest-card"
              >
                <div class="pest-card-top">
                  <span class="pest-name">{{ link.name }}</span>
                  <span class="damage-badge" :class="'level-' + link.damageLevel">
                    {{ ['', '轻', '偏轻', '中', '偏重', '大发生'][link.damageLevel] }}
                  </span>
                </div>
                <span class="pest-latin">{{ link.latin }}</span>
                <span class="damage-part">为害部位：{{ link.damagePart }}</span>
              </router-link>
            </div>
          </section>
        </template>
      </div>

      <div class="side-panel" v-if="species.type === 'pest'">
        <div class="side-card">
          <h3>分布区域</h3>
          <div ref="miniMapRef" class="mini-map"></div>
        </div>
        <div class="side-card distribution-legend">
          <h3>各省发生程度</h3>
          <ul>
            <li v-for="d in distribution" :key="d.adcode">
              <span class="dist-name">{{ d.name }}</span>
              <span class="dist-level" :class="'level-' + d.level">
                {{ ['', '轻发生', '偏轻', '中等', '偏重', '大发生'][d.level] }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import {
  getSpeciesById,
  getPestsForCrop,
  getDistributionForPest,
  loadGeoJSON,
} from '../api/dataSource.js'

const route = useRoute()
const species = ref(null)
const cropPests = ref([])
const distribution = ref([])
const miniMapRef = ref(null)
let miniMap = null

onMounted(async () => {
  await loadSpecies()
})

watch(() => route.params.id, async () => {
  await loadSpecies()
})

async function loadSpecies() {
  const id = route.params.id
  species.value = await getSpeciesById(id)
  if (!species.value) return

  if (species.value.type === 'crop') {
    cropPests.value = await getPestsForCrop(id)
  }

  if (species.value.type === 'pest') {
    distribution.value = await getDistributionForPest(id)
    await initMiniMap()
  }
}

async function initMiniMap() {
  if (!miniMapRef.value) return
  if (!miniMap) {
    const geoData = await loadGeoJSON(100000)
    echarts.registerMap('china-mini', geoData)
    miniMap = echarts.init(miniMapRef.value)
  }
  const mapData = distribution.value.map(d => ({ name: d.name, value: d.level }))
  miniMap.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1a1a2e', fontSize: 12 },
    },
    visualMap: {
      min: 0, max: 5, show: false,
      inRange: { color: ['#f7fcf5', '#c7e9c0', '#31a354', '#00441b'] },
    },
    series: [{
      type: 'map', map: 'china-mini', roam: false,
      emphasis: { label: { show: false } },
      itemStyle: { areaColor: '#e8ece8', borderColor: '#fff' },
      data: mapData,
    }],
  }, true)
}
</script>

<style scoped>
.species-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.type-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.type-tag.pest {
  background: #fef3c7;
  color: #92400e;
}

.type-tag.crop {
  background: #d1fae5;
  color: #065f46;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text);
  margin: 4px 0;
  letter-spacing: -0.5px;
}

.latin-name {
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 16px;
  margin-bottom: 4px;
}

.taxonomy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.tax-item {
  padding: 2px 10px;
  background: var(--color-primary-light);
  border-radius: 10px;
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
}

.tax-sep {
  color: var(--color-text-muted);
}

.detail-body {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-section {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition);
}

.info-section:hover {
  box-shadow: var(--shadow-md);
}

.info-section h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-primary-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 16px;
}

.info-section p {
  font-size: 14px;
  line-height: 1.9;
  color: var(--color-text-secondary);
}

.side-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.side-card h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-primary-light);
}

.mini-map {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.distribution-legend ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.distribution-legend li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f4;
}

.dist-name {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.dist-level {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 8px;
}

.dist-level.level-1 { background: #f0fdf4; color: #4ade80; }
.dist-level.level-2 { background: #dcfce7; color: #22c55e; }
.dist-level.level-3 { background: #bbf7d0; color: #16a34a; }
.dist-level.level-4 { background: #86efac; color: #15803d; }
.dist-level.level-5 { background: #22c55e; color: #fff; }

.pest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.pest-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f8fdf9 0%, #f0faf4 100%);
  border: 1px solid #d1e7d8;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: all var(--transition);
}

.pest-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.pest-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pest-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-text);
}

.damage-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
}

.damage-badge.level-1 { background: #f0fdf4; color: #4ade80; }
.damage-badge.level-2 { background: #dcfce7; color: #22c55e; }
.damage-badge.level-3 { background: #bbf7d0; color: #16a34a; }
.damage-badge.level-4 { background: #fef3c7; color: #d97706; }
.damage-badge.level-5 { background: #fef2f2; color: #dc2626; }

.pest-latin {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
}

.damage-part {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
