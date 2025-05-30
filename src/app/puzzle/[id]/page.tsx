"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { supabase } from "../../supabaseClient";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useMutation } from "@tanstack/react-query";
import NoSsr from "@mui/material/NoSsr";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

interface Puzzle {
  id: string;
  title: string;
  description: string;
  answer: string;
  hints: string[];
  author?: string;
  tags?: string[];
}

export default function PuzzlePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isComposing, setIsComposing] = useState(false);
  const [clues, setClues] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const askMutation = useMutation({
    mutationFn: async ({
      id,
      question,
      clues,
    }: {
      id: string;
      question: string;
      clues: string[];
    }) => {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, question, clues }),
      });
      if (!res.ok) throw new Error("API error");
      return res.json();
    },
    onSuccess: (data, variables) => {
      setHistory((prev) => [
        ...prev,
        {
          question: variables.question,
          answer: data.answer || "（AI 回答失敗）",
        },
      ]);
      if (data.clue && data.clue.length > 0 && !clues.includes(data.clue)) {
        setClues((prev) => [...prev, data.clue]);
      }
      if (data.canReveal) setShowAnswer(true);
      setQuestion("");
    },
    onError: (_error, variables) => {
      setHistory((prev) => [
        ...prev,
        { question: variables.question, answer: "（AI 回答失敗）" },
      ]);
    },
  });
  const { width, height } = useWindowSize();

  useEffect(() => {
    async function fetchPuzzle() {
      setLoading(true);
      const { data, error } = await supabase
        .from("puzzles")
        .select("id, title, description, answer, hints, author, tags")
        .eq("id", id)
        .single();
      if (!error && data) {
        setPuzzle(data);
      } else {
        setPuzzle(null);
      }
      setLoading(false);
    }
    if (id) fetchPuzzle();
  }, [id]);

  const handleAsk = () => {
    if (!question.trim() || !puzzle) return;
    askMutation.mutate({ id: puzzle.id, question, clues });
  };

  // 隨機跳轉到其他題目
  const handleNextPuzzle = async () => {
    const { data, error } = await supabase
      .from("puzzles")
      .select("id")
      .neq("id", id)
      .order("random")
      .limit(1)
      .single();
    if (!error && data?.id) {
      router.push(`/puzzle/${data.id}`);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!puzzle) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography variant="h6" color="error" gutterBottom>
          找不到這個題目
        </Typography>
        <Button variant="outlined" onClick={() => router.push("/")}>
          回首頁
        </Button>
      </Box>
    );
  }

  return (
    <NoSsr>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <IconButton
              aria-label="back"
              onClick={() => router.back()}
              size={isMobile ? "small" : "medium"}
            >
              <ArrowBackIosNewIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <Typography
              variant="h4"
              fontWeight={700}
              color="primary"
              gutterBottom
              align="center"
              sx={{ flex: 1 }}
            >
              {puzzle.title}
            </Typography>
          </Box>
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
            <Typography variant="body1" color="text.primary">
              {puzzle.description}
            </Typography>
          </Paper>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="請輸入你的提問..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposing) handleAsk();
              }}
              size={isMobile ? "small" : "medium"}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsk}
              sx={{ minWidth: 80, fontSize: isMobile ? "1rem" : undefined }}
              size={isMobile ? "small" : "medium"}
              disabled={askMutation.isPending}
            >
              {askMutation.isPending ? <CircularProgress size={20} /> : "送出"}
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
          {clues.length > 0 && (
            <Paper
              elevation={isMobile ? 0 : 1}
              square={isMobile}
              sx={{
                p: 2,
                mt: 2,
                bgcolor: "#f5f5f5",
                borderRadius: isMobile ? 0 : 2,
                boxShadow: isMobile ? "none" : undefined,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="secondary.dark"
                gutterBottom
              >
                你已經問到的線索
              </Typography>
              <List>
                {clues.map((clue, idx) => (
                  <ListItem
                    key={idx}
                    disablePadding
                    sx={{ color: "info.main" }}
                  >
                    <ListItemText
                      primary={clue}
                      primaryTypographyProps={{ sx: { mb: 0.5 } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          {/* 完整故事揭曉 Modal + Confetti */}
          <Dialog
            open={showAnswer}
            onClose={() => {
              setShowAnswer(false);
              setShowRevealButton(true);
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                p: 0,
                m: 0,
                maxWidth: 480,
                width: "90vw",
                maxHeight: 400,
                overflow: "visible",
                bgcolor: "#484866",
              },
            }}
          >
            {showAnswer && (
              <Confetti
                width={width}
                height={height}
                numberOfPieces={300}
                recycle={false}
              />
            )}
            <DialogTitle
              sx={{
                color: "warning.main",
                fontWeight: 700,
                fontSize: 24,
                textAlign: "center",
                pb: 0,
              }}
            >
              🎉 完整故事揭曉
            </DialogTitle>
            <DialogContent
              sx={{
                pt: 2,
                pb: 2,
                px: 3,
                textAlign: "center",
                overflow: "visible",
              }}
            >
              <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                {puzzle.answer}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setShowAnswer(false);
                  setShowRevealButton(true);
                }}
                fullWidth
                sx={{ py: 1.5, fontSize: 20 }}
              >
                關閉
              </Button>
            </DialogContent>
          </Dialog>
          {/* 彈窗關閉後顯示「再看一次謎底」與「再玩一題」 */}
          {showRevealButton && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  setShowAnswer(true);
                  setShowRevealButton(false);
                }}
                sx={{ fontWeight: 700, fontSize: 18 }}
              >
                再看一次謎底
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextPuzzle}
                sx={{ fontWeight: 700, fontSize: 18 }}
              >
                再玩一題
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </NoSsr>
  );
}
