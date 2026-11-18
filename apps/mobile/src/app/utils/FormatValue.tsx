import { FieldValue } from "../context/FormConext";

export const formatValue = (value: FieldValue | undefined): string => {
    if (value === undefined || value === null || value === "") return "Not answered";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}