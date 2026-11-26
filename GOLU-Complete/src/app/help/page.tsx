import Link from 'next/link';

const topics = [
  { title: '1. Create your GOLU account', body: 'Select Sign in with Google from the homepage. The first time you sign in, complete your profile with your name, business name and phone number. Your dashboard is where you manage your websites.' },
  { title: '2. Start a new website', body: 'Choose Create a website and tell GOLU about your business. Add your business category, location, audience, products or services, contact details, preferred style, colours and the pages you need. Give specific answers; the more useful context you provide, the more relevant the first draft will be.' },
  { title: '3. Upload and assign your images', body: 'Upload your logo, product photos, banners, team photos or other business images. For each file, enter a clear name, optionally group it into a collection such as Shoes, Watches, New Arrivals or Projects, describe what it shows and choose where it should appear, such as Homepage hero, Website logo, Product card or About / team section. Add extra instructions if an image must not be cropped or should be used in a particular way. GOLU passes these image URLs and placement instructions to Kimi when creating or editing the website.' },
  { title: '4. Understand design reference images', body: 'Design reference images are optional examples of the visual style you like. They are not the actual business images for your website. Use the separate design-reference field for inspiration, and use the business-image uploader for images that should appear on the finished website. GOLU should create an original design rather than copy a reference.' },
  { title: '5. Generate your website', body: 'Review your business details and image placements, then select Generate my website. GOLU sends the business brief and assigned image information to Kimi to create the website plan. If an image is assigned to the wrong section, you can correct it in a follow-up chat instruction.' },
  { title: '6. Edit with the GOLU chat', body: 'Open a website project and describe the change you want in everyday language. Be precise: for example, “Move the blue product photo to the first product card” or “Use the uploaded logo in the header and keep its proportions.” Successful AI change requests use your plan’s monthly change credits.' },
  { title: '7. Preview and publish', body: 'Review the generated website carefully on desktop and mobile sizes before publishing. Check every image, link, contact detail and page. Publishing depends on the managed hosting integration being configured for your account; GOLU must confirm a successful deployment before a site is described as live.' },
  { title: '8. Plans and monthly credits', body: 'GOLU has paid Basic and Pro plans; there is no free plan. Basic includes up to 3 design-reference images per generation and 10 monthly AI change credits. Pro includes up to 6 design-reference images and expanded allowances, plus planned advanced SEO tools. Monthly credits expire at the end of the billing cycle and do not roll over. Your dashboard shows the allowances currently assigned to your account.' },
  { title: '9. Account and billing help', body: 'Use the account menu to sign out. If your plan, payment or allowance looks incorrect, contact GOLU support with the email address on your account, your business name and a short description of the issue. Do not send passwords or API keys in a support message.' }
];

export default function HelpPage() {
  return <main className="shell help-shell">
    <header className="top"><Link href="/" className="brand">GOLU<span>.</span></Link><Link href="/" className="btn secondary">← Back to GOLU</Link></header>
    <section className="hero help-hero"><span className="pill">GOLU HELP CENTRE</span><h1>Learn how to use GOLU.</h1><p className="muted">A simple guide to creating, personalising and managing your business website.</p></section>
    <div className="help-layout">
      <aside className="panel help-aside"><strong>Quick start</strong><ol><li>Create your account</li><li>Describe your business</li><li>Upload and assign images</li><li>Generate your website</li><li>Edit with chat</li><li>Review and publish</li></ol><p className="muted">Tip: Specific instructions help GOLU make better decisions.</p></aside>
      <section className="help-articles">{topics.map((topic, index) => <details className="panel help-topic" key={topic.title} open={index === 0 || index === 2}><summary>{topic.title}</summary><p>{topic.body}</p></details>)}</section>
    </div>
    <section className="panel help-contact"><h2>Need more help?</h2><p className="muted">If you cannot complete a step or something is not working, contact the GOLU support team and include the page you were using and any error message shown.</p><Link href="/" className="btn">Return to your dashboard</Link></section>
    <footer className="muted" style={{padding:'40px 0 20px',fontSize:12}}>GOLU · Help Centre</footer>
  </main>;
}
