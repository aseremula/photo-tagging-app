import { useState } from 'react'
import Navigation from './Navigation'
import StartDialog from './StartDialog'
import EndDialog from './EndDialog'
import Dropdown from './Dropdown'

type BubbleDirection = "top" | "bottom" | "left" | "right";

interface dropdownCoordinatesState {
  top: number;
  left: number;
  bubbleDirection: BubbleDirection;
}

function Gameboard({ level="san_francisco" } : { level: string }) {
  const [imageSet, setImageSet] = useState(() => new Set([]));
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownCoordinates, setDropdownCoordinates] = useState<dropdownCoordinatesState>({ top: -65, left: 2, bubbleDirection: "bottom" });
  const [coordinates, setCoordinates] = useState({ pageX: 0, pageY: 0, standardX: 0, standardY: 0 });

  function getClickCoords(event: React.MouseEvent<HTMLElement>)
  {
    // from: https://stackoverflow.com/a/29296049/14198287
    // to standardize coordinates across different screen sizes, convert the x and y offset of the click relative to the image frame to percentages based on the height and width of the image as displayed
    const e = event.target as HTMLElement;
    const { width, height } = e.getBoundingClientRect(); // get the height and width of the image as it appears on the user's screen
    const { offsetX, offsetY } = event.nativeEvent; // get the offset of the click relative to the image element directly

    // map the coordinates on a 10,000px x 10,000px image. Include the offset numbers so the dropdown can appear exactly where the user clicked (as these numbers can be different for each screen size)
    const x = Math.round((offsetX / width) * 10000); 
    const y = Math.round((offsetY / height) * 10000);
    setCoordinates({...coordinates, pageX: offsetX, pageY: offsetY, standardX: x, standardY: y});

    // Determine how to display dropdown based on where the user clicked the image. The dropdown's triangle should appear right next to the mouse cursor at all times
    if(x >= 8500)
    {
      // Images show on the left when too close to the right edge, ex. [ ]>
      setDropdownCoordinates({...dropdownCoordinates, top: -35, left: -385, bubbleDirection: "right"});
    }
    else if(x <= 1150)
    {
      // Images show on the right when too close to the left edge, ex. <[ ]
      setDropdownCoordinates({...dropdownCoordinates, top: -35, left: 30, bubbleDirection: "left"});
    }
    else if(y <= 1500)
    {
      // Images show on the bottom when too close to the top edge, ex. ^[ ]
      setDropdownCoordinates({...dropdownCoordinates, top: 80, left: 2, bubbleDirection: "top"});
    }
    else
    {
      // Images show on the top when too close to the bottom edge, ex. v[ ]
      setDropdownCoordinates({...dropdownCoordinates, top: -65, left: 2, bubbleDirection: "bottom"})
    }
  };

  function handleClick(e: React.MouseEvent<HTMLElement>)
  {
    // update the coordinates of the user's click and show dropdown
    getClickCoords(e);
    setShowDropdown(true);
  }

  return (
    <main className="p-5 bg-(--off-white) border-2 flex flex-col justify-center gap-5">
      <Navigation level={level}/>
        
      <div onClick={(e) => handleClick(e)} onMouseLeave={() =>setShowDropdown(false)} className="relative self-center">
        <span style={{
        position: "absolute",
        left: coordinates.pageX + dropdownCoordinates.left,
        top: coordinates.pageY + dropdownCoordinates.top,
        transform: "translateX(-50%) translateY(-50%)",
        }}>
          {(showDropdown) && <span onMouseLeave={() => setShowDropdown(false)}><Dropdown level="san_francisco" imageSet={imageSet} bubbleDirection={dropdownCoordinates.bubbleDirection} /></span>}
        </span>
        <img className="" src={`/${level}/image.png`} width="auto" height="auto" alt="A pixorama of San Francisco by eBoy"/>
      </div>

      <StartDialog />
      {/* <EndDialog /> */}  
    </main>
  )
}

export default Gameboard