# frontend2/Dockerfile
# ベースイメージとして Node.js を使用
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションをビルド (必要な場合)
RUN npm run build

# 起動コマンドを設定
CMD ["npm", "run", "dev"]

# 開発用ポートを公開
EXPOSE 3000