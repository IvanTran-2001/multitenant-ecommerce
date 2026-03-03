import { DEFAULT_LIMIT } from "@/constants";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";

export const tagsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                cursor: z.coerce.number().int().min(1).default(1),
                limit: z.coerce.number().int().min(1).max(50).default(DEFAULT_LIMIT),
            }))
        .query(async ({ ctx, input }) => {

            const data = await ctx.db.find({
                collection: 'tags',
                page: input.cursor,
                limit: input.limit,
            })

            return data
        }),
})