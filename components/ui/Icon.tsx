/**
 * Small inline-SVG icon set used by the editable sections.
 *
 * Every icon is stroke-based and inherits `currentColor`, so it always
 * picks up the surrounding brand colour instead of shipping its own.
 * The client picks one from a dropdown in Sanity Studio (the values in
 * ICON_OPTIONS below are what the schema offers), or ignores it entirely
 * and uploads their own image instead — see `IconBubble`.
 *
 * Adding an icon: add a case here AND an entry in ICON_OPTIONS. The two
 * lists are deliberately kept side by side so they can't drift apart.
 */

export { ICON_OPTIONS } from "@/lib/icons";

export type IconName = string;

export function Icon({
  name = "activity",
  size = 22,
  className = "",
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "search":
      return (
        <svg {...p}>
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="m20.5 20.5-5-5" />
          <path d="M8 12.5v-2M10.8 12.5v-4M13.6 12.5v-6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 20V4" />
          <path d="M4 20h16" />
          <path d="M8.5 20v-6M13 20V9M17.5 20v-9" />
        </svg>
      );
    case "trendingUp":
      return (
        <svg {...p}>
          <path d="m3 16 5.5-5.5 3.5 3.5L21 5" />
          <path d="M15.5 5H21v5.5" />
        </svg>
      );
    case "trendingDown":
      return (
        <svg {...p}>
          <path d="m3 8 5.5 5.5 3.5-3.5L21 19" />
          <path d="M15.5 19H21v-5.5" />
        </svg>
      );
    case "cart":
      return (
        <svg {...p}>
          <path d="M2.5 3.5h2.2l2.3 11h11" />
          <path d="M6.4 6.5h15l-1.6 6.4H7.6" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="17.5" cy="19" r="1.5" />
        </svg>
      );
    case "dollar":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.8 9.3A2.7 2.7 0 0 0 12 8c-1.5 0-2.7.8-2.7 2s1 1.7 2.7 2.1 2.8 1 2.8 2.2-1.2 2-2.8 2a2.8 2.8 0 0 1-2.8-1.4" />
          <path d="M12 6.2v11.6" />
        </svg>
      );
    case "blocks":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="14.5" y="3" width="6.5" height="6.5" rx="1.5" />
          <rect x="3" y="14.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case "target":
      return (
        <svg {...p}>
          <circle cx="11" cy="13" r="8" />
          <circle cx="11" cy="13" r="3.4" />
          <path d="M13.4 10.6 21 3" />
          <path d="M17.4 3h3.4v3.4" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.4" />
          <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
          <path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.4" />
          <path d="M17.8 14.4A6.2 6.2 0 0 1 21.2 20" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...p}>
          <path d="M12 2.8c3.2 2.2 5 5.7 5 9.4l-2.6 2.6H9.6L7 12.2c0-3.7 1.8-7.2 5-9.4Z" />
          <circle cx="12" cy="10" r="1.8" />
          <path d="M9.6 14.8 7.4 21l4-2.2M14.4 14.8l2.2 6.2-4-2.2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 2.8 4.5 6v6c0 4.4 3.1 7.9 7.5 9.2 4.4-1.3 7.5-4.8 7.5-9.2V6Z" />
          <path d="m8.8 12.2 2.3 2.3 4.1-4.4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6.8V12l3.4 2" />
        </svg>
      );
    case "layers":
      return (
        <svg {...p}>
          <path d="m12 3 8.5 4.4L12 11.8 3.5 7.4Z" />
          <path d="m3.5 12 8.5 4.4 8.5-4.4" />
          <path d="m3.5 16.6 8.5 4.4 8.5-4.4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...p}>
          <path d="M12 3.6 21.2 20H2.8Z" />
          <path d="M12 9.6v4.2" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.2 12.3 2.6 2.6 5-5.4" />
        </svg>
      );
    case "spark":
      return (
        <svg {...p}>
          <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6l-1.9-5.8L4.3 10.9 10.1 9Z" />
          <path d="M18.6 16.4l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6Z" />
        </svg>
      );
    case "bulb":
      return (
        <svg {...p}>
          <path d="M9.2 16.5a6 6 0 1 1 5.6 0" />
          <path d="M9.5 19h5M10.2 21.5h3.6" />
          <path d="M9.2 16.5h5.6" />
        </svg>
      );
    case "tag":
      return (
        <svg {...p}>
          <path d="M3.5 11.6V4h7.6l9 9-7.6 7.6Z" />
          <circle cx="8" cy="8" r="1.4" />
        </svg>
      );
    case "globe":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.2 12h17.6" />
          <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M2.8 12.6h4l2.2-5.4 3.4 9.6 2.4-6 1.6 3.4h4.8" />
        </svg>
      );
  }
}

/**
 * The soft round icon chip used on cards. Prefers a client-uploaded image
 * when one exists, otherwise falls back to the picked icon from the set
 * above — so the client can go either way per card without us branching
 * at every call site.
 */
export function IconBubble({
  icon,
  image,
  alt = "",
  size = "md",
}: {
  icon?: string;
  image?: string;
  alt?: string;
  /** "cardResponsive" shrinks on phones and grows from the sm breakpoint. */
  size?: "sm" | "md" | "lg" | "cardResponsive";
}) {
  const box =
    size === "lg"
      ? "h-16 w-16"
      : size === "sm"
        ? "h-10 w-10"
        : size === "cardResponsive"
          ? "h-11 w-11 sm:h-[54px] sm:w-[54px]"
          : "h-[54px] w-[54px]";
  const glyph = size === "lg" ? 28 : size === "sm" ? 18 : 22;

  return (
    <span
      className={`flex ${box} flex-none items-center justify-center rounded-full bg-ember/10 text-ember`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          className="h-1/2 w-1/2 object-contain"
        />
      ) : (
        <Icon name={icon} size={glyph} />
      )}
    </span>
  );
}
