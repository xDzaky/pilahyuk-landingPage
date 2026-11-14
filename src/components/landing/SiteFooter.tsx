import { Instagram, Mail } from "lucide-react";
import { footer, site } from "@/content/id";
import { CirclesPattern, Logo } from "./ui";

export function SiteFooter() {
  return (
    <footer className="footer" aria-label={`${site.name} — tautan kaki`}>
      <CirclesPattern className="footer__pattern" />

      <div className="lp-container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="footer__logo" href="#top">
              <Logo tone="light" />
              <span>{site.name}</span>
            </a>
            <p className="footer__blurb">{footer.blurb}</p>

            <div className="footer__social">
              <span role="img" aria-label="Instagram belum diatur" title="Instagram — belum diatur">
                <Instagram size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span role="img" aria-label="Email belum diatur" title="Email — belum diatur">
                <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <h2 className="footer__title">{column.title}</h2>
              <nav className="footer__links" aria-label={column.title}>
                {column.links.map((link) => (
                  <a key={`${column.title}-${link.label}`} className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}

          <div>
            <h2 className="footer__title">{footer.contact.title}</h2>
            <div className="footer__links">
              <span className="footer__link">{footer.contact.email}</span>
              <span className="footer__link">{footer.contact.city}</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{footer.copyright}</span>
          <div className="footer__legal">
            {footer.legal.map((link) => (
              <span key={link.label} className="footer__link" title="Tautan belum diatur">
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
