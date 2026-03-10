import { useState } from 'react';
import type { IdentityTag } from '../types';
import { useToast } from '../contexts/ToastContext';
import styles from './IdentityTagEditor.module.css';
import tagsLibrary from '../data/identity-tags-library.json';

interface IdentityTagEditorProps {
  selectedTags: IdentityTag[];
  onChange: (tags: IdentityTag[]) => void;
  maxTags?: number;
}

interface TagTemplate {
  id: string;
  label: string;
  emoji?: string;
}

interface LayerData {
  name: string;
  description: string;
  tags: TagTemplate[];
}

export default function IdentityTagEditor({ selectedTags, onChange, maxTags = 5 }: IdentityTagEditorProps) {
  const { showToast } = useToast();
  const [narratives, setNarratives] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    selectedTags.forEach((tag) => {
      if (tag.narrative) {
        initial[tag.id] = tag.narrative;
      }
    });
    return initial;
  });

  const layers: Record<string, LayerData> = tagsLibrary as Record<string, LayerData>;

  const isSelected = (tagId: string): boolean => {
    return selectedTags.some((t) => t.id === tagId);
  };

  const handleToggle = (layer: 1 | 2 | 3 | 4, template: TagTemplate) => {
    const alreadySelected = isSelected(template.id);

    if (alreadySelected) {
      // Remove tag
      const updated = selectedTags.filter((t) => t.id !== template.id);
      onChange(updated);

      // Clear narrative
      const updatedNarratives = { ...narratives };
      delete updatedNarratives[template.id];
      setNarratives(updatedNarratives);
    } else {
      // Add tag (if not at max)
      if (selectedTags.length >= maxTags) {
        showToast(`You can select up to ${maxTags} identity tags`, 'info');
        return;
      }

      const newTag: IdentityTag = {
        id: template.id,
        layer,
        label: template.label,
        emoji: template.emoji,
        narrative: narratives[template.id] || undefined,
      };

      onChange([...selectedTags, newTag]);
    }
  };

  const handleNarrativeChange = (tagId: string, value: string) => {
    const updatedNarratives = { ...narratives, [tagId]: value };
    setNarratives(updatedNarratives);

    // Update the tag in selectedTags
    const updated = selectedTags.map((tag) =>
      tag.id === tagId ? { ...tag, narrative: value || undefined } : tag
    );
    onChange(updated);
  };

  const renderLayer = (layerKey: string, layerNum: 1 | 2 | 3 | 4) => {
    const layerData = layers[layerKey];
    if (!layerData) return null;

    return (
      <div key={layerKey} className={styles.layerSection}>
        <h3 className={styles.layerTitle}>
          <span className={styles.layerName}>{layerData.name}</span>
          <span className={styles.layerDesc}>{layerData.description}</span>
        </h3>

        <div className={styles.tagGrid}>
          {layerData.tags.map((template) => {
            const selected = isSelected(template.id);
            return (
              <label
                key={template.id}
                className={`${styles.tagOption} ${selected ? styles.tagSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleToggle(layerNum, template)}
                  className={styles.checkbox}
                />
                <span className={styles.tagLabel}>
                  {template.emoji && <span className={styles.tagEmoji}>{template.emoji}</span>}
                  {template.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h2 className={styles.title}>Select Your Identity Tags</h2>
        <span className={styles.counter}>
          {selectedTags.length} / {maxTags} selected
        </span>
      </div>

      <div className={styles.layers}>
        {renderLayer('layer1', 1)}
        {renderLayer('layer2', 2)}
        {renderLayer('layer3', 3)}
        {renderLayer('layer4', 4)}
      </div>

      {/* Narrative Section */}
      {selectedTags.length > 0 && (
        <div className={styles.narrativeSection}>
          <h3 className={styles.narrativeTitle}>
            Add Personal Stories <span className={styles.optional}>(Optional)</span>
          </h3>
          <p className={styles.narrativeHint}>
            Share a short story or context behind your identity tags. This helps others understand your perspective.
          </p>

          <div className={styles.narrativeList}>
            {selectedTags.map((tag) => (
              <div key={tag.id} className={styles.narrativeItem}>
                <label className={styles.narrativeLabel}>
                  {tag.emoji && <span>{tag.emoji}</span>}
                  <span>{tag.label}</span>
                </label>
                <textarea
                  className={styles.narrativeInput}
                  placeholder="Tell your story... (optional)"
                  value={narratives[tag.id] || ''}
                  onChange={(e) => handleNarrativeChange(tag.id, e.target.value)}
                  rows={2}
                  maxLength={150}
                />
                {narratives[tag.id] && (
                  <span className={styles.charCount}>
                    {narratives[tag.id].length} / 150
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
