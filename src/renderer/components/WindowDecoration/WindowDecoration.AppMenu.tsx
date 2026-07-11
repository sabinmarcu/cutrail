import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { WindowMenuModel } from '../../../shared/windowMenu';
import {
  focusFirstEnabledMenuItem,
  handleMenuItemKeyDown,
  handleTriggerKeyDown,
  isMenuFocusShortcut,
} from './WindowDecoration.AppMenu.keyboard';
import { formatAcceleratorLabel } from './WindowDecoration.AppMenu.accelerator';
import {
  accelerator,
  menuGroup,
  menuItem,
  menuPanel,
  menuSeparator,
  menuSlot,
  menuTrigger,
  root,
} from './WindowDecoration.AppMenu.css';

const EMPTY_MENU_MODEL: WindowMenuModel = {
  groups: [],
};

export const WindowDecorationAppMenu = () => {
  const [menuModel, setMenuModel] = useState<WindowMenuModel>(EMPTY_MENU_MODEL);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const triggerReferences = useRef<Array<HTMLButtonElement | null>>([]);
  const menuItemReferences = useRef<Record<string, Array<HTMLButtonElement | null>>>({});

  const groups = useMemo(() => menuModel.groups, [menuModel.groups]);

  const openGroup = (groupId: string, focusFirstItem = false) => {
    setOpenGroupId(groupId);

    if (focusFirstItem) {
      globalThis.requestAnimationFrame(() => {
        focusFirstEnabledMenuItem(menuItemReferences.current, groupId);
      });
    }
  };

  const closeMenus = () => {
    setOpenGroupId(null);
  };

  useEffect(() => {
    globalThis.cutrail?.getWindowMenuModel?.().then((nextMenuModel) => {
      setMenuModel(nextMenuModel);
    }).catch(() => {
      setMenuModel(EMPTY_MENU_MODEL);
    });

    const handleWindowBlur = () => {
      setOpenGroupId(null);
    };

    const focusFirstTrigger = () => {
      if (groups.length === 0) {
        return;
      }

      closeMenus();
      triggerReferences.current[0]?.focus();
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isMenuFocusShortcut(event)) {
        event.preventDefault();
        focusFirstTrigger();
      }
    };

    globalThis.addEventListener('click', closeMenus);
    globalThis.addEventListener('blur', handleWindowBlur);
    globalThis.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      globalThis.removeEventListener('click', closeMenus);
      globalThis.removeEventListener('blur', handleWindowBlur);
      globalThis.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [groups.length]);

  const runAction = async (actionId: string) => {
    await globalThis.cutrail?.invokeWindowMenuAction?.(actionId);
    closeMenus();
  };

  return (
    <div className={root} role="menubar" aria-label="Window menu">
      {groups.map((group, groupIndex) => (
        <div key={group.id} className={menuSlot}>
          <button
            ref={(element) => {
              triggerReferences.current[groupIndex] = element;
            }}
            type="button"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={openGroupId === group.id}
            aria-controls={`cutrail-window-menu-${group.id}`}
            className={menuTrigger}
            onClick={(event) => {
              event.stopPropagation();
              if (openGroupId === group.id) {
                closeMenus();
                return;
              }

              openGroup(group.id);
            }}
            onKeyDown={(event) => {
              handleTriggerKeyDown(event, {
                closeMenus,
                groupId: group.id,
                groupIndex,
                groupsLength: groups.length,
                openGroup,
                triggerRefs: triggerReferences.current,
              });
            }}
          >
            {group.label}
          </button>
          {openGroupId === group.id
            ? (
            <div
              id={`cutrail-window-menu-${group.id}`}
              className={menuPanel}
              role="menu"
              aria-label={`${group.label} menu`}
            >
              <div className={menuGroup}>
                {group.items.map((item, itemIndex) => (
                  item.type === 'separator'
                    ? <div key={item.id} className={menuSeparator} role="separator" />
                    : (
                    <button
                      ref={(element) => {
                        const references = menuItemReferences.current[group.id] ?? [];
                        references[itemIndex] = element;
                        menuItemReferences.current[group.id] = references;
                      }}
                      key={item.id}
                      type="button"
                      role="menuitem"
                      aria-disabled={!item.enabled}
                      className={menuItem}
                      disabled={!item.enabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        runAction(item.actionId);
                      }}
                      onKeyDown={(event) => {
                        handleMenuItemKeyDown(event, {
                          closeMenus,
                          groupId: group.id,
                          groupIndex,
                          groups,
                          menuItemRefs: menuItemReferences.current,
                          openGroup,
                          triggerRefs: triggerReferences.current,
                        });
                      }}
                    >
                      <span>{item.label}</span>
                      {item.accelerator
                        ? (
                          <span className={accelerator}>
                            {formatAcceleratorLabel(item.accelerator)}
                          </span>
                        )
                        : null}
                    </button>
                    )
                ))}
              </div>
            </div>
            )
            : null}
        </div>
      ))}
    </div>
  );
};
