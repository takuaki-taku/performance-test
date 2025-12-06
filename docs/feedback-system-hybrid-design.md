# フィードバック機能ハイブリッド設計

## 📋 概要

LINEチャットとアプリ内フィードバックを組み合わせたハイブリッドアプローチの設計

## 🎯 設計コンセプト

### 2つのコミュニケーション層

1. **LINEチャット層（非構造化・フリー）**
   - フィードバック通知
   - 大きな会話・フリーの相談
   - 日常的なコミュニケーション

2. **アプリ内フィードバック層（構造化・トレーニング単位）**
   - トレーニングごとの詳細な評価
   - チャット形式の履歴
   - 進捗の記録

## 🏗️ データモデル設計

### オプション1: 別テーブルで管理（推奨）⭐⭐⭐⭐⭐

**メリット**:
- ✅ 正規化された設計
- ✅ クエリが高速（インデックス活用）
- ✅ スケーラブル
- ✅ データの整合性が保たれる
- ✅ 既読管理が容易

**デメリット**:
- ⚠️ テーブル数が増える
- ⚠️ JOINが必要

**実装**:

```python
class UserTrainingResult(Base):
    """ユーザーのトレーニング実施結果（既存）"""
    __tablename__ = "user_training_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), index=True, nullable=False)
    training_id = Column(Integer, ForeignKey("trainings.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    achievement_level = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)  # 既存（後方互換性のため残す）
    
    # リレーション
    feedback_messages = relationship("TrainingFeedbackMessage", 
                                    back_populates="training_result",
                                    order_by="TrainingFeedbackMessage.created_at")


class TrainingFeedbackMessage(Base):
    """トレーニングごとのフィードバックメッセージ（チャット形式）"""
    __tablename__ = "training_feedback_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_training_result_id = Column(Integer, 
                                     ForeignKey("user_training_results.id", ondelete="CASCADE"),
                                     nullable=False, 
                                     index=True)
    
    # 送信者情報
    sender_type = Column(String, nullable=False, index=True)  # "user" or "coach"
    sender_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    
    # メッセージ内容
    message = Column(Text, nullable=False)  # メッセージ本文
    message_type = Column(String, nullable=False, default="text")  # "text", "question", "feedback", "progress"
    
    # メタデータ
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, 
                       onupdate=datetime.datetime.utcnow)
    
    # 既読管理
    read_at = Column(DateTime, nullable=True)
    read_by = Column(GUID(), ForeignKey("users.id"), nullable=True)
    
    # リレーション
    training_result = relationship("UserTrainingResult", back_populates="feedback_messages")
    sender = relationship("User", foreign_keys=[sender_id])
```

**インデックス戦略**:
```python
# 高速なクエリのための複合インデックス
Index('idx_feedback_result_created', 'user_training_result_id', 'created_at')
Index('idx_feedback_user_unread', 'user_training_result_id', 'sender_type', 'read_at')
```

### オプション2: JSONB配列で管理 ⭐⭐⭐

**メリット**:
- ✅ 1つのテーブルで完結
- ✅ JOINが不要
- ✅ 柔軟な構造

**デメリット**:
- ❌ クエリが複雑（JSONB操作が必要）
- ❌ インデックスの制約
- ❌ データの整合性チェックが困難
- ❌ スケーラビリティの問題（配列が大きくなると遅い）

**実装**:

```python
from sqlalchemy.dialects.postgresql import JSONB

class UserTrainingResult(Base):
    __tablename__ = "user_training_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), index=True, nullable=False)
    training_id = Column(Integer, ForeignKey("trainings.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    achievement_level = Column(Integer, nullable=False)
    
    # JSONB配列でメッセージを保存
    feedback_messages = Column(JSONB, nullable=True, default=list)
    
    # 例: feedback_messages = [
    #   {
    #     "id": 1,
    #     "sender_type": "user",
    #     "sender_id": "uuid",
    #     "message": "今日は3セットできました",
    #     "message_type": "progress",
    #     "created_at": "2025-12-06T10:00:00Z",
    #     "read_at": null
    #   },
    #   {
    #     "id": 2,
    #     "sender_type": "coach",
    #     "sender_id": "uuid",
    #     "message": "素晴らしい！次は4セットに挑戦してみましょう",
    #     "message_type": "feedback",
    #     "created_at": "2025-12-06T11:00:00Z",
    #     "read_at": "2025-12-06T12:00:00Z"
    #   }
    # ]
```

**クエリ例**:
```python
# 未読メッセージを取得（複雑）
from sqlalchemy import func, cast, String

# PostgreSQLのJSONB操作が必要
query = db.query(UserTrainingResult).filter(
    func.jsonb_array_length(UserTrainingResult.feedback_messages) > 0
)
```

### オプション3: ハイブリッド（JSONB + 別テーブル）⭐⭐⭐⭐

**メリット**:
- ✅ 最新メッセージをJSONBで保持（高速アクセス）
- ✅ 全履歴を別テーブルで保持（スケーラブル）
- ✅ 両方のメリットを享受

**デメリット**:
- ⚠️ データの二重管理
- ⚠️ 同期が必要

**実装**:

```python
class UserTrainingResult(Base):
    __tablename__ = "user_training_results"
    id = Column(Integer, primary_key=True, index=True)
    # ... 既存フィールド
    
    # 最新3件のメッセージをJSONBで保持（UI表示用）
    recent_messages = Column(JSONB, nullable=True, default=list)
    
    # 全履歴は別テーブルで管理
    feedback_messages = relationship("TrainingFeedbackMessage", ...)
```

## 🎯 推奨設計: オプション1（別テーブル）

### 理由

1. **パフォーマンス**
   - インデックスを活用した高速クエリ
   - 大量のメッセージでもスケール

2. **データ整合性**
   - 外部キー制約で整合性を保証
   - トランザクション管理が容易

3. **クエリの柔軟性**
   - 複雑な検索・フィルタが容易
   - 集計クエリが書きやすい

4. **保守性**
   - スキーマ変更が容易
   - デバッグが容易

### データ構造

```
UserTrainingResult (1) ──→ (N) TrainingFeedbackMessage
     │
     └─ achievement_level: 評価レベル
     └─ date: 実施日
```

### メッセージタイプ

```python
class MessageType(enum.Enum):
    TEXT = "text"           # 通常のメッセージ
    QUESTION = "question"    # ユーザーの質問
    FEEDBACK = "feedback"   # コーチのフィードバック
    PROGRESS = "progress"   # ユーザーの進捗報告
    ANSWER = "answer"       # コーチの回答
```

## 📊 データフロー設計

### 1. LINEチャット → アプリ連携

```
[LINEチャット]
  ↓ (ユーザーがトレーニング報告)
[LINE Bot]
  ↓ (Webhook)
[バックエンドAPI]
  ↓
[UserTrainingResult作成]
  ↓
[TrainingFeedbackMessage作成（sender_type="user"）]
  ↓
[コーチにLINE通知]
```

### 2. アプリ内フィードバック

```
[トレーニング詳細ページ]
  ↓ (ユーザーがメッセージ送信)
[フロントエンド]
  ↓ (POST /api/training-feedback-messages)
[バックエンドAPI]
  ↓
[TrainingFeedbackMessage作成]
  ↓
[コーチに通知（アプリ内 or LINE）]
```

### 3. コーチのフィードバック

```
[管理画面]
  ↓ (コーチがフィードバック送信)
[フロントエンド]
  ↓ (POST /api/training-feedback-messages)
[バックエンドAPI]
  ↓
[TrainingFeedbackMessage作成（sender_type="coach"）]
  ↓
[ユーザーに通知（アプリ内 or LINE）]
```

## 🔌 LINE統合設計

### LINE Messaging API連携

```python
# backend/services/line_service.py
import requests
from typing import Optional

class LineService:
    def __init__(self):
        self.channel_access_token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
        self.api_url = "https://api.line.me/v2/bot/message/push"
    
    def send_notification(self, user_line_id: str, message: str):
        """LINE通知を送信"""
        headers = {
            "Authorization": f"Bearer {self.channel_access_token}",
            "Content-Type": "application/json"
        }
        data = {
            "to": user_line_id,
            "messages": [
                {
                    "type": "text",
                    "text": message
                }
            ]
        }
        response = requests.post(self.api_url, headers=headers, json=data)
        return response.json()
    
    def send_feedback_notification(self, user_line_id: str, training_title: str, coach_name: str):
        """フィードバック通知を送信"""
        message = f"【PerfDB】\n{coach_name}コーチからフィードバックが届きました！\n\nトレーニング: {training_title}\n\nアプリで確認してください: https://perfdb.app/mypage"
        return self.send_notification(user_line_id, message)
```

### データモデル拡張（LINE ID保存）

```python
class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)
    grade = Column(String)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    birthday = Column(Date, nullable=True)
    
    # LINE統合用
    line_user_id = Column(String, unique=True, index=True, nullable=True)  # LINE User ID
    line_notification_enabled = Column(Boolean, default=True)  # 通知有効/無効
    
    training_results = relationship("UserTrainingResult", back_populates="user")
```

## 📝 API設計

### エンドポイント

```python
# メッセージ一覧取得
GET /api/user-training-results/{result_id}/feedback-messages
Response: List[TrainingFeedbackMessageRead]

# メッセージ送信
POST /api/training-feedback-messages
Body: {
    "user_training_result_id": int,
    "sender_type": "user" | "coach",
    "message": str,
    "message_type": "text" | "question" | "feedback" | "progress" | "answer"
}
Response: TrainingFeedbackMessageRead

# 既読マーク
PUT /api/training-feedback-messages/{message_id}/read
Response: TrainingFeedbackMessageRead

# 未読メッセージ数取得
GET /api/users/{user_id}/unread-feedback-count
Response: { "count": int }
```

### スキーマ定義

```python
class TrainingFeedbackMessageBase(BaseModel):
    user_training_result_id: int
    sender_type: str  # "user" or "coach"
    message: str
    message_type: str = "text"

class TrainingFeedbackMessageCreate(TrainingFeedbackMessageBase):
    pass

class TrainingFeedbackMessageRead(TrainingFeedbackMessageBase):
    id: int
    sender_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    read_at: Optional[datetime.datetime]
    read_by: Optional[uuid.UUID]
    
    class Config:
        from_attributes = True
```

## 🎨 UI設計

### トレーニング詳細ページ（フィードバックセクション）

```typescript
// チャット形式のUI
<section className="mt-6 p-4 bg-gray-50 rounded-lg">
  <h2 className="font-bold mb-4">コーチとのやり取り</h2>
  
  <div className="space-y-3 max-h-96 overflow-y-auto">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs rounded-lg p-3 ${
            msg.sender_type === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{msg.message}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(msg.created_at).toLocaleString('ja-JP')}
          </p>
        </div>
      </div>
    ))}
  </div>
  
  <div className="mt-4">
    <textarea
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      rows={3}
      placeholder="メッセージを入力..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
    />
    <button
      onClick={handleSendMessage}
      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      送信
    </button>
  </div>
</section>
```

## 📊 パフォーマンス考慮

### クエリ最適化

```python
# メッセージ一覧取得（ページネーション付き）
@router.get("/user-training-results/{result_id}/feedback-messages")
def get_feedback_messages(
    result_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """フィードバックメッセージ一覧を取得（最新順）"""
    messages = db.query(TrainingFeedbackMessage)\
        .filter(TrainingFeedbackMessage.user_training_result_id == result_id)\
        .order_by(TrainingFeedbackMessage.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return messages
```

### インデックス戦略

```sql
-- 高速なクエリのためのインデックス
CREATE INDEX idx_feedback_result_created 
ON training_feedback_messages(user_training_result_id, created_at DESC);

CREATE INDEX idx_feedback_unread 
ON training_feedback_messages(user_training_result_id, sender_type, read_at) 
WHERE read_at IS NULL;

CREATE INDEX idx_feedback_sender 
ON training_feedback_messages(sender_id, created_at DESC);
```

## 🔒 セキュリティ考慮

1. **認証・認可**
   - ユーザーは自分のメッセージのみ閲覧可能
   - コーチは担当ユーザーのメッセージのみ閲覧可能

2. **入力検証**
   - メッセージ長の制限（例: 1000文字）
   - XSS対策（サニタイズ）

3. **LINE統合**
   - Webhook署名の検証
   - アクセストークンの安全な管理

## 📝 実装優先順位

### Phase 1: 基本機能
1. ✅ データベーススキーマ（別テーブル）
2. ✅ バックエンドAPI
3. ✅ フロントエンドUI（チャット形式）

### Phase 2: 通知機能
1. アプリ内通知
2. LINE通知（オプション）

### Phase 3: 高度な機能
1. 既読管理
2. メッセージ検索
3. ファイル添付（将来）

## 🎯 結論

**推奨データ保持方法**: **オプション1（別テーブル）**

**理由**:
- パフォーマンスが良い
- スケーラブル
- データ整合性が保たれる
- クエリが柔軟
- 保守性が高い

**JSONB配列は避けるべき理由**:
- 大量のメッセージでパフォーマンスが低下
- クエリが複雑
- データ整合性の管理が困難

---

**作成日**: 2025年12月6日
**最終更新**: 2025年12月6日

