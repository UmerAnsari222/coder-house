const RoomsModel = require("../models/rooms-model");

class RoomService {
  async create(payload) {
    const { topic, roomType, ownerId } = payload;
    const room = await RoomsModel.create({
      topic,
      roomType,
      ownerId,
      speakers: [ownerId],
    });
    return room;
  }
  async getAllRooms(types) {
    const rooms = await RoomsModel.find({ roomType: { $in: types } })
      .populate("speakers")
      .populate("ownerId")
      .exec();
    return rooms;
  }
}

module.exports = new RoomService();
