## 開発サーバー起動メモ（Dev Container）

### バックエンド（FastAPI / Uvicorn）

起動:

```bash
cd /workspaces/Perf_test
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

アクセス:
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

補足:
- DB は `backend/main.py` の `DATABASE_URL = "sqlite:///./backend/test.db"` を利用。
- ルートに誤作成された `test.db` は削除可。

---

### フロントエンド（Next.js / Turbopack を pm2 常駐）

初回（または再設定）:

```bash
cd /workspaces/Perf_test/frontend
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "next-dev",
      script: "bash",
      args: ["-lc", "PORT=3000 NEXT_DISABLE_TURBOPACK=0 npx next@15.2.1 dev --turbopack --port 3000"],
      time: true,
      env: { PORT: "3000" }
    }
  ]
};
EOF
```

起動/停止/再起動/ログ:

```bash
cd /workspaces/Perf_test/frontend
npx pm2 start ecosystem.config.js --only next-dev --update-env
npx pm2 status next-dev
npx pm2 logs next-dev
npx pm2 restart next-dev
npx pm2 stop next-dev
```

アクセス:
- トップ: http://localhost:3000
- マイページ: http://localhost:3000/mypage

環境変数（Firebase 認証用 例）:

```env
# frontend/.env.local に設定
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
```

---

### うまく表示できない時のチェックリスト

- ポート 3000 が待ち受けているか
  - `npx pm2 status next-dev` で online か確認
  - `npx pm2 logs next-dev` でエラーを確認

- ビルドキャッシュをクリア
  - `rm -rf /workspaces/Perf_test/frontend/.next`
  - `npx pm2 restart next-dev`

- Turbopack が不安定な場合の回避（Webpack モード）
  - 一時的に `NEXT_DISABLE_TURBOPACK=1 next dev` で起動

- Next.js のクライアントコンポーネント指定
  - React の `useEffect`/`useRouter` 等を使うファイルは先頭に `"use client"` を付与

---

### ワンライナーで疎通確認

```bash
curl -sS -D - http://127.0.0.1:3000/ -o /dev/null
curl -sS -D - http://127.0.0.1:3000/mypage -o /dev/null
curl -sS -D - http://127.0.0.1:8000/openapi.json -o /dev/null
```

---

## TODO（認証まわり・本番向け強化）

- [ ] firebase-admin を導入し、サーバーで ID トークンを厳密検証（署名/iss/aud/exp）
  - 依存追加: `firebase-admin`
  - サービスアカウント鍵の安全な配置と環境変数（`GOOGLE_APPLICATION_CREDENTIALS`）設定
  - `FIREBASE_VERIFY=true` 時は `verify_id_token()` を使用、`false` は開発用スキップ
- [ ] `/me` 以外の個人データAPIにも認証・認可チェックを適用
  - 原則: `path_user_id == me.user.id` を満たす場合のみ許可
- [ ] `/mypage` 初期化時に `/me` を呼び、取得した `userId` をローカル保存して既存APIに連携
- [ ] README/運用メモ更新（環境変数、鍵配置、起動手順の本番/開発切替）


