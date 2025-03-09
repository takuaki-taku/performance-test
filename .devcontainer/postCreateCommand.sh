#!/bin/bash

# backendの依存関係をインストール
pip install -r ./backend/requirements.txt

# frontend2の依存関係をインストール
cd ./frontend2
npm install
cd ..