import { For, createEffect, createSignal } from "solid-js";
import { t } from "../utils/i18n";
import dayjs, { Dayjs } from "dayjs";
import { newDate } from "../utils/utils";

type TimePickerProps = {
  onChange: (time: Dayjs) => void;
  value: Dayjs;
};

export const TimePicker = (props: TimePickerProps) => {
  const [hours, setHours] = createSignal(0);
  const [minutes, setMinutes] = createSignal(0);

  createEffect(() => {
    props.onChange(newDate(dayjs(), hours(), minutes()));
  });

  return (
    <div class="w-full">
      <div class="flex">
        <label class="form-control w-[50px]">
          <select
            name="hours"
            class="input input-bordered input-sm w-full text-center"
            onChange={(e) => setHours(parseInt(e.target.value))}
          >
            <For each={[...Array(24).keys()]}>
              {(_, index) => (
                <option selected={hours() === index()} value={index()}>
                  {index() < 10 ? `0${index()}` : index()}
                </option>
              )}
            </For>
          </select>
          <div class="label">
            <span class="label-text-alt">{t("hours")}</span>
          </div>
        </label>
        <span class="mx-2">:</span>
        <label class="form-control w-[50px]">
          <select
            name="minutes"
            class="input input-bordered input-sm w-full text-center"
            onChange={(e) => setMinutes(parseInt(e.target.value))}
          >
            <For each={[...Array(4).keys()]}>
              {(_, index) => (
                <option
                  selected={minutes() === index() * 15}
                  value={index() * 15}
                >
                  {!index() ? "00" : index() * 15}
                </option>
              )}
            </For>
          </select>

          <div class="label">
            <span class="label-text-alt">{t("minutes")}</span>
          </div>
        </label>
      </div>
    </div>
  );
};
