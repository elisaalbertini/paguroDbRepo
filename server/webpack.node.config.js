module.exports = [
    {
        name: 'server',
        entry: './src/server.ts',
        target: 'node',
        module: {
            rules: [
              {
                use: 'ts-loader',
                exclude: /node_modules/,
              },
            ],
          },
        resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: __dirname + '/dist/server',
            filename: 'bundle.js',
        },
    }
];