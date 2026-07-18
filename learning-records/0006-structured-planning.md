# 0006 — 结构化计划与轨迹

## 学到了什么
- **计划驱动 vs 反应式**：反应式 Agent 边想边干，计划驱动 Agent 先输出可审计的计划再执行。差异不在工具数量，而在「动手前是否有计划的文本输出」。
- **Instructions 设计三原则**：具体而非笼统（"先 X 再 Y 最后 Z"）、给失败预案（工具 fail 了怎么办）、约束输出格式（编号、小节等结构化方式）。
- **Trajectory 可视化**：把 loop 返回的轨迹数组格式化为人可读的执行日志，区分 function_call、function_call_output、message 三种输出，标注错误。

## 为什么重要
Instructions 是 Agent 的"规章制度"——不用改代码就能改变 Agent 行为模式。Trajectory 是唯一的可观测窗口——Agent 行为异常时没有它就只能猜。两者结合让你从「调 API」变成「设计 Agent 行为」。

## 代码
- `src/Agent/trajectory.ts` — `formatTrajectory()` 格式化执行轨迹
- `src/Agent/loop.ts` — 已有 `instructions` 参数和 `trajectory` 返回值
- `src/main.ts` — 使用 instructions + formatTrajectory 演示

## 关键决策
- Instructions 放在 `runAgent` 调用侧而非硬编码在 loop.ts 里——每类任务可以有不同的行为约束
- Trajectory 格式化独立为函数，不耦合到 loop 内部——保持 loop 的纯净性

## 待扩展
- 在 instructions 里加入工具选择的偏好（"优先用 todo_search 而非 todo_list 查找特定任务"）
- 用 Zod 校验模型输出的计划格式，强制 JSON 结构
