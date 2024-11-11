/* * @FilePath: /ts-notebook/rollup.config.js */ 
import ts from 'rollup-plugin-typescript2' 
import nodeResolve from '@rollup/plugin-node-resolve' 
import path from 'path' 
import { fileURLToPath } from 'url' 
import terser from '@rollup/plugin-terser'; // 引入 terser 插件
import obfuscatorPlugin from 'rollup-plugin-javascript-obfuscator';
const __filename = fileURLToPath(import.meta.url) 
const __dirname = path.dirname(__filename) // 打包的配置对象 

export default { 
    input: {
        main: './src/index.ts',
        // secondary: './src/pixel.ts'
    }, 
    output: [
        { 
            dir: 'dist',
            // file: path.resolve(__dirname, 'dist/pixel.bundle.js'), // 打包的文件在当前目录下dist文件夹 
            format: 'iife', 
            sourcemap: true,
            entryFileNames: '[name].bundle.js'
        },
    ],
    plugins:[ 
        nodeResolve({ extensions: [ '.js', '.ts' ] }), 
        ts({ 
            tsconfig: path.resolve(__dirname, 'tsconfig.json') 
        }),
        // terser(), // 使用 terser 插件来压缩代码
        // new obfuscatorPlugin({
        //     rotateStringArray: true, // 旋转字符串数组
        //     stringArrayThreshold: 0.75, // 字符串数组阈值
        //     controlFlowFlattening: true, // 控制流平坦化
        //     deadCodeInjection: true // 死代码注入
        // })
    ] 
}
