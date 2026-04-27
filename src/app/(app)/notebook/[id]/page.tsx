"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button, Tag, Textarea, MarkaDialog } from "@/components/ui";
import { BackArrowIcon } from "@/components/icons";
import { Lightbox, type LightboxItem } from "@/components/Lightbox";
import { notebook } from "@/lib/api";
import styles from "./page.module.scss";

export default function NotebookEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["notebook", id],
    queryFn: () => notebook.getById(id),
  });

  // Sync notes value when entry loads (but not while editing)
  useEffect(() => {
    if (entry && !editingNotes) {
      setNotesValue(entry.notes ?? "");
    }
  }, [entry, editingNotes]);

  const { mutate: saveNotes, isPending: isSavingNotes } = useMutation({
    mutationFn: (notes: string) => notebook.updateNotes(id, notes),
    onSuccess: () => {
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: ["notebook", id] });
      queryClient.invalidateQueries({ queryKey: ["notebook"] });
      setEditingNotes(false);
    },
  });

  const { mutate: deleteEntry, isPending: isDeleting } = useMutation({
    mutationFn: () => notebook.delete(id),
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["notebook"] });
      router.replace("/notebook");
    },
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.back()} aria-label="Back">
          <BackArrowIcon />
        </button>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.back()} aria-label="Back">
          <BackArrowIcon />
        </button>
        <div className={styles.loading}>Entry not found.</div>
      </div>
    );
  }

  const scorePct = Math.round(entry.confidence * 100);
  const displayTags = entry.tags.filter((t) => !/confidence/i.test(t));

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/notebook")} aria-label="Back">
        <BackArrowIcon />
      </button>

      <div className={styles.header}>
        <h1 className={styles.name}>{entry.plantName}</h1>
        <p className={styles.latin}>{entry.latinName}</p>
      </div>

      <button
        type="button"
        className={styles.hero}
        onClick={() => setLightbox({ url: entry.imageUrl, caption: entry.plantName })}
      >
        <Image src={entry.imageUrl} alt={entry.plantName} fill style={{ objectFit: "cover" }} />
      </button>

      <div className={styles.confidence} data-tone={toneName(scorePct)}>
        <div className={styles.confidenceFill} style={{ width: `${scorePct}%` }} />
        <span className={styles.confidenceLabel}>
          {toneLabel(scorePct)} · {scorePct}%
        </span>
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
        <Fact
          label="Date"
          value={new Date(entry.identifiedAt).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        {entry.location && <Fact label="Location" value={entry.location.place} />}
        <Fact label="Confidence" value={`${scorePct}% — ${toneLabel(scorePct).toLowerCase()}`} />
      </div>

      <div className={styles.notesSection}>
        <div className={styles.notesHeader}>
          <span className={styles.notesLabel}>Notes</span>
          {!editingNotes && (
            <button
              className={styles.editBtn}
              onClick={() => {
                setNotesValue(entry.notes ?? "");
                setEditingNotes(true);
              }}
            >
              {entry.notes ? "Edit" : "Add note"}
            </button>
          )}
        </div>

        {editingNotes ? (
          <div className={styles.notesEdit}>
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Write something about this plant…"
              rows={4}
            />
            <div className={styles.notesActions}>
              <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSavingNotes}
                onClick={() => saveNotes(notesValue)}
              >
                Save
              </Button>
            </div>
          </div>
        ) : entry.notes ? (
          <p className={styles.notesText}>{entry.notes}</p>
        ) : (
          <p className={styles.notesEmpty}>No notes yet.</p>
        )}
      </div>

      <div className={styles.danger}>
        <MarkaDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          trigger={
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete entry
            </Button>
          }
          title="Delete entry?"
          description="This will permanently remove this plant from your notebook."
        >
          <div className={styles.dialogActions}>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={isDeleting}
              onClick={() => deleteEntry()}
            >
              Delete
            </Button>
          </div>
        </MarkaDialog>
      </div>

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

function toneName(pct: number) {
  if (pct >= 80) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

function toneLabel(pct: number) {
  if (pct >= 80) return "High confidence";
  if (pct >= 50) return "Medium confidence";
  return "Low confidence";
}
