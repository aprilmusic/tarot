import tarotJson from "@/assets/tarot_card_list.json";
import { Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import cardBack from "@/assets/card_back.png";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import { useMemo } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { IMAGES } from "@/assets/tarot_card_fronts/images.js";

// function stringifyIndex(n: number) {
//   if (n === 0) {
//     return "first";
//   }
//   if (n === 1) {
//     return "second";
//   }
//   if (n === 2) {
//     return "third";
//   }
// }

function parseFortune(rawFortune: string) {
  if (rawFortune === "I cannot reply at this time.") {
    return (
      <Stack style={{ marginTop: "10px" }} spacing="2px">
        <p>
          Your advanced fortune analysis is unavailable at this time. Please
          check out https://www.tarot.com/tarot/cards for more detail.
        </p>
      </Stack>
    );
  }
  return (
    <Stack style={{ marginTop: "10px" }} spacing="2px">
      <p>{rawFortune}</p>
    </Stack>
  );
}

export default function Fortune({
  cards,
  reversalStates,
  useSessionId,
  questionId,
}: {
  cards: Array<number | null>;
  reversalStates: Array<boolean>;
  useSessionId: () => string;
  questionId: string;
}) {
  const sessionId = useSessionId();
  const fortunes = useQuery(api.messages.getFortune, { sessionId, questionId });
  const fortune = useMemo(() => {
    return fortunes ? fortunes[0] : null;
  }, [fortunes]);

  return (
    <Stack className="fadeIn">
      <Stack maxWidth="80%" alignSelf="center" direction="row">
        <br></br>
        {cards.map((card, i) => {
          const tarotCard = tarotJson.find((x) => x.number === card);
          return (
            <Stack
              key={i}
              spacing="10px"
              maxHeight="100%"
              divider={<Divider orientation="vertical" flexItem />}
              // Stagger the fade-in
              className={
                i === 0 ? "fadeIn" : i === 1 ? "fadeInLater" : "fadeInLatest"
              }
              width="33%"
            >
              <img
                src={tarotCard?.image ? IMAGES[tarotCard.image] : cardBack}
                alt={`${tarotCard?.name}`}
                style={{
                  width: "150px",
                  height: "auto",
                  alignSelf: "center",
                  transform: reversalStates[i] ? "rotate(180deg)" : "",
                }}
              />
              <Stack
                style={{
                  alignSelf: "center",
                  padding: "5px",
                }}
              >
                <p
                  style={{
                    alignSelf: "center",
                    minHeight: "50px",
                  }}
                >
                  {tarotCard?.name} {reversalStates[i] ? "(reversed)" : ""}
                </p>
                <p style={{ fontStyle: "italic" }}>
                  Associations: {tarotCard?.meaning.toLowerCase()}
                </p>
              </Stack>
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
            marginTop: "20px",
            marginBottom: "10px",
          }}
          spacing="45px"
          className="fadeInLatest"
        >
          <p style={{ alignSelf: "center" }}>
            Your detailed fortune is loading. This can take up to a minute.
          </p>
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
