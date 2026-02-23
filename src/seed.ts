import { getPayload } from "payload";
import config from "@payload-config";

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 150;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientLockError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("locktimeout") ||
    message.includes("transienttransactionerror") ||
    message.includes("unable to acquire ix lock")
  );
};

const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientLockError(error) || attempt === RETRY_ATTEMPTS) {
        throw error;
      }

      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
};

const categories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: "#FFB347",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Software Development",
    color: "#7EC8E3",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#D8B5FF",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: "#FFE066",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: "#96E6B3",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#FF9AA2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Design",
    color: "#B5B9FF",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#FFCAB0",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Music",
    color: "#FFD700",
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: "#FF6B6B",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
]

const seed = async () => {
  const payload = await getPayload({ config });

  for (const category of categories) {
    const existingParent = await withRetry(() =>
      payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: category.slug,
          },
        },
        limit: 1,
        pagination: false,
      })
    );

    const parentData = {
      name: category.name,
      slug: category.slug,
      color: category.color,
      parent: null,
    };

    const parentCategory = existingParent.docs[0]
      ? await withRetry(() =>
          payload.update({
            collection: "categories",
            id: existingParent.docs[0].id,
            data: parentData,
            disableTransaction: true,
          })
        )
      : await withRetry(() =>
          payload.create({
            collection: "categories",
            data: parentData,
            disableTransaction: true,
          })
        );

    for (const subCategory of category.subcategories || []) {
      const existingChild = await withRetry(() =>
        payload.find({
          collection: "categories",
          where: {
            slug: {
              equals: subCategory.slug,
            },
          },
          limit: 1,
          pagination: false,
        })
      );

      const childData = {
        name: subCategory.name,
        slug: subCategory.slug,
        parent: parentCategory.id,
      };

      if (existingChild.docs[0]) {
        await withRetry(() =>
          payload.update({
            collection: "categories",
            id: existingChild.docs[0].id,
            data: childData,
            disableTransaction: true,
          })
        );

        continue;
      }

      await withRetry(() =>
        payload.create({
          collection: "categories",
          data: childData,
          disableTransaction: true,
        })
      );
    }
  }
};

try {
  await seed();
  console.log("Seeding completed successfully.");
  process.exit(0);
} catch (error) {
  console.error("Error during seeding:", error);
  process.exit(1);
}