import { BrowserRouter, Routes, Route } from "react-router-dom"

import DefaultLayout from './layouts/DefaultLayout.jsx'
import AuthSignIn from "./pages/auth/AuthSignIn.jsx"
import AuthSignUp from "./pages/auth/AuthSignUp.jsx"

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path='/auth/signin' 
          element={
            <DefaultLayout>
              <AuthSignIn />
            </DefaultLayout>
          } 
        />

        <Route 
          path='/auth/signup' 
          element={
            <DefaultLayout>
              <AuthSignUp />
            </DefaultLayout>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
