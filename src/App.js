import React from 'react'
import Game from './Game.js'
import Error from './Error'
import Home from './Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div>
        <BrowserRouter basename="/">
          <Routes>
            <Route exact path='/' element={<Home />}></Route>
            <Route path='/game' element={<Game />}></Route>
            <Route path='/*' element={<Error />}></Route>
          </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App