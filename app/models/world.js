const mongoose = require('mongoose')

const worldSchema = new mongoose.Schema(
	{
		country: {
			type: String,
			required: true,
		},
		continent: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('World', worldSchema)