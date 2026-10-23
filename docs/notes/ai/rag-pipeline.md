# RAG 开发核心：流水线五件套与 LCEL 组链

> 目标：能独立搭出文档问答系统。配套课程：黑马 RAG与Agent智能体项目实战。
> 只收核心：五件套参数、组链规则、完整链路代码。

**创建日期**：2026-10-21 · **最近更新**：2026-10-23 · **标签**：`AI` `LangChain` `RAG`

> **更新记录（2026-10-23）**：根据口头抽查表现补充——
> ① 向量的直觉类比（不用公式版）；② chunk 参数的“调不好会怎样”正反例；
> ③ 三 API 的完整参数表与读写区分；④ AIMessage 对象结构拆解；
> ⑤ 完整链的 4 个记忆锚点 + 填空骨架。配套速记卡见 [RAG 速记卡](./rag-cheatsheet)。

---

## 一、RAG 三阶段（先记骨架）

**RAG = 检索技术 + LLM 提示**。解决的问题：知识不实时、领域知识缺乏、模型幻觉、数据安全。

```
【离线·索引】文档 → 加载 → 分割 → 向量化 → 存入向量库（向量和原文一起存）
【在线·检索】用户问题 → 向量化（问题不切分！）→ 相似度匹配 Top-K → 取出命中的原文片段
【在线·生成】检索结果（原文片段）+ 问题 → 拼进 Prompt → LLM 生成 → 解析成字符串
```

**两个易错点（抽查高频失分）**：

1. **问题不切分**——切分只针对长文档；用户问题通常就一句话，整体转向量即可
2. **检索的产物是原文片段（`Document`）**，不是向量。相似度匹配只是手段，原文才是要交给生成阶段的东西

---

## 二、向量：两个必懂概念

| 概念 | 一句话 |
|---|---|
| 向量（Embedding） | 文本的“数学身份证”：语义 → 固定长度数字列表。1536 维是精度与性能的平衡点 |
| 余弦相似度 | 点积 ÷ 模长乘积，匹配**方向夹角**（-1 相反 ~ 1 同向），撇除长度影响 |
| 两个 API | `embed_query`（问句向量化）/ `embed_documents`（文档批量向量化） |

### 不用公式的理解（面试口述就讲这个）

**向量 = 给每段文字打的一串“标签分”**。想象用“甜度、辣度、软硬”给食物打分：

```
蛋糕 → (5, 0, 8)
面包 → (4, 0, 9)    ← 分数接近，所以“像”
辣椒 → (1, 9, 2)    ← 分数差得远，所以“不像”
```

Embedding 模型干的就是这事，只是把 3 个维度扩展到几百上千个（语义、场景、词性、情感……）。它训练时就学会了：**意思相近的文字，转出来的数字也相近**。

```
"猫"   → [0.82, 0.15, -0.44, 0.61, ...]
"小猫" → [0.79, 0.18, -0.40, 0.58, ...]   ← 非常接近
"汽车" → [-0.35, 0.72, 0.61, -0.28, ...]  ← 差得很远
```

**余弦相似度 = 看两支箭的夹角**。把两个向量看成从同一原点射出的箭：

```
夹角 0° 附近 → 方向几乎一致 → 语义相似 ✅
夹角 90°     → 毫不相关     → 😐
夹角 180°    → 意思相反     → ❌
```

**为什么比夹角、不比“数值距离”**：文本长短会把数值整体拉长——“猫”和“猫猫猫猫猫”意思一样，但数值可能被放大。夹角只看**方向**不管**长度**，而方向才代表语义。

---

## 三、流水线五件套（核心速查表）

> **口诀：加载 → 切分 → 向量化 → 入库 → 检索，五个动词，一步一类。**

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

**两个参数调不好会怎样**：

| 参数 | 设太大 | 设太小 |
|---|---|---|
| `chunk_size` | 一块塞多个主题，向量被“平均化”，检索不精准（问 A 却命中讲 A+B+C 的块） | 语义被切碎，模型拿不到完整上下文，答非所问 |

`chunk_overlap` **防的是关键句被拦腰切断**。不设它的后果：

```
块1: ...猫喜欢吃        ← 话没说完
块2: 鱼，并且...        ← 没头没脑
```

命中哪块都是残句。设 `overlap=50`，切口附近的内容在两块里都完整出现，怎么切都不丢。

**调参建议**：黑马课程用 `chunk_size=500, chunk_overlap=50`；技术文档 500~1000，FAQ 短文本 200~300；overlap 一般取 size 的 10%~20%。

### 3. Embeddings 向量化

```python
DashScopeEmbeddings()          # 阿里云 text-embedding-v1（在线）
OllamaEmbeddings(model=...)    # 本地 Ollama（离线）
```

- 关键参数就一个：`model` 用哪个嵌入模型（在线省事、离线免费但吃本地资源）

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

| API | 读/写 | 参数 | 典型场景 |
|---|---|---|---|
| `add_documents(documents, ids=None)` | **写**（改库） | `documents` 要加的文档；`ids` 指定文档 id（可覆盖更新） | 初次灌入、知识库增量更新 |
| `delete(ids=None, where=None)` | **写**（改库） | `ids` 删指定 id；`where={"source": "a.md"}` 按 metadata 条件**批量删** | 文档下架、删某个文件的全部切片 |
| `similarity_search(query, k=4)` | **只读**（不改库） | `k` 返回前几条最相似的 | RAG 检索阶段（`as_retriever()` 底层就是它） |

**一句话区分**：查询是“查”（只读），增删是“改”（写）。`similarity_search` 返回 `Document` 对象（含原文），不是向量。

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

**根因看结构**：`model.invoke()` 返回的是 `AIMessage` **对象**，里面不止正文：

```python
AIMessage {
    content = "列表和字典的区别是...",   # ← 正文，唯一要的
    usage = {...},                      # ← token 消耗
    response_metadata = {...},          # ← 模型元数据
    id / tool_calls / ...               # ← 一堆杂项
}
```

直接把对象填进 prompt 的坑 = 把 usage、metadata 这些垃圾也塞进提示词。`StrOutputParser` 只干一件事：**取出 `.content`，只留正文，其他全扔**。

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

> 严谨写法：`retriever` 返回的是 `Document` 列表，直接填坑会带元数据，应先过一步拼接：
> `{"context": retriever | format_docs, "question": RunnablePassthrough()}`，
> 其中 `format_docs` 把 `docs` 拼成 `"\n".join(d.page_content for d in docs)`。

### 记忆锚点（4 句）

1. **四个组件顺序固定**：检索器 → 模板 → 模型 → 解析器（`retriever` / `prompt` / `model` / `StrOutputParser`）
2. **模板两个坑先后固定**：`{context}` 在前（资料）、`{question}` 在后（问题）——先资料后问题
3. **字典是死结构，照抄**：`{"context": retriever, "question": RunnablePassthrough()}`——`context` 永远配 `retriever`，`question` 永远配 `RunnablePassthrough()`，没有第三种组合
4. **连接符全是 `|`，入口传字符串**

### 填空骨架（遮住上面的答案自测）

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

**练习方法**：遮答案填第一遍 → 两小时后再一遍 → 第二天再一遍。三遍基本固化。

---

## 六、自检清单（过关标准）

- [ ] 能默画 RAG 三阶段流程图（含两个易错点：问题不切分、检索返回原文）
- [ ] 能解释向量、余弦相似度（不用公式，用“贴标签打分 + 两支箭夹角”讲清直觉）
- [ ] 能背出五件套每步用什么类、关键参数
- [ ] 记住向量库三 API：add_documents / delete / similarity_search（含读写区分）
- [ ] 知道 chunk_size 和 chunk_overlap 的作用（含“不设 overlap 会怎样”的例子）
- [ ] 能解释“模型输出为什么不能直接进下一个 prompt”（说到 AIMessage 对象结构）
- [ ] 能独立写出第五节的完整 RAG 链（遮答案，用填空骨架自测 3 遍）
