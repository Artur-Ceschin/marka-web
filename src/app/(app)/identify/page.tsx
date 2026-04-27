"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { identify, type IdentifyResult } from "@/lib/api";

import { PhotoPicker } from "./_components/PhotoPicker";
import { ResultsList } from "./_components/ResultsList";
import { DetailView } from "./_components/DetailView";
import styles from "./page.module.scss";

type Step = "upload" | "preview" | "results" | "detail";

export default function IdentifyPage() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<IdentifyResult | null>(null);

  const {
    mutate: runIdentify,
    data: identifyData,
    isPending,
  } = useMutation({
    mutationFn: (f: File) => identify.submit(f),
    onSuccess: (data) => {
      setStep("results");
      const count = data.results?.length ?? 0;
      toast.success(
        count > 0
          ? `Found ${count} match${count > 1 ? "es" : ""}!`
          : "No matches found. Try a clearer photo.",
      );
    },
  });

  function handleFile(picked: File) {
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setStep("preview");
    setDetail(null);
  }

  function handleClear() {
    setPreview(null);
    setFile(null);
    setStep("upload");
    setDetail(null);
  }

  if (step === "detail" && detail) {
    return (
      <DetailView
        result={detail}
        photoUrl={identifyData?.displayUrl ?? identifyData?.imageUrl}
        savedImageUrl={identifyData?.imageUrl}
        onBack={() => setStep("results")}
      />
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Identify" subtitle="Photograph a plant to discover its name." />

      <div className={styles.card}>
        <div className={styles.content}>
          <PhotoPicker
            preview={preview}
            canIdentify={step === "preview"}
            isIdentifying={isPending}
            onSelect={handleFile}
            onIdentify={() => file && runIdentify(file)}
            onClear={handleClear}
          />

          {step === "results" && (
            <ResultsList
              results={identifyData?.results ?? []}
              onSelect={(r) => {
                setDetail(r);
                setStep("detail");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
