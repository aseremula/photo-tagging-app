# Photo Tagging App (eFIND)
This project is a part of [The Odin Project's NodeJS course](https://www.theodinproject.com/lessons/nodejs-where-s-waldo-a-photo-tagging-app#introduction)
> [Live Demo](https://efind-8ubk.onrender.com/)

# About
This full-stack app, titled eFIND, is inspired by [_Where's Waldo?_](https://en.wikipedia.org/wiki/Where's_Wally%3F), a popular series of children's puzzle books where various people, places, and objects must be found inside a crowded illustration. Similar to a photo tagging app, eFIND uses a Typescript with React frontend to present an anonymous user with a large illustration from [eBoy's Pixorama collection](https://db.eboy.com/pool/~Pixorama/1?q=project) that contains several people the user is meant to find. As the user makes selections for each character, feedback is given from a Typescript with NodeJS and Express backend to indicate if, based on the coordinates found in a PostgreSQL database, they are correct or not. Using session data and cookies to store the user's progress, the REST API-only backend also keeps track of how long it takes for the user to find all characters before submitting their score to the leaderboard, preventing users from hacking their score. 

eFIND features a responsive frontend using CSS and TailwindCSS to allow gameplay on compatible phones, tablets, PCs, and everything in-between. Additionally, following Test Driven Development (TDD) methods, unit tests are provided for both the frontend (using Vitest and React Testing Library) and backend (using Jest, Supertest, and SuperAgent).

**This project is split into two parts: a frontend and a backend. To view the specifics of each part, please visit the corresponding README:**
> [Frontend](https://github.com/aseremula/photo-tagging-app/tree/main/frontend#readme)
>
> [Backend REST API](https://github.com/aseremula/photo-tagging-app/tree/main/backend#readme)

# Built With
- HTML
- CSS & TailwindCSS
- TypeScript
- React
- Vite
- Vitest
- React Testing Library (RTL)
- NodeJS
- Express
- Prisma ORM
- PostgreSQL & Neon
- Jest
- Supertest & SuperAgent

# Additional Credits
- [eBoy](https://www.eboy.com/) for the [San Francisco Pixorama landscape](https://www.eboy.com/products/san-francisco-digital-wallpaper)!
- [eBoy](https://www.eboy.com/) and other official aspects of eBoy products, including assets used this project, are trademarks of eBoy. This project is fan-made and bears no affiliation with eBoy.