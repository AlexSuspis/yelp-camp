const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index');

const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mapboxGeocoding({accessToken: mapboxToken});


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
} 
module.exports.show = async (req, res) => {
    const campground =  await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
} 
module.exports.renderEditForm = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
} 
module.exports.create = async (req, res) => {

    const response = await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit:1
        }).send()

    const geoData = response.body.features[0].geometry;

    const camp = new Campground(req.body.campground);
    // console.log(geoData);

    camp.geometry = geoData;
    camp.images = req.files.map(f => ({url: f.path, filename:f.filename}));

    camp.author = req.user._id;
    await camp.save();

    req.flash('success', 'Successfully created new campground');
    res.redirect(`/campgrounds/${camp._id}`);

    //end goal: console.log latitude and longitude
}
module.exports.edit = async(req, res) => {
    const { id } = req.params;
    const { title, location, price, description} = req.body.campground;


    const {deleteImages} = req.body;
    
    
    const imagesToAdd = req.files.map(f => ({url: f.path, filename: f.filename}));
    
    const campground = await Campground.findByIdAndUpdate(id, { title, location, price, description});
    campground.images.push(...imagesToAdd);
    
    if(deleteImages){
        deleteImages.forEach((filename) =>{
            cloudinary.uploader.destroy(filename);
            console.log(filename);
        })
        await campground.update({$pull:{ images: {filename:{$in: deleteImages}}}});
        console.log(campground);
    }


    await campground.save();

    req.flash('success', 'Successfully edited new campground');
    res.redirect(`/campgrounds/${id}`);
} 
module.exports.delete = async(req, res) => {
    await Campground.findByIdAndDelete(req.params.id);

    req.flash('success', 'Successfully deleted new campground');
    res.redirect('/campgrounds');
} 
