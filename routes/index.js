var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport        = require("passport");

// ============
// AUTH ROUTES
// ============

//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res){
   var username = req.body.username;
   var password = req.body.password;
   var newUser = new User({username:username});
   User.register(newUser, password, function(err, user){
       if (err){
           console.log(err);
           return res.render("register");
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds");
       });
   });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }), function(req, res){
});

// logout logic route
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
};

module.exports = router; 