import NodeDeletionMutation from '../node-deletion.mutation.ts';
import NodeInsertionMutation from '../node-insertion.mutation.ts';
import TextDeletionMutation from '../text-deletion.mutation.ts';
import TextInsertionMutation from '../text-insertion.mutation.ts';

export type EditorMutation =
    NodeDeletionMutation
    | NodeInsertionMutation
    | TextDeletionMutation
    | TextInsertionMutation;