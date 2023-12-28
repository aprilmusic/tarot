import { ConvexAiChat } from "@/aiChat";
import { Link } from "@/components/typography/link";
import { Button } from "@/components/ui/button";
import cardBack from "@/cardDeck/card_back.png";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import CardClicker from "./cardDeck/CardClicker";

function App() {
  return (
    <main className="container  flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        Read your tarot here
      </h1>
      <p>What question are you trying to answer?</p>

      <Button onClick={() => {}}>Select my cards</Button>
      <CardClicker />
    </main>
  );
}

export default App;
