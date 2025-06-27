import { useState, useContext } from 'react';
import type { RefObject, Dispatch, SetStateAction, MouseEvent } from 'react';
import ImageIcon from "./ImageIcon";
import { LevelContext } from '../context/levelContext';

type Coordinates = { pageX: number, pageY: number, standardX: number, standardY: number };
type GuessResult = "correct" | "incorrect" | "waiting";
type ImagePosition = 0 | 1 | 2 | 3 | 4 | 5;
interface guessedImageState {
  imagePosition: ImagePosition;
  result: GuessResult;
}

function Dropdown({ imageSet, bubbleDirection, setShowDropdown, dropdownTimeoutRef, coordinates, correctGuessCoordinates, setCorrectGuessCoordinates } : { imageSet: Set<number>, bubbleDirection: "left" | "right" | "bottom" | "top",  setShowDropdown: Dispatch<SetStateAction<boolean>>, dropdownTimeoutRef: RefObject<ReturnType<typeof setTimeout>>, coordinates: Coordinates, correctGuessCoordinates: Coordinates[], setCorrectGuessCoordinates: Dispatch<SetStateAction<Coordinates[]>>}) {
  const [guessedImage, setGuessedImage] = useState<guessedImageState>({imagePosition: 0, result: "waiting"});
  const level = useContext(LevelContext);

  function handleClick(e: MouseEvent<HTMLElement>, imagePosition: ImagePosition)
  {
    e.stopPropagation(); // prevent button click from closing the dropdown as touchscreen users technically left the dropdown's span in the Gameboard component
    setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "correct"}); // TODO: remove when satisfied with UI - this is a temp. replacement for calling API
    
    // If guess correct, place marker
    setCorrectGuessCoordinates([...correctGuessCoordinates, coordinates]);

    // When clicking an image, clear initial timeout to close dropdown and reset it to a new time after user's guess has been submitted. This feature is for touchscreens; as the user will not be able to close the dropdown by mousing out of it, closing the dropdown after a set amount of time prevents it from hiding part of the image that may have what the user is searching for

    // TODO: move below code so it appears after the user's guess is sent to the API and deems it correct/incorrect
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      // TODO: when correct, close dropdow in x seconds and set guessed image back on waiting  
      setShowDropdown(false);
    }, 5000);
  }

  const NUMBER_OF_IMAGES = 5;
  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= NUMBER_OF_IMAGES; imageCounter++) {
      if(!imageSet.has(imageCounter)) {
        listItems.push(
          <li key={imageCounter} className="flex items-center justify-center">
            {/* TODO: On click, check with API if coordinates are correct */}
            <button type="button" className={`cursor-${(guessedImage.result === "correct") ? "default" : "pointer"} relative ${(guessedImage.imagePosition === 0 || guessedImage.imagePosition === imageCounter || guessedImage.result !== "waiting") ? "opacity-100" : "opacity-50"}`} onMouseEnter={() => (setGuessedImage({...guessedImage, imagePosition: imageCounter as ImagePosition, result: "waiting"}))} onClick={(e) => handleClick(e, imageCounter as ImagePosition)} disabled={(guessedImage.result === "correct") ? true : false} aria-label={`Guess image ${imageCounter} is located here`}>
              {(guessedImage.imagePosition === imageCounter && guessedImage.result === "correct") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-2xl:w-6 lg:max-2xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z"/></svg>}

              {(guessedImage.imagePosition === imageCounter && guessedImage.result === "incorrect") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-168-88-88 224-224-224-224 88-88 224 224 224-224 88 88-224 224 224 224-88 88-224-224-224 224Z"/></svg>}

              {/* For a11y, show in DOM if the user's guess is correct, incorrect, or waiting to be checked */}
              {(guessedImage.imagePosition === imageCounter) && <p className="aria-invisible">{guessedImage.result}</p>}

              <span className={`pointer-events-none ${(guessedImage.imagePosition === imageCounter && guessedImage.result !== "waiting") && "grayscale opacity-20"}`}>
                <ImageIcon key={imageCounter} imagePath={`/${level.img}/${imageCounter}.jpg`} markAsFound={false} />
              </span>
            </button>
          </li>
        );
      }
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

export default Dropdown