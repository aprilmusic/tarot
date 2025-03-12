import cardBack from "@/assets/card_back.png";
import { Button, Slide, Snackbar, Fade } from "@mui/material";
import Stack from "@mui/material/Stack";
import React from "react";
import { useState } from "react";

const NUM_CARDS = 16;

// Consistent transition timing variables for cohesive feel
const TRANSITION_DURATION = "0.4s";
const TRANSITION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const TRANSITION = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;

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
    <Stack
      sx={{
        transition: TRANSITION,
        width: "100%",
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: "center",
          alignItems: "center",
          transition: TRANSITION,
          padding: "20px 0",
        }}
      >
        {[...Array(NUM_CARDS).keys()].map((index) => {
          return (
            <div
              key={index}
              style={{
                marginLeft: index < NUM_CARDS ? "-30px" : "0", // Apply negative margin to create a stacking effect
                cursor: "pointer",
                maxWidth: 100,
                paddingTop: clickedCards.has(index) ? "30px" : "0",
                transition: `padding-top ${TRANSITION}, transform ${TRANSITION}, box-shadow ${TRANSITION}, margin ${TRANSITION}, z-index 0.01s`,
                position: "relative",
                zIndex: clickedCards.has(index) ? 10 : 1, // Bring selected cards to front
                transform: clickedCards.has(index)
                  ? "translateY(-10px)"
                  : "translateY(0)",
              }}
              onClick={() => handleImageClick(index)}
            >
              <img
                src={cardBack}
                alt={`Image ${index}`}
                style={{
                  width: "100%",
                  height: "auto",
                  transform: clickedCards.has(index)
                    ? "scale(1.05)"
                    : "scale(1)",
                  transition: `transform ${TRANSITION}, box-shadow ${TRANSITION}, filter ${TRANSITION}`,
                  boxShadow: clickedCards.has(index)
                    ? "0 12px 20px rgba(0,0,0,0.25)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                  filter: clickedCards.has(index)
                    ? "brightness(1.1)"
                    : "brightness(1)",
                  borderRadius: "8px",
                }}
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
        sx={{
          "& .MuiSnackbarContent-root": {
            transition: TRANSITION,
          },
        }}
      />
      <Fade in={clickedCards.size === 3} timeout={500}>
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            transition: TRANSITION,
            height: clickedCards.size === 3 ? "auto" : "0",
            opacity: clickedCards.size === 3 ? 1 : 0,
          }}
        >
          {clickedCards.size === 3 && (
            <Button
              onClick={readFortune}
              variant="contained"
              size="large"
              sx={{
                transition: `all ${TRANSITION}`,
                transform: "translateY(0)",
                opacity: 1,
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                "&:hover": {
                  transform: "scale(1.05) translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                },
                "&:active": {
                  transform: "scale(0.98) translateY(1px)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                  transition: "all 0.1s ease",
                },
                padding: "10px 24px",
                borderRadius: "8px",
              }}
            >
              Read my fortune
            </Button>
          )}
        </div>
      </Fade>
    </Stack>
  );
}
