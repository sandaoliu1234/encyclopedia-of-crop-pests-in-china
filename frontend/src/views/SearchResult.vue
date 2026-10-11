<template>
  <div class="search-result">
    <div class="page-header">
      <h1>搜索结果</h1>
      <p class="query-text">关键词：<strong>{{ query }}</strong></p>
      <p class="result-count" v-if="results.length">找到 {{ results.length }} 个相关物种</p>
    </div>
    <div v-if="results.length" class="result-list">
      <router-link
        v-for="item in results"
        :key="item.id"
        :to="`/species/${item.id}`"
        class="result-card"
      >
        <span class="type-tag" :class="item.type">
          {{ item.type === 'crop' ? '作物' : '害虫' }}
        </span>
        <div class="result-text">
          <h3>{{ item.name }}</h3>
          <p class="latin">{{ item.latin }}</p>
        </div>
        <span class="result-arrow">&rarr;</span>
      </router-link>
    </div>
    <div v-else class="no-result">
      <p class="no-result-icon">&#128270;</p>
      <p>未找到相关物种</p>
      <p class="no-result-hint">试试用拼音、俗名或拉丁名搜索</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadSpeciesIndex } from '../api/dataSource.js'
import { pinyin } from 'pinyin-pro'
import MiniSearch from 'minisearch'

const route = useRoute()
const query = ref('')
const results = ref([])
let miniSearch = null

onMounted(async () => {
  const data = await loadSpeciesIndex()
  const enriched = data.map(s => ({
    ...s,
    pinyin: pinyin(s.name, { toneType: 'none', type: 'array' }).join(''),
    pinyinFirst: pinyin(s.name, { pattern: 'first', type: 'array' }).join(''),
  }))
  miniSearch = new MiniSearch({
    fields: ['name', 'latin', 'pinyin', 'pinyinFirst'],
    storeFields: ['id', 'name', 'latin', 'type'],
    searchOptions: { fuzzy: 0.2, prefix: true },
  })
  miniSearch.addAll(enriched)
  doSearch()
})

watch(() => route.query.q, () => {
  doSearch()
})

function doSearch() {
  query.value = route.query.q || ''
  if (!miniSearch || !query.value.trim()) {
    results.value = []
    return
  }
  const res = miniSearch.search(query.value.trim(), { prefix: true })
  results.value = res.map(r => ({
    id: r.id,
    name: r.name,
    latin: r.latin,
    type: r.type,
  }))
}
</script>

<style scoped>
.search-result {
  max-width: 800px;
  margin: 0 auto;
  padding: 28px 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
}

.query-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.query-text strong {
  color: var(--color-primary);
}

.result-count {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
  transition: all var(--transition);
}

.result-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.type-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.type-tag.pest {
  background: #fef3c7;
  color: #92400e;
}

.type-tag.crop {
  background: #d1fae5;
  color: #065f46;
}

.result-text {
  flex: 1;
}

.result-text h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.latin {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.result-arrow {
  font-size: 18px;
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition);
}

.result-card:hover .result-arrow {
  opacity: 1;
  transform: translateX(0);
}

.no-result {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.no-result-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.no-result p {
  font-size: 16px;
  margin-bottom: 6px;
}

.no-result-hint {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
