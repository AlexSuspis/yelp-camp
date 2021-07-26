const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')


//so we can access the .env file
require("dotenv").config();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/campgrounds';
console.log(dbUrl);



mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to database!'))
	.catch(err => console.log(err));

const randomIndexFromArray = arr => Math.floor(Math.random() * arr.length);


seedDB = async () => {
	await Campground.deleteMany({});

	for (let i = 0; i < 300; i++) {

		let random1to1000 = Math.floor(Math.random() * 1000);
		let images = [
			{
				url: 'https://res.cloudinary.com/dahjrmpbg/image/upload/v1625582547/YelpCamp/dominik-jirovsky-re2LZOB2XvY-unsplash_aqjf6s.jpg', filename: 'YelpCamp/cdjv0tfpv0zlrelvypew.jpg'
			},
			{
				url: 'https://res.cloudinary.com/dahjrmpbg/image/upload/v1625582556/YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_ohxqgi.jpg', filename: 'YelpCamp/ndjt3gnilbkcp36z3k2j.jpg'
			}
		];

		const price = Math.floor(Math.random() * 30 + 10);
		const camp = new Campground({
			location: `${cities[random1to1000].city}, ${cities[random1to1000].state}`,
			title: `${descriptors[randomIndexFromArray(descriptors)]} ${places[randomIndexFromArray(places)]}`,
			images,
			price,
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore hic et quo quas amet distinctio atque nisi rem dolorem doloribus sit autem, non vero recusandae similique aspernatur ipsum nobis veritatis.',
			//Your user ID!!!
			author: '60ec9e5e4fcdf255d6e48680',
			geometry: {
				"type": "Point",
				"coordinates": [
					cities[random1to1000].longitude,
					cities[random1to1000].latitude
				]
			}
		});
		await camp.save();
	}
};

seedDB().then(() => mongoose.connection.close());