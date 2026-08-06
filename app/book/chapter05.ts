import markdown from "./chapter05.md?raw";
import type { Chapter } from "./types";

export const chapter05: Chapter = {
  number: 5,
  shortTitle: "数据库与 SQL",
  title: "关系数据库、SQL、索引、事务与并发控制",
  subtitle: "数据库保存数据，并用约束、事务和并发控制守住业务事实。",
  opening: [
    "数据库设计从业务事实、关系约束和并发不变量开始。表、索引和事务把这些规则落到可持久、可恢复的存储层。",
    "本章以关系模型为主线，解释 SQL 的执行、索引为什么有效、事务究竟保证什么，以及读写并发时哪些错误仍会发生。",
  ],
  goals: [
    "为业务事实选择表、主键、外键、唯一约束和合适的范式边界。",
    "通过执行计划理解查询、复合索引和分页的真实成本。",
    "区分连接、事务、原子性、幂等性、MVCC 与显式锁。",
    "用条件更新、约束和隔离级别维护并发写入的不变量。",
  ],
  markdown,
  furtherReading: [
    { title: "PostgreSQL：事务隔离", href: "https://www.postgresql.org/docs/current/transaction-iso.html" },
    { title: "PostgreSQL：显式锁", href: "https://www.postgresql.org/docs/current/explicit-locking.html" },
    { title: "PostgreSQL：索引简介", href: "https://www.postgresql.org/docs/current/indexes-intro.html" },
    { title: "PostgreSQL：备份与恢复", href: "https://www.postgresql.org/docs/current/backup.html" },
  ],
};
