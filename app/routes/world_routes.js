// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const World = require('../models/world')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const { restart } = require('nodemon')
// const world = require('../models/world')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()


// INDEX
// GET /worlds
router.get('/worlds', requireToken, (req, res, next) => {
	World.find()
		.then(worlds => {
			return worlds.map(world => world)
		})
		.then(world => {
			res.status(200).json({ worlds: worlds })
		})
		.catch(next)
})

// SHOW
// GET /worlds/:id
router.get('worlds/:id', requireToken, (req, res, next) => {
	World.findById(req.params.id)
	.then(handle404)
	.then(world => {
		res.status(200).json({ world: world })
	})
	.catch(next)
})

// CREATE
// POST /worlds
router.post('/worlds', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.world.owner = req.user.id

	World.create(req.body.world)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then(world => {
			res.status(201).json({ world: world})
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /worlds/:id
router.patch('/worlds/:id', requireToken, removeBlanks, (req, res , next) => {
	delete req.body.world.owner

	World.findById(req.params.id)
	.then(handle404)
	.then(world => {
		requireOwnership(req, world)

		return world.updateOne(req.body.world)
	})
	.then(() => res.sendStatus(204))
	.catch(next)
})

module.exports = router