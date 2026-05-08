export const getChatId = (a: string, b: string) => {
    return [a, b].sort().join('_');
  };
  