import { For } from "solid-js";
import { t } from "../utils/i18n";
import { TimePicker } from "./TimePicker";
import { Person, PersonKeys } from "./Grid";

type PeopleModalProps = {
  people: Person[];
  addPerson: () => void;
  removePerson: (i: number) => void;
  onChangePerson: (
    index: number,
    key: PersonKeys,
    value: string | number,
  ) => void;
};

const PeopleModal = (props: PeopleModalProps) => {
  return (
    <dialog id="people_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-py-4 bold text-lg">{t("people")}</h3>
        <div class="py-4">
          <button
            onClick={() => props.addPerson()}
            class="btn btn-primary btn-sm"
          >
            {t("add_person")}
          </button>
        </div>
        <div>
          <For each={props.people}>
            {(person, i) => (
              <div class="mb-2">
                <label class="input input-bordered input-lg flex items-center gap-2">
                  #{i() + 1} {t("name")}
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => {
                      props.onChangePerson(i(), "name", e.target.value);
                    }}
                    class="grow"
                  />
                  <div class="pl-2">
                    <button
                      onClick={() => props.removePerson(i())}
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
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </label>
              </div>
            )}
          </For>
          <div class="py-4 flex justify-end">
            <button
              onClick={() => {
                //@ts-ignore
                document.getElementById("people_modal").close();
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

export default PeopleModal;
