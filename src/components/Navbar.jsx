import { t } from "../utils/i18n";
import PeopleModal from "./PeopleModal";
import StationsModal from "./StationsModal";

const Navbar = (props) => {
  return (
    <>
      <StationsModal />
      <PeopleModal />
      <div class="navbar bg-base-300 rounded-box mb-4">
        <div class="flex-1 px-2 ">
          <a class="text-lg font-bold">{t("title")}</a>
        </div>
        <div class="flex justify-end flex-1 px-2">
          <div class="flex items-stretch">
            <div class="dropdown dropdown-end">
              <a
                onClick={() =>
                  document.getElementById("stations_modal").showModal()
                }
                class="btn btn-ghost rounded-btn"
              >
                {t("stations")}
              </a>
              <a
                onClick={() =>
                  document.getElementById("people_modal").showModal()
                }
                class="btn btn-ghost rounded-btn"
              >
                {t("people")}
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
