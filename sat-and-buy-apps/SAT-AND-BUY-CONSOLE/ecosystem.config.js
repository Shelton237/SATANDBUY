module.exports = {
  apps: [{
    name: "sat-and-buy-console",
    script: "yarn",
    args: "run dev --host --port 4100",
    interpreter: "bash",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: 4100
    },
    error_file: "/var/log/pm2/sat-and-buy-console-error.log",
    out_file: "/var/log/pm2/sat-and-buy-console-out.log",
    log_file: "/var/log/pm2/sat-and-buy-console-combined.log",
    log_date_format: "YYYY-MM-DD HH:mm Z"
  }]
}