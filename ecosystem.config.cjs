module.exports = {
  apps: [
    {
      name: 'museflow-v4',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=museflow-production --local --ip 0.0.0.0 --port 3000 --compatibility-date=2024-01-01',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
