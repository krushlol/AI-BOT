"use client"

import { useState, useEffect } from "react"
import { QuizAnswers } from "@/lib/cars/quiz"

const STORAGE_KEY = "autodrive_quiz_answers"

export function useQuizAnswers() {
  const [answers, setAnswers] = useState<QuizAnswers | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setAnswers(JSON.parse(stored))
    } catch {}
  }, [])

  const saveAnswers = (a: QuizAnswers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(a))
    } catch {}
    setAnswers(a)
  }

  const clearAnswers = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setAnswers(null)
  }

  return { answers, saveAnswers, clearAnswers }
}
