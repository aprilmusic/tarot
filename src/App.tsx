import { ConvexAiChat } from "@/aiChat";
import { Link } from "@/components/typography/link";
import cardBack from "@/cardDeck/card_back.png";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { FormEvent, useState } from "react";
import CardClicker from "./cardDeck/CardClicker";
import { TextField } from "@mui/material";

function App() {
  const [clickerOpen, setClickerOpen] = useState(false);
  // State to track the value of the input field
  const [inputValue, setInputValue] = useState<string>("");

  // Function to handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add logic here to handle the form submission, for example, send the data to an API
    console.log("Form submitted with value:", inputValue);
  };

  return (
    <main className="container  flex flex-col gap-8">
      <Stack alignSelf="center">
        <h1 className="text-4xl font-extrabold my-8 text-center">
          Read your tarot here
        </h1>
        <p className="text-center">
          Ask a question, then select 3 cards, and we will read your tarot for
          you!
        </p>
        <Stack maxWidth="80%" alignSelf="center">
          <form onSubmit={handleSubmit}>
            <Stack>
              <h3>What question are you trying to answer?</h3>
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
        <Button color="info" onClick={() => setClickerOpen(!clickerOpen)}>
          Select my cards
        </Button>
        {clickerOpen && <CardClicker />}
      </Stack>
    </main>
  );
}

export default App;
