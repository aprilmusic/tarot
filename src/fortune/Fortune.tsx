import tarotJson from "@/assets/tarot_card_list.json";
import { Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import cardBack from "@/assets/card_back.png";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import { useMemo } from "react";
import PuffLoader from "react-spinners/PuffLoader";

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

function parseFortune(rawFortune: string) {
  const fortuneJson = JSON.parse(rawFortune);
  return (
    <Stack style={{ marginTop: "10px" }} spacing="2px">
      <p>{fortuneJson.intro}</p>
      <p>{fortuneJson.first_card}</p>
      <p>{fortuneJson.second_card}</p>
      <p>{fortuneJson.third_card}</p>
      <p>{fortuneJson.conclusion}</p>
    </Stack>
  );
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
  const fortunes = useQuery(api.messages.getFortune, { sessionId, questionId });
  const fortune = useMemo(() => {
    return fortunes ? fortunes[0] : null;
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

      {fortune && fortune.text ? (
        <p style={{ alignSelf: "center", marginTop: "5px", maxWidth: "80%" }}>
          {parseFortune(fortune.text)}
        </p>
      ) : (
        <Stack
          style={{
            alignSelf: "center",
            alignContent: "center",
            marginTop: "10px",
          }}
          spacing="45px"
        >
          <p style={{ alignSelf: "center" }}>Your fortune is loading </p>
          <PuffLoader
            loading={true}
            size={40}
            color="gray"
            aria-label="Loading Spinner"
            style={{
              alignSelf: "center",
              position: "fixed",
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
