# Markdown 语法练习

> 本页对照 **Markdown Cheat Sheet（速查表）** 整理，每个语法都给出「写法」与「实际渲染效果」，可以直接当作写作手册查阅。
>
> 其中 ==高亮文本==、下标 H~2~O、上标 X^2^Y、脚注、定义列表属于扩展语法，本站已通过 markdown-it 插件启用。

## 标题 Headings

写法：

````md
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
````

效果：

# 一级标题 Heading 1
## 二级标题 Heading 2
### 三级标题 Heading 3
#### 四级标题 Heading 4
##### 五级标题 Heading 5
###### 六级标题 Heading 6

## 文本格式 Text Styles

写法：

````md
*斜体文本*
**粗体文本**
***粗斜体文本***
~~删除线文本~~
\*转义后的星号会原样显示\*
H~2~O 是下标
X^2^Y 是上标
[链接文本](https://developer.mozilla.org/)
==重点高亮文本==
````

效果：

- *斜体文本 Italic Text*
- **粗体文本 Bold Text**
- ***粗斜体文本 Bold Italic Text***
- ~~删除线文本 Strikethrough~~
- \*转义后的星号会原样显示\*
- H~2~O（下标 Subscript）
- X^2^Y（上标 Superscript）
- [链接文本 Link Text](https://developer.mozilla.org/)
- ==重点高亮文本 Important==

引用块 Blockquote 写法：

````md
> Text
> Blockquote Text
````

效果：

> Text
> Blockquote Text

## 脚注 Footnote

写法：

````md
简单脚注[^1]
可以写多行内容的脚注[^bignote]

[^1]: 1 号脚注的内容
[^bignote]: 这是一条可以写多行内容的脚注，适合放参考资料或补充说明。
````

效果：

- 简单脚注[^1]
- 可以写多行内容的脚注[^bignote]

[^1]: 1 号脚注的内容：First note for footnote number 1
[^bignote]: 这是一条可以写多行内容的脚注：This is the note for footnote that can be multiple line.

## 代码 Code

行内代码写法：用反引号把代码包起来，例如 `` `Test Code` ``，效果：`Test Code`。

代码块写法：

````md
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```
````

效果（VitePress 会自动做语法高亮）：

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

## 列表 List

### 有序列表 Order List

写法：

````md
1. First item
2. Second item
3. Third item
````

效果：

1. First item
2. Second item
3. Third item

### 无序列表 Unorder List

写法：

````md
- First item
- Second item
- Third item
````

效果：

- First item
- Second item
- Third item

### 任务列表 Task List

写法：

````md
- [x] Write a code
- [ ] Test
- [ ] Fix Bugs
````

效果：

- [x] Write a code
- [ ] Test
- [ ] Fix Bugs

### 定义列表 Definition List

写法（扩展语法，冒号后至少保留一个空格）：

````md
Markdown
: 一种轻量级标记语言

VitePress
: 基于 Vite 和 Vue 的静态站点生成器
````

效果：

Markdown
: 一种轻量级标记语言

VitePress
: 基于 Vite 和 Vue 的静态站点生成器

## 图片 Image

写法：

````md
![Custom alt text](/logo.svg)
````

效果：

![Markdown Logo](/logo.svg)

## 表格 Table

基础表格写法：

````md
| Course | Description |
| --- | --- |
| Python | Title |
| PHP | Text |
````

效果：

| Course | Description |
| --- | --- |
| Python | Title |
| PHP | Text |

对齐方式写法（`:---` 左对齐、`:---:` 居中、`---:` 右对齐）：

````md
| Course | Description | Price |
| :---: | :--- | ---: |
| Python | Title | x,xxx |
| PHP | Text | x,xxx |
````

效果：

| Course | Description | Price |
| :---: | :--- | ---: |
| Python | Title | x,xxx |
| PHP | Text | x,xxx |

## 分割线 Horizontal Rule

写法：

````md
---
````

效果：

---

> 练习建议：点击右上角的「在 GitHub 上编辑此页」风格的工作流，或直接在本地 `docs/` 目录新建 `.md` 文件，用上面的语法写一篇自己的笔记，保存后浏览器会自动热更新。
