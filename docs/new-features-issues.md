# 新機能実装Issue一覧

今回追加したカラムの表示・登録機能実装のためのIssueを作成しました。

## 作成されたIssue

### 1. 25m_runカラムの表示・登録機能
- **Issue #30**: [25m_runカラムの表示・登録機能実装](https://github.com/takuaki-taku/performance-test/issues/30)
- 内容: 25m_run（25メートル走）の入力・表示機能

### 2. serfece（サーフェス）カラムの表示・登録機能
- **Issue #31**: [serfece（サーフェス）カラムの表示・登録機能実装](https://github.com/takuaki-taku/performance-test/issues/31)
- 内容: テニスコートのサーフェスタイプ（人工芝/ハード/クレー）の選択・表示機能

### 3. test_format（テスト形式）カラムの表示・登録機能
- **Issue #32**: [test_format（テスト形式）カラムの表示・登録機能実装](https://github.com/takuaki-taku/performance-test/issues/32)
- 内容: テスト形式（全国大会/地域大会）の選択・表示機能

### 4. birthday（誕生日）カラムの表示・登録機能
- **Issue #33**: [birthday（誕生日）カラムの表示・登録機能実装](https://github.com/takuaki-taku/performance-test/issues/33)
- 内容: ユーザーの誕生日の入力・表示機能

## 実装の優先順位

1. **birthday（誕生日）** - ユーザー情報なので優先度高め
2. **25m_run** - テスト結果の追加項目
3. **serfece（サーフェス）** - Enum値の選択が必要
4. **test_format（テスト形式）** - Enum値の選択が必要

## 次のステップ

### GitHub Projectsに追加する場合

1. GitHubリポジトリにアクセス
2. 「Projects」タブを開く
3. 新しいProjectを作成（または既存のProjectを開く）
4. 各IssueをProjectに追加

### コマンドラインから確認

```bash
# Issue一覧を表示
gh issue list

# 特定のIssueを表示
gh issue view 30
gh issue view 31
gh issue view 32
gh issue view 33

# Issueをブラウザで開く
gh issue view 30 --web
```

## 実装時の注意点

### バックエンド
- 既にスキーマに追加されているか確認
- Enum値のバリデーションを実装
- APIドキュメント（Swagger）を更新

### フロントエンド
- Enum値は日本語で表示
- 日付入力は日付ピッカーを使用
- フォームのバリデーションを実装

