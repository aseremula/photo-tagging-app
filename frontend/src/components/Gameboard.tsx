import { useState, useRef, useContext, useEffect } from 'react';
import type { MouseEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Dropdown from './Dropdown';
import { LevelContext } from '../context/levelContext';

interface dropdownCoordinatesState {
  top: number;
  left: number;
  bubbleDirection: BubbleDirection;
}

function Gameboard({ imageSet, playState, correctGuessCoordinates, setCorrectGuessCoordinates }: { imageSet: Set<number>, playState: playStates, correctGuessCoordinates: Coordinates[], setCorrectGuessCoordinates: Dispatch<SetStateAction<Coordinates[]>> }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownCoordinates, setDropdownCoordinates] = useState<dropdownCoordinatesState>({ top: -65, left: 2, bubbleDirection: "bottom" });
  const [coordinates, setCoordinates] = useState({ pageX: 0, pageY: 0, standardX: 0, standardY: 0 });
  const dropdownTimeoutRef = useRef(0);
  const level = useContext(LevelContext);
  const STANDARDIZED_IMAGE_SIZE = 10000; // provides standardized coordinates on a n x n gameboard across all devices

  // When user correctly guesses an image, place a marker on that image in the gameboard. Reposition the marker if the user's screen size changes
  const imageRef = useRef<HTMLDivElement>(null);
  const [gameboardMarkers, setGameboardMarkers] = useState<Coordinates[]>([]);
  useEffect(() => {
    function repositionCorrectGuessMarkers() 
    {
      const recalibratedCoordinates: Coordinates[] = [];
      correctGuessCoordinates.map((guessCoordinates, index) => {
        if(imageRef.current) 
        {
          const newPageX = Math.round(imageRef.current.getBoundingClientRect().width*(guessCoordinates.standardX/STANDARDIZED_IMAGE_SIZE));
          const newPageY = Math.round(imageRef.current.getBoundingClientRect().height*(guessCoordinates.standardY/STANDARDIZED_IMAGE_SIZE));
          const newCoordinate = {...guessCoordinates, pageX: newPageX, pageY: newPageY};
          recalibratedCoordinates.push(newCoordinate);
        }
        else
        {
          throw new Error(`Could not reposition marker on correctly guessed image #${index+1} due to an internal client error.`);
        }
      });
      setGameboardMarkers(recalibratedCoordinates);
      setShowDropdown(false);
    }

    window.addEventListener("resize", repositionCorrectGuessMarkers);
    repositionCorrectGuessMarkers();
    return () => window.removeEventListener("resize", repositionCorrectGuessMarkers);
  }, [correctGuessCoordinates]);

  function getClickCoords(event: MouseEvent<HTMLElement>)
  {
    // From: https://stackoverflow.com/a/29296049/14198287
    // To standardize coordinates across different screen sizes, convert the x and y offset of the click relative to the image frame to percentages based on the height and width of the image as displayed
    const e = event.target as HTMLElement;
    const { width, height } = e.getBoundingClientRect(); // get the height and width of the image as it appears on the user's screen
    const { offsetX, offsetY } = event.nativeEvent; // get the offset of the click relative to the image element directly

    // Map the coordinates on a 10,000px x 10,000px image. Include the offset numbers so the dropdown can appear exactly where the user clicked (as these numbers can be different for each screen size)
    const x = Math.round((offsetX / width) * STANDARDIZED_IMAGE_SIZE); 
    const y = Math.round((offsetY / height) * STANDARDIZED_IMAGE_SIZE);

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
    <section className="relative self-center">
      <span style={{
      position: "absolute",
      left: coordinates.pageX + dropdownCoordinates.left,
      top: coordinates.pageY + dropdownCoordinates.top,
      transform: "translateX(-50%) translateY(-50%)",
      }} className="z-2">
        {/* The key is only used for refreshing the dropdown on touchscreens - if the user guesses correctly and clicks other spots of the image immediately, return the dropdown to its inital state */}
        {(showDropdown && (playState === "gameboard_guessing")) && <span className="appear" key={`${coordinates.standardX}-${coordinates.standardY}`} onMouseEnter={() => {
        setShowDropdown(true);
        clearTimeout(dropdownTimeoutRef.current); // do not close the dropdown while the user's mouse moves around the component
        }}><Dropdown imageSet={imageSet} bubbleDirection={dropdownCoordinates.bubbleDirection} setShowDropdown={setShowDropdown} dropdownTimeoutRef={dropdownTimeoutRef} coordinates={coordinates} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={setCorrectGuessCoordinates}/></span>}
      </span>

      {gameboardMarkers.map((guessCoordinates, index) => 
        <div key={index} style={{
          position: "absolute",
          left: guessCoordinates.pageX,
          top: guessCoordinates.pageY,
          transform: "translateX(-50%) translateY(-50%)",
          }} className="bg-(--neon-yellow) opacity-85 rounded-lg lg:max-xl:rounded-sm">
            <svg className="w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-5 lg:max-xl:h-5 xl:max-2xl:w-7 xl:max-2xl:h-7" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/></svg>
        </div>
      )}

      <div ref={imageRef} onClick={(e) => handleClick(e)} className={`hover:cursor-crosshair ${(playState !== "gameboard_guessing") && "pointer-events-none"}`}>
        {/* Add blur to image before game begins to prevent users from searching for images before starting the timer (cheating) */}
        <img className={`pointer-events-none ${(playState !== "gameboard_guessing") && "blur-sm grayscale"}`} src={`/${level.img}/image.png`} width="auto" height="auto" alt={`A pixorama of ${level.title} by eBoy`}/>
      </div>
    </section>
  )
}

export default Gameboard;