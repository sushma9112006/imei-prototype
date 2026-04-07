import express from "express";
import { devices, status } from "./db.js";
import { hash, createFingerprint } from "./crypto.js";

const router = express.Router();

// REGISTER
router.post("/register", (req, res) => {
  const { imei, model, manufacturer, os_type } = req.body;

  const imei_hash = hash(imei);

  if (devices.has(imei_hash)) {
    return res.status(409).json({ message: "Already registered" });
  }

  const fingerprint = createFingerprint({ imei, model, manufacturer, os_type });

  devices.set(imei_hash, { fingerprint });
  status.set(imei_hash, { stolen: false });

  res.json({ message: "Device registered" });
});

// VERIFY
router.post("/verify", (req, res) => {
  const { imei, model, manufacturer, os_type } = req.body;

  const imei_hash = hash(imei);

  if (!devices.has(imei_hash)) {
    return res.json({ status: "unregistered" });
  }

  const fingerprint = createFingerprint({ imei, model, manufacturer, os_type });
  const stored = devices.get(imei_hash);

  if (fingerprint !== stored.fingerprint) {
    return res.json({ status: "tampered" });
  }

  if (status.get(imei_hash).stolen) {
    return res.json({ status: "stolen" });
  }

  res.json({ status: "verified" });
});

// FLAG AS STOLEN
router.post("/flag", (req, res) => {
  const { imei } = req.body;

  const imei_hash = hash(imei);

  if (!status.has(imei_hash)) {
    return res.status(404).json({ message: "Device not found" });
  }

  status.get(imei_hash).stolen = true;

  res.json({ message: "Device flagged as stolen" });
});

export default router;
