# HEARTBEAT.md

## 每3小时主动向 Charles 汇报一次进度
- 检查 `memory/heartbeat-state.json` 的 `lastProgressReport` 时间
- 如果距离上次汇报 ≥ 3小时，发消息给 Charles（Telegram），汇报：
  - 本轮 heartbeat 检查发现了什么
  - 当前有多少个 open PR，有无新动态
  - daemon 状态
  - 有无需要 Charles 决策的事项
- 汇报完毕后更新 `lastProgressReport` 时间戳
- **所有时间均以 America/Los_Angeles 为准**
- 时间段 01:00–07:00 (America/Los_Angeles) 不主动打扰，除非有紧急情况

## 每次 heartbeat 检查:
- bounty PR 状态 (`data/bounty-tracker.json`)
  - 用 `gh pr view` 查每个 open PR 的状态
  - 如果 merged → 更新 tracker，通知 Charles
  - 如果 closed (别人的 merged) → 分析赢家 PR 哪里做得好，写复盘到 reviews[]，通知 Charles
  - 如果有 review comments → 及时响应，**所有 comment 必须有回复，无例外**
  - inline comment 用 curl + in_reply_to_id 回复，不能只发 issue-level comment
- 每小时检查所有 open bounty PRs 有无新 comment（human reviewer 优先）
  - 有改动请求 → 立刻用 Claude Code 修复，push，回复 comment
  - 有问题 → 直接用浏览器或 curl 回复，说明方案
  - bot comment (coderabbitai 等) → 也要逐条回复
- prediction_news daemon 是否还在运行 (`launchctl list | grep bond-dryrun`)
- 如果挂了，重启它
- Claude Code 额度是否充足，有没有待推进的任务（别偷懒！）

## 每24小时复盘 (检查 memory/heartbeat-state.json 的 lastStrategyReview 时间):
- 读取 resolution journal (`data/resolution_journal.jsonl`)
- 用 scorecard 分析 P&L、win rate、各 tier/策略表现
- 找出亏损模式，调整策略参数
- 用 Claude Code 实现改进
- 重启 daemon
- 把复盘结果写入 memory/YYYY-MM-DD.md
- 通知 Charles 关键发现

## 每日 Bounty 复盘 (每天一次，检查 heartbeat-state.json 的 lastBountyReview):
- 跑 `node scripts/bounty-check.mjs` 检查所有 PR 状态
- 有新 review comment → 分析并回复/修复，用 Claude Code 改代码
- 有 merged/closed → 更新 bounty-tracker.json，分析原因
- 没有动静 >3天 的 PR → 考虑是否补充改进、ping maintainer
- 找 1-2 个新 bounty 目标（优先 verified-payer，低竞争）
- 把复盘记录写入 memory/YYYY-MM-DD.md

## 每日新项目推进 (每天一次，检查 heartbeat-state.json 的 lastProjectReview):
- 当前项目: 出海 SEO 内容工厂 (data/new-project-research.md)
- 检查进度，推进下一步（验证PMF → MVP → 推广）
- 有待决策的问题 → 通知 Charles
- 记录进展到 memory/YYYY-MM-DD.md
