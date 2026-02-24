"use strict";

const Product = require("../models/Product");

/**
 * Diminue le stock des produits et incrémente les ventes
 * lorsqu'une commande est confirmée.
 * @param {Array} cart
 */
const handleProductQuantity = async (cart = []) => {
  try {
    for (const item of cart) {
      if (!item || !item._id) continue;

      if (item?.isCombination) {
        await Product.updateOne(
          {
            _id: item._id,
            "variants.productId": item?.variant?.productId || "",
          },
          {
            $inc: {
              stock: -item.quantity,
              "variants.$.quantity": -item.quantity,
              sales: item.quantity,
            },
          }
        );
      } else {
        await Product.updateOne(
          { _id: item._id },
          {
            $inc: {
              stock: -item.quantity,
              sales: item.quantity,
            },
          }
        );
      }
    }
  } catch (error) {
    console.error("[catalog-domain] handleProductQuantity error", error.message);
  }
};

/**
 * Supprime les valeurs d'attribut sur les variantes
 * lorsqu'un attribut est supprimé.
 * @param {string} key
 * @param {string|string[]} value
 * @param {boolean} multi
 */
const handleProductAttribute = async (key, value, multi = false) => {
  try {
    const filter = { isCombination: true };

    if (multi && Array.isArray(value)) {
      await Product.updateMany(filter, {
        $pull: { variants: { [key]: { $in: value } } },
      });
    } else {
      await Product.updateMany(filter, {
        $pull: { variants: { [key]: value } },
      });
    }
  } catch (error) {
    console.error(
      "[catalog-domain] handleProductAttribute error",
      error.message
    );
  }
};

module.exports = {
  handleProductQuantity,
  handleProductAttribute,
};
