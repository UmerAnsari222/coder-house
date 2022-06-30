const RoomDto = require("../dtos/room-dto");
const roomService = require("../services/room-service");

class RoomsController {
  async create(req, res) {
    const { topic, roomType } = req.body;

    if (!topic || !roomType) {
      res.status(400).json({ message: "All fields are required!" });
    }
    const room = await roomService.create({
      topic,
      roomType,
      ownerId: req.user._id,
    });
    const response = new RoomDto(room);
    res.status(200).json(response);
  }

  async index(req, res) {
    const rooms = await roomService.getAllRooms(["open"]);
    const allRooms = rooms.map((room) => new RoomDto(room));
    console.log(allRooms);
    res.status(200).json(allRooms);
  }
}

module.exports = new RoomsController();
