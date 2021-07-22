const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('upload/', 'upload/w_200/')
})

//so that when parsing to JSON in campgrounds/index.ejs file, we include the virtual
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
	title: String,
	description: String,
	price: Number,
	location: String,
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	images: [ImageSchema],
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	],
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
	return `<strong><a href=/campgrounds/${this._id}>${this.title}</a></strong><br><p>${this.description}</p>`;
});


CampgroundSchema.post('findOneAndDelete', async function (doc) {
	await Review.deleteMany({ _id: { $in: doc.reviews } });
});

module.exports = mongoose.model('Campground', CampgroundSchema);