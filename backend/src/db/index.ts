const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deleteLevels = await prisma.level.deleteMany({})

    const levelOne = await prisma.level.create({
        data: {
          levelNumber: 1,
          image: "san_francisco",
          title: "San Francisco",
          answers: {
            createMany: {
                data: [
                    { imageNumber: 1, imageDesc: "A person spray painting the walls of a nearby building", coordinateX: 45.67, coordinateY: 343.67 },
                    { imageNumber: 2, imageDesc: "A young girl petting a pigeon", coordinateX: 456.67, coordinateY: 37643.67 },
                    { imageNumber: 3, imageDesc: "A homeless person sitting on the sidewalk", coordinateX: 244.67, coordinateY: 3567.67 },
                    { imageNumber: 4, imageDesc: "A hippie resting on a bus while holding a flower", coordinateX: 4332.67, coordinateY: 34.67 },
                    { imageNumber: 5, imageDesc: "A woman in a hot pink dress walking through the streets", coordinateX: 45.67, coordinateY: 33.67 },
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