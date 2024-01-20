import { Link } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { UserButton } from "@clerk/clerk-react"

export default function Header() {
    return (
        <header className="h-28 md:h-24 flex items-center justify-center md:justify-between flex-col md:flex-row">
            <Link to="../"> <img  className="h-11 w-auto" src={logo} alt="Recipes AI Logo"/></Link>
            <section>
                <UserButton></UserButton>
            </section>
        </header>
    )
}