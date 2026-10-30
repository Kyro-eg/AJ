import { z } from "zod";
import crypto from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { createProduct, deleteProduct, listProducts, updateProduct } from "./db";
import { ADMIN_COOKIE, createAdminToken, sessionCookieOptions } from "./_core/adminSession";

const categorySchema = z.string().trim().min(1).max(80);
const productInput = z.object({
  title: z.string().trim().min(2).max(180),
  category: categorySchema,
  priceCents: z.number().int().nonnegative().max(100000000),
  imageUrl: z.string().trim().min(1).max(1000),
  affiliateUrl: z.string().url().max(1000),
  badge: z.string().trim().max(80).nullable().optional(),
});

const adminOnly = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin authentication required" });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  products: router({
    list: publicProcedure.query(() => listProducts()),
    create: adminOnly.input(productInput).mutation(({ input }) => createProduct(input)),
    update: adminOnly.input(productInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...product } = input;
      return updateProduct(id, product);
    }),
    delete: adminOnly.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteProduct(input.id).then(() => ({ success: true }))),
  }),
  admin: router({
    me: publicProcedure.query(({ ctx }) => ({ isAdmin: ctx.isAdmin })),
    login: publicProcedure.input(z.object({ password: z.string().min(1).max(200) })).mutation(({ ctx, input }) => {
      const configured = process.env.ADMIN_PASSWORD || "ajwears2026";
      const provided = Buffer.from(input.password);
      const expected = Buffer.from(configured);
      const matches = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
      if (!matches) throw new TRPCError({ code: "UNAUTHORIZED", message: "That password is not correct." });
      ctx.res.cookie(ADMIN_COOKIE, createAdminToken(), sessionCookieOptions(ctx.req));
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, { ...sessionCookieOptions(ctx.req), maxAge: 0 });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
