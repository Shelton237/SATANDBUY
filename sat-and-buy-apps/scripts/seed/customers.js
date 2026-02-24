"use strict";

const { authSeeds } = require("./data");
const { withServiceDatabase } = require("./utils");

const seedCustomersOnly = async () => {
  const Customer = require("../../services/auth-service/src/models/Customer");

  await withServiceDatabase("auth", async () => {
    await Customer.deleteMany({});
    await Customer.insertMany(authSeeds.customers);

    console.log(
      `Clients rafraîchis: ${authSeeds.customers.length} enregistrements.`
    );
  });
};

seedCustomersOnly().catch((err) => {
  console.error("Seed customers échoué:", err);
  process.exitCode = 1;
});
