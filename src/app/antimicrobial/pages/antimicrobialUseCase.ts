// src/app/antimicrobial/pages/antimicrobialUseCase.ts
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { ANTIMICROBIALS } from "../../shared/infrastructure/router/routes";
import { UseCase } from "../../shared/model/UseCases";

interface Child {
    type: "text" | "link";
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    url?: string;
    children?: { text: string }[];
}

interface Block {
    type: string;
    children: Child[];
}

interface AntimicrobialDTO {
    id: number;
    title: string;
    description: Block[];
    locale: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

interface AntimicrobialResponse {
    data: AntimicrobialDTO[];
    meta: unknown;
}

export type AntimicrobialPageModel = {
    title: string;
    description: string;
};

export type AntimicrobialPageOperations = Record<string, never>;

export const useAntimicrobialPageComponent: UseCase<
    null,
    AntimicrobialPageModel,
    AntimicrobialPageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);
    const hardCodedTitle = t("AntimicrobialTitle") || "";
    const hardCodedDescription = t("AntimicrobialDescription") || "";

    const location = useLocation();
    const history = useHistory();

    const [title, setTitle] = useState<string>(hardCodedTitle);
    const [description, setDescription] =
        useState<string>(hardCodedDescription);

    // sync URL → i18next
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const localeParam = params.get("locale");
        if (localeParam && localeParam !== i18next.language) {
            i18next.changeLanguage(localeParam);
        }
    }, [location.search]);

    // sync i18next → URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("locale") !== i18next.language) {
            params.set("locale", i18next.language);
            history.replace({ search: params.toString() });
        }
    }, [i18next.language, location.search, history]);

    // fetch + parse with async/await (fixes promise/always-return and explicit return types)
    useEffect(() => {
        // add explicit return type here
        const fetchData = async (): Promise<void> => {
            const url = `${ANTIMICROBIALS}?locale=${i18next.language}`;

            try {
                const resp = await callApiService<AntimicrobialResponse>(url);
                const items = resp.data?.data ?? [];
                if (items.length === 0) {
                    // no data, leave hardcoded values
                    return;
                }

                const first = items[0];
                setTitle(first.title || hardCodedTitle);

                const md = first.description
                    .map((block: Block) =>
                        block.children
                            .map((child: Child) => {
                                if (child.type === "link" && child.url) {
                                    const text =
                                        child.children
                                            ?.map((c) => c.text)
                                            .join("") || "";
                                    return `[${text}](${child.url})`;
                                }

                                let txt = child.text || "";
                                if (child.code) txt = `\`${txt}\``;
                                if (child.bold) txt = `**${txt}**`;
                                if (child.italic) txt = `_${txt}_`;
                                if (child.strikethrough) txt = `~~${txt}~~`;
                                if (child.underline) txt = `<u>${txt}</u>`;
                                return txt;
                            })
                            .join("")
                    )
                    .filter((line) => line.trim().length > 0)
                    .join("\n\n");

                setDescription(md || hardCodedDescription);
            } catch (err) {
                console.error("Antimicrobial fetch error:", err);
            }
        };

        fetchData();
    }, [hardCodedTitle, hardCodedDescription, i18next.language]);

    return {
        model: { title, description },
        operations: {},
    };
};
