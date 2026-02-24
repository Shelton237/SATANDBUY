const shared = require("@satandbuy/shared");

const { STAFF_ROLES = [] } =
  (shared && shared.constants && shared.constants.roles) || {};

if (!Array.isArray(STAFF_ROLES) || !STAFF_ROLES.length) {
  throw new Error(
    "[order-domain] Impossible de charger STAFF_ROLES depuis @satandbuy/shared/constants/roles"
  );
}

module.exports = {
  STAFF_ROLES,
};
