"use client";

import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

interface Puzzle {
  id: string;
  title: string;
  description: string;
  answer: string;
  hints: string[];
  author?: string;
  tags?: string[];
}

const Item = ({ puzzle, onClick }: { puzzle: Puzzle; onClick: () => void }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: 280,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
        p: 2,
        bgcolor: "secondary.main",
        borderRadius: 3,
        boxShadow: "0 2px 12px 0 rgba(46,196,182,0.08)",
        transition: "box-shadow 0.2s",
        ":hover": {
          boxShadow: "0 4px 24px 0 rgba(46,196,182,0.18)",
        },
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        color="primary.dark"
        gutterBottom
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          mb: 1,
        }}
      >
        {puzzle.title}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          mb: 2,
        }}
      >
        {puzzle.description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 1, fontWeight: 600, letterSpacing: 1 }}
        onClick={onClick}
      >
        開始挑戰
      </Button>
    </Paper>
  );
};

export default function Home() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();

  useEffect(() => {
    async function fetchPuzzles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("puzzles")
        .select("id, title, description, answer, hints, author, tags");
      if (!error && data) {
        setPuzzles(data);
      }
      setLoading(false);
    }
    fetchPuzzles();
  }, []);

  return (
    <Container
      maxWidth={isMobile ? false : "md"}
      disableGutters={isMobile}
      sx={{
        mt: isMobile ? 0 : 6,
        mb: isMobile ? 0 : 6,
        px: isMobile ? 0 : 2,
        minHeight: isMobile ? "100svh" : undefined,
        background: isMobile ? "background.default" : undefined,
      }}
    >
      <Paper
        elevation={isMobile ? 0 : 6}
        square={isMobile}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: isMobile ? 0 : 4,
          bgcolor: "background.default",
          minHeight: isMobile ? "100svh" : undefined,
          boxShadow: isMobile ? "none" : undefined,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={700}
          color="primary"
          gutterBottom
          align="center"
        >
          海龜湯機器人
        </Typography>
        <Typography
          variant="body1"
          color="text.primary"
          align="center"
          sx={{ mb: 4 }}
        >
          歡迎來到海龜湯推理遊戲！
          <br />
          選擇一個題目開始挑戰，並嘗試用「是/否」提問推理出真相。
          <br />
          點擊題目卡片下方的「開始挑戰」即可進入互動頁面，分享網址給朋友一起玩！
        </Typography>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            {puzzles.map((puzzle) => (
              <Box key={puzzle.id} sx={{ display: "flex" }}>
                <Item
                  puzzle={puzzle}
                  onClick={() => router.push(`/puzzle/${puzzle.id}`)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
