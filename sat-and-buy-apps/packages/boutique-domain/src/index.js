"use strict";

const Boutique = require("./models/Boutique");
const BoutiqueFollower = require("./models/BoutiqueFollower");
const Post = require("./models/Post");
const PostLike = require("./models/PostLike");
const Comment = require("./models/Comment");
const BoutiqueOrder = require("./models/BoutiqueOrder");

module.exports = {
  models: {
    Boutique,
    BoutiqueFollower,
    Post,
    PostLike,
    Comment,
    BoutiqueOrder,
  },
  controllers: {
    boutique: require("./controllers/boutiqueController"),
    post: require("./controllers/postController"),
    comment: require("./controllers/commentController"),
    boutiqueOrder: require("./controllers/boutiqueOrderController"),
  },
};
