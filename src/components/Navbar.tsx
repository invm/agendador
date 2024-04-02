import { Accessor, Show } from "solid-js";
import { t } from "../utils/i18n";
import ConfigModal, { ConfigModalProps } from "./ConfigModal";

type NavbarProps = ConfigModalProps & {
  changeLang: (lng: "he" | "en") => void;
  valid: Accessor<boolean>;
};

const Navbar = (props: NavbarProps) => {
  return (
    <>
      <ConfigModal {...props} />
      <div class="navbar bg-base-300">
        <div class="flex-1 px-2">
          <a class="text-lg font-bold text-info">{t("title")}</a>
          <Show when={props.valid()}>
            <div class="px-10">
              <a
                onClick={() => {
                  props.generate();
                }}
                class="btn btn-sm btn-info"
              >
                {t("generate")}
              </a>
            </div>
          </Show>
        </div>
        <div class="flex justify-end flex-1 px-2">
          <div class="flex items-stretch">
            <div class="dropdown dropdown-end">
              <a
                onClick={() =>
                  //@ts-ignore
                  document.getElementById("config_modal").showModal()
                }
                class="btn btn-ghost rounded-btn btn-sm hover:text-info"
              >
                {t("config")}
              </a>
              <div
                tabindex="0"
                role="button"
                class="btn btn-ghost rounded-btn btn-sm hover:text-info"
              >
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
