const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
	username: {
		type: String
	},
	password: {
		type: String
	},
	deletedAt: {
		type: Date,
		default: null
	},
	isAdmin: {
		type: Boolean,
		default: false
	}
}, {timestamps: true})

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User)
