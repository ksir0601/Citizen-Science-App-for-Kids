// =====================================================================================
// Citation: This code was generated witht the help of Claude. 
// The GenAi interaction lead to the solution regarding temporarily saving data from each page
// and helped in the question of displaying the users answers before submitting the data to 
// our database.
// The interaction was generally positive and overall helpful It certainly saved time
// File Owner: Thomas
//=======================================================================================


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