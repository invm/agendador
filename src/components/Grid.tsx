import { createStore } from "solid-js/store";

import AgGridSolid from "ag-grid-solid";
import { getShifts } from "../logic";
import { csvToJson } from "../utils/utils";
import Navbar from "./Navbar";

type GridProps = {
  changeLang: () => void;
  dir: string;
};

const Grid = (props: GridProps) => {
  const { headers, rows } = csvToJson(getShifts());
  const [stations, setStations] = createStore([]);

  const addStation = () => {
    console.log("add station");
    const newStation = {
      name: "Station 1",
      start: 6,
      end: 6,
      minPeople: 2,
      shiftTime: 6,
      shiftInterval: "h",
    };
    setStations([...stations, newStation]);
  };

  const onChangeStation = (index, key, value) => {
    setStations(index, key, value);
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
        {...{ stations, addStation, onChangeStation }}
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

