import Link from "next/link";
import { useTranslation } from "react-i18next";
interface BreadcrumbProps {
  prev?: string;
  pageName: string;
}
const Breadcrumb = ({ pageName, prev }: BreadcrumbProps) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {t(pageName)}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              {t("dashboard")} /
            </Link>
          </li>
          {prev && (
            <li>
              <Link className="font-medium" href={`/${prev.toLowerCase()}`}>
                {t(prev)} /
              </Link>
            </li>
          )}
          <li className="font-medium text-primary">{t(pageName)}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
