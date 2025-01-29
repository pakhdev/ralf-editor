import NodeDeletionMutation from '../node-deletion.mutation.ts';
import NodeInsertionMutation from '../node-insertion.mutation.ts';
import TextDeletionMutation from '../text-deletion.mutation.ts';
import TextInsertionMutation from '../text-insertion.mutation.ts';
import TextSplittingMutation from '../text-splitting.mutation.ts';
import TextMergingMutation from '../text-merging.mutation.ts';

export type EditorMutation =
    NodeDeletionMutation
    | NodeInsertionMutation
    | TextDeletionMutation
    | TextInsertionMutation
    | TextSplittingMutation
    | TextMergingMutation;