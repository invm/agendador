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
  // const [stations, setStations] = createSignal([]);

  const columnDefs = headers.map((field: string) => ({ field }));
  let gridRef;

  return (
    <>
      <Navbar changeLang={props.changeLang} />
      <div class="ag-theme-alpine" style={{ height: "700px" }}>
        <AgGridSolid
          columnDefs={columnDefs}
          rowData={rows}
          enableRtl={props.dir === "rtl"}
          ref={gridRef}
          enableCellTextSelection={true}
          defaultColDef={{
            minWidth: 100,
            maxWidth: 200,
            width: 110,
          }}
        />
      </div>
    </>
  );
};

export default Grid;

