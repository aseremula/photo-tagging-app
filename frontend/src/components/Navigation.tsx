import { useContext } from 'react';
import type { PropsWithChildren } from 'react';
import ImageIcon from './ImageIcon';
import { LevelContext } from '../context/levelContext';

type NavigationComponentProps = {
  imageSet: boolean[];
}

// Ensure proper typing of the children prop by using PropsWithChildren
function Navigation({ imageSet, children } : PropsWithChildren<NavigationComponentProps>) {
  const levelContext = useContext(LevelContext);
  
  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= levelContext.levelInfo.numberOfImages; imageCounter++) {
      listItems.push(
        <li key={imageCounter}><ImageIcon key={imageCounter} imagePath={`/${levelContext.levelInfo.img}/${imageCounter}.jpg`} markAsFound={imageSet[imageCounter-1]} /></li>
      );
    }
    return listItems;
  };

  return (
    <nav className="font-(family-name:--roboto-400) text-(--aqua) grid grid-cols-3 shadow-2xl border-1 border-dashed border-(--aqua) bg-(--tan)">
      <div className="flex items-center gap-5 p-3">
        <div className="flex flex-col items-center justify-center w-13 h-13 lg:max-2xl:w-10 lg:max-2xl:h-10">
          <svg className="w-7 h-7 fill-(--black) pointer-events-none lg:max-xl:w-6 lg:max-xl:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M778-164 528-414q-30 26-69 40t-77 14q-92.23 0-156.12-63.84-63.88-63.83-63.88-156Q162-672 225.84-736q63.83-64 156-64Q474-800 538-736.12q64 63.89 64 156.12 0 41-15 80t-39 66l250 250-20 20ZM382-388q81 0 136.5-55.5T574-580q0-81-55.5-136.5T382-772q-81 0-136.5 55.5T190-580q0 81 55.5 136.5T382-388Z"/></svg>
          <p className="font-(family-name:--bodoni-400) text-base text-(--black) italic uppercase lg:max-2xl:text-sm">FIND</p>
        </div>
      
        <ul className={`grid gap-5 grid-cols-5 lg:max-2xl:gap-[5%] lg:max-2xl:grid-cols-[repeat(auto-fit,minmax(27px,1fr))] lg:max-2xl:w-[80%]`}>
          {renderList()}
        </ul>
      </div>

      {/* Using composition to include Stopwatch component */}
      <div className="font-(family-name:--bodoni-400) italic flex items-center justify-center gap-2 text-5xl text-(--neon-yellow) bg-(--aqua) p-3 lg:max-xl:text-[26px] xl:max-2xl:text-3xl">
        {children}
      </div>
        
      <div className="flex flex-col items-end justify-center p-3">
        <div className="flex items-center justify-end gap-2 pointer-events-none">
          <img className="max-w-[65px] lg:max-2xl:max-w-[50px]" src="/icon.webp" width="100%" height="auto" alt="eBoy's Blockbob Eater"/>
          <h1 className="text-5xl font-(family-name:--bodoni-400) italic text-(--black) lg:max-2xl:text-3xl">eFIND</h1> 
        </div>
            
        <h2 className="text-lg lg:max-2xl:text-sm">{levelContext.levelInfo.title}</h2>
      </div>
    </nav>
  )
}

export default Navigation;