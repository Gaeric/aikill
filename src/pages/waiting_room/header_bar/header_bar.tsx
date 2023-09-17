import { AudioLoader } from "audio_loader/audio_loader";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { Banner } from "src/pages/room/ui/banner/banner";
import { SettingsDialog } from "src/pages/ui/settings/settings";
import { ServerHostTag } from "src/props/config_props";
import * as React from "react";
import { ConnectionService } from "src/services/connection_service/connection_service";
import { AudioService } from "src/ui/audio/install";
import styles from "./header_bar.module.css";

export type HeaderBarProps = {
  electronLoader: ElectronLoader;
  audioLoader: AudioLoader;
  imageLoader: ImageLoader;
  isCampaignMode: boolean;
  translator: ClientTranslationModule;
  audioService: AudioService;
  roomName: string;
  roomId?: number | string;
  defaultPing?: number;
  host?: ServerHostTag;
  variant?: "room" | "waitingRoom";
  getConnectionService(campaignMode: boolean): ConnectionService;
};

export function HeaderBar(props: HeaderBarProps) {
  const [openSettings, setOpenSettings] = React.useState(false);

  const [defaultMainVolume, setDefaultMainVolume] = React.useState(
    props.electronLoader.getData(ElectronData.MainVolume)
      ? Number.parseInt(
          props.electronLoader.getData(ElectronData.MainVolume),
          10
        )
      : 50
  );

  const [defaultGameVolume, setDefaultGameVolume] = React.useState(
    props.electronLoader.getData(ElectronData.GameVolume)
      ? Number.parseInt(
          props.electronLoader.getData(ElectronData.GameVolume),
          10
        )
      : 50
  );

  let onClickSettings = () => {
    setOpenSettings(true);
  };
  let onCloseSettings = () => {
    setOpenSettings(false);
  };

  let settings = {
    onVolumeChange: (volume: number) => {
      props.electronLoader.setData(ElectronData.GameVolume, volume.toString());
      setDefaultGameVolume(volume);
      props.audioService.changeGameVolume();
    },
    onMainVolumeChange: (volume: number) => {
      props.electronLoader.setData(ElectronData.MainVolume, volume.toString());
      setDefaultMainVolume(volume);
      props.audioService.changeBGMVolume();
    },
  };

  return (
    <>
      <Banner
        variant={props.variant}
        translator={props.translator}
        roomName={props.roomName}
        defaultPing={props.defaultPing}
        className={styles.roomBanner}
        connectionService={props.getConnectionService(props.isCampaignMode)}
        onClickSettings={onClickSettings}
        host={props.host}
      />

      {openSettings && (
        <SettingsDialog
          defaultGameVolume={defaultGameVolume}
          defaultMainVolume={defaultMainVolume}
          imageLoader={props.imageLoader}
          translator={props.translator}
          onMainVolumeChange={settings.onMainVolumeChange}
          onGameVolumeChange={settings.onVolumeChange}
          onConfirm={onCloseSettings}
          electronLoader={props.electronLoader}
        />
      )}
    </>
  );
}
