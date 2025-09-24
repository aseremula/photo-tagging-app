require("dotenv").config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add levels and fake leaderboard to test database
async function loadTestLevels()
{
    const deleteLevels = await prisma.level.deleteMany({});
    const testLevelOne = await prisma.level.create({
        data: {
          levelNumber: 1,
          image: "san_francisco",
          title: "San Francisco",
          answers: {
            createMany: {
                data: [
                    { imageNumber: 1, imageDesc: "A person spray painting the walls of a nearby building", coordinateX: 2491, coordinateY: 6144 },
                    { imageNumber: 2, imageDesc: "A young girl petting a pigeon", coordinateX: 6408, coordinateY: 2843 },
                    { imageNumber: 3, imageDesc: "A homeless person sitting on the sidewalk", coordinateX: 3430, coordinateY: 2831 },
                    { imageNumber: 4, imageDesc: "A hippie resting on a bus while holding a flower", coordinateX: 7116, coordinateY: 8565 },
                    { imageNumber: 5, imageDesc: "A woman in a hot pink dress walking through the streets", coordinateX: 495, coordinateY: 9541 },
                ],
            },
          },
          leaderboard: {
            create: {
                scores: {
                    createMany: {
                        data: [
                            { name: "Blue", time: 5},
                            { name: "Green", time: 2},
                            { name: "Purple", time: 4},
                            { name: "Orange", time: 1},
                            { name: "Yellow", time: 3},
                        ],
                    },
                },
            },
          },
        },
    });
}

// Add levels to the database
async function loadLevels()
{
    const deleteLevels = await prisma.level.deleteMany({});
    const levelOne = await prisma.level.create({
        data: {
          levelNumber: 1,
          image: "san_francisco",
          title: "San Francisco",
          answers: {
            createMany: {
                data: [
                    { imageNumber: 1, imageDesc: "A person spray painting the walls of a nearby building", coordinateX: 2491, coordinateY: 6144 },
                    { imageNumber: 2, imageDesc: "A young girl petting a pigeon", coordinateX: 6408, coordinateY: 2843 },
                    { imageNumber: 3, imageDesc: "A homeless person sitting on the sidewalk", coordinateX: 3430, coordinateY: 2831 },
                    { imageNumber: 4, imageDesc: "A hippie resting on a bus while holding a flower", coordinateX: 7116, coordinateY: 8565 },
                    { imageNumber: 5, imageDesc: "A woman in a hot pink dress walking through the streets", coordinateX: 495, coordinateY: 9541 },
                ],
            },
          },
          leaderboard: {
            create: {},
          },
        },
        include: {
            leaderboard: true,
            answers: true,
        },
    });
    console.log(levelOne);
}

async function main() {
    // If not testing, load database with just image answers. Otherwise, if testing, load a fake leaderboard too
    if(process.env.TESTING === "false") {
        loadLevels();
    }
    else {
        loadTestLevels();
    }
    
    // To test if levels/answers are present and accurate:
    // const allLevels = await prisma.level.findMany();
    // console.log(allLevels);

    // const allAnswers = await prisma.answer.findMany();
    // console.log(allAnswers);
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
});