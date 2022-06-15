const mongoose = require("mongoose");

var ActorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    required: true,
    trim: true,
  },
  site: {
    type: String,
    required: true,
    trim: true,
  },
  
});

const Actor = mongoose.model("Actor", ActorSchema, "Actor");

module.exports = Actor;
