"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button, Input, Textarea } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { users, type UpdateProfileBody } from "@/lib/api";
import styles from "./EditProfileDialog.module.scss";

type ProfileData = { name: string; email: string; bio: string | null };

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileData | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (open && profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [open, profile]);

  const { mutate, isPending } = useMutation({
    mutationFn: (body: UpdateProfileBody) => users.updateMe(body),
    onSuccess: () => {
      toast.success("Profile updated.");
      onSaved();
    },
  });

  function handleSave() {
    const body: UpdateProfileBody = {};
    if (name.trim() && name.trim() !== profile?.name) body.name = name.trim();
    if (bio.trim() !== (profile?.bio ?? "")) body.bio = bio.trim();
    if (Object.keys(body).length === 0) {
      onSaved();
      return;
    }
    mutate(body);
  }

  return (
    <Modal
      open={open}
      onClose={() => !isPending && onOpenChange(false)}
      title="Edit profile"
      description="Update your name and bio."
    >
      <div className={styles.form}>
        <Input label="Email" value={profile?.email ?? ""} disabled />
        <Input
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          showCount
          rows={3}
        />
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
