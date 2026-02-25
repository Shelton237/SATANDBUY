let mongoose;
try {
  const { mongo } = require("@satandbuy/shared");
  mongoose = mongo.mongoose;
} catch (err) {
  mongoose = require("mongoose");
}

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
