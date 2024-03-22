export const csvToJson = (csv) => {
  const [h, ...data] = csv.split("\n");
  const headers = h.split(",");

  const rows = data.map((row) => {
    return row.split(",").reduce((acc, curr, i) => {
      acc[headers[i]] = curr;
      return acc;
    }, {});
  });
  return { headers, rows };
};
