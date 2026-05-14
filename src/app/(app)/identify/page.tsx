'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { IoSunnyOutline, IoPrismOutline, IoSparklesOutline } from 'react-icons/io5';

import { type IdentifyResult, ApiError } from '@/lib/api';
import { PhotoPicker } from './_components/PhotoPicker';
import { ResultsList } from './_components/ResultsList';
import { DetailView } from './_components/DetailView';
import { LimitModal } from './_components/LimitModal';
import styles from './page.module.scss';
import { useIdentifySubmit } from '@/hooks/useIdentify';

type Step = 'upload' | 'preview' | 'results' | 'detail';

export default function IdentifyPage() {
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<IdentifyResult | null>(null);
  const [limitError, setLimitError] = useState<{ code: string; message: string } | null>(null);

  const {
    mutate: runIdentify,
    data: identifyData,
    isPending,
  } = useIdentifySubmit({
    onSuccess: (data) => {
      setStep('results');
      const count = data.results?.length ?? 0;
      toast.success(
        count > 0
          ? `Found ${count} match${count > 1 ? 'es' : ''}!`
          : 'No matches found. Try a clearer photo.',
      );
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code) {
        setLimitError({ code: err.code, message: err.message });
      }
    },
  });

  function handleFile(picked: File) {
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setStep('preview');
    setDetail(null);
  }

  function handleClear() {
    setPreview(null);
    setFile(null);
    setStep('upload');
    setDetail(null);
  }

  if (step === 'detail' && detail) {
    return (
      <DetailView
        result={detail}
        photoUrl={identifyData?.displayUrl ?? identifyData?.imageUrl}
        savedImageUrl={identifyData?.imageUrl}
        onBack={() => setStep('results')}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.canvas}>
        {/* Page heading */}
        {step !== 'results' && (
          <div className={styles.heading}>
            <h2 className={styles.headingTitle}>New Identification</h2>
            <p className={styles.headingSubtitle}>
              Align the specimen within the botanical grid or upload a high-resolution plate for
              analysis.
            </p>
          </div>
        )}

        {/* Viewfinder / Results */}
        {step === 'results' ? (
          <div className={styles.resultsWrapper}>
            <ResultsList
              results={identifyData?.results ?? []}
              onSelect={(r) => {
                setDetail(r);
                setStep('detail');
              }}
              onBack={handleClear}
            />
          </div>
        ) : (
          <PhotoPicker
            preview={preview}
            canIdentify={step === 'preview'}
            isIdentifying={isPending}
            onSelect={handleFile}
            onIdentify={() => file && runIdentify(file)}
            onClear={handleClear}
          />
        )}

        {/* Contextual hints — only on upload step */}
        {step !== 'results' && (
          <div className={styles.hints}>
            <div className={styles.hintCard}>
              <IoSunnyOutline size={22} className={styles.hintIcon} />
              <div>
                <p className={styles.hintTitle}>Optimal Lighting</p>
                <p className={styles.hintText}>
                  Shadowless environments yield 40% higher identification accuracy in fungi and
                  flora.
                </p>
              </div>
            </div>
            <div className={styles.hintCard}>
              <IoPrismOutline size={22} className={styles.hintIcon} />
              <div>
                <p className={styles.hintTitle}>Scale Reference</p>
                <p className={styles.hintText}>
                  Include an identifiable object for leaf-venation and size scaling.
                </p>
              </div>
            </div>
            <div className={styles.hintCard}>
              <IoSparklesOutline size={22} className={styles.hintIcon} />
              <div>
                <p className={styles.hintTitle}>AI Enhancements</p>
                <p className={styles.hintText}>
                  Automatic chromatic correction and noise reduction applied on ingest.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <LimitModal
        open={limitError !== null}
        code={limitError?.code ?? ''}
        message={limitError?.message ?? ''}
        onClose={() => setLimitError(null)}
      />

      <footer className={styles.footer}>
        <span>© 2026 Marka — All Observations Logged</span>
        <div className={styles.footerRight}>
          <span>System 1.0 // Stable</span>
          <span>Neural Net: Flora_V3</span>
        </div>
      </footer>
    </div>
  );
}
