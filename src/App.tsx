import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { FormEvent, useEffect, useState } from "react";
import CardClicker from "./cardDeck/CardClicker";
import { TextField } from "@mui/material";
import Fortune from "./fortune/Fortune";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api.js";
import tarotJson from "@/assets/tarot_card_list.json";
import { v4 as uuidv4 } from "uuid";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";

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

    const isQuestionYesOrNo =
      question.toLowerCase().startsWith("should") ||
      question.toLowerCase().startsWith("will") ||
      question.toLowerCase().startsWith("is") ||
      question.toLowerCase().startsWith("does") ||
      question.toLowerCase().startsWith("can");

    const message = `I am seeking a tarot reading to answer the question ${question}. My first card is ${
      tarotJson.find((x) => x.number === deckOrder[0])?.name
    }${reversalStates[0] ? " reversed" : ""}, my second card is ${
      tarotJson.find((x) => x.number === deckOrder[1])?.name
    }${reversalStates[1] ? " reversed" : ""}, and my third card is ${
      tarotJson.find((x) => x.number === deckOrder[2])?.name
    }${
      reversalStates[2] ? " which is reversed" : "which is not reversed"
    }. Take into account whether the cards are reversed. Please help me
    interpret these cards, and begin your response with, "The spirits have answered"
    ${
      isQuestionYesOrNo
        ? `Interpret the first card as what if yes, the
    second card as what if no, and the third card as context.`
        : `Interpret all of the cards as the general answer for the question.`
    }.  
    `;
    const newQuestionId = uuidv4();
    setQuestionId(newQuestionId);
    await sendMessage({ sessionId, message, questionId: newQuestionId });
  };

  return (
    <ThemeProvider theme={theme}>
      <main className="container flex flex-col gap-8">
        <Stack alignSelf="center" alignContent="center" justifyContent="center">
          <h1 className="my-8 text-center fadeIn">Read your tarot here</h1>
          <br></br>
          <p className="text-center fadeIn">
            Ask a question, then select 3 cards, and we will read your tarot for
            you!
          </p>
          <br></br>
          {question === "" ? (
            <Stack alignSelf="center" spacing="8px">
              <form onSubmit={handleSubmit}>
                <Stack minWidth="80%">
                  <TextField
                    label="What question do you have?"
                    defaultValue="What should I be focusing on?"
                    color="secondary"
                    value={inputValue}
                    margin="normal"
                    onChange={handleInputChange}
                    className="fadeIn"
                    fullWidth={true}
                    sx={{
                      input: { color: "white", opacity: 0.8 },
                      fieldset: { borderColor: "white" },
                      label: { color: "white", fontFamily: "Avenir" },
                    }}
                    InputProps={{
                      classes: {
                        notchedOutline: "whiteTextField",
                      },
                    }}
                  />
                  <Button className="fadeIn" color="secondary" type="submit">
                    Submit
                  </Button>
                </Stack>
              </form>
            </Stack>
          ) : !clickerOpen ? (
            <Stack alignSelf="center">
              <h2 className="fadeIn">Your question: {question}</h2>
              <Button color="secondary" onClick={() => setQuestion("")}>
                Change question
              </Button>
            </Stack>
          ) : (
            <Stack
              maxWidth="80%"
              alignSelf="center"
              direction="row"
              alignContent="center"
            >
              <h2>Your question: {question}</h2>
            </Stack>
          )}
          {question.length > 0 && (
            <Button
              color="secondary"
              onClick={() => {
                // Reset everything
                setFortuneCards([null, null, null]);
                setClickerOpen(!clickerOpen);
                setQuestionId("");
              }}
            >
              {clickerOpen ? "Reselect" : "Select"} my cards
            </Button>
          )}
          {clickerOpen && !fortuneCards.some((x) => x) && (
            <CardClicker readFortune={readFortune} />
          )}
          {clickerOpen && fortuneCards.some((x) => x) && (
            <Fortune
              cards={fortuneCards}
              reversalStates={reversalStates}
              useSessionId={useSessionId}
              questionId={questionId}
              resetButton={resetButton}
            />
          )}
          <br></br>
        </Stack>
      </main>
    </ThemeProvider>
  );
}

export default App;
