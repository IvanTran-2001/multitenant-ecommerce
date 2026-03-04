import { Category, Media, Tenant } from "@/payload-types";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { Sort, Where } from "payload";
import { z } from "zod";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT, MAX_PAGE_LIMIT } from "@/constants";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.coerce.number().int().min(1).default(1),
        limit: z.coerce
          .number()
          .int()
          .min(1)
          .max(MAX_PAGE_LIMIT)
          .default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = "-createdAt";

      if (input.sort === "trending") {
        sort = "createdAt";
      } else if (input.sort === "hot_and_new") {
        sort = "-createdAt";
      }

      if (input.minPrice) {
        where.price = {
          ...where.price,
          greater_than_equal: input.minPrice,
        };
      }

      if (input.maxPrice) {
        where.price = {
          ...where.price,
          less_than_equal: input.maxPrice,
        };
      }

      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      }

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1,
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            // Because of 'depth: 1' we are confident doc will be a type of Category
            ...(doc as Category),
            subcategories: undefined,
          })),
        }));

        const subcategorySlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategorySlugs.push(
            ...parentCategory.subcategories.map((sub) => sub.slug),
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategorySlugs],
          };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...data,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
