import { createStore } from "solid-js/store";

import AgGridSolid from "ag-grid-solid";
import { InputStation, getShifts } from "../logic";
import { csvToJson, newDate } from "../utils/utils";
import Navbar from "./Navbar";
import { Show, createEffect, createSignal } from "solid-js";
import { Actions } from "./Actions";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

type GridProps = {
  changeLang: (lng: "he" | "en") => void;
  dir: string;
};

export type Station = {
  name: string;
  start: Dayjs;
  end: Dayjs;
  minPeople: number;
  shiftTime: number;
};

export type Person = {
  name: string;
  id: number;
  rest?: number;
};

export type PersonKeys = keyof Person;
export type StationKeys = keyof Station;

const Grid = (props: GridProps) => {
  const [stations, setStations] = createStore<Station[]>([
    {
      name: `Station 1h`,
      start: newDate(dayjs(), 6, 0),
      end: newDate(dayjs().add(1, "d"), 6, 0),
      minPeople: 2,
      shiftTime: 60,
    },
    {
      name: `Station 2h`,
      start: newDate(dayjs(), 6, 0),
      end: newDate(dayjs(), 18, 0),
      minPeople: 2,
      shiftTime: 120,
    },
    {
      name: `Station 90m`,
      start: newDate(dayjs(), 18, 0),
      end: newDate(dayjs().add(1, "d"), 6, 0),
      minPeople: 2,
      shiftTime: 90,
    },
  ]);
  const [people, setPeople] = createStore<Person[]>([
    ...Array.from({ length: 10 }, (_, i) => ({ name: `Person ${i}`, id: i })),
  ]);
  const [valid, setValid] = createSignal(false);
  const [days, setDays] = createSignal(1);
  const [headers, setHeaders] = createSignal<string[]>([]);
  const [rows, setRows] = createStore<Record<string, string>[]>([]);
  const [colDef, setColDef] = createStore<Record<string, string>[]>([]);

  createEffect(() => {
    setValid(stations.length > 0 && people.length > 0);
  });

  const addStation = () => {
    const newStation = {
      name: "Station 1",
      start: newDate(dayjs(), 6, 0),
      end: newDate(dayjs().add(1, "d"), 6, 0),
      minPeople: 2,
      shiftTime: 360,
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
    value: string | number | Dayjs,
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
        start: newDate(dayjs(), 6, 0),
        end: newDate(dayjs().add(1, "d"), 6, 0),
        minPeople: 2,
        shiftTime: 360,
      })),
    ]);
  };

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
      headers().join(dl) +
      "\n" +
      rows
        .map((r: Record<string, string>) => Object.values(r).join(dl))
        .join("\n")
    );
    //
  };

  const generate = () => {
    const { headers: _headers, rows: _rows } = csvToJson(
      getShifts({ stations: stations as InputStation[], people, days: days() }),
    );
    console.log({ _headers, _rows });
    setHeaders(_headers);
    setRows(_rows);
    setColDef(headers().map((field: string) => ({ field })));
  };

  createEffect(() => {
    generate();
  });

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
          days,
          setDays,
          generate,
        }}
      />
      <main class="p-5">
        <div class="ag-theme-alpine" style={{ height: "700px" }}>
          <AgGridSolid
            columnDefs={colDef}
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
