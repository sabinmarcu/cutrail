type TriggerReferences = Array<HTMLButtonElement | null>;
type MenuItemReferences = Record<string, Array<HTMLButtonElement | null>>;
type MenuGroup = {
  id: string;
};

type OpenGroupFunction = (groupId: string, focusFirstItem?: boolean) => void;

type TriggerKeyDownDeps = {
  closeMenus: () => void;
  groupId: string;
  groupIndex: number;
  groupsLength: number;
  openGroup: OpenGroupFunction;
  triggerRefs: TriggerReferences;
};

type MenuItemKeyDownDeps = {
  closeMenus: () => void;
  groupId: string;
  groupIndex: number;
  groups: MenuGroup[];
  menuItemRefs: MenuItemReferences;
  openGroup: OpenGroupFunction;
  triggerRefs: TriggerReferences;
};

const isPlainShortcut = (event: React.KeyboardEvent | KeyboardEvent): boolean => !event.altKey
  && !event.ctrlKey
  && !event.metaKey;

const isKey = (event: React.KeyboardEvent, value: string): boolean => isPlainShortcut(event)
  && event.key.toLowerCase() === value;

const focusGroupTrigger = (
  triggerReferences: TriggerReferences,
  groupsLength: number,
  groupIndex: number,
): void => {
  if (groupsLength === 0) {
    return;
  }

  const nextIndex = ((groupIndex % groupsLength) + groupsLength) % groupsLength;

  triggerReferences[nextIndex]?.focus();
};

const focusFirstEnabledMenuItem = (
  menuItemReferences: MenuItemReferences,
  groupId: string,
): void => {
  const firstEnabled = menuItemReferences[groupId]?.find((item) => {
    if (!item) {
      return false;
    }

    return item.disabled === false;
  });

  firstEnabled?.focus();
};

const getEnabledActionItems = (
  menuItemReferences: MenuItemReferences,
  groupId: string,
): HTMLButtonElement[] => {
  const actions = menuItemReferences[groupId] ?? [];

  return actions.filter((entry) => entry && entry.disabled === false) as HTMLButtonElement[];
};

const getSiblingGroupId = (
  groups: MenuGroup[],
  groupIndex: number,
  delta: number,
): string | null => {
  if (groups.length === 0) {
    return null;
  }

  const nextIndex = (groupIndex + delta + groups.length) % groups.length;

  return groups[nextIndex]?.id ?? null;
};

const isMenuFocusShortcut = (event: KeyboardEvent): boolean => {
  const isAltMenuFocus = event.key === 'Alt' && !event.ctrlKey && !event.metaKey;

  return isAltMenuFocus || event.key === 'F10';
};

const handleTriggerKeyDown = (event: React.KeyboardEvent, deps: TriggerKeyDownDeps): void => {
  const {
    closeMenus,
    groupId,
    groupIndex,
    groupsLength,
    openGroup,
    triggerRefs,
  } = deps;

  if (event.key === 'ArrowRight' || isKey(event, 'l')) {
    event.preventDefault();
    focusGroupTrigger(triggerRefs, groupsLength, groupIndex + 1);

    return;
  }

  if (event.key === 'ArrowLeft' || isKey(event, 'h')) {
    event.preventDefault();
    focusGroupTrigger(triggerRefs, groupsLength, groupIndex - 1);

    return;
  }

  if (
    event.key === 'ArrowDown'
    || isKey(event, 'j')
    || event.key === 'Enter'
    || event.key === ' '
  ) {
    event.preventDefault();
    openGroup(groupId, true);

    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenus();
  }
};

const handleMenuItemKeyDown = (
  event: React.KeyboardEvent<HTMLButtonElement>,
  deps: MenuItemKeyDownDeps,
): void => {
  const {
    closeMenus,
    groupId,
    groupIndex,
    groups,
    menuItemRefs,
    openGroup,
    triggerRefs,
  } = deps;
  const actionItems = getEnabledActionItems(menuItemRefs, groupId);

  if (actionItems.length === 0) {
    return;
  }

  const currentIndex = actionItems.indexOf(event.currentTarget);

  if (event.key === 'ArrowDown' || isKey(event, 'j')) {
    event.preventDefault();
    actionItems[(currentIndex + 1) % actionItems.length]?.focus();

    return;
  }

  if (event.key === 'ArrowUp' || isKey(event, 'k')) {
    event.preventDefault();
    actionItems[(currentIndex - 1 + actionItems.length) % actionItems.length]?.focus();

    return;
  }

  if (event.key === 'ArrowRight' || isKey(event, 'l')) {
    event.preventDefault();
    const nextGroupId = getSiblingGroupId(groups, groupIndex, 1);

    if (nextGroupId) {
      openGroup(nextGroupId, true);
    }

    return;
  }

  if (event.key === 'ArrowLeft' || isKey(event, 'h')) {
    event.preventDefault();
    const nextGroupId = getSiblingGroupId(groups, groupIndex, -1);

    if (nextGroupId) {
      openGroup(nextGroupId, true);
    }

    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenus();
    focusGroupTrigger(triggerRefs, groups.length, groupIndex);
  }
};

export {
  focusGroupTrigger,
  handleMenuItemKeyDown,
  handleTriggerKeyDown,
  focusFirstEnabledMenuItem,
  getEnabledActionItems,
  getSiblingGroupId,
  isMenuFocusShortcut,
};
