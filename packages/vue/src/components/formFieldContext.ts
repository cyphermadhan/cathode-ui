import type { InjectionKey } from 'vue';

/**
 * FormField provides these ids so Cathode inputs (TextField, TextArea,
 * Select, Checkbox, RadioGroup, Toggle, …) wire up aria-labelledby and
 * aria-describedby automatically when nested inside a FormField.
 *
 * Lives in its own module because Vue's `<script setup>` disallows
 * `export` statements — the injection key has to be declared in a
 * plain TS module and re-imported by every SFC that reads/provides it.
 */
export interface FormFieldContext {
  labelledBy: string;
  describedBy: string | undefined;
}

export const FORM_FIELD_KEY = Symbol('cathode.formField') as InjectionKey<FormFieldContext>;
