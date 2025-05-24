// import { useState } from 'react'
import ImageIcon from './ImageIcon';

function Navigation({ level="san_francisco" } : { level: string }) {

  const NUMBER_OF_IMAGES = 5;
  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= NUMBER_OF_IMAGES; imageCounter++) {
      listItems.push(
        <ImageIcon key={imageCounter} imagePath={`/${level}/${imageCounter}.jpg`} markAsFound={false} />
      );
    }
    return listItems;
  };

  return (
    <nav className="font-(family-name:--roboto-400) text-(--aqua) grid grid-cols-3 shadow-2xl border-1 border-dashed border-(--aqua) bg-(--tan)">
      <ul className="flex items-center gap-5 p-3">
        <div className="flex flex-col items-center justify-center w-13 h-13">
          <svg className="w-7 h-7 fill-(--black) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M778-164 528-414q-30 26-69 40t-77 14q-92.23 0-156.12-63.84-63.88-63.83-63.88-156Q162-672 225.84-736q63.83-64 156-64Q474-800 538-736.12q64 63.89 64 156.12 0 41-15 80t-39 66l250 250-20 20ZM382-388q81 0 136.5-55.5T574-580q0-81-55.5-136.5T382-772q-81 0-136.5 55.5T190-580q0 81 55.5 136.5T382-388Z"/></svg>
          <p className="font-(family-name:--bodoni-400) text-(--black) italic uppercase">FIND</p>
        </div>

        {renderList()}
      </ul>

      {/* TODO: insert time */}
      <div className="flex items-center justify-center gap-2 text-5xl text-(--neon-yellow) bg-(--aqua) p-3">
        <svg className="w-13 h-13 fill-(--neon-yellow) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-132q-64 0-120-24t-98-66q-42-42-66-98t-24-120q0-64 24-120t66-98q42-42 98-66t120-24q64 0 120 24t98 66q42 42 66 98t24 120q0 64-24 120t-66 98q-42 42-98 66t-120 24Zm0-308Zm130 150 20-20-136-136v-194h-28v206l144 144ZM240-810l20 20-130 130-20-20 130-130Zm480 0 130 130-20 20-130-130 20-20ZM480-160q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Z"/></svg>
        <p className="font-(family-name:--bodoni-400) italic">0:00</p>
      </div>
        
      <div className="flex flex-col items-end justify-center p-3">
        <div className="flex items-center justify-end gap-2">
          <img src="/icon.webp" width="65px" height="auto" alt="eBoy's Blockbob Eater"/>
          <h1 className="text-5xl font-(family-name:--bodoni-400) italic text-(--black)">eFIND</h1> 
        </div>
            
        <h2 className="text-lg"><a href="https://www.eboy.com/products/san-francisco-poster">San Francisco</a></h2>
      </div>
    </nav>
  )
}

export default Navigation