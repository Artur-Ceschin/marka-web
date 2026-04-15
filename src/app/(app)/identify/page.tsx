"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { Button, Badge, Tag, TagGroup } from "@/components/ui";
import { identify, type IdentifyResult } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import styles from "./page.module.scss";

type Step = "upload" | "preview" | "results" | "detail";

function confidenceVariant(pct: number): "green" | "amber" | "berry" {
  if (pct >= 80) return "green";
  if (pct >= 50) return "amber";
  return "berry";
}

function confidenceLabel(pct: number) {
  if (pct >= 80) return "High Confidence";
  if (pct >= 50) return "Medium Confidence";
  return "Low Confidence";
}

export default function IdentifyPage() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<IdentifyResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: runIdentify,
    data: identifyData,
    isPending,
  } = useMutation({
    mutationFn: (f: File) => identify.fromImage(f),
    onSuccess: () => setStep("results"),
  });

  function handleFile(picked: File | null) {
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setStep("preview");
    setDetail(null);
  }

  function handleIdentify() {
    if (file) runIdentify(file);
  }

  function handleClear() {
    setPreview(null);
    setFile(null);
    setStep("upload");
    setDetail(null);
  }

  const results: IdentifyResult[] = identifyData?.results ?? [];

  if (step === "detail" && detail) {
    return <DetailView result={detail} onBack={() => setStep("results")} />;
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Identify" subtitle="Photograph a plant to discover its name." />

      {/* ── Dark card ────────────────────────────── */}
      <div className={styles.card}>
      {/* ── Content ──────────────────────────────── */}
      <div className={styles.content}>
        {/* Photo area */}
        <div
          className={styles.photoArea}
          onClick={() => step === "upload" && fileInputRef.current?.click()}
        >
          {preview ? (
            <Image src={preview} alt="Selected plant" fill style={{ objectFit: "cover" }} />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <LeafOutlineIcon />
              </div>
              <p className={styles.emptyTitle}>No photo yet</p>
              <p className={styles.emptyHint}>Use the camera or pick one from your gallery.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => cameraInputRef.current?.click()}
          >
            Take photo
          </Button>

          <Button
            variant="secondary"
            size="xl"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            Choose from gallery
          </Button>

          {step === "preview" && (
            <>
              <button className={styles.clearBtn} onClick={handleClear}>
                Clear photo
              </button>
              <Button
                variant="primary"
                size="xl"
                fullWidth
                loading={isPending}
                onClick={handleIdentify}
              >
                Identify this plant
              </Button>
            </>
          )}
        </div>

        {/* Tip */}
        <div className={styles.tip}>
          For best results, capture a clear shot of the leaves or flowers against a simple
          background.
        </div>

        {/* Results */}
        {step === "results" && (
          <div className={styles.results}>
            <h2 className={styles.resultsTitle}>Top matches</h2>
            <p className={styles.resultsSub}>Tap a result to see more details.</p>

            <div className={styles.resultsList}>
              {results.map((result, i) => (
                <button
                  key={i}
                  className={styles.resultRow}
                  onClick={() => {
                    setDetail(result);
                    setStep("detail");
                  }}
                >
                  {result.imageUrl && (
                    <div className={styles.resultThumb}>
                      <Image
                        src={result.imageUrl}
                        alt={result.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{result.name}</span>
                    <span className={styles.resultLatin}>{result.latinName}</span>
                    <Badge variant={confidenceVariant(result.confidence)}>
                      {confidenceLabel(result.confidence)}
                    </Badge>
                  </div>
                  <ChevronIcon />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function DetailView({ result, onBack }: { result: IdentifyResult; onBack: () => void }) {
  const variant = confidenceVariant(result.confidence);

  return (
    <div className={styles.detailPage}>
      <button className={styles.detailBack} onClick={onBack}>
        <BackArrowIcon />
      </button>

      <div className={styles.detailHeader}>
        <h1 className={styles.detailName}>{result.name}</h1>
        <p className={styles.detailLatin}>{result.latinName}</p>
      </div>

      {result.imageUrl && (
        <div className={styles.detailHero}>
          <Image src={result.imageUrl} alt={result.name} fill style={{ objectFit: "cover" }} />
        </div>
      )}

      <div className={styles.detailTags}>
        <Badge variant={variant}>{confidenceLabel(result.confidence)}</Badge>
      </div>

      {result.description && (
        <p className={styles.detailDescription}>{result.description}</p>
      )}

      <div className={styles.refSection}>
        <p className={styles.refLabel}>Reference photos</p>
        <div className={styles.refGrid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.refThumb}>
              {result.imageUrl && (
                <Image
                  src={result.imageUrl}
                  alt="Reference"
                  fill
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.detailSave}>
        <Button variant="primary" size="xl" fullWidth>
          Add to notebook
        </Button>
      </div>
    </div>
  );
}

function LeafOutlineIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 5-7 7 7 7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
