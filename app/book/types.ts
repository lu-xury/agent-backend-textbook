export type Chapter = {
  number: number;
  shortTitle: string;
  title: string;
  subtitle: string;
  opening: string[];
  goals: string[];
  markdown: string;
  furtherReading: { title: string; href: string }[];
};
