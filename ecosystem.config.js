module.exports = {
  apps: [
    {
      name: 'erp-backend',
      script: 'src/server.js',
      cwd: './backend',
      instances: 'max', // or 1 for single-thread
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        CORS_ORIGINS: 'https://app.monsuralitravels.com,https://admin.monsuralitravels.com'
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '../logs/pm2-backend-error.log',
      out_file: '../logs/pm2-backend-out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
