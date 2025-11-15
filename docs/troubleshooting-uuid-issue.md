# UUID表示問題のトラブルシューティング

## 問題
デプロイ後にmypageのURLパスがUUIDではなく数値（例: `4`）で表示される

## 原因の可能性

### 1. localStorageに古い数値のuserIdが残っている（最も可能性が高い）
- ブラウザのlocalStorageに古いInteger型のuserId（例: `4`）が保存されている
- ログインし直しても、既存のユーザーがfirebase_uidで見つかった場合、古いIDが返される可能性がある

### 2. バックエンドのデプロイが完了していない
- バックエンドがまだUUID対応のコードでデプロイされていない
- `/me`エンドポイントがまだInteger型のIDを返している

### 3. フロントエンドのデプロイが完了していない
- フロントエンドがまだUUID対応のコードでデプロイされていない
- 古いコードがNumber()変換を実行している

## 解決方法

### 方法1: localStorageをクリア（推奨）
1. ブラウザの開発者ツールを開く（F12）
2. Applicationタブ（Chrome）またはStorageタブ（Firefox）を開く
3. Local Storageを選択
4. サイトのドメインを選択
5. `userId`キーを削除
6. ページをリロードして再ログイン

### 方法2: プログラムでlocalStorageをクリア
```javascript
// ブラウザのコンソールで実行
localStorage.removeItem('userId');
location.reload();
```

### 方法3: シークレットモードで確認
- シークレットモードでアプリを開く
- 新規ログインしてUUIDが正しく表示されるか確認

## 確認方法

### 1. localStorageの確認
```javascript
// ブラウザのコンソールで実行
console.log('userId:', localStorage.getItem('userId'));
console.log('型:', typeof localStorage.getItem('userId'));
```

### 2. /meエンドポイントの確認
- ネットワークタブで`/me`エンドポイントのレスポンスを確認
- `id`フィールドがUUID文字列（例: `9e9c8034-970a-4d52-8354-d08821f298f5`）になっているか確認

### 3. バックエンドの確認
- バックエンドのログで`/me`エンドポイントが呼ばれているか確認
- 返される`id`の形式を確認

## 根本的な解決策

### フロントエンドにlocalStorageの検証を追加
ログイン時にlocalStorageのuserIdが数値形式（古い形式）の場合は削除する：

```typescript
// login/page.tsx などに追加
const oldUserId = localStorage.getItem('userId');
if (oldUserId && !isNaN(Number(oldUserId))) {
  // 古い数値形式のuserIdを削除
  localStorage.removeItem('userId');
}
```

## 注意事項
- 既存のユーザーはマイグレーション済みでUUIDになっているはず
- 新しいユーザーは自動的にUUIDが割り当てられる
- 問題が続く場合は、バックエンドとフロントエンドのデプロイ状況を確認

