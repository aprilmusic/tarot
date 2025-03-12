import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { FormEvent, useEffect, useState } from "react";
import CardClicker from "./cardDeck/CardClicker";
import { TextField, Tooltip, Fade } from "@mui/material";
import Fortune from "./fortune/Fortune";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api.js";
import tarotJson from "@/assets/tarot_card_list.json";
import { v4 as uuidv4 } from "uuid";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";

// Consistent transition timing variables for cohesive feel
const TRANSITION_DURATION = "0.4s";
const TRANSITION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const TRANSITION = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;

const theme = createTheme({
  palette: {
    primary: {
      main: "#A0A0D5",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#E4E4F3",
      // light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
      // contrastText: "#47008F",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: `all ${TRANSITION}`,
          "&:hover": {
            transform: "scale(1.05) translateY(-2px)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          },
          "&:active": {
            transform: "scale(0.98) translateY(1px)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            transition: "all 0.1s ease",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          transition: TRANSITION,
        },
      },
    },
  },
});

const STORE = (typeof window === "undefined" ? null : window)?.sessionStorage;
const STORE_KEY = "ConvexSessionId";

function useSessionId() {
  const [sessionId] = useState(
    () => STORE?.getItem(STORE_KEY) ?? crypto.randomUUID()
  );

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    STORE?.setItem(STORE_KEY, sessionId);
  }, [sessionId]);

  return sessionId;
}

function App() {
  const [clickerOpen, setClickerOpen] = useState(false);
  // State to track the value of the input field
  const [inputValue, setInputValue] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [questionId, setQuestionId] = useState<string>("");
  const [fortuneCards, setFortuneCards] = useState<Array<number | null>>([
    null,
    null,
    null,
  ]);
  const [reversalStates, setReversalStates] = useState<Array<boolean>>([
    false,
    false,
    false,
  ]);

  const sessionId = useSessionId();

  const sendMessage = useMutation(api.messages.send);

  // Function to handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuestion(inputValue);
  };

  // For random selection of cards
  function fisherYatesShuffle(array: Array<number>) {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }

    return shuffledArray;
  }

  const resetButton = (
    <Button
      className="fadeIn"
      color="secondary"
      onClick={() => {
        setFortuneCards([null, null, null]);
        setQuestion("");
        setClickerOpen(!clickerOpen);
        setQuestionId("");
      }}
    >
      Ask another question
    </Button>
  );

  // Prompt engineering
  const readFortune = async () => {
    // Randomly select 3 cards
    const deckOrder = fisherYatesShuffle([...Array(78).keys()]);
    const selectedCards = deckOrder.slice(0, 3);
    setFortuneCards(selectedCards);
    // Randomly decide whether they are reversed
    setReversalStates([false, false, false].map((_) => Math.random() > 0.5));

    const message = `I am seeking a tarot reading to answer the question <question>${question}</question>. 

    My first card is ${tarotJson.find((x) => x.number === deckOrder[0])?.name}${
      reversalStates[0] ? " which is reversed" : ""
    }, my second card is ${
      tarotJson.find((x) => x.number === deckOrder[1])?.name
    }${reversalStates[1] ? " which is reversed" : ""}, and my third card is ${
      tarotJson.find((x) => x.number === deckOrder[2])?.name
    }${
      reversalStates[2] ? " which is reversed" : ""
    }. Take into account whether the cards are reversed. Please help me
    interpret these cards, and begin your response with, "The spirits have answered".
    `;
    const newQuestionId = uuidv4();
    setQuestionId(newQuestionId);
    await sendMessage({ sessionId, message, questionId: newQuestionId });
  };

  return (
    <ThemeProvider theme={theme}>
      <main
        className="container flex flex-col gap-8"
        style={{ transition: TRANSITION }}
      >
        <Stack
          alignSelf="center"
          alignContent="center"
          justifyContent="center"
          minHeight="90%"
          gap="16px"
          sx={{
            transition: TRANSITION,
            position: "relative",
          }}
        >
          <Fade in={question === ""} timeout={800}>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                display: question === "" ? "block" : "none",
              }}
            >
              <Tooltip
                title="Ask a question, then select 3 cards, and we will read your tarot for you!"
                placement="top-end"
              >
                <h1
                  className="my-8 text-center"
                  style={{
                    transition: TRANSITION,
                    animation: "none",
                  }}
                >
                  Read your tarot here
                </h1>
              </Tooltip>
            </div>
          </Fade>

          {question === "" ? (
            <Fade in={question === ""} timeout={600}>
              <Stack
                alignSelf="center"
                spacing="8px"
                width="100%"
                sx={{ transition: TRANSITION }}
              >
                <form onSubmit={handleSubmit}>
                  <Stack minWidth="80%" sx={{ transition: TRANSITION }}>
                    <TextField
                      defaultValue="What should I be focusing on?"
                      color="secondary"
                      value={inputValue}
                      margin="normal"
                      onChange={handleInputChange}
                      fullWidth={true}
                      sx={{
                        input: { color: "white", opacity: 0.8 },
                        fieldset: {
                          borderColor: "white",
                          transition: TRANSITION,
                        },
                        label: {
                          color: "white",
                          fontFamily: "Avenir",
                          transition: TRANSITION,
                        },
                        minWidth: "80%",
                        transition: TRANSITION,
                      }}
                      InputProps={{
                        classes: {
                          notchedOutline: "whiteTextField",
                        },
                        sx: { transition: TRANSITION },
                      }}
                    />
                    <Button
                      color="secondary"
                      type="submit"
                      sx={{
                        transition: `all ${TRANSITION}`,
                        opacity: inputValue ? 1 : 0.9,
                        transform: "translateY(0)",
                      }}
                    >
                      Select my cards
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Fade>
          ) : !clickerOpen ? (
            <Fade in={question !== "" && !clickerOpen} timeout={600}>
              <Stack
                alignSelf="center"
                maxWidth="80%"
                sx={{ transition: TRANSITION }}
              >
                <h2
                  className="text-center"
                  style={{
                    transition: TRANSITION,
                    animation: "none",
                  }}
                >
                  Your question: {question}
                </h2>
                <Button
                  color="secondary"
                  onClick={() => setQuestion("")}
                  sx={{ transition: TRANSITION }}
                >
                  Change question
                </Button>
              </Stack>
            </Fade>
          ) : (
            <Fade in={question !== "" && clickerOpen} timeout={600}>
              <Stack
                maxWidth="80%"
                alignSelf="center"
                direction="row"
                alignContent="center"
                sx={{ transition: TRANSITION }}
              >
                <h2 style={{ transition: TRANSITION }}>
                  Your question: {question}
                </h2>
              </Stack>
            </Fade>
          )}

          {question.length > 0 && (
            <Fade in={question.length > 0} timeout={700}>
              <div
                style={{
                  textAlign: "center",
                  transition: TRANSITION,
                }}
              >
                <Button
                  color="secondary"
                  onClick={() => {
                    // Reset everything
                    setFortuneCards([null, null, null]);
                    setClickerOpen(!clickerOpen);
                    setQuestionId("");
                  }}
                  sx={{
                    transition: TRANSITION,
                    animation: "none",
                  }}
                >
                  {clickerOpen ? "Reselect" : "Select"} my cards
                </Button>
              </div>
            </Fade>
          )}

          <Fade
            in={clickerOpen && !fortuneCards.some((x) => x)}
            timeout={800}
            style={{ transitionDelay: "100ms" }}
          >
            <div
              style={{
                display:
                  clickerOpen && !fortuneCards.some((x) => x)
                    ? "block"
                    : "none",
                width: "100%",
                transition: TRANSITION,
              }}
            >
              {clickerOpen && !fortuneCards.some((x) => x) && (
                <CardClicker readFortune={readFortune} />
              )}
            </div>
          </Fade>

          <Fade in={clickerOpen && fortuneCards.some((x) => x)} timeout={1000}>
            <div
              style={{
                display:
                  clickerOpen && fortuneCards.some((x) => x) ? "block" : "none",
                width: "100%",
                transition: TRANSITION,
              }}
            >
              {clickerOpen && fortuneCards.some((x) => x) && (
                <Fortune
                  cards={fortuneCards}
                  reversalStates={reversalStates}
                  useSessionId={useSessionId}
                  questionId={questionId}
                  resetButton={resetButton}
                />
              )}
            </div>
          </Fade>
        </Stack>
      </main>
      <Fade in={true} timeout={1500} style={{ transitionDelay: "500ms" }}>
        <footer style={{ transition: TRANSITION }}>
          <p
            style={{
              textAlign: "center",
              paddingBottom: "10px",
              paddingTop: "10px",
              justifySelf: "center",
              width: "100%",
              opacity: 0.5,
              transition: TRANSITION,
            }}
          >
            Any feedback? Fill out this{" "}
            <a
              target="_blank"
              href="https://airtable.com/app3n1XnvByn5IQh1/pagfEn87lCa2B9J1e/form"
              style={{
                textDecoration: "underline",
                transition: TRANSITION,
              }}
            >
              form
            </a>
          </p>
        </footer>
      </Fade>
    </ThemeProvider>
  );
}

export default App;
