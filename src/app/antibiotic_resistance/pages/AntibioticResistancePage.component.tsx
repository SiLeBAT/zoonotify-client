import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";

const ORGANISMS = [
    "E. coli",
    "Campylobacter spp.",
    "Salmonella spp.",
    "MRSA",
    "STEC",
    "Enterococcus",
];

export function AntibioticResistancePageComponent(): JSX.Element {
    const { t } = useTranslation(["Header"]); // ← pull in your Header namespace
    const [selectedOrg, setSelectedOrg] = useState(ORGANISMS[0]);

    return (
        <>
            <style>{`
        .abx-page {
          display: flex;
          min-height: 100vh;
        }

        .abx-sidebar {
          width: 360px;
          padding: 2rem;
          background: #fff;
          box-sizing: border-box;
        }

        .abx-nav {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .abx-nav-item {
          position: relative;
          clip-path: polygon(
            0    0,
            calc(100% - 40px) 0,
            100% 50%,
            calc(100% - 40px) 100%,
            0    100%
          );
          background: #003663;
          color: #fff;
          font-size: 1.3rem;
          font-weight: bold;
          padding: 1.5rem 2rem 1.5rem 3rem;
          margin-bottom: 1.25rem;
          cursor: pointer;
        }

        .abx-active {
          background: #BFE1F2;
          color: #003663;
        }

        .abx-content {
          flex: 1;
          padding: 3rem;
          box-sizing: border-box;
        }

        .abx-breadcrumb {
          font-size: 1.75rem;
          color: #003663;
          margin-bottom: 2rem;
        }
        .abx-breadcrumb em {
          font-style: italic;
          font-weight: normal;
        }
      `}</style>

            <PageLayoutComponent>
                <div className="abx-page">
                    <aside className="abx-sidebar">
                        <ul className="abx-nav">
                            {ORGANISMS.map((org) => (
                                <li
                                    key={org}
                                    className={`abx-nav-item${
                                        org === selectedOrg ? " abx-active" : ""
                                    }`}
                                    onClick={() => setSelectedOrg(org)}
                                >
                                    {org}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <section className="abx-content">
                        <div className="abx-breadcrumb">
                            {t("AntibioticResistance")} &gt;{" "}
                            <em>{selectedOrg}</em>
                        </div>
                        {/* Here you can render your organism‐specific graphs/tables */}
                    </section>
                </div>
            </PageLayoutComponent>
        </>
    );
}
