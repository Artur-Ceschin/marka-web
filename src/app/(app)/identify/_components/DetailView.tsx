"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button, Tag } from "@/components/ui";
import { BackArrowIcon } from "@/components/icons";
import { Lightbox, type LightboxItem } from "@/components/Lightbox";
import { identify, plants, type IdentifyResult, type Plant } from "@/lib/api";
import { getCurrentLocation, type LocationInfo } from "@/lib/geolocation";

import { ConfidenceBar } from "./ConfidenceBar";
import { LocationDialog } from "./LocationDialog";
import styles from "./DetailView.module.scss";

export function DetailView({
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
  const [locating, setLocating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const scorePct = Math.round(result.confidence * 100);
  const imageUrlToSave = savedImageUrl ?? result.imageUrl;
  const heroUrl = photoUrl ?? result.imageUrl;

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
    mutationFn: (location: LocationInfo | null) => {
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
      router.push("/notebook");
    },
  });

  async function handleIncludeLocation() {
    setLocating(true);
    const location = await getCurrentLocation();
    setLocating(false);
    if (!location) toast.message("Location unavailable — saving without it.");
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
  const displayTags = (result.tags ?? []).filter((t) => !/confidence/i.test(t));

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={onBack} aria-label="Back">
        <BackArrowIcon />
      </button>

      <div className={styles.header}>
        <h1 className={styles.name}>{result.name}</h1>
        <p className={styles.latin}>
          {result.latin}
          {authorship && <span className={styles.authorship}> {authorship}</span>}
        </p>
      </div>

      {heroUrl && (
        <button
          type="button"
          className={styles.hero}
          onClick={() => setLightbox({ url: heroUrl, caption: result.name })}
        >
          <Image src={heroUrl} alt={result.name} fill unoptimized style={{ objectFit: "cover" }} />
          {isInvasive && <span className={styles.invasiveBadge}>Invasive species</span>}
        </button>
      )}

      <div className={styles.tags}>
        <ConfidenceBar pct={scorePct} />
      </div>

      {displayTags.length > 0 && (
        <div className={styles.tags}>
          {displayTags.map((tag) => (
            <Tag key={tag} variant="green" size="sm">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      <div className={styles.facts}>
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
                <Image src={ref.url} alt={ref.organ} fill unoptimized style={{ objectFit: "cover" }} />
                <span className={styles.refOrgan}>{ref.organ}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.saveBar}>
        <div className={styles.saveBarInner}>
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

      <LocationDialog
        open={dialogOpen}
        locating={locating}
        saving={isSaving}
        onOpenChange={setDialogOpen}
        onIncludeLocation={handleIncludeLocation}
        onSkip={() => saveEntry(null)}
      />

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
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
