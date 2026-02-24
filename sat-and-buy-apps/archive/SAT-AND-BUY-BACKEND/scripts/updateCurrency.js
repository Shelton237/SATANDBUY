require("dotenv").config({ path: "../.env" });
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");
(async () => {
  await connectDB();
  const res = await Setting.updateOne(
    { name: "globalSetting" },
    { $set: { "setting.default_currency": "FCFA" } }
  );
  const doc = await Setting.findOne(
    { name: "globalSetting" },
    { "setting.default_currency": 1, _id: 0 }
  );
  console.log("update result", res);
  console.log("Current default_currency:", doc?.setting?.default_currency);
  process.exit();
})();
