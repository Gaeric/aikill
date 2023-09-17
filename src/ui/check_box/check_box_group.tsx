import classNames from "classnames";
import * as React from "react";
import { CheckBox, CheckBoxProps } from "./check_box";
import styles from "./check_box.module.css";

export type CheckBoxGroupProps = {
  options: Omit<CheckBoxProps, "onChecked">[];
  excludeSelection?: boolean;
  onChecked?(checkedIds: (string | number)[]): void;
  itemsPerLine?: 4 | 5 | 6;
  className?: string;
  head?: string | JSX.Element;
  disabled?: boolean;
};

export function CheckBoxGroup(props: CheckBoxGroupProps) {
  const [checkedIds, setCheckedIds] = React.useState(
    props.options.filter((o) => o.checked).map((o) => o.id)
  );
  let onCheck = (id: string | number) => (checked: boolean) => {
    if (props.excludeSelection) {
      if (checked) {
        setCheckedIds([id]);
        props.onChecked?.(checkedIds);
      }
    } else {
      if (checked) {
        setCheckedIds([...checkedIds, id]);
        props.onChecked?.(checkedIds);
      } else {
        setCheckedIds(checkedIds.filter((checkedId) => checkedId !== id));
        props.onChecked?.(checkedIds);
      }
    }
  };
  const { className, options, itemsPerLine = 4, head, disabled } = props;

  return (
    <div className={classNames(styles.checkboxGroup, className)}>
      {typeof head === "string" ? (
        <h3 className={styles.checkboxGroupHead}>{head}</h3>
      ) : (
        head
      )}
      {options.map((option, index) => (
        <CheckBox
          {...option}
          key={index}
          className={classNames({
            [styles.regularCheckBox]: itemsPerLine === 4,
            [styles.squashCheckBox]: itemsPerLine === 5,
            [styles.smashCheckBox]: itemsPerLine === 6,
          })}
          disabled={disabled || option.disabled}
          onChecked={onCheck(option.id)}
        />
      ))}
    </div>
  );
}
