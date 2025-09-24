const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export default async function loadTestLevels()
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