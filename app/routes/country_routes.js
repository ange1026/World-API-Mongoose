// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Country = require('../models/country')

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
// GET /countries
router.get('/countries', requireToken, (req, res, next) => {
	Country.find()
		.then(countries => {
			return countries.map(country => country)
		})
		.then(countries => {
			res.status(200).json({ countries: countries })
		})
		.catch(next)
})

// SHOW
// GET /countries/:id
router.get('countries/:id', requireToken, (req, res, next) => {
	Country.findById(req.params.id)
	.then(handle404)
	.then(country => {
		res.status(200).json({ country: country })
	})
	.catch(next)
})

// CREATE
// POST /countries
router.post('/countries', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.country.owner = req.user.id

	Country.create(req.body.country)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then(country => {
			res.status(201).json({ country: country})
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /countries/:id
router.patch('/countries/:id', requireToken, removeBlanks, (req, res , next) => {
	delete req.body.world.owner

	Country.findById(req.params.id)
	.then(handle404)
	.then(country => {
		requireOwnership(req, country)

		return country.updateOne(req.body.country)
	})
	.then(() => res.sendStatus(204))
	.catch(next)
})

module.exports = router