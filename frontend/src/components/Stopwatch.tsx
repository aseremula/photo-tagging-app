import { useState, useEffect } from 'react';
import { format, getTime } from "date-fns";
import type { StopwatchStatus } from '../types/customTypes';

type StopwatchComponentProps = {
  startTime: number;
  endTime: number;
  setEndTime: (newEndTime: number) => void;
  stopwatchStatus: StopwatchStatus;
  setStopwatchStatus: (newStopwatchStatus: StopwatchStatus) => void;
}

function Stopwatch({ startTime, endTime, setEndTime, stopwatchStatus, setStopwatchStatus } : StopwatchComponentProps) {
    const [time, setTime] = useState(0);
    const [isOvertime, setIsOvertime] = useState(false);
    const MAX_TIME_MILLISECONDS = 3599990; // 59:59.59 time in milliseconds
    const timeFormat = "mm:ss.SS";
    
    useEffect(() => {
      if(stopwatchStatus === "reset")
      {
        setTime(0);
      }
      else if(stopwatchStatus === "on")
      {
        // Update stopwatch every 10ms until it reaches overtime/max time alloted. At that point, stop the timer at the max time
        const interval = setInterval(() => {
          const newTime = (getTime(new Date()) - startTime);
          if(newTime <= MAX_TIME_MILLISECONDS)
          {
            setTime(newTime);
          }
          else
          {
            setTime(MAX_TIME_MILLISECONDS);
            setIsOvertime(true);
            setStopwatchStatus("off");
          }
        }, 10);
                
        return () => clearInterval(interval);
      }
      else if(stopwatchStatus === "off")
      {
        // Record the end time so it can be shared with other components. This is especially important when the API call to end and record the game fails (meaning we must take the Stopwatch time as the user's final score) or the user reaches the max time
        setEndTime(time);
      }
      else if(stopwatchStatus === "custom")
      {
        // The custom time is set when the API call to end and record the game succeeds - update the Stopwatch time with the end time returned by the API 
        setTime(endTime);
      }
  }, [startTime, endTime, setEndTime, stopwatchStatus, setStopwatchStatus, time]);

  return (
    <>    
      {(stopwatchStatus !== "text") ? 
        <>
          <svg className="min-w-8 min-h-8 max-w-13 max-h-13 fill-(--neon-yellow) pointer-events-none lg:max-2xl:w-8 lg:max-2xl:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-132q-64 0-120-24t-98-66q-42-42-66-98t-24-120q0-64 24-120t66-98q42-42 98-66t120-24q64 0 120 24t98 66q42 42 66 98t24 120q0 64-24 120t-66 98q-42 42-98 66t-120 24Zm0-308Zm130 150 20-20-136-136v-194h-28v206l144 144ZM240-810l20 20-130 130-20-20 130-130Zm480 0 130 130-20 20-130-130 20-20ZM480-160q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Z"/></svg>
          <div className="w-[200px] lg:max-xl:w-[105px] xl:max-2xl:w-[120px]">
            <p className={(isOvertime && stopwatchStatus === "on") ? `overtimeText` : undefined}>{format(new Date(time), timeFormat)}</p>
          </div>
        </>
        :
        <p className="successText">Success!</p>
      }
    </>
  )
}

export default Stopwatch;