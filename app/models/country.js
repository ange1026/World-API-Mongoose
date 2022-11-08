const mongoose = require('mongoose')

const countrySchema = new mongoose.Schema(
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
			ref: 'User'
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Country', countrySchema)