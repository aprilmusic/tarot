import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";



export const getFortune = query({
  args: {
    sessionId: v.string(),
    questionId: v.string()
  },
  handler: async (ctx, { sessionId, questionId }) => {
    const fortunes = await ctx.db
    .query("fortunes")
    .filter((q) => q.and(q.eq(q.field("questionId"), questionId), q.eq(q.field("sessionId"), sessionId)))
    .order("desc")
    .take(1)
   return fortunes; 
  },
});

export const send = mutation({
  args: {
    message: v.string(),
    sessionId: v.string(),
    questionId: v.string(),
  },
  handler: async (ctx, { message, sessionId, questionId }) => {
    await ctx.scheduler.runAfter(0, internal.serve.answer, {
      sessionId,
      message,
      questionId,
    });
  },
});

