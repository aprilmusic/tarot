/* eslint-disable no-constant-condition */
import { v } from "convex/values";
import { map, sleep } from "modern-async";
import OpenAI from "openai";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { internal } from "./_generated/api";
import {
  ActionCtx,
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

    const { id: threadId } = await openai.beta.threads.create();

    const { id: lastMessageId } = await openai.beta.threads.messages.create(
      threadId,
      { role: "user", content: message }
    );

    const { id: runId } = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID!,
    });

    await pollForAnswer(ctx, { threadId, sessionId, lastMessageId, runId, questionId });
  },
});



async function pollForAnswer(
  ctx: ActionCtx,
  args: {
    sessionId: string;
    threadId: string;
    runId: string;
    lastMessageId: string;
    questionId: string;
  }
) {
  const { sessionId, threadId, runId, lastMessageId, questionId } = args;
  const openai = new OpenAI();
  while (true) {
    await sleep(500);
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    switch (run.status) {
      case "failed":
      case "expired":
      case "cancelled":
        await ctx.runMutation(internal.serve.addFortune, {
          text: "I cannot reply at this time.",
          sessionId,
          questionId,
        });
        return;
      case "completed": {
        const { data: newMessages } = await openai.beta.threads.messages.list(
          threadId,
          { after: lastMessageId, order: "asc" }
        );
        await map(newMessages, async ({ content }) => {
          const text = content
            .filter((item): item is MessageContentText => item.type === "text")
            .map(({ text }) => text.value)
            .join("\n\n");
          await ctx.runMutation(internal.serve.addFortune, { text, sessionId, questionId });
        });
        return;
      }
    }
  }
}

export const addFortune = internalMutation(
  async (ctx, { text, sessionId, questionId }: { text: string; sessionId: string; questionId: string }) => {
    await ctx.db.insert("fortunes", {
      text,
      sessionId,
      questionId,
    });
  }
);
