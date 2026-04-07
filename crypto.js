import crypto from "crypto";

export function hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function createFingerprint({ imei, model, manufacturer, os_type }) {
  const raw = `${imei}|${model}|${manufacturer}|${os_type}`;
  return hash(raw);
}
