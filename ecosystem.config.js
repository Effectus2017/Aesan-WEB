module.exports = {
  apps: [{
    name: 'aesanweb',
    script: 'serve',
    env: {
      PM2_SERVE_PATH: '.',
      PM2_SERVE_PORT: process.env.PORT || 8080,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: './index.html'
    }
  }]
};
