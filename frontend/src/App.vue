<template>
  <div id="app">
    <header class="app-header">
      <router-link to="/" class="logo">🌾 中国农作物虫子百科</router-link>
      <SearchBar />
      <nav class="nav-links">
        <router-link to="/">地图总览</router-link>
        <router-link to="/crops">作物</router-link>
        <router-link to="/pests">害虫</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>数据仅供参考，防治方案以当地植保部门为准</p>
    </footer>
  </div>
</template>

<script setup>
import SearchBar from './components/SearchBar.vue'
</script>
