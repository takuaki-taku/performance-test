FROM python:3.9-slim-buster

# Node.jsとnpmをインストール
RUN apt-get update && apt-get install -y curl gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# 必要に応じて他のツールやライブラリをインストール