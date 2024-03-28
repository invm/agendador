import { For } from "solid-js";
import { t } from "../utils/i18n";
import { TimePicker } from "./TimePicker";
import { Station, StationKeys } from "./Grid";

type StationsModalProps = {
  stations: Station[];
  addStation: () => void;
  removeStation: (i: number) => void;
  onChangeStation: (
    index: number,
    key: StationKeys,
    value: string | number,
  ) => void;
};

const StationsModal = (props: StationsModalProps) => {
  return (
    <dialog id="stations_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-py-4 bold text-lg">{t("stations")}</h3>
        <div class="py-4">
          <button
            onClick={() => props.addStation()}
            class="btn btn-primary btn-sm"
          >
            {t("add_station")}
          </button>
        </div>
        <div>
          <For each={props.stations}>
            {(station, i) => (
              <div class="flex items-center">
                <div class="collapse mb-2 collapse-arrow bg-base-200">
                  <input type="radio" name="my-accordion-2" />
                  <div class="collapse-title text-xl font-medium">
                    <span>{station.name}</span>
                  </div>
                  <div class="collapse-content">
                    <label class="form-control w-full max-w-xs">
                      <div class="label">
                        <span class="label-text">{t("station_name")}</span>
                      </div>
                      <input
                        type="text"
                        value={station.name}
                        onChange={(e) => {
                          props.onChangeStation(i(), "name", e.target.value);
                        }}
                        class="input input-bordered input-sm w-full max-w-xs"
                      />
                    </label>
                    <div class="flex gap-4">
                      <label class="form-control w-full max-w-xs">
                        <div class="label">
                          <span class="label-text">{t("required_people")}</span>
                        </div>
                        <input
                          type="number"
                          value={station.minPeople}
                          min={1}
                          max={100}
                          onChange={(e) => {
                            props.onChangeStation(
                              i(),
                              "minPeople",
                              +e.target.value,
                            );
                          }}
                          class="input input-bordered input-sm w-full max-w-xs"
                        />
                      </label>
                      <label class="form-control w-full max-w-xs">
                        <div class="label">
                          <span class="label-text">{t("shift_time")}</span>
                        </div>
                        <input
                          type="number"
                          value={station.shiftTime}
                          min={15}
                          max={1440}
                          onChange={(e) => {
                            props.onChangeStation(
                              i(),
                              "shiftTime",
                              +e.target.value,
                            );
                          }}
                          class="input input-bordered input-sm w-full max-w-xs"
                        />
                      </label>
                    </div>
                    <div class="flex">
                      <label class="form-control w-full max-w-xs">
                        <div class="label">
                          <span class="label-text">{t("start_time")}</span>
                        </div>
                        <TimePicker
                          value={station.start}
                          onChange={(e: string) => {
                            props.onChangeStation(i(), "start", e);
                          }}
                        />
                      </label>
                      <label class="form-control w-full max-w-xs">
                        <div class="label">
                          <span class="label-text">{t("end_time")}</span>
                        </div>
                        <TimePicker
                          value={station.end}
                          onChange={(e: string) => {
                            props.onChangeStation(i(), "end", e);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div class="pl-2">
                  <button
                    onClick={() => props.removeStation(i())}
                    class="btn btn-xs btn-ghost btn-square"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-x"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </For>
          <div class="py-4 flex justify-end">
            <button
              onClick={() => {
                //@ts-ignore
                document.getElementById("stations_modal").close();
              }}
              class="btn btn-primary btn-sm"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default StationsModal;
