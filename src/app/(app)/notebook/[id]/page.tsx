'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  IoArrowBack,
  IoPencilOutline,
  IoLeafOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoStatsChartOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoGridOutline,
} from 'react-icons/io5';

import { Button, Tag, Textarea } from '@/components/ui';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { Modal } from '@/components/Modal';
import { notebook } from '@/lib/api';
import styles from './page.module.scss';

export default function NotebookEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  // staleTime: 0 — imageUrl is a pre-signed URL (1h TTL), never serve from cache
  const { data: entry, isLoading } = useQuery({
    queryKey: ['notebook', id],
    queryFn: () => notebook.getById(id),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (entry && !editingNotes) {
      setNotesValue(entry.notes ?? '');
    }
  }, [entry, editingNotes]);

  const { mutate: saveNotes, isPending: isSavingNotes } = useMutation({
    mutationFn: (notes: string) => notebook.updateNotes(id, notes),
    onSuccess: () => {
      toast.success('Notes saved');
      queryClient.invalidateQueries({ queryKey: ['notebook', id] });
      queryClient.invalidateQueries({ queryKey: ['notebook'] });
      setEditingNotes(false);
    },
  });

  const { mutate: deleteEntry, isPending: isDeleting } = useMutation({
    mutationFn: () => notebook.delete(id),
    onSuccess: () => {
      toast.success('Entry deleted');
      queryClient.invalidateQueries({ queryKey: ['notebook'] });
      router.replace('/notebook');
    },
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.grain} />
        <button className={styles.back} onClick={() => router.back()} aria-label="Back">
          <IoArrowBack size={18} />
        </button>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.page}>
        <div className={styles.grain} />
        <button className={styles.back} onClick={() => router.back()} aria-label="Back">
          <IoArrowBack size={18} />
        </button>
        <div className={styles.loading}>Entry not found.</div>
      </div>
    );
  }

  const plant = entry.plant ?? null;
  const scorePct = Math.round(entry.confidence * 100);

  // Merge and deduplicate tags from entry + plant, strip confidence tags
  const allTags = [...new Set([...entry.tags, ...(plant?.tags ?? [])])].filter(
    (t) => !/confidence/i.test(t),
  );

  const nameParts = entry.plantName.split(' ');
  const nameFirst = nameParts[0];
  const nameRest = nameParts.slice(1).join(' ');

  const dateStr = new Date(entry.identifiedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refImages = plant?.referenceImages ?? [];
  const nativeRegions = plant?.nativeRegions ?? [];
  const commonNames = plant?.commonNames ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.grain} />

      {/* ── Back button ────────────────────────────────────────────── */}
      <button className={styles.back} onClick={() => router.push('/notebook')} aria-label="Back">
        <IoArrowBack size={18} />
      </button>

      {/* ── Two-column body ───────────────────────────────────────── */}
      <div className={styles.body}>
        {/* ── Left col: hero + ref images + tags ─────────────────── */}
        <div className={styles.colLeft}>
          <button
            type="button"
            className={styles.hero}
            onClick={() => setLightbox({ url: entry.imageUrl, caption: entry.plantName })}
          >
            <div className={styles.heroMedia}>
              <Image
                src={entry.imageUrl}
                alt={entry.plantName}
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.heroGradient} />
          </button>

          {/* Reference images carousel */}
          {refImages.length > 0 && (
            <div className={styles.refSection}>
              <span className={styles.refLabel}>
                <IoGridOutline size={11} />
                Reference photos
              </span>
              <div className={styles.refStrip}>
                {refImages.slice(0, 6).map((ref, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.refThumb}
                    onClick={() => setLightbox({ url: ref.url, caption: ref.organ })}
                  >
                    <div className={styles.refThumbMedia}>
                      <Image
                        src={ref.url}
                        alt={ref.organ}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <span className={styles.refOrgan}>{ref.organ}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className={styles.tags}>
              {allTags.map((tag) => (
                <Tag key={tag} variant="green" size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* ── Right col ──────────────────────────────────────────── */}
        <div className={styles.colRight}>
          {/* Editorial header */}
          <header className={styles.header}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span className={styles.eyebrowLabel}>Field Entry</span>
            </div>

            <h1 className={styles.plantName}>
              {nameFirst}
              {nameRest && <span className={styles.plantNameItalic}> {nameRest}</span>}
            </h1>

            {entry.latinName && <p className={styles.latinName}>{entry.latinName}</p>}

            <div className={styles.badges}>
              {scorePct >= 80 && (
                <span className={styles.confidenceBadge}>High Match · {scorePct}%</span>
              )}
              {plant?.isInvasive && (
                <span className={styles.invasiveBadge}>
                  <IoWarningOutline size={11} />
                  Invasive species
                </span>
              )}
            </div>
          </header>

          {/* Meta card */}
          <div className={styles.metaCard}>
            <MetaRow icon={<IoCalendarOutline size={14} />} label="Date" value={dateStr} />
            {entry.location && (
              <MetaRow
                icon={<IoLocationOutline size={14} />}
                label="Location"
                value={entry.location.place}
              />
            )}
            <MetaRow
              icon={<IoStatsChartOutline size={14} />}
              label="Confidence"
              value={`${scorePct}% — ${toneLabel(scorePct).toLowerCase()}`}
              tone={toneName(scorePct)}
            />
            <MetaRow
              icon={<IoLeafOutline size={14} />}
              label="Species"
              value={entry.latinName ?? entry.plantName}
              italic
            />
          </div>

          {/* Plant data — show skeleton if plant === null */}
          {plant === null ? (
            <PlantSkeleton />
          ) : (
            <>
              {/* Taxonomy */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Taxonomy</span>
                </div>
                <div className={styles.metaCard}>
                  {plant.family && (
                    <MetaRow
                      icon={<IoLeafOutline size={14} />}
                      label="Family"
                      value={plant.family}
                    />
                  )}
                  {plant.genus && (
                    <MetaRow
                      icon={<IoLeafOutline size={14} />}
                      label="Genus"
                      value={plant.genus}
                      italic
                    />
                  )}
                  {plant.scientificNameAuthorship && (
                    <MetaRow
                      icon={<IoLeafOutline size={14} />}
                      label="Authorship"
                      value={plant.scientificNameAuthorship}
                    />
                  )}
                </div>
              </section>

              {/* Common names */}
              {commonNames.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Common names</span>
                  </div>
                  <div className={styles.sectionCard}>
                    <div className={styles.namesList}>
                      {commonNames.map((name) => (
                        <span key={name} className={styles.commonName}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Native regions */}
              {nativeRegions.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Native origin</span>
                  </div>
                  <div className={styles.regionChips}>
                    {nativeRegions.map((region) => (
                      <span key={region} className={styles.regionChip}>
                        {region}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Field notes */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Field Notes</span>
              {!editingNotes && (
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    setNotesValue(entry.notes ?? '');
                    setEditingNotes(true);
                  }}
                >
                  <IoPencilOutline size={13} />
                  {entry.notes ? 'Edit' : 'Add note'}
                </button>
              )}
            </div>
            <div className={styles.sectionCard}>
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
                <p className={styles.notesEmpty}>
                  No field notes yet. Tap &quot;Add note&quot; to record your observations.
                </p>
              )}
            </div>
          </section>

          {/* Danger */}
          <section className={styles.dangerSection}>
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              <IoTrashOutline size={15} />
              Remove from notebook
            </button>
          </section>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete entry?"
        description="This will permanently remove this plant from your notebook. This action cannot be undone."
      >
        <div className={styles.modalActions}>
          <Button variant="ghost" size="sm" fullWidth onClick={() => setConfirmDelete(false)}>
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
      </Modal>

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetaRow({
  icon,
  label,
  value,
  tone,
  italic,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'high' | 'medium' | 'low';
  italic?: boolean;
}) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaIcon}>{icon}</span>
      <span className={styles.metaLabel}>{label}</span>
      <span
        className={[
          styles.metaValue,
          tone ? styles[`tone_${tone}`] : '',
          italic ? styles.metaItalic : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function PlantSkeleton() {
  return (
    <div className={styles.plantSkeleton}>
      <div className={styles.skeletonLabel}>Plant data</div>
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} style={{ width: '60%' }} />
        <div className={styles.skeletonRow} style={{ width: '80%' }} />
      </div>
      <p className={styles.skeletonHint}>Species data is being fetched…</p>
    </div>
  );
}

function toneName(pct: number): 'high' | 'medium' | 'low' {
  if (pct >= 80) return 'high';
  if (pct >= 50) return 'medium';
  return 'low';
}

function toneLabel(pct: number) {
  if (pct >= 80) return 'High confidence';
  if (pct >= 50) return 'Medium confidence';
  return 'Low confidence';
}
