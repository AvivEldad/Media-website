const mongoose = require("mongoose");

var MediaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
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
  director: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  isSeries: {
    type: Boolean,
    required: true,
  },
  seriesDetails: {
    type: [Number],
    default: [],
    required: function () {
      return this.isSeries;
    },
  },
  actors:{
    default: [],
    type: Array,
    actor:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Actor",
    }
    
  }
});


const Media = mongoose.model("Media", MediaSchema, "Media");


module.exports = Media;
