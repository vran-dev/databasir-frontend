const port = process.env.port || 3000
module.exports = {
    devServer: {
        port: port
    },
    outputDir: '../api/src/main/resources/static'
};