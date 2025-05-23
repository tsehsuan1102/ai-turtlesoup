"use client";

import React, { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";

// Dummy data for initial soup and Q&A history
const DUMMY_SOUP = {
  title: "神秘的房間",
  description: "一個男人走進房間，關上燈，然後死了。為什麼？",
};

const DUMMY_HISTORY = [
  { question: "他是自殺嗎？", answer: "否" },
  { question: "房間裡有其他人嗎？", answer: "否" },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState(DUMMY_HISTORY);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleAsk = () => {
    if (!question.trim()) return;
    // For now, just append to history with a dummy answer
    setHistory((prev) => [
      ...prev,
      { question, answer: "（尚未連接 AI，這裡是預設回答）" },
    ]);
    setQuestion("");
  };

  return (
    <Container
      maxWidth={isMobile ? false : "sm"}
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
          variant="h4"
          fontWeight={700}
          color="primary"
          gutterBottom
          align="center"
          sx={{ fontSize: isMobile ? "2rem" : undefined }}
        >
          海龜湯機器人
        </Typography>
        <Paper
          elevation={isMobile ? 0 : 2}
          square={isMobile}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "secondary.main",
            borderRadius: isMobile ? 0 : 2,
            boxShadow: isMobile ? "none" : undefined,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.dark"
            gutterBottom
          >
            {DUMMY_SOUP.title}
          </Typography>
          <Typography variant="body1" color="text.primary">
            {DUMMY_SOUP.description}
          </Typography>
        </Paper>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="請輸入你的提問..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAsk();
            }}
            size={isMobile ? "small" : "medium"}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAsk}
            sx={{ minWidth: 80, fontSize: isMobile ? "1rem" : undefined }}
            size={isMobile ? "small" : "medium"}
          >
            送出
          </Button>
        </Box>
        <Paper
          elevation={isMobile ? 0 : 1}
          square={isMobile}
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: isMobile ? 0 : 2,
            boxShadow: isMobile ? "none" : undefined,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="primary.dark"
            gutterBottom
          >
            提問紀錄
          </Typography>
          <List>
            {history.map((item, idx) => (
              <ListItem
                key={idx}
                alignItems="flex-start"
                disablePadding
                sx={{ mb: 1 }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Q:</strong> {item.question}
                    </>
                  }
                  secondary={
                    <>
                      <strong>A:</strong> {item.answer}
                    </>
                  }
                  primaryTypographyProps={{ sx: { mb: 0.5 } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Paper>
    </Container>
  );
}
