const jwt = require("jsonwebtoken");
const RefreshModel = require("../models/refresh-model");

const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "1y",
    });
    return { accessToken, refreshToken };
  }
  async storeRefreshToken(token, userId) {
    try {
      await RefreshModel.create({
        token,
        userId,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async verifyAccessToken(token) {
    return jwt.verify(token, accessTokenSecret);
  }
  async verifyRefreshToken(refreshToken) {
    const verifyToken = await jwt.verify(refreshToken, refreshTokenSecret);
    return verifyToken;
  }
  async findRefreshToken(userId, refreshToken) {
    const token = await RefreshModel.findOne({
      userId: userId,
      token: refreshToken,
    });
    return token;
  }

  async updateRefreshToken(userId, refreshToken) {
    const token = await RefreshModel.updateOne(
      { userId: userId },
      { token: refreshToken }
    );
    return token;
  }

  async removeToken(refreshToken) {
    return await RefreshModel.deleteOne({ token: refreshToken });
  }
}

module.exports = new TokenService();
