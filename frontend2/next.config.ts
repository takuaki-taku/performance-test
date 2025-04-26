const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ビルド時の ESLint エラーを無視する
    ignoreDuringBuilds: true,
  },
  // pagesDir: 'pages', // pages ディレクトリを使用しない場合はコメントアウトまたは削除
  env: {
    API_URL: process.env.API_URL,
  },
};

module.exports = nextConfig;