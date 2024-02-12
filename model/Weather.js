const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    city: {
      type: String, 
      required: true},
    temperature: {
      type: Number, 
      required: true},
    feelsLike: { 
      type: Number, 
      required: true},
    humidity: { 
      type: Number, 
      required: true},
    windSpeed: { 
      type: Number, 
      required: true},
    rainVolume: { 
      type: Number, 
      required: false},
    description: { 
      type: String, 
      required: true},
    country: { 
      type: String, 
      required: true},
    coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    icon: {
      type: String,
      required: true}
}, { timestamps: true });

module.exports = mongoose.model('Weather', weatherSchema);