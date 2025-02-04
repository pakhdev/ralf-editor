import { MutationType } from '../../mutations/enums/mutation-type.enum.ts';

export interface FindMutationOptions {
    type?: MutationType | MutationType[];
    direction?: 'first' | 'last';
}
