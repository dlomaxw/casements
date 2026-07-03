// Material Symbols Outlined icon (font-based, loaded in globals.css)
export default function Icon({
  name,
  className = '',
  filled = false,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
