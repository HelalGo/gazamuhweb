// Yapılandırılmış veri (schema.org) etiketi. "<" kaçırılır; içerik sayfa koduna karışamaz.
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
