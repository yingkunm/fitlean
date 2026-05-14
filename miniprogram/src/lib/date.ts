export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDaysISO = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const daysBetween = (fromISO: string, toISO: string) => {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
};

export const lastNDates = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - index - 1));
    return date.toISOString().slice(0, 10);
  });

export const formatDateLabel = (iso: string) => {
  const [, month, day] = iso.split('-');
  return `${Number(month)}/${Number(day)}`;
};

export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
