function text(value: any): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function ImageBlock({ src, alt }: { src?: string; alt?: string }) {
  if (!src || !/^https:\/\//i.test(src)) return null;
  return <img className="site-preview-image" src={src} alt={alt || 'Business image'} loading="lazy" />;
}

export default function SitePreview({ spec }: { spec: any }) {
  if (!spec || !Array.isArray(spec.pages)) return <div className="site-preview-empty">A website preview will appear when GOLU returns a valid website plan.</div>;
  const design = spec.design || {};
  const assets = Array.isArray(spec.assets) ? spec.assets : [];
  const logo = assets.find((asset: any) => /logo/i.test(text(asset.placement)));
  return <div className="site-preview" style={{ ['--preview-accent' as any]: text(design.colors?.[0]) || '#245fe3' }}>
    <header className="site-preview-nav">
      <div className="site-preview-brand">{logo ? <ImageBlock src={logo.url} alt={logo.alt || logo.name || 'Logo'} /> : text(spec.siteName) || 'Your business'}</div>
      <nav>{(spec.navigation || spec.pages.map((page: any) => page.name)).slice(0, 6).map((item: any, i: number) => <span key={i}>{text(item.label || item.name || item)}</span>)}</nav>
    </header>
    {spec.pages.map((page: any, pageIndex: number) => <section className="site-preview-page" key={page.slug || pageIndex}>
      {pageIndex > 0 && <h2 className="site-preview-page-title">{text(page.name)}</h2>}
      {(page.sections || []).map((section: any, sectionIndex: number) => {
        const type = text(section.type).toLowerCase();
        const items = Array.isArray(section.items) ? section.items : [];
        const imageAsset = assets.find((asset: any) => text(asset.url) === text(section.imageUrl));
        return <article className={`site-preview-section site-preview-${type}`} key={section.id || sectionIndex}>
          {type === 'hero' ? <div className="site-preview-hero-grid"><div><p className="site-preview-eyebrow">{text(section.eyebrow)}</p><h1>{text(section.heading || spec.tagline || spec.siteName)}</h1><p>{text(section.body)}</p>{section.buttonText && <span className="site-preview-button">{text(section.buttonText)}</span>}</div><div><ImageBlock src={section.imageUrl || assets.find((a: any) => /hero/i.test(text(a.placement)))?.url} alt={section.imageAlt || imageAsset?.name} /></div></div> : <>
            {section.heading && <h2>{text(section.heading)}</h2>}
            {section.body && <p>{text(section.body)}</p>}
            {section.imageUrl && <ImageBlock src={section.imageUrl} alt={section.imageAlt || section.heading} />}
            {items.length > 0 && <div className="site-preview-cards">{items.map((item: any, i: number) => <div className="site-preview-card" key={i}>{typeof item === 'string' ? <p>{item}</p> : <><ImageBlock src={item.imageUrl || item.image || assets.find((a: any) => text(a.name) === text(item.imageName))?.url} alt={item.imageAlt || item.title || item.name} /><h3>{text(item.title || item.name || item.heading)}</h3><p>{text(item.description || item.body || item.text)}</p>{item.price && <strong>{text(item.price)}</strong>}</>}</div>)}</div>}
            {type === 'faq' && <div className="site-preview-faq">{items.map((item: any, i: number) => <details key={i}><summary>{text(item.question || item.title)}</summary><p>{text(item.answer || item.body)}</p></details>)}</div>}
            {section.buttonText && <span className="site-preview-button">{text(section.buttonText)}</span>}
          </>}
        </article>;
      })}
    </section>)}
    <footer className="site-preview-footer">{text(spec.siteName)} {text(spec.businessData?.phone) && ` · ${text(spec.businessData.phone)}`}</footer>
  </div>;
}
