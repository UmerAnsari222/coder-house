const Jimp = require("jimp");
const path = require("path");
const UserDot = require("../dtos/user-dto");
const userService = require("../services/user-service");
class ActivateController {
  async activate(req, res, next) {
    console.log("Run");
    const { name, avatar } = req.body;
    if (!name || !avatar) {
      res.status(400).json({ message: "All fields are required" });
    }
    // Buffer image
    const buffer = Buffer.from(
      avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );
    const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    try {
      const jimResp = await Jimp.read(buffer);
      jimResp
        .resize(150, Jimp.AUTO)
        .write(path.resolve(__dirname, `../storage/${imagePath}`));
    } catch (err) {
      res.status(500).json({ message: "Could not process the image" });
    }

    // update user
    const userId = req.user._id;
    console.log(userId);
    try {
      const user = await userService.findUser({ _id: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
      }
      user.activated = true;
      user.name = name;
      user.avatar = `/storage/${imagePath}`;
      user.save();
      // console.log(new UserDot(user));
      res.json({ user: new UserDot(user), auth: true });
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
}

module.exports = new ActivateController();
