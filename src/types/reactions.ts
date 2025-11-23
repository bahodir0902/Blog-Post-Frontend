export type ReactionType = {
    id: number;
    name: string;
    emoji: string;
};

export type PostReaction = {
    id: number; // Now required
    name: string;
    emoji: string;
    count: number;
    my_reaction: boolean;
};

export type PutReactionPayload = {
    type: number; // ReactionType ID
};