import mongoose from "mongoose";

const notesSchema = mongoose.Schema({
  value: {
    heading: String,
    body: String,
    color: String,
  },
});

export default mongoose.model("notesContent", notesSchema);
