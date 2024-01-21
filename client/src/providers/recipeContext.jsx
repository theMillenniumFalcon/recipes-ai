import React, {useContext } from 'react'

const RecipeContext = React.createContext()
const BACKEND_URI = process.env.REACT_APP_BACKEND_URI

export const useRecipes = () => {
    return useContext(RecipeContext)
}