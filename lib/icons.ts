/**
 * The icon choices offered to the client in Sanity Studio.
 *
 * Kept as plain data (no JSX) so the Studio schema can import it without
 * pulling a React component into the schema bundle. The actual SVG paths
 * live in components/ui/Icon.tsx — every `value` below must have a
 * matching case there, or it falls back to the default pulse glyph.
 */
export const ICON_OPTIONS: { title: string; value: string }[] = [
  { title: "Pulse / diagnosis", value: "activity" },
  { title: "Magnifier / research", value: "search" },
  { title: "Bar chart", value: "chart" },
  { title: "Trending up", value: "trendingUp" },
  { title: "Trending down", value: "trendingDown" },
  { title: "Shopping cart", value: "cart" },
  { title: "Dollar", value: "dollar" },
  { title: "Fragmented blocks", value: "blocks" },
  { title: "Target", value: "target" },
  { title: "People", value: "users" },
  { title: "Rocket", value: "rocket" },
  { title: "Shield", value: "shield" },
  { title: "Clock", value: "clock" },
  { title: "Layers", value: "layers" },
  { title: "Warning", value: "alert" },
  { title: "Checkmark", value: "check" },
  { title: "Spark", value: "spark" },
  { title: "Lightbulb", value: "bulb" },
  { title: "Tag", value: "tag" },
  { title: "Globe", value: "globe" },
];
