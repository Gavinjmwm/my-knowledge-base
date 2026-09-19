# JavaScript 基础

> 这是一篇**示例笔记**，你可以照着这个格式写自己的笔记。左边侧边栏会自动列出 `notes` 文件夹里的所有笔记。

**创建日期**：2026-09-18 · **标签**：`前端` `JavaScript`

## 学习目标

- [x] 搞懂变量声明 `let` / `const` / `var` 的区别
- [ ] 理解闭包
- [ ] 能手写一个 Promise

## 一、变量声明

| 关键字 | 能否重新赋值 | 作用域 | 使用建议 |
| --- | :---: | --- | --- |
| `const` | 不能 | 块级 | ==默认优先使用== |
| `let` | 能 | 块级 | 变量需要改变时用 |
| `var` | 能 | 函数 | 老语法，新代码别用 |

代码示例：

```js
const name = '小明'
let age = 19
age = 20

console.log(name, age) // 小明 20
```

## 二、函数

普通函数和箭头函数：

```js
// 普通函数
function add(a, b) {
  return a + b
}

// 箭头函数
const multiply = (a, b) => a * b

console.log(add(1, 2))       // 3
console.log(multiply(2, 3))  // 6
```

## 三、踩坑记录

> [!WARNING]
> 用 `const` 声明数组/对象时，**不能重新赋值，但可以修改里面的内容**。

```js
const list = [1, 2, 3]
list.push(4)      // 允许，list 变成 [1, 2, 3, 4]
// list = [5]     // 报错！不允许重新赋值
```

## 四、疑问

闭包到底是什么？下次看 MDN 文档[^mdn] 搞懂它。

[^mdn]: MDN 闭包教程：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures
