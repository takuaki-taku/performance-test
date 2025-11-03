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


