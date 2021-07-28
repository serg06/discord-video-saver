import 'lodash.product';
import {lookpath} from 'lookpath';

let pythonPath;

export async function initPythonPath() {
    const paths = (await Promise.all(['python', 'python3'].map(cmd => lookpath(cmd)))).filter(Boolean);

    if (paths.length === 0) {
        throw Error('Cannot find suitable python executable!');
    }

    pythonPath = paths[0];
}

export function getPythonPath() {
    if (!pythonPath) {
        throw Error('Python path was never inited!');
    }
    return pythonPath;
}
