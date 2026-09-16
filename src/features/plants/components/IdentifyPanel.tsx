import { Check, Leaf, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';

import type { IdentifyFlow } from '../hooks/use-identify-flow';
import { describePlantError } from '../lib/describe-plant-error';

import styles from './IdentifyPanel.module.scss';

const STAGES = ['preparing', 'uploading', 'identifying'] as const;

/** Everything after a photo goes in: progress, matches, care details, errors. */
export function IdentifyPanel({ flow }: { flow: IdentifyFlow }) {
  const { m, locale } = useI18n();
  const { state } = flow;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const candidateId = useId();

  // Each new outcome takes focus, so keyboard and screen-reader users land on
  // it instead of being stranded on a control that has just disappeared.
  useEffect(() => {
    if (state.phase === 'results' || state.phase === 'confirmed' || state.phase === 'error') {
      headingRef.current?.focus();
    }
  }, [state.phase]);

  if (state.phase === 'idle') return null;

  const thumbnail = state.previewUrl ? (
    <img className={styles.thumb} src={state.previewUrl} alt={m.plants.yourPhoto} />
  ) : null;

  if (state.phase === 'working') {
    const current = STAGES.indexOf(state.stage);
    const stageText = {
      preparing: m.plants.stagePreparing,
      uploading: m.plants.stageUploading,
      identifying: m.plants.stageIdentifying,
    }[state.stage];

    return (
      <section className={styles.panel} aria-busy="true">
        {state.previewUrl ? (
          <div className={styles.photo}>
            <img src={state.previewUrl} alt={m.plants.yourPhoto} />
            <span className={styles.scan} aria-hidden="true" />
          </div>
        ) : null}
        <p className={styles.stage} role="status" aria-live="polite">
          {stageText}
        </p>
        <ol className={styles.steps} aria-hidden="true">
          {STAGES.map((stage, index) => (
            <li
              key={stage}
              className={[styles.step, index <= current ? styles.stepDone : '']
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </ol>
      </section>
    );
  }

  if (state.phase === 'error') {
    const view = describePlantError(state.error, m, locale);
    return (
      <section className={styles.panel}>
        <div className={styles.head}>
          {thumbnail}
          <div className={styles.errorText}>
            <TriangleAlert className={styles.errorIcon} aria-hidden="true" />
            <div>
              <h2 ref={headingRef} tabIndex={-1} className={styles.heading}>
                {view.title}
              </h2>
              {view.hint ? <p className={styles.hint}>{view.hint}</p> : null}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          {view.canRetry ? (
            <Button
              onClick={() => {
                void flow.retry();
              }}
            >
              {m.plants.tryAgain}
            </Button>
          ) : null}
          <Button variant={view.canRetry ? 'secondary' : 'primary'} onClick={flow.reset}>
            {m.plants.identifyAnother}
          </Button>
        </div>
      </section>
    );
  }

  if (state.phase === 'results') {
    const { result } = state;
    const low = result.certainty === 'low';
    const hasImages = result.candidates.some((candidate) => candidate.images.length > 0);
    const confirmView = flow.confirmError ? describePlantError(flow.confirmError, m, locale) : null;

    return (
      <section className={styles.panel}>
        <div className={styles.head}>
          {thumbnail}
          <div>
            <h2 ref={headingRef} tabIndex={-1} className={styles.heading}>
              {m.plants.resultsTitle}
            </h2>
            <p className={styles.quota}>
              {m.plants.quota(result.quota.remaining, result.quota.limit)}
            </p>
          </div>
        </div>

        {/* The server decides certainty, so every client draws the same line. */}
        <p className={[styles.certainty, low ? styles.certaintyLow : ''].filter(Boolean).join(' ')}>
          {low ? <TriangleAlert aria-hidden="true" /> : <Check aria-hidden="true" />}
          <span>{low ? m.plants.lowCertainty : m.plants.highCertainty}</span>
        </p>

        {confirmView ? (
          <p className={styles.inlineError} role="alert">
            {confirmView.title}
          </p>
        ) : null}

        {result.candidates.length === 0 ? (
          <p className={styles.hint}>{m.plants.noMatchHint}</p>
        ) : null}

        <ol className={styles.candidates}>
          {result.candidates.map((candidate, index) => {
            const percent = Math.round(candidate.confidence * 100);
            const image = candidate.images[0];
            const busy = flow.confirming === candidate.species;
            const nameId = `${candidateId}-${index}`;
            return (
              <li key={candidate.species} className={styles.candidate}>
                <div className={styles.candidateMain}>
                  {/* Only when some match has a photo: a column of empty
                      placeholders would add nothing but noise. */}
                  {hasImages ? (
                    <div className={styles.candidateThumb}>
                      {image ? (
                        // Decorative for screen readers: the name beside it
                        // already says which plant this is.
                        <img src={image.url} alt="" width={72} height={72} decoding="async" />
                      ) : (
                        <Leaf aria-hidden="true" />
                      )}
                    </div>
                  ) : null}
                  <div className={styles.candidateText}>
                    <p id={nameId} className={styles.scientific}>
                      <i>{candidate.scientificName}</i>
                    </p>
                    {candidate.commonNames.length > 0 ? (
                      <p className={styles.common}>
                        {candidate.commonNames.slice(0, 2).join(', ')}
                      </p>
                    ) : null}
                    <p className={styles.meta}>
                      {[candidate.family, m.plants.confidence(percent)].filter(Boolean).join(' · ')}
                    </p>
                    <div className={styles.bar} aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    {/* PlantNet photos are mostly CC BY-SA, which requires credit. */}
                    {image?.author ? (
                      <p className={styles.credit}>{m.plants.photoCredit(image.author)}</p>
                    ) : null}
                  </div>
                </div>
                <Button
                  className={styles.choose}
                  // Only a confident top match is highlighted. When the server
                  // is unsure, nudging people towards the first guess would be
                  // the app being confidently wrong on their behalf.
                  variant={!low && index === 0 ? 'primary' : 'secondary'}
                  loading={busy}
                  disabled={flow.confirming !== null && !busy}
                  // Every candidate button reads "This is it"; the description
                  // says which plant it would confirm.
                  aria-describedby={nameId}
                  onClick={() => {
                    void flow.confirm(candidate.species);
                  }}
                >
                  {busy ? m.plants.confirming : m.plants.choose}
                </Button>
              </li>
            );
          })}
        </ol>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={flow.reset}>
            {m.plants.identifyAnother}
          </Button>
        </div>
      </section>
    );
  }

  const { species, enrichment, already } = state;
  const sections = [
    ['description', m.plants.description],
    ['care', m.plants.care],
    ['toxicity', m.plants.toxicity],
    ['nativeStatus', m.plants.nativeStatus],
  ] as const;

  let details = null;
  if (enrichment) {
    details = (
      <dl className={styles.enrichment}>
        {sections.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{enrichment[key]}</dd>
          </div>
        ))}
      </dl>
    );
  } else if (!already) {
    details = <p className={styles.hint}>{m.plants.enrichmentRefused}</p>;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        {thumbnail}
        <div>
          {already ? null : (
            <p className={styles.eyebrow}>
              <Check aria-hidden="true" />
              {m.plants.confirmedTitle}
            </p>
          )}
          <h2 ref={headingRef} tabIndex={-1} className={styles.heading}>
            {already ? m.plants.alreadyConfirmed : <i>{species}</i>}
          </h2>
        </div>
      </div>
      {details}
      <div className={styles.actions}>
        <Button onClick={flow.reset}>{m.plants.identifyAnother}</Button>
      </div>
    </section>
  );
}
