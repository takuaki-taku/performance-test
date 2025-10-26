FROM ubuntu:22.04

# 必要なツールをインストール
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# タイムゾーン設定（対話式プロンプトを回避）
ENV DEBIAN_FRONTEND=noninteractive