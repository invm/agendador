import { Show, createEffect, createSignal } from "solid-js";
import Grid from "./components/Grid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import i18n, { changeLanguage } from "i18next";

export default function App() {
  const [dir, setDir] = createSignal("ltr");

  const changeLang = (lng) => {
    if (lng !== "he") {
      changeLanguage(lng);
      setDir("ltr");
    } else {
      changeLanguage("he");
      setDir("rtl");
    }
  };

  createEffect(() => {
    if (i18n.language == "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  });

  i18n.on("languageChanged", (lng) => {
    if (lng == "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  });

  return (
    <div class="w-full h-full p-5">
      <Show when={dir()} keyed>
        {(dir) => <Grid {...{ dir, changeLang }} />}
      </Show>
    </div>
  );
}
