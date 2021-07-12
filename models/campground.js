const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
		url: String,
		filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('upload/', 'upload/w_200/')
})


const CampgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	description: String,
	price: Number,
	location: String,
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
});

CampgroundSchema.post('findOneAndDelete', async function(doc){
	await Review.deleteMany({_id: {$in: doc.reviews}});
})

module.exports = mongoose.model('Campground', CampgroundSchema);