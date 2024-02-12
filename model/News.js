const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  urlToImage: String,
  publishedAt: Date,
  content: String,
  author: String,
  sourceName: String
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);