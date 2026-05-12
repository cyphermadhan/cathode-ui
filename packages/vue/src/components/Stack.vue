<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/**
 * Stack — utility flex wrapper. No visual chrome; just a container
 * with direction + gap + alignment. Mirrors @cathode-ui/react's
 * Stack API (same prop names, same defaults).
 *
 * Prefer this over inline `:style="{ display: 'flex', gap: ... }"`
 * littering templates. For multi-column layouts where children are
 * independent units, use CSS Grid directly.
 */
interface Props {
  /** Main-axis direction. Default "column". */
  direction?: 'row' | 'column';
  /** Gap between children — number (px) or CSS length ("8px", "1rem"). */
  gap?: number | string;
  /** `align-items`. */
  align?: CSSProperties['alignItems'];
  /** `justify-content`. */
  justify?: CSSProperties['justifyContent'];
  /** Wrap onto multiple lines when direction is row. */
  wrap?: boolean;
  /** Render as `inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Fill the parent's cross-axis (useful in grid cells). */
  fullWidth?: boolean;
  /** HTML tag to render. Default `div`. */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav' | 'aside';
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'column',
  wrap: false,
  inline: false,
  fullWidth: false,
  as: 'div',
});

const composedStyle = computed<CSSProperties>(() => ({
  display: props.inline ? 'inline-flex' : 'flex',
  flexDirection: props.direction,
  gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
  alignItems: props.align,
  justifyContent: props.justify,
  flexWrap: props.wrap ? 'wrap' : undefined,
  width: props.fullWidth ? '100%' : undefined,
}));
</script>

<template>
  <component :is="props.as" class="cathode-stack" :style="composedStyle">
    <slot />
  </component>
</template>
