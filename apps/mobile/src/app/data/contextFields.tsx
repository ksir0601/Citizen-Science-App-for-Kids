export type ReviewFields = {
    // add userId and user nickname
    userId: string;
    nickname: string | null;
    key: string;
    label: string;
    type: string;
};

export const fields: ReviewFields[] = [/*...*/];