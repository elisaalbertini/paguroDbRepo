module.exports = [
    {
        name: 'orders-service',
        entry: './src/app.ts',
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
            path: __dirname + '/dist/orders-service',
            filename: 'bundle.js',
        },
    }
];