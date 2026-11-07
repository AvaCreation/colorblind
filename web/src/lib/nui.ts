export const inGame = 'invokeNative' in window;

export function post(name: string, data: object = {}) {
    if (!inGame) return;

    fetch(`https://${(window as any).GetParentResourceName()}/${name}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
