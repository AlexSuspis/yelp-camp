const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('express-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
console.log(process.env);

const atlasDBUrl = process.env.DB_URL;
const dbUrl = atlasDBUrl || 'mongodb://localhost:27017/campgrounds';

//prints undefined? Hmm...
console.log(atlasDBUrl);

console.log(dbUrl);

mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => console.log('Connected to database!'))
    .catch(err => console.log(err));



const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60 //save info in db every 24 hours
});

store.on('error', function (e) {
    console.log('Session Store Error!\n', e);
})

const secret = process.env.SECRET || 'secret';

const sessionConfig = {
    store,
    resave: true,
    saveUninitialized: true,
    secret,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    //gives access to success variable from inside template files
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});