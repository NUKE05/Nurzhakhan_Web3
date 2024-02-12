const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  alpha2Code: {
    type: String,
    required: true
  },
  capital: String,
  region: String,
  subregion: String,
  population: Number,
  languages: [String],
  flag: String
}, { timestamps: true });

module.exports = mongoose.model('Country', countrySchema);
