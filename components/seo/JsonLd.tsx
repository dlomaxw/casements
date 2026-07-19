// Renders a JSON-LD structured-data block.
// Kept as a plain script tag so it is present in the server-rendered HTML.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema payloads are built server-side from our own data, never user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
