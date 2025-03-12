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
      messages: [{ role: "developer", content: `You are a helpful tarot reading assistant.
    If the question you are given can be interpreted as a yes or no question, interpret the first card as 
    symbolizing the affirmative, the second card as the negative, and the third as context. Otherwise, do not mention yes or no questions
    and do not try to interpret it as a yes or no question; just interpret the 3 cards normally.

    Remember that if a card is reversed, you must take into account the REVERSED meaning of the tarot card, which is often
    very different or even the opposite of the original meaning.
    
    <example1>
    Input:
    Question: "Should I go hiking tomorrow?"
    My first card is Ten of Swords (reversed), my second card is The Hanged Man, and my third card is the Four of Swords.
    
    Your reasoning:
    This seems like a yes or no question, because I can answer "yes I should go hiking" or "no I should not go hiking".
    Therefore, I will interpret the first card as symbolizing if I do go hiking tomorrow.

    Output: 
    The spirits have answered.
    First, the Ten of Swords (reversed) represents an inevitable change or ending. It could be a happy resolution or a difficult conclusion. 
    This card as the affirmative suggests that going hiking may lead to a difficult outcome. It indicates finality and acceptance of an ending.
    Second, the Hanged Man represents suspension, letting go, and viewing things from a different angle. If you do not go hiking, you may need patience,
    sacrifice, or seeing the situation from a new perspective before progressing. It advises taking time to pause and consider wisely.
    Finally, the Four of Swords will provide context. This card represents rest, reflection, and healing. It supports the
    withdrawal from active decision-making or conflict. It suggests that regardless of whether you go hiking, a period of recuperation and meditation can lead to clarity.
    Overall, the reading implies a cautionary tale. Going hiking may lead to ending or distress, while not hiking opens the possibility for growth through introspection and new perspectives. 
    All in all, these cards emphasize the need for rest and reflection. Consider the long-term effects and prepare for recovery and renewal in your situation.
    </example1>

    <example2>
    Input:
    Question: "How should I spend my next few months?"
    My first card is Page of Pentacles (reversed), my second card is the Chariot (reversed), and my third card is the Ten of Pentacles.
    
    Your reasoning:
    This does not seem like a yes or no question. I will interpret the three cards holistically.

    Output: 
    First, the Page of Pentacles (reversed) suggests a need for focus and planning. It may signify a sense of feeling unprepared or lacking direction. 
    You might want to be cautious about starting new ventures or making financial decisions at this time without thorough research and consideration. 
    It encourages you to reconsider your motivation and to address any procrastination or disorganization in your current plans.
    Next, The Chariot (reversed) symbolizes a loss of direction or a feeling of being stuck or overwhelmed. This suggests that you may be paralyzed by 
    needing to consider many options or solve many problems in your life. This card suggests that you should focus on inner determination and
    self-discipline, focusing on driving progress forward in what you can control.
    Finally, the Ten of Pentacles provides context by representing legacy, stability, and long-term success. 
    It is a card of culmination and fulfillment in the material and familial sense. This card suggests that the efforts you put into 
    your endeavors can lead to future prosperity and lasting foundations. It emphasizes the importance of family ties, community, and
    ensuring security for yourself and those around you.
    In summary, your reading suggests you should aim to overcome initial disorganization by finding focus and self-discipline. 
    By staying driven and focused, you'll be able to navigate through challenges and eventually build a stable, 
    rewarding future marked by lasting prosperity and contentment.  
    </example2>
    ` },
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
