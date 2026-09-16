import { Droplets, Globe2, Leaf, MapPin, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

import type { Detection } from '../api/identify-api';
import { plantNames } from '../lib/plant-names';

import styles from './DetectionDetails.module.scss';

interface DetectionDetailsProps {
  detection: Detection;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Everything known about one plant: photo, names, care, notes, where and when. */
export function DetectionDetails({ detection, onClose, onEdit, onDelete }: DetectionDetailsProps) {
  const { m, locale } = useI18n();
  const names = plantNames(detection, m);
  const { enrichment } = detection;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? null
      : new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
  };

  const observed = detection.observedAt ? formatDate(detection.observedAt) : null;
  const identified = formatDate(detection.createdAt);
  // Each card carries its own icon, so the four kinds of advice are told apart
  // at a glance rather than by reading every heading.
  const careSections: {
    key: keyof NonNullable<typeof enrichment>;
    label: string;
    icon: ReactNode;
  }[] = [
    { key: 'description', label: m.plants.description, icon: <Leaf aria-hidden="true" /> },
    { key: 'care', label: m.plants.care, icon: <Droplets aria-hidden="true" /> },
    { key: 'toxicity', label: m.plants.toxicity, icon: <TriangleAlert aria-hidden="true" /> },
    { key: 'nativeStatus', label: m.plants.nativeStatus, icon: <Globe2 aria-hidden="true" /> },
  ];

  const others = detection.candidates.filter((option) => option.species !== names.scientific);

  return (
    <Dialog open size="lg" chrome="bare" title={names.common ?? names.scientific} onClose={onClose}>
      {/* The photo is the heading: the name sits on it, the way a field guide
          leads with the plant rather than with a label. */}
      <header className={styles.hero}>
        <img src={detection.imageUrl} alt="" />
        <div className={styles.scrim} />
        <div className={styles.heroText}>
          {names.candidate?.family ? (
            <p className={styles.eyebrow}>{names.candidate.family}</p>
          ) : null}
          <h2 className={styles.title}>{names.common ?? names.scientific}</h2>
          {names.common ? <p className={styles.latin}>{names.scientific}</p> : null}
        </div>
      </header>

      <div className={styles.body}>
        <ul className={styles.chips}>
          {detection.confirmedSpecies ? null : (
            <li className={[styles.chip, styles.chipWarn].join(' ')}>{m.plants.notConfirmed}</li>
          )}
          {observed ? <li className={styles.chip}>{m.plants.seenOn(observed)}</li> : null}
          {identified && !observed ? <li className={styles.chip}>{identified}</li> : null}
          {detection.location ? (
            <li className={styles.chip}>
              <MapPin aria-hidden="true" />
              {detection.location.latitude.toFixed(2)}, {detection.location.longitude.toFixed(2)}
            </li>
          ) : null}
        </ul>

        {detection.notes ? (
          <section className={styles.notes}>
            <h3 className={styles.label}>{m.plants.notes}</h3>
            <p className={styles.notesText}>{detection.notes}</p>
          </section>
        ) : null}

        {enrichment ? (
          <div className={styles.care}>
            {careSections.map((section) => (
              <section key={section.key} className={styles.careCard}>
                <h3 className={styles.careHead}>
                  <span className={styles.careIcon}>{section.icon}</span>
                  {section.label}
                </h3>
                <p className={styles.text}>{enrichment[section.key]}</p>
              </section>
            ))}
          </div>
        ) : (
          <p className={styles.muted}>{m.plants.noDetails}</p>
        )}

        {others.length > 0 ? (
          <section>
            <h3 className={styles.label}>{m.plants.otherMatches}</h3>
            <ul className={styles.others}>
              {others.map((option) => {
                const percent = Math.round(option.confidence * 100);
                return (
                  <li key={option.species} className={styles.other}>
                    <span className={styles.otherName}>
                      {option.commonNames[0] ? (
                        <>
                          {option.commonNames[0]} <i>{option.scientificName}</i>
                        </>
                      ) : (
                        <i>{option.scientificName}</i>
                      )}
                    </span>
                    <span className={styles.otherScore}>{m.plants.confidence(percent)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      {/* Always reachable without scrolling back up on a long record. */}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          {m.plants.editTitle}
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 aria-hidden="true" />
          {m.plants.deleteConfirm}
        </Button>
      </div>
    </Dialog>
  );
}
