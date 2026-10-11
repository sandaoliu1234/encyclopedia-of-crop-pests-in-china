<template>
  <div class="list-page">
    <div class="page-header">
      <h1>害虫列表</h1>
      <p class="page-desc">中国农作物主要害虫百科词条</p>
    </div>
    <div class="card-grid">
      <router-link
        v-for="pest in pests"
        :key="pest.id"
        :to="`/species/${pest.id}`"
        class="species-card"
      >
        <div class="card-top">
          <span v-if="pest.isChief" class="chief-tag">主要害虫</span>
          <span class="order-tag">{{ pest.order }}</span>
        </div>
        <h3>{{ pest.name }}</h3>
        <p class="card-latin">{{ pest.latin }}</p>
        <div class="card-footer">
          <span class="card-family">{{ pest.family }}</span>
          <span class="card-arrow">&rarr;</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPests } from '../api/dataSource.js'

const pests = ref([])
onMounted(async () => {
  pests.value = await getPests()
})
</script>

<style scoped>
.list-page {
  max-width: 1100px;
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
  letter-spacing: -0.3px;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.species-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
  transition: all var(--transition);
}

.species-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--color-accent);
}

.card-top {
  display: flex;
  gap: 6px;
  margin-bottom: 2px;
}

.chief-tag {
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  padding: 2px 10px;
  border-radius: 10px;
}

.order-tag {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px 10px;
  border-radius: 10px;
}

.species-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
  color: var(--color-text);
}

.card-latin {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f1f5f4;
}

.card-family {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.card-arrow {
  font-size: 16px;
  color: var(--color-accent);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition);
}

.species-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}
</style>
