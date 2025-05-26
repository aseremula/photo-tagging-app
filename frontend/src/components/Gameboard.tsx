// import { useState } from 'react'
import Navigation from './Navigation'
import StartDialog from './StartDialog'
import EndDialog from './EndDialog'

function Gameboard({ level="san_francisco" } : { level: string }) {
  

  return (
    <main className="p-5 bg-(--off-white)">
        <Navigation level={level}/>
        <img className="p-5" src={`/${level}/image.png`} width="auto" height="auto" alt="A pixorama of San Francisco by eBoy"/>

        <StartDialog />
        <EndDialog />
    </main>
  )
}

export default Gameboard
