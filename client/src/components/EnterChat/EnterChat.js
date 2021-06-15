import React from 'react';
import { socket } from '../../App'
import './EnterChat.scss'

const EnterChat = ({ setUser, connect, buy }) => {

  const [authError, setAuthError] = React.useState({ status: false, message: '' })

  const loginHandler = e => {
    e.preventDefault()
    const username = e.target.elements.username.value.trim()[0].toUpperCase() + e.target.elements.username.value.trim().slice(1).toLowerCase()
    const maxUsernameLength = 20

    if (username === '') {
      setAuthError({ status: true, message: '*Invalid username!' })
      return
    }

    if (username.match(/\d/)) {
      setAuthError({ status: true, message: '*Numbers are not allowed!' })
      return
    }

    if (username.length >= maxUsernameLength) {
      setAuthError({ status: true, message: `*Max username length: ${maxUsernameLength}` })
      return
    }

    setUser({ username, isLoggedIn: true })
    setAuthError({ status: false, message: '' })
    socket.emit('user:connected', { username })
  }

  return (
    <div className="enter">
      <div className="enter-heading">
        <h1>need any help?</h1>
        <p>Connect to get an offer or sponsorship (private tools, repos etc.).</p>
      </div>
      {authError.status ? <div className='enter-error'><span>{authError.message}</span></div> : null}
      <div className="enter-form">
          <button type='button' onClick={buy} className='btn-primary'>Sponsorship &hearts;</button>
          <button type='button' onClick={connect} className='btn-primary'>Connect</button>
      </div>
    </div>
  )
}

export default EnterChat