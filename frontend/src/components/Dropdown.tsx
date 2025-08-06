import { useState, useContext } from 'react';
import type { RefObject, Dispatch, SetStateAction, MouseEvent } from 'react';
import ImageIcon from "./ImageIcon";
import { LevelContext } from '../context/levelContext';

type GuessResult = "correct" | "incorrect" | "waiting" | "loading";
type ImagePosition = 0 | 1 | 2 | 3 | 4 | 5;
interface guessedImageState {
  imagePosition: ImagePosition;
  result: GuessResult;
}

function Dropdown({ imageSet, setImageSet, bubbleDirection, setPlayState, setShowDropdown, dropdownTimeoutRef, coordinates, correctGuessCoordinates, setCorrectGuessCoordinates } : { imageSet: boolean[], setImageSet: Dispatch<SetStateAction<boolean[]>>, bubbleDirection: BubbleDirection, setPlayState: Dispatch<SetStateAction<playStates>>, setShowDropdown: Dispatch<SetStateAction<boolean>>, dropdownTimeoutRef: RefObject<ReturnType<typeof setTimeout>>, coordinates: Coordinates, correctGuessCoordinates: Coordinates[], setCorrectGuessCoordinates: Dispatch<SetStateAction<Coordinates[]>>}) {
  const [guessedImage, setGuessedImage] = useState<guessedImageState>({imagePosition: 0, result: "waiting"});
  const level = useContext(LevelContext);

  async function handleClick(e: MouseEvent<HTMLElement>, imagePosition: ImagePosition)
  {
    e.stopPropagation(); // prevent button click from closing the dropdown as touchscreen users technically left the dropdown's span in the Gameboard component
    setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "loading"});
    const outcomes = {
      SUCCESS: "SUCCESS",
      FAILURE: "FAILURE",
    };
  
    // const path = `https://efind-qk5v.onrender.com/gameboards/${level.levelNumber}/guess`; // TODO: change link to match localhost's
    const path = `http://localhost:3003/gameboards/${level.levelNumber}/guess?coordinateXGuess=${coordinates.standardX}&coordinateYGuess=${coordinates.standardY}&imageNumber=${imagePosition}`;
    const method = "GET";

    const response = await getApiResponse(path, method);  
    if(response)
    {
      if(response.outcome === outcomes.FAILURE)
      {
        throw Error(response.data.description);
      }
      else if(response.outcome === outcomes.SUCCESS)
      {
        console.log(response.data);
        if(response.data.isGuessCorrect)
        {
          setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "correct"});
          setImageSet(response.data.isImageFoundList);
          
          // If guess correct, place marker
          setTimeout(() => {
            // if the marker is placed right away, the user does not have enough time to see the correct image being checkmarked as state is updated. Pause for a moment before adding marker
            setCorrectGuessCoordinates([...correctGuessCoordinates, coordinates]);
          }, 1100);

          if(response.data.isGameComplete)
          {
            setTimeout(() => {
              setPlayState("end_menu");
            }, 1500);  
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
      throw new Error("Failed to get response from API - internal server error");
    }
  }

  async function getApiResponse(path: string, method: string) 
  {
    try
    {
      const headers = {
        'Content-Type': 'application/json'
      };

      const response = await fetch(path, {
        mode: 'cors', 
        method: method, 
        headers: headers,
        credentials: 'include', // must add this when using cookies so credentials (cookies) are sent with request to server
      });

      if(!response.ok)
      {
        throw new Error(`Response status: ${response.status}`);
      }
      else
      {
        const APIData = await response.json();
        return APIData;
      }
    }
    catch(error)
    {
      // As anything (unknown) can be thrown, use a type guard to narrow down the type of error before accessing the message property
      if(error instanceof Error) 
      {
        console.error(error.message);
      }
      else
      {
        console.error(error);
      }
    }
  }

  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= level.numberOfImages; imageCounter++) {
      listItems.push(
        <li key={imageCounter} className="flex items-center justify-center">
          <button type="button" className={`cursor-${(guessedImage.result === "correct" || imageSet[imageCounter-1]) ? "default" : "pointer"} relative ${(guessedImage.imagePosition === 0 || guessedImage.imagePosition === imageCounter || guessedImage.result !== "waiting" || imageSet[imageCounter-1]) ? "opacity-100" : "opacity-50"}`} onMouseEnter={() => (setGuessedImage({...guessedImage, imagePosition: imageCounter as ImagePosition, result: "waiting"}))} onClick={(e) => handleClick(e, imageCounter as ImagePosition)} disabled={(guessedImage.result === "correct" || imageSet[imageCounter-1]) ? true : false} aria-label={`Guess image ${imageCounter} is located here`}>
            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "correct") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-2xl:w-6 lg:max-2xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z"/></svg>}

            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "incorrect") && <svg className="svgEnter z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-168-88-88 224-224-224-224 88-88 224 224 224-224 88 88-224 224 224 224-88 88-224-224-224 224Z"/></svg>}

            {(guessedImage.imagePosition === imageCounter && guessedImage.result === "loading") && <svg className="loadingScreenIcon z-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 fill-(--light-red) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6 xl:max-2xl:w-8 xl:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/></svg>}

            {/* For a11y, show in DOM if the user's guess is correct, incorrect, or waiting to be checked */}
            {(guessedImage.imagePosition === imageCounter) && <p className="aria-invisible">{guessedImage.result}</p>}

            {/* Set opacity and grayscale for the image the user clicked - as long as it's not correct (correct images have their own opacity and grayscale in ImageIcon) or in waiting */}
            <span className={`pointer-events-none ${(guessedImage.imagePosition === imageCounter && guessedImage.result !== "waiting" && guessedImage.result !== "correct") && "grayscale opacity-20"}`}>
              <ImageIcon key={imageCounter} imagePath={`/${level.img}/${imageCounter}.jpg`} markAsFound={imageSet[imageCounter-1]} />
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