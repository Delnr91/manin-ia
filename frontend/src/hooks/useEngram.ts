"use client";
// =============================================================================
// useEngram — Engram CRUD + Autosave Hook
// =============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import type { Engram, EngramMeta } from "@/types";
import { engramStorage } from "@/services/storage";

const AUTOSAVE_DELAY_MS = 3000;

export function useEngram() {
  const [engrams, setEngrams] = useState<EngramMeta[]>([]);
  const [activeEngram, setActiveEngram] = useState<Engram | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load engrams list on mount
  useEffect(() => {
    setEngrams(engramStorage.listMeta());
  }, []);

  // Refresh the metadata list
  const refreshList = useCallback(() => {
    setEngrams(engramStorage.listMeta());
  }, []);

  // Select an engram for editing
  const selectEngram = useCallback((id: string) => {
    const engram = engramStorage.get(id);
    setActiveEngram(engram);
  }, []);

  // Create a new engram
  const createEngram = useCallback(
    (title: string = "Nuevo Engrama") => {
      const engram = engramStorage.create(title);
      setActiveEngram(engram);
      refreshList();
      return engram;
    },
    [refreshList]
  );

  // Update content with debounced autosave
  const updateContent = useCallback(
    (content: string) => {
      if (!activeEngram) return;

      // Update local state immediately for responsive UI
      setActiveEngram((prev) =>
        prev ? { ...prev, content, updatedAt: Date.now() } : null
      );

      // Debounce the actual save
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setIsSaving(true);
      saveTimerRef.current = setTimeout(() => {
        engramStorage.update(activeEngram.id, { content });
        refreshList();
        setIsSaving(false);
      }, AUTOSAVE_DELAY_MS);
    },
    [activeEngram, refreshList]
  );

  // Update title
  const updateTitle = useCallback(
    (title: string) => {
      if (!activeEngram) return;
      setActiveEngram((prev) => (prev ? { ...prev, title } : null));
      engramStorage.update(activeEngram.id, { title });
      refreshList();
    },
    [activeEngram, refreshList]
  );

  // Delete an engram
  const deleteEngram = useCallback(
    (id: string) => {
      engramStorage.delete(id);
      if (activeEngram?.id === id) {
        setActiveEngram(null);
      }
      refreshList();
    },
    [activeEngram, refreshList]
  );

  // Close editor
  const closeEditor = useCallback(() => {
    // Force save any pending changes
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    if (activeEngram) {
      engramStorage.update(activeEngram.id, {
        content: activeEngram.content,
        title: activeEngram.title,
      });
    }
    setActiveEngram(null);
    setIsSaving(false);
    refreshList();
  }, [activeEngram, refreshList]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    engrams,
    activeEngram,
    isSaving,
    selectEngram,
    createEngram,
    updateContent,
    updateTitle,
    deleteEngram,
    closeEditor,
  };
}
