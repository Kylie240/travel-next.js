export type Feedback = {
    id: string;
    user_id: string;
    editing: boolean;
    saving: boolean;
    navigation: boolean;
    performance: boolean;
    interface: boolean;
    functionality: boolean;
    feature: boolean;
    account: boolean;
    sharing: boolean;
    responsiveness: boolean;
    comment: string;
    other: boolean;
    rating: number;
}