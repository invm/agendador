import { For } from "solid-js";
import { t } from "../utils/i18n";

const StationsModal = (props) => {
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
              <div class="collapse mb-2 collapse-arrow bg-base-200">
                <input type="radio" name="my-accordion-2" />
                <div class="collapse-title text-xl font-medium">
                  {station.name}
                </div>
                <div class="collapse-content">
                  <label class="form-control w-full max-w-xs">
                    <div class="label">
                      <span class="label-text">Station name</span>
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
                  <label class="form-control w-full max-w-xs">
                    <div class="label">
                      <span class="label-text">Required people</span>
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
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default StationsModal;
