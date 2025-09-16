import { useState, useContext } from 'react';
import type { RefObject, MouseEvent } from 'react';
import ImageIcon from "./ImageIcon";
import { LevelContext } from '../context/levelContext';
import type { Coordinates, BubbleDirection, PlayState } from '../types/customTypes';
import { fetchApi, type AvailableMethods, type HostType } from '../functions/fetchApi';

type GuessResult = "correct" | "incorrect" | "waiting" | "loading";
type ImagePosition = 0 | 1 | 2 | 3 | 4 | 5;
interface GuessedImageState {
  imagePosition: ImagePosition;
  result: GuessResult;
}

type DropdownComponentProps = {
  imageSet: boolean[];
  setImageSet: (newImageSet: boolean[]) => void;
  bubbleDirection: BubbleDirection;
  setPlayState: (newPlayState: PlayState) => void;
  setShowDropdown: (newShowDropdown: boolean) => void;
  dropdownTimeoutRef: RefObject<ReturnType<typeof setTimeout>>;
  coordinates: Coordinates;
  correctGuessCoordinates: Coordinates[];
  setCorrectGuessCoordinates: (newCorrectGuessCoordinates: Coordinates[]) => void;
}

function Dropdown({ imageSet, setImageSet, bubbleDirection, setPlayState, setShowDropdown, dropdownTimeoutRef, coordinates, correctGuessCoordinates, setCorrectGuessCoordinates } : DropdownComponentProps) {
  const [guessedImage, setGuessedImage] = useState<GuessedImageState>({imagePosition: 0, result: "waiting"});
  const levelContext = useContext(LevelContext);

  async function handleClick(e: MouseEvent<HTMLElement>, imagePosition: ImagePosition)
  {
    e.stopPropagation(); // prevent button click from closing the dropdown as touchscreen users technically left the dropdown's span in the Gameboard component
    setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "loading"});
    const outcomes = {
      SUCCESS: "SUCCESS",
      FAILURE: "FAILURE",
    };
    
    const hostType: HostType = "web";
    const path = `/gameboards/${levelContext.levelInfo.levelNumber}/guess?coordinateXGuess=${coordinates.standardX}&coordinateYGuess=${coordinates.standardY}&imageNumber=${imagePosition}`;
    const method: AvailableMethods = "GET";

    const response = await fetchApi(hostType, path, method, null);  
    if(response)
    {
      if(response.outcome === outcomes.FAILURE)
      {
        alert("Sorry, an error occurred while processing your request. Please try again later.");
        setGuessedImage({...guessedImage, imagePosition: 0, result: "waiting"});
        console.error(response.description);
      }
      else if(response.outcome === outcomes.SUCCESS)
      {
        if(response.data.isGuessCorrect)
        {
          setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "correct"});
          setImageSet(response.data.isImageFoundList);
          
          // If guess correct, place marker
          setCorrectGuessCoordinates([...correctGuessCoordinates, coordinates]);
          
          if(response.data.isGameComplete)
          {
            setPlayState("end_menu");  
          }
        }
        else
        {
          setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "incorrect"});
        }

        // Close dropdown after x seconds - note that if user's guess is correct, this timeout will be ignored and the dropdown will automatically close when setCorrectGuessCoordinates (state) is set. This value causes the Gameboard to refresh
        clearTimeout(dropdownTimeoutRef.current);
        dropdownTimeoutRef.current = setTimeout(() => {
          // when (in)correct, close dropdown in x seconds, setting guessed image back on waiting  
          setShowDropdown(false);    
        }, 5000);
      }  
    }  
    else
    {
      alert("Sorry, an error occurred while processing your request. Please try again later.");
      setGuessedImage({...guessedImage, imagePosition: 0, result: "waiting"});
      console.error("Failed to get response from API - internal server error");
    }
  }

  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= levelContext.levelInfo.numberOfImages; imageCounter++) {
      listItems.push(
        <li key={imageCounter} className="flex items-center justify-center">
          <button type="button" className={`cursor-${(guessedImage.result === "correct" || imageSet[imageCounter-1]) ? "default" : "pointer"} relative ${(guessedImage.imagePosition === 0 || guessedImage.imagePosition === imageCounter || guessedImage.result !== "waiting" || imageSet[imageCounter-1]) ? "opacity-100" : "opacity-50"}`} onMouseEnter={() => (setGuessedImage({...guessedImage, imagePosition: imageCounter as ImagePosition, result: "waiting"}))} onClick={(e) => handleClick(e, imageCounter as ImagePosition)} disabled={(guessedImage.result === "correct" || imageSet[imageCounter-1]) ? true : false} aria-label={`Guess person ${imageCounter} is located here`}>
            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "correct") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-2xl:w-6 lg:max-2xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z"/></svg>}

            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "incorrect") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-168-88-88 224-224-224-224 88-88 224 224 224-224 88 88-224 224 224 224-88 88-224-224-224 224Z"/></svg>}

            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "loading") && <svg className="loadingScreenIcon z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/></svg>}

            {/* For a11y, show in DOM if the user's guess is correct, incorrect, or waiting to be checked */}
            {(guessedImage.imagePosition === imageCounter) && <p className="aria-invisible">{guessedImage.result}</p>}

            {/* Set opacity and grayscale for the image the user clicked - as long as it's not correct (correct images have their own opacity and grayscale in ImageIcon) or in waiting */}
            <span className={`pointer-events-none ${(guessedImage.imagePosition === imageCounter && guessedImage.result !== "waiting" && guessedImage.result !== "correct") && "grayscale opacity-20"}`}>
              <ImageIcon key={imageCounter} imagePath={`/${levelContext.levelInfo.img}/${imageCounter}.jpg`} imageNumber={imageCounter} markAsFound={imageSet[imageCounter-1]} />
            </span>
          </button>
        </li>
      );
    }
    return listItems;
  };

  return (
    <section className={`lg:max-xl:w-[35vw] xl:max-2xl:w-[31vw] speech-bubble-${bubbleDirection}`} onMouseLeave={() => (guessedImage.result === "waiting" && setShowDropdown(false))}>
      <ul className={`p-3 grid gap-5 grid-cols-[repeat(5,52px)] lg:max-2xl:gap-[5%] lg:max-2xl:grid-cols-[repeat(auto-fit,minmax(27px,1fr))] lg:max-2xl:p-2`}>
        {renderList()}
      </ul>
    </section>
  )
}

export default Dropdown;