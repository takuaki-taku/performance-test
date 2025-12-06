o# 現在の構造分析

## ページ分類

### 管理画面（Admin）
- `/admin/training-evaluations` - トレーニング評価管理
- `/test-results` - テスト結果管理（ユーザー作成・削除、テスト結果追加・削除）
- `/physical-test-results/[userId]` - 特定ユーザーのテスト結果表示

### ユーザー画面（User）
- `/` - ホームページ
- `/mypage/[userId]` - マイページ（個人ダッシュボード）
- `/karte/[userId]` - トレーニングカルテ
- `/quickstart` - クイックスタートガイド
- `/flexibility` - 柔軟性トレーニング一覧
- `/flexibility/[id]` - 柔軟性トレーニング詳細
- `/core` - 体幹トレーニング一覧
- `/core/[id]` - 体幹トレーニング詳細
- `/warmup` - ウォームアップ一覧
- `/warmup/[id]` - ウォームアップ詳細
- `/cooldown` - クールダウン一覧
- `/cooldown/[id]` - クールダウン詳細

### 認証（Auth）
- `/login` - ログイン
- `/signup` - サインアップ

## 問題点の詳細

1. **管理画面の散在**
   - `/test-results` が管理画面なのに `/admin` 配下にない
   - `/physical-test-results` も管理画面だが別の場所

2. **認証チェックの不統一**
   - `/admin/training-evaluations` は認証チェックあり
   - `/test-results` も認証チェックありだが、構造が異なる

3. **レイアウトの統一性**
   - すべて同じHeader/Footerを使用
   - 管理画面専用のナビゲーションがない

4. **コンポーネントの混在**
   - `UserForm`, `UserList` など管理画面用コンポーネントが `components/` 直下
   - ユーザー画面用と管理画面用の区別がない

## 推奨される新しい構造

```
frontend/src/app/
├── (auth)/                      # Route Group（URLに含まれない）
│   ├── layout.tsx              # 認証用レイアウト（ヘッダーなし）
│   ├── login/
│   └── signup/
│
├── (user)/                      # Route Group（URLに含まれない）
│   ├── layout.tsx              # ユーザー用レイアウト
│   ├── page.tsx                # / (ホーム)
│   ├── mypage/
│   │   └── [userId]/
│   ├── karte/
│   │   └── [userId]/
│   ├── quickstart/
│   └── training/                # トレーニング関連をまとめる
│       ├── flexibility/
│       │   └── [id]/
│       ├── core/
│       │   └── [id]/
│       ├── warmup/
│       │   └── [id]/
│       └── cooldown/
│           └── [id]/
│
└── admin/                       # 管理画面（/admin プレフィックス）
    ├── layout.tsx              # 管理画面用レイアウト（サイドバー付き）
    ├── page.tsx                # /admin (ダッシュボード)
    ├── users/                  # ユーザー管理
    │   └── [userId]/
    ├── training-evaluations/   # トレーニング評価管理
    ├── test-results/           # テスト結果管理（/test-results から移動）
    │   └── [userId]/
    └── physical-test-results/   # テスト結果表示（/physical-test-results から移動）
        └── [userId]/
```

## コンポーネント構造の提案

```
frontend/src/components/
├── common/                      # 共通コンポーネント
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Container.tsx
│
├── user/                        # ユーザー画面用
│   ├── TrainingCard.tsx
│   ├── TrainingDetail.tsx
│   └── ...
│
├── admin/                       # 管理画面用
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   ├── UserForm.tsx
│   ├── UserList.tsx
│   ├── ResultForm.tsx
│   └── ResultList.tsx
│
└── ui/                          # UIコンポーネント（共通）
    ├── button.tsx
    ├── card.tsx
    └── ...
```

## 認証・権限管理の提案

```typescript
// hooks/useAdminAuth.ts
export const useAdminAuth = () => {
  // Firebase認証で管理者かどうかをチェック
  // 管理者フラグを確認
};

// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  const isAdmin = useAdminAuth();
  if (!isAdmin) {
    redirect('/login?error=unauthorized');
  }
  return (
    <>
      <AdminSidebar />
      <AdminHeader />
      {children}
    </>
  );
}
```

## 移行の優先順位

### Phase 1: 構造の準備
1. Route Groups `(user)`, `(auth)` を作成
2. 各グループにlayout.tsxを作成
3. 既存ページを移動（URLは変わらない）

### Phase 2: 管理画面の整理
1. `/test-results` → `/admin/test-results` に移動
2. `/physical-test-results` → `/admin/physical-test-results` に移動
3. 管理画面用レイアウトを作成
4. リダイレクトを設定（既存URLの互換性）

### Phase 3: コンポーネントの整理
1. 管理画面用コンポーネントを `components/admin/` に移動
2. ユーザー画面用コンポーネントを `components/user/` に整理
3. 共通コンポーネントを `components/common/` に整理

### Phase 4: 認証・権限の強化
1. 管理者認証フックを作成
2. 管理画面のレイアウトで権限チェック
3. エラーハンドリングの追加

