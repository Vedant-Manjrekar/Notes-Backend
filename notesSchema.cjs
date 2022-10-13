const mongoose = require("mongoose");

const notesSchema = mongoose.Schema({
  value: {
    heading: String,
    body: String,
    color: String,
  },
});

module.exports = mongoose.model("notesContent", notesSchema);
