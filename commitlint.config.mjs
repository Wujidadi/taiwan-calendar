// 岱員時憲章 — commitlint 設定
// 採 Conventional Commits 規範
// https://www.conventionalcommits.org/
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允許的 type
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修正
        'docs', // 文件
        'style', // 格式（不影響運行邏輯）
        'refactor', // 重構
        'perf', // 效能
        'test', // 測試
        'build', // 建置系統或外部依賴
        'ci', // CI 設定
        'chore', // 其他雜項
        'revert', // 還原
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 120],
  },
}
