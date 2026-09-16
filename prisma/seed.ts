import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const sampleKnives = [
  {
    name: "Nordic Chef 210",
    description:
      "A versatile 210mm gyuto-style chef knife with a thin grind and comfortable octagonal handle.",
    style: "Gyuto",
    bladeSteel: "AEB-L",
    handleMaterial: "Stabilized maple burl",
    price: 48500,
    status: "AVAILABLE" as const,
    imageUrl: "https://images.unsplash.com/photo-1594042615177-251f45e75f9d?w=800&q=80",
  },
  {
    name: "Forest Hunter",
    description: "Full-tang bushcraft knife built for camp tasks and field dressing.",
    style: "Hunter",
    bladeSteel: "CPM-3V",
    handleMaterial: "Micarta",
    price: 32000,
    status: "SOLD" as const,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  },
  {
    name: "Santoku Classic",
    description: "Lightweight santoku with a wa-handle and razor-thin edge.",
    style: "Santoku",
    bladeSteel: "VG-10",
    handleMaterial: "Ho wood",
    price: 27500,
    status: "RESERVED" as const,
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80",
  },
  {
    name: "Petty Utility",
    description: "Compact petty knife for detail work and small prep tasks.",
    style: "Petty",
    bladeSteel: "AEB-L",
    handleMaterial: "G10",
    status: "AVAILABLE" as const,
    imageUrl: "https://images.unsplash.com/photo-1583394294304-1d0a295a4cf8?w=800&q=80",
  },
  {
    name: "Trail Companion",
    description: "Compact fixed blade for hiking and everyday carry outdoors.",
    style: "EDC",
    bladeSteel: "N690",
    handleMaterial: "Carbon fiber",
    price: 19500,
    status: "AVAILABLE" as const,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  },
]

async function main() {
  await prisma.artisanRequest.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.knifeImage.deleteMany()
  await prisma.knife.deleteMany()
  await prisma.artisanProfile.deleteMany()
  await prisma.user.deleteMany()

  const user1 = await prisma.user.create({
    data: {
      name: "Elena Voss",
      email: "elena@example.com",
      role: "ARTISAN",
      artisanProfile: {
        create: {
          displayName: "Elena Voss",
          bio: "Bladesmith specializing in Scandinavian-inspired kitchen knives. Each piece is forged by hand in a small workshop in Oregon.",
          location: "Portland, OR",
          website: "https://example.com",
          instagram: "https://instagram.com/elena.voss.knives",
          facebook: "https://facebook.com/elenavossknives",
          x: "https://x.com/elenavoss",
          address: "1420 Forge Lane, Portland, OR 97209, USA",
          siret: "123 456 789 00012",
          imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        },
      },
    },
    include: { artisanProfile: true },
  })

  const user2 = await prisma.user.create({
    data: {
      name: "Marcus Tan",
      email: "marcus@example.com",
      role: "ARTISAN",
      artisanProfile: {
        create: {
          displayName: "Marcus Tan",
          bio: "Custom hunting and outdoor knives with a focus on durable steels and ergonomic handles.",
          location: "Denver, CO",
        },
      },
    },
    include: { artisanProfile: true },
  })

  const user3 = await prisma.user.create({
    data: {
      name: "Yuki Nakamura",
      email: "yuki@example.com",
      role: "ARTISAN",
      artisanProfile: {
        create: {
          displayName: "Yuki Nakamura",
          bio: "Traditional Japanese-style knives with modern performance steels.",
          location: "Seattle, WA",
        },
      },
    },
    include: { artisanProfile: true },
  })

  const profiles = [user1.artisanProfile!, user2.artisanProfile!, user3.artisanProfile!]

  for (const [index, sample] of sampleKnives.entries()) {
    const profile = profiles[index % profiles.length]
    const { imageUrl, ...knifeData } = sample

    await prisma.knife.create({
      data: {
        ...knifeData,
        artisanProfileId: profile.id,
        images: {
          create: {
            url: imageUrl,
            isCover: true,
            displayOrder: 0,
            focus: "FULL",
            angle: "FRONT",
          },
        },
      },
    })
  }

  console.log("Seed complete: 3 artisan profiles, 5 knives with KnifeImage records")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
