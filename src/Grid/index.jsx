import AgGridSolid from "ag-grid-solid";
import { getShifts } from "../logic";
import { csvToJson } from "../utils";

const Grid = (props) => {
  const { headers, rows } = csvToJson(getShifts());

  const columnDefs = headers.map((field) => ({ field }));
  let gridRef;

  return (
    <div class="">
      <div class="py-2">
        <h3>Stations config</h3>
      </div>
      <div class="py-2">
        <h3>List of people</h3>
      </div>
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
    </div>
  );
};

export default Grid;
