"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  generateEvaluationNote,
  normalizeScore,
  SCORE_MAX,
} from "@/lib/evaluation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GamePhase = "input" | "playing" | "saved" | "error";

interface SavedResult {
  student_name: string;
  story_mode: string;
  score_verification: number;
  score_deepfake: number;
  score_financial: number;
  evaluation_note: string;
}

export default function PlayPage() {
  const [studentName, setStudentName] = useState("");
  const [phase, setPhase] = useState<GamePhase>("input");
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef("");

  // Keep nameRef in sync so the message handler always has the latest name
  useEffect(() => {
    nameRef.current = studentName;
  }, [studentName]);

  // -----------------------------------------------------------------------
  // postMessage listener — listens for scores from Ren'Py iframe
  // -----------------------------------------------------------------------
  const handleMessage = useCallback(async (event: MessageEvent) => {
    const data = event.data;

    // Validate that the message has the expected shape from Ren'Py
    if (
      data === null ||
      typeof data !== "object" ||
      typeof data.verification === "undefined" ||
      typeof data.deepfake === "undefined" ||
      typeof data.financial === "undefined"
    ) {
      return; // Not our message, ignore
    }

    const currentName = nameRef.current;
    if (!currentName.trim()) {
      setErrorMsg("Nama mahasiswa belum diisi.");
      setPhase("error");
      return;
    }

    const storyMode: string = data.story_mode || "Story D";
    const maxScores = SCORE_MAX[storyMode] || SCORE_MAX["Story D"];

    // Normalize raw scores to 0-100 scale
    const scoreVerification = normalizeScore(data.verification, maxScores.verification);
    const scoreDeepfake = normalizeScore(data.deepfake, maxScores.deepfake);
    const scoreFinancial = normalizeScore(data.financial, maxScores.financial);

    // Generate evaluation note
    const evaluationNote = generateEvaluationNote({
      score_verification: scoreVerification,
      score_deepfake: scoreDeepfake,
      score_financial: scoreFinancial,
    });

    // Insert to Supabase
    const { error } = await supabase.from("students_evaluation").insert({
      student_name: currentName.trim(),
      story_mode: storyMode,
      score_verification: scoreVerification,
      score_deepfake: scoreDeepfake,
      score_financial: scoreFinancial,
      evaluation_note: evaluationNote,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      setErrorMsg("Gagal menyimpan data: " + error.message);
      setPhase("error");
      return;
    }

    setSavedResult({
      student_name: currentName.trim(),
      story_mode: storyMode,
      score_verification: scoreVerification,
      score_deepfake: scoreDeepfake,
      score_financial: scoreFinancial,
      evaluation_note: evaluationNote,
    });
    setPhase("saved");
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // -----------------------------------------------------------------------
  // Start game handler
  // -----------------------------------------------------------------------
  const handleStart = () => {
    if (!studentName.trim()) return;
    setPhase("playing");
  };

  // -----------------------------------------------------------------------
  // Render: Input Phase
  // -----------------------------------------------------------------------
  if (phase === "input") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900">
          <CardHeader>

            <CardTitle className="text-2xl text-white">
              DeepTrust — Simulasi
            </CardTitle>
            <CardDescription className="text-slate-400">
              Masukkan nama kamu untuk memulai simulasi edukasi deepfake scam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStart();
              }}
              className="flex flex-col gap-4"
            >
              <Input
                type="text"
                placeholder="Nama lengkap mahasiswa"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                autoFocus
                required
              />
              <Button
                type="submit"
                disabled={!studentName.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Mulai Simulasi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Playing Phase (full-screen iframe)
  // -----------------------------------------------------------------------
  if (phase === "playing") {
    return (
      <div className="relative h-screen w-screen bg-black">
        <iframe
          src="/renpy-build/index.html"
          className="h-full w-full border-0"
          title="DeepTrust Game"
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Saved Phase — success notification
  // -----------------------------------------------------------------------
  if (phase === "saved" && savedResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-lg border-green-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-2xl text-green-400">
              ✅ Skor Berhasil Disimpan
            </CardTitle>
            <CardDescription className="text-slate-400">
              Data evaluasi {savedResult.student_name} telah dikirim ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Story Mode</p>
              <p className="text-lg font-semibold text-white">
                {savedResult.story_mode}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-800 p-3 text-center">
                <p className="text-xs text-slate-400">Verification</p>
                <p className="text-2xl font-bold text-blue-400">
                  {savedResult.score_verification}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3 text-center">
                <p className="text-xs text-slate-400">Deepfake</p>
                <p className="text-2xl font-bold text-purple-400">
                  {savedResult.score_deepfake}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3 text-center">
                <p className="text-xs text-slate-400">Financial</p>
                <p className="text-2xl font-bold text-amber-400">
                  {savedResult.score_financial}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Keterangan Evaluasi</p>
              <p className="text-sm font-medium text-white">
                {savedResult.evaluation_note}
              </p>
            </div>
            <Button
              onClick={() => {
                setPhase("input");
                setStudentName("");
                setSavedResult(null);
              }}
              className="mt-2 w-full bg-slate-700 text-white hover:bg-slate-600"
            >
              Simulasi Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Error Phase
  // -----------------------------------------------------------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-red-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl text-red-400">⚠️ Error</CardTitle>
          <CardDescription className="text-slate-400">
            {errorMsg || "Terjadi kesalahan saat menyimpan data."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              setPhase("input");
              setErrorMsg("");
            }}
            className="w-full bg-slate-700 text-white hover:bg-slate-600"
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
