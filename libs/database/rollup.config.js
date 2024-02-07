import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: './dist/index.cjs.js',
        format: 'cjs',
      },
      {
        file: './dist/index.esm.js',
        format: 'esm',
      },
    ],
    plugins: [typescript()],
  },
  {
    input: 'src/migrate-data.ts',
    output: [
      {
        file: './dist/migrate-data.cjs.js',
        format: 'cjs',
      },
      {
        file: './dist/migrate-data.esm.js',
        format: 'esm',
      },
    ],
    plugins: [typescript()],
  },
];
