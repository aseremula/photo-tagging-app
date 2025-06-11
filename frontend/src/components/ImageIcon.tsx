function ImageIcon({ imagePath="", markAsFound=false } : { imagePath: string, markAsFound: boolean }) {
  
  return (
    <div className={`min-w-[31px] min-h-[31px] max-w-13 max-h-13 pointer-events-none rounded-sm overflow-hidden flex items-center justify-center ${imagePath==="" && "bg-(--light-red)"}`}>
    {/* If image path exists, show image. Otherwise, show ? */}
    {(imagePath !== "") ?
      <>
        <img className={`relative ${(markAsFound) && "grayscale opacity-20"}`} src={imagePath} width="100%" height="auto" alt="A snippet from eBoy's San Francisco Pixorama"/>
        {(markAsFound) && <svg className="absolute w-10 h-10 fill-(--light-red) pointer-events-none lg:max-2xl:w-6 lg:max-2xl:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z"/></svg>}
      </>
      :
      <svg className="w-7 h-7 fill-(--neon-yellow) pointer-events-none lg:max-2xl:w-6 lg:max-2xl:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M453.23-338.46q0-54.85 16.81-91.5 16.81-36.66 69.19-82.5 36.39-32.92 54.81-62.5t18.42-66.66q0-53.3-36.73-88.76-36.73-35.47-100.35-35.47-51.76 0-82.5 24.08-30.73 24.08-49.42 59.92l-43-20.15q25.62-50.92 68.54-80.62 42.92-29.69 106.38-29.69 88.85 0 136.89 50.81 48.04 50.81 48.04 118.96 0 43.85-19.19 80.12-19.2 36.27-55.97 68.96-55.15 48.54-69.5 79.19-14.34 30.65-14.34 75.81h-48.08ZM475.38-120q-16.07 0-28.03-11.96-11.97-11.96-11.97-28.04t11.97-28.04Q459.31-200 475.38-200q16.08 0 28.04 11.96T515.38-160q0 16.08-11.96 28.04T475.38-120Z"/></svg>
    }
    </div>
  )
}

export default ImageIcon