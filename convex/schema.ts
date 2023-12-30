import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  fortunes: defineTable({
    sessionId: v.string(),
    questionId: v.string(),
    text: v.string(),
  }).index("bySessionId", ["sessionId"]),
});
