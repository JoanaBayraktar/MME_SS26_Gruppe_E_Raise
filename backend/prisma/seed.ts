//KI gestütze Datei, um Backend zu fixxen und standard Demo Session einzurichten

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create a default Dozent if not exists
  const dozent = await prisma.dozent.upsert({
    where: { email: 'default@dozent.de' },
    update: {},
    create: {
      vorname: 'Default',
      nachname: 'Dozent',
      email: 'default@dozent.de',
      passwortHash: 'placeholder_hash',
    },
  });

  // 2. Create a default Veranstaltung if not exists
  // We check by finding the first one or creating one
  let veranstaltung = await prisma.veranstaltung.findFirst({
    where: { kuerzel: 'DEF' },
  });

  if (!veranstaltung) {
    veranstaltung = await prisma.veranstaltung.create({
      data: {
        dozentId: dozent.id,
        name: 'Default Vorlesung',
        kuerzel: 'DEF',
      },
    });
  }

  // 3. Create Session #0000 if not exists
  await prisma.session.upsert({
    where: { code: '0000' },
    update: {},
    create: {
      veranstaltungId: veranstaltung.id,
      name: 'Default Session #0000',
      datum: new Date(),
      startZeit: new Date(),
      qrCode: 'qr_default_0000',
      code: '0000',
    },
  });

  console.log('Database seeded successfully with session #0000!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });