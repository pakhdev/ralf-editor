type Constructor<T = any> = new (...args: any[]) => T;

export interface InjectOptions {
    forRoot?: boolean;
    actions?: Constructor[];
}
