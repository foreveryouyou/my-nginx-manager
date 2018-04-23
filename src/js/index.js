const {
    exec,
    execFile
} = require('child_process')
const {
    dialog
} = require('electron').remote
const fs = require('fs');
const path = require('path')

new Vue({
    el: '#vm',
    data: {
        confFile: 'conf/conf.txt', // 配置文件路径
        nginxPath: '', // nginx 文件
        nginxDir: '', // nginx 目录
        nginxFile: '', // nginx 路径
        processArr: [], // 运行中的 nginx 进程
        showLoading: false
    },
    created() {

    },
    mounted() {
        this.init();
        let vm = this;
        // todo 窗口激活时刷新，否则暂停刷新
        vm.refresh();
        setInterval(() => {
            vm.refresh();
        }, 5000);
    },
    methods: {
        init: function () {
            this.getNginxPath();
        },
        doStart() {
            if (this.processArr.length > 0) {
                alert('nginx 已经在运行或者请刷新后重试!');
                return;
            }
            let vm = this;
            if (this.nginxPath) {
                vm.showLoading = true;
                let n = 0;
                let timer = setInterval(() => {
                    n++;
                    if (vm.processArr.length > 0 || n > 15) {
                        vm.showLoading = false;
                        if (vm.processArr.length == 0) {
                            alert('启动失败,请稍后重试或检查nginx设置是否正确!');
                        }
                        clearInterval(timer);
                    }
                }, 300);
                execFile(this.nginxFile, [], {
                    cwd: this.nginxDir
                }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }
                    console.log(stdout);
                    console.log(`stderr: ${stderr}`);
                });
            } else {
                alert('请先设置nginx路径');
            }
        },
        doStop() {
            if (this.processArr.length == 0) {
                alert('没有正在运行的 nginx 进程，或者请刷新后重试!');
                return;
            }
            let vm = this;
            // execFile(this.nginxFile, ['-s','stop'], {
            //     cwd: this.nginxDir
            // }, (error, stdout, stderr) => {
            //     if (error) {
            //         console.error(`exec error: ${error}`);
            //         return;
            //     }
            //     console.log(stdout);
            //     console.log(`stderr: ${stderr}`);
            // });
            // return;
            // 'taskkill /F /IM nginx.exe > nul'
            exec(`taskkill /F /IM ${this.nginxFile} > nul`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(stdout);
                console.log(`stderr: ${stderr}`);
                vm.refresh();
            });
        },
        doRestart() {
            let vm = this;
            this.doStop();
            setTimeout(function () {
                vm.doStart();
            });
        },
        refresh() {
            let vm = this;
            exec('tasklist|findstr /i "nginx.exe"', (error, stdout, stderr) => {
                if (error) {
                    // console.error(`exec error: ${error}`);
                    vm.renderTable('');
                    return;
                }
                vm.renderTable(stdout);
                // console.log(stdout);
                // console.log(`stderr: ${stderr}`);
            });
        },
        renderTable(dataStr) {
            let data = dataStr ? dataStr.split('\n') : [];
            data = data.filter(function (item) {
                return item;
            });
            console.log(data);
            this.processArr = data;
        },
        getNginxPath() {
            let vm = this;
            fs.readFile(vm.confFile, {
                encoding: 'utf8'
            }, (err, data) => {
                if (err) throw err;
                console.log('config 中的内容：', data);
                let reg = /nginx(.)*(\.exe)/;
                if (!data) {
                    return;
                }
                if (reg.test(data)) {
                    vm.saveNginxPath(data);
                    return;
                }
                if (confirm(`配置文件中的 [${data}] 貌似不是 nginx 的可执行程序, 确定要使用它吗？`)) {
                    vm.saveNginxPath(data);
                } else {
                    // 清除错误配置
                    fs.writeFile(vm.confFile, '', 'utf8', function (err) {});
                }
            });
        },
        setNginxPath() {
            let vm = this;
            dialog.showOpenDialog({
                    title: '请选择 nginx.exe 路径：',
                    properties: ['openFile'],
                    filters: [{
                            name: '可执行文件',
                            extensions: ['exe']
                        },
                        {
                            name: '所有文件',
                            extensions: ['*']
                        }
                    ]
                },
                function (filePaths) {
                    console.log(filePaths);
                    if (filePaths && filePaths.length > 0) {
                        let tmpPath = filePaths[0],
                            reg = /nginx(.)*(\.exe)/;
                        if (reg.test(tmpPath)) {
                            vm.saveNginxPath(tmpPath, true);
                            return;
                        }
                        if (confirm(`[${tmpPath}] 貌似不是 nginx 的可执行程序, 确定要使用它吗？`)) {
                            vm.saveNginxPath(tmpPath, true);
                        }
                    }
                }
            );
        },
        saveNginxPath(pathStr, save) {
            this.nginxPath = pathStr;
            this.nginxDir = path.dirname(pathStr)
            this.nginxFile = path.basename(pathStr)
            if (save) {
                fs.writeFile(this.confFile, this.nginxPath, 'utf8', function (err) {});
            }
        }
    }
});

/*
nginx version: nginx/1.7.12
Usage: nginx [-?hvVtq] [-s signal] [-c filename] [-p prefix] [-g directives]

Options:
  -?,-h         : this help
  -v            : show version and exit
  -V            : show version and configure options then exit
  -t            : test configuration and exit
  -q            : suppress non-error messages during configuration testing
  -s signal     : send signal to a master process: stop, quit, reopen, reload
  -p prefix     : set prefix path (default: NONE)
  -c filename   : set configuration file (default: conf/nginx.conf)
  -g directives : set global directives out of configuration file
*/