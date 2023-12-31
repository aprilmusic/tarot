import cardBack from "@/assets/card_back.png";
import { Button, Slide, Snackbar } from "@mui/material";
import Stack from "@mui/material/Stack";
import React from "react";
import { useState } from "react";

const NUM_CARDS = 16;

export default function CardClicker({
  readFortune,
}: {
  readFortune: () => Promise<void>;
}) {
  const [clickedCards, setClickedCards] = useState(new Set());
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleImageClick = (index: number) => {
    // Handle image click
    if (clickedCards.has(index)) {
      const newSet = new Set([...clickedCards].filter((c) => c !== index));
      setClickedCards(newSet);
    } else {
      if (clickedCards.size >= 3) {
        setSnackbarOpen(true);
      } else {
        const newSet = new Set([...clickedCards]);
        setClickedCards(newSet.add(index));
      }
    }
  };

  return (
    <Stack>
      <Stack direction="row">
        {[...Array(NUM_CARDS).keys()].map((index) => {
          return (
            <div
              key={index}
              style={{
                marginLeft: index < NUM_CARDS ? "-30px" : "0", // Apply negative margin to create a stacking effect
                cursor: "pointer",
                maxWidth: 100,
                paddingTop: clickedCards.has(index) ? "30px" : "0",
              }}
              onClick={() => handleImageClick(index)}
            >
              <img
                src={cardBack}
                alt={`Image ${index}`}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          );
        })}
      </Stack>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        message="You have already selected 3 cards"
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={Slide}
      />
      {clickedCards.size === 3 && (
        <Button onClick={readFortune}>Read my fortune</Button>
      )}
    </Stack>
  );
}
