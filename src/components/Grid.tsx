import { createStore } from "solid-js/store";

import AgGridSolid from "ag-grid-solid";
import { getShifts } from "../logic";
import { csvToJson } from "../utils/utils";
import Navbar from "./Navbar";
import { createEffect, createSignal } from "solid-js";

type GridProps = {
  changeLang: () => void;
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
        }}
      />
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
    </>
  );
};

export default Grid;
