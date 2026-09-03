import "../../../styles/css/base.css";
import clsx from "clsx";
import logo from "./logo.png";

export type LogoProps = {
  hasImage: boolean;
  libraryName: string;
  libraryPlace?: string;
  altText: string;
  frontpageLabel: string;
};

const Logo = ({
  hasImage,
  libraryName,
  libraryPlace,
  altText,
  frontpageLabel,
}: LogoProps) => {
  // The library name and place are both visible inside the link, so they must
  // both be part of its accessible name (WCAG 2.5.3 Label in Name).
  const logoText = libraryPlace
    ? `${libraryName} ${libraryPlace}`
    : libraryName;
  return (
    <a href="/" className="logo" aria-label={`${logoText}: ${frontpageLabel}`}>
      <figure className="logo__content">
        {hasImage && <img src={logo} alt={altText} />}
        <div
          className={clsx("logo__description", {
            "logo__description--has-image": hasImage,
          })}
        >
          <p className="logo__library-name">{libraryName}</p>
          {libraryPlace && <p>{libraryPlace}</p>}
        </div>
      </figure>
    </a>
  );
};

export default Logo;
