import { useState, useRef, useContext } from 'react';
import type { MouseEvent } from 'react';
import Navigation from './Navigation';
import StartMenu from './StartMenu';
import EndMenu from './EndMenu';
import Dropdown from './Dropdown';
import { LevelContext } from '../context/levelContext';

type BubbleDirection = "top" | "bottom" | "left" | "right";
type playStates = "start_menu" | "gameboard_guessing" | "end_menu";
interface dropdownCoordinatesState {
  top: number;
  left: number;
  bubbleDirection: BubbleDirection;
}

function Gameboard() {
  const [imageSet, setImageSet] = useState(() => new Set([]));
  const [playState, setPlayState] = useState<playStates>("end_menu");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownCoordinates, setDropdownCoordinates] = useState<dropdownCoordinatesState>({ top: -65, left: 2, bubbleDirection: "bottom" });
  const [coordinates, setCoordinates] = useState({ pageX: 0, pageY: 0, standardX: 0, standardY: 0 });
  const dropdownTimeoutRef = useRef(0);
  const level = useContext(LevelContext);

  function getClickCoords(event: MouseEvent<HTMLElement>)
  {
    // From: https://stackoverflow.com/a/29296049/14198287
    // To standardize coordinates across different screen sizes, convert the x and y offset of the click relative to the image frame to percentages based on the height and width of the image as displayed
    const e = event.target as HTMLElement;
    const { width, height } = e.getBoundingClientRect(); // get the height and width of the image as it appears on the user's screen
    const { offsetX, offsetY } = event.nativeEvent; // get the offset of the click relative to the image element directly
    
    // Map the coordinates on a 10,000px x 10,000px image. Include the offset numbers so the dropdown can appear exactly where the user clicked (as these numbers can be different for each screen size)
    const x = Math.round((offsetX / width) * 10000); 
    const y = Math.round((offsetY / height) * 10000);
    if(coordinates.standardX === x && coordinates.standardY === y)
    {
      // If the user clicks an area previously clicked, toggle the dropdown accordingly
      setShowDropdown(!showDropdown);
    }
    else 
    {
      setShowDropdown(true);
      setCoordinates({...coordinates, pageX: offsetX, pageY: offsetY, standardX: x, standardY: y});

      // Determine how to display dropdown based on where the user clicked the image. The dropdown's triangle should appear right next to the mouse cursor at all times
      // Left and right dropdowns activate when the user clicks on the first or last (respectively) 25% of the image
      if(offsetX >= (width - (width*0.25)))
      {
        // Images show on the left when too close to the right edge, ex. [ ]>        
        // Since the width of the dropdown is not known until the user clicks, and the dropdown changes size based on the user's screen width, use a slope-intercept function given from a linear regression that uses the width of the user's device as X to position this dropdown. If the images/buttons inside are max-height/width, that means the dropdown is a constant size regardless of screen width and a concrete number for left can be given
        setDropdownCoordinates({...dropdownCoordinates, top: -35, left: ((window.innerWidth < 1200) ? ((-0.2722*window.innerWidth) - 78.75) : -398), bubbleDirection: "right"});
      }
      else if(offsetX <= (width*0.25))
      {
        // Images show on the right when too close to the left edge, ex. <[ ]
        setDropdownCoordinates({...dropdownCoordinates, top: -40, left: 35, bubbleDirection: "left"});
      }
      else if(y <= 1500)
      {
        // Images show on the bottom when too close to the top edge, ex. ^[ ]
        setDropdownCoordinates({...dropdownCoordinates, top: 80, left: 2, bubbleDirection: "top"});
      }
      else
      {
        // Images show on the top when too close to the bottom edge, ex. v[ ]
        setDropdownCoordinates({...dropdownCoordinates, top: -75, left: 0, bubbleDirection: "bottom"})
      }
    }
  };

  function handleClick(e: MouseEvent<HTMLElement>)
  {
    // Update the coordinates of the user's click and enable/disable dropdown
    getClickCoords(e);

    // If the user is idle and does not mouse into the dropdown, clear the previous timeout if it exists and close the dropdown after a new set amount of time
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 7000);
  }

  return (
    <main className="relative">
      {/* When either menu is open, gameboard does not accept clicks. However, the navigation still does! */}
      {(playState === "start_menu" || playState === "end_menu") && 
        <div className="z-1 fixed bg-black/50 min-h-[100%] w-[100%] flex items-center justify-center">
          {(playState === "start_menu") ? <StartMenu /> : <EndMenu />}
        </div>
      }
 
      <section className="p-5 bg-(--off-white) flex flex-col justify-center gap-5 overflow-x-hidden">
        <Navigation/>

        <div className="relative self-center">
          <span style={{
          position: "absolute",
          left: coordinates.pageX + dropdownCoordinates.left,
          top: coordinates.pageY + dropdownCoordinates.top,
          transform: "translateX(-50%) translateY(-50%)",
          }}>
            {/* The key is only used for refreshing the dropdown on touchscreens - if the user guesses correctly and clicks other spots of the image immediately, return the dropdown to its inital state */}
            {(showDropdown && (playState === "gameboard_guessing")) && <span className="appear" key={`${coordinates.standardX}-${coordinates.standardY}`} onMouseEnter={() => {
            setShowDropdown(true);
            clearTimeout(dropdownTimeoutRef.current); // do not close the dropdown while the user's mouse moves around the component
            }}><Dropdown imageSet={imageSet} bubbleDirection={dropdownCoordinates.bubbleDirection} setShowDropdown={setShowDropdown} dropdownTimeoutRef={dropdownTimeoutRef}/></span>}
          </span>

          <div onClick={(e) => handleClick(e)} className={`hover:cursor-crosshair ${(playState !== "gameboard_guessing") && "pointer-events-none"}`}>
            {/* Add blur to image before game begins to prevent users from searching for images before starting the timer (cheating) */}
            <img className={`pointer-events-none ${(playState !== "gameboard_guessing") && "blur-sm grayscale"}`} src={`/${level.img}/image.png`} width="auto" height="auto" alt={`A pixorama of ${level.title} by eBoy`}/>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Gameboard