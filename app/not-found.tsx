import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container container-narrow" style={{ textAlign: "center" }}>
        <p className="eyebrow">404 · Wrong turn</p>
        <h1>This road doesn&rsquo;t go anywhere</h1>
        <p className="lead" style={{ margin: "0 auto 24px" }}>The page you&rsquo;re looking for doesn&rsquo;t exist or isn&rsquo;t available yet.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/dmv" className="btn btn-primary">Choose your state</Link>
          <Link href="/" className="btn">Go home</Link>
        </div>
      </div>
    </section>
  );
}
