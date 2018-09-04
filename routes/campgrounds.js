var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

//INDEX
router.get("/", function(req, res){
    //get all campgrounds from DB
    Campground.find({}, function(err, allcamps){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allcamps}); 
        }
    });
});

//CREATE
router.post("/", isLoggedIn, function(req, res){
    //get data from form, add it to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCamp = {name:name, image:image, description:desc, author: author};
    //create a new camp to DB
    Campground.create(newCamp, function(err, newCreated){
        if (err){
            console.log(err);
        }else{
            //redirect back to /campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW
router.get("/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundcamps){
        if(err){
             console.log(err);
         }else{
             res.render("campgrounds/show", {campgrounds: foundcamps});    
         }
    });
});

//EDIT
router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundcamps){
        res.render("campgrounds/edit", {campground: foundcamps});
    });
});

//UPDATE
router.put("/:id", checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedcamp){
       if(err){
           res.redirect("/campgrounds");
       } else{
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//DESTROY
router.delete("/:id", checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
};

function checkCampgroundOwnership(req, res, next){
    //User logged in or not?
    if (req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundcamps){
            if (err){
                res.redirect("back");
            }else{
                //Own the campground or not?
                if (foundcamps.author.id.equals(req.user._id)){
                    next();
                }else{
                    //no permition
                    res.redirect("back");
                }    
            }
        });
    //User not logged in
    }else{
        res.redirect("back");    
    }
};

module.exports = router; 