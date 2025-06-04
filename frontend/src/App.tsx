import { useState, useEffect } from 'react'
// import './App.css'
import Navigation from "./components/Navigation"
import Gameboard from "./components/Gameboard"

type DeviceCompatibility = "compatible" | "rotate" | "incompatible" | "unknown" | "loading";

function App() {
  const WIDTH_BREAKPOINT = 600; // only support responsive design for devices with this screen width in pixels or higher due to using such a wide/detailed image
  const [compatibility, setCompatibility] = useState<DeviceCompatibility>("loading");
 
  useEffect(() => {
    isDeviceCompatible(); // for initial load of app
    window.addEventListener("resize", isDeviceCompatible);
    return () => window.removeEventListener("resize", isDeviceCompatible);
  }, []);

  function isDeviceCompatible()
  {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if(width < WIDTH_BREAKPOINT && height >= WIDTH_BREAKPOINT)
    {
      // screen too small in portrait mode - move to landscape mode to play the game
      setCompatibility("rotate");
    }
    else if(width < WIDTH_BREAKPOINT && height < WIDTH_BREAKPOINT)
    {
      // screen too small in both portrait and landscape mode - can't play on this device
      setCompatibility("incompatible");
    }
    else
    {
      // can play in their current mode (portrait or landscape)
      setCompatibility("compatible");
    }
  }

  return (
    <div className="">
      {(compatibility === "compatible") ? 
        <Gameboard level={"san_francisco"}/>
        :
        <div className="bg-(--off-white) min-h-[100vh] flex flex-col gap-4 justify-start font-(family-name:--roboto-400) text-base">
          <div className="bg-(--tan) p-5 flex items-center justify-end gap-2 pointer-events-none border-b-(--aqua) border-b-1 border-dashed">
            <img src="/icon.webp" width="65px" height="auto" alt="eBoy's Blockbob Eater"/>
            <h1 className="text-5xl font-(family-name:--bodoni-400) italic text-(--black)">eFIND</h1> 
          </div>
          
          <div className="m-5 p-5 bg-(--white) flex flex-col gap-1 justify-center shadow-lg">
            {(compatibility === "incompatible" || compatibility === "unknown") && 
            <>
            <svg className="self-center w-13 h-13 fill-(--gray) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M260-100v-163.08q-37.84-16.23-67.34-43t-50.2-60.84q-20.69-34.08-31.57-73.16Q100-479.15 100-520q0-149.54 106.39-244.77Q312.78-860 479.97-860q167.18 0 273.61 95.23Q860-669.54 860-520q0 40.85-10.89 79.92-10.88 39.08-31.57 73.16-20.7 34.07-50.2 60.84-29.5 26.77-67.34 43.07V-100H260Zm60-60h48.46v-70.77h70.77V-160h81.54v-70.77h70.77V-160H640v-142q37.23-10.15 66.73-31.35 29.5-21.19 50.25-50.01 20.75-28.83 31.89-63.62Q800-481.77 800-520q0-125-88.5-202.5T480-800q-143 0-231.5 77.5T160-520q0 38.23 11.13 73.02 11.14 34.79 31.89 63.62 20.75 28.82 50.56 50.01 29.8 21.2 66.42 31.35v142Zm103.85-200h112.3L480-472.31 423.85-360Zm-83.78-87.69q29.85 0 51.04-21.26 21.2-21.26 21.2-51.12 0-29.85-21.26-51.04-21.26-21.2-51.12-21.2-29.85 0-51.04 21.26-21.2 21.26-21.2 51.12 0 29.85 21.26 51.04 21.26 21.2 51.12 21.2Zm280 0q29.85 0 51.04-21.26 21.2-21.26 21.2-51.12 0-29.85-21.26-51.04-21.26-21.2-51.12-21.2-29.85 0-51.04 21.26-21.2 21.26-21.2 51.12 0 29.85 21.26 51.04 21.26 21.2 51.12 21.2ZM480-160Z"/></svg>

            <h2 className="font-(family-name:--bodoni-400) italic text-4xl text-(--aqua)">Oops!</h2>
            <h2 className="font-bold bg-(--neon-yellow) text-(--light-red) text-lg max-w-fit">{`Error: ${(compatibility === "incompatible") ? "Incompatible Device" : "Internal Client Error"}`}</h2>
            {(compatibility === "incompatible") && <p>Looks like your device's screen is too small to play comfortably. Please use a device with a larger screen to play!</p>}
            {(compatibility === "unknown") && <p>Seems like something went wrong inside the client. Please try again later!</p>}
            </>
            }

            {(compatibility === "rotate") && 
            <>
            <svg className="self-center w-13 h-13 fill-(--gray) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M504.46-205.85 205.69-505.23q-10.08-10.14-15.57-23.05-5.5-12.91-5.5-26.74 0-13.83 5.5-26.72 5.49-12.9 15.57-23.03l149.54-149.54q10.14-10.23 23.05-15.34 12.91-5.12 26.74-5.12 13.83 0 26.72 5.12 12.9 5.11 23.03 15.34l298.77 298.77q10.08 10.14 15.58 23.05 5.49 12.91 5.49 26.74 0 13.83-5.49 26.72-5.5 12.9-15.58 23.03L604-205.85q-10.14 10.23-23.05 15.35-12.91 5.11-26.74 5.11-13.82 0-26.72-5.11-12.9-5.12-23.03-15.35Zm40.92-43.38q3.47 3.46 8.85 3.46 5.39 0 8.85-3.46l147.69-147.69q3.46-3.46 3.46-8.85 0-5.38-3.46-8.85L413.85-711.54Q410.38-715 405-715q-5.39 0-8.85 3.46L248.46-563.85Q245-560.39 245-555q0 5.38 3.46 8.85l296.92 296.92ZM480-20q-94.87 0-178.73-35.94-83.85-35.94-146.62-98.71-62.77-62.77-98.71-146.62Q20-385.13 20-480h60q0 75.62 26.88 143.69 26.89 68.08 73.81 120.85 46.93 52.77 111.31 87.35 64.39 34.57 139.39 43.8L309.85-205.85 352-248 570.31-29.69q-22.16 4.46-44.85 7.07Q502.77-20 480-20Zm400-460q0-75.62-26.88-143.69-26.89-68.08-73.81-120.85-46.93-52.77-111.31-87.35-64.39-34.57-139.39-43.8l121.54 121.54L608-712 389.69-930.31q21.74-4.84 44.74-7.27Q457.42-940 480-940q95.15 0 178.81 35.96 83.65 35.96 146.46 98.77 62.81 62.81 98.77 146.46Q940-575.15 940-480h-60Zm-400.38-.38Zm-104.77-74.85q12.3 0 20.42-8.52 8.11-8.51 8.11-19.87 0-12.3-8.11-20.42-8.11-8.11-20.51-8.11-11.45 0-19.88 8.11-8.42 8.11-8.42 20.51 0 11.45 8.52 19.88 8.52 8.42 19.87 8.42Z"/></svg>
            <p className="self-center text-(--aqua)">Please rotate your device to play!</p>
            </>
            }

            {(compatibility === "loading") && 
            <>
            <svg className="self-center w-13 h-13 fill-(--gray) pointer-events-none"  xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-440v-80h80v80h-80Zm-80 80v-80h80v80h-80Zm160 0v-80h80v80h-80Zm80-80v-80h80v80h-80Zm-320 0v-80h80v80h-80Zm-67.69 300q-29.92 0-51.12-21.19Q140-182.39 140-212.31v-535.38q0-29.92 21.19-51.12Q182.39-820 212.31-820h535.38q29.92 0 51.12 21.19Q820-777.61 820-747.69v535.38q0 29.92-21.19 51.12Q777.61-140 747.69-140H212.31ZM280-200h80v-80h-80v80Zm160 0h80v-80h-80v80Zm320 0v-80 80Zm-560-80h80v-80h80v80h80v-80h80v80h80v-80h80v80h80v-80h-80v-80h80v-307.69q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46V-440h80v80h-80v80Zm12.31 80H200v-560h12.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM760-440v80-80ZM600-280v80h80v-80h-80Z"/></svg>

            <p className="self-center text-(--aqua)">Gathering pixels...</p>
            </>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default App