module.exports = {
  apps: [
    {
      name: 'erp-backend',
      script: 'src/server.js',
      cwd: './backend',
      instances: 1, // Single instance fork mode ensures seamless Socket.IO handshakes
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5092,
        CORS_ORIGINS: 'https://app.monsuralitravels.com,https://admin.monsuralitravels.com,https://dashboard.monsuralitravels.com'
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
