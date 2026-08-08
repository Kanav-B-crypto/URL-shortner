import React, { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

const AuthPage = () => {

    const [login, setLogin] = useState(true)
    const [notice, setNotice] = useState('')

    const handleRegistered = () => {
        setNotice('Account created successfully. Please sign in.')
        setLogin(true)
    }

    const showLogin = (value) => {
        setNotice('')
        setLogin(value)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            {login
                ? <LoginForm state={showLogin} notice={notice} />
                : <RegisterForm state={showLogin} onRegistered={handleRegistered} />}
        </div>
    )
}

export default AuthPage