import { t } from "../utils/i18n";

type ActionsProps = {
  getDataAsText: (type: "csv" | "spreadsheet") => string;
};

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const Actions = (props: ActionsProps) => {
  return (
    <div class="bg-base-300 mt-5 py-2 px-5">
      <div class="flex justify-between">
        <div>
          <span>
            {t('removing_person')}
          </span>
        </div>
        <div class="flex justify-end gap-4">
          <a
            href={
              "data:text/plain;charset=utf-8," +
              encodeURIComponent(props.getDataAsText("spreadsheet"))
            }
            download={new Date().toISOString() + ".tsv"}
            class="btn btn-success btn-sm"
          >
            {t("export")}
          </a>
          <button
            onClick={() => copy(props.getDataAsText("csv"))}
            class="btn btn-warning btn-sm"
          >
            {t("copy_as_csv")}
          </button>
          <button
            class="btn btn-info btn-sm"
            onClick={() => copy(props.getDataAsText("spreadsheet"))}
          >
            {t("copy_as_spreadsheet")}
          </button>
        </div>
      </div>
    </div>
  );
};
