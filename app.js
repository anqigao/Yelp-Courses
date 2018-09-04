//initialization
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var seedDB = require("./seeds");
var passport        = require("passport"),
    LocalStrategy   = require("passport-local");
var methodOverride = require("method-override");

//requiring routes
var User = require("./models/user");
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes          = require("./routes/index");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
//seedDB();


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "The page belongs to Angela.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});



app.get("/", function(req, res){
    //res.send("This will be the landing page！");
    res.render("landing");
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp start!")
});