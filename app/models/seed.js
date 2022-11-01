// seed.js is going to be the file we run, whenever we want to seed our database, we'll create a bunch of pets at once.

// we want to be careful with this, because when we run it, it'll delete all of the pets in the db. 

// we can modify this later, to only delete pets that don't have an owner already, but we'll keep it simple for now.

const mongoose = require('mongoose')
const World = require('./world')
const db = require('../../config/db')

const startPets = [
    { contry: 'Nigeria', continent: 'Africa'},
    { contry: 'Spain', continent: 'Europe'},
    { contry: 'India', continent: 'Asia'},
    { contry: 'United States', continent: 'North America'},
    { contry: 'Australia', continent: 'Oceania'},
    { contry: 'Brazil', continent: 'South America'}
]

// first we need to connect to the database
mongoose.connect(db, {
    useNewUrlParser: true
})
    .then(() => {
        // first we remove all of the pets
        // here we can add something to make sure we only delete pets without an owner
        World.deleteMany({ owner: null })
            .then(deletedWorlds => {
                console.log('deletedWorlds', deletedWorlds)
                // the next step is to use our startPets array to create our seeded pets
                World.create(startWorlds)
                    .then(newWorlds => {
                        console.log('the new countries', newWorlds)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })