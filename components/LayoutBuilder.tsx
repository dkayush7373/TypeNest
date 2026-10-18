'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CustomLayout,
  KeyDefinition,
  PRESET_LAYOUTS,
  PresetLayoutType,
  QWERTY_LAYOUT,
  COLEMAK_LAYOUT,
  DVORAK_LAYOUT,
  WORKMAN_LAYOUT,
} from '@/lib/layouts';
import { getSafeStorage, setSafeStorage } from '@/lib/storage';
import {
  Keyboard,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Play,
  Check,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export const LAYOUTS_STORAGE_KEY = 'keyflow:custom_layouts';

interface LayoutBuilderProps {
  onTestLayout: (layoutId: string) => void;
  onApplyLayoutToSettings: (layoutId: string) => void;
  activeLayoutId?: string;
}

export const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  onTestLayout,
  onApplyLayoutToSettings,
  activeLayoutId = 'qwerty',
}) => {
  const [customLayouts, setCustomLayouts] = useState<CustomLayout[]>(() => {
    return getSafeStorage<CustomLayout[]>(LAYOUTS_STORAGE_KEY, []);
  });

  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(activeLayoutId);
  const [selectedKeyCoord, setSelectedKeyCoord] = useState<{ row: number; col: number } | null>(null);
  const [draggedCoord, setDraggedCoord] = useState<{ row: number; col: number } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Synchronize custom layouts to storage
  const persistCustomLayouts = useCallback((layouts: CustomLayout[]) => {
    setCustomLayouts(layouts);
    setSafeStorage(LAYOUTS_STORAGE_KEY, layouts);
  }, []);

  // Determine current active layout matrix
  const currentLayoutMatrix: KeyDefinition[][] = useMemo(() => {
    const custom = customLayouts.find((l) => l.id === selectedLayoutId);
    if (custom) return custom.rows;
    if (selectedLayoutId === 'colemak') return COLEMAK_LAYOUT;
    if (selectedLayoutId === 'dvorak') return DVORAK_LAYOUT;
    if (selectedLayoutId === 'workman') return WORKMAN_LAYOUT;
    return QWERTY_LAYOUT;
  }, [selectedLayoutId, customLayouts]);

  const isCurrentPreset = ['qwerty', 'colemak', 'dvorak', 'workman'].includes(selectedLayoutId);
  const currentLayoutName = useMemo(() => {
    if (isCurrentPreset) {
      return PRESET_LAYOUTS[selectedLayoutId as PresetLayoutType]?.name || selectedLayoutId;
    }
    const found = customLayouts.find((l) => l.id === selectedLayoutId);
    return found ? found.name : 'Custom Layout';
  }, [isCurrentPreset, selectedLayoutId, customLayouts]);

  // Create new custom layout cloned from preset
  const handleCreateFromPreset = (presetKey: PresetLayoutType = 'qwerty') => {
    const base = PRESET_LAYOUTS[presetKey];
    const newId = `layout-${Date.now()}`;
    const newName = `Custom ${base.name} ${customLayouts.length + 1}`;
    const clonedRows: KeyDefinition[][] = JSON.parse(JSON.stringify(base.rows));

    const newLayout: CustomLayout = {
      id: newId,
      name: newName,
      presetBase: presetKey,
      rows: clonedRows,
    };

    const next = [...customLayouts, newLayout];
    persistCustomLayouts(next);
    setSelectedLayoutId(newId);
    setFeedbackMessage(`Created "${newName}"`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Duplicate current layout
  const handleDuplicate = () => {
    const clonedRows: KeyDefinition[][] = JSON.parse(JSON.stringify(currentLayoutMatrix));
    const newId = `layout-${Date.now()}`;
    const newName = `${currentLayoutName} (Copy)`;
    const newLayout: CustomLayout = {
      id: newId,
      name: newName,
      rows: clonedRows,
    };
    const next = [...customLayouts, newLayout];
    persistCustomLayouts(next);
    setSelectedLayoutId(newId);
    setFeedbackMessage(`Duplicated as "${newName}"`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Delete current custom layout
  const handleDelete = () => {
    if (isCurrentPreset) return;
    const next = customLayouts.filter((l) => l.id !== selectedLayoutId);
    persistCustomLayouts(next);
    setSelectedLayoutId('qwerty');
    setFeedbackMessage('Layout deleted');
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Save renamed layout
  const handleSaveName = () => {
    if (!nameInput.trim() || isCurrentPreset) {
      setEditingName(false);
      return;
    }
    const next = customLayouts.map((l) =>
      l.id === selectedLayoutId ? { ...l, name: nameInput.trim() } : l
    );
    persistCustomLayouts(next);
    setEditingName(false);
  };

  // Swap keys in custom layout
  const swapKeys = useCallback(
    (c1: { row: number; col: number }, c2: { row: number; col: number }) => {
      if (c1.row === c2.row && c1.col === c2.col) return;

      // If user tries to edit a preset, automatically create an editable clone for them
      let targetLayoutId = selectedLayoutId;
      const nextLayouts = [...customLayouts];

      if (isCurrentPreset) {
        const clonedRows: KeyDefinition[][] = JSON.parse(JSON.stringify(currentLayoutMatrix));
        const newId = `layout-${Date.now()}`;
        const newName = `Custom ${currentLayoutName}`;
        const newLayout: CustomLayout = {
          id: newId,
          name: newName,
          rows: clonedRows,
        };
        nextLayouts.push(newLayout);
        targetLayoutId = newId;
        setSelectedLayoutId(newId);
      }

      const updated = nextLayouts.map((l) => {
        if (l.id !== targetLayoutId) return l;
        const rowsCopy: KeyDefinition[][] = JSON.parse(JSON.stringify(l.rows));
        const key1 = rowsCopy[c1.row][c1.col];
        const key2 = rowsCopy[c2.row][c2.col];

        // Swap labels and shift labels only (keep physical code, width, finger intact)
        const tempLabel = key1.label;
        const tempShift = key1.shiftLabel;
        key1.label = key2.label;
        key1.shiftLabel = key2.shiftLabel;
        key2.label = tempLabel;
        key2.shiftLabel = tempShift;

        return { ...l, rows: rowsCopy };
      });

      persistCustomLayouts(updated);
      setSelectedKeyCoord(null);
      setDraggedCoord(null);
    },
    [selectedLayoutId, customLayouts, isCurrentPreset, currentLayoutMatrix, currentLayoutName, persistCustomLayouts]
  );

  // Keyboard accessibility: press a key to reassign or swap with selected keycap
  useEffect(() => {
    if (!selectedKeyCoord) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedKeyCoord(null);
        return;
      }

      // If single printable character pressed, find if another key has this character and swap
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const pressedChar = e.key.toLowerCase();

        // Search for existing key with this label
        let foundCoord: { row: number; col: number } | null = null;
        currentLayoutMatrix.forEach((row, rIdx) => {
          row.forEach((key, cIdx) => {
            if (key.label.toLowerCase() === pressedChar) {
              foundCoord = { row: rIdx, col: cIdx };
            }
          });
        });

        if (foundCoord) {
          swapKeys(selectedKeyCoord, foundCoord);
        } else {
          // Direct label assign if not found elsewhere
          let targetLayoutId = selectedLayoutId;
          const nextLayouts = [...customLayouts];

          if (isCurrentPreset) {
            const clonedRows: KeyDefinition[][] = JSON.parse(JSON.stringify(currentLayoutMatrix));
            const newId = `layout-${Date.now()}`;
            const newName = `Custom ${currentLayoutName}`;
            nextLayouts.push({ id: newId, name: newName, rows: clonedRows });
            targetLayoutId = newId;
            setSelectedLayoutId(newId);
          }

          const updated = nextLayouts.map((l) => {
            if (l.id !== targetLayoutId) return l;
            const rowsCopy: KeyDefinition[][] = JSON.parse(JSON.stringify(l.rows));
            rowsCopy[selectedKeyCoord.row][selectedKeyCoord.col].label = pressedChar;
            rowsCopy[selectedKeyCoord.row][selectedKeyCoord.col].shiftLabel = pressedChar.toUpperCase();
            return { ...l, rows: rowsCopy };
          });

          persistCustomLayouts(updated);
          setSelectedKeyCoord(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeyCoord, currentLayoutMatrix, selectedLayoutId, customLayouts, isCurrentPreset, currentLayoutName, swapKeys, persistCustomLayouts]);

  // Export current layout to JSON
  const handleExport = () => {
    const exportData = {
      name: currentLayoutName,
      id: selectedLayoutId,
      rows: currentLayoutMatrix,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLayoutName.toLowerCase().replace(/\s+/g, '-')}-layout.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import layout from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.rows)) {
          const importedLayout: CustomLayout = {
            id: `imported-${Date.now()}`,
            name: `${parsed.name} (Imported)`,
            rows: parsed.rows,
          };
          const next = [...customLayouts, importedLayout];
          persistCustomLayouts(next);
          setSelectedLayoutId(importedLayout.id);
          setFeedbackMessage(`Successfully imported "${importedLayout.name}"`);
          setTimeout(() => setFeedbackMessage(null), 3000);
        } else {
          alert('Invalid layout JSON format.');
        }
      } catch {
        alert('Failed to parse layout file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-2">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)] tracking-normal font-mono flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-[var(--accent)]" />
            <span>Custom Keyboard Layout Builder</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Swap keycaps with drag-and-drop or select any key and press a character on your keyboard.
          </p>
        </div>

        {feedbackMessage && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-mono border border-[var(--accent)]/40">
            <Check className="w-3.5 h-3.5" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Layout Selector & Actions Bar */}
      <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Layout list dropdown & presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)] uppercase">Active:</span>
          <select
            value={selectedLayoutId}
            onChange={(e) => setSelectedLayoutId(e.target.value)}
            className="p-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none focus:border-[var(--accent)]"
          >
            <optgroup label="Presets">
              <option value="qwerty">QWERTY</option>
              <option value="colemak">Colemak</option>
              <option value="dvorak">Dvorak</option>
              <option value="workman">Workman</option>
            </optgroup>
            {customLayouts.length > 0 && (
              <optgroup label="Custom Layouts">
                {customLayouts.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Rename custom layout */}
          {!isCurrentPreset && (
            editingName ? (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-2 py-1 rounded border border-[var(--accent)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-1 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameInput(currentLayoutName);
                  setEditingName(true);
                }}
                className="p-1 rounded hover:text-[var(--text)] text-[var(--text-muted)]"
                title="Rename layout"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCreateFromPreset('qwerty')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            title="Create new layout from QWERTY"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--border)] hover:text-[var(--text)] transition-colors"
            title="Duplicate layout"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          {!isCurrentPreset && (
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 px-2.5 py-1 rounded border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete layout"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--border)] hover:text-[var(--text)] transition-colors"
            title="Export layout as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--border)] hover:text-[var(--text)] cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => onApplyLayoutToSettings(selectedLayoutId)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors font-medium"
            title="Set as active workspace layout"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use in Settings</span>
          </button>

          <button
            onClick={() => onTestLayout(selectedLayoutId)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
            title="Test this layout in a live typing session"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Layout</span>
          </button>
        </div>
      </div>

      {/* Editing Guidance Strip */}
      <div className="p-3 rounded-md border border-[var(--border)] bg-[var(--bg)]/60 flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[var(--accent)]" />
          <span>
            {selectedKeyCoord
              ? `Key selected. Press any key on your keyboard to swap, or click another key.`
              : `Click any key to select it, or drag and drop between keycaps to swap.`}
          </span>
        </div>
        {selectedKeyCoord && (
          <button
            onClick={() => setSelectedKeyCoord(null)}
            className="text-[var(--accent)] hover:underline"
          >
            Cancel Selection
          </button>
        )}
      </div>

      {/* Interactive Visual Keycap Board */}
      <div className="w-full p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {currentLayoutMatrix.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
              {row.map((keyDef, cIdx) => {
                const isSelected = selectedKeyCoord?.row === rIdx && selectedKeyCoord?.col === cIdx;
                const isBeingDragged = draggedCoord?.row === rIdx && draggedCoord?.col === cIdx;
                const widthMultiplier = keyDef.width || 1;
                const isSpecialKey = ['Backspace', 'Tab', 'CapsLock', 'Enter', 'ShiftLeft', 'ShiftRight', 'Space'].includes(keyDef.code);

                return (
                  <div
                    key={keyDef.code}
                    draggable={!isSpecialKey}
                    onDragStart={() => setDraggedCoord({ row: rIdx, col: cIdx })}
                    onDragOver={(e) => {
                      if (!isSpecialKey) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (draggedCoord && !isSpecialKey) {
                        swapKeys(draggedCoord, { row: rIdx, col: cIdx });
                      }
                    }}
                    onClick={() => {
                      if (isSpecialKey) return;
                      if (!selectedKeyCoord) {
                        setSelectedKeyCoord({ row: rIdx, col: cIdx });
                      } else {
                        swapKeys(selectedKeyCoord, { row: rIdx, col: cIdx });
                      }
                    }}
                    className={`keycap relative flex flex-col items-center justify-center h-10 sm:h-12 text-xs sm:text-sm font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'is-lit ring-2 ring-[var(--accent)] z-10'
                        : isBeingDragged
                        ? 'opacity-40'
                        : 'hover:border-[var(--accent)]/50'
                    }`}
                    style={{
                      flex: `${widthMultiplier} ${widthMultiplier} 0px`,
                      minWidth: `${Math.round(26 * widthMultiplier)}px`,
                    }}
                  >
                    {keyDef.shiftLabel && (
                      <span className="absolute top-1 left-1.5 text-[9px] text-[var(--text-muted)] opacity-60 leading-none">
                        {keyDef.shiftLabel}
                      </span>
                    )}
                    <span
                      className={`leading-none font-medium ${
                        isSelected ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text)]'
                      }`}
                    >
                      {keyDef.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
