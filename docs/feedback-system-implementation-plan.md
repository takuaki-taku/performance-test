# フィードバック機能実装プラン

## 📋 概要

指導者（コーチ）とユーザー（選手）が会話できるフィードバック機能の実装計画

## 🎯 目標

### 短期的目標（Phase 1）
- ✅ ユーザーがコーチにトレーニング実施を報告できる
- ✅ コーチがユーザーにフィードバック（コメント）を提供できる
- ✅ ユーザーがコーチのフィードバックを確認できる

### 長期的目標（Phase 2）
- トレーニングごとの会話機能
- リアルタイム通知
- LINE統合の検討

## 📊 現状分析

### 既存実装
- ✅ `UserTrainingResult`モデルに`comment`フィールドが存在
- ✅ APIエンドポイント（POST/PUT）でコメントの保存・更新が可能
- ✅ ユーザーがトレーニング実施時にメモを記録できる機能

### 不足している機能
- ❌ コーチがコメントを編集するUI
- ❌ ユーザーがコーチのコメントを確認するUI
- ❌ コメントの投稿者（ユーザー/コーチ）の区別
- ❌ 通知機能

## 🏗️ アーキテクチャ設計

### Phase 1: シンプルな報告・フィードバック機能

#### データモデル拡張案

**オプション1: 既存モデルを活用（推奨）**
```python
# UserTrainingResultモデルを拡張
class UserTrainingResult(Base):
    # 既存フィールド
    comment = Column(String, nullable=True)  # 既存
    
    # 追加フィールド
    user_comment = Column(String, nullable=True)  # ユーザーからの報告
    coach_comment = Column(String, nullable=True)  # コーチからのフィードバック
    coach_comment_at = Column(DateTime, nullable=True)  # コーチがコメントした日時
    coach_id = Column(GUID(), ForeignKey("users.id"), nullable=True)  # コメントしたコーチ
```

**オプション2: 別テーブルで管理（長期的）**
```python
class TrainingFeedback(Base):
    __tablename__ = "training_feedbacks"
    id = Column(Integer, primary_key=True)
    user_training_result_id = Column(Integer, ForeignKey("user_training_results.id"))
    sender_type = Column(String)  # "user" or "coach"
    sender_id = Column(GUID(), ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read_at = Column(DateTime, nullable=True)  # 既読管理
```

**推奨**: Phase 1では**オプション1**を採用（シンプルで実装が早い）

#### UI設計

**1. ユーザー側（トレーニング詳細ページ）**

```
[トレーニング詳細ページ]
├─ トレーニング情報
├─ タイマー
└─ 報告・フィードバックセクション
    ├─ [自分の報告]（既存のメモ機能を拡張）
    │   └─ テキストエリア + 送信ボタン
    │
    └─ [コーチからのフィードバック]（新規）
        ├─ フィードバック表示エリア
        ├─ 日時表示
        └─ 未読バッジ（新着フィードバックがある場合）
```

**2. コーチ側（管理画面）**

```
[管理画面 - トレーニング評価ページ]
├─ ユーザー一覧
└─ 各ユーザーのトレーニング結果
    ├─ 評価レベル
    ├─ [ユーザーの報告]（表示）
    └─ [コーチのフィードバック]（編集可能）
        └─ テキストエリア + 保存ボタン
```

**3. ユーザー側（マイページ）**

```
[マイページ]
├─ 進捗サマリー
└─ [フィードバック一覧]（新規セクション）
    ├─ 未読フィードバック数（バッジ）
    └─ フィードバックリスト
        ├─ トレーニング名
        ├─ 日付
        ├─ コーチのコメント
        └─ リンク（トレーニング詳細へ）
```

### Phase 2: トレーニングごとの会話機能（将来）

#### 設計案

**会話スレッド方式**
- 各トレーニング結果ごとに会話スレッドを作成
- メッセージの時系列表示
- 既読/未読管理
- 通知機能

**課題**
- 複雑性の増加
- UIの見やすさ（多数のトレーニングがある場合）
- パフォーマンス（大量のメッセージ）

**解決策**
- トレーニングごとに折りたたみ可能な会話UI
- ページネーション
- 検索・フィルタ機能

## 🔌 LINE統合の可能性

### メリット
1. **既存のコミュニケーションツールを活用**
   - ユーザーが既にLINEを使っている
   - 通知が確実に届く
   - プッシュ通知が簡単

2. **開発コストの削減**
   - チャットUIの実装が不要
   - 通知システムの実装が不要

3. **ユーザー体験の向上**
   - アプリを開かなくても通知を受け取れる
   - 既存のワークフローに統合

### 実装方法

#### オプション1: LINE Messaging API
```
[PerfDBアプリ]
    ↓ (トレーニング報告)
[バックエンドAPI]
    ↓ (通知)
[LINE Messaging API]
    ↓
[コーチのLINE]
```

**機能**:
- ユーザーがトレーニングを報告 → コーチにLINE通知
- コーチがLINEで返信 → PerfDBに反映

**実装手順**:
1. LINE Developersでアカウント作成
2. Messaging APIチャネル作成
3. Webhookエンドポイント実装
4. 通知送信機能実装

#### オプション2: LINEログイン + アプリ内通知
- LINEログインで認証
- アプリ内で通知表示
- LINEへの通知は送らない

### 課題・検討事項

1. **プライバシー**
   - LINE IDの管理
   - 個人情報の取り扱い

2. **コスト**
   - LINE Messaging APIの利用料金
   - 開発・保守コスト

3. **統合の複雑さ**
   - Webhookの実装
   - エラーハンドリング
   - セキュリティ

4. **ユーザー体験**
   - LINEとアプリの両方を使う必要がある
   - コンテキストの切り替え

### 推奨アプローチ

**段階的実装**:
1. **Phase 1**: アプリ内で完結するフィードバック機能を実装
2. **Phase 2**: ユーザー体験を評価
3. **Phase 3**: 必要に応じてLINE統合を検討

**判断基準**:
- ユーザーの使用頻度
- 通知の重要性
- 開発リソース

## 📝 実装計画

### Phase 1: シンプルな報告・フィードバック機能

#### Step 1: データベーススキーマ拡張

**マイグレーションスクリプト**:
```python
# scripts/migrations/add_feedback_fields.py
def upgrade():
    # user_training_resultsテーブルに追加
    op.add_column('user_training_results', 
                  sa.Column('user_comment', sa.String(), nullable=True))
    op.add_column('user_training_results', 
                  sa.Column('coach_comment', sa.String(), nullable=True))
    op.add_column('user_training_results', 
                  sa.Column('coach_comment_at', sa.DateTime(), nullable=True))
    op.add_column('user_training_results', 
                  sa.Column('coach_id', sa.String(), nullable=True))
```

#### Step 2: バックエンドAPI拡張

**スキーマ更新**:
```python
class UserTrainingResultBase(BaseModel):
    user_id: uuid.UUID
    training_id: int
    date: datetime.date
    achievement_level: int
    user_comment: Optional[str] = None  # 追加
    coach_comment: Optional[str] = None  # 追加
    coach_comment_at: Optional[datetime.datetime] = None  # 追加
    coach_id: Optional[uuid.UUID] = None  # 追加
```

**エンドポイント追加**:
```python
@router.put("/user-training-results/{result_id}/coach-comment")
def update_coach_comment(
    result_id: int,
    coach_comment: str,
    coach_id: uuid.UUID,  # 認証から取得
    db: Session = Depends(get_db)
):
    """コーチがフィードバックを追加・更新"""
    # 実装
```

#### Step 3: フロントエンド実装

**1. ユーザー側 - トレーニング詳細ページ**

```typescript
// frontend/src/app/(user)/training/[category]/[id]/page.tsx
// 既存の「今日の進捗」セクションを拡張

<section className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
  <h2 className="font-bold mb-2 text-sm">コーチへの報告</h2>
  <textarea
    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm mb-2"
    rows={3}
    placeholder="今日のトレーニングについて報告してください（例：何セットできたか、きつかった点など）"
    value={userComment}
    onChange={(e) => setUserComment(e.target.value)}
  />
  <button onClick={handleSaveUserComment}>
    報告を送信
  </button>
</section>

{coachComment && (
  <section className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h2 className="font-bold mb-2 text-sm">コーチからのフィードバック</h2>
    <p className="text-sm text-gray-700 whitespace-pre-line">
      {coachComment}
    </p>
    {coachCommentAt && (
      <p className="text-xs text-gray-500 mt-2">
        {new Date(coachCommentAt).toLocaleString('ja-JP')}
      </p>
    )}
  </section>
)}
```

**2. コーチ側 - 管理画面**

```typescript
// frontend/src/app/admin/training-evaluations/page.tsx
// 既存の評価テーブルにコメント欄を追加

<TableCell>
  {row.userComment && (
    <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
      <p className="font-semibold text-xs text-gray-600">ユーザーの報告:</p>
      <p className="text-gray-800">{row.userComment}</p>
    </div>
  )}
  <textarea
    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
    rows={2}
    placeholder="フィードバックを入力..."
    value={coachComments[row.trainingId] || row.coachComment || ''}
    onChange={(e) => handleCoachCommentChange(row.trainingId, e.target.value)}
  />
  <button onClick={() => handleSaveCoachComment(row)}>
    保存
  </button>
</TableCell>
```

**3. ユーザー側 - マイページ**

```typescript
// frontend/src/app/(user)/mypage/[userId]/page.tsx
// フィードバック一覧セクションを追加

<section className="mb-8">
  <h2 className="text-xl font-bold mb-4">
    コーチからのフィードバック
    {unreadCount > 0 && (
      <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
        {unreadCount}
      </span>
    )}
  </h2>
  {feedbacks.length === 0 ? (
    <p className="text-gray-500">フィードバックはまだありません</p>
  ) : (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <Link
          key={feedback.id}
          href={`/training/${getTrainingCategory(feedback.training.training_type)}/${feedback.training.id}`}
          className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {feedback.training.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(feedback.date).toLocaleDateString('ja-JP')}
              </p>
              {feedback.coach_comment && (
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                  {feedback.coach_comment}
                </p>
              )}
            </div>
            {!feedback.read_at && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                新着
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )}
</section>
```

### Phase 2: 会話機能（将来）

#### データモデル

```python
class TrainingConversation(Base):
    __tablename__ = "training_conversations"
    id = Column(Integer, primary_key=True)
    user_training_result_id = Column(Integer, ForeignKey("user_training_results.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("training_conversations.id"))
    sender_type = Column(String)  # "user" or "coach"
    sender_id = Column(GUID(), ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
```

## 🎨 UI/UX設計

### デザイン原則

1. **シンプルさ**
   - 複雑な機能は避ける
   - 一目で理解できるUI

2. **見やすさ**
   - ユーザーとコーチのコメントを視覚的に区別
   - 新着フィードバックを目立たせる

3. **アクセシビリティ**
   - モバイルファースト
   - タッチ操作に最適化

### カラースキーム

- **ユーザーのコメント**: グレー系（`bg-gray-50`）
- **コーチのコメント**: 青系（`bg-blue-50`）
- **新着バッジ**: 赤（`bg-red-500`）

## 📊 実装優先順位

### 高優先度（Phase 1 - 即座に実装）
1. ✅ データベーススキーマ拡張
2. ✅ バックエンドAPI拡張
3. ✅ コーチ側UI（フィードバック入力）
4. ✅ ユーザー側UI（フィードバック表示）

### 中優先度（Phase 1.5 - 次期実装）
1. 未読管理機能
2. 通知機能（アプリ内）
3. フィードバック一覧ページ

### 低優先度（Phase 2 - 将来検討）
1. 会話機能
2. LINE統合
3. リアルタイム通知

## 🔒 セキュリティ考慮事項

1. **認証・認可**
   - コーチのみがコメントを編集できる
   - ユーザーは自分のコメントのみ閲覧可能

2. **データ保護**
   - 個人情報の適切な管理
   - コメント内容の検証

3. **LINE統合時**
   - Webhookの署名検証
   - アクセストークンの安全な管理

## 📝 次のステップ

1. **設計レビュー**
   - このドキュメントをレビュー
   - フィードバックを収集

2. **実装開始**
   - Phase 1の実装を開始
   - 段階的に機能を追加

3. **ユーザーテスト**
   - ベータ版でテスト
   - フィードバックを収集

4. **改善・拡張**
   - ユーザーフィードバックに基づいて改善
   - Phase 2の検討

---

**作成日**: 2025年12月6日
**最終更新**: 2025年12月6日

