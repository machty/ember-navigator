export type Routeable = {
  name: string;
  children: Routeable[];
  componentName: string;
};
