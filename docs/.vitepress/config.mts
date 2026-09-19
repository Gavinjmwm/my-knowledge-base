import { defineConfig } from 'vitepress'
// Markdown 扩展语法插件（对应速查表里的脚注 / 高亮 / 上下标 / 定义列表）
import footnote from 'markdown-it-footnote'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import deflist from 'markdown-it-deflist'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: '我的知识库',
  description: '前端笔记 - 基于 VitePress 的个人本地知识库',
  lastUpdated: true,
  // GitHub Pages 不支持无 .html 后缀的 URL，关闭以保证线上页面刷新不 404
  cleanUrls: false,

  markdown: {
    config(md) {
      md.use(footnote) // 脚注 [^1]
      md.use(mark)     // ==高亮==
      md.use(sub)      // H~2~O 下标
      md.use(sup)      // X^2^Y 上标
      md.use(deflist)  // 定义列表
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '前端',
        items: [
          { text: 'JavaScript 基础', link: '/notes/frontend/javascript-basics' },
          { text: 'HTML 基础', link: '/notes/frontend/html-basics' }
        ]
      },
      {
        text: '后端',
        items: [
          { text: '后端笔记（建设中）', link: '/notes/backend/' }
        ]
      },
      {
        text: 'AI 知识',
        items: [
          { text: 'AI 笔记（建设中）', link: '/notes/ai/' }
        ]
      }
    ],

    // 笔记侧边栏：按分类分组，docs/notes/ 下的笔记列在这里
    sidebar: {
      '/notes': [
        {
          text: '前端',
          collapsed: false,
          items: [
            { text: 'JavaScript 基础', link: '/notes/frontend/javascript-basics' },
            { text: 'HTML 基础', link: '/notes/frontend/html-basics' }
          ]
        },
        {
          text: '后端',
          collapsed: true,
          items: [
            { text: '后端笔记（建设中）', link: '/notes/backend/' }
          ]
        },
        {
          text: 'AI 知识',
          collapsed: true,
          items: [
            { text: 'AI 笔记（建设中）', link: '/notes/ai/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: '基于 VitePress 构建 · 纯本地运行',
      copyright: 'Copyright © 2026 Gavin'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索知识库' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关内容',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: { label: '本页目录' },
    lastUpdatedText: '最后更新',
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部'
  }
})
