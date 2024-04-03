import { For, createEffect, createSignal } from "solid-js";
import { t } from "../utils/i18n";

type TimePickerProps = {
  onChange: (time: string) => void;
  value: string;
};

const getTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return { hours: parseInt(hours), minutes: parseInt(minutes) };
};

export const TimePicker = (props: TimePickerProps) => {
  const [hours, setHours] = createSignal(0);
  const [minutes, setMinutes] = createSignal(0);

  createEffect(() => {
    const h = getTime(props.value).hours;
    const m = getTime(props.value).minutes;
    const hour = h > 9 ? h : "0" + h;
    const minute = m > 9 ? m : "0" + m;
    props.onChange(`${hour}:${minute}`);
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
