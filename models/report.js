import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
