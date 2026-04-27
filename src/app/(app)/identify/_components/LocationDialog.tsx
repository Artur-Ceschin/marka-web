"use client";

import { Button, MarkaDialog } from "@/components/ui";
import styles from "./LocationDialog.module.scss";

export function LocationDialog({
  open,
  locating,
  saving,
  onIncludeLocation,
  onSkip,
  onOpenChange,
}: {
  open: boolean;
  locating: boolean;
  saving: boolean;
  onIncludeLocation: () => void;
  onSkip: () => void;
  onOpenChange: (v: boolean) => void;
}) {
  const busy = locating || saving;

  return (
    <MarkaDialog
      open={open}
      onOpenChange={(v) => !busy && onOpenChange(v)}
      title="Include your location?"
      description="Save where you found this plant so you can remember later. We'll ask your browser for permission."
    >
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={locating}
          disabled={saving}
          onClick={onIncludeLocation}
        >
          {locating ? "Getting your location…" : "Yes, include location"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          disabled={locating}
          loading={saving}
          onClick={onSkip}
        >
          Skip, save without location
        </Button>
      </div>
    </MarkaDialog>
  );
}
