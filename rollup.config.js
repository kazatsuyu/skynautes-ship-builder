import buble from 'rollup-plugin-buble';

export default {
    entry: 'script/skynautes-ship-builder.js',
    dest: 'script/skynautes-ship-builder.rollup.js',
    format: 'iife',
    plugins: [
        buble({
            target: {
                chrome: 50,
            }
        })
    ]
}
