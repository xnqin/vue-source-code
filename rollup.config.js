import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
export default {
    input: './src/index',//已哪个文件得入口
    output: {
        file: 'dist/umd/vue.js',//出口文件
        name: 'Vue',// 指定打包后全局名称
        format: 'umd',// 统一模块规范
        sourcemap: true, //源码调试 es6-》es5       
    },
    plugin: [
        babel({
            exclude: 'node_modules/**'
        }),
        process.env.ENV === 'development' ? serve({
            open: true,
            openPage: '/public/index.html',//默认打开html路径
            port: 3000,
            contentBase: ''
        }) : null
    ]


}