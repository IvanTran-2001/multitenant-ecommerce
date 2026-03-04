import { getPayload } from "payload";
import config from "@payload-config";
import fs from "fs";
import path from "path";

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
  // Unreachable: loop always returns or throws, but TypeScript requires this
  throw lastError;
};
interface SeedCategory {
  name: string;
  slug: string;
  color?: string;
  subcategories?: { name: string; slug: string }[];
}

const categories: SeedCategory[] = [
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
];

const tagNames = [
  "beginner",
  "advanced",
  "intermediate",
  "free",
  "premium",
  "video",
  "ebook",
  "template",
  "bundle",
  "course",
  "trending",
  "new",
  "bestseller",
  "popular",
  "featured",
];

const productTemplates = [
  (name: string) => ({
    name: `${name} Fundamentals`,
    price: 19,
    description: `A complete introduction to ${name}.`,
  }),
  (name: string) => ({
    name: `${name} Masterclass`,
    price: 49,
    description: `Take your ${name} skills to the next level.`,
  }),
  (name: string) => ({
    name: `${name} Essentials`,
    price: 29,
    description: `Everything you need to know about ${name}.`,
  }),
];

const uploadLocalMedia = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  alt: string,
) => {
  const data = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const ext = path.extname(name).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".avif": "image/avif",
    ".webp": "image/webp",
  };
  const mimetype = mimeMap[ext] ?? "image/jpeg";
  return withRetry(() =>
    payload.create({
      collection: "media",
      data: { alt },
      file: { data, name, mimetype, size: data.length },
      disableTransaction: true,
    }),
  );
};

const fetchAndUploadMedia = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  name: string,
  alt: string,
) => {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimetype = res.headers.get("content-type") ?? "image/jpeg";
  return withRetry(() =>
    payload.create({
      collection: "media",
      data: { alt },
      file: { data: buffer, name, mimetype, size: buffer.length },
      disableTransaction: true,
    }),
  );
};

const extraAccounts = [
  {
    email: "marcus@demo.com",
    username: "marcus",
    storeName: "Marcus Creative",
  },
  { email: "priya@demo.com", username: "priya", storeName: "Priya Digital" },
];

const seed = async () => {
  const payload = await getPayload({ config });

  const adminUser = await withRetry(() =>
    payload.create({
      collection: "users",
      data: {
        email: "admin@demo.com",
        username: "admin",
        password: "password",
        roles: ["super-admin"],
      },
      disableTransaction: true,
    }),
  );

  const profileDir = path.resolve("public/profile");
  const profileImages = [
    await uploadLocalMedia(
      payload,
      path.join(profileDir, "profile1.avif"),
      "Admin profile picture",
    ),
    await uploadLocalMedia(
      payload,
      path.join(profileDir, "profile2.jpg"),
      "Marcus profile picture",
    ),
    await uploadLocalMedia(
      payload,
      path.join(profileDir, "profile1.avif"),
      "Priya profile picture",
    ),
  ];

  const adminTenant = await withRetry(() =>
    payload.create({
      collection: "tenants",
      draft: false,
      data: {
        name: "Demo Store",
        slug: "admin",
        stripeAccountId: "mock",
        image: profileImages[0]!.id,
      },
      disableTransaction: true,
    }),
  );

  await withRetry(() =>
    payload.update({
      collection: "users",
      id: adminUser.id,
      data: { tenants: [{ tenant: adminTenant.id }] },
      disableTransaction: true,
    }),
  );

  const extraTenants: { id: string }[] = [];
  for (let i = 0; i < extraAccounts.length; i++) {
    const account = extraAccounts[i]!;
    const user = await withRetry(() =>
      payload.create({
        collection: "users",
        data: {
          email: account.email,
          username: account.username,
          password: "password",
          roles: ["user"],
        },
        disableTransaction: true,
      }),
    );

    const tenant = await withRetry(() =>
      payload.create({
        collection: "tenants",
        draft: false,
        data: {
          name: account.storeName,
          slug: account.username,
          stripeAccountId: "mock",
          image: profileImages[i + 1]?.id ?? profileImages[0]!.id,
        },
        disableTransaction: true,
      }),
    );

    await withRetry(() =>
      payload.update({
        collection: "users",
        id: user.id,
        data: { tenants: [{ tenant: tenant.id }] },
        disableTransaction: true,
      }),
    );

    extraTenants.push({ id: tenant.id });
  }

  // All tenants in round-robin order: admin, marcus, priya
  const allTenants = [{ id: adminTenant.id }, ...extraTenants];

  // Pre-fetch 9 product placeholder images
  console.log("Fetching product placeholder images...");
  const productImageURLs = Array.from(
    { length: 9 },
    (_, i) => `https://picsum.photos/seed/product${i + 1}/400/400`,
  );
  const productImages = await Promise.all(
    productImageURLs.map((url, i) =>
      fetchAndUploadMedia(
        payload,
        url,
        `product-placeholder-${i + 1}.jpg`,
        `Product image ${i + 1}`,
      ),
    ),
  );

  // Seed tags
  const seededTags: { id: string }[] = [];
  for (const tagName of tagNames) {
    const existing = await withRetry(() =>
      payload.find({
        collection: "tags",
        where: { name: { equals: tagName } },
        limit: 1,
        pagination: false,
      }),
    );
    const existingTag = existing.docs.at(0);
    if (existingTag?.id) {
      seededTags.push({ id: existingTag.id });
    } else {
      const created = await withRetry(() =>
        payload.create({
          collection: "tags",
          data: { name: tagName },
          disableTransaction: true,
        }),
      );
      seededTags.push({ id: created.id });
    }
  }

  const seededSubcategories: { id: string; name: string }[] = [];

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
      }),
    );
    const existingParentDoc = existingParent.docs.at(0);

    const parentData = {
      name: category.name,
      slug: category.slug,
      color: category.color,
      parent: null,
    };

    const parentCategory = existingParentDoc?.id
      ? await withRetry(() =>
          payload.update({
            collection: "categories",
            id: existingParentDoc.id,
            data: parentData,
            disableTransaction: true,
          }),
        )
      : await withRetry(() =>
          payload.create({
            collection: "categories",
            data: parentData,
            disableTransaction: true,
          }),
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
        }),
      );
      const existingChildDoc = existingChild.docs.at(0);

      const childData = {
        name: subCategory.name,
        slug: subCategory.slug,
        parent: parentCategory.id,
      };

      if (existingChildDoc?.id) {
        await withRetry(() =>
          payload.update({
            collection: "categories",
            id: existingChildDoc.id,
            data: childData,
            disableTransaction: true,
          }),
        );
        seededSubcategories.push({
          id: existingChildDoc.id,
          name: subCategory.name,
        });
        continue;
      }

      const createdChild = await withRetry(() =>
        payload.create({
          collection: "categories",
          data: childData,
          disableTransaction: true,
        }),
      );
      seededSubcategories.push({ id: createdChild.id, name: subCategory.name });
    }
  }

  let productIndex = 0;
  for (const subcategory of seededSubcategories) {
    for (const template of productTemplates.map((fn) => fn(subcategory.name))) {
      const shuffled = [...seededTags].sort(() => Math.random() - 0.5);
      const assignedTags = shuffled
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .map((t) => t.id);
      const assignedTenant = allTenants[productIndex % allTenants.length]!;
      const assignedImage = productImages[productIndex % productImages.length]!;
      productIndex++;

      await withRetry(() =>
        payload.create({
          collection: "products",
          data: {
            ...template,
            category: subcategory.id,
            tenant: assignedTenant.id,
            refundPolicy: "30-day",
            tags: assignedTags,
            image: assignedImage.id,
          },
          disableTransaction: true,
        }),
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
