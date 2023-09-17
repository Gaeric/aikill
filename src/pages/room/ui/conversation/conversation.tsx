import { OptionPromptProps } from "src/core/event/event.server";
import {
  PatchedTranslationObject,
  TranslationPack,
} from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import * as React from "react";
import { Button } from "src/ui/button/button";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./conversation.module.css";

export type ConversationProps = {
  translator: ClientTranslationModule;
  conversation: string | PatchedTranslationObject;
  optionsActionHanlder?: {
    [option: string]: () => void;
  };
  optionPrompt?: OptionPromptProps[];
};

export function Conversation(props: ConversationProps) {
  const [onTooltipOpened, setOnTooltipOpened] = React.useState<
    string | undefined
  >();

  function onOpenTooltip(option: string) {
    setOnTooltipOpened(option);
  }

  function onCloseTooltip() {
    setOnTooltipOpened(undefined);
  }

  function getActions() {
    const { optionsActionHanlder = {}, translator, optionPrompt } = props;

    return Object.entries(optionsActionHanlder).map(
      ([option, action], index) => {
        const prompt =
          optionPrompt && optionPrompt.find((pro) => pro.option === option);
        const optionText =
          prompt && prompt.optionDetail ? prompt.optionDetail : option;

        return prompt && prompt.sideTip ? (
          <>
            <Button
              variant="option"
              key={index}
              className={styles.actionButton}
              onClick={action}
              onMouseEnter={() => onOpenTooltip(option)}
              onMouseLeave={() => onCloseTooltip()}
            >
              {onTooltipOpened === option && (
                <Tooltip position={["top"]} className={styles.tooltip}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: translator.tr(prompt.sideTip),
                    }}
                  />
                </Tooltip>
              )}
              {translator.trx(optionText)}
            </Button>
          </>
        ) : (
          <Button
            variant="option"
            key={index}
            className={styles.actionButton}
            onClick={action}
          >
            {translator.trx(optionText)}
          </Button>
        );
      }
    );
  }

  const { translator, conversation } = props;
  return (
    <div className={styles.conversation}>
      <h3 className={styles.conversationText}>
        {translator.trx(
          typeof conversation === "string"
            ? conversation
            : TranslationPack.create(conversation).toString()
        )}
      </h3>
      <div className={styles.actions}>{getActions()}</div>
    </div>
  );
}
