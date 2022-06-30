const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomsSchema = new Schema(
  {
    topic: { type: String, required: true },
    roomType: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    speakers: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: false,
    },
  },
  { timestamps: true }
);

const RoomsModel = mongoose.model("Rooms", roomsSchema);

module.exports = RoomsModel;
