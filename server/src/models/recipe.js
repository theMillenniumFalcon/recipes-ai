const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    cooking_time: {
        type: Number,
        required: true
    },
    diet: {
        type: String,
        required: true
    },
    img_url: {
        type: String,
        required: false
    },
    ingredients: {
        type: Object,
        required: false
    },
    steps: {
        type: Array,
        required: true
    },
    allergies: {
        type: Array,
        required: true
    },
    intro: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    health_score: {
        type: Number,
        required: true
    },
    health_reason: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: false
    }
})

const Recipe = mongoose.model("Recipe", RecipeSchema)
module.exports = Recipe