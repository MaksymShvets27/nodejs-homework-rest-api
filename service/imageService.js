const path = require("path");
const fse = require("fs-extra");
const multer = require("multer");
const uuid = require("uuid").v4;

const { AppError } = require("./appError");
const Jimp = require("jimp");

class ImageService {
  static upload(name) {
    const multerStorage = multer.memoryStorage();

    const multerFilter = (req, file, callBackFunc) => {
      if (file.mimetype.startsWith("image")) {
        callBackFunc(null, true);
      } else {
        callBackFunc(new AppError(400, "Please upload images only.."), false);
      }
    };

    return multer({
      storage: multerStorage,
      fileFilter: multerFilter,
    }).single(name);
  }

  static async save({ buffer }, w, h, ...pathSegments) {
    const fileName = `${uuid()}.jpeg`;
    const fullFilePath = path.join(process.cwd(), "public", ...pathSegments);
    console.log(fullFilePath);
    await fse.ensureDir(fullFilePath);

    Jimp.read(buffer)
      .then((buffer) => {
        return buffer
          .resize(w, h) // resize
          .quality(60) // set JPEG quality
          .write(path.join(fullFilePath, fileName)); // save
      })
      .catch((err) => {
        console.error(err);
      });

    return path.join(...pathSegments, fileName);
  }
}

module.exports = ImageService;
