export const getMaintenanceModeStatus = (): Promise<
  [Error | null, boolean | null]
> => {
  return new Promise((resolve) => {
    resolve([null, false]);
  });
};
