# Photo Tagging App (eFIND) - Frontend
This project is a part of [The Odin Project's NodeJS course](https://www.theodinproject.com/lessons/nodejs-where-s-waldo-a-photo-tagging-app#introduction)
> [Live Demo](https://efind-8ubk.onrender.com/)

# About
As mentioned in the [project overview](https://github.com/aseremula/photo-tagging-app), this full-stack project, titled eFIND, is inspired by [_Where's Waldo?_](https://en.wikipedia.org/wiki/Where's_Wally%3F), a popular series of children's puzzle books where various people, places, and objects must be found inside a crowded illustration. By passing third-party cookies and fetching the corresponding API endpoint, eFIND's Typescript and React-based frontend directs gameplay via 3 main components: a start menu, gameboard, and end menu.

- The start menu details the game's instructions and controls when the game's frontend stopwatch begins. Once the user enters a valid name, the frontend stopwatch begins and the gameboard appears. The frontend stopwatch is entirely for the user; the actual time is controlled by the project's backend to prevent score hacking.

- The gameboard displays a large illustration from [eBoy's Pixorama collection](https://db.eboy.com/pool/~Pixorama/1?q=project) that, upon clicking, uses a dropdown menu for the user to submit (X,Y) coordinate guesses for characters via eFIND's backend. While click logic normalizes coordinates for both user clicks and gameboard markers across different screensizes, smaller devices are not compatible with eFIND as the illustration must be very large to clearly see all its details; the frontend therefore checks for device compatibility.

- The end menu displays the user's score and the global leaderboard after the user finds all characters in the gameboard, fetched via eFIND's backend API. However, if the backend API cannot be fetched, the time shown on the frontend stopwatch is used for the user's score and the global leaderboard is omitted. The user can also use the end menu to play the game again. 

In addition to the UI being heavily inspired by [eBoy's website](https://www.eboy.com/), the project features a responsive frontend using CSS and TailwindCSS to allow gameplay on compatible phones, tablets, PCs, and everything in-between. Unit tests following Test-Driven Development (TDD) methods are also provided for the frontend using Vitest and React Testing Library.

# Built With
- HTML
- CSS & TailwindCSS
- TypeScript
- npm
- React
- Vite
- Vitest
- React Testing Library (RTL)

# Additional Credits
- [eBoy](https://www.eboy.com/) for the [San Francisco Pixorama landscape](https://www.eboy.com/products/san-francisco-digital-wallpaper)!
- [eBoy](https://www.eboy.com/) and other official aspects of eBoy products, including assets used this project, are trademarks of eBoy. This project is fan-made and bears no affiliation with eBoy.