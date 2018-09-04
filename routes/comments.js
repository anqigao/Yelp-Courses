// ==================
//  COMMENTS ROUNTES
// ==================

var express = require("express");
var router = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");

router.get("/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundcamp){
        if (err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: foundcamp});    
        }
    });
});

router.post("/", isLoggedIn, function(req, res){
    var text = req.body.text;
    var newComment = {text:text};
    
    Campground.findById(req.params.id, function(err, foundcamp){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(newComment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    foundcamp.comments.push(comment);
                    foundcamp.save();
                    res.redirect("/campgrounds/" + foundcamp._id);
                }
            }); 
        }
    });
});

//EDIT
router.get("/:comment_id/edit", checkCampgroundOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundcomment) {
       if (err){
            res.redirect("back");
       }else{
            res.render("comments/edit", {campground_id:req.params.id, comment: foundcomment});   
       }
    });
});

//UPDATE
//as defined in get() yourself, req.params.id is campgrounds id, req.params.comment_id is comment id
router.put("/:comment_id", checkCampgroundOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedcomment){
       if(err){
           res.redirect("back");
       } else{
           res.redirect("/campgrounds/" + req.params.id);
       }
    });    
});

//DESTROY
router.delete("/:comment_id", checkCampgroundOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            res.redirect("/campgrounds/" + req.params.id);
        }else{
            res.redirect("/campgrounds/" + req.params.id);
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
        Comment.findById(req.params.comment_id, function(err, foundcomments){
            if (err){
                res.redirect("back");
            }else{
                //Own the campground or not?
                if (foundcomments.author.id.equals(req.user._id)){
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