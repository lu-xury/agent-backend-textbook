后端服务最终不是“部署一份代码”，而是在某台 Linux 主机上启动进程、提供网络服务、读取配置、占用 CPU 和内存、处理终止信号，并在版本变更时保持正确性。容器和 Kubernetes 能把这些操作标准化，却不能消除它们的语义：进程仍会崩溃，文件仍可能丢失，DNS 仍可能变更，数据库迁移仍可能破坏旧版本。理解这些基础，才能在看到 `CrashLoopBackOff`、探针失败、Pod 被驱逐或发布卡住时判断真正发生了什么。

本章用订单 API 为例。它被构建成镜像，作为多个容器副本运行；连接 PostgreSQL、Redis 和消息队列；由 Kubernetes Service 暴露；发布新版时要迁移订单表。目标不是背 YAML 字段，而是回答：什么东西应当不可变，什么应由环境提供，何时一个副本可接流量，如何在失败时恢复。

## 11.1 构建产物、镜像与容器

**构建产物（build artifact）**是从某个已知源代码、依赖和构建步骤得到的可执行结果，例如 Go 二进制、Java JAR、前端静态文件，或包含它们的容器镜像。构建应可追溯：记录源代码提交、依赖锁定文件、构建器版本、测试结果和产物摘要。若同一个版本在测试环境重新编译、生产环境再编译，就可能因依赖仓库变化、编译器差异或隐含环境变量得到不同程序；更可靠的做法是**构建一次，按 digest 提升同一产物**。

**镜像（image）**是运行容器所需文件、二进制、库与基础配置的只读模板，可由 Dockerfile 的指令分层构建；它本身不是正在运行的服务。Docker 将镜像定义为包含运行容器所需文件、二进制、库和配置的标准化包，[官方概念文档](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)可作为准确起点。镜像 tag 如 `order-api:1.8.0` 方便人读，但 tag 可以被重新指向；registry digest 才唯一标识一份内容。生产发布记录应包含镜像 digest，而不是只写 `latest` 或一个可变 tag。

**容器（container）**是由镜像创建的、受 Linux namespace 和 cgroup 等机制隔离的运行环境，通常围绕一个主进程及其子进程树运行；运行时并不禁止多个进程。启动十个容器，不是复制十份镜像文件到内存，而是启动十组运行状态；同一个镜像可以产生许多配置不同的容器。容器的可写层、进程号、网络地址和临时文件都属于运行时状态，停止并删除容器后通常不应被当作可靠数据来源。

一个生产镜像应尽量小、明确且非特权运行：多阶段构建把编译器留在 build 阶段，运行阶段只留下必要文件；用 `.dockerignore` 防止把 `.git`、本地密钥和测试缓存送进构建上下文；固定基础镜像的版本或 digest；以非 root 用户运行；将启动命令写清。镜像变小不是为了“好看”，而是减少拉取时间、攻击面和不确定依赖；但也不要为了极小镜像删掉诊断所需的 CA 证书、时区数据或运行库。

### 高频辨析：镜像与容器

**由 digest 标识的镜像内容**是不可变的运行模板，容器是**由模板启动的运行实例**。修改正在运行容器里的文件不会修改镜像，也不应成为发布方式；修改 Dockerfile 后必须重新构建镜像。面试中可用“类与对象”帮助记忆，但别把比喻当机制：镜像有分层和 digest，容器有 PID、网络、挂载卷和生命周期。生产事故中“我在容器里改好了”为何不可靠？因为下一次重启或扩容会重新从镜像创建实例。

### 高频辨析：虚拟机与容器

**虚拟机（VM）**虚拟出一套硬件并运行自己的完整 guest OS 与内核；**容器**是共享宿主机内核的隔离进程。容器通常启动更快、密度更高，但隔离边界与内核共享也意味着它不是强安全沙箱的同义词。二者常组合：云上先提供 VM，VM 内运行 container runtime 和多个容器。Docker 文档同样指出 VM 带有完整 OS，而多个容器共享同一内核；[容器与 VM 的说明](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)适合初学者核对这个边界。

## 11.2 进程生命周期与 12-Factor 的适用边界

容器不是轻量虚拟机，而是围绕一个主要进程设计的运行单元。Linux 进程有父子关系、文件描述符、信号和退出码；容器入口进程常是 PID 1。PID 1 必须正确处理 `SIGTERM`、转发或管理子进程并回收僵尸进程。若用 `sh -c "app"` 作为入口而 shell 没有 `exec`，终止信号可能只到 shell，应用继续运行到强制杀死；若应用启动了子 worker 却从不回收，长时间运行会耗尽 PID。不要用“容器会帮我处理”代替对进程模型的理解。

正常终止应有明确步骤：收到 `SIGTERM` 后停止接受新请求或先把 readiness 置为失败，随后等待端点传播和在途连接排空；应用本身也应拒绝新的工作，不能只依赖 probe。再等待在途请求、事务和消息确认在截止时间内结束；关闭监听端口、连接池和 worker；记录退出原因；超过 `terminationGracePeriodSeconds` 后编排器可能以强制信号结束进程。不要在终止钩子里开启几分钟的数据库迁移或无限等待外部服务。长任务应设计可恢复的 checkpoint、幂等键和租约，因为任何进程最终都可能在优雅关闭完成前被杀死。

12-Factor 提倡将服务作为无状态、可处置的进程运行：快速启动、优雅关闭，状态交给数据库、对象存储、队列等附属服务；它还提出严格区分 build、release、run，并把部署差异配置放在环境中。[12factor](https://12factor.net/)是一套有价值的方法论，不是“所有数据必须放环境变量”的命令。遗留应用、边缘设备、需要热更新的大型配置、证书轮换和受监管系统可能需要挂载文件、专门 Secret agent 或动态配置服务；关键原则仍是**配置与代码/镜像分离、来源可审计、变更语义明确**。

### 高频辨析：进程与容器

进程是操作系统调度和管理的执行实体；容器是给进程附加 namespace、cgroup、文件系统和网络等隔离边界的运行环境。一个容器通常应有一个主要应用进程，但可以有辅助进程；一个 Pod 也可以包含多个容器。容器“仍在 Running”不表示应用可用：PID 1 可能只是一个卡住的 shell，端口可能没监听，worker 可能死锁。排障时同时看进程退出码、信号、stdout/stderr、探针和实际请求，而不是只看容器状态。

### 高频辨析：构建、发布与运行

**构建（build）**把源代码变成不可变产物；**发布（release）**把某个产物与某个环境的配置、Secret 和部署记录组合起来；**运行（run）**是让这份 release 在实例上实际启动。改镜像是新构建，改数据库地址或需要审计的 feature flag 是新 release，重启同一 release 只是再次运行。动态 flag 也应有独立版本、审批与回退记录；不同团队可将它视为运行时配置变更而非新部署 release。混淆三者会导致“在生产机器上改配置又重编译”的不可追溯操作。12-Factor 明确要求分离 build、release、run；[其说明](https://12factor.net/)的价值正在于让回滚和审计有清晰对象。

## 11.3 配置、Secret 与服务发现

**配置（configuration）**是同一份程序在不同部署环境中的可变行为，例如 HTTP 端口、数据库主机、日志级别、限流阈值、启用的实验和区域。它应有 schema、默认值、校验、所有者和变更记录。服务启动时要对必需配置 fail fast：若 `DATABASE_URL` 缺失或端口非法，应立即以明确错误退出，而不是运行到第一次订单请求才抛空指针。配置也不是越多越好；将业务规则、租户数据或一次性运维命令伪装成环境变量，会使理解和审计变差。

**Secret** 是需要访问控制的敏感配置，如数据库密码、API token、私钥和 TLS 证书。Secret 与普通配置的核心差别是机密性与权限，不是数据格式：一个 JSON blob 也可能是 Secret。Kubernetes Secret 可以通过环境变量或文件挂载交给容器，但默认 base64 编码不是加密，且拥有创建 Pod 权限的人可能间接读取同 namespace 的 Secret。Kubernetes 官方建议至少启用静态加密、最小权限 RBAC、限制容器访问范围，并在需要时使用外部 Secret 存储。应限制 workload 的 serviceAccount，只把需要的 key 挂载给需要的 container，并避免以环境变量暴露给诊断工具或子进程。[Secrets 文档](https://kubernetes.io/docs/concepts/configuration/secret/)明确列出了这些边界。

Secret 不能进入 Git、镜像层、Dockerfile `ARG`、普通日志、错误报告或 metrics label。轮换时还要定义应用如何生效：通过环境变量注入的 Secret 通常需要重建 Pod；作为 volume 更新也可能是最终一致的，且 subPath 挂载不会自动收到更新。文件更新也不等于应用 reload：若进程只在启动时读取一次，仍要实现 watch/reload，或以滚动重启完成切换。若数据库密码已轮换但连接池仍持有旧连接，服务要能重新认证或滚动重启；若证书轮换，TLS reload 的行为也必须测试。**“已更新 Secret 对象”不等于每个进程已经在用新凭据。**

服务发现不要把 Pod IP 写入配置。Kubernetes 为 Service 创建稳定 DNS 名，容器可用服务名而不是易变 IP 查找后端；不同 namespace 需要相应的 DNS 名称。[Kubernetes DNS 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)说明 Service/Pod 记录和 namespace 搜索规则。客户端仍要正确处理 DNS 缓存、连接复用、端点切换、超时和重试：DNS 能给地址，不能保证应用协议成功，也不能替你处理一条长期 gRPC 连接何时应重新建立。

### 高频辨析：配置与 Secret

配置描述“程序怎样运行”，Secret 描述“谁有权知道的敏感值”；二者都应从代码和镜像分离。把密码放进 ConfigMap 只是把 Secret 叫成了配置，并不会降低风险；把所有非敏感配置都放 Secret 又会扩大权限范围、妨碍审计和排障。正确做法是按敏感性分层，给每个值规定来源、权限、轮换、验证和生效方式。

### 高频辨析：服务名与 IP 地址

Pod IP 是一次运行实例的地址，重建、扩缩容和故障转移都会改变；Service 名是稳定的逻辑入口。客户端连接 `payment.default.svc.cluster.local` 或同 namespace 的 `payment`，让 Service 将流量导向当前健康端点。DNS/service discovery 解决“去哪里找”，负载均衡、超时、重试、熔断和协议兼容解决“能否正确完成”；不要把 DNS 成功解析当作依赖健康检查。

## 11.4 健康检查与接流量的边界

Kubernetes 的探针不是一个叫 `/health` 的万能 URL。**startup probe** 回答“应用是否完成了允许较慢的初始化”；在它首次成功前，liveness/readiness 都不应因冷启动而频繁杀掉应用或加入流量。**liveness probe** 回答“这个进程是否已进入无法自行恢复、且重启确实可能恢复的坏状态”；失败会触发容器重启。**readiness probe** 回答“这个实例现在是否应该接收 Service 流量”；失败会把实例从可用端点移除，但不应因此重启它。Kubernetes 文档说明 startup 首次成功后 liveness/readiness 才开始按各自规则探测，而 readiness 失败会使 Pod 不接收 Service 流量，[官方探针指南](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)应作为具体字段的依据。

```yaml
startupProbe:
  httpGet: {path: /startup, port: http}
  periodSeconds: 5
  failureThreshold: 24       # 最多给初始化 120 秒
readinessProbe:
  httpGet: {path: /ready, port: http}
  periodSeconds: 5
livenessProbe:
  httpGet: {path: /live, port: http}
  periodSeconds: 10
```

一项探测的最长启动预算约为 `failureThreshold × periodSeconds`，还应为请求设置短且可承受的 `timeoutSeconds`。`/live` 应尽量只检查进程自身还能响应，不能每次都查询数据库或调用支付服务；否则依赖短暂故障会让所有副本同时重启，形成级联故障。`/ready` 可检查本实例是否已加载必需配置、监听完成、连接池可用，是否把某个下游纳入 readiness 则是业务选择：若订单创建离不开数据库，数据库不可达时不接流量合理；若推荐服务不可用但订单仍可降级创建，把它写进 readiness 会不必要地使整个 API 下线。探针要快、无副作用、避免高成本操作，并以真实用户路径和故障演练验证阈值。

### 高频辨析：liveness、readiness 与 startup

startup 保护**慢启动**，liveness 发现需要**重启**的坏进程，readiness 控制是否**接流量**。readiness 失败不等于服务永远坏了，liveness 失败也不该被当作依赖可用性检查。最常见错误是把同一个“数据库能否连通”的端点同时给三个探针：冷启动时反复重启，数据库抖动时全体重启，发布时又让尚未预热的实例接请求。应按每个问题真正需要的动作设计。

## 11.5 发布策略、数据库迁移与兼容性

**滚动发布（rolling update）**逐步用新副本替换旧副本，依赖 readiness 和 `maxUnavailable`/`maxSurge` 在容量与速度间平衡。优点是节省额外资源、可渐进观察；风险是新旧版本会并存一段时间，所以接口、消息和数据库 schema 必须向前/向后兼容。Kubernetes Deployment 的 RollingUpdate 可以在更新中让多个版本同时运行，[Deployment 文档](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)正是这种现实约束的例子。

在 Kubernetes 中，**Pod** 是调度与运行的一组容器，随节点故障、扩缩容和发布而被替换；**Deployment** 是声明“希望持续有多少个满足模板的副本”的控制器，负责创建新的 ReplicaSet 并收敛到期望状态。Deployment 显示 rollout 成功，只说明控制器按 Deployment 的可用条件（包括 readiness，可能还包括 `minReadySeconds`）观察到足够副本可用，并不能替代真实 SLI、业务正确性或数据库迁移验证。发布时应同时观察副本是否 ready、Service 端点是否稳定、错误预算和关键业务指标，而不是只看 `kubectl apply` 返回成功。

控制器追求的是期望副本数，不知道“新版本的金额计算是否正确”。因此发布监控需要把基础设施状态和业务状态并排看：副本不足说明编排或资源问题；副本齐全而支付成功率下降，则是应用、依赖或兼容性问题。二者的恢复动作不同，不能用一次重启掩盖差异。

**蓝绿发布（blue-green）**保留一套完整旧环境和一套完整新环境，验证 green 后用负载均衡或路由把流量从 blue 切换过去。回切通常快，适合切换边界明确的 Web 服务；代价是双份容量、状态同步与连接排空更复杂。**金丝雀发布（canary）**先把小比例流量、某个区域、内部用户或特定租户导向新版本，观察错误率、延迟和业务指标，再逐步扩大。它能降低未知风险，但必须有可区分流量、可靠指标和停止条件；把一个副本随机换成新版本而没有观测和回退规则，不算成熟的金丝雀。

数据库迁移是发布中最容易被忽略的共享状态。不要让每个应用副本启动时自动执行迁移：滚动发布时多个副本会竞争，失败会造成 CrashLoop，且权限过大的应用账号扩大风险。迁移应由受控的一次性 Job/流水线步骤执行，使用独立、短时且最小必要权限的身份，有锁、审计、超时和可观察结果；应用账号不应因“需要迁移”获得 DDL 权限。更重要的是 schema 演进采用**扩展—迁移—收缩（expand–migrate–contract）**：先新增可空列、索引或新表，使旧代码仍可运行；回填历史数据并让新旧代码兼容读写；确认旧版本全部退出、数据已验证后，才删除旧列或收紧约束。任何破坏性改动都不应假设“代码和 schema 会同时切换”。

例如订单表将 `total_cents` 改为 `total_minor_units` 时，先增加新列而不删旧列；后端在兼容期内对新旧列**双写**，或明确 `total_cents` 为唯一事实源并由受控任务持续同步 `total_minor_units`；读取先采用有回退规则的兼容逻辑。后台回填后，校验每条记录的新旧值一致，并处理回填与新写入并发的竞态；所有消费者和报表升级后才切换主读取并最终删除旧列。双写失败不能悄悄忽略，需定义同一事务内写入、重试/补偿和一致性校验方式；仅写一条 `ALTER TABLE RENAME COLUMN` 再滚动发布，遇到旧副本往往立即报错。

### 高频辨析：滚动、蓝绿与金丝雀

滚动发布按**副本批次**替换，蓝绿发布按**完整环境/流量切换**替换，金丝雀发布按**受控的一部分真实流量**验证。三者可以组合，例如先在 green 环境做金丝雀，再切全量；也可以都不适合一次不可逆的数据转换。选择不是“哪种更高级”，而是看额外容量、会话/状态、观测能力、回退速度、兼容性和风险预算。

### 高频辨析：数据库迁移与应用发布

应用发布替换的是可回滚的代码/镜像副本；数据库迁移改变的是共享且可能不可逆的数据结构与数据。两者必须编排，但不能把迁移看成普通 Pod 重启的一部分。发布可回滚到旧镜像，旧镜像却未必认识已经删除的列；因此先做兼容性扩展，再发布应用，是比“先破坏 schema、再部署代码”更安全的默认顺序。

## 11.6 回滚、恢复、资源与存储

**回滚（rollback）**是把流量、部署描述或运行代码切回已知版本；例如将 Deployment 指向上一个镜像 digest，或把蓝绿路由切回 blue。**恢复（recovery）**是把服务和数据带回正确可用状态，可能需要重放消息、修复坏数据、从备份恢复、重新执行迁移、清理重复副作用或等待下游同步。回滚是常见的止血手段，却不是恢复的同义词：新版本已写入不兼容数据时，单纯回滚代码可能让旧版本更坏；数据库 `DROP COLUMN` 后也不能靠镜像回滚找回数据。

回滚前应知道对象和边界：镜像 digest、配置版本、feature flag、迁移版本、消息 schema、缓存格式和外部副作用。对不可逆外部 API 调用和已经发出的事件，回滚不会撤回副作用，必须有幂等、补偿或版本兼容策略。每一次发布应记录这些信息并有运行手册。对数据库备份，要定期在隔离环境执行 restore 演练，验证恢复时间目标（RTO）和可接受的数据丢失量（RPO）；“有备份”而从未恢复过不构成恢复能力。数据修复脚本要幂等、可审计、先在小范围验证，不能在事故中直接对生产表运行未评审的批量更新。

Kubernetes 中 **request** 是调度和争用时资源份额的依据：scheduler 根据 request 判断节点是否能放下 Pod，资源竞争时 CPU request 也影响相对份额，却不保证容器任何时刻得到一整块物理 CPU。**limit** 是运行时上限：Linux cgroup 通常据此限制 CPU 时间和内存使用。CPU 超过 limit 往往被 throttle，表现为延迟增大；内存超过 limit 可能触发 OOM kill，应用进程退出并被重启。Kubernetes 的 [资源管理文档](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)明确区分 scheduler 使用 request 与 kubelet/运行时执行 limit。数值应来自观测和压测：request 太高导致副本 Pending、浪费集群；太低则调度过密，峰值互相争抢；内存 limit 太低会 OOM，CPU limit 太紧会制造长尾。不能把 `request=limit` 当作所有服务的万能最佳实践。

**容器可写层**适合临时文件，容器重建后不应依赖其中数据；`emptyDir` 是 **Pod 级** 临时卷，适合缓存、解压和同 Pod 容器间短期传递，并能跨同一 Pod 内的容器重启保留，但 Pod 被删除或迁移后会丢失。若 `emptyDir.medium: Memory`，写入会计入容器/Pod memory limit，可能导致 OOM，因此不能把 RAM 临时卷当作无成本缓存。它们都不适合订单、上传文件或数据库数据。需要在 Pod 重建后保留的数据，应使用 PersistentVolumeClaim（PVC）绑定的持久卷或外部托管存储，并明确访问模式、性能、备份、加密、快照和删除策略。卷“持久”只表示其生命周期可独立于容器，不保证应用写入已 fsync、跨区可用、自动备份或不会被误删。日志通常写 stdout/stderr 交给采集系统，而不是在容器文件系统里攒一个永不上传的 `app.log`。

### 高频辨析：回滚与恢复

回滚将**版本或流量切回去**，恢复将**服务和数据修到可正确使用**。代码 bug 未造成数据副作用时，回滚可能就是恢复；发生了错误扣款、错误迁移、消息重复或缓存格式变化时，恢复还需要数据和业务层的补救。事故预案必须写清两者：何时可一键回滚，何时必须停止写入、保护证据、执行修复 Job 或从备份恢复。

### 高频辨析：request 与 limit

request 回答“调度器应为这个容器预留/考虑多少资源”，limit 回答“运行时最多允许用多少”。request 不是当前真实用量，limit 也不是性能目标。CPU 达到 limit 时服务未必崩溃，却可能因 throttle 使 P99 激增；内存超过 limit 时常见结果是 OOM killed。排障要同时看 request/limit、实际使用、throttling、OOM、节点压力和应用并发，而不是只把 limit 调大。

### 高频辨析：临时文件系统与持久卷

容器可写层随容器生命周期消失；`emptyDir` 随 Pod 生命周期消失，二者都只适合可重建内容；持久卷把数据生命周期从运行实例中分离，适合需要保留的状态。把 SQLite、用户上传或任务检查点放在容器可写层，扩容和重建时极易丢失；把所有缓存都放持久卷，又会增加清理、成本和陈旧数据风险。先问数据是否是唯一事实、能否重建、需要何种一致性与恢复目标，再选择卷或外部服务。

## 11.7 CI/CD 与发布质量门

CI/CD 的目的不是把 `git push` 自动变成“立刻全量上线”，而是把构建、验证、审批、推广和回退变成可重复流程。一个实用的质量门可包括：锁定依赖并构建镜像；运行单元/集成测试、静态检查和镜像配置检查；生成软件物料清单（SBOM）并扫描依赖与镜像漏洞；用部署模板做 schema/策略校验；在临时环境进行最小冒烟测试；把通过验证的同一 image digest 提升到下一环境；在生产按滚动或金丝雀策略观察 SLO 与关键业务指标。漏洞扫描受漏洞数据库、镜像可达性和规则质量限制；“无告警”只是拦截已知风险的门槛，不是供应链安全证明。质量门应与风险相称：一行文案不必等待数小时的负载测试，数据库/认证/支付变更不能只靠单测全绿。

部署声明也要版本化和可审查。镜像、resources、probe、Service、网络策略、配置引用和迁移 Job 都是运行行为的一部分；它们绕开代码审查直接在控制台修改，会造成“仓库说一套、集群跑另一套”。自动化应在失败时停在安全状态、保留日志和产物、提供清晰的人工确认点；它不应未经判断地对所有失败执行无限重试或自动回滚，因为数据迁移和外部副作用可能需要人工决策。

## 11.7.1 Kubernetes 的控制循环、网络与安全边界

Kubernetes 的核心不是一组 YAML 关键字，而是**声明期望状态并持续协调**。你提交 Deployment，控制平面保存“需要 N 个符合模板的 Pod”；Deployment 控制器创建或替换 ReplicaSet，ReplicaSet 维持副本数，调度器为未调度的 Pod 选择节点，节点上的 kubelet 再让容器运行时拉镜像并启动容器。任何一步失败都会留下可观察状态：Pending、ImagePullBackOff、CrashLoopBackOff、不可用副本、事件或探针失败。控制器并不理解“订单服务是否逻辑正确”，它只根据声明和健康信号收敛，所以就绪探针、资源限制和发布前验证必须由应用与平台共同设计。

**Pod**是最小可调度单元，其中的容器共享网络命名空间与 localhost，通常也共享挂载卷；它不是一个永远不变的服务器。Pod 重建后 IP 会变化，持久客户端不应把 Pod IP 写进配置。**Service**为一组匹配标签、且处于就绪状态的后端提供稳定名称与虚拟入口；集群 DNS 让 `orders.default.svc` 解析到该入口，负载均衡再把连接分发给 Endpoint。Ingress 或 Gateway 把外部 HTTP/TLS 路由送入 Service，但不是所有网络策略、认证、WAF 或限流都会自动具备。服务发现解决“到哪儿”，负载均衡解决“选哪个后端”，网络策略解决“哪些 Pod 可以通信”，三者要分开配置和排障。

一次 Pod 出站请求通常从 Pod 的 network namespace 经虚拟网卡对（常见为 **veth**）、CNI 插件配置的路由/网桥或覆盖网络到达节点，再路由到本节点或其他节点的 Pod；访问 Service 虚拟 IP 时，还会由 kube-proxy 的 iptables/IPVS 规则或实现等价语义的 eBPF 数据面选择 Endpoint 并做转发/DNAT。具体实现会变化，Kubernetes 只规定网络模型与 Service 语义，不规定所有集群都必须经过同一条 iptables 链。跨节点和出集群流量还可能发生 SNAT，影响服务端看到的源地址；需要客户端 IP 时要理解代理、`externalTrafficPolicy` 与负载分布/可达性的取舍。

因此“Pod 能解析 Service 名但连接超时”至少要分层检查：DNS 记录、Service selector 与 EndpointSlice、目标 Pod readiness、端口/targetPort、节点与 CNI 路由、NetworkPolicy、宿主机防火墙和应用监听地址。NetworkPolicy 只有在网络插件实现它时才产生隔离效果，且它控制网络可达性，不验证 HTTP 用户身份。抓包也要选对 namespace 和链路点：在 Pod 内、宿主机 veth 端、节点外网卡看到的源/目标地址可能因 DNAT/SNAT 不同，不能把任意一个点的地址直接当作端到端事实。

容器安全仍建立在 Linux 权限上。工作负载应尽量以非 root 用户运行，丢弃不必要的 capability，使用只读根文件系统和最小镜像；Secret 不应硬编码进镜像、命令行或普通日志。Kubernetes RBAC 控制某个 ServiceAccount 可调用哪些 Kubernetes API，不能代替应用对最终用户的授权；NetworkPolicy 能约束 Pod 间流量，不能替代 TLS、输入校验或数据库权限。生产发布还应限定镜像来源与签名/扫描、审计谁改了何种配置，并把数据库、队列与外部网络的凭据按最小权限分发。

## 本章练习

1. 同一个 tag `order-api:1.8` 在测试环境通过，生产发布后行为不同。列出可能原因，并说明如何调整构建与发布流程，使生产运行的内容可精确追溯。

2. 某服务把“数据库连不上”同时作为 startup、liveness、readiness 的判断条件。数据库短暂抖动后，所有 Pod 反复重启。应如何分别设计三类探针？

3. 团队要把订单金额列从 `total_cents` 改名为 `total_minor_units`，当前有多个旧版本副本和报表任务。给出扩展—迁移—收缩的发布顺序，并指出回滚的限制。

4. Pod 的 CPU request 为 `100m`、limit 为 `200m`。流量升高后 CPU 实际接近 `200m`，P99 上升但没有重启。解释现象并列出继续调查的指标。

5. 新版采用金丝雀，只让 2% 订单流量进入。哪些指标和停止条件必须预先定义？为什么不能只看容器是否 Running？

6. 运维在一个容器内手工修改了 `/app/config.yaml`，请求立刻恢复。为什么这不是正确的长期修复？应如何把修改变成可审计 release，并怎样验证回滚与恢复？

## 练习参考答案

1. tag 可能被重新推送，测试与生产可能在不同时间拉取不同层；依赖、构建器、基础镜像或环境配置也可能不同。CI 应从锁定源与依赖构建一次，记录提交和 image digest，先在测试验证同一 digest，再把该 digest 与生产配置组合为 release。生产部署和告警中应能查询到 digest、配置版本和迁移版本，不能只看到可变 tag。

2. startup 给足最慢初始化时间，只判断应用是否已完成自身启动；liveness 判断进程是否卡死或无法自恢复，不对每次探测同步依赖数据库；readiness 在订单创建确实不能脱离数据库时检查本实例能否提供该能力，失败后停止接 Service 流量但不重启。数据库抖动时还要看连接池、超时、退避和依赖容量，不能靠重启所有 Pod 解决。

3. 先新增允许为空的 `total_minor_units` 及必要索引，旧代码继续使用旧列；发布兼容版本，按规则双写或能读两列；后台分批回填、校验一致性并升级报表/消费者；确认旧版本退出后切换主读取，最后删除旧列。若已删除旧列或写入了旧代码不能理解的新格式，镜像回滚并不能恢复兼容性，可能需要反向迁移或数据修复。

4. 超过 CPU limit 往往发生 cgroup throttling，不一定重启，因此尾延迟会先恶化。检查 CPU throttled 时间/次数、实际 CPU、run queue、线程池排队、request 与节点争用、每个 route 的 QPS/延迟、下游连接池和 GC；再用压测决定提高/移除不合适的 limit、扩副本、优化热点或降低并发，不能只调一个数字。

5. 预先定义金丝雀受众、持续时间、最小样本量、成功率、P95/P99、错误预算消耗、订单重复率/金额正确性、队列积压和关键依赖错误，并写明何时暂停扩大、回滚或人工评估。Running 只说明容器主进程尚未退出，不说明 readiness、用户请求、数据库兼容、业务数据或长尾延迟正常。

6. 容器重启、扩容或重新调度后手工改动会消失，也没有版本、审查或可复制记录。应把非敏感值写入版本化配置并校验，把敏感值写入受控 Secret 系统，使用同一镜像 digest 创建新的 release；变更应经审查并记录生效方式。回滚演练要验证旧 release 与当前 schema/Secret 兼容；若故障已写坏数据，还要验证修复/恢复流程，而不是只确认路由切回旧版本。

## 延伸阅读与资料

- [Docker：What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) 与 [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)：镜像、容器和 VM 的官方入门定义。
- [The Twelve-Factor App](https://12factor.net/) 与 [Disposability](https://12factor.net/disposability)：build/release/run、配置与可处置进程的原始方法论。
- [Kubernetes：Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)：三种探针的动作边界。
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)、[DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)：Secret 安全边界与服务发现。
- [Kubernetes Cluster Networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/) 与 [Services, Load Balancing, and Networking](https://kubernetes.io/docs/concepts/services-networking/)：Pod 网络模型、CNI 与 Service 转发语义。
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) 与 [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)：滚动更新、request/limit 与 cgroup 资源行为。
