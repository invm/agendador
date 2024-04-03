import { Dayjs } from "dayjs";

export const csvToJson = (csv: string) => {
  const [h, ...data] = csv.split("\n");
  const headers = h.split(",");

  const rows = data.map((row) => {
    return row.split(",").reduce(
      (acc, curr, i) => {
        acc[headers[i]] = curr;
        return acc;
      },
      {} as Record<string, string>,
    );
  });
  return { headers, rows };
};

export const newDate = (date: Dayjs, h: number, m: number) =>
  date.set("h", h).set("m", m).set("s", 0).set("ms", 0);
