import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    url: v.string(),
    text: v.string(),
    fileId: v.union(v.string(), v.null()),
  }).index("byUrl", ["url"]),
  fortunes: defineTable({
    sessionId: v.string(),
    questionId: v.string(),
    text: v.string(),
  }).index("bySessionId", ["sessionId"]),
});
