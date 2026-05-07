/**
 * Viewer vs developer capabilities (derived from config only).
 */
export function createPermissions(config) {
  const { developer } = config;

  return {
    isDeveloper: () => developer,
    canEditMindMap: () => developer,
    canEditKanban: () => developer,
    canEditWiki: () => developer,
    canRemoveSuggestion: () => developer,
    canSetSuggestionApproval: () => developer,
    canEditSettings: () => developer,
    canUseDevShortcuts: () => developer,
  };
}
