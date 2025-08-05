import fetch from "node-fetch";
type cell = { v: string };
type rows = { c: cell[] }[];
type table = { cols: rows; rows: rows; parsedNumHeaders: number };
async function get_food_json() {
  const FOOD_URL =
    "https://docs.google.com/spreadsheets/d/1OF0Qh0SsgUacdMjDND6B3Cxm-oXiwwI83RlluGcj4DY/gviz/tq?&sheet=1장시트(사도별)&tq=Select%20*";
  const req = await fetch(FOOD_URL);
  const data = (
    JSON.parse((await req.text()).substring(47).slice(0, -2)).table as table
  ).rows;
  const length = data.length;
  let result: {
    [sado: string]: { "2": string[]; "1": string[]; "-1": string[] };
  } = {};
  for (let i = 0; i < length / 6; i++) {
    const row_block = data.slice(i * 6, i * 6 + 6);
    const col_length = row_block[0].c.length;
    for (let j = 1; j < col_length; j++) {
      if (row_block[0].c[j] != null && row_block[0].c[j].v != null) {
        result = {
          ...result,
          [`${row_block[0].c[j].v}`]: {
            "2": [row_block[1].c[j].v].filter((e) => e !== "X"),
            "1": [row_block[2].c[j].v, row_block[3].c[j].v].filter(
              (e) => e !== "X"
            ),
            "-1": [row_block[4].c[j].v, row_block[5].c[j].v].filter(
              (e) => e !== "X"
            ),
          },
        };
      }
    }
  }
  return result;
}
export { get_food_json };
