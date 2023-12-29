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

  // Prompt engineering
  const readFortune = async () => {
    const deckOrder = fisherYatesShuffle([...Array(78).keys()]);
    const selectedCards = deckOrder.slice(0, 3);
    setFortuneCards(selectedCards);
    const message = `I am seeking a tarot reading to answer the question ${question}. My first card is ${
      tarotJson.find((x) => x.number === deckOrder[0])?.name
    },
    my second card is ${
      tarotJson.find((x) => x.number === deckOrder[1])?.name
    }, and my third card is ${
      tarotJson.find((x) => x.number === deckOrder[2])?.name
    }. If the question is a yes or no question, interpret the first card as "what will happen if yes", the 
    second card as "what will happen if no", and the third card as context. If it is not a yes or no question, 
    interpret all of the cards as general context for the question. Please help me 
    interpret these cards, and begin your response with, "The spirits have answered." Express your answer 
    as a json, where the the first sentence is labeled intro, the analysis of the first card is labeled first_card, 
    the analysis of the second card is labeled second_card, the analysis of the third card is labeled third_card, 
    and the rest is labeled conclusion.
    `;
    const newQuestionId = uuidv4();
    setQuestionId(newQuestionId);
    await sendMessage({ sessionId, message, questionId: newQuestionId });
  };

  return (
    <main className="container  flex flex-col gap-8">
      <Stack alignSelf="center" alignContent="center" justifyContent="center">
        <h1 className="text-4xl font-extrabold my-8 text-center">
          Read your tarot here
        </h1>
        <p className="text-center">
          Ask a question, then select 3 cards, and we will read your tarot for
          you!
        </p>
        {question === "" ? (
          <Stack maxWidth="80%" alignSelf="center">
            <form onSubmit={handleSubmit}>
              <Stack spacing="8px">
                <body>What question are you trying to answer?</body>
                <TextField
                  label="What is my future?"
                  variant="outlined"
                  color="primary"
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <Button color="info" type="submit">
                  Submit
                </Button>
              </Stack>
            </form>
          </Stack>
        ) : !clickerOpen ? (
          <Stack maxWidth="80%" alignSelf="center">
            <h2>{question}</h2>
            <Button color="info" onClick={() => setQuestion("")}>
              Change question
            </Button>
          </Stack>
        ) : (
          <Stack maxWidth="80%" alignSelf="center">
            <h2>{question}</h2>
          </Stack>
        )}

        {question.length > 0 && (
          <Button
            color="info"
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
            useSessionId={useSessionId}
            questionId={questionId}
          />
        )}
      </Stack>
    </main>
  );
}

export default App;
