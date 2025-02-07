import { ShortcutOptions } from '../interfaces/shortcut-options.interface.ts';

export function parseShortcutCombination(combination: string): ShortcutOptions {
    const parts = combination.split('+');
    const options: ShortcutOptions = { key: '' };

    parts.forEach(part => {
        const normalizedPart = part.toLowerCase();
        switch (normalizedPart) {
            case 'ctrl':
                options.ctrlKey = true;
                break;
            case 'alt':
                options.altKey = true;
                break;
            case 'shift':
                options.shiftKey = true;
                break;
            default:
                options.key = part;
        }
    });

    return options;
}
