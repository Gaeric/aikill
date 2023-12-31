import { getClientConfig } from "src/client.config";
import { Sanguosha } from "src/core/game/engine";
import { createLogger } from "src/core/shares/libs/logger/create";
import { Flavor } from "src/core/shares/types/host_config";
import { Languages } from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { getElectronLoader } from "src/electron_loader/electron_loader_util";
import { English, SimplifiedChinese, TraditionalChinese } from "./languages";
import { ClientFlavor } from "src/props/config_props";
import { createRoot } from "react-dom/client";
import App from "./app";
import { emojiLoader } from "./emoji_loader/emoji_loader";
import * as serviceWorker from "./serviceWorker";
import "./index.css";
import { MemoryRouter } from "react-router-dom";
const mode =
  (import.meta.env.REACT_APP_DEV_MODE as ClientFlavor) || ClientFlavor.Dev;
const config = getClientConfig(mode);
const logger = createLogger(
  mode === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod
);

if (config.flavor !== ClientFlavor.Web) {
  import("./index.module.css");
}

let translator: ClientTranslationModule;
let electronLoader: ElectronLoader;

async function onDeviceReady() {
  const loader = await getElectronLoader(config.flavor);
  electronLoader = loader;
  translator = ClientTranslationModule.setup(
    electronLoader.getData(ElectronData.Language),
    [Languages.EN_US, English],
    [Languages.ZH_CN, SimplifiedChinese],
    [Languages.ZH_HK, TraditionalChinese],
    [Languages.ZH_TW, TraditionalChinese]
  );
  emojiLoader(translator);
  Sanguosha.initialize();
  createRoot(document.getElementById("root")).render(
    <MemoryRouter>
      <App
        config={config}
        electronLoader={electronLoader}
        translator={translator}
        logger={logger}
      />
    </MemoryRouter>
  );
}

if (mode === ClientFlavor.Mobile) {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  onDeviceReady();
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
