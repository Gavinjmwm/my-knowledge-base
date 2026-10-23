# RAG 速记卡：一页背完（填空自测版）

> 目标：考前/面试前 5 分钟过一遍；遮住答案能复述才算会。
> 详解与代码见 [RAG 开发核心](./rag-pipeline)。

**创建日期**：2026-10-23 · **标签**：`AI` `LangChain` `RAG` `速记`

---

## 一句话定义

RAG = 先检索相关资料，再让 LLM 基于资料回答 = **开卷考试**。

## 三阶段（口述版）

```
离线·索引：文档 → 加载 → 分割 → 向量化 → 入向量库（向量 + 原文一起存）
在线·检索：问题 → 向量化（问题不切分！）→ 相似度 Top-K → 取出原文片段
在线·生成：原文 + 问题 → 拼 Prompt → LLM → 解析成字符串
```

**两个易错点**：① 问题不切分；② 检索返回的是**原文**不是向量。

## 五件套（口诀：加载→切分→向量化→入库→检索）

| 步骤 | 类 | 关键参数 |
|---|---|---|
| 加载 | `TextLoader` / `PyPDFLoader` | `encoding`（防中文乱码） |
| 切分 | `RecursiveCharacterTextSplitter` | `chunk_size=500`、`chunk_overlap=50` |
| 向量化 | `DashScopeEmbeddings` / `OpenAIEmbeddings` | `model` |
| 入库 | `Chroma.from_documents` / `InMemoryVectorStore` | `persist_directory`（不写=重启丢数据） |
| 检索 | `vector_store.as_retriever()` | `search_kwargs={"k": 3}` |

## 向量库三 API（查不改、增删改）

| API | 读/写 | 一句话 |
|---|---|---|
| `add_documents(documents, ids)` | 写 | 追加文档 |
| `delete(ids, where)` | 写 | 按 id 或 metadata 条件删 |
| `similarity_search(query, k)` | 读 | 按问题取前 k 条（`as_retriever` 底层） |

## 两个概念口述版（禁公式）

- **向量**：把文本变成一串数字；语义相近 → 数字也相近（“贴标签打分”的扩展）
- **余弦相似度**：两支箭的**夹角**；夹角小 = 意思近，只看方向不看长度（长短不影响语义）

## chunk 两参数一句话

- `chunk_size`：每块多大。太大 → 检索不精准；太小 → 语义不完整
- `chunk_overlap`：块间重叠，**防关键句被拦腰切断**（“猫喜欢吃 / 鱼，并且…”）

## 完整链默写（填空）

```python
retriever = vector_store.____________()

prompt = ChatPromptTemplate.____________(
    "____________{context}____________{question}____________"
)

chain = (
    {"context": ____________, "question": ____________()}
    | ____________
    | ____________
    | ____________()
)

chain.____________("你的问题")
```

## 记忆锚点 4 句

1. 组件顺序：**检索器 → 模板 → 模型 → 解析器**
2. 模板两个坑：**`{context}` 在前、`{question}` 在后**
3. 字典死结构：**`{"context": retriever, "question": RunnablePassthrough()}`**，没有第三种组合
4. 连接符全是 `|`，入口传**字符串**

## 练习方法

遮答案填空 → 2 小时后第二遍 → 第二天第三遍。**三遍固化**。
