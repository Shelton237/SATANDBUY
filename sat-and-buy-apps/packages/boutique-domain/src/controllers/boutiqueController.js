"use strict";

const createError = require("http-errors");
const Boutique = require("../models/Boutique");
const BoutiqueFollower = require("../models/BoutiqueFollower");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createBoutique = async (req, res, next) => {
  try {
    const {
      name,
      description,
      businessType,
      email,
      phone,
      address,
      city,
      country,
      website,
      socialLinks,
      logo,
      coverImage,
    } = req.body;

    if (!name) throw createError(400, "Le nom de la boutique est requis.");

    const ownerId = req.user._id || req.user.id;

    const existing = await Boutique.findOne({ owner: ownerId });
    if (existing) {
      throw createError(409, "Vous avez déjà une boutique enregistrée.");
    }

    let slug = slugify(name);
    const slugExists = await Boutique.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const boutique = await Boutique.create({
      name,
      slug,
      description: description || "",
      businessType: businessType || "other",
      owner: ownerId,
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "Cameroun",
      website: website || "",
      socialLinks: socialLinks || {},
      logo: logo || "",
      coverImage: coverImage || "",
      status: "pending",
    });

    res.status(201).json({ boutique });
  } catch (err) {
    next(err);
  }
};

const getMyBoutique = async (req, res, next) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const boutique = await Boutique.findOne({ owner: ownerId });
    if (!boutique) {
      return res.status(404).json({ message: "Aucune boutique trouvée." });
    }
    res.json({ boutique });
  } catch (err) {
    next(err);
  }
};

const updateMyBoutique = async (req, res, next) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const boutique = await Boutique.findOne({ owner: ownerId });
    if (!boutique) throw createError(404, "Boutique introuvable.");

    const allowed = [
      "name",
      "description",
      "logo",
      "coverImage",
      "phone",
      "email",
      "address",
      "city",
      "country",
      "website",
      "socialLinks",
      "businessType",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        boutique[field] = req.body[field];
      }
    });

    if (req.body.name && req.body.name !== boutique.name) {
      let newSlug = slugify(req.body.name);
      const slugExists = await Boutique.findOne({
        slug: newSlug,
        _id: { $ne: boutique._id },
      });
      if (slugExists) newSlug = `${newSlug}-${Date.now()}`;
      boutique.slug = newSlug;
    }

    await boutique.save();
    res.json({ boutique });
  } catch (err) {
    next(err);
  }
};

const getBoutiqueBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const boutique = await Boutique.findOne({ slug, status: "active" });
    if (!boutique) throw createError(404, "Boutique introuvable.");

    let isFollowing = false;
    if (req.user) {
      const customerId = req.user._id || req.user.id;
      const follow = await BoutiqueFollower.findOne({
        boutiqueId: boutique._id,
        customerId,
      });
      isFollowing = !!follow;
    }

    res.json({ boutique, isFollowing });
  } catch (err) {
    next(err);
  }
};

const listBoutiques = async (req, res, next) => {
  try {
    const {
      businessType,
      city,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: "active" };
    if (businessType) query.businessType = businessType;
    if (city) query.city = new RegExp(city, "i");
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [boutiques, total] = await Promise.all([
      Boutique.find(query).sort({ followersCount: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Boutique.countDocuments(query),
    ]);

    res.json({
      boutiques,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const followBoutique = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id || req.user.id;

    const boutique = await Boutique.findById(id);
    if (!boutique) throw createError(404, "Boutique introuvable.");

    const existing = await BoutiqueFollower.findOne({ boutiqueId: id, customerId });
    if (existing) {
      await BoutiqueFollower.deleteOne({ boutiqueId: id, customerId });
      await Boutique.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });
      return res.json({ following: false, followersCount: boutique.followersCount - 1 });
    }

    await BoutiqueFollower.create({ boutiqueId: id, customerId });
    await Boutique.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });
    res.json({ following: true, followersCount: boutique.followersCount + 1 });
  } catch (err) {
    next(err);
  }
};

// ---- Admin endpoints ----

const adminListBoutiques = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [boutiques, total] = await Promise.all([
      Boutique.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Boutique.countDocuments(query),
    ]);

    res.json({ boutiques, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const adminUpdateBoutiqueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, verified } = req.body;

    const update = {};
    if (status) update.status = status;
    if (verified !== undefined) update.verified = verified;

    const boutique = await Boutique.findByIdAndUpdate(id, update, { new: true });
    if (!boutique) throw createError(404, "Boutique introuvable.");

    res.json({ boutique });
  } catch (err) {
    next(err);
  }
};

const adminDeleteBoutique = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Boutique.findByIdAndDelete(id);
    res.json({ message: "Boutique supprimée." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBoutique,
  getMyBoutique,
  updateMyBoutique,
  getBoutiqueBySlug,
  listBoutiques,
  followBoutique,
  adminListBoutiques,
  adminUpdateBoutiqueStatus,
  adminDeleteBoutique,
};
