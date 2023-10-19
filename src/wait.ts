export const wait = async (time: number) => {
  return await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time);
  });
};
