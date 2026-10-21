# RAG 开发核心：流水线五件套与 LCEL 组链

> 目标：能独立搭出文档问答系统。配套课程：黑马 RAG与Agent智能体项目实战。
> 只收核心：五件套参数、组链规则、完整链路代码。

**创建日期**：2026-10-21 · **标签**：`AI` `LangChain` `RAG`

---

## 一、RAG 三阶段（先记骨架）

**RAG = 检索技术 + LLM 提示**。解决的问题：知识不实时、领域知识缺乏、模型幻觉、数据安全。

```
【离线·索引】文档 → 加载 → 分割 → 向量化 → 存入向量库
【在线·检索】用户问题 → 向量化 → 相似度匹配 Top-K
【在线·生成】检索结果 + 问题 → 拼进 Prompt → LLM 生成答案
```

## 二、向量：两个必懂概念

| 概念 | 一句话 |
|---|---|
| 向量（Embedding） | 文本的“数学身份证”：语义 → 固定长度数字列表。1536 维是精度与性能的平衡点 |
| 余弦相似度 | 点积 ÷ 模长乘积，匹配**方向夹角**（-1 相反 ~ 1 同向），撇除长度影响 |
| 两个 API | `embed_query`（问句向量化）/ `embed_documents`（文档批量向量化） |

---

## 三、流水线五件套（核心速查表）

### 1. Document Loaders 文档加载

| 类 | 用途 |
|---|---|
| `TextLoader` | 纯文本，整个文件 = 1 个 Document |
| `PyPDFLoader` | PDF（`mode='page'/'single'`，需 `pip install pypdf`） |
| `JSONLoader` | JSON（需 jq_schema，`pip install jq`） |

- 统一返回 `Document` 对象：`page_content`（内容）+ `metadata`（元数据）
- `load()` 一次性全量加载；`lazy_load()` 流式逐条返回（**大文件防内存溢出**）

### 2. Text Splitter 文本分割

```python
RecursiveCharacterTextSplitter(
    chunk_size=500,        # 每块最大字符数
    chunk_overlap=50,      # 块间重叠字符数（防句子被切断）
    separators=["\n\n", "\n", "。", "！", "？", " ", ""],  # 按自然段落递归切
)
```

官方默认推荐分割器；按“段落→句子→词”逐级回退，保持上下文完整。

### 3. Embeddings 向量化

```python
DashScopeEmbeddings()          # 阿里云 text-embedding-v1（在线）
OllamaEmbeddings(model=...)    # 本地 Ollama（离线）
```

### 4. Vector Stores 向量存储

| 类 | 特点 |
|---|---|
| `InMemoryVectorStore` | 内存存储，重启丢失，适合测试 |
| `Chroma` | 轻量数据库，`persist_directory` 持久化到磁盘 |

**三个通用 API（所有向量库都一样）**：

```python
vector_store.add_documents(documents, ids)   # 存入
vector_store.delete(ids)                     # 删除
vector_store.similarity_search("query", k)   # 相似度检索 Top-K
```

### 5. Retriever 检索器

```python
retriever = vector_store.as_retriever()      # 向量库 → 可入链的检索组件
```

---

## 四、LCEL 组链规则

### 管道语法

```python
chain = prompt | model | parser       # 底层是 __or__ 魔术方法重写
```

- 所有组件都是 `Runnable` 子类；`invoke()`（一次性）/ `stream()`（流式）是统一入口
- 核心特性：**上一个组件的输出 = 下一个组件的输入**

### 解析器（类型转换器）

| 类 | 转换 |
|---|---|
| `StrOutputParser` | `AIMessage → str`（接模板/字符串场景） |
| `JsonOutputParser` | `AIMessage → dict`（多模型链、结构化输出） |

### 组件兼容性铁律（报错排查就查这里）

```
prompt 输出 PromptValue ──→ model 输入 ✓
model  输出 AIMessage  ──→ 模板输入 ✗（模板要字典/字符串）→ 必须过 parser 转换
```

**模型输出不能直接喂下一个 prompt**，中间必须有解析器/自定义函数转换——这是课程里 `ValueError: Invalid input type` 系列报错的根源。

### RunnableLambda（自定义逻辑入链）

```python
my_func = RunnableLambda(lambda ai_msg: {"name": ai_msg.content})
chain = prompt | model | my_func | prompt2 | model | parser
```

普通函数直接入链会自动转成 `RunnableLambda`。

---

## 五、完整 RAG 链（默写目标）

```python
retriever = vector_store.as_retriever()
prompt = ChatPromptTemplate.from_template(
    "根据以下资料回答问题：\n{context}\n问题：{question}"
)

# RunnablePassthrough：让问题原样穿过，同时触发检索
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke("Python 里列表和字典有什么区别？")
```

**数据流**：问题 → 一份去检索（context）、一份原样传（question）→ 拼 prompt → 模型 → 解析成字符串。

---

## 六、自检清单

- [ ] 能默画 RAG 三阶段流程图
- [ ] 能解释向量、余弦相似度（不用公式，说清直觉）
- [ ] 背出五件套每步用什么类、关键参数
- [ ] 记住向量库三 API：add_documents / delete / similarity_search
- [ ] 知道 chunk_size 和 chunk_overlap 的作用
- [ ] 能解释“模型输出为什么不能直接进下一个 prompt”
- [ ] 能独立写出第五节的完整 RAG 链
