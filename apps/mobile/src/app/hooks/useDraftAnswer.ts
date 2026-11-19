import { useState, useCallback } from "react";
import { useFormData, FieldValue } from "../context/FormConext";

export function useDraftAnswer(key: string) {
    const { data, setField, clearField } = useFormData();
    const [draft, setDraft ] = useState<FieldValue | undefined>(data[key]);

    const commit = useCallback(() => {
        if (draft === undefined || draft === "") clearField(key);
        else setField(key, draft);
    }, [draft, key, setField, clearField ]);

    return { draft, setDraft, commit }
}