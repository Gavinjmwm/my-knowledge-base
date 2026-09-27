# Redis 基础

> Redis（Remote Dictionary Server）是一个基于**内存**的键值数据库，读写不经过磁盘，速度快到经常被用作「缓存」。

**创建日期**：2026-09-19 · **标签**：`后端` `Redis` `缓存`

## 学习目标

- [x] 知道 Redis 是什么、能干什么
- [x] 掌握五大数据类型和常用命令
- [ ] 理解缓存穿透 / 击穿 / 雪崩（进阶，下一篇写）

## 一、Redis 是什么

一句话：**把数据放在内存里的、超快的键值对数据库**。

| 对比项 | MySQL | Redis |
| --- | :---: | :---: |
| 存储位置 | 磁盘 | ==内存== |
| 读取速度 | 毫秒级 | ==微秒级，快 10~100 倍== |
| 数据结构 | 表（二维表格） | 键值对（多种结构） |
| 定位 | 持久存储，数据不能丢 | 高速读写，常配合 MySQL |

> [!TIP]
> 它俩不是竞争关系：MySQL 负责「永久保存」，Redis 负责「快速读写」，这是后端开发的经典组合。

## 二、五大数据类型速览

| 类型 | 特点 | 典型场景 |
| --- | --- | --- |
| `String` | 最基础的「键 = 值」 | 缓存、计数器、验证码 |
| `Hash` | 一个键下挂多个字段 | 存对象（用户信息等） |
| `List` | 有序、可两头插入 | 消息队列、最新动态 |
| `Set` | 无序、自动去重 | 抽奖、共同好友 |
| `SortedSet` | 带 score 分数排序 | ==排行榜==、延迟队列 |

## 三、五大数据类型详解

装好 Redis 后，用 `redis-cli` 练习。命令**不区分大小写**（`set` 和 `SET` 效果一样），下面统一用大写。

### 3.1 String（字符串）

**概念**：最基础的类型，一个 key 对应一个 value。可以存字符串、整数、浮点数，也可以把对象序列化成 JSON 字符串后整体存进去。

**常见命令**

| 命令 | 作用 |
| --- | --- |
| `SET key value` | 添加或修改已经存在的一个 String 类型的键值对 |
| `GET key` | 根据 key 获取 String 类型的 value |
| `MSET key1 value1 key2 value2 ...` | 批量添加多个 String 类型的键值对 |
| `MGET key1 key2 ...` | 根据多个 key 获取多个 String 类型的 value |
| `INCR key` | 让一个整型的 key 自增 1 |
| `INCRBY key n` | 让一个整型的 key 自增并指定步长，例如 `INCRBY num 2` 让 num 值自增 2 |
| `INCRBYFLOAT key n` | 让一个浮点类型的数字自增并指定步长 |
| `SETNX key value` | 添加一个 String 类型的键值对，**前提是这个 key 不存在**，否则不执行 |
| `SETEX key seconds value` | 添加一个 String 类型的键值对，并且指定有效期 |
| `DEL key` | 删除 key（通用命令，任何类型都能用） |

```bash
SET name "gavin"          # 存
GET name                  # 取 -> "gavin"
INCR views                # 自增 1，计数器神器

# 过期时间（缓存的核心机制）
SET code "666888" EX 300  # 300 秒后自动消失
TTL code                  # 查看剩余秒数
```

> [!TIP]
> `SET key value EX 300` 和 `SETEX key 300 value` 效果相同，前者更常用。`SETNX` 是**分布式锁**的基础。

### 3.2 Hash（哈希 / 散列）

**概念**：Hash 类型也叫散列，其 value 是一个无序字典，类似于 Java 中的 **HashMap** 结构。

**为什么要有 Hash？** 对比下面两种存对象的方式：

String 结构是把对象**序列化成 JSON 字符串后整体存储**，当需要修改对象的某个字段时很不方便（要整体取出来、改完再整体写回）：

| KEY | VALUE |
| --- | --- |
| `heima:user:1` | `{name:"Jack", age:21}` |
| `heima:user:2` | `{name:"Rose", age:18}` |

Hash 结构把对象中的**每个字段独立存储**，可以针对单个字段做 CRUD：

| KEY | field | value |
| --- | --- | --- |
| `heima:user:1` | name | Jack |
| `heima:user:1` | age | 21 |
| `heima:user:2` | name | Rose |
| `heima:user:2` | age | 18 |

**常见命令**

| 命令 | 作用 |
| --- | --- |
| `HSET key field value` | 添加或者修改 hash 类型 key 的 field 的值 |
| `HGET key field` | 获取一个 hash 类型 key 的 field 的值 |
| `HMSET` | 批量添加多个 hash 类型 key 的 field 的值 |
| `HMGET` | 批量获取多个 hash 类型 key 的 field 的值 |
| `HGETALL` | 获取一个 hash 类型的 key 中的所有的 field 和 value |
| `HKEYS` | 获取一个 hash 类型的 key 中的所有的 field |
| `HVALS` | 获取一个 hash 类型的 key 中的所有的 value |
| `HINCRBY` | 让一个 hash 类型 key 的字段值自增并指定步长 |
| `HSETNX` | 添加一个 hash 类型的 key 的 field 值，**前提是这个 field 不存在**，否则不执行 |

```bash
HSET heima:user:1 name "Jack"   # 存一个字段
HSET heima:user:1 age 21        # 再存一个字段
HGET heima:user:1 name          # -> "Jack"
HGETALL heima:user:1            # 取全部 field 和 value
HINCRBY heima:user:1 age 1      # age 变成 22
```

### 3.3 List（列表）

**概念**：Redis 中的 List 类型与 Java 中的 **LinkedList** 类似，可以看做一个**双向链表**结构。既可以支持正向检索，也可以支持反向检索。

**特征**（与 LinkedList 类似）：

- 有序
- 元素可以重复
- 插入和删除快
- 查询速度一般

**常见命令**

| 命令 | 作用 |
| --- | --- |
| `LPUSH key element ...` | 向列表**左侧**插入一个或多个元素 |
| `LPOP key` | 移除并返回列表左侧的第一个元素，没有则返回 `nil` |
| `RPUSH key element ...` | 向列表**右侧**插入一个或多个元素 |
| `RPOP key` | 移除并返回列表右侧的第一个元素 |
| `LRANGE key star end` | 返回一段角标范围内的所有元素 |
| `BLPOP key timeout` / `BRPOP key timeout` | 与 LPOP / RPOP 类似，只不过在没有元素时**等待指定时间**，而不是直接返回 nil |

```bash
LPUSH queue "a"           # 从左边塞
RPUSH queue "b"           # 从右边塞
LRANGE queue 0 -1         # 查看全部（0 -1 表示从头到尾）
LPOP queue                # 从左边取出并删除
```

> [!TIP]
> `LPUSH` + `RPOP` 就是最简单的**消息队列**；`BLPOP` 用在「没数据就阻塞等待」的场景。

### 3.4 Set（集合）

**概念**：Redis 的 Set 结构与 Java 中的 **HashSet** 类似，可以看做是一个 **value 为 null 的 HashMap**。因为也是一个 hash 表，因此具备与 HashSet 类似的特征。

**特征**：

- 无序
- 元素不可重复
- 查找快
- 支持交集、并集、差集等功能

**常见命令**

| 命令 | 作用 |
| --- | --- |
| `SADD key member ...` | 向 set 中添加一个或多个元素 |
| `SREM key member ...` | 移除 set 中的指定元素 |
| `SCARD key` | 返回 set 中元素的个数 |
| `SISMEMBER key member` | 判断一个元素是否存在于 set 中 |
| `SMEMBERS key` | 获取 set 中的所有元素 |
| `SINTER key1 key2 ...` | 求 key1 与 key2 的**交集** |
| `SDIFF key1 key2 ...` | 求 key1 与 key2 的**差集** |
| `SUNION key1 key2 ...` | 求 key1 与 key2 的**并集** |

```bash
SADD s1 A B C             # S1 = {A, B, C}
SADD s2 B C D             # S2 = {B, C, D}

SINTER s1 s2              # 交集 -> B、C
SDIFF s1 s2               # 差集 -> A（S1 有而 S2 没有的）
SUNION s1 s2              # 并集 -> A、B、C、D
SMEMBERS s1               # 获取所有元素
SCARD s1                  # 元素个数
SISMEMBER s1 A            # 判断 A 是否存在 -> 1
```

> [!NOTE]
> 交集 `SINTER` 的典型场景：**共同好友 / 共同关注**。差集 `SDIFF`：找出「我有而对方没有」的元素。

### 3.5 SortedSet（有序集合，简称 ZSet）

**概念**：Redis 的 SortedSet 是一个**可排序的 set 集合**，与 Java 中的 **TreeSet** 有些类似，但底层数据结构却差别很大。SortedSet 中的每一个元素都带有一个 **score 属性**，可以基于 score 属性对元素排序，底层的实现是一个**跳表（SkipList）加 hash 表**。

**特征**：

- 可排序
- 元素不重复
- 查询速度快

**常见命令**

| 命令 | 作用 |
| --- | --- |
| `ZADD key score member` | 添加一个或多个元素到 sorted set，如果已经存在则**更新其 score 值** |
| `ZREM key member` | 删除 sorted set 中的一个指定元素 |
| `ZSCORE key member` | 获取 sorted set 中的指定元素的 score 值 |
| `ZRANK key member` | 获取 sorted set 中的指定元素的排名 |
| `ZCARD key` | 获取 sorted set 中的元素个数 |
| `ZCOUNT key min max` | 统计 score 值在给定范围内的所有元素的个数 |
| `ZINCRBY key increment member` | 让 sorted set 中的指定元素自增，步长为指定的 increment 值 |
| `ZRANGE key min max` | 按照 score 排序后，获取指定排名范围内的元素 |
| `ZRANGEBYSCORE key min max` | 按照 score 排序后，获取指定 score 范围内的元素 |
| `ZDIFF` / `ZINTER` / `ZUNION` | 求差集、交集、并集 |

> [!IMPORTANT]
> **所有的排名默认都是升序，如果要降序则在命令的 Z 后面添加 REV 即可。**
> 例如 `ZRANGE` → `ZREVRANGE`，`ZRANK` → `ZREVRANK`。

```bash
ZADD rank 95 "张三" 87 "李四"      # 存分数
ZRANGE rank 0 -1 WITHSCORES        # 升序：李四 87、张三 95
ZREVRANGE rank 0 -1 WITHSCORES     # 降序（排行榜最常用）
ZINCRBY rank 5 "张三"              # 张三的分数 +5
ZSCORE rank "张三"                 # 查看张三的分数
ZRANK rank "李四"                  # 查看李四的排名（升序）
```

> [!TIP]
> 因为 SortedSet 的可排序特性，**经常被用来实现排行榜**这样的功能。

### 3.6 通用命令（任何类型都能用）

| 命令 | 作用 |
| --- | --- |
| `KEYS pattern` | 按模式查 key（`KEYS *` 慎用，见踩坑记录） |
| `EXISTS key` | 判断 key 是否存在 |
| `DEL key` | 删除 key |
| `TYPE key` | 查看 key 的类型 |
| `EXPIRE key seconds` | 给已存在的 key 设置有效期 |
| `TTL key` | 查看剩余有效期（`-1` 永不过期，`-2` 已不存在） |
| `SCAN cursor` | 渐进式遍历 key（`KEYS *` 的安全替代） |
| `FLUSHALL` | 清空**所有**数据（练手用，生产千万别敲） |

> [!WARNING]
> 用 `EX` 设置的过期时间一到，数据**真的会没了**。所以重要数据（用户信息本体）放 MySQL，Redis 里只放「丢了也无所谓、能重新算出来」的数据。

## 四、为什么要学它（后端面试高频）

1. **缓存**：把 MySQL 里的热点数据放 Redis，扛住高并发查询
2. **登录态共享**：Session / Token 存 Redis，多台服务器都能读
3. **排行榜 / 计数**：SortedSet 和 INCR 天生擅长
4. **分布式锁**：多个服务抢同一资源时，用 SETNX 实现

## 五、踩坑记录

**命令层面**

- **`SET` 会覆盖旧值，并清掉原有的过期时间**：给一个带 TTL 的 key 重新 `SET`（不带 `EX`），它就从「300 秒后消失」变成「永不过期」，缓存场景特别容易踩
- **`INCR` / `INCRBY` 只能作用于整型的值**：key 不存在时会当成 `0` 开始自增，但如果值是普通字符串会直接报错 `ERR value is not an integer or out of range`
- **`SETNX` 靠返回值判断成败**：返回 `1` 表示设置成功（key 原先不存在），返回 `0` 表示 key 已存在、什么都没做——分布式锁就是靠这个判断的
- **`HSET` 一次可以设多个字段**：Redis 4.0 之后 `HSET` 已支持多字段写法，老的 `HMSET` 被标记为废弃
- **删除要选对命令**：`DEL` 是通用的（删整个 key）；但删 Hash 的某个字段要用 `HDEL`，删 Set 成员要用 `SREM`，删 List 元素要用 `LREM`，别搞混
- **`ZRANGE` 和 `ZREVRANGE` 只差一个 REV**：默认升序，想要降序就在 Z 后面加 REV

**使用层面**

- Redis 是**单线程**处理命令，生产环境避免执行 `KEYS *`（全量遍历会卡死），要用 `SCAN`
- 键名要有规范，推荐 `业务:对象:ID`，例如 `user:info:1001`
- 内存满了会触发淘汰策略，默认 `noeviction`（写入直接报错），生产上一般配 `allkeys-lru`
- 单条命令是**原子**的，但多条命令组合（比如「先 GET 再 SET」）不是，并发下要小心
- 避免**大 key**：一个 Hash / List 塞几十万条数据，删除和过期时会阻塞整个 Redis

## 六、疑问

- [ ] 缓存和数据库数据不一致怎么办？（缓存穿透 / 击穿 / 雪崩，值得单独写一篇）
- [ ] Redis 宕机数据不就丢了？→ 去看 RDB 和 AOF 两种持久化机制

[^redis]: Redis 教程（中文）：https://www.redis.net.cn/tutorial/
