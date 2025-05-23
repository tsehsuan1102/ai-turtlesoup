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
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper
        elevation={6}
        sx={{ p: 4, borderRadius: 4, bgcolor: "background.default" }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
          gutterBottom
          align="center"
        >
          海龜湯機器人
        </Typography>
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "secondary.main" }}>
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
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAsk}
            sx={{ minWidth: 80 }}
          >
            送出
          </Button>
        </Box>
        <Paper elevation={1} sx={{ p: 2, bgcolor: "background.paper" }}>
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
