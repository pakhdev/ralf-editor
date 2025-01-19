import NodeDeletionMutation from '../node-deletion.mutation.ts';
import NodeInsertionMutation from '../node-insertion.mutation.ts';

export type EditorMutation = NodeDeletionMutation | NodeInsertionMutation;