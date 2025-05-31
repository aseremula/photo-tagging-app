import { useState } from 'react'
import ImageIcon from "./ImageIcon";

type GuessResult = "correct" | "incorrect" | "waiting";
interface guessedImageState {
    imagePosition: number;
    result: GuessResult;
}

function Dropdown({ level="san_francisco", imageSet, bubbleDirection } : { level: string, imageSet: Set<number>, bubbleDirection: "left" | "right" | "bottom" | "top" }) {
  const [guessedImage, setGuessedImage] = useState<guessedImageState>({imagePosition: 0, result: "correct"});

  function handleClick(imagePosition: number)
  {
    setGuessedImage({...guessedImage, imagePosition: imagePosition, result: "correct"});
  }

  const NUMBER_OF_IMAGES = 5;
  const renderList = () => {
    const listItems = [];
    for (let imageCounter = 1; imageCounter <= NUMBER_OF_IMAGES; imageCounter++) {
        if(!imageSet.has(imageCounter)) {
            listItems.push(
                <li>
                    {/* TODO: On click, check with API if coordinates are correct */}
                    <button type="button" className="cursor-pointer relative hover:opacity-50">
                        <ImageIcon key={imageCounter} imagePath={`/${level}/${imageCounter}.jpg`} markAsFound={false} />
                    </button>
                </li>
            );
        }
    }
    return listItems;
  };

  return (
    <div className={`speech-bubble-${bubbleDirection}`}>
        <ul className="flex items-center justify-center gap-5 p-3">
            {renderList()}
        </ul>
    </div>
  )
}

export default Dropdown