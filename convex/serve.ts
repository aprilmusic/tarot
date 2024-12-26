/* eslint-disable no-constant-condition */
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
} from "./_generated/server";

export const answer = internalAction({
  args: {
    sessionId: v.string(),
    message: v.string(),
    questionId: v.string(),
  },
  handler: async (ctx, { sessionId, message, questionId }) => {
    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      messages: [{ role: "developer", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      model: "gpt-4o",
    });

    const text = completion.choices[0].message.content;
    if (!text) {
      await ctx.runMutation(internal.serve.addFortune, { text: "I cannot reply at this time.", sessionId, questionId });
      return
    }

    await ctx.runMutation(internal.serve.addFortune, { text, sessionId, questionId });
  },
});



export const addFortune = internalMutation(
  async (ctx, { text, sessionId, questionId }: { text: string; sessionId: string; questionId: string }) => {
    await ctx.db.insert("fortunes", {
      text,
      sessionId,
      questionId,
    });
  }
);
