<template>
  <div class="search-bar">
    <div class="search-input-wrap">
      <span class="search-icon">&#128269;</span>
      <input
        v-model="query"
        type="text"
        placeholder="搜索害虫、作物（支持拼音/俗名）"
        @keyup.enter="doSearch"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>
    <ul v-if="suggestions.length && showSuggestions" class="suggestions">
      <li v-for="item in suggestions" :key="item.id" @mousedown.prevent="goToSpecies(item.id)">
        <span class="tag" :class="item.type">{{ item.type === 'crop' ? '作物' : '害虫' }}</span>
        <span class="item-name">{{ item.name }}</span>
        <span class="latin">{{ item.latin }}</span>
      </li>
      <li class="suggestion-footer" @mousedown.prevent="doSearch">
        按 Enter 搜索全部结果 &rarr;
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadSpeciesIndex } from '../api/dataSource.js'
import { pinyin } from 'pinyin-pro'
import MiniSearch from 'minisearch'

const router = useRouter()
const query = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
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
})

function onInput() {
  if (!miniSearch || !query.value.trim()) {
    suggestions.value = []
    return
  }
  const results = miniSearch.search(query.value.trim(), { prefix: true }).slice(0, 6)
  suggestions.value = results.map(r => ({
    id: r.id,
    name: r.name,
    latin: r.latin,
    type: r.type,
  }))
}

function onFocus() {
  if (query.value.trim() && suggestions.value.length) {
    showSuggestions.value = true
  }
}

function onBlur() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

function doSearch() {
  if (!query.value.trim()) return
  router.push({ path: '/search', query: { q: query.value.trim() } })
  suggestions.value = []
  showSuggestions.value = false
}

function goToSpecies(id) {
  router.push(`/species/${id}`)
  suggestions.value = []
  query.value = ''
  showSuggestions.value = false
}
</script>

<style scoped>
.search-bar {
  position: relative;
  flex: 1;
  max-width: 420px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  opacity: 0.6;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

input:focus {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a2e;
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

input:focus::placeholder {
  color: #8e99a9;
}

input:focus ~ .search-icon,
.search-input-wrap:focus-within .search-icon {
  opacity: 0.4;
}

.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  list-style: none;
  z-index: 200;
  max-height: 340px;
  overflow-y: auto;
  animation: dropIn 0.2s ease;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.suggestions li {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.15s;
}

.suggestions li:hover {
  background: #f0faf4;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

.tag.crop {
  background: #d1fae5;
  color: #065f46;
}

.tag.pest {
  background: #fef3c7;
  color: #92400e;
}

.item-name {
  font-weight: 600;
  color: var(--color-text);
}

.latin {
  color: var(--color-text-muted);
  font-size: 12px;
  font-style: italic;
  margin-left: auto;
}

.suggestion-footer {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
  border-top: 1px solid #f1f5f4;
  justify-content: center;
  padding: 8px;
}

.suggestion-footer:hover {
  background: var(--color-primary-light);
}
</style>
