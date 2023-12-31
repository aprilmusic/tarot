import tarotJson from "@/assets/tarot_card_list.json";
import { Grid } from "@mui/material";
import Stack from "@mui/material/Stack";
import cardBack from "@/assets/card_back.png";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import { useMemo } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { IMAGES } from "@/assets/tarot_card_fronts/images.js";
import { ReactJSXElement } from "node_modules/@emotion/react/dist/declarations/types/jsx-namespace.js";

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
  const fortuneSplit = rawFortune.split("\n\n");
  return (
    <Stack style={{ marginTop: "10px" }} spacing="2px">
      {fortuneSplit.map((fortuneLine) => (
        <p>{fortuneLine}</p>
      ))}
    </Stack>
  );
}

export default function Fortune({
  cards,
  reversalStates,
  useSessionId,
  questionId,
  resetButton,
}: {
  cards: Array<number | null>;
  reversalStates: Array<boolean>;
  useSessionId: () => string;
  questionId: string;
  resetButton: ReactJSXElement;
}) {
  const sessionId = useSessionId();
  const fortunes = useQuery(api.messages.getFortune, { sessionId, questionId });
  const fortune = useMemo(() => (fortunes ? fortunes[0] : null), [fortunes]);

  return (
    <Stack className="fadeIn" style={{ marginTop: "5px" }}>
      <Grid
        id="flexCardContainer"
        container
        spacing={2}
        justifyContent="center"
      >
        <br></br>
        {cards.map((card, i) => {
          const tarotCard = tarotJson.find((x) => x.number === card);
          return (
            <Grid
              item
              key={i}
              spacing="10px"
              maxHeight="100%"
              // Stagger the fade-in
              className={`${
                i === 0 ? "fadeIn" : i === 1 ? "fadeInLater" : "fadeInLatest"
              } flexCard`}
              display="flex"
              flexDirection="column"
              justifyContent="center"
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
            </Grid>
          );
        })}
      </Grid>

      {fortune && fortune.text ? (
        <Stack spacing="5px">
          <p style={{ alignSelf: "center", marginTop: "5px", maxWidth: "80%" }}>
            {parseFortune(fortune.text)}
          </p>
          {resetButton}
        </Stack>
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
