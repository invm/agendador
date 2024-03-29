import { Accessor, Show } from "solid-js";
import { t } from "../utils/i18n";
import { Person, PersonKeys, Station, StationKeys } from "./Grid";
import PeopleModal from "./PeopleModal";
import StationsModal from "./StationsModal";

type NavbarProps = {
  stations: Station[];
  addStation: () => void;
  removeStation: (i: number) => void;
  onChangeStation: (
    index: number,
    key: StationKeys,
    value: string | number,
  ) => void;
  changeLang: (lang: string) => void;
  valid: Accessor<boolean>;
  people: Person[];
  addPerson: () => void;
  removePerson: (i: number) => void;
  onChangePerson: (
    index: number,
    key: PersonKeys,
    value: string | number,
  ) => void;
  insertDemoData: () => void;
};

const Navbar = (props: NavbarProps) => {
  return (
    <>
      <StationsModal
        stations={props.stations}
        addStation={props.addStation}
        removeStation={props.removeStation}
        onChangeStation={props.onChangeStation}
      />
      <PeopleModal
        people={props.people}
        addPerson={props.addPerson}
        removePerson={props.removePerson}
        onChangePerson={props.onChangePerson}
      />
      <div class="navbar bg-base-300 rounded-box mb-4">
        <div class="flex-1 px-2">
          <a class="text-lg font-bold">{t("title")}</a>
          <Show when={props.valid()}>
            <div class="px-10">
              <a class="btn btn-sm btn-primary">{t("generate")}</a>
            </div>
          </Show>
        </div>
        <div class="flex justify-end flex-1 px-2">
          <div class="flex items-stretch">
            <div class="dropdown dropdown-end">
              <a
                onClick={() => props.insertDemoData()}
                class="btn btn-ghost rounded-btn"
              >
                {t("demo")}
              </a>
              <a
                onClick={() =>
                  //@ts-ignore
                  document.getElementById("stations_modal").showModal()
                }
                class="btn btn-ghost rounded-btn"
              >
                {t("stations")} {props.stations.length || ''}
              </a>
              <a
                onClick={() =>
                  //@ts-ignore
                  document.getElementById("people_modal").showModal()
                }
                class="btn btn-ghost rounded-btn"
              >
                {t("people")} {props.people.length || ''}
              </a>
              <div tabindex="0" role="button" class="btn btn-ghost rounded-btn">
                {t("language")}
              </div>
              <ul
                tabindex="0"
                class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4"
              >
                <li>
                  <a onClick={() => props.changeLang("en")}>EN</a>
                </li>
                <li>
                  <a onClick={() => props.changeLang("he")}>HE</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
