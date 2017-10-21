var isDevBuild = process.argv.indexOf('--env.prod') < 0;
var path = require('path');
var webpack = require('webpack');

var bundleOutputDir = './wwwroot/dist';

var babelSettings = {
	plugins: [
		'transform-class-properties',
		'transform-object-rest-spread',
		'transform-runtime'
	]
};

module.exports = {
	devtool: isDevBuild ? 'source-map' : null,
	entry: {
		'pacman': './src/main.ts',
	},
	resolve: {
		extensions: ['.js', '.ts'],
		modules: [ 'node_modules' ]
	},
	output: {
		path: path.join(__dirname, bundleOutputDir),
		filename: '[name].js',
		publicPath: '/dist/'
	},
	module: {
		loaders: [
			{ test: /\.js$/, loaders: ['babel-loader?' + JSON.stringify(babelSettings)], exclude: /node_modules[\\/]/ },
			{ test: /\.ts$/, include: /scripts/, loader: 'babel-loader' },
			{ test: /\.ts$/, loader: 'ts-loader', query: { silent: true } },
		]
	},
	plugins: [/* Default, all builds plugins */]
		.concat(isDevBuild ? [ /* Plugins that apply in development builds only */] : [
			// Plugins that apply in production builds only
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.optimize.DedupePlugin(),
			new webpack.optimize.AggressiveMergingPlugin(),
			new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
			new webpack.optimize.UglifyJsPlugin({ compress: { screw_ie8: true, warnings: false } }),
		]),
	stats: {
		children: false
	}
};
