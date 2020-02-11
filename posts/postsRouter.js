const express = require('express');

const Posts = require('../data/db.js');

const router = express.Router();

// middleware

// ROUTE handlers

// get list of posts
router.get('/', (req, res) => {
  Posts.find().then(posts => {
    res.status(200).json(posts);
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "The posts information could not be retrieved." });
  });
});

// get post by id
router.get('/:id', (req, res) => {
  Posts.findById(req.params.id).then(posts => {
    if (posts.length === 0) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    } else if (posts.length === 1) {
      res.status(200).json(posts[0]);
    } else {
      res.status(500).json({ error: "Unexpected error with findById when getting post by id." });
    }
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "The post information could not be retrieved." });
  });
});

// get post comments
router.get('/:id/comments', (req, res) => {
  Posts.findPostComments(req.params.id).then(comments => {
    if (comments.length > 0) {
      res.status(200).json(comments);
      return;
    } 
    
    if (comments.length === 0) {
      Posts.findById(req.params.id).then(posts => {
        if (posts.length === 0) {
          res.status(404).json({ message: "The post with the specified ID does not exist." });
          return;
        } 
        
        if (posts.length === 1) {
          res.status(200).json(comments);
        } else {
          res.status(500).json({ error: "Unexpected error with findById when getting comments." })
        }
      }).catch(err => {
        console.dir(err);
        res.status(500).json({ error: "Post information could not be found when getting comments." });
      });
    } else {
      res.status(500).json({ error: "Unexpected value from findPostComments when getting comments." })
    }
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "The comments information could not be retrieved." });
  });
});

// create post
router.post('/', (req, res) => {
  const newPost = req.body;

  if (!newPost.title || !newPost.contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    return;
  }

  Posts.insert(newPost).then(info => {
    Posts.findById(info["id"]).then(posts => {
      if (posts.length === 1) {
        res.status(201).json(posts[0]);
      } else {
        res.status(500).json({ error: "Unexpected error with findById when returning new post." });
      }
    }).catch(err => {
      console.dir(err);
      res.status(500).json({ error: "The post information could not be retrieved." });
    });
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "There was an error while saving the post to the database." });
  });
});

// create comment
router.post('/:id/comments', (req, res) => {
  const newComment = { ...req.body, post_id: req.params.id };

  if (!newComment.text) {
    res.status(400).json({ errorMessage: "Please provide text for the comment." });
    return;
  }

  Posts.insertComment(newComment).then(info => {
    Posts.findCommentById(info["id"]).then(comment => {
      res.status(201).json(comment);
    }).catch(err => {
      console.dir(err);
      res.status(500).json({ error: "Unexpected error with findCommentById when returning new comment." })
    });
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "There was an error while saving the comment to the database." });
  });
});

// delete post
router.delete('/:id', (req,res) => {
  Posts.remove(req.params.id).then(numDeleted => {
    res.status(200).json(numDeleted);
  }).catch(err => {
    console.dir(err);
    res.status(500).json({ error: "The post could not be removed." });
  });
});

module.exports = router;