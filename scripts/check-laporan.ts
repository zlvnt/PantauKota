import { prisma } from '../src/lib/prisma';

async function main() {
  const laporan = await prisma.laporan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, judul: true, foto: true, createdAt: true },
  });
  console.log(JSON.stringify(laporan, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
