import { Show, createSignal } from "solid-js";

import Grid from "./Grid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export default function App() {
  const [dir, setDir] = createSignal("ltr");

  const changeDir = () => {
    if (dir() === "rtl") {
      // add rtl to html
      document.documentElement.dir = "ltr";
      setDir("ltr");
    } else {
      // remove rtl from html
      document.documentElement.dir = "rtl";
      setDir("rtl");
    }
  };

  return (
    <div class="w-full h-full p-5">
      <div class="py-2">
        <button onClick={changeDir} class="btn btn-sm btn-primary">
          Change direction
        </button>
      </div>
      <Show when={dir()} keyed>
        {(dir) => <Grid dir={dir} />}
      </Show>
    </div>
  );
}
