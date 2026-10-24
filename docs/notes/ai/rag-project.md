# RAG 实战项目：电商知识库问答系统

> 目标：看懂黑马 RAG 项目的整体架构与每个文件的职责；明白"玩具 demo"和"能用的产品"差在哪。
> 配套课程：黑马 RAG与Agent智能体项目实战 · 03RAG项目.pptx。

**创建日期**：2026-10-24 · **标签**：`AI` `LangChain` `RAG` `项目`

---

## 一、这是个什么项目

以"某东商品衣服"为例，把衣服属性构成本地知识库：

- **使用者可以自由更新本地知识**（上传文件 → 自动入库）
- **答案基于本地知识生成**（不是模型瞎编）

本质：一个"上传文档 → 自动问答"的 Web 小产品（Streamlit 搭建）。

## 二、需求与思路（两张流程图）

### 离线流程（管理员/运营侧）

```
本地知识文件 → 加载和读取 → 文本切分 → 向量数据库
```

### 在线流程（用户侧）

```
Query向量化 → 向量匹配 → Prompt工程 → 提交LLM生成答案
```

和 [RAG 开发核心](./rag-pipeline) 的三阶段完全一致——**项目干的事就是把那套流程工程化**。

## 三、代码结构（7 个文件，各司其职）

| 文件 | 角色 | 一句话职责 |
|---|---|---|
| `app_file_upload.py` | 知识库更新主程序（Streamlit） | 上传文件的 Web 页面 |
| `app_qa.py` | 项目主程序（Streamlit） | 启动对话 Web 页面 |
| `config_data.py` | 配置文件 | 集中管路径、模型名、参数 |
| `file_history_store.py` | 长期会话记忆存储服务 | 对话历史存文件（见第五节） |
| `knowledge_base.py` | 知识库更新服务 | 加载 → 切分 → 入库 |
| `vector_stores.py` | 向量存储服务 | 向量库单例（Chroma） |
| `rag.py` | RAG 核心服务 | 检索 + 拼 prompt + 调模型 |

**离线三件套**：`app_file_upload.py` + `config_data.py` + `knowledge_base.py`
**在线四件套**：`app_qa.py` + `config_data.py` + `rag.py` + `file_history_store.py`

## 四、拆分设计的思想（面试会问）

1. **配置集中**（`config_data.py`）：路径、模型名、参数一处改全局
2. **服务分层**：`vector_stores`（存）/ `knowledge_base`（写）/ `rag`（读）各自独立——换向量库只动一个文件
3. **前后台分离雏形**：两个 Streamlit 页面 = 管理后台 + 用户前台
4. **单例思想**：向量库全局一个实例，避免每次对话重新加载

## 五、会话记忆（file_history_store.py）

RAG 项目支持多轮对话，靠的是 LangChain 的会话记忆机制。

### 临时记忆：RunnableWithMessageHistory + InMemoryChatMessageHistory

```python
conversation_chain = RunnableWithMessageHistory(
    base_chain,              # 被附加记忆的链
    get_history,             # 按 session_id 返回历史存储的函数
    input_messages_key="input",
    history_messages_key="chat_history",
)

# 调用时必须带会话 ID
session_config = {"configurable": {"session_id": "user_001"}}
conversation_chain.invoke({"input": "..."}, config=session_config)
```

- `InMemoryChatMessageHistory`：存内存，**程序一退记忆就没**
- `get_history(session_id)`：不同用户/会话各一份历史，互不串台

### 长期记忆：自实现 FileChatMessageHistory

继承 `BaseChatMessageHistory`，实现 3 个方法：

| 方法 | 作用 |
|---|---|
| `add_messages(messages)` | 同步追加消息（写文件） |
| `messages`（property） | 读取全部历史（读文件） |
| `clear()` | 清空历史 |

**核心思路**：以 `session_id` 为文件名存 JSON；不同 session 不同文件；**重启程序后历史还在**。

> 这就是 `file_history_store.py` 的全部——一个几十行的类，让"关掉网页再打开，AI 还记得你"。

## 六、学了能干嘛（实战价值）

这个项目是企业 AI 应用的**最小可用架构**，外面那些"公司内部知识库问答"就是这个的放大版：

| 你学到的模块 | 真实工作中的对应物 |
|---|---|
| 上传文件自动入库 | 企业文档管理系统接 AI |
| RAG 检索问答 | 内部制度/产品文档问答机器人 |
| 会话记忆 | 客服多轮对话 |
| Streamlit 页面 | 产品 Demo / 内部工具界面 |

**简历写法参考**："基于 LangChain + 向量数据库实现文档知识库问答系统，支持文档上传自动切分入库、多轮对话记忆、检索增强生成"。

> 下一步建议：把项目跑起来，换成自己的文档（比如把你的笔记灌进去当知识库）——比看十遍视频有用。
