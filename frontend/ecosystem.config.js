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
