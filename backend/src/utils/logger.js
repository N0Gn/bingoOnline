function info(message, meta = {}) {
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[INFO] ${message}${payload}`);
}

function error(message, meta = {}) {
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  console.error(`[ERROR] ${message}${payload}`);
}

module.exports = { info, error };
