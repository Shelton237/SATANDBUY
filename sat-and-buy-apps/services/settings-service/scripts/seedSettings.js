#!/usr/bin/env node
/**
 * Seeder pour injecter les paramètres indispensables
 * (globalSetting, storeSetting, storeCustomizationSetting)
 * dans la base Mongo utilisée par le service Settings.
 *
 * Usage basique :
 *    node services/settings-service/scripts/seedSettings.js
 *
 * Options utiles :
 *    --env=path/vers/.env              (pour charger un fichier d'environnement spécifique)
 *    --seedFile=chemin/vers/settings   (pour surcharger les données seed par défaut)
 *
 * Variables d'environnement attendues :
 *    MONGO_URI (obligatoire)
 *    MONGO_DB  (obligatoire si absent de l'URI)
 *    MONGO_USER / MONGO_PASSWORD (optionnelles)
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const dotenv = require("dotenv");
const shared = require("@satandbuy/shared");
const Setting = require("../../../packages/settings-domain/src/models/Setting");

const DEFAULT_ENV_FILE = path.resolve(
  __dirname,
  "../../env/settings-service.prod.env"
);
const DEFAULT_SEED_FILE = path.resolve(
  __dirname,
  "../../../archive/SAT-AND-BUY-BACKEND/utils/settings.js"
);
const FRONTEND_CUSTOMIZATION_FILE = path.resolve(
  __dirname,
  "../../../SAT-AND-BUY-STORE/src/utils/storeCustomizationSetting.js"
);

const getArgValue = (key) => {
  const prefix = `--${key}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  return raw ? raw.slice(prefix.length) : null;
};

const loadEnvFile = () => {
  const candidates = [
    getArgValue("env"),
    process.env.SETTINGS_ENV_FILE,
    path.resolve(__dirname, "../.env"),
    DEFAULT_ENV_FILE,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      console.log(`[seed] Variables chargées depuis ${candidate}`);
      return;
    }
  }

  console.warn(
    "[seed] Aucun fichier .env trouvé, on suppose que les variables sont déjà définies."
  );
};

const loadLegacySeedEntries = (overridePath) => {
  const resolved =
    overridePath ||
    process.env.SETTINGS_SEED_FILE ||
    DEFAULT_SEED_FILE;

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `[seed] Impossible de trouver le fichier seed: ${resolved}`
    );
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const entries = require(resolved);
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(
      `[seed] Le seed file (${resolved}) ne contient aucun enregistrement`
    );
  }

  console.log(`[seed] Données seed chargées depuis ${resolved}`);
  return entries.map((entry) => ({
    ...entry,
    setting: JSON.parse(JSON.stringify(entry.setting || {})),
  }));
};

const loadFrontendCustomization = async () => {
  try {
    if (!fs.existsSync(FRONTEND_CUSTOMIZATION_FILE)) {
      return null;
    }
    const moduleUrl = pathToFileURL(FRONTEND_CUSTOMIZATION_FILE).href;
    const { storeCustomization } = await import(moduleUrl);
    const payload = storeCustomization?.setting;
    if (payload && typeof payload === "object") {
      console.log(
        "[seed] Personnalisation storefront chargée depuis SAT-AND-BUY-STORE"
      );
      return JSON.parse(JSON.stringify(payload));
    }
  } catch (err) {
    console.warn(
      "[seed] Impossible de charger la personnalisation depuis le frontend:",
      err.message
    );
  }
  return null;
};

const upsertSetting = async (name, setting) => {
  if (!setting) {
    console.warn(`[seed] Ignoré ${name} (pas de données)`);
    return;
  }

  await Setting.findOneAndUpdate(
    { name },
    { setting, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`[seed] ${name} synchronisé`);
};

const run = async () => {
  loadEnvFile();

  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;

  if (!mongoUri) {
    throw new Error("MONGO_URI est requis pour lancer le seed");
  }

  const mongo = shared.mongo;
  await mongo.createMongoConnection(mongoUri, {
    dbName,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  });
  console.log("[seed] Connexion Mongo établie");

  const legacySeed = loadLegacySeedEntries(getArgValue("seedFile"));
  const customizationPayload = await loadFrontendCustomization();

  if (customizationPayload) {
    const customizationEntry = legacySeed.find(
      (entry) => entry.name === "storeCustomizationSetting"
    );
    if (customizationEntry) {
      customizationEntry.setting = customizationPayload;
    } else {
      legacySeed.push({
        name: "storeCustomizationSetting",
        setting: customizationPayload,
      });
    }
  }

  for (const entry of legacySeed) {
    await upsertSetting(entry.name, entry.setting);
  }

  await mongo.mongoose.connection.close();
  console.log("[seed] Terminé ✅");
};

run().catch((err) => {
  console.error("[seed] Erreur:", err);
  process.exitCode = 1;
  if (shared?.mongo?.mongoose?.connection?.readyState === 1) {
    shared.mongo.mongoose.connection.close();
  }
});
