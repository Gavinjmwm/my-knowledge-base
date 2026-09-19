---
aside: false
---

<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { computed } from 'vue'

const { site, theme, page, frontmatter } = useData()
const route = useRoute()

const fmt = (v: unknown) => JSON.stringify(v, null, 2)

const routePath = computed(() => route.path)
</script>

# API Examples

本页演示 VitePress 提供的部分运行时 API。

最核心的 `useData()` 可以访问当前页面的站点数据、主题数据、页面数据和 Frontmatter，在 `.md` 与 `.vue` 文件中都可以使用：

```md
<script setup>
import { useData } from 'vitepress'
const { site, theme, page, frontmatter } = useData()
</script>
```

## Results

### Site Data

站点配置（标题、描述等）：

<pre>{{ fmt(site) }}</pre>

### Theme Data

主题配置（导航栏、侧边栏、社交链接等）：

<pre>{{ fmt(theme) }}</pre>

### Page Data

当前页面数据（相对路径、标题、更新时间等）：

<pre>{{ fmt(page) }}</pre>

### Frontmatter Data

当前文件顶部通过 `---` 声明的 Frontmatter（本页设置了 `aside: false` 来隐藏右侧目录栏）：

<pre>{{ fmt(frontmatter) }}</pre>

### Route Data

`useRoute()` 返回当前路由信息，试着在地址栏 URL 后面加上 `?name=vitepress` 再回车，观察 query 的变化：

<div class="api-demo">
  <p>当前路由 Route path：<code>{{ routePath }}</code></p>
  <p>查询参数 Route query：</p>
  <pre>{{ fmt(route.query) }}</pre>
</div>

<style scoped>
.api-demo {
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
}
</style>
