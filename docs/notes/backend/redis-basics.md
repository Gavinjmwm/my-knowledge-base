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

## 二、五大数据类型

| 类型 | 特点 | 典型场景 |
| --- | --- | --- |
| `String` | 最基础的「键 = 值」 | 缓存、计数器、验证码 |
| `Hash` | 一个键下挂多个字段 | 存对象（用户信息等） |
| `List` | 有序、可两头插入 | 消息队列、最新动态 |
| `Set` | 无序、自动去重 | 抽奖、共同好友 |
| `ZSet` | 带分数排序 | ==排行榜==、延迟队列 |

## 三、五大数据类型常用命令

装好 Redis 后，用 `redis-cli` 练习。命令**不区分大小写**（`set` 和 `SET` 效果一样），下面统一用大写。

### 3.1 String（字符串）

最基础的类型，一个 key 对应一个值。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `SET key value` | 添加或修改已经存在的一个 String 类型的键值对 | `SET name "gavin"` |
| `GET key` | 根据 key 获取 String 类型的 value | `GET name` → `"gavin"` |
| `MSET k1 v1 k2 v2` | 批量添加多个 String 类型的键值对 | `MSET a 1 b 2` |
| `MGET k1 k2` | 根据多个 key 获取多个 String 类型的 value | `MGET a b` → `1`、`2` |
| `INCR key` | 让一个整型的 key 自增 1 | `INCR views` |
| `INCRBY key n` | 让一个整型的 key 自增并指定步长 | `INCRBY num 2` 让 num 自增 2 |
| `INCRBYFLOAT key n` | 让一个浮点类型的数字自增并指定步长 | `INCRBYFLOAT price 0.5` |
| `SETNX key value` | 添加一个 String 键值对，**前提是 key 不存在**，否则不执行 | `SETNX lock 1` |
| `SETEX key seconds value` | 添加一个 String 键值对，并且指定有效期 | `SETEX code 300 "666888"` |
| `DEL key` | 删除 key（通用命令，五种类型都能用） | `DEL name` |

```bash
SET name "gavin"          # 存
GET name                  # 取 -> "gavin"
INCR views                # 自增 1，做计数器神器
DEL name                  # 删除

# 过期时间（缓存的核心机制）
SET code "666888" EX 300  # 300 秒后自动消失
TTL code                  # 查看剩余秒数
```

> [!TIP]
> `SET key value EX 300` 和 `SETEX key 300 value` 效果相同，前者更常用。`SETNX` 是**分布式锁**的基础。

### 3.2 Hash（哈希）

一个 key 下挂多个「字段 = 值」，专门用来存**对象**。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `HSET key field value` | 添加或修改一个字段 | `HSET user:1 name "gavin"` |
| `HGET key field` | 获取一个字段的值 | `HGET user:1 name` |
| `HMGET key f1 f2` | 批量获取多个字段 | `HMGET user:1 name age` |
| `HGETALL key` | 获取全部字段和值 | `HGETALL user:1` |
| `HKEYS` / `HVALS` | 只取所有字段名 / 所有字段值 | `HKEYS user:1` |
| `HDEL key field` | 删除某个字段 | `HDEL user:1 age` |
| `HINCRBY key field n` | 某个字段自增 | `HINCRBY user:1 age 1` |
| `HEXISTS key field` | 判断字段是否存在 | `HEXISTS user:1 name` |

```bash
HSET user:1 name "gavin" age 19   # 一次存多个字段
HGET user:1 name                  # -> "gavin"
HGETALL user:1                    # 取全部字段
```

### 3.3 List（列表）

有序、可重复，可以从**两头**插入和弹出，像一根双向管道。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `LPUSH key v1 v2` | 从**左**边插入 | `LPUSH queue "a"` |
| `RPUSH key v1 v2` | 从**右**边插入 | `RPUSH queue "b"` |
| `LPOP` / `RPOP` | 从左边 / 右边弹出并删除 | `LPOP queue` |
| `LRANGE key start stop` | 按范围查看，`0 -1` 表示全部 | `LRANGE queue 0 -1` |
| `LLEN key` | 列表长度 | `LLEN queue` |
| `LINDEX key n` | 取第 n 个元素（从 0 开始） | `LINDEX queue 0` |
| `BLPOP key timeout` | 阻塞式左弹出（没数据就等） | `BLPOP queue 10` |

```bash
LPUSH queue "a"           # 从左边塞
RPUSH queue "b"           # 从右边塞
LRANGE queue 0 -1         # 查看全部
```

> [!TIP]
> `LPUSH` + `RPOP` 就是最简单的**消息队列**；`BLPOP` 用在「没数据就阻塞等待」的场景。

### 3.4 Set（集合）

无序、**自动去重**，支持交集 / 并集 / 差集。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `SADD key m1 m2` | 添加元素（重复的自动丢弃） | `SADD lottery "张三" "李四"` |
| `SMEMBERS key` | 查看所有元素 | `SMEMBERS lottery` |
| `SREM key member` | 删除某个元素 | `SREM lottery "张三"` |
| `SCARD key` | 元素个数 | `SCARD lottery` |
| `SISMEMBER key member` | 判断元素是否存在 | `SISMEMBER lottery "张三"` |
| `SINTER k1 k2` | 交集（共同好友） | `SINTER set1 set2` |
| `SDIFF k1 k2` | 差集 | `SDIFF set1 set2` |
| `SUNION k1 k2` | 并集 | `SUNION set1 set2` |

```bash
SADD lottery "张三" "李四" "张三"  # 重复的存不进去
SMEMBERS lottery                  # -> 张三、李四
```

### 3.5 ZSet（有序集合）

在 Set 的基础上，每个元素多带一个**分数 score**，按分数自动排序——排行榜的标准方案。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `ZADD key score member` | 添加元素并指定分数 | `ZADD rank 95 "张三"` |
| `ZINCRBY key n member` | 给某个成员的分数加 n | `ZINCRBY rank 5 "张三"` |
| `ZRANGE key start stop` | 按分数**从低到高**取 | `ZRANGE rank 0 -1` |
| `ZREVRANGE key start stop` | 按分数**从高到低**取 | `ZREVRANGE rank 0 -1 WITHSCORES` |
| `ZSCORE key member` | 查询某个成员的分数 | `ZSCORE rank "张三"` |
| `ZRANK` / `ZREVRANK` | 正序 / 倒序排名（从 0 开始） | `ZREVRANK rank "张三"` |
| `ZCARD key` | 元素个数 | `ZCARD rank` |
| `ZREM key member` | 删除成员 | `ZREM rank "张三"` |

```bash
ZADD rank 95 "张三" 87 "李四"
ZREVRANGE rank 0 -1 WITHSCORES    # 按分数从高到低
```

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
3. **排行榜 / 计数**：ZSet 和 INCR 天生擅长
4. **分布式锁**：多个服务抢同一资源时，用 SETNX 实现

## 五、踩坑记录

**命令层面**

- **`SET` 会覆盖旧值，并清掉原有的过期时间**：给一个带 TTL 的 key 重新 `SET`（不带 `EX`），它就从「300 秒后消失」变成「永不过期」，缓存场景特别容易踩
- **`INCR` / `INCRBY` 只能作用于整型的值**：key 不存在时会当成 `0` 开始自增，但如果值是普通字符串会直接报错 `ERR value is not an integer or out of range`
- **`SETNX` 靠返回值判断成败**：返回 `1` 表示设置成功（key 原先不存在），返回 `0` 表示 key 已存在、什么都没做——分布式锁就是靠这个判断的
- **`HSET` 一次可以设多个字段**：Redis 4.0 之后 `HSET` 已支持多字段写法，老的 `HMSET` 被标记为废弃
- **`DEL` 是通用命令**：不管什么类型都能删；但删 Hash 的某个字段要用 `HDEL`，删 Set 成员要用 `SREM`，别搞混

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
