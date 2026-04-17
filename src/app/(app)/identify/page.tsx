"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, MarkaDialog, Tag } from "@/components/ui";
import { toast } from "sonner";
import { identify, plants, type IdentifyResult, type Plant } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import styles from "./page.module.scss";

type Step = "upload" | "preview" | "results" | "detail";

type ConfidenceTone = "high" | "medium" | "low";

function confidenceTone(pct: number): ConfidenceTone {
  if (pct >= 80) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

function confidenceLabel(pct: number) {
  if (pct >= 80) return "High Confidence";
  if (pct >= 50) return "Medium Confidence";
  return "Low Confidence";
}

function ConfidenceBar({ pct }: { pct: number }) {
  const safePct = Math.max(0, Math.min(100, pct));
  const tone = confidenceTone(safePct);
  return (
    <div
      className={styles.confidenceBar}
      data-tone={tone}
      role="progressbar"
      aria-valuenow={safePct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.confidenceFill} style={{ width: `${safePct}%` }} />
      <span className={styles.confidenceLabel}>
        {confidenceLabel(safePct)} · {safePct}%
      </span>
    </div>
  );
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
                    <span className={styles.resultLatin}>{result.latin}</span>
                    <ConfidenceBar pct={Math.round(result.confidence * 100)} />
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

type PendingLocation = { lat: number; lng: number; place: string };

function getCurrentLocation(): Promise<PendingLocation | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let place = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
            { headers: { Accept: "application/json" } },
          );
          if (res.ok) {
            const data: { display_name?: string; address?: Record<string, string> } =
              await res.json();
            const a = data.address ?? {};
            const short = [a.city ?? a.town ?? a.village ?? a.suburb, a.state, a.country]
              .filter(Boolean)
              .join(", ");
            place = short || data.display_name || place;
          }
        } catch {
          // keep coord fallback
        }
        resolve({ lat, lng, place });
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

function DetailView({
  result,
  photoUrl,
  savedImageUrl,
  onBack,
}: {
  result: IdentifyResult;
  photoUrl?: string;
  savedImageUrl?: string;
  onBack: () => void;
}) {
  const scorePct = Math.round(result.confidence * 100);
  const [locating, setLocating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const imageUrlToSave = savedImageUrl ?? result.imageUrl;

  const { data: plant } = useQuery<Plant | null>({
    queryKey: ["plant", result.latin],
    queryFn: async () => {
      try {
        return await plants.getByLatin(result.latin);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const { mutate: saveEntry, isPending: isSaving } = useMutation({
    mutationFn: (location: PendingLocation | null) => {
      if (!imageUrlToSave) throw new Error("Missing image");
      return identify.save({
        plantName: result.name,
        latinName: result.latin,
        confidence: result.confidence,
        imageUrl: imageUrlToSave,
        tags: result.tags ?? [],
        ...(location ? { location } : {}),
        identifiedAt: new Date().toISOString(),
      });
    },
    onSuccess: (_data, location) => {
      toast.success(
        location ? `Saved to notebook · ${location.place}` : "Saved to notebook",
      );
      queryClient.invalidateQueries({ queryKey: ["notebook"] });
      setDialogOpen(false);
      onBack();
    },
  });

  async function handleIncludeLocation() {
    setLocating(true);
    const location = await getCurrentLocation();
    setLocating(false);
    if (!location) {
      toast.message("Location unavailable — saving without it.");
    }
    saveEntry(location);
  }

  const otherCommonNames = (result.commonNames ?? plant?.commonNames ?? []).filter(
    (n) => n.toLowerCase() !== result.name.toLowerCase(),
  );
  const nativeRegions = plant?.nativeRegions ?? [];
  const isInvasive = plant?.isInvasive ?? false;
  const authorship = result.description ? undefined : plant?.scientificNameAuthorship;
  const family = result.family || plant?.family;
  const genus = result.genus || plant?.genus;
  const referenceImages = result.referenceImages ?? plant?.referenceImages ?? [];

  return (
    <div className={styles.detailPage}>
      <button className={styles.detailBack} onClick={onBack}>
        <BackArrowIcon />
      </button>

      <div className={styles.detailHeader}>
        <h1 className={styles.detailName}>{result.name}</h1>
        <p className={styles.detailLatin}>
          {result.latin}
          {authorship ? <span className={styles.detailAuthorship}> {authorship}</span> : null}
        </p>
      </div>

      {(photoUrl || result.imageUrl) && (
        <button
          type="button"
          className={styles.detailHero}
          onClick={() =>
            setLightbox({
              url: (photoUrl ?? result.imageUrl) as string,
              caption: result.name,
            })
          }
        >
          <Image
            src={(photoUrl ?? result.imageUrl) as string}
            alt={result.name}
            fill
            style={{ objectFit: "cover" }}
          />
          {isInvasive && <span className={styles.invasiveBadge}>Invasive species</span>}
        </button>
      )}

      <div className={styles.detailTags}>
        <ConfidenceBar pct={scorePct} />
      </div>

      {result.tags && result.tags.filter((t) => !/confidence/i.test(t)).length > 0 && (
        <div className={styles.detailTags}>
          {result.tags
            .filter((t) => !/confidence/i.test(t))
            .map((tag) => (
              <Tag key={tag} variant="green" size="sm">
                {tag}
              </Tag>
            ))}
        </div>
      )}

      <div className={styles.detailFacts}>
        {family && <Fact label="Family" value={family} />}
        {genus && <Fact label="Genus" value={genus} />}
        {otherCommonNames.length > 0 && (
          <Fact label="Also known as" value={otherCommonNames.slice(0, 5).join(" · ")} />
        )}
        {nativeRegions.length > 0 && (
          <Fact label="Native to" value={nativeRegions.slice(0, 8).join(", ")} />
        )}
      </div>

      {referenceImages.length > 0 && (
        <div className={styles.refSection}>
          <p className={styles.refLabel}>Reference photos</p>
          <div className={styles.refGrid}>
            {referenceImages.slice(0, 3).map((ref, i) => (
              <button
                key={i}
                type="button"
                className={styles.refThumb}
                onClick={() => setLightbox({ url: ref.url, caption: ref.organ })}
              >
                <Image src={ref.url} alt={ref.organ} fill style={{ objectFit: "cover" }} />
                <span className={styles.refOrgan}>{ref.organ}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.detailSave}>
        <div className={styles.detailSaveInner}>
          <Button
            variant="primary"
            size="xl"
            fullWidth
            loading={isSaving || locating}
            onClick={() => setDialogOpen(true)}
          >
            Add to notebook
          </Button>
        </div>
      </div>

      <MarkaDialog
        open={dialogOpen}
        onOpenChange={(v) => !isSaving && !locating && setDialogOpen(v)}
        title="Include your location?"
        description="Save where you found this plant so you can remember later. We'll ask your browser for permission."
      >
        <div className={styles.dialogActions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={locating}
            disabled={isSaving}
            onClick={handleIncludeLocation}
          >
            {locating ? "Getting your location…" : "Yes, include location"}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            disabled={locating}
            loading={isSaving}
            onClick={() => saveEntry(null)}
          >
            Skip, save without location
          </Button>
        </div>
      </MarkaDialog>

      {lightbox && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <div
            className={styles.lightboxStage}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.url}
              alt={lightbox.caption ?? "Photo"}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
            />
          </div>
          {lightbox.caption && (
            <p className={styles.lightboxCaption}>{lightbox.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
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

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
