export type WindowMenuActionItem = {
  type: 'action';
  id: string;
  actionId: string;
  label: string;
  accelerator?: string;
  enabled: boolean;
};

export type WindowMenuSeparatorItem = {
  type: 'separator';
  id: string;
};

export type WindowMenuItem = WindowMenuActionItem | WindowMenuSeparatorItem;

export type WindowMenuGroup = {
  id: string;
  label: string;
  items: WindowMenuItem[];
};

export type WindowMenuModel = {
  groups: WindowMenuGroup[];
};
