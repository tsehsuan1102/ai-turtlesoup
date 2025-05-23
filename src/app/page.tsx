"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

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
    <main className={styles.main}>
      <h1>海龜湯 AI 遊戲</h1>
      <section className={styles.soupSection}>
        <h2>{DUMMY_SOUP.title}</h2>
        <p>{DUMMY_SOUP.description}</p>
      </section>
      <section className={styles.askSection}>
        <input
          type="text"
          placeholder="請輸入你的提問..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAsk} className={styles.button}>
          送出
        </button>
      </section>
      <section className={styles.historySection}>
        <h3>提問紀錄</h3>
        <ul>
          {history.map((item, idx) => (
            <li key={idx}>
              <strong>Q:</strong> {item.question} <br />
              <strong>A:</strong> {item.answer}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
