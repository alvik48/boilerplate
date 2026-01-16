/**
 * PM2 Ecosystem Configuration
 *
 * Production deployment configuration for the app monorepo.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs               # Start all apps
 *   pm2 start ecosystem.config.cjs --only {app}  # Start only API
 *   pm2 restart ecosystem.config.cjs             # Restart all apps
 *   pm2 stop ecosystem.config.cjs                # Stop all apps
 *   pm2 delete ecosystem.config.cjs              # Remove all apps from PM2
 *   pm2 logs                                     # View all logs
 *   pm2 monit                                    # Monitor apps
 */

module.exports = {
  apps: [
    {
      name: 'backend_core',
      cwd: './apps/backend.core',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3000,
        API_HOST: '127.0.0.1',
      },
      max_memory_restart: '500M',
      kill_timeout: 5000,
      restart_delay: 1000,
      error_file: `${__dirname}/logs/backend.core.error.log`,
      out_file: `${__dirname}/logs/backend.core.out.log`,
      merge_logs: true,
      time: true,
      watch: false,
    },
    {
      name: 'frontend_dashboard',
      cwd: './apps/frontend.dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100 -H 127.0.0.1',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3100,
        HOSTNAME: '127.0.0.1',
      },
      max_memory_restart: '500M',
      kill_timeout: 5000,
      restart_delay: 1000,
      error_file: `${__dirname}/logs/frontend.dashboard.error.log`,
      out_file: `${__dirname}/logs/frontend.dashboard.out.log`,
      merge_logs: true,
      time: true,
      watch: false,
    }
  ],
};
