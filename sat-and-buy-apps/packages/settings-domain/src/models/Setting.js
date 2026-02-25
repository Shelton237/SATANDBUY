let sharedLib = null;
try {
  sharedLib = require("@satandbuy/shared");
} catch (err) {
  try {
    sharedLib = require("../../shared");
  } catch (inner) {
    sharedLib = null;
  }
}

const mongoose = sharedLib
  ? sharedLib.mongo.mongoose
  : require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    setting: {},
  },
  {
    timestamps: true,
  }
);

// module.exports = settingSchema;

module.exports =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
