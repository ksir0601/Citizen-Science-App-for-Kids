import CheckBox from "./checkBox"
import DropDown from "./dropdown";
import Number_entry from "./number_entry";
import { questions } from "@/mock/mockData";
import Text_entry from "./textBox";
import { FieldValue } from "@/app/context/FormConext";

export type Question = (typeof questions)[number];

type Props = {
  question: Question;
  draft: FieldValue | undefined;
  setDraft: (v: FieldValue | undefined) => void;
};

export default function QuestionInput({ question, draft, setDraft }: Props) { 
  
  switch (question.type) {
    case "dropdown":
      return (
        <DropDown
          options={question.options ?? []}
          value={typeof draft === "string" ? draft : null}
          onChange={setDraft}
        />
      );
case "checkbox":
  return (
    <CheckBox
      question={question.label}
      value={draft === true ? "Yes" : draft === false ? "No" : ""}
      onChange={(v) => setDraft(v === "" ? undefined : v === "Yes")}
    />
  );

    case "number":
      return (
        <Number_entry
        value={typeof draft === "number" ? draft : ""}
        onChange={setDraft}
        />
      );

    case "text":
      return (
        <Text_entry
          value={typeof draft === "string" ? draft : ""}
          onChange={setDraft}
        />
      );

    default:
      return null;
  }
}