"use strict";

const sanitizeAdmin = (admin) => {
  if (!admin) return admin;
  const plain = admin.toObject ? admin.toObject() : { ...admin };
  delete plain.password;
  return plain;
};

module.exports = {
  sanitizeAdmin,
};
