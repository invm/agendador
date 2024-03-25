import { t } from "../utils/i18n";

const StationsModal = () => {
  return (
    <dialog id="stations_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{t('stations')}</h3>
        <p class="py-4">{t("add_station")}</p>
        <div>
          <div class="collapse mb-2 collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2"/>
            <div class="collapse-title text-xl font-medium">
              Click to open this one and close others
            </div>
            <div class="collapse-content">
              <p>hello</p>
            </div>
          </div>
          <div class="collapse mb-2 collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" />
            <div class="collapse-title text-xl font-medium">
              Click to open this one and close others
            </div>
            <div class="collapse-content">
              <p>hello</p>
            </div>
          </div>
          <div class="collapse mb-2 collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" />
            <div class="collapse-title text-xl font-medium">
              Click to open this one and close others
            </div>
            <div class="collapse-content">
              <p>hello</p>
            </div>
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
