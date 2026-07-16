"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentEvaluation {
  id: string;
  student_name: string;
  story_mode: string;
  score_verification: number;
  score_deepfake: number;
  score_financial: number;
  evaluation_note: string;
  created_at: string;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 60) {
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        {score}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      {score}
    </Badge>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<StudentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch initial data
  // -----------------------------------------------------------------------
  useEffect(() => {
    async function fetchData() {
      const { data: rows, error } = await supabase
        .from("students_evaluation")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
      } else {
        setData(rows || []);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // -----------------------------------------------------------------------
  // Real-time subscription for new inserts
  // -----------------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("students_evaluation_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "students_evaluation",
        },
        (payload) => {
          const newRow = payload.new as StudentEvaluation;
          setData((prev) => [newRow, ...prev]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Stats
  // -----------------------------------------------------------------------
  const totalStudents = data.length;
  const passCount = data.filter(
    (d) =>
      d.score_verification >= 60 &&
      d.score_deepfake >= 60 &&
      d.score_financial >= 60
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png?v=2"
              alt="DeepTrust Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                DeepTrust — Dashboard Evaluasi
              </h1>
              <p className="text-xs text-slate-500">
                Monitoring hasil simulasi SABLE mahasiswa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-400"
                }`}
              />
              <span className="text-xs text-slate-500">
                {isConnected ? "Real-time aktif" : "Menghubungkan..."}
              </span>
            </div>
            <Link
              href="/"
              title="Keluar ke Beranda"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition duration-150 flex items-center justify-center border border-slate-200 bg-white shadow-sm"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Mahasiswa</CardDescription>
              <CardTitle className="text-3xl">{totalStudents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lulus SABLE</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {passCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Perlu Intervensi</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {totalStudents - passCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Evaluasi Mahasiswa</CardTitle>
            <CardDescription>
              Data diperbarui secara real-time saat mahasiswa menyelesaikan
              simulasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                Memuat data...
              </div>
            ) : data.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Belum ada data evaluasi. Minta mahasiswa bermain di{" "}
                <Link href="/play" className="text-blue-600 underline">
                  /play
                </Link>
                .
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Waktu</TableHead>
                      <TableHead>Nama Mahasiswa</TableHead>
                      <TableHead className="w-[100px]">Story Mode</TableHead>
                      <TableHead className="w-[100px] text-center">
                        Verification
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Deepfake
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Financial
                      </TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs text-slate-500">
                          {formatTime(row.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.student_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.story_mode === "Story A"
                                ? "border-blue-300 text-blue-700"
                                : "border-red-300 text-red-700"
                            }
                          >
                            {row.story_mode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={row.score_verification} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={row.score_deepfake} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={row.score_financial} />
                        </TableCell>
                        <TableCell className="max-w-[300px] text-sm text-slate-600">
                          {row.evaluation_note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
