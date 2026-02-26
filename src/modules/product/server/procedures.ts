import { Category } from "@/payload-types";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { Where } from "payload";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                category: z.string().nullable().optional(),
            }))
        .query(async ({ ctx, input }) => {
            const where: Where = {};

            if (input.category) {
                const categoriesData = await ctx.db.find({
                    collection: 'categories',
                    limit: 1,
                    depth: 1,
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        }
                    }
                });

                const formattedData = categoriesData.docs.map((doc) => ({
                    ...doc,
                    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                        // Because of 'depth: 1' we are confident doc will be a type of Category
                        ...(doc as Category),
                        subcategories: undefined
                    }))
                }))

                const subcategorySlugs = [];
                const parentCategory = formattedData[0];

                if (parentCategory) {
                    subcategorySlugs.push(
                        ...parentCategory.subcategories.map((sub) => 
                            sub.slug
                        ))
                }

                where['category.slug'] = {
                    in: [parentCategory.slug, ...subcategorySlugs]
                }
            }

            const data = await ctx.db.find({
                collection: 'products',
                depth: 1,
                where,
            })

            return data
        }),
})