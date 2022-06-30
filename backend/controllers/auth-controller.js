const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");
const UserDot = require("../dtos/user-dto");
class AuthController {
  async sendOtp(req, res, next) {
    //   Logic
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ message: "Phone filed is required!" });
    }
    // OTP
    const otp = await otpService.generateOtp();

    // HASH
    const ttl = 1000 * 60 * 2;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = hashService.hashOtp(data);

    // SEND OTP
    try {
      // await otpService.sendBySms(phone, otp);
      console.log(phone);
      return res.json({
        hash: `${hash}.${expires}`,
        phone: phone,
        otp,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Message sending failed" });
    }
  }
  async verifyOtp(req, res, next) {
    const { otp, hash, phone } = req.body;
    if (!otp || !hash || !phone) {
      res.status(400).json({ message: "All fields are required" });
    }
    const [hashedOtp, expires] = hash.split(".");
    if (Date.now() > +expires) {
      res.status(400).json({ message: "OTP expired" });
    }
    const data = `${phone}.${otp}.${expires}`;
    const isValid = await otpService.verifyOtp(hashedOtp, data);
    if (!isValid) {
      res.status(400).json({ message: "Invalid OTP" });
    }
    let user;
    try {
      user = await userService.findUser({ phone: phone });
      if (!user) {
        user = await userService.createUser({ phone: phone });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "DB error" });
    }
    // Token
    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: user._id,
      activated: false,
    });
    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDot(user);
    res.status(200).json({ user: userDto, auth: true });
  }
  async refresh(req, res, next) {
    // get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // check refresh token valid
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      res.status(401).json({ message: "Invalid Token" });
    }
    // check token in db
    try {
      const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal error" });
    }

    // check  user in db
    const user = await userService.findUser({ _id: userData._id });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({
      _id: userData._id,
    });

    try {
      const token = await tokenService.updateRefreshToken(
        userData._id,
        refreshToken
      );
    } catch (e) {
      res.status(500).json({ message: "Internal error" });
    }

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDot(user);
    console.log(userDto);
    res.status(200).json({ user: userDto, auth: true });
  }

  async logout(req, res) {
    const { refreshToken } = req.cookies;
    await tokenService.removeToken(refreshToken);
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({ user: null, auth: false });
  }
}

module.exports = new AuthController();
