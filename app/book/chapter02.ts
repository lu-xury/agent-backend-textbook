import markdown from "./chapter02.md?raw";
import type { Chapter } from "./types";

export const chapter02: Chapter = {
  number: 2,
  shortTitle: "操作系统与并发",
  title: "操作系统、进程、线程、协程与 Linux 资源",
  subtitle: "理解资源归属、等待、隔离和并发，才能解释服务在压力下的真实行为。",
  opening: [
    "后端程序不是直接运行在 CPU 上的一段代码，而是运行在操作系统提供的边界之内。接收连接、读写文件、访问数据库、定时执行任务和发布时退出，最终都会落到进程、线程、内存、文件描述符和信号上。",
    "本章不要求背诵系统调用；重点是建立判断框架：什么资源被谁拥有，什么工作正在等待，什么时候需要隔离，什么时候需要并发。",
  ],
  goals: [
    "说清进程、操作系统线程和协程的资源边界与适用场景。",
    "解释用户态、内核态、系统调用、异常和中断的不同路径。",
    "用 CPU 与 I/O 的工作性质选择同步、线程、事件循环或 worker。",
    "理解虚拟内存、RSS、文件描述符、信号和容器限制的排障含义。",
    "区分进程内同步与跨实例的持久化一致性。",
  ],
  markdown,
  furtherReading: [
    { title: "Linux man-pages：fork(2)、execve(2) 与 mmap(2)", href: "https://man7.org/linux/man-pages/man2/fork.2.html" },
    { title: "Linux man-pages：epoll(7) 与 socket(7)", href: "https://man7.org/linux/man-pages/man7/epoll.7.html" },
    { title: "Linux man-pages：signal(7) 与 signal-safety(7)", href: "https://man7.org/linux/man-pages/man7/signal.7.html" },
    { title: "Linux Kernel Documentation：Control Group v2", href: "https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html" },
  ],
};
