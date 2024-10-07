const Recipe = require("../models/recipe")

// Service for searching, written apart from recipe service 
// as in future search will also accompany author profiles.
const searchObj = {}
searchObj.query = async(keywords, skip, limit) => {
    try {
        let querySpec = [
            {
                $search: {
                    index: "searchRecipes",
                    count: { type: "total" },
                    text: {
                        query: keywords,
                        path: ['name', 'author', 'diet'],
                        fuzzy: {}
                    }
                }
            },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $project: {
                    name: true,
                    author: true,
                    diet: true,
                    img_url: true,
                    meta: "$$SEARCH_META"
                }
            }
        ]

        let recipeData = await Recipe.aggregate([querySpec])

        return { 
            code: 200, 
            data: recipeData
        }
    } catch (error) {
        return { 
            code: 500, 
            msg: "Could not retrive data from data store"
        }
    }
}

module.exports = searchObj