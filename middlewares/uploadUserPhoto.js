const ImageService = require("../service/imageService");

exports.uploadUserPhoto = ImageService.upload("avatar");
