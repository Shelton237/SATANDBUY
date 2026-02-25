const { mongo } = require("@satandbuy/shared");
const mongoose = mongo.mongoose;

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

module.exports = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
