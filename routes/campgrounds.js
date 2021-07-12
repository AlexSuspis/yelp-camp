const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const {validateCampground, isLoggedIn, isAuthor} = require('../middleware');
const {storage} = require('../cloudinary');
const multer = require('multer');
const upload = multer({storage});


router.route('/')
	.get(campgrounds.index)
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
	.get(catchAsync(campgrounds.show))
	.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.edit))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;