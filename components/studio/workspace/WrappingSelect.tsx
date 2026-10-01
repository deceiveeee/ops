"use client";

import type { ComponentPropsWithoutRef, Ref } from "react";
import styles from "./wrapping-select.module.css";

/**
 * Keep native selection and keyboard behavior while letting the visible value wrap.
 *
 * A native select truncates a long option on a phone. The real select stays on
 * top, transparent, so pointer, keyboard and screen readers use it as usual;
 * the visible text beneath it wraps to as many lines as it needs.
 */
export default function WrappingSelect({ label, valueLabel, selectRef, className, fieldClassName, valueClassName, labelClassName, children, ...props }: ComponentPropsWithoutRef<"select"> & {
  label: string;
  valueLabel: string;
  selectRef?: Ref<HTMLSelectElement>;
  fieldClassName?: string;
  valueClassName?: string;
  /** For a label the visible value already carries, such as "First: …", hidden visually but still the control's name. */
  labelClassName?: string;
}) {
  return <label className={className}>{labelClassName ? <span className={labelClassName}>{label}</span> : label}<span className={`${styles.field} ${fieldClassName ?? ""}`}>
    <select {...props} ref={selectRef} aria-label={label} className={styles.control}>{children}</select>
    <span className={`${styles.value} ${valueClassName ?? ""}`} aria-hidden="true"><span>{valueLabel}</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" /></svg></span>
  </span></label>;
}
