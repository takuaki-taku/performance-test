# プロジェクト構造の見直し提案：管理画面とユーザー画面の分離

## 現状の構造

```
frontend/src/app/
├── admin/                    # 管理画面（一部のみ）
│   └── training-evaluations/
├── test-results/            # 管理画面（テスト結果管理）
├── physical-test-results/   # 管理画面（テスト結果表示）
├── mypage/                  # ユーザー画面
├── karte/                   # ユーザー画面
├── flexibility/             # ユーザー画面
├── core/                    # ユーザー画面
├── warmup/                  # ユーザー画面
├── cooldown/                # ユーザー画面
├── quickstart/              # ユーザー画面
├── login/                   # 共通
├── signup/                  # 共通
└── page.tsx                 # ホーム（ユーザー向け）
```

## 問題点

1. **管理画面とユーザー画面が混在している**
   - `/test-results` が管理画面だが `/admin` 配下にない
   - `/physical-test-results` も管理画面だが別の場所

2. **認証・権限管理が不明確**
   - どのページが管理者専用か分かりにくい
   - ユーザーが誤って管理画面にアクセスする可能性

3. **レイアウトの違いが表現されていない**
   - 管理画面とユーザー画面で異なるレイアウトが必要な可能性

## 提案：分離案

### 案1: ディレクトリベースの分離（推奨）

```
frontend/src/app/
├── (auth)/                  # 認証関連（共通）
│   ├── login/
│   └── signup/
│
├── (user)/                  # ユーザー画面
│   ├── layout.tsx          # ユーザー用レイアウト
│   ├── page.tsx            # ホーム
│   ├── mypage/
│   │   └── [userId]/
│   ├── karte/
│   │   └── [userId]/
│   ├── quickstart/
│   └── training/           # トレーニング関連をまとめる
│       ├── flexibility/
│       ├── core/
│       ├── warmup/
│       └── cooldown/
│
└── (admin)/                 # 管理画面
    ├── layout.tsx          # 管理画面用レイアウト（サイドバーなど）
    ├── page.tsx            # 管理画面ダッシュボード
    ├── users/              # ユーザー管理
    │   └── [userId]/
    ├── training-evaluations/  # トレーニング評価管理
    ├── test-results/       # テスト結果管理
    │   └── [userId]/
    └── physical-test-results/  # テスト結果表示
        └── [userId]/
```

**メリット:**
- Next.jsのRoute Groups `(group)` を使用して論理的に分離
- 各グループに専用のlayout.tsxを配置可能
- URLパスは変わらない（`(user)`, `(admin)` はURLに含まれない）

### 案2: 完全なパス分離

```
frontend/src/app/
├── login/
├── signup/
├── page.tsx                 # ユーザー向けホーム
│
├── user/                    # ユーザー画面（/user プレフィックス）
│   ├── mypage/
│   ├── karte/
│   ├── quickstart/
│   └── training/
│
└── admin/                   # 管理画面（/admin プレフィックス）
    ├── page.tsx            # /admin
    ├── users/
    ├── training-evaluations/
    ├── test-results/
    └── physical-test-results/
```

**メリット:**
- URLで明確に分離される
- 認証ミドルウェアで `/admin/*` を保護しやすい

**デメリット:**
- 既存のURLが変わる（リダイレクトが必要）

### 案3: ハイブリッド（推奨度：中）

```
frontend/src/app/
├── (auth)/
│   ├── login/
│   └── signup/
│
├── (public)/                # 公開ページ
│   └── page.tsx            # ホーム
│
├── (user)/
│   ├── mypage/
│   ├── karte/
│   ├── quickstart/
│   └── training/
│
└── admin/                   # 管理画面は /admin プレフィックス
    ├── layout.tsx
    ├── page.tsx
    ├── users/
    ├── training-evaluations/
    ├── test-results/
    └── physical-test-results/
```

## 推奨：案1（Route Groups）

### 実装のメリット

1. **既存URLを維持**
   - `/mypage/[userId]` → `/mypage/[userId]` のまま
   - `/admin/training-evaluations` → `/admin/training-evaluations` のまま

2. **レイアウトの分離**
   ```tsx
   // app/(user)/layout.tsx
   export default function UserLayout({ children }) {
     return (
       <>
         <Header />  {/* ユーザー向けヘッダー */}
         {children}
         <Footer />
       </>
     );
   }
   
   // app/(admin)/layout.tsx
   export default function AdminLayout({ children }) {
     return (
       <>
         <AdminSidebar />  {/* 管理画面用サイドバー */}
         <Header />        {/* 管理画面用ヘッダー */}
         {children}
       </>
     );
   }
   ```

3. **認証・権限チェックの集約**
   ```tsx
   // app/(admin)/layout.tsx
   export default function AdminLayout({ children }) {
     const isAdmin = useAdminAuth();
     if (!isAdmin) redirect('/login');
     return <>{children}</>;
   }
   ```

4. **コンポーネントの整理**
   ```
   components/
   ├── user/              # ユーザー画面用コンポーネント
   │   ├── TrainingCard.tsx
   │   └── ...
   └── admin/             # 管理画面用コンポーネント
       ├── UserManagement.tsx
       └── ...
   ```

## 移行手順

1. **Route Groupsの作成**
   - `(user)` と `(admin)` ディレクトリを作成
   - 既存ページを移動

2. **レイアウトの分離**
   - 各グループにlayout.tsxを作成
   - 共通部分と専用部分を分離

3. **認証・権限チェックの実装**
   - 管理画面用の認証フックを作成
   - layout.tsxで権限チェック

4. **ヘッダー・ナビゲーションの分離**
   - ユーザー向けヘッダーと管理画面向けヘッダーを分離

5. **段階的な移行**
   - 一度に全部移行せず、ページごとに移行
   - 動作確認しながら進める

## 検討事項

1. **既存URLの維持**
   - Route Groupsを使えばURLは変わらない
   - 案2を選ぶ場合はリダイレクトが必要

2. **認証システム**
   - Firebase認証のロール管理
   - 管理者フラグの追加

3. **デザインの統一性**
   - 管理画面とユーザー画面でデザインシステムを統一
   - ただし、UIコンポーネントは共有

4. **パフォーマンス**
   - 管理画面とユーザー画面で異なるバンドルサイズ
   - コード分割の最適化

## 次のステップ

1. この提案をレビュー
2. 案1（Route Groups）で進めるか決定
3. 移行計画を立てる
4. 段階的に実装

