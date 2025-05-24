// import { useState } from 'react'
import Navigation from './Navigation'

function Gameboard({ level="san_francisco" } : { level: string }) {
  

  return (
    <main className="p-5 bg-(--off-white)">
        <Navigation level={level}/>
        <img className="p-5" src={`/${level}/image.png`} width="auto" height="auto" alt="A pixorama of San Francisco by eBoy"/>
    </main>
  )
}

export default Gameboard
