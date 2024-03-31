import { createStore } from "solid-js/store";

import AgGridSolid from "ag-grid-solid";
import { getShifts } from "../logic";
import { csvToJson } from "../utils/utils";
import Navbar from "./Navbar";
import { Show, createEffect, createSignal } from "solid-js";
import { Actions } from "./Actions";

type GridProps = {
  changeLang: (lng: "he" | "en") => void;
  dir: string;
};

export type Station = {
  name: string;
  start: string;
  end: string;
  minPeople: number;
  shiftTime: number;
  shiftInterval: string;
};

export type Person = {
  name: string;
  id: number;
};

export type PersonKeys = keyof Person;
export type StationKeys = keyof Station;

const Grid = (props: GridProps) => {
  const { headers, rows } = csvToJson(getShifts());
  const [stations, setStations] = createStore<Station[]>([]);
  const [people, setPeople] = createStore<Person[]>([]);
  const [valid, setValid] = createSignal(false);

  createEffect(() => {
    setValid(stations.length > 0 && people.length > 0);
  });

  const addStation = () => {
    const newStation = {
      name: "Station 1",
      start: "06:00",
      end: "06:00",
      minPeople: 2,
      shiftTime: 360,
      shiftInterval: "m",
    };
    setStations([...stations, newStation]);
  };

  const removeStation = (index: number) => {
    setStations((s) => s.filter((_, i) => i !== index));
  };

  const removePerson = (index: number) => {
    setPeople((s) => s.filter((_, i) => i !== index));
  };

  const addPerson = () => {
    const person = {
      name: "Person " + people.length,
      id: people.length,
    };
    setPeople([...people, person]);
  };

  const onChangeStation = (
    index: number,
    key: StationKeys,
    value: string | number,
  ) => {
    setStations(index, key, value);
  };

  const onChangePerson = (
    index: number,
    key: PersonKeys,
    value: string | number,
  ) => {
    setPeople(index, key, value);
  };

  const insertDemoData = () => {
    setPeople([
      ...Array.from({ length: 10 }, (_, i) => ({ name: `Person ${i}`, id: i })),
    ]);
    setStations([
      ...Array.from({ length: 2 }, (_, i) => ({
        name: `Station ${i}`,
        start: "06:00",
        end: "06:00",
        minPeople: 2,
        shiftTime: 360,
        shiftInterval: "m",
      })),
    ]);
  };

  const columnDefs = headers.map((field: string) => ({ field }));
  let gridRef;

  const defaultColDef = {
    minWidth: 100,
    maxWidth: 200,
    width: 120,
    editable: true,
    sortable: false,
    suppressMovable: true,
  };

  const getDataAsText = (type: "csv" | "spreadsheet") => {
    const dl = type === "csv" ? "," : "\t";
    return (
      headers.join(dl) +
      "\n" +
      rows
        .map((r: Record<string, string>) => Object.values(r).join(dl))
        .join("\n")
    );
    //
  };

  return (
    <>
      <Navbar
        changeLang={props.changeLang}
        {...{
          stations,
          addStation,
          removeStation,
          onChangeStation,
          valid,
          people,
          addPerson,
          removePerson,
          onChangePerson,
          insertDemoData,
        }}
      />
      <main class="p-5">
        <div class="ag-theme-alpine" style={{ height: "700px" }}>
          <AgGridSolid
            columnDefs={columnDefs}
            rowData={rows}
            enableRtl={props.dir === "rtl"}
            ref={gridRef}
            enableCellTextSelection={true}
            rowSelection="multiple"
            defaultColDef={defaultColDef}
          />
        </div>
        <Show when={rows.length}>
          <Actions {...{ getDataAsText }} />
        </Show>
      </main>
    </>
  );
};

export default Grid;
