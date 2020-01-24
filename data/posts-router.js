const express = require('express')

const Posts = require('./db')

const router = express.Router()

router.post('/', (req, res) => {
  Posts.insert(req.body)
  .then(post => {
    if(!req.body.title || !req.body.contents) {
      res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    } else {
      res.status(201).json(post)
    }
  })
  .catch(err => res.status(500).json({ errorMessage: "There was an error while saving the post to the database." }))
})

router.get('/:id', (req, res) => {
  const { id } = req.params

  Posts.findById(id)
  .then(post => {
    if (post.length === 0) {
      res.status(404).json({ message: "The post with the specified ID does not exist." })
    } else {
      console.log(req.params)
      res.status(201).json(post)
    }
  })
  .catch(err => res.status(500).json({ errorMessage: "The information could not be retrieved" }))
})

router.post('/:id/comments', (req, res) => {
  const { text } = req.body

  const commentInfo = {...req.body, post_id: req.params.id}

  if (!text) {
    res.status(400).json({ errorMessage: "Please provide text for the comment." });
  } else {
    Posts.findById(req.params.id)
    .then(post => {
        console.log(req.body)
        if (post.length === 0) {
          res.status(404).json({ errorMessage: "The post with the specified ID does not exist." });
        } else {
          Posts.insertComment(commentInfo)
          .then(() => {
            res.status(201).json({ message: "comment added!" });
          })
          .catch(err => {
            res.status(500).json({ errorMessage: "There was an error while saving the comment to the database." });
          });
        }
      })
      .catch(err => {
        res.status(500).json({ errorMessage: "Post information could not be retrieved." });
      });
  }
});


router.get('/', (req, res) => {
  Posts.find()
  .then(posts => {
    res.status(201).json({posts})
  })
  .catch(err => res.status(500).json({ errorMessage: "The posts information could no be retrieved"}))
})


router.get('/:id/comments', (req, res) => {
  Posts.findById(req.params.id)
  .then(post => { 
    if (post.length === 0) {
      res.status(404).json({ errorMessage:"The post with the specified ID does not exist" }) 
    } else {
      Posts.findPostComments(req.params.id)
      .then(comments => res.status(201).json({comments}))
    }
  })
  .catch(err => res.status(500).json({ errorMessage: "The comments information could not be retrieved"}))
})

router.delete('/:id', (req, res) => {
  const id = req.params.id

  Posts.remove(id)
  .then(post => {
    if (!post) {
      res.status(404).json({ errorMessage: "The post with the specified ID does not exist." })
    } else {
      res.json({ message: "Post successfully deleted" })
    }
  })
  .catch(err => res.status(400).json({ error: "The post could not be removed" }))
})

router.put('/:id', (req, res) => {
  const { title, contents } = req.body
  const id = req.params.id

  if (!title && !contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
  } else {
    Posts.update(id, {...req.body})
    .then(update => {
      if (!update) {
        res.status(404).json({ errorMessage: "The post with the specified ID does not exist." })
      } else {
        Posts.findById(req.params.id) 
        .then(post => {
          res.status(201).json(post)
        })
      }
    })
    .catch(err => {
      res.status(500).json({ errorMessage: "The information could not be retrieved"})
    })
  }
})

module.exports = router