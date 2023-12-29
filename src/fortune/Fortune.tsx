import tarotJson from "@/assets/tarot_card_list.json";
import { Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import cardBack from "@/assets/card_back.png";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import { useMemo } from "react";

function stringifyIndex(n: number) {
  if (n === 0) {
    return "first";
  }
  if (n === 1) {
    return "second";
  }
  if (n === 2) {
    return "third";
  }
}

// TODO APRIL better stringifying of the meanings? maybe ask chatgpt lol

export default function Fortune({
  cards,
  useSessionId,
  questionId,
}: {
  cards: Array<number | null>;
  useSessionId: () => string;
  questionId: string;
}) {
  const sessionId = useSessionId();
  console.log("FORTUNE SESSIONID", sessionId);
  const fortunes = useQuery(api.messages.getFortune, { sessionId, questionId });
  const fortune = useMemo(() => {
    console.log({ fortunes });
    return fortunes ?? [];
  }, [fortunes]);
  return (
    <Stack>
      <Stack
        maxWidth="80%"
        alignSelf="center"
        direction="row"
        alignContent="center"
      >
        {cards.map((card, i) => {
          const tarotCard = tarotJson.find((x) => x.number === card);
          return (
            <Stack
              key={i}
              spacing="10px"
              maxHeight="100%"
              divider={<Divider orientation="vertical" flexItem />}
            >
              <img
                src={cardBack}
                alt={`${tarotCard?.name}`}
                style={{ width: "150px", height: "auto", alignSelf: "center" }}
              />
              <p style={{ maxWidth: "80%", alignSelf: "center" }}>
                Your {stringifyIndex(i)} card is the {tarotCard?.name}, which is
                associated with {tarotCard?.meaning.toLowerCase()}
              </p>
            </Stack>
          );
        })}
      </Stack>
      <p style={{ alignSelf: "center", marginTop: "10px" }}>
        {fortune.length > 0 ? fortune[0].text : "LOADING"}
      </p>
    </Stack>
  );
}
