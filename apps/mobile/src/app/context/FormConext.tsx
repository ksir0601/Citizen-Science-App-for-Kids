import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type FieldValue = string | number | boolean;

export type FormValues = Record<string, FieldValue | undefined>;

export type FormDataContextType = {
    data: FormValues;
    setField: (key: string, value: FieldValue) => void;
    resetData: () => void;
    clearField: (key: string) => void;
};

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export function FormDataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<FormValues>({});

    const setField = useCallback((key: string, value: FieldValue) => {
        setData((prev) => ({ ...prev, [key]: value})); 
    }, []);
    
    const resetData = useCallback(() => setData({}), []);

    const clearField = useCallback((key:string) => {
        setData((prev) => {
            const {[key]: _removed, ...rest} = prev;
            return rest;
        });
    }, []);

    return (
        <FormDataContext.Provider value={{ data, setField, resetData, clearField }}>
            {children}
        </FormDataContext.Provider>
    );
}

export function useFormData() {
    const context = useContext(FormDataContext);
    if (!context) throw new Error("useFormData must be used with FormDataContextProvider");
    return context
}