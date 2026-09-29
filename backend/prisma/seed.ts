import { PrismaClient, SessionStatus, UmfrageStatus, FrageStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding database...')

  // 1. Create a sample Dozent (Lecturer)
  const dozent = await prisma.dozent.upsert({
    where: { email: 'max.mustermann@uni.de' },
    update: {},
    create: {
      vorname: 'Max',
      nachname: 'Mustermann',
      email: 'max.mustermann@uni.de',
      passwortHash: '$2b$10$YourHashedPasswordHerePlaceholder', // placeholder hash
    },
  })

  console.log(`Created dozent: ${dozent.vorname} ${dozent.nachname}`)

  // 2. Create a Veranstaltung (Course)
  const veranstaltung = await prisma.veranstaltung.create({
    data: {
      dozentId: dozent.id,
      name: 'Software Engineering I',
      kuerzel: 'SE1',
    },
  })

  console.log(`Created veranstaltung: ${veranstaltung.name}`)

  // 3. Create a Session
  const session = await prisma.session.create({
    data: {
      veranstaltungId: veranstaltung.id,
      name: 'Einführung in Architekturmuster',
      datum: new Date(),
      startZeit: new Date(),
      status: SessionStatus.LAUFEND,
      qrCode: 'https://example.com/qr/se1-session-1',
      code: 'SE1-01',
      wiederholend: false,
    },
  })

  console.log(`Created session: ${session.name}`)

  // 4. Create a Live-Umfrage (Poll) with options
  const umfrage = await prisma.umfrage.create({
    data: {
      sessionId: session.id,
      frageText: 'Welches Architekturmuster bevorzugen Sie für Microservices?',
      status: UmfrageStatus.AKTIV,
      antwortoptionen: {
        create: [
          { text: 'Event-Driven Architecture' },
          { text: 'Layered Architecture' },
          { text: 'Microkernel Architecture' },
        ],
      },
    },
  })

  console.log(`Created poll for session ID: ${umfrage.sessionId}`)

  // 5. Create a student question
  await prisma.frage.create({
    data: {
      sessionId: session.id,
      text: 'Wann nutzen wir am besten CQRS?',
      kapitel: 'Kapitel 3',
      folienNr: 12,
      status: FrageStatus.NEU,
      studentToken: 'sample-student-token-123',
    },
  })

  console.log('🌱 Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })