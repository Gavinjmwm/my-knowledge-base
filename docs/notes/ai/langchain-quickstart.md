# LangChain 新手速成：骨架、认字表与调用约定

> 目标：10 分钟内看懂任何 LangChain 代码。不需要懂原理，需要"认字"。
> 配套课程：黑马 AI 大模型开发

**创建日期**：2026-10-19 · **标签**：`AI` `LangChain` `LLM`

---

## 一、万能骨架

所有 LangChain 代码都是这个骨架的变形：

```python
# 1. 建模型 —— 接哪家 AI
model = Tongyi(model="qwen-max", api_key="sk-...")

# 2. 建记忆 —— 管历史（放函数外/全局！）
memory = ConversationBufferMemory(return_messages=True)

# 3. 组装 —— 模型 + 记忆 = 链
chain = ConversationChain(llm=model, memory=memory)

# 4. 调用 —— 输入输出都是字典
result = chain.invoke({"input": "你好"})

# 5. 取值
print(result["response"])
```

**读任何 LangChain 代码就找这五步**：model 在哪 → memory 在哪 → chain 怎么拼 → invoke 传什么 → 返回取哪个键。

---

## 二、认字表

看到名词知道是哪层，不用背原理。

### 模型层：接哪家 AI

| 类名 | 接什么 |
|---|---|
| `Tongyi` | 阿里通义 |
| `ChatOpenAI` | OpenAI / DeepSeek（改 base_url）/ 任何兼容服务 |
| `ChatOllama` | 本地 Ollama |

统一用法：`model.invoke("问题")` / `model.stream("问题")`。

### 记忆层：管多少历史

| 类名 | 记什么 | 一句话场景 |
|---|---|---|
| `ConversationBufferMemory` | **全部**历史 | 默认选它 |
| `ConversationBufferWindowMemory(k=5)` | 最近 5 轮 | 聊天太长怕超上下文 |
| `ConversationSummaryMemory` | 旧对话让 LLM 总结成摘要 | 超长对话省 token |
| `ConversationEntityMemory` | 记住实体（人名、偏好） | 需要记住细节 |

> ⚠️ memory 必须建在**函数外/全局**，只创建一次。建在函数里 = 每轮对话都失忆。

### 链层：怎么组装

| 类名 | 干嘛的 |
|---|---|
| `LLMChain` | prompt + model，最基础 |
| `ConversationChain` | + memory，对话链 |
| `RetrievalQA` | 检索文档 + 生成（RAG 链） |
| `SequentialChain` | 多条链串联（A 输出喂给 B） |

### RAG 层：文档问答流水线

按顺序走一遍就懂：

```
文档文件
  → Loader（加载：PDF/TXT/网页）
  → Splitter（切块：RecursiveCharacterTextSplitter，chunk_size 控制大小）
  → Embeddings（向量化：文本变数组）
  → VectorStore（存向量库：FAISS/Chroma）
  → Retriever（检索：问题 → 相似段落 Top-K）
  → 塞进 prompt → LLM 生成答案
```

**一句话**：把文档切碎存起来，用户提问时找出最相关的几段，连同问题一起丢给 AI。

### Agent 层：让 AI 用工具

| 概念 | 是什么 |
|---|---|
| `Tool` | 一个函数 + 名字 + 描述（告诉 AI 什么时候调它） |
| `Agent` | AI 自己决定调哪个工具、传什么参数的循环 |
| ReAct | 老模式：思考→调工具→看结果→再思考 |
| Function Calling | 新模式：模型原生支持，更稳定（现在主流） |

---

## 三、调用约定（就两条，死记）

| | 格式 |
|---|---|
| 输入 | `chain.invoke({"input": 你的问题})` —— 键名 `input` 固定 |
| 输出 | `result["response"]` —— 键名 `response` 固定 |

---

## 学习方法

每学一个新类，往"万能骨架"上挂——它替换了哪一步？

- `ChatPromptTemplate` → 给调用步骤用的
- `RetrievalQA` → 替换整个 ConversationChain
- `ChatOllama` → 替换第 1 步的 model

**能挂上去，就是会了。**
