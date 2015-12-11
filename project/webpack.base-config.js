var path = require("path"),
    webpack = require('webpack'),
    BundleTracker = require('webpack-bundle-tracker'),
    devFlagPlugin = new webpack.DefinePlugin({__DEBUG__: false});


module.exports = {

    __devFlagPlugin: devFlagPlugin,

    context: __dirname,

    entry: [
        './assets/js/index',
    ],

    output: {
        path: path.resolve('./static/bundles/'),
        filename: '[name]-[hash].js',
    },

    externals: {},

    plugins: [
        new webpack.NoErrorsPlugin(),
        new BundleTracker({filename: './webpack-stats.json'}),
        devFlagPlugin,
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
        }),
    ],

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {stage: 0},
            },
        ],
    },

    resolve: {
        modulesDirectories: [
            'node_modules',
            'bower_components',
        ],
        extensions: [
            '',
            '.js',
            '.jsx',
        ],
    },
};
