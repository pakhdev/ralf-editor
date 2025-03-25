export interface TextMutationRecord extends MutationRecord {
    type: 'characterData';
    target: CharacterData;
    oldValue: string | null;
}
